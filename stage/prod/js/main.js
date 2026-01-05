"use strict";

// Dependencies:
// 1) sunset: determines the default order of nav items and some display logic (from openMeteo)
// 2) hiTemp: needed for the Morning Sounding Profile component (from openMeto and soaringForecast)

// Documentation:
// 1) Open Meteo API: https://open-meteo.com/en/docs/gfs-api
// 2) Synoptic API: https://docs.synopticdata.com/services/weather-api
// 3) NWS API: https://www.weather.gov/documentation/services-web-api
// 4) Keen Slider: https://keen-slider.io/docs

// Build Marquee asap so it isn't static while everything else loads
buildMarquee();

function main(data) {
  console.log(data);

  // Set up top marquee and main body nav structure (Keen Slider)
  // buildMarquee();
  slider = buildNavSlider();
  navUpdate();

  // Get sunset and set default nav order (varies based on sunset time)
  const sunset = new Date(data.openMeteo.daily.sunset[0]);
  navOrder(sunset);
  const sunsetFormatted = sunset.toLocaleString("en-us", { hour: "numeric", minute: "2-digit" }).slice(0, -3);
  document.getElementById("sunset").innerHTML = sunsetFormatted;

  // Get hiTemp options from openMeteo and soaringForecast
  const hiTempOpenMeteo = data.openMeteo.daily.temperature_2m_max[0];
  const hiTempSoaringForecast = processSoaringForecastPage(data.soaringForecast);
  hiTemp = hiTempSoaringForecast ? hiTempSoaringForecast : hiTempOpenMeteo;
  document.getElementById("hi-temp").innerHTML = hiTemp;

  // Format and display wind map timestamp
  const windMapTimestamp = new Date(data.windMapMeta.timeCreated).toLocaleString("en-US", { hour: "numeric", minute: "2-digit" }).toLowerCase();
  document.getElementById("wind-map-timestamp").innerHTML = `Wind Map @ ${windMapTimestamp}`;

  // data is not global but soundingData must be for D3 functions to work
  soundingData = data.sounding;

  processSounding(data.sounding, hiTemp);
  processWindAloft(data.openMeteo.hourly, data.windAloft);
  processAreaForecastPage(data.areaForecast);
  processGeneralForecast(data.nwsForecast.properties.periods);
  processSynoptic(data.synoptic.STATION);

  buildMarqueeSettings();
  buildStationSettings();

  // Display all main pages last
  document.getElementById("today-page").style.display = "block";
  document.getElementById("tomorrow-page").style.display = "block";
  document.getElementById("settings-page").style.display = "block";
  document.getElementById("misc-page").style.display = "block";
  document.getElementById("gps-page").style.display = "block";
  document.getElementById("cams-page").style.display = "block";
  document.getElementById("now-page").style.display = "block";
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
    } else {
      document.getElementById("nws-today-multiday-div").style.display = "block";
    }
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
  document.getElementById("nws-multiday-div").style.display = "block"; // Display "Days Ahead" block
}



////////////////////////////////////////////////////////
// Display web images based on sunset time view logic //
////////////////////////////////////////////////////////
function displayImages(sunset) {
  sunset = new Date(sunset);

  if (now.getHours() >= 6 && now.getHours() < 18) {
    document.getElementById("surface-wind-img").src = "https://graphical.weather.gov/images/SLC/WindSpd4_utah.png";
    document.getElementById("surface-gust-img").src = "https://graphical.weather.gov/images/SLC/WindGust4_utah.png";
    document.getElementById("surface-wind-div").style.display = "block";
  };

  if (now.getHours() >= sunset.getHours() - 1 && now.getHours() < 24) {
    document.getElementById("hourly-chart-tomorrow").src = "https://forecast.weather.gov/meteograms/Plotter.php?lat=40.7603&lon=-111.8882&wfo=SLC&zcode=UTZ105&gset=30&gdiff=10&unit=0&tinfo=MY7&ahour=0&pcmd=10001110100000000000000000000000000000000000000000000000000&lg=en&indu=1!1!1!&dd=&bw=&hrspan=48&pqpfhr=6&psnwhr=6";
    document.getElementById("hourly-chart-tomorrow-div").style.display = "block";
  } else {
    document.getElementById("hourly-chart-today").src = "https://forecast.weather.gov/meteograms/Plotter.php?lat=40.7603&lon=-111.8882&wfo=SLC&zcode=UTZ105&gset=30&gdiff=10&unit=0&tinfo=MY7&ahour=0&pcmd=10001110100000000000000000000000000000000000000000000000000&lg=en&indu=1!1!1!&dd=&bw=&hrspan=48&pqpfhr=6&psnwhr=6";
    document.getElementById("hourly-chart-today-div").style.display = "block";
  };

  document.getElementById("wind-map").src = "https://storage.googleapis.com/wasatch-wind-static/wind-map-save.png";
  document.getElementById("satellite-gif").src = "https://cdn.star.nesdis.noaa.gov/GOES18/ABI/SECTOR/psw/13/GOES18-PSW-13-600x600.gif";
  document.getElementById("cam-south").src = "https://horel.chpc.utah.edu/data/station_cameras/wbbs_cam/wbbs_cam_current.jpg";
  document.getElementById("cam-west").src = "https://cameraftpapi.drivehq.com/api/Camera/GetLastCameraImage.aspx?parentID=347695945&shareID=17138700";
  document.getElementById("cam-east").src = "https://cameraftpapi.drivehq.com/api/Camera/GetLastCameraImage.aspx?parentID=347464441&shareID=17137573";
}



