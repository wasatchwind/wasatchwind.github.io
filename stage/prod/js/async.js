'use strict';
(async () => {
    // TIMESERIES (GCP & NWS TOKEN API)
    try {
        let nwsToken
        const nwsTokenURL = 'https://us-west3-wasatchwind.cloudfunctions.net/nws-token-local-open-cors' //STAGE/LOCAL
        try { nwsToken = await (await fetch(nwsTokenURL)).json() }
        catch (error) { console.log('NWS token fetch failed') }
        const timeSeriesURL = `https://api.mesowest.net/v2/station/timeseries?&stid=KSLC&stid=UTOLY&stid=AMB&stid=KU42&stid=FPS&stid=OGP&stid=HF012&recent=520&vars=air_temp,altimeter,wind_direction,wind_gust,wind_speed&units=english,speed|mph,temp|F&obtimezone=local&timeformat=%-I:%M%20%p&token=${nwsToken.token}`
        const timeSeriesData = await (await fetch(timeSeriesURL)).json()
        if (timeSeriesData.SUMMARY.RESPONSE_MESSAGE === 'OK') {
            ensureWindData(timeSeriesData)
            ensureGustData(timeSeriesData)
            ensureDirData(timeSeriesData)
            if (timeSeriesData.STATION[0].STID === 'KSLC') {
                kslcTiles(timeSeriesData.STATION[0].OBSERVATIONS)
                zoneHistoryChart(timeSeriesData.STATION[0].OBSERVATIONS)
            }
            for (let i=0; i<timeSeriesData.STATION.length; i++) windChart(timeSeriesData.STATION[i].STID, timeSeriesData.STATION[i].OBSERVATIONS)
        }
        else throw(console.log('Timeseries fetch failed'))
    } catch (error) {
        console.log(error)
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
        const windMapImageURL = 'https://storage.cloud.google.com/wasatch-wind-static/wind-map-save.png'
        document.getElementById('wind-map-timestamp').innerHTML = `Wind Map @ ${timestamp}`
        // document.getElementById('surface-wind-map').src = windMapImageURL
        document.getElementById('surface-wind-map').src = './prod/images/pg.gif'
        
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
    const latestCamImageURL = 'https://meso1.chpc.utah.edu/station_cameras/armstrong_cam/armstrong_cam_current.jpg'
    document.getElementById('latest-cam').src = 'https://www.wrh.noaa.gov/images/slc/camera/latest/darren2.latest.jpg'
    document.getElementById('latest-cam').src = latestCamImageURL
    document.getElementById('spinner').style.display = 'none'
    document.getElementById('wind').style.display = 'block'

    const openMeteoURL = 'https://api.open-meteo.com/v1/gfs?latitude=40.79&longitude=-111.98&hourly=windspeed_850hPa,windspeed_800hPa,windspeed_750hPa,windspeed_700hPa,windspeed_650hPa,windspeed_600hPa,windspeed_550hPa,windspeed_500hPa,winddirection_850hPa,winddirection_800hPa,winddirection_750hPa,winddirection_700hPa,winddirection_650hPa,winddirection_600hPa,winddirection_550hPa,winddirection_500hPa&windspeed_unit=mph&timezone=America%2FDenver'
    const openMeteoData = await (await fetch(openMeteoURL)).json()
    const timeMod = now.getHours() + 1
    for (let i=0; i<8; i++) {
        document.getElementById(`wspd-19k-${i}`).innerHTML = Math.round(openMeteoData.hourly.windspeed_500hPa[i + timeMod])
        document.getElementById(`wdir-19k-${i}`).style.transform = `rotate(${openMeteoData.hourly.winddirection_500hPa[i + timeMod] + 90}deg)`
        document.getElementById(`wspd-16k-${i}`).innerHTML = Math.round(openMeteoData.hourly.windspeed_550hPa[i + timeMod])
        document.getElementById(`wdir-16k-${i}`).style.transform = `rotate(${openMeteoData.hourly.winddirection_550hPa[i + timeMod] + 90}deg)`
        document.getElementById(`wspd-14k-${i}`).innerHTML = Math.round(openMeteoData.hourly.windspeed_600hPa[i + timeMod])
        document.getElementById(`wdir-14k-${i}`).style.transform = `rotate(${openMeteoData.hourly.winddirection_600hPa[i + timeMod] + 90}deg)`
        document.getElementById(`wspd-12k-${i}`).innerHTML = Math.round(openMeteoData.hourly.windspeed_650hPa[i + timeMod])
        document.getElementById(`wdir-12k-${i}`).style.transform = `rotate(${openMeteoData.hourly.winddirection_650hPa[i + timeMod] + 90}deg)`
        document.getElementById(`wspd-10k-${i}`).innerHTML = Math.round(openMeteoData.hourly.windspeed_700hPa[i + timeMod])
        document.getElementById(`wdir-10k-${i}`).style.transform = `rotate(${openMeteoData.hourly.winddirection_700hPa[i + timeMod] + 90}deg)`
        document.getElementById(`wspd-8k-${i}`).innerHTML = Math.round(openMeteoData.hourly.windspeed_750hPa[i + timeMod])
        document.getElementById(`wdir-8k-${i}`).style.transform = `rotate(${openMeteoData.hourly.winddirection_750hPa[i + timeMod] + 90}deg)`
        document.getElementById(`wspd-6k-${i}`).innerHTML = Math.round(openMeteoData.hourly.windspeed_800hPa[i + timeMod])
        document.getElementById(`wdir-6k-${i}`).style.transform = `rotate(${openMeteoData.hourly.winddirection_800hPa[i + timeMod] + 90}deg)`
        document.getElementById(`wspd-5k-${i}`).innerHTML = Math.round(openMeteoData.hourly.windspeed_850hPa[i + timeMod])
        document.getElementById(`wdir-5k-${i}`).style.transform = `rotate(${openMeteoData.hourly.winddirection_850hPa[i + timeMod] + 90}deg)`
        let test = new Date(openMeteoData.hourly.time[i + timeMod]).toLocaleTimeString('en-us', {hour: 'numeric'}).toLowerCase()
        document.getElementById(`wlft-time-${i}`).innerHTML = test
    }
})();
