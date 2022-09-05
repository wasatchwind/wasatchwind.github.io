'use strict';
const now = new Date();
const titleDate = now.toLocaleString('en-us', {weekday: 'short', month: 'short', day: 'numeric'})
document.getElementById('title-date').innerHTML = titleDate
const nextDay = now.getHours() > 18 ? `&nbsp;&nbsp;(${new Date(now.setHours(now.getHours() + 24)).toLocaleString('en-us', {weekday: 'long'})})&nbsp;&nbsp;` : ''
let currentDiv = 'wind'
let liftParams = {}
let soundingData = {}
let maxTempF

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
        document.getElementById(`${div}-toggle`).innerHTML = '&#10134;'
    }
    else {
        element.style.display = 'none'
        document.getElementById(`${div}-toggle`).innerHTML = '&#10133;'
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

// function toggleWhatIsZoneChart() {
//     const element = document.getElementById('zone-details')
//     const display = element.className === 'collapse mx-2' ? 'mx-2' : 'collapse mx-2'
//     element.className = display
// };

function windSurfaceForecastGraphical() {
    const offsetTime = now.getTimezoneOffset() / 60 === 6 ? '3 pm' : '2 pm'
    document.getElementById('graphical-wind-time').innerHTML = `Surface Forecast @ ${offsetTime}`
    document.getElementById('graphical-wind-img').src = 'https://graphical.weather.gov/images/slc/WindSpd3_slc.png'
    document.getElementById('graphical-gust-img').src = 'https://graphical.weather.gov/images/slc/WindGust3_slc.png'
    document.getElementById('graphical-wind-div').style.display = 'block'
};

(function getAllGraphicalForecastImages() {
    const url = 'https://graphical.weather.gov/images/slc/'
    const timeStr = (now.getHours() > 18 || now.getHours() < 7) ? 5 : 1
    document.getElementById('sky-next-day').innerHTML = nextDay
    for (let i=0; i<4; i++) {
        document.getElementById(`graphical-sky-${i}`).src = `${url}Sky${timeStr+i}_slc.png`
        document.getElementById(`graphical-wx-${i}`).src = `${url}Wx${timeStr+i}_slc.png`
    }
})();

(function getMorningSkewT() {
    const date = now.toLocaleString('en-US', {year: 'numeric', month: '2-digit', day: '2-digit'}).split('/')
    const url = `https://climate.cod.edu/data/raob/KSLC/skewt/KSLC.skewt.${date[2]}${date[0]}${date[1]}.12.gif`
    document.getElementById('skew-t-img').src = url
})();
