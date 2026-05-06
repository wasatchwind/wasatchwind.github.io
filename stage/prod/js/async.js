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
  { name: "areaForecast", url: "https://api.weather.gov/products/types/AFD/locations/SLC/latest", displayName: "AFD" },
  { name: "generalForecast", url: "https://api.weather.gov/gridpoints/SLC/97,175/forecast", displayName: "General Forecast" },
  { name: "soaringForecast", url: "https://api.weather.gov/products/types/SRG/locations/SLC/latest", displayName: "SRG" },
  { name: "windAloft6", url: "https://api.weather.gov/products/types/FD1/locations/US1/latest", displayName: "Wind Aloft 6h" },
  { name: "windAloft12", url: "https://api.weather.gov/products/types/FD3/locations/US3/latest", displayName: "Wind Aloft 12h" },
  { name: "windAloft24", url: "https://api.weather.gov/products/types/FD5/locations/US5/latest", displayName: "Wind Aloft 24h" },
  { name: "synopticTimeseries", url: "https://python-synoptic-api-483547589035.us-west3.run.app", displayName: "Stations" },
  { name: "sounding", url: "https://storage.googleapis.com/wasatch-wind-static/raob.json", displayName: "KSLC Sounding" },
  { name: "windMapScreenshotMetadata", url: "https://storage.googleapis.com/storage/v1/b/wasatch-wind-static/o/wind-map-save.png", displayName: "Wind Map" },
  { name: "openMeteo", url: buildApiUrl("https://api.open-meteo.com/v1/gfs?", openMeteoParams), displayName: "Wind Aloft Hourly" }
];

function buildApiUrl(baseUrl, params) {
  const url = new URL(baseUrl);
  url.search = new URLSearchParams(Object.entries(params).map(([k, v]) => [k, Array.isArray(v) ? v.join(",") : v]));
  return url.toString();
}

async function fetchWithCache(source) {
  const raw = localStorage.getItem(source.name);
  const cached = raw ? JSON.parse(localStorage.getItem(source.name)) : null;
  const headers = cached?.etag ? { "If-None-Match": cached.etag } : undefined;

  try {
    const res = await fetch(source.url, { headers, cache: "no-store" });
    const isFreshCache = cached && (Date.now() - cached.timestamp < 60000); // Cache < 1 minute old
    if (res.status === 304) { // ETag 304 = data hasn't changed, but verify in case of stale API
      if (cached) return cached.data;
      return { error: true }
    }
    let data;
    try {
      const text = await res.text();
      data = text ? JSON.parse(text) : null;
    } catch (e) { throw new Error(`Invalid JSON response from ${source.name}`) }
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
  let completed = 0;
  const progressEl = document.getElementById("progress");
  const results = await Promise.allSettled(
    dataSources.map((source) => {
      progressEl.textContent = `Loading ${source.displayName}...`; // Show what's starting
      return fetchWithCache(source).then((result) => {
        completed++;
        progressEl.textContent = `Loaded ${source.displayName} (${completed}/10)`;
        return result;
      });
    })
  );

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

const data = await fetchData();
console.log(data);
main(data);

// Documentation references:
// Open Meteo API: https://open-meteo.com/en/docs/gfs-api
// Synoptic API: https://docs.synopticdata.com/services/weather-api
// NWS API: https://www.weather.gov/documentation/services-web-api
// Sounding data UWYO inventory: https://weather.uwyo.edu/wsgi/sounding?datetime=2026-03-23%2012:00:00&id=72572&src=UNKNOWN&type=INVENTORY
// Sounding data UWYO UI: https://weather.uwyo.edu/upperair/sounding.shtml
// Sounding image sources: https://www.weather.gov/upperair/SkewTViewing
// Google Cloud: https://console.cloud.google.com/storage/overview;tab=overview?project=wasatchwind
// Keen Slider: https://keen-slider.io/docs
