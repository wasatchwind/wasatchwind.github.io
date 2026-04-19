"use strict";

// Data source documentation:
// Open Meteo API: https://open-meteo.com/en/docs/gfs-api
// Synoptic API: https://docs.synopticdata.com/services/weather-api
// NWS API: https://www.weather.gov/documentation/services-web-api
// Sounding Data UWYO Inventory: https://weather.uwyo.edu/wsgi/sounding?datetime=2026-03-23%2012:00:00&id=72572&src=UNKNOWN&type=INVENTORY
// Sounding Data UWYO UI: https://weather.uwyo.edu/upperair/sounding.shtml
// Google Cloud: https://console.cloud.google.com/storage/overview;tab=overview?project=wasatchwind
// Keen Slider: https://keen-slider.io/docs

function main(data) {
  console.log("All data", data)
  MarqueeController.init(); // Set up marquee ticker

  // Process data in prioritized order:
  // Sunset needed for nav order (2pm to sunset: Now, after sunset: Tomorrow) & for Hourly Forecast Chart & Area Forecast Discussion locations
  const sunset = new Date(data.openMeteo.daily.sunset[0]);
  const currentHour = new Date().getHours();
  const nextDay = new Date(new Date().setDate(new Date().getDate() + 1)).toLocaleDateString("en-US", { weekday: "short" });
  const navItems = ["Today", `${nextDay}+`, "Settings", "Misc.", "GPS", "Cams", "Now"];
  global.slider = buildNavSlider(0, navItems);
  if (currentHour >= 14 && currentHour <= sunset.getHours() - 1) global.slider.moveToIdx(navItems.length - 1, true, { duration: 0 });
  else if (currentHour >= sunset.getHours() - 1) global.slider.moveToIdx(1, true, { duration: 0 });
  processAreaForecastPageAndSunset(data.areaForecast.productText, sunset); // nws-api.js
  if (currentHour > 6) displayAfternoonSurfaceWindImages(currentHour, sunset, nextDay); // main.js TESTING

  // Forecast high temp (global for resetting sounding) needed for sounding profile (ideally from soaring forecast with open meteo as backup)
  const { hiTempSoaringForecast, nwsNegative3, nwsTopOfLift } = processSoaringForecastPage(data.soaringForecast.productText); // new-api.js
  const hiTempOpenMeteo = Math.round(data.openMeteo.daily.temperature_2m_max[0]);
  const hiTemp = hiTempSoaringForecast ? hiTempSoaringForecast : hiTempOpenMeteo;
  if (currentHour > 6) processSounding(data.soaringForecast.productText, data.sounding, hiTemp, nwsNegative3, nwsTopOfLift); // sounding.js

  // Process remaining data
  processWindAloft(data.openMeteo.hourly, data.windAloft6, data.windAloft12, data.windAloft24); // wind-aloft.js
  processGeneralForecast(data.generalForecast.properties.periods); // nws-api.js
  processSynoptic(data.synopticTimeseries.STATION); // synoptic.js

  buildStationSettings(); // main.js, Build User Settings page
  buildMiscPageItems(); // main.js, Build Misc page

  // Set up Cams page container
  const camNames = ["cam-east", "cam-southeast", "cam-south", "cam-southwest", "cam-southwest2", "cam-west", "cam-west2"];
  const camContainer = document.getElementById("cams-page");
  camNames.forEach(cam => {
    const div = document.createElement("div");
    div.id = `${cam}`;
    camContainer.appendChild(div)
  });

  const windMapTimestamp = new Date(data.windMapScreenshotMetadata.timeCreated);
  displayPersistentImages(windMapTimestamp); // main.js, must follow Cams container setup since images are persistent TESTING

  // Populate sunset & high temp in the marquee and hide the loading spinner
  document.getElementById("sunset").textContent = sunset.toLocaleString("en-us", { hour: "numeric", minute: "2-digit" }).slice(0, -3);
  document.getElementById("hi-temp").textContent = `${hiTemp}`;
  document.getElementById("spinner").style.display = "none";

  // Unhide main app nav pages last for smooth visual loading
  const pageIds = ["today-page", "tomorrow-page", "settings-page", "misc-page", "gps-page", "cams-page", "now-page"];
  pageIds.forEach(page => {
    const element = document.getElementById(page);
    element.style.display = "block";
  });
}



