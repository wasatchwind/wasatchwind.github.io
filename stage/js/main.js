'use strict';
const now = new Date();
let currentDiv = 'wind'

function reload() {
    history.scrollRestoration = 'manual'
    location.reload()
};

function toggleDiv(newDiv) {
    document.getElementById(currentDiv).style.display = 'none'
    document.getElementById(`${currentDiv}-title`).className = 'display-3 fw-bold text-warning'
    document.getElementById(`${currentDiv}-border`).className = 'tile-border tile-height'
    document.getElementById(`${newDiv}-title`).className = 'display-3 fw-bold'
    document.getElementById(`${newDiv}-border`).className = 'tile-border-selected tile-height'
    document.getElementById(newDiv).style.display = 'block'
    currentDiv = newDiv
};

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

function tempTrend(history, latest, forecast) {
    const temp = history.temp.slice(-5).concat(latest.temp.slice(-1),forecast.temp.slice(-5))
    const time = history.time.slice(-5).concat(latest.time.slice(-1),forecast.time.slice(-5))
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

document.getElementById('zone-details').style.display = 'none'
function toggleZone() {
    const element = document.getElementById('zone-details')
    const display = element.style.display === 'none' ? 'block' : 'none'
    element.style.display = display
};
