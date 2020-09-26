let arrow = new Image(30, 30);
arrow.src = './images/arrow.png';


function drawWindChart(chartID, time, wind, gust, dir) {
    // console.log(time);
    // console.log(wind);
    // console.log(gust);
    // console.log(dir);
    let points = wind.map(data => data === 0 ? '' : arrow);
    let max = Math.ceil(Math.max(...wind));
    max = (gust === '') ? max : Math.ceil(Math.max(...gust));
    const windChart = document.getElementById(chartID);
    Chart.defaults.global.defaultFontColor = 'white';
    Chart.defaults.global.defaultFontFamily = 'Tahoma';
    Chart.defaults.global.defaultFontSize = 20;
    new Chart(windChart, {
        type: 'line',
        data: {
            labels: time,
            datasets: [
                {
                    label: 'Speed',
                    yAxisID: 'Speed',
                    lineTension: 0.1,
                    data: wind,
                    borderColor: 'gray',
                    borderWidth: 2,
                    backgroundColor: 'darkblue',
                    fill: true,
                    pointRadius: 2,
                    pointStyle: points,
                    pointRotation: dir
                },
                {
                    label: 'Gust',
                    yAxisID: 'Gust',
                    data: gust,
                    borderColor: 'coral',
                    borderWidth: 8,
                    fill: false,
                    showLine: false,
                    pointRadius: 15,
                    pointStyle: 'line'
                },
            ]
        },
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
            }
        }
    })
}