"use strict";

//////////////////////
// Soaring Forecast //
//////////////////////
function processSoaringForecastPage(text) {
  const winterFormat = text.search(/MINUS/) > 0 ? true : false;

  const forecastDate = text.match(/^(.*\b\d{3,4}(?:\sAM|PM)\b.*)$/m)?.[1]?.trim();
  const rateOfLift = text.match(/Maximum rate of lift.*?(\d{1,4}\s*ft\/min.*)$/m)?.[1]?.trim();
  const topOfLift = Number(text.match(/Maximum height of thermals.*?(\d{4,5})\b/m)?.[1]?.trim());
  const hiTemp = Number(text.match(/Forecast maximum temperature.*?(\d{2,3}\.\d)/m)?.[1]?.trim());
  const negative3 = text.match(/Height of the -3 thermal index.*?(\d{4,5}|None)\b/m)?.[1]?.trim();
  const cloudbase = Number(text.match(/Lifted condensation level.*?(\d{4,5})\b/m)?.[1]?.trim()).toLocaleString();
  const liftedIndex = text.match(/Lifted index.*?([+-]?\d+(?:\.\d+)?)/m)?.[1];
  const overdevelopmentTime = text.match(/Time of overdevelopment.*?(\d{4}|None)/m)?.[1]?.trim();
  const overdevelopmentDisplay = !overdevelopmentTime || overdevelopmentTime === "None" ? "" : `<br>❗OD Time......... ${overdevelopmentTime}`;

  const soaringForecast = winterFormat
    ? `Format Error<br>
      <br>
      Click here to open the Soaring Foreast`
    : `${forecastDate}<br>
      <br>
      High Temp......... ${hiTemp}°<br>
      Height of -3...... ${negative3 === "None" ? negative3 : Number(negative3).toLocaleString()}<br>
      Top of Lift....... ${topOfLift.toLocaleString()}<br>
      Cloudbase (LCL)... ${cloudbase}<br>
      <br>
      Max Lift Rate..... ${rateOfLift}<br>
      Lifted Index...... ${liftedIndex}<br>
      ${overdevelopmentDisplay}`;

  const soaringForecastParams = {
    elementId: "soaring-forecast",
    href: "https://forecast.weather.gov/product.php?site=NWS&issuedby=SLC&product=SRG&format=CI&version=1&glossary=1",
    isImg: false,
    isVisible: true,
    src: soaringForecast,
    title: "Soaring Forecast Summary"
  };

  standardHtmlComponent(soaringForecastParams);
  return hiTemp;
}



///////////////////
// Area Forecast //
///////////////////
function processAreaForecastPageAndSunset(text, sunset) {
  // return;
  const isAfterSunset = new Date().getHours() >= sunset.getHours();
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
      isImg: false,
      isVisible: true,
      src: aviation,
      title: "Aviation Forecast"
    }, {
      elementId: `area-forecast-${displayBlock}`,
      href: "https://forecast.weather.gov/product.php?site=NWS&issuedby=SLC&product=AFD&format=txt&version=1&glossary=1",
      isImg: false,
      isVisible: true,
      src: areaForecast,
      title: "Area Forecast Discussion"
    }, {
      elementId: `hourly-chart-${displayBlock}`,
      href: "https://forecast.weather.gov/MapClick.php?w0=t&w3=sfcwind&w3u=1&w4=sky&w5=pop&w7=rain&w9=snow&w13u=0&w16u=1&w17u=1&AheadHour=0&Submit=Submit&FcstType=graphical&textField1=40.7603&textField2=-111.8882&site=all&unit=0&dd=&bw=",
      isImg: true,
      isVisible: true,
      src: "https://forecast.weather.gov/meteograms/Plotter.php?lat=40.7603&lon=-111.8882&wfo=SLC&zcode=UTZ105&gset=30&gdiff=10&unit=0&tinfo=MY7&ahour=0&pcmd=10001110100000000000000000000000000000000000000000000000000&lg=en&indu=1!1!1!&dd=&bw=&hrspan=48&pqpfhr=6&psnwhr=6",
      title: "Hourly Forecast Chart"
    }
  ];

  componentsToDisplay.forEach(component => {
    standardHtmlComponent(component);
  });
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

    const container = document.getElementById(`forecast-day${i}${qualifier}`);
    container.innerHTML = `
      <div class="d-flex">
        <div class="col-3">
          <div class="display-6 text-info">${data[period].name}</div>
          <img class="align-self-start rounded-4 w-100" src="${data[period].icon}">
        </div>
        <div class="col display-6 font-monospace ps-2 text-start">${data[period].detailedForecast}</div>
      </div>
    ${border}`;

    period += 2;
  }
}