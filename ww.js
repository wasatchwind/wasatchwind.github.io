const now = new Date();

async function noaa_time_series_api_async() { //https://developers.synopticdata.com/mesonet
    const stations = ['KSLC', 'AMB'];
    const historyMinutes = 420;
    const dataPoints = 'air_temp,altimeter,wind_cardinal_direction,wind_direction,wind_gust,wind_speed';
    const noaaTimeSeriesUrl = 'https://api.mesowest.net/v2/station/timeseries?&stid=' + stations[0] + '&stid=' + stations[1] + '&recent=' + historyMinutes + '&obtimezone=local&timeformat=%-I:%M%20%p&vars=' + dataPoints + '&units=english,speed|mph,temp|F&token=6243aadc536049fc9329c17ff2f88db3';
    const response = await fetch(noaaTimeSeriesUrl);
    const data = await response.json();
    get_and_display_kslc_latest_stats(data.STATION[0].OBSERVATIONS);
    build_wind_history_chart('kslc', data.STATION[0].OBSERVATIONS, 11);
    build_wind_history_chart('amb', data.STATION[1].OBSERVATIONS, 6);
    build_tempalti_history_chart(data.STATION[0].OBSERVATIONS);
}

async function noaa_three_day_forecast_api_async() {
    const noaaPublicForecastUrl = 'https://api.weather.gov/gridpoints/SLC/97,175/forecast';
    const response = await fetch(noaaPublicForecastUrl);
    const data = await response.json();
    let position = 0;
    position = (data.properties.periods[0].isDaytime) ? position : 1;
    const maxTemp = data.properties.periods[position].temperature;
    if (data.properties.periods[0].isDaytime) { raob_data_gcp_storage_async(maxTemp); }
    else { document.getElementById('skewt').innerHTML = 'Updated after next morning sounding!'; }
    for (i=1; i<4; i++) {
        document.getElementById('forecast-day' + i +'-day').innerHTML = data.properties.periods[position].name;
        document.getElementById('forecast-day' + i +'-txt').innerHTML = data.properties.periods[position].detailedForecast;
        document.getElementById('forecast-day' + i +'-img').src = data.properties.periods[position].icon;
        position += 2;
    }
}

