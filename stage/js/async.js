    // LOCAL TESTING
    const maxTempF = 102
    document.getElementById('max-temp').innerHTML = `${maxTempF}&deg;`
    document.getElementById('latest-icon').src = 'images/sct.png'
    document.getElementById('latest-cam').src = 'images/latest-cam.jpg'
    document.getElementById('latest-zone').innerHTML = '&#9471;'
    document.getElementById('latest-zone').style.color = 'var(--bs-red)'


    // REAL CODE
    timeSeries(timeSeriesData)
