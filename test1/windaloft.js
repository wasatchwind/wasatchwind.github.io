'use strict';
const now = new Date()
const openmeteoData = {"latitude":40.764416,"longitude":-111.98126,"generationtime_ms":0.2880096435546875,"utc_offset_seconds":-21600,"timezone":"America/Denver","timezone_abbreviation":"MDT","elevation":1288.0,"hourly_units":{"time":"iso8601","temperature_2m":"°F","wind_speed_10m":"mp/h","wind_speed_80m":"mp/h","wind_direction_10m":"°","wind_direction_80m":"°","wind_gusts_10m":"mp/h","cape":"J/kg","lifted_index":"","pressure_msl":"hPa","windspeed_850hPa":"mp/h","windspeed_800hPa":"mp/h","windspeed_750hPa":"mp/h","windspeed_700hPa":"mp/h","windspeed_650hPa":"mp/h","windspeed_600hPa":"mp/h","windspeed_550hPa":"mp/h","winddirection_850hPa":"°","winddirection_800hPa":"°","winddirection_750hPa":"°","winddirection_700hPa":"°","winddirection_650hPa":"°","winddirection_600hPa":"°","winddirection_550hPa":"°","geopotential_height_850hPa":"m","geopotential_height_800hPa":"m","geopotential_height_750hPa":"m","geopotential_height_700hPa":"m","geopotential_height_650hPa":"m","geopotential_height_600hPa":"m","geopotential_height_550hPa":"m"},"hourly":{"time":["2024-05-07T20:00","2024-05-07T21:00","2024-05-07T22:00","2024-05-07T23:00","2024-05-08T00:00","2024-05-08T01:00"],"temperature_2m":[42.8,41.1,40.9,40.0,39.6,39.8],"wind_speed_10m":[8.8,9.4,9.1,5.9,2.5,5.3],"wind_speed_80m":[18.7,23.6,22.1,13.5,7.4,20.2],"wind_direction_10m":[302,301,308,323,225,348],"wind_direction_80m":[304,305,310,328,358,347],"wind_gusts_10m":[22.6,27.5,27.1,16.6,16.6,22.1],"cape":[90.0,50.0,0.0,60.0,40.0,20.0],"lifted_index":[0.20,1.70,1.80,1.70,3.10,4.20],"pressure_msl":[1015.9,1015.9,1017.3,1017.1,1017.6,1017.9],"windspeed_850hPa":[19.3,19.0,18.6,7.8,8.9,10.3],"windspeed_800hPa":[22.9,28.2,27.3,18.7,21.6,21.3],"windspeed_750hPa":[27.9,29.8,27.7,22.8,28.2,27.5],"windspeed_700hPa":[27.9,29.5,24.9,24.8,29.2,26.4],"windspeed_650hPa":[27.9,27.6,21.8,25.5,26.7,25.5],"windspeed_600hPa":[27.7,24.1,22.5,23.1,21.2,24.6],"windspeed_550hPa":[27.0,22.4,22.2,21.0,23.1,24.8],"winddirection_850hPa":[298,317,313,341,353,351],"winddirection_800hPa":[306,311,317,328,342,344],"winddirection_750hPa":[305,311,323,335,342,342],"winddirection_700hPa":[311,315,325,339,337,337],"winddirection_650hPa":[312,317,330,341,337,325],"winddirection_600hPa":[311,318,335,346,339,330],"winddirection_550hPa":[312,322,334,342,354,1],"geopotential_height_850hPa":[1462.00,1470.00,1470.00,1471.00,1470.00,1471.00],"geopotential_height_800hPa":[1954.00,1961.00,1960.00,1961.00,1959.00,1960.00],"geopotential_height_750hPa":[2469.00,2476.00,2473.00,2475.00,2471.00,2471.00],"geopotential_height_700hPa":[3009.00,3016.00,3012.00,3014.00,3009.00,3009.00],"geopotential_height_650hPa":[3579.00,3585.00,3580.00,3582.00,3578.00,3578.00],"geopotential_height_600hPa":[4181.00,4186.00,4183.00,4184.00,4180.00,4182.00],"geopotential_height_550hPa":[4823.00,4829.00,4827.00,4827.00,4824.00,4830.00]},"daily_units":{"time":"iso8601","sunset":"iso8601","temperature_2m_max":"°F"},"daily":{"time":["2024-05-07"],"sunset":["2024-05-07T20:30"],"temperature_2m_max":[48.0]}}
const gcpWindAloftData = {"forecast_06h":{"end_time":9,"start_time":2,"temperature":{"altitude_09k":19,"altitude_12k":6,"altitude_18k":-13},"wind_direction":{"altitude_09k":300,"altitude_12k":290,"altitude_18k":20},"wind_speed":{"altitude_09k":21,"altitude_12k":12,"altitude_18k":18}},"forecast_12h":{"end_time":18,"start_time":9,"temperature":{"altitude_09k":19,"altitude_12k":8,"altitude_18k":-7},"wind_direction":{"altitude_09k":340,"altitude_12k":320,"altitude_18k":350},"wind_speed":{"altitude_09k":16,"altitude_12k":23,"altitude_18k":24}},"forecast_24h":{"end_time":6,"start_time":18,"temperature":{"altitude_09k":24,"altitude_12k":14,"altitude_18k":-2},"wind_direction":{"altitude_09k":350,"altitude_12k":20,"altitude_18k":40},"wind_speed":{"altitude_09k":15,"altitude_12k":17,"altitude_18k":15}}}

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
  const timezoneOffset = now.getTimezoneOffset() / 60
  const gridEndTime = now.getHours() + 6 // 6 cells/6 hr forecast
  const fcstEndRaw = data.forecast_06h.end_time
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