async function raob_data_gcp_storage_async(maxTemp) {
    // const gcpRaobDataUrl = 'https://storage.googleapis.com/wasatch-wind-static/raob.json';
    // const response = await fetch(gcpRaobDataUrl);
    // const data = await response.json();
    const data = [{"Pressure_mb": 866.0, "Altitude_m": 1289, "Temp_c": -0.9, "Dewpoint_c": -1.0, "Wind_Direction": 320, "Wind_Speed_kt": 4}, {"Pressure_mb": 850.0, "Altitude_m": 1440, "Temp_c": -2.3, "Dewpoint_c": -4.8, "Wind_Direction": 300, "Wind_Speed_kt": 10}, {"Pressure_mb": 818.0, "Altitude_m": 1744, "Temp_c": -4.1, "Dewpoint_c": -5.1, "Wind_Direction": 339, "Wind_Speed_kt": 5}, {"Pressure_mb": 809.2, "Altitude_m": 1829, "Temp_c": -4.4, "Dewpoint_c": -5.4, "Wind_Direction": 350, "Wind_Speed_kt": 3}, {"Pressure_mb": 778.3, "Altitude_m": 2134, "Temp_c": -5.5, "Dewpoint_c": -6.5, "Wind_Direction": 280, "Wind_Speed_kt": 5}, {"Pressure_mb": 748.7, "Altitude_m": 2438, "Temp_c": -6.7, "Dewpoint_c": -7.7, "Wind_Direction": 190, "Wind_Speed_kt": 7}, {"Pressure_mb": 728.0, "Altitude_m": 2658, "Temp_c": -7.5, "Dewpoint_c": -8.5, "Wind_Direction": 212, "Wind_Speed_kt": 11}, {"Pressure_mb": 720.0, "Altitude_m": 2743, "Temp_c": -8.2, "Dewpoint_c": -9.4, "Wind_Direction": 220, "Wind_Speed_kt": 13}, {"Pressure_mb": 700.0, "Altitude_m": 2962, "Temp_c": -9.9, "Dewpoint_c": -11.6, "Wind_Direction": 235, "Wind_Speed_kt": 14}, {"Pressure_mb": 649.0, "Altitude_m": 3542, "Temp_c": -13.9, "Dewpoint_c": -15.6, "Wind_Direction": 239, "Wind_Speed_kt": 13}, {"Pressure_mb": 639.1, "Altitude_m": 3658, "Temp_c": -14.4, "Dewpoint_c": -16.0, "Wind_Direction": 240, "Wind_Speed_kt": 13}, {"Pressure_mb": 631.0, "Altitude_m": 3755, "Temp_c": -14.9, "Dewpoint_c": -16.4, "Wind_Direction": 238, "Wind_Speed_kt": 13}, {"Pressure_mb": 625.0, "Altitude_m": 3828, "Temp_c": -14.7, "Dewpoint_c": -17.2, "Wind_Direction": 236, "Wind_Speed_kt": 14}, {"Pressure_mb": 589.6, "Altitude_m": 4267, "Temp_c": -17.6, "Dewpoint_c": -20.1, "Wind_Direction": 225, "Wind_Speed_kt": 15}, {"Pressure_mb": 582.0, "Altitude_m": 4364, "Temp_c": -18.3, "Dewpoint_c": -20.7, "Wind_Direction": 223, "Wind_Speed_kt": 15}, {"Pressure_mb": 573.0, "Altitude_m": 4481, "Temp_c": -19.1, "Dewpoint_c": -23.1, "Wind_Direction": 220, "Wind_Speed_kt": 14}, {"Pressure_mb": 543.1, "Altitude_m": 4877, "Temp_c": -22.3, "Dewpoint_c": -25.6, "Wind_Direction": 210, "Wind_Speed_kt": 13}, {"Pressure_mb": 543.0, "Altitude_m": 4879, "Temp_c": -22.3, "Dewpoint_c": -25.6, "Wind_Direction": 210, "Wind_Speed_kt": 13}, {"Pressure_mb": 515.0, "Altitude_m": 5266, "Temp_c": -25.3, "Dewpoint_c": -31.3, "Wind_Direction": 220, "Wind_Speed_kt": 9}, {"Pressure_mb": 500.0, "Altitude_m": 5480, "Temp_c": -26.9, "Dewpoint_c": -32.9, "Wind_Direction": 225, "Wind_Speed_kt": 6}, {"Pressure_mb": 486.0, "Altitude_m": 5683, "Temp_c": -28.7, "Dewpoint_c": -34.7, "Wind_Direction": 218, "Wind_Speed_kt": 7}, {"Pressure_mb": 470.0, "Altitude_m": 5921, "Temp_c": -30.7, "Dewpoint_c": -39.7, "Wind_Direction": 211, "Wind_Speed_kt": 8}, {"Pressure_mb": 458.4, "Altitude_m": 6096, "Temp_c": -32.1, "Dewpoint_c": -40.3, "Wind_Direction": 205, "Wind_Speed_kt": 9}, {"Pressure_mb": 431.0, "Altitude_m": 6528, "Temp_c": -35.7, "Dewpoint_c": -41.7, "Wind_Direction": 212, "Wind_Speed_kt": 7}, {"Pressure_mb": 401.0, "Altitude_m": 7023, "Temp_c": -40.3, "Dewpoint_c": -47.3, "Wind_Direction": 220, "Wind_Speed_kt": 5}, {"Pressure_mb": 400.0, "Altitude_m": 7040, "Temp_c": -40.5, "Dewpoint_c": -47.5, "Wind_Direction": 220, "Wind_Speed_kt": 5}, {"Pressure_mb": 384.0, "Altitude_m": 7315, "Temp_c": -43.0, "Dewpoint_c": -48.6, "Wind_Direction": 215, "Wind_Speed_kt": 3}, {"Pressure_mb": 372.0, "Altitude_m": 7530, "Temp_c": -44.9, "Dewpoint_c": -49.4, "Wind_Direction": 236, "Wind_Speed_kt": 4}, {"Pressure_mb": 367.0, "Altitude_m": 7620, "Temp_c": -44.1, "Dewpoint_c": -52.3, "Wind_Direction": 245, "Wind_Speed_kt": 5}, {"Pressure_mb": 366.0, "Altitude_m": 7639, "Temp_c": -43.9, "Dewpoint_c": -52.9, "Wind_Direction": 245, "Wind_Speed_kt": 5}, {"Pressure_mb": 358.0, "Altitude_m": 7787, "Temp_c": -44.9, "Dewpoint_c": -59.9, "Wind_Direction": 246, "Wind_Speed_kt": 7}, {"Pressure_mb": 349.0, "Altitude_m": 7957, "Temp_c": -45.5, "Dewpoint_c": -64.5, "Wind_Direction": 248, "Wind_Speed_kt": 8}, {"Pressure_mb": 337.0, "Altitude_m": 8190, "Temp_c": -45.7, "Dewpoint_c": -68.7, "Wind_Direction": 250, "Wind_Speed_kt": 11}, {"Pressure_mb": 335.0, "Altitude_m": 8230, "Temp_c": -46.0, "Dewpoint_c": -69.0, "Wind_Direction": 250, "Wind_Speed_kt": 11}, {"Pressure_mb": 328.0, "Altitude_m": 8370, "Temp_c": -47.1, "Dewpoint_c": -70.1, "Wind_Direction": 253, "Wind_Speed_kt": 11}, {"Pressure_mb": 316.0, "Altitude_m": 8617, "Temp_c": -46.7, "Dewpoint_c": -69.7, "Wind_Direction": 260, "Wind_Speed_kt": 12}, {"Pressure_mb": 305.6, "Altitude_m": 8839, "Temp_c": -47.9, "Dewpoint_c": -70.9, "Wind_Direction": 265, "Wind_Speed_kt": 13}, {"Pressure_mb": 304.0, "Altitude_m": 8873, "Temp_c": -48.1, "Dewpoint_c": -71.1, "Wind_Direction": 264, "Wind_Speed_kt": 13}];
    const dalr = 5.38;
    draw_lapse_chart(data, maxTemp, dalr);
    document.getElementById('max-forecast-temp').innerHTML = maxTemp + ' \u00B0F';
    document.getElementById('thermal-max-height-forecast').innerHTML = calculate_max_height_of_thermal(data, maxTemp, dalr) + ' ft MSL';
}

