'use strict';
const now = new Date()
const ftPerMeter = 3.28084
const slider = buildNavSlider()
const stations = ['UTOLY', 'REY', 'AMB', 'HDP', 'KU42', 'HF012', 'FPS', 'OGP', 'KSLC']
let activeNav = 0, navItems = [], sunset, soundingData

function reload() {
  history.scrollRestoration = 'manual'
  location.reload()
};

function getCookie(name) {
  const decodedCookie = decodeURIComponent(document.cookie)
  const cookies = decodedCookie.split('; ')
  for (const cookie of cookies) {
    const [cookieName, cookieValue] = cookie.split('=')
    if (cookieName === name) {
      return cookieValue
    }
  }
  return null
};

// Marquee slider (https://keen-slider.io/docs)
function buildMarquee() {
  const marqueeSpeed = getCookie('marqueeSpeed') || 800
  const animation = { duration: marqueeSpeed, easing: (t) => t }
  const options = {
    loop: true,
    slides: { perView: 4 },
    created(m) { m.moveToIdx(1, true, animation) },
    updated(m) { m.moveToIdx(m.track.details.abs + 1, true, animation) },
    animationEnded(m) { m.moveToIdx(m.track.details.abs + 1, true, animation) }
  };
  const marquee = new KeenSlider('#marquee', options)
};
buildMarquee();

// Menu navigation carousel/slider (https://keen-slider.io/docs)
function buildNavSlider() {
  const options = {
    loop: true,
    slides: { perView: 1 },
    slideChanged: () => {
      activeNav = slider.track.details.rel
      navUpdate()
      window.scrollTo(0,0)
    }
  }
  return new KeenSlider('#slider', options)
};

(function buildStationSettings() {
  stations.forEach(station => {
    if (station !== 'KSLC') {
      const status = getCookie(`${station}`) || 'on'
      const onElement = document.getElementById(`${station}=on`)
      const offElement = document.getElementById(`${station}=off`)
      const mainElement = document.getElementById(`${station}-main`)
      if (status === 'on') {
        onElement.className = 'bg-success border fw-semibold px-4 rounded-5 py-2'
        offElement.className = 'bg-dark border fw-normal px-4 rounded-5 py-2'
        mainElement.style.display = 'block'
      } else {
        onElement.className = 'bg-dark border fw-normal px-4 rounded-5 py-2'
        offElement.className = 'bg-success border fw-semibold px-4 rounded-5 py-2'
        mainElement.style.display = 'none'
      }
    }
  })
})();

(function buildMarqueeSettings() {
  const marqueeSpeed = getCookie('marqueeSpeed') || 800
  const speeds = [1200, 800, 400]
  speeds.forEach(speed => {
    const element = document.getElementById(`marquee-${speed}`)
    element.className = 'bg-dark border fw-normal px-4 rounded-5 py-2'
  })
  const activeElement = document.getElementById(`marquee-${marqueeSpeed}`)
  activeElement.className = 'bg-success border fw-semibold px-4 rounded-5 py-2'
})();

function marqueeSetSpeed(speed) {
  document.cookie = `marqueeSpeed=${speed}; max-age=31536000; path=/`
  const speeds = [1200, 800, 400]
  speeds.forEach(d => {
    const element = document.getElementById(`marquee-${d}`)
    element.className = 'bg-dark border fw-normal px-4 rounded-5 py-2'
  })
  const activeElement = document.getElementById(`marquee-${speed}`)
  activeElement.className = 'bg-success border fw-semibold px-4 rounded-5 py-2'
  buildMarquee()
  reload()
};

function toggleWindChart(div) {
  const element = document.getElementById(div)
  const toggleElement = document.getElementById(`${div}-toggle`)
  const isHidden = element.style.display === '' || element.style.display === 'none'
  element.style.display = isHidden ? 'block' : 'none'
  toggleElement.innerHTML = isHidden ? '&#8722;' : '&#43;'
};

