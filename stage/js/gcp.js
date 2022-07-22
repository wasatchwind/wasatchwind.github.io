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
    document.getElementById('surface-wind-map').src = '/Staging/images/wind-map-save.png'//'https://storage.googleapis.com/wasatch-wind-static/wind-map-save.png'
};
