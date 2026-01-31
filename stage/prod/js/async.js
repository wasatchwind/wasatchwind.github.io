"use strict";

const data = await fetchData();
console.log("All data", data)
console.log("Open Meteo Daily Max Wind: ", data.openMeteo.daily.wind_speed_10m_max[0])
console.log("Open Meteo Daily Max Gust: ", data.openMeteo.daily.wind_gusts_10m_max[0])
console.log("--------------------")
main(data);

async function fetchData() {
  const data = {};

  // Helper function that assembles API params into a full URL
  function buildApiUrl(baseUrl, params, repeatKeys = []) {
    const query = new URLSearchParams();
    for (const [key, value] of Object.entries(params)) {
      if (repeatKeys.includes(key) && Array.isArray(value)) value.forEach(v => query.append(key, v));
      else query.set(key, Array.isArray(value) ? value.join(",") : value);
    }
    return `${baseUrl}${query.toString()}`;
  }

  // hPa levels: 625, 700, 750, 775, 800, 825, 850, 875
  const openMeteoParams = {
    latitude: 40.77069,
    longitude: -111.96503,
    daily: ["sunset", "temperature_2m_max", "wind_gusts_10m_max", "wind_speed_10m_max"],
    hourly: [
      "boundary_layer_height",
      "cape",
      "lifted_index",
      "wind_speed_10m",
      "wind_direction_10m",
      "windspeed_875hPa",
      "windspeed_850hPa",
      "windspeed_825hPa",
      "windspeed_800hPa",
      "windspeed_775hPa",
      "windspeed_750hPa",
      "windspeed_700hPa",
      "windspeed_625hPa",
      "winddirection_875hPa",
      "winddirection_850hPa",
      "winddirection_825hPa",
      "winddirection_800hPa",
      "winddirection_775hPa",
      "winddirection_750hPa",
      "winddirection_700hPa",
      "winddirection_625hPa",
      "geopotential_height_875hPa",
      "geopotential_height_850hPa",
      "geopotential_height_825hPa",
      "geopotential_height_800hPa",
      "geopotential_height_775hPa",
      "geopotential_height_750hPa",
      "geopotential_height_725hPa",
      "geopotential_height_700hPa",
      "geopotential_height_675hPa",
      "geopotential_height_650hPa",
      "geopotential_height_625hPa",
      "geopotential_height_600hPa",
      "vertical_velocity_875hPa",
      "vertical_velocity_850hPa",
      "vertical_velocity_825hPa",
      "vertical_velocity_800hPa",
      "vertical_velocity_775hPa",
      "vertical_velocity_750hPa",
      "vertical_velocity_725hPa",
      "vertical_velocity_700hPa",
      "vertical_velocity_675hPa",
      "vertical_velocity_650hPa",
      "vertical_velocity_625hPa",
      "vertical_velocity_600hPa"
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