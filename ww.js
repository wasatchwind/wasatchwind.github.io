const now = new Date();

async function noaa_time_series_api_async() { //https://developers.synopticdata.com/mesonet
    const stations = ['KSLC', 'AMB'];
    const historyMinutes = 420;
    const dataPoints = 'air_temp,altimeter,wind_cardinal_direction,wind_direction,wind_gust,wind_speed';
    const noaaTimeSeriesUrl = 'https://api.mesowest.net/v2/station/timeseries?&stid=' + stations[0] + '&stid=' + stations[1] + '&recent=' + historyMinutes + '&obtimezone=local&timeformat=%-I:%M%20%p&vars=' + dataPoints + '&units=english,speed|mph,temp|F&token=6243aadc536049fc9329c17ff2f88db3';
    const response = await fetch(noaaTimeSeriesUrl);
    const data = await response.json();
    build_wind_history_chart('kslc', data.STATION[0].OBSERVATIONS, 11);
    build_wind_history_chart('amb', data.STATION[1].OBSERVATIONS, 6);
    get_and_display_kslc_latest_stats(data.STATION[0].OBSERVATIONS);
}

async function noaa_three_day_forecast_api_async() {
    const noaaPublicForecastUrl = 'https://api.weather.gov/gridpoints/SLC/97,175/forecast';
    const response = await fetch(noaaPublicForecastUrl);
    const data = await response.json();
    let position = 0;
    position = (data.properties.periods[0].isDaytime) ? position : 1;
    const maxTemp = data.properties.periods[position].temperature;
    raob_data_gcp_storage_async(maxTemp);
    for (i=1; i<4; i++) {
        document.getElementById('forecast-day' + i +'-day').innerHTML = data.properties.periods[position].name;
        document.getElementById('forecast-day' + i +'-txt').innerHTML = data.properties.periods[position].detailedForecast;
        document.getElementById('forecast-day' + i +'-img').src = data.properties.periods[position].icon;
        position += 2;
    }
}

