const now = new Date();
document.getElementById('date').innerHTML = now.toLocaleString('en-us', {weekday: 'short', month: 'short', day: 'numeric'});

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
    if (div.style.display === 'block') { div.style.display = 'none'; } else { div.style.display = 'block'; }
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

function noaa_three_day_forecast_api() {
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
    let timeString = (now.getHours() > 18 || now.getHours() < 7) ? 5 : 1;
    let url = 'https://graphical.weather.gov/images/slc/';
    for (i=0; i<4; i++) {
        document.getElementById('graphical-wind-' + i).src = url + 'WindSpd' + (timeString + i) + '_slc.png';
        document.getElementById('graphical-sky-' + i).src = url + 'Sky' + (timeString + i) + '_slc.png';
        document.getElementById('graphical-wx-' + i).src = url + 'Wx' + (timeString + i) + '_slc.png';
    }
}

function morning_skew_t_today() {
    let dateString = now.toLocaleDateString('en-ZA').replaceAll('/', '');
    let skewTurl = 'https://climate.cod.edu/data/raob/KSLC/skewt/KSLC.skewt.' + dateString + '.12.gif';
    skewTurl = (now.getHours() < 7) ? 'images/unskewt.png' : skewTurl;
    document.getElementById('skew-t').src = skewTurl;
}

function set_wind_aloft_link() {
    let range = '06';
    range = (now.getHours() > 3 && now.getHours() < 13) ? '12' : (now.getHours() > 18 || now.getHours() < 4) ? '24' : range;
    let linkURL = 'https://www.aviationweather.gov/windtemp/data?level=low&fcst=' + range + '&region=slc&layout=on&date=';
    document.getElementById('wind-aloft-link').setAttribute('href', linkURL);
}

function wind_aloft_gcp_function() {
    let url = 'https://us-central1-wasatchwind.cloudfunctions.net/wind-aloft-ftp-122620';
    $.get(url, function(data) {
        // let data = [{"Start":"2 pm"},{"End":"11 pm"},{"Direction":"calm"},{"Direction":"calm"},{"Direction":320},{"Direction":10},{"Speed(mph)":0},{"Speed(mph)":0},{"Speed(mph)":7},{"Speed(mph)":17},{"Temp(F)":21},{"Temp(F)":14},{"Temp(F)":-2}];
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
            document.getElementById('barwidth-' + i).style.color = 'red';
            document.getElementById('barwidth-' + i).style.width = data[i+6]['Speed(mph)']*0.6 + '%';
        }
    });
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

