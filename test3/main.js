'use strict';
const now = new Date()
let activeNav = 0, navItems = [], sunset

function reload() {
  history.scrollRestoration = 'manual'
  location.reload()
};

function toggleWindChart(div) {
  const element = document.getElementById(div)
  if (element.style.display==='' || element.style.display==='none') {
    element.style.display = 'block'
    document.getElementById(`${div}-toggle`).innerHTML = '&#8722;'
  }
  else {
    element.style.display = 'none'
    document.getElementById(`${div}-toggle`).innerHTML = '&#43;'
  }
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
    window.scrollTo(0,0)
  }
});

function navOrder(sunsetFormatted, tomorrow = new Date()) {
  sunsetFormatted = new Date(sunset).toLocaleTimeString('en-us', {hour: 'numeric', minute: '2-digit'}).slice(0,-3)
  document.getElementById('sunset').innerHTML = sunsetFormatted
  tomorrow = `${new Date(tomorrow.setDate(tomorrow.getDate()+1)).toLocaleString('en-us',{weekday:'short'})}+`
  navItems = ['Today', tomorrow, 'Settings', 'GPS', 'Cams', 'Now']
  if (now.getHours() >= 14 && now.getHours() <= sunset.slice(11,13)) {
    slider.moveToIdx(5, true, { duration: 0 })
  }
  else if (now.getHours() > sunset.slice(11,13)) {
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

function navSet() {
  navOrder()
  navUpdate(activeNav)
};

function windAloft(openmeteoData, gcpWindAloftData) {
  openmeteoWindAloft(openmeteoData)
  gcpWindAloft(gcpWindAloftData)
  document.getElementById('wind-aloft-div').style.display = 'block'
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
  const gridEndTime = now.getHours() + 6
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

function windMap(data) {
  const timestamp = new Date(data.timeCreated).toLocaleString('en-US', {hour: 'numeric', minute: '2-digit'}).toLowerCase();
  document.getElementById('wind-map-timestamp').innerHTML = `Wind Map @ ${timestamp}`
};

function nwsForecast(data, position) {
  position = data.properties.periods[0].isDaytime ? 0 : 1
  for (let i=0; i<5; i++) {
    document.getElementById(`forecast-day${i}-day`).innerHTML = data.properties.periods[position].name
    document.getElementById(`forecast-day${i}-txt`).innerHTML = data.properties.periods[position].detailedForecast
    document.getElementById(`forecast-day${i}-img`).src = data.properties.periods[position].icon
    position += 2
  }
  if (now.getHours() >= 7 && now.getHours() < 20) {
    document.getElementById('nws-today-div').style.display = 'block'
  }
  document.getElementById('nws-multiday-div').style.display = 'block'
};

function displayImages() {
  if (now.getHours() >= 7 && now.getHours() < 18) {
    const windImageURL = 'https://graphical.weather.gov/images/SLC/WindSpd4_utah.png'
    const gustImageURL = 'https://graphical.weather.gov/images/SLC/WindGust4_utah.png'
    document.getElementById('surface-wind-img').src = windImageURL
    document.getElementById('surface-gust-img').src = gustImageURL
    document.getElementById('surface-wind-div').style.display = 'block'
  }
  if (now.getHours() >= 7 && now.getHours() < 21) {
    document.getElementById('wind-map').src = 'https://storage.googleapis.com/wasatch-wind-static/wind-map-save.png'
    document.getElementById('wind-map-div').style.display = 'block'
  }
  if (now.getHours() >= sunset.slice(11,13) && now.getHours() <24) {
    document.getElementById('hourly-chart-tomorrow').src = 'https://forecast.weather.gov/meteograms/Plotter.php?lat=40.7603&lon=-111.8882&wfo=SLC&zcode=UTZ105&gset=30&gdiff=10&unit=0&tinfo=MY7&ahour=0&pcmd=10001110100000000000000000000000000000000000000000000000000&lg=en&indu=1!1!1!&dd=&bw=&hrspan=48&pqpfhr=6&psnwhr=6'
    document.getElementById('hourly-chart-tomorrow-div').style.display = 'block'
  }
  else {
    document.getElementById('hourly-chart-today').src = 'https://forecast.weather.gov/meteograms/Plotter.php?lat=40.7603&lon=-111.8882&wfo=SLC&zcode=UTZ105&gset=30&gdiff=10&unit=0&tinfo=MY7&ahour=0&pcmd=10001110100000000000000000000000000000000000000000000000000&lg=en&indu=1!1!1!&dd=&bw=&hrspan=48&pqpfhr=6&psnwhr=6'
    document.getElementById('hourly-chart-today-div').style.display = 'block'
  }
  document.getElementById('satellite-gif').src = 'https://cdn.star.nesdis.noaa.gov/GOES18/ABI/SECTOR/psw/13/GOES18-PSW-13-600x600.gif'
  document.getElementById('cam-south').src = 'https://horel.chpc.utah.edu/data/station_cameras/wbbs_cam/wbbs_cam_current.jpg'
  document.getElementById('cam-west').src = 'https://www.wrh.noaa.gov/images/slc/camera/latest/Draper.latest.jpg'
  document.getElementById('cam-east').src = 'https://www.wrh.noaa.gov/images/slc/camera/latest/darren2.latest.jpg'
};

// LOCAL ONLY!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!
function displayImagesLocal() {
  if (now.getHours() >= 7 && now.getHours() < 18) {
    const windImageURL = 'images/wind-graphic.png'
    const gustImageURL = 'images/gust-graphic.png'
    document.getElementById('surface-wind-img').src = windImageURL
    document.getElementById('surface-gust-img').src = gustImageURL
    document.getElementById('surface-wind-div').style.display = 'block'
  }
  if (now.getHours() >= 7 && now.getHours() < 21) {
    document.getElementById('wind-map').src = 'images/wind-map-save.png'
    document.getElementById('wind-map-div').style.display = 'block'
  }
  if (now.getHours() >= sunset.slice(11,13) && now.getHours() <24) {
    document.getElementById('hourly-chart-tomorrow').src = 'images/Plotter.png'
    document.getElementById('hourly-chart-tomorrow-div').style.display = 'block'
  }
  else {
    document.getElementById('hourly-chart-today').src = 'images/Plotter.png'
    document.getElementById('hourly-chart-today-div').style.display = 'block'
  }
  document.getElementById('satellite-gif').src = 'images/sat.gif'
  document.getElementById('cam-south').src = 'images/cam.png'
  document.getElementById('cam-west').src = 'images/cam.png'
  document.getElementById('cam-east').src = 'images/cam.png'
};