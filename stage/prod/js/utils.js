"use strict";

const global = {}; // Used for page slider navigation

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

// FOR TESTING - REMOVE IN PROD
// const data = 