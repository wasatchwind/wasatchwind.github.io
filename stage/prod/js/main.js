"use strict";

// Data source documentation:
// 1) Open Meteo API: https://open-meteo.com/en/docs/gfs-api
// 2) Synoptic API: https://docs.synopticdata.com/services/weather-api
// 3) NWS API: https://www.weather.gov/documentation/services-web-api
// 4) Keen Slider: https://keen-slider.io/docs

// Process fetched data and web-accessed images
function main(data) {
  console.log("All data", data)
  MarqueeController.init();

  // Handle dependencies
  // 1) Sunset time affects default nav order & when/where some components appear (Hourly Forecast Chart, Area Forecast Discussion)
  // 2) Wind Map timestamp
  // 3) hiTemp: Global variable forecast high temp needed to build the Morning Sounding Profile
  // 4) soundingData: Global variable (for updating/resetting the Morning Sounding Profile based on user input)
  const currentHour = new Date().getHours();
  const nextDay = new Date(new Date().setDate(new Date().getDate() + 1)).toLocaleDateString("en-US", { weekday: "short" });
  const navItems = ["Today", `${nextDay}+`, "Settings", "Misc.", "GPS", "Cams", "Now"];
  const sunset = new Date(data.openMeteo.daily.sunset[0]);
  const windMapTimestamp = new Date(data.windMapScreenshotMetadata.timeCreated);
  const hiTempSoaringForecast = processSoaringForecastPage(data.soaringForecast.productText);
  const hiTempOpenMeteo = Math.round(data.openMeteo.daily.temperature_2m_max[0]);
  global.hiTemp = hiTempSoaringForecast ? hiTempSoaringForecast : hiTempOpenMeteo; // Primary source is SRG with Open Meteo for backup
  global.soundingData = data.sounding;

  global.slider = buildNavSlider(0, navItems);

  // Update activeNav: 2pm - sunset = Now; after sunset = Tomorrow
  if (currentHour >= 14 && currentHour <= sunset.getHours() - 1) global.slider.moveToIdx(navItems.length - 1, true, { duration: 0 });
  else if (currentHour >= sunset.getHours() - 1) global.slider.moveToIdx(1, true, { duration: 0 });


  // Process remaining fetched data
  processAreaForecastPageAndSunset(data.areaForecast.productText, sunset);                      // nws-api.js
  processSounding(global.soundingData, global.hiTemp);                                          // sounding.js
  processWindAloft(data.openMeteo.hourly, data.windAloft6, data.windAloft12, data.windAloft24); // wind-aloft.js
  processGeneralForecast(data.generalForecast.properties.periods);                              // nws-api.js
  processSynoptic(data.synopticTimeseries.STATION);                                             // synoptic.js

  // Build User Settings page
  buildStationSettings();

  // Display all remaining web-accessed images
  displayConditionalImages(sunset);
  displayPersistentImages(windMapTimestamp);

  // Populate sunset & high temp in the marquee and hide the loading spinner
  document.getElementById("sunset").textContent = sunset.toLocaleString("en-us", { hour: "numeric", minute: "2-digit" }).slice(0, -3);
  document.getElementById("hi-temp").textContent = global.hiTemp;
  document.getElementById("spinner").style.display = "none";

  // Display marquee and nav pages last for smooth loading
  const pageIds = ["today-page", "tomorrow-page", "settings-page", "misc-page", "gps-page", "cams-page", "now-page"];

  pageIds.forEach(page => {
    const element = document.getElementById(page);
    element.style.display = "block";
  });
}



