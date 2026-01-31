"use strict";

function processSynoptic(data) {

  // Loop through all stations in the data to build wind charts (sometimes stations are down)
  data.forEach(station => {
    const readingCount = station.STID === "AMB" ? 6 : 12; // Only 6 historical readings needed for infrequently reporting stations

    // Exclude KSLC in the build loop since it's handled separately from the rest
    if (station.STID !== "KSLC") {
      const elevation = parseInt(station.ELEVATION).toLocaleString();
      const stationMain = document.getElementById(`${station.STID}-main`);
      stationMain.innerHTML = `
      <div class="align-items-end border-bottom d-flex justify-content-between pb-3" onclick="toggleWindChart('${station.STID}')">
        <div class="d-flex align-items-end">
          <div class="align-self-center display-1 text-warning" id="${station.STID}-toggle">&#43;</div>
          <div class="mx-4">
            <div class="display-6 fw-semibold text-start text-secondary"">${elevation}</div>
            <div class="display-3 text-info"">${stationList[station.STID].name}</div>
          </div>
        </div>
        <div class="col-6 d-flex justify-content-between me-2">
          <div class="align-self-end display-6 fw-semibold text-secondary" id="${station.STID}-time-${readingCount}">No Data</div>
          <div class="col-2 display-2" id="${station.STID}-wdir-${readingCount}"></div>
          <div class="col-2 display-4 fw-semibold rounded-4 text-center" id="${station.STID}-wspd-${readingCount}"></div>
          <div class="col-2 display-6 fw-semibold gust-color" id="${station.STID}-gust-${readingCount}"></div>
        </div>
      </div>
      <div class="bg-dark rounded-4">
        <div class="collapse" id="${station.STID}">
          <a href="https://www.weather.gov/wrh/timeseries?site=${station.STID}&hours=72" target="_blank">
            <div class="align-items-end d-flex" id="${station.STID}-chart"></div>
          </a>
        </div>
      </div>`;
    }

    const chart = document.getElementById(`${station.STID}-chart`);
    for (let i = 0; i < readingCount; i++) {
      const div = document.createElement("div");
      div.className = "col px-1";
      div.innerHTML = `
      <div class="gust-color h2" id="${station.STID}-gust-${i}">&nbsp;</div>
      <div class="gust-bar" id="${station.STID}-gbar-${i}"></div>
      <div id="${station.STID}-wbar-${i}"></div>
      <div class="bg-secondary fs-1 fw-bold">
        <div id="${station.STID}-wspd-${i}"></div>
      </div>
      <div>
        <div class="display-4" id="${station.STID}-wdir-${i}"></div>
      </div>
      <div class="fs-4" id="${station.STID}-time-${i}"></div>`;
      chart.appendChild(div);
    }
    buildWindChart(station.STID, station.OBSERVATIONS, readingCount, station.ELEVATION);
  });

  // Build KSLC (main station & marquee)
  const kslcData = data.find(station => station.STID === "KSLC");
  getZone(kslcData.OBSERVATIONS.altimeter_set_1, kslcData.OBSERVATIONS.air_temp_set_1);
  document.getElementById("wind-charts-div").style.display = "block";
}



