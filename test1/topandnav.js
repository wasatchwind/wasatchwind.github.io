'use strict';
const openmeteoData = {"latitude":40.764416,"longitude":-111.98126,"generationtime_ms":0.25391578674316406,"utc_offset_seconds":-21600,"timezone":"America/Denver","timezone_abbreviation":"MDT","elevation":1288.0,"hourly_units":{"time":"iso8601","temperature_2m":"°F","wind_speed_10m":"mp/h","wind_direction_10m":"°","wind_gusts_10m":"mp/h","cape":"J/kg","lifted_index":"","pressure_msl":"hPa","windspeed_850hPa":"mp/h","windspeed_800hPa":"mp/h","windspeed_750hPa":"mp/h","windspeed_700hPa":"mp/h","windspeed_650hPa":"mp/h","windspeed_600hPa":"mp/h","windspeed_550hPa":"mp/h","winddirection_850hPa":"°","winddirection_800hPa":"°","winddirection_750hPa":"°","winddirection_700hPa":"°","winddirection_650hPa":"°","winddirection_600hPa":"°","winddirection_550hPa":"°","geopotential_height_850hPa":"m","geopotential_height_800hPa":"m","geopotential_height_750hPa":"m","geopotential_height_700hPa":"m","geopotential_height_650hPa":"m","geopotential_height_600hPa":"m","geopotential_height_550hPa":"m"},"hourly":{"time":["2024-05-09T12:00","2024-05-09T13:00","2024-05-09T14:00","2024-05-09T15:00","2024-05-09T16:00","2024-05-09T17:00"],"temperature_2m":[57.6,60.6,62.8,61.4,63.0,62.4],"wind_speed_10m":[3.6,6.7,15.5,11.9,18.2,17.1],"wind_direction_10m":[22,84,85,58,96,97],"wind_gusts_10m":[16.6,15.2,25.1,21.9,29.1,23.5],"cape":[300.0,280.0,400.0,360.0,280.0,90.0],"lifted_index":[-2.10,-1.90,-3.30,-3.00,-2.10,-0.80],"pressure_msl":[1019.6,1018.8,1019.2,1019.2,1019.3,1018.4],"windspeed_850hPa":[11.2,15.4,21.9,26.1,21.0,20.8],"windspeed_800hPa":[17.3,20.8,25.1,29.8,24.7,22.9],"windspeed_750hPa":[24.0,23.3,23.3,28.0,23.1,20.8],"windspeed_700hPa":[26.5,23.4,19.4,22.0,17.6,16.4],"windspeed_650hPa":[23.1,20.6,15.7,15.9,11.7,12.8],"windspeed_600hPa":[18.7,16.8,14.0,14.0,7.8,11.2],"windspeed_550hPa":[18.5,17.1,18.0,16.0,12.8,15.1],"winddirection_850hPa":[66,77,73,66,79,97],"winddirection_800hPa":[75,81,75,70,84,97],"winddirection_750hPa":[81,82,74,74,90,98],"winddirection_700hPa":[82,81,69,75,99,99],"winddirection_650hPa":[80,78,60,66,103,98],"winddirection_600hPa":[68,65,46,46,79,90],"winddirection_550hPa":[52,48,40,37,45,92],"geopotential_height_850hPa":[1514.00,1511.00,1516.00,1517.00,1518.00,1512.00],"geopotential_height_800hPa":[2014.00,2013.00,2019.00,2019.00,2021.00,2016.00],"geopotential_height_750hPa":[2537.00,2537.00,2545.00,2544.00,2548.00,2544.00],"geopotential_height_700hPa":[3087.00,3089.00,3098.00,3097.00,3101.00,3098.00],"geopotential_height_650hPa":[3667.00,3671.00,3681.00,3679.00,3684.00,3681.00],"geopotential_height_600hPa":[4283.00,4287.00,4297.00,4296.00,4301.00,4299.00],"geopotential_height_550hPa":[4939.00,4943.00,4954.00,4953.00,4957.00,4957.00]},"daily_units":{"time":"iso8601","sunset":"iso8601","temperature_2m_max":"°F"},"daily":{"time":["2024-05-09"],"sunset":["2024-05-09T20:32"],"temperature_2m_max":[63.0]}}
const now = new Date()

function reload() {
  history.scrollRestoration = 'manual'
  location.reload()
};

// Marquee slider (https://keen-slider.io/docs)
const animation = { duration: 800, easing: (t) => t }
const marquee = new KeenSlider("#marquee", {
  loop: true,
  slides: { perView: 4 },
  created(m) { m.moveToIdx(1, true, animation) },
  updated(m) { m.moveToIdx(m.track.details.abs + 1, true, animation) },
  animationEnded(m) { m.moveToIdx(m.track.details.abs + 1, true, animation) }
});

function openMeteo(data, sunset, tomorrow = new Date(), navItems = []) {
  console.log(data)
  tomorrow = `${new Date(tomorrow.setDate(tomorrow.getDate() + 1)).toLocaleString('en-us', {weekday: 'short'})}+`
  if (!data) navItems = ['Now', 'Today', tomorrow, 'Cams', 'GPS', 'Settings']
  else {
    sunset = new Date(data.daily.sunset)
    document.getElementById('sunset').innerHTML = sunset.toLocaleTimeString('en-us', {hour: 'numeric', minute: '2-digit'}).slice(0,-3)
    if (now.getHours() < 15) {
      navItems = ['Today', tomorrow, 'Cams', 'GPS', 'Settings', 'Now']
      document.getElementById('Today').style.display = 'block'
    }
    else if (now > sunset) navItems = [tomorrow, 'Cams', 'GPS', 'Settings', 'Now', 'Today']
    else navItems = ['Now', 'Today', tomorrow, 'Cams', 'GPS', 'Settings']
  }

  // Set nav item labels & active label
  let activeNav = 0
  let element = navItems[activeNav] === tomorrow ? 'Tomorrow' : navItems[activeNav]
  document.getElementById(`nav-${activeNav}`).style.color = 'white'
  document.getElementById(`${element}`).style.display = 'block'
  for (let i=0; i<navItems.length; i++) document.getElementById(`nav-${i}`).innerHTML = navItems[i]

  // Update nav colors and visible page
  function navUpdate (navElement, color, pageId, status) {
    if (pageId === tomorrow) pageId = 'Tomorrow'
    document.getElementById(pageId).style.display = status
    document.getElementById(navElement).style.color = color
  };

  // Menu navigation carousel/slider (https://keen-slider.io/docs)
  const slider = new KeenSlider('#slider', {
    loop: true,
    slides: { perView: 3 },
    animationEnded: () => {
      navUpdate(`nav-${activeNav}`, 'var(--bs-secondary)', navItems[activeNav], 'none')
      activeNav = slider.track.details.rel
      navUpdate(`nav-${activeNav}`, 'white', navItems[activeNav], 'block')
      console.log(navItems[activeNav])
    }
  });

  const mainBody = new KeenSlider('#main-body', {
    loop: true,
    slides: { perView: 1 },
    animationEnded: () => {
      navUpdate(`nav-${activeNav}`, 'var(--bs-secondary)', navItems[activeNav], 'none')
      activeNav = slider.track.details.rel
      navUpdate(`nav-${activeNav}`, 'white', navItems[activeNav], 'block')
      console.log(navItems[activeNav])
    }
  })
};

openMeteo(openmeteoData)