let arrow = new Image(40, 40);
arrow.src = './images/arrow.png';

function drawWindChart(chartID, time, wind, gust, dir) {
    Chart.defaults.global.defaultFontColor = 'white';
    Chart.defaults.global.defaultFontFamily = 'Tahoma';
    Chart.defaults.global.defaultFontSize = 32;
    let points = wind.map(data => data === 0 ? '' : arrow);
    let max = Math.ceil(Math.max(...wind));
    max = (Math.max(...gust) > 0) ? Math.ceil(Math.max(...gust)) : max;
    const windChart = document.getElementById(chartID);
    new Chart(windChart, {
        type: 'line',
        data: {
            labels: time,
            datasets: [{
                    label: 'Speed',
                    yAxisID: 'Speed',
                    lineTension: 0.1,
                    data: wind,
                    borderColor: 'gray',
                    borderWidth: 2,
                    backgroundColor: 'royalblue',
                    fill: true,
                    pointRadius: 2,
                    pointStyle: points,
                    pointRotation: dir
                }, {
                    label: 'Gust',
                    yAxisID: 'Gust',
                    data: gust,
                    borderColor: 'coral',
                    borderWidth: 10,
                    fill: false,
                    showLine: false,
                    pointRadius: 16,
                    pointStyle: 'line'
                },
            ]},
        options: {
            animation: {
                duration: 0
            },
            title: {
                text: chartID,
                display: true,
                fontColor: 'yellow'
            },
            legend: {
                display: false
            },
            scales: {
                yAxes: [{
                    id: 'Speed',
                    ticks: {
                        stepSize: 10,
                        min: 0,
                        max: max
                    }
                }, {
                    id: 'Gust',
                    ticks: {
                        display: false,
                        stepSize: 10,
                        min: 0,
                        max: max
                    }
                }],
                xAxes: [{
                    ticks: {
                        maxTicksLimit: 6,
                        maxRotation: 0
                    }
                }]
            },
            plugins: {
                datalabels: {
                    display: false
                }
            }
        }
    })
}

function drawTempAltiChart (chartID, time, alti, temp) {
    // console.log(time);
    // console.log(alti);
    // console.log(temp);
    const altiMin = Math.min(...alti);
    const altiMax = Math.max(...alti);
    const tempMin = Math.floor(Math.min(...temp));
    const tempMax = Math.ceil(Math.max(...temp));
    const tempAltiChart = document.getElementById(chartID);
    new Chart(tempAltiChart, {
        type: 'line',
        data: {
            labels: time,
            datasets: [{
                    label: 'Pressure',
                    yAxisID: 'Pressure',
                    lineTension: 0.1,
                    data: alti,
                    borderColor: 'royalblue',
                    borderWidth: 10,
                    fill: false,
                    showLine: false,
                    pointRadius: 16,
                    pointStyle: 'line'
                }, {
                    label: 'Temp',
                    yAxisID: 'Temp',
                    data: temp,
                    borderColor: 'coral',
                    borderWidth: 10,
                    type: 'line'
                },
            ]},
        options: {
            animation: {
                duration: 0
            },
            title: {
                text: chartID,
                display: true,
                fontColor: 'yellow'
            },
            legend: {
                display: false
            },
            scales: {
                yAxes: [{
                    id: 'Pressure',
                    position: 'right',
                    ticks: {
                        //stepSize: 0.01,
                        min: altiMin,
                        max: altiMax
                    }
                }, {
                    id: 'Temp',
                    ticks: {
                        display: true,
                        //stepSize: 10,
                        min: tempMin,
                        max: tempMax
                    }
                }],
                xAxes: [{
                    ticks: {
                        maxTicksLimit: 6,
                        maxRotation: 0
                    }
                }]
            },
            plugins: {
                datalabels: {
                    display: false
                }
            }
        }
    })
}

function drawAloftChart (windSpeed) {
    const aloftChart = document.getElementById('wind-aloft');
    new Chart(aloftChart, {
        type: 'horizontalBar',
        data: {
            labels: ['18k', '12k', '9k', '6k'],
            datasets: [
                {
                    data: windSpeed,
                    borderColor: 'gray',
                    borderWidth: 2,
                    barThickness: 80,
                    backgroundColor: 'royalblue',
                    fill: true
                },
            ]
        },
        options: {
            animation: {
                duration: 0
            },
            title: {
                display: false
            },
            legend: {
                display: false
            },
            scales: {
                xAxes: [{
                    ticks: {
                        display: false,
                        max: 120
                    }
                }],
                yAxes: [{
                    gridLines: {
                        color: 'gray',
                        borderDash: [5, 10],
                        lineWidth: 2
                    },
                    ticks: {
                        fontStyle: 'bold'
                    }
                }]
            },
            plugins: {
                datalabels: {
                    anchor: 'end',
                    align: 'right',
                    color: 'yellow',
                    offset: 20,
                    font: {
                        size: 60,
                        weight: 'bold'
                    },
                    formatter: function(value) {
                        value = (value > 0) ? value : 'Calm';
                        return value;
                    }
                }
            }
        }
    })
}