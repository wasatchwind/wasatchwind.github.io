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
const data = {
  "areaForecast": {
    "@context": {
      "@version": "1.1",
      "@vocab": "https://api.weather.gov/ontology#"
    },
    "@id": "https://api.weather.gov/products/6f5aa4c8-cd10-4087-a7ac-1511dd65df6b",
    "id": "6f5aa4c8-cd10-4087-a7ac-1511dd65df6b",
    "wmoCollectiveId": "FXUS65",
    "issuingOffice": "KSLC",
    "issuanceTime": "2026-04-20T18:47:00+00:00",
    "productCode": "AFD",
    "productName": "Area Forecast Discussion",
    "productText": "\n000\nFXUS65 KSLC 201847\nAFDSLC\n\nArea Forecast Discussion\nNational Weather Service Salt Lake City UT\n1247 PM MDT Mon Apr 20 2026\n\n.KEY MESSAGES...\n\n- Anomalous heat persists with daytime highs generally 10 to 20\n  degrees above normal through Tuesday.\n\n- Strong southerly winds develop on Tuesday, particularly across\n  the western valleys, with strong winds persisting across the\n  eastern valleys on Wednesday.\n  \n- An unsettled pattern develops by Wednesday as a trough and\n  associated cold front move in with precipitation confined to\n  northern Utah.\n\n- Freezing temperatures will return to more rural valley locations\n  Thursday through Saturday.\n\n&&\n\n.DISCUSSION...Unseasonably warm weather today and tomorrow with\ntemperatures 10 (southern Utah) to 20 (northern Utah/SW Wyoming) \ndegrees above normal is a result of a brief ridge building into\nthe area. A closed low is currently moving widespread\nprecipitation onshore to northern California. This low will \ncontinue to move inland and bring strong southerly winds ahead of \na cold front that will usher in cooler and wetter weather into \nthe area by midweek. This closed low will phase back into the \nnorthern jet as it pushes through our area which will keep the \nmean trough axis positioned to our northeast. This positioning \nwill keep a cool and unsettled pattern persisting as we stay close\nenough to the trough axis to get skirted by shortwaves rotating \naround the periphery of the trough.\n\nDeep southwesterly flow will increase ahead of a frontal passage\nassociated with the aforementioned trough. Looking to our west\nacross central Nevada winds are currently gusting in the 30s and\nlow 40s. This will be similar to what our western valleys see\ntomorrow, with a 50-60% chance of seeing gusts up to 45 mph across\nthe western valleys of Utah. As this trough moves through on\nWednesday winds will gradually transition to more of a westerly\ncomponent from west to east. This transition holds off until late\nThursday for areas across eastern Utah so the southerly wind gusts\nwill remain elevated across the eastern valleys on Wednesday,\nparticularly for the Uinta Basin and Castle Country where there\nwill be a medium (40%) chance of advisory level winds.\n\nPrecipitation will spread into northern Utah by midday on\nWednesday as flow aloft transitions to westerly behind a cold\nfront. Snow levels will quickly drop to 6000-7000 feet behind the\nfront with rain across valley floors. This precipitation will\ngenerally be light and primarily from Utah county northward. The \nterrain that is favored in westerly flow could see some enhanced \ntotals. QPF totals (25th-75th percentile) range from 0.25 inches \nto 0.75 inches across the northern valleys with 0.5 to 1.2 inches \nacross the mountains with locally higher amounts across westerly \nfacing aspects. The high terrain snow ratios will stay around 10:1\nresulting in up to 6 inches of snow across most higher terrain \nwith locally up to 10 inches across westerly flow favored \nlocations.\n\nIn addition to the precipitation, a cooler airmass moves into the\narea dropping temperatures near to slightly below normal. Given\nthe cooler airmass there will be freezing temperatures possible\nacross some rural valley locations. There exists a low (<25%\nchance) chance across the central valleys Thursday and Friday\nmorning, but cloud cover could limit the radiational cooling\npotential. Saturday morning has the greatest chance to see\nfreezing conditions (50-60% chance) across most valley locations,\noutside of the Urban corridor, since clouds should be clearing \nmore by then.\n\nA closed low will move into the Mojave over the weekend and phase\ninto the mean trough. This will bring more precipitation into the\nregion with a focus of this round across central and southern\nUtah. 67% of ensemble members feature a shortwave moving into\nnorthern Utah and merging with this closed low by Sunday into \nMonday which would extend the precipitation chances spatially into\nnorthern Utah/SW Wyoming and temporally into Monday.\n\n&&\n\n.AVIATION...KSLC...VFR will continue with FEW to SCT high clouds. \nWinds will vary from SE to SW through the day today. No north winds \nexpected today. Some gusts expected this afternoon, but only to \nabout 18 kts. Light winds again overnight with another round of \nsimilar gusts tomorrow afternoon.\n\n.REST OF UTAH AND SOUTHWEST WYOMING...VFR will continue over the \nnext 24 hours. Some mid to high cloud, but little aviation impact. \nWinds will be the main weather impact. Nothing to significant in \nspeed (increase and decrease along the diurnal curve with some \nafternoon gusts to 20 kts possible), but shifting directions over \nthe next day. Winds generally somewhere between a SW to SE over the \nnext day with timings of when these shifts occur differing terminal \nto terminal. Consult individual TAF sites for site specific\ntiming.\n\n&&\n\n.SLC WATCHES/WARNINGS/ADVISORIES...\nUT...None.\nWY...None.\n&&\n\n$$\n\nPUBLIC...Mahan\nAVIATION...Carletta\n\nFor more information from NOAA's National Weather Service visit...\nhttp://weather.gov/saltlakecity\n"
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
      "generatedAt": "2026-04-20T18:44:50+00:00",
      "updateTime": "2026-04-20T18:31:37+00:00",
      "validTimes": "2026-04-20T12:00:00+00:00/P7DT13H",
      "elevation": {
        "unitCode": "wmoUnit:m",
        "value": 1278.9408
      },
      "periods": [
        {
          "number": 1,
          "name": "This Afternoon",
          "startTime": "2026-04-20T12:00:00-06:00",
          "endTime": "2026-04-20T18:00:00-06:00",
          "isDaytime": true,
          "temperature": 80,
          "temperatureUnit": "F",
          "temperatureTrend": null,
          "probabilityOfPrecipitation": {
            "unitCode": "wmoUnit:percent",
            "value": 0
          },
          "windSpeed": "10 mph",
          "windDirection": "S",
          "icon": "https://api.weather.gov/icons/land/day/sct?size=medium",
          "shortForecast": "Mostly Sunny",
          "detailedForecast": "Mostly sunny. High near 80, with temperatures falling to around 78 in the afternoon. South wind around 10 mph."
        },
        {
          "number": 2,
          "name": "Tonight",
          "startTime": "2026-04-20T18:00:00-06:00",
          "endTime": "2026-04-21T06:00:00-06:00",
          "isDaytime": false,
          "temperature": 53,
          "temperatureUnit": "F",
          "temperatureTrend": null,
          "probabilityOfPrecipitation": {
            "unitCode": "wmoUnit:percent",
            "value": 0
          },
          "windSpeed": "9 mph",
          "windDirection": "SSE",
          "icon": "https://api.weather.gov/icons/land/night/sct?size=medium",
          "shortForecast": "Partly Cloudy",
          "detailedForecast": "Partly cloudy. Low around 53, with temperatures rising to around 55 overnight. South southeast wind around 9 mph."
        },
        {
          "number": 3,
          "name": "Tuesday",
          "startTime": "2026-04-21T06:00:00-06:00",
          "endTime": "2026-04-21T18:00:00-06:00",
          "isDaytime": true,
          "temperature": 80,
          "temperatureUnit": "F",
          "temperatureTrend": null,
          "probabilityOfPrecipitation": {
            "unitCode": "wmoUnit:percent",
            "value": 3
          },
          "windSpeed": "9 to 13 mph",
          "windDirection": "SSE",
          "icon": "https://api.weather.gov/icons/land/day/sct?size=medium",
          "shortForecast": "Mostly Sunny",
          "detailedForecast": "Mostly sunny, with a high near 80. South southeast wind 9 to 13 mph."
        },
        {
          "number": 4,
          "name": "Tuesday Night",
          "startTime": "2026-04-21T18:00:00-06:00",
          "endTime": "2026-04-22T06:00:00-06:00",
          "isDaytime": false,
          "temperature": 50,
          "temperatureUnit": "F",
          "temperatureTrend": null,
          "probabilityOfPrecipitation": {
            "unitCode": "wmoUnit:percent",
            "value": 7
          },
          "windSpeed": "13 mph",
          "windDirection": "S",
          "icon": "https://api.weather.gov/icons/land/night/sct?size=medium",
          "shortForecast": "Partly Cloudy",
          "detailedForecast": "Partly cloudy, with a low around 50. South wind around 13 mph."
        },
        {
          "number": 5,
          "name": "Wednesday",
          "startTime": "2026-04-22T06:00:00-06:00",
          "endTime": "2026-04-22T18:00:00-06:00",
          "isDaytime": true,
          "temperature": 59,
          "temperatureUnit": "F",
          "temperatureTrend": null,
          "probabilityOfPrecipitation": {
            "unitCode": "wmoUnit:percent",
            "value": 77
          },
          "windSpeed": "13 mph",
          "windDirection": "SW",
          "icon": "https://api.weather.gov/icons/land/day/tsra,60/tsra,80?size=medium",
          "shortForecast": "Showers And Thunderstorms",
          "detailedForecast": "Rain showers likely before 9am, then showers and thunderstorms. Mostly cloudy, with a high near 59. Southwest wind around 13 mph. Chance of precipitation is 80%. New rainfall amounts between a tenth and quarter of an inch possible."
        },
        {
          "number": 6,
          "name": "Wednesday Night",
          "startTime": "2026-04-22T18:00:00-06:00",
          "endTime": "2026-04-23T06:00:00-06:00",
          "isDaytime": false,
          "temperature": 41,
          "temperatureUnit": "F",
          "temperatureTrend": null,
          "probabilityOfPrecipitation": {
            "unitCode": "wmoUnit:percent",
            "value": 53
          },
          "windSpeed": "6 to 10 mph",
          "windDirection": "W",
          "icon": "https://api.weather.gov/icons/land/night/tsra_sct,50?size=medium",
          "shortForecast": "Chance Showers And Thunderstorms",
          "detailedForecast": "A chance of showers and thunderstorms. Mostly cloudy, with a low around 41. Chance of precipitation is 50%."
        },
        {
          "number": 7,
          "name": "Thursday",
          "startTime": "2026-04-23T06:00:00-06:00",
          "endTime": "2026-04-23T18:00:00-06:00",
          "isDaytime": true,
          "temperature": 57,
          "temperatureUnit": "F",
          "temperatureTrend": null,
          "probabilityOfPrecipitation": {
            "unitCode": "wmoUnit:percent",
            "value": 57
          },
          "windSpeed": "6 to 9 mph",
          "windDirection": "WNW",
          "icon": "https://api.weather.gov/icons/land/day/tsra_sct,60/tsra_sct,40?size=medium",
          "shortForecast": "Showers And Thunderstorms Likely",
          "detailedForecast": "Rain showers likely before 9am, then showers and thunderstorms likely. Mostly cloudy, with a high near 57."
        },
        {
          "number": 8,
          "name": "Thursday Night",
          "startTime": "2026-04-23T18:00:00-06:00",
          "endTime": "2026-04-24T06:00:00-06:00",
          "isDaytime": false,
          "temperature": 36,
          "temperatureUnit": "F",
          "temperatureTrend": null,
          "probabilityOfPrecipitation": {
            "unitCode": "wmoUnit:percent",
            "value": 14
          },
          "windSpeed": "9 mph",
          "windDirection": "N",
          "icon": "https://api.weather.gov/icons/land/night/sct?size=medium",
          "shortForecast": "Partly Cloudy",
          "detailedForecast": "Partly cloudy, with a low around 36."
        },
        {
          "number": 9,
          "name": "Friday",
          "startTime": "2026-04-24T06:00:00-06:00",
          "endTime": "2026-04-24T18:00:00-06:00",
          "isDaytime": true,
          "temperature": 57,
          "temperatureUnit": "F",
          "temperatureTrend": null,
          "probabilityOfPrecipitation": {
            "unitCode": "wmoUnit:percent",
            "value": 16
          },
          "windSpeed": "6 to 12 mph",
          "windDirection": "WNW",
          "icon": "https://api.weather.gov/icons/land/day/rain_showers,20/tsra_hi?size=medium",
          "shortForecast": "Slight Chance Rain Showers then Slight Chance Showers And Thunderstorms",
          "detailedForecast": "A slight chance of rain showers before noon, then a slight chance of showers and thunderstorms. Mostly sunny, with a high near 57."
        },
        {
          "number": 10,
          "name": "Friday Night",
          "startTime": "2026-04-24T18:00:00-06:00",
          "endTime": "2026-04-25T06:00:00-06:00",
          "isDaytime": false,
          "temperature": 36,
          "temperatureUnit": "F",
          "temperatureTrend": null,
          "probabilityOfPrecipitation": {
            "unitCode": "wmoUnit:percent",
            "value": 3
          },
          "windSpeed": "5 to 10 mph",
          "windDirection": "NE",
          "icon": "https://api.weather.gov/icons/land/night/few?size=medium",
          "shortForecast": "Mostly Clear",
          "detailedForecast": "Mostly clear, with a low around 36."
        },
        {
          "number": 11,
          "name": "Saturday",
          "startTime": "2026-04-25T06:00:00-06:00",
          "endTime": "2026-04-25T18:00:00-06:00",
          "isDaytime": true,
          "temperature": 60,
          "temperatureUnit": "F",
          "temperatureTrend": null,
          "probabilityOfPrecipitation": {
            "unitCode": "wmoUnit:percent",
            "value": 12
          },
          "windSpeed": "5 to 10 mph",
          "windDirection": "WSW",
          "icon": "https://api.weather.gov/icons/land/day/sct/tsra_hi?size=medium",
          "shortForecast": "Mostly Sunny then Slight Chance Showers And Thunderstorms",
          "detailedForecast": "A slight chance of showers and thunderstorms after noon. Mostly sunny, with a high near 60."
        },
        {
          "number": 12,
          "name": "Saturday Night",
          "startTime": "2026-04-25T18:00:00-06:00",
          "endTime": "2026-04-26T06:00:00-06:00",
          "isDaytime": false,
          "temperature": 40,
          "temperatureUnit": "F",
          "temperatureTrend": null,
          "probabilityOfPrecipitation": {
            "unitCode": "wmoUnit:percent",
            "value": 19
          },
          "windSpeed": "5 to 9 mph",
          "windDirection": "NE",
          "icon": "https://api.weather.gov/icons/land/night/tsra_hi/tsra_hi,20?size=medium",
          "shortForecast": "Slight Chance Showers And Thunderstorms",
          "detailedForecast": "A slight chance of showers and thunderstorms. Partly cloudy, with a low around 40."
        },
        {
          "number": 13,
          "name": "Sunday",
          "startTime": "2026-04-26T06:00:00-06:00",
          "endTime": "2026-04-26T18:00:00-06:00",
          "isDaytime": true,
          "temperature": 60,
          "temperatureUnit": "F",
          "temperatureTrend": null,
          "probabilityOfPrecipitation": {
            "unitCode": "wmoUnit:percent",
            "value": 29
          },
          "windSpeed": "5 to 9 mph",
          "windDirection": "NNE",
          "icon": "https://api.weather.gov/icons/land/day/rain_showers,20/tsra_hi,30?size=medium",
          "shortForecast": "Chance Showers And Thunderstorms",
          "detailedForecast": "A slight chance of rain showers before noon, then a chance of showers and thunderstorms. Partly sunny, with a high near 60."
        },
        {
          "number": 14,
          "name": "Sunday Night",
          "startTime": "2026-04-26T18:00:00-06:00",
          "endTime": "2026-04-27T06:00:00-06:00",
          "isDaytime": false,
          "temperature": 39,
          "temperatureUnit": "F",
          "temperatureTrend": null,
          "probabilityOfPrecipitation": {
            "unitCode": "wmoUnit:percent",
            "value": 20
          },
          "windSpeed": "5 to 9 mph",
          "windDirection": "SW",
          "icon": "https://api.weather.gov/icons/land/night/tsra_hi,20?size=medium",
          "shortForecast": "Slight Chance Showers And Thunderstorms",
          "detailedForecast": "A slight chance of showers and thunderstorms. Partly cloudy, with a low around 39."
        }
      ]
    }
  },
  "soaringForecast": {
    "@context": {
      "@version": "1.1",
      "@vocab": "https://api.weather.gov/ontology#"
    },
    "@id": "https://api.weather.gov/products/db0d52fb-4200-4b02-b7b3-4983b3956684",
    "id": "db0d52fb-4200-4b02-b7b3-4983b3956684",
    "wmoCollectiveId": "UXUS97",
    "issuingOffice": "KSLC",
    "issuanceTime": "2026-04-20T12:29:00+00:00",
    "productCode": "SRG",
    "productName": "Soaring Guidance",
    "productText": "\n000\nUXUS97 KSLC 201229\nSRGSLC\n\nSoaring Forecast\nNational Weather Service Salt Lake City, Utah\n629 AM MDT Monday, April 20, 2026\n\nThis forecast is for Monday, April 20, 2026:\n\nIf the trigger temperature of 69.1 F/20.6 C is reached...then\n   Thermal Soaring Index....................... Excellent\n   Maximum rate of lift........................ 1423 ft/min (7.2 m/s)\n   Maximum height of thermals.................. 19962 ft MSL (15086 ft AGL)\n\nForecast maximum temperature................... 80.0 F/27.1 C\nTime of trigger temperature.................... 1030 MDT\nTime of overdevelopment........................ None\nMiddle/high clouds during soaring window....... None\nSurface winds during soaring window............ 20 mph or less\nHeight of the -3 thermal index................. 16063 ft MSL (11186 ft AGL)\nThermal soaring outlook for Tuesday 04/21...... Excellent\n\nWave Soaring Index............................. Not available\n\nRemarks... \n\nSunrise/Sunset.................... 06:40:52 / 20:12:28 MDT\nTotal possible sunshine........... 13 hr 31 min 36 sec (811 min 36 sec)\nAltitude of sun at 13:26:40 MDT... 60.36 degrees\n\nUpper air data from numerical model forecast valid on 04/20/2026 at 0600 MDT\n\nFreezing level.................. 12077 ft MSL (7201 ft AGL)\nConvective condensation level... 18514 ft MSL (13638 ft AGL)\nLifted condensation level....... 19144 ft MSL (14268 ft AGL)\nLifted index.................... -0.4\nK index......................... +16.3\n\nHeight  Temperature  Wind  Wind Spd  Lapse Rate  ConvectionT  Thermal  Lift Rate\nft MSL  deg C deg F   Dir   kt  m/s  C/km F/kft  deg C deg F   Index    fpm  m/s\n--------------------------------------------------------------------------------\n 26000  -32.1 -25.8   230   23   12   7.2   4.0   32.4  90.4     4.5      M    M\n 24000  -27.8 -18.0   235   22   11   7.2   3.9   30.6  87.2     3.1      M    M\n 22000  -23.5 -10.3   235   21   11   7.2   3.9   28.7  83.6     1.6      M    M\n 20000  -19.1  -2.4   235   21   11   7.3   4.0   26.9  80.5     0.1      M    M\n 18000  -14.2   6.4   235   22   11   7.4   4.1   25.1  77.2    -1.4   1222  6.2\n 16000   -9.9  14.2   235   27   14   7.2   3.9   23.4  74.1    -3.1   1037  5.3\n 14000   -5.2  22.6   225   28   14   9.0   4.9   22.3  72.2    -4.4    837  4.3\n 12000    0.2  32.4   215   24   13   9.1   5.0   21.9  71.4    -4.8    615  3.1\n 10000    5.5  41.9   215   24   12   7.8   4.3   21.4  70.4    -5.5    396  2.0\n  9000    8.2  46.8   220   24   12   8.7   4.8   21.1  70.0    -5.8    286  1.5\n  8000   10.8  51.4   215   21   11   8.1   4.5   20.8  69.4    -6.1    179  0.9\n  7000   13.3  55.9   205   18    9   6.8   3.7   20.3  68.5    -6.7     75  0.4\n  6000   15.1  59.2   185   16    8   3.7   2.1   19.2  66.5    -7.8      M    M\n  5000   15.3  59.5   160   13    7  -3.3  -1.8   16.4  61.6   -10.6      M    M\n\n * * * * * * Numerical weather prediction model forecast data valid * * * * * * \n\n           04/20/2026 at 0900 MDT          |       04/20/2026 at 1200 MDT        \n                                           |\nCAPE...     0.0    LI...       +1.8        | CAPE...    +1.9    LI...       +1.8\nCINH...    -0.1    K Index... +18.0        | CINH...    -8.0    K Index... +19.6\n                                           |\nHeight Temperature  Wnd WndSpd  Lapse Rate | Temperature  Wnd WndSpd  Lapse Rate\nft MSL deg C deg F  Dir kt m/s  C/km F/kft | deg C deg F  Dir kt m/s  C/km F/kft\n--------------------------------------------------------------------------------\n 26000 -31.8 -25.2  245  22 11   7.1   3.9 | -30.8 -23.4  260  20 10   7.0   3.8\n 24000 -27.6 -17.7  245  21 11   7.3   4.0 | -26.7 -16.1  250  21 11   6.8   3.7\n 22000 -23.2  -9.8  240  21 11   7.3   4.0 | -22.6  -8.7  240  21 11   6.8   3.7\n 20000 -18.8  -1.8  235  20 10   7.2   3.9 | -17.9  -0.2  225  20 10   7.2   3.9\n 18000 -14.1   6.6  235  20 10   6.7   3.7 | -13.9   7.0  220  20 10   6.0   3.3\n 16000 -10.2  13.6  235  25 13   7.2   4.0 | -10.2  13.6  225  23 12   7.8   4.3\n 14000  -5.6  21.9  230  27 14   9.0   4.9 |  -5.4  22.3  225  23 12   8.6   4.7\n 12000  -0.1  31.8  225  25 13   9.3   5.1 |  -0.1  31.8  220  21 11   9.3   5.1\n 10000   5.3  41.5  220  23 12   7.4   4.0 |   5.3  41.5  215  18  9   7.5   4.1\n  9000   8.0  46.4  220  21 11   8.7   4.7 |   8.2  46.8  215  17  9   8.6   4.7\n  8000  10.6  51.1  215  19 10   8.6   4.7 |  11.0  51.8  210  16  8   9.4   5.1\n  7000  13.1  55.6  205  17  9   6.8   3.7 |  13.8  56.8  205  14  7   8.9   4.9\n  6000  14.9  58.8  185  16  8   6.3   3.4 |  16.5  61.7  205  12  6   9.9   5.5\n  5000  15.1  59.2  155   7  3 -35.4 -19.4 |  19.3  66.7  205  10  5   9.6   5.3\n\n           04/20/2026 at 1500 MDT          |       04/20/2026 at 1800 MDT        \n                                           |\nCAPE...   +10.7    LI...       +0.9        | CAPE...    +3.6    LI...       +1.0\nCINH...    -4.5    K Index... +19.8        | CINH...    -7.7    K Index... +18.3\n                                           |\nHeight Temperature  Wnd WndSpd  Lapse Rate | Temperature  Wnd WndSpd  Lapse Rate\nft MSL deg C deg F  Dir kt m/s  C/km F/kft | deg C deg F  Dir kt m/s  C/km F/kft\n--------------------------------------------------------------------------------\n 26000 -30.1 -22.2  260  21 11   7.7   4.2 | -29.7 -21.5  255  24 12   7.3   4.0\n 24000 -25.6 -14.1  255  21 11   6.2   3.4 | -25.4 -13.7  250  22 11   6.5   3.6\n 22000 -21.8  -7.2  240  24 12   6.4   3.5 | -21.5  -6.7  240  24 12   6.6   3.6\n 20000 -17.3   0.9  225  25 13   6.8   3.7 | -17.4   0.7  230  25 13   6.9   3.8\n 18000 -13.5   7.7  215  24 12   5.9   3.2 | -13.0   8.6  220  26 13   6.3   3.5\n 16000  -9.5  14.9  205  22 11   8.2   4.5 |  -8.8  16.2  215  23 12   8.4   4.6\n 14000  -4.5  23.9  205  20 10   9.4   5.2 |  -3.6  25.5  210  21 11   9.6   5.2\n 12000   1.1  34.0  200  18  9   9.6   5.3 |   2.1  35.8  210  19 10   9.5   5.2\n 10000   6.7  44.1  205  16  8   8.1   4.4 |   7.8  46.0  205  18  9   8.4   4.6\n  9000   9.7  49.5  205  15  8   9.6   5.3 |  10.7  51.3  205  17  9   9.9   5.4\n  8000  12.6  54.7  205  14  7  10.4   5.7 |  13.6  56.5  205  16  8  10.3   5.6\n  7000  15.5  59.9  210  13  7  10.1   5.5 |  16.4  61.5  205  14  7   9.7   5.3\n  6000  18.4  65.1  210  11  6   9.4   5.1 |  19.2  66.6  210  13  6   9.1   5.0\n  5000  23.6  74.5  220   7  4   9.4   5.2 |  23.4  74.1  210   8  4  12.3   6.7\n________________________________________________________________________________\n\nThis product is issued once per day by approximately 0600 MST/0700 MDT \n(1300 UTC). This product is not continuously monitored nor updated after\nthe initial issuance. \n\nThe information contained herein is based on the 1200 UTC rawinsonde observation\nat the Salt Lake City, Utah International Airport and/or numerical weather \nprediction model data representative of the airport. These data may not be\nrepresentative of other areas along the Wasatch Front. Erroneous data such as\nthese should not be used.\n\nThe content and format of this report as well as the issuance times are subject\nto change without prior notice.\n\n042025\n"
  },
  "windAloft6": {
    "@context": {
      "@version": "1.1",
      "@vocab": "https://api.weather.gov/ontology#"
    },
    "@id": "https://api.weather.gov/products/18d099bd-7fb4-436e-abc9-46ca4fa08ed2",
    "id": "18d099bd-7fb4-436e-abc9-46ca4fa08ed2",
    "wmoCollectiveId": "FBUS31",
    "issuingOffice": "KWNO",
    "issuanceTime": "2026-04-20T13:59:00+00:00",
    "productCode": "FD1",
    "productName": "6 Hour Winds Aloft Forecast",
    "productText": "\n000\nFBUS31 KWNO 201359\nFD1US1\nDATA BASED ON 201200Z    \nVALID 201800Z   FOR USE 1400-2100Z. TEMPS NEG ABV 24000\n\nFT  3000    6000    9000   12000   18000   24000  30000  34000  39000\nABI      1515+10 1418+05 1919+00 2320-13 2625-24 264542 264949 255849\nABQ              9900+08 9900+02 9900-15 2209-27 151144 221351 242650\nABR 1924 2716+11 2821+04 2827-01 2845-17 2953-30 296245 306755 306365\nACK 2813 2719-07 2724-14 2732-21 2471-27 2392-34 227547 218748 236446\nACY 3111 2922-06 2629-13 2431-20 2651-30 2581-37 267847 264743 255747\nAGC 3111 3014-10 3128-15 3134-20 3249-31 3261-40 326146 315446 295346\nALB 3011 3013-12 2919-18 2724-23 2633-32 2828-41 263146 253944 243943\nALS                      3405+02 1810-15 2108-27 241042 191154 252356\nAMA      2017    2017+07 2010+02 2108-15 2218-26 181343 232151 254450\nAST 1808 1716+08 1423+01 1431-07 1637-19 1631-31 164947 195953 205557\nATL 9900 3424+06 3433+00 3230-06 3250-20 3264-30 308644 791050 790552\nAVP 3214 3215-11 2923-16 2825-21 2728-32 2927-41 273746 274345 263943\nAXN 1925 2440+03 2732+00 2935-04 3056-19 3066-31 307246 317855 316163\nBAM              1920+07 2024-01 2035-15 2136-26 234341 254550 253862\nBCE                      2115+01 2011-14 2413-26 301341 322251 333961\nBDL 3009 2815-09 2628-16 2631-22 2633-32 2532-42 245144 234343 236147\nBFF      2614    2721+09 2720+00 2824-14 2725-28 263243 273353 273764\nBGR 2909 2812-11 2621-18 2536-23 2438-32 2263-39 209142 228143 225144\nBHM 9900 3516+08 3428+01 3329-05 3241-18 3156-28 308443 790651 790452\nBIH      9900    1619+06 1926+00 2138-13 2244-25 223039 233050 222361\nBIL      3009    2818+06 2724-02 2734-17 2735-28 273744 283854 274163\nBLH 1816 1619+14 1525+07 1722+01 2310-12 2815-24 281440 291651 291360\nBML 2914 2916-13 2623-20 2728-24 2631-33 2632-42 234144 225443 235744\nBNA 2909 3129+05 3139-01 3241-08 3151-19 3263-31 327647 318355 308754\nBOI      1515+13 1814+08 1715-01 2228-17 2134-27 234143 255151 256062\nBOS 2710 2617-09 2634-16 2637-23 2539-31 2352-41 235843 216845 246445\nBRL 1511 2921+04 3030-01 3035-08 3248-18 3258-30 326647 337356 326461\nBRO 1618 1517+12 1616+08 2009+04 2922-09 2732-21 285338 266544 265851\nBUF 3013 3014-14 3119-18 3027-23 3134-32 3134-42 324248 314046 303945\nCAE 2706 3219+03 3332-02 3033-08 3053-21 3057-34 297846 299749 790051\nCAR 2812 2619-15 2636-21 2535-24 2440-33 2257-39 219441 217742 215644\nCGI 9900 2927+07 3028+01 3132-06 3243-18 3254-30 326646 317455 308257\nCHS 9900 3621+03 3221-01 2935-06 2950-20 2863-32 770043 781350 780752\nCLE 3210 3118-10 3226-14 3339-17 3363-27 3474-39 348450 336850 315347\nCLL 1212 0807+10 1408+05 2223+01 2727-12 2828-23 283641 275248 266350\nCMH 3309 3309-08 3331-11 3248-13 3270-25 3377-38 338750 327352 316248\nCOU 2010 2619+07 2825+02 2930-05 3240-17 3151-30 325745 326055 316760\nCRP 1228 1525+12 1826+08 2121+03 2923-10 2831-22 275040 266845 275849\nCRW 3108 3109-06 3233-10 3154-12 3165-25 3174-38 327449 306751 306649\nCSG 0605 0123+07 3528+01 3330-04 3241-17 3159-28 299841 790950 781152\nCVG 9900 9900-06 3332-06 3247-10 3259-23 3270-34 337949 327756 316753\nCZI              3007+08 2916+00 2828-16 2732-28 264044 254555 273662\nDAL 1610 1706+10 2307+06 2406+00 2714-13 2729-24 263542 254850 266350\nDBQ 1813 2815+01 3134-02 3142-09 3254-19 3262-31 327647 337656 325860\nDEN              3011+10 2907+02 2711-14 2618-28 262343 272853 262461\nDIK      2921+12 2722+04 2831-03 2939-17 2843-29 284844 285155 284864\nDLH 2121 2627+00 2838-04 2941-10 3154-21 3167-33 317747 318055 316159\nDLN              2308+07 2416-01 2529-17 2626-27 263443 263953 285763\nDRT 1318 1822+11 2010+07 2311+04 2525-12 2432-24 254841 256247 256048\nDSM 1620 2217+06 2727+03 2822-05 3141-18 3249-30 325845 326355 326663\nECK 3106 3111-12 3225-15 3338-17 3462-27 3475-39 348851 347352 325449\nEKN      3013-08 3127-14 3149-16 3077-27 3082-39 316747 305848 296448\nELP      1405    2005+09 1909+02 2415-14 2221-26 233242 254048 244748\nELY              1924+08 1927-01 2125-14 2225-26 242541 273651 293262\nEMI 3117 3118-08 3022-15 3023-20 2840-32 2848-41 275844 285745 274143\nEVV 9900 3127+02 3140-02 3250-08 3154-19 3264-32 327548 327557 317255\nEYW 9900 2706+13 2813+08 2814+05 2826-08 2831-20 285135 287144 297454\nFAT 1908 1610+07 1823+03 1930-02 2143-14 2253-25 223939 223950 213161\nGPI      2307+09 2815+03 2719-04 2626-18 2731-28 263244 264054 263764\nFLO 2708 3012+02 3335-04 3032-08 2954-22 2854-34 287048 288649 288949\nFMN              9900+09 9900+02 9900-15 9900-28 210842 210554 271856\nFOT 1714 1822+01 1736-04 1749-09 1877-21 2091-26 209639 209548 217957\nFSD 1721 2430+11 2627+04 2828-02 3039-17 3050-30 306145 316255 316165\nFSM 1908 1915+09 2211+05 2615-01 3211-15 3121-27 294741 294852 287055\nFWA 9900 9900-09 3327-08 3240-11 3254-24 3367-35 338349 348555 326253\nGAG      2223+12 2018+08 2012+02 2816-15 2508-26 241842 251453 264353\nGCK      2031+15 2124+10 2313+02 2818-15 3010-26 261342 251653 273658\nGEG      1705+12 2107+05 2308-03 2317-18 2227-29 222944 223754 245763\nGFK 2235 2729+08 2837+01 2944-05 2956-19 3059-31 307046 307255 315461\nGGW      3611+09 3215+02 2923-04 2837-18 2836-29 284445 284455 283862\nGJT              2205+10 2309+02 2410-16 2418-27 242343 252253 302760\nGLD      1811    2010+10 2316+02 2814-14 2816-27 261943 262153 273062\nGRB 2114 2416-08 3026-08 3135-12 3149-23 3261-34 327448 328055 326558\nGRI      2420+16 2423+07 2422-01 2817-15 2928-29 314043 313953 304564\nGSP 2411 2916+03 3242-03 3242-08 3050-21 3167-34 317649 309051 298649\nGTF      2405    2811+04 2820-03 2728-17 2831-28 283744 274154 263764\nH51 1011 1505+13 2307+08 2510+03 3023-09 2837-21 264438 267044 266752\nH52 0614 0510+13 0205+07 3310+03 2823-09 2732-21 275736 277745 287552\nH61 0613 0314+12 0113+08 3214+01 2830-09 2938-21 275237 287746 288355\nHAT 2709 3115-01 3139-06 2737-08 2753-22 2662-34 258547 269251 267349\nHOU 1015 0707+11 9900+06 2310+02 2834-12 2839-23 284141 276246 266050\nHSV 2710 3219+06 3331+00 3234-06 3244-19 3259-30 307345 309251 790154\nICT 1920 2023+12 2221+07 2513-01 3008-14 3018-27 302842 303252 294460\nILM 2907 3011+01 3337-04 2935-08 2852-22 2756-34 268147 269350 278249\nIMB              1514+05 1624-03 1830-19 1938-29 214744 227251 238062\nIND 9900 9900-06 3331-05 3244-09 3257-22 3266-33 337848 338156 326355\nINK      1707+10 2410+07 2412+03 2315-14 2225-25 233842 254848 245547\nINL 2026 2549+01 2741-04 2943-08 3057-21 3068-33 317647 317355 316558\nJAN 1207 1111+09 0408+04 3313-03 3127-15 3041-26 296340 287351 288551\nJAX 0420 3610+08 3219+04 3129-02 2853-16 2764-26 288740 780650 791053\nJFK 3210 3020-08 2726-15 2625-20 2636-31 2542-41 256245 254543 245947\nJOT 1809 2405-05 3129-04 3239-09 3254-21 3268-33 337647 337456 326558\nLAS      1718+16 1822+07 1931-01 2219-13 2518-25 251741 281951 311561\nLBB      1924+09 1915+06 1610+01 2215-14 2525-26 244743 254049 255248\nLCH 0915 1212+11 1413+06 9900+01 2735-12 2734-23 283641 266546 276950\nLIT 2107 1911+08 2306+04 2814-02 3219-16 3228-27 306041 297052 298353\nLKV              1829+02 1737-04 1847-17 2048-29 227041 227350 226861\nLND              2515+10 2625+01 2720-15 2728-28 273345 283454 284063\nLOU 9900 3114-02 3136-04 3247-09 3261-21 3268-33 327849 327857 316953\nLRD 1207 1722+12 1721+09 2210+05 2623-10 2637-22 265339 266446 265950\nLSE 1916 2715+00 3132-03 3141-09 3154-20 3262-32 327847 328056 315660\nLWS 9900 9900+13 2108+05 2411-02 2222-18 2129-28 223444 234253 256862\nMBW              2723    2928+01 2723-15 2625-28 263143 263454 273962\nMCW 1719 2418+05 2727+00 3031-07 3247-18 3260-30 316946 327456 316864\nMEM 2510 2807+07 3015+02 3220-05 3233-17 3247-28 316543 297952 299556\nMGM 0707 0319+08 3627+02 3330-03 3236-17 3054-27 299040 299751 780453\nMIA 0508 2810+12 2712+07 2812+03 2830-09 2942-21 285737 287746 287753\nMKC 2017 2428+09 2624+04 2828-03 3135-16 3144-29 314744 324854 305862\nMKG 2506 3011-09 3224-10 3235-12 3248-24 3260-36 338249 338855 336154\nMLB 0427 0412+10 3111+05 2913+00 2834-12 2853-22 287438 289449 298553\nMLS      3117+11 2822+05 2928-01 2833-17 2741-28 283745 273655 274062\nMOB 0717 0516+11 0117+05 3419-02 2934-14 2944-25 296440 279449 289251\nMOT      2930+10 2933+03 2836-04 2943-18 2945-29 295445 295955 304262\nMQT 2213 2315-09 2926-10 3034-14 3147-24 3260-35 327749 328255 326756\nMRF              2508+09 2114+03 2328-14 2335-24 244441 255447 245847\nMSP 1920 2521+02 2832-02 2938-07 3152-19 3168-31 317747 318256 316062\nMSY 0920 0512+11 0611+06 9900-01 2823-13 2941-23 284739 268449 288551\nOKC 1916 2015+11 2213+06 2408+00 2913-14 2717-26 262841 272553 275252\nOMA 1718 2416+13 2626+05 2723-03 3334-16 3245-30 314945 325254 316064\nONL      2528+15 2325+07 2526-01 2824-15 2937-29 304644 304554 305165\nONT 9900 1809+12 1815+06 2018+00 2225-12 2425-25 222240 211750 202061\nORF 2819 2821-01 2833-09 2948-14 2760-23 2670-37 267250 266548 266547\nOTH 0514 1528+02 1835-03 1844-08 1664-20 1660-32 209141 209549 208157\nPDX 1309 1614+10 1624+02 1633-05 1735-19 1739-30 184946 207252 217659\nPFN 0516 0218+11 3521+05 3321-01 2843-14 2952-25 296740 289849 289452\nPHX 1405 9900+15 1409+08 1413+00 2606-14 3115-26 332342 343250 302356\nPIE 0516 0406+11 0112+06 3214+01 2832-12 2950-22 287437 289048 298252\nPIH      2009    2318+08 2219+00 2326-15 2426-27 263243 263653 295762\nPIR      2413+14 2523+07 2625+00 2735-16 2841-29 295244 295254 295266\nPLB 3012 2913-15 2924-20 2825-24 2826-33 2928-42 272447 243145 243944\nPRC              1808+08 1613+00 2508-13 3012-26 331642 353351 332759\nPSB      3116-11 3124-16 3126-21 3029-32 3132-42 303945 294344 284845\nPSX 1022 1109+11 1608+07 2318+03 2827-11 2837-23 284641 266546 266150\nPUB              2809+11 2609+03 2611-15 2613-27 251543 271553 262759\nPWM 2710 2913-11 2731-18 2634-22 2536-32 2343-41 216142 217444 245844\nRAP      2706+15 2713+07 2718+00 2726-15 2739-28 274244 274654 284665\nRBL 1623 1638+02 1846-01 1853-06 1960-18 2177-25 217839 217249 216560\nRDM      1717+10 1734+03 1635-04 1839-19 1846-29 216343 218150 228661\nRDU 2816 2818+01 3040-07 3142-12 2851-23 2861-36 286850 286648 286848\nRIC 3015 2916-03 2823-11 2948-15 2865-25 2770-38 278052 286446 275446\nRKS              2512    2621+01 2517-16 2617-28 262944 292853 294163\nRNO      1910    1916+03 1833-03 1944-16 2153-26 225439 225550 224961\nROA 3014 3017-04 3042-08 3053-12 3060-24 2966-37 296451 297151 305946\nROW      1606    9900+08 2209+02 2214-14 2421-26 234043 253749 254047\nSAC 1718 1827+05 1837+00 1944-05 2055-16 2167-24 226139 216149 215561\nSAN 9900 1806+12 1910+07 2013+02 2317-11 2416-24 222240 231950 242860\nSAT 1231 1628+13 1823+08 2115+03 2824-11 2731-23 264840 266546 266149\nSAV 0307 0124+05 3221+01 3031-04 2948-20 2869-29 780042 781750 791352\nSBA 1605 1909+09 2117+05 2124-01 2137-12 2244-25 213240 202650 202761\nSEA 1207 1708+10 1613+03 1721-05 1821-19 1729-30 183746 194054 204760\nSFO 1924 1933+05 1943+00 1948-06 2156-16 2169-24 216339 216349 215961\nSGF 2312 2319+08 2422+04 3021-04 3228-16 3136-29 304944 305053 296759\nSHV 1308 1511+10 1909+05 2606-01 2821-14 2926-26 285041 265551 277350\nSIY      1722+02 1748-01 1855-05 1850-19 2069-28 218340 208049 217660\nSLC      2005    2217+08 2220+00 2219-15 2523-27 281842 282652 314962\nSLN 2020 2226+13 2323+07 2518-01 3117-14 3021-28 313143 303452 294262\nSPI 1407 3022+03 3135-01 3143-08 3251-19 3262-30 326947 327056 326260\nSPS 1816 2605+10 2610+05 2007+00 2812-14 2535-25 253142 263951 265749\nSSM 2511 2713-13 3125-15 3233-16 3350-26 3359-38 337550 337855 325751\nSTL 1409 2921+06 2927+00 3034-06 3146-18 3254-30 326146 326756 317259\nSYR 3015 3018-14 3019-19 3023-23 2927-32 2928-42 302748 272945 263944\nT01 1119 0808+11 9900+06 9900+02 2832-11 2737-23 245539 267245 276652\nT06 0923 0816+12 0912+07 3305+02 2927-11 2839-23 264938 278247 288151\nT07 0621 0418+12 0513+06 3509+01 2834-11 2943-22 276439 288748 287651\nTCC      2012    1809+08 1913+01 2209-15 2316-27 151244 231750 253849\nTLH 0513 0217+10 3522+05 3229-01 2947-15 2858-26 297940 780149 780152\nTRI      2823+00 3041-06 3144-11 3158-22 3169-34 317650 307954 306748\nTUL 2015 1916+10 2213+06 2410-01 3010-15 3020-27 294041 294352 286056\nTUS      9900+16 1507+07 1314+00 2605-13 2715-27 302243 293149 283553\nTVC 2610 2711-11 3124-12 3234-14 3248-25 3259-36 338149 338555 326053\nTYS 2713 2922+02 3140-03 3145-09 3159-21 3165-33 317649 318755 307650\nWJF      2015+11 2017+06 2021+00 2230-12 2333-25 222840 202250 192561\nYKM 9900 1512+11 1813+04 2020-04 1823-19 1931-29 194045 215353 236660\nZUN              9900+10 9900+01 9900-16 1705-28 990044 320652 261854\n2XG 0323 9900+07 3119+03 2923-02 2748-15 2764-25 288040 289750 790854\n4J3 0621 0319+13 0217+06 3312+01 2830-12 2849-23 287238 289148 288252\n"
  },
  "windAloft12": {
    "@context": {
      "@version": "1.1",
      "@vocab": "https://api.weather.gov/ontology#"
    },
    "@id": "https://api.weather.gov/products/9676e301-3b81-4681-b16c-bc147d4a4ced",
    "id": "9676e301-3b81-4681-b16c-bc147d4a4ced",
    "wmoCollectiveId": "FBUS33",
    "issuingOffice": "KWNO",
    "issuanceTime": "2026-04-20T13:59:00+00:00",
    "productCode": "FD3",
    "productName": "24 Hour Winds Aloft Forecast",
    "productText": "\n000\nFBUS33 KWNO 201359\nFD3US3\nDATA BASED ON 201200Z    \nVALID 210000Z   FOR USE 2100-0600Z. TEMPS NEG ABV 24000\n\nFT  3000    6000    9000   12000   18000   24000  30000  34000  39000\nABI      1617+09 2018+06 2322+01 2528-13 2429-25 243042 254049 255150\nABQ              2105+11 9900+03 9900-14 2907-27 021644 011352 262355\nABR 2114 2915+12 3022+04 3026-02 2937-17 2845-29 294845 295255 305162\nACK 2810 2910-07 2614-14 2528-20 2536-31 2365-39 226645 235844 234443\nACY 3218 3216-08 2921-15 2923-19 3028-31 2929-41 293944 294144 284045\nAGC 3011 2914-09 3228-12 3343-13 3358-24 3368-36 338049 337752 326351\nALB 3018 3312-12 3112-19 2919-22 2823-31 2721-41 282648 292945 273045\nALS                      2106+04 9900-14 2907-27 300742 281054 321158\nAMA      1839    2309+08 9900+02 2510-14 2815-27 272244 262351 244052\nAST 1607 1519+06 1722+00 1729-06 1744-20 1641-32 207842 208550 207660\nATL 3213 3319+06 3433+01 3334-05 3246-16 3254-29 317244 308652 309654\nAVP 3317 3218-11 3122-17 3126-21 3131-31 3137-40 324646 314445 304145\nAXN 2127 2827+10 3032+03 2933-04 2944-18 2952-30 306245 306355 305362\nBAM              1920+10 1920+01 2036-14 2242-26 214040 213551 203561\nBCE                      2114+03 2112-14 2715-25 271541 311651 320861\nBDL 3316 3313-11 2913-17 2718-20 2725-31 2622-41 272746 263244 253845\nBFF      2915    3015+11 3016+02 2927-15 3030-28 283643 273854 293562\nBGR 3216 3010-12 2617-19 2721-23 2527-31 2431-41 225544 235645 223443\nBHM 3105 3617+07 3522+02 3332-04 3236-15 3145-28 306343 307652 299152\nBIH      9900    1623+08 1722+00 2141-13 2151-25 194640 183450 194162\nBIL      2508    2611+08 2720-01 2833-16 2835-27 284143 285053 306962\nBLH 1915 1816+15 1621+08 1910+02 2107-11 2213-24 232240 242749 243460\nBML 3115 3015-14 2921-19 2818-23 2722-32 2620-40 252647 243245 243445\nBNA 9900 3125+07 3131+01 3233-06 3246-17 3253-29 326345 316854 308157\nBOI      1410+16 1713+08 2017+00 2133-15 2236-27 244241 244751 244762\nBOS 3411 3207-09 2512-17 2525-22 2626-32 2527-41 233845 234645 254444\nBRL 1724 2632+08 2827+03 3040-04 3243-17 3253-30 326544 326954 316663\nBRO 1314 1516+13 1615+08 2408+05 2719-09 2739-21 275937 276046 266653\nBUF 2713 2915-12 3325-15 3338-18 3464-25 3472-38 347750 337352 325449\nCAE 2912 2914+05 3327-02 3336-07 3252-19 3164-31 317345 307953 309752\nCAR 3113 2813-16 2821-20 2724-24 2528-32 2333-41 225243 225243 204344\nCGI 1909 2622+08 2926+03 3129-04 3238-17 3342-28 325244 315853 306960\nCHS 3009 3217+04 3337-02 3237-06 3153-18 3161-31 307445 299451 299752\nCLE 2812 2917-08 3125-09 3236-12 3251-23 3365-35 337849 327852 337355\nCLL 1314 1220+10 1617+05 2330+02 2827-11 2521-24 262740 264849 266249\nCMH 2906 2709-06 3126-07 3236-10 3250-22 3364-34 337748 328053 327157\nCOU 2119 2428+09 2730+05 3029-03 3330-16 3338-28 324743 315253 305863\nCRP 1227 1820+12 2020+07 2512+04 2623-10 2637-22 276238 276947 266751\nCRW 3208 2909-05 3125-06 3235-09 3250-23 3265-34 337647 338054 327154\nCSG 3206 3614+07 3530+02 3334-04 3238-15 3146-28 307042 298451 790051\nCVG 9900 2912-02 3132-03 3240-08 3256-20 3268-32 338047 327354 326258\nCZI              9900+09 2722+02 2831-15 2833-28 293543 304553 326363\nDAL 1714 1910+10 9900+05 9900+00 2731-12 2527-24 253742 254051 266350\nDBQ 1826 2325+06 2834+03 2942-05 3251-18 3162-31 327046 327655 316763\nDEN              9900+12 3006+04 2615-15 2820-27 282442 272754 302561\nDIK      3409+11 3017+03 2926-03 2935-17 2939-28 294444 304654 304762\nDLH 2233 2742+06 2944+01 2943-05 3052-19 3056-31 305946 315955 316161\nDLN              2212+10 2214+01 2623-16 2538-27 264142 285251 286062\nDRT 1126 1515+11 1607+08 2315+04 2325-12 2538-25 265539 266347 266451\nDSM 1928 2536+10 2829+06 2838-02 2934-16 3046-29 315744 305954 305864\nECK 2311 2618-09 3125-10 3235-13 3252-24 3364-35 337649 337453 336555\nEKN      3015-06 3227-12 3345-11 3356-24 3267-36 338048 337753 326451\nELP      9900    9900+10 1908+02 2618-14 2823-27 273143 274547 265551\nELY              2025+11 2025+02 2120-13 2329-26 222641 231750 222061\nEMI 3219 3218-09 3125-14 3135-18 3361-28 3490-38 337648 326046 305147\nEVV 1705 3022+06 3027+00 3138-06 3248-18 3256-29 326745 327055 317460\nEYW 0209 3506+13 3208+10 3015+05 2824-09 2733-20 275935 287545 297954\nFAT 1610 1716+09 1921+03 1931-03 2047-14 2155-25 204441 194450 194661\nGPI      9900+12 2513+05 2623-03 2526-17 2532-28 254244 265152 277862\nFLO 2915 2916+04 3126-04 3237-09 3250-21 3165-33 317347 317752 308650\nFMN              2808+12 2807+03 9900-14 3006-27 300942 331153 362460\nFOT 1813 1829+00 1740-05 1749-11 1877-22 1994-26 680840 680349 198056\nFSD 1920 2620+13 2831+07 2832-01 2836-16 2943-29 305344 295954 295764\nFSM 1915 2123+10 2216+05 2510+00 3209-14 3019-26 283541 292953 276053\nFWA 2108 2516-04 3129-04 3140-09 3357-20 3369-33 337847 337955 326657\nGAG      2237+12 2314+09 2212+02 2810-14 2409-27 220543 200652 253953\nGCK      1927+16 2322+09 2615+03 3114-14 2808-26 291742 281853 262759\nGEG      9900+12 2511+05 2516-03 2328-18 2334-29 244643 256551 257462\nGFK 2914 3123+06 2935+01 2939-05 3043-18 3050-30 305345 304854 304961\nGGW      9900+10 2712+03 2923-03 2932-17 2935-28 294744 295054 295362\nGJT              2707+11 2509+03 2315-15 2914-27 321642 342251 363661\nGLD      1910    2111+11 2514+02 3017-14 2917-27 282543 292553 273161\nGRB 2126 2825+02 2937-03 3046-08 3155-21 3266-32 326547 326455 326560\nGRI      2229+14 2624+09 2728+00 2823-14 2927-27 284043 284253 284064\nGSP 3311 3013+06 3122-03 3234-08 3254-20 3266-31 326845 317053 308854\nGTF      2409    2514+06 2626-02 2729-17 2733-28 264244 274853 287962\nH51 0817 1305+12 2206+07 2711+03 2918-09 2832-21 285938 276945 265751\nH52 0827 0817+14 0308+09 3512+04 2835-10 2838-21 274836 278043 277253\nH61 0522 0713+12 0410+08 3610+02 2934-10 2739-21 276236 288445 287653\nHAT 2915 3124+01 3030-07 2949-13 2952-24 2960-36 296047 295148 286649\nHOU 1117 1318+11 1409+05 2517+02 2828-11 2727-23 274440 275847 266250\nHSV 3109 3313+06 3424+02 3233-04 3241-16 3246-28 316243 307252 308556\nICT 1930 2325+13 2317+09 2714+01 2210-14 2814-27 281842 272253 273459\nILM 3017 3020+03 3130-05 3241-10 3150-22 3168-34 307048 306950 297549\nIMB              1711+06 1716-03 2042-18 2143-28 226341 226650 225762\nIND 1909 2916+02 3139-01 3145-08 3256-19 3262-31 337746 337955 326358\nINK      1316+11 2711+09 2515+03 2424-14 2526-26 253141 254347 265351\nINL 2530 2736+01 2945-01 3050-06 3053-19 3061-31 306746 307054 316060\nJAN 1407 1511+11 9900+04 3209-02 3219-13 3133-25 295441 296252 287851\nJAX 0516 0224+07 3524+03 3330-02 3042-14 2958-26 298940 289350 790251\nJFK 3317 3316-10 2916-16 2822-20 2824-31 2824-41 283245 283443 273745\nJOT 1917 2920+04 3033+00 3038-08 3255-19 3266-31 327646 328155 326961\nLAS      1822+18 1922+09 2019+01 2216-12 2319-25 222640 212350 183061\nLBB      1820+10 2113+07 2712+02 2519-13 2414-26 252343 253050 254551\nLCH 1009 1218+11 1314+06 1408-01 2936-12 2833-23 293640 295549 277449\nLIT 1911 2115+10 2313+05 2910-01 3316-14 3125-27 294641 294452 286953\nLKV              1920+04 1825-05 1850-18 2056-26 206440 206750 206661\nLND              2808+12 2712+03 2627-15 2725-27 283543 304152 325362\nLOU 9900 3122+03 3239-01 3247-08 3256-19 3262-31 337546 337355 316057\nLRD 1312 1627+12 1820+10 2311+06 2527-11 2645-23 276637 276947 266853\nLSE 1930 2333+06 2838+02 2944-04 3155-19 3163-31 317046 317555 316262\nLWS 0505 9900+14 2009+07 2116-01 2229-18 2239-28 255142 256051 256862\nMBW              2718    2819+02 2817-15 2821-27 302843 323553 334863\nMCW 1830 2530+12 2736+05 2943-02 2944-17 3053-30 316045 316754 316464\nMEM 2208 2410+09 3010+04 3020-03 3229-15 3138-28 315042 305752 297255\nMGM 9900 0318+08 3623+02 3429-03 3230-14 3142-27 306941 297651 289451\nMIA 0423 0216+12 0312+06 3014+02 2834-10 2740-21 286237 288446 288254\nMKC 2028 2430+13 2625+07 2923-01 3018-15 3030-28 314243 304453 304763\nMKG 2219 2617-04 3029-05 3140-10 3256-21 3369-33 337647 337655 327157\nMLB 0526 3409+08 3416+07 3319+01 2940-12 2854-23 287439 288449 288551\nMLS      3007+13 2917+04 2926-02 2933-17 2939-28 294444 304954 306263\nMOB 0710 0719+10 0412+04 3415-01 3130-13 2943-24 295140 284750 278051\nMOT      3116+06 3134+02 3036-05 3038-18 3041-29 304645 304554 293962\nMQT 2133 2734+01 2942-05 3046-09 3153-22 3265-32 327447 327154 326159\nMRF              9900+09 2317+03 2526-13 2530-26 265739 266046 266451\nMSP 2029 2729+09 2835+04 2935-03 2949-19 3057-30 306545 316955 315862\nMSY 0920 0919+12 0908+06 9900+00 2924-13 2939-23 293441 285048 287549\nOKC 1924 2314+11 2314+06 2309+01 3111-14 2729-25 253742 253152 265052\nOMA 2029 2333+12 2727+07 2834-01 2727-15 2936-28 304944 305254 295364\nONL      2521+17 2724+08 2830+00 2934-15 2837-28 284343 284854 284964\nONT 2409 1910+12 1814+07 2017+01 2128-12 2131-25 233240 234149 224161\nORF 3521 3020-03 2631-10 2941-15 3066-26 3173-38 307247 306546 284445\nOTH 2313 1511+02 1625-03 1636-09 1763-22 1879-28 690040 189649 197657\nPDX 2807 2905+06 1012+01 1527-05 1842-19 1745-30 207642 208150 217760\nPFN 0515 0523+10 0317+04 3521-01 3035-13 3047-25 296639 287550 288851\nPHX 2505 2406+17 1611+09 1516+02 9900-13 3219-24 302039 301850 272960\nPIE 0623 0310+12 0115+07 3417+01 2935-11 2851-22 286838 298448 288152\nPIH      2212    2215+09 2117+00 2428-15 2432-26 263241 283951 283762\nPIR      3016+14 2922+06 2925-01 2935-16 2839-28 284544 285255 294763\nPLB 3015 2916-14 2919-20 3020-23 2921-31 2820-41 282148 282647 272245\nPRC              2009+11 1809+02 2608-13 3114-24 281740 311150 090860\nPSB      3114-10 3227-15 3340-18 3476-25 3482-38 348350 336949 315148\nPSX 1019 1512+11 2017+08 2221+03 2724-10 2731-23 275439 276747 266450\nPUB              2005+13 2206+04 2914-15 2715-27 301742 291353 301760\nPWM 3213 3011-11 2818-19 2721-22 2626-31 2524-41 233845 234845 243944\nRAP      3609+15 3015+08 2822+00 2933-16 2836-28 293744 304154 304263\nRBL 1518 1832+04 1939-02 1953-07 1970-19 2076-25 197940 197950 197059\nRDM      1816+13 1717+04 1720-05 1846-20 2053-28 217441 217750 216961\nRDU 3317 3027+01 2938-05 3137-10 3256-24 3271-35 327849 327751 306248\nRIC 3418 3017-05 2827-11 3143-14 3274-25 3382-37 327748 316748 305748\nRKS              2711    2711+03 2522-15 2720-27 292542 313252 334562\nRNO      2119    2021+06 1829-02 1945-16 2160-26 205440 194950 185162\nROA 3215 3116-03 3227-06 3241-09 3251-23 3266-35 337848 327753 316550\nROW      1813    2208+09 2410+02 2513-14 2617-27 252244 262749 254351\nSAC 2010 1623+05 1739+00 1945-05 1961-16 2065-25 196340 196351 196061\nSAN 9900 1907+12 1911+07 2114+02 2021-11 2024-24 222939 233649 224261\nSAT 1332 1821+12 2019+07 2212+04 2525-11 2636-23 265839 266947 266551\nSAV 3007 3422+06 3433+00 3237-04 3247-16 3060-29 308244 790051 790652\nSBA 9900 1909+09 2014+04 2025-02 2144-12 2147-26 224640 225350 224960\nSEA 2508 2005+09 1714+03 1825-05 1829-19 1833-31 226243 227551 227360\nSFO 1927 1830+05 1835+00 1945-06 1965-16 2068-24 196840 196750 206360\nSGF 2018 2125+09 2514+06 2815-02 3320-15 3227-28 313842 304352 295061\nSHV 1610 1718+11 1816+05 1806+00 3018-12 2937-24 275141 265551 277050\nSIY      1732+03 1833-01 1852-08 1865-19 1977-25 198440 198349 197660\nSLC      9900    2113+11 2116+02 2222-14 2520-26 251841 302451 312461\nSLN 1930 2329+15 2421+09 2619+01 2414-14 2917-27 292843 283153 283361\nSPI 1718 2723+07 2929+02 3041-05 3245-17 3255-30 326645 327054 316962\nSPS 1819 1911+11 1911+05 2509-01 2527-13 2528-25 252842 252652 255350\nSSM 2227 2526-08 2927-09 3035-13 3254-23 3265-35 338348 338255 326456\nSTL 1817 2628+08 2830+03 3034-04 3338-16 3345-29 325644 326154 316762\nSYR 3017 3115-13 3219-18 3224-22 3335-31 3462-39 345648 324547 314347\nT01 1119 1219+12 1505+06 9900+01 3029-10 3033-23 284638 276348 276048\nT06 0822 0920+13 1113+07 9900+02 3030-12 2941-22 285039 286945 276550\nT07 0722 0621+13 0611+07 0208+01 3031-12 2943-23 265239 277446 288152\nTCC      1817    2015+08 2411+02 2807-14 2509-27 290944 271451 243854\nTLH 0613 0425+08 0127+04 3427-01 3132-13 3053-25 296739 287151 289451\nTRI      3015+00 3133-03 3135-08 3251-21 3265-32 326946 326953 316754\nTUL 1923 2124+11 2311+06 2510+00 2806-14 2815-27 272642 282652 275154\nTUS      2708+18 2206+10 1709+02 2706-12 3119-24 293339 293449 275258\nTVC 2121 2522-05 3028-07 3139-11 3255-22 3265-33 337547 337655 326658\nTYS 3211 3014+04 3137-01 3242-07 3255-19 3368-31 326946 316353 307655\nWJF      2119+12 1918+06 2021+00 2134-12 2137-25 223840 234650 214461\nYKM 9900 9900+12 1513+05 1822-03 1932-19 1939-30 226342 227250 237261\nZUN              9900+13 2605+04 9900-15 9900-26 011442 352152 311657\n2XG 0317 3517+07 3224+03 3130-03 3050-15 2869-26 289640 780050 780652\n4J3 0720 0417+12 0114+06 3513+00 2933-12 2943-22 285639 288148 298151\n"
  },
  "windAloft24": {
    "@context": {
      "@version": "1.1",
      "@vocab": "https://api.weather.gov/ontology#"
    },
    "@id": "https://api.weather.gov/products/85b7d75c-f8aa-4b7f-a8b2-a447f3a4b621",
    "id": "85b7d75c-f8aa-4b7f-a8b2-a447f3a4b621",
    "wmoCollectiveId": "FBUS35",
    "issuingOffice": "KWNO",
    "issuanceTime": "2026-04-20T13:59:00+00:00",
    "productCode": "FD5",
    "productName": "Winds Aloft Forecast",
    "productText": "\n000\nFBUS35 KWNO 201359\nFD5US5\nDATA BASED ON 201200Z    \nVALID 211200Z   FOR USE 0600-1800Z. TEMPS NEG ABV 24000\n\nFT  3000    6000    9000   12000   18000   24000  30000  34000  39000\nABI      2137+11 2514+06 2908+01 2912-14 2521-26 262742 274948 275053\nABQ              2808+10 2807+03 9900-14 2611-25 322041 322650 303158\nABR 0410 3513+10 3118+03 3026-03 3034-17 3036-28 304244 314654 315462\nACK 0417 3306-09 2211-16 2715-19 3126-29 3449-37 344748 323347 292947\nACY 3415 3319-07 3333-09 3341-12 3455-23 3466-35 347747 337553 325253\nAGC 2310 3016-03 3229-03 3237-09 3252-21 3258-32 326547 326854 325359\nALB 9900 2908-12 3219-12 3331-15 3349-25 3369-37 337848 336852 325653\nALS                      3308+03 9900-14 2708-26 351242 361851 012060\nAMA      2622    2409+08 2508+01 9900-14 3406-27 031543 031153 312155\nAST 3007 1110+02 1712-03 1622-09 1538-20 1447-33 178846 178551 175355\nATL 3511 3516+07 3524+02 3626-04 3327-15 3134-28 314543 305452 306855\nAVP 0106 3215-09 3226-10 3234-13 3353-24 3367-35 337347 326853 326456\nAXN 3615 3223+07 3230+02 3131-04 3037-17 3039-29 314645 314754 294261\nBAM              1924+05 2041-02 1952-15 1962-27 195442 205551 215361\nBCE                      1825+01 2021-13 2022-25 202741 222350 222563\nBDL 0610 2705-12 3218-14 3329-16 3350-26 3465-37 347048 336251 324751\nBFF      2710    2914+11 2916+02 2920-15 3123-27 323542 333351 333662\nBGR 3606 3211-15 2916-17 3018-21 2920-30 3228-39 322748 282148 251947\nBHM 9900 3110+09 3411+03 0213-04 3216-15 3125-27 304242 294753 296455\nBIH      9900    1917+03 2031-03 1952-14 2058-25 205941 215951 225260\nBIL      2718    2717+08 2714+00 2725-16 2738-27 273841 274251 264762\nBLH 1909 2010+14 2015+07 2020+01 2026-13 2027-25 232340 232351 253159\nBML 2905 3110-14 3015-16 3121-20 3341-27 3347-39 334949 324151 303449\nBNA 2619 2725+09 2920+04 3314-04 3222-16 3135-29 304344 304953 295960\nBOI      1818+15 1921+08 1720-01 1936-15 2055-28 205142 214952 214962\nBOS 0213 2811-12 3014-16 3219-19 3445-27 3455-38 345148 334450 303548\nBRL 2644 2723+12 2632+06 2632-01 2836-17 2943-29 284645 285155 294862\nBRO 1722 1821+13 1818+09 2808+06 2623-12 2744-21 285936 276746 276856\nBUF 2310 2919-06 3034-08 3138-11 3257-23 3268-34 327447 326653 315556\nCAE 0609 3323+05 3535+01 3534-04 3341-17 3251-29 326244 316852 307657\nCAR 3405 2915-17 2916-18 2918-22 2820-31 3022-40 281948 242247 232346\nCGI 2532 2529+10 2421+05 2310-03 2821-16 2929-28 283344 284154 284961\nCHS 9900 3115+04 3528+00 3433-04 3241-17 3251-29 316544 317152 308155\nCLE 2325 2926+03 2830-03 2936-08 3157-20 3162-32 326346 326154 315259\nCLL 1621 2024+10 2324+06 2425+00 2421-12 2421-24 264639 277249 277457\nCMH 2219 3029+05 2928-02 3030-07 3151-20 3161-31 326446 325954 315060\nCOU 2545 2626+12 2319+07 2710-01 2729-15 2729-28 283444 274154 284362\nCRP 1722 1823+12 2121+07 2514+04 2729-13 2744-21 276137 277046 276956\nCRW 2208 3120+04 3230-01 3334-07 3250-20 3258-31 326246 326354 315559\nCSG 0109 0213+09 3620+02 0122-03 3223-15 3130-27 304342 304852 296653\nCVG 2623 2829+04 2926+01 3023-05 3043-18 3157-30 316245 316455 315761\nCZI              2912+09 2913+01 2824-14 2829-27 293140 303251 293761\nDAL 1720 2520+10 2612+05 2611-01 2815-14 2526-26 214643 244850 265654\nDBQ 2841 2917+10 2632+06 2738-02 2938-18 2946-29 304445 304255 294161\nDEN              9900+11 2606+03 2911-15 3107-26 331542 342151 353062\nDIK      2813+12 3020+04 3031-03 2937-17 2939-28 305742 316651 317162\nDLH 3517 3121+06 3021+01 3027-05 3034-17 3034-30 303746 304054 294060\nDLN              2121+09 2222+01 2324-16 2439-27 223942 225151 224762\nDRT 1815 1925+10 2708+09 2918+04 2724-13 2746-22 276137 276847 276856\nDSM 2744 2922+15 2514+07 2522-01 2929-17 2936-29 303745 293854 294162\nECK 2338 2730+02 2835-02 2843-08 3056-21 3159-32 326446 336354 325560\nEKN      3115-01 3228-03 3335-08 3248-21 3256-32 326046 326154 315359\nELP      1808    2805+10 3207+02 2812-12 2818-24 283439 274349 275757\nELY              2027+06 2040-01 1938-12 1939-26 204041 204551 204663\nEMI 3105 3221-06 3329-07 3337-11 3350-23 3364-33 336847 326353 325958\nEVV 2631 2727+10 2725+04 2817-04 2933-17 3043-29 304744 305354 305662\nEYW 0732 0914+12 0207+08 3106+02 2933-11 2941-21 296236 288244 287654\nFAT 1618 1723+06 1831+00 2035-05 2059-14 2166-26 206941 216851 216559\nGPI      9900+12 2510+06 2418-02 2426-18 2442-28 234642 235352 235962\nFLO 0708 3125+02 3330-01 3436-05 3344-18 3246-30 325844 326752 307357\nFMN              9900+10 9900+03 2407-14 2306-26 321340 301350 311461\nFOT 1906 1717-01 1922-06 1824-13 1842-27 1846-38 187243 186945 195248\nFSD 0419 3414+12 3118+05 3024-02 3034-16 3137-28 314044 314154 304462\nFSM 2423 2426+08 2512+04 2411-01 2317-15 2611-26 242544 253452 263957\nFWA 2538 2737+04 2730+00 2836-05 3049-19 3055-31 316146 315655 314761\nGAG      2617+14 9900+08 9900+02 3605-15 3506-26 361443 351353 301958\nGCK      2414+18 2508+11 9900+03 3509-15 3115-27 321843 331953 332261\nGEG      1108+13 1709+06 2120-02 2221-18 2143-30 215043 214952 215863\nGFK 9900 3225+06 3240+00 3141-05 3040-18 3042-30 315045 305055 294860\nGGW      2618+13 2618+05 2726-03 2835-17 2842-28 295942 296851 296862\nGJT              2406+10 2310+03 2309-14 9900-25 261240 200850 241461\nGLD      0105    9900+12 2905+03 3416-15 3012-28 342343 342852 364061\nGRB 3217 2814+07 2829+02 2934-05 2941-18 3042-30 304045 303354 314160\nGRI      2913+18 2713+10 2816+01 3023-15 3027-28 323344 323554 324162\nGSP 0809 3324+06 3433+00 3533-04 3342-17 3250-29 325844 316453 307359\nGTF      2206    2613+07 2620-01 2528-17 2644-28 254541 255052 245661\nH51 1516 1605+13 2107+08 2006+04 2721-12 2845-21 286036 286946 276956\nH52 1127 1115+13 0707+08 3311+03 3019-11 2833-22 296337 297146 287755\nH61 0721 0620+12 0210+07 3408+02 3024-11 3038-23 295739 297145 286652\nHAT 0215 3225-03 3233-03 3136-08 3246-21 3352-32 346346 336253 315954\nHOU 1320 1921+12 2317+07 2317+01 2627-13 2737-24 276438 287348 277556\nHSV 2407 2817+08 3113+03 0112-04 3314-15 3126-28 304043 304853 296357\nICT 2237 2425+13 2614+08 2810+02 3513-15 3110-27 321543 302253 282360\nILM 0505 3229+02 3231-02 3334-06 3342-19 3346-30 335045 326053 306155\nIMB              1514+04 1630-03 1845-19 1970-29 197042 197152 196660\nIND 2534 2731+06 2825+03 2830-04 2946-18 3051-30 305745 316255 305461\nINK      2210+15 3009+09 3108+01 2821-13 2831-26 285839 286947 285454\nINL 3415 3228+02 3135-02 3036-06 2944-18 2942-30 294646 294654 284360\nJAN 1810 1814+10 2007+04 1907-02 2410-14 2818-25 263242 264952 286455\nJAX 0114 0314+06 0224+03 3519-01 3133-15 3039-26 305241 295651 297649\nJFK 0510 3512-09 3326-11 3339-13 3354-24 3470-36 347947 337152 325152\nJOT 2644 2921+09 2732+04 2738-03 2945-18 2950-29 305446 305055 304561\nLAS      1919+13 1927+06 2028+00 1932-13 2034-26 213240 203651 213461\nLBB      2411+10 2810+09 3013+01 2911-14 2812-27 271644 292350 284152\nLCH 1330 1719+12 2114+05 2815+00 2627-13 2630-25 275440 287449 277054\nLIT 2218 2422+09 2121+04 2112-01 2014-14 2517-26 253043 254953 275057\nLKV              2028-01 1936-07 1745-20 1877-29 188943 188852 197858\nLND              2613+10 2621+01 2616-14 2523-27 262441 252651 243361\nLOU 2625 2823+06 2923+03 3020-04 3138-18 3151-30 315545 316154 306561\nLRD 1616 1725+13 2117+10 2913+05 2634-13 2744-21 276236 276746 276956\nLSE 3512 3016+10 2827+04 2932-03 2937-18 2938-30 304545 304555 303861\nLWS 9900 1607+15 1813+07 2019-01 2225-18 2144-29 215143 214852 215562\nMBW              2713    2715+02 2713-14 2917-26 302441 322150 292761\nMCW 3316 2916+12 2730+07 2738-02 2836-18 2938-29 304145 304355 304462\nMEM 2321 2325+10 2513+04 2409-02 2610-15 2816-27 293443 275753 285657\nMGM 0705 0209+10 0214+03 0316-03 3119-15 3031-27 304842 305153 296453\nMIA 0626 0613+12 0109+07 3213+02 3026-12 2936-23 295638 287444 287652\nMKC 2545 2528+13 2520+07 2816+00 2919-15 2827-28 282944 283254 283761\nMKG 2542 2826+05 2629+00 2745-04 2951-19 3051-30 314545 323454 314161\nMLB 0622 0524+07 3416+05 3215+01 3024-13 3038-24 295141 295749 287449\nMLS      2415+15 2613+07 2719-01 2832-17 2841-27 304841 305351 295162\nMOB 1220 0913+11 0510+05 0106-01 2815-13 2822-25 283541 285151 296653\nMOT      2615+08 2920+01 2927-05 3038-18 2942-29 294845 306752 318262\nMQT 3121 2827+03 2934+01 3037-06 3047-19 3245-31 315245 305654 314960\nMRF              3007+10 3011+03 2719-13 2739-23 285138 276348 276756\nMSP 3615 3022+09 2828+03 2930-04 3034-17 3036-29 304145 304154 293761\nMSY 1023 1115+12 1107+05 1814-01 2830-12 2728-24 273140 286149 287255\nOKC 2235 2321+10 2316+04 1307+00 2507-14 2615-27 242244 262252 273056\nOMA 2638 2923+16 2618+09 2621+00 2929-16 2933-29 303544 313654 293562\nONL      3309+15 3018+08 3024+00 3034-16 3133-27 313544 313754 334762\nONT 9900 2412+09 2220+05 2127+00 2132-13 2334-24 233841 243950 243960\nORF 0111 3223-04 3232-05 3237-09 3348-21 3357-32 336446 326453 315756\nOTH 2205 1508+00 1412-06 1727-12 1651-25 1671-36 169144 177948 175351\nPDX 2907 2308+02 1115-01 1327-06 1647-19 1745-32 188644 188552 185955\nPFN 0818 0717+11 0212+04 0114-01 3114-14 2931-25 305441 295351 296751\nPHX 9900 2007+14 1916+07 2023+01 1917-12 2116-25 232339 201951 232959\nPIE 0725 0521+09 3515+06 3215+01 3118-12 3033-23 304341 295848 286650\nPIH      2122    2220+09 2120+01 2129-14 2332-26 214042 214751 224963\nPIR      2809+13 3022+06 3129-01 3036-16 3034-27 303844 325352 336462\nPLB 2208 2813-13 2916-14 3124-17 3142-26 3256-39 326948 325952 314851\nPRC              1820+07 2027+01 1920-12 2019-25 212740 202150 212561\nPSB      3120-06 3226-07 3240-10 3250-23 3262-33 326747 326153 325758\nPSX 1522 2020+12 2218+07 2213+02 2725-13 2742-22 276337 287047 287057\nPUB              9900+12 9900+04 2706-14 3008-27 361642 351951 023061\nPWM 3605 3013-13 2917-17 3120-20 3334-28 3452-38 344749 323550 302848\nRAP      9900+15 2507+08 2813+00 2929-16 3032-27 314541 324451 335062\nRBL 1619 2020+00 2029-05 1955-10 1876-23 1891-33 690942 690350 207251\nRDM      2022+04 1726-01 1637-06 1749-19 1854-33 188743 188752 187157\nRDU 0608 3224+01 3332-02 3337-07 3343-19 3345-30 325146 325754 315757\nRIC 3614 3222-04 3232-05 3336-09 3344-21 3355-32 336646 326753 325858\nRKS              2005    2508+02 2517-14 2417-26 252040 242050 242962\nRNO      2114    1931+01 1832-05 1960-19 1974-27 198042 197951 217560\nROA 1607 3120+00 3330-02 3338-07 3347-19 3248-31 325246 325454 315359\nROW      2314    2812+10 3015+02 3009-13 3116-25 312542 304348 304255\nSAC 2114 2130+01 1951-02 1858-08 1865-21 1987-28 199342 209350 218056\nSAN 3107 2611+10 2317+06 2122+01 2324-12 2427-24 243241 253950 253959\nSAT 1627 1929+12 2122+08 2414+04 2732-14 2748-22 276137 276846 276756\nSAV 3315 3315+05 3631+01 3529-02 3239-15 3146-28 315643 316252 307852\nSBA 1806 2222+06 2231+01 2139-04 2248-12 2254-25 225441 235551 235559\nSEA 0207 0512+06 0911+01 1319-05 1738-19 1833-33 186843 186752 186060\nSFO 2216 2124+01 2032-04 1947-10 1968-22 2089-28 209641 209349 217754\nSGF 2435 2620+11 2416+06 2314-01 2416-15 2617-27 262443 262353 273659\nSHV 1715 1925+09 2318+02 2509-02 2712-13 2636-26 255042 265851 266156\nSIY      1725+02 1927-05 1935-11 1861-23 1888-33 680642 189850 187053\nSLC      1907    2118+09 2121+01 2122-13 2223-26 213041 213251 213363\nSLN 2343 2617+15 2706+08 3109+01 3217-14 3020-27 292343 292554 303061\nSPI 2643 2733+12 2631+06 2624-02 2838-17 2942-29 294645 295054 295362\nSPS 2028 2429+10 2314+05 2211+00 2609-14 2512-27 251744 262251 273953\nSSM 2632 2819-01 2846-03 2951-07 3060-20 3161-31 327045 317554 316359\nSTL 2542 2529+12 2423+06 2413-02 2834-16 2836-28 284044 284754 284662\nSYR 2311 2914-09 3022-11 3133-14 3255-24 3271-36 327847 327052 315256\nT01 1423 1617+13 2506+07 2705+01 2725-12 2735-23 286438 287048 287456\nT06 1123 1416+12 1410+06 2706+01 2826-12 2631-24 286138 287548 287454\nT07 1024 0915+12 0410+07 0106+00 3021-11 3034-24 284941 297248 287152\nTCC      2622    2814+10 2807+02 3306-14 0116-26 361443 351953 313054\nTLH 0414 0517+09 0216+03 0118-02 3123-15 3034-26 305941 306151 296751\nTRI      3220+05 3326+00 3431-06 3347-19 3354-30 326245 326654 317059\nTUL 2331 2421+10 2415+05 9900+00 2616-14 2615-26 242344 262453 263358\nTUS      9900+15 1712+08 1916+02 2012-11 2214-24 232240 222050 253858\nTVC 2630 2714+02 2837+01 2945-06 3049-19 3150-30 314945 324854 324961\nTYS 2911 3218+06 3322+01 3426-05 3339-18 3249-29 315744 316353 307060\nWJF      2321+09 2226+04 2133-02 2141-13 2242-24 224441 234651 234660\nYKM 0412 1008+10 1112+03 1526-03 1834-19 1952-30 186743 196752 196662\nZUN              2608+10 1807+02 2313-13 2510-24 291040 271750 272061\n2XG 0213 0120+04 3522+01 3327-02 3141-15 3051-27 306242 306850 298748\n4J3 0830 0621+10 0115+06 3414+00 3019-12 3031-23 304041 295549 286450\n"
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
          "end": "2026-04-20T18:05:00Z"
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
            "1:10 AM",
            "1:15 AM",
            "1:20 AM",
            "1:25 AM",
            "1:30 AM",
            "1:35 AM",
            "1:40 AM",
            "1:45 AM",
            "1:50 AM",
            "1:54 AM",
            "1:55 AM",
            "2:00 AM",
            "2:05 AM",
            "2:10 AM",
            "2:15 AM",
            "2:20 AM",
            "2:25 AM",
            "2:30 AM",
            "2:35 AM",
            "2:40 AM",
            "2:45 AM",
            "2:50 AM",
            "2:54 AM",
            "2:55 AM",
            "3:00 AM",
            "3:05 AM",
            "3:10 AM",
            "3:15 AM",
            "3:20 AM",
            "3:25 AM",
            "3:30 AM",
            "3:35 AM",
            "3:40 AM",
            "3:45 AM",
            "3:50 AM",
            "3:54 AM",
            "3:55 AM",
            "4:00 AM",
            "4:05 AM",
            "4:10 AM",
            "4:15 AM",
            "4:20 AM",
            "4:25 AM",
            "4:30 AM",
            "4:35 AM",
            "4:40 AM",
            "4:45 AM",
            "4:50 AM",
            "4:54 AM",
            "4:55 AM",
            "5:00 AM",
            "5:05 AM",
            "5:10 AM",
            "5:15 AM",
            "5:20 AM",
            "5:25 AM",
            "5:30 AM",
            "5:35 AM",
            "5:40 AM",
            "5:45 AM",
            "5:50 AM",
            "5:54 AM",
            "5:55 AM",
            "6:00 AM",
            "6:05 AM",
            "6:10 AM",
            "6:15 AM",
            "6:20 AM",
            "6:25 AM",
            "6:30 AM",
            "6:35 AM",
            "6:40 AM",
            "6:45 AM",
            "6:50 AM",
            "6:54 AM",
            "6:55 AM",
            "7:00 AM",
            "7:05 AM",
            "7:10 AM",
            "7:15 AM",
            "7:20 AM",
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
            "8:20 AM",
            "8:25 AM",
            "8:30 AM",
            "8:35 AM",
            "8:40 AM",
            "8:45 AM",
            "8:50 AM",
            "8:54 AM",
            "8:55 AM",
            "9:00 AM",
            "9:05 AM",
            "9:10 AM",
            "9:15 AM",
            "9:20 AM",
            "9:25 AM",
            "9:30 AM",
            "9:35 AM",
            "9:40 AM",
            "9:45 AM",
            "9:50 AM",
            "9:54 AM",
            "9:55 AM",
            "10:00 AM",
            "10:05 AM",
            "10:10 AM",
            "10:15 AM",
            "10:20 AM",
            "10:25 AM",
            "10:30 AM",
            "10:35 AM",
            "10:40 AM",
            "10:45 AM",
            "10:50 AM",
            "10:54 AM",
            "10:55 AM",
            "11:00 AM",
            "11:05 AM",
            "11:10 AM",
            "11:15 AM",
            "11:20 AM",
            "11:25 AM",
            "11:30 AM",
            "11:35 AM",
            "11:40 AM",
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
            "12:40 PM",
            "12:45 PM",
            "12:50 PM",
            "12:54 PM",
            "12:55 PM"
          ],
          "air_temp_set_1": [
            55.4,
            57.2,
            57.2,
            57.2,
            57.2,
            57.2,
            57.2,
            57.2,
            57.2,
            57.92,
            57.2,
            59,
            59,
            59,
            59,
            59,
            57.2,
            57.2,
            55.4,
            55.4,
            57.2,
            55.4,
            55.94,
            55.4,
            55.4,
            55.4,
            55.4,
            57.2,
            55.4,
            55.4,
            55.4,
            55.4,
            55.4,
            55.4,
            55.4,
            55.94,
            55.4,
            55.4,
            55.4,
            55.4,
            55.4,
            55.4,
            55.4,
            57.2,
            57.2,
            55.4,
            55.4,
            55.4,
            55.94,
            55.4,
            55.4,
            55.4,
            55.4,
            55.4,
            53.6,
            53.6,
            53.6,
            53.6,
            53.6,
            53.6,
            53.6,
            53.06,
            53.6,
            53.6,
            53.6,
            53.6,
            53.6,
            53.6,
            53.6,
            53.6,
            53.6,
            53.6,
            53.6,
            55.4,
            53.96,
            53.6,
            53.6,
            53.6,
            53.6,
            55.4,
            55.4,
            55.4,
            55.4,
            55.4,
            57.2,
            57.2,
            57.2,
            57.92,
            57.2,
            59,
            59,
            59,
            59,
            59,
            60.8,
            60.8,
            60.8,
            60.8,
            62.6,
            62.6,
            62.06,
            62.6,
            62.6,
            62.6,
            64.4,
            64.4,
            64.4,
            64.4,
            66.2,
            64.4,
            64.4,
            64.4,
            64.4,
            64.94,
            64.4,
            64.4,
            66.2,
            66.2,
            66.2,
            68,
            68,
            69.8,
            71.6,
            71.6,
            71.6,
            71.6,
            73.94,
            73.4,
            73.4,
            75.2,
            75.2,
            75.2,
            75.2,
            75.2,
            75.2,
            75.2,
            75.2,
            75.2,
            75.2,
            75.92,
            75.2,
            77,
            77,
            78.8,
            78.8,
            77,
            78.8,
            78.8,
            78.8,
            78.8,
            78.8,
            78.8,
            78.08,
            78.8
          ],
          "wind_speed_set_1": [
            11.51,
            12.66,
            11.51,
            10.36,
            11.51,
            10.36,
            11.51,
            11.51,
            13.81,
            13.81,
            16.11,
            14.96,
            13.81,
            12.66,
            12.66,
            11.51,
            11.51,
            9.21,
            9.21,
            11.51,
            9.21,
            9.21,
            10.36,
            10.36,
            11.51,
            10.36,
            10.36,
            11.51,
            11.51,
            11.51,
            11.51,
            12.66,
            13.81,
            12.66,
            11.51,
            11.51,
            10.36,
            12.66,
            12.66,
            12.66,
            13.81,
            10.36,
            12.66,
            13.81,
            11.51,
            12.66,
            11.51,
            13.81,
            14.96,
            13.81,
            10.36,
            10.36,
            10.36,
            8.06,
            8.06,
            9.21,
            9.21,
            8.06,
            9.21,
            8.06,
            8.06,
            8.06,
            8.06,
            10.36,
            9.21,
            6.91,
            9.21,
            10.36,
            9.21,
            8.06,
            9.21,
            9.21,
            8.06,
            8.06,
            8.06,
            6.91,
            8.06,
            10.36,
            10.36,
            8.06,
            8.06,
            5.75,
            6.91,
            8.06,
            8.06,
            10.36,
            10.36,
            9.21,
            9.21,
            10.36,
            9.21,
            10.36,
            10.36,
            10.36,
            10.36,
            9.21,
            11.51,
            11.51,
            11.51,
            9.21,
            10.36,
            9.21,
            9.21,
            8.06,
            8.06,
            9.21,
            8.06,
            8.06,
            8.06,
            5.75,
            5.75,
            5.75,
            6.91,
            6.91,
            6.91,
            6.91,
            8.06,
            8.06,
            8.06,
            10.36,
            8.06,
            8.06,
            8.06,
            8.06,
            9.21,
            10.36,
            11.51,
            12.66,
            13.81,
            12.66,
            16.11,
            18.41,
            17.26,
            16.11,
            17.26,
            18.41,
            14.96,
            16.11,
            19.56,
            18.41,
            19.56,
            13.81,
            16.11,
            16.11,
            17.26,
            18.41,
            18.41,
            14.96,
            17.26,
            17.26,
            14.96,
            16.11,
            18.41,
            16.11
          ],
          "wind_direction_set_1": [
            130,
            130,
            130,
            130,
            120,
            130,
            140,
            140,
            140,
            140,
            130,
            130,
            140,
            130,
            130,
            140,
            120,
            120,
            110,
            120,
            120,
            130,
            140,
            130,
            130,
            130,
            120,
            120,
            120,
            120,
            120,
            120,
            120,
            120,
            120,
            130,
            130,
            120,
            120,
            130,
            130,
            140,
            130,
            140,
            140,
            130,
            130,
            130,
            130,
            130,
            140,
            130,
            140,
            130,
            130,
            120,
            130,
            130,
            130,
            130,
            140,
            120,
            120,
            120,
            120,
            120,
            120,
            110,
            120,
            120,
            110,
            110,
            110,
            120,
            120,
            120,
            120,
            130,
            120,
            120,
            120,
            110,
            120,
            110,
            110,
            110,
            120,
            120,
            120,
            120,
            110,
            110,
            110,
            120,
            110,
            120,
            120,
            120,
            120,
            120,
            120,
            130,
            130,
            120,
            130,
            120,
            120,
            120,
            120,
            130,
            130,
            140,
            140,
            140,
            140,
            150,
            140,
            140,
            140,
            140,
            140,
            130,
            130,
            140,
            100,
            150,
            160,
            160,
            160,
            170,
            170,
            180,
            180,
            170,
            170,
            170,
            170,
            180,
            170,
            160,
            170,
            170,
            180,
            170,
            170,
            170,
            160,
            160,
            170,
            170,
            180,
            190,
            170,
            180
          ],
          "altimeter_set_1": [
            30.01,
            30.01,
            30.01,
            30.01,
            30.01,
            30.01,
            30,
            30,
            30.01,
            30.01,
            30.01,
            30,
            30.01,
            30,
            30.01,
            30.01,
            30.01,
            30.01,
            30.01,
            30.01,
            30.01,
            30.01,
            30.01,
            30.01,
            30.01,
            30.01,
            30.01,
            30.01,
            30.01,
            30.01,
            30.01,
            30.01,
            30.01,
            30.01,
            30.01,
            30.01,
            30.01,
            30.01,
            30.01,
            30.01,
            30.01,
            30.01,
            30.01,
            30.01,
            30.01,
            30.01,
            30.01,
            30.01,
            30.01,
            30.01,
            30.01,
            30.01,
            30.01,
            30.01,
            30.01,
            30.01,
            30.01,
            30.01,
            30.01,
            30.01,
            30.01,
            30.01,
            30.01,
            30.01,
            30.01,
            30.01,
            30.01,
            30.01,
            30.01,
            30.01,
            30.01,
            30.01,
            30.01,
            30.01,
            30.02,
            30.02,
            30.02,
            30.02,
            30.02,
            30.02,
            30.02,
            30.02,
            30.02,
            30.02,
            30.02,
            30.02,
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
            30.02,
            30.02,
            30.02,
            30.02,
            30.02,
            30.02,
            30.02,
            30.02,
            30.02,
            30.02,
            30.02,
            30.02,
            30.02,
            30.01,
            30.01,
            30.01,
            30.01,
            30.01,
            30.01,
            30,
            30,
            30,
            30,
            30,
            30
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
            null,
            null,
            null,
            null,
            null,
            null,
            18.41,
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
            19.56,
            19.56,
            null,
            null,
            null,
            null,
            null,
            null,
            24.17,
            21.86,
            null,
            25.32,
            27.62,
            null,
            null,
            null,
            null,
            25.32,
            null,
            null,
            null,
            null,
            null,
            null,
            null,
            25.32,
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
          "end": "2026-04-20T17:55:00Z"
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
            "1:15 AM",
            "1:35 AM",
            "1:55 AM",
            "2:15 AM",
            "2:35 AM",
            "2:55 AM",
            "3:15 AM",
            "3:35 AM",
            "3:55 AM",
            "4:15 AM",
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
            "8:55 AM",
            "9:15 AM",
            "9:35 AM",
            "9:55 AM",
            "10:15 AM",
            "10:35 AM",
            "11:15 AM",
            "11:35 AM",
            "11:55 AM",
            "12:15 PM",
            "12:35 PM",
            "12:55 PM"
          ],
          "air_temp_set_1": [
            59,
            60.8,
            60.8,
            59,
            59,
            55.4,
            55.4,
            59,
            57.2,
            57.2,
            57.2,
            57.2,
            55.4,
            57.2,
            55.4,
            53.6,
            55.4,
            55.4,
            55.4,
            57.2,
            59,
            62.6,
            66.2,
            66.2,
            68,
            69.8,
            69.8,
            71.6,
            73.4,
            73.4,
            75.2,
            75.2,
            77,
            77
          ],
          "wind_speed_set_1": [
            12.66,
            16.11,
            11.51,
            12.66,
            12.66,
            9.21,
            6.91,
            13.81,
            13.81,
            13.81,
            13.81,
            12.66,
            10.36,
            10.36,
            6.91,
            6.91,
            10.36,
            9.21,
            12.66,
            11.51,
            10.36,
            null,
            14.96,
            19.56,
            null,
            18.41,
            18.41,
            18.41,
            18.41,
            19.56,
            20.71,
            20.71,
            20.71,
            17.26
          ],
          "wind_direction_set_1": [
            180,
            180,
            180,
            170,
            170,
            180,
            200,
            180,
            180,
            180,
            170,
            190,
            190,
            200,
            210,
            210,
            190,
            190,
            190,
            190,
            200,
            null,
            180,
            180,
            null,
            170,
            170,
            170,
            160,
            160,
            160,
            170,
            150,
            160
          ],
          "altimeter_set_1": [
            30.03,
            30.03,
            30.03,
            30.03,
            30.03,
            30.04,
            30.04,
            30.04,
            30.04,
            30.04,
            30.04,
            30.03,
            30.04,
            30.03,
            30.03,
            30.03,
            30.03,
            30.03,
            30.04,
            30.04,
            30.04,
            30.05,
            30.05,
            30.05,
            30.05,
            30.05,
            30.05,
            30.05,
            30.05,
            30.05,
            30.05,
            30.04,
            30.03,
            30.03
          ],
          "wind_gust_set_1": [
            null,
            null,
            null,
            19.56,
            19.56,
            null,
            null,
            null,
            null,
            null,
            null,
            null,
            null,
            16.11,
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
            25.32,
            27.62,
            24.17,
            26.47,
            27.62,
            26.47,
            26.47,
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
          "end": "2026-04-20T18:00:00Z"
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
            "1:10 AM",
            "1:20 AM",
            "1:30 AM",
            "1:40 AM",
            "1:50 AM",
            "2:00 AM",
            "2:10 AM",
            "2:20 AM",
            "2:30 AM",
            "2:40 AM",
            "2:50 AM",
            "3:00 AM",
            "3:10 AM",
            "3:20 AM",
            "3:30 AM",
            "3:40 AM",
            "3:50 AM",
            "4:00 AM",
            "4:10 AM",
            "4:20 AM",
            "4:30 AM",
            "4:40 AM",
            "4:50 AM",
            "5:00 AM",
            "5:10 AM",
            "5:20 AM",
            "5:30 AM",
            "5:40 AM",
            "5:50 AM",
            "6:00 AM",
            "6:10 AM",
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
            "8:20 AM",
            "8:30 AM",
            "8:40 AM",
            "8:50 AM",
            "9:00 AM",
            "9:10 AM",
            "9:20 AM",
            "9:30 AM",
            "9:40 AM",
            "9:50 AM",
            "10:00 AM",
            "10:10 AM",
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
            "12:20 PM",
            "12:30 PM",
            "12:40 PM",
            "12:50 PM"
          ],
          "air_temp_set_1": [
            55.56,
            58.41,
            60.65,
            58.92,
            54.4,
            54.62,
            56.65,
            55.23,
            54.98,
            55.34,
            54.8,
            54.19,
            53.38,
            54.75,
            54.47,
            53.58,
            53.48,
            52.89,
            52.46,
            51.88,
            52.56,
            52.41,
            52.34,
            53.18,
            52.54,
            52.66,
            52.21,
            51.39,
            52.59,
            51.9,
            51.75,
            51.77,
            51.77,
            50.99,
            51.83,
            51.62,
            52.08,
            51.55,
            53.12,
            53.66,
            55.36,
            54.32,
            55.18,
            55.06,
            56.17,
            56.81,
            57.72,
            60.19,
            63.19,
            63.32,
            64.79,
            65.3,
            66.21,
            66.69,
            68.48,
            67.01,
            68.96,
            68.88,
            70.03,
            70.66,
            71.74,
            71.99,
            72.01,
            72.65,
            73.9,
            72.71,
            73.29,
            72.76,
            74.13,
            73.29,
            73.62
          ],
          "wind_speed_set_1": [
            5.02,
            4.49,
            6.97,
            6.61,
            12.81,
            6.85,
            3.72,
            2.5,
            6.53,
            12.52,
            13.37,
            16.17,
            10.1,
            6.76,
            11.81,
            11.35,
            13.42,
            12.54,
            15.94,
            18.55,
            14.21,
            16.63,
            17.04,
            13.92,
            18.91,
            15.37,
            21.39,
            16.01,
            20.2,
            16.35,
            18.52,
            17.22,
            16.93,
            17.46,
            17.55,
            18.46,
            19.58,
            20.33,
            18.54,
            13.98,
            7.33,
            9.87,
            4.53,
            8.59,
            8.38,
            9.49,
            11.25,
            2.66,
            1.76,
            0.28,
            4.03,
            4.27,
            3.34,
            4.4,
            0.34,
            4.83,
            2.14,
            3.89,
            4.18,
            8.87,
            5.67,
            10.96,
            6.05,
            13,
            7.86,
            8.42,
            11.76,
            9.4,
            5.1,
            12.08,
            12.34
          ],
          "wind_direction_set_1": [
            82.2,
            318.1,
            2.59,
            81.3,
            89.4,
            121.2,
            22.13,
            48.51,
            92.5,
            75,
            88.7,
            82.1,
            100.8,
            89.7,
            74.21,
            86.5,
            80.6,
            99.6,
            80.6,
            73,
            76.83,
            77.48,
            76.33,
            84.2,
            76.94,
            70.33,
            76.27,
            81.3,
            72.57,
            81,
            79.06,
            81.6,
            77.19,
            74.58,
            72.04,
            84,
            78,
            75.7,
            76.99,
            65.84,
            79.71,
            76.54,
            72.69,
            80.2,
            75.14,
            63.97,
            68.33,
            51.83,
            40.26,
            105.8,
            303,
            262.6,
            263,
            258.6,
            237.6,
            219.2,
            111.3,
            217.2,
            234.8,
            230.4,
            210.9,
            197.9,
            180.2,
            189.4,
            219.6,
            195.7,
            194.9,
            204.2,
            190.6,
            206.9,
            228.6
          ],
          "wind_gust_set_1": [
            8.33,
            8.77,
            9.86,
            15.78,
            18.63,
            16.88,
            16.22,
            12.28,
            13.59,
            22.36,
            21.04,
            21.7,
            20.39,
            19.51,
            22.36,
            20.6,
            20.6,
            19.51,
            21.47,
            22.58,
            23.67,
            23.67,
            26.08,
            24.55,
            25.87,
            26.73,
            29.15,
            26.51,
            26.96,
            24.98,
            24.77,
            26.51,
            24.55,
            26.51,
            23.67,
            24.77,
            25.65,
            24.77,
            26.08,
            23.02,
            16,
            19.73,
            16.43,
            12.49,
            12.7,
            13.37,
            14.68,
            11.17,
            6.79,
            5.26,
            6.35,
            8.33,
            7.01,
            6.79,
            5.48,
            11.17,
            5.04,
            9.64,
            11.84,
            11.84,
            16.22,
            18.41,
            20.6,
            18.85,
            17.96,
            21.26,
            20.6,
            18.85,
            20.17,
            28.06,
            23.02
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
          "end": "2026-04-20T18:00:00Z"
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
            "8:00 AM",
            "9:00 AM",
            "10:00 AM",
            "11:00 AM",
            "12:00 PM",
            "1:00 PM"
          ],
          "air_temp_set_1": [
            36.5,
            36.9,
            36.4,
            36.4,
            36.1,
            36.2,
            36.7,
            37.3,
            38.6,
            39.8,
            40.4,
            42
          ],
          "wind_speed_set_1": [
            14.1,
            16.4,
            14.8,
            20.4,
            21.5,
            22.9,
            22.99,
            22.69,
            14.2,
            11,
            10,
            11.4
          ],
          "wind_direction_set_1": [
            166.8,
            209.1,
            193,
            222.7,
            224.9,
            221.4,
            218.3,
            215.9,
            210.8,
            212.4,
            223.9,
            213.9
          ],
          "wind_gust_set_1": [
            23.3,
            32.4,
            29.7,
            32.99,
            35.1,
            41.2,
            37.79,
            37.79,
            31.9,
            23.5,
            24.1,
            28.3
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
          "end": "2026-04-20T18:00:00Z"
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
            "1:15 AM",
            "1:30 AM",
            "1:45 AM",
            "2:00 AM",
            "2:15 AM",
            "2:30 AM",
            "2:45 AM",
            "3:00 AM",
            "3:15 AM",
            "3:30 AM",
            "3:45 AM",
            "4:00 AM",
            "4:15 AM",
            "4:30 AM",
            "4:45 AM",
            "5:00 AM",
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
            "8:15 AM",
            "8:30 AM",
            "8:45 AM",
            "9:00 AM",
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
            "12:15 PM",
            "12:30 PM",
            "12:45 PM",
            "1:00 PM"
          ],
          "air_temp_set_1": [
            44.76,
            44.76,
            44.76,
            43.35,
            43.6,
            43.35,
            44.88,
            44.82,
            44.82,
            44.58,
            43.96,
            43.97,
            43.72,
            43.6,
            42.99,
            42.5,
            42.62,
            42.87,
            42.74,
            42.74,
            43.23,
            42.38,
            42.07,
            42.07,
            41.83,
            41.64,
            41.64,
            41.64,
            41.27,
            41.28,
            41.28,
            41.4,
            41.52,
            41.89,
            41.77,
            41.83,
            42.14,
            42.38,
            42.63,
            43.24,
            43.85,
            44.03,
            44.46,
            45.31,
            45.56,
            46.17,
            46.66,
            47.09
          ],
          "wind_speed_set_1": [
            25.34,
            26.27,
            26.98,
            25.66,
            27.11,
            28.64,
            29.74,
            29.78,
            32.54,
            31.46,
            32.04,
            32.53,
            32.93,
            29.25,
            30.47,
            29.9,
            29.71,
            29.08,
            29.25,
            27.26,
            29.05,
            29.33,
            29.32,
            30.32,
            28.87,
            28.01,
            31.29,
            31.47,
            31.99,
            29.61,
            31.63,
            31.09,
            29.98,
            29.62,
            26.8,
            25.31,
            25.36,
            24.89,
            24.03,
            22.37,
            20.77,
            19.07,
            18.84,
            17.99,
            14.97,
            15.44,
            14.84,
            14.45
          ],
          "wind_direction_set_1": [
            197.5,
            200.3,
            201.6,
            200.4,
            196.5,
            196.3,
            203.8,
            200.2,
            200.3,
            202.2,
            198.4,
            204.7,
            212.3,
            220.5,
            213.8,
            215.7,
            215,
            211.1,
            209,
            211.8,
            210.1,
            209.4,
            213.9,
            208.8,
            216.7,
            216,
            212.9,
            211.7,
            214.8,
            224.4,
            224.5,
            222.9,
            221.5,
            219.3,
            218.6,
            0,
            227.3,
            0,
            228.5,
            229.3,
            238.8,
            239.4,
            234,
            236.1,
            251.7,
            260.3,
            250.1,
            250
          ],
          "wind_gust_set_1": [
            28.3,
            30.3,
            31.99,
            30.9,
            31.2,
            31.8,
            33.6,
            32.6,
            36.49,
            35.8,
            36.3,
            36,
            38.49,
            36.49,
            36.19,
            35.89,
            36,
            34.1,
            34.2,
            32.69,
            34.5,
            33.5,
            35.4,
            34.99,
            34.2,
            37,
            37.19,
            38.9,
            39.09,
            39.09,
            38.4,
            40.9,
            37.1,
            36.8,
            33.9,
            34.1,
            33.2,
            34.5,
            33.2,
            29.09,
            29.09,
            28.1,
            27,
            26.7,
            20.49,
            23.6,
            21.5,
            21.9
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
          "end": "2026-04-20T18:00:00Z"
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
            "1:15 AM",
            "1:30 AM",
            "1:45 AM",
            "2:00 AM",
            "2:15 AM",
            "2:30 AM",
            "2:45 AM",
            "3:00 AM",
            "3:15 AM",
            "3:30 AM",
            "3:45 AM",
            "4:00 AM",
            "4:15 AM",
            "4:30 AM",
            "4:45 AM",
            "5:00 AM",
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
            "8:15 AM",
            "8:30 AM",
            "8:45 AM",
            "9:00 AM",
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
            "12:15 PM",
            "12:30 PM"
          ],
          "air_temp_set_1": [
            37,
            37,
            37,
            37,
            37,
            37,
            37,
            37,
            37,
            37,
            37,
            36,
            37,
            37,
            37,
            36,
            36,
            36,
            36,
            37,
            37,
            36,
            37,
            37,
            37,
            37,
            37,
            37,
            37,
            37,
            37,
            37,
            37,
            38,
            38,
            39,
            38,
            38,
            39,
            39,
            39,
            39,
            39,
            40,
            40,
            40
          ],
          "wind_speed_set_1": [
            13.99,
            13.99,
            9,
            8,
            7,
            18,
            17,
            13,
            13.99,
            8,
            5.99,
            5.99,
            13.99,
            18,
            22,
            19,
            20,
            21,
            23.99,
            23.99,
            22,
            22,
            32.99,
            33.99,
            30,
            27,
            30,
            28,
            25,
            27,
            21,
            17,
            14.99,
            13.99,
            12,
            10,
            13.99,
            13,
            11,
            12,
            11,
            7,
            13,
            10,
            10,
            13
          ],
          "wind_direction_set_1": [
            180,
            157.5,
            180,
            202.5,
            247.5,
            270,
            270,
            270,
            247.5,
            202.5,
            202.5,
            247.5,
            270,
            247.5,
            247.5,
            247.5,
            270,
            270,
            270,
            270,
            270,
            270,
            247.5,
            247.5,
            270,
            247.5,
            247.5,
            247.5,
            270,
            247.5,
            247.5,
            247.5,
            270,
            225,
            270,
            247.5,
            270,
            247.5,
            270,
            270,
            270,
            270,
            270,
            270,
            247.5,
            270
          ],
          "wind_gust_set_1": [
            20,
            20,
            20,
            16,
            22.99,
            28,
            31,
            25,
            25,
            17,
            11,
            13.99,
            23.99,
            28,
            38,
            34.99,
            34.99,
            31.99,
            37,
            34.99,
            34.99,
            31.99,
            47,
            48,
            41.99,
            41.99,
            39,
            38,
            38,
            39,
            45,
            30,
            27,
            27,
            22.99,
            25,
            27,
            21,
            23.99,
            21,
            23.99,
            16,
            27,
            23.99,
            22.99,
            23.99
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
          "end": "2026-04-20T18:10:00Z"
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
            "1:10 AM",
            "1:15 AM",
            "1:20 AM",
            "1:25 AM",
            "1:30 AM",
            "1:35 AM",
            "1:40 AM",
            "1:45 AM",
            "1:50 AM",
            "1:55 AM",
            "2:00 AM",
            "2:05 AM",
            "2:10 AM",
            "2:15 AM",
            "2:20 AM",
            "2:25 AM",
            "2:30 AM",
            "2:35 AM",
            "2:40 AM",
            "2:45 AM",
            "2:50 AM",
            "2:55 AM",
            "3:00 AM",
            "3:05 AM",
            "3:10 AM",
            "3:15 AM",
            "3:20 AM",
            "3:25 AM",
            "3:30 AM",
            "3:35 AM",
            "3:40 AM",
            "3:45 AM",
            "3:50 AM",
            "3:55 AM",
            "4:00 AM",
            "4:05 AM",
            "4:10 AM",
            "4:15 AM",
            "4:20 AM",
            "4:25 AM",
            "4:30 AM",
            "4:35 AM",
            "4:40 AM",
            "4:45 AM",
            "4:50 AM",
            "4:55 AM",
            "5:00 AM",
            "5:05 AM",
            "5:10 AM",
            "5:15 AM",
            "5:20 AM",
            "5:25 AM",
            "5:30 AM",
            "5:35 AM",
            "5:40 AM",
            "5:45 AM",
            "5:50 AM",
            "5:55 AM",
            "6:00 AM",
            "6:05 AM",
            "6:10 AM",
            "6:15 AM",
            "6:20 AM",
            "6:25 AM",
            "6:30 AM",
            "6:35 AM",
            "6:40 AM",
            "6:45 AM",
            "6:50 AM",
            "6:55 AM",
            "7:00 AM",
            "7:05 AM",
            "7:10 AM",
            "7:15 AM",
            "7:20 AM",
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
            "8:25 AM",
            "8:30 AM",
            "8:35 AM",
            "8:40 AM",
            "8:45 AM",
            "8:50 AM",
            "8:55 AM",
            "9:00 AM",
            "9:05 AM",
            "9:10 AM",
            "9:15 AM",
            "9:20 AM",
            "9:25 AM",
            "9:30 AM",
            "9:35 AM",
            "9:40 AM",
            "9:45 AM",
            "9:50 AM",
            "9:55 AM",
            "10:00 AM",
            "10:05 AM",
            "10:10 AM",
            "10:15 AM",
            "10:20 AM",
            "10:25 AM",
            "10:30 AM",
            "10:35 AM",
            "10:40 AM",
            "10:45 AM",
            "10:50 AM",
            "10:55 AM",
            "11:00 AM",
            "11:05 AM",
            "11:10 AM",
            "11:15 AM",
            "11:20 AM",
            "11:25 AM",
            "11:30 AM",
            "11:35 AM",
            "11:40 AM",
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
            "12:45 PM",
            "12:50 PM",
            "12:55 PM",
            "1:00 PM"
          ],
          "air_temp_set_1": [
            54.01,
            53.21,
            53.55,
            53.52,
            53.41,
            53.46,
            53.99,
            54.87,
            54.48,
            54.16,
            53.6,
            54.14,
            53.72,
            53.14,
            54.57,
            55.4,
            55.43,
            55.37,
            55.27,
            55.13,
            54.44,
            54,
            54.41,
            54.21,
            54.12,
            54.32,
            54.29,
            53.15,
            52.89,
            52.02,
            51.05,
            50.84,
            50.98,
            50.97,
            50.99,
            50.88,
            50.66,
            51.16,
            50.82,
            50.53,
            50.71,
            50.82,
            50.99,
            51.08,
            50.77,
            50.46,
            50.26,
            49.82,
            49.12,
            49.08,
            49.04,
            49.31,
            50.5,
            51.28,
            51.51,
            51.24,
            50.63,
            50.95,
            51.17,
            51.19,
            51.02,
            50.97,
            50.71,
            50.6,
            50.22,
            49.89,
            49.69,
            49.38,
            49.25,
            49.59,
            50.26,
            50.72,
            50.83,
            50.39,
            50.2,
            50.84,
            50.91,
            51.03,
            50.98,
            51,
            51.11,
            51.36,
            51.73,
            52.02,
            52.46,
            52.86,
            53.28,
            53.64,
            53.48,
            53.51,
            53.95,
            54.23,
            54.75,
            55.62,
            56.31,
            56.36,
            56.91,
            58.05,
            58.15,
            58.82,
            58.95,
            59.25,
            59.37,
            59.63,
            59.44,
            59.49,
            59.99,
            59.82,
            59.79,
            60.47,
            60.64,
            60.91,
            61.68,
            62.01,
            62.61,
            63.73,
            64.26,
            64.94,
            65.37,
            65.56,
            65.38,
            66.08,
            66.85,
            67.7,
            68.11,
            68.75,
            68.54,
            69.56,
            68.81,
            68.91,
            68.99,
            69.43,
            69.68,
            70.09,
            70.01,
            70.42,
            70.48,
            71.25,
            71.45,
            72.19,
            72.53,
            71.83,
            72.21
          ],
          "wind_speed_set_1": [
            9.31,
            8.99,
            9.33,
            10.98,
            11.45,
            11.1,
            14.19,
            15.6,
            15.87,
            13,
            14.98,
            16.07,
            14.98,
            13.79,
            15.43,
            14.47,
            14.63,
            14.49,
            14.67,
            14.11,
            12.43,
            13,
            14.24,
            14.83,
            15.14,
            15.51,
            15.26,
            15.26,
            14.89,
            12.69,
            10.48,
            11.29,
            11.23,
            11.62,
            10.98,
            10.58,
            11.45,
            12.41,
            11.12,
            11.05,
            11.27,
            11.12,
            11.45,
            11.7,
            11.98,
            11.6,
            11.12,
            11.68,
            11.01,
            11.32,
            10,
            11.08,
            11.18,
            10.37,
            10.45,
            9.86,
            10.39,
            10.74,
            11.46,
            11.38,
            11.21,
            10.83,
            12.35,
            12.22,
            12.3,
            12.43,
            13.2,
            13.43,
            13.8,
            15.11,
            16.25,
            17.25,
            15.09,
            13.48,
            12.57,
            12.62,
            10.81,
            12.06,
            11.45,
            10.27,
            10.12,
            10.23,
            10.31,
            11.46,
            11.18,
            12.35,
            13.18,
            13.68,
            13.41,
            13.14,
            14.2,
            14.37,
            14.43,
            15.07,
            14.9,
            15.24,
            14.89,
            14.97,
            15.01,
            15.77,
            16.35,
            15.32,
            15.81,
            15.96,
            14.84,
            14.2,
            14.9,
            15.13,
            14.44,
            13.94,
            13.96,
            12.75,
            13.73,
            13.33,
            12.65,
            13.31,
            13.45,
            13.39,
            15.22,
            15.16,
            14.42,
            15.12,
            16.7,
            15.59,
            16.31,
            18.25,
            17.4,
            14.25,
            14.22,
            14.58,
            11.01,
            13.24,
            11.95,
            12.31,
            12.15,
            13.74,
            13.89,
            11.47,
            14.52,
            15.94,
            18.43,
            18.76,
            18.91
          ],
          "wind_direction_set_1": [
            166.42,
            163.13,
            168.99,
            178.9,
            171.65,
            169.39,
            181.67,
            189.54,
            183,
            173.23,
            183.18,
            187.13,
            171.43,
            163.47,
            162.23,
            162.36,
            163.03,
            161.15,
            160.39,
            161.83,
            160.83,
            161.6,
            147.1,
            183.18,
            175.88,
            170.7,
            173,
            183.44,
            183.88,
            177.71,
            168.62,
            172.78,
            173.91,
            175.18,
            170.1,
            167.02,
            174.84,
            178.28,
            171.15,
            175.02,
            171.53,
            169.12,
            172.28,
            172.88,
            173.09,
            168.88,
            168.9,
            181.62,
            176.67,
            176.3,
            167,
            153.66,
            149.55,
            161.38,
            161.63,
            158.87,
            150.58,
            147.74,
            146.73,
            146.34,
            147.58,
            148.8,
            142.31,
            148.95,
            150.79,
            153.4,
            156.19,
            157.38,
            163.64,
            172.07,
            179.79,
            178.38,
            177.06,
            180.36,
            181.47,
            184,
            177.5,
            177.36,
            172.85,
            165.11,
            163.17,
            167.66,
            164.26,
            159.88,
            158.18,
            158.97,
            168.27,
            167.98,
            166.05,
            163.24,
            170.44,
            175.21,
            174.19,
            173.89,
            177.58,
            177.6,
            180.57,
            182.57,
            181.58,
            183.55,
            178.85,
            176.37,
            171.5,
            174.42,
            165.35,
            170.38,
            174.87,
            174.04,
            176.78,
            176.71,
            177.74,
            180.74,
            177.58,
            172.79,
            179.2,
            178.65,
            174.67,
            185.84,
            185,
            179.9,
            183.62,
            177.84,
            174.78,
            177.89,
            175.26,
            177.28,
            176.18,
            179.33,
            182.12,
            178.21,
            188.38,
            183.21,
            178.77,
            180.88,
            171.18,
            173.67,
            167.59,
            172.3,
            151.71,
            162.56,
            163.74,
            158.65,
            163.42
          ],
          "wind_gust_set_1": [
            11.58,
            10.92,
            10.78,
            11.8,
            12.31,
            13.59,
            16.92,
            16.35,
            16.96,
            16.48,
            17.13,
            17.71,
            18.1,
            16.4,
            18.8,
            17.71,
            19.33,
            17.88,
            17.62,
            16.48,
            14.9,
            14.95,
            15.65,
            17.13,
            17.18,
            17.76,
            17.93,
            16.92,
            16.52,
            15.74,
            12.31,
            12.72,
            12.89,
            12.58,
            12.01,
            11.58,
            12.84,
            13.86,
            12.67,
            12.93,
            12.93,
            12.45,
            12.75,
            12.98,
            13.42,
            13.72,
            12.75,
            12.8,
            12.06,
            12.14,
            12.36,
            13.33,
            13.54,
            11.97,
            12.1,
            11.44,
            12.41,
            11.92,
            13.45,
            12.75,
            13.42,
            12.45,
            13.76,
            13.59,
            13.9,
            13.67,
            14.64,
            15.12,
            16.04,
            17.18,
            18.32,
            18.76,
            17.18,
            14.51,
            14.51,
            14.9,
            11.83,
            13.72,
            12.36,
            11.61,
            10.78,
            10.87,
            11.44,
            12.45,
            12.45,
            14.16,
            15.21,
            15.12,
            15.17,
            15.17,
            15.96,
            16.18,
            16.18,
            16.88,
            16.52,
            17.05,
            16.04,
            16.48,
            16.62,
            17.62,
            18.24,
            17.45,
            19.2,
            17.49,
            17.23,
            16.96,
            17.88,
            17.1,
            16.43,
            15.34,
            16,
            15.74,
            15.78,
            16.52,
            14.9,
            14.99,
            16.26,
            17.71,
            17.49,
            19.73,
            17.4,
            20.25,
            19.2,
            18.54,
            19.11,
            21.88,
            20.6,
            17.4,
            18.98,
            18.63,
            14.77,
            16.4,
            16.52,
            15.12,
            16.88,
            17.23,
            18.32,
            16.57,
            18.9,
            21.04,
            23.14,
            23.89,
            24.5
          ],
          "altimeter_set_1d": [
            30.14,
            30.14,
            30.14,
            30.14,
            30.14,
            30.15,
            30.15,
            30.16,
            30.15,
            30.15,
            30.15,
            30.15,
            30.15,
            30.15,
            30.15,
            30.15,
            30.15,
            30.15,
            30.15,
            30.15,
            30.15,
            30.15,
            30.15,
            30.15,
            30.15,
            30.15,
            30.15,
            30.15,
            30.15,
            30.15,
            30.15,
            30.15,
            30.15,
            30.15,
            30.15,
            30.15,
            30.15,
            30.15,
            30.15,
            30.16,
            30.16,
            30.15,
            30.15,
            30.15,
            30.15,
            30.15,
            30.15,
            30.15,
            30.15,
            30.15,
            30.15,
            30.15,
            30.15,
            30.15,
            30.15,
            30.15,
            30.15,
            30.15,
            30.15,
            30.15,
            30.15,
            30.15,
            30.15,
            30.15,
            30.15,
            30.15,
            30.15,
            30.15,
            30.15,
            30.15,
            30.15,
            30.15,
            30.15,
            30.15,
            30.16,
            30.16,
            30.16,
            30.16,
            30.16,
            30.16,
            30.16,
            30.17,
            30.17,
            30.17,
            30.17,
            30.17,
            30.17,
            30.17,
            30.18,
            30.18,
            30.18,
            30.18,
            30.18,
            30.18,
            30.18,
            30.18,
            30.18,
            30.18,
            30.18,
            30.18,
            30.18,
            30.18,
            30.18,
            30.18,
            30.19,
            30.19,
            30.19,
            30.19,
            30.19,
            30.19,
            30.19,
            30.19,
            30.19,
            30.18,
            30.18,
            30.18,
            30.18,
            30.18,
            30.18,
            30.18,
            30.18,
            30.18,
            30.18,
            30.18,
            30.18,
            30.18,
            30.18,
            30.18,
            30.18,
            30.18,
            30.18,
            30.18,
            30.18,
            30.18,
            30.18,
            30.17,
            30.17,
            30.17,
            30.17,
            30.16,
            30.16,
            30.16,
            30.15
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
          "end": "2026-04-20T18:00:00Z"
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
            "1:15 AM",
            "1:30 AM",
            "1:45 AM",
            "2:00 AM",
            "2:15 AM",
            "2:30 AM",
            "2:45 AM",
            "3:00 AM",
            "3:15 AM",
            "3:30 AM",
            "3:45 AM",
            "4:00 AM",
            "4:15 AM",
            "4:30 AM",
            "4:45 AM",
            "5:00 AM",
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
            "8:15 AM",
            "8:30 AM",
            "8:45 AM",
            "9:00 AM",
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
            "12:15 PM",
            "12:30 PM",
            "12:45 PM",
            "1:00 PM"
          ],
          "air_temp_set_1": [
            39.81,
            40.07,
            40.12,
            40.22,
            39.66,
            39.53,
            39.86,
            39.69,
            39.25,
            38.71,
            38.71,
            38.44,
            38.69,
            38.74,
            38.51,
            38.74,
            39.15,
            38.79,
            39.05,
            38.95,
            38.33,
            38.64,
            38.77,
            38.51,
            38.67,
            38.44,
            38.31,
            38.44,
            38.71,
            38.69,
            39.15,
            39.27,
            39.76,
            39.86,
            40.3,
            40.83,
            40.98,
            41.44,
            41.62,
            41.77,
            42.48,
            41.62,
            41.62,
            41.95,
            42.1,
            42.51,
            42.07,
            41.95
          ],
          "wind_speed_set_1": [
            15.06,
            15.8,
            17.81,
            15.06,
            12.33,
            13.68,
            16.22,
            13.64,
            12.89,
            13.43,
            17.25,
            16.49,
            13.3,
            15.62,
            14.68,
            16.6,
            16.85,
            13.9,
            13.08,
            16.82,
            14.56,
            13.81,
            13.74,
            9.62,
            12.85,
            11.1,
            10.79,
            14.16,
            11.42,
            9.8,
            10.4,
            8.8,
            8.06,
            9.1,
            6.25,
            8.27,
            10.9,
            5.83,
            5.85,
            8.84,
            6.91,
            5.34,
            3.93,
            6.87,
            7.55,
            10.78,
            11.12,
            12.48
          ],
          "wind_direction_set_1": [
            181.6,
            183.6,
            182.1,
            186.9,
            197.4,
            204.4,
            203.8,
            218.5,
            201.2,
            196.1,
            187.9,
            199.7,
            215.5,
            212.8,
            225.2,
            207.5,
            215.5,
            212.8,
            227.6,
            192.2,
            215.2,
            227.5,
            232.5,
            211.8,
            200.3,
            204.9,
            187.6,
            202.6,
            192.7,
            201.3,
            204.4,
            179,
            214.8,
            201.8,
            215.8,
            200.7,
            199.9,
            202.5,
            220.6,
            268.8,
            253.4,
            253.3,
            252.9,
            215.7,
            259.6,
            258.4,
            255.9,
            262.3
          ],
          "wind_gust_set_1": [
            19.15,
            20.26,
            21.39,
            20.79,
            22.65,
            22.95,
            26.38,
            24.37,
            22.58,
            22.13,
            26.01,
            24.67,
            19.6,
            21.31,
            21.83,
            26.83,
            26.91,
            27.06,
            27.14,
            23.77,
            24.82,
            25.78,
            22.13,
            18.78,
            22.43,
            21.16,
            21.69,
            22.36,
            18.18,
            19.52,
            22.36,
            15.87,
            15.87,
            21.24,
            23.55,
            16.62,
            17.37,
            17.75,
            16.47,
            16.69,
            16.17,
            17.96,
            16.25,
            14.83,
            13.64,
            16.77,
            17.07,
            19.6
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
          "end": "2026-04-20T18:01:00Z"
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
            "1:15 AM",
            "1:30 AM",
            "2:00 AM",
            "2:15 AM",
            "2:30 AM",
            "3:00 AM",
            "3:15 AM",
            "3:30 AM",
            "4:00 AM",
            "4:15 AM",
            "4:30 AM",
            "5:00 AM",
            "5:15 AM",
            "5:30 AM",
            "6:00 AM",
            "6:15 AM",
            "6:30 AM",
            "7:00 AM",
            "7:15 AM",
            "7:30 AM",
            "8:00 AM",
            "8:15 AM",
            "8:30 AM",
            "9:00 AM",
            "9:15 AM",
            "9:30 AM",
            "10:00 AM",
            "10:15 AM",
            "10:30 AM",
            "11:00 AM",
            "11:15 AM",
            "11:30 AM",
            "12:01 PM",
            "12:16 PM",
            "12:30 PM",
            "1:00 PM"
          ],
          "air_temp_set_1": [
            54,
            54,
            55,
            54,
            54,
            57,
            60,
            63,
            63,
            64,
            63,
            64,
            64,
            64,
            59,
            57,
            58,
            63,
            64,
            64,
            64,
            64,
            63,
            62,
            65,
            68,
            70,
            71,
            71,
            72,
            71,
            69,
            70,
            73,
            74,
            74
          ],
          "wind_speed_set_1": [
            2,
            0,
            2,
            1,
            4,
            1,
            5,
            12,
            7,
            11,
            9,
            16,
            14.99,
            4,
            3,
            1,
            2,
            11,
            10,
            5.99,
            5,
            10,
            2,
            2,
            5.99,
            5,
            3,
            3,
            3,
            5.99,
            4,
            10,
            2,
            3,
            2,
            2
          ],
          "wind_direction_set_1": [
            167,
            205,
            148,
            165,
            177,
            255,
            167,
            141,
            177,
            144,
            112,
            118,
            148,
            146,
            306,
            231,
            284,
            138,
            220,
            85,
            132,
            125,
            133,
            286,
            111,
            115,
            219,
            227,
            148,
            35,
            124,
            127,
            208,
            174,
            173,
            236
          ],
          "wind_gust_set_1": [
            5,
            3,
            8,
            5,
            5.99,
            5,
            11,
            22,
            23,
            18,
            18,
            25,
            26,
            26,
            10,
            10,
            16,
            20,
            21,
            16,
            14.99,
            21,
            21,
            5.99,
            13,
            14.01,
            14.01,
            11,
            11,
            16,
            17,
            21,
            19,
            10,
            10,
            12
          ],
          "altimeter_set_1": [
            29.92,
            29.92,
            29.92,
            29.92,
            29.92,
            29.92,
            29.91,
            29.91,
            29.91,
            29.91,
            29.91,
            29.89,
            29.89,
            29.89,
            29.88,
            29.88,
            29.88,
            29.87,
            29.87,
            29.88,
            29.88,
            29.88,
            29.88,
            29.88,
            29.87,
            29.87,
            29.87,
            29.87,
            29.87,
            29.87,
            29.87,
            29.86,
            29.85,
            29.85,
            29.85,
            29.84
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
          "end": "2026-04-20T18:00:00Z"
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
            "1:10 AM",
            "1:20 AM",
            "1:30 AM",
            "1:40 AM",
            "1:50 AM",
            "2:00 AM",
            "2:10 AM",
            "2:20 AM",
            "2:30 AM",
            "2:40 AM",
            "2:50 AM",
            "3:00 AM",
            "3:10 AM",
            "3:20 AM",
            "3:30 AM",
            "3:40 AM",
            "3:50 AM",
            "4:00 AM",
            "4:10 AM",
            "4:20 AM",
            "4:30 AM",
            "4:40 AM",
            "4:50 AM",
            "5:00 AM",
            "5:10 AM",
            "5:20 AM",
            "5:30 AM",
            "5:40 AM",
            "5:50 AM",
            "6:00 AM",
            "6:10 AM",
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
            "8:20 AM",
            "8:30 AM",
            "8:40 AM",
            "8:50 AM",
            "9:00 AM",
            "9:10 AM",
            "9:20 AM",
            "9:30 AM",
            "9:40 AM",
            "9:50 AM",
            "10:00 AM",
            "10:10 AM",
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
            "12:20 PM",
            "12:30 PM",
            "12:40 PM",
            "12:50 PM",
            "1:00 PM"
          ],
          "air_temp_set_1": [
            44.94,
            44.55,
            44.11,
            43.86,
            44.52,
            44.81,
            44.46,
            43.73,
            44.37,
            44.39,
            44.5,
            45.08,
            44.61,
            44.89,
            44.44,
            43.71,
            43.59,
            43.31,
            43.91,
            43.99,
            44.2,
            44.04,
            44.07,
            44.4,
            44.07,
            43.78,
            43.1,
            43.21,
            43.61,
            43.26,
            43.45,
            43.59,
            43.82,
            43.71,
            43.6,
            43.97,
            43.87,
            44.02,
            43.83,
            43.99,
            44.43,
            44.13,
            44.44,
            44.67,
            45.18,
            45.47,
            45.83,
            46.29,
            46.65,
            47.1,
            47.4,
            47.75,
            48.06,
            48.52,
            48.45,
            48.42,
            48.82,
            48.74,
            49.22,
            48.7,
            49.36,
            49.58,
            50.2,
            49.89,
            50.43,
            50.51,
            50.5,
            50.13,
            50.74,
            50.16,
            50.58,
            50.56
          ],
          "wind_speed_set_1": [
            13.66,
            13.23,
            13.05,
            12.31,
            14.58,
            15.32,
            12.54,
            12.5,
            12.51,
            12.3,
            11.6,
            12.95,
            11.32,
            12.43,
            9.18,
            10.63,
            9.13,
            9.61,
            11.65,
            11.25,
            10.65,
            10.45,
            13.78,
            12.78,
            13.35,
            7.67,
            10.42,
            11.56,
            13.26,
            9.93,
            12.53,
            14.19,
            15.16,
            15.9,
            14.6,
            17.65,
            16.97,
            14.42,
            12.16,
            13.19,
            12.31,
            11.4,
            11.74,
            13.26,
            13.53,
            11.04,
            12.22,
            12.9,
            13.31,
            14.31,
            13.64,
            16.72,
            16.51,
            14.64,
            18.56,
            19.08,
            18.3,
            17.68,
            18.7,
            18.87,
            19.31,
            17.38,
            16.28,
            20.37,
            18.46,
            17.32,
            18.47,
            17.57,
            20.1,
            18.47,
            19.21,
            23.15
          ],
          "wind_direction_set_1": [
            163.2,
            166.1,
            161.5,
            166.1,
            171.6,
            173.5,
            175.2,
            177,
            184,
            186.5,
            193.1,
            185.7,
            185.2,
            187,
            178.6,
            169.7,
            179.1,
            181.5,
            184.7,
            181.3,
            190.2,
            196.9,
            199.2,
            196.9,
            197.7,
            184.4,
            178.7,
            188.2,
            180,
            185.8,
            190.7,
            194.2,
            195.4,
            195.4,
            187.7,
            198.1,
            191.7,
            187.9,
            188.4,
            185.6,
            190.9,
            194.8,
            195.6,
            200.6,
            190,
            187,
            193.4,
            188.4,
            193.5,
            189.9,
            186.6,
            199.4,
            200.6,
            195.9,
            206.9,
            201.9,
            203.3,
            201.7,
            205.8,
            200.9,
            201.6,
            204.6,
            205.3,
            206.4,
            205.4,
            202.6,
            211.8,
            205.7,
            212.3,
            213.2,
            210.7,
            211.5
          ],
          "wind_gust_set_1": [
            21.73,
            18.63,
            19.87,
            16.64,
            22.23,
            25.34,
            17.64,
            19.25,
            19.62,
            19.13,
            18.26,
            22.36,
            20.37,
            18.87,
            13.04,
            14.16,
            11.55,
            16.02,
            16.27,
            15.28,
            19.38,
            17.26,
            21.24,
            21.36,
            23.1,
            16.64,
            18.38,
            22.6,
            20.37,
            16.15,
            19,
            20.48,
            22.11,
            24.96,
            21.73,
            24.96,
            24.59,
            23.1,
            19.75,
            21.98,
            19.49,
            17.13,
            17.02,
            20.48,
            23.1,
            14.77,
            19.75,
            18.63,
            17.39,
            20.37,
            22.6,
            26.95,
            23.84,
            27.32,
            28.94,
            33.41,
            30.68,
            29.55,
            26.95,
            33.9,
            31.42,
            28.32,
            28.18,
            31.92,
            26.7,
            29.93,
            30.3,
            29.68,
            35.51,
            31.67,
            36.76,
            37.01
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
            null,
            null,
            null,
            null,
            null,
            null,
            11.96,
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
            13.08,
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
            null,
            null,
            null,
            null,
            null,
            null,
            169.3,
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
            191.3,
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
          "end": "2026-04-20T17:50:00Z"
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
            "1:10 AM",
            "1:20 AM",
            "1:30 AM",
            "1:40 AM",
            "1:50 AM",
            "2:00 AM",
            "2:10 AM",
            "2:20 AM",
            "2:30 AM",
            "2:40 AM",
            "2:50 AM",
            "3:00 AM",
            "3:10 AM",
            "3:20 AM",
            "3:30 AM",
            "3:40 AM",
            "3:50 AM",
            "4:00 AM",
            "4:10 AM",
            "4:20 AM",
            "4:30 AM",
            "4:40 AM",
            "4:50 AM",
            "5:00 AM",
            "5:10 AM",
            "5:20 AM",
            "5:30 AM",
            "5:40 AM",
            "5:50 AM",
            "6:00 AM",
            "6:10 AM",
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
            "8:20 AM",
            "8:30 AM",
            "8:40 AM",
            "8:50 AM",
            "9:00 AM",
            "9:10 AM",
            "9:20 AM",
            "9:30 AM",
            "9:40 AM",
            "9:50 AM",
            "10:00 AM",
            "10:10 AM",
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
            "12:20 PM",
            "12:30 PM",
            "12:40 PM",
            "12:50 PM"
          ],
          "air_temp_set_1": [
            57.97,
            58.04,
            57.75,
            56.91,
            55.6,
            55.6,
            54.7,
            54.08,
            54.31,
            53.28,
            53.46,
            53.42,
            52.84,
            51.71,
            51.57,
            52.04,
            52.07,
            53.02,
            54.08,
            54.15,
            54.18,
            53.86,
            52.69,
            52.62,
            52.73,
            52.04,
            51.64,
            53.2,
            52.33,
            50.84,
            49.38,
            51.49,
            52.99,
            54.62,
            54.98,
            53.86,
            54.44,
            54.11,
            53.82,
            53.67,
            55.31,
            54.94,
            54.62,
            56,
            57.2,
            59.13,
            61.02,
            62.4,
            63.2,
            64.18,
            64.84,
            65.56,
            65.89,
            66.4,
            67.16,
            68.4,
            69.24,
            69.71,
            70.15,
            71.17,
            71.57,
            71.6,
            71.86,
            72.07,
            72.12,
            72.66,
            73.02,
            72.49,
            73.24,
            72.87,
            72.47
          ],
          "wind_speed_set_1": [
            8.21,
            4.49,
            4.13,
            4.6,
            4.86,
            4.98,
            5.5,
            4.71,
            5.18,
            0.3,
            5.18,
            5.18,
            2.59,
            3.51,
            6.06,
            5.09,
            5.81,
            6.55,
            5.59,
            4.93,
            6.63,
            6.1,
            5.34,
            4.03,
            5.12,
            5.11,
            3.49,
            1,
            2.65,
            0.31,
            2.78,
            4.29,
            5.89,
            5.58,
            5.2,
            6.21,
            5.32,
            2.58,
            0.99,
            1.04,
            1.67,
            1.4,
            3.9,
            0.43,
            5.43,
            1.97,
            1.42,
            2.34,
            2.25,
            1.5,
            2.44,
            2.87,
            1.6,
            3.02,
            1.92,
            0.51,
            2.59,
            3.73,
            5.71,
            10.17,
            11.22,
            14.45,
            13,
            12.48,
            10.28,
            16.55,
            10.5,
            16.74,
            12.8,
            15.2,
            20.23
          ],
          "wind_direction_set_1": [
            76.8,
            78.64,
            61.8,
            86.9,
            105.8,
            80.8,
            87.6,
            94.6,
            116,
            74.08,
            96,
            129.7,
            59.54,
            80.9,
            99.9,
            108.7,
            93.5,
            82.8,
            77.83,
            81.8,
            97.9,
            93.2,
            93.4,
            94.6,
            77.38,
            85.8,
            129.6,
            146.5,
            94.3,
            106.7,
            75.67,
            78.93,
            79.2,
            93,
            85.3,
            89.9,
            88.4,
            148.4,
            171.2,
            130.3,
            230.5,
            146.2,
            185.1,
            132.9,
            101,
            95.5,
            61.67,
            315.3,
            28.8,
            14.33,
            342.4,
            296.3,
            306.1,
            252.4,
            273.4,
            287.6,
            261.1,
            255.7,
            255.7,
            220.4,
            242.4,
            216.3,
            211.5,
            208.1,
            209.4,
            211.7,
            215.1,
            208.9,
            209.4,
            205.1,
            208.1
          ],
          "wind_gust_set_1": [
            10.74,
            10.74,
            8.33,
            8.77,
            6.57,
            7.46,
            7.01,
            6.57,
            6.57,
            6.35,
            7.24,
            6.57,
            4.82,
            6.79,
            7.01,
            6.57,
            8.55,
            8.77,
            8.11,
            8.33,
            8.11,
            8.77,
            7.24,
            7.46,
            7.24,
            7.46,
            8.77,
            7.01,
            4.17,
            5.91,
            5.7,
            7.01,
            8.11,
            8.77,
            8.55,
            8.33,
            7.67,
            5.7,
            3.07,
            6.35,
            5.91,
            8.99,
            7.01,
            3.73,
            7.24,
            5.48,
            3.51,
            5.04,
            3.95,
            3.51,
            5.04,
            5.48,
            5.48,
            4.82,
            3.95,
            3.51,
            7.67,
            12.92,
            8.55,
            19.73,
            21.26,
            19.73,
            17.54,
            21.92,
            20.17,
            23.67,
            21.7,
            25.43,
            20.39,
            21.47,
            27.62
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
      "METADATA_QUERY_TIME": "7.4 ms",
      "METADATA_PARSE_TIME": "0.4 ms",
      "TOTAL_METADATA_TIME": "7.8 ms",
      "DATA_QUERY_TIME": "9.1 ms",
      "QC_QUERY_TIME": "3.9 ms",
      "DATA_PARSE_TIME": "20.7 ms",
      "TOTAL_DATA_TIME": "33.8 ms",
      "TOTAL_TIME": "41.6 ms",
      "VERSION": "v2.32.5"
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
    "date": "2026-04-20",
    "observations": [
      {
        "Altitude_ft": 4229,
        "Temp_c": 24.8,
        "Dewpoint_c": -2.7,
        "Wind_Direction": 189,
        "Wind_Speed_kt": 11.1
      },
      {
        "Altitude_ft": 4255,
        "Temp_c": 24.6,
        "Dewpoint_c": -3.2,
        "Wind_Direction": 158,
        "Wind_Speed_kt": 16.9
      },
      {
        "Altitude_ft": 4285,
        "Temp_c": 24.4,
        "Dewpoint_c": -3.8,
        "Wind_Direction": 158,
        "Wind_Speed_kt": 16.9
      },
      {
        "Altitude_ft": 4308,
        "Temp_c": 24.2,
        "Dewpoint_c": -4.4,
        "Wind_Direction": 158,
        "Wind_Speed_kt": 16.9
      },
      {
        "Altitude_ft": 4331,
        "Temp_c": 24,
        "Dewpoint_c": -5,
        "Wind_Direction": 158,
        "Wind_Speed_kt": 16.9
      },
      {
        "Altitude_ft": 4354,
        "Temp_c": 23.8,
        "Dewpoint_c": -5.6,
        "Wind_Direction": 158,
        "Wind_Speed_kt": 16.9
      },
      {
        "Altitude_ft": 4373,
        "Temp_c": 23.6,
        "Dewpoint_c": -6.2,
        "Wind_Direction": 158,
        "Wind_Speed_kt": 16.9
      },
      {
        "Altitude_ft": 4400,
        "Temp_c": 23.4,
        "Dewpoint_c": -7,
        "Wind_Direction": 158,
        "Wind_Speed_kt": 16.9
      },
      {
        "Altitude_ft": 4419,
        "Temp_c": 23.3,
        "Dewpoint_c": -7,
        "Wind_Direction": 157,
        "Wind_Speed_kt": 16.9
      },
      {
        "Altitude_ft": 4439,
        "Temp_c": 23.1,
        "Dewpoint_c": -7,
        "Wind_Direction": 157,
        "Wind_Speed_kt": 16.9
      },
      {
        "Altitude_ft": 4459,
        "Temp_c": 23,
        "Dewpoint_c": -7,
        "Wind_Direction": 157,
        "Wind_Speed_kt": 17.1
      },
      {
        "Altitude_ft": 4478,
        "Temp_c": 22.8,
        "Dewpoint_c": -7,
        "Wind_Direction": 157,
        "Wind_Speed_kt": 17.1
      },
      {
        "Altitude_ft": 4501,
        "Temp_c": 22.7,
        "Dewpoint_c": -7.1,
        "Wind_Direction": 156,
        "Wind_Speed_kt": 17.1
      },
      {
        "Altitude_ft": 4521,
        "Temp_c": 22.5,
        "Dewpoint_c": -7.1,
        "Wind_Direction": 156,
        "Wind_Speed_kt": 17.1
      },
      {
        "Altitude_ft": 4541,
        "Temp_c": 22.4,
        "Dewpoint_c": -7.1,
        "Wind_Direction": 156,
        "Wind_Speed_kt": 17.1
      },
      {
        "Altitude_ft": 4564,
        "Temp_c": 22.2,
        "Dewpoint_c": -7.1,
        "Wind_Direction": 156,
        "Wind_Speed_kt": 17.1
      },
      {
        "Altitude_ft": 4590,
        "Temp_c": 22.1,
        "Dewpoint_c": -7.1,
        "Wind_Direction": 157,
        "Wind_Speed_kt": 17.1
      },
      {
        "Altitude_ft": 4613,
        "Temp_c": 21.9,
        "Dewpoint_c": -7.2,
        "Wind_Direction": 157,
        "Wind_Speed_kt": 16.9
      },
      {
        "Altitude_ft": 4639,
        "Temp_c": 21.8,
        "Dewpoint_c": -7.2,
        "Wind_Direction": 158,
        "Wind_Speed_kt": 16.9
      },
      {
        "Altitude_ft": 4665,
        "Temp_c": 21.7,
        "Dewpoint_c": -7.2,
        "Wind_Direction": 159,
        "Wind_Speed_kt": 16.9
      },
      {
        "Altitude_ft": 4688,
        "Temp_c": 21.5,
        "Dewpoint_c": -7.2,
        "Wind_Direction": 160,
        "Wind_Speed_kt": 16.9
      },
      {
        "Altitude_ft": 4711,
        "Temp_c": 21.5,
        "Dewpoint_c": -7.2,
        "Wind_Direction": 161,
        "Wind_Speed_kt": 16.9
      },
      {
        "Altitude_ft": 4731,
        "Temp_c": 21.4,
        "Dewpoint_c": -7.2,
        "Wind_Direction": 162,
        "Wind_Speed_kt": 16.9
      },
      {
        "Altitude_ft": 4754,
        "Temp_c": 21.3,
        "Dewpoint_c": -7.2,
        "Wind_Direction": 162,
        "Wind_Speed_kt": 16.9
      },
      {
        "Altitude_ft": 4774,
        "Temp_c": 21.3,
        "Dewpoint_c": -7.2,
        "Wind_Direction": 163,
        "Wind_Speed_kt": 16.7
      },
      {
        "Altitude_ft": 4797,
        "Temp_c": 21.2,
        "Dewpoint_c": -7.1,
        "Wind_Direction": 164,
        "Wind_Speed_kt": 16.7
      },
      {
        "Altitude_ft": 4813,
        "Temp_c": 21.1,
        "Dewpoint_c": -7.1,
        "Wind_Direction": 165,
        "Wind_Speed_kt": 16.7
      },
      {
        "Altitude_ft": 4833,
        "Temp_c": 21.1,
        "Dewpoint_c": -7.1,
        "Wind_Direction": 166,
        "Wind_Speed_kt": 16.7
      },
      {
        "Altitude_ft": 4849,
        "Temp_c": 21,
        "Dewpoint_c": -7.1,
        "Wind_Direction": 167,
        "Wind_Speed_kt": 16.7
      },
      {
        "Altitude_ft": 4865,
        "Temp_c": 20.9,
        "Dewpoint_c": -7.1,
        "Wind_Direction": 167,
        "Wind_Speed_kt": 16.7
      },
      {
        "Altitude_ft": 4882,
        "Temp_c": 20.8,
        "Dewpoint_c": -7.1,
        "Wind_Direction": 168,
        "Wind_Speed_kt": 16.7
      },
      {
        "Altitude_ft": 4902,
        "Temp_c": 20.8,
        "Dewpoint_c": -7.1,
        "Wind_Direction": 169,
        "Wind_Speed_kt": 16.7
      },
      {
        "Altitude_ft": 4921,
        "Temp_c": 20.7,
        "Dewpoint_c": -7.1,
        "Wind_Direction": 170,
        "Wind_Speed_kt": 16.5
      },
      {
        "Altitude_ft": 4934,
        "Temp_c": 20.6,
        "Dewpoint_c": -7.1,
        "Wind_Direction": 170,
        "Wind_Speed_kt": 16.5
      },
      {
        "Altitude_ft": 4954,
        "Temp_c": 20.6,
        "Dewpoint_c": -7.1,
        "Wind_Direction": 171,
        "Wind_Speed_kt": 16.5
      },
      {
        "Altitude_ft": 4970,
        "Temp_c": 20.5,
        "Dewpoint_c": -7.1,
        "Wind_Direction": 172,
        "Wind_Speed_kt": 16.5
      },
      {
        "Altitude_ft": 4990,
        "Temp_c": 20.5,
        "Dewpoint_c": -7.1,
        "Wind_Direction": 172,
        "Wind_Speed_kt": 16.5
      },
      {
        "Altitude_ft": 5007,
        "Temp_c": 20.4,
        "Dewpoint_c": -7.1,
        "Wind_Direction": 173,
        "Wind_Speed_kt": 16.5
      },
      {
        "Altitude_ft": 5020,
        "Temp_c": 20.3,
        "Dewpoint_c": -7.1,
        "Wind_Direction": 174,
        "Wind_Speed_kt": 16.5
      },
      {
        "Altitude_ft": 5033,
        "Temp_c": 20.3,
        "Dewpoint_c": -7.1,
        "Wind_Direction": 175,
        "Wind_Speed_kt": 16.5
      },
      {
        "Altitude_ft": 5046,
        "Temp_c": 20.2,
        "Dewpoint_c": -7.1,
        "Wind_Direction": 175,
        "Wind_Speed_kt": 16.5
      },
      {
        "Altitude_ft": 5059,
        "Temp_c": 20.2,
        "Dewpoint_c": -7.1,
        "Wind_Direction": 176,
        "Wind_Speed_kt": 16.3
      },
      {
        "Altitude_ft": 5072,
        "Temp_c": 20.1,
        "Dewpoint_c": -7.1,
        "Wind_Direction": 177,
        "Wind_Speed_kt": 16.3
      },
      {
        "Altitude_ft": 5082,
        "Temp_c": 20.1,
        "Dewpoint_c": -7.1,
        "Wind_Direction": 177,
        "Wind_Speed_kt": 16.3
      },
      {
        "Altitude_ft": 5095,
        "Temp_c": 20,
        "Dewpoint_c": -7.1,
        "Wind_Direction": 178,
        "Wind_Speed_kt": 16.3
      },
      {
        "Altitude_ft": 5105,
        "Temp_c": 19.9,
        "Dewpoint_c": -7.1,
        "Wind_Direction": 179,
        "Wind_Speed_kt": 16.3
      },
      {
        "Altitude_ft": 5115,
        "Temp_c": 19.9,
        "Dewpoint_c": -7.1,
        "Wind_Direction": 179,
        "Wind_Speed_kt": 16.5
      },
      {
        "Altitude_ft": 5128,
        "Temp_c": 19.8,
        "Dewpoint_c": -7.1,
        "Wind_Direction": 179,
        "Wind_Speed_kt": 16.7
      },
      {
        "Altitude_ft": 5138,
        "Temp_c": 19.8,
        "Dewpoint_c": -7,
        "Wind_Direction": 180,
        "Wind_Speed_kt": 16.7
      },
      {
        "Altitude_ft": 5148,
        "Temp_c": 19.8,
        "Dewpoint_c": -7,
        "Wind_Direction": 180,
        "Wind_Speed_kt": 16.9
      },
      {
        "Altitude_ft": 5161,
        "Temp_c": 19.7,
        "Dewpoint_c": -7,
        "Wind_Direction": 180,
        "Wind_Speed_kt": 17.1
      },
      {
        "Altitude_ft": 5174,
        "Temp_c": 19.7,
        "Dewpoint_c": -7,
        "Wind_Direction": 180,
        "Wind_Speed_kt": 17.3
      },
      {
        "Altitude_ft": 5187,
        "Temp_c": 19.6,
        "Dewpoint_c": -7,
        "Wind_Direction": 181,
        "Wind_Speed_kt": 17.3
      },
      {
        "Altitude_ft": 5200,
        "Temp_c": 19.6,
        "Dewpoint_c": -7,
        "Wind_Direction": 181,
        "Wind_Speed_kt": 17.5
      },
      {
        "Altitude_ft": 5213,
        "Temp_c": 19.5,
        "Dewpoint_c": -7,
        "Wind_Direction": 181,
        "Wind_Speed_kt": 17.7
      },
      {
        "Altitude_ft": 5233,
        "Temp_c": 19.5,
        "Dewpoint_c": -6.9,
        "Wind_Direction": 181,
        "Wind_Speed_kt": 17.7
      },
      {
        "Altitude_ft": 5249,
        "Temp_c": 19.5,
        "Dewpoint_c": -6.9,
        "Wind_Direction": 182,
        "Wind_Speed_kt": 17.9
      },
      {
        "Altitude_ft": 5269,
        "Temp_c": 19.4,
        "Dewpoint_c": -6.9,
        "Wind_Direction": 182,
        "Wind_Speed_kt": 18.1
      },
      {
        "Altitude_ft": 5285,
        "Temp_c": 19.4,
        "Dewpoint_c": -6.9,
        "Wind_Direction": 182,
        "Wind_Speed_kt": 18.1
      },
      {
        "Altitude_ft": 5302,
        "Temp_c": 19.3,
        "Dewpoint_c": -6.9,
        "Wind_Direction": 182,
        "Wind_Speed_kt": 18.3
      },
      {
        "Altitude_ft": 5322,
        "Temp_c": 19.3,
        "Dewpoint_c": -6.9,
        "Wind_Direction": 183,
        "Wind_Speed_kt": 18.5
      },
      {
        "Altitude_ft": 5341,
        "Temp_c": 19.2,
        "Dewpoint_c": -6.9,
        "Wind_Direction": 183,
        "Wind_Speed_kt": 18.7
      },
      {
        "Altitude_ft": 5358,
        "Temp_c": 19.2,
        "Dewpoint_c": -6.9,
        "Wind_Direction": 183,
        "Wind_Speed_kt": 18.7
      },
      {
        "Altitude_ft": 5377,
        "Temp_c": 19.1,
        "Dewpoint_c": -6.9,
        "Wind_Direction": 183,
        "Wind_Speed_kt": 18.9
      },
      {
        "Altitude_ft": 5397,
        "Temp_c": 19,
        "Dewpoint_c": -6.9,
        "Wind_Direction": 183,
        "Wind_Speed_kt": 19
      },
      {
        "Altitude_ft": 5413,
        "Temp_c": 19,
        "Dewpoint_c": -6.9,
        "Wind_Direction": 184,
        "Wind_Speed_kt": 19
      },
      {
        "Altitude_ft": 5430,
        "Temp_c": 18.9,
        "Dewpoint_c": -6.9,
        "Wind_Direction": 184,
        "Wind_Speed_kt": 19.2
      },
      {
        "Altitude_ft": 5449,
        "Temp_c": 18.9,
        "Dewpoint_c": -7,
        "Wind_Direction": 183,
        "Wind_Speed_kt": 19.2
      },
      {
        "Altitude_ft": 5466,
        "Temp_c": 18.8,
        "Dewpoint_c": -7,
        "Wind_Direction": 183,
        "Wind_Speed_kt": 19.2
      },
      {
        "Altitude_ft": 5482,
        "Temp_c": 18.8,
        "Dewpoint_c": -7,
        "Wind_Direction": 183,
        "Wind_Speed_kt": 19.2
      },
      {
        "Altitude_ft": 5499,
        "Temp_c": 18.7,
        "Dewpoint_c": -7,
        "Wind_Direction": 183,
        "Wind_Speed_kt": 19.2
      },
      {
        "Altitude_ft": 5515,
        "Temp_c": 18.6,
        "Dewpoint_c": -7,
        "Wind_Direction": 183,
        "Wind_Speed_kt": 19.2
      },
      {
        "Altitude_ft": 5531,
        "Temp_c": 18.6,
        "Dewpoint_c": -7,
        "Wind_Direction": 183,
        "Wind_Speed_kt": 19.2
      },
      {
        "Altitude_ft": 5548,
        "Temp_c": 18.5,
        "Dewpoint_c": -7,
        "Wind_Direction": 183,
        "Wind_Speed_kt": 19.4
      },
      {
        "Altitude_ft": 5561,
        "Temp_c": 18.5,
        "Dewpoint_c": -7,
        "Wind_Direction": 183,
        "Wind_Speed_kt": 19.4
      },
      {
        "Altitude_ft": 5577,
        "Temp_c": 18.4,
        "Dewpoint_c": -7,
        "Wind_Direction": 183,
        "Wind_Speed_kt": 19.4
      },
      {
        "Altitude_ft": 5591,
        "Temp_c": 18.4,
        "Dewpoint_c": -7,
        "Wind_Direction": 183,
        "Wind_Speed_kt": 19.4
      },
      {
        "Altitude_ft": 5607,
        "Temp_c": 18.3,
        "Dewpoint_c": -7,
        "Wind_Direction": 183,
        "Wind_Speed_kt": 19.4
      },
      {
        "Altitude_ft": 5620,
        "Temp_c": 18.3,
        "Dewpoint_c": -7,
        "Wind_Direction": 183,
        "Wind_Speed_kt": 19.4
      },
      {
        "Altitude_ft": 5636,
        "Temp_c": 18.3,
        "Dewpoint_c": -7,
        "Wind_Direction": 182,
        "Wind_Speed_kt": 19.6
      },
      {
        "Altitude_ft": 5653,
        "Temp_c": 18.2,
        "Dewpoint_c": -7,
        "Wind_Direction": 182,
        "Wind_Speed_kt": 19.6
      },
      {
        "Altitude_ft": 5666,
        "Temp_c": 18.2,
        "Dewpoint_c": -7,
        "Wind_Direction": 182,
        "Wind_Speed_kt": 19.6
      },
      {
        "Altitude_ft": 5682,
        "Temp_c": 18.1,
        "Dewpoint_c": -7,
        "Wind_Direction": 182,
        "Wind_Speed_kt": 19.6
      },
      {
        "Altitude_ft": 5699,
        "Temp_c": 18.1,
        "Dewpoint_c": -7,
        "Wind_Direction": 182,
        "Wind_Speed_kt": 19.6
      },
      {
        "Altitude_ft": 5712,
        "Temp_c": 18,
        "Dewpoint_c": -7,
        "Wind_Direction": 182,
        "Wind_Speed_kt": 19.6
      },
      {
        "Altitude_ft": 5728,
        "Temp_c": 18,
        "Dewpoint_c": -7,
        "Wind_Direction": 182,
        "Wind_Speed_kt": 19.6
      },
      {
        "Altitude_ft": 5745,
        "Temp_c": 17.9,
        "Dewpoint_c": -7,
        "Wind_Direction": 182,
        "Wind_Speed_kt": 19.8
      },
      {
        "Altitude_ft": 5761,
        "Temp_c": 17.9,
        "Dewpoint_c": -7,
        "Wind_Direction": 182,
        "Wind_Speed_kt": 19.8
      },
      {
        "Altitude_ft": 5778,
        "Temp_c": 17.8,
        "Dewpoint_c": -7,
        "Wind_Direction": 182,
        "Wind_Speed_kt": 19.8
      },
      {
        "Altitude_ft": 5791,
        "Temp_c": 17.8,
        "Dewpoint_c": -7,
        "Wind_Direction": 182,
        "Wind_Speed_kt": 19.8
      },
      {
        "Altitude_ft": 5807,
        "Temp_c": 17.7,
        "Dewpoint_c": -7,
        "Wind_Direction": 182,
        "Wind_Speed_kt": 19.8
      },
      {
        "Altitude_ft": 5823,
        "Temp_c": 17.7,
        "Dewpoint_c": -7,
        "Wind_Direction": 182,
        "Wind_Speed_kt": 19.8
      },
      {
        "Altitude_ft": 5840,
        "Temp_c": 17.6,
        "Dewpoint_c": -7,
        "Wind_Direction": 182,
        "Wind_Speed_kt": 19.8
      },
      {
        "Altitude_ft": 5856,
        "Temp_c": 17.6,
        "Dewpoint_c": -7,
        "Wind_Direction": 182,
        "Wind_Speed_kt": 19.8
      },
      {
        "Altitude_ft": 5873,
        "Temp_c": 17.5,
        "Dewpoint_c": -7,
        "Wind_Direction": 182,
        "Wind_Speed_kt": 20
      },
      {
        "Altitude_ft": 5889,
        "Temp_c": 17.5,
        "Dewpoint_c": -7.1,
        "Wind_Direction": 182,
        "Wind_Speed_kt": 20
      },
      {
        "Altitude_ft": 5906,
        "Temp_c": 17.4,
        "Dewpoint_c": -7.1,
        "Wind_Direction": 182,
        "Wind_Speed_kt": 20
      },
      {
        "Altitude_ft": 5922,
        "Temp_c": 17.4,
        "Dewpoint_c": -7.1,
        "Wind_Direction": 182,
        "Wind_Speed_kt": 20
      },
      {
        "Altitude_ft": 5938,
        "Temp_c": 17.3,
        "Dewpoint_c": -7.1,
        "Wind_Direction": 182,
        "Wind_Speed_kt": 20
      },
      {
        "Altitude_ft": 5955,
        "Temp_c": 17.3,
        "Dewpoint_c": -7.1,
        "Wind_Direction": 182,
        "Wind_Speed_kt": 20
      },
      {
        "Altitude_ft": 5974,
        "Temp_c": 17.2,
        "Dewpoint_c": -7.1,
        "Wind_Direction": 182,
        "Wind_Speed_kt": 20
      },
      {
        "Altitude_ft": 5991,
        "Temp_c": 17.2,
        "Dewpoint_c": -7.1,
        "Wind_Direction": 182,
        "Wind_Speed_kt": 20
      },
      {
        "Altitude_ft": 6007,
        "Temp_c": 17.1,
        "Dewpoint_c": -7.1,
        "Wind_Direction": 182,
        "Wind_Speed_kt": 20.2
      },
      {
        "Altitude_ft": 6027,
        "Temp_c": 17.1,
        "Dewpoint_c": -7.1,
        "Wind_Direction": 183,
        "Wind_Speed_kt": 20.2
      },
      {
        "Altitude_ft": 6047,
        "Temp_c": 17.1,
        "Dewpoint_c": -7.1,
        "Wind_Direction": 183,
        "Wind_Speed_kt": 20.2
      },
      {
        "Altitude_ft": 6063,
        "Temp_c": 17,
        "Dewpoint_c": -7.1,
        "Wind_Direction": 183,
        "Wind_Speed_kt": 20.2
      },
      {
        "Altitude_ft": 6083,
        "Temp_c": 17,
        "Dewpoint_c": -7.1,
        "Wind_Direction": 183,
        "Wind_Speed_kt": 20.2
      },
      {
        "Altitude_ft": 6102,
        "Temp_c": 16.9,
        "Dewpoint_c": -7.1,
        "Wind_Direction": 183,
        "Wind_Speed_kt": 20.2
      },
      {
        "Altitude_ft": 6119,
        "Temp_c": 16.9,
        "Dewpoint_c": -7.1,
        "Wind_Direction": 182,
        "Wind_Speed_kt": 20.2
      },
      {
        "Altitude_ft": 6135,
        "Temp_c": 16.8,
        "Dewpoint_c": -7.1,
        "Wind_Direction": 182,
        "Wind_Speed_kt": 20.4
      },
      {
        "Altitude_ft": 6155,
        "Temp_c": 16.8,
        "Dewpoint_c": -7.1,
        "Wind_Direction": 182,
        "Wind_Speed_kt": 20.4
      },
      {
        "Altitude_ft": 6171,
        "Temp_c": 16.7,
        "Dewpoint_c": -7.1,
        "Wind_Direction": 182,
        "Wind_Speed_kt": 20.4
      },
      {
        "Altitude_ft": 6188,
        "Temp_c": 16.7,
        "Dewpoint_c": -7.1,
        "Wind_Direction": 182,
        "Wind_Speed_kt": 20.4
      },
      {
        "Altitude_ft": 6204,
        "Temp_c": 16.6,
        "Dewpoint_c": -7.1,
        "Wind_Direction": 182,
        "Wind_Speed_kt": 20.4
      },
      {
        "Altitude_ft": 6217,
        "Temp_c": 16.6,
        "Dewpoint_c": -7.1,
        "Wind_Direction": 182,
        "Wind_Speed_kt": 20.4
      },
      {
        "Altitude_ft": 6234,
        "Temp_c": 16.6,
        "Dewpoint_c": -7.1,
        "Wind_Direction": 182,
        "Wind_Speed_kt": 20.4
      },
      {
        "Altitude_ft": 6247,
        "Temp_c": 16.5,
        "Dewpoint_c": -7.1,
        "Wind_Direction": 182,
        "Wind_Speed_kt": 20.4
      },
      {
        "Altitude_ft": 6263,
        "Temp_c": 16.5,
        "Dewpoint_c": -7,
        "Wind_Direction": 182,
        "Wind_Speed_kt": 20.6
      },
      {
        "Altitude_ft": 6276,
        "Temp_c": 16.5,
        "Dewpoint_c": -7,
        "Wind_Direction": 182,
        "Wind_Speed_kt": 20.6
      },
      {
        "Altitude_ft": 6293,
        "Temp_c": 16.5,
        "Dewpoint_c": -7,
        "Wind_Direction": 182,
        "Wind_Speed_kt": 20.6
      },
      {
        "Altitude_ft": 6306,
        "Temp_c": 16.5,
        "Dewpoint_c": -7,
        "Wind_Direction": 182,
        "Wind_Speed_kt": 20.6
      },
      {
        "Altitude_ft": 6322,
        "Temp_c": 16.4,
        "Dewpoint_c": -7,
        "Wind_Direction": 182,
        "Wind_Speed_kt": 20.6
      },
      {
        "Altitude_ft": 6339,
        "Temp_c": 16.4,
        "Dewpoint_c": -6.9,
        "Wind_Direction": 182,
        "Wind_Speed_kt": 20.6
      },
      {
        "Altitude_ft": 6352,
        "Temp_c": 16.4,
        "Dewpoint_c": -6.9,
        "Wind_Direction": 182,
        "Wind_Speed_kt": 20.6
      },
      {
        "Altitude_ft": 6371,
        "Temp_c": 16.4,
        "Dewpoint_c": -6.9,
        "Wind_Direction": 182,
        "Wind_Speed_kt": 20.6
      },
      {
        "Altitude_ft": 6391,
        "Temp_c": 16.3,
        "Dewpoint_c": -6.9,
        "Wind_Direction": 182,
        "Wind_Speed_kt": 20.8
      },
      {
        "Altitude_ft": 6411,
        "Temp_c": 16.3,
        "Dewpoint_c": -6.9,
        "Wind_Direction": 183,
        "Wind_Speed_kt": 20.4
      },
      {
        "Altitude_ft": 6434,
        "Temp_c": 16.3,
        "Dewpoint_c": -6.8,
        "Wind_Direction": 183,
        "Wind_Speed_kt": 20
      },
      {
        "Altitude_ft": 6453,
        "Temp_c": 16.2,
        "Dewpoint_c": -6.9,
        "Wind_Direction": 183,
        "Wind_Speed_kt": 19.6
      },
      {
        "Altitude_ft": 6473,
        "Temp_c": 16.2,
        "Dewpoint_c": -6.9,
        "Wind_Direction": 183,
        "Wind_Speed_kt": 19.2
      },
      {
        "Altitude_ft": 6496,
        "Temp_c": 16.1,
        "Dewpoint_c": -6.9,
        "Wind_Direction": 184,
        "Wind_Speed_kt": 19
      },
      {
        "Altitude_ft": 6519,
        "Temp_c": 16,
        "Dewpoint_c": -6.9,
        "Wind_Direction": 184,
        "Wind_Speed_kt": 18.7
      },
      {
        "Altitude_ft": 6542,
        "Temp_c": 16,
        "Dewpoint_c": -6.9,
        "Wind_Direction": 184,
        "Wind_Speed_kt": 18.3
      },
      {
        "Altitude_ft": 6565,
        "Temp_c": 15.9,
        "Dewpoint_c": -7,
        "Wind_Direction": 185,
        "Wind_Speed_kt": 17.9
      },
      {
        "Altitude_ft": 6588,
        "Temp_c": 15.8,
        "Dewpoint_c": -7,
        "Wind_Direction": 185,
        "Wind_Speed_kt": 17.7
      },
      {
        "Altitude_ft": 6608,
        "Temp_c": 15.8,
        "Dewpoint_c": -7,
        "Wind_Direction": 186,
        "Wind_Speed_kt": 17.3
      },
      {
        "Altitude_ft": 6627,
        "Temp_c": 15.7,
        "Dewpoint_c": -7,
        "Wind_Direction": 186,
        "Wind_Speed_kt": 16.9
      },
      {
        "Altitude_ft": 6647,
        "Temp_c": 15.7,
        "Dewpoint_c": -7.1,
        "Wind_Direction": 187,
        "Wind_Speed_kt": 16.5
      },
      {
        "Altitude_ft": 6667,
        "Temp_c": 15.6,
        "Dewpoint_c": -7.1,
        "Wind_Direction": 187,
        "Wind_Speed_kt": 16.3
      },
      {
        "Altitude_ft": 6686,
        "Temp_c": 15.5,
        "Dewpoint_c": -7.1,
        "Wind_Direction": 187,
        "Wind_Speed_kt": 15.9
      },
      {
        "Altitude_ft": 6706,
        "Temp_c": 15.5,
        "Dewpoint_c": -7.1,
        "Wind_Direction": 188,
        "Wind_Speed_kt": 15.6
      },
      {
        "Altitude_ft": 6719,
        "Temp_c": 15.4,
        "Dewpoint_c": -7.1,
        "Wind_Direction": 188,
        "Wind_Speed_kt": 15.4
      },
      {
        "Altitude_ft": 6736,
        "Temp_c": 15.4,
        "Dewpoint_c": -7.1,
        "Wind_Direction": 189,
        "Wind_Speed_kt": 15
      },
      {
        "Altitude_ft": 6752,
        "Temp_c": 15.3,
        "Dewpoint_c": -7.1,
        "Wind_Direction": 190,
        "Wind_Speed_kt": 14.6
      },
      {
        "Altitude_ft": 6765,
        "Temp_c": 15.3,
        "Dewpoint_c": -7.1,
        "Wind_Direction": 190,
        "Wind_Speed_kt": 14.2
      },
      {
        "Altitude_ft": 6781,
        "Temp_c": 15.2,
        "Dewpoint_c": -7.1,
        "Wind_Direction": 191,
        "Wind_Speed_kt": 14
      },
      {
        "Altitude_ft": 6798,
        "Temp_c": 15.2,
        "Dewpoint_c": -7.1,
        "Wind_Direction": 191,
        "Wind_Speed_kt": 13.8
      },
      {
        "Altitude_ft": 6811,
        "Temp_c": 15.2,
        "Dewpoint_c": -7.1,
        "Wind_Direction": 192,
        "Wind_Speed_kt": 13.8
      },
      {
        "Altitude_ft": 6827,
        "Temp_c": 15.1,
        "Dewpoint_c": -7.1,
        "Wind_Direction": 193,
        "Wind_Speed_kt": 13.8
      },
      {
        "Altitude_ft": 6841,
        "Temp_c": 15.1,
        "Dewpoint_c": -7.1,
        "Wind_Direction": 194,
        "Wind_Speed_kt": 13.6
      },
      {
        "Altitude_ft": 6857,
        "Temp_c": 15,
        "Dewpoint_c": -7.1,
        "Wind_Direction": 195,
        "Wind_Speed_kt": 13.6
      },
      {
        "Altitude_ft": 6870,
        "Temp_c": 15,
        "Dewpoint_c": -7.1,
        "Wind_Direction": 195,
        "Wind_Speed_kt": 13.4
      },
      {
        "Altitude_ft": 6890,
        "Temp_c": 14.9,
        "Dewpoint_c": -7.2,
        "Wind_Direction": 196,
        "Wind_Speed_kt": 13.4
      },
      {
        "Altitude_ft": 6903,
        "Temp_c": 14.9,
        "Dewpoint_c": -7.2,
        "Wind_Direction": 197,
        "Wind_Speed_kt": 13.4
      },
      {
        "Altitude_ft": 6916,
        "Temp_c": 14.8,
        "Dewpoint_c": -7.2,
        "Wind_Direction": 198,
        "Wind_Speed_kt": 13.2
      },
      {
        "Altitude_ft": 6932,
        "Temp_c": 14.8,
        "Dewpoint_c": -7.2,
        "Wind_Direction": 199,
        "Wind_Speed_kt": 13.2
      },
      {
        "Altitude_ft": 6949,
        "Temp_c": 14.8,
        "Dewpoint_c": -7.1,
        "Wind_Direction": 199,
        "Wind_Speed_kt": 13.2
      },
      {
        "Altitude_ft": 6965,
        "Temp_c": 14.7,
        "Dewpoint_c": -7.1,
        "Wind_Direction": 200,
        "Wind_Speed_kt": 13.2
      },
      {
        "Altitude_ft": 6982,
        "Temp_c": 14.7,
        "Dewpoint_c": -7.1,
        "Wind_Direction": 201,
        "Wind_Speed_kt": 13
      },
      {
        "Altitude_ft": 6998,
        "Temp_c": 14.6,
        "Dewpoint_c": -7.1,
        "Wind_Direction": 202,
        "Wind_Speed_kt": 13
      },
      {
        "Altitude_ft": 7018,
        "Temp_c": 14.6,
        "Dewpoint_c": -7.1,
        "Wind_Direction": 203,
        "Wind_Speed_kt": 13
      },
      {
        "Altitude_ft": 7034,
        "Temp_c": 14.6,
        "Dewpoint_c": -7.1,
        "Wind_Direction": 204,
        "Wind_Speed_kt": 13
      },
      {
        "Altitude_ft": 7051,
        "Temp_c": 14.5,
        "Dewpoint_c": -7.1,
        "Wind_Direction": 204,
        "Wind_Speed_kt": 12.8
      },
      {
        "Altitude_ft": 7067,
        "Temp_c": 14.5,
        "Dewpoint_c": -7.1,
        "Wind_Direction": 205,
        "Wind_Speed_kt": 12.8
      },
      {
        "Altitude_ft": 7083,
        "Temp_c": 14.4,
        "Dewpoint_c": -7.1,
        "Wind_Direction": 206,
        "Wind_Speed_kt": 12.8
      },
      {
        "Altitude_ft": 7100,
        "Temp_c": 14.4,
        "Dewpoint_c": -7.1,
        "Wind_Direction": 207,
        "Wind_Speed_kt": 12.8
      },
      {
        "Altitude_ft": 7116,
        "Temp_c": 14.4,
        "Dewpoint_c": -7.1,
        "Wind_Direction": 207,
        "Wind_Speed_kt": 12.8
      },
      {
        "Altitude_ft": 7136,
        "Temp_c": 14.3,
        "Dewpoint_c": -7.1,
        "Wind_Direction": 206,
        "Wind_Speed_kt": 12.8
      },
      {
        "Altitude_ft": 7152,
        "Temp_c": 14.3,
        "Dewpoint_c": -7.1,
        "Wind_Direction": 206,
        "Wind_Speed_kt": 12.8
      },
      {
        "Altitude_ft": 7165,
        "Temp_c": 14.2,
        "Dewpoint_c": -7.1,
        "Wind_Direction": 205,
        "Wind_Speed_kt": 12.8
      },
      {
        "Altitude_ft": 7182,
        "Temp_c": 14.2,
        "Dewpoint_c": -7.1,
        "Wind_Direction": 205,
        "Wind_Speed_kt": 12.8
      },
      {
        "Altitude_ft": 7198,
        "Temp_c": 14.1,
        "Dewpoint_c": -7.1,
        "Wind_Direction": 204,
        "Wind_Speed_kt": 12.8
      },
      {
        "Altitude_ft": 7211,
        "Temp_c": 14.1,
        "Dewpoint_c": -7.1,
        "Wind_Direction": 204,
        "Wind_Speed_kt": 12.8
      },
      {
        "Altitude_ft": 7228,
        "Temp_c": 14.1,
        "Dewpoint_c": -7.1,
        "Wind_Direction": 203,
        "Wind_Speed_kt": 12.8
      },
      {
        "Altitude_ft": 7244,
        "Temp_c": 14,
        "Dewpoint_c": -7.1,
        "Wind_Direction": 203,
        "Wind_Speed_kt": 12.8
      },
      {
        "Altitude_ft": 7264,
        "Temp_c": 14,
        "Dewpoint_c": -7.1,
        "Wind_Direction": 203,
        "Wind_Speed_kt": 12.8
      },
      {
        "Altitude_ft": 7280,
        "Temp_c": 13.9,
        "Dewpoint_c": -7.1,
        "Wind_Direction": 202,
        "Wind_Speed_kt": 12.8
      },
      {
        "Altitude_ft": 7297,
        "Temp_c": 13.9,
        "Dewpoint_c": -7.1,
        "Wind_Direction": 202,
        "Wind_Speed_kt": 12.8
      },
      {
        "Altitude_ft": 7316,
        "Temp_c": 13.8,
        "Dewpoint_c": -7.1,
        "Wind_Direction": 201,
        "Wind_Speed_kt": 13
      },
      {
        "Altitude_ft": 7333,
        "Temp_c": 13.8,
        "Dewpoint_c": -7.1,
        "Wind_Direction": 201,
        "Wind_Speed_kt": 13
      },
      {
        "Altitude_ft": 7349,
        "Temp_c": 13.8,
        "Dewpoint_c": -7.1,
        "Wind_Direction": 200,
        "Wind_Speed_kt": 13
      },
      {
        "Altitude_ft": 7365,
        "Temp_c": 13.7,
        "Dewpoint_c": -7.1,
        "Wind_Direction": 200,
        "Wind_Speed_kt": 13
      },
      {
        "Altitude_ft": 7385,
        "Temp_c": 13.7,
        "Dewpoint_c": -7.1,
        "Wind_Direction": 200,
        "Wind_Speed_kt": 13
      },
      {
        "Altitude_ft": 7402,
        "Temp_c": 13.6,
        "Dewpoint_c": -7.1,
        "Wind_Direction": 199,
        "Wind_Speed_kt": 13
      },
      {
        "Altitude_ft": 7418,
        "Temp_c": 13.6,
        "Dewpoint_c": -7.2,
        "Wind_Direction": 199,
        "Wind_Speed_kt": 13
      },
      {
        "Altitude_ft": 7438,
        "Temp_c": 13.5,
        "Dewpoint_c": -7.2,
        "Wind_Direction": 198,
        "Wind_Speed_kt": 13
      },
      {
        "Altitude_ft": 7454,
        "Temp_c": 13.5,
        "Dewpoint_c": -7.2,
        "Wind_Direction": 199,
        "Wind_Speed_kt": 12.8
      },
      {
        "Altitude_ft": 7474,
        "Temp_c": 13.4,
        "Dewpoint_c": -7.2,
        "Wind_Direction": 199,
        "Wind_Speed_kt": 12.8
      },
      {
        "Altitude_ft": 7490,
        "Temp_c": 13.4,
        "Dewpoint_c": -7.2,
        "Wind_Direction": 199,
        "Wind_Speed_kt": 12.6
      },
      {
        "Altitude_ft": 7510,
        "Temp_c": 13.3,
        "Dewpoint_c": -7.2,
        "Wind_Direction": 200,
        "Wind_Speed_kt": 12.4
      },
      {
        "Altitude_ft": 7530,
        "Temp_c": 13.3,
        "Dewpoint_c": -7.2,
        "Wind_Direction": 200,
        "Wind_Speed_kt": 12.4
      },
      {
        "Altitude_ft": 7546,
        "Temp_c": 13.2,
        "Dewpoint_c": -7.2,
        "Wind_Direction": 200,
        "Wind_Speed_kt": 12.2
      },
      {
        "Altitude_ft": 7562,
        "Temp_c": 13.2,
        "Dewpoint_c": -7.2,
        "Wind_Direction": 200,
        "Wind_Speed_kt": 12.1
      },
      {
        "Altitude_ft": 7579,
        "Temp_c": 13.1,
        "Dewpoint_c": -7.2,
        "Wind_Direction": 201,
        "Wind_Speed_kt": 12.1
      },
      {
        "Altitude_ft": 7595,
        "Temp_c": 13.1,
        "Dewpoint_c": -7.2,
        "Wind_Direction": 201,
        "Wind_Speed_kt": 11.9
      },
      {
        "Altitude_ft": 7612,
        "Temp_c": 13,
        "Dewpoint_c": -7.2,
        "Wind_Direction": 202,
        "Wind_Speed_kt": 11.7
      },
      {
        "Altitude_ft": 7628,
        "Temp_c": 13,
        "Dewpoint_c": -7.2,
        "Wind_Direction": 202,
        "Wind_Speed_kt": 11.7
      },
      {
        "Altitude_ft": 7644,
        "Temp_c": 12.9,
        "Dewpoint_c": -7.3,
        "Wind_Direction": 202,
        "Wind_Speed_kt": 11.5
      },
      {
        "Altitude_ft": 7661,
        "Temp_c": 12.9,
        "Dewpoint_c": -7.3,
        "Wind_Direction": 203,
        "Wind_Speed_kt": 11.3
      },
      {
        "Altitude_ft": 7677,
        "Temp_c": 12.8,
        "Dewpoint_c": -7.3,
        "Wind_Direction": 203,
        "Wind_Speed_kt": 11.3
      },
      {
        "Altitude_ft": 7694,
        "Temp_c": 12.8,
        "Dewpoint_c": -7.3,
        "Wind_Direction": 203,
        "Wind_Speed_kt": 11.1
      },
      {
        "Altitude_ft": 7710,
        "Temp_c": 12.7,
        "Dewpoint_c": -7.3,
        "Wind_Direction": 204,
        "Wind_Speed_kt": 10.9
      },
      {
        "Altitude_ft": 7726,
        "Temp_c": 12.7,
        "Dewpoint_c": -7.3,
        "Wind_Direction": 204,
        "Wind_Speed_kt": 10.9
      },
      {
        "Altitude_ft": 7746,
        "Temp_c": 12.6,
        "Dewpoint_c": -7.4,
        "Wind_Direction": 205,
        "Wind_Speed_kt": 10.7
      },
      {
        "Altitude_ft": 7762,
        "Temp_c": 12.6,
        "Dewpoint_c": -7.4,
        "Wind_Direction": 205,
        "Wind_Speed_kt": 10.5
      },
      {
        "Altitude_ft": 7782,
        "Temp_c": 12.5,
        "Dewpoint_c": -7.4,
        "Wind_Direction": 206,
        "Wind_Speed_kt": 10.5
      },
      {
        "Altitude_ft": 7802,
        "Temp_c": 12.5,
        "Dewpoint_c": -7.4,
        "Wind_Direction": 206,
        "Wind_Speed_kt": 10.5
      },
      {
        "Altitude_ft": 7822,
        "Temp_c": 12.4,
        "Dewpoint_c": -7.4,
        "Wind_Direction": 206,
        "Wind_Speed_kt": 10.5
      },
      {
        "Altitude_ft": 7838,
        "Temp_c": 12.4,
        "Dewpoint_c": -7.4,
        "Wind_Direction": 206,
        "Wind_Speed_kt": 10.5
      },
      {
        "Altitude_ft": 7858,
        "Temp_c": 12.3,
        "Dewpoint_c": -7.5,
        "Wind_Direction": 206,
        "Wind_Speed_kt": 10.5
      },
      {
        "Altitude_ft": 7874,
        "Temp_c": 12.3,
        "Dewpoint_c": -7.5,
        "Wind_Direction": 207,
        "Wind_Speed_kt": 10.5
      },
      {
        "Altitude_ft": 7894,
        "Temp_c": 12.2,
        "Dewpoint_c": -7.5,
        "Wind_Direction": 207,
        "Wind_Speed_kt": 10.5
      },
      {
        "Altitude_ft": 7913,
        "Temp_c": 12.1,
        "Dewpoint_c": -7.5,
        "Wind_Direction": 207,
        "Wind_Speed_kt": 10.5
      },
      {
        "Altitude_ft": 7930,
        "Temp_c": 12.1,
        "Dewpoint_c": -7.5,
        "Wind_Direction": 207,
        "Wind_Speed_kt": 10.5
      },
      {
        "Altitude_ft": 7949,
        "Temp_c": 12,
        "Dewpoint_c": -7.5,
        "Wind_Direction": 207,
        "Wind_Speed_kt": 10.5
      },
      {
        "Altitude_ft": 7969,
        "Temp_c": 12,
        "Dewpoint_c": -7.5,
        "Wind_Direction": 208,
        "Wind_Speed_kt": 10.5
      },
      {
        "Altitude_ft": 7986,
        "Temp_c": 11.9,
        "Dewpoint_c": -7.5,
        "Wind_Direction": 208,
        "Wind_Speed_kt": 10.5
      },
      {
        "Altitude_ft": 8005,
        "Temp_c": 11.9,
        "Dewpoint_c": -7.6,
        "Wind_Direction": 208,
        "Wind_Speed_kt": 10.5
      },
      {
        "Altitude_ft": 8025,
        "Temp_c": 11.8,
        "Dewpoint_c": -7.6,
        "Wind_Direction": 208,
        "Wind_Speed_kt": 10.5
      },
      {
        "Altitude_ft": 8045,
        "Temp_c": 11.8,
        "Dewpoint_c": -7.6,
        "Wind_Direction": 208,
        "Wind_Speed_kt": 10.5
      },
      {
        "Altitude_ft": 8064,
        "Temp_c": 11.7,
        "Dewpoint_c": -7.6,
        "Wind_Direction": 209,
        "Wind_Speed_kt": 10.5
      },
      {
        "Altitude_ft": 8084,
        "Temp_c": 11.6,
        "Dewpoint_c": -7.6,
        "Wind_Direction": 209,
        "Wind_Speed_kt": 10.5
      },
      {
        "Altitude_ft": 8104,
        "Temp_c": 11.6,
        "Dewpoint_c": -7.6,
        "Wind_Direction": 209,
        "Wind_Speed_kt": 10.5
      },
      {
        "Altitude_ft": 8123,
        "Temp_c": 11.5,
        "Dewpoint_c": -7.6,
        "Wind_Direction": 209,
        "Wind_Speed_kt": 10.5
      },
      {
        "Altitude_ft": 8143,
        "Temp_c": 11.5,
        "Dewpoint_c": -7.6,
        "Wind_Direction": 209,
        "Wind_Speed_kt": 10.5
      },
      {
        "Altitude_ft": 8159,
        "Temp_c": 11.4,
        "Dewpoint_c": -7.6,
        "Wind_Direction": 209,
        "Wind_Speed_kt": 10.5
      },
      {
        "Altitude_ft": 8176,
        "Temp_c": 11.4,
        "Dewpoint_c": -7.6,
        "Wind_Direction": 210,
        "Wind_Speed_kt": 10.5
      },
      {
        "Altitude_ft": 8192,
        "Temp_c": 11.4,
        "Dewpoint_c": -7.6,
        "Wind_Direction": 210,
        "Wind_Speed_kt": 10.3
      },
      {
        "Altitude_ft": 8209,
        "Temp_c": 11.3,
        "Dewpoint_c": -7.6,
        "Wind_Direction": 211,
        "Wind_Speed_kt": 10.1
      },
      {
        "Altitude_ft": 8225,
        "Temp_c": 11.3,
        "Dewpoint_c": -7.6,
        "Wind_Direction": 211,
        "Wind_Speed_kt": 10.1
      },
      {
        "Altitude_ft": 8241,
        "Temp_c": 11.2,
        "Dewpoint_c": -7.6,
        "Wind_Direction": 212,
        "Wind_Speed_kt": 9.9
      },
      {
        "Altitude_ft": 8258,
        "Temp_c": 11.2,
        "Dewpoint_c": -7.6,
        "Wind_Direction": 212,
        "Wind_Speed_kt": 9.7
      },
      {
        "Altitude_ft": 8274,
        "Temp_c": 11.1,
        "Dewpoint_c": -7.6,
        "Wind_Direction": 212,
        "Wind_Speed_kt": 9.5
      },
      {
        "Altitude_ft": 8291,
        "Temp_c": 11.1,
        "Dewpoint_c": -7.6,
        "Wind_Direction": 213,
        "Wind_Speed_kt": 9.5
      },
      {
        "Altitude_ft": 8304,
        "Temp_c": 11,
        "Dewpoint_c": -7.6,
        "Wind_Direction": 213,
        "Wind_Speed_kt": 9.3
      },
      {
        "Altitude_ft": 8320,
        "Temp_c": 11,
        "Dewpoint_c": -7.6,
        "Wind_Direction": 214,
        "Wind_Speed_kt": 9.1
      },
      {
        "Altitude_ft": 8337,
        "Temp_c": 10.9,
        "Dewpoint_c": -7.6,
        "Wind_Direction": 214,
        "Wind_Speed_kt": 9.1
      },
      {
        "Altitude_ft": 8350,
        "Temp_c": 10.9,
        "Dewpoint_c": -7.7,
        "Wind_Direction": 215,
        "Wind_Speed_kt": 8.9
      },
      {
        "Altitude_ft": 8366,
        "Temp_c": 10.8,
        "Dewpoint_c": -7.7,
        "Wind_Direction": 216,
        "Wind_Speed_kt": 8.7
      },
      {
        "Altitude_ft": 8379,
        "Temp_c": 10.8,
        "Dewpoint_c": -7.7,
        "Wind_Direction": 216,
        "Wind_Speed_kt": 8.7
      },
      {
        "Altitude_ft": 8396,
        "Temp_c": 10.7,
        "Dewpoint_c": -7.7,
        "Wind_Direction": 217,
        "Wind_Speed_kt": 8.6
      },
      {
        "Altitude_ft": 8412,
        "Temp_c": 10.6,
        "Dewpoint_c": -7.7,
        "Wind_Direction": 217,
        "Wind_Speed_kt": 8.4
      },
      {
        "Altitude_ft": 8432,
        "Temp_c": 10.6,
        "Dewpoint_c": -7.8,
        "Wind_Direction": 218,
        "Wind_Speed_kt": 8.4
      },
      {
        "Altitude_ft": 8451,
        "Temp_c": 10.5,
        "Dewpoint_c": -7.8,
        "Wind_Direction": 219,
        "Wind_Speed_kt": 8.2
      },
      {
        "Altitude_ft": 8471,
        "Temp_c": 10.5,
        "Dewpoint_c": -7.8,
        "Wind_Direction": 219,
        "Wind_Speed_kt": 8.2
      },
      {
        "Altitude_ft": 8488,
        "Temp_c": 10.4,
        "Dewpoint_c": -7.8,
        "Wind_Direction": 220,
        "Wind_Speed_kt": 8
      },
      {
        "Altitude_ft": 8507,
        "Temp_c": 10.4,
        "Dewpoint_c": -7.8,
        "Wind_Direction": 220,
        "Wind_Speed_kt": 8
      },
      {
        "Altitude_ft": 8527,
        "Temp_c": 10.3,
        "Dewpoint_c": -7.8,
        "Wind_Direction": 221,
        "Wind_Speed_kt": 8
      },
      {
        "Altitude_ft": 8547,
        "Temp_c": 10.3,
        "Dewpoint_c": -7.8,
        "Wind_Direction": 221,
        "Wind_Speed_kt": 8
      },
      {
        "Altitude_ft": 8566,
        "Temp_c": 10.2,
        "Dewpoint_c": -7.8,
        "Wind_Direction": 222,
        "Wind_Speed_kt": 8
      },
      {
        "Altitude_ft": 8586,
        "Temp_c": 10.2,
        "Dewpoint_c": -7.9,
        "Wind_Direction": 222,
        "Wind_Speed_kt": 8
      },
      {
        "Altitude_ft": 8606,
        "Temp_c": 10.1,
        "Dewpoint_c": -7.9,
        "Wind_Direction": 223,
        "Wind_Speed_kt": 8
      },
      {
        "Altitude_ft": 8622,
        "Temp_c": 10.1,
        "Dewpoint_c": -7.9,
        "Wind_Direction": 223,
        "Wind_Speed_kt": 8
      },
      {
        "Altitude_ft": 8642,
        "Temp_c": 10,
        "Dewpoint_c": -7.9,
        "Wind_Direction": 224,
        "Wind_Speed_kt": 8
      },
      {
        "Altitude_ft": 8658,
        "Temp_c": 9.9,
        "Dewpoint_c": -7.9,
        "Wind_Direction": 224,
        "Wind_Speed_kt": 8
      },
      {
        "Altitude_ft": 8675,
        "Temp_c": 9.9,
        "Dewpoint_c": -7.9,
        "Wind_Direction": 225,
        "Wind_Speed_kt": 8
      },
      {
        "Altitude_ft": 8691,
        "Temp_c": 9.8,
        "Dewpoint_c": -7.9,
        "Wind_Direction": 226,
        "Wind_Speed_kt": 8
      },
      {
        "Altitude_ft": 8707,
        "Temp_c": 9.8,
        "Dewpoint_c": -7.9,
        "Wind_Direction": 226,
        "Wind_Speed_kt": 8
      },
      {
        "Altitude_ft": 8727,
        "Temp_c": 9.7,
        "Dewpoint_c": -7.9,
        "Wind_Direction": 227,
        "Wind_Speed_kt": 8
      },
      {
        "Altitude_ft": 8750,
        "Temp_c": 9.7,
        "Dewpoint_c": -7.9,
        "Wind_Direction": 227,
        "Wind_Speed_kt": 8
      },
      {
        "Altitude_ft": 8770,
        "Temp_c": 9.6,
        "Dewpoint_c": -7.9,
        "Wind_Direction": 228,
        "Wind_Speed_kt": 8
      },
      {
        "Altitude_ft": 8793,
        "Temp_c": 9.6,
        "Dewpoint_c": -7.9,
        "Wind_Direction": 228,
        "Wind_Speed_kt": 8
      },
      {
        "Altitude_ft": 8812,
        "Temp_c": 9.5,
        "Dewpoint_c": -7.9,
        "Wind_Direction": 229,
        "Wind_Speed_kt": 8
      },
      {
        "Altitude_ft": 8832,
        "Temp_c": 9.5,
        "Dewpoint_c": -7.9,
        "Wind_Direction": 229,
        "Wind_Speed_kt": 8
      },
      {
        "Altitude_ft": 8852,
        "Temp_c": 9.4,
        "Dewpoint_c": -7.9,
        "Wind_Direction": 230,
        "Wind_Speed_kt": 8.2
      },
      {
        "Altitude_ft": 8875,
        "Temp_c": 9.3,
        "Dewpoint_c": -7.9,
        "Wind_Direction": 230,
        "Wind_Speed_kt": 8.2
      },
      {
        "Altitude_ft": 8894,
        "Temp_c": 9.3,
        "Dewpoint_c": -8,
        "Wind_Direction": 230,
        "Wind_Speed_kt": 8.2
      },
      {
        "Altitude_ft": 8914,
        "Temp_c": 9.2,
        "Dewpoint_c": -8,
        "Wind_Direction": 229,
        "Wind_Speed_kt": 8.4
      },
      {
        "Altitude_ft": 8934,
        "Temp_c": 9.2,
        "Dewpoint_c": -8,
        "Wind_Direction": 229,
        "Wind_Speed_kt": 8.4
      },
      {
        "Altitude_ft": 8953,
        "Temp_c": 9.1,
        "Dewpoint_c": -8,
        "Wind_Direction": 229,
        "Wind_Speed_kt": 8.6
      },
      {
        "Altitude_ft": 8973,
        "Temp_c": 9.1,
        "Dewpoint_c": -8,
        "Wind_Direction": 228,
        "Wind_Speed_kt": 8.6
      },
      {
        "Altitude_ft": 8993,
        "Temp_c": 9,
        "Dewpoint_c": -8,
        "Wind_Direction": 228,
        "Wind_Speed_kt": 8.7
      },
      {
        "Altitude_ft": 9012,
        "Temp_c": 8.9,
        "Dewpoint_c": -8,
        "Wind_Direction": 228,
        "Wind_Speed_kt": 8.7
      },
      {
        "Altitude_ft": 9032,
        "Temp_c": 8.9,
        "Dewpoint_c": -8,
        "Wind_Direction": 227,
        "Wind_Speed_kt": 8.9
      },
      {
        "Altitude_ft": 9052,
        "Temp_c": 8.8,
        "Dewpoint_c": -8,
        "Wind_Direction": 227,
        "Wind_Speed_kt": 8.9
      },
      {
        "Altitude_ft": 9068,
        "Temp_c": 8.8,
        "Dewpoint_c": -8,
        "Wind_Direction": 227,
        "Wind_Speed_kt": 9.1
      },
      {
        "Altitude_ft": 9081,
        "Temp_c": 8.7,
        "Dewpoint_c": -8,
        "Wind_Direction": 226,
        "Wind_Speed_kt": 9.1
      },
      {
        "Altitude_ft": 9098,
        "Temp_c": 8.7,
        "Dewpoint_c": -8.1,
        "Wind_Direction": 226,
        "Wind_Speed_kt": 9.3
      },
      {
        "Altitude_ft": 9114,
        "Temp_c": 8.6,
        "Dewpoint_c": -8.1,
        "Wind_Direction": 226,
        "Wind_Speed_kt": 9.5
      },
      {
        "Altitude_ft": 9131,
        "Temp_c": 8.6,
        "Dewpoint_c": -8.1,
        "Wind_Direction": 226,
        "Wind_Speed_kt": 9.5
      },
      {
        "Altitude_ft": 9147,
        "Temp_c": 8.5,
        "Dewpoint_c": -8.1,
        "Wind_Direction": 225,
        "Wind_Speed_kt": 9.7
      },
      {
        "Altitude_ft": 9160,
        "Temp_c": 8.5,
        "Dewpoint_c": -8.1,
        "Wind_Direction": 225,
        "Wind_Speed_kt": 9.7
      },
      {
        "Altitude_ft": 9177,
        "Temp_c": 8.5,
        "Dewpoint_c": -8.1,
        "Wind_Direction": 225,
        "Wind_Speed_kt": 9.9
      },
      {
        "Altitude_ft": 9193,
        "Temp_c": 8.4,
        "Dewpoint_c": -8.1,
        "Wind_Direction": 225,
        "Wind_Speed_kt": 9.9
      },
      {
        "Altitude_ft": 9206,
        "Temp_c": 8.4,
        "Dewpoint_c": -8.1,
        "Wind_Direction": 224,
        "Wind_Speed_kt": 10.1
      },
      {
        "Altitude_ft": 9222,
        "Temp_c": 8.3,
        "Dewpoint_c": -8.1,
        "Wind_Direction": 224,
        "Wind_Speed_kt": 10.1
      },
      {
        "Altitude_ft": 9239,
        "Temp_c": 8.3,
        "Dewpoint_c": -8.1,
        "Wind_Direction": 225,
        "Wind_Speed_kt": 10.3
      },
      {
        "Altitude_ft": 9255,
        "Temp_c": 8.2,
        "Dewpoint_c": -8.1,
        "Wind_Direction": 225,
        "Wind_Speed_kt": 10.5
      },
      {
        "Altitude_ft": 9272,
        "Temp_c": 8.2,
        "Dewpoint_c": -8.1,
        "Wind_Direction": 225,
        "Wind_Speed_kt": 10.5
      },
      {
        "Altitude_ft": 9288,
        "Temp_c": 8.1,
        "Dewpoint_c": -8.1,
        "Wind_Direction": 225,
        "Wind_Speed_kt": 10.7
      },
      {
        "Altitude_ft": 9304,
        "Temp_c": 8.1,
        "Dewpoint_c": -8.1,
        "Wind_Direction": 226,
        "Wind_Speed_kt": 10.7
      },
      {
        "Altitude_ft": 9321,
        "Temp_c": 8,
        "Dewpoint_c": -8.1,
        "Wind_Direction": 226,
        "Wind_Speed_kt": 10.9
      },
      {
        "Altitude_ft": 9341,
        "Temp_c": 8,
        "Dewpoint_c": -8.1,
        "Wind_Direction": 226,
        "Wind_Speed_kt": 10.9
      },
      {
        "Altitude_ft": 9357,
        "Temp_c": 7.9,
        "Dewpoint_c": -8.2,
        "Wind_Direction": 227,
        "Wind_Speed_kt": 11.1
      },
      {
        "Altitude_ft": 9377,
        "Temp_c": 7.9,
        "Dewpoint_c": -8.2,
        "Wind_Direction": 227,
        "Wind_Speed_kt": 11.3
      },
      {
        "Altitude_ft": 9396,
        "Temp_c": 7.8,
        "Dewpoint_c": -8.2,
        "Wind_Direction": 227,
        "Wind_Speed_kt": 11.3
      },
      {
        "Altitude_ft": 9413,
        "Temp_c": 7.8,
        "Dewpoint_c": -8.2,
        "Wind_Direction": 227,
        "Wind_Speed_kt": 11.5
      },
      {
        "Altitude_ft": 9432,
        "Temp_c": 7.7,
        "Dewpoint_c": -8.2,
        "Wind_Direction": 228,
        "Wind_Speed_kt": 11.5
      },
      {
        "Altitude_ft": 9449,
        "Temp_c": 7.6,
        "Dewpoint_c": -8.2,
        "Wind_Direction": 228,
        "Wind_Speed_kt": 11.7
      },
      {
        "Altitude_ft": 9469,
        "Temp_c": 7.6,
        "Dewpoint_c": -8.2,
        "Wind_Direction": 228,
        "Wind_Speed_kt": 11.9
      },
      {
        "Altitude_ft": 9488,
        "Temp_c": 7.5,
        "Dewpoint_c": -8.2,
        "Wind_Direction": 228,
        "Wind_Speed_kt": 11.9
      },
      {
        "Altitude_ft": 9505,
        "Temp_c": 7.5,
        "Dewpoint_c": -8.3,
        "Wind_Direction": 229,
        "Wind_Speed_kt": 12.1
      },
      {
        "Altitude_ft": 9524,
        "Temp_c": 7.4,
        "Dewpoint_c": -8.3,
        "Wind_Direction": 229,
        "Wind_Speed_kt": 12.1
      },
      {
        "Altitude_ft": 9541,
        "Temp_c": 7.4,
        "Dewpoint_c": -8.3,
        "Wind_Direction": 229,
        "Wind_Speed_kt": 12.2
      },
      {
        "Altitude_ft": 9557,
        "Temp_c": 7.3,
        "Dewpoint_c": -8.3,
        "Wind_Direction": 229,
        "Wind_Speed_kt": 12.4
      },
      {
        "Altitude_ft": 9573,
        "Temp_c": 7.3,
        "Dewpoint_c": -8.3,
        "Wind_Direction": 230,
        "Wind_Speed_kt": 12.4
      },
      {
        "Altitude_ft": 9593,
        "Temp_c": 7.2,
        "Dewpoint_c": -8.3,
        "Wind_Direction": 229,
        "Wind_Speed_kt": 12.4
      },
      {
        "Altitude_ft": 9610,
        "Temp_c": 7.2,
        "Dewpoint_c": -8.3,
        "Wind_Direction": 229,
        "Wind_Speed_kt": 12.4
      },
      {
        "Altitude_ft": 9626,
        "Temp_c": 7.1,
        "Dewpoint_c": -8.3,
        "Wind_Direction": 229,
        "Wind_Speed_kt": 12.2
      },
      {
        "Altitude_ft": 9646,
        "Temp_c": 7.1,
        "Dewpoint_c": -8.3,
        "Wind_Direction": 229,
        "Wind_Speed_kt": 12.2
      },
      {
        "Altitude_ft": 9662,
        "Temp_c": 7,
        "Dewpoint_c": -8.3,
        "Wind_Direction": 228,
        "Wind_Speed_kt": 12.2
      },
      {
        "Altitude_ft": 9682,
        "Temp_c": 7,
        "Dewpoint_c": -8.3,
        "Wind_Direction": 228,
        "Wind_Speed_kt": 12.2
      },
      {
        "Altitude_ft": 9698,
        "Temp_c": 6.9,
        "Dewpoint_c": -8.3,
        "Wind_Direction": 228,
        "Wind_Speed_kt": 12.1
      },
      {
        "Altitude_ft": 9718,
        "Temp_c": 6.9,
        "Dewpoint_c": -8.3,
        "Wind_Direction": 228,
        "Wind_Speed_kt": 12.1
      },
      {
        "Altitude_ft": 9738,
        "Temp_c": 6.8,
        "Dewpoint_c": -8.3,
        "Wind_Direction": 227,
        "Wind_Speed_kt": 12.1
      },
      {
        "Altitude_ft": 9754,
        "Temp_c": 6.8,
        "Dewpoint_c": -8.4,
        "Wind_Direction": 227,
        "Wind_Speed_kt": 12.1
      },
      {
        "Altitude_ft": 9770,
        "Temp_c": 6.7,
        "Dewpoint_c": -8.4,
        "Wind_Direction": 227,
        "Wind_Speed_kt": 11.9
      },
      {
        "Altitude_ft": 9790,
        "Temp_c": 6.6,
        "Dewpoint_c": -8.4,
        "Wind_Direction": 227,
        "Wind_Speed_kt": 11.9
      },
      {
        "Altitude_ft": 9806,
        "Temp_c": 6.6,
        "Dewpoint_c": -8.4,
        "Wind_Direction": 226,
        "Wind_Speed_kt": 11.9
      },
      {
        "Altitude_ft": 9826,
        "Temp_c": 6.5,
        "Dewpoint_c": -8.4,
        "Wind_Direction": 226,
        "Wind_Speed_kt": 11.7
      },
      {
        "Altitude_ft": 9839,
        "Temp_c": 6.5,
        "Dewpoint_c": -8.5,
        "Wind_Direction": 226,
        "Wind_Speed_kt": 11.7
      },
      {
        "Altitude_ft": 9856,
        "Temp_c": 6.4,
        "Dewpoint_c": -8.5,
        "Wind_Direction": 225,
        "Wind_Speed_kt": 11.7
      },
      {
        "Altitude_ft": 9872,
        "Temp_c": 6.4,
        "Dewpoint_c": -8.5,
        "Wind_Direction": 225,
        "Wind_Speed_kt": 11.7
      },
      {
        "Altitude_ft": 9888,
        "Temp_c": 6.3,
        "Dewpoint_c": -8.5,
        "Wind_Direction": 225,
        "Wind_Speed_kt": 11.5
      },
      {
        "Altitude_ft": 9905,
        "Temp_c": 6.2,
        "Dewpoint_c": -8.5,
        "Wind_Direction": 225,
        "Wind_Speed_kt": 11.5
      },
      {
        "Altitude_ft": 9925,
        "Temp_c": 6.2,
        "Dewpoint_c": -8.6,
        "Wind_Direction": 224,
        "Wind_Speed_kt": 11.5
      },
      {
        "Altitude_ft": 9948,
        "Temp_c": 6.1,
        "Dewpoint_c": -8.6,
        "Wind_Direction": 225,
        "Wind_Speed_kt": 11.5
      },
      {
        "Altitude_ft": 9970,
        "Temp_c": 6.1,
        "Dewpoint_c": -8.6,
        "Wind_Direction": 225,
        "Wind_Speed_kt": 11.5
      },
      {
        "Altitude_ft": 9993,
        "Temp_c": 6,
        "Dewpoint_c": -8.6,
        "Wind_Direction": 226,
        "Wind_Speed_kt": 11.3
      },
      {
        "Altitude_ft": 10016,
        "Temp_c": 5.9,
        "Dewpoint_c": -8.6,
        "Wind_Direction": 227,
        "Wind_Speed_kt": 11.3
      },
      {
        "Altitude_ft": 10039,
        "Temp_c": 5.9,
        "Dewpoint_c": -8.7,
        "Wind_Direction": 227,
        "Wind_Speed_kt": 11.3
      },
      {
        "Altitude_ft": 10059,
        "Temp_c": 5.8,
        "Dewpoint_c": -8.7,
        "Wind_Direction": 228,
        "Wind_Speed_kt": 11.3
      },
      {
        "Altitude_ft": 10079,
        "Temp_c": 5.8,
        "Dewpoint_c": -8.7,
        "Wind_Direction": 228,
        "Wind_Speed_kt": 11.3
      },
      {
        "Altitude_ft": 10102,
        "Temp_c": 5.7,
        "Dewpoint_c": -8.7,
        "Wind_Direction": 229,
        "Wind_Speed_kt": 11.3
      },
      {
        "Altitude_ft": 10121,
        "Temp_c": 5.6,
        "Dewpoint_c": -8.7,
        "Wind_Direction": 230,
        "Wind_Speed_kt": 11.3
      },
      {
        "Altitude_ft": 10141,
        "Temp_c": 5.6,
        "Dewpoint_c": -8.7,
        "Wind_Direction": 230,
        "Wind_Speed_kt": 11.3
      },
      {
        "Altitude_ft": 10161,
        "Temp_c": 5.5,
        "Dewpoint_c": -8.7,
        "Wind_Direction": 231,
        "Wind_Speed_kt": 11.1
      },
      {
        "Altitude_ft": 10180,
        "Temp_c": 5.5,
        "Dewpoint_c": -8.8,
        "Wind_Direction": 231,
        "Wind_Speed_kt": 11.1
      },
      {
        "Altitude_ft": 10203,
        "Temp_c": 5.4,
        "Dewpoint_c": -8.8,
        "Wind_Direction": 232,
        "Wind_Speed_kt": 11.1
      },
      {
        "Altitude_ft": 10223,
        "Temp_c": 5.3,
        "Dewpoint_c": -8.8,
        "Wind_Direction": 233,
        "Wind_Speed_kt": 11.1
      },
      {
        "Altitude_ft": 10243,
        "Temp_c": 5.3,
        "Dewpoint_c": -8.8,
        "Wind_Direction": 233,
        "Wind_Speed_kt": 11.1
      },
      {
        "Altitude_ft": 10259,
        "Temp_c": 5.2,
        "Dewpoint_c": -8.8,
        "Wind_Direction": 234,
        "Wind_Speed_kt": 11.1
      },
      {
        "Altitude_ft": 10285,
        "Temp_c": 5.2,
        "Dewpoint_c": -8.8,
        "Wind_Direction": 235,
        "Wind_Speed_kt": 11.1
      },
      {
        "Altitude_ft": 10305,
        "Temp_c": 5.1,
        "Dewpoint_c": -8.8,
        "Wind_Direction": 235,
        "Wind_Speed_kt": 11.1
      },
      {
        "Altitude_ft": 10328,
        "Temp_c": 5.1,
        "Dewpoint_c": -8.8,
        "Wind_Direction": 236,
        "Wind_Speed_kt": 11.1
      },
      {
        "Altitude_ft": 10348,
        "Temp_c": 5,
        "Dewpoint_c": -8.8,
        "Wind_Direction": 236,
        "Wind_Speed_kt": 11.1
      },
      {
        "Altitude_ft": 10371,
        "Temp_c": 5,
        "Dewpoint_c": -8.8,
        "Wind_Direction": 236,
        "Wind_Speed_kt": 11.1
      },
      {
        "Altitude_ft": 10390,
        "Temp_c": 4.9,
        "Dewpoint_c": -8.8,
        "Wind_Direction": 236,
        "Wind_Speed_kt": 10.9
      },
      {
        "Altitude_ft": 10407,
        "Temp_c": 4.9,
        "Dewpoint_c": -8.8,
        "Wind_Direction": 235,
        "Wind_Speed_kt": 10.9
      },
      {
        "Altitude_ft": 10423,
        "Temp_c": 4.8,
        "Dewpoint_c": -8.8,
        "Wind_Direction": 235,
        "Wind_Speed_kt": 10.9
      },
      {
        "Altitude_ft": 10440,
        "Temp_c": 4.8,
        "Dewpoint_c": -8.8,
        "Wind_Direction": 234,
        "Wind_Speed_kt": 10.9
      },
      {
        "Altitude_ft": 10453,
        "Temp_c": 4.7,
        "Dewpoint_c": -8.8,
        "Wind_Direction": 234,
        "Wind_Speed_kt": 10.9
      },
      {
        "Altitude_ft": 10469,
        "Temp_c": 4.7,
        "Dewpoint_c": -8.8,
        "Wind_Direction": 233,
        "Wind_Speed_kt": 10.9
      },
      {
        "Altitude_ft": 10486,
        "Temp_c": 4.6,
        "Dewpoint_c": -8.8,
        "Wind_Direction": 233,
        "Wind_Speed_kt": 10.9
      },
      {
        "Altitude_ft": 10505,
        "Temp_c": 4.6,
        "Dewpoint_c": -8.8,
        "Wind_Direction": 232,
        "Wind_Speed_kt": 10.7
      },
      {
        "Altitude_ft": 10525,
        "Temp_c": 4.5,
        "Dewpoint_c": -8.8,
        "Wind_Direction": 232,
        "Wind_Speed_kt": 10.7
      },
      {
        "Altitude_ft": 10545,
        "Temp_c": 4.5,
        "Dewpoint_c": -8.8,
        "Wind_Direction": 231,
        "Wind_Speed_kt": 10.7
      },
      {
        "Altitude_ft": 10561,
        "Temp_c": 4.4,
        "Dewpoint_c": -8.8,
        "Wind_Direction": 231,
        "Wind_Speed_kt": 10.7
      },
      {
        "Altitude_ft": 10581,
        "Temp_c": 4.4,
        "Dewpoint_c": -8.8,
        "Wind_Direction": 230,
        "Wind_Speed_kt": 10.7
      },
      {
        "Altitude_ft": 10600,
        "Temp_c": 4.3,
        "Dewpoint_c": -8.8,
        "Wind_Direction": 230,
        "Wind_Speed_kt": 10.7
      },
      {
        "Altitude_ft": 10620,
        "Temp_c": 4.3,
        "Dewpoint_c": -8.8,
        "Wind_Direction": 229,
        "Wind_Speed_kt": 10.7
      },
      {
        "Altitude_ft": 10636,
        "Temp_c": 4.2,
        "Dewpoint_c": -8.8,
        "Wind_Direction": 229,
        "Wind_Speed_kt": 10.7
      },
      {
        "Altitude_ft": 10656,
        "Temp_c": 4.2,
        "Dewpoint_c": -8.8,
        "Wind_Direction": 228,
        "Wind_Speed_kt": 10.7
      },
      {
        "Altitude_ft": 10676,
        "Temp_c": 4.1,
        "Dewpoint_c": -8.9,
        "Wind_Direction": 228,
        "Wind_Speed_kt": 10.5
      },
      {
        "Altitude_ft": 10696,
        "Temp_c": 4.1,
        "Dewpoint_c": -8.9,
        "Wind_Direction": 227,
        "Wind_Speed_kt": 10.5
      },
      {
        "Altitude_ft": 10715,
        "Temp_c": 4,
        "Dewpoint_c": -8.9,
        "Wind_Direction": 227,
        "Wind_Speed_kt": 10.5
      },
      {
        "Altitude_ft": 10735,
        "Temp_c": 4,
        "Dewpoint_c": -8.9,
        "Wind_Direction": 227,
        "Wind_Speed_kt": 10.5
      },
      {
        "Altitude_ft": 10755,
        "Temp_c": 3.9,
        "Dewpoint_c": -8.9,
        "Wind_Direction": 227,
        "Wind_Speed_kt": 10.7
      },
      {
        "Altitude_ft": 10774,
        "Temp_c": 3.8,
        "Dewpoint_c": -8.9,
        "Wind_Direction": 226,
        "Wind_Speed_kt": 10.7
      },
      {
        "Altitude_ft": 10791,
        "Temp_c": 3.8,
        "Dewpoint_c": -8.9,
        "Wind_Direction": 226,
        "Wind_Speed_kt": 10.7
      },
      {
        "Altitude_ft": 10810,
        "Temp_c": 3.8,
        "Dewpoint_c": -8.9,
        "Wind_Direction": 226,
        "Wind_Speed_kt": 10.9
      },
      {
        "Altitude_ft": 10830,
        "Temp_c": 3.7,
        "Dewpoint_c": -8.9,
        "Wind_Direction": 226,
        "Wind_Speed_kt": 10.9
      },
      {
        "Altitude_ft": 10846,
        "Temp_c": 3.7,
        "Dewpoint_c": -8.9,
        "Wind_Direction": 226,
        "Wind_Speed_kt": 10.9
      },
      {
        "Altitude_ft": 10863,
        "Temp_c": 3.6,
        "Dewpoint_c": -8.9,
        "Wind_Direction": 226,
        "Wind_Speed_kt": 10.9
      },
      {
        "Altitude_ft": 10879,
        "Temp_c": 3.6,
        "Dewpoint_c": -8.9,
        "Wind_Direction": 225,
        "Wind_Speed_kt": 11.1
      },
      {
        "Altitude_ft": 10892,
        "Temp_c": 3.5,
        "Dewpoint_c": -8.9,
        "Wind_Direction": 225,
        "Wind_Speed_kt": 11.1
      },
      {
        "Altitude_ft": 10909,
        "Temp_c": 3.5,
        "Dewpoint_c": -9,
        "Wind_Direction": 225,
        "Wind_Speed_kt": 11.1
      },
      {
        "Altitude_ft": 10925,
        "Temp_c": 3.4,
        "Dewpoint_c": -9,
        "Wind_Direction": 225,
        "Wind_Speed_kt": 11.1
      },
      {
        "Altitude_ft": 10938,
        "Temp_c": 3.4,
        "Dewpoint_c": -9,
        "Wind_Direction": 225,
        "Wind_Speed_kt": 11.3
      },
      {
        "Altitude_ft": 10951,
        "Temp_c": 3.3,
        "Dewpoint_c": -9,
        "Wind_Direction": 225,
        "Wind_Speed_kt": 11.3
      },
      {
        "Altitude_ft": 10965,
        "Temp_c": 3.3,
        "Dewpoint_c": -9,
        "Wind_Direction": 224,
        "Wind_Speed_kt": 11.3
      },
      {
        "Altitude_ft": 10978,
        "Temp_c": 3.3,
        "Dewpoint_c": -9,
        "Wind_Direction": 224,
        "Wind_Speed_kt": 11.5
      },
      {
        "Altitude_ft": 10991,
        "Temp_c": 3.2,
        "Dewpoint_c": -9,
        "Wind_Direction": 224,
        "Wind_Speed_kt": 11.5
      },
      {
        "Altitude_ft": 11004,
        "Temp_c": 3.2,
        "Dewpoint_c": -9,
        "Wind_Direction": 224,
        "Wind_Speed_kt": 11.5
      },
      {
        "Altitude_ft": 11020,
        "Temp_c": 3.1,
        "Dewpoint_c": -9,
        "Wind_Direction": 224,
        "Wind_Speed_kt": 11.5
      },
      {
        "Altitude_ft": 11033,
        "Temp_c": 3.1,
        "Dewpoint_c": -9,
        "Wind_Direction": 224,
        "Wind_Speed_kt": 11.7
      },
      {
        "Altitude_ft": 11050,
        "Temp_c": 3,
        "Dewpoint_c": -9.1,
        "Wind_Direction": 223,
        "Wind_Speed_kt": 11.7
      },
      {
        "Altitude_ft": 11066,
        "Temp_c": 3,
        "Dewpoint_c": -9.1,
        "Wind_Direction": 223,
        "Wind_Speed_kt": 11.9
      },
      {
        "Altitude_ft": 11079,
        "Temp_c": 2.9,
        "Dewpoint_c": -9.1,
        "Wind_Direction": 223,
        "Wind_Speed_kt": 11.9
      },
      {
        "Altitude_ft": 11099,
        "Temp_c": 2.8,
        "Dewpoint_c": -9.1,
        "Wind_Direction": 223,
        "Wind_Speed_kt": 12.1
      },
      {
        "Altitude_ft": 11115,
        "Temp_c": 2.8,
        "Dewpoint_c": -9.1,
        "Wind_Direction": 222,
        "Wind_Speed_kt": 12.1
      },
      {
        "Altitude_ft": 11132,
        "Temp_c": 2.7,
        "Dewpoint_c": -9.1,
        "Wind_Direction": 222,
        "Wind_Speed_kt": 12.2
      },
      {
        "Altitude_ft": 11148,
        "Temp_c": 2.7,
        "Dewpoint_c": -9.2,
        "Wind_Direction": 222,
        "Wind_Speed_kt": 12.2
      },
      {
        "Altitude_ft": 11168,
        "Temp_c": 2.6,
        "Dewpoint_c": -9.2,
        "Wind_Direction": 222,
        "Wind_Speed_kt": 12.4
      },
      {
        "Altitude_ft": 11184,
        "Temp_c": 2.6,
        "Dewpoint_c": -9.2,
        "Wind_Direction": 222,
        "Wind_Speed_kt": 12.4
      },
      {
        "Altitude_ft": 11204,
        "Temp_c": 2.5,
        "Dewpoint_c": -9.2,
        "Wind_Direction": 221,
        "Wind_Speed_kt": 12.6
      },
      {
        "Altitude_ft": 11224,
        "Temp_c": 2.5,
        "Dewpoint_c": -9.2,
        "Wind_Direction": 221,
        "Wind_Speed_kt": 12.6
      },
      {
        "Altitude_ft": 11240,
        "Temp_c": 2.4,
        "Dewpoint_c": -9.2,
        "Wind_Direction": 221,
        "Wind_Speed_kt": 12.8
      },
      {
        "Altitude_ft": 11260,
        "Temp_c": 2.4,
        "Dewpoint_c": -9.2,
        "Wind_Direction": 221,
        "Wind_Speed_kt": 12.8
      },
      {
        "Altitude_ft": 11280,
        "Temp_c": 2.3,
        "Dewpoint_c": -9.2,
        "Wind_Direction": 221,
        "Wind_Speed_kt": 13
      },
      {
        "Altitude_ft": 11296,
        "Temp_c": 2.3,
        "Dewpoint_c": -9.2,
        "Wind_Direction": 221,
        "Wind_Speed_kt": 13.2
      },
      {
        "Altitude_ft": 11312,
        "Temp_c": 2.2,
        "Dewpoint_c": -9.2,
        "Wind_Direction": 220,
        "Wind_Speed_kt": 13.2
      },
      {
        "Altitude_ft": 11329,
        "Temp_c": 2.2,
        "Dewpoint_c": -9.3,
        "Wind_Direction": 220,
        "Wind_Speed_kt": 13.4
      },
      {
        "Altitude_ft": 11348,
        "Temp_c": 2.1,
        "Dewpoint_c": -9.3,
        "Wind_Direction": 220,
        "Wind_Speed_kt": 13.4
      },
      {
        "Altitude_ft": 11365,
        "Temp_c": 2.1,
        "Dewpoint_c": -9.3,
        "Wind_Direction": 220,
        "Wind_Speed_kt": 13.6
      },
      {
        "Altitude_ft": 11381,
        "Temp_c": 2,
        "Dewpoint_c": -9.3,
        "Wind_Direction": 220,
        "Wind_Speed_kt": 13.6
      },
      {
        "Altitude_ft": 11398,
        "Temp_c": 2,
        "Dewpoint_c": -9.3,
        "Wind_Direction": 220,
        "Wind_Speed_kt": 13.6
      },
      {
        "Altitude_ft": 11417,
        "Temp_c": 1.9,
        "Dewpoint_c": -9.3,
        "Wind_Direction": 221,
        "Wind_Speed_kt": 13.8
      },
      {
        "Altitude_ft": 11434,
        "Temp_c": 1.9,
        "Dewpoint_c": -9.3,
        "Wind_Direction": 222,
        "Wind_Speed_kt": 13.8
      },
      {
        "Altitude_ft": 11450,
        "Temp_c": 1.8,
        "Dewpoint_c": -9.3,
        "Wind_Direction": 223,
        "Wind_Speed_kt": 13.8
      },
      {
        "Altitude_ft": 11470,
        "Temp_c": 1.8,
        "Dewpoint_c": -9.3,
        "Wind_Direction": 224,
        "Wind_Speed_kt": 13.8
      },
      {
        "Altitude_ft": 11483,
        "Temp_c": 1.7,
        "Dewpoint_c": -9.3,
        "Wind_Direction": 224,
        "Wind_Speed_kt": 13.8
      },
      {
        "Altitude_ft": 11496,
        "Temp_c": 1.7,
        "Dewpoint_c": -9.3,
        "Wind_Direction": 225,
        "Wind_Speed_kt": 14
      },
      {
        "Altitude_ft": 11512,
        "Temp_c": 1.6,
        "Dewpoint_c": -9.3,
        "Wind_Direction": 226,
        "Wind_Speed_kt": 14
      },
      {
        "Altitude_ft": 11526,
        "Temp_c": 1.6,
        "Dewpoint_c": -9.4,
        "Wind_Direction": 227,
        "Wind_Speed_kt": 14
      },
      {
        "Altitude_ft": 11539,
        "Temp_c": 1.5,
        "Dewpoint_c": -9.4,
        "Wind_Direction": 227,
        "Wind_Speed_kt": 14
      },
      {
        "Altitude_ft": 11552,
        "Temp_c": 1.5,
        "Dewpoint_c": -9.4,
        "Wind_Direction": 228,
        "Wind_Speed_kt": 14.2
      },
      {
        "Altitude_ft": 11568,
        "Temp_c": 1.4,
        "Dewpoint_c": -9.4,
        "Wind_Direction": 229,
        "Wind_Speed_kt": 14.2
      },
      {
        "Altitude_ft": 11585,
        "Temp_c": 1.4,
        "Dewpoint_c": -9.4,
        "Wind_Direction": 229,
        "Wind_Speed_kt": 14.2
      },
      {
        "Altitude_ft": 11601,
        "Temp_c": 1.3,
        "Dewpoint_c": -9.4,
        "Wind_Direction": 230,
        "Wind_Speed_kt": 14.4
      },
      {
        "Altitude_ft": 11617,
        "Temp_c": 1.3,
        "Dewpoint_c": -9.4,
        "Wind_Direction": 231,
        "Wind_Speed_kt": 14.4
      },
      {
        "Altitude_ft": 11634,
        "Temp_c": 1.3,
        "Dewpoint_c": -9.4,
        "Wind_Direction": 232,
        "Wind_Speed_kt": 14.4
      },
      {
        "Altitude_ft": 11650,
        "Temp_c": 1.2,
        "Dewpoint_c": -9.4,
        "Wind_Direction": 232,
        "Wind_Speed_kt": 14.6
      },
      {
        "Altitude_ft": 11667,
        "Temp_c": 1.2,
        "Dewpoint_c": -9.4,
        "Wind_Direction": 233,
        "Wind_Speed_kt": 14.6
      },
      {
        "Altitude_ft": 11683,
        "Temp_c": 1.1,
        "Dewpoint_c": -9.4,
        "Wind_Direction": 234,
        "Wind_Speed_kt": 14.8
      },
      {
        "Altitude_ft": 11699,
        "Temp_c": 1.1,
        "Dewpoint_c": -9.4,
        "Wind_Direction": 234,
        "Wind_Speed_kt": 14.8
      },
      {
        "Altitude_ft": 11716,
        "Temp_c": 1,
        "Dewpoint_c": -9.5,
        "Wind_Direction": 234,
        "Wind_Speed_kt": 14.8
      },
      {
        "Altitude_ft": 11732,
        "Temp_c": 0.9,
        "Dewpoint_c": -9.5,
        "Wind_Direction": 233,
        "Wind_Speed_kt": 14.8
      },
      {
        "Altitude_ft": 11749,
        "Temp_c": 0.9,
        "Dewpoint_c": -9.5,
        "Wind_Direction": 233,
        "Wind_Speed_kt": 14.8
      },
      {
        "Altitude_ft": 11768,
        "Temp_c": 0.8,
        "Dewpoint_c": -9.5,
        "Wind_Direction": 232,
        "Wind_Speed_kt": 14.8
      },
      {
        "Altitude_ft": 11788,
        "Temp_c": 0.8,
        "Dewpoint_c": -9.5,
        "Wind_Direction": 231,
        "Wind_Speed_kt": 14.8
      },
      {
        "Altitude_ft": 11808,
        "Temp_c": 0.7,
        "Dewpoint_c": -9.6,
        "Wind_Direction": 231,
        "Wind_Speed_kt": 14.8
      },
      {
        "Altitude_ft": 11827,
        "Temp_c": 0.7,
        "Dewpoint_c": -9.6,
        "Wind_Direction": 230,
        "Wind_Speed_kt": 14.8
      },
      {
        "Altitude_ft": 11847,
        "Temp_c": 0.6,
        "Dewpoint_c": -9.6,
        "Wind_Direction": 229,
        "Wind_Speed_kt": 14.8
      },
      {
        "Altitude_ft": 11864,
        "Temp_c": 0.6,
        "Dewpoint_c": -9.6,
        "Wind_Direction": 229,
        "Wind_Speed_kt": 14.8
      },
      {
        "Altitude_ft": 11880,
        "Temp_c": 0.5,
        "Dewpoint_c": -9.6,
        "Wind_Direction": 228,
        "Wind_Speed_kt": 14.8
      },
      {
        "Altitude_ft": 11900,
        "Temp_c": 0.5,
        "Dewpoint_c": -9.6,
        "Wind_Direction": 228,
        "Wind_Speed_kt": 14.8
      },
      {
        "Altitude_ft": 11916,
        "Temp_c": 0.4,
        "Dewpoint_c": -9.7,
        "Wind_Direction": 227,
        "Wind_Speed_kt": 14.8
      },
      {
        "Altitude_ft": 11936,
        "Temp_c": 0.4,
        "Dewpoint_c": -9.7,
        "Wind_Direction": 226,
        "Wind_Speed_kt": 14.8
      },
      {
        "Altitude_ft": 11952,
        "Temp_c": 0.3,
        "Dewpoint_c": -9.7,
        "Wind_Direction": 226,
        "Wind_Speed_kt": 14.8
      },
      {
        "Altitude_ft": 11965,
        "Temp_c": 0.3,
        "Dewpoint_c": -9.7,
        "Wind_Direction": 225,
        "Wind_Speed_kt": 14.8
      },
      {
        "Altitude_ft": 11982,
        "Temp_c": 0.2,
        "Dewpoint_c": -9.7,
        "Wind_Direction": 224,
        "Wind_Speed_kt": 14.8
      },
      {
        "Altitude_ft": 11998,
        "Temp_c": 0.2,
        "Dewpoint_c": -9.7,
        "Wind_Direction": 224,
        "Wind_Speed_kt": 14.8
      },
      {
        "Altitude_ft": 12011,
        "Temp_c": 0.1,
        "Dewpoint_c": -9.7,
        "Wind_Direction": 223,
        "Wind_Speed_kt": 15
      },
      {
        "Altitude_ft": 12028,
        "Temp_c": 0.1,
        "Dewpoint_c": -9.7,
        "Wind_Direction": 223,
        "Wind_Speed_kt": 15
      },
      {
        "Altitude_ft": 12044,
        "Temp_c": 0,
        "Dewpoint_c": -9.7,
        "Wind_Direction": 222,
        "Wind_Speed_kt": 15
      },
      {
        "Altitude_ft": 12064,
        "Temp_c": 0,
        "Dewpoint_c": -9.7,
        "Wind_Direction": 222,
        "Wind_Speed_kt": 15
      },
      {
        "Altitude_ft": 12083,
        "Temp_c": -0.1,
        "Dewpoint_c": -9.7,
        "Wind_Direction": 222,
        "Wind_Speed_kt": 15
      },
      {
        "Altitude_ft": 12100,
        "Temp_c": -0.1,
        "Dewpoint_c": -9.8,
        "Wind_Direction": 222,
        "Wind_Speed_kt": 15
      },
      {
        "Altitude_ft": 12119,
        "Temp_c": -0.2,
        "Dewpoint_c": -9.8,
        "Wind_Direction": 222,
        "Wind_Speed_kt": 14.8
      },
      {
        "Altitude_ft": 12139,
        "Temp_c": -0.3,
        "Dewpoint_c": -9.8,
        "Wind_Direction": 223,
        "Wind_Speed_kt": 14.8
      },
      {
        "Altitude_ft": 12159,
        "Temp_c": -0.3,
        "Dewpoint_c": -9.8,
        "Wind_Direction": 223,
        "Wind_Speed_kt": 14.8
      },
      {
        "Altitude_ft": 12178,
        "Temp_c": -0.4,
        "Dewpoint_c": -9.8,
        "Wind_Direction": 223,
        "Wind_Speed_kt": 14.8
      },
      {
        "Altitude_ft": 12201,
        "Temp_c": -0.4,
        "Dewpoint_c": -9.8,
        "Wind_Direction": 223,
        "Wind_Speed_kt": 14.8
      },
      {
        "Altitude_ft": 12221,
        "Temp_c": -0.5,
        "Dewpoint_c": -9.8,
        "Wind_Direction": 223,
        "Wind_Speed_kt": 14.8
      },
      {
        "Altitude_ft": 12241,
        "Temp_c": -0.5,
        "Dewpoint_c": -9.8,
        "Wind_Direction": 223,
        "Wind_Speed_kt": 14.8
      },
      {
        "Altitude_ft": 12260,
        "Temp_c": -0.6,
        "Dewpoint_c": -9.8,
        "Wind_Direction": 223,
        "Wind_Speed_kt": 14.8
      },
      {
        "Altitude_ft": 12280,
        "Temp_c": -0.6,
        "Dewpoint_c": -9.8,
        "Wind_Direction": 223,
        "Wind_Speed_kt": 14.8
      },
      {
        "Altitude_ft": 12300,
        "Temp_c": -0.7,
        "Dewpoint_c": -9.8,
        "Wind_Direction": 224,
        "Wind_Speed_kt": 14.8
      },
      {
        "Altitude_ft": 12320,
        "Temp_c": -0.7,
        "Dewpoint_c": -9.8,
        "Wind_Direction": 224,
        "Wind_Speed_kt": 14.8
      },
      {
        "Altitude_ft": 12339,
        "Temp_c": -0.8,
        "Dewpoint_c": -9.8,
        "Wind_Direction": 224,
        "Wind_Speed_kt": 14.6
      },
      {
        "Altitude_ft": 12359,
        "Temp_c": -0.8,
        "Dewpoint_c": -9.8,
        "Wind_Direction": 224,
        "Wind_Speed_kt": 14.6
      },
      {
        "Altitude_ft": 12375,
        "Temp_c": -0.9,
        "Dewpoint_c": -9.8,
        "Wind_Direction": 224,
        "Wind_Speed_kt": 14.6
      },
      {
        "Altitude_ft": 12395,
        "Temp_c": -1,
        "Dewpoint_c": -9.8,
        "Wind_Direction": 224,
        "Wind_Speed_kt": 14.6
      },
      {
        "Altitude_ft": 12411,
        "Temp_c": -1,
        "Dewpoint_c": -9.9,
        "Wind_Direction": 224,
        "Wind_Speed_kt": 14.6
      },
      {
        "Altitude_ft": 12431,
        "Temp_c": -1.1,
        "Dewpoint_c": -9.9,
        "Wind_Direction": 224,
        "Wind_Speed_kt": 14.6
      },
      {
        "Altitude_ft": 12448,
        "Temp_c": -1.1,
        "Dewpoint_c": -9.9,
        "Wind_Direction": 224,
        "Wind_Speed_kt": 14.8
      },
      {
        "Altitude_ft": 12467,
        "Temp_c": -1.2,
        "Dewpoint_c": -9.9,
        "Wind_Direction": 223,
        "Wind_Speed_kt": 14.8
      },
      {
        "Altitude_ft": 12484,
        "Temp_c": -1.3,
        "Dewpoint_c": -9.9,
        "Wind_Direction": 222,
        "Wind_Speed_kt": 15
      },
      {
        "Altitude_ft": 12503,
        "Temp_c": -1.3,
        "Dewpoint_c": -10,
        "Wind_Direction": 221,
        "Wind_Speed_kt": 15.2
      },
      {
        "Altitude_ft": 12520,
        "Temp_c": -1.4,
        "Dewpoint_c": -10,
        "Wind_Direction": 220,
        "Wind_Speed_kt": 15.2
      },
      {
        "Altitude_ft": 12539,
        "Temp_c": -1.4,
        "Dewpoint_c": -10,
        "Wind_Direction": 219,
        "Wind_Speed_kt": 15.4
      },
      {
        "Altitude_ft": 12559,
        "Temp_c": -1.5,
        "Dewpoint_c": -10,
        "Wind_Direction": 219,
        "Wind_Speed_kt": 15.6
      },
      {
        "Altitude_ft": 12582,
        "Temp_c": -1.5,
        "Dewpoint_c": -10.1,
        "Wind_Direction": 218,
        "Wind_Speed_kt": 15.6
      },
      {
        "Altitude_ft": 12605,
        "Temp_c": -1.6,
        "Dewpoint_c": -10.1,
        "Wind_Direction": 217,
        "Wind_Speed_kt": 15.7
      },
      {
        "Altitude_ft": 12631,
        "Temp_c": -1.7,
        "Dewpoint_c": -10.1,
        "Wind_Direction": 216,
        "Wind_Speed_kt": 15.9
      },
      {
        "Altitude_ft": 12657,
        "Temp_c": -1.7,
        "Dewpoint_c": -10.1,
        "Wind_Direction": 216,
        "Wind_Speed_kt": 16.1
      },
      {
        "Altitude_ft": 12680,
        "Temp_c": -1.8,
        "Dewpoint_c": -10.1,
        "Wind_Direction": 215,
        "Wind_Speed_kt": 16.1
      },
      {
        "Altitude_ft": 12703,
        "Temp_c": -1.8,
        "Dewpoint_c": -10.1,
        "Wind_Direction": 214,
        "Wind_Speed_kt": 16.3
      },
      {
        "Altitude_ft": 12723,
        "Temp_c": -1.9,
        "Dewpoint_c": -10.1,
        "Wind_Direction": 214,
        "Wind_Speed_kt": 16.5
      },
      {
        "Altitude_ft": 12743,
        "Temp_c": -2,
        "Dewpoint_c": -10.1,
        "Wind_Direction": 213,
        "Wind_Speed_kt": 16.7
      },
      {
        "Altitude_ft": 12762,
        "Temp_c": -2,
        "Dewpoint_c": -10.1,
        "Wind_Direction": 212,
        "Wind_Speed_kt": 16.9
      },
      {
        "Altitude_ft": 12782,
        "Temp_c": -2.1,
        "Dewpoint_c": -10.1,
        "Wind_Direction": 212,
        "Wind_Speed_kt": 17.1
      },
      {
        "Altitude_ft": 12802,
        "Temp_c": -2.1,
        "Dewpoint_c": -10.2,
        "Wind_Direction": 211,
        "Wind_Speed_kt": 17.1
      },
      {
        "Altitude_ft": 12822,
        "Temp_c": -2.2,
        "Dewpoint_c": -10.2,
        "Wind_Direction": 210,
        "Wind_Speed_kt": 17.3
      },
      {
        "Altitude_ft": 12838,
        "Temp_c": -2.2,
        "Dewpoint_c": -10.2,
        "Wind_Direction": 210,
        "Wind_Speed_kt": 17.5
      },
      {
        "Altitude_ft": 12854,
        "Temp_c": -2.3,
        "Dewpoint_c": -10.2,
        "Wind_Direction": 210,
        "Wind_Speed_kt": 17.7
      },
      {
        "Altitude_ft": 12874,
        "Temp_c": -2.3,
        "Dewpoint_c": -10.2,
        "Wind_Direction": 211,
        "Wind_Speed_kt": 17.7
      },
      {
        "Altitude_ft": 12890,
        "Temp_c": -2.4,
        "Dewpoint_c": -10.2,
        "Wind_Direction": 211,
        "Wind_Speed_kt": 17.7
      },
      {
        "Altitude_ft": 12907,
        "Temp_c": -2.5,
        "Dewpoint_c": -10.2,
        "Wind_Direction": 212,
        "Wind_Speed_kt": 17.9
      },
      {
        "Altitude_ft": 12927,
        "Temp_c": -2.5,
        "Dewpoint_c": -10.2,
        "Wind_Direction": 212,
        "Wind_Speed_kt": 17.9
      },
      {
        "Altitude_ft": 12946,
        "Temp_c": -2.6,
        "Dewpoint_c": -10.2,
        "Wind_Direction": 213,
        "Wind_Speed_kt": 18.1
      },
      {
        "Altitude_ft": 12966,
        "Temp_c": -2.6,
        "Dewpoint_c": -10.3,
        "Wind_Direction": 213,
        "Wind_Speed_kt": 18.1
      },
      {
        "Altitude_ft": 12982,
        "Temp_c": -2.7,
        "Dewpoint_c": -10.3,
        "Wind_Direction": 214,
        "Wind_Speed_kt": 18.3
      },
      {
        "Altitude_ft": 13002,
        "Temp_c": -2.8,
        "Dewpoint_c": -10.3,
        "Wind_Direction": 214,
        "Wind_Speed_kt": 18.3
      },
      {
        "Altitude_ft": 13022,
        "Temp_c": -2.8,
        "Dewpoint_c": -10.4,
        "Wind_Direction": 215,
        "Wind_Speed_kt": 18.5
      },
      {
        "Altitude_ft": 13041,
        "Temp_c": -2.9,
        "Dewpoint_c": -10.4,
        "Wind_Direction": 215,
        "Wind_Speed_kt": 18.5
      },
      {
        "Altitude_ft": 13061,
        "Temp_c": -3,
        "Dewpoint_c": -10.4,
        "Wind_Direction": 216,
        "Wind_Speed_kt": 18.7
      },
      {
        "Altitude_ft": 13081,
        "Temp_c": -3,
        "Dewpoint_c": -10.4,
        "Wind_Direction": 216,
        "Wind_Speed_kt": 18.7
      },
      {
        "Altitude_ft": 13100,
        "Temp_c": -3.1,
        "Dewpoint_c": -10.5,
        "Wind_Direction": 217,
        "Wind_Speed_kt": 18.9
      },
      {
        "Altitude_ft": 13120,
        "Temp_c": -3.1,
        "Dewpoint_c": -10.5,
        "Wind_Direction": 217,
        "Wind_Speed_kt": 18.9
      },
      {
        "Altitude_ft": 13140,
        "Temp_c": -3.2,
        "Dewpoint_c": -10.5,
        "Wind_Direction": 218,
        "Wind_Speed_kt": 19
      },
      {
        "Altitude_ft": 13163,
        "Temp_c": -3.3,
        "Dewpoint_c": -10.6,
        "Wind_Direction": 218,
        "Wind_Speed_kt": 19
      },
      {
        "Altitude_ft": 13186,
        "Temp_c": -3.3,
        "Dewpoint_c": -10.6,
        "Wind_Direction": 219,
        "Wind_Speed_kt": 19.2
      },
      {
        "Altitude_ft": 13205,
        "Temp_c": -3.4,
        "Dewpoint_c": -10.6,
        "Wind_Direction": 219,
        "Wind_Speed_kt": 19.4
      },
      {
        "Altitude_ft": 13228,
        "Temp_c": -3.5,
        "Dewpoint_c": -10.6,
        "Wind_Direction": 220,
        "Wind_Speed_kt": 19.4
      },
      {
        "Altitude_ft": 13251,
        "Temp_c": -3.5,
        "Dewpoint_c": -10.6,
        "Wind_Direction": 220,
        "Wind_Speed_kt": 19.4
      },
      {
        "Altitude_ft": 13274,
        "Temp_c": -3.6,
        "Dewpoint_c": -10.7,
        "Wind_Direction": 220,
        "Wind_Speed_kt": 19.4
      },
      {
        "Altitude_ft": 13301,
        "Temp_c": -3.7,
        "Dewpoint_c": -10.7,
        "Wind_Direction": 220,
        "Wind_Speed_kt": 19.2
      },
      {
        "Altitude_ft": 13323,
        "Temp_c": -3.7,
        "Dewpoint_c": -10.7,
        "Wind_Direction": 220,
        "Wind_Speed_kt": 19.2
      },
      {
        "Altitude_ft": 13346,
        "Temp_c": -3.8,
        "Dewpoint_c": -10.7,
        "Wind_Direction": 221,
        "Wind_Speed_kt": 19.2
      },
      {
        "Altitude_ft": 13373,
        "Temp_c": -3.9,
        "Dewpoint_c": -10.8,
        "Wind_Direction": 221,
        "Wind_Speed_kt": 19
      },
      {
        "Altitude_ft": 13396,
        "Temp_c": -3.9,
        "Dewpoint_c": -10.8,
        "Wind_Direction": 221,
        "Wind_Speed_kt": 19
      },
      {
        "Altitude_ft": 13419,
        "Temp_c": -4,
        "Dewpoint_c": -10.8,
        "Wind_Direction": 221,
        "Wind_Speed_kt": 19
      },
      {
        "Altitude_ft": 13438,
        "Temp_c": -4.1,
        "Dewpoint_c": -10.8,
        "Wind_Direction": 221,
        "Wind_Speed_kt": 19
      },
      {
        "Altitude_ft": 13458,
        "Temp_c": -4.1,
        "Dewpoint_c": -10.8,
        "Wind_Direction": 222,
        "Wind_Speed_kt": 18.9
      },
      {
        "Altitude_ft": 13478,
        "Temp_c": -4.2,
        "Dewpoint_c": -10.9,
        "Wind_Direction": 222,
        "Wind_Speed_kt": 18.9
      },
      {
        "Altitude_ft": 13497,
        "Temp_c": -4.3,
        "Dewpoint_c": -10.9,
        "Wind_Direction": 222,
        "Wind_Speed_kt": 18.9
      },
      {
        "Altitude_ft": 13517,
        "Temp_c": -4.3,
        "Dewpoint_c": -10.9,
        "Wind_Direction": 222,
        "Wind_Speed_kt": 18.7
      },
      {
        "Altitude_ft": 13537,
        "Temp_c": -4.4,
        "Dewpoint_c": -10.9,
        "Wind_Direction": 222,
        "Wind_Speed_kt": 18.7
      },
      {
        "Altitude_ft": 13556,
        "Temp_c": -4.4,
        "Dewpoint_c": -10.9,
        "Wind_Direction": 223,
        "Wind_Speed_kt": 18.7
      },
      {
        "Altitude_ft": 13579,
        "Temp_c": -4.5,
        "Dewpoint_c": -10.9,
        "Wind_Direction": 223,
        "Wind_Speed_kt": 18.7
      },
      {
        "Altitude_ft": 13599,
        "Temp_c": -4.5,
        "Dewpoint_c": -10.9,
        "Wind_Direction": 223,
        "Wind_Speed_kt": 18.5
      },
      {
        "Altitude_ft": 13619,
        "Temp_c": -4.6,
        "Dewpoint_c": -10.9,
        "Wind_Direction": 223,
        "Wind_Speed_kt": 18.5
      },
      {
        "Altitude_ft": 13638,
        "Temp_c": -4.6,
        "Dewpoint_c": -10.9,
        "Wind_Direction": 223,
        "Wind_Speed_kt": 18.5
      },
      {
        "Altitude_ft": 13658,
        "Temp_c": -4.7,
        "Dewpoint_c": -10.9,
        "Wind_Direction": 224,
        "Wind_Speed_kt": 18.5
      },
      {
        "Altitude_ft": 13678,
        "Temp_c": -4.8,
        "Dewpoint_c": -10.9,
        "Wind_Direction": 224,
        "Wind_Speed_kt": 18.5
      },
      {
        "Altitude_ft": 13698,
        "Temp_c": -4.8,
        "Dewpoint_c": -10.9,
        "Wind_Direction": 224,
        "Wind_Speed_kt": 18.7
      },
      {
        "Altitude_ft": 13717,
        "Temp_c": -4.9,
        "Dewpoint_c": -10.9,
        "Wind_Direction": 224,
        "Wind_Speed_kt": 18.9
      },
      {
        "Altitude_ft": 13737,
        "Temp_c": -4.9,
        "Dewpoint_c": -10.9,
        "Wind_Direction": 224,
        "Wind_Speed_kt": 19
      },
      {
        "Altitude_ft": 13757,
        "Temp_c": -5,
        "Dewpoint_c": -10.9,
        "Wind_Direction": 224,
        "Wind_Speed_kt": 19
      },
      {
        "Altitude_ft": 13780,
        "Temp_c": -5,
        "Dewpoint_c": -10.9,
        "Wind_Direction": 224,
        "Wind_Speed_kt": 19.4
      },
      {
        "Altitude_ft": 13789,
        "Temp_c": -5.1,
        "Dewpoint_c": -10.9,
        "Wind_Direction": 224,
        "Wind_Speed_kt": 19.4
      },
      {
        "Altitude_ft": 13806,
        "Temp_c": -5.1,
        "Dewpoint_c": -10.9,
        "Wind_Direction": 224,
        "Wind_Speed_kt": 19.6
      },
      {
        "Altitude_ft": 13822,
        "Temp_c": -5.2,
        "Dewpoint_c": -10.9,
        "Wind_Direction": 224,
        "Wind_Speed_kt": 19.6
      },
      {
        "Altitude_ft": 13839,
        "Temp_c": -5.2,
        "Dewpoint_c": -10.9,
        "Wind_Direction": 224,
        "Wind_Speed_kt": 19.8
      },
      {
        "Altitude_ft": 13855,
        "Temp_c": -5.2,
        "Dewpoint_c": -10.9,
        "Wind_Direction": 224,
        "Wind_Speed_kt": 20
      },
      {
        "Altitude_ft": 13871,
        "Temp_c": -5.3,
        "Dewpoint_c": -10.9,
        "Wind_Direction": 224,
        "Wind_Speed_kt": 20.2
      },
      {
        "Altitude_ft": 13888,
        "Temp_c": -5.3,
        "Dewpoint_c": -10.9,
        "Wind_Direction": 224,
        "Wind_Speed_kt": 20.4
      },
      {
        "Altitude_ft": 13904,
        "Temp_c": -5.4,
        "Dewpoint_c": -10.9,
        "Wind_Direction": 224,
        "Wind_Speed_kt": 20.4
      },
      {
        "Altitude_ft": 13921,
        "Temp_c": -5.4,
        "Dewpoint_c": -10.9,
        "Wind_Direction": 224,
        "Wind_Speed_kt": 20.6
      },
      {
        "Altitude_ft": 13934,
        "Temp_c": -5.5,
        "Dewpoint_c": -10.9,
        "Wind_Direction": 224,
        "Wind_Speed_kt": 20.8
      },
      {
        "Altitude_ft": 13950,
        "Temp_c": -5.5,
        "Dewpoint_c": -10.9,
        "Wind_Direction": 224,
        "Wind_Speed_kt": 21
      },
      {
        "Altitude_ft": 13963,
        "Temp_c": -5.6,
        "Dewpoint_c": -10.9,
        "Wind_Direction": 225,
        "Wind_Speed_kt": 21
      },
      {
        "Altitude_ft": 13980,
        "Temp_c": -5.6,
        "Dewpoint_c": -10.9,
        "Wind_Direction": 225,
        "Wind_Speed_kt": 21.2
      },
      {
        "Altitude_ft": 13996,
        "Temp_c": -5.7,
        "Dewpoint_c": -10.9,
        "Wind_Direction": 225,
        "Wind_Speed_kt": 21.4
      },
      {
        "Altitude_ft": 14009,
        "Temp_c": -5.7,
        "Dewpoint_c": -10.9,
        "Wind_Direction": 225,
        "Wind_Speed_kt": 21.4
      },
      {
        "Altitude_ft": 14026,
        "Temp_c": -5.8,
        "Dewpoint_c": -10.9,
        "Wind_Direction": 225,
        "Wind_Speed_kt": 21.4
      },
      {
        "Altitude_ft": 14042,
        "Temp_c": -5.8,
        "Dewpoint_c": -10.9,
        "Wind_Direction": 224,
        "Wind_Speed_kt": 21.4
      },
      {
        "Altitude_ft": 14055,
        "Temp_c": -5.8,
        "Dewpoint_c": -10.9,
        "Wind_Direction": 224,
        "Wind_Speed_kt": 21.6
      },
      {
        "Altitude_ft": 14072,
        "Temp_c": -5.9,
        "Dewpoint_c": -10.9,
        "Wind_Direction": 224,
        "Wind_Speed_kt": 21.6
      },
      {
        "Altitude_ft": 14088,
        "Temp_c": -5.9,
        "Dewpoint_c": -11,
        "Wind_Direction": 224,
        "Wind_Speed_kt": 21.6
      },
      {
        "Altitude_ft": 14104,
        "Temp_c": -6,
        "Dewpoint_c": -11,
        "Wind_Direction": 224,
        "Wind_Speed_kt": 21.6
      },
      {
        "Altitude_ft": 14117,
        "Temp_c": -6,
        "Dewpoint_c": -11,
        "Wind_Direction": 224,
        "Wind_Speed_kt": 21.6
      },
      {
        "Altitude_ft": 14134,
        "Temp_c": -6.1,
        "Dewpoint_c": -11,
        "Wind_Direction": 224,
        "Wind_Speed_kt": 21.6
      },
      {
        "Altitude_ft": 14147,
        "Temp_c": -6.1,
        "Dewpoint_c": -11,
        "Wind_Direction": 224,
        "Wind_Speed_kt": 21.8
      },
      {
        "Altitude_ft": 14163,
        "Temp_c": -6.1,
        "Dewpoint_c": -11,
        "Wind_Direction": 224,
        "Wind_Speed_kt": 21.8
      },
      {
        "Altitude_ft": 14177,
        "Temp_c": -6.2,
        "Dewpoint_c": -11,
        "Wind_Direction": 224,
        "Wind_Speed_kt": 21.8
      },
      {
        "Altitude_ft": 14193,
        "Temp_c": -6.2,
        "Dewpoint_c": -11,
        "Wind_Direction": 224,
        "Wind_Speed_kt": 21.8
      },
      {
        "Altitude_ft": 14209,
        "Temp_c": -6.3,
        "Dewpoint_c": -11,
        "Wind_Direction": 224,
        "Wind_Speed_kt": 21.8
      },
      {
        "Altitude_ft": 14226,
        "Temp_c": -6.3,
        "Dewpoint_c": -11.1,
        "Wind_Direction": 224,
        "Wind_Speed_kt": 21.8
      },
      {
        "Altitude_ft": 14242,
        "Temp_c": -6.3,
        "Dewpoint_c": -11.1,
        "Wind_Direction": 224,
        "Wind_Speed_kt": 21.8
      },
      {
        "Altitude_ft": 14259,
        "Temp_c": -6.4,
        "Dewpoint_c": -11.1,
        "Wind_Direction": 224,
        "Wind_Speed_kt": 22
      },
      {
        "Altitude_ft": 14278,
        "Temp_c": -6.4,
        "Dewpoint_c": -11.1,
        "Wind_Direction": 224,
        "Wind_Speed_kt": 22
      },
      {
        "Altitude_ft": 14295,
        "Temp_c": -6.5,
        "Dewpoint_c": -11.1,
        "Wind_Direction": 224,
        "Wind_Speed_kt": 22
      },
      {
        "Altitude_ft": 14308,
        "Temp_c": -6.5,
        "Dewpoint_c": -11.1,
        "Wind_Direction": 224,
        "Wind_Speed_kt": 22
      },
      {
        "Altitude_ft": 14324,
        "Temp_c": -6.5,
        "Dewpoint_c": -11.1,
        "Wind_Direction": 224,
        "Wind_Speed_kt": 22
      },
      {
        "Altitude_ft": 14341,
        "Temp_c": -6.6,
        "Dewpoint_c": -11.1,
        "Wind_Direction": 223,
        "Wind_Speed_kt": 22
      },
      {
        "Altitude_ft": 14354,
        "Temp_c": -6.6,
        "Dewpoint_c": -11.1,
        "Wind_Direction": 223,
        "Wind_Speed_kt": 21.8
      },
      {
        "Altitude_ft": 14370,
        "Temp_c": -6.6,
        "Dewpoint_c": -11.1,
        "Wind_Direction": 223,
        "Wind_Speed_kt": 21.8
      },
      {
        "Altitude_ft": 14380,
        "Temp_c": -6.7,
        "Dewpoint_c": -11.1,
        "Wind_Direction": 223,
        "Wind_Speed_kt": 21.8
      },
      {
        "Altitude_ft": 14393,
        "Temp_c": -6.7,
        "Dewpoint_c": -11.2,
        "Wind_Direction": 223,
        "Wind_Speed_kt": 21.6
      },
      {
        "Altitude_ft": 14403,
        "Temp_c": -6.8,
        "Dewpoint_c": -11.2,
        "Wind_Direction": 223,
        "Wind_Speed_kt": 21.6
      },
      {
        "Altitude_ft": 14416,
        "Temp_c": -6.8,
        "Dewpoint_c": -11.2,
        "Wind_Direction": 222,
        "Wind_Speed_kt": 21.6
      },
      {
        "Altitude_ft": 14426,
        "Temp_c": -6.9,
        "Dewpoint_c": -11.2,
        "Wind_Direction": 222,
        "Wind_Speed_kt": 21.6
      },
      {
        "Altitude_ft": 14439,
        "Temp_c": -6.9,
        "Dewpoint_c": -11.2,
        "Wind_Direction": 222,
        "Wind_Speed_kt": 21.4
      },
      {
        "Altitude_ft": 14452,
        "Temp_c": -6.9,
        "Dewpoint_c": -11.2,
        "Wind_Direction": 222,
        "Wind_Speed_kt": 21.4
      },
      {
        "Altitude_ft": 14465,
        "Temp_c": -7,
        "Dewpoint_c": -11.2,
        "Wind_Direction": 222,
        "Wind_Speed_kt": 21.4
      },
      {
        "Altitude_ft": 14482,
        "Temp_c": -7,
        "Dewpoint_c": -11.2,
        "Wind_Direction": 221,
        "Wind_Speed_kt": 21.4
      },
      {
        "Altitude_ft": 14495,
        "Temp_c": -7.1,
        "Dewpoint_c": -11.3,
        "Wind_Direction": 221,
        "Wind_Speed_kt": 21.2
      },
      {
        "Altitude_ft": 14508,
        "Temp_c": -7.1,
        "Dewpoint_c": -11.3,
        "Wind_Direction": 221,
        "Wind_Speed_kt": 21.2
      },
      {
        "Altitude_ft": 14521,
        "Temp_c": -7.1,
        "Dewpoint_c": -11.3,
        "Wind_Direction": 221,
        "Wind_Speed_kt": 21.2
      },
      {
        "Altitude_ft": 14534,
        "Temp_c": -7.2,
        "Dewpoint_c": -11.3,
        "Wind_Direction": 221,
        "Wind_Speed_kt": 21
      },
      {
        "Altitude_ft": 14551,
        "Temp_c": -7.2,
        "Dewpoint_c": -11.3,
        "Wind_Direction": 221,
        "Wind_Speed_kt": 21
      },
      {
        "Altitude_ft": 14564,
        "Temp_c": -7.3,
        "Dewpoint_c": -11.3,
        "Wind_Direction": 220,
        "Wind_Speed_kt": 21
      },
      {
        "Altitude_ft": 14577,
        "Temp_c": -7.3,
        "Dewpoint_c": -11.3,
        "Wind_Direction": 220,
        "Wind_Speed_kt": 21
      },
      {
        "Altitude_ft": 14593,
        "Temp_c": -7.4,
        "Dewpoint_c": -11.4,
        "Wind_Direction": 221,
        "Wind_Speed_kt": 21.2
      },
      {
        "Altitude_ft": 14610,
        "Temp_c": -7.4,
        "Dewpoint_c": -11.4,
        "Wind_Direction": 221,
        "Wind_Speed_kt": 21.2
      },
      {
        "Altitude_ft": 14623,
        "Temp_c": -7.4,
        "Dewpoint_c": -11.4,
        "Wind_Direction": 222,
        "Wind_Speed_kt": 21.4
      },
      {
        "Altitude_ft": 14639,
        "Temp_c": -7.5,
        "Dewpoint_c": -11.4,
        "Wind_Direction": 222,
        "Wind_Speed_kt": 21.6
      },
      {
        "Altitude_ft": 14656,
        "Temp_c": -7.5,
        "Dewpoint_c": -11.4,
        "Wind_Direction": 223,
        "Wind_Speed_kt": 21.8
      },
      {
        "Altitude_ft": 14672,
        "Temp_c": -7.6,
        "Dewpoint_c": -11.4,
        "Wind_Direction": 223,
        "Wind_Speed_kt": 22
      },
      {
        "Altitude_ft": 14685,
        "Temp_c": -7.6,
        "Dewpoint_c": -11.5,
        "Wind_Direction": 224,
        "Wind_Speed_kt": 22.2
      },
      {
        "Altitude_ft": 14701,
        "Temp_c": -7.7,
        "Dewpoint_c": -11.5,
        "Wind_Direction": 224,
        "Wind_Speed_kt": 22.2
      },
      {
        "Altitude_ft": 14715,
        "Temp_c": -7.7,
        "Dewpoint_c": -11.5,
        "Wind_Direction": 225,
        "Wind_Speed_kt": 22.4
      },
      {
        "Altitude_ft": 14731,
        "Temp_c": -7.8,
        "Dewpoint_c": -11.5,
        "Wind_Direction": 225,
        "Wind_Speed_kt": 22.5
      },
      {
        "Altitude_ft": 14744,
        "Temp_c": -7.8,
        "Dewpoint_c": -11.5,
        "Wind_Direction": 226,
        "Wind_Speed_kt": 22.7
      },
      {
        "Altitude_ft": 14757,
        "Temp_c": -7.8,
        "Dewpoint_c": -11.6,
        "Wind_Direction": 226,
        "Wind_Speed_kt": 22.9
      },
      {
        "Altitude_ft": 14770,
        "Temp_c": -7.9,
        "Dewpoint_c": -11.6,
        "Wind_Direction": 227,
        "Wind_Speed_kt": 23.1
      },
      {
        "Altitude_ft": 14783,
        "Temp_c": -7.9,
        "Dewpoint_c": -11.6,
        "Wind_Direction": 227,
        "Wind_Speed_kt": 23.3
      },
      {
        "Altitude_ft": 14797,
        "Temp_c": -8,
        "Dewpoint_c": -11.6,
        "Wind_Direction": 228,
        "Wind_Speed_kt": 23.5
      },
      {
        "Altitude_ft": 14806,
        "Temp_c": -8,
        "Dewpoint_c": -11.6,
        "Wind_Direction": 228,
        "Wind_Speed_kt": 23.7
      },
      {
        "Altitude_ft": 14820,
        "Temp_c": -8,
        "Dewpoint_c": -11.6,
        "Wind_Direction": 228,
        "Wind_Speed_kt": 23.9
      },
      {
        "Altitude_ft": 14833,
        "Temp_c": -8.1,
        "Dewpoint_c": -11.6,
        "Wind_Direction": 229,
        "Wind_Speed_kt": 24.1
      },
      {
        "Altitude_ft": 14846,
        "Temp_c": -8.1,
        "Dewpoint_c": -11.6,
        "Wind_Direction": 229,
        "Wind_Speed_kt": 24.3
      },
      {
        "Altitude_ft": 14862,
        "Temp_c": -8.1,
        "Dewpoint_c": -11.6,
        "Wind_Direction": 230,
        "Wind_Speed_kt": 24.5
      },
      {
        "Altitude_ft": 14875,
        "Temp_c": -8.2,
        "Dewpoint_c": -11.6,
        "Wind_Direction": 229,
        "Wind_Speed_kt": 24.3
      },
      {
        "Altitude_ft": 14888,
        "Temp_c": -8.2,
        "Dewpoint_c": -11.6,
        "Wind_Direction": 229,
        "Wind_Speed_kt": 24.3
      },
      {
        "Altitude_ft": 14902,
        "Temp_c": -8.3,
        "Dewpoint_c": -11.6,
        "Wind_Direction": 229,
        "Wind_Speed_kt": 24.3
      },
      {
        "Altitude_ft": 14918,
        "Temp_c": -8.3,
        "Dewpoint_c": -11.6,
        "Wind_Direction": 228,
        "Wind_Speed_kt": 24.1
      },
      {
        "Altitude_ft": 14934,
        "Temp_c": -8.3,
        "Dewpoint_c": -11.6,
        "Wind_Direction": 228,
        "Wind_Speed_kt": 24.1
      },
      {
        "Altitude_ft": 14948,
        "Temp_c": -8.4,
        "Dewpoint_c": -11.6,
        "Wind_Direction": 228,
        "Wind_Speed_kt": 24.1
      },
      {
        "Altitude_ft": 14964,
        "Temp_c": -8.4,
        "Dewpoint_c": -11.7,
        "Wind_Direction": 227,
        "Wind_Speed_kt": 23.9
      },
      {
        "Altitude_ft": 14980,
        "Temp_c": -8.5,
        "Dewpoint_c": -11.7,
        "Wind_Direction": 227,
        "Wind_Speed_kt": 23.9
      },
      {
        "Altitude_ft": 14997,
        "Temp_c": -8.5,
        "Dewpoint_c": -11.7,
        "Wind_Direction": 227,
        "Wind_Speed_kt": 23.9
      },
      {
        "Altitude_ft": 15013,
        "Temp_c": -8.6,
        "Dewpoint_c": -11.7,
        "Wind_Direction": 226,
        "Wind_Speed_kt": 23.7
      },
      {
        "Altitude_ft": 15030,
        "Temp_c": -8.6,
        "Dewpoint_c": -11.8,
        "Wind_Direction": 226,
        "Wind_Speed_kt": 23.7
      },
      {
        "Altitude_ft": 15046,
        "Temp_c": -8.7,
        "Dewpoint_c": -11.8,
        "Wind_Direction": 226,
        "Wind_Speed_kt": 23.7
      },
      {
        "Altitude_ft": 15062,
        "Temp_c": -8.7,
        "Dewpoint_c": -11.8,
        "Wind_Direction": 225,
        "Wind_Speed_kt": 23.7
      },
      {
        "Altitude_ft": 15079,
        "Temp_c": -8.8,
        "Dewpoint_c": -11.8,
        "Wind_Direction": 225,
        "Wind_Speed_kt": 23.5
      },
      {
        "Altitude_ft": 15095,
        "Temp_c": -8.8,
        "Dewpoint_c": -11.9,
        "Wind_Direction": 225,
        "Wind_Speed_kt": 23.5
      },
      {
        "Altitude_ft": 15112,
        "Temp_c": -8.8,
        "Dewpoint_c": -11.9,
        "Wind_Direction": 224,
        "Wind_Speed_kt": 23.5
      },
      {
        "Altitude_ft": 15128,
        "Temp_c": -8.9,
        "Dewpoint_c": -11.9,
        "Wind_Direction": 224,
        "Wind_Speed_kt": 23.5
      },
      {
        "Altitude_ft": 15144,
        "Temp_c": -8.9,
        "Dewpoint_c": -11.9,
        "Wind_Direction": 224,
        "Wind_Speed_kt": 23.3
      },
      {
        "Altitude_ft": 15161,
        "Temp_c": -9,
        "Dewpoint_c": -12,
        "Wind_Direction": 223,
        "Wind_Speed_kt": 23.3
      },
      {
        "Altitude_ft": 15174,
        "Temp_c": -9,
        "Dewpoint_c": -12,
        "Wind_Direction": 223,
        "Wind_Speed_kt": 23.3
      },
      {
        "Altitude_ft": 15187,
        "Temp_c": -9,
        "Dewpoint_c": -12,
        "Wind_Direction": 223,
        "Wind_Speed_kt": 23.1
      },
      {
        "Altitude_ft": 15200,
        "Temp_c": -9.1,
        "Dewpoint_c": -12,
        "Wind_Direction": 223,
        "Wind_Speed_kt": 23.1
      },
      {
        "Altitude_ft": 15210,
        "Temp_c": -9.1,
        "Dewpoint_c": -12,
        "Wind_Direction": 223,
        "Wind_Speed_kt": 23.1
      },
      {
        "Altitude_ft": 15223,
        "Temp_c": -9.2,
        "Dewpoint_c": -12.1,
        "Wind_Direction": 223,
        "Wind_Speed_kt": 22.9
      },
      {
        "Altitude_ft": 15233,
        "Temp_c": -9.2,
        "Dewpoint_c": -12.1,
        "Wind_Direction": 224,
        "Wind_Speed_kt": 22.9
      },
      {
        "Altitude_ft": 15249,
        "Temp_c": -9.2,
        "Dewpoint_c": -12.1,
        "Wind_Direction": 224,
        "Wind_Speed_kt": 22.9
      },
      {
        "Altitude_ft": 15262,
        "Temp_c": -9.3,
        "Dewpoint_c": -12.1,
        "Wind_Direction": 224,
        "Wind_Speed_kt": 22.7
      },
      {
        "Altitude_ft": 15279,
        "Temp_c": -9.3,
        "Dewpoint_c": -12.1,
        "Wind_Direction": 224,
        "Wind_Speed_kt": 22.7
      },
      {
        "Altitude_ft": 15292,
        "Temp_c": -9.4,
        "Dewpoint_c": -12.2,
        "Wind_Direction": 224,
        "Wind_Speed_kt": 22.7
      },
      {
        "Altitude_ft": 15305,
        "Temp_c": -9.4,
        "Dewpoint_c": -12.2,
        "Wind_Direction": 224,
        "Wind_Speed_kt": 22.5
      },
      {
        "Altitude_ft": 15322,
        "Temp_c": -9.4,
        "Dewpoint_c": -12.2,
        "Wind_Direction": 224,
        "Wind_Speed_kt": 22.5
      },
      {
        "Altitude_ft": 15338,
        "Temp_c": -9.5,
        "Dewpoint_c": -12.2,
        "Wind_Direction": 224,
        "Wind_Speed_kt": 22.5
      },
      {
        "Altitude_ft": 15351,
        "Temp_c": -9.5,
        "Dewpoint_c": -12.3,
        "Wind_Direction": 224,
        "Wind_Speed_kt": 22.4
      },
      {
        "Altitude_ft": 15367,
        "Temp_c": -9.6,
        "Dewpoint_c": -12.3,
        "Wind_Direction": 225,
        "Wind_Speed_kt": 22.4
      },
      {
        "Altitude_ft": 15384,
        "Temp_c": -9.6,
        "Dewpoint_c": -12.4,
        "Wind_Direction": 225,
        "Wind_Speed_kt": 22.4
      },
      {
        "Altitude_ft": 15400,
        "Temp_c": -9.6,
        "Dewpoint_c": -12.4,
        "Wind_Direction": 225,
        "Wind_Speed_kt": 22.2
      },
      {
        "Altitude_ft": 15417,
        "Temp_c": -9.7,
        "Dewpoint_c": -12.5,
        "Wind_Direction": 225,
        "Wind_Speed_kt": 22.2
      },
      {
        "Altitude_ft": 15433,
        "Temp_c": -9.7,
        "Dewpoint_c": -12.6,
        "Wind_Direction": 225,
        "Wind_Speed_kt": 22.2
      },
      {
        "Altitude_ft": 15449,
        "Temp_c": -9.8,
        "Dewpoint_c": -12.6,
        "Wind_Direction": 225,
        "Wind_Speed_kt": 22
      },
      {
        "Altitude_ft": 15466,
        "Temp_c": -9.8,
        "Dewpoint_c": -12.7,
        "Wind_Direction": 225,
        "Wind_Speed_kt": 22
      },
      {
        "Altitude_ft": 15482,
        "Temp_c": -9.8,
        "Dewpoint_c": -12.7,
        "Wind_Direction": 225,
        "Wind_Speed_kt": 22
      },
      {
        "Altitude_ft": 15499,
        "Temp_c": -9.9,
        "Dewpoint_c": -12.8,
        "Wind_Direction": 226,
        "Wind_Speed_kt": 22
      },
      {
        "Altitude_ft": 15518,
        "Temp_c": -9.9,
        "Dewpoint_c": -12.9,
        "Wind_Direction": 226,
        "Wind_Speed_kt": 22
      },
      {
        "Altitude_ft": 15535,
        "Temp_c": -9.9,
        "Dewpoint_c": -12.9,
        "Wind_Direction": 226,
        "Wind_Speed_kt": 22.2
      },
      {
        "Altitude_ft": 15554,
        "Temp_c": -10,
        "Dewpoint_c": -13,
        "Wind_Direction": 227,
        "Wind_Speed_kt": 22.2
      },
      {
        "Altitude_ft": 15561,
        "Temp_c": -10,
        "Dewpoint_c": -12.7,
        "Wind_Direction": 227,
        "Wind_Speed_kt": 22.2
      },
      {
        "Altitude_ft": 15587,
        "Temp_c": -10,
        "Dewpoint_c": -12.8,
        "Wind_Direction": 227,
        "Wind_Speed_kt": 22.2
      },
      {
        "Altitude_ft": 15604,
        "Temp_c": -10.1,
        "Dewpoint_c": -12.8,
        "Wind_Direction": 227,
        "Wind_Speed_kt": 22.2
      },
      {
        "Altitude_ft": 15620,
        "Temp_c": -10.1,
        "Dewpoint_c": -12.8,
        "Wind_Direction": 228,
        "Wind_Speed_kt": 22.2
      },
      {
        "Altitude_ft": 15633,
        "Temp_c": -10.1,
        "Dewpoint_c": -12.8,
        "Wind_Direction": 228,
        "Wind_Speed_kt": 22.2
      },
      {
        "Altitude_ft": 15646,
        "Temp_c": -10.2,
        "Dewpoint_c": -12.9,
        "Wind_Direction": 228,
        "Wind_Speed_kt": 22.4
      },
      {
        "Altitude_ft": 15659,
        "Temp_c": -10.2,
        "Dewpoint_c": -12.9,
        "Wind_Direction": 228,
        "Wind_Speed_kt": 22.4
      },
      {
        "Altitude_ft": 15676,
        "Temp_c": -10.2,
        "Dewpoint_c": -12.9,
        "Wind_Direction": 229,
        "Wind_Speed_kt": 22.4
      },
      {
        "Altitude_ft": 15689,
        "Temp_c": -10.3,
        "Dewpoint_c": -13,
        "Wind_Direction": 229,
        "Wind_Speed_kt": 22.4
      },
      {
        "Altitude_ft": 15705,
        "Temp_c": -10.3,
        "Dewpoint_c": -13,
        "Wind_Direction": 229,
        "Wind_Speed_kt": 22.4
      },
      {
        "Altitude_ft": 15719,
        "Temp_c": -10.3,
        "Dewpoint_c": -13,
        "Wind_Direction": 230,
        "Wind_Speed_kt": 22.4
      },
      {
        "Altitude_ft": 15735,
        "Temp_c": -10.4,
        "Dewpoint_c": -13.1,
        "Wind_Direction": 230,
        "Wind_Speed_kt": 22.4
      },
      {
        "Altitude_ft": 15748,
        "Temp_c": -10.4,
        "Dewpoint_c": -13.1,
        "Wind_Direction": 230,
        "Wind_Speed_kt": 22.5
      },
      {
        "Altitude_ft": 15764,
        "Temp_c": -10.4,
        "Dewpoint_c": -13.1,
        "Wind_Direction": 230,
        "Wind_Speed_kt": 22.5
      },
      {
        "Altitude_ft": 15778,
        "Temp_c": -10.5,
        "Dewpoint_c": -13.2,
        "Wind_Direction": 231,
        "Wind_Speed_kt": 22.5
      },
      {
        "Altitude_ft": 15791,
        "Temp_c": -10.5,
        "Dewpoint_c": -13.2,
        "Wind_Direction": 230,
        "Wind_Speed_kt": 22.7
      },
      {
        "Altitude_ft": 15804,
        "Temp_c": -10.6,
        "Dewpoint_c": -13.2,
        "Wind_Direction": 230,
        "Wind_Speed_kt": 22.9
      },
      {
        "Altitude_ft": 15817,
        "Temp_c": -10.6,
        "Dewpoint_c": -13.3,
        "Wind_Direction": 230,
        "Wind_Speed_kt": 23.3
      },
      {
        "Altitude_ft": 15830,
        "Temp_c": -10.6,
        "Dewpoint_c": -13.3,
        "Wind_Direction": 229,
        "Wind_Speed_kt": 23.5
      },
      {
        "Altitude_ft": 15843,
        "Temp_c": -10.7,
        "Dewpoint_c": -13.4,
        "Wind_Direction": 229,
        "Wind_Speed_kt": 23.7
      },
      {
        "Altitude_ft": 15856,
        "Temp_c": -10.7,
        "Dewpoint_c": -13.4,
        "Wind_Direction": 229,
        "Wind_Speed_kt": 23.9
      },
      {
        "Altitude_ft": 15869,
        "Temp_c": -10.7,
        "Dewpoint_c": -13.4,
        "Wind_Direction": 228,
        "Wind_Speed_kt": 24.3
      },
      {
        "Altitude_ft": 15886,
        "Temp_c": -10.8,
        "Dewpoint_c": -13.5,
        "Wind_Direction": 228,
        "Wind_Speed_kt": 24.5
      },
      {
        "Altitude_ft": 15899,
        "Temp_c": -10.8,
        "Dewpoint_c": -13.5,
        "Wind_Direction": 228,
        "Wind_Speed_kt": 24.7
      },
      {
        "Altitude_ft": 15912,
        "Temp_c": -10.8,
        "Dewpoint_c": -13.6,
        "Wind_Direction": 227,
        "Wind_Speed_kt": 25.1
      },
      {
        "Altitude_ft": 15925,
        "Temp_c": -10.9,
        "Dewpoint_c": -13.6,
        "Wind_Direction": 227,
        "Wind_Speed_kt": 25.3
      },
      {
        "Altitude_ft": 15938,
        "Temp_c": -10.9,
        "Dewpoint_c": -13.7,
        "Wind_Direction": 227,
        "Wind_Speed_kt": 25.5
      },
      {
        "Altitude_ft": 15955,
        "Temp_c": -10.9,
        "Dewpoint_c": -13.7,
        "Wind_Direction": 227,
        "Wind_Speed_kt": 25.7
      },
      {
        "Altitude_ft": 15968,
        "Temp_c": -10.9,
        "Dewpoint_c": -13.8,
        "Wind_Direction": 226,
        "Wind_Speed_kt": 26
      },
      {
        "Altitude_ft": 15981,
        "Temp_c": -11,
        "Dewpoint_c": -13.9,
        "Wind_Direction": 226,
        "Wind_Speed_kt": 26.2
      },
      {
        "Altitude_ft": 15997,
        "Temp_c": -11,
        "Dewpoint_c": -14,
        "Wind_Direction": 226,
        "Wind_Speed_kt": 26.4
      },
      {
        "Altitude_ft": 16010,
        "Temp_c": -11,
        "Dewpoint_c": -14.1,
        "Wind_Direction": 226,
        "Wind_Speed_kt": 26.8
      },
      {
        "Altitude_ft": 16024,
        "Temp_c": -11,
        "Dewpoint_c": -14.2,
        "Wind_Direction": 225,
        "Wind_Speed_kt": 27
      },
      {
        "Altitude_ft": 16040,
        "Temp_c": -11,
        "Dewpoint_c": -14.3,
        "Wind_Direction": 225,
        "Wind_Speed_kt": 27.2
      },
      {
        "Altitude_ft": 16053,
        "Temp_c": -11,
        "Dewpoint_c": -14.4,
        "Wind_Direction": 225,
        "Wind_Speed_kt": 27.6
      },
      {
        "Altitude_ft": 16066,
        "Temp_c": -11,
        "Dewpoint_c": -14.5,
        "Wind_Direction": 225,
        "Wind_Speed_kt": 27.4
      },
      {
        "Altitude_ft": 16079,
        "Temp_c": -11,
        "Dewpoint_c": -14.6,
        "Wind_Direction": 225,
        "Wind_Speed_kt": 27.4
      },
      {
        "Altitude_ft": 16096,
        "Temp_c": -11.1,
        "Dewpoint_c": -14.7,
        "Wind_Direction": 225,
        "Wind_Speed_kt": 27.4
      },
      {
        "Altitude_ft": 16109,
        "Temp_c": -11.1,
        "Dewpoint_c": -14.8,
        "Wind_Direction": 224,
        "Wind_Speed_kt": 27.4
      },
      {
        "Altitude_ft": 16125,
        "Temp_c": -11.1,
        "Dewpoint_c": -14.9,
        "Wind_Direction": 224,
        "Wind_Speed_kt": 27.4
      },
      {
        "Altitude_ft": 16132,
        "Temp_c": -11.1,
        "Dewpoint_c": -14.9,
        "Wind_Direction": 224,
        "Wind_Speed_kt": 27.4
      },
      {
        "Altitude_ft": 16155,
        "Temp_c": -11.1,
        "Dewpoint_c": -15.1,
        "Wind_Direction": 224,
        "Wind_Speed_kt": 27.4
      },
      {
        "Altitude_ft": 16171,
        "Temp_c": -11.1,
        "Dewpoint_c": -15.3,
        "Wind_Direction": 224,
        "Wind_Speed_kt": 27.4
      },
      {
        "Altitude_ft": 16188,
        "Temp_c": -11.1,
        "Dewpoint_c": -15.5,
        "Wind_Direction": 224,
        "Wind_Speed_kt": 27.4
      },
      {
        "Altitude_ft": 16204,
        "Temp_c": -11,
        "Dewpoint_c": -15.6,
        "Wind_Direction": 224,
        "Wind_Speed_kt": 27.4
      },
      {
        "Altitude_ft": 16220,
        "Temp_c": -11,
        "Dewpoint_c": -15.8,
        "Wind_Direction": 224,
        "Wind_Speed_kt": 27.4
      },
      {
        "Altitude_ft": 16237,
        "Temp_c": -11,
        "Dewpoint_c": -16,
        "Wind_Direction": 224,
        "Wind_Speed_kt": 27.2
      },
      {
        "Altitude_ft": 16250,
        "Temp_c": -11,
        "Dewpoint_c": -16.2,
        "Wind_Direction": 223,
        "Wind_Speed_kt": 27.2
      },
      {
        "Altitude_ft": 16263,
        "Temp_c": -11,
        "Dewpoint_c": -16.3,
        "Wind_Direction": 223,
        "Wind_Speed_kt": 27.2
      },
      {
        "Altitude_ft": 16276,
        "Temp_c": -11,
        "Dewpoint_c": -16.5,
        "Wind_Direction": 223,
        "Wind_Speed_kt": 27.2
      },
      {
        "Altitude_ft": 16289,
        "Temp_c": -11,
        "Dewpoint_c": -16.7,
        "Wind_Direction": 223,
        "Wind_Speed_kt": 27.2
      },
      {
        "Altitude_ft": 16299,
        "Temp_c": -11,
        "Dewpoint_c": -16.9,
        "Wind_Direction": 223,
        "Wind_Speed_kt": 27.2
      },
      {
        "Altitude_ft": 16312,
        "Temp_c": -11,
        "Dewpoint_c": -17.1,
        "Wind_Direction": 223,
        "Wind_Speed_kt": 27.2
      },
      {
        "Altitude_ft": 16329,
        "Temp_c": -10.9,
        "Dewpoint_c": -17.3,
        "Wind_Direction": 223,
        "Wind_Speed_kt": 27.2
      },
      {
        "Altitude_ft": 16342,
        "Temp_c": -10.9,
        "Dewpoint_c": -17.5,
        "Wind_Direction": 223,
        "Wind_Speed_kt": 27.2
      },
      {
        "Altitude_ft": 16358,
        "Temp_c": -11,
        "Dewpoint_c": -17.7,
        "Wind_Direction": 223,
        "Wind_Speed_kt": 27
      },
      {
        "Altitude_ft": 16371,
        "Temp_c": -11,
        "Dewpoint_c": -18,
        "Wind_Direction": 223,
        "Wind_Speed_kt": 26.8
      },
      {
        "Altitude_ft": 16388,
        "Temp_c": -11,
        "Dewpoint_c": -18.2,
        "Wind_Direction": 223,
        "Wind_Speed_kt": 26.8
      },
      {
        "Altitude_ft": 16404,
        "Temp_c": -11,
        "Dewpoint_c": -18.4,
        "Wind_Direction": 223,
        "Wind_Speed_kt": 26.6
      },
      {
        "Altitude_ft": 16417,
        "Temp_c": -11,
        "Dewpoint_c": -18.7,
        "Wind_Direction": 223,
        "Wind_Speed_kt": 26.4
      },
      {
        "Altitude_ft": 16434,
        "Temp_c": -11,
        "Dewpoint_c": -18.9,
        "Wind_Direction": 223,
        "Wind_Speed_kt": 26.4
      },
      {
        "Altitude_ft": 16450,
        "Temp_c": -11,
        "Dewpoint_c": -19.2,
        "Wind_Direction": 223,
        "Wind_Speed_kt": 26.2
      },
      {
        "Altitude_ft": 16463,
        "Temp_c": -11,
        "Dewpoint_c": -19.4,
        "Wind_Direction": 223,
        "Wind_Speed_kt": 26
      },
      {
        "Altitude_ft": 16480,
        "Temp_c": -11,
        "Dewpoint_c": -19.7,
        "Wind_Direction": 223,
        "Wind_Speed_kt": 25.9
      },
      {
        "Altitude_ft": 16496,
        "Temp_c": -11,
        "Dewpoint_c": -19.9,
        "Wind_Direction": 223,
        "Wind_Speed_kt": 25.9
      },
      {
        "Altitude_ft": 16512,
        "Temp_c": -11.1,
        "Dewpoint_c": -20.2,
        "Wind_Direction": 223,
        "Wind_Speed_kt": 25.7
      },
      {
        "Altitude_ft": 16529,
        "Temp_c": -11.1,
        "Dewpoint_c": -20.5,
        "Wind_Direction": 223,
        "Wind_Speed_kt": 25.5
      },
      {
        "Altitude_ft": 16545,
        "Temp_c": -11.1,
        "Dewpoint_c": -20.7,
        "Wind_Direction": 223,
        "Wind_Speed_kt": 25.5
      },
      {
        "Altitude_ft": 16562,
        "Temp_c": -11.1,
        "Dewpoint_c": -20.9,
        "Wind_Direction": 223,
        "Wind_Speed_kt": 25.3
      },
      {
        "Altitude_ft": 16578,
        "Temp_c": -11.2,
        "Dewpoint_c": -21.1,
        "Wind_Direction": 223,
        "Wind_Speed_kt": 25.1
      },
      {
        "Altitude_ft": 16594,
        "Temp_c": -11.2,
        "Dewpoint_c": -21.2,
        "Wind_Direction": 223,
        "Wind_Speed_kt": 24.9
      },
      {
        "Altitude_ft": 16611,
        "Temp_c": -11.2,
        "Dewpoint_c": -21.4,
        "Wind_Direction": 223,
        "Wind_Speed_kt": 24.9
      },
      {
        "Altitude_ft": 16631,
        "Temp_c": -11.3,
        "Dewpoint_c": -21.6,
        "Wind_Direction": 223,
        "Wind_Speed_kt": 24.7
      },
      {
        "Altitude_ft": 16647,
        "Temp_c": -11.3,
        "Dewpoint_c": -21.8,
        "Wind_Direction": 223,
        "Wind_Speed_kt": 24.5
      },
      {
        "Altitude_ft": 16667,
        "Temp_c": -11.3,
        "Dewpoint_c": -22,
        "Wind_Direction": 223,
        "Wind_Speed_kt": 24.5
      },
      {
        "Altitude_ft": 16683,
        "Temp_c": -11.4,
        "Dewpoint_c": -22.1,
        "Wind_Direction": 222,
        "Wind_Speed_kt": 24.3
      },
      {
        "Altitude_ft": 16699,
        "Temp_c": -11.4,
        "Dewpoint_c": -22.3,
        "Wind_Direction": 222,
        "Wind_Speed_kt": 24.3
      },
      {
        "Altitude_ft": 16719,
        "Temp_c": -11.4,
        "Dewpoint_c": -22.5,
        "Wind_Direction": 222,
        "Wind_Speed_kt": 24.3
      },
      {
        "Altitude_ft": 16736,
        "Temp_c": -11.5,
        "Dewpoint_c": -22.7,
        "Wind_Direction": 221,
        "Wind_Speed_kt": 24.3
      },
      {
        "Altitude_ft": 16752,
        "Temp_c": -11.5,
        "Dewpoint_c": -22.9,
        "Wind_Direction": 221,
        "Wind_Speed_kt": 24.1
      },
      {
        "Altitude_ft": 16768,
        "Temp_c": -11.5,
        "Dewpoint_c": -23.1,
        "Wind_Direction": 221,
        "Wind_Speed_kt": 24.1
      },
      {
        "Altitude_ft": 16785,
        "Temp_c": -11.5,
        "Dewpoint_c": -23.4,
        "Wind_Direction": 220,
        "Wind_Speed_kt": 24.1
      },
      {
        "Altitude_ft": 16801,
        "Temp_c": -11.6,
        "Dewpoint_c": -23.6,
        "Wind_Direction": 220,
        "Wind_Speed_kt": 24.1
      },
      {
        "Altitude_ft": 16818,
        "Temp_c": -11.6,
        "Dewpoint_c": -23.9,
        "Wind_Direction": 220,
        "Wind_Speed_kt": 23.9
      },
      {
        "Altitude_ft": 16837,
        "Temp_c": -11.6,
        "Dewpoint_c": -24.2,
        "Wind_Direction": 219,
        "Wind_Speed_kt": 23.9
      },
      {
        "Altitude_ft": 16854,
        "Temp_c": -11.6,
        "Dewpoint_c": -24.5,
        "Wind_Direction": 219,
        "Wind_Speed_kt": 23.9
      },
      {
        "Altitude_ft": 16870,
        "Temp_c": -11.6,
        "Dewpoint_c": -24.8,
        "Wind_Direction": 219,
        "Wind_Speed_kt": 23.9
      },
      {
        "Altitude_ft": 16886,
        "Temp_c": -11.6,
        "Dewpoint_c": -25.1,
        "Wind_Direction": 218,
        "Wind_Speed_kt": 23.7
      },
      {
        "Altitude_ft": 16900,
        "Temp_c": -11.6,
        "Dewpoint_c": -25.5,
        "Wind_Direction": 218,
        "Wind_Speed_kt": 23.7
      },
      {
        "Altitude_ft": 16913,
        "Temp_c": -11.6,
        "Dewpoint_c": -25.8,
        "Wind_Direction": 218,
        "Wind_Speed_kt": 23.7
      },
      {
        "Altitude_ft": 16926,
        "Temp_c": -11.7,
        "Dewpoint_c": -26.1,
        "Wind_Direction": 217,
        "Wind_Speed_kt": 23.7
      },
      {
        "Altitude_ft": 16942,
        "Temp_c": -11.7,
        "Dewpoint_c": -26.5,
        "Wind_Direction": 217,
        "Wind_Speed_kt": 23.5
      },
      {
        "Altitude_ft": 16955,
        "Temp_c": -11.7,
        "Dewpoint_c": -26.9,
        "Wind_Direction": 217,
        "Wind_Speed_kt": 23.5
      },
      {
        "Altitude_ft": 16969,
        "Temp_c": -11.7,
        "Dewpoint_c": -27.2,
        "Wind_Direction": 216,
        "Wind_Speed_kt": 23.5
      },
      {
        "Altitude_ft": 16985,
        "Temp_c": -11.7,
        "Dewpoint_c": -27.6,
        "Wind_Direction": 216,
        "Wind_Speed_kt": 23.5
      },
      {
        "Altitude_ft": 16998,
        "Temp_c": -11.7,
        "Dewpoint_c": -28,
        "Wind_Direction": 215,
        "Wind_Speed_kt": 23.3
      },
      {
        "Altitude_ft": 17014,
        "Temp_c": -11.8,
        "Dewpoint_c": -28.4,
        "Wind_Direction": 215,
        "Wind_Speed_kt": 23.3
      },
      {
        "Altitude_ft": 17031,
        "Temp_c": -11.8,
        "Dewpoint_c": -28.8,
        "Wind_Direction": 214,
        "Wind_Speed_kt": 23.3
      },
      {
        "Altitude_ft": 17044,
        "Temp_c": -11.8,
        "Dewpoint_c": -29.2,
        "Wind_Direction": 213,
        "Wind_Speed_kt": 23.3
      },
      {
        "Altitude_ft": 17060,
        "Temp_c": -11.8,
        "Dewpoint_c": -29.7,
        "Wind_Direction": 213,
        "Wind_Speed_kt": 23.1
      },
      {
        "Altitude_ft": 17077,
        "Temp_c": -11.8,
        "Dewpoint_c": -30.1,
        "Wind_Direction": 212,
        "Wind_Speed_kt": 23.1
      },
      {
        "Altitude_ft": 17093,
        "Temp_c": -11.8,
        "Dewpoint_c": -30.6,
        "Wind_Direction": 211,
        "Wind_Speed_kt": 23.1
      },
      {
        "Altitude_ft": 17106,
        "Temp_c": -11.9,
        "Dewpoint_c": -31.1,
        "Wind_Direction": 211,
        "Wind_Speed_kt": 23.1
      },
      {
        "Altitude_ft": 17123,
        "Temp_c": -11.9,
        "Dewpoint_c": -31.6,
        "Wind_Direction": 210,
        "Wind_Speed_kt": 22.9
      },
      {
        "Altitude_ft": 17142,
        "Temp_c": -11.9,
        "Dewpoint_c": -32.1,
        "Wind_Direction": 209,
        "Wind_Speed_kt": 22.9
      },
      {
        "Altitude_ft": 17162,
        "Temp_c": -11.9,
        "Dewpoint_c": -32.7,
        "Wind_Direction": 209,
        "Wind_Speed_kt": 22.9
      },
      {
        "Altitude_ft": 17182,
        "Temp_c": -12,
        "Dewpoint_c": -33.3,
        "Wind_Direction": 208,
        "Wind_Speed_kt": 22.9
      },
      {
        "Altitude_ft": 17201,
        "Temp_c": -12,
        "Dewpoint_c": -34,
        "Wind_Direction": 207,
        "Wind_Speed_kt": 22.9
      },
      {
        "Altitude_ft": 17218,
        "Temp_c": -12,
        "Dewpoint_c": -34.1,
        "Wind_Direction": 207,
        "Wind_Speed_kt": 22.9
      },
      {
        "Altitude_ft": 17238,
        "Temp_c": -12,
        "Dewpoint_c": -34.2,
        "Wind_Direction": 206,
        "Wind_Speed_kt": 22.9
      },
      {
        "Altitude_ft": 17251,
        "Temp_c": -12,
        "Dewpoint_c": -34.3,
        "Wind_Direction": 205,
        "Wind_Speed_kt": 22.9
      },
      {
        "Altitude_ft": 17267,
        "Temp_c": -12.1,
        "Dewpoint_c": -34.4,
        "Wind_Direction": 204,
        "Wind_Speed_kt": 22.7
      },
      {
        "Altitude_ft": 17280,
        "Temp_c": -12.1,
        "Dewpoint_c": -34.6,
        "Wind_Direction": 204,
        "Wind_Speed_kt": 22.7
      },
      {
        "Altitude_ft": 17297,
        "Temp_c": -12.1,
        "Dewpoint_c": -34.7,
        "Wind_Direction": 203,
        "Wind_Speed_kt": 22.7
      },
      {
        "Altitude_ft": 17310,
        "Temp_c": -12.1,
        "Dewpoint_c": -34.8,
        "Wind_Direction": 202,
        "Wind_Speed_kt": 22.7
      },
      {
        "Altitude_ft": 17326,
        "Temp_c": -12.2,
        "Dewpoint_c": -34.9,
        "Wind_Direction": 202,
        "Wind_Speed_kt": 22.7
      },
      {
        "Altitude_ft": 17343,
        "Temp_c": -12.2,
        "Dewpoint_c": -35,
        "Wind_Direction": 202,
        "Wind_Speed_kt": 22.7
      },
      {
        "Altitude_ft": 17359,
        "Temp_c": -12.2,
        "Dewpoint_c": -35.2,
        "Wind_Direction": 202,
        "Wind_Speed_kt": 22.7
      },
      {
        "Altitude_ft": 17375,
        "Temp_c": -12.2,
        "Dewpoint_c": -35.3,
        "Wind_Direction": 201,
        "Wind_Speed_kt": 22.7
      },
      {
        "Altitude_ft": 17392,
        "Temp_c": -12.2,
        "Dewpoint_c": -35.4,
        "Wind_Direction": 201,
        "Wind_Speed_kt": 22.5
      },
      {
        "Altitude_ft": 17415,
        "Temp_c": -12.3,
        "Dewpoint_c": -35.6,
        "Wind_Direction": 201,
        "Wind_Speed_kt": 22.5
      },
      {
        "Altitude_ft": 17421,
        "Temp_c": -12.3,
        "Dewpoint_c": -35.6,
        "Wind_Direction": 201,
        "Wind_Speed_kt": 22.5
      },
      {
        "Altitude_ft": 17438,
        "Temp_c": -12.3,
        "Dewpoint_c": -35.6,
        "Wind_Direction": 200,
        "Wind_Speed_kt": 22.5
      },
      {
        "Altitude_ft": 17451,
        "Temp_c": -12.3,
        "Dewpoint_c": -35.6,
        "Wind_Direction": 200,
        "Wind_Speed_kt": 22.5
      },
      {
        "Altitude_ft": 17467,
        "Temp_c": -12.4,
        "Dewpoint_c": -35.6,
        "Wind_Direction": 200,
        "Wind_Speed_kt": 22.4
      },
      {
        "Altitude_ft": 17484,
        "Temp_c": -12.4,
        "Dewpoint_c": -35.7,
        "Wind_Direction": 200,
        "Wind_Speed_kt": 22.4
      },
      {
        "Altitude_ft": 17497,
        "Temp_c": -12.4,
        "Dewpoint_c": -35.7,
        "Wind_Direction": 199,
        "Wind_Speed_kt": 22.4
      },
      {
        "Altitude_ft": 17510,
        "Temp_c": -12.4,
        "Dewpoint_c": -35.7,
        "Wind_Direction": 199,
        "Wind_Speed_kt": 22.4
      },
      {
        "Altitude_ft": 17523,
        "Temp_c": -12.5,
        "Dewpoint_c": -35.7,
        "Wind_Direction": 199,
        "Wind_Speed_kt": 22.4
      },
      {
        "Altitude_ft": 17536,
        "Temp_c": -12.5,
        "Dewpoint_c": -35.7,
        "Wind_Direction": 198,
        "Wind_Speed_kt": 22.2
      },
      {
        "Altitude_ft": 17549,
        "Temp_c": -12.5,
        "Dewpoint_c": -35.7,
        "Wind_Direction": 198,
        "Wind_Speed_kt": 22.2
      },
      {
        "Altitude_ft": 17566,
        "Temp_c": -12.5,
        "Dewpoint_c": -35.8,
        "Wind_Direction": 198,
        "Wind_Speed_kt": 22.2
      },
      {
        "Altitude_ft": 17579,
        "Temp_c": -12.5,
        "Dewpoint_c": -35.8,
        "Wind_Direction": 198,
        "Wind_Speed_kt": 22.2
      },
      {
        "Altitude_ft": 17592,
        "Temp_c": -12.6,
        "Dewpoint_c": -35.8,
        "Wind_Direction": 197,
        "Wind_Speed_kt": 22.2
      },
      {
        "Altitude_ft": 17608,
        "Temp_c": -12.6,
        "Dewpoint_c": -35.8,
        "Wind_Direction": 197,
        "Wind_Speed_kt": 22.2
      },
      {
        "Altitude_ft": 17621,
        "Temp_c": -12.6,
        "Dewpoint_c": -35.9,
        "Wind_Direction": 197,
        "Wind_Speed_kt": 22.2
      },
      {
        "Altitude_ft": 17635,
        "Temp_c": -12.7,
        "Dewpoint_c": -35.9,
        "Wind_Direction": 198,
        "Wind_Speed_kt": 22.2
      },
      {
        "Altitude_ft": 17648,
        "Temp_c": -12.7,
        "Dewpoint_c": -35.9,
        "Wind_Direction": 198,
        "Wind_Speed_kt": 22.2
      },
      {
        "Altitude_ft": 17657,
        "Temp_c": -12.7,
        "Dewpoint_c": -36,
        "Wind_Direction": 198,
        "Wind_Speed_kt": 22.2
      },
      {
        "Altitude_ft": 17671,
        "Temp_c": -12.8,
        "Dewpoint_c": -36,
        "Wind_Direction": 198,
        "Wind_Speed_kt": 22.2
      },
      {
        "Altitude_ft": 17680,
        "Temp_c": -12.8,
        "Dewpoint_c": -36.1,
        "Wind_Direction": 198,
        "Wind_Speed_kt": 22.2
      },
      {
        "Altitude_ft": 17694,
        "Temp_c": -12.8,
        "Dewpoint_c": -36.1,
        "Wind_Direction": 198,
        "Wind_Speed_kt": 22
      },
      {
        "Altitude_ft": 17707,
        "Temp_c": -12.8,
        "Dewpoint_c": -36.1,
        "Wind_Direction": 199,
        "Wind_Speed_kt": 22
      },
      {
        "Altitude_ft": 17720,
        "Temp_c": -12.9,
        "Dewpoint_c": -36.2,
        "Wind_Direction": 199,
        "Wind_Speed_kt": 22
      },
      {
        "Altitude_ft": 17736,
        "Temp_c": -12.9,
        "Dewpoint_c": -36.2,
        "Wind_Direction": 199,
        "Wind_Speed_kt": 22
      },
      {
        "Altitude_ft": 17749,
        "Temp_c": -12.9,
        "Dewpoint_c": -36.3,
        "Wind_Direction": 199,
        "Wind_Speed_kt": 22
      },
      {
        "Altitude_ft": 17766,
        "Temp_c": -13,
        "Dewpoint_c": -36.3,
        "Wind_Direction": 199,
        "Wind_Speed_kt": 22
      },
      {
        "Altitude_ft": 17779,
        "Temp_c": -13,
        "Dewpoint_c": -36.3,
        "Wind_Direction": 200,
        "Wind_Speed_kt": 22
      },
      {
        "Altitude_ft": 17795,
        "Temp_c": -13,
        "Dewpoint_c": -36.4,
        "Wind_Direction": 200,
        "Wind_Speed_kt": 22
      },
      {
        "Altitude_ft": 17808,
        "Temp_c": -13.1,
        "Dewpoint_c": -36.5,
        "Wind_Direction": 200,
        "Wind_Speed_kt": 22
      },
      {
        "Altitude_ft": 17825,
        "Temp_c": -13.1,
        "Dewpoint_c": -36.6,
        "Wind_Direction": 200,
        "Wind_Speed_kt": 22
      },
      {
        "Altitude_ft": 17838,
        "Temp_c": -13.1,
        "Dewpoint_c": -36.7,
        "Wind_Direction": 200,
        "Wind_Speed_kt": 22
      },
      {
        "Altitude_ft": 17851,
        "Temp_c": -13.2,
        "Dewpoint_c": -36.8,
        "Wind_Direction": 201,
        "Wind_Speed_kt": 22
      },
      {
        "Altitude_ft": 17867,
        "Temp_c": -13.2,
        "Dewpoint_c": -36.9,
        "Wind_Direction": 201,
        "Wind_Speed_kt": 22
      },
      {
        "Altitude_ft": 17881,
        "Temp_c": -13.2,
        "Dewpoint_c": -37,
        "Wind_Direction": 201,
        "Wind_Speed_kt": 22.2
      },
      {
        "Altitude_ft": 17897,
        "Temp_c": -13.3,
        "Dewpoint_c": -37.1,
        "Wind_Direction": 201,
        "Wind_Speed_kt": 22.2
      },
      {
        "Altitude_ft": 17910,
        "Temp_c": -13.3,
        "Dewpoint_c": -37.2,
        "Wind_Direction": 201,
        "Wind_Speed_kt": 22.2
      },
      {
        "Altitude_ft": 17923,
        "Temp_c": -13.3,
        "Dewpoint_c": -37.3,
        "Wind_Direction": 202,
        "Wind_Speed_kt": 22.2
      },
      {
        "Altitude_ft": 17936,
        "Temp_c": -13.3,
        "Dewpoint_c": -37.4,
        "Wind_Direction": 202,
        "Wind_Speed_kt": 22.2
      },
      {
        "Altitude_ft": 17953,
        "Temp_c": -13.4,
        "Dewpoint_c": -37.4,
        "Wind_Direction": 202,
        "Wind_Speed_kt": 22.2
      },
      {
        "Altitude_ft": 17966,
        "Temp_c": -13.4,
        "Dewpoint_c": -37.5,
        "Wind_Direction": 202,
        "Wind_Speed_kt": 22.2
      },
      {
        "Altitude_ft": 17979,
        "Temp_c": -13.4,
        "Dewpoint_c": -37.7,
        "Wind_Direction": 202,
        "Wind_Speed_kt": 22.2
      },
      {
        "Altitude_ft": 17995,
        "Temp_c": -13.5,
        "Dewpoint_c": -37.8,
        "Wind_Direction": 203,
        "Wind_Speed_kt": 22.2
      },
      {
        "Altitude_ft": 18009,
        "Temp_c": -13.5,
        "Dewpoint_c": -38,
        "Wind_Direction": 203,
        "Wind_Speed_kt": 22.2
      },
      {
        "Altitude_ft": 18022,
        "Temp_c": -13.5,
        "Dewpoint_c": -38.2,
        "Wind_Direction": 203,
        "Wind_Speed_kt": 22.2
      },
      {
        "Altitude_ft": 18035,
        "Temp_c": -13.6,
        "Dewpoint_c": -38.4,
        "Wind_Direction": 203,
        "Wind_Speed_kt": 22.2
      },
      {
        "Altitude_ft": 18048,
        "Temp_c": -13.6,
        "Dewpoint_c": -38.5,
        "Wind_Direction": 203,
        "Wind_Speed_kt": 22.2
      },
      {
        "Altitude_ft": 18058,
        "Temp_c": -13.6,
        "Dewpoint_c": -38.7,
        "Wind_Direction": 204,
        "Wind_Speed_kt": 22.2
      },
      {
        "Altitude_ft": 18071,
        "Temp_c": -13.6,
        "Dewpoint_c": -38.9,
        "Wind_Direction": 204,
        "Wind_Speed_kt": 22.2
      },
      {
        "Altitude_ft": 18084,
        "Temp_c": -13.7,
        "Dewpoint_c": -39.1,
        "Wind_Direction": 204,
        "Wind_Speed_kt": 22.2
      },
      {
        "Altitude_ft": 18094,
        "Temp_c": -13.7,
        "Dewpoint_c": -39.3,
        "Wind_Direction": 204,
        "Wind_Speed_kt": 22.2
      },
      {
        "Altitude_ft": 18110,
        "Temp_c": -13.7,
        "Dewpoint_c": -39.5,
        "Wind_Direction": 204,
        "Wind_Speed_kt": 22.2
      },
      {
        "Altitude_ft": 18123,
        "Temp_c": -13.8,
        "Dewpoint_c": -39.7,
        "Wind_Direction": 205,
        "Wind_Speed_kt": 22.2
      },
      {
        "Altitude_ft": 18140,
        "Temp_c": -13.8,
        "Dewpoint_c": -39.9,
        "Wind_Direction": 205,
        "Wind_Speed_kt": 22.2
      },
      {
        "Altitude_ft": 18153,
        "Temp_c": -13.8,
        "Dewpoint_c": -40.1,
        "Wind_Direction": 205,
        "Wind_Speed_kt": 22.2
      },
      {
        "Altitude_ft": 18166,
        "Temp_c": -13.8,
        "Dewpoint_c": -40.2,
        "Wind_Direction": 205,
        "Wind_Speed_kt": 22.2
      },
      {
        "Altitude_ft": 18182,
        "Temp_c": -13.9,
        "Dewpoint_c": -40.2,
        "Wind_Direction": 206,
        "Wind_Speed_kt": 22
      },
      {
        "Altitude_ft": 18199,
        "Temp_c": -13.9,
        "Dewpoint_c": -40.3,
        "Wind_Direction": 206,
        "Wind_Speed_kt": 22
      },
      {
        "Altitude_ft": 18212,
        "Temp_c": -13.9,
        "Dewpoint_c": -40.3,
        "Wind_Direction": 206,
        "Wind_Speed_kt": 22
      },
      {
        "Altitude_ft": 18228,
        "Temp_c": -14,
        "Dewpoint_c": -40.4,
        "Wind_Direction": 207,
        "Wind_Speed_kt": 22
      },
      {
        "Altitude_ft": 18245,
        "Temp_c": -14,
        "Dewpoint_c": -40.4,
        "Wind_Direction": 207,
        "Wind_Speed_kt": 21.8
      },
      {
        "Altitude_ft": 18261,
        "Temp_c": -14,
        "Dewpoint_c": -40.5,
        "Wind_Direction": 207,
        "Wind_Speed_kt": 21.8
      },
      {
        "Altitude_ft": 18274,
        "Temp_c": -14.1,
        "Dewpoint_c": -40.5,
        "Wind_Direction": 208,
        "Wind_Speed_kt": 21.8
      },
      {
        "Altitude_ft": 18287,
        "Temp_c": -14.1,
        "Dewpoint_c": -40.6,
        "Wind_Direction": 208,
        "Wind_Speed_kt": 21.6
      },
      {
        "Altitude_ft": 18304,
        "Temp_c": -14.1,
        "Dewpoint_c": -40.7,
        "Wind_Direction": 208,
        "Wind_Speed_kt": 21.6
      },
      {
        "Altitude_ft": 18317,
        "Temp_c": -14.2,
        "Dewpoint_c": -40.7,
        "Wind_Direction": 209,
        "Wind_Speed_kt": 21.6
      },
      {
        "Altitude_ft": 18330,
        "Temp_c": -14.2,
        "Dewpoint_c": -40.8,
        "Wind_Direction": 209,
        "Wind_Speed_kt": 21.4
      },
      {
        "Altitude_ft": 18343,
        "Temp_c": -14.2,
        "Dewpoint_c": -40.8,
        "Wind_Direction": 209,
        "Wind_Speed_kt": 21.4
      },
      {
        "Altitude_ft": 18353,
        "Temp_c": -14.3,
        "Dewpoint_c": -40.9,
        "Wind_Direction": 209,
        "Wind_Speed_kt": 21.4
      },
      {
        "Altitude_ft": 18369,
        "Temp_c": -14.3,
        "Dewpoint_c": -40.8,
        "Wind_Direction": 210,
        "Wind_Speed_kt": 21.2
      },
      {
        "Altitude_ft": 18383,
        "Temp_c": -14.3,
        "Dewpoint_c": -40.7,
        "Wind_Direction": 210,
        "Wind_Speed_kt": 21.2
      },
      {
        "Altitude_ft": 18392,
        "Temp_c": -14.4,
        "Dewpoint_c": -40.7,
        "Wind_Direction": 211,
        "Wind_Speed_kt": 21.2
      },
      {
        "Altitude_ft": 18409,
        "Temp_c": -14.4,
        "Dewpoint_c": -40.6,
        "Wind_Direction": 211,
        "Wind_Speed_kt": 21.2
      },
      {
        "Altitude_ft": 18425,
        "Temp_c": -14.4,
        "Dewpoint_c": -40.5,
        "Wind_Direction": 211,
        "Wind_Speed_kt": 21
      },
      {
        "Altitude_ft": 18442,
        "Temp_c": -14.4,
        "Dewpoint_c": -40.5,
        "Wind_Direction": 212,
        "Wind_Speed_kt": 21
      },
      {
        "Altitude_ft": 18455,
        "Temp_c": -14.5,
        "Dewpoint_c": -40.4,
        "Wind_Direction": 212,
        "Wind_Speed_kt": 20.8
      },
      {
        "Altitude_ft": 18471,
        "Temp_c": -14.5,
        "Dewpoint_c": -40.4,
        "Wind_Direction": 212,
        "Wind_Speed_kt": 20.6
      },
      {
        "Altitude_ft": 18488,
        "Temp_c": -14.5,
        "Dewpoint_c": -40.3,
        "Wind_Direction": 212,
        "Wind_Speed_kt": 20.6
      },
      {
        "Altitude_ft": 18504,
        "Temp_c": -14.5,
        "Dewpoint_c": -40.3,
        "Wind_Direction": 212,
        "Wind_Speed_kt": 20.4
      },
      {
        "Altitude_ft": 18517,
        "Temp_c": -14.6,
        "Dewpoint_c": -40.2,
        "Wind_Direction": 212,
        "Wind_Speed_kt": 20.2
      },
      {
        "Altitude_ft": 18530,
        "Temp_c": -14.6,
        "Dewpoint_c": -40.2,
        "Wind_Direction": 212,
        "Wind_Speed_kt": 20
      },
      {
        "Altitude_ft": 18547,
        "Temp_c": -14.6,
        "Dewpoint_c": -40.1,
        "Wind_Direction": 212,
        "Wind_Speed_kt": 19.8
      },
      {
        "Altitude_ft": 18560,
        "Temp_c": -14.7,
        "Dewpoint_c": -40.2,
        "Wind_Direction": 212,
        "Wind_Speed_kt": 19.6
      },
      {
        "Altitude_ft": 18573,
        "Temp_c": -14.7,
        "Dewpoint_c": -40.2,
        "Wind_Direction": 212,
        "Wind_Speed_kt": 19.6
      },
      {
        "Altitude_ft": 18586,
        "Temp_c": -14.7,
        "Dewpoint_c": -40.3,
        "Wind_Direction": 212,
        "Wind_Speed_kt": 19.4
      },
      {
        "Altitude_ft": 18602,
        "Temp_c": -14.7,
        "Dewpoint_c": -40.3,
        "Wind_Direction": 212,
        "Wind_Speed_kt": 19.2
      },
      {
        "Altitude_ft": 18615,
        "Temp_c": -14.7,
        "Dewpoint_c": -40.4,
        "Wind_Direction": 212,
        "Wind_Speed_kt": 19
      },
      {
        "Altitude_ft": 18632,
        "Temp_c": -14.8,
        "Dewpoint_c": -40.4,
        "Wind_Direction": 212,
        "Wind_Speed_kt": 18.9
      },
      {
        "Altitude_ft": 18645,
        "Temp_c": -14.8,
        "Dewpoint_c": -40.5,
        "Wind_Direction": 212,
        "Wind_Speed_kt": 18.7
      },
      {
        "Altitude_ft": 18658,
        "Temp_c": -14.8,
        "Dewpoint_c": -40.5,
        "Wind_Direction": 212,
        "Wind_Speed_kt": 18.5
      },
      {
        "Altitude_ft": 18675,
        "Temp_c": -14.8,
        "Dewpoint_c": -40.6,
        "Wind_Direction": 212,
        "Wind_Speed_kt": 18.5
      },
      {
        "Altitude_ft": 18691,
        "Temp_c": -14.8,
        "Dewpoint_c": -40.6,
        "Wind_Direction": 212,
        "Wind_Speed_kt": 18.3
      },
      {
        "Altitude_ft": 18707,
        "Temp_c": -14.9,
        "Dewpoint_c": -40.7,
        "Wind_Direction": 212,
        "Wind_Speed_kt": 18.1
      },
      {
        "Altitude_ft": 18724,
        "Temp_c": -14.9,
        "Dewpoint_c": -40.7,
        "Wind_Direction": 212,
        "Wind_Speed_kt": 17.9
      },
      {
        "Altitude_ft": 18740,
        "Temp_c": -14.9,
        "Dewpoint_c": -40.8,
        "Wind_Direction": 212,
        "Wind_Speed_kt": 17.7
      },
      {
        "Altitude_ft": 18757,
        "Temp_c": -14.9,
        "Dewpoint_c": -40.9,
        "Wind_Direction": 211,
        "Wind_Speed_kt": 17.7
      },
      {
        "Altitude_ft": 18773,
        "Temp_c": -14.9,
        "Dewpoint_c": -41,
        "Wind_Direction": 211,
        "Wind_Speed_kt": 17.7
      },
      {
        "Altitude_ft": 18789,
        "Temp_c": -15,
        "Dewpoint_c": -41.2,
        "Wind_Direction": 211,
        "Wind_Speed_kt": 17.7
      },
      {
        "Altitude_ft": 18806,
        "Temp_c": -15,
        "Dewpoint_c": -41.4,
        "Wind_Direction": 211,
        "Wind_Speed_kt": 17.7
      },
      {
        "Altitude_ft": 18822,
        "Temp_c": -15,
        "Dewpoint_c": -41.6,
        "Wind_Direction": 211,
        "Wind_Speed_kt": 17.7
      },
      {
        "Altitude_ft": 18839,
        "Temp_c": -15.1,
        "Dewpoint_c": -41.8,
        "Wind_Direction": 211,
        "Wind_Speed_kt": 17.7
      },
      {
        "Altitude_ft": 18855,
        "Temp_c": -15.1,
        "Dewpoint_c": -42,
        "Wind_Direction": 210,
        "Wind_Speed_kt": 17.7
      },
      {
        "Altitude_ft": 18871,
        "Temp_c": -15.1,
        "Dewpoint_c": -42.2,
        "Wind_Direction": 210,
        "Wind_Speed_kt": 17.7
      },
      {
        "Altitude_ft": 18888,
        "Temp_c": -15.2,
        "Dewpoint_c": -42.4,
        "Wind_Direction": 210,
        "Wind_Speed_kt": 17.7
      },
      {
        "Altitude_ft": 18901,
        "Temp_c": -15.2,
        "Dewpoint_c": -42.6,
        "Wind_Direction": 210,
        "Wind_Speed_kt": 17.7
      },
      {
        "Altitude_ft": 18917,
        "Temp_c": -15.2,
        "Dewpoint_c": -42.8,
        "Wind_Direction": 210,
        "Wind_Speed_kt": 17.7
      },
      {
        "Altitude_ft": 18934,
        "Temp_c": -15.3,
        "Dewpoint_c": -43,
        "Wind_Direction": 210,
        "Wind_Speed_kt": 17.7
      },
      {
        "Altitude_ft": 18950,
        "Temp_c": -15.3,
        "Dewpoint_c": -43.2,
        "Wind_Direction": 209,
        "Wind_Speed_kt": 17.7
      },
      {
        "Altitude_ft": 18967,
        "Temp_c": -15.3,
        "Dewpoint_c": -43.4,
        "Wind_Direction": 209,
        "Wind_Speed_kt": 17.7
      },
      {
        "Altitude_ft": 18983,
        "Temp_c": -15.3,
        "Dewpoint_c": -43.5,
        "Wind_Direction": 209,
        "Wind_Speed_kt": 17.7
      },
      {
        "Altitude_ft": 18999,
        "Temp_c": -15.4,
        "Dewpoint_c": -43.6,
        "Wind_Direction": 209,
        "Wind_Speed_kt": 17.7
      },
      {
        "Altitude_ft": 19016,
        "Temp_c": -15.4,
        "Dewpoint_c": -43.8,
        "Wind_Direction": 209,
        "Wind_Speed_kt": 17.7
      },
      {
        "Altitude_ft": 19032,
        "Temp_c": -15.5,
        "Dewpoint_c": -43.9,
        "Wind_Direction": 209,
        "Wind_Speed_kt": 17.7
      },
      {
        "Altitude_ft": 19049,
        "Temp_c": -15.5,
        "Dewpoint_c": -44,
        "Wind_Direction": 208,
        "Wind_Speed_kt": 17.7
      },
      {
        "Altitude_ft": 19068,
        "Temp_c": -15.5,
        "Dewpoint_c": -44.1,
        "Wind_Direction": 208,
        "Wind_Speed_kt": 17.7
      },
      {
        "Altitude_ft": 19085,
        "Temp_c": -15.6,
        "Dewpoint_c": -44.2,
        "Wind_Direction": 209,
        "Wind_Speed_kt": 17.7
      },
      {
        "Altitude_ft": 19104,
        "Temp_c": -15.6,
        "Dewpoint_c": -44.4,
        "Wind_Direction": 209,
        "Wind_Speed_kt": 17.5
      },
      {
        "Altitude_ft": 19121,
        "Temp_c": -15.6,
        "Dewpoint_c": -44.5,
        "Wind_Direction": 210,
        "Wind_Speed_kt": 17.5
      },
      {
        "Altitude_ft": 19134,
        "Temp_c": -15.7,
        "Dewpoint_c": -44.6,
        "Wind_Direction": 211,
        "Wind_Speed_kt": 17.5
      },
      {
        "Altitude_ft": 19147,
        "Temp_c": -15.7,
        "Dewpoint_c": -44.7,
        "Wind_Direction": 211,
        "Wind_Speed_kt": 17.3
      },
      {
        "Altitude_ft": 19163,
        "Temp_c": -15.7,
        "Dewpoint_c": -44.9,
        "Wind_Direction": 212,
        "Wind_Speed_kt": 17.3
      },
      {
        "Altitude_ft": 19177,
        "Temp_c": -15.8,
        "Dewpoint_c": -45,
        "Wind_Direction": 212,
        "Wind_Speed_kt": 17.3
      },
      {
        "Altitude_ft": 19190,
        "Temp_c": -15.8,
        "Dewpoint_c": -45.1,
        "Wind_Direction": 213,
        "Wind_Speed_kt": 17.3
      },
      {
        "Altitude_ft": 19206,
        "Temp_c": -15.8,
        "Dewpoint_c": -45.1,
        "Wind_Direction": 213,
        "Wind_Speed_kt": 17.1
      },
      {
        "Altitude_ft": 19226,
        "Temp_c": -15.9,
        "Dewpoint_c": -45.2,
        "Wind_Direction": 214,
        "Wind_Speed_kt": 17.1
      },
      {
        "Altitude_ft": 19245,
        "Temp_c": -15.9,
        "Dewpoint_c": -45.3,
        "Wind_Direction": 215,
        "Wind_Speed_kt": 17.1
      },
      {
        "Altitude_ft": 19265,
        "Temp_c": -16,
        "Dewpoint_c": -45.3,
        "Wind_Direction": 215,
        "Wind_Speed_kt": 17.1
      },
      {
        "Altitude_ft": 19285,
        "Temp_c": -16,
        "Dewpoint_c": -45.4,
        "Wind_Direction": 216,
        "Wind_Speed_kt": 16.9
      },
      {
        "Altitude_ft": 19304,
        "Temp_c": -16,
        "Dewpoint_c": -45.4,
        "Wind_Direction": 216,
        "Wind_Speed_kt": 16.9
      },
      {
        "Altitude_ft": 19324,
        "Temp_c": -16.1,
        "Dewpoint_c": -45.5,
        "Wind_Direction": 217,
        "Wind_Speed_kt": 16.9
      },
      {
        "Altitude_ft": 19341,
        "Temp_c": -16.1,
        "Dewpoint_c": -45.6,
        "Wind_Direction": 217,
        "Wind_Speed_kt": 16.9
      },
      {
        "Altitude_ft": 19354,
        "Temp_c": -16.2,
        "Dewpoint_c": -45.6,
        "Wind_Direction": 218,
        "Wind_Speed_kt": 16.7
      },
      {
        "Altitude_ft": 19370,
        "Temp_c": -16.2,
        "Dewpoint_c": -45.7,
        "Wind_Direction": 219,
        "Wind_Speed_kt": 16.7
      },
      {
        "Altitude_ft": 19383,
        "Temp_c": -16.2,
        "Dewpoint_c": -45.8,
        "Wind_Direction": 219,
        "Wind_Speed_kt": 16.7
      },
      {
        "Altitude_ft": 19396,
        "Temp_c": -16.3,
        "Dewpoint_c": -45.8,
        "Wind_Direction": 220,
        "Wind_Speed_kt": 16.7
      },
      {
        "Altitude_ft": 19409,
        "Temp_c": -16.3,
        "Dewpoint_c": -45.9,
        "Wind_Direction": 220,
        "Wind_Speed_kt": 16.7
      },
      {
        "Altitude_ft": 19426,
        "Temp_c": -16.4,
        "Dewpoint_c": -45.9,
        "Wind_Direction": 220,
        "Wind_Speed_kt": 16.5
      },
      {
        "Altitude_ft": 19442,
        "Temp_c": -16.4,
        "Dewpoint_c": -45.9,
        "Wind_Direction": 221,
        "Wind_Speed_kt": 16.5
      },
      {
        "Altitude_ft": 19462,
        "Temp_c": -16.4,
        "Dewpoint_c": -45.8,
        "Wind_Direction": 221,
        "Wind_Speed_kt": 16.5
      },
      {
        "Altitude_ft": 19478,
        "Temp_c": -16.5,
        "Dewpoint_c": -45.8,
        "Wind_Direction": 221,
        "Wind_Speed_kt": 16.3
      },
      {
        "Altitude_ft": 19495,
        "Temp_c": -16.5,
        "Dewpoint_c": -45.8,
        "Wind_Direction": 221,
        "Wind_Speed_kt": 16.3
      },
      {
        "Altitude_ft": 19511,
        "Temp_c": -16.6,
        "Dewpoint_c": -45.8,
        "Wind_Direction": 221,
        "Wind_Speed_kt": 16.3
      },
      {
        "Altitude_ft": 19528,
        "Temp_c": -16.6,
        "Dewpoint_c": -45.8,
        "Wind_Direction": 222,
        "Wind_Speed_kt": 16.3
      },
      {
        "Altitude_ft": 19544,
        "Temp_c": -16.7,
        "Dewpoint_c": -45.8,
        "Wind_Direction": 222,
        "Wind_Speed_kt": 16.1
      },
      {
        "Altitude_ft": 19560,
        "Temp_c": -16.7,
        "Dewpoint_c": -45.8,
        "Wind_Direction": 222,
        "Wind_Speed_kt": 16.1
      },
      {
        "Altitude_ft": 19577,
        "Temp_c": -16.8,
        "Dewpoint_c": -45.8,
        "Wind_Direction": 222,
        "Wind_Speed_kt": 16.1
      },
      {
        "Altitude_ft": 19593,
        "Temp_c": -16.8,
        "Dewpoint_c": -45.8,
        "Wind_Direction": 222,
        "Wind_Speed_kt": 16.1
      },
      {
        "Altitude_ft": 19610,
        "Temp_c": -16.8,
        "Dewpoint_c": -45.7,
        "Wind_Direction": 223,
        "Wind_Speed_kt": 15.9
      },
      {
        "Altitude_ft": 19626,
        "Temp_c": -16.9,
        "Dewpoint_c": -45.7,
        "Wind_Direction": 223,
        "Wind_Speed_kt": 15.9
      },
      {
        "Altitude_ft": 19639,
        "Temp_c": -16.9,
        "Dewpoint_c": -45.7,
        "Wind_Direction": 223,
        "Wind_Speed_kt": 15.9
      },
      {
        "Altitude_ft": 19656,
        "Temp_c": -16.9,
        "Dewpoint_c": -45.7,
        "Wind_Direction": 223,
        "Wind_Speed_kt": 15.7
      },
      {
        "Altitude_ft": 19672,
        "Temp_c": -17,
        "Dewpoint_c": -45.7,
        "Wind_Direction": 224,
        "Wind_Speed_kt": 15.7
      },
      {
        "Altitude_ft": 19688,
        "Temp_c": -17,
        "Dewpoint_c": -45.6,
        "Wind_Direction": 224,
        "Wind_Speed_kt": 15.7
      },
      {
        "Altitude_ft": 19705,
        "Temp_c": -17.1,
        "Dewpoint_c": -45.6,
        "Wind_Direction": 224,
        "Wind_Speed_kt": 15.7
      },
      {
        "Altitude_ft": 19721,
        "Temp_c": -17.1,
        "Dewpoint_c": -45.6,
        "Wind_Direction": 224,
        "Wind_Speed_kt": 15.6
      },
      {
        "Altitude_ft": 19738,
        "Temp_c": -17.1,
        "Dewpoint_c": -45.6,
        "Wind_Direction": 224,
        "Wind_Speed_kt": 15.7
      },
      {
        "Altitude_ft": 19754,
        "Temp_c": -17.2,
        "Dewpoint_c": -45.6,
        "Wind_Direction": 224,
        "Wind_Speed_kt": 15.7
      },
      {
        "Altitude_ft": 19770,
        "Temp_c": -17.2,
        "Dewpoint_c": -45.5,
        "Wind_Direction": 224,
        "Wind_Speed_kt": 15.7
      },
      {
        "Altitude_ft": 19790,
        "Temp_c": -17.3,
        "Dewpoint_c": -45.5,
        "Wind_Direction": 224,
        "Wind_Speed_kt": 15.7
      },
      {
        "Altitude_ft": 19803,
        "Temp_c": -17.3,
        "Dewpoint_c": -45.5,
        "Wind_Direction": 224,
        "Wind_Speed_kt": 15.9
      },
      {
        "Altitude_ft": 19816,
        "Temp_c": -17.3,
        "Dewpoint_c": -45.5,
        "Wind_Direction": 224,
        "Wind_Speed_kt": 15.9
      },
      {
        "Altitude_ft": 19833,
        "Temp_c": -17.4,
        "Dewpoint_c": -45.5,
        "Wind_Direction": 224,
        "Wind_Speed_kt": 15.9
      },
      {
        "Altitude_ft": 19846,
        "Temp_c": -17.4,
        "Dewpoint_c": -45.4,
        "Wind_Direction": 224,
        "Wind_Speed_kt": 16.1
      },
      {
        "Altitude_ft": 19859,
        "Temp_c": -17.5,
        "Dewpoint_c": -45.4,
        "Wind_Direction": 224,
        "Wind_Speed_kt": 16.1
      },
      {
        "Altitude_ft": 19872,
        "Temp_c": -17.5,
        "Dewpoint_c": -45.3,
        "Wind_Direction": 224,
        "Wind_Speed_kt": 16.1
      },
      {
        "Altitude_ft": 19888,
        "Temp_c": -17.5,
        "Dewpoint_c": -45.3,
        "Wind_Direction": 224,
        "Wind_Speed_kt": 16.1
      },
      {
        "Altitude_ft": 19902,
        "Temp_c": -17.6,
        "Dewpoint_c": -45.2,
        "Wind_Direction": 224,
        "Wind_Speed_kt": 16.3
      },
      {
        "Altitude_ft": 19915,
        "Temp_c": -17.6,
        "Dewpoint_c": -45.1,
        "Wind_Direction": 224,
        "Wind_Speed_kt": 16.3
      },
      {
        "Altitude_ft": 19928,
        "Temp_c": -17.6,
        "Dewpoint_c": -45.1,
        "Wind_Direction": 224,
        "Wind_Speed_kt": 16.3
      },
      {
        "Altitude_ft": 19941,
        "Temp_c": -17.7,
        "Dewpoint_c": -45,
        "Wind_Direction": 224,
        "Wind_Speed_kt": 16.3
      },
      {
        "Altitude_ft": 19957,
        "Temp_c": -17.7,
        "Dewpoint_c": -45,
        "Wind_Direction": 224,
        "Wind_Speed_kt": 16.5
      },
      {
        "Altitude_ft": 19970,
        "Temp_c": -17.7,
        "Dewpoint_c": -44.9,
        "Wind_Direction": 224,
        "Wind_Speed_kt": 16.5
      },
      {
        "Altitude_ft": 19987,
        "Temp_c": -17.8,
        "Dewpoint_c": -44.9,
        "Wind_Direction": 224,
        "Wind_Speed_kt": 16.5
      },
      {
        "Altitude_ft": 20003,
        "Temp_c": -17.8,
        "Dewpoint_c": -44.8,
        "Wind_Direction": 224,
        "Wind_Speed_kt": 16.7
      }
    ]
  },
  "windMapScreenshotMetadata": {
    "kind": "storage#object",
    "id": "wasatch-wind-static/wind-map-save.png/1776711632589370",
    "selfLink": "https://www.googleapis.com/storage/v1/b/wasatch-wind-static/o/wind-map-save.png",
    "mediaLink": "https://storage.googleapis.com/download/storage/v1/b/wasatch-wind-static/o/wind-map-save.png?generation=1776711632589370&alt=media",
    "name": "wind-map-save.png",
    "bucket": "wasatch-wind-static",
    "generation": "1776711632589370",
    "metageneration": "2",
    "contentType": "image/png",
    "storageClass": "STANDARD",
    "size": "886194",
    "md5Hash": "JNK14hjJo5+XUoLIznz17A==",
    "crc32c": "l5+ezw==",
    "etag": "CLqk6s2O/ZMDEAI=",
    "timeCreated": "2026-04-20T19:00:32.611Z",
    "updated": "2026-04-20T19:00:32.812Z",
    "timeStorageClassUpdated": "2026-04-20T19:00:32.611Z",
    "timeFinalized": "2026-04-20T19:00:32.611Z"
  },
  "openMeteo": {
    "latitude": 40.764416,
    "longitude": -111.981255,
    "generationtime_ms": 0.4742145538330078,
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
        "2026-04-20T13:00",
        "2026-04-20T14:00",
        "2026-04-20T15:00",
        "2026-04-20T16:00",
        "2026-04-20T17:00",
        "2026-04-20T18:00",
        "2026-04-20T19:00",
        "2026-04-20T20:00",
        "2026-04-20T21:00",
        "2026-04-20T22:00",
        "2026-04-20T23:00",
        "2026-04-21T00:00"
      ],
      "geopotential_height_875hPa": [
        1233,
        1227,
        1228,
        1216,
        1213,
        1212,
        1214,
        1214,
        1215,
        1216,
        1219,
        1221
      ],
      "winddirection_875hPa": [
        215,
        220,
        240,
        230,
        223,
        225,
        226,
        189,
        182,
        178,
        173,
        175
      ],
      "windspeed_875hPa": [
        9,
        8.1,
        10.9,
        12.1,
        13,
        12.3,
        9.4,
        5.2,
        7.3,
        6.5,
        6.6,
        6.5
      ],
      "geopotential_height_850hPa": [
        1484,
        1479,
        1480,
        1469,
        1466,
        1465,
        1467,
        1466,
        1467,
        1467,
        1470,
        1471
      ],
      "winddirection_850hPa": [
        212,
        216,
        236,
        227,
        222,
        224,
        226,
        204,
        206,
        207,
        201,
        204
      ],
      "windspeed_850hPa": [
        11.7,
        10.1,
        13.7,
        15.2,
        16.6,
        16.4,
        14.2,
        12,
        18.2,
        17.1,
        14.5,
        13.9
      ],
      "geopotential_height_825hPa": [
        1741,
        1737,
        1738,
        1727,
        1724,
        1724,
        1726,
        1725,
        1725,
        1725,
        1728,
        1728
      ],
      "winddirection_825hPa": [
        210,
        213,
        233,
        225,
        220,
        223,
        225,
        210,
        213,
        218,
        224,
        229
      ],
      "windspeed_825hPa": [
        14.3,
        12,
        15.2,
        16.8,
        18.5,
        18.2,
        16.3,
        16.5,
        23.3,
        21.8,
        20.7,
        19.3
      ],
      "geopotential_height_800hPa": [
        2003,
        2000,
        2002,
        1991,
        1989,
        1988,
        1990,
        1990,
        1990,
        1990,
        1992,
        1992
      ],
      "winddirection_800hPa": [
        210,
        212,
        229,
        223,
        219,
        222,
        223,
        214,
        217,
        222,
        229,
        237
      ],
      "windspeed_800hPa": [
        16.1,
        13.5,
        16.5,
        18.2,
        19.7,
        19.6,
        17.8,
        19,
        24,
        22.4,
        22.5,
        22.5
      ],
      "geopotential_height_775hPa": [
        2272,
        2269,
        2272,
        2261,
        2259,
        2259,
        2261,
        2260,
        2260,
        2260,
        2262,
        2261
      ],
      "winddirection_775hPa": [
        213,
        210,
        225,
        221,
        218,
        222,
        222,
        216,
        221,
        224,
        231,
        239
      ],
      "windspeed_775hPa": [
        17.5,
        15.5,
        17.5,
        19,
        20.7,
        20.6,
        19,
        21,
        24.1,
        22.9,
        22.3,
        22.9
      ],
      "geopotential_height_750hPa": [
        2546,
        2544,
        2547,
        2537,
        2536,
        2535,
        2538,
        2537,
        2537,
        2537,
        2539,
        2537
      ],
      "winddirection_750hPa": [
        216,
        211,
        221,
        219,
        217,
        221,
        221,
        218,
        223,
        225,
        231,
        236
      ],
      "windspeed_750hPa": [
        18.2,
        16.8,
        18.3,
        19.8,
        21.1,
        21.7,
        20,
        22.3,
        23.9,
        22.9,
        21.6,
        22.5
      ],
      "geopotential_height_700hPa": [
        3116,
        3116,
        3120,
        3110,
        3109,
        3109,
        3112,
        3112,
        3112,
        3111,
        3113,
        3111
      ],
      "winddirection_700hPa": [
        225,
        214,
        215,
        214,
        214,
        217,
        219,
        221,
        225,
        225,
        225,
        222
      ],
      "windspeed_700hPa": [
        18.5,
        18.6,
        19.4,
        20.5,
        21.9,
        22.8,
        21.4,
        23.5,
        22.9,
        22.9,
        21.3,
        20.8
      ],
      "geopotential_height_625hPa": [
        4028,
        4030,
        4036,
        4027,
        4027,
        4027,
        4031,
        4031,
        4032,
        4031,
        4032,
        4029
      ],
      "winddirection_625hPa": [
        231,
        219,
        208,
        209,
        211,
        215,
        217,
        224,
        224,
        218,
        210,
        206
      ],
      "windspeed_625hPa": [
        20.7,
        20.1,
        20.2,
        21.1,
        22.6,
        24.7,
        24.2,
        25,
        23,
        24.5,
        26.6,
        25.1
      ],
      "wind_direction_10m": [
        191,
        188,
        262,
        201,
        211,
        224,
        233,
        169,
        178,
        135,
        143,
        150
      ],
      "wind_speed_10m": [
        13.5,
        11.1,
        12,
        12.3,
        13,
        12.8,
        10.9,
        5.9,
        6.7,
        7,
        7,
        6.7
      ]
    },
    "daily_units": {
      "time": "iso8601",
      "sunset": "iso8601",
      "temperature_2m_max": "°F"
    },
    "daily": {
      "time": [
        "2026-04-20"
      ],
      "sunset": [
        "2026-04-20T20:12"
      ],
      "temperature_2m_max": [
        81.1
      ]
    }
  }
}