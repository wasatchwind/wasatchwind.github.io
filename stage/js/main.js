'use strict';
// Global variable 'now' & set title date with IIAFE
const now = new Date();
(() => {
    const element = document.getElementById('title-date')
    element.innerHTML = now.toLocaleString('en-us', {weekday: 'short', month: 'short', day: 'numeric'})
})();

// Declare global variable 'currentDiv' and set it to display as the default div
let currentDiv = 'wind'
document.getElementById(currentDiv).style.display = 'block'

function reload() {
    history.scrollRestoration = 'manual'
    location.reload()
};

function toggleDiv(newDiv) {
    document.getElementById(currentDiv).style.display = 'none'
    document.getElementById(`${currentDiv}-title`).className = 'display-3 fw-bold text-warning'
    document.getElementById(`${currentDiv}-border`).className = 'tile-border'
    document.getElementById(`${newDiv}-title`).className = 'display-3 fw-bold'
    document.getElementById(`${newDiv}-border`).className = 'tile-border-selected'
    document.getElementById(newDiv).style.display = 'block'
    currentDiv = newDiv
};
