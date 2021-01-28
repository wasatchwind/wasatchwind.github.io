const now = new Date();

(function () {
    document.getElementById('date').innerHTML = now.toLocaleString('en-us', {weekday: 'short', month: 'short', day: 'numeric'});
})();

function get_morning_skew_t() {
    let dateString = now.toLocaleDateString('en-ZA').replaceAll('/', '');
    let skewTurl = 'https://climate.cod.edu/data/raob/KSLC/skewt/KSLC.skewt.' + dateString + '.12.gif';
//     skewTurl = (now.getHours() < 7) ? 'images/unskewt.png' : skewTurl;
    document.getElementById('skew-t').src = 'https://climate.cod.edu/data/raob/KSLC/skewt/KSLC.skewt.' + dateString + '.12.gif';
//     document.getElementById('skew-t').src = skewTurl;
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
        document.getElementById(element + '-btn').style.backgroundColor = '#79DE79';
    }
}

async function noaa_time_series_api_async() { //https://developers.synopticdata.com/mesonet
    const stations = ['KSLC', 'AMB'];
    const historyMinutes = 420;
    const dataPoints = 'air_temp,altimeter,wind_cardinal_direction,wind_direction,wind_gust,wind_speed';
    const noaaTimeSeriesUrl = 'https://api.mesowest.net/v2/station/timeseries?&stid=' + stations[0] + '&stid=' + stations[1] + '&recent=' + historyMinutes + '&obtimezone=local&timeformat=%-I:%M%20%p&vars=' + dataPoints + '&units=english,speed|mph,temp|F&token=6243aadc536049fc9329c17ff2f88db3';
    const response = await fetch(noaaTimeSeriesUrl);
    const data = await response.json();
    get_and_display_kslc_latest_stats(data.STATION[0].OBSERVATIONS);
    build_wind_history_chart('kslc', data.STATION[0].OBSERVATIONS, 11, 9, 19);
    build_wind_history_chart('amb', data.STATION[1].OBSERVATIONS, 6, 19, 29);
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
    const data = [{"Pressure_mb": 870.0, "Altitude_m": 1289, "Temp_c": -0.7, "Dewpoint_c": -6.7, "Wind_Direction": 170, "Wind_Speed_kt": 8}, {"Pressure_mb": 868.0, "Altitude_m": 1307, "Temp_c": -0.5, "Dewpoint_c": -8.5, "Wind_Direction": 170, "Wind_Speed_kt": 9}, {"Pressure_mb": 850.0, "Altitude_m": 1475, "Temp_c": -1.3, "Dewpoint_c": -10.3, "Wind_Direction": 175, "Wind_Speed_kt": 19}, {"Pressure_mb": 848.0, "Altitude_m": 1494, "Temp_c": -1.5, "Dewpoint_c": -10.5, "Wind_Direction": 175, "Wind_Speed_kt": 20}, {"Pressure_mb": 812.7, "Altitude_m": 1829, "Temp_c": -4.2, "Dewpoint_c": -11.5, "Wind_Direction": 180, "Wind_Speed_kt": 38}, {"Pressure_mb": 787.0, "Altitude_m": 2083, "Temp_c": -6.3, "Dewpoint_c": -12.3, "Wind_Direction": 176, "Wind_Speed_kt": 38}, {"Pressure_mb": 781.8, "Altitude_m": 2134, "Temp_c": -6.7, "Dewpoint_c": -12.5, "Wind_Direction": 175, "Wind_Speed_kt": 38}, {"Pressure_mb": 751.7, "Altitude_m": 2438, "Temp_c": -9.2, "Dewpoint_c": -13.4, "Wind_Direction": 180, "Wind_Speed_kt": 42}, {"Pressure_mb": 723.0, "Altitude_m": 2740, "Temp_c": -11.7, "Dewpoint_c": -14.4, "Wind_Direction": 180, "Wind_Speed_kt": 41}, {"Pressure_mb": 722.7, "Altitude_m": 2743, "Temp_c": -11.7, "Dewpoint_c": -14.4, "Wind_Direction": 180, "Wind_Speed_kt": 41}, {"Pressure_mb": 700.0, "Altitude_m": 2987, "Temp_c": -12.1, "Dewpoint_c": -18.1, "Wind_Direction": 200, "Wind_Speed_kt": 32}, {"Pressure_mb": 689.0, "Altitude_m": 3108, "Temp_c": -12.1, "Dewpoint_c": -21.1, "Wind_Direction": 202, "Wind_Speed_kt": 28}, {"Pressure_mb": 667.2, "Altitude_m": 3353, "Temp_c": -12.7, "Dewpoint_c": -24.5, "Wind_Direction": 205, "Wind_Speed_kt": 20}, {"Pressure_mb": 666.0, "Altitude_m": 3367, "Temp_c": -12.7, "Dewpoint_c": -24.7, "Wind_Direction": 206, "Wind_Speed_kt": 20}, {"Pressure_mb": 650.0, "Altitude_m": 3553, "Temp_c": -12.1, "Dewpoint_c": -29.1, "Wind_Direction": 215, "Wind_Speed_kt": 26}, {"Pressure_mb": 641.1, "Altitude_m": 3658, "Temp_c": -12.7, "Dewpoint_c": -34.5, "Wind_Direction": 220, "Wind_Speed_kt": 29}, {"Pressure_mb": 628.0, "Altitude_m": 3815, "Temp_c": -13.5, "Dewpoint_c": -42.5, "Wind_Direction": 223, "Wind_Speed_kt": 29}, {"Pressure_mb": 622.0, "Altitude_m": 3889, "Temp_c": -12.9, "Dewpoint_c": -44.9, "Wind_Direction": 224, "Wind_Speed_kt": 29}, {"Pressure_mb": 605.0, "Altitude_m": 4099, "Temp_c": -14.3, "Dewpoint_c": -37.3, "Wind_Direction": 227, "Wind_Speed_kt": 29}, {"Pressure_mb": 596.0, "Altitude_m": 4212, "Temp_c": -14.9, "Dewpoint_c": -28.9, "Wind_Direction": 229, "Wind_Speed_kt": 29}, {"Pressure_mb": 591.7, "Altitude_m": 4267, "Temp_c": -15.2, "Dewpoint_c": -24.9, "Wind_Direction": 230, "Wind_Speed_kt": 29}, {"Pressure_mb": 588.0, "Altitude_m": 4315, "Temp_c": -15.5, "Dewpoint_c": -21.5, "Wind_Direction": 231, "Wind_Speed_kt": 29}, {"Pressure_mb": 572.0, "Altitude_m": 4522, "Temp_c": -17.5, "Dewpoint_c": -19.6, "Wind_Direction": 236, "Wind_Speed_kt": 30}, {"Pressure_mb": 545.4, "Altitude_m": 4877, "Temp_c": -19.3, "Dewpoint_c": -22.3, "Wind_Direction": 245, "Wind_Speed_kt": 31}, {"Pressure_mb": 528.0, "Altitude_m": 5118, "Temp_c": -20.5, "Dewpoint_c": -24.2, "Wind_Direction": 251, "Wind_Speed_kt": 32}, {"Pressure_mb": 511.0, "Altitude_m": 5360, "Temp_c": -20.9, "Dewpoint_c": -27.9, "Wind_Direction": 257, "Wind_Speed_kt": 33}, {"Pressure_mb": 502.3, "Altitude_m": 5486, "Temp_c": -22.2, "Dewpoint_c": -29.2, "Wind_Direction": 260, "Wind_Speed_kt": 33}, {"Pressure_mb": 500.0, "Altitude_m": 5520, "Temp_c": -22.5, "Dewpoint_c": -29.5, "Wind_Direction": 260, "Wind_Speed_kt": 33}, {"Pressure_mb": 495.0, "Altitude_m": 5594, "Temp_c": -22.9, "Dewpoint_c": -28.9, "Wind_Direction": 259, "Wind_Speed_kt": 33}, {"Pressure_mb": 488.0, "Altitude_m": 5698, "Temp_c": -23.5, "Dewpoint_c": -31.5, "Wind_Direction": 257, "Wind_Speed_kt": 33}, {"Pressure_mb": 475.0, "Altitude_m": 5895, "Temp_c": -24.9, "Dewpoint_c": -30.9, "Wind_Direction": 254, "Wind_Speed_kt": 33}, {"Pressure_mb": 462.0, "Altitude_m": 6096, "Temp_c": -26.6, "Dewpoint_c": -33.6, "Wind_Direction": 250, "Wind_Speed_kt": 33}, {"Pressure_mb": 448.0, "Altitude_m": 6318, "Temp_c": -28.5, "Dewpoint_c": -36.5, "Wind_Direction": 252, "Wind_Speed_kt": 35}, {"Pressure_mb": 409.0, "Altitude_m": 6964, "Temp_c": -33.9, "Dewpoint_c": -38.9, "Wind_Direction": 258, "Wind_Speed_kt": 41}, {"Pressure_mb": 400.0, "Altitude_m": 7120, "Temp_c": -35.1, "Dewpoint_c": -41.1, "Wind_Direction": 260, "Wind_Speed_kt": 43}, {"Pressure_mb": 373.0, "Altitude_m": 7604, "Temp_c": -38.9, "Dewpoint_c": -49.9, "Wind_Direction": 265, "Wind_Speed_kt": 39}, {"Pressure_mb": 372.1, "Altitude_m": 7620, "Temp_c": -39.0, "Dewpoint_c": -49.9, "Wind_Direction": 265, "Wind_Speed_kt": 39}, {"Pressure_mb": 357.0, "Altitude_m": 7903, "Temp_c": -41.5, "Dewpoint_c": -49.5, "Wind_Direction": 266, "Wind_Speed_kt": 45}];
    const dalr = 5.38;
    draw_lapse_chart(data, maxTemp, dalr);
    document.getElementById('max-forecast-temp').innerHTML = maxTemp + ' \u00B0F';
    document.getElementById('thermal-max-height-forecast').innerHTML = calculate_max_height_of_thermal(data, maxTemp, dalr) + ' ft MSL';
}

