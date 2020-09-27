function toggleDiv(element) {
    document.getElementById(element).style.display = (document.getElementById(element).style.display === 'block') ? 'none' : 'block';
}

function headerDateTime() {
    let today = new Date();
    document.getElementById('current-date').innerHTML = today.toLocaleString('en-us', {weekday: 'short', month: 'short', day: 'numeric'});
    document.getElementById('current-time').innerHTML = today.toLocaleTimeString([], {hour: 'numeric', minute: '2-digit'}).toLowerCase();
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
    let ambColor = 'grn';
    ambColor = (Math.max(...ambData.wind_speed_set_1) > 30) ? 'red' : (Math.max(...ambData.wind_speed_set_1) > 20) ? 'ylw' : ambColor;
    document.getElementById('amb-color').style.backgroundImage = 'url(images/top' + ambColor + '.png)';
    drawWindChart("Alta Mt Baldy - 11,066' (3373 m)", ambTime, ambData.wind_speed_set_1, ambData.wind_gust_set_1, ambDir);
    latestReading('amb', ambData.wind_speed_set_1, ambData.wind_gust_set_1);
}

function reyWindChart(reyData) {
    let reyTime = reyData.date_time.slice(-5).map(data => data.toLowerCase().slice(0,-1));;
    let reyWind = reyData.wind_speed_set_1.slice(-5);
    let reyGust = reyData.wind_gust_set_1.slice(-5);
    let reyDir = reyData.wind_direction_set_1.slice(-5);
    let reyColor = 'grn';
    reyColor = (Math.max(...reyWind) > 20) ? 'red' : (Math.max(...reyWind) > 15) ? 'ylw' : reyColor;
    document.getElementById('rey-color').style.backgroundImage = 'url(images/mid' + reyColor + '.png)';
    drawWindChart("Reynolds Peak - 9400' (2865 m)", reyTime, reyWind, reyGust, reyDir);
    latestReading('rey', reyWind, reyGust);
}

function kslcWindChart(kslcData) {
    let kslcTime = kslcData.date_time.slice(-11).map(data => data.toLowerCase().slice(0,-1));
    let kslcWind = kslcData.wind_speed_set_1.slice(-11);
    let kslcGust = '';
    kslcGust = (kslcData.wind_gust_set_1) ? kslcData.wind_gust_set_1.slice(-11) : kslcGust;
    let kslcDir = kslcData.wind_direction_set_1.slice(-11);
    let kslcColor = 'grn';
    kslcColor = (Math.max(...kslcWind) > 20) ? 'red' : (Math.max(...kslcWind) > 9) ? 'ylw' : kslcColor;
    document.getElementById('kslc-color').style.backgroundImage = 'url(images/bot' + kslcColor + '.png)';
    drawWindChart("KSLC - 4,226' (1288 m)", kslcTime, kslcWind, kslcGust, kslcDir);
    latestReading('kslc', kslcWind, kslcGust);
}

function latestReading(stid, wind, gust) {
    gust = (gust[gust.length - 1] > 0) ? Math.round(gust[gust.length - 1]) : '';
    wind = (Math.round(wind[wind.length - 1]) === 0) ? "<p class='txtsz50'>Calm</p>" : Math.round(wind[wind.length - 1]);
    document.getElementById(stid + '-wind').innerHTML = wind;
    document.getElementById(stid + '-gust').innerHTML = gust;
}

function openWeather() { // https://openweathermap.org/api/one-call-api
    let url = 'https://api.openweathermap.org/data/2.5/onecall?lat=40.77&lon=-111.97&exclude=minutely,hourly,daily&units=imperial&appid=b6a86a0bc25e260e4db9c7f98654ad08';
    $.get(url, function(data) {
        document.getElementById('sunset-time').innerHTML = new Date(data.current.sunset * 1000).toLocaleTimeString([], {timeStyle: 'short'}).toLowerCase();
    });
}

headerDateTime();
timeSeries();
openWeather();
