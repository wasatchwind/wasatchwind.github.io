"use strict";

const data = await fetchData();
main(data);
displayImages(sunset);

async function fetchData() {
  const data = {};

  // Helper function to assemble openMeteoParams into a full URL
  function buildApiUrl(params, repeatKeys = []) {
    const query = new URLSearchParams();

    for (const [key, value] of Object.entries(params)) {
      if (repeatKeys.includes(key) && Array.isArray(value)) value.forEach(v => query.append(key, v));
      else query.set(key, Array.isArray(value) ? value.join(",") : value);
    }
    return query.toString();
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

  const openMeteoUrl = new URL("https://api.open-meteo.com/v1/gfs?");
  openMeteoUrl.search = buildApiUrl(openMeteoParams);
  const synopticTimeSeriesUrl = "https://python-synoptic-api-483547589035.us-west3.run.app";
  // const windAloftForecastUrl = "https://2kjkumjjzukwnuiomukqzexcfy0yfynp.lambda-url.us-west-1.on.aws";
  const windAloftForecastUrl = "https://python-wind-aloft-ftp-483547589035.us-west2.run.app"; // GCP backup (modified)
  const soundingUrl = "https://storage.googleapis.com/wasatch-wind-static/raob.json";
  const soaringForecastUrl = "https://forecast.weather.gov/product.php?site=SLC&issuedby=SLC&product=SRG&format=TXT&version=1";
  const areaForecastUrl = "https://forecast.weather.gov/product.php?site=NWS&issuedby=SLC&product=AFD&format=TXT&version=1";
  const nwsForecastUrl = "https://api.weather.gov/gridpoints/SLC/97,175/forecast";
  const windMapDataUrl = "https://storage.googleapis.com/storage/v1/b/wasatch-wind-static/o/wind-map-save.png";

  const dataSources = [
    { name: "openMeteo", url: openMeteoUrl, type: "json" },
    { name: "synoptic", url: synopticTimeSeriesUrl, type: "json" },
    { name: "windAloft", url: windAloftForecastUrl, type: "json" },
    { name: "sounding", url: soundingUrl, type: "json" },
    { name: "soaringForecast", url: soaringForecastUrl, type: "text" },
    { name: "areaForecast", url: areaForecastUrl, type: "text" },
    { name: "nwsForecast", url: nwsForecastUrl, type: "json" },
    { name: "windMapMeta", url: windMapDataUrl, type: "json" }
  ];

  const results = await Promise.allSettled(
    dataSources.map(async ({ name, url, type }) => {
      const res = await fetch(url);
      if (!res.ok) throw new Error(`${name} failed: ${res.status}`);
      const data = type === "json" ? await res.json() : await res.text();
      return { name, data };
    })
  );

  for (const result of results) {
    if (result.status === "fulfilled") data[result.value.name] = result.value.data;
    else console.error(result.response);
  }

  return data;
}