async function wind_aloft_gcp_function_async() {
    // const gcpWindAloftFuncUrl = 'https://us-central1-wasatchwind.cloudfunctions.net/wind-aloft-ftp-012721';
    // const response = await fetch(gcpWindAloftFuncUrl);
    // const data = await response.json();
    let data = {"Directions_6k_9k_12k_18k":[180,200,200,240],"End":"8 pm","Speeds_6k_9k_12k_18k":[16,35,16,51],"Start":"1 pm","Temps_9k_12k_18k":[18,14,-9]};
    set_wind_aloft_link();
    const ylwSpeeds = [9, 12, 15, 21];
    const redSpeeds = [12, 18, 24, 36];
    document.getElementById('aloft-start').innerHTML = data.Start;
    document.getElementById('aloft-end').innerHTML = data.End;
    for (i=0; i<4; i++) {
        document.getElementById('dir-' + i).src = 'images/dirs/' + data.Directions_6k_9k_12k_18k[i] + '.gif';
        if (data.Directions_6k_9k_12k_18k[i] === 'calm')
            document.getElementById('aloft-' + i).style.display = 'none';
        document.getElementById('spd-' + i).innerHTML = '<span class="indent txtsz350 ltblue">' + data.Speeds_6k_9k_12k_18k[i] + '</span><span class="unbold white"> mph</span>';
        document.getElementById('barwidth-' + i).style.width = data.Speeds_6k_9k_12k_18k[i]*0.8 + '%';
        color = (data.Speeds_6k_9k_12k_18k[i] > ylwSpeeds[i] && data.Speeds_6k_9k_12k_18k[i] < redSpeeds[i]) ? '#FCDC99' : (data.Speeds_6k_9k_12k_18k[i] >= redSpeeds[i] ? '#FB6962' : '#79DE79');
        document.getElementById('barwidth-' + i).style.backgroundColor = color;
    }
}

