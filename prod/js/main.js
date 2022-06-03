'use strict';
// Globals
const now = new Date()
const date = new Intl.DateTimeFormat('en-US', {month: '2-digit', day: '2-digit', year: 'numeric'}).format(now)
const wwGrn = '#20c997' // Bootstrap teal
const wwYlw = '#ffc107' // Bootstrap yellow (warning)
const wwOrg = '#fd7e14' // Bootstrap orange
const wwRed = '#dc3545' // Bootstrap red (danger)
const surfaceAlt = 4229/1000 // KSLC elevation adjusted to d3 y-axis scale
const dalr = 5.4 // Dry Adiabatic Lapse Rate in °F/1000' (equivalent to 3°C)
const dalrSlope = -1/dalr
const clientWidth = document.documentElement.clientWidth
const visibleScreenWidth = clientWidth>1080 ? clientWidth*0.6 : clientWidth*0.89
const visibleScreenHeight = visibleScreenWidth*0.679
const margin = {
    top: visibleScreenHeight*0.023,
    right: visibleScreenWidth*0.028,
    bottom: visibleScreenHeight*0.133,
    left: visibleScreenWidth*0.09
}
const width = visibleScreenWidth-margin.left-margin.right
const height = visibleScreenHeight-margin.top-margin.bottom
const svg = d3.select('#skew-t-d3')
    .append('svg')
    .attr('class', 'svgbg')
    .attr('width', width+margin.left+margin.right)
    .attr('height', height+margin.top+margin.bottom)
    .append('g')
    .attr('transform', `translate(${margin.left},${margin.top})`)
const x = d3.scaleLinear().range([-10, width]).domain([-10, 110])
const y = d3.scaleLinear().range([height, 0]).domain([surfaceAlt, 18])
let raobData = {}
let currentDiv = 'Wind'
document.getElementById('current-div').innerHTML = currentDiv

window.onclick = function(event) {
    if (!event.target.matches('.btn-menu')) {
        const menu = document.getElementById('menu')
        if (menu.classList.contains('show')) menu.classList.remove('show')
    }
}

function menu() { document.getElementById('menu').classList.toggle('show') }

function reload() {
    history.scrollRestoration = 'manual'
    location.reload()
}

function toggleDiv(newDiv) {
    document.getElementById(currentDiv).style.display = 'none'
    currentDiv = newDiv
    document.getElementById(currentDiv).scrollTop = 0
    document.getElementById('current-div').innerHTML = currentDiv
    document.getElementById(currentDiv).style.display = 'block'
}

function toggleWindChart(div) {
    const element = document.getElementById(div)
    if (element.style.display==='' || element.style.display==='none') {
        element.style.display = 'block'
        document.getElementById(`${div}-toggle`).innerHTML = '-'
    }
    else {
        element.style.display = 'none'
        document.getElementById(`${div}-toggle`).innerHTML = '+'
    }
}

// IIFE ASYNC NOAA PUBLIC API FOR 3 DAY FORECAST
(async () => {
//     const url = 'https://wasatchwind.github.io/example_noaa_forecast.json'
    const url = 'https://api.weather.gov/gridpoints/SLC/97,175/forecast'
//     const response = await fetch(url, {mode: 'cors'})
    const response = await fetch(url)
    const noaaData = await response.json()
    if (noaaData) {
        let position = noaaData.properties.periods[0].isDaytime ? 0 : 1
        for (let i=1; i<4; i++) {
            document.getElementById(`forecast-day${i}-day`).innerHTML = noaaData.properties.periods[position].name
            document.getElementById(`forecast-day${i}-txt`).innerHTML = noaaData.properties.periods[position].detailedForecast
            document.getElementById(`forecast-day${i}-img`).src = noaaData.properties.periods[position].icon
            position += 2
        }
    }
})();

(function setHeadingDate() {
    const headingDate = now.toLocaleString('en-us', {weekday: 'short', month: 'short', day: 'numeric'})
    document.getElementById('heading-date').innerHTML = headingDate
})();

(function getMorningSkewT() {
    const date = now.toLocaleString('en-US', {year: 'numeric', month: '2-digit', day: '2-digit'}).split('/')
    const url = `https://climate.cod.edu/data/raob/KSLC/skewt/KSLC.skewt.${date[2]}${date[0]}${date[1]}.12.gif`
    document.getElementById('skew-t-img').src = url
})();

(function getAllGraphicalForecastImages() {
    const url = 'https://graphical.weather.gov/images/slc/'
    const timeStr = (now.getHours()>18 || now.getHours()<7) ? 5 : 1
    const nextDay = now.getHours()>18 ? `( ${new Date(now.setHours(now.getHours()+24)).toLocaleString('en-us', {weekday: 'short'})} )` : null
    const nextDayClassCount = 3
    if (nextDay) for (let i=0; i<nextDayClassCount; i++) document.getElementsByClassName('next-day')[i].innerHTML = nextDay
    for (let i=0; i<4; i++) {
        document.getElementById(`graphical-sky-${i}`).src = `${url}Sky${timeStr+i}_slc.png`
        document.getElementById(`graphical-wx-${i}`).src = `${url}Wx${timeStr+i}_slc.png`
    }
})();

if (now.getHours()>=6 && now.getHours()<=14) windSurfaceForecastGraphical()
function windSurfaceForecastGraphical() {
    const offset = now.getTimezoneOffset()/60===6 ? '3 pm' : '2 pm'
    document.getElementById('graphical-wind-time').innerHTML = offset
    document.getElementById('graphical-wind-img').src = 'https://graphical.weather.gov/images/slc/WindSpd3_slc.png'
    document.getElementById('graphical-gust-img').src = 'https://graphical.weather.gov/images/slc/WindGust3_slc.png'
    document.getElementById('graphical-wind-div').style.display = 'block'
}
