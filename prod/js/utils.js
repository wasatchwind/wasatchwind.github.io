"use strict";

const global = {    // All updated in main.js after async fetch
  slider: null,     // App nav for swipe/scroll
  hiTemp: Number,   // Required for D3.js Reset/Update: Morning Sounding Profile (visualize other thermal temps)
  liftParams: {},   // Same as hiTemp
  soundingData: {}  // Same as hiTemp
};

// D3.JS
const ftPerMeter = 3.28084;
const screenWidth = window.innerWidth;
const proportionalHeight = screenWidth * 0.67;
const margin = {
  top: proportionalHeight * 0.04,
  bottom: proportionalHeight * 0.08,
  left: screenWidth * 0.02,
  right: screenWidth * 0.027
};
const windBarbs = margin.left * 4.5;
const width = screenWidth - margin.left - margin.right;
const height = proportionalHeight - margin.top - margin.bottom;
const surfaceAlt = 4.229;
const surfaceAltMeters = Math.round(surfaceAlt * 1000 / ftPerMeter);
const maxAlt = 20;
const x = d3.scaleLinear().range([0, width - margin.left - margin.right - windBarbs]).domain([-10, 110]);
const y = d3.scaleLinear().range([height, 0]).domain([surfaceAlt, maxAlt]);
const svg = d3.select("#skew-t-d3")
  .append("svg")
  .attr("class", "svgbg")
  .attr("width", width)
  .attr("height", proportionalHeight)
  .append("g")
  .attr("transform", `translate(${margin.left + windBarbs},${margin.top})`);



////////////////////////
// Marquee Controller //
////////////////////////
const MarqueeController = (() => {
  marqueeHtmlComponent();
  marqueeSettingsComponent();
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



///////////////
// Utilities //
///////////////
(() => { // Keep listeners self-contained instead of global
  const actions = {
    left: () => global.slider.prev(),
    right: () => global.slider.next()
  };

  document.getElementById("reload").addEventListener("click", (e) => { // Reload button listener
    history.scrollRestoration = "manual";
    location.reload();
  });

  document.getElementById("topnav").addEventListener("click", (e) => { // Top nav buttons listener
    const button = e.target.closest(".clickable");
    if (!button) return;

    const direction = button.dataset.direction;
    actions[direction]?.(); // Optional Chaining Operator (function called only if direction is "left" or "right")
  });

  document.querySelectorAll(".wind-aloft-toggle").forEach(e => e.addEventListener("click", toggleWindAloft));
  document.getElementById("d3-update").addEventListener("click", d3Update);
  document.getElementById("d3-clear").addEventListener("click", () => d3Clear()); // Function format necessary since params are expected
})();

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

function marqueeHtmlComponent() {
  const marqueeDiv = document.getElementById("marquee")
  const tickers = [
    { topRow: "-3 Index", bottomRow: `<div id="negative3"></div>` },
    { topRow: "Top of Lift", bottomRow: `<div id="top-of-lift"></div>` },
    { topRow: "Temp", bottomRow: `<div class="d-flex justify-content-center"><div id="temp"></div><div id="hi-temp"></div></div>` },
    { topRow: "Pressure", bottomRow: `<div class="d-flex justify-content-center"><div id="alti"></div><div id="trend"></div></div>` },
    { topRow: "Zone", bottomRow: `<img id="zone">` },
    { topRow: "KSLC", id: "KSLC-time-12", bottomRow: `<div class="d-flex justify-content-center"><div id="KSLC-wdir-12"></div><div class="ms-3" id="KSLC-wspd-12"></div><div class="gust-color fs-1 ms-3" id="KSLC-gust-12"></div></div>` },
    { topRow: "Sunset", bottomRow: `<div id="sunset"></div>` },
  ];

  tickers.forEach((ticker, i) => {
    const div = document.createElement("div");
    div.className = `keen-slider__slide number-slide${i + 1}`;
    div.innerHTML = `
      <div class="text-info" id="${ticker.id}">${ticker.topRow}</div>
      ${ticker.bottomRow}`;

    marqueeDiv.appendChild(div);
  });
}

function marqueeSettingsComponent() {
  const marqueeSettingsDiv = document.getElementById("marquee-speed");
  const div = document.createElement("div");
  div.className = "border-bottom d-flex justify-content-between py-4";
  div.innerHTML = `
    <div class="display-3 text-info">Marquee Speed</div>
    <div class="align-items-center col-7 display-5 d-flex justify-content-around" id="marquee-settings"></div>`;

  marqueeSettingsDiv.appendChild(div);
}

function standardHtmlComponent(params) { // Build HTML divs by elementId where the basic structure is the same
  const display = params.isVisible ? "" : "collapse ";
  const subId = params.subId ? ` id="${params.subId}"` : "";
  const src = params.src;
  const isImgSrc = src?.startsWith("http") || src?.startsWith("prod");
  const [content, imgSrc] = isImgSrc ? ["", src] : [src ?? "", null];
  const style = params.style ? params.style : "bg-dark border display-6 font-monospace ps-2 rounded-4 text-start";
  const imgOrDiv = imgSrc ? `<img class="rounded-4 w-100" loading="lazy" src="${imgSrc}">` : `<div class="${style}"${subId}>${content}</div>`;
  const link = params.href
    ? { hrefLine: `<a href="${params.href}" target="_blank">`, closure: "</a>" }
    : { hrefLine: "", closure: "" };

  document.getElementById(`${params.elementId}`).innerHTML = `
    <div class="${display} mb-4" id="${params.elementId}">
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

function stationList() { // Used for user settings page and station charts - alphabetical order by name
  return [
    { id: "AMB", name: "Alta Baldy" },
    { id: "KSVR", name: "Airport 2" },
    { id: "BRW", name: "Clayton Peak" },
    { id: "HDP", name: "Hidden Peak" },
    { id: "OGP", name: "Ogden Peak" },
    { id: "UTOLY", name: "Olypmus Cove" },
    { id: "UT5", name: "Parleys Mouth" },
    { id: "D6120", name: "Pepperwood" },
    { id: "REY", name: "Reynolds Peak" },
    { id: "FPS", name: "Southside" }
  ];
}



//////////////////
// D3 Utilities //
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
}

function d3OutOfRange(userTemp) {
  document.getElementById("out-of-range").textContent = `Error: parameters out of range for ${userTemp}°`;
  document.getElementById("out-of-range").style.display = "block";
  document.getElementById("user-temp").value = null;
  return;
}

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
}

// FOR TESTING - REMOVE IN PROD
// const data = 