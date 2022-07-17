'use strict';
(async () => {
    const timeSeriesUrl = 'https://api.mesowest.net/v2/station/timeseries?&stid=KSLC&stid=UTOLY&stid=AMB&stid=KU42&stid=FPS&stid=OGP&stid=HF012&recent=420&vars=air_temp,altimeter,wind_direction,wind_gust,wind_speed&units=english,speed|mph,temp|F&obtimezone=local&timeformat=%-I:%M%20%p&token=6243aadc536049fc9329c17ff2f88db3'
    const kslcHourlyForecastUrl = 'https://api.weather.gov/gridpoints/SLC/97,175/forecast/hourly'
    const nwsForecastUrl = 'https://api.weather.gov/gridpoints/SLC/97,175/forecast'
    const nwsLatestUrl = 'https://api.weather.gov/stations/KSLC/observations/latest'

    const timeSeriesResponse = await fetch(timeSeriesUrl)
    const timeSeriesData = await timeSeriesResponse.json()
    const kslcHourlyForecastResponse = await fetch(kslcHourlyForecastUrl)
    const kslcHourlyForecastData = await kslcHourlyForecastResponse.json()
    const nwsForecastResponse = await fetch(nwsForecastUrl)
    const nwsForecastData = await nwsForecastResponse.json()
    const nwsLatestResponse = await fetch(nwsLatestUrl)
    const nwsLatestData = await nwsLatestResponse.json()

    const recent = formatTimeSeries(timeSeriesData.STATION)
    const kslcHourlyHistory = hourlyHistory(recent.KSLC)
    const kslcHourlyForecast = hourlyForecast(kslcHourlyForecastData)
    zoneTile(recent.KSLC.alti.slice(-1), recent.KSLC.temp.slice(-1))
    for (const key in recent) windChart(key, recent[key])
    pressureHistory(kslcHourlyHistory.alti, kslcHourlyHistory.temp, kslcHourlyHistory.time)
    tempTrend(kslcHourlyHistory, recent.KSLC, kslcHourlyForecast)

    const maxTempF = maxTemp(nwsForecastData)
    document.getElementById('latest-icon').src = 'images/sct.png'//nwsLatestData.properties.icon
    document.getElementById('latest-cam').src = 'images/latest-cam.jpg'//'https://meso1.chpc.utah.edu/station_cameras/armstrong_cam/armstrong_cam_current.jpg'
    document.getElementById('title-date').innerHTML = now.toLocaleString('en-us', {weekday: 'short', month: 'short', day: 'numeric'})
    document.getElementById('spinner').style.display = 'none'
    document.getElementById('wind').style.display = 'block'
})();
