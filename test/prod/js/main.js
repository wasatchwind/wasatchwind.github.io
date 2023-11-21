'use strict';
console.log('test')

// https://spider149.github.io/own-carousel/
document.addEventListener("DOMContentLoaded", () => {
  document.querySelector(".own-carousel__container").ownCarousel({
      itemPerRow:3, 
      itemWidth:30,
      responsive: {
          1000: [4, 24],
          800: [3, 33],
          600: [2, 49],
          400: [1, 100]
      },
  });
  responsive();
});
