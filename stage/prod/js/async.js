'use strict';

// LOCAL TESTING ONLY
// gcpWindAloftData URL: https://2kjkumjjzukwnuiomukqzexcfy0yfynp.lambda-url.us-west-1.on.aws
const gcpWindAloftData = {"forecast_24h":{"start_time":6,"end_time":18,"temperature":{"altitude_09k":51,"altitude_18k":8,"altitude_12k":37},"wind_speed":{"altitude_09k":16,"altitude_18k":39,"altitude_12k":18},"wind_direction":{"altitude_09k":200,"altitude_18k":210,"altitude_12k":190}},"forecast_12h":{"start_time":21,"end_time":6,"temperature":{"altitude_09k":55,"altitude_18k":6,"altitude_12k":41},"wind_speed":{"altitude_09k":16,"altitude_18k":47,"altitude_12k":23},"wind_direction":{"altitude_09k":210,"altitude_18k":200,"altitude_12k":200}},"forecast_06h":{"start_time":14,"end_time":21,"temperature":{"altitude_09k":51,"altitude_18k":8,"altitude_12k":37},"wind_speed":{"altitude_09k":20,"altitude_18k":44,"altitude_12k":26},"wind_direction":{"altitude_09k":200,"altitude_18k":210,"altitude_12k":190}}};
// OpenmeteoData URL: https://api.open-meteo.com/v1/gfs?latitude=40.77069&longitude=-111.96503&daily=sunset%2Ctemperature_2m_max&hourly=temperature_2m%2Cwind_speed_10m%2Cwind_direction_10m%2Cwind_gusts_10m%2Ccape%2Clifted_index%2Cpressure_msl%2Cwindspeed_850hPa%2Cwindspeed_800hPa%2Cwindspeed_750hPa%2Cwindspeed_700hPa%2Cwindspeed_650hPa%2Cwindspeed_600hPa%2Cwindspeed_550hPa%2Cwinddirection_850hPa%2Cwinddirection_800hPa%2Cwinddirection_750hPa%2Cwinddirection_700hPa%2Cwinddirection_650hPa%2Cwinddirection_600hPa%2Cwinddirection_550hPa%2Cgeopotential_height_850hPa%2Cgeopotential_height_800hPa%2Cgeopotential_height_750hPa%2Cgeopotential_height_700hPa%2Cgeopotential_height_650hPa%2Cgeopotential_height_600hPa%2Cgeopotential_height_550hPa%2Ctemperature_800hPa&windspeed_unit=mph&temperature_unit=fahrenheit&forecast_hours=12&forecast_days=1&timezone=America%2FDenver
const openmeteoData = {"latitude":40.764416,"longitude":-111.981255,"generationtime_ms":0.3898143768310547,"utc_offset_seconds":-21600,"timezone":"America/Denver","timezone_abbreviation":"GMT-6","elevation":1288.0,"hourly_units":{"time":"iso8601","temperature_2m":"°F","wind_speed_10m":"mp/h","wind_direction_10m":"°","wind_gusts_10m":"mp/h","cape":"J/kg","lifted_index":"","pressure_msl":"hPa","windspeed_850hPa":"mp/h","windspeed_800hPa":"mp/h","windspeed_750hPa":"mp/h","windspeed_700hPa":"mp/h","windspeed_650hPa":"mp/h","windspeed_600hPa":"mp/h","windspeed_550hPa":"mp/h","winddirection_850hPa":"°","winddirection_800hPa":"°","winddirection_750hPa":"°","winddirection_700hPa":"°","winddirection_650hPa":"°","winddirection_600hPa":"°","winddirection_550hPa":"°","geopotential_height_850hPa":"m","geopotential_height_800hPa":"m","geopotential_height_750hPa":"m","geopotential_height_700hPa":"m","geopotential_height_650hPa":"m","geopotential_height_600hPa":"m","geopotential_height_550hPa":"m","temperature_800hPa":"°F"},"hourly":{"time":["2025-09-11T12:00","2025-09-11T13:00","2025-09-11T14:00","2025-09-11T15:00","2025-09-11T16:00","2025-09-11T17:00","2025-09-11T18:00","2025-09-11T19:00","2025-09-11T20:00","2025-09-11T21:00","2025-09-11T22:00","2025-09-11T23:00"],"temperature_2m":[82.1,83.8,84.6,85.0,85.5,84.2,82.5,79.5,74.1,71.6,69.5,67.3],"wind_speed_10m":[13.0,14.7,13.9,17.2,13.5,15.1,9.3,7.3,8.1,4.7,3.7,4.7],"wind_direction_10m":[191,208,183,196,211,235,260,293,360,352,284,262],"wind_gusts_10m":[23.5,25.5,25.5,26.8,29.3,26.6,19.2,14.3,15.4,15.0,13.2,5.8],"cape":[0.0,40.0,0.0,0.0,30.0,30.0,60.0,70.0,120.0,10.0,0.0,0.0],"lifted_index":[0.00,-0.80,-0.30,0.20,-0.80,-0.50,-0.90,-1.00,-1.30,-0.20,0.20,0.70],"pressure_msl":[1009.3,1009.1,1008.9,1008.5,1007.8,1007.0,1006.9,1007.0,1007.0,1007.3,1007.7,1007.8],"windspeed_850hPa":[17.3,18.6,20.6,21.6,19.5,16.5,11.9,7.1,9.7,10.9,8.6,4.0],"windspeed_800hPa":[21.0,21.9,24.0,25.3,23.5,20.8,15.9,10.7,4.0,6.9,3.5,1.8],"windspeed_750hPa":[23.3,23.5,25.9,26.9,25.6,24.3,20.9,18.0,11.4,4.9,4.4,7.0],"windspeed_700hPa":[24.9,24.3,26.4,27.7,26.7,26.7,24.7,23.7,21.1,17.2,16.1,16.8],"windspeed_650hPa":[27.2,25.0,26.5,28.8,29.4,29.8,29.1,29.6,29.6,29.9,30.8,29.2],"windspeed_600hPa":[30.3,26.2,27.5,30.2,32.9,34.8,35.8,37.1,40.0,41.9,41.8,41.3],"windspeed_550hPa":[36.8,32.2,32.8,34.6,40.2,42.3,44.5,45.1,46.7,47.7,46.6,45.6],"winddirection_850hPa":[195,201,205,214,229,241,252,275,353,7,17,4],"winddirection_800hPa":[196,201,205,213,224,232,237,240,315,18,52,149],"winddirection_750hPa":[196,201,205,212,220,225,226,223,224,219,198,191],"winddirection_700hPa":[196,200,205,210,213,217,219,217,220,224,222,217],"winddirection_650hPa":[198,202,204,208,207,208,211,212,215,220,221,221],"winddirection_600hPa":[205,204,205,207,202,201,203,205,207,209,212,212],"winddirection_550hPa":[216,214,210,207,201,197,198,200,201,202,203,202],"geopotential_height_850hPa":[1488.00,1488.00,1489.00,1488.00,1483.00,1476.00,1476.00,1478.00,1478.00,1479.00,1482.00,1482.00],"geopotential_height_800hPa":[2011.00,2013.00,2014.00,2013.00,2009.00,2002.00,2002.00,2003.00,2001.00,2002.00,2005.00,2004.00],"geopotential_height_750hPa":[2558.00,2561.00,2563.00,2563.00,2559.00,2553.00,2552.00,2553.00,2550.00,2550.00,2553.00,2552.00],"geopotential_height_700hPa":[3132.00,3135.00,3139.00,3139.00,3136.00,3130.00,3130.00,3130.00,3127.00,3126.00,3129.00,3129.00],"geopotential_height_650hPa":[3736.00,3741.00,3745.00,3745.00,3743.00,3738.00,3738.00,3738.00,3735.00,3734.00,3737.00,3736.00],"geopotential_height_600hPa":[4375.00,4380.00,4385.00,4386.00,4385.00,4380.00,4381.00,4381.00,4379.00,4378.00,4380.00,4379.00],"geopotential_height_550hPa":[5055.00,5060.00,5066.00,5068.00,5068.00,5064.00,5065.00,5066.00,5064.00,5063.00,5065.00,5064.00],"temperature_800hPa":[65.1,66.5,67.5,68.2,68.6,68.6,68.6,68.2,66.5,65.6,66.1,66.1]},"daily_units":{"time":"iso8601","sunset":"iso8601","temperature_2m_max":"°F"},"daily":{"time":["2025-09-11"],"sunset":["2025-09-11T19:43"],"temperature_2m_max":[85.5]}};

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

  // const openMeteoURL = `https://api.open-meteo.com/v1/gfs?${buildAPIURL(openMeteoParams)}`;

  // // Wind Aloft data - toggle between AWS and GCP (both exist for backup purposes)
  // // AWS Lambda function (uses CORS config in console: Configuration > Function URL)
  // const windAloftURL = 'https://2kjkumjjzukwnuiomukqzexcfy0yfynp.lambda-url.us-west-1.on.aws';
  // // GCP Cloud Function (uses CORS in code)
  // // const windAloftURL = 'https://python-wind-aloft-ftp-483547589035.us-west2.run.app';

  // const openmeteoData = await (await fetch(openMeteoURL)).json();
  // const gcpWindAloftData = await (await fetch(windAloftURL)).json();
  setHiTempAndSunset(openmeteoData.daily); // main.js
  navSet(); // main.js
  windAloft(openmeteoData.hourly, gcpWindAloftData); // windaloft.js
  // displayImages(); // main.js
})();

