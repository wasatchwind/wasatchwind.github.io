"use strict";

// Table of contents
// 1. DOM: IIFE build sticky top
// 2. DOM: Marquee (+ all other marquee code)
// 3. DOM: Afternoon surface wind images
// 4. DOM: Settings > stations & Misc. pages
// 5. DOM: Display all standard web-accessed and hosted images
// 6. DOM: Function to create many standard DOM components
// 7. Create navigation slider
// 8. Functions for wind speed color & list of stations

// 1. ///////////////////////////////////////////////////////////////////////////////////////////////
// IIFE to immediately build HTML DOM for sticky top (title/heading, top navigation) and cams page //
/////////////////////////////////////////////////////////////////////////////////////////////////////
(() => {
  // Title heading (row 1) - includes reload button
  document.getElementById("title-heading").innerHTML = `
    <h1 class="align-items-center d-flex justify-content-between">
      <img src="prod/images/pg.gif" height="125">
      <div class="display-1 fw-semibold text-info">Wasatch Wind</div>
      <button id="reload" class="clickable" aria-label="Reload page">
        <img src="prod/images/refresh.png" height="125">
      </button>
    </h1>`;

  // Reload button listener
  document.getElementById("reload").addEventListener("click", (e) => {
    history.scrollRestoration = "manual";
    location.reload();
  });

  // Top navigation (row 3)
  document.getElementById("topnav").innerHTML = `
    <div class="align-items-end d-flex display-1 justify-content-between text-secondary">
      <button class="fw-semibold text-warning clickable" data-direction="left" aria-label="Previous">&#171;</button>
      <div class="col display-2" id="topnav-left"></div>
      <div class="col fw-semibold text-white" id="topnav-active"></div>
      <div class="col display-2" id="topnav-right"></div>
      <button class="fw-semibold text-warning clickable" data-direction="right" aria-label="Next">&#187;</button>
    </div>`;

  // Cams page container
  const camNames = ["cam-east", "cam-southeast", "cam-south", "cam-southwest", "cam-southwest2", "cam-west", "cam-west2"];
  const camContainer = document.getElementById("cams-page");
  camNames.forEach(cam => {
    const div = document.createElement("div");
    div.id = `${cam}`;
    camContainer.appendChild(div)
  });
})();

// 2. /////////////////////////////////////////////////
// Marquee: HTML DOM, controller, and user settings) //
///////////////////////////////////////////////////////
const MarqueeController = (() => {

  // DOM Setup - Marquee slider/ticker
  const marqueeDiv = document.getElementById("marquee");
  marqueeDiv.className = "display-5 keen-slider";

  const row = (content) => `<div class="d-flex justify-content-center">${content}</div>`; // Reused class
  const tickers = [
    { topRow: "-3 Index", bottomRow: `<div id="negative3"></div>` },
    { topRow: "Top of Lift", bottomRow: `<div id="top-of-lift"></div>` },
    { topRow: "Temp", bottomRow: row(`<div id="temp"></div><div id="hi-temp"></div>`) },
    { topRow: "Pressure", bottomRow: row(`<div id="alti"></div><div id="trend"></div>`) },
    { topRow: "Zone", bottomRow: `<img id="zone">` },
    { topRow: "KSLC", id: "KSLC-time-12", bottomRow: row(`<div id="KSLC-wdir-12"></div><div class="ms-3" id="KSLC-wspd-12"></div><div class="gust-color fs-1 ms-3" id="KSLC-gust-12"></div>`) },
    { topRow: "Sunset", bottomRow: `<div id="sunset"></div>` },
  ];

  marqueeDiv.innerHTML = tickers.map((t, i) => `
    <div class="keen-slider__slide number-slide${i + 1}">
      <div class="text-info" ${t.id ? `id="${t.id}"` : ""}>${t.topRow}</div>
      ${t.bottomRow}
    </div>`).join("");

  // DOM Setup - Marquee speed settings
  const marqueeSettingsDiv = document.getElementById("marquee-speed");
  marqueeSettingsDiv.innerHTML = `
    <div class="border-bottom d-flex justify-content-between py-4">
      <div class="display-3 text-info">Marquee Speed</div>
      <div class="align-items-center col-7 display-4 d-flex justify-content-around" id="marquee-settings"></div>
    </div>`;

  const marqueeSettingsSpeeds = document.getElementById("marquee-settings");

  // Create the Marquee
  const speeds = [
    { label: "Slow", value: 4000 },
    { label: "Medium", value: 1000 },
    { label: "Fast", value: 500 }
  ];

  let currentSpeed = Number(localStorage.getItem("marquee")) || speeds[1].value;

  const animate = (m) => m.moveToIdx(m.track.details.abs + 1, true, { duration: currentSpeed, easing: t => t });
  const options = {
    loop: true,
    slides: { perView: 4 },
    created: (m) => animate(m),
    updated: animate,
    animationEnded: animate
  };
  const marquee = new KeenSlider("#marquee", options);

  // Function to build the Marquee speed options on the user settings page
  function buildSettingsUI() {
    const baseBtnClass = "marquee-speed border px-4 py-2 rounded-5";
    marqueeSettingsSpeeds.innerHTML = speeds.map(s => `
    <div 
      class="${baseBtnClass} bg-dark fw-normal"
      data-speed="${s.value}">
      ${s.label}
    </div>`).join("");

    marqueeSettingsSpeeds.addEventListener("click", (e) => {
      const btn = e.target.closest(".marquee-speed");
      if (!btn) return;
      setSpeed(+btn.dataset.speed);
    });

    setSpeed(currentSpeed);
  }

  // Function to set the Marquee speed based on user selection or default
  function setSpeed(speed) {
    currentSpeed = speed;
    localStorage.setItem("marquee", speed);
    animate(marquee);

    marqueeSettingsSpeeds.querySelectorAll(".marquee-speed").forEach(btn => {
      btn.classList.toggle("bg-success", btn.dataset.speed == speed);
      btn.classList.toggle("fw-semibold", btn.dataset.speed == speed);
      btn.classList.toggle("bg-dark", btn.dataset.speed != speed);
      btn.classList.toggle("fw-normal", btn.dataset.speed != speed);
    });
  }
  return { init: buildSettingsUI, setSpeed }; // Initialized with MarqueeController.init(); on main.js in main()
})();

// 3. /////////////////////////////
// Afternoon surface wind images //
///////////////////////////////////
function displayAfternoonSurfaceWindImages(currentHour, sunsetHour, nextDay) { // Conditionally located afternoon surface wind images
  const isToday = currentHour < sunsetHour - 1;
  nextDay = isToday ? "" : ` ${nextDay}`;
  const displayFactors = isToday ? { day: "today", graph: 4 } : { day: "tomorrow", graph: 8 };
  const windImg = `https://graphical.weather.gov/GraphicalNDFD.php?timezone=MDT&sector=SLC&element=windspd&n=${displayFactors.graph}`;
  const gustImg = `https://graphical.weather.gov/GraphicalNDFD.php?timezone=MDT&sector=SLC&element=windgust&n=${displayFactors.graph}`;

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
    </div>`;
}

// 4. /////////////////////////////////////////
// Settings page (station list) & Misc. page //
///////////////////////////////////////////////
(function buildStationSettings() { // IIFE to build station settings toggle on/off list for the user Settings page
  const container = document.getElementById("stations-displayed");
  container.className = "display-3 py-4 text-start";
  container.innerHTML = "Display Station Charts:";

  stationList().forEach(station => {
    const row = document.createElement("div");
    row.className = "border-bottom d-flex justify-content-between py-4";
    row.innerHTML = `
      <div class="ms-5 ps-5 text-info text-start">${station.name}</div>
      <div class="form-check form-switch">
        <input class="form-check-input" type="checkbox" id="${station.id}-toggle">
      </div>`;

    container.appendChild(row);

    const toggleEl = row.querySelector(`#${station.id}-toggle`);
    let state = localStorage.getItem(station.id) || "on"; // Default is "on"
    toggleEl.checked = state === "on";

    toggleEl.addEventListener("change", () => {
      const newState = toggleEl.checked ? "on" : "off";
      localStorage.setItem(station.id, newState);
      stationSetToggle(station.id, newState);
    });
  });

  const synopticLink = document.createElement("div");
  synopticLink.innerHTML = `
    <div class="d-flex display-6 justify-content-center mt-4">
      <div class="text-secondary fw-semibold me-3">Weather station data from</div>
      <a class="text-warning" href="https://synopticdata.com/">Synoptic</a>
    </div>`;
  container.appendChild(synopticLink);
})();

function stationSetToggle(id, state) {
  localStorage.setItem(id, state);

  // visibility logic
  const stationEl = document.getElementById(`${id}-main`);
  if (stationEl) stationEl.style.display = state === "off" ? "none" : "";
}

(function buildMiscPageItems() { // IIFE to build standard DOM components for the Misc. page
  const unitsContent = `
    <div class="text-info">Units:</div>
    <div>
      <div>• Wind Speed.... mph</div>
      <div>• Altitude...... Feet</div>
      <div>• Temperature... &deg;F</div>
    </div>
    <br>
    <div class="text-info">Wind Aloft Models:</div>
    <div>
      <div>• Pressure levels are hybrid GFS + HRRR</div>
      <div>• 9k, 12k, 18k are NAM</div>
    </div>`;

  const aboutContent = `
    <div>Wasatch Wind was created by Matt Hanson, a local paraglider pilot flying since 2014, to assist with weather
      conditions assessment. Wasatch Wind is generalized and not intended to influence flying decisions.</div>
    <br>
    <div class="d-flex">
      <div>Feedback? Email me:&nbsp;</div>
      <div class="fw-semibold text-warning">matthansonx@gmail.com</div>
    </div>
    <br>
    <div>Wasatch Wind is free! I maintain it as a hobby but it takes time - donations are welcome!</div>
    <br>
    <a href="https://venmo.com/u/Matt-Hansonx" target="_blank">
      <div class="d-flex justify-content-center">
        <div class="d-flex">
          <div>Venmo:&nbsp;</div>
          <div class="fw-semibold text-warning">@matt-hansonx</div>
        </div>
      </div>
      <br>
      <img height="450px" class="d-block mx-auto rounded-4" src="prod/images/venmo.jpg">
    </a>`;

  const miscSections = [
    {
      elementId: "units",
      src: unitsContent,
      title: "Units & Forecast Models"
    }, {
      elementId: "about",
      src: aboutContent,
      title: "About"
    }
  ];
  miscSections.forEach(section => { standardHtmlComponent(section) });
})();

// 5. ///////////////////////////////////////////////////////////////////////
// Display web-based and hosted images that aren't conditionally displayed //
/////////////////////////////////////////////////////////////////////////////
function displayPersistentImages(windMapTime) { // Images independent of conditional parameters (sunset, currnet hour)
  const imagesToDisplay = [
    {
      elementId: "wind-map",
      href: "https://www.weather.gov/wrh/hazards?&zoom=10&scroll_zoom=false&center=40.70,-111.50&obs=true&obs_type=weather&elements=wind,gust&fontsize=4&obs_density=3",
      src: "https://storage.googleapis.com/wasatch-wind-static/wind-map-save.png",
      title: `Wind Map @ ${windMapTime}`
    }, {
      elementId: "satellite-gif",
      href: "https://www.star.nesdis.noaa.gov/goes/sector.php?sat=G17&sector=psw",
      src: "https://cdn.star.nesdis.noaa.gov/GOES18/ABI/SECTOR/psw/13/GOES18-PSW-13-600x600.gif",
      title: "Satellite Last 4 Hours"
    }, {
      elementId: "uhgpga-flying-sites",
      href: "https://www.uhgpga.org/flying-sites",
      src: "prod/images/UHGPGAflyingsites.png",
      title: "UHGPGA Flying Sites"
    }, {
      elementId: "hike-fly",
      href: "https://www.hikeandfly.org/?lat=40.62020704520565&lng=-111.90364837646486&zoom=11",
      src: "prod/images/hikeandfly.png",
      title: "Hike & Fly Calculator"
    }, {
      elementId: "pressure-zone-chart",
      src: "prod/images/zonechart.jpg",
      title: "Zone (Ambrose Pressure Zone)"
    }, {
      elementId: "cam-east",
      href: "https://www.weather.gov/slc/cameras",
      src: "https://cameraftpapi.drivehq.com/api/Camera/GetLastCameraImage.aspx?parentID=347464441&shareID=17137573",
      title: "Daybreak looking East"
    }, {
      elementId: "cam-southeast",
      href: "https://horel.chpc.utah.edu/data/station_cameras/armstrong_cam/",
      src: "https://horel.chpc.utah.edu/data/station_cameras/armstrong_cam/armstrong_cam_current.jpg",
      title: "West Valley looking Southeast"
    }, {
      elementId: "cam-south",
      href: "https://horel.chpc.utah.edu/data/station_cameras/wbbs_cam/",
      src: "https://horel.chpc.utah.edu/data/station_cameras/wbbs_cam/wbbs_cam_current.jpg",
      title: "U of U looking South"
    }, {
      elementId: "cam-southwest",
      href: "https://www.weather.gov/slc/cameras",
      src: "https://cameraftpapi.drivehq.com/api/Camera/GetLastCameraImage.aspx?parentID=347695945&shareID=17138700",
      title: "Daybreak looking Southwest"
    }, {
      elementId: "cam-southwest2",
      href: "https://horel.chpc.utah.edu/data/station_cameras/ulssb_cam/",
      src: "https://horel.chpc.utah.edu/data/station_cameras/ulssb_cam/ulssb_cam_current.jpg",
      title: "U of U looking Southwest"
    }, {
      elementId: "cam-west",
      href: "https://www.weather.gov/slc/cameras",
      src: "https://images-webcams.windy.com/00/1367462800/current/full/1367462800.jpg",
      title: "West Valley looking West"
    }, {
      elementId: "cam-west2",
      href: "https://horel.chpc.utah.edu/data/station_cameras/wbbw_cam/",
      src: "https://horel.chpc.utah.edu/data/station_cameras/wbbw_cam/wbbw_cam_current.jpg",
      title: "U of U looking West"
    }, {
      elementId: "livetrack24",
      href: "https://www.livetrack24.com/tracks/country/us",
      src: "prod/images/livetrack24.png",
      title: "LiveTrack24"
    }, {
      elementId: "xcfind",
      href: "https://xcfind.paraglide.us/map.html?id=15",
      src: "prod/images/xcfind.png",
      title: "XCFind"
    }, {
      elementId: "learn-paragliding",
      href: "https://utahparagliding.com/",
      src: "prod/images/utahparagliding.jpg",
      title: "Learn Paragliding (My Alma Mater)"
    }
  ];
  imagesToDisplay.forEach(image => { standardHtmlComponent(image) });
}

// 6. //////////////////////////////////////////////////
// Function for creating many standard DOM components //
////////////////////////////////////////////////////////
// Input params options:
// {
//   elementId: String (required)
//   title: String (required)
//   href: String (optional: 1) url link, 2) undefined)
//   src: String (optional: 1) source text, 2) HTML subdivs, 3) web image url, 4) hosted image path, 5) undefined)
//   style: String (optional: 1) style override, 2) style override with subdiv id, 3) undefined (default style))
// }
function standardHtmlComponent({ elementId, title, href, src, style }) {
  style = style ? style : "bg-dark border display-6 font-monospace ps-2 rounded-4 text-start";
  const isImgSrc = src?.startsWith("http") || src?.startsWith("prod");
  const [content, imgSrc] = isImgSrc ? ["", src] : [src ?? "", null];
  const imgOrDiv = imgSrc ? `<img class="rounded-4 w-100" loading="lazy" src="${imgSrc}">` : `<div class="${style}">${content}</div>`;
  const link = href ? { hrefLine: `<a href="${href}" target="_blank">`, closure: "</a>" } : { hrefLine: "", closure: "" };

  document.getElementById(`${elementId}`).innerHTML = `
    <div class="mb-4">
      ${link.hrefLine}
        <div class="display-3 text-info">${title}</div>
        ${imgOrDiv}
      ${link.closure}
    </div>`;
}

// 7. //////////////////////////////////////////
// Set up page navigation swipe/scroll slider //
////////////////////////////////////////////////
function buildNavSlider(initialNav, navItems) {
  const options = {
    loop: true,
    slides: { perView: 1 },
    slideChanged: (slider) => {
      navUpdate(slider.track.details.rel, navItems);
      window.scrollTo(0, 0);
    }
  };
  const slider = new KeenSlider("#slider", options);
  navUpdate(initialNav, navItems); // Necessary here to ensure initial page titles are displayed on initial load
  // slider.moveToIdx(2, true, { duration: 0 });
  slider.moveToIdx(initialNav, true, { duration: 0 });
  return slider;

  function navUpdate(activeNav, navItems) { // Update nav slider/page based on time of day or user input (touch/drag swipe)
    const left = activeNav === 0 ? navItems.length - 1 : activeNav - 1;
    const right = activeNav === navItems.length - 1 ? 0 : activeNav + 1;

    document.getElementById("topnav-left").textContent = navItems[left];
    document.getElementById("topnav-active").textContent = navItems[activeNav];
    document.getElementById("topnav-right").textContent = navItems[right];
  }
}


