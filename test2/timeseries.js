'use strict';
function timeSeries(data) { // Loop through all stations with data to build wind charts
  for (let i=0; i<data.STATION.length; i++) {
    windChart(data.STATION[i].STID, data.STATION[i].OBSERVATIONS)
  }
  if (data.STATION[0].STID = 'KSLC') {
    const kslcData = data.STATION[0].OBSERVATIONS
    zone(kslcData.altimeter_set_1, kslcData.air_temp_set_1)
  }
}

function windChart(stid, data) {
  if (data.wind_speed_set_1.every(d => d === 0)) {
    document.getElementById(`${stid}-main`).style.display = 'none'
    return
  }
  const sliceLength = stid === 'AMB' ? 6 : 12 // Set chart data length, shorter for low frequency data
  if (data.date_time.length < sliceLength) { // If data is less than chart length
    const emptyArray = new Array(sliceLength - data.date_time.length).fill(null) // Create empty array for missing data
    for (let value of Object.keys(data)) data[value] = emptyArray.concat(data[value]) // Iterate data object and join arrays to make complete
  }
  else for (let value of Object.keys(data)) data[value] = data[value].slice(-sliceLength) // If data more than needed, slice to make complete
  time(stid, data.date_time) // date_time always included in data
  if (!data.wind_direction_set_1) data.wind_direction_set_1 = new Array(12).fill(null) // If wind direction key missing, create it with blank value array
  windDirection(stid, data.wind_direction_set_1) // With data guaranteed, even if empty, call function
  if (!data.wind_speed_set_1) data.wind_speed_set_1 = new Array(12).fill(null) // If wind speed key missing, create it with blank value array
  windSpeed(stid, data.wind_speed_set_1) // With data guaranteed, even if empty, call function
  if (!data.wind_gust_set_1) data.wind_gust_set_1 = new Array(12).fill(null) // If wind gust key missing, create it with blank value array
  windGust(stid, data.wind_gust_set_1) // With data guaranteed, even if empty, call function
  windBarHeight(stid, data.wind_speed_set_1, data.wind_gust_set_1)
  windBarColor(stid, data.wind_speed_set_1)
  document.getElementById(`${stid}-main`).style.display = 'block' // Show chart
};

function time(stid, time) {
  time.push(time[time.length - 1]) // Duplicate last item for main line display
  time = time.map(d => d ? d.toLowerCase() : d) // Make all lowercase or leave null
  for (let i=0; i<time.length; i++) {
    time[i] = time[i] ? time[i].slice(0,-3) : time[i] // If time !null remove am/pm
    if (stid === 'KSLC' && i === time.length-1) time[i] = `${time[i]} KSLC`
    document.getElementById(`${stid}-time-${i}`).innerHTML = time[i] // Set html element
  }
};

function windDirection(stid, wdir) {
  wdir.push(wdir[wdir.length - 1]) // Duplicate last item for main line display
  const wimg = wdir.map(d => !d ? '&nbsp;' : '&#10148;') // If null make space all else arrow character
  const rotate = wdir.map(d => `rotate(${d + 90}deg)`) // Set rotation for wind direction
  for (let i=0; i<wdir.length; i++) {
    const element = document.getElementById(`${stid}-wdir-${i}`) // Base html element
    element.innerHTML = wimg[i] // Set spaces and/or arrow characters
    element.style.transform = rotate[i] // Rotate
  }
};

function windSpeed(stid, wspd) {
  wspd.push(wspd[wspd.length - 1])
  wspd = wspd.map(d => d === null ? '&nbsp;' : d < 0.5 ? 'Calm' : Math.round(d))
  for (let i=0; i<wspd.length; i++) {
    const element = document.getElementById(`${stid}-wspd-${i}`)
    if (wspd[i] === 'Calm' && i !== wspd.length - 1) element.className = 'fs-3 fw-normal'
    if (wspd[i] === 'Calm' && i === wspd.length - 1) element.className = 'align-self-end fs-1 text-center'
    if (wspd[i] === 'Calm' && i === wspd.length - 1 && stid === 'KSLC') element.className = ''
    element.innerHTML = wspd[i]
  }
};

