'use strict';
const now = new Date()
const openmeteoData = {"latitude":40.764416,"longitude":-111.98126,"generationtime_ms":0.3390312194824219,"utc_offset_seconds":-21600,"timezone":"America/Denver","timezone_abbreviation":"MDT","elevation":1288.0,"hourly_units":{"time":"iso8601","temperature_2m":"°F","wind_speed_10m":"mp/h","wind_direction_10m":"°","wind_gusts_10m":"mp/h","cape":"J/kg","lifted_index":"","pressure_msl":"hPa","windspeed_850hPa":"mp/h","windspeed_800hPa":"mp/h","windspeed_750hPa":"mp/h","windspeed_700hPa":"mp/h","windspeed_650hPa":"mp/h","windspeed_600hPa":"mp/h","windspeed_550hPa":"mp/h","winddirection_850hPa":"°","winddirection_800hPa":"°","winddirection_750hPa":"°","winddirection_700hPa":"°","winddirection_650hPa":"°","winddirection_600hPa":"°","winddirection_550hPa":"°","geopotential_height_850hPa":"m","geopotential_height_800hPa":"m","geopotential_height_750hPa":"m","geopotential_height_700hPa":"m","geopotential_height_650hPa":"m","geopotential_height_600hPa":"m","geopotential_height_550hPa":"m"},"hourly":{"time":["2024-05-08T12:00","2024-05-08T13:00","2024-05-08T14:00","2024-05-08T15:00","2024-05-08T16:00","2024-05-08T17:00"],"temperature_2m":[48.3,50.6,51.5,50.9,50.6,50.7],"wind_speed_10m":[8.4,7.9,11.9,13.2,9.6,8.1],"wind_direction_10m":[349,340,304,348,359,5],"wind_gusts_10m":[13.2,15.0,14.1,15.9,16.3,13.9],"cape":[0.0,0.0,20.0,10.0,10.0,10.0],"lifted_index":[6.60,6.30,5.40,5.50,5.00,4.20],"pressure_msl":[1020.6,1020.4,1019.5,1019.0,1019.2,1018.9],"windspeed_850hPa":[7.6,8.2,10.8,13.7,10.9,9.6],"windspeed_800hPa":[7.7,11.3,12.2,14.3,12.2,10.9],"windspeed_750hPa":[8.7,12.4,13.2,14.4,13.4,13.8],"windspeed_700hPa":[17.0,17.4,17.8,15.7,18.2,18.7],"windspeed_650hPa":[27.7,25.1,20.3,20.6,24.7,23.6],"windspeed_600hPa":[31.0,30.0,29.6,25.3,23.2,22.1],"windspeed_550hPa":[23.6,24.8,24.3,25.2,26.2,26.5],"winddirection_850hPa":[338,333,330,338,351,2],"winddirection_800hPa":[339,344,333,340,354,7],"winddirection_750hPa":[351,355,345,343,357,13],"winddirection_700hPa":[4,5,358,350,4,18],"winddirection_650hPa":[5,4,6,360,5,18],"winddirection_600hPa":[1,358,12,10,19,29],"winddirection_550hPa":[1,360,14,35,50,55],"geopotential_height_850hPa":[1495.00,1497.00,1486.00,1490.00,1493.00,1496.00],"geopotential_height_800hPa":[1985.00,1988.00,1984.00,1983.00,1987.00,1988.00],"geopotential_height_750hPa":[2497.00,2501.00,2499.00,2498.00,2503.00,2505.00],"geopotential_height_700hPa":[3034.00,3041.00,3035.00,3040.00,3045.00,3050.00],"geopotential_height_650hPa":[3604.00,3611.00,3607.00,3613.00,3618.00,3624.00],"geopotential_height_600hPa":[4213.00,4220.00,4216.00,4222.00,4228.00,4235.00],"geopotential_height_550hPa":[4866.00,4873.00,4875.00,4879.00,4886.00,4891.00]},"daily_units":{"time":"iso8601","sunset":"iso8601","temperature_2m_max":"°F"},"daily":{"time":["2024-05-08"],"sunset":["2024-05-08T20:31"],"temperature_2m_max":[51.6]}}
const gcpWindAloftData = {"forecast_06h":{"end_time":21,"start_time":14,"temperature":{"altitude_09k":21,"altitude_12k":12,"altitude_18k":-7},"wind_direction":{"altitude_09k":340,"altitude_12k":360,"altitude_18k":350},"wind_speed":{"altitude_09k":14,"altitude_12k":24,"altitude_18k":26}},"forecast_12h":{"end_time":6,"start_time":21,"temperature":{"altitude_09k":26,"altitude_12k":14,"altitude_18k":-4},"wind_direction":{"altitude_09k":350,"altitude_12k":20,"altitude_18k":60},"wind_speed":{"altitude_09k":21,"altitude_12k":18,"altitude_18k":30}},"forecast_24h":{"end_time":18,"start_time":6,"temperature":{"altitude_09k":30,"altitude_12k":19,"altitude_18k":-7},"wind_direction":{"altitude_09k":60,"altitude_12k":60,"altitude_18k":60},"wind_speed":{"altitude_09k":20,"altitude_12k":23,"altitude_18k":29}}}

