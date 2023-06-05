'use strict';
document.getElementById('ALOFT').style.display = 'none'
const now = new Date();
const nextDay = now.getHours() > 18 ? `&nbsp;&nbsp;(${new Date(now.setHours(now.getHours() + 24)).toLocaleString('en-us', {weekday: 'long'})})&nbsp;&nbsp;` : ''
let currentDiv = 'wind', liftParams = {}
let maxTempF, soundingData = {}

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

function toggleWindAloftHiRes() {
    const element = document.getElementById('ALOFT')
    element.style.display = element.style.display === 'none' ? 'block' : 'none'
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
    const windImageURL = 'https://graphical.weather.gov/images/utah/WindSpd4_utah.png'
    const gustImageURL = 'https://graphical.weather.gov/images/utah/WindGust4_utah.png'
    document.getElementById('graphical-wind-time').innerHTML = `Surface Forecast @ ${offsetTime}`
    document.getElementById('graphical-wind-img').src = windImageURL
    document.getElementById('graphical-gust-img').src = gustImageURL
    document.getElementById('graphical-wind-div').style.display = 'block'
};

function processSoaringForecast(text) {
    const textStart = text.search(/[Dd][Aa][Tt][Ee]\.{3}.+/)
    const textEnd = text.search(/[Ft][Tt]\/[Mm][Ii][Nn]/) + 6
    const soaringForecast = text.slice(textStart, textEnd)
    document.getElementById('soaring-forecast').innerText = soaringForecast
};

function processAreaForecast(text) {
    const preStart = text.search(/<pre/)
    const preEnd = text.search(/<\/pre>/)
    text = text.slice(preStart, preEnd)
    const dateStart = text.search(/\d{3,4}\s[PpAa][Mm]\s[Mm][DdSs][Tt]\s/)
    const dateEnd = text.search(/\s\d{1,2}\s202\d{1}\n/) + 7
    const forecastDate = text.slice(dateStart, dateEnd)
    const synopsisStart = text.search(/[Ss][Yy][Nn][Oo][Pp][Ss][Ii][Ss]/) + 11
    const synopsisEnd = text.search(/&&\n\n\./)
    const synopsis = text.slice(synopsisStart, synopsisEnd).replace(/\n/g, ' ')
    const aviationStart = text.search(/[Aa][Vv][Ii][Aa][Tt][Ii][Oo][Nn]\.{3}KSLC\.{3}/) + 18
    const aviationEnd = text.search(/\n\n\.[Rr][Ee][Ss][Tt]|\n\n[Rr][Ee][Ss][Tt]/)
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
    if (now.getHours() > 6 && now.getHours() < 19) {
        const date = now.toLocaleString('en-US', {year: 'numeric', month: '2-digit', day: '2-digit'}).split('/')
        const skewTURL = `https://climate.cod.edu/data/raob/KSLC/skewt/KSLC.skewt.${date[2]}${date[0]}${date[1]}.12.gif`
        document.getElementById('skew-t-img').src = skewTURL
    }
    else document.getElementById('skew-t-div').style.display = 'none'
})();
