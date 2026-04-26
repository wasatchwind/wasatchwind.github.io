"use strict";

////////////////////////////////////
// Soaring Guidance for SLC (SRG) //
////////////////////////////////////
function processSoaringForecastPage(text) {
  const forecastDate = text.match(/^(.*\b\d{3,4}(?:\sAM|PM)\b.*)$/m)?.[1]?.trim();
  const formattedDate = new Date(forecastDate.split(",")[1]).toLocaleDateString("en-US", { month: "short", day: "numeric" });
  const rateOfLift = text.match(/Maximum rate of lift.*?(\d{1,4}\s*ft\/min.*)$/m)?.[1]?.trim();
  const nwsTopOfLift = Number(text.match(/Maximum height of thermals.*?(\d{4,5})\b/m)?.[1]?.trim());
  const hiTempSoaringForecast = Number(text.match(/Forecast maximum temperature.*?(\d{2,3}\.\d)/m)?.[1]?.trim());
  const nwsNegative3Literal = Number(text.match(/Height of the -3 thermal index.*?(\d{4,5}|None)\b/m)?.[1]?.trim());
  const nwsNegative3 = !Number.isNaN(nwsNegative3Literal) ? nwsNegative3Literal : "None";
  const cloudbase = Number(text.match(/Lifted condensation level.*?(\d{4,5})\b/m)?.[1]?.trim()).toLocaleString();
  const liftedIndex = text.match(/Lifted index.*?([+-]?\d+(?:\.\d+)?)/m)?.[1];
  const overdevelopmentTime = text.match(/Time of overdevelopment.*?(\d{4}|None)/m)?.[1]?.trim();
  const overdevelopmentDisplay = !overdevelopmentTime || overdevelopmentTime === "None" ? "" : `<br>❗OD Time......... ${overdevelopmentTime}`;

  document.getElementById("soaring-forecast").innerHTML = `
    <div class="mb-4">
      <div class="display-3 text-info">Soaring Forecast Summary ${formattedDate}</div>
      <a href="https://forecast.weather.gov/product.php?site=NWS&issuedby=SLC&product=SRG&format=CI&version=1&glossary=1" target="_blank">
        <div class="bg-dark border rounded-4">
          <div class="w-100" id="srg-sounding-chart"></div>
          <div class="display-6 fw-semibold mb-4 text-info" id="model-lapse"></div>
          <div class="border-top display-6 font-monospace ps-2 text-start" id="soaring-summary"></div>
        </div>
      </a>
    </div>`;

  const soaringForecast = `
    ${forecastDate}</div><br>
    <br>
    High Temp......... ${hiTempSoaringForecast}°<br>
    <br>
    Negative 3 Index.. ${nwsNegative3.toLocaleString()}<br>
    Top of Lift....... ${nwsTopOfLift.toLocaleString()}<br>
    Cloudbase (LCL)... ${cloudbase}<br>
    <br>
    Max Lift Rate..... ${rateOfLift}<br>
    Lifted Index...... ${liftedIndex}<br>
    ${overdevelopmentDisplay}`;

  document.getElementById("soaring-summary").innerHTML = soaringForecast;
  return { hiTempSoaringForecast, nwsNegative3, nwsTopOfLift };
}

