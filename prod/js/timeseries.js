'use strict';
function ensureGustData(data) {
    for (let i=0; i<data.STATION.length; i++) data.STATION[i].OBSERVATIONS.wind_gust_set_1 = data.STATION[i].OBSERVATIONS.wind_gust_set_1 ? data.STATION[i].OBSERVATIONS.wind_gust_set_1 : data.STATION[i].OBSERVATIONS.wind_gust_set_1 = new Array(12).fill(null)
};

function kslcTiles(data) {
    windTileTimeRange(data.date_time.slice(-12))
    windDirection('tile', data.wind_direction_set_1.slice(-12))
    windBarHeight('tile', data.wind_speed_set_1.slice(-12), data.wind_gust_set_1.slice(-12))
    windBarColor('tile', data.wind_speed_set_1.slice(-12))
    windSpeed('tile', data.wind_speed_set_1.slice(-12))
    windGust('tile', data.wind_gust_set_1.slice(-12))
    zone(data.air_temp_set_1, data.altimeter_set_1, data.date_time)
    document.getElementById('latest-temp').innerHTML = data.air_temp_set_1[data.air_temp_set_1.length - 1] ? `${Math.round(data.air_temp_set_1[data.air_temp_set_1.length - 1])}&deg;` : '--'
};

function windTileTimeRange(data) {
    const start = data[0].toLowerCase()
    const end = data[11].toLowerCase()
    document.getElementById('wind-time-range').innerHTML = `${start} - ${end} @ KSLC`
};

function windDirection(stid, wdir) {
    wdir.push(wdir[wdir.length - 1])
    const wimg = wdir.map(d => !d ? '&nbsp;' : '&#10148;')
    const rotate = wdir.map(d => `rotate(${d + 90}deg)`)
    const finalElement = document.getElementById(`${stid}-wdir-${wdir.length - 1}`)
    for (let i=0; i<wdir.length; i++) {
        const element = document.getElementById(`${stid}-wdir-${i}`)
        if (stid === 'tile') {
            if (wdir[wdir.length - 1] === null || wdir[wdir.length - 1] === 0) element.style.display = 'none'
        }
        element.innerHTML = wimg[i]
        element.style.transform = rotate[i]
    }
};

function windBarHeight(stid, wspd, gust, multiplier) {
    if (Math.max(...gust) > 30) multiplier = 1.3
    else multiplier = stid === 'tile' ? 2.5 : 4
    for (let i=0; i<wspd.length; i++) {
        document.getElementById(`${stid}-wbar-${i}`).className = wspd[i] ? 'border-1 border' : ''
        document.getElementById(`${stid}-wbar-${i}`).style.height = `${wspd[i] * multiplier}px`
        document.getElementById(`${stid}-gbar-${i}`).style.height = `${(gust[i] - wspd[i]) * multiplier}px`
    }
};

function barHeightRange(data, pxMin, pxMax) {
    const min = Math.min(...data)
    const max = Math.max(...data)
    return data.map(d => Math.round(((d - min) * pxMax)/(max - min)) + pxMin)
};

function windBarColor(stid, data) {
    const yellow = (stid==='AMB' || stid==='OGP') ? 20 : stid==='FPS' ? 15 : 10
    const red = (stid==='AMB' || stid==='OGP') ? 30 : 20
    const barColor = data.map(d => (d > yellow && d < red) ? 'var(--bs-yellow)' : d >= red ? 'var(--bs-orange)' : 'var(--bs-teal)')
    for (let i=0; i<data.length; i++) {
        document.getElementById(`${stid}-wbar-${i}`).style.backgroundColor = barColor[i]
    }
};

function windSpeed(stid, wspd) {
    wspd.push(wspd[wspd.length - 1])
    wspd = wspd.map(d => d === null ? '&nbsp;' : d < 0.5 ? 'Calm' : Math.round(d))
    if (stid !== 'tile') {
        for (let i=0; i<wspd.length; i++) {
            const element = document.getElementById(`${stid}-wspd-${i}`)
            if (wspd[i] === 'Calm' && i !== wspd.length - 1) element.className = 'fs-3 fw-normal'
            if (wspd[i] === 'Calm' && i === wspd.length - 1) element.className = 'align-self-end fs-1 text-center'
            element.innerHTML = wspd[i]
        }
    }
    else if (wspd[wspd.length - 1] === '&nbsp;') document.getElementById(`${stid}-wspd-12`).style.display = 'none'
    else document.getElementById(`${stid}-wspd-12`).innerHTML = wspd[wspd.length - 1]
};

