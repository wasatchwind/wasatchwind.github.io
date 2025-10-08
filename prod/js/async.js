'use strict';

const openMeteoParams = {
  latitude: 40.77069,
  longitude: -111.96503,
  daily: ['sunset', 'temperature_2m_max'],
  hourly: [
    'temperature_2m', 'temperature_800hPa', 'wind_speed_10m', 'wind_direction_10m', 'wind_gusts_10m', 'cape', 'lifted_index', 'pressure_msl',
    'windspeed_850hPa', 'windspeed_800hPa', 'windspeed_750hPa', 'windspeed_700hPa', 'windspeed_650hPa', 'windspeed_600hPa', 'windspeed_550hPa',
    'winddirection_850hPa', 'winddirection_800hPa', 'winddirection_750hPa', 'winddirection_700hPa', 'winddirection_650hPa', 'winddirection_600hPa', 'winddirection_550hPa',
    'geopotential_height_850hPa', 'geopotential_height_800hPa', 'geopotential_height_750hPa', 'geopotential_height_700hPa', 'geopotential_height_650hPa', 'geopotential_height_600hPa', 'geopotential_height_550hPa'
  ],
  windspeed_unit: 'mph',
  temperature_unit: 'fahrenheit',
  forecast_hours: 12,
  forecast_days: 1,
  timezone: 'America/Denver'
};

// Function to return an API URL assembled from specific input parameters
function buildAPIURL(params, repeatKeys = []) {
  const query = new URLSearchParams();

  for (const [key, value] of Object.entries(params)) {
    if (repeatKeys.includes(key) && Array.isArray(value)) {
      value.forEach(v => query.append(key, v));
    } else {
      query.set(key, Array.isArray(value) ? value.join(',') : value);
    }
  }
  return query.toString();
}

(async () => {
  // Get Open Meteo API data (documentation: https://open-meteo.com/en/docs/gfs-api)
  // Get Wind Aloft data via either AWS or GCP cloud function (redundancy)
  async function getOpenMeteoAndWindAloft() {
    const openMeteoURL = new URL('https://api.open-meteo.com/v1/gfs?');
    openMeteoURL.search = buildAPIURL(openMeteoParams);

    // Wind Aloft data - toggle between AWS and GCP (both exist for backup purposes)
    // AWS Lambda function (uses CORS config in console: Configuration > Function URL)
    const windAloftURL = 'https://2kjkumjjzukwnuiomukqzexcfy0yfynp.lambda-url.us-west-1.on.aws';
    // GCP Cloud Function (uses CORS in source code)
    // const windAloftURL = 'https://python-wind-aloft-ftp-483547589035.us-west2.run.app';

    const [openmeteoData, gcpWindAloftData] = await Promise.all([
      fetch(openMeteoURL).then(res => res.json()),
      fetch(windAloftURL).then(res => res.json())
    ]);
    setHiTempAndSunset(openmeteoData.daily); // main.js
    navSet(); // main.js (needs sunset time first)
    await Promise.all([
      windAloft(openmeteoData.hourly, gcpWindAloftData), //windaloft.js
      displayImages() // main.js
    ]);
  }

  // Get Sounding data via GCP Cloud Storage
  // Get Soaring Forecast text via the SLC Soarcast page - provides hiTemp (required to process soundingData)
  async function getSoundingAndSoaring() {
    const soundingURL = 'https://storage.googleapis.com/wasatch-wind-static/raob.json';
    const soaringForecastURL = 'https://forecast.weather.gov/product.php?site=SLC&issuedby=SLC&product=SRG&format=TXT&version=1';

    const [soundingData, soaringForecastPageContent] = await Promise.all([ // soundingData is a global variable in main.js
      fetch(soundingURL).then(res => res.json()),
      fetch(soaringForecastURL).then(res => res.text())
    ]);
    sounding(soundingData, soaringForecastPageContent); // sounding.js
  }

  // Get Synoptic Time Series API data (documentation: https://docs.synopticdata.com/services/weather-api)
  async function getTimeSeries() {
    const timeSeriesURL = 'https://python-synoptic-api-483547589035.us-west3.run.app';
    const timeSeriesData = await (await fetch(timeSeriesURL)).json();
    timeSeries(timeSeriesData.STATION); // timeseries.js
  }

  // Get NWS API data (documentation: https://www.weather.gov/documentation/services-web-api)
  async function getNWSForecast() {
    const nwsForecastURL = 'https://api.weather.gov/gridpoints/SLC/97,175/forecast';
    const nwsForecastData = await (await fetch(nwsForecastURL)).json();
    nwsForecast(nwsForecastData.properties.periods); // main.js
  }

  // Get Area Forecast text via the SLC Area Forecast page
  async function getAreaForecast() {
    const areaForecastURL = 'https://forecast.weather.gov/product.php?site=NWS&issuedby=SLC&product=AFD&format=TXT&version=1';
    const areaForecastPageContent = await (await fetch(areaForecastURL)).text();
    areaForecast(areaForecastPageContent); // main.js
  }

  // Get Wind Map metadata from GCP Cloud Storage
  async function getWindMap() {
    const windMapDataURL = 'https://storage.googleapis.com/storage/v1/b/wasatch-wind-static/o/wind-map-save.png';
    const windMapData = await (await fetch(windMapDataURL)).json();
    windMap(windMapData); // main.js
  }

  await Promise.all([
    getOpenMeteoAndWindAloft(),
    getSoundingAndSoaring(),
    getTimeSeries(),
    getNWSForecast(),
    getAreaForecast(),
    getWindMap()
  ]);
})();