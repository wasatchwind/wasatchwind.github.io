'use strict';

// Global variables
const now = new Date();
const slider = buildNavSlider();
const ftPerMeter = 3.28084;
let activeNav = 0, navItems = [], sunset = '', soundingData = {}, hiTemp = null;

// Reload/refresh page
function reload() {
  history.scrollRestoration = 'manual';
  location.reload();
};

// Get cookies for marquee speed and station toggles user settings
function getCookie(name) {
  const decodedCookie = decodeURIComponent(document.cookie);
  const cookies = decodedCookie.split('; ');
  for (const cookie of cookies) {
    const [cookieName, cookieValue] = cookie.split('=');
    if (cookieName === name) {
      return cookieValue;
    }
  }
  return null;
};

// Marquee slider (https://keen-slider.io/docs)
function buildMarquee() {
  const marqueeSpeed = getCookie('marqueeSpeed') || 800;
  const animation = { duration: marqueeSpeed, easing: (t) => t };
  const options = {
    loop: true,
    slides: { perView: 4 },
    created(m) { m.moveToIdx(1, true, animation) },
    updated(m) { m.moveToIdx(m.track.details.abs + 1, true, animation) },
    animationEnded(m) { m.moveToIdx(m.track.details.abs + 1, true, animation) }
  };
  const marquee = new KeenSlider('#marquee', options);
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
      window.scrollTo(0, 0)
    }
  };
  return new KeenSlider('#slider', options);
};

// Marquee setup
(function buildMarqueeSettings() {
  const marqueeSpeed = getCookie('marqueeSpeed') || 1000;
  const speeds = [4000, 1000, 500];
  speeds.forEach(speed => {
    const element = document.getElementById(`marquee-${speed}`);
    element.className = 'bg-dark border fw-normal px-4 rounded-5 py-2';
  });
  const activeElement = document.getElementById(`marquee-${marqueeSpeed}`);
  activeElement.className = 'bg-success border fw-semibold px-4 rounded-5 py-2';
})();

// Marquee speed
function marqueeSetSpeed(speed) {
  document.cookie = `marqueeSpeed=${speed}; max-age=31536000; path=/`;
  const speeds = [4000, 1000, 500];
  speeds.forEach(d => {
    const element = document.getElementById(`marquee-${d}`);
    element.className = 'bg-dark border fw-normal px-4 rounded-5 py-2';
  });
  const activeElement = document.getElementById(`marquee-${speed}`);
  activeElement.className = 'bg-success border fw-semibold px-4 rounded-5 py-2';
  buildMarquee();
  reload();
};

// Wind chart toggle for expand/collapse
function toggleWindChart(div) {
  const element = document.getElementById(div);
  const toggleElement = document.getElementById(`${div}-toggle`);
  const isHidden = element.style.display === '' || element.style.display === 'none';

  element.style.display = isHidden ? 'block' : 'none';
  toggleElement.innerHTML = isHidden ? '&#8722;' : '&#43;';
};

function toggleWindAloft() {
  const group0 = document.getElementById('wind-aloft-group0');
  const group1 = document.getElementById('wind-aloft-group1');
  const showGroup1 = group1.style.display === '' || group1.style.display === 'none';

  group0.style.display = showGroup1 ? 'none' : 'block';
  group1.style.display = showGroup1 ? 'block' : 'none';
};

// Set global variables sunset and hiTemp
function setHiTempAndSunset(data) {
  sunset = data.sunset[0];
  hiTemp = Math.round(data.temperature_2m_max[0]);
};

// Set up the order of the left/right scrollable tabs
function navOrder(sunsetFormatted, today = new Date()) {
  sunsetFormatted = new Date(sunset).toLocaleTimeString('en-us', { hour: 'numeric', minute: '2-digit' }).slice(0, -3);
  document.getElementById('sunset').innerHTML = sunsetFormatted;
  const nextDay = new Date(today);
  nextDay.setDate(today.getDate() + 1);
  const nextDayFormatted = `${nextDay.toLocaleString('en-us', { weekday: 'short' })}+`;
  navItems = ['Today', nextDayFormatted, 'Settings', 'Misc.', 'GPS', 'Cams', 'Now'];
  const currentHour = now.getHours();
  const sunsetHour = new Date(sunset).getHours();
  if (currentHour >= 14 && currentHour <= sunsetHour - 1) {
    slider.moveToIdx(navItems.length - 1, true, { duration: 0 });
  }
  else if (currentHour >= sunsetHour - 1) {
    slider.moveToIdx(1, true, { duration: 0 });
  };
};

