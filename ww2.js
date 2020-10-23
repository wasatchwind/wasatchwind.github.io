const today = new Date();
const displayDate = today.toLocaleString('en-us', {weekday: 'short', month: 'short', day: 'numeric'});
let toggleStatus = 'current';
let currentSelection = '&nbsp;'

document.getElementById('current-date').innerHTML = displayDate;
document.getElementById('current-time').innerHTML = today.toLocaleTimeString([], {hour: 'numeric', minute: '2-digit'}).toLowerCase();
document.getElementById('toggle-image').src = 'images/toggle-' + toggleStatus + '.png';
document.getElementById('current-option').innerHTML = currentSelection;

window.onclick = function(event) {
    if (!event.target.matches('.menu-button')) {
        let dropdowns = document.getElementsByClassName('start-hidden');
        for (i=0; i<dropdowns.length; i++) {
            dropdowns[i] = (dropdowns[i].classList.contains('show')) ? dropdowns[i].classList.remove('show') : dropdowns[i];
        }
    }
}

function toggleImage() {
    if (currentSelection !== '&nbsp;') {
        document.getElementById(currentSelection + '-' + toggleStatus).style.display = 'none';
    }
    toggleStatus = (toggleStatus === 'current') ? 'forecast' : 'current';
    document.getElementById('toggle-image').src = 'images/toggle-' + toggleStatus + '.png';
    if (currentSelection !== '&nbsp;') {
        document.getElementById(currentSelection + '-' + toggleStatus).style.display = 'block';
    }
}

function openMenu() {
    document.getElementById('menu-button-list').classList.toggle('show');
}

function toggleOption(selected) {
    if (currentSelection !== '&nbsp;') {
        document.getElementById(currentSelection + '-' + toggleStatus).style.display = 'none';
    }
    currentSelection = selected;
    document.getElementById('current-option').innerHTML = currentSelection;
    document.getElementById(currentSelection + '-' + toggleStatus).style.display = 'block';
}

function timeSeries() { // https://developers.synopticdata.com/mesonet
    let url = 'https://api.mesowest.net/v2/station/timeseries?&stid=AMB&stid=KSLC&stid=REY&recent=240&obtimezone=local&timeformat=%-I:%M%20%p&vars=wind_speed,wind_gust,wind_direction,altimeter,air_temp&units=english,speed|mph,temp|F&token=6243aadc536049fc9329c17ff2f88db3';
    $.get(url, function(data) {
        ambWindChart(data.STATION[1].OBSERVATIONS);
        reyWindChart(data.STATION[2].OBSERVATIONS);
        kslcWindChart(data.STATION[0].OBSERVATIONS);
    })
}

function ambWindChart(ambData) {
    let ambTime = ambData.date_time.map(data => data.replace(':00', '').toLowerCase().slice(0,-1));
    let ambDir = ambData.wind_direction_set_1.map(data => Math.round(data));
    drawWindChart("Alta Mt Baldy - 11,066' (3373 m)", ambTime, ambData.wind_speed_set_1, ambData.wind_gust_set_1, ambDir);
    latestReading('amb', ambData.wind_speed_set_1, ambData.wind_gust_set_1);
}

function reyWindChart(reyData) {
    let reyTime = reyData.date_time.slice(-6).map(data => data.toLowerCase().slice(0,-1));;
    let reyWind = reyData.wind_speed_set_1.slice(-6);
    let reyGust = reyData.wind_gust_set_1.slice(-6);
    let reyDir = reyData.wind_direction_set_1.slice(-6);
    drawWindChart("Reynolds Peak - 9400' (2865 m)", reyTime, reyWind, reyGust, reyDir);
    latestReading('rey', reyWind, reyGust);
}

function kslcWindChart(kslcData) {
    let kslcTime = kslcData.date_time.slice(-12).map(data => data.toLowerCase().slice(0,-1));
    let kslcWind = kslcData.wind_speed_set_1.slice(-12);
    let kslcGust = '';
    kslcGust = (kslcData.wind_gust_set_1) ? kslcData.wind_gust_set_1.slice(-12) : kslcGust;
    let kslcDir = kslcData.wind_direction_set_1.slice(-12);
    drawWindChart("KSLC - 4,226' (1288 m)", kslcTime, kslcWind, kslcGust, kslcDir);
    latestReading('kslc', kslcWind, kslcGust);
}

