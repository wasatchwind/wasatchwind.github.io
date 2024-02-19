'use strict';
const now = new Date(), duration = 800

function reload() {
  history.scrollRestoration = 'manual'
  location.reload()
};

// Marquee slider (https://keen-slider.io/docs)
const animation = { duration: duration, easing: (t) => t }
const marquee = new KeenSlider("#marquee", {
  loop: true,
  slides: { perView: 4 },
  created(m) { m.moveToIdx(1, true, animation) },
  updated(m) { m.moveToIdx(m.track.details.abs + 1, true, animation) },
  animationEnded(m) { m.moveToIdx(m.track.details.abs + 1, true, animation) }
});

// Reveal/collapse toggle for wind charts
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

function openWeather(data, tomorrow = new Date(), sunset, navItems = []) {
  tomorrow = `${new Date(tomorrow.setDate(tomorrow.getDate() + 1)).toLocaleString('en-us', {weekday: 'long'})}+`
  if (!data) navItems = ['Now', 'Today', tomorrow, 'Cams', 'GPS', 'About', 'Settings']
  else {
    sunset = new Date(data.sys.sunset*1000)
    document.getElementById('sunset').innerHTML = sunset.toLocaleTimeString('en-us', {hour: 'numeric', minute: '2-digit'}).slice(0,-3)
    if (now.getHours() < 15) navItems = ['Today', tomorrow, 'Cams', 'GPS', 'About', 'Settings', 'Now']
    else if (now > sunset) navItems = [tomorrow, 'Cams', 'GPS', 'About', 'Settings', 'Now', 'Today']
    else navItems = ['Now', 'Today', tomorrow, 'Cams', 'GPS', 'About', 'Settings']
  }

  // Set nav item labels & active label
  let activeNav = 0
  let element = navItems[activeNav] === tomorrow ? 'Tomorrow' : navItems[activeNav]
  document.getElementById(`${element}`).style.display = 'block'
  document.getElementById(`nav-${activeNav}`).style.color = 'white'
  for (let i=0; i<navItems.length; i++) {
    document.getElementById(`nav-${i}`).innerHTML = navItems[i]
  };

  // Update nav colors and visible page
  function navUpdate (navElement, color, pageId, status) {
    document.getElementById(navElement).style.color = color
    if (pageId === tomorrow) pageId = 'Tomorrow'
    document.getElementById(pageId).style.display = status
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

(function windSurfaceForecastGraphical() {
  if (now.getHours() > 5 && now.getHours() < 17) {
    const offsetTime = now.getTimezoneOffset() / 60 === 6 ? '5 pm' : '4 pm'
    const windImageURL = 'https://graphical.weather.gov/images/utah/WindSpd4_utah.png'
    const gustImageURL = 'https://graphical.weather.gov/images/utah/WindGust4_utah.png'
    document.getElementById('graphical-wind-time').innerHTML = `Surface Forecast @ ${offsetTime}`
    document.getElementById('graphical-wind-img').src = windImageURL
    document.getElementById('graphical-gust-img').src = gustImageURL
    document.getElementById('graphical-wind-div').style.display = 'block'
  }
})();

(function getGraphicalForecastImages() {
  const nextDay = now.getHours() > 18 ? `&nbsp;&nbsp;(${new Date(now.setHours(now.getHours() + 24)).toLocaleString('en-us', {weekday: 'long'})})&nbsp;&nbsp;` : ''
  const url = 'https://graphical.weather.gov/images/slc/'
  const timeStr = (now.getHours() > 18 || now.getHours() < 7) ? 5 : 1
  document.getElementById('sky-next-day').innerHTML = nextDay
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
  const nextDay = now.getHours() > 18 ? `&nbsp;&nbsp;(${new Date(now.setHours(now.getHours() + 24)).toLocaleString('en-us', {weekday: 'long'})})&nbsp;&nbsp;` : ''
  const selector = (now.getHours() > 3 && now.getHours() < 13) ? '12' : (now.getHours() > 18 || now.getHours() < 4) ? '24' : '06'
  const link = `https://www.aviationweather.gov/data/windtemp/?region=slc&fcst=${selector}`
  const range = `${start} &nbsp;&#187;&nbsp; ${end}${nextDay}`
  document.getElementById('wind-aloft-link').setAttribute('href', link)
  document.getElementById('aloft-range').innerHTML = range
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