async function wind_aloft_gcp_function_async() {
    // const gcpWindAloftFuncUrl = 'https://us-central1-wasatchwind.cloudfunctions.net/wind-aloft-ftp-122620';
    // const response = await fetch(gcpWindAloftFuncUrl);
    // const data = await response.json();
    let data = [{"Start":"1 pm"},{"End":"8 pm"},{"Direction":"calm"},{"Direction":240},{"Direction":250},{"Direction":330},{"Speed(mph)":0},{"Speed(mph)":9},{"Speed(mph)":9},{"Speed(mph)":6},{"Temp(F)":16},{"Temp(F)":5},{"Temp(F)":-18}];
    set_wind_aloft_link();
    const ylwSpeeds = [9, 12, 15, 21];
    const redSpeeds = [12, 18, 24, 36];
    let color = 'grn';
    document.getElementById('aloft-start').innerHTML = data[0].Start;
    document.getElementById('aloft-end').innerHTML = data[1].End;
    for (i=0; i<4; i++) {
        document.getElementById('dir-' + i).src = 'images/dirs/' + data[i+2].Direction + '.gif';
        if (data[i+2].Direction === 'calm') { document.getElementById('aloft-' + i).style.display = 'none' }
        document.getElementById('spd-' + i).innerHTML = '<span class="txtsz350 ltblue">' + data[i+6]['Speed(mph)'] + '</span><span class="unbold white"> mph</span>';
        color = (data[i+6]['Speed(mph)'] > redSpeeds[i]) ? 'red' : (data[i+6]['Speed(mph)'] > ylwSpeeds[i]) ? 'ylw' : color;
        document.getElementById('barwidth-' + i).src = 'images/midbar' + color + '.png';
        document.getElementById('barwidth-' + i).style.width = data[i+6]['Speed(mph)']*0.6 + '%';
    }
}

(function () {
    document.getElementById('date').innerHTML = now.toLocaleString('en-us', {weekday: 'short', month: 'short', day: 'numeric'});
})();

