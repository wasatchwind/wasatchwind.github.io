'use strict';
const now = new Date()
// const now = new Date('Mon Mar 18 2024 13:47:21 GMT-0600 (Mountain Standard Time')
const nextDay = new Date(new Date().setDate(new Date().getDate() + 1)).toLocaleString('en-us', {weekday: 'long'})

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

// Reveal & collapse toggle for wind charts
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

function openWeather(data, sunset, tomorrow = new Date(), navItems = []) {
  tomorrow = `${new Date(tomorrow.setDate(tomorrow.getDate() + 1)).toLocaleString('en-us', {weekday: 'short'})}+`
  if (!data) navItems = ['Now', 'Today', tomorrow, 'Cams', 'GPS', 'Settings']
  else {
    sunset = new Date(data.sys.sunset*1000)
    document.getElementById('sunset').innerHTML = sunset.toLocaleTimeString('en-us', {hour: 'numeric', minute: '2-digit'}).slice(0,-3)
    if (now.getHours() < 15) {
      navItems = ['Today', tomorrow, 'Cams', 'GPS', 'Settings', 'Now']
      document.getElementById('surface-wind-div').style.display = 'block'
      document.getElementById('wind-aloft-div').style.display = 'block'
      document.getElementById('hourly-chart-div').style.display = 'block'
      document.getElementById('Today').style.display = 'block'
      document.getElementById('sky-cover-div').style.display = 'block'
      document.getElementById('nws-today-div').style.display = 'block'
    }
    else if (now > sunset) navItems = [tomorrow, 'Cams', 'GPS', 'Settings', 'Now', 'Today']
    else navItems = ['Now', 'Today', tomorrow, 'Cams', 'GPS', 'Settings']
  }

  // Set nav item labels & active label
  let activeNav = 0
  let element = navItems[activeNav] === tomorrow ? 'Tomorrow' : navItems[activeNav]
  document.getElementById(`nav-${activeNav}`).style.color = 'white'
  // document.getElementById(`${element}`).style.display = 'block'
  for (let i=0; i<navItems.length; i++) document.getElementById(`nav-${i}`).innerHTML = navItems[i]

  // Update nav colors and visible page
  function navUpdate (navElement, color, pageId, status) {
    if (pageId === tomorrow) pageId = 'Tomorrow'
    document.getElementById(pageId).style.display = status
    document.getElementById(navElement).style.color = color
  };

  // Menu navigation carousel/slider (https://keen-slider.io/docs)
  const slider = new KeenSlider('#slider', {
    loop: true,
    slides: { perView: 3 },
    animationEnded: () => {
      navUpdate(`nav-${activeNav}`, 'var(--bs-secondary)', navItems[activeNav], 'none')
      activeNav = slider.track.details.rel
      navUpdate(`nav-${activeNav}`, 'white', navItems[activeNav], 'block')
    }
  });
};

function windMap(data) {
  const timestamp = new Date(data.timeCreated).toLocaleString('en-US', {hour: 'numeric', minute: '2-digit'}).toLowerCase();
  document.getElementById('wind-map-timestamp').innerHTML = `Wind Map @ ${timestamp}`
};

(function surfaceWind() {
  const forecastTime = now.getTimezoneOffset() / 60 === 6 ? 5 : 4
  if (now.getHours() > 5 && now.getHours()-12 < forecastTime) {
    const windImageURL = 'https://graphical.weather.gov/images/utah/WindSpd4_utah.png'
    const gustImageURL = 'https://graphical.weather.gov/images/utah/WindGust4_utah.png'
    document.getElementById('surface-wind-time').innerHTML = `Surface Wind @ ${forecastTime} pm`
    document.getElementById('surface-wind-img').src = windImageURL
    document.getElementById('surface-gust-img').src = gustImageURL
  }
})();

(function getGraphicalForecastImages() {
  // const nextDay = now.getHours() > 18 ? `&nbsp;&nbsp;(${new Date(now.setHours(now.getHours() + 24)).toLocaleString('en-us', {weekday: 'long'})})&nbsp;&nbsp;` : ''
  const url = 'https://graphical.weather.gov/images/slc/'
  const timeStr = (now.getHours() > 18 || now.getHours() < 7) ? 5 : 1
  document.getElementById('sky-next-day').innerHTML = `(${nextDay})`
  for (let i=0; i<4; i++) {
      document.getElementById(`graphical-sky-${i}`).src = `${url}Sky${timeStr+i}_slc.png`
      document.getElementById(`graphical-wx-${i}`).src = `${url}Wx${timeStr+i}_slc.png`
  }
})();

function windAloft(data) {
  windAloftDir(data.Dirs)
  windAloftSpeed(data.Spds)
  windAloftTime(data["Start time"], data["End time"])
};

function windAloftTime(start, end) {
  const forecastRange = (now.getHours() > 3 && now.getHours() < 13) ? '12' : (now.getHours() > 18 || now.getHours() < 4) ? '24' : '06'
  const link = `https://www.aviationweather.gov/data/windtemp/?region=slc&fcst=${forecastRange}`
  document.getElementById('wind-aloft-link').setAttribute('href', link)
  document.getElementById('wind-aloft-time').innerHTML = `Wind Aloft @ ${start}-${end}`
};

function windAloftDir(dirs) {
  for (const key in dirs) {
      const element = document.getElementById(`dir-${key}`)
      if (dirs[key] === 'calm') element.className = 'align-self-center display-5'
      element.innerHTML = dirs[key] === 'calm' ? 'Calm' : '&#10148;'
      element.style.transform = `rotate(${dirs[key] + 90}deg)`
  }
};

