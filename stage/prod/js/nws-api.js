"use strict";

//////////////////////
// Soaring Forecast //
//////////////////////
function processSoaringForecastPage(text) {
  const forecastDate = text.match(/^(.*\b\d{3,4}(?:\sAM|PM)\b.*)$/m)?.[1]?.trim();
  const rateOfLift = text.match(/Maximum rate of lift.*?(\d{1,4}\s*ft\/min.*)$/m)?.[1]?.trim();
  const topOfLift = Number(text.match(/Maximum height of thermals.*?(\d{4,5})\b/m)?.[1]?.trim());
  const hiTemp = Number(text.match(/Forecast maximum temperature.*?(\d{2,3}\.\d)/m)?.[1]?.trim());
  const negative3 = text.match(/Height of the -3 thermal index.*?(\d{4,5}|None)\b/m)?.[1]?.trim();
  // const odTime = text.match(/Time of overdevelopment.*?(\d{4}|None)/m)?.[1]?.trim();
  const odTime = "1200"
  const odTimeDisplay = odTime === "None" ? "" : `\n❗OD Time......... ${odTime}`;

  const soaringForecast = `${forecastDate}
  
  High Temp....... ${hiTemp}°
  Top of Lift..... ${topOfLift.toLocaleString()}
  Height of -3.... ${negative3 === "None" ? "None" : Number(negative3).toLocaleString()}
  Max Lift Rate... ${rateOfLift}
  ${odTimeDisplay}`;

  document.getElementById("soaring-forecast").innerText = soaringForecast;
  document.getElementById("hi-temp").innerHTML = hiTemp;

  return hiTemp;
}



///////////////////
// Area Forecast //
///////////////////
function processAreaForecastPage(text) {
  const forecastDate = text.match(/^\s*(\d{1,4}\s+(?:AM|PM)\s+.*?\d{4})\s*$/m)?.[1]?.trim();
  // const synopsis = text.match(/\.SYNOPSIS([\s\S]*?)\r?\n\r?\n/)?.[1]?.trim();
  const aviation = text.match(/\.AVIATION\.\.\.([\s\S]*?)\n\n/)?.[1]?.replace(/\n+/g, " ").trim() ?? null;
  const keyMessages = text.match(/\.KEY MESSAGES\.\.\.\n([\s\S]*?)\n&&/)?.[1]?.trimStart().split(/\n(?=- )/)
    .map(m => m.replace(/\n(?!- )/g, " ").trim()).join("\n\n") ?? null;
  const areaForecast = `${forecastDate ? forecastDate : "Date error"}
  
  Key Messages:

  ${keyMessages ? keyMessages : "No key messages"}`;

  document.getElementById("area-forecast-aviation").innerText = aviation ? aviation : "No aviation details";
  document.getElementById("area-forecast-today").innerText = areaForecast;
  document.getElementById("area-forecast-tomorrow").innerText = areaForecast;
}



//////////////////////
// General Forecast //
//////////////////////
function processGeneralForecast(data) {
  const forecastDaysCount = 5;
  const isDaytime = data[0].isDaytime;
  let period = isDaytime ? 0 : 1;

  for (let i = 0; i < forecastDaysCount; i++) {
    let qualifier = "";
    let border = `<div class="border-bottom"></div>`;

    if (isDaytime && i === 0) {
      qualifier = "-today";
      border = "";
      document.getElementById("nws-today-div").style.display = "block";
    } else document.getElementById("nws-today-multiday-div").style.display = "block";

    const div = `
      <div class="d-flex">
        <div class="col-3">
          <div class="display-6 text-info">${data[period].name}</div>
          <img class="align-self-start rounded-4 w-100" src="${data[period].icon}">
        </div>
        <div class="col display-6 font-monospace ps-2 text-start">${data[period].detailedForecast}</div>
      </div>
    ${border}`;

    document.getElementById(`forecast-day${i}${qualifier}`).innerHTML = div;
    period += 2;
  }

}
