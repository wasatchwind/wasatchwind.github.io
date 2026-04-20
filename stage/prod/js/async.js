"use strict";

const openMeteoHourlyParams = () => {
  const params = [];
  const hourlyConfig = {
    levels: [875, 850, 825, 800, 775, 750, 700, 625],
    variables: ["geopotential_height", "winddirection", "windspeed"],
    surface: ["wind_direction_10m", "wind_speed_10m"]
  };

  for (const level of hourlyConfig.levels) {
    for (const variable of hourlyConfig.variables) {
      params.push(`${variable}_${level}hPa`);
    }
  }

  params.push(...hourlyConfig.surface);
  return params;
}

const openMeteoParams = {
  latitude: 40.77069,
  longitude: -111.96503,
  daily: ["sunset", "temperature_2m_max"],
  windspeed_unit: "mph",
  temperature_unit: "fahrenheit",
  forecast_hours: 12,
  forecast_days: 1,
  timezone: "America/Denver",
  hourly: openMeteoHourlyParams()
};

const dataSources = [
  { name: "areaForecast", url: "https://api.weather.gov/products/types/AFD/locations/SLC/latest" },
  { name: "generalForecast", url: "https://api.weather.gov/gridpoints/SLC/97,175/forecast" },
  { name: "soaringForecast", url: "https://api.weather.gov/products/types/SRG/locations/SLC/latest" },
  { name: "windAloft6", url: "https://api.weather.gov/products/types/FD1/locations/US1/latest" },
  { name: "windAloft12", url: "https://api.weather.gov/products/types/FD3/locations/US3/latest" },
  { name: "windAloft24", url: "https://api.weather.gov/products/types/FD5/locations/US5/latest" },
  { name: "synopticTimeseries", url: "https://python-synoptic-api-483547589035.us-west3.run.app" },
  { name: "sounding", url: "https://storage.googleapis.com/wasatch-wind-static/raob.json" },
  { name: "windMapScreenshotMetadata", url: "https://storage.googleapis.com/storage/v1/b/wasatch-wind-static/o/wind-map-save.png" },
  { name: "openMeteo", url: buildApiUrl("https://api.open-meteo.com/v1/gfs?", openMeteoParams) }
];

function buildApiUrl(baseUrl, params) {
  const url = new URL(baseUrl);
  url.search = new URLSearchParams(Object.entries(params).map(([k, v]) => [k, Array.isArray(v) ? v.join(",") : v]));
  return url.toString();
}

async function fetchWithCache(source) {
  const cached = JSON.parse(localStorage.getItem(source.name) || "null");
  const headers = {};
  if (cached?.etag) headers["If-None-Match"] = cached.etag;

  try {
    const res = await fetch(source.url, { headers, cache: "no-store" });
    if (res.status === 304 && cached) return cached.data;
    const data = await res.json();
    const etag = res.headers.get("etag");
    if (etag) localStorage.setItem(source.name, JSON.stringify({ data, etag, timestamp: Date.now() }));
    return data;
  } catch (error) {
    console.error(`API error: ${source.name}`, error);
    if (cached) return cached.data;
    return { error: true };
  }
}

async function fetchData() {
  const results = await Promise.allSettled(dataSources.map(fetchWithCache));
  const data = {};
  results.forEach((result, i) => {
    const name = dataSources[i].name;
    if (result.status === "fulfilled") data[name] = result.value;
    else {
      console.error(`Fetch failed: ${name}`, result.reason);
      data[name] = { error: true };
    }
  });
  return data;
}

// const data = await fetchData();
main(data);