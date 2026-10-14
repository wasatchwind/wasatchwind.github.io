"use strict";

////////////////////////////////////
// Soaring Guidance for SLC (SRG) //
////////////////////////////////////
function processSoaringForecastPage(text) {
  // let forecastDate;
  const isNewFormat = /National Weather Service/i.test(text);

  // Helper function
  const firstMatch = (regex, group = 1) => {
    const match = text.match(regex);
    return match ? match[group] : null;
  };

  // Helper function
  const numberMatch = (regex) => {
    const value = firstMatch(regex);
    return value === null ? null : Number(value.replace(/,/g, ""));
  };

  // Helper functions
  const formatDate = (date) => date.toLocaleDateString("en-US", { month: "short", day: "numeric" });
  function forecastDateText(text) { return text.match(/^\s*\d{3,4}\s+[AP]M\s+MDT.*$/m)?.[0] ?? ""; }

  const dateMatch = text.match(/\b([A-Z][a-z]+ \d{1,2}, \d{4})\b/) || text.match(/DATE\.\.\.\s*(\d{2})\/(\d{2})\/(\d{2})/);
  const forecastDate = dateMatch[1].includes(",") ? new Date(dateMatch[1]) : new Date(2000 + Number(dateMatch[3]), Number(dateMatch[1]) - 1, Number(dateMatch[2]));
  const formattedToday = formatDate(new Date());
  const formattedDate = formatDate(forecastDate);
  const dateColor = formattedToday === formattedDate ? "" : "text-danger";
  const rateOfLift = firstMatch(/(?:maximum rate of lift|maximum lift).*?(\d{1,4}\s*ft\/min)/i);
  const topOfLift = numberMatch(/(?:Maximum height of thermals|top of the lift).*?([\d,]{4,5})/i);
  const srgHiTemp = numberMatch(/(?:Forecast maximum temperature|slc max temperature).*?(\d{2,3}(?:\.\d)?)/i);
  const negative3Literal = firstMatch(/(?:height of the -3 thermal index|height of the -3 index).*?([\d,]+|[A-Za-z][^\r\n]*)/i);
  const negative3 = /^\d[\d,]*$/.test(negative3Literal || "") ? Number(negative3Literal.replace(/,/g, "")) : negative3Literal;

  // New format only
  const cloudbase = isNewFormat ? numberMatch(/Lifted condensation level.*?([\d,]{4,5})\b/i) : null;
  const liftedIndex = isNewFormat ? firstMatch(/Lifted index.*?([+-]?\d+(?:\.\d+)?)/i) : null;
  const overdevelopmentTime = isNewFormat ? firstMatch(/Time of overdevelopment.*?(\d{4}|[A-Za-z][^\r\n]*)/i) : null;
  const overdevelopmentDisplay = overdevelopmentTime && /^\d+$/.test(overdevelopmentTime) ? `<br>❗OD Time......... ${overdevelopmentTime}` : "";
  const observations = isNewFormat ? getSrgSoundingData(text) : [];

  const srgSoundingData = {
    observations,
    srgLiftParams: {
      negative3AltFt: negative3,
      negative3TempF:
        observations.length && typeof negative3 === "number"
          ? getTempAtAltitude(observations, negative3, 5.4)
          : undefined,

      topOfLiftAltFt: topOfLift,
      topOfLiftTempF:
        observations.length
          ? getTempAtAltitude(observations, topOfLift, 0)
          : undefined
    }
  };
  
  // HTML display
  document.getElementById("soaring-forecast").innerHTML = `
    <div class="mb-4">
      <div class="display-3 d-flex justify-content-center text-info">
        <div>Soaring Forecast @ KSLC</div>
        <div class="${dateColor}">&nbsp;${formattedDate}</div>
      </div>
      <a href="https://forecast.weather.gov/product.php?site=NWS&issuedby=SLC&product=SRG&format=CI&version=1&glossary=1" target="_blank">
        <div class="bg-dark border rounded-4">
          <div class="w-100" id="srg-sounding-chart"></div>
          <div class="border-bottom display-6 fw-semibold mb-4 text-info" id="model-lapse"></div>
          <div class="display-6 font-monospace ps-2 text-start" id="soaring-summary"></div>
        </div>
      </a>
    </div>`;
  
  const soaringForecast = `
    ${isNewFormat ? forecastDateText(text) : `${formattedDate}`}<br><br>
    High Temp......... ${srgHiTemp}°<br><br>
    Negative 3 Index.. ${typeof negative3 === "number" ? negative3.toLocaleString() : negative3}<br>
    Top of Lift....... ${topOfLift?.toLocaleString() ?? "N/A"}<br>
    ${cloudbase !== null ? `Cloudbase (LCL)... ${cloudbase.toLocaleString()}<br><br>` : ""}
    Max Lift Rate..... ${rateOfLift ?? "N/A"}<br>
    ${liftedIndex !== null ? `Lifted Index...... ${liftedIndex}<br>` : ""}
    ${overdevelopmentDisplay}`;

  document.getElementById("soaring-summary").innerHTML = soaringForecast;

  return { srgHiTemp, srgSoundingData };
}

