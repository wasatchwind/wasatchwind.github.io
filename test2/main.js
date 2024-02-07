'use strict';
const now = new Date()
const tomorrow = new Date(now.setDate(now.getDate() + 1)).toLocaleString('en-us', {weekday: 'short'})

function reload() {
  history.scrollRestoration = 'manual'
  location.reload()
};

// Set nav item order according to time of day 2pm switchover
let navItems = []
if (now.getHours() >= 7 && now.getHours() < 15) navItems = ['Today', tomorrow, 'Long', 'Cams', 'GPS', 'About', 'Settings', 'Now']
else if (now.getHours() > 20) navItems = [tomorrow, 'Long', 'Cams', 'GPS', 'About', 'Settings', 'Now', 'Today']
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

// Marquee slider (https://keen-slider.io/docs)
const animation = { duration: 1000, easing: (t) => t }
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

function sunset(data) {
    const sunset = new Date(data.sys.sunset*1000).toLocaleTimeString('en-us', {hour: 'numeric', minute: '2-digit'}).slice(0,-3)
    document.getElementById('sunset').innerHTML = sunset
}
