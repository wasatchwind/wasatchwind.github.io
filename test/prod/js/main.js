'use strict';
const menuItems = document.querySelectorAll('.carousel .carousel-item')
let slideCount = 3, menuOrder = [], hour = new Date().getHours()
menuOrder = hour > 12 ? ['Tomorrow', 'Now', 'Today'] : ['Now', 'Today', 'Tomorrow']

document.getElementById('menu-left').innerHTML = menuOrder[0]
document.getElementById('menu-center').innerHTML = menuOrder[1]
document.getElementById('menu-right').innerHTML = menuOrder[2]
document.getElementById('show-page').innerHTML = menuOrder[1]

menuItems.forEach((element) => {
  let next = element.nextElementSibling
  for (var i=1; i<slideCount; i++) {
    if (!next) next = menuItems[0]
    let cloneChild = next.cloneNode(true)
    element.appendChild(cloneChild.children[0])
    next = next.nextElementSibling
  }
})

document.getElementById('menu').addEventListener('slide.bs.carousel', function (e) {
  switch(e.to) {
    case 0:
      console.log(menuOrder[1])
      document.getElementById('show-page').innerHTML = menuOrder[1]
      break
    case 1:
      console.log(menuOrder[2])
      document.getElementById('show-page').innerHTML = menuOrder[2]
      break
    case 2:
      console.log(menuOrder[0])
      document.getElementById('show-page').innerHTML = menuOrder[0]
      break
  }
})
