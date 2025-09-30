'use strict';

// -------------------------
// Helpers for ID normalization
// -------------------------
const getShortPrefix = prefix => prefix.startsWith('altitude_') ? prefix.slice(-3) : prefix;

// -------------------------
// Dynamic HTML Generation
// -------------------------

function createWindAloftRow({ label, prefix, startIdx = 0, count = 6, hasGeoHeight = false, groupId }) {
  const row = document.createElement('div');
  row.className = 'border-bottom border-secondary d-flex';

  const leftCol = document.createElement('div');
  leftCol.className = 'col text-start';
  if (hasGeoHeight) {
    leftCol.innerHTML = `
      <div class="display-5 text-info" id="geopotential_height_${prefix}-group${groupId}"></div>
      <div class="fs-2 fw-semibold text-secondary">${label}</div>`;
  } else {
    leftCol.innerHTML = `<div class="display-5 text-info">${label}</div>`;
  }
  row.appendChild(leftCol);

  for (let i = 0; i < count; i++) {
    const idx = startIdx + i;
    const shortPrefix = getShortPrefix(prefix);
    const cell = document.createElement('div');
    cell.className = 'border-1 border-secondary border-start col d-flex align-items-center';
    // NOTE: wrapper uses the SHORT prefix (e.g. "18k-0", "550hPa-0", "surfac-0")
    cell.id = `${shortPrefix}-${idx}`;
    // inner elements keep the full-key-based IDs (these are what the update functions expect)
    cell.innerHTML = `
      <img class="col-8" id="winddirection_${prefix}-${idx}">
      <div class="align-self-start col-4 fs-2 fw-semibold pe-2 text-end" id="windspeed_${prefix}-${idx}"></div>`;
    row.appendChild(cell);
  }

  return row;
}

function generateWindAloftGroupRows(groupId) {
  const container = document.getElementById(`wind-aloft-group${groupId}-rows`);
  const startIdx = groupId === 0 ? 0 : 6;
  const levels = [
    { label: '18,000', prefix: 'altitude_18k' },
    { label: '550 hPa', prefix: '550hPa', hasGeoHeight: true },
    { label: '600 hPa', prefix: '600hPa', hasGeoHeight: true },
    { label: '12,000', prefix: 'altitude_12k' },
    { label: '650 hPa', prefix: '650hPa', hasGeoHeight: true },
    { label: '700 hPa', prefix: '700hPa', hasGeoHeight: true },
    { label: '9,000', prefix: 'altitude_09k' },
    { label: '750 hPa', prefix: '750hPa', hasGeoHeight: true },
    { label: '800 hPa', prefix: '800hPa', hasGeoHeight: true },
    { label: '850 hPa', prefix: '850hPa', hasGeoHeight: true },
    { label: 'Surface', prefix: 'surfac' }
  ];

  levels.forEach(level => container.appendChild(createWindAloftRow({ ...level, startIdx, groupId })));

  const timeRow = document.createElement('div');
  timeRow.className = 'align-items-center d-flex display-5 text-info';
  timeRow.innerHTML = `
    <div class="col text-info text-start"></div>
    ${Array.from({ length: 6 }, (_, i) =>
    `<div class="border-1 border-secondary border-start col" id="windaloft-time-${startIdx + i}"></div>`
  ).join('')}`;
  const old = document.getElementById(`windaloft-times-${groupId}`);
  if (old && old.parentNode) old.parentNode.replaceChild(timeRow, old);
  else if (old) old.replaceWith(timeRow);
}

function generateWindAloftLongtermRows() {
  const container = document.getElementById('wind-aloft-longterm-rows');
  // We create wrappers using the SHORT prefix so gcpWindAloftRows (which uses last 3 chars)
  // can find the wrapper when called with i='longterm'
  ['18k', '12k', '09k'].forEach(short => {
    const row = document.createElement('div');
    row.className = 'align-items-center border border-bottom d-flex display-3 justify-content-center';
    row.id = `${short}-longterm`;
    const label = short === '09k' ? '9,000' : short === '12k' ? '12,000' : '18,000';
    row.innerHTML = `
      <div class="col-3">${label}</div>
      <img class="col-1" id="winddirection_altitude_${short}-longterm">
      <div class="col-2 fw-semibold" id="windspeed_altitude_${short}-longterm"></div>`;
    container.appendChild(row);
  });
}

document.addEventListener('DOMContentLoaded', () => {
  generateWindAloftGroupRows(0);
  generateWindAloftGroupRows(1);
  generateWindAloftLongtermRows();
});


// URL builder
function buildAPIURL(params, repeatKeys = []) {
  const query = new URLSearchParams();
  for (const [key, value] of Object.entries(params)) {
    const isArray = Array.isArray(value);
    const isRepeat = repeatKeys.includes(key);
    if (isArray && isRepeat) value.forEach(v => query.append(key, v));
    else query.set(key, isArray ? value.join(',') : value);
  }
  return query.toString();
}

function windAloft(openmeteoData, gcpWindAloftData) {
  openmeteoWindAloft(openmeteoData);
  gcpWindAloft(gcpWindAloftData);
  const container = document.getElementById('wind-aloft-div');
  if (container) container.style.display = 'block';
}

function windAloftColor(windspeed, maxspeed) {
  const colors = {
    green: '#10654c',
    yellow: '#806104',
    orange: '#7f3f0a',
    red: '#6e1b23'
  };
  if (windspeed < maxspeed - 12) return colors.green;
  else if (windspeed < maxspeed - 6) return colors.yellow;
  else if (windspeed < maxspeed) return colors.orange;
  else return colors.red;
}

