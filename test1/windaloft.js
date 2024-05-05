'use strict';
const now = new Date()
const openmeteoData = {"latitude":40.764416,"longitude":-111.98126,"generationtime_ms":4.245996475219727,"utc_offset_seconds":-21600,"timezone":"America/Denver","timezone_abbreviation":"MDT","elevation":1288.0,"hourly_units":{"time":"iso8601","temperature_2m":"°F","wind_speed_10m":"mp/h","wind_speed_80m":"mp/h","wind_direction_10m":"°","wind_direction_80m":"°","wind_gusts_10m":"mp/h","cape":"J/kg","lifted_index":"","pressure_msl":"hPa","windspeed_850hPa":"mp/h","windspeed_800hPa":"mp/h","windspeed_750hPa":"mp/h","windspeed_700hPa":"mp/h","windspeed_650hPa":"mp/h","windspeed_600hPa":"mp/h","windspeed_550hPa":"mp/h","winddirection_850hPa":"°","winddirection_800hPa":"°","winddirection_750hPa":"°","winddirection_700hPa":"°","winddirection_650hPa":"°","winddirection_600hPa":"°","winddirection_550hPa":"°","geopotential_height_850hPa":"m","geopotential_height_800hPa":"m","geopotential_height_750hPa":"m","geopotential_height_700hPa":"m","geopotential_height_650hPa":"m","geopotential_height_600hPa":"m","geopotential_height_550hPa":"m"},"hourly":{"time":["2024-05-05T09:00","2024-05-05T10:00","2024-05-05T11:00","2024-05-05T12:00","2024-05-05T13:00","2024-05-05T14:00","2024-05-05T15:00","2024-05-05T16:00"],"temperature_2m":[49.9,48.4,44.7,40.2,40.8,40.3,40.8,40.9],"wind_speed_10m":[15.7,14.7,15.6,16.5,14.6,13.9,13.8,12.1],"wind_speed_80m":[23.0,22.1,21.8,20.9,20.3,17.7,16.2,14.0],"wind_direction_10m":[281,296,304,312,313,314,313,335],"wind_direction_80m":[283,300,302,305,313,308,301,328],"wind_gusts_10m":[23.5,21.7,22.8,24.2,21.3,19.9,19.9,17.2],"cape":[0.0,0.0,0.0,10.0,40.0,30.0,40.0,40.0],"lifted_index":[2.00,1.60,2.70,4.50,4.00,5.40,4.30,4.10],"pressure_msl":[998.1,999.5,1001.2,1002.8,1004.5,1005.2,1006.5,1007.0],"windspeed_850hPa":[14.7,15.6,17.9,19.2,17.8,16.4,15.8,14.1],"windspeed_800hPa":[22.8,17.1,12.8,26.1,22.6,18.2,18.3,17.0],"windspeed_750hPa":[35.2,21.6,13.6,12.8,15.6,15.8,17.1,16.9],"windspeed_700hPa":[49.7,40.3,36.8,24.7,10.4,4.3,9.1,9.9],"windspeed_650hPa":[55.3,49.3,51.4,39.3,37.3,29.8,16.9,26.6],"windspeed_600hPa":[60.0,60.8,58.7,58.7,55.1,52.5,51.9,52.8],"windspeed_550hPa":[60.6,63.7,64.7,64.1,66.1,66.7,68.2,65.2],"winddirection_850hPa":[268,286,297,314,314,316,316,326],"winddirection_800hPa":[246,267,304,305,313,323,318,329],"winddirection_750hPa":[216,214,236,278,315,328,318,327],"winddirection_700hPa":[206,200,208,203,219,275,306,321],"winddirection_650hPa":[202,201,204,200,198,197,197,211],"winddirection_600hPa":[200,204,203,199,203,206,208,201],"winddirection_550hPa":[200,203,201,201,203,202,201,199],"geopotential_height_850hPa":[1349.00,1356.00,1367.00,1377.00,1386.00,1386.00,1393.00,1395.00],"geopotential_height_800hPa":[1853.00,1857.00,1855.00,1871.00,1880.00,1878.00,1884.00,1884.00],"geopotential_height_750hPa":[2378.00,2378.00,2380.00,2382.00,2387.00,2386.00,2394.00,2396.00],"geopotential_height_700hPa":[2935.00,2933.00,2930.00,2929.00,2930.00,2928.00,2936.00,2937.00],"geopotential_height_650hPa":[3523.00,3518.00,3514.00,3512.00,3511.00,3507.00,3512.00,3513.00],"geopotential_height_600hPa":[4147.00,4140.00,4135.00,4132.00,4130.00,4126.00,4129.00,4130.00],"geopotential_height_550hPa":[4813.00,4805.00,4798.00,4794.00,4793.00,4788.00,4791.00,4791.00]},"daily_units":{"time":"iso8601","sunset":"iso8601","temperature_2m_max":"°F"},"daily":{"time":["2024-05-05"],"sunset":["2024-05-05T20:28"],"temperature_2m_max":[68.0]}}
const gcpWindAloftData = {"forecast_06h":{"end_time":21,"start_time":14,"temperature":{"altitude_06k":null,"altitude_09k":23,"altitude_12k":15,"altitude_18k":-2},"wind_direction":{"altitude_06k":270,"altitude_09k":220,"altitude_12k":190,"altitude_18k":190},"wind_speed":{"altitude_06k":12,"altitude_09k":13,"altitude_12k":52,"altitude_18k":71}},"forecast_12h":{"end_time":6,"start_time":21,"temperature":{"altitude_06k":null,"altitude_09k":17,"altitude_12k":14,"altitude_18k":-9},"wind_direction":{"altitude_06k":null,"altitude_09k":270,"altitude_12k":200,"altitude_18k":190},"wind_speed":{"altitude_06k":0,"altitude_09k":13,"altitude_12k":30,"altitude_18k":55}},"forecast_24h":{"end_time":18,"start_time":6,"temperature":{"altitude_06k":null,"altitude_09k":19,"altitude_12k":8,"altitude_18k":-11},"wind_direction":{"altitude_06k":240,"altitude_09k":260,"altitude_12k":290,"altitude_18k":310},"wind_speed":{"altitude_06k":13,"altitude_09k":24,"altitude_12k":32,"altitude_18k":52}}}

