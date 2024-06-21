'use strict'; // https://www.weather.gov/documentation/services-web-api
function hourlyForecast(data, object = {}) {
    object.icon = [], object.temp = [], object.time = [], object.wdir = [], object.wspd =[]
    for (let i=1; i<4; i++) {
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
        document.getElementById(`forecast-day${i}-img`).src = `https://api.weather.gov${data.properties.periods[position].icon}`
        position += 2
    }
    document.getElementById('forecast-icon').src = data.properties.periods[0].icon
};
