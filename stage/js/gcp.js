'use strict';
function windAloft(data) {
    const range = (now.getHours() > 3 && now.getHours() < 13) ? '12' : (now.getHours() > 18 || now.getHours() < 4) ? '24' : '06'
    const link = `https://www.aviationweather.gov/windtemp/data?level=low&fcst=${range}&region=slc&layout=on&date=`
    document.getElementById('wind-aloft-link').setAttribute('href', link)
    const ylwSpds = [9, 12, 15, 21]
    const redSpds = [14, 18, 24, 30]
    const alts = ['6k', '9k', '12k', '18k']
    const windBarWidthMulitplier = (Math.max(...Object.values(data.Spds)) > 79) ? 1.5 : 2.5
    document.getElementById('aloft-start').innerHTML = data['Start time']
    document.getElementById('aloft-end').innerHTML = data['End time']
    for (let i=0; i<4; i++) {
        let element = document.getElementById(`dir-${i}`)
        let text = (data.Dirs[alts[i]]==='calm') ? 'Calm' : '&#10148;'
        element.innerHTML = text
        element.style.transform = `rotate(${data.Dirs[alts[i]] + 90}deg)`
        if (data.Dirs[alts[i]]==='calm') {
            document.getElementById(`aloft-${i}`).style.display = 'none'
            document.getElementById(`mph-${i}`).style.display = 'none'
        }
        else {
            document.getElementById(`spd-${i}`).innerHTML = data.Spds[alts[i]]
            document.getElementById(`aloft-${i}`).style.width = `${data.Spds[alts[i]] * windBarWidthMulitplier}%`
            document.getElementById(`aloft-${i}`).style.backgroundColor = (data.Spds[alts[i]] > ylwSpds[i] && data.Spds[alts[i]] < redSpds[i]) ? 'var(--bs-yellow)' : (data.Spds[alts[i]] >= redSpds[i] ? 'var(--bs-red)' : 'var(--bs-teal)')
        }
    }
};