function openmeteoWindAloft(data, redLimit = 22) {
  const updateElementHTML = (id, value) => {
    const el = document.getElementById(id);
    if (el) el.innerHTML = value;
  };
  const updateElementStyle = (id, property, value) => {
    const el = document.getElementById(id);
    if (el) el.style[property] = value;
  };
  const updateImageSource = (id, src) => {
    const el = document.getElementById(id);
    if (el) el.src = src;
  };

  // normalize names to match the wind-aloft ids we generate
  if (data['wind_speed_10m']) {
    data['windspeed_surfac'] = data['wind_speed_10m'];
    delete data['wind_speed_10m'];
  }
  if (data['wind_direction_10m']) {
    data['winddirection_surfac'] = data['wind_direction_10m'];
    delete data['wind_direction_10m'];
  }

  for (const [key, value] of Object.entries(data)) {
    if (key.startsWith('geopotential')) {
      for (let i = 0; i < 2; i++) {
        const geoPotenitalArray = value.slice(i * 6, i * 6 + 5);
        const geoPotentialMean = geoPotenitalArray.reduce((a, b) => a + b) / geoPotenitalArray.length;
        const geoPotentialHeight = Math.round(geoPotentialMean * 3.28084).toLocaleString();
        updateElementHTML(`${key}-group${i}`, geoPotentialHeight);
      }
    }
    if (key.startsWith('winddirection')) {
      value.forEach((direction, i) => {
        updateElementStyle(`${key}-${i}`, 'transform', `rotate(${direction}deg)`);
      });
    }
    if (key.startsWith('time')) {
      value.forEach((timestamp, i) => {
        const time = new Date(timestamp).toLocaleTimeString('en-us', { hour: 'numeric' }).toLowerCase();
        updateElementHTML(`windaloft-time-${i}`, time);
      });
    }
    if (key.startsWith('windspeed')) {
      value.forEach((speed, i) => {
        const windspeed = Math.round(speed);
        const barb = windspeed > 45 ? 50 : Math.ceil(windspeed / 5) * 5;
        if (key.includes('surfac')) {
          redLimit = 22;
        }
        // derive wrapper short id from the key suffix (safe approach)
        const suffix = key.slice(10); // e.g. '550hPa' or 'surfac'
        updateElementStyle(`${suffix}-${i}`, 'backgroundColor', windAloftColor(windspeed, redLimit));
        updateElementHTML(`${key}-${i}`, windspeed);
        updateImageSource(`winddirection_${suffix}-${i}`, `prod/images/barbs/barb${barb}.png`);
        if (suffix.slice(0, 3) <= 70 && i === 5) {
          redLimit += 2.5;
        }
      });
    }
  }
}

function gcpWindAloftRows(i, windspeed, winddirection, redlimit = 22, accelerator = 0) {
  for (const [key, value] of Object.entries(windspeed)) {
    const barb = value > 45 ? 50 : Math.ceil(value / 5) * 5;
    const wrapperId = `${getShortPrefix(key)}-${i}`; // e.g. "18k-0" or "550hPa-0"
    const speedId = `windspeed_${key}-${i}`;         // e.g. "windspeed_altitude_18k-0"
    const dirId = `winddirection_${key}-${i}`;       // e.g. "winddirection_altitude_18k-0"

    const wrapperEl = document.getElementById(wrapperId);
    if (wrapperEl) wrapperEl.style.backgroundColor = windAloftColor(value, redlimit);

    const speedEl = document.getElementById(speedId);
    if (speedEl) speedEl.innerHTML = value;

    const dirEl = document.getElementById(dirId);
    if (dirEl) dirEl.src = `prod/images/barbs/barb${barb}.png`;

    accelerator += 3;
    redlimit += accelerator;
  }
  for (const [key, value] of Object.entries(winddirection)) {
    const dirEl = document.getElementById(`winddirection_${key}-${i}`);
    if (dirEl && value !== null && value !== undefined) dirEl.style.transform = `rotate(${value}deg)`;
  }
}

function windAloftLongtermTime(time, offset) {
  const adjustedTime = time - offset;
  if (adjustedTime === 0) return 'Midnight';
  if (adjustedTime === 12) return 'Noon';
  return `${Math.abs(adjustedTime)}${adjustedTime < 0 ? 'pm' : 'am'}`;
}

function gcpWindAloft(data) {
  const timezoneOffset = now.getTimezoneOffset() / 60;
  const forecast06hEnd = (data.forecast_06h.end_time - timezoneOffset + 24) % 24;
  for (let i = 0; i < 12; i++) {
    const timeslot = now.getHours() + i;
    if (timeslot < forecast06hEnd) {
      gcpWindAloftRows(i, data.forecast_06h.wind_speed, data.forecast_06h.wind_direction);
    } else {
      gcpWindAloftRows(i, data.forecast_12h.wind_speed, data.forecast_12h.wind_direction);
    }
  }
  const longtermStartTime = windAloftLongtermTime(data.forecast_24h.start_time, timezoneOffset);
  const longtermEndTime = windAloftLongtermTime(data.forecast_24h.end_time, timezoneOffset);
  const el = document.getElementById('wind-aloft-time-longterm');
  if (el) el.innerHTML = `Wind Aloft ${longtermStartTime} - ${longtermEndTime}`;
  gcpWindAloftRows('longterm', data.forecast_24h.wind_speed, data.forecast_24h.wind_direction);
}