function build_wind_history_chart(stationName, data, historyLength, ylw, red) {
    const time = data.date_time.slice(-historyLength).map(d => d.slice(0,-3));
    const wind = data.wind_speed_set_1.slice(-historyLength).map(d => Math.round(d) === 0 ? '' : Math.round(d));
    const windColor = wind.map(d => (d > ylw && d < red) ? '#FCDC99' : d >= red ? '#FB6962' : '#79DE79');
    const dir = data.wind_direction_set_1.slice(-historyLength).map(d => d);
    let gust = [];
    try { gust = data.wind_gust_set_1.slice(-historyLength).map(d => Math.round(d) > 0 ? Math.round(d) : '-'); }
    catch { for (i=0; i<historyLength; i++) { gust[i] = '-'; } }
    for (i=0; i<historyLength; i++) {
        document.getElementById(stationName + '-time-' + i).innerHTML = time[i];
        document.getElementById(stationName + '-wind-num-' + i).innerHTML = wind[i];
        document.getElementById(stationName + '-wind-bar-' + i).style.height = wind[i]*4 + 'px';
        document.getElementById(stationName + '-wind-bar-' + i).style.backgroundColor = windColor[i];
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
        document.getElementById('kslc-alti-bar-' + i).style.backgroundColor = 'lightblue';
        document.getElementById('kslc-temp-' + i).innerHTML = temp[i];
        document.getElementById('kslc-apz-' + i).src = 'images/apz' + calculate_apz(alti[i], temp[i]) + '.png';
        document.getElementById('kslc-apz-' + i).style.width = '60px';
    }
}

get_morning_skew_t();
get_all_graphical_forecast_images();
determine_wind_map_time(); // Find a way to pull the timestamp from the image - EXIF?
noaa_time_series_api_async();
noaa_three_day_forecast_api_async();
wind_aloft_gcp_function_async();
