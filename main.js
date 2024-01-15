'use strict';
const now = new Date()
const tomorrow = new Date(now.setDate(now.getDate() + 1)).toLocaleString('en-us', {weekday: 'long'})
const navItems = ['Now', 'Today', tomorrow, 'Longterm', 'Cams', 'GPS', 'Settings']
for (let i=0; i<navItems.length; i++) {
  document.getElementById(`nav-${i}`).innerHTML = navItems[i]
}
document.getElementById('content').innerHTML = navItems[0]

function reload() {
  history.scrollRestoration = 'manual'
  location.reload()
}

// Menu navigation carousel/slider (https://keen-slider.io/docs)
const slider = new KeenSlider('#slider', {
  loop: true,
  mode: 'free-snap',
  slides: {
    perView: 3,
  },
  animationEnded: () => {
    console.log(navItems[slider.track.details.rel])
    document.getElementById('content').innerHTML = navItems[slider.track.details.rel]
  },
  dragSpeed: 0.6,
})