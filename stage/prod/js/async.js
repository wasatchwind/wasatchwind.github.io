"use strict";

const data = await fetchData();
console.log(data)
main(data);

async function fetchData() {
  const data = {};

  // Helper function that assembles api params into a full URL
  function buildApiUrl(baseUrl, params, repeatKeys = []) {
    const query = new URLSearchParams();
    for (const [key, value] of Object.entries(params)) {
      if (repeatKeys.includes(key) && Array.isArray(value)) value.forEach(v => query.append(key, v));
      else query.set(key, Array.isArray(value) ? value.join(",") : value);
    }
    return `${baseUrl}${query.toString()}`;
  }

  const openMeteoParams = {
    latitude: 40.77069,
    longitude: -111.96503,
    daily: ["sunset", "temperature_2m_max"],
    hourly: [
      "wind_speed_10m",
      "wind_direction_10m",
      "windspeed_850hPa",
      "windspeed_800hPa",
      "windspeed_750hPa",
      "windspeed_700hPa",
      "windspeed_650hPa",
      "windspeed_600hPa",
      "windspeed_550hPa",
      "winddirection_850hPa",
      "winddirection_800hPa",
      "winddirection_750hPa",
      "winddirection_700hPa",
      "winddirection_650hPa",
      "winddirection_600hPa",
      "winddirection_550hPa",
      "geopotential_height_850hPa",
      "geopotential_height_800hPa",
      "geopotential_height_750hPa",
      "geopotential_height_700hPa",
      "geopotential_height_650hPa",
      "geopotential_height_600hPa",
      "geopotential_height_550hPa"
    ],
    windspeed_unit: "mph",
    temperature_unit: "fahrenheit",
    forecast_hours: 12,
    forecast_days: 1,
    timezone: "America/Denver"
  };

  const openMeteoUrl = buildApiUrl("https://api.open-meteo.com/v1/gfs?", openMeteoParams);                      // Open Meteo
  const synopticTimeSeriesUrl = "https://python-synoptic-api-483547589035.us-west3.run.app";                    // Synoptic
  const soundingUrl = "https://storage.googleapis.com/wasatch-wind-static/raob.json";                           // Google Cloud
  const windMapDataUrl = "https://storage.googleapis.com/storage/v1/b/wasatch-wind-static/o/wind-map-save.png"; // Google Cloud
  const windAloftForecast6Url = "https://api.weather.gov/products/types/FD1/locations/US1/latest";              // NWS API
  const windAloftForecast12Url = "https://api.weather.gov/products/types/FD3/locations/US3/latest";             // NWS API
  const windAloftForecast24Url = "https://api.weather.gov/products/types/FD5/locations/US5/latest";             // NWS API
  const soaringForecastUrl = "https://api.weather.gov/products/types/SRG/locations/SLC/latest";                 // NWS API
  const areaForecastUrl = "https://api.weather.gov/products/types/AFD/locations/SLC/latest";                    // NWS API
  const generalForecastUrl = "https://api.weather.gov/gridpoints/SLC/97,175/forecast";                          // NWS API

  const dataSources = [
    { name: "openMeteo", url: openMeteoUrl },
    { name: "synopticTimeseries", url: synopticTimeSeriesUrl },
    { name: "windAloft6", url: windAloftForecast6Url },
    { name: "windAloft12", url: windAloftForecast12Url },
    { name: "windAloft24", url: windAloftForecast24Url },
    { name: "sounding", url: soundingUrl },
    { name: "soaringForecast", url: soaringForecastUrl },
    { name: "areaForecast", url: areaForecastUrl },
    { name: "generalForecast", url: generalForecastUrl },
    { name: "windMapScreenshotMetadata", url: windMapDataUrl }
  ];

  const results = await Promise.allSettled(
    dataSources.map(async ({ name, url }) => {
      const res = await fetch(url);
      if (!res.ok) throw new Error(`${name} failed: ${res.status}`);
      const data = await res.json();
      return { name, data };
    })
  );

  for (const result of results) {
    if (result.status === "fulfilled") data[result.value.name] = result.value.data;
    else console.error(result.response);
  }

  return data;
}