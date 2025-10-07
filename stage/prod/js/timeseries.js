'use strict';

function timeSeries(data) {
  // Loop through all stations in the data to build wind charts
  data.forEach(station => {
    const readings = station.STID === "AMB" ? 6 : 12;
    // Set station elevation except for KSLC
    if (station.STID !== "KSLC") {
      const elevation = parseInt(station.ELEVATION).toLocaleString();
      const name = (stid) => {
        return Object.values(stationList).find(station => station.stid === stid).name;
      };
      const stationMain = document.getElementById(`${station.STID}-main`);
      const div = `
      <div class="align-items-end border-bottom d-flex justify-content-between pb-3">
        <div class="d-flex align-items-end">
          <div class="align-self-center display-1 text-warning" id="${station.STID}-toggle" onclick="toggleWindChart('${station.STID}')">&#43;</div>
          <div class="mx-4">
            <div class="display-6 fw-semibold text-start text-secondary"">${elevation}</div>
            <div class="display-3 text-info"">${name(station.STID)}</div>
          </div>
        </div>
        <div class="col-5 d-flex justify-content-between me-2">
          <div class="align-self-end display-6 fw-semibold text-secondary" id="${station.STID}-time-${readings}">No Data</div>
          <div class="col-2 display-4" id="${station.STID}-wdir-${readings}"></div>
          <div class="col-2 display-4 fw-semibold" id="${station.STID}-wspd-${readings}"></div>
          <div class="col-2 display-6 fw-semibold gust-color" id="${station.STID}-gust-${readings}"></div>
        </div>
      </div>
      <div class="bg-dark rounded-4">
        <div class="collapse" id="${station.STID}">
          <a href="https://www.weather.gov/wrh/timeseries?site=${station.STID}&hours=72" target="_blank">
            <div class="align-items-end d-flex" id="${station.STID}-chart"></div>
          </a>
        </div>
      </div>`;
      stationMain.innerHTML = div;
    }

    const chart = document.getElementById(`${station.STID}-chart`);
    for (let i = 0; i < readings; i++) {
      const div = document.createElement('div');
      div.className = 'col px-1';

      div.innerHTML = `
      <div class="gust-color h2" id="${station.STID}-gust-${i}">&nbsp;</div>
      <div class="bg-danger" id="${station.STID}-gbar-${i}"></div>
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
    buildWindChart(station.STID, station.OBSERVATIONS);
  });

  const kslcData = data.find(station => station.STID === "KSLC");
  if (kslcData) getZone(kslcData.OBSERVATIONS.altimeter_set_1, kslcData.OBSERVATIONS.air_temp_set_1);
  document.getElementById('wind-charts-div').style.display = 'block';
};

function buildWindChart(stid, data) {
  const sliceLength = stid === 'AMB' ? 6 : 12;
  const requiredKeys = ['date_time', 'wind_direction_set_1', 'wind_speed_set_1', 'wind_gust_set_1'];

  // Ensure station data arrays are the correct length
  Object.keys(data).forEach(key => {
    if (data[key].length < sliceLength) {
      const emptyArray = new Array(sliceLength - data[key].length).fill(null);
      data[key] = emptyArray.concat(data[key]);
    } else {
      data[key] = data[key].slice(-sliceLength);
    };
  });

  // Ensure all stations have wind direction, speed, and gust data, even if null
  requiredKeys.forEach(key => {
    if (!data[key]) {
      data[key] = new Array(sliceLength).fill(null);
    };
    // Duplicate last data point for main chart display
    data[key].push(data[key][data[key].length - 1]);
  });

  windChartTime(stid, data.date_time);
  windChartDirection(stid, data.wind_direction_set_1);
  windChartSpeed(stid, data.wind_speed_set_1);
  windChartGust(stid, data.wind_gust_set_1);
  windChartBarHeight(stid, data.wind_speed_set_1, data.wind_gust_set_1);
  windChartBarColor(stid, data.wind_speed_set_1);
};

function windChartTime(stid, time) {
  const formattedTime = time.map(d => d ? d.slice(0, -3).toLowerCase() : d);
  formattedTime.forEach((t, i) => {
    if (stid === 'KSLC' && i === formattedTime.length - 1) {
      t = `${t} KSLC`;
    };
    document.getElementById(`${stid}-time-${i}`).innerHTML = t;
  });
};

function windChartDirection(stid, wdir) {
  const wimg = wdir.map(d => d ? '&#10148;' : '&nbsp;');
  const rotate = wdir.map(d => `rotate(${d + 90}deg)`);
  wdir.forEach((direction, i) => {
    const element = document.getElementById(`${stid}-wdir-${i}`);
    element.innerHTML = wimg[i];
    element.style.transform = rotate[i];
  });
};

function windChartSpeed(stid, wspd) {
  const formattedSpeeds = wspd.map(d => d === null ? '&nbsp;' : d < 0.5 ? 'Calm' : Math.round(d));
  formattedSpeeds.forEach((speed, i) => {
    const element = document.getElementById(`${stid}-wspd-${i}`);
    if (speed === 'Calm') {
      if (i === formattedSpeeds.length - 1) {
        element.className = stid === 'KSLC' ? '' : 'align-self-end fs-1 text-center';
      } else {
        element.className = 'fs-3 fw-normal';
      };
    };
    element.innerHTML = speed;
  });
};

function windChartGust(stid, gust) {
  const formattedGust = gust.map(d => d ? `g${Math.round(d)}` : '&nbsp;');
  formattedGust.forEach((gust, i) => {
    document.getElementById(`${stid}-gust-${i}`).innerHTML = gust;
  });
};

function windChartBarHeight(stid, wspd, gust) {
  const multiplier = Math.max(...gust) > 30 ? 1.3 : 4;
  wspd.pop();
  gust.pop();
  wspd.forEach((speed, i) => {
    const wbarElement = document.getElementById(`${stid}-wbar-${i}`);
    const gbarElement = document.getElementById(`${stid}-gbar-${i}`);
    wbarElement.className = speed ? 'border-1 border' : '';
    wbarElement.style.height = `${speed * multiplier}px`;
    gbarElement.style.height = `${(gust[i] - speed) * multiplier}px`;
  });
};

function windChartBarColor(stid, data) {
  const highStations = ['REY', 'AMB', 'HDP', 'OGP'];
  const yellow = highStations.includes(stid) ? 20 : stid === 'FPS' ? 15 : 10;
  const red = highStations.includes(stid) ? 30 : 20;
  const barColors = data.map(d => {
    if (d > yellow && d < red) {
      return 'var(--bs-yellow)';
    } else if (d >= red) {
      return 'var(--bs-orange)';
    } else {
      return 'var(--bs-teal)';
    };
  });
  barColors.forEach((color, i) => {
    document.getElementById(`${stid}-wbar-${i}`).style.backgroundColor = color;
  });
};

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
      zone.col = 'var(--bs-red)';
      break;
    case 1:
    case 6:
      zone.col = 'var(--bs-orange)';
      break;
    case 2:
    case 5:
      zone.col = 'var(--bs-yellow)';
      break;
    case 3:
      if (alti === currentZones[3]) {
        zone.num = 'LoP';
      };
      zone.col = 'var(--bs-teal)';
      break;
    default:
      zone.col = 'var(--bs-teal)';
  };
  if (zone.num !== 'LoP') {
    zone.num = zone.num === 0 ? '&#9471;' : `&#1010${zone.num + 1};`;
  };
  return zone;
};

function getZone(alti, temp, trendChar) {
  const zone = calculateZone(alti[alti.length - 1], temp[temp.length - 1]);
  const altiDiff = Math.round((alti[alti.length - 1] - alti[0]) * 100) / 100;
  if (altiDiff > 0.01) {
    trendChar = '&uarr;&uarr;';
  } else if (altiDiff > 0) {
    trendChar = '&uarr;';
  } else if (altiDiff < -0.01) {
    trendChar = '&darr;&darr;';
  } else if (altiDiff < 0) {
    trendChar = '&darr;';
  } else {
    trendChar = '';
  };
  document.getElementById('temp').innerHTML = Math.round(temp[temp.length - 1]);
  document.getElementById('alti').innerHTML = alti[alti.length - 1].toFixed(2);
  document.getElementById('trend').innerHTML = trendChar;
  document.getElementById('zone').innerHTML = zone.num;
  document.getElementById('zone').style.color = zone.col;
};