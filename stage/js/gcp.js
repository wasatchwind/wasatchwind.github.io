'use strict';
function windAloftTime(start, end) {
    const selector = (now.getHours() > 3 && now.getHours() < 13) ? '12' : (now.getHours() > 18 || now.getHours() < 4) ? '24' : '06'
    const link = `https://www.aviationweather.gov/windtemp/data?level=low&fcst=${selector}&region=slc&layout=on&date=`
    const range = `${start} &nbsp;&#187;&nbsp; ${end}${nextDay}`
    document.getElementById('wind-aloft-link').setAttribute('href', link)
    document.getElementById('aloft-range').innerHTML = range
};

function windAloftDir(dirs) {
    for (const key in dirs) {
        const element = document.getElementById(`dir-${key}`)
        element.innerHTML = dirs[key] === 'calm' ? 'Calm' : '&#10148;'
        element.style.transform = `rotate(${dirs[key] + 90}deg)`
    }
};

function windAloftSpeed(spds, colors = {}) {
    colors.ylw = {'6k':9, '9k':12, '12k':15, '18k':21}
    colors.red = {'6k':14, '9k':18, '12k':24, '18k':30}
    const mulitplier = (Math.max(...Object.values(spds)) > 79) ? 1.5 : 2.5
    for (const key in spds) {
        const elementSpd = document.getElementById(`spd-${key}`)
        const elementBar = document.getElementById(`aloft-${key}`)
        if (spds[key] === 0) {
            document.getElementById(`mph-${key}`).style.display = 'none'
            elementSpd.style.display = 'none'
            elementBar.style.display = 'none'
        }
        elementSpd.innerHTML = spds[key]
        elementBar.style.width = `${spds[key] * mulitplier}%`
        if (spds[key] > colors.ylw[key] && spds[key] < colors.red[key]) elementBar.style.backgroundColor =  'var(--bs-yellow)'
        else elementBar.style.backgroundColor = spds[key] >= colors.red[key] ? 'var(--bs-red)' : 'var(--bs-teal)'
    }
};

function windMapImage(data) {
    const timestamp = new Date(data.timeCreated).toLocaleString('en-US', {hour: 'numeric', minute: '2-digit'}).toLowerCase();
    document.getElementById('wind-map-timestamp').innerHTML = `Wind Map @ ${timestamp}`
    document.getElementById('surface-wind-map').src = 'https://storage.googleapis.com/wasatch-wind-static/wind-map-save.png'
};

function getLiftParams(data, temp, position = 0, raobSlope, params = {}) {
    const tempC = (temp - 32) * 5 / 9
    const surfaceAlt_m = 1289
    const dalrSlope = -101.6 // Metric equivalent to -5.4 F / 1,000' (1000/3.28084 & 3deg C) = 101.6
    const dalrYInt = surfaceAlt_m - (dalrSlope * tempC)
    // Find height of -3 index first (thermal index is -3)
    while (data[position].Temp_c - ((data[position].Altitude_m - dalrYInt) / dalrSlope) < -3) position++
    let interpolateX1 = data[position].Temp_c
    let interpolateY1 = data[position].Altitude_m
    let interpolateX2 = data[position - 1].Temp_c
    let interpolateY2 = data[position - 1].Altitude_m
    if (interpolateX1 !== interpolateX2) {
        raobSlope = (interpolateY1 - interpolateY2) / (interpolateX1 - interpolateX2)
        let roabYInt = interpolateY1 - (raobSlope * interpolateX1)
        const interpolateX = (roabYInt - dalrYInt - (3 * dalrSlope)) / (dalrSlope - raobSlope)
        params.neg3 = interpolateY1 + (interpolateX - interpolateX1) * (interpolateY2 - interpolateY1) / (interpolateX2 - interpolateX1)
    }
    else params.neg3 = (interpolateX1 + 3) * dalrSlope + dalrYInt
    params.neg3Temp = (params.neg3 - dalrYInt) / dalrSlope
    document.getElementById('user-neg3').innerHTML = Math.round(params.neg3 * 3.28084).toLocaleString()
    // Now find top of lift (thermal index is 0)
    while (data[position].Temp_c - ((data[position].Altitude_m - dalrYInt) / dalrSlope) < 0) position++
    interpolateX1 = data[position].Temp_c
    interpolateY1 = data[position].Altitude_m
    interpolateX2 = data[position - 1].Temp_c
    interpolateY2 = data[position - 1].Altitude_m
    if (interpolateX1 !== interpolateX2) {
        raobSlope = (interpolateY1 - interpolateY2) / (interpolateX1 - interpolateX2)
        raobYInt = interpolateY1 - (raobSlope * interpolateX1)
        params.tol = ((dalrSlope * roabYInt) - (raobSlope * dalrYInt)) / (dalrSlope - raobSlope)
    }
    else params.tol = (interpolateX1 * dalrSlope) + dalrYInt
    params.tolTemp = (params.tol - dalrYInt) / dalrSlope
    document.getElementById('user-tol').innerHTML = Math.round(params.tol * 3.28084).toLocaleString()
    return params
};
