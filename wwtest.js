const now = new Date();

(function () {
    document.getElementById('date').innerHTML = now.toLocaleString('en-us', {weekday: 'short', month: 'short', day: 'numeric'});
})();

function get_morning_skew_t() {
    let dateString = now.toLocaleString('en-US', {year: 'numeric', month: '2-digit', day: '2-digit'}).split('/');
    dateString = dateString[2] + dateString[0] + dateString[1];
    let skewTurl = 'https://climate.cod.edu/data/raob/KSLC/skewt/KSLC.skewt.' + dateString + '.12.gif';
    skewTurl = (now.getHours() < 7) ? 'images/unskewt.png' : skewTurl;
    document.getElementById('skew-t').src = skewTurl;
}

function get_all_graphical_forecast_images() {
    const url = 'https://graphical.weather.gov/images/slc/';
    let timeString = (now.getHours() > 18 || now.getHours() < 7) ? 5 : 1;
    for (i=0; i<4; i++) {
        document.getElementById('graphical-wind-' + i).src = url + 'WindSpd' + (timeString + i) + '_slc.png';
        document.getElementById('graphical-sky-' + i).src = url + 'Sky' + (timeString + i) + '_slc.png';
        document.getElementById('graphical-wx-' + i).src = url + 'Wx' + (timeString + i) + '_slc.png';
    }
}

function reset_all_main_divs() {
    const divNames = ['wind', 'lift', 'sky', 'temp&pressure', 'general', 'misc'];
    for (i=0; i<divNames.length; i++) {
        document.getElementById(divNames[i]).style.display = 'none';
        document.getElementById(divNames[i] + '-btn').style.backgroundColor = 'rgb(100,100,100)';
        document.getElementById(divNames[i] + '-btn').style.color = 'white';
    }
}

function toggle_div(element) {
    reset_all_main_divs();
    let div = document.getElementById(element);
    if (div.style.display === 'block') { div.style.display = 'none'; }
    else {
        div.style.display = 'block';
        document.getElementById(element + '-btn').style.backgroundColor = '#79DE79';
        document.getElementById(element + '-btn'). style.color = 'rgb(80,80,80)';
    }
}

async function get_surface_wind_map_image_gcp_async() {
    // const imageUrl = 'https://storage.googleapis.com/wasatch-wind-static/wind-map-save.png'; // gcp image
    // const imageMetaUrl = 'https://storage.googleapis.com/storage/v1/b/wasatch-wind-static/o/wind-map-save.png'; // gcp meta
    // const response = await fetch(imageMetaUrl);
    // const data = await response.json();
    // let createdTime = new Date(data.timeCreated);
    // createdTime = createdTime.toLocaleString('en-US', {hour: 'numeric', minute: '2-digit'}).toLowerCase();
    // LOCAL TESTING LINE(S) vvv
    const imageUrl = 'https://wasatchwind.github.io/images/wind-map-save.png'; // test image
    const createdTime = '4:15 pm';
    // LOCAL TESTING LINE(S) ^^^
    document.getElementById('wind-map-timestamp').innerHTML = createdTime;
    document.getElementById('surface-wind-map').src = imageUrl;
}

