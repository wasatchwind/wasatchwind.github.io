"use strict";

/////////////////////////////////////////////////////////////////////////////////////////////////////
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

// Use a standard template to build similar component divs by elementId (used for many components)
// params Options:
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


///////////////////////////////////////////////////////
// Marquee: HTML DOM, controller, and user settings) //
///////////////////////////////////////////////////////
const MarqueeController = (() => {

  // DOM Setup - Marquee slider/ticker
  const marqueeDiv = document.getElementById("marquee");
  marqueeDiv.className = "display-5 keen-slider";

  const row = (content) => `<div class="d-flex justify-content-center">${content}</div>`; // Reusable class
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


//////////////////////////////////////////////////////////////////
// User settings page station toggle HTML DOM & toggle controls //
//////////////////////////////////////////////////////////////////
(function buildStationSettings() { // Build station settings toggle on/off list for the user Settings page
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
})();

function stationSetToggle(stid, state) { // Onclick function to toggle stations on/off on the user Settings page
  localStorage.setItem(stid, state)

  const on = document.getElementById(`${stid}-on`);
  const off = document.getElementById(`${stid}-off`);

  on.className = state === "on" ? "bg-success border fw-semibold px-4 rounded-5 py-2" : "bg-dark border fw-normal px-4 rounded-5 py-2";
  off.className = state === "off" ? "bg-danger border fw-semibold px-4 rounded-5 py-2" : "bg-dark border fw-normal px-4 rounded-5 py-2";

  const el = document.getElementById(`${stid}-main`);
  if (el) el.style.display = state === "off" ? "none" : "";
}


//////////////////////
// Misc. page itmes //
//////////////////////
(function buildMiscPageItems() {
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


////////////////////////////////////////////////
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
  return slider;

  function navUpdate(activeNav, navItems) { // Update nav slider/page based on time of day or user input (touch/drag swipe)
    const left = activeNav === 0 ? navItems.length - 1 : activeNav - 1;
    const right = activeNav === navItems.length - 1 ? 0 : activeNav + 1;

    document.getElementById("topnav-left").textContent = navItems[left];
    document.getElementById("topnav-active").textContent = navItems[activeNav];
    document.getElementById("topnav-right").textContent = navItems[right];
  }
}


/////////////////////////////////
// Display web-accessed images //
/////////////////////////////////
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


/////////////////////////////////////////////////////////////////////////////
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


///////////////////////////////////////////////
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
// const data = 