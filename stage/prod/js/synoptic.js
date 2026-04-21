"use strict";

function processSynoptic(data) {
  const kslcDiv = {
    elementId: "KSLC-main",
    href: "https://www.weather.gov/wrh/timeseries?site=KSLC&hours=72",
    title: "KSLC",
    style: `align-items-end bg-dark d-flex rounded-4" id="KSLC-chart`
  };
  standardHtmlComponent(kslcDiv);

  const stations = stationList();
  stations.push({ id: "KSLC" });

  const container = document.getElementById("wind-charts");
  container.innerHTML = "";

  stations.forEach(station => {
    const stationData = data.find(d => d.STID === station.id);
    const readingCount = stationData.STID === "AMB" ? 6 : 12;

    if (station.id !== "KSLC") { // KSLC does not have an expandable chart
      const elevation = parseInt(stationData.ELEVATION).toLocaleString();
      const stationDiv = document.createElement("div");

      stationDiv.innerHTML = `
        <div class="align-items-end border-bottom d-flex justify-content-between pb-3 station-header">
          <div class="d-flex align-items-end">
            <div class="align-self-center display-1 text-warning" id="${stationData.STID}-toggle">&#43;</div>
            <div class="mx-4">
              <div class="display-6 fw-semibold text-start text-secondary">${elevation}</div>
              <div class="display-3 text-info">${station.name}</div>
            </div>
          </div>
          <div class="col-6 d-flex justify-content-between me-2">
            <div class="align-self-end display-6 fw-semibold text-secondary" id="${stationData.STID}-time-${readingCount}">No Data</div>
            <div class="col-2 display-2" id="${stationData.STID}-wdir-${readingCount}"></div>
            <div class="col-2 display-4 fw-semibold rounded-4 text-center" id="${stationData.STID}-wspd-${readingCount}"></div>
            <div class="col-2 display-6 fw-semibold gust-color" id="${stationData.STID}-gust-${readingCount}"></div>
          </div>
        </div>

        <div class="bg-dark rounded-4">
          <div class="collapse" id="${stationData.STID}">
            <a href="https://www.weather.gov/wrh/timeseries?site=${stationData.STID}&hours=72" target="_blank">
              <div class="align-items-end d-flex" id="${stationData.STID}-chart"></div>
            </a>
          </div>
        </div>`;

      container.appendChild(stationDiv);
      stationDiv.querySelector(".station-header").addEventListener("click", () => toggleWindChart(stationData.STID));
    }

    const chart = document.getElementById(`${stationData.STID}-chart`);

    for (let i = 0; i < readingCount; i++) {
      const div = document.createElement("div");
      div.className = "col px-1";
      div.innerHTML = `
        <div class="gust-color h2" id="${stationData.STID}-gust-${i}">&nbsp;</div>
        <div class="gust-bar" id="${stationData.STID}-gbar-${i}"></div>
        <div id="${stationData.STID}-wbar-${i}"></div>
        <div class="bg-secondary fs-1 fw-bold" id="${stationData.STID}-wspd-${i}"></div>
        <div class="display-4" id="${stationData.STID}-wdir-${i}"></div>
        <div class="fs-4" id="${stationData.STID}-time-${i}"></div>`;

      chart.appendChild(div);
    }

    function toggleWindChart(id) { // Wind chart toggle expand/collapse for each station (Now page)
      const element = document.getElementById(id);
      const toggle = document.getElementById(`${id}-toggle`);
      const isHidden = element.classList.toggle("collapse");

      toggle.textContent = isHidden ? "+" : "−"; // Use minus sign instead of hyphen for spacing consistency
    }

    buildWindChart(stationData.STID, stationData.OBSERVATIONS, readingCount, stationData.ELEVATION);
  });

  const kslcData = data.find(station => station.STID === "KSLC");
  getZone(kslcData.OBSERVATIONS.altimeter_set_1, kslcData.OBSERVATIONS.air_temp_set_1);
}



/////////////////////////////////////////////
// Inject wind chart data for each station //
/////////////////////////////////////////////
function buildWindChart(stid, data, readingCount, altitude) {
  const requiredKeys = ["date_time", "wind_direction_set_1", "wind_speed_set_1", "wind_gust_set_1"];

  // Ensure station data arrays are the correct length (6 or 12)
  Object.keys(data).forEach(key => {
    if (data[key].length < readingCount) {
      const emptyArray = new Array(readingCount - data[key].length).fill(null);
      data[key] = emptyArray.concat(data[key]);
    } else data[key] = data[key].slice(-readingCount);
  });

  // Ensure all stations have wind direction, speed, and gust data, even if null
  requiredKeys.forEach(key => {
    if (!data[key]) data[key] = new Array(readingCount).fill(null);
    data[key].push(data[key][data[key].length - 1]); // Duplicate last data point for main chart display (non-expandable heading)
  });

  // Round wind speed and gust speeds
  const speedData = data.wind_speed_set_1.map(d => d === null ? "&nbsp;" : d < 0.5 ? "Calm" : Math.round(d));
  const gustData = data.wind_gust_set_1.map(d => d === null ? "&nbsp;" : Math.round(d));

  windChartTime(stid, data.date_time);
  windChartDirection(stid, data.wind_direction_set_1);
  windChartSpeed(stid, speedData, altitude);
  windChartGust(stid, gustData);
  windChartBarHeight(stid, speedData, gustData);
  windChartBarColor(stid, speedData, altitude);
}

