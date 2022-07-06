'use strict';
let currentDiv = 'wind'

// Global variable 'now' & set title date with IIAFE
const now = new Date();
(() => {
    const element = document.getElementById('title-date')
    element.innerHTML = now.toLocaleString('en-us', {weekday: 'short', month: 'short', day: 'numeric'})
})();

function reload() {
    history.scrollRestoration = 'manual'
    location.reload()
};

function hideDiv(div) {
    document.getElementById(`${div}-div`).style.display = 'none'
};

function toggleDiv(newDiv) {
    document.getElementById(currentDiv).style.display = 'none'
    document.getElementById(`${currentDiv}-title`).className = 'display-3 fw-bold text-warning'
    document.getElementById(`${currentDiv}-border`).className = 'tile-border tile-height'
    document.getElementById(`${newDiv}-title`).className = 'display-3 fw-bold'
    document.getElementById(`${newDiv}-border`).className = 'tile-border-selected tile-height'
    document.getElementById(newDiv).style.display = 'block'
    currentDiv = newDiv
};