////////////////////////////////////////////
// Area Forecast Discussion for SLC (AFD) //
////////////////////////////////////////////
function processAreaForecastPageAndHourlyChart(text, isAfterSunset) {
  const displayBlock = isAfterSunset ? "tomorrow" : "today";
  const forecastDate = text.match(/^\s*(\d{1,4}\s+(?:AM|PM)\s+.*?\d{4})\s*$/m)?.[1]?.trim();
  const aviation = text.match(/\.AVIATION\.\.\.([\s\S]*?)\n\n/)?.[1]?.replace(/\n+/g, " ").trim() ?? null;
  const keyMessages = text.match(/\.KEY MESSAGES\.\.\.\n([\s\S]*?)\n&&/)?.[1]?.trim().split(/\n(?=\s*-)/)
    .map(m => m.replace(/\n(?!\s*-)/g, " ").trim()).join("<br>") ?? null;

  const areaForecast = `${forecastDate ? forecastDate : "Date error"}<br>
    <br>
    Key Messages:<br>
    <br>
    ${keyMessages ? keyMessages : "No key messages"}`;

  const componentsToDisplay = [
    {
      elementId: "area-forecast-aviation",
      href: "https://forecast.weather.gov/product.php?site=NWS&issuedby=SLC&product=AFD&format=txt&version=1&glossary=1",
      src: aviation,
      title: "Aviation Forecast"
    }, {
      elementId: `area-forecast-${displayBlock}`, // Conditional visibility logic
      href: "https://forecast.weather.gov/product.php?site=NWS&issuedby=SLC&product=AFD&format=txt&version=1&glossary=1",
      src: areaForecast,
      title: "Area Forecast Discussion"
    }, {
      elementId: `hourly-chart-${displayBlock}`, // Conditional visibility logic
      href: "https://forecast.weather.gov/MapClick.php?w0=t&w3=sfcwind&w3u=1&w4=sky&w5=pop&w7=rain&w9=snow&w13u=0&w16u=1&w17u=1&AheadHour=0&Submit=Submit&FcstType=graphical&textField1=40.7603&textField2=-111.8882&site=all&unit=0&dd=&bw=",
      src: "https://forecast.weather.gov/meteograms/Plotter.php?lat=40.7603&lon=-111.8882&wfo=SLC&zcode=UTZ105&gset=30&gdiff=10&unit=0&tinfo=MY7&ahour=0&pcmd=10001110100000000000000000000000000000000000000000000000000&lg=en&indu=1!1!1!&dd=&bw=&hrspan=48&pqpfhr=6&psnwhr=6",
      title: "KSLC Hourly Forecast Chart"
    }
  ];

  componentsToDisplay.forEach(component => { standardHtmlComponent(component) });
}

//////////////////////////
// General Forecast SLC //
//////////////////////////
function processGeneralForecast(data) {
  const forecastDaysCount = 5;
  const isDaytime = data[0].isDaytime;
  let period = isDaytime ? 0 : 1;

  const multiDayDiv = `
    <div class="collapse" id="nws-today-multiday">
      <div id="forecast-day0"></div>
    </div>
    <div id="forecast-day1"></div>
    <div id="forecast-day2"></div>
    <div id="forecast-day3"></div>
    <div id="forecast-day4"></div>`;

  const nwsMultiDay = {
    elementId: "nws-multiday",
    href: "https://forecast.weather.gov/MapClick.php?lon=-111.965&lat=40.765#.YwOWZHbMJhE",
    src: multiDayDiv,
    style: "bg-dark border rounded-4",
    title: "Days Ahead"
  };

  standardHtmlComponent(nwsMultiDay); // Build general forecast DOM

  for (let i = 0; i < forecastDaysCount; i++) {
    let qualifier = "";
    let border = `<div class="border-bottom"></div>`;

    if (isDaytime && i === 0) {
      qualifier = "-today";
      border = "";
      const nwsToday = {
        elementId: "nws-today",
        href: "https://forecast.weather.gov/MapClick.php?lon=-111.965&lat=40.765#.YwOWZHbMJhE",
        title: "General Forecast",
        style: `bg-dark border rounded-4" id="forecast-day0-today`
      };

      standardHtmlComponent(nwsToday); // Conditional visibility logic: either on Today page, or on Tomorrow page with rest of days
    } else document.getElementById("nws-today-multiday").style.display = "block";

    const container = document.getElementById(`forecast-day${i}${qualifier}`).innerHTML = `
      <div class="d-flex">
        <div class="col-3">
          <div class="display-6 text-info">${data[period].name}</div>
          <img class="align-self-start rounded-4 w-100" src="${data[period].icon}">
        </div>
        <div class="col display-6 font-monospace ps-2 text-start">${data[period].detailedForecast}</div>
      </div>
      ${border}`;

    period += 2; // Skip nights
  }
}