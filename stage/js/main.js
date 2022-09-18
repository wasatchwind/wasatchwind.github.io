'use strict';
const now = new Date();
const titleDate = now.toLocaleString('en-us', {weekday: 'short', month: 'short', day: 'numeric'})
document.getElementById('title-date').innerHTML = titleDate
const nextDay = now.getHours() > 18 ? `&nbsp;&nbsp;(${new Date(now.setHours(now.getHours() + 24)).toLocaleString('en-us', {weekday: 'long'})})&nbsp;&nbsp;` : ''
let currentDiv = 'wind', liftParams = {}, maxTempF, soundingData = {}

function reload() {
    history.scrollRestoration = 'manual'
    location.reload()
};

function toggleDiv(newDiv) {
    document.getElementById(currentDiv).style.display = 'none'
    document.getElementById(`${currentDiv}-title`).className = 'display-3 fw-semibold text-warning'
    document.getElementById(`${currentDiv}-border`).className = 'tile-border overflow-hidden'
    document.getElementById(`${newDiv}-title`).className = 'display-3 fw-semibold text-info'
    document.getElementById(`${newDiv}-border`).className = 'tile-border-selected overflow-hidden'
    document.getElementById(newDiv).style.display = 'block'
    currentDiv = newDiv
};

function toggleWindChart(div) {
    const element = document.getElementById(div)
    if (element.style.display==='' || element.style.display==='none') {
        element.style.display = 'block'
        document.getElementById(`${div}-toggle`).innerHTML = '&#8722;'
    }
    else {
        element.style.display = 'none'
        document.getElementById(`${div}-toggle`).innerHTML = '&#43;'
    }
};

function tempTrend(history, latest, forecast) {
    const temp = history.temp.slice(-3).concat(latest.temp.slice(-1),forecast.temp)
    const time = history.time.slice(-3).concat(latest.time.slice(-1),forecast.time)
    const tempInt = temp.map(d => parseInt(d))
    const min = Math.min(...tempInt)
    const max = Math.max(...tempInt)
    const tempBar = tempInt.map(d => `${Math.round((((d - min) * 100)/(max - min)) + 50)}px`)
    const barColor = tempInt.map(d => `${100 - Math.round((((d - min) * 100)/(max - min)))}%`)
    for (let i=0; i<temp.length; i++) {
        document.getElementById(`temp-${i}`).innerHTML = temp[i]
        document.getElementById(`temptime-${i}`).innerHTML = time[i]
        document.getElementById(`tempbar-${i}`).style.height = tempBar[i]
        document.getElementById(`tempbar-${i}`).style.background = `linear-gradient(to top, var(--bs-purple) ${barColor[i]}, var(--bs-red))`
    }
};

function windSurfaceForecastGraphical() {
    const offsetTime = now.getTimezoneOffset() / 60 === 6 ? '5 pm' : '4 pm'
    document.getElementById('graphical-wind-time').innerHTML = `Surface Forecast @ ${offsetTime}`
    document.getElementById('graphical-wind-img').src = 'https://graphical.weather.gov/images/utah/WindSpd4_utah.png'
    document.getElementById('graphical-gust-img').src = 'https://graphical.weather.gov/images/utah/WindGust4_utah.png'
    document.getElementById('graphical-wind-div').style.display = 'block'
};

function processSoaringForecast(text) {
    const textStart = text.search(/[Dd][Aa][Tt][Ee]\.{3}.+/)
    const textEnd = text.search(/[Ft][Tt]\/[Mm][Ii][Nn]/) + 6
    const soaringForecast = text.slice(textStart, textEnd)
    document.getElementById('soaring-forecast').innerText = soaringForecast
};

function processAreaForecast(text) {
    const dateStart = text.search(/[Cc][Ii][Tt][Yy]\s[Uu][Tt]\n/) + 8
    const dateEnd = text.search(/202\d\n/) + 4
    const forecastDate = text.slice(dateStart, dateEnd)
    const synopsisStart = text.search(/SYNOPSIS/) + 11
    const synopsisEnd = text.search(/&&/) - 2
    const synopsis = text.slice(synopsisStart, synopsisEnd).replace(/\n/g, ' ')
    const aviationStart = text.search(/KSLC\.{3}/) + 7
    const aviationEnd = text.search(/REST/)
    const aviation = text.slice(aviationStart, aviationEnd).replace(/\n/g, ' ')
    document.getElementById('area-forecast-date').innerText = forecastDate
    document.getElementById('area-forecast-synopsis').innerText = synopsis
    document.getElementById('area-forecast-aviation').innerText = aviation
};

(function getGraphicalForecastImages() {
    const url = 'https://graphical.weather.gov/images/slc/'
    const timeStr = (now.getHours() > 18 || now.getHours() < 7) ? 5 : 1
    document.getElementById('sky-next-day').innerHTML = nextDay
    for (let i=0; i<4; i++) {
        document.getElementById(`graphical-sky-${i}`).src = `${url}Sky${timeStr+i}_slc.png`
        document.getElementById(`graphical-wx-${i}`).src = `${url}Wx${timeStr+i}_slc.png`
    }
})();

(function getMorningSkewT() {
    if (now.getHours() > 6 && now.getHours() < 20) {
        const date = now.toLocaleString('en-US', {year: 'numeric', month: '2-digit', day: '2-digit'}).split('/')
        const url = `https://climate.cod.edu/data/raob/KSLC/skewt/KSLC.skewt.${date[2]}${date[0]}${date[1]}.12.gif`
        document.getElementById('skew-t-img').src = url
    }
    else document.getElementById('skew-t-div').style.display = 'none'
})();
