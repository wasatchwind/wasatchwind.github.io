"use strict";

////////////////////////////////////
// Soaring Guidance for SLC (SRG) //
////////////////////////////////////
function processSoaringForecastPage(text) {
  const forecastDate = text.match(/^.*AM\sMDT.*$/m)[0]; // Match all lines that contain string "AM MDT" (should only be one)
  const datePart = forecastDate.split(",")[1]; // Split by comma e.g. "629 AM MDT Wednesday, April 29, 2026"
  const formattedDate = new Date(datePart).toLocaleDateString("en-US", { month: "short", day: "numeric" }); // e.g. Jan 1
  const rateOfLift = text.match(/\d{3,4}\sft\/min.*$/m)[0];
  const topOfLift = Number(text.match(/Maximum height of thermals.*?(\d{4,5})\b/m)[1]);
  const hiTemp = Number(text.match(/Forecast maximum temperature.*?(\d{2,3}\.\d)/m)[1]);
  const negative3Literal = text.match(/Height of the -3 thermal index.*?(\d{4,5}|[A-Za-z].*)\b/m)[1]; // Sometimes text instead of number
  const negative3 = negative3Literal.match(/^\d+$/) ? Number(negative3Literal) : negative3Literal; // If string is all digits convert to number
  const cloudbase = Number(text.match(/Lifted condensation level.*?(\d{4,5})\b/m)[1]);
  const liftedIndex = text.match(/Lifted index.*?([+-]?\d+(?:\.\d+)?)/m)[1];
  const overdevelopmentTime = text.match(/Time of overdevelopment.*?(\d{4}|[A-Za-z].*)/m)[1];
  const overdevelopmentDisplay = overdevelopmentTime.match(/^\d+$/) ? `<br>❗OD Time......... ${overdevelopmentTime}` : "";

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
    High Temp......... ${hiTemp}°<br>
    <br>
    Negative 3 Index.. ${negative3.toLocaleString()}<br>
    Top of Lift....... ${topOfLift.toLocaleString()}<br>
    Cloudbase (LCL)... ${cloudbase.toLocaleString()}<br>
    <br>
    Max Lift Rate..... ${rateOfLift}<br>
    Lifted Index...... ${liftedIndex}<br>
    ${overdevelopmentDisplay}`;

  document.getElementById("soaring-summary").innerHTML = soaringForecast;

  const observations = getSrgSoundingData();
  const srgSoundingData = {
    observations: observations,
    srgLiftParams: {
      negative3AltFt: negative3,
      negative3TempF: getTempAtAltitude(negative3, 5.4),
      topOfLiftAltFt: topOfLift,
      topOfLiftTempF: getTempAtAltitude(topOfLift, 0)
    }
  };

  return { hiTemp, srgSoundingData };

  // Helper function to extract SRG model forecast table via RegEx into formatted sounding data
  function getSrgSoundingData() {
    const table = text.match(/Height\s+Temperature\s+Wind[\s\S]*?-{5,}([\s\S]*?)\n\s*\n/)[1]; // Only need [1] since [0] is the header row info
    const rows = table.split("\n").map(line => line.trim()).filter(line => line && /^\d{4,5}\s/.test(line));
    const nwsData = rows.map(line => {
      const parts = line.split(/\s+/);
      const altitude = Number(parts[0]);
      const tempC = Number(parts[1]);
      const windDir = Number(parts[3]);
      const windSpeed = Number(parts[4]);
      const thermalIndexC = Number(parts[10]);
      return {
        Air_Temp_f: celsiusToF(tempC),
        Altitude_k_ft: altitude / 1000, // Format for sounding chart grid (4,229 => 4.229)
        Lapse_Temp_f: celsiusToF(tempC - thermalIndexC),
        Wind_Direction: windDir,
        Wind_Speed_kt: windSpeed // Knots
      };
    });
    return nwsData.reverse(); // Reverse data order so lowest altitude is first since SRG chart uses descending order altitudes
  }

  // Helper function to get temperatures for lift params -3 Index and Top of Lift
  function getTempAtAltitude(altitude, thermalIndex) {
    altitude /= 1000; // Convert target altitudes to chart grid (4,229 => 4.229)
    for (let i = 0; i < observations.length - 1; i++) {
      const a = observations[i];
      const b = observations[i + 1];
      const tempFound = altitude >= a.Altitude_k_ft && altitude <= b.Altitude_k_ft;
      if (tempFound) {
        const numerator = (altitude - a.Altitude_k_ft) * (b.Air_Temp_f - a.Air_Temp_f);
        const denominator = b.Altitude_k_ft - a.Altitude_k_ft
        return Math.round((a.Air_Temp_f + numerator / denominator + thermalIndex) * 100) / 100;
      }
    }
  }
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