console.log('Run');

// WIND ALOFT WITH OPEN METEO API & GCP FTP
(async () => {
  const openmeteoURL = 'https://api.open-meteo.com/v1/gfs?latitude=40.77069&longitude=-111.96503&daily=sunset,temperature_2m_max&hourly=temperature_2m,wind_speed_10m,wind_speed_80m,wind_direction_10m,wind_direction_80m,wind_gusts_10m,cape,lifted_index,pressure_msl,windspeed_850hPa,windspeed_800hPa,windspeed_750hPa,windspeed_700hPa,windspeed_650hPa,windspeed_600hPa,windspeed_550hPa,winddirection_850hPa,winddirection_800hPa,winddirection_750hPa,winddirection_700hPa,winddirection_650hPa,winddirection_600hPa,winddirection_550hPa,geopotential_height_850hPa,geopotential_height_800hPa,geopotential_height_750hPa,geopotential_height_700hPa,geopotential_height_650hPa,geopotential_height_600hPa,geopotential_height_550hPa&windspeed_unit=mph&temperature_unit=fahrenheit&forecast_hours=8&forecast_days=1&timezone=America%2FDenver'
  const gcpWindAloftURL = 'https://us-west3-wasatchwind.cloudfunctions.net/wind-aloft-forecast'
  // const openmeteoData = await (await fetch(openmeteoURL)).json()
  // const gcpWindAloftData = await (await fetch(gcpWindAloftURL)).json()
  windAloft(openmeteoData.hourly, gcpWindAloftData)
})();

function windAloft(openmeteoData, gcpWindAloftData) {
  openmeteoWindAloft(openmeteoData)
  gcpWindAloft(gcpWindAloftData)
  document.getElementById('ALOFT').style.display = 'block'
}

function openmeteoWindAloft(data) {
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
    if (key.slice(0,9) === 'windspeed') { // Clean up, refactor, figure out max speeds for each alt
      let barb
      for (let i=0; i<6; i++) {
        const windspeed = Math.round(value[i])
        const elementCore = key.slice(10,16)
        const elementNumeric = document.getElementById(`${key}-${i}`)
        const elementBarb = document.getElementById(`winddirection_${elementCore}-${i}`)
        const elementColor = document.getElementById(`${elementCore}-${i}`)
        if (windspeed > 40) barb = 45
        else barb = Math.ceil(windspeed / 5) * 5
        elementNumeric.innerHTML = windspeed
        elementBarb.src = `images/barbs/barb${barb}.png`
        switch(elementCore) {
          case '550hPa':
            elementColor.style.backgroundColor = windAloftColor(windspeed, 30)
            break;
          case '600hPa':
            elementColor.style.backgroundColor = windAloftColor(windspeed, 28)
            break;
          case '650hPa':
            elementColor.style.backgroundColor = windAloftColor(windspeed, 26)
            break;
          case '700hPa':
            elementColor.style.backgroundColor = windAloftColor(windspeed, 24)
            break;
          default:
            elementColor.style.backgroundColor = windAloftColor(windspeed, 22)
            break;
          }
      }
    }
  }
}

function gcpWindAloft(data) {
  const timezoneOffset = now.getTimezoneOffset() / 60
  const breakpoint = 6//data.forecast_06h.end_time - timezoneOffset - now.getHours()
  for (let i=0; i<6; i++) {
    if (i < breakpoint || breakpoint < 0) {
      gcpWindAloftRows(i, data.forecast_06h.wind_speed, data.forecast_06h.wind_direction)
    }
    else gcpWindAloftRows(data.forecast_12h.wind_speed, data.forecast_12h.wind_direction)
  }
}

function gcpWindAloftRows (i, windspeed, winddirection, max) {
  max = 20 // figure out max speeds for individual altitudes
  for (const [key, value] of Object.entries(windspeed)) {
    let barb
    if (value > 40) barb = 45
    else barb = Math.ceil(value / 5) * 5
    document.getElementById(`windspeed_${key}-${i}`).innerHTML = value
    document.getElementById(`winddirection_${key}-${i}`).src = `images/barbs/barb${barb}.png`
    document.getElementById(`${key.slice(-3)}-${i}`).style.backgroundColor = windAloftColor(value, max)
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