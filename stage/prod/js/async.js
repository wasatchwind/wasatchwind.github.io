"use strict";

////////////
// CONFIG //
////////////
const HOURLY_CONFIG = {
  levels: [875, 850, 825, 800, 775, 750, 700, 625],
  variables: ["geopotential_height", "winddirection", "windspeed"],
  surface: ["wind_direction_10m", "wind_speed_10m"]
};

const OPEN_METEO_PARAMS = {
  latitude: 40.77069,
  longitude: -111.96503,
  daily: ["sunset", "temperature_2m_max"],
  windspeed_unit: "mph",
  temperature_unit: "fahrenheit",
  forecast_hours: 12,
  forecast_days: 1,
  timezone: "America/Denver"
};

const SOURCES = [
  { name: "areaForecast", url: "https://api.weather.gov/products/types/AFD/locations/SLC/latest" },
  { name: "generalForecast", url: "https://api.weather.gov/gridpoints/SLC/97,175/forecast" },
  { name: "soaringForecast", url: "https://api.weather.gov/products/types/SRG/locations/SLC/latest" },
  { name: "windAloft6", url: "https://api.weather.gov/products/types/FD1/locations/US1/latest" },
  { name: "windAloft12", url: "https://api.weather.gov/products/types/FD3/locations/US3/latest" },
  { name: "windAloft24", url: "https://api.weather.gov/products/types/FD5/locations/US5/latest" },
  { name: "sounding", url: "https://storage.googleapis.com/wasatch-wind-static/raob.json" },
  { name: "synopticTimeseries", url: "https://python-synoptic-api-483547589035.us-west3.run.app" },
  { name: "windMapScreenshotMetadata", url: "https://storage.googleapis.com/storage/v1/b/wasatch-wind-static/o/wind-map-save.png" },
  {
    name: "openMeteo",
    buildUrl: () =>
      buildApiUrl("https://api.open-meteo.com/v1/gfs", {
        ...OPEN_METEO_PARAMS,
        hourly: buildHourlyParams(HOURLY_CONFIG)
      })
  }
];



/////////////
// HELPERS //
/////////////
function buildApiUrl(baseUrl, params) {
  const url = new URL(baseUrl);
  url.search = new URLSearchParams(
    Object.entries(params).map(([k, v]) => [
      k,
      Array.isArray(v) ? v.join(",") : v
    ])
  );
  return url.toString();
}

function buildHourlyParams({ levels, variables, surface }) {
  const params = [];

  for (const level of levels) {
    for (const variable of variables) {
      params.push(`${variable}_${level}hPa`);
    }
  }

  params.push(...surface);
  return params;
}

async function fetchWithTimeout(url, timeout = 8000) {
  const controller = new AbortController();
  const id = setTimeout(() => controller.abort(), timeout);

  try {
    const res = await fetch(url, { signal: controller.signal, cache: "no-store" });
    if (!res.ok) throw new Error(`${res.status} ${res.statusText}`);
    return await res.json();
  } finally {
    clearTimeout(id);
  }
}



//////////////////
// FETCH ENGINE //
//////////////////
async function fetchSource({ name, url, buildUrl }) {
  try {
    const data = await fetchWithTimeout(url ?? buildUrl());
    return [name, data];
  } catch (error) {
    return [name, { error: true, message: error.message }];
  }
}

async function fetchData() {
  return Object.fromEntries(
    await Promise.all(SOURCES.map(fetchSource))
  );
}

const data = await fetchData();
main(data);