function latestReading(stid, wind, gust) {
    gust = (gust[gust.length - 1] > 0) ? Math.round(gust[gust.length - 1]) : '';
    wind = (Math.round(wind[wind.length - 1]) === 0) ? "<p class='txtsz40'>Calm</p>" : Math.round(wind[wind.length - 1]);
    document.getElementById(stid + '-wind').innerHTML = wind;
    document.getElementById(stid + '-gust').innerHTML = gust;
}

function openWeatherHistoryAPI() { // https://openweathermap.org/api/one-call-api
    let startTime = (today.getTime() / 1000).toFixed(0) - 7200;
    let HistoryURL = 'https://api.openweathermap.org/data/2.5/onecall/timemachine?lat=40.77&lon=-111.97&dt=' + startTime + '&units=imperial&appid=b6a86a0bc25e260e4db9c7f98654ad08';
    $.get(HistoryURL, function(historyData) {
        let timePast = [], altiPast = [], tempPast = [];
        for (i=19; i<24; i++) {
            timePast.push(new Date(historyData.hourly[i].dt * 1000).toLocaleTimeString([], {hour: 'numeric'}).toLowerCase().slice(0,-1));
            altiPast.push((Math.round((historyData.hourly[i].pressure / 33.864) * 100) / 100).toFixed(2));
            tempPast.push(historyData.hourly[i].temp);
        }
        timePast.push(new Date(historyData.current.dt * 1000).toLocaleTimeString([], {hour: 'numeric', minute: 'numeric'}).toLowerCase().slice(0,-1));
        altiPast.push((Math.round((historyData.current.pressure / 33.864) * 100) / 100).toFixed(2));
        tempPast.push(historyData.current.temp);
        drawTempAltiChart ('temp-alti-history', timePast, altiPast, tempPast);
        document.getElementById('apz').innerHTML = calculateAPZ(altiPast[altiPast.length - 1], tempPast[tempPast.length - 1]);
    });
}

function openWeatherForecastAPI() { // https://openweathermap.org/api/one-call-api
    let forecastURL = 'https://api.openweathermap.org/data/2.5/onecall?lat=40.77&lon=-111.97&exclude=minutely,daily&units=imperial&appid=b6a86a0bc25e260e4db9c7f98654ad08';
    $.get(forecastURL, function(forecastData) {
        document.getElementById('sunset-time').innerHTML = new Date(forecastData.current.sunset * 1000).toLocaleTimeString([], {timeStyle: 'short'}).toLowerCase();
        surfaceForecastChart(forecastData);
        let timeFc = [], altiFc = [], tempFc = [];
        timeFc.push(new Date(forecastData.current.dt * 1000).toLocaleTimeString([], {hour: 'numeric', minute: 'numeric'}).toLowerCase().slice(0,-1));
        altiFc.push((Math.round((forecastData.current.pressure / 33.864) * 100) / 100).toFixed(2));
        tempFc.push(forecastData.current.temp);
        for (i=1; i<7; i++) {
            timeFc.push(new Date(forecastData.hourly[i].dt * 1000).toLocaleTimeString([], {hour: 'numeric'}).toLowerCase().slice(0,-1));
            altiFc.push((Math.round((forecastData.hourly[i].pressure / 33.864) * 100) / 100).toFixed(2));
            tempFc.push(forecastData.hourly[i].temp);
        }
        drawTempAltiChart ('temp-alti-forecast', timeFc, altiFc, tempFc);
    });
}

function surfaceForecastChart(surfaceData) {
    let forecastTime = [], forecastWind = [], forecastDir = [], forecastGust = [];
        for (i=0; i<7; i++) {
            forecastTime[i] = new Date(surfaceData.hourly[i].dt * 1000).toLocaleTimeString([], {hour: 'numeric'}).toLowerCase().slice(0,-1);
            forecastWind[i] = surfaceData.hourly[i].wind_speed;
            forecastDir[i] = surfaceData.hourly[i].wind_deg;
        }
    drawWindChart('Salt Lake City', forecastTime, forecastWind, forecastGust, forecastDir);
}

function calculateAPZ(alti, temp) {
    const apzSlope = [0.05, 0.12, 0.19, 0.33, 0.47, 0.54, 0.62];
    const apzIntercept = [29.91, 30.01, 30.11, 30.27, 30.43, 30.53, 30.65];
    let currentZones = [];
    for (i=0; i<7; i++) {
        currentZones[i] = Math.round((apzSlope[i] / -110 * temp + apzIntercept[i]) * 100) / 100;
    }
    currentZones.push(100);
    apz = currentZones.findIndex(n => n >= alti);
    apz = (alti == currentZones[3]) ? 'LoP' : apz;
    return apz;
}

