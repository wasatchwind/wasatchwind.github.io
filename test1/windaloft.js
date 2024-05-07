'use strict';
const now = new Date()
const openmeteoData = {"latitude":40.764416,"longitude":-111.98126,"generationtime_ms":0.2390146255493164,"utc_offset_seconds":-21600,"timezone":"America/Denver","timezone_abbreviation":"MDT","elevation":1288.0,"hourly_units":{"time":"iso8601","temperature_2m":"°F","wind_speed_10m":"mp/h","wind_speed_80m":"mp/h","wind_direction_10m":"°","wind_direction_80m":"°","wind_gusts_10m":"mp/h","cape":"J/kg","lifted_index":"","pressure_msl":"hPa","windspeed_850hPa":"mp/h","windspeed_800hPa":"mp/h","windspeed_750hPa":"mp/h","windspeed_700hPa":"mp/h","windspeed_650hPa":"mp/h","windspeed_600hPa":"mp/h","windspeed_550hPa":"mp/h","winddirection_850hPa":"°","winddirection_800hPa":"°","winddirection_750hPa":"°","winddirection_700hPa":"°","winddirection_650hPa":"°","winddirection_600hPa":"°","winddirection_550hPa":"°","geopotential_height_850hPa":"m","geopotential_height_800hPa":"m","geopotential_height_750hPa":"m","geopotential_height_700hPa":"m","geopotential_height_650hPa":"m","geopotential_height_600hPa":"m","geopotential_height_550hPa":"m"},"hourly":{"time":["2024-05-07T15:00","2024-05-07T16:00","2024-05-07T17:00","2024-05-07T18:00","2024-05-07T19:00","2024-05-07T20:00"],"temperature_2m":[48.4,48.9,48.8,47.9,46.7,44.1],"wind_speed_10m":[18.1,19.0,20.3,18.4,18.0,12.7],"wind_speed_80m":[24.3,25.3,27.7,25.3,25.6,20.2],"wind_direction_10m":[311,317,311,309,314,302],"wind_direction_80m":[310,316,311,309,313,303],"wind_gusts_10m":[25.7,26.6,29.1,26.4,26.6,23.7],"cape":[150.0,110.0,50.0,80.0,60.0,20.0],"lifted_index":[0.30,0.00,0.60,0.50,1.30,2.50],"pressure_msl":[1016.2,1015.6,1016.2,1016.5,1017.0,1017.3],"windspeed_850hPa":[22.9,24.6,25.7,23.3,22.5,20.4],"windspeed_800hPa":[26.7,27.7,28.8,26.7,25.6,25.6],"windspeed_750hPa":[28.2,29.2,30.3,28.2,26.0,27.7],"windspeed_700hPa":[28.9,29.3,30.8,28.6,25.4,27.8],"windspeed_650hPa":[29.8,29.9,30.4,29.1,25.9,26.7],"windspeed_600hPa":[30.3,30.5,30.8,28.9,26.9,25.2],"windspeed_550hPa":[31.2,33.7,31.7,29.9,29.6,26.1],"winddirection_850hPa":[311,316,312,310,310,301],"winddirection_800hPa":[310,316,311,310,310,303],"winddirection_750hPa":[308,314,310,309,309,307],"winddirection_700hPa":[304,309,308,307,306,313],"winddirection_650hPa":[298,302,303,304,304,316],"winddirection_600hPa":[293,296,292,298,302,315],"winddirection_550hPa":[288,285,283,291,301,312],"geopotential_height_850hPa":[1458.00,1453.00,1457.00,1460.00,1464.00,1465.00],"geopotential_height_800hPa":[1950.00,1945.00,1949.00,1951.00,1955.00,1956.00],"geopotential_height_750hPa":[2465.00,2459.00,2463.00,2466.00,2469.00,2470.00],"geopotential_height_700hPa":[3004.00,2999.00,3003.00,3005.00,3009.00,3008.00],"geopotential_height_650hPa":[3573.00,3568.00,3572.00,3574.00,3577.00,3577.00],"geopotential_height_600hPa":[4176.00,4170.00,4174.00,4176.00,4179.00,4178.00],"geopotential_height_550hPa":[4817.00,4812.00,4816.00,4817.00,4820.00,4819.00]},"daily_units":{"time":"iso8601","sunset":"iso8601","temperature_2m_max":"°F"},"daily":{"time":["2024-05-07"],"sunset":["2024-05-07T20:30"],"temperature_2m_max":[48.9]}}
const gcpWindAloftData = {"forecast_06h":{"end_time":3,"start_time":20,"temperature":{"altitude_09k":21,"altitude_12k":6,"altitude_18k":-14},"wind_direction":{"altitude_09k":290,"altitude_12k":290,"altitude_18k":300},"wind_speed":{"altitude_09k":28,"altitude_12k":33,"altitude_18k":30}},"forecast_12h":{"end_time":12,"start_time":3,"temperature":{"altitude_09k":19,"altitude_12k":5,"altitude_18k":-14},"wind_direction":{"altitude_09k":310,"altitude_12k":300,"altitude_18k":360},"wind_speed":{"altitude_09k":17,"altitude_12k":14,"altitude_18k":12}},"forecast_24h":{"end_time":0,"start_time":12,"temperature":{"altitude_09k":21,"altitude_12k":12,"altitude_18k":-7},"wind_direction":{"altitude_09k":310,"altitude_12k":340,"altitude_18k":330},"wind_speed":{"altitude_09k":10,"altitude_12k":23,"altitude_18k":20}}}