///////////////////////////////////////
// Build wind chart for each station //
///////////////////////////////////////
function buildWindChart(stid, data, readingCount, altitude) {
  const requiredKeys = ["date_time", "wind_direction_set_1", "wind_speed_set_1", "wind_gust_set_1"];

  // Ensure station data arrays are the correct length
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

function windChartTime(stid, time) {
  const formattedTime = time.map(d => d ? d.slice(0, -3).toLowerCase() : d);
  formattedTime.forEach((t, i) => {
    if (stid === "KSLC" && i === formattedTime.length - 1) t = `${t} KSLC`;
    document.getElementById(`${stid}-time-${i}`).innerHTML = t;
  });
}

function windChartDirection(stid, wdir) {
  const wimg = wdir.map(d => d ? "&#10148;" : "&nbsp;");
  const rotate = wdir.map(d => `rotate(${d + 90}deg)`);
  wdir.forEach((direction, i) => {
    const element = document.getElementById(`${stid}-wdir-${i}`);
    element.innerHTML = wimg[i];
    element.style.transform = rotate[i];
  });
}

function windChartSpeed(stid, wspd, altitude) {
  wspd.forEach((speed, i) => {
    const element = document.getElementById(`${stid}-wspd-${i}`);
    if (speed === "Calm") {
      if (i === wspd.length - 1) element.className = stid === "KSLC" ? "" : "align-self-end fs-2 fw-semibold p-3 rounded-4 text-center";
      else element.className = "fs-3 fw-normal";
    }
    element.innerHTML = speed;

    // !!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!
    // Also class rounded-4 above
    const test = typeof(speed) === "number" ? speed : 0;
    const test1 = windSpeedColor(test, Math.round(Number(altitude) / 1000));
    if (i === wspd.length - 1 && stid !== "KSLC") element.style.backgroundColor = test1;

  });
}

function windChartGust(stid, gust) {
  gust.forEach((gust, i) => {
    document.getElementById(`${stid}-gust-${i}`).innerHTML = gust === "&nbsp;" ? gust : `g${gust}`;
  });
}

function windChartBarHeight(stid, wspd, gust) {
  // Remove duplicate last reading since it's only used for the station heading which has no wind bar
  wspd.pop();
  gust.pop();

  const wspdMax = Math.max(...wspd.filter(d => typeof d === "number"));
  const gustMax = Math.max(...gust) || 0;

  let heightModifier = 12; // Standard pixel multiplier (no gusts, wind <= 10)
  if (wspdMax > 10 || gustMax > 10) heightModifier = 8;
  if (wspdMax > 25 || gustMax > 20) heightModifier = 4;
  if (wspdMax > 40 || gustMax > 35) heightModifier = 3;

  wspd.forEach((speed, i) => {
    const wbarElement = document.getElementById(`${stid}-wbar-${i}`);
    const gbarElement = document.getElementById(`${stid}-gbar-${i}`);
    wbarElement.style.height = `${speed * heightModifier}px`;
    gbarElement.style.height = `${(gust[i] - speed) * heightModifier}px`;
  });
}

function windChartBarColor(stid, wspd, altitude) {
  const barColors = windSpeedColor(wspd, Math.round(Number(altitude) / 1000));
  barColors.forEach((color, i) => {
    document.getElementById(`${stid}-wbar-${i}`).style.backgroundColor = color;
  });
}

function calculateZone(alti, temp, currentZones = [], zone = {}) {
  const zoneSlope = [-0.000555, -0.001111, -0.001666, -0.003, -0.004286, -0.004933, -0.0055, 99];
  const zoneIntercept = [29.9167, 30.0111, 30.1083, 30.27, 30.4286, 30.5327, 30.6425, 99];
  zoneSlope.forEach((slope, i) => {
    currentZones.push(Math.round((slope * temp + zoneIntercept[i]) * 100) / 100);
  });
  zone.num = currentZones.findIndex(d => d >= alti);

  switch (zone.num) {
    case 0:
    case 7:
      zone.col = red;
      break;
    case 1:
    case 6:
      zone.col = orange;
      break;
    case 2:
    case 5:
      zone.col = yellow;
      break;
    case 3:
      if (alti === currentZones[3]) zone.num = "LoP";
      zone.col = green;
      break;
    default:
      zone.col = green;
  }

  if (zone.num !== "LoP") zone.num = zone.num === 0 ? "&#9471;" : `&#1010${zone.num + 1};`;
  return zone;
}

function getZone(alti, temp, trendChar) {
  const zone = calculateZone(alti[alti.length - 1], temp[temp.length - 1]);
  const altiDiff = Math.round((alti[alti.length - 1] - alti[0]) * 100) / 100;

  if (altiDiff > 0.01) trendChar = "&uarr;&uarr;";
  else if (altiDiff > 0) trendChar = "&uarr;";
  else if (altiDiff < -0.01) trendChar = "&darr;&darr;";
  else if (altiDiff < 0) trendChar = "&darr;";
  else trendChar = "";

  document.getElementById("temp").innerHTML = Math.round(temp[temp.length - 1]);
  document.getElementById("alti").innerHTML = alti[alti.length - 1].toFixed(2);
  document.getElementById("trend").innerHTML = trendChar;
  document.getElementById("zone").innerHTML = zone.num;
  document.getElementById("zone").style.color = zone.col;

}