/////////////////////////////////
// Display web-accessed images //
/////////////////////////////////
function displayAfternoonSurfaceWindImages(currentHour, sunset, nextDay) { // Conditionally located afternoon surface wind images
  const isToday = currentHour < sunset.getHours();
  nextDay = isToday ? "" : ` ${nextDay}`;
  const displayFactors = isToday ? { day: "today", graph: 4 } : { day: "tomorrow", graph: 8 };
  const windImg = `https://graphical.weather.gov/images/SLC/WindSpd${displayFactors.graph}_utah.png`;
  const gustImg = `https://graphical.weather.gov/images/SLC/WindGust${displayFactors.graph}_utah.png`;

  document.getElementById(`surface-wind-${displayFactors.day}`).innerHTML = `
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
      isVisible: true,
      src: "https://storage.googleapis.com/wasatch-wind-static/wind-map-save.png",
      title: `Wind Map @ ${windMapTimestamp.toLocaleString("en-US", { hour: "numeric", minute: "2-digit" }).toLowerCase()}`
    }, {
      elementId: "satellite-gif",
      href: "https://www.star.nesdis.noaa.gov/goes/sector.php?sat=G17&sector=psw",
      isVisible: true,
      src: "https://cdn.star.nesdis.noaa.gov/GOES18/ABI/SECTOR/psw/13/GOES18-PSW-13-600x600.gif",
      title: "Satellite Last 4 Hours"
    }, {
      elementId: "uhgpga-flying-sites",
      href: "https://www.uhgpga.org/flying-sites",
      isVisible: true,
      src: "prod/images/UHGPGAflyingsites.png",
      title: "UHGPGA Flying Sites"
    }, {
      elementId: "hike-fly",
      href: "https://www.hikeandfly.org/?lat=40.62020704520565&lng=-111.90364837646486&zoom=11",
      isVisible: true,
      src: "prod/images/hikeandfly.png",
      title: "Hike & Fly Calculator"
    }, {
      elementId: "pressure-zone-chart",
      isVisible: true,
      src: "prod/images/zonechart.jpg",
      title: "Zone (Ambrose Pressure Zone)"
    }, {
      elementId: "cam-east",
      href: "https://www.weather.gov/slc/cameras",
      isVisible: true,
      src: "https://cameraftpapi.drivehq.com/api/Camera/GetLastCameraImage.aspx?parentID=347464441&shareID=17137573",
      title: "Daybreak looking East"
    }, {
      elementId: "cam-southeast",
      href: "https://horel.chpc.utah.edu/data/station_cameras/armstrong_cam/",
      isVisible: true,
      src: "https://horel.chpc.utah.edu/data/station_cameras/armstrong_cam/armstrong_cam_current.jpg",
      title: "West Valley looking Southeast"
    }, {
      elementId: "cam-south",
      href: "https://horel.chpc.utah.edu/data/station_cameras/wbbs_cam/",
      isVisible: true,
      src: "https://horel.chpc.utah.edu/data/station_cameras/wbbs_cam/wbbs_cam_current.jpg",
      title: "U of U looking South"
    }, {
      elementId: "cam-southwest",
      href: "https://www.weather.gov/slc/cameras",
      isVisible: true,
      src: "https://cameraftpapi.drivehq.com/api/Camera/GetLastCameraImage.aspx?parentID=347695945&shareID=17138700",
      title: "Daybreak looking Southwest"
    }, {
      elementId: "cam-southwest2",
      href: "https://horel.chpc.utah.edu/data/station_cameras/ulssb_cam/",
      isVisible: true,
      src: "https://horel.chpc.utah.edu/data/station_cameras/ulssb_cam/ulssb_cam_current.jpg",
      title: "U of U looking Southwest"
    }, {
      elementId: "cam-west",
      href: "https://www.weather.gov/slc/cameras",
      isVisible: true,
      src: "https://images-webcams.windy.com/00/1367462800/current/full/1367462800.jpg",
      title: "West Valley looking West"
    }, {
      elementId: "cam-west2",
      href: "https://horel.chpc.utah.edu/data/station_cameras/wbbw_cam/",
      isVisible: true,
      src: "https://horel.chpc.utah.edu/data/station_cameras/wbbw_cam/wbbw_cam_current.jpg",
      title: "U of U looking West"
    }, {
      elementId: "livetrack24",
      href: "https://www.livetrack24.com/tracks/country/us",
      isVisible: true,
      src: "prod/images/livetrack24.png",
      title: "LiveTrack24"
    }, {
      elementId: "xcfind",
      href: "https://xcfind.paraglide.us/map.html?id=15",
      isVisible: true,
      src: "prod/images/xcfind.png",
      title: "XCFind"
    }, {
      elementId: "learn-paragliding",
      href: "https://utahparagliding.com/",
      isVisible: true,
      src: "prod/images/utahparagliding.jpg",
      title: "Learn Paragliding (My Alma Mater)"
    }
  ];
  imagesToDisplay.forEach(image => { standardHtmlComponent(image) });
}



////////////////////////
// User settings page //
////////////////////////
function buildStationSettings() { // Build station settings toggle on/off list for the user Settings page
  const container = document.getElementById("stations-displayed");
  container.className = "display-3 py-4 text-start";
  container.innerHTML = "Display Station Charts:";
  const stations = stationList();

  stations.forEach(station => {
    const row = document.createElement("div");
    row.className = "align-items-center border-bottom display-5 d-flex justify-content-around py-4";
    row.innerHTML = `
      <div class="col-6 display-3 text-info text-start">${station.name}</div>
      <div id="${station.id}-on">On</div>
      <div id="${station.id}-off">Off</div>`;

    container.appendChild(row);

    const state = localStorage.getItem(station.id) || "on"; // Default is "on"
    stationSetToggle(station.id, state);

    row.querySelector(`#${station.id}-on`).addEventListener("click", () => stationSetToggle(station.id, "on"));
    row.querySelector(`#${station.id}-off`).addEventListener("click", () => stationSetToggle(station.id, "off"));
  });

  const synopticLink = document.createElement("div");
  synopticLink.innerHTML = `
    <div class="d-flex display-6 justify-content-center mt-4">
      <div class="text-secondary fw-semibold me-3">Weather station data from</div>
      <a class="text-warning" href="https://synopticdata.com/">Synoptic</a>
    </div>`;
  container.appendChild(synopticLink);
}

