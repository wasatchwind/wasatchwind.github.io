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
const data = {
  "areaForecast": {
    "@context": {
      "@version": "1.1",
      "@vocab": "https://api.weather.gov/ontology#"
    },
    "@id": "https://api.weather.gov/products/867a9ee3-963c-4bec-80df-ee1bfff57787",
    "id": "867a9ee3-963c-4bec-80df-ee1bfff57787",
    "wmoCollectiveId": "FXUS65",
    "issuingOffice": "KSLC",
    "issuanceTime": "2026-04-15T04:38:00+00:00",
    "productCode": "AFD",
    "productName": "Area Forecast Discussion",
    "productText": "\n000\nFXUS65 KSLC 150438\nAFDSLC\n\nArea Forecast Discussion\nNational Weather Service Salt Lake City UT\n1038 PM MDT Tue Apr 14 2026\n\n.KEY MESSAGES...\n\n- Freezing conditions will occur across central and southern \n  valley locations tonight into Wednesday morning.\n\n- A strong cold front will bring accumulating valley snow to\n  northern Utah Thursday afternoon into Thursday night, with snow\n  showers continuing into Friday morning. Snow may impact both the\n  Thursday evening and Friday morning commutes along the Wasatch\n  Front.\n\n- Very cold temperatures in the teens to upper 20s will occur\n  across most valleys of Utah Thursday night into Friday morning\n  and each subsequent overnight period through Sunday morning.\n  Temperatures this cold can freeze sprinkler systems and cause\n  widespread fruit orchard blossom death. Consider re-winterizing\n  sprinkler systems to avoid property damage. \n\n&&\n\n.DISCUSSION...Late this evening, showers have largely diminished\nacross the area, with only isolated areas of low-level clouds\nstill lingering as mid-level heights gradually rise. Clearing\nskies overnight will allow temperatures to drop down to below\nfreezing again across many valleys in central/southern Utah, \nindicated by the ongoing Freeze Warnings. However, expect a brief \nrespite after tonight as warmer, southwesterly flow develops \nthrough the day on Wednesday under shortwave ridging. Isolated\nshowers and thunderstorms may still develop during the afternoon,\nmainly across northern Utah.\n\nThe warmth will not last. A potent trough will quickly dive \nsouthward through the PacNW Wednesday night bringing a strong \ncold front through Utah and southwest Wyoming between mid Thursday\nmorning and late Thursday night. This system, while dynamically \nstrong, moves through fairly quickly and has only modest moisture,\nlikely limiting snow amounts even though snow levels are expected\nto dip below valley floors. The main threat will be widespread\nfreezing temperatures, which could impact crops, gardens, and\nunprotected sprinkler systems.\n\nThis cold front is likely to enter northwestern Utah by late\nThursday morning, moving through the Wasatch Front between 3-6PM\nand reaching southeastern Utah after 3AM or so. Along and just\nbehind this front, expect a stark transition to northwesterly\nwinds and a period of heavier snow, particularly across northern\nUtah. In the valleys, while rain will quickly transition to snow,\nwarm antecedent surface temperatures could cause a delay in any\naccumulating snow...though we will still be watching snow chances\nin time for the Thursday evening commute. Another area worth\nwatching will be the I-15 corridor between Nephi and Cedar City,\nas this area tends to do well in northwest flow. In the \nmountains, could see snowfall rates in excess of 1\"/hr, \nparticularly as snow ratios rise behind the front and especially\nin areas favored in northwest flow such as the Upper Cottonwoods.\n\nForecast snow amounts are highest across northern Utah where the\nbest moisture and dynamics are maximized. The northern mountains,\nfor example, can expect around 6-12 inches of snow, though models\nhave trended slightly lower in recent runs. Valley snow amounts\nhave also trended a bit lower, with 1-2 inches likely across\nnorthern valleys (2-5 inches in the Wasatch Back). \n\nOne area of uncertainty that could result in underforecast snow\namounts is the potential for lake-effect snow early Friday \nmorning downwind of the Great Salt Lake. The environment looks\nmostly favorable, with steep low-level lapse rates and a very \ncold air mass over a warm lake. The main question is how much \nmoisture will linger in the low levels, and if it will be enough\nto generate lake-effect showers. Northwest to west-northwesterly \nflow looks to lighten up more by Friday morning, which would favor\na more cellular mode, though the lake-land temperature difference\nwill be pretty substantive by that point, which could favor a\nheavier band setting up. Either way, it'll be interesting to see \nhow showers evolve...if moisture hangs on long enough.\n\nWidespread freezing temperatures are expected by Friday morning across\nall of Utah and southwest Wyoming except Lower Washington County,\nlower elevations of Zion NP, and areas near Lake Powell. Some \nareas could even see low temperatures below freezing through the \nweekend before temperatures rebound enough.\n\nAlthough quieter conditions are expected for the weekend, model\nguidance suggests more active weather returning. The main question\nis when this happens; some models suggests a closed low moves\nthrough the area by late Tuesday, and others suggest high pressure\nsticks around for a couple more days.\n\n&&\n\n.AVIATION...KSLC...The SLC terminal will see VFR conditions \ncontinue tonight through Wednesday. Mostly clear skies can be \nexpected overnight, with CIGS between 10-12kft AGL developing \nWednesday afternoon. Winds will prevail out of the southeast \novernight, increasing in speed by late Wednesday morning. Winds are \nthen expected to shift to west-southwesterly (230-270 degrees) by \nmidafternoon.\n\n.REST OF UTAH AND SOUTHWEST WYOMING...VFR conditions will continue \ntonight through Wednesday. Mostly clear skies can be expected \novernight, with CIGS between 14-17kft MSL developing across northern \nthrough west-central Utah along with southwest Wyoming Wednesday \nafternoon. Meanwhile, southern Utah will see scattered high clouds \nfor Wednesday. Otherwise, increasing southwesterly winds can be \nexpected across most terminals Wednesday afternoon.\n\n&&\n\n.SLC WATCHES/WARNINGS/ADVISORIES...\nUT...Freeze Watch from Thursday evening through Friday morning for \n     UTZ102>106-114>116-118>122-129.\n\n     Freeze Warning until 9 AM MDT Wednesday for UTZ114>116-118>122-\n     130.\n\nWY...None.\n&&\n\n$$\n\nCunningham/Cheng\n\nFor more information from NOAA's National Weather Service visit...\nhttp://weather.gov/saltlakecity\n"
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
      "generatedAt": "2026-04-15T18:12:01+00:00",
      "updateTime": "2026-04-15T17:02:37+00:00",
      "validTimes": "2026-04-15T11:00:00+00:00/P7DT14H",
      "elevation": {
        "unitCode": "wmoUnit:m",
        "value": 1278.9408
      },
      "periods": [
        {
          "number": 1,
          "name": "This Afternoon",
          "startTime": "2026-04-15T12:00:00-06:00",
          "endTime": "2026-04-15T18:00:00-06:00",
          "isDaytime": true,
          "temperature": 68,
          "temperatureUnit": "F",
          "temperatureTrend": null,
          "probabilityOfPrecipitation": {
            "unitCode": "wmoUnit:percent",
            "value": 10
          },
          "windSpeed": "14 mph",
          "windDirection": "SW",
          "icon": "https://api.weather.gov/icons/land/day/bkn?size=medium",
          "shortForecast": "Partly Sunny",
          "detailedForecast": "Partly sunny, with a high near 68. Southwest wind around 14 mph."
        },
        {
          "number": 2,
          "name": "Tonight",
          "startTime": "2026-04-15T18:00:00-06:00",
          "endTime": "2026-04-16T06:00:00-06:00",
          "isDaytime": false,
          "temperature": 44,
          "temperatureUnit": "F",
          "temperatureTrend": null,
          "probabilityOfPrecipitation": {
            "unitCode": "wmoUnit:percent",
            "value": 49
          },
          "windSpeed": "6 to 10 mph",
          "windDirection": "SW",
          "icon": "https://api.weather.gov/icons/land/night/tsra,40/tsra,50?size=medium",
          "shortForecast": "Slight Chance Showers And Thunderstorms then Chance Showers And Thunderstorms",
          "detailedForecast": "A slight chance of showers and thunderstorms before 9pm, then a chance of showers and thunderstorms. Cloudy. Low around 44, with temperatures rising to around 50 overnight. Southwest wind 6 to 10 mph. Chance of precipitation is 50%."
        },
        {
          "number": 3,
          "name": "Thursday",
          "startTime": "2026-04-16T06:00:00-06:00",
          "endTime": "2026-04-16T18:00:00-06:00",
          "isDaytime": true,
          "temperature": 56,
          "temperatureUnit": "F",
          "temperatureTrend": null,
          "probabilityOfPrecipitation": {
            "unitCode": "wmoUnit:percent",
            "value": 93
          },
          "windSpeed": "7 to 15 mph",
          "windDirection": "WNW",
          "icon": "https://api.weather.gov/icons/land/day/tsra,70/snow,90?size=medium",
          "shortForecast": "Showers And Thunderstorms then Snow Showers",
          "detailedForecast": "Showers and thunderstorms before 3pm, then snow showers. Cloudy. High near 56, with temperatures falling to around 40 in the afternoon. West northwest wind 7 to 15 mph. Chance of precipitation is 90%. New rainfall amounts between a tenth and quarter of an inch possible."
        },
        {
          "number": 4,
          "name": "Thursday Night",
          "startTime": "2026-04-16T18:00:00-06:00",
          "endTime": "2026-04-17T06:00:00-06:00",
          "isDaytime": false,
          "temperature": 29,
          "temperatureUnit": "F",
          "temperatureTrend": null,
          "probabilityOfPrecipitation": {
            "unitCode": "wmoUnit:percent",
            "value": 58
          },
          "windSpeed": "6 to 12 mph",
          "windDirection": "NW",
          "icon": "https://api.weather.gov/icons/land/night/snow,60/snow,40?size=medium",
          "shortForecast": "Snow Showers Likely",
          "detailedForecast": "Snow showers likely and a slight chance of thunderstorms. Mostly cloudy, with a low around 29. Northwest wind 6 to 12 mph. Chance of precipitation is 60%. New snow accumulation of less than one inch possible."
        },
        {
          "number": 5,
          "name": "Friday",
          "startTime": "2026-04-17T06:00:00-06:00",
          "endTime": "2026-04-17T18:00:00-06:00",
          "isDaytime": true,
          "temperature": 46,
          "temperatureUnit": "F",
          "temperatureTrend": null,
          "probabilityOfPrecipitation": {
            "unitCode": "wmoUnit:percent",
            "value": 38
          },
          "windSpeed": "6 to 10 mph",
          "windDirection": "NW",
          "icon": "https://api.weather.gov/icons/land/day/snow,40/snow,20?size=medium",
          "shortForecast": "Chance Snow Showers",
          "detailedForecast": "A chance of snow showers before noon, then a slight chance of snow showers and a slight chance of thunderstorms. Partly sunny, with a high near 46. Northwest wind 6 to 10 mph. Chance of precipitation is 40%. New snow accumulation of less than half an inch possible."
        },
        {
          "number": 6,
          "name": "Friday Night",
          "startTime": "2026-04-17T18:00:00-06:00",
          "endTime": "2026-04-18T06:00:00-06:00",
          "isDaytime": false,
          "temperature": 30,
          "temperatureUnit": "F",
          "temperatureTrend": null,
          "probabilityOfPrecipitation": {
            "unitCode": "wmoUnit:percent",
            "value": 7
          },
          "windSpeed": "5 to 9 mph",
          "windDirection": "NNE",
          "icon": "https://api.weather.gov/icons/land/night/few?size=medium",
          "shortForecast": "Mostly Clear then Patchy Frost",
          "detailedForecast": "Patchy frost after 3am. Mostly clear, with a low around 30."
        },
        {
          "number": 7,
          "name": "Saturday",
          "startTime": "2026-04-18T06:00:00-06:00",
          "endTime": "2026-04-18T18:00:00-06:00",
          "isDaytime": true,
          "temperature": 58,
          "temperatureUnit": "F",
          "temperatureTrend": null,
          "probabilityOfPrecipitation": {
            "unitCode": "wmoUnit:percent",
            "value": 3
          },
          "windSpeed": "7 mph",
          "windDirection": "S",
          "icon": "https://api.weather.gov/icons/land/day/few?size=medium",
          "shortForecast": "Patchy Frost then Sunny",
          "detailedForecast": "Patchy frost before 9am. Sunny, with a high near 58."
        },
        {
          "number": 8,
          "name": "Saturday Night",
          "startTime": "2026-04-18T18:00:00-06:00",
          "endTime": "2026-04-19T06:00:00-06:00",
          "isDaytime": false,
          "temperature": 38,
          "temperatureUnit": "F",
          "temperatureTrend": null,
          "probabilityOfPrecipitation": {
            "unitCode": "wmoUnit:percent",
            "value": 0
          },
          "windSpeed": "8 mph",
          "windDirection": "E",
          "icon": "https://api.weather.gov/icons/land/night/few?size=medium",
          "shortForecast": "Mostly Clear",
          "detailedForecast": "Mostly clear, with a low around 38."
        },
        {
          "number": 9,
          "name": "Sunday",
          "startTime": "2026-04-19T06:00:00-06:00",
          "endTime": "2026-04-19T18:00:00-06:00",
          "isDaytime": true,
          "temperature": 71,
          "temperatureUnit": "F",
          "temperatureTrend": null,
          "probabilityOfPrecipitation": {
            "unitCode": "wmoUnit:percent",
            "value": 0
          },
          "windSpeed": "10 mph",
          "windDirection": "SSE",
          "icon": "https://api.weather.gov/icons/land/day/sct?size=medium",
          "shortForecast": "Mostly Sunny",
          "detailedForecast": "Mostly sunny, with a high near 71."
        },
        {
          "number": 10,
          "name": "Sunday Night",
          "startTime": "2026-04-19T18:00:00-06:00",
          "endTime": "2026-04-20T06:00:00-06:00",
          "isDaytime": false,
          "temperature": 46,
          "temperatureUnit": "F",
          "temperatureTrend": null,
          "probabilityOfPrecipitation": {
            "unitCode": "wmoUnit:percent",
            "value": 1
          },
          "windSpeed": "10 mph",
          "windDirection": "SSE",
          "icon": "https://api.weather.gov/icons/land/night/sct?size=medium",
          "shortForecast": "Partly Cloudy",
          "detailedForecast": "Partly cloudy, with a low around 46."
        },
        {
          "number": 11,
          "name": "Monday",
          "startTime": "2026-04-20T06:00:00-06:00",
          "endTime": "2026-04-20T18:00:00-06:00",
          "isDaytime": true,
          "temperature": 74,
          "temperatureUnit": "F",
          "temperatureTrend": null,
          "probabilityOfPrecipitation": {
            "unitCode": "wmoUnit:percent",
            "value": 7
          },
          "windSpeed": "9 to 14 mph",
          "windDirection": "SSE",
          "icon": "https://api.weather.gov/icons/land/day/sct?size=medium",
          "shortForecast": "Mostly Sunny",
          "detailedForecast": "Mostly sunny, with a high near 74."
        },
        {
          "number": 12,
          "name": "Monday Night",
          "startTime": "2026-04-20T18:00:00-06:00",
          "endTime": "2026-04-21T06:00:00-06:00",
          "isDaytime": false,
          "temperature": 48,
          "temperatureUnit": "F",
          "temperatureTrend": null,
          "probabilityOfPrecipitation": {
            "unitCode": "wmoUnit:percent",
            "value": 11
          },
          "windSpeed": "8 to 13 mph",
          "windDirection": "SSE",
          "icon": "https://api.weather.gov/icons/land/night/sct?size=medium",
          "shortForecast": "Partly Cloudy",
          "detailedForecast": "Partly cloudy, with a low around 48."
        },
        {
          "number": 13,
          "name": "Tuesday",
          "startTime": "2026-04-21T06:00:00-06:00",
          "endTime": "2026-04-21T18:00:00-06:00",
          "isDaytime": true,
          "temperature": 73,
          "temperatureUnit": "F",
          "temperatureTrend": null,
          "probabilityOfPrecipitation": {
            "unitCode": "wmoUnit:percent",
            "value": 21
          },
          "windSpeed": "8 to 12 mph",
          "windDirection": "S",
          "icon": "https://api.weather.gov/icons/land/day/rain_showers,20/tsra_hi,20?size=medium",
          "shortForecast": "Slight Chance Rain Showers then Slight Chance Showers And Thunderstorms",
          "detailedForecast": "A slight chance of rain showers before noon, then a slight chance of showers and thunderstorms. Mostly sunny, with a high near 73."
        },
        {
          "number": 14,
          "name": "Tuesday Night",
          "startTime": "2026-04-21T18:00:00-06:00",
          "endTime": "2026-04-22T06:00:00-06:00",
          "isDaytime": false,
          "temperature": 48,
          "temperatureUnit": "F",
          "temperatureTrend": null,
          "probabilityOfPrecipitation": {
            "unitCode": "wmoUnit:percent",
            "value": 21
          },
          "windSpeed": "6 to 10 mph",
          "windDirection": "SSW",
          "icon": "https://api.weather.gov/icons/land/night/rain_showers,20?size=medium",
          "shortForecast": "Slight Chance Rain Showers",
          "detailedForecast": "A slight chance of rain showers. Partly cloudy, with a low around 48."
        }
      ]
    }
  },
  "soaringForecast": {
    "@context": {
      "@version": "1.1",
      "@vocab": "https://api.weather.gov/ontology#"
    },
    "@id": "https://api.weather.gov/products/d106c30b-bf45-4f4c-8ded-add6a30174a3",
    "id": "d106c30b-bf45-4f4c-8ded-add6a30174a3",
    "wmoCollectiveId": "UXUS97",
    "issuingOffice": "KSLC",
    "issuanceTime": "2026-04-15T12:28:00+00:00",
    "productCode": "SRG",
    "productName": "Soaring Guidance",
    "productText": "\n000\nUXUS97 KSLC 151228\nSRGSLC\n\nSoaring Forecast\nNational Weather Service Salt Lake City, Utah\n628 AM MDT Wednesday, April 15, 2026\n\nThis forecast is for Wednesday, April 15, 2026:\n\nIf the trigger temperature of 54.7 F/12.6 C is reached...then\n   Thermal Soaring Index....................... Good\n   Maximum rate of lift........................ 702 ft/min (3.6 m/s)\n   Maximum height of thermals.................. 15921 ft MSL (11045 ft AGL)\n\nForecast maximum temperature................... 68.0 F/20.5 C\nTime of trigger temperature.................... 0945 MDT\nTime of overdevelopment........................ 1500 MDT\nMiddle/high clouds during soaring window....... Broken/overcast thin middle\nSurface winds during soaring window............ 20 mph or less\nHeight of the -3 thermal index................. 13792 ft MSL (8915 ft AGL)\nThermal soaring outlook for Thursday 04/16..... Poor\n\nWave Soaring Index............................. Not available\n\nRemarks... \n\nSunrise/Sunset.................... 06:48:21 / 20:07:12 MDT\nTotal possible sunshine........... 13 hr 18 min 52 sec (798 min 52 sec)\nAltitude of sun at 13:27:46 MDT... 58.60 degrees\n\nUpper air data from numerical model forecast valid on 04/15/2026 at 0600 MDT\n\nFreezing level.................. 9110 ft MSL (4234 ft AGL)\nConvective condensation level... 14461 ft MSL (9585 ft AGL)\nLifted condensation level....... 15495 ft MSL (10619 ft AGL)\nLifted index.................... +0.7\nK index......................... +13.7\n\nHeight  Temperature  Wind  Wind Spd  Lapse Rate  ConvectionT  Thermal  Lift Rate\nft MSL  deg C deg F   Dir   kt  m/s  C/km F/kft  deg C deg F   Index    fpm  m/s\n--------------------------------------------------------------------------------\n 26000  -36.1 -33.0   315   28   14   7.8   4.3   28.9  83.9     6.9      M    M\n 24000  -31.4 -24.5   315   25   13   7.8   4.3   27.5  81.5     6.0      M    M\n 22000  -26.6 -15.9   310   24   12   8.1   4.4   26.1  79.1     5.0      M    M\n 20000  -21.5  -6.7   305   24   12   7.2   3.9   24.4  76.0     3.6      M    M\n 18000  -17.4   0.7   295   25   13   6.6   3.6   22.6  72.6     2.1      M    M\n 16000  -13.5   7.7   290   22   11   5.5   3.0   20.3  68.6     0.0      M    M\n 14000  -10.4  13.3   280   20   10   5.0   2.7   17.4  63.2    -2.7    752  3.8\n 12000   -7.5  18.5   265   17    9   6.1   3.4   14.3  57.7    -5.7    605  3.1\n 10000   -2.6  27.3   255   13    6   8.8   4.8   13.3  55.9    -6.8    400  2.0\n  9000    0.2  32.4   250   12    6   9.7   5.3   13.1  55.6    -7.0    287  1.5\n  8000    2.8  37.0   235   12    6   8.5   4.7   12.8  55.1    -7.4    178  0.9\n  7000    5.2  41.4   220   12    6   6.6   3.6   12.3  54.1    -8.1     78  0.4\n  6000    7.1  44.8   200   12    6   3.5   1.9   11.3  52.3    -9.1      M    M\n  5000    6.5  43.7   165   10    5 -18.8 -10.3    7.7  45.9   -12.8      M    M\n\n * * * * * * Numerical weather prediction model forecast data valid * * * * * * \n\n           04/15/2026 at 0900 MDT          |       04/15/2026 at 1200 MDT        \n                                           |\nCAPE...     0.0    LI...       +5.0        | CAPE...     0.0    LI...       +3.8\nCINH...     0.0    K Index... +14.6        | CINH...     0.0    K Index... +16.1\n                                           |\nHeight Temperature  Wnd WndSpd  Lapse Rate | Temperature  Wnd WndSpd  Lapse Rate\nft MSL deg C deg F  Dir kt m/s  C/km F/kft | deg C deg F  Dir kt m/s  C/km F/kft\n--------------------------------------------------------------------------------\n 26000 -35.9 -32.6  300  27 14   7.7   4.2 | -35.2 -31.4  270  33 17   7.5   4.1\n 24000 -31.2 -24.2  295  28 14   7.7   4.2 | -30.7 -23.3  270  32 17   7.5   4.1\n 22000 -26.4 -15.5  290  27 14   8.1   4.5 | -25.5 -13.9  270  31 16   7.8   4.3\n 20000 -21.2  -6.2  290  26 13   7.4   4.1 | -21.0  -5.8  265  29 15   7.5   4.1\n 18000 -17.0   1.4  285  25 13   6.4   3.5 | -16.7   1.9  265  29 15   6.7   3.7\n 16000 -13.5   7.7  275  25 13   5.4   2.9 | -12.9   8.8  260  29 15   5.6   3.1\n 14000 -10.2  13.6  265  23 12   5.6   3.1 |  -9.6  14.7  255  27 14   5.5   3.0\n 12000  -6.9  19.6  250  17  9   5.9   3.2 |  -6.0  21.2  240  23 12   6.8   3.7\n 10000  -2.5  27.5  235  13  7   8.1   4.4 |  -1.6  29.1  220  18  9   7.6   4.2\n  9000   0.1  32.2  235  13  6   9.6   5.2 |   0.9  33.6  210  17  9   9.7   5.3\n  8000   2.7  36.9  225  12  6   8.3   4.6 |   3.7  38.7  205  16  8   9.5   5.2\n  7000   5.1  41.2  215  12  6   6.9   3.8 |   6.6  43.9  205  15  7   9.7   5.3\n  6000   6.9  44.4  195  13  7   5.4   2.9 |   9.5  49.1  200  13  7   9.9   5.5\n  5000   9.6  49.3  165   9  5  -1.0  -0.6 |  13.4  56.1  195  11  6  26.7  14.6\n\n           04/15/2026 at 1500 MDT          |       04/15/2026 at 1800 MDT        \n                                           |\nCAPE...    +2.2    LI...       +2.0        | CAPE...    +5.2    LI...       +1.0\nCINH...    -0.2    K Index... +20.3        | CINH...    -3.9    K Index... +21.8\n                                           |\nHeight Temperature  Wnd WndSpd  Lapse Rate | Temperature  Wnd WndSpd  Lapse Rate\nft MSL deg C deg F  Dir kt m/s  C/km F/kft | deg C deg F  Dir kt m/s  C/km F/kft\n--------------------------------------------------------------------------------\n 26000 -35.3 -31.5  265  40 21   7.7   4.2 | -35.6 -32.1  255  45 23   7.9   4.3\n 24000 -30.7 -23.3  265  39 20   7.8   4.3 | -30.9 -23.6  255  44 22   7.9   4.3\n 22000 -25.6 -14.1  260  38 19   7.6   4.2 | -25.7 -14.3  255  43 22   7.9   4.3\n 20000 -21.3  -6.3  255  37 19   7.2   3.9 | -21.3  -6.3  260  43 22   7.1   3.9\n 18000 -17.0   1.4  255  35 18   7.3   4.0 | -17.2   1.0  255  43 22   6.7   3.7\n 16000 -13.2   8.2  250  33 17   5.7   3.1 | -13.3   8.1  250  37 19   6.9   3.8\n 14000  -9.8  14.4  240  28 14   6.6   3.6 |  -9.0  15.8  230  30 15   7.9   4.4\n 12000  -5.0  23.0  225  24 12   9.1   5.0 |  -3.6  25.5  225  26 14   9.6   5.3\n 10000   0.8  33.4  220  22 11   9.2   5.1 |   2.2  36.0  225  23 12   9.3   5.1\n  9000   3.7  38.7  225  21 11  10.4   5.7 |   5.1  41.2  225  22 11  10.0   5.5\n  8000   6.7  44.1  225  19 10  10.2   5.6 |   8.0  46.4  230  20 10   9.8   5.4\n  7000   9.6  49.3  225  18  9   9.6   5.3 |  10.9  51.6  230  18  9   9.3   5.1\n  6000  12.6  54.7  230  16  8   9.0   5.0 |  13.6  56.5  230  14  7   9.6   5.2\n  5000  17.7  63.9  235  11  6  12.4   6.8 |  17.6  63.7  230   9  4  14.7   8.1\n________________________________________________________________________________\n\nThis product is issued once per day by approximately 0600 MST/0700 MDT \n(1300 UTC). This product is not continuously monitored nor updated after\nthe initial issuance. \n\nThe information contained herein is based on the 1200 UTC rawinsonde observation\nat the Salt Lake City, Utah International Airport and/or numerical weather \nprediction model data representative of the airport. These data may not be\nrepresentative of other areas along the Wasatch Front. Erroneous data such as\nthese should not be used.\n\nThe content and format of this report as well as the issuance times are subject\nto change without prior notice.\n\n042025\n"
  },
  "windAloft6": {
    "@context": {
      "@version": "1.1",
      "@vocab": "https://api.weather.gov/ontology#"
    },
    "@id": "https://api.weather.gov/products/f70cc483-b12b-4f3c-8df2-5b0b29f0b911",
    "id": "f70cc483-b12b-4f3c-8df2-5b0b29f0b911",
    "wmoCollectiveId": "FBUS31",
    "issuingOffice": "KWNO",
    "issuanceTime": "2026-04-15T13:59:00+00:00",
    "productCode": "FD1",
    "productName": "6 Hour Winds Aloft Forecast",
    "productText": "\n000\nFBUS31 KWNO 151359\nFD1US1\nDATA BASED ON 151200Z    \nVALID 151800Z   FOR USE 1400-2100Z. TEMPS NEG ABV 24000\n\nFT  3000    6000    9000   12000   18000   24000  30000  34000  39000\nABI      2516+14 2321+09 2225+01 2360-13 2265-24 227740 229350 732456\nABQ              3110+02 3015-06 2509-19 3020-31 263646 253852 254356\nABR 2506 2711+06 2714-01 2714-07 2718-20 3020-32 322047 291955 243756\nACK 2719 2729+12 2934+07 2831+02 2840-12 2737-22 283739 294250 304363\nACY 2517 2627+14 2934+09 2937+02 3028-11 3027-21 314238 305049 306462\nAGC 2317 2424+12 2636+10 2638+02 2748-12 2543-22 254738 264948 275661\nALB 2111 2630+11 2747+05 2752+00 2834-10 2849-23 285639 286049 297661\nALS                      3111-05 3016-20 3114-32 342747 352353 263355\nAMA      2521    2524+04 2535-03 2452-16 2366-27 238543 239051 238256\nAST 2819 2822-09 2922-15 2921-23 2643-33 2665-37 276944 276346 275748\nATL 2409 2410+12 2010+11 2312+04 2615-08 2719-20 253036 263746 265157\nAVP 2516 2834+13 2744+09 2749+02 2844-11 2843-22 275038 285650 287662\nAXN 2109 2513+06 2520-02 2526-09 2537-21 2544-33 255146 246052 245654\nBAM              2527+00 2633-05 2640-18 2642-30 254345 254454 254564\nBCE                      2610-05 3216-17 3112-29 311545 311654 311563\nBDL 2112 2732+13 2742+06 2753+00 2843-11 2943-22 284739 284450 294862\nBFF      2915    2712+01 2415-06 3021-19 3325-31 343147 343456 282056\nBGR 0205 3312+09 2723+04 2632-02 2665-14 2764-25 296941 288051 308863\nBHM 2110 2120+13 2012+11 2117+05 2420-07 2427-21 243737 254846 265057\nBIH      9900    2107+04 2708-02 2920-17 2630-29 262545 242954 242463\nBIL      2214    2422-01 2526-09 2644-20 2652-31 266046 266155 276764\nBLH 9900 1608+09 9900+03 2908-01 3013-16 3114-28 331145 351354 321462\nBML 1906 2514+09 2626+02 2533-04 2753-13 2956-24 286940 287851 298462\nBNA 2117 2421+14 2615+10 2317+04 2435-09 2551-22 256138 256847 256859\nBOI      2423+02 2630-03 2534-07 2445-20 2556-31 257146 257855 258064\nBOS 2211 2727+12 2837+07 2848+00 2748-11 2841-22 284939 295150 294762\nBRL 2223 2427+11 2331+05 2343-01 2561-14 2380-25 238740 239751 741161\nBRO 1725 1918+16 1808+15 2405+08 2116-06 2129-19 245235 247543 247955\nBUF 2631 2631+11 2741+08 2738+01 2848-12 2650-23 266539 267549 277662\nCAE 2310 2310+13 2308+10 2812+03 3019-08 3019-19 292736 282947 294058\nCAR 9900 2919+07 2825-01 2831-07 2752-17 2769-28 289143 791453 309662\nCGI 2121 2324+12 2331+09 2338+02 2352-11 2369-23 246238 247448 259559\nCHS 2308 2107+13 2105+10 3009+03 3017-07 2815-19 312336 312647 303858\nCLE 2225 2224+13 2434+08 2545+01 2661-13 2653-22 255838 266349 267762\nCLL 1819 2219+13 2311+11 2118+06 2435-09 2148-21 226538 237947 740955\nCMH 2323 2636+13 2539+08 2542+02 2654-11 2646-22 265637 266248 267661\nCOU 2131 2343+13 2231+07 2436+00 2456-13 2375-24 229240 730750 731259\nCRP 1722 1920+15 1914+14 2113+07 2325-08 2136-21 235637 248145 249555\nCRW 2313 2520+13 2624+10 2627+03 2644-10 2750-21 275037 275148 265360\nCSG 2210 2310+12 2008+10 2014+05 2507-07 2612-20 252436 263345 274856\nCVG 2223 2532+12 2436+09 2439+02 2549-11 2655-23 266138 256248 257860\nCZI              2306+00 2614-06 2628-18 2732-31 293346 282355 304163\nDAL 2030 2421+13 2422+10 2327+03 2351-12 2266-23 228039 228849 742056\nDBQ 2120 2323+10 2225+05 2535-01 2448-16 2473-27 239341 249851 730662\nDEN              2915+02 3016-06 2918-19 3421-32 353447 353955 292556\nDIK      2813+05 2624-01 2628-09 2629-19 2632-31 274047 284157 264262\nDLH 9900 2518+05 2422+00 2325-07 2130-21 2345-33 237846 238652 246755\nDLN              2225-01 2335-09 2556-20 2565-32 257447 257954 267663\nDRT 1820 2805+14 2107+11 2117+04 2349-11 2257-22 226939 229447 731456\nDSM 2017 2222+10 2329+06 2234-01 2349-17 2370-29 730341 730452 239358\nECK 2319 2327+11 2441+06 2547-01 2562-12 2656-23 256540 267650 258863\nEKN      2624+13 2627+09 2630+02 2740-11 2540-22 264937 275047 286260\nELP      2807    2708+04 2524-02 2632-15 2441-28 235744 237252 247357\nELY              2419+03 2626-04 2623-17 2630-30 263045 262854 262564\nEMI 2515 2729+16 2634+09 2637+01 2933-10 2730-22 264438 265249 274561\nEVV 2319 2721+12 2430+08 2338+03 2455-11 2558-22 245338 247048 258760\nEYW 0916 1118+17 1016+13 0816+08 0612-07 0516-19 011735 362344 342655\nFAT 9900 3305+07 2806+04 2408-02 2822-17 2630-29 272645 272454 262363\nGPI      2220-02 2432-07 2337-13 2452-24 2468-36 248950 249054 256054\nFLO 2311 2210+13 2608+09 2916+03 2922-08 2824-19 302936 303147 304359\nFMN              2812+01 2815-06 3114-19 3420-31 362546 362754 292458\nFOT 2425 2728+03 2732-02 2737-08 2949-17 2850-30 285345 275554 275464\nFSD 9900 2907+08 2712+00 2317-06 2326-21 2345-32 235346 225851 235953\nFSM 2020 2326+13 2320+08 2337+03 2354-12 2267-23 228238 228449 741058\nFWA 2227 2433+11 2444+06 2464+02 2562-12 2661-22 256539 268150 259261\nGAG      2518+12 2436+05 2338-04 2365-17 2376-27 229642 239852 238657\nGCK      3013+09 2924+02 2823-06 2626-20 2357-30 238943 238451 246353\nGEG      2424-03 2325-08 2341-15 2369-25 2274-37 237849 247752 246153\nGFK 2123 2317+06 2518-03 2518-10 2720-21 3128-32 313348 303457 253856\nGGW      2717+01 2537-05 2536-10 2546-21 2558-32 267047 267857 266462\nGJT              2409+01 2712-07 3318-19 3319-30 322446 332654 332862\nGLD      3017    3126+00 3123-07 3117-20 2819-33 262846 243649 244752\nGRB 1605 2514+09 2526+02 2632-03 2642-16 2458-27 249542 740052 740262\nGRI      3521+06 3616-01 0410-06 1718-18 2137-30 228145 228550 236052\nGSP 2310 2609+15 2311+10 2712+03 2826-08 3028-21 273937 263847 274358\nGTF      2217    2528-04 2536-11 2549-22 2560-33 258448 258956 256760\nH51 1621 1910+13 1508+12 1707+08 1811-06 2124-19 244234 256543 257355\nH52 1213 1505+13 1512+13 1613+08 1612-07 2010-17 261633 292443 296355\nH61 0907 1508+15 1410+13 9900+08 9900-07 0707-19 350935 321944 324954\nHAT 2615 2612+13 2911+08 3411+02 3118-08 3125-20 322338 332848 314159\nHOU 1821 2117+12 2309+13 9900+07 2123-08 2138-20 225137 247245 249755\nHSV 2013 2116+14 2212+11 2217+04 2424-08 2537-21 244537 255546 255658\nICT 2319 2430+14 2432+06 2338-03 2366-18 2386-26 229841 720151 239157\nILM 2512 2410+14 2808+08 3111+03 2918-07 2923-20 312737 313047 324959\nIMB              2641-07 2444-12 2468-24 2583-33 259446 248653 256957\nIND 2324 2626+11 2540+08 2451+02 2463-13 2557-23 256039 257649 248061\nINK      2809+15 2715+06 2533+00 2345-14 2361-26 237442 238651 731255\nINL 1913 2312+03 2213-02 2218-08 2134-22 2128-35 234548 234552 245254\nJAN 2012 2117+13 2013+12 2116+06 2227-07 2237-20 244436 235046 268357\nJAX 9900 1210+14 1307+10 1307+05 2909-07 3209-19 321336 311746 303057\nJFK 2422 2628+14 2738+08 2843+02 2937-11 2934-21 294739 305750 317061\nJOT 2325 2625+11 2528+06 2535-01 2552-13 2475-24 247740 248350 741662\nLAS      1810+11 2010+03 2508-03 3215-17 3116-29 291644 281453 281264\nLBB      2710+14 2518+05 2526-03 2357-15 2368-27 238642 239351 730456\nLCH 1817 2121+10 1913+12 2013+07 2025-07 2133-20 224336 245645 258955\nLIT 2018 2225+14 2326+11 2327+04 2347-10 2265-22 236638 227148 750157\nLKV              2545-03 2558-08 2664-19 2669-29 266945 257055 256964\nLND              2418+02 2729-06 2722-18 2731-31 283746 283855 305063\nLOU 2320 2530+12 2428+09 2332+03 2448-10 2654-22 254938 256148 257660\nLRD 1620 1808+15 2210+13 2118+07 2327-09 2143-21 236337 238545 740255\nLSE 9900 2419+09 2328+03 2320-04 2441-17 2357-29 730443 730952 249358\nLWS 2214 2435-01 2541-07 2338-12 2357-23 2364-36 249448 249855 257456\nMBW              2730    3029-06 3019-19 3123-31 323046 333455 323461\nMCW 9900 2114+09 2122+03 2329-02 2353-19 2359-30 239843 730252 238257\nMEM 2018 2124+12 2123+11 2224+03 2339-09 2358-22 236738 247147 259157\nMGM 2011 1913+14 2012+11 2115+05 2213-07 2313-20 242636 253745 284656\nMIA 0812 1016+16 1113+13 0707+07 0512-07 0514-18 011935 352645 352856\nMKC 2129 2431+15 2430+08 2434-01 2260-17 2386-26 229641 720351 239960\nMKG 2430 2525+09 2523+04 2627-01 2550-13 2458-24 246740 247851 750863\nMLB 1009 1015+16 1407+11 9900+06 9900-07 0207-18 351536 332145 323256\nMLS      2616+06 2523-03 2429-08 2544-20 2644-31 265146 275456 285763\nMOB 1713 1815+13 1914+12 2112+06 2017-07 2017-19 232735 263144 286756\nMOT      2833+04 2640-02 2638-09 2638-20 2639-32 274648 274658 264860\nMQT 3609 2621+08 2534+02 2425-05 2329-17 2662-30 259844 741152 259360\nMRF              2712+09 2524+00 2348-14 2359-25 236742 238950 731755\nMSP 9900 2514+07 2421+00 2329-06 2342-21 2465-31 238645 239652 237854\nMSY 1613 2012+11 2012+12 2012+07 1920-07 2119-19 233234 233544 277356\nOKC 2129 2428+15 2335+09 2240+01 2360-15 2274-25 228541 229750 741856\nOMA 1706 2010+09 2331+06 2233-02 2252-19 2275-30 720142 720452 238056\nONL      2806+08 2705-01 2509-08 2519-21 2343-32 235747 235150 234952\nONT 9900 2005+09 2506+05 2707-01 3114-16 2918-29 281444 271353 271563\nORF 2607 2812+15 2912+09 3015+02 2927-08 3024-21 292138 292448 294561\nOTH 3218 2823-05 2637-08 2648-13 2769-21 2893-31 279847 289254 277758\nPDX 2712 2921-08 2825-15 2637-21 2565-29 2579-37 268145 267447 276149\nPFN 1705 1314+12 1511+10 1908+06 2208-07 1806-19 251735 282445 304755\nPHX 9900 9900+10 9900+02 2911-02 3117-17 3321-29 331645 331454 272060\nPIE 1007 1214+15 1510+11 9900+07 9900-07 9900-18 340935 311544 313755\nPIH      2115    2331-01 2436-08 2539-18 2646-31 265446 265454 265564\nPIR      3009+08 3009+00 2910-08 2809-20 3312-32 361947 341956 242556\nPLB 2111 2333+07 2542+03 2639-02 2845-11 2859-24 277741 288751 299763\nPRC              9900+03 2706-04 3114-17 3220-29 341345 351754 321861\nPSB      2728+13 2639+10 2740+02 2742-12 2539-23 255439 265449 276962\nPSX 1821 2017+13 2211+13 9900+07 2223-08 2135-20 225337 247845 249655\nPUB              2906+03 3013-05 3019-20 3217-32 353347 332352 253854\nPWM 2806 2819+11 2630+05 2642-01 2758-13 2854-23 286040 286250 297063\nRAP      1205+09 2007+01 2513-07 3016-19 3120-31 322347 322656 292260\nRBL 1709 2613+04 2724-01 2631-06 2742-18 2841-29 274145 274054 263764\nRDM      2727-03 2637-09 2453-12 2572-24 2583-33 269145 268152 266255\nRDU 2405 2410+14 2405+08 2911+02 2829-08 2829-20 283237 282947 304560\nRIC 2506 2711+14 2717+09 2823+02 2830-08 2825-21 262738 263349 295660\nRKS              2619    2624-07 2822-18 2828-31 303146 303055 314264\nRNO      2514    2629+02 2630-04 2641-19 2640-30 263745 253754 253864\nROA 2607 2614+14 2422+09 2719+02 2734-09 2738-21 274237 284347 284760\nROW      2908    2810+04 2621-03 2536-16 2450-28 236644 238152 237856\nSAC 2108 2708+06 2716+02 2721-04 2634-18 2735-29 273645 273554 273163\nSAN 9900 9900+10 9900+06 2805+00 3017-16 2915-27 292244 302553 282063\nSAT 1620 2117+14 2015+12 2017+07 2432-09 2145-21 226338 238646 740655\nSAV 2205 2006+12 1806+10 9900+04 2917-07 2915-19 311936 291646 302958\nSBA 9900 9900+09 9900+05 2508-01 2814-15 2721-28 272545 272454 282662\nSEA 3305 2908-09 2611-15 2813-23 2628-34 2461-40 255543 264644 263947\nSFO 3212 3110+07 2911+03 2814-04 2728-18 2734-29 273244 283554 283364\nSGF 2025 2436+13 2329+08 2535+01 2354-13 2270-24 228939 229949 730858\nSHV 1917 2320+12 2317+11 2220+05 2238-08 2250-22 226238 237047 750756\nSIY      2329+01 2645-03 2650-08 2765-18 2769-30 276946 267055 266363\nSLC      2007    2218+01 2424-06 2730-18 2733-30 273245 283154 283164\nSLN 2622 2434+11 2344+05 2246-03 2362-19 2384-26 720242 720051 238356\nSPI 2221 2428+12 2337+06 2329+00 2561-13 2375-23 248039 249450 741361\nSPS 2217 2421+13 2326+08 2133+01 2361-14 2271-24 228440 229550 732355\nSSM 9900 2621+09 2625+02 2432-05 2534-16 2770-28 259443 751453 751963\nSTL 2229 2333+13 2430+07 2526-01 2458-12 2370-23 227339 238850 740960\nSYR 2621 2740+10 2738+05 2730+02 2732-12 2853-23 276739 278050 288462\nT01 1919 2014+11 1710+11 1812+08 1916-06 2124-20 234035 255345 258055\nT06 1714 2205+12 1811+12 1814+07 1718-07 2120-18 243034 243144 277055\nT07 1315 1510+11 1710+12 2010+07 1812-07 1914-18 241534 292343 296855\nTCC      2714    2715+03 2721-03 2920-19 2453-28 237244 237552 246855\nTLH 9900 1109+11 1409+10 1607+06 2506-07 9900-19 271636 282445 294256\nTRI      2316+14 2317+10 2515+03 2733-08 2845-21 275237 274947 275159\nTUL 2131 2228+14 2327+09 2336+01 2358-14 2278-24 228740 720250 741356\nTUS      9900+11 9900+04 2809-01 2821-16 3022-29 272445 262853 253858\nTVC 2212 2423+08 2529+03 2534-03 2745-15 2563-25 259441 740151 752064\nTYS 2313 2318+14 2417+10 2416+04 2631-09 2739-22 265337 265647 265658\nWJF      2411+09 2508+05 2612-01 3013-15 2919-28 271845 241754 251663\nYKM 2817 2818-06 2521-11 2535-18 2362-27 2373-37 247847 247149 255751\nZUN              3007+03 3007-06 3312-18 3423-30 352246 341853 272158\n2XG 9900 1109+14 0906+10 0306+05 3111-07 3615-20 352036 342346 323358\n4J3 0808 1022+12 1210+12 9900+08 9900-07 9900-18 281235 292244 315354\n"
  },
  "windAloft12": {
    "@context": {
      "@version": "1.1",
      "@vocab": "https://api.weather.gov/ontology#"
    },
    "@id": "https://api.weather.gov/products/9f619931-2cf3-447f-afa5-d32ff0ca4922",
    "id": "9f619931-2cf3-447f-afa5-d32ff0ca4922",
    "wmoCollectiveId": "FBUS33",
    "issuingOffice": "KWNO",
    "issuanceTime": "2026-04-15T13:59:00+00:00",
    "productCode": "FD3",
    "productName": "24 Hour Winds Aloft Forecast",
    "productText": "\n000\nFBUS33 KWNO 151359\nFD3US3\nDATA BASED ON 151200Z    \nVALID 160000Z   FOR USE 2100-0600Z. TEMPS NEG ABV 24000\n\nFT  3000    6000    9000   12000   18000   24000  30000  34000  39000\nABI      2214+16 2316+08 2425+01 2444-13 2363-24 237242 239349 741056\nABQ              2608+07 2711-02 3018-17 3220-30 362145 331653 262758\nABR 9900 3005+08 3114+00 2817-06 2816-18 2920-31 302646 313056 273061\nACK 2528 2531+13 2730+06 2839+01 2843-10 2839-22 284939 295550 295162\nACY 2526 2726+16 2929+10 3027+03 2827-11 2639-22 284438 294748 296261\nAGC 2329 2434+13 2639+10 2642+03 2749-11 2737-22 274738 266249 277761\nALB 2815 2828+12 2930+06 2948+01 2838-12 2651-23 276139 276650 288962\nALS                      2511-01 3015-18 3316-29 332245 331954 311960\nAMA      2612    2513+07 2517-02 2623-18 2452-28 246244 246251 246155\nAST 2924 2927-09 2927-15 2926-22 3022-37 2940-39 295542 295644 295347\nATL 2211 2211+13 2314+11 2412+05 2217-07 2323-20 253436 254245 287156\nAVP 2421 2629+13 2732+09 2739+03 2839-13 2847-22 285138 285449 278061\nAXN 1908 2714+06 2818+00 2721-05 2622-19 2817-31 292247 292756 254057\nBAM              2530+03 2534-05 2644-18 2641-30 264745 264954 265464\nBCE                      2514-02 2618-16 2721-29 262745 262854 253063\nBDL 2815 2822+12 2927+06 3040+01 2934-11 2651-22 275539 275949 286463\nBFF      2714    2815+05 2820-04 2920-17 3124-30 313245 313054 322963\nBGR 2507 2718+07 2724+02 2833-03 2853-12 2866-24 288540 289252 780764\nBHM 2014 2222+13 2118+10 2315+05 2326-07 2133-20 233937 245445 278256\nBIH      9900    2305+06 2507-01 2727-18 2732-30 263544 273854 264364\nBIL      2323    2327+02 2428-06 2444-19 2561-32 257147 257955 256663\nBLH 2008 2009+12 2806+06 2707+00 2711-15 2620-28 272544 262553 263362\nBML 1913 2728+08 2831+03 3048+00 2748-13 2758-24 277440 278251 289564\nBNA 2018 2320+14 2220+11 2323+03 2441-08 2454-22 245937 246647 268358\nBOI      2629+04 2541-03 2549-09 2460-22 2577-31 258747 259056 258260\nBOS 2520 2729+11 2831+06 2927+01 2829-11 2748-23 275839 286550 286363\nBRL 2032 2438+12 2431+07 2433-01 2462-16 2477-25 239141 730152 249459\nBRO 1622 1810+17 2207+15 2408+08 2317-08 2334-19 245435 247143 248454\nBUF 2514 2327+11 2436+06 2543+01 2752-10 2756-22 277539 278850 770563\nCAE 2212 2312+14 2409+12 2809+04 3013-07 2916-20 282436 273146 315557\nCAR 2309 2409+04 2720-02 2631-06 2842-17 2768-28 289943 791153 780462\nCGI 2026 2223+12 2225+09 2333+03 2450-12 2472-22 248539 248549 750558\nCHS 2409 2707+15 2406+11 3208+04 3411-07 3211-19 291736 292946 314957\nCLE 2433 2436+13 2736+06 2656+01 2745-11 2557-22 256139 256350 268463\nCLL 1725 2313+13 2314+11 2227+06 2342-09 2355-21 246037 258146 751055\nCMH 2330 2531+12 2636+08 2538+02 2650-11 2556-23 255638 266949 268161\nCOU 2030 2335+13 2434+07 2435+00 2460-14 2478-25 730041 730751 740359\nCRP 1723 2010+15 2016+14 2218+07 2323-09 2343-21 246136 248644 249955\nCRW 2319 2321+13 2421+10 2424+03 2742-09 2751-22 266138 266448 276860\nCSG 2210 2012+13 2211+10 2209+06 2215-07 2220-19 243335 264045 297056\nCVG 2223 2521+13 2533+09 2532+02 2451-11 2569-23 256538 257549 268761\nCZI              2324+04 2328-04 2635-17 2638-30 264545 264954 265264\nDAL 2029 2215+15 2320+09 2425+03 2459-12 2272-23 218038 229248 731557\nDBQ 2128 2334+10 2535+06 2439+00 2451-16 2563-26 238942 239253 238460\nDEN              2910+06 2816-03 3021-17 3121-30 322745 322854 312262\nDIK      2313+09 2218+00 2431-08 2741-19 2645-31 265747 266355 276063\nDLH 9900 2920+06 2825-01 2731-07 2836-20 3135-30 293747 264054 246056\nDLN              2231+00 2441-08 2450-21 2477-32 248946 249455 258159\nDRT 1411 9900+18 2407+11 2412+04 2445-11 2454-23 247938 249746 741556\nDSM 2028 2230+10 2238+04 2242-03 2257-19 2374-27 238343 238851 237457\nECK 2819 2724+10 2637+05 2637+00 2541-12 2664-24 258539 259350 750664\nEKN      2326+14 2523+10 2628+03 2845-10 2747-21 264137 264848 266861\nELP      2711    2612+08 2720+00 2631-16 2540-29 255343 256151 256856\nELY              2426+07 2427-02 2638-18 2637-30 264345 254454 244763\nEMI 2324 2525+14 2830+11 2929+04 2932-11 2837-22 284838 274848 276961\nEVV 2123 2320+12 2432+10 2440+03 2453-11 2564-22 247638 248049 259459\nEYW 0718 1011+17 0915+13 0714+08 0613-07 0713-17 011734 342543 356253\nFAT 3209 3205+08 2807+04 2712-03 2627-17 2733-29 273444 283853 274063\nGPI      2220-01 2530-09 2440-14 2256-26 2270-39 238049 238251 245950\nFLO 2314 2513+14 2809+11 3209+05 3217-07 3118-20 292736 293346 294458\nFMN              2811+05 2814-03 3015-17 3117-29 322045 321753 321563\nFOT 3413 2920+00 2834-03 2846-05 2860-18 2860-30 286545 286554 286062\nFSD 9900 3005+09 3006+00 3012-07 3310-19 2829-30 223346 241554 243655\nFSM 2026 2131+13 2331+07 2438+02 2454-13 2374-23 218339 229549 731358\nFWA 2431 2534+12 2542+05 2442+00 2648-13 2556-24 257239 258250 259863\nGAG      2609+15 2411+06 2323-02 2534-18 2462-28 246844 237351 236855\nGCK      2508+13 2510+04 2512-05 2826-18 3121-31 272845 254651 244854\nGEG      2526-04 2525-13 2425-21 2341-32 2270-38 226446 236147 255048\nGFK 2612 2720+06 2826-02 2731-08 2631-19 2640-32 274747 285256 264761\nGGW      1810+06 2015-03 2430-09 2444-21 2559-34 258448 258855 256359\nGJT              2411+05 2416-03 2719-18 2825-29 292844 282153 272262\nGLD      2513    2515+05 2517-04 3028-18 3228-31 343446 332753 272956\nGRB 2512 2419+08 2324+02 2336-03 2451-16 2469-28 249544 741253 730361\nGRI      2715+09 2924+02 3129-06 3223-20 2924-32 271546 253248 243952\nGSP 2316 2410+15 2313+11 2614+04 2617-07 2726-20 263537 274346 296157\nGTF      2717    2618-04 2422-10 2250-22 2359-36 249248 249855 246654\nH51 1715 1406+14 1708+13 2106+08 2016-07 2332-19 255134 257043 247654\nH52 1313 1105+14 1512+14 1715+08 1815-06 2514-16 272232 293243 285154\nH61 1210 1312+16 1607+13 9900+08 9900-06 1007-17 331134 333343 336254\nHAT 2517 2910+15 3606+10 3608+03 3116-09 2920-20 293137 303848 314860\nHOU 1823 2014+12 2210+12 2214+07 2328-08 2342-21 245937 258344 259955\nHSV 2018 2225+14 2117+11 2318+05 2331-07 2340-21 234837 245946 278057\nICT 3414 2619+11 2529+03 2541-03 2548-18 2377-27 239343 239551 237854\nILM 2513 2708+16 3005+10 3608+05 3322-07 3122-20 323337 303547 304659\nIMB              2731-12 2638-20 2473-26 2584-35 259245 267849 266352\nIND 2326 2330+12 2434+06 2535+00 2548-12 2555-22 246638 247250 259361\nINK      2413+18 2415+09 2417+00 2440-15 2555-27 247243 248249 249055\nINL 2018 2724+05 2827-02 2827-09 2826-20 3031-31 294148 294456 264957\nJAN 2019 2119+11 2016+12 2120+06 2232-07 2238-21 235236 246246 269556\nJAX 9900 9900+15 1406+11 9900+07 3008-07 9900-19 301035 312545 336255\nJFK 2527 2725+13 2933+09 2938+02 2837-12 2646-22 284938 285148 295661\nJOT 2134 2341+12 2345+06 2543+00 2453-14 2571-25 249040 730051 249662\nLAS      1913+15 2116+06 2317-02 2716-16 2824-29 262745 253254 243363\nLBB      2514+17 2515+08 2516-01 2441-15 2451-28 246743 247450 247156\nLCH 1917 2012+11 2116+12 2116+07 2229-07 2237-20 245336 257944 259355\nLIT 1923 2423+13 2221+10 2423+04 2435-12 2263-22 237939 247548 751356\nLKV              2640-07 2562-12 2776-18 2684-30 268946 268554 266759\nLND              2434+03 2440-03 2637-17 2639-30 265045 265554 255964\nLOU 2223 2420+12 2431+10 2434+02 2449-10 2566-22 256738 257248 268659\nLRD 1416 1607+15 2811+14 2517+08 2433-09 2343-22 246436 248645 740355\nLSE 0408 2317+09 2326+03 2541-02 2346-18 2361-27 238044 238653 237358\nLWS 2723 2632-04 2542-11 2353-17 2269-27 2275-37 238647 238350 256651\nMBW              2529    2531-04 2729-17 2828-30 293445 293054 293363\nMCW 0706 2211+09 2329+05 2236-03 2232-19 2423-29 236844 237352 235955\nMEM 2023 2224+12 2222+11 2223+05 2341-10 2356-22 236838 237248 269856\nMGM 2111 2016+14 2014+10 2213+06 2220-07 2123-20 243535 244545 287356\nMIA 0612 0914+17 0909+13 0409+07 0314-07 0413-18 361835 332444 334455\nMKC 2523 2526+11 2437+05 2346-02 2270-17 2383-27 730242 730652 238856\nMKG 2423 2420+10 2436+04 2436-01 2557-15 2578-26 259641 741151 741363\nMLB 1009 0906+16 9900+12 9900+07 3307-07 0108-18 351336 332445 345455\nMLS      2116+10 2121+01 2432-07 2647-19 2655-31 266347 267155 255963\nMOB 1914 1812+14 2013+11 2215+07 2123-07 2223-19 243434 264644 277555\nMOT      2514+05 2628-03 2638-09 2642-20 2648-31 266247 266856 266862\nMQT 2407 2716+08 2523+01 2537-05 2553-20 2573-31 249745 259653 258157\nMRF              2613+11 2613+02 2536-14 2462-26 247941 740548 740555\nMSP 1309 3007+07 2817+00 2629-05 2629-19 2717-31 281347 243853 245755\nMSY 1712 9900+11 2016+12 2019+07 2124-07 2227-19 244134 265744 267855\nOKC 2314 2417+16 2517+07 2431-01 2455-15 2374-25 228642 239251 239657\nOMA 3329 2415+07 2329+01 2336-04 2338-18 2354-29 238142 237049 235953\nONL      2607+10 2809+01 2916-07 3422-19 3122-31 361347 341653 252554\nONT 2409 2108+10 2408+06 2511-01 2613-15 2624-29 273144 283953 283963\nORF 2418 2814+16 2911+10 3213+04 3023-09 2828-22 293838 283948 295459\nOTH 2919 3024-07 2925-14 2843-18 2878-22 2898-32 289446 288951 297154\nPDX 2818 2927-08 2928-15 2827-22 2529-37 2749-38 276242 286044 285247\nPFN 9900 1213+12 1609+11 2206+07 2111-07 2115-18 252434 272844 296556\nPHX 9900 9900+12 9900+06 2605-01 2715-16 2918-29 291644 301753 282861\nPIE 1009 1112+16 9900+12 2806+08 9900-07 9900-17 331335 332844 346855\nPIH      2014    2332+00 2540-06 2452-19 2555-30 255946 256655 257263\nPIR      9900+09 2712+01 2818-06 2916-17 3021-31 322446 313155 302962\nPLB 2517 2727+08 2828+05 2941-01 2746-13 2765-24 277640 278751 780164\nPRC              2208+06 2206-02 2713-16 2823-28 282144 282153 271562\nPSB      2635+14 2638+10 2739+03 2847-12 2847-22 274938 276449 277662\nPSX 1721 1915+14 2110+13 2214+07 2325-08 2343-21 246037 258644 249855\nPUB              2512+06 2720-01 2919-18 3318-30 332346 342254 312060\nPWM 2311 2730+09 2932+03 3045+00 2743-12 2752-23 276539 287151 277563\nRAP      1910+12 2012+04 2518-04 2724-17 2827-30 293345 283355 303764\nRBL 1809 2720+03 2631-02 2740-05 2844-18 2752-30 275845 275854 275862\nRDM      2726-06 2729-13 2734-20 2669-26 2684-35 269045 278049 276052\nRDU 2317 2414+16 2708+10 3107+05 3025-07 3134-21 294237 284147 285159\nRIC 2321 2623+16 2817+10 3117+03 3128-09 2937-22 283937 284547 286059\nRKS              2424    2425-03 2641-19 2641-30 264644 264853 264463\nRNO      2522    2633+01 2638-04 2833-17 2731-30 274345 274855 275364\nROA 2215 2416+15 2619+10 2613+03 2837-08 2843-22 285137 275748 275860\nROW      9900    2305+08 2408-01 2633-17 2544-28 255344 245450 245756\nSAC 2407 3012+06 2821+01 2728-04 2728-18 2828-29 283744 274254 284363\nSAN 3106 1908+11 2307+06 2308+01 2909-15 2724-27 284043 284952 284763\nSAT 1520 2014+15 2211+11 2320+08 2433-10 2348-22 246637 248945 741055\nSAV 2306 2707+14 1907+11 9900+05 3307-07 3108-19 281636 292745 326456\nSBA 2906 3505+10 9900+05 2511-01 2615-15 2725-28 283643 284053 273964\nSEA 2409 2809-08 2911-14 2913-21 2817-36 2823-47 273443 283644 283646\nSFO 3214 3113+07 2918+02 2820-04 2822-18 2826-29 273844 274354 274163\nSGF 2029 2332+12 2332+07 2432+00 2357-13 2370-25 229640 720450 730958\nSHV 1821 2510+13 2213+10 2320+05 2339-10 2254-21 236638 248148 750856\nSIY      2719-01 2636-07 2651-10 2876-18 2777-30 278446 278454 286859\nSLC      2309    2325+05 2330-03 2542-19 2645-30 255145 255454 245263\nSLN 2607 2924+09 2923+02 2728-05 2641-19 2463-30 238943 238049 236753\nSPI 2141 2431+13 2433+07 2436+00 2457-14 2478-24 239140 730151 249960\nSPS 2113 2213+15 2417+07 2433+00 2451-14 2369-25 227742 238951 730156\nSSM 2407 2719+10 2620+02 2629-04 2646-17 2454-29 259643 750753 259159\nSTL 2033 2431+13 2428+08 2530+00 2453-14 2474-24 239239 730351 740959\nSYR 3015 2523+11 2626+05 2537+00 2644-11 2755-23 276639 277451 780463\nT01 1818 1607+12 1912+12 2214+07 2121-07 2233-19 245135 257743 258054\nT06 1611 9900+12 1713+13 2018+08 2124-07 2223-18 253534 266243 266655\nT07 1410 1408+13 1808+13 2012+08 2017-06 2216-17 262333 293643 286255\nTCC      2613    2514+08 2615-01 2515-19 2535-29 254545 255051 245055\nTLH 9900 1407+12 1607+11 9900+07 2307-07 2111-18 262135 292844 306356\nTRI      2115+15 2420+09 2522+03 2630-07 2740-21 264637 265547 286558\nTUL 2122 2521+14 2525+07 2441+00 2458-14 2377-25 229341 229950 730357\nTUS      2908+15 9900+07 2306+00 2714-15 2914-29 281744 282953 273859\nTVC 2511 2519+10 2526+04 2436-03 2538-17 2572-27 259543 741052 740160\nTYS 2416 2217+14 2317+10 2421+03 2528-07 2641-21 254438 255446 277158\nWJF      2515+10 2610+05 2512-01 2615-15 2626-29 273044 283553 283663\nYKM 2719 2821-07 2925-14 2826-21 2825-36 2545-41 255243 264944 264447\nZUN              2708+07 2708-02 2712-17 2918-29 321845 321454 301561\n2XG 9900 9900+15 0305+11 0109+05 3510-06 3507-19 352136 342346 323857\n4J3 0910 1312+15 1706+13 2505+08 9900-06 2108-17 261434 312643 316155\n"
  },
  "windAloft24": {
    "@context": {
      "@version": "1.1",
      "@vocab": "https://api.weather.gov/ontology#"
    },
    "@id": "https://api.weather.gov/products/51eeda37-0121-4d79-993f-45986a627432",
    "id": "51eeda37-0121-4d79-993f-45986a627432",
    "wmoCollectiveId": "FBUS35",
    "issuingOffice": "KWNO",
    "issuanceTime": "2026-04-15T13:59:00+00:00",
    "productCode": "FD5",
    "productName": "Winds Aloft Forecast",
    "productText": "\n000\nFBUS35 KWNO 151359\nFD5US5\nDATA BASED ON 151200Z    \nVALID 161200Z   FOR USE 0600-1800Z. TEMPS NEG ABV 24000\n\nFT  3000    6000    9000   12000   18000   24000  30000  34000  39000\nABI      2522+16 2419+09 2633+01 2646-15 2653-27 268838 269847 752155\nABQ              2814+06 2520-01 2630-14 2635-28 254244 264752 265760\nABR 1626 2021+11 2318+04 2520-05 2534-17 2537-30 254246 254954 255863\nACK 2531 2539+15 2749+09 2755+02 2845-11 2843-22 284039 284251 296364\nACY 3120 2524+15 2534+10 2531+02 2740-10 2846-22 285139 285150 275462\nAGC 2626 2424+11 2435+09 2537+02 2545-11 2560-24 256840 257350 266762\nALB 3016 2925+11 2732+07 2740+01 2746-12 2756-24 287640 288152 287364\nALS                      2723-03 2522-15 2427-28 253444 253853 244362\nAMA      2725    2625+06 2523-02 2826-15 2927-28 283344 283451 275757\nAST 3119 3316-07 3421-13 3525-19 3555-32 3580-40 358446 347047 335649\nATL 2518 2515+12 2120+10 2323+06 2329-09 2435-22 244937 255047 278356\nAVP 3021 2929+13 2640+09 2545+02 2645-11 2758-23 276540 277050 276664\nAXN 1712 1608+07 9900+00 2615-05 2825-17 2729-30 273446 274154 264863\nBAM              2717-06 2545-13 2567-20 2585-31 259247 259254 268157\nBCE                      2431-02 2537-17 2547-30 255244 265854 255963\nBDL 3226 2930+14 2744+09 2747+02 2651-12 2748-23 286640 287751 286964\nBFF      2728    2735+06 2523-02 2431-18 2443-30 245045 245254 245363\nBGR 1707 2615+07 2719+02 2727-01 2846-13 2865-25 277741 277953 288365\nBHM 2423 2414+10 2327+11 2426+05 2333-10 2338-22 245437 256346 269556\nBIH      9900    2719+04 2825-02 2828-17 2738-29 265145 265854 266163\nBIL      3122    2005-06 2340-11 2359-22 2380-34 239048 238554 236256\nBLH 2109 2113+11 2215+06 2419+01 2523-14 2329-26 243842 245052 255464\nBML 2509 2618+07 2726+03 2824+00 2845-13 2767-24 277342 297853 298765\nBNA 2534 2431+09 2421+08 2326+03 2446-11 2455-24 237038 247249 259857\nBOI      3121-07 3221-14 2920-21 2543-34 2388-36 248243 257247 265449\nBOS 2505 2931+13 2741+09 2746+03 2748-12 2752-23 286640 286351 286965\nBRL 2945 2849+06 2849+01 2748-03 2644-15 2470-26 229341 229452 256356\nBRO 1722 1814+16 3305+14 3112+08 2619-07 2532-18 254934 256044 247355\nBUF 2427 2631+10 2633+05 2633+00 2654-12 2566-24 267541 267352 278163\nCAE 2515 2315+13 2217+11 2217+05 2318-08 2323-21 263837 264847 286357\nCAR 1806 2207+03 2719+00 2727-05 2736-16 2863-27 277644 298555 278963\nCGI 2826 2839+10 2727+04 2333-01 2353-13 2469-24 246841 248150 740056\nCHS 2610 9900+12 2011+11 2308+05 2411-08 2315-20 273237 274346 295757\nCLE 2536 2431+11 2331+06 2344+01 2455-12 2559-24 246741 248650 266861\nCLL 2122 2306+14 2820+11 2829+04 2444-11 2455-22 267537 258745 750055\nCMH 2532 2327+10 2335+08 2339+01 2352-12 2461-24 246740 248450 258261\nCOU 2711 2924+10 3031+02 2837-03 2636-16 2469-27 228142 227551 247555\nCRP 1818 1916+15 3607+13 2810+07 2532-09 2537-20 256635 257244 258855\nCRW 2525 2324+12 2325+10 2327+02 2440-11 2448-23 246240 246749 267259\nCSG 2211 2216+12 2116+11 2420+07 2326-08 2433-21 244736 265346 278556\nCVG 2436 2526+10 2330+08 2235+02 2352-12 2361-24 247040 237949 258558\nCZI              2529+03 2638-05 2459-18 2457-31 235846 236055 236163\nDAL 2430 2613+16 2718+08 2732+00 2547-15 2463-26 259438 750447 752755\nDBQ 3006 0108+05 3507+00 9900-05 2417-17 2337-26 239841 239951 245557\nDEN              2728+06 2720-01 2425-16 2436-29 244145 244254 245063\nDIK      2721+09 2325+03 2536-04 2438-19 2544-31 245947 246556 246763\nDLH 3206 9900+06 3207-01 2813-06 2827-18 2828-30 273246 283854 264463\nDLN              2718-11 2328-18 2261-28 2393-37 239447 238250 246052\nDRT 1717 1811+16 2312+12 2419+04 2543-10 2647-22 266937 257946 249255\nDSM 3126 3124+08 3131+01 3031-05 3127-17 2918-29 302446 253751 263856\nECK 2730 2519+09 2330+04 2340-02 2355-12 2459-25 257141 259252 278763\nEKN      2620+10 2423+09 2327+03 2538-10 2546-23 255840 256649 266660\nELP      2408    2416+08 2225-01 2521-13 2744-24 266240 267050 258459\nELY              2522+01 2441-05 2550-18 2555-30 256145 256755 256761\nEMI 3022 2717+13 2429+09 2433+03 2640-09 2748-23 266039 266450 275762\nEVV 2634 2632+10 2332+05 2242+00 2258-13 2463-24 237940 237950 259357\nEYW 1107 1012+18 0710+13 0612+07 0413-08 0110-17 352733 353843 335254\nFAT 3313 3108+06 2817+01 2925-03 2830-16 2734-28 274144 264654 264663\nGPI      2625-08 2826-14 2822-21 2917-34 2813-44 233144 233146 232847\nFLO 2614 2312+12 2413+11 2413+04 2317-08 2221-21 263738 264747 284758\nFMN              2515+06 2518-03 2628-16 2532-29 254044 254253 264561\nFOT 0125 3637-04 3446-06 3254-09 3167-20 3184-30 318446 318655 316457\nFSD 1713 2409+10 2916+03 2816-04 2826-17 2828-29 272745 283253 273363\nFSM 2126 2621+12 2820+06 2729-02 2450-15 2357-28 237542 248449 249753\nFWA 2430 2428+10 2330+05 2343-01 2460-12 2363-25 237240 247852 257759\nGAG      2521+15 2517+07 2407-01 2617-18 3118-29 312244 282651 274056\nGCK      2321+15 2418+07 2414-01 2612-16 2819-29 311344 321652 282760\nGEG      3116-07 2820-15 3021-22 0118-34 0326-47 311545 291544 282145\nGFK 1518 1926+07 2320+00 2525-06 2641-19 2651-31 265847 266456 256363\nGGW      2923-01 2617-03 2427-08 2457-21 2366-34 238249 238156 226757\nGJT              2327+05 2328-03 2538-17 2547-30 254744 255054 255263\nGLD      2209    2213+06 2413-02 2615-16 2620-29 261844 272553 263162\nGRB 0307 9900+06 2306+01 3206-04 2716-17 2236-29 229641 730952 248260\nGRI      2719+14 2818+05 2920-04 2719-17 2825-30 291844 302153 282661\nGSP 2621 2518+15 2217+11 2125+05 2427-09 2334-22 254738 255348 276857\nGTF      2731    2630-13 2532-20 2258-30 2289-37 227646 236349 224950\nH51 1718 2015+13 3405+14 3409+08 2513-07 2430-18 254834 255944 257255\nH52 1513 9900+12 1712+15 1812+09 2311-07 2617-17 263633 274143 275955\nH61 1212 1309+19 9900+14 0305+08 9900-06 2711-18 302232 312943 305055\nHAT 2616 2209+14 2106+09 2306+03 3115-08 3021-21 283138 293347 283560\nHOU 1818 2313+14 2816+11 2823+06 2540-10 2445-21 266536 257645 259356\nHSV 2424 2419+10 2424+08 2426+05 2337-10 2344-23 245638 256347 269456\nICT 1613 2613+13 3114+05 3115-04 2812-17 2512-30 261645 252751 254056\nILM 2513 2208+13 2707+10 2809+05 2512-08 2615-21 273337 284047 293758\nIMB              3025-15 3024-22 3322-37 3228-45 303542 294043 293846\nIND 2437 2528+10 2431+05 2234+00 2255-12 2364-23 247541 248152 258858\nINK      2810+16 2622+09 2527+01 2633-14 2638-25 277539 268349 750456\nINL 9900 2817+05 2924-03 2926-08 2839-18 2748-32 265847 276556 266662\nJAN 2321 2317+10 2616+10 2619+06 2334-10 2350-22 246237 257746 750255\nJAX 9900 1308+15 1808+11 1907+06 2710-08 2415-19 283035 283644 306256\nJFK 3023 2726+15 2639+10 2642+02 2646-11 2846-22 284739 285650 286863\nJOT 2426 2329+07 2332+03 2336-02 2256-13 2471-25 227242 238952 267357\nLAS      2222+11 2224+05 2425+00 2534-15 2542-29 265743 266353 256263\nLBB      2813+16 2716+07 2619-01 2731-15 2831-27 274742 276650 267856\nLCH 2118 2414+12 2713+11 2619+06 2429-10 2347-21 266336 257745 259256\nLIT 3007 2623+11 2728+06 2630+00 2338-12 2355-25 238040 249248 741155\nLKV              3228-14 3232-22 3135-34 2859-35 287142 286746 286049\nLND              2440+02 2547-04 2357-18 2457-31 246146 246354 245661\nLOU 2435 2632+10 2330+07 2235+02 2250-12 2461-23 247340 237849 259357\nLRD 1916 1609+15 9900+14 2615+06 2529-08 2635-20 256235 257345 248455\nLSE 0808 0614+07 0410+00 3510-05 2908-18 3013-30 342045 262252 253856\nLWS 2611 2819-08 2922-14 2920-21 2820-37 2817-46 262544 262743 272646\nMBW              2540    2548-03 2439-18 2443-29 244645 244954 245064\nMCW 3613 3620+07 3417+00 3417-05 3224-16 2924-29 332645 322553 273158\nMEM 2632 2627+11 2623+06 2329+01 2454-12 2462-24 237538 248248 750555\nMGM 2015 2116+14 2219+12 2422+06 2326-09 2432-21 245136 266146 278856\nMIA 1013 0909+18 0510+13 0409+08 3612-07 3612-18 352734 353743 335355\nMKC 2318 2719+12 3023+03 3127-05 3029-17 2727-29 254744 245351 255356\nMKG 9900 2420+07 2527+03 2536-02 2355-14 2265-25 237242 248053 268461\nMLB 1311 0911+16 0906+12 9900+07 9900-08 3108-18 312234 333544 325355\nMLS      2822+03 2427+00 2439-06 2451-20 2357-32 237347 237555 236460\nMOB 1911 2111+16 2319+13 2522+07 2424-09 2330-20 255235 266045 267956\nMOT      2035+09 2130+02 2130-06 2436-19 2548-32 246448 257557 247362\nMQT 3411 3414+05 3011+00 2915-04 2914-17 2621-30 233345 236553 247160\nMRF              2409+10 2416+02 2637-13 2653-23 266638 258347 259957\nMSP 0705 9900+06 9900+00 3007-04 3018-17 2923-29 292445 292853 283361\nMSY 2013 2312+13 2416+13 2418+07 2423-08 2335-20 255334 266445 268256\nOKC 2419 2716+16 2622+07 2527-02 2538-17 2445-29 245743 245949 256954\nOMA 2525 2617+12 2722+03 2924-06 3124-17 3121-29 322545 343252 292759\nONL      2716+13 2817+05 2717-04 2627-17 2730-29 272945 273353 263763\nONT 9900 2711+10 2614+06 2516+00 2423-15 2325-27 233242 233753 244164\nORF 2618 2315+16 2315+10 2415+03 2625-08 2732-22 274038 284548 274261\nOTH 3315 3320-08 3330-13 3447-19 3480-28 3395-35 339045 328448 326450\nPDX 3121 3223-08 3323-13 3323-20 3527-35 3557-42 346444 335745 334847\nPFN 1611 1715+14 2012+13 2414+07 2420-08 2526-20 253835 274944 286956\nPHX 9900 2105+11 2315+06 2318+01 2623-14 2534-26 264442 255552 256063\nPIE 0609 1208+17 9900+12 3305+08 2905-07 2611-18 292533 313743 315056\nPIH      2625    2724-09 2333-13 2378-20 2385-33 249348 249555 257755\nPIR      2623+13 2526+04 2526-04 2536-17 2538-30 254545 255554 255763\nPLB 2618 2721+08 2624+03 2629+00 2749-14 2663-24 287441 288153 289064\nPRC              2115+05 2422+00 2626-14 2534-27 264442 265652 256063\nPSB      2725+12 2536+09 2538+02 2645-11 2660-24 277040 267750 276763\nPSX 1814 2113+15 3213+13 2914+06 2536-10 2540-20 266535 257445 258955\nPUB              2929+06 2713-01 2519-15 2522-28 253044 263453 254363\nPWM 9900 2814+09 2730+05 2730+00 2850-12 2758-24 287741 298652 287863\nRAP      2743+12 2736+05 2639-02 2540-18 2446-31 245146 245854 246263\nRBL 0131 3634-04 3341-05 3050-07 2966-20 2983-30 298847 298455 296858\nRDM      3033-08 3231-15 3224-21 3323-36 3239-42 324941 315144 314446\nRDU 2519 2412+17 2412+10 2516+04 2526-09 2429-22 264239 275148 274359\nRIC 2813 2511+15 2416+10 2521+03 2533-09 2636-22 274639 275149 274860\nRKS              2529    2439-05 2453-19 2454-31 246245 246454 245661\nRNO      3016    2825-06 2844-07 2766-19 2774-30 277746 277754 266860\nROA 3022 2515+14 2322+11 2325+03 2437-09 2541-23 254939 255649 265959\nROW      2412    2617+08 2518+00 2624-14 2627-27 265241 277350 267659\nSAC 3618 3315+03 3026+00 2940-03 2851-17 2855-29 285745 286055 275362\nSAN 9900 2507+11 2409+06 2313+01 2319-15 2124-26 213142 224652 234863\nSAT 1922 1707+14 9900+13 2517+06 2536-09 2640-21 266636 257645 249355\nSAV 2606 9900+13 1914+11 2111+06 2612-08 2417-20 273436 274146 295957\nSBA 0308 3516+09 3314+04 3013-01 2620-15 2423-26 232644 233354 243263\nSEA 3308 3323-08 3425-14 3430-21 3630-35 3638-43 355645 345046 334447\nSFO 0117 3323+05 3126+02 3035-02 2940-17 2940-28 284245 284454 274263\nSGF 2519 2916+11 2925+04 2838-04 2544-15 2362-27 227243 237150 248054\nSHV 2327 2314+13 2517+07 2622+02 2347-12 2363-23 258338 259746 751055\nSIY      3420-08 3329-13 3242-18 3175-25 3186-33 308344 307649 295853\nSLC      2608    2521-02 2334-06 2455-20 2460-32 257046 257755 257060\nSLN 2023 2518+13 2916+05 3118-04 2918-17 2815-29 281245 321253 262457\nSPI 2830 2840+08 2740+02 2643-01 2457-15 2373-25 227042 227552 257856\nSPS 2416 2614+16 2625+08 2530-01 2648-16 2550-29 256541 257948 258855\nSSM 3315 3013+05 2914+01 2820-03 2621-16 2560-28 248243 740553 751363\nSTL 3019 2924+09 2830+03 2737-01 2362-13 2370-25 226942 227353 248955\nSYR 2416 2626+11 2629+05 2736-01 2751-12 2669-25 268240 277652 287964\nT01 1814 2311+12 2709+13 2912+07 2422-08 2339-19 255734 256845 258056\nT06 1812 2209+13 2412+14 2414+07 2421-08 2331-18 264734 265844 267756\nT07 1506 1707+15 2014+14 2215+08 2416-08 2521-19 254034 275244 276656\nTCC      2622    2625+06 2727-02 2731-15 2625-27 273743 273252 265159\nTLH 2006 1712+13 2011+12 2411+07 2318-07 2524-20 263535 284444 286956\nTRI      2421+13 2322+10 2327+04 2437-10 2339-23 245439 245948 267257\nTUL 2227 2316+13 2620+06 2625-02 2536-16 2348-29 236343 246750 247453\nTUS      1605+13 1917+06 2311+01 2524-12 2534-25 264241 255351 256563\nTVC 9900 2512+07 2615+02 2811-04 2353-14 2360-27 237542 237753 760264\nTYS 2424 2423+11 2328+10 2328+05 2340-10 2442-23 245639 245848 268357\nWJF      3016+10 2813+05 2616+00 2523-15 2428-27 243343 244154 244264\nYKM 3020 3224-06 3218-13 3220-21 3327-36 3527-46 343144 323344 323545\nZUN              2315+05 2423-01 2527-14 2537-27 274542 275652 276362\n2XG 1307 0807+15 0807+11 9900+05 3112-07 3010-19 301835 302945 325356\n4J3 1508 1810+16 2006+13 2506+08 2412-07 2518-19 272833 294143 296055\n"
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
          "end": "2026-04-15T17:35:00Z"
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
            "11:45 AM",
            "11:50 AM",
            "11:54 AM",
            "11:55 AM",
            "12:00 PM",
            "12:05 PM",
            "12:10 PM",
            "12:15 PM",
            "12:20 PM",
            "12:25 PM",
            "12:30 PM",
            "12:35 PM",
            "12:35 PM"
          ],
          "air_temp_set_1": [
            62.6,
            62.6,
            62.06,
            62.6,
            62.6,
            62.6,
            62.6,
            62.6,
            62.6,
            64.4,
            64.4,
            64.4
          ],
          "wind_speed_set_1": [
            21.86,
            20.71,
            23.02,
            21.86,
            21.86,
            20.71,
            20.71,
            23.02,
            23.02,
            19.56,
            21.86,
            18.41,
            18.41
          ],
          "wind_direction_set_1": [
            170,
            190,
            180,
            170,
            180,
            170,
            170,
            170,
            160,
            170,
            180,
            180,
            180
          ],
          "altimeter_set_1": [
            29.95,
            29.95,
            29.95,
            29.95,
            29.94,
            29.94,
            29.94,
            29.94,
            29.94,
            29.94,
            29.93,
            29.93
          ],
          "wind_gust_set_1": [
            null,
            26.47,
            31.07,
            null,
            28.77,
            27.62,
            32.22,
            28.77,
            29.92,
            27.62,
            28.77,
            26.47,
            26.47
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
          "end": "2026-04-15T17:35:00Z"
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
            "8:35 AM",
            "8:55 AM",
            "9:15 AM",
            "9:35 AM",
            "9:55 AM",
            "10:15 AM",
            "10:35 AM",
            "10:55 AM",
            "11:15 AM",
            "11:35 AM",
            "11:55 AM",
            "12:15 PM",
            "12:15 PM"
          ],
          "air_temp_set_1": [
            48.2,
            50,
            51.8,
            51.8,
            53.6,
            55.4,
            57.2,
            57.2,
            59,
            59,
            60.8,
            60.8
          ],
          "wind_speed_set_1": [
            18.41,
            19.56,
            20.71,
            21.86,
            24.17,
            21.86,
            23.02,
            21.86,
            23.02,
            24.17,
            20.71,
            21.86,
            21.86
          ],
          "wind_direction_set_1": [
            170,
            170,
            180,
            170,
            170,
            170,
            160,
            170,
            180,
            170,
            170,
            160,
            160
          ],
          "altimeter_set_1": [
            29.99,
            29.99,
            29.98,
            29.98,
            29.97,
            29.98,
            29.98,
            29.98,
            29.98,
            29.97,
            29.96,
            29.95
          ],
          "wind_gust_set_1": [
            27.62,
            25.32,
            27.62,
            28.77,
            29.92,
            29.92,
            32.22,
            32.22,
            32.22,
            28.77,
            31.07,
            29.92,
            29.92
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
          "end": "2026-04-15T17:30:00Z"
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
            "10:40 AM",
            "10:50 AM",
            "11:00 AM",
            "11:10 AM",
            "11:20 AM",
            "11:30 AM",
            "11:40 AM",
            "11:50 AM",
            "12:00 PM",
            "12:10 PM",
            "12:20 PM",
            "12:30 PM",
            "12:30 PM"
          ],
          "air_temp_set_1": [
            57.77,
            57.35,
            57.35,
            58.29,
            57.52,
            57.72,
            59.27,
            58.87,
            59.73,
            59.94,
            59.51,
            61.13
          ],
          "wind_speed_set_1": [
            6.56,
            9.24,
            11.29,
            11.77,
            9.7,
            9.24,
            8.23,
            9.95,
            9.65,
            11.76,
            7.43,
            9.95,
            9.95
          ],
          "wind_direction_set_1": [
            172.8,
            219.1,
            175.1,
            204.4,
            229.9,
            226.4,
            228,
            188.7,
            187.5,
            188.9,
            200.1,
            223.7,
            223.7
          ],
          "wind_gust_set_1": [
            16.88,
            19.29,
            18.85,
            20.39,
            19.29,
            17.96,
            20.17,
            23.67,
            17.54,
            20.39,
            20.6,
            20.82,
            20.82
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
          "end": "2026-04-15T17:00:00Z"
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
            "7:00 AM",
            "8:00 AM",
            "9:00 AM",
            "10:00 AM",
            "11:00 AM",
            "12:00 PM",
            "12:00 PM"
          ],
          "air_temp_set_1": [
            21.8,
            22.8,
            23.3,
            24.6,
            26.9,
            27.3
          ],
          "wind_speed_set_1": [
            14.99,
            16,
            17.6,
            17.7,
            12.7,
            20.09,
            20.09
          ],
          "wind_direction_set_1": [
            247.3,
            244.8,
            232.5,
            234.9,
            236.1,
            235.1,
            235.1
          ],
          "wind_gust_set_1": [
            23.3,
            23.99,
            28.7,
            27.89,
            26.7,
            33.2,
            33.2
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
          "end": "2026-04-15T17:30:00Z"
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
            "9:45 AM",
            "10:00 AM",
            "10:15 AM",
            "10:30 AM",
            "10:45 AM",
            "11:00 AM",
            "11:15 AM",
            "11:30 AM",
            "11:45 AM",
            "12:00 PM",
            "12:15 PM",
            "12:30 PM",
            "12:30 PM"
          ],
          "air_temp_set_1": [
            27.9,
            27.9,
            28.15,
            28.58,
            28.94,
            29.68,
            29.56,
            30.59,
            31.39,
            31.88,
            32.73,
            32.24
          ],
          "wind_speed_set_1": [
            26.46,
            26.85,
            25.15,
            22.89,
            23.2,
            22.61,
            22.08,
            20.74,
            22.04,
            19.94,
            22.61,
            21.22,
            21.22
          ],
          "wind_direction_set_1": [
            229.2,
            229.9,
            235.5,
            240.8,
            232.5,
            238.9,
            238,
            245.2,
            244.4,
            257.4,
            263.2,
            259.5,
            259.5
          ],
          "wind_gust_set_1": [
            33.4,
            32.99,
            31.8,
            31.69,
            30.8,
            30,
            30.5,
            28.7,
            31.9,
            27.49,
            32.5,
            29.7,
            29.7
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
          "end": "2026-04-15T17:30:00Z"
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
            "9:45 AM",
            "10:00 AM",
            "10:15 AM",
            "10:30 AM",
            "10:45 AM",
            "11:00 AM",
            "11:15 AM",
            "11:30 AM",
            "11:45 AM",
            "12:00 PM",
            "12:15 PM",
            "12:30 PM",
            "12:30 PM"
          ],
          "air_temp_set_1": [
            24,
            25,
            25,
            25,
            26,
            27,
            26,
            26,
            26,
            26,
            27,
            26
          ],
          "wind_speed_set_1": [
            21,
            18,
            18,
            22,
            19,
            21,
            22.99,
            27,
            25,
            22.99,
            29,
            31.99,
            31.99
          ],
          "wind_direction_set_1": [
            270,
            270,
            247.5,
            247.5,
            247.5,
            247.5,
            247.5,
            270,
            247.5,
            247.5,
            247.5,
            247.5,
            247.5
          ],
          "wind_gust_set_1": [
            30,
            30,
            31,
            33.99,
            33.99,
            37,
            34.99,
            43.99,
            37,
            37,
            39,
            41.99,
            41.99
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
          "end": "2026-04-15T17:40:00Z"
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
            "11:45 AM",
            "11:50 AM",
            "11:55 AM",
            "12:00 PM",
            "12:05 PM",
            "12:10 PM",
            "12:15 PM",
            "12:20 PM",
            "12:25 PM",
            "12:30 PM",
            "12:35 PM",
            "12:40 PM",
            "12:40 PM"
          ],
          "air_temp_set_1": [
            55.86,
            55.05,
            54,
            55.13,
            55.57,
            56.29,
            57.12,
            56.4,
            54.94,
            56.21,
            55.92,
            56
          ],
          "wind_speed_set_1": [
            24.1,
            22,
            23.06,
            22.08,
            22.19,
            21.52,
            21.42,
            21.62,
            22.35,
            21.34,
            21.84,
            23.38,
            23.38
          ],
          "wind_direction_set_1": [
            167.72,
            156.5,
            163.4,
            155.68,
            154.66,
            155.83,
            161.29,
            157.98,
            149.17,
            153.47,
            154.72,
            150.61,
            150.61
          ],
          "wind_gust_set_1": [
            27.4,
            26.92,
            27.4,
            26.65,
            25.34,
            25.6,
            24.98,
            26.7,
            26.21,
            26.92,
            28.32,
            29.46,
            29.46
          ],
          "altimeter_set_1d": [
            30.07,
            30.07,
            30.07,
            30.07,
            30.07,
            30.07,
            30.07,
            30.07,
            30.06,
            30.06,
            30.05,
            30.05
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
          "end": "2026-04-15T17:00:00Z"
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
            "9:15 AM",
            "9:30 AM",
            "9:45 AM",
            "10:00 AM",
            "10:15 AM",
            "10:30 AM",
            "10:45 AM",
            "11:00 AM",
            "11:15 AM",
            "11:30 AM",
            "11:45 AM",
            "12:00 PM",
            "12:00 PM"
          ],
          "air_temp_set_1": [
            25.92,
            26.02,
            26.5,
            27.11,
            27.8,
            27.49,
            27.87,
            28.21,
            28.31,
            29.3,
            29.63,
            30.34
          ],
          "wind_speed_set_1": [
            7.61,
            9.13,
            8.38,
            6.92,
            6.51,
            10.29,
            9.01,
            13.01,
            9.69,
            6.94,
            11.56,
            6.54,
            6.54
          ],
          "wind_direction_set_1": [
            222.7,
            240.2,
            206.6,
            205.3,
            205.6,
            212,
            196.7,
            211.7,
            174.6,
            184.9,
            251.1,
            237.5,
            237.5
          ],
          "wind_gust_set_1": [
            15.43,
            13.26,
            15.8,
            13.34,
            14.24,
            20.79,
            23.18,
            19.9,
            20.18,
            19.15,
            14.98,
            14.98,
            14.98
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
          "end": "2026-04-15T17:30:00Z"
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
            "9:30 AM",
            "9:45 AM",
            "10:00 AM",
            "10:15 AM",
            "10:30 AM",
            "10:46 AM",
            "11:00 AM",
            "11:15 AM",
            "11:30 AM",
            "11:46 AM",
            "12:00 PM",
            "12:16 PM",
            "12:16 PM"
          ],
          "air_temp_set_1": [
            54,
            55,
            55,
            54,
            55,
            56,
            58,
            55,
            55,
            58,
            58,
            58
          ],
          "wind_speed_set_1": [
            5.99,
            7,
            11,
            12,
            7,
            5.99,
            8,
            9,
            5.99,
            5,
            7,
            9,
            9
          ],
          "wind_direction_set_1": [
            130,
            134,
            167,
            167,
            128,
            163,
            142,
            132,
            126,
            236,
            109,
            126,
            126
          ],
          "wind_gust_set_1": [
            13,
            14.01,
            17,
            25,
            20,
            17,
            14.99,
            26,
            17,
            12,
            19,
            17,
            17
          ],
          "altimeter_set_1": [
            29.74,
            29.74,
            29.74,
            29.74,
            29.74,
            29.73,
            29.73,
            29.73,
            29.73,
            29.73,
            29.73,
            29.72
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
          "end": "2026-04-15T17:10:00Z"
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
            "10:20 AM",
            "10:30 AM",
            "10:40 AM",
            "10:50 AM",
            "11:00 AM",
            "11:10 AM",
            "11:20 AM",
            "11:30 AM",
            "11:40 AM",
            "11:50 AM",
            "12:00 PM",
            "12:10 PM",
            "12:10 PM"
          ],
          "air_temp_set_1": [
            34.87,
            35.32,
            35.5,
            36.1,
            36.19,
            37.05,
            37.25,
            37.75,
            38.15,
            38.07,
            38.06,
            38.2
          ],
          "wind_speed_set_1": [
            16.84,
            16.1,
            15.44,
            14.47,
            13.75,
            13.31,
            15.35,
            17.12,
            17.61,
            18.41,
            20.91,
            19.79,
            19.79
          ],
          "wind_direction_set_1": [
            207.4,
            204.6,
            201.6,
            206.6,
            204.4,
            204.8,
            205.1,
            204.7,
            201.9,
            204.9,
            207.9,
            203.2,
            203.2
          ],
          "wind_gust_set_1": [
            21.98,
            23.35,
            22.11,
            21.24,
            20.86,
            20.99,
            22.11,
            26.2,
            28.44,
            26.95,
            32.04,
            28.81,
            28.81
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
          "end": "2026-04-15T17:20:00Z"
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
            "10:30 AM",
            "10:40 AM",
            "10:50 AM",
            "11:00 AM",
            "11:10 AM",
            "11:20 AM",
            "11:30 AM",
            "11:40 AM",
            "11:50 AM",
            "12:00 PM",
            "12:10 PM",
            "12:20 PM",
            "12:20 PM"
          ],
          "air_temp_set_1": [
            56.55,
            56.91,
            57.64,
            57.85,
            58.47,
            58.43,
            57.97,
            58.88,
            58.83,
            59.23,
            59.36,
            60.29
          ],
          "wind_speed_set_1": [
            9.82,
            10.45,
            10.93,
            11.54,
            10.76,
            15.04,
            14.63,
            16.18,
            14.51,
            17.27,
            20.17,
            15.59,
            15.59
          ],
          "wind_direction_set_1": [
            220.3,
            222.1,
            210.7,
            234.9,
            237.2,
            224.8,
            212.8,
            199.9,
            223.9,
            216.6,
            212.6,
            235.8,
            235.8
          ],
          "wind_gust_set_1": [
            18.85,
            18.85,
            19.51,
            21.04,
            19.94,
            21.26,
            21.47,
            25.65,
            25.43,
            28.06,
            28.06,
            24.11,
            24.11
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
      "METADATA_QUERY_TIME": "3.7 ms",
      "METADATA_PARSE_TIME": "0.3 ms",
      "TOTAL_METADATA_TIME": "4.0 ms",
      "DATA_QUERY_TIME": "5.6 ms",
      "QC_QUERY_TIME": "4.2 ms",
      "DATA_PARSE_TIME": "15.2 ms",
      "TOTAL_DATA_TIME": "24.9 ms",
      "TOTAL_TIME": "28.9 ms",
      "VERSION": "v2.32.4"
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
    "date": "2026-04-14",
    "observations": [
      {
        "Altitude_ft": 4229,
        "Temp_c": 10.9,
        "Dewpoint_c": 0.1,
        "Wind_Direction": 328,
        "Wind_Speed_kt": 8.9
      },
      {
        "Altitude_ft": 4252,
        "Temp_c": 10.6,
        "Dewpoint_c": -0.5,
        "Wind_Direction": 310,
        "Wind_Speed_kt": 13.4
      },
      {
        "Altitude_ft": 4275,
        "Temp_c": 10.2,
        "Dewpoint_c": -1.1,
        "Wind_Direction": 310,
        "Wind_Speed_kt": 13.4
      },
      {
        "Altitude_ft": 4298,
        "Temp_c": 9.9,
        "Dewpoint_c": -1.7,
        "Wind_Direction": 311,
        "Wind_Speed_kt": 13.4
      },
      {
        "Altitude_ft": 4321,
        "Temp_c": 9.5,
        "Dewpoint_c": -2.3,
        "Wind_Direction": 311,
        "Wind_Speed_kt": 13.4
      },
      {
        "Altitude_ft": 4344,
        "Temp_c": 9.2,
        "Dewpoint_c": -2.8,
        "Wind_Direction": 312,
        "Wind_Speed_kt": 13.4
      },
      {
        "Altitude_ft": 4367,
        "Temp_c": 8.8,
        "Dewpoint_c": -3.4,
        "Wind_Direction": 312,
        "Wind_Speed_kt": 13.4
      },
      {
        "Altitude_ft": 4393,
        "Temp_c": 8.6,
        "Dewpoint_c": -3.9,
        "Wind_Direction": 315,
        "Wind_Speed_kt": 13.4
      },
      {
        "Altitude_ft": 4413,
        "Temp_c": 8.5,
        "Dewpoint_c": -3.9,
        "Wind_Direction": 316,
        "Wind_Speed_kt": 13.4
      },
      {
        "Altitude_ft": 4436,
        "Temp_c": 8.5,
        "Dewpoint_c": -3.9,
        "Wind_Direction": 318,
        "Wind_Speed_kt": 13.6
      },
      {
        "Altitude_ft": 4462,
        "Temp_c": 8.4,
        "Dewpoint_c": -3.8,
        "Wind_Direction": 320,
        "Wind_Speed_kt": 13.8
      },
      {
        "Altitude_ft": 4485,
        "Temp_c": 8.4,
        "Dewpoint_c": -3.8,
        "Wind_Direction": 322,
        "Wind_Speed_kt": 14
      },
      {
        "Altitude_ft": 4508,
        "Temp_c": 8.3,
        "Dewpoint_c": -3.8,
        "Wind_Direction": 324,
        "Wind_Speed_kt": 14
      },
      {
        "Altitude_ft": 4534,
        "Temp_c": 8.2,
        "Dewpoint_c": -3.7,
        "Wind_Direction": 326,
        "Wind_Speed_kt": 14.2
      },
      {
        "Altitude_ft": 4557,
        "Temp_c": 8.2,
        "Dewpoint_c": -3.7,
        "Wind_Direction": 327,
        "Wind_Speed_kt": 14.2
      },
      {
        "Altitude_ft": 4583,
        "Temp_c": 8.1,
        "Dewpoint_c": -3.6,
        "Wind_Direction": 329,
        "Wind_Speed_kt": 14.4
      },
      {
        "Altitude_ft": 4600,
        "Temp_c": 8.1,
        "Dewpoint_c": -3.6,
        "Wind_Direction": 329,
        "Wind_Speed_kt": 14.4
      },
      {
        "Altitude_ft": 4636,
        "Temp_c": 8,
        "Dewpoint_c": -3.6,
        "Wind_Direction": 329,
        "Wind_Speed_kt": 14.4
      },
      {
        "Altitude_ft": 4665,
        "Temp_c": 7.9,
        "Dewpoint_c": -3.5,
        "Wind_Direction": 330,
        "Wind_Speed_kt": 14.6
      },
      {
        "Altitude_ft": 4695,
        "Temp_c": 7.9,
        "Dewpoint_c": -3.5,
        "Wind_Direction": 330,
        "Wind_Speed_kt": 14.6
      },
      {
        "Altitude_ft": 4721,
        "Temp_c": 7.8,
        "Dewpoint_c": -3.5,
        "Wind_Direction": 330,
        "Wind_Speed_kt": 14.6
      },
      {
        "Altitude_ft": 4751,
        "Temp_c": 7.7,
        "Dewpoint_c": -3.5,
        "Wind_Direction": 330,
        "Wind_Speed_kt": 14.6
      },
      {
        "Altitude_ft": 4777,
        "Temp_c": 7.7,
        "Dewpoint_c": -3.5,
        "Wind_Direction": 330,
        "Wind_Speed_kt": 14.6
      },
      {
        "Altitude_ft": 4800,
        "Temp_c": 7.6,
        "Dewpoint_c": -3.5,
        "Wind_Direction": 330,
        "Wind_Speed_kt": 14.6
      },
      {
        "Altitude_ft": 4823,
        "Temp_c": 7.5,
        "Dewpoint_c": -3.5,
        "Wind_Direction": 330,
        "Wind_Speed_kt": 14.6
      },
      {
        "Altitude_ft": 4846,
        "Temp_c": 7.4,
        "Dewpoint_c": -3.5,
        "Wind_Direction": 330,
        "Wind_Speed_kt": 14.6
      },
      {
        "Altitude_ft": 4869,
        "Temp_c": 7.4,
        "Dewpoint_c": -3.5,
        "Wind_Direction": 330,
        "Wind_Speed_kt": 14.6
      },
      {
        "Altitude_ft": 4882,
        "Temp_c": 7.3,
        "Dewpoint_c": -3.5,
        "Wind_Direction": 330,
        "Wind_Speed_kt": 14.6
      },
      {
        "Altitude_ft": 4921,
        "Temp_c": 7.2,
        "Dewpoint_c": -3.6,
        "Wind_Direction": 331,
        "Wind_Speed_kt": 14.8
      },
      {
        "Altitude_ft": 4938,
        "Temp_c": 7.1,
        "Dewpoint_c": -3.6,
        "Wind_Direction": 331,
        "Wind_Speed_kt": 14.8
      },
      {
        "Altitude_ft": 4961,
        "Temp_c": 7.1,
        "Dewpoint_c": -3.6,
        "Wind_Direction": 331,
        "Wind_Speed_kt": 14.8
      },
      {
        "Altitude_ft": 4984,
        "Temp_c": 7,
        "Dewpoint_c": -3.6,
        "Wind_Direction": 331,
        "Wind_Speed_kt": 14.8
      },
      {
        "Altitude_ft": 5007,
        "Temp_c": 6.9,
        "Dewpoint_c": -3.6,
        "Wind_Direction": 331,
        "Wind_Speed_kt": 14.8
      },
      {
        "Altitude_ft": 5030,
        "Temp_c": 6.8,
        "Dewpoint_c": -3.6,
        "Wind_Direction": 331,
        "Wind_Speed_kt": 14.8
      },
      {
        "Altitude_ft": 5049,
        "Temp_c": 6.8,
        "Dewpoint_c": -3.6,
        "Wind_Direction": 331,
        "Wind_Speed_kt": 14.8
      },
      {
        "Altitude_ft": 5072,
        "Temp_c": 6.7,
        "Dewpoint_c": -3.6,
        "Wind_Direction": 331,
        "Wind_Speed_kt": 14.8
      },
      {
        "Altitude_ft": 5092,
        "Temp_c": 6.6,
        "Dewpoint_c": -3.6,
        "Wind_Direction": 331,
        "Wind_Speed_kt": 14.8
      },
      {
        "Altitude_ft": 5112,
        "Temp_c": 6.6,
        "Dewpoint_c": -3.6,
        "Wind_Direction": 331,
        "Wind_Speed_kt": 14.8
      },
      {
        "Altitude_ft": 5135,
        "Temp_c": 6.5,
        "Dewpoint_c": -3.7,
        "Wind_Direction": 331,
        "Wind_Speed_kt": 14.8
      },
      {
        "Altitude_ft": 5154,
        "Temp_c": 6.5,
        "Dewpoint_c": -3.7,
        "Wind_Direction": 331,
        "Wind_Speed_kt": 14.8
      },
      {
        "Altitude_ft": 5174,
        "Temp_c": 6.4,
        "Dewpoint_c": -3.7,
        "Wind_Direction": 331,
        "Wind_Speed_kt": 14.8
      },
      {
        "Altitude_ft": 5197,
        "Temp_c": 6.3,
        "Dewpoint_c": -3.7,
        "Wind_Direction": 331,
        "Wind_Speed_kt": 14.8
      },
      {
        "Altitude_ft": 5217,
        "Temp_c": 6.3,
        "Dewpoint_c": -3.7,
        "Wind_Direction": 331,
        "Wind_Speed_kt": 14.8
      },
      {
        "Altitude_ft": 5240,
        "Temp_c": 6.2,
        "Dewpoint_c": -3.7,
        "Wind_Direction": 331,
        "Wind_Speed_kt": 14.8
      },
      {
        "Altitude_ft": 5259,
        "Temp_c": 6.1,
        "Dewpoint_c": -3.7,
        "Wind_Direction": 331,
        "Wind_Speed_kt": 14.8
      },
      {
        "Altitude_ft": 5279,
        "Temp_c": 6.1,
        "Dewpoint_c": -3.7,
        "Wind_Direction": 331,
        "Wind_Speed_kt": 14.8
      },
      {
        "Altitude_ft": 5299,
        "Temp_c": 6,
        "Dewpoint_c": -3.7,
        "Wind_Direction": 330,
        "Wind_Speed_kt": 14.6
      },
      {
        "Altitude_ft": 5318,
        "Temp_c": 5.9,
        "Dewpoint_c": -3.8,
        "Wind_Direction": 329,
        "Wind_Speed_kt": 14.6
      },
      {
        "Altitude_ft": 5338,
        "Temp_c": 5.9,
        "Dewpoint_c": -3.8,
        "Wind_Direction": 328,
        "Wind_Speed_kt": 14.6
      },
      {
        "Altitude_ft": 5361,
        "Temp_c": 5.8,
        "Dewpoint_c": -3.8,
        "Wind_Direction": 328,
        "Wind_Speed_kt": 14.6
      },
      {
        "Altitude_ft": 5381,
        "Temp_c": 5.7,
        "Dewpoint_c": -3.9,
        "Wind_Direction": 327,
        "Wind_Speed_kt": 14.4
      },
      {
        "Altitude_ft": 5400,
        "Temp_c": 5.6,
        "Dewpoint_c": -3.9,
        "Wind_Direction": 326,
        "Wind_Speed_kt": 14.4
      },
      {
        "Altitude_ft": 5420,
        "Temp_c": 5.5,
        "Dewpoint_c": -4,
        "Wind_Direction": 326,
        "Wind_Speed_kt": 14.4
      },
      {
        "Altitude_ft": 5443,
        "Temp_c": 5.4,
        "Dewpoint_c": -4,
        "Wind_Direction": 325,
        "Wind_Speed_kt": 14.4
      },
      {
        "Altitude_ft": 5463,
        "Temp_c": 5.3,
        "Dewpoint_c": -4,
        "Wind_Direction": 324,
        "Wind_Speed_kt": 14.4
      },
      {
        "Altitude_ft": 5482,
        "Temp_c": 5.2,
        "Dewpoint_c": -4.1,
        "Wind_Direction": 323,
        "Wind_Speed_kt": 14.4
      },
      {
        "Altitude_ft": 5502,
        "Temp_c": 5.1,
        "Dewpoint_c": -4.1,
        "Wind_Direction": 322,
        "Wind_Speed_kt": 14.2
      },
      {
        "Altitude_ft": 5522,
        "Temp_c": 5,
        "Dewpoint_c": -4.2,
        "Wind_Direction": 322,
        "Wind_Speed_kt": 14.2
      },
      {
        "Altitude_ft": 5538,
        "Temp_c": 4.9,
        "Dewpoint_c": -4.2,
        "Wind_Direction": 321,
        "Wind_Speed_kt": 14.2
      },
      {
        "Altitude_ft": 5558,
        "Temp_c": 4.8,
        "Dewpoint_c": -4.2,
        "Wind_Direction": 320,
        "Wind_Speed_kt": 14.2
      },
      {
        "Altitude_ft": 5574,
        "Temp_c": 4.8,
        "Dewpoint_c": -4.3,
        "Wind_Direction": 319,
        "Wind_Speed_kt": 14.2
      },
      {
        "Altitude_ft": 5594,
        "Temp_c": 4.7,
        "Dewpoint_c": -4.3,
        "Wind_Direction": 319,
        "Wind_Speed_kt": 14.2
      },
      {
        "Altitude_ft": 5614,
        "Temp_c": 4.6,
        "Dewpoint_c": -4.3,
        "Wind_Direction": 318,
        "Wind_Speed_kt": 14.2
      },
      {
        "Altitude_ft": 5633,
        "Temp_c": 4.6,
        "Dewpoint_c": -4.2,
        "Wind_Direction": 317,
        "Wind_Speed_kt": 14.2
      },
      {
        "Altitude_ft": 5653,
        "Temp_c": 4.5,
        "Dewpoint_c": -4.2,
        "Wind_Direction": 316,
        "Wind_Speed_kt": 14.2
      },
      {
        "Altitude_ft": 5673,
        "Temp_c": 4.5,
        "Dewpoint_c": -4.2,
        "Wind_Direction": 316,
        "Wind_Speed_kt": 14.2
      },
      {
        "Altitude_ft": 5692,
        "Temp_c": 4.4,
        "Dewpoint_c": -4.2,
        "Wind_Direction": 315,
        "Wind_Speed_kt": 14
      },
      {
        "Altitude_ft": 5712,
        "Temp_c": 4.4,
        "Dewpoint_c": -4.2,
        "Wind_Direction": 315,
        "Wind_Speed_kt": 14
      },
      {
        "Altitude_ft": 5732,
        "Temp_c": 4.3,
        "Dewpoint_c": -4.2,
        "Wind_Direction": 315,
        "Wind_Speed_kt": 13.8
      },
      {
        "Altitude_ft": 5751,
        "Temp_c": 4.3,
        "Dewpoint_c": -4.2,
        "Wind_Direction": 314,
        "Wind_Speed_kt": 13.8
      },
      {
        "Altitude_ft": 5774,
        "Temp_c": 4.2,
        "Dewpoint_c": -4.2,
        "Wind_Direction": 314,
        "Wind_Speed_kt": 13.8
      },
      {
        "Altitude_ft": 5801,
        "Temp_c": 4.2,
        "Dewpoint_c": -4.2,
        "Wind_Direction": 314,
        "Wind_Speed_kt": 13.6
      },
      {
        "Altitude_ft": 5823,
        "Temp_c": 4.1,
        "Dewpoint_c": -4.1,
        "Wind_Direction": 314,
        "Wind_Speed_kt": 13.6
      },
      {
        "Altitude_ft": 5846,
        "Temp_c": 4.1,
        "Dewpoint_c": -4.1,
        "Wind_Direction": 313,
        "Wind_Speed_kt": 13.4
      },
      {
        "Altitude_ft": 5869,
        "Temp_c": 4,
        "Dewpoint_c": -4.2,
        "Wind_Direction": 313,
        "Wind_Speed_kt": 13.4
      },
      {
        "Altitude_ft": 5906,
        "Temp_c": 3.9,
        "Dewpoint_c": -4.2,
        "Wind_Direction": 312,
        "Wind_Speed_kt": 13.2
      },
      {
        "Altitude_ft": 5919,
        "Temp_c": 3.9,
        "Dewpoint_c": -4.2,
        "Wind_Direction": 312,
        "Wind_Speed_kt": 13.2
      },
      {
        "Altitude_ft": 5945,
        "Temp_c": 3.8,
        "Dewpoint_c": -4.2,
        "Wind_Direction": 312,
        "Wind_Speed_kt": 13.2
      },
      {
        "Altitude_ft": 5968,
        "Temp_c": 3.7,
        "Dewpoint_c": -4.3,
        "Wind_Direction": 312,
        "Wind_Speed_kt": 13
      },
      {
        "Altitude_ft": 5991,
        "Temp_c": 3.6,
        "Dewpoint_c": -4.3,
        "Wind_Direction": 311,
        "Wind_Speed_kt": 13
      },
      {
        "Altitude_ft": 6017,
        "Temp_c": 3.6,
        "Dewpoint_c": -4.3,
        "Wind_Direction": 311,
        "Wind_Speed_kt": 12.8
      },
      {
        "Altitude_ft": 6040,
        "Temp_c": 3.5,
        "Dewpoint_c": -4.4,
        "Wind_Direction": 311,
        "Wind_Speed_kt": 12.8
      },
      {
        "Altitude_ft": 6066,
        "Temp_c": 3.4,
        "Dewpoint_c": -4.4,
        "Wind_Direction": 310,
        "Wind_Speed_kt": 12.8
      },
      {
        "Altitude_ft": 6093,
        "Temp_c": 3.4,
        "Dewpoint_c": -4.4,
        "Wind_Direction": 310,
        "Wind_Speed_kt": 12.6
      },
      {
        "Altitude_ft": 6119,
        "Temp_c": 3.3,
        "Dewpoint_c": -4.4,
        "Wind_Direction": 310,
        "Wind_Speed_kt": 12.6
      },
      {
        "Altitude_ft": 6145,
        "Temp_c": 3.2,
        "Dewpoint_c": -4.5,
        "Wind_Direction": 309,
        "Wind_Speed_kt": 12.4
      },
      {
        "Altitude_ft": 6175,
        "Temp_c": 3.1,
        "Dewpoint_c": -4.5,
        "Wind_Direction": 310,
        "Wind_Speed_kt": 12.4
      },
      {
        "Altitude_ft": 6201,
        "Temp_c": 3.1,
        "Dewpoint_c": -4.5,
        "Wind_Direction": 311,
        "Wind_Speed_kt": 12.2
      },
      {
        "Altitude_ft": 6227,
        "Temp_c": 3,
        "Dewpoint_c": -4.5,
        "Wind_Direction": 312,
        "Wind_Speed_kt": 12.2
      },
      {
        "Altitude_ft": 6257,
        "Temp_c": 2.9,
        "Dewpoint_c": -4.6,
        "Wind_Direction": 314,
        "Wind_Speed_kt": 12.2
      },
      {
        "Altitude_ft": 6283,
        "Temp_c": 2.8,
        "Dewpoint_c": -4.6,
        "Wind_Direction": 315,
        "Wind_Speed_kt": 12.1
      },
      {
        "Altitude_ft": 6312,
        "Temp_c": 2.7,
        "Dewpoint_c": -4.6,
        "Wind_Direction": 316,
        "Wind_Speed_kt": 12.1
      },
      {
        "Altitude_ft": 6342,
        "Temp_c": 2.6,
        "Dewpoint_c": -4.7,
        "Wind_Direction": 317,
        "Wind_Speed_kt": 12.1
      },
      {
        "Altitude_ft": 6368,
        "Temp_c": 2.6,
        "Dewpoint_c": -4.7,
        "Wind_Direction": 318,
        "Wind_Speed_kt": 11.9
      },
      {
        "Altitude_ft": 6394,
        "Temp_c": 2.5,
        "Dewpoint_c": -4.8,
        "Wind_Direction": 319,
        "Wind_Speed_kt": 11.9
      },
      {
        "Altitude_ft": 6421,
        "Temp_c": 2.4,
        "Dewpoint_c": -4.8,
        "Wind_Direction": 321,
        "Wind_Speed_kt": 11.9
      },
      {
        "Altitude_ft": 6447,
        "Temp_c": 2.3,
        "Dewpoint_c": -4.8,
        "Wind_Direction": 322,
        "Wind_Speed_kt": 11.7
      },
      {
        "Altitude_ft": 6473,
        "Temp_c": 2.2,
        "Dewpoint_c": -4.8,
        "Wind_Direction": 323,
        "Wind_Speed_kt": 11.7
      },
      {
        "Altitude_ft": 6496,
        "Temp_c": 2.1,
        "Dewpoint_c": -4.9,
        "Wind_Direction": 324,
        "Wind_Speed_kt": 11.5
      },
      {
        "Altitude_ft": 6522,
        "Temp_c": 2,
        "Dewpoint_c": -4.9,
        "Wind_Direction": 326,
        "Wind_Speed_kt": 11.5
      },
      {
        "Altitude_ft": 6549,
        "Temp_c": 2,
        "Dewpoint_c": -4.9,
        "Wind_Direction": 327,
        "Wind_Speed_kt": 11.5
      },
      {
        "Altitude_ft": 6578,
        "Temp_c": 1.9,
        "Dewpoint_c": -4.9,
        "Wind_Direction": 328,
        "Wind_Speed_kt": 11.3
      },
      {
        "Altitude_ft": 6604,
        "Temp_c": 1.8,
        "Dewpoint_c": -5,
        "Wind_Direction": 330,
        "Wind_Speed_kt": 11.3
      },
      {
        "Altitude_ft": 6631,
        "Temp_c": 1.7,
        "Dewpoint_c": -5,
        "Wind_Direction": 331,
        "Wind_Speed_kt": 11.1
      },
      {
        "Altitude_ft": 6657,
        "Temp_c": 1.6,
        "Dewpoint_c": -5,
        "Wind_Direction": 332,
        "Wind_Speed_kt": 11.1
      },
      {
        "Altitude_ft": 6686,
        "Temp_c": 1.5,
        "Dewpoint_c": -5,
        "Wind_Direction": 334,
        "Wind_Speed_kt": 11.1
      },
      {
        "Altitude_ft": 6716,
        "Temp_c": 1.5,
        "Dewpoint_c": -5,
        "Wind_Direction": 333,
        "Wind_Speed_kt": 10.9
      },
      {
        "Altitude_ft": 6749,
        "Temp_c": 1.4,
        "Dewpoint_c": -5.1,
        "Wind_Direction": 333,
        "Wind_Speed_kt": 10.9
      },
      {
        "Altitude_ft": 6778,
        "Temp_c": 1.3,
        "Dewpoint_c": -5.1,
        "Wind_Direction": 332,
        "Wind_Speed_kt": 10.7
      },
      {
        "Altitude_ft": 6808,
        "Temp_c": 1.2,
        "Dewpoint_c": -5.1,
        "Wind_Direction": 332,
        "Wind_Speed_kt": 10.7
      },
      {
        "Altitude_ft": 6837,
        "Temp_c": 1.1,
        "Dewpoint_c": -5.1,
        "Wind_Direction": 331,
        "Wind_Speed_kt": 10.5
      },
      {
        "Altitude_ft": 6870,
        "Temp_c": 1,
        "Dewpoint_c": -5.1,
        "Wind_Direction": 330,
        "Wind_Speed_kt": 10.5
      },
      {
        "Altitude_ft": 6890,
        "Temp_c": 1,
        "Dewpoint_c": -5.2,
        "Wind_Direction": 330,
        "Wind_Speed_kt": 10.3
      },
      {
        "Altitude_ft": 6926,
        "Temp_c": 0.9,
        "Dewpoint_c": -5.2,
        "Wind_Direction": 329,
        "Wind_Speed_kt": 10.3
      },
      {
        "Altitude_ft": 6955,
        "Temp_c": 0.8,
        "Dewpoint_c": -5.2,
        "Wind_Direction": 329,
        "Wind_Speed_kt": 10.1
      },
      {
        "Altitude_ft": 6982,
        "Temp_c": 0.7,
        "Dewpoint_c": -5.2,
        "Wind_Direction": 328,
        "Wind_Speed_kt": 10.1
      },
      {
        "Altitude_ft": 7011,
        "Temp_c": 0.6,
        "Dewpoint_c": -5.2,
        "Wind_Direction": 327,
        "Wind_Speed_kt": 9.9
      },
      {
        "Altitude_ft": 7037,
        "Temp_c": 0.5,
        "Dewpoint_c": -5.3,
        "Wind_Direction": 327,
        "Wind_Speed_kt": 9.9
      },
      {
        "Altitude_ft": 7070,
        "Temp_c": 0.4,
        "Dewpoint_c": -5.3,
        "Wind_Direction": 326,
        "Wind_Speed_kt": 9.9
      },
      {
        "Altitude_ft": 7100,
        "Temp_c": 0.3,
        "Dewpoint_c": -5.3,
        "Wind_Direction": 325,
        "Wind_Speed_kt": 9.7
      },
      {
        "Altitude_ft": 7133,
        "Temp_c": 0.2,
        "Dewpoint_c": -5.3,
        "Wind_Direction": 325,
        "Wind_Speed_kt": 9.7
      },
      {
        "Altitude_ft": 7165,
        "Temp_c": 0.2,
        "Dewpoint_c": -5.3,
        "Wind_Direction": 324,
        "Wind_Speed_kt": 9.5
      },
      {
        "Altitude_ft": 7195,
        "Temp_c": 0.1,
        "Dewpoint_c": -5.4,
        "Wind_Direction": 323,
        "Wind_Speed_kt": 9.5
      },
      {
        "Altitude_ft": 7228,
        "Temp_c": 0,
        "Dewpoint_c": -5.4,
        "Wind_Direction": 323,
        "Wind_Speed_kt": 9.3
      },
      {
        "Altitude_ft": 7257,
        "Temp_c": -0.1,
        "Dewpoint_c": -5.4,
        "Wind_Direction": 322,
        "Wind_Speed_kt": 9.3
      },
      {
        "Altitude_ft": 7290,
        "Temp_c": -0.2,
        "Dewpoint_c": -5.4,
        "Wind_Direction": 321,
        "Wind_Speed_kt": 9.3
      },
      {
        "Altitude_ft": 7320,
        "Temp_c": -0.3,
        "Dewpoint_c": -5.4,
        "Wind_Direction": 321,
        "Wind_Speed_kt": 9.1
      },
      {
        "Altitude_ft": 7352,
        "Temp_c": -0.4,
        "Dewpoint_c": -5.5,
        "Wind_Direction": 321,
        "Wind_Speed_kt": 8.9
      },
      {
        "Altitude_ft": 7382,
        "Temp_c": -0.5,
        "Dewpoint_c": -5.5,
        "Wind_Direction": 322,
        "Wind_Speed_kt": 8.7
      },
      {
        "Altitude_ft": 7415,
        "Temp_c": -0.6,
        "Dewpoint_c": -5.5,
        "Wind_Direction": 322,
        "Wind_Speed_kt": 8.7
      },
      {
        "Altitude_ft": 7444,
        "Temp_c": -0.7,
        "Dewpoint_c": -5.6,
        "Wind_Direction": 322,
        "Wind_Speed_kt": 8.6
      },
      {
        "Altitude_ft": 7474,
        "Temp_c": -0.8,
        "Dewpoint_c": -5.6,
        "Wind_Direction": 322,
        "Wind_Speed_kt": 8.4
      },
      {
        "Altitude_ft": 7503,
        "Temp_c": -0.9,
        "Dewpoint_c": -5.6,
        "Wind_Direction": 322,
        "Wind_Speed_kt": 8.4
      },
      {
        "Altitude_ft": 7533,
        "Temp_c": -1,
        "Dewpoint_c": -5.6,
        "Wind_Direction": 322,
        "Wind_Speed_kt": 8.2
      },
      {
        "Altitude_ft": 7562,
        "Temp_c": -1.1,
        "Dewpoint_c": -5.7,
        "Wind_Direction": 323,
        "Wind_Speed_kt": 8
      },
      {
        "Altitude_ft": 7592,
        "Temp_c": -1.2,
        "Dewpoint_c": -5.7,
        "Wind_Direction": 323,
        "Wind_Speed_kt": 7.8
      },
      {
        "Altitude_ft": 7625,
        "Temp_c": -1.3,
        "Dewpoint_c": -5.7,
        "Wind_Direction": 323,
        "Wind_Speed_kt": 7.8
      },
      {
        "Altitude_ft": 7654,
        "Temp_c": -1.4,
        "Dewpoint_c": -5.8,
        "Wind_Direction": 323,
        "Wind_Speed_kt": 7.6
      },
      {
        "Altitude_ft": 7684,
        "Temp_c": -1.5,
        "Dewpoint_c": -5.8,
        "Wind_Direction": 323,
        "Wind_Speed_kt": 7.4
      },
      {
        "Altitude_ft": 7717,
        "Temp_c": -1.6,
        "Dewpoint_c": -5.8,
        "Wind_Direction": 324,
        "Wind_Speed_kt": 7.4
      },
      {
        "Altitude_ft": 7746,
        "Temp_c": -1.6,
        "Dewpoint_c": -5.9,
        "Wind_Direction": 324,
        "Wind_Speed_kt": 7.2
      },
      {
        "Altitude_ft": 7779,
        "Temp_c": -1.8,
        "Dewpoint_c": -5.9,
        "Wind_Direction": 324,
        "Wind_Speed_kt": 7
      },
      {
        "Altitude_ft": 7812,
        "Temp_c": -1.8,
        "Dewpoint_c": -5.9,
        "Wind_Direction": 324,
        "Wind_Speed_kt": 6.8
      },
      {
        "Altitude_ft": 7844,
        "Temp_c": -1.9,
        "Dewpoint_c": -6,
        "Wind_Direction": 325,
        "Wind_Speed_kt": 6.8
      },
      {
        "Altitude_ft": 7881,
        "Temp_c": -2,
        "Dewpoint_c": -6,
        "Wind_Direction": 325,
        "Wind_Speed_kt": 6.6
      },
      {
        "Altitude_ft": 7913,
        "Temp_c": -2.1,
        "Dewpoint_c": -6,
        "Wind_Direction": 325,
        "Wind_Speed_kt": 6.4
      },
      {
        "Altitude_ft": 7946,
        "Temp_c": -2.2,
        "Dewpoint_c": -6,
        "Wind_Direction": 326,
        "Wind_Speed_kt": 6.6
      },
      {
        "Altitude_ft": 7979,
        "Temp_c": -2.3,
        "Dewpoint_c": -6.1,
        "Wind_Direction": 326,
        "Wind_Speed_kt": 6.8
      },
      {
        "Altitude_ft": 8009,
        "Temp_c": -2.4,
        "Dewpoint_c": -6.1,
        "Wind_Direction": 327,
        "Wind_Speed_kt": 7
      },
      {
        "Altitude_ft": 8038,
        "Temp_c": -2.5,
        "Dewpoint_c": -6.1,
        "Wind_Direction": 327,
        "Wind_Speed_kt": 7.2
      },
      {
        "Altitude_ft": 8068,
        "Temp_c": -2.6,
        "Dewpoint_c": -6.2,
        "Wind_Direction": 327,
        "Wind_Speed_kt": 7.4
      },
      {
        "Altitude_ft": 8100,
        "Temp_c": -2.6,
        "Dewpoint_c": -6.2,
        "Wind_Direction": 328,
        "Wind_Speed_kt": 7.4
      },
      {
        "Altitude_ft": 8130,
        "Temp_c": -2.7,
        "Dewpoint_c": -6.2,
        "Wind_Direction": 328,
        "Wind_Speed_kt": 7.6
      },
      {
        "Altitude_ft": 8159,
        "Temp_c": -2.8,
        "Dewpoint_c": -6.3,
        "Wind_Direction": 329,
        "Wind_Speed_kt": 7.8
      },
      {
        "Altitude_ft": 8189,
        "Temp_c": -2.9,
        "Dewpoint_c": -6.3,
        "Wind_Direction": 329,
        "Wind_Speed_kt": 8
      },
      {
        "Altitude_ft": 8219,
        "Temp_c": -3,
        "Dewpoint_c": -6.3,
        "Wind_Direction": 329,
        "Wind_Speed_kt": 8.2
      },
      {
        "Altitude_ft": 8251,
        "Temp_c": -3.1,
        "Dewpoint_c": -6.4,
        "Wind_Direction": 330,
        "Wind_Speed_kt": 8.4
      },
      {
        "Altitude_ft": 8278,
        "Temp_c": -3.2,
        "Dewpoint_c": -6.4,
        "Wind_Direction": 330,
        "Wind_Speed_kt": 8.6
      },
      {
        "Altitude_ft": 8307,
        "Temp_c": -3.2,
        "Dewpoint_c": -6.4,
        "Wind_Direction": 330,
        "Wind_Speed_kt": 8.6
      },
      {
        "Altitude_ft": 8333,
        "Temp_c": -3.3,
        "Dewpoint_c": -6.5,
        "Wind_Direction": 331,
        "Wind_Speed_kt": 8.7
      },
      {
        "Altitude_ft": 8360,
        "Temp_c": -3.4,
        "Dewpoint_c": -6.5,
        "Wind_Direction": 331,
        "Wind_Speed_kt": 8.9
      },
      {
        "Altitude_ft": 8389,
        "Temp_c": -3.5,
        "Dewpoint_c": -6.6,
        "Wind_Direction": 331,
        "Wind_Speed_kt": 9.1
      },
      {
        "Altitude_ft": 8415,
        "Temp_c": -3.6,
        "Dewpoint_c": -6.6,
        "Wind_Direction": 331,
        "Wind_Speed_kt": 9.3
      },
      {
        "Altitude_ft": 8445,
        "Temp_c": -3.7,
        "Dewpoint_c": -6.6,
        "Wind_Direction": 332,
        "Wind_Speed_kt": 9.5
      },
      {
        "Altitude_ft": 8468,
        "Temp_c": -3.8,
        "Dewpoint_c": -6.7,
        "Wind_Direction": 332,
        "Wind_Speed_kt": 9.7
      },
      {
        "Altitude_ft": 8491,
        "Temp_c": -3.8,
        "Dewpoint_c": -6.7,
        "Wind_Direction": 332,
        "Wind_Speed_kt": 9.9
      },
      {
        "Altitude_ft": 8514,
        "Temp_c": -3.9,
        "Dewpoint_c": -6.8,
        "Wind_Direction": 333,
        "Wind_Speed_kt": 9.9
      },
      {
        "Altitude_ft": 8540,
        "Temp_c": -4,
        "Dewpoint_c": -6.8,
        "Wind_Direction": 333,
        "Wind_Speed_kt": 10.1
      },
      {
        "Altitude_ft": 8563,
        "Temp_c": -4.1,
        "Dewpoint_c": -6.8,
        "Wind_Direction": 334,
        "Wind_Speed_kt": 10.3
      },
      {
        "Altitude_ft": 8586,
        "Temp_c": -4.1,
        "Dewpoint_c": -6.9,
        "Wind_Direction": 335,
        "Wind_Speed_kt": 10.5
      },
      {
        "Altitude_ft": 8612,
        "Temp_c": -4.2,
        "Dewpoint_c": -6.9,
        "Wind_Direction": 335,
        "Wind_Speed_kt": 10.5
      },
      {
        "Altitude_ft": 8635,
        "Temp_c": -4.3,
        "Dewpoint_c": -6.9,
        "Wind_Direction": 336,
        "Wind_Speed_kt": 10.7
      },
      {
        "Altitude_ft": 8661,
        "Temp_c": -4.3,
        "Dewpoint_c": -6.9,
        "Wind_Direction": 336,
        "Wind_Speed_kt": 10.9
      },
      {
        "Altitude_ft": 8684,
        "Temp_c": -4.4,
        "Dewpoint_c": -6.9,
        "Wind_Direction": 337,
        "Wind_Speed_kt": 11.1
      },
      {
        "Altitude_ft": 8711,
        "Temp_c": -4.5,
        "Dewpoint_c": -6.9,
        "Wind_Direction": 337,
        "Wind_Speed_kt": 11.1
      },
      {
        "Altitude_ft": 8730,
        "Temp_c": -4.5,
        "Dewpoint_c": -7,
        "Wind_Direction": 338,
        "Wind_Speed_kt": 11.3
      },
      {
        "Altitude_ft": 8750,
        "Temp_c": -4.6,
        "Dewpoint_c": -7,
        "Wind_Direction": 338,
        "Wind_Speed_kt": 11.5
      },
      {
        "Altitude_ft": 8770,
        "Temp_c": -4.6,
        "Dewpoint_c": -7,
        "Wind_Direction": 339,
        "Wind_Speed_kt": 11.7
      },
      {
        "Altitude_ft": 8793,
        "Temp_c": -4.7,
        "Dewpoint_c": -7,
        "Wind_Direction": 339,
        "Wind_Speed_kt": 11.9
      },
      {
        "Altitude_ft": 8812,
        "Temp_c": -4.8,
        "Dewpoint_c": -7,
        "Wind_Direction": 340,
        "Wind_Speed_kt": 11.9
      },
      {
        "Altitude_ft": 8832,
        "Temp_c": -4.8,
        "Dewpoint_c": -7.1,
        "Wind_Direction": 340,
        "Wind_Speed_kt": 12.1
      },
      {
        "Altitude_ft": 8852,
        "Temp_c": -4.9,
        "Dewpoint_c": -7.1,
        "Wind_Direction": 341,
        "Wind_Speed_kt": 12.2
      },
      {
        "Altitude_ft": 8868,
        "Temp_c": -5,
        "Dewpoint_c": -7.1,
        "Wind_Direction": 341,
        "Wind_Speed_kt": 12.4
      },
      {
        "Altitude_ft": 8888,
        "Temp_c": -5,
        "Dewpoint_c": -7.2,
        "Wind_Direction": 342,
        "Wind_Speed_kt": 12.6
      },
      {
        "Altitude_ft": 8907,
        "Temp_c": -5.1,
        "Dewpoint_c": -7.2,
        "Wind_Direction": 342,
        "Wind_Speed_kt": 12.8
      },
      {
        "Altitude_ft": 8924,
        "Temp_c": -5.1,
        "Dewpoint_c": -7.2,
        "Wind_Direction": 342,
        "Wind_Speed_kt": 12.8
      },
      {
        "Altitude_ft": 8944,
        "Temp_c": -5.1,
        "Dewpoint_c": -7.3,
        "Wind_Direction": 342,
        "Wind_Speed_kt": 13
      },
      {
        "Altitude_ft": 8963,
        "Temp_c": -5.2,
        "Dewpoint_c": -7.3,
        "Wind_Direction": 342,
        "Wind_Speed_kt": 13
      },
      {
        "Altitude_ft": 8980,
        "Temp_c": -5.2,
        "Dewpoint_c": -7.3,
        "Wind_Direction": 341,
        "Wind_Speed_kt": 13
      },
      {
        "Altitude_ft": 8999,
        "Temp_c": -5.3,
        "Dewpoint_c": -7.3,
        "Wind_Direction": 341,
        "Wind_Speed_kt": 13
      },
      {
        "Altitude_ft": 9019,
        "Temp_c": -5.3,
        "Dewpoint_c": -7.4,
        "Wind_Direction": 340,
        "Wind_Speed_kt": 13.2
      },
      {
        "Altitude_ft": 9035,
        "Temp_c": -5.4,
        "Dewpoint_c": -7.4,
        "Wind_Direction": 340,
        "Wind_Speed_kt": 13.2
      },
      {
        "Altitude_ft": 9052,
        "Temp_c": -5.4,
        "Dewpoint_c": -7.4,
        "Wind_Direction": 340,
        "Wind_Speed_kt": 13.2
      },
      {
        "Altitude_ft": 9072,
        "Temp_c": -5.5,
        "Dewpoint_c": -7.5,
        "Wind_Direction": 339,
        "Wind_Speed_kt": 13.4
      },
      {
        "Altitude_ft": 9081,
        "Temp_c": -5.5,
        "Dewpoint_c": -7.5,
        "Wind_Direction": 339,
        "Wind_Speed_kt": 13.4
      },
      {
        "Altitude_ft": 9104,
        "Temp_c": -5.6,
        "Dewpoint_c": -7.7,
        "Wind_Direction": 338,
        "Wind_Speed_kt": 13.4
      },
      {
        "Altitude_ft": 9124,
        "Temp_c": -5.6,
        "Dewpoint_c": -7.8,
        "Wind_Direction": 338,
        "Wind_Speed_kt": 13.4
      },
      {
        "Altitude_ft": 9144,
        "Temp_c": -5.7,
        "Dewpoint_c": -7.9,
        "Wind_Direction": 338,
        "Wind_Speed_kt": 13.6
      },
      {
        "Altitude_ft": 9163,
        "Temp_c": -5.7,
        "Dewpoint_c": -8,
        "Wind_Direction": 337,
        "Wind_Speed_kt": 13.6
      },
      {
        "Altitude_ft": 9183,
        "Temp_c": -5.8,
        "Dewpoint_c": -8.2,
        "Wind_Direction": 337,
        "Wind_Speed_kt": 13.6
      },
      {
        "Altitude_ft": 9203,
        "Temp_c": -5.8,
        "Dewpoint_c": -8.3,
        "Wind_Direction": 337,
        "Wind_Speed_kt": 13.8
      },
      {
        "Altitude_ft": 9219,
        "Temp_c": -5.9,
        "Dewpoint_c": -8.4,
        "Wind_Direction": 336,
        "Wind_Speed_kt": 13.8
      },
      {
        "Altitude_ft": 9239,
        "Temp_c": -5.9,
        "Dewpoint_c": -8.5,
        "Wind_Direction": 336,
        "Wind_Speed_kt": 13.8
      },
      {
        "Altitude_ft": 9259,
        "Temp_c": -6,
        "Dewpoint_c": -8.7,
        "Wind_Direction": 335,
        "Wind_Speed_kt": 14
      },
      {
        "Altitude_ft": 9278,
        "Temp_c": -6,
        "Dewpoint_c": -8.8,
        "Wind_Direction": 335,
        "Wind_Speed_kt": 14
      },
      {
        "Altitude_ft": 9298,
        "Temp_c": -6.1,
        "Dewpoint_c": -8.9,
        "Wind_Direction": 335,
        "Wind_Speed_kt": 14
      },
      {
        "Altitude_ft": 9318,
        "Temp_c": -6.1,
        "Dewpoint_c": -9,
        "Wind_Direction": 335,
        "Wind_Speed_kt": 14.2
      },
      {
        "Altitude_ft": 9337,
        "Temp_c": -6.2,
        "Dewpoint_c": -9.2,
        "Wind_Direction": 335,
        "Wind_Speed_kt": 14.4
      },
      {
        "Altitude_ft": 9357,
        "Temp_c": -6.2,
        "Dewpoint_c": -9.3,
        "Wind_Direction": 336,
        "Wind_Speed_kt": 14.4
      },
      {
        "Altitude_ft": 9380,
        "Temp_c": -6.3,
        "Dewpoint_c": -9.6,
        "Wind_Direction": 336,
        "Wind_Speed_kt": 14.6
      },
      {
        "Altitude_ft": 9393,
        "Temp_c": -6.2,
        "Dewpoint_c": -9.6,
        "Wind_Direction": 336,
        "Wind_Speed_kt": 14.8
      },
      {
        "Altitude_ft": 9409,
        "Temp_c": -6.2,
        "Dewpoint_c": -9.7,
        "Wind_Direction": 337,
        "Wind_Speed_kt": 15
      },
      {
        "Altitude_ft": 9429,
        "Temp_c": -6.1,
        "Dewpoint_c": -9.8,
        "Wind_Direction": 337,
        "Wind_Speed_kt": 15
      },
      {
        "Altitude_ft": 9446,
        "Temp_c": -6.1,
        "Dewpoint_c": -9.8,
        "Wind_Direction": 337,
        "Wind_Speed_kt": 15.2
      },
      {
        "Altitude_ft": 9462,
        "Temp_c": -6,
        "Dewpoint_c": -9.9,
        "Wind_Direction": 338,
        "Wind_Speed_kt": 15.4
      },
      {
        "Altitude_ft": 9478,
        "Temp_c": -6,
        "Dewpoint_c": -10,
        "Wind_Direction": 338,
        "Wind_Speed_kt": 15.6
      },
      {
        "Altitude_ft": 9491,
        "Temp_c": -5.9,
        "Dewpoint_c": -10.1,
        "Wind_Direction": 338,
        "Wind_Speed_kt": 15.6
      },
      {
        "Altitude_ft": 9508,
        "Temp_c": -5.9,
        "Dewpoint_c": -10.2,
        "Wind_Direction": 339,
        "Wind_Speed_kt": 15.7
      },
      {
        "Altitude_ft": 9521,
        "Temp_c": -5.8,
        "Dewpoint_c": -10.2,
        "Wind_Direction": 339,
        "Wind_Speed_kt": 15.9
      },
      {
        "Altitude_ft": 9537,
        "Temp_c": -5.8,
        "Dewpoint_c": -10.3,
        "Wind_Direction": 339,
        "Wind_Speed_kt": 16.1
      },
      {
        "Altitude_ft": 9551,
        "Temp_c": -5.7,
        "Dewpoint_c": -10.4,
        "Wind_Direction": 339,
        "Wind_Speed_kt": 16.1
      },
      {
        "Altitude_ft": 9567,
        "Temp_c": -5.6,
        "Dewpoint_c": -10.5,
        "Wind_Direction": 340,
        "Wind_Speed_kt": 16.3
      },
      {
        "Altitude_ft": 9590,
        "Temp_c": -5.6,
        "Dewpoint_c": -10.5,
        "Wind_Direction": 340,
        "Wind_Speed_kt": 16.5
      },
      {
        "Altitude_ft": 9596,
        "Temp_c": -5.6,
        "Dewpoint_c": -10.5,
        "Wind_Direction": 340,
        "Wind_Speed_kt": 16.7
      },
      {
        "Altitude_ft": 9613,
        "Temp_c": -5.6,
        "Dewpoint_c": -10.6,
        "Wind_Direction": 340,
        "Wind_Speed_kt": 16.7
      },
      {
        "Altitude_ft": 9626,
        "Temp_c": -5.6,
        "Dewpoint_c": -10.7,
        "Wind_Direction": 341,
        "Wind_Speed_kt": 16.9
      },
      {
        "Altitude_ft": 9642,
        "Temp_c": -5.6,
        "Dewpoint_c": -10.7,
        "Wind_Direction": 340,
        "Wind_Speed_kt": 16.9
      },
      {
        "Altitude_ft": 9656,
        "Temp_c": -5.6,
        "Dewpoint_c": -10.8,
        "Wind_Direction": 340,
        "Wind_Speed_kt": 16.9
      },
      {
        "Altitude_ft": 9669,
        "Temp_c": -5.6,
        "Dewpoint_c": -10.8,
        "Wind_Direction": 339,
        "Wind_Speed_kt": 16.9
      },
      {
        "Altitude_ft": 9682,
        "Temp_c": -5.6,
        "Dewpoint_c": -10.9,
        "Wind_Direction": 339,
        "Wind_Speed_kt": 17.1
      },
      {
        "Altitude_ft": 9698,
        "Temp_c": -5.6,
        "Dewpoint_c": -11,
        "Wind_Direction": 338,
        "Wind_Speed_kt": 17.1
      },
      {
        "Altitude_ft": 9711,
        "Temp_c": -5.6,
        "Dewpoint_c": -11,
        "Wind_Direction": 337,
        "Wind_Speed_kt": 17.1
      },
      {
        "Altitude_ft": 9724,
        "Temp_c": -5.6,
        "Dewpoint_c": -11.1,
        "Wind_Direction": 337,
        "Wind_Speed_kt": 17.1
      },
      {
        "Altitude_ft": 9738,
        "Temp_c": -5.6,
        "Dewpoint_c": -11.2,
        "Wind_Direction": 336,
        "Wind_Speed_kt": 17.1
      },
      {
        "Altitude_ft": 9751,
        "Temp_c": -5.6,
        "Dewpoint_c": -11.2,
        "Wind_Direction": 336,
        "Wind_Speed_kt": 17.1
      },
      {
        "Altitude_ft": 9767,
        "Temp_c": -5.6,
        "Dewpoint_c": -11.3,
        "Wind_Direction": 335,
        "Wind_Speed_kt": 17.1
      },
      {
        "Altitude_ft": 9780,
        "Temp_c": -5.6,
        "Dewpoint_c": -11.3,
        "Wind_Direction": 335,
        "Wind_Speed_kt": 17.1
      },
      {
        "Altitude_ft": 9793,
        "Temp_c": -5.6,
        "Dewpoint_c": -11.4,
        "Wind_Direction": 334,
        "Wind_Speed_kt": 17.3
      },
      {
        "Altitude_ft": 9810,
        "Temp_c": -5.6,
        "Dewpoint_c": -11.4,
        "Wind_Direction": 334,
        "Wind_Speed_kt": 17.3
      },
      {
        "Altitude_ft": 9823,
        "Temp_c": -5.6,
        "Dewpoint_c": -11.5,
        "Wind_Direction": 333,
        "Wind_Speed_kt": 17.3
      },
      {
        "Altitude_ft": 9839,
        "Temp_c": -5.6,
        "Dewpoint_c": -11.5,
        "Wind_Direction": 333,
        "Wind_Speed_kt": 17.3
      },
      {
        "Altitude_ft": 9852,
        "Temp_c": -5.7,
        "Dewpoint_c": -11.6,
        "Wind_Direction": 332,
        "Wind_Speed_kt": 17.3
      },
      {
        "Altitude_ft": 9869,
        "Temp_c": -5.7,
        "Dewpoint_c": -11.6,
        "Wind_Direction": 332,
        "Wind_Speed_kt": 17.3
      },
      {
        "Altitude_ft": 9882,
        "Temp_c": -5.7,
        "Dewpoint_c": -11.7,
        "Wind_Direction": 331,
        "Wind_Speed_kt": 17.5
      },
      {
        "Altitude_ft": 9898,
        "Temp_c": -5.7,
        "Dewpoint_c": -11.7,
        "Wind_Direction": 331,
        "Wind_Speed_kt": 17.5
      },
      {
        "Altitude_ft": 9911,
        "Temp_c": -5.7,
        "Dewpoint_c": -11.8,
        "Wind_Direction": 330,
        "Wind_Speed_kt": 17.5
      },
      {
        "Altitude_ft": 9928,
        "Temp_c": -5.7,
        "Dewpoint_c": -11.8,
        "Wind_Direction": 330,
        "Wind_Speed_kt": 17.5
      },
      {
        "Altitude_ft": 9941,
        "Temp_c": -5.7,
        "Dewpoint_c": -11.9,
        "Wind_Direction": 330,
        "Wind_Speed_kt": 17.5
      },
      {
        "Altitude_ft": 9957,
        "Temp_c": -5.8,
        "Dewpoint_c": -12,
        "Wind_Direction": 330,
        "Wind_Speed_kt": 17.5
      },
      {
        "Altitude_ft": 9974,
        "Temp_c": -5.8,
        "Dewpoint_c": -12,
        "Wind_Direction": 330,
        "Wind_Speed_kt": 17.5
      },
      {
        "Altitude_ft": 9990,
        "Temp_c": -5.8,
        "Dewpoint_c": -12.1,
        "Wind_Direction": 329,
        "Wind_Speed_kt": 17.3
      },
      {
        "Altitude_ft": 10007,
        "Temp_c": -5.8,
        "Dewpoint_c": -12.2,
        "Wind_Direction": 329,
        "Wind_Speed_kt": 17.3
      },
      {
        "Altitude_ft": 10020,
        "Temp_c": -5.9,
        "Dewpoint_c": -12.2,
        "Wind_Direction": 329,
        "Wind_Speed_kt": 17.3
      },
      {
        "Altitude_ft": 10036,
        "Temp_c": -5.9,
        "Dewpoint_c": -12.3,
        "Wind_Direction": 329,
        "Wind_Speed_kt": 17.3
      },
      {
        "Altitude_ft": 10052,
        "Temp_c": -5.9,
        "Dewpoint_c": -12.4,
        "Wind_Direction": 329,
        "Wind_Speed_kt": 17.3
      },
      {
        "Altitude_ft": 10069,
        "Temp_c": -6,
        "Dewpoint_c": -12.5,
        "Wind_Direction": 329,
        "Wind_Speed_kt": 17.3
      },
      {
        "Altitude_ft": 10085,
        "Temp_c": -6,
        "Dewpoint_c": -12.5,
        "Wind_Direction": 328,
        "Wind_Speed_kt": 17.3
      },
      {
        "Altitude_ft": 10102,
        "Temp_c": -6,
        "Dewpoint_c": -12.6,
        "Wind_Direction": 328,
        "Wind_Speed_kt": 17.3
      },
      {
        "Altitude_ft": 10118,
        "Temp_c": -6.1,
        "Dewpoint_c": -12.7,
        "Wind_Direction": 328,
        "Wind_Speed_kt": 17.3
      },
      {
        "Altitude_ft": 10135,
        "Temp_c": -6.1,
        "Dewpoint_c": -12.8,
        "Wind_Direction": 328,
        "Wind_Speed_kt": 17.1
      },
      {
        "Altitude_ft": 10154,
        "Temp_c": -6.1,
        "Dewpoint_c": -12.9,
        "Wind_Direction": 328,
        "Wind_Speed_kt": 17.1
      },
      {
        "Altitude_ft": 10164,
        "Temp_c": -6.2,
        "Dewpoint_c": -12.9,
        "Wind_Direction": 328,
        "Wind_Speed_kt": 17.1
      },
      {
        "Altitude_ft": 10180,
        "Temp_c": -6.2,
        "Dewpoint_c": -12.9,
        "Wind_Direction": 327,
        "Wind_Speed_kt": 17.1
      },
      {
        "Altitude_ft": 10194,
        "Temp_c": -6.2,
        "Dewpoint_c": -12.9,
        "Wind_Direction": 327,
        "Wind_Speed_kt": 17.1
      },
      {
        "Altitude_ft": 10213,
        "Temp_c": -6.3,
        "Dewpoint_c": -12.9,
        "Wind_Direction": 327,
        "Wind_Speed_kt": 17.1
      },
      {
        "Altitude_ft": 10230,
        "Temp_c": -6.3,
        "Dewpoint_c": -12.9,
        "Wind_Direction": 327,
        "Wind_Speed_kt": 17.1
      },
      {
        "Altitude_ft": 10246,
        "Temp_c": -6.3,
        "Dewpoint_c": -13,
        "Wind_Direction": 327,
        "Wind_Speed_kt": 17.1
      },
      {
        "Altitude_ft": 10262,
        "Temp_c": -6.4,
        "Dewpoint_c": -13,
        "Wind_Direction": 327,
        "Wind_Speed_kt": 17.1
      },
      {
        "Altitude_ft": 10279,
        "Temp_c": -6.4,
        "Dewpoint_c": -13,
        "Wind_Direction": 327,
        "Wind_Speed_kt": 17.3
      },
      {
        "Altitude_ft": 10299,
        "Temp_c": -6.4,
        "Dewpoint_c": -13,
        "Wind_Direction": 327,
        "Wind_Speed_kt": 17.3
      },
      {
        "Altitude_ft": 10315,
        "Temp_c": -6.5,
        "Dewpoint_c": -13,
        "Wind_Direction": 327,
        "Wind_Speed_kt": 17.3
      },
      {
        "Altitude_ft": 10331,
        "Temp_c": -6.5,
        "Dewpoint_c": -13.1,
        "Wind_Direction": 327,
        "Wind_Speed_kt": 17.3
      },
      {
        "Altitude_ft": 10344,
        "Temp_c": -6.5,
        "Dewpoint_c": -13.1,
        "Wind_Direction": 326,
        "Wind_Speed_kt": 17.5
      },
      {
        "Altitude_ft": 10361,
        "Temp_c": -6.6,
        "Dewpoint_c": -13.1,
        "Wind_Direction": 326,
        "Wind_Speed_kt": 17.5
      },
      {
        "Altitude_ft": 10377,
        "Temp_c": -6.6,
        "Dewpoint_c": -13.1,
        "Wind_Direction": 326,
        "Wind_Speed_kt": 17.5
      },
      {
        "Altitude_ft": 10394,
        "Temp_c": -6.6,
        "Dewpoint_c": -13.1,
        "Wind_Direction": 326,
        "Wind_Speed_kt": 17.5
      },
      {
        "Altitude_ft": 10410,
        "Temp_c": -6.7,
        "Dewpoint_c": -13.2,
        "Wind_Direction": 326,
        "Wind_Speed_kt": 17.7
      },
      {
        "Altitude_ft": 10427,
        "Temp_c": -6.7,
        "Dewpoint_c": -13.2,
        "Wind_Direction": 326,
        "Wind_Speed_kt": 17.7
      },
      {
        "Altitude_ft": 10440,
        "Temp_c": -6.7,
        "Dewpoint_c": -13.2,
        "Wind_Direction": 326,
        "Wind_Speed_kt": 17.7
      },
      {
        "Altitude_ft": 10456,
        "Temp_c": -6.8,
        "Dewpoint_c": -13.3,
        "Wind_Direction": 326,
        "Wind_Speed_kt": 17.7
      },
      {
        "Altitude_ft": 10472,
        "Temp_c": -6.8,
        "Dewpoint_c": -13.3,
        "Wind_Direction": 326,
        "Wind_Speed_kt": 17.9
      },
      {
        "Altitude_ft": 10486,
        "Temp_c": -6.8,
        "Dewpoint_c": -13.3,
        "Wind_Direction": 326,
        "Wind_Speed_kt": 17.9
      },
      {
        "Altitude_ft": 10502,
        "Temp_c": -6.9,
        "Dewpoint_c": -13.4,
        "Wind_Direction": 326,
        "Wind_Speed_kt": 17.9
      },
      {
        "Altitude_ft": 10515,
        "Temp_c": -6.9,
        "Dewpoint_c": -13.4,
        "Wind_Direction": 326,
        "Wind_Speed_kt": 17.9
      },
      {
        "Altitude_ft": 10528,
        "Temp_c": -6.9,
        "Dewpoint_c": -13.4,
        "Wind_Direction": 326,
        "Wind_Speed_kt": 18.1
      },
      {
        "Altitude_ft": 10541,
        "Temp_c": -7,
        "Dewpoint_c": -13.5,
        "Wind_Direction": 326,
        "Wind_Speed_kt": 18.1
      },
      {
        "Altitude_ft": 10558,
        "Temp_c": -7,
        "Dewpoint_c": -13.5,
        "Wind_Direction": 326,
        "Wind_Speed_kt": 17.9
      },
      {
        "Altitude_ft": 10571,
        "Temp_c": -7,
        "Dewpoint_c": -13.6,
        "Wind_Direction": 325,
        "Wind_Speed_kt": 17.9
      },
      {
        "Altitude_ft": 10584,
        "Temp_c": -7.1,
        "Dewpoint_c": -13.6,
        "Wind_Direction": 325,
        "Wind_Speed_kt": 17.9
      },
      {
        "Altitude_ft": 10597,
        "Temp_c": -7.1,
        "Dewpoint_c": -13.6,
        "Wind_Direction": 325,
        "Wind_Speed_kt": 17.7
      },
      {
        "Altitude_ft": 10614,
        "Temp_c": -7.1,
        "Dewpoint_c": -13.6,
        "Wind_Direction": 325,
        "Wind_Speed_kt": 17.7
      },
      {
        "Altitude_ft": 10627,
        "Temp_c": -7.2,
        "Dewpoint_c": -13.7,
        "Wind_Direction": 325,
        "Wind_Speed_kt": 17.5
      },
      {
        "Altitude_ft": 10643,
        "Temp_c": -7.2,
        "Dewpoint_c": -13.7,
        "Wind_Direction": 325,
        "Wind_Speed_kt": 17.5
      },
      {
        "Altitude_ft": 10659,
        "Temp_c": -7.3,
        "Dewpoint_c": -13.7,
        "Wind_Direction": 325,
        "Wind_Speed_kt": 17.5
      },
      {
        "Altitude_ft": 10679,
        "Temp_c": -7.3,
        "Dewpoint_c": -13.8,
        "Wind_Direction": 325,
        "Wind_Speed_kt": 17.3
      },
      {
        "Altitude_ft": 10696,
        "Temp_c": -7.3,
        "Dewpoint_c": -13.8,
        "Wind_Direction": 325,
        "Wind_Speed_kt": 17.3
      },
      {
        "Altitude_ft": 10712,
        "Temp_c": -7.4,
        "Dewpoint_c": -13.8,
        "Wind_Direction": 324,
        "Wind_Speed_kt": 17.1
      },
      {
        "Altitude_ft": 10732,
        "Temp_c": -7.4,
        "Dewpoint_c": -13.8,
        "Wind_Direction": 324,
        "Wind_Speed_kt": 17.1
      },
      {
        "Altitude_ft": 10748,
        "Temp_c": -7.5,
        "Dewpoint_c": -13.9,
        "Wind_Direction": 324,
        "Wind_Speed_kt": 16.9
      },
      {
        "Altitude_ft": 10764,
        "Temp_c": -7.5,
        "Dewpoint_c": -13.9,
        "Wind_Direction": 324,
        "Wind_Speed_kt": 16.9
      },
      {
        "Altitude_ft": 10781,
        "Temp_c": -7.6,
        "Dewpoint_c": -13.9,
        "Wind_Direction": 324,
        "Wind_Speed_kt": 16.9
      },
      {
        "Altitude_ft": 10797,
        "Temp_c": -7.6,
        "Dewpoint_c": -14,
        "Wind_Direction": 324,
        "Wind_Speed_kt": 16.7
      },
      {
        "Altitude_ft": 10814,
        "Temp_c": -7.6,
        "Dewpoint_c": -14,
        "Wind_Direction": 324,
        "Wind_Speed_kt": 16.7
      },
      {
        "Altitude_ft": 10830,
        "Temp_c": -7.7,
        "Dewpoint_c": -13.9,
        "Wind_Direction": 324,
        "Wind_Speed_kt": 16.5
      },
      {
        "Altitude_ft": 10846,
        "Temp_c": -7.7,
        "Dewpoint_c": -13.9,
        "Wind_Direction": 324,
        "Wind_Speed_kt": 16.5
      },
      {
        "Altitude_ft": 10863,
        "Temp_c": -7.8,
        "Dewpoint_c": -13.9,
        "Wind_Direction": 323,
        "Wind_Speed_kt": 16.5
      },
      {
        "Altitude_ft": 10876,
        "Temp_c": -7.8,
        "Dewpoint_c": -13.9,
        "Wind_Direction": 323,
        "Wind_Speed_kt": 16.5
      },
      {
        "Altitude_ft": 10892,
        "Temp_c": -7.8,
        "Dewpoint_c": -13.9,
        "Wind_Direction": 323,
        "Wind_Speed_kt": 16.5
      },
      {
        "Altitude_ft": 10909,
        "Temp_c": -7.9,
        "Dewpoint_c": -13.9,
        "Wind_Direction": 324,
        "Wind_Speed_kt": 16.5
      },
      {
        "Altitude_ft": 10925,
        "Temp_c": -7.9,
        "Dewpoint_c": -13.9,
        "Wind_Direction": 324,
        "Wind_Speed_kt": 16.5
      },
      {
        "Altitude_ft": 10942,
        "Temp_c": -7.9,
        "Dewpoint_c": -13.9,
        "Wind_Direction": 324,
        "Wind_Speed_kt": 16.5
      },
      {
        "Altitude_ft": 10958,
        "Temp_c": -8,
        "Dewpoint_c": -13.9,
        "Wind_Direction": 324,
        "Wind_Speed_kt": 16.7
      },
      {
        "Altitude_ft": 10974,
        "Temp_c": -8,
        "Dewpoint_c": -13.9,
        "Wind_Direction": 324,
        "Wind_Speed_kt": 16.7
      },
      {
        "Altitude_ft": 10991,
        "Temp_c": -8,
        "Dewpoint_c": -13.8,
        "Wind_Direction": 324,
        "Wind_Speed_kt": 16.7
      },
      {
        "Altitude_ft": 11010,
        "Temp_c": -8.1,
        "Dewpoint_c": -13.8,
        "Wind_Direction": 324,
        "Wind_Speed_kt": 16.7
      },
      {
        "Altitude_ft": 11024,
        "Temp_c": -8.1,
        "Dewpoint_c": -13.9,
        "Wind_Direction": 324,
        "Wind_Speed_kt": 16.7
      },
      {
        "Altitude_ft": 11040,
        "Temp_c": -8.2,
        "Dewpoint_c": -13.9,
        "Wind_Direction": 324,
        "Wind_Speed_kt": 16.9
      },
      {
        "Altitude_ft": 11056,
        "Temp_c": -8.2,
        "Dewpoint_c": -13.9,
        "Wind_Direction": 324,
        "Wind_Speed_kt": 16.9
      },
      {
        "Altitude_ft": 11073,
        "Temp_c": -8.2,
        "Dewpoint_c": -14,
        "Wind_Direction": 324,
        "Wind_Speed_kt": 16.9
      },
      {
        "Altitude_ft": 11086,
        "Temp_c": -8.2,
        "Dewpoint_c": -14,
        "Wind_Direction": 324,
        "Wind_Speed_kt": 16.9
      },
      {
        "Altitude_ft": 11102,
        "Temp_c": -8.3,
        "Dewpoint_c": -14,
        "Wind_Direction": 324,
        "Wind_Speed_kt": 16.9
      },
      {
        "Altitude_ft": 11119,
        "Temp_c": -8.3,
        "Dewpoint_c": -14.1,
        "Wind_Direction": 324,
        "Wind_Speed_kt": 16.9
      },
      {
        "Altitude_ft": 11135,
        "Temp_c": -8.3,
        "Dewpoint_c": -14.1,
        "Wind_Direction": 324,
        "Wind_Speed_kt": 17.1
      },
      {
        "Altitude_ft": 11152,
        "Temp_c": -8.3,
        "Dewpoint_c": -14.1,
        "Wind_Direction": 324,
        "Wind_Speed_kt": 17.1
      },
      {
        "Altitude_ft": 11168,
        "Temp_c": -8.4,
        "Dewpoint_c": -14.2,
        "Wind_Direction": 324,
        "Wind_Speed_kt": 17.1
      },
      {
        "Altitude_ft": 11184,
        "Temp_c": -8.4,
        "Dewpoint_c": -14.2,
        "Wind_Direction": 324,
        "Wind_Speed_kt": 17.1
      },
      {
        "Altitude_ft": 11201,
        "Temp_c": -8.4,
        "Dewpoint_c": -14.2,
        "Wind_Direction": 325,
        "Wind_Speed_kt": 17.1
      },
      {
        "Altitude_ft": 11214,
        "Temp_c": -8.4,
        "Dewpoint_c": -14.3,
        "Wind_Direction": 325,
        "Wind_Speed_kt": 16.9
      },
      {
        "Altitude_ft": 11230,
        "Temp_c": -8.5,
        "Dewpoint_c": -14.3,
        "Wind_Direction": 326,
        "Wind_Speed_kt": 16.9
      },
      {
        "Altitude_ft": 11243,
        "Temp_c": -8.5,
        "Dewpoint_c": -14.5,
        "Wind_Direction": 326,
        "Wind_Speed_kt": 16.7
      },
      {
        "Altitude_ft": 11266,
        "Temp_c": -8.5,
        "Dewpoint_c": -14.9,
        "Wind_Direction": 327,
        "Wind_Speed_kt": 16.7
      },
      {
        "Altitude_ft": 11276,
        "Temp_c": -8.5,
        "Dewpoint_c": -15,
        "Wind_Direction": 328,
        "Wind_Speed_kt": 16.5
      },
      {
        "Altitude_ft": 11293,
        "Temp_c": -8.5,
        "Dewpoint_c": -15.2,
        "Wind_Direction": 328,
        "Wind_Speed_kt": 16.5
      },
      {
        "Altitude_ft": 11312,
        "Temp_c": -8.5,
        "Dewpoint_c": -15.4,
        "Wind_Direction": 329,
        "Wind_Speed_kt": 16.5
      },
      {
        "Altitude_ft": 11329,
        "Temp_c": -8.5,
        "Dewpoint_c": -15.6,
        "Wind_Direction": 329,
        "Wind_Speed_kt": 16.3
      },
      {
        "Altitude_ft": 11348,
        "Temp_c": -8.5,
        "Dewpoint_c": -15.8,
        "Wind_Direction": 330,
        "Wind_Speed_kt": 16.3
      },
      {
        "Altitude_ft": 11365,
        "Temp_c": -8.5,
        "Dewpoint_c": -16.1,
        "Wind_Direction": 331,
        "Wind_Speed_kt": 16.1
      },
      {
        "Altitude_ft": 11385,
        "Temp_c": -8.5,
        "Dewpoint_c": -16.3,
        "Wind_Direction": 331,
        "Wind_Speed_kt": 16.1
      },
      {
        "Altitude_ft": 11407,
        "Temp_c": -8.5,
        "Dewpoint_c": -16.5,
        "Wind_Direction": 332,
        "Wind_Speed_kt": 16.1
      },
      {
        "Altitude_ft": 11427,
        "Temp_c": -8.5,
        "Dewpoint_c": -16.8,
        "Wind_Direction": 332,
        "Wind_Speed_kt": 15.9
      },
      {
        "Altitude_ft": 11447,
        "Temp_c": -8.5,
        "Dewpoint_c": -17,
        "Wind_Direction": 333,
        "Wind_Speed_kt": 15.9
      },
      {
        "Altitude_ft": 11467,
        "Temp_c": -8.5,
        "Dewpoint_c": -17.2,
        "Wind_Direction": 334,
        "Wind_Speed_kt": 15.9
      },
      {
        "Altitude_ft": 11486,
        "Temp_c": -8.5,
        "Dewpoint_c": -17.5,
        "Wind_Direction": 334,
        "Wind_Speed_kt": 15.7
      },
      {
        "Altitude_ft": 11499,
        "Temp_c": -8.5,
        "Dewpoint_c": -17.6,
        "Wind_Direction": 335,
        "Wind_Speed_kt": 15.7
      },
      {
        "Altitude_ft": 11516,
        "Temp_c": -8.5,
        "Dewpoint_c": -17.8,
        "Wind_Direction": 336,
        "Wind_Speed_kt": 15.7
      },
      {
        "Altitude_ft": 11532,
        "Temp_c": -8.6,
        "Dewpoint_c": -18,
        "Wind_Direction": 336,
        "Wind_Speed_kt": 15.6
      },
      {
        "Altitude_ft": 11545,
        "Temp_c": -8.6,
        "Dewpoint_c": -18.2,
        "Wind_Direction": 338,
        "Wind_Speed_kt": 15.7
      },
      {
        "Altitude_ft": 11562,
        "Temp_c": -8.6,
        "Dewpoint_c": -18.3,
        "Wind_Direction": 339,
        "Wind_Speed_kt": 15.9
      },
      {
        "Altitude_ft": 11578,
        "Temp_c": -8.6,
        "Dewpoint_c": -18.5,
        "Wind_Direction": 341,
        "Wind_Speed_kt": 15.9
      },
      {
        "Altitude_ft": 11594,
        "Temp_c": -8.6,
        "Dewpoint_c": -18.7,
        "Wind_Direction": 342,
        "Wind_Speed_kt": 16.1
      },
      {
        "Altitude_ft": 11611,
        "Temp_c": -8.6,
        "Dewpoint_c": -18.9,
        "Wind_Direction": 344,
        "Wind_Speed_kt": 16.1
      },
      {
        "Altitude_ft": 11627,
        "Temp_c": -8.6,
        "Dewpoint_c": -19.1,
        "Wind_Direction": 345,
        "Wind_Speed_kt": 16.3
      },
      {
        "Altitude_ft": 11640,
        "Temp_c": -8.6,
        "Dewpoint_c": -19.3,
        "Wind_Direction": 346,
        "Wind_Speed_kt": 16.5
      },
      {
        "Altitude_ft": 11657,
        "Temp_c": -8.6,
        "Dewpoint_c": -19.5,
        "Wind_Direction": 348,
        "Wind_Speed_kt": 16.5
      },
      {
        "Altitude_ft": 11673,
        "Temp_c": -8.6,
        "Dewpoint_c": -19.7,
        "Wind_Direction": 349,
        "Wind_Speed_kt": 16.7
      },
      {
        "Altitude_ft": 11690,
        "Temp_c": -8.6,
        "Dewpoint_c": -19.9,
        "Wind_Direction": 350,
        "Wind_Speed_kt": 16.7
      },
      {
        "Altitude_ft": 11703,
        "Temp_c": -8.7,
        "Dewpoint_c": -20.2,
        "Wind_Direction": 352,
        "Wind_Speed_kt": 16.9
      },
      {
        "Altitude_ft": 11719,
        "Temp_c": -8.7,
        "Dewpoint_c": -20.5,
        "Wind_Direction": 353,
        "Wind_Speed_kt": 16.9
      },
      {
        "Altitude_ft": 11729,
        "Temp_c": -8.7,
        "Dewpoint_c": -20.8,
        "Wind_Direction": 354,
        "Wind_Speed_kt": 17.1
      },
      {
        "Altitude_ft": 11749,
        "Temp_c": -8.6,
        "Dewpoint_c": -21.2,
        "Wind_Direction": 356,
        "Wind_Speed_kt": 17.3
      },
      {
        "Altitude_ft": 11765,
        "Temp_c": -8.6,
        "Dewpoint_c": -21.5,
        "Wind_Direction": 357,
        "Wind_Speed_kt": 17.3
      },
      {
        "Altitude_ft": 11781,
        "Temp_c": -8.6,
        "Dewpoint_c": -21.9,
        "Wind_Direction": 358,
        "Wind_Speed_kt": 17.5
      },
      {
        "Altitude_ft": 11798,
        "Temp_c": -8.5,
        "Dewpoint_c": -22.2,
        "Wind_Direction": 359,
        "Wind_Speed_kt": 17.5
      },
      {
        "Altitude_ft": 11814,
        "Temp_c": -8.5,
        "Dewpoint_c": -22.6,
        "Wind_Direction": 1,
        "Wind_Speed_kt": 17.5
      },
      {
        "Altitude_ft": 11831,
        "Temp_c": -8.5,
        "Dewpoint_c": -23,
        "Wind_Direction": 2,
        "Wind_Speed_kt": 17.7
      },
      {
        "Altitude_ft": 11847,
        "Temp_c": -8.4,
        "Dewpoint_c": -23.3,
        "Wind_Direction": 3,
        "Wind_Speed_kt": 17.9
      },
      {
        "Altitude_ft": 11870,
        "Temp_c": -8.4,
        "Dewpoint_c": -23.8,
        "Wind_Direction": 3,
        "Wind_Speed_kt": 17.7
      },
      {
        "Altitude_ft": 11890,
        "Temp_c": -8.4,
        "Dewpoint_c": -24.2,
        "Wind_Direction": 4,
        "Wind_Speed_kt": 17.7
      },
      {
        "Altitude_ft": 11909,
        "Temp_c": -8.3,
        "Dewpoint_c": -24.6,
        "Wind_Direction": 4,
        "Wind_Speed_kt": 17.5
      },
      {
        "Altitude_ft": 11929,
        "Temp_c": -8.3,
        "Dewpoint_c": -25,
        "Wind_Direction": 4,
        "Wind_Speed_kt": 17.3
      },
      {
        "Altitude_ft": 11952,
        "Temp_c": -8.3,
        "Dewpoint_c": -25.1,
        "Wind_Direction": 5,
        "Wind_Speed_kt": 17.3
      },
      {
        "Altitude_ft": 11965,
        "Temp_c": -8.2,
        "Dewpoint_c": -25.3,
        "Wind_Direction": 5,
        "Wind_Speed_kt": 17.1
      },
      {
        "Altitude_ft": 11975,
        "Temp_c": -8.2,
        "Dewpoint_c": -25.5,
        "Wind_Direction": 5,
        "Wind_Speed_kt": 16.9
      },
      {
        "Altitude_ft": 11988,
        "Temp_c": -8.3,
        "Dewpoint_c": -25.7,
        "Wind_Direction": 6,
        "Wind_Speed_kt": 16.9
      },
      {
        "Altitude_ft": 11998,
        "Temp_c": -8.3,
        "Dewpoint_c": -25.9,
        "Wind_Direction": 6,
        "Wind_Speed_kt": 16.7
      },
      {
        "Altitude_ft": 12011,
        "Temp_c": -8.3,
        "Dewpoint_c": -26.1,
        "Wind_Direction": 6,
        "Wind_Speed_kt": 16.5
      },
      {
        "Altitude_ft": 12024,
        "Temp_c": -8.3,
        "Dewpoint_c": -26.3,
        "Wind_Direction": 7,
        "Wind_Speed_kt": 16.3
      },
      {
        "Altitude_ft": 12034,
        "Temp_c": -8.3,
        "Dewpoint_c": -26.5,
        "Wind_Direction": 7,
        "Wind_Speed_kt": 16.3
      },
      {
        "Altitude_ft": 12047,
        "Temp_c": -8.3,
        "Dewpoint_c": -26.7,
        "Wind_Direction": 8,
        "Wind_Speed_kt": 16.1
      },
      {
        "Altitude_ft": 12057,
        "Temp_c": -8.3,
        "Dewpoint_c": -26.9,
        "Wind_Direction": 8,
        "Wind_Speed_kt": 15.9
      },
      {
        "Altitude_ft": 12070,
        "Temp_c": -8.4,
        "Dewpoint_c": -27.2,
        "Wind_Direction": 8,
        "Wind_Speed_kt": 15.9
      },
      {
        "Altitude_ft": 12080,
        "Temp_c": -8.4,
        "Dewpoint_c": -27.4,
        "Wind_Direction": 9,
        "Wind_Speed_kt": 15.7
      },
      {
        "Altitude_ft": 12090,
        "Temp_c": -8.4,
        "Dewpoint_c": -27.6,
        "Wind_Direction": 9,
        "Wind_Speed_kt": 15.6
      },
      {
        "Altitude_ft": 12103,
        "Temp_c": -8.4,
        "Dewpoint_c": -27.8,
        "Wind_Direction": 10,
        "Wind_Speed_kt": 15.6
      },
      {
        "Altitude_ft": 12116,
        "Temp_c": -8.4,
        "Dewpoint_c": -28,
        "Wind_Direction": 10,
        "Wind_Speed_kt": 15.4
      },
      {
        "Altitude_ft": 12123,
        "Temp_c": -8.4,
        "Dewpoint_c": -28.1,
        "Wind_Direction": 11,
        "Wind_Speed_kt": 15.2
      },
      {
        "Altitude_ft": 12136,
        "Temp_c": -8.4,
        "Dewpoint_c": -28.3,
        "Wind_Direction": 10,
        "Wind_Speed_kt": 15.2
      },
      {
        "Altitude_ft": 12146,
        "Temp_c": -8.4,
        "Dewpoint_c": -28.5,
        "Wind_Direction": 9,
        "Wind_Speed_kt": 15
      },
      {
        "Altitude_ft": 12159,
        "Temp_c": -8.4,
        "Dewpoint_c": -28.6,
        "Wind_Direction": 8,
        "Wind_Speed_kt": 15
      },
      {
        "Altitude_ft": 12172,
        "Temp_c": -8.4,
        "Dewpoint_c": -28.8,
        "Wind_Direction": 8,
        "Wind_Speed_kt": 14.8
      },
      {
        "Altitude_ft": 12188,
        "Temp_c": -8.4,
        "Dewpoint_c": -29,
        "Wind_Direction": 7,
        "Wind_Speed_kt": 14.8
      },
      {
        "Altitude_ft": 12201,
        "Temp_c": -8.3,
        "Dewpoint_c": -29.1,
        "Wind_Direction": 6,
        "Wind_Speed_kt": 14.6
      },
      {
        "Altitude_ft": 12215,
        "Temp_c": -8.3,
        "Dewpoint_c": -29.3,
        "Wind_Direction": 6,
        "Wind_Speed_kt": 14.6
      },
      {
        "Altitude_ft": 12228,
        "Temp_c": -8.3,
        "Dewpoint_c": -29.5,
        "Wind_Direction": 5,
        "Wind_Speed_kt": 14.6
      },
      {
        "Altitude_ft": 12244,
        "Temp_c": -8.3,
        "Dewpoint_c": -29.7,
        "Wind_Direction": 4,
        "Wind_Speed_kt": 14.4
      },
      {
        "Altitude_ft": 12260,
        "Temp_c": -8.3,
        "Dewpoint_c": -29.8,
        "Wind_Direction": 3,
        "Wind_Speed_kt": 14.4
      },
      {
        "Altitude_ft": 12274,
        "Temp_c": -8.3,
        "Dewpoint_c": -30,
        "Wind_Direction": 2,
        "Wind_Speed_kt": 14.2
      },
      {
        "Altitude_ft": 12290,
        "Temp_c": -8.3,
        "Dewpoint_c": -30.2,
        "Wind_Direction": 2,
        "Wind_Speed_kt": 14.2
      },
      {
        "Altitude_ft": 12303,
        "Temp_c": -8.3,
        "Dewpoint_c": -30.4,
        "Wind_Direction": 1,
        "Wind_Speed_kt": 14.2
      },
      {
        "Altitude_ft": 12320,
        "Temp_c": -8.3,
        "Dewpoint_c": -30.7,
        "Wind_Direction": 360,
        "Wind_Speed_kt": 14
      },
      {
        "Altitude_ft": 12336,
        "Temp_c": -8.3,
        "Dewpoint_c": -30.9,
        "Wind_Direction": 359,
        "Wind_Speed_kt": 14
      },
      {
        "Altitude_ft": 12349,
        "Temp_c": -8.3,
        "Dewpoint_c": -31.2,
        "Wind_Direction": 358,
        "Wind_Speed_kt": 13.8
      },
      {
        "Altitude_ft": 12365,
        "Temp_c": -8.3,
        "Dewpoint_c": -31.4,
        "Wind_Direction": 358,
        "Wind_Speed_kt": 13.8
      },
      {
        "Altitude_ft": 12382,
        "Temp_c": -8.3,
        "Dewpoint_c": -31.7,
        "Wind_Direction": 357,
        "Wind_Speed_kt": 13.8
      },
      {
        "Altitude_ft": 12395,
        "Temp_c": -8.4,
        "Dewpoint_c": -31.9,
        "Wind_Direction": 356,
        "Wind_Speed_kt": 13.8
      },
      {
        "Altitude_ft": 12411,
        "Temp_c": -8.4,
        "Dewpoint_c": -32.2,
        "Wind_Direction": 355,
        "Wind_Speed_kt": 13.6
      },
      {
        "Altitude_ft": 12431,
        "Temp_c": -8.4,
        "Dewpoint_c": -32.5,
        "Wind_Direction": 355,
        "Wind_Speed_kt": 13.6
      },
      {
        "Altitude_ft": 12448,
        "Temp_c": -8.4,
        "Dewpoint_c": -32.7,
        "Wind_Direction": 355,
        "Wind_Speed_kt": 13.4
      },
      {
        "Altitude_ft": 12464,
        "Temp_c": -8.4,
        "Dewpoint_c": -33,
        "Wind_Direction": 355,
        "Wind_Speed_kt": 13.2
      },
      {
        "Altitude_ft": 12480,
        "Temp_c": -8.4,
        "Dewpoint_c": -33.3,
        "Wind_Direction": 355,
        "Wind_Speed_kt": 13.2
      },
      {
        "Altitude_ft": 12497,
        "Temp_c": -8.4,
        "Dewpoint_c": -33.5,
        "Wind_Direction": 354,
        "Wind_Speed_kt": 13
      },
      {
        "Altitude_ft": 12510,
        "Temp_c": -8.4,
        "Dewpoint_c": -33.7,
        "Wind_Direction": 354,
        "Wind_Speed_kt": 12.8
      },
      {
        "Altitude_ft": 12523,
        "Temp_c": -8.4,
        "Dewpoint_c": -33.8,
        "Wind_Direction": 354,
        "Wind_Speed_kt": 12.8
      },
      {
        "Altitude_ft": 12539,
        "Temp_c": -8.5,
        "Dewpoint_c": -34,
        "Wind_Direction": 354,
        "Wind_Speed_kt": 12.6
      },
      {
        "Altitude_ft": 12552,
        "Temp_c": -8.5,
        "Dewpoint_c": -34.2,
        "Wind_Direction": 354,
        "Wind_Speed_kt": 12.6
      },
      {
        "Altitude_ft": 12566,
        "Temp_c": -8.5,
        "Dewpoint_c": -34.3,
        "Wind_Direction": 354,
        "Wind_Speed_kt": 12.4
      },
      {
        "Altitude_ft": 12582,
        "Temp_c": -8.5,
        "Dewpoint_c": -34.5,
        "Wind_Direction": 354,
        "Wind_Speed_kt": 12.2
      },
      {
        "Altitude_ft": 12598,
        "Temp_c": -8.5,
        "Dewpoint_c": -34.7,
        "Wind_Direction": 354,
        "Wind_Speed_kt": 12.2
      },
      {
        "Altitude_ft": 12615,
        "Temp_c": -8.5,
        "Dewpoint_c": -34.9,
        "Wind_Direction": 354,
        "Wind_Speed_kt": 12.1
      },
      {
        "Altitude_ft": 12631,
        "Temp_c": -8.5,
        "Dewpoint_c": -35.1,
        "Wind_Direction": 354,
        "Wind_Speed_kt": 11.9
      },
      {
        "Altitude_ft": 12648,
        "Temp_c": -8.5,
        "Dewpoint_c": -35.3,
        "Wind_Direction": 353,
        "Wind_Speed_kt": 11.9
      },
      {
        "Altitude_ft": 12664,
        "Temp_c": -8.5,
        "Dewpoint_c": -35.5,
        "Wind_Direction": 353,
        "Wind_Speed_kt": 11.7
      },
      {
        "Altitude_ft": 12680,
        "Temp_c": -8.5,
        "Dewpoint_c": -35.7,
        "Wind_Direction": 353,
        "Wind_Speed_kt": 11.5
      },
      {
        "Altitude_ft": 12697,
        "Temp_c": -8.5,
        "Dewpoint_c": -35.9,
        "Wind_Direction": 353,
        "Wind_Speed_kt": 11.5
      },
      {
        "Altitude_ft": 12713,
        "Temp_c": -8.6,
        "Dewpoint_c": -36.1,
        "Wind_Direction": 353,
        "Wind_Speed_kt": 11.3
      },
      {
        "Altitude_ft": 12726,
        "Temp_c": -8.6,
        "Dewpoint_c": -36.3,
        "Wind_Direction": 353,
        "Wind_Speed_kt": 11.3
      },
      {
        "Altitude_ft": 12743,
        "Temp_c": -8.6,
        "Dewpoint_c": -36.5,
        "Wind_Direction": 352,
        "Wind_Speed_kt": 11.1
      },
      {
        "Altitude_ft": 12762,
        "Temp_c": -8.6,
        "Dewpoint_c": -36.7,
        "Wind_Direction": 352,
        "Wind_Speed_kt": 11.1
      },
      {
        "Altitude_ft": 12779,
        "Temp_c": -8.7,
        "Dewpoint_c": -36.9,
        "Wind_Direction": 351,
        "Wind_Speed_kt": 11.1
      },
      {
        "Altitude_ft": 12795,
        "Temp_c": -8.7,
        "Dewpoint_c": -37.2,
        "Wind_Direction": 351,
        "Wind_Speed_kt": 11.1
      },
      {
        "Altitude_ft": 12815,
        "Temp_c": -8.7,
        "Dewpoint_c": -37.4,
        "Wind_Direction": 350,
        "Wind_Speed_kt": 11.1
      },
      {
        "Altitude_ft": 12831,
        "Temp_c": -8.8,
        "Dewpoint_c": -37.7,
        "Wind_Direction": 349,
        "Wind_Speed_kt": 10.9
      },
      {
        "Altitude_ft": 12848,
        "Temp_c": -8.8,
        "Dewpoint_c": -37.9,
        "Wind_Direction": 349,
        "Wind_Speed_kt": 10.9
      },
      {
        "Altitude_ft": 12864,
        "Temp_c": -8.8,
        "Dewpoint_c": -38.2,
        "Wind_Direction": 348,
        "Wind_Speed_kt": 10.9
      },
      {
        "Altitude_ft": 12877,
        "Temp_c": -8.8,
        "Dewpoint_c": -38.4,
        "Wind_Direction": 348,
        "Wind_Speed_kt": 10.9
      },
      {
        "Altitude_ft": 12894,
        "Temp_c": -8.9,
        "Dewpoint_c": -38.7,
        "Wind_Direction": 347,
        "Wind_Speed_kt": 10.9
      },
      {
        "Altitude_ft": 12907,
        "Temp_c": -8.9,
        "Dewpoint_c": -38.8,
        "Wind_Direction": 346,
        "Wind_Speed_kt": 10.9
      },
      {
        "Altitude_ft": 12923,
        "Temp_c": -8.9,
        "Dewpoint_c": -39,
        "Wind_Direction": 346,
        "Wind_Speed_kt": 10.7
      },
      {
        "Altitude_ft": 12936,
        "Temp_c": -8.9,
        "Dewpoint_c": -39.1,
        "Wind_Direction": 345,
        "Wind_Speed_kt": 10.7
      },
      {
        "Altitude_ft": 12953,
        "Temp_c": -9,
        "Dewpoint_c": -39.2,
        "Wind_Direction": 344,
        "Wind_Speed_kt": 10.7
      },
      {
        "Altitude_ft": 12966,
        "Temp_c": -9,
        "Dewpoint_c": -39.3,
        "Wind_Direction": 344,
        "Wind_Speed_kt": 10.7
      },
      {
        "Altitude_ft": 12982,
        "Temp_c": -9,
        "Dewpoint_c": -39.4,
        "Wind_Direction": 343,
        "Wind_Speed_kt": 10.7
      },
      {
        "Altitude_ft": 12995,
        "Temp_c": -9.1,
        "Dewpoint_c": -39.5,
        "Wind_Direction": 343,
        "Wind_Speed_kt": 10.7
      },
      {
        "Altitude_ft": 13009,
        "Temp_c": -9.1,
        "Dewpoint_c": -39.7,
        "Wind_Direction": 342,
        "Wind_Speed_kt": 10.7
      },
      {
        "Altitude_ft": 13022,
        "Temp_c": -9.1,
        "Dewpoint_c": -39.8,
        "Wind_Direction": 341,
        "Wind_Speed_kt": 10.7
      },
      {
        "Altitude_ft": 13035,
        "Temp_c": -9.2,
        "Dewpoint_c": -39.9,
        "Wind_Direction": 341,
        "Wind_Speed_kt": 10.7
      },
      {
        "Altitude_ft": 13045,
        "Temp_c": -9.2,
        "Dewpoint_c": -40,
        "Wind_Direction": 341,
        "Wind_Speed_kt": 10.7
      },
      {
        "Altitude_ft": 13058,
        "Temp_c": -9.2,
        "Dewpoint_c": -40.2,
        "Wind_Direction": 342,
        "Wind_Speed_kt": 10.7
      },
      {
        "Altitude_ft": 13074,
        "Temp_c": -9.3,
        "Dewpoint_c": -40.3,
        "Wind_Direction": 342,
        "Wind_Speed_kt": 10.7
      },
      {
        "Altitude_ft": 13081,
        "Temp_c": -9.3,
        "Dewpoint_c": -40.3,
        "Wind_Direction": 342,
        "Wind_Speed_kt": 10.7
      },
      {
        "Altitude_ft": 13094,
        "Temp_c": -9.3,
        "Dewpoint_c": -40.1,
        "Wind_Direction": 343,
        "Wind_Speed_kt": 10.7
      },
      {
        "Altitude_ft": 13107,
        "Temp_c": -9.3,
        "Dewpoint_c": -40,
        "Wind_Direction": 343,
        "Wind_Speed_kt": 10.9
      },
      {
        "Altitude_ft": 13120,
        "Temp_c": -9.4,
        "Dewpoint_c": -39.8,
        "Wind_Direction": 343,
        "Wind_Speed_kt": 10.9
      },
      {
        "Altitude_ft": 13136,
        "Temp_c": -9.4,
        "Dewpoint_c": -39.7,
        "Wind_Direction": 344,
        "Wind_Speed_kt": 10.9
      },
      {
        "Altitude_ft": 13150,
        "Temp_c": -9.4,
        "Dewpoint_c": -39.5,
        "Wind_Direction": 344,
        "Wind_Speed_kt": 10.9
      },
      {
        "Altitude_ft": 13163,
        "Temp_c": -9.5,
        "Dewpoint_c": -39.4,
        "Wind_Direction": 345,
        "Wind_Speed_kt": 10.9
      },
      {
        "Altitude_ft": 13179,
        "Temp_c": -9.5,
        "Dewpoint_c": -39.2,
        "Wind_Direction": 345,
        "Wind_Speed_kt": 10.9
      },
      {
        "Altitude_ft": 13192,
        "Temp_c": -9.6,
        "Dewpoint_c": -39.1,
        "Wind_Direction": 345,
        "Wind_Speed_kt": 11.1
      },
      {
        "Altitude_ft": 13209,
        "Temp_c": -9.6,
        "Dewpoint_c": -39,
        "Wind_Direction": 346,
        "Wind_Speed_kt": 11.1
      },
      {
        "Altitude_ft": 13222,
        "Temp_c": -9.6,
        "Dewpoint_c": -38.9,
        "Wind_Direction": 346,
        "Wind_Speed_kt": 11.1
      },
      {
        "Altitude_ft": 13238,
        "Temp_c": -9.7,
        "Dewpoint_c": -38.7,
        "Wind_Direction": 346,
        "Wind_Speed_kt": 11.1
      },
      {
        "Altitude_ft": 13255,
        "Temp_c": -9.7,
        "Dewpoint_c": -38.6,
        "Wind_Direction": 347,
        "Wind_Speed_kt": 11.1
      },
      {
        "Altitude_ft": 13271,
        "Temp_c": -9.7,
        "Dewpoint_c": -38,
        "Wind_Direction": 347,
        "Wind_Speed_kt": 11.3
      },
      {
        "Altitude_ft": 13287,
        "Temp_c": -9.8,
        "Dewpoint_c": -36.8,
        "Wind_Direction": 348,
        "Wind_Speed_kt": 11.3
      },
      {
        "Altitude_ft": 13301,
        "Temp_c": -9.8,
        "Dewpoint_c": -35.7,
        "Wind_Direction": 348,
        "Wind_Speed_kt": 11.3
      },
      {
        "Altitude_ft": 13317,
        "Temp_c": -9.8,
        "Dewpoint_c": -34.7,
        "Wind_Direction": 348,
        "Wind_Speed_kt": 11.3
      },
      {
        "Altitude_ft": 13333,
        "Temp_c": -9.9,
        "Dewpoint_c": -33.9,
        "Wind_Direction": 348,
        "Wind_Speed_kt": 11.5
      },
      {
        "Altitude_ft": 13350,
        "Temp_c": -9.9,
        "Dewpoint_c": -33,
        "Wind_Direction": 348,
        "Wind_Speed_kt": 11.7
      },
      {
        "Altitude_ft": 13363,
        "Temp_c": -9.9,
        "Dewpoint_c": -32.3,
        "Wind_Direction": 348,
        "Wind_Speed_kt": 11.7
      },
      {
        "Altitude_ft": 13379,
        "Temp_c": -10,
        "Dewpoint_c": -31.6,
        "Wind_Direction": 348,
        "Wind_Speed_kt": 11.9
      },
      {
        "Altitude_ft": 13396,
        "Temp_c": -10,
        "Dewpoint_c": -29.2,
        "Wind_Direction": 348,
        "Wind_Speed_kt": 12.1
      },
      {
        "Altitude_ft": 13412,
        "Temp_c": -10.1,
        "Dewpoint_c": -28.6,
        "Wind_Direction": 348,
        "Wind_Speed_kt": 12.2
      },
      {
        "Altitude_ft": 13428,
        "Temp_c": -10.1,
        "Dewpoint_c": -28.1,
        "Wind_Direction": 348,
        "Wind_Speed_kt": 12.2
      },
      {
        "Altitude_ft": 13445,
        "Temp_c": -10.1,
        "Dewpoint_c": -27.6,
        "Wind_Direction": 348,
        "Wind_Speed_kt": 12.4
      },
      {
        "Altitude_ft": 13465,
        "Temp_c": -10.2,
        "Dewpoint_c": -27.1,
        "Wind_Direction": 348,
        "Wind_Speed_kt": 12.6
      },
      {
        "Altitude_ft": 13481,
        "Temp_c": -10.2,
        "Dewpoint_c": -26.7,
        "Wind_Direction": 348,
        "Wind_Speed_kt": 12.6
      },
      {
        "Altitude_ft": 13497,
        "Temp_c": -10.2,
        "Dewpoint_c": -26.3,
        "Wind_Direction": 348,
        "Wind_Speed_kt": 12.8
      },
      {
        "Altitude_ft": 13517,
        "Temp_c": -10.3,
        "Dewpoint_c": -26,
        "Wind_Direction": 348,
        "Wind_Speed_kt": 13
      },
      {
        "Altitude_ft": 13533,
        "Temp_c": -10.3,
        "Dewpoint_c": -25.7,
        "Wind_Direction": 348,
        "Wind_Speed_kt": 13
      },
      {
        "Altitude_ft": 13550,
        "Temp_c": -10.4,
        "Dewpoint_c": -25.5,
        "Wind_Direction": 348,
        "Wind_Speed_kt": 13.2
      },
      {
        "Altitude_ft": 13566,
        "Temp_c": -10.4,
        "Dewpoint_c": -25.2,
        "Wind_Direction": 348,
        "Wind_Speed_kt": 13.4
      },
      {
        "Altitude_ft": 13583,
        "Temp_c": -10.4,
        "Dewpoint_c": -24.9,
        "Wind_Direction": 348,
        "Wind_Speed_kt": 13.6
      },
      {
        "Altitude_ft": 13596,
        "Temp_c": -10.5,
        "Dewpoint_c": -24.7,
        "Wind_Direction": 349,
        "Wind_Speed_kt": 13.6
      },
      {
        "Altitude_ft": 13612,
        "Temp_c": -10.5,
        "Dewpoint_c": -24.4,
        "Wind_Direction": 349,
        "Wind_Speed_kt": 13.8
      },
      {
        "Altitude_ft": 13625,
        "Temp_c": -10.6,
        "Dewpoint_c": -24.2,
        "Wind_Direction": 349,
        "Wind_Speed_kt": 14
      },
      {
        "Altitude_ft": 13642,
        "Temp_c": -10.6,
        "Dewpoint_c": -23.9,
        "Wind_Direction": 349,
        "Wind_Speed_kt": 14
      },
      {
        "Altitude_ft": 13655,
        "Temp_c": -10.6,
        "Dewpoint_c": -23.7,
        "Wind_Direction": 349,
        "Wind_Speed_kt": 14
      },
      {
        "Altitude_ft": 13668,
        "Temp_c": -10.7,
        "Dewpoint_c": -23.5,
        "Wind_Direction": 349,
        "Wind_Speed_kt": 14
      },
      {
        "Altitude_ft": 13684,
        "Temp_c": -10.7,
        "Dewpoint_c": -23.3,
        "Wind_Direction": 349,
        "Wind_Speed_kt": 14
      },
      {
        "Altitude_ft": 13701,
        "Temp_c": -10.8,
        "Dewpoint_c": -23.2,
        "Wind_Direction": 349,
        "Wind_Speed_kt": 14
      },
      {
        "Altitude_ft": 13714,
        "Temp_c": -10.8,
        "Dewpoint_c": -23.2,
        "Wind_Direction": 349,
        "Wind_Speed_kt": 14
      },
      {
        "Altitude_ft": 13730,
        "Temp_c": -10.9,
        "Dewpoint_c": -23.2,
        "Wind_Direction": 349,
        "Wind_Speed_kt": 14
      },
      {
        "Altitude_ft": 13747,
        "Temp_c": -10.9,
        "Dewpoint_c": -23.1,
        "Wind_Direction": 350,
        "Wind_Speed_kt": 13.8
      },
      {
        "Altitude_ft": 13760,
        "Temp_c": -10.9,
        "Dewpoint_c": -23.1,
        "Wind_Direction": 350,
        "Wind_Speed_kt": 13.8
      },
      {
        "Altitude_ft": 13780,
        "Temp_c": -11,
        "Dewpoint_c": -23,
        "Wind_Direction": 350,
        "Wind_Speed_kt": 13.8
      },
      {
        "Altitude_ft": 13789,
        "Temp_c": -11,
        "Dewpoint_c": -23,
        "Wind_Direction": 350,
        "Wind_Speed_kt": 13.8
      },
      {
        "Altitude_ft": 13802,
        "Temp_c": -11.1,
        "Dewpoint_c": -23,
        "Wind_Direction": 350,
        "Wind_Speed_kt": 13.8
      },
      {
        "Altitude_ft": 13816,
        "Temp_c": -11.1,
        "Dewpoint_c": -22.9,
        "Wind_Direction": 350,
        "Wind_Speed_kt": 13.8
      },
      {
        "Altitude_ft": 13829,
        "Temp_c": -11.1,
        "Dewpoint_c": -22.9,
        "Wind_Direction": 350,
        "Wind_Speed_kt": 13.8
      },
      {
        "Altitude_ft": 13845,
        "Temp_c": -11.2,
        "Dewpoint_c": -22.9,
        "Wind_Direction": 351,
        "Wind_Speed_kt": 13.8
      },
      {
        "Altitude_ft": 13858,
        "Temp_c": -11.2,
        "Dewpoint_c": -22.8,
        "Wind_Direction": 351,
        "Wind_Speed_kt": 13.6
      },
      {
        "Altitude_ft": 13871,
        "Temp_c": -11.3,
        "Dewpoint_c": -22.8,
        "Wind_Direction": 351,
        "Wind_Speed_kt": 13.6
      },
      {
        "Altitude_ft": 13885,
        "Temp_c": -11.3,
        "Dewpoint_c": -22.8,
        "Wind_Direction": 351,
        "Wind_Speed_kt": 13.6
      },
      {
        "Altitude_ft": 13898,
        "Temp_c": -11.3,
        "Dewpoint_c": -22.8,
        "Wind_Direction": 351,
        "Wind_Speed_kt": 13.6
      },
      {
        "Altitude_ft": 13907,
        "Temp_c": -11.4,
        "Dewpoint_c": -22.7,
        "Wind_Direction": 351,
        "Wind_Speed_kt": 13.6
      },
      {
        "Altitude_ft": 13924,
        "Temp_c": -11.4,
        "Dewpoint_c": -22.7,
        "Wind_Direction": 352,
        "Wind_Speed_kt": 13.6
      },
      {
        "Altitude_ft": 13940,
        "Temp_c": -11.5,
        "Dewpoint_c": -22.7,
        "Wind_Direction": 352,
        "Wind_Speed_kt": 13.6
      },
      {
        "Altitude_ft": 13957,
        "Temp_c": -11.5,
        "Dewpoint_c": -22.7,
        "Wind_Direction": 352,
        "Wind_Speed_kt": 13.6
      },
      {
        "Altitude_ft": 13973,
        "Temp_c": -11.6,
        "Dewpoint_c": -22.7,
        "Wind_Direction": 352,
        "Wind_Speed_kt": 13.6
      },
      {
        "Altitude_ft": 13990,
        "Temp_c": -11.6,
        "Dewpoint_c": -22.7,
        "Wind_Direction": 353,
        "Wind_Speed_kt": 13.8
      },
      {
        "Altitude_ft": 14009,
        "Temp_c": -11.7,
        "Dewpoint_c": -22.7,
        "Wind_Direction": 353,
        "Wind_Speed_kt": 13.8
      },
      {
        "Altitude_ft": 14026,
        "Temp_c": -11.7,
        "Dewpoint_c": -22.6,
        "Wind_Direction": 353,
        "Wind_Speed_kt": 13.8
      },
      {
        "Altitude_ft": 14042,
        "Temp_c": -11.8,
        "Dewpoint_c": -22.6,
        "Wind_Direction": 353,
        "Wind_Speed_kt": 14
      },
      {
        "Altitude_ft": 14058,
        "Temp_c": -11.8,
        "Dewpoint_c": -22.6,
        "Wind_Direction": 354,
        "Wind_Speed_kt": 14
      },
      {
        "Altitude_ft": 14075,
        "Temp_c": -11.9,
        "Dewpoint_c": -22.6,
        "Wind_Direction": 354,
        "Wind_Speed_kt": 14
      },
      {
        "Altitude_ft": 14091,
        "Temp_c": -11.9,
        "Dewpoint_c": -22.6,
        "Wind_Direction": 354,
        "Wind_Speed_kt": 14
      },
      {
        "Altitude_ft": 14108,
        "Temp_c": -12,
        "Dewpoint_c": -22.6,
        "Wind_Direction": 354,
        "Wind_Speed_kt": 14.2
      },
      {
        "Altitude_ft": 14124,
        "Temp_c": -12,
        "Dewpoint_c": -22.6,
        "Wind_Direction": 355,
        "Wind_Speed_kt": 14.2
      },
      {
        "Altitude_ft": 14140,
        "Temp_c": -12.1,
        "Dewpoint_c": -22.7,
        "Wind_Direction": 355,
        "Wind_Speed_kt": 14.2
      },
      {
        "Altitude_ft": 14160,
        "Temp_c": -12.1,
        "Dewpoint_c": -22.7,
        "Wind_Direction": 355,
        "Wind_Speed_kt": 14.4
      },
      {
        "Altitude_ft": 14177,
        "Temp_c": -12.1,
        "Dewpoint_c": -22.7,
        "Wind_Direction": 355,
        "Wind_Speed_kt": 14.4
      },
      {
        "Altitude_ft": 14193,
        "Temp_c": -12.2,
        "Dewpoint_c": -22.7,
        "Wind_Direction": 356,
        "Wind_Speed_kt": 14.4
      },
      {
        "Altitude_ft": 14209,
        "Temp_c": -12.2,
        "Dewpoint_c": -22.7,
        "Wind_Direction": 356,
        "Wind_Speed_kt": 14.4
      },
      {
        "Altitude_ft": 14229,
        "Temp_c": -12.3,
        "Dewpoint_c": -22.7,
        "Wind_Direction": 356,
        "Wind_Speed_kt": 14.6
      },
      {
        "Altitude_ft": 14245,
        "Temp_c": -12.3,
        "Dewpoint_c": -22.8,
        "Wind_Direction": 356,
        "Wind_Speed_kt": 14.6
      },
      {
        "Altitude_ft": 14265,
        "Temp_c": -12.4,
        "Dewpoint_c": -22.8,
        "Wind_Direction": 356,
        "Wind_Speed_kt": 14.6
      },
      {
        "Altitude_ft": 14281,
        "Temp_c": -12.4,
        "Dewpoint_c": -22.8,
        "Wind_Direction": 357,
        "Wind_Speed_kt": 14.6
      },
      {
        "Altitude_ft": 14298,
        "Temp_c": -12.5,
        "Dewpoint_c": -22.8,
        "Wind_Direction": 357,
        "Wind_Speed_kt": 14.6
      },
      {
        "Altitude_ft": 14314,
        "Temp_c": -12.5,
        "Dewpoint_c": -22.8,
        "Wind_Direction": 357,
        "Wind_Speed_kt": 14.6
      },
      {
        "Altitude_ft": 14331,
        "Temp_c": -12.5,
        "Dewpoint_c": -22.8,
        "Wind_Direction": 357,
        "Wind_Speed_kt": 14.6
      },
      {
        "Altitude_ft": 14347,
        "Temp_c": -12.6,
        "Dewpoint_c": -22.8,
        "Wind_Direction": 358,
        "Wind_Speed_kt": 14.6
      },
      {
        "Altitude_ft": 14364,
        "Temp_c": -12.6,
        "Dewpoint_c": -22.8,
        "Wind_Direction": 358,
        "Wind_Speed_kt": 14.6
      },
      {
        "Altitude_ft": 14380,
        "Temp_c": -12.7,
        "Dewpoint_c": -22.8,
        "Wind_Direction": 358,
        "Wind_Speed_kt": 14.6
      },
      {
        "Altitude_ft": 14396,
        "Temp_c": -12.7,
        "Dewpoint_c": -22.8,
        "Wind_Direction": 358,
        "Wind_Speed_kt": 14.6
      },
      {
        "Altitude_ft": 14413,
        "Temp_c": -12.8,
        "Dewpoint_c": -22.8,
        "Wind_Direction": 359,
        "Wind_Speed_kt": 14.6
      },
      {
        "Altitude_ft": 14429,
        "Temp_c": -12.8,
        "Dewpoint_c": -22.8,
        "Wind_Direction": 359,
        "Wind_Speed_kt": 14.6
      },
      {
        "Altitude_ft": 14446,
        "Temp_c": -12.9,
        "Dewpoint_c": -22.8,
        "Wind_Direction": 359,
        "Wind_Speed_kt": 14.6
      },
      {
        "Altitude_ft": 14462,
        "Temp_c": -12.9,
        "Dewpoint_c": -22.8,
        "Wind_Direction": 359,
        "Wind_Speed_kt": 14.6
      },
      {
        "Altitude_ft": 14478,
        "Temp_c": -13,
        "Dewpoint_c": -22.8,
        "Wind_Direction": 359,
        "Wind_Speed_kt": 14.6
      },
      {
        "Altitude_ft": 14495,
        "Temp_c": -13,
        "Dewpoint_c": -22.8,
        "Wind_Direction": 360,
        "Wind_Speed_kt": 14.6
      },
      {
        "Altitude_ft": 14511,
        "Temp_c": -13.1,
        "Dewpoint_c": -22.8,
        "Wind_Direction": 360,
        "Wind_Speed_kt": 14.6
      },
      {
        "Altitude_ft": 14528,
        "Temp_c": -13.1,
        "Dewpoint_c": -22.8,
        "Wind_Direction": 360,
        "Wind_Speed_kt": 14.6
      },
      {
        "Altitude_ft": 14544,
        "Temp_c": -13.2,
        "Dewpoint_c": -22.8,
        "Wind_Direction": 360,
        "Wind_Speed_kt": 14.6
      },
      {
        "Altitude_ft": 14560,
        "Temp_c": -13.2,
        "Dewpoint_c": -22.7,
        "Wind_Direction": 1,
        "Wind_Speed_kt": 14.6
      },
      {
        "Altitude_ft": 14580,
        "Temp_c": -13.3,
        "Dewpoint_c": -22.7,
        "Wind_Direction": 1,
        "Wind_Speed_kt": 14.6
      },
      {
        "Altitude_ft": 14596,
        "Temp_c": -13.3,
        "Dewpoint_c": -22.6,
        "Wind_Direction": 1,
        "Wind_Speed_kt": 14.6
      },
      {
        "Altitude_ft": 14616,
        "Temp_c": -13.4,
        "Dewpoint_c": -22.6,
        "Wind_Direction": 1,
        "Wind_Speed_kt": 14.6
      },
      {
        "Altitude_ft": 14636,
        "Temp_c": -13.4,
        "Dewpoint_c": -22.5,
        "Wind_Direction": 1,
        "Wind_Speed_kt": 14.6
      },
      {
        "Altitude_ft": 14656,
        "Temp_c": -13.5,
        "Dewpoint_c": -22.5,
        "Wind_Direction": 2,
        "Wind_Speed_kt": 14.6
      },
      {
        "Altitude_ft": 14672,
        "Temp_c": -13.5,
        "Dewpoint_c": -22.4,
        "Wind_Direction": 2,
        "Wind_Speed_kt": 14.6
      },
      {
        "Altitude_ft": 14692,
        "Temp_c": -13.5,
        "Dewpoint_c": -22.4,
        "Wind_Direction": 2,
        "Wind_Speed_kt": 14.6
      },
      {
        "Altitude_ft": 14711,
        "Temp_c": -13.6,
        "Dewpoint_c": -22.3,
        "Wind_Direction": 2,
        "Wind_Speed_kt": 14.6
      },
      {
        "Altitude_ft": 14728,
        "Temp_c": -13.6,
        "Dewpoint_c": -22.3,
        "Wind_Direction": 2,
        "Wind_Speed_kt": 14.6
      },
      {
        "Altitude_ft": 14747,
        "Temp_c": -13.7,
        "Dewpoint_c": -22.2,
        "Wind_Direction": 3,
        "Wind_Speed_kt": 14.6
      },
      {
        "Altitude_ft": 14764,
        "Temp_c": -13.7,
        "Dewpoint_c": -22.2,
        "Wind_Direction": 3,
        "Wind_Speed_kt": 14.6
      },
      {
        "Altitude_ft": 14783,
        "Temp_c": -13.8,
        "Dewpoint_c": -22.1,
        "Wind_Direction": 3,
        "Wind_Speed_kt": 14.6
      },
      {
        "Altitude_ft": 14797,
        "Temp_c": -13.8,
        "Dewpoint_c": -22.1,
        "Wind_Direction": 3,
        "Wind_Speed_kt": 14.6
      },
      {
        "Altitude_ft": 14813,
        "Temp_c": -13.9,
        "Dewpoint_c": -22.2,
        "Wind_Direction": 3,
        "Wind_Speed_kt": 14.6
      },
      {
        "Altitude_ft": 14829,
        "Temp_c": -13.9,
        "Dewpoint_c": -22.2,
        "Wind_Direction": 4,
        "Wind_Speed_kt": 14.6
      },
      {
        "Altitude_ft": 14843,
        "Temp_c": -13.9,
        "Dewpoint_c": -22.2,
        "Wind_Direction": 4,
        "Wind_Speed_kt": 14.6
      },
      {
        "Altitude_ft": 14859,
        "Temp_c": -14,
        "Dewpoint_c": -22.2,
        "Wind_Direction": 4,
        "Wind_Speed_kt": 14.6
      },
      {
        "Altitude_ft": 14875,
        "Temp_c": -14,
        "Dewpoint_c": -22.3,
        "Wind_Direction": 4,
        "Wind_Speed_kt": 14.6
      },
      {
        "Altitude_ft": 14892,
        "Temp_c": -14.1,
        "Dewpoint_c": -22.3,
        "Wind_Direction": 5,
        "Wind_Speed_kt": 14.6
      },
      {
        "Altitude_ft": 14908,
        "Temp_c": -14.1,
        "Dewpoint_c": -22.3,
        "Wind_Direction": 5,
        "Wind_Speed_kt": 14.6
      },
      {
        "Altitude_ft": 14928,
        "Temp_c": -14.1,
        "Dewpoint_c": -22.3,
        "Wind_Direction": 5,
        "Wind_Speed_kt": 14.6
      },
      {
        "Altitude_ft": 14944,
        "Temp_c": -14.2,
        "Dewpoint_c": -22.3,
        "Wind_Direction": 5,
        "Wind_Speed_kt": 14.6
      },
      {
        "Altitude_ft": 14961,
        "Temp_c": -14.2,
        "Dewpoint_c": -22.4,
        "Wind_Direction": 5,
        "Wind_Speed_kt": 14.6
      },
      {
        "Altitude_ft": 14977,
        "Temp_c": -14.2,
        "Dewpoint_c": -22.4,
        "Wind_Direction": 6,
        "Wind_Speed_kt": 14.6
      },
      {
        "Altitude_ft": 15000,
        "Temp_c": -14.3,
        "Dewpoint_c": -22.4,
        "Wind_Direction": 6,
        "Wind_Speed_kt": 14.4
      },
      {
        "Altitude_ft": 15010,
        "Temp_c": -14.3,
        "Dewpoint_c": -22.4,
        "Wind_Direction": 6,
        "Wind_Speed_kt": 14.4
      },
      {
        "Altitude_ft": 15023,
        "Temp_c": -14.3,
        "Dewpoint_c": -22.5,
        "Wind_Direction": 6,
        "Wind_Speed_kt": 14.4
      },
      {
        "Altitude_ft": 15039,
        "Temp_c": -14.4,
        "Dewpoint_c": -22.5,
        "Wind_Direction": 6,
        "Wind_Speed_kt": 14.4
      },
      {
        "Altitude_ft": 15056,
        "Temp_c": -14.4,
        "Dewpoint_c": -22.6,
        "Wind_Direction": 7,
        "Wind_Speed_kt": 14.4
      },
      {
        "Altitude_ft": 15072,
        "Temp_c": -14.5,
        "Dewpoint_c": -22.6,
        "Wind_Direction": 7,
        "Wind_Speed_kt": 14.2
      },
      {
        "Altitude_ft": 15089,
        "Temp_c": -14.5,
        "Dewpoint_c": -22.6,
        "Wind_Direction": 7,
        "Wind_Speed_kt": 14.2
      },
      {
        "Altitude_ft": 15105,
        "Temp_c": -14.5,
        "Dewpoint_c": -22.7,
        "Wind_Direction": 7,
        "Wind_Speed_kt": 14.2
      },
      {
        "Altitude_ft": 15121,
        "Temp_c": -14.5,
        "Dewpoint_c": -22.7,
        "Wind_Direction": 7,
        "Wind_Speed_kt": 14.2
      },
      {
        "Altitude_ft": 15138,
        "Temp_c": -14.6,
        "Dewpoint_c": -22.7,
        "Wind_Direction": 8,
        "Wind_Speed_kt": 14.2
      },
      {
        "Altitude_ft": 15151,
        "Temp_c": -14.6,
        "Dewpoint_c": -22.7,
        "Wind_Direction": 8,
        "Wind_Speed_kt": 14.2
      },
      {
        "Altitude_ft": 15164,
        "Temp_c": -14.6,
        "Dewpoint_c": -22.8,
        "Wind_Direction": 8,
        "Wind_Speed_kt": 14
      },
      {
        "Altitude_ft": 15177,
        "Temp_c": -14.6,
        "Dewpoint_c": -22.8,
        "Wind_Direction": 8,
        "Wind_Speed_kt": 14
      },
      {
        "Altitude_ft": 15190,
        "Temp_c": -14.6,
        "Dewpoint_c": -22.8,
        "Wind_Direction": 9,
        "Wind_Speed_kt": 14
      },
      {
        "Altitude_ft": 15203,
        "Temp_c": -14.7,
        "Dewpoint_c": -22.9,
        "Wind_Direction": 9,
        "Wind_Speed_kt": 14
      },
      {
        "Altitude_ft": 15217,
        "Temp_c": -14.7,
        "Dewpoint_c": -23,
        "Wind_Direction": 9,
        "Wind_Speed_kt": 14
      },
      {
        "Altitude_ft": 15230,
        "Temp_c": -14.7,
        "Dewpoint_c": -23.1,
        "Wind_Direction": 9,
        "Wind_Speed_kt": 14
      },
      {
        "Altitude_ft": 15243,
        "Temp_c": -14.7,
        "Dewpoint_c": -23.3,
        "Wind_Direction": 10,
        "Wind_Speed_kt": 13.8
      },
      {
        "Altitude_ft": 15256,
        "Temp_c": -14.8,
        "Dewpoint_c": -23.4,
        "Wind_Direction": 10,
        "Wind_Speed_kt": 13.8
      },
      {
        "Altitude_ft": 15269,
        "Temp_c": -14.8,
        "Dewpoint_c": -23.6,
        "Wind_Direction": 10,
        "Wind_Speed_kt": 13.6
      },
      {
        "Altitude_ft": 15282,
        "Temp_c": -14.8,
        "Dewpoint_c": -23.7,
        "Wind_Direction": 10,
        "Wind_Speed_kt": 13.6
      },
      {
        "Altitude_ft": 15295,
        "Temp_c": -14.8,
        "Dewpoint_c": -23.9,
        "Wind_Direction": 10,
        "Wind_Speed_kt": 13.4
      },
      {
        "Altitude_ft": 15308,
        "Temp_c": -14.8,
        "Dewpoint_c": -24,
        "Wind_Direction": 11,
        "Wind_Speed_kt": 13.4
      },
      {
        "Altitude_ft": 15325,
        "Temp_c": -14.9,
        "Dewpoint_c": -24.2,
        "Wind_Direction": 11,
        "Wind_Speed_kt": 13.2
      },
      {
        "Altitude_ft": 15338,
        "Temp_c": -14.9,
        "Dewpoint_c": -24.3,
        "Wind_Direction": 11,
        "Wind_Speed_kt": 13.2
      },
      {
        "Altitude_ft": 15351,
        "Temp_c": -14.9,
        "Dewpoint_c": -24.5,
        "Wind_Direction": 11,
        "Wind_Speed_kt": 13
      },
      {
        "Altitude_ft": 15364,
        "Temp_c": -14.9,
        "Dewpoint_c": -24.7,
        "Wind_Direction": 11,
        "Wind_Speed_kt": 13
      },
      {
        "Altitude_ft": 15377,
        "Temp_c": -14.9,
        "Dewpoint_c": -24.8,
        "Wind_Direction": 12,
        "Wind_Speed_kt": 12.8
      },
      {
        "Altitude_ft": 15390,
        "Temp_c": -15,
        "Dewpoint_c": -25,
        "Wind_Direction": 12,
        "Wind_Speed_kt": 12.8
      },
      {
        "Altitude_ft": 15404,
        "Temp_c": -15,
        "Dewpoint_c": -25.2,
        "Wind_Direction": 12,
        "Wind_Speed_kt": 12.6
      },
      {
        "Altitude_ft": 15417,
        "Temp_c": -15,
        "Dewpoint_c": -25.4,
        "Wind_Direction": 12,
        "Wind_Speed_kt": 12.6
      },
      {
        "Altitude_ft": 15433,
        "Temp_c": -15,
        "Dewpoint_c": -25.6,
        "Wind_Direction": 13,
        "Wind_Speed_kt": 12.4
      },
      {
        "Altitude_ft": 15446,
        "Temp_c": -15,
        "Dewpoint_c": -25.8,
        "Wind_Direction": 13,
        "Wind_Speed_kt": 12.4
      },
      {
        "Altitude_ft": 15463,
        "Temp_c": -15.1,
        "Dewpoint_c": -26,
        "Wind_Direction": 13,
        "Wind_Speed_kt": 12.2
      },
      {
        "Altitude_ft": 15479,
        "Temp_c": -15.1,
        "Dewpoint_c": -26.2,
        "Wind_Direction": 13,
        "Wind_Speed_kt": 12.2
      },
      {
        "Altitude_ft": 15495,
        "Temp_c": -15.1,
        "Dewpoint_c": -26.4,
        "Wind_Direction": 14,
        "Wind_Speed_kt": 12.1
      },
      {
        "Altitude_ft": 15509,
        "Temp_c": -15.1,
        "Dewpoint_c": -26.6,
        "Wind_Direction": 14,
        "Wind_Speed_kt": 12.1
      },
      {
        "Altitude_ft": 15525,
        "Temp_c": -15.2,
        "Dewpoint_c": -26.8,
        "Wind_Direction": 14,
        "Wind_Speed_kt": 12.1
      },
      {
        "Altitude_ft": 15538,
        "Temp_c": -15.2,
        "Dewpoint_c": -27,
        "Wind_Direction": 14,
        "Wind_Speed_kt": 11.9
      },
      {
        "Altitude_ft": 15554,
        "Temp_c": -15.2,
        "Dewpoint_c": -27.3,
        "Wind_Direction": 14,
        "Wind_Speed_kt": 11.7
      },
      {
        "Altitude_ft": 15568,
        "Temp_c": -15.3,
        "Dewpoint_c": -27.5,
        "Wind_Direction": 14,
        "Wind_Speed_kt": 11.7
      },
      {
        "Altitude_ft": 15584,
        "Temp_c": -15.3,
        "Dewpoint_c": -27.9,
        "Wind_Direction": 14,
        "Wind_Speed_kt": 11.5
      },
      {
        "Altitude_ft": 15597,
        "Temp_c": -15.3,
        "Dewpoint_c": -28.3,
        "Wind_Direction": 14,
        "Wind_Speed_kt": 11.5
      },
      {
        "Altitude_ft": 15610,
        "Temp_c": -15.4,
        "Dewpoint_c": -28.7,
        "Wind_Direction": 14,
        "Wind_Speed_kt": 11.3
      },
      {
        "Altitude_ft": 15627,
        "Temp_c": -15.4,
        "Dewpoint_c": -29.1,
        "Wind_Direction": 14,
        "Wind_Speed_kt": 11.1
      },
      {
        "Altitude_ft": 15640,
        "Temp_c": -15.4,
        "Dewpoint_c": -29.5,
        "Wind_Direction": 14,
        "Wind_Speed_kt": 11.1
      },
      {
        "Altitude_ft": 15656,
        "Temp_c": -15.4,
        "Dewpoint_c": -29.9,
        "Wind_Direction": 14,
        "Wind_Speed_kt": 10.9
      },
      {
        "Altitude_ft": 15669,
        "Temp_c": -15.5,
        "Dewpoint_c": -30.4,
        "Wind_Direction": 14,
        "Wind_Speed_kt": 10.9
      },
      {
        "Altitude_ft": 15686,
        "Temp_c": -15.5,
        "Dewpoint_c": -30.9,
        "Wind_Direction": 14,
        "Wind_Speed_kt": 10.7
      },
      {
        "Altitude_ft": 15699,
        "Temp_c": -15.5,
        "Dewpoint_c": -31.3,
        "Wind_Direction": 15,
        "Wind_Speed_kt": 10.7
      },
      {
        "Altitude_ft": 15712,
        "Temp_c": -15.5,
        "Dewpoint_c": -31.9,
        "Wind_Direction": 15,
        "Wind_Speed_kt": 10.5
      },
      {
        "Altitude_ft": 15725,
        "Temp_c": -15.6,
        "Dewpoint_c": -32.4,
        "Wind_Direction": 15,
        "Wind_Speed_kt": 10.3
      },
      {
        "Altitude_ft": 15738,
        "Temp_c": -15.6,
        "Dewpoint_c": -33,
        "Wind_Direction": 15,
        "Wind_Speed_kt": 10.3
      },
      {
        "Altitude_ft": 15755,
        "Temp_c": -15.6,
        "Dewpoint_c": -33.5,
        "Wind_Direction": 15,
        "Wind_Speed_kt": 10.1
      },
      {
        "Altitude_ft": 15768,
        "Temp_c": -15.6,
        "Dewpoint_c": -34.2,
        "Wind_Direction": 15,
        "Wind_Speed_kt": 10.1
      },
      {
        "Altitude_ft": 15781,
        "Temp_c": -15.7,
        "Dewpoint_c": -34.8,
        "Wind_Direction": 15,
        "Wind_Speed_kt": 9.9
      },
      {
        "Altitude_ft": 15791,
        "Temp_c": -15.7,
        "Dewpoint_c": -35.3,
        "Wind_Direction": 15,
        "Wind_Speed_kt": 9.9
      },
      {
        "Altitude_ft": 15804,
        "Temp_c": -15.7,
        "Dewpoint_c": -35.4,
        "Wind_Direction": 15,
        "Wind_Speed_kt": 9.7
      },
      {
        "Altitude_ft": 15817,
        "Temp_c": -15.7,
        "Dewpoint_c": -35.6,
        "Wind_Direction": 15,
        "Wind_Speed_kt": 9.7
      },
      {
        "Altitude_ft": 15830,
        "Temp_c": -15.8,
        "Dewpoint_c": -35.8,
        "Wind_Direction": 15,
        "Wind_Speed_kt": 9.7
      },
      {
        "Altitude_ft": 15843,
        "Temp_c": -15.8,
        "Dewpoint_c": -35.9,
        "Wind_Direction": 16,
        "Wind_Speed_kt": 9.5
      },
      {
        "Altitude_ft": 15856,
        "Temp_c": -15.8,
        "Dewpoint_c": -36.1,
        "Wind_Direction": 16,
        "Wind_Speed_kt": 9.5
      },
      {
        "Altitude_ft": 15869,
        "Temp_c": -15.8,
        "Dewpoint_c": -36.2,
        "Wind_Direction": 16,
        "Wind_Speed_kt": 9.5
      },
      {
        "Altitude_ft": 15883,
        "Temp_c": -15.8,
        "Dewpoint_c": -36.4,
        "Wind_Direction": 16,
        "Wind_Speed_kt": 9.5
      },
      {
        "Altitude_ft": 15896,
        "Temp_c": -15.9,
        "Dewpoint_c": -36.6,
        "Wind_Direction": 16,
        "Wind_Speed_kt": 9.5
      },
      {
        "Altitude_ft": 15909,
        "Temp_c": -15.9,
        "Dewpoint_c": -36.7,
        "Wind_Direction": 17,
        "Wind_Speed_kt": 9.3
      },
      {
        "Altitude_ft": 15922,
        "Temp_c": -15.9,
        "Dewpoint_c": -36.9,
        "Wind_Direction": 17,
        "Wind_Speed_kt": 9.3
      },
      {
        "Altitude_ft": 15935,
        "Temp_c": -15.9,
        "Dewpoint_c": -37.1,
        "Wind_Direction": 17,
        "Wind_Speed_kt": 9.3
      },
      {
        "Altitude_ft": 15948,
        "Temp_c": -16,
        "Dewpoint_c": -37.3,
        "Wind_Direction": 17,
        "Wind_Speed_kt": 9.3
      },
      {
        "Altitude_ft": 15955,
        "Temp_c": -16,
        "Dewpoint_c": -37.4,
        "Wind_Direction": 18,
        "Wind_Speed_kt": 9.3
      },
      {
        "Altitude_ft": 15974,
        "Temp_c": -16,
        "Dewpoint_c": -37.3,
        "Wind_Direction": 18,
        "Wind_Speed_kt": 9.1
      },
      {
        "Altitude_ft": 15991,
        "Temp_c": -16,
        "Dewpoint_c": -37.3,
        "Wind_Direction": 18,
        "Wind_Speed_kt": 9.1
      },
      {
        "Altitude_ft": 16004,
        "Temp_c": -16.1,
        "Dewpoint_c": -37.2,
        "Wind_Direction": 18,
        "Wind_Speed_kt": 9.1
      },
      {
        "Altitude_ft": 16020,
        "Temp_c": -16.1,
        "Dewpoint_c": -37.2,
        "Wind_Direction": 19,
        "Wind_Speed_kt": 9.1
      },
      {
        "Altitude_ft": 16033,
        "Temp_c": -16.1,
        "Dewpoint_c": -37.1,
        "Wind_Direction": 19,
        "Wind_Speed_kt": 8.9
      },
      {
        "Altitude_ft": 16050,
        "Temp_c": -16.1,
        "Dewpoint_c": -37.1,
        "Wind_Direction": 19,
        "Wind_Speed_kt": 8.9
      },
      {
        "Altitude_ft": 16063,
        "Temp_c": -16.2,
        "Dewpoint_c": -37,
        "Wind_Direction": 19,
        "Wind_Speed_kt": 8.9
      },
      {
        "Altitude_ft": 16079,
        "Temp_c": -16.2,
        "Dewpoint_c": -37,
        "Wind_Direction": 20,
        "Wind_Speed_kt": 8.9
      },
      {
        "Altitude_ft": 16096,
        "Temp_c": -16.2,
        "Dewpoint_c": -37,
        "Wind_Direction": 20,
        "Wind_Speed_kt": 8.9
      },
      {
        "Altitude_ft": 16115,
        "Temp_c": -16.3,
        "Dewpoint_c": -36.9,
        "Wind_Direction": 19,
        "Wind_Speed_kt": 8.9
      },
      {
        "Altitude_ft": 16132,
        "Temp_c": -16.3,
        "Dewpoint_c": -36.9,
        "Wind_Direction": 19,
        "Wind_Speed_kt": 8.9
      },
      {
        "Altitude_ft": 16152,
        "Temp_c": -16.3,
        "Dewpoint_c": -36.8,
        "Wind_Direction": 19,
        "Wind_Speed_kt": 8.9
      },
      {
        "Altitude_ft": 16168,
        "Temp_c": -16.3,
        "Dewpoint_c": -36.8,
        "Wind_Direction": 19,
        "Wind_Speed_kt": 8.9
      },
      {
        "Altitude_ft": 16191,
        "Temp_c": -16.4,
        "Dewpoint_c": -36.7,
        "Wind_Direction": 19,
        "Wind_Speed_kt": 8.9
      },
      {
        "Altitude_ft": 16214,
        "Temp_c": -16.4,
        "Dewpoint_c": -36.7,
        "Wind_Direction": 19,
        "Wind_Speed_kt": 8.9
      },
      {
        "Altitude_ft": 16234,
        "Temp_c": -16.4,
        "Dewpoint_c": -36.6,
        "Wind_Direction": 19,
        "Wind_Speed_kt": 8.9
      },
      {
        "Altitude_ft": 16257,
        "Temp_c": -16.5,
        "Dewpoint_c": -36.6,
        "Wind_Direction": 18,
        "Wind_Speed_kt": 8.9
      },
      {
        "Altitude_ft": 16280,
        "Temp_c": -16.5,
        "Dewpoint_c": -36.5,
        "Wind_Direction": 18,
        "Wind_Speed_kt": 8.9
      },
      {
        "Altitude_ft": 16302,
        "Temp_c": -16.5,
        "Dewpoint_c": -36.4,
        "Wind_Direction": 18,
        "Wind_Speed_kt": 8.9
      },
      {
        "Altitude_ft": 16322,
        "Temp_c": -16.5,
        "Dewpoint_c": -36.4,
        "Wind_Direction": 18,
        "Wind_Speed_kt": 8.9
      },
      {
        "Altitude_ft": 16342,
        "Temp_c": -16.5,
        "Dewpoint_c": -36.3,
        "Wind_Direction": 18,
        "Wind_Speed_kt": 8.9
      },
      {
        "Altitude_ft": 16362,
        "Temp_c": -16.5,
        "Dewpoint_c": -36.2,
        "Wind_Direction": 18,
        "Wind_Speed_kt": 8.9
      },
      {
        "Altitude_ft": 16378,
        "Temp_c": -16.5,
        "Dewpoint_c": -36.2,
        "Wind_Direction": 18,
        "Wind_Speed_kt": 8.9
      },
      {
        "Altitude_ft": 16398,
        "Temp_c": -16.6,
        "Dewpoint_c": -36.1,
        "Wind_Direction": 17,
        "Wind_Speed_kt": 8.9
      },
      {
        "Altitude_ft": 16417,
        "Temp_c": -16.6,
        "Dewpoint_c": -36.1,
        "Wind_Direction": 17,
        "Wind_Speed_kt": 8.9
      },
      {
        "Altitude_ft": 16434,
        "Temp_c": -16.6,
        "Dewpoint_c": -36,
        "Wind_Direction": 17,
        "Wind_Speed_kt": 8.9
      },
      {
        "Altitude_ft": 16453,
        "Temp_c": -16.6,
        "Dewpoint_c": -35.8,
        "Wind_Direction": 17,
        "Wind_Speed_kt": 8.9
      },
      {
        "Altitude_ft": 16470,
        "Temp_c": -16.6,
        "Dewpoint_c": -35.4,
        "Wind_Direction": 17,
        "Wind_Speed_kt": 8.9
      },
      {
        "Altitude_ft": 16490,
        "Temp_c": -16.6,
        "Dewpoint_c": -35,
        "Wind_Direction": 15,
        "Wind_Speed_kt": 8.9
      },
      {
        "Altitude_ft": 16506,
        "Temp_c": -16.6,
        "Dewpoint_c": -34.6,
        "Wind_Direction": 14,
        "Wind_Speed_kt": 8.9
      },
      {
        "Altitude_ft": 16526,
        "Temp_c": -16.7,
        "Dewpoint_c": -34.3,
        "Wind_Direction": 12,
        "Wind_Speed_kt": 9.1
      },
      {
        "Altitude_ft": 16545,
        "Temp_c": -16.7,
        "Dewpoint_c": -34,
        "Wind_Direction": 11,
        "Wind_Speed_kt": 9.1
      },
      {
        "Altitude_ft": 16565,
        "Temp_c": -16.7,
        "Dewpoint_c": -33.7,
        "Wind_Direction": 9,
        "Wind_Speed_kt": 9.1
      },
      {
        "Altitude_ft": 16581,
        "Temp_c": -16.8,
        "Dewpoint_c": -33.4,
        "Wind_Direction": 7,
        "Wind_Speed_kt": 9.1
      },
      {
        "Altitude_ft": 16601,
        "Temp_c": -16.8,
        "Dewpoint_c": -33.1,
        "Wind_Direction": 6,
        "Wind_Speed_kt": 9.1
      },
      {
        "Altitude_ft": 16621,
        "Temp_c": -16.8,
        "Dewpoint_c": -32.9,
        "Wind_Direction": 4,
        "Wind_Speed_kt": 9.1
      },
      {
        "Altitude_ft": 16637,
        "Temp_c": -16.9,
        "Dewpoint_c": -32.6,
        "Wind_Direction": 3,
        "Wind_Speed_kt": 9.1
      },
      {
        "Altitude_ft": 16654,
        "Temp_c": -16.9,
        "Dewpoint_c": -32.3,
        "Wind_Direction": 1,
        "Wind_Speed_kt": 9.1
      },
      {
        "Altitude_ft": 16670,
        "Temp_c": -16.9,
        "Dewpoint_c": -32.1,
        "Wind_Direction": 359,
        "Wind_Speed_kt": 9.1
      },
      {
        "Altitude_ft": 16690,
        "Temp_c": -17,
        "Dewpoint_c": -31.9,
        "Wind_Direction": 358,
        "Wind_Speed_kt": 9.1
      },
      {
        "Altitude_ft": 16706,
        "Temp_c": -17,
        "Dewpoint_c": -31.8,
        "Wind_Direction": 356,
        "Wind_Speed_kt": 9.3
      },
      {
        "Altitude_ft": 16726,
        "Temp_c": -17,
        "Dewpoint_c": -31.8,
        "Wind_Direction": 355,
        "Wind_Speed_kt": 9.3
      },
      {
        "Altitude_ft": 16742,
        "Temp_c": -17.1,
        "Dewpoint_c": -31.8,
        "Wind_Direction": 353,
        "Wind_Speed_kt": 9.3
      },
      {
        "Altitude_ft": 16762,
        "Temp_c": -17.1,
        "Dewpoint_c": -31.8,
        "Wind_Direction": 352,
        "Wind_Speed_kt": 9.3
      },
      {
        "Altitude_ft": 16778,
        "Temp_c": -17.1,
        "Dewpoint_c": -31.8,
        "Wind_Direction": 350,
        "Wind_Speed_kt": 9.3
      },
      {
        "Altitude_ft": 16798,
        "Temp_c": -17.2,
        "Dewpoint_c": -31.7,
        "Wind_Direction": 349,
        "Wind_Speed_kt": 9.3
      },
      {
        "Altitude_ft": 16818,
        "Temp_c": -17.2,
        "Dewpoint_c": -31.7,
        "Wind_Direction": 347,
        "Wind_Speed_kt": 9.3
      },
      {
        "Altitude_ft": 16837,
        "Temp_c": -17.3,
        "Dewpoint_c": -31.7,
        "Wind_Direction": 346,
        "Wind_Speed_kt": 9.3
      },
      {
        "Altitude_ft": 16854,
        "Temp_c": -17.3,
        "Dewpoint_c": -31.7,
        "Wind_Direction": 345,
        "Wind_Speed_kt": 9.5
      },
      {
        "Altitude_ft": 16873,
        "Temp_c": -17.4,
        "Dewpoint_c": -31.7,
        "Wind_Direction": 345,
        "Wind_Speed_kt": 9.5
      },
      {
        "Altitude_ft": 16893,
        "Temp_c": -17.4,
        "Dewpoint_c": -31.7,
        "Wind_Direction": 344,
        "Wind_Speed_kt": 9.5
      },
      {
        "Altitude_ft": 16913,
        "Temp_c": -17.5,
        "Dewpoint_c": -31.7,
        "Wind_Direction": 344,
        "Wind_Speed_kt": 9.5
      },
      {
        "Altitude_ft": 16929,
        "Temp_c": -17.5,
        "Dewpoint_c": -31.7,
        "Wind_Direction": 343,
        "Wind_Speed_kt": 9.7
      },
      {
        "Altitude_ft": 16946,
        "Temp_c": -17.6,
        "Dewpoint_c": -31.7,
        "Wind_Direction": 343,
        "Wind_Speed_kt": 9.7
      },
      {
        "Altitude_ft": 16959,
        "Temp_c": -17.6,
        "Dewpoint_c": -31.7,
        "Wind_Direction": 342,
        "Wind_Speed_kt": 9.7
      },
      {
        "Altitude_ft": 16975,
        "Temp_c": -17.7,
        "Dewpoint_c": -31.8,
        "Wind_Direction": 342,
        "Wind_Speed_kt": 9.7
      },
      {
        "Altitude_ft": 16988,
        "Temp_c": -17.7,
        "Dewpoint_c": -31.8,
        "Wind_Direction": 341,
        "Wind_Speed_kt": 9.9
      },
      {
        "Altitude_ft": 17005,
        "Temp_c": -17.8,
        "Dewpoint_c": -31.8,
        "Wind_Direction": 341,
        "Wind_Speed_kt": 9.9
      },
      {
        "Altitude_ft": 17024,
        "Temp_c": -17.8,
        "Dewpoint_c": -31.9,
        "Wind_Direction": 340,
        "Wind_Speed_kt": 9.9
      },
      {
        "Altitude_ft": 17041,
        "Temp_c": -17.9,
        "Dewpoint_c": -31.9,
        "Wind_Direction": 340,
        "Wind_Speed_kt": 10.1
      },
      {
        "Altitude_ft": 17057,
        "Temp_c": -17.9,
        "Dewpoint_c": -32,
        "Wind_Direction": 339,
        "Wind_Speed_kt": 10.1
      },
      {
        "Altitude_ft": 17077,
        "Temp_c": -18,
        "Dewpoint_c": -32,
        "Wind_Direction": 339,
        "Wind_Speed_kt": 10.1
      },
      {
        "Altitude_ft": 17093,
        "Temp_c": -18,
        "Dewpoint_c": -32,
        "Wind_Direction": 338,
        "Wind_Speed_kt": 10.3
      },
      {
        "Altitude_ft": 17110,
        "Temp_c": -18.1,
        "Dewpoint_c": -32.1,
        "Wind_Direction": 338,
        "Wind_Speed_kt": 10.3
      },
      {
        "Altitude_ft": 17129,
        "Temp_c": -18.1,
        "Dewpoint_c": -32.1,
        "Wind_Direction": 337,
        "Wind_Speed_kt": 10.3
      },
      {
        "Altitude_ft": 17146,
        "Temp_c": -18.2,
        "Dewpoint_c": -32.2,
        "Wind_Direction": 337,
        "Wind_Speed_kt": 10.3
      },
      {
        "Altitude_ft": 17165,
        "Temp_c": -18.2,
        "Dewpoint_c": -32.2,
        "Wind_Direction": 336,
        "Wind_Speed_kt": 10.5
      },
      {
        "Altitude_ft": 17182,
        "Temp_c": -18.3,
        "Dewpoint_c": -32.2,
        "Wind_Direction": 336,
        "Wind_Speed_kt": 10.5
      },
      {
        "Altitude_ft": 17201,
        "Temp_c": -18.3,
        "Dewpoint_c": -32.3,
        "Wind_Direction": 336,
        "Wind_Speed_kt": 10.5
      },
      {
        "Altitude_ft": 17218,
        "Temp_c": -18.4,
        "Dewpoint_c": -32.3,
        "Wind_Direction": 335,
        "Wind_Speed_kt": 10.5
      },
      {
        "Altitude_ft": 17234,
        "Temp_c": -18.4,
        "Dewpoint_c": -32.3,
        "Wind_Direction": 335,
        "Wind_Speed_kt": 10.3
      },
      {
        "Altitude_ft": 17251,
        "Temp_c": -18.5,
        "Dewpoint_c": -32.3,
        "Wind_Direction": 335,
        "Wind_Speed_kt": 10.3
      },
      {
        "Altitude_ft": 17267,
        "Temp_c": -18.5,
        "Dewpoint_c": -32.4,
        "Wind_Direction": 335,
        "Wind_Speed_kt": 10.3
      },
      {
        "Altitude_ft": 17283,
        "Temp_c": -18.6,
        "Dewpoint_c": -32.4,
        "Wind_Direction": 335,
        "Wind_Speed_kt": 10.3
      },
      {
        "Altitude_ft": 17303,
        "Temp_c": -18.6,
        "Dewpoint_c": -32.4,
        "Wind_Direction": 334,
        "Wind_Speed_kt": 10.3
      },
      {
        "Altitude_ft": 17320,
        "Temp_c": -18.6,
        "Dewpoint_c": -32.4,
        "Wind_Direction": 334,
        "Wind_Speed_kt": 10.1
      },
      {
        "Altitude_ft": 17336,
        "Temp_c": -18.7,
        "Dewpoint_c": -32.5,
        "Wind_Direction": 334,
        "Wind_Speed_kt": 10.1
      },
      {
        "Altitude_ft": 17352,
        "Temp_c": -18.7,
        "Dewpoint_c": -32.5,
        "Wind_Direction": 334,
        "Wind_Speed_kt": 10.1
      },
      {
        "Altitude_ft": 17372,
        "Temp_c": -18.8,
        "Dewpoint_c": -32.5,
        "Wind_Direction": 334,
        "Wind_Speed_kt": 10.1
      },
      {
        "Altitude_ft": 17388,
        "Temp_c": -18.8,
        "Dewpoint_c": -32.5,
        "Wind_Direction": 333,
        "Wind_Speed_kt": 9.9
      },
      {
        "Altitude_ft": 17402,
        "Temp_c": -18.8,
        "Dewpoint_c": -32.6,
        "Wind_Direction": 333,
        "Wind_Speed_kt": 9.9
      },
      {
        "Altitude_ft": 17415,
        "Temp_c": -18.9,
        "Dewpoint_c": -32.6,
        "Wind_Direction": 333,
        "Wind_Speed_kt": 9.9
      },
      {
        "Altitude_ft": 17431,
        "Temp_c": -18.9,
        "Dewpoint_c": -32.7,
        "Wind_Direction": 333,
        "Wind_Speed_kt": 9.9
      },
      {
        "Altitude_ft": 17444,
        "Temp_c": -19,
        "Dewpoint_c": -32.7,
        "Wind_Direction": 332,
        "Wind_Speed_kt": 9.9
      },
      {
        "Altitude_ft": 17457,
        "Temp_c": -19,
        "Dewpoint_c": -32.8,
        "Wind_Direction": 332,
        "Wind_Speed_kt": 9.7
      },
      {
        "Altitude_ft": 17470,
        "Temp_c": -19,
        "Dewpoint_c": -32.8,
        "Wind_Direction": 332,
        "Wind_Speed_kt": 9.7
      },
      {
        "Altitude_ft": 17487,
        "Temp_c": -19.1,
        "Dewpoint_c": -32.9,
        "Wind_Direction": 332,
        "Wind_Speed_kt": 9.7
      },
      {
        "Altitude_ft": 17500,
        "Temp_c": -19.1,
        "Dewpoint_c": -32.9,
        "Wind_Direction": 332,
        "Wind_Speed_kt": 9.7
      },
      {
        "Altitude_ft": 17516,
        "Temp_c": -19.1,
        "Dewpoint_c": -33,
        "Wind_Direction": 332,
        "Wind_Speed_kt": 9.7
      },
      {
        "Altitude_ft": 17530,
        "Temp_c": -19.2,
        "Dewpoint_c": -33,
        "Wind_Direction": 331,
        "Wind_Speed_kt": 9.7
      },
      {
        "Altitude_ft": 17546,
        "Temp_c": -19.2,
        "Dewpoint_c": -33.1,
        "Wind_Direction": 331,
        "Wind_Speed_kt": 9.7
      },
      {
        "Altitude_ft": 17559,
        "Temp_c": -19.2,
        "Dewpoint_c": -33.1,
        "Wind_Direction": 331,
        "Wind_Speed_kt": 9.7
      },
      {
        "Altitude_ft": 17572,
        "Temp_c": -19.3,
        "Dewpoint_c": -33.2,
        "Wind_Direction": 331,
        "Wind_Speed_kt": 9.7
      },
      {
        "Altitude_ft": 17589,
        "Temp_c": -19.3,
        "Dewpoint_c": -33.2,
        "Wind_Direction": 331,
        "Wind_Speed_kt": 9.9
      },
      {
        "Altitude_ft": 17605,
        "Temp_c": -19.3,
        "Dewpoint_c": -33.2,
        "Wind_Direction": 331,
        "Wind_Speed_kt": 9.9
      },
      {
        "Altitude_ft": 17618,
        "Temp_c": -19.4,
        "Dewpoint_c": -33.3,
        "Wind_Direction": 331,
        "Wind_Speed_kt": 9.9
      },
      {
        "Altitude_ft": 17635,
        "Temp_c": -19.4,
        "Dewpoint_c": -33.3,
        "Wind_Direction": 331,
        "Wind_Speed_kt": 9.9
      },
      {
        "Altitude_ft": 17648,
        "Temp_c": -19.5,
        "Dewpoint_c": -33.3,
        "Wind_Direction": 331,
        "Wind_Speed_kt": 9.9
      },
      {
        "Altitude_ft": 17661,
        "Temp_c": -19.5,
        "Dewpoint_c": -33.4,
        "Wind_Direction": 331,
        "Wind_Speed_kt": 9.9
      },
      {
        "Altitude_ft": 17674,
        "Temp_c": -19.5,
        "Dewpoint_c": -33.4,
        "Wind_Direction": 331,
        "Wind_Speed_kt": 9.9
      },
      {
        "Altitude_ft": 17690,
        "Temp_c": -19.6,
        "Dewpoint_c": -33.4,
        "Wind_Direction": 331,
        "Wind_Speed_kt": 10.1
      },
      {
        "Altitude_ft": 17703,
        "Temp_c": -19.6,
        "Dewpoint_c": -33.5,
        "Wind_Direction": 331,
        "Wind_Speed_kt": 10.1
      },
      {
        "Altitude_ft": 17717,
        "Temp_c": -19.6,
        "Dewpoint_c": -33.5,
        "Wind_Direction": 331,
        "Wind_Speed_kt": 10.1
      },
      {
        "Altitude_ft": 17733,
        "Temp_c": -19.7,
        "Dewpoint_c": -33.5,
        "Wind_Direction": 331,
        "Wind_Speed_kt": 10.1
      },
      {
        "Altitude_ft": 17746,
        "Temp_c": -19.7,
        "Dewpoint_c": -33.6,
        "Wind_Direction": 331,
        "Wind_Speed_kt": 10.1
      },
      {
        "Altitude_ft": 17759,
        "Temp_c": -19.7,
        "Dewpoint_c": -33.6,
        "Wind_Direction": 331,
        "Wind_Speed_kt": 10.1
      },
      {
        "Altitude_ft": 17776,
        "Temp_c": -19.8,
        "Dewpoint_c": -33.6,
        "Wind_Direction": 331,
        "Wind_Speed_kt": 10.1
      },
      {
        "Altitude_ft": 17789,
        "Temp_c": -19.8,
        "Dewpoint_c": -33.7,
        "Wind_Direction": 331,
        "Wind_Speed_kt": 10.3
      },
      {
        "Altitude_ft": 17802,
        "Temp_c": -19.9,
        "Dewpoint_c": -33.7,
        "Wind_Direction": 331,
        "Wind_Speed_kt": 10.1
      },
      {
        "Altitude_ft": 17815,
        "Temp_c": -19.9,
        "Dewpoint_c": -33.7,
        "Wind_Direction": 331,
        "Wind_Speed_kt": 10.1
      },
      {
        "Altitude_ft": 17825,
        "Temp_c": -19.9,
        "Dewpoint_c": -33.7,
        "Wind_Direction": 331,
        "Wind_Speed_kt": 10.1
      },
      {
        "Altitude_ft": 17838,
        "Temp_c": -20,
        "Dewpoint_c": -33.8,
        "Wind_Direction": 331,
        "Wind_Speed_kt": 10.1
      },
      {
        "Altitude_ft": 17851,
        "Temp_c": -20,
        "Dewpoint_c": -33.8,
        "Wind_Direction": 331,
        "Wind_Speed_kt": 10.1
      },
      {
        "Altitude_ft": 17864,
        "Temp_c": -20,
        "Dewpoint_c": -33.8,
        "Wind_Direction": 331,
        "Wind_Speed_kt": 9.9
      },
      {
        "Altitude_ft": 17877,
        "Temp_c": -20.1,
        "Dewpoint_c": -33.8,
        "Wind_Direction": 331,
        "Wind_Speed_kt": 9.9
      },
      {
        "Altitude_ft": 17890,
        "Temp_c": -20.1,
        "Dewpoint_c": -33.8,
        "Wind_Direction": 331,
        "Wind_Speed_kt": 9.9
      },
      {
        "Altitude_ft": 17900,
        "Temp_c": -20.2,
        "Dewpoint_c": -33.9,
        "Wind_Direction": 331,
        "Wind_Speed_kt": 9.9
      },
      {
        "Altitude_ft": 17913,
        "Temp_c": -20.2,
        "Dewpoint_c": -33.9,
        "Wind_Direction": 331,
        "Wind_Speed_kt": 9.9
      },
      {
        "Altitude_ft": 17927,
        "Temp_c": -20.2,
        "Dewpoint_c": -33.9,
        "Wind_Direction": 332,
        "Wind_Speed_kt": 9.7
      },
      {
        "Altitude_ft": 17940,
        "Temp_c": -20.3,
        "Dewpoint_c": -33.9,
        "Wind_Direction": 332,
        "Wind_Speed_kt": 9.7
      },
      {
        "Altitude_ft": 17953,
        "Temp_c": -20.3,
        "Dewpoint_c": -34,
        "Wind_Direction": 332,
        "Wind_Speed_kt": 9.7
      },
      {
        "Altitude_ft": 17966,
        "Temp_c": -20.3,
        "Dewpoint_c": -34,
        "Wind_Direction": 332,
        "Wind_Speed_kt": 9.7
      },
      {
        "Altitude_ft": 17979,
        "Temp_c": -20.4,
        "Dewpoint_c": -34,
        "Wind_Direction": 332,
        "Wind_Speed_kt": 9.7
      },
      {
        "Altitude_ft": 17992,
        "Temp_c": -20.4,
        "Dewpoint_c": -34.1,
        "Wind_Direction": 332,
        "Wind_Speed_kt": 9.7
      },
      {
        "Altitude_ft": 18005,
        "Temp_c": -20.4,
        "Dewpoint_c": -34.1,
        "Wind_Direction": 332,
        "Wind_Speed_kt": 9.5
      },
      {
        "Altitude_ft": 18018,
        "Temp_c": -20.5,
        "Dewpoint_c": -34.1,
        "Wind_Direction": 332,
        "Wind_Speed_kt": 9.5
      },
      {
        "Altitude_ft": 18031,
        "Temp_c": -20.5,
        "Dewpoint_c": -34.2,
        "Wind_Direction": 332,
        "Wind_Speed_kt": 9.5
      },
      {
        "Altitude_ft": 18045,
        "Temp_c": -20.5,
        "Dewpoint_c": -34.2,
        "Wind_Direction": 332,
        "Wind_Speed_kt": 9.5
      },
      {
        "Altitude_ft": 18054,
        "Temp_c": -20.6,
        "Dewpoint_c": -34.2,
        "Wind_Direction": 332,
        "Wind_Speed_kt": 9.5
      },
      {
        "Altitude_ft": 18068,
        "Temp_c": -20.6,
        "Dewpoint_c": -34.3,
        "Wind_Direction": 332,
        "Wind_Speed_kt": 9.5
      },
      {
        "Altitude_ft": 18081,
        "Temp_c": -20.7,
        "Dewpoint_c": -34.3,
        "Wind_Direction": 333,
        "Wind_Speed_kt": 9.3
      },
      {
        "Altitude_ft": 18094,
        "Temp_c": -20.7,
        "Dewpoint_c": -34.3,
        "Wind_Direction": 333,
        "Wind_Speed_kt": 9.3
      },
      {
        "Altitude_ft": 18107,
        "Temp_c": -20.7,
        "Dewpoint_c": -34.4,
        "Wind_Direction": 333,
        "Wind_Speed_kt": 9.3
      },
      {
        "Altitude_ft": 18120,
        "Temp_c": -20.8,
        "Dewpoint_c": -34.4,
        "Wind_Direction": 333,
        "Wind_Speed_kt": 9.3
      },
      {
        "Altitude_ft": 18133,
        "Temp_c": -20.8,
        "Dewpoint_c": -34.4,
        "Wind_Direction": 333,
        "Wind_Speed_kt": 9.3
      },
      {
        "Altitude_ft": 18150,
        "Temp_c": -20.8,
        "Dewpoint_c": -34.4,
        "Wind_Direction": 333,
        "Wind_Speed_kt": 9.3
      },
      {
        "Altitude_ft": 18159,
        "Temp_c": -20.9,
        "Dewpoint_c": -34.5,
        "Wind_Direction": 333,
        "Wind_Speed_kt": 9.3
      },
      {
        "Altitude_ft": 18173,
        "Temp_c": -20.9,
        "Dewpoint_c": -34.5,
        "Wind_Direction": 333,
        "Wind_Speed_kt": 9.3
      },
      {
        "Altitude_ft": 18186,
        "Temp_c": -20.9,
        "Dewpoint_c": -34.5,
        "Wind_Direction": 333,
        "Wind_Speed_kt": 9.3
      },
      {
        "Altitude_ft": 18199,
        "Temp_c": -21,
        "Dewpoint_c": -34.6,
        "Wind_Direction": 333,
        "Wind_Speed_kt": 9.1
      },
      {
        "Altitude_ft": 18212,
        "Temp_c": -21,
        "Dewpoint_c": -34.6,
        "Wind_Direction": 333,
        "Wind_Speed_kt": 9.1
      },
      {
        "Altitude_ft": 18225,
        "Temp_c": -21.1,
        "Dewpoint_c": -34.6,
        "Wind_Direction": 333,
        "Wind_Speed_kt": 9.1
      },
      {
        "Altitude_ft": 18238,
        "Temp_c": -21.1,
        "Dewpoint_c": -34.6,
        "Wind_Direction": 333,
        "Wind_Speed_kt": 9.1
      },
      {
        "Altitude_ft": 18251,
        "Temp_c": -21.1,
        "Dewpoint_c": -34.7,
        "Wind_Direction": 333,
        "Wind_Speed_kt": 9.1
      },
      {
        "Altitude_ft": 18264,
        "Temp_c": -21.2,
        "Dewpoint_c": -34.7,
        "Wind_Direction": 334,
        "Wind_Speed_kt": 9.1
      },
      {
        "Altitude_ft": 18278,
        "Temp_c": -21.2,
        "Dewpoint_c": -34.7,
        "Wind_Direction": 334,
        "Wind_Speed_kt": 9.1
      },
      {
        "Altitude_ft": 18291,
        "Temp_c": -21.3,
        "Dewpoint_c": -34.8,
        "Wind_Direction": 334,
        "Wind_Speed_kt": 9.1
      },
      {
        "Altitude_ft": 18304,
        "Temp_c": -21.3,
        "Dewpoint_c": -34.8,
        "Wind_Direction": 334,
        "Wind_Speed_kt": 8.9
      },
      {
        "Altitude_ft": 18317,
        "Temp_c": -21.3,
        "Dewpoint_c": -34.8,
        "Wind_Direction": 333,
        "Wind_Speed_kt": 9.1
      },
      {
        "Altitude_ft": 18330,
        "Temp_c": -21.4,
        "Dewpoint_c": -34.8,
        "Wind_Direction": 333,
        "Wind_Speed_kt": 9.1
      },
      {
        "Altitude_ft": 18343,
        "Temp_c": -21.4,
        "Dewpoint_c": -34.8,
        "Wind_Direction": 332,
        "Wind_Speed_kt": 9.1
      },
      {
        "Altitude_ft": 18356,
        "Temp_c": -21.4,
        "Dewpoint_c": -34.8,
        "Wind_Direction": 332,
        "Wind_Speed_kt": 9.1
      },
      {
        "Altitude_ft": 18369,
        "Temp_c": -21.5,
        "Dewpoint_c": -34.8,
        "Wind_Direction": 332,
        "Wind_Speed_kt": 9.1
      },
      {
        "Altitude_ft": 18383,
        "Temp_c": -21.5,
        "Dewpoint_c": -34.8,
        "Wind_Direction": 331,
        "Wind_Speed_kt": 9.3
      },
      {
        "Altitude_ft": 18392,
        "Temp_c": -21.5,
        "Dewpoint_c": -34.8,
        "Wind_Direction": 331,
        "Wind_Speed_kt": 9.3
      },
      {
        "Altitude_ft": 18406,
        "Temp_c": -21.6,
        "Dewpoint_c": -34.8,
        "Wind_Direction": 331,
        "Wind_Speed_kt": 9.3
      },
      {
        "Altitude_ft": 18419,
        "Temp_c": -21.6,
        "Dewpoint_c": -34.8,
        "Wind_Direction": 330,
        "Wind_Speed_kt": 9.3
      },
      {
        "Altitude_ft": 18428,
        "Temp_c": -21.7,
        "Dewpoint_c": -34.8,
        "Wind_Direction": 330,
        "Wind_Speed_kt": 9.5
      },
      {
        "Altitude_ft": 18442,
        "Temp_c": -21.7,
        "Dewpoint_c": -34.8,
        "Wind_Direction": 329,
        "Wind_Speed_kt": 9.5
      },
      {
        "Altitude_ft": 18455,
        "Temp_c": -21.7,
        "Dewpoint_c": -34.8,
        "Wind_Direction": 329,
        "Wind_Speed_kt": 9.5
      },
      {
        "Altitude_ft": 18468,
        "Temp_c": -21.8,
        "Dewpoint_c": -34.8,
        "Wind_Direction": 329,
        "Wind_Speed_kt": 9.5
      },
      {
        "Altitude_ft": 18478,
        "Temp_c": -21.8,
        "Dewpoint_c": -34.8,
        "Wind_Direction": 328,
        "Wind_Speed_kt": 9.5
      },
      {
        "Altitude_ft": 18491,
        "Temp_c": -21.8,
        "Dewpoint_c": -34.8,
        "Wind_Direction": 328,
        "Wind_Speed_kt": 9.7
      },
      {
        "Altitude_ft": 18504,
        "Temp_c": -21.9,
        "Dewpoint_c": -34.8,
        "Wind_Direction": 328,
        "Wind_Speed_kt": 9.7
      },
      {
        "Altitude_ft": 18514,
        "Temp_c": -21.9,
        "Dewpoint_c": -34.9,
        "Wind_Direction": 327,
        "Wind_Speed_kt": 9.7
      },
      {
        "Altitude_ft": 18527,
        "Temp_c": -21.9,
        "Dewpoint_c": -34.9,
        "Wind_Direction": 327,
        "Wind_Speed_kt": 9.7
      },
      {
        "Altitude_ft": 18540,
        "Temp_c": -22,
        "Dewpoint_c": -34.9,
        "Wind_Direction": 326,
        "Wind_Speed_kt": 9.9
      },
      {
        "Altitude_ft": 18550,
        "Temp_c": -22,
        "Dewpoint_c": -34.9,
        "Wind_Direction": 326,
        "Wind_Speed_kt": 9.9
      },
      {
        "Altitude_ft": 18563,
        "Temp_c": -22,
        "Dewpoint_c": -34.9,
        "Wind_Direction": 326,
        "Wind_Speed_kt": 9.9
      },
      {
        "Altitude_ft": 18576,
        "Temp_c": -22.1,
        "Dewpoint_c": -34.9,
        "Wind_Direction": 326,
        "Wind_Speed_kt": 9.7
      },
      {
        "Altitude_ft": 18589,
        "Temp_c": -22.1,
        "Dewpoint_c": -34.9,
        "Wind_Direction": 326,
        "Wind_Speed_kt": 9.7
      },
      {
        "Altitude_ft": 18599,
        "Temp_c": -22.2,
        "Dewpoint_c": -35,
        "Wind_Direction": 326,
        "Wind_Speed_kt": 9.7
      },
      {
        "Altitude_ft": 18612,
        "Temp_c": -22.2,
        "Dewpoint_c": -35,
        "Wind_Direction": 326,
        "Wind_Speed_kt": 9.7
      },
      {
        "Altitude_ft": 18625,
        "Temp_c": -22.2,
        "Dewpoint_c": -35,
        "Wind_Direction": 326,
        "Wind_Speed_kt": 9.5
      },
      {
        "Altitude_ft": 18638,
        "Temp_c": -22.3,
        "Dewpoint_c": -35,
        "Wind_Direction": 326,
        "Wind_Speed_kt": 9.5
      },
      {
        "Altitude_ft": 18652,
        "Temp_c": -22.3,
        "Dewpoint_c": -35,
        "Wind_Direction": 326,
        "Wind_Speed_kt": 9.5
      },
      {
        "Altitude_ft": 18665,
        "Temp_c": -22.3,
        "Dewpoint_c": -35.1,
        "Wind_Direction": 326,
        "Wind_Speed_kt": 9.5
      },
      {
        "Altitude_ft": 18678,
        "Temp_c": -22.4,
        "Dewpoint_c": -35.1,
        "Wind_Direction": 326,
        "Wind_Speed_kt": 9.3
      },
      {
        "Altitude_ft": 18691,
        "Temp_c": -22.4,
        "Dewpoint_c": -35.1,
        "Wind_Direction": 326,
        "Wind_Speed_kt": 9.3
      },
      {
        "Altitude_ft": 18704,
        "Temp_c": -22.5,
        "Dewpoint_c": -35.2,
        "Wind_Direction": 326,
        "Wind_Speed_kt": 9.3
      },
      {
        "Altitude_ft": 18717,
        "Temp_c": -22.5,
        "Dewpoint_c": -35.2,
        "Wind_Direction": 326,
        "Wind_Speed_kt": 9.3
      },
      {
        "Altitude_ft": 18730,
        "Temp_c": -22.5,
        "Dewpoint_c": -35.2,
        "Wind_Direction": 326,
        "Wind_Speed_kt": 9.1
      },
      {
        "Altitude_ft": 18743,
        "Temp_c": -22.6,
        "Dewpoint_c": -35.2,
        "Wind_Direction": 326,
        "Wind_Speed_kt": 9.1
      },
      {
        "Altitude_ft": 18753,
        "Temp_c": -22.6,
        "Dewpoint_c": -35.3,
        "Wind_Direction": 326,
        "Wind_Speed_kt": 9.1
      },
      {
        "Altitude_ft": 18766,
        "Temp_c": -22.7,
        "Dewpoint_c": -35.3,
        "Wind_Direction": 326,
        "Wind_Speed_kt": 9.1
      },
      {
        "Altitude_ft": 18780,
        "Temp_c": -22.7,
        "Dewpoint_c": -35.3,
        "Wind_Direction": 326,
        "Wind_Speed_kt": 8.9
      },
      {
        "Altitude_ft": 18793,
        "Temp_c": -22.7,
        "Dewpoint_c": -35.4,
        "Wind_Direction": 326,
        "Wind_Speed_kt": 8.9
      },
      {
        "Altitude_ft": 18806,
        "Temp_c": -22.8,
        "Dewpoint_c": -35.4,
        "Wind_Direction": 326,
        "Wind_Speed_kt": 8.9
      },
      {
        "Altitude_ft": 18819,
        "Temp_c": -22.8,
        "Dewpoint_c": -35.4,
        "Wind_Direction": 326,
        "Wind_Speed_kt": 8.9
      },
      {
        "Altitude_ft": 18832,
        "Temp_c": -22.8,
        "Dewpoint_c": -35.4,
        "Wind_Direction": 326,
        "Wind_Speed_kt": 8.9
      },
      {
        "Altitude_ft": 18845,
        "Temp_c": -22.9,
        "Dewpoint_c": -35.4,
        "Wind_Direction": 326,
        "Wind_Speed_kt": 8.9
      },
      {
        "Altitude_ft": 18862,
        "Temp_c": -22.9,
        "Dewpoint_c": -35.5,
        "Wind_Direction": 327,
        "Wind_Speed_kt": 8.9
      },
      {
        "Altitude_ft": 18875,
        "Temp_c": -23,
        "Dewpoint_c": -35.5,
        "Wind_Direction": 327,
        "Wind_Speed_kt": 8.9
      },
      {
        "Altitude_ft": 18888,
        "Temp_c": -23,
        "Dewpoint_c": -35.5,
        "Wind_Direction": 327,
        "Wind_Speed_kt": 8.7
      },
      {
        "Altitude_ft": 18904,
        "Temp_c": -23,
        "Dewpoint_c": -35.5,
        "Wind_Direction": 327,
        "Wind_Speed_kt": 8.7
      },
      {
        "Altitude_ft": 18917,
        "Temp_c": -23.1,
        "Dewpoint_c": -35.5,
        "Wind_Direction": 327,
        "Wind_Speed_kt": 8.7
      },
      {
        "Altitude_ft": 18930,
        "Temp_c": -23.1,
        "Dewpoint_c": -35.5,
        "Wind_Direction": 327,
        "Wind_Speed_kt": 8.7
      },
      {
        "Altitude_ft": 18947,
        "Temp_c": -23.1,
        "Dewpoint_c": -35.5,
        "Wind_Direction": 328,
        "Wind_Speed_kt": 8.7
      },
      {
        "Altitude_ft": 18960,
        "Temp_c": -23.2,
        "Dewpoint_c": -35.6,
        "Wind_Direction": 328,
        "Wind_Speed_kt": 8.7
      },
      {
        "Altitude_ft": 18973,
        "Temp_c": -23.2,
        "Dewpoint_c": -35.6,
        "Wind_Direction": 328,
        "Wind_Speed_kt": 8.7
      },
      {
        "Altitude_ft": 18986,
        "Temp_c": -23.3,
        "Dewpoint_c": -35.6,
        "Wind_Direction": 328,
        "Wind_Speed_kt": 8.7
      },
      {
        "Altitude_ft": 18999,
        "Temp_c": -23.3,
        "Dewpoint_c": -35.6,
        "Wind_Direction": 328,
        "Wind_Speed_kt": 8.7
      },
      {
        "Altitude_ft": 19012,
        "Temp_c": -23.3,
        "Dewpoint_c": -35.6,
        "Wind_Direction": 328,
        "Wind_Speed_kt": 8.7
      },
      {
        "Altitude_ft": 19026,
        "Temp_c": -23.4,
        "Dewpoint_c": -35.7,
        "Wind_Direction": 329,
        "Wind_Speed_kt": 8.7
      },
      {
        "Altitude_ft": 19039,
        "Temp_c": -23.4,
        "Dewpoint_c": -35.7,
        "Wind_Direction": 329,
        "Wind_Speed_kt": 8.7
      },
      {
        "Altitude_ft": 19052,
        "Temp_c": -23.5,
        "Dewpoint_c": -35.7,
        "Wind_Direction": 329,
        "Wind_Speed_kt": 8.6
      },
      {
        "Altitude_ft": 19065,
        "Temp_c": -23.5,
        "Dewpoint_c": -35.7,
        "Wind_Direction": 329,
        "Wind_Speed_kt": 8.6
      },
      {
        "Altitude_ft": 19078,
        "Temp_c": -23.5,
        "Dewpoint_c": -35.8,
        "Wind_Direction": 329,
        "Wind_Speed_kt": 8.6
      },
      {
        "Altitude_ft": 19091,
        "Temp_c": -23.6,
        "Dewpoint_c": -35.8,
        "Wind_Direction": 329,
        "Wind_Speed_kt": 8.6
      },
      {
        "Altitude_ft": 19104,
        "Temp_c": -23.6,
        "Dewpoint_c": -35.8,
        "Wind_Direction": 329,
        "Wind_Speed_kt": 8.6
      },
      {
        "Altitude_ft": 19117,
        "Temp_c": -23.6,
        "Dewpoint_c": -35.8,
        "Wind_Direction": 329,
        "Wind_Speed_kt": 8.6
      },
      {
        "Altitude_ft": 19131,
        "Temp_c": -23.7,
        "Dewpoint_c": -35.9,
        "Wind_Direction": 329,
        "Wind_Speed_kt": 8.6
      },
      {
        "Altitude_ft": 19144,
        "Temp_c": -23.7,
        "Dewpoint_c": -35.9,
        "Wind_Direction": 329,
        "Wind_Speed_kt": 8.6
      },
      {
        "Altitude_ft": 19157,
        "Temp_c": -23.8,
        "Dewpoint_c": -35.9,
        "Wind_Direction": 329,
        "Wind_Speed_kt": 8.6
      },
      {
        "Altitude_ft": 19170,
        "Temp_c": -23.8,
        "Dewpoint_c": -35.9,
        "Wind_Direction": 329,
        "Wind_Speed_kt": 8.6
      },
      {
        "Altitude_ft": 19183,
        "Temp_c": -23.8,
        "Dewpoint_c": -35.9,
        "Wind_Direction": 329,
        "Wind_Speed_kt": 8.6
      },
      {
        "Altitude_ft": 19196,
        "Temp_c": -23.9,
        "Dewpoint_c": -35.9,
        "Wind_Direction": 329,
        "Wind_Speed_kt": 8.6
      },
      {
        "Altitude_ft": 19209,
        "Temp_c": -23.9,
        "Dewpoint_c": -36,
        "Wind_Direction": 329,
        "Wind_Speed_kt": 8.6
      },
      {
        "Altitude_ft": 19222,
        "Temp_c": -23.9,
        "Dewpoint_c": -36,
        "Wind_Direction": 329,
        "Wind_Speed_kt": 8.6
      },
      {
        "Altitude_ft": 19236,
        "Temp_c": -24,
        "Dewpoint_c": -36,
        "Wind_Direction": 329,
        "Wind_Speed_kt": 8.6
      },
      {
        "Altitude_ft": 19249,
        "Temp_c": -24,
        "Dewpoint_c": -36,
        "Wind_Direction": 329,
        "Wind_Speed_kt": 8.6
      },
      {
        "Altitude_ft": 19262,
        "Temp_c": -24.1,
        "Dewpoint_c": -36,
        "Wind_Direction": 329,
        "Wind_Speed_kt": 8.6
      },
      {
        "Altitude_ft": 19275,
        "Temp_c": -24.1,
        "Dewpoint_c": -36,
        "Wind_Direction": 329,
        "Wind_Speed_kt": 8.6
      },
      {
        "Altitude_ft": 19288,
        "Temp_c": -24.1,
        "Dewpoint_c": -36,
        "Wind_Direction": 329,
        "Wind_Speed_kt": 8.6
      },
      {
        "Altitude_ft": 19301,
        "Temp_c": -24.2,
        "Dewpoint_c": -36.1,
        "Wind_Direction": 329,
        "Wind_Speed_kt": 8.6
      },
      {
        "Altitude_ft": 19314,
        "Temp_c": -24.2,
        "Dewpoint_c": -36.1,
        "Wind_Direction": 329,
        "Wind_Speed_kt": 8.6
      },
      {
        "Altitude_ft": 19327,
        "Temp_c": -24.3,
        "Dewpoint_c": -36.1,
        "Wind_Direction": 329,
        "Wind_Speed_kt": 8.6
      },
      {
        "Altitude_ft": 19337,
        "Temp_c": -24.3,
        "Dewpoint_c": -36.1,
        "Wind_Direction": 330,
        "Wind_Speed_kt": 8.6
      },
      {
        "Altitude_ft": 19350,
        "Temp_c": -24.3,
        "Dewpoint_c": -36.1,
        "Wind_Direction": 330,
        "Wind_Speed_kt": 8.6
      },
      {
        "Altitude_ft": 19364,
        "Temp_c": -24.4,
        "Dewpoint_c": -36.2,
        "Wind_Direction": 330,
        "Wind_Speed_kt": 8.6
      },
      {
        "Altitude_ft": 19377,
        "Temp_c": -24.4,
        "Dewpoint_c": -36.2,
        "Wind_Direction": 330,
        "Wind_Speed_kt": 8.6
      },
      {
        "Altitude_ft": 19390,
        "Temp_c": -24.4,
        "Dewpoint_c": -36.2,
        "Wind_Direction": 330,
        "Wind_Speed_kt": 8.6
      },
      {
        "Altitude_ft": 19403,
        "Temp_c": -24.5,
        "Dewpoint_c": -36.2,
        "Wind_Direction": 330,
        "Wind_Speed_kt": 8.6
      },
      {
        "Altitude_ft": 19416,
        "Temp_c": -24.5,
        "Dewpoint_c": -36.3,
        "Wind_Direction": 331,
        "Wind_Speed_kt": 8.6
      },
      {
        "Altitude_ft": 19432,
        "Temp_c": -24.6,
        "Dewpoint_c": -36.3,
        "Wind_Direction": 331,
        "Wind_Speed_kt": 8.6
      },
      {
        "Altitude_ft": 19446,
        "Temp_c": -24.6,
        "Dewpoint_c": -36.3,
        "Wind_Direction": 331,
        "Wind_Speed_kt": 8.6
      },
      {
        "Altitude_ft": 19459,
        "Temp_c": -24.6,
        "Dewpoint_c": -36.3,
        "Wind_Direction": 331,
        "Wind_Speed_kt": 8.6
      },
      {
        "Altitude_ft": 19472,
        "Temp_c": -24.7,
        "Dewpoint_c": -36.4,
        "Wind_Direction": 331,
        "Wind_Speed_kt": 8.7
      },
      {
        "Altitude_ft": 19485,
        "Temp_c": -24.7,
        "Dewpoint_c": -36.4,
        "Wind_Direction": 332,
        "Wind_Speed_kt": 8.7
      },
      {
        "Altitude_ft": 19498,
        "Temp_c": -24.8,
        "Dewpoint_c": -36.4,
        "Wind_Direction": 332,
        "Wind_Speed_kt": 8.7
      },
      {
        "Altitude_ft": 19514,
        "Temp_c": -24.8,
        "Dewpoint_c": -36.4,
        "Wind_Direction": 332,
        "Wind_Speed_kt": 8.7
      },
      {
        "Altitude_ft": 19528,
        "Temp_c": -24.8,
        "Dewpoint_c": -36.5,
        "Wind_Direction": 332,
        "Wind_Speed_kt": 8.7
      },
      {
        "Altitude_ft": 19541,
        "Temp_c": -24.9,
        "Dewpoint_c": -36.5,
        "Wind_Direction": 332,
        "Wind_Speed_kt": 8.7
      },
      {
        "Altitude_ft": 19554,
        "Temp_c": -24.9,
        "Dewpoint_c": -36.5,
        "Wind_Direction": 332,
        "Wind_Speed_kt": 8.7
      },
      {
        "Altitude_ft": 19570,
        "Temp_c": -25,
        "Dewpoint_c": -36.6,
        "Wind_Direction": 333,
        "Wind_Speed_kt": 8.7
      },
      {
        "Altitude_ft": 19583,
        "Temp_c": -25,
        "Dewpoint_c": -36.6,
        "Wind_Direction": 333,
        "Wind_Speed_kt": 8.7
      },
      {
        "Altitude_ft": 19600,
        "Temp_c": -25,
        "Dewpoint_c": -36.6,
        "Wind_Direction": 333,
        "Wind_Speed_kt": 8.7
      },
      {
        "Altitude_ft": 19613,
        "Temp_c": -25.1,
        "Dewpoint_c": -36.7,
        "Wind_Direction": 333,
        "Wind_Speed_kt": 8.9
      },
      {
        "Altitude_ft": 19626,
        "Temp_c": -25.1,
        "Dewpoint_c": -36.7,
        "Wind_Direction": 333,
        "Wind_Speed_kt": 8.9
      },
      {
        "Altitude_ft": 19639,
        "Temp_c": -25.1,
        "Dewpoint_c": -36.7,
        "Wind_Direction": 333,
        "Wind_Speed_kt": 8.9
      },
      {
        "Altitude_ft": 19652,
        "Temp_c": -25.2,
        "Dewpoint_c": -36.7,
        "Wind_Direction": 333,
        "Wind_Speed_kt": 8.9
      },
      {
        "Altitude_ft": 19665,
        "Temp_c": -25.2,
        "Dewpoint_c": -36.8,
        "Wind_Direction": 333,
        "Wind_Speed_kt": 8.9
      },
      {
        "Altitude_ft": 19678,
        "Temp_c": -25.2,
        "Dewpoint_c": -36.8,
        "Wind_Direction": 333,
        "Wind_Speed_kt": 8.9
      },
      {
        "Altitude_ft": 19688,
        "Temp_c": -25.3,
        "Dewpoint_c": -36.8,
        "Wind_Direction": 333,
        "Wind_Speed_kt": 9.1
      },
      {
        "Altitude_ft": 19701,
        "Temp_c": -25.3,
        "Dewpoint_c": -36.8,
        "Wind_Direction": 333,
        "Wind_Speed_kt": 9.1
      },
      {
        "Altitude_ft": 19715,
        "Temp_c": -25.3,
        "Dewpoint_c": -36.9,
        "Wind_Direction": 333,
        "Wind_Speed_kt": 9.1
      },
      {
        "Altitude_ft": 19728,
        "Temp_c": -25.4,
        "Dewpoint_c": -36.9,
        "Wind_Direction": 334,
        "Wind_Speed_kt": 9.1
      },
      {
        "Altitude_ft": 19741,
        "Temp_c": -25.4,
        "Dewpoint_c": -36.9,
        "Wind_Direction": 334,
        "Wind_Speed_kt": 9.1
      },
      {
        "Altitude_ft": 19754,
        "Temp_c": -25.4,
        "Dewpoint_c": -36.9,
        "Wind_Direction": 334,
        "Wind_Speed_kt": 9.3
      },
      {
        "Altitude_ft": 19767,
        "Temp_c": -25.5,
        "Dewpoint_c": -37,
        "Wind_Direction": 334,
        "Wind_Speed_kt": 9.3
      },
      {
        "Altitude_ft": 19780,
        "Temp_c": -25.5,
        "Dewpoint_c": -37,
        "Wind_Direction": 334,
        "Wind_Speed_kt": 9.3
      },
      {
        "Altitude_ft": 19797,
        "Temp_c": -25.6,
        "Dewpoint_c": -37,
        "Wind_Direction": 334,
        "Wind_Speed_kt": 9.3
      },
      {
        "Altitude_ft": 19810,
        "Temp_c": -25.6,
        "Dewpoint_c": -37,
        "Wind_Direction": 334,
        "Wind_Speed_kt": 9.3
      },
      {
        "Altitude_ft": 19823,
        "Temp_c": -25.6,
        "Dewpoint_c": -37.1,
        "Wind_Direction": 334,
        "Wind_Speed_kt": 9.3
      },
      {
        "Altitude_ft": 19836,
        "Temp_c": -25.7,
        "Dewpoint_c": -37.1,
        "Wind_Direction": 334,
        "Wind_Speed_kt": 9.5
      },
      {
        "Altitude_ft": 19852,
        "Temp_c": -25.7,
        "Dewpoint_c": -37.1,
        "Wind_Direction": 334,
        "Wind_Speed_kt": 9.5
      },
      {
        "Altitude_ft": 19869,
        "Temp_c": -25.8,
        "Dewpoint_c": -37.2,
        "Wind_Direction": 334,
        "Wind_Speed_kt": 9.5
      },
      {
        "Altitude_ft": 19885,
        "Temp_c": -25.8,
        "Dewpoint_c": -37.2,
        "Wind_Direction": 334,
        "Wind_Speed_kt": 9.5
      },
      {
        "Altitude_ft": 19902,
        "Temp_c": -25.9,
        "Dewpoint_c": -37.2,
        "Wind_Direction": 334,
        "Wind_Speed_kt": 9.5
      },
      {
        "Altitude_ft": 19918,
        "Temp_c": -25.9,
        "Dewpoint_c": -37.2,
        "Wind_Direction": 334,
        "Wind_Speed_kt": 9.5
      },
      {
        "Altitude_ft": 19931,
        "Temp_c": -25.9,
        "Dewpoint_c": -37.2,
        "Wind_Direction": 334,
        "Wind_Speed_kt": 9.7
      },
      {
        "Altitude_ft": 19944,
        "Temp_c": -26,
        "Dewpoint_c": -37.3,
        "Wind_Direction": 334,
        "Wind_Speed_kt": 9.7
      },
      {
        "Altitude_ft": 19957,
        "Temp_c": -26,
        "Dewpoint_c": -37.3,
        "Wind_Direction": 334,
        "Wind_Speed_kt": 9.7
      },
      {
        "Altitude_ft": 19970,
        "Temp_c": -26,
        "Dewpoint_c": -37.3,
        "Wind_Direction": 334,
        "Wind_Speed_kt": 9.7
      },
      {
        "Altitude_ft": 19984,
        "Temp_c": -26.1,
        "Dewpoint_c": -37.3,
        "Wind_Direction": 334,
        "Wind_Speed_kt": 9.7
      },
      {
        "Altitude_ft": 19997,
        "Temp_c": -26.1,
        "Dewpoint_c": -37.3,
        "Wind_Direction": 333,
        "Wind_Speed_kt": 9.7
      },
      {
        "Altitude_ft": 20010,
        "Temp_c": -26.1,
        "Dewpoint_c": -37.3,
        "Wind_Direction": 333,
        "Wind_Speed_kt": 9.7
      }
    ]
  },
  "windMapScreenshotMetadata": {
    "kind": "storage#object",
    "id": "wasatch-wind-static/wind-map-save.png/1776276029352518",
    "selfLink": "https://www.googleapis.com/storage/v1/b/wasatch-wind-static/o/wind-map-save.png",
    "mediaLink": "https://storage.googleapis.com/download/storage/v1/b/wasatch-wind-static/o/wind-map-save.png?generation=1776276029352518&alt=media",
    "name": "wind-map-save.png",
    "bucket": "wasatch-wind-static",
    "generation": "1776276029352518",
    "metageneration": "2",
    "contentType": "image/png",
    "storageClass": "STANDARD",
    "size": "890545",
    "md5Hash": "7LWtvKieL/Q2vIDx16Rlyw==",
    "crc32c": "kTBTEw==",
    "etag": "CMbUgu638JMDEAI=",
    "timeCreated": "2026-04-15T18:00:29.365Z",
    "updated": "2026-04-15T18:00:29.570Z",
    "timeStorageClassUpdated": "2026-04-15T18:00:29.365Z",
    "timeFinalized": "2026-04-15T18:00:29.365Z"
  },
  "openMeteo": {
    "latitude": 40.764416,
    "longitude": -111.981255,
    "generationtime_ms": 7.674574851989746,
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
        "2026-04-15T12:00",
        "2026-04-15T13:00",
        "2026-04-15T14:00",
        "2026-04-15T15:00",
        "2026-04-15T16:00",
        "2026-04-15T17:00",
        "2026-04-15T18:00",
        "2026-04-15T19:00",
        "2026-04-15T20:00",
        "2026-04-15T21:00",
        "2026-04-15T22:00",
        "2026-04-15T23:00"
      ],
      "geopotential_height_875hPa": [
        1220,
        1209,
        1204,
        1204,
        1196,
        1181,
        1176,
        1173,
        1175,
        1176,
        1177,
        1177
      ],
      "winddirection_875hPa": [
        202,
        209,
        219,
        258,
        253,
        237,
        231,
        235,
        243,
        238,
        247,
        232
      ],
      "windspeed_875hPa": [
        11.4,
        10.6,
        11.2,
        12.8,
        12.8,
        12.3,
        9.8,
        8.6,
        7.9,
        9.6,
        7,
        4.4
      ],
      "geopotential_height_850hPa": [
        1465,
        1455,
        1451,
        1452,
        1443,
        1429,
        1425,
        1422,
        1423,
        1424,
        1424,
        1424
      ],
      "winddirection_850hPa": [
        200,
        207,
        219,
        258,
        251,
        236,
        229,
        237,
        249,
        242,
        256,
        258
      ],
      "windspeed_850hPa": [
        14.4,
        13.3,
        13.9,
        15.9,
        16.2,
        15.7,
        13.5,
        15.2,
        17.3,
        20.1,
        15.5,
        10.7
      ],
      "geopotential_height_825hPa": [
        1714,
        1706,
        1703,
        1705,
        1697,
        1683,
        1679,
        1677,
        1678,
        1678,
        1678,
        1677
      ],
      "winddirection_825hPa": [
        200,
        208,
        219,
        255,
        249,
        235,
        230,
        237,
        251,
        248,
        259,
        269
      ],
      "windspeed_825hPa": [
        15.5,
        14.7,
        15.6,
        17.2,
        17.8,
        17.7,
        16,
        19.7,
        24.1,
        26.8,
        21.1,
        17.2
      ],
      "geopotential_height_800hPa": [
        1970,
        1962,
        1961,
        1963,
        1955,
        1943,
        1939,
        1937,
        1938,
        1938,
        1937,
        1936
      ],
      "winddirection_800hPa": [
        205,
        209,
        218,
        251,
        246,
        235,
        230,
        237,
        251,
        250,
        259,
        273
      ],
      "windspeed_800hPa": [
        15.4,
        15.6,
        17,
        18.1,
        18.8,
        19.4,
        17.9,
        22,
        26.9,
        30.8,
        24.1,
        21.1
      ],
      "geopotential_height_775hPa": [
        2231,
        2224,
        2224,
        2227,
        2220,
        2208,
        2205,
        2204,
        2204,
        2204,
        2202,
        2201
      ],
      "winddirection_775hPa": [
        217,
        213,
        219,
        247,
        243,
        235,
        230,
        236,
        250,
        250,
        256,
        272
      ],
      "windspeed_775hPa": [
        14.7,
        16.3,
        18.1,
        18.9,
        19.9,
        20.8,
        19.5,
        23.5,
        28.9,
        32.8,
        25.9,
        24.2
      ],
      "geopotential_height_750hPa": [
        2498,
        2493,
        2494,
        2497,
        2491,
        2479,
        2477,
        2476,
        2477,
        2476,
        2473,
        2472
      ],
      "winddirection_750hPa": [
        229,
        219,
        221,
        241,
        239,
        234,
        232,
        236,
        247,
        248,
        253,
        269
      ],
      "windspeed_750hPa": [
        14.6,
        16.9,
        19.3,
        19.7,
        20.8,
        21.7,
        21.1,
        25,
        30.2,
        33.7,
        27.7,
        25.8
      ],
      "geopotential_height_700hPa": [
        3053,
        3050,
        3053,
        3058,
        3053,
        3042,
        3042,
        3042,
        3043,
        3041,
        3035,
        3034
      ],
      "winddirection_700hPa": [
        245,
        234,
        228,
        234,
        233,
        235,
        234,
        236,
        243,
        246,
        249,
        260
      ],
      "windspeed_700hPa": [
        17.1,
        18.5,
        20.8,
        21,
        22.3,
        23.5,
        23.2,
        26.6,
        31,
        33.5,
        30.5,
        27
      ],
      "geopotential_height_625hPa": [
        3943,
        3942,
        3948,
        3956,
        3952,
        3944,
        3945,
        3947,
        3948,
        3945,
        3936,
        3934
      ],
      "winddirection_625hPa": [
        254,
        248,
        237,
        236,
        230,
        237,
        239,
        235,
        238,
        242,
        248,
        246
      ],
      "windspeed_625hPa": [
        26.4,
        24.9,
        24.2,
        23.4,
        24.1,
        26.5,
        27.1,
        29.8,
        31.5,
        31.6,
        34.6,
        34.6
      ],
      "wind_direction_10m": [
        187,
        185,
        225,
        255,
        252,
        236,
        211,
        251,
        240,
        288,
        277,
        126
      ],
      "wind_speed_10m": [
        15.6,
        14.4,
        10.1,
        13.5,
        14.4,
        12.1,
        10.4,
        8.8,
        6.7,
        8,
        5.9,
        4.2
      ],
      "winddirection_9000": [
        220,
        220,
        220,
        230,
        230,
        230,
        230,
        230,
        230,
        230,
        230,
        230
      ],
      "windspeed_9000": [
        21,
        21,
        21,
        29,
        29,
        29,
        29,
        29,
        29,
        29,
        29,
        29
      ],
      "winddirection_12000": [
        240,
        240,
        240,
        230,
        230,
        230,
        230,
        230,
        230,
        230,
        230,
        230
      ],
      "windspeed_12000": [
        28,
        28,
        28,
        35,
        35,
        35,
        35,
        35,
        35,
        35,
        35,
        35
      ],
      "winddirection_18000": [
        270,
        270,
        270,
        250,
        250,
        250,
        250,
        250,
        250,
        250,
        250,
        250
      ],
      "windspeed_18000": [
        35,
        35,
        35,
        48,
        48,
        48,
        48,
        48,
        48,
        48,
        48,
        48
      ]
    },
    "daily_units": {
      "time": "iso8601",
      "sunset": "iso8601",
      "temperature_2m_max": "°F"
    },
    "daily": {
      "time": [
        "2026-04-15"
      ],
      "sunset": [
        "2026-04-15T20:07"
      ],
      "temperature_2m_max": [
        70
      ]
    }
  }
}