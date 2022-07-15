'use strict';
function formatTimeSeries(data, object = {}) {
    for (let i=0; i<data.length; i++) object[data[i].STID] = data[i].OBSERVATIONS
    for (const key in object) {
        object[key].air_temp_set_1 ? object[key].temp = object[key].air_temp_set_1.map(d => d === null ? null : `${Math.round(d)}&deg;`) : null
        object[key].altimeter_set_1 ? object[key].alti = object[key].altimeter_set_1.map(d => d === null ? null : d.toFixed(2)) : null
        object[key].date_time ? object[key].time = object[key].date_time.map(d => d === null ? null : d.toLowerCase()) : null
        object[key].wind_direction_set_1 ? object[key].wdir = object[key].wind_direction_set_1.map(d => d === null ? null : d) : null
        object[key].wind_gust_set_1 ? object[key].gust = object[key].wind_gust_set_1.map(d => !d ? null : Math.round(d)) : null
        object[key].wind_speed_set_1 ? object[key].wspd = object[key].wind_speed_set_1.map(d => d === null ? null : d < 0.5 ? 'Calm' : Math.round(d)) : null
        delete object[key].air_temp_set_1
        delete object[key].altimeter_set_1
        delete object[key].date_time
        delete object[key].wind_direction_set_1
        delete object[key].wind_gust_set_1
        delete object[key].wind_speed_set_1
    }
    return object
};

function latest(data) {
    const lastIndex = data.time.length - 1
    const zone = calculateZone(data.alti[lastIndex], parseInt(data.temp[lastIndex]))
    const zoneElement = document.getElementById('latest-zone')
    zoneElement.innerHTML = zone.num
    zoneElement.style.color = zone.col
    if (data.wdir[lastIndex] === null) document.getElementById('wdir-div').style.display = 'none'
    for (const key in data) {
        const element = document.getElementById(`latest-${key}`)
        if (key === 'wdir' && data[key][lastIndex]) {
            element.innerHTML = '&#10148;'
            element.style.transform = `rotate(${data[key][lastIndex] + 90}deg)`
        } else if (key === 'gust' && data[key][lastIndex]) element.innerHTML = `g${data[key][lastIndex]}`
        else element.innerHTML = data[key][lastIndex]
    }
};

function calculateZone(alti, temp, currentZones = [], zone = {}) {
    const zoneSlope = [0.05, 0.12, 0.19, 0.33, 0.47, 0.54, 0.62, -1]
    const zoneIntercept = [29.91, 30.01, 30.11, 30.27, 30.43, 30.53, 30.65, 100]
    for (let i=0; i<zoneSlope.length; i++) currentZones.push(Math.round((zoneSlope[i]/-110*temp+zoneIntercept[i])*100)/100)
    zone.num = currentZones.findIndex(d => d >= alti)
    zone.col = (zone.num === 0 || zone.num === 7) ? 'var(--bs-red)' : (zone.num===1 || zone.num===6) ? 'var(--bs-orange)' : (zone.num===2 || zone.num===5) ? 'var(--bs-yellow)' : 'var(--bs-teal)'
    zone.num = alti === currentZones[3] ? 'LoP' : zone.num
    zone.num = zone.num === 0 ? '&#9471;' : (zone.num === 'LoP') ? 'LoP' : `&#1010${zone.num + 1};`
    return zone
};

function hourlyHistory(data, object = {}) {
    for (const key in data) object[key] = []
    for (let i=0; i<data.time.length; i++) {
        if (data.time[i] && data.time[i].slice(-5,-3) === '00') {
            for (const key in data) object[key].push(data[key][i])
        }
    }
    for (const key in object) object[key] = object[key].slice(-6)
    object.time = object.time.map(d => d.replace(':00', ''))
    return object
};

function pressureHistory(alti, temp, time) {
    const min = Math.min(...alti)
    const max = Math.max(...alti)
    for (let i=0; i<time.length; i++) {
        const zone = calculateZone(alti[i], parseInt(temp[i]))
        const altibar = `${(((alti[i] - min) * 100)/(max - min)) + 50}px`
        document.getElementById(`alti-${i}`).innerHTML = alti[i]
        document.getElementById(`altitime-${i}`).innerHTML = time[i].replace(':00', '')
        document.getElementById(`zonenum-${i}`).innerHTML = zone.num
        document.getElementById(`zonenum-${i}`).style.color = zone.col
        document.getElementById(`altibar-${i}`).style.height = altibar
    }
}

function windChart(stid, data) {
    for (const key in data) data[key] = data[key].slice(-12)
    if (data.wspd) wspd(stid, data.wspd)
    if (data.gust) gust(stid, data.gust, data.wspd)
    const wimg = data.wdir.map(d => !d ? '&nbsp;' : '&#10148;')
    for (let i=0; i<data.time.length; i++) {
        document.getElementById(`${stid}-time-${i}`).innerHTML = (data.time[i]).slice(0,-3)
        document.getElementById(`${stid}-wdir-${i}`).innerHTML = wimg[i]
        document.getElementById(`${stid}-wdir-${i}`).style.transform = `rotate(${data.wdir[i] + 90}deg)`
    }
};

function wspd(stid, wspd) {
    const wbar = wspd.map(d => !d ? null : `${d * 4}px`)
    const ylwLim = (stid==='AMB' || stid==='OGP') ? 19 : stid==='FPS' ? 15 : 9
    const redLim = (stid==='AMB' || stid==='OGP') ? 29 : 19
    const barColor = wspd.map(d => (d > ylwLim && d < redLim) ? 'var(--bs-yellow)' : d >= redLim ? 'var(--bs-orange)' : 'var(--bs-teal)')
    for (let i=0; i<wspd.length; i++) {
        document.getElementById(`${stid}-wspd-${i}`).className = wspd[i] === 'Calm' ? 'fs-3 fw-normal' : 'fs-1'
        document.getElementById(`${stid}-wspd-${i}`).innerHTML = wspd[i] ? wspd[i] : '&nbsp;'
        document.getElementById(`${stid}-wbar-${i}`).style.height = wbar[i]
        document.getElementById(`${stid}-wbar-${i}`).style.backgroundColor = barColor[i]
    }
};

function gust(stid, gust, wspd) {
    wspd = wspd.map(d => d >= 0 ? d : 0)
    for (let i=0; i<gust.length; i++) {
        document.getElementById(`${stid}-gust-${i}`).innerHTML = gust[i] ? `g${gust[i]}` : null
        document.getElementById(`${stid}-gbar-${i}`).style.height = gust[i] ? `${(gust[i] - wspd[i]) * 4}px` : null
    }
};
