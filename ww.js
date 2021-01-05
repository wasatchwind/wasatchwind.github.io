const now = new Date();
document.getElementById('date').innerHTML = now.toLocaleString('en-us', {weekday: 'short', month: 'short', day: 'numeric'});
document.getElementById('time').innerHTML = now.toLocaleTimeString([], {hour: 'numeric', minute: '2-digit'}).toLowerCase();

function hide_all_divs() {
    document.getElementById('wind').style.display = 'none';
    document.getElementById('lift').style.display = 'none';
    document.getElementById('sky').style.display = 'none';
    document.getElementById('temp-alti').style.display = 'none';
    document.getElementById('synoptic').style.display = 'none';
    document.getElementById('misc').style.display = 'none';
}

function toggle_div(element) {
    let div = document.getElementById(element);
    hide_all_divs();
    if (div.style.display === 'block') {
        div.style.display = 'none';
    } else { div.style.display = 'block'; }
}

function mesonet_latest_data_api() { // https://developers.synopticdata.com/mesonet
    let url = 'https://api.synopticdata.com/v2/stations/latest?&stid=KSLC&obtimezone=local&timeformat=%-I:%M%20%p&vars=wind_speed,wind_gust,wind_cardinal_direction,altimeter,air_temp&units=english,speed|mph,temp|F&token=6243aadc536049fc9329c17ff2f88db3';
    $.get(url, function(data) {
        alti = data.STATION[0].OBSERVATIONS.altimeter_value_1.value.toFixed(2);
        temp = Math.round(data.STATION[0].OBSERVATIONS.air_temp_value_1.value);
        wind = Math.round(data.STATION[0].OBSERVATIONS.wind_speed_value_1.value);
        windTime = data.STATION[0].OBSERVATIONS.wind_speed_value_1.date_time;
        gustTime = data.STATION[0].OBSERVATIONS.wind_gust_value_1.date_time;
        wind = (wind === 0) ? 'Calm' : wind;
        wind = (windTime === gustTime) ? wind + 'g' + Math.round(data.STATION[0].OBSERVATIONS.wind_gust_value_1.value) : wind;
        wind = (wind === 'Calm') ? wind : data.STATION[0].OBSERVATIONS.wind_cardinal_direction_value_1d.value + ' ' + wind;
        
        document.getElementById('kslc-latest-time').innerHTML = 'KSLC ' + windTime.toLowerCase();
        document.getElementById('current-pressure').innerHTML = alti;
        document.getElementById('current-temp').innerHTML = temp;
        document.getElementById('apz').innerHTML = calculate_apz(alti, temp);
        document.getElementById('current-wind').innerHTML = wind;
    });
}

function calculate_apz(alti, temp) {
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

function noaa_three_day_forecast() {
    let url = 'https://api.weather.gov/gridpoints/SLC/97,175/forecast';
    $.get(url, function(data) {
        let position = 0;
        position = (data.properties.periods[0].isDaytime) ? position : 1;
        for (i=1; i<4; i++) {
            document.getElementById('forecast-day' + i +'-day').innerHTML = data.properties.periods[position].name;
            document.getElementById('forecast-day' + i +'-txt').innerHTML = data.properties.periods[position].detailedForecast;
            document.getElementById('forecast-day' + i +'-img').src = data.properties.periods[position].icon;
            position += 2;
        }
    });
}

function graphical_forecast_images() {
    let timeString = (now.getHours() > 19 || now.getHours() < 7) ? 5 : 1;
    let url = 'https://graphical.weather.gov/images/slc/';
    for (i=0; i<4; i++) {
        document.getElementById('graphical-wind-' + i).src = url + 'WindSpd' + (timeString + i) + '_slc.png';
        document.getElementById('graphical-sky-' + i).src = url + 'Sky' + (timeString + i) + '_slc.png';
        document.getElementById('graphical-wx-' + i).src = url + 'Wx' + (timeString + i) + '_slc.png';
    }
}

function latest_morning_skew_t() {
    let dateString = now.toLocaleDateString('en-ZA').replaceAll('/', '');
    let skewTurl = 'https://climate.cod.edu/data/raob/KSLC/skewt/KSLC.skewt.' + dateString + '.12.gif';
    skewTurl = (now.getHours() < 7) ? 'images/unskewt.png' : skewTurl;
    document.getElementById('skew-t').src = skewTurl;
}

function wind_aloft_gcp_function() {
    let url = 'https://us-central1-wasatchwind.cloudfunctions.net/wind-aloft-ftp-122620';
    $.get(url, function(data) {
        // let data = [{"Start":"1 pm"},{"End":"8 pm"},{"Direction":"calm"},{"Direction":320},{"Direction":340},{"Direction":330},{"Speed(mph)":0},{"Speed(mph)":12},{"Speed(mph)":33},{"Speed(mph)":71},{"Temp(F)":18},{"Temp(F)":14},{"Temp(F)":-2}];
        console.log(data);
        document.getElementById('aloft-start').innerHTML = data[0].Start;
        document.getElementById('aloft-end').innerHTML = data[1].End;
        for (i=0; i<4; i++) {
            document.getElementById('dir-' + i).src = 'images/dirs/' + data[i+2].Direction + '.gif';
            document.getElementById('spd-' + i).innerHTML = '<span class="txtsz350 ltblue">' + data[i+6]['Speed(mph)'] + '</span><span class="unbold white"> mph</span>';
            if (data[i+2].Direction === 'calm') { document.getElementById('aloft-' + i).style.display = 'none' }
            document.getElementById('barwidth-' + i).style.width = data[i+6]['Speed(mph)']*0.6 + '%';
        }
    });
}


mesonet_latest_data_api();
noaa_three_day_forecast();
graphical_forecast_images();
latest_morning_skew_t();
wind_aloft_gcp_function();