// Update nav with user interaction swipe
function navUpdate() {
  const left = activeNav === 0 ? navItems.length - 1 : activeNav - 1;
  const right = activeNav === navItems.length - 1 ? 0 : activeNav + 1;
  document.getElementById('topnav-left').innerHTML = navItems[left];
  document.getElementById('topnav-active').innerHTML = navItems[activeNav];
  document.getElementById('topnav-right').innerHTML = navItems[right];
};

// Update nav with user interaction click
window.simulateSwipe = function (direction) {
  if (direction === "left") slider.prev();
  else if (direction === "right") slider.next();
}

// Initial nav setup
function navSet() {
  navOrder();
  navUpdate(activeNav);
};

// Display the timestamp for the Wind Map image
function windMap(data) {
  const timestamp = new Date(data.timeCreated).toLocaleString('en-US', { hour: 'numeric', minute: '2-digit' }).toLowerCase();
  document.getElementById('wind-map-timestamp').innerHTML = `Wind Map @ ${timestamp}`;
};

// Extract specific text using Regex for Soaring Forecast and Area Forecast
function extractText(text, startPattern, endPattern, offset) {
  const startIndex = text.search(startPattern) + offset;
  text = text.slice(startIndex);
  const endIndex = text.search(endPattern);
  return text.slice(0, endIndex).replace(/\n/g, ' ');
};

// Function to extract and return <pre> text for Soaring Forecast and Area Forecast
function parsePreText(rawContent) {
  const parser = new DOMParser();
  const response = parser.parseFromString(rawContent, 'text/html');
  const preElement = response.querySelector('pre');
  return preElement.textContent;
};

function nwsForecast(data) {
  const forecastDaysCount = 5;
  const isDaytime = data[0].isDaytime;
  let period = isDaytime ? 0 : 1;
  for (let i = 0; i < forecastDaysCount; i++) {
    let qualifier = "";
    let border = `<div class="border-bottom"></div>`;
    if (isDaytime && i === 0) {
      qualifier = "-today";
      border = '';
      document.getElementById('nws-today-div').style.display = 'block';
    } else {
      document.getElementById('nws-today-multiday-div').style.display = 'block';
    }
    const div = `
    <div class="d-flex">
      <div class="col-3">
        <div class="display-6">${data[period].name}</div>
        <img class="align-self-start rounded-4 w-100" src="${data[period].icon}">
      </div>
      <div class="col display-6 font-monospace ps-2 text-start">${data[period].detailedForecast}</div>
    </div>
    ${border}`;
    document.getElementById(`forecast-day${i}${qualifier}`).innerHTML = div;
    period += 2;
  }
  document.getElementById('nws-multiday-div').style.display = 'block'; // Display "Days Ahead" block
}

// Process and display the Area Forecast
function areaForecast(areaForecastPage) {
  const text = parsePreText(areaForecastPage);
  const forecastDate = extractText(text, /\d{3,4}\s[PpAa][Mm]\s[Mm][DdSs][Tt]/, /\s202\d{1}\n/, 0);
  const synopsis = extractText(text, /[Ss][Yy][Nn][Oo][Pp][Ss][Ii][Ss]/, /&&/, 8);
  const aviation = extractText(text, /\.[Aa][Vv][Ii][Aa][Tt][Ii][Oo][Nn]/, /REST|.+REST\s|.+Rest\s/, 9);
  document.getElementById('area-forecast-time').innerText = forecastDate;
  document.getElementById('area-forecast-synopsis').innerText = synopsis;
  document.getElementById('area-forecast-aviation').innerText = aviation;
  document.getElementById('area-forecast-div').style.display = 'block';
  document.getElementById('area-forecast-aviation-div').style.display = 'block';
};