console.log('Run');

// WIND ALOFT WITH OPEN METEO API & GCP FTP
(async () => {
  const openmeteoURL = 'https://api.open-meteo.com/v1/gfs?latitude=40.77069&longitude=-111.96503&daily=sunset,temperature_2m_max&hourly=temperature_2m,wind_speed_10m,wind_direction_10m,wind_gusts_10m,cape,lifted_index,pressure_msl,windspeed_850hPa,windspeed_800hPa,windspeed_750hPa,windspeed_700hPa,windspeed_650hPa,windspeed_600hPa,windspeed_550hPa,winddirection_850hPa,winddirection_800hPa,winddirection_750hPa,winddirection_700hPa,winddirection_650hPa,winddirection_600hPa,winddirection_550hPa,geopotential_height_850hPa,geopotential_height_800hPa,geopotential_height_750hPa,geopotential_height_700hPa,geopotential_height_650hPa,geopotential_height_600hPa,geopotential_height_550hPa&windspeed_unit=mph&temperature_unit=fahrenheit&forecast_hours=6&forecast_days=1&timezone=America%2FDenver'
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
  delete (data['windspeed_surfac'] = data['wind_speed_10m'], data)['wind_speed_10m']
  delete (data['winddirection_surfac'] = data['wind_direction_10m'], data)['wind_direction_10m']
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
        if (key.slice(10,12) <= 70 && i === 5) redlimit += 2.5
      }
    }
  }
}

function gcpWindAloft(data) {
  console.log(data)
  const timezoneOffset = now.getTimezoneOffset() / 60
  const gridEndTime = now.getHours() + 6 // 6 cells/6 hr forecast
  const fcstEndRaw = data.forecast_06h.end_time < data.forecast_06h.start_time ? data.forecast_06h.end_time + 24 : data.forecast_06h.end_time
  const fcstEnd = fcstEndRaw < 6 ? fcstEndRaw + timezoneOffset + 12 : fcstEndRaw - timezoneOffset
  const breakpoint = 6 - (gridEndTime - fcstEnd)
  for (let i=0; i<6; i++) {
    if (i < breakpoint || breakpoint < 0) {
      gcpWindAloftRows(i, data.forecast_06h.wind_speed, data.forecast_06h.wind_direction)
    }
    else gcpWindAloftRows(i, data.forecast_12h.wind_speed, data.forecast_12h.wind_direction)
  }
}

function gcpWindAloftRows (i, windspeed, winddirection, redlimit = 22, accelerator = 0) {
  for (const [key, value] of Object.entries(windspeed)) {
    const barb = value > 40 ? 45 : Math.ceil(value / 5) * 5
    const barbImage = `images/barbs/barb${barb}.png`
    const colorElement = document.getElementById(`${key.slice(-3)}-${i}`)
    colorElement.style.backgroundColor = windAloftColor(value, redlimit)
    document.getElementById(`windspeed_${key}-${i}`).innerHTML = value
    document.getElementById(`winddirection_${key}-${i}`).src = barbImage
    accelerator += 3
    redlimit += accelerator
  }
  for (const [key, value] of Object.entries(winddirection)) {
    document.getElementById(`winddirection_${key}-${i}`).style.transform = `rotate(${value}deg)`
  }
}

function windAloftColor(windspeed, maxspeed) {
  const green = '#10654c', yellow = '#806104', orange = '#7f3f0a', red = '#6e1b23'
  if (windspeed < maxspeed - 12) return green
  else if (windspeed < maxspeed - 6) return yellow
  else if (windspeed < maxspeed) return orange
  else return red
}