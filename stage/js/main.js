'use strict';
const now = new Date();
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