function windGust(stid, gust) {
  gust.push(gust[gust.length - 1])
  gust = gust.map(d => !d ? '&nbsp;' : `g${Math.round(d)}`)
  for (let i=0; i<gust.length; i++) document.getElementById(`${stid}-gust-${i}`).innerHTML = gust[i]
};

function windBarHeight(stid, wspd, gust, multiplier) {
  wspd.pop() // FIX this so it's not necessary to do here
  gust.pop()
  if (Math.max(...gust) > 30) multiplier = 1.3
  else multiplier = 4
  for (let i=0; i<wspd.length; i++) {
    document.getElementById(`${stid}-wbar-${i}`).className = wspd[i] ? 'border-1 border' : ''
    document.getElementById(`${stid}-wbar-${i}`).style.height = `${wspd[i] * multiplier}px`
    document.getElementById(`${stid}-gbar-${i}`).style.height = `${(gust[i] - wspd[i]) * multiplier}px`
  }
};

function windBarColor(stid, data) {
  const yellow = (stid==='AMB' || stid==='OGP') ? 20 : stid==='FPS' ? 15 : 10
  const red = (stid==='AMB' || stid==='OGP') ? 30 : 20
  const barColor = data.map(d => (d > yellow && d < red) ? 'var(--bs-yellow)' : d >= red ? 'var(--bs-orange)' : 'var(--bs-teal)')
  for (let i=0; i<data.length; i++) {
    document.getElementById(`${stid}-wbar-${i}`).style.backgroundColor = barColor[i]
  }
};

function calculateZone(alti, temp, currentZones = [], zone = {}) {
  const zoneSlope = [0.0714, 0.0714, 0.0714, 0.3, 0.4286, 0.4286, 0.5429, -1]
  const zoneIntercept = [29.9214, 30.0514, 30.1114, 30.27, 30.4286, 30.4486, 30.6228, 100]
  for (let i=0; i<zoneSlope.length; i++) currentZones.push(Math.round((zoneSlope[i] / -110 * temp + zoneIntercept[i]) * 100) / 100)
  zone.num = currentZones.findIndex(d => d >= alti)
  if (zone.num === 0 || zone.num === 7) zone.col = 'var(--bs-red)'
  else if (zone.num===1 || zone.num===6) zone.col = 'var(--bs-orange)'
  else if (zone.num===2 || zone.num===5) zone.col = 'var(--bs-yellow)'
  else zone.col = 'var(--bs-teal)'
  zone.num = alti === currentZones[3] ? 'LoP' : zone.num
  zone.num = zone.num === 0 ? '&#9471;' : (zone.num === 'LoP') ? 'LoP' : `&#1010${zone.num + 1};`
  return zone
};

function zone(alti, temp, zone, slope, trend, trendChar, altiDiff) {
  zone = calculateZone(alti[alti.length-1], temp[temp.length-1])
  slope = trendLine(alti)
  altiDiff = Math.abs(Math.round((alti[alti.length-1] - alti[0]) * 100) / 100)
  if (altiDiff > 0 && altiDiff <= 0.01) trend = 30
  else if (altiDiff > 0.01 && altiDiff <= 0.03) trend = 60
  else if (altiDiff > 0.03) trend = 90
  else trend = 0
  trend = slope > 0 ? trend * -1 : trend
  trendChar = trend === 0 ? '' : '&rarr;'
  document.getElementById('temp').innerHTML = Math.round(temp[temp.length-1])
  document.getElementById('alti').innerHTML = alti[alti.length-1].toFixed(2)
  document.getElementById('trend').innerHTML = trendChar
  document.getElementById('trend').style.transform = `rotate(${trend}deg)`
  document.getElementById('zone').innerHTML = zone.num
  document.getElementById('zone').style.color = zone.col
};

function trendLine(data, a=0, b=0, c=0, d=0, e=0) {
  for (let i=0; i<data.length; i++) {
    a = a+((i+1)*data[i])
    b = b+data[i]
    c = c+(i+1)**2
    e = e+(i+1)
  }
  a *= data.length
  b *= e
  c *= data.length
  d = e**2
  return (a-b)/(c-d)
};