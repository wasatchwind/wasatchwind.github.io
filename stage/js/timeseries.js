'use strict';
function timeSeries(data) {
    recent('kslc', data.STATION[0].OBSERVATIONS)
};

function recent(stid, data, object = {}) {
    for (const key in data) object[key] = data[key].slice(-12)
    object.air_temp_set_1 = object.air_temp_set_1.map(d => !d ? null : `${Math.round(d)}&deg;`)
    object.altimeter_set_1 = object.altimeter_set_1.map(d => !d ? null : d.toFixed(2))
    object.date_time = object.date_time.map(d => !d ? null : d.toLowerCase())
    object.wind_direction_set_1 = object.wind_direction_set_1.map(d => !d ? null : `rotate(${d + 90}deg)`)
    object.wimg = object.wind_direction_set_1.map(d => !d ? null : '&#10148;')
    object.wind_speed_set_1 = object.wind_speed_set_1.map(d => d === null ? d : d < 0.5 ? 'Calm' : Math.round(d))
    if (object.wind_gust_set_1) object.wind_gust_set_1 = object.wind_gust_set_1.map(d => !d ? null : `g${Math.round(d)}`)
    if (stid === 'kslc') latest(object)
};

function latest(data, object = {}) {
    for (const key in data) object[key] = data[key][data.date_time.length - 1]
    const zone = calculateZone(object.altimeter_set_1, parseInt(object.air_temp_set_1))
    const element = document.getElementById('latest-zone')
    element.innerHTML = zone.num
    element.style.color = zone.col
    if (object.wind_gust_set_1 === null) hideDiv('gust')
    if (object.wind_direction_set_1 === null) hideDiv('wdir')
    for (const key in object) {
        const element = document.getElementById(`latest-${key}`)
        const elementRotate = document.getElementById('latest-wimg')
        if (key === 'wind_direction_set_1') elementRotate.style.transform = object[key]
        else element.innerHTML = object[key]
    }
};

function calculateZone(alti, temp, currentZones = [], zone = {}) {
    const zoneSlope = [0.05, 0.12, 0.19, 0.33, 0.47, 0.54, 0.62, -1]
    const zoneIntercept = [29.91, 30.01, 30.11, 30.27, 30.43, 30.53, 30.65, 100]
    for (let i=0; i<zoneSlope.length; i++) currentZones.push(Math.round((zoneSlope[i]/-110*temp+zoneIntercept[i])*100)/100)
    zone.num = currentZones.findIndex(d => d >= alti)
    zone.col = (zone.num === 0 || zone.num === 7) ? 'var(--bs-red)' : (zone.num===1 || zone.num===6) ? 'var(--bs-orange)' : (zone.num===2 || zone.num===5) ? 'var(--bs-yellow)' : 'var(--bs-teal)'
    zone.num = alti === currentZones[3] ? 'LoP' : zone.num
    zone.num = zone.num === 0 ? '&#9471;' : (zone.num === 'LoP') ? 'LoP' : `&#1010${zone.num + 1}`
    return zone
};