function reset_all_main_divs() {
    const divNames = ['wind', 'lift', 'sky', 'temp&pressure', 'general', 'misc'];
    for (i=0; i<divNames.length; i++) {
        document.getElementById(divNames[i]).style.display = 'none';
        document.getElementById(divNames[i] + '-btn').style.backgroundColor = 'rgb(100, 100, 100)';
    }
}

function toggle_div(element) {
    reset_all_main_divs();
    let div = document.getElementById(element);
    if (div.style.display === 'block') { div.style.display = 'none'; }
    else {
        div.style.display = 'block';
        document.getElementById(element + '-btn').style.backgroundColor = 'darkgreen';
    }
}

function build_wind_history_chart(stationName, data, historyLength) {
    const time = data.date_time.slice(-historyLength).map(d => d.slice(0,-3));
    const wind = data.wind_speed_set_1.slice(-historyLength).map(d => Math.round(d) === 0 ? '' : Math.round(d));
    const dir = data.wind_direction_set_1.slice(-historyLength).map(d => d);
    let gust = [];
    try { gust = data.wind_gust_set_1.slice(-historyLength).map(d => Math.round(d) > 0 ? Math.round(d) : '-'); }
    catch { for (i=0; i<historyLength; i++) { gust[i] = '-'; } }
    for (i=0; i<historyLength; i++) {
        document.getElementById(stationName + '-time-' + i).innerHTML = time[i];
        document.getElementById(stationName + '-wind-num-' + i).innerHTML = wind[i];
        document.getElementById(stationName + '-wind-bar-' + i).style.height = wind[i]*4 + 'px';
        document.getElementById(stationName + '-dir-' + i).src = wind[i] > 0 ? 'images/arrow.png' : 'images/calm.png';
        document.getElementById(stationName + '-dir-' + i).style.transform = wind[i] > 0 ? 'rotate(' + dir[i] + 'deg)' : '';
        document.getElementById(stationName + '-gust-' + i).innerHTML = gust[i];
    }
}

function get_and_display_kslc_latest_stats(data, gust) {
    const alti = data.altimeter_set_1[data.date_time.length-1].toFixed(2);
    const temp = Math.round(data.air_temp_set_1[data.date_time.length-1]);
    let wind = Math.round(data.wind_speed_set_1[data.date_time.length-1]);
    wind = (wind === 0) ? 'Calm' : wind;
    wind = (wind === 'Calm') ? wind : data.wind_cardinal_direction_set_1d[data.date_time.length-1] + ' ' + wind;
    try { gust = (Math.round(data.wind_gust_set_1[data.date_time.length-1]) > 0) ? 'g' + Math.round(data.wind_gust_set_1[data.date_time.length-1]) : ''; }
    catch { gust = ''; }
    document.getElementById('latest-time').innerHTML = data.date_time[data.date_time.length-1].toLowerCase() + ' @ KSLC';
    document.getElementById('latest-pressure').innerHTML = alti;
    document.getElementById('latest-temp').innerHTML = temp;
    document.getElementById('apz').innerHTML = calculate_apz(alti, temp);
    document.getElementById('latest-wind').innerHTML = wind + gust;
}

function calculate_apz(alti, temp) {
    const apzSlope = [0.05, 0.12, 0.19, 0.33, 0.47, 0.54, 0.62];
    const apzIntercept = [29.91, 30.01, 30.11, 30.27, 30.43, 30.53, 30.65];
    let currentZones = [], apz;
    for (i=0; i<7; i++) { currentZones[i] = Math.round((apzSlope[i] / -110 * temp + apzIntercept[i]) * 100) / 100; }
    currentZones.push(100);
    apz = currentZones.findIndex(n => n >= alti);
    apz = (alti == currentZones[3]) ? 'LoP' : apz;
    return apz;
}

