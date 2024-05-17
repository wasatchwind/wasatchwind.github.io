'use strict';
const now = new Date()
let activeNav = 0, navItems = []

function reload() {
  history.scrollRestoration = 'manual'
  location.reload()
};

// Marquee slider (https://keen-slider.io/docs)
const animation = { duration: 800, easing: (t) => t }
const marquee = new KeenSlider("#marquee", {
  loop: true,
  slides: { perView: 4 },
  created(m) { m.moveToIdx(1, true, animation) },
  updated(m) { m.moveToIdx(m.track.details.abs + 1, true, animation) },
  animationEnded(m) { m.moveToIdx(m.track.details.abs + 1, true, animation) }
});

// Menu navigation carousel/slider (https://keen-slider.io/docs)
const slider = new KeenSlider('#slider', {
  loop: true,
  slides: { perView: 1 },
  slideChanged: () => {
    activeNav = slider.track.details.rel
    navUpdate()
  }
});

function navOrder(sunsetRaw, sunsetFormatted, tomorrow = new Date()) {
  sunsetFormatted = new Date(sunsetRaw).toLocaleTimeString('en-us', {hour: 'numeric', minute: '2-digit'}).slice(0,-3)
  document.getElementById('sunset').innerHTML = sunsetFormatted
  tomorrow = `${new Date(tomorrow.setDate(tomorrow.getDate()+1)).toLocaleString('en-us',{weekday:'short'})}+`
  navItems = ['Today', tomorrow, 'Settings', 'GPS', 'Cams', 'Now']
  if (now.getHours() >= 14 && now.getHours() <= sunsetRaw.slice(11,13)) {
    slider.moveToIdx(5, true, { duration: 0 })
  }
  else if (now.getHours() > sunsetRaw.slice(11,13)) {
    slider.moveToIdx(1, true, { duration: 0 })
  }
};

function navUpdate (left, right) {
  left = activeNav === 0 ? 5 : activeNav - 1
  right = activeNav === 5 ? 0 : activeNav + 1
  document.getElementById('topnav-left').innerHTML = navItems[left]
  document.getElementById('topnav-active').innerHTML = navItems[activeNav]
  document.getElementById('topnav-right').innerHTML = navItems[right]
};

function navSet(data) {
  navOrder(data)
  navUpdate(activeNav)
};

(function surfaceWind() {
  if (now.getHours() > 7 && now.getHours() < 18) {
    const windImageURL = 'https://graphical.weather.gov/images/SLC/WindSpd4_utah.png'
    const gustImageURL = 'https://graphical.weather.gov/images/SLC/WindGust4_utah.png'
    document.getElementById('surface-wind-img').src = windImageURL
    document.getElementById('surface-gust-img').src = gustImageURL
  }
})();

function windAloft(openmeteoData, gcpWindAloftData) {
  openmeteoWindAloft(openmeteoData)
  gcpWindAloft(gcpWindAloftData)
};

function openmeteoWindAloft(data, redlimit = 22) {
  delete (data['windspeed_surfac'] = data['wind_speed_10m'], data)['wind_speed_10m']
  delete (data['winddirection_surfac'] = data['wind_direction_10m'], data)['wind_direction_10m']
  for (const [key, value] of Object.entries(data)) {
    if (key.slice(0,12) === 'geopotential') {
      document.getElementById(key).innerHTML = Math.round(value[0]*3.28084).toLocaleString()
    }
    if (key.slice(0,13) === 'winddirection') {
      for (let i=0; i<6; i++) {
        document.getElementById(`${key}-${i}`).style.transform = `rotate(${value[i]}deg)`
      }
    }
    if (key.slice(0,4) === 'time') {
      for (let i=0; i<6; i++) {
        const time = new Date(value[i]).toLocaleTimeString('en-us', {hour: 'numeric'}).toLowerCase()
        document.getElementById(`windaloft-time-${i}`).innerHTML = time
      }
    }
    if (key.slice(0,9) === 'windspeed') {
      for (let i=0; i<6; i++) {
        const windspeed = Math.round(value[i])
        const barb = windspeed > 40 ? 45 : Math.ceil(windspeed / 5) * 5
        redlimit = key.slice(10,16) === 'surfac' ? 22 : redlimit
        document.getElementById(`${key.slice(10,16)}-${i}`).style.backgroundColor = windAloftColor(windspeed, redlimit)
        document.getElementById(`${key}-${i}`).innerHTML = windspeed
        document.getElementById(`winddirection_${key.slice(10,16)}-${i}`).src = `images/barbs/barb${barb}.png`
        if (key.slice(10,12) <= 70 && i === 5) redlimit += 2.5
      }
    }
  }
};

function gcpWindAloft(data) {
  const forecastEndRaw = data.forecast_06h.end_time < data.forecast_06h.start_time ? data.forecast_06h.end_time + 24 : data.forecast_06h.end_time
  const gridEndTime = 18//now.getHours() + 6 //LOCAL TESTING
  const timezoneOffset = now.getTimezoneOffset() / 60
  const forecastEndTime = forecastEndRaw < 6 ? forecastEndRaw + timezoneOffset + 12 : forecastEndRaw - timezoneOffset
  const breakpoint = 6 - (gridEndTime - forecastEndTime)
  for (let i=0; i<6; i++) {
    if (i < breakpoint || breakpoint < 0) {
      gcpWindAloftRows(i, data.forecast_06h.wind_speed, data.forecast_06h.wind_direction)
    }
    else gcpWindAloftRows(i, data.forecast_12h.wind_speed, data.forecast_12h.wind_direction)
  }
};

function gcpWindAloftRows (i, windspeed, winddirection, redlimit = 22, accelerator = 0) {
  for (const [key, value] of Object.entries(windspeed)) {
    const barb = value > 40 ? 45 : Math.ceil(value / 5) * 5
    document.getElementById(`${key.slice(-3)}-${i}`).style.backgroundColor = windAloftColor(value, redlimit)
    document.getElementById(`windspeed_${key}-${i}`).innerHTML = value
    document.getElementById(`winddirection_${key}-${i}`).src = `images/barbs/barb${barb}.png`
    accelerator += 3
    redlimit += accelerator
  }
  for (const [key, value] of Object.entries(winddirection)) {
    document.getElementById(`winddirection_${key}-${i}`).style.transform = `rotate(${value}deg)`
  }
};

function windAloftColor(windspeed, maxspeed) {
  const green = '#10654c', yellow = '#806104', orange = '#7f3f0a', red = '#6e1b23'
  if (windspeed < maxspeed - 12) return green
  else if (windspeed < maxspeed - 6) return yellow
  else if (windspeed < maxspeed) return orange
  else return red
};