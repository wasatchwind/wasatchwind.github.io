'use strict';
// IIFE ASYNC MESONET PRIVATE API FOR TIME SERIES: https://developers.synopticdata.com/mesonet
(async () => {
//     const url = 'https://wasatchwind.github.io/example_time_series.json'
    const url = `https://api.mesowest.net/v2/station/timeseries?&stid=KSLC&stid=UTOLY&stid=AMB&stid=KU42&stid=FPS&stid=C8948&stid=OGP&recent=420&vars=air_temp,altimeter,wind_direction,wind_gust,wind_speed&units=english,speed|mph,temp|F&obtimezone=local&timeformat=%-I:%M%20%p&token=6243aadc536049fc9329c17ff2f88db3`
    const response = await fetch(url)
    const tsData = await response.json()
    if (tsData) {
        if (tsData.STATION[0].STID==='KSLC') kslcAltiTempZone(tsData.STATION[0].OBSERVATIONS)
        let stations = []
        for (let i=0; i<tsData.STATION.length; i++) {
            stations[i] = tsData.STATION[i].OBSERVATIONS
            stations[i].stid = tsData.STATION[i].STID
            windChart(stations[i])
        }
    }
})();

function kslcAltiTempZone(data, time=[], alti=[], temp=[]) {
    const latestAlti = parseFloat(data.altimeter_set_1.slice(-1)).toFixed(2)
    const latestTemp = Math.round(data.air_temp_set_1.slice(-1))
    let latestZone = calculateZone(latestAlti, latestTemp)
    const zoneColor = (latestZone===0 || latestZone===7) ? wwRed : (latestZone===1 || latestZone===6) ? wwOrg : (latestZone===2 || latestZone===5) ? wwYlw : wwGrn
    latestZone = latestZone===0 ? '&#9471;' : (latestZone==='LoP') ? 'LoP' : `&#1010${latestZone+1}`
    document.getElementById('KSLC-zone').innerHTML = latestZone
    document.getElementById('KSLC-zone').style.color = zoneColor
    for (let i=0; i<data.date_time.length; i++) {
        if (data.date_time[i].slice(-5,-3)==='00') {
            time.push(data.date_time[i].toLowerCase().replace(/:\d{2}/g, ''))
            temp.push(`${Math.round(data.air_temp_set_1[i])}&deg;`)
            alti.push(data.altimeter_set_1[i].toFixed(2))
        }
    }
    const hourlyData = {'time':time.slice(-6), 'temp':temp.slice(-6), 'alti':alti.slice(-6)}
    zone(hourlyData)
}

function calculateZone(alti, temp, currentZones = []) {
    const zoneSlope = [0.05, 0.12, 0.19, 0.33, 0.47, 0.54, 0.62, -1]
    const zoneIntercept = [29.91, 30.01, 30.11, 30.27, 30.43, 30.53, 30.65, 100]
    for (let i=0; i<zoneSlope.length; i++) currentZones.push(Math.round((zoneSlope[i]/-110*temp+zoneIntercept[i])*100)/100)
    const zone = currentZones.findIndex(d => d >= alti)
    return alti===currentZones[3] ? 'LoP' : zone
}

function zone(data, zDigit=[]) {
    for (let i=0; i<data.alti.length; i++) zDigit.push(calculateZone(parseFloat(data.alti[i]), parseInt(data.temp[i])))
    const zColor = zDigit.map(d => (d===0 || d===7) ? wwRed : (d===1 || d===6) ? wwOrg : (d===2 || d===5) ? wwYlw : wwGrn)
    const zFormatted = zDigit.map(d => d===0 ? '&#9471;' : d==='LoP' ? '<span class="display-3 fw-bold">LoP</span>' : `&#1010${d+1}`)
    const min = Math.min(...data.alti)
    const max = Math.max(...data.alti)
    const barHeight = data.alti.map(d => `${(((d-min)*80)/(max-min))+10}px`)
    for (let i=0; i<6; i++) {
        const element = document.getElementById(`KSLC-zone-${i}`)
        element.innerHTML = zFormatted[i]
        element.style.color = zColor[i]
        document.getElementById(`KSLC-alti-${i}`).innerHTML = data.alti[i]
        document.getElementById(`KSLC-temp-${i}`).innerHTML = data.temp[i]
        document.getElementById(`KSLC-alti-time-${i}`).innerHTML = data.time[i]
        document.getElementById(`KSLC-altibar-${i}`).style.height = barHeight[i]
    }
}