////////////////////////
// Marquee Controller //
////////////////////////
const MarqueeController = (() => {
  const speeds = [
    { label: "Slow", value: 4000 },
    { label: "Medium", value: 1000 },
    { label: "Fast", value: 500 }
  ];

  let currentSpeed = Number(localStorage.getItem("marquee")) || speeds[1].value;
  const container = document.getElementById("marquee-settings");
  const options = {
    loop: true,
    slides: { perView: 4 },
    created(m) { m.moveToIdx(1, true, { duration: currentSpeed, easing: t => t }); },
    updated(m) { m.moveToIdx(m.track.details.abs + 1, true, { duration: currentSpeed, easing: t => t }); },
    animationEnded(m) { m.moveToIdx(m.track.details.abs + 1, true, { duration: currentSpeed, easing: t => t }); }
  };

  const marquee = new KeenSlider("#marquee", options);

  function setSpeed(speed) {
    currentSpeed = speed;
    localStorage.setItem("marquee", speed);
    const abs = marquee.track.details.abs;
    marquee.moveToIdx(abs + 1, true, { duration: currentSpeed, easing: t => t });
    updateUI(speed);
  }

  function updateUI(activeSpeed) {
    document.querySelectorAll(".marquee-speed").forEach(btn => {
      btn.className = "marquee-speed bg-dark border fw-normal px-4 rounded-5 py-2";
    });

    const activeBtn = container.querySelector(`[data-speed="${activeSpeed}"]`);
    if (activeBtn) activeBtn.className = "marquee-speed bg-success border fw-semibold px-4 rounded-5 py-2";
  }

  function buildSettingsUI() {
    container.innerHTML = "";

    speeds.forEach(speed => {
      const btn = document.createElement("div");
      btn.textContent = speed.label;
      btn.dataset.speed = speed.value;
      btn.className = "marquee-speed bg-dark border fw-normal px-4 rounded-5 py-2";
      btn.addEventListener("click", () => {
        setSpeed(speed.value);
      });

      container.appendChild(btn);
    });

    updateUI(currentSpeed);
  }

  return { init: buildSettingsUI, setSpeed };
})();



///////////////////////////////////////////////
// Display all remaining web-accessed images //
///////////////////////////////////////////////
function displayConditionalImages(sunset) { // Afternoon Surface Wind Forecast
  const currentHour = new Date().getHours();
  if (currentHour < 7) return;

  const isToday = currentHour < sunset.getHours();
  const displayFactors = isToday ? { day: "today", graph: 4 } : { day: "tomorrow", graph: 8 }
  const nextDay = !isToday ? ` ${new Date(new Date().setDate(new Date().getDate() + 1)).toLocaleDateString("en-US", { weekday: "short" })}` : "";
  const windImg = `https://graphical.weather.gov/images/SLC/WindSpd${displayFactors.graph}_utah.png`;
  const gustImg = `https://graphical.weather.gov/images/SLC/WindGust${displayFactors.graph}_utah.png`;

  document.getElementById(`surface-wind-${displayFactors.day}-div`).innerHTML = `
    <div class="mb-4">
      <a href="https://graphical.weather.gov/sectors/slc.php#tabs" target="_blank">
        <div class="display-3 text-info">Afternoon Surface Wind Forecast${nextDay}</div>
        <div class="d-flex fs-1 justify-content-center text-info">
          <div class="col-6">Wind</div>
          <div class="col-6">Gust</div>
        </div>
        <div class="d-flex">
          <img class="rounded-4 col-6 pe-1" loading="lazy" src="${windImg}">
          <img class="rounded-4 col-6 ps-1" loading="lazy" src="${gustImg}">
        </div>
      </a>
    </div>`
}