///////////////
// Utilities //
///////////////
// Reload/refresh page
function reload() {
  history.scrollRestoration = "manual";
  location.reload();
}

// Get cookies for user settings
function getCookie(name) {
  const decodedCookie = decodeURIComponent(document.cookie);
  const cookies = decodedCookie.split("; ");
  for (const cookie of cookies) {
    const [cookieName, cookieValue] = cookie.split("=");
    if (cookieName === name) {
      return cookieValue;
    }
  }
  return null;
}

// Build top marquee slider
function buildMarquee() {
  const marqueeSpeed = getCookie("marqueeSpeed") || 1000;
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
  if (currentHour >= 14 && currentHour <= sunsetHour - 1) {
    slider.moveToIdx(navItems.length - 1, true, { duration: 0 });
  }
  else if (currentHour >= sunsetHour - 1) {
    slider.moveToIdx(1, true, { duration: 0 });
  }
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

// Wind chart toggle for expand/collapse
function toggleWindChart(div) {
  const element = document.getElementById(div);
  const toggleElement = document.getElementById(`${div}-toggle`);
  const isHidden = element.style.display === '' || element.style.display === 'none';

  element.style.display = isHidden ? 'block' : 'none';
  toggleElement.innerHTML = isHidden ? '&#8722;' : '&#43;';
}

// Wind Aloft Forecast toggle current 6 hours and next 6 hours
function toggleWindAloft() {
  document.getElementById("wind-aloft-current6").classList.toggle("collapse");
  document.getElementById("wind-aloft-next6").classList.toggle("collapse");
}

// Marquee setup
function buildMarqueeSettings() {
  const marqueeSpeed = getCookie("marqueeSpeed") || 1000;
  const speeds = [4000, 1000, 500];
  speeds.forEach(speed => {
    const element = document.getElementById(`marquee-${speed}`);
    element.className = "bg-dark border fw-normal px-4 rounded-5 py-2";
  });
  const activeElement = document.getElementById(`marquee-${marqueeSpeed}`);
  activeElement.className = "bg-success border fw-semibold px-4 rounded-5 py-2";
}

// Marquee speed
function marqueeSetSpeed(speed) {
  document.cookie = `marqueeSpeed=${speed}; max-age=31536000; path=/`;
  const speeds = [4000, 1000, 500];
  speeds.forEach(d => {
    const element = document.getElementById(`marquee-${d}`);
    element.className = "bg-dark border fw-normal px-4 rounded-5 py-2";
  });
  const activeElement = document.getElementById(`marquee-${speed}`);
  activeElement.className = "bg-success border fw-semibold px-4 rounded-5 py-2";
  buildMarquee();
}

// Build station settings toggle on/off list; independent of timeseries.js data since stations may be temporarily down
// Hardcoded list must be updated here and index.html for added/removed stations (alphabetical order by name)
function buildStationSettings() {

  // Loop through each station to set up html divs, check for cookies, and label on/off accordingly
  for (const key in stationList) {
    const div = `
    <div class="align-items-center border-bottom display-5 d-flex justify-content-around py-4">
      <div class="col-5 display-3 text-info text-start">${stationList[key].name}</div>
      <div id="${key}=on" onclick="stationSetToggle('${key}=on')">On</div>
      <div id="${key}=off" onclick="stationSetToggle('${key}=off')">Off</div>
    </div>`;
    document.getElementById(`${key}-onoff`).innerHTML = div;

    const status = getCookie(key) || "on";
    const on = document.getElementById(`${key}=on`);
    const off = document.getElementById(`${key}=off`);

    if (status === 'on') {
      on.className = 'bg-success border fw-semibold px-4 rounded-5 py-2';
      off.className = 'bg-dark border fw-normal px-4 rounded-5 py-2';
    } else {
      on.className = 'bg-dark border fw-normal px-4 rounded-5 py-2';
      off.className = 'bg-success border fw-semibold px-4 rounded-5 py-2';
    }
  }
}

// Onclick function to toggle stations settings on/off
function stationSetToggle(stid) {
  document.cookie = `${stid}; max-age=31536000; path=/`; // Set/update cookie

  const element = document.getElementById(stid);
  const [station, status] = stid.split("=");
  const oppositeStatus = status === "off" ? "on" : "off";
  const oppositeElement = document.getElementById(`${station}=${oppositeStatus}`);
  const mainElement = document.getElementById(`${station}-main`);

  element.className = "bg-success border fw-semibold px-4 rounded-5 py-2";
  oppositeElement.className = "bg-dark border fw-normal px-4 rounded-5 py-2";
  mainElement.style.display = status === "off" ? "none" : "block";
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