function windGust(stid, gust) {
    gust.push(gust[gust.length - 1])
    gust = gust.map(d => !d ? '&nbsp;' : `g${Math.round(d)}`)
    if (stid !== 'tile') {
        for (let i=0; i<gust.length; i++) document.getElementById(`${stid}-gust-${i}`).innerHTML = gust[i]
    }
    else if (gust[gust.length - 1] === '&nbsp;') document.getElementById(`${stid}-gust-12`).style.display = 'none'
    else document.getElementById(`${stid}-gust-12`).innerHTML = gust[gust.length - 1]
};

function zone(temp, alti, time, count = 3, barHeight = [], start) {
    const timeMarker = time[time.length - 1].slice(-5,-3)
    for (let i=time.length - 1; i>0; i--) {
        if (time[i].slice(-5,-3) === timeMarker) {
            barHeight.push(alti[i])
            if (count === 0) start = time[i].toLowerCase()
            const zone = calculateZone(alti[i], temp[i])
            document.getElementById(`alti-${count}`).innerHTML = (alti[i]).toFixed(2)
            document.getElementById(`zone-${count}`).innerHTML = zone.num
            document.getElementById(`zone-${count}`).style.color = zone.col
            if (zone.num === 'LoP') document.getElementById(`zone-${count}`).className = 'fs-2 fw-semibold negative-vert-pad'
            count --
        }
        if (count < 0) break
    }
    barHeight = barHeightRange(barHeight, 0, 20).reverse()
    for (let i=0; i<barHeight.length; i++) {
        document.getElementById('temp-main').style.display = 'block'
        document.getElementById(`altibar-${i}`).style.height = `${barHeight[i]}px`
    }
    document.getElementById('zone-time-range').innerHTML = `${start} - ${time[time.length - 1].toLowerCase()} @KSLC`
};

function calculateZone(alti, temp, currentZones = [], zone = {}) {
//     const zoneSlope = [0.05, 0.12, 0.19, 0.33, 0.47, 0.54, 0.62, -1]
//     const zoneIntercept = [29.91, 30.01, 30.11, 30.27, 30.43, 30.53, 30.65, 100]
    // Alt data
    const zoneSlope = [0.0714, 0.0714, 0.0714, 0.3, 0.4286, 0.4286, 0.5429, -1]
    const zoneIntercept = [29.9214, 30.0514, 30.1114, 30.27, 30.4286, 30.4486, 30.6228, 100]
    for (let i=0; i<zoneSlope.length; i++) currentZones.push(Math.round((zoneSlope[i] / -110 * temp + zoneIntercept[i]) * 100) / 100)
    zone.num = currentZones.findIndex(d => d >= alti)
    if (zone.num === 0 || zone.num === 7) zone.col = 'var(--bs-red)'
    else if (zone.num===1 || zone.num===6) zone.col = 'var(--bs-orange)'
    else if (zone.num===2 || zone.num===5) zone.col = 'var(--bs-yellow)'
    else zone.col = 'var(--bs-teal)'
    zone.num = alti == currentZones[3] ? 'LoP' : zone.num
    zone.num = zone.num === 0 ? '&#9471;' : (zone.num === 'LoP') ? 'LoP' : `&#1010${zone.num + 1};`
    return zone
};

function windChart(stid, data) {
    const sliceLength = data.date_time.length < 12 ? 6 : 12
    windDirection(stid, data.wind_direction_set_1.slice(-sliceLength))
    windBarHeight(stid, data.wind_speed_set_1.slice(-sliceLength), data.wind_gust_set_1.slice(-sliceLength))
    windBarColor(stid, data.wind_speed_set_1.slice(-sliceLength))
    windSpeed(stid, data.wind_speed_set_1.slice(-sliceLength))
    windGust(stid, data.wind_gust_set_1.slice(-sliceLength))
    time(stid, data.date_time.slice(-sliceLength))
    document.getElementById(`${stid}-main`).style.display = 'block'
};

function time(stid, time) {
    time.push(time[time.length - 1])
    for (let i=0; i<time.length; i++) {
        const element = document.getElementById(`${stid}-time-${i}`)
        if (i === time.length - 1) element.innerHTML = time[i].toLowerCase()
        else element.innerHTML = stid === 'AMB' ? time[i].replace(':00','').toLowerCase() : time[i].slice(0,-3)
    }
};
