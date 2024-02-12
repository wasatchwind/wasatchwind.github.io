'use strict';
// OPEN WEATHER MAP SUNSET (main.js) https://openweathermap.org/current
(async () => {
  const openweathermapURL = 'https://api.openweathermap.org/data/2.5/weather?lat=40.7707&lon=-111.965&units=imperial&appid=b6a86a0bc25e260e4db9c7f98654ad08'
  try {
    const openweathermapData = await (await fetch(openweathermapURL)).json()
    sunset(openweathermapData)
  } catch (error) { console.log('Open Weather Map data fetch failed') }
})();

// TIME SERIES (timeseries.js) https://docs.synopticdata.com/services/time-series
(async () => {
  const timeSeriesURL = 'https://api.synopticdata.com/v2/station/timeseries?&stid=KSLC&stid=UTOLY&stid=AMB&stid=KU42&stid=FPS&stid=OGP&stid=HF012&recent=720&vars=air_temp,altimeter,wind_direction,wind_gust,wind_speed&units=english,speed|mph,temp|F&obtimezone=local&timeformat=%-I:%M%20%p&token=f8258474e4a348ceb3192e4d205f71da'
  try {
    const timeSeriesData = await (await fetch(timeSeriesURL)).json()
    timeSeries(timeSeriesData)
  } catch { console.log('Timeseries data fetch failed') }
})();

// SOUNDING (sounding.js)
(async () => {
  const soundingURL = 'https://storage.googleapis.com/wasatch-wind-static/raob.json'
  try {
    const soundingData = await (await fetch(soundingURL)).json()
    sounding(soundingData)
  } catch { console.log('Sounding data fetch failed') }
})();

// GCP WIND MAP (main.js)
(async () => {
  const windMapDataURL = 'https://storage.googleapis.com/storage/v1/b/wasatch-wind-static/o/wind-map-save.png'
  try {
    const windMapData = await (await fetch(windMapDataURL)).json()
    windMap(windMapData)
  } catch { console.log('Wind Map timestamp fetch failed') }
})();


// try {
//   let windMapData
//   const windMapDataURL = 'https://storage.googleapis.com/storage/v1/b/wasatch-wind-static/o/wind-map-save.png'
//   try { windMapData = await (await fetch(windMapDataURL)).json() }
//   catch (error) { console.log('Wind map fetch failed') }
//   const timestamp = new Date(windMapData.timeCreated).toLocaleString('en-US', {hour: 'numeric', minute: '2-digit'}).toLowerCase();
//   const windMapImageURL = 'https://storage.cloud.google.com/wasatch-wind-static/wind-map-save.png'
//   document.getElementById('wind-map-timestamp').innerHTML = `Wind Map @ ${timestamp}`
// } catch (error) { console.log(error) }