"use strict";

// Data source documentation:
// 1) Open Meteo API: https://open-meteo.com/en/docs/gfs-api
// 2) Synoptic API: https://docs.synopticdata.com/services/weather-api
// 3) NWS API: https://www.weather.gov/documentation/services-web-api
// 4) Keen Slider: https://keen-slider.io/docs

// Build app/page structure immediately before data populates for smooth loading
let slider = buildNavSlider(), activeNav = 0;
navUpdate();
buildMarquee();

function main(data) {
  console.log("All data", data)

  // Key dependency: sunset
  // Sets default nav order & when/where some components appear (Hourly Forecast Chart, Area Forecast Discussion)
  const sunset = new Date(data.openMeteo.daily.sunset[0]);
  navOrder(sunset);
  sunsetVisibilityLogic(sunset);
  document.getElementById("sunset").textContent = sunset.toLocaleString("en-us", { hour: "numeric", minute: "2-digit" }).slice(0, -3);

  // Key dependency: hiTemp, soundingData (global for D3 functions)
  // Needed to process the Morning Sounding Profile component
  const hiTempSoaringForecast = processSoaringForecastPage(data.soaringForecast.productText);
  const hiTempOpenMeteo = data.openMeteo.daily.temperature_2m_max[0];
  hiTemp = hiTempSoaringForecast ? hiTempSoaringForecast : hiTempOpenMeteo; // Primary source is SRG, Open Meteo as backup
  soundingData = data.sounding; // Global
  processSounding(soundingData, hiTemp);
  document.getElementById("hi-temp").textContent = hiTemp;

  // Process remaining fetched data
  processWindAloft(data.openMeteo.hourly, data.windAloft6, data.windAloft12, data.windAloft24);
  processAreaForecastPage(data.areaForecast.productText);
  processGeneralForecast(data.generalForecast.properties.periods);
  processSynoptic(data.synopticTimeseries.STATION);
  const windMapTimestamp = new Date(data.windMapScreenshotMetadata.timeCreated).toLocaleString("en-US", { hour: "numeric", minute: "2-digit" }).toLowerCase();
  document.getElementById("wind-map-timestamp").textContent = `Wind Map @ ${windMapTimestamp}`;

  // Set up User Settings page
  buildMarqueeSettings();
  buildStationSettings();

  // Display all remaining web-accessed images
  displayImages();

  // Display all main pages last for smooth appearance/loading
  document.getElementById("spinner").style.display = "none"; // Hide the loading spinner
  const pages = ["today-page", "tomorrow-page", "settings-page", "misc-page", "gps-page", "cams-page", "now-page"];
  pages.forEach(page => {
    const el = document.getElementById(page);
    el.style.display = "block";
  });
}



//////////////////////////////////////////////////////////////////////////////////////////
// Sunset-based visibility logic for Hourly Forecast Chart and Area Forecast Discussion //
//////////////////////////////////////////////////////////////////////////////////////////
function sunsetVisibilityLogic(sunset) {
  const hourlyChartUrl = "https://forecast.weather.gov/meteograms/Plotter.php?lat=40.7603&lon=-111.8882&wfo=SLC&zcode=UTZ105&gset=30&gdiff=10&unit=0&tinfo=MY7&ahour=0&pcmd=10001110100000000000000000000000000000000000000000000000000&lg=en&indu=1!1!1!&dd=&bw=&hrspan=48&pqpfhr=6&psnwhr=6";
  const isAfterSunset = now.getHours() >= sunset.getHours() - 1;
  const displayBlock = isAfterSunset ? "tomorrow" : "today";

  document.getElementById(`hourly-chart-${displayBlock}`).src = hourlyChartUrl;
  document.getElementById(`hourly-chart-${displayBlock}-div`).style.display = "block";
  document.getElementById(`area-forecast-${displayBlock}-div`).style.display = "block";
}



