'use strict';
(async () => {
  const stationsURL = buildStationURL()
  const openmeteoURL = 'https://api.open-meteo.com/v1/gfs?latitude=40.77069&longitude=-111.96503&daily=sunset,temperature_2m_max&hourly=temperature_2m,wind_speed_10m,wind_direction_10m,wind_gusts_10m,cape,lifted_index,pressure_msl,windspeed_850hPa,windspeed_800hPa,windspeed_750hPa,windspeed_700hPa,windspeed_650hPa,windspeed_600hPa,windspeed_550hPa,winddirection_850hPa,winddirection_800hPa,winddirection_750hPa,winddirection_700hPa,winddirection_650hPa,winddirection_600hPa,winddirection_550hPa,geopotential_height_850hPa,geopotential_height_800hPa,geopotential_height_750hPa,geopotential_height_700hPa,geopotential_height_650hPa,geopotential_height_600hPa,geopotential_height_550hPa&windspeed_unit=mph&temperature_unit=fahrenheit&forecast_hours=6&forecast_days=1&timezone=America%2FDenver'
  // const gcpWindAloftURL = 'https://python-wind-aloft-forecast-ftp-483547589035.us-west2.run.app'
  const gcpWindAloftURL = 'https://2kjkumjjzukwnuiomukqzexcfy0yfynp.lambda-url.us-west-1.on.aws'
  const soundingURL = 'https://storage.googleapis.com/wasatch-wind-static/raob.json'
  const soaringForecastURL = 'https://forecast.weather.gov/product.php?site=SLC&issuedby=SLC&product=SRG&format=TXT&version=1&glossary=0'
  const timeSeriesURL = `https://api.synopticdata.com/v2/station/timeseries?${stationsURL}&recent=720&vars=air_temp,altimeter,wind_direction,wind_gust,wind_speed&units=english,speed|mph,temp|F&obtimezone=local&timeformat=%-I:%M%20%p&token=f8258474e4a348ceb3192e4d205f71da`
  const windMapDataURL = 'https://storage.googleapis.com/storage/v1/b/wasatch-wind-static/o/wind-map-save.png'
  const nwsForecastURL = 'https://api.weather.gov/gridpoints/SLC/97,175/forecast'
  const areaForecastURL = 'https://forecast.weather.gov/product.php?site=NWS&issuedby=SLC&product=AFD&format=TXT&version=1&glossary=0'
  
  // Open Meteo
  const openmeteoData = await (await fetch(openmeteoURL)).json()
  sunset = openmeteoData.daily.sunset[0]
  navSet()

  // Wind Aloft
  const gcpWindAloftData = await (await fetch(gcpWindAloftURL)).json()
  windAloft(openmeteoData.hourly, gcpWindAloftData)

  // Sounding & Soaring
  soundingData = await (await fetch(soundingURL)).json()
  const soaringForecastText = await (await fetch(soaringForecastURL)).text()
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
  const areaForecastText = await (await fetch(areaForecastURL)).text()
  areaForecast(areaForecastText)

  displayImages()
})();