function windAloft() {
    let url = 'https://us-central1-wasatchwind.cloudfunctions.net/wind-aloft-ftp-1';
    $.get(url, function(waloftFcData) {
        let waloftSpd = [waloftFcData.DATA[3].SPD, waloftFcData.DATA[2].SPD, waloftFcData.DATA[1].SPD, waloftFcData.DATA[0].SPD];
        document.getElementById('aloft-start').innerHTML = waloftFcData.HEADER.START_TIME;
        document.getElementById('aloft-end').innerHTML = waloftFcData.HEADER.END_TIME;
        document.getElementById('aloft-day').innerHTML = (today.getHours() > 18) ? '(tomorrow)' : '';
        drawAloftChart (waloftSpd);
    });
}

function graphicalForecast(day) {
    let timeString = (today.getHours() > 19 || today.getHours() < 7) ? 5 : 1;
    day = (today.getHours() > 19) ? ' (tomorrow)' : '';
    document.getElementsByClassName('surface-graphical')[0].innerHTML = 'Surface Graphical' + day;
    document.getElementsByClassName('surface-graphical')[1].innerHTML = 'Surface Graphical' + day;
    for (i=0; i<4; i++) {
        document.getElementById('graphical-wind-' + i).src = 'https://graphical.weather.gov/images/slc/WindSpd' + (timeString + i) + '_slc.png';
        document.getElementById('graphical-weather-' + i).src = 'https://graphical.weather.gov/images/slc/Wx' + (timeString + i) + '_slc.png';
    }
}

function skewT() {
    let dateString = today.toLocaleDateString('en-ZA').replaceAll('/', '');
    let fullURL = 'https://climate.cod.edu/data/raob/KSLC/skewt/KSLC.skewt.' + dateString + '.12.gif';
    fullURL = (today.getHours() < 7) ? 'images/comebacktomorrow.jpg' : fullURL;
    document.getElementById('skewT').src = fullURL;
}

function soarcast() {
    let url = 'https://storage.googleapis.com/wasatch-wind-static/soaring.json';
    $.get(url, function(soarFcData) {
        let rolms = Math.round((parseInt(soarFcData.MAX_RATE_OF_LIFT) / 196.85) * 10) / 10 + ' m/s';
        let neg3m = Math.round(parseInt(soarFcData.NEG_3_INDEX.replace(',', '')) / 3.281) + ' m';
        let tolm = Math.round(parseInt(soarFcData.TOP_OF_LIFT.replace(',', '')) / 3.281) + ' m';
        document.getElementById('report-date').innerHTML = soarFcData.REPORT_DATE;
        document.getElementById('max-rol').innerHTML = parseInt(soarFcData.MAX_RATE_OF_LIFT).toLocaleString();
        document.getElementById('max-rol-ms').innerHTML = rolms;
        document.getElementById('neg3-index').innerHTML = parseInt(soarFcData.NEG_3_INDEX).toLocaleString();
        document.getElementById('neg3-index-m').innerHTML = neg3m;
        document.getElementById('top-of-lift').innerHTML = parseInt(soarFcData.TOP_OF_LIFT).toLocaleString();
        document.getElementById('top-of-lift-m').innerHTML = tolm;
        try {
            document.getElementById('od-time').innerHTML = soarFcData.OD_TIME;
            for (i=0; i<4; i++) {
                document.getElementById('kindex-' + [i]).innerHTML = soarFcData[i].K_NDX;
                document.getElementById('cape-' + [i]).innerHTML = soarFcData[i].CAPE;
                document.getElementById('li-' + [i]).innerHTML = soarFcData[i].LI;
            }
        } catch(err) {
            document.getElementById('summer').style.display = 'none';
        }
    });
}

function noaaScrape() {
    let url = 'https://api.weather.gov/gridpoints/SLC/97,175/forecast';
    $.get(url, function(data) {
        let position = 0;
        position = (data.properties.periods[0].name === 'This Afternoon') ? 2 : 1;
        for (i=0; i<3; i++) {
            document.getElementById('forecast-day' + i +'-day').innerHTML = data.properties.periods[position].name;
            document.getElementById('forecast-day' + i +'-txt').innerHTML = data.properties.periods[position].detailedForecast;
            document.getElementById('forecast-day' + i +'-img').src = data.properties.periods[position].icon;
            position += 2;
        }
    });
}

$('p').on('swipe',function() {
    $(this).hide();
});

timeSeries();
openWeatherHistoryAPI();
openWeatherForecastAPI();
windAloft();
graphicalForecast();
soarcast();
noaaScrape();
skewT();