async function get_soaring_forecast_gcp_async() {
    // const gcpSoaringDataUrl = 'https://storage.googleapis.com/wasatch-wind-static/soaring.json';
    // const response = await fetch(gcpSoaringDataUrl);
    // const data = await response.json();
    // LOCAL TESTING LINE(S) vvv
    const data = {"OD_TIME": "None", "0": {}, "REPORT_DATE": "Mon, Feb 1", "MAX_RATE_OF_LIFT": "142", "MAX_RATE_OF_LIFT_MS": "0.7 m/s", "NEG_3_INDEX": "4,900", "NEG_3_INDEX_M": "1493 m", "TOP_OF_LIFT": "5,700", "TOP_OF_LIFT_M": "1737 m"};
    // LOCAL TESTING LINE(S) ^^^
    document.getElementById('soarcast-tol').innerHTML = data.TOP_OF_LIFT;
    document.getElementById('soarcast-neg3').innerHTML = data.NEG_3_INDEX;
    document.getElementById('soarcast-rol').innerHTML = data.MAX_RATE_OF_LIFT;
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
    let position = (data.properties.periods[0].isDaytime) ? 0 : 1;
    // const maxTemp = data.properties.periods[position].temperature;
    // document.getElementById('max-temp').innerHTML = maxTemp + '&deg;';
    // if (data.properties.periods[0].isDaytime) { raob_data_gcp_storage_async(maxTemp); }
    // else { document.getElementById('skewt').innerHTML = 'Updated after next morning sounding!'; }
    // LOCAL TESTING LINE(S) vvv
    raob_data_gcp_storage_async(43);
    document.getElementById('max-temp').innerHTML = 43 + '&deg;';
    // LOCAL TESTING LINE(S) ^^^
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
    // LOCAL TESTING LINE(S) vvv
    const data = [{"Pressure_mb": 879.0, "Altitude_m": 1289, "Temp_c": -1.5, "Dewpoint_c": -4.5, "Wind_Direction": 185, "Wind_Speed_kt": 3}, {"Pressure_mb": 869.0, "Altitude_m": 1380, "Temp_c": 1.4, "Dewpoint_c": -7.6, "Wind_Direction": 175, "Wind_Speed_kt": 3}, {"Pressure_mb": 859.0, "Altitude_m": 1473, "Temp_c": 2.2, "Dewpoint_c": -8.8, "Wind_Direction": 164, "Wind_Speed_kt": 3}, {"Pressure_mb": 850.0, "Altitude_m": 1557, "Temp_c": 1.6, "Dewpoint_c": -9.4, "Wind_Direction": 155, "Wind_Speed_kt": 3}, {"Pressure_mb": 847.0, "Altitude_m": 1585, "Temp_c": 1.6, "Dewpoint_c": -9.4, "Wind_Direction": 157, "Wind_Speed_kt": 4}, {"Pressure_mb": 830.0, "Altitude_m": 1749, "Temp_c": 2.8, "Dewpoint_c": -11.2, "Wind_Direction": 169, "Wind_Speed_kt": 8}, {"Pressure_mb": 821.8, "Altitude_m": 1829, "Temp_c": 2.4, "Dewpoint_c": -11.8, "Wind_Direction": 175, "Wind_Speed_kt": 10}, {"Pressure_mb": 791.3, "Altitude_m": 2134, "Temp_c": 0.8, "Dewpoint_c": -14.1, "Wind_Direction": 175, "Wind_Speed_kt": 15}, {"Pressure_mb": 788.0, "Altitude_m": 2168, "Temp_c": 0.6, "Dewpoint_c": -14.4, "Wind_Direction": 176, "Wind_Speed_kt": 16}, {"Pressure_mb": 769.0, "Altitude_m": 2364, "Temp_c": 2.2, "Dewpoint_c": -16.8, "Wind_Direction": 179, "Wind_Speed_kt": 20}, {"Pressure_mb": 762.0, "Altitude_m": 2438, "Temp_c": 2.1, "Dewpoint_c": -17.4, "Wind_Direction": 180, "Wind_Speed_kt": 21}, {"Pressure_mb": 754.0, "Altitude_m": 2523, "Temp_c": 2.0, "Dewpoint_c": -18.0, "Wind_Direction": 186, "Wind_Speed_kt": 20}, {"Pressure_mb": 744.0, "Altitude_m": 2630, "Temp_c": 1.6, "Dewpoint_c": -26.4, "Wind_Direction": 193, "Wind_Speed_kt": 18}, {"Pressure_mb": 733.6, "Altitude_m": 2743, "Temp_c": 0.9, "Dewpoint_c": -26.4, "Wind_Direction": 200, "Wind_Speed_kt": 16}, {"Pressure_mb": 730.0, "Altitude_m": 2783, "Temp_c": 0.6, "Dewpoint_c": -26.4, "Wind_Direction": 199, "Wind_Speed_kt": 15}, {"Pressure_mb": 721.0, "Altitude_m": 2883, "Temp_c": 0.6, "Dewpoint_c": -48.4, "Wind_Direction": 198, "Wind_Speed_kt": 12}, {"Pressure_mb": 716.0, "Altitude_m": 2938, "Temp_c": 0.4, "Dewpoint_c": -34.6, "Wind_Direction": 197, "Wind_Speed_kt": 10}, {"Pressure_mb": 706.2, "Altitude_m": 3048, "Temp_c": -0.4, "Dewpoint_c": -24.2, "Wind_Direction": 195, "Wind_Speed_kt": 7}, {"Pressure_mb": 702.0, "Altitude_m": 3096, "Temp_c": -0.7, "Dewpoint_c": -19.7, "Wind_Direction": 202, "Wind_Speed_kt": 8}, {"Pressure_mb": 700.0, "Altitude_m": 3119, "Temp_c": -0.9, "Dewpoint_c": -19.9, "Wind_Direction": 205, "Wind_Speed_kt": 8}, {"Pressure_mb": 679.7, "Altitude_m": 3353, "Temp_c": -2.2, "Dewpoint_c": -15.3, "Wind_Direction": 225, "Wind_Speed_kt": 12}, {"Pressure_mb": 669.0, "Altitude_m": 3479, "Temp_c": -2.9, "Dewpoint_c": -12.9, "Wind_Direction": 233, "Wind_Speed_kt": 13}, {"Pressure_mb": 654.0, "Altitude_m": 3658, "Temp_c": -3.5, "Dewpoint_c": -14.5, "Wind_Direction": 245, "Wind_Speed_kt": 15}, {"Pressure_mb": 654.0, "Altitude_m": 3658, "Temp_c": -3.5, "Dewpoint_c": -14.5, "Wind_Direction": 245, "Wind_Speed_kt": 15}, {"Pressure_mb": 648.0, "Altitude_m": 3731, "Temp_c": -3.1, "Dewpoint_c": -18.1, "Wind_Direction": 247, "Wind_Speed_kt": 15}, {"Pressure_mb": 630.0, "Altitude_m": 3953, "Temp_c": -4.7, "Dewpoint_c": -20.7, "Wind_Direction": 255, "Wind_Speed_kt": 17}, {"Pressure_mb": 629.2, "Altitude_m": 3962, "Temp_c": -4.7, "Dewpoint_c": -21.7, "Wind_Direction": 255, "Wind_Speed_kt": 17}, {"Pressure_mb": 627.0, "Altitude_m": 3990, "Temp_c": -4.7, "Dewpoint_c": -24.7, "Wind_Direction": 255, "Wind_Speed_kt": 17}, {"Pressure_mb": 614.0, "Altitude_m": 4154, "Temp_c": -5.7, "Dewpoint_c": -29.7, "Wind_Direction": 252, "Wind_Speed_kt": 20}, {"Pressure_mb": 605.2, "Altitude_m": 4267, "Temp_c": -6.6, "Dewpoint_c": -29.5, "Wind_Direction": 250, "Wind_Speed_kt": 21}, {"Pressure_mb": 584.0, "Altitude_m": 4544, "Temp_c": -8.9, "Dewpoint_c": -28.9, "Wind_Direction": 259, "Wind_Speed_kt": 22}, {"Pressure_mb": 581.9, "Altitude_m": 4572, "Temp_c": -8.9, "Dewpoint_c": -28.9, "Wind_Direction": 260, "Wind_Speed_kt": 22}, {"Pressure_mb": 577.0, "Altitude_m": 4637, "Temp_c": -8.9, "Dewpoint_c": -28.9, "Wind_Direction": 258, "Wind_Speed_kt": 23}, {"Pressure_mb": 575.0, "Altitude_m": 4664, "Temp_c": -8.9, "Dewpoint_c": -24.9, "Wind_Direction": 257, "Wind_Speed_kt": 23}, {"Pressure_mb": 559.3, "Altitude_m": 4877, "Temp_c": -10.3, "Dewpoint_c": -24.4, "Wind_Direction": 250, "Wind_Speed_kt": 26}, {"Pressure_mb": 542.0, "Altitude_m": 5119, "Temp_c": -11.9, "Dewpoint_c": -23.9, "Wind_Direction": 244, "Wind_Speed_kt": 27}, {"Pressure_mb": 535.0, "Altitude_m": 5218, "Temp_c": -12.3, "Dewpoint_c": -25.3, "Wind_Direction": 242, "Wind_Speed_kt": 27}, {"Pressure_mb": 516.4, "Altitude_m": 5486, "Temp_c": -14.5, "Dewpoint_c": -23.6, "Wind_Direction": 235, "Wind_Speed_kt": 28}];
    // LOCAL TESTING LINE(S) ^^^
    const dalr = 5.38;
    draw_lapse_chart(data, maxTemp, dalr);
    document.getElementById('thermal-max-height-forecast').innerHTML = calculate_max_height_of_thermal(data, maxTemp, dalr);
}

