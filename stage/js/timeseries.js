'use strict';
function timeSeries(data) {
    recent('kslc', data.STATION[0].OBSERVATIONS)
};

function recent(stid, data, object = {}) {
    for (const key in data) object[key] = data[key].slice(-12)
    console.log(object)
    object.air_temp_set_1 = object.air_temp_set_1.map(d => !d ? null : `${Math.round(d)}&deg;`)
    object.altimeter_set_1 = object.altimeter_set_1.map(d => !d ? null : d.toFixed(2))
    object.date_time = object.date_time.map(d => !d ? null : d.toLowerCase())
    object.wind_direction_set_1 = object.wind_direction_set_1.map(d => !d ? null : `rotate(${d + 90}deg)`)
    object.wimg = object.wind_direction_set_1.map(d => !d ? null : '&#10148;')
    object.wind_speed_set_1 = object.wind_speed_set_1.map(d => d === null ? d : d < 0.5 ? 'Calm' : Math.round(d))
    if (object.wind_gust_set_1) object.wind_gust_set_1 = object.wind_gust_set_1.map(d => !d ? null : `g${Math.round(d)}`)
    if (stid === 'kslc') latest(object)
};

function latest(data) {
    for (const key in data) {
        const element = document.getElementById(`latest-${key}`)
        const elementRotate = document.getElementById('latest-wimg')
        if (key === 'wind_direction_set_1') elementRotate.style.transform = data[key][11]
        else element.innerHTML = data[key][11]
    }
};
