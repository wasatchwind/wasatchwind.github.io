"use strict";

// Function to extract and return <pre> text from .text() fetches
function parsePreText(text) {
  const parser = new DOMParser();
  return parser.parseFromString(text, "text/html").querySelector("pre").textContent;
}



//////////////////////
// Soaring Forecast //
//////////////////////
function processSoaringForecastPage(text) {
  const preText = parsePreText(text);
  const forecastDate = preText.match(/^(.*\b\d{3,4}(?:\sAM|PM)\b.*)$/m)?.[1]?.trim();
  const rateOfLift = preText.match(/Maximum rate of lift.*?(\d{1,4}\s*ft\/min.*)$/m)?.[1]?.trim();
  const topOfLift = Number(preText.match(/Maximum height of thermals.*?(\d{4,5})\b/m)?.[1]?.trim());
  const hiTemp = Number(preText.match(/Forecast maximum temperature.*?(\d{2,3}\.\d)/m)?.[1]?.trim());
  const odTime = preText.match(/Time of overdevelopment.*?(\d{4}|None)/m)?.[1]?.trim();
  const negative3 = preText.match(/Height of the -3 thermal index.*?(\d{4,5}|None)\b/m)?.[1]?.trim();

  const soaringForecast = `${forecastDate}
  
  High Temp...... ${hiTemp}°
  Top of Lift.... ${topOfLift.toLocaleString()}
  Height of -3... ${negative3 === "None" ? "None" : Number(negative3).toLocaleString()}
  Max Lift Rate.. ${rateOfLift}
  OD Time........ ${odTime}`;

  document.getElementById("soaring-forecast").innerText = soaringForecast;
  document.getElementById("hi-temp").innerHTML = hiTemp;

  return hiTemp;
}



///////////////////
// Area Forecast //
///////////////////
function processAreaForecastPage(text) {

  const preText = parsePreText(text);
  const forecastDate = preText.match(/^\s*(\d{1,4}\s+(?:AM|PM)\s+.*?\d{4})\s*$/m)?.[1]?.trim();
  const synopsis = preText.match(/\.SYNOPSIS([\s\S]*?)\r?\n\r?\n/)?.[1]?.trim();
  const aviation = preText.match(/\.AVIATION\.\.\.([\s\S]*?)\n\n/)?.[1]?.replace(/\n+/g, " ").trim() ?? null;
  const keyMessages = preText.match(/\.KEY MESSAGES\.\.\.\n([\s\S]*?)\n&&/)?.[1]?.trimStart().split(/\n(?=- )/)
    .map(m => m.replace(/\n(?!- )/g, " ").trim()).join("\n\n") ?? null;
  const areaForecast = `${forecastDate ? forecastDate : "Date error"}
  
  Key Messages:

  ${keyMessages ? keyMessages : "No key messages"}

  Synopsis:

  ${synopsis ? synopsis.replace(/\n/g, " ") : "No synopsis - click for full discussion"}`;

  document.getElementById("area-forecast").innerText = areaForecast;
  document.getElementById("area-forecast-div").style.display = "block";
  document.getElementById("area-forecast-aviation").innerText = aviation ? aviation : "No aviation details";
  document.getElementById("area-forecast-aviation-div").style.display = "block";

}