// 8. /////////////////////////////////////////
// Wind speed color & station list utilities //
///////////////////////////////////////////////
// Returns wind speed color/s based on altitude (array returns array, single speed likewise): synoptic.js & wind-aloft.js
function windSpeedColor(speeds, altitude) {
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

// Used for user settings page (main.js) and station wind charts (synoptic.js), alphabetical order by name, id matched to Synoptic station id
function stationList() {
  return [
    { name: "Alta Baldy", id: "AMB" },
    { name: "Airport 2", id: "KSVR" },
    { name: "Clayton Peak", id: "BRW" },
    { name: "Hidden Peak", id: "HDP" },
    { name: "Ogden Peak", id: "OGP" },
    { name: "Olypmus Cove", id: "UTOLY" },
    { name: "Parleys Mouth", id: "UT5" },
    { name: "Pepperwood", id: "D6120" },
    { name: "Reynolds Peak", id: "REY" },
    { name: "Southside", id: "FPS" }
  ];
}






// FOR TESTING - REMOVE IN PROD
const data = {
  "areaForecast": {
    "@context": {
      "@version": "1.1",
      "@vocab": "https://api.weather.gov/ontology#"
    },
    "@id": "https://api.weather.gov/products/5a1cfdbd-2e82-4455-806b-a1f4ae7ea508",
    "id": "5a1cfdbd-2e82-4455-806b-a1f4ae7ea508",
    "wmoCollectiveId": "FXUS65",
    "issuingOffice": "KSLC",
    "issuanceTime": "2026-10-14T12:29:00+00:00",
    "productCode": "AFD",
    "productName": "Area Forecast Discussion",
    "productText": "\n000\nFXUS65 KSLC 141229\nAFDSLC\n\nArea Forecast Discussion\nNational Weather Service Salt Lake City UT\n629 AM MDT Wed Oct 14 2026\n\n.UPDATE...Have extended the going Winter Wx Advisory for the\nwestern Uinta range, as a favorable northerly upslope regime this\nafternoon and evening will likely bring persistent snowfall to the\nnorth slopes. Widespread 2-5 inches look likely during this time,\nwith locally higher totals possible where snowfall can persist. \n\nAdditionally, widespread cloud cover associated with the upper low\nspinning along the UT/AZ border has kept temperatures elevated in\nthe 40 degree range across most valleys overnight. This wrap\naround moisture will maintain a stratus layer through the morning\nhours, thus temperatures will remain above freezing across zones\nwhich currently have a Freeze Warning, with the exception of\nsouthwest Utah where temperatures have fallen into the mid 30s\nnear Enterprise. As such will cancel the going Freeze Warning for\nall but southwest Utah. With clear skies tonight temperatures will\nhave a better chance of reaching the freezing mark across central\nand southwest valleys excluding lower Washington County. \n\n\n&&\n\n.KEY MESSAGES, Issued 1042 PM MDT Tue Oct 13 2026...\n\n\n- Valley rain and mountain snow will persist across the eastern\n  half of Utah today as a low pressure system slowly progresses\n  through the region. Drier air will spread into western Utah in\n  the wake of this low.  \n\n- Colder air behind this system will bring freezing temperatures\n  across some outlying valleys of western Utah Thursday morning.\n\n- Dry conditions are expected Thursday through early next week\n  with a gradual warming trend as high pressure builds off the\n  Pacific coast. A more active pattern may return by the middle of\n  next week.\n\n&&\n\n.DISCUSSION, Issued 1042 PM MDT Tue Oct 13 2026...\nA Pacific Northwest low is centered over northwest\nArizona this evening. A moist and unstable northerly flow remains\nin place over Utah and southwest Wyoming under the influence of\nthis system, though associated valley rain and mountain snow has\nbecome increasingly spotty. Along with the precipitation, the\nsystem has also brought quite unseasonably cold temperatures, with\nmaxes today having run 15-20F below seasonal normals. With some\npockets of clearing in this airmass, some outlying valleys over\nwestern Utah will see lows near or below freezing, which could\nbring some impacts to agricultural activity. Going Freeze Warning\ncovers this threat well. The threat of freezing lows will continue\nthrough at least Thursday morning.\n\nThe low is on track to trek across Arizona during the morning\nbefore sliding northeast into Colorado Wednesday afternoon,\nnoticeably slower than what guidance was indicating yesterday,\nanother example of models struggling with closed lows. Thus, the\nthreat of showers will continue tomorrow, focused primarily over\neastern Utah. The position of the low could also bring some\nlocally gusty winds. Currently, the north/northeasterly flow is\ncreating a pressure gradient modestly favorable for gap winds over\nprone areas of Washington county. However, associated cold\nadvection is unimpressive, limiting the threat. By Wednesday\nnight/Thursday morning, the position of the low will bring a more\nuncommon east to northeast flow over much of the area, which would\nbring some canyon winds to prone areas of the Wasatch Front. As is\nthe case with the Washington county wind threat, the associated\ncold advection over northern Utah and southwest Wyoming is modest\nat best, keeping the chance of downslope winds low. \n\nBeginning Thursday, high pressure will start to build off the\nCalifornia coast, interacting with another low near Baja\nCalifornia to produce a weak Rex Block pattern, bringing drier air\nand a slow warming trend. The block is expected to be dislodged by\nSaturday as a trough moves across the US/Canada border. The\nimpacts will be minimal for Utah and southwest Wyoming, however,\nwith dry conditions continuing with temperatures moving back to\nnear seasonal normals. \n\nThe loss of the Pacific ridge again opens up the storm track for\nthe potential of a more active pattern across the West beginning\nearly next week. Despite this, there remains noticeable spread as\nto when a storm system might impact the area, with chances\nincreasing beginning Tuesday. Given the level of uncertainty,\ndetails on any particular system remain dim at this time. \n\n\n\n&&\n\n.AVIATION...\n\nKSLC...Low end VFR CIGS will persist through the morning hours at\nKSLC. There is a 30% chance of rain showers through 15Z which may\ntemporarily reduce cigs/vis into the MVFR category. Beyond 15Z \nVFR conditions with northwest winds will prevail through this \nafternoon and evening. \n\nREST OF UTAH AND SOUTHWEST WYOMING...Widespread low-end VFR cigs\nwill persist across much of northern, central and eastern Utah\nthrough the morning hours. Embedded showers will reduce CIGS/VIS\ninto the MVFR category at times, and local pockets of IFR/LIFR\nconditions within fog can be expected, particularly  near KEVW.\nCIGS will gradually lift this afternoon as drier air spreads into\nthe region, resulting predominant VFR conditions. \n\n&&\n\n.FIRE WEATHER, Issued 247 AM MDT Wed Oct 14 2026...\nA low pressure system spinning across eastern Utah will maintain \ncool and stable conditions across the region today. Lingering \nvalley rain and mountain snow will persist mainly east of the I-15\ncorridor today. High pressure will beginning building into the \nregion Thursday, which will bring a warming and drying trend into \nthe upcoming weekend. Given the mid-October sun angle, an \ninversion aloft and weak winds, mixing will be limited through the\nlatter portion of the week and into the upcoming weekend.\n\n&&\n\n.SLC WATCHES/WARNINGS/ADVISORIES...\nUT...Winter Weather Advisory until 9 PM MDT this evening for UTZ112.\n\nFreeze Warning until 9 AM MDT this morning for UTZ122.\n\nWY...None.\n&&\n\n$$\n\nPUBLIC...Seaman/Traphagan\nAVIATION...Seaman\nFIRE WEATHER...Seaman\n\nFor more information from NOAA's National Weather Service visit...\nhttp://weather.gov/saltlakecity\n"
  },
  "soaringForecast": {
    "@context": {
      "@version": "1.1",
      "@vocab": "https://api.weather.gov/ontology#"
    },
    "@id": "https://api.weather.gov/products/8ae0668e-c1ca-4e15-b0af-c23cf4996cb2",
    "id": "8ae0668e-c1ca-4e15-b0af-c23cf4996cb2",
    "wmoCollectiveId": "UXUS97",
    "issuingOffice": "KSLC",
    "issuanceTime": "2026-10-14T12:27:00+00:00",
    "productCode": "SRG",
    "productName": "Soaring Guidance",
    "productText": "\n000\nUXUS97 KSLC 141227\nSRGSLC\n\nSoaring Forecast\nNational Weather Service Salt Lake City, Utah\n627 AM MDT Wednesday, October 14, 2026\n\nThis forecast is for Wednesday, October 14, 2026:\n\nIf the trigger temperature of 58.2 F/14.5 C is reached...then\n   Thermal Soaring Index....................... Fair\n   Maximum rate of lift........................ 208 ft/min (1.1 m/s)\n   Maximum height of thermals.................. 8134 ft MSL (3207 ft AGL)\n\nForecast maximum temperature................... 56.0 F/13.8 C\nTime of trigger temperature.................... None\nTime of overdevelopment........................ None\nMiddle/high clouds during soaring window....... None\nSurface winds during soaring window............ 20 mph or less\nHeight of the -3 thermal index................. 6508 ft MSL (1581 ft AGL)\nThermal soaring outlook for Thursday 10/15..... Good\n\nWave Soaring Index............................. Not available\n\nRemarks... \n\nSunrise/Sunset.................... 07:38:23 / 18:49:05 MDT\nTotal possible sunshine........... 11 hr 10 min 42 sec (670 min 42 sec)\nAltitude of sun at 13:13:44 MDT... 40.76 degrees\n\nUpper air data from rawinsonde observation taken on 10/14/2026 at 0600 MDT\n\nFreezing level.................. 10610 ft MSL (5683 ft AGL)\nConvective condensation level... 14322 ft MSL (9395 ft AGL)\nLifted condensation level....... 10783 ft MSL (5856 ft AGL)\nLifted index.................... +7.3\nK index......................... +9.9\n\nHeight  Temperature  Wind  Wind Spd  Lapse Rate  ConvectionT  Thermal  Lift Rate\nft MSL  deg C deg F   Dir   kt  m/s  C/km F/kft  deg C deg F   Index    fpm  m/s\n--------------------------------------------------------------------------------\n 26000  -31.1 -24.0   010   26   13   8.2   4.5   34.2  93.5    16.4      M    M\n 24000  -25.7 -14.3   020   27   14   7.5   4.1   32.8  91.1    15.7      M    M\n 22000  -21.2  -6.2   020   26   13   7.5   4.1   31.2  88.1    14.7      M    M\n 20000  -17.0   1.4   025   28   15   6.9   3.8   29.2  84.5    13.3      M    M\n 18000  -13.1   8.4   025   30   15   6.5   3.6   27.1  80.7    11.7      M    M\n 16000   -9.2  15.4   025   29   15   7.4   4.0   24.8  76.7     9.9      M    M\n 14000   -5.4  22.3   025   26   13   6.1   3.3   22.6  72.7     8.2      M    M\n 12000   -2.1  28.2   025   18    9   4.9   2.7   20.0  68.0     5.8      M    M\n 10000    0.8  33.4   035   11    6   5.9   3.2   17.0  62.6     2.9      M    M\n  9000    2.3  36.1   040    9    5   5.6   3.1   15.5  59.9     1.4      M    M\n  8000    4.0  39.2   035    6    3   3.9   2.1   13.6  56.5    -0.4    192  1.0\n  7000    5.1  41.2   030    4    2   3.1   1.7   11.7  53.1    -2.3    130  0.7\n  6000    5.9  42.6   095    2    1   2.7   1.5    9.6  49.4    -4.4     75  0.4\n  5000    5.0  41.0   120    4    2 -27.2 -14.9    5.9  42.6    -8.3     73  0.4\n\n * * * * * * Numerical weather prediction model forecast data valid * * * * * * \n\n           10/14/2026 at 0900 MDT          |       10/14/2026 at 1200 MDT        \n                                           |\nCAPE...   +24.3    LI...       +1.8        | CAPE...   +34.7    LI...       +2.8\nCINH...    -1.3    K Index... +17.2        | CINH...    -0.1    K Index... +16.5\n                                           |\nHeight Temperature  Wnd WndSpd  Lapse Rate | Temperature  Wnd WndSpd  Lapse Rate\nft MSL deg C deg F  Dir kt m/s  C/km F/kft | deg C deg F  Dir kt m/s  C/km F/kft\n--------------------------------------------------------------------------------\n 26000 -31.8 -25.2  020  26 13   3.8   2.1 | -32.2 -26.0  030  24 12   4.9   2.7\n 24000 -29.6 -21.3  045  21 11   3.9   2.1 | -29.3 -20.7  080  16  8   5.6   3.0\n 22000 -26.0 -14.8  065  18  9   5.6   3.1 | -24.4 -11.9  090  15  8   7.4   4.1\n 20000 -22.0  -7.6  065  15  8   7.2   4.0 | -20.0  -4.0  065  12  6   7.4   4.1\n 18000 -17.6   0.3  050  13  7   7.8   4.3 | -15.6   3.9  030  17  9   7.3   4.0\n 16000 -13.1   8.4  035  15  8   7.1   3.9 | -11.7  10.9  025  23 12   6.3   3.4\n 14000  -9.2  15.4  025  17  9   5.8   3.2 |  -8.1  17.4  030  23 12   6.0   3.3\n 12000  -6.2  20.8  015  17  9   5.1   2.8 |  -5.0  23.0  030  20 11   5.1   2.8\n 10000  -3.2  26.2  010  13  6   5.7   3.1 |  -2.1  28.2  020  16  8   5.1   2.8\n  9000  -1.3  29.7  010  11  6   6.0   3.3 |  -0.6  30.9  015  13  7   4.8   2.6\n  8000   0.0  32.0  360  10  5   5.2   2.9 |   0.7  33.3  360  10  5   5.4   2.9\n  7000   1.9  35.4  345  11  5   6.3   3.5 |   2.4  36.3  350   8  4   6.9   3.8\n  6000   3.9  39.0  335  10  5   7.4   4.1 |   4.5  40.1  330   8  4   8.9   4.9\n  5000   6.9  44.4  320   6  3  18.9  10.4 |   8.7  47.7  320   6  3  43.5  23.9\n\n           10/14/2026 at 1500 MDT          |       10/14/2026 at 1800 MDT        \n                                           |\nCAPE...   +48.1    LI...       +2.5        | CAPE...   +51.8    LI...       +2.6\nCINH...    -0.0    K Index... +21.0        | CINH...    -3.1    K Index... +17.8\n                                           |\nHeight Temperature  Wnd WndSpd  Lapse Rate | Temperature  Wnd WndSpd  Lapse Rate\nft MSL deg C deg F  Dir kt m/s  C/km F/kft | deg C deg F  Dir kt m/s  C/km F/kft\n--------------------------------------------------------------------------------\n 26000 -31.8 -25.2  085  12  6   8.0   4.4 | -31.3 -24.3  015  11  6   8.8   4.8\n 24000 -27.0 -16.6  120  17  9   7.7   4.2 | -26.1 -15.0  360   9  5   8.1   4.5\n 22000 -22.1  -7.8  145  12  6   7.2   4.0 | -20.9  -5.6  325  13  7   7.7   4.2\n 20000 -18.2  -0.8  105   3  2   6.4   3.5 | -17.4   0.7  345  20 11   4.9   2.7\n 18000 -14.5   5.9  015  14  7   5.9   3.2 | -14.2   6.4  005  28 14   6.0   3.3\n 16000 -11.6  11.1  020  23 12   4.6   2.5 | -10.8  12.6  010  27 14   5.7   3.1\n 14000  -8.4  16.9  025  24 12   6.3   3.4 |  -7.5  18.5  005  24 12   6.2   3.4\n 12000  -4.7  23.5  020  22 11   6.5   3.6 |  -3.8  25.2  355  22 11   6.1   3.4\n 10000  -1.2  29.8  015  17  9   5.4   3.0 |  -0.6  30.9  345  19 10   5.3   2.9\n  9000   0.4  32.7  005  15  8   4.9   2.7 |   0.9  33.6  345  18  9   6.0   3.3\n  8000   1.7  35.1  350  13  7   5.9   3.2 |   2.6  36.7  335  15  8   7.3   4.0\n  7000   3.5  38.3  330  11  6   6.2   3.4 |   4.7  40.5  325  12  6   6.5   3.6\n  6000   5.5  41.9  315  10  5   8.8   4.8 |   6.8  44.2  310   9  5   7.2   3.9\n  5000   8.1  46.6  310   8  4  10.3   5.7 |   9.2  48.6  300   6  3   7.3   4.0\n________________________________________________________________________________\n\nThis product is issued once per day by approximately 0600 MST/0700 MDT \n(1300 UTC). This product is not continuously monitored nor updated after\nthe initial issuance. \n\nThe information contained herein is based on the 1200 UTC rawinsonde observation\nat the Salt Lake City, Utah International Airport and/or numerical weather \nprediction model data representative of the airport. These data may not be\nrepresentative of other areas along the Wasatch Front. Erroneous data such as\nthese should not be used.\n\nThe content and format of this report as well as the issuance times are subject\nto change without prior notice.\n\n042025\n"
  },
  "synopticTimeseries": {
    "STATION": [
      {
        "ID": "53",
        "STID": "KSLC",
        "NAME": "Salt Lake City, Salt Lake City International Airport",
        "ELEVATION": "4226.0",
        "LATITUDE": "40.77069",
        "LONGITUDE": "-111.96503",
        "STATUS": "ACTIVE",
        "MNET_ID": "1",
        "STATE": "UT",
        "COUNTRY": "US",
        "TIMEZONE": "America/Denver",
        "ELEV_DEM": "4235.6",
        "PERIOD_OF_RECORD": {
          "start": "1997-01-01T00:00:00Z",
          "end": "2026-10-14T13:23:00Z"
        },
        "UNITS": {
          "position": "ft",
          "elevation": "ft"
        },
        "SENSOR_VARIABLES": {
          "altimeter": {
            "altimeter_set_1": {}
          },
          "air_temp": {
            "air_temp_set_1": {}
          },
          "wind_speed": {
            "wind_speed_set_1": {}
          },
          "wind_direction": {
            "wind_direction_set_1": {}
          },
          "wind_gust": {
            "wind_gust_set_1": {}
          }
        },
        "OBSERVATIONS": {
          "date_time": [
            "7:25 AM",
            "7:30 AM",
            "7:35 AM",
            "7:40 AM",
            "7:45 AM",
            "7:50 AM",
            "7:54 AM",
            "7:55 AM",
            "8:00 AM",
            "8:05 AM",
            "8:10 AM",
            "8:15 AM",
            "8:15 AM"
          ],
          "altimeter_set_1": [
            30.12,
            30.12,
            30.12,
            30.12,
            30.12,
            30.12,
            30.12,
            30.12,
            30.12,
            30.12,
            30.12,
            30.12
          ],
          "air_temp_set_1": [
            46.4,
            46.4,
            46.4,
            46.4,
            46.4,
            46.4,
            46.04,
            46.4,
            46.4,
            46.4,
            46.4,
            46.4
          ],
          "wind_speed_set_1": [
            6.91,
            6.91,
            8.06,
            10.36,
            9.21,
            6.91,
            8.06,
            6.91,
            8.06,
            8.06,
            9.21,
            6.91,
            6.91
          ],
          "wind_direction_set_1": [
            350,
            340,
            330,
            340,
            340,
            350,
            350,
            340,
            320,
            310,
            320,
            330,
            330
          ],
          "wind_gust_set_1": [
            null,
            null,
            null,
            null,
            null,
            null,
            null,
            null,
            null,
            null,
            null,
            null,
            null
          ]
        },
        "QC_FLAGGED": false,
        "RESTRICTED": false,
        "RESTRICTED_METADATA": false
      },
      {
        "ID": "54",
        "STID": "KSVR",
        "NAME": "South Valley Regional Airport",
        "ELEVATION": "4596.0",
        "LATITUDE": "40.61960",
        "LONGITUDE": "-111.99016",
        "STATUS": "ACTIVE",
        "MNET_ID": "1",
        "STATE": "UT",
        "COUNTRY": "US",
        "TIMEZONE": "America/Denver",
        "ELEV_DEM": "4603.0",
        "PERIOD_OF_RECORD": {
          "start": "1997-01-01T00:00:00Z",
          "end": "2026-10-14T13:15:00Z"
        },
        "UNITS": {
          "position": "ft",
          "elevation": "ft"
        },
        "SENSOR_VARIABLES": {
          "altimeter": {
            "altimeter_set_1": {}
          },
          "air_temp": {
            "air_temp_set_1": {}
          },
          "wind_speed": {
            "wind_speed_set_1": {}
          },
          "wind_direction": {
            "wind_direction_set_1": {}
          },
          "wind_gust": {
            "wind_gust_set_1": {}
          }
        },
        "OBSERVATIONS": {
          "date_time": [
            "4:35 AM",
            "4:55 AM",
            "5:15 AM",
            "5:35 AM",
            "5:55 AM",
            "6:15 AM",
            "6:35 AM",
            "6:55 AM",
            "7:15 AM",
            "7:35 AM",
            "7:55 AM",
            "8:15 AM",
            "8:15 AM"
          ],
          "altimeter_set_1": [
            30.11,
            30.11,
            30.11,
            30.11,
            30.11,
            30.12,
            30.12,
            30.13,
            30.13,
            30.13,
            30.13,
            30.13
          ],
          "air_temp_set_1": [
            42.8,
            42.8,
            42.8,
            42.8,
            44.6,
            44.6,
            44.6,
            44.6,
            44.6,
            44.6,
            44.6,
            44.6
          ],
          "wind_speed_set_1": [
            4.6,
            4.6,
            1.15,
            1.15,
            2.3,
            3.45,
            5.75,
            3.45,
            5.75,
            9.21,
            8.06,
            6.91,
            6.91
          ],
          "wind_direction_set_1": [
            60,
            60,
            null,
            20,
            40,
            10,
            10,
            20,
            10,
            360,
            350,
            340,
            340
          ],
          "wind_gust_set_1": [
            null,
            null,
            null,
            null,
            null,
            null,
            null,
            null,
            null,
            null,
            null,
            null,
            null
          ]
        },
        "QC_FLAGGED": false,
        "RESTRICTED": false,
        "RESTRICTED_METADATA": false
      },
      {
        "ID": "477",
        "STID": "UT5",
        "NAME": "MOUTH PARLEYS",
        "ELEVATION": "4853.0",
        "LATITUDE": "40.7122",
        "LONGITUDE": "-111.8019",
        "STATUS": "ACTIVE",
        "MNET_ID": "4",
        "STATE": "UT",
        "COUNTRY": "US",
        "TIMEZONE": "America/Denver",
        "ELEV_DEM": "4868.8",
        "PERIOD_OF_RECORD": {
          "start": "1997-03-27T00:00:00Z",
          "end": "2026-10-14T13:20:00Z"
        },
        "UNITS": {
          "position": "ft",
          "elevation": "ft"
        },
        "SENSOR_VARIABLES": {
          "air_temp": {
            "air_temp_set_1": {}
          },
          "wind_speed": {
            "wind_speed_set_1": {}
          },
          "wind_direction": {
            "wind_direction_set_1": {}
          },
          "wind_gust": {
            "wind_gust_set_1": {}
          }
        },
        "OBSERVATIONS": {
          "date_time": [
            "6:20 AM",
            "6:30 AM",
            "6:40 AM",
            "6:50 AM",
            "7:00 AM",
            "7:10 AM",
            "7:20 AM",
            "7:30 AM",
            "7:40 AM",
            "7:50 AM",
            "8:00 AM",
            "8:10 AM",
            "8:10 AM"
          ],
          "air_temp_set_1": [
            42.81,
            43.46,
            43.04,
            42.81,
            42.96,
            43.49,
            43.11,
            43.01,
            42.81,
            42.63,
            42.78,
            42.78
          ],
          "wind_speed_set_1": [
            1.42,
            1.2,
            0.81,
            0.45,
            1.31,
            1.07,
            1.51,
            1.53,
            2.97,
            2.31,
            1.7,
            1.39,
            1.39
          ],
          "wind_direction_set_1": [
            84.3,
            340.5,
            175.1,
            153.5,
            121.4,
            143.2,
            114.8,
            138,
            92.1,
            96.8,
            152.8,
            245.4,
            245.4
          ],
          "wind_gust_set_1": [
            4.17,
            3.51,
            4.82,
            2.4,
            1.97,
            2.85,
            2.19,
            1.97,
            4.38,
            5.7,
            3.07,
            2.85,
            2.85
          ]
        },
        "QC_FLAGGED": false,
        "RESTRICTED": false,
        "RESTRICTED_METADATA": false
      },
      {
        "ID": "528",
        "STID": "AMB",
        "NAME": "ALTA - MT BALDY",
        "ELEVATION": "11066.0",
        "LATITUDE": "40.5677",
        "LONGITUDE": "-111.6374",
        "STATUS": "ACTIVE",
        "MNET_ID": "6",
        "STATE": "UT",
        "COUNTRY": "US",
        "TIMEZONE": "America/Denver",
        "ELEV_DEM": "10964.6",
        "PERIOD_OF_RECORD": {
          "start": "1998-11-21T00:00:00Z",
          "end": "2026-10-14T12:00:00Z"
        },
        "UNITS": {
          "position": "ft",
          "elevation": "ft"
        },
        "SENSOR_VARIABLES": {
          "air_temp": {
            "air_temp_set_1": {}
          },
          "wind_speed": {
            "wind_speed_set_1": {}
          },
          "wind_direction": {
            "wind_direction_set_1": {}
          },
          "wind_gust": {
            "wind_gust_set_1": {}
          }
        },
        "OBSERVATIONS": {
          "date_time": [
            "2:00 AM",
            "3:00 AM",
            "4:00 AM",
            "5:00 AM",
            "6:00 AM",
            "7:00 AM",
            "7:00 AM"
          ],
          "air_temp_set_1": [
            23.2,
            23.2,
            23.2,
            23.1,
            22.9,
            22.8
          ],
          "wind_speed_set_1": [
            0,
            0,
            0,
            0,
            0,
            0,
            0
          ],
          "wind_direction_set_1": [
            0,
            0,
            0,
            0,
            0,
            0,
            0
          ],
          "wind_gust_set_1": [
            0,
            0,
            0,
            0,
            0,
            0,
            0
          ]
        },
        "QC_FLAGGED": false,
        "RESTRICTED": false,
        "RESTRICTED_METADATA": false
      },
      {
        "ID": "534",
        "STID": "OGP",
        "NAME": "SNOWBASIN - MOUNT OGDEN",
        "ELEVATION": "9570.0",
        "LATITUDE": "41.200",
        "LONGITUDE": "-111.881",
        "STATUS": "ACTIVE",
        "MNET_ID": "8",
        "STATE": "UT",
        "COUNTRY": "US",
        "TIMEZONE": "America/Denver",
        "ELEV_DEM": "9340.6",
        "PERIOD_OF_RECORD": {
          "start": "1997-01-01T00:00:00Z",
          "end": "2026-10-14T13:30:00Z"
        },
        "UNITS": {
          "position": "ft",
          "elevation": "ft"
        },
        "SENSOR_VARIABLES": {
          "air_temp": {
            "air_temp_set_1": {}
          },
          "wind_speed": {
            "wind_speed_set_1": {}
          },
          "wind_direction": {
            "wind_direction_set_1": {}
          },
          "wind_gust": {
            "wind_gust_set_1": {}
          }
        },
        "OBSERVATIONS": {
          "date_time": [
            "5:30 AM",
            "5:45 AM",
            "6:00 AM",
            "6:15 AM",
            "6:30 AM",
            "6:45 AM",
            "7:00 AM",
            "7:15 AM",
            "7:30 AM",
            "7:45 AM",
            "8:00 AM",
            "8:15 AM",
            "8:15 AM"
          ],
          "air_temp_set_1": [
            28.07,
            27.94,
            27.94,
            28.07,
            27.82,
            27.94,
            27.94,
            28.07,
            28.19,
            28.19,
            28.19,
            28.37
          ],
          "wind_speed_set_1": [
            15.67,
            18.3,
            13.76,
            14.21,
            17.41,
            15.21,
            14.39,
            12.23,
            13,
            13.61,
            15.36,
            15.05,
            15.05
          ],
          "wind_direction_set_1": [
            46.73,
            37.64,
            49.23,
            39.08,
            38.03,
            37.48,
            40.88,
            41.67,
            41.14,
            42.28,
            32.08,
            30.62,
            30.62
          ],
          "wind_gust_set_1": [
            23.2,
            21.9,
            21.39,
            18.6,
            21.7,
            20.7,
            18.8,
            15.7,
            18.1,
            20,
            18.9,
            17.3,
            17.3
          ]
        },
        "QC_FLAGGED": false,
        "RESTRICTED": false,
        "RESTRICTED_METADATA": false
      },
      {
        "ID": "538",
        "STID": "HDP",
        "NAME": "Hidden Peak",
        "ELEVATION": "11000.0",
        "LATITUDE": "40.56106",
        "LONGITUDE": "-111.64522",
        "STATUS": "ACTIVE",
        "MNET_ID": "86",
        "STATE": "UT",
        "COUNTRY": "US",
        "TIMEZONE": "America/Denver",
        "ELEV_DEM": "10971.1",
        "PERIOD_OF_RECORD": {
          "start": "1997-01-01T00:00:00Z",
          "end": "2026-10-14T13:00:00Z"
        },
        "UNITS": {
          "position": "ft",
          "elevation": "ft"
        },
        "SENSOR_VARIABLES": {
          "air_temp": {
            "air_temp_set_1": {}
          },
          "wind_speed": {
            "wind_speed_set_1": {}
          },
          "wind_direction": {
            "wind_direction_set_1": {}
          },
          "wind_gust": {
            "wind_gust_set_1": {}
          }
        },
        "OBSERVATIONS": {
          "date_time": [
            "5:15 AM",
            "5:30 AM",
            "5:45 AM",
            "6:00 AM",
            "6:15 AM",
            "6:30 AM",
            "6:45 AM",
            "7:00 AM",
            "7:15 AM",
            "7:30 AM",
            "7:45 AM",
            "8:00 AM",
            "8:00 AM"
          ],
          "air_temp_set_1": [
            23,
            23,
            23,
            23,
            23,
            23,
            23,
            23,
            23,
            23,
            22,
            22
          ],
          "wind_speed_set_1": [
            5.99,
            9,
            5.99,
            8,
            8,
            8,
            7,
            9,
            7,
            11,
            10,
            9,
            9
          ],
          "wind_direction_set_1": [
            22.5,
            0,
            0,
            0,
            0,
            337.5,
            0,
            0,
            0,
            0,
            0,
            337.5,
            337.5
          ],
          "wind_gust_set_1": [
            16,
            16,
            11,
            13,
            13.99,
            11,
            11,
            16,
            11,
            16,
            17,
            17,
            17
          ]
        },
        "QC_FLAGGED": false,
        "RESTRICTED": false,
        "RESTRICTED_METADATA": false
      },
      {
        "ID": "2524",
        "STID": "FPS",
        "NAME": "Flight Park South",
        "ELEVATION": "5202.0",
        "LATITUDE": "40.45689",
        "LONGITUDE": "-111.90483",
        "STATUS": "ACTIVE",
        "MNET_ID": "153",
        "STATE": "UT",
        "COUNTRY": "US",
        "TIMEZONE": "America/Denver",
        "ELEV_DEM": "5154.2",
        "PERIOD_OF_RECORD": {
          "start": "2010-11-23T00:00:00Z",
          "end": "2026-10-14T13:30:00Z"
        },
        "UNITS": {
          "position": "ft",
          "elevation": "ft"
        },
        "SENSOR_VARIABLES": {
          "air_temp": {
            "air_temp_set_1": {}
          },
          "wind_speed": {
            "wind_speed_set_1": {}
          },
          "wind_direction": {
            "wind_direction_set_1": {}
          },
          "wind_gust": {
            "wind_gust_set_1": {}
          },
          "altimeter": {
            "altimeter_set_1d": {
              "derived_from": [
                "pressure_set_1"
              ]
            }
          }
        },
        "OBSERVATIONS": {
          "date_time": [
            "7:25 AM",
            "7:30 AM",
            "7:35 AM",
            "7:40 AM",
            "7:45 AM",
            "7:50 AM",
            "7:55 AM",
            "8:00 AM",
            "8:05 AM",
            "8:10 AM",
            "8:15 AM",
            "8:20 AM",
            "8:20 AM"
          ],
          "air_temp_set_1": [
            40.24,
            40.18,
            40.21,
            40.26,
            40.3,
            40.38,
            40.42,
            40.43,
            40.55,
            40.76,
            41,
            41.28
          ],
          "wind_speed_set_1": [
            15.62,
            18.02,
            17.22,
            19.36,
            20.31,
            21.21,
            21.04,
            20.56,
            19.91,
            17.13,
            16.02,
            19.75,
            19.75
          ],
          "wind_direction_set_1": [
            15.5,
            18.08,
            24.33,
            20.96,
            18.38,
            20.49,
            16.82,
            21.83,
            21.54,
            13.03,
            9.61,
            15.97,
            15.97
          ],
          "wind_gust_set_1": [
            20.52,
            23.02,
            22.88,
            23.55,
            25.73,
            26.04,
            26.87,
            27.23,
            24.47,
            21.66,
            23.5,
            24.47,
            24.47
          ],
          "altimeter_set_1d": [
            30.2,
            30.2,
            30.2,
            30.2,
            30.2,
            30.2,
            30.19,
            30.2,
            30.2,
            30.2,
            30.2,
            30.2
          ]
        },
        "QC_FLAGGED": false,
        "RESTRICTED": false,
        "RESTRICTED_METADATA": false
      },
      {
        "ID": "22477",
        "STID": "BRW",
        "NAME": "BRIGHTON GREAT WESTERN",
        "ELEVATION": "10565.0",
        "LATITUDE": "40.59230",
        "LONGITUDE": "-111.56160",
        "STATUS": "ACTIVE",
        "MNET_ID": "6",
        "STATE": "UT",
        "COUNTRY": "US",
        "TIMEZONE": "America/Denver",
        "ELEV_DEM": "10436.4",
        "PERIOD_OF_RECORD": {
          "start": "2007-12-18T00:00:00Z",
          "end": "2026-10-14T13:00:00Z"
        },
        "UNITS": {
          "position": "ft",
          "elevation": "ft"
        },
        "SENSOR_VARIABLES": {
          "air_temp": {
            "air_temp_set_1": {}
          },
          "wind_speed": {
            "wind_speed_set_1": {}
          },
          "wind_direction": {
            "wind_direction_set_1": {}
          },
          "wind_gust": {
            "wind_gust_set_1": {}
          }
        },
        "OBSERVATIONS": {
          "date_time": [
            "5:15 AM",
            "5:30 AM",
            "5:45 AM",
            "6:00 AM",
            "6:15 AM",
            "6:30 AM",
            "6:45 AM",
            "7:00 AM",
            "7:15 AM",
            "7:30 AM",
            "7:45 AM",
            "8:00 AM",
            "8:00 AM"
          ],
          "air_temp_set_1": [
            24.17,
            24.14,
            24.09,
            24.14,
            24.17,
            24.17,
            24.03,
            23.83,
            23.68,
            23.48,
            23.4,
            23.43
          ],
          "wind_speed_set_1": [
            0,
            0,
            0,
            0,
            0,
            0,
            0,
            0,
            0,
            0,
            0,
            0,
            0
          ],
          "wind_direction_set_1": [
            0,
            0,
            0,
            0,
            0,
            0,
            0,
            0,
            0,
            0,
            0,
            0,
            0
          ],
          "wind_gust_set_1": [
            0,
            0,
            0,
            0,
            0,
            0,
            0,
            0,
            0,
            0,
            0,
            0,
            0
          ]
        },
        "QC_FLAGGED": false,
        "RESTRICTED": false,
        "RESTRICTED_METADATA": false
      },
      {
        "ID": "29319",
        "STID": "D6120",
        "NAME": "DW6120 Sandy",
        "ELEVATION": "5152.89",
        "LATITUDE": "40.55200",
        "LONGITUDE": "-111.80333",
        "STATUS": "ACTIVE",
        "MNET_ID": "65",
        "STATE": "UT",
        "COUNTRY": "US",
        "TIMEZONE": "America/Denver",
        "ELEV_DEM": "5160.8",
        "PERIOD_OF_RECORD": {
          "start": "2010-11-03T00:00:00Z",
          "end": "2026-10-14T13:30:00Z"
        },
        "UNITS": {
          "position": "ft",
          "elevation": "ft"
        },
        "SENSOR_VARIABLES": {
          "altimeter": {
            "altimeter_set_1": {}
          },
          "air_temp": {
            "air_temp_set_1": {}
          },
          "wind_speed": {
            "wind_speed_set_1": {}
          },
          "wind_direction": {
            "wind_direction_set_1": {}
          },
          "wind_gust": {
            "wind_gust_set_1": {}
          }
        },
        "OBSERVATIONS": {
          "date_time": [
            "5:30 AM",
            "5:45 AM",
            "6:01 AM",
            "6:15 AM",
            "6:30 AM",
            "6:45 AM",
            "7:00 AM",
            "7:15 AM",
            "7:30 AM",
            "7:45 AM",
            "8:00 AM",
            "8:15 AM",
            "8:15 AM"
          ],
          "altimeter_set_1": [
            30.27,
            30.27,
            30.28,
            30.28,
            30.29,
            30.29,
            30.29,
            30.3,
            30.3,
            30.29,
            30.29,
            30.3
          ],
          "air_temp_set_1": [
            39,
            39,
            38,
            38,
            38,
            38,
            39,
            39,
            39,
            39,
            39,
            39
          ],
          "wind_speed_set_1": [
            0,
            0,
            0,
            0,
            1,
            0,
            0,
            1,
            2,
            1,
            0,
            0,
            0
          ],
          "wind_direction_set_1": [
            96,
            96,
            95,
            95,
            95,
            95,
            95,
            95,
            95,
            95,
            95,
            95,
            95
          ],
          "wind_gust_set_1": [
            3,
            3,
            2,
            2,
            3,
            2,
            1,
            5,
            5,
            5,
            2,
            0,
            0
          ]
        },
        "QC_FLAGGED": false,
        "RESTRICTED": false,
        "RESTRICTED_METADATA": false
      },
      {
        "ID": "44023",
        "STID": "REY",
        "NAME": "Reynolds Peak",
        "ELEVATION": "9400.0",
        "LATITUDE": "40.662117",
        "LONGITUDE": "-111.646764",
        "STATUS": "ACTIVE",
        "MNET_ID": "6",
        "STATE": "UT",
        "COUNTRY": "US",
        "TIMEZONE": "America/Denver",
        "ELEV_DEM": "9360.2",
        "PERIOD_OF_RECORD": {
          "start": "2014-11-23T09:23:00Z",
          "end": "2026-10-14T13:10:00Z"
        },
        "UNITS": {
          "position": "ft",
          "elevation": "ft"
        },
        "SENSOR_VARIABLES": {
          "air_temp": {
            "air_temp_set_1": {}
          },
          "wind_speed": {
            "wind_speed_set_1": {},
            "wind_speed_set_2": {}
          },
          "wind_direction": {
            "wind_direction_set_1": {},
            "wind_direction_set_2": {}
          },
          "wind_gust": {
            "wind_gust_set_1": {}
          }
        },
        "OBSERVATIONS": {
          "date_time": [
            "6:20 AM",
            "6:30 AM",
            "6:40 AM",
            "6:50 AM",
            "7:00 AM",
            "7:10 AM",
            "7:20 AM",
            "7:30 AM",
            "7:40 AM",
            "7:50 AM",
            "8:00 AM",
            "8:10 AM",
            "8:10 AM"
          ],
          "air_temp_set_1": [
            27.79,
            27.78,
            27.78,
            27.78,
            27.77,
            27.85,
            27.88,
            27.85,
            27.87,
            27.88,
            27.88,
            28.03
          ],
          "wind_speed_set_1": [
            0,
            0,
            0,
            0,
            0,
            0,
            0,
            0,
            0,
            0,
            0,
            0,
            0
          ],
          "wind_direction_set_1": [
            0,
            0,
            0,
            0,
            0,
            0,
            0,
            0,
            0,
            0,
            0,
            0,
            0
          ],
          "wind_gust_set_1": [
            0,
            0,
            0,
            0,
            0,
            0,
            0,
            0,
            0,
            0,
            0,
            0,
            0
          ],
          "wind_speed_set_2": [
            null,
            null,
            null,
            null,
            null,
            null,
            null,
            null,
            null,
            null,
            null,
            null
          ],
          "wind_direction_set_2": [
            null,
            null,
            null,
            null,
            null,
            null,
            null,
            null,
            null,
            null,
            null,
            null
          ]
        },
        "QC_FLAGGED": false,
        "RESTRICTED": false,
        "RESTRICTED_METADATA": false
      },
      {
        "ID": "63736",
        "STID": "UTOLY",
        "NAME": "I-215 at Olympus Cove",
        "ELEVATION": "4972.0",
        "LATITUDE": "40.6826",
        "LONGITUDE": "-111.7973",
        "STATUS": "ACTIVE",
        "MNET_ID": "4",
        "STATE": "UT",
        "COUNTRY": "US",
        "TIMEZONE": "America/Denver",
        "ELEV_DEM": "4973.8",
        "PERIOD_OF_RECORD": {
          "start": "2017-11-30T05:25:00Z",
          "end": "2026-10-14T13:20:00Z"
        },
        "UNITS": {
          "position": "ft",
          "elevation": "ft"
        },
        "SENSOR_VARIABLES": {
          "air_temp": {
            "air_temp_set_1": {}
          },
          "wind_speed": {
            "wind_speed_set_1": {}
          },
          "wind_direction": {
            "wind_direction_set_1": {}
          },
          "wind_gust": {
            "wind_gust_set_1": {}
          }
        },
        "OBSERVATIONS": {
          "date_time": [
            "6:20 AM",
            "6:30 AM",
            "6:40 AM",
            "6:50 AM",
            "7:00 AM",
            "7:10 AM",
            "7:20 AM",
            "7:30 AM",
            "7:40 AM",
            "7:50 AM",
            "8:00 AM",
            "8:10 AM",
            "8:10 AM"
          ],
          "air_temp_set_1": [
            41.77,
            42.13,
            42.6,
            43,
            43.11,
            43.11,
            43.26,
            43.14,
            42.86,
            42.65,
            42.92,
            43.15
          ],
          "wind_speed_set_1": [
            1.21,
            0.51,
            2.64,
            0.92,
            0.51,
            1.69,
            1.77,
            1.34,
            1.58,
            2.21,
            1.35,
            1.34,
            1.34
          ],
          "wind_direction_set_1": [
            55.26,
            133.6,
            192.3,
            176.4,
            106.4,
            180.9,
            333.3,
            79.18,
            98.8,
            136.5,
            167.8,
            335.6,
            335.6
          ],
          "wind_gust_set_1": [
            3.07,
            2.64,
            4.82,
            3.29,
            3.51,
            5.48,
            3.07,
            3.73,
            3.07,
            3.51,
            4.82,
            3.73,
            3.73
          ]
        },
        "QC_FLAGGED": false,
        "RESTRICTED": false,
        "RESTRICTED_METADATA": false
      }
    ],
    "SUMMARY": {
      "NUMBER_OF_OBJECTS": 11,
      "RESPONSE_CODE": 1,
      "RESPONSE_MESSAGE": "OK",
      "METADATA_QUERY_TIME": "3.9 ms",
      "METADATA_PARSE_TIME": "0.5 ms",
      "TOTAL_METADATA_TIME": "4.4 ms",
      "DATA_QUERY_TIME": "6.9 ms",
      "QC_QUERY_TIME": "0.0 ms",
      "DATA_PARSE_TIME": "21.2 ms",
      "TOTAL_DATA_TIME": "28.1 ms",
      "TOTAL_TIME": "32.5 ms",
      "VERSION": "v2.39.7"
    },
    "QC_SUMMARY": {
      "QC_CHECKS_APPLIED": [
        "sl_range_check"
      ],
      "TOTAL_OBSERVATIONS_FLAGGED": 0,
      "PERCENT_OF_TOTAL_OBSERVATIONS_FLAGGED": 0
    },
    "UNITS": {
      "position": "ft",
      "elevation": "ft",
      "altimeter": "INHG",
      "air_temp": "Fahrenheit",
      "wind_speed": "Miles/hour",
      "wind_direction": "Degrees",
      "wind_gust": "Miles/hour"
    }
  },
  "sounding": {
    "date": "2026-10-14",
    "observations": [
      {
        "Altitude_ft": 4229,
        "Temp_c": 7.4,
        "Dewpoint_c": 6.8,
        "Wind_Direction": 148,
        "Wind_Speed_kt": 1.9
      },
      {
        "Altitude_ft": 4252,
        "Temp_c": 7.3,
        "Dewpoint_c": 6.5,
        "Wind_Direction": 143,
        "Wind_Speed_kt": 7.6
      },
      {
        "Altitude_ft": 4275,
        "Temp_c": 7.2,
        "Dewpoint_c": 6.2,
        "Wind_Direction": 142,
        "Wind_Speed_kt": 7.4
      },
      {
        "Altitude_ft": 4298,
        "Temp_c": 7.2,
        "Dewpoint_c": 5.9,
        "Wind_Direction": 142,
        "Wind_Speed_kt": 7.4
      },
      {
        "Altitude_ft": 4321,
        "Temp_c": 7.1,
        "Dewpoint_c": 5.6,
        "Wind_Direction": 142,
        "Wind_Speed_kt": 7.4
      },
      {
        "Altitude_ft": 4347,
        "Temp_c": 7,
        "Dewpoint_c": 5.3,
        "Wind_Direction": 142,
        "Wind_Speed_kt": 7.2
      },
      {
        "Altitude_ft": 4370,
        "Temp_c": 6.9,
        "Dewpoint_c": 5,
        "Wind_Direction": 142,
        "Wind_Speed_kt": 7.2
      },
      {
        "Altitude_ft": 4400,
        "Temp_c": 6.9,
        "Dewpoint_c": 4.6,
        "Wind_Direction": 141,
        "Wind_Speed_kt": 6.2
      },
      {
        "Altitude_ft": 4409,
        "Temp_c": 6.8,
        "Dewpoint_c": 4.6,
        "Wind_Direction": 141,
        "Wind_Speed_kt": 6
      },
      {
        "Altitude_ft": 4429,
        "Temp_c": 6.8,
        "Dewpoint_c": 4.6,
        "Wind_Direction": 141,
        "Wind_Speed_kt": 5.4
      },
      {
        "Altitude_ft": 4449,
        "Temp_c": 6.8,
        "Dewpoint_c": 4.6,
        "Wind_Direction": 140,
        "Wind_Speed_kt": 4.9
      },
      {
        "Altitude_ft": 4469,
        "Temp_c": 6.8,
        "Dewpoint_c": 4.6,
        "Wind_Direction": 140,
        "Wind_Speed_kt": 4.3
      },
      {
        "Altitude_ft": 4488,
        "Temp_c": 6.8,
        "Dewpoint_c": 4.6,
        "Wind_Direction": 139,
        "Wind_Speed_kt": 3.7
      },
      {
        "Altitude_ft": 4505,
        "Temp_c": 6.7,
        "Dewpoint_c": 4.6,
        "Wind_Direction": 137,
        "Wind_Speed_kt": 3.1
      },
      {
        "Altitude_ft": 4524,
        "Temp_c": 6.7,
        "Dewpoint_c": 4.6,
        "Wind_Direction": 136,
        "Wind_Speed_kt": 2.5
      },
      {
        "Altitude_ft": 4541,
        "Temp_c": 6.7,
        "Dewpoint_c": 4.6,
        "Wind_Direction": 133,
        "Wind_Speed_kt": 2.1
      },
      {
        "Altitude_ft": 4557,
        "Temp_c": 6.7,
        "Dewpoint_c": 4.6,
        "Wind_Direction": 134,
        "Wind_Speed_kt": 1.9
      },
      {
        "Altitude_ft": 4573,
        "Temp_c": 6.6,
        "Dewpoint_c": 4.6,
        "Wind_Direction": 134,
        "Wind_Speed_kt": 1.7
      },
      {
        "Altitude_ft": 4593,
        "Temp_c": 6.6,
        "Dewpoint_c": 4.6,
        "Wind_Direction": 135,
        "Wind_Speed_kt": 1.6
      },
      {
        "Altitude_ft": 4610,
        "Temp_c": 6.6,
        "Dewpoint_c": 4.6,
        "Wind_Direction": 137,
        "Wind_Speed_kt": 1.6
      },
      {
        "Altitude_ft": 4626,
        "Temp_c": 6.6,
        "Dewpoint_c": 4.5,
        "Wind_Direction": 138,
        "Wind_Speed_kt": 1.4
      },
      {
        "Altitude_ft": 4642,
        "Temp_c": 6.5,
        "Dewpoint_c": 4.5,
        "Wind_Direction": 140,
        "Wind_Speed_kt": 1.2
      },
      {
        "Altitude_ft": 4659,
        "Temp_c": 6.5,
        "Dewpoint_c": 4.5,
        "Wind_Direction": 143,
        "Wind_Speed_kt": 1.2
      },
      {
        "Altitude_ft": 4678,
        "Temp_c": 6.5,
        "Dewpoint_c": 4.5,
        "Wind_Direction": 147,
        "Wind_Speed_kt": 1
      },
      {
        "Altitude_ft": 4695,
        "Temp_c": 6.4,
        "Dewpoint_c": 4.5,
        "Wind_Direction": 153,
        "Wind_Speed_kt": 0.8
      },
      {
        "Altitude_ft": 4711,
        "Temp_c": 6.4,
        "Dewpoint_c": 4.4,
        "Wind_Direction": 164,
        "Wind_Speed_kt": 0.8
      },
      {
        "Altitude_ft": 4731,
        "Temp_c": 6.4,
        "Dewpoint_c": 4.4,
        "Wind_Direction": 184,
        "Wind_Speed_kt": 0.6
      },
      {
        "Altitude_ft": 4747,
        "Temp_c": 6.3,
        "Dewpoint_c": 4.4,
        "Wind_Direction": 219,
        "Wind_Speed_kt": 0.4
      },
      {
        "Altitude_ft": 4764,
        "Temp_c": 6.3,
        "Dewpoint_c": 4.4,
        "Wind_Direction": 252,
        "Wind_Speed_kt": 0.4
      },
      {
        "Altitude_ft": 4783,
        "Temp_c": 6.3,
        "Dewpoint_c": 4.4,
        "Wind_Direction": 277,
        "Wind_Speed_kt": 0.4
      },
      {
        "Altitude_ft": 4800,
        "Temp_c": 6.2,
        "Dewpoint_c": 4.4,
        "Wind_Direction": 300,
        "Wind_Speed_kt": 0.6
      },
      {
        "Altitude_ft": 4820,
        "Temp_c": 6.2,
        "Dewpoint_c": 4.3,
        "Wind_Direction": 316,
        "Wind_Speed_kt": 0.6
      },
      {
        "Altitude_ft": 4836,
        "Temp_c": 6.1,
        "Dewpoint_c": 4.3,
        "Wind_Direction": 326,
        "Wind_Speed_kt": 0.8
      },
      {
        "Altitude_ft": 4856,
        "Temp_c": 6.1,
        "Dewpoint_c": 4.3,
        "Wind_Direction": 333,
        "Wind_Speed_kt": 1
      },
      {
        "Altitude_ft": 4872,
        "Temp_c": 6.1,
        "Dewpoint_c": 4.3,
        "Wind_Direction": 337,
        "Wind_Speed_kt": 1
      },
      {
        "Altitude_ft": 4888,
        "Temp_c": 6,
        "Dewpoint_c": 4.2,
        "Wind_Direction": 340,
        "Wind_Speed_kt": 1.2
      },
      {
        "Altitude_ft": 4908,
        "Temp_c": 6,
        "Dewpoint_c": 4.2,
        "Wind_Direction": 343,
        "Wind_Speed_kt": 1.2
      },
      {
        "Altitude_ft": 4921,
        "Temp_c": 5.9,
        "Dewpoint_c": 4.2,
        "Wind_Direction": 345,
        "Wind_Speed_kt": 1.4
      },
      {
        "Altitude_ft": 4941,
        "Temp_c": 5.9,
        "Dewpoint_c": 4.1,
        "Wind_Direction": 347,
        "Wind_Speed_kt": 1.4
      },
      {
        "Altitude_ft": 4964,
        "Temp_c": 5.8,
        "Dewpoint_c": 4.1,
        "Wind_Direction": 348,
        "Wind_Speed_kt": 1.6
      },
      {
        "Altitude_ft": 4977,
        "Temp_c": 5.8,
        "Dewpoint_c": 4,
        "Wind_Direction": 349,
        "Wind_Speed_kt": 1.7
      },
      {
        "Altitude_ft": 4993,
        "Temp_c": 5.8,
        "Dewpoint_c": 4,
        "Wind_Direction": 350,
        "Wind_Speed_kt": 1.7
      },
      {
        "Altitude_ft": 5013,
        "Temp_c": 5.7,
        "Dewpoint_c": 3.9,
        "Wind_Direction": 351,
        "Wind_Speed_kt": 1.9
      },
      {
        "Altitude_ft": 5030,
        "Temp_c": 5.7,
        "Dewpoint_c": 3.9,
        "Wind_Direction": 351,
        "Wind_Speed_kt": 1.9
      },
      {
        "Altitude_ft": 5049,
        "Temp_c": 5.6,
        "Dewpoint_c": 3.9,
        "Wind_Direction": 352,
        "Wind_Speed_kt": 2.1
      },
      {
        "Altitude_ft": 5066,
        "Temp_c": 5.6,
        "Dewpoint_c": 3.8,
        "Wind_Direction": 352,
        "Wind_Speed_kt": 2.1
      },
      {
        "Altitude_ft": 5085,
        "Temp_c": 5.5,
        "Dewpoint_c": 3.8,
        "Wind_Direction": 346,
        "Wind_Speed_kt": 2.5
      },
      {
        "Altitude_ft": 5102,
        "Temp_c": 5.5,
        "Dewpoint_c": 3.7,
        "Wind_Direction": 340,
        "Wind_Speed_kt": 2.7
      },
      {
        "Altitude_ft": 5118,
        "Temp_c": 5.5,
        "Dewpoint_c": 3.7,
        "Wind_Direction": 335,
        "Wind_Speed_kt": 2.9
      },
      {
        "Altitude_ft": 5138,
        "Temp_c": 5.4,
        "Dewpoint_c": 3.7,
        "Wind_Direction": 330,
        "Wind_Speed_kt": 3.1
      },
      {
        "Altitude_ft": 5154,
        "Temp_c": 5.4,
        "Dewpoint_c": 3.6,
        "Wind_Direction": 326,
        "Wind_Speed_kt": 3.3
      },
      {
        "Altitude_ft": 5171,
        "Temp_c": 5.3,
        "Dewpoint_c": 3.6,
        "Wind_Direction": 322,
        "Wind_Speed_kt": 3.5
      },
      {
        "Altitude_ft": 5190,
        "Temp_c": 5.3,
        "Dewpoint_c": 3.6,
        "Wind_Direction": 319,
        "Wind_Speed_kt": 3.7
      },
      {
        "Altitude_ft": 5207,
        "Temp_c": 5.2,
        "Dewpoint_c": 3.5,
        "Wind_Direction": 317,
        "Wind_Speed_kt": 4.1
      },
      {
        "Altitude_ft": 5226,
        "Temp_c": 5.2,
        "Dewpoint_c": 3.5,
        "Wind_Direction": 314,
        "Wind_Speed_kt": 4.3
      },
      {
        "Altitude_ft": 5246,
        "Temp_c": 5.1,
        "Dewpoint_c": 3.5,
        "Wind_Direction": 312,
        "Wind_Speed_kt": 4.5
      },
      {
        "Altitude_ft": 5266,
        "Temp_c": 5.1,
        "Dewpoint_c": 3.4,
        "Wind_Direction": 310,
        "Wind_Speed_kt": 4.7
      },
      {
        "Altitude_ft": 5285,
        "Temp_c": 5.1,
        "Dewpoint_c": 3.4,
        "Wind_Direction": 308,
        "Wind_Speed_kt": 4.9
      },
      {
        "Altitude_ft": 5305,
        "Temp_c": 5,
        "Dewpoint_c": 3.3,
        "Wind_Direction": 307,
        "Wind_Speed_kt": 5.1
      },
      {
        "Altitude_ft": 5325,
        "Temp_c": 5,
        "Dewpoint_c": 3.3,
        "Wind_Direction": 306,
        "Wind_Speed_kt": 5.2
      },
      {
        "Altitude_ft": 5344,
        "Temp_c": 4.9,
        "Dewpoint_c": 3.3,
        "Wind_Direction": 304,
        "Wind_Speed_kt": 5.6
      },
      {
        "Altitude_ft": 5367,
        "Temp_c": 4.9,
        "Dewpoint_c": 3.2,
        "Wind_Direction": 303,
        "Wind_Speed_kt": 5.8
      },
      {
        "Altitude_ft": 5387,
        "Temp_c": 4.8,
        "Dewpoint_c": 3.2,
        "Wind_Direction": 302,
        "Wind_Speed_kt": 6
      },
      {
        "Altitude_ft": 5407,
        "Temp_c": 4.8,
        "Dewpoint_c": 3.2,
        "Wind_Direction": 301,
        "Wind_Speed_kt": 6.2
      },
      {
        "Altitude_ft": 5427,
        "Temp_c": 4.7,
        "Dewpoint_c": 3.2,
        "Wind_Direction": 300,
        "Wind_Speed_kt": 6.4
      },
      {
        "Altitude_ft": 5446,
        "Temp_c": 4.7,
        "Dewpoint_c": 3.1,
        "Wind_Direction": 300,
        "Wind_Speed_kt": 6.6
      },
      {
        "Altitude_ft": 5466,
        "Temp_c": 4.7,
        "Dewpoint_c": 3.1,
        "Wind_Direction": 300,
        "Wind_Speed_kt": 6.6
      },
      {
        "Altitude_ft": 5486,
        "Temp_c": 4.6,
        "Dewpoint_c": 3.1,
        "Wind_Direction": 301,
        "Wind_Speed_kt": 6.8
      },
      {
        "Altitude_ft": 5505,
        "Temp_c": 4.6,
        "Dewpoint_c": 3,
        "Wind_Direction": 301,
        "Wind_Speed_kt": 6.8
      },
      {
        "Altitude_ft": 5525,
        "Temp_c": 4.5,
        "Dewpoint_c": 3,
        "Wind_Direction": 301,
        "Wind_Speed_kt": 6.8
      },
      {
        "Altitude_ft": 5541,
        "Temp_c": 4.5,
        "Dewpoint_c": 3,
        "Wind_Direction": 302,
        "Wind_Speed_kt": 6.8
      },
      {
        "Altitude_ft": 5561,
        "Temp_c": 4.4,
        "Dewpoint_c": 2.9,
        "Wind_Direction": 302,
        "Wind_Speed_kt": 6.8
      },
      {
        "Altitude_ft": 5581,
        "Temp_c": 4.4,
        "Dewpoint_c": 2.9,
        "Wind_Direction": 303,
        "Wind_Speed_kt": 6.8
      },
      {
        "Altitude_ft": 5600,
        "Temp_c": 4.3,
        "Dewpoint_c": 2.9,
        "Wind_Direction": 303,
        "Wind_Speed_kt": 6.8
      },
      {
        "Altitude_ft": 5617,
        "Temp_c": 4.3,
        "Dewpoint_c": 2.9,
        "Wind_Direction": 304,
        "Wind_Speed_kt": 7
      },
      {
        "Altitude_ft": 5636,
        "Temp_c": 4.3,
        "Dewpoint_c": 2.8,
        "Wind_Direction": 304,
        "Wind_Speed_kt": 7
      },
      {
        "Altitude_ft": 5656,
        "Temp_c": 4.2,
        "Dewpoint_c": 2.8,
        "Wind_Direction": 305,
        "Wind_Speed_kt": 7
      },
      {
        "Altitude_ft": 5673,
        "Temp_c": 4.2,
        "Dewpoint_c": 2.8,
        "Wind_Direction": 305,
        "Wind_Speed_kt": 7
      },
      {
        "Altitude_ft": 5689,
        "Temp_c": 4.1,
        "Dewpoint_c": 2.8,
        "Wind_Direction": 305,
        "Wind_Speed_kt": 7
      },
      {
        "Altitude_ft": 5705,
        "Temp_c": 4.1,
        "Dewpoint_c": 2.7,
        "Wind_Direction": 306,
        "Wind_Speed_kt": 7
      },
      {
        "Altitude_ft": 5719,
        "Temp_c": 4,
        "Dewpoint_c": 2.7,
        "Wind_Direction": 306,
        "Wind_Speed_kt": 7.2
      },
      {
        "Altitude_ft": 5735,
        "Temp_c": 4,
        "Dewpoint_c": 2.7,
        "Wind_Direction": 307,
        "Wind_Speed_kt": 7.2
      },
      {
        "Altitude_ft": 5751,
        "Temp_c": 4,
        "Dewpoint_c": 2.7,
        "Wind_Direction": 307,
        "Wind_Speed_kt": 7.2
      },
      {
        "Altitude_ft": 5771,
        "Temp_c": 3.9,
        "Dewpoint_c": 2.6,
        "Wind_Direction": 307,
        "Wind_Speed_kt": 7.2
      },
      {
        "Altitude_ft": 5787,
        "Temp_c": 3.9,
        "Dewpoint_c": 2.6,
        "Wind_Direction": 308,
        "Wind_Speed_kt": 7.2
      },
      {
        "Altitude_ft": 5804,
        "Temp_c": 3.8,
        "Dewpoint_c": 2.6,
        "Wind_Direction": 308,
        "Wind_Speed_kt": 7.2
      },
      {
        "Altitude_ft": 5823,
        "Temp_c": 3.8,
        "Dewpoint_c": 2.6,
        "Wind_Direction": 309,
        "Wind_Speed_kt": 7.2
      },
      {
        "Altitude_ft": 5840,
        "Temp_c": 3.8,
        "Dewpoint_c": 2.5,
        "Wind_Direction": 310,
        "Wind_Speed_kt": 7.2
      },
      {
        "Altitude_ft": 5860,
        "Temp_c": 3.7,
        "Dewpoint_c": 2.5,
        "Wind_Direction": 311,
        "Wind_Speed_kt": 7.2
      },
      {
        "Altitude_ft": 5876,
        "Temp_c": 3.7,
        "Dewpoint_c": 2.5,
        "Wind_Direction": 312,
        "Wind_Speed_kt": 7.2
      },
      {
        "Altitude_ft": 5896,
        "Temp_c": 3.6,
        "Dewpoint_c": 2.4,
        "Wind_Direction": 312,
        "Wind_Speed_kt": 7.2
      },
      {
        "Altitude_ft": 5906,
        "Temp_c": 3.6,
        "Dewpoint_c": 2.4,
        "Wind_Direction": 313,
        "Wind_Speed_kt": 7.2
      },
      {
        "Altitude_ft": 5932,
        "Temp_c": 3.6,
        "Dewpoint_c": 2.4,
        "Wind_Direction": 314,
        "Wind_Speed_kt": 7.2
      },
      {
        "Altitude_ft": 5951,
        "Temp_c": 3.5,
        "Dewpoint_c": 2.4,
        "Wind_Direction": 315,
        "Wind_Speed_kt": 7.2
      },
      {
        "Altitude_ft": 5971,
        "Temp_c": 3.5,
        "Dewpoint_c": 2.3,
        "Wind_Direction": 316,
        "Wind_Speed_kt": 7.2
      },
      {
        "Altitude_ft": 5991,
        "Temp_c": 3.5,
        "Dewpoint_c": 2.3,
        "Wind_Direction": 316,
        "Wind_Speed_kt": 7.2
      },
      {
        "Altitude_ft": 6010,
        "Temp_c": 3.4,
        "Dewpoint_c": 2.3,
        "Wind_Direction": 317,
        "Wind_Speed_kt": 7.2
      },
      {
        "Altitude_ft": 6030,
        "Temp_c": 3.4,
        "Dewpoint_c": 2.2,
        "Wind_Direction": 318,
        "Wind_Speed_kt": 7.2
      },
      {
        "Altitude_ft": 6050,
        "Temp_c": 3.3,
        "Dewpoint_c": 2.2,
        "Wind_Direction": 319,
        "Wind_Speed_kt": 7
      },
      {
        "Altitude_ft": 6073,
        "Temp_c": 3.3,
        "Dewpoint_c": 2.2,
        "Wind_Direction": 320,
        "Wind_Speed_kt": 7
      },
      {
        "Altitude_ft": 6093,
        "Temp_c": 3.3,
        "Dewpoint_c": 2.1,
        "Wind_Direction": 321,
        "Wind_Speed_kt": 7
      },
      {
        "Altitude_ft": 6112,
        "Temp_c": 3.2,
        "Dewpoint_c": 2.1,
        "Wind_Direction": 321,
        "Wind_Speed_kt": 7
      },
      {
        "Altitude_ft": 6132,
        "Temp_c": 3.2,
        "Dewpoint_c": 2.1,
        "Wind_Direction": 322,
        "Wind_Speed_kt": 7
      },
      {
        "Altitude_ft": 6152,
        "Temp_c": 3.1,
        "Dewpoint_c": 2,
        "Wind_Direction": 323,
        "Wind_Speed_kt": 7
      },
      {
        "Altitude_ft": 6171,
        "Temp_c": 3.1,
        "Dewpoint_c": 2,
        "Wind_Direction": 324,
        "Wind_Speed_kt": 7.2
      },
      {
        "Altitude_ft": 6191,
        "Temp_c": 3,
        "Dewpoint_c": 2,
        "Wind_Direction": 325,
        "Wind_Speed_kt": 7.2
      },
      {
        "Altitude_ft": 6211,
        "Temp_c": 3,
        "Dewpoint_c": 1.9,
        "Wind_Direction": 326,
        "Wind_Speed_kt": 7.2
      },
      {
        "Altitude_ft": 6230,
        "Temp_c": 3,
        "Dewpoint_c": 1.9,
        "Wind_Direction": 327,
        "Wind_Speed_kt": 7.4
      },
      {
        "Altitude_ft": 6250,
        "Temp_c": 2.9,
        "Dewpoint_c": 1.9,
        "Wind_Direction": 328,
        "Wind_Speed_kt": 7.4
      },
      {
        "Altitude_ft": 6266,
        "Temp_c": 2.9,
        "Dewpoint_c": 1.8,
        "Wind_Direction": 329,
        "Wind_Speed_kt": 7.6
      },
      {
        "Altitude_ft": 6286,
        "Temp_c": 2.8,
        "Dewpoint_c": 1.8,
        "Wind_Direction": 330,
        "Wind_Speed_kt": 7.6
      },
      {
        "Altitude_ft": 6306,
        "Temp_c": 2.8,
        "Dewpoint_c": 1.8,
        "Wind_Direction": 331,
        "Wind_Speed_kt": 7.8
      },
      {
        "Altitude_ft": 6325,
        "Temp_c": 2.7,
        "Dewpoint_c": 1.7,
        "Wind_Direction": 332,
        "Wind_Speed_kt": 8
      },
      {
        "Altitude_ft": 6345,
        "Temp_c": 2.7,
        "Dewpoint_c": 1.7,
        "Wind_Direction": 333,
        "Wind_Speed_kt": 8
      },
      {
        "Altitude_ft": 6365,
        "Temp_c": 2.6,
        "Dewpoint_c": 1.7,
        "Wind_Direction": 334,
        "Wind_Speed_kt": 8.2
      },
      {
        "Altitude_ft": 6381,
        "Temp_c": 2.6,
        "Dewpoint_c": 1.7,
        "Wind_Direction": 335,
        "Wind_Speed_kt": 8.2
      },
      {
        "Altitude_ft": 6401,
        "Temp_c": 2.6,
        "Dewpoint_c": 1.7,
        "Wind_Direction": 336,
        "Wind_Speed_kt": 8.4
      },
      {
        "Altitude_ft": 6421,
        "Temp_c": 2.6,
        "Dewpoint_c": 1.6,
        "Wind_Direction": 337,
        "Wind_Speed_kt": 8.6
      },
      {
        "Altitude_ft": 6440,
        "Temp_c": 2.6,
        "Dewpoint_c": 1.6,
        "Wind_Direction": 338,
        "Wind_Speed_kt": 8.6
      },
      {
        "Altitude_ft": 6460,
        "Temp_c": 2.5,
        "Dewpoint_c": 1.6,
        "Wind_Direction": 339,
        "Wind_Speed_kt": 8.6
      },
      {
        "Altitude_ft": 6480,
        "Temp_c": 2.5,
        "Dewpoint_c": 1.6,
        "Wind_Direction": 340,
        "Wind_Speed_kt": 8.7
      },
      {
        "Altitude_ft": 6499,
        "Temp_c": 2.5,
        "Dewpoint_c": 1.6,
        "Wind_Direction": 340,
        "Wind_Speed_kt": 8.9
      },
      {
        "Altitude_ft": 6519,
        "Temp_c": 2.5,
        "Dewpoint_c": 1.6,
        "Wind_Direction": 341,
        "Wind_Speed_kt": 8.9
      },
      {
        "Altitude_ft": 6539,
        "Temp_c": 2.5,
        "Dewpoint_c": 1.6,
        "Wind_Direction": 342,
        "Wind_Speed_kt": 9.1
      },
      {
        "Altitude_ft": 6555,
        "Temp_c": 2.4,
        "Dewpoint_c": 1.6,
        "Wind_Direction": 343,
        "Wind_Speed_kt": 9.3
      },
      {
        "Altitude_ft": 6575,
        "Temp_c": 2.4,
        "Dewpoint_c": 1.6,
        "Wind_Direction": 343,
        "Wind_Speed_kt": 9.3
      },
      {
        "Altitude_ft": 6594,
        "Temp_c": 2.4,
        "Dewpoint_c": 1.6,
        "Wind_Direction": 343,
        "Wind_Speed_kt": 9.3
      },
      {
        "Altitude_ft": 6614,
        "Temp_c": 2.4,
        "Dewpoint_c": 1.6,
        "Wind_Direction": 343,
        "Wind_Speed_kt": 9.3
      },
      {
        "Altitude_ft": 6634,
        "Temp_c": 2.3,
        "Dewpoint_c": 1.5,
        "Wind_Direction": 343,
        "Wind_Speed_kt": 9.3
      },
      {
        "Altitude_ft": 6654,
        "Temp_c": 2.3,
        "Dewpoint_c": 1.5,
        "Wind_Direction": 342,
        "Wind_Speed_kt": 9.5
      },
      {
        "Altitude_ft": 6673,
        "Temp_c": 2.3,
        "Dewpoint_c": 1.5,
        "Wind_Direction": 342,
        "Wind_Speed_kt": 9.5
      },
      {
        "Altitude_ft": 6696,
        "Temp_c": 2.2,
        "Dewpoint_c": 1.4,
        "Wind_Direction": 342,
        "Wind_Speed_kt": 9.5
      },
      {
        "Altitude_ft": 6716,
        "Temp_c": 2.2,
        "Dewpoint_c": 1.4,
        "Wind_Direction": 342,
        "Wind_Speed_kt": 9.5
      },
      {
        "Altitude_ft": 6736,
        "Temp_c": 2.2,
        "Dewpoint_c": 1.4,
        "Wind_Direction": 342,
        "Wind_Speed_kt": 9.5
      },
      {
        "Altitude_ft": 6759,
        "Temp_c": 2.1,
        "Dewpoint_c": 1.4,
        "Wind_Direction": 341,
        "Wind_Speed_kt": 9.5
      },
      {
        "Altitude_ft": 6778,
        "Temp_c": 2.1,
        "Dewpoint_c": 1.3,
        "Wind_Direction": 341,
        "Wind_Speed_kt": 9.5
      },
      {
        "Altitude_ft": 6801,
        "Temp_c": 2.1,
        "Dewpoint_c": 1.3,
        "Wind_Direction": 341,
        "Wind_Speed_kt": 9.5
      },
      {
        "Altitude_ft": 6821,
        "Temp_c": 2,
        "Dewpoint_c": 1.3,
        "Wind_Direction": 341,
        "Wind_Speed_kt": 9.5
      },
      {
        "Altitude_ft": 6841,
        "Temp_c": 2,
        "Dewpoint_c": 1.2,
        "Wind_Direction": 341,
        "Wind_Speed_kt": 9.5
      },
      {
        "Altitude_ft": 6864,
        "Temp_c": 2,
        "Dewpoint_c": 1.2,
        "Wind_Direction": 340,
        "Wind_Speed_kt": 9.5
      },
      {
        "Altitude_ft": 6890,
        "Temp_c": 1.9,
        "Dewpoint_c": 1.2,
        "Wind_Direction": 340,
        "Wind_Speed_kt": 9.5
      },
      {
        "Altitude_ft": 6903,
        "Temp_c": 1.9,
        "Dewpoint_c": 1.1,
        "Wind_Direction": 340,
        "Wind_Speed_kt": 9.5
      },
      {
        "Altitude_ft": 6923,
        "Temp_c": 1.9,
        "Dewpoint_c": 1.1,
        "Wind_Direction": 340,
        "Wind_Speed_kt": 9.5
      },
      {
        "Altitude_ft": 6946,
        "Temp_c": 1.8,
        "Dewpoint_c": 1.1,
        "Wind_Direction": 340,
        "Wind_Speed_kt": 9.5
      },
      {
        "Altitude_ft": 6965,
        "Temp_c": 1.8,
        "Dewpoint_c": 1.1,
        "Wind_Direction": 339,
        "Wind_Speed_kt": 9.5
      },
      {
        "Altitude_ft": 6985,
        "Temp_c": 1.8,
        "Dewpoint_c": 1,
        "Wind_Direction": 339,
        "Wind_Speed_kt": 9.5
      },
      {
        "Altitude_ft": 7005,
        "Temp_c": 1.7,
        "Dewpoint_c": 1,
        "Wind_Direction": 340,
        "Wind_Speed_kt": 9.5
      },
      {
        "Altitude_ft": 7028,
        "Temp_c": 1.7,
        "Dewpoint_c": 1,
        "Wind_Direction": 340,
        "Wind_Speed_kt": 9.5
      },
      {
        "Altitude_ft": 7047,
        "Temp_c": 1.7,
        "Dewpoint_c": 1,
        "Wind_Direction": 341,
        "Wind_Speed_kt": 9.3
      },
      {
        "Altitude_ft": 7067,
        "Temp_c": 1.7,
        "Dewpoint_c": 0.9,
        "Wind_Direction": 341,
        "Wind_Speed_kt": 9.3
      },
      {
        "Altitude_ft": 7083,
        "Temp_c": 1.6,
        "Dewpoint_c": 0.9,
        "Wind_Direction": 341,
        "Wind_Speed_kt": 9.1
      },
      {
        "Altitude_ft": 7103,
        "Temp_c": 1.6,
        "Dewpoint_c": 0.9,
        "Wind_Direction": 342,
        "Wind_Speed_kt": 9.1
      },
      {
        "Altitude_ft": 7119,
        "Temp_c": 1.6,
        "Dewpoint_c": 0.9,
        "Wind_Direction": 342,
        "Wind_Speed_kt": 8.9
      },
      {
        "Altitude_ft": 7136,
        "Temp_c": 1.5,
        "Dewpoint_c": 0.8,
        "Wind_Direction": 343,
        "Wind_Speed_kt": 8.9
      },
      {
        "Altitude_ft": 7156,
        "Temp_c": 1.5,
        "Dewpoint_c": 0.8,
        "Wind_Direction": 343,
        "Wind_Speed_kt": 8.7
      },
      {
        "Altitude_ft": 7172,
        "Temp_c": 1.5,
        "Dewpoint_c": 0.8,
        "Wind_Direction": 344,
        "Wind_Speed_kt": 8.7
      },
      {
        "Altitude_ft": 7192,
        "Temp_c": 1.4,
        "Dewpoint_c": 0.8,
        "Wind_Direction": 344,
        "Wind_Speed_kt": 8.6
      },
      {
        "Altitude_ft": 7208,
        "Temp_c": 1.4,
        "Dewpoint_c": 0.8,
        "Wind_Direction": 345,
        "Wind_Speed_kt": 8.6
      },
      {
        "Altitude_ft": 7228,
        "Temp_c": 1.4,
        "Dewpoint_c": 0.7,
        "Wind_Direction": 345,
        "Wind_Speed_kt": 8.4
      },
      {
        "Altitude_ft": 7247,
        "Temp_c": 1.4,
        "Dewpoint_c": 0.7,
        "Wind_Direction": 346,
        "Wind_Speed_kt": 8.4
      },
      {
        "Altitude_ft": 7264,
        "Temp_c": 1.3,
        "Dewpoint_c": 0.7,
        "Wind_Direction": 346,
        "Wind_Speed_kt": 8.4
      },
      {
        "Altitude_ft": 7283,
        "Temp_c": 1.3,
        "Dewpoint_c": 0.7,
        "Wind_Direction": 347,
        "Wind_Speed_kt": 8.2
      },
      {
        "Altitude_ft": 7303,
        "Temp_c": 1.3,
        "Dewpoint_c": 0.6,
        "Wind_Direction": 347,
        "Wind_Speed_kt": 8.2
      },
      {
        "Altitude_ft": 7323,
        "Temp_c": 1.3,
        "Dewpoint_c": 0.6,
        "Wind_Direction": 348,
        "Wind_Speed_kt": 8
      },
      {
        "Altitude_ft": 7343,
        "Temp_c": 1.2,
        "Dewpoint_c": 0.6,
        "Wind_Direction": 348,
        "Wind_Speed_kt": 8
      },
      {
        "Altitude_ft": 7359,
        "Temp_c": 1.2,
        "Dewpoint_c": 0.6,
        "Wind_Direction": 349,
        "Wind_Speed_kt": 7.8
      },
      {
        "Altitude_ft": 7379,
        "Temp_c": 1.2,
        "Dewpoint_c": 0.6,
        "Wind_Direction": 349,
        "Wind_Speed_kt": 7.8
      },
      {
        "Altitude_ft": 7395,
        "Temp_c": 1.1,
        "Dewpoint_c": 0.5,
        "Wind_Direction": 349,
        "Wind_Speed_kt": 8
      },
      {
        "Altitude_ft": 7411,
        "Temp_c": 1.1,
        "Dewpoint_c": 0.5,
        "Wind_Direction": 348,
        "Wind_Speed_kt": 8
      },
      {
        "Altitude_ft": 7431,
        "Temp_c": 1.1,
        "Dewpoint_c": 0.5,
        "Wind_Direction": 348,
        "Wind_Speed_kt": 8
      },
      {
        "Altitude_ft": 7448,
        "Temp_c": 1,
        "Dewpoint_c": 0.4,
        "Wind_Direction": 348,
        "Wind_Speed_kt": 8
      },
      {
        "Altitude_ft": 7464,
        "Temp_c": 1,
        "Dewpoint_c": 0.4,
        "Wind_Direction": 348,
        "Wind_Speed_kt": 8
      },
      {
        "Altitude_ft": 7480,
        "Temp_c": 1,
        "Dewpoint_c": 0.4,
        "Wind_Direction": 348,
        "Wind_Speed_kt": 8
      },
      {
        "Altitude_ft": 7500,
        "Temp_c": 0.9,
        "Dewpoint_c": 0.3,
        "Wind_Direction": 347,
        "Wind_Speed_kt": 8
      },
      {
        "Altitude_ft": 7516,
        "Temp_c": 0.9,
        "Dewpoint_c": 0.3,
        "Wind_Direction": 347,
        "Wind_Speed_kt": 8
      },
      {
        "Altitude_ft": 7533,
        "Temp_c": 0.9,
        "Dewpoint_c": 0.3,
        "Wind_Direction": 347,
        "Wind_Speed_kt": 8
      },
      {
        "Altitude_ft": 7549,
        "Temp_c": 0.8,
        "Dewpoint_c": 0.2,
        "Wind_Direction": 347,
        "Wind_Speed_kt": 8
      },
      {
        "Altitude_ft": 7569,
        "Temp_c": 0.8,
        "Dewpoint_c": 0.2,
        "Wind_Direction": 347,
        "Wind_Speed_kt": 8
      },
      {
        "Altitude_ft": 7589,
        "Temp_c": 0.8,
        "Dewpoint_c": 0.2,
        "Wind_Direction": 346,
        "Wind_Speed_kt": 8
      },
      {
        "Altitude_ft": 7605,
        "Temp_c": 0.7,
        "Dewpoint_c": 0.1,
        "Wind_Direction": 346,
        "Wind_Speed_kt": 8.2
      },
      {
        "Altitude_ft": 7625,
        "Temp_c": 0.7,
        "Dewpoint_c": 0.1,
        "Wind_Direction": 346,
        "Wind_Speed_kt": 8.2
      },
      {
        "Altitude_ft": 7644,
        "Temp_c": 0.7,
        "Dewpoint_c": 0.1,
        "Wind_Direction": 346,
        "Wind_Speed_kt": 8.2
      },
      {
        "Altitude_ft": 7664,
        "Temp_c": 0.6,
        "Dewpoint_c": 0,
        "Wind_Direction": 346,
        "Wind_Speed_kt": 8.2
      },
      {
        "Altitude_ft": 7684,
        "Temp_c": 0.6,
        "Dewpoint_c": 0,
        "Wind_Direction": 345,
        "Wind_Speed_kt": 8.2
      },
      {
        "Altitude_ft": 7703,
        "Temp_c": 0.6,
        "Dewpoint_c": -0.1,
        "Wind_Direction": 345,
        "Wind_Speed_kt": 8.2
      },
      {
        "Altitude_ft": 7723,
        "Temp_c": 0.5,
        "Dewpoint_c": -0.1,
        "Wind_Direction": 345,
        "Wind_Speed_kt": 8.2
      },
      {
        "Altitude_ft": 7746,
        "Temp_c": 0.5,
        "Dewpoint_c": -0.1,
        "Wind_Direction": 346,
        "Wind_Speed_kt": 8
      },
      {
        "Altitude_ft": 7766,
        "Temp_c": 0.5,
        "Dewpoint_c": -0.2,
        "Wind_Direction": 346,
        "Wind_Speed_kt": 8
      },
      {
        "Altitude_ft": 7785,
        "Temp_c": 0.4,
        "Dewpoint_c": -0.2,
        "Wind_Direction": 347,
        "Wind_Speed_kt": 7.8
      },
      {
        "Altitude_ft": 7805,
        "Temp_c": 0.4,
        "Dewpoint_c": -0.2,
        "Wind_Direction": 348,
        "Wind_Speed_kt": 7.6
      },
      {
        "Altitude_ft": 7825,
        "Temp_c": 0.4,
        "Dewpoint_c": -0.3,
        "Wind_Direction": 348,
        "Wind_Speed_kt": 7.4
      },
      {
        "Altitude_ft": 7844,
        "Temp_c": 0.3,
        "Dewpoint_c": -0.3,
        "Wind_Direction": 349,
        "Wind_Speed_kt": 7.2
      },
      {
        "Altitude_ft": 7864,
        "Temp_c": 0.3,
        "Dewpoint_c": -0.3,
        "Wind_Direction": 350,
        "Wind_Speed_kt": 7.2
      },
      {
        "Altitude_ft": 7881,
        "Temp_c": 0.3,
        "Dewpoint_c": -0.4,
        "Wind_Direction": 350,
        "Wind_Speed_kt": 7
      },
      {
        "Altitude_ft": 7900,
        "Temp_c": 0.2,
        "Dewpoint_c": -0.4,
        "Wind_Direction": 351,
        "Wind_Speed_kt": 7
      },
      {
        "Altitude_ft": 7920,
        "Temp_c": 0.2,
        "Dewpoint_c": -0.4,
        "Wind_Direction": 352,
        "Wind_Speed_kt": 6.8
      },
      {
        "Altitude_ft": 7936,
        "Temp_c": 0.2,
        "Dewpoint_c": -0.5,
        "Wind_Direction": 353,
        "Wind_Speed_kt": 6.6
      },
      {
        "Altitude_ft": 7953,
        "Temp_c": 0.1,
        "Dewpoint_c": -0.5,
        "Wind_Direction": 354,
        "Wind_Speed_kt": 6.6
      },
      {
        "Altitude_ft": 7969,
        "Temp_c": 0.1,
        "Dewpoint_c": -0.5,
        "Wind_Direction": 354,
        "Wind_Speed_kt": 6.4
      },
      {
        "Altitude_ft": 7989,
        "Temp_c": 0.1,
        "Dewpoint_c": -0.5,
        "Wind_Direction": 355,
        "Wind_Speed_kt": 6.2
      },
      {
        "Altitude_ft": 8005,
        "Temp_c": 0.1,
        "Dewpoint_c": -0.6,
        "Wind_Direction": 356,
        "Wind_Speed_kt": 6
      },
      {
        "Altitude_ft": 8022,
        "Temp_c": 0,
        "Dewpoint_c": -0.6,
        "Wind_Direction": 357,
        "Wind_Speed_kt": 5.8
      },
      {
        "Altitude_ft": 8041,
        "Temp_c": 0,
        "Dewpoint_c": -0.6,
        "Wind_Direction": 359,
        "Wind_Speed_kt": 5.8
      },
      {
        "Altitude_ft": 8058,
        "Temp_c": 0,
        "Dewpoint_c": -0.7,
        "Wind_Direction": 360,
        "Wind_Speed_kt": 5.6
      },
      {
        "Altitude_ft": 8074,
        "Temp_c": -0.1,
        "Dewpoint_c": -0.7,
        "Wind_Direction": 1,
        "Wind_Speed_kt": 5.4
      },
      {
        "Altitude_ft": 8094,
        "Temp_c": -0.1,
        "Dewpoint_c": -0.7,
        "Wind_Direction": 2,
        "Wind_Speed_kt": 5.4
      },
      {
        "Altitude_ft": 8114,
        "Temp_c": -0.1,
        "Dewpoint_c": -0.7,
        "Wind_Direction": 3,
        "Wind_Speed_kt": 5.4
      },
      {
        "Altitude_ft": 8130,
        "Temp_c": -0.2,
        "Dewpoint_c": -0.8,
        "Wind_Direction": 3,
        "Wind_Speed_kt": 5.6
      },
      {
        "Altitude_ft": 8150,
        "Temp_c": -0.2,
        "Dewpoint_c": -0.8,
        "Wind_Direction": 4,
        "Wind_Speed_kt": 5.6
      },
      {
        "Altitude_ft": 8166,
        "Temp_c": -0.2,
        "Dewpoint_c": -0.8,
        "Wind_Direction": 4,
        "Wind_Speed_kt": 5.8
      },
      {
        "Altitude_ft": 8186,
        "Temp_c": -0.2,
        "Dewpoint_c": -0.9,
        "Wind_Direction": 5,
        "Wind_Speed_kt": 5.8
      },
      {
        "Altitude_ft": 8205,
        "Temp_c": -0.3,
        "Dewpoint_c": -0.9,
        "Wind_Direction": 5,
        "Wind_Speed_kt": 5.8
      },
      {
        "Altitude_ft": 8222,
        "Temp_c": -0.3,
        "Dewpoint_c": -0.9,
        "Wind_Direction": 6,
        "Wind_Speed_kt": 6
      },
      {
        "Altitude_ft": 8241,
        "Temp_c": -0.3,
        "Dewpoint_c": -0.9,
        "Wind_Direction": 6,
        "Wind_Speed_kt": 6
      },
      {
        "Altitude_ft": 8261,
        "Temp_c": -0.4,
        "Dewpoint_c": -1,
        "Wind_Direction": 7,
        "Wind_Speed_kt": 6.2
      },
      {
        "Altitude_ft": 8278,
        "Temp_c": -0.4,
        "Dewpoint_c": -1,
        "Wind_Direction": 7,
        "Wind_Speed_kt": 6.2
      },
      {
        "Altitude_ft": 8297,
        "Temp_c": -0.4,
        "Dewpoint_c": -1,
        "Wind_Direction": 8,
        "Wind_Speed_kt": 6.4
      },
      {
        "Altitude_ft": 8314,
        "Temp_c": -0.5,
        "Dewpoint_c": -1,
        "Wind_Direction": 8,
        "Wind_Speed_kt": 6.4
      },
      {
        "Altitude_ft": 8333,
        "Temp_c": -0.5,
        "Dewpoint_c": -1.1,
        "Wind_Direction": 9,
        "Wind_Speed_kt": 6.6
      },
      {
        "Altitude_ft": 8350,
        "Temp_c": -0.5,
        "Dewpoint_c": -1.1,
        "Wind_Direction": 9,
        "Wind_Speed_kt": 6.6
      },
      {
        "Altitude_ft": 8369,
        "Temp_c": -0.6,
        "Dewpoint_c": -1.1,
        "Wind_Direction": 9,
        "Wind_Speed_kt": 6.6
      },
      {
        "Altitude_ft": 8386,
        "Temp_c": -0.6,
        "Dewpoint_c": -1.2,
        "Wind_Direction": 10,
        "Wind_Speed_kt": 6.8
      },
      {
        "Altitude_ft": 8406,
        "Temp_c": -0.6,
        "Dewpoint_c": -1.2,
        "Wind_Direction": 10,
        "Wind_Speed_kt": 6.8
      },
      {
        "Altitude_ft": 8422,
        "Temp_c": -0.7,
        "Dewpoint_c": -1.2,
        "Wind_Direction": 11,
        "Wind_Speed_kt": 7
      },
      {
        "Altitude_ft": 8442,
        "Temp_c": -0.7,
        "Dewpoint_c": -1.3,
        "Wind_Direction": 11,
        "Wind_Speed_kt": 7
      },
      {
        "Altitude_ft": 8458,
        "Temp_c": -0.7,
        "Dewpoint_c": -1.3,
        "Wind_Direction": 11,
        "Wind_Speed_kt": 7.2
      },
      {
        "Altitude_ft": 8478,
        "Temp_c": -0.8,
        "Dewpoint_c": -1.3,
        "Wind_Direction": 12,
        "Wind_Speed_kt": 7.2
      },
      {
        "Altitude_ft": 8494,
        "Temp_c": -0.8,
        "Dewpoint_c": -1.3,
        "Wind_Direction": 12,
        "Wind_Speed_kt": 7.4
      },
      {
        "Altitude_ft": 8514,
        "Temp_c": -0.8,
        "Dewpoint_c": -1.4,
        "Wind_Direction": 13,
        "Wind_Speed_kt": 7.4
      },
      {
        "Altitude_ft": 8533,
        "Temp_c": -0.8,
        "Dewpoint_c": -1.4,
        "Wind_Direction": 13,
        "Wind_Speed_kt": 7.6
      },
      {
        "Altitude_ft": 8553,
        "Temp_c": -0.9,
        "Dewpoint_c": -1.4,
        "Wind_Direction": 13,
        "Wind_Speed_kt": 7.6
      },
      {
        "Altitude_ft": 8570,
        "Temp_c": -0.9,
        "Dewpoint_c": -1.5,
        "Wind_Direction": 14,
        "Wind_Speed_kt": 7.8
      },
      {
        "Altitude_ft": 8589,
        "Temp_c": -0.9,
        "Dewpoint_c": -1.5,
        "Wind_Direction": 14,
        "Wind_Speed_kt": 7.8
      },
      {
        "Altitude_ft": 8609,
        "Temp_c": -1,
        "Dewpoint_c": -1.5,
        "Wind_Direction": 14,
        "Wind_Speed_kt": 8
      },
      {
        "Altitude_ft": 8629,
        "Temp_c": -1,
        "Dewpoint_c": -1.6,
        "Wind_Direction": 15,
        "Wind_Speed_kt": 8
      },
      {
        "Altitude_ft": 8648,
        "Temp_c": -1,
        "Dewpoint_c": -1.6,
        "Wind_Direction": 15,
        "Wind_Speed_kt": 8.2
      },
      {
        "Altitude_ft": 8665,
        "Temp_c": -1.1,
        "Dewpoint_c": -1.6,
        "Wind_Direction": 15,
        "Wind_Speed_kt": 8.2
      },
      {
        "Altitude_ft": 8681,
        "Temp_c": -1.1,
        "Dewpoint_c": -1.7,
        "Wind_Direction": 16,
        "Wind_Speed_kt": 8.4
      },
      {
        "Altitude_ft": 8701,
        "Temp_c": -1.1,
        "Dewpoint_c": -1.7,
        "Wind_Direction": 16,
        "Wind_Speed_kt": 8.4
      },
      {
        "Altitude_ft": 8720,
        "Temp_c": -1.2,
        "Dewpoint_c": -1.7,
        "Wind_Direction": 16,
        "Wind_Speed_kt": 8.6
      },
      {
        "Altitude_ft": 8737,
        "Temp_c": -1.2,
        "Dewpoint_c": -1.8,
        "Wind_Direction": 17,
        "Wind_Speed_kt": 8.6
      },
      {
        "Altitude_ft": 8757,
        "Temp_c": -1.2,
        "Dewpoint_c": -1.8,
        "Wind_Direction": 17,
        "Wind_Speed_kt": 8.7
      },
      {
        "Altitude_ft": 8773,
        "Temp_c": -1.3,
        "Dewpoint_c": -1.8,
        "Wind_Direction": 17,
        "Wind_Speed_kt": 8.7
      },
      {
        "Altitude_ft": 8789,
        "Temp_c": -1.3,
        "Dewpoint_c": -1.9,
        "Wind_Direction": 17,
        "Wind_Speed_kt": 8.9
      },
      {
        "Altitude_ft": 8809,
        "Temp_c": -1.3,
        "Dewpoint_c": -1.9,
        "Wind_Direction": 18,
        "Wind_Speed_kt": 8.9
      },
      {
        "Altitude_ft": 8825,
        "Temp_c": -1.4,
        "Dewpoint_c": -1.9,
        "Wind_Direction": 18,
        "Wind_Speed_kt": 9.1
      },
      {
        "Altitude_ft": 8845,
        "Temp_c": -1.4,
        "Dewpoint_c": -2,
        "Wind_Direction": 19,
        "Wind_Speed_kt": 9.1
      },
      {
        "Altitude_ft": 8865,
        "Temp_c": -1.4,
        "Dewpoint_c": -2,
        "Wind_Direction": 19,
        "Wind_Speed_kt": 9.3
      },
      {
        "Altitude_ft": 8881,
        "Temp_c": -1.5,
        "Dewpoint_c": -2,
        "Wind_Direction": 20,
        "Wind_Speed_kt": 9.3
      },
      {
        "Altitude_ft": 8901,
        "Temp_c": -1.5,
        "Dewpoint_c": -2.1,
        "Wind_Direction": 20,
        "Wind_Speed_kt": 9.5
      },
      {
        "Altitude_ft": 8921,
        "Temp_c": -1.5,
        "Dewpoint_c": -2.1,
        "Wind_Direction": 21,
        "Wind_Speed_kt": 9.5
      },
      {
        "Altitude_ft": 8937,
        "Temp_c": -1.6,
        "Dewpoint_c": -2.1,
        "Wind_Direction": 21,
        "Wind_Speed_kt": 9.7
      },
      {
        "Altitude_ft": 8957,
        "Temp_c": -1.6,
        "Dewpoint_c": -2.2,
        "Wind_Direction": 22,
        "Wind_Speed_kt": 9.7
      },
      {
        "Altitude_ft": 8976,
        "Temp_c": -1.6,
        "Dewpoint_c": -2.2,
        "Wind_Direction": 22,
        "Wind_Speed_kt": 9.9
      },
      {
        "Altitude_ft": 8996,
        "Temp_c": -1.7,
        "Dewpoint_c": -2.2,
        "Wind_Direction": 22,
        "Wind_Speed_kt": 10.1
      },
      {
        "Altitude_ft": 9016,
        "Temp_c": -1.7,
        "Dewpoint_c": -2.3,
        "Wind_Direction": 23,
        "Wind_Speed_kt": 10.1
      },
      {
        "Altitude_ft": 9035,
        "Temp_c": -1.7,
        "Dewpoint_c": -2.3,
        "Wind_Direction": 23,
        "Wind_Speed_kt": 10.3
      },
      {
        "Altitude_ft": 9052,
        "Temp_c": -1.8,
        "Dewpoint_c": -2.3,
        "Wind_Direction": 24,
        "Wind_Speed_kt": 10.3
      },
      {
        "Altitude_ft": 9072,
        "Temp_c": -1.8,
        "Dewpoint_c": -2.4,
        "Wind_Direction": 24,
        "Wind_Speed_kt": 10.5
      },
      {
        "Altitude_ft": 9088,
        "Temp_c": -1.8,
        "Dewpoint_c": -2.4,
        "Wind_Direction": 25,
        "Wind_Speed_kt": 10.7
      },
      {
        "Altitude_ft": 9108,
        "Temp_c": -1.9,
        "Dewpoint_c": -2.4,
        "Wind_Direction": 25,
        "Wind_Speed_kt": 10.7
      },
      {
        "Altitude_ft": 9127,
        "Temp_c": -1.9,
        "Dewpoint_c": -2.5,
        "Wind_Direction": 25,
        "Wind_Speed_kt": 10.9
      },
      {
        "Altitude_ft": 9144,
        "Temp_c": -1.9,
        "Dewpoint_c": -2.5,
        "Wind_Direction": 26,
        "Wind_Speed_kt": 10.9
      },
      {
        "Altitude_ft": 9160,
        "Temp_c": -2,
        "Dewpoint_c": -2.5,
        "Wind_Direction": 26,
        "Wind_Speed_kt": 11.1
      },
      {
        "Altitude_ft": 9177,
        "Temp_c": -2,
        "Dewpoint_c": -2.6,
        "Wind_Direction": 26,
        "Wind_Speed_kt": 11.3
      },
      {
        "Altitude_ft": 9196,
        "Temp_c": -2,
        "Dewpoint_c": -2.6,
        "Wind_Direction": 27,
        "Wind_Speed_kt": 11.3
      },
      {
        "Altitude_ft": 9213,
        "Temp_c": -2,
        "Dewpoint_c": -2.6,
        "Wind_Direction": 27,
        "Wind_Speed_kt": 11.3
      },
      {
        "Altitude_ft": 9229,
        "Temp_c": -2.1,
        "Dewpoint_c": -2.7,
        "Wind_Direction": 28,
        "Wind_Speed_kt": 11.3
      },
      {
        "Altitude_ft": 9249,
        "Temp_c": -2.1,
        "Dewpoint_c": -2.7,
        "Wind_Direction": 28,
        "Wind_Speed_kt": 11.5
      },
      {
        "Altitude_ft": 9268,
        "Temp_c": -2.1,
        "Dewpoint_c": -2.8,
        "Wind_Direction": 28,
        "Wind_Speed_kt": 11.5
      },
      {
        "Altitude_ft": 9285,
        "Temp_c": -2.2,
        "Dewpoint_c": -2.8,
        "Wind_Direction": 29,
        "Wind_Speed_kt": 11.5
      },
      {
        "Altitude_ft": 9304,
        "Temp_c": -2.2,
        "Dewpoint_c": -2.8,
        "Wind_Direction": 29,
        "Wind_Speed_kt": 11.5
      },
      {
        "Altitude_ft": 9321,
        "Temp_c": -2.2,
        "Dewpoint_c": -2.8,
        "Wind_Direction": 29,
        "Wind_Speed_kt": 11.5
      },
      {
        "Altitude_ft": 9341,
        "Temp_c": -2.3,
        "Dewpoint_c": -2.9,
        "Wind_Direction": 30,
        "Wind_Speed_kt": 11.5
      },
      {
        "Altitude_ft": 9357,
        "Temp_c": -2.3,
        "Dewpoint_c": -2.9,
        "Wind_Direction": 30,
        "Wind_Speed_kt": 11.5
      },
      {
        "Altitude_ft": 9377,
        "Temp_c": -2.3,
        "Dewpoint_c": -2.9,
        "Wind_Direction": 30,
        "Wind_Speed_kt": 11.5
      },
      {
        "Altitude_ft": 9393,
        "Temp_c": -2.3,
        "Dewpoint_c": -3,
        "Wind_Direction": 31,
        "Wind_Speed_kt": 11.7
      },
      {
        "Altitude_ft": 9413,
        "Temp_c": -2.4,
        "Dewpoint_c": -3,
        "Wind_Direction": 31,
        "Wind_Speed_kt": 11.7
      },
      {
        "Altitude_ft": 9429,
        "Temp_c": -2.4,
        "Dewpoint_c": -3,
        "Wind_Direction": 32,
        "Wind_Speed_kt": 11.7
      },
      {
        "Altitude_ft": 9449,
        "Temp_c": -2.4,
        "Dewpoint_c": -3.1,
        "Wind_Direction": 32,
        "Wind_Speed_kt": 11.7
      },
      {
        "Altitude_ft": 9465,
        "Temp_c": -2.5,
        "Dewpoint_c": -3.1,
        "Wind_Direction": 32,
        "Wind_Speed_kt": 11.7
      },
      {
        "Altitude_ft": 9482,
        "Temp_c": -2.5,
        "Dewpoint_c": -3.1,
        "Wind_Direction": 33,
        "Wind_Speed_kt": 11.7
      },
      {
        "Altitude_ft": 9501,
        "Temp_c": -2.5,
        "Dewpoint_c": -3.2,
        "Wind_Direction": 33,
        "Wind_Speed_kt": 11.7
      },
      {
        "Altitude_ft": 9518,
        "Temp_c": -2.6,
        "Dewpoint_c": -3.2,
        "Wind_Direction": 33,
        "Wind_Speed_kt": 11.7
      },
      {
        "Altitude_ft": 9537,
        "Temp_c": -2.6,
        "Dewpoint_c": -3.2,
        "Wind_Direction": 34,
        "Wind_Speed_kt": 11.9
      },
      {
        "Altitude_ft": 9554,
        "Temp_c": -2.6,
        "Dewpoint_c": -3.3,
        "Wind_Direction": 34,
        "Wind_Speed_kt": 11.9
      },
      {
        "Altitude_ft": 9570,
        "Temp_c": -2.7,
        "Dewpoint_c": -3.3,
        "Wind_Direction": 34,
        "Wind_Speed_kt": 11.9
      },
      {
        "Altitude_ft": 9590,
        "Temp_c": -2.7,
        "Dewpoint_c": -3.4,
        "Wind_Direction": 34,
        "Wind_Speed_kt": 11.9
      },
      {
        "Altitude_ft": 9606,
        "Temp_c": -2.7,
        "Dewpoint_c": -3.4,
        "Wind_Direction": 34,
        "Wind_Speed_kt": 12.1
      },
      {
        "Altitude_ft": 9626,
        "Temp_c": -2.8,
        "Dewpoint_c": -3.4,
        "Wind_Direction": 34,
        "Wind_Speed_kt": 12.1
      },
      {
        "Altitude_ft": 9642,
        "Temp_c": -2.8,
        "Dewpoint_c": -3.5,
        "Wind_Direction": 33,
        "Wind_Speed_kt": 12.1
      },
      {
        "Altitude_ft": 9659,
        "Temp_c": -2.8,
        "Dewpoint_c": -3.5,
        "Wind_Direction": 33,
        "Wind_Speed_kt": 12.2
      },
      {
        "Altitude_ft": 9678,
        "Temp_c": -2.8,
        "Dewpoint_c": -3.5,
        "Wind_Direction": 33,
        "Wind_Speed_kt": 12.2
      },
      {
        "Altitude_ft": 9695,
        "Temp_c": -2.9,
        "Dewpoint_c": -3.5,
        "Wind_Direction": 33,
        "Wind_Speed_kt": 12.2
      },
      {
        "Altitude_ft": 9711,
        "Temp_c": -2.9,
        "Dewpoint_c": -3.6,
        "Wind_Direction": 33,
        "Wind_Speed_kt": 12.2
      },
      {
        "Altitude_ft": 9731,
        "Temp_c": -2.9,
        "Dewpoint_c": -3.6,
        "Wind_Direction": 33,
        "Wind_Speed_kt": 12.4
      },
      {
        "Altitude_ft": 9747,
        "Temp_c": -2.9,
        "Dewpoint_c": -3.6,
        "Wind_Direction": 33,
        "Wind_Speed_kt": 12.4
      },
      {
        "Altitude_ft": 9764,
        "Temp_c": -3,
        "Dewpoint_c": -3.7,
        "Wind_Direction": 33,
        "Wind_Speed_kt": 12.4
      },
      {
        "Altitude_ft": 9783,
        "Temp_c": -3,
        "Dewpoint_c": -3.7,
        "Wind_Direction": 33,
        "Wind_Speed_kt": 12.6
      },
      {
        "Altitude_ft": 9800,
        "Temp_c": -3,
        "Dewpoint_c": -3.7,
        "Wind_Direction": 33,
        "Wind_Speed_kt": 12.6
      },
      {
        "Altitude_ft": 9816,
        "Temp_c": -3.1,
        "Dewpoint_c": -3.8,
        "Wind_Direction": 33,
        "Wind_Speed_kt": 12.6
      },
      {
        "Altitude_ft": 9836,
        "Temp_c": -3.1,
        "Dewpoint_c": -3.8,
        "Wind_Direction": 32,
        "Wind_Speed_kt": 12.8
      },
      {
        "Altitude_ft": 9852,
        "Temp_c": -3.1,
        "Dewpoint_c": -3.8,
        "Wind_Direction": 32,
        "Wind_Speed_kt": 12.8
      },
      {
        "Altitude_ft": 9872,
        "Temp_c": -3.2,
        "Dewpoint_c": -3.8,
        "Wind_Direction": 32,
        "Wind_Speed_kt": 12.8
      },
      {
        "Altitude_ft": 9888,
        "Temp_c": -3.2,
        "Dewpoint_c": -3.9,
        "Wind_Direction": 32,
        "Wind_Speed_kt": 12.8
      },
      {
        "Altitude_ft": 9905,
        "Temp_c": -3.2,
        "Dewpoint_c": -3.9,
        "Wind_Direction": 32,
        "Wind_Speed_kt": 13
      },
      {
        "Altitude_ft": 9925,
        "Temp_c": -3.3,
        "Dewpoint_c": -4,
        "Wind_Direction": 32,
        "Wind_Speed_kt": 13
      },
      {
        "Altitude_ft": 9941,
        "Temp_c": -3.3,
        "Dewpoint_c": -4,
        "Wind_Direction": 32,
        "Wind_Speed_kt": 13
      },
      {
        "Altitude_ft": 9961,
        "Temp_c": -3.3,
        "Dewpoint_c": -4,
        "Wind_Direction": 32,
        "Wind_Speed_kt": 13
      },
      {
        "Altitude_ft": 9980,
        "Temp_c": -3.4,
        "Dewpoint_c": -4.1,
        "Wind_Direction": 32,
        "Wind_Speed_kt": 13.2
      },
      {
        "Altitude_ft": 9997,
        "Temp_c": -3.4,
        "Dewpoint_c": -4.1,
        "Wind_Direction": 31,
        "Wind_Speed_kt": 13.2
      },
      {
        "Altitude_ft": 10016,
        "Temp_c": -3.5,
        "Dewpoint_c": -4.2,
        "Wind_Direction": 31,
        "Wind_Speed_kt": 13.2
      },
      {
        "Altitude_ft": 10036,
        "Temp_c": -3.5,
        "Dewpoint_c": -4.2,
        "Wind_Direction": 31,
        "Wind_Speed_kt": 13.2
      },
      {
        "Altitude_ft": 10056,
        "Temp_c": -3.5,
        "Dewpoint_c": -4.2,
        "Wind_Direction": 31,
        "Wind_Speed_kt": 13.2
      },
      {
        "Altitude_ft": 10085,
        "Temp_c": -3.6,
        "Dewpoint_c": -4.3,
        "Wind_Direction": 31,
        "Wind_Speed_kt": 13.4
      },
      {
        "Altitude_ft": 10098,
        "Temp_c": -3.6,
        "Dewpoint_c": -4.3,
        "Wind_Direction": 31,
        "Wind_Speed_kt": 13.4
      },
      {
        "Altitude_ft": 10118,
        "Temp_c": -3.6,
        "Dewpoint_c": -4.4,
        "Wind_Direction": 31,
        "Wind_Speed_kt": 13.4
      },
      {
        "Altitude_ft": 10138,
        "Temp_c": -3.7,
        "Dewpoint_c": -4.4,
        "Wind_Direction": 31,
        "Wind_Speed_kt": 13.4
      },
      {
        "Altitude_ft": 10157,
        "Temp_c": -3.7,
        "Dewpoint_c": -4.4,
        "Wind_Direction": 31,
        "Wind_Speed_kt": 13.4
      },
      {
        "Altitude_ft": 10180,
        "Temp_c": -3.8,
        "Dewpoint_c": -4.5,
        "Wind_Direction": 30,
        "Wind_Speed_kt": 13.4
      },
      {
        "Altitude_ft": 10200,
        "Temp_c": -3.8,
        "Dewpoint_c": -4.5,
        "Wind_Direction": 30,
        "Wind_Speed_kt": 13.6
      },
      {
        "Altitude_ft": 10220,
        "Temp_c": -3.8,
        "Dewpoint_c": -4.6,
        "Wind_Direction": 30,
        "Wind_Speed_kt": 13.6
      },
      {
        "Altitude_ft": 10243,
        "Temp_c": -3.9,
        "Dewpoint_c": -4.6,
        "Wind_Direction": 30,
        "Wind_Speed_kt": 13.6
      },
      {
        "Altitude_ft": 10262,
        "Temp_c": -3.9,
        "Dewpoint_c": -4.7,
        "Wind_Direction": 30,
        "Wind_Speed_kt": 13.6
      },
      {
        "Altitude_ft": 10282,
        "Temp_c": -3.9,
        "Dewpoint_c": -4.7,
        "Wind_Direction": 30,
        "Wind_Speed_kt": 13.6
      },
      {
        "Altitude_ft": 10305,
        "Temp_c": -4,
        "Dewpoint_c": -4.8,
        "Wind_Direction": 30,
        "Wind_Speed_kt": 13.8
      },
      {
        "Altitude_ft": 10325,
        "Temp_c": -4,
        "Dewpoint_c": -4.8,
        "Wind_Direction": 29,
        "Wind_Speed_kt": 13.6
      },
      {
        "Altitude_ft": 10348,
        "Temp_c": -4,
        "Dewpoint_c": -4.8,
        "Wind_Direction": 29,
        "Wind_Speed_kt": 13.6
      },
      {
        "Altitude_ft": 10367,
        "Temp_c": -4.1,
        "Dewpoint_c": -4.9,
        "Wind_Direction": 29,
        "Wind_Speed_kt": 13.6
      },
      {
        "Altitude_ft": 10387,
        "Temp_c": -4.1,
        "Dewpoint_c": -4.9,
        "Wind_Direction": 29,
        "Wind_Speed_kt": 13.6
      },
      {
        "Altitude_ft": 10404,
        "Temp_c": -4.2,
        "Dewpoint_c": -5,
        "Wind_Direction": 28,
        "Wind_Speed_kt": 13.6
      },
      {
        "Altitude_ft": 10423,
        "Temp_c": -4.2,
        "Dewpoint_c": -5.1,
        "Wind_Direction": 28,
        "Wind_Speed_kt": 13.6
      },
      {
        "Altitude_ft": 10443,
        "Temp_c": -4.2,
        "Dewpoint_c": -5.1,
        "Wind_Direction": 28,
        "Wind_Speed_kt": 13.6
      },
      {
        "Altitude_ft": 10459,
        "Temp_c": -4.3,
        "Dewpoint_c": -5.2,
        "Wind_Direction": 27,
        "Wind_Speed_kt": 13.6
      },
      {
        "Altitude_ft": 10479,
        "Temp_c": -4.3,
        "Dewpoint_c": -5.2,
        "Wind_Direction": 27,
        "Wind_Speed_kt": 13.6
      },
      {
        "Altitude_ft": 10499,
        "Temp_c": -4.4,
        "Dewpoint_c": -5.3,
        "Wind_Direction": 27,
        "Wind_Speed_kt": 13.6
      },
      {
        "Altitude_ft": 10518,
        "Temp_c": -4.4,
        "Dewpoint_c": -5.4,
        "Wind_Direction": 27,
        "Wind_Speed_kt": 13.6
      },
      {
        "Altitude_ft": 10538,
        "Temp_c": -4.5,
        "Dewpoint_c": -5.4,
        "Wind_Direction": 26,
        "Wind_Speed_kt": 13.6
      },
      {
        "Altitude_ft": 10558,
        "Temp_c": -4.5,
        "Dewpoint_c": -5.5,
        "Wind_Direction": 26,
        "Wind_Speed_kt": 13.6
      },
      {
        "Altitude_ft": 10577,
        "Temp_c": -4.5,
        "Dewpoint_c": -5.6,
        "Wind_Direction": 26,
        "Wind_Speed_kt": 13.6
      },
      {
        "Altitude_ft": 10597,
        "Temp_c": -4.6,
        "Dewpoint_c": -5.6,
        "Wind_Direction": 25,
        "Wind_Speed_kt": 13.6
      },
      {
        "Altitude_ft": 10617,
        "Temp_c": -4.6,
        "Dewpoint_c": -5.7,
        "Wind_Direction": 25,
        "Wind_Speed_kt": 13.6
      },
      {
        "Altitude_ft": 10636,
        "Temp_c": -4.7,
        "Dewpoint_c": -5.8,
        "Wind_Direction": 25,
        "Wind_Speed_kt": 13.6
      },
      {
        "Altitude_ft": 10656,
        "Temp_c": -4.7,
        "Dewpoint_c": -5.8,
        "Wind_Direction": 25,
        "Wind_Speed_kt": 13.6
      },
      {
        "Altitude_ft": 10676,
        "Temp_c": -4.8,
        "Dewpoint_c": -5.9,
        "Wind_Direction": 24,
        "Wind_Speed_kt": 13.6
      },
      {
        "Altitude_ft": 10699,
        "Temp_c": -4.8,
        "Dewpoint_c": -5.9,
        "Wind_Direction": 24,
        "Wind_Speed_kt": 13.6
      },
      {
        "Altitude_ft": 10719,
        "Temp_c": -4.9,
        "Dewpoint_c": -6,
        "Wind_Direction": 23,
        "Wind_Speed_kt": 13.6
      },
      {
        "Altitude_ft": 10738,
        "Temp_c": -4.9,
        "Dewpoint_c": -6,
        "Wind_Direction": 23,
        "Wind_Speed_kt": 13.6
      },
      {
        "Altitude_ft": 10758,
        "Temp_c": -5,
        "Dewpoint_c": -6.1,
        "Wind_Direction": 22,
        "Wind_Speed_kt": 13.6
      },
      {
        "Altitude_ft": 10778,
        "Temp_c": -5,
        "Dewpoint_c": -6.1,
        "Wind_Direction": 21,
        "Wind_Speed_kt": 13.6
      },
      {
        "Altitude_ft": 10801,
        "Temp_c": -5,
        "Dewpoint_c": -6.2,
        "Wind_Direction": 21,
        "Wind_Speed_kt": 13.6
      },
      {
        "Altitude_ft": 10820,
        "Temp_c": -5.1,
        "Dewpoint_c": -6.2,
        "Wind_Direction": 20,
        "Wind_Speed_kt": 13.6
      },
      {
        "Altitude_ft": 10840,
        "Temp_c": -5.1,
        "Dewpoint_c": -6.3,
        "Wind_Direction": 20,
        "Wind_Speed_kt": 13.8
      },
      {
        "Altitude_ft": 10863,
        "Temp_c": -5.2,
        "Dewpoint_c": -6.4,
        "Wind_Direction": 19,
        "Wind_Speed_kt": 13.8
      },
      {
        "Altitude_ft": 10883,
        "Temp_c": -5.2,
        "Dewpoint_c": -6.4,
        "Wind_Direction": 19,
        "Wind_Speed_kt": 13.8
      },
      {
        "Altitude_ft": 10906,
        "Temp_c": -5.3,
        "Dewpoint_c": -6.5,
        "Wind_Direction": 18,
        "Wind_Speed_kt": 13.8
      },
      {
        "Altitude_ft": 10925,
        "Temp_c": -5.3,
        "Dewpoint_c": -6.5,
        "Wind_Direction": 17,
        "Wind_Speed_kt": 13.8
      },
      {
        "Altitude_ft": 10945,
        "Temp_c": -5.4,
        "Dewpoint_c": -6.6,
        "Wind_Direction": 17,
        "Wind_Speed_kt": 13.8
      },
      {
        "Altitude_ft": 10965,
        "Temp_c": -5.4,
        "Dewpoint_c": -6.6,
        "Wind_Direction": 16,
        "Wind_Speed_kt": 14
      },
      {
        "Altitude_ft": 10984,
        "Temp_c": -5.5,
        "Dewpoint_c": -6.7,
        "Wind_Direction": 16,
        "Wind_Speed_kt": 14
      },
      {
        "Altitude_ft": 11004,
        "Temp_c": -5.5,
        "Dewpoint_c": -6.7,
        "Wind_Direction": 15,
        "Wind_Speed_kt": 14
      },
      {
        "Altitude_ft": 11024,
        "Temp_c": -5.6,
        "Dewpoint_c": -6.8,
        "Wind_Direction": 14,
        "Wind_Speed_kt": 14
      },
      {
        "Altitude_ft": 11043,
        "Temp_c": -5.6,
        "Dewpoint_c": -6.8,
        "Wind_Direction": 14,
        "Wind_Speed_kt": 14
      },
      {
        "Altitude_ft": 11063,
        "Temp_c": -5.6,
        "Dewpoint_c": -6.9,
        "Wind_Direction": 13,
        "Wind_Speed_kt": 14.2
      },
      {
        "Altitude_ft": 11086,
        "Temp_c": -5.7,
        "Dewpoint_c": -6.9,
        "Wind_Direction": 13,
        "Wind_Speed_kt": 14.2
      },
      {
        "Altitude_ft": 11106,
        "Temp_c": -5.7,
        "Dewpoint_c": -7,
        "Wind_Direction": 12,
        "Wind_Speed_kt": 14.2
      },
      {
        "Altitude_ft": 11125,
        "Temp_c": -5.8,
        "Dewpoint_c": -7,
        "Wind_Direction": 12,
        "Wind_Speed_kt": 14.2
      },
      {
        "Altitude_ft": 11148,
        "Temp_c": -5.8,
        "Dewpoint_c": -7.1,
        "Wind_Direction": 12,
        "Wind_Speed_kt": 14.2
      },
      {
        "Altitude_ft": 11168,
        "Temp_c": -5.9,
        "Dewpoint_c": -7.1,
        "Wind_Direction": 12,
        "Wind_Speed_kt": 14.2
      },
      {
        "Altitude_ft": 11191,
        "Temp_c": -5.9,
        "Dewpoint_c": -7.2,
        "Wind_Direction": 12,
        "Wind_Speed_kt": 14.2
      },
      {
        "Altitude_ft": 11211,
        "Temp_c": -5.9,
        "Dewpoint_c": -7.2,
        "Wind_Direction": 12,
        "Wind_Speed_kt": 14.2
      },
      {
        "Altitude_ft": 11234,
        "Temp_c": -6,
        "Dewpoint_c": -7.2,
        "Wind_Direction": 11,
        "Wind_Speed_kt": 14.2
      },
      {
        "Altitude_ft": 11253,
        "Temp_c": -6,
        "Dewpoint_c": -7.3,
        "Wind_Direction": 11,
        "Wind_Speed_kt": 14.2
      },
      {
        "Altitude_ft": 11276,
        "Temp_c": -6.1,
        "Dewpoint_c": -7.3,
        "Wind_Direction": 11,
        "Wind_Speed_kt": 14.2
      },
      {
        "Altitude_ft": 11296,
        "Temp_c": -6.1,
        "Dewpoint_c": -7.4,
        "Wind_Direction": 11,
        "Wind_Speed_kt": 14.2
      },
      {
        "Altitude_ft": 11319,
        "Temp_c": -6.2,
        "Dewpoint_c": -7.4,
        "Wind_Direction": 11,
        "Wind_Speed_kt": 14.2
      },
      {
        "Altitude_ft": 11339,
        "Temp_c": -6.2,
        "Dewpoint_c": -7.4,
        "Wind_Direction": 11,
        "Wind_Speed_kt": 14.2
      },
      {
        "Altitude_ft": 11358,
        "Temp_c": -6.2,
        "Dewpoint_c": -7.5,
        "Wind_Direction": 11,
        "Wind_Speed_kt": 14.2
      },
      {
        "Altitude_ft": 11378,
        "Temp_c": -6.3,
        "Dewpoint_c": -7.5,
        "Wind_Direction": 11,
        "Wind_Speed_kt": 14.2
      },
      {
        "Altitude_ft": 11398,
        "Temp_c": -6.3,
        "Dewpoint_c": -7.6,
        "Wind_Direction": 10,
        "Wind_Speed_kt": 14.2
      },
      {
        "Altitude_ft": 11417,
        "Temp_c": -6.4,
        "Dewpoint_c": -7.6,
        "Wind_Direction": 10,
        "Wind_Speed_kt": 14.2
      },
      {
        "Altitude_ft": 11437,
        "Temp_c": -6.4,
        "Dewpoint_c": -7.6,
        "Wind_Direction": 10,
        "Wind_Speed_kt": 14.2
      },
      {
        "Altitude_ft": 11457,
        "Temp_c": -6.4,
        "Dewpoint_c": -7.7,
        "Wind_Direction": 10,
        "Wind_Speed_kt": 14.2
      },
      {
        "Altitude_ft": 11476,
        "Temp_c": -6.5,
        "Dewpoint_c": -7.7,
        "Wind_Direction": 10,
        "Wind_Speed_kt": 14.2
      },
      {
        "Altitude_ft": 11493,
        "Temp_c": -6.5,
        "Dewpoint_c": -7.8,
        "Wind_Direction": 10,
        "Wind_Speed_kt": 14.2
      },
      {
        "Altitude_ft": 11512,
        "Temp_c": -6.6,
        "Dewpoint_c": -7.8,
        "Wind_Direction": 10,
        "Wind_Speed_kt": 14.2
      },
      {
        "Altitude_ft": 11532,
        "Temp_c": -6.6,
        "Dewpoint_c": -7.9,
        "Wind_Direction": 10,
        "Wind_Speed_kt": 14.2
      },
      {
        "Altitude_ft": 11552,
        "Temp_c": -6.7,
        "Dewpoint_c": -7.9,
        "Wind_Direction": 10,
        "Wind_Speed_kt": 14
      },
      {
        "Altitude_ft": 11568,
        "Temp_c": -6.7,
        "Dewpoint_c": -8,
        "Wind_Direction": 9,
        "Wind_Speed_kt": 14
      },
      {
        "Altitude_ft": 11588,
        "Temp_c": -6.8,
        "Dewpoint_c": -8,
        "Wind_Direction": 9,
        "Wind_Speed_kt": 13.8
      },
      {
        "Altitude_ft": 11608,
        "Temp_c": -6.8,
        "Dewpoint_c": -8.1,
        "Wind_Direction": 9,
        "Wind_Speed_kt": 13.8
      },
      {
        "Altitude_ft": 11627,
        "Temp_c": -6.9,
        "Dewpoint_c": -8.1,
        "Wind_Direction": 9,
        "Wind_Speed_kt": 13.6
      },
      {
        "Altitude_ft": 11647,
        "Temp_c": -6.9,
        "Dewpoint_c": -8.2,
        "Wind_Direction": 9,
        "Wind_Speed_kt": 13.6
      },
      {
        "Altitude_ft": 11667,
        "Temp_c": -7,
        "Dewpoint_c": -8.2,
        "Wind_Direction": 9,
        "Wind_Speed_kt": 13.6
      },
      {
        "Altitude_ft": 11690,
        "Temp_c": -7,
        "Dewpoint_c": -8.3,
        "Wind_Direction": 9,
        "Wind_Speed_kt": 13.4
      },
      {
        "Altitude_ft": 11709,
        "Temp_c": -7,
        "Dewpoint_c": -8.3,
        "Wind_Direction": 9,
        "Wind_Speed_kt": 13.4
      },
      {
        "Altitude_ft": 11729,
        "Temp_c": -7.1,
        "Dewpoint_c": -8.4,
        "Wind_Direction": 9,
        "Wind_Speed_kt": 13.2
      },
      {
        "Altitude_ft": 11749,
        "Temp_c": -7.1,
        "Dewpoint_c": -8.4,
        "Wind_Direction": 9,
        "Wind_Speed_kt": 13.2
      },
      {
        "Altitude_ft": 11768,
        "Temp_c": -7.2,
        "Dewpoint_c": -8.5,
        "Wind_Direction": 9,
        "Wind_Speed_kt": 13
      },
      {
        "Altitude_ft": 11785,
        "Temp_c": -7.2,
        "Dewpoint_c": -8.5,
        "Wind_Direction": 8,
        "Wind_Speed_kt": 13
      },
      {
        "Altitude_ft": 11804,
        "Temp_c": -7.2,
        "Dewpoint_c": -8.6,
        "Wind_Direction": 8,
        "Wind_Speed_kt": 13
      },
      {
        "Altitude_ft": 11824,
        "Temp_c": -7.3,
        "Dewpoint_c": -8.6,
        "Wind_Direction": 8,
        "Wind_Speed_kt": 12.8
      },
      {
        "Altitude_ft": 11844,
        "Temp_c": -7.3,
        "Dewpoint_c": -8.7,
        "Wind_Direction": 8,
        "Wind_Speed_kt": 12.8
      },
      {
        "Altitude_ft": 11860,
        "Temp_c": -7.4,
        "Dewpoint_c": -8.7,
        "Wind_Direction": 8,
        "Wind_Speed_kt": 12.6
      },
      {
        "Altitude_ft": 11877,
        "Temp_c": -7.4,
        "Dewpoint_c": -8.8,
        "Wind_Direction": 8,
        "Wind_Speed_kt": 12.6
      },
      {
        "Altitude_ft": 11893,
        "Temp_c": -7.4,
        "Dewpoint_c": -8.8,
        "Wind_Direction": 8,
        "Wind_Speed_kt": 12.4
      },
      {
        "Altitude_ft": 11909,
        "Temp_c": -7.5,
        "Dewpoint_c": -8.8,
        "Wind_Direction": 8,
        "Wind_Speed_kt": 12.4
      },
      {
        "Altitude_ft": 11926,
        "Temp_c": -7.5,
        "Dewpoint_c": -8.9,
        "Wind_Direction": 8,
        "Wind_Speed_kt": 12.4
      },
      {
        "Altitude_ft": 11946,
        "Temp_c": -7.6,
        "Dewpoint_c": -8.9,
        "Wind_Direction": 7,
        "Wind_Speed_kt": 12.4
      },
      {
        "Altitude_ft": 11962,
        "Temp_c": -7.6,
        "Dewpoint_c": -9,
        "Wind_Direction": 7,
        "Wind_Speed_kt": 12.2
      },
      {
        "Altitude_ft": 11975,
        "Temp_c": -7.6,
        "Dewpoint_c": -9,
        "Wind_Direction": 7,
        "Wind_Speed_kt": 12.2
      },
      {
        "Altitude_ft": 11995,
        "Temp_c": -7.7,
        "Dewpoint_c": -9,
        "Wind_Direction": 7,
        "Wind_Speed_kt": 12.2
      },
      {
        "Altitude_ft": 12011,
        "Temp_c": -7.7,
        "Dewpoint_c": -9.1,
        "Wind_Direction": 7,
        "Wind_Speed_kt": 12.1
      },
      {
        "Altitude_ft": 12028,
        "Temp_c": -7.7,
        "Dewpoint_c": -9.1,
        "Wind_Direction": 7,
        "Wind_Speed_kt": 12.1
      },
      {
        "Altitude_ft": 12044,
        "Temp_c": -7.8,
        "Dewpoint_c": -9.1,
        "Wind_Direction": 7,
        "Wind_Speed_kt": 12.1
      },
      {
        "Altitude_ft": 12060,
        "Temp_c": -7.8,
        "Dewpoint_c": -9.1,
        "Wind_Direction": 6,
        "Wind_Speed_kt": 12.1
      },
      {
        "Altitude_ft": 12077,
        "Temp_c": -7.8,
        "Dewpoint_c": -9.2,
        "Wind_Direction": 6,
        "Wind_Speed_kt": 11.9
      },
      {
        "Altitude_ft": 12093,
        "Temp_c": -7.9,
        "Dewpoint_c": -9.2,
        "Wind_Direction": 6,
        "Wind_Speed_kt": 11.9
      },
      {
        "Altitude_ft": 12110,
        "Temp_c": -7.9,
        "Dewpoint_c": -9.2,
        "Wind_Direction": 6,
        "Wind_Speed_kt": 11.9
      },
      {
        "Altitude_ft": 12123,
        "Temp_c": -7.9,
        "Dewpoint_c": -9.2,
        "Wind_Direction": 6,
        "Wind_Speed_kt": 11.9
      },
      {
        "Altitude_ft": 12139,
        "Temp_c": -8,
        "Dewpoint_c": -9.3,
        "Wind_Direction": 6,
        "Wind_Speed_kt": 11.7
      },
      {
        "Altitude_ft": 12152,
        "Temp_c": -8,
        "Dewpoint_c": -9.3,
        "Wind_Direction": 6,
        "Wind_Speed_kt": 11.7
      },
      {
        "Altitude_ft": 12169,
        "Temp_c": -8,
        "Dewpoint_c": -9.3,
        "Wind_Direction": 5,
        "Wind_Speed_kt": 11.7
      },
      {
        "Altitude_ft": 12182,
        "Temp_c": -8.1,
        "Dewpoint_c": -9.3,
        "Wind_Direction": 5,
        "Wind_Speed_kt": 11.5
      },
      {
        "Altitude_ft": 12198,
        "Temp_c": -8.1,
        "Dewpoint_c": -9.4,
        "Wind_Direction": 5,
        "Wind_Speed_kt": 11.5
      },
      {
        "Altitude_ft": 12211,
        "Temp_c": -8.1,
        "Dewpoint_c": -9.4,
        "Wind_Direction": 5,
        "Wind_Speed_kt": 11.5
      },
      {
        "Altitude_ft": 12224,
        "Temp_c": -8.1,
        "Dewpoint_c": -9.4,
        "Wind_Direction": 5,
        "Wind_Speed_kt": 11.5
      },
      {
        "Altitude_ft": 12241,
        "Temp_c": -8.2,
        "Dewpoint_c": -9.4,
        "Wind_Direction": 4,
        "Wind_Speed_kt": 11.5
      },
      {
        "Altitude_ft": 12254,
        "Temp_c": -8.2,
        "Dewpoint_c": -9.4,
        "Wind_Direction": 4,
        "Wind_Speed_kt": 11.5
      },
      {
        "Altitude_ft": 12267,
        "Temp_c": -8.2,
        "Dewpoint_c": -9.4,
        "Wind_Direction": 4,
        "Wind_Speed_kt": 11.5
      },
      {
        "Altitude_ft": 12287,
        "Temp_c": -8.3,
        "Dewpoint_c": -9.4,
        "Wind_Direction": 3,
        "Wind_Speed_kt": 11.5
      },
      {
        "Altitude_ft": 12303,
        "Temp_c": -8.3,
        "Dewpoint_c": -9.4,
        "Wind_Direction": 3,
        "Wind_Speed_kt": 11.5
      },
      {
        "Altitude_ft": 12320,
        "Temp_c": -8.3,
        "Dewpoint_c": -9.5,
        "Wind_Direction": 3,
        "Wind_Speed_kt": 11.5
      },
      {
        "Altitude_ft": 12336,
        "Temp_c": -8.3,
        "Dewpoint_c": -9.5,
        "Wind_Direction": 3,
        "Wind_Speed_kt": 11.5
      },
      {
        "Altitude_ft": 12352,
        "Temp_c": -8.4,
        "Dewpoint_c": -9.5,
        "Wind_Direction": 2,
        "Wind_Speed_kt": 11.5
      },
      {
        "Altitude_ft": 12369,
        "Temp_c": -8.4,
        "Dewpoint_c": -9.5,
        "Wind_Direction": 2,
        "Wind_Speed_kt": 11.5
      },
      {
        "Altitude_ft": 12385,
        "Temp_c": -8.4,
        "Dewpoint_c": -9.5,
        "Wind_Direction": 2,
        "Wind_Speed_kt": 11.7
      },
      {
        "Altitude_ft": 12402,
        "Temp_c": -8.5,
        "Dewpoint_c": -9.5,
        "Wind_Direction": 1,
        "Wind_Speed_kt": 11.7
      },
      {
        "Altitude_ft": 12418,
        "Temp_c": -8.5,
        "Dewpoint_c": -9.6,
        "Wind_Direction": 1,
        "Wind_Speed_kt": 11.7
      },
      {
        "Altitude_ft": 12431,
        "Temp_c": -8.5,
        "Dewpoint_c": -9.6,
        "Wind_Direction": 1,
        "Wind_Speed_kt": 11.7
      },
      {
        "Altitude_ft": 12448,
        "Temp_c": -8.6,
        "Dewpoint_c": -9.6,
        "Wind_Direction": 360,
        "Wind_Speed_kt": 11.7
      },
      {
        "Altitude_ft": 12467,
        "Temp_c": -8.6,
        "Dewpoint_c": -9.6,
        "Wind_Direction": 360,
        "Wind_Speed_kt": 11.7
      },
      {
        "Altitude_ft": 12484,
        "Temp_c": -8.6,
        "Dewpoint_c": -9.7,
        "Wind_Direction": 360,
        "Wind_Speed_kt": 11.7
      },
      {
        "Altitude_ft": 12503,
        "Temp_c": -8.7,
        "Dewpoint_c": -9.7,
        "Wind_Direction": 360,
        "Wind_Speed_kt": 11.7
      },
      {
        "Altitude_ft": 12520,
        "Temp_c": -8.7,
        "Dewpoint_c": -9.7,
        "Wind_Direction": 359,
        "Wind_Speed_kt": 11.7
      },
      {
        "Altitude_ft": 12539,
        "Temp_c": -8.8,
        "Dewpoint_c": -9.7,
        "Wind_Direction": 359,
        "Wind_Speed_kt": 11.7
      },
      {
        "Altitude_ft": 12556,
        "Temp_c": -8.8,
        "Dewpoint_c": -9.8,
        "Wind_Direction": 359,
        "Wind_Speed_kt": 11.7
      },
      {
        "Altitude_ft": 12572,
        "Temp_c": -8.8,
        "Dewpoint_c": -9.8,
        "Wind_Direction": 360,
        "Wind_Speed_kt": 11.7
      },
      {
        "Altitude_ft": 12589,
        "Temp_c": -8.9,
        "Dewpoint_c": -9.8,
        "Wind_Direction": 360,
        "Wind_Speed_kt": 11.9
      },
      {
        "Altitude_ft": 12608,
        "Temp_c": -8.9,
        "Dewpoint_c": -9.8,
        "Wind_Direction": 1,
        "Wind_Speed_kt": 11.9
      },
      {
        "Altitude_ft": 12625,
        "Temp_c": -8.9,
        "Dewpoint_c": -9.9,
        "Wind_Direction": 1,
        "Wind_Speed_kt": 11.9
      },
      {
        "Altitude_ft": 12641,
        "Temp_c": -9,
        "Dewpoint_c": -9.9,
        "Wind_Direction": 1,
        "Wind_Speed_kt": 11.9
      },
      {
        "Altitude_ft": 12657,
        "Temp_c": -9,
        "Dewpoint_c": -9.9,
        "Wind_Direction": 2,
        "Wind_Speed_kt": 11.9
      },
      {
        "Altitude_ft": 12674,
        "Temp_c": -9.1,
        "Dewpoint_c": -10,
        "Wind_Direction": 2,
        "Wind_Speed_kt": 11.9
      },
      {
        "Altitude_ft": 12690,
        "Temp_c": -9.1,
        "Dewpoint_c": -10,
        "Wind_Direction": 2,
        "Wind_Speed_kt": 12.1
      },
      {
        "Altitude_ft": 12707,
        "Temp_c": -9.1,
        "Dewpoint_c": -10,
        "Wind_Direction": 3,
        "Wind_Speed_kt": 12.1
      },
      {
        "Altitude_ft": 12723,
        "Temp_c": -9.2,
        "Dewpoint_c": -10.1,
        "Wind_Direction": 3,
        "Wind_Speed_kt": 12.1
      },
      {
        "Altitude_ft": 12740,
        "Temp_c": -9.2,
        "Dewpoint_c": -10.1,
        "Wind_Direction": 4,
        "Wind_Speed_kt": 12.1
      },
      {
        "Altitude_ft": 12756,
        "Temp_c": -9.3,
        "Dewpoint_c": -10.2,
        "Wind_Direction": 4,
        "Wind_Speed_kt": 12.1
      },
      {
        "Altitude_ft": 12769,
        "Temp_c": -9.3,
        "Dewpoint_c": -10.2,
        "Wind_Direction": 4,
        "Wind_Speed_kt": 12.2
      },
      {
        "Altitude_ft": 12785,
        "Temp_c": -9.4,
        "Dewpoint_c": -10.2,
        "Wind_Direction": 5,
        "Wind_Speed_kt": 12.2
      },
      {
        "Altitude_ft": 12802,
        "Temp_c": -9.4,
        "Dewpoint_c": -10.3,
        "Wind_Direction": 5,
        "Wind_Speed_kt": 12.2
      },
      {
        "Altitude_ft": 12818,
        "Temp_c": -9.4,
        "Dewpoint_c": -10.3,
        "Wind_Direction": 5,
        "Wind_Speed_kt": 12.2
      },
      {
        "Altitude_ft": 12835,
        "Temp_c": -9.5,
        "Dewpoint_c": -10.3,
        "Wind_Direction": 6,
        "Wind_Speed_kt": 12.2
      },
      {
        "Altitude_ft": 12851,
        "Temp_c": -9.5,
        "Dewpoint_c": -10.4,
        "Wind_Direction": 6,
        "Wind_Speed_kt": 12.2
      },
      {
        "Altitude_ft": 12867,
        "Temp_c": -9.5,
        "Dewpoint_c": -10.4,
        "Wind_Direction": 6,
        "Wind_Speed_kt": 12.4
      },
      {
        "Altitude_ft": 12884,
        "Temp_c": -9.6,
        "Dewpoint_c": -10.4,
        "Wind_Direction": 6,
        "Wind_Speed_kt": 12.4
      },
      {
        "Altitude_ft": 12904,
        "Temp_c": -9.6,
        "Dewpoint_c": -10.5,
        "Wind_Direction": 6,
        "Wind_Speed_kt": 12.4
      },
      {
        "Altitude_ft": 12920,
        "Temp_c": -9.7,
        "Dewpoint_c": -10.5,
        "Wind_Direction": 5,
        "Wind_Speed_kt": 12.4
      },
      {
        "Altitude_ft": 12936,
        "Temp_c": -9.7,
        "Dewpoint_c": -10.5,
        "Wind_Direction": 5,
        "Wind_Speed_kt": 12.4
      },
      {
        "Altitude_ft": 12953,
        "Temp_c": -9.7,
        "Dewpoint_c": -10.5,
        "Wind_Direction": 5,
        "Wind_Speed_kt": 12.4
      },
      {
        "Altitude_ft": 12972,
        "Temp_c": -9.8,
        "Dewpoint_c": -10.6,
        "Wind_Direction": 4,
        "Wind_Speed_kt": 12.4
      },
      {
        "Altitude_ft": 12989,
        "Temp_c": -9.8,
        "Dewpoint_c": -10.6,
        "Wind_Direction": 4,
        "Wind_Speed_kt": 12.6
      },
      {
        "Altitude_ft": 13005,
        "Temp_c": -9.9,
        "Dewpoint_c": -10.6,
        "Wind_Direction": 4,
        "Wind_Speed_kt": 12.6
      },
      {
        "Altitude_ft": 13018,
        "Temp_c": -9.9,
        "Dewpoint_c": -10.7,
        "Wind_Direction": 3,
        "Wind_Speed_kt": 12.6
      },
      {
        "Altitude_ft": 13035,
        "Temp_c": -9.9,
        "Dewpoint_c": -10.7,
        "Wind_Direction": 3,
        "Wind_Speed_kt": 12.6
      },
      {
        "Altitude_ft": 13048,
        "Temp_c": -10,
        "Dewpoint_c": -10.7,
        "Wind_Direction": 3,
        "Wind_Speed_kt": 12.6
      },
      {
        "Altitude_ft": 13061,
        "Temp_c": -10,
        "Dewpoint_c": -10.7,
        "Wind_Direction": 2,
        "Wind_Speed_kt": 12.6
      },
      {
        "Altitude_ft": 13074,
        "Temp_c": -10,
        "Dewpoint_c": -10.7,
        "Wind_Direction": 2,
        "Wind_Speed_kt": 12.6
      },
      {
        "Altitude_ft": 13091,
        "Temp_c": -10.1,
        "Dewpoint_c": -10.7,
        "Wind_Direction": 2,
        "Wind_Speed_kt": 12.6
      },
      {
        "Altitude_ft": 13104,
        "Temp_c": -10.1,
        "Dewpoint_c": -10.8,
        "Wind_Direction": 1,
        "Wind_Speed_kt": 12.8
      },
      {
        "Altitude_ft": 13117,
        "Temp_c": -10.1,
        "Dewpoint_c": -10.8,
        "Wind_Direction": 1,
        "Wind_Speed_kt": 12.8
      },
      {
        "Altitude_ft": 13130,
        "Temp_c": -10.2,
        "Dewpoint_c": -10.8,
        "Wind_Direction": 1,
        "Wind_Speed_kt": 12.8
      },
      {
        "Altitude_ft": 13143,
        "Temp_c": -10.2,
        "Dewpoint_c": -10.8,
        "Wind_Direction": 360,
        "Wind_Speed_kt": 12.8
      },
      {
        "Altitude_ft": 13156,
        "Temp_c": -10.2,
        "Dewpoint_c": -10.9,
        "Wind_Direction": 360,
        "Wind_Speed_kt": 12.8
      },
      {
        "Altitude_ft": 13169,
        "Temp_c": -10.2,
        "Dewpoint_c": -10.9,
        "Wind_Direction": 360,
        "Wind_Speed_kt": 12.8
      },
      {
        "Altitude_ft": 13182,
        "Temp_c": -10.3,
        "Dewpoint_c": -10.9,
        "Wind_Direction": 360,
        "Wind_Speed_kt": 12.8
      },
      {
        "Altitude_ft": 13196,
        "Temp_c": -10.3,
        "Dewpoint_c": -11,
        "Wind_Direction": 360,
        "Wind_Speed_kt": 12.8
      },
      {
        "Altitude_ft": 13212,
        "Temp_c": -10.3,
        "Dewpoint_c": -11,
        "Wind_Direction": 1,
        "Wind_Speed_kt": 12.6
      },
      {
        "Altitude_ft": 13225,
        "Temp_c": -10.4,
        "Dewpoint_c": -11,
        "Wind_Direction": 1,
        "Wind_Speed_kt": 12.6
      },
      {
        "Altitude_ft": 13238,
        "Temp_c": -10.4,
        "Dewpoint_c": -11,
        "Wind_Direction": 1,
        "Wind_Speed_kt": 12.4
      },
      {
        "Altitude_ft": 13255,
        "Temp_c": -10.4,
        "Dewpoint_c": -11.1,
        "Wind_Direction": 2,
        "Wind_Speed_kt": 12.4
      },
      {
        "Altitude_ft": 13268,
        "Temp_c": -10.5,
        "Dewpoint_c": -11.1,
        "Wind_Direction": 2,
        "Wind_Speed_kt": 12.4
      },
      {
        "Altitude_ft": 13284,
        "Temp_c": -10.5,
        "Dewpoint_c": -11.1,
        "Wind_Direction": 3,
        "Wind_Speed_kt": 12.2
      },
      {
        "Altitude_ft": 13301,
        "Temp_c": -10.5,
        "Dewpoint_c": -11.2,
        "Wind_Direction": 3,
        "Wind_Speed_kt": 12.2
      },
      {
        "Altitude_ft": 13314,
        "Temp_c": -10.6,
        "Dewpoint_c": -11.2,
        "Wind_Direction": 3,
        "Wind_Speed_kt": 12.2
      },
      {
        "Altitude_ft": 13330,
        "Temp_c": -10.6,
        "Dewpoint_c": -11.2,
        "Wind_Direction": 4,
        "Wind_Speed_kt": 12.1
      },
      {
        "Altitude_ft": 13346,
        "Temp_c": -10.6,
        "Dewpoint_c": -11.3,
        "Wind_Direction": 4,
        "Wind_Speed_kt": 12.1
      },
      {
        "Altitude_ft": 13366,
        "Temp_c": -10.7,
        "Dewpoint_c": -11.3,
        "Wind_Direction": 5,
        "Wind_Speed_kt": 12.1
      },
      {
        "Altitude_ft": 13383,
        "Temp_c": -10.7,
        "Dewpoint_c": -11.3,
        "Wind_Direction": 5,
        "Wind_Speed_kt": 11.9
      },
      {
        "Altitude_ft": 13399,
        "Temp_c": -10.8,
        "Dewpoint_c": -11.4,
        "Wind_Direction": 5,
        "Wind_Speed_kt": 11.9
      },
      {
        "Altitude_ft": 13419,
        "Temp_c": -10.8,
        "Dewpoint_c": -11.4,
        "Wind_Direction": 6,
        "Wind_Speed_kt": 11.7
      },
      {
        "Altitude_ft": 13432,
        "Temp_c": -10.8,
        "Dewpoint_c": -11.4,
        "Wind_Direction": 6,
        "Wind_Speed_kt": 11.7
      },
      {
        "Altitude_ft": 13448,
        "Temp_c": -10.9,
        "Dewpoint_c": -11.5,
        "Wind_Direction": 7,
        "Wind_Speed_kt": 11.7
      },
      {
        "Altitude_ft": 13461,
        "Temp_c": -10.9,
        "Dewpoint_c": -11.5,
        "Wind_Direction": 7,
        "Wind_Speed_kt": 11.7
      },
      {
        "Altitude_ft": 13478,
        "Temp_c": -10.9,
        "Dewpoint_c": -11.5,
        "Wind_Direction": 7,
        "Wind_Speed_kt": 11.5
      },
      {
        "Altitude_ft": 13494,
        "Temp_c": -10.9,
        "Dewpoint_c": -11.6,
        "Wind_Direction": 7,
        "Wind_Speed_kt": 11.5
      },
      {
        "Altitude_ft": 13510,
        "Temp_c": -11,
        "Dewpoint_c": -11.6,
        "Wind_Direction": 7,
        "Wind_Speed_kt": 11.7
      },
      {
        "Altitude_ft": 13527,
        "Temp_c": -11,
        "Dewpoint_c": -11.7,
        "Wind_Direction": 7,
        "Wind_Speed_kt": 11.7
      },
      {
        "Altitude_ft": 13543,
        "Temp_c": -11,
        "Dewpoint_c": -11.7,
        "Wind_Direction": 7,
        "Wind_Speed_kt": 11.7
      },
      {
        "Altitude_ft": 13560,
        "Temp_c": -11.1,
        "Dewpoint_c": -11.7,
        "Wind_Direction": 6,
        "Wind_Speed_kt": 11.7
      },
      {
        "Altitude_ft": 13576,
        "Temp_c": -11.1,
        "Dewpoint_c": -11.8,
        "Wind_Direction": 6,
        "Wind_Speed_kt": 11.7
      },
      {
        "Altitude_ft": 13596,
        "Temp_c": -11.1,
        "Dewpoint_c": -11.8,
        "Wind_Direction": 6,
        "Wind_Speed_kt": 11.7
      },
      {
        "Altitude_ft": 13612,
        "Temp_c": -11.2,
        "Dewpoint_c": -11.9,
        "Wind_Direction": 6,
        "Wind_Speed_kt": 11.9
      },
      {
        "Altitude_ft": 13632,
        "Temp_c": -11.2,
        "Dewpoint_c": -11.9,
        "Wind_Direction": 6,
        "Wind_Speed_kt": 11.9
      },
      {
        "Altitude_ft": 13652,
        "Temp_c": -11.2,
        "Dewpoint_c": -11.9,
        "Wind_Direction": 5,
        "Wind_Speed_kt": 11.9
      },
      {
        "Altitude_ft": 13671,
        "Temp_c": -11.3,
        "Dewpoint_c": -12,
        "Wind_Direction": 5,
        "Wind_Speed_kt": 11.9
      },
      {
        "Altitude_ft": 13691,
        "Temp_c": -11.3,
        "Dewpoint_c": -12,
        "Wind_Direction": 5,
        "Wind_Speed_kt": 11.9
      },
      {
        "Altitude_ft": 13711,
        "Temp_c": -11.3,
        "Dewpoint_c": -12.1,
        "Wind_Direction": 5,
        "Wind_Speed_kt": 12.1
      },
      {
        "Altitude_ft": 13730,
        "Temp_c": -11.3,
        "Dewpoint_c": -12.1,
        "Wind_Direction": 4,
        "Wind_Speed_kt": 12.1
      },
      {
        "Altitude_ft": 13750,
        "Temp_c": -11.4,
        "Dewpoint_c": -12.1,
        "Wind_Direction": 4,
        "Wind_Speed_kt": 12.1
      },
      {
        "Altitude_ft": 13780,
        "Temp_c": -11.4,
        "Dewpoint_c": -12.2,
        "Wind_Direction": 4,
        "Wind_Speed_kt": 12.1
      },
      {
        "Altitude_ft": 13793,
        "Temp_c": -11.4,
        "Dewpoint_c": -12.2,
        "Wind_Direction": 4,
        "Wind_Speed_kt": 12.1
      },
      {
        "Altitude_ft": 13812,
        "Temp_c": -11.4,
        "Dewpoint_c": -12.3,
        "Wind_Direction": 4,
        "Wind_Speed_kt": 12.1
      },
      {
        "Altitude_ft": 13832,
        "Temp_c": -11.5,
        "Dewpoint_c": -12.3,
        "Wind_Direction": 3,
        "Wind_Speed_kt": 12.2
      },
      {
        "Altitude_ft": 13852,
        "Temp_c": -11.5,
        "Dewpoint_c": -12.4,
        "Wind_Direction": 3,
        "Wind_Speed_kt": 12.2
      },
      {
        "Altitude_ft": 13871,
        "Temp_c": -11.5,
        "Dewpoint_c": -12.4,
        "Wind_Direction": 4,
        "Wind_Speed_kt": 12.2
      },
      {
        "Altitude_ft": 13891,
        "Temp_c": -11.5,
        "Dewpoint_c": -12.4,
        "Wind_Direction": 4,
        "Wind_Speed_kt": 12.2
      },
      {
        "Altitude_ft": 13911,
        "Temp_c": -11.5,
        "Dewpoint_c": -12.5,
        "Wind_Direction": 4,
        "Wind_Speed_kt": 12.2
      },
      {
        "Altitude_ft": 13930,
        "Temp_c": -11.6,
        "Dewpoint_c": -12.5,
        "Wind_Direction": 5,
        "Wind_Speed_kt": 12.2
      },
      {
        "Altitude_ft": 13950,
        "Temp_c": -11.6,
        "Dewpoint_c": -12.6,
        "Wind_Direction": 5,
        "Wind_Speed_kt": 12.2
      },
      {
        "Altitude_ft": 13970,
        "Temp_c": -11.6,
        "Dewpoint_c": -12.6,
        "Wind_Direction": 6,
        "Wind_Speed_kt": 12.2
      },
      {
        "Altitude_ft": 13993,
        "Temp_c": -11.6,
        "Dewpoint_c": -12.6,
        "Wind_Direction": 6,
        "Wind_Speed_kt": 12.2
      },
      {
        "Altitude_ft": 14012,
        "Temp_c": -11.6,
        "Dewpoint_c": -12.6,
        "Wind_Direction": 6,
        "Wind_Speed_kt": 12.2
      },
      {
        "Altitude_ft": 14035,
        "Temp_c": -11.6,
        "Dewpoint_c": -12.7,
        "Wind_Direction": 7,
        "Wind_Speed_kt": 12.2
      },
      {
        "Altitude_ft": 14058,
        "Temp_c": -11.6,
        "Dewpoint_c": -12.7,
        "Wind_Direction": 7,
        "Wind_Speed_kt": 12.2
      },
      {
        "Altitude_ft": 14078,
        "Temp_c": -11.7,
        "Dewpoint_c": -12.7,
        "Wind_Direction": 7,
        "Wind_Speed_kt": 12.2
      },
      {
        "Altitude_ft": 14098,
        "Temp_c": -11.7,
        "Dewpoint_c": -12.8,
        "Wind_Direction": 8,
        "Wind_Speed_kt": 12.2
      },
      {
        "Altitude_ft": 14117,
        "Temp_c": -11.7,
        "Dewpoint_c": -12.8,
        "Wind_Direction": 8,
        "Wind_Speed_kt": 12.2
      },
      {
        "Altitude_ft": 14137,
        "Temp_c": -11.7,
        "Dewpoint_c": -12.8,
        "Wind_Direction": 9,
        "Wind_Speed_kt": 12.2
      },
      {
        "Altitude_ft": 14154,
        "Temp_c": -11.7,
        "Dewpoint_c": -12.8,
        "Wind_Direction": 9,
        "Wind_Speed_kt": 12.2
      },
      {
        "Altitude_ft": 14173,
        "Temp_c": -11.7,
        "Dewpoint_c": -12.9,
        "Wind_Direction": 9,
        "Wind_Speed_kt": 12.2
      },
      {
        "Altitude_ft": 14193,
        "Temp_c": -11.7,
        "Dewpoint_c": -12.9,
        "Wind_Direction": 10,
        "Wind_Speed_kt": 12.2
      },
      {
        "Altitude_ft": 14213,
        "Temp_c": -11.8,
        "Dewpoint_c": -12.9,
        "Wind_Direction": 10,
        "Wind_Speed_kt": 12.2
      },
      {
        "Altitude_ft": 14232,
        "Temp_c": -11.8,
        "Dewpoint_c": -13,
        "Wind_Direction": 10,
        "Wind_Speed_kt": 12.2
      },
      {
        "Altitude_ft": 14252,
        "Temp_c": -11.8,
        "Dewpoint_c": -13,
        "Wind_Direction": 11,
        "Wind_Speed_kt": 12.2
      },
      {
        "Altitude_ft": 14272,
        "Temp_c": -11.8,
        "Dewpoint_c": -13.1,
        "Wind_Direction": 11,
        "Wind_Speed_kt": 12.2
      },
      {
        "Altitude_ft": 14291,
        "Temp_c": -11.9,
        "Dewpoint_c": -13.1,
        "Wind_Direction": 11,
        "Wind_Speed_kt": 12.2
      },
      {
        "Altitude_ft": 14311,
        "Temp_c": -11.9,
        "Dewpoint_c": -13.1,
        "Wind_Direction": 12,
        "Wind_Speed_kt": 12.2
      },
      {
        "Altitude_ft": 14331,
        "Temp_c": -11.9,
        "Dewpoint_c": -13.2,
        "Wind_Direction": 12,
        "Wind_Speed_kt": 12.2
      },
      {
        "Altitude_ft": 14350,
        "Temp_c": -11.9,
        "Dewpoint_c": -13.2,
        "Wind_Direction": 12,
        "Wind_Speed_kt": 12.2
      },
      {
        "Altitude_ft": 14370,
        "Temp_c": -12,
        "Dewpoint_c": -13.3,
        "Wind_Direction": 13,
        "Wind_Speed_kt": 12.2
      },
      {
        "Altitude_ft": 14386,
        "Temp_c": -12,
        "Dewpoint_c": -13.3,
        "Wind_Direction": 13,
        "Wind_Speed_kt": 12.2
      },
      {
        "Altitude_ft": 14406,
        "Temp_c": -12,
        "Dewpoint_c": -13.3,
        "Wind_Direction": 13,
        "Wind_Speed_kt": 12.2
      },
      {
        "Altitude_ft": 14426,
        "Temp_c": -12.1,
        "Dewpoint_c": -13.4,
        "Wind_Direction": 14,
        "Wind_Speed_kt": 12.2
      },
      {
        "Altitude_ft": 14446,
        "Temp_c": -12.1,
        "Dewpoint_c": -13.4,
        "Wind_Direction": 14,
        "Wind_Speed_kt": 12.2
      },
      {
        "Altitude_ft": 14465,
        "Temp_c": -12.1,
        "Dewpoint_c": -13.5,
        "Wind_Direction": 14,
        "Wind_Speed_kt": 12.2
      },
      {
        "Altitude_ft": 14485,
        "Temp_c": -12.2,
        "Dewpoint_c": -13.5,
        "Wind_Direction": 15,
        "Wind_Speed_kt": 12.2
      },
      {
        "Altitude_ft": 14505,
        "Temp_c": -12.2,
        "Dewpoint_c": -13.6,
        "Wind_Direction": 15,
        "Wind_Speed_kt": 12.2
      },
      {
        "Altitude_ft": 14528,
        "Temp_c": -12.2,
        "Dewpoint_c": -13.6,
        "Wind_Direction": 15,
        "Wind_Speed_kt": 12.2
      },
      {
        "Altitude_ft": 14547,
        "Temp_c": -12.3,
        "Dewpoint_c": -13.6,
        "Wind_Direction": 16,
        "Wind_Speed_kt": 12.2
      },
      {
        "Altitude_ft": 14567,
        "Temp_c": -12.3,
        "Dewpoint_c": -13.7,
        "Wind_Direction": 16,
        "Wind_Speed_kt": 12.2
      },
      {
        "Altitude_ft": 14590,
        "Temp_c": -12.3,
        "Dewpoint_c": -13.7,
        "Wind_Direction": 16,
        "Wind_Speed_kt": 12.4
      },
      {
        "Altitude_ft": 14610,
        "Temp_c": -12.4,
        "Dewpoint_c": -13.8,
        "Wind_Direction": 17,
        "Wind_Speed_kt": 12.4
      },
      {
        "Altitude_ft": 14629,
        "Temp_c": -12.4,
        "Dewpoint_c": -13.8,
        "Wind_Direction": 17,
        "Wind_Speed_kt": 12.4
      },
      {
        "Altitude_ft": 14649,
        "Temp_c": -12.5,
        "Dewpoint_c": -13.8,
        "Wind_Direction": 17,
        "Wind_Speed_kt": 12.4
      },
      {
        "Altitude_ft": 14669,
        "Temp_c": -12.5,
        "Dewpoint_c": -13.9,
        "Wind_Direction": 18,
        "Wind_Speed_kt": 12.4
      },
      {
        "Altitude_ft": 14688,
        "Temp_c": -12.5,
        "Dewpoint_c": -13.9,
        "Wind_Direction": 18,
        "Wind_Speed_kt": 12.6
      },
      {
        "Altitude_ft": 14708,
        "Temp_c": -12.6,
        "Dewpoint_c": -14,
        "Wind_Direction": 18,
        "Wind_Speed_kt": 12.8
      },
      {
        "Altitude_ft": 14731,
        "Temp_c": -12.6,
        "Dewpoint_c": -14,
        "Wind_Direction": 19,
        "Wind_Speed_kt": 12.8
      },
      {
        "Altitude_ft": 14751,
        "Temp_c": -12.6,
        "Dewpoint_c": -14,
        "Wind_Direction": 19,
        "Wind_Speed_kt": 13
      },
      {
        "Altitude_ft": 14774,
        "Temp_c": -12.7,
        "Dewpoint_c": -14.1,
        "Wind_Direction": 19,
        "Wind_Speed_kt": 13.2
      },
      {
        "Altitude_ft": 14793,
        "Temp_c": -12.7,
        "Dewpoint_c": -14.1,
        "Wind_Direction": 20,
        "Wind_Speed_kt": 13.2
      },
      {
        "Altitude_ft": 14813,
        "Temp_c": -12.8,
        "Dewpoint_c": -14.2,
        "Wind_Direction": 20,
        "Wind_Speed_kt": 13.4
      },
      {
        "Altitude_ft": 14836,
        "Temp_c": -12.8,
        "Dewpoint_c": -14.3,
        "Wind_Direction": 20,
        "Wind_Speed_kt": 13.6
      },
      {
        "Altitude_ft": 14856,
        "Temp_c": -12.8,
        "Dewpoint_c": -14.3,
        "Wind_Direction": 20,
        "Wind_Speed_kt": 13.8
      },
      {
        "Altitude_ft": 14875,
        "Temp_c": -12.9,
        "Dewpoint_c": -14.4,
        "Wind_Direction": 21,
        "Wind_Speed_kt": 13.8
      },
      {
        "Altitude_ft": 14898,
        "Temp_c": -12.9,
        "Dewpoint_c": -14.4,
        "Wind_Direction": 21,
        "Wind_Speed_kt": 14
      },
      {
        "Altitude_ft": 14918,
        "Temp_c": -12.9,
        "Dewpoint_c": -14.5,
        "Wind_Direction": 21,
        "Wind_Speed_kt": 14.2
      },
      {
        "Altitude_ft": 14941,
        "Temp_c": -13,
        "Dewpoint_c": -14.5,
        "Wind_Direction": 22,
        "Wind_Speed_kt": 14.2
      },
      {
        "Altitude_ft": 14961,
        "Temp_c": -13,
        "Dewpoint_c": -14.6,
        "Wind_Direction": 22,
        "Wind_Speed_kt": 14.4
      },
      {
        "Altitude_ft": 14980,
        "Temp_c": -13,
        "Dewpoint_c": -14.6,
        "Wind_Direction": 22,
        "Wind_Speed_kt": 14.6
      },
      {
        "Altitude_ft": 15000,
        "Temp_c": -13.1,
        "Dewpoint_c": -14.7,
        "Wind_Direction": 22,
        "Wind_Speed_kt": 14.8
      },
      {
        "Altitude_ft": 15016,
        "Temp_c": -13.1,
        "Dewpoint_c": -14.8,
        "Wind_Direction": 23,
        "Wind_Speed_kt": 14.8
      },
      {
        "Altitude_ft": 15036,
        "Temp_c": -13.1,
        "Dewpoint_c": -14.8,
        "Wind_Direction": 23,
        "Wind_Speed_kt": 15
      },
      {
        "Altitude_ft": 15056,
        "Temp_c": -13.2,
        "Dewpoint_c": -14.9,
        "Wind_Direction": 23,
        "Wind_Speed_kt": 15.2
      },
      {
        "Altitude_ft": 15075,
        "Temp_c": -13.2,
        "Dewpoint_c": -14.9,
        "Wind_Direction": 23,
        "Wind_Speed_kt": 15.4
      },
      {
        "Altitude_ft": 15095,
        "Temp_c": -13.3,
        "Dewpoint_c": -15,
        "Wind_Direction": 24,
        "Wind_Speed_kt": 15.6
      },
      {
        "Altitude_ft": 15118,
        "Temp_c": -13.3,
        "Dewpoint_c": -15.1,
        "Wind_Direction": 24,
        "Wind_Speed_kt": 15.7
      },
      {
        "Altitude_ft": 15138,
        "Temp_c": -13.3,
        "Dewpoint_c": -15.1,
        "Wind_Direction": 24,
        "Wind_Speed_kt": 15.9
      },
      {
        "Altitude_ft": 15157,
        "Temp_c": -13.4,
        "Dewpoint_c": -15.2,
        "Wind_Direction": 25,
        "Wind_Speed_kt": 16.1
      },
      {
        "Altitude_ft": 15180,
        "Temp_c": -13.4,
        "Dewpoint_c": -15.2,
        "Wind_Direction": 25,
        "Wind_Speed_kt": 16.3
      },
      {
        "Altitude_ft": 15200,
        "Temp_c": -13.4,
        "Dewpoint_c": -15.3,
        "Wind_Direction": 25,
        "Wind_Speed_kt": 16.5
      },
      {
        "Altitude_ft": 15220,
        "Temp_c": -13.5,
        "Dewpoint_c": -15.4,
        "Wind_Direction": 26,
        "Wind_Speed_kt": 16.7
      },
      {
        "Altitude_ft": 15236,
        "Temp_c": -13.5,
        "Dewpoint_c": -15.4,
        "Wind_Direction": 26,
        "Wind_Speed_kt": 16.9
      },
      {
        "Altitude_ft": 15256,
        "Temp_c": -13.6,
        "Dewpoint_c": -15.5,
        "Wind_Direction": 26,
        "Wind_Speed_kt": 17.1
      },
      {
        "Altitude_ft": 15276,
        "Temp_c": -13.6,
        "Dewpoint_c": -15.5,
        "Wind_Direction": 27,
        "Wind_Speed_kt": 17.3
      },
      {
        "Altitude_ft": 15295,
        "Temp_c": -13.6,
        "Dewpoint_c": -15.6,
        "Wind_Direction": 27,
        "Wind_Speed_kt": 17.5
      },
      {
        "Altitude_ft": 15315,
        "Temp_c": -13.7,
        "Dewpoint_c": -15.7,
        "Wind_Direction": 27,
        "Wind_Speed_kt": 17.7
      },
      {
        "Altitude_ft": 15331,
        "Temp_c": -13.7,
        "Dewpoint_c": -15.7,
        "Wind_Direction": 27,
        "Wind_Speed_kt": 17.9
      },
      {
        "Altitude_ft": 15351,
        "Temp_c": -13.8,
        "Dewpoint_c": -15.8,
        "Wind_Direction": 28,
        "Wind_Speed_kt": 18.1
      },
      {
        "Altitude_ft": 15371,
        "Temp_c": -13.8,
        "Dewpoint_c": -15.8,
        "Wind_Direction": 28,
        "Wind_Speed_kt": 18.3
      },
      {
        "Altitude_ft": 15387,
        "Temp_c": -13.8,
        "Dewpoint_c": -15.9,
        "Wind_Direction": 28,
        "Wind_Speed_kt": 18.5
      },
      {
        "Altitude_ft": 15407,
        "Temp_c": -13.9,
        "Dewpoint_c": -15.9,
        "Wind_Direction": 28,
        "Wind_Speed_kt": 18.7
      },
      {
        "Altitude_ft": 15427,
        "Temp_c": -13.9,
        "Dewpoint_c": -16,
        "Wind_Direction": 29,
        "Wind_Speed_kt": 18.9
      },
      {
        "Altitude_ft": 15446,
        "Temp_c": -13.9,
        "Dewpoint_c": -16,
        "Wind_Direction": 29,
        "Wind_Speed_kt": 19
      },
      {
        "Altitude_ft": 15469,
        "Temp_c": -14,
        "Dewpoint_c": -16.1,
        "Wind_Direction": 29,
        "Wind_Speed_kt": 19
      },
      {
        "Altitude_ft": 15489,
        "Temp_c": -14,
        "Dewpoint_c": -16.1,
        "Wind_Direction": 29,
        "Wind_Speed_kt": 19.2
      },
      {
        "Altitude_ft": 15509,
        "Temp_c": -14.1,
        "Dewpoint_c": -16.2,
        "Wind_Direction": 29,
        "Wind_Speed_kt": 19.2
      },
      {
        "Altitude_ft": 15528,
        "Temp_c": -14.1,
        "Dewpoint_c": -16.2,
        "Wind_Direction": 29,
        "Wind_Speed_kt": 19.4
      },
      {
        "Altitude_ft": 15548,
        "Temp_c": -14.1,
        "Dewpoint_c": -16.3,
        "Wind_Direction": 29,
        "Wind_Speed_kt": 19.4
      },
      {
        "Altitude_ft": 15564,
        "Temp_c": -14.2,
        "Dewpoint_c": -16.4,
        "Wind_Direction": 29,
        "Wind_Speed_kt": 19.4
      },
      {
        "Altitude_ft": 15584,
        "Temp_c": -14.2,
        "Dewpoint_c": -16.4,
        "Wind_Direction": 29,
        "Wind_Speed_kt": 19.6
      },
      {
        "Altitude_ft": 15604,
        "Temp_c": -14.3,
        "Dewpoint_c": -16.5,
        "Wind_Direction": 28,
        "Wind_Speed_kt": 19.6
      },
      {
        "Altitude_ft": 15623,
        "Temp_c": -14.3,
        "Dewpoint_c": -16.6,
        "Wind_Direction": 28,
        "Wind_Speed_kt": 19.6
      },
      {
        "Altitude_ft": 15643,
        "Temp_c": -14.4,
        "Dewpoint_c": -16.7,
        "Wind_Direction": 28,
        "Wind_Speed_kt": 19.8
      },
      {
        "Altitude_ft": 15663,
        "Temp_c": -14.5,
        "Dewpoint_c": -16.8,
        "Wind_Direction": 28,
        "Wind_Speed_kt": 19.8
      },
      {
        "Altitude_ft": 15682,
        "Temp_c": -14.5,
        "Dewpoint_c": -16.9,
        "Wind_Direction": 28,
        "Wind_Speed_kt": 19.8
      },
      {
        "Altitude_ft": 15702,
        "Temp_c": -14.6,
        "Dewpoint_c": -17,
        "Wind_Direction": 28,
        "Wind_Speed_kt": 20
      },
      {
        "Altitude_ft": 15722,
        "Temp_c": -14.6,
        "Dewpoint_c": -17.1,
        "Wind_Direction": 28,
        "Wind_Speed_kt": 20
      },
      {
        "Altitude_ft": 15741,
        "Temp_c": -14.7,
        "Dewpoint_c": -17.2,
        "Wind_Direction": 28,
        "Wind_Speed_kt": 20.2
      },
      {
        "Altitude_ft": 15761,
        "Temp_c": -14.7,
        "Dewpoint_c": -17.3,
        "Wind_Direction": 28,
        "Wind_Speed_kt": 20.2
      },
      {
        "Altitude_ft": 15781,
        "Temp_c": -14.8,
        "Dewpoint_c": -17.4,
        "Wind_Direction": 28,
        "Wind_Speed_kt": 20.2
      },
      {
        "Altitude_ft": 15801,
        "Temp_c": -14.8,
        "Dewpoint_c": -17.5,
        "Wind_Direction": 28,
        "Wind_Speed_kt": 20.4
      },
      {
        "Altitude_ft": 15817,
        "Temp_c": -14.9,
        "Dewpoint_c": -17.6,
        "Wind_Direction": 28,
        "Wind_Speed_kt": 20.4
      },
      {
        "Altitude_ft": 15837,
        "Temp_c": -14.9,
        "Dewpoint_c": -17.7,
        "Wind_Direction": 28,
        "Wind_Speed_kt": 20.4
      },
      {
        "Altitude_ft": 15856,
        "Temp_c": -15,
        "Dewpoint_c": -17.8,
        "Wind_Direction": 28,
        "Wind_Speed_kt": 20.4
      },
      {
        "Altitude_ft": 15876,
        "Temp_c": -15,
        "Dewpoint_c": -17.8,
        "Wind_Direction": 27,
        "Wind_Speed_kt": 20.4
      },
      {
        "Altitude_ft": 15896,
        "Temp_c": -15.1,
        "Dewpoint_c": -17.9,
        "Wind_Direction": 27,
        "Wind_Speed_kt": 20.2
      },
      {
        "Altitude_ft": 15915,
        "Temp_c": -15.1,
        "Dewpoint_c": -18,
        "Wind_Direction": 27,
        "Wind_Speed_kt": 20.2
      },
      {
        "Altitude_ft": 15938,
        "Temp_c": -15.2,
        "Dewpoint_c": -18.1,
        "Wind_Direction": 27,
        "Wind_Speed_kt": 20.2
      },
      {
        "Altitude_ft": 15958,
        "Temp_c": -15.2,
        "Dewpoint_c": -18.1,
        "Wind_Direction": 26,
        "Wind_Speed_kt": 20
      },
      {
        "Altitude_ft": 15978,
        "Temp_c": -15.3,
        "Dewpoint_c": -18.2,
        "Wind_Direction": 26,
        "Wind_Speed_kt": 20
      },
      {
        "Altitude_ft": 15997,
        "Temp_c": -15.3,
        "Dewpoint_c": -18.3,
        "Wind_Direction": 26,
        "Wind_Speed_kt": 20
      },
      {
        "Altitude_ft": 16020,
        "Temp_c": -15.3,
        "Dewpoint_c": -18.4,
        "Wind_Direction": 25,
        "Wind_Speed_kt": 19.8
      },
      {
        "Altitude_ft": 16040,
        "Temp_c": -15.4,
        "Dewpoint_c": -18.4,
        "Wind_Direction": 25,
        "Wind_Speed_kt": 19.8
      },
      {
        "Altitude_ft": 16060,
        "Temp_c": -15.4,
        "Dewpoint_c": -18.5,
        "Wind_Direction": 25,
        "Wind_Speed_kt": 19.8
      },
      {
        "Altitude_ft": 16079,
        "Temp_c": -15.5,
        "Dewpoint_c": -18.6,
        "Wind_Direction": 24,
        "Wind_Speed_kt": 19.6
      },
      {
        "Altitude_ft": 16102,
        "Temp_c": -15.5,
        "Dewpoint_c": -18.7,
        "Wind_Direction": 24,
        "Wind_Speed_kt": 19.6
      },
      {
        "Altitude_ft": 16122,
        "Temp_c": -15.6,
        "Dewpoint_c": -18.7,
        "Wind_Direction": 24,
        "Wind_Speed_kt": 19.6
      },
      {
        "Altitude_ft": 16142,
        "Temp_c": -15.6,
        "Dewpoint_c": -18.8,
        "Wind_Direction": 24,
        "Wind_Speed_kt": 19.4
      },
      {
        "Altitude_ft": 16161,
        "Temp_c": -15.6,
        "Dewpoint_c": -18.8,
        "Wind_Direction": 23,
        "Wind_Speed_kt": 19.4
      },
      {
        "Altitude_ft": 16181,
        "Temp_c": -15.7,
        "Dewpoint_c": -18.9,
        "Wind_Direction": 23,
        "Wind_Speed_kt": 19.4
      },
      {
        "Altitude_ft": 16201,
        "Temp_c": -15.7,
        "Dewpoint_c": -18.9,
        "Wind_Direction": 23,
        "Wind_Speed_kt": 19.2
      },
      {
        "Altitude_ft": 16220,
        "Temp_c": -15.8,
        "Dewpoint_c": -19,
        "Wind_Direction": 22,
        "Wind_Speed_kt": 19.2
      },
      {
        "Altitude_ft": 16240,
        "Temp_c": -15.8,
        "Dewpoint_c": -19,
        "Wind_Direction": 22,
        "Wind_Speed_kt": 19.2
      },
      {
        "Altitude_ft": 16260,
        "Temp_c": -15.8,
        "Dewpoint_c": -19.1,
        "Wind_Direction": 22,
        "Wind_Speed_kt": 19.2
      },
      {
        "Altitude_ft": 16280,
        "Temp_c": -15.9,
        "Dewpoint_c": -19.2,
        "Wind_Direction": 22,
        "Wind_Speed_kt": 19.2
      },
      {
        "Altitude_ft": 16299,
        "Temp_c": -15.9,
        "Dewpoint_c": -19.2,
        "Wind_Direction": 22,
        "Wind_Speed_kt": 19
      },
      {
        "Altitude_ft": 16316,
        "Temp_c": -16,
        "Dewpoint_c": -19.3,
        "Wind_Direction": 22,
        "Wind_Speed_kt": 19
      },
      {
        "Altitude_ft": 16332,
        "Temp_c": -16,
        "Dewpoint_c": -19.3,
        "Wind_Direction": 21,
        "Wind_Speed_kt": 19
      },
      {
        "Altitude_ft": 16352,
        "Temp_c": -16,
        "Dewpoint_c": -19.4,
        "Wind_Direction": 21,
        "Wind_Speed_kt": 19
      },
      {
        "Altitude_ft": 16368,
        "Temp_c": -16.1,
        "Dewpoint_c": -19.4,
        "Wind_Direction": 21,
        "Wind_Speed_kt": 19
      },
      {
        "Altitude_ft": 16388,
        "Temp_c": -16.1,
        "Dewpoint_c": -19.5,
        "Wind_Direction": 21,
        "Wind_Speed_kt": 19
      },
      {
        "Altitude_ft": 16407,
        "Temp_c": -16.2,
        "Dewpoint_c": -19.5,
        "Wind_Direction": 21,
        "Wind_Speed_kt": 19
      },
      {
        "Altitude_ft": 16427,
        "Temp_c": -16.2,
        "Dewpoint_c": -19.6,
        "Wind_Direction": 21,
        "Wind_Speed_kt": 19
      },
      {
        "Altitude_ft": 16447,
        "Temp_c": -16.3,
        "Dewpoint_c": -19.7,
        "Wind_Direction": 21,
        "Wind_Speed_kt": 19
      },
      {
        "Altitude_ft": 16467,
        "Temp_c": -16.3,
        "Dewpoint_c": -19.7,
        "Wind_Direction": 21,
        "Wind_Speed_kt": 19
      },
      {
        "Altitude_ft": 16486,
        "Temp_c": -16.4,
        "Dewpoint_c": -19.8,
        "Wind_Direction": 21,
        "Wind_Speed_kt": 18.9
      },
      {
        "Altitude_ft": 16506,
        "Temp_c": -16.4,
        "Dewpoint_c": -19.8,
        "Wind_Direction": 21,
        "Wind_Speed_kt": 18.9
      },
      {
        "Altitude_ft": 16526,
        "Temp_c": -16.4,
        "Dewpoint_c": -19.9,
        "Wind_Direction": 20,
        "Wind_Speed_kt": 18.9
      },
      {
        "Altitude_ft": 16545,
        "Temp_c": -16.5,
        "Dewpoint_c": -19.9,
        "Wind_Direction": 20,
        "Wind_Speed_kt": 18.9
      },
      {
        "Altitude_ft": 16562,
        "Temp_c": -16.5,
        "Dewpoint_c": -20,
        "Wind_Direction": 20,
        "Wind_Speed_kt": 18.9
      },
      {
        "Altitude_ft": 16581,
        "Temp_c": -16.6,
        "Dewpoint_c": -20,
        "Wind_Direction": 20,
        "Wind_Speed_kt": 18.9
      },
      {
        "Altitude_ft": 16601,
        "Temp_c": -16.6,
        "Dewpoint_c": -20.1,
        "Wind_Direction": 20,
        "Wind_Speed_kt": 18.9
      },
      {
        "Altitude_ft": 16621,
        "Temp_c": -16.7,
        "Dewpoint_c": -20.1,
        "Wind_Direction": 20,
        "Wind_Speed_kt": 18.9
      },
      {
        "Altitude_ft": 16640,
        "Temp_c": -16.7,
        "Dewpoint_c": -20.2,
        "Wind_Direction": 20,
        "Wind_Speed_kt": 18.9
      },
      {
        "Altitude_ft": 16660,
        "Temp_c": -16.8,
        "Dewpoint_c": -20.3,
        "Wind_Direction": 20,
        "Wind_Speed_kt": 19
      },
      {
        "Altitude_ft": 16680,
        "Temp_c": -16.8,
        "Dewpoint_c": -20.3,
        "Wind_Direction": 20,
        "Wind_Speed_kt": 19
      },
      {
        "Altitude_ft": 16699,
        "Temp_c": -16.9,
        "Dewpoint_c": -20.4,
        "Wind_Direction": 20,
        "Wind_Speed_kt": 19
      },
      {
        "Altitude_ft": 16719,
        "Temp_c": -16.9,
        "Dewpoint_c": -20.4,
        "Wind_Direction": 21,
        "Wind_Speed_kt": 19.2
      },
      {
        "Altitude_ft": 16739,
        "Temp_c": -17,
        "Dewpoint_c": -20.5,
        "Wind_Direction": 21,
        "Wind_Speed_kt": 19.2
      },
      {
        "Altitude_ft": 16759,
        "Temp_c": -17,
        "Dewpoint_c": -20.6,
        "Wind_Direction": 21,
        "Wind_Speed_kt": 19.2
      },
      {
        "Altitude_ft": 16781,
        "Temp_c": -17.1,
        "Dewpoint_c": -20.6,
        "Wind_Direction": 21,
        "Wind_Speed_kt": 19.4
      },
      {
        "Altitude_ft": 16801,
        "Temp_c": -17.1,
        "Dewpoint_c": -20.7,
        "Wind_Direction": 21,
        "Wind_Speed_kt": 19.4
      },
      {
        "Altitude_ft": 16821,
        "Temp_c": -17.2,
        "Dewpoint_c": -20.7,
        "Wind_Direction": 21,
        "Wind_Speed_kt": 19.4
      },
      {
        "Altitude_ft": 16844,
        "Temp_c": -17.2,
        "Dewpoint_c": -20.8,
        "Wind_Direction": 22,
        "Wind_Speed_kt": 19.6
      },
      {
        "Altitude_ft": 16864,
        "Temp_c": -17.3,
        "Dewpoint_c": -20.9,
        "Wind_Direction": 22,
        "Wind_Speed_kt": 19.6
      },
      {
        "Altitude_ft": 16883,
        "Temp_c": -17.3,
        "Dewpoint_c": -20.9,
        "Wind_Direction": 22,
        "Wind_Speed_kt": 19.6
      },
      {
        "Altitude_ft": 16903,
        "Temp_c": -17.4,
        "Dewpoint_c": -21,
        "Wind_Direction": 22,
        "Wind_Speed_kt": 19.8
      },
      {
        "Altitude_ft": 16926,
        "Temp_c": -17.4,
        "Dewpoint_c": -21.1,
        "Wind_Direction": 22,
        "Wind_Speed_kt": 19.8
      },
      {
        "Altitude_ft": 16946,
        "Temp_c": -17.5,
        "Dewpoint_c": -21.1,
        "Wind_Direction": 22,
        "Wind_Speed_kt": 19.8
      },
      {
        "Altitude_ft": 16965,
        "Temp_c": -17.5,
        "Dewpoint_c": -21.2,
        "Wind_Direction": 22,
        "Wind_Speed_kt": 20
      },
      {
        "Altitude_ft": 16985,
        "Temp_c": -17.6,
        "Dewpoint_c": -21.3,
        "Wind_Direction": 22,
        "Wind_Speed_kt": 20
      },
      {
        "Altitude_ft": 17005,
        "Temp_c": -17.6,
        "Dewpoint_c": -21.3,
        "Wind_Direction": 23,
        "Wind_Speed_kt": 20
      },
      {
        "Altitude_ft": 17028,
        "Temp_c": -17.7,
        "Dewpoint_c": -21.4,
        "Wind_Direction": 23,
        "Wind_Speed_kt": 20.2
      },
      {
        "Altitude_ft": 17047,
        "Temp_c": -17.7,
        "Dewpoint_c": -21.5,
        "Wind_Direction": 23,
        "Wind_Speed_kt": 20.2
      },
      {
        "Altitude_ft": 17067,
        "Temp_c": -17.8,
        "Dewpoint_c": -21.5,
        "Wind_Direction": 23,
        "Wind_Speed_kt": 20.2
      },
      {
        "Altitude_ft": 17087,
        "Temp_c": -17.8,
        "Dewpoint_c": -21.6,
        "Wind_Direction": 22,
        "Wind_Speed_kt": 20.2
      },
      {
        "Altitude_ft": 17110,
        "Temp_c": -17.9,
        "Dewpoint_c": -21.7,
        "Wind_Direction": 22,
        "Wind_Speed_kt": 20.4
      },
      {
        "Altitude_ft": 17129,
        "Temp_c": -17.9,
        "Dewpoint_c": -21.8,
        "Wind_Direction": 22,
        "Wind_Speed_kt": 20.4
      },
      {
        "Altitude_ft": 17149,
        "Temp_c": -18,
        "Dewpoint_c": -21.8,
        "Wind_Direction": 22,
        "Wind_Speed_kt": 20.4
      },
      {
        "Altitude_ft": 17172,
        "Temp_c": -18,
        "Dewpoint_c": -21.9,
        "Wind_Direction": 22,
        "Wind_Speed_kt": 20.4
      },
      {
        "Altitude_ft": 17192,
        "Temp_c": -18,
        "Dewpoint_c": -22,
        "Wind_Direction": 22,
        "Wind_Speed_kt": 20.6
      },
      {
        "Altitude_ft": 17208,
        "Temp_c": -18.1,
        "Dewpoint_c": -22.1,
        "Wind_Direction": 22,
        "Wind_Speed_kt": 20.6
      },
      {
        "Altitude_ft": 17228,
        "Temp_c": -18.1,
        "Dewpoint_c": -22.2,
        "Wind_Direction": 22,
        "Wind_Speed_kt": 20.6
      },
      {
        "Altitude_ft": 17247,
        "Temp_c": -18.2,
        "Dewpoint_c": -22.2,
        "Wind_Direction": 22,
        "Wind_Speed_kt": 20.6
      },
      {
        "Altitude_ft": 17267,
        "Temp_c": -18.2,
        "Dewpoint_c": -22.3,
        "Wind_Direction": 22,
        "Wind_Speed_kt": 20.8
      },
      {
        "Altitude_ft": 17287,
        "Temp_c": -18.2,
        "Dewpoint_c": -22.4,
        "Wind_Direction": 21,
        "Wind_Speed_kt": 20.8
      },
      {
        "Altitude_ft": 17310,
        "Temp_c": -18.3,
        "Dewpoint_c": -22.5,
        "Wind_Direction": 21,
        "Wind_Speed_kt": 20.8
      },
      {
        "Altitude_ft": 17329,
        "Temp_c": -18.3,
        "Dewpoint_c": -22.6,
        "Wind_Direction": 21,
        "Wind_Speed_kt": 20.8
      },
      {
        "Altitude_ft": 17352,
        "Temp_c": -18.4,
        "Dewpoint_c": -22.7,
        "Wind_Direction": 21,
        "Wind_Speed_kt": 20.8
      },
      {
        "Altitude_ft": 17372,
        "Temp_c": -18.4,
        "Dewpoint_c": -22.8,
        "Wind_Direction": 21,
        "Wind_Speed_kt": 21
      },
      {
        "Altitude_ft": 17392,
        "Temp_c": -18.4,
        "Dewpoint_c": -22.9,
        "Wind_Direction": 21,
        "Wind_Speed_kt": 21
      },
      {
        "Altitude_ft": 17415,
        "Temp_c": -18.5,
        "Dewpoint_c": -23,
        "Wind_Direction": 21,
        "Wind_Speed_kt": 21
      },
      {
        "Altitude_ft": 17438,
        "Temp_c": -18.5,
        "Dewpoint_c": -23,
        "Wind_Direction": 21,
        "Wind_Speed_kt": 21
      },
      {
        "Altitude_ft": 17461,
        "Temp_c": -18.6,
        "Dewpoint_c": -23.1,
        "Wind_Direction": 21,
        "Wind_Speed_kt": 21
      },
      {
        "Altitude_ft": 17484,
        "Temp_c": -18.6,
        "Dewpoint_c": -23.2,
        "Wind_Direction": 21,
        "Wind_Speed_kt": 20.8
      },
      {
        "Altitude_ft": 17503,
        "Temp_c": -18.6,
        "Dewpoint_c": -23.2,
        "Wind_Direction": 21,
        "Wind_Speed_kt": 20.8
      },
      {
        "Altitude_ft": 17526,
        "Temp_c": -18.7,
        "Dewpoint_c": -23.3,
        "Wind_Direction": 21,
        "Wind_Speed_kt": 20.6
      },
      {
        "Altitude_ft": 17546,
        "Temp_c": -18.7,
        "Dewpoint_c": -23.4,
        "Wind_Direction": 21,
        "Wind_Speed_kt": 20.6
      },
      {
        "Altitude_ft": 17566,
        "Temp_c": -18.7,
        "Dewpoint_c": -23.4,
        "Wind_Direction": 21,
        "Wind_Speed_kt": 20.6
      },
      {
        "Altitude_ft": 17589,
        "Temp_c": -18.8,
        "Dewpoint_c": -23.5,
        "Wind_Direction": 21,
        "Wind_Speed_kt": 20.4
      },
      {
        "Altitude_ft": 17608,
        "Temp_c": -18.8,
        "Dewpoint_c": -23.5,
        "Wind_Direction": 21,
        "Wind_Speed_kt": 20.4
      },
      {
        "Altitude_ft": 17628,
        "Temp_c": -18.8,
        "Dewpoint_c": -23.6,
        "Wind_Direction": 21,
        "Wind_Speed_kt": 20.2
      },
      {
        "Altitude_ft": 17648,
        "Temp_c": -18.9,
        "Dewpoint_c": -23.7,
        "Wind_Direction": 21,
        "Wind_Speed_kt": 20.2
      },
      {
        "Altitude_ft": 17667,
        "Temp_c": -18.9,
        "Dewpoint_c": -23.7,
        "Wind_Direction": 21,
        "Wind_Speed_kt": 20
      },
      {
        "Altitude_ft": 17687,
        "Temp_c": -18.9,
        "Dewpoint_c": -23.8,
        "Wind_Direction": 21,
        "Wind_Speed_kt": 20
      },
      {
        "Altitude_ft": 17707,
        "Temp_c": -19,
        "Dewpoint_c": -23.8,
        "Wind_Direction": 21,
        "Wind_Speed_kt": 19.8
      },
      {
        "Altitude_ft": 17726,
        "Temp_c": -19,
        "Dewpoint_c": -23.9,
        "Wind_Direction": 21,
        "Wind_Speed_kt": 19.8
      },
      {
        "Altitude_ft": 17746,
        "Temp_c": -19.1,
        "Dewpoint_c": -24,
        "Wind_Direction": 21,
        "Wind_Speed_kt": 19.6
      },
      {
        "Altitude_ft": 17766,
        "Temp_c": -19.1,
        "Dewpoint_c": -24.1,
        "Wind_Direction": 21,
        "Wind_Speed_kt": 19.6
      },
      {
        "Altitude_ft": 17785,
        "Temp_c": -19.1,
        "Dewpoint_c": -24.1,
        "Wind_Direction": 21,
        "Wind_Speed_kt": 19.4
      },
      {
        "Altitude_ft": 17805,
        "Temp_c": -19.2,
        "Dewpoint_c": -24.2,
        "Wind_Direction": 21,
        "Wind_Speed_kt": 19.4
      },
      {
        "Altitude_ft": 17825,
        "Temp_c": -19.2,
        "Dewpoint_c": -24.3,
        "Wind_Direction": 21,
        "Wind_Speed_kt": 19.2
      },
      {
        "Altitude_ft": 17844,
        "Temp_c": -19.3,
        "Dewpoint_c": -24.4,
        "Wind_Direction": 21,
        "Wind_Speed_kt": 19.2
      },
      {
        "Altitude_ft": 17864,
        "Temp_c": -19.3,
        "Dewpoint_c": -24.5,
        "Wind_Direction": 21,
        "Wind_Speed_kt": 19.2
      },
      {
        "Altitude_ft": 17884,
        "Temp_c": -19.3,
        "Dewpoint_c": -24.5,
        "Wind_Direction": 21,
        "Wind_Speed_kt": 19
      },
      {
        "Altitude_ft": 17907,
        "Temp_c": -19.4,
        "Dewpoint_c": -24.6,
        "Wind_Direction": 21,
        "Wind_Speed_kt": 19
      },
      {
        "Altitude_ft": 17927,
        "Temp_c": -19.4,
        "Dewpoint_c": -24.7,
        "Wind_Direction": 21,
        "Wind_Speed_kt": 19
      },
      {
        "Altitude_ft": 17946,
        "Temp_c": -19.5,
        "Dewpoint_c": -24.8,
        "Wind_Direction": 21,
        "Wind_Speed_kt": 19
      },
      {
        "Altitude_ft": 17969,
        "Temp_c": -19.5,
        "Dewpoint_c": -24.9,
        "Wind_Direction": 21,
        "Wind_Speed_kt": 19
      },
      {
        "Altitude_ft": 17989,
        "Temp_c": -19.5,
        "Dewpoint_c": -24.9,
        "Wind_Direction": 21,
        "Wind_Speed_kt": 18.9
      },
      {
        "Altitude_ft": 18005,
        "Temp_c": -19.6,
        "Dewpoint_c": -25,
        "Wind_Direction": 21,
        "Wind_Speed_kt": 18.9
      },
      {
        "Altitude_ft": 18025,
        "Temp_c": -19.6,
        "Dewpoint_c": -25.1,
        "Wind_Direction": 21,
        "Wind_Speed_kt": 18.9
      },
      {
        "Altitude_ft": 18045,
        "Temp_c": -19.7,
        "Dewpoint_c": -25.2,
        "Wind_Direction": 21,
        "Wind_Speed_kt": 18.9
      },
      {
        "Altitude_ft": 18064,
        "Temp_c": -19.7,
        "Dewpoint_c": -25.2,
        "Wind_Direction": 21,
        "Wind_Speed_kt": 18.9
      },
      {
        "Altitude_ft": 18084,
        "Temp_c": -19.7,
        "Dewpoint_c": -25.3,
        "Wind_Direction": 21,
        "Wind_Speed_kt": 18.9
      },
      {
        "Altitude_ft": 18104,
        "Temp_c": -19.8,
        "Dewpoint_c": -25.4,
        "Wind_Direction": 21,
        "Wind_Speed_kt": 18.7
      },
      {
        "Altitude_ft": 18123,
        "Temp_c": -19.8,
        "Dewpoint_c": -25.5,
        "Wind_Direction": 21,
        "Wind_Speed_kt": 18.7
      },
      {
        "Altitude_ft": 18143,
        "Temp_c": -19.9,
        "Dewpoint_c": -25.6,
        "Wind_Direction": 21,
        "Wind_Speed_kt": 18.7
      },
      {
        "Altitude_ft": 18166,
        "Temp_c": -19.9,
        "Dewpoint_c": -25.6,
        "Wind_Direction": 21,
        "Wind_Speed_kt": 18.7
      },
      {
        "Altitude_ft": 18186,
        "Temp_c": -19.9,
        "Dewpoint_c": -25.7,
        "Wind_Direction": 21,
        "Wind_Speed_kt": 18.7
      },
      {
        "Altitude_ft": 18205,
        "Temp_c": -20,
        "Dewpoint_c": -25.8,
        "Wind_Direction": 21,
        "Wind_Speed_kt": 18.5
      },
      {
        "Altitude_ft": 18225,
        "Temp_c": -20,
        "Dewpoint_c": -25.9,
        "Wind_Direction": 21,
        "Wind_Speed_kt": 18.5
      },
      {
        "Altitude_ft": 18245,
        "Temp_c": -20.1,
        "Dewpoint_c": -25.9,
        "Wind_Direction": 21,
        "Wind_Speed_kt": 18.5
      },
      {
        "Altitude_ft": 18268,
        "Temp_c": -20.1,
        "Dewpoint_c": -26,
        "Wind_Direction": 21,
        "Wind_Speed_kt": 18.7
      },
      {
        "Altitude_ft": 18287,
        "Temp_c": -20.1,
        "Dewpoint_c": -26,
        "Wind_Direction": 21,
        "Wind_Speed_kt": 18.7
      },
      {
        "Altitude_ft": 18307,
        "Temp_c": -20.2,
        "Dewpoint_c": -26,
        "Wind_Direction": 20,
        "Wind_Speed_kt": 18.9
      },
      {
        "Altitude_ft": 18327,
        "Temp_c": -20.2,
        "Dewpoint_c": -26,
        "Wind_Direction": 20,
        "Wind_Speed_kt": 19
      },
      {
        "Altitude_ft": 18350,
        "Temp_c": -20.3,
        "Dewpoint_c": -26,
        "Wind_Direction": 20,
        "Wind_Speed_kt": 19
      },
      {
        "Altitude_ft": 18369,
        "Temp_c": -20.3,
        "Dewpoint_c": -26.1,
        "Wind_Direction": 20,
        "Wind_Speed_kt": 19.2
      },
      {
        "Altitude_ft": 18389,
        "Temp_c": -20.4,
        "Dewpoint_c": -26.1,
        "Wind_Direction": 20,
        "Wind_Speed_kt": 19.2
      },
      {
        "Altitude_ft": 18412,
        "Temp_c": -20.4,
        "Dewpoint_c": -26.1,
        "Wind_Direction": 20,
        "Wind_Speed_kt": 19.4
      },
      {
        "Altitude_ft": 18432,
        "Temp_c": -20.5,
        "Dewpoint_c": -26.1,
        "Wind_Direction": 20,
        "Wind_Speed_kt": 19.6
      },
      {
        "Altitude_ft": 18451,
        "Temp_c": -20.5,
        "Dewpoint_c": -26.1,
        "Wind_Direction": 20,
        "Wind_Speed_kt": 19.6
      },
      {
        "Altitude_ft": 18471,
        "Temp_c": -20.5,
        "Dewpoint_c": -26.2,
        "Wind_Direction": 20,
        "Wind_Speed_kt": 19.8
      },
      {
        "Altitude_ft": 18491,
        "Temp_c": -20.6,
        "Dewpoint_c": -26.2,
        "Wind_Direction": 20,
        "Wind_Speed_kt": 19.8
      },
      {
        "Altitude_ft": 18510,
        "Temp_c": -20.6,
        "Dewpoint_c": -26.2,
        "Wind_Direction": 20,
        "Wind_Speed_kt": 20
      },
      {
        "Altitude_ft": 18527,
        "Temp_c": -20.7,
        "Dewpoint_c": -26.2,
        "Wind_Direction": 20,
        "Wind_Speed_kt": 20.2
      },
      {
        "Altitude_ft": 18550,
        "Temp_c": -20.7,
        "Dewpoint_c": -26.3,
        "Wind_Direction": 20,
        "Wind_Speed_kt": 20.2
      },
      {
        "Altitude_ft": 18570,
        "Temp_c": -20.8,
        "Dewpoint_c": -26.3,
        "Wind_Direction": 20,
        "Wind_Speed_kt": 20.4
      },
      {
        "Altitude_ft": 18593,
        "Temp_c": -20.8,
        "Dewpoint_c": -26.3,
        "Wind_Direction": 20,
        "Wind_Speed_kt": 20.4
      },
      {
        "Altitude_ft": 18612,
        "Temp_c": -20.9,
        "Dewpoint_c": -26.3,
        "Wind_Direction": 20,
        "Wind_Speed_kt": 20.6
      },
      {
        "Altitude_ft": 18635,
        "Temp_c": -20.9,
        "Dewpoint_c": -26.3,
        "Wind_Direction": 20,
        "Wind_Speed_kt": 20.8
      },
      {
        "Altitude_ft": 18655,
        "Temp_c": -21,
        "Dewpoint_c": -26.4,
        "Wind_Direction": 20,
        "Wind_Speed_kt": 20.8
      },
      {
        "Altitude_ft": 18675,
        "Temp_c": -21,
        "Dewpoint_c": -26.4,
        "Wind_Direction": 20,
        "Wind_Speed_kt": 20.8
      },
      {
        "Altitude_ft": 18694,
        "Temp_c": -21,
        "Dewpoint_c": -26.4,
        "Wind_Direction": 20,
        "Wind_Speed_kt": 20.8
      },
      {
        "Altitude_ft": 18714,
        "Temp_c": -21.1,
        "Dewpoint_c": -26.4,
        "Wind_Direction": 20,
        "Wind_Speed_kt": 20.8
      },
      {
        "Altitude_ft": 18737,
        "Temp_c": -21.1,
        "Dewpoint_c": -26.5,
        "Wind_Direction": 20,
        "Wind_Speed_kt": 20.8
      },
      {
        "Altitude_ft": 18757,
        "Temp_c": -21.2,
        "Dewpoint_c": -26.5,
        "Wind_Direction": 21,
        "Wind_Speed_kt": 20.8
      },
      {
        "Altitude_ft": 18776,
        "Temp_c": -21.2,
        "Dewpoint_c": -26.5,
        "Wind_Direction": 21,
        "Wind_Speed_kt": 20.8
      },
      {
        "Altitude_ft": 18796,
        "Temp_c": -21.3,
        "Dewpoint_c": -26.5,
        "Wind_Direction": 21,
        "Wind_Speed_kt": 20.8
      },
      {
        "Altitude_ft": 18819,
        "Temp_c": -21.3,
        "Dewpoint_c": -26.6,
        "Wind_Direction": 21,
        "Wind_Speed_kt": 20.8
      },
      {
        "Altitude_ft": 18839,
        "Temp_c": -21.4,
        "Dewpoint_c": -26.6,
        "Wind_Direction": 21,
        "Wind_Speed_kt": 20.8
      },
      {
        "Altitude_ft": 18862,
        "Temp_c": -21.4,
        "Dewpoint_c": -26.6,
        "Wind_Direction": 21,
        "Wind_Speed_kt": 20.8
      },
      {
        "Altitude_ft": 18881,
        "Temp_c": -21.5,
        "Dewpoint_c": -26.6,
        "Wind_Direction": 22,
        "Wind_Speed_kt": 20.8
      },
      {
        "Altitude_ft": 18901,
        "Temp_c": -21.5,
        "Dewpoint_c": -26.7,
        "Wind_Direction": 22,
        "Wind_Speed_kt": 20.6
      },
      {
        "Altitude_ft": 18921,
        "Temp_c": -21.6,
        "Dewpoint_c": -26.7,
        "Wind_Direction": 22,
        "Wind_Speed_kt": 20.6
      },
      {
        "Altitude_ft": 18944,
        "Temp_c": -21.6,
        "Dewpoint_c": -26.7,
        "Wind_Direction": 22,
        "Wind_Speed_kt": 20.6
      },
      {
        "Altitude_ft": 18963,
        "Temp_c": -21.6,
        "Dewpoint_c": -26.8,
        "Wind_Direction": 22,
        "Wind_Speed_kt": 20.6
      },
      {
        "Altitude_ft": 18983,
        "Temp_c": -21.7,
        "Dewpoint_c": -26.8,
        "Wind_Direction": 22,
        "Wind_Speed_kt": 20.6
      },
      {
        "Altitude_ft": 19003,
        "Temp_c": -21.7,
        "Dewpoint_c": -26.8,
        "Wind_Direction": 22,
        "Wind_Speed_kt": 20.6
      },
      {
        "Altitude_ft": 19022,
        "Temp_c": -21.8,
        "Dewpoint_c": -26.9,
        "Wind_Direction": 23,
        "Wind_Speed_kt": 20.6
      },
      {
        "Altitude_ft": 19042,
        "Temp_c": -21.8,
        "Dewpoint_c": -26.9,
        "Wind_Direction": 23,
        "Wind_Speed_kt": 20.6
      },
      {
        "Altitude_ft": 19065,
        "Temp_c": -21.9,
        "Dewpoint_c": -26.9,
        "Wind_Direction": 23,
        "Wind_Speed_kt": 20.6
      },
      {
        "Altitude_ft": 19085,
        "Temp_c": -21.9,
        "Dewpoint_c": -26.9,
        "Wind_Direction": 23,
        "Wind_Speed_kt": 20.6
      },
      {
        "Altitude_ft": 19108,
        "Temp_c": -22,
        "Dewpoint_c": -27,
        "Wind_Direction": 23,
        "Wind_Speed_kt": 20.4
      },
      {
        "Altitude_ft": 19127,
        "Temp_c": -22,
        "Dewpoint_c": -27,
        "Wind_Direction": 24,
        "Wind_Speed_kt": 20.4
      },
      {
        "Altitude_ft": 19147,
        "Temp_c": -22.1,
        "Dewpoint_c": -27,
        "Wind_Direction": 24,
        "Wind_Speed_kt": 20.2
      },
      {
        "Altitude_ft": 19170,
        "Temp_c": -22.1,
        "Dewpoint_c": -27,
        "Wind_Direction": 24,
        "Wind_Speed_kt": 20.2
      },
      {
        "Altitude_ft": 19190,
        "Temp_c": -22.1,
        "Dewpoint_c": -27.1,
        "Wind_Direction": 25,
        "Wind_Speed_kt": 20
      },
      {
        "Altitude_ft": 19209,
        "Temp_c": -22.2,
        "Dewpoint_c": -27.1,
        "Wind_Direction": 25,
        "Wind_Speed_kt": 20
      },
      {
        "Altitude_ft": 19229,
        "Temp_c": -22.2,
        "Dewpoint_c": -27.1,
        "Wind_Direction": 25,
        "Wind_Speed_kt": 19.8
      },
      {
        "Altitude_ft": 19252,
        "Temp_c": -22.3,
        "Dewpoint_c": -27.1,
        "Wind_Direction": 26,
        "Wind_Speed_kt": 19.8
      },
      {
        "Altitude_ft": 19272,
        "Temp_c": -22.3,
        "Dewpoint_c": -27.1,
        "Wind_Direction": 26,
        "Wind_Speed_kt": 19.6
      },
      {
        "Altitude_ft": 19295,
        "Temp_c": -22.4,
        "Dewpoint_c": -27.2,
        "Wind_Direction": 26,
        "Wind_Speed_kt": 19.6
      },
      {
        "Altitude_ft": 19318,
        "Temp_c": -22.4,
        "Dewpoint_c": -27.2,
        "Wind_Direction": 26,
        "Wind_Speed_kt": 19.6
      },
      {
        "Altitude_ft": 19337,
        "Temp_c": -22.5,
        "Dewpoint_c": -27.2,
        "Wind_Direction": 27,
        "Wind_Speed_kt": 19.4
      },
      {
        "Altitude_ft": 19360,
        "Temp_c": -22.5,
        "Dewpoint_c": -27.3,
        "Wind_Direction": 27,
        "Wind_Speed_kt": 19.4
      },
      {
        "Altitude_ft": 19380,
        "Temp_c": -22.6,
        "Dewpoint_c": -27.3,
        "Wind_Direction": 27,
        "Wind_Speed_kt": 19.2
      },
      {
        "Altitude_ft": 19400,
        "Temp_c": -22.6,
        "Dewpoint_c": -27.3,
        "Wind_Direction": 28,
        "Wind_Speed_kt": 19.2
      },
      {
        "Altitude_ft": 19419,
        "Temp_c": -22.7,
        "Dewpoint_c": -27.4,
        "Wind_Direction": 28,
        "Wind_Speed_kt": 19
      },
      {
        "Altitude_ft": 19442,
        "Temp_c": -22.8,
        "Dewpoint_c": -27.4,
        "Wind_Direction": 28,
        "Wind_Speed_kt": 19
      },
      {
        "Altitude_ft": 19462,
        "Temp_c": -22.8,
        "Dewpoint_c": -27.5,
        "Wind_Direction": 29,
        "Wind_Speed_kt": 19
      },
      {
        "Altitude_ft": 19482,
        "Temp_c": -22.9,
        "Dewpoint_c": -27.5,
        "Wind_Direction": 29,
        "Wind_Speed_kt": 18.9
      },
      {
        "Altitude_ft": 19505,
        "Temp_c": -23,
        "Dewpoint_c": -27.6,
        "Wind_Direction": 29,
        "Wind_Speed_kt": 18.9
      },
      {
        "Altitude_ft": 19528,
        "Temp_c": -23,
        "Dewpoint_c": -27.6,
        "Wind_Direction": 29,
        "Wind_Speed_kt": 18.9
      },
      {
        "Altitude_ft": 19547,
        "Temp_c": -23.1,
        "Dewpoint_c": -27.7,
        "Wind_Direction": 29,
        "Wind_Speed_kt": 18.9
      },
      {
        "Altitude_ft": 19570,
        "Temp_c": -23.1,
        "Dewpoint_c": -27.7,
        "Wind_Direction": 29,
        "Wind_Speed_kt": 18.9
      },
      {
        "Altitude_ft": 19590,
        "Temp_c": -23.2,
        "Dewpoint_c": -27.7,
        "Wind_Direction": 29,
        "Wind_Speed_kt": 19
      },
      {
        "Altitude_ft": 19613,
        "Temp_c": -23.3,
        "Dewpoint_c": -27.8,
        "Wind_Direction": 29,
        "Wind_Speed_kt": 19
      },
      {
        "Altitude_ft": 19633,
        "Temp_c": -23.3,
        "Dewpoint_c": -27.8,
        "Wind_Direction": 29,
        "Wind_Speed_kt": 19
      },
      {
        "Altitude_ft": 19656,
        "Temp_c": -23.4,
        "Dewpoint_c": -27.9,
        "Wind_Direction": 30,
        "Wind_Speed_kt": 19
      },
      {
        "Altitude_ft": 19675,
        "Temp_c": -23.4,
        "Dewpoint_c": -27.9,
        "Wind_Direction": 30,
        "Wind_Speed_kt": 19
      },
      {
        "Altitude_ft": 19698,
        "Temp_c": -23.5,
        "Dewpoint_c": -27.9,
        "Wind_Direction": 30,
        "Wind_Speed_kt": 19
      },
      {
        "Altitude_ft": 19721,
        "Temp_c": -23.5,
        "Dewpoint_c": -27.9,
        "Wind_Direction": 30,
        "Wind_Speed_kt": 19
      },
      {
        "Altitude_ft": 19744,
        "Temp_c": -23.6,
        "Dewpoint_c": -28,
        "Wind_Direction": 30,
        "Wind_Speed_kt": 19
      },
      {
        "Altitude_ft": 19767,
        "Temp_c": -23.6,
        "Dewpoint_c": -28,
        "Wind_Direction": 30,
        "Wind_Speed_kt": 19
      },
      {
        "Altitude_ft": 19790,
        "Temp_c": -23.7,
        "Dewpoint_c": -28,
        "Wind_Direction": 30,
        "Wind_Speed_kt": 19
      },
      {
        "Altitude_ft": 19813,
        "Temp_c": -23.7,
        "Dewpoint_c": -28,
        "Wind_Direction": 30,
        "Wind_Speed_kt": 19
      },
      {
        "Altitude_ft": 19833,
        "Temp_c": -23.8,
        "Dewpoint_c": -28.1,
        "Wind_Direction": 30,
        "Wind_Speed_kt": 19
      },
      {
        "Altitude_ft": 19852,
        "Temp_c": -23.9,
        "Dewpoint_c": -28.1,
        "Wind_Direction": 30,
        "Wind_Speed_kt": 19
      },
      {
        "Altitude_ft": 19872,
        "Temp_c": -23.9,
        "Dewpoint_c": -28.1,
        "Wind_Direction": 30,
        "Wind_Speed_kt": 19.2
      },
      {
        "Altitude_ft": 19892,
        "Temp_c": -24,
        "Dewpoint_c": -28.1,
        "Wind_Direction": 30,
        "Wind_Speed_kt": 19.2
      },
      {
        "Altitude_ft": 19911,
        "Temp_c": -24,
        "Dewpoint_c": -28.2,
        "Wind_Direction": 30,
        "Wind_Speed_kt": 19.2
      },
      {
        "Altitude_ft": 19931,
        "Temp_c": -24.1,
        "Dewpoint_c": -28.2,
        "Wind_Direction": 30,
        "Wind_Speed_kt": 19.2
      },
      {
        "Altitude_ft": 19951,
        "Temp_c": -24.1,
        "Dewpoint_c": -28.2,
        "Wind_Direction": 30,
        "Wind_Speed_kt": 19.4
      },
      {
        "Altitude_ft": 19974,
        "Temp_c": -24.2,
        "Dewpoint_c": -28.2,
        "Wind_Direction": 30,
        "Wind_Speed_kt": 19.6
      },
      {
        "Altitude_ft": 19993,
        "Temp_c": -24.2,
        "Dewpoint_c": -28.2,
        "Wind_Direction": 30,
        "Wind_Speed_kt": 19.6
      },
      {
        "Altitude_ft": 20013,
        "Temp_c": -24.3,
        "Dewpoint_c": -28.2,
        "Wind_Direction": 30,
        "Wind_Speed_kt": 19.8
      }
    ]
  },
  "windMapScreenshotMetadata": {
    "kind": "storage#object",
    "id": "wasatch-wind-static/wind-map-save.png/1791986427910899",
    "selfLink": "https://www.googleapis.com/storage/v1/b/wasatch-wind-static/o/wind-map-save.png",
    "mediaLink": "https://storage.googleapis.com/download/storage/v1/b/wasatch-wind-static/o/wind-map-save.png?generation=1791986427910899&alt=media",
    "name": "wind-map-save.png",
    "bucket": "wasatch-wind-static",
    "generation": "1791986427910899",
    "metageneration": "2",
    "contentType": "image/png",
    "storageClass": "STANDARD",
    "size": "805350",
    "md5Hash": "HhdckbccCzB8Vl5hqDpGCw==",
    "crc32c": "2sO1gw==",
    "etag": "CPO16dPVuZcDEAI=",
    "timeCreated": "2026-10-14T14:00:27.927Z",
    "updated": "2026-10-14T14:00:28.138Z",
    "timeStorageClassUpdated": "2026-10-14T14:00:27.927Z",
    "timeFinalized": "2026-10-14T14:00:27.927Z"
  },
  "windAloft6": {
    "@context": {
      "@version": "1.1",
      "@vocab": "https://api.weather.gov/ontology#"
    },
    "@id": "https://api.weather.gov/products/d04dbf3e-5ced-48aa-a00c-aac8d729b133",
    "id": "d04dbf3e-5ced-48aa-a00c-aac8d729b133",
    "wmoCollectiveId": "FBUS31",
    "issuingOffice": "KWNO",
    "issuanceTime": "2026-10-14T13:59:00+00:00",
    "productCode": "FD1",
    "productName": "6 Hour Winds Aloft Forecast",
    "productText": "\n000\nFBUS31 KWNO 141359\nFD1US1\nDATA BASED ON 141200Z    \nVALID 141800Z   FOR USE 1400-2100Z. TEMPS NEG ABV 24000\n\nFT  3000    6000    9000   12000   18000   24000  30000  34000  39000\nABI      2220+17 2219+14 2026+09 2044-06 2246-16 213530 212940 204351\nABQ              2218+07 2330-01 2263-11 2175-23 219333 219939 219348\nABR 9900 9900+06 2609+04 2720+01 2625-12 2543-24 255339 249745 742352\nACK 2725 2831+16 2834+10 2735+03 2852-12 3071-24 801031 811940 820348\nACY 2921 2825+15 2732+10 2842+03 2946-08 3065-17 307430 317738 316749\nAGC 2723 2728+15 2835+10 2844+05 2846-07 2849-17 297431 297439 295648\nALB 2925 2931+12 2836+07 2844+01 2962-11 2874-22 791730 802240 802251\nALS                      1939+00 2049-14 2075-23 209933 700439 209748\nAMA      1716    2025+11 2228+05 2343-08 2164-17 207131 207240 217251\nAST 3105 3507+08 9900+04 3406-01 3213-16 3032-27 294643 294952 304756\nATL 3307 9900+17 9900+13 9900+07 0306-07 3509-15 342128 341539 250551\nAVP 2922 2839+13 2742+09 2844+03 2972-09 2875-18 299232 800239 308848\nAXN 9900 3105+06 2913+05 2717+01 2831-11 2644-24 266239 750345 753653\nBAM              3619+03 0127-01 3638-14 3545-26 344341 334747 325248\nBCE                      3425-06 3530-19 3474-26 346337 333840 312243\nBDL 2918 2831+15 2635+09 2741+02 2962-12 2983-22 801431 801940 811450\nBFF      1215    1523+03 1526+00 1827-12 2137-23 217538 710043 710550\nBGR 3028 2826+08 2733+06 2838+01 2851-14 2754-27 297539 299043 308046\nBHM 3006 9900+16 9900+13 3307+08 9900-06 3216-15 322229 321339 241051\nBIH      9900    3516+05 3519+01 3437-11 3346-24 325340 326845 336648\nBIL      2516    2612+03 2609-02 2508-16 3607-29 290641 231747 222849\nBLH 3618 3620+08 3523+07 3323+04 3134-10 3345-23 324839 325444 314448\nBML 2925 2942+08 2844+07 2844+00 2749-14 2753-26 299436 791340 802048\nBNA 2411 2211+16 2513+12 2619+07 2621-05 3119-16 291730 273839 264152\nBOI      3517+08 3620+05 3623-01 3528-15 3434-26 343842 333750 313451\nBOS 3020 2828+15 2833+10 2738+02 2859-13 2971-24 801231 803240 812150\nBRL 0707 2712+13 2619+10 2520+04 2727-06 2849-18 256431 257641 257551\nBRO 1517 1414+18 1209+14 1009+10 0813-05 1120-14 122430 132240 131851\nBUF 3015 2927+11 2934+07 2948+02 2865-09 2870-21 781030 791640 791049\nCAE 2206 9900+17 1206+14 1105+07 0905-07 0314-13 342229 341938 341150\nCAR 2020 2512+05 2728+02 2738-01 2741-14 2645-27 275242 285145 285045\nCGI 2309 2416+17 2523+12 2531+07 2737-05 2735-15 252530 253640 245652\nCHS 2405 9900+17 0808+13 0809+07 0809-06 0418-12 022229 022538 032150\nCLE 3211 2727+13 2835+10 2849+04 2750-09 2865-17 287832 288840 287849\nCLL 1613 1917+18 1912+14 1713+09 2009-07 1916-14 202230 192740 182351\nCMH 2810 2724+16 2824+10 2735+04 2739-07 2848-17 286131 286640 275450\nCOU 3107 2813+15 2614+11 2411+06 2437-06 2533-16 253931 255341 236552\nCRP 1519 1514+17 1511+15 1313+09 1307-05 1414-14 152030 162141 151951\nCRW 2722 2726+16 2730+12 2727+06 2732-07 3032-16 294631 295139 286050\nCSG 3305 9900+17 9900+12 9900+08 0410-06 0412-14 012129 021539 100750\nCVG 2616 2716+16 2617+11 2533+06 2545-07 2642-17 284930 275439 276650\nCZI              1910+02 1710-02 1715-14 2029-26 225041 213848 216049\nDAL 1913 2115+17 2217+14 2121+09 2133-06 2330-15 213030 213740 193852\nDBQ 0512 9900+11 2910+09 2718+03 2626-09 2748-21 279532 259941 269753\nDEN              1618+01 1726+00 1924-11 2153-24 208836 700041 700350\nDIK      2507+05 2712+02 2515-01 2534-13 2532-26 245141 235549 236949\nDLH 9900 3010+05 2913+04 2915+00 2927-13 2839-26 287939 770246 764051\nDLN              3419+02 3515-03 3410-15 3516-27 342342 321850 271349\nDRT 1519 1728+20 2115+17 2013+10 1929-05 2032-16 193130 193141 183451\nDSM 0411 2405+12 2512+10 2521+04 2633-08 2643-21 258531 249541 249152\nECK 3515 3025+11 2936+08 2851+03 2853-10 2861-21 781331 771641 781651\nEKN      2730+16 2735+13 2733+06 2843-07 2832-17 305631 296039 295549\nELP      2608    2227+10 2337+06 2246-07 2259-18 217832 218041 217751\nELY              3522+01 3638-03 3649-14 3555-25 345440 345145 344646\nEMI 3120 2818+15 2633+11 2745+04 2951-08 3061-17 307230 307138 295648\nEVV 2515 2320+16 2425+12 2631+06 2642-05 2837-16 273930 264540 266151\nEYW 1308 0908+16 1011+12 0913+06 0809-06 0914-18 190632 090840 082849\nFAT 9900 3606+11 3515+09 3522+04 3434-10 3244-23 325838 327145 325849\nGPI      2717+02 3227+01 3227-02 3230-17 2930-28 263143 263052 263555\nFLO 2306 9900+18 9900+14 0605+06 9900-07 0314-14 342229 342538 342150\nFMN              2222+01 2129-06 2044-19 1986-23 208433 217838 216444\nFOT 0212 0214+14 0114+09 3414+03 3124-12 3037-24 304240 304947 306151\nFSD 0406 9900+08 2406+07 2512+02 2422-12 2531-21 259035 741842 742253\nFSM 2605 2706+16 2213+11 2427+07 2345-05 2532-15 242831 233440 214652\nFWA 3607 2819+14 2826+09 2634+04 2636-08 2855-17 277032 277941 287851\nGAG      1921+14 2228+10 2232+05 2339-07 2158-16 216431 206242 217151\nGCK      1719+11 1814+12 2324+04 2345-09 2273-18 208332 218541 218651\nGEG      3116+05 3414+02 3419-02 3433-16 3332-29 302844 293052 294355\nGFK 9900 3205+04 2710+02 2615-01 2519-13 2423-26 265141 266749 257651\nGGW      2315+06 2212+03 2311-02 2216-15 2216-27 221243 231549 233251\nGJT              1513+02 1822-04 1646-16 1456-27 176037 194839 203844\nGLD      1216    1827+09 2026+02 2235-10 2150-21 710232 710441 710352\nGRB 0109 3315+07 2929+06 2934+02 2852-11 2761-22 289135 773641 773352\nGRI      1210+10 2011+10 2013+03 2421-09 2537-21 229731 720041 239952\nGSP 9900 9900+17 2507+14 2305+07 9900-07 3211-16 322628 312638 281650\nGTF      3017    3113+01 2918-02 2919-15 2917-27 281742 262152 262652\nH51 1313 1112+19 0913+14 0914+10 0815-05 0823-14 102130 112340 111851\nH52 0815 0815+17 0815+13 0718+08 0915-06 0639-15 064829 074839 086051\nH61 0715 9900+15 9900+13 9900+07 1214-06 1008-20 065129 076838 086950\nHAT 2614 2607+18 3207+13 3414+06 3515-07 3316-15 323630 324637 333750\nHOU 1416 1608+18 1605+13 1411+09 0905-06 1309-14 161330 152340 162351\nHSV 2806 2507+16 2409+13 2909+08 2907-05 3115-16 302329 292539 262551\nICT 1815 2118+16 2009+12 2713+05 2344-06 2165-16 226031 225241 226651\nILM 2607 9900+18 9900+13 0206+06 3607-06 3512-14 342430 333538 342850\nIMB              3412+04 3417-01 3223-15 3135-26 314342 304551 304353\nIND 2812 2815+15 2427+09 2334+04 2825-06 2743-16 275531 276641 277451\nINK      2113+18 2223+14 2232+07 2037-06 2051-17 205231 214839 214951\nINL 3105 3411+03 3015+02 2722-01 2828-13 2931-26 284241 275350 277252\nJAN 2110 2506+18 9900+12 2706+08 1807-05 3309-14 281029 990040 191351\nJAX 9900 0607+15 0908+12 0707+08 0607-07 0632-14 073729 054138 063750\nJFK 3030 2836+15 2739+09 2741+02 2850-10 2975-19 309132 810138 317546\nJOT 0711 2809+12 2825+10 2628+05 2625-08 2853-18 267631 268341 268552\nLAS      3617+08 3625+03 3431+00 3346-12 3356-23 336240 326145 335647\nLBB      2025+16 2224+12 2327+06 2249-06 2154-16 205031 205240 216251\nLCH 1609 1609+18 9900+13 1308+09 9900-06 0909-13 100829 131940 152551\nLIT 2412 2215+17 2213+12 2320+08 2518-05 2720-15 252929 243640 233652\nLKV              0210+05 3615+01 3223-14 3329-25 323741 314550 305351\nLND              0411+00 0514-03 1016-15 1313-27 205340 222145 202747\nLOU 2617 2618+16 2522+11 2530+06 2544-07 2742-16 273930 274839 265951\nLRD 1522 1625+20 1715+17 1710+11 1616-05 1720-14 172630 183041 162652\nLSE 0610 3109+11 2918+07 2822+03 2833-11 2739-23 279435 762442 762553\nLWS 9900 3111+05 3313+02 3218-02 3428-16 3131-28 302943 293252 293954\nMBW              1327    1432-01 1625-12 1932-25 216140 208043 207748\nMCW 0410 9900+12 3005+07 2513+03 2628-10 2641-22 269833 751441 751153\nMEM 2415 2506+17 2514+12 2519+08 2513-05 2816-16 272929 253340 243752\nMGM 9900 9900+16 0105+12 0207+08 0707-06 0312-14 021929 031439 121051\nMIA 0608 1305+17 1409+12 1208+06 0823-07 0715-19 141832 072940 074449\nMKC 1805 2312+14 2311+10 2408+05 2420-07 2540-19 226031 235841 236853\nMKG 0209 3021+13 2927+09 2836+03 2840-10 2746-21 770832 760740 771253\nMLB 0810 1206+13 9900+13 0806+08 0608-06 1111-19 074928 076338 076250\nMLS      2410+06 2413+02 2315-02 2328-15 2342-28 225242 224747 224350\nMOB 1207 0609+17 0510+12 0412+08 0709-06 0518-14 052129 072039 101650\nMOT      2609+04 2513+02 2414-01 2314-14 2217-27 243642 254749 244751\nMQT 3313 3222+04 3125+05 3129+00 2943-15 2949-27 289136 772843 774651\nMRF              2221+14 2125+08 2035-06 2044-16 203931 213739 223951\nMSP 0407 3307+07 2918+06 2825+02 2835-11 2745-23 277038 762443 754053\nMSY 1309 0812+17 0713+12 0611+09 0612-06 0621-13 061629 092139 121750\nOKC 1210 2310+16 2311+12 2231+07 2250-05 2351-16 223730 224040 215251\nOMA 0411 1605+12 2311+10 2419+04 2530-08 2644-20 238431 239341 239352\nONL      1109+08 1807+08 2211+03 2324-11 2525-21 239934 721442 731553\nONT 0211 0218+12 3414+08 3319+04 3333-08 3344-22 335338 337044 335349\nORF 2612 2715+18 2818+13 2920+05 3131-07 3025-16 314430 324538 314449\nOTH 0416 0311+11 3610+06 3313+00 3126-13 3025-25 293840 294650 306153\nPDX 3609 0113+08 3509+04 3510-01 3314-16 3032-27 294842 285452 295055\nPFN 0505 0612+16 0515+11 0811+09 0810-07 0632-12 053029 062939 072950\nPHX 9900 3309+10 3015+06 3029+03 3046-09 3042-23 294038 274042 264949\nPIE 0709 0918+13 9900+14 1008+08 9900-07 0815-19 075128 075938 075850\nPIH      3307    3515+02 0115-02 0424-15 0336-26 013742 362647 310947\nPIR      9900+05 2508+05 2416+00 2224-12 2338-23 245739 730245 731552\nPLB 2926 2936+07 2842+06 2848+00 2856-14 2875-25 780035 792439 803349\nPRC              3319+03 3130+01 3255-12 3158-24 315838 305043 284447\nPSB      2837+15 2936+09 2937+03 2860-09 2872-17 298232 298839 307948\nPSX 1618 1510+17 1409+13 1312+09 1007-06 1413-14 151630 152240 151651\nPUB              1818+03 1939+01 2245-12 2070-22 700633 700841 700450\nPWM 2928 2829+12 2837+09 2843+01 2853-14 2860-26 299935 802439 812749\nRAP      1805+05 1805+04 2016-01 2018-13 2131-24 224540 227846 720551\nRBL 3505 0208+13 0109+08 3516+03 3225-12 3137-24 314340 315346 306350\nRDM      0106+09 0109+05 3512+00 3222-15 3130-26 304442 294951 304953\nRDU 3009 2709+17 2711+14 2813+06 3118-07 3116-16 313329 314437 323649\nRIC 2706 2619+17 2826+13 2928+05 3037-07 3122-17 314430 324438 314050\nRKS              0627    0619-02 1014-13 1324-25 175442 193844 201846\nRNO      9900    0211+06 0118+01 3432-12 3344-24 324640 325046 326848\nROA 2811 2723+18 2722+13 2822+06 2927-07 2828-17 303830 304538 305050\nROW      2110    2322+11 2240+06 2253-07 2167-18 208232 218240 217951\nSAC 3608 3611+13 3615+09 3518+04 3329-11 3237-23 315439 316945 315849\nSAN 0310 0215+12 3619+09 3521+05 3331-07 3336-21 335037 336344 324850\nSAT 1517 1720+18 1715+16 1714+10 1714-06 1819-14 182630 192841 162552\nSAV 9900 9900+16 0805+13 0909+08 0707-06 0524-12 032429 032739 052350\nSBA 9900 9900+12 3516+09 3424+05 3331-08 3341-22 326236 326844 325250\nSEA 2405 3208+07 3515+05 3516+00 3608-17 3314-29 303445 304352 295256\nSFO 0106 0111+13 3511+10 3518+05 3228-10 3235-23 315538 317245 316551\nSGF 2706 2409+16 2414+11 2222+06 2448-06 2547-16 254130 243740 235252\nSHV 2212 2312+17 2210+13 2215+08 2511-06 2409-14 232229 212640 202951\nSIY      0608+11 0309+07 3515+02 3125-13 3131-25 312940 303949 306051\nSLC      3205    0216+01 0421-04 1111-18 1335-29 032738 021842 280545\nSLN 1013 2223+15 1810+09 2016+05 2628-09 2372-16 216930 227341 227651\nSPI 2906 2914+15 2716+09 2627+05 2919-06 2840-17 265431 266540 256751\nSPS 1916 2118+18 2115+12 2028+08 2147-06 2347-16 224030 213240 204751\nSSM 3320 3327+04 3131+04 3137-01 2956-15 2861-26 780136 783141 784550\nSTL 2706 2512+15 2513+10 2521+05 2618-06 2634-16 264731 255340 246351\nSYR 2923 2931+11 2837+07 2948+01 2867-11 2878-21 791529 792440 802051\nT01 1314 1112+19 1011+14 1013+09 0811-06 0817-13 091329 112540 132751\nT06 1114 0818+17 0821+13 0717+09 0720-06 0728-13 072530 082839 112750\nT07 0911 0822+17 0719+12 0817+08 0720-06 0640-12 063729 073539 094050\nTCC      1609    2127+10 2132+04 2259-08 2176-18 208832 208940 218951\nTLH 9900 0609+15 0711+11 0910+09 1007-08 0635-12 052929 053039 072850\nTRI      2711+16 2616+13 2716+07 2715-07 3121-16 312829 293938 283550\nTUL 3422 1108+14 2025+11 2437+06 2351-06 2450-17 243331 213240 215651\nTUS      2405+10 2811+09 2818+05 2736-08 2833-23 254437 244441 245848\nTVC 3515 3322+04 3036+06 2942+02 2958-12 2874-22 289835 773740 773352\nTYS 2507 2507+17 2514+14 2612+07 2712-06 3116-16 312629 293738 273050\nWJF      0315+10 3211+07 3323+05 3335-09 3344-22 335637 327144 335449\nYKM 3206 3315+08 3618+04 0118-01 3620-17 3126-28 304543 295351 294555\nZUN              2518+02 2431-04 2458-18 2465-21 237634 237439 236846\n2XG 0505 0506+15 0808+12 9900+08 0807-06 0716-17 074328 054738 054750\n4J3 0812 0816+15 0714+13 0813+09 1108-07 0739-14 064728 074838 074850\n"
  },
  "windAloft12": {
    "@context": {
      "@version": "1.1",
      "@vocab": "https://api.weather.gov/ontology#"
    },
    "@id": "https://api.weather.gov/products/c527db1b-f959-4867-93f7-457d5882d52e",
    "id": "c527db1b-f959-4867-93f7-457d5882d52e",
    "wmoCollectiveId": "FBUS33",
    "issuingOffice": "KWNO",
    "issuanceTime": "2026-10-14T13:59:00+00:00",
    "productCode": "FD3",
    "productName": "24 Hour Winds Aloft Forecast",
    "productText": "\n000\nFBUS33 KWNO 141359\nFD3US3\nDATA BASED ON 141200Z    \nVALID 150000Z   FOR USE 2100-0600Z. TEMPS NEG ABV 24000\n\nFT  3000    6000    9000   12000   18000   24000  30000  34000  39000\nABI      1724+19 2120+13 2123+09 2238-05 2247-15 214630 214340 214451\nABQ              2619+08 2423+00 2564-09 2368-23 227836 228940 237947\nABR 9900 2206+06 2517+06 2522+01 2324-14 2339-23 246639 730845 731552\nACK 3028 2833+12 2845+08 2848+02 2956-10 2973-22 800332 802539 801350\nACY 2927 2830+15 3036+09 3145+05 2954-08 2864-17 307831 308240 297350\nAGC 3613 2926+14 3027+09 2931+04 2755-08 2856-16 296931 297841 297450\nALB 3127 3038+10 2945+06 2948+01 2969-11 2988-22 791432 793839 802652\nALS                      2332-03 2041-18 2185-22 219033 219539 217147\nAMA      2029    2021+11 2231+06 2257-07 2271-16 207431 207840 217951\nAST 0406 3005+09 9900+05 1107+00 3410-14 3429-25 344440 345450 314959\nATL 2905 9900+18 9900+14 9900+08 0212-05 9900-15 341228 321239 241150\nAVP 3321 3039+13 2941+09 3047+04 2964-09 2872-19 800230 790241 309651\nAXN 9900 2407+07 2617+05 2624+02 2428-12 2537-24 257038 751944 752152\nBAM              3619+05 3623+00 3532-14 3536-25 344741 335149 315048\nBCE                      3628-03 3623-16 3633-27 336137 325042 313344\nBDL 3131 2932+12 2940+07 2944+02 2966-10 2980-22 801031 803039 801450\nBFF      1115    1716+04 2028+00 1930-12 2143-24 216938 219144 219149\nBGR 3235 3031+06 2841+04 2844-02 2848-15 2958-26 296638 297644 297446\nBHM 2305 3107+16 9900+14 0209+09 0209-04 3405-14 321829 270639 211751\nBIH      9900    3413+08 3518+02 3434-11 3340-24 334340 325346 315648\nBIL      3311    3215+02 3217-02 3115-15 3014-27 321942 291850 253050\nBLH 3310 0124+11 3524+08 3327+05 3131-09 3135-22 314838 315942 314446\nBML 3031 3137+03 2947+04 2947-01 2956-13 2962-25 297737 299043 299047\nBNA 2212 2312+16 2612+12 2816+07 2822-05 2919-15 271730 273639 254251\nBOI      3322+10 3619+05 3522-01 3625-15 3328-27 324442 324151 313652\nBOS 3121 2932+11 2840+06 2845+01 2961-12 2985-23 791233 804239 802451\nBRL 0910 2710+13 2614+10 2717+04 2426-07 2751-18 256031 246940 257453\nBRO 1317 1411+17 1110+14 1109+10 0714-05 1015-14 111930 122040 122551\nBUF 3214 3128+10 3135+07 3144+03 2964-11 2873-22 791831 792740 792152\nCAE 2307 9900+19 9900+14 9900+07 0505-05 9900-14 340829 331938 291150\nCAR 3230 3128+03 3031-01 2837-03 2737-16 2844-27 295439 295445 285146\nCGI 9900 2613+17 2522+12 2529+07 2738-05 2731-16 253231 244340 255751\nCHS 2805 9900+18 0813+14 0508+08 0710-06 0311-12 090629 361938 011250\nCLE 0317 3020+13 2926+09 3031+03 2845-07 2855-18 288230 288442 278250\nCLL 1621 1814+18 1713+13 1711+09 2111-05 1814-14 192030 182441 172851\nCMH 3607 2818+15 2824+09 2828+04 2734-06 2945-16 285831 286740 287451\nCOU 0708 2105+14 2317+10 2420+06 2732-06 2643-16 234831 235441 247151\nCRP 1416 1417+19 1212+14 1310+10 1006-05 1511-14 151830 151841 142252\nCRW 2820 2822+16 2724+11 2830+06 2842-06 2933-16 294730 285440 286050\nCSG 9900 9900+18 0707+14 0607+08 0414-05 0508-14 021428 031239 160850\nCVG 3505 2709+15 2623+10 2819+05 2729-05 2833-15 275030 275241 276751\nCZI              0408+02 0908-02 0906-14 9900-26 252642 221647 214448\nDAL 1721 2024+18 2117+14 2120+09 2328-04 2228-15 214130 213941 213851\nDBQ 1116 9900+12 2407+09 2613+03 2536-07 2739-19 268432 258542 259251\nDEN              1911+02 2024-01 1726-14 1965-26 208235 208740 207447\nDIK      2513+06 2517+02 2521-02 2527-14 2238-27 235042 235848 236151\nDLH 9900 2507+05 2511+04 2619+01 2737-12 2743-24 276438 762144 762653\nDLN              3421+01 3622-02 0125-15 3415-27 311843 302351 282852\nDRT 1526 1529+19 1814+16 2013+10 2124-05 2032-15 193531 203340 203451\nDSM 0712 2407+12 2414+10 2419+04 2228-08 2758-18 248032 248041 248352\nECK 3616 3416+11 3123+08 3035+03 2952-10 2856-21 791231 782141 781151\nEKN      2820+15 2919+10 2826+05 2851-06 2939-17 295430 296240 296250\nELP      2613    2514+11 2530+06 2434-07 2247-20 217832 218240 227850\nELY              3417+04 0128-02 3539-14 3646-25 355640 335447 324546\nEMI 2712 2723+14 3029+10 3033+05 2956-09 2963-16 307230 307540 306350\nEVV 2707 2519+16 2623+11 2723+06 2837-06 2739-16 263931 264541 266151\nEYW 0914 0814+16 1010+12 1112+06 1308-07 1409-17 201132 180641 083050\nFAT 9900 9900+13 0108+10 3614+05 3328-11 3338-23 324739 316044 316349\nGPI      2709+05 3324+03 3231-01 3237-16 3352-28 324845 324752 293956\nFLO 2508 9900+20 9900+14 0205+07 0105-06 3007-14 300930 322738 311850\nFMN              2720+00 2521-05 2624-19 2721-31 246233 245638 244444\nFOT 3609 0108+15 3613+09 3415+03 3225-12 3235-24 324738 324746 316751\nFSD 0709 1705+09 2109+07 2414+02 2328-11 2327-21 249934 731043 741553\nFSM 1115 2013+18 2316+13 2423+08 2439-05 2336-15 234430 234541 225051\nFWA 0516 2815+13 2717+09 3122+04 2741-06 2849-17 276731 277341 278051\nGAG      2126+15 2129+12 2126+06 2353-09 2152-16 217131 207041 217251\nGCK      1739+14 2023+10 2022+05 2245-10 2276-19 209231 219341 219651\nGEG      3510+06 3516+04 3320-01 3323-16 3338-29 334245 345451 324357\nGFK 1908 2311+04 2517+02 2520-01 2636-14 2542-26 245041 247848 750452\nGGW      2916+06 2821+03 2825-02 2727-16 2830-28 282943 273151 254551\nGJT              1805+01 1712-05 0813-19 0535-31 990034 221437 251743\nGLD      1513    1932+08 1732+02 2140-11 2169-21 711133 711241 710951\nGRB 0606 3506+07 3012+07 2924+03 2836-10 2843-22 780433 761842 771853\nGRI      1711+11 2119+08 2119+03 2328-09 2355-20 229432 229942 730452\nGSP 2507 3006+19 9900+14 9900+08 3309-05 3309-16 311229 302638 282250\nGTF      3220    3019+01 3429-01 3534-15 3437-28 303344 293553 283554\nH51 1313 0917+18 0918+14 0816+09 0714-04 0821-14 082630 102840 123851\nH52 0918 1215+16 1114+13 1016+09 1405-05 0822-16 065429 075439 085951\nH61 0918 9900+17 1406+14 1107+07 0814-06 1110-20 084829 086738 086550\nHAT 2813 3012+19 3313+13 3315+06 3220-06 2927-14 322931 323438 324050\nHOU 1515 1413+19 1211+14 1410+10 1105-05 1208-13 141030 162340 163151\nHSV 2209 2807+16 3106+14 3109+08 3309-04 0109-15 302329 271939 232351\nICT 1713 2113+15 2323+10 2518+05 2444-08 2255-16 216931 217342 227651\nILM 2908 9900+20 3508+14 3609+06 3607-06 2814-13 301731 333038 322650\nIMB              3511+04 0113+00 0218-15 3325-27 333543 334249 324553\nIND 0707 2510+14 2813+10 2918+05 2724-05 2834-16 275630 265641 277351\nINK      1617+18 2222+13 2426+07 2340-06 2253-16 206130 205840 215751\nINL 9900 9900+04 2715+02 2722-02 2529-14 2639-26 276641 268148 761353\nJAN 2008 9900+19 9900+12 3406+09 9900-04 0307-14 280629 181240 201851\nJAX 0805 0509+17 0608+14 0612+09 0807-06 0732-14 083128 073638 073250\nJFK 3222 2942+14 2949+10 2946+04 2961-10 2873-19 800230 800240 308648\nJOT 0817 2505+11 2811+10 2821+04 2735-07 2737-19 278030 267342 268551\nLAS      3311+12 3525+06 3532+00 3341-11 3342-24 324839 325444 315646\nLBB      2026+18 2331+13 2334+07 2246-07 2157-16 206530 206440 216352\nLCH 1309 1212+19 1110+14 1008+10 9900-04 0910-14 111230 131940 162451\nLIT 1809 2111+17 2411+12 2515+08 2615-04 2518-15 243130 233940 224251\nLKV              3507+05 3610+01 3320-13 3327-26 313442 314149 315152\nLND              0319+01 0227-03 0327-14 0818-25 201743 240648 221947\nLOU 2609 2520+15 2624+11 2825+06 2830-05 2833-15 264030 274540 275951\nLRD 1425 1620+17 1514+16 1508+10 1809-05 1718-14 172431 172441 152552\nLSE 0908 9900+10 2712+07 2714+03 2628-10 2634-21 269733 750242 760752\nLWS 9900 3508+06 3616+03 3621+00 0128-15 3632-28 343345 333551 323954\nMBW              1225    1621+00 1515-14 1811-25 203440 194945 204647\nMCW 0810 9900+12 2107+08 2512+02 2428-08 2532-20 259332 259842 750152\nMEM 2109 2211+17 2506+12 2714+08 2512-04 2712-15 262229 253040 233651\nMGM 9900 9900+17 0509+14 0509+09 0415-04 0511-14 021829 061339 151350\nMIA 0919 0708+16 1008+12 1210+07 1414-07 1310-16 131232 092440 094250\nMKC 1505 2210+14 2413+10 2218+05 2623-08 2451-17 236130 236841 237051\nMKG 0508 3409+11 3018+08 3026+04 2836-09 2846-21 279831 770442 780451\nMLB 0817 9900+13 9900+14 0906+09 1009-05 1113-18 085328 086038 085650\nMLS      2615+06 2715+02 2817-02 2622-15 2625-28 263142 253348 244150\nMOB 9900 0710+17 0613+13 0515+09 0516-05 0622-14 072329 082339 112150\nMOT      2515+05 2619+01 2622-02 2534-14 2542-28 245443 246249 246251\nMQT 3406 3212+06 2813+05 2818+01 2931-13 2941-25 287938 773143 773753\nMRF              1710+13 2423+08 2333-06 2144-16 194530 204040 223951\nMSP 0608 9900+08 2618+06 2621+02 2526-11 2534-22 269235 751943 752152\nMSY 1110 0914+18 0814+13 0616+09 0516-05 0623-14 082329 102139 122250\nOKC 0922 2010+17 2216+12 2221+08 2241-05 2348-15 214330 213841 215752\nOMA 0715 2309+12 2212+10 2317+04 2227-08 2564-19 238432 239042 238852\nONL      1311+09 2014+09 2118+02 2128-10 2329-22 730234 720943 721352\nONT 9900 0113+14 0120+09 3517+05 3232-09 3238-22 325837 326642 314949\nORF 2716 3023+18 2920+13 3118+06 3036-06 3030-15 314131 304839 305450\nOTH 0517 0409+13 0109+06 3409+00 3320-12 3328-25 354639 354648 325955\nPDX 3609 0206+10 0108+05 0607+01 3510-15 3428-26 354940 355850 325058\nPFN 0706 0713+16 0710+14 0709+10 0615-06 0730-12 073129 072939 092850\nPHX 3006 0308+12 3312+08 3024+04 2935-09 2940-22 284238 293842 284148\nPIE 0815 1008+13 9900+15 1010+09 0708-06 1214-18 075228 075938 085850\nPIH      3012    3626+03 0128-02 3621-14 0117-26 352642 342449 301650\nPIR      9900+07 2008+06 2118+00 2228-14 2242-23 237138 730544 730951\nPLB 3225 3128+02 3041+02 3046-02 3062-14 3067-25 298437 790342 299346\nPRC              3313+04 3229+02 3037-10 3043-23 304838 304442 294347\nPSB      2934+12 3035+10 3043+03 2862-09 2866-17 298831 299141 298350\nPSX 1414 1416+19 1213+14 1411+10 1106-05 1311-13 151430 152141 152551\nPUB              2014+03 2125-01 1929-14 2078-21 209933 710239 218948\nPWM 3129 3033+09 2842+05 2843-01 2955-13 2973-25 790537 791542 791148\nRAP      1606+05 1309+04 1816+00 2021-15 2032-24 224339 227546 228451\nRBL 3407 3607+15 0108+09 3514+03 3324-12 3232-24 314240 315146 316850\nRDM      0107+10 3610+05 3511-01 3415-14 3328-26 343742 344649 325354\nRDU 2710 3114+19 2911+14 2913+07 3022-06 2920-15 312030 304038 293850\nRIC 2715 3219+17 2923+12 2923+06 2939-07 3136-15 304930 305439 295650\nRKS              0331    0221-04 0424-13 0616-25 091643 990045 221246\nRNO      9900    3608+07 0112+02 3328-13 3327-25 323440 324447 315949\nROA 2714 3120+17 2920+12 2821+07 2832-05 2932-17 304130 294539 295250\nROW      2218    2218+12 2524+06 2443-08 2260-20 218632 218940 218650\nSAC 3312 0111+15 0210+09 3616+04 3326-11 3137-23 324339 315145 325850\nSAN 0108 0212+14 3614+10 3419+06 3227-08 3235-21 325636 325942 314450\nSAT 1425 1612+17 1514+15 1611+10 1908-05 1918-14 182430 182441 162552\nSAV 9900 0405+17 0610+14 0712+09 0711-05 0615-12 081429 032039 061550\nSBA 2907 3513+13 0119+11 3522+06 3327-09 3237-22 325936 316743 315651\nSEA 0407 3405+08 3408+06 3213+00 2707-15 3325-26 344942 346551 325059\nSFO 3207 0111+15 0110+10 3517+05 3226-11 3237-23 314739 315844 316150\nSGF 0908 1908+16 2319+11 2618+07 2544-05 2542-15 234731 235241 236352\nSHV 1715 2307+18 2110+13 2214+09 2706-04 2309-14 221930 212841 203552\nSIY      9900+13 0305+08 3411+02 3323-12 3230-25 323641 324747 325852\nSLC      3307    3520+02 3623-03 3619-14 3513-27 023241 363045 322146\nSLN 1015 2121+14 2022+09 1915+06 2436-09 2366-16 227331 218142 228452\nSPI 0910 2608+15 2613+10 2718+05 2517-06 2536-17 265131 255641 257751\nSPS 9900 1622+18 1818+13 2032+07 2248-05 2345-14 214530 214441 215351\nSSM 3316 3419+07 3126+05 3135-01 3038-12 3044-26 298038 784143 784453\nSTL 9900 2506+15 2808+10 2517+05 2637-07 2644-15 254531 245241 257151\nSYR 3125 3034+07 3141+06 3149+02 2970-11 2888-22 792032 794939 792852\nT01 1217 1020+19 0918+14 0815+10 0609-04 0819-14 092130 112639 132751\nT06 1016 0923+18 0822+13 0720+09 0620-05 0728-13 083229 092939 103451\nT07 1016 0822+17 0717+13 0716+09 0811-06 0740-13 073829 094139 093950\nTCC      1616    2229+11 2231+03 2357-08 2175-19 209531 219639 219150\nTLH 0605 0611+16 0809+14 0610+10 0713-06 0727-12 072929 072939 082650\nTRI      3010+17 2816+13 2817+08 2820-05 3023-16 292730 293639 283650\nTUL 0815 1813+16 1915+11 1918+06 2355-06 2350-14 234830 234741 225952\nTUS      9900+14 2809+10 2812+06 2828-08 2828-22 273337 254041 264247\nTVC 0111 3612+09 3311+07 3016+02 2935-11 2959-22 299834 773041 782652\nTYS 2406 2806+18 2811+14 3013+08 2816-05 3116-15 292230 293439 273350\nWJF      3605+13 0213+08 3518+05 3331-09 3238-22 325737 316743 315350\nYKM 9900 3509+08 3508+05 3416+01 0305-15 3415-28 354742 366450 324758\nZUN              2813+05 2823-03 2758-11 2760-23 255437 245842 255347\n2XG 0606 0609+17 0509+14 0511+09 9900-06 0817-16 105128 064038 063750\n4J3 0810 0917+15 0814+14 0814+10 1006-06 0832-15 074528 084939 084750\n"
  },
  "windAloft24": {
    "@context": {
      "@version": "1.1",
      "@vocab": "https://api.weather.gov/ontology#"
    },
    "@id": "https://api.weather.gov/products/b85696ee-276d-482e-a1dc-b740136f275f",
    "id": "b85696ee-276d-482e-a1dc-b740136f275f",
    "wmoCollectiveId": "FBUS35",
    "issuingOffice": "KWNO",
    "issuanceTime": "2026-10-14T13:59:00+00:00",
    "productCode": "FD5",
    "productName": "Winds Aloft Forecast",
    "productText": "\n000\nFBUS35 KWNO 141359\nFD5US5\nDATA BASED ON 141200Z    \nVALID 151200Z   FOR USE 0600-1800Z. TEMPS NEG ABV 24000\n\nFT  3000    6000    9000   12000   18000   24000  30000  34000  39000\nABI      2322+18 2012+12 2018+06 2035-06 2144-16 215031 215341 215452\nABQ              3215+04 2815+01 2636-11 2548-23 245236 235740 235546\nABR 3012 3316+05 2920+02 2722-02 2532-15 2448-26 236742 229347 730850\nACK 3628 3233+11 3140+08 3143+03 3044-12 3067-23 811233 812942 811752\nACY 0517 3121+14 3026+10 2930+04 3042-07 2964-17 307132 307342 307052\nAGC 1208 2710+14 2817+08 2723+05 2826-07 2844-16 295432 296143 296952\nALB 0122 3230+08 3235+08 3033+03 2942-12 3071-22 810434 802343 801952\nALS                      3119-04 2734-15 2641-27 246134 236239 246444\nAMA      2409    2325+08 2237+05 2339-09 2253-20 218432 219141 228351\nAST 1316 1507+12 1610+07 1814+02 2513-10 2714-22 291839 301748 313958\nATL 2706 9900+17 1607+13 1507+08 0913-05 9900-16 360629 990040 271251\nAVP 0115 3312+13 3019+09 2924+03 3043-09 2966-18 308632 309143 308952\nAXN 2711 2913+04 2516+00 2230-03 2547-14 2462-25 248141 733145 733552\nBAM              0416+05 0322+00 0533-14 0440-26 034641 025547 014753\nBCE                      0319+00 3413-12 3413-25 322842 312747 303148\nBDL 0130 3229+11 3132+08 3033+03 3042-12 3073-21 810433 801843 811752\nBFF      3620    0320-02 0516-05 0219-17 0140-26 990037 223442 224445\nBGR 3435 3444-02 3358-02 3275+00 3180-13 3086-26 308942 800246 800648\nBHM 2407 9900+15 1709+13 1308+08 0914-06 0605-14 360829 200940 251451\nBIH      9900    0110+06 0214+01 3524-13 3522-26 343838 344943 324850\nBIL      3619    3315-03 3326-03 3344-16 3244-28 324344 314951 334255\nBLH 0122 0226+12 0126+07 3623+05 3225-10 3127-23 303038 314342 304246\nBML 3227 3343-01 3354+03 3263+03 3068-12 3072-26 309939 802144 812851\nBNA 2515 2415+16 2316+12 2314+07 2410-06 2515-16 282731 263440 264251\nBOI      0605+11 0613+08 0316+01 0126-13 0137-25 035141 016051 365258\nBOS 3632 3329+08 3240+07 3146+02 3051-13 3066-24 811035 813643 812652\nBRL 1711 2410+13 2410+09 2423+05 2629-09 2656-17 236933 248242 248855\nBRO 1417 1306+18 1010+15 1010+08 0719-06 0720-14 091731 091239 102152\nBUF 0816 3509+11 2918+08 2721+02 2939-10 2864-20 299233 790343 790552\nCAE 2607 9900+18 1611+13 9900+08 9900-05 0507-16 291730 341539 301751\nCAR 3337 3441-06 3349-10 3364-11 8210-15 8114-27 811740 810546 307845\nCGI 2120 2228+16 2322+11 2228+07 2331-06 2536-16 264631 254741 255353\nCHS 9900 1505+18 1315+13 9900+07 0908-05 1108-15 990030 361339 351451\nCLE 1113 2610+12 2718+09 2623+04 2732-08 2744-17 286033 286943 298152\nCLL 1818 1616+19 1517+14 1519+09 1111-06 1610-15 191730 202740 193051\nCMH 1408 2408+14 2719+10 2629+05 2629-08 2747-17 284532 275542 286552\nCOU 0607 9900+15 2510+11 2413+06 2226-05 2236-16 244631 244742 235854\nCRP 1415 1411+18 1315+15 1119+09 0812-06 1013-14 131230 151739 161851\nCRW 2206 2709+15 2712+10 2720+06 2749-06 2938-16 294132 284941 285751\nCSG 2105 1305+17 1209+13 1508+08 1017-05 0913-15 080829 081040 990050\nCVG 2105 2612+15 2624+10 2531+06 2634-05 2638-17 264231 274842 275852\nCZI              0141-01 0133-03 3632-15 3428-28 311444 302250 272951\nDAL 2119 2120+20 2019+12 1919+07 2023-07 2128-16 213631 213841 225151\nDBQ 1316 2311+10 2415+08 2417+03 2437-10 2654-22 238532 249843 750355\nDEN              3224-01 3126-05 3016-17 0137-27 281238 224239 234543\nDIK      3232+03 3142-02 3046-04 2952-19 2856-29 245644 256249 256351\nDLH 2113 2415+03 2522+02 2533-02 2644-14 2564-25 259339 744344 744253\nDLN              0209-02 3626-01 3441-15 3445-26 366242 367453 346158\nDRT 1623 1718+16 1722+14 1917+09 1921-06 2026-15 213330 213041 203752\nDSM 1815 2220+13 2216+08 2221+03 2329-10 2569-19 238532 238543 239154\nECK 1212 9900+10 2818+07 2624+03 2738-09 2759-19 278233 289543 780354\nEKN      2706+15 2715+09 2728+06 2733-07 2833-15 304632 295142 296251\nELP      3207    2320+11 2328+05 2527-08 2336-21 216733 216541 225250\nELY              0319+03 0228-01 0321-14 0221-27 352442 343147 332550\nEMI 0512 3116+14 2920+09 2824+03 2930-06 2849-16 306332 306043 307252\nEVV 2209 2418+16 2422+11 2427+06 2529-06 2537-16 263931 264441 255352\nEYW 1213 1315+16 1216+12 1115+07 1012-05 1805-17 171432 171942 112252\nFAT 9900 9900+15 0307+10 3513+04 3522-12 3427-25 345335 345243 336551\nGPI      0813+02 3009-01 3328-02 3348-16 3459-25 347542 347653 347163\nFLO 2507 9900+19 2106+13 2505+07 9900-05 3509-15 291630 332339 312051\nFMN              3109+00 3216-02 3320-11 3326-26 283739 254541 245445\nFOT 1008 1005+16 0506+09 0209+04 0412-08 0220-20 332337 342646 324754\nFSD 3308 0207+04 2111+05 2223+01 2347-11 2351-24 239836 722344 722354\nFSM 2617 2425+16 2232+11 2234+07 2234-06 2338-16 234431 224741 235451\nFWA 1214 2513+11 2619+09 2620+04 2628-07 2644-18 265132 266842 276852\nGAG      2522+14 2522+09 2327+04 2238-09 2151-19 218233 218741 228551\nGCK      2710+10 2316+07 2236+02 2257-10 2270-22 711233 711442 229349\nGEG      0307+07 3510+05 3414+00 3229-13 3332-24 344941 345251 345763\nGFK 2719 2721+02 2728-02 2635-06 2651-17 2467-28 238743 249748 249048\nGGW      3345+00 3151-04 3155-07 3171-19 3181-31 316446 316850 305050\nGJT              0223+00 0122-05 0225-13 0126-25 022944 321945 262645\nGLD      3216    2313+04 2226-02 2160-13 2180-23 710334 710940 229148\nGRB 1213 2412+09 2617+06 2518+00 2644-11 2553-22 760632 751643 752455\nGRI      2220+11 2221+07 2124+01 2142-11 2262-23 721033 721542 720551\nGSP 2405 2105+18 2209+13 2405+08 3106-06 9900-16 301230 302140 282551\nGTF      3614    3211-04 3331-03 3350-16 3461-27 359643 359354 337861\nH51 1315 1308+17 1009+13 0816+08 0728-06 0732-14 072530 083039 093451\nH52 1220 1515+15 1511+11 1409+06 1318-05 1612-20 083131 084839 095450\nH61 1512 1410+15 1111+11 1111+06 0914-06 1309-17 151832 131941 095050\nHAT 3108 2610+16 2717+13 2919+06 3124-05 3027-15 292531 303041 314251\nHOU 1514 1417+18 1318+14 1218+09 0815-06 1112-15 131429 161739 171751\nHSV 2412 2405+16 2110+12 1808+07 1107-05 9900-15 301229 241840 252351\nICT 2018 2215+15 2412+09 2420+04 2347-08 2266-17 217033 227542 227551\nILM 2809 2506+19 2807+13 2908+07 2809-05 3115-15 272030 322140 323151\nIMB              1010+08 0808+03 3207-12 3626-23 362940 364050 345560\nIND 1807 2309+14 2518+10 2522+05 2640-06 2550-17 265231 265842 266952\nINK      2016+17 2109+11 2110+06 2327-08 2352-18 196131 196341 226652\nINL 2218 2517+02 2526-01 2531-06 2454-15 2554-28 259042 751246 750750\nJAN 1913 1407+17 1106+12 1309+07 1217-06 0606-14 120929 171839 201251\nJAX 1605 0910+16 1110+14 1309+08 1207-06 1215-16 103029 083139 083051\nJFK 0226 3217+13 3124+09 3029+04 3043-09 2971-18 319132 319443 309353\nJOT 1511 2515+10 2419+09 2314+03 2429-07 2544-17 256133 258343 268453\nLAS      0221+12 0223+05 0125+02 3521-11 3216-25 302440 313845 314647\nLBB      2423+16 2322+11 2326+04 2329-08 2354-19 206532 217542 227251\nLCH 1716 1320+18 1118+13 1018+09 1018-06 0918-15 112729 131639 141651\nLIT 2424 2221+18 2221+12 2121+07 1915-07 2319-15 232830 233441 234551\nLKV              0913+07 0914+03 0615-11 0333-23 013339 363949 355457\nLND              0135-02 0230-04 0235-15 0135-27 342243 332250 302252\nLOU 2512 2720+16 2624+12 2424+06 2725-05 2633-17 273731 274841 265352\nLRD 1624 1515+17 1517+15 1411+10 0908-06 1410-15 161831 181940 182652\nLSE 1314 2008+10 2211+07 2418+02 2541-11 2541-23 741432 731642 741856\nLWS 9900 0608+07 0110+06 3515+00 3236-13 3534-24 354542 365451 356162\nMBW              0140    0240-04 0130-16 0137-27 032144 311547 252646\nMCW 1419 2110+08 2115+07 1918+01 2342-11 2649-22 740832 730743 731155\nMEM 2419 2119+18 2218+12 2216+08 1813-06 2416-15 252430 233241 244051\nMGM 9900 1206+17 1211+13 1409+08 0918-06 0813-15 071729 101440 120750\nMIA 1411 1214+16 1211+12 1210+07 1117-05 1605-17 990032 160542 092951\nMKC 2112 2015+14 2318+10 2116+04 2445-08 2366-17 227031 227442 238053\nMKG 1315 2307+11 2511+07 2519+02 2747-10 2748-19 267933 269143 770254\nMLB 0906 2316+15 2305+14 1105+08 1115-05 1309-17 121831 094838 095250\nMLS      3331+03 3236-03 3241-03 3246-17 3254-29 304245 284950 293953\nMOB 1510 1109+16 1115+13 1212+09 1017-07 0826-15 082529 102939 112150\nMOT      2933+01 2944-05 2946-09 2868-20 2778-29 248644 258047 257049\nMQT 2009 2413+04 2622+04 2729+00 2541-14 2658-24 770436 764342 764454\nMRF              9900+12 2207+07 2527-07 2241-17 194630 184541 214953\nMSP 1910 2311+06 2316+03 2320+00 2639-13 2670-24 740837 743444 743854\nMSY 1514 1214+16 1115+13 1115+09 1019-07 0828-15 082929 113239 112350\nOKC 2111 2224+16 2526+11 2427+06 2148-07 2152-17 225832 215742 227151\nOMA 2011 2224+12 2424+08 2422+02 2529-09 2459-21 229432 229342 239753\nONL      3307+04 2516+06 2221+01 2141-12 2253-24 229436 721543 720551\nONT 0320 0524+15 0416+09 0115+05 3225-11 3134-23 324636 325242 314848\nORF 9900 2516+15 2628+11 2830+06 2929-05 2936-15 293831 304242 305051\nOTH 0910 1207+14 1405+08 9900+04 9900-09 3508-21 331938 331847 313756\nPDX 1124 1310+13 1413+08 1611+02 2712-10 2910-22 331839 332049 324259\nPFN 1407 1109+15 1214+14 1109+08 1310-07 0835-15 103329 083339 103350\nPHX 0713 0809+11 0107+08 3112+04 3122-09 3023-22 282538 283042 273347\nPIE 1508 2211+14 9900+13 1308+08 1115-06 1311-17 121831 095438 095950\nPIH      0325    0323+05 0429+01 0232-14 0140-27 024543 014251 364155\nPIR      3521+05 3416+01 2908-01 2227-14 2231-26 225742 227548 229249\nPLB 3621 3330-01 3342+03 3254+01 3060-13 3072-25 800337 804143 803452\nPRC              0520+06 0416+02 3421-10 3128-23 302939 293544 283946\nPSB      3012+14 3021+09 2824+04 2836-08 2857-18 307532 307743 307552\nPSX 1515 1413+18 1315+14 1121+09 0815-06 1014-14 141130 151739 161751\nPUB              3216+03 2810-04 2622-17 2443-26 227233 227239 236543\nPWM 3430 3438+01 3351+03 3161+03 3064-12 2969-26 309939 812544 813051\nRAP      3631+05 3630+01 0128-02 3515-15 2710-26 191443 213448 234749\nRBL 0811 0705+15 0510+09 0411+03 0223-10 0338-21 354037 354246 335553\nRDM      1212+10 1213+08 1210+03 9900-10 0117-22 352340 353248 344958\nRDU 3208 2506+16 2719+12 2818+06 2823-05 3122-15 292131 313341 303951\nRIC 0613 9900+15 2814+10 2820+06 2921-06 2832-16 303932 304942 305451\nRKS              0342    0331-02 0228-16 3621-26 022843 352049 302050\nRNO      0710    0715+06 0417+01 0123-12 0332-24 024837 366146 355452\nROA 0306 3108+16 2814+10 2723+05 2932-05 2931-15 293932 294541 284851\nROW      3613    2119+09 2333+04 2535-09 2349-20 218632 218641 226550\nSAC 0309 0311+17 0312+11 0212+04 0122-12 3635-21 354836 354945 336152\nSAN 0614 0517+15 0313+10 3616+06 3224-09 3132-22 324435 324841 313749\nSAT 1611 1614+18 1519+15 1421+10 1006-06 1410-15 171531 192240 192752\nSAV 9900 1405+17 1313+14 1206+09 0914-06 1123-14 990030 061240 031651\nSBA 1006 1012+16 0606+09 3613+05 3327-11 3243-23 335035 335242 325250\nSEA 1309 1607+12 1609+08 1808+01 2813-11 2821-22 302440 303049 314660\nSFO 0212 0212+16 0213+11 3614+04 3521-11 3636-21 344436 354444 336152\nSGF 0207 2322+16 2231+11 2244+06 2355-06 2458-16 245031 244041 235553\nSHV 2119 2013+19 1813+13 1817+09 1407-07 2011-14 202130 212740 213351\nSIY      1116+14 1109+09 0907+02 0520-09 0325-22 353638 353647 334856\nSLC      9900    0313+03 0224-02 0330-14 0332-26 012543 362350 342152\nSLN 1914 2316+13 2209+08 2114+03 2336-09 2273-19 228733 218842 228952\nSPI 1708 2111+14 2213+09 2424+05 2433-07 2342-17 255432 257342 268053\nSPS 1822 2325+16 2319+11 2126+06 2141-07 2247-16 225532 215841 216351\nSSM 1318 1912+05 2618+02 2626-01 2641-13 2759-24 780135 773943 774154\nSTL 1820 2124+15 2126+10 2340+05 2346-07 2445-17 254831 255641 257155\nSYR 0313 3320+08 3126+07 2929+02 2837-11 2963-21 800833 801443 801652\nT01 1316 1317+15 1216+14 0921+08 0823-07 0728-15 092730 102639 112651\nT06 1311 1716+17 1513+13 1118+08 1218-07 0736-15 083930 094039 103851\nT07 1214 1609+16 1807+14 1113+08 1412-07 0831-17 084529 095539 104950\nTCC      3414    2421+07 2333+04 2446-10 2355-21 710033 219841 227249\nTLH 1505 1108+16 1111+13 1109+08 1408-07 0833-15 113229 083139 093050\nTRI      2407+16 2308+12 2414+06 2719-05 2723-16 292731 294240 283751\nTUL 2711 2520+15 2327+10 2332+05 2338-06 2343-15 225331 225742 226652\nTUS      9900+13 9900+10 2812+06 2823-09 2727-22 262936 263640 253648\nTVC 1614 2408+07 2819+06 2624+01 2641-11 2657-21 279633 760943 772355\nTYS 2512 2406+16 2314+13 2413+07 2716-05 2609-16 302030 283140 273151\nWJF      0523+14 0422+09 0113+05 3324-11 3234-23 324936 325243 325648\nYKM 0905 1209+08 1305+07 9900+02 3016-11 3222-23 332541 333649 335760\nZUN              3409+03 3311+01 3118-12 2829-24 273937 254142 244645\n2XG 9900 0910+17 1011+14 1008+09 9900-05 1314-15 102530 082239 062751\n4J3 1311 2111+14 1706+14 1211+08 1107-06 1319-18 093729 095538 105550\n"
  },
  "generalForecast": {
    "@context": [
      "https://geojson.org/geojson-ld/geojson-context.jsonld",
      {
        "@version": "1.1",
        "wx": "https://api.weather.gov/ontology#",
        "geo": "http://www.opengis.net/ont/geosparql#",
        "unit": "http://codes.wmo.int/common/unit/",
        "@vocab": "https://api.weather.gov/ontology#"
      }
    ],
    "type": "Feature",
    "geometry": {
      "type": "Polygon",
      "coordinates": [
        [
          [
            -111.9704,
            40.7335
          ],
          [
            -111.974,
            40.7552
          ],
          [
            -112.0027,
            40.7525
          ],
          [
            -111.9991,
            40.7307
          ],
          [
            -111.9704,
            40.7335
          ]
        ]
      ]
    },
    "properties": {
      "units": "us",
      "forecastGenerator": "BaselineForecastGenerator",
      "generatedAt": "2026-10-14T14:24:55+00:00",
      "updateTime": "2026-10-14T12:41:32+00:00",
      "validTimes": "2026-10-14T06:00:00+00:00/P7DT19H",
      "elevation": {
        "unitCode": "wmoUnit:m",
        "value": 1278.9408
      },
      "periods": [
        {
          "number": 1,
          "name": "Today",
          "startTime": "2026-10-14T08:00:00-06:00",
          "endTime": "2026-10-14T18:00:00-06:00",
          "isDaytime": true,
          "temperature": 56,
          "temperatureUnit": "F",
          "temperatureTrend": null,
          "probabilityOfPrecipitation": {
            "unitCode": "wmoUnit:percent",
            "value": 17
          },
          "windSpeed": "5 to 10 mph",
          "windDirection": "NW",
          "icon": "https://api.weather.gov/icons/land/day/rain_showers,20?size=medium",
          "shortForecast": "Slight Chance Rain Showers",
          "detailedForecast": "A slight chance of rain showers. Partly sunny. High near 56, with temperatures falling to around 54 in the afternoon. Northwest wind 5 to 10 mph. Chance of precipitation is 20%."
        },
        {
          "number": 2,
          "name": "Tonight",
          "startTime": "2026-10-14T18:00:00-06:00",
          "endTime": "2026-10-15T06:00:00-06:00",
          "isDaytime": false,
          "temperature": 39,
          "temperatureUnit": "F",
          "temperatureTrend": null,
          "probabilityOfPrecipitation": {
            "unitCode": "wmoUnit:percent",
            "value": 8
          },
          "windSpeed": "2 to 7 mph",
          "windDirection": "W",
          "icon": "https://api.weather.gov/icons/land/night/sct?size=medium",
          "shortForecast": "Partly Cloudy",
          "detailedForecast": "Partly cloudy. Low around 39, with temperatures rising to around 41 overnight. West wind 2 to 7 mph."
        },
        {
          "number": 3,
          "name": "Thursday",
          "startTime": "2026-10-15T06:00:00-06:00",
          "endTime": "2026-10-15T18:00:00-06:00",
          "isDaytime": true,
          "temperature": 63,
          "temperatureUnit": "F",
          "temperatureTrend": null,
          "probabilityOfPrecipitation": {
            "unitCode": "wmoUnit:percent",
            "value": 1
          },
          "windSpeed": "2 to 9 mph",
          "windDirection": "NNE",
          "icon": "https://api.weather.gov/icons/land/day/few?size=medium",
          "shortForecast": "Sunny",
          "detailedForecast": "Sunny. High near 63, with temperatures falling to around 58 in the afternoon. North northeast wind 2 to 9 mph."
        },
        {
          "number": 4,
          "name": "Thursday Night",
          "startTime": "2026-10-15T18:00:00-06:00",
          "endTime": "2026-10-16T06:00:00-06:00",
          "isDaytime": false,
          "temperature": 40,
          "temperatureUnit": "F",
          "temperatureTrend": null,
          "probabilityOfPrecipitation": {
            "unitCode": "wmoUnit:percent",
            "value": 0
          },
          "windSpeed": "7 mph",
          "windDirection": "ENE",
          "icon": "https://api.weather.gov/icons/land/night/few?size=medium",
          "shortForecast": "Mostly Clear",
          "detailedForecast": "Mostly clear, with a low around 40. East northeast wind around 7 mph."
        },
        {
          "number": 5,
          "name": "Friday",
          "startTime": "2026-10-16T06:00:00-06:00",
          "endTime": "2026-10-16T18:00:00-06:00",
          "isDaytime": true,
          "temperature": 67,
          "temperatureUnit": "F",
          "temperatureTrend": null,
          "probabilityOfPrecipitation": {
            "unitCode": "wmoUnit:percent",
            "value": 0
          },
          "windSpeed": "2 to 6 mph",
          "windDirection": "NE",
          "icon": "https://api.weather.gov/icons/land/day/few?size=medium",
          "shortForecast": "Sunny",
          "detailedForecast": "Sunny, with a high near 67. Northeast wind 2 to 6 mph."
        },
        {
          "number": 6,
          "name": "Friday Night",
          "startTime": "2026-10-16T18:00:00-06:00",
          "endTime": "2026-10-17T06:00:00-06:00",
          "isDaytime": false,
          "temperature": 43,
          "temperatureUnit": "F",
          "temperatureTrend": null,
          "probabilityOfPrecipitation": {
            "unitCode": "wmoUnit:percent",
            "value": 0
          },
          "windSpeed": "5 mph",
          "windDirection": "ESE",
          "icon": "https://api.weather.gov/icons/land/night/few?size=medium",
          "shortForecast": "Mostly Clear",
          "detailedForecast": "Mostly clear, with a low around 43."
        },
        {
          "number": 7,
          "name": "Saturday",
          "startTime": "2026-10-17T06:00:00-06:00",
          "endTime": "2026-10-17T18:00:00-06:00",
          "isDaytime": true,
          "temperature": 68,
          "temperatureUnit": "F",
          "temperatureTrend": null,
          "probabilityOfPrecipitation": {
            "unitCode": "wmoUnit:percent",
            "value": 0
          },
          "windSpeed": "5 mph",
          "windDirection": "S",
          "icon": "https://api.weather.gov/icons/land/day/few?size=medium",
          "shortForecast": "Sunny",
          "detailedForecast": "Sunny, with a high near 68."
        },
        {
          "number": 8,
          "name": "Saturday Night",
          "startTime": "2026-10-17T18:00:00-06:00",
          "endTime": "2026-10-18T06:00:00-06:00",
          "isDaytime": false,
          "temperature": 45,
          "temperatureUnit": "F",
          "temperatureTrend": null,
          "probabilityOfPrecipitation": {
            "unitCode": "wmoUnit:percent",
            "value": 0
          },
          "windSpeed": "3 mph",
          "windDirection": "SE",
          "icon": "https://api.weather.gov/icons/land/night/few?size=medium",
          "shortForecast": "Mostly Clear",
          "detailedForecast": "Mostly clear, with a low around 45."
        },
        {
          "number": 9,
          "name": "Sunday",
          "startTime": "2026-10-18T06:00:00-06:00",
          "endTime": "2026-10-18T18:00:00-06:00",
          "isDaytime": true,
          "temperature": 68,
          "temperatureUnit": "F",
          "temperatureTrend": null,
          "probabilityOfPrecipitation": {
            "unitCode": "wmoUnit:percent",
            "value": 0
          },
          "windSpeed": "2 to 6 mph",
          "windDirection": "SSW",
          "icon": "https://api.weather.gov/icons/land/day/few?size=medium",
          "shortForecast": "Sunny",
          "detailedForecast": "Sunny, with a high near 68."
        },
        {
          "number": 10,
          "name": "Sunday Night",
          "startTime": "2026-10-18T18:00:00-06:00",
          "endTime": "2026-10-19T06:00:00-06:00",
          "isDaytime": false,
          "temperature": 46,
          "temperatureUnit": "F",
          "temperatureTrend": null,
          "probabilityOfPrecipitation": {
            "unitCode": "wmoUnit:percent",
            "value": 0
          },
          "windSpeed": "1 to 7 mph",
          "windDirection": "ESE",
          "icon": "https://api.weather.gov/icons/land/night/few?size=medium",
          "shortForecast": "Mostly Clear",
          "detailedForecast": "Mostly clear, with a low around 46."
        },
        {
          "number": 11,
          "name": "Monday",
          "startTime": "2026-10-19T06:00:00-06:00",
          "endTime": "2026-10-19T18:00:00-06:00",
          "isDaytime": true,
          "temperature": 70,
          "temperatureUnit": "F",
          "temperatureTrend": null,
          "probabilityOfPrecipitation": {
            "unitCode": "wmoUnit:percent",
            "value": 1
          },
          "windSpeed": "10 mph",
          "windDirection": "SSE",
          "icon": "https://api.weather.gov/icons/land/day/few?size=medium",
          "shortForecast": "Sunny",
          "detailedForecast": "Sunny, with a high near 70."
        },
        {
          "number": 12,
          "name": "Monday Night",
          "startTime": "2026-10-19T18:00:00-06:00",
          "endTime": "2026-10-20T06:00:00-06:00",
          "isDaytime": false,
          "temperature": 48,
          "temperatureUnit": "F",
          "temperatureTrend": null,
          "probabilityOfPrecipitation": {
            "unitCode": "wmoUnit:percent",
            "value": 29
          },
          "windSpeed": "6 to 12 mph",
          "windDirection": "SSE",
          "icon": "https://api.weather.gov/icons/land/night/sct/tsra_hi,30?size=medium",
          "shortForecast": "Partly Cloudy then Chance Showers And Thunderstorms",
          "detailedForecast": "A chance of showers and thunderstorms after midnight. Partly cloudy, with a low around 48."
        },
        {
          "number": 13,
          "name": "Tuesday",
          "startTime": "2026-10-20T06:00:00-06:00",
          "endTime": "2026-10-20T18:00:00-06:00",
          "isDaytime": true,
          "temperature": 65,
          "temperatureUnit": "F",
          "temperatureTrend": null,
          "probabilityOfPrecipitation": {
            "unitCode": "wmoUnit:percent",
            "value": 47
          },
          "windSpeed": "8 mph",
          "windDirection": "S",
          "icon": "https://api.weather.gov/icons/land/day/rain_showers,40/tsra_sct,50?size=medium",
          "shortForecast": "Chance Rain Showers",
          "detailedForecast": "A chance of rain showers before noon, then a chance of showers and thunderstorms. Partly sunny, with a high near 65."
        },
        {
          "number": 14,
          "name": "Tuesday Night",
          "startTime": "2026-10-20T18:00:00-06:00",
          "endTime": "2026-10-21T06:00:00-06:00",
          "isDaytime": false,
          "temperature": 44,
          "temperatureUnit": "F",
          "temperatureTrend": null,
          "probabilityOfPrecipitation": {
            "unitCode": "wmoUnit:percent",
            "value": 65
          },
          "windSpeed": "6 mph",
          "windDirection": "SSE",
          "icon": "https://api.weather.gov/icons/land/night/tsra_sct,50/tsra_sct,70?size=medium",
          "shortForecast": "Showers And Thunderstorms Likely",
          "detailedForecast": "Showers and thunderstorms likely. Mostly cloudy, with a low around 44."
        }
      ]
    }
  },
  "openMeteo": {
    "latitude": 40.764416,
    "longitude": -111.981255,
    "generationtime_ms": 3.216266632080078,
    "utc_offset_seconds": -21600,
    "timezone": "America/Denver",
    "timezone_abbreviation": "GMT-6",
    "elevation": 1288,
    "hourly_units": {
      "time": "iso8601",
      "geopotential_height_875hPa": "m",
      "winddirection_875hPa": "°",
      "windspeed_875hPa": "mp/h",
      "geopotential_height_850hPa": "m",
      "winddirection_850hPa": "°",
      "windspeed_850hPa": "mp/h",
      "geopotential_height_825hPa": "m",
      "winddirection_825hPa": "°",
      "windspeed_825hPa": "mp/h",
      "geopotential_height_800hPa": "m",
      "winddirection_800hPa": "°",
      "windspeed_800hPa": "mp/h",
      "geopotential_height_775hPa": "m",
      "winddirection_775hPa": "°",
      "windspeed_775hPa": "mp/h",
      "geopotential_height_750hPa": "m",
      "winddirection_750hPa": "°",
      "windspeed_750hPa": "mp/h",
      "geopotential_height_700hPa": "m",
      "winddirection_700hPa": "°",
      "windspeed_700hPa": "mp/h",
      "geopotential_height_625hPa": "m",
      "winddirection_625hPa": "°",
      "windspeed_625hPa": "mp/h",
      "wind_direction_10m": "°",
      "wind_speed_10m": "mp/h"
    },
    "hourly": {
      "time": [
        "2026-10-14T08:00",
        "2026-10-14T09:00",
        "2026-10-14T10:00",
        "2026-10-14T11:00",
        "2026-10-14T12:00",
        "2026-10-14T13:00",
        "2026-10-14T14:00",
        "2026-10-14T15:00",
        "2026-10-14T16:00",
        "2026-10-14T17:00",
        "2026-10-14T18:00",
        "2026-10-14T19:00"
      ],
      "geopotential_height_875hPa": [
        1271,
        1273,
        1276,
        1278,
        1265,
        1260,
        1260,
        1260,
        1264,
        1263,
        1271,
        1281
      ],
      "winddirection_875hPa": [
        322,
        340,
        334,
        321,
        315,
        319,
        319,
        318,
        318,
        317,
        317,
        317
      ],
      "windspeed_875hPa": [
        5.6,
        5.5,
        5.7,
        6,
        8.4,
        9.6,
        11.8,
        12.3,
        12.9,
        12.5,
        11.1,
        9.2
      ],
      "geopotential_height_850hPa": [
        1511,
        1513,
        1515,
        1518,
        1506,
        1501,
        1501,
        1503,
        1507,
        1506,
        1514,
        1523
      ],
      "winddirection_850hPa": [
        332,
        342,
        337,
        319,
        314,
        320,
        320,
        319,
        321,
        321,
        323,
        327
      ],
      "windspeed_850hPa": [
        11.1,
        10.6,
        9.1,
        8,
        11.7,
        13.2,
        16.3,
        17.3,
        18.7,
        19.7,
        20.9,
        22.3
      ],
      "geopotential_height_825hPa": [
        1756,
        1758,
        1760,
        1763,
        1752,
        1748,
        1748,
        1750,
        1755,
        1755,
        1762,
        1771
      ],
      "winddirection_825hPa": [
        335,
        340,
        340,
        331,
        317,
        321,
        321,
        322,
        324,
        325,
        329,
        336
      ],
      "windspeed_825hPa": [
        12,
        11.2,
        10.9,
        9.7,
        12.8,
        14.7,
        17.8,
        19,
        20.5,
        21.7,
        22.6,
        24.6
      ],
      "geopotential_height_800hPa": [
        2007,
        2009,
        2012,
        2015,
        2003,
        2000,
        2001,
        2003,
        2009,
        2009,
        2017,
        2024
      ],
      "winddirection_800hPa": [
        338,
        343,
        342,
        345,
        332,
        325,
        326,
        327,
        330,
        332,
        337,
        341
      ],
      "windspeed_800hPa": [
        12.4,
        11.3,
        12,
        11.6,
        13.5,
        15.8,
        18.5,
        19.7,
        21.6,
        22.3,
        22.4,
        24.3
      ],
      "geopotential_height_775hPa": [
        2265,
        2267,
        2270,
        2273,
        2262,
        2258,
        2260,
        2263,
        2268,
        2269,
        2277,
        2284
      ],
      "winddirection_775hPa": [
        352,
        354,
        354,
        356,
        350,
        337,
        335,
        333,
        336,
        338,
        343,
        342
      ],
      "windspeed_775hPa": [
        12.4,
        12.1,
        13.4,
        13.8,
        15.4,
        16.8,
        19.3,
        20.2,
        22.3,
        22.4,
        22.4,
        22.8
      ],
      "geopotential_height_750hPa": [
        2529,
        2531,
        2534,
        2538,
        2527,
        2523,
        2525,
        2528,
        2535,
        2536,
        2543,
        2550
      ],
      "winddirection_750hPa": [
        10,
        8,
        4,
        4,
        2,
        355,
        351,
        341,
        342,
        343,
        347,
        341
      ],
      "windspeed_750hPa": [
        14.6,
        14.4,
        15.9,
        16.9,
        18.2,
        19.3,
        20.6,
        21,
        23,
        22.6,
        22.1,
        21.7
      ],
      "geopotential_height_700hPa": [
        3080,
        3082,
        3086,
        3090,
        3080,
        3077,
        3080,
        3083,
        3089,
        3091,
        3099,
        3106
      ],
      "winddirection_700hPa": [
        21,
        13,
        9,
        15,
        18,
        14,
        14,
        4,
        357,
        355,
        349,
        345
      ],
      "windspeed_700hPa": [
        18.7,
        19.2,
        20.2,
        21.1,
        23.5,
        25.9,
        25.6,
        24.9,
        23.6,
        21.7,
        23.2,
        24.1
      ],
      "geopotential_height_625hPa": [
        3970,
        3971,
        3976,
        3982,
        3973,
        3970,
        3975,
        3980,
        3986,
        3988,
        3996,
        4004
      ],
      "winddirection_625hPa": [
        45,
        33,
        30,
        35,
        28,
        17,
        22,
        20,
        11,
        4,
        0,
        1
      ],
      "windspeed_625hPa": [
        17.5,
        19,
        24.1,
        25,
        24.9,
        27.8,
        28.5,
        27.4,
        25,
        24.7,
        26.2,
        27.7
      ],
      "wind_direction_10m": [
        319,
        334,
        334,
        311,
        310,
        323,
        320,
        324,
        327,
        317,
        313,
        311
      ],
      "wind_speed_10m": [
        7.1,
        7,
        6.8,
        5.9,
        8.6,
        8.6,
        12.5,
        13.1,
        13.2,
        13.5,
        11.1,
        10.2
      ],
      "winddirection_9000": [
        20,
        20,
        20,
        20,
        20,
        20,
        20,
        350,
        350,
        350,
        350,
        350
      ],
      "windspeed_9000": [
        18,
        18,
        18,
        18,
        18,
        18,
        18,
        23,
        23,
        23,
        23,
        23
      ],
      "winddirection_12000": [
        40,
        40,
        40,
        40,
        40,
        40,
        40,
        360,
        360,
        360,
        360,
        360
      ],
      "windspeed_12000": [
        24,
        24,
        24,
        24,
        24,
        24,
        24,
        26,
        26,
        26,
        26,
        26
      ],
      "winddirection_18000": [
        110,
        110,
        110,
        110,
        110,
        110,
        110,
        360,
        360,
        360,
        360,
        360
      ],
      "windspeed_18000": [
        13,
        13,
        13,
        13,
        13,
        13,
        13,
        22,
        22,
        22,
        22,
        22
      ]
    },
    "daily_units": {
      "time": "iso8601",
      "sunset": "iso8601",
      "temperature_2m_max": "°F"
    },
    "daily": {
      "time": [
        "2026-10-14"
      ],
      "sunset": [
        "2026-10-14T18:48"
      ],
      "temperature_2m_max": [
        56.9
      ]
    }
  }
}