// // Async IIFE
// // Get Sounding data via GCP Cloud Storage
// // Get Soaring Forecast text via the SLC Soarcast page - provides hiTemp (required to process soundingData)
// (async () => {
//   const soundingURL = 'https://storage.googleapis.com/wasatch-wind-static/raob.json';
//   const soaringForecastURL = 'https://forecast.weather.gov/product.php?site=SLC&issuedby=SLC&product=SRG&format=TXT&version=1';
//   soundingData = await (await fetch(soundingURL)).json(); // Global variable (main.js)
//   const soaringForecastPageContent = await (await fetch(soaringForecastURL)).text();
//   sounding(soundingData, soaringForecastPageContent); // sounding.js
// })();

// // Aysnc IIFE
// // Get Synoptic Time Series API data (documentation: https://docs.synopticdata.com/services/weather-api)
// (async () => {
//   const timeSeriesURL = 'https://python-synoptic-api-483547589035.us-west3.run.app';
//   const timeSeriesData = await (await fetch(timeSeriesURL)).json();
//   timeSeries(timeSeriesData); // timeseries.js
// })();

// // Async IIFE
// // Get NWS API data (documentation: https://www.weather.gov/documentation/services-web-api)
// (async () => {
//   const nwsForecastURL = 'https://api.weather.gov/gridpoints/SLC/97,175/forecast';
//   const nwsForecastData = await (await fetch(nwsForecastURL)).json();
//   nwsForecast(nwsForecastData); // nws.js
// })();

// // Async IIFE
// // Get Area Forecast text via the SLC Area Forecast page
// (async () => {
//   const areaForecastURL = 'https://forecast.weather.gov/product.php?site=NWS&issuedby=SLC&product=AFD&format=TXT&version=1';
//   const areaForecastPageContent = await (await fetch(areaForecastURL)).text();
//   areaForecast(areaForecastPageContent); // main.js
// })();

// // Async IIFE
// // Get Wind Map metadata from GCP Cloud Storage
// (async () => {
//   const windMapDataURL = 'https://storage.googleapis.com/storage/v1/b/wasatch-wind-static/o/wind-map-save.png';
//   const windMapData = await (await fetch(windMapDataURL)).json();
//   windMap(windMapData); // main.js
// })();