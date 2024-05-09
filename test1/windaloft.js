'use strict';
const now = new Date()
const openmeteoData = {"latitude":40.764416,"longitude":-111.98126,"generationtime_ms":0.25391578674316406,"utc_offset_seconds":-21600,"timezone":"America/Denver","timezone_abbreviation":"MDT","elevation":1288.0,"hourly_units":{"time":"iso8601","temperature_2m":"°F","wind_speed_10m":"mp/h","wind_direction_10m":"°","wind_gusts_10m":"mp/h","cape":"J/kg","lifted_index":"","pressure_msl":"hPa","windspeed_850hPa":"mp/h","windspeed_800hPa":"mp/h","windspeed_750hPa":"mp/h","windspeed_700hPa":"mp/h","windspeed_650hPa":"mp/h","windspeed_600hPa":"mp/h","windspeed_550hPa":"mp/h","winddirection_850hPa":"°","winddirection_800hPa":"°","winddirection_750hPa":"°","winddirection_700hPa":"°","winddirection_650hPa":"°","winddirection_600hPa":"°","winddirection_550hPa":"°","geopotential_height_850hPa":"m","geopotential_height_800hPa":"m","geopotential_height_750hPa":"m","geopotential_height_700hPa":"m","geopotential_height_650hPa":"m","geopotential_height_600hPa":"m","geopotential_height_550hPa":"m"},"hourly":{"time":["2024-05-09T12:00","2024-05-09T13:00","2024-05-09T14:00","2024-05-09T15:00","2024-05-09T16:00","2024-05-09T17:00"],"temperature_2m":[57.6,60.6,62.8,61.4,63.0,62.4],"wind_speed_10m":[3.6,6.7,15.5,11.9,18.2,17.1],"wind_direction_10m":[22,84,85,58,96,97],"wind_gusts_10m":[16.6,15.2,25.1,21.9,29.1,23.5],"cape":[300.0,280.0,400.0,360.0,280.0,90.0],"lifted_index":[-2.10,-1.90,-3.30,-3.00,-2.10,-0.80],"pressure_msl":[1019.6,1018.8,1019.2,1019.2,1019.3,1018.4],"windspeed_850hPa":[11.2,15.4,21.9,26.1,21.0,20.8],"windspeed_800hPa":[17.3,20.8,25.1,29.8,24.7,22.9],"windspeed_750hPa":[24.0,23.3,23.3,28.0,23.1,20.8],"windspeed_700hPa":[26.5,23.4,19.4,22.0,17.6,16.4],"windspeed_650hPa":[23.1,20.6,15.7,15.9,11.7,12.8],"windspeed_600hPa":[18.7,16.8,14.0,14.0,7.8,11.2],"windspeed_550hPa":[18.5,17.1,18.0,16.0,12.8,15.1],"winddirection_850hPa":[66,77,73,66,79,97],"winddirection_800hPa":[75,81,75,70,84,97],"winddirection_750hPa":[81,82,74,74,90,98],"winddirection_700hPa":[82,81,69,75,99,99],"winddirection_650hPa":[80,78,60,66,103,98],"winddirection_600hPa":[68,65,46,46,79,90],"winddirection_550hPa":[52,48,40,37,45,92],"geopotential_height_850hPa":[1514.00,1511.00,1516.00,1517.00,1518.00,1512.00],"geopotential_height_800hPa":[2014.00,2013.00,2019.00,2019.00,2021.00,2016.00],"geopotential_height_750hPa":[2537.00,2537.00,2545.00,2544.00,2548.00,2544.00],"geopotential_height_700hPa":[3087.00,3089.00,3098.00,3097.00,3101.00,3098.00],"geopotential_height_650hPa":[3667.00,3671.00,3681.00,3679.00,3684.00,3681.00],"geopotential_height_600hPa":[4283.00,4287.00,4297.00,4296.00,4301.00,4299.00],"geopotential_height_550hPa":[4939.00,4943.00,4954.00,4953.00,4957.00,4957.00]},"daily_units":{"time":"iso8601","sunset":"iso8601","temperature_2m_max":"°F"},"daily":{"time":["2024-05-09"],"sunset":["2024-05-09T20:32"],"temperature_2m_max":[63.0]}}
const gcpWindAloftData = {"forecast_06h":{"end_time":21,"start_time":14,"temperature":{"altitude_09k":33,"altitude_12k":19,"altitude_18k":-9},"wind_direction":{"altitude_09k":70,"altitude_12k":70,"altitude_18k":50},"wind_speed":{"altitude_09k":32,"altitude_12k":33,"altitude_18k":23}},"forecast_12h":{"end_time":6,"start_time":21,"temperature":{"altitude_09k":35,"altitude_12k":21,"altitude_18k":-7},"wind_direction":{"altitude_09k":70,"altitude_12k":60,"altitude_18k":70},"wind_speed":{"altitude_09k":31,"altitude_12k":31,"altitude_18k":30}},"forecast_24h":{"end_time":18,"start_time":6,"temperature":{"altitude_09k":35,"altitude_12k":21,"altitude_18k":-4},"wind_direction":{"altitude_09k":90,"altitude_12k":60,"altitude_18k":100},"wind_speed":{"altitude_09k":12,"altitude_12k":12,"altitude_18k":23}}}

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
        redlimit = key.slice(10,16) === 'surfac' ? 22 : redlimit
        document.getElementById(`${key.slice(10,16)}-${i}`).style.backgroundColor = windAloftColor(windspeed, redlimit)
        document.getElementById(`${key}-${i}`).innerHTML = windspeed
        document.getElementById(`winddirection_${key.slice(10,16)}-${i}`).src = `images/barbs/barb${barb}.png`
        if (key.slice(10,12) <= 70 && i === 5) redlimit += 2.5
      }
    }
  }
}

function gcpWindAloft(data) {
  const forecastEndRaw = data.forecast_06h.end_time < data.forecast_06h.start_time ? data.forecast_06h.end_time + 24 : data.forecast_06h.end_time
  const gridEndTime = now.getHours() + 6
  const timezoneOffset = now.getTimezoneOffset() / 60
  const forecastEndTime = forecastEndRaw < 6 ? forecastEndRaw + timezoneOffset + 12 : forecastEndRaw - timezoneOffset
  const breakpoint = 6 - (gridEndTime - forecastEndTime)
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
    document.getElementById(`${key.slice(-3)}-${i}`).style.backgroundColor = windAloftColor(value, redlimit)
    document.getElementById(`windspeed_${key}-${i}`).innerHTML = value
    document.getElementById(`winddirection_${key}-${i}`).src = `images/barbs/barb${barb}.png`
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