function raob_data_gcp_storage() {
    let url = 'https://storage.googleapis.com/wasatch-wind-static/raob.json';
    $.get(url, function(data) {
        // let data = [{"Pressure_mb": 881.0, "Altitude_m": 1289, "Temp_c": -4.3, "Dewpoint_c": -5.8, "Wind_Direction": 0, "Wind_Speed_kt": 0}, {"Pressure_mb": 879.0, "Altitude_m": 1307, "Temp_c": -3.7, "Dewpoint_c": -6.8, "Wind_Direction": 10, "Wind_Speed_kt": 0}, {"Pressure_mb": 872.0, "Altitude_m": 1371, "Temp_c": -2.3, "Dewpoint_c": -6.5, "Wind_Direction": 43, "Wind_Speed_kt": 1}, {"Pressure_mb": 850.0, "Altitude_m": 1577, "Temp_c": -3.1, "Dewpoint_c": -6.9, "Wind_Direction": 150, "Wind_Speed_kt": 3}, {"Pressure_mb": 838.0, "Altitude_m": 1690, "Temp_c": -3.1, "Dewpoint_c": -8.0, "Wind_Direction": 92, "Wind_Speed_kt": 4}, {"Pressure_mb": 823.2, "Altitude_m": 1829, "Temp_c": -4.1, "Dewpoint_c": -8.6, "Wind_Direction": 20, "Wind_Speed_kt": 6}, {"Pressure_mb": 791.6, "Altitude_m": 2134, "Temp_c": -6.4, "Dewpoint_c": -9.7, "Wind_Direction": 310, "Wind_Speed_kt": 3}, {"Pressure_mb": 761.4, "Altitude_m": 2438, "Temp_c": -8.7, "Dewpoint_c": -10.9, "Wind_Direction": 310, "Wind_Speed_kt": 4}, {"Pressure_mb": 733.0, "Altitude_m": 2735, "Temp_c": -10.9, "Dewpoint_c": -12.1, "Wind_Direction": 325, "Wind_Speed_kt": 5}, {"Pressure_mb": 732.2, "Altitude_m": 2743, "Temp_c": -10.9, "Dewpoint_c": -12.2, "Wind_Direction": 325, "Wind_Speed_kt": 5}, {"Pressure_mb": 723.0, "Altitude_m": 2840, "Temp_c": -10.7, "Dewpoint_c": -12.8, "Wind_Direction": 338, "Wind_Speed_kt": 6}, {"Pressure_mb": 718.0, "Altitude_m": 2894, "Temp_c": -9.9, "Dewpoint_c": -14.2, "Wind_Direction": 345, "Wind_Speed_kt": 6}, {"Pressure_mb": 710.0, "Altitude_m": 2980, "Temp_c": -7.9, "Dewpoint_c": -20.9, "Wind_Direction": 356, "Wind_Speed_kt": 7}, {"Pressure_mb": 707.0, "Altitude_m": 3013, "Temp_c": -7.3, "Dewpoint_c": -22.3, "Wind_Direction": 0, "Wind_Speed_kt": 7}, {"Pressure_mb": 703.0, "Altitude_m": 3058, "Temp_c": -7.1, "Dewpoint_c": -20.1, "Wind_Direction": 6, "Wind_Speed_kt": 8}, {"Pressure_mb": 700.0, "Altitude_m": 3091, "Temp_c": -7.1, "Dewpoint_c": -18.1, "Wind_Direction": 10, "Wind_Speed_kt": 8}, {"Pressure_mb": 695.0, "Altitude_m": 3147, "Temp_c": -7.7, "Dewpoint_c": -17.7, "Wind_Direction": 10, "Wind_Speed_kt": 8}, {"Pressure_mb": 682.0, "Altitude_m": 3294, "Temp_c": -8.1, "Dewpoint_c": -21.1, "Wind_Direction": 10, "Wind_Speed_kt": 9}, {"Pressure_mb": 673.0, "Altitude_m": 3397, "Temp_c": -8.5, "Dewpoint_c": -20.5, "Wind_Direction": 10, "Wind_Speed_kt": 10}, {"Pressure_mb": 663.0, "Altitude_m": 3513, "Temp_c": -8.7, "Dewpoint_c": -23.7, "Wind_Direction": 10, "Wind_Speed_kt": 11}, {"Pressure_mb": 650.7, "Altitude_m": 3658, "Temp_c": -9.7, "Dewpoint_c": -23.8, "Wind_Direction": 10, "Wind_Speed_kt": 12}, {"Pressure_mb": 637.0, "Altitude_m": 3822, "Temp_c": -10.9, "Dewpoint_c": -23.9, "Wind_Direction": 2, "Wind_Speed_kt": 12}, {"Pressure_mb": 625.0, "Altitude_m": 3968, "Temp_c": -11.5, "Dewpoint_c": -26.5, "Wind_Direction": 355, "Wind_Speed_kt": 13}, {"Pressure_mb": 612.0, "Altitude_m": 4130, "Temp_c": -11.5, "Dewpoint_c": -38.5, "Wind_Direction": 347, "Wind_Speed_kt": 13}, {"Pressure_mb": 603.0, "Altitude_m": 4243, "Temp_c": -12.1, "Dewpoint_c": -40.1, "Wind_Direction": 341, "Wind_Speed_kt": 13}, {"Pressure_mb": 601.1, "Altitude_m": 4267, "Temp_c": -12.3, "Dewpoint_c": -40.3, "Wind_Direction": 340, "Wind_Speed_kt": 13}, {"Pressure_mb": 554.5, "Altitude_m": 4877, "Temp_c": -16.9, "Dewpoint_c": -46.3, "Wind_Direction": 0, "Wind_Speed_kt": 12}, {"Pressure_mb": 537.0, "Altitude_m": 5119, "Temp_c": -18.7, "Dewpoint_c": -48.7, "Wind_Direction": 2, "Wind_Speed_kt": 16}, {"Pressure_mb": 522.0, "Altitude_m": 5331, "Temp_c": -18.9, "Dewpoint_c": -58.9, "Wind_Direction": 3, "Wind_Speed_kt": 20}, {"Pressure_mb": 500.0, "Altitude_m": 5650, "Temp_c": -21.5, "Dewpoint_c": -46.5, "Wind_Direction": 5, "Wind_Speed_kt": 26}, {"Pressure_mb": 496.0, "Altitude_m": 5709, "Temp_c": -21.9, "Dewpoint_c": -46.9, "Wind_Direction": 5, "Wind_Speed_kt": 28}, {"Pressure_mb": 470.5, "Altitude_m": 6096, "Temp_c": -23.9, "Dewpoint_c": -59.6, "Wind_Direction": 5, "Wind_Speed_kt": 40}, {"Pressure_mb": 463.0, "Altitude_m": 6213, "Temp_c": -24.5, "Dewpoint_c": -63.5, "Wind_Direction": 5, "Wind_Speed_kt": 42}, {"Pressure_mb": 442.0, "Altitude_m": 6551, "Temp_c": -24.9, "Dewpoint_c": -66.9, "Wind_Direction": 3, "Wind_Speed_kt": 49}, {"Pressure_mb": 415.0, "Altitude_m": 7006, "Temp_c": -27.5, "Dewpoint_c": -68.5, "Wind_Direction": 1, "Wind_Speed_kt": 59}, {"Pressure_mb": 400.0, "Altitude_m": 7270, "Temp_c": -29.5, "Dewpoint_c": -66.5, "Wind_Direction": 0, "Wind_Speed_kt": 64}, {"Pressure_mb": 397.4, "Altitude_m": 7315, "Temp_c": -29.9, "Dewpoint_c": -66.6, "Wind_Direction": 355, "Wind_Speed_kt": 66}, {"Pressure_mb": 380.3, "Altitude_m": 7620, "Temp_c": -32.6, "Dewpoint_c": -67.2, "Wind_Direction": 355, "Wind_Speed_kt": 65}];
        let maxTemp = 35;
        let dalr = 5.38;
        draw_lapse_chart(data, maxTemp, dalr);
        calculate_max_height_of_thermal(data, maxTemp, dalr, 'thermal-max-height-forecast');
        document.getElementById('max-forecast-temp').innerHTML = maxTemp + ' \u00B0F';
    });
}

