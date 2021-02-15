const now = new Date();
const dalr = 5.38;
let beforeSunset, currentDiv;

(function () {
    document.getElementById('heading-date').innerHTML = now.toLocaleString('en-us', {weekday: 'short', month: 'short', day: 'numeric'});
})();

async function get_surface_wind_map_image_gcp_async() {
    const imageUrl = 'https://storage.googleapis.com/wasatch-wind-static/wind-map-save.png';
    const imageMetaUrl = 'https://storage.googleapis.com/storage/v1/b/wasatch-wind-static/o/wind-map-save.png';
    const response = await fetch(imageMetaUrl);
    const data = await response.json();
    let screenshotTime = new Date(data.timeCreated);
    screenshotTime = screenshotTime.toLocaleString('en-US', {hour: 'numeric', minute: '2-digit'}).toLowerCase();
    document.getElementById('wind-map-timestamp').innerHTML = screenshotTime;
    document.getElementById('surface-wind-map').src = imageUrl;
}
get_surface_wind_map_image_gcp_async();

async function noaa_latest_api_async() { //https://developers.synopticdata.com/mesonet
    const baseUrl = 'https://api.synopticdata.com/v2/stations/latest?';
    const stations = '&stid=OGP&stid=C8948&stid=UTOLY&stid=KU42&stid=FPS&stid=PKC';
    const timeFormat = '&obtimezone=local&timeformat=%-I:%M%20%p';
    const dataPoints = '&vars=wind_direction,wind_gust,wind_speed';
    const units = '&units=english,speed|mph';
    const token = '&token=6243aadc536049fc9329c17ff2f88db3';
    const noaaLatestUrl = baseUrl + stations + timeFormat + dataPoints + units + token;
    const response = await fetch(noaaLatestUrl);
    const data = await response.json();
    for (i=0; i<data.STATION.length; i++) {
        let time = data.STATION[i].OBSERVATIONS.wind_speed_value_1.date_time.toLowerCase();
        let wind = Math.round(data.STATION[i].OBSERVATIONS.wind_speed_value_1.value);
        let windTime = data.STATION[i].OBSERVATIONS.wind_speed_value_1.date_time;
        let gust = Math.round(data.STATION[i].OBSERVATIONS.wind_gust_value_1.value);
        let gustTime = data.STATION[i].OBSERVATIONS.wind_gust_value_1.date_time;
        let windDir = data.STATION[i].OBSERVATIONS.wind_direction_value_1.value;
        gust = (windTime === gustTime && gust > 0) ? gust : '--';
        let windImg = (wind > 0 || gust !== '--') ? 'images/arrow.png' : 'images/calm.png';
        windDir = (windImg !== 'images/calm.png') ? windDir : 0;
        wind = (wind > 0) ? wind : '--';
        document.getElementById(data.STATION[i].STID + '-time').innerHTML = time;
        document.getElementById(data.STATION[i].STID + '-wind-speed').innerHTML = wind;
        document.getElementById(data.STATION[i].STID + '-wind-gust').innerHTML = gust;
        document.getElementById(data.STATION[i].STID + '-wind-dir-img').src = windImg;
        document.getElementById(data.STATION[i].STID + '-wind-dir-img').style.transform = 'rotate(' + windDir + 'deg)';
    }
}
noaa_latest_api_async();

async function get_soaring_forecast_gcp_async() {
    const gcpSoaringDataUrl = 'https://storage.googleapis.com/wasatch-wind-static/soaring.json';
    const response = await fetch(gcpSoaringDataUrl);
    const data = await response.json();
    document.getElementById('soarcast-tol').innerHTML = data.TOP_OF_LIFT;
    document.getElementById('soarcast-tol-m').innerHTML = data.TOP_OF_LIFT_M;
    document.getElementById('soarcast-neg3').innerHTML = data.NEG_3_INDEX;
    document.getElementById('soarcast-neg3-m').innerHTML = data.NEG_3_INDEX_M;
    document.getElementById('soarcast-rol').innerHTML = data.MAX_RATE_OF_LIFT;
    document.getElementById('soarcast-rol-m').innerHTML = data.MAX_RATE_OF_LIFT_MS;
}
get_soaring_forecast_gcp_async();