async function wind_aloft_gcp_function_async() {
    // const gcpWindAloftFuncUrl = 'https://us-central1-wasatchwind.cloudfunctions.net/wind-aloft-ftp-012721';
    // const response = await fetch(gcpWindAloftFuncUrl);
    // const data = await response.json();
    // LOCAL TESTING LINE(S) vvv
    const data = {"Directions_6k_9k_12k_18k":[170,210,220,250],"End":"8 pm","Speeds_6k_9k_12k_18k":[10,16,23,35],"Start":"1 pm","Temps_9k_12k_18k":[36,25,3]};
    // LOCAL TESTING LINE(S) ^^^
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
    const linkURL = 'https://www.aviationweather.gov/windtemp/data?level=low&fcst=' + range + '&region=slc&layout=on&date=';
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
get_surface_wind_map_image_gcp_async();
noaa_time_series_api_async();
get_soaring_forecast_gcp_async();
noaa_three_day_forecast_api_async();
wind_aloft_gcp_function_async();

// --------------------------------------------------------------------
// TODO:
// Use sunset? OpenWeatherMaps or public API
// Other stations like v1?
// Soaring forecast? OD? Use RAOB data?
// Jeff's terrain formula? http://www.wasatchfreeflight.org/index.php/paragliding-the-energy-equation/
// Forecasts? Pressure? Wind?
// Site/locale specific options?
// Fronts map?
// Temps from wind aloft?
// Wind from RAOB data?



// --------------------------------------------------------------------
// GCP storage soarcast: 'https://storage.googleapis.com/wasatch-wind-static/soaring.json'

// Open Weather Maps History: API: 'https://openweathermap.org/api/one-call-api';
//      let startTime = (now.getTime() / 1000).toFixed(0) - 7200;
//      URL: https://api.openweathermap.org/data/2.5/onecall/timemachine?lat=40.77&lon=-111.97&dt=' + startTime + '&units=imperial&appid=b6a86a0bc25e260e4db9c7f98654ad08'
//      let timestamp = new Date(openweatherHistoryData.current.dt * 1000);
//      timestamp = timestamp.toLocaleString();

// Open Weather Maps Foreccast:
//      URL: 'https://api.openweathermap.org/data/2.5/onecall?lat=40.77&lon=-111.97&exclude=current,minutely,hourly&units=imperial&appid=b6a86a0bc25e260e4db9c7f98654ad08'

// Climacell: API: 'https://developer.climacell.co/v3/reference'
//      let minutes = -60; // toggle +/- for forecast/history
//      let time = now;
//      time.setMinutes(time.getMinutes() + minutes);
//      time = time.toISOString();
//      time = '2021-01-18T14:09:50Z';
//      HISTORICAL general area with timestep (use - minutes eg -60)
//      let url = 'https://api.climacell.co/v3/weather/historical/climacell?lat=40.777239&lon=-111.965081&timestep=5&unit_system=us&start_time=' + time + '&end_time=now&fields=wind_speed,wind_gust,wind_direction,temp,baro_pressure&apikey=ClRvGEOBEMaIikz6WIfEy0VEtZkp7Zim';
//      HISTORICAL KSLC (use - minutes eg -60)
//      let url = 'https://api.climacell.co/v3/weather/historical/station?lat=40.777239&lon=-111.965081&unit_system=us&start_time=' + time + '&end_time=now&fields=wind_speed,wind_gust,wind_direction,temp,baro_pressure&apikey=ClRvGEOBEMaIikz6WIfEy0VEtZkp7Zim';
//      FORECAST general area with timestep (use + minutes eg 30)
//      let url = 'https://api.climacell.co/v3/weather/nowcast?lat=40.777239&lon=-111.965081&unit_system=us&timestep=5&start_time=now&end_time=' + time + '&fields=wind_speed,wind_gust,wind_direction,temp,baro_pressure&apikey=ClRvGEOBEMaIikz6WIfEy0VEtZkp7Zim';
//      FORECAST general area hourly (use + minutes eg 360)
//      let url = 'https://api.climacell.co/v3/weather/forecast/hourly?lat=40.777239&lon=-111.965081&unit_system=us&start_time=now&end_time=' + time + '&fields=wind_speed,wind_gust,wind_direction,temp,baro_pressure&apikey=ClRvGEOBEMaIikz6WIfEy0VEtZkp7Zim';
//      FORECAST general area daily (use + minutes eg 100000)
//      let url = 'https://api.climacell.co/v3/weather/forecast/daily?lat=40.777239&lon=-111.965081&unit_system=us&start_time=now&end_time=' + time + '&fields=temp&apikey=ClRvGEOBEMaIikz6WIfEy0VEtZkp7Zim';
