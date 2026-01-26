// "use strict";

const ftPerMeter = 3.28084;
const now = new Date();
const nextDay = `${new Date(Date.now() + 86400000).toLocaleString("en-us", { weekday: "short" })}`;

// Nav pages
const navItems = ["Today", `${nextDay}+`, "Settings", "Misc.", "GPS", "Cams", "Now"];
let slider, activeNav = 0;

// Used for 1) Displaying station data and 2) Station on/off toggle in user settings
const stationList = {
  AMB: { name: "Alta Baldy" },
  KSVR: { name: "Airport 2" },
  BRW: { name: "Clayton Peak" },
  HDP: { name: "Hidden Peak" },
  OGP: { name: "Ogden Peak" },
  UTOLY: { name: "Olypmus Cove" },
  UT5: { name: "Parleys Mouth" },
  D6120: { name: "Pepperwood" },
  REY: { name: "Reynolds Peak" },
  FPS: { name: "Southside" }
};

// Global required for D3 Reset/Update > Visualize Other Thermal Temps (Morning Sounding Profile)
let hiTemp, liftParams = {}, soundingData = {};
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