function set_wind_aloft_link() {
    let range = (now.getHours() > 3 && now.getHours() < 13) ? '12' : (now.getHours() > 18 || now.getHours() < 4) ? '24' : '06';
    const linkURL = 'https://www.aviationweather.gov/windtemp/data?level=low&fcst=' + range + '&region=slc&layout=on&date=';
    document.getElementById('wind-aloft-link').setAttribute('href', linkURL);
}

async function wind_aloft_gcp_function_async() {
    const gcpWindAloftFuncUrl = 'https://us-central1-wasatchwind.cloudfunctions.net/wind-aloft-ftp-020721';
    const response = await fetch(gcpWindAloftFuncUrl);
    const data = await response.json();
    set_wind_aloft_link();
    const spdStr = '<span class="indent txtsz350 ltblue">';
    const mphStr = '</span><span class="unbold white"> mph</span>';
    const ylwSpds = [9, 12, 15, 21];
    const redSpds = [12, 18, 24, 36];
    document.getElementById('aloft-start').innerHTML = data.Start;
    document.getElementById('aloft-end').innerHTML = data.End;
    for (i=0; i<4; i++) {
        document.getElementById('dir-' + i).src = 'images/dirs/' + data.Directions_6k_9k_12k_18k[i] + '.gif';
        if (data.Directions_6k_9k_12k_18k[i] === 'calm') document.getElementById('aloft-' + i).style.display = 'none';
        else {
            document.getElementById('spd-' + i).innerHTML = spdStr + data.Speeds_6k_9k_12k_18k[i] + mphStr;
            document.getElementById('barwidth-' + i).style.width = data.Speeds_6k_9k_12k_18k[i]*0.8 + '%';
            let speed = data.Speeds_6k_9k_12k_18k[i];
            let color = (speed > ylwSpds[i] && speed < redSpds[i]) ? '#FCDC99' : (speed >= redSpds[i] ? '#FB6962' : '#79DE79');
            document.getElementById('barwidth-' + i).style.backgroundColor = color;
        }
    }
}
wind_aloft_gcp_function_async();

function calculate_apz(alti, temp, apz, currentZones = []) {
    const apzSlope = [0.05, 0.12, 0.19, 0.33, 0.47, 0.54, 0.62];
    const apzIntercept = [29.91, 30.01, 30.11, 30.27, 30.43, 30.53, 30.65];
    for (i=0; i<7; i++) currentZones[i] = Math.round((apzSlope[i] / -110 * temp + apzIntercept[i]) * 100) / 100;
    currentZones.push(100);
    apz = currentZones.findIndex(n => n >= alti);
    apz = (alti == currentZones[3]) ? 'LoP' : apz;
    return apz;
}

function get_and_display_kslc_latest_stats(data, gust) {
    const position = data.date_time.length-1;
    const alti = data.altimeter_set_1[position].toFixed(2);
    const temp = Math.round(data.air_temp_set_1[position]);
    let wind = Math.round(data.wind_speed_set_1[position]);
    let wdir = data.wind_cardinal_direction_set_1d[position];
    wdir = (wdir === null) ? '' : wdir;
    wind = (wind === 0) ? 'Calm' : wind;
    wind = (wind === 'Calm') ? wind : wdir + '&nbsp;' + wind;
    try { gust = (Math.round(data.wind_gust_set_1[position]) > 0) ? 'g' + Math.round(data.wind_gust_set_1[position]) : ''; }
    catch { gust = ''; }
    document.getElementById('latest-time').innerHTML = data.date_time[position].toLowerCase() + ' @ KSLC';
    document.getElementById('latest-pressure').innerHTML = alti;
    document.getElementById('latest-temp').innerHTML = temp;
    document.getElementById('apz').innerHTML = calculate_apz(alti, temp);
    document.getElementById('latest-wind').innerHTML = wind + '<span class="ltred unbold">' + gust + '</span>';
}