function calculate_max_height_of_thermal (raobData, maxTemp, dalr, elementID) {
    let maxPosition = 0;
    // Determine the position of the sounding data where it crosses the DALR to obtain interpolation points
    while ((maxTemp-(((raobData[maxPosition].Altitude_m-raobData[0].Altitude_m)*3.281/1000)*5.38)) > ((raobData[maxPosition].Temp_c*9/5)+32)) {
        maxPosition++;
    }
    let yIntercept = (maxTemp/dalr)+4.229; // Find y-intercept for given max temp
    let dalrSlope = -1/dalr;
    let x1 = ((raobData[maxPosition].Temp_c*9/5)+32);
    let y1 = raobData[maxPosition].Altitude_m*3.281/1000;
    let x2 = ((raobData[maxPosition-1].Temp_c*9/5)+32);
    let y2 = raobData[maxPosition-1].Altitude_m*3.281/1000;
    let thermalMaxHeight = Math.round((dalrSlope*((((x2-x1)/(y2-y1)*(y1-yIntercept))-x1)/((((x2-x1)/(y2-y1))*dalrSlope)-1))+yIntercept)*1000);
    document.getElementById(elementID).innerHTML = thermalMaxHeight + ' ft MSL';
}




mesonet_latest_data_api();
noaa_three_day_forecast_api();
graphical_forecast_images();
morning_skew_t_today();
wind_aloft_gcp_function();
determine_wind_map_time();
raob_data_gcp_storage();