function calculate_max_height_of_thermal (raobData, maxTemp, dalr) {
    let maxPosition = 0;
    // Determine the position of the sounding data where it crosses the DALR to obtain interpolation points
    while ((maxTemp-(((raobData[maxPosition].Altitude_m-raobData[0].Altitude_m)*3.281/1000)*5.38)) > ((raobData[maxPosition].Temp_c*9/5)+32)) { maxPosition++; }
    const yIntercept = (maxTemp/dalr)+4.229;
    const dalrSlope = -1/dalr;
    const x1 = ((raobData[maxPosition].Temp_c*9/5)+32);
    const y1 = raobData[maxPosition].Altitude_m*3.281/1000;
    const x2 = ((raobData[maxPosition-1].Temp_c*9/5)+32);
    const y2 = raobData[maxPosition-1].Altitude_m*3.281/1000;
    return Math.round((dalrSlope*((((x2-x1)/(y2-y1)*(y1-yIntercept))-x1)/((((x2-x1)/(y2-y1))*dalrSlope)-1))+yIntercept)*1000);
}

function set_wind_aloft_link() {
    let range = '06';
    range = (now.getHours() > 3 && now.getHours() < 13) ? '12' : (now.getHours() > 18 || now.getHours() < 4) ? '24' : range;
    let linkURL = 'https://www.aviationweather.gov/windtemp/data?level=low&fcst=' + range + '&region=slc&layout=on&date=';
    document.getElementById('wind-aloft-link').setAttribute('href', linkURL);
}

function build_tempalti_history_chart(data) {
    let time = [], alti = [], temp = [], apz = [], max, min;
    for (i=0; i<data.date_time.length; i++) {
        if (data.date_time[i].slice(-5,-3) === '00') {
            time.push(data.date_time[i].slice(0,-3));
            alti.push(data.altimeter_set_1[i].toFixed(2));
            temp.push(Math.round(data.air_temp_set_1[i]));
        } 
    }
    time = time.slice(-6);
    alti = alti.slice(-6);
    temp = temp.slice(-6);
    max = Math.max(...alti);
    min = Math.min(...alti);
    for (let i=0; i<time.length; i++) {
        document.getElementById('kslc-time-tempalti-' + i).innerHTML = time[i];
        document.getElementById('kslc-alti-num-' + i).innerHTML = alti[i];
        document.getElementById('kslc-alti-bar-' + i).style.height = (((alti[i]-min)*75)/(max-min))+5 + 'px';
        document.getElementById('kslc-temp-' + i).innerHTML = temp[i];
        document.getElementById('kslc-apz-' + i).src = 'images/apz' + calculate_apz(alti[i], temp[i]) + '.png';
        document.getElementById('kslc-apz-' + i).style.width = '60px';
    }
}

function get_all_graphical_forecast_images() {
    let timeString = (now.getHours() > 18 || now.getHours() < 7) ? 5 : 1;
    let url = 'https://graphical.weather.gov/images/slc/';
    for (i=0; i<4; i++) {
        document.getElementById('graphical-wind-' + i).src = url + 'WindSpd' + (timeString + i) + '_slc.png';
        document.getElementById('graphical-sky-' + i).src = url + 'Sky' + (timeString + i) + '_slc.png';
        document.getElementById('graphical-wx-' + i).src = url + 'Wx' + (timeString + i) + '_slc.png';
    }
}

function get_morning_skew_t() {
    let dateString = now.toLocaleDateString('en-ZA').replaceAll('/', '');
    let skewTurl = 'https://climate.cod.edu/data/raob/KSLC/skewt/KSLC.skewt.' + dateString + '.12.gif';
    skewTurl = (now.getHours() < 7) ? 'images/unskewt.png' : skewTurl;
    //document.getElementById('skew-t').src = skewTurl;
}

noaa_time_series_api_async();
noaa_three_day_forecast_api_async();
wind_aloft_gcp_function_async();
get_all_graphical_forecast_images();
get_morning_skew_t();

// --------------------------------------------------------------------


function determine_wind_map_time() {
    hour = now.getHours();
    min = now.getMinutes();
    if (hour > 12 && hour < 20) {
        min = (min < 15) ? '00' : (min < 30) ? 15 : (min < 45) ? 30 : 45;
    } else min = '00';
    ampm = (hour < 12 && hour >= 7) ? ' am' : ' pm';
    hour = (hour >= 7 && hour <= 20) ? (hour % 12 === 0) ? 12 : hour % 12 : 8;
    document.getElementById('wind-map-timestamp').innerHTML = hour + ':' + min + ampm;
}

determine_wind_map_time(); // Find a way to pull the timestamp from the image - EXIF?