function displayPersistentImages(windMapTimestamp) { // Images independent of conditional parameters (sunset, currnet hour)
  const imagesToDisplay = [
    {
      elementId: "wind-map",
      href: "https://www.weather.gov/wrh/hazards?&zoom=10&scroll_zoom=false&center=40.70,-111.50&obs=true&obs_type=weather&elements=wind,gust&fontsize=4&obs_density=3",
      isImg: true,
      isVisible: true,
      src: "https://storage.googleapis.com/wasatch-wind-static/wind-map-save.png",
      title: `Wind Map @ ${windMapTimestamp.toLocaleString("en-US", { hour: "numeric", minute: "2-digit" }).toLowerCase()}`
    }, {
      elementId: "satellite-gif",
      href: "https://www.star.nesdis.noaa.gov/goes/sector.php?sat=G17&sector=psw",
      isImg: true,
      isVisible: true,
      src: "https://cdn.star.nesdis.noaa.gov/GOES18/ABI/SECTOR/psw/13/GOES18-PSW-13-600x600.gif",
      title: "Satellite Last 4 Hours"
    }, {
      elementId: "uhgpga-flying-sites",
      href: "https://www.uhgpga.org/flying-sites",
      isImg: true,
      isVisible: true,
      src: "prod/images/UHGPGAflyingsites.png",
      title: "UHGPGA Flying Sites"
    }, {
      elementId: "hike-fly",
      href: "https://www.hikeandfly.org/?lat=40.62020704520565&lng=-111.90364837646486&zoom=11",
      isImg: true,
      isVisible: true,
      src: "prod/images/hikeandfly.png",
      title: "Hike & Fly Calculator"
    }, {
      elementId: "ambrose-pressure-zone-chart",
      href: null,
      isImg: true,
      isVisible: true,
      src: "prod/images/zonechart.jpg",
      title: "Zone (Ambrose Pressure Zone)"
    }, {
      elementId: "cam-east",
      href: "https://www.weather.gov/slc/cameras",
      isImg: true,
      isVisible: true,
      src: "https://cameraftpapi.drivehq.com/api/Camera/GetLastCameraImage.aspx?parentID=347464441&shareID=17137573",
      title: "Daybreak looking East"
    }, {
      elementId: "cam-southeast",
      href: "https://horel.chpc.utah.edu/data/station_cameras/armstrong_cam/",
      isImg: true,
      isVisible: true,
      src: "https://horel.chpc.utah.edu/data/station_cameras/armstrong_cam/armstrong_cam_current.jpg",
      title: "West Valley looking Southeast"
    }, {
      elementId: "cam-south",
      href: "https://horel.chpc.utah.edu/data/station_cameras/wbbs_cam/",
      isImg: true,
      isVisible: true,
      src: "https://horel.chpc.utah.edu/data/station_cameras/wbbs_cam/wbbs_cam_current.jpg",
      title: "U of U looking South"
    }, {
      elementId: "cam-southwest",
      href: "https://www.weather.gov/slc/cameras",
      isImg: true,
      isVisible: true,
      src: "https://cameraftpapi.drivehq.com/api/Camera/GetLastCameraImage.aspx?parentID=347695945&shareID=17138700",
      title: "Daybreak looking Southwest"
    }, {
      elementId: "cam-southwest2",
      href: "https://horel.chpc.utah.edu/data/station_cameras/ulssb_cam/",
      isImg: true,
      isVisible: true,
      src: "https://horel.chpc.utah.edu/data/station_cameras/ulssb_cam/ulssb_cam_current.jpg",
      title: "U of U looking Southwest"
    }, {
      elementId: "cam-west",
      href: "https://www.weather.gov/slc/cameras",
      isImg: true,
      isVisible: true,
      src: "https://images-webcams.windy.com/00/1367462800/current/full/1367462800.jpg",
      title: "West Valley looking West"
    }, {
      elementId: "cam-west2",
      href: "https://horel.chpc.utah.edu/data/station_cameras/wbbw_cam/",
      isImg: true,
      isVisible: true,
      src: "https://horel.chpc.utah.edu/data/station_cameras/wbbw_cam/wbbw_cam_current.jpg",
      title: "U of U looking West"
    }
  ];

  imagesToDisplay.forEach(image => {
    standardHtmlComponent(image);
  });
}



///////////////
// Utilities //
///////////////
function reload() {
  history.scrollRestoration = "manual";
  location.reload();
}

function buildNavSlider(activeNav, navItems) { // Set up nav swipe/scroll slider
  const options = {
    loop: true,
    slides: { perView: 1 },
    slideChanged: () => {
      activeNav = global.slider.track.details.rel;
      navUpdate(activeNav, navItems);
      window.scrollTo(0, 0);
    }
  };
  navUpdate(activeNav, navItems); // Necessary here to ensure initial page titles are displayed on first load
  return new KeenSlider("#slider", options);
}

function navUpdate(activeNav, navItems) { // Update nav slider/page based on time of day or user input (touch/drag swipe)
  const left = activeNav === 0 ? navItems.length - 1 : activeNav - 1;
  const right = activeNav === navItems.length - 1 ? 0 : activeNav + 1;

  document.getElementById("topnav-left").textContent = navItems[left];
  document.getElementById("topnav-active").textContent = navItems[activeNav];
  document.getElementById("topnav-right").textContent = navItems[right];
}

window.simulateSwipe = function (direction) { // Update nav slider/page with user input (click)
  if (direction === "left") global.slider.prev();
  else if (direction === "right") global.slider.next();
}

function toggleWindChart(id) { // Wind chart toggle expand/collapse for each station (Now page)
  const element = document.getElementById(id);
  const toggle = document.getElementById(`${id}-toggle`);
  const isHidden = element.classList.toggle("collapse");

  toggle.textContent = isHidden ? "+" : "−"; // Use minus sign instead of hyphen for spacing consistency
}

function toggleWindAloft() { // Wind Aloft Forecast toggle Next 6/Previous 6 hours
  document.getElementById("wind-aloft-current6").classList.toggle("collapse");
  document.getElementById("wind-aloft-next6").classList.toggle("collapse");
}