function windAloftSpeed(spds, colors = {}) {
  colors.ylw = {'6k':9, '9k':12, '12k':15, '18k':21}
  colors.red = {'6k':14, '9k':18, '12k':24, '18k':30}
  const max = Math.max(...Object.values(spds))
  const mulitplier = max > 99 ? 1.2 : max > 55 ? 1.5 : 3
  for (const key in spds) {
      const elementSpd = document.getElementById(`spd-${key}`)
      const elementBar = document.getElementById(`aloft-${key}`)
      if (spds[key] === 0) {
          document.getElementById(`mph-${key}`).style.display = 'none'
          elementSpd.style.display = 'none'
          elementBar.style.display = 'none'
      }
      elementSpd.innerHTML = spds[key]
      elementBar.style.width = `${spds[key] * mulitplier}%`
      if (spds[key] > colors.ylw[key] && spds[key] < colors.red[key]) elementBar.style.backgroundColor =  'var(--bs-yellow)'
      else elementBar.style.backgroundColor = spds[key] >= colors.red[key] ? 'var(--bs-red)' : 'var(--bs-teal)'
  }
};

function nwsForecast(data, position) {
  position = data.properties.periods[0].isDaytime ? 0 : 1
  for (let i=0; i<3; i++) {
    document.getElementById(`forecast-day${i}-day`).innerHTML = data.properties.periods[position].name
    document.getElementById(`forecast-day${i}-txt`).innerHTML = data.properties.periods[position].detailedForecast
    document.getElementById(`forecast-day${i}-img`).src = data.properties.periods[position].icon
    position += 2
  }
};

function openMeteo(data) {
  const timeMod = now.getHours() + 1
  for (let i=0; i<6; i++) {
      document.getElementById(`wspd-19k-${i}`).innerHTML = Math.round(data.hourly.windspeed_500hPa[i + timeMod])
      document.getElementById(`wdir-19k-${i}`).style.transform = `rotate(${data.hourly.winddirection_500hPa[i + timeMod]}deg)`
      document.getElementById(`wspd-16k-${i}`).innerHTML = Math.round(data.hourly.windspeed_550hPa[i + timeMod])
      document.getElementById(`wdir-16k-${i}`).style.transform = `rotate(${data.hourly.winddirection_550hPa[i + timeMod]}deg)`
      document.getElementById(`wspd-14k-${i}`).innerHTML = Math.round(data.hourly.windspeed_600hPa[i + timeMod])
      document.getElementById(`wdir-14k-${i}`).style.transform = `rotate(${data.hourly.winddirection_600hPa[i + timeMod]}deg)`
      document.getElementById(`wspd-12k-${i}`).innerHTML = Math.round(data.hourly.windspeed_650hPa[i + timeMod])
      document.getElementById(`wdir-12k-${i}`).style.transform = `rotate(${data.hourly.winddirection_650hPa[i + timeMod]}deg)`
      document.getElementById(`wspd-10k-${i}`).innerHTML = Math.round(data.hourly.windspeed_700hPa[i + timeMod])
      document.getElementById(`wdir-10k-${i}`).style.transform = `rotate(${data.hourly.winddirection_700hPa[i + timeMod]}deg)`
      document.getElementById(`wspd-8k-${i}`).innerHTML = Math.round(data.hourly.windspeed_750hPa[i + timeMod])
      document.getElementById(`wdir-8k-${i}`).style.transform = `rotate(${data.hourly.winddirection_750hPa[i + timeMod]}deg)`
      document.getElementById(`wspd-6k-${i}`).innerHTML = Math.round(data.hourly.windspeed_800hPa[i + timeMod])
      document.getElementById(`wdir-6k-${i}`).style.transform = `rotate(${data.hourly.winddirection_800hPa[i + timeMod]}deg)`
      document.getElementById(`wspd-5k-${i}`).innerHTML = Math.round(data.hourly.windspeed_850hPa[i + timeMod])
      document.getElementById(`wdir-5k-${i}`).style.transform = `rotate(${data.hourly.winddirection_850hPa[i + timeMod]}deg)`
      let test = new Date(data.hourly.time[i + timeMod]).toLocaleTimeString('en-us', {hour: 'numeric'}).toLowerCase()
      document.getElementById(`wlft-time-${i}`).innerHTML = test
  }
}

// function hourlyForecast(data, object = {}) {
//   object.icon = [], object.temp = [], object.time = [], object.wdir = [], object.wspd =[]
//   for (let i=1; i<4; i++) {
//       object.icon.push(data.properties.periods[i].icon)
//       object.temp.push(`${data.properties.periods[i].temperature}&deg;`)
//       object.time.push(new Date(data.properties.periods[i].startTime).toLocaleString('en-us', {timeStyle: 'short'}).replace(':00','').toLowerCase())
//       object.wdir.push(cardinalToDeg(data.properties.periods[i].windDirection))
//       object.wspd.push(parseInt(data.properties.periods[i].windSpeed))
//   }
//   return object
// };

// function cardinalToDeg(data) {
//   const cardDegs = ["N", "NNE", "NE", "ENE", "E", "ESE", "SE", "SSE", "S", "SSW", "SW", "WSW", "W", "WNW", "NW", "NNW"]
//   const index = cardDegs.findIndex(d => d === data)
//   return index * 22.5
// };