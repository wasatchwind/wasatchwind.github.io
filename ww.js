const now = new Date();
document.getElementById('date').innerHTML = now.toLocaleString('en-us', {weekday: 'short', month: 'short', day: 'numeric'});
document.getElementById('time').innerHTML = now.toLocaleTimeString([], {hour: 'numeric', minute: '2-digit'}).toLowerCase();

function mesonet_latest_api() { // https://developers.synopticdata.com/mesonet
    let url = 'https://api.synopticdata.com/v2/stations/latest?&stid=KSLC&obtimezone=local&timeformat=%-I:%M%20%p&vars=wind_speed,wind_gust,wind_cardinal_direction,altimeter,air_temp&units=english,speed|mph,temp|F&token=6243aadc536049fc9329c17ff2f88db3';
    $.get(url, function(data) {
        console.log(data);
        let alti = data.STATION[0].OBSERVATIONS.altimeter_value_1.value;
        let temp = Math.round(data.STATION[0].OBSERVATIONS.air_temp_value_1.value);
        let wind = Math.round(data.STATION[0].OBSERVATIONS.wind_speed_value_1.value);
        wind = (data.STATION[0].OBSERVATIONS.wind_gust_value_1.date_time === data.STATION[0].OBSERVATIONS.wind_speed_value_1.date_time) ? wind + 'g' + data.STATION[0].OBSERVATIONS.wind_gust_value_1.value : wind;
        document.getElementById('current-pressure').innerHTML = alti;
        document.getElementById('current-temp').innerHTML = temp;
        document.getElementById('apz').innerHTML = calculate_APZ(alti, temp);
        document.getElementById('current-wind').innerHTML = data.STATION[0].OBSERVATIONS.wind_cardinal_direction_value_1d.value + ' ' + wind;
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


// Surface current wind map         SURFACE
// Wind stations current/latest     SURFACE
// Wind stations trend              TREND
// Wind aloft                       ALOFT
// Soarcast                         ALOFT
// Surface forecast wind graphical  SURFACE
// General forecast graphical       ALOFT
// Sky cover forecast graphical     ALOFT
// Hourly chart KSLC                TREND
// Multi-day forecast               TREND
// Clouds & precip gif              ALOFT
// SkewT                            ALOFT
// Jetstream                        ALOFT
// Pressure trend                   TREND
// Temp trend                       TREND
// Sunset                           TREND
// Lapse analysis                   ALOFT
// Chance of precip/OD              ALOFT

function raob_gcp_storage() {
    let url = 'https://storage.googleapis.com/wasatch-wind-static/raob.json';
    $.get(url, function(raobData) {
        console.log(raobData);
    });
}

function soarcast_gcp_storage() {
    let url = 'https://storage.googleapis.com/wasatch-wind-static/soaring.json';
    $.get(url, function(soarcastData) {
        console.log(soarcastData);
    });
}

function wind_aloft_gcp_function() {
    let url = 'https://us-central1-wasatchwind.cloudfunctions.net/wind-aloft-ftp-122620';
    $.get(url, function(windAloftData) {
        console.log(windAloftData);
    });
}

function wind_aloft_reports_gcp_function() {
    let url = 'https://us-central1-wasatchwind.cloudfunctions.net/wind-aloft-reports';
    $.get(url, function(windAloftData) {
        console.log(windAloftData);
    });
}

function time_series_api() { // https://developers.synopticdata.com/mesonet
    let url = 'https://api.mesowest.net/v2/station/timeseries?&stid=AMB&stid=KSLC&stid=REY&recent=240&obtimezone=local&timeformat=%-I:%M%20%p&vars=wind_speed,wind_gust,wind_direction,altimeter,air_temp&units=english,speed|mph,temp|F&token=6243aadc536049fc9329c17ff2f88db3';
    $.get(url, function(timeSeriesData) {
        console.log(timeSeriesData);
    });
}

function openweather_history_api() { // https://openweathermap.org/api/one-call-api
    let startTime = (now.getTime() / 1000).toFixed(0) - 7200;
    let url = 'https://api.openweathermap.org/data/2.5/onecall/timemachine?lat=40.77&lon=-111.97&dt=' + startTime + '&units=imperial&appid=b6a86a0bc25e260e4db9c7f98654ad08';
    $.get(url, function(openweatherHistoryData) {
        console.log(openweatherHistoryData);
        let timestamp = new Date(openweatherHistoryData.current.dt * 1000);
        timestamp = timestamp.toLocaleString();
        console.log('Timestamp: ' + timestamp);
    });
}

function openweather_forecast_api() { // https://openweathermap.org/api/one-call-api
    let url = 'https://api.openweathermap.org/data/2.5/onecall?lat=40.77&lon=-111.97&exclude=current,minutely,hourly&units=imperial&appid=b6a86a0bc25e260e4db9c7f98654ad08';
    $.get(url, function(openweatherForecastData) {
        console.log(openweatherForecastData);
    });
}

function noaa_three_day_api() {
    let url = 'https://api.weather.gov/gridpoints/SLC/97,175/forecast';
    $.get(url, function(noaaThreeDayData) {
        console.log(noaaThreeDayData);
    });
}

function noaa_current_conditions_kslc_api() { // Only every hour
    let url = 'https://api.weather.gov/stations/kslc/observations/latest';
    $.get(url, function(data) {
        console.log(data);
    });
}

function climacell_api() { // https://developer.climacell.co/v3/reference
    let start = new Date();
    start.setMinutes(start.getMinutes() - 30);
    start = start.toISOString();
    let url = 'https://api.climacell.co/v3/weather/historical/climacell?lat=40.777239&lon=-111.965081&timestep=1&unit_system=us&start_time=' + start + '&end_time=now&fields=wind_speed,wind_gust,wind_direction,temp,baro_pressure&apikey=ClRvGEOBEMaIikz6WIfEy0VEtZkp7Zim';
    $.get(url, function(noaaThreeDayData) {
        console.log(noaaThreeDayData);
    });
}

// raob_gcp_storage();
// soarcast_gcp_storage();
// wind_aloft_gcp_function(); // Single report
// wind_aloft_reports_gcp_function(); // All 3 reports
// time_series_api();
// openweather_history_api()
// openweather_forecast_api();
// noaa_three_day_api();
// noaa_current_conditions_kslc_api();
// climacell_api();


// Armstrong Cam: http://meso1.chpc.utah.edu/station_cameras/armstrong_cam/armstrong_cam_current.jpg
