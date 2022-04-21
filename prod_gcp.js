'use strict';
// GCP WIND MAP IMAGE
(async () => {
    const gcpImageURL = 'https://storage.googleapis.com/wasatch-wind-static/wind-map-save.png';
    const imageMetaUrl = 'https://storage.googleapis.com/storage/v1/b/wasatch-wind-static/o/wind-map-save.png';
    const response = await fetch(imageMetaUrl);
    const data = await response.json();
    let gcpImageTime = new Date(data.timeCreated);
    gcpImageTime = gcpImageTime.toLocaleString('en-US', {hour: 'numeric', minute: '2-digit'}).toLowerCase();
    document.getElementById('wind-map-timestamp').innerHTML = gcpImageTime
    document.getElementById('surface-wind-map').src = gcpImageURL;
//     document.getElementById('wind-map-timestamp').innerHTML = '2:45 pm'
//     document.getElementById('surface-wind-map').src = '/Staging/images/wind-map-save.png'
})();

// GCP WIND ALOFT
(async () => {
//     const url = 'https://wasatchwind.github.io/example_wind_aloft.json'
    const url = 'https://us-west3-wasatchwind.cloudfunctions.net/wind-aloft-ftp'
    const response = await fetch(url)
    const aloftData = await response.json()
    const range = (now.getHours() > 3 && now.getHours() < 13) ? '12' : (now.getHours() > 18 || now.getHours() < 4) ? '24' : '06'
    const link = `https://www.aviationweather.gov/windtemp/data?level=low&fcst=${range}&region=slc&layout=on&date=`
    document.getElementById('wind-aloft-link').setAttribute('href', link)
    const ylwSpds = [9, 12, 15, 21]
    const redSpds = [14, 18, 24, 30]
    const alts = ['6k', '9k', '12k', '18k']
    document.getElementById('aloft-start').innerHTML = aloftData['Start time']
    document.getElementById('aloft-end').innerHTML = aloftData['End time']
    for (let i=0; i<4; i++) {
        let element = document.getElementById(`dir-${i}`)
        let text = (aloftData.Dirs[alts[i]]==='calm') ? '<div class="fs-1 fw-bold">Calm</div>' : '&#10148;'
        element.innerHTML = text
        element.style.transform = `rotate(${aloftData.Dirs[alts[i]]+90}deg)`
        if (aloftData.Dirs[alts[i]]==='calm') document.getElementById(`aloft-${i}`).style.display = 'none'
        else {
            document.getElementById(`aloft-${i}`).style.width = `${aloftData.Spds[alts[i]]*0.6}%`
            document.getElementById(`spd-${i}`).innerHTML = aloftData.Spds[alts[i]]
            document.getElementById(`aloft-${i}`).style.backgroundColor = (aloftData.Spds[alts[i]] > ylwSpds[i] && aloftData.Spds[alts[i]] < redSpds[i]) ? wwYlw : (aloftData.Spds[alts[i]] >= redSpds[i] ? wwRed : wwGrn)
            document.getElementById(`mph-${i}`).innerHTML = 'mph'
        }
    }
})();

// GCP SOARING FORECAST
(async () => {
//     const url = 'https://wasatchwind.github.io/example_soaring_forecast.json'
    const url = 'https://storage.googleapis.com/wasatch-wind-static/soaring.json'
    const response = await fetch(url)
    const soarData = await response.json()
    const odt = (soarData['Overdevelopment time']==='0000' || soarData['Overdevelopment time']==='NONE') ? 'None' : soarData['Overdevelopment time']
    
    console.log(odt)
    
    const neg3 = (soarData['Height of -3 index']==='None') ? 0 : soarData['Height of -3 index']
    const tol = (soarData['Top of lift'].substr(0,5)==='Error') ? 0 : parseInt(soarData['Top of lift'])
    if (soarData['Report date']===date) {
        const maxTemp = soarData['Max temp']
        raob(maxTemp)
        document.getElementById('soarcast-tol').innerHTML = tol.toLocaleString()
        document.getElementById('soarcast-tol-m').innerHTML = `${Math.round(tol/3.281).toLocaleString()} m`
        document.getElementById('soarcast-neg3').innerHTML = parseInt(neg3).toLocaleString()
        document.getElementById('soarcast-neg3-m').innerHTML = `${Math.round(parseInt(neg3)/3.281).toLocaleString()} m`
        document.getElementById('soarcast-rol').innerHTML = parseInt(soarData['Max rate of lift']).toLocaleString()
        document.getElementById('soarcast-rol-m').innerHTML = `${Math.round((parseInt(soarData['Max rate of lift'])/197)*10)/10} m/s`
        if (odt !== 'None' && odt !== 'Error: Failed to extract overdevelopment time') {
            let odhour = parseInt(odt.substr(0,2))
            let odmins = odt.substr(2,4)
            let odtime = (odhour>12) ? `${odhour -= 12}:${odmins} pm` : (odhour===12 && odmins==='00') ? 'Noon' : (odhour===12 && odmins>0) ? `${odhour}:${odmins} pm`: `${odhour}:${odmins} am`
            document.getElementById('od-div').style.display = 'block'
            document.getElementById('od-time').innerHTML = odtime
        }
    }
    else {
        const altMaxTempurl = 'https://api.weather.gov/gridpoints/SLC/97,175'
        const altMaxTempresponse = await fetch(altMaxTempurl, {mode: 'cors'})
        const altMaxTempData = await altMaxTempresponse.json()
        const maxTemp = (altMaxTempData.properties.maxTemperature.values[0].value*9/5)+32
        raob(maxTemp)
    }
})()

// GCP ROAB
async function raob(maxTemp) {
//     const url = 'https://wasatchwind.github.io/example_raob.json'
    const url = 'https://storage.googleapis.com/wasatch-wind-static/raob.json'
    fetch(url)
        .then(response => { return response.json() })
        .then(data => {
            raobData = data
            drawD3LapseChart(raobData, maxTemp)
        })
}
