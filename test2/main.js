'use strict';
const now = new Date()
const tomorrow = new Date(now.setDate(now.getDate() + 1)).toLocaleString('en-us', {weekday: 'short'})

function reload() {
  history.scrollRestoration = 'manual'
  location.reload()
};

// Set nav item order according to time of day 2pm switchover
let navItems = []
if (now.getHours() >= 7 && now.getHours() < 15) navItems = ['Today', tomorrow, 'Long', 'Cams', 'GPS', 'About', 'Settings', 'Now']
else if (now.getHours() > 20) navItems = [tomorrow, 'Long', 'Cams', 'GPS', 'About', 'Settings', 'Now', 'Today']
else navItems = ['Now', 'Today', tomorrow, 'Long', 'Cams', 'GPS', 'About', 'Settings']

// Set nav item labels & active label
let activeNav = 0
let element = navItems[activeNav] === tomorrow ? 'Tomorrow' : navItems[activeNav]
document.getElementById(`${element}`).style.display = 'block'
document.getElementById(`nav-${activeNav}`).style.color = 'white'
for (let i=0; i<navItems.length; i++) {
  document.getElementById(`nav-${i}`).innerHTML = navItems[i]
};

// Update nav colors and page shown
function navUpdate (navElement, color, pageId, status) {
  document.getElementById(navElement).style.color = color
  if (pageId === tomorrow) pageId = 'Tomorrow'
  document.getElementById(pageId).style.display = status
};

// Menu navigation carousel/slider (https://keen-slider.io/docs)
const slider = new KeenSlider('#slider', {
  loop: true,
  slides: {
    perView: 3,
  },
  animationEnded: () => {
    navUpdate(`nav-${activeNav}`, 'var(--bs-secondary)', navItems[activeNav], 'none')
    activeNav = slider.track.details.rel
    navUpdate(`nav-${activeNav}`, 'white', navItems[activeNav], 'block')
  },
});

// Marquee
const animation = { duration: 1500, easing: (t) => t }
const marquee = new KeenSlider("#marquee", {
  loop: true,
  slides: {
    perView: 4,
  },
  created(m) {
    m.moveToIdx(1, true, animation)
  },
  updated(m) {
    m.moveToIdx(m.track.details.abs + 1, true, animation)
  },
  animationEnded(m) {
    m.moveToIdx(m.track.details.abs + 1, true, animation)
  },
});


// Reveal or collapse wind charts
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

// Synoptic time series (https://docs.synopticdata.com/services/time-series)
(async () => {
  const timeSeriesURL = 'https://api.synopticdata.com/v2/station/timeseries?&stid=KSLC&stid=UTOLY&stid=AMB&stid=KU42&stid=FPS&stid=OGP&stid=HF012&recent=720&vars=air_temp,altimeter,wind_direction,wind_gust,wind_speed&units=english,speed|mph,temp|F&obtimezone=local&timeformat=%-I:%M%20%p&token=f8258474e4a348ceb3192e4d205f71da'
  const timeSeriesData = await (await fetch(timeSeriesURL)).json()
  console.log(timeSeriesData)
  if (timeSeriesData.SUMMARY.RESPONSE_MESSAGE === 'OK') {
    document.getElementById('last-loaded').innerHTML = `Data @ ${timeSeriesData.STATION[0].OBSERVATIONS.date_time[timeSeriesData.STATION[0].OBSERVATIONS.date_time.length-1].toLowerCase()}`
    for (let i=0; i<timeSeriesData.STATION.length; i++) windChart(timeSeriesData.STATION[i].STID, timeSeriesData.STATION[i].OBSERVATIONS)
  }
  else console.log('Timeseries fetch failed')
})();

// Timeseries
function windChart(stid, data) { // Only called if some data exists but may be partial
  if (data.wind_speed_set_1.every(d => d === 0)) {
    document.getElementById(`${stid}-main`).style.display = 'none'
    return
  }
  const sliceLength = stid === 'AMB' ? 6 : 12 // Set chart data length, shorter for low frequency data
  if (data.date_time.length < sliceLength) { // If data is less than chart length
    const emptyArray = new Array(sliceLength - data.date_time.length).fill(null) // Create empty array for missing data
    for (let value of Object.keys(data)) data[value] = emptyArray.concat(data[value]) // Iterate data object and join arrays to make complete
  }
  else for (let value of Object.keys(data)) data[value] = data[value].slice(-sliceLength) // If data more than needed, slice to make complete
  time(stid, data.date_time) // date_time always included in data
  if (!data.wind_direction_set_1) data.wind_direction_set_1 = new Array(12).fill(null) // If wind direction key missing, create it with blank value array
  windDirection(stid, data.wind_direction_set_1) // With data guaranteed, even if empty, call function
  if (!data.wind_speed_set_1) data.wind_speed_set_1 = new Array(12).fill(null) // If wind speed key missing, create it with blank value array
  windSpeed(stid, data.wind_speed_set_1) // With data guaranteed, even if empty, call function
  if (!data.wind_gust_set_1) data.wind_gust_set_1 = new Array(12).fill(null) // If wind gust key missing, create it with blank value array
  windGust(stid, data.wind_gust_set_1) // With data guaranteed, even if empty, call function
  windBarHeight(stid, data.wind_speed_set_1, data.wind_gust_set_1)
  windBarColor(stid, data.wind_speed_set_1)
  document.getElementById(`${stid}-main`).style.display = 'block' // Show chart
};