console.log('Run');

// WIND ALOFT WITH OPEN METEO API & GCP FTP
(async () => {
  const openmeteoURL = 'https://api.open-meteo.com/v1/gfs?latitude=40.77069&longitude=-111.96503&daily=sunset,temperature_2m_max&hourly=temperature_2m,wind_speed_10m,wind_speed_80m,wind_direction_10m,wind_direction_80m,wind_gusts_10m,cape,lifted_index,pressure_msl,windspeed_850hPa,windspeed_800hPa,windspeed_750hPa,windspeed_700hPa,windspeed_650hPa,windspeed_600hPa,windspeed_550hPa,winddirection_850hPa,winddirection_800hPa,winddirection_750hPa,winddirection_700hPa,winddirection_650hPa,winddirection_600hPa,winddirection_550hPa,geopotential_height_850hPa,geopotential_height_800hPa,geopotential_height_750hPa,geopotential_height_700hPa,geopotential_height_650hPa,geopotential_height_600hPa,geopotential_height_550hPa&windspeed_unit=mph&temperature_unit=fahrenheit&forecast_hours=6&forecast_days=1&timezone=America%2FDenver'
  const gcpWindAloftURL = 'https://us-west3-wasatchwind.cloudfunctions.net/wind-aloft-forecast'
  const openmeteoData = await (await fetch(openmeteoURL)).json()
  const gcpWindAloftData = await (await fetch(gcpWindAloftURL)).json()
  windAloft(openmeteoData.hourly, gcpWindAloftData)
})();

function windAloft(openmeteoData, gcpWindAloftData) {
  openmeteoWindAloft(openmeteoData)
  gcpWindAloft(gcpWindAloftData)
  document.getElementById('ALOFT').style.display = 'block'
}

function openmeteoWindAloft(data, redlimit = 22) {
  console.log(data)
  for (const [key, value] of Object.entries(data)) {
    if (key.slice(0,12) === 'geopotential') {
      document.getElementById(key).innerHTML = Math.round(value[0]*3.28084).toLocaleString()
    }
    if (key.slice(0,13) === 'winddirection') {
      for (let i=0; i<6; i++) {
        document.getElementById(`${key}-${i}`).style.transform = `rotate(${value[i]}deg)`
      }
    }
    if (key.slice(0,4) === 'time') {
      for (let i=0; i<6; i++) {
        const time = new Date(value[i]).toLocaleTimeString('en-us', {hour: 'numeric'}).toLowerCase()
        document.getElementById(`windaloft-time-${i}`).innerHTML = time
      }
    }
    if (key.slice(0,9) === 'windspeed') {
      for (let i=0; i<6; i++) {
        const windspeed = Math.round(value[i])
        const barb = windspeed > 40 ? 45 : Math.ceil(windspeed / 5) * 5
        const barbImage = `images/barbs/barb${barb}.png`
        const colorElement = document.getElementById(`${key.slice(10,16)}-${i}`)
        colorElement.style.backgroundColor = windAloftColor(windspeed, redlimit)
        document.getElementById(`${key}-${i}`).innerHTML = windspeed
        document.getElementById(`winddirection_${key.slice(10,16)}-${i}`).src = barbImage
        if (key.slice(10,12) <= 75 && i === 5) redlimit += 2 // 22 + 2 each step after 700, end @ 30
      }
    }
  }
}

function gcpWindAloft(data) {
  const timezoneOffset = now.getTimezoneOffset() / 60
  const gridEndTime = now.getHours() + 6 // 6 cells/6 hr forecast
  const fcstEndRaw = data.forecast_06h.end_time
  const fcstEndFormatted = fcstEndRaw < 6 ? fcstEndRaw + timezoneOffset + 12 : fcstEndRaw - timezoneOffset
  const breakpoint = 6 - (gridEndTime - fcstEndFormatted)
  for (let i=0; i<6; i++) {
    if (i < breakpoint || breakpoint < 0) {
      gcpWindAloftRows(i, data.forecast_06h.wind_speed, data.forecast_06h.wind_direction)
    }
    else gcpWindAloftRows(i, data.forecast_12h.wind_speed, data.forecast_12h.wind_direction)
  }
}

function gcpWindAloftRows (i, windspeed, winddirection, redlimit = 22, accelerator = 1) {
  for (const [key, value] of Object.entries(windspeed)) {
    const barb = value > 40 ? 45 : Math.ceil(value / 5) * 5
    const barbImage = `images/barbs/barb${barb}.png`
    const colorElement = document.getElementById(`${key.slice(-3)}-${i}`)
    colorElement.style.backgroundColor = windAloftColor(value, redlimit)
    document.getElementById(`windspeed_${key}-${i}`).innerHTML = value
    document.getElementById(`winddirection_${key}-${i}`).src = barbImage
    accelerator ++
    redlimit += accelerator // 6k = 22, 9k = 24, 12k = 27, 18k = 31
  }
  for (const [key, value] of Object.entries(winddirection)) {
    document.getElementById(`winddirection_${key}-${i}`).style.transform = `rotate(${value}deg)`
  }
}

function windAloftColor(windspeed, maxspeed) {
  const green = '#0a3622', yellow = '#664d03', orange = '#653208', red = '#58151c'
  if (windspeed < maxspeed - 12) return green
  else if (windspeed < maxspeed - 6) return yellow
  else if (windspeed < maxspeed) return orange
  else return red
}