'use strict';
let hiTemp = null; // Global variable sourced conditionally

(async () => {
  const stationsURL = buildStationURL()
  const openmeteoURL = 'https://api.open-meteo.com/v1/gfs?latitude=40.77069&longitude=-111.96503&daily=sunset,temperature_2m_max&hourly=temperature_2m,wind_speed_10m,wind_direction_10m,wind_gusts_10m,cape,lifted_index,pressure_msl,windspeed_850hPa,windspeed_800hPa,windspeed_750hPa,windspeed_700hPa,windspeed_650hPa,windspeed_600hPa,windspeed_550hPa,winddirection_850hPa,winddirection_800hPa,winddirection_750hPa,winddirection_700hPa,winddirection_650hPa,winddirection_600hPa,winddirection_550hPa,geopotential_height_850hPa,geopotential_height_800hPa,geopotential_height_750hPa,geopotential_height_700hPa,geopotential_height_650hPa,geopotential_height_600hPa,geopotential_height_550hPa&windspeed_unit=mph&temperature_unit=fahrenheit&forecast_hours=6&forecast_days=1&timezone=America%2FDenver'
  const windAloftURL = 'https://2kjkumjjzukwnuiomukqzexcfy0yfynp.lambda-url.us-west-1.on.aws' // AWS Lambda, uses CORS
  // const windAloftURL = 'https://python-wind-aloft-ftp-483547589035.us-west2.run.app' // Backup GCP Cloud Run Function in case AWS fails, does not use CORS
  const soundingURL = 'https://storage.googleapis.com/wasatch-wind-static/raob.json'
  const soaringForecastURL = 'https://forecast.weather.gov/product.php?site=SLC&issuedby=SLC&product=SRG&format=TXT&version=1&glossary=0'
  const timeSeriesURL = `https://api.synopticdata.com/v2/station/timeseries?${stationsURL}&recent=720&vars=air_temp,altimeter,wind_direction,wind_gust,wind_speed&units=english,speed|mph,temp|F&obtimezone=local&timeformat=%-I:%M%20%p&token=f8258474e4a348ceb3192e4d205f71da`
  const windMapDataURL = 'https://storage.googleapis.com/storage/v1/b/wasatch-wind-static/o/wind-map-save.png'
  const nwsForecastURL = 'https://api.weather.gov/gridpoints/SLC/97,175/forecast'
  const areaForecastURL = 'https://forecast.weather.gov/product.php?site=NWS&issuedby=SLC&product=AFD&format=TXT&version=1&glossary=0'
  
  // Open Meteo
  const openmeteoData = await (await fetch(openmeteoURL)).json()
  sunset = openmeteoData.daily.sunset[0]
  hiTemp = Math.round(openmeteoData.daily.temperature_2m_max[0])
  navSet()

  // Wind Aloft
  const gcpWindAloftData = await (await fetch(windAloftURL)).json()
  windAloft(openmeteoData.hourly, gcpWindAloftData)

  // Sounding & Soaring
  soundingData = await (await fetch(soundingURL)).json()
  const soaringForecastPageContent = await (await fetch(soaringForecastURL)).text()
  const soaringForecastText = parsePreText(soaringForecastPageContent)
  sounding(soundingData, soaringForecastText)

  // Time Series
  const timeSeriesData = await (await fetch(timeSeriesURL)).json()
  timeSeries(timeSeriesData)

  // Wind Map Metadata
  const windMapData = await (await fetch(windMapDataURL)).json()
  windMap(windMapData)

  // NWS
  const nwsForecastData = await (await fetch(nwsForecastURL)).json()
  nwsForecast(nwsForecastData)

  // Area Forecast
  const areaForecastPageContent = await (await fetch(areaForecastURL)).text()
  const areaForecastPreText = parsePreText(areaForecastPageContent)
  areaForecast(areaForecastPreText)

  displayImages()

  // Helper function to process text for Area Forecast and Soaring Forecast:
  function parsePreText(rawContent) {
    const parser = new DOMParser()
    const response = parser.parseFromString(rawContent, 'text/html')
    const preElement = response.querySelector('pre')
    return preElement.textContent
  }
})();
