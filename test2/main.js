'use strict';

const slider = new KeenSlider('#my-keen-slider', { //https://keen-slider.io/docs
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

const now = new Date()
const tomorrow = new Date(now.setDate(now.getDate() + 1)).toLocaleString('en-us', {weekday: 'long'})
const navItems = ['2:45 pm', 'Today', tomorrow, 'Longterm', 'Cams', 'GPS', 'Settings']
for (let i=0; i<navItems.length; i++) {
  document.getElementById(i).innerHTML = navItems[i]
}
document.getElementById('content').innerHTML = navItems[1]