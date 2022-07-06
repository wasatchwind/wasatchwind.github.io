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