async function raob_data_gcp_storage_async(maxTemp) {
    const gcpRaobDataUrl = 'https://storage.googleapis.com/wasatch-wind-static/raob.json';
    const response = await fetch(gcpRaobDataUrl);
    const data = await response.json();
    const data = [{"Pressure_mb": 880.0, "Altitude_m": 1289, "Temp_c": -4.5, "Dewpoint_c": -8.8, "Wind_Direction": 150, "Wind_Speed_kt": 6}, {"Pressure_mb": 876.0, "Altitude_m": 1325, "Temp_c": -4.1, "Dewpoint_c": -11.1, "Wind_Direction": 150, "Wind_Speed_kt": 7}, {"Pressure_mb": 864.0, "Altitude_m": 1434, "Temp_c": -0.7, "Dewpoint_c": -11.7, "Wind_Direction": 150, "Wind_Speed_kt": 9}, {"Pressure_mb": 850.0, "Altitude_m": 1564, "Temp_c": -0.7, "Dewpoint_c": -12.7, "Wind_Direction": 150, "Wind_Speed_kt": 11}, {"Pressure_mb": 822.3, "Altitude_m": 1829, "Temp_c": -0.0, "Dewpoint_c": -13.0, "Wind_Direction": 180, "Wind_Speed_kt": 10}, {"Pressure_mb": 821.0, "Altitude_m": 1841, "Temp_c": 0.0, "Dewpoint_c": -13.0, "Wind_Direction": 180, "Wind_Speed_kt": 10}, {"Pressure_mb": 791.4, "Altitude_m": 2134, "Temp_c": -2.6, "Dewpoint_c": -12.7, "Wind_Direction": 185, "Wind_Speed_kt": 17}, {"Pressure_mb": 790.0, "Altitude_m": 2148, "Temp_c": -2.7, "Dewpoint_c": -12.7, "Wind_Direction": 185, "Wind_Speed_kt": 17}, {"Pressure_mb": 764.0, "Altitude_m": 2413, "Temp_c": -3.5, "Dewpoint_c": -12.5, "Wind_Direction": 185, "Wind_Speed_kt": 13}, {"Pressure_mb": 761.5, "Altitude_m": 2438, "Temp_c": -3.7, "Dewpoint_c": -12.4, "Wind_Direction": 185, "Wind_Speed_kt": 13}, {"Pressure_mb": 744.0, "Altitude_m": 2622, "Temp_c": -5.1, "Dewpoint_c": -12.1, "Wind_Direction": 221, "Wind_Speed_kt": 11}, {"Pressure_mb": 732.6, "Altitude_m": 2743, "Temp_c": -5.5, "Dewpoint_c": -13.9, "Wind_Direction": 245, "Wind_Speed_kt": 9}, {"Pressure_mb": 728.0, "Altitude_m": 2792, "Temp_c": -5.7, "Dewpoint_c": -14.7, "Wind_Direction": 248, "Wind_Speed_kt": 10}, {"Pressure_mb": 716.0, "Altitude_m": 2923, "Temp_c": -5.1, "Dewpoint_c": -13.1, "Wind_Direction": 255, "Wind_Speed_kt": 13}, {"Pressure_mb": 700.0, "Altitude_m": 3100, "Temp_c": -5.3, "Dewpoint_c": -15.3, "Wind_Direction": 265, "Wind_Speed_kt": 16}, {"Pressure_mb": 699.0, "Altitude_m": 3111, "Temp_c": -5.3, "Dewpoint_c": -15.3, "Wind_Direction": 265, "Wind_Speed_kt": 16}, {"Pressure_mb": 680.0, "Altitude_m": 3327, "Temp_c": -6.5, "Dewpoint_c": -20.5, "Wind_Direction": 263, "Wind_Speed_kt": 18}, {"Pressure_mb": 651.6, "Altitude_m": 3658, "Temp_c": -8.5, "Dewpoint_c": -21.2, "Wind_Direction": 260, "Wind_Speed_kt": 20}, {"Pressure_mb": 635.0, "Altitude_m": 3858, "Temp_c": -9.7, "Dewpoint_c": -21.7, "Wind_Direction": 255, "Wind_Speed_kt": 21}, {"Pressure_mb": 602.1, "Altitude_m": 4267, "Temp_c": -10.9, "Dewpoint_c": -28.9, "Wind_Direction": 245, "Wind_Speed_kt": 22}, {"Pressure_mb": 597.0, "Altitude_m": 4333, "Temp_c": -11.1, "Dewpoint_c": -30.1, "Wind_Direction": 244, "Wind_Speed_kt": 23}, {"Pressure_mb": 585.0, "Altitude_m": 4488, "Temp_c": -11.9, "Dewpoint_c": -27.9, "Wind_Direction": 241, "Wind_Speed_kt": 24}, {"Pressure_mb": 578.6, "Altitude_m": 4572, "Temp_c": -12.5, "Dewpoint_c": -29.6, "Wind_Direction": 240, "Wind_Speed_kt": 25}, {"Pressure_mb": 563.0, "Altitude_m": 4780, "Temp_c": -13.9, "Dewpoint_c": -33.9, "Wind_Direction": 247, "Wind_Speed_kt": 22}, {"Pressure_mb": 555.9, "Altitude_m": 4877, "Temp_c": -14.0, "Dewpoint_c": -36.0, "Wind_Direction": 250, "Wind_Speed_kt": 20}, {"Pressure_mb": 549.0, "Altitude_m": 4971, "Temp_c": -14.1, "Dewpoint_c": -38.1, "Wind_Direction": 250, "Wind_Speed_kt": 17}, {"Pressure_mb": 534.0, "Altitude_m": 5182, "Temp_c": -13.1, "Dewpoint_c": -53.1, "Wind_Direction": 250, "Wind_Speed_kt": 11}, {"Pressure_mb": 534.0, "Altitude_m": 5182, "Temp_c": -13.1, "Dewpoint_c": -53.1, "Wind_Direction": 250, "Wind_Speed_kt": 11}, {"Pressure_mb": 515.0, "Altitude_m": 5457, "Temp_c": -14.1, "Dewpoint_c": -55.1, "Wind_Direction": 159, "Wind_Speed_kt": 12}, {"Pressure_mb": 500.0, "Altitude_m": 5680, "Temp_c": -16.1, "Dewpoint_c": -42.1, "Wind_Direction": 85, "Wind_Speed_kt": 12}, {"Pressure_mb": 480.0, "Altitude_m": 5987, "Temp_c": -18.7, "Dewpoint_c": -38.7, "Wind_Direction": 48, "Wind_Speed_kt": 18}, {"Pressure_mb": 473.0, "Altitude_m": 6096, "Temp_c": -19.3, "Dewpoint_c": -37.9, "Wind_Direction": 35, "Wind_Speed_kt": 20}, {"Pressure_mb": 465.0, "Altitude_m": 6223, "Temp_c": -19.9, "Dewpoint_c": -36.9, "Wind_Direction": 29, "Wind_Speed_kt": 24}, {"Pressure_mb": 458.0, "Altitude_m": 6336, "Temp_c": -20.3, "Dewpoint_c": -40.3, "Wind_Direction": 23, "Wind_Speed_kt": 27}, {"Pressure_mb": 454.0, "Altitude_m": 6401, "Temp_c": -20.8, "Dewpoint_c": -43.0, "Wind_Direction": 20, "Wind_Speed_kt": 29}, {"Pressure_mb": 438.0, "Altitude_m": 6666, "Temp_c": -22.9, "Dewpoint_c": -53.9, "Wind_Direction": 42, "Wind_Speed_kt": 27}, {"Pressure_mb": 435.6, "Altitude_m": 6706, "Temp_c": -22.4, "Dewpoint_c": -55.2, "Wind_Direction": 45, "Wind_Speed_kt": 27}, {"Pressure_mb": 434.0, "Altitude_m": 6733, "Temp_c": -22.1, "Dewpoint_c": -56.1, "Wind_Direction": 45, "Wind_Speed_kt": 27}];
    const dalr = 5.5;
    draw_lapse_chart(data, maxTemp, dalr);
    document.getElementById('max-forecast-temp').innerHTML = maxTemp + ' \u00B0F';
    document.getElementById('thermal-max-height-forecast').innerHTML = calculate_max_height_of_thermal(data, maxTemp, dalr) + ' ft MSL';
}

