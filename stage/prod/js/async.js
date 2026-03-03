"use strict";

// Fetch with timeout and cache control
async function fetchWithTimeout(url, { timeout = 8000 } = {}) {
  const controller = new AbortController();
  const id = setTimeout(() => controller.abort(), timeout);

  try {
    const res = await fetch(url, { signal: controller.signal, cache: "no-store" });
    if (!res.ok) throw new Error(`${res.status} ${res.statusText}`);
    return await res.json();
  } finally { clearTimeout(id); }
}

// Build API URL from provided options
function buildApiUrl(baseUrl, params, repeatKeys = []) {
  const url = new URL(baseUrl);

  for (const [key, value] of Object.entries(params)) {
    if (repeatKeys.includes(key) && Array.isArray(value)) {
      value.forEach(v => url.searchParams.append(key, v));
    } else url.searchParams.set(key, Array.isArray(value) ? value.join(",") : value);
  }

  return url.toString();
}

// Generate Open-Meteo hourly parameters dynamically
function generateHourlyParams() {
  const levels = [875, 850, 825, 800, 775, 750, 700, 625];
  return [
    ...levels.map(level => `geopotential_height_${level}hPa`),
    ...levels.map(level => `winddirection_${level}hPa`),
    ...levels.map(level => `windspeed_${level}hPa`),
    "wind_direction_10m",
    "wind_speed_10m"
  ];
}

async function fetchData() {
  const data = {};

  const openMeteoParams = {
    latitude: 40.77069,
    longitude: -111.96503,
    daily: ["sunset", "temperature_2m_max"],
    hourly: generateHourlyParams(),
    windspeed_unit: "mph",
    temperature_unit: "fahrenheit",
    forecast_hours: 12,
    forecast_days: 1,
    timezone: "America/Denver"
  };

  const dataSources = [
    { name: "areaForecast", url: "https://api.weather.gov/products/types/AFD/locations/SLC/latest" },                                 // NWS
    { name: "generalForecast", url: "https://api.weather.gov/gridpoints/SLC/97,175/forecast" },                                       // NWS
    { name: "openMeteo", url: buildApiUrl("https://api.open-meteo.com/v1/gfs?", openMeteoParams) },                                   // Open Meteo
    { name: "soaringForecast", url: "https://api.weather.gov/products/types/SRG/locations/SLC/latest" },                              // NWS
    { name: "sounding", url: "https://storage.googleapis.com/wasatch-wind-static/raob.json" },                                        // GCP
    { name: "synopticTimeseries", url: "https://python-synoptic-api-483547589035.us-west3.run.app" },                                 // Synoptic
    { name: "windAloft6", url: "https://api.weather.gov/products/types/FD1/locations/US1/latest" },                                   // NWS
    { name: "windAloft12", url: "https://api.weather.gov/products/types/FD3/locations/US3/latest" },                                  // NWS
    { name: "windAloft24", url: "https://api.weather.gov/products/types/FD5/locations/US5/latest" },                                  // NWS
    { name: "windMapScreenshotMetadata", url: "https://storage.googleapis.com/storage/v1/b/wasatch-wind-static/o/wind-map-save.png" } // GCP
  ];

  // Fetch all sources concurrently
  const results = await Promise.allSettled(
    dataSources.map(({ name, url }) =>
      fetchWithTimeout(url)
        .then(result => ({ name, data: result }))
        .catch(error => ({ name, error }))
    )
  );

  // Aggregate results
  for (const result of results) {
    if (result.status === "fulfilled") {
      const { name, data: resultData, error } = result.value;
      if (error) data[name] = { error: true, message: error.message };
      else data[name] = resultData;
    } else { // Promise rejected before fetchWithTimeout (rare)
      const { name, error } = result.reason || {};
      data[name || "unknown"] = { error: true, message: error?.message || "Unknown error" };
    }
  }

  return data;
}

const data = await fetchData();
main(data); // main.js