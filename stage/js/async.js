'use strict';
(async () => {
    const timeSeriesUrl = 'https://api.mesowest.net/v2/station/timeseries?&stid=KSLC&stid=UTOLY&stid=AMB&stid=KU42&stid=FPS&stid=OGP&stid=HF012&recent=420&vars=air_temp,altimeter,wind_direction,wind_gust,wind_speed&units=english,speed|mph,temp|F&obtimezone=local&timeformat=%-I:%M%20%p&token=6243aadc536049fc9329c17ff2f88db3'
    const kslcHourlyForecastUrl = 'https://api.weather.gov/gridpoints/SLC/97,175/forecast/hourly'
    const nwsForecastUrl = 'https://api.weather.gov/gridpoints/SLC/97,175/forecast'
    const nwsLatestUrl = 'https://api.weather.gov/stations/KSLC/observations/latest'
    const windAloftUrl = 'https://us-west3-wasatchwind.cloudfunctions.net/wind-aloft-ftp'
    const windMapDataUrl = 'https://storage.googleapis.com/storage/v1/b/wasatch-wind-static/o/wind-map-save.png'
    const soundingUrl = 'https://storage.googleapis.com/wasatch-wind-static/raob.json'
    const soaringForecastUrl = 'https://storage.googleapis.com/wasatch-wind-static/soaring.json'

    const timeSeriesResponse = await fetch(timeSeriesUrl)
    const timeSeriesData = await timeSeriesResponse.json()
    const kslcHourlyForecastResponse = await fetch(kslcHourlyForecastUrl)
    const kslcHourlyForecastData = await kslcHourlyForecastResponse.json()
    const nwsForecastResponse = await fetch(nwsForecastUrl)
    const nwsForecastData = await nwsForecastResponse.json()
    const nwsLatestResponse = await fetch(nwsLatestUrl)
    const nwsLatestData = await nwsLatestResponse.json()
    const windAloftResponse = await fetch(windAloftUrl)
    const windAloftData = await windAloftResponse.json()
    const windMapResponse = await fetch(windMapDataUrl)
    const windMapData = await windMapResponse.json()
    const soundingResponse = await fetch(soundingUrl)
    soundingData = await soundingResponse.json()
    const soaringForecastResponse = await fetch(soaringForecastUrl)
    const soaringForecastData = await soaringForecastResponse.json()

    const recent = formatTimeSeries(timeSeriesData.STATION)
    const kslcHourlyHistory = hourlyHistory(recent.KSLC)
    const kslcHourlyForecast = hourlyForecast(kslcHourlyForecastData)
    zoneTile(recent.KSLC.alti.slice(-1), recent.KSLC.temp.slice(-1))
    for (const key in recent) windChart(key, recent[key])
    windAloftDir(windAloftData.Dirs)
    windAloftSpeed(windAloftData.Spds)
    windAloftTime(windAloftData["Start time"], windAloftData["End time"])
    pressureHistory(kslcHourlyHistory.alti, kslcHourlyHistory.temp, kslcHourlyHistory.time)
    tempTrend(kslcHourlyHistory, recent.KSLC, kslcHourlyForecast)
    const soaringForecastMaxTempF = soaringForecastData["Max temp"]
    const nwsForecastMaxTempF = nwsForecastData.properties.periods[0].temperature
    maxTempF = now.getHours() > 6 ? soaringForecastMaxTempF : nwsForecastMaxTempF
    windMapImage(windMapData)
    if (now.getHours() > 6 && now.getHours() < 16) windSurfaceForecastGraphical()
    nwsForecastProcess(nwsForecastData)
    liftParams = getLiftParams(soundingData, maxTempF)
    decodedSkewTChart(soundingData, maxTempF, liftParams)
    document.getElementById('max-temp').innerHTML = `${maxTempF}&deg;`
    document.getElementById('neg3').innerHTML = Math.round(liftParams.neg3 * 3.28084).toLocaleString()
    document.getElementById('tol').innerHTML = Math.round(liftParams.tol * 3.28084).toLocaleString()
    document.getElementById('latest-icon').src = nwsLatestData.properties.icon
    document.getElementById('latest-cam').src = 'https://meso1.chpc.utah.edu/station_cameras/armstrong_cam/armstrong_cam_current.jpg'
    document.getElementById('spinner').style.display = 'none'
    document.getElementById('title-date').innerHTML = `KSLC @ ${recent.KSLC.time[11]}&nbsp;&nbsp;&#8226;&nbsp;&nbsp;${titleDate}`
    document.getElementById('wind').style.display = 'block'
})();
