'use strict';
const now = new Date()
// const openmeteoData = {"latitude":40.764416,"longitude":-111.98126,"generationtime_ms":0.38301944732666016,"utc_offset_seconds":-21600,"timezone":"America/Denver","timezone_abbreviation":"MDT","elevation":1288.0,"hourly_units":{"time":"iso8601","temperature_2m":"°F","wind_speed_10m":"mp/h","wind_speed_80m":"mp/h","wind_direction_10m":"°","wind_direction_80m":"°","wind_gusts_10m":"mp/h","cape":"J/kg","lifted_index":"","pressure_msl":"hPa","windspeed_850hPa":"mp/h","windspeed_800hPa":"mp/h","windspeed_750hPa":"mp/h","windspeed_700hPa":"mp/h","windspeed_650hPa":"mp/h","windspeed_600hPa":"mp/h","windspeed_550hPa":"mp/h","winddirection_850hPa":"°","winddirection_800hPa":"°","winddirection_750hPa":"°","winddirection_700hPa":"°","winddirection_650hPa":"°","winddirection_600hPa":"°","winddirection_550hPa":"°","geopotential_height_850hPa":"m","geopotential_height_800hPa":"m","geopotential_height_750hPa":"m","geopotential_height_700hPa":"m","geopotential_height_650hPa":"m","geopotential_height_600hPa":"m","geopotential_height_550hPa":"m"},"hourly":{"time":["2024-05-05T18:00","2024-05-05T19:00","2024-05-05T20:00","2024-05-05T21:00","2024-05-05T22:00","2024-05-05T23:00"],"temperature_2m":[37.1,38.8,39.0,37.8,37.1,38.3],"wind_speed_10m":[4.2,4.2,4.1,4.0,2.0,5.6],"wind_speed_80m":[4.5,4.7,4.4,6.1,5.4,8.5],"wind_direction_10m":[74,148,158,177,180,233],"wind_direction_80m":[72,149,156,172,222,247],"wind_gusts_10m":[4.5,4.7,4.3,6.3,5.8,16.3],"cape":[0.0,0.0,0.0,0.0,30.0,40.0],"lifted_index":[5.50,3.60,2.60,1.80,1.10,0.60],"pressure_msl":[1009.6,1009.6,1009.2,1009.1,1010.4,1010.3],"windspeed_850hPa":[3.2,2.8,3.2,5.4,5.0,7.2],"windspeed_800hPa":[5.6,4.0,1.6,2.6,9.1,14.9],"windspeed_750hPa":[12.9,13.0,10.7,10.5,16.5,17.0],"windspeed_700hPa":[11.6,19.5,18.6,17.3,19.7,17.5],"windspeed_650hPa":[15.7,20.4,21.9,20.6,17.9,14.5],"windspeed_600hPa":[40.6,24.6,23.6,22.0,13.7,16.4],"windspeed_550hPa":[56.6,41.5,34.9,29.2,19.7,20.8],"winddirection_850hPa":[75,143,153,171,227,252],"winddirection_800hPa":[326,309,323,194,264,272],"winddirection_750hPa":[312,310,318,311,281,276],"winddirection_700hPa":[291,297,310,309,293,278],"winddirection_650hPa":[240,289,290,297,306,295],"winddirection_600hPa":[223,248,263,283,312,300],"winddirection_550hPa":[209,222,233,246,281,300],"geopotential_height_850hPa":[1410.00,1411.00,1409.00,1409.00,1414.00,1412.00],"geopotential_height_800hPa":[1896.00,1898.00,1896.00,1896.00,1903.00,1899.00],"geopotential_height_750hPa":[2407.00,2410.00,2409.00,2410.00,2416.00,2410.00],"geopotential_height_700hPa":[2946.00,2951.00,2950.00,2952.00,2956.00,2950.00],"geopotential_height_650hPa":[3519.00,3523.00,3523.00,3525.00,3526.00,3520.00],"geopotential_height_600hPa":[4129.00,4132.00,4132.00,4133.00,4131.00,4126.00],"geopotential_height_550hPa":[4785.00,4785.00,4782.00,4781.00,4778.00,4773.00]},"daily_units":{"time":"iso8601","sunset":"iso8601","temperature_2m_max":"°F"},"daily":{"time":["2024-05-05"],"sunset":["2024-05-05T20:28"],"temperature_2m_max":[68.0]}}
// const gcpWindAloftData = {"forecast_06h":{"end_time":3,"start_time":20,"temperature":{"altitude_06k":null,"altitude_09k":23,"altitude_12k":12,"altitude_18k":-5},"wind_direction":{"altitude_06k":null,"altitude_09k":290,"altitude_12k":240,"altitude_18k":180},"wind_speed":{"altitude_06k":0,"altitude_09k":16,"altitude_12k":17,"altitude_18k":66}},"forecast_12h":{"end_time":12,"start_time":3,"temperature":{"altitude_06k":null,"altitude_09k":21,"altitude_12k":8,"altitude_18k":-16},"wind_direction":{"altitude_06k":250,"altitude_09k":260,"altitude_12k":260,"altitude_18k":280},"wind_speed":{"altitude_06k":12,"altitude_09k":24,"altitude_12k":18,"altitude_18k":17}},"forecast_24h":{"end_time":0,"start_time":12,"temperature":{"altitude_06k":null,"altitude_09k":21,"altitude_12k":10,"altitude_18k":-9},"wind_direction":{"altitude_06k":260,"altitude_09k":280,"altitude_12k":280,"altitude_18k":300},"wind_speed":{"altitude_06k":9,"altitude_09k":30,"altitude_12k":37,"altitude_18k":44}}}

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
        if (key.slice(10,12) <= 75 && i === 5) redlimit += 2 // 22 + 2 each step after 700, end @ 30
      }
    }
  }
}

function gcpWindAloft(data) {
  console.log(data)
  const timezoneOffset = now.getTimezoneOffset() / 60
  const endgrid = now.getHours() - 7 // -12h, +5 for cells past first
  const endtime = data.forecast_06h.end_time + 11 - timezoneOffset // +12h, -1 for grid hour offset
  const breakpoint = 6 - (endgrid - endtime)
  const check06k = data.forecast_06h.wind_speed.altitude_06k
  const check12k = data.forecast_12h.wind_speed.altitude_06k
  for (let i=0; i<6; i++) {
    if (i < breakpoint || breakpoint < 0) {
      gcpWindAloftRows(i, data.forecast_06h.wind_speed, data.forecast_06h.wind_direction)
    }
    else gcpWindAloftRows(i, data.forecast_12h.wind_speed, data.forecast_12h.wind_direction)
  }
  if (breakpoint < 0 && !check06k || !check06k && !check12k) {
    document.getElementById('6k').style.display = 'none'
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