'use strict';
(async () => {
    const nwsForecastUrl = 'https://api.weather.gov/gridpoints/SLC/97,175/forecast'
    const nwsLatestUrl = 'https://api.weather.gov/stations/KSLC/observations/latest'
    const timeSeriesUrl = 'https://api.mesowest.net/v2/station/timeseries?&stid=KSLC&stid=UTOLY&stid=AMB&stid=KU42&stid=FPS&stid=C8948&stid=OGP&stid=HF012&recent=420&vars=air_temp,altimeter,wind_direction,wind_gust,wind_speed&units=english,speed|mph,temp|F&obtimezone=local&timeformat=%-I:%M%20%p&token=6243aadc536049fc9329c17ff2f88db3'

    const nwsForecastResponse = await fetch(nwsForecastUrl)
    const nwsForecastData = await nwsForecastResponse.json()
    const nwsLatestResponse = await fetch(nwsLatestUrl)
    const nwsLatestData = await nwsLatestResponse.json()
    const timeSeriesResponse = await fetch(timeSeriesUrl)
    const timeSeriesData = await timeSeriesResponse.json()

    const maxTempF = maxTemp(nwsForecastData)
    document.getElementById('latest-icon').src = nwsLatestData.properties.icon
    document.getElementById('latest-cam').src = 'https://meso1.chpc.utah.edu/station_cameras/armstrong_cam/armstrong_cam_current.jpg'
    timeSeries(timeSeriesData)

    document.getElementById('spinner').style.display = 'none'
    document.getElementById('wind').style.display = 'block'
})();