function windChart(data) {
    const ylwLim = (data.stid==='AMB' || data.stid==='OGP') ? 19 : data.stid==='FPS' ? 15 : 9
    const redLim = (data.stid==='AMB' || data.stid==='OGP') ? 29 : 19
    const length = data.stid==='AMB' ? 6 : 12
    document.getElementById(`${data.stid}-main`).style.display = 'block'
    for (let key in data) data[key] = data[key].slice(-length)
    time(data.stid, data.date_time)
    wind(data.stid, data.wind_speed_set_1, ylwLim, redLim)
    if (data.wind_direction_set_1) wdir(data.stid, data.wind_direction_set_1)
    if (data.wind_gust_set_1) gust(data.stid, data.wind_gust_set_1, data.wind_speed_set_1)
    else { for (let i=0; i<length; i++) { document.getElementById(`${data.stid}-gust-${i}`).innerHTML = '&nbsp;' } }
}

function time(stid, data) {
    document.getElementById(`${stid}-time`).innerHTML = data[data.length-1].toLowerCase()
    data = data.map(d => data.length<11 ? d.toLowerCase().replace(':00', '') : d.toLowerCase().slice(0,-3))
    for (let i=0; i<data.length; i++) document.getElementById(`${stid}-time-${i}`).innerHTML = data[i]
}

function wind(stid, data, ylwLim, redLim) {
    data = data.map(d => Math.round(d)>=1 ? Math.round(d) : d===null ? '&nbsp;' : '<span class="fs-3 fw-normal">Calm</span>')
    const barHeight = data.map(d => d!=='' ? `${d*4}px` : '0px')
    const barColor = data.map(d => (d>ylwLim && d<redLim) ? wwYlw : d>=redLim ? wwOrg : wwGrn)
    document.getElementById(`${stid}-wind`).innerHTML = typeof data[data.length-1]==='string' ? '<span class="display-5 fw-bold">Calm</span>' : data[data.length-1]
    for (let i=0; i<data.length; i++) {
        document.getElementById(`${stid}-wind-${i}`).innerHTML = data[i]
        let element = document.getElementById(`${stid}-wbar-${i}`)
        element.style.height = barHeight[i]
        element.style.backgroundColor = barColor[i]
    }
}

function wdir(stid, data) {
    const wimg = data.map(d => d>0 ? '&#10148;' : '&nbsp;')
    const wdir = data.map(d => d>0 ? `rotate(${d+90}deg)` : '')
    document.getElementById(`${stid}-wdir`).innerHTML = wimg[wimg.length-1]
    document.getElementById(`${stid}-wdir`).style.transform = wdir[wdir.length-1]
    for (let i=0; i<data.length; i++) {
        const element = document.getElementById(`${stid}-wdir-${i}`)
        element.innerHTML = wimg[i]
        element.style.transform = wdir[i]
    }
}

function gust(stid, data, wind, barHeight=[]) {
    for (let i=0; i<data.length; i++) barHeight.push(data[i]>=1 ? `${(data[i]-wind[i])*4}px` : '0px')
    data = data.map(d => d>=1 ? `g${Math.round(d)}` : '&nbsp;')
    if (data[data.length-1]!=='&nbsp;') {
        document.getElementById(`${stid}-gust`).innerHTML = data[data.length-1]
        document.getElementById(`${stid}-gust`).style.display = 'block'
    }
    for (let i=0; i<data.length; i++) {
        document.getElementById(`${stid}-gust-${i}`).innerHTML = data[i]
        document.getElementById(`${stid}-gbar-${i}`).style.height = barHeight[i]
    }
}
