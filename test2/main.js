'use strict';
const now = new Date()
const tomorrow = new Date(now.setDate(now.getDate() + 1)).toLocaleString('en-us', {weekday: 'short'})

function reload() {
  history.scrollRestoration = 'manual'
  location.reload()
}

// Set nav item order according to time of day
let navItems = ['Now', 'Today', tomorrow, 'Long', 'Cams', 'GPS']
if (now.getHours() < 14) {
  navItems.push(navItems[0])
  navItems.shift()
}

// Set nav item labels & active label
let activeNav = 0
document.getElementById(`nav-${activeNav}`).style.color = 'white'
document.getElementById(`${navItems[activeNav]}`).style.display = 'block'
for (let i=0; i<navItems.length; i++) {
  document.getElementById(`nav-${i}`).innerHTML = navItems[i]
}

// Update nav colors and page shown
function navUpdate (navElement, color, pageId, status) {
  document.getElementById(navElement).style.color = color
  if (pageId === tomorrow) pageId = 'Tomorrow'
  document.getElementById(pageId).style.display = status
}

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
})