function build_wind_history_chart(stationName, data, historyLength, ylw, red, gust = []) {
    const time = data.date_time.slice(-historyLength).map(d => d.slice(0,-3));
    const wind = data.wind_speed_set_1.slice(-historyLength).map(d => Math.round(d) === 0 ? '' : Math.round(d));
    const windColor = wind.map(d => (d > ylw && d < red) ? '#FCDC99' : d >= red ? '#FB6962' : '#79DE79');
    const dir = data.wind_direction_set_1.slice(-historyLength).map(d => d);
    try { gust = data.wind_gust_set_1.slice(-historyLength).map(d => Math.round(d) > 0 ? Math.round(d) : '-'); }
    catch { for (i=0; i<historyLength; i++) gust[i] = '-'; }
    for (i=0; i<historyLength; i++) {
        document.getElementById(stationName + '-time-' + i).innerHTML = time[i];
        document.getElementById(stationName + '-wind-num-' + i).innerHTML = wind[i];
        document.getElementById(stationName + '-wind-bar-' + i).style.height = wind[i]*4 + 'px';
        document.getElementById(stationName + '-wind-bar-' + i).style.backgroundColor = windColor[i];
        document.getElementById(stationName + '-dir-' + i).src = (wind[i] > 0 && dir[i] !== null) ? 'images/arrow.png' : wind[i] === '' ? 'images/calm.png' : 'images/nodata.png';
        document.getElementById(stationName + '-dir-' + i).style.transform = wind[i] > 0 ? 'rotate(' + dir[i] + 'deg)' : '';
        document.getElementById(stationName + '-gust-' + i).innerHTML = gust[i];
    }
}

