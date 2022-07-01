'use strict';
function timeSeries(data) {
    latest('kslc', data.STATION[0].OBSERVATIONS)
};

function latest(stid, data, object = {}) {
    const indexEnd = data.date_time.length - 1
    for (const key in data) object[key] = data[key][indexEnd]
    object.air_temp_set_1 = Math.round(object.air_temp_set_1)
    object.altimeter_set_1 = object.altimeter_set_1.toFixed(2)
    object.date_time = object.date_time.toLowerCase()
    object.id = stid
    titleDate(object.date_time)
    console.log(object)
    document.getElementById('latest-temp').innerHTML = object.air_temp_set_1
    document.getElementById('latest-alti').innerHTML = object.altimeter_set_1
    document.getElementById('latest-time').innerHTML = object.date_time
    document.getElementById('latest-wdir').innerHTML = object.wind_direction_set_1
    document.getElementById('latest-wind').innerHTML = object.air_temp_set_1
};

function titleDate(time) {
    const dayDate = now.toLocaleString('en-us', {weekday: 'short', month: 'short', day: 'numeric'})
    document.getElementById('title-time').innerHTML = time
    document.getElementById('title-date').innerHTML = dayDate
};
