'use strict';
// Open weather map https://openweathermap.org/current
(async () => {
  const openweathermapURL = 'https://api.openweathermap.org/data/2.5/weather?lat=40.7707&lon=-111.965&units=imperial&appid=b6a86a0bc25e260e4db9c7f98654ad08'
  // const openweathermapData = await (await fetch(openweathermapURL)).json()
  if (openweathermapData) sunset(openweathermapData) // main.js
  else console.log('Sunset fetch failed')
})();

// Synoptic time series https://docs.synopticdata.com/services/time-series
(async () => {
  const timeSeriesURL = 'https://api.synopticdata.com/v2/station/timeseries?&stid=KSLC&stid=UTOLY&stid=AMB&stid=KU42&stid=FPS&stid=OGP&stid=HF012&recent=720&vars=air_temp,altimeter,wind_direction,wind_gust,wind_speed&units=english,speed|mph,temp|F&obtimezone=local&timeformat=%-I:%M%20%p&token=f8258474e4a348ceb3192e4d205f71da'
  // const timeSeriesData = await (await fetch(timeSeriesURL)).json()
  if (timeSeriesData) timeSeries(timeSeriesData) // timeseries.js
  else console.log('Timeseries fetch failed')
})();