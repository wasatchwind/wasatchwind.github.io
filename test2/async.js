'use strict';
// API Documentation
// Open Weather Current (Token Required): https://openweathermap.org/current
// Open Weather Forecast (Token Required): https://openweathermap.org/forecast5
// Synoptic Time Series (Token Required): https://docs.synopticdata.com/services/time-series
// NWS Latest & Forecast: https://www.weather.gov/documentation/services-web-api
// Open Meteo Forecast: https://open-meteo.com/en/docs
// Open Meteo Historical: https://open-meteo.com/en/docs/historical-weather-api


// OPEN WEATHER API (main.js) - For getting sunset time & setting nav items order
(async () => {
  const openWeatherURL = 'https://api.openweathermap.org/data/2.5/weather?lat=40.7707&lon=-111.965&units=imperial&appid=b6a86a0bc25e260e4db9c7f98654ad08'
  try {
    const openWeatherData = await (await fetch(openWeatherURL)).json()
    if (openWeatherData.cod === 200) openWeather(openWeatherData)
    else openWeather(null)
  } catch {
    openWeather(null)
    throw new Error('Open Weather data fetch failed')
  }
})();

// SYNOPTIC TIMESERIES API (timeseries.js)
(async () => {
  const timeSeriesURL = 'https://api.synopticdata.com/v2/station/timeseries?&stid=KSLC&stid=UTOLY&stid=AMB&stid=KU42&stid=FPS&stid=OGP&stid=HF012&recent=720&vars=air_temp,altimeter,wind_direction,wind_gust,wind_speed&units=english,speed|mph,temp|F&obtimezone=local&timeformat=%-I:%M%20%p&token=f8258474e4a348ceb3192e4d205f71da'
  try {
    const timeSeriesData = await (await fetch(timeSeriesURL)).json()
    timeSeries(timeSeriesData)
  } catch { throw new Error('Synoptic Timeseries data fetch failed') }
})();

// GCP SOUNDING DATA & SOARING FORECAST TEXT FOR HIGH TEMP (sounding.js)
(async () => {
  const soundingURL = 'https://storage.googleapis.com/wasatch-wind-static/raob.json'
  try {
    const soundingData = await (await fetch(soundingURL)).json()
    const soaringForecastText = await soaringForecast()
    sounding(soundingData, soaringForecastText)
  } catch { throw new Error('GCP Sounding data fetch failed') }
})();

async function soaringForecast() {
  const soaringForecastURL = 'https://forecast.weather.gov/product.php?site=SLC&issuedby=SLC&product=SRG&format=TXT&version=1&glossary=0'
  try {
    return await (await fetch(soaringForecastURL)).text()
    } catch { throw new Error('Soaring Forecast text fetch failed') }
};

// GCP WIND MAP TIMESTAMP (main.js)
(async () => {
  const windMapDataURL = 'https://storage.googleapis.com/storage/v1/b/wasatch-wind-static/o/wind-map-save.png'
  try {
    const windMapData = await (await fetch(windMapDataURL)).json()
    windMap(windMapData)
  } catch { throw new Error('Wind Map timestamp data fetch failed') }
})();

// GCP WIND ALOFT (main.js)
// Get with text fetch instead???
(async () => {
  const windAloftURL = 'https://us-west3-wasatchwind.cloudfunctions.net/wind-aloft-ftp'
  try {
    const windAloftData = await (await fetch(windAloftURL)).json()
    windAloft(windAloftData)
  } catch { throw new Error('Wind Aloft data fetch failed') }
})();

// NEXT 3 DAYS NWS (main.js) 
(async () => {
  const nwsForecastURL = 'https://api.weather.gov/gridpoints/SLC/97,175/forecast'
  try {
    const nwsForecastData = await (await fetch(nwsForecastURL)).json()
    nwsForecast(nwsForecastData)
  } catch { throw new Error('NWS Forecast data fetch failed') }
})();

// FETCHED IMAGES
document.getElementById('hourly-chart').src = 'https://forecast.weather.gov/meteograms/Plotter.php?lat=40.7603&lon=-111.8882&wfo=SLC&zcode=UTZ003&gset=30&gdiff=10&unit=0&tinfo=MY7&ahour=0&pcmd=10001110101000000000000000000000000000000000000000000000000&lg=en&indu=1!1!1!&dd=&bw=&hrspan=48&pqpfhr=6&psnwhr=6'
document.getElementById('wind-map').src = 'https://storage.googleapis.com/wasatch-wind-static/wind-map-save.png'
document.getElementById('daybreak-east').src = 'https://www.wrh.noaa.gov/images/slc/camera/latest/darren2.latest.jpg'
document.getElementById('daybreak-southwest').src = 'https://www.wrh.noaa.gov/images/slc/camera/latest/darrenS.latest.jpg'
document.getElementById('olympus-west').src = 'https://www.wrh.noaa.gov/images/slc/camera/latest/olympuscove.latest.jpg'
document.getElementById('westvalley-east').src = 'https://meso1.chpc.utah.edu/station_cameras/armstrong_cam/armstrong_cam_current.jpg'
document.getElementById('uofu-south').src = 'https://meso1.chpc.utah.edu/station_cameras/wbbs_cam/wbbs_cam_current.jpg'
document.getElementById('uofu-west').src = 'https://meso1.chpc.utah.edu/station_cameras/wbbw_cam/wbbw_cam_current.jpg'

// LOCAL TESTING IMAGES
// document.getElementById('hourly-chart').src = 'images/Plotter.png'
// document.getElementById('wind-map').src = 'images/wind-map-save.png'
// document.getElementById('daybreak-east').src = 'images/cam.png'
// document.getElementById('daybreak-southwest').src = 'images/cam.png'
// document.getElementById('olympus-west').src = 'images/cam.png'
// document.getElementById('westvalley-east').src = 'images/cam.png'
// document.getElementById('uofu-south').src = 'images/cam.png'
// document.getElementById('uofu-west').src = 'images/cam.png'