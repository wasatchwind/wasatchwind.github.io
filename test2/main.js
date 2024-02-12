// 'use strict';
// const now = new Date()
// const tomorrow = new Date(now.setDate(now.getDate() + 1)).toLocaleString('en-us', {weekday: 'short'})

// function reload() {
//   history.scrollRestoration = 'manual'
//   location.reload()
// };

// // Set nav item order according to time of day 2pm switchover
// let navItems = []
// if (now.getHours() < 15) navItems = ['Today', tomorrow, 'Long', 'Cams', 'GPS', 'About', 'Settings', 'Now']
// else if (now.getHours() > 20) navItems = [tomorrow, 'Long', 'Cams', 'GPS', 'About', 'Settings', 'Now', 'Today']
// else navItems = ['Now', 'Today', tomorrow, 'Long', 'Cams', 'GPS', 'About', 'Settings']

// // Set nav item labels & active label
// let activeNav = 0
// let element = navItems[activeNav] === tomorrow ? 'Tomorrow' : navItems[activeNav]
// document.getElementById(`${element}`).style.display = 'block'
// document.getElementById(`nav-${activeNav}`).style.color = 'white'
// for (let i=0; i<navItems.length; i++) {
//   document.getElementById(`nav-${i}`).innerHTML = navItems[i]
// };

// // Update nav colors and visible page
// function navUpdate (navElement, color, pageId, status) {
//   document.getElementById(navElement).style.color = color
//   if (pageId === tomorrow) pageId = 'Tomorrow'
//   document.getElementById(pageId).style.display = status
// };

// // Menu navigation carousel/slider (https://keen-slider.io/docs)
// const slider = new KeenSlider('#slider', {
//   loop: true,
//   slides: {
//     perView: 3,
//   },
//   animationEnded: () => {
//     navUpdate(`nav-${activeNav}`, 'var(--bs-secondary)', navItems[activeNav], 'none')
//     activeNav = slider.track.details.rel
//     navUpdate(`nav-${activeNav}`, 'white', navItems[activeNav], 'block')
//   },
// });

// // Marquee slider (https://keen-slider.io/docs)
// const animation = { duration: 1000, easing: (t) => t }
// const marquee = new KeenSlider("#marquee", {
//   loop: true,
//   slides: {
//     perView: 4,
//   },
//   created(m) {
//     m.moveToIdx(1, true, animation)
//   },
//   updated(m) {
//     m.moveToIdx(m.track.details.abs + 1, true, animation)
//   },
//   animationEnded(m) {
//     m.moveToIdx(m.track.details.abs + 1, true, animation)
//   },
// });

// // Reveal/collapse toggle for wind charts
// function toggleWindChart(div) {
//   const element = document.getElementById(div)
//   if (element.style.display==='' || element.style.display==='none') {
//     element.style.display = 'block'
//     document.getElementById(`${div}-toggle`).innerHTML = '&#8722;'
//   }
//   else {
//     element.style.display = 'none'
//     document.getElementById(`${div}-toggle`).innerHTML = '&#43;'
//   }
// };

// function sunset(data) {
//   const sunset = new Date(data.sys.sunset*1000).toLocaleTimeString('en-us', {hour: 'numeric', minute: '2-digit'}).slice(0,-3)
//   console.log('sun', data.sys.sunset*1000)
//   console.log('now', now.getTime())
//   document.getElementById('sunset').innerHTML = sunset
// };


//WITH SUNSET:
'use strict';
const now = new Date()
const tomorrow = new Date(now.setDate(now.getDate() + 1)).toLocaleString('en-us', {weekday: 'short'})

function reload() {
  history.scrollRestoration = 'manual'
  location.reload()
};

// Marquee slider (https://keen-slider.io/docs)
const animation = { duration: 700, easing: (t) => t }
const marquee = new KeenSlider("#marquee", {
  loop: true,
  slides: {
    perView: 4,
  },
  created(m) {
    m.moveToIdx(1, true, animation)
  },
  updated(m) {
    m.moveToIdx(m.track.details.abs + 1, true, animation)
  },
  animationEnded(m) {
    m.moveToIdx(m.track.details.abs + 1, true, animation)
  },
});

// Reveal/collapse toggle for wind charts
function toggleWindChart(div) {
  const element = document.getElementById(div)
  if (element.style.display==='' || element.style.display==='none') {
    element.style.display = 'block'
    document.getElementById(`${div}-toggle`).innerHTML = '&#8722;'
  }
  else {
    element.style.display = 'none'
    document.getElementById(`${div}-toggle`).innerHTML = '&#43;'
  }
};

