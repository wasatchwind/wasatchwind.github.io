"use strict";

function main(data) {
  MarqueeController.init(); // Initialize Marquee slider/ticker

  // Sunset hour & current hour determine default navigation slider landing page:
  // - Before 2pm = Today
  // - Between 2pm and sunset hour = Now
  // - Sunset hour+ = Tomorrow (nextDay)
  // processAreaForecastPageAndHourlyChart() Area Forecast & Hourly Chart location varies based on sunset hour
  // displayAfternoonSurfaceWindImages() visibililty depends on current hour
  // Navigation slider click controls listener set
  const sunset = new Date(data.openMeteo.daily.sunset[0]);
  const sunsetHour = sunset.getHours();
  const now = new Date();
  const currentHour = now.getHours();
  const tomorrowDate = new Date(now).setDate(now.getDate() + 1);
  const nextDay = new Intl.DateTimeFormat("en-US", { weekday: "short" }).format(tomorrowDate);
  const navItems = ["Today", `${nextDay}+`, "Settings", "Misc.", "GPS", "Cams", "Now"];
  const nowPageHour = 14;
  const isAfterSunset = currentHour >= sunsetHour;
  const pageIdx = (() => {
    if (currentHour < nowPageHour) return navItems.indexOf("Today");
    if (isAfterSunset) return navItems.indexOf(`${nextDay}+`);
    return navItems.indexOf("Now");
  })();
  const slider = buildNavSlider(pageIdx, navItems);
  const sliderClickControls = { left: () => slider.prev(), right: () => slider.next() };
  document.getElementById("topnav").addEventListener("click", (e) => {
    const button = e.target.closest(".clickable");
    if (!button) return;
    const direction = button.dataset.direction;
    sliderClickControls[direction]?.(); // Optional Chaining Operator (function only called if direction is "left" or "right")
  });

  // Determine forecast high temp from soaring forecast (use Open Meteo as backup)
  const { hiTempSoaringForecast, nwsNegative3, nwsTopOfLift } = processSoaringForecastPage(data.soaringForecast.productText); // nws-api.js
  const hiTempOpenMeteo = Math.round(data.openMeteo.daily.temperature_2m_max[0]);
  const hiTemp = hiTempSoaringForecast ? hiTempSoaringForecast : hiTempOpenMeteo;
  const windMapTime = new Date(data.windMapScreenshotMetadata.timeCreated).toLocaleString("en-US", { hour: "numeric", minute: "2-digit" }).toLowerCase();

  // Functions to process remaining data
  processWindAloft(data.openMeteo.hourly, data.windAloft6, data.windAloft12, data.windAloft24);           // wind-aloft.js
  processAreaForecastPageAndHourlyChart(data.areaForecast.productText, isAfterSunset);                    // nws-api.js
  processGeneralForecast(data.generalForecast.properties.periods);                                        // nws-api.js
  processSynoptic(data.synopticTimeseries.STATION);                                                       // synoptic.js
  displayPersistentImages(windMapTime);                                                                   // main.js
  if (currentHour > 6) {
    displayAfternoonSurfaceWindImages(currentHour, sunsetHour, nextDay);                                  // utils.js
    processSounding(data.soaringForecast.productText, data.sounding, hiTemp, nwsNegative3, nwsTopOfLift); // sounding.js
  }

  // Populate sunset & high temp in the marquee and hide the loading spinner
  document.getElementById("sunset").textContent = sunset.toLocaleString("en-us", { hour: "numeric", minute: "2-digit" }).slice(0, -3);
  document.getElementById("hi-temp").textContent = `${hiTemp}`;
  document.getElementById("spinner").style.display = "none";

  // Unhide main app nav pages last for smooth visual loading
  const pageIds = ["today-page", "tomorrow-page", "settings-page", "misc-page", "gps-page", "cams-page", "now-page"];
  pageIds.forEach(page => {
    const element = document.getElementById(page);
    element.style.display = "block";
  });
}