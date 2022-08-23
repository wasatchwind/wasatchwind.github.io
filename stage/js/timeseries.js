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

function zoneTile(alti, temp) {
    const zone = calculateZone(alti, parseInt(temp))
    if (zone.num === 'LoP') document.getElementById(`latest-zone`).className = 'fs-1 fw-bold'
    document.getElementById(`latest-alti`).innerHTML = alti
    document.getElementById(`latest-temp`).innerHTML = temp
    document.getElementById(`latest-zone`).innerHTML = zone.num
    document.getElementById(`latest-zone`).style.color = zone.col
};

function calculateZone(alti, temp, currentZones = [], zone = {}) {
    // Revisit these numbers using Jeff's numbers!!!!!!!!!!!!!!!!!!
    // case 0..<(-0.000714 * airTemp + 29.9214):
    //   return("Zone 0")
    // case (-0.000714 * airTemp + 29.9214)..<(-0.001714 * airTemp + 30.0514):
    //   return("Zone 1")
    // case (-0.001714 * airTemp + 30.0514)..<(-0.001714 * airTemp + 30.1114):
    //   return("Zone 2L")
    // case (-0.001714 * airTemp + 30.1114)..<(-0.003 * airTemp + 30.27):
    //   return("Zone 3-")
    // case (-0.003 * airTemp + 30.27)..<(-0.004286 * airTemp + 30.4286):
    //   return("Zone 4+")
    // case (-0.004286 * airTemp + 30.4286)..<(-0.004286 * airTemp + 30.4886):
    //   return("Zone 5H")
    // case (-0.004286 * airTemp + 30.4886)..<(-0.005429 * airTemp + 30.6228):
    //   return("Zone 6")
    // default:
    //   return("Zone 7")
    const zoneSlope = [0.05, 0.12, 0.19, 0.33, 0.47, 0.54, 0.62, -1]
    const zoneIntercept = [29.91, 30.01, 30.11, 30.27, 30.43, 30.53, 30.65, 100]
    for (let i=0; i<zoneSlope.length; i++) currentZones.push(Math.round((zoneSlope[i]/-110*temp+zoneIntercept[i])*100)/100)
    zone.num = currentZones.findIndex(d => d >= alti)
    // fix to if/else vvv
    if (zone.num === 0 || zone.num === 7) zone.col = 'var(--bs-red)'
    else if (zone.num===1 || zone.num===6) zone.col = 'var(--bs-orange)'
    else if (zone.num===2 || zone.num===5) zone.col = 'var(--bs-yellow)'
    else zone.col = 'var(--bs-teal)'
    zone.num = alti == currentZones[3] ? 'LoP' : zone.num
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
        if (zone.num === 'LoP') document.getElementById(`zonenum-${i}`).className = 'display-3 fw-bold'
        document.getElementById(`alti-${i}`).innerHTML = alti[i]
        document.getElementById(`altitime-${i}`).innerHTML = time[i].replace(':00', '')
        document.getElementById(`zonenum-${i}`).innerHTML = zone.num
        document.getElementById(`zonenum-${i}`).style.color = zone.col
        document.getElementById(`altibar-${i}`).style.height = altibar
    }
};

function windChart(stid, data) {
    const sliceLength = data.time.length < 12 ? 6 : 12
    for (const key in data) data[key] = data[key].slice(-sliceLength)
    if (data.wspd) wspd(stid, data.wspd)
    if (data.gust) gust(stid, data.gust, data.wspd)
    if (data.wdir) wdir(stid, data.wdir)
    time(stid, data.time)
    document.getElementById(`${stid}-main`).style.display = 'block'
};

function wspd(stid, wspd) {
    const multiplier = stid === 'tile' ? 2 : 4
    const wbar = wspd.map(d => !d ? null : `${d * multiplier}px`)
    const ylwLim = (stid==='AMB' || stid==='OGP') ? 19 : stid==='FPS' ? 15 : 9
    const redLim = (stid==='AMB' || stid==='OGP') ? 29 : 19
    const barColor = wspd.map(d => (d > ylwLim && d < redLim) ? 'var(--bs-yellow)' : d >= redLim ? 'var(--bs-orange)' : 'var(--bs-teal)')
    for (let i=0; i<wspd.length; i++) {
        if (stid !== 'tile') {
            document.getElementById(`${stid}-wspd-${i}`).className = wspd[i] === 'Calm' ? 'fs-3 fw-normal' : 'fs-1'
            document.getElementById(`${stid}-wspd-${i}`).innerHTML = wspd[i] ? wspd[i] : '&nbsp;'
        }
        document.getElementById(`${stid}-wbar-${i}`).style.height = wbar[i]
        document.getElementById(`${stid}-wbar-${i}`).style.backgroundColor = barColor[i]
        if (i === wspd.length - 1 && stid !== 'KSLC') {
            document.getElementById(`${stid}-wspd`).innerHTML = wspd[i] ? wspd[i] : null
        }
    }
};

function gust(stid, gust, wspd) {
    const multiplier = stid === 'tile' ? 2 : 4
    wspd = wspd.map(d => d >= 0 ? d : 0)
    for (let i=0; i<gust.length; i++) {
        if (stid !== 'tile') {
            document.getElementById(`${stid}-gust-${i}`).innerHTML = gust[i] ? `g${gust[i]}` : '&nbsp;'
        }
        document.getElementById(`${stid}-gbar-${i}`).style.height = gust[i] ? `${(gust[i] - wspd[i]) * multiplier}px` : null
        if (i === gust.length - 1 && stid !== 'KSLC') {
            if (gust[i] === null) document.getElementById(`${stid}-gust`).style.display = 'none'
            document.getElementById(`${stid}-gust`).innerHTML = gust[i] ? `g${gust[i]}` : '&nbsp;'
        }
    }
};

function wdir(stid, wdir) {
    const wimg = wdir.map(d => !d ? '&nbsp;' : '&#10148;')
    const rotate = wdir.map(d => `rotate(${d + 90}deg)`)
    for (let i=0; i<wdir.length; i++) {
        document.getElementById(`${stid}-wdir-${i}`).innerHTML = wimg[i]
        document.getElementById(`${stid}-wdir-${i}`).style.transform = rotate[i]
        if (i === wdir.length - 1 && stid !== 'KSLC') {
            if (wimg[i] === '&nbsp;') document.getElementById(`${stid}-wdir`).style.display = 'none'
            document.getElementById(`${stid}-wdir`).innerHTML = wimg[i]
            document.getElementById(`${stid}-wdir`).style.transform = rotate[i]
        }
    }
};

function time(stid, time) {
    if (stid === 'tile') {
        document.getElementById('KSLC-time-range').innerHTML = `${time[0]} - ${time[11]} @ KSLC`
        return
    }
    for (let i=0; i<time.length; i++) {
        const element = document.getElementById(`${stid}-time-${i}`)
        element.innerHTML = stid === 'AMB' ? time[i].replace(':00','') : time[i].slice(0,-3)
        if (i === time.length - 1 && stid !== 'KSLC') {
            document.getElementById(`${stid}-time`).innerHTML = time[i]
        }
    }
};
