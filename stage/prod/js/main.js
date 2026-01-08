"use strict";

// Dependencies:
// 1) sunset: determines the default order of nav items and some display logic (from openMeteo)
// 2) hiTemp: needed for the Morning Sounding Profile component (from openMeto and soaringForecast)

// Documentation:
// 1) Open Meteo API: https://open-meteo.com/en/docs/gfs-api
// 2) Synoptic API: https://docs.synopticdata.com/services/weather-api
// 3) NWS API: https://www.weather.gov/documentation/services-web-api
// 4) Keen Slider: https://keen-slider.io/docs

// Build Marquee immediately so it isn't static while everything else loads
buildMarquee();

// Process all fetched data
function main(data) {
  // Set up main body nav structure (Keen Slider)
  slider = buildNavSlider();
  navUpdate();

  // Get sunset and set default nav order (varies based on sunset time)
  const sunset = new Date(data.openMeteo.daily.sunset[0]);
  navOrder(sunset);
  displayImages(sunset);
  const sunsetFormatted = sunset.toLocaleString("en-us", { hour: "numeric", minute: "2-digit" }).slice(0, -3);
  document.getElementById("sunset").innerHTML = sunsetFormatted;

  // Get hiTemp from soaringForecast and open meteo (open meteo as backup in case soaring forecast fails)
  const hiTempSoaringForecast = processSoaringForecastPage(data.soaringForecast);
  const hiTempOpenMeteo = data.openMeteo.daily.temperature_2m_max[0];
  hiTemp = hiTempSoaringForecast ? hiTempSoaringForecast : hiTempOpenMeteo;
  document.getElementById("hi-temp").innerHTML = hiTemp;

  // Format and display wind map timestamp
  const windMapTimestamp = new Date(data.windMapMeta.timeCreated).toLocaleString("en-US", { hour: "numeric", minute: "2-digit" }).toLowerCase();
  document.getElementById("wind-map-timestamp").innerHTML = `Wind Map @ ${windMapTimestamp}`;

  // Fetched data is not global but soundingData must be for D3 functions to work (Reset/Update)
  soundingData = data.sounding;

  processSounding(data.sounding, hiTemp);
  processWindAloft(data.openMeteo.hourly, data.windAloft);
  processAreaForecastPage(data.areaForecast);
  processGeneralForecast(data.nwsForecast.properties.periods);
  processSynoptic(data.synoptic.STATION);

  // For user settings
  buildMarqueeSettings();
  buildStationSettings();

  // Display all main pages last after nav slider setup
  document.getElementById("today-page").style.display = "block";
  document.getElementById("tomorrow-page").style.display = "block";
  document.getElementById("settings-page").style.display = "block";
  document.getElementById("misc-page").style.display = "block";
  document.getElementById("gps-page").style.display = "block";
  document.getElementById("cams-page").style.display = "block";
  document.getElementById("now-page").style.display = "block";
}



////////////////////////////////////////////////////////
// Display web images based on sunset time view logic //
////////////////////////////////////////////////////////
function displayImages(sunset) {
  // Only display the graphical wind & gust images between 7 am & 5 pm (period of relevancy)
  if (now.getHours() > 6 && now.getHours() < 18) {
    document.getElementById("surface-wind-today-img").src = "https://graphical.weather.gov/images/SLC/WindSpd4_utah.png";
    document.getElementById("surface-gust-today-img").src = "https://graphical.weather.gov/images/SLC/WindGust4_utah.png";
    document.getElementById("surface-wind-today-div").style.display = "block";
  } else if (now.getHours() > 19) {
    document.getElementById("surface-wind-tomorrow-img").src = "https://graphical.weather.gov/images/SLC/WindSpd8_utah.png";
    document.getElementById("surface-gust-tomorrow-img").src = "https://graphical.weather.gov/images/SLC/WindGust8_utah.png";
    document.getElementById("surface-wind-tomorrow-time").innerHTML = `Afternoon Surface Wind Forecast ${nextDay.slice(0,-1)}`;
    document.getElementById("surface-wind-tomorrow-div").style.display = "block";
  }

  // Display hourly wind chart on the Tomorrow page after sunset; otherwise display on the Today page
  if (now.getHours() >= sunset.getHours() - 1 && now.getHours() < 24) {
    document.getElementById("hourly-chart-tomorrow").src = "https://forecast.weather.gov/meteograms/Plotter.php?lat=40.7603&lon=-111.8882&wfo=SLC&zcode=UTZ105&gset=30&gdiff=10&unit=0&tinfo=MY7&ahour=0&pcmd=10001110100000000000000000000000000000000000000000000000000&lg=en&indu=1!1!1!&dd=&bw=&hrspan=48&pqpfhr=6&psnwhr=6";
    document.getElementById("hourly-chart-tomorrow-div").style.display = "block";
    document.getElementById("area-forecast-tomorrow-div").style.display = "block";
  } else {
    document.getElementById("hourly-chart-today").src = "https://forecast.weather.gov/meteograms/Plotter.php?lat=40.7603&lon=-111.8882&wfo=SLC&zcode=UTZ105&gset=30&gdiff=10&unit=0&tinfo=MY7&ahour=0&pcmd=10001110100000000000000000000000000000000000000000000000000&lg=en&indu=1!1!1!&dd=&bw=&hrspan=48&pqpfhr=6&psnwhr=6";
    document.getElementById("hourly-chart-today-div").style.display = "block";
    document.getElementById("area-forecast-today-div").style.display = "block";
  };

  // Display all remaining web hosted images
  document.getElementById("wind-map").src = "https://storage.googleapis.com/wasatch-wind-static/wind-map-save.png";
  document.getElementById("satellite-gif").src = "https://cdn.star.nesdis.noaa.gov/GOES18/ABI/SECTOR/psw/13/GOES18-PSW-13-600x600.gif";
  document.getElementById("cam-south").src = "https://horel.chpc.utah.edu/data/station_cameras/wbbs_cam/wbbs_cam_current.jpg";
  document.getElementById("cam-west").src = "https://cameraftpapi.drivehq.com/api/Camera/GetLastCameraImage.aspx?parentID=347695945&shareID=17138700";
  document.getElementById("cam-east").src = "https://cameraftpapi.drivehq.com/api/Camera/GetLastCameraImage.aspx?parentID=347464441&shareID=17137573";
}



