'use strict'; // https://www.weather.gov/documentation/services-web-api
function maxTemp(data) {
    const latest = data.properties.periods[0]
    const maxTempF = latest.isDaytime ? `${latest.temperature}&deg;` : 'Check<br>Tomorrow'
    const fontSize = Number.isFinite(parseInt(maxTempF)) ? 'display-4 fw-bold' : 'fs-4'
    const element = document.getElementById('max-temp')
    element.innerHTML = maxTempF
    element.className = fontSize
    return parseInt(maxTempF)
};

function hourlyForecast(data, object = {}) {
    object.icon = [], object.temp = [], object.time = [], object.wdir = [], object.wspd =[]
    for (let i=1; i<7; i++) {
        object.icon.push(data.properties.periods[i].icon)
        object.temp.push(`${data.properties.periods[i].temperature}&deg;`)
        object.time.push(new Date(data.properties.periods[i].startTime).toLocaleString('en-us', {timeStyle: 'short'}).replace(':00','').toLowerCase())
        object.wdir.push(cardinalToDeg(data.properties.periods[i].windDirection))
        object.wspd.push(parseInt(data.properties.periods[i].windSpeed))
    }
    return object
};

function cardinalToDeg(data) {
    const cardDegs = ["N", "NNE", "NE", "ENE", "E", "ESE", "SE", "SSE", "S", "SSW", "SW", "WSW", "W", "WNW", "NW", "NNW"]
    const index = cardDegs.findIndex(d => d === data)
    return index * 22.5
};

function nwsForecastProcess(data) {
    let position = data.properties.periods[0].isDaytime ? 0 : 1
    for (let i=0; i<3; i++) {
        document.getElementById(`forecast-day${i}-day`).innerHTML = data.properties.periods[position].name
        document.getElementById(`forecast-day${i}-txt`).innerHTML = data.properties.periods[position].detailedForecast
        document.getElementById(`forecast-day${i}-img`).src = data.properties.periods[position].icon
        position += 2
    }
};
