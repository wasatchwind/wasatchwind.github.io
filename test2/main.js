'use strict';
const now = new Date()
const tomorrow = new Date(now.setDate(now.getDate() + 1)).toLocaleString('en-us', {weekday: 'short'})
const navItems = ['Now', 'Today', tomorrow, 'Long', 'Cams', 'GPS']

function reload() {
  history.scrollRestoration = 'manual'
  location.reload()
}

// Set nav item labels & active label
let activeNav = 0
document.getElementById(`nav-${activeNav}`).style.color = 'white'
for (let i=0; i<navItems.length; i++) {
  document.getElementById(`nav-${i}`).innerHTML = navItems[i]
}

// Menu navigation carousel/slider (https://keen-slider.io/docs)
const slider = new KeenSlider('#slider', {
  loop: true,
  slides: {
    perView: 3,
  },
  animationEnded: () => {
    document.getElementById(`nav-${activeNav}`).style.color = 'var(--bs-secondary)'
    activeNav = slider.track.details.rel
    document.getElementById(`nav-${activeNav}`).style.color = 'white'
    console.log(navItems[slider.track.details.rel])
  },
})
