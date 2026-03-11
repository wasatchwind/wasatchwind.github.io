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

  // Set up Cams page container
  const camNames = ["cam-east", "cam-southeast", "cam-south", "cam-southwest", "cam-southwest2", "cam-west", "cam-west2"];
  const camContainer = document.getElementById("cams-page");
  camNames.forEach(cam => {
    const div = document.createElement("div");
    div.id = `${cam}-div`;
    camContainer.appendChild(div)
  });

  // Display all remaining web-accessed images
  displayConditionalImages(sunset);
  displayPersistentImages(windMapTimestamp);

  // Populate sunset & high temp in the marquee and hide the loading spinner
  document.getElementById("sunset").textContent = sunset.toLocaleString("en-us", { hour: "numeric", minute: "2-digit" }).slice(0, -3);
  document.getElementById("hi-temp").textContent = `${global.hiTemp}`;
  document.getElementById("spinner").style.display = "none";

  // Display marquee and nav pages last for smooth loading
  const pageIds = ["today-page", "tomorrow-page", "settings-page", "misc-page", "gps-page", "cams-page", "now-page"];
  pageIds.forEach(page => {
    const element = document.getElementById(page);
    element.style.display = "block";
  });
}



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



////////////////////////
// User settings page //
////////////////////////
function buildStationSettings() { // Build station settings toggle on/off list for the user Settings page
  const container = document.getElementById("stations-displayed");

  Object.entries(stationList).forEach(([stid, station]) => {
    const row = document.createElement("div");
    row.className = "align-items-center border-bottom display-5 d-flex justify-content-around py-4";
    row.innerHTML = `
      <div class="col-5 display-3 text-info text-start">${station.name}</div>
      <div id="${stid}-on">On</div>
      <div id="${stid}-off">Off</div>`;

    container.appendChild(row);

    const state = localStorage.getItem(stid) || "on"; // Default is "on"
    stationSetToggle(stid, state);

    row.querySelector(`#${stid}-on`).addEventListener("click", () => stationSetToggle(stid, "on"));
    row.querySelector(`#${stid}-off`).addEventListener("click", () => stationSetToggle(stid, "off"));
  });
}

function stationSetToggle(stid, state) { // Onclick function to toggle stations on/off on the user Settings page
  localStorage.setItem(stid, state)

  const on = document.getElementById(`${stid}-on`);
  const off = document.getElementById(`${stid}-off`);

  on.className = state === "on" ? "bg-success border fw-semibold px-4 rounded-5 py-2" : "bg-dark border fw-normal px-4 rounded-5 py-2";
  off.className = state === "off" ? "bg-danger border fw-semibold px-4 rounded-5 py-2" : "bg-dark border fw-normal px-4 rounded-5 py-2";
}