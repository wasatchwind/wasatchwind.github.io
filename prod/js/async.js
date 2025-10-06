'use strict';
navSet(); // main.js

// Function to return an API URL assembled from specific input parameters
function buildAPIURL(params, repeatKeys = []) {
  const query = new URLSearchParams();

  for (const [key, value] of Object.entries(params)) {
    const isArray = Array.isArray(value);
    const isRepeat = repeatKeys.includes(key);

    if (isArray && isRepeat) {
      // Repeated key with multiple values (e.g. stid=...&stid=...)
      value.forEach(stid => query.append(key, stid));
    } else {
      // Single entry (either array to join, or single value)
      query.set(key, isArray ? value.join(',') : value);
    }
  }
  return query.toString();
};

// Async IIFE
// Get Open Meteo API data (documentation: https://open-meteo.com/en/docs/gfs-api)
// Get Wind Aloft data via either AWS or GCP cloud function
(async () => {
  const openMeteoParams = {
    latitude: 40.77069,
    longitude: -111.96503,
    daily: ['sunset', 'temperature_2m_max'],
    hourly: [
      'temperature_2m',
      'wind_speed_10m',
      'wind_direction_10m',
      'wind_gusts_10m',
      'cape',
      'lifted_index',
      'pressure_msl',
      'windspeed_850hPa',
      'windspeed_800hPa',
      'windspeed_750hPa',
      'windspeed_700hPa',
      'windspeed_650hPa',
      'windspeed_600hPa',
      'windspeed_550hPa',
      'winddirection_850hPa',
      'winddirection_800hPa',
      'winddirection_750hPa',
      'winddirection_700hPa',
      'winddirection_650hPa',
      'winddirection_600hPa',
      'winddirection_550hPa',
      'geopotential_height_850hPa',
      'geopotential_height_800hPa',
      'geopotential_height_750hPa',
      'geopotential_height_700hPa',
      'geopotential_height_650hPa',
      'geopotential_height_600hPa',
      'geopotential_height_550hPa',
      'temperature_800hPa'
    ],
    windspeed_unit: 'mph',
    temperature_unit: 'fahrenheit',
    forecast_hours: 12,
    forecast_days: 1,
    timezone: 'America/Denver'
  };

  const openMeteoURL = `https://api.open-meteo.com/v1/gfs?${buildAPIURL(openMeteoParams)}`;

  // Wind Aloft data - toggle between AWS and GCP (both exist for backup purposes)
  // AWS Lambda function (uses CORS config in console: Configuration > Function URL)
  const windAloftURL = 'https://2kjkumjjzukwnuiomukqzexcfy0yfynp.lambda-url.us-west-1.on.aws';
  // GCP Cloud Function (uses CORS in code)
  // const windAloftURL = 'https://python-wind-aloft-ftp-483547589035.us-west2.run.app';

  const openmeteoData = await (await fetch(openMeteoURL)).json();
  const gcpWindAloftData = await (await fetch(windAloftURL)).json();
  setHiTempAndSunset(openmeteoData.daily); // main.js
  windAloft(openmeteoData.hourly, gcpWindAloftData); // windaloft.js
  displayImages(); // main.js
})();

// Async IIFE
// Get Sounding data via GCP Cloud Storage
// Get Soaring Forecast text via the SLC Soarcast page - provides hiTemp (required to process soundingData)
(async () => {
  const soundingURL = 'https://storage.googleapis.com/wasatch-wind-static/raob.json';
  const soaringForecastURL = 'https://forecast.weather.gov/product.php?site=SLC&issuedby=SLC&product=SRG&format=TXT&version=1';
  soundingData = await (await fetch(soundingURL)).json(); // Global variable (main.js)
  const soaringForecastPageContent = await (await fetch(soaringForecastURL)).text();
  sounding(soundingData, soaringForecastPageContent); // sounding.js
})();

// Aysnc IIFE
// Get Synoptic Time Series API data (documentation: https://docs.synopticdata.com/services/weather-api)
(async () => {
  const timeSeriesURL = 'https://python-synoptic-api-483547589035.us-west3.run.app';
  const timeSeriesData = await (await fetch(timeSeriesURL)).json();
  timeSeries(timeSeriesData); // timeseries.js
})();

// Async IIFE
// Get NWS API data (documentation: https://www.weather.gov/documentation/services-web-api)
(async () => {
  const nwsForecastURL = 'https://api.weather.gov/gridpoints/SLC/97,175/forecast';
  const nwsForecastData = await (await fetch(nwsForecastURL)).json();
  nwsForecast(nwsForecastData); // main.js
})();

// Async IIFE
// Get Area Forecast text via the SLC Area Forecast page
(async () => {
  const areaForecastURL = 'https://forecast.weather.gov/product.php?site=NWS&issuedby=SLC&product=AFD&format=TXT&version=1';
  const areaForecastPageContent = await (await fetch(areaForecastURL)).text();
  areaForecast(areaForecastPageContent); // main.js
})();

// Async IIFE
// Get Wind Map metadata from GCP Cloud Storage
(async () => {
  const windMapDataURL = 'https://storage.googleapis.com/storage/v1/b/wasatch-wind-static/o/wind-map-save.png';
  const windMapData = await (await fetch(windMapDataURL)).json();
  windMap(windMapData); // main.js

})();


