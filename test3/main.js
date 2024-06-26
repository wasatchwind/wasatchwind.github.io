'use strict';
const now = new Date()
const timezoneOffset = now.getTimezoneOffset() / 60
const stations = ['UTOLY', 'REY', 'AMB', 'HDP', 'KU42', 'HF012', 'FPS', 'OGP', 'KSLC']
let activeNav = 0, navItems = [], sunset, soundingData

function getCookie(input) {
  let decodedCookie = decodeURIComponent(document.cookie)
  let cookieArray = decodedCookie.split('; ')
  for (let i=0; i<cookieArray.length; i++) {
    if (cookieArray[i].split('=')[0] === input) {
      return cookieArray[i].split('=')[1]
    }
  }
};

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
function buildMarquee() {
  let marqueeSpeed = getCookie('marqueeSpeed')
  if (!marqueeSpeed) marqueeSpeed = 800
  const animation = { duration: marqueeSpeed, easing: (t) => t }
  const marquee = new KeenSlider("#marquee", {
    loop: true,
    slides: { perView: 4 },
    created(m) { m.moveToIdx(1, true, animation) },
    updated(m) { m.moveToIdx(m.track.details.abs + 1, true, animation) },
    animationEnded(m) { m.moveToIdx(m.track.details.abs + 1, true, animation) }
  })
};

function marqueeSetSpeed(speed) {
  document.cookie = `marqueeSpeed=${speed}; max-age=31536000; path=/`
  document.getElementById('marquee-1200').className = 'bg-dark border fw-normal px-4 rounded-5 py-2'
  document.getElementById('marquee-800').className = 'bg-dark border fw-normal px-4 rounded-5 py-2'
  document.getElementById('marquee-400').className = 'bg-dark border fw-normal px-4 rounded-5 py-2'
  document.getElementById(`marquee-${speed}`).className = 'bg-success border fw-semibold px-4 rounded-5 py-2'
  buildMarquee()
  reload()
};

function buildStationSettings() {
  for (let i=0; i<stations.length; i++) {
    if (stations[i] !== 'KSLC') {
      let status = getCookie(`${stations[i]}`)
      if (!status || status === 'on') {
        document.getElementById(`${stations[i]}=on`).className = 'bg-success border fw-semibold px-4 rounded-5 py-2'
        document.getElementById(`${stations[i]}=off`).className = 'bg-dark border fw-normal px-4 rounded-5 py-2'
        document.getElementById(`${stations[i]}-main`).style.display = 'block'
      }
      else {
        document.getElementById(`${stations[i]}=on`).className = 'bg-dark border fw-normal px-4 rounded-5 py-2'
        document.getElementById(`${stations[i]}=off`).className = 'bg-success border fw-semibold px-4 rounded-5 py-2'
        document.getElementById(`${stations[i]}-main`).style.display = 'none'
      }
    }
  }
  let marqueeSpeed = getCookie('marqueeSpeed')
  if (!marqueeSpeed) marqueeSpeed = 800
  document.getElementById('marquee-1200').className = 'bg-dark border fw-normal px-4 rounded-5 py-2'
  document.getElementById('marquee-800').className = 'bg-dark border fw-normal px-4 rounded-5 py-2'
  document.getElementById('marquee-400').className = 'bg-dark border fw-normal px-4 rounded-5 py-2'
  document.getElementById(`marquee-${marqueeSpeed}`).className = 'bg-success border fw-semibold px-4 rounded-5 py-2'
};

function stationSetToggle(data) {
  document.cookie = `${data}; max-age=31536000; path=/`
  document.getElementById(data).className = 'bg-success border fw-semibold px-4 rounded-5 py-2'
  if (data.slice(-3) === 'off') {
    document.getElementById(data.replace('off', 'on')).className = 'bg-dark border fw-normal px-4 rounded-5 py-2'
    document.getElementById(`${data.split('=')[0]}-main`).style.display = 'none'
  }
  else {
    document.getElementById(data.replace('on', 'off')).className = 'bg-dark border fw-normal px-4 rounded-5 py-2'
    document.getElementById(`${data.split('=')[0]}-main`).style.display = 'block'
  }
}

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
  navItems = ['Today', tomorrow, 'Settings', 'Misc.', 'GPS', 'Cams', 'Now']
  if (now.getHours() >= 14 && now.getHours() <= sunset.slice(11,13)-1) {
    slider.moveToIdx(navItems.length-1, true, { duration: 0 })
  }
  else if (now.getHours() >= sunset.slice(11,13)-1) {
    slider.moveToIdx(1, true, { duration: 0 })
  }
};

