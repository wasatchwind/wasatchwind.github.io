'use strict';

function windAloft(openmeteoData, gcpWindAloftData) {
  openmeteoWindAloft(openmeteoData);
  gcpWindAloft(gcpWindAloftData);
  document.getElementById('wind-aloft-div').style.display = 'block';
};

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
};

function openmeteoWindAloft(data, redLimit = 22) {
  const updateElementHTML = (id, value) => {
    document.getElementById(id).innerHTML = value;
  };
  const updateElementStyle = (id, property, value) => {
    document.getElementById(id).style[property] = value;
  };
  const updateImageSource = (id, src) => {
    document.getElementById(id).src = src;
  };
  data['windspeed_surfac'] = data['wind_speed_10m']; // revisit how the element names work here? vvv
  delete data['wind_speed_10m'];
  data['winddirection_surfac'] = data['wind_direction_10m'];
  delete data['wind_direction_10m'];
  for (const [key, value] of Object.entries(data)) {
    if (key.startsWith('geopotential')) {
      for (let i = 0; i < 2; i++) {
        const geoPotenitalArray = value.slice(i * 6, i * 6 + 5);
        const geoPotentialMean = geoPotenitalArray.reduce((a, b) => a + b) / geoPotenitalArray.length;
        const geoPotentialHeight = Math.round(geoPotentialMean * ftPerMeter).toLocaleString();
        updateElementHTML(`${key}-group${i}`, geoPotentialHeight);
      };
    };
    if (key.startsWith('winddirection')) {
      value.forEach((direction, i) => {
        updateElementStyle(`${key}-${i}`, 'transform', `rotate(${direction}deg)`);
      });
    };
    if (key.startsWith('time')) {
      value.forEach((timestamp, i) => {
        const time = new Date(timestamp).toLocaleTimeString('en-us', { hour: 'numeric' }).toLowerCase();
        updateElementHTML(`windaloft-time-${i}`, time);
      });
    };
    if (key.startsWith('windspeed')) {
      value.forEach((speed, i) => {
        const windspeed = Math.round(speed);
        const barb = windspeed > 45 ? 50 : Math.ceil(windspeed / 5) * 5;
        if (key.includes('surfac')) {
          redLimit = 22;
        };
        updateElementStyle(`${key.slice(10, 16)}-${i}`, 'backgroundColor', windAloftColor(windspeed, redLimit));
        updateElementHTML(`${key}-${i}`, windspeed);
        updateImageSource(`winddirection_${key.slice(10, 16)}-${i}`, `prod/images/barbs/barb${barb}.png`);
        if (key.slice(10, 12) <= 70 && i === 5) {
          redLimit += 2.5;
        };
      });
    };
  };
};

function gcpWindAloftRows(i, windspeed, winddirection, redlimit = 22, accelerator = 0) {
  for (const [key, value] of Object.entries(windspeed)) {
    const barb = value > 45 ? 50 : Math.ceil(value / 5) * 5;
    document.getElementById(`${key.slice(-3)}-${i}`).style.backgroundColor = windAloftColor(value, redlimit);
    document.getElementById(`windspeed_${key}-${i}`).innerHTML = value;
    document.getElementById(`winddirection_${key}-${i}`).src = `prod/images/barbs/barb${barb}.png`;
    accelerator += 3;
    redlimit += accelerator;
  };
  for (const [key, value] of Object.entries(winddirection)) {
    document.getElementById(`winddirection_${key}-${i}`).style.transform = `rotate(${value}deg)`;
  };
};

function windAloftLongtermTime(time, offset) {
  const adjustedTime = time - offset;
  if (adjustedTime === 0) return 'Midnight';
  if (adjustedTime === 12) return 'Noon';
  return `${Math.abs(adjustedTime)}${adjustedTime < 0 ? 'pm' : 'am'}`;
};

function gcpWindAloft(data) {
  const timezoneOffset = now.getTimezoneOffset() / 60;
  const forecast06hEnd = (data.forecast_06h.end_time - timezoneOffset + 24) % 24;
  for (let i = 0; i < 12; i++) {
    const timeslot = now.getHours() + i;
    if (timeslot < forecast06hEnd) {
      gcpWindAloftRows(i, data.forecast_06h.wind_speed, data.forecast_06h.wind_direction);
    } else {
      gcpWindAloftRows(i, data.forecast_12h.wind_speed, data.forecast_12h.wind_direction);
    };
  };
  const longtermStartTime = windAloftLongtermTime(data.forecast_24h.start_time, timezoneOffset);
  const longtermEndTime = windAloftLongtermTime(data.forecast_24h.end_time, timezoneOffset);
  document.getElementById('wind-aloft-time-longterm').innerHTML = `Wind Aloft ${longtermStartTime} - ${longtermEndTime}`;
  gcpWindAloftRows('longterm', data.forecast_24h.wind_speed, data.forecast_24h.wind_direction);
};