function stationSetToggle(stid, state) { // Onclick function to toggle stations on/off on the user Settings page
  localStorage.setItem(stid, state)

  const on = document.getElementById(`${stid}-on`);
  const off = document.getElementById(`${stid}-off`);

  on.className = state === "on" ? "bg-success border fw-semibold px-4 rounded-5 py-2" : "bg-dark border fw-normal px-4 rounded-5 py-2";
  off.className = state === "off" ? "bg-danger border fw-semibold px-4 rounded-5 py-2" : "bg-dark border fw-normal px-4 rounded-5 py-2";
}



//////////////////////
// Misc. page itmes //
//////////////////////
function buildMiscPageItems() {
  const unitsContent = `
    <div class="text-info">Units (unless noted otherwise):</div>
    <div class="ms-4">
      <div>Wind speed.... mph</div>
      <div>Altitude...... feet</div>
      <div>Temperature... &deg;F</div>
    </div>
    <br>
    <div>The Wind Aloft Forecast uses a GFS + HRRR hybrid model except for 9k, 12k, and 18k which use NWS/NOAA Aviation Weather Center</div>`;

  const aboutContent = `
    <div>I am Matt Hanson, a local paraglider pilot flying since 2014, and created Wasatch Wind to assist with flying
      conditions assessment. The information provided is generalized and not intended to influence a decision to fly.</div>
    <br>
    <div>Feedback is welcome!</div>
    <div class="d-flex">
      <div>My email:&nbsp;</div>
      <div class="fw-semibold text-warning">matthansonx@gmail.com</div>
    </div>
    <br>
    <div>Wasatch Wind is free! I maintain it as a hobby but it takes time - donations are welcome!</div>
    <br>
    <div class="d-flex justify-content-center">
      <div class="d-flex">
        <div>Venmo:&nbsp;</div>
        <div class="fw-semibold text-warning">@matt-hansonx</div>
      </div>
    </div>
    <br>
    <img height="450px" class="d-block mx-auto rounded-4" src="prod/images/venmo.jpg">`;

  const miscSections = [
    {
      elementId: "units",
      isVisible: true,
      src: unitsContent,
      title: "Units & Models"
    }, {
      elementId: "about",
      isVisible: true,
      src: aboutContent,
      title: "About"
    }
  ];
  miscSections.forEach(section => { standardHtmlComponent(section) });
}