function time(stid, time) {
  time.push(time[time.length - 1]) // Duplicate last item for main line display
  time = time.map(d => d ? d.toLowerCase() : d) // Make all lowercase or leave null
  for (let i=0; i<time.length; i++) {
    time[i] = time[i] && i<time.length-1 ? time[i].slice(0,-3) : time[i] // If time !null remove am/pm
    document.getElementById(`${stid}-time-${i}`).innerHTML = time[i] // Set html element
  }
};

function windDirection(stid, wdir) {
  wdir.push(wdir[wdir.length - 1]) // Duplicate last item for main line display
  const wimg = wdir.map(d => !d ? '&nbsp;' : '&#10148;') // If null make space all else arrow character
  const rotate = wdir.map(d => `rotate(${d + 90}deg)`) // Set rotation for wind direction
  for (let i=0; i<wdir.length; i++) {
    const element = document.getElementById(`${stid}-wdir-${i}`) // Base html element
    element.innerHTML = wimg[i] // Set spaces and/or arrow characters
    element.style.transform = rotate[i] // Rotate
  }
};

function windSpeed(stid, wspd) {
  wspd.push(wspd[wspd.length - 1])
  wspd = wspd.map(d => d === null ? '&nbsp;' : d < 0.5 ? 'Calm' : Math.round(d))
  if (stid !== 'tile') {
    for (let i=0; i<wspd.length; i++) {
      const element = document.getElementById(`${stid}-wspd-${i}`)
      if (wspd[i] === 'Calm' && i !== wspd.length - 1) element.className = 'fs-3 fw-normal'
      if (wspd[i] === 'Calm' && i === wspd.length - 1) element.className = 'align-self-end fs-1 text-center'
      element.innerHTML = wspd[i]
    }
  }
  else if (wspd[wspd.length - 1] === '&nbsp;') document.getElementById(`${stid}-wspd-12`).style.display = 'none'
  else document.getElementById(`${stid}-wspd-12`).innerHTML = wspd[wspd.length - 1]
};

function windGust(stid, gust) {
  gust.push(gust[gust.length - 1])
  gust = gust.map(d => !d ? '&nbsp;' : `g${Math.round(d)}`)
  if (stid !== 'tile') {
    for (let i=0; i<gust.length; i++) document.getElementById(`${stid}-gust-${i}`).innerHTML = gust[i]
  }
  else if (gust[gust.length - 1] === '&nbsp;') document.getElementById(`${stid}-gust-12`).style.display = 'none'
  else document.getElementById(`${stid}-gust-12`).innerHTML = gust[gust.length - 1]
};

function windBarHeight(stid, wspd, gust, multiplier) {
  wspd.pop() // FIX this so it's not necessary to do here
  gust.pop()
  if (Math.max(...gust) > 30) multiplier = 1.3
  else multiplier = 4
  for (let i=0; i<wspd.length; i++) {
    document.getElementById(`${stid}-wbar-${i}`).className = wspd[i] ? 'border-1 border' : ''
    document.getElementById(`${stid}-wbar-${i}`).style.height = `${wspd[i] * multiplier}px`
    document.getElementById(`${stid}-gbar-${i}`).style.height = `${(gust[i] - wspd[i]) * multiplier}px`
  }
};

function windBarColor(stid, data) {
  const yellow = (stid==='AMB' || stid==='OGP') ? 20 : stid==='FPS' ? 15 : 10
  const red = (stid==='AMB' || stid==='OGP') ? 30 : 20
  const barColor = data.map(d => (d > yellow && d < red) ? 'var(--bs-yellow)' : d >= red ? 'var(--bs-orange)' : 'var(--bs-teal)')
  for (let i=0; i<data.length; i++) {
    document.getElementById(`${stid}-wbar-${i}`).style.backgroundColor = barColor[i]
  }
};
