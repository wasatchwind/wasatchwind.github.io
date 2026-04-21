"use strict";

///////////////////////////////////
// HTML DOM contructor utilities //
///////////////////////////////////
// IIFE to immediately build sticky top HTML DOM with associated controls
(() => {
  // Title heading (row 1) - includes reload function
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

  // Top navigation (row 3) - includes swipe & click listeners
  document.getElementById("topnav").innerHTML = `
    <div class="align-items-end d-flex display-1 justify-content-between text-secondary">
      <button class="fw-semibold text-warning clickable" data-direction="left" aria-label="Previous">&#171;</button>
      <div class="col display-2" id="topnav-left"></div>
      <div class="col fw-semibold text-white" id="topnav-active"></div>
      <div class="col display-2" id="topnav-right"></div>
      <button class="fw-semibold text-warning clickable" data-direction="right" aria-label="Next">&#187;</button>
    </div>`;
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
  const link = href
    ? { hrefLine: `<a href="${href}" target="_blank">`, closure: "</a>" }
    : { hrefLine: "", closure: "" };

  document.getElementById(`${elementId}`).innerHTML = `
    <div class="mb-4">
      ${link.hrefLine}
        <div class="display-3 text-info">${title}</div>
        ${imgOrDiv}
      ${link.closure}
    </div>`;
}


/////////////////////////////////////////////////////////
// Marquee (all code: component, controller, settings) //
/////////////////////////////////////////////////////////
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