function build_tempalti_history_chart(data, max, min, time = [], alti = [], temp = []) {
    for (i=0; i<data.date_time.length; i++) {
        if (data.date_time[i].slice(-5,-3) === '00') {
            time.push(data.date_time[i].toLowerCase().replace(/:\d{2}/g, ''));
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
        // Formula: NewValue = (((OldValue - OldMin) * (NewMax - NewMin)) / (OldMax - OldMin)) + NewMin
        document.getElementById('kslc-alti-bar-' + i).style.height = (((alti[i]-min)*100)/(max-min))+5 + 'px';
        document.getElementById('kslc-alti-bar-' + i).style.backgroundColor = 'lightblue';
        document.getElementById('kslc-temp-' + i).innerHTML = temp[i];
        document.getElementById('kslc-apz-' + i).src = 'images/apz' + calculate_apz(alti[i], temp[i]) + '.png';
        document.getElementById('kslc-apz-' + i).style.width = '60px';
    }
}

async function noaa_time_series_api_async() { //https://developers.synopticdata.com/mesonet
    const baseUrl = 'https://api.mesowest.net/v2/station/timeseries?';
    const stations = '&stid=KSLC&stid=AMB';
    const historyMinutes = '&recent=420';
    const timeFormat = '&obtimezone=local&timeformat=%-I:%M%20%p';
    const dataPoints = '&vars=air_temp,altimeter,wind_cardinal_direction,wind_direction,wind_gust,wind_speed';
    const units = '&units=english,speed|mph,temp|F';
    const token = '&token=6243aadc536049fc9329c17ff2f88db3';
    const noaaTimeSeriesUrl = baseUrl + stations + historyMinutes + timeFormat + dataPoints + units + token;
    const response = await fetch(noaaTimeSeriesUrl);
    const data = await response.json();
    get_and_display_kslc_latest_stats(data.STATION[0].OBSERVATIONS);
    build_wind_history_chart('kslc', data.STATION[0].OBSERVATIONS, 11, 9, 19);
    build_wind_history_chart('amb', data.STATION[1].OBSERVATIONS, 6, 19, 29);
    build_tempalti_history_chart(data.STATION[0].OBSERVATIONS);
}
noaa_time_series_api_async();

function calculate_max_height_of_thermal (raobData, maxTemp, maxPosition = 0) {
    // While: Determine the position of the sounding data where it crosses the DALR to obtain interpolation points
    // While DALR line > RAOB Temp Line:
    while ((maxTemp-(((raobData[maxPosition].Altitude_m-raobData[0].Altitude_m)*3.281/1000)*dalr)) > ((raobData[maxPosition].Temp_c*9/5)+32))
        maxPosition++;
    const yIntercept = (maxTemp/dalr) + 4.229; // SLC Altitude
    const dalrSlope = -1 / dalr;
    const x1 = ((raobData[maxPosition].Temp_c*9/5)+32);
    const y1 = raobData[maxPosition].Altitude_m*3.281/1000;
    const x2 = ((raobData[maxPosition-1].Temp_c*9/5)+32);
    const y2 = raobData[maxPosition-1].Altitude_m*3.281/1000;
    const maxThermalHeight = Math.round((dalrSlope*((((x2-x1)/(y2-y1)*(y1-yIntercept))-x1)/((((x2-x1)/(y2-y1))*dalrSlope)-1))+yIntercept)*1000);
    document.getElementById('thermal-max-height-forecast').innerHTML = maxThermalHeight.toLocaleString();
    document.getElementById('thermal-max-height-forecast-m').innerHTML = Math.round(maxThermalHeight / 3.28) + ' m';
}

async function raob_data_gcp_storage_async(maxTemp) {
    const gcpRaobDataUrl = 'https://storage.googleapis.com/wasatch-wind-static/raob.json';
    const response = await fetch(gcpRaobDataUrl);
    const data = await response.json();
    draw_d3_lapse_chart(data, maxTemp);
    calculate_max_height_of_thermal(data, maxTemp);
}

async function noaa_three_day_forecast_api_async() {
    const noaaPublicForecastUrl = 'https://api.weather.gov/gridpoints/SLC/97,175/forecast';
    const response = await fetch(noaaPublicForecastUrl);
    const data = await response.json();
    beforeSunset = data.properties.periods[0].isDaytime; // Global variable
    let position = (beforeSunset) ? 0 : 1;
    if (beforeSunset) {
        const maxTemp = data.properties.periods[position].temperature;
        document.getElementById('max-temp').innerHTML = maxTemp + '&deg;';
        raob_data_gcp_storage_async(maxTemp);
    }
    for (i=1; i<4; i++) {
        document.getElementById('forecast-day' + i +'-day').innerHTML = data.properties.periods[position].name;
        document.getElementById('forecast-day' + i +'-txt').innerHTML = data.properties.periods[position].detailedForecast;
        document.getElementById('forecast-day' + i +'-img').src = data.properties.periods[position].icon;
        position += 2;
    }
}
noaa_three_day_forecast_api_async();

function get_all_graphical_forecast_images() {
    const url = 'https://graphical.weather.gov/images/slc/';
    const timeStr = (now.getHours() > 18 || now.getHours() < 7) ? 5 : 1;
    for (i=0; i<4; i++) {
        document.getElementById('graphical-wind-' + i).src = url + 'WindSpd' + (timeStr + i) + '_slc.png';
        document.getElementById('graphical-sky-' + i).src = url + 'Sky' + (timeStr + i) + '_slc.png';
        document.getElementById('graphical-wx-' + i).src = url + 'Wx' + (timeStr + i) + '_slc.png';
    }
}
get_all_graphical_forecast_images();

function get_morning_skew_t() {
    let skewTDateStr = now.toLocaleString('en-US', {year: 'numeric', month: '2-digit', day: '2-digit'}).split('/');
    skewTDateStr = skewTDateStr[2] + skewTDateStr[0] + skewTDateStr[1];
    const skewTurl = 'https://climate.cod.edu/data/raob/KSLC/skewt/KSLC.skewt.' + skewTDateStr + '.12.gif';
    document.getElementById('skew-t-img').src = skewTurl;
}
get_morning_skew_t();

function reset_previous_button_and_section() {
    if (document.getElementById('lift-off').style.display === 'block') document.getElementById('lift-off').style.display = 'none';
    document.getElementById(currentDiv).style.display = 'none';
    document.getElementById(currentDiv + '-btn').style.backgroundColor = 'rgb(80,80,80)';
    document.getElementById(currentDiv + '-btn').style.color = 'white';
}

function toggle_div(newBtn) {
    if (currentDiv !== undefined) reset_previous_button_and_section();
    currentDiv = newBtn;
    document.getElementById(currentDiv + '-btn').style.backgroundColor = '#79DE79';
    document.getElementById(currentDiv + '-btn').style.color = '#000050';
    if ((!beforeSunset || now.getHours() < 7) && currentDiv === 'lift') {
        document.getElementById(currentDiv).style.display = 'none';
        document.getElementById('lift-off').style.display = 'block';
    } else { document.getElementById(currentDiv).style.display = 'block'; }
}
