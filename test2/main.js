'use strict';
const now = new Date()
const tomorrow = new Date(now.setDate(now.getDate() + 1)).toLocaleString('en-us', {weekday: 'short'})
const navItems = ['Now', 'Today', tomorrow, 'Long', 'Cams', 'GPS']
for (let i=0; i<navItems.length; i++) {
  document.getElementById(`nav-${i}`).innerHTML = navItems[i]
}
document.getElementById('content').innerHTML = navItems[0]
document.getElementById('nav-0').style.color = 'yellow'

function reload() {
  history.scrollRestoration = 'manual'
  location.reload()
}

function resetNavColors () {
  for (let i=0; i<navItems.length; i++) {
    document.getElementById(`nav-${i}`).style.color = 'white'
  }
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
    resetNavColors()
    document.getElementById(`nav-${slider.track.details.rel}`).style.color = 'yellow'
  },
  dragSpeed: 0.6,
})