'use strict';
(async () => {
    // TIMESERIES ALL STATIONS (GCP & NWS TOKEN API)
    try {
        let nwsToken
        const nwsTokenURL = 'https://us-west3-wasatchwind.cloudfunctions.net/nws-token-2'
        try { nwsToken = await (await fetch(nwsTokenURL)).json() }
        catch (error) { console.log('NWS token fetch failed') }
        const timeSeriesURL = `https://api.mesowest.net/v2/station/timeseries?&stid=KSLC&stid=UTOLY&stid=AMB&stid=KU42&stid=FPS&stid=OGP&stid=HF012&recent=420&vars=air_temp,altimeter,wind_direction,wind_gust,wind_speed&units=english,speed|mph,temp|F&obtimezone=local&timeformat=%-I:%M%20%p&token=${nwsToken.token}`
        const kslcZoneDataURL = `https://api.mesowest.net/v2/station/timeseries?&stid=KSLC&recent=800&vars=air_temp,altimeter&units=english,speed|mph,temp|F&obtimezone=local&timeformat=%-I:%M%20%p&token=${nwsToken.token}`
        const timeSeriesData = await (await fetch(timeSeriesURL)).json()
        const kslcZoneData = await (await fetch(kslcZoneDataURL)).json()
        zoneHistoryChart(kslcZoneData.STATION[0].OBSERVATIONS)
        if (timeSeriesData.SUMMARY.RESPONSE_MESSAGE === 'OK') {
            ensureWindData(timeSeriesData)
            ensureGustData(timeSeriesData)
            ensureDirData(timeSeriesData)
            if (timeSeriesData.STATION[0].STID === 'KSLC') kslcTiles(timeSeriesData.STATION[0].OBSERVATIONS)
            for (let i=0; i<timeSeriesData.STATION.length; i++) windChart(timeSeriesData.STATION[i].STID, timeSeriesData.STATION[i].OBSERVATIONS)
        }
        else throw(console.log('Timeseries fetch failed'))
    } catch (error) {
        document.getElementById('tile-wspd-12').innerHTML = 'Timeseries data error<br>Refresh or try again later'
        document.getElementById('tile-wspd-12').className = 'fs-2'
    }

    // WIND ALOFT (GCP)
    try {
        const windAloftURL = 'https://us-west3-wasatchwind.cloudfunctions.net/wind-aloft-ftp'
        const windAloftData = await (await fetch(windAloftURL)).json()
        windAloftDir(windAloftData.Dirs)
        windAloftSpeed(windAloftData.Spds)
        windAloftTime(windAloftData["Start time"], windAloftData["End time"])
    } catch (error) {
        console.log('Wind aloft fetch failed')
        document.getElementById('wind-aloft').innerHTML = 'Data error: Refresh or try again later'
    }

    // SOUNDING/RAOB (GCP)
    const maxTempURL = 'https://storage.googleapis.com/wasatch-wind-static/maxtemp.json'
    const soundingURL = 'https://storage.googleapis.com/wasatch-wind-static/raob.json'
    try {
        maxTempF = (await (await fetch(maxTempURL)).json()).maxtemp
        document.getElementById('max-temp').innerHTML = maxTempF ? `${maxTempF}&deg;` : 'err'
    } catch (error) { console.log('Max temp fetch failed') }
    try {
        soundingData = await (await fetch(soundingURL)).json()
    } catch (error) { console.log('Sounding data fetch failed') }
    if (maxTempF && soundingData) {
        liftParams = getLiftParams(maxTempF, soundingData)
        document.getElementById('neg3').innerHTML = liftParams.neg3 ? Math.round(liftParams.neg3 * 3.28084).toLocaleString() : '--'
        document.getElementById('tol').innerHTML = liftParams.tol ? Math.round(liftParams.tol * 3.28084).toLocaleString() : '--'
        decodedSkewTChart(maxTempF, soundingData, liftParams)
    }

    // LATEST WEATHER OBSERVATIONS (NWS PUBLIC API)
    try {
        let nwsLatestData
        const nwsLatestURL = 'https://api.weather.gov/stations/KSLC/observations/latest'
        try { nwsLatestData = await (await fetch(nwsLatestURL)).json() }
        catch (error) { console.log ('NWS latest fetch failed') }
        if (nwsLatestData.properties) {
            document.getElementById('current-icon').src = nwsLatestData.properties.icon
        }
    } catch (error) { console.log(error) }

    // WIND MAP SNAPSHOT (GCP)
    try {
        let windMapData
        const windMapDataURL = 'https://storage.googleapis.com/storage/v1/b/wasatch-wind-static/o/wind-map-save.png'
        try { windMapData = await (await fetch(windMapDataURL)).json() }
        catch (error) { console.log('Wind map fetch failed') }
        const timestamp = new Date(windMapData.timeCreated).toLocaleString('en-US', {hour: 'numeric', minute: '2-digit'}).toLowerCase();
        document.getElementById('wind-map-timestamp').innerHTML = `Wind Map @ ${timestamp}`
    } catch (error) { console.log(error) }

    // NEXT 3 DAYS (NWS PUBLIC API)
    try {
        let nwsForecastData 
        const nwsForecastURL = 'https://api.weather.gov/gridpoints/SLC/97,175/forecast'
        try { nwsForecastData = await (await fetch(nwsForecastURL)).json() }
        catch (error) { console.log('NWS forecast fetch failed') }
        if (nwsForecastData) nwsForecastProcess(nwsForecastData)
    } catch (error) { console.log(error) }

    // SOARING FORECAST TEXT
    try {
        let soaringForecastText
        const soaringForecastURL = 'https://forecast.weather.gov/product.php?site=SLC&issuedby=SLC&product=SRG&format=TXT&version=1&glossary=0'
        try { soaringForecastText = await (await fetch(soaringForecastURL)).text() }
        catch (error) {
            console.log('Soaring Forecast fetch failed')
            document.getElementById('soaring-forecast-div').innerText = 'Data error: Refresh or try again later'
        }
        processSoaringForecast(soaringForecastText)
    } catch (error) { console.log(error) }

    // AREA FORECAST DISCUSSION TEXT
    try {
        let areaForecastText
        const areaForecastURL = 'https://forecast.weather.gov/product.php?site=NWS&issuedby=SLC&product=AFD&format=TXT&version=1&glossary=0'
        try { areaForecastText = await (await fetch(areaForecastURL)).text() }
        catch (error) {
            console.log('Area Forecast fetch failed')
            document.getElementById('area-forecast-div').innerText = 'Data error: Refresh or try again later'
        }
        processAreaForecast(areaForecastText)
    } catch (error) { console.log(error) }

    if (now.getHours() > 5 && now.getHours() < 17) {
        windSurfaceForecastGraphical()
    }
    document.getElementById('spinner').style.display = 'none'
    document.getElementById('wind').style.display = 'block'
})();