///////////////////////////////////////////////
// Display all remaining web accessed images //
///////////////////////////////////////////////
function displayImages() {

  // Afternoon Surface Wind Forecast
  const currentHour = now.getHours();
  if (currentHour < 7) return;

  const isDay = currentHour < 19;
  const displayFactors = isDay ? { day: "today", graph: 4 } : { day: "tomorrow", graph: 8 }
  const windEl = document.getElementById(`surface-wind-${displayFactors.day}-img`);
  const gustEl = document.getElementById(`surface-gust-${displayFactors.day}-img`);

  windEl.src = `https://graphical.weather.gov/images/SLC/WindSpd${displayFactors.graph}_utah.png`;
  gustEl.src = `https://graphical.weather.gov/images/SLC/WindGust${displayFactors.graph}_utah.png`;
  document.getElementById(`surface-wind-${displayFactors.day}-div`).style.display = "block";
  if (!isDay) document.getElementById("surface-wind-tomorrow-time").textContent = `Afternoon Surface Wind Forecast ${nextDay}`;

  // Display all remaining web-accessed images (Wind Map screenshot, Satellite, Cams)
  document.getElementById("wind-map").src = "https://storage.googleapis.com/wasatch-wind-static/wind-map-save.png";
  document.getElementById("satellite-gif").src = "https://cdn.star.nesdis.noaa.gov/GOES18/ABI/SECTOR/psw/13/GOES18-PSW-13-600x600.gif";
  document.getElementById("cam-south").src = "https://horel.chpc.utah.edu/data/station_cameras/wbbs_cam/wbbs_cam_current.jpg";
  document.getElementById("cam-west").src = "https://cameraftpapi.drivehq.com/api/Camera/GetLastCameraImage.aspx?parentID=347695945&shareID=17138700";
  document.getElementById("cam-east").src = "https://cameraftpapi.drivehq.com/api/Camera/GetLastCameraImage.aspx?parentID=347464441&shareID=17137573";
}



///////////////
// Utilities //
///////////////
function reload() {
  history.scrollRestoration = "manual";
  location.reload();
}

