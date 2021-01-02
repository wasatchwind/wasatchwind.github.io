const now = new Date();
document.getElementById('date').innerHTML = now.toLocaleString('en-us', {weekday: 'short', month: 'short', day: 'numeric'});
document.getElementById('time').innerHTML = now.toLocaleTimeString([], {hour: 'numeric', minute: '2-digit'}).toLowerCase();

function mesonet_latest_api() { // https://developers.synopticdata.com/mesonet
    let url = 'https://api.synopticdata.com/v2/stations/latest?&stid=KSLC&obtimezone=local&timeformat=%-I:%M%20%p&vars=wind_speed,wind_gust,wind_cardinal_direction,altimeter,air_temp&units=english,speed|mph,temp|F&token=6243aadc536049fc9329c17ff2f88db3';
    $.get(url, function(data) {
        console.log(data);
        alti = data.STATION[0].OBSERVATIONS.altimeter_value_1.value.toFixed(2);
        temp = Math.round(data.STATION[0].OBSERVATIONS.air_temp_value_1.value);
        wind = Math.round(data.STATION[0].OBSERVATIONS.wind_speed_value_1.value);
        windTime = data.STATION[0].OBSERVATIONS.wind_speed_value_1.date_time;
        gustTime = data.STATION[0].OBSERVATIONS.wind_gust_value_1.date_time;
        wind = (wind === 0) ? 'Calm' : wind;
        wind = (windTime === gustTime) ? wind + 'g' + Math.round(data.STATION[0].OBSERVATIONS.wind_gust_value_1.value) : wind;
        wind = (wind === 'Calm') ? wind : data.STATION[0].OBSERVATIONS.wind_cardinal_direction_value_1d.value + ' ' + wind;
        
        document.getElementById('kslc-latest-time').innerHTML = windTime.toLowerCase();
        document.getElementById('current-pressure').innerHTML = alti;
        document.getElementById('current-temp').innerHTML = temp;
        document.getElementById('apz').innerHTML = calculate_APZ(alti, temp);
        document.getElementById('current-wind').innerHTML = wind;
    });
}

function calculate_APZ(alti, temp) {
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

mesonet_latest_api();