//////////////////////////
// NWS General Forecast //
//////////////////////////
function processGeneralForecast(data) {
  const forecastDaysCount = 5;
  const isDaytime = data[0].isDaytime;
  let period = isDaytime ? 0 : 1;

  for (let i = 0; i < forecastDaysCount; i++) {
    let qualifier = "";
    let border = `<div class="border-bottom"></div>`;

    if (isDaytime && i === 0) {
      qualifier = "-today";
      border = "";
      document.getElementById("nws-today-div").style.display = "block";
    } else document.getElementById("nws-today-multiday-div").style.display = "block";

    const div = `
      <div class="d-flex">
        <div class="col-3">
          <div class="display-6 text-info">${data[period].name}</div>
          <img class="align-self-start rounded-4 w-100" src="${data[period].icon}">
        </div>
        <div class="col display-6 font-monospace ps-2 text-start">${data[period].detailedForecast}</div>
      </div>
    ${border}`;

    document.getElementById(`forecast-day${i}${qualifier}`).innerHTML = div;
    period += 2;
  }
}



///////////////
// Utilities //
///////////////

// Reload/refresh page
function reload() {
  history.scrollRestoration = "manual";
  location.reload();
}

// Build top marquee slider (default speed medium: 1000)
function buildMarquee() {
  const marqueeSpeed = localStorage.getItem("marquee") || 1000;
  const animation = { duration: marqueeSpeed, easing: (t) => t };
  const options = {
    loop: true,
    slides: { perView: 4 },
    created(m) { m.moveToIdx(1, true, animation) },
    updated(m) { m.moveToIdx(m.track.details.abs + 1, true, animation) },
    animationEnded(m) { m.moveToIdx(m.track.details.abs + 1, true, animation) }
  };
  const marquee = new KeenSlider("#marquee", options);
}

// Determine which navItem (page) is the default activeNav position based on sunset time
function navOrder(sunset) {
  const currentHour = now.getHours();
  const sunsetHour = new Date(sunset).getHours();

  if (currentHour >= 14 && currentHour <= sunsetHour - 1) slider.moveToIdx(navItems.length - 1, true, { duration: 0 });
  else if (currentHour >= sunsetHour - 1) slider.moveToIdx(1, true, { duration: 0 });
}

// Main body slider (nav pages)
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

  return new KeenSlider("#slider", options);
}

// Update nav with user input (swipe)
function navUpdate() {
  const left = activeNav === 0 ? navItems.length - 1 : activeNav - 1;
  const right = activeNav === navItems.length - 1 ? 0 : activeNav + 1;

  document.getElementById("topnav-left").innerHTML = navItems[left];
  document.getElementById("topnav-active").innerHTML = navItems[activeNav];
  document.getElementById("topnav-right").innerHTML = navItems[right];
}

// Update nav with user input (click)
window.simulateSwipe = function (direction) {
  if (direction === "left") slider.prev();
  else if (direction === "right") slider.next();
}

// Wind chart toggle for expand/collapse for each station (Now page)
function toggleWindChart(id) {
  const el = document.getElementById(id);
  const toggle = document.getElementById(`${id}-toggle`);
  const isHidden = el.classList.toggle("collapse");

  toggle.textContent = isHidden ? "+" : "−"; // Use minus sign instead of hyphen for spacing consistency
}