function navUpdate (left, right) {
  left = activeNav === 0 ? navItems.length-1 : activeNav - 1
  right = activeNav === navItems.length-1 ? 0 : activeNav + 1
  document.getElementById('topnav-left').innerHTML = navItems[left]
  document.getElementById('topnav-active').innerHTML = navItems[activeNav]
  document.getElementById('topnav-right').innerHTML = navItems[right]
};

function navSet() {
  navOrder()
  navUpdate(activeNav)
};

function buildStationURL(stationString = '') {
  for (let i=0; i<stations.length; i++) {
    stationString = `${stationString}&stid=${stations[i]}`
  }
  return stationString
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
      document.getElementById(key).innerHTML = Math.round(value[0] * 3.28084).toLocaleString()
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

function gcpWindAloft(data, longtermStartTime, longtermEndTime) {
  const forecastEndRaw = data.forecast_06h.end_time < data.forecast_06h.start_time ? data.forecast_06h.end_time + 24 : data.forecast_06h.end_time
  const gridEndTime = now.getHours() + 6
  const forecastEndTime = forecastEndRaw < 6 ? forecastEndRaw + timezoneOffset + 12 : forecastEndRaw - timezoneOffset
  const breakpoint = 6 - (gridEndTime - forecastEndTime)
  for (let i=0; i<6; i++) {
    if (i < breakpoint || breakpoint < 0) {
      gcpWindAloftRows(i, data.forecast_06h.wind_speed, data.forecast_06h.wind_direction)
    }
    else gcpWindAloftRows(i, data.forecast_12h.wind_speed, data.forecast_12h.wind_direction)
  }
  // Refactor this avoid DRY
  if (data.forecast_24h.start_time - 6 === 0) longtermStartTime = 'Midnight'
  else if (data.forecast_24h.start_time - 6 === 12) longtermStartTime = 'Noon'
  else longtermStartTime = `${data.forecast_24h.start_time - 6}am`
  if (data.forecast_24h.end_time - 6 === 0) longtermEndTime = 'Midnight'
  else if (data.forecast_24h.end_time - 6 === 12) longtermEndTime = 'Noon'
  else longtermEndTime = `${Math.abs(data.forecast_24h.end_time - 6)}pm`
  document.getElementById('wind-aloft-time-longterm').innerHTML = `Wind Aloft ${longtermStartTime} - ${longtermEndTime}`
  gcpWindAloftRows('longterm', data.forecast_24h.wind_speed, data.forecast_24h.wind_direction)
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
    if (i === 0) {
      for (let j=0; j<2; j++) {
        document.getElementsByClassName(`forecast-day${i}-day`)[j].innerHTML = data.properties.periods[position].name
        document.getElementsByClassName(`forecast-day${i}-txt`)[j].innerHTML = data.properties.periods[position].detailedForecast
        document.getElementsByClassName(`forecast-day${i}-img`)[j].src = `https://api.weather.gov${data.properties.periods[position].icon}`
      }
    }
    else {
      document.getElementById(`forecast-day${i}-day`).innerHTML = data.properties.periods[position].name
      document.getElementById(`forecast-day${i}-txt`).innerHTML = data.properties.periods[position].detailedForecast
      document.getElementById(`forecast-day${i}-img`).src = `https://api.weather.gov${data.properties.periods[position].icon}`
    }
    position += 2
  }
  if (now.getHours() >= 5 && data.properties.periods[0].isDaytime) {
    document.getElementById('nws-today-div').style.display = 'block'
  }
  if (now.getHours() >= 12 && !data.properties.periods[0].isDaytime) document.getElementById('nws-today-multiday-div').style.display = 'block'
  document.getElementById('nws-multiday-div').style.display = 'block'
};

