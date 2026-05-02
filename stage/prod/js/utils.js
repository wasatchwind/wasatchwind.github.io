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
      <div class="align-items-center col-7 display-5 d-flex justify-content-around" id="marquee-settings"></div>
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
    const baseBtnClass = "marquee-speed border px-4 rounded-5 py-2";
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
    row.className = "border-bottom d-flex justify-content-around py-4";
    row.innerHTML = `
      <div class="col-5 text-info text-start">${station.name}</div>
      <div class="form-check form-switch">
        <input class="form-check-input custom-switch" type="checkbox" id="${station.id}-toggle">
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
})();

function stationSetToggle(id, state) {
  localStorage.setItem(id, state);

  // visibility logic
  const stationEl = document.getElementById(`${id}-main`);
  if (stationEl) stationEl.style.display = state === "off" ? "none" : "";
}

// const synopticLink = document.createElement("div");
// synopticLink.innerHTML = `
//   <div class="d-flex display-6 justify-content-center mt-4">
//     <div class="text-secondary fw-semibold me-3">Weather station data from</div>
//     <a class="text-warning" href="https://synopticdata.com/">Synoptic</a>
//   </div>`;
// container.appendChild(synopticLink);

(function buildMiscPageItems() { // IIFE to build standard DOM components for the Misc. page
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
      src: unitsContent,
      title: "Units & Models"
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
  slider.moveToIdx(2, true, { duration: 0 });
  // slider.moveToIdx(initialNav, true, { duration: 0 });
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
    "@id": "https://api.weather.gov/products/2f4109ec-8960-41d6-8011-294b041c1698",
    "id": "2f4109ec-8960-41d6-8011-294b041c1698",
    "wmoCollectiveId": "FXUS65",
    "issuingOffice": "KSLC",
    "issuanceTime": "2026-04-30T19:17:00+00:00",
    "productCode": "AFD",
    "productName": "Area Forecast Discussion",
    "productText": "\n000\nFXUS65 KSLC 301917\nAFDSLC\n\nArea Forecast Discussion\nNational Weather Service Salt Lake City UT\n117 PM MDT Thu Apr 30 2026\n\n.KEY MESSAGES...\n\n- High-based showers and thunderstorms will impact parts of the\n  region, primarily east of I-15, through this evening, with \n  gusty and erratic winds up to 40 mph possible near any showers \n  or thunderstorms.\n\n- Enhanced easterly canyon winds up to 40 mph will develop along \n  the northern Wasatch Front Thursday night into Friday morning.\n\n- After a warm Saturday, with temperatures around 10 degrees above\n  normal, showers and thunderstorms will develop across southern\n  Utah Sunday afternoon and evening.\n\n- These showers and thunderstorms will shift north and impact\n  northern Utah Monday. \n\n- An active, unsettled pattern will continue through at least\n  midweek. \n\n&&\n\n.DISCUSSION...A decidedly spring-like day continues across the\nBeehive State. A broad long-wave trough remains in place across\nmuch of the country. A series of shortwave troughs rotating around\nthe west flank of the trough will continue to impact the region.\nThursday's shortwave trough will eventually cut-off from the main\ntrough Thursday and slowly shift into southern Utah Friday.\n\nMeanwhile, yet another shortwave trough will shift south along the\nPacific Coast Saturday into Sunday. As a robust 140kt+ jet max,\nwith the potential for phasing of both the polar and sub-tropical\njet will shift into the Desert Southwest. This combination of an\nejecting shortwave trough around the upper level low and\nthe coupled jet dynamics will bring enhanced lift to southern \nUtah by Sunday afternoon. NAEFS guidance versus climatology\nindicates this will be associated with a 90th+ percentile IVT/PW\nsurge across southern Utah. While sounding profiles indicate the\nsubcloud environment will remain relatively dry and this moisture\nwill be confined largely to the mid-levels, expect a broad area of\nshowers and thunderstorms to develop across southern Utah after \n18Z Sunday and to continue to shift north and east with \ntime...reaching northern Utah by Monday morning. Additional \nconvection will likely develop Monday afternoon and evening across\nnorthern Utah in association with this feature.\n\nCurrent expectation is that while forcing will be extensive,\ninstability will be limited. This will likely limit any widespread\nsevere/organized convection potential, but gusty and erratic winds\nwith gusts in excess of 50 mph and small hail will be the main\nthreat.\n\nThe main upper level low will eject across the West Tuesday,\nbringing another round of potential convection to the region\nduring the afternoon and evening. Depending on how quickly this\nupper level low ejects, remnant convection may continue into\nWednesday (about 40% of ensemble members show this slower\nsolution). \n\nAs far as easterly winds impacting the northern Wasatch Front this\nevening into Friday morning, ensemble members continue to show the\nhighest probability scenario is wind gusts up to 40 mph, with a\n10% chance wind gusts will exceed 45 mph for Farmington and Weber\nCanyons. Elevated easterly winds may reach as far as south as\nMillcreek Canyon during this event. Given the threat of wind\nadvisory criteria is 10% and localized, no wind advisories are \nneeded.\n\nFreeze Warnings continue for southern Iron County, the Sanpete and\nSevier Valleys, eastern Millard and eastern Juab Counties, the\nCache Valley and the western Uinta Basin tonight into Friday\nmorning and one last round Friday night into Saturday morning\n(with the exception of the Cache and western Uinta Basin). \n\n&&\n\n.AVIATION...KSLC..VFR conditions will persist for the KSLC \nterminal through the period with typical diurnal wind changes. \nCurrent northwesterly winds are expected to shift to southeast \naround 04z. There is a 10-20% chance of brief showers near the \nterminal later this afternoon, which may produce gusty and erratic\nwinds. Any outflow winds are expected to remain below 25kts.\n\n.REST OF UTAH AND SOUTHWEST WYOMING...VFR  conditions will \npersist for the entire airspace through the period. Diurnal \ncumulus will develop over the mountains during the afternoon, with\nbrief showers possible and a small threat of isolated MVFR \nconditions to the mountains east of I-15. There is less than a 20%\nchance of such MVFR conditions impacting KLGU and KEVW. Winds \nwill remain light and diurnally driven, except near showers which \ncould cause gusty and erratic outflow winds up to 25kt. \n\n&&\n\n.SLC WATCHES/WARNINGS/ADVISORIES...\nUT...Freeze Warning from 8 PM this evening to 9 AM MDT Friday for \n     UTZ107-114-116-118-119-122.\n\n     Freeze Warning from 8 PM Friday to 9 AM MDT Saturday for UTZ116-\n     118-119-122.\n\nWY...None.\n&&\n\n$$\n\nKruse/Verzella\n\nFor more information from NOAA's National Weather Service visit...\nhttp://weather.gov/saltlakecity\n"
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
      "generatedAt": "2026-05-01T00:30:18+00:00",
      "updateTime": "2026-04-30T18:31:10+00:00",
      "validTimes": "2026-04-30T12:00:00+00:00/P7DT13H",
      "elevation": {
        "unitCode": "wmoUnit:m",
        "value": 1278.9408
      },
      "periods": [
        {
          "number": 1,
          "name": "Tonight",
          "startTime": "2026-04-30T18:00:00-06:00",
          "endTime": "2026-05-01T06:00:00-06:00",
          "isDaytime": false,
          "temperature": 40,
          "temperatureUnit": "F",
          "temperatureTrend": null,
          "probabilityOfPrecipitation": {
            "unitCode": "wmoUnit:percent",
            "value": 6
          },
          "windSpeed": "5 to 10 mph",
          "windDirection": "NE",
          "icon": "https://api.weather.gov/icons/land/night/few?size=medium",
          "shortForecast": "Mostly Clear",
          "detailedForecast": "Mostly clear. Low around 40, with temperatures rising to around 42 overnight. Northeast wind 5 to 10 mph."
        },
        {
          "number": 2,
          "name": "Friday",
          "startTime": "2026-05-01T06:00:00-06:00",
          "endTime": "2026-05-01T18:00:00-06:00",
          "isDaytime": true,
          "temperature": 67,
          "temperatureUnit": "F",
          "temperatureTrend": null,
          "probabilityOfPrecipitation": {
            "unitCode": "wmoUnit:percent",
            "value": 2
          },
          "windSpeed": "3 to 10 mph",
          "windDirection": "NW",
          "icon": "https://api.weather.gov/icons/land/day/few?size=medium",
          "shortForecast": "Sunny",
          "detailedForecast": "Sunny. High near 67, with temperatures falling to around 65 in the afternoon. Northwest wind 3 to 10 mph."
        },
        {
          "number": 3,
          "name": "Friday Night",
          "startTime": "2026-05-01T18:00:00-06:00",
          "endTime": "2026-05-02T06:00:00-06:00",
          "isDaytime": false,
          "temperature": 42,
          "temperatureUnit": "F",
          "temperatureTrend": null,
          "probabilityOfPrecipitation": {
            "unitCode": "wmoUnit:percent",
            "value": 0
          },
          "windSpeed": "3 to 9 mph",
          "windDirection": "NE",
          "icon": "https://api.weather.gov/icons/land/night/few?size=medium",
          "shortForecast": "Mostly Clear",
          "detailedForecast": "Mostly clear, with a low around 42. Northeast wind 3 to 9 mph."
        },
        {
          "number": 4,
          "name": "Saturday",
          "startTime": "2026-05-02T06:00:00-06:00",
          "endTime": "2026-05-02T18:00:00-06:00",
          "isDaytime": true,
          "temperature": 74,
          "temperatureUnit": "F",
          "temperatureTrend": null,
          "probabilityOfPrecipitation": {
            "unitCode": "wmoUnit:percent",
            "value": 1
          },
          "windSpeed": "7 mph",
          "windDirection": "SSE",
          "icon": "https://api.weather.gov/icons/land/day/few?size=medium",
          "shortForecast": "Sunny",
          "detailedForecast": "Sunny, with a high near 74. South southeast wind around 7 mph."
        },
        {
          "number": 5,
          "name": "Saturday Night",
          "startTime": "2026-05-02T18:00:00-06:00",
          "endTime": "2026-05-03T06:00:00-06:00",
          "isDaytime": false,
          "temperature": 48,
          "temperatureUnit": "F",
          "temperatureTrend": null,
          "probabilityOfPrecipitation": {
            "unitCode": "wmoUnit:percent",
            "value": 0
          },
          "windSpeed": "6 mph",
          "windDirection": "E",
          "icon": "https://api.weather.gov/icons/land/night/sct?size=medium",
          "shortForecast": "Partly Cloudy",
          "detailedForecast": "Partly cloudy, with a low around 48. East wind around 6 mph."
        },
        {
          "number": 6,
          "name": "Sunday",
          "startTime": "2026-05-03T06:00:00-06:00",
          "endTime": "2026-05-03T18:00:00-06:00",
          "isDaytime": true,
          "temperature": 77,
          "temperatureUnit": "F",
          "temperatureTrend": null,
          "probabilityOfPrecipitation": {
            "unitCode": "wmoUnit:percent",
            "value": 4
          },
          "windSpeed": "7 mph",
          "windDirection": "S",
          "icon": "https://api.weather.gov/icons/land/day/bkn?size=medium",
          "shortForecast": "Partly Sunny",
          "detailedForecast": "Partly sunny, with a high near 77."
        },
        {
          "number": 7,
          "name": "Sunday Night",
          "startTime": "2026-05-03T18:00:00-06:00",
          "endTime": "2026-05-04T06:00:00-06:00",
          "isDaytime": false,
          "temperature": 51,
          "temperatureUnit": "F",
          "temperatureTrend": null,
          "probabilityOfPrecipitation": {
            "unitCode": "wmoUnit:percent",
            "value": 28
          },
          "windSpeed": "6 mph",
          "windDirection": "SE",
          "icon": "https://api.weather.gov/icons/land/night/tsra_sct/tsra_sct,30?size=medium",
          "shortForecast": "Chance Showers And Thunderstorms",
          "detailedForecast": "A chance of showers and thunderstorms. Mostly cloudy, with a low around 51."
        },
        {
          "number": 8,
          "name": "Monday",
          "startTime": "2026-05-04T06:00:00-06:00",
          "endTime": "2026-05-04T18:00:00-06:00",
          "isDaytime": true,
          "temperature": 71,
          "temperatureUnit": "F",
          "temperatureTrend": null,
          "probabilityOfPrecipitation": {
            "unitCode": "wmoUnit:percent",
            "value": 56
          },
          "windSpeed": "8 mph",
          "windDirection": "S",
          "icon": "https://api.weather.gov/icons/land/day/rain_showers,40/tsra_sct,60?size=medium",
          "shortForecast": "Showers And Thunderstorms Likely",
          "detailedForecast": "A chance of rain showers before noon, then showers and thunderstorms likely. Mostly cloudy, with a high near 71."
        },
        {
          "number": 9,
          "name": "Monday Night",
          "startTime": "2026-05-04T18:00:00-06:00",
          "endTime": "2026-05-05T06:00:00-06:00",
          "isDaytime": false,
          "temperature": 48,
          "temperatureUnit": "F",
          "temperatureTrend": null,
          "probabilityOfPrecipitation": {
            "unitCode": "wmoUnit:percent",
            "value": 37
          },
          "windSpeed": "7 mph",
          "windDirection": "SE",
          "icon": "https://api.weather.gov/icons/land/night/tsra_hi,40/tsra_hi,30?size=medium",
          "shortForecast": "Chance Showers And Thunderstorms",
          "detailedForecast": "A chance of showers and thunderstorms. Mostly cloudy, with a low around 48."
        },
        {
          "number": 10,
          "name": "Tuesday",
          "startTime": "2026-05-05T06:00:00-06:00",
          "endTime": "2026-05-05T18:00:00-06:00",
          "isDaytime": true,
          "temperature": 70,
          "temperatureUnit": "F",
          "temperatureTrend": null,
          "probabilityOfPrecipitation": {
            "unitCode": "wmoUnit:percent",
            "value": 39
          },
          "windSpeed": "7 mph",
          "windDirection": "SW",
          "icon": "https://api.weather.gov/icons/land/day/rain_showers,20/tsra_hi,40?size=medium",
          "shortForecast": "Chance Showers And Thunderstorms",
          "detailedForecast": "A slight chance of rain showers before noon, then a chance of showers and thunderstorms. Partly sunny, with a high near 70."
        },
        {
          "number": 11,
          "name": "Tuesday Night",
          "startTime": "2026-05-05T18:00:00-06:00",
          "endTime": "2026-05-06T06:00:00-06:00",
          "isDaytime": false,
          "temperature": 48,
          "temperatureUnit": "F",
          "temperatureTrend": null,
          "probabilityOfPrecipitation": {
            "unitCode": "wmoUnit:percent",
            "value": 22
          },
          "windSpeed": "3 to 7 mph",
          "windDirection": "NNE",
          "icon": "https://api.weather.gov/icons/land/night/tsra_hi,20/sct?size=medium",
          "shortForecast": "Slight Chance Showers And Thunderstorms then Partly Cloudy",
          "detailedForecast": "A slight chance of showers and thunderstorms before midnight. Partly cloudy, with a low around 48."
        },
        {
          "number": 12,
          "name": "Wednesday",
          "startTime": "2026-05-06T06:00:00-06:00",
          "endTime": "2026-05-06T18:00:00-06:00",
          "isDaytime": true,
          "temperature": 73,
          "temperatureUnit": "F",
          "temperatureTrend": null,
          "probabilityOfPrecipitation": {
            "unitCode": "wmoUnit:percent",
            "value": 11
          },
          "windSpeed": "3 to 8 mph",
          "windDirection": "SE",
          "icon": "https://api.weather.gov/icons/land/day/few/tsra_hi?size=medium",
          "shortForecast": "Sunny then Slight Chance Showers And Thunderstorms",
          "detailedForecast": "A slight chance of showers and thunderstorms after noon. Sunny, with a high near 73."
        },
        {
          "number": 13,
          "name": "Wednesday Night",
          "startTime": "2026-05-06T18:00:00-06:00",
          "endTime": "2026-05-07T06:00:00-06:00",
          "isDaytime": false,
          "temperature": 51,
          "temperatureUnit": "F",
          "temperatureTrend": null,
          "probabilityOfPrecipitation": {
            "unitCode": "wmoUnit:percent",
            "value": 6
          },
          "windSpeed": "3 to 8 mph",
          "windDirection": "NE",
          "icon": "https://api.weather.gov/icons/land/night/few?size=medium",
          "shortForecast": "Mostly Clear",
          "detailedForecast": "Mostly clear, with a low around 51."
        },
        {
          "number": 14,
          "name": "Thursday",
          "startTime": "2026-05-07T06:00:00-06:00",
          "endTime": "2026-05-07T18:00:00-06:00",
          "isDaytime": true,
          "temperature": 79,
          "temperatureUnit": "F",
          "temperatureTrend": null,
          "probabilityOfPrecipitation": {
            "unitCode": "wmoUnit:percent",
            "value": 5
          },
          "windSpeed": "3 to 8 mph",
          "windDirection": "SSW",
          "icon": "https://api.weather.gov/icons/land/day/few?size=medium",
          "shortForecast": "Sunny",
          "detailedForecast": "Sunny, with a high near 79."
        }
      ]
    }
  },
  "soaringForecast": {
    "@context": {
      "@version": "1.1",
      "@vocab": "https://api.weather.gov/ontology#"
    },
    "@id": "https://api.weather.gov/products/680d6ef7-d49d-4eb9-8634-6b54c263d2dc",
    "id": "680d6ef7-d49d-4eb9-8634-6b54c263d2dc",
    "wmoCollectiveId": "UXUS97",
    "issuingOffice": "KSLC",
    "issuanceTime": "2026-04-29T12:29:00+00:00",
    "productCode": "SRG",
    "productName": "Soaring Guidance",
    "productText": "\n000\nUXUS97 KSLC 291229\nSRGSLC\n\nSoaring Forecast\nNational Weather Service Salt Lake City, Utah\n629 AM MDT Wednesday, April 29, 2026\n\nThis forecast is for Wednesday, April 29, 2026:\n\nIf the trigger temperature of 52.9 F/11.6 C is reached...then\n   Thermal Soaring Index....................... Excellent\n   Maximum rate of lift........................ 1136 ft/min (5.8 m/s)\n   Maximum height of thermals.................. 17454 ft MSL (12571 ft AGL)\n\nForecast maximum temperature................... 63.0 F/17.7 C\nTime of trigger temperature.................... 1000 MDT\nTime of overdevelopment........................ None\nMiddle/high clouds during soaring window....... None\nSurface winds during soaring window............ 20 mph or less\nHeight of the -3 thermal index................. 14509 ft MSL (9626 ft AGL)\nThermal soaring outlook for Thursday 04/30..... Excellent\n\nWave Soaring Index............................. Not available\n\nRemarks... \n\nSunrise/Sunset.................... 06:28:21 / 20:21:55 MDT\nTotal possible sunshine........... 13 hr 53 min 34 sec (833 min 34 sec)\nAltitude of sun at 13:25:08 MDT... 63.31 degrees\n\nUpper air data from numerical model forecast valid on 04/29/2026 at 0600 MDT\n\nFreezing level.................. 8774 ft MSL (3891 ft AGL)\nConvective condensation level... 13668 ft MSL (8785 ft AGL)\nLifted condensation level....... 15246 ft MSL (10363 ft AGL)\nLifted index.................... +0.9\nK index......................... +12.6\n\nHeight  Temperature  Wind  Wind Spd  Lapse Rate  ConvectionT  Thermal  Lift Rate\nft MSL  deg C deg F   Dir   kt  m/s  C/km F/kft  deg C deg F   Index    fpm  m/s\n--------------------------------------------------------------------------------\n 26000  -37.2 -35.0   350   15    8   5.2   2.9   28.1  82.6     8.5      M    M\n 24000  -34.1 -29.4   330   11    6   5.1   2.8   24.8  76.6     6.0      M    M\n 22000  -30.0 -22.0   300   13    7   7.2   3.9   22.6  72.6     4.4      M    M\n 20000  -25.2 -13.4   285   17    9   6.8   3.7   20.4  68.6     2.6      M    M\n 18000  -21.5  -6.7   285   18    9   5.2   2.9   18.0  64.5     0.7      M    M\n 16000  -18.1  -0.6   295   17    9   7.3   4.0   15.3  59.5    -1.9   1012  5.1\n 14000  -13.7   7.3   310   15    8   8.2   4.5   13.8  56.8    -3.3    820  4.2\n 12000   -8.7  16.3   325   12    6   8.6   4.7   12.9  55.3    -4.3    612  3.1\n 10000   -3.5  25.7   335    7    4   8.9   4.9   12.2  54.0    -5.1    398  2.0\n  9000   -0.9  30.4   345    5    3   9.4   5.1   12.0  53.6    -5.4    288  1.5\n  8000    1.7  35.1   360    4    2   9.1   5.0   11.6  53.0    -5.8    181  0.9\n  7000    4.3  39.7   020    3    1   7.1   3.9   11.3  52.4    -6.2     74  0.4\n  6000    6.4  43.5   070    2    1   6.3   3.4   10.6  51.0    -7.0      M    M\n  5000    3.4  38.1   110    5    2 -99.0 -54.3    3.9  39.1   -13.8     35  0.2\n\n * * * * * * Numerical weather prediction model forecast data valid * * * * * * \n\n           04/29/2026 at 0900 MDT          |       04/29/2026 at 1200 MDT        \n                                           |\nCAPE...   +10.2    LI...       +3.1        | CAPE...   +35.5    LI...       +2.6\nCINH...   -13.5    K Index...  +9.6        | CINH...    -3.1    K Index... +11.5\n                                           |\nHeight Temperature  Wnd WndSpd  Lapse Rate | Temperature  Wnd WndSpd  Lapse Rate\nft MSL deg C deg F  Dir kt m/s  C/km F/kft | deg C deg F  Dir kt m/s  C/km F/kft\n--------------------------------------------------------------------------------\n 26000 -35.2 -31.4  300  22 11   6.7   3.7 | -35.7 -32.3  270  25 13   7.3   4.0\n 24000 -31.2 -24.2  310  19 10   6.9   3.8 | -31.3 -24.3  275  20 10   7.5   4.1\n 22000 -27.8 -18.0  305  16  8   5.5   3.0 | -27.6 -17.7  275  18  9   6.1   3.3\n 20000 -24.1 -11.4  290  17  9   5.4   3.0 | -23.7 -10.7  280  18  9   5.4   2.9\n 18000 -20.9  -5.6  290  19 10   5.2   2.8 | -20.6  -5.1  285  19 10   4.8   2.6\n 16000 -17.6   0.3  305  18  9   6.0   3.3 | -17.7   0.1  305  15  8   6.2   3.4\n 14000 -13.8   7.2  320  16  8   7.7   4.2 | -13.7   7.3  315  12  6   7.8   4.3\n 12000  -8.9  16.0  325  13  7   8.8   4.8 |  -8.8  16.2  320   9  5   8.9   4.9\n 10000  -3.6  25.5  330   6  3   8.9   4.9 |  -3.3  26.1  310   6  3   9.2   5.1\n  9000  -0.9  30.4  345   4  2   9.3   5.1 |  -0.5  31.1  305   5  3   9.8   5.3\n  8000   1.7  35.1  020   3  1   9.1   5.0 |   2.2  36.0  305   4  2   9.9   5.4\n  7000   4.3  39.7  060   2  1   7.6   4.2 |   5.1  41.2  300   4  2   9.4   5.1\n  6000   6.5  43.7  105   2  1   7.2   3.9 |   8.0  46.4  305   4  2   9.4   5.2\n  5000   9.6  49.3  140   2  1  27.9  15.3 |  13.5  56.3  305   4  2  82.4  45.2\n\n           04/29/2026 at 1500 MDT          |       04/29/2026 at 1800 MDT        \n                                           |\nCAPE...   +29.3    LI...       +1.8        | CAPE...   +11.1    LI...       +1.1\nCINH...    -6.9    K Index... +11.3        | CINH...   -13.9    K Index... +13.3\n                                           |\nHeight Temperature  Wnd WndSpd  Lapse Rate | Temperature  Wnd WndSpd  Lapse Rate\nft MSL deg C deg F  Dir kt m/s  C/km F/kft | deg C deg F  Dir kt m/s  C/km F/kft\n--------------------------------------------------------------------------------\n 26000 -36.1 -33.0  255  27 14   6.8   3.7 | -36.7 -34.1  285  24 12   7.2   4.0\n 24000 -32.1 -25.8  255  24 12   6.7   3.7 | -32.4 -26.3  280  22 11   7.4   4.0\n 22000 -27.3 -17.1  265  21 11   7.0   3.8 | -28.1 -18.6  285  19 10   6.2   3.4\n 20000 -23.9 -11.0  275  19 10   4.9   2.7 | -24.6 -12.3  290  16  8   5.6   3.1\n 18000 -21.0  -5.8  280  15  8   5.0   2.7 | -21.1  -6.0  295  15  8   6.5   3.6\n 16000 -17.3   0.9  290  12  6   7.7   4.2 | -16.8   1.8  295  13  7   8.3   4.6\n 14000 -12.7   9.1  285  10  5   8.3   4.5 | -11.8  10.8  300  12  6   8.5   4.7\n 12000  -7.7  18.1  290   8  4   8.7   4.8 |  -6.7  19.9  295  10  5   8.6   4.7\n 10000  -2.3  27.9  300   8  4   8.7   4.8 |  -1.5  29.3  300   9  5   8.6   4.7\n  9000   0.4  32.7  305   8  4   9.6   5.3 |   1.2  34.2  305   8  4   9.1   5.0\n  8000   3.1  37.6  310   8  4   9.4   5.1 |   3.8  38.8  320   7  4   9.0   4.9\n  7000   5.9  42.6  320   8  4   9.6   5.3 |   6.5  43.7  335   7  3   8.8   4.9\n  6000   8.7  47.7  325   8  4   9.9   5.4 |   9.1  48.4  340   6  3   9.4   5.2\n  5000  14.4  57.9  325   8  4  82.2  45.1 |  13.6  56.5  340   5  3  51.2  28.1\n________________________________________________________________________________\n\nThis product is issued once per day by approximately 0600 MST/0700 MDT \n(1300 UTC). This product is not continuously monitored nor updated after\nthe initial issuance. \n\nThe information contained herein is based on the 1200 UTC rawinsonde observation\nat the Salt Lake City, Utah International Airport and/or numerical weather \nprediction model data representative of the airport. These data may not be\nrepresentative of other areas along the Wasatch Front. Erroneous data such as\nthese should not be used.\n\nThe content and format of this report as well as the issuance times are subject\nto change without prior notice.\n\n042025\n"
  },
  "windAloft6": {
    "@context": {
      "@version": "1.1",
      "@vocab": "https://api.weather.gov/ontology#"
    },
    "@id": "https://api.weather.gov/products/2fcc612e-ecb0-4df4-af87-d6ec6196d25e",
    "id": "2fcc612e-ecb0-4df4-af87-d6ec6196d25e",
    "wmoCollectiveId": "FBUS31",
    "issuingOffice": "KWNO",
    "issuanceTime": "2026-04-30T20:00:00+00:00",
    "productCode": "FD1",
    "productName": "6 Hour Winds Aloft Forecast",
    "productText": "\n000\nFBUS31 KWNO 302000\nFD1US1\nDATA BASED ON 301800Z    \nVALID 010000Z   FOR USE 2000-0300Z. TEMPS NEG ABV 24000\n\nFT  3000    6000    9000   12000   18000   24000  30000  34000  39000\nABI      1610+11 2820+08 2736+01 2666-12 2679-21 269735 279845 269458\nABQ              1905+11 2307+02 2631-17 2661-25 259139 249848 249758\nABR 3517 3417-03 3117-11 3222-16 3428-26 3427-38 332750 322752 303149\nACK 2715 2229+04 2236-01 2134-06 2338-19 2340-31 245346 236354 245953\nACY 2915 2923+01 2823-05 2628-10 2543-19 2553-31 254848 255252 265751\nAGC 3016 3020-03 2820-10 3035-13 2944-24 2850-35 287047 286750 275650\nALB 3218 3116-02 2915-06 2714-14 2230-22 2238-34 225246 234851 233550\nALS                      3206-04 2426-18 2735-30 267741 267949 269656\nAMA      1016    1008+01 2709-02 2731-16 2779-23 269837 760647 761759\nAST 0405 1008+07 1607+01 1905-03 2505-17 3119-29 301946 302156 292363\nATL 3415 3207+10 2817+04 2825-01 2848-14 2876-23 780637 781446 289757\nAVP 3417 3412-01 2912-07 2519-13 2534-22 2547-34 245245 254751 254349\nAXN 3409 3409-05 3122-12 3123-18 3323-26 3522-38 342551 332651 302948\nBAM              3607+04 3606-05 3315-18 3331-30 314343 304454 304159\nBCE                      3507-02 2811-20 3128-29 304641 294750 275057\nBDL 3117 3216+00 2717-06 2521-10 2241-20 2250-33 235447 235453 244550\nBFF      3510    3410-02 3312-11 3222-23 3123-36 303150 284553 285252\nBGR 2305 2123+04 2030-01 2035-07 1935-19 1738-32 173748 193554 213854\nBHM 0113 3305+09 2613+04 2825+00 2851-14 2885-23 780237 781546 790958\nBIH      9900    3206+06 3507-02 3323-14 3232-27 303742 304651 305056\nBIL      3409    3310-02 3319-10 0121-22 0436-35 045350 045358 352454\nBLH 3305 3406+15 3506+06 3507-01 9900-15 0314-27 033741 023749 352255\nBML 3112 3211-01 2514-04 2215-11 1940-21 1943-32 193847 204153 223551\nBNA 0210 3609+05 3013+00 2826-05 2846-18 2870-28 782239 782448 783058\nBOI      3407+09 9900+01 0709-06 0115-20 3621-34 352648 344353 323555\nBOS 3216 2716+02 2322-03 2131-07 2141-19 2143-32 235446 235554 234852\nBRL 3316 3021+00 2628-06 2632-13 2747-24 2771-35 278148 278750 288050\nBRO 1618 1916+22 2225+18 2320+11 2627-06 2738-19 285034 285444 286356\nBUF 3012 3115-05 2817-10 2615-17 2628-26 2629-37 263646 264348 253748\nCAE 9900 3009+08 3020+04 2834-02 2847-14 2775-24 780138 791247 780657\nCAR 1239 1538+03 1738-02 1832-06 1834-19 1741-31 164649 164758 203554\nCGI 9900 3309+03 3217-03 2828-07 2746-19 2772-30 771840 772548 783157\nCHS 9900 3118+10 3021+05 2839+00 2854-12 2782-22 289437 790447 299358\nCLE 2917 2920-05 3031-09 3037-15 2946-25 2854-37 286947 286950 275248\nCLL 0711 3406+14 2214+09 2334+05 2858-09 2859-20 277235 277745 278458\nCMH 3011 3115-03 3229-07 3134-13 2842-24 2865-34 287848 288550 287350\nCOU 2714 2615+02 3028-04 2935-10 2843-22 2760-33 771241 772548 771355\nCRP 1111 2109+16 2220+15 2422+10 2639-08 2747-19 274733 285644 287056\nCRW 3210 3215-01 3022-05 2928-10 2854-20 2974-32 780145 781649 780453\nCSG 3411 9900+11 2717+05 2726+00 2752-12 2882-21 780036 780346 289858\nCVG 3306 3308-01 3116-06 3134-11 2858-21 2873-33 289446 781350 780252\nCZI              3513-03 3314-09 3322-24 3225-36 312952 322955 312452\nDAL 0816 2509+10 2824+07 2736+00 2667-12 2676-21 279935 279845 770258\nDBQ 3217 3015-03 2818-09 2725-15 2744-26 2759-38 277448 286949 285648\nDEN              0607+00 0406-08 2917-22 2629-33 275448 267050 277152\nDIK      3413+00 3421-08 3429-12 3534-26 3434-38 364351 363954 332550\nDLH 3308 3311-07 3416-14 3420-18 3523-29 3529-38 353351 342050 302148\nDLN              0208+00 0109-07 0418-22 0641-34 065450 064457 012555\nDRT 0914 1106+15 1905+12 2326+07 2653-08 2668-19 267334 267744 268257\nDSM 3316 3317-03 3230-10 2934-13 2853-25 2867-36 287747 287649 286749\nECK 2710 2818-06 2817-12 2926-17 2939-27 2844-38 284348 275149 273946\nEKN      3119-02 3026-08 2931-10 2845-22 2866-32 288347 288449 287852\nELP      2717    2820+06 2519+00 2438-11 2550-21 249235 740246 740159\nELY              0105+05 3606-04 3221-19 3331-29 314842 304953 295257\nEMI 3124 3123-01 2722-07 2725-11 2742-22 2657-32 276147 275951 275649\nEVV 9900 9900+01 3114-04 2923-09 2747-20 2766-32 781542 782648 782156\nEYW 2908 3008+18 3005+13 3208+06 3324-08 3327-17 301933 312845 344757\nFAT 3309 3208+13 9900+05 9900-02 3421-13 3233-27 314142 314950 305357\nGPI      9900+08 3209+00 0207-05 0317-19 0323-32 032949 043358 032362\nFLO 9900 3111+08 3023+03 2935-02 2846-14 2776-24 780439 790948 780358\nFMN              2914+07 2914-02 2920-18 2652-27 265140 275350 256857\nFOT 3614 9900+12 3405+06 3312+00 3219-14 3231-27 313844 304253 305061\nFSD 2912 2914-02 3021-10 3332-17 3230-27 3231-38 313447 304150 294148\nFSM 0708 0613+06 2007+01 2622-04 2844-16 2783-24 279837 770947 782558\nFWA 2606 2510-02 2927-09 3034-15 2850-25 2855-36 287848 288151 286548\nGAG      0812+07 1306-02 2820-05 2841-18 2769-26 760438 761647 761958\nGCK      9900+04 2811-02 3023-07 2933-21 2854-32 760340 761247 761155\nGEG      9900+08 9900+00 1310-03 0711-18 0813-32 051648 042056 363164\nGFK 3413 3413-07 3514-11 3517-17 3622-27 0115-37 011852 352753 332149\nGGW      3211+03 3317-05 3528-09 3635-22 0250-35 026450 036858 363456\nGJT              3608+04 3610-04 3111-20 2920-33 284045 275948 266954\nGLD      9900    0210-02 3116-08 2928-22 2945-34 287345 770648 279154\nGRB 2807 2812-06 2924-13 2924-19 2831-27 2831-39 283549 283849 283847\nGRI      3309+01 3019-07 3038-12 2948-24 2953-36 286447 287651 287051\nGSP 3617 0305+07 2814+01 2830-03 2842-16 2869-26 781139 781748 791658\nGTF      9900    3207+00 3613-07 0319-21 0334-33 034149 044758 022860\nH51 1913 1810+19 2218+16 2428+09 2732-07 2844-19 294834 295744 286755\nH52 2007 2506+17 2508+13 2515+08 3032-06 2841-18 294133 294143 285256\nH61 3108 2708+17 2613+13 2920+06 3032-09 2838-17 293434 303745 305357\nHAT 3106 3113+08 2818+02 2826-03 2749-15 2772-26 288741 780649 289458\nHOU 0607 9900+14 2414+10 2326+06 2752-09 2856-20 286234 286545 278357\nHSV 0215 3408+08 2817+03 2728-02 2842-16 2783-24 780538 781747 790858\nICT 3411 0108+04 2910-02 2726-08 2733-21 2859-31 771439 772447 772456\nILM 3206 3121+07 3022+04 2933-02 2849-14 2771-24 781138 790949 299658\nIMB              9900+02 9900-04 0509-19 0416-32 334045 344154 343362\nIND 2409 2509-01 3016-07 3032-13 2851-23 2877-34 288548 780050 289251\nINK      1507+13 2621+08 2525+00 2650-10 2661-21 259435 259846 750459\nINL 3308 3408-09 3514-13 3520-17 3624-28 0133-37 013652 362354 351248\nJAN 0511 2610+11 2725+05 2824+00 2652-10 2770-21 278537 289946 790358\nJAX 2614 2712+12 3018+07 2919+02 2947-10 2859-19 286935 297846 298658\nJFK 2912 3216+00 2917-06 2525-10 2441-20 2452-31 235147 245253 255050\nJOT 2617 2524-01 2624-07 2731-14 2852-26 2859-36 287948 287550 286349\nLAS      3607+14 3512+06 3417-02 3214-15 3326-25 322941 313250 303558\nLBB      0911+08 2813+06 2822+00 2744-12 2664-22 268936 760146 760659\nLCH 1407 2408+14 2612+09 2330+05 2857-09 2852-20 286534 286545 287858\nLIT 0514 0707+08 1908+02 2625-02 2848-15 2780-23 770137 771046 781658\nLKV              9900+05 9900-04 3416-18 3231-28 332645 332755 313359\nLND              0208-01 3612-08 3510-23 3414-35 322351 302555 292552\nLOU 0107 3611+00 3118-04 2925-09 2856-19 2867-32 781443 782948 782456\nLRD 0819 1117+17 2112+14 2323+10 2539-07 2651-19 274833 276144 276956\nLSE 3415 3313-06 3210-12 3116-17 2926-27 2831-39 293847 284449 284548\nLWS 9900 9900+08 9900+01 1206-04 0517-18 0521-32 062649 052957 364061\nMBW              0408    0108-08 3114-22 2815-35 292049 283554 284551\nMCW 3317 3318-05 3427-12 3124-17 2933-27 2940-38 294847 285149 285348\nMEM 0514 0207+08 2909+02 2731-04 2842-16 2786-23 770637 771447 780958\nMGM 3611 2813+10 2825+05 2825+01 2855-12 2883-21 289435 289646 299658\nMIA 2608 3007+14 2913+13 3017+06 3127-09 3128-17 292834 303245 324558\nMKC 3416 3212+01 2929-04 2833-10 2847-22 2763-34 279843 772747 770753\nMKG 3211 3023-05 2935-11 2844-17 2843-27 2859-38 285749 285549 274847\nMLB 2614 2514+13 2922+09 2939+04 3040-09 2846-16 284134 294546 305658\nMLS      3311+04 3312-05 3325-10 3531-24 0248-35 036751 026057 342853\nMOB 9900 2610+12 2717+07 2926+02 2748-10 2768-20 286934 287145 287458\nMOT      3309-03 3421-09 3528-14 3534-26 3532-39 363751 363853 342650\nMQT 3414 3023-09 2727-15 2917-20 3113-29 3020-40 302149 301748 281846\nMRF              0609+10 2214+04 2448-11 2575-19 268634 268745 259458\nMSP 3310 3213-06 3325-13 3220-18 3223-27 3423-38 322750 303050 293448\nMSY 1307 2109+13 2411+08 2423+02 2745-09 2847-18 285134 286446 287557\nOKC 0615 0713+05 1711+02 2718-03 2840-17 2780-24 279537 771047 772859\nOMA 3412 3312-02 3128-09 3039-13 2856-24 2864-36 287247 287750 286749\nONL      3113+00 3115-09 3328-17 3145-25 3150-37 305847 295651 285250\nONT 2409 3009+14 3410+06 3611-02 3622-12 0124-25 343240 333949 324257\nORF 2909 2817+03 2825-02 2741-06 2649-17 2759-29 289343 780550 289855\nOTH 3610 9900+09 1605+04 9900-01 3116-15 3227-28 313145 304455 294661\nPDX 0807 1305+09 2107+02 2006-03 9900-18 3213-29 291345 281056 302262\nPFN 3107 3017+13 2722+08 2830+03 2851-09 2856-19 276534 277145 287558\nPHX 2707 2607+16 2709+07 2608+00 2309-15 2518-26 235541 235548 235056\nPIE 2913 3110+16 2920+11 2829+05 3040-09 2845-17 294834 294245 306158\nPIH      0112    0114+01 0113-07 3606-23 3410-34 321951 332453 312853\nPIR      3218+00 3219-09 3326-16 3336-25 3442-37 334249 313752 303349\nPLB 3121 3113-02 2813-07 2416-13 2029-23 2033-34 193247 203851 223550\nPRC              9900+09 2707+00 2816-16 2908-25 351641 351450 271856\nPSB      3122-03 2917-09 2819-13 2739-23 2745-35 275446 275550 275149\nPSX 9900 9900+16 2215+13 2423+08 2644-08 2852-19 285434 285845 287257\nPUB              0814-02 0506-07 2731-19 2537-31 267544 269449 269555\nPWM 3214 2613+01 2123-03 2036-07 2040-19 2042-32 224347 224554 234052\nRAP      3416+03 3221-05 3233-11 3337-24 3236-37 304151 303854 303251\nRBL 9900 9900+13 9900+05 3407-01 3225-15 3344-26 324543 314853 305360\nRDM      0506+11 1605+03 2207-04 3608-18 3325-29 322445 332356 322860\nRDU 3414 3311+05 2821-02 2844-04 2849-16 2868-28 780441 782149 790056\nRIC 3115 3114+02 2822-04 2837-09 2754-18 2756-31 288745 289950 289153\nRKS              0414    0413-07 3408-22 3212-35 321849 292855 293351\nRNO      0205    0205+06 9900-03 3323-16 3232-28 314244 314953 305358\nROA 3217 3119+01 2930-03 2839-07 2855-18 2967-31 781343 782449 781455\nROW      1408    2120+07 2722+01 2735-13 2550-22 258537 750246 750659\nSAC 2906 3605+13 9900+04 0109+00 3323-14 3334-26 324343 314952 306057\nSAN 9900 3305+12 0413+06 0313-02 0224-15 0238-25 354339 344848 334355\nSAT 0818 1612+15 2413+13 2522+09 2538-08 2754-19 275334 275644 276757\nSAV 3109 2814+11 2926+05 2834+00 2856-10 2872-21 289236 289746 289258\nSBA 3110 3511+13 3609+05 0210-01 3421-12 3327-25 323840 324349 314158\nSEA 9900 1506+08 1511+00 1812-04 1712-18 2006-30 271345 241056 291663\nSFO 9900 9900+12 0706+05 3512+01 3321-13 3330-26 314042 315450 305959\nSGF 9900 3207+04 3114-02 2623-08 2740-19 2772-30 771839 772647 773057\nSHV 0719 2613+10 2823+07 2741+01 2771-11 2770-22 279136 289445 289858\nSIY      9900+13 9900+05 9900-02 3221-17 3338-28 325244 325854 315161\nSLC      9900    3611+01 0209-06 3605-21 3318-32 312548 304452 304953\nSLN 3605 3505+04 3114-03 3018-09 2828-22 2747-34 770741 771947 770355\nSPI 2319 2321+01 2627-05 2935-12 2852-23 2872-34 278347 770849 279651\nSPS 0815 0815+06 2411+04 2623-02 2650-12 2670-22 269436 760346 771159\nSSM 3219 3011-08 2709-15 2710-20 3016-30 3027-40 292548 271646 261845\nSTL 2314 2417+02 3028-05 3037-10 2845-22 2862-33 770743 782948 771755\nSYR 3120 3020-04 2817-08 2619-15 2422-25 2329-35 233147 233649 253348\nT01 9900 2508+16 2318+12 2428+07 2848-08 2950-19 295534 285645 287457\nT06 2109 2511+15 2620+12 2321+06 2957-08 2949-19 295434 295845 287457\nT07 2209 2512+15 2820+12 2724+05 2848-08 2846-18 275333 285444 286257\nTCC      1011    1111+04 1910-03 2841-17 2675-23 750138 750747 751258\nTLH 3010 3017+12 2922+08 2828+02 2956-09 2858-19 287335 288045 288158\nTRI      3308+02 3021-02 2836-06 2847-18 2865-30 781240 782749 781757\nTUL 0511 0707+06 2606+00 2623-05 2746-18 2772-27 770938 771747 772158\nTUS      2421+16 2614+08 2709-01 2420-15 2146-23 228240 229648 239254\nTVC 3309 3211-07 3217-14 2923-18 2837-27 2834-39 283549 283849 283646\nTYS 0110 0107+05 3113+00 2829-04 2743-17 2869-28 782239 782449 792558\nWJF      3207+15 3407+06 0109-02 3518-13 3423-26 333340 324049 323958\nYKM 9900 1105+08 0907+00 1906-02 1317-18 1218-31 342345 342755 342364\nZUN              2912+10 2912+01 2725-16 2543-25 256940 248049 247957\n2XG 2715 2924+13 3026+07 2827+02 2933-10 2860-18 287035 297646 298159\n4J3 2506 3006+15 2717+10 2931+05 2943-09 2742-18 275534 285445 286558\n"
  },
  "windAloft12": {
    "@context": {
      "@version": "1.1",
      "@vocab": "https://api.weather.gov/ontology#"
    },
    "@id": "https://api.weather.gov/products/00590afd-c3d4-482b-b902-4029753a900d",
    "id": "00590afd-c3d4-482b-b902-4029753a900d",
    "wmoCollectiveId": "FBUS33",
    "issuingOffice": "KWNO",
    "issuanceTime": "2026-04-30T20:00:00+00:00",
    "productCode": "FD3",
    "productName": "24 Hour Winds Aloft Forecast",
    "productText": "\n000\nFBUS33 KWNO 302000\nFD3US3\nDATA BASED ON 301800Z    \nVALID 010600Z   FOR USE 0300-1200Z. TEMPS NEG ABV 24000\n\nFT  3000    6000    9000   12000   18000   24000  30000  34000  39000\nABI      2821+09 3016+03 2923-01 2536-10 2463-21 256637 259047 751461\nABQ              1521+05 1706-01 2720-16 2652-25 247241 256350 246157\nABR 0112 3514-05 3421-10 3424-15 3427-26 3329-38 322751 312552 323149\nACK 3412 2815+01 2428-03 2145-08 2243-19 2146-31 205149 224753 233951\nACY 3515 2913+00 2817-06 2831-09 2746-22 2655-33 275347 275850 276050\nAGC 3012 3224-03 3234-08 3036-14 2747-25 2764-34 277548 277749 277249\nALB 3318 3119-04 2724-08 2530-16 2431-24 2337-36 224245 233649 253547\nALS                      9900-05 2536-19 2731-31 275741 266251 266056\nAMA      1120    1317+01 2411-03 2822-17 2674-24 750039 741149 751159\nAST 0510 1406+07 2012+01 2012-03 2510-15 2815-29 281746 302955 283363\nATL 0510 2712+10 2719+04 2726-04 2755-13 2785-23 289638 780447 790859\nAVP 3318 3218-04 2518-10 2624-12 2745-24 2755-36 275846 264449 264747\nAXN 0216 3108-06 3313-11 3415-17 3419-26 3419-37 331353 322652 323148\nBAM              0408+04 0305-05 3319-19 3226-32 325444 324453 314758\nBCE                      3505-04 2816-19 3030-28 283943 284153 285056\nBDL 3421 2818+00 2820-07 2627-14 2337-22 2343-34 225046 234250 243348\nBFF      9900    3016-02 3120-11 3128-24 3033-36 284451 284554 294151\nBGR 3211 2412+00 2123-03 2042-07 1943-20 1943-32 184747 194955 203652\nBHM 1211 2509+09 2819+02 2727-03 2777-11 2678-22 279438 780447 780759\nBIH      9900    3611+05 3408-02 3227-15 3243-27 325542 315751 306356\nBIL      9900    3211-02 3617-07 3625-21 0231-33 034249 034757 013459\nBLH 3514 3414+15 3515+07 0113-01 3221-13 3226-25 313641 314949 305155\nBML 3022 2814-02 2711-06 2413-13 2040-22 1950-33 195347 204352 213250\nBNA 0709 3106+05 2921+00 2934-06 2752-18 2780-26 771539 782248 782259\nBOI      0510+10 0711+02 1306-06 0528-20 0544-32 064549 043354 361956\nBOS 3317 2812-02 2722-06 2328-11 2141-20 2153-32 205048 214552 233550\nBRL 3426 3223-05 3023-09 2835-14 2758-25 2771-36 287545 278048 277549\nBRO 1723 1824+21 2032+17 2130+11 2632-07 2638-18 285434 285544 285956\nBUF 3010 2915-06 2815-12 2821-17 2735-26 2751-37 275148 264148 264646\nCAE 0415 2507+07 2621+04 2730-03 2746-15 2890-23 289838 780248 299458\nCAR 1627 1719+02 1830-03 1934-07 1843-19 1751-32 165447 184356 203656\nCGI 2610 3015+03 3115-03 2828-09 2752-21 2773-30 772539 773448 782757\nCHS 3506 2815+10 2619+05 2730-01 2751-13 2888-22 289138 289547 288458\nCLE 9900 2715-04 2828-09 2939-15 2947-26 2752-37 277949 277850 276647\nCLL 0813 9900+14 2314+09 2521+04 2546-12 2667-20 267835 278745 269559\nCMH 2209 2817-01 2919-07 3030-13 2752-25 2771-36 278448 279249 288349\nCOU 3524 3026+00 2830-06 2840-10 2856-23 2767-34 771241 772248 770554\nCRP 1215 1814+18 2127+14 2230+09 2550-08 2652-19 276333 277045 277058\nCRW 9900 3618+00 3119-05 2933-10 2754-21 2763-34 770942 783048 781755\nCSG 0207 3012+11 3024+05 2627-01 2663-11 2773-21 289137 289646 289558\nCVG 2209 2507+01 2618-05 2927-11 2755-22 2766-35 279844 773048 781553\nCZI              3310-03 3417-09 3628-23 0232-35 034750 034657 332854\nDAL 0820 2908+10 2926+05 2928-01 2647-11 2761-23 269136 760647 761959\nDBQ 3522 3419-06 3323-11 3221-17 3024-26 2933-38 284546 285448 285347\nDEN              9900-02 0705-08 2816-22 2528-34 274048 265951 276454\nDIK      3214+01 3227-08 3526-12 3547-25 3664-35 017651 016856 354053\nDLH 0111 3510-08 3316-13 3323-18 3425-28 3535-38 353651 342252 322448\nDLN              0406+00 0510-06 0517-19 0527-33 053549 063558 032860\nDRT 0924 1517+15 1816+10 2328+06 2552-09 2569-17 267434 257845 258459\nDSM 3213 3219-03 3426-10 3432-18 3042-25 2949-37 296046 286649 286448\nECK 3411 3014-07 2934-11 2756-16 2745-28 2751-40 264948 275048 274846\nEKN      3320-03 3226-07 2932-10 2762-20 2763-34 278246 781349 289952\nELP      1409    2310+05 2326-01 2237-11 2335-23 236940 239847 730256\nELY              0714+03 0210-05 3223-19 3126-31 304344 303454 294455\nEMI 3326 3124-03 2922-08 2729-10 2751-23 2767-33 287248 287649 276550\nEVV 2310 2919+03 2920-04 2930-10 2748-22 2762-33 772340 773448 782156\nEYW 2605 2607+18 9900+14 3111+07 3022-08 2934-17 272033 292345 304457\nFAT 3410 3308+13 9900+05 9900-01 3324-14 3240-26 314542 315750 305957\nGPI      2407+08 2907+00 9900-03 0213-18 0218-32 032048 062157 362164\nFLO 0515 9900+07 2315+02 2731-03 2747-15 2885-23 780439 780448 289657\nFMN              3609+06 2909-02 2419-20 2736-28 274142 264651 265057\nFOT 3614 9900+12 9900+06 9900+00 3215-13 3222-27 303644 294652 295161\nFSD 3618 3119-02 3029-10 3127-15 3229-26 3133-37 304150 303951 293949\nFSM 0909 0610+06 3206+00 3120-05 2846-17 2782-24 770539 772648 771858\nFWA 2613 2326-01 2332-07 2537-13 2746-26 2768-39 278146 277748 277249\nGAG      0906+05 3211+00 3309-06 2836-18 2757-29 761139 752349 762259\nGCK      3208+05 3505-02 0106-08 2925-20 2741-33 268841 269249 760456\nGEG      1406+08 1810+00 1905-02 1405-18 0907-31 990047 360957 011463\nGFK 3511 3420-07 3418-11 3520-16 3523-27 3420-38 331651 341952 342649\nGGW      3209+04 3418-03 3527-08 3636-21 3642-33 025548 036457 014461\nGJT              0514+02 0511-05 3006-20 2715-32 284444 276052 275756\nGLD      9900    0208-03 3414-10 2922-22 2839-34 276147 268650 277953\nGRB 0312 3313-07 2824-13 2822-18 2927-30 2930-39 293449 293548 293247\nGRI      3118+01 3024-07 3230-14 3144-23 2950-35 285949 277151 286750\nGSP 0419 1809+06 2521+01 2734-03 2746-16 2792-24 780239 781148 781259\nGTF      2609    3208+00 0214-04 0119-20 0127-33 033548 043657 022963\nH51 1612 1823+19 2126+16 2330+10 2731-07 2738-19 284734 285344 285757\nH52 1609 2008+18 2217+15 2621+09 3031-07 2941-19 293734 294445 295756\nH61 9900 2509+18 2516+13 2718+06 2938-08 2839-19 284134 284644 285257\nHAT 3417 3017+06 2827+00 2837-03 2748-16 2766-28 781039 781148 780057\nHOU 1211 9900+14 2320+11 2529+07 2651-09 2660-20 277134 277845 278259\nHSV 0910 3006+08 2719+02 2825-04 2752-15 2784-24 279338 780747 780959\nICT 0611 0205+03 3010-02 3114-08 2936-20 2858-32 760340 762348 772657\nILM 0214 9900+06 2725+01 2735-02 2742-16 2880-25 780839 780848 780158\nIMB              9900+03 9900-03 1314-18 1015-31 352645 342855 322562\nIND 2326 2530+00 2533-06 2741-12 2755-24 2770-36 278746 770748 279951\nINK      3110+09 2515+05 1924+00 2256-11 2553-22 257137 249448 741059\nINL 0111 3609-09 3516-13 3520-17 3621-27 3525-37 012152 361954 341949\nJAN 9900 2617+10 2727+04 2642+00 2759-11 2768-23 289536 289746 770259\nJAX 3015 2811+12 2619+07 2731+02 2848-09 2855-20 286635 286946 296358\nJFK 3516 2806-01 2415-07 2523-13 2642-22 2649-34 254946 254651 264448\nJOT 3220 3019-03 2624-10 2631-14 2646-26 2758-37 277146 276948 276448\nLAS      0513+13 0309+06 3612-02 3221-15 3129-27 293642 304750 295955\nLBB      1218+07 2408+04 2813-01 2738-13 2463-22 236339 249049 751859\nLCH 1608 9900+14 2515+10 2534+06 2652-10 2763-20 277634 277945 278559\nLIT 0714 0611+07 9900+01 3021-04 2746-15 2777-24 279938 771847 771759\nLKV              0906+04 3306-04 0112-17 3430-29 333345 323754 314960\nLND              0207-02 0115-09 3618-22 0319-35 063950 042456 322253\nLOU 9900 2807+02 2919-04 2825-10 2749-21 2762-33 772240 773248 772156\nLRD 1421 1512+17 2116+15 2428+11 2447-08 2450-19 276233 286545 276857\nLSE 3614 3418-06 3325-12 3222-18 3125-27 3130-38 303450 294049 294047\nLWS 9900 1208+09 1407+01 1505-03 0712-18 0615-31 040947 020857 022562\nMBW              0807    9900-09 3317-23 3322-35 302950 303255 293052\nMCW 3206 2917-04 3025-10 3234-17 3224-26 3226-37 304049 294649 294948\nMEM 0810 0208+07 2813+01 2822-05 2747-16 2782-24 279538 781647 771458\nMGM 0605 3015+10 2919+04 2528-01 2665-11 2869-21 289336 289346 289558\nMIA 2009 2308+18 2713+13 2918+06 3127-09 2939-16 283134 283045 294758\nMKC 3615 3230+00 3041-07 2938-11 2852-23 2961-35 289343 772248 279953\nMKG 0505 3513-06 3117-11 2731-16 2546-29 2747-40 274847 275048 274647\nMLB 2714 2715+15 2722+10 2728+04 3032-09 2843-19 265534 275745 285758\nMLS      3212+04 3322-04 3525-09 3536-23 0140-34 025749 036258 364158\nMOB 1806 2515+12 2619+08 2637+03 2953-09 2756-20 287635 287846 288658\nMOT      3316-02 3420-07 3626-14 3529-27 3665-36 018550 016454 363651\nMQT 3614 3614-10 3515-17 3314-19 3413-29 3513-41 341649 321848 291446\nMRF              1113+08 2023+04 2370-12 2650-21 248635 249546 750858\nMSP 0207 3312-06 3126-12 3120-18 3323-27 3428-37 332552 313251 313448\nMSY 2009 2411+13 2616+10 2641+05 2851-10 2860-20 286934 287246 288958\nOKC 0716 0910+06 3505+01 3114-04 2937-17 2775-25 760239 762349 762658\nOMA 3010 3118-01 3423-09 3423-16 3046-24 3058-35 296648 287050 286449\nONL      3217+01 3122-08 3229-14 3241-24 3046-37 295851 285351 294950\nONT 9900 3210+14 3607+06 0310-02 3223-12 3231-26 314940 305648 305756\nORF 3423 2812+01 2833-03 2845-06 2756-18 2767-31 780642 781448 780556\nOTH 0211 9900+09 1708+04 1905-02 3015-14 3022-28 302945 293654 295263\nPDX 0913 1306+09 2111+02 2114-03 2505-17 3114-29 301646 302156 292662\nPFN 9900 2513+13 2723+09 2530+02 2846-10 2856-17 286235 286245 296858\nPHX 2729 2819+15 3012+07 0109-01 9900-16 3212-27 362841 343148 313154\nPIE 2914 2708+15 2520+11 2724+05 2941-09 2742-19 284534 274645 285458\nPIH      0414    0514+01 0712-07 0612-22 0510-34 072650 062054 342053\nPIR      3322-01 3224-08 3329-13 3332-26 3129-39 313051 313051 313449\nPLB 3119 2918-05 2514-08 2415-16 2123-25 2030-35 203846 203249 212848\nPRC              0210+08 9900+00 2913-16 3319-25 302242 303150 304256\nPSB      3122-05 3021-10 2928-13 2741-24 2647-36 277248 276350 276048\nPSX 1114 1812+15 2227+13 2328+08 2550-08 2654-21 276533 277245 278159\nPUB              0914-02 0910-07 2415-20 2425-32 266643 267950 267355\nPWM 3110 2712-01 2615-06 2229-10 2042-20 2049-32 205048 204653 223550\nRAP      3406+02 3122-05 3228-11 3332-25 3439-38 015951 353954 313651\nRBL 3405 9900+13 9900+05 9900-01 3322-14 3330-27 314443 315352 305560\nRDM      1007+10 1611+04 2107-03 9900-17 3417-29 322245 322355 313461\nRDU 0120 2714+04 2627-02 2840-05 2654-17 2769-29 781840 782449 781457\nRIC 3625 3017+00 2827-04 2838-07 2762-19 2767-32 780943 782348 780654\nRKS              0719    0616-08 0114-22 3517-34 301950 301955 302552\nRNO      0711    0608+05 3509-03 3325-17 3333-28 325043 326052 315858\nROA 3418 3215+02 2920-03 2731-08 2753-19 2767-32 781741 782349 781556\nROW      1818    2014+06 9900+00 2520-14 2241-24 238639 239748 730357\nSAC 3605 0307+12 0909+05 0307+00 3323-14 3233-26 314143 315551 305659\nSAN 9900 3420+13 0214+07 0411+00 3322-11 3231-24 314939 305347 305555\nSAT 1217 1609+16 2210+11 2227+08 2456-08 2561-21 277333 287245 277559\nSAV 9900 2514+10 2621+05 2733-01 2855-11 2877-22 288636 288746 288459\nSBA 0108 0111+12 3506+06 3410+02 3321-12 3329-25 314940 305448 295657\nSEA 0607 1308+08 1811+01 2014-04 2113-17 2708-29 271346 281656 271763\nSFO 3309 0306+12 9900+05 3612+02 3219-13 3224-26 314142 305050 295559\nSGF 0117 3210+03 2917-03 2926-09 2851-22 2868-30 772439 773648 772856\nSHV 0918 3011+10 2922+04 2748+01 2763-12 2772-22 279636 770647 770859\nSIY      9900+12 1107+05 1606-03 3321-15 3329-28 323944 314753 305761\nSLC      0406    0713+02 0711-06 0106-22 3315-33 312249 293752 303053\nSLN 0717 9900+03 2815-04 3026-11 3038-22 2964-33 278944 760749 279755\nSPI 3326 2924-02 2637-07 2743-11 2756-24 2777-35 278444 771048 279952\nSPS 0819 0709+06 3107+03 2914-02 2843-14 2676-22 258439 760748 763060\nSSM 0414 0406-08 9900-15 2912-21 3113-29 3015-41 292149 291747 271445\nSTL 3527 2926+01 2634-05 2641-10 2756-23 2768-34 771141 772548 770954\nSYR 3116 3012-05 3018-11 2617-17 2728-26 2634-37 253347 243048 253946\nT01 1108 1910+16 2326+13 2535+08 2744-08 2745-19 275334 276145 287758\nT06 1607 2109+16 2424+13 2637+08 2845-08 2847-19 285134 285945 287258\nT07 2108 2412+16 2619+12 2636+07 2948-09 2947-19 285035 285345 296358\nTCC      1321    1209+02 2512-04 2826-17 2569-24 248540 249649 740459\nTLH 2809 2719+12 2625+07 2729+02 2637-09 2862-18 286635 287046 297259\nTRI      3009+05 2717-01 2732-06 2754-18 2773-29 772440 782749 782457\nTUL 0609 0405+06 3207-01 3022-06 2944-18 2768-28 762039 773249 772458\nTUS      2212+10 3120+04 3524-03 3412-15 1707-26 161943 252747 273950\nTVC 0111 2815-07 2924-13 2726-19 2733-29 2733-40 273548 273548 273146\nTYS 0713 9900+06 2613+00 2830-06 2750-17 2774-28 771239 781949 782559\nWJF      3409+14 0207+06 0310-01 3323-13 3232-26 314840 305848 305756\nYKM 9900 1208+08 9900+00 2110-01 1819-17 1915-30 330946 311256 291563\nZUN              0519+08 3306+00 2514-17 2438-26 271742 271851 263455\n2XG 2714 2714+12 2618+07 2620+01 2844-09 2957-21 286935 277346 287059\n4J3 2811 2307+14 2518+10 2527+05 2949-10 2839-19 294934 284545 295558\n"
  },
  "windAloft24": {
    "@context": {
      "@version": "1.1",
      "@vocab": "https://api.weather.gov/ontology#"
    },
    "@id": "https://api.weather.gov/products/eb4ba7b2-0e34-4cb6-83ef-f9b83595e89e",
    "id": "eb4ba7b2-0e34-4cb6-83ef-f9b83595e89e",
    "wmoCollectiveId": "FBUS35",
    "issuingOffice": "KWNO",
    "issuanceTime": "2026-04-30T20:00:00+00:00",
    "productCode": "FD5",
    "productName": "Winds Aloft Forecast",
    "productText": "\n000\nFBUS35 KWNO 302000\nFD5US5\nDATA BASED ON 301800Z    \nVALID 011800Z   FOR USE 1200-0000Z. TEMPS NEG ABV 24000\n\nFT  3000    6000    9000   12000   18000   24000  30000  34000  39000\nABI      0620+05 0615+00 9900-03 2426-12 2139-22 214238 224248 247156\nABQ              1212+01 9900-03 2419-17 2723-28 253844 264751 276453\nABR 3307 3308-04 3520-09 3525-14 3619-27 0222-38 013950 014251 352850\nACK 3117 2820-01 2421-06 2526-10 2536-23 2442-34 244246 244550 254548\nACY 2807 3220+00 3125-04 2928-11 2751-24 2658-36 278845 278647 267449\nAGC 2513 2326-02 2434-07 2438-13 2547-26 2762-37 770544 781748 278149\nALB 2909 2913-05 2822-09 2933-13 2738-27 2537-39 264346 243847 254046\nALS                      9900-06 2605-20 2720-31 254245 264054 275255\nAMA      0615    0922-02 0909-06 2922-17 2749-26 235443 236652 256254\nAST 0109 9900+07 1814+00 1919-05 2027-17 1934-30 203946 204257 213261\nATL 9900 9900+07 2808+02 2928-04 2559-11 2677-22 278938 279849 781861\nAVP 3006 2809-03 2627-07 2642-13 2636-27 2656-39 276846 276147 275446\nAXN 3310 3411-07 3616-11 3619-16 3620-27 3519-38 351950 352351 332349\nBAM              1109+03 1009-06 0625-18 0229-29 344344 335752 325559\nBCE                      9900-05 3207-20 3012-33 295244 295749 295653\nBDL 2811 2916-04 3028-07 3139-12 2730-25 2641-38 254846 244749 254646\nBFF      3314    3315-02 3427-09 3429-21 3434-33 014248 014156 312957\nBGR 3108 2911-01 2511-07 2320-12 2038-21 1851-34 176247 184951 203949\nBHM 3606 9900+05 3116+00 3027-04 2451-10 2472-21 267738 268248 269561\nBIH      9900    9900+04 9900-03 3230-14 3239-26 314742 305451 295661\nBIL      2907    3310+00 3515-05 0225-19 0231-32 032847 022556 022466\nBLH 3613 3615+14 3414+06 3314-02 3133-12 3144-25 305340 295849 285659\nBML 3016 3119-04 2715-08 2516-14 2230-25 1940-37 194647 203848 213747\nBNA 3110 2818+03 2724-02 2833-05 2749-17 2792-24 771139 762448 763861\nBOI      1608+09 1507+01 1310-04 0813-18 0510-31 361546 341955 322462\nBOS 2916 2826-03 2822-07 2623-11 2528-24 2336-36 233947 234249 243747\nBRL 9900 3018-03 3025-10 3031-16 2939-25 2855-36 761843 771449 277250\nBRO 2025 2122+19 2423+16 2425+09 2442-07 2553-18 256934 267244 277456\nBUF 2507 2609-06 2422-11 2430-16 2440-29 2546-39 265248 275146 274946\nCAE 1409 2612+08 2612+02 2730-03 2773-12 2781-22 289238 780749 792858\nCAR 3010 2410-01 2213-06 1928-11 1849-21 1777-32 670247 178954 194451\nCGI 3615 0125-01 3123-04 2836-05 2745-19 2876-29 762939 754748 754259\nCHS 1314 2411+09 2523+04 2640+00 2866-12 2770-21 279537 780248 792158\nCLE 3611 3013-03 2622-09 2529-16 2639-26 2755-36 277846 278547 277048\nCLL 0931 1520+11 2031+06 2344+04 2470-10 2572-21 257637 258247 258657\nCMH 2718 2722-02 2533-08 2443-13 2647-24 2764-34 773842 773550 279551\nCOU 2506 3314-01 3221-08 3030-11 2855-23 2781-31 762841 761851 269755\nCRP 1519 1927+16 2325+12 2536+08 2457-08 2568-18 257835 258945 269656\nCRW 2511 2619+02 2532-04 2638-11 2760-22 2878-32 783840 785649 782255\nCSG 3405 9900+07 2913+03 2524+00 2560-11 2671-21 267737 269747 770759\nCVG 2915 2821-03 2730-07 2636-11 2857-22 2875-32 773841 774949 772556\nCZI              3412-01 3523-07 0128-20 0235-32 034947 044756 023163\nDAL 0533 0713+06 0608+00 0506-04 2038-11 2369-21 256437 255648 256760\nDBQ 3605 3410-05 3023-11 3121-17 3023-25 3017-37 282749 275048 275348\nDEN              9900+00 9900-07 0212-21 0111-33 330948 283454 283356\nDIK      3406+02 3516-06 3523-12 0147-21 0161-33 027347 027356 015262\nDLH 3506 3309-08 3519-12 3620-17 3520-26 3419-37 341551 341954 331949\nDLN              9900+02 9900-03 0814-19 0614-31 061147 071056 061264\nDRT 0210 1616+11 2625+08 2534+02 2559-10 2575-20 258236 258144 267755\nDSM 3115 3015-03 3020-09 3124-14 2933-26 2832-38 276646 276847 275748\nECK 3409 2814-07 2822-14 2723-18 2829-28 2735-39 274746 275047 274946\nEKN      2315+02 2424-05 2535-11 2652-25 2779-33 784041 783349 770452\nELP      0509    0410+03 0412-02 3022-13 2828-25 284740 286446 286953\nELY              0511+03 0412-06 0215-20 0314-34 334542 335349 325154\nEMI 2106 2715+01 2723-05 2727-12 2651-25 2667-37 770843 781648 277848\nEVV 3317 3426-01 3123-06 2838-07 2750-21 2884-31 773240 765948 764959\nEYW 2309 2312+17 2110+14 2608+08 3219-09 3117-17 292633 303144 294256\nFAT 9900 9900+13 9900+06 3407+00 3319-12 3125-26 293842 294452 284862\nGPI      2406+08 2709+00 2416-02 2511-18 2710-31 261447 251756 271665\nFLO 1519 2417+07 2816+01 2727-03 2774-12 2781-23 279439 791949 792258\nFMN              1005+03 9900-03 2811-20 2729-29 273645 273653 285354\nFOT 0112 1805+11 1810+05 2012-01 2513-15 2426-27 243644 254754 255764\nFSD 3413 3414-05 3521-10 3524-15 3423-27 3515-39 361249 331848 312648\nFSM 0612 0412+04 3607-02 2813-05 3032-18 2681-23 249138 249749 750660\nFWA 3411 3514-05 3113-11 3118-15 2843-24 2752-36 770644 771148 277749\nGAG      0709+05 0515-03 3510-07 3131-18 2754-27 246442 247052 255956\nGCK      9900+05 0111-03 3416-09 3133-20 2756-30 266743 266953 266156\nGEG      2007+08 2111+01 2216-03 2218-18 2315-31 261446 271557 271664\nGFK 3407 3415-06 3616-09 3624-13 3626-26 3630-38 027349 026153 363252\nGGW      3108+05 3416+01 3419-05 3631-19 3636-32 363747 363556 362966\nGJT              0408+02 0608-05 0605-20 0509-34 290948 272451 293054\nGLD      3310    3310-02 3318-10 3322-21 3025-33 275946 277054 285555\nGRB 3408 3310-09 3419-16 3224-18 3121-26 3326-38 312849 302850 293448\nGRI      3316+01 3231-08 3232-13 3053-25 3065-36 295847 286550 295650\nGSP 9900 2713+06 2723+02 2633-04 2756-15 2785-24 279839 781950 784460\nGTF      2409    2610+02 2907-03 3407-18 3413-32 330847 311156 340866\nH51 2028 2120+17 2132+16 2238+09 2439-08 2551-19 266734 277245 277456\nH52 1924 2019+17 2222+15 2321+09 2526-08 2641-18 284634 275045 286356\nH61 1912 2316+17 2420+14 2721+07 2822-08 2734-18 273734 294445 285957\nHAT 2108 2918+05 2823+00 2636-06 2762-16 2795-23 781139 783150 780859\nHOU 1319 2022+14 2133+09 2441+05 2465-10 2670-19 257335 258747 760157\nHSV 3611 9900+06 2816+01 2725-04 2663-12 2581-21 268838 268949 760262\nICT 0206 0107+03 3520-05 3121-08 3043-21 2865-30 259642 258952 257956\nILM 1415 2519+06 2822+01 2732-04 2773-13 2783-22 289939 792449 791558\nIMB              1511+03 1613-03 1915-17 2207-30 291545 282355 283364\nIND 3317 3217-04 3120-09 3023-13 2848-23 2876-33 773541 772950 771154\nINK      0921+06 0918+01 0810-03 2823-13 2915-25 233539 265244 266553\nINL 3607 3611-07 3615-12 0119-16 0229-27 0127-38 352551 362752 352449\nJAN 0623 3608+08 2511+03 2037+00 2573-11 2682-21 267536 257546 258359\nJAX 2905 2518+12 2534+07 2837+03 2857-10 2754-19 276735 287747 288559\nJFK 2910 3120-02 3128-04 3030-11 2741-25 2656-37 276546 266048 265947\nJOT 3410 3316-06 3231-11 3125-16 2936-25 2836-36 277046 278348 276649\nLAS      0312+11 3610+04 3214-03 3132-16 3151-26 316241 306350 296158\nLBB      0924+03 0827-02 0415-04 3025-15 2534-25 234141 225750 266153\nLCH 1513 2019+13 2231+07 2345+03 2571-09 2674-20 267735 258847 269658\nLIT 0522 0512+04 9900-01 2812-05 2742-13 2565-23 248038 249549 740461\nLKV              1607+03 1511-02 1713-16 3209-28 292344 283455 284963\nLND              3508+00 3612-06 0317-20 0322-32 053647 063956 041761\nLOU 3014 2922-02 2634-06 2646-07 2756-20 2884-31 773940 766848 775558\nLRD 1909 2516+16 2628+13 2542+07 2459-09 2568-19 258535 258944 269556\nLSE 3307 3308-06 3220-13 3223-16 3223-26 3324-36 321951 292751 283748\nLWS 9900 2207+09 2410+01 2012-02 1907-17 2205-31 280847 311256 281364\nMBW              3308    3614-07 3618-21 0122-33 033347 043456 341558\nMCW 3607 3610-04 3311-11 3314-16 3217-26 3208-38 291250 282748 283747\nMEM 0219 3617+04 2813-01 2820-05 2746-15 2774-24 760138 259448 259760\nMGM 0209 9900+07 2611+03 2229+01 2455-10 2777-22 276937 268347 269860\nMIA 1908 2512+18 2616+13 2819+07 3026-08 2921-17 292633 293145 304857\nMKC 2910 3011+00 3216-09 3232-12 2948-25 2877-32 762042 760951 268653\nMKG 3313 3313-08 2917-12 3024-17 3026-27 2933-38 294247 284748 285047\nMLB 2211 2313+15 2626+12 2831+06 2932-08 2735-18 274034 284346 286259\nMLS      3208+06 3419-01 3523-06 0138-20 0248-32 025047 024556 013865\nMOB 2019 2420+12 2528+05 2544+03 2661-10 2670-21 267235 267746 268358\nMOT      3310-01 3524-07 3622-12 0146-21 0162-33 017447 017656 015161\nMQT 3514 3317-10 3319-16 3519-19 3420-27 3428-39 343350 332550 312147\nMRF              2815+04 2619-01 2219-14 2749-21 267435 277044 276754\nMSP 3409 3410-08 3416-11 3417-16 3418-26 3114-37 300552 321652 312548\nMSY 1816 2219+13 2429+08 2441+03 2557-10 2684-21 268735 278945 267758\nOKC 0815 0814+04 0509-02 3107-07 3025-17 2757-25 248840 239748 730761\nOMA 3316 3318-03 3225-08 3129-13 3030-27 2844-38 276746 276547 285548\nONL      3414-01 3328-08 3328-14 3327-29 3236-39 324046 313848 304049\nONT 9900 0705+15 9900+06 3506+00 3221-12 3033-25 294740 294950 284961\nORF 2608 2913+03 2826-02 2732-08 2665-20 2792-28 784240 784050 770456\nOTH 3618 9900+08 1915+02 2018-03 2218-16 2226-29 224046 234356 234962\nPDX 1105 1508+09 1816+02 1921-05 2027-17 2027-29 213145 223456 233363\nPFN 1913 2417+12 2529+10 2641+05 2764-11 2665-19 267335 277546 267160\nPHX 9900 9900+13 9900+07 2906-01 3125-15 3146-25 305639 296348 286157\nPIE 2308 2415+16 2623+12 2728+06 2838-08 2739-19 263934 274345 286158\nPIH      0305    9900+01 0707-05 0617-19 0617-32 062647 072656 021360\nPIR      3309-01 3324-07 3427-13 3525-29 3647-37 016747 015651 343251\nPLB 3013 3121-06 2820-12 2622-16 2527-28 2327-39 223246 223247 223246\nPRC              9900+07 3106-02 3127-15 3039-27 316341 306448 296456\nPSB      2521-02 2537-08 2638-13 2755-28 2657-39 277845 277946 276546\nPSX 1424 2030+15 2237+12 2434+07 2460-09 2570-19 257736 258946 760056\nPUB              9900-01 0607-07 3210-20 2716-32 264945 264654 275156\nPWM 3014 2819-02 2817-08 2521-11 2229-24 2035-36 204247 214149 223548\nRAP      3415+04 3318-05 3435-10 3542-22 3651-34 016548 026856 353958\nRBL 9900 1507+12 1709+05 1806-01 2007-14 2517-27 272943 274453 275563\nRDM      1614+11 1706+04 1909-04 1922-17 2210-29 252145 253056 264364\nRDU 2209 2521+04 2825-01 2630-06 2766-17 2793-25 771839 785249 794259\nRIC 2106 2607+03 2823-03 2731-10 2749-22 2785-30 784640 784249 770655\nRKS              0309    0414-06 0518-20 0518-33 053248 063256 011057\nRNO      1006    1006+04 0406-03 0210-15 3329-27 313743 304753 295261\nROA 1909 2518+03 2627-03 2733-09 2757-21 2785-29 784140 785849 783557\nROW      1119    1422+02 9900-03 2806-15 2627-26 253342 274749 276652\nSAC 3505 9900+13 9900+06 9900+00 2906-13 2817-27 282943 274252 275162\nSAN 0106 3605+15 9900+07 3206+01 3124-12 3031-23 294640 284850 274960\nSAT 1429 2126+16 2429+12 2538+06 2465-10 2572-20 258736 259345 760256\nSAV 1312 2405+10 2519+05 2632+01 2859-11 2764-20 278236 289448 791459\nSBA 9900 9900+13 9900+06 3306+03 3119-12 2924-24 283941 284451 274461\nSEA 9900 1707+08 2016+01 2120-06 2025-17 2127-30 222946 223356 222964\nSFO 9900 9900+12 9900+06 9900+01 2710-14 2718-26 273243 274152 264763\nSGF 0507 0214+01 3222-04 3025-07 2842-21 2782-27 750441 752750 752058\nSHV 0636 0615+06 0807+01 1924-01 2458-11 2650-21 266937 257148 258259\nSIY      1509+12 1711+04 1910-03 1913-15 2319-28 253244 264255 265664\nSLC      9900    0609+02 0612-05 0818-20 0829-33 084048 073555 351755\nSLN 3307 3309+02 3321-06 3231-10 3147-22 2959-33 269443 269552 267855\nSPI 3310 3326-03 3228-10 3132-15 2847-23 2879-33 763542 772551 269852\nSPS 0914 0826+04 0725-02 0320-05 2531-12 2550-24 227539 226649 238058\nSSM 3214 3314-10 3218-17 3213-20 3321-29 3327-40 322647 312147 291645\nSTL 3206 3321-01 3223-08 3028-12 2856-22 2786-31 763141 761850 760955\nSYR 2606 2510-06 2524-10 2525-15 2539-28 2649-41 264647 264547 263745\nT01 1821 2022+16 2227+11 2336+06 2457-08 2661-20 266534 267746 279257\nT06 1919 2218+14 2426+09 2430+05 2453-08 2560-20 266534 277645 277956\nT07 2016 2315+13 2524+12 2629+06 2544-09 2660-20 276334 287145 277058\nTCC      0625    1025-02 1713-04 3116-17 2641-27 245744 254752 266154\nTLH 1709 2318+11 2529+09 2639+04 2755-11 2763-20 266635 267146 267659\nTRI      2512+04 2621-02 2733-07 2765-16 2889-27 772940 775449 785158\nTUL 0610 0314+03 3511-03 3014-07 3037-19 2764-26 259340 741249 742660\nTUS      2809+13 3211+07 3209+00 3131-13 3046-25 295339 296547 286357\nTVC 3413 3612-09 3611-16 3118-18 3124-27 3227-40 303248 293248 293447\nTYS 2608 2610+05 2721-01 2734-06 2759-16 2787-24 770839 773049 775160\nWJF      0609+14 9900+06 2908+01 3221-12 3031-25 294441 294751 284861\nYKM 9900 1606+09 2114+02 2215-05 2127-18 2212-29 241646 242155 252565\nZUN              9900+07 9900-02 2915-17 2828-28 303343 295249 286753\n2XG 2211 2615+13 2623+08 2737+03 2847-09 2757-19 276535 297647 298960\n4J3 2112 2313+15 2527+12 2731+06 2740-10 2656-19 275134 275446 276858\n"
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
          "end": "2026-05-01T00:15:00Z"
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
          "altimeter": {
            "altimeter_set_1": {}
          },
          "wind_gust": {
            "wind_gust_set_1": {}
          }
        },
        "OBSERVATIONS": {
          "date_time": [
            "5:30 PM",
            "5:35 PM",
            "5:40 PM",
            "5:45 PM",
            "5:50 PM",
            "5:54 PM",
            "5:55 PM",
            "6:00 PM",
            "6:05 PM",
            "6:10 PM",
            "6:15 PM",
            "6:20 PM",
            "6:20 PM"
          ],
          "air_temp_set_1": [
            62.6,
            62.6,
            62.6,
            62.6,
            64.4,
            62.96,
            62.6,
            62.6,
            62.6,
            64.4,
            62.6,
            62.6
          ],
          "wind_speed_set_1": [
            10.36,
            11.51,
            10.36,
            12.66,
            10.36,
            12.66,
            12.66,
            11.51,
            11.51,
            11.51,
            8.06,
            12.66,
            12.66
          ],
          "wind_direction_set_1": [
            320,
            290,
            270,
            340,
            330,
            320,
            330,
            320,
            300,
            300,
            300,
            310,
            310
          ],
          "altimeter_set_1": [
            30.03,
            30.03,
            30.03,
            30.03,
            30.03,
            30.03,
            30.03,
            30.03,
            30.03,
            30.03,
            30.03,
            30.03
          ],
          "wind_gust_set_1": [
            16.11,
            null,
            null,
            null,
            null,
            null,
            null,
            null,
            19.56,
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
          "end": "2026-04-30T23:55:00Z"
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
          "altimeter": {
            "altimeter_set_1": {}
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
            "2:15 PM",
            "2:35 PM",
            "2:55 PM",
            "3:15 PM",
            "3:36 PM",
            "4:16 PM",
            "4:35 PM",
            "4:55 PM",
            "5:15 PM",
            "5:35 PM",
            "5:55 PM",
            "6:15 PM",
            "6:15 PM"
          ],
          "air_temp_set_1": [
            60.8,
            60.8,
            62.6,
            62.6,
            60.8,
            60.8,
            62.6,
            60.8,
            60.8,
            60.8,
            60.8,
            60.8
          ],
          "wind_speed_set_1": [
            9.21,
            10.36,
            18.41,
            16.11,
            14.96,
            14.96,
            17.26,
            16.11,
            12.66,
            14.96,
            14.96,
            11.51,
            11.51
          ],
          "altimeter_set_1": [
            30.08,
            30.08,
            30.07,
            30.07,
            30.06,
            30.06,
            30.05,
            30.05,
            30.04,
            30.04,
            30.04,
            30.04
          ],
          "wind_direction_set_1": [
            320,
            320,
            360,
            320,
            330,
            320,
            330,
            320,
            320,
            310,
            330,
            310,
            310
          ],
          "wind_gust_set_1": [
            23.02,
            18.41,
            21.86,
            21.86,
            20.71,
            25.32,
            24.17,
            25.32,
            23.02,
            null,
            19.56,
            19.56,
            19.56
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
          "end": "2026-05-01T00:10:00Z"
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
            "4:30 PM",
            "4:40 PM",
            "4:50 PM",
            "5:00 PM",
            "5:10 PM",
            "5:20 PM",
            "5:30 PM",
            "5:40 PM",
            "5:50 PM",
            "6:00 PM",
            "6:10 PM",
            "6:20 PM",
            "6:20 PM"
          ],
          "air_temp_set_1": [
            59.05,
            59.15,
            59.4,
            58.59,
            58.36,
            59.35,
            60.06,
            58.99,
            59.17,
            59.68,
            57.75,
            56.71
          ],
          "wind_speed_set_1": [
            9.18,
            14.12,
            9.67,
            12.95,
            10.1,
            7.3,
            12.31,
            11.58,
            10.18,
            6.55,
            8.54,
            3.15,
            3.15
          ],
          "wind_direction_set_1": [
            275.8,
            270.9,
            268.8,
            256.8,
            266.6,
            272.2,
            259.3,
            261.7,
            252.3,
            210.1,
            125.7,
            119.6,
            119.6
          ],
          "wind_gust_set_1": [
            16,
            20.82,
            18.41,
            19.29,
            15.56,
            16,
            17.76,
            15.56,
            13.37,
            13.15,
            14.03,
            9.64,
            9.64
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
          "end": "2026-05-01T00:00:00Z"
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
            "1:00 PM",
            "2:00 PM",
            "3:00 PM",
            "4:00 PM",
            "5:00 PM",
            "6:00 PM",
            "6:00 PM"
          ],
          "air_temp_set_1": [
            27.3,
            26.9,
            29.3,
            29.1,
            26.7,
            26.8
          ],
          "wind_speed_set_1": [
            7.7,
            9.3,
            7.4,
            10.3,
            11.6,
            9.7,
            9.7
          ],
          "wind_direction_set_1": [
            305.5,
            313.1,
            334.9,
            327,
            321.5,
            313.4,
            313.4
          ],
          "wind_gust_set_1": [
            15.29,
            18.1,
            20.3,
            17.1,
            17.5,
            16.89,
            16.89
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
          "end": "2026-05-01T00:15:00Z"
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
            "3:30 PM",
            "3:45 PM",
            "4:00 PM",
            "4:15 PM",
            "4:30 PM",
            "4:45 PM",
            "5:00 PM",
            "5:15 PM",
            "5:30 PM",
            "5:45 PM",
            "6:00 PM",
            "6:15 PM",
            "6:15 PM"
          ],
          "air_temp_set_1": [
            32.59,
            31.61,
            30.14,
            32.47,
            32.35,
            31.86,
            31.86,
            31.85,
            32.34,
            33.32,
            34.3,
            34.54
          ],
          "wind_speed_set_1": [
            4.86,
            5.68,
            7.87,
            5.43,
            6.81,
            7.17,
            8.12,
            6.27,
            7.74,
            null,
            10.58,
            12.26,
            12.26
          ],
          "wind_direction_set_1": [
            336.7,
            307.9,
            342,
            13.4,
            348.7,
            354,
            6.21,
            19.63,
            33.99,
            27.87,
            27.77,
            22.3,
            22.3
          ],
          "wind_gust_set_1": [
            10.1,
            12.6,
            13.39,
            10.7,
            11.5,
            13,
            14.4,
            13,
            12.5,
            14.9,
            16.89,
            18,
            18
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
          "end": "2026-05-01T00:00:00Z"
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
            "3:15 PM",
            "3:30 PM",
            "3:45 PM",
            "4:00 PM",
            "4:15 PM",
            "4:30 PM",
            "4:45 PM",
            "5:00 PM",
            "5:15 PM",
            "5:30 PM",
            "5:45 PM",
            "6:00 PM",
            "6:00 PM"
          ],
          "air_temp_set_1": [
            28,
            28,
            29,
            28,
            26,
            26,
            28,
            26,
            25,
            27,
            27,
            26
          ],
          "wind_speed_set_1": [
            10,
            9,
            8,
            10,
            9,
            8,
            8,
            10,
            8,
            5.99,
            8,
            8,
            8
          ],
          "wind_direction_set_1": [
            0,
            0,
            337.5,
            337.5,
            337.5,
            292.5,
            315,
            0,
            315,
            315,
            337.5,
            292.5,
            292.5
          ],
          "wind_gust_set_1": [
            17,
            13.99,
            13.99,
            13.99,
            13.99,
            11,
            18,
            16,
            17,
            10,
            16,
            13,
            13
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
          "end": "2026-05-01T00:20:00Z"
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
            "5:30 PM",
            "5:35 PM",
            "5:40 PM",
            "5:45 PM",
            "5:50 PM",
            "5:55 PM",
            "6:00 PM",
            "6:05 PM",
            "6:10 PM",
            "6:15 PM",
            "6:20 PM",
            "6:25 PM",
            "6:25 PM"
          ],
          "air_temp_set_1": [
            57.14,
            56.99,
            57.42,
            57.36,
            57.41,
            57.77,
            57.27,
            57.14,
            57.47,
            57.12,
            57.2,
            57.02
          ],
          "wind_speed_set_1": [
            20.09,
            15.92,
            16.66,
            15.11,
            15.16,
            13.33,
            19.83,
            16.18,
            19.69,
            14.33,
            15.7,
            18.04,
            18.04
          ],
          "wind_direction_set_1": [
            348.56,
            4.98,
            358.87,
            2.63,
            351.35,
            344.51,
            10.86,
            7.33,
            0.16,
            4.74,
            357.44,
            349.02,
            349.02
          ],
          "wind_gust_set_1": [
            26.17,
            23.89,
            24.42,
            23.8,
            22.62,
            22.49,
            27.62,
            27,
            24.94,
            21.61,
            22.44,
            24.98,
            24.98
          ],
          "altimeter_set_1d": [
            30.12,
            30.12,
            30.12,
            30.12,
            30.13,
            30.12,
            30.12,
            30.12,
            30.12,
            30.12,
            30.12,
            30.12
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
          "end": "2026-05-01T00:00:00Z"
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
            "3:15 PM",
            "3:30 PM",
            "3:45 PM",
            "4:00 PM",
            "4:15 PM",
            "4:30 PM",
            "4:45 PM",
            "5:00 PM",
            "5:15 PM",
            "5:30 PM",
            "5:45 PM",
            "6:00 PM",
            "6:00 PM"
          ],
          "air_temp_set_1": [
            31.54,
            30.85,
            31.44,
            32.1,
            31.36,
            31.31,
            31,
            31.21,
            33.45,
            30.07,
            31.52,
            29.76
          ],
          "wind_speed_set_1": [
            4.23,
            7.07,
            4.06,
            4.82,
            7.41,
            5.81,
            5.78,
            7.22,
            3.14,
            7.26,
            6.61,
            7.34,
            7.34
          ],
          "wind_direction_set_1": [
            325.5,
            335.5,
            331.5,
            298.8,
            325.5,
            299.4,
            318.6,
            311.6,
            325.3,
            0.87,
            351.7,
            11.46,
            11.46
          ],
          "wind_gust_set_1": [
            11.4,
            11.48,
            13.19,
            12.52,
            13.79,
            13.34,
            9.91,
            11.4,
            8.21,
            14.75,
            12,
            12.52,
            12.52
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
          "end": "2026-05-01T00:15:00Z"
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
            "altimeter_set_1": {}
          }
        },
        "OBSERVATIONS": {
          "date_time": [
            "3:30 PM",
            "3:45 PM",
            "4:00 PM",
            "4:15 PM",
            "4:30 PM",
            "4:45 PM",
            "5:00 PM",
            "5:15 PM",
            "5:30 PM",
            "5:45 PM",
            "6:00 PM",
            "6:15 PM",
            "6:15 PM"
          ],
          "air_temp_set_1": [
            55,
            55,
            55,
            55,
            56,
            56,
            55,
            56,
            56,
            56,
            56,
            55
          ],
          "wind_speed_set_1": [
            1,
            7,
            4,
            5,
            4,
            5.99,
            5.99,
            2,
            5,
            4,
            5,
            8,
            8
          ],
          "wind_direction_set_1": [
            288,
            320,
            294,
            306,
            332,
            12,
            292,
            321,
            306,
            337,
            348,
            128,
            128
          ],
          "wind_gust_set_1": [
            11,
            14.01,
            12,
            14.99,
            10,
            11,
            13,
            11,
            12,
            10,
            13,
            19,
            19
          ],
          "altimeter_set_1": [
            30.02,
            30.02,
            30.01,
            30.01,
            30.01,
            30,
            29.99,
            29.99,
            29.99,
            29.99,
            30,
            30
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
          "end": "2026-05-01T00:10:00Z"
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
            "4:20 PM",
            "4:30 PM",
            "4:40 PM",
            "4:50 PM",
            "5:00 PM",
            "5:10 PM",
            "5:20 PM",
            "5:30 PM",
            "5:40 PM",
            "5:50 PM",
            "6:00 PM",
            "6:10 PM",
            "6:10 PM"
          ],
          "air_temp_set_1": [
            34.45,
            35.02,
            35.65,
            35.85,
            35.79,
            35.55,
            35.17,
            36.23,
            38.47,
            38.24,
            36.72,
            35.32
          ],
          "wind_speed_set_1": [
            3.65,
            2.98,
            3.81,
            1.85,
            1.62,
            1.86,
            4.72,
            1.39,
            3.12,
            2.89,
            3.44,
            3.02,
            3.02
          ],
          "wind_direction_set_1": [
            337.2,
            349,
            10.93,
            354.5,
            6.6,
            0.09,
            321.6,
            341.6,
            310.3,
            341.5,
            339.7,
            332.1,
            332.1
          ],
          "wind_gust_set_1": [
            9.69,
            7.46,
            7.2,
            6.58,
            5.47,
            7.46,
            11.92,
            4.72,
            8.69,
            8.45,
            10.68,
            7.57,
            7.57
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
          "end": "2026-05-01T00:00:00Z"
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
            "4:20 PM",
            "4:30 PM",
            "4:40 PM",
            "4:50 PM",
            "5:00 PM",
            "5:10 PM",
            "5:20 PM",
            "5:30 PM",
            "5:40 PM",
            "5:50 PM",
            "6:00 PM",
            "6:10 PM",
            "6:10 PM"
          ],
          "air_temp_set_1": [
            57.75,
            57.71,
            58,
            59.42,
            59.27,
            59.05,
            59.06,
            60.26,
            59.67,
            56.65,
            55.93,
            56.29
          ],
          "wind_speed_set_1": [
            5.87,
            5.68,
            11.5,
            9.46,
            10.03,
            6.4,
            9.26,
            7.14,
            7.81,
            11.5,
            7.49,
            3.89,
            3.89
          ],
          "wind_direction_set_1": [
            333.1,
            334.8,
            324.2,
            325.1,
            317.2,
            319.8,
            358.2,
            342.4,
            4.23,
            60.34,
            111.7,
            188.7,
            188.7
          ],
          "wind_gust_set_1": [
            15.12,
            11.17,
            17.76,
            16.22,
            17.54,
            14.68,
            14.91,
            13.59,
            13.37,
            21.92,
            14.25,
            14.91,
            14.91
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
      "METADATA_QUERY_TIME": "2.5 ms",
      "METADATA_PARSE_TIME": "0.2 ms",
      "TOTAL_METADATA_TIME": "2.7 ms",
      "DATA_QUERY_TIME": "5.7 ms",
      "QC_QUERY_TIME": "3.2 ms",
      "DATA_PARSE_TIME": "11.6 ms",
      "TOTAL_DATA_TIME": "20.5 ms",
      "TOTAL_TIME": "23.2 ms",
      "VERSION": "v2.33.0"
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
      "air_temp": "Fahrenheit",
      "wind_speed": "Miles/hour",
      "wind_direction": "Degrees",
      "altimeter": "INHG",
      "wind_gust": "Miles/hour"
    }
  },
  "sounding": {
    "date": "2026-04-30",
    "observations": [
      {
        "Altitude_ft": 4229,
        "Temp_c": 14,
        "Dewpoint_c": 1.7,
        "Wind_Direction": 316,
        "Wind_Speed_kt": 4.1
      },
      {
        "Altitude_ft": 4252,
        "Temp_c": 13.9,
        "Dewpoint_c": 1.2,
        "Wind_Direction": 73,
        "Wind_Speed_kt": 3.1
      },
      {
        "Altitude_ft": 4278,
        "Temp_c": 13.8,
        "Dewpoint_c": 0.7,
        "Wind_Direction": 72,
        "Wind_Speed_kt": 2.9
      },
      {
        "Altitude_ft": 4304,
        "Temp_c": 13.7,
        "Dewpoint_c": 0.2,
        "Wind_Direction": 72,
        "Wind_Speed_kt": 2.9
      },
      {
        "Altitude_ft": 4327,
        "Temp_c": 13.5,
        "Dewpoint_c": -0.4,
        "Wind_Direction": 71,
        "Wind_Speed_kt": 2.7
      },
      {
        "Altitude_ft": 4354,
        "Temp_c": 13.4,
        "Dewpoint_c": -0.9,
        "Wind_Direction": 71,
        "Wind_Speed_kt": 2.7
      },
      {
        "Altitude_ft": 4380,
        "Temp_c": 13.3,
        "Dewpoint_c": -1.4,
        "Wind_Direction": 70,
        "Wind_Speed_kt": 2.7
      },
      {
        "Altitude_ft": 4416,
        "Temp_c": 13.1,
        "Dewpoint_c": -2.2,
        "Wind_Direction": 64,
        "Wind_Speed_kt": 2.5
      },
      {
        "Altitude_ft": 4429,
        "Temp_c": 13.1,
        "Dewpoint_c": -2.2,
        "Wind_Direction": 60,
        "Wind_Speed_kt": 2.5
      },
      {
        "Altitude_ft": 4452,
        "Temp_c": 13,
        "Dewpoint_c": -2.2,
        "Wind_Direction": 50,
        "Wind_Speed_kt": 2.5
      },
      {
        "Altitude_ft": 4465,
        "Temp_c": 12.9,
        "Dewpoint_c": -2.2,
        "Wind_Direction": 32,
        "Wind_Speed_kt": 2.3
      },
      {
        "Altitude_ft": 4482,
        "Temp_c": 12.8,
        "Dewpoint_c": -2.1,
        "Wind_Direction": 360,
        "Wind_Speed_kt": 2.3
      },
      {
        "Altitude_ft": 4498,
        "Temp_c": 12.7,
        "Dewpoint_c": -2.1,
        "Wind_Direction": 327,
        "Wind_Speed_kt": 2.3
      },
      {
        "Altitude_ft": 4511,
        "Temp_c": 12.6,
        "Dewpoint_c": -2.1,
        "Wind_Direction": 307,
        "Wind_Speed_kt": 2.3
      },
      {
        "Altitude_ft": 4528,
        "Temp_c": 12.4,
        "Dewpoint_c": -2,
        "Wind_Direction": 296,
        "Wind_Speed_kt": 2.1
      },
      {
        "Altitude_ft": 4544,
        "Temp_c": 12.3,
        "Dewpoint_c": -2,
        "Wind_Direction": 289,
        "Wind_Speed_kt": 2.1
      },
      {
        "Altitude_ft": 4560,
        "Temp_c": 12.2,
        "Dewpoint_c": -2,
        "Wind_Direction": 291,
        "Wind_Speed_kt": 2.3
      },
      {
        "Altitude_ft": 4577,
        "Temp_c": 12.1,
        "Dewpoint_c": -2,
        "Wind_Direction": 292,
        "Wind_Speed_kt": 2.5
      },
      {
        "Altitude_ft": 4593,
        "Temp_c": 12,
        "Dewpoint_c": -2,
        "Wind_Direction": 293,
        "Wind_Speed_kt": 2.7
      },
      {
        "Altitude_ft": 4610,
        "Temp_c": 11.9,
        "Dewpoint_c": -1.9,
        "Wind_Direction": 294,
        "Wind_Speed_kt": 2.9
      },
      {
        "Altitude_ft": 4629,
        "Temp_c": 11.8,
        "Dewpoint_c": -1.9,
        "Wind_Direction": 295,
        "Wind_Speed_kt": 3.1
      },
      {
        "Altitude_ft": 4649,
        "Temp_c": 11.7,
        "Dewpoint_c": -1.9,
        "Wind_Direction": 296,
        "Wind_Speed_kt": 3.5
      },
      {
        "Altitude_ft": 4669,
        "Temp_c": 11.6,
        "Dewpoint_c": -1.8,
        "Wind_Direction": 297,
        "Wind_Speed_kt": 3.7
      },
      {
        "Altitude_ft": 4688,
        "Temp_c": 11.5,
        "Dewpoint_c": -1.8,
        "Wind_Direction": 297,
        "Wind_Speed_kt": 3.9
      },
      {
        "Altitude_ft": 4708,
        "Temp_c": 11.4,
        "Dewpoint_c": -1.8,
        "Wind_Direction": 298,
        "Wind_Speed_kt": 4.1
      },
      {
        "Altitude_ft": 4728,
        "Temp_c": 11.3,
        "Dewpoint_c": -1.7,
        "Wind_Direction": 298,
        "Wind_Speed_kt": 4.3
      },
      {
        "Altitude_ft": 4747,
        "Temp_c": 11.3,
        "Dewpoint_c": -1.7,
        "Wind_Direction": 298,
        "Wind_Speed_kt": 4.5
      },
      {
        "Altitude_ft": 4770,
        "Temp_c": 11.2,
        "Dewpoint_c": -1.7,
        "Wind_Direction": 299,
        "Wind_Speed_kt": 4.7
      },
      {
        "Altitude_ft": 4790,
        "Temp_c": 11.1,
        "Dewpoint_c": -1.6,
        "Wind_Direction": 299,
        "Wind_Speed_kt": 4.9
      },
      {
        "Altitude_ft": 4813,
        "Temp_c": 11,
        "Dewpoint_c": -1.6,
        "Wind_Direction": 301,
        "Wind_Speed_kt": 5.1
      },
      {
        "Altitude_ft": 4833,
        "Temp_c": 10.9,
        "Dewpoint_c": -1.6,
        "Wind_Direction": 304,
        "Wind_Speed_kt": 5.1
      },
      {
        "Altitude_ft": 4856,
        "Temp_c": 10.8,
        "Dewpoint_c": -1.6,
        "Wind_Direction": 306,
        "Wind_Speed_kt": 5.1
      },
      {
        "Altitude_ft": 4875,
        "Temp_c": 10.7,
        "Dewpoint_c": -1.5,
        "Wind_Direction": 308,
        "Wind_Speed_kt": 5.1
      },
      {
        "Altitude_ft": 4902,
        "Temp_c": 10.6,
        "Dewpoint_c": -1.5,
        "Wind_Direction": 311,
        "Wind_Speed_kt": 5.2
      },
      {
        "Altitude_ft": 4921,
        "Temp_c": 10.5,
        "Dewpoint_c": -1.5,
        "Wind_Direction": 312,
        "Wind_Speed_kt": 5.2
      },
      {
        "Altitude_ft": 4948,
        "Temp_c": 10.5,
        "Dewpoint_c": -1.5,
        "Wind_Direction": 315,
        "Wind_Speed_kt": 5.2
      },
      {
        "Altitude_ft": 4970,
        "Temp_c": 10.4,
        "Dewpoint_c": -1.5,
        "Wind_Direction": 317,
        "Wind_Speed_kt": 5.2
      },
      {
        "Altitude_ft": 4993,
        "Temp_c": 10.3,
        "Dewpoint_c": -1.6,
        "Wind_Direction": 319,
        "Wind_Speed_kt": 5.4
      },
      {
        "Altitude_ft": 5016,
        "Temp_c": 10.2,
        "Dewpoint_c": -1.6,
        "Wind_Direction": 321,
        "Wind_Speed_kt": 5.4
      },
      {
        "Altitude_ft": 5033,
        "Temp_c": 10.1,
        "Dewpoint_c": -1.6,
        "Wind_Direction": 323,
        "Wind_Speed_kt": 5.4
      },
      {
        "Altitude_ft": 5049,
        "Temp_c": 10.1,
        "Dewpoint_c": -1.6,
        "Wind_Direction": 325,
        "Wind_Speed_kt": 5.4
      },
      {
        "Altitude_ft": 5066,
        "Temp_c": 10,
        "Dewpoint_c": -1.6,
        "Wind_Direction": 327,
        "Wind_Speed_kt": 5.6
      },
      {
        "Altitude_ft": 5082,
        "Temp_c": 9.9,
        "Dewpoint_c": -1.7,
        "Wind_Direction": 329,
        "Wind_Speed_kt": 5.6
      },
      {
        "Altitude_ft": 5098,
        "Temp_c": 9.8,
        "Dewpoint_c": -1.7,
        "Wind_Direction": 331,
        "Wind_Speed_kt": 5.6
      },
      {
        "Altitude_ft": 5115,
        "Temp_c": 9.7,
        "Dewpoint_c": -1.7,
        "Wind_Direction": 333,
        "Wind_Speed_kt": 5.6
      },
      {
        "Altitude_ft": 5131,
        "Temp_c": 9.7,
        "Dewpoint_c": -1.7,
        "Wind_Direction": 334,
        "Wind_Speed_kt": 5.8
      },
      {
        "Altitude_ft": 5151,
        "Temp_c": 9.6,
        "Dewpoint_c": -1.7,
        "Wind_Direction": 334,
        "Wind_Speed_kt": 5.6
      },
      {
        "Altitude_ft": 5167,
        "Temp_c": 9.5,
        "Dewpoint_c": -1.8,
        "Wind_Direction": 334,
        "Wind_Speed_kt": 5.4
      },
      {
        "Altitude_ft": 5184,
        "Temp_c": 9.5,
        "Dewpoint_c": -1.7,
        "Wind_Direction": 333,
        "Wind_Speed_kt": 5.2
      },
      {
        "Altitude_ft": 5203,
        "Temp_c": 9.4,
        "Dewpoint_c": -1.7,
        "Wind_Direction": 333,
        "Wind_Speed_kt": 5.2
      },
      {
        "Altitude_ft": 5220,
        "Temp_c": 9.3,
        "Dewpoint_c": -1.7,
        "Wind_Direction": 332,
        "Wind_Speed_kt": 5.1
      },
      {
        "Altitude_ft": 5236,
        "Temp_c": 9.3,
        "Dewpoint_c": -1.7,
        "Wind_Direction": 332,
        "Wind_Speed_kt": 4.9
      },
      {
        "Altitude_ft": 5249,
        "Temp_c": 9.2,
        "Dewpoint_c": -1.7,
        "Wind_Direction": 331,
        "Wind_Speed_kt": 4.7
      },
      {
        "Altitude_ft": 5266,
        "Temp_c": 9.1,
        "Dewpoint_c": -1.7,
        "Wind_Direction": 331,
        "Wind_Speed_kt": 4.7
      },
      {
        "Altitude_ft": 5279,
        "Temp_c": 9.1,
        "Dewpoint_c": -1.7,
        "Wind_Direction": 330,
        "Wind_Speed_kt": 4.5
      },
      {
        "Altitude_ft": 5295,
        "Temp_c": 9,
        "Dewpoint_c": -1.6,
        "Wind_Direction": 330,
        "Wind_Speed_kt": 4.3
      },
      {
        "Altitude_ft": 5308,
        "Temp_c": 8.9,
        "Dewpoint_c": -1.6,
        "Wind_Direction": 329,
        "Wind_Speed_kt": 4.1
      },
      {
        "Altitude_ft": 5325,
        "Temp_c": 8.9,
        "Dewpoint_c": -1.6,
        "Wind_Direction": 329,
        "Wind_Speed_kt": 4.1
      },
      {
        "Altitude_ft": 5338,
        "Temp_c": 8.8,
        "Dewpoint_c": -1.6,
        "Wind_Direction": 328,
        "Wind_Speed_kt": 3.9
      },
      {
        "Altitude_ft": 5354,
        "Temp_c": 8.8,
        "Dewpoint_c": -1.6,
        "Wind_Direction": 327,
        "Wind_Speed_kt": 3.7
      },
      {
        "Altitude_ft": 5367,
        "Temp_c": 8.7,
        "Dewpoint_c": -1.6,
        "Wind_Direction": 326,
        "Wind_Speed_kt": 3.5
      },
      {
        "Altitude_ft": 5384,
        "Temp_c": 8.6,
        "Dewpoint_c": -1.6,
        "Wind_Direction": 325,
        "Wind_Speed_kt": 3.5
      },
      {
        "Altitude_ft": 5400,
        "Temp_c": 8.6,
        "Dewpoint_c": -1.6,
        "Wind_Direction": 324,
        "Wind_Speed_kt": 3.3
      },
      {
        "Altitude_ft": 5413,
        "Temp_c": 8.5,
        "Dewpoint_c": -1.6,
        "Wind_Direction": 323,
        "Wind_Speed_kt": 3.1
      },
      {
        "Altitude_ft": 5430,
        "Temp_c": 8.5,
        "Dewpoint_c": -1.6,
        "Wind_Direction": 322,
        "Wind_Speed_kt": 2.9
      },
      {
        "Altitude_ft": 5449,
        "Temp_c": 8.4,
        "Dewpoint_c": -1.6,
        "Wind_Direction": 321,
        "Wind_Speed_kt": 2.9
      },
      {
        "Altitude_ft": 5469,
        "Temp_c": 8.4,
        "Dewpoint_c": -1.6,
        "Wind_Direction": 321,
        "Wind_Speed_kt": 2.7
      },
      {
        "Altitude_ft": 5486,
        "Temp_c": 8.3,
        "Dewpoint_c": -1.6,
        "Wind_Direction": 321,
        "Wind_Speed_kt": 2.7
      },
      {
        "Altitude_ft": 5505,
        "Temp_c": 8.3,
        "Dewpoint_c": -1.6,
        "Wind_Direction": 320,
        "Wind_Speed_kt": 2.7
      },
      {
        "Altitude_ft": 5525,
        "Temp_c": 8.2,
        "Dewpoint_c": -1.5,
        "Wind_Direction": 320,
        "Wind_Speed_kt": 2.5
      },
      {
        "Altitude_ft": 5541,
        "Temp_c": 8.2,
        "Dewpoint_c": -1.5,
        "Wind_Direction": 320,
        "Wind_Speed_kt": 2.5
      },
      {
        "Altitude_ft": 5558,
        "Temp_c": 8.1,
        "Dewpoint_c": -1.5,
        "Wind_Direction": 320,
        "Wind_Speed_kt": 2.5
      },
      {
        "Altitude_ft": 5571,
        "Temp_c": 8.1,
        "Dewpoint_c": -1.5,
        "Wind_Direction": 320,
        "Wind_Speed_kt": 2.3
      },
      {
        "Altitude_ft": 5581,
        "Temp_c": 8,
        "Dewpoint_c": -1.5,
        "Wind_Direction": 320,
        "Wind_Speed_kt": 2.3
      },
      {
        "Altitude_ft": 5597,
        "Temp_c": 8,
        "Dewpoint_c": -1.6,
        "Wind_Direction": 320,
        "Wind_Speed_kt": 2.1
      },
      {
        "Altitude_ft": 5610,
        "Temp_c": 8,
        "Dewpoint_c": -1.7,
        "Wind_Direction": 320,
        "Wind_Speed_kt": 2.1
      },
      {
        "Altitude_ft": 5623,
        "Temp_c": 7.9,
        "Dewpoint_c": -1.8,
        "Wind_Direction": 320,
        "Wind_Speed_kt": 2.1
      },
      {
        "Altitude_ft": 5640,
        "Temp_c": 7.9,
        "Dewpoint_c": -1.9,
        "Wind_Direction": 319,
        "Wind_Speed_kt": 1.9
      },
      {
        "Altitude_ft": 5653,
        "Temp_c": 7.9,
        "Dewpoint_c": -2,
        "Wind_Direction": 319,
        "Wind_Speed_kt": 1.9
      },
      {
        "Altitude_ft": 5669,
        "Temp_c": 7.8,
        "Dewpoint_c": -2,
        "Wind_Direction": 319,
        "Wind_Speed_kt": 1.9
      },
      {
        "Altitude_ft": 5682,
        "Temp_c": 7.8,
        "Dewpoint_c": -2.1,
        "Wind_Direction": 319,
        "Wind_Speed_kt": 1.7
      },
      {
        "Altitude_ft": 5699,
        "Temp_c": 7.8,
        "Dewpoint_c": -2.2,
        "Wind_Direction": 319,
        "Wind_Speed_kt": 1.7
      },
      {
        "Altitude_ft": 5715,
        "Temp_c": 7.7,
        "Dewpoint_c": -2.3,
        "Wind_Direction": 318,
        "Wind_Speed_kt": 1.7
      },
      {
        "Altitude_ft": 5732,
        "Temp_c": 7.7,
        "Dewpoint_c": -2.4,
        "Wind_Direction": 318,
        "Wind_Speed_kt": 1.6
      },
      {
        "Altitude_ft": 5751,
        "Temp_c": 7.7,
        "Dewpoint_c": -2.4,
        "Wind_Direction": 318,
        "Wind_Speed_kt": 1.6
      },
      {
        "Altitude_ft": 5768,
        "Temp_c": 7.6,
        "Dewpoint_c": -2.5,
        "Wind_Direction": 318,
        "Wind_Speed_kt": 1.6
      },
      {
        "Altitude_ft": 5784,
        "Temp_c": 7.6,
        "Dewpoint_c": -2.6,
        "Wind_Direction": 319,
        "Wind_Speed_kt": 1.4
      },
      {
        "Altitude_ft": 5804,
        "Temp_c": 7.6,
        "Dewpoint_c": -2.7,
        "Wind_Direction": 320,
        "Wind_Speed_kt": 1.4
      },
      {
        "Altitude_ft": 5823,
        "Temp_c": 7.5,
        "Dewpoint_c": -2.8,
        "Wind_Direction": 322,
        "Wind_Speed_kt": 1.4
      },
      {
        "Altitude_ft": 5840,
        "Temp_c": 7.5,
        "Dewpoint_c": -2.9,
        "Wind_Direction": 324,
        "Wind_Speed_kt": 1.4
      },
      {
        "Altitude_ft": 5860,
        "Temp_c": 7.4,
        "Dewpoint_c": -3.1,
        "Wind_Direction": 327,
        "Wind_Speed_kt": 1.4
      },
      {
        "Altitude_ft": 5879,
        "Temp_c": 7.4,
        "Dewpoint_c": -3.2,
        "Wind_Direction": 330,
        "Wind_Speed_kt": 1.4
      },
      {
        "Altitude_ft": 5906,
        "Temp_c": 7.3,
        "Dewpoint_c": -3.3,
        "Wind_Direction": 336,
        "Wind_Speed_kt": 1.4
      },
      {
        "Altitude_ft": 5915,
        "Temp_c": 7.3,
        "Dewpoint_c": -3.4,
        "Wind_Direction": 339,
        "Wind_Speed_kt": 1.2
      },
      {
        "Altitude_ft": 5935,
        "Temp_c": 7.3,
        "Dewpoint_c": -3.5,
        "Wind_Direction": 345,
        "Wind_Speed_kt": 1.2
      },
      {
        "Altitude_ft": 5955,
        "Temp_c": 7.2,
        "Dewpoint_c": -3.6,
        "Wind_Direction": 354,
        "Wind_Speed_kt": 1.2
      },
      {
        "Altitude_ft": 5971,
        "Temp_c": 7.2,
        "Dewpoint_c": -3.8,
        "Wind_Direction": 6,
        "Wind_Speed_kt": 1.2
      },
      {
        "Altitude_ft": 5988,
        "Temp_c": 7.1,
        "Dewpoint_c": -3.9,
        "Wind_Direction": 20,
        "Wind_Speed_kt": 1.2
      },
      {
        "Altitude_ft": 6007,
        "Temp_c": 7.1,
        "Dewpoint_c": -4,
        "Wind_Direction": 36,
        "Wind_Speed_kt": 1.2
      },
      {
        "Altitude_ft": 6024,
        "Temp_c": 7,
        "Dewpoint_c": -4.1,
        "Wind_Direction": 52,
        "Wind_Speed_kt": 1.2
      },
      {
        "Altitude_ft": 6033,
        "Temp_c": 7,
        "Dewpoint_c": -4.2,
        "Wind_Direction": 59,
        "Wind_Speed_kt": 1
      },
      {
        "Altitude_ft": 6060,
        "Temp_c": 6.9,
        "Dewpoint_c": -4.2,
        "Wind_Direction": 75,
        "Wind_Speed_kt": 1
      },
      {
        "Altitude_ft": 6076,
        "Temp_c": 6.9,
        "Dewpoint_c": -4.3,
        "Wind_Direction": 83,
        "Wind_Speed_kt": 1
      },
      {
        "Altitude_ft": 6093,
        "Temp_c": 6.8,
        "Dewpoint_c": -4.3,
        "Wind_Direction": 88,
        "Wind_Speed_kt": 1
      },
      {
        "Altitude_ft": 6109,
        "Temp_c": 6.8,
        "Dewpoint_c": -4.3,
        "Wind_Direction": 93,
        "Wind_Speed_kt": 1
      },
      {
        "Altitude_ft": 6129,
        "Temp_c": 6.7,
        "Dewpoint_c": -4.3,
        "Wind_Direction": 96,
        "Wind_Speed_kt": 1
      },
      {
        "Altitude_ft": 6145,
        "Temp_c": 6.7,
        "Dewpoint_c": -4.4,
        "Wind_Direction": 94,
        "Wind_Speed_kt": 1
      },
      {
        "Altitude_ft": 6161,
        "Temp_c": 6.6,
        "Dewpoint_c": -4.4,
        "Wind_Direction": 92,
        "Wind_Speed_kt": 1
      },
      {
        "Altitude_ft": 6181,
        "Temp_c": 6.6,
        "Dewpoint_c": -4.4,
        "Wind_Direction": 91,
        "Wind_Speed_kt": 1.2
      },
      {
        "Altitude_ft": 6198,
        "Temp_c": 6.5,
        "Dewpoint_c": -4.5,
        "Wind_Direction": 89,
        "Wind_Speed_kt": 1.2
      },
      {
        "Altitude_ft": 6214,
        "Temp_c": 6.5,
        "Dewpoint_c": -4.5,
        "Wind_Direction": 88,
        "Wind_Speed_kt": 1.4
      },
      {
        "Altitude_ft": 6234,
        "Temp_c": 6.4,
        "Dewpoint_c": -4.5,
        "Wind_Direction": 87,
        "Wind_Speed_kt": 1.4
      },
      {
        "Altitude_ft": 6253,
        "Temp_c": 6.3,
        "Dewpoint_c": -4.6,
        "Wind_Direction": 86,
        "Wind_Speed_kt": 1.6
      },
      {
        "Altitude_ft": 6273,
        "Temp_c": 6.3,
        "Dewpoint_c": -4.6,
        "Wind_Direction": 85,
        "Wind_Speed_kt": 1.6
      },
      {
        "Altitude_ft": 6293,
        "Temp_c": 6.2,
        "Dewpoint_c": -4.6,
        "Wind_Direction": 84,
        "Wind_Speed_kt": 1.6
      },
      {
        "Altitude_ft": 6309,
        "Temp_c": 6.2,
        "Dewpoint_c": -4.7,
        "Wind_Direction": 83,
        "Wind_Speed_kt": 1.7
      },
      {
        "Altitude_ft": 6329,
        "Temp_c": 6.1,
        "Dewpoint_c": -4.7,
        "Wind_Direction": 83,
        "Wind_Speed_kt": 1.7
      },
      {
        "Altitude_ft": 6348,
        "Temp_c": 6.1,
        "Dewpoint_c": -4.7,
        "Wind_Direction": 82,
        "Wind_Speed_kt": 1.9
      },
      {
        "Altitude_ft": 6371,
        "Temp_c": 6,
        "Dewpoint_c": -4.8,
        "Wind_Direction": 81,
        "Wind_Speed_kt": 1.9
      },
      {
        "Altitude_ft": 6391,
        "Temp_c": 6,
        "Dewpoint_c": -4.8,
        "Wind_Direction": 81,
        "Wind_Speed_kt": 2.1
      },
      {
        "Altitude_ft": 6411,
        "Temp_c": 5.9,
        "Dewpoint_c": -4.8,
        "Wind_Direction": 81,
        "Wind_Speed_kt": 2.1
      },
      {
        "Altitude_ft": 6430,
        "Temp_c": 5.9,
        "Dewpoint_c": -4.8,
        "Wind_Direction": 80,
        "Wind_Speed_kt": 2.1
      },
      {
        "Altitude_ft": 6450,
        "Temp_c": 5.8,
        "Dewpoint_c": -4.9,
        "Wind_Direction": 80,
        "Wind_Speed_kt": 2.3
      },
      {
        "Altitude_ft": 6473,
        "Temp_c": 5.8,
        "Dewpoint_c": -4.9,
        "Wind_Direction": 79,
        "Wind_Speed_kt": 2.3
      },
      {
        "Altitude_ft": 6493,
        "Temp_c": 5.7,
        "Dewpoint_c": -4.9,
        "Wind_Direction": 79,
        "Wind_Speed_kt": 2.5
      },
      {
        "Altitude_ft": 6512,
        "Temp_c": 5.7,
        "Dewpoint_c": -4.9,
        "Wind_Direction": 79,
        "Wind_Speed_kt": 2.5
      },
      {
        "Altitude_ft": 6532,
        "Temp_c": 5.6,
        "Dewpoint_c": -5,
        "Wind_Direction": 78,
        "Wind_Speed_kt": 2.5
      },
      {
        "Altitude_ft": 6555,
        "Temp_c": 5.6,
        "Dewpoint_c": -5,
        "Wind_Direction": 77,
        "Wind_Speed_kt": 2.5
      },
      {
        "Altitude_ft": 6572,
        "Temp_c": 5.5,
        "Dewpoint_c": -5,
        "Wind_Direction": 76,
        "Wind_Speed_kt": 2.7
      },
      {
        "Altitude_ft": 6588,
        "Temp_c": 5.5,
        "Dewpoint_c": -5.1,
        "Wind_Direction": 76,
        "Wind_Speed_kt": 2.7
      },
      {
        "Altitude_ft": 6604,
        "Temp_c": 5.4,
        "Dewpoint_c": -5.1,
        "Wind_Direction": 75,
        "Wind_Speed_kt": 2.7
      },
      {
        "Altitude_ft": 6617,
        "Temp_c": 5.4,
        "Dewpoint_c": -5.1,
        "Wind_Direction": 74,
        "Wind_Speed_kt": 2.7
      },
      {
        "Altitude_ft": 6634,
        "Temp_c": 5.4,
        "Dewpoint_c": -5.2,
        "Wind_Direction": 74,
        "Wind_Speed_kt": 2.7
      },
      {
        "Altitude_ft": 6650,
        "Temp_c": 5.3,
        "Dewpoint_c": -5.2,
        "Wind_Direction": 73,
        "Wind_Speed_kt": 2.7
      },
      {
        "Altitude_ft": 6670,
        "Temp_c": 5.3,
        "Dewpoint_c": -5.2,
        "Wind_Direction": 72,
        "Wind_Speed_kt": 2.7
      },
      {
        "Altitude_ft": 6686,
        "Temp_c": 5.2,
        "Dewpoint_c": -5.3,
        "Wind_Direction": 72,
        "Wind_Speed_kt": 2.9
      },
      {
        "Altitude_ft": 6703,
        "Temp_c": 5.2,
        "Dewpoint_c": -5.3,
        "Wind_Direction": 71,
        "Wind_Speed_kt": 2.9
      },
      {
        "Altitude_ft": 6719,
        "Temp_c": 5.1,
        "Dewpoint_c": -5.3,
        "Wind_Direction": 70,
        "Wind_Speed_kt": 2.9
      },
      {
        "Altitude_ft": 6736,
        "Temp_c": 5.1,
        "Dewpoint_c": -5.4,
        "Wind_Direction": 70,
        "Wind_Speed_kt": 2.9
      },
      {
        "Altitude_ft": 6752,
        "Temp_c": 5,
        "Dewpoint_c": -5.4,
        "Wind_Direction": 69,
        "Wind_Speed_kt": 2.9
      },
      {
        "Altitude_ft": 6772,
        "Temp_c": 5,
        "Dewpoint_c": -5.4,
        "Wind_Direction": 69,
        "Wind_Speed_kt": 2.9
      },
      {
        "Altitude_ft": 6788,
        "Temp_c": 4.9,
        "Dewpoint_c": -5.5,
        "Wind_Direction": 68,
        "Wind_Speed_kt": 3.1
      },
      {
        "Altitude_ft": 6808,
        "Temp_c": 4.9,
        "Dewpoint_c": -5.5,
        "Wind_Direction": 67,
        "Wind_Speed_kt": 3.1
      },
      {
        "Altitude_ft": 6827,
        "Temp_c": 4.8,
        "Dewpoint_c": -5.5,
        "Wind_Direction": 67,
        "Wind_Speed_kt": 3.1
      },
      {
        "Altitude_ft": 6844,
        "Temp_c": 4.7,
        "Dewpoint_c": -5.6,
        "Wind_Direction": 66,
        "Wind_Speed_kt": 3.1
      },
      {
        "Altitude_ft": 6864,
        "Temp_c": 4.7,
        "Dewpoint_c": -5.6,
        "Wind_Direction": 66,
        "Wind_Speed_kt": 3.1
      },
      {
        "Altitude_ft": 6890,
        "Temp_c": 4.6,
        "Dewpoint_c": -5.7,
        "Wind_Direction": 65,
        "Wind_Speed_kt": 3.3
      },
      {
        "Altitude_ft": 6903,
        "Temp_c": 4.6,
        "Dewpoint_c": -5.7,
        "Wind_Direction": 65,
        "Wind_Speed_kt": 3.3
      },
      {
        "Altitude_ft": 6923,
        "Temp_c": 4.5,
        "Dewpoint_c": -5.8,
        "Wind_Direction": 65,
        "Wind_Speed_kt": 3.3
      },
      {
        "Altitude_ft": 6939,
        "Temp_c": 4.4,
        "Dewpoint_c": -5.8,
        "Wind_Direction": 65,
        "Wind_Speed_kt": 3.3
      },
      {
        "Altitude_ft": 6959,
        "Temp_c": 4.4,
        "Dewpoint_c": -5.8,
        "Wind_Direction": 64,
        "Wind_Speed_kt": 3.3
      },
      {
        "Altitude_ft": 6978,
        "Temp_c": 4.3,
        "Dewpoint_c": -5.9,
        "Wind_Direction": 64,
        "Wind_Speed_kt": 3.3
      },
      {
        "Altitude_ft": 6998,
        "Temp_c": 4.2,
        "Dewpoint_c": -5.9,
        "Wind_Direction": 64,
        "Wind_Speed_kt": 3.3
      },
      {
        "Altitude_ft": 7028,
        "Temp_c": 4.2,
        "Dewpoint_c": -6,
        "Wind_Direction": 63,
        "Wind_Speed_kt": 3.5
      },
      {
        "Altitude_ft": 7037,
        "Temp_c": 4.1,
        "Dewpoint_c": -6,
        "Wind_Direction": 63,
        "Wind_Speed_kt": 3.5
      },
      {
        "Altitude_ft": 7060,
        "Temp_c": 4.1,
        "Dewpoint_c": -6.1,
        "Wind_Direction": 63,
        "Wind_Speed_kt": 3.5
      },
      {
        "Altitude_ft": 7080,
        "Temp_c": 4,
        "Dewpoint_c": -6.2,
        "Wind_Direction": 62,
        "Wind_Speed_kt": 3.5
      },
      {
        "Altitude_ft": 7103,
        "Temp_c": 4,
        "Dewpoint_c": -6.2,
        "Wind_Direction": 62,
        "Wind_Speed_kt": 3.5
      },
      {
        "Altitude_ft": 7123,
        "Temp_c": 3.9,
        "Dewpoint_c": -6.3,
        "Wind_Direction": 62,
        "Wind_Speed_kt": 3.5
      },
      {
        "Altitude_ft": 7146,
        "Temp_c": 3.9,
        "Dewpoint_c": -6.4,
        "Wind_Direction": 62,
        "Wind_Speed_kt": 3.7
      },
      {
        "Altitude_ft": 7165,
        "Temp_c": 3.8,
        "Dewpoint_c": -6.4,
        "Wind_Direction": 61,
        "Wind_Speed_kt": 3.7
      },
      {
        "Altitude_ft": 7185,
        "Temp_c": 3.8,
        "Dewpoint_c": -6.5,
        "Wind_Direction": 61,
        "Wind_Speed_kt": 3.7
      },
      {
        "Altitude_ft": 7208,
        "Temp_c": 3.8,
        "Dewpoint_c": -6.6,
        "Wind_Direction": 61,
        "Wind_Speed_kt": 3.7
      },
      {
        "Altitude_ft": 7228,
        "Temp_c": 3.7,
        "Dewpoint_c": -6.6,
        "Wind_Direction": 61,
        "Wind_Speed_kt": 3.7
      },
      {
        "Altitude_ft": 7247,
        "Temp_c": 3.7,
        "Dewpoint_c": -6.7,
        "Wind_Direction": 60,
        "Wind_Speed_kt": 3.7
      },
      {
        "Altitude_ft": 7267,
        "Temp_c": 3.6,
        "Dewpoint_c": -6.8,
        "Wind_Direction": 60,
        "Wind_Speed_kt": 3.9
      },
      {
        "Altitude_ft": 7290,
        "Temp_c": 3.6,
        "Dewpoint_c": -6.8,
        "Wind_Direction": 58,
        "Wind_Speed_kt": 3.9
      },
      {
        "Altitude_ft": 7310,
        "Temp_c": 3.5,
        "Dewpoint_c": -6.9,
        "Wind_Direction": 56,
        "Wind_Speed_kt": 3.9
      },
      {
        "Altitude_ft": 7329,
        "Temp_c": 3.5,
        "Dewpoint_c": -7,
        "Wind_Direction": 54,
        "Wind_Speed_kt": 4.1
      },
      {
        "Altitude_ft": 7346,
        "Temp_c": 3.4,
        "Dewpoint_c": -7,
        "Wind_Direction": 52,
        "Wind_Speed_kt": 4.1
      },
      {
        "Altitude_ft": 7365,
        "Temp_c": 3.4,
        "Dewpoint_c": -7.1,
        "Wind_Direction": 51,
        "Wind_Speed_kt": 4.1
      },
      {
        "Altitude_ft": 7385,
        "Temp_c": 3.3,
        "Dewpoint_c": -7.1,
        "Wind_Direction": 49,
        "Wind_Speed_kt": 4.1
      },
      {
        "Altitude_ft": 7405,
        "Temp_c": 3.3,
        "Dewpoint_c": -7.2,
        "Wind_Direction": 47,
        "Wind_Speed_kt": 4.3
      },
      {
        "Altitude_ft": 7421,
        "Temp_c": 3.3,
        "Dewpoint_c": -7.2,
        "Wind_Direction": 45,
        "Wind_Speed_kt": 4.3
      },
      {
        "Altitude_ft": 7441,
        "Temp_c": 3.2,
        "Dewpoint_c": -7.3,
        "Wind_Direction": 44,
        "Wind_Speed_kt": 4.3
      },
      {
        "Altitude_ft": 7461,
        "Temp_c": 3.2,
        "Dewpoint_c": -7.3,
        "Wind_Direction": 42,
        "Wind_Speed_kt": 4.5
      },
      {
        "Altitude_ft": 7477,
        "Temp_c": 3.1,
        "Dewpoint_c": -7.4,
        "Wind_Direction": 41,
        "Wind_Speed_kt": 4.5
      },
      {
        "Altitude_ft": 7497,
        "Temp_c": 3.1,
        "Dewpoint_c": -7.4,
        "Wind_Direction": 39,
        "Wind_Speed_kt": 4.5
      },
      {
        "Altitude_ft": 7513,
        "Temp_c": 3,
        "Dewpoint_c": -7.5,
        "Wind_Direction": 38,
        "Wind_Speed_kt": 4.7
      },
      {
        "Altitude_ft": 7533,
        "Temp_c": 3,
        "Dewpoint_c": -7.5,
        "Wind_Direction": 36,
        "Wind_Speed_kt": 4.7
      },
      {
        "Altitude_ft": 7556,
        "Temp_c": 2.9,
        "Dewpoint_c": -7.6,
        "Wind_Direction": 34,
        "Wind_Speed_kt": 4.7
      },
      {
        "Altitude_ft": 7566,
        "Temp_c": 2.9,
        "Dewpoint_c": -7.6,
        "Wind_Direction": 33,
        "Wind_Speed_kt": 4.9
      },
      {
        "Altitude_ft": 7582,
        "Temp_c": 2.8,
        "Dewpoint_c": -7.7,
        "Wind_Direction": 32,
        "Wind_Speed_kt": 4.9
      },
      {
        "Altitude_ft": 7602,
        "Temp_c": 2.8,
        "Dewpoint_c": -7.7,
        "Wind_Direction": 31,
        "Wind_Speed_kt": 4.9
      },
      {
        "Altitude_ft": 7618,
        "Temp_c": 2.7,
        "Dewpoint_c": -7.7,
        "Wind_Direction": 30,
        "Wind_Speed_kt": 4.9
      },
      {
        "Altitude_ft": 7635,
        "Temp_c": 2.7,
        "Dewpoint_c": -7.7,
        "Wind_Direction": 29,
        "Wind_Speed_kt": 5.1
      },
      {
        "Altitude_ft": 7651,
        "Temp_c": 2.6,
        "Dewpoint_c": -7.8,
        "Wind_Direction": 28,
        "Wind_Speed_kt": 5.1
      },
      {
        "Altitude_ft": 7667,
        "Temp_c": 2.6,
        "Dewpoint_c": -7.8,
        "Wind_Direction": 28,
        "Wind_Speed_kt": 5.1
      },
      {
        "Altitude_ft": 7687,
        "Temp_c": 2.5,
        "Dewpoint_c": -7.8,
        "Wind_Direction": 27,
        "Wind_Speed_kt": 5.1
      },
      {
        "Altitude_ft": 7703,
        "Temp_c": 2.5,
        "Dewpoint_c": -7.8,
        "Wind_Direction": 26,
        "Wind_Speed_kt": 5.1
      },
      {
        "Altitude_ft": 7723,
        "Temp_c": 2.4,
        "Dewpoint_c": -7.9,
        "Wind_Direction": 26,
        "Wind_Speed_kt": 5.1
      },
      {
        "Altitude_ft": 7743,
        "Temp_c": 2.4,
        "Dewpoint_c": -7.9,
        "Wind_Direction": 25,
        "Wind_Speed_kt": 5.2
      },
      {
        "Altitude_ft": 7762,
        "Temp_c": 2.3,
        "Dewpoint_c": -7.9,
        "Wind_Direction": 25,
        "Wind_Speed_kt": 5.2
      },
      {
        "Altitude_ft": 7782,
        "Temp_c": 2.3,
        "Dewpoint_c": -8,
        "Wind_Direction": 24,
        "Wind_Speed_kt": 5.2
      },
      {
        "Altitude_ft": 7802,
        "Temp_c": 2.2,
        "Dewpoint_c": -8,
        "Wind_Direction": 24,
        "Wind_Speed_kt": 5.2
      },
      {
        "Altitude_ft": 7822,
        "Temp_c": 2.2,
        "Dewpoint_c": -8,
        "Wind_Direction": 23,
        "Wind_Speed_kt": 5.2
      },
      {
        "Altitude_ft": 7838,
        "Temp_c": 2.1,
        "Dewpoint_c": -8,
        "Wind_Direction": 23,
        "Wind_Speed_kt": 5.2
      },
      {
        "Altitude_ft": 7854,
        "Temp_c": 2.1,
        "Dewpoint_c": -8.1,
        "Wind_Direction": 22,
        "Wind_Speed_kt": 5.2
      },
      {
        "Altitude_ft": 7874,
        "Temp_c": 2,
        "Dewpoint_c": -8.1,
        "Wind_Direction": 22,
        "Wind_Speed_kt": 5.4
      },
      {
        "Altitude_ft": 7890,
        "Temp_c": 2,
        "Dewpoint_c": -8.1,
        "Wind_Direction": 21,
        "Wind_Speed_kt": 5.4
      },
      {
        "Altitude_ft": 7907,
        "Temp_c": 1.9,
        "Dewpoint_c": -8.2,
        "Wind_Direction": 21,
        "Wind_Speed_kt": 5.4
      },
      {
        "Altitude_ft": 7923,
        "Temp_c": 1.9,
        "Dewpoint_c": -8.2,
        "Wind_Direction": 21,
        "Wind_Speed_kt": 5.4
      },
      {
        "Altitude_ft": 7940,
        "Temp_c": 1.9,
        "Dewpoint_c": -8.2,
        "Wind_Direction": 20,
        "Wind_Speed_kt": 5.4
      },
      {
        "Altitude_ft": 7956,
        "Temp_c": 1.8,
        "Dewpoint_c": -8.2,
        "Wind_Direction": 20,
        "Wind_Speed_kt": 5.4
      },
      {
        "Altitude_ft": 7969,
        "Temp_c": 1.8,
        "Dewpoint_c": -8.3,
        "Wind_Direction": 19,
        "Wind_Speed_kt": 5.6
      },
      {
        "Altitude_ft": 7986,
        "Temp_c": 1.7,
        "Dewpoint_c": -8.3,
        "Wind_Direction": 19,
        "Wind_Speed_kt": 5.6
      },
      {
        "Altitude_ft": 8005,
        "Temp_c": 1.7,
        "Dewpoint_c": -8.3,
        "Wind_Direction": 19,
        "Wind_Speed_kt": 5.6
      },
      {
        "Altitude_ft": 8025,
        "Temp_c": 1.6,
        "Dewpoint_c": -8.3,
        "Wind_Direction": 19,
        "Wind_Speed_kt": 5.6
      },
      {
        "Altitude_ft": 8048,
        "Temp_c": 1.6,
        "Dewpoint_c": -8.4,
        "Wind_Direction": 19,
        "Wind_Speed_kt": 5.6
      },
      {
        "Altitude_ft": 8068,
        "Temp_c": 1.5,
        "Dewpoint_c": -8.4,
        "Wind_Direction": 19,
        "Wind_Speed_kt": 5.6
      },
      {
        "Altitude_ft": 8087,
        "Temp_c": 1.5,
        "Dewpoint_c": -8.4,
        "Wind_Direction": 20,
        "Wind_Speed_kt": 5.6
      },
      {
        "Altitude_ft": 8107,
        "Temp_c": 1.4,
        "Dewpoint_c": -8.4,
        "Wind_Direction": 20,
        "Wind_Speed_kt": 5.6
      },
      {
        "Altitude_ft": 8127,
        "Temp_c": 1.4,
        "Dewpoint_c": -8.4,
        "Wind_Direction": 20,
        "Wind_Speed_kt": 5.6
      },
      {
        "Altitude_ft": 8143,
        "Temp_c": 1.4,
        "Dewpoint_c": -8.5,
        "Wind_Direction": 20,
        "Wind_Speed_kt": 5.6
      },
      {
        "Altitude_ft": 8163,
        "Temp_c": 1.3,
        "Dewpoint_c": -8.5,
        "Wind_Direction": 20,
        "Wind_Speed_kt": 5.8
      },
      {
        "Altitude_ft": 8179,
        "Temp_c": 1.3,
        "Dewpoint_c": -8.5,
        "Wind_Direction": 20,
        "Wind_Speed_kt": 5.8
      },
      {
        "Altitude_ft": 8199,
        "Temp_c": 1.2,
        "Dewpoint_c": -8.5,
        "Wind_Direction": 20,
        "Wind_Speed_kt": 5.8
      },
      {
        "Altitude_ft": 8215,
        "Temp_c": 1.2,
        "Dewpoint_c": -8.5,
        "Wind_Direction": 21,
        "Wind_Speed_kt": 5.8
      },
      {
        "Altitude_ft": 8232,
        "Temp_c": 1.1,
        "Dewpoint_c": -8.5,
        "Wind_Direction": 21,
        "Wind_Speed_kt": 5.8
      },
      {
        "Altitude_ft": 8248,
        "Temp_c": 1.1,
        "Dewpoint_c": -8.6,
        "Wind_Direction": 21,
        "Wind_Speed_kt": 5.8
      },
      {
        "Altitude_ft": 8264,
        "Temp_c": 1,
        "Dewpoint_c": -8.6,
        "Wind_Direction": 21,
        "Wind_Speed_kt": 5.8
      },
      {
        "Altitude_ft": 8281,
        "Temp_c": 1,
        "Dewpoint_c": -8.6,
        "Wind_Direction": 21,
        "Wind_Speed_kt": 5.8
      },
      {
        "Altitude_ft": 8294,
        "Temp_c": 1,
        "Dewpoint_c": -8.6,
        "Wind_Direction": 21,
        "Wind_Speed_kt": 5.8
      },
      {
        "Altitude_ft": 8310,
        "Temp_c": 0.9,
        "Dewpoint_c": -8.6,
        "Wind_Direction": 22,
        "Wind_Speed_kt": 5.8
      },
      {
        "Altitude_ft": 8327,
        "Temp_c": 0.9,
        "Dewpoint_c": -8.6,
        "Wind_Direction": 22,
        "Wind_Speed_kt": 5.8
      },
      {
        "Altitude_ft": 8340,
        "Temp_c": 0.9,
        "Dewpoint_c": -8.6,
        "Wind_Direction": 22,
        "Wind_Speed_kt": 5.8
      },
      {
        "Altitude_ft": 8356,
        "Temp_c": 0.8,
        "Dewpoint_c": -8.7,
        "Wind_Direction": 23,
        "Wind_Speed_kt": 6
      },
      {
        "Altitude_ft": 8369,
        "Temp_c": 0.8,
        "Dewpoint_c": -8.7,
        "Wind_Direction": 24,
        "Wind_Speed_kt": 6
      },
      {
        "Altitude_ft": 8383,
        "Temp_c": 0.8,
        "Dewpoint_c": -8.7,
        "Wind_Direction": 24,
        "Wind_Speed_kt": 6
      },
      {
        "Altitude_ft": 8399,
        "Temp_c": 0.7,
        "Dewpoint_c": -8.7,
        "Wind_Direction": 25,
        "Wind_Speed_kt": 6
      },
      {
        "Altitude_ft": 8415,
        "Temp_c": 0.7,
        "Dewpoint_c": -8.7,
        "Wind_Direction": 26,
        "Wind_Speed_kt": 6.2
      },
      {
        "Altitude_ft": 8432,
        "Temp_c": 0.7,
        "Dewpoint_c": -8.7,
        "Wind_Direction": 27,
        "Wind_Speed_kt": 6.2
      },
      {
        "Altitude_ft": 8448,
        "Temp_c": 0.6,
        "Dewpoint_c": -8.7,
        "Wind_Direction": 28,
        "Wind_Speed_kt": 6.2
      },
      {
        "Altitude_ft": 8461,
        "Temp_c": 0.6,
        "Dewpoint_c": -8.7,
        "Wind_Direction": 29,
        "Wind_Speed_kt": 6.2
      },
      {
        "Altitude_ft": 8478,
        "Temp_c": 0.6,
        "Dewpoint_c": -8.8,
        "Wind_Direction": 29,
        "Wind_Speed_kt": 6.2
      },
      {
        "Altitude_ft": 8494,
        "Temp_c": 0.5,
        "Dewpoint_c": -8.8,
        "Wind_Direction": 30,
        "Wind_Speed_kt": 6.4
      },
      {
        "Altitude_ft": 8510,
        "Temp_c": 0.5,
        "Dewpoint_c": -8.8,
        "Wind_Direction": 31,
        "Wind_Speed_kt": 6.4
      },
      {
        "Altitude_ft": 8527,
        "Temp_c": 0.4,
        "Dewpoint_c": -8.9,
        "Wind_Direction": 32,
        "Wind_Speed_kt": 6.4
      },
      {
        "Altitude_ft": 8543,
        "Temp_c": 0.4,
        "Dewpoint_c": -8.9,
        "Wind_Direction": 32,
        "Wind_Speed_kt": 6.6
      },
      {
        "Altitude_ft": 8560,
        "Temp_c": 0.3,
        "Dewpoint_c": -8.9,
        "Wind_Direction": 33,
        "Wind_Speed_kt": 6.6
      },
      {
        "Altitude_ft": 8576,
        "Temp_c": 0.3,
        "Dewpoint_c": -9,
        "Wind_Direction": 34,
        "Wind_Speed_kt": 6.6
      },
      {
        "Altitude_ft": 8596,
        "Temp_c": 0.2,
        "Dewpoint_c": -9,
        "Wind_Direction": 35,
        "Wind_Speed_kt": 6.6
      },
      {
        "Altitude_ft": 8612,
        "Temp_c": 0.2,
        "Dewpoint_c": -9.1,
        "Wind_Direction": 35,
        "Wind_Speed_kt": 6.8
      },
      {
        "Altitude_ft": 8632,
        "Temp_c": 0.1,
        "Dewpoint_c": -9.1,
        "Wind_Direction": 36,
        "Wind_Speed_kt": 6.8
      },
      {
        "Altitude_ft": 8648,
        "Temp_c": 0.1,
        "Dewpoint_c": -9.1,
        "Wind_Direction": 37,
        "Wind_Speed_kt": 6.8
      },
      {
        "Altitude_ft": 8668,
        "Temp_c": 0,
        "Dewpoint_c": -9.2,
        "Wind_Direction": 37,
        "Wind_Speed_kt": 7
      },
      {
        "Altitude_ft": 8684,
        "Temp_c": 0,
        "Dewpoint_c": -9.2,
        "Wind_Direction": 38,
        "Wind_Speed_kt": 7
      },
      {
        "Altitude_ft": 8701,
        "Temp_c": -0.1,
        "Dewpoint_c": -9.3,
        "Wind_Direction": 38,
        "Wind_Speed_kt": 7
      },
      {
        "Altitude_ft": 8711,
        "Temp_c": -0.1,
        "Dewpoint_c": -9.3,
        "Wind_Direction": 38,
        "Wind_Speed_kt": 7
      },
      {
        "Altitude_ft": 8737,
        "Temp_c": -0.2,
        "Dewpoint_c": -9.4,
        "Wind_Direction": 38,
        "Wind_Speed_kt": 7
      },
      {
        "Altitude_ft": 8753,
        "Temp_c": -0.2,
        "Dewpoint_c": -9.4,
        "Wind_Direction": 39,
        "Wind_Speed_kt": 7
      },
      {
        "Altitude_ft": 8773,
        "Temp_c": -0.3,
        "Dewpoint_c": -9.5,
        "Wind_Direction": 39,
        "Wind_Speed_kt": 7.2
      },
      {
        "Altitude_ft": 8789,
        "Temp_c": -0.3,
        "Dewpoint_c": -9.5,
        "Wind_Direction": 39,
        "Wind_Speed_kt": 7.2
      },
      {
        "Altitude_ft": 8806,
        "Temp_c": -0.3,
        "Dewpoint_c": -9.6,
        "Wind_Direction": 39,
        "Wind_Speed_kt": 7.2
      },
      {
        "Altitude_ft": 8822,
        "Temp_c": -0.4,
        "Dewpoint_c": -9.6,
        "Wind_Direction": 40,
        "Wind_Speed_kt": 7.2
      },
      {
        "Altitude_ft": 8839,
        "Temp_c": -0.4,
        "Dewpoint_c": -9.6,
        "Wind_Direction": 40,
        "Wind_Speed_kt": 7.2
      },
      {
        "Altitude_ft": 8855,
        "Temp_c": -0.5,
        "Dewpoint_c": -9.7,
        "Wind_Direction": 40,
        "Wind_Speed_kt": 7.2
      },
      {
        "Altitude_ft": 8875,
        "Temp_c": -0.5,
        "Dewpoint_c": -9.7,
        "Wind_Direction": 40,
        "Wind_Speed_kt": 7.4
      },
      {
        "Altitude_ft": 8891,
        "Temp_c": -0.6,
        "Dewpoint_c": -9.8,
        "Wind_Direction": 41,
        "Wind_Speed_kt": 7.4
      },
      {
        "Altitude_ft": 8907,
        "Temp_c": -0.6,
        "Dewpoint_c": -9.8,
        "Wind_Direction": 41,
        "Wind_Speed_kt": 7.4
      },
      {
        "Altitude_ft": 8924,
        "Temp_c": -0.7,
        "Dewpoint_c": -9.9,
        "Wind_Direction": 41,
        "Wind_Speed_kt": 7.4
      },
      {
        "Altitude_ft": 8940,
        "Temp_c": -0.7,
        "Dewpoint_c": -9.9,
        "Wind_Direction": 41,
        "Wind_Speed_kt": 7.4
      },
      {
        "Altitude_ft": 8960,
        "Temp_c": -0.8,
        "Dewpoint_c": -10,
        "Wind_Direction": 42,
        "Wind_Speed_kt": 7.4
      },
      {
        "Altitude_ft": 8976,
        "Temp_c": -0.8,
        "Dewpoint_c": -10,
        "Wind_Direction": 42,
        "Wind_Speed_kt": 7.6
      },
      {
        "Altitude_ft": 8996,
        "Temp_c": -0.8,
        "Dewpoint_c": -10.1,
        "Wind_Direction": 42,
        "Wind_Speed_kt": 7.6
      },
      {
        "Altitude_ft": 9012,
        "Temp_c": -0.9,
        "Dewpoint_c": -10.2,
        "Wind_Direction": 42,
        "Wind_Speed_kt": 7.6
      },
      {
        "Altitude_ft": 9032,
        "Temp_c": -0.9,
        "Dewpoint_c": -10.2,
        "Wind_Direction": 42,
        "Wind_Speed_kt": 7.6
      },
      {
        "Altitude_ft": 9049,
        "Temp_c": -1,
        "Dewpoint_c": -10.3,
        "Wind_Direction": 42,
        "Wind_Speed_kt": 7.6
      },
      {
        "Altitude_ft": 9068,
        "Temp_c": -1,
        "Dewpoint_c": -10.3,
        "Wind_Direction": 41,
        "Wind_Speed_kt": 7.8
      },
      {
        "Altitude_ft": 9085,
        "Temp_c": -1.1,
        "Dewpoint_c": -10.4,
        "Wind_Direction": 41,
        "Wind_Speed_kt": 7.8
      },
      {
        "Altitude_ft": 9101,
        "Temp_c": -1.1,
        "Dewpoint_c": -10.5,
        "Wind_Direction": 41,
        "Wind_Speed_kt": 7.8
      },
      {
        "Altitude_ft": 9121,
        "Temp_c": -1.2,
        "Dewpoint_c": -10.5,
        "Wind_Direction": 40,
        "Wind_Speed_kt": 7.8
      },
      {
        "Altitude_ft": 9137,
        "Temp_c": -1.2,
        "Dewpoint_c": -10.6,
        "Wind_Direction": 40,
        "Wind_Speed_kt": 7.8
      },
      {
        "Altitude_ft": 9154,
        "Temp_c": -1.3,
        "Dewpoint_c": -10.6,
        "Wind_Direction": 40,
        "Wind_Speed_kt": 8
      },
      {
        "Altitude_ft": 9170,
        "Temp_c": -1.3,
        "Dewpoint_c": -10.7,
        "Wind_Direction": 39,
        "Wind_Speed_kt": 8
      },
      {
        "Altitude_ft": 9183,
        "Temp_c": -1.4,
        "Dewpoint_c": -10.8,
        "Wind_Direction": 39,
        "Wind_Speed_kt": 8
      },
      {
        "Altitude_ft": 9199,
        "Temp_c": -1.4,
        "Dewpoint_c": -10.9,
        "Wind_Direction": 39,
        "Wind_Speed_kt": 8
      },
      {
        "Altitude_ft": 9216,
        "Temp_c": -1.5,
        "Dewpoint_c": -10.9,
        "Wind_Direction": 39,
        "Wind_Speed_kt": 8.2
      },
      {
        "Altitude_ft": 9229,
        "Temp_c": -1.5,
        "Dewpoint_c": -11,
        "Wind_Direction": 38,
        "Wind_Speed_kt": 8.2
      },
      {
        "Altitude_ft": 9245,
        "Temp_c": -1.6,
        "Dewpoint_c": -11.1,
        "Wind_Direction": 38,
        "Wind_Speed_kt": 8.2
      },
      {
        "Altitude_ft": 9262,
        "Temp_c": -1.6,
        "Dewpoint_c": -11.2,
        "Wind_Direction": 38,
        "Wind_Speed_kt": 8.2
      },
      {
        "Altitude_ft": 9278,
        "Temp_c": -1.6,
        "Dewpoint_c": -11.3,
        "Wind_Direction": 37,
        "Wind_Speed_kt": 8.2
      },
      {
        "Altitude_ft": 9295,
        "Temp_c": -1.7,
        "Dewpoint_c": -11.4,
        "Wind_Direction": 37,
        "Wind_Speed_kt": 8.4
      },
      {
        "Altitude_ft": 9311,
        "Temp_c": -1.7,
        "Dewpoint_c": -11.4,
        "Wind_Direction": 37,
        "Wind_Speed_kt": 8.4
      },
      {
        "Altitude_ft": 9331,
        "Temp_c": -1.8,
        "Dewpoint_c": -11.5,
        "Wind_Direction": 37,
        "Wind_Speed_kt": 8.4
      },
      {
        "Altitude_ft": 9347,
        "Temp_c": -1.8,
        "Dewpoint_c": -11.6,
        "Wind_Direction": 36,
        "Wind_Speed_kt": 8.4
      },
      {
        "Altitude_ft": 9364,
        "Temp_c": -1.9,
        "Dewpoint_c": -11.7,
        "Wind_Direction": 35,
        "Wind_Speed_kt": 8.6
      },
      {
        "Altitude_ft": 9383,
        "Temp_c": -1.9,
        "Dewpoint_c": -11.8,
        "Wind_Direction": 35,
        "Wind_Speed_kt": 8.6
      },
      {
        "Altitude_ft": 9400,
        "Temp_c": -2,
        "Dewpoint_c": -11.8,
        "Wind_Direction": 34,
        "Wind_Speed_kt": 8.6
      },
      {
        "Altitude_ft": 9416,
        "Temp_c": -2,
        "Dewpoint_c": -11.9,
        "Wind_Direction": 33,
        "Wind_Speed_kt": 8.6
      },
      {
        "Altitude_ft": 9436,
        "Temp_c": -2,
        "Dewpoint_c": -12,
        "Wind_Direction": 32,
        "Wind_Speed_kt": 8.7
      },
      {
        "Altitude_ft": 9452,
        "Temp_c": -2.1,
        "Dewpoint_c": -12.1,
        "Wind_Direction": 31,
        "Wind_Speed_kt": 8.7
      },
      {
        "Altitude_ft": 9472,
        "Temp_c": -2.1,
        "Dewpoint_c": -12.2,
        "Wind_Direction": 30,
        "Wind_Speed_kt": 8.7
      },
      {
        "Altitude_ft": 9488,
        "Temp_c": -2.1,
        "Dewpoint_c": -12.2,
        "Wind_Direction": 29,
        "Wind_Speed_kt": 8.9
      },
      {
        "Altitude_ft": 9508,
        "Temp_c": -2.2,
        "Dewpoint_c": -12.3,
        "Wind_Direction": 29,
        "Wind_Speed_kt": 8.9
      },
      {
        "Altitude_ft": 9524,
        "Temp_c": -2.2,
        "Dewpoint_c": -12.4,
        "Wind_Direction": 28,
        "Wind_Speed_kt": 8.9
      },
      {
        "Altitude_ft": 9541,
        "Temp_c": -2.2,
        "Dewpoint_c": -12.5,
        "Wind_Direction": 27,
        "Wind_Speed_kt": 9.1
      },
      {
        "Altitude_ft": 9557,
        "Temp_c": -2.3,
        "Dewpoint_c": -12.6,
        "Wind_Direction": 26,
        "Wind_Speed_kt": 9.1
      },
      {
        "Altitude_ft": 9573,
        "Temp_c": -2.3,
        "Dewpoint_c": -12.6,
        "Wind_Direction": 26,
        "Wind_Speed_kt": 9.1
      },
      {
        "Altitude_ft": 9587,
        "Temp_c": -2.3,
        "Dewpoint_c": -12.7,
        "Wind_Direction": 25,
        "Wind_Speed_kt": 9.3
      },
      {
        "Altitude_ft": 9603,
        "Temp_c": -2.4,
        "Dewpoint_c": -12.8,
        "Wind_Direction": 24,
        "Wind_Speed_kt": 9.3
      },
      {
        "Altitude_ft": 9619,
        "Temp_c": -2.4,
        "Dewpoint_c": -12.9,
        "Wind_Direction": 23,
        "Wind_Speed_kt": 9.3
      },
      {
        "Altitude_ft": 9639,
        "Temp_c": -2.4,
        "Dewpoint_c": -13,
        "Wind_Direction": 23,
        "Wind_Speed_kt": 9.5
      },
      {
        "Altitude_ft": 9659,
        "Temp_c": -2.5,
        "Dewpoint_c": -13,
        "Wind_Direction": 22,
        "Wind_Speed_kt": 9.5
      },
      {
        "Altitude_ft": 9678,
        "Temp_c": -2.5,
        "Dewpoint_c": -13.1,
        "Wind_Direction": 21,
        "Wind_Speed_kt": 9.7
      },
      {
        "Altitude_ft": 9698,
        "Temp_c": -2.6,
        "Dewpoint_c": -13.2,
        "Wind_Direction": 20,
        "Wind_Speed_kt": 9.7
      },
      {
        "Altitude_ft": 9718,
        "Temp_c": -2.6,
        "Dewpoint_c": -13.3,
        "Wind_Direction": 20,
        "Wind_Speed_kt": 9.7
      },
      {
        "Altitude_ft": 9738,
        "Temp_c": -2.7,
        "Dewpoint_c": -13.4,
        "Wind_Direction": 19,
        "Wind_Speed_kt": 9.5
      },
      {
        "Altitude_ft": 9757,
        "Temp_c": -2.7,
        "Dewpoint_c": -13.5,
        "Wind_Direction": 18,
        "Wind_Speed_kt": 9.5
      },
      {
        "Altitude_ft": 9780,
        "Temp_c": -2.7,
        "Dewpoint_c": -13.5,
        "Wind_Direction": 17,
        "Wind_Speed_kt": 9.5
      },
      {
        "Altitude_ft": 9800,
        "Temp_c": -2.8,
        "Dewpoint_c": -13.6,
        "Wind_Direction": 16,
        "Wind_Speed_kt": 9.5
      },
      {
        "Altitude_ft": 9823,
        "Temp_c": -2.8,
        "Dewpoint_c": -13.7,
        "Wind_Direction": 15,
        "Wind_Speed_kt": 9.3
      },
      {
        "Altitude_ft": 9843,
        "Temp_c": -2.9,
        "Dewpoint_c": -13.8,
        "Wind_Direction": 15,
        "Wind_Speed_kt": 9.5
      },
      {
        "Altitude_ft": 9862,
        "Temp_c": -2.9,
        "Dewpoint_c": -13.9,
        "Wind_Direction": 14,
        "Wind_Speed_kt": 9.3
      },
      {
        "Altitude_ft": 9882,
        "Temp_c": -2.9,
        "Dewpoint_c": -14,
        "Wind_Direction": 13,
        "Wind_Speed_kt": 9.3
      },
      {
        "Altitude_ft": 9902,
        "Temp_c": -3,
        "Dewpoint_c": -14,
        "Wind_Direction": 12,
        "Wind_Speed_kt": 9.3
      },
      {
        "Altitude_ft": 9921,
        "Temp_c": -3,
        "Dewpoint_c": -14.1,
        "Wind_Direction": 11,
        "Wind_Speed_kt": 9.3
      },
      {
        "Altitude_ft": 9941,
        "Temp_c": -3,
        "Dewpoint_c": -14.2,
        "Wind_Direction": 10,
        "Wind_Speed_kt": 9.1
      },
      {
        "Altitude_ft": 9961,
        "Temp_c": -3.1,
        "Dewpoint_c": -14.3,
        "Wind_Direction": 9,
        "Wind_Speed_kt": 9.1
      },
      {
        "Altitude_ft": 9980,
        "Temp_c": -3.1,
        "Dewpoint_c": -14.3,
        "Wind_Direction": 8,
        "Wind_Speed_kt": 9.1
      },
      {
        "Altitude_ft": 9997,
        "Temp_c": -3.1,
        "Dewpoint_c": -14.4,
        "Wind_Direction": 7,
        "Wind_Speed_kt": 8.9
      },
      {
        "Altitude_ft": 10013,
        "Temp_c": -3.2,
        "Dewpoint_c": -14.5,
        "Wind_Direction": 6,
        "Wind_Speed_kt": 8.9
      },
      {
        "Altitude_ft": 10030,
        "Temp_c": -3.2,
        "Dewpoint_c": -14.5,
        "Wind_Direction": 5,
        "Wind_Speed_kt": 8.9
      },
      {
        "Altitude_ft": 10049,
        "Temp_c": -3.2,
        "Dewpoint_c": -14.6,
        "Wind_Direction": 4,
        "Wind_Speed_kt": 8.9
      },
      {
        "Altitude_ft": 10066,
        "Temp_c": -3.2,
        "Dewpoint_c": -14.7,
        "Wind_Direction": 4,
        "Wind_Speed_kt": 8.9
      },
      {
        "Altitude_ft": 10082,
        "Temp_c": -3.3,
        "Dewpoint_c": -14.7,
        "Wind_Direction": 3,
        "Wind_Speed_kt": 8.9
      },
      {
        "Altitude_ft": 10098,
        "Temp_c": -3.3,
        "Dewpoint_c": -14.8,
        "Wind_Direction": 3,
        "Wind_Speed_kt": 9.1
      },
      {
        "Altitude_ft": 10115,
        "Temp_c": -3.3,
        "Dewpoint_c": -14.9,
        "Wind_Direction": 4,
        "Wind_Speed_kt": 9.1
      },
      {
        "Altitude_ft": 10131,
        "Temp_c": -3.4,
        "Dewpoint_c": -14.9,
        "Wind_Direction": 5,
        "Wind_Speed_kt": 9.3
      },
      {
        "Altitude_ft": 10144,
        "Temp_c": -3.4,
        "Dewpoint_c": -15,
        "Wind_Direction": 5,
        "Wind_Speed_kt": 9.5
      },
      {
        "Altitude_ft": 10164,
        "Temp_c": -3.4,
        "Dewpoint_c": -15.1,
        "Wind_Direction": 6,
        "Wind_Speed_kt": 9.7
      },
      {
        "Altitude_ft": 10180,
        "Temp_c": -3.5,
        "Dewpoint_c": -15.1,
        "Wind_Direction": 7,
        "Wind_Speed_kt": 9.9
      },
      {
        "Altitude_ft": 10197,
        "Temp_c": -3.5,
        "Dewpoint_c": -15.2,
        "Wind_Direction": 7,
        "Wind_Speed_kt": 9.9
      },
      {
        "Altitude_ft": 10217,
        "Temp_c": -3.5,
        "Dewpoint_c": -15.2,
        "Wind_Direction": 8,
        "Wind_Speed_kt": 10.1
      },
      {
        "Altitude_ft": 10233,
        "Temp_c": -3.6,
        "Dewpoint_c": -15.3,
        "Wind_Direction": 8,
        "Wind_Speed_kt": 10.3
      },
      {
        "Altitude_ft": 10249,
        "Temp_c": -3.6,
        "Dewpoint_c": -15.3,
        "Wind_Direction": 9,
        "Wind_Speed_kt": 10.5
      },
      {
        "Altitude_ft": 10266,
        "Temp_c": -3.7,
        "Dewpoint_c": -15.4,
        "Wind_Direction": 10,
        "Wind_Speed_kt": 10.7
      },
      {
        "Altitude_ft": 10279,
        "Temp_c": -3.7,
        "Dewpoint_c": -15.5,
        "Wind_Direction": 10,
        "Wind_Speed_kt": 10.9
      },
      {
        "Altitude_ft": 10295,
        "Temp_c": -3.8,
        "Dewpoint_c": -15.5,
        "Wind_Direction": 11,
        "Wind_Speed_kt": 10.9
      },
      {
        "Altitude_ft": 10312,
        "Temp_c": -3.8,
        "Dewpoint_c": -15.6,
        "Wind_Direction": 11,
        "Wind_Speed_kt": 11.1
      },
      {
        "Altitude_ft": 10325,
        "Temp_c": -3.8,
        "Dewpoint_c": -15.6,
        "Wind_Direction": 12,
        "Wind_Speed_kt": 11.3
      },
      {
        "Altitude_ft": 10341,
        "Temp_c": -3.9,
        "Dewpoint_c": -15.7,
        "Wind_Direction": 12,
        "Wind_Speed_kt": 11.5
      },
      {
        "Altitude_ft": 10354,
        "Temp_c": -3.9,
        "Dewpoint_c": -15.8,
        "Wind_Direction": 13,
        "Wind_Speed_kt": 11.7
      },
      {
        "Altitude_ft": 10371,
        "Temp_c": -3.9,
        "Dewpoint_c": -15.8,
        "Wind_Direction": 13,
        "Wind_Speed_kt": 11.9
      },
      {
        "Altitude_ft": 10387,
        "Temp_c": -4,
        "Dewpoint_c": -15.9,
        "Wind_Direction": 13,
        "Wind_Speed_kt": 12.1
      },
      {
        "Altitude_ft": 10400,
        "Temp_c": -4,
        "Dewpoint_c": -16,
        "Wind_Direction": 14,
        "Wind_Speed_kt": 12.2
      },
      {
        "Altitude_ft": 10417,
        "Temp_c": -4.1,
        "Dewpoint_c": -16,
        "Wind_Direction": 14,
        "Wind_Speed_kt": 12.2
      },
      {
        "Altitude_ft": 10436,
        "Temp_c": -4.1,
        "Dewpoint_c": -16.1,
        "Wind_Direction": 13,
        "Wind_Speed_kt": 12.4
      },
      {
        "Altitude_ft": 10456,
        "Temp_c": -4.1,
        "Dewpoint_c": -16.2,
        "Wind_Direction": 13,
        "Wind_Speed_kt": 12.6
      },
      {
        "Altitude_ft": 10472,
        "Temp_c": -4.2,
        "Dewpoint_c": -16.2,
        "Wind_Direction": 13,
        "Wind_Speed_kt": 12.8
      },
      {
        "Altitude_ft": 10492,
        "Temp_c": -4.2,
        "Dewpoint_c": -16.3,
        "Wind_Direction": 13,
        "Wind_Speed_kt": 13
      },
      {
        "Altitude_ft": 10512,
        "Temp_c": -4.3,
        "Dewpoint_c": -16.4,
        "Wind_Direction": 13,
        "Wind_Speed_kt": 13
      },
      {
        "Altitude_ft": 10531,
        "Temp_c": -4.3,
        "Dewpoint_c": -16.4,
        "Wind_Direction": 13,
        "Wind_Speed_kt": 13.2
      },
      {
        "Altitude_ft": 10551,
        "Temp_c": -4.3,
        "Dewpoint_c": -16.5,
        "Wind_Direction": 13,
        "Wind_Speed_kt": 13.4
      },
      {
        "Altitude_ft": 10571,
        "Temp_c": -4.4,
        "Dewpoint_c": -16.6,
        "Wind_Direction": 12,
        "Wind_Speed_kt": 13.6
      },
      {
        "Altitude_ft": 10591,
        "Temp_c": -4.4,
        "Dewpoint_c": -16.7,
        "Wind_Direction": 12,
        "Wind_Speed_kt": 13.8
      },
      {
        "Altitude_ft": 10610,
        "Temp_c": -4.5,
        "Dewpoint_c": -16.7,
        "Wind_Direction": 12,
        "Wind_Speed_kt": 13.8
      },
      {
        "Altitude_ft": 10630,
        "Temp_c": -4.5,
        "Dewpoint_c": -16.7,
        "Wind_Direction": 12,
        "Wind_Speed_kt": 14
      },
      {
        "Altitude_ft": 10650,
        "Temp_c": -4.6,
        "Dewpoint_c": -16.7,
        "Wind_Direction": 12,
        "Wind_Speed_kt": 14.2
      },
      {
        "Altitude_ft": 10669,
        "Temp_c": -4.6,
        "Dewpoint_c": -16.7,
        "Wind_Direction": 12,
        "Wind_Speed_kt": 14.4
      },
      {
        "Altitude_ft": 10689,
        "Temp_c": -4.7,
        "Dewpoint_c": -16.7,
        "Wind_Direction": 12,
        "Wind_Speed_kt": 14.6
      },
      {
        "Altitude_ft": 10709,
        "Temp_c": -4.7,
        "Dewpoint_c": -16.7,
        "Wind_Direction": 11,
        "Wind_Speed_kt": 14.6
      },
      {
        "Altitude_ft": 10728,
        "Temp_c": -4.8,
        "Dewpoint_c": -16.7,
        "Wind_Direction": 11,
        "Wind_Speed_kt": 14.8
      },
      {
        "Altitude_ft": 10748,
        "Temp_c": -4.8,
        "Dewpoint_c": -16.7,
        "Wind_Direction": 11,
        "Wind_Speed_kt": 15
      },
      {
        "Altitude_ft": 10768,
        "Temp_c": -4.8,
        "Dewpoint_c": -16.7,
        "Wind_Direction": 11,
        "Wind_Speed_kt": 15.2
      },
      {
        "Altitude_ft": 10787,
        "Temp_c": -4.9,
        "Dewpoint_c": -16.7,
        "Wind_Direction": 11,
        "Wind_Speed_kt": 15.4
      },
      {
        "Altitude_ft": 10807,
        "Temp_c": -4.9,
        "Dewpoint_c": -16.7,
        "Wind_Direction": 10,
        "Wind_Speed_kt": 15.2
      },
      {
        "Altitude_ft": 10827,
        "Temp_c": -5,
        "Dewpoint_c": -16.7,
        "Wind_Direction": 10,
        "Wind_Speed_kt": 15.2
      },
      {
        "Altitude_ft": 10846,
        "Temp_c": -5,
        "Dewpoint_c": -16.7,
        "Wind_Direction": 9,
        "Wind_Speed_kt": 15
      },
      {
        "Altitude_ft": 10863,
        "Temp_c": -5.1,
        "Dewpoint_c": -16.7,
        "Wind_Direction": 9,
        "Wind_Speed_kt": 15
      },
      {
        "Altitude_ft": 10879,
        "Temp_c": -5.1,
        "Dewpoint_c": -16.8,
        "Wind_Direction": 8,
        "Wind_Speed_kt": 15
      },
      {
        "Altitude_ft": 10896,
        "Temp_c": -5.2,
        "Dewpoint_c": -16.8,
        "Wind_Direction": 8,
        "Wind_Speed_kt": 14.8
      },
      {
        "Altitude_ft": 10912,
        "Temp_c": -5.2,
        "Dewpoint_c": -16.8,
        "Wind_Direction": 7,
        "Wind_Speed_kt": 14.8
      },
      {
        "Altitude_ft": 10928,
        "Temp_c": -5.3,
        "Dewpoint_c": -16.8,
        "Wind_Direction": 7,
        "Wind_Speed_kt": 14.6
      },
      {
        "Altitude_ft": 10945,
        "Temp_c": -5.3,
        "Dewpoint_c": -16.8,
        "Wind_Direction": 6,
        "Wind_Speed_kt": 14.6
      },
      {
        "Altitude_ft": 10961,
        "Temp_c": -5.4,
        "Dewpoint_c": -16.8,
        "Wind_Direction": 5,
        "Wind_Speed_kt": 14.6
      },
      {
        "Altitude_ft": 10978,
        "Temp_c": -5.4,
        "Dewpoint_c": -16.8,
        "Wind_Direction": 5,
        "Wind_Speed_kt": 14.4
      },
      {
        "Altitude_ft": 10994,
        "Temp_c": -5.5,
        "Dewpoint_c": -16.9,
        "Wind_Direction": 4,
        "Wind_Speed_kt": 14.4
      },
      {
        "Altitude_ft": 11014,
        "Temp_c": -5.6,
        "Dewpoint_c": -16.9,
        "Wind_Direction": 4,
        "Wind_Speed_kt": 14.4
      },
      {
        "Altitude_ft": 11030,
        "Temp_c": -5.6,
        "Dewpoint_c": -16.9,
        "Wind_Direction": 3,
        "Wind_Speed_kt": 14.2
      },
      {
        "Altitude_ft": 11050,
        "Temp_c": -5.7,
        "Dewpoint_c": -16.9,
        "Wind_Direction": 2,
        "Wind_Speed_kt": 14.2
      },
      {
        "Altitude_ft": 11073,
        "Temp_c": -5.7,
        "Dewpoint_c": -16.9,
        "Wind_Direction": 2,
        "Wind_Speed_kt": 14.2
      },
      {
        "Altitude_ft": 11099,
        "Temp_c": -5.8,
        "Dewpoint_c": -16.9,
        "Wind_Direction": 1,
        "Wind_Speed_kt": 14
      },
      {
        "Altitude_ft": 11122,
        "Temp_c": -5.8,
        "Dewpoint_c": -17,
        "Wind_Direction": 360,
        "Wind_Speed_kt": 14
      },
      {
        "Altitude_ft": 11145,
        "Temp_c": -5.9,
        "Dewpoint_c": -17,
        "Wind_Direction": 360,
        "Wind_Speed_kt": 14
      },
      {
        "Altitude_ft": 11171,
        "Temp_c": -5.9,
        "Dewpoint_c": -17,
        "Wind_Direction": 359,
        "Wind_Speed_kt": 14
      },
      {
        "Altitude_ft": 11188,
        "Temp_c": -6,
        "Dewpoint_c": -17,
        "Wind_Direction": 359,
        "Wind_Speed_kt": 14
      },
      {
        "Altitude_ft": 11207,
        "Temp_c": -6,
        "Dewpoint_c": -17,
        "Wind_Direction": 359,
        "Wind_Speed_kt": 14
      },
      {
        "Altitude_ft": 11224,
        "Temp_c": -6.1,
        "Dewpoint_c": -17.1,
        "Wind_Direction": 359,
        "Wind_Speed_kt": 14
      },
      {
        "Altitude_ft": 11243,
        "Temp_c": -6.1,
        "Dewpoint_c": -17.1,
        "Wind_Direction": 359,
        "Wind_Speed_kt": 14
      },
      {
        "Altitude_ft": 11260,
        "Temp_c": -6.2,
        "Dewpoint_c": -17.1,
        "Wind_Direction": 359,
        "Wind_Speed_kt": 14
      },
      {
        "Altitude_ft": 11280,
        "Temp_c": -6.2,
        "Dewpoint_c": -17.1,
        "Wind_Direction": 359,
        "Wind_Speed_kt": 14
      },
      {
        "Altitude_ft": 11299,
        "Temp_c": -6.3,
        "Dewpoint_c": -17.1,
        "Wind_Direction": 359,
        "Wind_Speed_kt": 14
      },
      {
        "Altitude_ft": 11316,
        "Temp_c": -6.3,
        "Dewpoint_c": -17.2,
        "Wind_Direction": 360,
        "Wind_Speed_kt": 14
      },
      {
        "Altitude_ft": 11335,
        "Temp_c": -6.4,
        "Dewpoint_c": -17.2,
        "Wind_Direction": 360,
        "Wind_Speed_kt": 14
      },
      {
        "Altitude_ft": 11352,
        "Temp_c": -6.4,
        "Dewpoint_c": -17.2,
        "Wind_Direction": 360,
        "Wind_Speed_kt": 14
      },
      {
        "Altitude_ft": 11371,
        "Temp_c": -6.5,
        "Dewpoint_c": -17.2,
        "Wind_Direction": 360,
        "Wind_Speed_kt": 14
      },
      {
        "Altitude_ft": 11388,
        "Temp_c": -6.5,
        "Dewpoint_c": -17.2,
        "Wind_Direction": 360,
        "Wind_Speed_kt": 14
      },
      {
        "Altitude_ft": 11407,
        "Temp_c": -6.6,
        "Dewpoint_c": -17.3,
        "Wind_Direction": 360,
        "Wind_Speed_kt": 14
      },
      {
        "Altitude_ft": 11424,
        "Temp_c": -6.6,
        "Dewpoint_c": -17.3,
        "Wind_Direction": 360,
        "Wind_Speed_kt": 14
      },
      {
        "Altitude_ft": 11444,
        "Temp_c": -6.7,
        "Dewpoint_c": -17.3,
        "Wind_Direction": 360,
        "Wind_Speed_kt": 14
      },
      {
        "Altitude_ft": 11460,
        "Temp_c": -6.7,
        "Dewpoint_c": -17.3,
        "Wind_Direction": 360,
        "Wind_Speed_kt": 14
      },
      {
        "Altitude_ft": 11476,
        "Temp_c": -6.8,
        "Dewpoint_c": -17.3,
        "Wind_Direction": 360,
        "Wind_Speed_kt": 14
      },
      {
        "Altitude_ft": 11496,
        "Temp_c": -6.8,
        "Dewpoint_c": -17.4,
        "Wind_Direction": 360,
        "Wind_Speed_kt": 14
      },
      {
        "Altitude_ft": 11512,
        "Temp_c": -6.9,
        "Dewpoint_c": -17.4,
        "Wind_Direction": 360,
        "Wind_Speed_kt": 14
      },
      {
        "Altitude_ft": 11529,
        "Temp_c": -6.9,
        "Dewpoint_c": -17.4,
        "Wind_Direction": 360,
        "Wind_Speed_kt": 14
      },
      {
        "Altitude_ft": 11545,
        "Temp_c": -7,
        "Dewpoint_c": -17.4,
        "Wind_Direction": 360,
        "Wind_Speed_kt": 14
      },
      {
        "Altitude_ft": 11565,
        "Temp_c": -7,
        "Dewpoint_c": -17.4,
        "Wind_Direction": 360,
        "Wind_Speed_kt": 14
      },
      {
        "Altitude_ft": 11578,
        "Temp_c": -7.1,
        "Dewpoint_c": -17.4,
        "Wind_Direction": 360,
        "Wind_Speed_kt": 14
      },
      {
        "Altitude_ft": 11594,
        "Temp_c": -7.1,
        "Dewpoint_c": -17.5,
        "Wind_Direction": 360,
        "Wind_Speed_kt": 14
      },
      {
        "Altitude_ft": 11608,
        "Temp_c": -7.2,
        "Dewpoint_c": -17.5,
        "Wind_Direction": 360,
        "Wind_Speed_kt": 14
      },
      {
        "Altitude_ft": 11624,
        "Temp_c": -7.2,
        "Dewpoint_c": -17.5,
        "Wind_Direction": 360,
        "Wind_Speed_kt": 14
      },
      {
        "Altitude_ft": 11637,
        "Temp_c": -7.2,
        "Dewpoint_c": -17.5,
        "Wind_Direction": 360,
        "Wind_Speed_kt": 14
      },
      {
        "Altitude_ft": 11654,
        "Temp_c": -7.3,
        "Dewpoint_c": -17.6,
        "Wind_Direction": 360,
        "Wind_Speed_kt": 14
      },
      {
        "Altitude_ft": 11670,
        "Temp_c": -7.3,
        "Dewpoint_c": -17.6,
        "Wind_Direction": 360,
        "Wind_Speed_kt": 14
      },
      {
        "Altitude_ft": 11683,
        "Temp_c": -7.4,
        "Dewpoint_c": -17.6,
        "Wind_Direction": 360,
        "Wind_Speed_kt": 14
      },
      {
        "Altitude_ft": 11699,
        "Temp_c": -7.4,
        "Dewpoint_c": -17.6,
        "Wind_Direction": 360,
        "Wind_Speed_kt": 14
      },
      {
        "Altitude_ft": 11716,
        "Temp_c": -7.5,
        "Dewpoint_c": -17.6,
        "Wind_Direction": 360,
        "Wind_Speed_kt": 14
      },
      {
        "Altitude_ft": 11732,
        "Temp_c": -7.5,
        "Dewpoint_c": -17.7,
        "Wind_Direction": 360,
        "Wind_Speed_kt": 14
      },
      {
        "Altitude_ft": 11745,
        "Temp_c": -7.5,
        "Dewpoint_c": -17.7,
        "Wind_Direction": 360,
        "Wind_Speed_kt": 14
      },
      {
        "Altitude_ft": 11762,
        "Temp_c": -7.6,
        "Dewpoint_c": -17.7,
        "Wind_Direction": 360,
        "Wind_Speed_kt": 14
      },
      {
        "Altitude_ft": 11775,
        "Temp_c": -7.6,
        "Dewpoint_c": -17.7,
        "Wind_Direction": 360,
        "Wind_Speed_kt": 14
      },
      {
        "Altitude_ft": 11791,
        "Temp_c": -7.7,
        "Dewpoint_c": -17.8,
        "Wind_Direction": 360,
        "Wind_Speed_kt": 14
      },
      {
        "Altitude_ft": 11804,
        "Temp_c": -7.7,
        "Dewpoint_c": -17.8,
        "Wind_Direction": 360,
        "Wind_Speed_kt": 14
      },
      {
        "Altitude_ft": 11821,
        "Temp_c": -7.8,
        "Dewpoint_c": -17.8,
        "Wind_Direction": 360,
        "Wind_Speed_kt": 14
      },
      {
        "Altitude_ft": 11837,
        "Temp_c": -7.8,
        "Dewpoint_c": -17.8,
        "Wind_Direction": 360,
        "Wind_Speed_kt": 14
      },
      {
        "Altitude_ft": 11857,
        "Temp_c": -7.8,
        "Dewpoint_c": -17.9,
        "Wind_Direction": 360,
        "Wind_Speed_kt": 14
      },
      {
        "Altitude_ft": 11873,
        "Temp_c": -7.9,
        "Dewpoint_c": -17.9,
        "Wind_Direction": 360,
        "Wind_Speed_kt": 14.2
      },
      {
        "Altitude_ft": 11893,
        "Temp_c": -7.9,
        "Dewpoint_c": -17.9,
        "Wind_Direction": 359,
        "Wind_Speed_kt": 14.2
      },
      {
        "Altitude_ft": 11909,
        "Temp_c": -8,
        "Dewpoint_c": -18,
        "Wind_Direction": 359,
        "Wind_Speed_kt": 14.2
      },
      {
        "Altitude_ft": 11926,
        "Temp_c": -8,
        "Dewpoint_c": -18,
        "Wind_Direction": 359,
        "Wind_Speed_kt": 14.2
      },
      {
        "Altitude_ft": 11942,
        "Temp_c": -8,
        "Dewpoint_c": -18,
        "Wind_Direction": 359,
        "Wind_Speed_kt": 14.4
      },
      {
        "Altitude_ft": 11955,
        "Temp_c": -8.1,
        "Dewpoint_c": -18,
        "Wind_Direction": 359,
        "Wind_Speed_kt": 14.4
      },
      {
        "Altitude_ft": 11972,
        "Temp_c": -8.1,
        "Dewpoint_c": -18.1,
        "Wind_Direction": 359,
        "Wind_Speed_kt": 14.4
      },
      {
        "Altitude_ft": 11988,
        "Temp_c": -8.1,
        "Dewpoint_c": -18.1,
        "Wind_Direction": 358,
        "Wind_Speed_kt": 14.4
      },
      {
        "Altitude_ft": 12005,
        "Temp_c": -8.2,
        "Dewpoint_c": -18.1,
        "Wind_Direction": 358,
        "Wind_Speed_kt": 14.6
      },
      {
        "Altitude_ft": 12018,
        "Temp_c": -8.2,
        "Dewpoint_c": -18.1,
        "Wind_Direction": 358,
        "Wind_Speed_kt": 14.6
      },
      {
        "Altitude_ft": 12034,
        "Temp_c": -8.3,
        "Dewpoint_c": -18.2,
        "Wind_Direction": 358,
        "Wind_Speed_kt": 14.6
      },
      {
        "Altitude_ft": 12047,
        "Temp_c": -8.3,
        "Dewpoint_c": -18.2,
        "Wind_Direction": 358,
        "Wind_Speed_kt": 14.6
      },
      {
        "Altitude_ft": 12060,
        "Temp_c": -8.3,
        "Dewpoint_c": -18.2,
        "Wind_Direction": 358,
        "Wind_Speed_kt": 14.8
      },
      {
        "Altitude_ft": 12077,
        "Temp_c": -8.4,
        "Dewpoint_c": -18.2,
        "Wind_Direction": 357,
        "Wind_Speed_kt": 14.8
      },
      {
        "Altitude_ft": 12093,
        "Temp_c": -8.4,
        "Dewpoint_c": -18.2,
        "Wind_Direction": 357,
        "Wind_Speed_kt": 14.8
      },
      {
        "Altitude_ft": 12110,
        "Temp_c": -8.5,
        "Dewpoint_c": -18.3,
        "Wind_Direction": 357,
        "Wind_Speed_kt": 14.8
      },
      {
        "Altitude_ft": 12126,
        "Temp_c": -8.5,
        "Dewpoint_c": -18.3,
        "Wind_Direction": 357,
        "Wind_Speed_kt": 15
      },
      {
        "Altitude_ft": 12142,
        "Temp_c": -8.5,
        "Dewpoint_c": -18.3,
        "Wind_Direction": 357,
        "Wind_Speed_kt": 15
      },
      {
        "Altitude_ft": 12159,
        "Temp_c": -8.6,
        "Dewpoint_c": -18.3,
        "Wind_Direction": 357,
        "Wind_Speed_kt": 15
      },
      {
        "Altitude_ft": 12175,
        "Temp_c": -8.6,
        "Dewpoint_c": -18.4,
        "Wind_Direction": 356,
        "Wind_Speed_kt": 15
      },
      {
        "Altitude_ft": 12192,
        "Temp_c": -8.7,
        "Dewpoint_c": -18.4,
        "Wind_Direction": 356,
        "Wind_Speed_kt": 15
      },
      {
        "Altitude_ft": 12205,
        "Temp_c": -8.7,
        "Dewpoint_c": -18.4,
        "Wind_Direction": 356,
        "Wind_Speed_kt": 14.8
      },
      {
        "Altitude_ft": 12221,
        "Temp_c": -8.7,
        "Dewpoint_c": -18.4,
        "Wind_Direction": 356,
        "Wind_Speed_kt": 14.8
      },
      {
        "Altitude_ft": 12238,
        "Temp_c": -8.8,
        "Dewpoint_c": -18.4,
        "Wind_Direction": 356,
        "Wind_Speed_kt": 14.6
      },
      {
        "Altitude_ft": 12251,
        "Temp_c": -8.8,
        "Dewpoint_c": -18.4,
        "Wind_Direction": 356,
        "Wind_Speed_kt": 14.6
      },
      {
        "Altitude_ft": 12267,
        "Temp_c": -8.9,
        "Dewpoint_c": -18.4,
        "Wind_Direction": 356,
        "Wind_Speed_kt": 14.6
      },
      {
        "Altitude_ft": 12280,
        "Temp_c": -8.9,
        "Dewpoint_c": -18.4,
        "Wind_Direction": 355,
        "Wind_Speed_kt": 14.4
      },
      {
        "Altitude_ft": 12297,
        "Temp_c": -8.9,
        "Dewpoint_c": -18.5,
        "Wind_Direction": 355,
        "Wind_Speed_kt": 14.4
      },
      {
        "Altitude_ft": 12313,
        "Temp_c": -9,
        "Dewpoint_c": -18.5,
        "Wind_Direction": 355,
        "Wind_Speed_kt": 14.4
      },
      {
        "Altitude_ft": 12326,
        "Temp_c": -9,
        "Dewpoint_c": -18.5,
        "Wind_Direction": 355,
        "Wind_Speed_kt": 14.2
      },
      {
        "Altitude_ft": 12343,
        "Temp_c": -9,
        "Dewpoint_c": -18.5,
        "Wind_Direction": 355,
        "Wind_Speed_kt": 14.2
      },
      {
        "Altitude_ft": 12356,
        "Temp_c": -9.1,
        "Dewpoint_c": -18.5,
        "Wind_Direction": 355,
        "Wind_Speed_kt": 14
      },
      {
        "Altitude_ft": 12369,
        "Temp_c": -9.1,
        "Dewpoint_c": -18.5,
        "Wind_Direction": 355,
        "Wind_Speed_kt": 14
      },
      {
        "Altitude_ft": 12382,
        "Temp_c": -9.2,
        "Dewpoint_c": -18.5,
        "Wind_Direction": 354,
        "Wind_Speed_kt": 14
      },
      {
        "Altitude_ft": 12395,
        "Temp_c": -9.2,
        "Dewpoint_c": -18.5,
        "Wind_Direction": 354,
        "Wind_Speed_kt": 13.8
      },
      {
        "Altitude_ft": 12408,
        "Temp_c": -9.2,
        "Dewpoint_c": -18.5,
        "Wind_Direction": 354,
        "Wind_Speed_kt": 13.8
      },
      {
        "Altitude_ft": 12418,
        "Temp_c": -9.3,
        "Dewpoint_c": -18.5,
        "Wind_Direction": 354,
        "Wind_Speed_kt": 13.8
      },
      {
        "Altitude_ft": 12431,
        "Temp_c": -9.3,
        "Dewpoint_c": -18.6,
        "Wind_Direction": 354,
        "Wind_Speed_kt": 13.6
      },
      {
        "Altitude_ft": 12444,
        "Temp_c": -9.4,
        "Dewpoint_c": -18.6,
        "Wind_Direction": 354,
        "Wind_Speed_kt": 13.6
      },
      {
        "Altitude_ft": 12461,
        "Temp_c": -9.4,
        "Dewpoint_c": -18.6,
        "Wind_Direction": 354,
        "Wind_Speed_kt": 13.6
      },
      {
        "Altitude_ft": 12477,
        "Temp_c": -9.5,
        "Dewpoint_c": -18.7,
        "Wind_Direction": 354,
        "Wind_Speed_kt": 13.6
      },
      {
        "Altitude_ft": 12493,
        "Temp_c": -9.5,
        "Dewpoint_c": -18.7,
        "Wind_Direction": 354,
        "Wind_Speed_kt": 13.6
      },
      {
        "Altitude_ft": 12507,
        "Temp_c": -9.5,
        "Dewpoint_c": -18.7,
        "Wind_Direction": 354,
        "Wind_Speed_kt": 13.6
      },
      {
        "Altitude_ft": 12523,
        "Temp_c": -9.6,
        "Dewpoint_c": -18.8,
        "Wind_Direction": 355,
        "Wind_Speed_kt": 13.6
      },
      {
        "Altitude_ft": 12543,
        "Temp_c": -9.6,
        "Dewpoint_c": -18.8,
        "Wind_Direction": 355,
        "Wind_Speed_kt": 13.6
      },
      {
        "Altitude_ft": 12562,
        "Temp_c": -9.7,
        "Dewpoint_c": -18.8,
        "Wind_Direction": 355,
        "Wind_Speed_kt": 13.6
      },
      {
        "Altitude_ft": 12582,
        "Temp_c": -9.7,
        "Dewpoint_c": -18.9,
        "Wind_Direction": 355,
        "Wind_Speed_kt": 13.6
      },
      {
        "Altitude_ft": 12602,
        "Temp_c": -9.8,
        "Dewpoint_c": -18.9,
        "Wind_Direction": 356,
        "Wind_Speed_kt": 13.6
      },
      {
        "Altitude_ft": 12621,
        "Temp_c": -9.8,
        "Dewpoint_c": -18.9,
        "Wind_Direction": 356,
        "Wind_Speed_kt": 13.6
      },
      {
        "Altitude_ft": 12641,
        "Temp_c": -9.9,
        "Dewpoint_c": -18.9,
        "Wind_Direction": 356,
        "Wind_Speed_kt": 13.6
      },
      {
        "Altitude_ft": 12654,
        "Temp_c": -9.9,
        "Dewpoint_c": -19,
        "Wind_Direction": 356,
        "Wind_Speed_kt": 13.6
      },
      {
        "Altitude_ft": 12667,
        "Temp_c": -10,
        "Dewpoint_c": -19,
        "Wind_Direction": 356,
        "Wind_Speed_kt": 13.6
      },
      {
        "Altitude_ft": 12680,
        "Temp_c": -10,
        "Dewpoint_c": -18.1,
        "Wind_Direction": 357,
        "Wind_Speed_kt": 13.6
      },
      {
        "Altitude_ft": 12694,
        "Temp_c": -10.1,
        "Dewpoint_c": -18.1,
        "Wind_Direction": 357,
        "Wind_Speed_kt": 13.6
      },
      {
        "Altitude_ft": 12707,
        "Temp_c": -10.1,
        "Dewpoint_c": -18.1,
        "Wind_Direction": 357,
        "Wind_Speed_kt": 13.6
      },
      {
        "Altitude_ft": 12723,
        "Temp_c": -10.1,
        "Dewpoint_c": -18.2,
        "Wind_Direction": 357,
        "Wind_Speed_kt": 13.6
      },
      {
        "Altitude_ft": 12743,
        "Temp_c": -10.2,
        "Dewpoint_c": -18.2,
        "Wind_Direction": 357,
        "Wind_Speed_kt": 13.6
      },
      {
        "Altitude_ft": 12762,
        "Temp_c": -10.2,
        "Dewpoint_c": -18.2,
        "Wind_Direction": 358,
        "Wind_Speed_kt": 13.6
      },
      {
        "Altitude_ft": 12782,
        "Temp_c": -10.3,
        "Dewpoint_c": -18.2,
        "Wind_Direction": 358,
        "Wind_Speed_kt": 13.4
      },
      {
        "Altitude_ft": 12802,
        "Temp_c": -10.3,
        "Dewpoint_c": -18.2,
        "Wind_Direction": 358,
        "Wind_Speed_kt": 13.6
      },
      {
        "Altitude_ft": 12818,
        "Temp_c": -10.4,
        "Dewpoint_c": -18.2,
        "Wind_Direction": 358,
        "Wind_Speed_kt": 13.8
      },
      {
        "Altitude_ft": 12838,
        "Temp_c": -10.4,
        "Dewpoint_c": -18.2,
        "Wind_Direction": 358,
        "Wind_Speed_kt": 13.8
      },
      {
        "Altitude_ft": 12854,
        "Temp_c": -10.5,
        "Dewpoint_c": -18.3,
        "Wind_Direction": 358,
        "Wind_Speed_kt": 14
      },
      {
        "Altitude_ft": 12874,
        "Temp_c": -10.5,
        "Dewpoint_c": -18.3,
        "Wind_Direction": 358,
        "Wind_Speed_kt": 14.2
      },
      {
        "Altitude_ft": 12890,
        "Temp_c": -10.6,
        "Dewpoint_c": -18.3,
        "Wind_Direction": 358,
        "Wind_Speed_kt": 14.2
      },
      {
        "Altitude_ft": 12907,
        "Temp_c": -10.6,
        "Dewpoint_c": -18.3,
        "Wind_Direction": 358,
        "Wind_Speed_kt": 14.4
      },
      {
        "Altitude_ft": 12927,
        "Temp_c": -10.7,
        "Dewpoint_c": -18.3,
        "Wind_Direction": 358,
        "Wind_Speed_kt": 14.6
      },
      {
        "Altitude_ft": 12943,
        "Temp_c": -10.7,
        "Dewpoint_c": -18.3,
        "Wind_Direction": 358,
        "Wind_Speed_kt": 14.6
      },
      {
        "Altitude_ft": 12959,
        "Temp_c": -10.8,
        "Dewpoint_c": -18.3,
        "Wind_Direction": 357,
        "Wind_Speed_kt": 14.8
      },
      {
        "Altitude_ft": 12979,
        "Temp_c": -10.8,
        "Dewpoint_c": -18.3,
        "Wind_Direction": 357,
        "Wind_Speed_kt": 15
      },
      {
        "Altitude_ft": 12999,
        "Temp_c": -10.9,
        "Dewpoint_c": -18.3,
        "Wind_Direction": 357,
        "Wind_Speed_kt": 15
      },
      {
        "Altitude_ft": 13015,
        "Temp_c": -10.9,
        "Dewpoint_c": -18.3,
        "Wind_Direction": 357,
        "Wind_Speed_kt": 15.2
      },
      {
        "Altitude_ft": 13035,
        "Temp_c": -10.9,
        "Dewpoint_c": -18.3,
        "Wind_Direction": 357,
        "Wind_Speed_kt": 15.4
      },
      {
        "Altitude_ft": 13054,
        "Temp_c": -11,
        "Dewpoint_c": -18.3,
        "Wind_Direction": 357,
        "Wind_Speed_kt": 15.4
      },
      {
        "Altitude_ft": 13071,
        "Temp_c": -11,
        "Dewpoint_c": -18.3,
        "Wind_Direction": 357,
        "Wind_Speed_kt": 15.6
      },
      {
        "Altitude_ft": 13091,
        "Temp_c": -11.1,
        "Dewpoint_c": -18.3,
        "Wind_Direction": 357,
        "Wind_Speed_kt": 15.6
      },
      {
        "Altitude_ft": 13110,
        "Temp_c": -11.1,
        "Dewpoint_c": -18.3,
        "Wind_Direction": 357,
        "Wind_Speed_kt": 15.7
      },
      {
        "Altitude_ft": 13127,
        "Temp_c": -11.2,
        "Dewpoint_c": -18.3,
        "Wind_Direction": 357,
        "Wind_Speed_kt": 15.9
      },
      {
        "Altitude_ft": 13146,
        "Temp_c": -11.2,
        "Dewpoint_c": -18.4,
        "Wind_Direction": 357,
        "Wind_Speed_kt": 15.9
      },
      {
        "Altitude_ft": 13163,
        "Temp_c": -11.3,
        "Dewpoint_c": -18.4,
        "Wind_Direction": 357,
        "Wind_Speed_kt": 16.1
      },
      {
        "Altitude_ft": 13179,
        "Temp_c": -11.3,
        "Dewpoint_c": -18.4,
        "Wind_Direction": 357,
        "Wind_Speed_kt": 16.1
      },
      {
        "Altitude_ft": 13192,
        "Temp_c": -11.3,
        "Dewpoint_c": -18.4,
        "Wind_Direction": 357,
        "Wind_Speed_kt": 16.1
      },
      {
        "Altitude_ft": 13205,
        "Temp_c": -11.4,
        "Dewpoint_c": -18.4,
        "Wind_Direction": 357,
        "Wind_Speed_kt": 16.3
      },
      {
        "Altitude_ft": 13222,
        "Temp_c": -11.4,
        "Dewpoint_c": -18.4,
        "Wind_Direction": 357,
        "Wind_Speed_kt": 16.3
      },
      {
        "Altitude_ft": 13235,
        "Temp_c": -11.5,
        "Dewpoint_c": -18.5,
        "Wind_Direction": 358,
        "Wind_Speed_kt": 16.3
      },
      {
        "Altitude_ft": 13248,
        "Temp_c": -11.5,
        "Dewpoint_c": -18.5,
        "Wind_Direction": 358,
        "Wind_Speed_kt": 16.3
      },
      {
        "Altitude_ft": 13264,
        "Temp_c": -11.5,
        "Dewpoint_c": -18.5,
        "Wind_Direction": 358,
        "Wind_Speed_kt": 16.5
      },
      {
        "Altitude_ft": 13278,
        "Temp_c": -11.6,
        "Dewpoint_c": -18.5,
        "Wind_Direction": 358,
        "Wind_Speed_kt": 16.5
      },
      {
        "Altitude_ft": 13294,
        "Temp_c": -11.6,
        "Dewpoint_c": -18.5,
        "Wind_Direction": 358,
        "Wind_Speed_kt": 16.5
      },
      {
        "Altitude_ft": 13310,
        "Temp_c": -11.7,
        "Dewpoint_c": -18.5,
        "Wind_Direction": 358,
        "Wind_Speed_kt": 16.5
      },
      {
        "Altitude_ft": 13323,
        "Temp_c": -11.7,
        "Dewpoint_c": -18.5,
        "Wind_Direction": 358,
        "Wind_Speed_kt": 16.7
      },
      {
        "Altitude_ft": 13340,
        "Temp_c": -11.7,
        "Dewpoint_c": -18.6,
        "Wind_Direction": 358,
        "Wind_Speed_kt": 16.7
      },
      {
        "Altitude_ft": 13353,
        "Temp_c": -11.8,
        "Dewpoint_c": -18.6,
        "Wind_Direction": 358,
        "Wind_Speed_kt": 16.7
      },
      {
        "Altitude_ft": 13366,
        "Temp_c": -11.8,
        "Dewpoint_c": -18.6,
        "Wind_Direction": 358,
        "Wind_Speed_kt": 16.9
      },
      {
        "Altitude_ft": 13379,
        "Temp_c": -11.8,
        "Dewpoint_c": -18.6,
        "Wind_Direction": 358,
        "Wind_Speed_kt": 16.9
      },
      {
        "Altitude_ft": 13392,
        "Temp_c": -11.9,
        "Dewpoint_c": -18.6,
        "Wind_Direction": 358,
        "Wind_Speed_kt": 16.9
      },
      {
        "Altitude_ft": 13406,
        "Temp_c": -11.9,
        "Dewpoint_c": -18.6,
        "Wind_Direction": 358,
        "Wind_Speed_kt": 16.9
      },
      {
        "Altitude_ft": 13422,
        "Temp_c": -12,
        "Dewpoint_c": -18.6,
        "Wind_Direction": 358,
        "Wind_Speed_kt": 17.1
      },
      {
        "Altitude_ft": 13438,
        "Temp_c": -12,
        "Dewpoint_c": -18.7,
        "Wind_Direction": 358,
        "Wind_Speed_kt": 17.1
      },
      {
        "Altitude_ft": 13451,
        "Temp_c": -12,
        "Dewpoint_c": -18.7,
        "Wind_Direction": 358,
        "Wind_Speed_kt": 17.1
      },
      {
        "Altitude_ft": 13468,
        "Temp_c": -12.1,
        "Dewpoint_c": -18.7,
        "Wind_Direction": 359,
        "Wind_Speed_kt": 17.3
      },
      {
        "Altitude_ft": 13484,
        "Temp_c": -12.1,
        "Dewpoint_c": -18.7,
        "Wind_Direction": 359,
        "Wind_Speed_kt": 17.3
      },
      {
        "Altitude_ft": 13497,
        "Temp_c": -12.1,
        "Dewpoint_c": -18.7,
        "Wind_Direction": 359,
        "Wind_Speed_kt": 17.3
      },
      {
        "Altitude_ft": 13510,
        "Temp_c": -12.2,
        "Dewpoint_c": -18.7,
        "Wind_Direction": 359,
        "Wind_Speed_kt": 17.5
      },
      {
        "Altitude_ft": 13524,
        "Temp_c": -12.2,
        "Dewpoint_c": -18.8,
        "Wind_Direction": 359,
        "Wind_Speed_kt": 17.5
      },
      {
        "Altitude_ft": 13540,
        "Temp_c": -12.3,
        "Dewpoint_c": -18.8,
        "Wind_Direction": 359,
        "Wind_Speed_kt": 17.5
      },
      {
        "Altitude_ft": 13553,
        "Temp_c": -12.3,
        "Dewpoint_c": -18.9,
        "Wind_Direction": 359,
        "Wind_Speed_kt": 17.7
      },
      {
        "Altitude_ft": 13566,
        "Temp_c": -12.3,
        "Dewpoint_c": -18.9,
        "Wind_Direction": 360,
        "Wind_Speed_kt": 17.7
      },
      {
        "Altitude_ft": 13583,
        "Temp_c": -12.4,
        "Dewpoint_c": -19,
        "Wind_Direction": 360,
        "Wind_Speed_kt": 17.9
      },
      {
        "Altitude_ft": 13599,
        "Temp_c": -12.4,
        "Dewpoint_c": -19,
        "Wind_Direction": 360,
        "Wind_Speed_kt": 17.9
      },
      {
        "Altitude_ft": 13615,
        "Temp_c": -12.5,
        "Dewpoint_c": -19,
        "Wind_Direction": 360,
        "Wind_Speed_kt": 17.9
      },
      {
        "Altitude_ft": 13632,
        "Temp_c": -12.5,
        "Dewpoint_c": -19.1,
        "Wind_Direction": 360,
        "Wind_Speed_kt": 18.1
      },
      {
        "Altitude_ft": 13648,
        "Temp_c": -12.6,
        "Dewpoint_c": -19.1,
        "Wind_Direction": 360,
        "Wind_Speed_kt": 18.1
      },
      {
        "Altitude_ft": 13665,
        "Temp_c": -12.6,
        "Dewpoint_c": -19.2,
        "Wind_Direction": 360,
        "Wind_Speed_kt": 18.1
      },
      {
        "Altitude_ft": 13688,
        "Temp_c": -12.7,
        "Dewpoint_c": -19.2,
        "Wind_Direction": 360,
        "Wind_Speed_kt": 18.3
      },
      {
        "Altitude_ft": 13707,
        "Temp_c": -12.7,
        "Dewpoint_c": -19.3,
        "Wind_Direction": 1,
        "Wind_Speed_kt": 18.3
      },
      {
        "Altitude_ft": 13730,
        "Temp_c": -12.8,
        "Dewpoint_c": -19.3,
        "Wind_Direction": 1,
        "Wind_Speed_kt": 18.3
      },
      {
        "Altitude_ft": 13750,
        "Temp_c": -12.8,
        "Dewpoint_c": -19.3,
        "Wind_Direction": 1,
        "Wind_Speed_kt": 18.5
      },
      {
        "Altitude_ft": 13780,
        "Temp_c": -12.8,
        "Dewpoint_c": -19.3,
        "Wind_Direction": 1,
        "Wind_Speed_kt": 18.5
      },
      {
        "Altitude_ft": 13789,
        "Temp_c": -12.9,
        "Dewpoint_c": -19.3,
        "Wind_Direction": 1,
        "Wind_Speed_kt": 18.3
      },
      {
        "Altitude_ft": 13809,
        "Temp_c": -12.9,
        "Dewpoint_c": -19.3,
        "Wind_Direction": 360,
        "Wind_Speed_kt": 18.1
      },
      {
        "Altitude_ft": 13829,
        "Temp_c": -13,
        "Dewpoint_c": -19.3,
        "Wind_Direction": 360,
        "Wind_Speed_kt": 17.9
      },
      {
        "Altitude_ft": 13845,
        "Temp_c": -13,
        "Dewpoint_c": -19.3,
        "Wind_Direction": 359,
        "Wind_Speed_kt": 17.7
      },
      {
        "Altitude_ft": 13865,
        "Temp_c": -13,
        "Dewpoint_c": -19.3,
        "Wind_Direction": 359,
        "Wind_Speed_kt": 17.5
      },
      {
        "Altitude_ft": 13881,
        "Temp_c": -13.1,
        "Dewpoint_c": -19.3,
        "Wind_Direction": 358,
        "Wind_Speed_kt": 17.3
      },
      {
        "Altitude_ft": 13898,
        "Temp_c": -13.1,
        "Dewpoint_c": -19.4,
        "Wind_Direction": 357,
        "Wind_Speed_kt": 17.1
      },
      {
        "Altitude_ft": 13914,
        "Temp_c": -13.2,
        "Dewpoint_c": -19.4,
        "Wind_Direction": 357,
        "Wind_Speed_kt": 16.9
      },
      {
        "Altitude_ft": 13930,
        "Temp_c": -13.2,
        "Dewpoint_c": -19.4,
        "Wind_Direction": 356,
        "Wind_Speed_kt": 16.9
      },
      {
        "Altitude_ft": 13947,
        "Temp_c": -13.3,
        "Dewpoint_c": -19.4,
        "Wind_Direction": 356,
        "Wind_Speed_kt": 16.7
      },
      {
        "Altitude_ft": 13960,
        "Temp_c": -13.3,
        "Dewpoint_c": -19.4,
        "Wind_Direction": 355,
        "Wind_Speed_kt": 16.5
      },
      {
        "Altitude_ft": 13976,
        "Temp_c": -13.3,
        "Dewpoint_c": -19.3,
        "Wind_Direction": 355,
        "Wind_Speed_kt": 16.3
      },
      {
        "Altitude_ft": 13996,
        "Temp_c": -13.4,
        "Dewpoint_c": -19.3,
        "Wind_Direction": 354,
        "Wind_Speed_kt": 16.1
      },
      {
        "Altitude_ft": 14012,
        "Temp_c": -13.4,
        "Dewpoint_c": -19.3,
        "Wind_Direction": 353,
        "Wind_Speed_kt": 15.9
      },
      {
        "Altitude_ft": 14029,
        "Temp_c": -13.5,
        "Dewpoint_c": -19.2,
        "Wind_Direction": 353,
        "Wind_Speed_kt": 15.7
      },
      {
        "Altitude_ft": 14045,
        "Temp_c": -13.5,
        "Dewpoint_c": -19.2,
        "Wind_Direction": 352,
        "Wind_Speed_kt": 15.6
      },
      {
        "Altitude_ft": 14062,
        "Temp_c": -13.6,
        "Dewpoint_c": -19.2,
        "Wind_Direction": 351,
        "Wind_Speed_kt": 15.4
      },
      {
        "Altitude_ft": 14078,
        "Temp_c": -13.6,
        "Dewpoint_c": -19.1,
        "Wind_Direction": 351,
        "Wind_Speed_kt": 15.4
      },
      {
        "Altitude_ft": 14091,
        "Temp_c": -13.7,
        "Dewpoint_c": -19.1,
        "Wind_Direction": 350,
        "Wind_Speed_kt": 15.2
      },
      {
        "Altitude_ft": 14104,
        "Temp_c": -13.7,
        "Dewpoint_c": -19,
        "Wind_Direction": 349,
        "Wind_Speed_kt": 15
      },
      {
        "Altitude_ft": 14121,
        "Temp_c": -13.7,
        "Dewpoint_c": -19,
        "Wind_Direction": 349,
        "Wind_Speed_kt": 15
      },
      {
        "Altitude_ft": 14134,
        "Temp_c": -13.8,
        "Dewpoint_c": -19,
        "Wind_Direction": 349,
        "Wind_Speed_kt": 15
      },
      {
        "Altitude_ft": 14154,
        "Temp_c": -13.8,
        "Dewpoint_c": -18.9,
        "Wind_Direction": 349,
        "Wind_Speed_kt": 14.8
      },
      {
        "Altitude_ft": 14170,
        "Temp_c": -13.9,
        "Dewpoint_c": -18.9,
        "Wind_Direction": 349,
        "Wind_Speed_kt": 14.8
      },
      {
        "Altitude_ft": 14190,
        "Temp_c": -13.9,
        "Dewpoint_c": -18.9,
        "Wind_Direction": 348,
        "Wind_Speed_kt": 14.8
      },
      {
        "Altitude_ft": 14209,
        "Temp_c": -14,
        "Dewpoint_c": -18.9,
        "Wind_Direction": 348,
        "Wind_Speed_kt": 14.8
      },
      {
        "Altitude_ft": 14229,
        "Temp_c": -14,
        "Dewpoint_c": -19,
        "Wind_Direction": 348,
        "Wind_Speed_kt": 14.8
      },
      {
        "Altitude_ft": 14249,
        "Temp_c": -14.1,
        "Dewpoint_c": -19,
        "Wind_Direction": 348,
        "Wind_Speed_kt": 14.6
      },
      {
        "Altitude_ft": 14265,
        "Temp_c": -14.1,
        "Dewpoint_c": -19,
        "Wind_Direction": 348,
        "Wind_Speed_kt": 14.6
      },
      {
        "Altitude_ft": 14285,
        "Temp_c": -14.1,
        "Dewpoint_c": -19,
        "Wind_Direction": 348,
        "Wind_Speed_kt": 14.6
      },
      {
        "Altitude_ft": 14304,
        "Temp_c": -14.2,
        "Dewpoint_c": -19,
        "Wind_Direction": 348,
        "Wind_Speed_kt": 14.6
      },
      {
        "Altitude_ft": 14321,
        "Temp_c": -14.2,
        "Dewpoint_c": -19.1,
        "Wind_Direction": 347,
        "Wind_Speed_kt": 14.6
      },
      {
        "Altitude_ft": 14341,
        "Temp_c": -14.3,
        "Dewpoint_c": -19.1,
        "Wind_Direction": 347,
        "Wind_Speed_kt": 14.4
      },
      {
        "Altitude_ft": 14360,
        "Temp_c": -14.3,
        "Dewpoint_c": -19.1,
        "Wind_Direction": 347,
        "Wind_Speed_kt": 14.4
      },
      {
        "Altitude_ft": 14377,
        "Temp_c": -14.4,
        "Dewpoint_c": -19.1,
        "Wind_Direction": 347,
        "Wind_Speed_kt": 14.4
      },
      {
        "Altitude_ft": 14396,
        "Temp_c": -14.4,
        "Dewpoint_c": -19.2,
        "Wind_Direction": 347,
        "Wind_Speed_kt": 14.4
      },
      {
        "Altitude_ft": 14416,
        "Temp_c": -14.5,
        "Dewpoint_c": -19.2,
        "Wind_Direction": 347,
        "Wind_Speed_kt": 14.4
      },
      {
        "Altitude_ft": 14429,
        "Temp_c": -14.5,
        "Dewpoint_c": -19.2,
        "Wind_Direction": 347,
        "Wind_Speed_kt": 14.4
      },
      {
        "Altitude_ft": 14452,
        "Temp_c": -14.6,
        "Dewpoint_c": -19.3,
        "Wind_Direction": 346,
        "Wind_Speed_kt": 14.2
      },
      {
        "Altitude_ft": 14472,
        "Temp_c": -14.6,
        "Dewpoint_c": -19.3,
        "Wind_Direction": 346,
        "Wind_Speed_kt": 14.2
      },
      {
        "Altitude_ft": 14491,
        "Temp_c": -14.7,
        "Dewpoint_c": -19.4,
        "Wind_Direction": 346,
        "Wind_Speed_kt": 14.4
      },
      {
        "Altitude_ft": 14511,
        "Temp_c": -14.7,
        "Dewpoint_c": -19.5,
        "Wind_Direction": 345,
        "Wind_Speed_kt": 14.4
      },
      {
        "Altitude_ft": 14528,
        "Temp_c": -14.8,
        "Dewpoint_c": -19.5,
        "Wind_Direction": 345,
        "Wind_Speed_kt": 14.6
      },
      {
        "Altitude_ft": 14547,
        "Temp_c": -14.8,
        "Dewpoint_c": -19.6,
        "Wind_Direction": 345,
        "Wind_Speed_kt": 14.8
      },
      {
        "Altitude_ft": 14567,
        "Temp_c": -14.9,
        "Dewpoint_c": -19.6,
        "Wind_Direction": 344,
        "Wind_Speed_kt": 14.8
      },
      {
        "Altitude_ft": 14580,
        "Temp_c": -14.9,
        "Dewpoint_c": -19.7,
        "Wind_Direction": 344,
        "Wind_Speed_kt": 15
      },
      {
        "Altitude_ft": 14596,
        "Temp_c": -14.9,
        "Dewpoint_c": -19.8,
        "Wind_Direction": 344,
        "Wind_Speed_kt": 15
      },
      {
        "Altitude_ft": 14610,
        "Temp_c": -15,
        "Dewpoint_c": -19.8,
        "Wind_Direction": 343,
        "Wind_Speed_kt": 15.2
      },
      {
        "Altitude_ft": 14626,
        "Temp_c": -15,
        "Dewpoint_c": -19.9,
        "Wind_Direction": 343,
        "Wind_Speed_kt": 15.4
      },
      {
        "Altitude_ft": 14639,
        "Temp_c": -15.1,
        "Dewpoint_c": -19.9,
        "Wind_Direction": 343,
        "Wind_Speed_kt": 15.4
      },
      {
        "Altitude_ft": 14656,
        "Temp_c": -15.1,
        "Dewpoint_c": -20,
        "Wind_Direction": 343,
        "Wind_Speed_kt": 15.6
      },
      {
        "Altitude_ft": 14675,
        "Temp_c": -15.2,
        "Dewpoint_c": -20.1,
        "Wind_Direction": 342,
        "Wind_Speed_kt": 15.7
      },
      {
        "Altitude_ft": 14692,
        "Temp_c": -15.2,
        "Dewpoint_c": -20.2,
        "Wind_Direction": 342,
        "Wind_Speed_kt": 15.7
      },
      {
        "Altitude_ft": 14711,
        "Temp_c": -15.2,
        "Dewpoint_c": -20.2,
        "Wind_Direction": 342,
        "Wind_Speed_kt": 15.9
      },
      {
        "Altitude_ft": 14728,
        "Temp_c": -15.3,
        "Dewpoint_c": -20.3,
        "Wind_Direction": 341,
        "Wind_Speed_kt": 16.1
      },
      {
        "Altitude_ft": 14744,
        "Temp_c": -15.3,
        "Dewpoint_c": -20.4,
        "Wind_Direction": 341,
        "Wind_Speed_kt": 16.1
      },
      {
        "Altitude_ft": 14764,
        "Temp_c": -15.4,
        "Dewpoint_c": -20.5,
        "Wind_Direction": 341,
        "Wind_Speed_kt": 16.3
      },
      {
        "Altitude_ft": 14787,
        "Temp_c": -15.4,
        "Dewpoint_c": -20.5,
        "Wind_Direction": 341,
        "Wind_Speed_kt": 16.5
      },
      {
        "Altitude_ft": 14813,
        "Temp_c": -15.4,
        "Dewpoint_c": -20.6,
        "Wind_Direction": 340,
        "Wind_Speed_kt": 16.5
      },
      {
        "Altitude_ft": 14836,
        "Temp_c": -15.5,
        "Dewpoint_c": -20.7,
        "Wind_Direction": 340,
        "Wind_Speed_kt": 16.7
      },
      {
        "Altitude_ft": 14859,
        "Temp_c": -15.5,
        "Dewpoint_c": -20.8,
        "Wind_Direction": 341,
        "Wind_Speed_kt": 16.7
      },
      {
        "Altitude_ft": 14885,
        "Temp_c": -15.6,
        "Dewpoint_c": -20.8,
        "Wind_Direction": 341,
        "Wind_Speed_kt": 16.9
      },
      {
        "Altitude_ft": 14905,
        "Temp_c": -15.6,
        "Dewpoint_c": -20.9,
        "Wind_Direction": 342,
        "Wind_Speed_kt": 16.9
      },
      {
        "Altitude_ft": 14921,
        "Temp_c": -15.6,
        "Dewpoint_c": -21,
        "Wind_Direction": 342,
        "Wind_Speed_kt": 16.9
      },
      {
        "Altitude_ft": 14941,
        "Temp_c": -15.7,
        "Dewpoint_c": -21.1,
        "Wind_Direction": 343,
        "Wind_Speed_kt": 17.1
      },
      {
        "Altitude_ft": 14961,
        "Temp_c": -15.7,
        "Dewpoint_c": -21.3,
        "Wind_Direction": 343,
        "Wind_Speed_kt": 17.1
      },
      {
        "Altitude_ft": 14977,
        "Temp_c": -15.7,
        "Dewpoint_c": -21.5,
        "Wind_Direction": 344,
        "Wind_Speed_kt": 17.1
      },
      {
        "Altitude_ft": 14997,
        "Temp_c": -15.7,
        "Dewpoint_c": -21.7,
        "Wind_Direction": 344,
        "Wind_Speed_kt": 17.3
      },
      {
        "Altitude_ft": 15013,
        "Temp_c": -15.8,
        "Dewpoint_c": -21.9,
        "Wind_Direction": 345,
        "Wind_Speed_kt": 17.3
      },
      {
        "Altitude_ft": 15030,
        "Temp_c": -15.8,
        "Dewpoint_c": -22,
        "Wind_Direction": 345,
        "Wind_Speed_kt": 17.3
      },
      {
        "Altitude_ft": 15046,
        "Temp_c": -15.8,
        "Dewpoint_c": -22.2,
        "Wind_Direction": 346,
        "Wind_Speed_kt": 17.5
      },
      {
        "Altitude_ft": 15062,
        "Temp_c": -15.8,
        "Dewpoint_c": -22.4,
        "Wind_Direction": 346,
        "Wind_Speed_kt": 17.5
      },
      {
        "Altitude_ft": 15079,
        "Temp_c": -15.8,
        "Dewpoint_c": -22.6,
        "Wind_Direction": 347,
        "Wind_Speed_kt": 17.7
      },
      {
        "Altitude_ft": 15098,
        "Temp_c": -15.8,
        "Dewpoint_c": -22.8,
        "Wind_Direction": 347,
        "Wind_Speed_kt": 17.7
      },
      {
        "Altitude_ft": 15115,
        "Temp_c": -15.8,
        "Dewpoint_c": -23,
        "Wind_Direction": 348,
        "Wind_Speed_kt": 17.7
      },
      {
        "Altitude_ft": 15135,
        "Temp_c": -15.8,
        "Dewpoint_c": -23.2,
        "Wind_Direction": 348,
        "Wind_Speed_kt": 17.9
      },
      {
        "Altitude_ft": 15154,
        "Temp_c": -15.8,
        "Dewpoint_c": -23.4,
        "Wind_Direction": 349,
        "Wind_Speed_kt": 17.9
      },
      {
        "Altitude_ft": 15171,
        "Temp_c": -15.8,
        "Dewpoint_c": -23.6,
        "Wind_Direction": 349,
        "Wind_Speed_kt": 18.1
      },
      {
        "Altitude_ft": 15190,
        "Temp_c": -15.8,
        "Dewpoint_c": -23.8,
        "Wind_Direction": 350,
        "Wind_Speed_kt": 18.1
      },
      {
        "Altitude_ft": 15210,
        "Temp_c": -15.8,
        "Dewpoint_c": -24,
        "Wind_Direction": 350,
        "Wind_Speed_kt": 18.1
      },
      {
        "Altitude_ft": 15230,
        "Temp_c": -15.9,
        "Dewpoint_c": -24.2,
        "Wind_Direction": 350,
        "Wind_Speed_kt": 18.1
      },
      {
        "Altitude_ft": 15249,
        "Temp_c": -15.9,
        "Dewpoint_c": -24.5,
        "Wind_Direction": 350,
        "Wind_Speed_kt": 17.9
      },
      {
        "Altitude_ft": 15272,
        "Temp_c": -15.9,
        "Dewpoint_c": -24.7,
        "Wind_Direction": 350,
        "Wind_Speed_kt": 17.7
      },
      {
        "Altitude_ft": 15292,
        "Temp_c": -16,
        "Dewpoint_c": -24.9,
        "Wind_Direction": 350,
        "Wind_Speed_kt": 17.5
      },
      {
        "Altitude_ft": 15308,
        "Temp_c": -16,
        "Dewpoint_c": -25.1,
        "Wind_Direction": 350,
        "Wind_Speed_kt": 17.3
      },
      {
        "Altitude_ft": 15325,
        "Temp_c": -16,
        "Dewpoint_c": -25.3,
        "Wind_Direction": 350,
        "Wind_Speed_kt": 17.3
      },
      {
        "Altitude_ft": 15341,
        "Temp_c": -16.1,
        "Dewpoint_c": -25.6,
        "Wind_Direction": 350,
        "Wind_Speed_kt": 17.1
      },
      {
        "Altitude_ft": 15358,
        "Temp_c": -16.1,
        "Dewpoint_c": -25.8,
        "Wind_Direction": 350,
        "Wind_Speed_kt": 16.9
      },
      {
        "Altitude_ft": 15374,
        "Temp_c": -16.1,
        "Dewpoint_c": -26,
        "Wind_Direction": 350,
        "Wind_Speed_kt": 16.7
      },
      {
        "Altitude_ft": 15390,
        "Temp_c": -16.1,
        "Dewpoint_c": -26.3,
        "Wind_Direction": 350,
        "Wind_Speed_kt": 16.7
      },
      {
        "Altitude_ft": 15407,
        "Temp_c": -16.2,
        "Dewpoint_c": -26.5,
        "Wind_Direction": 350,
        "Wind_Speed_kt": 16.5
      },
      {
        "Altitude_ft": 15423,
        "Temp_c": -16.2,
        "Dewpoint_c": -26.8,
        "Wind_Direction": 349,
        "Wind_Speed_kt": 16.3
      },
      {
        "Altitude_ft": 15440,
        "Temp_c": -16.2,
        "Dewpoint_c": -27,
        "Wind_Direction": 349,
        "Wind_Speed_kt": 16.1
      },
      {
        "Altitude_ft": 15456,
        "Temp_c": -16.2,
        "Dewpoint_c": -27.2,
        "Wind_Direction": 349,
        "Wind_Speed_kt": 15.9
      },
      {
        "Altitude_ft": 15476,
        "Temp_c": -16.2,
        "Dewpoint_c": -27.5,
        "Wind_Direction": 349,
        "Wind_Speed_kt": 15.9
      },
      {
        "Altitude_ft": 15492,
        "Temp_c": -16.2,
        "Dewpoint_c": -27.7,
        "Wind_Direction": 349,
        "Wind_Speed_kt": 15.7
      },
      {
        "Altitude_ft": 15512,
        "Temp_c": -16.2,
        "Dewpoint_c": -27.9,
        "Wind_Direction": 349,
        "Wind_Speed_kt": 15.6
      },
      {
        "Altitude_ft": 15531,
        "Temp_c": -16.2,
        "Dewpoint_c": -28.2,
        "Wind_Direction": 349,
        "Wind_Speed_kt": 15.4
      },
      {
        "Altitude_ft": 15551,
        "Temp_c": -16.2,
        "Dewpoint_c": -28.4,
        "Wind_Direction": 349,
        "Wind_Speed_kt": 15.2
      },
      {
        "Altitude_ft": 15571,
        "Temp_c": -16.2,
        "Dewpoint_c": -28.7,
        "Wind_Direction": 349,
        "Wind_Speed_kt": 15.2
      },
      {
        "Altitude_ft": 15591,
        "Temp_c": -16.2,
        "Dewpoint_c": -28.9,
        "Wind_Direction": 349,
        "Wind_Speed_kt": 15
      },
      {
        "Altitude_ft": 15610,
        "Temp_c": -16.2,
        "Dewpoint_c": -29.2,
        "Wind_Direction": 348,
        "Wind_Speed_kt": 14.8
      },
      {
        "Altitude_ft": 15627,
        "Temp_c": -16.3,
        "Dewpoint_c": -29.5,
        "Wind_Direction": 348,
        "Wind_Speed_kt": 14.6
      },
      {
        "Altitude_ft": 15646,
        "Temp_c": -16.3,
        "Dewpoint_c": -29.7,
        "Wind_Direction": 348,
        "Wind_Speed_kt": 14.4
      },
      {
        "Altitude_ft": 15663,
        "Temp_c": -16.3,
        "Dewpoint_c": -30,
        "Wind_Direction": 348,
        "Wind_Speed_kt": 14.2
      },
      {
        "Altitude_ft": 15689,
        "Temp_c": -16.3,
        "Dewpoint_c": -30.5,
        "Wind_Direction": 347,
        "Wind_Speed_kt": 14
      },
      {
        "Altitude_ft": 15699,
        "Temp_c": -16.3,
        "Dewpoint_c": -30.8,
        "Wind_Direction": 347,
        "Wind_Speed_kt": 14
      },
      {
        "Altitude_ft": 15712,
        "Temp_c": -16.2,
        "Dewpoint_c": -31.1,
        "Wind_Direction": 347,
        "Wind_Speed_kt": 13.8
      },
      {
        "Altitude_ft": 15728,
        "Temp_c": -16.2,
        "Dewpoint_c": -31.5,
        "Wind_Direction": 347,
        "Wind_Speed_kt": 13.6
      },
      {
        "Altitude_ft": 15741,
        "Temp_c": -16.2,
        "Dewpoint_c": -31.9,
        "Wind_Direction": 346,
        "Wind_Speed_kt": 13.4
      },
      {
        "Altitude_ft": 15755,
        "Temp_c": -16.2,
        "Dewpoint_c": -32.3,
        "Wind_Direction": 346,
        "Wind_Speed_kt": 13.2
      },
      {
        "Altitude_ft": 15768,
        "Temp_c": -16.2,
        "Dewpoint_c": -32.8,
        "Wind_Direction": 346,
        "Wind_Speed_kt": 13
      },
      {
        "Altitude_ft": 15784,
        "Temp_c": -16.2,
        "Dewpoint_c": -33.2,
        "Wind_Direction": 345,
        "Wind_Speed_kt": 13
      },
      {
        "Altitude_ft": 15801,
        "Temp_c": -16.2,
        "Dewpoint_c": -33.7,
        "Wind_Direction": 345,
        "Wind_Speed_kt": 12.8
      },
      {
        "Altitude_ft": 15814,
        "Temp_c": -16.2,
        "Dewpoint_c": -34.2,
        "Wind_Direction": 345,
        "Wind_Speed_kt": 12.6
      },
      {
        "Altitude_ft": 15830,
        "Temp_c": -16.1,
        "Dewpoint_c": -34.7,
        "Wind_Direction": 344,
        "Wind_Speed_kt": 12.4
      },
      {
        "Altitude_ft": 15846,
        "Temp_c": -16.1,
        "Dewpoint_c": -35.3,
        "Wind_Direction": 344,
        "Wind_Speed_kt": 12.2
      },
      {
        "Altitude_ft": 15863,
        "Temp_c": -16.1,
        "Dewpoint_c": -35.9,
        "Wind_Direction": 344,
        "Wind_Speed_kt": 12.1
      },
      {
        "Altitude_ft": 15879,
        "Temp_c": -16.1,
        "Dewpoint_c": -36.3,
        "Wind_Direction": 343,
        "Wind_Speed_kt": 12.1
      },
      {
        "Altitude_ft": 15896,
        "Temp_c": -16.1,
        "Dewpoint_c": -36.6,
        "Wind_Direction": 343,
        "Wind_Speed_kt": 11.9
      },
      {
        "Altitude_ft": 15912,
        "Temp_c": -16.1,
        "Dewpoint_c": -36.9,
        "Wind_Direction": 343,
        "Wind_Speed_kt": 11.7
      },
      {
        "Altitude_ft": 15928,
        "Temp_c": -16.2,
        "Dewpoint_c": -37.3,
        "Wind_Direction": 344,
        "Wind_Speed_kt": 11.5
      },
      {
        "Altitude_ft": 15945,
        "Temp_c": -16.2,
        "Dewpoint_c": -37.7,
        "Wind_Direction": 344,
        "Wind_Speed_kt": 11.5
      },
      {
        "Altitude_ft": 15961,
        "Temp_c": -16.2,
        "Dewpoint_c": -38.1,
        "Wind_Direction": 344,
        "Wind_Speed_kt": 11.3
      },
      {
        "Altitude_ft": 15978,
        "Temp_c": -16.2,
        "Dewpoint_c": -38.5,
        "Wind_Direction": 345,
        "Wind_Speed_kt": 11.1
      },
      {
        "Altitude_ft": 15997,
        "Temp_c": -16.3,
        "Dewpoint_c": -38.9,
        "Wind_Direction": 345,
        "Wind_Speed_kt": 11.1
      },
      {
        "Altitude_ft": 16014,
        "Temp_c": -16.3,
        "Dewpoint_c": -39.4,
        "Wind_Direction": 346,
        "Wind_Speed_kt": 10.9
      },
      {
        "Altitude_ft": 16030,
        "Temp_c": -16.3,
        "Dewpoint_c": -39.9,
        "Wind_Direction": 346,
        "Wind_Speed_kt": 10.7
      },
      {
        "Altitude_ft": 16050,
        "Temp_c": -16.3,
        "Dewpoint_c": -40.3,
        "Wind_Direction": 347,
        "Wind_Speed_kt": 10.7
      },
      {
        "Altitude_ft": 16066,
        "Temp_c": -16.4,
        "Dewpoint_c": -40.9,
        "Wind_Direction": 347,
        "Wind_Speed_kt": 10.5
      },
      {
        "Altitude_ft": 16083,
        "Temp_c": -16.4,
        "Dewpoint_c": -41.4,
        "Wind_Direction": 348,
        "Wind_Speed_kt": 10.3
      },
      {
        "Altitude_ft": 16099,
        "Temp_c": -16.4,
        "Dewpoint_c": -41.9,
        "Wind_Direction": 348,
        "Wind_Speed_kt": 10.1
      },
      {
        "Altitude_ft": 16119,
        "Temp_c": -16.5,
        "Dewpoint_c": -42.3,
        "Wind_Direction": 349,
        "Wind_Speed_kt": 10.1
      },
      {
        "Altitude_ft": 16135,
        "Temp_c": -16.5,
        "Dewpoint_c": -42.7,
        "Wind_Direction": 349,
        "Wind_Speed_kt": 9.9
      },
      {
        "Altitude_ft": 16155,
        "Temp_c": -16.5,
        "Dewpoint_c": -43.2,
        "Wind_Direction": 350,
        "Wind_Speed_kt": 9.7
      },
      {
        "Altitude_ft": 16178,
        "Temp_c": -16.5,
        "Dewpoint_c": -43.6,
        "Wind_Direction": 350,
        "Wind_Speed_kt": 9.7
      },
      {
        "Altitude_ft": 16201,
        "Temp_c": -16.5,
        "Dewpoint_c": -44.1,
        "Wind_Direction": 351,
        "Wind_Speed_kt": 9.5
      },
      {
        "Altitude_ft": 16224,
        "Temp_c": -16.6,
        "Dewpoint_c": -44.6,
        "Wind_Direction": 351,
        "Wind_Speed_kt": 9.5
      },
      {
        "Altitude_ft": 16247,
        "Temp_c": -16.6,
        "Dewpoint_c": -45.1,
        "Wind_Direction": 352,
        "Wind_Speed_kt": 9.3
      },
      {
        "Altitude_ft": 16270,
        "Temp_c": -16.6,
        "Dewpoint_c": -45.7,
        "Wind_Direction": 352,
        "Wind_Speed_kt": 9.1
      },
      {
        "Altitude_ft": 16293,
        "Temp_c": -16.6,
        "Dewpoint_c": -46.3,
        "Wind_Direction": 353,
        "Wind_Speed_kt": 9.1
      },
      {
        "Altitude_ft": 16312,
        "Temp_c": -16.7,
        "Dewpoint_c": -46.9,
        "Wind_Direction": 353,
        "Wind_Speed_kt": 9.3
      },
      {
        "Altitude_ft": 16332,
        "Temp_c": -16.7,
        "Dewpoint_c": -47.6,
        "Wind_Direction": 353,
        "Wind_Speed_kt": 9.3
      },
      {
        "Altitude_ft": 16355,
        "Temp_c": -16.7,
        "Dewpoint_c": -48.3,
        "Wind_Direction": 353,
        "Wind_Speed_kt": 9.3
      },
      {
        "Altitude_ft": 16375,
        "Temp_c": -16.7,
        "Dewpoint_c": -49.1,
        "Wind_Direction": 353,
        "Wind_Speed_kt": 9.3
      },
      {
        "Altitude_ft": 16394,
        "Temp_c": -16.8,
        "Dewpoint_c": -49.5,
        "Wind_Direction": 353,
        "Wind_Speed_kt": 9.3
      },
      {
        "Altitude_ft": 16414,
        "Temp_c": -16.8,
        "Dewpoint_c": -49.7,
        "Wind_Direction": 353,
        "Wind_Speed_kt": 9.3
      },
      {
        "Altitude_ft": 16434,
        "Temp_c": -16.8,
        "Dewpoint_c": -50,
        "Wind_Direction": 353,
        "Wind_Speed_kt": 9.5
      },
      {
        "Altitude_ft": 16453,
        "Temp_c": -16.8,
        "Dewpoint_c": -50.3,
        "Wind_Direction": 354,
        "Wind_Speed_kt": 9.5
      },
      {
        "Altitude_ft": 16470,
        "Temp_c": -16.8,
        "Dewpoint_c": -50.6,
        "Wind_Direction": 354,
        "Wind_Speed_kt": 9.5
      },
      {
        "Altitude_ft": 16490,
        "Temp_c": -16.8,
        "Dewpoint_c": -50.8,
        "Wind_Direction": 354,
        "Wind_Speed_kt": 9.5
      },
      {
        "Altitude_ft": 16509,
        "Temp_c": -16.8,
        "Dewpoint_c": -51.2,
        "Wind_Direction": 354,
        "Wind_Speed_kt": 9.5
      },
      {
        "Altitude_ft": 16526,
        "Temp_c": -16.8,
        "Dewpoint_c": -51.5,
        "Wind_Direction": 354,
        "Wind_Speed_kt": 9.5
      },
      {
        "Altitude_ft": 16542,
        "Temp_c": -16.8,
        "Dewpoint_c": -51.8,
        "Wind_Direction": 354,
        "Wind_Speed_kt": 9.7
      },
      {
        "Altitude_ft": 16562,
        "Temp_c": -16.8,
        "Dewpoint_c": -52.1,
        "Wind_Direction": 354,
        "Wind_Speed_kt": 9.7
      },
      {
        "Altitude_ft": 16578,
        "Temp_c": -16.8,
        "Dewpoint_c": -52.5,
        "Wind_Direction": 354,
        "Wind_Speed_kt": 9.7
      },
      {
        "Altitude_ft": 16594,
        "Temp_c": -16.8,
        "Dewpoint_c": -52.9,
        "Wind_Direction": 354,
        "Wind_Speed_kt": 9.7
      },
      {
        "Altitude_ft": 16611,
        "Temp_c": -16.8,
        "Dewpoint_c": -53.2,
        "Wind_Direction": 355,
        "Wind_Speed_kt": 9.7
      },
      {
        "Altitude_ft": 16624,
        "Temp_c": -16.8,
        "Dewpoint_c": -53.5,
        "Wind_Direction": 355,
        "Wind_Speed_kt": 9.7
      },
      {
        "Altitude_ft": 16637,
        "Temp_c": -16.8,
        "Dewpoint_c": -53.7,
        "Wind_Direction": 355,
        "Wind_Speed_kt": 9.9
      },
      {
        "Altitude_ft": 16650,
        "Temp_c": -16.9,
        "Dewpoint_c": -53.9,
        "Wind_Direction": 354,
        "Wind_Speed_kt": 9.7
      },
      {
        "Altitude_ft": 16663,
        "Temp_c": -16.9,
        "Dewpoint_c": -54.1,
        "Wind_Direction": 354,
        "Wind_Speed_kt": 9.7
      },
      {
        "Altitude_ft": 16677,
        "Temp_c": -16.9,
        "Dewpoint_c": -54.3,
        "Wind_Direction": 353,
        "Wind_Speed_kt": 9.7
      },
      {
        "Altitude_ft": 16693,
        "Temp_c": -16.9,
        "Dewpoint_c": -54.5,
        "Wind_Direction": 353,
        "Wind_Speed_kt": 9.7
      },
      {
        "Altitude_ft": 16713,
        "Temp_c": -16.9,
        "Dewpoint_c": -54.7,
        "Wind_Direction": 352,
        "Wind_Speed_kt": 9.7
      },
      {
        "Altitude_ft": 16729,
        "Temp_c": -16.9,
        "Dewpoint_c": -54.9,
        "Wind_Direction": 351,
        "Wind_Speed_kt": 9.7
      },
      {
        "Altitude_ft": 16745,
        "Temp_c": -17,
        "Dewpoint_c": -55.1,
        "Wind_Direction": 351,
        "Wind_Speed_kt": 9.5
      },
      {
        "Altitude_ft": 16765,
        "Temp_c": -17,
        "Dewpoint_c": -55.3,
        "Wind_Direction": 350,
        "Wind_Speed_kt": 9.5
      },
      {
        "Altitude_ft": 16781,
        "Temp_c": -17,
        "Dewpoint_c": -55.6,
        "Wind_Direction": 350,
        "Wind_Speed_kt": 9.5
      },
      {
        "Altitude_ft": 16798,
        "Temp_c": -17,
        "Dewpoint_c": -55.8,
        "Wind_Direction": 349,
        "Wind_Speed_kt": 9.5
      },
      {
        "Altitude_ft": 16814,
        "Temp_c": -17,
        "Dewpoint_c": -56,
        "Wind_Direction": 349,
        "Wind_Speed_kt": 9.5
      },
      {
        "Altitude_ft": 16831,
        "Temp_c": -17,
        "Dewpoint_c": -56.3,
        "Wind_Direction": 348,
        "Wind_Speed_kt": 9.5
      },
      {
        "Altitude_ft": 16847,
        "Temp_c": -17.1,
        "Dewpoint_c": -56.3,
        "Wind_Direction": 347,
        "Wind_Speed_kt": 9.5
      },
      {
        "Altitude_ft": 16864,
        "Temp_c": -17.1,
        "Dewpoint_c": -56.4,
        "Wind_Direction": 347,
        "Wind_Speed_kt": 9.3
      },
      {
        "Altitude_ft": 16877,
        "Temp_c": -17.1,
        "Dewpoint_c": -56.4,
        "Wind_Direction": 346,
        "Wind_Speed_kt": 9.3
      },
      {
        "Altitude_ft": 16890,
        "Temp_c": -17.1,
        "Dewpoint_c": -56.5,
        "Wind_Direction": 346,
        "Wind_Speed_kt": 9.3
      },
      {
        "Altitude_ft": 16903,
        "Temp_c": -17.2,
        "Dewpoint_c": -56.5,
        "Wind_Direction": 345,
        "Wind_Speed_kt": 9.3
      },
      {
        "Altitude_ft": 16916,
        "Temp_c": -17.2,
        "Dewpoint_c": -56.6,
        "Wind_Direction": 344,
        "Wind_Speed_kt": 9.3
      },
      {
        "Altitude_ft": 16929,
        "Temp_c": -17.2,
        "Dewpoint_c": -56.6,
        "Wind_Direction": 344,
        "Wind_Speed_kt": 9.3
      },
      {
        "Altitude_ft": 16946,
        "Temp_c": -17.3,
        "Dewpoint_c": -56.7,
        "Wind_Direction": 343,
        "Wind_Speed_kt": 9.3
      },
      {
        "Altitude_ft": 16962,
        "Temp_c": -17.3,
        "Dewpoint_c": -56.7,
        "Wind_Direction": 344,
        "Wind_Speed_kt": 9.3
      },
      {
        "Altitude_ft": 16982,
        "Temp_c": -17.3,
        "Dewpoint_c": -56.8,
        "Wind_Direction": 344,
        "Wind_Speed_kt": 9.5
      },
      {
        "Altitude_ft": 16998,
        "Temp_c": -17.4,
        "Dewpoint_c": -56.8,
        "Wind_Direction": 344,
        "Wind_Speed_kt": 9.5
      },
      {
        "Altitude_ft": 17018,
        "Temp_c": -17.4,
        "Dewpoint_c": -56.9,
        "Wind_Direction": 345,
        "Wind_Speed_kt": 9.5
      },
      {
        "Altitude_ft": 17037,
        "Temp_c": -17.4,
        "Dewpoint_c": -56.9,
        "Wind_Direction": 345,
        "Wind_Speed_kt": 9.7
      },
      {
        "Altitude_ft": 17047,
        "Temp_c": -17.5,
        "Dewpoint_c": -56.9,
        "Wind_Direction": 346,
        "Wind_Speed_kt": 9.7
      },
      {
        "Altitude_ft": 17073,
        "Temp_c": -17.5,
        "Dewpoint_c": -57,
        "Wind_Direction": 346,
        "Wind_Speed_kt": 9.9
      },
      {
        "Altitude_ft": 17090,
        "Temp_c": -17.5,
        "Dewpoint_c": -57,
        "Wind_Direction": 347,
        "Wind_Speed_kt": 9.9
      },
      {
        "Altitude_ft": 17106,
        "Temp_c": -17.5,
        "Dewpoint_c": -57,
        "Wind_Direction": 347,
        "Wind_Speed_kt": 10.1
      },
      {
        "Altitude_ft": 17123,
        "Temp_c": -17.6,
        "Dewpoint_c": -57,
        "Wind_Direction": 347,
        "Wind_Speed_kt": 10.1
      },
      {
        "Altitude_ft": 17136,
        "Temp_c": -17.6,
        "Dewpoint_c": -57.1,
        "Wind_Direction": 348,
        "Wind_Speed_kt": 10.1
      },
      {
        "Altitude_ft": 17152,
        "Temp_c": -17.6,
        "Dewpoint_c": -57.1,
        "Wind_Direction": 348,
        "Wind_Speed_kt": 10.3
      },
      {
        "Altitude_ft": 17169,
        "Temp_c": -17.7,
        "Dewpoint_c": -57.1,
        "Wind_Direction": 349,
        "Wind_Speed_kt": 10.3
      },
      {
        "Altitude_ft": 17182,
        "Temp_c": -17.7,
        "Dewpoint_c": -57.1,
        "Wind_Direction": 349,
        "Wind_Speed_kt": 10.5
      },
      {
        "Altitude_ft": 17198,
        "Temp_c": -17.7,
        "Dewpoint_c": -57.2,
        "Wind_Direction": 349,
        "Wind_Speed_kt": 10.5
      },
      {
        "Altitude_ft": 17211,
        "Temp_c": -17.7,
        "Dewpoint_c": -57.2,
        "Wind_Direction": 350,
        "Wind_Speed_kt": 10.5
      },
      {
        "Altitude_ft": 17224,
        "Temp_c": -17.8,
        "Dewpoint_c": -57.2,
        "Wind_Direction": 350,
        "Wind_Speed_kt": 10.7
      },
      {
        "Altitude_ft": 17241,
        "Temp_c": -17.8,
        "Dewpoint_c": -57.2,
        "Wind_Direction": 350,
        "Wind_Speed_kt": 10.7
      },
      {
        "Altitude_ft": 17254,
        "Temp_c": -17.8,
        "Dewpoint_c": -57.3,
        "Wind_Direction": 351,
        "Wind_Speed_kt": 10.9
      },
      {
        "Altitude_ft": 17267,
        "Temp_c": -17.8,
        "Dewpoint_c": -57.3,
        "Wind_Direction": 351,
        "Wind_Speed_kt": 10.9
      },
      {
        "Altitude_ft": 17280,
        "Temp_c": -17.9,
        "Dewpoint_c": -57.3,
        "Wind_Direction": 351,
        "Wind_Speed_kt": 10.9
      },
      {
        "Altitude_ft": 17293,
        "Temp_c": -17.9,
        "Dewpoint_c": -57.4,
        "Wind_Direction": 351,
        "Wind_Speed_kt": 11.1
      },
      {
        "Altitude_ft": 17306,
        "Temp_c": -17.9,
        "Dewpoint_c": -57.4,
        "Wind_Direction": 351,
        "Wind_Speed_kt": 11.1
      },
      {
        "Altitude_ft": 17320,
        "Temp_c": -17.9,
        "Dewpoint_c": -57.4,
        "Wind_Direction": 351,
        "Wind_Speed_kt": 11.1
      },
      {
        "Altitude_ft": 17333,
        "Temp_c": -17.9,
        "Dewpoint_c": -57.4,
        "Wind_Direction": 351,
        "Wind_Speed_kt": 11.1
      },
      {
        "Altitude_ft": 17346,
        "Temp_c": -18,
        "Dewpoint_c": -57.5,
        "Wind_Direction": 351,
        "Wind_Speed_kt": 11.3
      },
      {
        "Altitude_ft": 17356,
        "Temp_c": -18,
        "Dewpoint_c": -57.5,
        "Wind_Direction": 352,
        "Wind_Speed_kt": 11.3
      },
      {
        "Altitude_ft": 17369,
        "Temp_c": -18,
        "Dewpoint_c": -57.5,
        "Wind_Direction": 352,
        "Wind_Speed_kt": 11.3
      },
      {
        "Altitude_ft": 17382,
        "Temp_c": -18,
        "Dewpoint_c": -57.6,
        "Wind_Direction": 352,
        "Wind_Speed_kt": 11.3
      },
      {
        "Altitude_ft": 17395,
        "Temp_c": -18,
        "Dewpoint_c": -57.6,
        "Wind_Direction": 352,
        "Wind_Speed_kt": 11.5
      },
      {
        "Altitude_ft": 17408,
        "Temp_c": -18,
        "Dewpoint_c": -57.6,
        "Wind_Direction": 352,
        "Wind_Speed_kt": 11.5
      },
      {
        "Altitude_ft": 17421,
        "Temp_c": -18.1,
        "Dewpoint_c": -57.6,
        "Wind_Direction": 352,
        "Wind_Speed_kt": 11.5
      },
      {
        "Altitude_ft": 17434,
        "Temp_c": -18.1,
        "Dewpoint_c": -57.7,
        "Wind_Direction": 352,
        "Wind_Speed_kt": 11.7
      },
      {
        "Altitude_ft": 17448,
        "Temp_c": -18.1,
        "Dewpoint_c": -57.7,
        "Wind_Direction": 352,
        "Wind_Speed_kt": 11.7
      },
      {
        "Altitude_ft": 17461,
        "Temp_c": -18.1,
        "Dewpoint_c": -57.7,
        "Wind_Direction": 352,
        "Wind_Speed_kt": 11.7
      },
      {
        "Altitude_ft": 17474,
        "Temp_c": -18.2,
        "Dewpoint_c": -57.7,
        "Wind_Direction": 352,
        "Wind_Speed_kt": 11.7
      },
      {
        "Altitude_ft": 17484,
        "Temp_c": -18.2,
        "Dewpoint_c": -57.7,
        "Wind_Direction": 352,
        "Wind_Speed_kt": 11.9
      },
      {
        "Altitude_ft": 17497,
        "Temp_c": -18.2,
        "Dewpoint_c": -57.7,
        "Wind_Direction": 352,
        "Wind_Speed_kt": 11.9
      },
      {
        "Altitude_ft": 17510,
        "Temp_c": -18.3,
        "Dewpoint_c": -57.8,
        "Wind_Direction": 352,
        "Wind_Speed_kt": 11.9
      },
      {
        "Altitude_ft": 17523,
        "Temp_c": -18.3,
        "Dewpoint_c": -57.8,
        "Wind_Direction": 352,
        "Wind_Speed_kt": 11.9
      },
      {
        "Altitude_ft": 17536,
        "Temp_c": -18.3,
        "Dewpoint_c": -57.8,
        "Wind_Direction": 353,
        "Wind_Speed_kt": 11.9
      },
      {
        "Altitude_ft": 17549,
        "Temp_c": -18.4,
        "Dewpoint_c": -57.8,
        "Wind_Direction": 353,
        "Wind_Speed_kt": 11.9
      },
      {
        "Altitude_ft": 17562,
        "Temp_c": -18.4,
        "Dewpoint_c": -57.8,
        "Wind_Direction": 353,
        "Wind_Speed_kt": 11.9
      },
      {
        "Altitude_ft": 17575,
        "Temp_c": -18.4,
        "Dewpoint_c": -57.8,
        "Wind_Direction": 354,
        "Wind_Speed_kt": 11.9
      },
      {
        "Altitude_ft": 17589,
        "Temp_c": -18.5,
        "Dewpoint_c": -57.9,
        "Wind_Direction": 354,
        "Wind_Speed_kt": 11.9
      },
      {
        "Altitude_ft": 17602,
        "Temp_c": -18.5,
        "Dewpoint_c": -57.9,
        "Wind_Direction": 355,
        "Wind_Speed_kt": 11.9
      },
      {
        "Altitude_ft": 17615,
        "Temp_c": -18.5,
        "Dewpoint_c": -57.9,
        "Wind_Direction": 355,
        "Wind_Speed_kt": 11.9
      },
      {
        "Altitude_ft": 17631,
        "Temp_c": -18.6,
        "Dewpoint_c": -57.8,
        "Wind_Direction": 355,
        "Wind_Speed_kt": 11.9
      },
      {
        "Altitude_ft": 17644,
        "Temp_c": -18.6,
        "Dewpoint_c": -57.8,
        "Wind_Direction": 356,
        "Wind_Speed_kt": 11.9
      },
      {
        "Altitude_ft": 17657,
        "Temp_c": -18.6,
        "Dewpoint_c": -57.8,
        "Wind_Direction": 356,
        "Wind_Speed_kt": 11.9
      },
      {
        "Altitude_ft": 17671,
        "Temp_c": -18.7,
        "Dewpoint_c": -57.8,
        "Wind_Direction": 357,
        "Wind_Speed_kt": 11.9
      },
      {
        "Altitude_ft": 17684,
        "Temp_c": -18.7,
        "Dewpoint_c": -57.8,
        "Wind_Direction": 357,
        "Wind_Speed_kt": 11.9
      },
      {
        "Altitude_ft": 17700,
        "Temp_c": -18.8,
        "Dewpoint_c": -57.8,
        "Wind_Direction": 357,
        "Wind_Speed_kt": 11.9
      },
      {
        "Altitude_ft": 17713,
        "Temp_c": -18.8,
        "Dewpoint_c": -57.7,
        "Wind_Direction": 358,
        "Wind_Speed_kt": 11.9
      },
      {
        "Altitude_ft": 17730,
        "Temp_c": -18.8,
        "Dewpoint_c": -57.7,
        "Wind_Direction": 358,
        "Wind_Speed_kt": 12.1
      },
      {
        "Altitude_ft": 17743,
        "Temp_c": -18.9,
        "Dewpoint_c": -57.7,
        "Wind_Direction": 358,
        "Wind_Speed_kt": 12.1
      },
      {
        "Altitude_ft": 17759,
        "Temp_c": -18.9,
        "Dewpoint_c": -57.7,
        "Wind_Direction": 359,
        "Wind_Speed_kt": 12.1
      },
      {
        "Altitude_ft": 17772,
        "Temp_c": -18.9,
        "Dewpoint_c": -57.7,
        "Wind_Direction": 359,
        "Wind_Speed_kt": 12.1
      },
      {
        "Altitude_ft": 17785,
        "Temp_c": -19,
        "Dewpoint_c": -57.7,
        "Wind_Direction": 360,
        "Wind_Speed_kt": 12.1
      },
      {
        "Altitude_ft": 17799,
        "Temp_c": -19,
        "Dewpoint_c": -57.7,
        "Wind_Direction": 360,
        "Wind_Speed_kt": 12.1
      },
      {
        "Altitude_ft": 17812,
        "Temp_c": -19,
        "Dewpoint_c": -57.7,
        "Wind_Direction": 360,
        "Wind_Speed_kt": 12.1
      },
      {
        "Altitude_ft": 17825,
        "Temp_c": -19.1,
        "Dewpoint_c": -57.8,
        "Wind_Direction": 360,
        "Wind_Speed_kt": 12.2
      },
      {
        "Altitude_ft": 17838,
        "Temp_c": -19.1,
        "Dewpoint_c": -57.8,
        "Wind_Direction": 359,
        "Wind_Speed_kt": 12.2
      },
      {
        "Altitude_ft": 17851,
        "Temp_c": -19.1,
        "Dewpoint_c": -57.8,
        "Wind_Direction": 359,
        "Wind_Speed_kt": 12.2
      },
      {
        "Altitude_ft": 17867,
        "Temp_c": -19.2,
        "Dewpoint_c": -57.8,
        "Wind_Direction": 359,
        "Wind_Speed_kt": 12.4
      },
      {
        "Altitude_ft": 17881,
        "Temp_c": -19.2,
        "Dewpoint_c": -57.9,
        "Wind_Direction": 359,
        "Wind_Speed_kt": 12.4
      },
      {
        "Altitude_ft": 17894,
        "Temp_c": -19.3,
        "Dewpoint_c": -57.9,
        "Wind_Direction": 358,
        "Wind_Speed_kt": 12.4
      },
      {
        "Altitude_ft": 17907,
        "Temp_c": -19.3,
        "Dewpoint_c": -57.9,
        "Wind_Direction": 358,
        "Wind_Speed_kt": 12.6
      },
      {
        "Altitude_ft": 17923,
        "Temp_c": -19.3,
        "Dewpoint_c": -58,
        "Wind_Direction": 358,
        "Wind_Speed_kt": 12.6
      },
      {
        "Altitude_ft": 17936,
        "Temp_c": -19.4,
        "Dewpoint_c": -58,
        "Wind_Direction": 358,
        "Wind_Speed_kt": 12.8
      },
      {
        "Altitude_ft": 17953,
        "Temp_c": -19.4,
        "Dewpoint_c": -58,
        "Wind_Direction": 358,
        "Wind_Speed_kt": 12.8
      },
      {
        "Altitude_ft": 17969,
        "Temp_c": -19.4,
        "Dewpoint_c": -58.1,
        "Wind_Direction": 357,
        "Wind_Speed_kt": 12.8
      },
      {
        "Altitude_ft": 17986,
        "Temp_c": -19.5,
        "Dewpoint_c": -58.1,
        "Wind_Direction": 357,
        "Wind_Speed_kt": 13
      },
      {
        "Altitude_ft": 17999,
        "Temp_c": -19.5,
        "Dewpoint_c": -58.2,
        "Wind_Direction": 357,
        "Wind_Speed_kt": 13
      },
      {
        "Altitude_ft": 18012,
        "Temp_c": -19.5,
        "Dewpoint_c": -58.2,
        "Wind_Direction": 357,
        "Wind_Speed_kt": 13.2
      },
      {
        "Altitude_ft": 18025,
        "Temp_c": -19.6,
        "Dewpoint_c": -58.3,
        "Wind_Direction": 357,
        "Wind_Speed_kt": 13.2
      },
      {
        "Altitude_ft": 18038,
        "Temp_c": -19.6,
        "Dewpoint_c": -58.3,
        "Wind_Direction": 356,
        "Wind_Speed_kt": 13.2
      },
      {
        "Altitude_ft": 18051,
        "Temp_c": -19.6,
        "Dewpoint_c": -58.4,
        "Wind_Direction": 356,
        "Wind_Speed_kt": 13.4
      },
      {
        "Altitude_ft": 18064,
        "Temp_c": -19.7,
        "Dewpoint_c": -58.4,
        "Wind_Direction": 356,
        "Wind_Speed_kt": 13.4
      },
      {
        "Altitude_ft": 18077,
        "Temp_c": -19.7,
        "Dewpoint_c": -58.5,
        "Wind_Direction": 356,
        "Wind_Speed_kt": 13.6
      },
      {
        "Altitude_ft": 18091,
        "Temp_c": -19.8,
        "Dewpoint_c": -58.6,
        "Wind_Direction": 355,
        "Wind_Speed_kt": 13.4
      },
      {
        "Altitude_ft": 18104,
        "Temp_c": -19.8,
        "Dewpoint_c": -58.6,
        "Wind_Direction": 355,
        "Wind_Speed_kt": 13.4
      },
      {
        "Altitude_ft": 18117,
        "Temp_c": -19.8,
        "Dewpoint_c": -58.7,
        "Wind_Direction": 355,
        "Wind_Speed_kt": 13.2
      },
      {
        "Altitude_ft": 18130,
        "Temp_c": -19.9,
        "Dewpoint_c": -58.7,
        "Wind_Direction": 354,
        "Wind_Speed_kt": 13.2
      },
      {
        "Altitude_ft": 18143,
        "Temp_c": -19.9,
        "Dewpoint_c": -58.8,
        "Wind_Direction": 354,
        "Wind_Speed_kt": 13
      },
      {
        "Altitude_ft": 18159,
        "Temp_c": -19.9,
        "Dewpoint_c": -58.9,
        "Wind_Direction": 354,
        "Wind_Speed_kt": 13
      },
      {
        "Altitude_ft": 18173,
        "Temp_c": -20,
        "Dewpoint_c": -58.9,
        "Wind_Direction": 353,
        "Wind_Speed_kt": 12.8
      },
      {
        "Altitude_ft": 18189,
        "Temp_c": -20,
        "Dewpoint_c": -58.9,
        "Wind_Direction": 353,
        "Wind_Speed_kt": 12.8
      },
      {
        "Altitude_ft": 18202,
        "Temp_c": -20.1,
        "Dewpoint_c": -58.9,
        "Wind_Direction": 352,
        "Wind_Speed_kt": 12.6
      },
      {
        "Altitude_ft": 18219,
        "Temp_c": -20.1,
        "Dewpoint_c": -59,
        "Wind_Direction": 352,
        "Wind_Speed_kt": 12.6
      },
      {
        "Altitude_ft": 18235,
        "Temp_c": -20.1,
        "Dewpoint_c": -59,
        "Wind_Direction": 352,
        "Wind_Speed_kt": 12.4
      },
      {
        "Altitude_ft": 18248,
        "Temp_c": -20.2,
        "Dewpoint_c": -59,
        "Wind_Direction": 351,
        "Wind_Speed_kt": 12.4
      },
      {
        "Altitude_ft": 18261,
        "Temp_c": -20.2,
        "Dewpoint_c": -59,
        "Wind_Direction": 351,
        "Wind_Speed_kt": 12.4
      },
      {
        "Altitude_ft": 18274,
        "Temp_c": -20.3,
        "Dewpoint_c": -59.1,
        "Wind_Direction": 350,
        "Wind_Speed_kt": 12.2
      },
      {
        "Altitude_ft": 18287,
        "Temp_c": -20.3,
        "Dewpoint_c": -59.1,
        "Wind_Direction": 350,
        "Wind_Speed_kt": 12.2
      },
      {
        "Altitude_ft": 18301,
        "Temp_c": -20.3,
        "Dewpoint_c": -59.1,
        "Wind_Direction": 350,
        "Wind_Speed_kt": 12.1
      },
      {
        "Altitude_ft": 18314,
        "Temp_c": -20.4,
        "Dewpoint_c": -59.1,
        "Wind_Direction": 349,
        "Wind_Speed_kt": 12.1
      },
      {
        "Altitude_ft": 18327,
        "Temp_c": -20.4,
        "Dewpoint_c": -59.2,
        "Wind_Direction": 349,
        "Wind_Speed_kt": 11.9
      },
      {
        "Altitude_ft": 18340,
        "Temp_c": -20.5,
        "Dewpoint_c": -59.2,
        "Wind_Direction": 348,
        "Wind_Speed_kt": 11.9
      },
      {
        "Altitude_ft": 18356,
        "Temp_c": -20.5,
        "Dewpoint_c": -59.2,
        "Wind_Direction": 348,
        "Wind_Speed_kt": 11.9
      },
      {
        "Altitude_ft": 18369,
        "Temp_c": -20.5,
        "Dewpoint_c": -59.3,
        "Wind_Direction": 348,
        "Wind_Speed_kt": 11.7
      },
      {
        "Altitude_ft": 18383,
        "Temp_c": -20.6,
        "Dewpoint_c": -59.3,
        "Wind_Direction": 348,
        "Wind_Speed_kt": 11.7
      },
      {
        "Altitude_ft": 18399,
        "Temp_c": -20.6,
        "Dewpoint_c": -59.3,
        "Wind_Direction": 348,
        "Wind_Speed_kt": 11.7
      },
      {
        "Altitude_ft": 18415,
        "Temp_c": -20.7,
        "Dewpoint_c": -59.4,
        "Wind_Direction": 348,
        "Wind_Speed_kt": 11.7
      },
      {
        "Altitude_ft": 18432,
        "Temp_c": -20.7,
        "Dewpoint_c": -59.4,
        "Wind_Direction": 348,
        "Wind_Speed_kt": 11.7
      },
      {
        "Altitude_ft": 18448,
        "Temp_c": -20.8,
        "Dewpoint_c": -59.5,
        "Wind_Direction": 348,
        "Wind_Speed_kt": 11.5
      },
      {
        "Altitude_ft": 18465,
        "Temp_c": -20.8,
        "Dewpoint_c": -59.5,
        "Wind_Direction": 348,
        "Wind_Speed_kt": 11.5
      },
      {
        "Altitude_ft": 18481,
        "Temp_c": -20.9,
        "Dewpoint_c": -59.5,
        "Wind_Direction": 348,
        "Wind_Speed_kt": 11.5
      },
      {
        "Altitude_ft": 18497,
        "Temp_c": -20.9,
        "Dewpoint_c": -59.6,
        "Wind_Direction": 348,
        "Wind_Speed_kt": 11.5
      },
      {
        "Altitude_ft": 18514,
        "Temp_c": -20.9,
        "Dewpoint_c": -59.6,
        "Wind_Direction": 348,
        "Wind_Speed_kt": 11.5
      },
      {
        "Altitude_ft": 18530,
        "Temp_c": -21,
        "Dewpoint_c": -59.6,
        "Wind_Direction": 348,
        "Wind_Speed_kt": 11.3
      },
      {
        "Altitude_ft": 18553,
        "Temp_c": -21.1,
        "Dewpoint_c": -59.7,
        "Wind_Direction": 348,
        "Wind_Speed_kt": 11.3
      },
      {
        "Altitude_ft": 18563,
        "Temp_c": -21.1,
        "Dewpoint_c": -59.7,
        "Wind_Direction": 348,
        "Wind_Speed_kt": 11.3
      },
      {
        "Altitude_ft": 18576,
        "Temp_c": -21.1,
        "Dewpoint_c": -59.8,
        "Wind_Direction": 348,
        "Wind_Speed_kt": 11.3
      },
      {
        "Altitude_ft": 18593,
        "Temp_c": -21.2,
        "Dewpoint_c": -59.8,
        "Wind_Direction": 348,
        "Wind_Speed_kt": 11.3
      },
      {
        "Altitude_ft": 18609,
        "Temp_c": -21.2,
        "Dewpoint_c": -59.8,
        "Wind_Direction": 348,
        "Wind_Speed_kt": 11.1
      },
      {
        "Altitude_ft": 18622,
        "Temp_c": -21.3,
        "Dewpoint_c": -59.9,
        "Wind_Direction": 348,
        "Wind_Speed_kt": 11.1
      },
      {
        "Altitude_ft": 18638,
        "Temp_c": -21.3,
        "Dewpoint_c": -59.9,
        "Wind_Direction": 348,
        "Wind_Speed_kt": 11.1
      },
      {
        "Altitude_ft": 18655,
        "Temp_c": -21.4,
        "Dewpoint_c": -60,
        "Wind_Direction": 348,
        "Wind_Speed_kt": 11.1
      },
      {
        "Altitude_ft": 18675,
        "Temp_c": -21.4,
        "Dewpoint_c": -60,
        "Wind_Direction": 348,
        "Wind_Speed_kt": 11.1
      },
      {
        "Altitude_ft": 18694,
        "Temp_c": -21.5,
        "Dewpoint_c": -60,
        "Wind_Direction": 348,
        "Wind_Speed_kt": 11.1
      },
      {
        "Altitude_ft": 18714,
        "Temp_c": -21.5,
        "Dewpoint_c": -60.1,
        "Wind_Direction": 348,
        "Wind_Speed_kt": 11.3
      },
      {
        "Altitude_ft": 18734,
        "Temp_c": -21.6,
        "Dewpoint_c": -60.1,
        "Wind_Direction": 347,
        "Wind_Speed_kt": 11.5
      },
      {
        "Altitude_ft": 18753,
        "Temp_c": -21.6,
        "Dewpoint_c": -60.2,
        "Wind_Direction": 347,
        "Wind_Speed_kt": 11.5
      },
      {
        "Altitude_ft": 18770,
        "Temp_c": -21.7,
        "Dewpoint_c": -60.2,
        "Wind_Direction": 346,
        "Wind_Speed_kt": 11.7
      },
      {
        "Altitude_ft": 18796,
        "Temp_c": -21.7,
        "Dewpoint_c": -60.3,
        "Wind_Direction": 346,
        "Wind_Speed_kt": 11.9
      },
      {
        "Altitude_ft": 18809,
        "Temp_c": -21.8,
        "Dewpoint_c": -60.3,
        "Wind_Direction": 345,
        "Wind_Speed_kt": 11.9
      },
      {
        "Altitude_ft": 18825,
        "Temp_c": -21.8,
        "Dewpoint_c": -60.3,
        "Wind_Direction": 345,
        "Wind_Speed_kt": 12.1
      },
      {
        "Altitude_ft": 18845,
        "Temp_c": -21.9,
        "Dewpoint_c": -60.3,
        "Wind_Direction": 344,
        "Wind_Speed_kt": 12.1
      },
      {
        "Altitude_ft": 18862,
        "Temp_c": -21.9,
        "Dewpoint_c": -60.4,
        "Wind_Direction": 344,
        "Wind_Speed_kt": 12.2
      },
      {
        "Altitude_ft": 18881,
        "Temp_c": -22,
        "Dewpoint_c": -60.4,
        "Wind_Direction": 344,
        "Wind_Speed_kt": 12.2
      },
      {
        "Altitude_ft": 18901,
        "Temp_c": -22,
        "Dewpoint_c": -60.4,
        "Wind_Direction": 343,
        "Wind_Speed_kt": 12.4
      },
      {
        "Altitude_ft": 18921,
        "Temp_c": -22.1,
        "Dewpoint_c": -60.4,
        "Wind_Direction": 343,
        "Wind_Speed_kt": 12.6
      },
      {
        "Altitude_ft": 18940,
        "Temp_c": -22.1,
        "Dewpoint_c": -60.5,
        "Wind_Direction": 343,
        "Wind_Speed_kt": 12.6
      },
      {
        "Altitude_ft": 18957,
        "Temp_c": -22.1,
        "Dewpoint_c": -60.5,
        "Wind_Direction": 342,
        "Wind_Speed_kt": 12.8
      },
      {
        "Altitude_ft": 18976,
        "Temp_c": -22.2,
        "Dewpoint_c": -60.5,
        "Wind_Direction": 342,
        "Wind_Speed_kt": 13
      },
      {
        "Altitude_ft": 18993,
        "Temp_c": -22.2,
        "Dewpoint_c": -60.5,
        "Wind_Direction": 341,
        "Wind_Speed_kt": 13
      },
      {
        "Altitude_ft": 19012,
        "Temp_c": -22.3,
        "Dewpoint_c": -60.6,
        "Wind_Direction": 341,
        "Wind_Speed_kt": 13.2
      },
      {
        "Altitude_ft": 19029,
        "Temp_c": -22.3,
        "Dewpoint_c": -60.6,
        "Wind_Direction": 341,
        "Wind_Speed_kt": 13.4
      },
      {
        "Altitude_ft": 19045,
        "Temp_c": -22.4,
        "Dewpoint_c": -60.6,
        "Wind_Direction": 340,
        "Wind_Speed_kt": 13.4
      },
      {
        "Altitude_ft": 19065,
        "Temp_c": -22.4,
        "Dewpoint_c": -60.7,
        "Wind_Direction": 340,
        "Wind_Speed_kt": 13.2
      },
      {
        "Altitude_ft": 19081,
        "Temp_c": -22.5,
        "Dewpoint_c": -60.7,
        "Wind_Direction": 340,
        "Wind_Speed_kt": 13.2
      },
      {
        "Altitude_ft": 19094,
        "Temp_c": -22.5,
        "Dewpoint_c": -60.7,
        "Wind_Direction": 340,
        "Wind_Speed_kt": 13
      },
      {
        "Altitude_ft": 19108,
        "Temp_c": -22.5,
        "Dewpoint_c": -60.7,
        "Wind_Direction": 340,
        "Wind_Speed_kt": 12.8
      },
      {
        "Altitude_ft": 19117,
        "Temp_c": -22.6,
        "Dewpoint_c": -60.8,
        "Wind_Direction": 340,
        "Wind_Speed_kt": 12.6
      },
      {
        "Altitude_ft": 19131,
        "Temp_c": -22.6,
        "Dewpoint_c": -60.8,
        "Wind_Direction": 339,
        "Wind_Speed_kt": 12.4
      },
      {
        "Altitude_ft": 19147,
        "Temp_c": -22.7,
        "Dewpoint_c": -60.8,
        "Wind_Direction": 339,
        "Wind_Speed_kt": 12.4
      },
      {
        "Altitude_ft": 19163,
        "Temp_c": -22.7,
        "Dewpoint_c": -60.8,
        "Wind_Direction": 339,
        "Wind_Speed_kt": 12.2
      },
      {
        "Altitude_ft": 19180,
        "Temp_c": -22.7,
        "Dewpoint_c": -60.9,
        "Wind_Direction": 339,
        "Wind_Speed_kt": 12.1
      },
      {
        "Altitude_ft": 19196,
        "Temp_c": -22.8,
        "Dewpoint_c": -60.9,
        "Wind_Direction": 339,
        "Wind_Speed_kt": 11.9
      },
      {
        "Altitude_ft": 19213,
        "Temp_c": -22.8,
        "Dewpoint_c": -60.9,
        "Wind_Direction": 338,
        "Wind_Speed_kt": 11.7
      },
      {
        "Altitude_ft": 19229,
        "Temp_c": -22.8,
        "Dewpoint_c": -60.9,
        "Wind_Direction": 338,
        "Wind_Speed_kt": 11.5
      },
      {
        "Altitude_ft": 19245,
        "Temp_c": -22.9,
        "Dewpoint_c": -61,
        "Wind_Direction": 338,
        "Wind_Speed_kt": 11.5
      },
      {
        "Altitude_ft": 19262,
        "Temp_c": -22.9,
        "Dewpoint_c": -61,
        "Wind_Direction": 338,
        "Wind_Speed_kt": 11.3
      },
      {
        "Altitude_ft": 19278,
        "Temp_c": -22.9,
        "Dewpoint_c": -61,
        "Wind_Direction": 337,
        "Wind_Speed_kt": 11.1
      },
      {
        "Altitude_ft": 19295,
        "Temp_c": -23,
        "Dewpoint_c": -61.1,
        "Wind_Direction": 337,
        "Wind_Speed_kt": 10.9
      },
      {
        "Altitude_ft": 19311,
        "Temp_c": -23,
        "Dewpoint_c": -61.1,
        "Wind_Direction": 337,
        "Wind_Speed_kt": 10.7
      },
      {
        "Altitude_ft": 19327,
        "Temp_c": -23.1,
        "Dewpoint_c": -61.1,
        "Wind_Direction": 337,
        "Wind_Speed_kt": 10.7
      },
      {
        "Altitude_ft": 19344,
        "Temp_c": -23.1,
        "Dewpoint_c": -61.2,
        "Wind_Direction": 336,
        "Wind_Speed_kt": 10.5
      },
      {
        "Altitude_ft": 19360,
        "Temp_c": -23.1,
        "Dewpoint_c": -61.2,
        "Wind_Direction": 336,
        "Wind_Speed_kt": 10.3
      },
      {
        "Altitude_ft": 19377,
        "Temp_c": -23.2,
        "Dewpoint_c": -61.2,
        "Wind_Direction": 335,
        "Wind_Speed_kt": 10.5
      },
      {
        "Altitude_ft": 19393,
        "Temp_c": -23.2,
        "Dewpoint_c": -61.3,
        "Wind_Direction": 335,
        "Wind_Speed_kt": 10.7
      },
      {
        "Altitude_ft": 19413,
        "Temp_c": -23.3,
        "Dewpoint_c": -61.3,
        "Wind_Direction": 334,
        "Wind_Speed_kt": 10.9
      },
      {
        "Altitude_ft": 19429,
        "Temp_c": -23.3,
        "Dewpoint_c": -61.4,
        "Wind_Direction": 333,
        "Wind_Speed_kt": 11.1
      },
      {
        "Altitude_ft": 19449,
        "Temp_c": -23.3,
        "Dewpoint_c": -61.4,
        "Wind_Direction": 333,
        "Wind_Speed_kt": 11.1
      },
      {
        "Altitude_ft": 19469,
        "Temp_c": -23.4,
        "Dewpoint_c": -61.4,
        "Wind_Direction": 332,
        "Wind_Speed_kt": 11.3
      },
      {
        "Altitude_ft": 19491,
        "Temp_c": -23.4,
        "Dewpoint_c": -61.5,
        "Wind_Direction": 332,
        "Wind_Speed_kt": 11.5
      },
      {
        "Altitude_ft": 19511,
        "Temp_c": -23.5,
        "Dewpoint_c": -61.5,
        "Wind_Direction": 331,
        "Wind_Speed_kt": 11.7
      },
      {
        "Altitude_ft": 19531,
        "Temp_c": -23.5,
        "Dewpoint_c": -61.5,
        "Wind_Direction": 331,
        "Wind_Speed_kt": 11.9
      },
      {
        "Altitude_ft": 19554,
        "Temp_c": -23.6,
        "Dewpoint_c": -61.5,
        "Wind_Direction": 330,
        "Wind_Speed_kt": 12.1
      },
      {
        "Altitude_ft": 19573,
        "Temp_c": -23.6,
        "Dewpoint_c": -61.5,
        "Wind_Direction": 330,
        "Wind_Speed_kt": 12.2
      },
      {
        "Altitude_ft": 19593,
        "Temp_c": -23.7,
        "Dewpoint_c": -61.5,
        "Wind_Direction": 329,
        "Wind_Speed_kt": 12.4
      },
      {
        "Altitude_ft": 19613,
        "Temp_c": -23.7,
        "Dewpoint_c": -61.5,
        "Wind_Direction": 329,
        "Wind_Speed_kt": 12.6
      },
      {
        "Altitude_ft": 19636,
        "Temp_c": -23.8,
        "Dewpoint_c": -61.5,
        "Wind_Direction": 328,
        "Wind_Speed_kt": 12.8
      },
      {
        "Altitude_ft": 19656,
        "Temp_c": -23.8,
        "Dewpoint_c": -61.5,
        "Wind_Direction": 328,
        "Wind_Speed_kt": 13
      },
      {
        "Altitude_ft": 19675,
        "Temp_c": -23.8,
        "Dewpoint_c": -61.5,
        "Wind_Direction": 327,
        "Wind_Speed_kt": 13.2
      },
      {
        "Altitude_ft": 19692,
        "Temp_c": -23.9,
        "Dewpoint_c": -61.5,
        "Wind_Direction": 327,
        "Wind_Speed_kt": 13.4
      },
      {
        "Altitude_ft": 19711,
        "Temp_c": -23.9,
        "Dewpoint_c": -61.5,
        "Wind_Direction": 327,
        "Wind_Speed_kt": 13.6
      },
      {
        "Altitude_ft": 19731,
        "Temp_c": -24,
        "Dewpoint_c": -61.5,
        "Wind_Direction": 326,
        "Wind_Speed_kt": 13.8
      },
      {
        "Altitude_ft": 19751,
        "Temp_c": -24,
        "Dewpoint_c": -61.5,
        "Wind_Direction": 326,
        "Wind_Speed_kt": 13.8
      },
      {
        "Altitude_ft": 19770,
        "Temp_c": -24.1,
        "Dewpoint_c": -61.4,
        "Wind_Direction": 325,
        "Wind_Speed_kt": 14
      },
      {
        "Altitude_ft": 19790,
        "Temp_c": -24.1,
        "Dewpoint_c": -61.3,
        "Wind_Direction": 324,
        "Wind_Speed_kt": 14
      },
      {
        "Altitude_ft": 19810,
        "Temp_c": -24.2,
        "Dewpoint_c": -61.1,
        "Wind_Direction": 324,
        "Wind_Speed_kt": 14
      },
      {
        "Altitude_ft": 19829,
        "Temp_c": -24.2,
        "Dewpoint_c": -61,
        "Wind_Direction": 323,
        "Wind_Speed_kt": 14
      },
      {
        "Altitude_ft": 19849,
        "Temp_c": -24.3,
        "Dewpoint_c": -60.9,
        "Wind_Direction": 322,
        "Wind_Speed_kt": 14.2
      },
      {
        "Altitude_ft": 19869,
        "Temp_c": -24.3,
        "Dewpoint_c": -60.7,
        "Wind_Direction": 321,
        "Wind_Speed_kt": 14.2
      },
      {
        "Altitude_ft": 19888,
        "Temp_c": -24.3,
        "Dewpoint_c": -60.6,
        "Wind_Direction": 321,
        "Wind_Speed_kt": 14.2
      },
      {
        "Altitude_ft": 19908,
        "Temp_c": -24.4,
        "Dewpoint_c": -60.5,
        "Wind_Direction": 320,
        "Wind_Speed_kt": 14.4
      },
      {
        "Altitude_ft": 19925,
        "Temp_c": -24.4,
        "Dewpoint_c": -60.4,
        "Wind_Direction": 319,
        "Wind_Speed_kt": 14.4
      },
      {
        "Altitude_ft": 19944,
        "Temp_c": -24.5,
        "Dewpoint_c": -60.3,
        "Wind_Direction": 318,
        "Wind_Speed_kt": 14.4
      },
      {
        "Altitude_ft": 19964,
        "Temp_c": -24.5,
        "Dewpoint_c": -60.2,
        "Wind_Direction": 318,
        "Wind_Speed_kt": 14.6
      },
      {
        "Altitude_ft": 19980,
        "Temp_c": -24.6,
        "Dewpoint_c": -60,
        "Wind_Direction": 317,
        "Wind_Speed_kt": 14.6
      },
      {
        "Altitude_ft": 19997,
        "Temp_c": -24.6,
        "Dewpoint_c": -59.9,
        "Wind_Direction": 316,
        "Wind_Speed_kt": 14.6
      },
      {
        "Altitude_ft": 20010,
        "Temp_c": -24.7,
        "Dewpoint_c": -59.8,
        "Wind_Direction": 316,
        "Wind_Speed_kt": 14.8
      }
    ]
  },
  "windMapScreenshotMetadata": {
    "kind": "storage#object",
    "id": "wasatch-wind-static/wind-map-save.png/1777593630894584",
    "selfLink": "https://www.googleapis.com/storage/v1/b/wasatch-wind-static/o/wind-map-save.png",
    "mediaLink": "https://storage.googleapis.com/download/storage/v1/b/wasatch-wind-static/o/wind-map-save.png?generation=1777593630894584&alt=media",
    "name": "wind-map-save.png",
    "bucket": "wasatch-wind-static",
    "generation": "1777593630894584",
    "metageneration": "2",
    "contentType": "image/png",
    "storageClass": "STANDARD",
    "size": "824874",
    "md5Hash": "431aNloG4B5LyY4Ltay7Sg==",
    "crc32c": "8lvTRQ==",
    "etag": "CPjTsqfklpQDEAI=",
    "timeCreated": "2026-05-01T00:00:30.906Z",
    "updated": "2026-05-01T00:00:31.108Z",
    "timeStorageClassUpdated": "2026-05-01T00:00:30.906Z",
    "timeFinalized": "2026-05-01T00:00:30.906Z"
  },
  "openMeteo": {
    "latitude": 40.764416,
    "longitude": -111.981255,
    "generationtime_ms": 612.1261119842529,
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
        "2026-04-30T18:00",
        "2026-04-30T19:00",
        "2026-04-30T20:00",
        "2026-04-30T21:00",
        "2026-04-30T22:00",
        "2026-04-30T23:00",
        "2026-05-01T00:00",
        "2026-05-01T01:00",
        "2026-05-01T02:00",
        "2026-05-01T03:00",
        "2026-05-01T04:00",
        "2026-05-01T05:00"
      ],
      "geopotential_height_875hPa": [
        1249,
        1260,
        1255,
        1251,
        1261,
        1260,
        1265,
        1264,
        1263,
        1264,
        1268,
        1267
      ],
      "winddirection_875hPa": [
        329,
        352,
        344,
        360,
        27,
        23,
        42,
        85,
        101,
        129,
        122,
        122
      ],
      "windspeed_875hPa": [
        9.5,
        7.7,
        4.8,
        3.3,
        2.4,
        2.1,
        3.3,
        3,
        2.8,
        3.5,
        2.6,
        2.6
      ],
      "geopotential_height_850hPa": [
        1494,
        1504,
        1499,
        1495,
        1505,
        1503,
        1508,
        1506,
        1504,
        1505,
        1509,
        1508
      ],
      "winddirection_850hPa": [
        330,
        352,
        351,
        2,
        25,
        55,
        75,
        91,
        94,
        97,
        102,
        106
      ],
      "windspeed_850hPa": [
        11.8,
        10.6,
        8.6,
        7.1,
        6.6,
        6.9,
        10.9,
        15,
        14.8,
        14.5,
        13.3,
        13.5
      ],
      "geopotential_height_825hPa": [
        1743,
        1753,
        1748,
        1744,
        1754,
        1752,
        1756,
        1753,
        1752,
        1753,
        1756,
        1756
      ],
      "winddirection_825hPa": [
        334,
        357,
        356,
        8,
        23,
        56,
        78,
        94,
        98,
        99,
        110,
        120
      ],
      "windspeed_825hPa": [
        12.2,
        11.3,
        9.5,
        8.7,
        9.7,
        10.7,
        16.3,
        20.2,
        17.6,
        16.8,
        14.2,
        11.9
      ],
      "geopotential_height_800hPa": [
        1998,
        2008,
        2003,
        1999,
        2009,
        2007,
        2010,
        2008,
        2006,
        2007,
        2010,
        2009
      ],
      "winddirection_800hPa": [
        342,
        3,
        2,
        14,
        27,
        61,
        81,
        93,
        98,
        101,
        113,
        128
      ],
      "windspeed_800hPa": [
        11.8,
        11.8,
        9.6,
        9.9,
        11.5,
        12.8,
        18.9,
        19.9,
        16.6,
        14.3,
        12.8,
        10.2
      ],
      "geopotential_height_775hPa": [
        2259,
        2269,
        2264,
        2260,
        2270,
        2268,
        2271,
        2268,
        2267,
        2267,
        2270,
        2269
      ],
      "winddirection_775hPa": [
        350,
        9,
        14,
        22,
        35,
        66,
        81,
        87,
        94,
        98,
        110,
        122
      ],
      "windspeed_775hPa": [
        11.6,
        11.9,
        9.4,
        10.2,
        12.4,
        13.9,
        18.8,
        16.4,
        14.4,
        12.2,
        12.2,
        10.4
      ],
      "geopotential_height_750hPa": [
        2526,
        2536,
        2531,
        2527,
        2537,
        2535,
        2537,
        2535,
        2533,
        2534,
        2536,
        2535
      ],
      "winddirection_750hPa": [
        358,
        14,
        31,
        38,
        47,
        70,
        78,
        74,
        85,
        88,
        97,
        110
      ],
      "windspeed_750hPa": [
        11.4,
        11.7,
        10,
        11.3,
        13.2,
        13.9,
        16.9,
        12.5,
        11.4,
        10.3,
        10.8,
        10.2
      ],
      "geopotential_height_700hPa": [
        3080,
        3090,
        3086,
        3083,
        3092,
        3090,
        3092,
        3089,
        3088,
        3088,
        3090,
        3088
      ],
      "winddirection_700hPa": [
        23,
        24,
        52,
        62,
        68,
        71,
        62,
        38,
        34,
        45,
        53,
        65
      ],
      "windspeed_700hPa": [
        9.7,
        10.5,
        11.3,
        13.1,
        14.2,
        11.8,
        10,
        9.3,
        8.9,
        8.2,
        8.3,
        8.1
      ],
      "geopotential_height_625hPa": [
        3969,
        3979,
        3976,
        3972,
        3982,
        3979,
        3980,
        3977,
        3975,
        3975,
        3977,
        3974
      ],
      "winddirection_625hPa": [
        55,
        56,
        58,
        66,
        59,
        48,
        21,
        17,
        18,
        32,
        32,
        29
      ],
      "windspeed_625hPa": [
        9.1,
        6.8,
        8.9,
        9.3,
        8.2,
        6.3,
        4,
        7.9,
        10.4,
        11.6,
        11.6,
        10.7
      ],
      "wind_direction_10m": [
        345,
        7,
        331,
        342,
        333,
        212,
        205,
        234,
        220,
        174,
        140,
        234
      ],
      "wind_speed_10m": [
        9.5,
        7.7,
        5.6,
        4.5,
        2,
        2.9,
        3.7,
        6.1,
        6.7,
        7,
        7.3,
        3
      ],
      "winddirection_9000": [
        360,
        360,
        360,
        70,
        70,
        70,
        70,
        70,
        70,
        70,
        70,
        70
      ],
      "windspeed_9000": [
        13,
        13,
        13,
        15,
        15,
        15,
        15,
        15,
        15,
        15,
        15,
        15
      ],
      "winddirection_12000": [
        20,
        20,
        20,
        70,
        70,
        70,
        70,
        70,
        70,
        70,
        70,
        70
      ],
      "windspeed_12000": [
        10,
        10,
        10,
        13,
        13,
        13,
        13,
        13,
        13,
        13,
        13,
        13
      ],
      "winddirection_18000": [
        360,
        360,
        360,
        10,
        10,
        10,
        10,
        10,
        10,
        10,
        10,
        10
      ],
      "windspeed_18000": [
        6,
        6,
        6,
        7,
        7,
        7,
        7,
        7,
        7,
        7,
        7,
        7
      ]
    },
    "daily_units": {
      "time": "iso8601",
      "sunset": "iso8601",
      "temperature_2m_max": "°F"
    },
    "daily": {
      "time": [
        "2026-04-30"
      ],
      "sunset": [
        "2026-04-30T20:23"
      ],
      "temperature_2m_max": [
        62.5
      ]
    }
  }
}