function buildMarquee() { // Set up core app structure
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

function buildNavSlider() { // Set up core app structure
  const options = {
    loop: true,
    slides: { perView: 1 },
    slideChanged: () => {
      activeNav = slider.track.details.rel;
      navUpdate();
      window.scrollTo(0, 0);
    }
  };
  return new KeenSlider("#slider", options);
}

function navOrder(sunset) { // Determine which navItem (page) is the default activeNav position based on sunset time
  const currentHour = now.getHours();
  const sunsetHour = new Date(sunset).getHours();

  if (currentHour >= 14 && currentHour <= sunsetHour - 1) slider.moveToIdx(navItems.length - 1, true, { duration: 0 });
  else if (currentHour >= sunsetHour - 1) slider.moveToIdx(1, true, { duration: 0 });
}

function navUpdate() { // Update nav slider/page based on time of day or user input (touch/drag swipe)
  const left = activeNav === 0 ? navItems.length - 1 : activeNav - 1;
  const right = activeNav === navItems.length - 1 ? 0 : activeNav + 1;

  document.getElementById("topnav-left").textContent = navItems[left];
  document.getElementById("topnav-active").textContent = navItems[activeNav];
  document.getElementById("topnav-right").textContent = navItems[right];
}

window.simulateSwipe = function (direction) { // Update nav slider/page with user input (click)
  if (direction === "left") slider.prev();
  else if (direction === "right") slider.next();
}

function toggleWindChart(id) { // Wind chart toggle expand/collapse for each station (Now page)
  const el = document.getElementById(id);
  const toggle = document.getElementById(`${id}-toggle`);
  const isHidden = el.classList.toggle("collapse");

  toggle.textContent = isHidden ? "+" : "−"; // Use minus sign instead of hyphen for spacing consistency
}

function toggleWindAloft() { // Wind Aloft Forecast toggle Next 6/Previous 6 hours
  document.getElementById("wind-aloft-current6").classList.toggle("collapse");
  document.getElementById("wind-aloft-next6").classList.toggle("collapse");
}

function windSpeedColor(speeds, altitude) { // Returns wind speed color/s based on altitude (array returns array, single speed likewise)
  const isArray = Array.isArray(speeds);
  speeds = isArray ? speeds : [speeds];

  const thresholds = altitude < 8 ? [10, 15, 20] : [altitude + 4, altitude + 10, altitude + 16];
  const colors = speeds.map(speed => {
    if (speed <= thresholds[0]) return green;
    if (speed <= thresholds[1]) return yellow;
    if (speed <= thresholds[2]) return orange;
    return red;
  });

  return isArray ? colors : colors[0];
}




////////////////////////
// User settings page //
////////////////////////
function buildMarqueeSettings() { // Marquee user settings options (possible speeds 4000, 1000, 500 / Slow, Medium, Fast)
  const marqueeSpeed = localStorage.getItem("marquee") || marqueeSpeeds[1];

  marqueeSpeeds.forEach(speed => {
    const element = document.getElementById(`marquee-${speed}`);
    element.className = "bg-dark border fw-normal px-4 rounded-5 py-2";
  });

  const activeElement = document.getElementById(`marquee-${marqueeSpeed}`);
  activeElement.className = "bg-success border fw-semibold px-4 rounded-5 py-2";
}

function marqueeSetSpeed(speed) { // Marquee user settings speed (possible speeds 4000, 1000, 500 / Slow, Medium, Fast)
  localStorage.setItem("marquee", speed);

  marqueeSpeeds.forEach(d => {
    const element = document.getElementById(`marquee-${d}`);
    element.className = "bg-dark border fw-normal px-4 rounded-5 py-2";
  });

  const activeElement = document.getElementById(`marquee-${speed}`);
  activeElement.className = "bg-success border fw-semibold px-4 rounded-5 py-2";

  buildMarquee(); // Puts new settings into immediate effect
}

function buildStationSettings() { // Build station settings toggle on/off list
  Object.entries(stationList).forEach(([stid, station]) => {
    const container = document.getElementById(`${stid}-onoff`);
    container.innerHTML = `
      <div class="align-items-center border-bottom display-5 d-flex justify-content-around py-4">
        <div class="col-5 display-3 text-info text-start">${station.name}</div>
        <div id="${stid}-on" onclick="stationSetToggle('${stid}', 'on')">On</div>
        <div id="${stid}-off" onclick="stationSetToggle('${stid}', 'off')">Off</div>
      </div>`;

    const state = localStorage.getItem(stid) || "on"; // Default to "on"
    stationSetToggle(stid, state);
  });
}

function stationSetToggle(stid, state) { // Onclick function to toggle stations settings on/off
  localStorage.setItem(stid, state)

  const mainEl = document.getElementById(`${stid}-main`);
  const on = document.getElementById(`${stid}-on`);
  const off = document.getElementById(`${stid}-off`);

  mainEl.style.display = state === "on" ? "block" : "none";
  on.className = state === "on" ? "bg-success border fw-semibold px-4 rounded-5 py-2" : "bg-dark border fw-normal px-4 rounded-5 py-2";
  off.className = state === "off" ? "bg-danger border fw-semibold px-4 rounded-5 py-2" : "bg-dark border fw-normal px-4 rounded-5 py-2";
}



//////////////////
// D3 utilities //
//////////////////
function d3Update() {
  let userLiftParams;
  document.getElementById("out-of-range").style.display = "none";
  const userTemp = parseInt(document.getElementById("user-temp").value);
  if (!userTemp) return;

  try { userLiftParams = getLiftParams(soundingData, userTemp); }
  catch {
    d3OutOfRange(userTemp);
    return;
  };

  if ((userLiftParams.tolTemp * 9 / 5) + 32 < -10 || !userLiftParams.tol) d3OutOfRange(userTemp);
  else d3Clear(userTemp, userLiftParams);
};

function d3OutOfRange(userTemp) {
  document.getElementById("out-of-range").textContent = `Error: parameters out of range for ${userTemp}°`;
  document.getElementById("out-of-range").style.display = "block";
  document.getElementById("user-temp").value = null;
  return;
};

function d3Clear(temp, params) {
  if (!temp) temp = hiTemp; // d3Clear can be triggered from HTML without params so set to global defaults if null
  if (!params) params = liftParams;

  document.getElementById("user-temp").value = null;
  document.getElementById("out-of-range").style.display = "none";

  const chartElements = ["line.dalrline", "line.neg3line", "text.liftlabels", "text.liftheights", "text.white", "circle.tolcircle"];
  chartElements.forEach(element => {
    svg.selectAll(element).remove();
  });

  drawDALRParams(temp, params);
};