// Wind Aloft Forecast toggle current 6 hours and next 6 hours
function toggleWindAloft() {
  document.getElementById("wind-aloft-current6").classList.toggle("collapse");
  document.getElementById("wind-aloft-next6").classList.toggle("collapse");
}

// Marquee user settings options (possible speeds 4000, 1000, 500 / Slow, Medium, Fast)
function buildMarqueeSettings() {
  const marqueeSpeed = localStorage.getItem("marquee") || 1000;
  // const marqueeSpeed = getLocalStorage("marquee") || 1000;
  const speeds = [4000, 1000, 500];

  speeds.forEach(speed => {
    const element = document.getElementById(`marquee-${speed}`);
    element.className = "bg-dark border fw-normal px-4 rounded-5 py-2";
  });

  const activeElement = document.getElementById(`marquee-${marqueeSpeed}`);
  activeElement.className = "bg-success border fw-semibold px-4 rounded-5 py-2";
}

// Set cookie for marquee user settings speed (possible speeds 4000, 1000, 500 / Slow, Medium, Fast)
function marqueeSetSpeed(speed) {
  localStorage.setItem("marquee", speed);
  const speeds = [4000, 1000, 500];

  speeds.forEach(d => {
    const element = document.getElementById(`marquee-${d}`);
    element.className = "bg-dark border fw-normal px-4 rounded-5 py-2";
  });

  const activeElement = document.getElementById(`marquee-${speed}`);
  activeElement.className = "bg-success border fw-semibold px-4 rounded-5 py-2";

  buildMarquee(); // Puts new settings into immediate effect
}

// Build station settings toggle on/off list
// Independent of Synoptic time series data since stations may be temporarily down
// To add/remove stations:
// * Update hardcoded stationList on global.js (alphabetical by station label)
// * Update hardcoded lists in index.html (stations displayed and station show/hide in user settings)
function buildStationSettings() {
  Object.entries(stationList).forEach(([stid, station]) => {
    const container = document.getElementById(`${stid}-onoff`);
    container.innerHTML = `
      <div class="align-items-center border-bottom display-5 d-flex justify-content-around py-4">
        <div class="col-5 display-3 text-info text-start">${station.name}</div>
        <div id="${stid}-on" onclick="stationSetToggle('${stid}', 'on')">On</div>
        <div id="${stid}-off" onclick="stationSetToggle('${stid}', 'off')">Off</div>
      </div>
    `;

    const state = localStorage.getItem(stid) || "on";
    stationSetToggle(stid, state);
  });
}

// Onclick function to toggle stations settings on/off
function stationSetToggle(stid, state) {
  localStorage.setItem(stid, state)

  const mainEl = document.getElementById(`${stid}-main`);
  const on = document.getElementById(`${stid}-on`);
  const off = document.getElementById(`${stid}-off`);

  mainEl.style.display = state === "on" ? "block" : "none";
  on.className = state === "on" ? "bg-success border fw-semibold px-4 rounded-5 py-2" : "bg-dark border fw-normal px-4 rounded-5 py-2";
  off.className = state === "off" ? "bg-success border fw-semibold px-4 rounded-5 py-2" : "bg-dark border fw-normal px-4 rounded-5 py-2";
}

// D3 utilities
function d3Update() {
  let userLiftParams;
  document.getElementById("out-of-range").style.display = "none";
  const userTemp = parseInt(document.getElementById("user-temp").value);
  if (!userTemp) return;

  try {
    userLiftParams = getLiftParams(soundingData, userTemp);
  } catch {
    outOfRange(userTemp);
    return;
  };

  if ((userLiftParams.tolTemp * 9 / 5) + 32 < -10 || !userLiftParams.tol) outOfRange(userTemp);
  else {
    clearChart();
    drawDALRParams(userTemp, userLiftParams);
  };
};

function outOfRange(userTemp) {
  document.getElementById("out-of-range").innerHTML = `Error: parameters out of range for ${userTemp}&deg;`;
  document.getElementById("out-of-range").style.display = "block";
  document.getElementById("user-temp").value = null;
  return;
};

function d3Clear() {
  document.getElementById("out-of-range").style.display = "none";
  clearChart();
  drawDALRParams(hiTemp, liftParams);
};

function clearChart() {
  document.getElementById("user-temp").value = null;
  svg.select("line.dalrline").remove();
  svg.select("line.neg3line").remove();
  svg.selectAll("text.liftlabels").remove();
  svg.selectAll("text.liftheights").remove();
  svg.selectAll("text.white").remove();
  svg.select("circle.tolcircle").remove();
};