function areaForecast(text) {
  const dateStart = text.search(/\d{3,4}\s[PpAa][Mm]\s[Mm][DdSs][Tt]\s/)
  const dateEnd = text.search(/\s\d{1,2}\s202\d{1}\n/) + 7
  const forecastDate = text.slice(dateStart, dateEnd)
  const synopsisStart = text.search(/[Ss][Yy][Nn][Oo][Pp][Ss][Ii][Ss]/) + 11
  const synopsisEnd = text.search(/&&/)
  const synopsis = text.slice(synopsisStart, synopsisEnd).replace(/\n/g, ' ')
  const aviationStart = text.search(/[Aa][Vv][Ii][Aa][Tt][Ii][Oo][Nn]\.{3}KSLC\.{3}/) + 18
  const aviationEnd = text.search(/\n\n\.[Rr][Ee][Ss][Tt]|\n\n[Rr][Ee][Ss][Tt]/)
  const aviation = text.slice(aviationStart, aviationEnd).replace(/\n/g, ' ')
  document.getElementById('area-forecast-time').innerText = forecastDate
  document.getElementById('area-forecast-synopsis').innerText = synopsis
  document.getElementById('area-forecast-aviation').innerText = aviation
  document.getElementById('area-forecast-div').style.display = 'block'
  document.getElementById('area-forecast-aviation-div').style.display = 'block'
};

buildMarquee()
buildStationSettings()

function displayImages() {
  if (now.getHours() >= 6 && now.getHours() < 18) {
    const windImageURL = 'https://graphical.weather.gov/images/SLC/WindSpd4_utah.png'
    const gustImageURL = 'https://graphical.weather.gov/images/SLC/WindGust4_utah.png'
    document.getElementById('surface-wind-img').src = windImageURL
    document.getElementById('surface-gust-img').src = gustImageURL
    document.getElementById('surface-wind-div').style.display = 'block'
  }
  if (now.getHours() >= sunset.slice(11,13)-1 && now.getHours() < 24) {
    document.getElementById('hourly-chart-tomorrow').src = 'https://forecast.weather.gov/meteograms/Plotter.php?lat=40.7603&lon=-111.8882&wfo=SLC&zcode=UTZ105&gset=30&gdiff=10&unit=0&tinfo=MY7&ahour=0&pcmd=10001110100000000000000000000000000000000000000000000000000&lg=en&indu=1!1!1!&dd=&bw=&hrspan=48&pqpfhr=6&psnwhr=6'
    document.getElementById('hourly-chart-tomorrow-div').style.display = 'block'
  }
  else {
    document.getElementById('hourly-chart-today').src = 'https://forecast.weather.gov/meteograms/Plotter.php?lat=40.7603&lon=-111.8882&wfo=SLC&zcode=UTZ105&gset=30&gdiff=10&unit=0&tinfo=MY7&ahour=0&pcmd=10001110100000000000000000000000000000000000000000000000000&lg=en&indu=1!1!1!&dd=&bw=&hrspan=48&pqpfhr=6&psnwhr=6'
    document.getElementById('hourly-chart-today-div').style.display = 'block'
  }
  document.getElementById('wind-map').src = 'https://storage.googleapis.com/wasatch-wind-static/wind-map-save.png'
  document.getElementById('satellite-gif').src = 'https://cdn.star.nesdis.noaa.gov/GOES18/ABI/SECTOR/psw/13/GOES18-PSW-13-600x600.gif'
  document.getElementById('cam-south').src = 'https://horel.chpc.utah.edu/data/station_cameras/wbbs_cam/wbbs_cam_current.jpg'
  document.getElementById('cam-west').src = 'https://www.wrh.noaa.gov/images/slc/camera/latest/Draper.latest.jpg'
  document.getElementById('cam-east').src = 'https://www.wrh.noaa.gov/images/slc/camera/latest/darren2.latest.jpg'
};

// LOCAL ONLY!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!
function displayImagesLocal() {
  if (now.getHours() >= 6 && now.getHours() < 18) {
    const windImageURL = 'images/wind-graphic.png'
    const gustImageURL = 'images/gust-graphic.png'
    document.getElementById('surface-wind-img').src = windImageURL
    document.getElementById('surface-gust-img').src = gustImageURL
    document.getElementById('surface-wind-div').style.display = 'block'
  }
  if (now.getHours() >= sunset.slice(11,13)-1 && now.getHours() < 24) {
    document.getElementById('hourly-chart-tomorrow').src = 'images/Plotter.png'
    document.getElementById('hourly-chart-tomorrow-div').style.display = 'block'
  }
  else {
    document.getElementById('hourly-chart-today').src = 'images/Plotter.png'
    document.getElementById('hourly-chart-today-div').style.display = 'block'
  }
  document.getElementById('wind-map').src = 'images/wind-map-save.png'
  document.getElementById('satellite-gif').src = 'images/sat.gif'
  document.getElementById('cam-south').src = 'images/cam.png'
  document.getElementById('cam-west').src = 'images/cam.png'
  document.getElementById('cam-east').src = 'images/cam.png'
};