function sunset(data, navItems = []) {
  // Set nav item order according to time of day
  const sunset = new Date(data.sys.sunset*1000).toLocaleTimeString('en-us', {hour: 'numeric', minute: '2-digit'})
  document.getElementById('sunset').innerHTML = sunset.slice(0,-3)
  if (now.getHours() < 15) navItems = ['Today', tomorrow, 'Long', 'Cams', 'GPS', 'About', 'Settings', 'Now']
  else if (now.toLocaleTimeString() > sunset) navItems = [tomorrow, 'Long', 'Cams', 'GPS', 'About', 'Settings', 'Now', 'Today']
  else navItems = ['Now', 'Today', tomorrow, 'Long', 'Cams', 'GPS', 'About', 'Settings']

  // Set nav item labels & active label
  let activeNav = 0
  let element = navItems[activeNav] === tomorrow ? 'Tomorrow' : navItems[activeNav]
  document.getElementById(`${element}`).style.display = 'block'
  document.getElementById(`nav-${activeNav}`).style.color = 'white'
  for (let i=0; i<navItems.length; i++) {
    document.getElementById(`nav-${i}`).innerHTML = navItems[i]
  };

  // Update nav colors and visible page
  function navUpdate (navElement, color, pageId, status) {
    document.getElementById(navElement).style.color = color
    if (pageId === tomorrow) pageId = 'Tomorrow'
    document.getElementById(pageId).style.display = status
  };

  // Menu navigation carousel/slider (https://keen-slider.io/docs)
  const slider = new KeenSlider('#slider', {
    loop: true,
    slides: {
      perView: 3,
    },
    animationEnded: () => {
      navUpdate(`nav-${activeNav}`, 'var(--bs-secondary)', navItems[activeNav], 'none')
      activeNav = slider.track.details.rel
      navUpdate(`nav-${activeNav}`, 'white', navItems[activeNav], 'block')
    },
  });
};

function windMap(data) {
  const timestamp = new Date(data.timeCreated).toLocaleString('en-US', {hour: 'numeric', minute: '2-digit'}).toLowerCase();
  document.getElementById('wind-map-timestamp').innerHTML = `Wind Map @ ${timestamp}`
}

//GCP
// function windAloftTime(start, end) {
//     const selector = (now.getHours() > 3 && now.getHours() < 13) ? '12' : (now.getHours() > 18 || now.getHours() < 4) ? '24' : '06'
//     // const link = `https://www.aviationweather.gov/windtemp/data?level=low&fcst=${selector}&region=slc&layout=on&date=`
//     const link = `https://www.aviationweather.gov/data/windtemp/?region=slc&fcst=${selector}`
//     const range = `${start} &nbsp;&#187;&nbsp; ${end}${nextDay}`
//     document.getElementById('wind-aloft-link').setAttribute('href', link)
//     document.getElementById('aloft-range').innerHTML = range
// };

// function windAloftDir(dirs) {
//     for (const key in dirs) {
//         const element = document.getElementById(`dir-${key}`)
//         if (dirs[key] === 'calm') element.className = 'align-self-center display-5'
//         element.innerHTML = dirs[key] === 'calm' ? 'Calm' : '&#10148;'
//         element.style.transform = `rotate(${dirs[key] + 90}deg)`
//     }
// };

// function windAloftSpeed(spds, colors = {}) {
//     colors.ylw = {'6k':9, '9k':12, '12k':15, '18k':21}
//     colors.red = {'6k':14, '9k':18, '12k':24, '18k':30}
//     const max = Math.max(...Object.values(spds))
//     const mulitplier = max > 99 ? 1.2 : max > 55 ? 1.5 : 3
//     for (const key in spds) {
//         const elementSpd = document.getElementById(`spd-${key}`)
//         const elementBar = document.getElementById(`aloft-${key}`)
//         if (spds[key] === 0) {
//             document.getElementById(`mph-${key}`).style.display = 'none'
//             elementSpd.style.display = 'none'
//             elementBar.style.display = 'none'
//         }
//         elementSpd.innerHTML = spds[key]
//         elementBar.style.width = `${spds[key] * mulitplier}%`
//         if (spds[key] > colors.ylw[key] && spds[key] < colors.red[key]) elementBar.style.backgroundColor =  'var(--bs-yellow)'
//         else elementBar.style.backgroundColor = spds[key] >= colors.red[key] ? 'var(--bs-red)' : 'var(--bs-teal)'
//     }
// };