// Display remaining images using view logic based on sunset time
function displayImages() {
  if (now.getHours() >= 6 && now.getHours() < 18) {
    const windImageURL = 'https://graphical.weather.gov/images/SLC/WindSpd4_utah.png';
    const gustImageURL = 'https://graphical.weather.gov/images/SLC/WindGust4_utah.png';
    document.getElementById('surface-wind-img').src = windImageURL;
    document.getElementById('surface-gust-img').src = gustImageURL;
    document.getElementById('surface-wind-div').style.display = 'block';
  }
  if (now.getHours() >= sunset.slice(11, 13) - 1 && now.getHours() < 24) {
    document.getElementById('hourly-chart-tomorrow').src = 'https://forecast.weather.gov/meteograms/Plotter.php?lat=40.7603&lon=-111.8882&wfo=SLC&zcode=UTZ105&gset=30&gdiff=10&unit=0&tinfo=MY7&ahour=0&pcmd=10001110100000000000000000000000000000000000000000000000000&lg=en&indu=1!1!1!&dd=&bw=&hrspan=48&pqpfhr=6&psnwhr=6';
    document.getElementById('hourly-chart-tomorrow-div').style.display = 'block';
  }
  else {
    document.getElementById('hourly-chart-today').src = 'https://forecast.weather.gov/meteograms/Plotter.php?lat=40.7603&lon=-111.8882&wfo=SLC&zcode=UTZ105&gset=30&gdiff=10&unit=0&tinfo=MY7&ahour=0&pcmd=10001110100000000000000000000000000000000000000000000000000&lg=en&indu=1!1!1!&dd=&bw=&hrspan=48&pqpfhr=6&psnwhr=6';
    document.getElementById('hourly-chart-today-div').style.display = 'block';
  };
  document.getElementById('wind-map').src = 'https://storage.googleapis.com/wasatch-wind-static/wind-map-save.png';
  document.getElementById('satellite-gif').src = 'https://cdn.star.nesdis.noaa.gov/GOES18/ABI/SECTOR/psw/13/GOES18-PSW-13-600x600.gif';
  document.getElementById('cam-south').src = 'https://horel.chpc.utah.edu/data/station_cameras/wbbs_cam/wbbs_cam_current.jpg';
  document.getElementById('cam-west').src = 'https://cameraftpapi.drivehq.com/api/Camera/GetLastCameraImage.aspx?parentID=347695945&shareID=17138700';
  document.getElementById('cam-east').src = 'https://cameraftpapi.drivehq.com/api/Camera/GetLastCameraImage.aspx?parentID=347464441&shareID=17137573';

};

// IIFE builds station settings on/off list; independent of timeseries.js data since stations may be temporarily down
// Hardcoded list must be updated here and index.html for added/removed stations (alphabetical order by name)
(function buildStationSettings() {
  const stationList = {
    station_0: {
      name: 'Alta Baldy',
      stid: 'AMB'
    },
    station_1: {
      name: 'Airport 2',
      stid: 'KSVR'
    },
    station_2: {
      name: 'Hidden Peak',
      stid: 'HDP'
    },
    station_3: {
      name: 'Ogden Peak',
      stid: 'OGP'
    },
    station_4: {
      name: 'Olypmus Cove',
      stid: 'UTOLY'
    },
    station_5: {
      name: 'Reynolds Peak',
      stid: 'REY'
    },
    station_6: {
      name: 'Southside',
      stid: 'FPS'
    }
  };

  // Loop through each station to set up html divs, check for cookies, and label on/off accordingly
  for (const key in stationList) {
    const div = `
    <div class="align-items-center border-bottom display-5 d-flex justify-content-around py-4">
      <div class="col-5 display-3 text-info text-start">${stationList[key].name}</div>
      <div id="${stationList[key].stid}=on" onclick="stationSetToggle('${stationList[key].stid}=on')">On</div>
      <div id="${stationList[key].stid}=off" onclick="stationSetToggle('${stationList[key].stid}=off')">Off</div>
    </div>`
    document.getElementById(key).innerHTML = div;
    document.getElementById(`${stationList[key].stid}-name`).innerHTML = stationList[key].name;

    const status = getCookie(stationList[key].stid) || "on";
    const on = document.getElementById(`${stationList[key].stid}=on`);
    const off = document.getElementById(`${stationList[key].stid}=off`);
    const stationChart = document.getElementById(`${stationList[key].stid}-main`);

    if (status === 'on') {
      on.className = 'bg-success border fw-semibold px-4 rounded-5 py-2';
      off.className = 'bg-dark border fw-normal px-4 rounded-5 py-2';
      stationChart.style.display = 'block';
    } else {
      on.className = 'bg-dark border fw-normal px-4 rounded-5 py-2';
      off.className = 'bg-success border fw-semibold px-4 rounded-5 py-2';
      stationChart.style.display = 'none';
    }
  }
})();

// Onclick function to toggle stations settings on/off
function stationSetToggle(stid) {
  document.cookie = `${stid}; max-age=31536000; path=/`; // Set/update cookie

  const element = document.getElementById(stid);
  const [station, status] = stid.split('=');
  const oppositeStatus = status === 'off' ? 'on' : 'off';
  const oppositeElement = document.getElementById(`${station}=${oppositeStatus}`);
  const mainElement = document.getElementById(`${station}-main`);

  element.className = 'bg-success border fw-semibold px-4 rounded-5 py-2';
  oppositeElement.className = 'bg-dark border fw-normal px-4 rounded-5 py-2';
  mainElement.style.display = status === 'off' ? 'none' : 'block';
};