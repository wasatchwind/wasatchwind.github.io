'use strict';
function updateForecastElements(i, period) {
  const dayName = period.name
  const forecastText = period.detailedForecast
  const iconUrl = `https://api.weather.gov${period.icon}`
  if (i === 0) {
    const forecastDayElements = document.getElementsByClassName(`forecast-day${i}-day`)
    const forecastTextElements = document.getElementsByClassName(`forecast-day${i}-txt`)
    const forecastImgElements = document.getElementsByClassName(`forecast-day${i}-img`)
    for (let j=0; j<2; j++) { //day 0 element appears 2 times in HTML
      forecastDayElements[j].innerHTML = dayName
      forecastTextElements[j].innerHTML = forecastText
      forecastImgElements[j].src = iconUrl
    }
  } else {
    document.getElementById(`forecast-day${i}-day`).innerHTML = dayName;
    document.getElementById(`forecast-day${i}-txt`).innerHTML = forecastText;
    document.getElementById(`forecast-day${i}-img`).src = iconUrl;
  }
};

function nwsForecast(data, forecastDays = 5) {
  const periods = data.properties.periods
  const isDaytime = periods[0].isDaytime
  let position = isDaytime ? 0 : 1
  for (let i=0; i<forecastDays; i++) {
    updateForecastElements(i, periods[position])
    position += 2
  }
  if (now.getHours() >= 5 && isDaytime) {
    document.getElementById('nws-today-div').style.display = 'block'
  }
  if (now.getHours() >= 12 && !isDaytime) {
    document.getElementById('nws-today-multiday-div').style.display = 'block'
  }
  document.getElementById('nws-multiday-div').style.display = 'block'
};