// Parse the new-format sounding/model table
function getSrgSoundingData(text) {
  const tableMatch = text.match(/Height\s+Temperature\s+Wind[\s\S]*?-{5,}\s*([\s\S]*?)\n\s*[-]{3,}/i);
  if (!tableMatch) return [];

  const rows = tableMatch[1].split("\n").map(line => line.trim()).filter(line => /^\d{4,5}\s/.test(line));

  return rows.map(line => {
    const parts = line.split(/\s+/);
    const altitude = Number(parts[0]);
    const tempC = Number(parts[1]);
    const windDir = Number(parts[3]);
    const windSpeed = Number(parts[4]);
    const thermalIndexC = Number(parts[10]);

    return {
      Air_Temp_f: celsiusToF(tempC),
      Altitude_k_ft: altitude / 1000,
      Lapse_Temp_f: celsiusToF(tempC - thermalIndexC),
      Wind_Direction: windDir,
      Wind_Speed_kt: windSpeed
    };
  }).reverse();
}

// Interpolate temperature at a given altitude
function getTempAtAltitude(observations, altitude, thermalIndex) {
  if (!observations.length || typeof altitude !== "number") return undefined;
  const targetAltitude = altitude / 1000;

  for (let i = 0; i < observations.length - 1; i++) {
    const a = observations[i];
    const b = observations[i + 1];

    if (targetAltitude >= a.Altitude_k_ft && targetAltitude <= b.Altitude_k_ft) {
      const fraction = (targetAltitude - a.Altitude_k_ft) / (b.Altitude_k_ft - a.Altitude_k_ft);
      const temperature = a.Air_Temp_f + fraction * (b.Air_Temp_f - a.Air_Temp_f);

      return Math.round((temperature + thermalIndex) * 100) / 100;
    }
  }

  return undefined;
}

////////////////////////////////////////////
// Area Forecast Discussion for SLC (AFD) //
////////////////////////////////////////////
function processAreaForecastPageAndHourlyChart(text, isAfterSunset) {
  const displayBlock = isAfterSunset ? "tomorrow" : "today";
  const forecastDate = text.match(/^\s*(\d{1,4}\s+(?:AM|PM)\s+.*?\d{4})\s*$/m)?.[1]?.trim();
  const parsedText = text.split("&&").map(section => section.trim());
  const aviation = parsedText.find(element => element.startsWith(".AVIATION")).split(/AVIATION./)[1].match(/^[\s\S]*?(?=\n\s*\nREST\b)/m)[0] ?? null;
  const keySection = parsedText[0].startsWith(".KEY") ? 0 : 1;
  const keyMessages = parsedText[keySection].split(/KEY MESSAGES.+\n/)[1].trim().split(/\n(?=\s*-)/).map(m => m.replace(/\n(?!\s*-)/g, " ")).join("<br>") ?? null;

  const aviationForecast = `
    ${forecastDate ? forecastDate : "Date error"}<br>
    <br>
    ${aviation}`;

  const areaForecast = `
    ${forecastDate ? forecastDate : "Date error"}<br>
    <br>
    ${keyMessages ? keyMessages : "No key messages"}`;

  const componentsToDisplay = [
    {
      elementId: "area-forecast-aviation",
      href: "https://forecast.weather.gov/product.php?site=NWS&issuedby=SLC&product=AFD&format=txt&version=1&glossary=1",
      src: aviationForecast,
      title: "Aviation Forecast"
    }, {
      elementId: `area-forecast-${displayBlock}`, // Conditional visibility logic
      href: "https://forecast.weather.gov/product.php?site=NWS&issuedby=SLC&product=AFD&format=txt&version=1&glossary=1",
      src: areaForecast,
      title: "Area Forecast Discussion"
    }, {
      elementId: `hourly-chart-${displayBlock}`, // Conditional visibility logic
      href: "https://forecast.weather.gov/MapClick.php?w0=t&w3=sfcwind&w3u=1&w4=sky&w5=pop&w7=rain&w9=snow&w13u=0&w14u=1&w15u=1&AheadHour=0&Submit=Submit&FcstType=graphical&textField1=40.7808&textField2=-112.0319&site=all&unit=0&dd=&bw=",
      src: "https://forecast.weather.gov/meteograms/Plotter.php?lat=40.7808&lon=-112.0319&wfo=SLC&zcode=UTZ105&gset=30&gdiff=10&unit=0&tinfo=MY7&ahour=0&pcmd=10001110101000000000000000000000000000000000000000000000000&lg=en&indu=1!1!1!&dd=&bw=&hrspan=48&pqpfhr=6&psnwhr=6",
      title: "Hourly Forecast Chart @ KSLC"
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
    title: "Days Ahead @ KSLC"
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
        title: "General Forecast @ KSLC",
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