function standardHtmlComponent(params) { // Build HTML divs by elementId where the basic structure is the same
  const display = params.isVisible ? "" : "collapse";
  const link = params.href
    ? { hrefLine: `<a href="${params.href}" target="_blank">`, closure: "</a>" }
    : { hrefLine: "", closure: "" };

  const imgOrDiv = params.isImg
    ? `<img class="rounded-4 w-100" loading="lazy" src="${params.src}">`
    : `<div class="bg-dark border display-6 font-monospace ps-2 rounded-4 text-start">${params.src}</div>`;

  document.getElementById(`${params.elementId}-div`).innerHTML = `
    <div class="${display} mb-4" id="${params.elementId}-div">
      ${link.hrefLine}
        <div class="display-3 text-info">${params.title}</div>
        ${imgOrDiv}
      ${link.closure}
    </div>`;
}

function windSpeedColor(speeds, altitude) { // Returns wind speed color/s based on altitude (array returns array, single speed likewise)
  const isArray = Array.isArray(speeds);
  speeds = isArray ? speeds : [speeds];

  const thresholds = altitude < 8 ? [10, 15, 20] : [altitude + 4, altitude + 10, altitude + 16]; // nonlinear accelerator for alts above 8k
  const colors = speeds.map(speed => {
    if (speed <= thresholds[0]) return "#1E6A4B";
    if (speed <= thresholds[1]) return "#9A7B1F";
    if (speed <= thresholds[2]) return "#B45309";
    return "#8B1D2C";
  });
  return isArray ? colors : colors[0];
}

function celsiusToF(temp) {
  return (temp * 9 / 5) + 32;
}



////////////////////////
// User settings page //
////////////////////////
function buildStationSettings() { // Build station settings toggle on/off list for the user Settings page
  Object.entries(stationList).forEach(([stid, station]) => {
    document.getElementById(`${stid}-onoff`).innerHTML = `
      <div class="align-items-center border-bottom display-5 d-flex justify-content-around py-4">
        <div class="col-5 display-3 text-info text-start">${station.name}</div>
        <div id="${stid}-on" onclick="stationSetToggle('${stid}', 'on')">On</div>
        <div id="${stid}-off" onclick="stationSetToggle('${stid}', 'off')">Off</div>
      </div>`;

    const state = localStorage.getItem(stid) || "on"; // Default is "on"
    stationSetToggle(stid, state);
  });
}

function stationSetToggle(stid, state) { // Onclick function to toggle stations on/off on the user Settings page
  localStorage.setItem(stid, state)

  const mainElement = document.getElementById(`${stid}-main`);
  const on = document.getElementById(`${stid}-on`);
  const off = document.getElementById(`${stid}-off`);

  mainElement.style.display = state === "on" ? "block" : "none";
  on.className = state === "on" ? "bg-success border fw-semibold px-4 rounded-5 py-2" : "bg-dark border fw-normal px-4 rounded-5 py-2";
  off.className = state === "off" ? "bg-danger border fw-semibold px-4 rounded-5 py-2" : "bg-dark border fw-normal px-4 rounded-5 py-2";
}



//////////////////
// D3 utilities //
//////////////////
function d3Update() {
  let userLiftParams = {};
  document.getElementById("out-of-range").style.display = "none";
  const userTemp = Math.round(Number(document.getElementById("user-temp").value));
  if (!userTemp) return;

  try { userLiftParams = getLiftParams(global.soundingData, userTemp); }
  catch {
    d3OutOfRange(userTemp);
    return;
  };

  if ((celsiusToF(userLiftParams.topOfLiftTemp)) < -10 || !userLiftParams.topOfLift) d3OutOfRange(userTemp);
  else d3Clear(userTemp, userLiftParams);
};

function d3OutOfRange(userTemp) {
  document.getElementById("out-of-range").textContent = `Error: parameters out of range for ${userTemp}°`;
  document.getElementById("out-of-range").style.display = "block";
  document.getElementById("user-temp").value = null;
  return;
};

function d3Clear(temp, params) { // If triggered from HTML Onclick() then params are null; reset to global defaults
  if (!temp) temp = global.hiTemp;
  if (!params) params = global.liftParams;

  document.getElementById("user-temp").value = null;
  document.getElementById("out-of-range").style.display = "none";

  const chartElements = ["line.dalrline", "line.neg3line", "text.liftlabels", "text.liftheights", "text.white", "circle.tolcircle"];
  chartElements.forEach(element => {
    svg.selectAll(element).remove();
  });

  drawDALRParams(temp, params);
};