async function wind_aloft_gcp_function_async() {
    const gcpWindAloftFuncUrl = 'https://us-central1-wasatchwind.cloudfunctions.net/wind-aloft-ftp-122620';
    const response = await fetch(gcpWindAloftFuncUrl);
    const data = await response.json();
    let data = [{"Start":"2 pm"},{"End":"11 pm"},{"Direction":"calm"},{"Direction":270},{"Direction":280},{"Direction":300},{"Speed(mph)":0},{"Speed(mph)":17},{"Speed(mph)":25},{"Speed(mph)":23},{"Temp(F)":25},{"Temp(F)":18},{"Temp(F)":3}];
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

function hide_all_main_divs() {
    const divNames = ['wind', 'lift', 'sky', 'temp&pressure', 'general', 'misc'];
    for (i=0; i<divNames.length; i++) { document.getElementById(divNames[i]).style.display = 'none'; }
}

function toggle_div(element) {
    hide_all_main_divs();
    let div = document.getElementById(element);
    if (div.style.display === 'block') { div.style.display = 'none'; } else { div.style.display = 'block'; }
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
    try { gust = 'g' + Math.round(data.wind_gust_set_1[data.date_time.length-1]); }
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
    while ((maxTemp-(((raobData[maxPosition].Altitude_m-raobData[0].Altitude_m)*3.281/1000)*5.38)) > ((raobData[maxPosition].Temp_c*9/5)+32)) {
        maxPosition++; }
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
    document.getElementById('skew-t').src = skewTurl;
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