function stationSetToggle(data) {
  document.cookie = `${data}; max-age=31536000; path=/`
  const element = document.getElementById(data)
  element.className = 'bg-success border fw-semibold px-4 rounded-5 py-2'
  const [station, status] = data.split('=')
  const oppositeStatus = status === 'off' ? 'on' : 'off'
  const oppositeElement = document.getElementById(`${station}=${oppositeStatus}`)
  oppositeElement.className = 'bg-dark border fw-normal px-4 rounded-5 py-2'
  const mainElement = document.getElementById(`${station}-main`)
  mainElement.style.display = status === 'off' ? 'none' : 'block'
};

function navOrder(sunsetFormatted, today = new Date()) {
  sunsetFormatted = new Date(sunset).toLocaleTimeString('en-us', {hour: 'numeric', minute: '2-digit'}).slice(0,-3)
  document.getElementById('sunset').innerHTML = sunsetFormatted
  const nextDay = new Date(today)
  nextDay.setDate(today.getDate() + 1)
  const nextDayFormatted = `${nextDay.toLocaleString('en-us', {weekday: 'short'})}+`
  navItems = ['Today', nextDayFormatted, 'Settings', 'Misc.', 'GPS', 'Cams', 'Now']
  const currentHour = now.getHours()
  const sunsetHour = new Date(sunset).getHours()
  if (currentHour >= 14 && currentHour <= sunsetHour - 1) {
    slider.moveToIdx(navItems.length - 1, true, { duration: 0 })
  }
  else if (currentHour >= sunsetHour - 1) {
    slider.moveToIdx(1, true, { duration: 0 })
  }
};

function navUpdate () {
  const left = activeNav === 0 ? navItems.length - 1 : activeNav - 1
  const right = activeNav === navItems.length - 1 ? 0 : activeNav + 1
  document.getElementById('topnav-left').innerHTML = navItems[left]
  document.getElementById('topnav-active').innerHTML = navItems[activeNav]
  document.getElementById('topnav-right').innerHTML = navItems[right]
};

function navSet() {
  navOrder()
  navUpdate(activeNav)
};

function buildStationURL(stationString = '') {
  stations.forEach(station => {
    stationString += `&stid=${station}`
  })
  return stationString
};

function windMap(data) {
  const timestamp = new Date(data.timeCreated).toLocaleString('en-US', {hour: 'numeric', minute: '2-digit'}).toLowerCase();
  document.getElementById('wind-map-timestamp').innerHTML = `Wind Map @ ${timestamp}`
};

function extractText(text, startPattern, endPattern, offset) {
  const startIndex = text.search(startPattern) + offset
  const endIndex = text.search(endPattern)
  return text.slice(startIndex, endIndex)
};

function areaForecast(text) {
  const forecastDate = extractText(text, /\d{3,4}\s[PpAa][Mm]\s[Mm][DdSs][Tt]/, /\s202\d{1}\n/, 0)
  const synopsis = extractText(text, /[Ss][Yy][Nn][Oo]/, /&&/, 0).replace(/\n/g, ' ')
  const aviation = extractText(text, /\.[Aa][Vv][Ii][Aa][Tt][Ii][Oo][Nn]/, /\n\n[Rr\.][RrEe][EeSs][SsTt][Tt\s][\sOo]/, 9).replace(/\n/g, ' ')
  document.getElementById('area-forecast-time').innerText = forecastDate
  document.getElementById('area-forecast-synopsis').innerText = synopsis
  document.getElementById('area-forecast-aviation').innerText = aviation
  document.getElementById('area-forecast-div').style.display = 'block'
  document.getElementById('area-forecast-aviation-div').style.display = 'block'
};

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
  document.getElementById('cam-west').src = 'https://cameraftpapi.drivehq.com/api/Camera/GetLastCameraImage.aspx?parentID=347695945&shareID=17138700'
  document.getElementById('cam-east').src = 'https://cameraftpapi.drivehq.com/api/Camera/GetLastCameraImage.aspx?parentID=347464441&shareID=17137573'
};
