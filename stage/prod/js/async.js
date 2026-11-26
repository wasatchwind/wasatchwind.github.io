"use strict";

const dataSources = [
  { name: "areaForecast", url: "https://api.weather.gov/products/types/AFD/locations/SLC/latest", displayName: "AFD" },
  { name: "soaringForecast", url: "https://api.weather.gov/products/types/SRG/locations/SLC/latest", displayName: "SRG" },
  { name: "timeSeries", url: "https://python-synoptic-api-483547589035.us-west3.run.app", displayName: "Station Data" },
  { name: "sounding", url: "https://storage.googleapis.com/wasatch-wind-static/raob.json", displayName: "Sounding" },
  { name: "windMapScreenshotMetadata", url: "https://storage.googleapis.com/storage/v1/b/wasatch-wind-static/o/wind-map-save.png", displayName: "Wind Map" },
  { name: "generalForecast", url: "https://api.weather.gov/gridpoints/SLC/97,175/forecast", displayName: "General Forecast" },
  { name: "sunsetTime", url: "https://api.sunrise-sunset.org/v2?lat=40.77069&lng=-111.96503", displayName: "Sunset Time" },
  { name: "windAloft", url: "https://e9b6ls8sb9.execute-api.us-east-1.amazonaws.com/forecast", displayName: "Wind Aloft Forecast" },
];

function buildApiUrl(baseUrl, params) {
  const url = new URL(baseUrl);
  url.search = new URLSearchParams(Object.entries(params).map(([k, v]) => [k, Array.isArray(v) ? v.join(",") : v]));
  console.log(url.toString());
  return url.toString();
}

function filterPastWindAloftHours(windAloft) {
  if (!windAloft || windAloft.error) return windAloft;

  const currentHourStart = new Date();
  currentHourStart.setMinutes(0, 0, 0);

  const filterList = (list) =>
    Array.isArray(list)
      ? list.filter((item) => new Date(item.valid_time_utc) >= currentHourStart)
      : list;

  return {
    ...windAloft,
    short_forecast: windAloft.short_forecast
      ? {
          ...windAloft.short_forecast,
          hourly_forecast: filterList(windAloft.short_forecast.hourly_forecast),
        }
      : windAloft.short_forecast,
    extended_forecast: windAloft.extended_forecast
      ? {
          ...windAloft.extended_forecast,
          hourly_forecast: filterList(windAloft.extended_forecast.hourly_forecast),
        }
      : windAloft.extended_forecast,
  };
}

async function fetchWithCache(source) {
  const hasLocalStorage = localStorage.getItem(source.name);
  const cached = hasLocalStorage ? JSON.parse(hasLocalStorage) : null;
  const headers = cached?.etag ? { "If-None-Match": cached.etag } : undefined;
  try {
    const res = await fetch(source.url, { headers, cache: "no-store" });
    if (res.status === 304) { // ETag 304: data hasn't changed
      if (cached) return cached.data;
      return { error: true };
    }
    let data;
    try {
      const text = await res.text();
      data = text ? JSON.parse(text) : null;
    } catch (error) {
      throw new Error(`Invalid JSON response from ${source.name}`);
    }
    const etag = res.headers.get("etag");
    if (etag) localStorage.setItem(source.name, JSON.stringify({ data, etag, timestamp: Date.now() }));
    return data;
  } catch (error) {
    console.error(`API error: ${source.name}`, error);
    if (cached) return cached.data;
    return { error: true };
  }
}

function renderLoadingStatus(statusMap) {
  const progressEl = document.getElementById("progress");
  if (!progressEl) return;
  progressEl.innerHTML = Object.entries(statusMap).map(([displayName, status]) => {
    return `
      <div class="d-flex justify-content-center my-2">
        <div class="col-5 text-end">${displayName}</div>
        <div class="mx-4">|</div>
        <div class="col-5 text-start">${status}</div>
      </div>`;
  }).join("");
}

async function fetchData() {
  const statusMap = {};
  dataSources.forEach((source) => { statusMap[source.displayName] = "Fetching..."; });
  renderLoadingStatus(statusMap);

  const results = await Promise.allSettled(
    dataSources.map(async (source) => {
      try {
        const result = await fetchWithCache(source);
        statusMap[source.displayName] = "100%";
        renderLoadingStatus(statusMap);
        return result;
      } catch (error) {
        statusMap[source.displayName] = "error";
        renderLoadingStatus(statusMap);
        throw error;
      }
    })
  );

  const data = {};
  results.forEach((result, i) => {
    const name = dataSources[i].name;
    if (result.status === "fulfilled") {
      data[name] = name === "windAloft"
        ? filterPastWindAloftHours(result.value)
        : result.value;
    } else {
      console.error(`Fetch failed: ${name}`, result.reason);
      data[name] = { error: true };
    }
  });
  return data;
}

const data = await fetchData();
console.log(data);
main(data);

// // If AWS API triggered an on-demand Lambda refresh, silently re-fetch windAloft once ready
// if (data.windAloft?.refresh?.refresh_requested) {
//   const windAloftSource = dataSources.find((s) => s.name === "windAloft");
//   setTimeout(async () => {
//     console.log("Polling for updated windAloft forecast...");
//     const updatedWindAloft = await fetchWithCache(windAloftSource);
//     if (updatedWindAloft && !updatedWindAloft.error) {
//       data.windAloft = filterPastWindAloftHours(updatedWindAloft);
//       console.log("Updated windAloft received:", data.windAloft);
//       main(data);
//     }
//   }, 20000);
// }


// Documentation references:
// Open Meteo API: https://open-meteo.com/en/docs/gfs-api
// Synoptic API: https://docs.synopticdata.com/services/weather-api
// NWS API: https://www.weather.gov/documentation/services-web-api
// Sounding data UWYO inventory: https://weather.uwyo.edu/wsgi/sounding?datetime=2026-03-23%2012:00:00&id=72572&src=UNKNOWN&type=INVENTORY
// Sounding data UWYO UI: https://weather.uwyo.edu/upperair/sounding.shtml
// Sounding image sources: https://www.weather.gov/upperair/SkewTViewing
// Google Cloud: https://console.cloud.google.com/storage/overview;tab=overview?project=wasatchwind
// Keen Slider: https://keen-slider.io/docs