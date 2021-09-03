'use strict';
const now = new Date()
const headingDate = now.toLocaleString('en-us', {weekday: 'short', month: 'short', day: 'numeric'})
document.getElementById('heading-date').innerHTML = headingDate
const wwGrn = '#20c997' // bootstrap teal
const wwYlw = '#ffc107' // bootstrap yellow (warning)
const wwOrg = '#fd7e14' // bootstrap orange
const wwRed = '#dc3545' // bootstrap red (danger)
const wwBlu = '#0dcaf0' // bootstrap cyan (info)
const zoneSlope = [0.05, 0.12, 0.19, 0.33, 0.47, 0.54, 0.62, -1]
const zoneIntercept = [29.91, 30.01, 30.11, 30.27, 30.43, 30.53, 30.65, 100]
const dalr = 5.38
let raobData = {}
let userTemp = -10
let maxTemp

let currentDiv = 'Wind'
document.getElementById('current-div').innerHTML = currentDiv

window.onclick = function(event) {
    if (!event.target.matches('.btn-menu')) {
        let menu = document.getElementById('menu')
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
    let element = document.getElementById(div)
    if (element.style.display==='' || element.style.display==='none') {
        element.style.display = 'block'
        document.getElementById(`${div}-toggle`).innerHTML = '-'
    }
    else {
        element.style.display = 'none'
        document.getElementById(`${div}-toggle`).innerHTML = '+'
    }
}

// NOAA PUBLIC API FOR 3 DAY FORECAST IN GENERAL DIV
(async () => {
    const url = 'https://api.weather.gov/gridpoints/SLC/97,175/forecast'
    const response = await fetch(url, {mode: 'cors'})
    const noaaData = await response.json()
    if (noaaData) {
        let position = (noaaData.properties.periods[0].isDaytime) ? 0 : 1
        for (let i=1; i<4; i++) {
            document.getElementById(`forecast-day${i}-day`).innerHTML = noaaData.properties.periods[position].name
            document.getElementById(`forecast-day${i}-txt`).innerHTML = noaaData.properties.periods[position].detailedForecast
            document.getElementById(`forecast-day${i}-img`).src = noaaData.properties.periods[position].icon
            position += 2
        }
    }
})()

function getMorningSkewT() {
    const date = now.toLocaleString('en-US', {year: 'numeric', month: '2-digit', day: '2-digit'}).split('/')
    const url = `https://climate.cod.edu/data/raob/KSLC/skewt/KSLC.skewt.${date[2]}${date[0]}${date[1]}.12.gif`
    document.getElementById('skew-t-img').src = url
}

function getAllGraphicalForecastImages() {
    const url = 'https://graphical.weather.gov/images/slc/'
    const timeStr = (now.getHours()>18 || now.getHours()<7) ? 5 : 1
    const nextDay = (now.getHours()>18) ? `( ${new Date(now.setHours(now.getHours()+24)).toLocaleString('en-us', {weekday: 'long'})} )` : null
    const nextDayClassCount = 5
    if (nextDay) for (let i=0; i<nextDayClassCount; i++) document.getElementsByClassName('next-day')[i].innerHTML = nextDay
    for (let i=0; i<4; i++) {
        document.getElementById(`graphical-wind-${i}`).src = `${url}WindSpd${timeStr+i}_slc.png`
        document.getElementById(`graphical-gust-${i}`).src = `${url}WindGust${timeStr+i}_slc.png`
        document.getElementById(`graphical-sky-${i}`).src = `${url}Sky${timeStr+i}_slc.png`
        document.getElementById(`graphical-wx-${i}`).src = `${url}Wx${timeStr+i}_slc.png`
    }
}

getMorningSkewT()
getAllGraphicalForecastImages()