function windChartTime(stid, times) {
  times.forEach((time, i) => {
    const element = document.getElementById(`${stid}-time-${i}`);
    time = time.slice(0, -3).toLowerCase();
    if (stid === "KSLC" && i === times.length - 1) time = `${time} KSLC`;
    element.textContent = time;
  });
}

function windChartDirection(stid, directions) {
  directions.forEach((direction, i) => {
    const element = document.getElementById(`${stid}-wdir-${i}`);
    element.innerHTML = direction ? "&#10148;" : "&nbsp;";
    element.style.transform = `rotate(${direction + 90}deg)`;
  });
}

function windChartSpeed(stid, speeds, altitude) {
  speeds.forEach((speed, i) => {
    const element = document.getElementById(`${stid}-wspd-${i}`);

    if (speed === "Calm") {
      if (i === speeds.length - 1) element.className = stid === "KSLC" ? "" : "align-self-end fs-2 fw-semibold px-1 py-3 rounded-4 text-center";
      else element.className = "fs-3 fw-normal";
    }

    const speedToNumber = typeof (speed) === "number" ? speed : 0;
    const speedColor = windSpeedColor(speedToNumber, Math.round(Number(altitude) / 1000));
    if (i === speeds.length - 1 && stid !== "KSLC") element.style.backgroundColor = speedColor;

    element.innerHTML = speed;
  });
}

function windChartGust(stid, gust) {
  gust.forEach((gust, i) => {
    const element = document.getElementById(`${stid}-gust-${i}`);
    element.innerHTML = gust === "&nbsp;" ? gust : `g${gust}`;
  });
}

function windChartBarHeight(stid, speeds, gusts) {
  // Remove duplicate last reading since station main row has no wind bar
  speeds.pop();
  gusts.pop();

  const wspdMax = Math.max(...speeds.filter(d => typeof d === "number"));
  const gustMax = Math.max(...gusts) || 0;

  let heightModifier = 12; // Standard pixel multiplier (no gusts, wind <= 10), shrink size incrementally as wind speed gets higher
  if (wspdMax > 10 || gustMax > 10) heightModifier = 8;
  if (wspdMax > 25 || gustMax > 20) heightModifier = 4;
  if (wspdMax > 40 || gustMax > 35) heightModifier = 3;

  speeds.forEach((speed, i) => {
    const wbarElement = document.getElementById(`${stid}-wbar-${i}`);
    const gbarElement = document.getElementById(`${stid}-gbar-${i}`);
    wbarElement.style.height = `${speed * heightModifier}px`;
    gbarElement.style.height = `${(gusts[i] - speed) * heightModifier}px`;
  });
}

function windChartBarColor(stid, speeds, altitude) {
  const barColors = windSpeedColor(speeds, Math.round(Number(altitude) / 1000));
  barColors.forEach((color, i) => {
    const element = document.getElementById(`${stid}-wbar-${i}`);
    element.style.backgroundColor = color;
  });
}

function calculateZone(pressure, temp) {
  const zones = [
    { slope: -0.000555, intercept: 29.9167 },
    { slope: -0.001111, intercept: 30.0111 },
    { slope: -0.001666, intercept: 30.1083 },
    { slope: -0.003000, intercept: 30.2700 },
    { slope: -0.004286, intercept: 30.4286 },
    { slope: -0.004933, intercept: 30.5327 },
    { slope: -0.005500, intercept: 30.6425 },
    { slope: 99, intercept: 99 }
  ];

  const zonePressureLimits = zones.map(({ slope, intercept }) =>
    Math.round((slope * temp + intercept) * 100) / 100
  );

  let zoneIndex = zonePressureLimits.findIndex(zone => zone >= pressure); // Find the first zone at or above the altitude
  if (zoneIndex === 3 && pressure === zonePressureLimits[3]) zoneIndex = "LoP";

  return zoneIndex;
}

function getZone(alti, temp, trendChar) {
  const zone = calculateZone(alti[alti.length - 1], temp[temp.length - 1]);
  const altiDiff = Math.round((alti[alti.length - 1] - alti[0]) * 100) / 100;

  if (altiDiff > 0.01) trendChar = "&nbsp;&nbsp;&uarr;&uarr;";
  else if (altiDiff > 0) trendChar = "&nbsp;&nbsp;&uarr;";
  else if (altiDiff < -0.01) trendChar = "&nbsp;&nbsp;&darr;&darr;";
  else if (altiDiff < 0) trendChar = "&nbsp;&nbsp;&darr;";
  else trendChar = "";

  document.getElementById("alti").textContent = alti[alti.length - 1].toFixed(2);
  document.getElementById("temp").innerHTML = `${Math.round(temp[temp.length - 1])}` + "&nbsp;/&nbsp;";
  document.getElementById("trend").innerHTML = trendChar;
  document.getElementById("zone").src = `prod/images/zones/zone${zone}.png`;
}