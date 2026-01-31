// "use strict";

const ftPerMeter = 3.28084;
const now = new Date();
const nextDay = `${new Date(Date.now() + 86400000).toLocaleString("en-us", { weekday: "short" })}`;
const green = "#1E6A4B";
const yellow = "#9A7B1F";
const orange = "#B45309";
const red = "#8B1D2C";

// Nav pages
const navItems = ["Today", `${nextDay}+`, "Settings", "Misc.", "GPS", "Cams", "Now"];
let slider, activeNav = 0;

// Used for 1) Displaying station data and 2) Station on/off toggle in user settings
const stationList = {
  AMB: { name: "Alta Baldy" },
  KSVR: { name: "Airport 2" },
  BRW: { name: "Clayton Peak" },
  HDP: { name: "Hidden Peak" },
  OGP: { name: "Ogden Peak" },
  UTOLY: { name: "Olypmus Cove" },
  UT5: { name: "Parleys Mouth" },
  D6120: { name: "Pepperwood" },
  REY: { name: "Reynolds Peak" },
  FPS: { name: "Southside" }
};

// Global required for D3 Reset/Update > Visualize Other Thermal Temps (Morning Sounding Profile)
let hiTemp, liftParams = {}, soundingData = {};
const screenWidth = window.innerWidth;
const proportionalHeight = screenWidth * 0.67;
const margin = {
  top: proportionalHeight * 0.04,
  bottom: proportionalHeight * 0.08,
  left: screenWidth * 0.02,
  right: screenWidth * 0.027
};
const windBarbs = margin.left * 4.5;
const width = screenWidth - margin.left - margin.right;
const height = proportionalHeight - margin.top - margin.bottom;
const surfaceAlt = 4.229;
const maxAlt = 20;
const x = d3.scaleLinear().range([0, width - margin.left - margin.right - windBarbs]).domain([-10, 110]);
const y = d3.scaleLinear().range([height, 0]).domain([surfaceAlt, maxAlt]);
const svg = d3.select("#skew-t-d3")
  .append("svg")
  .attr("class", "svgbg")
  .attr("width", width)
  .attr("height", proportionalHeight)
  .append("g")
  .attr("transform", `translate(${margin.left + windBarbs},${margin.top})`);



// For testing - Remove in prod
const data = {
  "openMeteo": {
    "latitude": 40.764416,
    "longitude": -111.981255,
    "generationtime_ms": 9.914994239807129,
    "utc_offset_seconds": -25200,
    "timezone": "America/Denver",
    "timezone_abbreviation": "GMT-7",
    "elevation": 1288,
    "hourly_units": {
      "time": "iso8601",
      "boundary_layer_height": "m",
      "cape": "J/kg",
      "lifted_index": "",
      "wind_speed_10m": "mp/h",
      "wind_direction_10m": "°",
      "windspeed_875hPa": "mp/h",
      "windspeed_850hPa": "mp/h",
      "windspeed_825hPa": "mp/h",
      "windspeed_800hPa": "mp/h",
      "windspeed_775hPa": "mp/h",
      "windspeed_750hPa": "mp/h",
      "windspeed_700hPa": "mp/h",
      "windspeed_625hPa": "mp/h",
      "winddirection_875hPa": "°",
      "winddirection_850hPa": "°",
      "winddirection_825hPa": "°",
      "winddirection_800hPa": "°",
      "winddirection_775hPa": "°",
      "winddirection_750hPa": "°",
      "winddirection_700hPa": "°",
      "winddirection_625hPa": "°",
      "geopotential_height_875hPa": "m",
      "geopotential_height_850hPa": "m",
      "geopotential_height_825hPa": "m",
      "geopotential_height_800hPa": "m",
      "geopotential_height_775hPa": "m",
      "geopotential_height_750hPa": "m",
      "geopotential_height_725hPa": "m",
      "geopotential_height_700hPa": "m",
      "geopotential_height_675hPa": "m",
      "geopotential_height_650hPa": "m",
      "geopotential_height_625hPa": "m",
      "geopotential_height_600hPa": "m",
      "vertical_velocity_875hPa": "m/s",
      "vertical_velocity_850hPa": "m/s",
      "vertical_velocity_825hPa": "m/s",
      "vertical_velocity_800hPa": "m/s",
      "vertical_velocity_775hPa": "m/s",
      "vertical_velocity_750hPa": "m/s",
      "vertical_velocity_725hPa": "m/s",
      "vertical_velocity_700hPa": "m/s",
      "vertical_velocity_675hPa": "m/s",
      "vertical_velocity_650hPa": "m/s",
      "vertical_velocity_625hPa": "m/s",
      "vertical_velocity_600hPa": "m/s"
    },
    "hourly": {
      "time": [
        "2026-01-30T19:00",
        "2026-01-30T20:00",
        "2026-01-30T21:00",
        "2026-01-30T22:00",
        "2026-01-30T23:00",
        "2026-01-31T00:00",
        "2026-01-31T01:00",
        "2026-01-31T02:00",
        "2026-01-31T03:00",
        "2026-01-31T04:00",
        "2026-01-31T05:00",
        "2026-01-31T06:00"
      ],
      "boundary_layer_height": [
        95,
        50,
        65,
        45,
        45,
        40,
        35,
        35,
        30,
        35,
        30,
        25
      ],
      "cape": [
        0,
        0,
        0,
        0,
        0,
        0,
        0,
        0,
        0,
        0,
        0,
        0
      ],
      "lifted_index": [
        12.5,
        13.2,
        14.2,
        15.3,
        15.6,
        15.4,
        15.6,
        16.3,
        16.4,
        16.2,
        16.2,
        16.9
      ],
      "wind_speed_10m": [
        3.7,
        4.6,
        1.6,
        4,
        3.6,
        2.5,
        2.5,
        2.5,
        2.9,
        2.1,
        0.7,
        4
      ],
      "wind_direction_10m": [
        335,
        241,
        188,
        137,
        120,
        153,
        153,
        180,
        356,
        319,
        252,
        164
      ],
      "windspeed_875hPa": [
        0.4,
        2.2,
        2.5,
        2.2,
        1.6,
        1.4,
        1.5,
        1.4,
        0.9,
        0.6,
        0.8,
        1.1
      ],
      "windspeed_850hPa": [
        3.4,
        5.3,
        5.4,
        5.5,
        6.3,
        6.7,
        7.9,
        7.4,
        5.7,
        4.8,
        4.8,
        4.6
      ],
      "windspeed_825hPa": [
        4.5,
        6.6,
        6.8,
        7.1,
        8.6,
        9.5,
        10.1,
        11,
        10.1,
        9.5,
        9.5,
        8.9
      ],
      "windspeed_800hPa": [
        4.6,
        5.7,
        6.3,
        6.5,
        7.4,
        6.6,
        6.9,
        7.8,
        7.7,
        8.5,
        8.1,
        7.3
      ],
      "windspeed_775hPa": [
        5.6,
        6,
        7,
        7,
        7.4,
        6.3,
        5.7,
        5.1,
        5.7,
        6.4,
        6.1,
        5.6
      ],
      "windspeed_750hPa": [
        8,
        8.8,
        9.8,
        10.4,
        11.7,
        12,
        12.1,
        11.1,
        11.8,
        12.7,
        12.8,
        12.9
      ],
      "windspeed_700hPa": [
        15.9,
        15.9,
        16.1,
        17.5,
        19.7,
        21,
        20.9,
        19.2,
        19.2,
        19.5,
        20.1,
        20
      ],
      "windspeed_625hPa": [
        30.3,
        28.3,
        28.1,
        28.2,
        27.6,
        28.8,
        30,
        31.3,
        31.3,
        33.3,
        36,
        36
      ],
      "winddirection_875hPa": [
        315,
        180,
        186,
        166,
        189,
        127,
        158,
        169,
        252,
        297,
        135,
        166
      ],
      "winddirection_850hPa": [
        132,
        155,
        162,
        159,
        172,
        168,
        176,
        173,
        180,
        183,
        177,
        173
      ],
      "winddirection_825hPa": [
        169,
        172,
        178,
        178,
        186,
        180,
        180,
        178,
        183,
        185,
        182,
        182
      ],
      "winddirection_800hPa": [
        208,
        202,
        207,
        205,
        202,
        191,
        188,
        185,
        194,
        197,
        196,
        192
      ],
      "winddirection_775hPa": [
        260,
        257,
        257,
        257,
        255,
        261,
        257,
        255,
        257,
        255,
        254,
        260
      ],
      "winddirection_750hPa": [
        301,
        296,
        288,
        285,
        284,
        288,
        290,
        292,
        291,
        289,
        290,
        295
      ],
      "winddirection_700hPa": [
        331,
        319,
        312,
        310,
        305,
        306,
        308,
        310,
        308,
        308,
        308,
        311
      ],
      "winddirection_625hPa": [
        334,
        330,
        329,
        327,
        323,
        320,
        318,
        317,
        316,
        314,
        313,
        314
      ],
      "geopotential_height_875hPa": [
        1363,
        1370,
        1367,
        1363,
        1360,
        1361,
        1359,
        1354,
        1362,
        1358,
        1354,
        1356
      ],
      "geopotential_height_850hPa": [
        1599,
        1606,
        1603,
        1600,
        1597,
        1597,
        1595,
        1590,
        1598,
        1594,
        1590,
        1592
      ],
      "geopotential_height_825hPa": [
        1841,
        1849,
        1846,
        1843,
        1840,
        1840,
        1838,
        1833,
        1842,
        1837,
        1833,
        1836
      ],
      "geopotential_height_800hPa": [
        2090,
        2098,
        2095,
        2093,
        2090,
        2090,
        2088,
        2083,
        2092,
        2087,
        2083,
        2086
      ],
      "geopotential_height_775hPa": [
        2345,
        2354,
        2352,
        2349,
        2346,
        2346,
        2345,
        2340,
        2348,
        2344,
        2340,
        2343
      ],
      "geopotential_height_750hPa": [
        2608,
        2617,
        2615,
        2612,
        2610,
        2610,
        2609,
        2604,
        2612,
        2608,
        2604,
        2607
      ],
      "geopotential_height_725hPa": [
        2879,
        2888,
        2886,
        2884,
        2881,
        2882,
        2880,
        2876,
        2884,
        2879,
        2875,
        2878
      ],
      "geopotential_height_700hPa": [
        3158,
        3168,
        3166,
        3163,
        3161,
        3161,
        3160,
        3156,
        3163,
        3158,
        3154,
        3157
      ],
      "geopotential_height_675hPa": [
        3446,
        3456,
        3454,
        3452,
        3449,
        3450,
        3448,
        3444,
        3452,
        3446,
        3442,
        3445
      ],
      "geopotential_height_650hPa": [
        3743,
        3753,
        3751,
        3749,
        3746,
        3747,
        3746,
        3741,
        3749,
        3744,
        3740,
        3743
      ],
      "geopotential_height_625hPa": [
        4051,
        4060,
        4059,
        4056,
        4053,
        4054,
        4052,
        4048,
        4056,
        4051,
        4047,
        4050
      ],
      "geopotential_height_600hPa": [
        4367,
        4377,
        4375,
        4373,
        4370,
        4370,
        4369,
        4366,
        4373,
        4368,
        4364,
        4367
      ],
      "vertical_velocity_875hPa": [
        -0.01,
        -0.03,
        -0.02,
        -0.01,
        -0.02,
        -0.01,
        -0.02,
        -0.02,
        -0.01,
        -0.01,
        -0.02,
        -0.01
      ],
      "vertical_velocity_850hPa": [
        -0.01,
        -0.03,
        -0.02,
        -0.02,
        -0.02,
        -0.02,
        -0.02,
        -0.01,
        0,
        -0.01,
        -0.02,
        -0.01
      ],
      "vertical_velocity_825hPa": [
        -0.01,
        -0.02,
        -0.02,
        -0.01,
        -0.01,
        -0.01,
        -0.01,
        0,
        0.01,
        0,
        -0.02,
        -0.01
      ],
      "vertical_velocity_800hPa": [
        -0.02,
        -0.01,
        -0.02,
        0,
        0,
        0,
        0,
        0,
        0.02,
        0.01,
        -0.01,
        -0.01
      ],
      "vertical_velocity_775hPa": [
        -0.02,
        0,
        0,
        0.01,
        0,
        0.01,
        0,
        0,
        0.02,
        0.02,
        0,
        0
      ],
      "vertical_velocity_750hPa": [
        -0.02,
        0.01,
        0.01,
        0.02,
        0,
        0.01,
        0,
        0,
        0.03,
        0.03,
        0.01,
        0.01
      ],
      "vertical_velocity_725hPa": [
        -0.01,
        0.01,
        0.01,
        0.02,
        0,
        0.01,
        0,
        0,
        0.03,
        0.03,
        0.01,
        0.01
      ],
      "vertical_velocity_700hPa": [
        0,
        0.01,
        0.01,
        0.02,
        -0.01,
        0,
        -0.01,
        0,
        0.02,
        0.02,
        0.01,
        0.02
      ],
      "vertical_velocity_675hPa": [
        0,
        0,
        0,
        0.02,
        -0.02,
        0,
        -0.01,
        0.01,
        0.02,
        0.02,
        0.02,
        0.03
      ],
      "vertical_velocity_650hPa": [
        0.01,
        -0.01,
        0,
        0.02,
        -0.02,
        -0.01,
        0,
        0.01,
        0.01,
        0.01,
        0.01,
        0.03
      ],
      "vertical_velocity_625hPa": [
        0,
        -0.02,
        -0.01,
        0.01,
        -0.02,
        0,
        0,
        0.02,
        0.01,
        0,
        0.01,
        0.03
      ],
      "vertical_velocity_600hPa": [
        0,
        -0.03,
        -0.02,
        0,
        -0.02,
        0,
        0.01,
        0.02,
        0,
        0,
        0.01,
        0.03
      ],
      "winddirection_9000": [
        270,
        270,
        270,
        270,
        270,
        270,
        270,
        290,
        290,
        290,
        290,
        290
      ],
      "windspeed_9000": [
        14,
        14,
        14,
        14,
        14,
        14,
        14,
        21,
        21,
        21,
        21,
        21
      ],
      "winddirection_12000": [
        310,
        310,
        310,
        310,
        310,
        310,
        310,
        300,
        300,
        300,
        300,
        300
      ],
      "windspeed_12000": [
        28,
        28,
        28,
        28,
        28,
        28,
        28,
        36,
        36,
        36,
        36,
        36
      ],
      "winddirection_18000": [
        310,
        310,
        310,
        310,
        310,
        310,
        310,
        310,
        310,
        310,
        310,
        310
      ],
      "windspeed_18000": [
        47,
        47,
        47,
        47,
        47,
        47,
        47,
        67,
        67,
        67,
        67,
        67
      ]
    },
    "daily_units": {
      "time": "iso8601",
      "sunset": "iso8601",
      "temperature_2m_max": "°F",
      "wind_gusts_10m_max": "mp/h",
      "wind_speed_10m_max": "mp/h"
    },
    "daily": {
      "time": [
        "2026-01-30"
      ],
      "sunset": [
        "2026-01-30T17:42"
      ],
      "temperature_2m_max": [
        44.4
      ],
      "wind_gusts_10m_max": [
        8.3
      ],
      "wind_speed_10m_max": [
        6.7
      ]
    }
  },
  "synopticTimeseries": {
    "STATION": [
      {
        "ID": "53",
        "STID": "KSLC",
        "NAME": "Salt Lake City, Salt Lake City International Airport",
        "ELEVATION": "4226.0",
        "LATITUDE": "40.77069",
        "LONGITUDE": "-111.96503",
        "STATUS": "ACTIVE",
        "MNET_ID": "1",
        "STATE": "UT",
        "COUNTRY": "US",
        "TIMEZONE": "America/Denver",
        "ELEV_DEM": "4235.6",
        "PERIOD_OF_RECORD": {
          "start": "1997-01-01T00:00:00Z",
          "end": "2026-01-31T01:40:00Z"
        },
        "UNITS": {
          "position": "ft",
          "elevation": "ft"
        },
        "SENSOR_VARIABLES": {
          "air_temp": {
            "air_temp_set_1": {}
          },
          "wind_speed": {
            "wind_speed_set_1": {}
          },
          "wind_direction": {
            "wind_direction_set_1": {}
          },
          "altimeter": {
            "altimeter_set_1": {}
          }
        },
        "OBSERVATIONS": {
          "date_time": [
            "6:05 PM",
            "6:10 PM",
            "6:15 PM",
            "6:20 PM",
            "6:25 PM",
            "6:30 PM",
            "6:35 PM",
            "6:40 PM",
            "6:45 PM",
            "6:50 PM",
            "6:54 PM",
            "6:55 PM",
            "6:55 PM"
          ],
          "air_temp_set_1": [
            39.2,
            37.4,
            37.4,
            37.4,
            37.4,
            37.4,
            35.6,
            35.6,
            35.6,
            37.4,
            37.04,
            37.4
          ],
          "wind_speed_set_1": [
            0,
            3.45,
            0,
            0,
            3.45,
            3.45,
            3.45,
            0,
            0,
            3.45,
            3.45,
            4.6,
            4.6
          ],
          "wind_direction_set_1": [
            0,
            360,
            0,
            0,
            10,
            360,
            10,
            0,
            0,
            10,
            360,
            350,
            350
          ],
          "altimeter_set_1": [
            30.46,
            30.46,
            30.46,
            30.46,
            30.46,
            30.46,
            30.46,
            30.46,
            30.46,
            30.46,
            30.46,
            30.46
          ],
          "wind_gust_set_1": [
            null,
            null,
            null,
            null,
            null,
            null,
            null,
            null,
            null,
            null,
            null,
            null,
            null
          ]
        },
        "QC_FLAGGED": false,
        "RESTRICTED": false,
        "RESTRICTED_METADATA": false
      },
      {
        "ID": "54",
        "STID": "KSVR",
        "NAME": "South Valley Regional Airport",
        "ELEVATION": "4596.0",
        "LATITUDE": "40.61960",
        "LONGITUDE": "-111.99016",
        "STATUS": "ACTIVE",
        "MNET_ID": "1",
        "STATE": "UT",
        "COUNTRY": "US",
        "TIMEZONE": "America/Denver",
        "ELEV_DEM": "4603.0",
        "PERIOD_OF_RECORD": {
          "start": "1997-01-01T00:00:00Z",
          "end": "2026-01-31T01:35:00Z"
        },
        "UNITS": {
          "position": "ft",
          "elevation": "ft"
        },
        "SENSOR_VARIABLES": {
          "air_temp": {
            "air_temp_set_1": {}
          },
          "wind_speed": {
            "wind_speed_set_1": {}
          },
          "wind_direction": {
            "wind_direction_set_1": {}
          },
          "altimeter": {
            "altimeter_set_1": {}
          }
        },
        "OBSERVATIONS": {
          "date_time": [
            "3:15 PM",
            "3:35 PM",
            "3:55 PM",
            "4:15 PM",
            "4:35 PM",
            "4:55 PM",
            "5:15 PM",
            "5:35 PM",
            "5:55 PM",
            "6:15 PM",
            "6:35 PM",
            "6:55 PM",
            "6:55 PM"
          ],
          "air_temp_set_1": [
            42.8,
            42.8,
            42.8,
            42.8,
            41,
            39.2,
            41,
            41,
            41,
            41,
            37.4,
            39.2
          ],
          "wind_speed_set_1": [
            10.36,
            8.06,
            6.91,
            4.6,
            4.6,
            3.45,
            1.15,
            1.15,
            2.3,
            4.6,
            2.3,
            0,
            0
          ],
          "wind_direction_set_1": [
            340,
            330,
            350,
            340,
            340,
            320,
            null,
            200,
            160,
            100,
            130,
            0,
            0
          ],
          "altimeter_set_1": [
            30.48,
            30.48,
            30.48,
            30.48,
            30.47,
            30.47,
            30.47,
            30.46,
            30.46,
            30.47,
            30.46,
            30.46
          ],
          "wind_gust_set_1": [
            null,
            null,
            null,
            null,
            null,
            null,
            null,
            null,
            null,
            null,
            null,
            null,
            null
          ]
        },
        "QC_FLAGGED": false,
        "RESTRICTED": false,
        "RESTRICTED_METADATA": false
      },
      {
        "ID": "477",
        "STID": "UT5",
        "NAME": "MOUTH PARLEYS",
        "ELEVATION": "4853.0",
        "LATITUDE": "40.7122",
        "LONGITUDE": "-111.8019",
        "STATUS": "ACTIVE",
        "MNET_ID": "4",
        "STATE": "UT",
        "COUNTRY": "US",
        "TIMEZONE": "America/Denver",
        "ELEV_DEM": "4868.8",
        "PERIOD_OF_RECORD": {
          "start": "1997-03-27T00:00:00Z",
          "end": "2026-01-31T01:40:00Z"
        },
        "UNITS": {
          "position": "ft",
          "elevation": "ft"
        },
        "SENSOR_VARIABLES": {
          "air_temp": {
            "air_temp_set_1": {}
          },
          "wind_speed": {
            "wind_speed_set_1": {}
          },
          "wind_direction": {
            "wind_direction_set_1": {}
          },
          "wind_gust": {
            "wind_gust_set_1": {}
          }
        },
        "OBSERVATIONS": {
          "date_time": [
            "5:00 PM",
            "5:10 PM",
            "5:20 PM",
            "5:30 PM",
            "5:40 PM",
            "5:50 PM",
            "6:00 PM",
            "6:10 PM",
            "6:20 PM",
            "6:30 PM",
            "6:40 PM",
            "6:50 PM",
            "6:50 PM"
          ],
          "air_temp_set_1": [
            43.36,
            43.04,
            42.48,
            41.64,
            41.44,
            41.1,
            41.21,
            40.75,
            40.62,
            39.96,
            39.6,
            39.6
          ],
          "wind_speed_set_1": [
            5.51,
            4.49,
            3.74,
            2.87,
            2.73,
            0.57,
            0.96,
            1.29,
            0.34,
            2.08,
            0.33,
            1.29,
            1.29
          ],
          "wind_direction_set_1": [
            264.9,
            271.6,
            244.7,
            212.3,
            236,
            229.2,
            30.49,
            179.2,
            158.7,
            135.7,
            92.9,
            69.24,
            69.24
          ],
          "wind_gust_set_1": [
            7.67,
            7.67,
            6.79,
            4.6,
            3.29,
            3.07,
            1.75,
            2.4,
            2.4,
            3.07,
            3.51,
            3.95,
            3.95
          ]
        },
        "QC_FLAGGED": false,
        "RESTRICTED": false,
        "RESTRICTED_METADATA": false
      },
      {
        "ID": "528",
        "STID": "AMB",
        "NAME": "ALTA - MT BALDY",
        "ELEVATION": "11066.0",
        "LATITUDE": "40.5677",
        "LONGITUDE": "-111.6374",
        "STATUS": "ACTIVE",
        "MNET_ID": "6",
        "STATE": "UT",
        "COUNTRY": "US",
        "TIMEZONE": "America/Denver",
        "ELEV_DEM": "10964.6",
        "PERIOD_OF_RECORD": {
          "start": "1998-11-21T00:00:00Z",
          "end": "2026-01-31T01:00:00Z"
        },
        "UNITS": {
          "position": "ft",
          "elevation": "ft"
        },
        "SENSOR_VARIABLES": {
          "air_temp": {
            "air_temp_set_1": {}
          },
          "wind_speed": {
            "wind_speed_set_1": {}
          },
          "wind_direction": {
            "wind_direction_set_1": {}
          },
          "wind_gust": {
            "wind_gust_set_1": {}
          }
        },
        "OBSERVATIONS": {
          "date_time": [
            "1:00 PM",
            "2:00 PM",
            "3:00 PM",
            "4:00 PM",
            "5:00 PM",
            "6:00 PM",
            "6:00 PM"
          ],
          "air_temp_set_1": [
            21.2,
            21.4,
            20.8,
            21.6,
            21.4,
            22
          ],
          "wind_speed_set_1": [
            25.1,
            22.6,
            22.8,
            27.3,
            25.59,
            22.99,
            22.99
          ],
          "wind_direction_set_1": [
            329.2,
            335.4,
            327.4,
            312.7,
            306.7,
            309.7,
            309.7
          ],
          "wind_gust_set_1": [
            37.3,
            33.99,
            32.3,
            38.9,
            37.9,
            32.4,
            32.4
          ]
        },
        "QC_FLAGGED": false,
        "RESTRICTED": false,
        "RESTRICTED_METADATA": false
      },
      {
        "ID": "534",
        "STID": "OGP",
        "NAME": "SNOWBASIN - MOUNT OGDEN",
        "ELEVATION": "9570.0",
        "LATITUDE": "41.200",
        "LONGITUDE": "-111.881",
        "STATUS": "ACTIVE",
        "MNET_ID": "8",
        "STATE": "UT",
        "COUNTRY": "US",
        "TIMEZONE": "America/Denver",
        "ELEV_DEM": "9340.6",
        "PERIOD_OF_RECORD": {
          "start": "1997-01-01T00:00:00Z",
          "end": "2026-01-31T01:45:00Z"
        },
        "UNITS": {
          "position": "ft",
          "elevation": "ft"
        },
        "SENSOR_VARIABLES": {
          "air_temp": {
            "air_temp_set_1": {}
          },
          "wind_speed": {
            "wind_speed_set_1": {}
          },
          "wind_direction": {
            "wind_direction_set_1": {}
          },
          "wind_gust": {
            "wind_gust_set_1": {}
          }
        },
        "OBSERVATIONS": {
          "date_time": [
            "4:15 PM",
            "4:30 PM",
            "4:45 PM",
            "5:00 PM",
            "5:15 PM",
            "5:30 PM",
            "5:45 PM",
            "6:00 PM",
            "6:15 PM",
            "6:30 PM",
            "6:45 PM",
            "7:00 PM",
            "7:00 PM"
          ],
          "air_temp_set_1": [
            24.43,
            23.82,
            23.58,
            23.45,
            23.33,
            23.45,
            24.19,
            24.55,
            24.92,
            22.35,
            23.09,
            22.11
          ],
          "wind_speed_set_1": [
            15.56,
            14.33,
            13.46,
            15.43,
            16.19,
            15.74,
            16.51,
            15.72,
            15.9,
            14.96,
            17.41,
            15.17,
            15.17
          ],
          "wind_direction_set_1": [
            270.9,
            269.9,
            266.9,
            272.3,
            272.3,
            273.3,
            273.6,
            271,
            270.4,
            266.5,
            266.9,
            260.3,
            260.3
          ],
          "wind_gust_set_1": [
            17.9,
            16.2,
            15.9,
            18.19,
            18,
            17.1,
            18.7,
            17.6,
            17,
            18.3,
            18.7,
            17,
            17
          ]
        },
        "QC_FLAGGED": false,
        "RESTRICTED": false,
        "RESTRICTED_METADATA": false
      },
      {
        "ID": "538",
        "STID": "HDP",
        "NAME": "Hidden Peak",
        "ELEVATION": "11000.0",
        "LATITUDE": "40.56106",
        "LONGITUDE": "-111.64522",
        "STATUS": "ACTIVE",
        "MNET_ID": "86",
        "STATE": "UT",
        "COUNTRY": "US",
        "TIMEZONE": "America/Denver",
        "ELEV_DEM": "10971.1",
        "PERIOD_OF_RECORD": {
          "start": "1997-01-01T00:00:00Z",
          "end": "2026-01-31T01:30:00Z"
        },
        "UNITS": {
          "position": "ft",
          "elevation": "ft"
        },
        "SENSOR_VARIABLES": {
          "air_temp": {
            "air_temp_set_1": {}
          },
          "wind_speed": {
            "wind_speed_set_1": {}
          },
          "wind_direction": {
            "wind_direction_set_1": {}
          },
          "wind_gust": {
            "wind_gust_set_1": {}
          }
        },
        "OBSERVATIONS": {
          "date_time": [
            "3:45 PM",
            "4:00 PM",
            "4:15 PM",
            "4:30 PM",
            "4:45 PM",
            "5:00 PM",
            "5:15 PM",
            "5:30 PM",
            "5:45 PM",
            "6:00 PM",
            "6:15 PM",
            "6:30 PM",
            "6:30 PM"
          ],
          "air_temp_set_1": [
            21,
            21,
            20,
            21,
            21,
            21,
            22,
            22,
            21,
            20,
            21,
            21
          ],
          "wind_speed_set_1": [
            28,
            29,
            27,
            27,
            26,
            25,
            22.99,
            19,
            13.99,
            12,
            20,
            22,
            22
          ],
          "wind_direction_set_1": [
            315,
            315,
            315,
            315,
            315,
            315,
            337.5,
            337.5,
            337.5,
            315,
            292.5,
            292.5,
            292.5
          ],
          "wind_gust_set_1": [
            38,
            34.99,
            33.99,
            37,
            33.99,
            31,
            28,
            27,
            21,
            18,
            25,
            28,
            28
          ]
        },
        "QC_FLAGGED": false,
        "RESTRICTED": false,
        "RESTRICTED_METADATA": false
      },
      {
        "ID": "2524",
        "STID": "FPS",
        "NAME": "Flight Park South",
        "ELEVATION": "5202.0",
        "LATITUDE": "40.45689",
        "LONGITUDE": "-111.90483",
        "STATUS": "ACTIVE",
        "MNET_ID": "153",
        "STATE": "UT",
        "COUNTRY": "US",
        "TIMEZONE": "America/Denver",
        "ELEV_DEM": "5154.2",
        "PERIOD_OF_RECORD": {
          "start": "2010-11-23T00:00:00Z",
          "end": "2026-01-31T01:45:00Z"
        },
        "UNITS": {
          "position": "ft",
          "elevation": "ft"
        },
        "SENSOR_VARIABLES": {
          "air_temp": {
            "air_temp_set_1": {}
          },
          "wind_speed": {
            "wind_speed_set_1": {}
          },
          "wind_direction": {
            "wind_direction_set_1": {}
          },
          "wind_gust": {
            "wind_gust_set_1": {}
          },
          "altimeter": {
            "altimeter_set_1d": {
              "derived_from": [
                "pressure_set_1"
              ]
            }
          }
        },
        "OBSERVATIONS": {
          "date_time": [
            "6:05 PM",
            "6:10 PM",
            "6:15 PM",
            "6:20 PM",
            "6:25 PM",
            "6:30 PM",
            "6:35 PM",
            "6:40 PM",
            "6:45 PM",
            "6:50 PM",
            "6:55 PM",
            "7:00 PM",
            "7:00 PM"
          ],
          "air_temp_set_1": [
            39.41,
            39.34,
            39.35,
            39.27,
            39,
            38.66,
            38.25,
            38.29,
            38.41,
            38.6,
            38.2,
            38.09
          ],
          "wind_speed_set_1": [
            6.58,
            6.79,
            7.19,
            6.31,
            6.53,
            7.47,
            7.01,
            6.62,
            6.48,
            6.95,
            6.51,
            6.97,
            6.97
          ],
          "wind_direction_set_1": [
            153.7,
            156.62,
            162.26,
            170.97,
            178.88,
            174.71,
            168.43,
            160.85,
            157.21,
            154.66,
            156.31,
            158.48,
            158.48
          ],
          "wind_gust_set_1": [
            7.27,
            7.67,
            7.8,
            6.62,
            7.1,
            8.02,
            8.38,
            7.93,
            7.15,
            8.11,
            7.24,
            8.07,
            8.07
          ],
          "altimeter_set_1d": [
            30.56,
            30.56,
            30.56,
            30.56,
            30.56,
            30.56,
            30.56,
            30.56,
            30.56,
            30.55,
            30.55,
            30.56
          ]
        },
        "QC_FLAGGED": false,
        "RESTRICTED": false,
        "RESTRICTED_METADATA": false
      },
      {
        "ID": "22477",
        "STID": "BRW",
        "NAME": "BRIGHTON GREAT WESTERN",
        "ELEVATION": "10565.0",
        "LATITUDE": "40.59230",
        "LONGITUDE": "-111.56160",
        "STATUS": "ACTIVE",
        "MNET_ID": "6",
        "STATE": "UT",
        "COUNTRY": "US",
        "TIMEZONE": "America/Denver",
        "ELEV_DEM": "10436.4",
        "PERIOD_OF_RECORD": {
          "start": "2007-12-18T00:00:00Z",
          "end": "2026-01-31T01:00:00Z"
        },
        "UNITS": {
          "position": "ft",
          "elevation": "ft"
        },
        "SENSOR_VARIABLES": {
          "air_temp": {
            "air_temp_set_1": {}
          },
          "wind_speed": {
            "wind_speed_set_1": {}
          },
          "wind_direction": {
            "wind_direction_set_1": {}
          },
          "wind_gust": {
            "wind_gust_set_1": {}
          }
        },
        "OBSERVATIONS": {
          "date_time": [
            "3:15 PM",
            "3:30 PM",
            "3:45 PM",
            "4:00 PM",
            "4:15 PM",
            "4:30 PM",
            "4:45 PM",
            "5:00 PM",
            "5:15 PM",
            "5:30 PM",
            "5:45 PM",
            "6:00 PM",
            "6:00 PM"
          ],
          "air_temp_set_1": [
            22.1,
            22.02,
            21.72,
            21.9,
            21.6,
            21.6,
            21.52,
            21.47,
            21.84,
            21.52,
            21.11,
            21.42
          ],
          "wind_speed_set_1": [
            7.03,
            8.32,
            7.5,
            9.15,
            9.26,
            8.72,
            6.41,
            5.67,
            5.27,
            6.92,
            4.41,
            3.3,
            3.3
          ],
          "wind_direction_set_1": [
            321.9,
            318.5,
            302.1,
            310,
            315.9,
            315.4,
            310.4,
            297.3,
            303.8,
            312,
            296.3,
            279.2,
            279.2
          ],
          "wind_gust_set_1": [
            12.07,
            12.37,
            12.44,
            14.75,
            14.47,
            14.39,
            13.49,
            11.85,
            9.31,
            9.84,
            9.61,
            8.27,
            8.27
          ]
        },
        "QC_FLAGGED": false,
        "RESTRICTED": false,
        "RESTRICTED_METADATA": false
      },
      {
        "ID": "29319",
        "STID": "D6120",
        "NAME": "DW6120 Sandy",
        "ELEVATION": "5161.0",
        "LATITUDE": "40.55200",
        "LONGITUDE": "-111.80333",
        "STATUS": "ACTIVE",
        "MNET_ID": "65",
        "STATE": "UT",
        "COUNTRY": "US",
        "TIMEZONE": "America/Denver",
        "ELEV_DEM": "5160.8",
        "PERIOD_OF_RECORD": {
          "start": "2010-11-03T00:00:00Z",
          "end": "2026-01-31T01:45:00Z"
        },
        "UNITS": {
          "position": "ft",
          "elevation": "ft"
        },
        "SENSOR_VARIABLES": {
          "air_temp": {
            "air_temp_set_1": {}
          },
          "wind_speed": {
            "wind_speed_set_1": {}
          },
          "wind_direction": {
            "wind_direction_set_1": {}
          },
          "wind_gust": {
            "wind_gust_set_1": {}
          },
          "altimeter": {
            "altimeter_set_1": {}
          }
        },
        "OBSERVATIONS": {
          "date_time": [
            "4:15 PM",
            "4:30 PM",
            "4:45 PM",
            "5:00 PM",
            "5:15 PM",
            "5:30 PM",
            "5:45 PM",
            "6:00 PM",
            "6:15 PM",
            "6:30 PM",
            "6:45 PM",
            "7:00 PM",
            "7:00 PM"
          ],
          "air_temp_set_1": [
            42,
            41,
            41,
            41,
            39,
            39,
            38,
            37,
            37,
            36,
            36,
            36
          ],
          "wind_speed_set_1": [
            4,
            2,
            0,
            0,
            0,
            0,
            1,
            3,
            3,
            5.99,
            5.99,
            5,
            5
          ],
          "wind_direction_set_1": [
            298,
            280,
            275,
            275,
            275,
            275,
            211,
            117,
            117,
            89,
            84,
            86,
            86
          ],
          "wind_gust_set_1": [
            8,
            5,
            3,
            2,
            2,
            2,
            4,
            5,
            5,
            8,
            9,
            8,
            8
          ],
          "altimeter_set_1": [
            30.41,
            30.4,
            30.4,
            30.4,
            30.4,
            30.4,
            30.39,
            30.39,
            30.39,
            30.39,
            30.38,
            30.38
          ]
        },
        "QC_FLAGGED": false,
        "RESTRICTED": false,
        "RESTRICTED_METADATA": false
      },
      {
        "ID": "44023",
        "STID": "REY",
        "NAME": "Reynolds Peak",
        "ELEVATION": "9400.0",
        "LATITUDE": "40.662117",
        "LONGITUDE": "-111.646764",
        "STATUS": "ACTIVE",
        "MNET_ID": "6",
        "STATE": "UT",
        "COUNTRY": "US",
        "TIMEZONE": "America/Denver",
        "ELEV_DEM": "9360.2",
        "PERIOD_OF_RECORD": {
          "start": "2014-11-23T09:23:00Z",
          "end": "2026-01-31T01:10:00Z"
        },
        "UNITS": {
          "position": "ft",
          "elevation": "ft"
        },
        "SENSOR_VARIABLES": {
          "air_temp": {
            "air_temp_set_1": {}
          },
          "wind_speed": {
            "wind_speed_set_1": {},
            "wind_speed_set_2": {}
          },
          "wind_direction": {
            "wind_direction_set_1": {},
            "wind_direction_set_2": {}
          },
          "wind_gust": {
            "wind_gust_set_1": {}
          }
        },
        "OBSERVATIONS": {
          "date_time": [
            "4:20 PM",
            "4:30 PM",
            "4:40 PM",
            "4:50 PM",
            "5:00 PM",
            "5:10 PM",
            "5:20 PM",
            "5:30 PM",
            "5:40 PM",
            "5:50 PM",
            "6:00 PM",
            "6:10 PM",
            "6:10 PM"
          ],
          "air_temp_set_1": [
            29.54,
            28.36,
            27.22,
            27.01,
            27,
            27.06,
            26.93,
            26.68,
            26.37,
            25.88,
            25.75,
            25.88
          ],
          "wind_speed_set_1": [
            2.93,
            5.4,
            7.89,
            7.17,
            6.23,
            4.8,
            5.56,
            5.53,
            5.76,
            8.91,
            8.97,
            8.77,
            8.77
          ],
          "wind_direction_set_1": [
            219.2,
            208.8,
            208.9,
            205.8,
            217.8,
            229.8,
            234.7,
            243.1,
            204.2,
            202.2,
            210.8,
            217.8,
            217.8
          ],
          "wind_gust_set_1": [
            7.57,
            11.8,
            12.16,
            9.56,
            10.06,
            6.71,
            7.95,
            8.57,
            8.45,
            13.16,
            12.67,
            11.43,
            11.43
          ],
          "wind_direction_set_2": [
            null,
            null,
            null,
            null,
            null,
            null,
            null,
            null,
            null,
            null,
            null,
            null
          ],
          "wind_speed_set_2": [
            null,
            null,
            null,
            null,
            null,
            null,
            null,
            null,
            null,
            null,
            null,
            null
          ]
        },
        "QC_FLAGGED": false,
        "RESTRICTED": false,
        "RESTRICTED_METADATA": false
      },
      {
        "ID": "63736",
        "STID": "UTOLY",
        "NAME": "I-215 at Olympus Cove",
        "ELEVATION": "4972.0",
        "LATITUDE": "40.6826",
        "LONGITUDE": "-111.7973",
        "STATUS": "ACTIVE",
        "MNET_ID": "4",
        "STATE": "UT",
        "COUNTRY": "US",
        "TIMEZONE": "America/Denver",
        "ELEV_DEM": "4973.8",
        "PERIOD_OF_RECORD": {
          "start": "2017-11-30T05:25:00Z",
          "end": "2026-01-31T01:30:00Z"
        },
        "UNITS": {
          "position": "ft",
          "elevation": "ft"
        },
        "SENSOR_VARIABLES": {
          "air_temp": {
            "air_temp_set_1": {}
          },
          "wind_speed": {
            "wind_speed_set_1": {}
          },
          "wind_direction": {
            "wind_direction_set_1": {}
          },
          "wind_gust": {
            "wind_gust_set_1": {}
          }
        },
        "OBSERVATIONS": {
          "date_time": [
            "4:50 PM",
            "5:00 PM",
            "5:10 PM",
            "5:20 PM",
            "5:30 PM",
            "5:40 PM",
            "5:50 PM",
            "6:00 PM",
            "6:10 PM",
            "6:20 PM",
            "6:30 PM",
            "6:40 PM",
            "6:40 PM"
          ],
          "air_temp_set_1": [
            44.84,
            44.12,
            43.2,
            42.76,
            42.29,
            41.93,
            41.68,
            41.28,
            40.77,
            40.47,
            39.38,
            38.43
          ],
          "wind_speed_set_1": [
            2.96,
            2.49,
            2.62,
            1.05,
            1.11,
            1.12,
            0.48,
            1.96,
            1.45,
            1.12,
            2.82,
            1.53,
            1.53
          ],
          "wind_direction_set_1": [
            331.5,
            317.3,
            325.4,
            300.6,
            306.9,
            273,
            296.5,
            195.2,
            173.2,
            261.2,
            131.2,
            137.7,
            137.7
          ],
          "wind_gust_set_1": [
            4.6,
            4.82,
            5.04,
            3.73,
            2.85,
            3.73,
            3.73,
            3.95,
            4.38,
            3.51,
            3.29,
            2.64,
            2.64
          ]
        },
        "QC_FLAGGED": false,
        "RESTRICTED": false,
        "RESTRICTED_METADATA": false
      }
    ],
    "SUMMARY": {
      "NUMBER_OF_OBJECTS": 11,
      "RESPONSE_CODE": 1,
      "RESPONSE_MESSAGE": "OK",
      "METADATA_QUERY_TIME": "5.7 ms",
      "METADATA_PARSE_TIME": "0.3 ms",
      "TOTAL_METADATA_TIME": "6.0 ms",
      "DATA_QUERY_TIME": "6.1 ms",
      "QC_QUERY_TIME": "4.7 ms",
      "DATA_PARSE_TIME": "11.6 ms",
      "TOTAL_DATA_TIME": "22.3 ms",
      "TOTAL_TIME": "28.3 ms",
      "VERSION": "v2.31.0"
    },
    "QC_SUMMARY": {
      "QC_CHECKS_APPLIED": [
        "sl_range_check"
      ],
      "TOTAL_OBSERVATIONS_FLAGGED": 0,
      "PERCENT_OF_TOTAL_OBSERVATIONS_FLAGGED": 0
    },
    "UNITS": {
      "position": "ft",
      "elevation": "ft",
      "air_temp": "Fahrenheit",
      "wind_speed": "Miles/hour",
      "wind_direction": "Degrees",
      "altimeter": "INHG",
      "wind_gust": "Miles/hour"
    }
  },
  "windAloft6": {
    "@context": {
      "@version": "1.1",
      "@vocab": "https://api.weather.gov/ontology#"
    },
    "@id": "https://api.weather.gov/products/ba06a5ce-5f43-40e5-aef5-c01622a79293",
    "id": "ba06a5ce-5f43-40e5-aef5-c01622a79293",
    "wmoCollectiveId": "FBUS31",
    "issuingOffice": "KWNO",
    "issuanceTime": "2026-01-31T01:58:00+00:00",
    "productCode": "FD1",
    "productName": "6 Hour Winds Aloft Forecast",
    "productText": "\n000\nFBUS31 KWNO 310158\nFD1US1\nDATA BASED ON 310000Z    \nVALID 310600Z   FOR USE 0200-0900Z. TEMPS NEG ABV 24000\n\nFT  3000    6000    9000   12000   18000   24000  30000  34000  39000\nABI      3114+02 3222-06 3232-10 3248-22 3473-32 359045 850053 329558\nABQ              3513+00 3315-04 3437-16 3343-26 334842 325853 337962\nABR 1914 1716-09 1808-14 9900-18 3633-29 3562-39 359251 359859 840464\nACK 3105 2611-11 2612-17 2611-23 2738-33 2773-43 267854 267454 267952\nACY 3322 2721-14 2732-17 2639-21 2655-31 2668-42 268055 268054 268351\nAGC 3413 3209-19 2716-21 2618-25 2531-36 2561-45 256353 255853 266153\nALB 3318 3209-14 2709-18 2508-24 2305-36 2207-46 263454 264455 265354\nALS                      3113-08 3444-17 3452-28 337043 337454 337764\nAMA      0708    3011-05 3324-11 3453-21 3366-32 359645 850754 349862\nAST 2022 2218+04 2425+00 2426-04 2629-19 2652-29 266745 268355 287264\nATL 0209 2412-06 2622-11 2636-15 2653-26 2668-37 259849 760252 259552\nAVP 3230 3009-15 2708-19 2613-25 2642-34 2664-44 256355 256154 266453\nAXN 9900 1007-10 0807-15 0107-21 0322-33 0238-43 366255 367560 367461\nBAM              2914+05 2920-02 2944-15 2954-28 294343 303653 294964\nBCE                      3519-01 3338-15 3341-26 323842 304952 317063\nBDL 3517 2610-13 2710-18 2508-24 2415-35 2656-44 266454 266155 266753\nBFF      2020    2823-05 3126-12 3444-22 3461-33 347946 349556 840666\nBGR 3612 2915-12 3015-16 3017-22 3113-34 3313-47 301958 283157 274655\nBHM 3622 2917-08 2827-11 2741-16 2659-26 2672-38 268951 760153 268950\nBIH      9900    9900+07 2613+03 3020-14 3031-26 282843 283652 274863\nBIL      2729    2930-02 3036-09 2942-18 3051-29 305945 296856 297766\nBLH 0209 0710+13 0614+08 0421+03 0121-13 0120-25 311940 282051 312663\nBML 3228 2907-12 2811-17 2914-22 2714-35 2705-47 271458 272858 264356\nBNA 0324 3513-16 2812-19 2632-22 2559-31 2578-40 259050 268151 267449\nBOI      2408+05 2922+00 2927-05 2849-19 2863-27 286543 296554 296166\nBOS 0105 2711-12 2713-17 2612-23 2209-35 2625-45 265954 266055 266753\nBRL 0224 0116-20 0431-21 0442-25 0454-37 0358-47 025555 364552 334052\nBRO 0225 0124+05 3321+00 3128-05 2867-16 7701-25 771937 782446 781256\nBUF 3114 3215-17 3410-19 3605-25 0609-36 0512-47 990055 261755 263355\nCAE 1711 2514-05 2520-10 2534-13 2552-25 2581-35 751848 751252 751052\nCAR 3423 3315-12 3212-16 3207-22 3307-34 3313-47 321260 292060 282756\nCGI 0132 3619-20 3413-24 3115-29 2918-39 2843-42 284745 284847 295549\nCHS 1609 2414-03 2436-08 2538-12 2560-23 2589-33 752146 753950 753555\nCLE 3211 3513-19 3408-21 0308-27 0207-38 3206-48 271553 262653 263454\nCLL 3421 3433+00 3445-06 3344-08 3044-22 3058-36 316046 297449 296954\nCMH 0113 3408-20 2812-21 2808-26 2619-37 2535-47 254651 254552 265252\nCOU 0228 0220-22 0231-22 0340-28 0360-37 0260-44 366049 345149 325550\nCRP 0125 0129+02 3331-02 3230-06 3043-20 2957-31 289239 288546 780054\nCRW 0419 9900-16 2510-20 2428-23 2446-34 2575-43 258452 257652 267351\nCSG 3212 2617-05 2724-09 2737-13 2756-24 2671-36 751249 761351 750950\nCVG 0216 3610-20 2908-22 2612-27 2522-38 2536-46 255350 265151 265351\nCZI              3217-03 3229-09 3237-19 3241-30 326845 327555 328466\nDAL 3630 3341-02 3251-07 3253-12 3156-25 3156-37 336949 336753 318454\nDBQ 0224 0425-16 0435-18 0439-24 0347-37 0345-47 024357 014457 353855\nDEN              2918-03 3220-09 3446-20 3455-30 338044 348755 339365\nDIK      2220-02 2613-07 3015-12 3331-22 3347-33 346647 338057 329468\nDLH 0507 0316-10 0317-16 0319-22 0326-35 0239-45 014558 015163 365761\nDLN              2729-01 2840-06 2943-20 2960-31 287643 298854 287167\nDRT 1706 0610+04 3008-02 3323-06 3242-18 3455-27 336241 316449 306656\nDSM 0121 0323-16 0436-16 0441-22 0346-36 0151-46 366355 366655 356054\nECK 3615 0118-17 0319-19 0324-25 0426-37 0527-47 052957 021157 281855\nEKN      2709-16 2616-20 2529-24 2551-33 2576-42 258353 257454 257652\nELP      0307    0123+01 0118-03 3328-14 3442-24 334841 335851 326359\nELY              3210+04 3218-01 3234-15 3142-28 305143 294753 297564\nEMI 3420 2921-16 2628-18 2532-22 2554-32 2570-42 268055 267655 267852\nEVV 0321 0216-21 3310-23 2909-28 2712-39 2536-44 264747 274748 285149\nEYW 3612 3219+10 2919+06 2525+01 2761-09 2677-20 258936 259246 259457\nFAT 9900 9900+13 2605+09 2716+03 2819-13 2929-26 272342 263252 264663\nGPI      2638+00 2837-03 2849-10 2850-23 2980-34 780648 780256 287957\nFLO 1320 2216-04 2213-11 2530-15 2552-25 2582-36 752248 751952 751753\nFMN              3510+01 3519-04 3433-16 3241-26 334942 325353 327464\nFOT 1815 1919+10 2220+04 2232-01 2449-14 2455-27 245144 245054 234963\nFSD 9900 0814-10 0712-14 0511-20 0132-33 3662-42 369152 359058 358359\nFSM 3625 3437-15 3351-14 3266-16 3277-28 3284-39 328550 327152 317052\nFWA 0119 0118-20 0315-22 0416-27 0527-38 0524-48 340952 291652 282953\nGAG      3527-05 3337-08 3356-13 3357-25 3481-35 840248 852655 359860\nGCK      3612-07 3532-08 3250-13 3456-25 3581-34 850447 852355 851363\nGEG      2729+03 2832-02 2835-09 2957-21 2870-34 770248 780756 288961\nGFK 2019 2022-08 2114-14 9900-19 3620-30 3642-40 355753 358361 357565\nGGW      2728+02 2826-05 2825-10 2828-19 2835-30 305747 297858 308165\nGJT              3108-02 3419-06 3340-17 3347-27 325443 325654 326765\nGLD      9900    3528-07 3243-12 3452-24 3473-34 359647 841455 841964\nGRB 0335 0429-13 0432-18 0433-24 0435-37 0438-48 034157 023761 362857\nGRI      0416-11 0119-13 3625-19 3550-29 3583-39 851350 851456 850961\nGSP 0919 2220-07 2425-13 2536-17 2652-26 2561-38 259050 259652 259052\nGTF      2645    2845-02 2932-06 2839-21 2863-33 279645 279356 278663\nH51 0127 3431+04 3233+01 3029-06 2865-18 2799-27 772538 772146 771355\nH52 3214 2918+05 2832+03 2637-03 2679-15 7506-23 762437 762847 762258\nH61 3008 2727+07 2643+02 2649-03 2680-13 7503-21 750837 751647 762358\nHAT 0205 2625-05 2443-11 2355-18 2567-27 2585-37 753948 753753 753053\nHOU 3523 3535+00 3542-06 3241-07 2946-22 2957-35 296645 289245 279353\nHSV 0122 3013-11 2827-14 2640-18 2662-27 2676-39 269051 269353 268049\nICT 0326 0132-12 0138-12 3548-18 3467-28 3483-39 850551 850654 348055\nILM 1219 2124-03 2326-10 2338-16 2555-26 2587-35 752348 753252 752855\nIMB              2717+00 2626-05 2734-19 2767-28 277043 287354 286265\nIND 0321 0216-21 0212-23 0111-28 3007-39 3407-47 282050 282550 283852\nINK      1706+04 3514-02 3421-05 3541-16 3557-27 347242 337551 327058\nINL 9900 2708-09 9900-15 3606-22 0116-33 3630-43 014856 016062 366165\nJAN 3533 3131-07 3041-10 2947-14 2860-24 2766-37 277951 279253 269249\nJAX 2814 2521-01 2433-04 2539-08 2566-20 7500-28 754640 756049 755058\nJFK 3519 2820-14 2723-18 2737-23 2652-32 2665-43 267555 267154 267452\nJOT 0120 0213-20 0428-21 0536-26 0545-38 0451-48 044355 012653 332853\nLAS      0410+10 0114+07 3218+02 3426-14 3335-26 303042 283951 294163\nLBB      3207+03 3309-04 3223-09 3448-20 3361-31 359044 359452 338962\nLCH 3527 3437-02 3339-06 3143-08 2948-22 2860-35 277648 279748 770452\nLIT 3628 3224-16 3041-18 3062-18 3081-27 2987-39 297849 297151 296149\nLKV              2416+04 2523-02 2755-16 2757-27 264943 274653 285266\nLND              3119+01 3227-06 3138-19 3250-29 316644 316254 316966\nLOU 0421 0310-19 3205-21 2607-27 2529-38 2557-43 256550 266250 265651\nLRD 0109 0415+04 3315-02 3224-04 3041-18 3147-26 298139 298547 289355\nLSE 0323 0429-13 0431-17 0334-23 0341-36 0346-47 024757 014559 364357\nLWS 2312 2627+03 2728-02 2833-08 3050-20 2854-34 770145 791355 288764\nMBW              2839    3129-08 3341-20 3348-30 337345 337455 338766\nMCW 0119 0427-13 0430-16 0433-22 0243-36 0245-47 015256 365957 365756\nMEM 0232 3423-17 2932-19 2845-24 2871-28 2781-39 278249 277850 286449\nMGM 3215 2918-05 2725-09 2738-13 2755-24 2668-36 760950 761552 760950\nMIA 2506 2817+09 2724+04 2533+00 2766-10 2583-21 269836 750447 750658\nMKC 0225 0327-18 0340-18 0350-22 0156-34 3670-44 358553 357952 346452\nMKG 3621 0227-15 0435-19 0440-25 0537-37 0436-48 043558 032657 341855\nMLB 2712 2619+04 2633-01 2544-03 2676-15 7612-22 751738 752648 763359\nMLS      2624+02 3023-04 3023-10 3129-19 3038-30 326247 318057 318965\nMOB 3419 3019-03 2831-06 2842-09 2760-22 2773-34 760848 762950 763051\nMOT      2029-05 2213-08 2811-13 3429-23 3448-35 347249 348658 339368\nMQT 0125 0330-13 0331-17 0333-23 0435-36 0434-46 033458 023564 013560\nMRF              3312+01 3521-04 3536-15 3550-26 346041 336450 317157\nMSP 0110 0518-11 0523-16 0224-22 0230-35 0342-45 024757 015660 366159\nMSY 3529 3225-02 3030-05 2939-08 2754-22 2767-34 760347 762649 762550\nOKC 0230 3442-07 3349-09 3357-14 3366-27 3371-38 840050 349754 337855\nOMA 0116 0422-13 0429-15 0328-21 0142-34 3664-44 358853 359255 357455\nONL      0708-10 0207-13 0115-18 3646-29 3577-38 850650 851057 852263\nONT 0709 0708+14 0610+09 0310+03 0315-13 3620-26 280941 291751 282462\nORF 3613 2622-10 2534-14 2438-20 2557-28 2569-40 259351 751153 750352\nOTH 1918 2221+06 2227+02 2323-03 2561-16 2560-27 255743 255854 276064\nPDX 2018 2416+05 2424+00 2531-06 2634-19 2655-28 266744 278055 287065\nPFN 3413 2617-01 2738-06 2747-08 2662-20 2680-31 753542 754550 753753\nPHX 0820 0717+12 0517+06 0228+02 3425-13 3324-24 323140 323351 314063\nPIE 2716 2631+04 2642+00 2646-04 2683-16 7614-23 752238 753147 763659\nPIH      2215    2722+00 2931-05 3039-18 3054-28 306143 306254 306866\nPIR      1815-08 2108-12 3307-16 3536-27 3569-36 358949 850857 841966\nPLB 3213 3311-15 3009-17 2811-22 2609-35 2705-47 300857 272058 263556\nPRC              0316+07 3626+02 3530-14 3329-25 313641 314251 314463\nPSB      3111-18 2815-20 2722-25 2634-35 2562-45 256254 255954 266253\nPSX 3628 3633+01 3438-03 3238-07 2940-21 2956-34 297042 289745 770053\nPUB              2313-05 3021-10 3446-19 3457-30 338044 348955 349464\nPWM 3508 2814-12 2813-16 2710-23 2609-35 9900-47 271956 274156 265555\nRAP      2017-04 2915-06 3121-12 3441-22 3457-33 347447 339356 830867\nRBL 9900 1914+11 2214+06 2323+00 2539-14 2650-27 264944 264853 255664\nRDM      2315+07 2618+01 2527-05 2744-19 2662-27 276243 266654 275865\nRDU 0609 2520-08 2323-14 2333-19 2553-27 2563-40 259650 750553 750252\nRIC 0112 2615-13 2530-16 2437-20 2558-29 2568-40 268952 259155 269151\nRKS              2924    3227-06 3238-18 3351-29 316244 316454 316866\nRNO      1810    2008+06 2612+00 2729-14 2848-27 274643 274553 266564\nROA 1012 2406-14 2527-17 2436-21 2558-30 2572-41 259153 258654 268851\nROW      2006    3509-01 3414-05 3336-16 3452-27 346742 337352 337761\nSAC 9900 2007+13 2309+06 2416+01 2629-13 2639-26 264243 264654 256565\nSAN 0615 0313+14 0615+10 0621+04 0416-13 0416-25 351041 280951 291260\nSAT 3618 0122+03 3326-03 3230-07 3044-20 3252-30 306241 299047 288154\nSAV 2808 2618-02 2430-07 2538-10 2666-21 2584-33 752844 754550 753754\nSBA 9900 1405+14 9900+10 0105+04 3407-13 3512-25 281342 251952 262563\nSEA 2219 2419+03 2719+00 2625-06 2734-21 2760-32 277946 288956 286763\nSFO 2205 2007+13 2211+07 2320+02 2633-13 2636-26 263943 253653 245965\nSGF 0129 0125-22 3639-22 0146-27 3564-32 3482-41 347549 336748 325849\nSHV 3624 3237-07 3152-09 3163-13 3068-25 3065-38 296151 296253 296152\nSIY      2013+09 2320+05 2529-01 2550-15 2660-28 255143 253853 284565\nSLC      9900    2712+00 3124-04 3141-16 3152-28 314843 304753 306065\nSLN 0420 0226-12 0232-13 3540-19 3460-29 3487-39 851051 851055 348556\nSPI 0318 0217-21 0424-24 0329-28 0451-39 0450-47 363049 343249 323852\nSPS 0332 3326-02 3245-06 3250-13 3257-25 3367-36 349949 359754 328455\nSSM 0431 0327-13 0332-18 0336-24 0338-36 0537-46 053559 032163 362560\nSTL 0225 0420-22 0223-24 0225-30 0334-39 0234-45 343547 333948 314749\nSYR 3018 3315-16 3109-18 2806-24 9900-37 0505-47 261155 262655 263955\nT01 3628 3533+00 3228-03 3138-06 2845-21 2763-33 771241 771546 771149\nT06 3531 3223+00 3030-02 2938-06 2744-21 2782-31 763042 763147 761449\nT07 3422 2722+00 2832-02 2740-06 2658-20 2693-28 754241 754948 763353\nTCC      1012    9900-03 3122-08 3441-18 3457-30 348544 348553 338663\nTLH 3114 2818-02 2733-06 2741-08 2665-20 2682-32 753942 755050 754054\nTRI      2408-11 2322-16 2438-21 2560-29 2576-40 258952 258852 268350\nTUL 0234 3638-14 3648-13 3458-17 3375-28 3386-39 349351 348153 327252\nTUS      0913+11 0817+04 0227+02 3420-12 3227-23 332640 332851 303462\nTVC 0322 0334-13 0337-18 0436-24 0433-37 0531-48 042557 032460 362058\nTYS 0418 2005-11 2326-15 2430-20 2560-29 2576-40 258952 269453 268549\nWJF      0814+12 9900+09 3408+04 3610-13 3620-26 281741 282151 272863\nYKM 2514 2625+05 2729+00 2731-05 2730-20 2763-31 288145 289155 298365\nZUN              0212+01 3620-01 3429-15 3233-25 334241 325451 326663\n2XG 2512 2327+03 2532-04 2447-07 2463-20 7505-26 753939 755348 755359\n4J3 3115 2825+02 2735-02 2647-05 2670-19 7612-25 753739 754848 764157\n"
  },
  "windAloft12": {
    "@context": {
      "@version": "1.1",
      "@vocab": "https://api.weather.gov/ontology#"
    },
    "@id": "https://api.weather.gov/products/d9718571-a99a-417d-8144-ba7fc8a83f35",
    "id": "d9718571-a99a-417d-8144-ba7fc8a83f35",
    "wmoCollectiveId": "FBUS33",
    "issuingOffice": "KWNO",
    "issuanceTime": "2026-01-31T01:58:00+00:00",
    "productCode": "FD3",
    "productName": "24 Hour Winds Aloft Forecast",
    "productText": "\n000\nFBUS33 KWNO 310158\nFD3US3\nDATA BASED ON 310000Z    \nVALID 311200Z   FOR USE 0900-1800Z. TEMPS NEG ABV 24000\n\nFT  3000    6000    9000   12000   18000   24000  30000  34000  39000\nABI      3116+01 3222-05 3433-09 3357-18 3371-28 338743 338653 329262\nABQ              3312+00 3320-02 3336-15 3340-26 314543 315952 326863\nABR 2032 2025-08 2216-11 2809-15 3428-25 3550-35 347049 347859 339168\nACK 2720 2615-12 2517-17 2632-21 2651-32 2677-42 269254 258656 258254\nACY 3215 2823-11 2633-15 2543-20 2559-31 2484-41 259054 258756 249154\nAGC 3413 3211-17 3109-20 2813-25 2526-37 2549-44 244853 254553 254854\nALB 3316 2813-14 2812-18 2705-24 9900-37 2522-46 254354 254855 255355\nALS                      3329-06 3343-17 3350-27 325844 326254 326965\nAMA      9900    2818-04 3326-09 3347-19 3365-29 338044 328654 329165\nAST 1920 1921+05 2221+01 2226-06 2451-17 2451-28 246744 257655 266665\nATL 3420 2710-10 2525-13 2439-20 2569-27 2484-39 259249 259148 258349\nAVP 3321 3011-15 2809-18 2720-24 2538-35 2565-44 257254 256454 256355\nAXN 2011 1912-09 2206-14 2906-19 3626-29 3644-39 367352 357760 358265\nBAM              2812+04 2919-01 2939-15 2948-28 295444 284554 284965\nBCE                      3419-01 3341-14 3353-28 315043 304853 316464\nBDL 3007 2813-12 2709-17 2507-24 2540-34 2564-43 257554 257055 256955\nBFF      2825    3028-04 3131-09 3243-20 3251-30 327546 328256 319167\nBGR 2609 3013-12 2814-16 2715-22 2615-35 2013-46 252158 263358 264155\nBHM 3427 3322-15 2925-21 2746-22 2669-28 2588-39 259447 268146 267047\nBIH      9900    9900+06 2911+03 3020-14 3028-27 303143 273253 275364\nBIL      2953    3148-01 3147-09 2953-23 3081-34 810348 308956 309559\nBLH 0707 9900+12 0513+08 0217+02 0121-13 0118-25 301641 282050 281862\nBML 3124 2911-13 2712-16 2608-22 2508-35 2008-47 241257 252757 263756\nBNA 0229 0126-20 3619-23 3611-28 2809-40 2435-41 264545 274745 275347\nBOI      9900+05 2818+01 2832-04 3048-18 2964-27 296443 296354 296365\nBOS 2815 2614-12 2409-17 2208-24 2532-34 2661-43 257054 256855 256955\nBRL 3519 0327-13 0334-17 0236-24 0244-36 0255-45 016155 365657 355355\nBRO 0323 0226+04 3323-01 3129-03 3143-13 3053-24 307240 298049 288756\nBUF 3114 3313-16 3411-19 3409-24 0114-36 0318-47 010855 271456 262456\nCAE 1416 2210-06 2421-13 2332-16 2462-25 2477-37 740051 750951 751751\nCAR 3324 3112-12 3111-16 2808-22 2513-34 2416-47 281760 272460 263056\nCGI 0232 0233-22 0237-22 0239-28 0253-37 0160-44 354848 334047 314649\nCHS 1508 2306-04 2522-10 2436-13 2459-24 2481-35 740748 743049 755253\nCLE 3213 3512-18 0113-20 0215-25 0425-37 0532-47 021054 281354 272254\nCLL 0133 3235-01 3348-06 3456-11 3269-19 3282-31 830143 329452 309660\nCMH 3611 3613-18 0111-21 3609-26 3506-38 2809-46 251852 262752 263053\nCOU 3616 3627-16 0240-17 0246-23 0152-36 0159-44 366753 356953 346352\nCRP 3517 3621+02 3429-03 3235-05 3249-16 3265-26 327942 307950 299856\nCRW 0416 3606-16 2807-20 2521-24 2343-36 2462-43 246752 245752 256152\nCSG 3321 2823-08 2632-13 2547-17 2570-26 2584-38 259349 750347 750549\nCVG 0117 0221-19 0113-21 0213-26 0311-38 2906-46 261850 262850 273152\nCZI              3220-02 3129-09 3046-20 3152-32 319846 308356 308864\nDAL 0227 3538-03 3348-07 3364-13 3372-22 3393-32 831045 831154 329659\nDBQ 0215 0326-12 0328-17 0332-23 0341-36 0249-45 015556 015560 355157\nDEN              3221+00 3323-07 3345-18 3350-29 337644 338055 318166\nDIK      2526-01 2726-05 2830-10 2838-22 2937-33 283149 294259 296664\nDLH 9900 9900-10 3607-15 3609-21 3622-33 0134-42 015654 365762 366365\nDLN              2936-03 3036-07 3047-20 3167-32 309245 309755 309166\nDRT 9900 0806+04 3506-03 3317-06 3246-15 3354-24 326942 317351 307659\nDSM 3617 0421-11 0226-15 0134-21 0143-34 0159-42 367854 368758 357858\nECK 0118 0324-17 0329-18 0331-24 0434-36 0436-46 043157 012059 321457\nEKN      3011-15 2714-19 2624-24 2447-35 2470-42 247553 246454 256753\nELP      9900    0310+01 3609-02 3229-12 3137-24 314940 315450 315262\nELY              3211+04 3217-01 3038-15 3150-28 305444 294953 305865\nEMI 3414 2919-13 2624-17 2533-22 2453-34 2482-42 259054 257955 247553\nEVV 0227 0230-21 0226-23 0228-28 0226-39 0231-46 342048 312648 303450\nEYW 3111 2819+08 2628+04 2537+00 2570-09 2589-20 249937 259846 269958\nFAT 1305 9900+12 9900+07 2609+02 2923-14 2821-26 282143 253153 255063\nGPI      2723-01 2927-05 3041-09 3167-22 3181-34 800447 811156 298762\nFLO 1117 2309-06 2219-12 2334-16 2455-25 2475-37 740251 740952 752452\nFMN              3316+01 3424-03 3444-15 3246-27 324743 315953 326363\nFOT 1816 2023+09 2125+04 2235-01 2347-14 2465-27 246643 235554 236365\nFSD 2011 1711-09 2105-13 3407-18 3636-28 3663-37 358850 850658 840766\nFSM 0225 0137-10 3647-13 3552-19 3468-31 3491-40 841149 840852 327752\nFWA 3614 3622-18 0226-20 0331-25 0436-37 0541-47 043655 361754 312153\nGAG      0115-05 3333-06 3340-13 3459-21 3375-31 349545 840555 830965\nGCK      9900-06 3222-06 3229-13 3453-21 3370-31 348745 339755 830666\nGEG      2614+03 2719-02 2828-07 2938-21 3059-31 298245 299455 307965\nGFK 2039 2132-08 2222-12 2412-16 3318-26 3439-36 356550 347460 338169\nGGW      3139+01 2935-04 2847-10 2956-25 2946-37 272549 293855 305357\nGJT              2909-01 3223-05 3248-17 3259-27 325743 315754 315965\nGLD      2216    2815-06 3229-12 3346-21 3363-31 347546 329054 339466\nGRB 0326 0226-12 0227-17 0330-23 0333-36 0440-46 024358 024362 363359\nGRI      9900-08 3407-11 3421-15 3548-26 3577-34 349748 840558 841864\nGSP 0625 2022-07 2120-14 2327-20 2459-28 2481-39 249251 258951 258750\nGTF      2839    3051-04 3145-09 2951-23 3090-34 800948 318755 309359\nH51 0124 3635+02 3435-02 3140-04 3156-16 3072-27 308341 299648 289854\nH52 3430 3129+03 3037+01 2945-05 2874-18 7603-27 762138 762447 761953\nH61 3119 2740+05 2745+00 2557-06 2589-15 7515-23 753338 753248 753556\nHAT 0521 1629-03 2229-09 2345-14 2358-26 2484-36 740750 742653 743154\nHOU 3533 3236-01 3352-06 3349-10 3169-20 3285-31 820043 329551 801258\nHSV 3529 3523-17 3218-22 2916-29 2556-31 2573-39 257945 267145 276346\nICT 0411 0216-08 3624-12 3534-16 3466-26 3592-35 841448 842356 842261\nILM 0822 2020-03 2323-09 2336-15 2454-25 2480-36 740550 742051 753553\nIMB              2515+01 2625-04 2847-17 2760-28 276744 276154 275766\nIND 3520 0131-20 0326-21 0330-26 0440-38 0448-48 022752 331851 302652\nINK      1712+03 9900-03 3316-05 3339-14 3352-25 315742 316452 327261\nINL 2215 2417-09 2512-14 2708-20 3519-30 3634-40 366154 356563 356966\nJAN 3636 3440-17 3251-18 3172-17 2983-27 2881-38 287845 288049 297349\nJAX 3014 2827-01 2635-05 2546-08 2563-22 2597-32 744842 745348 753549\nJFK 2907 2816-12 2723-16 2635-22 2654-33 2581-42 258954 258256 258154\nJOT 0120 0331-15 0336-18 0337-24 0342-37 0343-47 023855 013657 353655\nLAS      0207+11 0107+06 3315+01 3320-14 3333-26 302942 293352 283762\nLBB      2510+01 2813-04 3424-08 3346-18 3363-27 337643 327953 328464\nLCH 3523 3244-05 3265-07 3263-11 3074-24 3176-35 319245 308750 309853\nLIT 0128 3637-16 3652-18 3565-21 3469-32 3372-41 338047 327648 317149\nLKV              2418+05 2521-02 2639-15 2755-28 266044 276255 275665\nLND              3131+00 3228-06 3144-19 3265-31 308944 318855 308366\nLOU 0219 0121-20 0114-22 0210-27 0210-39 2512-45 252549 273248 283550\nLRD 0611 0413+03 3416-03 3224-04 3340-14 3353-24 316440 306950 308459\nLSE 3612 0322-11 0326-16 0327-22 0337-35 0246-44 015756 016161 365459\nLWS 2107 2717+04 2725-02 2930-07 2836-21 3062-29 298144 299055 307865\nMBW              2933    3038-07 3155-18 3255-30 328244 318255 317567\nMCW 0211 0417-10 0321-15 0225-21 0237-33 0154-42 367354 367859 357360\nMEM 3633 3629-20 3533-23 3540-28 3447-35 3357-40 315745 305945 305846\nMGM 3327 2927-10 2739-13 2655-15 2673-26 2584-38 259248 269747 269349\nMIA 3012 2824+07 2641+04 2442-01 2575-12 2599-21 751237 751347 751458\nMKC 3612 0224-11 0131-14 0138-20 3650-33 3665-41 359951 359956 358757\nMKG 0126 0333-14 0334-18 0336-24 0336-36 0443-46 044157 033160 342357\nMLB 2720 2636+04 2646-01 2556-06 2586-16 7516-24 743738 744248 743657\nMLS      3139+00 3129-05 2939-10 2851-23 2957-34 306050 305358 296758\nMOB 3440 3035-07 2948-09 2958-12 2777-24 2780-38 269047 760347 760750\nMOT      2230-02 2319-07 2520-11 2728-22 2928-33 303049 303459 314567\nMQT 3620 0225-12 0227-16 0226-22 0328-34 0231-45 014659 025064 364362\nMRF              0106-01 3310-04 3334-13 3242-24 315441 316550 306761\nMSP 9900 0508-10 0311-15 0113-21 0127-32 0141-42 366754 366761 357263\nMSY 3434 3144-06 3155-07 3060-10 2873-24 2876-37 278547 279947 279649\nOKC 0318 0124-06 3532-09 3455-14 3370-24 3493-33 840946 841955 842260\nOMA 3507 0411-10 0214-13 0119-20 3640-30 3666-39 359551 851157 850261\nONL      1913-08 2606-11 3216-15 3540-25 3567-34 348748 349758 831266\nONT 0508 9900+14 0806+09 0306+03 0310-13 0217-25 290741 251551 242660\nORF 0322 2919-08 2335-11 2249-17 2358-28 2473-39 249552 249555 740854\nOTH 1920 2128+07 2128+03 2233-03 2347-15 2468-28 246744 246355 247163\nPDX 1911 2118+05 2322+01 2423-05 2546-16 2554-28 256644 257255 265965\nPFN 3126 2831-03 2740-07 2752-10 2665-23 2679-36 751244 752746 752650\nPHX 0918 1109+10 0314+06 0224+02 3632-13 3425-25 303040 293150 303062\nPIE 3017 2838+04 2654-02 2559-07 2579-17 7519-26 754339 754648 753454\nPIH      2414    2925+00 3128-06 3143-20 3072-27 307344 307454 296966\nPIR      2028-06 2613-08 3016-13 3332-23 3448-33 336348 338358 329367\nPLB 3118 3110-15 2809-18 2609-22 2706-35 9900-47 240757 261958 262856\nPRC              0208+06 0121+02 3636-13 3532-25 303641 304151 303962\nPSB      3111-17 3011-19 2718-25 2531-36 2553-45 245753 255354 255554\nPSX 3527 3428+01 3440-04 3240-08 3257-18 3276-29 329542 319351 791156\nPUB              3216-01 3324-07 3339-18 3352-28 337044 327554 328166\nPWM 2412 2716-12 2611-16 2307-22 1910-35 2113-46 253355 254656 255355\nRAP      3111+01 2917-05 3131-10 3134-21 3146-31 325647 317458 308867\nRBL 1705 1915+11 2217+05 2324-01 2539-14 2653-27 265844 255054 255165\nRDM      2309+08 2319+02 2421-03 2647-17 2766-28 266644 265754 254866\nRDU 0627 2417-07 2125-12 2130-18 2352-28 2477-38 249453 249454 750052\nRIC 0120 2913-11 2536-14 2345-19 2359-30 2476-40 249653 248755 249452\nRKS              2936    3039-06 3146-19 3172-28 317443 317955 317466\nRNO      2005    2508+06 2613+00 2730-14 2741-27 284544 274854 266465\nROA 0413 9900-12 2325-15 2331-21 2455-31 2476-40 249153 248054 257852\nROW      1815    9900-02 3119-05 3235-14 3248-25 324942 316052 326962\nSAC 1506 2208+12 2110+05 2417+00 2736-13 2636-27 264143 243554 255964\nSAN 9900 0806+13 0814+09 0718+03 0517-13 0718-25 990041 250750 212160\nSAT 3610 3615+01 3325-04 3232-05 3250-16 3263-26 327541 317551 298757\nSAV 2708 2615-04 2527-09 2538-12 2566-23 2479-35 751546 743348 754952\nSBA 9900 9900+13 9900+09 0505+03 9900-13 0506-26 250642 241752 223661\nSEA 1809 2216+04 2522-02 2529-06 2422-18 2540-29 266345 267556 276565\nSFO 9900 2107+12 2112+06 2220+01 2528-13 2528-26 263644 253553 245863\nSGF 0222 0132-15 0143-15 0149-21 3659-34 3567-43 358650 348952 337252\nSHV 0123 3642-11 3457-10 3364-17 3284-26 3287-38 339948 339752 319552\nSIY      2013+09 2122+04 2327-02 2441-14 2558-27 255544 254855 256365\nSLC      9900    2918+00 3031-04 3158-18 3157-28 315543 315454 306066\nSLN 9900 0210-08 3618-12 3528-16 3460-26 3589-35 851048 842057 842262\nSPI 3521 0127-17 0338-19 0345-24 0349-37 0249-46 014954 364554 344352\nSPS 0317 3630-03 3340-07 3350-12 3368-20 3383-31 339845 830554 339962\nSSM 0423 0225-13 0230-18 0336-23 0441-35 0337-45 363559 013265 013161\nSTL 3420 3527-19 0237-20 0347-24 0251-36 0154-45 365653 355152 334951\nSYR 3020 3112-16 2911-18 2908-24 0106-36 0308-47 270955 252556 253456\nT01 3526 3344-01 3352-05 3145-08 3065-22 3185-31 308744 790047 791152\nT06 3336 3241+00 3247-05 3042-09 2868-22 2875-35 279643 770945 770851\nT07 3328 3133-01 2941-04 2944-08 2767-22 2773-35 761941 762545 762650\nTCC      1507    2517-03 3220-06 3238-17 3355-27 326943 327053 327863\nTLH 3121 2630-04 2737-08 2651-10 2669-23 2580-35 751843 753146 752952\nTRI      9900-13 2114-17 2227-22 2352-33 2377-41 249251 247551 257250\nTUL 0324 0130-09 3638-12 3544-18 3470-29 3495-38 842148 842954 348856\nTUS      1118+11 0415+07 0221+03 3522-12 3224-24 292040 272450 313062\nTVC 0121 0235-13 0334-17 0336-23 0435-36 0339-46 024158 023863 352058\nTYS 0221 0311-15 2110-18 2125-22 2351-33 2377-41 248949 257048 256748\nWJF      0913+13 9900+09 3409+03 3507-13 3613-26 281142 262152 242761\nYKM 9900 2509+04 2518-01 2627-06 2628-19 2747-29 277145 277755 286664\nZUN              0112+02 3519-01 3540-14 3335-25 314442 315451 315963\n2XG 2816 2429+01 2539-03 2550-06 2560-21 7506-28 745041 746149 744253\n4J3 3217 2734+00 2741-03 2748-08 2667-20 7505-31 754339 754047 752551\n"
  },
  "windAloft24": {
    "@context": {
      "@version": "1.1",
      "@vocab": "https://api.weather.gov/ontology#"
    },
    "@id": "https://api.weather.gov/products/299993d1-43e7-4d0f-a9ed-71c468f458cd",
    "id": "299993d1-43e7-4d0f-a9ed-71c468f458cd",
    "wmoCollectiveId": "FBUS35",
    "issuingOffice": "KWNO",
    "issuanceTime": "2026-01-31T01:58:00+00:00",
    "productCode": "FD5",
    "productName": "Winds Aloft Forecast",
    "productText": "\n000\nFBUS35 KWNO 310158\nFD5US5\nDATA BASED ON 310000Z    \nVALID 010000Z   FOR USE 1800-0600Z. TEMPS NEG ABV 24000\n\nFT  3000    6000    9000   12000   18000   24000  30000  34000  39000\nABI      2523+02 2919-03 3027-06 3147-15 3257-25 326843 327154 308161\nABQ              3225+03 3329-02 3437-13 3442-26 324143 315252 298260\nABR 2139 2822-02 3022-07 2919-12 2829-25 2824-37 250651 280659 334060\nACK 9900 2205-09 2715-13 2646-17 2378-28 2383-39 239953 730755 249355\nACY 0421 0110-09 3015-12 2427-17 2252-29 2168-41 227053 228055 238054\nAGC 3517 0119-15 0116-17 3612-22 2609-35 2412-45 222154 242254 252853\nALB 3611 9900-13 2805-16 9900-22 2432-33 2463-43 246254 235754 235255\nALS                      3325-05 3538-17 3458-27 335843 325754 316464\nAMA      2825    3115+01 3321-05 3340-17 3465-28 317543 318254 308665\nAST 1928 2134+05 2139-01 2140-07 2260-18 2275-29 228744 229155 237562\nATL 3338 3634-17 3634-21 3537-27 3636-39 3336-40 304742 295442 295845\nAVP 3618 3507-13 3207-16 2620-21 2354-31 2368-43 236754 245654 234954\nAXN 2043 2139-07 2229-10 2621-14 3021-25 3123-36 342651 353360 343566\nBAM              2111+06 2512+00 2924-14 2731-27 283543 283655 274265\nBCE                      3516+00 3328-14 3542-26 333844 324654 314063\nBDL 0113 9900-11 2708-16 2632-20 2474-30 2378-42 238454 238656 247256\nBFF      3230    3141-03 3345-11 3355-23 3479-34 831747 831656 820861\nBGR 3406 2608-11 2610-16 2606-22 9900-35 2435-44 246153 256455 256056\nBHM 3431 3638-16 3541-19 3551-24 3573-33 3480-39 327646 317646 307947\nBIH      9900    1707+07 2106+02 1908-13 1915-27 201344 251953 253263\nBIL      2927    3128-02 3230-07 3251-21 3264-31 328546 339657 317865\nBLH 0408 0612+13 0807+09 0908+04 0907-13 0513-26 990042 200551 272158\nBML 3217 9900-12 2606-16 9900-22 9900-35 2212-45 244254 245255 245256\nBNA 3327 3629-18 0137-18 0145-23 0157-34 3666-42 356451 345450 325049\nBOI      1612+07 2311+03 2619-03 2737-15 2852-28 285644 285855 285867\nBOS 3509 2605-11 2708-15 2633-20 2473-30 2483-41 239154 249356 247755\nBRL 3608 0111-10 0116-14 0120-20 3532-30 3551-39 367253 357360 347160\nBRO 0412 3612+03 3410-02 3021-02 2941-11 2953-23 295739 298048 289858\nBUF 3313 0219-14 0223-19 0221-23 0219-35 0115-46 280954 271356 251855\nCAE 0135 1308-12 2009-16 1626-23 1835-33 2050-40 225445 245843 246145\nCAR 3419 3206-11 2807-16 2806-22 2605-35 2605-45 251757 253557 254056\nCGI 0119 0130-11 0134-15 0139-21 3651-30 3566-40 357852 347755 347355\nCHS 0121 2516-10 1924-14 1831-21 2151-31 2258-39 237943 238043 238646\nCLE 3522 0225-13 0327-17 0333-23 0334-35 0333-45 022255 351657 291455\nCLL 0414 3421+00 3232-05 3238-09 3054-16 3168-26 317543 308352 309160\nCMH 3620 0326-15 0329-17 0328-23 0331-35 0330-45 022654 351554 291953\nCOU 3207 0212-09 0117-14 3625-19 3543-28 3561-37 347450 347659 337361\nCRP 0418 3417+02 3213-03 3027-03 3047-13 2954-25 307340 297950 299059\nCRW 3518 0222-16 0216-17 3512-22 2020-35 2215-45 211352 241651 252852\nCSG 3333 3541-17 3440-20 3441-27 3353-36 3269-37 307443 297742 297344\nCVG 3619 0227-17 0232-17 0235-23 0341-35 0243-45 014054 362954 312753\nCZI              3223-03 3237-09 3461-20 3475-32 339446 830556 820065\nDAL 1007 3312-02 3128-06 3237-11 3157-19 3174-28 319444 319553 319362\nDBQ 9900 0105-10 0110-14 0115-20 3629-30 3649-39 366554 366760 356762\nDEN              3222+00 3334-06 3250-19 3471-31 339145 339555 319365\nDIK      3241-03 3253-05 3361-10 3259-23 3253-35 337150 337957 338460\nDLH 2228 2127-08 2223-13 2414-17 3316-27 3432-38 354452 365161 345368\nDLN              2916-01 3022-05 3042-18 3158-29 316645 308256 308266\nDRT 1315 2116+03 2809+00 2922-02 3134-13 3043-25 306440 296950 297860\nDSM 2110 2306-07 2906-12 3112-17 3533-27 3545-37 344851 344960 345465\nECK 0123 0328-11 0330-16 0331-22 0231-35 0236-46 023557 013058 342257\nEKN      0221-15 3611-15 3010-21 2228-34 2229-44 213354 223353 243652\nELP      9900    3309+04 3518+00 3325-13 3233-24 304040 294250 295360\nELY              9900+05 3006+00 3020-14 3230-27 323843 313054 294464\nEMI 0125 0315-12 3311-14 2822-20 2254-30 2167-42 226655 236554 235352\nEVV 3527 0234-13 0137-16 0237-22 0146-33 3655-43 367053 356455 335253\nEYW 3137 2535+05 2750+03 2755-03 2779-11 2696-21 751937 752646 752154\nFAT 1406 1510+14 1707+09 2109+02 1719-14 1826-27 192043 232153 233262\nGPI      2414+00 2723-02 2827-06 2835-20 2954-29 297246 299057 297966\nFLO 0438 1227-07 1511-12 1912-19 2040-33 2160-42 226445 236544 237346\nFMN              3419+03 3527-03 3446-14 3448-26 344844 324653 315363\nFOT 1818 1924+09 2030+02 2036-04 2169-16 2173-28 217343 216954 227362\nFSD 1934 2132-07 2526-08 2722-13 3123-25 2922-37 311451 321161 334360\nFSM 3207 3614-06 3523-10 3434-15 3354-23 3259-33 316750 327756 318257\nFWA 3515 0230-12 0332-16 0335-22 0239-34 0238-46 014455 014657 352755\nGAG      2723+01 3228-02 3333-08 3355-19 3263-31 820245 820455 810963\nGCK      3220+04 3426-02 3331-08 3262-20 3266-34 820746 821154 821162\nGEG      2316+05 2421+00 2424-06 2744-18 2754-29 265445 267356 277666\nGFK 2149 2426-03 2721-07 2525-13 2726-23 2818-34 310951 311561 332965\nGGW      3248+00 3155-04 3255-08 3270-22 3382-33 830048 821258 810063\nGJT              3310+01 3526-04 3342-16 3457-27 336544 326354 326663\nGLD      3323    3332-03 3331-09 3260-22 3277-34 831046 821155 821461\nGRB 9900 0311-10 0213-14 3616-20 3624-32 3637-42 016155 015761 365061\nGRI      2625-05 3130-06 3239-11 3328-25 3234-38 313152 324355 326057\nGSP 3535 0432-16 0417-20 0505-23 1125-37 1726-43 232745 253644 264546\nGTF      2818    2823-02 3029-06 3043-20 3153-31 308146 319457 308467\nH51 0222 3433+02 3432-03 3138-03 3049-11 2961-24 307640 298249 299358\nH52 3529 3445-01 3351-02 3157-03 3065-13 2981-24 289241 780249 781056\nH61 3336 3048-04 2965-03 2880-04 2895-13 7700-25 761140 761849 762554\nHAT 0348 1032-03 1725-05 2034-12 2248-26 2258-39 229249 721450 731950\nHOU 0322 3427+00 3341-05 3244-09 3057-16 3069-25 308142 309252 309660\nHSV 3426 3639-18 3640-19 3647-24 3668-34 3576-41 347048 326647 316748\nICT 2017 2114-08 2725-08 3027-11 3246-23 3253-35 326250 327756 318258\nILM 0439 1129-04 1931-09 2122-16 2245-29 2259-40 228547 228948 239947\nIMB              2418+03 2330-03 2548-16 2450-29 246244 256055 256866\nIND 3523 0333-12 0334-16 0336-22 0241-34 0145-45 016054 365756 343954\nINK      2317+04 2819+01 3222-02 3231-13 3234-25 315041 316451 297461\nINL 2148 2243-07 2232-11 2324-15 2818-25 3327-36 354351 345061 344568\nJAN 3424 0142-10 3651-13 3555-18 3384-23 8204-31 810548 810255 309252\nJAX 3037 3035-16 2740-17 2562-17 2572-26 2590-33 751238 760942 750247\nJFK 0318 0305-11 2818-13 2533-18 2263-29 2373-41 227554 228456 237655\nJOT 0214 0220-11 0322-15 0324-21 0134-33 3648-42 365655 365560 355559\nLAS      0308+12 0306+07 9900+03 3306-13 0115-26 351343 292152 283162\nLBB      2528+04 2919+00 3223-04 3145-15 3356-26 315643 315854 307562\nLCH 3622 3534-03 3441-07 3353-10 3165-18 3082-27 309943 800453 309259\nLIT 3216 0127-09 3633-13 3543-17 3465-25 3380-33 328549 328158 318455\nLKV              2326+04 2126-01 2345-15 2355-28 235843 245455 245665\nLND              3312-01 3220-05 3344-19 3357-29 337645 328355 326566\nLOU 3523 0127-17 0234-17 0239-23 0245-35 0251-44 015053 363553 323452\nLRD 0913 2007+03 2405-02 2918-02 3040-12 2952-24 295840 296949 289059\nLSE 2205 9900-09 9900-14 3407-19 3627-29 3645-39 366452 367161 346665\nLWS 1507 2112+07 2416+01 2521-05 2743-18 2864-28 276444 277455 277968\nMBW              2927    3235-07 3364-20 3474-32 339246 830356 319064\nMCW 2016 2113-07 2409-12 2810-18 3528-27 3540-37 354551 354860 345767\nMEM 3319 0135-11 3641-14 3645-20 3560-29 3480-37 339549 339854 327753\nMGM 3332 3540-16 3445-19 3455-24 3377-31 3284-38 319144 309345 299146\nMIA 2933 2656+05 2559+00 2663-05 2687-12 7504-22 752438 752747 743053\nMKC 2107 9900-07 3209-11 3219-16 3439-26 3446-36 334751 334260 326059\nMKG 0220 0219-11 0224-15 0227-21 0234-34 0245-44 015656 015361 354259\nMLB 2839 2757-03 2662-05 2578-09 7608-17 7523-25 753439 754247 753951\nMLS      3241+01 3144-04 3249-09 3364-22 3483-32 830148 831458 820663\nMOB 3328 3647-12 3556-13 3464-17 3298-21 8121-29 801646 800952 781654\nMOT      3139-04 3137-07 3143-11 3247-22 3138-34 302351 303358 325260\nMQT 9900 3608-10 3611-15 3513-20 3622-32 3638-42 366356 016062 365063\nMRF              2615+01 3014+00 3125-13 3139-24 305140 295150 286260\nMSP 2125 2124-08 2221-13 2513-17 3320-26 3434-37 353952 354660 345468\nMSY 3426 3543-06 3450-10 3364-13 3188-18 3095-28 800744 801852 299959\nOKC 2010 2510-03 2923-07 3034-11 3251-21 3170-32 830146 821654 820561\nOMA 2221 2120-06 2315-11 3019-14 3329-25 3334-37 322752 322460 325059\nONL      3126-01 3336-06 3235-11 3125-25 3027-38 312752 333756 325558\nONT 9900 0907+15 9900+09 1705+02 1215-14 1120-26 121142 161351 232158\nORF 0430 0125-07 9900-11 1612-16 1935-26 2051-40 217753 228952 238650\nOTH 2025 2033+06 2042+01 2045-05 2173-17 2178-29 218644 218655 228359\nPDX 1915 2125+06 2232+00 2238-06 2365-17 2373-29 228044 228155 246763\nPFN 3331 3442-13 3350-17 3263-20 3089-25 8014-32 792442 781847 782251\nPHX 0606 0614+13 0613+09 0416+03 0119-12 0119-25 321642 291751 273259\nPIE 3234 3051-09 2869-07 2783-09 7708-16 7721-26 763240 763548 763652\nPIH      1906    2915+01 3121-04 3143-16 3268-28 316644 317556 307166\nPIR      3136-02 3135-07 3032-12 3041-24 3353-36 335352 334957 335958\nPLB 3309 0407-12 9900-17 9900-22 9900-35 9900-46 232055 243355 243656\nPRC              0409+07 0312+02 3517-13 0126-26 312242 302552 293861\nPSB      3615-14 3410-16 3209-22 2521-34 2342-43 234654 243854 243554\nPSX 0518 3425+02 3228-04 3136-06 3052-14 3062-25 307841 309250 299459\nPUB              3310+02 3223-05 3342-18 3469-29 338445 338255 308964\nPWM 3407 2508-11 2708-16 2605-22 2540-32 2477-42 248354 248055 246756\nRAP      3147+00 3357-04 3361-10 3450-23 3353-37 349449 830456 831160\nRBL 1708 1919+11 2025+04 2230-02 2153-15 2157-27 215043 224954 225663\nRDM      2209+08 2327+02 2233-03 2357-16 2358-28 236744 236455 237265\nRDU 0443 0621-08 9900-13 1821-18 1737-29 1748-42 216952 227349 237248\nRIC 0335 0320-09 3609-13 2616-18 1944-28 1953-42 217053 227752 237051\nRKS              3125    3228-04 3339-18 3355-29 337645 327755 327765\nRNO      1606    2211+07 2317+01 2127-14 2135-27 233143 243454 244364\nROA 0118 0327-17 0207-14 2016-19 2020-34 1945-43 204652 224351 244950\nROW      2414    3318+03 3419-02 3232-13 3334-25 314142 316052 308661\nSAC 1614 1812+12 1915+07 2125+00 2039-14 2045-27 204143 213354 234461\nSAN 0910 1110+14 1110+10 1111+03 1122-14 1125-26 121742 161950 221856\nSAT 0613 3110+02 2908-02 3126-03 3045-13 3050-25 307140 297950 298959\nSAV 3328 2923-14 2317-20 2225-23 2255-28 2361-37 247542 257742 248146\nSBA 9900 1206+14 1509+09 1813+02 1421-14 1428-27 151242 181752 221760\nSEA 1920 2027+04 2231-01 2240-07 2358-17 2363-29 236944 237556 247264\nSFO 1910 1813+12 1816+06 2025+00 2038-15 1947-27 203643 223653 224560\nSGF 3209 3612-08 3520-12 3528-17 3450-26 3462-35 336850 336159 327057\nSHV 3411 3624-05 3534-10 3445-13 3264-20 3177-31 319446 811354 319161\nSIY      2019+09 2127+03 2132-02 2159-15 2164-28 226343 225854 226364\nSLC      9900    3210+02 3224-03 3242-15 3356-28 336144 326555 316765\nSLN 2021 2121-08 2724-08 3128-11 3338-24 3247-36 324851 326156 317457\nSPI 0114 0221-10 0225-15 0228-21 3639-31 3652-41 356454 356658 346757\nSPS 1907 2613-01 2927-04 3132-09 3253-19 3268-28 329544 820054 319763\nSSM 0211 0116-11 0120-16 0121-21 0124-34 0133-44 014357 014462 363562\nSTL 3615 0222-10 0226-14 0130-20 3642-30 3556-40 357453 357557 347258\nSYR 3412 0115-14 0109-18 3405-23 9900-35 9900-45 232354 243055 243355\nT01 0229 3435-01 3346-04 3248-06 3060-15 3075-25 298642 299951 790159\nT06 3632 3541-03 3350-07 3262-08 3174-16 2989-26 309642 790751 790758\nT07 3435 3445-06 3350-09 3265-12 3095-16 7906-27 791243 792051 782357\nTCC      2918    3416+02 3423-04 3336-15 3456-26 315643 306154 307363\nTLH 3235 3343-15 3247-19 3157-24 2984-26 2995-34 781140 781443 780245\nTRI      0227-18 0322-18 0418-23 1416-35 1523-46 221548 252047 263448\nTUL 1906 3005-05 3217-09 3333-13 3246-23 3254-34 316549 327955 318058\nTUS      1015+12 0612+09 0617+04 0218-12 3518-25 311641 281350 272958\nTVC 0319 0219-10 0120-15 0121-21 0226-34 0240-44 014956 014861 363861\nTYS 3421 0224-19 0229-20 0233-25 0615-37 0512-46 331746 292446 293748\nWJF      0913+13 1705+09 2109+03 1414-14 1220-26 140943 201152 232360\nYKM 9900 2116+06 2323+00 2332-05 2451-16 2461-29 257544 247455 256766\nZUN              3514+04 3625+00 3546-14 3543-26 324343 315252 296361\n2XG 2932 2331-03 2345-08 2367-13 2491-24 7414-31 744239 745647 743452\n4J3 3334 3143-10 3058-11 3069-14 7907-18 7927-27 782941 773249 773252\n"
  },
  "sounding": [
    {
      "Pressure_mb": 885.2,
      "Altitude_m": 1289,
      "Temp_c": -2.9,
      "Dewpoint_c": -3.3,
      "Wind_Direction": 153,
      "Wind_Speed_kt": 1
    },
    {
      "Pressure_mb": 884.4,
      "Altitude_m": 1296,
      "Temp_c": -3,
      "Dewpoint_c": -3.7,
      "Wind_Direction": 127,
      "Wind_Speed_kt": 2
    },
    {
      "Pressure_mb": 883.5,
      "Altitude_m": 1304,
      "Temp_c": -3.2,
      "Dewpoint_c": -4.2,
      "Wind_Direction": 127,
      "Wind_Speed_kt": 2
    },
    {
      "Pressure_mb": 882.6,
      "Altitude_m": 1312,
      "Temp_c": -3.3,
      "Dewpoint_c": -4.6,
      "Wind_Direction": 127,
      "Wind_Speed_kt": 2
    },
    {
      "Pressure_mb": 881.8,
      "Altitude_m": 1320,
      "Temp_c": -3.4,
      "Dewpoint_c": -5.1,
      "Wind_Direction": 127,
      "Wind_Speed_kt": 2
    },
    {
      "Pressure_mb": 880.9,
      "Altitude_m": 1327,
      "Temp_c": -3.5,
      "Dewpoint_c": -5.5,
      "Wind_Direction": 127,
      "Wind_Speed_kt": 2
    },
    {
      "Pressure_mb": 880.1,
      "Altitude_m": 1335,
      "Temp_c": -3.7,
      "Dewpoint_c": -6,
      "Wind_Direction": 127,
      "Wind_Speed_kt": 2
    },
    {
      "Pressure_mb": 879,
      "Altitude_m": 1346,
      "Temp_c": -3.6,
      "Dewpoint_c": -6.4,
      "Wind_Direction": 132,
      "Wind_Speed_kt": 2
    },
    {
      "Pressure_mb": 878.6,
      "Altitude_m": 1349,
      "Temp_c": -3.5,
      "Dewpoint_c": -6.4,
      "Wind_Direction": 133,
      "Wind_Speed_kt": 2
    },
    {
      "Pressure_mb": 877.9,
      "Altitude_m": 1355,
      "Temp_c": -3.4,
      "Dewpoint_c": -6.2,
      "Wind_Direction": 137,
      "Wind_Speed_kt": 2
    },
    {
      "Pressure_mb": 877.2,
      "Altitude_m": 1361,
      "Temp_c": -3.3,
      "Dewpoint_c": -6.1,
      "Wind_Direction": 140,
      "Wind_Speed_kt": 2
    },
    {
      "Pressure_mb": 876.5,
      "Altitude_m": 1368,
      "Temp_c": -3.2,
      "Dewpoint_c": -5.9,
      "Wind_Direction": 144,
      "Wind_Speed_kt": 2
    },
    {
      "Pressure_mb": 875.8,
      "Altitude_m": 1374,
      "Temp_c": -3.1,
      "Dewpoint_c": -5.8,
      "Wind_Direction": 147,
      "Wind_Speed_kt": 2
    },
    {
      "Pressure_mb": 875.1,
      "Altitude_m": 1380,
      "Temp_c": -3,
      "Dewpoint_c": -5.6,
      "Wind_Direction": 150,
      "Wind_Speed_kt": 2.1
    },
    {
      "Pressure_mb": 874.4,
      "Altitude_m": 1386,
      "Temp_c": -2.9,
      "Dewpoint_c": -5.5,
      "Wind_Direction": 154,
      "Wind_Speed_kt": 2.1
    },
    {
      "Pressure_mb": 873.7,
      "Altitude_m": 1392,
      "Temp_c": -2.8,
      "Dewpoint_c": -5.3,
      "Wind_Direction": 157,
      "Wind_Speed_kt": 2.1
    },
    {
      "Pressure_mb": 873.2,
      "Altitude_m": 1397,
      "Temp_c": -2.8,
      "Dewpoint_c": -5.2,
      "Wind_Direction": 156,
      "Wind_Speed_kt": 2.1
    },
    {
      "Pressure_mb": 872.4,
      "Altitude_m": 1404,
      "Temp_c": -2.6,
      "Dewpoint_c": -5.1,
      "Wind_Direction": 155,
      "Wind_Speed_kt": 2.2
    },
    {
      "Pressure_mb": 871.7,
      "Altitude_m": 1410,
      "Temp_c": -2.5,
      "Dewpoint_c": -4.9,
      "Wind_Direction": 155,
      "Wind_Speed_kt": 2.2
    },
    {
      "Pressure_mb": 871.1,
      "Altitude_m": 1416,
      "Temp_c": -2.4,
      "Dewpoint_c": -4.8,
      "Wind_Direction": 154,
      "Wind_Speed_kt": 2.2
    },
    {
      "Pressure_mb": 870.5,
      "Altitude_m": 1422,
      "Temp_c": -2.3,
      "Dewpoint_c": -4.6,
      "Wind_Direction": 154,
      "Wind_Speed_kt": 2.3
    },
    {
      "Pressure_mb": 869.8,
      "Altitude_m": 1427,
      "Temp_c": -2.3,
      "Dewpoint_c": -4.7,
      "Wind_Direction": 153,
      "Wind_Speed_kt": 2.3
    },
    {
      "Pressure_mb": 869.2,
      "Altitude_m": 1433,
      "Temp_c": -2.3,
      "Dewpoint_c": -4.8,
      "Wind_Direction": 153,
      "Wind_Speed_kt": 2.4
    },
    {
      "Pressure_mb": 868.6,
      "Altitude_m": 1439,
      "Temp_c": -2.2,
      "Dewpoint_c": -4.9,
      "Wind_Direction": 152,
      "Wind_Speed_kt": 2.4
    },
    {
      "Pressure_mb": 868,
      "Altitude_m": 1444,
      "Temp_c": -2.2,
      "Dewpoint_c": -4.9,
      "Wind_Direction": 152,
      "Wind_Speed_kt": 2.4
    },
    {
      "Pressure_mb": 867.3,
      "Altitude_m": 1451,
      "Temp_c": -2.2,
      "Dewpoint_c": -5,
      "Wind_Direction": 152,
      "Wind_Speed_kt": 2.5
    },
    {
      "Pressure_mb": 866.6,
      "Altitude_m": 1458,
      "Temp_c": -2.2,
      "Dewpoint_c": -5.1,
      "Wind_Direction": 151,
      "Wind_Speed_kt": 2.5
    },
    {
      "Pressure_mb": 865.9,
      "Altitude_m": 1465,
      "Temp_c": -2.1,
      "Dewpoint_c": -5.2,
      "Wind_Direction": 151,
      "Wind_Speed_kt": 2.6
    },
    {
      "Pressure_mb": 865.2,
      "Altitude_m": 1471,
      "Temp_c": -2.1,
      "Dewpoint_c": -5.3,
      "Wind_Direction": 150,
      "Wind_Speed_kt": 2.6
    },
    {
      "Pressure_mb": 864.5,
      "Altitude_m": 1478,
      "Temp_c": -2.1,
      "Dewpoint_c": -5.4,
      "Wind_Direction": 152,
      "Wind_Speed_kt": 2.6
    },
    {
      "Pressure_mb": 863.8,
      "Altitude_m": 1483,
      "Temp_c": -2,
      "Dewpoint_c": -5.4,
      "Wind_Direction": 154,
      "Wind_Speed_kt": 2.7
    },
    {
      "Pressure_mb": 863.3,
      "Altitude_m": 1488,
      "Temp_c": -2,
      "Dewpoint_c": -5.5,
      "Wind_Direction": 156,
      "Wind_Speed_kt": 2.7
    },
    {
      "Pressure_mb": 862.7,
      "Altitude_m": 1493,
      "Temp_c": -2,
      "Dewpoint_c": -5.6,
      "Wind_Direction": 157,
      "Wind_Speed_kt": 2.8
    },
    {
      "Pressure_mb": 861.9,
      "Altitude_m": 1500,
      "Temp_c": -1.9,
      "Dewpoint_c": -5.7,
      "Wind_Direction": 160,
      "Wind_Speed_kt": 2.8
    },
    {
      "Pressure_mb": 861.6,
      "Altitude_m": 1503,
      "Temp_c": -1.9,
      "Dewpoint_c": -5.8,
      "Wind_Direction": 161,
      "Wind_Speed_kt": 2.9
    },
    {
      "Pressure_mb": 861.1,
      "Altitude_m": 1507,
      "Temp_c": -1.8,
      "Dewpoint_c": -5.8,
      "Wind_Direction": 162,
      "Wind_Speed_kt": 2.9
    },
    {
      "Pressure_mb": 860.6,
      "Altitude_m": 1513,
      "Temp_c": -1.7,
      "Dewpoint_c": -5.8,
      "Wind_Direction": 164,
      "Wind_Speed_kt": 3
    },
    {
      "Pressure_mb": 860,
      "Altitude_m": 1518,
      "Temp_c": -1.6,
      "Dewpoint_c": -5.9,
      "Wind_Direction": 165,
      "Wind_Speed_kt": 3
    },
    {
      "Pressure_mb": 859.5,
      "Altitude_m": 1523,
      "Temp_c": -1.6,
      "Dewpoint_c": -5.9,
      "Wind_Direction": 167,
      "Wind_Speed_kt": 3
    },
    {
      "Pressure_mb": 858.9,
      "Altitude_m": 1528,
      "Temp_c": -1.5,
      "Dewpoint_c": -6,
      "Wind_Direction": 168,
      "Wind_Speed_kt": 3.1
    },
    {
      "Pressure_mb": 858.4,
      "Altitude_m": 1533,
      "Temp_c": -1.4,
      "Dewpoint_c": -6,
      "Wind_Direction": 170,
      "Wind_Speed_kt": 3.1
    },
    {
      "Pressure_mb": 857.8,
      "Altitude_m": 1538,
      "Temp_c": -1.3,
      "Dewpoint_c": -6.1,
      "Wind_Direction": 171,
      "Wind_Speed_kt": 3.2
    },
    {
      "Pressure_mb": 857.2,
      "Altitude_m": 1543,
      "Temp_c": -1.3,
      "Dewpoint_c": -6.1,
      "Wind_Direction": 172,
      "Wind_Speed_kt": 3.2
    },
    {
      "Pressure_mb": 856.7,
      "Altitude_m": 1549,
      "Temp_c": -1.2,
      "Dewpoint_c": -6.2,
      "Wind_Direction": 173,
      "Wind_Speed_kt": 3.2
    },
    {
      "Pressure_mb": 856.1,
      "Altitude_m": 1554,
      "Temp_c": -1.1,
      "Dewpoint_c": -6.2,
      "Wind_Direction": 174,
      "Wind_Speed_kt": 3.3
    },
    {
      "Pressure_mb": 855.6,
      "Altitude_m": 1559,
      "Temp_c": -1.1,
      "Dewpoint_c": -6.3,
      "Wind_Direction": 176,
      "Wind_Speed_kt": 3.4
    },
    {
      "Pressure_mb": 855,
      "Altitude_m": 1564,
      "Temp_c": -1,
      "Dewpoint_c": -6.3,
      "Wind_Direction": 175,
      "Wind_Speed_kt": 3.3
    },
    {
      "Pressure_mb": 854.4,
      "Altitude_m": 1569,
      "Temp_c": -0.9,
      "Dewpoint_c": -6.4,
      "Wind_Direction": 175,
      "Wind_Speed_kt": 3.2
    },
    {
      "Pressure_mb": 853.9,
      "Altitude_m": 1575,
      "Temp_c": -0.8,
      "Dewpoint_c": -6.3,
      "Wind_Direction": 175,
      "Wind_Speed_kt": 3.1
    },
    {
      "Pressure_mb": 853.3,
      "Altitude_m": 1581,
      "Temp_c": -0.7,
      "Dewpoint_c": -6.3,
      "Wind_Direction": 175,
      "Wind_Speed_kt": 3
    },
    {
      "Pressure_mb": 852.7,
      "Altitude_m": 1586,
      "Temp_c": -0.6,
      "Dewpoint_c": -6.3,
      "Wind_Direction": 174,
      "Wind_Speed_kt": 3
    },
    {
      "Pressure_mb": 852.1,
      "Altitude_m": 1592,
      "Temp_c": -0.5,
      "Dewpoint_c": -6.3,
      "Wind_Direction": 174,
      "Wind_Speed_kt": 2.9
    },
    {
      "Pressure_mb": 851.5,
      "Altitude_m": 1597,
      "Temp_c": -0.4,
      "Dewpoint_c": -6.2,
      "Wind_Direction": 174,
      "Wind_Speed_kt": 2.8
    },
    {
      "Pressure_mb": 850.9,
      "Altitude_m": 1603,
      "Temp_c": -0.3,
      "Dewpoint_c": -6.2,
      "Wind_Direction": 173,
      "Wind_Speed_kt": 2.7
    },
    {
      "Pressure_mb": 850.3,
      "Altitude_m": 1608,
      "Temp_c": -0.2,
      "Dewpoint_c": -6.2,
      "Wind_Direction": 173,
      "Wind_Speed_kt": 2.6
    },
    {
      "Pressure_mb": 850,
      "Altitude_m": 1611,
      "Temp_c": -0.1,
      "Dewpoint_c": -6.2,
      "Wind_Direction": 173,
      "Wind_Speed_kt": 2.6
    },
    {
      "Pressure_mb": 849.3,
      "Altitude_m": 1619,
      "Temp_c": 0,
      "Dewpoint_c": -6.1,
      "Wind_Direction": 172,
      "Wind_Speed_kt": 2.5
    },
    {
      "Pressure_mb": 848.7,
      "Altitude_m": 1624,
      "Temp_c": 0.1,
      "Dewpoint_c": -6.1,
      "Wind_Direction": 172,
      "Wind_Speed_kt": 2.4
    },
    {
      "Pressure_mb": 848.2,
      "Altitude_m": 1629,
      "Temp_c": 0.2,
      "Dewpoint_c": -6.1,
      "Wind_Direction": 171,
      "Wind_Speed_kt": 2.3
    },
    {
      "Pressure_mb": 847.6,
      "Altitude_m": 1634,
      "Temp_c": 0.3,
      "Dewpoint_c": -6,
      "Wind_Direction": 171,
      "Wind_Speed_kt": 2.3
    },
    {
      "Pressure_mb": 847.1,
      "Altitude_m": 1639,
      "Temp_c": 0.4,
      "Dewpoint_c": -6,
      "Wind_Direction": 170,
      "Wind_Speed_kt": 2.2
    },
    {
      "Pressure_mb": 846.6,
      "Altitude_m": 1644,
      "Temp_c": 0.4,
      "Dewpoint_c": -6.1,
      "Wind_Direction": 170,
      "Wind_Speed_kt": 2.1
    },
    {
      "Pressure_mb": 846.1,
      "Altitude_m": 1649,
      "Temp_c": 0.4,
      "Dewpoint_c": -6.1,
      "Wind_Direction": 169,
      "Wind_Speed_kt": 2
    },
    {
      "Pressure_mb": 845.6,
      "Altitude_m": 1653,
      "Temp_c": 0.4,
      "Dewpoint_c": -6.2,
      "Wind_Direction": 168,
      "Wind_Speed_kt": 1.9
    },
    {
      "Pressure_mb": 845.1,
      "Altitude_m": 1658,
      "Temp_c": 0.4,
      "Dewpoint_c": -6.2,
      "Wind_Direction": 168,
      "Wind_Speed_kt": 1.9
    },
    {
      "Pressure_mb": 844.6,
      "Altitude_m": 1662,
      "Temp_c": 0.5,
      "Dewpoint_c": -6.3,
      "Wind_Direction": 167,
      "Wind_Speed_kt": 1.8
    },
    {
      "Pressure_mb": 844.1,
      "Altitude_m": 1667,
      "Temp_c": 0.5,
      "Dewpoint_c": -6.3,
      "Wind_Direction": 167,
      "Wind_Speed_kt": 1.8
    },
    {
      "Pressure_mb": 843.6,
      "Altitude_m": 1671,
      "Temp_c": 0.5,
      "Dewpoint_c": -6.4,
      "Wind_Direction": 167,
      "Wind_Speed_kt": 1.8
    },
    {
      "Pressure_mb": 843.1,
      "Altitude_m": 1676,
      "Temp_c": 0.5,
      "Dewpoint_c": -6.4,
      "Wind_Direction": 167,
      "Wind_Speed_kt": 1.8
    },
    {
      "Pressure_mb": 842.6,
      "Altitude_m": 1680,
      "Temp_c": 0.5,
      "Dewpoint_c": -6.5,
      "Wind_Direction": 168,
      "Wind_Speed_kt": 1.8
    },
    {
      "Pressure_mb": 842.1,
      "Altitude_m": 1686,
      "Temp_c": 0.5,
      "Dewpoint_c": -6.5,
      "Wind_Direction": 168,
      "Wind_Speed_kt": 1.8
    },
    {
      "Pressure_mb": 841.5,
      "Altitude_m": 1691,
      "Temp_c": 0.5,
      "Dewpoint_c": -6.5,
      "Wind_Direction": 168,
      "Wind_Speed_kt": 1.9
    },
    {
      "Pressure_mb": 841,
      "Altitude_m": 1696,
      "Temp_c": 0.6,
      "Dewpoint_c": -6.6,
      "Wind_Direction": 168,
      "Wind_Speed_kt": 1.9
    },
    {
      "Pressure_mb": 840.4,
      "Altitude_m": 1702,
      "Temp_c": 0.6,
      "Dewpoint_c": -6.7,
      "Wind_Direction": 169,
      "Wind_Speed_kt": 1.9
    },
    {
      "Pressure_mb": 840,
      "Altitude_m": 1705,
      "Temp_c": 0.6,
      "Dewpoint_c": -6.7,
      "Wind_Direction": 169,
      "Wind_Speed_kt": 1.9
    },
    {
      "Pressure_mb": 839.1,
      "Altitude_m": 1714,
      "Temp_c": 0.5,
      "Dewpoint_c": -6.8,
      "Wind_Direction": 169,
      "Wind_Speed_kt": 1.9
    },
    {
      "Pressure_mb": 838.4,
      "Altitude_m": 1720,
      "Temp_c": 0.5,
      "Dewpoint_c": -6.9,
      "Wind_Direction": 169,
      "Wind_Speed_kt": 1.9
    },
    {
      "Pressure_mb": 837.8,
      "Altitude_m": 1727,
      "Temp_c": 0.5,
      "Dewpoint_c": -7,
      "Wind_Direction": 169,
      "Wind_Speed_kt": 1.9
    },
    {
      "Pressure_mb": 837.1,
      "Altitude_m": 1734,
      "Temp_c": 0.5,
      "Dewpoint_c": -7.1,
      "Wind_Direction": 170,
      "Wind_Speed_kt": 1.9
    },
    {
      "Pressure_mb": 836.5,
      "Altitude_m": 1740,
      "Temp_c": 0.5,
      "Dewpoint_c": -7.2,
      "Wind_Direction": 170,
      "Wind_Speed_kt": 1.9
    },
    {
      "Pressure_mb": 835.9,
      "Altitude_m": 1746,
      "Temp_c": 0.4,
      "Dewpoint_c": -7.3,
      "Wind_Direction": 170,
      "Wind_Speed_kt": 1.9
    },
    {
      "Pressure_mb": 835.3,
      "Altitude_m": 1752,
      "Temp_c": 0.4,
      "Dewpoint_c": -7.4,
      "Wind_Direction": 170,
      "Wind_Speed_kt": 1.9
    },
    {
      "Pressure_mb": 834.6,
      "Altitude_m": 1758,
      "Temp_c": 0.4,
      "Dewpoint_c": -7.5,
      "Wind_Direction": 170,
      "Wind_Speed_kt": 2
    },
    {
      "Pressure_mb": 834,
      "Altitude_m": 1764,
      "Temp_c": 0.4,
      "Dewpoint_c": -7.6,
      "Wind_Direction": 171,
      "Wind_Speed_kt": 2
    },
    {
      "Pressure_mb": 833.4,
      "Altitude_m": 1769,
      "Temp_c": 0.4,
      "Dewpoint_c": -7.7,
      "Wind_Direction": 171,
      "Wind_Speed_kt": 2
    },
    {
      "Pressure_mb": 832.8,
      "Altitude_m": 1775,
      "Temp_c": 0.3,
      "Dewpoint_c": -7.8,
      "Wind_Direction": 171,
      "Wind_Speed_kt": 2
    },
    {
      "Pressure_mb": 832.1,
      "Altitude_m": 1781,
      "Temp_c": 0.3,
      "Dewpoint_c": -7.9,
      "Wind_Direction": 169,
      "Wind_Speed_kt": 1.9
    },
    {
      "Pressure_mb": 831.5,
      "Altitude_m": 1787,
      "Temp_c": 0.3,
      "Dewpoint_c": -8,
      "Wind_Direction": 167,
      "Wind_Speed_kt": 1.9
    },
    {
      "Pressure_mb": 830.9,
      "Altitude_m": 1794,
      "Temp_c": 0.3,
      "Dewpoint_c": -8.1,
      "Wind_Direction": 165,
      "Wind_Speed_kt": 1.9
    },
    {
      "Pressure_mb": 830.2,
      "Altitude_m": 1800,
      "Temp_c": 0.2,
      "Dewpoint_c": -8.1,
      "Wind_Direction": 163,
      "Wind_Speed_kt": 1.8
    },
    {
      "Pressure_mb": 829.6,
      "Altitude_m": 1806,
      "Temp_c": 0.2,
      "Dewpoint_c": -8.2,
      "Wind_Direction": 161,
      "Wind_Speed_kt": 1.8
    },
    {
      "Pressure_mb": 829.1,
      "Altitude_m": 1812,
      "Temp_c": 0.2,
      "Dewpoint_c": -8.3,
      "Wind_Direction": 158,
      "Wind_Speed_kt": 1.7
    },
    {
      "Pressure_mb": 828.5,
      "Altitude_m": 1817,
      "Temp_c": 0.1,
      "Dewpoint_c": -8.4,
      "Wind_Direction": 155,
      "Wind_Speed_kt": 1.7
    },
    {
      "Pressure_mb": 827.9,
      "Altitude_m": 1823,
      "Temp_c": 0.1,
      "Dewpoint_c": -8.4,
      "Wind_Direction": 152,
      "Wind_Speed_kt": 1.7
    },
    {
      "Pressure_mb": 827.3,
      "Altitude_m": 1828,
      "Temp_c": 0.1,
      "Dewpoint_c": -8.5,
      "Wind_Direction": 149,
      "Wind_Speed_kt": 1.6
    },
    {
      "Pressure_mb": 826.7,
      "Altitude_m": 1834,
      "Temp_c": 0.1,
      "Dewpoint_c": -8.6,
      "Wind_Direction": 145,
      "Wind_Speed_kt": 1.6
    },
    {
      "Pressure_mb": 826.2,
      "Altitude_m": 1839,
      "Temp_c": 0,
      "Dewpoint_c": -8.7,
      "Wind_Direction": 142,
      "Wind_Speed_kt": 1.6
    },
    {
      "Pressure_mb": 825.6,
      "Altitude_m": 1844,
      "Temp_c": 0,
      "Dewpoint_c": -8.7,
      "Wind_Direction": 137,
      "Wind_Speed_kt": 1.5
    },
    {
      "Pressure_mb": 825.1,
      "Altitude_m": 1850,
      "Temp_c": 0,
      "Dewpoint_c": -8.8,
      "Wind_Direction": 133,
      "Wind_Speed_kt": 1.5
    },
    {
      "Pressure_mb": 824.6,
      "Altitude_m": 1855,
      "Temp_c": -0.1,
      "Dewpoint_c": -8.9,
      "Wind_Direction": 128,
      "Wind_Speed_kt": 1.4
    },
    {
      "Pressure_mb": 824.1,
      "Altitude_m": 1860,
      "Temp_c": -0.1,
      "Dewpoint_c": -9,
      "Wind_Direction": 124,
      "Wind_Speed_kt": 1.4
    },
    {
      "Pressure_mb": 823.7,
      "Altitude_m": 1863,
      "Temp_c": -0.1,
      "Dewpoint_c": -9,
      "Wind_Direction": 121,
      "Wind_Speed_kt": 1.4
    },
    {
      "Pressure_mb": 823,
      "Altitude_m": 1870,
      "Temp_c": -0.1,
      "Dewpoint_c": -9,
      "Wind_Direction": 114,
      "Wind_Speed_kt": 1.3
    },
    {
      "Pressure_mb": 822.5,
      "Altitude_m": 1875,
      "Temp_c": -0.1,
      "Dewpoint_c": -9,
      "Wind_Direction": 109,
      "Wind_Speed_kt": 1.3
    },
    {
      "Pressure_mb": 822,
      "Altitude_m": 1880,
      "Temp_c": -0.1,
      "Dewpoint_c": -8.9,
      "Wind_Direction": 104,
      "Wind_Speed_kt": 1.2
    },
    {
      "Pressure_mb": 821.5,
      "Altitude_m": 1885,
      "Temp_c": -0.1,
      "Dewpoint_c": -8.9,
      "Wind_Direction": 100,
      "Wind_Speed_kt": 1.2
    },
    {
      "Pressure_mb": 821,
      "Altitude_m": 1890,
      "Temp_c": -0.1,
      "Dewpoint_c": -8.9,
      "Wind_Direction": 98,
      "Wind_Speed_kt": 1.2
    },
    {
      "Pressure_mb": 820.5,
      "Altitude_m": 1895,
      "Temp_c": -0.1,
      "Dewpoint_c": -8.9,
      "Wind_Direction": 96,
      "Wind_Speed_kt": 1.1
    },
    {
      "Pressure_mb": 820,
      "Altitude_m": 1900,
      "Temp_c": -0.1,
      "Dewpoint_c": -8.9,
      "Wind_Direction": 94,
      "Wind_Speed_kt": 1.1
    },
    {
      "Pressure_mb": 819.4,
      "Altitude_m": 1905,
      "Temp_c": -0.1,
      "Dewpoint_c": -8.8,
      "Wind_Direction": 92,
      "Wind_Speed_kt": 1.1
    },
    {
      "Pressure_mb": 818.9,
      "Altitude_m": 1910,
      "Temp_c": -0.1,
      "Dewpoint_c": -8.8,
      "Wind_Direction": 89,
      "Wind_Speed_kt": 1.1
    },
    {
      "Pressure_mb": 818.4,
      "Altitude_m": 1915,
      "Temp_c": -0.1,
      "Dewpoint_c": -8.8,
      "Wind_Direction": 86,
      "Wind_Speed_kt": 1
    },
    {
      "Pressure_mb": 817.9,
      "Altitude_m": 1920,
      "Temp_c": -0.1,
      "Dewpoint_c": -8.8,
      "Wind_Direction": 83,
      "Wind_Speed_kt": 1
    },
    {
      "Pressure_mb": 817.4,
      "Altitude_m": 1925,
      "Temp_c": -0.2,
      "Dewpoint_c": -8.8,
      "Wind_Direction": 79,
      "Wind_Speed_kt": 1
    },
    {
      "Pressure_mb": 816.8,
      "Altitude_m": 1930,
      "Temp_c": -0.2,
      "Dewpoint_c": -8.8,
      "Wind_Direction": 74,
      "Wind_Speed_kt": 1
    },
    {
      "Pressure_mb": 816.4,
      "Altitude_m": 1935,
      "Temp_c": -0.2,
      "Dewpoint_c": -8.8,
      "Wind_Direction": 69,
      "Wind_Speed_kt": 0.9
    },
    {
      "Pressure_mb": 815.9,
      "Altitude_m": 1940,
      "Temp_c": -0.2,
      "Dewpoint_c": -8.9,
      "Wind_Direction": 64,
      "Wind_Speed_kt": 0.9
    },
    {
      "Pressure_mb": 815.3,
      "Altitude_m": 1945,
      "Temp_c": -0.2,
      "Dewpoint_c": -8.9,
      "Wind_Direction": 58,
      "Wind_Speed_kt": 0.9
    },
    {
      "Pressure_mb": 814.8,
      "Altitude_m": 1950,
      "Temp_c": -0.2,
      "Dewpoint_c": -9,
      "Wind_Direction": 51,
      "Wind_Speed_kt": 0.9
    },
    {
      "Pressure_mb": 814.3,
      "Altitude_m": 1955,
      "Temp_c": -0.3,
      "Dewpoint_c": -9.1,
      "Wind_Direction": 44,
      "Wind_Speed_kt": 0.8
    },
    {
      "Pressure_mb": 813.8,
      "Altitude_m": 1960,
      "Temp_c": -0.3,
      "Dewpoint_c": -9.1,
      "Wind_Direction": 37,
      "Wind_Speed_kt": 0.8
    },
    {
      "Pressure_mb": 813.4,
      "Altitude_m": 1964,
      "Temp_c": -0.3,
      "Dewpoint_c": -9.2,
      "Wind_Direction": 29,
      "Wind_Speed_kt": 0.8
    },
    {
      "Pressure_mb": 812.9,
      "Altitude_m": 1969,
      "Temp_c": -0.3,
      "Dewpoint_c": -9.3,
      "Wind_Direction": 22,
      "Wind_Speed_kt": 0.8
    },
    {
      "Pressure_mb": 812.5,
      "Altitude_m": 1973,
      "Temp_c": -0.3,
      "Dewpoint_c": -9.3,
      "Wind_Direction": 16,
      "Wind_Speed_kt": 0.7
    },
    {
      "Pressure_mb": 812,
      "Altitude_m": 1977,
      "Temp_c": -0.4,
      "Dewpoint_c": -9.4,
      "Wind_Direction": 10,
      "Wind_Speed_kt": 0.7
    },
    {
      "Pressure_mb": 811.5,
      "Altitude_m": 1982,
      "Temp_c": -0.4,
      "Dewpoint_c": -9.5,
      "Wind_Direction": 4,
      "Wind_Speed_kt": 0.7
    },
    {
      "Pressure_mb": 811.1,
      "Altitude_m": 1987,
      "Temp_c": -0.4,
      "Dewpoint_c": -9.5,
      "Wind_Direction": 3,
      "Wind_Speed_kt": 0.7
    },
    {
      "Pressure_mb": 810.6,
      "Altitude_m": 1991,
      "Temp_c": -0.4,
      "Dewpoint_c": -9.6,
      "Wind_Direction": 3,
      "Wind_Speed_kt": 0.8
    },
    {
      "Pressure_mb": 810,
      "Altitude_m": 1996,
      "Temp_c": -0.5,
      "Dewpoint_c": -9.7,
      "Wind_Direction": 2,
      "Wind_Speed_kt": 0.9
    },
    {
      "Pressure_mb": 809.5,
      "Altitude_m": 2001,
      "Temp_c": -0.5,
      "Dewpoint_c": -9.7,
      "Wind_Direction": 1,
      "Wind_Speed_kt": 1
    },
    {
      "Pressure_mb": 809,
      "Altitude_m": 2006,
      "Temp_c": -0.6,
      "Dewpoint_c": -9.8,
      "Wind_Direction": 1,
      "Wind_Speed_kt": 1.1
    },
    {
      "Pressure_mb": 808.4,
      "Altitude_m": 2012,
      "Temp_c": -0.6,
      "Dewpoint_c": -9.8,
      "Wind_Direction": 360,
      "Wind_Speed_kt": 1.1
    },
    {
      "Pressure_mb": 807.9,
      "Altitude_m": 2018,
      "Temp_c": -0.7,
      "Dewpoint_c": -9.9,
      "Wind_Direction": 360,
      "Wind_Speed_kt": 1.2
    },
    {
      "Pressure_mb": 807.3,
      "Altitude_m": 2024,
      "Temp_c": -0.7,
      "Dewpoint_c": -9.9,
      "Wind_Direction": 360,
      "Wind_Speed_kt": 1.3
    },
    {
      "Pressure_mb": 806.7,
      "Altitude_m": 2030,
      "Temp_c": -0.8,
      "Dewpoint_c": -10,
      "Wind_Direction": 359,
      "Wind_Speed_kt": 1.4
    },
    {
      "Pressure_mb": 806.2,
      "Altitude_m": 2036,
      "Temp_c": -0.8,
      "Dewpoint_c": -10.1,
      "Wind_Direction": 359,
      "Wind_Speed_kt": 1.4
    },
    {
      "Pressure_mb": 805.6,
      "Altitude_m": 2042,
      "Temp_c": -0.8,
      "Dewpoint_c": -10.1,
      "Wind_Direction": 359,
      "Wind_Speed_kt": 1.5
    },
    {
      "Pressure_mb": 805,
      "Altitude_m": 2047,
      "Temp_c": -0.9,
      "Dewpoint_c": -10.2,
      "Wind_Direction": 359,
      "Wind_Speed_kt": 1.6
    },
    {
      "Pressure_mb": 804.4,
      "Altitude_m": 2053,
      "Temp_c": -0.9,
      "Dewpoint_c": -10.2,
      "Wind_Direction": 358,
      "Wind_Speed_kt": 1.7
    },
    {
      "Pressure_mb": 803.9,
      "Altitude_m": 2058,
      "Temp_c": -1,
      "Dewpoint_c": -10.3,
      "Wind_Direction": 358,
      "Wind_Speed_kt": 1.8
    },
    {
      "Pressure_mb": 803.4,
      "Altitude_m": 2064,
      "Temp_c": -1,
      "Dewpoint_c": -10.3,
      "Wind_Direction": 358,
      "Wind_Speed_kt": 1.8
    },
    {
      "Pressure_mb": 802.9,
      "Altitude_m": 2069,
      "Temp_c": -1.1,
      "Dewpoint_c": -10.4,
      "Wind_Direction": 358,
      "Wind_Speed_kt": 1.9
    },
    {
      "Pressure_mb": 802.3,
      "Altitude_m": 2074,
      "Temp_c": -1.1,
      "Dewpoint_c": -10.4,
      "Wind_Direction": 358,
      "Wind_Speed_kt": 2
    },
    {
      "Pressure_mb": 801.8,
      "Altitude_m": 2079,
      "Temp_c": -1.1,
      "Dewpoint_c": -10.5,
      "Wind_Direction": 358,
      "Wind_Speed_kt": 2.1
    },
    {
      "Pressure_mb": 801.3,
      "Altitude_m": 2084,
      "Temp_c": -1.1,
      "Dewpoint_c": -10.6,
      "Wind_Direction": 357,
      "Wind_Speed_kt": 2.1
    },
    {
      "Pressure_mb": 800.8,
      "Altitude_m": 2088,
      "Temp_c": -1.2,
      "Dewpoint_c": -10.6,
      "Wind_Direction": 357,
      "Wind_Speed_kt": 2.2
    },
    {
      "Pressure_mb": 800.2,
      "Altitude_m": 2093,
      "Temp_c": -1.2,
      "Dewpoint_c": -10.7,
      "Wind_Direction": 355,
      "Wind_Speed_kt": 2.3
    },
    {
      "Pressure_mb": 799.6,
      "Altitude_m": 2100,
      "Temp_c": -1.2,
      "Dewpoint_c": -10.7,
      "Wind_Direction": 351,
      "Wind_Speed_kt": 2.3
    },
    {
      "Pressure_mb": 799.2,
      "Altitude_m": 2104,
      "Temp_c": -1.2,
      "Dewpoint_c": -10.8,
      "Wind_Direction": 349,
      "Wind_Speed_kt": 2.4
    },
    {
      "Pressure_mb": 798.6,
      "Altitude_m": 2110,
      "Temp_c": -1.2,
      "Dewpoint_c": -10.8,
      "Wind_Direction": 347,
      "Wind_Speed_kt": 2.4
    },
    {
      "Pressure_mb": 798.1,
      "Altitude_m": 2116,
      "Temp_c": -1.3,
      "Dewpoint_c": -10.9,
      "Wind_Direction": 344,
      "Wind_Speed_kt": 2.5
    },
    {
      "Pressure_mb": 797.5,
      "Altitude_m": 2121,
      "Temp_c": -1.3,
      "Dewpoint_c": -10.9,
      "Wind_Direction": 342,
      "Wind_Speed_kt": 2.5
    },
    {
      "Pressure_mb": 797,
      "Altitude_m": 2127,
      "Temp_c": -1.3,
      "Dewpoint_c": -11,
      "Wind_Direction": 339,
      "Wind_Speed_kt": 2.6
    },
    {
      "Pressure_mb": 796.4,
      "Altitude_m": 2133,
      "Temp_c": -1.3,
      "Dewpoint_c": -11.1,
      "Wind_Direction": 337,
      "Wind_Speed_kt": 2.6
    },
    {
      "Pressure_mb": 795.8,
      "Altitude_m": 2139,
      "Temp_c": -1.3,
      "Dewpoint_c": -11.1,
      "Wind_Direction": 335,
      "Wind_Speed_kt": 2.7
    },
    {
      "Pressure_mb": 795.3,
      "Altitude_m": 2144,
      "Temp_c": -1.4,
      "Dewpoint_c": -11.1,
      "Wind_Direction": 333,
      "Wind_Speed_kt": 2.7
    },
    {
      "Pressure_mb": 794.7,
      "Altitude_m": 2149,
      "Temp_c": -1.4,
      "Dewpoint_c": -11.1,
      "Wind_Direction": 331,
      "Wind_Speed_kt": 2.8
    },
    {
      "Pressure_mb": 794.2,
      "Altitude_m": 2155,
      "Temp_c": -1.4,
      "Dewpoint_c": -11.1,
      "Wind_Direction": 329,
      "Wind_Speed_kt": 2.8
    },
    {
      "Pressure_mb": 793.6,
      "Altitude_m": 2160,
      "Temp_c": -1.5,
      "Dewpoint_c": -11.1,
      "Wind_Direction": 327,
      "Wind_Speed_kt": 2.9
    },
    {
      "Pressure_mb": 793.1,
      "Altitude_m": 2166,
      "Temp_c": -1.5,
      "Dewpoint_c": -11.1,
      "Wind_Direction": 325,
      "Wind_Speed_kt": 2.9
    },
    {
      "Pressure_mb": 792.5,
      "Altitude_m": 2171,
      "Temp_c": -1.5,
      "Dewpoint_c": -11.1,
      "Wind_Direction": 324,
      "Wind_Speed_kt": 3
    },
    {
      "Pressure_mb": 792,
      "Altitude_m": 2177,
      "Temp_c": -1.6,
      "Dewpoint_c": -11.1,
      "Wind_Direction": 322,
      "Wind_Speed_kt": 3
    },
    {
      "Pressure_mb": 791.5,
      "Altitude_m": 2182,
      "Temp_c": -1.6,
      "Dewpoint_c": -11.1,
      "Wind_Direction": 320,
      "Wind_Speed_kt": 3.1
    },
    {
      "Pressure_mb": 790.9,
      "Altitude_m": 2187,
      "Temp_c": -1.6,
      "Dewpoint_c": -11.1,
      "Wind_Direction": 319,
      "Wind_Speed_kt": 3.1
    },
    {
      "Pressure_mb": 790.4,
      "Altitude_m": 2193,
      "Temp_c": -1.7,
      "Dewpoint_c": -11.1,
      "Wind_Direction": 318,
      "Wind_Speed_kt": 3.1
    },
    {
      "Pressure_mb": 789.8,
      "Altitude_m": 2198,
      "Temp_c": -1.7,
      "Dewpoint_c": -11.1,
      "Wind_Direction": 316,
      "Wind_Speed_kt": 3.2
    },
    {
      "Pressure_mb": 789.3,
      "Altitude_m": 2204,
      "Temp_c": -1.7,
      "Dewpoint_c": -11.1,
      "Wind_Direction": 316,
      "Wind_Speed_kt": 3.1
    },
    {
      "Pressure_mb": 788.7,
      "Altitude_m": 2210,
      "Temp_c": -1.8,
      "Dewpoint_c": -11.1,
      "Wind_Direction": 316,
      "Wind_Speed_kt": 3.1
    },
    {
      "Pressure_mb": 788.2,
      "Altitude_m": 2215,
      "Temp_c": -1.8,
      "Dewpoint_c": -11,
      "Wind_Direction": 317,
      "Wind_Speed_kt": 3
    },
    {
      "Pressure_mb": 787.7,
      "Altitude_m": 2221,
      "Temp_c": -1.8,
      "Dewpoint_c": -11,
      "Wind_Direction": 317,
      "Wind_Speed_kt": 2.9
    },
    {
      "Pressure_mb": 787.2,
      "Altitude_m": 2226,
      "Temp_c": -1.8,
      "Dewpoint_c": -11,
      "Wind_Direction": 317,
      "Wind_Speed_kt": 2.9
    },
    {
      "Pressure_mb": 786.7,
      "Altitude_m": 2231,
      "Temp_c": -1.8,
      "Dewpoint_c": -10.9,
      "Wind_Direction": 317,
      "Wind_Speed_kt": 2.8
    },
    {
      "Pressure_mb": 786.2,
      "Altitude_m": 2236,
      "Temp_c": -1.8,
      "Dewpoint_c": -10.9,
      "Wind_Direction": 317,
      "Wind_Speed_kt": 2.7
    },
    {
      "Pressure_mb": 785.7,
      "Altitude_m": 2240,
      "Temp_c": -1.8,
      "Dewpoint_c": -10.8,
      "Wind_Direction": 317,
      "Wind_Speed_kt": 2.7
    },
    {
      "Pressure_mb": 785.2,
      "Altitude_m": 2245,
      "Temp_c": -1.9,
      "Dewpoint_c": -10.8,
      "Wind_Direction": 317,
      "Wind_Speed_kt": 2.6
    },
    {
      "Pressure_mb": 784.6,
      "Altitude_m": 2250,
      "Temp_c": -1.9,
      "Dewpoint_c": -10.7,
      "Wind_Direction": 317,
      "Wind_Speed_kt": 2.5
    },
    {
      "Pressure_mb": 784.1,
      "Altitude_m": 2256,
      "Temp_c": -1.9,
      "Dewpoint_c": -10.7,
      "Wind_Direction": 318,
      "Wind_Speed_kt": 2.4
    },
    {
      "Pressure_mb": 783.5,
      "Altitude_m": 2261,
      "Temp_c": -1.9,
      "Dewpoint_c": -10.7,
      "Wind_Direction": 318,
      "Wind_Speed_kt": 2.4
    },
    {
      "Pressure_mb": 783,
      "Altitude_m": 2267,
      "Temp_c": -1.9,
      "Dewpoint_c": -10.6,
      "Wind_Direction": 318,
      "Wind_Speed_kt": 2.3
    },
    {
      "Pressure_mb": 782.5,
      "Altitude_m": 2273,
      "Temp_c": -1.9,
      "Dewpoint_c": -10.6,
      "Wind_Direction": 318,
      "Wind_Speed_kt": 2.2
    },
    {
      "Pressure_mb": 781.9,
      "Altitude_m": 2279,
      "Temp_c": -1.9,
      "Dewpoint_c": -10.5,
      "Wind_Direction": 318,
      "Wind_Speed_kt": 2.2
    },
    {
      "Pressure_mb": 781.4,
      "Altitude_m": 2284,
      "Temp_c": -1.9,
      "Dewpoint_c": -10.5,
      "Wind_Direction": 319,
      "Wind_Speed_kt": 2.1
    },
    {
      "Pressure_mb": 780.9,
      "Altitude_m": 2289,
      "Temp_c": -2,
      "Dewpoint_c": -10.4,
      "Wind_Direction": 319,
      "Wind_Speed_kt": 2
    },
    {
      "Pressure_mb": 780.3,
      "Altitude_m": 2295,
      "Temp_c": -2,
      "Dewpoint_c": -10.3,
      "Wind_Direction": 319,
      "Wind_Speed_kt": 2
    },
    {
      "Pressure_mb": 779.8,
      "Altitude_m": 2300,
      "Temp_c": -2,
      "Dewpoint_c": -10.3,
      "Wind_Direction": 319,
      "Wind_Speed_kt": 1.9
    },
    {
      "Pressure_mb": 779.3,
      "Altitude_m": 2305,
      "Temp_c": -2,
      "Dewpoint_c": -10.2,
      "Wind_Direction": 320,
      "Wind_Speed_kt": 1.8
    },
    {
      "Pressure_mb": 778.8,
      "Altitude_m": 2310,
      "Temp_c": -2,
      "Dewpoint_c": -10.2,
      "Wind_Direction": 322,
      "Wind_Speed_kt": 1.9
    },
    {
      "Pressure_mb": 778.3,
      "Altitude_m": 2316,
      "Temp_c": -2,
      "Dewpoint_c": -10.1,
      "Wind_Direction": 324,
      "Wind_Speed_kt": 2.1
    },
    {
      "Pressure_mb": 777.7,
      "Altitude_m": 2321,
      "Temp_c": -2.1,
      "Dewpoint_c": -10.1,
      "Wind_Direction": 326,
      "Wind_Speed_kt": 2.2
    },
    {
      "Pressure_mb": 777.2,
      "Altitude_m": 2327,
      "Temp_c": -2.1,
      "Dewpoint_c": -10,
      "Wind_Direction": 328,
      "Wind_Speed_kt": 2.3
    },
    {
      "Pressure_mb": 776.7,
      "Altitude_m": 2332,
      "Temp_c": -2.1,
      "Dewpoint_c": -9.9,
      "Wind_Direction": 329,
      "Wind_Speed_kt": 2.4
    },
    {
      "Pressure_mb": 776.1,
      "Altitude_m": 2337,
      "Temp_c": -2.1,
      "Dewpoint_c": -9.9,
      "Wind_Direction": 331,
      "Wind_Speed_kt": 2.6
    },
    {
      "Pressure_mb": 775.6,
      "Altitude_m": 2343,
      "Temp_c": -2.1,
      "Dewpoint_c": -9.8,
      "Wind_Direction": 332,
      "Wind_Speed_kt": 2.7
    },
    {
      "Pressure_mb": 775,
      "Altitude_m": 2349,
      "Temp_c": -2.2,
      "Dewpoint_c": -9.8,
      "Wind_Direction": 333,
      "Wind_Speed_kt": 2.8
    },
    {
      "Pressure_mb": 774.5,
      "Altitude_m": 2354,
      "Temp_c": -2.2,
      "Dewpoint_c": -9.7,
      "Wind_Direction": 334,
      "Wind_Speed_kt": 2.9
    },
    {
      "Pressure_mb": 773.9,
      "Altitude_m": 2360,
      "Temp_c": -2.2,
      "Dewpoint_c": -9.7,
      "Wind_Direction": 335,
      "Wind_Speed_kt": 3.1
    },
    {
      "Pressure_mb": 773.4,
      "Altitude_m": 2366,
      "Temp_c": -2.2,
      "Dewpoint_c": -9.7,
      "Wind_Direction": 336,
      "Wind_Speed_kt": 3.2
    },
    {
      "Pressure_mb": 772.8,
      "Altitude_m": 2371,
      "Temp_c": -2.2,
      "Dewpoint_c": -9.7,
      "Wind_Direction": 337,
      "Wind_Speed_kt": 3.3
    },
    {
      "Pressure_mb": 772.3,
      "Altitude_m": 2377,
      "Temp_c": -2.3,
      "Dewpoint_c": -9.7,
      "Wind_Direction": 338,
      "Wind_Speed_kt": 3.4
    },
    {
      "Pressure_mb": 771.8,
      "Altitude_m": 2382,
      "Temp_c": -2.3,
      "Dewpoint_c": -9.7,
      "Wind_Direction": 338,
      "Wind_Speed_kt": 3.5
    },
    {
      "Pressure_mb": 771.2,
      "Altitude_m": 2388,
      "Temp_c": -2.3,
      "Dewpoint_c": -9.7,
      "Wind_Direction": 339,
      "Wind_Speed_kt": 3.6
    },
    {
      "Pressure_mb": 770.7,
      "Altitude_m": 2393,
      "Temp_c": -2.3,
      "Dewpoint_c": -9.7,
      "Wind_Direction": 340,
      "Wind_Speed_kt": 3.8
    },
    {
      "Pressure_mb": 770.2,
      "Altitude_m": 2398,
      "Temp_c": -2.3,
      "Dewpoint_c": -9.7,
      "Wind_Direction": 340,
      "Wind_Speed_kt": 3.9
    },
    {
      "Pressure_mb": 769.7,
      "Altitude_m": 2404,
      "Temp_c": -2.4,
      "Dewpoint_c": -9.7,
      "Wind_Direction": 341,
      "Wind_Speed_kt": 4
    },
    {
      "Pressure_mb": 769.2,
      "Altitude_m": 2409,
      "Temp_c": -2.4,
      "Dewpoint_c": -9.7,
      "Wind_Direction": 341,
      "Wind_Speed_kt": 4.1
    },
    {
      "Pressure_mb": 768.7,
      "Altitude_m": 2414,
      "Temp_c": -2.4,
      "Dewpoint_c": -9.7,
      "Wind_Direction": 342,
      "Wind_Speed_kt": 4.3
    },
    {
      "Pressure_mb": 768.2,
      "Altitude_m": 2419,
      "Temp_c": -2.4,
      "Dewpoint_c": -9.7,
      "Wind_Direction": 341,
      "Wind_Speed_kt": 4.4
    },
    {
      "Pressure_mb": 767.5,
      "Altitude_m": 2425,
      "Temp_c": -2.4,
      "Dewpoint_c": -9.7,
      "Wind_Direction": 340,
      "Wind_Speed_kt": 4.5
    },
    {
      "Pressure_mb": 767.2,
      "Altitude_m": 2429,
      "Temp_c": -2.5,
      "Dewpoint_c": -9.7,
      "Wind_Direction": 339,
      "Wind_Speed_kt": 4.5
    },
    {
      "Pressure_mb": 766.7,
      "Altitude_m": 2434,
      "Temp_c": -2.5,
      "Dewpoint_c": -9.8,
      "Wind_Direction": 338,
      "Wind_Speed_kt": 4.6
    },
    {
      "Pressure_mb": 766.2,
      "Altitude_m": 2440,
      "Temp_c": -2.5,
      "Dewpoint_c": -9.8,
      "Wind_Direction": 338,
      "Wind_Speed_kt": 4.7
    },
    {
      "Pressure_mb": 765.6,
      "Altitude_m": 2446,
      "Temp_c": -2.6,
      "Dewpoint_c": -9.8,
      "Wind_Direction": 337,
      "Wind_Speed_kt": 4.8
    },
    {
      "Pressure_mb": 765,
      "Altitude_m": 2452,
      "Temp_c": -2.6,
      "Dewpoint_c": -9.9,
      "Wind_Direction": 336,
      "Wind_Speed_kt": 4.8
    },
    {
      "Pressure_mb": 764.5,
      "Altitude_m": 2458,
      "Temp_c": -2.7,
      "Dewpoint_c": -9.9,
      "Wind_Direction": 336,
      "Wind_Speed_kt": 4.9
    },
    {
      "Pressure_mb": 763.9,
      "Altitude_m": 2465,
      "Temp_c": -2.7,
      "Dewpoint_c": -10,
      "Wind_Direction": 335,
      "Wind_Speed_kt": 5
    },
    {
      "Pressure_mb": 763.3,
      "Altitude_m": 2470,
      "Temp_c": -2.7,
      "Dewpoint_c": -10,
      "Wind_Direction": 334,
      "Wind_Speed_kt": 5.1
    },
    {
      "Pressure_mb": 762.8,
      "Altitude_m": 2475,
      "Temp_c": -2.8,
      "Dewpoint_c": -10,
      "Wind_Direction": 334,
      "Wind_Speed_kt": 5.2
    },
    {
      "Pressure_mb": 762.3,
      "Altitude_m": 2481,
      "Temp_c": -2.8,
      "Dewpoint_c": -10.1,
      "Wind_Direction": 333,
      "Wind_Speed_kt": 5.3
    },
    {
      "Pressure_mb": 761.7,
      "Altitude_m": 2486,
      "Temp_c": -2.8,
      "Dewpoint_c": -10.1,
      "Wind_Direction": 332,
      "Wind_Speed_kt": 5.3
    },
    {
      "Pressure_mb": 761.2,
      "Altitude_m": 2491,
      "Temp_c": -2.9,
      "Dewpoint_c": -10.2,
      "Wind_Direction": 332,
      "Wind_Speed_kt": 5.4
    },
    {
      "Pressure_mb": 760.7,
      "Altitude_m": 2497,
      "Temp_c": -2.9,
      "Dewpoint_c": -10.2,
      "Wind_Direction": 331,
      "Wind_Speed_kt": 5.5
    },
    {
      "Pressure_mb": 760.2,
      "Altitude_m": 2502,
      "Temp_c": -3,
      "Dewpoint_c": -10.2,
      "Wind_Direction": 331,
      "Wind_Speed_kt": 5.6
    },
    {
      "Pressure_mb": 759.7,
      "Altitude_m": 2508,
      "Temp_c": -3,
      "Dewpoint_c": -10.2,
      "Wind_Direction": 330,
      "Wind_Speed_kt": 5.7
    },
    {
      "Pressure_mb": 759.2,
      "Altitude_m": 2513,
      "Temp_c": -3,
      "Dewpoint_c": -10.2,
      "Wind_Direction": 330,
      "Wind_Speed_kt": 5.8
    },
    {
      "Pressure_mb": 758.7,
      "Altitude_m": 2519,
      "Temp_c": -3.1,
      "Dewpoint_c": -10.2,
      "Wind_Direction": 329,
      "Wind_Speed_kt": 5.9
    },
    {
      "Pressure_mb": 758.2,
      "Altitude_m": 2524,
      "Temp_c": -3.1,
      "Dewpoint_c": -10.2,
      "Wind_Direction": 329,
      "Wind_Speed_kt": 6
    },
    {
      "Pressure_mb": 757.7,
      "Altitude_m": 2530,
      "Temp_c": -3.1,
      "Dewpoint_c": -10.2,
      "Wind_Direction": 328,
      "Wind_Speed_kt": 6
    },
    {
      "Pressure_mb": 757.2,
      "Altitude_m": 2534,
      "Temp_c": -3.1,
      "Dewpoint_c": -10.2,
      "Wind_Direction": 328,
      "Wind_Speed_kt": 6.1
    },
    {
      "Pressure_mb": 756.7,
      "Altitude_m": 2539,
      "Temp_c": -3.2,
      "Dewpoint_c": -10.2,
      "Wind_Direction": 328,
      "Wind_Speed_kt": 6.1
    },
    {
      "Pressure_mb": 756.2,
      "Altitude_m": 2543,
      "Temp_c": -3.2,
      "Dewpoint_c": -10.2,
      "Wind_Direction": 328,
      "Wind_Speed_kt": 6.2
    },
    {
      "Pressure_mb": 755.8,
      "Altitude_m": 2548,
      "Temp_c": -3.2,
      "Dewpoint_c": -10.2,
      "Wind_Direction": 327,
      "Wind_Speed_kt": 6.2
    },
    {
      "Pressure_mb": 755.3,
      "Altitude_m": 2552,
      "Temp_c": -3.3,
      "Dewpoint_c": -10.2,
      "Wind_Direction": 327,
      "Wind_Speed_kt": 6.3
    },
    {
      "Pressure_mb": 754.9,
      "Altitude_m": 2557,
      "Temp_c": -3.3,
      "Dewpoint_c": -10.2,
      "Wind_Direction": 327,
      "Wind_Speed_kt": 6.3
    },
    {
      "Pressure_mb": 754.4,
      "Altitude_m": 2562,
      "Temp_c": -3.3,
      "Dewpoint_c": -10.2,
      "Wind_Direction": 327,
      "Wind_Speed_kt": 6.4
    },
    {
      "Pressure_mb": 754,
      "Altitude_m": 2567,
      "Temp_c": -3.3,
      "Dewpoint_c": -10.2,
      "Wind_Direction": 326,
      "Wind_Speed_kt": 6.5
    },
    {
      "Pressure_mb": 753.5,
      "Altitude_m": 2572,
      "Temp_c": -3.4,
      "Dewpoint_c": -10.2,
      "Wind_Direction": 326,
      "Wind_Speed_kt": 6.5
    },
    {
      "Pressure_mb": 753,
      "Altitude_m": 2577,
      "Temp_c": -3.4,
      "Dewpoint_c": -10.1,
      "Wind_Direction": 326,
      "Wind_Speed_kt": 6.6
    },
    {
      "Pressure_mb": 752.5,
      "Altitude_m": 2582,
      "Temp_c": -3.4,
      "Dewpoint_c": -10.1,
      "Wind_Direction": 326,
      "Wind_Speed_kt": 6.6
    },
    {
      "Pressure_mb": 752,
      "Altitude_m": 2588,
      "Temp_c": -3.5,
      "Dewpoint_c": -10,
      "Wind_Direction": 325,
      "Wind_Speed_kt": 6.7
    },
    {
      "Pressure_mb": 751.5,
      "Altitude_m": 2593,
      "Temp_c": -3.5,
      "Dewpoint_c": -10,
      "Wind_Direction": 325,
      "Wind_Speed_kt": 6.7
    },
    {
      "Pressure_mb": 751,
      "Altitude_m": 2598,
      "Temp_c": -3.6,
      "Dewpoint_c": -10,
      "Wind_Direction": 325,
      "Wind_Speed_kt": 6.8
    },
    {
      "Pressure_mb": 750.5,
      "Altitude_m": 2603,
      "Temp_c": -3.6,
      "Dewpoint_c": -9.9,
      "Wind_Direction": 325,
      "Wind_Speed_kt": 6.8
    },
    {
      "Pressure_mb": 750,
      "Altitude_m": 2609,
      "Temp_c": -3.6,
      "Dewpoint_c": -9.9,
      "Wind_Direction": 325,
      "Wind_Speed_kt": 6.9
    },
    {
      "Pressure_mb": 749.4,
      "Altitude_m": 2615,
      "Temp_c": -3.7,
      "Dewpoint_c": -9.8,
      "Wind_Direction": 324,
      "Wind_Speed_kt": 7
    },
    {
      "Pressure_mb": 748.9,
      "Altitude_m": 2620,
      "Temp_c": -3.7,
      "Dewpoint_c": -9.8,
      "Wind_Direction": 324,
      "Wind_Speed_kt": 7
    },
    {
      "Pressure_mb": 748.4,
      "Altitude_m": 2626,
      "Temp_c": -3.8,
      "Dewpoint_c": -9.8,
      "Wind_Direction": 324,
      "Wind_Speed_kt": 7.1
    },
    {
      "Pressure_mb": 747.9,
      "Altitude_m": 2632,
      "Temp_c": -3.8,
      "Dewpoint_c": -9.7,
      "Wind_Direction": 324,
      "Wind_Speed_kt": 7
    },
    {
      "Pressure_mb": 747.3,
      "Altitude_m": 2637,
      "Temp_c": -3.8,
      "Dewpoint_c": -9.7,
      "Wind_Direction": 324,
      "Wind_Speed_kt": 7
    },
    {
      "Pressure_mb": 746.8,
      "Altitude_m": 2643,
      "Temp_c": -3.9,
      "Dewpoint_c": -9.7,
      "Wind_Direction": 324,
      "Wind_Speed_kt": 7
    },
    {
      "Pressure_mb": 746.3,
      "Altitude_m": 2648,
      "Temp_c": -3.9,
      "Dewpoint_c": -9.7,
      "Wind_Direction": 324,
      "Wind_Speed_kt": 6.9
    },
    {
      "Pressure_mb": 745.7,
      "Altitude_m": 2654,
      "Temp_c": -4,
      "Dewpoint_c": -9.7,
      "Wind_Direction": 324,
      "Wind_Speed_kt": 6.9
    },
    {
      "Pressure_mb": 745.2,
      "Altitude_m": 2660,
      "Temp_c": -4,
      "Dewpoint_c": -9.7,
      "Wind_Direction": 325,
      "Wind_Speed_kt": 6.9
    },
    {
      "Pressure_mb": 744.7,
      "Altitude_m": 2665,
      "Temp_c": -4.1,
      "Dewpoint_c": -9.7,
      "Wind_Direction": 325,
      "Wind_Speed_kt": 6.8
    },
    {
      "Pressure_mb": 744.1,
      "Altitude_m": 2671,
      "Temp_c": -4.1,
      "Dewpoint_c": -9.7,
      "Wind_Direction": 325,
      "Wind_Speed_kt": 6.8
    },
    {
      "Pressure_mb": 743.6,
      "Altitude_m": 2677,
      "Temp_c": -4.2,
      "Dewpoint_c": -9.8,
      "Wind_Direction": 325,
      "Wind_Speed_kt": 6.7
    },
    {
      "Pressure_mb": 743.1,
      "Altitude_m": 2682,
      "Temp_c": -4.2,
      "Dewpoint_c": -9.8,
      "Wind_Direction": 325,
      "Wind_Speed_kt": 6.7
    },
    {
      "Pressure_mb": 742.6,
      "Altitude_m": 2688,
      "Temp_c": -4.2,
      "Dewpoint_c": -9.8,
      "Wind_Direction": 325,
      "Wind_Speed_kt": 6.7
    },
    {
      "Pressure_mb": 742,
      "Altitude_m": 2693,
      "Temp_c": -4.3,
      "Dewpoint_c": -9.8,
      "Wind_Direction": 325,
      "Wind_Speed_kt": 6.6
    },
    {
      "Pressure_mb": 741.5,
      "Altitude_m": 2699,
      "Temp_c": -4.3,
      "Dewpoint_c": -9.8,
      "Wind_Direction": 326,
      "Wind_Speed_kt": 6.6
    },
    {
      "Pressure_mb": 741.1,
      "Altitude_m": 2704,
      "Temp_c": -4.4,
      "Dewpoint_c": -9.8,
      "Wind_Direction": 326,
      "Wind_Speed_kt": 6.6
    },
    {
      "Pressure_mb": 740.7,
      "Altitude_m": 2708,
      "Temp_c": -4.4,
      "Dewpoint_c": -9.8,
      "Wind_Direction": 326,
      "Wind_Speed_kt": 6.5
    },
    {
      "Pressure_mb": 740.2,
      "Altitude_m": 2713,
      "Temp_c": -4.5,
      "Dewpoint_c": -9.9,
      "Wind_Direction": 326,
      "Wind_Speed_kt": 6.5
    },
    {
      "Pressure_mb": 739.8,
      "Altitude_m": 2717,
      "Temp_c": -4.5,
      "Dewpoint_c": -9.9,
      "Wind_Direction": 326,
      "Wind_Speed_kt": 6.5
    },
    {
      "Pressure_mb": 739.4,
      "Altitude_m": 2722,
      "Temp_c": -4.6,
      "Dewpoint_c": -9.9,
      "Wind_Direction": 326,
      "Wind_Speed_kt": 6.4
    },
    {
      "Pressure_mb": 738.9,
      "Altitude_m": 2726,
      "Temp_c": -4.6,
      "Dewpoint_c": -9.9,
      "Wind_Direction": 326,
      "Wind_Speed_kt": 6.4
    },
    {
      "Pressure_mb": 738.5,
      "Altitude_m": 2731,
      "Temp_c": -4.7,
      "Dewpoint_c": -9.9,
      "Wind_Direction": 327,
      "Wind_Speed_kt": 6.3
    },
    {
      "Pressure_mb": 738,
      "Altitude_m": 2736,
      "Temp_c": -4.7,
      "Dewpoint_c": -10,
      "Wind_Direction": 326,
      "Wind_Speed_kt": 6.3
    },
    {
      "Pressure_mb": 737.5,
      "Altitude_m": 2741,
      "Temp_c": -4.8,
      "Dewpoint_c": -10,
      "Wind_Direction": 326,
      "Wind_Speed_kt": 6.3
    },
    {
      "Pressure_mb": 737.1,
      "Altitude_m": 2746,
      "Temp_c": -4.8,
      "Dewpoint_c": -10,
      "Wind_Direction": 326,
      "Wind_Speed_kt": 6.3
    },
    {
      "Pressure_mb": 736.6,
      "Altitude_m": 2751,
      "Temp_c": -4.8,
      "Dewpoint_c": -10,
      "Wind_Direction": 326,
      "Wind_Speed_kt": 6.3
    },
    {
      "Pressure_mb": 736.1,
      "Altitude_m": 2756,
      "Temp_c": -4.9,
      "Dewpoint_c": -10,
      "Wind_Direction": 326,
      "Wind_Speed_kt": 6.3
    },
    {
      "Pressure_mb": 735.6,
      "Altitude_m": 2761,
      "Temp_c": -4.9,
      "Dewpoint_c": -10,
      "Wind_Direction": 326,
      "Wind_Speed_kt": 6.3
    },
    {
      "Pressure_mb": 735.2,
      "Altitude_m": 2766,
      "Temp_c": -5,
      "Dewpoint_c": -10.1,
      "Wind_Direction": 326,
      "Wind_Speed_kt": 6.3
    },
    {
      "Pressure_mb": 734.7,
      "Altitude_m": 2771,
      "Temp_c": -5,
      "Dewpoint_c": -10.1,
      "Wind_Direction": 326,
      "Wind_Speed_kt": 6.3
    },
    {
      "Pressure_mb": 734.2,
      "Altitude_m": 2777,
      "Temp_c": -5.1,
      "Dewpoint_c": -10.1,
      "Wind_Direction": 325,
      "Wind_Speed_kt": 6.2
    },
    {
      "Pressure_mb": 733.7,
      "Altitude_m": 2782,
      "Temp_c": -5.1,
      "Dewpoint_c": -10.1,
      "Wind_Direction": 325,
      "Wind_Speed_kt": 6.2
    },
    {
      "Pressure_mb": 733.2,
      "Altitude_m": 2787,
      "Temp_c": -5.1,
      "Dewpoint_c": -10.1,
      "Wind_Direction": 325,
      "Wind_Speed_kt": 6.2
    },
    {
      "Pressure_mb": 732.7,
      "Altitude_m": 2793,
      "Temp_c": -5.2,
      "Dewpoint_c": -10.1,
      "Wind_Direction": 325,
      "Wind_Speed_kt": 6.2
    },
    {
      "Pressure_mb": 732.2,
      "Altitude_m": 2798,
      "Temp_c": -5.2,
      "Dewpoint_c": -10.1,
      "Wind_Direction": 325,
      "Wind_Speed_kt": 6.2
    },
    {
      "Pressure_mb": 731.7,
      "Altitude_m": 2804,
      "Temp_c": -5.2,
      "Dewpoint_c": -10.1,
      "Wind_Direction": 325,
      "Wind_Speed_kt": 6.2
    },
    {
      "Pressure_mb": 731.1,
      "Altitude_m": 2809,
      "Temp_c": -5.3,
      "Dewpoint_c": -10.1,
      "Wind_Direction": 325,
      "Wind_Speed_kt": 6.2
    },
    {
      "Pressure_mb": 730.6,
      "Altitude_m": 2815,
      "Temp_c": -5.3,
      "Dewpoint_c": -10.1,
      "Wind_Direction": 324,
      "Wind_Speed_kt": 6.2
    },
    {
      "Pressure_mb": 730.1,
      "Altitude_m": 2821,
      "Temp_c": -5.3,
      "Dewpoint_c": -10.1,
      "Wind_Direction": 324,
      "Wind_Speed_kt": 6.1
    },
    {
      "Pressure_mb": 729.6,
      "Altitude_m": 2827,
      "Temp_c": -5.4,
      "Dewpoint_c": -10.1,
      "Wind_Direction": 324,
      "Wind_Speed_kt": 6.1
    },
    {
      "Pressure_mb": 729,
      "Altitude_m": 2833,
      "Temp_c": -5.4,
      "Dewpoint_c": -10.1,
      "Wind_Direction": 324,
      "Wind_Speed_kt": 6.1
    },
    {
      "Pressure_mb": 728.5,
      "Altitude_m": 2839,
      "Temp_c": -5.4,
      "Dewpoint_c": -10.1,
      "Wind_Direction": 324,
      "Wind_Speed_kt": 6.1
    },
    {
      "Pressure_mb": 727.9,
      "Altitude_m": 2844,
      "Temp_c": -5.5,
      "Dewpoint_c": -10.1,
      "Wind_Direction": 324,
      "Wind_Speed_kt": 6.1
    },
    {
      "Pressure_mb": 727.4,
      "Altitude_m": 2850,
      "Temp_c": -5.5,
      "Dewpoint_c": -10.1,
      "Wind_Direction": 325,
      "Wind_Speed_kt": 6.1
    },
    {
      "Pressure_mb": 726.9,
      "Altitude_m": 2856,
      "Temp_c": -5.5,
      "Dewpoint_c": -10.2,
      "Wind_Direction": 325,
      "Wind_Speed_kt": 6.1
    },
    {
      "Pressure_mb": 726.4,
      "Altitude_m": 2861,
      "Temp_c": -5.6,
      "Dewpoint_c": -10.2,
      "Wind_Direction": 325,
      "Wind_Speed_kt": 6.1
    },
    {
      "Pressure_mb": 725.9,
      "Altitude_m": 2866,
      "Temp_c": -5.6,
      "Dewpoint_c": -10.2,
      "Wind_Direction": 326,
      "Wind_Speed_kt": 6.1
    },
    {
      "Pressure_mb": 725.5,
      "Altitude_m": 2871,
      "Temp_c": -5.6,
      "Dewpoint_c": -10.2,
      "Wind_Direction": 326,
      "Wind_Speed_kt": 6.1
    },
    {
      "Pressure_mb": 725,
      "Altitude_m": 2876,
      "Temp_c": -5.6,
      "Dewpoint_c": -10.2,
      "Wind_Direction": 327,
      "Wind_Speed_kt": 6.1
    },
    {
      "Pressure_mb": 724.6,
      "Altitude_m": 2881,
      "Temp_c": -5.6,
      "Dewpoint_c": -10.2,
      "Wind_Direction": 327,
      "Wind_Speed_kt": 6.1
    },
    {
      "Pressure_mb": 724.1,
      "Altitude_m": 2886,
      "Temp_c": -5.7,
      "Dewpoint_c": -10.2,
      "Wind_Direction": 327,
      "Wind_Speed_kt": 6.1
    },
    {
      "Pressure_mb": 723.6,
      "Altitude_m": 2891,
      "Temp_c": -5.7,
      "Dewpoint_c": -10.2,
      "Wind_Direction": 328,
      "Wind_Speed_kt": 6.1
    },
    {
      "Pressure_mb": 723.1,
      "Altitude_m": 2896,
      "Temp_c": -5.7,
      "Dewpoint_c": -10.2,
      "Wind_Direction": 328,
      "Wind_Speed_kt": 6.1
    },
    {
      "Pressure_mb": 722.7,
      "Altitude_m": 2901,
      "Temp_c": -5.7,
      "Dewpoint_c": -10.2,
      "Wind_Direction": 328,
      "Wind_Speed_kt": 6.1
    },
    {
      "Pressure_mb": 722.2,
      "Altitude_m": 2906,
      "Temp_c": -5.8,
      "Dewpoint_c": -10.2,
      "Wind_Direction": 329,
      "Wind_Speed_kt": 6.1
    },
    {
      "Pressure_mb": 721.7,
      "Altitude_m": 2911,
      "Temp_c": -5.8,
      "Dewpoint_c": -10.2,
      "Wind_Direction": 329,
      "Wind_Speed_kt": 6.1
    },
    {
      "Pressure_mb": 721.2,
      "Altitude_m": 2916,
      "Temp_c": -5.8,
      "Dewpoint_c": -10.2,
      "Wind_Direction": 330,
      "Wind_Speed_kt": 6.1
    },
    {
      "Pressure_mb": 720.8,
      "Altitude_m": 2922,
      "Temp_c": -5.8,
      "Dewpoint_c": -10.2,
      "Wind_Direction": 330,
      "Wind_Speed_kt": 6.1
    },
    {
      "Pressure_mb": 720.3,
      "Altitude_m": 2927,
      "Temp_c": -5.8,
      "Dewpoint_c": -10.2,
      "Wind_Direction": 330,
      "Wind_Speed_kt": 6.1
    },
    {
      "Pressure_mb": 719.8,
      "Altitude_m": 2933,
      "Temp_c": -5.9,
      "Dewpoint_c": -10.2,
      "Wind_Direction": 331,
      "Wind_Speed_kt": 6.1
    },
    {
      "Pressure_mb": 719.3,
      "Altitude_m": 2938,
      "Temp_c": -5.9,
      "Dewpoint_c": -10.2,
      "Wind_Direction": 331,
      "Wind_Speed_kt": 6.1
    },
    {
      "Pressure_mb": 718.8,
      "Altitude_m": 2943,
      "Temp_c": -5.9,
      "Dewpoint_c": -10.2,
      "Wind_Direction": 332,
      "Wind_Speed_kt": 6.1
    },
    {
      "Pressure_mb": 718.3,
      "Altitude_m": 2948,
      "Temp_c": -5.9,
      "Dewpoint_c": -10.2,
      "Wind_Direction": 332,
      "Wind_Speed_kt": 6.2
    },
    {
      "Pressure_mb": 717.8,
      "Altitude_m": 2954,
      "Temp_c": -6,
      "Dewpoint_c": -10.2,
      "Wind_Direction": 332,
      "Wind_Speed_kt": 6.3
    },
    {
      "Pressure_mb": 717.3,
      "Altitude_m": 2959,
      "Temp_c": -6,
      "Dewpoint_c": -10.2,
      "Wind_Direction": 332,
      "Wind_Speed_kt": 6.4
    },
    {
      "Pressure_mb": 716.9,
      "Altitude_m": 2964,
      "Temp_c": -6,
      "Dewpoint_c": -10.3,
      "Wind_Direction": 332,
      "Wind_Speed_kt": 6.5
    },
    {
      "Pressure_mb": 716.4,
      "Altitude_m": 2969,
      "Temp_c": -6,
      "Dewpoint_c": -10.3,
      "Wind_Direction": 332,
      "Wind_Speed_kt": 6.6
    },
    {
      "Pressure_mb": 715.9,
      "Altitude_m": 2975,
      "Temp_c": -6.1,
      "Dewpoint_c": -10.3,
      "Wind_Direction": 332,
      "Wind_Speed_kt": 6.7
    },
    {
      "Pressure_mb": 715.4,
      "Altitude_m": 2980,
      "Temp_c": -6.1,
      "Dewpoint_c": -10.3,
      "Wind_Direction": 333,
      "Wind_Speed_kt": 6.8
    },
    {
      "Pressure_mb": 715,
      "Altitude_m": 2985,
      "Temp_c": -6.1,
      "Dewpoint_c": -10.3,
      "Wind_Direction": 333,
      "Wind_Speed_kt": 6.8
    },
    {
      "Pressure_mb": 714.5,
      "Altitude_m": 2990,
      "Temp_c": -6.1,
      "Dewpoint_c": -10.3,
      "Wind_Direction": 333,
      "Wind_Speed_kt": 6.9
    },
    {
      "Pressure_mb": 714,
      "Altitude_m": 2996,
      "Temp_c": -6.2,
      "Dewpoint_c": -10.3,
      "Wind_Direction": 333,
      "Wind_Speed_kt": 7
    },
    {
      "Pressure_mb": 713.6,
      "Altitude_m": 3001,
      "Temp_c": -6.2,
      "Dewpoint_c": -10.3,
      "Wind_Direction": 333,
      "Wind_Speed_kt": 7.1
    },
    {
      "Pressure_mb": 713.1,
      "Altitude_m": 3006,
      "Temp_c": -6.2,
      "Dewpoint_c": -10.3,
      "Wind_Direction": 333,
      "Wind_Speed_kt": 7.2
    },
    {
      "Pressure_mb": 712.6,
      "Altitude_m": 3011,
      "Temp_c": -6.3,
      "Dewpoint_c": -10.4,
      "Wind_Direction": 333,
      "Wind_Speed_kt": 7.3
    },
    {
      "Pressure_mb": 712.2,
      "Altitude_m": 3016,
      "Temp_c": -6.3,
      "Dewpoint_c": -10.4,
      "Wind_Direction": 333,
      "Wind_Speed_kt": 7.4
    },
    {
      "Pressure_mb": 711.7,
      "Altitude_m": 3021,
      "Temp_c": -6.3,
      "Dewpoint_c": -10.4,
      "Wind_Direction": 334,
      "Wind_Speed_kt": 7.5
    },
    {
      "Pressure_mb": 711.3,
      "Altitude_m": 3026,
      "Temp_c": -6.4,
      "Dewpoint_c": -10.4,
      "Wind_Direction": 334,
      "Wind_Speed_kt": 7.5
    },
    {
      "Pressure_mb": 710.8,
      "Altitude_m": 3030,
      "Temp_c": -6.4,
      "Dewpoint_c": -10.4,
      "Wind_Direction": 334,
      "Wind_Speed_kt": 7.6
    },
    {
      "Pressure_mb": 710.4,
      "Altitude_m": 3035,
      "Temp_c": -6.4,
      "Dewpoint_c": -10.5,
      "Wind_Direction": 334,
      "Wind_Speed_kt": 7.7
    },
    {
      "Pressure_mb": 709.9,
      "Altitude_m": 3040,
      "Temp_c": -6.5,
      "Dewpoint_c": -10.5,
      "Wind_Direction": 334,
      "Wind_Speed_kt": 7.8
    },
    {
      "Pressure_mb": 709.4,
      "Altitude_m": 3045,
      "Temp_c": -6.5,
      "Dewpoint_c": -10.5,
      "Wind_Direction": 334,
      "Wind_Speed_kt": 7.9
    },
    {
      "Pressure_mb": 709,
      "Altitude_m": 3050,
      "Temp_c": -6.5,
      "Dewpoint_c": -10.5,
      "Wind_Direction": 334,
      "Wind_Speed_kt": 7.9
    },
    {
      "Pressure_mb": 708.5,
      "Altitude_m": 3055,
      "Temp_c": -6.6,
      "Dewpoint_c": -10.5,
      "Wind_Direction": 334,
      "Wind_Speed_kt": 7.9
    },
    {
      "Pressure_mb": 708,
      "Altitude_m": 3061,
      "Temp_c": -6.6,
      "Dewpoint_c": -10.6,
      "Wind_Direction": 335,
      "Wind_Speed_kt": 7.9
    },
    {
      "Pressure_mb": 707.5,
      "Altitude_m": 3066,
      "Temp_c": -6.6,
      "Dewpoint_c": -10.6,
      "Wind_Direction": 335,
      "Wind_Speed_kt": 7.9
    },
    {
      "Pressure_mb": 707.1,
      "Altitude_m": 3072,
      "Temp_c": -6.7,
      "Dewpoint_c": -10.6,
      "Wind_Direction": 335,
      "Wind_Speed_kt": 8
    },
    {
      "Pressure_mb": 706.6,
      "Altitude_m": 3077,
      "Temp_c": -6.7,
      "Dewpoint_c": -10.6,
      "Wind_Direction": 335,
      "Wind_Speed_kt": 8
    },
    {
      "Pressure_mb": 706.1,
      "Altitude_m": 3083,
      "Temp_c": -6.8,
      "Dewpoint_c": -10.6,
      "Wind_Direction": 335,
      "Wind_Speed_kt": 8
    },
    {
      "Pressure_mb": 705.6,
      "Altitude_m": 3089,
      "Temp_c": -6.8,
      "Dewpoint_c": -10.7,
      "Wind_Direction": 335,
      "Wind_Speed_kt": 8
    },
    {
      "Pressure_mb": 705.1,
      "Altitude_m": 3094,
      "Temp_c": -6.8,
      "Dewpoint_c": -10.7,
      "Wind_Direction": 336,
      "Wind_Speed_kt": 8
    },
    {
      "Pressure_mb": 704.6,
      "Altitude_m": 3099,
      "Temp_c": -6.9,
      "Dewpoint_c": -10.7,
      "Wind_Direction": 336,
      "Wind_Speed_kt": 8
    },
    {
      "Pressure_mb": 704.1,
      "Altitude_m": 3105,
      "Temp_c": -6.9,
      "Dewpoint_c": -10.7,
      "Wind_Direction": 336,
      "Wind_Speed_kt": 8
    },
    {
      "Pressure_mb": 703.6,
      "Altitude_m": 3110,
      "Temp_c": -7,
      "Dewpoint_c": -10.8,
      "Wind_Direction": 336,
      "Wind_Speed_kt": 8
    },
    {
      "Pressure_mb": 703.2,
      "Altitude_m": 3115,
      "Temp_c": -7,
      "Dewpoint_c": -10.8,
      "Wind_Direction": 336,
      "Wind_Speed_kt": 8.1
    },
    {
      "Pressure_mb": 702.7,
      "Altitude_m": 3120,
      "Temp_c": -7.1,
      "Dewpoint_c": -10.8,
      "Wind_Direction": 336,
      "Wind_Speed_kt": 8.1
    },
    {
      "Pressure_mb": 702.3,
      "Altitude_m": 3125,
      "Temp_c": -7.1,
      "Dewpoint_c": -10.8,
      "Wind_Direction": 337,
      "Wind_Speed_kt": 8.1
    },
    {
      "Pressure_mb": 701.8,
      "Altitude_m": 3130,
      "Temp_c": -7.1,
      "Dewpoint_c": -10.8,
      "Wind_Direction": 337,
      "Wind_Speed_kt": 8.1
    },
    {
      "Pressure_mb": 701.4,
      "Altitude_m": 3135,
      "Temp_c": -7.2,
      "Dewpoint_c": -10.8,
      "Wind_Direction": 337,
      "Wind_Speed_kt": 8.1
    },
    {
      "Pressure_mb": 701,
      "Altitude_m": 3139,
      "Temp_c": -7.2,
      "Dewpoint_c": -10.9,
      "Wind_Direction": 337,
      "Wind_Speed_kt": 8.1
    },
    {
      "Pressure_mb": 700.5,
      "Altitude_m": 3144,
      "Temp_c": -7.3,
      "Dewpoint_c": -10.9,
      "Wind_Direction": 337,
      "Wind_Speed_kt": 8.1
    },
    {
      "Pressure_mb": 700,
      "Altitude_m": 3150,
      "Temp_c": -7.3,
      "Dewpoint_c": -10.9,
      "Wind_Direction": 337,
      "Wind_Speed_kt": 8.1
    },
    {
      "Pressure_mb": 699.6,
      "Altitude_m": 3154,
      "Temp_c": -7.3,
      "Dewpoint_c": -10.9,
      "Wind_Direction": 337,
      "Wind_Speed_kt": 8.1
    },
    {
      "Pressure_mb": 699.2,
      "Altitude_m": 3159,
      "Temp_c": -7.4,
      "Dewpoint_c": -11,
      "Wind_Direction": 337,
      "Wind_Speed_kt": 8.1
    },
    {
      "Pressure_mb": 698.8,
      "Altitude_m": 3164,
      "Temp_c": -7.4,
      "Dewpoint_c": -11,
      "Wind_Direction": 338,
      "Wind_Speed_kt": 8.1
    },
    {
      "Pressure_mb": 698.3,
      "Altitude_m": 3169,
      "Temp_c": -7.5,
      "Dewpoint_c": -11,
      "Wind_Direction": 338,
      "Wind_Speed_kt": 8.1
    },
    {
      "Pressure_mb": 697.9,
      "Altitude_m": 3174,
      "Temp_c": -7.5,
      "Dewpoint_c": -11,
      "Wind_Direction": 338,
      "Wind_Speed_kt": 8.1
    },
    {
      "Pressure_mb": 697.5,
      "Altitude_m": 3179,
      "Temp_c": -7.5,
      "Dewpoint_c": -11,
      "Wind_Direction": 338,
      "Wind_Speed_kt": 8.1
    },
    {
      "Pressure_mb": 697.1,
      "Altitude_m": 3183,
      "Temp_c": -7.6,
      "Dewpoint_c": -11.1,
      "Wind_Direction": 338,
      "Wind_Speed_kt": 8.1
    },
    {
      "Pressure_mb": 696.6,
      "Altitude_m": 3188,
      "Temp_c": -7.6,
      "Dewpoint_c": -11.1,
      "Wind_Direction": 338,
      "Wind_Speed_kt": 8.1
    },
    {
      "Pressure_mb": 696.2,
      "Altitude_m": 3192,
      "Temp_c": -7.7,
      "Dewpoint_c": -11.1,
      "Wind_Direction": 338,
      "Wind_Speed_kt": 8.1
    },
    {
      "Pressure_mb": 695.8,
      "Altitude_m": 3197,
      "Temp_c": -7.7,
      "Dewpoint_c": -11.1,
      "Wind_Direction": 338,
      "Wind_Speed_kt": 8.1
    },
    {
      "Pressure_mb": 695.5,
      "Altitude_m": 3201,
      "Temp_c": -7.7,
      "Dewpoint_c": -11.2,
      "Wind_Direction": 338,
      "Wind_Speed_kt": 8.1
    },
    {
      "Pressure_mb": 695,
      "Altitude_m": 3206,
      "Temp_c": -7.7,
      "Dewpoint_c": -11.2,
      "Wind_Direction": 338,
      "Wind_Speed_kt": 8.1
    },
    {
      "Pressure_mb": 694.6,
      "Altitude_m": 3211,
      "Temp_c": -7.7,
      "Dewpoint_c": -11.2,
      "Wind_Direction": 338,
      "Wind_Speed_kt": 8
    },
    {
      "Pressure_mb": 694.2,
      "Altitude_m": 3215,
      "Temp_c": -7.7,
      "Dewpoint_c": -11.2,
      "Wind_Direction": 338,
      "Wind_Speed_kt": 8
    },
    {
      "Pressure_mb": 693.8,
      "Altitude_m": 3220,
      "Temp_c": -7.7,
      "Dewpoint_c": -11.3,
      "Wind_Direction": 338,
      "Wind_Speed_kt": 8
    },
    {
      "Pressure_mb": 693.4,
      "Altitude_m": 3224,
      "Temp_c": -7.7,
      "Dewpoint_c": -11.3,
      "Wind_Direction": 339,
      "Wind_Speed_kt": 8
    },
    {
      "Pressure_mb": 693,
      "Altitude_m": 3228,
      "Temp_c": -7.7,
      "Dewpoint_c": -11.3,
      "Wind_Direction": 339,
      "Wind_Speed_kt": 8
    },
    {
      "Pressure_mb": 692.6,
      "Altitude_m": 3233,
      "Temp_c": -7.8,
      "Dewpoint_c": -11.3,
      "Wind_Direction": 339,
      "Wind_Speed_kt": 8
    },
    {
      "Pressure_mb": 692.2,
      "Altitude_m": 3237,
      "Temp_c": -7.8,
      "Dewpoint_c": -11.3,
      "Wind_Direction": 339,
      "Wind_Speed_kt": 8
    },
    {
      "Pressure_mb": 691.8,
      "Altitude_m": 3242,
      "Temp_c": -7.8,
      "Dewpoint_c": -11.4,
      "Wind_Direction": 339,
      "Wind_Speed_kt": 8
    },
    {
      "Pressure_mb": 691.4,
      "Altitude_m": 3246,
      "Temp_c": -7.8,
      "Dewpoint_c": -11.4,
      "Wind_Direction": 339,
      "Wind_Speed_kt": 8
    },
    {
      "Pressure_mb": 691,
      "Altitude_m": 3251,
      "Temp_c": -7.8,
      "Dewpoint_c": -11.4,
      "Wind_Direction": 339,
      "Wind_Speed_kt": 8
    },
    {
      "Pressure_mb": 690.5,
      "Altitude_m": 3256,
      "Temp_c": -7.8,
      "Dewpoint_c": -11.4,
      "Wind_Direction": 339,
      "Wind_Speed_kt": 8
    },
    {
      "Pressure_mb": 690,
      "Altitude_m": 3262,
      "Temp_c": -7.8,
      "Dewpoint_c": -11.5,
      "Wind_Direction": 338,
      "Wind_Speed_kt": 8
    },
    {
      "Pressure_mb": 689.7,
      "Altitude_m": 3265,
      "Temp_c": -7.7,
      "Dewpoint_c": -11.5,
      "Wind_Direction": 338,
      "Wind_Speed_kt": 8
    },
    {
      "Pressure_mb": 689.3,
      "Altitude_m": 3270,
      "Temp_c": -7.7,
      "Dewpoint_c": -11.5,
      "Wind_Direction": 338,
      "Wind_Speed_kt": 8
    },
    {
      "Pressure_mb": 688.8,
      "Altitude_m": 3275,
      "Temp_c": -7.6,
      "Dewpoint_c": -11.5,
      "Wind_Direction": 338,
      "Wind_Speed_kt": 8
    },
    {
      "Pressure_mb": 688.4,
      "Altitude_m": 3280,
      "Temp_c": -7.5,
      "Dewpoint_c": -11.5,
      "Wind_Direction": 338,
      "Wind_Speed_kt": 8
    },
    {
      "Pressure_mb": 688,
      "Altitude_m": 3285,
      "Temp_c": -7.5,
      "Dewpoint_c": -11.5,
      "Wind_Direction": 338,
      "Wind_Speed_kt": 8
    },
    {
      "Pressure_mb": 687.6,
      "Altitude_m": 3290,
      "Temp_c": -7.4,
      "Dewpoint_c": -11.5,
      "Wind_Direction": 338,
      "Wind_Speed_kt": 8
    },
    {
      "Pressure_mb": 687.1,
      "Altitude_m": 3295,
      "Temp_c": -7.4,
      "Dewpoint_c": -11.6,
      "Wind_Direction": 338,
      "Wind_Speed_kt": 8
    },
    {
      "Pressure_mb": 686.7,
      "Altitude_m": 3299,
      "Temp_c": -7.3,
      "Dewpoint_c": -11.6,
      "Wind_Direction": 338,
      "Wind_Speed_kt": 8
    },
    {
      "Pressure_mb": 686.3,
      "Altitude_m": 3304,
      "Temp_c": -7.3,
      "Dewpoint_c": -11.6,
      "Wind_Direction": 337,
      "Wind_Speed_kt": 8
    },
    {
      "Pressure_mb": 685.9,
      "Altitude_m": 3309,
      "Temp_c": -7.2,
      "Dewpoint_c": -11.6,
      "Wind_Direction": 337,
      "Wind_Speed_kt": 8
    },
    {
      "Pressure_mb": 685.5,
      "Altitude_m": 3313,
      "Temp_c": -7.2,
      "Dewpoint_c": -11.6,
      "Wind_Direction": 337,
      "Wind_Speed_kt": 8
    },
    {
      "Pressure_mb": 685.1,
      "Altitude_m": 3318,
      "Temp_c": -7.1,
      "Dewpoint_c": -11.6,
      "Wind_Direction": 337,
      "Wind_Speed_kt": 8.1
    },
    {
      "Pressure_mb": 684.7,
      "Altitude_m": 3323,
      "Temp_c": -7.1,
      "Dewpoint_c": -11.7,
      "Wind_Direction": 337,
      "Wind_Speed_kt": 8.1
    },
    {
      "Pressure_mb": 684.4,
      "Altitude_m": 3326,
      "Temp_c": -7,
      "Dewpoint_c": -11.6,
      "Wind_Direction": 337,
      "Wind_Speed_kt": 8.1
    },
    {
      "Pressure_mb": 683.9,
      "Altitude_m": 3331,
      "Temp_c": -7,
      "Dewpoint_c": -11.7,
      "Wind_Direction": 337,
      "Wind_Speed_kt": 8.1
    },
    {
      "Pressure_mb": 683.5,
      "Altitude_m": 3336,
      "Temp_c": -7.1,
      "Dewpoint_c": -11.7,
      "Wind_Direction": 337,
      "Wind_Speed_kt": 8.1
    },
    {
      "Pressure_mb": 683.1,
      "Altitude_m": 3340,
      "Temp_c": -7.1,
      "Dewpoint_c": -11.8,
      "Wind_Direction": 336,
      "Wind_Speed_kt": 8.2
    },
    {
      "Pressure_mb": 682.8,
      "Altitude_m": 3344,
      "Temp_c": -7.1,
      "Dewpoint_c": -11.8,
      "Wind_Direction": 336,
      "Wind_Speed_kt": 8.3
    },
    {
      "Pressure_mb": 682.4,
      "Altitude_m": 3348,
      "Temp_c": -7.1,
      "Dewpoint_c": -11.8,
      "Wind_Direction": 336,
      "Wind_Speed_kt": 8.4
    },
    {
      "Pressure_mb": 682,
      "Altitude_m": 3353,
      "Temp_c": -7.1,
      "Dewpoint_c": -11.9,
      "Wind_Direction": 335,
      "Wind_Speed_kt": 8.6
    },
    {
      "Pressure_mb": 681.6,
      "Altitude_m": 3357,
      "Temp_c": -7.1,
      "Dewpoint_c": -11.9,
      "Wind_Direction": 335,
      "Wind_Speed_kt": 8.7
    },
    {
      "Pressure_mb": 681.2,
      "Altitude_m": 3362,
      "Temp_c": -7.2,
      "Dewpoint_c": -11.9,
      "Wind_Direction": 334,
      "Wind_Speed_kt": 8.8
    },
    {
      "Pressure_mb": 680.8,
      "Altitude_m": 3366,
      "Temp_c": -7.2,
      "Dewpoint_c": -12,
      "Wind_Direction": 334,
      "Wind_Speed_kt": 8.9
    },
    {
      "Pressure_mb": 680.4,
      "Altitude_m": 3370,
      "Temp_c": -7.2,
      "Dewpoint_c": -12,
      "Wind_Direction": 334,
      "Wind_Speed_kt": 9.1
    },
    {
      "Pressure_mb": 680,
      "Altitude_m": 3375,
      "Temp_c": -7.2,
      "Dewpoint_c": -12,
      "Wind_Direction": 334,
      "Wind_Speed_kt": 9.2
    },
    {
      "Pressure_mb": 679.4,
      "Altitude_m": 3382,
      "Temp_c": -7.2,
      "Dewpoint_c": -12.1,
      "Wind_Direction": 333,
      "Wind_Speed_kt": 9.4
    },
    {
      "Pressure_mb": 679.2,
      "Altitude_m": 3385,
      "Temp_c": -7.3,
      "Dewpoint_c": -12.1,
      "Wind_Direction": 333,
      "Wind_Speed_kt": 9.4
    },
    {
      "Pressure_mb": 678.8,
      "Altitude_m": 3390,
      "Temp_c": -7.3,
      "Dewpoint_c": -12.1,
      "Wind_Direction": 333,
      "Wind_Speed_kt": 9.6
    },
    {
      "Pressure_mb": 678.3,
      "Altitude_m": 3395,
      "Temp_c": -7.3,
      "Dewpoint_c": -12.1,
      "Wind_Direction": 332,
      "Wind_Speed_kt": 9.7
    },
    {
      "Pressure_mb": 677.9,
      "Altitude_m": 3400,
      "Temp_c": -7.3,
      "Dewpoint_c": -12.1,
      "Wind_Direction": 332,
      "Wind_Speed_kt": 9.8
    },
    {
      "Pressure_mb": 677.5,
      "Altitude_m": 3405,
      "Temp_c": -7.3,
      "Dewpoint_c": -12.1,
      "Wind_Direction": 332,
      "Wind_Speed_kt": 9.9
    },
    {
      "Pressure_mb": 677,
      "Altitude_m": 3410,
      "Temp_c": -7.4,
      "Dewpoint_c": -12.1,
      "Wind_Direction": 332,
      "Wind_Speed_kt": 0.1
    },
    {
      "Pressure_mb": 676.6,
      "Altitude_m": 3415,
      "Temp_c": -7.4,
      "Dewpoint_c": -12.1,
      "Wind_Direction": 331,
      "Wind_Speed_kt": 0.2
    },
    {
      "Pressure_mb": 676.2,
      "Altitude_m": 3420,
      "Temp_c": -7.4,
      "Dewpoint_c": -12.1,
      "Wind_Direction": 331,
      "Wind_Speed_kt": 0.3
    },
    {
      "Pressure_mb": 675.8,
      "Altitude_m": 3425,
      "Temp_c": -7.4,
      "Dewpoint_c": -12,
      "Wind_Direction": 331,
      "Wind_Speed_kt": 0.4
    },
    {
      "Pressure_mb": 675.4,
      "Altitude_m": 3430,
      "Temp_c": -7.5,
      "Dewpoint_c": -12,
      "Wind_Direction": 331,
      "Wind_Speed_kt": 0.6
    },
    {
      "Pressure_mb": 675,
      "Altitude_m": 3435,
      "Temp_c": -7.5,
      "Dewpoint_c": -12,
      "Wind_Direction": 331,
      "Wind_Speed_kt": 0.7
    },
    {
      "Pressure_mb": 674.6,
      "Altitude_m": 3439,
      "Temp_c": -7.5,
      "Dewpoint_c": -12,
      "Wind_Direction": 331,
      "Wind_Speed_kt": 0.8
    },
    {
      "Pressure_mb": 674.1,
      "Altitude_m": 3443,
      "Temp_c": -7.5,
      "Dewpoint_c": -12,
      "Wind_Direction": 332,
      "Wind_Speed_kt": 0.9
    },
    {
      "Pressure_mb": 673.7,
      "Altitude_m": 3447,
      "Temp_c": -7.6,
      "Dewpoint_c": -12,
      "Wind_Direction": 332,
      "Wind_Speed_kt": 1.1
    },
    {
      "Pressure_mb": 673.5,
      "Altitude_m": 3450,
      "Temp_c": -7.6,
      "Dewpoint_c": -12.1,
      "Wind_Direction": 333,
      "Wind_Speed_kt": 1.1
    },
    {
      "Pressure_mb": 673,
      "Altitude_m": 3456,
      "Temp_c": -7.6,
      "Dewpoint_c": -12.1,
      "Wind_Direction": 333,
      "Wind_Speed_kt": 1.3
    },
    {
      "Pressure_mb": 672.6,
      "Altitude_m": 3460,
      "Temp_c": -7.5,
      "Dewpoint_c": -12.1,
      "Wind_Direction": 334,
      "Wind_Speed_kt": 1.4
    },
    {
      "Pressure_mb": 672.2,
      "Altitude_m": 3466,
      "Temp_c": -7.5,
      "Dewpoint_c": -12.1,
      "Wind_Direction": 334,
      "Wind_Speed_kt": 1.5
    },
    {
      "Pressure_mb": 671.8,
      "Altitude_m": 3471,
      "Temp_c": -7.5,
      "Dewpoint_c": -12.1,
      "Wind_Direction": 334,
      "Wind_Speed_kt": 1.7
    },
    {
      "Pressure_mb": 671.3,
      "Altitude_m": 3476,
      "Temp_c": -7.5,
      "Dewpoint_c": -12.1,
      "Wind_Direction": 335,
      "Wind_Speed_kt": 1.8
    },
    {
      "Pressure_mb": 670.8,
      "Altitude_m": 3481,
      "Temp_c": -7.5,
      "Dewpoint_c": -12.1,
      "Wind_Direction": 335,
      "Wind_Speed_kt": 1.9
    },
    {
      "Pressure_mb": 670.3,
      "Altitude_m": 3487,
      "Temp_c": -7.5,
      "Dewpoint_c": -12.1,
      "Wind_Direction": 336,
      "Wind_Speed_kt": 2
    },
    {
      "Pressure_mb": 669.9,
      "Altitude_m": 3492,
      "Temp_c": -7.4,
      "Dewpoint_c": -12.1,
      "Wind_Direction": 336,
      "Wind_Speed_kt": 2.2
    },
    {
      "Pressure_mb": 669.4,
      "Altitude_m": 3498,
      "Temp_c": -7.4,
      "Dewpoint_c": -12.1,
      "Wind_Direction": 336,
      "Wind_Speed_kt": 2.3
    },
    {
      "Pressure_mb": 668.9,
      "Altitude_m": 3504,
      "Temp_c": -7.4,
      "Dewpoint_c": -12.1,
      "Wind_Direction": 337,
      "Wind_Speed_kt": 2.4
    },
    {
      "Pressure_mb": 668.5,
      "Altitude_m": 3509,
      "Temp_c": -7.4,
      "Dewpoint_c": -12.1,
      "Wind_Direction": 337,
      "Wind_Speed_kt": 2.6
    },
    {
      "Pressure_mb": 668.1,
      "Altitude_m": 3515,
      "Temp_c": -7.4,
      "Dewpoint_c": -12.1,
      "Wind_Direction": 337,
      "Wind_Speed_kt": 2.7
    },
    {
      "Pressure_mb": 667.6,
      "Altitude_m": 3521,
      "Temp_c": -7.4,
      "Dewpoint_c": -12.2,
      "Wind_Direction": 338,
      "Wind_Speed_kt": 2.8
    },
    {
      "Pressure_mb": 667.2,
      "Altitude_m": 3526,
      "Temp_c": -7.3,
      "Dewpoint_c": -12.3,
      "Wind_Direction": 338,
      "Wind_Speed_kt": 2.9
    },
    {
      "Pressure_mb": 666.7,
      "Altitude_m": 3530,
      "Temp_c": -7.2,
      "Dewpoint_c": -12.3,
      "Wind_Direction": 338,
      "Wind_Speed_kt": 3.1
    },
    {
      "Pressure_mb": 666.3,
      "Altitude_m": 3535,
      "Temp_c": -7.2,
      "Dewpoint_c": -12.4,
      "Wind_Direction": 339,
      "Wind_Speed_kt": 3.2
    },
    {
      "Pressure_mb": 665.9,
      "Altitude_m": 3539,
      "Temp_c": -7.1,
      "Dewpoint_c": -12.5,
      "Wind_Direction": 339,
      "Wind_Speed_kt": 3.2
    },
    {
      "Pressure_mb": 665.5,
      "Altitude_m": 3544,
      "Temp_c": -7.1,
      "Dewpoint_c": -12.5,
      "Wind_Direction": 339,
      "Wind_Speed_kt": 3.3
    },
    {
      "Pressure_mb": 665.2,
      "Altitude_m": 3548,
      "Temp_c": -7,
      "Dewpoint_c": -12.6,
      "Wind_Direction": 339,
      "Wind_Speed_kt": 3.4
    },
    {
      "Pressure_mb": 664.8,
      "Altitude_m": 3552,
      "Temp_c": -6.9,
      "Dewpoint_c": -12.7,
      "Wind_Direction": 339,
      "Wind_Speed_kt": 3.5
    },
    {
      "Pressure_mb": 664.4,
      "Altitude_m": 3556,
      "Temp_c": -6.9,
      "Dewpoint_c": -12.8,
      "Wind_Direction": 340,
      "Wind_Speed_kt": 3.6
    },
    {
      "Pressure_mb": 664.1,
      "Altitude_m": 3561,
      "Temp_c": -6.8,
      "Dewpoint_c": -12.9,
      "Wind_Direction": 340,
      "Wind_Speed_kt": 3.6
    },
    {
      "Pressure_mb": 663.6,
      "Altitude_m": 3565,
      "Temp_c": -6.8,
      "Dewpoint_c": -12.9,
      "Wind_Direction": 340,
      "Wind_Speed_kt": 3.7
    },
    {
      "Pressure_mb": 663.2,
      "Altitude_m": 3569,
      "Temp_c": -6.7,
      "Dewpoint_c": -13,
      "Wind_Direction": 340,
      "Wind_Speed_kt": 3.8
    },
    {
      "Pressure_mb": 662.8,
      "Altitude_m": 3574,
      "Temp_c": -6.6,
      "Dewpoint_c": -13.1,
      "Wind_Direction": 340,
      "Wind_Speed_kt": 3.9
    },
    {
      "Pressure_mb": 662.3,
      "Altitude_m": 3580,
      "Temp_c": -6.6,
      "Dewpoint_c": -13.2,
      "Wind_Direction": 341,
      "Wind_Speed_kt": 4
    },
    {
      "Pressure_mb": 661.9,
      "Altitude_m": 3585,
      "Temp_c": -6.6,
      "Dewpoint_c": -13.3,
      "Wind_Direction": 341,
      "Wind_Speed_kt": 4.1
    },
    {
      "Pressure_mb": 661.5,
      "Altitude_m": 3591,
      "Temp_c": -6.6,
      "Dewpoint_c": -13.4,
      "Wind_Direction": 341,
      "Wind_Speed_kt": 4.1
    },
    {
      "Pressure_mb": 661,
      "Altitude_m": 3597,
      "Temp_c": -6.5,
      "Dewpoint_c": -13.5,
      "Wind_Direction": 341,
      "Wind_Speed_kt": 4.2
    },
    {
      "Pressure_mb": 660.6,
      "Altitude_m": 3602,
      "Temp_c": -6.5,
      "Dewpoint_c": -13.6,
      "Wind_Direction": 341,
      "Wind_Speed_kt": 4.3
    },
    {
      "Pressure_mb": 660.1,
      "Altitude_m": 3608,
      "Temp_c": -6.5,
      "Dewpoint_c": -13.7,
      "Wind_Direction": 342,
      "Wind_Speed_kt": 4.4
    },
    {
      "Pressure_mb": 659.7,
      "Altitude_m": 3613,
      "Temp_c": -6.5,
      "Dewpoint_c": -13.8,
      "Wind_Direction": 342,
      "Wind_Speed_kt": 4.5
    },
    {
      "Pressure_mb": 659.2,
      "Altitude_m": 3618,
      "Temp_c": -6.5,
      "Dewpoint_c": -14,
      "Wind_Direction": 342,
      "Wind_Speed_kt": 4.6
    },
    {
      "Pressure_mb": 658.7,
      "Altitude_m": 3623,
      "Temp_c": -6.5,
      "Dewpoint_c": -14.1,
      "Wind_Direction": 342,
      "Wind_Speed_kt": 4.7
    },
    {
      "Pressure_mb": 658.3,
      "Altitude_m": 3629,
      "Temp_c": -6.5,
      "Dewpoint_c": -14.2,
      "Wind_Direction": 342,
      "Wind_Speed_kt": 4.7
    },
    {
      "Pressure_mb": 657.9,
      "Altitude_m": 3634,
      "Temp_c": -6.5,
      "Dewpoint_c": -14.3,
      "Wind_Direction": 343,
      "Wind_Speed_kt": 4.8
    },
    {
      "Pressure_mb": 657.5,
      "Altitude_m": 3639,
      "Temp_c": -6.5,
      "Dewpoint_c": -14.5,
      "Wind_Direction": 343,
      "Wind_Speed_kt": 4.8
    },
    {
      "Pressure_mb": 657.1,
      "Altitude_m": 3643,
      "Temp_c": -6.5,
      "Dewpoint_c": -14.6,
      "Wind_Direction": 343,
      "Wind_Speed_kt": 4.8
    },
    {
      "Pressure_mb": 656.7,
      "Altitude_m": 3648,
      "Temp_c": -6.5,
      "Dewpoint_c": -14.7,
      "Wind_Direction": 343,
      "Wind_Speed_kt": 4.8
    },
    {
      "Pressure_mb": 656.3,
      "Altitude_m": 3652,
      "Temp_c": -6.5,
      "Dewpoint_c": -14.8,
      "Wind_Direction": 343,
      "Wind_Speed_kt": 4.8
    },
    {
      "Pressure_mb": 655.9,
      "Altitude_m": 3658,
      "Temp_c": -6.5,
      "Dewpoint_c": -14.8,
      "Wind_Direction": 344,
      "Wind_Speed_kt": 4.8
    },
    {
      "Pressure_mb": 655.6,
      "Altitude_m": 3662,
      "Temp_c": -6.5,
      "Dewpoint_c": -14.9,
      "Wind_Direction": 344,
      "Wind_Speed_kt": 4.9
    },
    {
      "Pressure_mb": 655.2,
      "Altitude_m": 3666,
      "Temp_c": -6.5,
      "Dewpoint_c": -15,
      "Wind_Direction": 344,
      "Wind_Speed_kt": 4.9
    },
    {
      "Pressure_mb": 654.9,
      "Altitude_m": 3670,
      "Temp_c": -6.5,
      "Dewpoint_c": -15.1,
      "Wind_Direction": 344,
      "Wind_Speed_kt": 4.9
    },
    {
      "Pressure_mb": 654.5,
      "Altitude_m": 3674,
      "Temp_c": -6.6,
      "Dewpoint_c": -15.1,
      "Wind_Direction": 344,
      "Wind_Speed_kt": 4.9
    },
    {
      "Pressure_mb": 654.2,
      "Altitude_m": 3678,
      "Temp_c": -6.6,
      "Dewpoint_c": -15.2,
      "Wind_Direction": 344,
      "Wind_Speed_kt": 4.9
    },
    {
      "Pressure_mb": 653.8,
      "Altitude_m": 3682,
      "Temp_c": -6.6,
      "Dewpoint_c": -15.3,
      "Wind_Direction": 345,
      "Wind_Speed_kt": 4.9
    },
    {
      "Pressure_mb": 653.4,
      "Altitude_m": 3686,
      "Temp_c": -6.6,
      "Dewpoint_c": -15.4,
      "Wind_Direction": 345,
      "Wind_Speed_kt": 5
    },
    {
      "Pressure_mb": 653.1,
      "Altitude_m": 3691,
      "Temp_c": -6.6,
      "Dewpoint_c": -15.4,
      "Wind_Direction": 345,
      "Wind_Speed_kt": 5
    },
    {
      "Pressure_mb": 652.7,
      "Altitude_m": 3695,
      "Temp_c": -6.7,
      "Dewpoint_c": -15.5,
      "Wind_Direction": 345,
      "Wind_Speed_kt": 5
    },
    {
      "Pressure_mb": 652.3,
      "Altitude_m": 3700,
      "Temp_c": -6.7,
      "Dewpoint_c": -15.6,
      "Wind_Direction": 345,
      "Wind_Speed_kt": 5
    },
    {
      "Pressure_mb": 652,
      "Altitude_m": 3704,
      "Temp_c": -6.7,
      "Dewpoint_c": -15.6,
      "Wind_Direction": 346,
      "Wind_Speed_kt": 5
    },
    {
      "Pressure_mb": 651.6,
      "Altitude_m": 3708,
      "Temp_c": -6.7,
      "Dewpoint_c": -15.7,
      "Wind_Direction": 346,
      "Wind_Speed_kt": 5.1
    },
    {
      "Pressure_mb": 651.2,
      "Altitude_m": 3713,
      "Temp_c": -6.8,
      "Dewpoint_c": -15.8,
      "Wind_Direction": 346,
      "Wind_Speed_kt": 5.1
    },
    {
      "Pressure_mb": 650.8,
      "Altitude_m": 3718,
      "Temp_c": -6.8,
      "Dewpoint_c": -15.8,
      "Wind_Direction": 346,
      "Wind_Speed_kt": 5.1
    },
    {
      "Pressure_mb": 650.4,
      "Altitude_m": 3722,
      "Temp_c": -6.8,
      "Dewpoint_c": -15.8,
      "Wind_Direction": 346,
      "Wind_Speed_kt": 5.1
    },
    {
      "Pressure_mb": 650.1,
      "Altitude_m": 3727,
      "Temp_c": -6.8,
      "Dewpoint_c": -15.9,
      "Wind_Direction": 346,
      "Wind_Speed_kt": 5
    },
    {
      "Pressure_mb": 649.7,
      "Altitude_m": 3732,
      "Temp_c": -6.9,
      "Dewpoint_c": -15.9,
      "Wind_Direction": 346,
      "Wind_Speed_kt": 5
    },
    {
      "Pressure_mb": 649.3,
      "Altitude_m": 3736,
      "Temp_c": -6.9,
      "Dewpoint_c": -15.9,
      "Wind_Direction": 346,
      "Wind_Speed_kt": 5
    },
    {
      "Pressure_mb": 648.8,
      "Altitude_m": 3741,
      "Temp_c": -6.9,
      "Dewpoint_c": -16,
      "Wind_Direction": 346,
      "Wind_Speed_kt": 4.9
    },
    {
      "Pressure_mb": 648.4,
      "Altitude_m": 3746,
      "Temp_c": -6.9,
      "Dewpoint_c": -16,
      "Wind_Direction": 346,
      "Wind_Speed_kt": 4.9
    },
    {
      "Pressure_mb": 648,
      "Altitude_m": 3752,
      "Temp_c": -7,
      "Dewpoint_c": -16,
      "Wind_Direction": 345,
      "Wind_Speed_kt": 4.9
    },
    {
      "Pressure_mb": 647.5,
      "Altitude_m": 3757,
      "Temp_c": -7,
      "Dewpoint_c": -16.1,
      "Wind_Direction": 345,
      "Wind_Speed_kt": 4.9
    },
    {
      "Pressure_mb": 647.1,
      "Altitude_m": 3762,
      "Temp_c": -7,
      "Dewpoint_c": -16.1,
      "Wind_Direction": 345,
      "Wind_Speed_kt": 4.8
    },
    {
      "Pressure_mb": 646.7,
      "Altitude_m": 3768,
      "Temp_c": -7.1,
      "Dewpoint_c": -16.2,
      "Wind_Direction": 345,
      "Wind_Speed_kt": 4.8
    },
    {
      "Pressure_mb": 646.3,
      "Altitude_m": 3773,
      "Temp_c": -7.1,
      "Dewpoint_c": -16.2,
      "Wind_Direction": 345,
      "Wind_Speed_kt": 4.8
    },
    {
      "Pressure_mb": 645.9,
      "Altitude_m": 3778,
      "Temp_c": -7.1,
      "Dewpoint_c": -16.2,
      "Wind_Direction": 345,
      "Wind_Speed_kt": 4.7
    },
    {
      "Pressure_mb": 645.4,
      "Altitude_m": 3783,
      "Temp_c": -7.1,
      "Dewpoint_c": -16.3,
      "Wind_Direction": 345,
      "Wind_Speed_kt": 4.7
    },
    {
      "Pressure_mb": 645,
      "Altitude_m": 3788,
      "Temp_c": -7.2,
      "Dewpoint_c": -16.3,
      "Wind_Direction": 345,
      "Wind_Speed_kt": 4.7
    },
    {
      "Pressure_mb": 644.6,
      "Altitude_m": 3793,
      "Temp_c": -7.2,
      "Dewpoint_c": -16.4,
      "Wind_Direction": 345,
      "Wind_Speed_kt": 4.7
    },
    {
      "Pressure_mb": 644.2,
      "Altitude_m": 3798,
      "Temp_c": -7.2,
      "Dewpoint_c": -16.4,
      "Wind_Direction": 344,
      "Wind_Speed_kt": 4.6
    },
    {
      "Pressure_mb": 643.8,
      "Altitude_m": 3802,
      "Temp_c": -7.3,
      "Dewpoint_c": -16.5,
      "Wind_Direction": 344,
      "Wind_Speed_kt": 4.6
    },
    {
      "Pressure_mb": 643.4,
      "Altitude_m": 3807,
      "Temp_c": -7.3,
      "Dewpoint_c": -16.5,
      "Wind_Direction": 344,
      "Wind_Speed_kt": 4.6
    },
    {
      "Pressure_mb": 643.1,
      "Altitude_m": 3812,
      "Temp_c": -7.3,
      "Dewpoint_c": -16.6,
      "Wind_Direction": 344,
      "Wind_Speed_kt": 4.5
    },
    {
      "Pressure_mb": 642.7,
      "Altitude_m": 3816,
      "Temp_c": -7.4,
      "Dewpoint_c": -16.6,
      "Wind_Direction": 344,
      "Wind_Speed_kt": 4.5
    },
    {
      "Pressure_mb": 642.3,
      "Altitude_m": 3821,
      "Temp_c": -7.4,
      "Dewpoint_c": -16.7,
      "Wind_Direction": 344,
      "Wind_Speed_kt": 4.5
    },
    {
      "Pressure_mb": 641.9,
      "Altitude_m": 3826,
      "Temp_c": -7.4,
      "Dewpoint_c": -16.7,
      "Wind_Direction": 344,
      "Wind_Speed_kt": 4.4
    },
    {
      "Pressure_mb": 641.4,
      "Altitude_m": 3831,
      "Temp_c": -7.5,
      "Dewpoint_c": -16.8,
      "Wind_Direction": 344,
      "Wind_Speed_kt": 4.4
    },
    {
      "Pressure_mb": 641,
      "Altitude_m": 3836,
      "Temp_c": -7.5,
      "Dewpoint_c": -16.8,
      "Wind_Direction": 343,
      "Wind_Speed_kt": 4.4
    },
    {
      "Pressure_mb": 640.8,
      "Altitude_m": 3839,
      "Temp_c": -7.5,
      "Dewpoint_c": -16.9,
      "Wind_Direction": 343,
      "Wind_Speed_kt": 4.4
    },
    {
      "Pressure_mb": 640.2,
      "Altitude_m": 3847,
      "Temp_c": -7.6,
      "Dewpoint_c": -16.9,
      "Wind_Direction": 343,
      "Wind_Speed_kt": 4.3
    },
    {
      "Pressure_mb": 639.7,
      "Altitude_m": 3852,
      "Temp_c": -7.6,
      "Dewpoint_c": -16.9,
      "Wind_Direction": 343,
      "Wind_Speed_kt": 4.3
    },
    {
      "Pressure_mb": 639.3,
      "Altitude_m": 3857,
      "Temp_c": -7.6,
      "Dewpoint_c": -17,
      "Wind_Direction": 343,
      "Wind_Speed_kt": 4.3
    },
    {
      "Pressure_mb": 638.9,
      "Altitude_m": 3861,
      "Temp_c": -7.7,
      "Dewpoint_c": -17,
      "Wind_Direction": 343,
      "Wind_Speed_kt": 4.2
    },
    {
      "Pressure_mb": 638.5,
      "Altitude_m": 3866,
      "Temp_c": -7.7,
      "Dewpoint_c": -17,
      "Wind_Direction": 342,
      "Wind_Speed_kt": 4.2
    },
    {
      "Pressure_mb": 638.1,
      "Altitude_m": 3871,
      "Temp_c": -7.8,
      "Dewpoint_c": -17.1,
      "Wind_Direction": 342,
      "Wind_Speed_kt": 4.2
    },
    {
      "Pressure_mb": 637.7,
      "Altitude_m": 3876,
      "Temp_c": -7.8,
      "Dewpoint_c": -17.1,
      "Wind_Direction": 342,
      "Wind_Speed_kt": 4.1
    },
    {
      "Pressure_mb": 637.3,
      "Altitude_m": 3881,
      "Temp_c": -7.8,
      "Dewpoint_c": -17.1,
      "Wind_Direction": 342,
      "Wind_Speed_kt": 4.1
    },
    {
      "Pressure_mb": 636.9,
      "Altitude_m": 3886,
      "Temp_c": -7.9,
      "Dewpoint_c": -17.2,
      "Wind_Direction": 342,
      "Wind_Speed_kt": 4.1
    },
    {
      "Pressure_mb": 636.5,
      "Altitude_m": 3891,
      "Temp_c": -7.9,
      "Dewpoint_c": -17.2,
      "Wind_Direction": 342,
      "Wind_Speed_kt": 4
    },
    {
      "Pressure_mb": 636.1,
      "Altitude_m": 3896,
      "Temp_c": -7.9,
      "Dewpoint_c": -17.2,
      "Wind_Direction": 342,
      "Wind_Speed_kt": 4
    },
    {
      "Pressure_mb": 635.7,
      "Altitude_m": 3901,
      "Temp_c": -8,
      "Dewpoint_c": -17.3,
      "Wind_Direction": 341,
      "Wind_Speed_kt": 4
    },
    {
      "Pressure_mb": 635.3,
      "Altitude_m": 3906,
      "Temp_c": -8,
      "Dewpoint_c": -17.3,
      "Wind_Direction": 341,
      "Wind_Speed_kt": 3.9
    },
    {
      "Pressure_mb": 634.9,
      "Altitude_m": 3910,
      "Temp_c": -8.1,
      "Dewpoint_c": -17.4,
      "Wind_Direction": 341,
      "Wind_Speed_kt": 3.9
    },
    {
      "Pressure_mb": 634.6,
      "Altitude_m": 3915,
      "Temp_c": -8.1,
      "Dewpoint_c": -17.4,
      "Wind_Direction": 341,
      "Wind_Speed_kt": 3.9
    },
    {
      "Pressure_mb": 634.2,
      "Altitude_m": 3920,
      "Temp_c": -8.1,
      "Dewpoint_c": -17.4,
      "Wind_Direction": 341,
      "Wind_Speed_kt": 3.8
    },
    {
      "Pressure_mb": 633.8,
      "Altitude_m": 3924,
      "Temp_c": -8.2,
      "Dewpoint_c": -17.5,
      "Wind_Direction": 341,
      "Wind_Speed_kt": 3.7
    },
    {
      "Pressure_mb": 633.4,
      "Altitude_m": 3929,
      "Temp_c": -8.2,
      "Dewpoint_c": -17.5,
      "Wind_Direction": 341,
      "Wind_Speed_kt": 3.7
    },
    {
      "Pressure_mb": 633,
      "Altitude_m": 3933,
      "Temp_c": -8.2,
      "Dewpoint_c": -17.6,
      "Wind_Direction": 341,
      "Wind_Speed_kt": 3.6
    },
    {
      "Pressure_mb": 632.6,
      "Altitude_m": 3939,
      "Temp_c": -8.3,
      "Dewpoint_c": -17.6,
      "Wind_Direction": 341,
      "Wind_Speed_kt": 3.5
    },
    {
      "Pressure_mb": 632.2,
      "Altitude_m": 3944,
      "Temp_c": -8.3,
      "Dewpoint_c": -17.7,
      "Wind_Direction": 341,
      "Wind_Speed_kt": 3.5
    },
    {
      "Pressure_mb": 631.8,
      "Altitude_m": 3949,
      "Temp_c": -8.3,
      "Dewpoint_c": -17.7,
      "Wind_Direction": 341,
      "Wind_Speed_kt": 3.4
    },
    {
      "Pressure_mb": 631.3,
      "Altitude_m": 3955,
      "Temp_c": -8.4,
      "Dewpoint_c": -17.8,
      "Wind_Direction": 341,
      "Wind_Speed_kt": 3.3
    },
    {
      "Pressure_mb": 630.9,
      "Altitude_m": 3960,
      "Temp_c": -8.4,
      "Dewpoint_c": -17.8,
      "Wind_Direction": 341,
      "Wind_Speed_kt": 3.3
    },
    {
      "Pressure_mb": 630.5,
      "Altitude_m": 3965,
      "Temp_c": -8.4,
      "Dewpoint_c": -17.9,
      "Wind_Direction": 341,
      "Wind_Speed_kt": 3.2
    },
    {
      "Pressure_mb": 630,
      "Altitude_m": 3970,
      "Temp_c": -8.5,
      "Dewpoint_c": -17.9,
      "Wind_Direction": 341,
      "Wind_Speed_kt": 3.1
    },
    {
      "Pressure_mb": 629.8,
      "Altitude_m": 3973,
      "Temp_c": -8.5,
      "Dewpoint_c": -17.9,
      "Wind_Direction": 341,
      "Wind_Speed_kt": 3.1
    },
    {
      "Pressure_mb": 629.3,
      "Altitude_m": 3980,
      "Temp_c": -8.6,
      "Dewpoint_c": -18,
      "Wind_Direction": 341,
      "Wind_Speed_kt": 3
    },
    {
      "Pressure_mb": 628.9,
      "Altitude_m": 3984,
      "Temp_c": -8.6,
      "Dewpoint_c": -18,
      "Wind_Direction": 341,
      "Wind_Speed_kt": 2.9
    },
    {
      "Pressure_mb": 628.5,
      "Altitude_m": 3989,
      "Temp_c": -8.6,
      "Dewpoint_c": -18,
      "Wind_Direction": 340,
      "Wind_Speed_kt": 2.9
    },
    {
      "Pressure_mb": 628.2,
      "Altitude_m": 3994,
      "Temp_c": -8.7,
      "Dewpoint_c": -18,
      "Wind_Direction": 340,
      "Wind_Speed_kt": 2.8
    },
    {
      "Pressure_mb": 627.8,
      "Altitude_m": 3998,
      "Temp_c": -8.7,
      "Dewpoint_c": -18.1,
      "Wind_Direction": 340,
      "Wind_Speed_kt": 2.7
    },
    {
      "Pressure_mb": 627.4,
      "Altitude_m": 4002,
      "Temp_c": -8.7,
      "Dewpoint_c": -18.1,
      "Wind_Direction": 340,
      "Wind_Speed_kt": 2.6
    },
    {
      "Pressure_mb": 627.1,
      "Altitude_m": 4007,
      "Temp_c": -8.8,
      "Dewpoint_c": -18.1,
      "Wind_Direction": 340,
      "Wind_Speed_kt": 2.6
    },
    {
      "Pressure_mb": 626.7,
      "Altitude_m": 4011,
      "Temp_c": -8.8,
      "Dewpoint_c": -18.2,
      "Wind_Direction": 340,
      "Wind_Speed_kt": 2.5
    },
    {
      "Pressure_mb": 626.4,
      "Altitude_m": 4015,
      "Temp_c": -8.8,
      "Dewpoint_c": -18.2,
      "Wind_Direction": 340,
      "Wind_Speed_kt": 2.6
    },
    {
      "Pressure_mb": 626,
      "Altitude_m": 4020,
      "Temp_c": -8.9,
      "Dewpoint_c": -18.2,
      "Wind_Direction": 340,
      "Wind_Speed_kt": 2.6
    },
    {
      "Pressure_mb": 625.7,
      "Altitude_m": 4024,
      "Temp_c": -8.9,
      "Dewpoint_c": -18.2,
      "Wind_Direction": 340,
      "Wind_Speed_kt": 2.7
    },
    {
      "Pressure_mb": 625.3,
      "Altitude_m": 4029,
      "Temp_c": -8.9,
      "Dewpoint_c": -18.3,
      "Wind_Direction": 340,
      "Wind_Speed_kt": 2.7
    },
    {
      "Pressure_mb": 624.9,
      "Altitude_m": 4033,
      "Temp_c": -9,
      "Dewpoint_c": -18.3,
      "Wind_Direction": 340,
      "Wind_Speed_kt": 2.8
    },
    {
      "Pressure_mb": 624.6,
      "Altitude_m": 4038,
      "Temp_c": -9,
      "Dewpoint_c": -18.3,
      "Wind_Direction": 339,
      "Wind_Speed_kt": 2.9
    },
    {
      "Pressure_mb": 624.2,
      "Altitude_m": 4042,
      "Temp_c": -9,
      "Dewpoint_c": -18.3,
      "Wind_Direction": 339,
      "Wind_Speed_kt": 2.9
    },
    {
      "Pressure_mb": 623.8,
      "Altitude_m": 4047,
      "Temp_c": -9.1,
      "Dewpoint_c": -18.4,
      "Wind_Direction": 339,
      "Wind_Speed_kt": 3
    },
    {
      "Pressure_mb": 623.4,
      "Altitude_m": 4052,
      "Temp_c": -9.1,
      "Dewpoint_c": -18.4,
      "Wind_Direction": 339,
      "Wind_Speed_kt": 3
    },
    {
      "Pressure_mb": 623,
      "Altitude_m": 4057,
      "Temp_c": -9.2,
      "Dewpoint_c": -18.4,
      "Wind_Direction": 339,
      "Wind_Speed_kt": 3.1
    },
    {
      "Pressure_mb": 622.6,
      "Altitude_m": 4062,
      "Temp_c": -9.2,
      "Dewpoint_c": -18.5,
      "Wind_Direction": 339,
      "Wind_Speed_kt": 3.2
    },
    {
      "Pressure_mb": 622.2,
      "Altitude_m": 4067,
      "Temp_c": -9.2,
      "Dewpoint_c": -18.5,
      "Wind_Direction": 339,
      "Wind_Speed_kt": 3.2
    },
    {
      "Pressure_mb": 621.8,
      "Altitude_m": 4072,
      "Temp_c": -9.3,
      "Dewpoint_c": -18.5,
      "Wind_Direction": 338,
      "Wind_Speed_kt": 3.3
    },
    {
      "Pressure_mb": 621.4,
      "Altitude_m": 4077,
      "Temp_c": -9.3,
      "Dewpoint_c": -18.5,
      "Wind_Direction": 338,
      "Wind_Speed_kt": 3.3
    },
    {
      "Pressure_mb": 621,
      "Altitude_m": 4082,
      "Temp_c": -9.3,
      "Dewpoint_c": -18.6,
      "Wind_Direction": 338,
      "Wind_Speed_kt": 3.4
    },
    {
      "Pressure_mb": 620.6,
      "Altitude_m": 4087,
      "Temp_c": -9.4,
      "Dewpoint_c": -18.6,
      "Wind_Direction": 338,
      "Wind_Speed_kt": 3.5
    },
    {
      "Pressure_mb": 620.2,
      "Altitude_m": 4093,
      "Temp_c": -9.4,
      "Dewpoint_c": -18.6,
      "Wind_Direction": 338,
      "Wind_Speed_kt": 3.5
    },
    {
      "Pressure_mb": 619.8,
      "Altitude_m": 4098,
      "Temp_c": -9.5,
      "Dewpoint_c": -18.6,
      "Wind_Direction": 338,
      "Wind_Speed_kt": 3.6
    },
    {
      "Pressure_mb": 619.4,
      "Altitude_m": 4103,
      "Temp_c": -9.5,
      "Dewpoint_c": -18.7,
      "Wind_Direction": 338,
      "Wind_Speed_kt": 3.6
    },
    {
      "Pressure_mb": 618.9,
      "Altitude_m": 4108,
      "Temp_c": -9.5,
      "Dewpoint_c": -18.7,
      "Wind_Direction": 337,
      "Wind_Speed_kt": 3.7
    },
    {
      "Pressure_mb": 618.5,
      "Altitude_m": 4113,
      "Temp_c": -9.6,
      "Dewpoint_c": -18.7,
      "Wind_Direction": 337,
      "Wind_Speed_kt": 3.7
    },
    {
      "Pressure_mb": 618.1,
      "Altitude_m": 4118,
      "Temp_c": -9.6,
      "Dewpoint_c": -18.7,
      "Wind_Direction": 337,
      "Wind_Speed_kt": 3.8
    },
    {
      "Pressure_mb": 617.7,
      "Altitude_m": 4123,
      "Temp_c": -9.7,
      "Dewpoint_c": -18.7,
      "Wind_Direction": 336,
      "Wind_Speed_kt": 3.8
    },
    {
      "Pressure_mb": 617.3,
      "Altitude_m": 4128,
      "Temp_c": -9.7,
      "Dewpoint_c": -18.7,
      "Wind_Direction": 336,
      "Wind_Speed_kt": 3.8
    },
    {
      "Pressure_mb": 616.9,
      "Altitude_m": 4134,
      "Temp_c": -9.8,
      "Dewpoint_c": -18.7,
      "Wind_Direction": 336,
      "Wind_Speed_kt": 3.8
    },
    {
      "Pressure_mb": 616.4,
      "Altitude_m": 4139,
      "Temp_c": -9.8,
      "Dewpoint_c": -18.7,
      "Wind_Direction": 335,
      "Wind_Speed_kt": 3.9
    },
    {
      "Pressure_mb": 616,
      "Altitude_m": 4144,
      "Temp_c": -9.8,
      "Dewpoint_c": -18.8,
      "Wind_Direction": 335,
      "Wind_Speed_kt": 3.9
    },
    {
      "Pressure_mb": 615.6,
      "Altitude_m": 4150,
      "Temp_c": -9.9,
      "Dewpoint_c": -18.8,
      "Wind_Direction": 335,
      "Wind_Speed_kt": 3.9
    },
    {
      "Pressure_mb": 615.2,
      "Altitude_m": 4155,
      "Temp_c": -9.9,
      "Dewpoint_c": -18.8,
      "Wind_Direction": 334,
      "Wind_Speed_kt": 4
    },
    {
      "Pressure_mb": 614.8,
      "Altitude_m": 4161,
      "Temp_c": -10,
      "Dewpoint_c": -18.8,
      "Wind_Direction": 334,
      "Wind_Speed_kt": 4
    },
    {
      "Pressure_mb": 614.4,
      "Altitude_m": 4166,
      "Temp_c": -10,
      "Dewpoint_c": -18,
      "Wind_Direction": 334,
      "Wind_Speed_kt": 4
    },
    {
      "Pressure_mb": 613.9,
      "Altitude_m": 4171,
      "Temp_c": -10,
      "Dewpoint_c": -18,
      "Wind_Direction": 333,
      "Wind_Speed_kt": 4.1
    },
    {
      "Pressure_mb": 613.5,
      "Altitude_m": 4176,
      "Temp_c": -10.1,
      "Dewpoint_c": -18,
      "Wind_Direction": 333,
      "Wind_Speed_kt": 4.1
    },
    {
      "Pressure_mb": 613.1,
      "Altitude_m": 4181,
      "Temp_c": -10.1,
      "Dewpoint_c": -18,
      "Wind_Direction": 333,
      "Wind_Speed_kt": 4.1
    },
    {
      "Pressure_mb": 612.7,
      "Altitude_m": 4186,
      "Temp_c": -10.2,
      "Dewpoint_c": -18.1,
      "Wind_Direction": 332,
      "Wind_Speed_kt": 4.2
    },
    {
      "Pressure_mb": 612.3,
      "Altitude_m": 4191,
      "Temp_c": -10.2,
      "Dewpoint_c": -18.1,
      "Wind_Direction": 332,
      "Wind_Speed_kt": 4.2
    },
    {
      "Pressure_mb": 611.9,
      "Altitude_m": 4196,
      "Temp_c": -10.3,
      "Dewpoint_c": -18.1,
      "Wind_Direction": 332,
      "Wind_Speed_kt": 4.2
    },
    {
      "Pressure_mb": 611.6,
      "Altitude_m": 4200,
      "Temp_c": -10.3,
      "Dewpoint_c": -18.1,
      "Wind_Direction": 331,
      "Wind_Speed_kt": 4.3
    },
    {
      "Pressure_mb": 611.1,
      "Altitude_m": 4206,
      "Temp_c": -10.3,
      "Dewpoint_c": -18.2,
      "Wind_Direction": 331,
      "Wind_Speed_kt": 4.3
    },
    {
      "Pressure_mb": 610.7,
      "Altitude_m": 4211,
      "Temp_c": -10.4,
      "Dewpoint_c": -18.2,
      "Wind_Direction": 331,
      "Wind_Speed_kt": 4.4
    },
    {
      "Pressure_mb": 610.4,
      "Altitude_m": 4216,
      "Temp_c": -10.4,
      "Dewpoint_c": -18.2,
      "Wind_Direction": 331,
      "Wind_Speed_kt": 4.3
    },
    {
      "Pressure_mb": 610,
      "Altitude_m": 4221,
      "Temp_c": -10.5,
      "Dewpoint_c": -18.2,
      "Wind_Direction": 330,
      "Wind_Speed_kt": 4.3
    },
    {
      "Pressure_mb": 609.6,
      "Altitude_m": 4226,
      "Temp_c": -10.5,
      "Dewpoint_c": -18.3,
      "Wind_Direction": 330,
      "Wind_Speed_kt": 4.3
    },
    {
      "Pressure_mb": 609.2,
      "Altitude_m": 4230,
      "Temp_c": -10.5,
      "Dewpoint_c": -18.3,
      "Wind_Direction": 330,
      "Wind_Speed_kt": 4.3
    },
    {
      "Pressure_mb": 608.8,
      "Altitude_m": 4236,
      "Temp_c": -10.6,
      "Dewpoint_c": -18.3,
      "Wind_Direction": 330,
      "Wind_Speed_kt": 4.2
    },
    {
      "Pressure_mb": 608.4,
      "Altitude_m": 4240,
      "Temp_c": -10.6,
      "Dewpoint_c": -18.4,
      "Wind_Direction": 330,
      "Wind_Speed_kt": 4.2
    },
    {
      "Pressure_mb": 608,
      "Altitude_m": 4244,
      "Temp_c": -10.7,
      "Dewpoint_c": -18.4,
      "Wind_Direction": 330,
      "Wind_Speed_kt": 4.2
    },
    {
      "Pressure_mb": 607.6,
      "Altitude_m": 4249,
      "Temp_c": -10.7,
      "Dewpoint_c": -18.4,
      "Wind_Direction": 330,
      "Wind_Speed_kt": 4.2
    },
    {
      "Pressure_mb": 607.2,
      "Altitude_m": 4254,
      "Temp_c": -10.8,
      "Dewpoint_c": -18.5,
      "Wind_Direction": 330,
      "Wind_Speed_kt": 4.2
    },
    {
      "Pressure_mb": 606.8,
      "Altitude_m": 4260,
      "Temp_c": -10.8,
      "Dewpoint_c": -18.5,
      "Wind_Direction": 330,
      "Wind_Speed_kt": 4.2
    },
    {
      "Pressure_mb": 606.4,
      "Altitude_m": 4265,
      "Temp_c": -10.8,
      "Dewpoint_c": -18.6,
      "Wind_Direction": 330,
      "Wind_Speed_kt": 4.1
    },
    {
      "Pressure_mb": 606,
      "Altitude_m": 4270,
      "Temp_c": -10.9,
      "Dewpoint_c": -18.6,
      "Wind_Direction": 330,
      "Wind_Speed_kt": 4.1
    },
    {
      "Pressure_mb": 605.6,
      "Altitude_m": 4276,
      "Temp_c": -10.9,
      "Dewpoint_c": -18.6,
      "Wind_Direction": 330,
      "Wind_Speed_kt": 4.1
    },
    {
      "Pressure_mb": 605.1,
      "Altitude_m": 4281,
      "Temp_c": -10.9,
      "Dewpoint_c": -18.7,
      "Wind_Direction": 330,
      "Wind_Speed_kt": 4.1
    },
    {
      "Pressure_mb": 604.7,
      "Altitude_m": 4287,
      "Temp_c": -11,
      "Dewpoint_c": -18.7,
      "Wind_Direction": 330,
      "Wind_Speed_kt": 4.1
    },
    {
      "Pressure_mb": 604.3,
      "Altitude_m": 4292,
      "Temp_c": -11,
      "Dewpoint_c": -18.8,
      "Wind_Direction": 329,
      "Wind_Speed_kt": 4
    },
    {
      "Pressure_mb": 603.8,
      "Altitude_m": 4298,
      "Temp_c": -11.1,
      "Dewpoint_c": -18.8,
      "Wind_Direction": 329,
      "Wind_Speed_kt": 4
    },
    {
      "Pressure_mb": 603.5,
      "Altitude_m": 4304,
      "Temp_c": -11.1,
      "Dewpoint_c": -18.8,
      "Wind_Direction": 329,
      "Wind_Speed_kt": 4
    },
    {
      "Pressure_mb": 603.1,
      "Altitude_m": 4309,
      "Temp_c": -11.1,
      "Dewpoint_c": -18.9,
      "Wind_Direction": 329,
      "Wind_Speed_kt": 4
    },
    {
      "Pressure_mb": 602.7,
      "Altitude_m": 4313,
      "Temp_c": -11.2,
      "Dewpoint_c": -18.9,
      "Wind_Direction": 329,
      "Wind_Speed_kt": 4
    },
    {
      "Pressure_mb": 602.4,
      "Altitude_m": 4317,
      "Temp_c": -11.2,
      "Dewpoint_c": -19,
      "Wind_Direction": 329,
      "Wind_Speed_kt": 3.9
    },
    {
      "Pressure_mb": 602,
      "Altitude_m": 4322,
      "Temp_c": -11.3,
      "Dewpoint_c": -19,
      "Wind_Direction": 329,
      "Wind_Speed_kt": 3.9
    },
    {
      "Pressure_mb": 601.6,
      "Altitude_m": 4326,
      "Temp_c": -11.3,
      "Dewpoint_c": -19.1,
      "Wind_Direction": 330,
      "Wind_Speed_kt": 3.9
    },
    {
      "Pressure_mb": 601.2,
      "Altitude_m": 4331,
      "Temp_c": -11.4,
      "Dewpoint_c": -19.1,
      "Wind_Direction": 330,
      "Wind_Speed_kt": 3.9
    },
    {
      "Pressure_mb": 600.9,
      "Altitude_m": 4335,
      "Temp_c": -11.4,
      "Dewpoint_c": -19.2,
      "Wind_Direction": 330,
      "Wind_Speed_kt": 3.9
    },
    {
      "Pressure_mb": 600.5,
      "Altitude_m": 4340,
      "Temp_c": -11.4,
      "Dewpoint_c": -19.2,
      "Wind_Direction": 330,
      "Wind_Speed_kt": 3.8
    },
    {
      "Pressure_mb": 600.1,
      "Altitude_m": 4346,
      "Temp_c": -11.5,
      "Dewpoint_c": -19.3,
      "Wind_Direction": 330,
      "Wind_Speed_kt": 3.8
    },
    {
      "Pressure_mb": 599.7,
      "Altitude_m": 4351,
      "Temp_c": -11.5,
      "Dewpoint_c": -19.3,
      "Wind_Direction": 330,
      "Wind_Speed_kt": 3.8
    },
    {
      "Pressure_mb": 599.3,
      "Altitude_m": 4356,
      "Temp_c": -11.6,
      "Dewpoint_c": -19.4,
      "Wind_Direction": 331,
      "Wind_Speed_kt": 3.8
    },
    {
      "Pressure_mb": 598.9,
      "Altitude_m": 4361,
      "Temp_c": -11.6,
      "Dewpoint_c": -19.4,
      "Wind_Direction": 331,
      "Wind_Speed_kt": 3.8
    },
    {
      "Pressure_mb": 598.5,
      "Altitude_m": 4366,
      "Temp_c": -11.6,
      "Dewpoint_c": -19.5,
      "Wind_Direction": 331,
      "Wind_Speed_kt": 3.8
    },
    {
      "Pressure_mb": 598.2,
      "Altitude_m": 4371,
      "Temp_c": -11.7,
      "Dewpoint_c": -19.5,
      "Wind_Direction": 331,
      "Wind_Speed_kt": 3.7
    },
    {
      "Pressure_mb": 597.8,
      "Altitude_m": 4376,
      "Temp_c": -11.7,
      "Dewpoint_c": -19.6,
      "Wind_Direction": 331,
      "Wind_Speed_kt": 3.7
    },
    {
      "Pressure_mb": 597.4,
      "Altitude_m": 4381,
      "Temp_c": -11.8,
      "Dewpoint_c": -19.6,
      "Wind_Direction": 331,
      "Wind_Speed_kt": 3.7
    },
    {
      "Pressure_mb": 597,
      "Altitude_m": 4386,
      "Temp_c": -11.8,
      "Dewpoint_c": -19.7,
      "Wind_Direction": 331,
      "Wind_Speed_kt": 3.7
    },
    {
      "Pressure_mb": 596.6,
      "Altitude_m": 4391,
      "Temp_c": -11.8,
      "Dewpoint_c": -19.7,
      "Wind_Direction": 332,
      "Wind_Speed_kt": 3.7
    },
    {
      "Pressure_mb": 596.2,
      "Altitude_m": 4396,
      "Temp_c": -11.9,
      "Dewpoint_c": -19.8,
      "Wind_Direction": 332,
      "Wind_Speed_kt": 3.7
    },
    {
      "Pressure_mb": 595.8,
      "Altitude_m": 4401,
      "Temp_c": -11.9,
      "Dewpoint_c": -19.8,
      "Wind_Direction": 332,
      "Wind_Speed_kt": 3.6
    },
    {
      "Pressure_mb": 595.4,
      "Altitude_m": 4406,
      "Temp_c": -11.9,
      "Dewpoint_c": -19.9,
      "Wind_Direction": 332,
      "Wind_Speed_kt": 3.6
    },
    {
      "Pressure_mb": 595,
      "Altitude_m": 4411,
      "Temp_c": -12,
      "Dewpoint_c": -19.9,
      "Wind_Direction": 332,
      "Wind_Speed_kt": 3.6
    },
    {
      "Pressure_mb": 594.6,
      "Altitude_m": 4417,
      "Temp_c": -12,
      "Dewpoint_c": -20,
      "Wind_Direction": 332,
      "Wind_Speed_kt": 3.6
    },
    {
      "Pressure_mb": 594.2,
      "Altitude_m": 4422,
      "Temp_c": -12,
      "Dewpoint_c": -20,
      "Wind_Direction": 332,
      "Wind_Speed_kt": 3.7
    },
    {
      "Pressure_mb": 593.8,
      "Altitude_m": 4427,
      "Temp_c": -12.1,
      "Dewpoint_c": -20.1,
      "Wind_Direction": 332,
      "Wind_Speed_kt": 3.7
    },
    {
      "Pressure_mb": 593.4,
      "Altitude_m": 4432,
      "Temp_c": -12.1,
      "Dewpoint_c": -20.1,
      "Wind_Direction": 333,
      "Wind_Speed_kt": 3.7
    },
    {
      "Pressure_mb": 593,
      "Altitude_m": 4437,
      "Temp_c": -12.1,
      "Dewpoint_c": -20.2,
      "Wind_Direction": 333,
      "Wind_Speed_kt": 3.7
    },
    {
      "Pressure_mb": 592.6,
      "Altitude_m": 4442,
      "Temp_c": -12.1,
      "Dewpoint_c": -20.2,
      "Wind_Direction": 333,
      "Wind_Speed_kt": 3.8
    },
    {
      "Pressure_mb": 592.2,
      "Altitude_m": 4447,
      "Temp_c": -12.2,
      "Dewpoint_c": -20.3,
      "Wind_Direction": 333,
      "Wind_Speed_kt": 3.8
    },
    {
      "Pressure_mb": 591.8,
      "Altitude_m": 4452,
      "Temp_c": -12.2,
      "Dewpoint_c": -20.4,
      "Wind_Direction": 333,
      "Wind_Speed_kt": 3.8
    },
    {
      "Pressure_mb": 591.4,
      "Altitude_m": 4457,
      "Temp_c": -12.2,
      "Dewpoint_c": -20.5,
      "Wind_Direction": 333,
      "Wind_Speed_kt": 3.8
    },
    {
      "Pressure_mb": 591,
      "Altitude_m": 4462,
      "Temp_c": -12.2,
      "Dewpoint_c": -20.6,
      "Wind_Direction": 333,
      "Wind_Speed_kt": 3.9
    },
    {
      "Pressure_mb": 590.7,
      "Altitude_m": 4467,
      "Temp_c": -12.2,
      "Dewpoint_c": -20.8,
      "Wind_Direction": 333,
      "Wind_Speed_kt": 3.9
    },
    {
      "Pressure_mb": 590.3,
      "Altitude_m": 4472,
      "Temp_c": -12.2,
      "Dewpoint_c": -20.9,
      "Wind_Direction": 333,
      "Wind_Speed_kt": 3.9
    },
    {
      "Pressure_mb": 589.9,
      "Altitude_m": 4477,
      "Temp_c": -12.3,
      "Dewpoint_c": -21,
      "Wind_Direction": 333,
      "Wind_Speed_kt": 4
    },
    {
      "Pressure_mb": 589.5,
      "Altitude_m": 4483,
      "Temp_c": -12.3,
      "Dewpoint_c": -21.1,
      "Wind_Direction": 333,
      "Wind_Speed_kt": 4
    },
    {
      "Pressure_mb": 589,
      "Altitude_m": 4488,
      "Temp_c": -12.3,
      "Dewpoint_c": -21.2,
      "Wind_Direction": 333,
      "Wind_Speed_kt": 4
    },
    {
      "Pressure_mb": 588.6,
      "Altitude_m": 4493,
      "Temp_c": -12.3,
      "Dewpoint_c": -21.3,
      "Wind_Direction": 333,
      "Wind_Speed_kt": 4
    },
    {
      "Pressure_mb": 588.2,
      "Altitude_m": 4499,
      "Temp_c": -12.3,
      "Dewpoint_c": -21.4,
      "Wind_Direction": 333,
      "Wind_Speed_kt": 4.1
    },
    {
      "Pressure_mb": 587.8,
      "Altitude_m": 4504,
      "Temp_c": -12.3,
      "Dewpoint_c": -21.5,
      "Wind_Direction": 333,
      "Wind_Speed_kt": 4.1
    },
    {
      "Pressure_mb": 587.4,
      "Altitude_m": 4510,
      "Temp_c": -12.4,
      "Dewpoint_c": -21.6,
      "Wind_Direction": 333,
      "Wind_Speed_kt": 4.1
    },
    {
      "Pressure_mb": 587,
      "Altitude_m": 4515,
      "Temp_c": -12.4,
      "Dewpoint_c": -21.7,
      "Wind_Direction": 333,
      "Wind_Speed_kt": 4.1
    },
    {
      "Pressure_mb": 586.5,
      "Altitude_m": 4521,
      "Temp_c": -12.4,
      "Dewpoint_c": -21.8,
      "Wind_Direction": 334,
      "Wind_Speed_kt": 4.2
    },
    {
      "Pressure_mb": 586.1,
      "Altitude_m": 4526,
      "Temp_c": -12.4,
      "Dewpoint_c": -21.9,
      "Wind_Direction": 334,
      "Wind_Speed_kt": 4.3
    },
    {
      "Pressure_mb": 585.7,
      "Altitude_m": 4531,
      "Temp_c": -12.4,
      "Dewpoint_c": -22,
      "Wind_Direction": 334,
      "Wind_Speed_kt": 4.4
    },
    {
      "Pressure_mb": 585.3,
      "Altitude_m": 4537,
      "Temp_c": -12.5,
      "Dewpoint_c": -22.1,
      "Wind_Direction": 334,
      "Wind_Speed_kt": 4.4
    },
    {
      "Pressure_mb": 584.9,
      "Altitude_m": 4542,
      "Temp_c": -12.5,
      "Dewpoint_c": -22.1,
      "Wind_Direction": 334,
      "Wind_Speed_kt": 4.5
    },
    {
      "Pressure_mb": 584.5,
      "Altitude_m": 4548,
      "Temp_c": -12.5,
      "Dewpoint_c": -22.2,
      "Wind_Direction": 335,
      "Wind_Speed_kt": 4.6
    },
    {
      "Pressure_mb": 584.1,
      "Altitude_m": 4553,
      "Temp_c": -12.5,
      "Dewpoint_c": -22.3,
      "Wind_Direction": 335,
      "Wind_Speed_kt": 4.6
    },
    {
      "Pressure_mb": 583.7,
      "Altitude_m": 4558,
      "Temp_c": -12.5,
      "Dewpoint_c": -22.4,
      "Wind_Direction": 335,
      "Wind_Speed_kt": 4.7
    },
    {
      "Pressure_mb": 583.2,
      "Altitude_m": 4564,
      "Temp_c": -12.6,
      "Dewpoint_c": -22.5,
      "Wind_Direction": 335,
      "Wind_Speed_kt": 4.8
    },
    {
      "Pressure_mb": 582.8,
      "Altitude_m": 4569,
      "Temp_c": -12.6,
      "Dewpoint_c": -22.6,
      "Wind_Direction": 335,
      "Wind_Speed_kt": 4.8
    },
    {
      "Pressure_mb": 582.4,
      "Altitude_m": 4574,
      "Temp_c": -12.6,
      "Dewpoint_c": -22.7,
      "Wind_Direction": 335,
      "Wind_Speed_kt": 4.9
    },
    {
      "Pressure_mb": 582,
      "Altitude_m": 4580,
      "Temp_c": -12.6,
      "Dewpoint_c": -22.8,
      "Wind_Direction": 336,
      "Wind_Speed_kt": 5
    },
    {
      "Pressure_mb": 581.6,
      "Altitude_m": 4585,
      "Temp_c": -12.7,
      "Dewpoint_c": -22.9,
      "Wind_Direction": 336,
      "Wind_Speed_kt": 5.1
    },
    {
      "Pressure_mb": 581.2,
      "Altitude_m": 4591,
      "Temp_c": -12.7,
      "Dewpoint_c": -22.9,
      "Wind_Direction": 336,
      "Wind_Speed_kt": 5.1
    },
    {
      "Pressure_mb": 580.8,
      "Altitude_m": 4596,
      "Temp_c": -12.7,
      "Dewpoint_c": -23,
      "Wind_Direction": 336,
      "Wind_Speed_kt": 5.2
    },
    {
      "Pressure_mb": 580.3,
      "Altitude_m": 4602,
      "Temp_c": -12.7,
      "Dewpoint_c": -23.1,
      "Wind_Direction": 336,
      "Wind_Speed_kt": 5.3
    },
    {
      "Pressure_mb": 579.9,
      "Altitude_m": 4607,
      "Temp_c": -12.8,
      "Dewpoint_c": -23.2,
      "Wind_Direction": 336,
      "Wind_Speed_kt": 5.3
    },
    {
      "Pressure_mb": 579.5,
      "Altitude_m": 4613,
      "Temp_c": -12.8,
      "Dewpoint_c": -23.3,
      "Wind_Direction": 337,
      "Wind_Speed_kt": 5.4
    },
    {
      "Pressure_mb": 579.2,
      "Altitude_m": 4618,
      "Temp_c": -12.8,
      "Dewpoint_c": -23.3,
      "Wind_Direction": 337,
      "Wind_Speed_kt": 5.5
    },
    {
      "Pressure_mb": 578.8,
      "Altitude_m": 4624,
      "Temp_c": -12.9,
      "Dewpoint_c": -23.4,
      "Wind_Direction": 337,
      "Wind_Speed_kt": 5.6
    },
    {
      "Pressure_mb": 578.4,
      "Altitude_m": 4629,
      "Temp_c": -12.9,
      "Dewpoint_c": -23.5,
      "Wind_Direction": 337,
      "Wind_Speed_kt": 5.6
    },
    {
      "Pressure_mb": 578,
      "Altitude_m": 4633,
      "Temp_c": -12.9,
      "Dewpoint_c": -23.6,
      "Wind_Direction": 337,
      "Wind_Speed_kt": 5.6
    },
    {
      "Pressure_mb": 577.7,
      "Altitude_m": 4637,
      "Temp_c": -12.9,
      "Dewpoint_c": -23.7,
      "Wind_Direction": 337,
      "Wind_Speed_kt": 5.7
    },
    {
      "Pressure_mb": 577.3,
      "Altitude_m": 4641,
      "Temp_c": -13,
      "Dewpoint_c": -23.7,
      "Wind_Direction": 337,
      "Wind_Speed_kt": 5.7
    },
    {
      "Pressure_mb": 577,
      "Altitude_m": 4645,
      "Temp_c": -13,
      "Dewpoint_c": -23.8,
      "Wind_Direction": 337,
      "Wind_Speed_kt": 5.7
    },
    {
      "Pressure_mb": 576.7,
      "Altitude_m": 4649,
      "Temp_c": -13,
      "Dewpoint_c": -23.9,
      "Wind_Direction": 337,
      "Wind_Speed_kt": 5.8
    },
    {
      "Pressure_mb": 576.4,
      "Altitude_m": 4653,
      "Temp_c": -13,
      "Dewpoint_c": -24.1,
      "Wind_Direction": 337,
      "Wind_Speed_kt": 5.8
    },
    {
      "Pressure_mb": 576.1,
      "Altitude_m": 4657,
      "Temp_c": -13.1,
      "Dewpoint_c": -24.2,
      "Wind_Direction": 337,
      "Wind_Speed_kt": 5.9
    },
    {
      "Pressure_mb": 575.8,
      "Altitude_m": 4661,
      "Temp_c": -13.1,
      "Dewpoint_c": -24.3,
      "Wind_Direction": 337,
      "Wind_Speed_kt": 5.9
    },
    {
      "Pressure_mb": 575.5,
      "Altitude_m": 4665,
      "Temp_c": -13.1,
      "Dewpoint_c": -24.5,
      "Wind_Direction": 337,
      "Wind_Speed_kt": 5.9
    },
    {
      "Pressure_mb": 575.2,
      "Altitude_m": 4669,
      "Temp_c": -13.1,
      "Dewpoint_c": -24.6,
      "Wind_Direction": 337,
      "Wind_Speed_kt": 6
    },
    {
      "Pressure_mb": 574.8,
      "Altitude_m": 4673,
      "Temp_c": -13.1,
      "Dewpoint_c": -24.7,
      "Wind_Direction": 337,
      "Wind_Speed_kt": 6
    },
    {
      "Pressure_mb": 574.5,
      "Altitude_m": 4678,
      "Temp_c": -13.2,
      "Dewpoint_c": -24.9,
      "Wind_Direction": 337,
      "Wind_Speed_kt": 6.1
    },
    {
      "Pressure_mb": 574.2,
      "Altitude_m": 4683,
      "Temp_c": -13.2,
      "Dewpoint_c": -25,
      "Wind_Direction": 337,
      "Wind_Speed_kt": 6.1
    },
    {
      "Pressure_mb": 573.8,
      "Altitude_m": 4688,
      "Temp_c": -13.2,
      "Dewpoint_c": -25.2,
      "Wind_Direction": 337,
      "Wind_Speed_kt": 6.1
    },
    {
      "Pressure_mb": 573.5,
      "Altitude_m": 4692,
      "Temp_c": -13.2,
      "Dewpoint_c": -25.3,
      "Wind_Direction": 337,
      "Wind_Speed_kt": 6.2
    },
    {
      "Pressure_mb": 573.2,
      "Altitude_m": 4697,
      "Temp_c": -13.2,
      "Dewpoint_c": -25.5,
      "Wind_Direction": 337,
      "Wind_Speed_kt": 6.2
    },
    {
      "Pressure_mb": 572.8,
      "Altitude_m": 4701,
      "Temp_c": -13.3,
      "Dewpoint_c": -25.6,
      "Wind_Direction": 337,
      "Wind_Speed_kt": 6.2
    },
    {
      "Pressure_mb": 572.5,
      "Altitude_m": 4706,
      "Temp_c": -13.3,
      "Dewpoint_c": -25.7,
      "Wind_Direction": 337,
      "Wind_Speed_kt": 6.3
    },
    {
      "Pressure_mb": 572.2,
      "Altitude_m": 4710,
      "Temp_c": -13.3,
      "Dewpoint_c": -25.9,
      "Wind_Direction": 337,
      "Wind_Speed_kt": 6.3
    },
    {
      "Pressure_mb": 571.8,
      "Altitude_m": 4714,
      "Temp_c": -13.3,
      "Dewpoint_c": -26.1,
      "Wind_Direction": 337,
      "Wind_Speed_kt": 6.4
    },
    {
      "Pressure_mb": 571.5,
      "Altitude_m": 4718,
      "Temp_c": -13.3,
      "Dewpoint_c": -26.4,
      "Wind_Direction": 337,
      "Wind_Speed_kt": 6.4
    },
    {
      "Pressure_mb": 571.2,
      "Altitude_m": 4722,
      "Temp_c": -13.3,
      "Dewpoint_c": -26.6,
      "Wind_Direction": 337,
      "Wind_Speed_kt": 6.5
    },
    {
      "Pressure_mb": 570.9,
      "Altitude_m": 4727,
      "Temp_c": -13.4,
      "Dewpoint_c": -26.8,
      "Wind_Direction": 337,
      "Wind_Speed_kt": 6.6
    },
    {
      "Pressure_mb": 570.6,
      "Altitude_m": 4731,
      "Temp_c": -13.4,
      "Dewpoint_c": -27,
      "Wind_Direction": 338,
      "Wind_Speed_kt": 6.6
    },
    {
      "Pressure_mb": 570.3,
      "Altitude_m": 4735,
      "Temp_c": -13.4,
      "Dewpoint_c": -27.2,
      "Wind_Direction": 338,
      "Wind_Speed_kt": 6.7
    },
    {
      "Pressure_mb": 569.9,
      "Altitude_m": 4739,
      "Temp_c": -13.4,
      "Dewpoint_c": -27.4,
      "Wind_Direction": 338,
      "Wind_Speed_kt": 6.7
    },
    {
      "Pressure_mb": 569.6,
      "Altitude_m": 4744,
      "Temp_c": -13.4,
      "Dewpoint_c": -27.7,
      "Wind_Direction": 338,
      "Wind_Speed_kt": 6.8
    },
    {
      "Pressure_mb": 569.4,
      "Altitude_m": 4748,
      "Temp_c": -13.4,
      "Dewpoint_c": -27.9,
      "Wind_Direction": 338,
      "Wind_Speed_kt": 6.9
    },
    {
      "Pressure_mb": 569.1,
      "Altitude_m": 4751,
      "Temp_c": -13.5,
      "Dewpoint_c": -28.2,
      "Wind_Direction": 338,
      "Wind_Speed_kt": 6.9
    },
    {
      "Pressure_mb": 568.8,
      "Altitude_m": 4755,
      "Temp_c": -13.5,
      "Dewpoint_c": -28.4,
      "Wind_Direction": 338,
      "Wind_Speed_kt": 7
    },
    {
      "Pressure_mb": 568.5,
      "Altitude_m": 4759,
      "Temp_c": -13.5,
      "Dewpoint_c": -28.7,
      "Wind_Direction": 338,
      "Wind_Speed_kt": 7
    },
    {
      "Pressure_mb": 568.2,
      "Altitude_m": 4763,
      "Temp_c": -13.5,
      "Dewpoint_c": -28.9,
      "Wind_Direction": 339,
      "Wind_Speed_kt": 7.1
    },
    {
      "Pressure_mb": 567.8,
      "Altitude_m": 4767,
      "Temp_c": -13.5,
      "Dewpoint_c": -29,
      "Wind_Direction": 339,
      "Wind_Speed_kt": 7.2
    },
    {
      "Pressure_mb": 567.5,
      "Altitude_m": 4772,
      "Temp_c": -13.6,
      "Dewpoint_c": -29.2,
      "Wind_Direction": 339,
      "Wind_Speed_kt": 7.2
    },
    {
      "Pressure_mb": 567.1,
      "Altitude_m": 4776,
      "Temp_c": -13.6,
      "Dewpoint_c": -29.4,
      "Wind_Direction": 339,
      "Wind_Speed_kt": 7.3
    },
    {
      "Pressure_mb": 566.8,
      "Altitude_m": 4781,
      "Temp_c": -13.6,
      "Dewpoint_c": -29.6,
      "Wind_Direction": 339,
      "Wind_Speed_kt": 7.3
    },
    {
      "Pressure_mb": 566.5,
      "Altitude_m": 4786,
      "Temp_c": -13.6,
      "Dewpoint_c": -29.7,
      "Wind_Direction": 339,
      "Wind_Speed_kt": 7.4
    },
    {
      "Pressure_mb": 566.1,
      "Altitude_m": 4790,
      "Temp_c": -13.7,
      "Dewpoint_c": -29.9,
      "Wind_Direction": 339,
      "Wind_Speed_kt": 7.5
    },
    {
      "Pressure_mb": 565.7,
      "Altitude_m": 4796,
      "Temp_c": -13.7,
      "Dewpoint_c": -30.1,
      "Wind_Direction": 339,
      "Wind_Speed_kt": 7.5
    },
    {
      "Pressure_mb": 565.3,
      "Altitude_m": 4802,
      "Temp_c": -13.7,
      "Dewpoint_c": -30.3,
      "Wind_Direction": 339,
      "Wind_Speed_kt": 7.5
    },
    {
      "Pressure_mb": 564.9,
      "Altitude_m": 4807,
      "Temp_c": -13.7,
      "Dewpoint_c": -30.5,
      "Wind_Direction": 339,
      "Wind_Speed_kt": 7.5
    },
    {
      "Pressure_mb": 564.5,
      "Altitude_m": 4813,
      "Temp_c": -13.8,
      "Dewpoint_c": -30.6,
      "Wind_Direction": 339,
      "Wind_Speed_kt": 7.4
    },
    {
      "Pressure_mb": 564.1,
      "Altitude_m": 4818,
      "Temp_c": -13.8,
      "Dewpoint_c": -30.8,
      "Wind_Direction": 339,
      "Wind_Speed_kt": 7.4
    },
    {
      "Pressure_mb": 563.6,
      "Altitude_m": 4824,
      "Temp_c": -13.8,
      "Dewpoint_c": -31,
      "Wind_Direction": 339,
      "Wind_Speed_kt": 7.4
    },
    {
      "Pressure_mb": 563.2,
      "Altitude_m": 4830,
      "Temp_c": -13.8,
      "Dewpoint_c": -31.2,
      "Wind_Direction": 339,
      "Wind_Speed_kt": 7.3
    },
    {
      "Pressure_mb": 562.8,
      "Altitude_m": 4835,
      "Temp_c": -13.9,
      "Dewpoint_c": -31.2,
      "Wind_Direction": 339,
      "Wind_Speed_kt": 7.3
    },
    {
      "Pressure_mb": 562.4,
      "Altitude_m": 4841,
      "Temp_c": -13.9,
      "Dewpoint_c": -31.1,
      "Wind_Direction": 339,
      "Wind_Speed_kt": 7.3
    },
    {
      "Pressure_mb": 562,
      "Altitude_m": 4847,
      "Temp_c": -13.9,
      "Dewpoint_c": -31.1,
      "Wind_Direction": 339,
      "Wind_Speed_kt": 7.3
    },
    {
      "Pressure_mb": 561.6,
      "Altitude_m": 4852,
      "Temp_c": -14,
      "Dewpoint_c": -31,
      "Wind_Direction": 339,
      "Wind_Speed_kt": 7.2
    },
    {
      "Pressure_mb": 561.1,
      "Altitude_m": 4857,
      "Temp_c": -14,
      "Dewpoint_c": -31,
      "Wind_Direction": 339,
      "Wind_Speed_kt": 7.2
    },
    {
      "Pressure_mb": 560.8,
      "Altitude_m": 4862,
      "Temp_c": -14,
      "Dewpoint_c": -30.9,
      "Wind_Direction": 339,
      "Wind_Speed_kt": 7.2
    },
    {
      "Pressure_mb": 560.5,
      "Altitude_m": 4866,
      "Temp_c": -14.1,
      "Dewpoint_c": -30.9,
      "Wind_Direction": 339,
      "Wind_Speed_kt": 7.1
    },
    {
      "Pressure_mb": 560.1,
      "Altitude_m": 4871,
      "Temp_c": -14.1,
      "Dewpoint_c": -30.8,
      "Wind_Direction": 339,
      "Wind_Speed_kt": 7.1
    },
    {
      "Pressure_mb": 559.8,
      "Altitude_m": 4875,
      "Temp_c": -14.1,
      "Dewpoint_c": -30.8,
      "Wind_Direction": 339,
      "Wind_Speed_kt": 7.1
    },
    {
      "Pressure_mb": 559.5,
      "Altitude_m": 4880,
      "Temp_c": -14.2,
      "Dewpoint_c": -30.8,
      "Wind_Direction": 339,
      "Wind_Speed_kt": 7.1
    },
    {
      "Pressure_mb": 559.1,
      "Altitude_m": 4885,
      "Temp_c": -14.2,
      "Dewpoint_c": -30.7,
      "Wind_Direction": 339,
      "Wind_Speed_kt": 7
    },
    {
      "Pressure_mb": 558.7,
      "Altitude_m": 4890,
      "Temp_c": -14.2,
      "Dewpoint_c": -30.7,
      "Wind_Direction": 339,
      "Wind_Speed_kt": 7
    },
    {
      "Pressure_mb": 558.3,
      "Altitude_m": 4895,
      "Temp_c": -14.3,
      "Dewpoint_c": -30.6,
      "Wind_Direction": 339,
      "Wind_Speed_kt": 7
    },
    {
      "Pressure_mb": 558,
      "Altitude_m": 4900,
      "Temp_c": -14.3,
      "Dewpoint_c": -30.6,
      "Wind_Direction": 339,
      "Wind_Speed_kt": 6.9
    },
    {
      "Pressure_mb": 557.6,
      "Altitude_m": 4905,
      "Temp_c": -14.3,
      "Dewpoint_c": -30.5,
      "Wind_Direction": 339,
      "Wind_Speed_kt": 6.9
    },
    {
      "Pressure_mb": 557.2,
      "Altitude_m": 4910,
      "Temp_c": -14.4,
      "Dewpoint_c": -30.4,
      "Wind_Direction": 339,
      "Wind_Speed_kt": 6.9
    },
    {
      "Pressure_mb": 556.8,
      "Altitude_m": 4917,
      "Temp_c": -14.4,
      "Dewpoint_c": -30.3,
      "Wind_Direction": 340,
      "Wind_Speed_kt": 6.9
    },
    {
      "Pressure_mb": 556.3,
      "Altitude_m": 4923,
      "Temp_c": -14.5,
      "Dewpoint_c": -30.2,
      "Wind_Direction": 340,
      "Wind_Speed_kt": 6.9
    },
    {
      "Pressure_mb": 555.9,
      "Altitude_m": 4929,
      "Temp_c": -14.5,
      "Dewpoint_c": -30.1,
      "Wind_Direction": 340,
      "Wind_Speed_kt": 6.8
    },
    {
      "Pressure_mb": 555.5,
      "Altitude_m": 4936,
      "Temp_c": -14.6,
      "Dewpoint_c": -30,
      "Wind_Direction": 340,
      "Wind_Speed_kt": 6.8
    },
    {
      "Pressure_mb": 555,
      "Altitude_m": 4942,
      "Temp_c": -14.6,
      "Dewpoint_c": -29.9,
      "Wind_Direction": 340,
      "Wind_Speed_kt": 6.8
    },
    {
      "Pressure_mb": 554.6,
      "Altitude_m": 4948,
      "Temp_c": -14.6,
      "Dewpoint_c": -29.8,
      "Wind_Direction": 340,
      "Wind_Speed_kt": 6.8
    },
    {
      "Pressure_mb": 554.1,
      "Altitude_m": 4953,
      "Temp_c": -14.7,
      "Dewpoint_c": -29.7,
      "Wind_Direction": 340,
      "Wind_Speed_kt": 6.8
    },
    {
      "Pressure_mb": 553.8,
      "Altitude_m": 4958,
      "Temp_c": -14.7,
      "Dewpoint_c": -29.6,
      "Wind_Direction": 340,
      "Wind_Speed_kt": 6.7
    },
    {
      "Pressure_mb": 553.4,
      "Altitude_m": 4963,
      "Temp_c": -14.8,
      "Dewpoint_c": -29.5,
      "Wind_Direction": 340,
      "Wind_Speed_kt": 6.7
    },
    {
      "Pressure_mb": 553.1,
      "Altitude_m": 4968,
      "Temp_c": -14.8,
      "Dewpoint_c": -29.5,
      "Wind_Direction": 340,
      "Wind_Speed_kt": 6.7
    },
    {
      "Pressure_mb": 552.8,
      "Altitude_m": 4973,
      "Temp_c": -14.9,
      "Dewpoint_c": -29.4,
      "Wind_Direction": 340,
      "Wind_Speed_kt": 6.7
    },
    {
      "Pressure_mb": 552.4,
      "Altitude_m": 4977,
      "Temp_c": -14.9,
      "Dewpoint_c": -29.4,
      "Wind_Direction": 340,
      "Wind_Speed_kt": 6.7
    },
    {
      "Pressure_mb": 552.1,
      "Altitude_m": 4981,
      "Temp_c": -14.9,
      "Dewpoint_c": -29.4,
      "Wind_Direction": 340,
      "Wind_Speed_kt": 6.6
    },
    {
      "Pressure_mb": 551.8,
      "Altitude_m": 4984,
      "Temp_c": -15,
      "Dewpoint_c": -29.4,
      "Wind_Direction": 340,
      "Wind_Speed_kt": 6.6
    },
    {
      "Pressure_mb": 551.5,
      "Altitude_m": 4988,
      "Temp_c": -15,
      "Dewpoint_c": -29.4,
      "Wind_Direction": 340,
      "Wind_Speed_kt": 6.6
    },
    {
      "Pressure_mb": 551.2,
      "Altitude_m": 4992,
      "Temp_c": -15,
      "Dewpoint_c": -29.4,
      "Wind_Direction": 340,
      "Wind_Speed_kt": 6.6
    },
    {
      "Pressure_mb": 550.9,
      "Altitude_m": 4996,
      "Temp_c": -15.1,
      "Dewpoint_c": -29.4,
      "Wind_Direction": 340,
      "Wind_Speed_kt": 6.6
    },
    {
      "Pressure_mb": 550.7,
      "Altitude_m": 5000,
      "Temp_c": -15.1,
      "Dewpoint_c": -29.4,
      "Wind_Direction": 340,
      "Wind_Speed_kt": 6.5
    },
    {
      "Pressure_mb": 550.4,
      "Altitude_m": 5004,
      "Temp_c": -15.1,
      "Dewpoint_c": -29.4,
      "Wind_Direction": 340,
      "Wind_Speed_kt": 6.6
    },
    {
      "Pressure_mb": 550.1,
      "Altitude_m": 5008,
      "Temp_c": -15.2,
      "Dewpoint_c": -29.4,
      "Wind_Direction": 341,
      "Wind_Speed_kt": 6.6
    },
    {
      "Pressure_mb": 549.7,
      "Altitude_m": 5012,
      "Temp_c": -15.2,
      "Dewpoint_c": -29.4,
      "Wind_Direction": 341,
      "Wind_Speed_kt": 6.7
    },
    {
      "Pressure_mb": 549.4,
      "Altitude_m": 5016,
      "Temp_c": -15.2,
      "Dewpoint_c": -29.4,
      "Wind_Direction": 341,
      "Wind_Speed_kt": 6.7
    },
    {
      "Pressure_mb": 549.1,
      "Altitude_m": 5021,
      "Temp_c": -15.3,
      "Dewpoint_c": -29.4,
      "Wind_Direction": 341,
      "Wind_Speed_kt": 6.7
    },
    {
      "Pressure_mb": 548.7,
      "Altitude_m": 5027,
      "Temp_c": -15.3,
      "Dewpoint_c": -29.5,
      "Wind_Direction": 341,
      "Wind_Speed_kt": 6.8
    },
    {
      "Pressure_mb": 548.5,
      "Altitude_m": 5030,
      "Temp_c": -15.3,
      "Dewpoint_c": -29.5,
      "Wind_Direction": 341,
      "Wind_Speed_kt": 6.8
    },
    {
      "Pressure_mb": 548.2,
      "Altitude_m": 5034,
      "Temp_c": -15.4,
      "Dewpoint_c": -29.5,
      "Wind_Direction": 341,
      "Wind_Speed_kt": 6.9
    },
    {
      "Pressure_mb": 547.9,
      "Altitude_m": 5039,
      "Temp_c": -15.4,
      "Dewpoint_c": -29.6,
      "Wind_Direction": 341,
      "Wind_Speed_kt": 6.9
    },
    {
      "Pressure_mb": 547.6,
      "Altitude_m": 5044,
      "Temp_c": -15.5,
      "Dewpoint_c": -29.6,
      "Wind_Direction": 341,
      "Wind_Speed_kt": 6.9
    },
    {
      "Pressure_mb": 547.3,
      "Altitude_m": 5048,
      "Temp_c": -15.5,
      "Dewpoint_c": -29.7,
      "Wind_Direction": 342,
      "Wind_Speed_kt": 7
    },
    {
      "Pressure_mb": 547,
      "Altitude_m": 5052,
      "Temp_c": -15.5,
      "Dewpoint_c": -29.7,
      "Wind_Direction": 342,
      "Wind_Speed_kt": 7
    },
    {
      "Pressure_mb": 546.7,
      "Altitude_m": 5055,
      "Temp_c": -15.6,
      "Dewpoint_c": -29.8,
      "Wind_Direction": 342,
      "Wind_Speed_kt": 7
    },
    {
      "Pressure_mb": 546.4,
      "Altitude_m": 5059,
      "Temp_c": -15.6,
      "Dewpoint_c": -29.8,
      "Wind_Direction": 342,
      "Wind_Speed_kt": 7.1
    },
    {
      "Pressure_mb": 546.1,
      "Altitude_m": 5063,
      "Temp_c": -15.6,
      "Dewpoint_c": -29.8,
      "Wind_Direction": 342,
      "Wind_Speed_kt": 7.1
    },
    {
      "Pressure_mb": 545.8,
      "Altitude_m": 5067,
      "Temp_c": -15.7,
      "Dewpoint_c": -29.9,
      "Wind_Direction": 342,
      "Wind_Speed_kt": 7.2
    },
    {
      "Pressure_mb": 545.5,
      "Altitude_m": 5071,
      "Temp_c": -15.7,
      "Dewpoint_c": -29.9,
      "Wind_Direction": 342,
      "Wind_Speed_kt": 7.2
    },
    {
      "Pressure_mb": 545.2,
      "Altitude_m": 5075,
      "Temp_c": -15.7,
      "Dewpoint_c": -30,
      "Wind_Direction": 342,
      "Wind_Speed_kt": 7.2
    },
    {
      "Pressure_mb": 544.9,
      "Altitude_m": 5079,
      "Temp_c": -15.8,
      "Dewpoint_c": -30,
      "Wind_Direction": 342,
      "Wind_Speed_kt": 7.3
    },
    {
      "Pressure_mb": 544.6,
      "Altitude_m": 5083,
      "Temp_c": -15.8,
      "Dewpoint_c": -30.1,
      "Wind_Direction": 343,
      "Wind_Speed_kt": 7.3
    },
    {
      "Pressure_mb": 544.2,
      "Altitude_m": 5087,
      "Temp_c": -15.8,
      "Dewpoint_c": -30.2,
      "Wind_Direction": 342,
      "Wind_Speed_kt": 7.3
    },
    {
      "Pressure_mb": 543.8,
      "Altitude_m": 5093,
      "Temp_c": -15.9,
      "Dewpoint_c": -30.3,
      "Wind_Direction": 342,
      "Wind_Speed_kt": 7.3
    },
    {
      "Pressure_mb": 543.4,
      "Altitude_m": 5099,
      "Temp_c": -15.9,
      "Dewpoint_c": -30.3,
      "Wind_Direction": 342,
      "Wind_Speed_kt": 7.3
    },
    {
      "Pressure_mb": 543,
      "Altitude_m": 5105,
      "Temp_c": -16,
      "Dewpoint_c": -30.4,
      "Wind_Direction": 342,
      "Wind_Speed_kt": 7.3
    },
    {
      "Pressure_mb": 542.6,
      "Altitude_m": 5111,
      "Temp_c": -16,
      "Dewpoint_c": -30.5,
      "Wind_Direction": 342,
      "Wind_Speed_kt": 7.2
    },
    {
      "Pressure_mb": 542.2,
      "Altitude_m": 5117,
      "Temp_c": -16,
      "Dewpoint_c": -30.6,
      "Wind_Direction": 342,
      "Wind_Speed_kt": 7.2
    },
    {
      "Pressure_mb": 541.8,
      "Altitude_m": 5123,
      "Temp_c": -16.1,
      "Dewpoint_c": -30.7,
      "Wind_Direction": 342,
      "Wind_Speed_kt": 7.2
    },
    {
      "Pressure_mb": 541.4,
      "Altitude_m": 5129,
      "Temp_c": -16.1,
      "Dewpoint_c": -30.8,
      "Wind_Direction": 342,
      "Wind_Speed_kt": 7.2
    },
    {
      "Pressure_mb": 540.9,
      "Altitude_m": 5135,
      "Temp_c": -16.1,
      "Dewpoint_c": -30.9,
      "Wind_Direction": 342,
      "Wind_Speed_kt": 7.2
    },
    {
      "Pressure_mb": 540.5,
      "Altitude_m": 5140,
      "Temp_c": -16.2,
      "Dewpoint_c": -31,
      "Wind_Direction": 342,
      "Wind_Speed_kt": 7.2
    },
    {
      "Pressure_mb": 540.1,
      "Altitude_m": 5146,
      "Temp_c": -16.2,
      "Dewpoint_c": -31.1,
      "Wind_Direction": 341,
      "Wind_Speed_kt": 7.2
    },
    {
      "Pressure_mb": 539.7,
      "Altitude_m": 5152,
      "Temp_c": -16.3,
      "Dewpoint_c": -31.2,
      "Wind_Direction": 341,
      "Wind_Speed_kt": 7.2
    },
    {
      "Pressure_mb": 539.3,
      "Altitude_m": 5158,
      "Temp_c": -16.3,
      "Dewpoint_c": -31.3,
      "Wind_Direction": 341,
      "Wind_Speed_kt": 7.2
    },
    {
      "Pressure_mb": 538.9,
      "Altitude_m": 5163,
      "Temp_c": -16.3,
      "Dewpoint_c": -31.4,
      "Wind_Direction": 341,
      "Wind_Speed_kt": 7.1
    },
    {
      "Pressure_mb": 538.5,
      "Altitude_m": 5169,
      "Temp_c": -16.4,
      "Dewpoint_c": -31.5,
      "Wind_Direction": 341,
      "Wind_Speed_kt": 7.1
    },
    {
      "Pressure_mb": 538.1,
      "Altitude_m": 5175,
      "Temp_c": -16.4,
      "Dewpoint_c": -31.6,
      "Wind_Direction": 341,
      "Wind_Speed_kt": 7.1
    },
    {
      "Pressure_mb": 537.7,
      "Altitude_m": 5180,
      "Temp_c": -16.4,
      "Dewpoint_c": -31.7,
      "Wind_Direction": 341,
      "Wind_Speed_kt": 7.1
    },
    {
      "Pressure_mb": 537.3,
      "Altitude_m": 5186,
      "Temp_c": -16.4,
      "Dewpoint_c": -31.9,
      "Wind_Direction": 341,
      "Wind_Speed_kt": 7.1
    },
    {
      "Pressure_mb": 536.9,
      "Altitude_m": 5191,
      "Temp_c": -16.5,
      "Dewpoint_c": -32,
      "Wind_Direction": 341,
      "Wind_Speed_kt": 7.1
    },
    {
      "Pressure_mb": 536.5,
      "Altitude_m": 5197,
      "Temp_c": -16.5,
      "Dewpoint_c": -32.1,
      "Wind_Direction": 341,
      "Wind_Speed_kt": 7.1
    },
    {
      "Pressure_mb": 536.1,
      "Altitude_m": 5202,
      "Temp_c": -16.5,
      "Dewpoint_c": -32.2,
      "Wind_Direction": 341,
      "Wind_Speed_kt": 7.2
    },
    {
      "Pressure_mb": 535.7,
      "Altitude_m": 5208,
      "Temp_c": -16.6,
      "Dewpoint_c": -32.4,
      "Wind_Direction": 340,
      "Wind_Speed_kt": 7.2
    },
    {
      "Pressure_mb": 535.3,
      "Altitude_m": 5213,
      "Temp_c": -16.6,
      "Dewpoint_c": -32.5,
      "Wind_Direction": 340,
      "Wind_Speed_kt": 7.3
    },
    {
      "Pressure_mb": 534.9,
      "Altitude_m": 5218,
      "Temp_c": -16.6,
      "Dewpoint_c": -32.6,
      "Wind_Direction": 340,
      "Wind_Speed_kt": 7.4
    },
    {
      "Pressure_mb": 534.5,
      "Altitude_m": 5224,
      "Temp_c": -16.7,
      "Dewpoint_c": -32.8,
      "Wind_Direction": 340,
      "Wind_Speed_kt": 7.5
    },
    {
      "Pressure_mb": 534.1,
      "Altitude_m": 5230,
      "Temp_c": -16.7,
      "Dewpoint_c": -32.9,
      "Wind_Direction": 340,
      "Wind_Speed_kt": 7.6
    },
    {
      "Pressure_mb": 533.7,
      "Altitude_m": 5236,
      "Temp_c": -16.7,
      "Dewpoint_c": -33,
      "Wind_Direction": 340,
      "Wind_Speed_kt": 7.7
    },
    {
      "Pressure_mb": 533.3,
      "Altitude_m": 5242,
      "Temp_c": -16.7,
      "Dewpoint_c": -33.3,
      "Wind_Direction": 340,
      "Wind_Speed_kt": 7.7
    },
    {
      "Pressure_mb": 532.9,
      "Altitude_m": 5247,
      "Temp_c": -16.7,
      "Dewpoint_c": -33.5,
      "Wind_Direction": 340,
      "Wind_Speed_kt": 7.8
    },
    {
      "Pressure_mb": 532.5,
      "Altitude_m": 5253,
      "Temp_c": -16.7,
      "Dewpoint_c": -33.8,
      "Wind_Direction": 340,
      "Wind_Speed_kt": 7.9
    },
    {
      "Pressure_mb": 532,
      "Altitude_m": 5259,
      "Temp_c": -16.7,
      "Dewpoint_c": -34,
      "Wind_Direction": 340,
      "Wind_Speed_kt": 8
    },
    {
      "Pressure_mb": 531.6,
      "Altitude_m": 5265,
      "Temp_c": -16.8,
      "Dewpoint_c": -34.3,
      "Wind_Direction": 340,
      "Wind_Speed_kt": 8.1
    },
    {
      "Pressure_mb": 531.2,
      "Altitude_m": 5271,
      "Temp_c": -16.8,
      "Dewpoint_c": -34.5,
      "Wind_Direction": 339,
      "Wind_Speed_kt": 8.2
    },
    {
      "Pressure_mb": 530.8,
      "Altitude_m": 5277,
      "Temp_c": -16.8,
      "Dewpoint_c": -34.8,
      "Wind_Direction": 339,
      "Wind_Speed_kt": 8.2
    },
    {
      "Pressure_mb": 530.3,
      "Altitude_m": 5283,
      "Temp_c": -16.8,
      "Dewpoint_c": -35.1,
      "Wind_Direction": 339,
      "Wind_Speed_kt": 8.3
    },
    {
      "Pressure_mb": 529.9,
      "Altitude_m": 5290,
      "Temp_c": -16.8,
      "Dewpoint_c": -35.4,
      "Wind_Direction": 339,
      "Wind_Speed_kt": 8.4
    },
    {
      "Pressure_mb": 529.5,
      "Altitude_m": 5296,
      "Temp_c": -16.8,
      "Dewpoint_c": -35.7,
      "Wind_Direction": 339,
      "Wind_Speed_kt": 8.5
    },
    {
      "Pressure_mb": 529,
      "Altitude_m": 5302,
      "Temp_c": -16.8,
      "Dewpoint_c": -36,
      "Wind_Direction": 339,
      "Wind_Speed_kt": 8.6
    },
    {
      "Pressure_mb": 528.6,
      "Altitude_m": 5308,
      "Temp_c": -16.8,
      "Dewpoint_c": -36.3,
      "Wind_Direction": 339,
      "Wind_Speed_kt": 8.7
    },
    {
      "Pressure_mb": 528.1,
      "Altitude_m": 5314,
      "Temp_c": -16.8,
      "Dewpoint_c": -36.6,
      "Wind_Direction": 339,
      "Wind_Speed_kt": 8.7
    },
    {
      "Pressure_mb": 527.7,
      "Altitude_m": 5321,
      "Temp_c": -16.8,
      "Dewpoint_c": -36.8,
      "Wind_Direction": 339,
      "Wind_Speed_kt": 8.9
    },
    {
      "Pressure_mb": 527.3,
      "Altitude_m": 5326,
      "Temp_c": -16.8,
      "Dewpoint_c": -37,
      "Wind_Direction": 339,
      "Wind_Speed_kt": 9
    },
    {
      "Pressure_mb": 526.9,
      "Altitude_m": 5332,
      "Temp_c": -16.8,
      "Dewpoint_c": -37.2,
      "Wind_Direction": 339,
      "Wind_Speed_kt": 9.1
    },
    {
      "Pressure_mb": 526.5,
      "Altitude_m": 5337,
      "Temp_c": -16.8,
      "Dewpoint_c": -37.4,
      "Wind_Direction": 339,
      "Wind_Speed_kt": 9.2
    },
    {
      "Pressure_mb": 526.2,
      "Altitude_m": 5343,
      "Temp_c": -16.8,
      "Dewpoint_c": -37.6,
      "Wind_Direction": 339,
      "Wind_Speed_kt": 9.3
    },
    {
      "Pressure_mb": 525.8,
      "Altitude_m": 5348,
      "Temp_c": -16.8,
      "Dewpoint_c": -37.8,
      "Wind_Direction": 339,
      "Wind_Speed_kt": 9.4
    },
    {
      "Pressure_mb": 525.4,
      "Altitude_m": 5354,
      "Temp_c": -16.8,
      "Dewpoint_c": -38,
      "Wind_Direction": 339,
      "Wind_Speed_kt": 9.5
    },
    {
      "Pressure_mb": 525,
      "Altitude_m": 5359,
      "Temp_c": -16.8,
      "Dewpoint_c": -38.3,
      "Wind_Direction": 339,
      "Wind_Speed_kt": 9.6
    },
    {
      "Pressure_mb": 524.6,
      "Altitude_m": 5365,
      "Temp_c": -16.8,
      "Dewpoint_c": -38.5,
      "Wind_Direction": 339,
      "Wind_Speed_kt": 9.7
    },
    {
      "Pressure_mb": 524.3,
      "Altitude_m": 5370,
      "Temp_c": -16.8,
      "Dewpoint_c": -38.7,
      "Wind_Direction": 339,
      "Wind_Speed_kt": 9.8
    },
    {
      "Pressure_mb": 523.9,
      "Altitude_m": 5375,
      "Temp_c": -16.8,
      "Dewpoint_c": -39,
      "Wind_Direction": 339,
      "Wind_Speed_kt": 0
    },
    {
      "Pressure_mb": 523.5,
      "Altitude_m": 5381,
      "Temp_c": -16.8,
      "Dewpoint_c": -39.2,
      "Wind_Direction": 339,
      "Wind_Speed_kt": 0.1
    },
    {
      "Pressure_mb": 523.1,
      "Altitude_m": 5386,
      "Temp_c": -16.8,
      "Dewpoint_c": -39.4,
      "Wind_Direction": 339,
      "Wind_Speed_kt": 0.2
    },
    {
      "Pressure_mb": 522.9,
      "Altitude_m": 5389,
      "Temp_c": -16.8,
      "Dewpoint_c": -39.6,
      "Wind_Direction": 339,
      "Wind_Speed_kt": 0.2
    },
    {
      "Pressure_mb": 522.4,
      "Altitude_m": 5396,
      "Temp_c": -16.9,
      "Dewpoint_c": -38.8,
      "Wind_Direction": 339,
      "Wind_Speed_kt": 0.4
    },
    {
      "Pressure_mb": 522,
      "Altitude_m": 5401,
      "Temp_c": -16.9,
      "Dewpoint_c": -38.3,
      "Wind_Direction": 339,
      "Wind_Speed_kt": 0.5
    },
    {
      "Pressure_mb": 521.7,
      "Altitude_m": 5406,
      "Temp_c": -16.9,
      "Dewpoint_c": -37.8,
      "Wind_Direction": 339,
      "Wind_Speed_kt": 0.6
    },
    {
      "Pressure_mb": 521.3,
      "Altitude_m": 5412,
      "Temp_c": -16.9,
      "Dewpoint_c": -37.3,
      "Wind_Direction": 339,
      "Wind_Speed_kt": 0.7
    },
    {
      "Pressure_mb": 520.9,
      "Altitude_m": 5418,
      "Temp_c": -16.9,
      "Dewpoint_c": -36.8,
      "Wind_Direction": 339,
      "Wind_Speed_kt": 0.8
    },
    {
      "Pressure_mb": 520.5,
      "Altitude_m": 5423,
      "Temp_c": -16.9,
      "Dewpoint_c": -36.4,
      "Wind_Direction": 339,
      "Wind_Speed_kt": 1
    },
    {
      "Pressure_mb": 520.1,
      "Altitude_m": 5429,
      "Temp_c": -17,
      "Dewpoint_c": -36,
      "Wind_Direction": 340,
      "Wind_Speed_kt": 1
    },
    {
      "Pressure_mb": 519.7,
      "Altitude_m": 5435,
      "Temp_c": -17,
      "Dewpoint_c": -35.6,
      "Wind_Direction": 340,
      "Wind_Speed_kt": 1.1
    },
    {
      "Pressure_mb": 519.2,
      "Altitude_m": 5441,
      "Temp_c": -17,
      "Dewpoint_c": -35.2,
      "Wind_Direction": 340,
      "Wind_Speed_kt": 1.2
    },
    {
      "Pressure_mb": 518.8,
      "Altitude_m": 5448,
      "Temp_c": -17,
      "Dewpoint_c": -34.8,
      "Wind_Direction": 341,
      "Wind_Speed_kt": 1.3
    },
    {
      "Pressure_mb": 518.4,
      "Altitude_m": 5454,
      "Temp_c": -17,
      "Dewpoint_c": -34.5,
      "Wind_Direction": 341,
      "Wind_Speed_kt": 1.4
    },
    {
      "Pressure_mb": 518,
      "Altitude_m": 5460,
      "Temp_c": -17,
      "Dewpoint_c": -34.2,
      "Wind_Direction": 342,
      "Wind_Speed_kt": 1.5
    },
    {
      "Pressure_mb": 517.5,
      "Altitude_m": 5467,
      "Temp_c": -17.1,
      "Dewpoint_c": -33.7,
      "Wind_Direction": 342,
      "Wind_Speed_kt": 1.6
    },
    {
      "Pressure_mb": 517.1,
      "Altitude_m": 5473,
      "Temp_c": -17.1,
      "Dewpoint_c": -33.1,
      "Wind_Direction": 342,
      "Wind_Speed_kt": 1.7
    },
    {
      "Pressure_mb": 516.6,
      "Altitude_m": 5480,
      "Temp_c": -17.1,
      "Dewpoint_c": -32.5,
      "Wind_Direction": 343,
      "Wind_Speed_kt": 1.8
    },
    {
      "Pressure_mb": 516.2,
      "Altitude_m": 5486,
      "Temp_c": -17.2,
      "Dewpoint_c": -32,
      "Wind_Direction": 343,
      "Wind_Speed_kt": 1.9
    },
    {
      "Pressure_mb": 515.8,
      "Altitude_m": 5492,
      "Temp_c": -17.2,
      "Dewpoint_c": -31.5,
      "Wind_Direction": 343,
      "Wind_Speed_kt": 2
    },
    {
      "Pressure_mb": 515.4,
      "Altitude_m": 5499,
      "Temp_c": -17.2,
      "Dewpoint_c": -31.1,
      "Wind_Direction": 344,
      "Wind_Speed_kt": 2.1
    },
    {
      "Pressure_mb": 515,
      "Altitude_m": 5505,
      "Temp_c": -17.3,
      "Dewpoint_c": -30.6,
      "Wind_Direction": 344,
      "Wind_Speed_kt": 2.2
    },
    {
      "Pressure_mb": 514.6,
      "Altitude_m": 5512,
      "Temp_c": -17.3,
      "Dewpoint_c": -30.2,
      "Wind_Direction": 344,
      "Wind_Speed_kt": 2.3
    },
    {
      "Pressure_mb": 514.2,
      "Altitude_m": 5517,
      "Temp_c": -17.3,
      "Dewpoint_c": -29.8,
      "Wind_Direction": 345,
      "Wind_Speed_kt": 2.4
    },
    {
      "Pressure_mb": 513.8,
      "Altitude_m": 5522,
      "Temp_c": -17.4,
      "Dewpoint_c": -29.4,
      "Wind_Direction": 345,
      "Wind_Speed_kt": 2.5
    },
    {
      "Pressure_mb": 513.4,
      "Altitude_m": 5527,
      "Temp_c": -17.4,
      "Dewpoint_c": -29,
      "Wind_Direction": 345,
      "Wind_Speed_kt": 2.6
    },
    {
      "Pressure_mb": 513,
      "Altitude_m": 5533,
      "Temp_c": -17.4,
      "Dewpoint_c": -28.6,
      "Wind_Direction": 346,
      "Wind_Speed_kt": 2.8
    },
    {
      "Pressure_mb": 512.6,
      "Altitude_m": 5538,
      "Temp_c": -17.5,
      "Dewpoint_c": -28.3,
      "Wind_Direction": 346,
      "Wind_Speed_kt": 2.9
    },
    {
      "Pressure_mb": 512.2,
      "Altitude_m": 5543,
      "Temp_c": -17.5,
      "Dewpoint_c": -28,
      "Wind_Direction": 346,
      "Wind_Speed_kt": 3
    },
    {
      "Pressure_mb": 511.8,
      "Altitude_m": 5549,
      "Temp_c": -17.5,
      "Dewpoint_c": -27.7,
      "Wind_Direction": 346,
      "Wind_Speed_kt": 3.1
    },
    {
      "Pressure_mb": 511.4,
      "Altitude_m": 5556,
      "Temp_c": -17.6,
      "Dewpoint_c": -27.6,
      "Wind_Direction": 346,
      "Wind_Speed_kt": 3.2
    },
    {
      "Pressure_mb": 511,
      "Altitude_m": 5562,
      "Temp_c": -17.6,
      "Dewpoint_c": -27.5,
      "Wind_Direction": 346,
      "Wind_Speed_kt": 3.3
    },
    {
      "Pressure_mb": 510.6,
      "Altitude_m": 5568,
      "Temp_c": -17.7,
      "Dewpoint_c": -27.4,
      "Wind_Direction": 346,
      "Wind_Speed_kt": 3.3
    },
    {
      "Pressure_mb": 510.3,
      "Altitude_m": 5573,
      "Temp_c": -17.7,
      "Dewpoint_c": -27.3,
      "Wind_Direction": 346,
      "Wind_Speed_kt": 3.4
    },
    {
      "Pressure_mb": 509.9,
      "Altitude_m": 5578,
      "Temp_c": -17.7,
      "Dewpoint_c": -27.2,
      "Wind_Direction": 346,
      "Wind_Speed_kt": 3.5
    },
    {
      "Pressure_mb": 509.6,
      "Altitude_m": 5583,
      "Temp_c": -17.8,
      "Dewpoint_c": -27.1,
      "Wind_Direction": 347,
      "Wind_Speed_kt": 3.6
    },
    {
      "Pressure_mb": 509.2,
      "Altitude_m": 5588,
      "Temp_c": -17.8,
      "Dewpoint_c": -27,
      "Wind_Direction": 347,
      "Wind_Speed_kt": 3.7
    },
    {
      "Pressure_mb": 508.8,
      "Altitude_m": 5594,
      "Temp_c": -17.9,
      "Dewpoint_c": -26.9,
      "Wind_Direction": 347,
      "Wind_Speed_kt": 3.8
    },
    {
      "Pressure_mb": 508.5,
      "Altitude_m": 5599,
      "Temp_c": -17.9,
      "Dewpoint_c": -26.8,
      "Wind_Direction": 347,
      "Wind_Speed_kt": 3.9
    },
    {
      "Pressure_mb": 508.1,
      "Altitude_m": 5604,
      "Temp_c": -17.9,
      "Dewpoint_c": -26.7,
      "Wind_Direction": 347,
      "Wind_Speed_kt": 4
    },
    {
      "Pressure_mb": 507.7,
      "Altitude_m": 5610,
      "Temp_c": -18,
      "Dewpoint_c": -26.7,
      "Wind_Direction": 347,
      "Wind_Speed_kt": 4.1
    },
    {
      "Pressure_mb": 507.3,
      "Altitude_m": 5615,
      "Temp_c": -18,
      "Dewpoint_c": -26.6,
      "Wind_Direction": 347,
      "Wind_Speed_kt": 4.2
    },
    {
      "Pressure_mb": 507,
      "Altitude_m": 5621,
      "Temp_c": -18.1,
      "Dewpoint_c": -26.5,
      "Wind_Direction": 347,
      "Wind_Speed_kt": 4.3
    },
    {
      "Pressure_mb": 506.6,
      "Altitude_m": 5626,
      "Temp_c": -18.1,
      "Dewpoint_c": -26.5,
      "Wind_Direction": 347,
      "Wind_Speed_kt": 4.4
    },
    {
      "Pressure_mb": 506.3,
      "Altitude_m": 5632,
      "Temp_c": -18.1,
      "Dewpoint_c": -26.5,
      "Wind_Direction": 347,
      "Wind_Speed_kt": 4.5
    },
    {
      "Pressure_mb": 506,
      "Altitude_m": 5637,
      "Temp_c": -18.1,
      "Dewpoint_c": -26.5,
      "Wind_Direction": 347,
      "Wind_Speed_kt": 4.6
    },
    {
      "Pressure_mb": 505.6,
      "Altitude_m": 5641,
      "Temp_c": -18.2,
      "Dewpoint_c": -26.5,
      "Wind_Direction": 347,
      "Wind_Speed_kt": 4.7
    },
    {
      "Pressure_mb": 505.3,
      "Altitude_m": 5646,
      "Temp_c": -18.2,
      "Dewpoint_c": -26.5,
      "Wind_Direction": 347,
      "Wind_Speed_kt": 4.8
    },
    {
      "Pressure_mb": 505,
      "Altitude_m": 5650,
      "Temp_c": -18.2,
      "Dewpoint_c": -26.5,
      "Wind_Direction": 347,
      "Wind_Speed_kt": 4.8
    },
    {
      "Pressure_mb": 504.7,
      "Altitude_m": 5655,
      "Temp_c": -18.3,
      "Dewpoint_c": -26.5,
      "Wind_Direction": 347,
      "Wind_Speed_kt": 4.8
    },
    {
      "Pressure_mb": 504.4,
      "Altitude_m": 5659,
      "Temp_c": -18.3,
      "Dewpoint_c": -26.6,
      "Wind_Direction": 347,
      "Wind_Speed_kt": 4.8
    },
    {
      "Pressure_mb": 504.1,
      "Altitude_m": 5664,
      "Temp_c": -18.3,
      "Dewpoint_c": -26.6,
      "Wind_Direction": 346,
      "Wind_Speed_kt": 4.7
    },
    {
      "Pressure_mb": 503.8,
      "Altitude_m": 5668,
      "Temp_c": -18.3,
      "Dewpoint_c": -26.6,
      "Wind_Direction": 346,
      "Wind_Speed_kt": 4.7
    },
    {
      "Pressure_mb": 503.5,
      "Altitude_m": 5672,
      "Temp_c": -18.4,
      "Dewpoint_c": -26.6,
      "Wind_Direction": 346,
      "Wind_Speed_kt": 4.7
    },
    {
      "Pressure_mb": 503.2,
      "Altitude_m": 5677,
      "Temp_c": -18.4,
      "Dewpoint_c": -26.6,
      "Wind_Direction": 346,
      "Wind_Speed_kt": 4.7
    },
    {
      "Pressure_mb": 502.8,
      "Altitude_m": 5683,
      "Temp_c": -18.4,
      "Dewpoint_c": -26.6,
      "Wind_Direction": 346,
      "Wind_Speed_kt": 4.6
    },
    {
      "Pressure_mb": 502.7,
      "Altitude_m": 5685,
      "Temp_c": -18.4,
      "Dewpoint_c": -26.6,
      "Wind_Direction": 346,
      "Wind_Speed_kt": 4.6
    },
    {
      "Pressure_mb": 502.4,
      "Altitude_m": 5689,
      "Temp_c": -18.5,
      "Dewpoint_c": -26.6,
      "Wind_Direction": 346,
      "Wind_Speed_kt": 4.6
    },
    {
      "Pressure_mb": 502.1,
      "Altitude_m": 5693,
      "Temp_c": -18.5,
      "Dewpoint_c": -26.7,
      "Wind_Direction": 346,
      "Wind_Speed_kt": 4.5
    },
    {
      "Pressure_mb": 501.9,
      "Altitude_m": 5696,
      "Temp_c": -18.5,
      "Dewpoint_c": -26.7,
      "Wind_Direction": 346,
      "Wind_Speed_kt": 4.5
    },
    {
      "Pressure_mb": 501.6,
      "Altitude_m": 5700,
      "Temp_c": -18.5,
      "Dewpoint_c": -26.7,
      "Wind_Direction": 346,
      "Wind_Speed_kt": 4.5
    },
    {
      "Pressure_mb": 501.4,
      "Altitude_m": 5704,
      "Temp_c": -18.6,
      "Dewpoint_c": -26.7,
      "Wind_Direction": 346,
      "Wind_Speed_kt": 4.4
    },
    {
      "Pressure_mb": 501.1,
      "Altitude_m": 5707,
      "Temp_c": -18.6,
      "Dewpoint_c": -26.8,
      "Wind_Direction": 346,
      "Wind_Speed_kt": 4.4
    },
    {
      "Pressure_mb": 500.9,
      "Altitude_m": 5711,
      "Temp_c": -18.6,
      "Dewpoint_c": -26.8,
      "Wind_Direction": 346,
      "Wind_Speed_kt": 4.4
    },
    {
      "Pressure_mb": 500.6,
      "Altitude_m": 5715,
      "Temp_c": -18.7,
      "Dewpoint_c": -26.8,
      "Wind_Direction": 345,
      "Wind_Speed_kt": 4.3
    },
    {
      "Pressure_mb": 500.4,
      "Altitude_m": 5719,
      "Temp_c": -18.7,
      "Dewpoint_c": -26.9,
      "Wind_Direction": 345,
      "Wind_Speed_kt": 4.3
    },
    {
      "Pressure_mb": 500,
      "Altitude_m": 5724,
      "Temp_c": -18.7,
      "Dewpoint_c": -26.9,
      "Wind_Direction": 345,
      "Wind_Speed_kt": 4.3
    },
    {
      "Pressure_mb": 499.9,
      "Altitude_m": 5726,
      "Temp_c": -18.7,
      "Dewpoint_c": -26.9,
      "Wind_Direction": 345,
      "Wind_Speed_kt": 4.3
    },
    {
      "Pressure_mb": 499.6,
      "Altitude_m": 5730,
      "Temp_c": -18.8,
      "Dewpoint_c": -26.9,
      "Wind_Direction": 345,
      "Wind_Speed_kt": 4.2
    },
    {
      "Pressure_mb": 499.3,
      "Altitude_m": 5734,
      "Temp_c": -18.8,
      "Dewpoint_c": -27,
      "Wind_Direction": 345,
      "Wind_Speed_kt": 4.2
    },
    {
      "Pressure_mb": 499.1,
      "Altitude_m": 5738,
      "Temp_c": -18.8,
      "Dewpoint_c": -27,
      "Wind_Direction": 345,
      "Wind_Speed_kt": 4.2
    },
    {
      "Pressure_mb": 498.8,
      "Altitude_m": 5742,
      "Temp_c": -18.8,
      "Dewpoint_c": -27,
      "Wind_Direction": 345,
      "Wind_Speed_kt": 4.2
    },
    {
      "Pressure_mb": 498.6,
      "Altitude_m": 5745,
      "Temp_c": -18.9,
      "Dewpoint_c": -27.1,
      "Wind_Direction": 345,
      "Wind_Speed_kt": 4.2
    },
    {
      "Pressure_mb": 498.3,
      "Altitude_m": 5749,
      "Temp_c": -18.9,
      "Dewpoint_c": -27.1,
      "Wind_Direction": 345,
      "Wind_Speed_kt": 4.2
    },
    {
      "Pressure_mb": 498.1,
      "Altitude_m": 5753,
      "Temp_c": -18.9,
      "Dewpoint_c": -27.1,
      "Wind_Direction": 345,
      "Wind_Speed_kt": 4.2
    },
    {
      "Pressure_mb": 497.8,
      "Altitude_m": 5757,
      "Temp_c": -18.9,
      "Dewpoint_c": -27.2,
      "Wind_Direction": 344,
      "Wind_Speed_kt": 4.2
    },
    {
      "Pressure_mb": 497.6,
      "Altitude_m": 5761,
      "Temp_c": -18.9,
      "Dewpoint_c": -27.2,
      "Wind_Direction": 344,
      "Wind_Speed_kt": 4.2
    },
    {
      "Pressure_mb": 497.3,
      "Altitude_m": 5765,
      "Temp_c": -19,
      "Dewpoint_c": -27.2,
      "Wind_Direction": 344,
      "Wind_Speed_kt": 4.3
    },
    {
      "Pressure_mb": 497,
      "Altitude_m": 5768,
      "Temp_c": -19,
      "Dewpoint_c": -27.3,
      "Wind_Direction": 344,
      "Wind_Speed_kt": 4.3
    },
    {
      "Pressure_mb": 496.8,
      "Altitude_m": 5772,
      "Temp_c": -19,
      "Dewpoint_c": -27.3,
      "Wind_Direction": 344,
      "Wind_Speed_kt": 4.3
    },
    {
      "Pressure_mb": 496.5,
      "Altitude_m": 5776,
      "Temp_c": -19,
      "Dewpoint_c": -27.4,
      "Wind_Direction": 344,
      "Wind_Speed_kt": 4.3
    },
    {
      "Pressure_mb": 496.3,
      "Altitude_m": 5780,
      "Temp_c": -19,
      "Dewpoint_c": -27.4,
      "Wind_Direction": 344,
      "Wind_Speed_kt": 4.3
    },
    {
      "Pressure_mb": 495.9,
      "Altitude_m": 5785,
      "Temp_c": -19.1,
      "Dewpoint_c": -27.4,
      "Wind_Direction": 344,
      "Wind_Speed_kt": 4.3
    },
    {
      "Pressure_mb": 495.7,
      "Altitude_m": 5788,
      "Temp_c": -19.1,
      "Dewpoint_c": -27.4,
      "Wind_Direction": 344,
      "Wind_Speed_kt": 4.3
    },
    {
      "Pressure_mb": 495.5,
      "Altitude_m": 5792,
      "Temp_c": -19.1,
      "Dewpoint_c": -27.4,
      "Wind_Direction": 344,
      "Wind_Speed_kt": 4.3
    },
    {
      "Pressure_mb": 495.2,
      "Altitude_m": 5796,
      "Temp_c": -19.1,
      "Dewpoint_c": -27.4,
      "Wind_Direction": 343,
      "Wind_Speed_kt": 4.3
    },
    {
      "Pressure_mb": 494.9,
      "Altitude_m": 5800,
      "Temp_c": -19.2,
      "Dewpoint_c": -27.4,
      "Wind_Direction": 343,
      "Wind_Speed_kt": 4.3
    },
    {
      "Pressure_mb": 494.7,
      "Altitude_m": 5804,
      "Temp_c": -19.2,
      "Dewpoint_c": -27.4,
      "Wind_Direction": 343,
      "Wind_Speed_kt": 4.3
    },
    {
      "Pressure_mb": 494.4,
      "Altitude_m": 5809,
      "Temp_c": -19.2,
      "Dewpoint_c": -27.5,
      "Wind_Direction": 343,
      "Wind_Speed_kt": 4.3
    },
    {
      "Pressure_mb": 494.1,
      "Altitude_m": 5813,
      "Temp_c": -19.2,
      "Dewpoint_c": -27.5,
      "Wind_Direction": 343,
      "Wind_Speed_kt": 4.3
    },
    {
      "Pressure_mb": 493.8,
      "Altitude_m": 5817,
      "Temp_c": -19.2,
      "Dewpoint_c": -27.5,
      "Wind_Direction": 343,
      "Wind_Speed_kt": 4.3
    },
    {
      "Pressure_mb": 493.5,
      "Altitude_m": 5821,
      "Temp_c": -19.3,
      "Dewpoint_c": -27.5,
      "Wind_Direction": 343,
      "Wind_Speed_kt": 4.3
    },
    {
      "Pressure_mb": 493.3,
      "Altitude_m": 5825,
      "Temp_c": -19.3,
      "Dewpoint_c": -27.5,
      "Wind_Direction": 343,
      "Wind_Speed_kt": 4.3
    },
    {
      "Pressure_mb": 493,
      "Altitude_m": 5829,
      "Temp_c": -19.3,
      "Dewpoint_c": -27.5,
      "Wind_Direction": 343,
      "Wind_Speed_kt": 4.3
    },
    {
      "Pressure_mb": 492.8,
      "Altitude_m": 5833,
      "Temp_c": -19.3,
      "Dewpoint_c": -27.5,
      "Wind_Direction": 343,
      "Wind_Speed_kt": 4.4
    },
    {
      "Pressure_mb": 492.5,
      "Altitude_m": 5837,
      "Temp_c": -19.4,
      "Dewpoint_c": -27.5,
      "Wind_Direction": 343,
      "Wind_Speed_kt": 4.4
    },
    {
      "Pressure_mb": 492.3,
      "Altitude_m": 5840,
      "Temp_c": -19.4,
      "Dewpoint_c": -27.5,
      "Wind_Direction": 343,
      "Wind_Speed_kt": 4.4
    },
    {
      "Pressure_mb": 492,
      "Altitude_m": 5845,
      "Temp_c": -19.4,
      "Dewpoint_c": -27.5,
      "Wind_Direction": 343,
      "Wind_Speed_kt": 4.4
    },
    {
      "Pressure_mb": 491.7,
      "Altitude_m": 5849,
      "Temp_c": -19.4,
      "Dewpoint_c": -27.5,
      "Wind_Direction": 343,
      "Wind_Speed_kt": 4.4
    },
    {
      "Pressure_mb": 491.4,
      "Altitude_m": 5852,
      "Temp_c": -19.4,
      "Dewpoint_c": -27.5,
      "Wind_Direction": 343,
      "Wind_Speed_kt": 4.4
    },
    {
      "Pressure_mb": 491.2,
      "Altitude_m": 5856,
      "Temp_c": -19.5,
      "Dewpoint_c": -27.6,
      "Wind_Direction": 343,
      "Wind_Speed_kt": 4.4
    },
    {
      "Pressure_mb": 490.9,
      "Altitude_m": 5860,
      "Temp_c": -19.5,
      "Dewpoint_c": -27.6,
      "Wind_Direction": 343,
      "Wind_Speed_kt": 4.4
    },
    {
      "Pressure_mb": 490.7,
      "Altitude_m": 5864,
      "Temp_c": -19.5,
      "Dewpoint_c": -27.6,
      "Wind_Direction": 343,
      "Wind_Speed_kt": 4.4
    },
    {
      "Pressure_mb": 490.4,
      "Altitude_m": 5869,
      "Temp_c": -19.5,
      "Dewpoint_c": -27.6,
      "Wind_Direction": 343,
      "Wind_Speed_kt": 4.5
    },
    {
      "Pressure_mb": 490.1,
      "Altitude_m": 5873,
      "Temp_c": -19.5,
      "Dewpoint_c": -27.6,
      "Wind_Direction": 343,
      "Wind_Speed_kt": 4.5
    },
    {
      "Pressure_mb": 489.9,
      "Altitude_m": 5877,
      "Temp_c": -19.6,
      "Dewpoint_c": -27.7,
      "Wind_Direction": 343,
      "Wind_Speed_kt": 4.5
    },
    {
      "Pressure_mb": 489.6,
      "Altitude_m": 5881,
      "Temp_c": -19.6,
      "Dewpoint_c": -27.7,
      "Wind_Direction": 343,
      "Wind_Speed_kt": 4.5
    },
    {
      "Pressure_mb": 489.3,
      "Altitude_m": 5885,
      "Temp_c": -19.6,
      "Dewpoint_c": -27.7,
      "Wind_Direction": 343,
      "Wind_Speed_kt": 4.5
    },
    {
      "Pressure_mb": 489,
      "Altitude_m": 5889,
      "Temp_c": -19.6,
      "Dewpoint_c": -27.7,
      "Wind_Direction": 343,
      "Wind_Speed_kt": 4.5
    },
    {
      "Pressure_mb": 488.8,
      "Altitude_m": 5893,
      "Temp_c": -19.6,
      "Dewpoint_c": -27.7,
      "Wind_Direction": 343,
      "Wind_Speed_kt": 4.5
    },
    {
      "Pressure_mb": 488.5,
      "Altitude_m": 5897,
      "Temp_c": -19.7,
      "Dewpoint_c": -27.8,
      "Wind_Direction": 343,
      "Wind_Speed_kt": 4.5
    },
    {
      "Pressure_mb": 488.2,
      "Altitude_m": 5901,
      "Temp_c": -19.7,
      "Dewpoint_c": -27.8,
      "Wind_Direction": 343,
      "Wind_Speed_kt": 4.5
    },
    {
      "Pressure_mb": 488,
      "Altitude_m": 5905,
      "Temp_c": -19.7,
      "Dewpoint_c": -27.8,
      "Wind_Direction": 343,
      "Wind_Speed_kt": 4.5
    },
    {
      "Pressure_mb": 487.7,
      "Altitude_m": 5909,
      "Temp_c": -19.7,
      "Dewpoint_c": -27.9,
      "Wind_Direction": 343,
      "Wind_Speed_kt": 4.5
    },
    {
      "Pressure_mb": 487.4,
      "Altitude_m": 5914,
      "Temp_c": -19.8,
      "Dewpoint_c": -27.9,
      "Wind_Direction": 344,
      "Wind_Speed_kt": 4.5
    },
    {
      "Pressure_mb": 487.2,
      "Altitude_m": 5918,
      "Temp_c": -19.8,
      "Dewpoint_c": -27.9,
      "Wind_Direction": 344,
      "Wind_Speed_kt": 4.5
    },
    {
      "Pressure_mb": 486.9,
      "Altitude_m": 5922,
      "Temp_c": -19.8,
      "Dewpoint_c": -28,
      "Wind_Direction": 344,
      "Wind_Speed_kt": 4.5
    },
    {
      "Pressure_mb": 486.6,
      "Altitude_m": 5926,
      "Temp_c": -19.9,
      "Dewpoint_c": -28,
      "Wind_Direction": 344,
      "Wind_Speed_kt": 4.5
    },
    {
      "Pressure_mb": 486.3,
      "Altitude_m": 5930,
      "Temp_c": -19.9,
      "Dewpoint_c": -28,
      "Wind_Direction": 344,
      "Wind_Speed_kt": 4.5
    },
    {
      "Pressure_mb": 486,
      "Altitude_m": 5935,
      "Temp_c": -19.9,
      "Dewpoint_c": -28.1,
      "Wind_Direction": 344,
      "Wind_Speed_kt": 4.5
    },
    {
      "Pressure_mb": 485.8,
      "Altitude_m": 5939,
      "Temp_c": -19.9,
      "Dewpoint_c": -28.1,
      "Wind_Direction": 344,
      "Wind_Speed_kt": 4.5
    },
    {
      "Pressure_mb": 485.5,
      "Altitude_m": 5943,
      "Temp_c": -20,
      "Dewpoint_c": -28.1,
      "Wind_Direction": 344,
      "Wind_Speed_kt": 4.5
    },
    {
      "Pressure_mb": 485.2,
      "Altitude_m": 5948,
      "Temp_c": -20,
      "Dewpoint_c": -28.2,
      "Wind_Direction": 345,
      "Wind_Speed_kt": 4.5
    },
    {
      "Pressure_mb": 484.9,
      "Altitude_m": 5952,
      "Temp_c": -20,
      "Dewpoint_c": -28.2,
      "Wind_Direction": 345,
      "Wind_Speed_kt": 4.5
    },
    {
      "Pressure_mb": 484.6,
      "Altitude_m": 5956,
      "Temp_c": -20.1,
      "Dewpoint_c": -28.3,
      "Wind_Direction": 345,
      "Wind_Speed_kt": 4.5
    },
    {
      "Pressure_mb": 484.4,
      "Altitude_m": 5960,
      "Temp_c": -20.1,
      "Dewpoint_c": -28.3,
      "Wind_Direction": 345,
      "Wind_Speed_kt": 4.5
    },
    {
      "Pressure_mb": 484.1,
      "Altitude_m": 5965,
      "Temp_c": -20.1,
      "Dewpoint_c": -28.3,
      "Wind_Direction": 345,
      "Wind_Speed_kt": 4.5
    },
    {
      "Pressure_mb": 483.8,
      "Altitude_m": 5969,
      "Temp_c": -20.2,
      "Dewpoint_c": -28.4,
      "Wind_Direction": 345,
      "Wind_Speed_kt": 4.5
    },
    {
      "Pressure_mb": 483.5,
      "Altitude_m": 5973,
      "Temp_c": -20.2,
      "Dewpoint_c": -28.4,
      "Wind_Direction": 345,
      "Wind_Speed_kt": 4.5
    },
    {
      "Pressure_mb": 483.3,
      "Altitude_m": 5977,
      "Temp_c": -20.2,
      "Dewpoint_c": -28.5,
      "Wind_Direction": 345,
      "Wind_Speed_kt": 4.5
    },
    {
      "Pressure_mb": 483,
      "Altitude_m": 5981,
      "Temp_c": -20.3,
      "Dewpoint_c": -28.5,
      "Wind_Direction": 345,
      "Wind_Speed_kt": 4.5
    },
    {
      "Pressure_mb": 482.7,
      "Altitude_m": 5985,
      "Temp_c": -20.3,
      "Dewpoint_c": -28.6,
      "Wind_Direction": 345,
      "Wind_Speed_kt": 4.5
    },
    {
      "Pressure_mb": 482.5,
      "Altitude_m": 5989,
      "Temp_c": -20.3,
      "Dewpoint_c": -28.6,
      "Wind_Direction": 346,
      "Wind_Speed_kt": 4.5
    },
    {
      "Pressure_mb": 482.2,
      "Altitude_m": 5993,
      "Temp_c": -20.3,
      "Dewpoint_c": -28.7,
      "Wind_Direction": 346,
      "Wind_Speed_kt": 4.5
    },
    {
      "Pressure_mb": 482,
      "Altitude_m": 5997,
      "Temp_c": -20.4,
      "Dewpoint_c": -28.7,
      "Wind_Direction": 346,
      "Wind_Speed_kt": 4.5
    },
    {
      "Pressure_mb": 481.7,
      "Altitude_m": 6001,
      "Temp_c": -20.4,
      "Dewpoint_c": -28.7,
      "Wind_Direction": 346,
      "Wind_Speed_kt": 4.5
    },
    {
      "Pressure_mb": 481.5,
      "Altitude_m": 6005,
      "Temp_c": -20.4,
      "Dewpoint_c": -28.8,
      "Wind_Direction": 346,
      "Wind_Speed_kt": 4.5
    },
    {
      "Pressure_mb": 481.2,
      "Altitude_m": 6009,
      "Temp_c": -20.5,
      "Dewpoint_c": -28.8,
      "Wind_Direction": 346,
      "Wind_Speed_kt": 4.5
    },
    {
      "Pressure_mb": 481,
      "Altitude_m": 6012,
      "Temp_c": -20.5,
      "Dewpoint_c": -28.9,
      "Wind_Direction": 346,
      "Wind_Speed_kt": 4.5
    },
    {
      "Pressure_mb": 480.7,
      "Altitude_m": 6016,
      "Temp_c": -20.5,
      "Dewpoint_c": -28.9,
      "Wind_Direction": 346,
      "Wind_Speed_kt": 4.5
    },
    {
      "Pressure_mb": 480.5,
      "Altitude_m": 6020,
      "Temp_c": -20.5,
      "Dewpoint_c": -28.9,
      "Wind_Direction": 346,
      "Wind_Speed_kt": 4.5
    },
    {
      "Pressure_mb": 480.3,
      "Altitude_m": 6023,
      "Temp_c": -20.6,
      "Dewpoint_c": -29,
      "Wind_Direction": 346,
      "Wind_Speed_kt": 4.5
    },
    {
      "Pressure_mb": 480,
      "Altitude_m": 6027,
      "Temp_c": -20.6,
      "Dewpoint_c": -29,
      "Wind_Direction": 346,
      "Wind_Speed_kt": 4.5
    },
    {
      "Pressure_mb": 479.8,
      "Altitude_m": 6031,
      "Temp_c": -20.6,
      "Dewpoint_c": -29,
      "Wind_Direction": 346,
      "Wind_Speed_kt": 4.5
    },
    {
      "Pressure_mb": 479.5,
      "Altitude_m": 6034,
      "Temp_c": -20.7,
      "Dewpoint_c": -29.1,
      "Wind_Direction": 346,
      "Wind_Speed_kt": 4.5
    },
    {
      "Pressure_mb": 479.3,
      "Altitude_m": 6038,
      "Temp_c": -20.7,
      "Dewpoint_c": -29.1,
      "Wind_Direction": 346,
      "Wind_Speed_kt": 4.5
    },
    {
      "Pressure_mb": 479.1,
      "Altitude_m": 6042,
      "Temp_c": -20.7,
      "Dewpoint_c": -29.2,
      "Wind_Direction": 346,
      "Wind_Speed_kt": 4.5
    },
    {
      "Pressure_mb": 478.8,
      "Altitude_m": 6045,
      "Temp_c": -20.7,
      "Dewpoint_c": -29.2,
      "Wind_Direction": 346,
      "Wind_Speed_kt": 4.5
    },
    {
      "Pressure_mb": 478.6,
      "Altitude_m": 6049,
      "Temp_c": -20.8,
      "Dewpoint_c": -29.2,
      "Wind_Direction": 346,
      "Wind_Speed_kt": 4.5
    },
    {
      "Pressure_mb": 478.3,
      "Altitude_m": 6053,
      "Temp_c": -20.8,
      "Dewpoint_c": -29.3,
      "Wind_Direction": 346,
      "Wind_Speed_kt": 4.5
    },
    {
      "Pressure_mb": 478.1,
      "Altitude_m": 6056,
      "Temp_c": -20.8,
      "Dewpoint_c": -29.3,
      "Wind_Direction": 346,
      "Wind_Speed_kt": 4.4
    },
    {
      "Pressure_mb": 477.9,
      "Altitude_m": 6060,
      "Temp_c": -20.8,
      "Dewpoint_c": -29.5,
      "Wind_Direction": 346,
      "Wind_Speed_kt": 4.4
    },
    {
      "Pressure_mb": 477.6,
      "Altitude_m": 6064,
      "Temp_c": -20.9,
      "Dewpoint_c": -29.6,
      "Wind_Direction": 346,
      "Wind_Speed_kt": 4.3
    },
    {
      "Pressure_mb": 477.4,
      "Altitude_m": 6068,
      "Temp_c": -20.9,
      "Dewpoint_c": -29.7,
      "Wind_Direction": 346,
      "Wind_Speed_kt": 4.3
    },
    {
      "Pressure_mb": 477.1,
      "Altitude_m": 6072,
      "Temp_c": -20.9,
      "Dewpoint_c": -29.8,
      "Wind_Direction": 346,
      "Wind_Speed_kt": 4.2
    },
    {
      "Pressure_mb": 476.9,
      "Altitude_m": 6075,
      "Temp_c": -20.9,
      "Dewpoint_c": -29.9,
      "Wind_Direction": 346,
      "Wind_Speed_kt": 4.2
    },
    {
      "Pressure_mb": 476.6,
      "Altitude_m": 6079,
      "Temp_c": -21,
      "Dewpoint_c": -30,
      "Wind_Direction": 346,
      "Wind_Speed_kt": 4.2
    },
    {
      "Pressure_mb": 476.4,
      "Altitude_m": 6083,
      "Temp_c": -21,
      "Dewpoint_c": -30.2,
      "Wind_Direction": 346,
      "Wind_Speed_kt": 4.1
    },
    {
      "Pressure_mb": 476.1,
      "Altitude_m": 6087,
      "Temp_c": -21,
      "Dewpoint_c": -30.3,
      "Wind_Direction": 346,
      "Wind_Speed_kt": 4.1
    },
    {
      "Pressure_mb": 475.9,
      "Altitude_m": 6091,
      "Temp_c": -21,
      "Dewpoint_c": -30.4,
      "Wind_Direction": 346,
      "Wind_Speed_kt": 4
    },
    {
      "Pressure_mb": 475.6,
      "Altitude_m": 6095,
      "Temp_c": -21.1,
      "Dewpoint_c": -30.5,
      "Wind_Direction": 346,
      "Wind_Speed_kt": 4
    },
    {
      "Pressure_mb": 475.4,
      "Altitude_m": 6099,
      "Temp_c": -21.1,
      "Dewpoint_c": -30.7,
      "Wind_Direction": 346,
      "Wind_Speed_kt": 3.9
    },
    {
      "Pressure_mb": 475.1,
      "Altitude_m": 6103,
      "Temp_c": -21.1,
      "Dewpoint_c": -30.8,
      "Wind_Direction": 346,
      "Wind_Speed_kt": 3.9
    },
    {
      "Pressure_mb": 474.9,
      "Altitude_m": 6107,
      "Temp_c": -21.1,
      "Dewpoint_c": -30.9,
      "Wind_Direction": 346,
      "Wind_Speed_kt": 3.9
    },
    {
      "Pressure_mb": 474.6,
      "Altitude_m": 6111,
      "Temp_c": -21.2,
      "Dewpoint_c": -31,
      "Wind_Direction": 346,
      "Wind_Speed_kt": 3.8
    },
    {
      "Pressure_mb": 474.4,
      "Altitude_m": 6114,
      "Temp_c": -21.2,
      "Dewpoint_c": -31.1,
      "Wind_Direction": 345,
      "Wind_Speed_kt": 3.8
    },
    {
      "Pressure_mb": 474.1,
      "Altitude_m": 6118,
      "Temp_c": -21.2,
      "Dewpoint_c": -31.1,
      "Wind_Direction": 345,
      "Wind_Speed_kt": 3.7
    },
    {
      "Pressure_mb": 473.9,
      "Altitude_m": 6122,
      "Temp_c": -21.3,
      "Dewpoint_c": -31.2,
      "Wind_Direction": 345,
      "Wind_Speed_kt": 3.7
    },
    {
      "Pressure_mb": 473.6,
      "Altitude_m": 6126,
      "Temp_c": -21.3,
      "Dewpoint_c": -31.3,
      "Wind_Direction": 345,
      "Wind_Speed_kt": 3.7
    },
    {
      "Pressure_mb": 473.4,
      "Altitude_m": 6130,
      "Temp_c": -21.3,
      "Dewpoint_c": -31.3,
      "Wind_Direction": 345,
      "Wind_Speed_kt": 3.6
    },
    {
      "Pressure_mb": 473.1,
      "Altitude_m": 6134,
      "Temp_c": -21.3,
      "Dewpoint_c": -31.4,
      "Wind_Direction": 345,
      "Wind_Speed_kt": 3.6
    },
    {
      "Pressure_mb": 472.9,
      "Altitude_m": 6138,
      "Temp_c": -21.4,
      "Dewpoint_c": -31.5,
      "Wind_Direction": 345,
      "Wind_Speed_kt": 3.6
    },
    {
      "Pressure_mb": 472.6,
      "Altitude_m": 6142,
      "Temp_c": -21.4,
      "Dewpoint_c": -31.5,
      "Wind_Direction": 345,
      "Wind_Speed_kt": 3.6
    },
    {
      "Pressure_mb": 472.4,
      "Altitude_m": 6146,
      "Temp_c": -21.4,
      "Dewpoint_c": -31.6,
      "Wind_Direction": 345,
      "Wind_Speed_kt": 3.5
    },
    {
      "Pressure_mb": 472.1,
      "Altitude_m": 6150,
      "Temp_c": -21.5,
      "Dewpoint_c": -31.7,
      "Wind_Direction": 345,
      "Wind_Speed_kt": 3.5
    },
    {
      "Pressure_mb": 471.9,
      "Altitude_m": 6154,
      "Temp_c": -21.5,
      "Dewpoint_c": -31.8,
      "Wind_Direction": 346,
      "Wind_Speed_kt": 3.5
    },
    {
      "Pressure_mb": 471.5,
      "Altitude_m": 6159,
      "Temp_c": -21.5,
      "Dewpoint_c": -31.8,
      "Wind_Direction": 346,
      "Wind_Speed_kt": 3.5
    },
    {
      "Pressure_mb": 471.3,
      "Altitude_m": 6162,
      "Temp_c": -21.6,
      "Dewpoint_c": -31.8,
      "Wind_Direction": 346,
      "Wind_Speed_kt": 3.4
    },
    {
      "Pressure_mb": 471.1,
      "Altitude_m": 6166,
      "Temp_c": -21.6,
      "Dewpoint_c": -31.8,
      "Wind_Direction": 346,
      "Wind_Speed_kt": 3.4
    },
    {
      "Pressure_mb": 470.8,
      "Altitude_m": 6170,
      "Temp_c": -21.6,
      "Dewpoint_c": -31.8,
      "Wind_Direction": 346,
      "Wind_Speed_kt": 3.4
    },
    {
      "Pressure_mb": 470.6,
      "Altitude_m": 6174,
      "Temp_c": -21.7,
      "Dewpoint_c": -31.8,
      "Wind_Direction": 346,
      "Wind_Speed_kt": 3.4
    },
    {
      "Pressure_mb": 470.3,
      "Altitude_m": 6177,
      "Temp_c": -21.7,
      "Dewpoint_c": -31.8,
      "Wind_Direction": 346,
      "Wind_Speed_kt": 3.4
    },
    {
      "Pressure_mb": 470.1,
      "Altitude_m": 6181,
      "Temp_c": -21.7,
      "Dewpoint_c": -31.8,
      "Wind_Direction": 346,
      "Wind_Speed_kt": 3.3
    },
    {
      "Pressure_mb": 469.8,
      "Altitude_m": 6185,
      "Temp_c": -21.7,
      "Dewpoint_c": -31.8,
      "Wind_Direction": 346,
      "Wind_Speed_kt": 3.3
    },
    {
      "Pressure_mb": 469.6,
      "Altitude_m": 6189,
      "Temp_c": -21.8,
      "Dewpoint_c": -31.8,
      "Wind_Direction": 346,
      "Wind_Speed_kt": 3.3
    },
    {
      "Pressure_mb": 469.3,
      "Altitude_m": 6193,
      "Temp_c": -21.8,
      "Dewpoint_c": -31.8,
      "Wind_Direction": 346,
      "Wind_Speed_kt": 3.3
    },
    {
      "Pressure_mb": 469.1,
      "Altitude_m": 6197,
      "Temp_c": -21.8,
      "Dewpoint_c": -31.8,
      "Wind_Direction": 346,
      "Wind_Speed_kt": 3.2
    },
    {
      "Pressure_mb": 468.8,
      "Altitude_m": 6201,
      "Temp_c": -21.9,
      "Dewpoint_c": -31.8,
      "Wind_Direction": 346,
      "Wind_Speed_kt": 3.2
    },
    {
      "Pressure_mb": 468.6,
      "Altitude_m": 6205,
      "Temp_c": -21.9,
      "Dewpoint_c": -31.7,
      "Wind_Direction": 346,
      "Wind_Speed_kt": 3.2
    },
    {
      "Pressure_mb": 468.3,
      "Altitude_m": 6209,
      "Temp_c": -21.9,
      "Dewpoint_c": -31.7,
      "Wind_Direction": 346,
      "Wind_Speed_kt": 3.2
    },
    {
      "Pressure_mb": 468.1,
      "Altitude_m": 6212,
      "Temp_c": -22,
      "Dewpoint_c": -31.7,
      "Wind_Direction": 346,
      "Wind_Speed_kt": 3.2
    },
    {
      "Pressure_mb": 467.8,
      "Altitude_m": 6216,
      "Temp_c": -22,
      "Dewpoint_c": -31.7,
      "Wind_Direction": 346,
      "Wind_Speed_kt": 3.2
    },
    {
      "Pressure_mb": 467.6,
      "Altitude_m": 6220,
      "Temp_c": -22,
      "Dewpoint_c": -31.7,
      "Wind_Direction": 346,
      "Wind_Speed_kt": 3.3
    },
    {
      "Pressure_mb": 467.4,
      "Altitude_m": 6224,
      "Temp_c": -22.1,
      "Dewpoint_c": -31.7,
      "Wind_Direction": 346,
      "Wind_Speed_kt": 3.3
    },
    {
      "Pressure_mb": 467.1,
      "Altitude_m": 6228,
      "Temp_c": -22.1,
      "Dewpoint_c": -31.7,
      "Wind_Direction": 346,
      "Wind_Speed_kt": 3.3
    },
    {
      "Pressure_mb": 466.8,
      "Altitude_m": 6232,
      "Temp_c": -22.1,
      "Dewpoint_c": -31.7,
      "Wind_Direction": 346,
      "Wind_Speed_kt": 3.3
    },
    {
      "Pressure_mb": 466.6,
      "Altitude_m": 6236,
      "Temp_c": -22.2,
      "Dewpoint_c": -31.7,
      "Wind_Direction": 346,
      "Wind_Speed_kt": 3.3
    },
    {
      "Pressure_mb": 466.3,
      "Altitude_m": 6240,
      "Temp_c": -22.2,
      "Dewpoint_c": -31.7,
      "Wind_Direction": 346,
      "Wind_Speed_kt": 3.3
    },
    {
      "Pressure_mb": 466.1,
      "Altitude_m": 6244,
      "Temp_c": -22.2,
      "Dewpoint_c": -31.6,
      "Wind_Direction": 346,
      "Wind_Speed_kt": 3.4
    },
    {
      "Pressure_mb": 465.8,
      "Altitude_m": 6248,
      "Temp_c": -22.3,
      "Dewpoint_c": -31.6,
      "Wind_Direction": 346,
      "Wind_Speed_kt": 3.4
    },
    {
      "Pressure_mb": 465.5,
      "Altitude_m": 6253,
      "Temp_c": -22.3,
      "Dewpoint_c": -31.6,
      "Wind_Direction": 346,
      "Wind_Speed_kt": 3.4
    },
    {
      "Pressure_mb": 465.2,
      "Altitude_m": 6257,
      "Temp_c": -22.3,
      "Dewpoint_c": -31.6,
      "Wind_Direction": 346,
      "Wind_Speed_kt": 3.4
    },
    {
      "Pressure_mb": 465,
      "Altitude_m": 6262,
      "Temp_c": -22.4,
      "Dewpoint_c": -31.6,
      "Wind_Direction": 346,
      "Wind_Speed_kt": 3.4
    },
    {
      "Pressure_mb": 464.7,
      "Altitude_m": 6266,
      "Temp_c": -22.4,
      "Dewpoint_c": -31.6,
      "Wind_Direction": 346,
      "Wind_Speed_kt": 3.4
    },
    {
      "Pressure_mb": 464.4,
      "Altitude_m": 6271,
      "Temp_c": -22.4,
      "Dewpoint_c": -31.6,
      "Wind_Direction": 346,
      "Wind_Speed_kt": 3.5
    },
    {
      "Pressure_mb": 464.1,
      "Altitude_m": 6276,
      "Temp_c": -22.4,
      "Dewpoint_c": -31.6,
      "Wind_Direction": 346,
      "Wind_Speed_kt": 3.5
    },
    {
      "Pressure_mb": 463.7,
      "Altitude_m": 6282,
      "Temp_c": -22.5,
      "Dewpoint_c": -31.5,
      "Wind_Direction": 346,
      "Wind_Speed_kt": 3.5
    },
    {
      "Pressure_mb": 463.3,
      "Altitude_m": 6287,
      "Temp_c": -22.5,
      "Dewpoint_c": -31.5,
      "Wind_Direction": 346,
      "Wind_Speed_kt": 3.5
    },
    {
      "Pressure_mb": 463,
      "Altitude_m": 6293,
      "Temp_c": -22.5,
      "Dewpoint_c": -31.5,
      "Wind_Direction": 346,
      "Wind_Speed_kt": 3.5
    },
    {
      "Pressure_mb": 462.6,
      "Altitude_m": 6299,
      "Temp_c": -22.6,
      "Dewpoint_c": -31.5,
      "Wind_Direction": 346,
      "Wind_Speed_kt": 3.6
    },
    {
      "Pressure_mb": 462.2,
      "Altitude_m": 6305,
      "Temp_c": -22.6,
      "Dewpoint_c": -31.5,
      "Wind_Direction": 346,
      "Wind_Speed_kt": 3.8
    },
    {
      "Pressure_mb": 461.8,
      "Altitude_m": 6311,
      "Temp_c": -22.6,
      "Dewpoint_c": -31.5,
      "Wind_Direction": 346,
      "Wind_Speed_kt": 3.9
    },
    {
      "Pressure_mb": 461.5,
      "Altitude_m": 6317,
      "Temp_c": -22.7,
      "Dewpoint_c": -31.5,
      "Wind_Direction": 346,
      "Wind_Speed_kt": 4
    },
    {
      "Pressure_mb": 461.1,
      "Altitude_m": 6323,
      "Temp_c": -22.7,
      "Dewpoint_c": -31.5,
      "Wind_Direction": 346,
      "Wind_Speed_kt": 4.1
    },
    {
      "Pressure_mb": 460.8,
      "Altitude_m": 6329,
      "Temp_c": -22.7,
      "Dewpoint_c": -31.5,
      "Wind_Direction": 346,
      "Wind_Speed_kt": 4.2
    },
    {
      "Pressure_mb": 460.4,
      "Altitude_m": 6335,
      "Temp_c": -22.8,
      "Dewpoint_c": -31.4,
      "Wind_Direction": 346,
      "Wind_Speed_kt": 4.4
    },
    {
      "Pressure_mb": 460,
      "Altitude_m": 6340,
      "Temp_c": -22.8,
      "Dewpoint_c": -31.4,
      "Wind_Direction": 346,
      "Wind_Speed_kt": 4.5
    },
    {
      "Pressure_mb": 459.7,
      "Altitude_m": 6346,
      "Temp_c": -22.8,
      "Dewpoint_c": -31.4,
      "Wind_Direction": 346,
      "Wind_Speed_kt": 4.6
    },
    {
      "Pressure_mb": 459.3,
      "Altitude_m": 6351,
      "Temp_c": -22.8,
      "Dewpoint_c": -31.4,
      "Wind_Direction": 346,
      "Wind_Speed_kt": 4.7
    },
    {
      "Pressure_mb": 459,
      "Altitude_m": 6356,
      "Temp_c": -22.9,
      "Dewpoint_c": -31.3,
      "Wind_Direction": 346,
      "Wind_Speed_kt": 4.8
    },
    {
      "Pressure_mb": 458.7,
      "Altitude_m": 6362,
      "Temp_c": -22.9,
      "Dewpoint_c": -31.3,
      "Wind_Direction": 346,
      "Wind_Speed_kt": 5
    },
    {
      "Pressure_mb": 458.4,
      "Altitude_m": 6367,
      "Temp_c": -22.9,
      "Dewpoint_c": -31.2,
      "Wind_Direction": 346,
      "Wind_Speed_kt": 5.1
    },
    {
      "Pressure_mb": 458,
      "Altitude_m": 6372,
      "Temp_c": -22.9,
      "Dewpoint_c": -31.2,
      "Wind_Direction": 346,
      "Wind_Speed_kt": 5.2
    },
    {
      "Pressure_mb": 457.7,
      "Altitude_m": 6377,
      "Temp_c": -23,
      "Dewpoint_c": -31.1,
      "Wind_Direction": 346,
      "Wind_Speed_kt": 5.3
    },
    {
      "Pressure_mb": 457.4,
      "Altitude_m": 6382,
      "Temp_c": -23,
      "Dewpoint_c": -31.1,
      "Wind_Direction": 346,
      "Wind_Speed_kt": 5.4
    },
    {
      "Pressure_mb": 457.1,
      "Altitude_m": 6388,
      "Temp_c": -23,
      "Dewpoint_c": -31.1,
      "Wind_Direction": 346,
      "Wind_Speed_kt": 5.6
    },
    {
      "Pressure_mb": 456.8,
      "Altitude_m": 6393,
      "Temp_c": -23.1,
      "Dewpoint_c": -31,
      "Wind_Direction": 346,
      "Wind_Speed_kt": 5.7
    },
    {
      "Pressure_mb": 456.5,
      "Altitude_m": 6398,
      "Temp_c": -23.1,
      "Dewpoint_c": -31,
      "Wind_Direction": 346,
      "Wind_Speed_kt": 5.8
    },
    {
      "Pressure_mb": 456.2,
      "Altitude_m": 6403,
      "Temp_c": -23.1,
      "Dewpoint_c": -30.9,
      "Wind_Direction": 346,
      "Wind_Speed_kt": 5.9
    },
    {
      "Pressure_mb": 455.9,
      "Altitude_m": 6407,
      "Temp_c": -23.1,
      "Dewpoint_c": -30.9,
      "Wind_Direction": 346,
      "Wind_Speed_kt": 6.1
    },
    {
      "Pressure_mb": 455.6,
      "Altitude_m": 6411,
      "Temp_c": -23.2,
      "Dewpoint_c": -30.8,
      "Wind_Direction": 346,
      "Wind_Speed_kt": 6.2
    },
    {
      "Pressure_mb": 455.3,
      "Altitude_m": 6415,
      "Temp_c": -23.2,
      "Dewpoint_c": -30.8,
      "Wind_Direction": 346,
      "Wind_Speed_kt": 6.3
    },
    {
      "Pressure_mb": 455.1,
      "Altitude_m": 6419,
      "Temp_c": -23.2,
      "Dewpoint_c": -30.8,
      "Wind_Direction": 346,
      "Wind_Speed_kt": 6.4
    },
    {
      "Pressure_mb": 454.8,
      "Altitude_m": 6423,
      "Temp_c": -23.2,
      "Dewpoint_c": -30.8,
      "Wind_Direction": 346,
      "Wind_Speed_kt": 6.6
    },
    {
      "Pressure_mb": 454.6,
      "Altitude_m": 6428,
      "Temp_c": -23.3,
      "Dewpoint_c": -30.7,
      "Wind_Direction": 346,
      "Wind_Speed_kt": 6.7
    },
    {
      "Pressure_mb": 454.3,
      "Altitude_m": 6432,
      "Temp_c": -23.3,
      "Dewpoint_c": -30.7,
      "Wind_Direction": 346,
      "Wind_Speed_kt": 6.8
    },
    {
      "Pressure_mb": 454.1,
      "Altitude_m": 6436,
      "Temp_c": -23.3,
      "Dewpoint_c": -30.7,
      "Wind_Direction": 346,
      "Wind_Speed_kt": 6.9
    },
    {
      "Pressure_mb": 453.8,
      "Altitude_m": 6440,
      "Temp_c": -23.3,
      "Dewpoint_c": -30.7,
      "Wind_Direction": 346,
      "Wind_Speed_kt": 7.1
    },
    {
      "Pressure_mb": 453.5,
      "Altitude_m": 6444,
      "Temp_c": -23.4,
      "Dewpoint_c": -30.7,
      "Wind_Direction": 346,
      "Wind_Speed_kt": 7.2
    },
    {
      "Pressure_mb": 453.3,
      "Altitude_m": 6448,
      "Temp_c": -23.4,
      "Dewpoint_c": -30.6,
      "Wind_Direction": 346,
      "Wind_Speed_kt": 7.3
    },
    {
      "Pressure_mb": 453,
      "Altitude_m": 6453,
      "Temp_c": -23.4,
      "Dewpoint_c": -30.6,
      "Wind_Direction": 346,
      "Wind_Speed_kt": 7.4
    },
    {
      "Pressure_mb": 452.7,
      "Altitude_m": 6457,
      "Temp_c": -23.4,
      "Dewpoint_c": -30.6,
      "Wind_Direction": 346,
      "Wind_Speed_kt": 7.5
    },
    {
      "Pressure_mb": 452.5,
      "Altitude_m": 6462,
      "Temp_c": -23.5,
      "Dewpoint_c": -30.6,
      "Wind_Direction": 346,
      "Wind_Speed_kt": 7.7
    },
    {
      "Pressure_mb": 452.2,
      "Altitude_m": 6466,
      "Temp_c": -23.5,
      "Dewpoint_c": -30.5,
      "Wind_Direction": 346,
      "Wind_Speed_kt": 7.8
    },
    {
      "Pressure_mb": 452.1,
      "Altitude_m": 6469,
      "Temp_c": -23.5,
      "Dewpoint_c": -30.5,
      "Wind_Direction": 346,
      "Wind_Speed_kt": 7.9
    },
    {
      "Pressure_mb": 451.7,
      "Altitude_m": 6475,
      "Temp_c": -23.5,
      "Dewpoint_c": -30.6,
      "Wind_Direction": 346,
      "Wind_Speed_kt": 8
    },
    {
      "Pressure_mb": 451.4,
      "Altitude_m": 6479,
      "Temp_c": -23.6,
      "Dewpoint_c": -30.6,
      "Wind_Direction": 346,
      "Wind_Speed_kt": 8.2
    },
    {
      "Pressure_mb": 451.1,
      "Altitude_m": 6483,
      "Temp_c": -23.6,
      "Dewpoint_c": -30.6,
      "Wind_Direction": 346,
      "Wind_Speed_kt": 8.3
    },
    {
      "Pressure_mb": 450.9,
      "Altitude_m": 6487,
      "Temp_c": -23.6,
      "Dewpoint_c": -30.6,
      "Wind_Direction": 346,
      "Wind_Speed_kt": 8.4
    },
    {
      "Pressure_mb": 450.7,
      "Altitude_m": 6491,
      "Temp_c": -23.6,
      "Dewpoint_c": -30.7,
      "Wind_Direction": 346,
      "Wind_Speed_kt": 8.5
    },
    {
      "Pressure_mb": 450.4,
      "Altitude_m": 6495,
      "Temp_c": -23.7,
      "Dewpoint_c": -30.7,
      "Wind_Direction": 346,
      "Wind_Speed_kt": 8.6
    },
    {
      "Pressure_mb": 450.2,
      "Altitude_m": 6499,
      "Temp_c": -23.7,
      "Dewpoint_c": -30.7,
      "Wind_Direction": 346,
      "Wind_Speed_kt": 8.6
    },
    {
      "Pressure_mb": 449.9,
      "Altitude_m": 6503,
      "Temp_c": -23.7,
      "Dewpoint_c": -30.8,
      "Wind_Direction": 346,
      "Wind_Speed_kt": 8.7
    },
    {
      "Pressure_mb": 449.7,
      "Altitude_m": 6506,
      "Temp_c": -23.7,
      "Dewpoint_c": -30.8,
      "Wind_Direction": 346,
      "Wind_Speed_kt": 8.8
    },
    {
      "Pressure_mb": 449.4,
      "Altitude_m": 6510,
      "Temp_c": -23.7,
      "Dewpoint_c": -30.8,
      "Wind_Direction": 346,
      "Wind_Speed_kt": 8.8
    },
    {
      "Pressure_mb": 449.2,
      "Altitude_m": 6514,
      "Temp_c": -23.8,
      "Dewpoint_c": -30.8,
      "Wind_Direction": 347,
      "Wind_Speed_kt": 8.9
    },
    {
      "Pressure_mb": 449,
      "Altitude_m": 6518,
      "Temp_c": -23.8,
      "Dewpoint_c": -30.9,
      "Wind_Direction": 347,
      "Wind_Speed_kt": 9
    },
    {
      "Pressure_mb": 448.7,
      "Altitude_m": 6522,
      "Temp_c": -23.8,
      "Dewpoint_c": -30.9,
      "Wind_Direction": 347,
      "Wind_Speed_kt": 9
    },
    {
      "Pressure_mb": 448.5,
      "Altitude_m": 6526,
      "Temp_c": -23.8,
      "Dewpoint_c": -30.9,
      "Wind_Direction": 347,
      "Wind_Speed_kt": 9.1
    },
    {
      "Pressure_mb": 448.2,
      "Altitude_m": 6530,
      "Temp_c": -23.9,
      "Dewpoint_c": -31,
      "Wind_Direction": 347,
      "Wind_Speed_kt": 9.2
    },
    {
      "Pressure_mb": 448,
      "Altitude_m": 6534,
      "Temp_c": -23.9,
      "Dewpoint_c": -31,
      "Wind_Direction": 347,
      "Wind_Speed_kt": 9.3
    },
    {
      "Pressure_mb": 447.7,
      "Altitude_m": 6538,
      "Temp_c": -23.9,
      "Dewpoint_c": -31.1,
      "Wind_Direction": 347,
      "Wind_Speed_kt": 9.3
    },
    {
      "Pressure_mb": 447.5,
      "Altitude_m": 6542,
      "Temp_c": -24,
      "Dewpoint_c": -31.1,
      "Wind_Direction": 347,
      "Wind_Speed_kt": 9.4
    },
    {
      "Pressure_mb": 447.3,
      "Altitude_m": 6546,
      "Temp_c": -24,
      "Dewpoint_c": -31.1,
      "Wind_Direction": 347,
      "Wind_Speed_kt": 9.5
    },
    {
      "Pressure_mb": 447,
      "Altitude_m": 6550,
      "Temp_c": -24,
      "Dewpoint_c": -31.2,
      "Wind_Direction": 347,
      "Wind_Speed_kt": 9.5
    },
    {
      "Pressure_mb": 446.8,
      "Altitude_m": 6554,
      "Temp_c": -24,
      "Dewpoint_c": -31.2,
      "Wind_Direction": 347,
      "Wind_Speed_kt": 9.6
    },
    {
      "Pressure_mb": 446.5,
      "Altitude_m": 6558,
      "Temp_c": -24.1,
      "Dewpoint_c": -31.3,
      "Wind_Direction": 347,
      "Wind_Speed_kt": 9.7
    },
    {
      "Pressure_mb": 446.3,
      "Altitude_m": 6562,
      "Temp_c": -24.1,
      "Dewpoint_c": -31.3,
      "Wind_Direction": 347,
      "Wind_Speed_kt": 9.7
    },
    {
      "Pressure_mb": 446,
      "Altitude_m": 6566,
      "Temp_c": -24.1,
      "Dewpoint_c": -31.3,
      "Wind_Direction": 348,
      "Wind_Speed_kt": 9.8
    },
    {
      "Pressure_mb": 445.8,
      "Altitude_m": 6571,
      "Temp_c": -24.2,
      "Dewpoint_c": -31.4,
      "Wind_Direction": 348,
      "Wind_Speed_kt": 9.9
    },
    {
      "Pressure_mb": 445.5,
      "Altitude_m": 6575,
      "Temp_c": -24.2,
      "Dewpoint_c": -31.4,
      "Wind_Direction": 348,
      "Wind_Speed_kt": 9.9
    },
    {
      "Pressure_mb": 445.2,
      "Altitude_m": 6579,
      "Temp_c": -24.2,
      "Dewpoint_c": -31.5,
      "Wind_Direction": 348,
      "Wind_Speed_kt": 9.9
    },
    {
      "Pressure_mb": 445,
      "Altitude_m": 6583,
      "Temp_c": -24.2,
      "Dewpoint_c": -31.5,
      "Wind_Direction": 348,
      "Wind_Speed_kt": 0
    },
    {
      "Pressure_mb": 444.8,
      "Altitude_m": 6587,
      "Temp_c": -24.3,
      "Dewpoint_c": -31.5,
      "Wind_Direction": 348,
      "Wind_Speed_kt": 0
    },
    {
      "Pressure_mb": 444.5,
      "Altitude_m": 6591,
      "Temp_c": -24.3,
      "Dewpoint_c": -31.5,
      "Wind_Direction": 348,
      "Wind_Speed_kt": 0
    },
    {
      "Pressure_mb": 444.3,
      "Altitude_m": 6595,
      "Temp_c": -24.3,
      "Dewpoint_c": -31.6,
      "Wind_Direction": 348,
      "Wind_Speed_kt": 0.1
    },
    {
      "Pressure_mb": 444,
      "Altitude_m": 6599,
      "Temp_c": -24.4,
      "Dewpoint_c": -31.6,
      "Wind_Direction": 348,
      "Wind_Speed_kt": 0.1
    },
    {
      "Pressure_mb": 443.8,
      "Altitude_m": 6603,
      "Temp_c": -24.4,
      "Dewpoint_c": -31.6,
      "Wind_Direction": 348,
      "Wind_Speed_kt": 0.2
    },
    {
      "Pressure_mb": 443.5,
      "Altitude_m": 6607,
      "Temp_c": -24.4,
      "Dewpoint_c": -31.7,
      "Wind_Direction": 348,
      "Wind_Speed_kt": 0.2
    },
    {
      "Pressure_mb": 443.3,
      "Altitude_m": 6611,
      "Temp_c": -24.5,
      "Dewpoint_c": -31.7,
      "Wind_Direction": 348,
      "Wind_Speed_kt": 0.2
    },
    {
      "Pressure_mb": 443,
      "Altitude_m": 6615,
      "Temp_c": -24.5,
      "Dewpoint_c": -31.7,
      "Wind_Direction": 348,
      "Wind_Speed_kt": 0.3
    },
    {
      "Pressure_mb": 442.8,
      "Altitude_m": 6620,
      "Temp_c": -24.5,
      "Dewpoint_c": -31.8,
      "Wind_Direction": 348,
      "Wind_Speed_kt": 0.3
    },
    {
      "Pressure_mb": 442.5,
      "Altitude_m": 6624,
      "Temp_c": -24.6,
      "Dewpoint_c": -31.8,
      "Wind_Direction": 348,
      "Wind_Speed_kt": 0.3
    },
    {
      "Pressure_mb": 442.2,
      "Altitude_m": 6628,
      "Temp_c": -24.6,
      "Dewpoint_c": -31.8,
      "Wind_Direction": 348,
      "Wind_Speed_kt": 0.4
    },
    {
      "Pressure_mb": 442,
      "Altitude_m": 6632,
      "Temp_c": -24.6,
      "Dewpoint_c": -31.9,
      "Wind_Direction": 348,
      "Wind_Speed_kt": 0.4
    },
    {
      "Pressure_mb": 441.7,
      "Altitude_m": 6637,
      "Temp_c": -24.7,
      "Dewpoint_c": -31.9,
      "Wind_Direction": 348,
      "Wind_Speed_kt": 0.4
    },
    {
      "Pressure_mb": 441.4,
      "Altitude_m": 6641,
      "Temp_c": -24.7,
      "Dewpoint_c": -31.9,
      "Wind_Direction": 348,
      "Wind_Speed_kt": 0.5
    },
    {
      "Pressure_mb": 441.2,
      "Altitude_m": 6646,
      "Temp_c": -24.7,
      "Dewpoint_c": -32,
      "Wind_Direction": 348,
      "Wind_Speed_kt": 0.5
    },
    {
      "Pressure_mb": 440.9,
      "Altitude_m": 6650,
      "Temp_c": -24.8,
      "Dewpoint_c": -32,
      "Wind_Direction": 348,
      "Wind_Speed_kt": 0.6
    },
    {
      "Pressure_mb": 440.7,
      "Altitude_m": 6654,
      "Temp_c": -24.8,
      "Dewpoint_c": -32.1,
      "Wind_Direction": 348,
      "Wind_Speed_kt": 0.6
    },
    {
      "Pressure_mb": 440.4,
      "Altitude_m": 6658,
      "Temp_c": -24.8,
      "Dewpoint_c": -32.1,
      "Wind_Direction": 348,
      "Wind_Speed_kt": 0.6
    },
    {
      "Pressure_mb": 440.2,
      "Altitude_m": 6662,
      "Temp_c": -24.8,
      "Dewpoint_c": -32.1,
      "Wind_Direction": 348,
      "Wind_Speed_kt": 0.6
    },
    {
      "Pressure_mb": 439.9,
      "Altitude_m": 6666,
      "Temp_c": -24.9,
      "Dewpoint_c": -32.2,
      "Wind_Direction": 348,
      "Wind_Speed_kt": 0.7
    },
    {
      "Pressure_mb": 439.7,
      "Altitude_m": 6670,
      "Temp_c": -24.9,
      "Dewpoint_c": -32.2,
      "Wind_Direction": 348,
      "Wind_Speed_kt": 0.7
    },
    {
      "Pressure_mb": 439.5,
      "Altitude_m": 6674,
      "Temp_c": -24.9,
      "Dewpoint_c": -32.3,
      "Wind_Direction": 348,
      "Wind_Speed_kt": 0.7
    },
    {
      "Pressure_mb": 439.2,
      "Altitude_m": 6678,
      "Temp_c": -24.9,
      "Dewpoint_c": -32.3,
      "Wind_Direction": 348,
      "Wind_Speed_kt": 0.8
    },
    {
      "Pressure_mb": 439,
      "Altitude_m": 6682,
      "Temp_c": -25,
      "Dewpoint_c": -32.3,
      "Wind_Direction": 348,
      "Wind_Speed_kt": 0.8
    },
    {
      "Pressure_mb": 438.7,
      "Altitude_m": 6686,
      "Temp_c": -25,
      "Dewpoint_c": -32.4,
      "Wind_Direction": 348,
      "Wind_Speed_kt": 0.8
    },
    {
      "Pressure_mb": 438.5,
      "Altitude_m": 6690,
      "Temp_c": -25,
      "Dewpoint_c": -32.4,
      "Wind_Direction": 348,
      "Wind_Speed_kt": 0.8
    },
    {
      "Pressure_mb": 438.3,
      "Altitude_m": 6694,
      "Temp_c": -25.1,
      "Dewpoint_c": -32.5,
      "Wind_Direction": 348,
      "Wind_Speed_kt": 0.9
    },
    {
      "Pressure_mb": 438,
      "Altitude_m": 6698,
      "Temp_c": -25.1,
      "Dewpoint_c": -32.5,
      "Wind_Direction": 348,
      "Wind_Speed_kt": 0.9
    },
    {
      "Pressure_mb": 437.8,
      "Altitude_m": 6702,
      "Temp_c": -25.1,
      "Dewpoint_c": -32.5,
      "Wind_Direction": 348,
      "Wind_Speed_kt": 0.9
    },
    {
      "Pressure_mb": 437.6,
      "Altitude_m": 6705,
      "Temp_c": -25.1,
      "Dewpoint_c": -32.6,
      "Wind_Direction": 348,
      "Wind_Speed_kt": 1
    },
    {
      "Pressure_mb": 437.3,
      "Altitude_m": 6709,
      "Temp_c": -25.2,
      "Dewpoint_c": -32.6,
      "Wind_Direction": 348,
      "Wind_Speed_kt": 1
    },
    {
      "Pressure_mb": 437.1,
      "Altitude_m": 6713,
      "Temp_c": -25.2,
      "Dewpoint_c": -32.7,
      "Wind_Direction": 348,
      "Wind_Speed_kt": 1
    },
    {
      "Pressure_mb": 436.9,
      "Altitude_m": 6717,
      "Temp_c": -25.2,
      "Dewpoint_c": -32.7,
      "Wind_Direction": 348,
      "Wind_Speed_kt": 1
    },
    {
      "Pressure_mb": 436.6,
      "Altitude_m": 6721,
      "Temp_c": -25.2,
      "Dewpoint_c": -32.8,
      "Wind_Direction": 348,
      "Wind_Speed_kt": 1.1
    },
    {
      "Pressure_mb": 436.4,
      "Altitude_m": 6725,
      "Temp_c": -25.3,
      "Dewpoint_c": -32.8,
      "Wind_Direction": 349,
      "Wind_Speed_kt": 1.1
    },
    {
      "Pressure_mb": 436.2,
      "Altitude_m": 6729,
      "Temp_c": -25.3,
      "Dewpoint_c": -32.8,
      "Wind_Direction": 349,
      "Wind_Speed_kt": 1.1
    },
    {
      "Pressure_mb": 435.9,
      "Altitude_m": 6733,
      "Temp_c": -25.3,
      "Dewpoint_c": -32.9,
      "Wind_Direction": 349,
      "Wind_Speed_kt": 1.1
    },
    {
      "Pressure_mb": 435.7,
      "Altitude_m": 6737,
      "Temp_c": -25.3,
      "Dewpoint_c": -32.9,
      "Wind_Direction": 349,
      "Wind_Speed_kt": 1.1
    },
    {
      "Pressure_mb": 435.4,
      "Altitude_m": 6741,
      "Temp_c": -25.4,
      "Dewpoint_c": -33,
      "Wind_Direction": 349,
      "Wind_Speed_kt": 1
    },
    {
      "Pressure_mb": 435.2,
      "Altitude_m": 6745,
      "Temp_c": -25.4,
      "Dewpoint_c": -33,
      "Wind_Direction": 349,
      "Wind_Speed_kt": 1
    },
    {
      "Pressure_mb": 435,
      "Altitude_m": 6749,
      "Temp_c": -25.4,
      "Dewpoint_c": -33.1,
      "Wind_Direction": 349,
      "Wind_Speed_kt": 1
    },
    {
      "Pressure_mb": 434.7,
      "Altitude_m": 6753,
      "Temp_c": -25.5,
      "Dewpoint_c": -33.1,
      "Wind_Direction": 349,
      "Wind_Speed_kt": 0.9
    },
    {
      "Pressure_mb": 434.5,
      "Altitude_m": 6757,
      "Temp_c": -25.5,
      "Dewpoint_c": -33.2,
      "Wind_Direction": 349,
      "Wind_Speed_kt": 0.9
    },
    {
      "Pressure_mb": 434.2,
      "Altitude_m": 6761,
      "Temp_c": -25.5,
      "Dewpoint_c": -33.2,
      "Wind_Direction": 349,
      "Wind_Speed_kt": 0.8
    },
    {
      "Pressure_mb": 434,
      "Altitude_m": 6765,
      "Temp_c": -25.6,
      "Dewpoint_c": -33.3,
      "Wind_Direction": 349,
      "Wind_Speed_kt": 0.8
    },
    {
      "Pressure_mb": 433.8,
      "Altitude_m": 6769,
      "Temp_c": -25.6,
      "Dewpoint_c": -33.3,
      "Wind_Direction": 349,
      "Wind_Speed_kt": 0.8
    },
    {
      "Pressure_mb": 433.5,
      "Altitude_m": 6773,
      "Temp_c": -25.6,
      "Dewpoint_c": -33.4,
      "Wind_Direction": 349,
      "Wind_Speed_kt": 0.7
    },
    {
      "Pressure_mb": 433.3,
      "Altitude_m": 6777,
      "Temp_c": -25.7,
      "Dewpoint_c": -33.4,
      "Wind_Direction": 349,
      "Wind_Speed_kt": 0.7
    },
    {
      "Pressure_mb": 433,
      "Altitude_m": 6781,
      "Temp_c": -25.7,
      "Dewpoint_c": -33.5,
      "Wind_Direction": 349,
      "Wind_Speed_kt": 0.7
    },
    {
      "Pressure_mb": 432.8,
      "Altitude_m": 6785,
      "Temp_c": -25.7,
      "Dewpoint_c": -33.5,
      "Wind_Direction": 349,
      "Wind_Speed_kt": 0.6
    },
    {
      "Pressure_mb": 432.6,
      "Altitude_m": 6789,
      "Temp_c": -25.8,
      "Dewpoint_c": -33.5,
      "Wind_Direction": 349,
      "Wind_Speed_kt": 0.6
    },
    {
      "Pressure_mb": 432.3,
      "Altitude_m": 6793,
      "Temp_c": -25.8,
      "Dewpoint_c": -33.6,
      "Wind_Direction": 349,
      "Wind_Speed_kt": 0.6
    },
    {
      "Pressure_mb": 432.1,
      "Altitude_m": 6797,
      "Temp_c": -25.8,
      "Dewpoint_c": -33.6,
      "Wind_Direction": 349,
      "Wind_Speed_kt": 0.5
    },
    {
      "Pressure_mb": 431.9,
      "Altitude_m": 6801,
      "Temp_c": -25.8,
      "Dewpoint_c": -33.7,
      "Wind_Direction": 349,
      "Wind_Speed_kt": 0.5
    },
    {
      "Pressure_mb": 431.6,
      "Altitude_m": 6805,
      "Temp_c": -25.9,
      "Dewpoint_c": -33.7,
      "Wind_Direction": 349,
      "Wind_Speed_kt": 0.5
    },
    {
      "Pressure_mb": 431.4,
      "Altitude_m": 6809,
      "Temp_c": -25.9,
      "Dewpoint_c": -33.7,
      "Wind_Direction": 349,
      "Wind_Speed_kt": 0.4
    },
    {
      "Pressure_mb": 431.2,
      "Altitude_m": 6812,
      "Temp_c": -25.9,
      "Dewpoint_c": -33.8,
      "Wind_Direction": 349,
      "Wind_Speed_kt": 0.4
    },
    {
      "Pressure_mb": 430.9,
      "Altitude_m": 6816,
      "Temp_c": -26,
      "Dewpoint_c": -33.8,
      "Wind_Direction": 349,
      "Wind_Speed_kt": 0.4
    },
    {
      "Pressure_mb": 430.7,
      "Altitude_m": 6820,
      "Temp_c": -26,
      "Dewpoint_c": -33.8,
      "Wind_Direction": 349,
      "Wind_Speed_kt": 0.3
    },
    {
      "Pressure_mb": 430.5,
      "Altitude_m": 6823,
      "Temp_c": -26,
      "Dewpoint_c": -33.9,
      "Wind_Direction": 349,
      "Wind_Speed_kt": 0.3
    },
    {
      "Pressure_mb": 430.3,
      "Altitude_m": 6827,
      "Temp_c": -26.1,
      "Dewpoint_c": -33.9,
      "Wind_Direction": 349,
      "Wind_Speed_kt": 0.3
    },
    {
      "Pressure_mb": 430.1,
      "Altitude_m": 6831,
      "Temp_c": -26.1,
      "Dewpoint_c": -33.9,
      "Wind_Direction": 350,
      "Wind_Speed_kt": 0.2
    },
    {
      "Pressure_mb": 429.9,
      "Altitude_m": 6834,
      "Temp_c": -26.1,
      "Dewpoint_c": -34,
      "Wind_Direction": 350,
      "Wind_Speed_kt": 0.2
    },
    {
      "Pressure_mb": 429.6,
      "Altitude_m": 6838,
      "Temp_c": -26.2,
      "Dewpoint_c": -34,
      "Wind_Direction": 350,
      "Wind_Speed_kt": 0.2
    },
    {
      "Pressure_mb": 429.4,
      "Altitude_m": 6842,
      "Temp_c": -26.2,
      "Dewpoint_c": -34,
      "Wind_Direction": 350,
      "Wind_Speed_kt": 0.1
    },
    {
      "Pressure_mb": 429.2,
      "Altitude_m": 6845,
      "Temp_c": -26.2,
      "Dewpoint_c": -34.1,
      "Wind_Direction": 350,
      "Wind_Speed_kt": 0.1
    },
    {
      "Pressure_mb": 429,
      "Altitude_m": 6849,
      "Temp_c": -26.2,
      "Dewpoint_c": -34.1,
      "Wind_Direction": 350,
      "Wind_Speed_kt": 0.1
    },
    {
      "Pressure_mb": 428.8,
      "Altitude_m": 6853,
      "Temp_c": -26.3,
      "Dewpoint_c": -34.1,
      "Wind_Direction": 350,
      "Wind_Speed_kt": 0
    },
    {
      "Pressure_mb": 428.5,
      "Altitude_m": 6857,
      "Temp_c": -26.3,
      "Dewpoint_c": -34.2,
      "Wind_Direction": 350,
      "Wind_Speed_kt": 0
    },
    {
      "Pressure_mb": 428.3,
      "Altitude_m": 6860,
      "Temp_c": -26.3,
      "Dewpoint_c": -34.2,
      "Wind_Direction": 350,
      "Wind_Speed_kt": 0
    },
    {
      "Pressure_mb": 428.1,
      "Altitude_m": 6864,
      "Temp_c": -26.4,
      "Dewpoint_c": -34.3,
      "Wind_Direction": 350,
      "Wind_Speed_kt": 9.9
    },
    {
      "Pressure_mb": 427.8,
      "Altitude_m": 6868,
      "Temp_c": -26.4,
      "Dewpoint_c": -34.3,
      "Wind_Direction": 350,
      "Wind_Speed_kt": 9.9
    },
    {
      "Pressure_mb": 427.6,
      "Altitude_m": 6872,
      "Temp_c": -26.4,
      "Dewpoint_c": -34.3,
      "Wind_Direction": 350,
      "Wind_Speed_kt": 9.9
    },
    {
      "Pressure_mb": 427.3,
      "Altitude_m": 6876,
      "Temp_c": -26.5,
      "Dewpoint_c": -34.4,
      "Wind_Direction": 350,
      "Wind_Speed_kt": 9.9
    },
    {
      "Pressure_mb": 427.1,
      "Altitude_m": 6880,
      "Temp_c": -26.5,
      "Dewpoint_c": -34.4,
      "Wind_Direction": 350,
      "Wind_Speed_kt": 9.8
    },
    {
      "Pressure_mb": 426.9,
      "Altitude_m": 6885,
      "Temp_c": -26.5,
      "Dewpoint_c": -34.4,
      "Wind_Direction": 350,
      "Wind_Speed_kt": 9.8
    },
    {
      "Pressure_mb": 426.6,
      "Altitude_m": 6889,
      "Temp_c": -26.6,
      "Dewpoint_c": -34.5,
      "Wind_Direction": 351,
      "Wind_Speed_kt": 9.8
    },
    {
      "Pressure_mb": 426.3,
      "Altitude_m": 6893,
      "Temp_c": -26.6,
      "Dewpoint_c": -34.5,
      "Wind_Direction": 351,
      "Wind_Speed_kt": 9.9
    },
    {
      "Pressure_mb": 426.1,
      "Altitude_m": 6898,
      "Temp_c": -26.6,
      "Dewpoint_c": -34.6,
      "Wind_Direction": 351,
      "Wind_Speed_kt": 9.9
    },
    {
      "Pressure_mb": 425.8,
      "Altitude_m": 6902,
      "Temp_c": -26.7,
      "Dewpoint_c": -34.6,
      "Wind_Direction": 351,
      "Wind_Speed_kt": 9.9
    },
    {
      "Pressure_mb": 425.5,
      "Altitude_m": 6907,
      "Temp_c": -26.7,
      "Dewpoint_c": -34.7,
      "Wind_Direction": 351,
      "Wind_Speed_kt": 0
    },
    {
      "Pressure_mb": 425.3,
      "Altitude_m": 6912,
      "Temp_c": -26.7,
      "Dewpoint_c": -34.7,
      "Wind_Direction": 351,
      "Wind_Speed_kt": 0
    },
    {
      "Pressure_mb": 425,
      "Altitude_m": 6917,
      "Temp_c": -26.8,
      "Dewpoint_c": -34.7,
      "Wind_Direction": 351,
      "Wind_Speed_kt": 0.1
    },
    {
      "Pressure_mb": 424.8,
      "Altitude_m": 6921,
      "Temp_c": -26.8,
      "Dewpoint_c": -34.8,
      "Wind_Direction": 351,
      "Wind_Speed_kt": 0.1
    },
    {
      "Pressure_mb": 424.5,
      "Altitude_m": 6925,
      "Temp_c": -26.8,
      "Dewpoint_c": -34.8,
      "Wind_Direction": 351,
      "Wind_Speed_kt": 0.1
    },
    {
      "Pressure_mb": 424.3,
      "Altitude_m": 6929,
      "Temp_c": -26.9,
      "Dewpoint_c": -34.9,
      "Wind_Direction": 351,
      "Wind_Speed_kt": 0.2
    },
    {
      "Pressure_mb": 424,
      "Altitude_m": 6933,
      "Temp_c": -26.9,
      "Dewpoint_c": -34.9,
      "Wind_Direction": 351,
      "Wind_Speed_kt": 0.2
    },
    {
      "Pressure_mb": 423.8,
      "Altitude_m": 6937,
      "Temp_c": -26.9,
      "Dewpoint_c": -35,
      "Wind_Direction": 351,
      "Wind_Speed_kt": 0.3
    },
    {
      "Pressure_mb": 423.6,
      "Altitude_m": 6940,
      "Temp_c": -27,
      "Dewpoint_c": -35,
      "Wind_Direction": 352,
      "Wind_Speed_kt": 0.3
    },
    {
      "Pressure_mb": 423.3,
      "Altitude_m": 6944,
      "Temp_c": -27,
      "Dewpoint_c": -35.1,
      "Wind_Direction": 352,
      "Wind_Speed_kt": 0.3
    },
    {
      "Pressure_mb": 423.1,
      "Altitude_m": 6949,
      "Temp_c": -27.1,
      "Dewpoint_c": -35.1,
      "Wind_Direction": 352,
      "Wind_Speed_kt": 0.4
    },
    {
      "Pressure_mb": 422.9,
      "Altitude_m": 6953,
      "Temp_c": -27.1,
      "Dewpoint_c": -35.2,
      "Wind_Direction": 352,
      "Wind_Speed_kt": 0.4
    },
    {
      "Pressure_mb": 422.6,
      "Altitude_m": 6957,
      "Temp_c": -27.1,
      "Dewpoint_c": -35.2,
      "Wind_Direction": 352,
      "Wind_Speed_kt": 0.5
    },
    {
      "Pressure_mb": 422.4,
      "Altitude_m": 6961,
      "Temp_c": -27.1,
      "Dewpoint_c": -35.3,
      "Wind_Direction": 352,
      "Wind_Speed_kt": 0.5
    },
    {
      "Pressure_mb": 422.1,
      "Altitude_m": 6965,
      "Temp_c": -27.2,
      "Dewpoint_c": -35.3,
      "Wind_Direction": 352,
      "Wind_Speed_kt": 0.6
    },
    {
      "Pressure_mb": 421.9,
      "Altitude_m": 6969,
      "Temp_c": -27.2,
      "Dewpoint_c": -35.4,
      "Wind_Direction": 352,
      "Wind_Speed_kt": 0.6
    },
    {
      "Pressure_mb": 421.7,
      "Altitude_m": 6973,
      "Temp_c": -27.2,
      "Dewpoint_c": -35.5,
      "Wind_Direction": 352,
      "Wind_Speed_kt": 0.6
    },
    {
      "Pressure_mb": 421.4,
      "Altitude_m": 6977,
      "Temp_c": -27.3,
      "Dewpoint_c": -35.5,
      "Wind_Direction": 352,
      "Wind_Speed_kt": 0.6
    },
    {
      "Pressure_mb": 421.2,
      "Altitude_m": 6981,
      "Temp_c": -27.3,
      "Dewpoint_c": -35.6,
      "Wind_Direction": 352,
      "Wind_Speed_kt": 0.7
    },
    {
      "Pressure_mb": 421,
      "Altitude_m": 6985,
      "Temp_c": -27.3,
      "Dewpoint_c": -35.6,
      "Wind_Direction": 352,
      "Wind_Speed_kt": 0.7
    },
    {
      "Pressure_mb": 420.8,
      "Altitude_m": 6989,
      "Temp_c": -27.4,
      "Dewpoint_c": -35.7,
      "Wind_Direction": 352,
      "Wind_Speed_kt": 0.7
    },
    {
      "Pressure_mb": 420.5,
      "Altitude_m": 6992,
      "Temp_c": -27.4,
      "Dewpoint_c": -35.8,
      "Wind_Direction": 352,
      "Wind_Speed_kt": 0.7
    },
    {
      "Pressure_mb": 420.3,
      "Altitude_m": 6996,
      "Temp_c": -27.4,
      "Dewpoint_c": -35.8,
      "Wind_Direction": 352,
      "Wind_Speed_kt": 0.7
    },
    {
      "Pressure_mb": 420.1,
      "Altitude_m": 7000,
      "Temp_c": -27.5,
      "Dewpoint_c": -35.9,
      "Wind_Direction": 352,
      "Wind_Speed_kt": 0.8
    },
    {
      "Pressure_mb": 419.9,
      "Altitude_m": 7004,
      "Temp_c": -27.5,
      "Dewpoint_c": -35.9,
      "Wind_Direction": 352,
      "Wind_Speed_kt": 0.8
    },
    {
      "Pressure_mb": 419.6,
      "Altitude_m": 7008,
      "Temp_c": -27.5,
      "Dewpoint_c": -36,
      "Wind_Direction": 352,
      "Wind_Speed_kt": 0.8
    },
    {
      "Pressure_mb": 419.4,
      "Altitude_m": 7012,
      "Temp_c": -27.5,
      "Dewpoint_c": -36.1,
      "Wind_Direction": 352,
      "Wind_Speed_kt": 0.8
    },
    {
      "Pressure_mb": 419.2,
      "Altitude_m": 7016,
      "Temp_c": -27.5,
      "Dewpoint_c": -36.1,
      "Wind_Direction": 352,
      "Wind_Speed_kt": 0.9
    },
    {
      "Pressure_mb": 419,
      "Altitude_m": 7020,
      "Temp_c": -27.5,
      "Dewpoint_c": -36.2,
      "Wind_Direction": 352,
      "Wind_Speed_kt": 0.9
    },
    {
      "Pressure_mb": 418.7,
      "Altitude_m": 7023,
      "Temp_c": -27.5,
      "Dewpoint_c": -36.3,
      "Wind_Direction": 352,
      "Wind_Speed_kt": 0.9
    },
    {
      "Pressure_mb": 418.5,
      "Altitude_m": 7027,
      "Temp_c": -27.5,
      "Dewpoint_c": -36.3,
      "Wind_Direction": 352,
      "Wind_Speed_kt": 0.9
    },
    {
      "Pressure_mb": 418.3,
      "Altitude_m": 7031,
      "Temp_c": -27.5,
      "Dewpoint_c": -36.4,
      "Wind_Direction": 352,
      "Wind_Speed_kt": 0.9
    },
    {
      "Pressure_mb": 418,
      "Altitude_m": 7035,
      "Temp_c": -27.6,
      "Dewpoint_c": -36.5,
      "Wind_Direction": 352,
      "Wind_Speed_kt": 1
    },
    {
      "Pressure_mb": 417.8,
      "Altitude_m": 7039,
      "Temp_c": -27.6,
      "Dewpoint_c": -36.5,
      "Wind_Direction": 352,
      "Wind_Speed_kt": 1
    },
    {
      "Pressure_mb": 417.6,
      "Altitude_m": 7043,
      "Temp_c": -27.6,
      "Dewpoint_c": -36.6,
      "Wind_Direction": 352,
      "Wind_Speed_kt": 1
    },
    {
      "Pressure_mb": 417.4,
      "Altitude_m": 7047,
      "Temp_c": -27.6,
      "Dewpoint_c": -36.7,
      "Wind_Direction": 352,
      "Wind_Speed_kt": 1
    },
    {
      "Pressure_mb": 417.1,
      "Altitude_m": 7051,
      "Temp_c": -27.6,
      "Dewpoint_c": -36.8,
      "Wind_Direction": 352,
      "Wind_Speed_kt": 1.1
    },
    {
      "Pressure_mb": 416.9,
      "Altitude_m": 7055,
      "Temp_c": -27.6,
      "Dewpoint_c": -36.8,
      "Wind_Direction": 352,
      "Wind_Speed_kt": 1.1
    },
    {
      "Pressure_mb": 416.7,
      "Altitude_m": 7059,
      "Temp_c": -27.6,
      "Dewpoint_c": -36.9,
      "Wind_Direction": 352,
      "Wind_Speed_kt": 1.1
    },
    {
      "Pressure_mb": 416.5,
      "Altitude_m": 7062,
      "Temp_c": -27.6,
      "Dewpoint_c": -37,
      "Wind_Direction": 352,
      "Wind_Speed_kt": 1.1
    },
    {
      "Pressure_mb": 416.2,
      "Altitude_m": 7066,
      "Temp_c": -27.6,
      "Dewpoint_c": -37,
      "Wind_Direction": 351,
      "Wind_Speed_kt": 1.2
    },
    {
      "Pressure_mb": 416,
      "Altitude_m": 7070,
      "Temp_c": -27.6,
      "Dewpoint_c": -37.1,
      "Wind_Direction": 351,
      "Wind_Speed_kt": 1.2
    },
    {
      "Pressure_mb": 415.8,
      "Altitude_m": 7074,
      "Temp_c": -27.6,
      "Dewpoint_c": -37.1,
      "Wind_Direction": 351,
      "Wind_Speed_kt": 1.2
    },
    {
      "Pressure_mb": 415.6,
      "Altitude_m": 7078,
      "Temp_c": -27.7,
      "Dewpoint_c": -37.2,
      "Wind_Direction": 351,
      "Wind_Speed_kt": 1.3
    },
    {
      "Pressure_mb": 415.3,
      "Altitude_m": 7082,
      "Temp_c": -27.7,
      "Dewpoint_c": -37.2,
      "Wind_Direction": 351,
      "Wind_Speed_kt": 1.3
    },
    {
      "Pressure_mb": 415.1,
      "Altitude_m": 7086,
      "Temp_c": -27.7,
      "Dewpoint_c": -37.3,
      "Wind_Direction": 351,
      "Wind_Speed_kt": 1.3
    },
    {
      "Pressure_mb": 414.9,
      "Altitude_m": 7089,
      "Temp_c": -27.7,
      "Dewpoint_c": -37.3,
      "Wind_Direction": 351,
      "Wind_Speed_kt": 1.4
    },
    {
      "Pressure_mb": 414.7,
      "Altitude_m": 7093,
      "Temp_c": -27.7,
      "Dewpoint_c": -37.4,
      "Wind_Direction": 351,
      "Wind_Speed_kt": 1.4
    },
    {
      "Pressure_mb": 414.4,
      "Altitude_m": 7097,
      "Temp_c": -27.7,
      "Dewpoint_c": -37.4,
      "Wind_Direction": 351,
      "Wind_Speed_kt": 1.4
    },
    {
      "Pressure_mb": 414.2,
      "Altitude_m": 7101,
      "Temp_c": -27.7,
      "Dewpoint_c": -37.5,
      "Wind_Direction": 351,
      "Wind_Speed_kt": 1.5
    },
    {
      "Pressure_mb": 414,
      "Altitude_m": 7105,
      "Temp_c": -27.7,
      "Dewpoint_c": -37.5,
      "Wind_Direction": 350,
      "Wind_Speed_kt": 1.5
    },
    {
      "Pressure_mb": 413.7,
      "Altitude_m": 7109,
      "Temp_c": -27.7,
      "Dewpoint_c": -37.6,
      "Wind_Direction": 350,
      "Wind_Speed_kt": 1.5
    },
    {
      "Pressure_mb": 413.5,
      "Altitude_m": 7113,
      "Temp_c": -27.8,
      "Dewpoint_c": -37.7,
      "Wind_Direction": 350,
      "Wind_Speed_kt": 1.6
    },
    {
      "Pressure_mb": 413.3,
      "Altitude_m": 7117,
      "Temp_c": -27.8,
      "Dewpoint_c": -37.7,
      "Wind_Direction": 350,
      "Wind_Speed_kt": 1.6
    },
    {
      "Pressure_mb": 413.1,
      "Altitude_m": 7121,
      "Temp_c": -27.8,
      "Dewpoint_c": -37.8,
      "Wind_Direction": 350,
      "Wind_Speed_kt": 1.6
    },
    {
      "Pressure_mb": 412.8,
      "Altitude_m": 7125,
      "Temp_c": -27.8,
      "Dewpoint_c": -37.8,
      "Wind_Direction": 350,
      "Wind_Speed_kt": 1.7
    },
    {
      "Pressure_mb": 412.6,
      "Altitude_m": 7129,
      "Temp_c": -27.8,
      "Dewpoint_c": -37.9,
      "Wind_Direction": 350,
      "Wind_Speed_kt": 1.6
    },
    {
      "Pressure_mb": 412.4,
      "Altitude_m": 7134,
      "Temp_c": -27.8,
      "Dewpoint_c": -38,
      "Wind_Direction": 350,
      "Wind_Speed_kt": 1.6
    },
    {
      "Pressure_mb": 412.1,
      "Altitude_m": 7138,
      "Temp_c": -27.9,
      "Dewpoint_c": -38,
      "Wind_Direction": 350,
      "Wind_Speed_kt": 1.5
    },
    {
      "Pressure_mb": 411.9,
      "Altitude_m": 7142,
      "Temp_c": -27.9,
      "Dewpoint_c": -38.1,
      "Wind_Direction": 350,
      "Wind_Speed_kt": 1.5
    },
    {
      "Pressure_mb": 411.7,
      "Altitude_m": 7145,
      "Temp_c": -27.9,
      "Dewpoint_c": -38.1,
      "Wind_Direction": 350,
      "Wind_Speed_kt": 1.5
    },
    {
      "Pressure_mb": 411.5,
      "Altitude_m": 7149,
      "Temp_c": -27.9,
      "Dewpoint_c": -38.2,
      "Wind_Direction": 350,
      "Wind_Speed_kt": 1.4
    },
    {
      "Pressure_mb": 411.2,
      "Altitude_m": 7153,
      "Temp_c": -27.9,
      "Dewpoint_c": -38.2,
      "Wind_Direction": 349,
      "Wind_Speed_kt": 1.4
    },
    {
      "Pressure_mb": 411,
      "Altitude_m": 7157,
      "Temp_c": -28,
      "Dewpoint_c": -38.3,
      "Wind_Direction": 349,
      "Wind_Speed_kt": 1.3
    },
    {
      "Pressure_mb": 410.8,
      "Altitude_m": 7161,
      "Temp_c": -28,
      "Dewpoint_c": -38.4,
      "Wind_Direction": 349,
      "Wind_Speed_kt": 1.3
    },
    {
      "Pressure_mb": 410.6,
      "Altitude_m": 7165,
      "Temp_c": -28,
      "Dewpoint_c": -38.4,
      "Wind_Direction": 349,
      "Wind_Speed_kt": 1.3
    },
    {
      "Pressure_mb": 410.4,
      "Altitude_m": 7168,
      "Temp_c": -28,
      "Dewpoint_c": -38.5,
      "Wind_Direction": 349,
      "Wind_Speed_kt": 1.2
    },
    {
      "Pressure_mb": 410.2,
      "Altitude_m": 7172,
      "Temp_c": -28,
      "Dewpoint_c": -38.6,
      "Wind_Direction": 349,
      "Wind_Speed_kt": 1.2
    },
    {
      "Pressure_mb": 409.9,
      "Altitude_m": 7176,
      "Temp_c": -28.1,
      "Dewpoint_c": -38.6,
      "Wind_Direction": 349,
      "Wind_Speed_kt": 1.1
    },
    {
      "Pressure_mb": 409.7,
      "Altitude_m": 7179,
      "Temp_c": -28.1,
      "Dewpoint_c": -38.7,
      "Wind_Direction": 349,
      "Wind_Speed_kt": 1.1
    },
    {
      "Pressure_mb": 409.5,
      "Altitude_m": 7183,
      "Temp_c": -28.1,
      "Dewpoint_c": -38.7,
      "Wind_Direction": 349,
      "Wind_Speed_kt": 1.1
    },
    {
      "Pressure_mb": 409.3,
      "Altitude_m": 7187,
      "Temp_c": -28.1,
      "Dewpoint_c": -38.8,
      "Wind_Direction": 349,
      "Wind_Speed_kt": 1
    },
    {
      "Pressure_mb": 409.1,
      "Altitude_m": 7191,
      "Temp_c": -28.2,
      "Dewpoint_c": -38.9,
      "Wind_Direction": 349,
      "Wind_Speed_kt": 1
    },
    {
      "Pressure_mb": 408.9,
      "Altitude_m": 7194,
      "Temp_c": -28.2,
      "Dewpoint_c": -38.9,
      "Wind_Direction": 349,
      "Wind_Speed_kt": 1
    },
    {
      "Pressure_mb": 408.7,
      "Altitude_m": 7198,
      "Temp_c": -28.2,
      "Dewpoint_c": -39,
      "Wind_Direction": 349,
      "Wind_Speed_kt": 0.9
    },
    {
      "Pressure_mb": 408.5,
      "Altitude_m": 7202,
      "Temp_c": -28.2,
      "Dewpoint_c": -39.1,
      "Wind_Direction": 348,
      "Wind_Speed_kt": 0.9
    },
    {
      "Pressure_mb": 408.2,
      "Altitude_m": 7206,
      "Temp_c": -28.2,
      "Dewpoint_c": -39.1,
      "Wind_Direction": 348,
      "Wind_Speed_kt": 0.8
    },
    {
      "Pressure_mb": 408,
      "Altitude_m": 7209,
      "Temp_c": -28.3,
      "Dewpoint_c": -39.2,
      "Wind_Direction": 349,
      "Wind_Speed_kt": 0.8
    },
    {
      "Pressure_mb": 407.8,
      "Altitude_m": 7213,
      "Temp_c": -28.3,
      "Dewpoint_c": -39.3,
      "Wind_Direction": 349,
      "Wind_Speed_kt": 0.8
    },
    {
      "Pressure_mb": 407.6,
      "Altitude_m": 7217,
      "Temp_c": -28.3,
      "Dewpoint_c": -39.3,
      "Wind_Direction": 349,
      "Wind_Speed_kt": 0.8
    },
    {
      "Pressure_mb": 407.4,
      "Altitude_m": 7221,
      "Temp_c": -28.3,
      "Dewpoint_c": -39.4,
      "Wind_Direction": 349,
      "Wind_Speed_kt": 0.8
    },
    {
      "Pressure_mb": 407.2,
      "Altitude_m": 7224,
      "Temp_c": -28.4,
      "Dewpoint_c": -39.5,
      "Wind_Direction": 349,
      "Wind_Speed_kt": 0.7
    },
    {
      "Pressure_mb": 407,
      "Altitude_m": 7228,
      "Temp_c": -28.4,
      "Dewpoint_c": -39.7,
      "Wind_Direction": 349,
      "Wind_Speed_kt": 0.7
    },
    {
      "Pressure_mb": 406.7,
      "Altitude_m": 7232,
      "Temp_c": -28.4,
      "Dewpoint_c": -39.8,
      "Wind_Direction": 349,
      "Wind_Speed_kt": 0.7
    },
    {
      "Pressure_mb": 406.5,
      "Altitude_m": 7236,
      "Temp_c": -28.4,
      "Dewpoint_c": -39.9,
      "Wind_Direction": 349,
      "Wind_Speed_kt": 0.7
    },
    {
      "Pressure_mb": 406.3,
      "Altitude_m": 7239,
      "Temp_c": -28.5,
      "Dewpoint_c": -40,
      "Wind_Direction": 349,
      "Wind_Speed_kt": 0.6
    },
    {
      "Pressure_mb": 406.1,
      "Altitude_m": 7243,
      "Temp_c": -28.5,
      "Dewpoint_c": -40.1,
      "Wind_Direction": 349,
      "Wind_Speed_kt": 0.6
    },
    {
      "Pressure_mb": 405.9,
      "Altitude_m": 7247,
      "Temp_c": -28.5,
      "Dewpoint_c": -40.2,
      "Wind_Direction": 349,
      "Wind_Speed_kt": 0.6
    },
    {
      "Pressure_mb": 405.7,
      "Altitude_m": 7251,
      "Temp_c": -28.5,
      "Dewpoint_c": -40.3,
      "Wind_Direction": 349,
      "Wind_Speed_kt": 0.6
    },
    {
      "Pressure_mb": 405.4,
      "Altitude_m": 7255,
      "Temp_c": -28.5,
      "Dewpoint_c": -40.4,
      "Wind_Direction": 349,
      "Wind_Speed_kt": 0.5
    },
    {
      "Pressure_mb": 405.2,
      "Altitude_m": 7259,
      "Temp_c": -28.6,
      "Dewpoint_c": -40.5,
      "Wind_Direction": 349,
      "Wind_Speed_kt": 0.5
    },
    {
      "Pressure_mb": 405,
      "Altitude_m": 7262,
      "Temp_c": -28.6,
      "Dewpoint_c": -40.6,
      "Wind_Direction": 349,
      "Wind_Speed_kt": 0.5
    },
    {
      "Pressure_mb": 404.8,
      "Altitude_m": 7266,
      "Temp_c": -28.6,
      "Dewpoint_c": -40.7,
      "Wind_Direction": 349,
      "Wind_Speed_kt": 0.5
    },
    {
      "Pressure_mb": 404.6,
      "Altitude_m": 7270,
      "Temp_c": -28.6,
      "Dewpoint_c": -40.8,
      "Wind_Direction": 349,
      "Wind_Speed_kt": 0.4
    },
    {
      "Pressure_mb": 404.3,
      "Altitude_m": 7274,
      "Temp_c": -28.7,
      "Dewpoint_c": -40.9,
      "Wind_Direction": 349,
      "Wind_Speed_kt": 0.4
    },
    {
      "Pressure_mb": 404.1,
      "Altitude_m": 7278,
      "Temp_c": -28.7,
      "Dewpoint_c": -41,
      "Wind_Direction": 349,
      "Wind_Speed_kt": 0.4
    },
    {
      "Pressure_mb": 403.9,
      "Altitude_m": 7282,
      "Temp_c": -28.7,
      "Dewpoint_c": -41.1,
      "Wind_Direction": 349,
      "Wind_Speed_kt": 0.4
    },
    {
      "Pressure_mb": 403.7,
      "Altitude_m": 7286,
      "Temp_c": -28.7,
      "Dewpoint_c": -41.2,
      "Wind_Direction": 349,
      "Wind_Speed_kt": 0.4
    },
    {
      "Pressure_mb": 403.5,
      "Altitude_m": 7290,
      "Temp_c": -28.8,
      "Dewpoint_c": -41.4,
      "Wind_Direction": 349,
      "Wind_Speed_kt": 0.4
    },
    {
      "Pressure_mb": 403.2,
      "Altitude_m": 7294,
      "Temp_c": -28.8,
      "Dewpoint_c": -41.5,
      "Wind_Direction": 349,
      "Wind_Speed_kt": 0.4
    },
    {
      "Pressure_mb": 403,
      "Altitude_m": 7298,
      "Temp_c": -28.8,
      "Dewpoint_c": -41.6,
      "Wind_Direction": 349,
      "Wind_Speed_kt": 0.4
    },
    {
      "Pressure_mb": 402.8,
      "Altitude_m": 7301,
      "Temp_c": -28.8,
      "Dewpoint_c": -41.7,
      "Wind_Direction": 349,
      "Wind_Speed_kt": 0.4
    },
    {
      "Pressure_mb": 402.6,
      "Altitude_m": 7305,
      "Temp_c": -28.9,
      "Dewpoint_c": -41.8,
      "Wind_Direction": 349,
      "Wind_Speed_kt": 0.4
    },
    {
      "Pressure_mb": 402.4,
      "Altitude_m": 7309,
      "Temp_c": -28.9,
      "Dewpoint_c": -41.9,
      "Wind_Direction": 349,
      "Wind_Speed_kt": 0.4
    },
    {
      "Pressure_mb": 402.2,
      "Altitude_m": 7313,
      "Temp_c": -28.9,
      "Dewpoint_c": -42,
      "Wind_Direction": 349,
      "Wind_Speed_kt": 0.4
    },
    {
      "Pressure_mb": 402,
      "Altitude_m": 7317,
      "Temp_c": -28.9,
      "Dewpoint_c": -42.1,
      "Wind_Direction": 349,
      "Wind_Speed_kt": 0.4
    },
    {
      "Pressure_mb": 401.7,
      "Altitude_m": 7321,
      "Temp_c": -29,
      "Dewpoint_c": -42.2,
      "Wind_Direction": 349,
      "Wind_Speed_kt": 0.4
    },
    {
      "Pressure_mb": 401.5,
      "Altitude_m": 7324,
      "Temp_c": -29,
      "Dewpoint_c": -42.3,
      "Wind_Direction": 349,
      "Wind_Speed_kt": 0.4
    },
    {
      "Pressure_mb": 401.3,
      "Altitude_m": 7328,
      "Temp_c": -29,
      "Dewpoint_c": -42.3,
      "Wind_Direction": 349,
      "Wind_Speed_kt": 0.4
    },
    {
      "Pressure_mb": 401.1,
      "Altitude_m": 7332,
      "Temp_c": -29,
      "Dewpoint_c": -42.4,
      "Wind_Direction": 349,
      "Wind_Speed_kt": 0.3
    },
    {
      "Pressure_mb": 400.9,
      "Altitude_m": 7336,
      "Temp_c": -29.1,
      "Dewpoint_c": -42.5,
      "Wind_Direction": 349,
      "Wind_Speed_kt": 0.3
    },
    {
      "Pressure_mb": 400.7,
      "Altitude_m": 7339,
      "Temp_c": -29.1,
      "Dewpoint_c": -42.5,
      "Wind_Direction": 349,
      "Wind_Speed_kt": 0.3
    },
    {
      "Pressure_mb": 400.5,
      "Altitude_m": 7343,
      "Temp_c": -29.1,
      "Dewpoint_c": -42.6,
      "Wind_Direction": 349,
      "Wind_Speed_kt": 0.3
    },
    {
      "Pressure_mb": 400.3,
      "Altitude_m": 7347,
      "Temp_c": -29.2,
      "Dewpoint_c": -42.7,
      "Wind_Direction": 349,
      "Wind_Speed_kt": 0.3
    },
    {
      "Pressure_mb": 400,
      "Altitude_m": 7351,
      "Temp_c": -29.2,
      "Dewpoint_c": -42.8,
      "Wind_Direction": 349,
      "Wind_Speed_kt": 0.3
    },
    {
      "Pressure_mb": 399.9,
      "Altitude_m": 7354,
      "Temp_c": -29.2,
      "Dewpoint_c": -42.8,
      "Wind_Direction": 349,
      "Wind_Speed_kt": 0.3
    },
    {
      "Pressure_mb": 399.7,
      "Altitude_m": 7357,
      "Temp_c": -29.2,
      "Dewpoint_c": -42.9,
      "Wind_Direction": 349,
      "Wind_Speed_kt": 0.3
    },
    {
      "Pressure_mb": 399.5,
      "Altitude_m": 7361,
      "Temp_c": -29.3,
      "Dewpoint_c": -42.9,
      "Wind_Direction": 349,
      "Wind_Speed_kt": 0.3
    },
    {
      "Pressure_mb": 399.3,
      "Altitude_m": 7365,
      "Temp_c": -29.3,
      "Dewpoint_c": -43,
      "Wind_Direction": 349,
      "Wind_Speed_kt": 0.3
    },
    {
      "Pressure_mb": 399,
      "Altitude_m": 7368,
      "Temp_c": -29.3,
      "Dewpoint_c": -43.1,
      "Wind_Direction": 349,
      "Wind_Speed_kt": 0.3
    },
    {
      "Pressure_mb": 398.8,
      "Altitude_m": 7372,
      "Temp_c": -29.3,
      "Dewpoint_c": -43.1,
      "Wind_Direction": 349,
      "Wind_Speed_kt": 0.3
    },
    {
      "Pressure_mb": 398.6,
      "Altitude_m": 7376,
      "Temp_c": -29.4,
      "Dewpoint_c": -43.2,
      "Wind_Direction": 349,
      "Wind_Speed_kt": 0.3
    },
    {
      "Pressure_mb": 398.4,
      "Altitude_m": 7380,
      "Temp_c": -29.4,
      "Dewpoint_c": -43.3,
      "Wind_Direction": 349,
      "Wind_Speed_kt": 0.3
    },
    {
      "Pressure_mb": 398.2,
      "Altitude_m": 7383,
      "Temp_c": -29.4,
      "Dewpoint_c": -43.3,
      "Wind_Direction": 349,
      "Wind_Speed_kt": 0.4
    },
    {
      "Pressure_mb": 398,
      "Altitude_m": 7387,
      "Temp_c": -29.4,
      "Dewpoint_c": -43.4,
      "Wind_Direction": 349,
      "Wind_Speed_kt": 0.4
    },
    {
      "Pressure_mb": 397.8,
      "Altitude_m": 7391,
      "Temp_c": -29.5,
      "Dewpoint_c": -43.4,
      "Wind_Direction": 349,
      "Wind_Speed_kt": 0.4
    },
    {
      "Pressure_mb": 397.6,
      "Altitude_m": 7395,
      "Temp_c": -29.5,
      "Dewpoint_c": -43.5,
      "Wind_Direction": 349,
      "Wind_Speed_kt": 0.4
    },
    {
      "Pressure_mb": 397.4,
      "Altitude_m": 7398,
      "Temp_c": -29.5,
      "Dewpoint_c": -43.6,
      "Wind_Direction": 349,
      "Wind_Speed_kt": 0.4
    },
    {
      "Pressure_mb": 397.2,
      "Altitude_m": 7402,
      "Temp_c": -29.6,
      "Dewpoint_c": -43.6,
      "Wind_Direction": 349,
      "Wind_Speed_kt": 0.4
    },
    {
      "Pressure_mb": 396.9,
      "Altitude_m": 7406,
      "Temp_c": -29.6,
      "Dewpoint_c": -43.7,
      "Wind_Direction": 349,
      "Wind_Speed_kt": 0.4
    },
    {
      "Pressure_mb": 396.7,
      "Altitude_m": 7410,
      "Temp_c": -29.6,
      "Dewpoint_c": -43.7,
      "Wind_Direction": 349,
      "Wind_Speed_kt": 0.4
    },
    {
      "Pressure_mb": 396.5,
      "Altitude_m": 7414,
      "Temp_c": -29.6,
      "Dewpoint_c": -43.8,
      "Wind_Direction": 349,
      "Wind_Speed_kt": 0.4
    },
    {
      "Pressure_mb": 396.3,
      "Altitude_m": 7418,
      "Temp_c": -29.7,
      "Dewpoint_c": -43.9,
      "Wind_Direction": 349,
      "Wind_Speed_kt": 0.4
    },
    {
      "Pressure_mb": 396.1,
      "Altitude_m": 7421,
      "Temp_c": -29.7,
      "Dewpoint_c": -43.9,
      "Wind_Direction": 349,
      "Wind_Speed_kt": 0.4
    },
    {
      "Pressure_mb": 395.9,
      "Altitude_m": 7425,
      "Temp_c": -29.7,
      "Dewpoint_c": -43.9,
      "Wind_Direction": 349,
      "Wind_Speed_kt": 0.4
    },
    {
      "Pressure_mb": 395.7,
      "Altitude_m": 7429,
      "Temp_c": -29.7,
      "Dewpoint_c": -44,
      "Wind_Direction": 349,
      "Wind_Speed_kt": 0.4
    },
    {
      "Pressure_mb": 395.5,
      "Altitude_m": 7433,
      "Temp_c": -29.7,
      "Dewpoint_c": -44,
      "Wind_Direction": 349,
      "Wind_Speed_kt": 0.4
    },
    {
      "Pressure_mb": 395.3,
      "Altitude_m": 7437,
      "Temp_c": -29.8,
      "Dewpoint_c": -44,
      "Wind_Direction": 348,
      "Wind_Speed_kt": 0.5
    },
    {
      "Pressure_mb": 395,
      "Altitude_m": 7440,
      "Temp_c": -29.8,
      "Dewpoint_c": -44.1,
      "Wind_Direction": 348,
      "Wind_Speed_kt": 0.5
    },
    {
      "Pressure_mb": 394.8,
      "Altitude_m": 7444,
      "Temp_c": -29.8,
      "Dewpoint_c": -44.1,
      "Wind_Direction": 348,
      "Wind_Speed_kt": 0.6
    },
    {
      "Pressure_mb": 394.6,
      "Altitude_m": 7448,
      "Temp_c": -29.8,
      "Dewpoint_c": -44.1,
      "Wind_Direction": 348,
      "Wind_Speed_kt": 0.6
    },
    {
      "Pressure_mb": 394.4,
      "Altitude_m": 7452,
      "Temp_c": -29.9,
      "Dewpoint_c": -44.2,
      "Wind_Direction": 348,
      "Wind_Speed_kt": 0.6
    },
    {
      "Pressure_mb": 394.2,
      "Altitude_m": 7456,
      "Temp_c": -29.9,
      "Dewpoint_c": -44.2,
      "Wind_Direction": 348,
      "Wind_Speed_kt": 0.7
    },
    {
      "Pressure_mb": 393.9,
      "Altitude_m": 7460,
      "Temp_c": -29.9,
      "Dewpoint_c": -44.2,
      "Wind_Direction": 348,
      "Wind_Speed_kt": 0.7
    },
    {
      "Pressure_mb": 393.7,
      "Altitude_m": 7464,
      "Temp_c": -29.9,
      "Dewpoint_c": -44.2,
      "Wind_Direction": 348,
      "Wind_Speed_kt": 0.8
    },
    {
      "Pressure_mb": 393.5,
      "Altitude_m": 7468,
      "Temp_c": -30,
      "Dewpoint_c": -44.3,
      "Wind_Direction": 348,
      "Wind_Speed_kt": 0.8
    },
    {
      "Pressure_mb": 393.3,
      "Altitude_m": 7472,
      "Temp_c": -30,
      "Dewpoint_c": -44.3,
      "Wind_Direction": 348,
      "Wind_Speed_kt": 0.8
    },
    {
      "Pressure_mb": 393,
      "Altitude_m": 7477,
      "Temp_c": -30,
      "Dewpoint_c": -44.3,
      "Wind_Direction": 348,
      "Wind_Speed_kt": 0.9
    },
    {
      "Pressure_mb": 392.8,
      "Altitude_m": 7481,
      "Temp_c": -30,
      "Dewpoint_c": -44.3,
      "Wind_Direction": 348,
      "Wind_Speed_kt": 0.9
    },
    {
      "Pressure_mb": 392.6,
      "Altitude_m": 7486,
      "Temp_c": -30.1,
      "Dewpoint_c": -44.3,
      "Wind_Direction": 348,
      "Wind_Speed_kt": 1
    },
    {
      "Pressure_mb": 392.3,
      "Altitude_m": 7490,
      "Temp_c": -30.1,
      "Dewpoint_c": -44.3,
      "Wind_Direction": 348,
      "Wind_Speed_kt": 1
    },
    {
      "Pressure_mb": 392.1,
      "Altitude_m": 7494,
      "Temp_c": -30.1,
      "Dewpoint_c": -44.3,
      "Wind_Direction": 348,
      "Wind_Speed_kt": 1.1
    },
    {
      "Pressure_mb": 391.8,
      "Altitude_m": 7498,
      "Temp_c": -30.2,
      "Dewpoint_c": -44.3,
      "Wind_Direction": 347,
      "Wind_Speed_kt": 1.1
    },
    {
      "Pressure_mb": 391.6,
      "Altitude_m": 7502,
      "Temp_c": -30.2,
      "Dewpoint_c": -44.3,
      "Wind_Direction": 347,
      "Wind_Speed_kt": 1.1
    },
    {
      "Pressure_mb": 391.4,
      "Altitude_m": 7506,
      "Temp_c": -30.2,
      "Dewpoint_c": -44.3,
      "Wind_Direction": 347,
      "Wind_Speed_kt": 1.2
    },
    {
      "Pressure_mb": 391.2,
      "Altitude_m": 7511,
      "Temp_c": -30.2,
      "Dewpoint_c": -44.3,
      "Wind_Direction": 347,
      "Wind_Speed_kt": 1.2
    },
    {
      "Pressure_mb": 390.9,
      "Altitude_m": 7515,
      "Temp_c": -30.3,
      "Dewpoint_c": -44.3,
      "Wind_Direction": 347,
      "Wind_Speed_kt": 1.3
    },
    {
      "Pressure_mb": 390.7,
      "Altitude_m": 7519,
      "Temp_c": -30.3,
      "Dewpoint_c": -44.3,
      "Wind_Direction": 347,
      "Wind_Speed_kt": 1.4
    },
    {
      "Pressure_mb": 390.5,
      "Altitude_m": 7523,
      "Temp_c": -30.3,
      "Dewpoint_c": -44.3,
      "Wind_Direction": 347,
      "Wind_Speed_kt": 1.5
    },
    {
      "Pressure_mb": 390.3,
      "Altitude_m": 7527,
      "Temp_c": -30.4,
      "Dewpoint_c": -44.3,
      "Wind_Direction": 347,
      "Wind_Speed_kt": 1.6
    },
    {
      "Pressure_mb": 390,
      "Altitude_m": 7531,
      "Temp_c": -30.4,
      "Dewpoint_c": -44.2,
      "Wind_Direction": 347,
      "Wind_Speed_kt": 1.7
    },
    {
      "Pressure_mb": 389.8,
      "Altitude_m": 7535,
      "Temp_c": -30.4,
      "Dewpoint_c": -44.2,
      "Wind_Direction": 347,
      "Wind_Speed_kt": 1.7
    },
    {
      "Pressure_mb": 389.6,
      "Altitude_m": 7539,
      "Temp_c": -30.4,
      "Dewpoint_c": -44.1,
      "Wind_Direction": 347,
      "Wind_Speed_kt": 1.8
    },
    {
      "Pressure_mb": 389.3,
      "Altitude_m": 7544,
      "Temp_c": -30.4,
      "Dewpoint_c": -44.1,
      "Wind_Direction": 347,
      "Wind_Speed_kt": 1.9
    },
    {
      "Pressure_mb": 389.1,
      "Altitude_m": 7549,
      "Temp_c": -30.4,
      "Dewpoint_c": -44,
      "Wind_Direction": 347,
      "Wind_Speed_kt": 2
    },
    {
      "Pressure_mb": 388.8,
      "Altitude_m": 7553,
      "Temp_c": -30.5,
      "Dewpoint_c": -44,
      "Wind_Direction": 347,
      "Wind_Speed_kt": 2.1
    },
    {
      "Pressure_mb": 388.6,
      "Altitude_m": 7558,
      "Temp_c": -30.5,
      "Dewpoint_c": -43.9,
      "Wind_Direction": 346,
      "Wind_Speed_kt": 2.2
    },
    {
      "Pressure_mb": 388.3,
      "Altitude_m": 7562,
      "Temp_c": -30.5,
      "Dewpoint_c": -43.9,
      "Wind_Direction": 346,
      "Wind_Speed_kt": 2.3
    },
    {
      "Pressure_mb": 388.1,
      "Altitude_m": 7567,
      "Temp_c": -30.5,
      "Dewpoint_c": -43.8,
      "Wind_Direction": 346,
      "Wind_Speed_kt": 2.3
    },
    {
      "Pressure_mb": 387.8,
      "Altitude_m": 7572,
      "Temp_c": -30.5,
      "Dewpoint_c": -43.8,
      "Wind_Direction": 346,
      "Wind_Speed_kt": 2.4
    },
    {
      "Pressure_mb": 387.6,
      "Altitude_m": 7576,
      "Temp_c": -30.6,
      "Dewpoint_c": -43.7,
      "Wind_Direction": 346,
      "Wind_Speed_kt": 2.5
    },
    {
      "Pressure_mb": 387.3,
      "Altitude_m": 7581,
      "Temp_c": -30.6,
      "Dewpoint_c": -43.7,
      "Wind_Direction": 346,
      "Wind_Speed_kt": 2.6
    },
    {
      "Pressure_mb": 387.1,
      "Altitude_m": 7585,
      "Temp_c": -30.6,
      "Dewpoint_c": -43.7,
      "Wind_Direction": 346,
      "Wind_Speed_kt": 2.7
    },
    {
      "Pressure_mb": 386.8,
      "Altitude_m": 7590,
      "Temp_c": -30.6,
      "Dewpoint_c": -43.6,
      "Wind_Direction": 346,
      "Wind_Speed_kt": 2.8
    },
    {
      "Pressure_mb": 386.5,
      "Altitude_m": 7594,
      "Temp_c": -30.6,
      "Dewpoint_c": -43.5,
      "Wind_Direction": 346,
      "Wind_Speed_kt": 2.9
    },
    {
      "Pressure_mb": 386.3,
      "Altitude_m": 7599,
      "Temp_c": -30.7,
      "Dewpoint_c": -43.4,
      "Wind_Direction": 346,
      "Wind_Speed_kt": 3
    }
  ],
  "soaringForecast": {
    "@context": {
      "@version": "1.1",
      "@vocab": "https://api.weather.gov/ontology#"
    },
    "@id": "https://api.weather.gov/products/c392d917-1449-437d-9c91-5f774be48edf",
    "id": "c392d917-1449-437d-9c91-5f774be48edf",
    "wmoCollectiveId": "UXUS97",
    "issuingOffice": "KSLC",
    "issuanceTime": "2026-01-30T12:30:00+00:00",
    "productCode": "SRG",
    "productName": "Soaring Guidance",
    "productText": "\n000\nUXUS97 KSLC 301230\nSRGSLC\n\nSoaring Forecast\nNational Weather Service Salt Lake City, Utah\n530 AM MST Friday, January 30, 2026\n\nThis forecast is for Friday, January 30, 2026:\n\nIf the trigger temperature of 54.9 F/12.7 C is reached...then\n   Thermal Soaring Index....................... Poor\n   Maximum rate of lift........................ 86 ft/min (0.4 m/s)\n   Maximum height of thermals.................. 6185 ft MSL (1259 ft AGL)\n\nForecast maximum temperature................... 46.0 F/8.2 C\nTime of trigger temperature.................... None\nTime of overdevelopment........................ None\nMiddle/high clouds during soaring window....... None\nSurface winds during soaring window............ 20 mph or less\nHeight of the -3 thermal index................. 5206 ft MSL (281 ft AGL)\nThermal soaring outlook for Saturday 01/31..... Poor\n\nWave Soaring Index............................. Not available\n\nRemarks... \n\nSunrise/Sunset.................... 07:39:28 / 17:42:50 MST\nTotal possible sunshine........... 10 hr 3 min 22 sec (603 min 22 sec)\nAltitude of sun at 12:41:09 MST... 30.95 degrees\n\nUpper air data from rawinsonde observation taken on 01/30/2026 at 0500 MST\n\nFreezing level.................. 9316 ft MSL (4390 ft AGL)\nConvective condensation level... 15823 ft MSL (10897 ft AGL)\nLifted condensation level....... 10477 ft MSL (5551 ft AGL)\nLifted index.................... +13.8\nK index......................... +4.7\n\nHeight  Temperature  Wind  Wind Spd  Lapse Rate  ConvectionT  Thermal  Lift Rate\nft MSL  deg C deg F   Dir   kt  m/s  C/km F/kft  deg C deg F   Index    fpm  m/s\n--------------------------------------------------------------------------------\n 26000  -31.0 -23.8   305   54   28   7.8   4.3   34.7  94.5    21.2      M    M\n 24000  -26.4 -15.5   305   54   28   6.6   3.6   33.3  92.0    20.5      M    M\n 22000  -22.1  -7.8   310   54   28   6.4   3.5   30.5  86.9    18.7      M    M\n 20000  -19.1  -2.4   310   49   25   4.7   2.6   27.1  80.9    16.2      M    M\n 18000  -15.9   3.4   305   43   22   5.9   3.2   24.1  75.4    13.9      M    M\n 16000  -11.7  10.9   305   40   21   6.8   3.7   22.3  72.1    12.6      M    M\n 14000   -8.1  17.4   305   35   18   5.2   2.9   19.7  67.5    10.6      M    M\n 12000   -4.7  23.5   295   27   14   5.9   3.2   17.1  62.7     8.4      M    M\n 10000   -1.3  29.7   290   20   10   6.6   3.6   14.7  58.5     6.1      M    M\n  9000    0.4  32.7   280   15    8   5.8   3.2   13.5  56.3     4.9      M    M\n  8000    2.4  36.3   250    9    5   5.3   2.9   11.8  53.2     3.3      M    M\n  7000    3.4  38.1   210    7    4   3.2   1.7    9.8  49.7     1.5      M    M\n  6000    4.1  39.4   180    8    4   0.2   0.1    7.5  45.5    -0.8     76  0.4\n  5000    1.6  34.9   140    6    3 -67.5 -37.1    2.1  35.8    -6.2    121  0.6\n\n * * * * * * Numerical weather prediction model forecast data valid * * * * * * \n\n           01/30/2026 at 0800 MST          |       01/30/2026 at 1100 MST        \n                                           |\nCAPE...     0.0    LI...       +7.6        | CAPE...     0.0    LI...       +7.1\nCINH...    -0.2    K Index...  +5.8        | CINH...    -0.2    K Index...  +8.3\n                                           |\nHeight Temperature  Wnd WndSpd  Lapse Rate | Temperature  Wnd WndSpd  Lapse Rate\nft MSL deg C deg F  Dir kt m/s  C/km F/kft | deg C deg F  Dir kt m/s  C/km F/kft\n--------------------------------------------------------------------------------\n 26000 -33.0 -27.4  340  58 30   6.5   3.6 | -32.3 -26.1  335  47 24   6.8   3.7\n 24000 -29.1 -20.4  335  52 27   7.2   4.0 | -28.3 -18.9  335  46 23   6.6   3.6\n 22000 -24.6 -12.3  335  50 25   7.5   4.1 | -24.4 -11.9  335  43 22   6.5   3.6\n 20000 -20.1  -4.2  340  46 23   6.5   3.6 | -20.0  -4.0  330  41 21   6.7   3.7\n 18000 -16.4   2.5  340  42 22   5.9   3.3 | -15.8   3.6  335  40 21   7.2   4.0\n 16000 -12.8   9.0  340  38 19   5.7   3.1 | -11.8  10.8  335  35 18   5.8   3.2\n 14000  -9.5  14.9  340  32 17   5.5   3.0 |  -8.9  16.0  340  29 15   4.5   2.5\n 12000  -6.5  20.3  340  26 13   4.0   2.2 |  -6.3  20.7  340  22 12   3.8   2.1\n 10000  -4.9  23.2  340  15  8   2.2   1.2 |  -4.5  23.9  330  14  7   2.5   1.4\n  9000  -4.0  24.8  330   9  5   2.6   1.4 |  -3.6  25.5  315   9  5   3.1   1.7\n  8000  -2.7  27.1  310   5  3   4.2   2.3 |  -2.5  27.5  290   6  3   4.2   2.3\n  7000  -1.4  29.5  275   2  1   4.3   2.3 |  -1.2  29.8  260   3  2   5.0   2.7\n  6000  -0.2  31.6  170   3  2   3.7   2.0 |   0.3  32.5  210   3  2   6.3   3.4\n  5000  -0.1  31.8  145   4  2 -11.5  -6.3 |   3.7  38.7  205   1  1   3.1   1.7\n\n           01/30/2026 at 1400 MST          |       01/30/2026 at 1700 MST        \n                                           |\nCAPE...     0.0    LI...       +5.3        | CAPE...     0.0    LI...       +4.0\nCINH...    -0.0    K Index...  +9.6        | CINH...    -0.0    K Index...  +8.3\n                                           |\nHeight Temperature  Wnd WndSpd  Lapse Rate | Temperature  Wnd WndSpd  Lapse Rate\nft MSL deg C deg F  Dir kt m/s  C/km F/kft | deg C deg F  Dir kt m/s  C/km F/kft\n--------------------------------------------------------------------------------\n 26000 -31.2 -24.2  330  42 22   6.7   3.7 | -30.6 -23.1  330  41 21   7.1   3.9\n 24000 -27.3 -17.1  335  42 22   5.1   2.8 | -26.5 -15.7  325  40 21   5.4   2.9\n 22000 -24.1 -11.4  330  43 22   4.8   2.6 | -23.0  -9.4  320  43 22   5.2   2.8\n 20000 -20.3  -4.5  325  43 22   6.7   3.7 | -19.9  -3.8  320  43 22   5.4   3.0\n 18000 -16.2   2.8  325  41 21   7.1   3.9 | -16.3   2.7  325  40 21   6.5   3.5\n 16000 -11.9  10.6  330  35 18   6.8   3.7 | -12.0  10.4  325  35 18   6.4   3.5\n 14000  -8.3  17.1  330  28 14   5.1   2.8 |  -8.3  17.1  325  30 15   6.6   3.6\n 12000  -5.5  22.1  330  22 12   4.0   2.2 |  -4.9  23.2  330  24 12   4.4   2.4\n 10000  -3.4  25.9  320  15  8   2.9   1.6 |  -2.5  27.5  320  15  8   3.6   2.0\n  9000  -2.4  27.7  310  10  5   2.3   1.3 |  -1.3  29.7  310  10  5   2.6   1.4\n  8000  -1.5  29.3  290   6  3   3.6   2.0 |  -0.3  31.5  295   6  3   3.2   1.8\n  7000  -0.1  31.8  255   3  1   5.6   3.1 |   1.1  34.0  255   3  1   4.1   2.3\n  6000   1.8  35.2  225   2  1   9.3   5.1 |   2.9  37.2  200   1  1   6.0   3.3\n  5000   4.7  40.5  255   1  0  18.6  10.2 |   5.2  41.4  355   1  1   1.6   0.9\n________________________________________________________________________________\n\nThis product is issued once per day by approximately 0600 MST/0700 MDT \n(1300 UTC). This product is not continuously monitored nor updated after\nthe initial issuance. \n\nThe information contained herein is based on the 1200 UTC rawinsonde observation\nat the Salt Lake City, Utah International Airport and/or numerical weather \nprediction model data representative of the airport. These data may not be\nrepresentative of other areas along the Wasatch Front. Erroneous data such as\nthese should not be used.\n\nThe content and format of this report as well as the issuance times are subject\nto change without prior notice.\n\n042025\n"
  },
  "areaForecast": {
    "@context": {
      "@version": "1.1",
      "@vocab": "https://api.weather.gov/ontology#"
    },
    "@id": "https://api.weather.gov/products/125254bc-b4e7-4729-84b6-870d98b39e6b",
    "id": "125254bc-b4e7-4729-84b6-870d98b39e6b",
    "wmoCollectiveId": "FXUS65",
    "issuingOffice": "KSLC",
    "issuanceTime": "2026-01-30T22:12:00+00:00",
    "productCode": "AFD",
    "productName": "Area Forecast Discussion",
    "productText": "\n000\nFXUS65 KSLC 302212\nAFDSLC\n\nArea Forecast Discussion\nNational Weather Service Salt Lake City UT\n312 PM MST Fri Jan 30 2026\n\n.KEY MESSAGES...\n\n- A strong area of high pressure will bring dry and stable\n  conditions through the next 7 days and beyond. \n \n- Valley inversions will become better established across northern\n  Utah through this weekend, and likely persist through next week,\n  resulting in areas of fog and stratus, an increase in haze, and\n  cool temperatures.\n\n- Locations outside of inverted valleys will see max temperatures\n  more reminiscent of early-mid March this weekend through much \n  of next week.\n\n&&\n\n.DISCUSSION...The large-scale pattern is unchanged over the\nwestern US, with a ridge currently centered to our west. This\nridge will slowly move overhead this weekend, resulting in \ncontinued dry, stable conditions and rising temperatures across \nall but inverted valleys.\n\nDense freezing fog that developed again overnight under these \nstable conditions has largely dissipated, though a clear cold pool\nstill resides over the Great Salt Lake; air temperatures over the\nlake are still near freezing, compared to the Salt Lake Valley in\nparticular where temperatures have climbed into the mid-40s \nacross all but directly along the lake. This fog that developed \nappeared to be shallower than yesterday, allowing conditions to \nimprove more quickly and temperatures to increase more during the \nday. After sunset, that cold pool will start to expand once again,\nbut warmer daytime temperatures and approaching mid-level clouds \nwill likely delay the onset of fog by at least an hour or two, if \nnot more. The spatial coverage of fog will thus likely be a little\nsmaller than this morning, but uncertainty remains with its exact\nextent. The Cache Valley will also see similar conditions to last\nnight, with very high chances of dense fog (80-90% chance). \n\nAs high pressure slowly moves overhead, 700-mb temperatures will\nwarm by 2-4C, though valleys will struggle to warm under the\ninversion. Chances for nocturnal fog may continue through the \nweekend, as long as moisture isn't able to mix out at any point.\n\nA grazing shortwave trough will bring a weak, dry cold front\nthrough the area on Monday, though precipitation chances are \nnearly zero. This could increase mixing, though it's unclear if \nvalleys will fully mix out. If not, valley haze will continue to \ndevelop. After Monday, strong high pressure will return to the \nwestern US. Ensemble guidance suggests the next chances for any \nmeasurable precipitation aren't until Feb 9th at the \nearliest...perhaps later.\n\n&&\n\n.AVIATION...KSLC...VFR conditions will persist through the evening \nhours, with an increasing probability of impacts to visibility after \n0300Z tonight. While models suggest the probability of fog \ndevelopment is low with increasing clouds overhead and some drying \nat the lower levels, the cold pool lingering over the lake this \nevening is likely to shift back in over the airfield tonight, \nproviding better conditions for the development of dense fog after \n0500Z and lingering as late as 1500Z. Otherwise, winds will be light \nand follow typical diurnal patterns through the TAF period.\n\n.REST OF UTAH AND SOUTHWEST WYOMING...VFR conditions persist area-\nwide into the early evening, though can expect isolated dense and \nfreezing fog in mountain valleys including the Cache (KLGU) to \nredevelop a few hours after sunset. For Saturday, can expect that \nconditions will improve to VFR area-wide during the day with light \ndiurnally driven winds.\n\n&&\n\n.SLC WATCHES/WARNINGS/ADVISORIES...\nUT...None.\nWY...None.\n&&\n\n$$\n\nCunningham/Wessler\n\nFor more information from NOAA's National Weather Service visit...\nhttp://weather.gov/saltlakecity\n"
  },
  "generalForecast": {
    "@context": [
      "https://geojson.org/geojson-ld/geojson-context.jsonld",
      {
        "@version": "1.1",
        "wx": "https://api.weather.gov/ontology#",
        "geo": "http://www.opengis.net/ont/geosparql#",
        "unit": "http://codes.wmo.int/common/unit/",
        "@vocab": "https://api.weather.gov/ontology#"
      }
    ],
    "type": "Feature",
    "geometry": {
      "type": "Polygon",
      "coordinates": [
        [
          [
            -111.9704,
            40.7335
          ],
          [
            -111.974,
            40.7552
          ],
          [
            -112.0027,
            40.7525
          ],
          [
            -111.9991,
            40.7307
          ],
          [
            -111.9704,
            40.7335
          ]
        ]
      ]
    },
    "properties": {
      "units": "us",
      "forecastGenerator": "BaselineForecastGenerator",
      "generatedAt": "2026-01-31T02:05:39+00:00",
      "updateTime": "2026-01-30T21:11:48+00:00",
      "validTimes": "2026-01-30T15:00:00+00:00/P7DT10H",
      "elevation": {
        "unitCode": "wmoUnit:m",
        "value": 1278.9408
      },
      "periods": [
        {
          "number": 1,
          "name": "Tonight",
          "startTime": "2026-01-30T19:00:00-07:00",
          "endTime": "2026-01-31T06:00:00-07:00",
          "isDaytime": false,
          "temperature": 30,
          "temperatureUnit": "F",
          "temperatureTrend": null,
          "probabilityOfPrecipitation": {
            "unitCode": "wmoUnit:percent",
            "value": 1
          },
          "windSpeed": "5 mph",
          "windDirection": "SSE",
          "icon": "https://api.weather.gov/icons/land/night/fog?size=medium",
          "shortForecast": "Areas Of Freezing Fog",
          "detailedForecast": "Areas of freezing fog after 11pm. Partly cloudy, with a low around 30. South southeast wind around 5 mph."
        },
        {
          "number": 2,
          "name": "Saturday",
          "startTime": "2026-01-31T06:00:00-07:00",
          "endTime": "2026-01-31T18:00:00-07:00",
          "isDaytime": true,
          "temperature": 52,
          "temperatureUnit": "F",
          "temperatureTrend": null,
          "probabilityOfPrecipitation": {
            "unitCode": "wmoUnit:percent",
            "value": 1
          },
          "windSpeed": "3 mph",
          "windDirection": "WSW",
          "icon": "https://api.weather.gov/icons/land/day/fog/few?size=medium",
          "shortForecast": "Areas Of Freezing Fog then Sunny",
          "detailedForecast": "Areas of freezing fog before 11am. Sunny. High near 52, with temperatures falling to around 50 in the afternoon. West southwest wind around 3 mph."
        },
        {
          "number": 3,
          "name": "Saturday Night",
          "startTime": "2026-01-31T18:00:00-07:00",
          "endTime": "2026-02-01T06:00:00-07:00",
          "isDaytime": false,
          "temperature": 31,
          "temperatureUnit": "F",
          "temperatureTrend": null,
          "probabilityOfPrecipitation": {
            "unitCode": "wmoUnit:percent",
            "value": 0
          },
          "windSpeed": "5 mph",
          "windDirection": "SE",
          "icon": "https://api.weather.gov/icons/land/night/fog?size=medium",
          "shortForecast": "Areas Of Freezing Fog",
          "detailedForecast": "Areas of freezing fog after 11pm. Partly cloudy. Low around 31, with temperatures rising to around 33 overnight. Southeast wind around 5 mph."
        },
        {
          "number": 4,
          "name": "Sunday",
          "startTime": "2026-02-01T06:00:00-07:00",
          "endTime": "2026-02-01T18:00:00-07:00",
          "isDaytime": true,
          "temperature": 54,
          "temperatureUnit": "F",
          "temperatureTrend": null,
          "probabilityOfPrecipitation": {
            "unitCode": "wmoUnit:percent",
            "value": 0
          },
          "windSpeed": "5 mph",
          "windDirection": "S",
          "icon": "https://api.weather.gov/icons/land/day/fog/bkn?size=medium",
          "shortForecast": "Areas Of Freezing Fog then Partly Sunny",
          "detailedForecast": "Areas of freezing fog before 11am. Partly sunny, with a high near 54. South wind around 5 mph."
        },
        {
          "number": 5,
          "name": "Sunday Night",
          "startTime": "2026-02-01T18:00:00-07:00",
          "endTime": "2026-02-02T06:00:00-07:00",
          "isDaytime": false,
          "temperature": 34,
          "temperatureUnit": "F",
          "temperatureTrend": null,
          "probabilityOfPrecipitation": {
            "unitCode": "wmoUnit:percent",
            "value": 0
          },
          "windSpeed": "3 mph",
          "windDirection": "SSE",
          "icon": "https://api.weather.gov/icons/land/night/bkn?size=medium",
          "shortForecast": "Mostly Cloudy",
          "detailedForecast": "Mostly cloudy, with a low around 34. South southeast wind around 3 mph."
        },
        {
          "number": 6,
          "name": "Monday",
          "startTime": "2026-02-02T06:00:00-07:00",
          "endTime": "2026-02-02T18:00:00-07:00",
          "isDaytime": true,
          "temperature": 53,
          "temperatureUnit": "F",
          "temperatureTrend": null,
          "probabilityOfPrecipitation": {
            "unitCode": "wmoUnit:percent",
            "value": 0
          },
          "windSpeed": "2 to 6 mph",
          "windDirection": "NW",
          "icon": "https://api.weather.gov/icons/land/day/sct?size=medium",
          "shortForecast": "Mostly Sunny",
          "detailedForecast": "Mostly sunny, with a high near 53."
        },
        {
          "number": 7,
          "name": "Monday Night",
          "startTime": "2026-02-02T18:00:00-07:00",
          "endTime": "2026-02-03T06:00:00-07:00",
          "isDaytime": false,
          "temperature": 31,
          "temperatureUnit": "F",
          "temperatureTrend": null,
          "probabilityOfPrecipitation": {
            "unitCode": "wmoUnit:percent",
            "value": 0
          },
          "windSpeed": "2 to 6 mph",
          "windDirection": "NE",
          "icon": "https://api.weather.gov/icons/land/night/few?size=medium",
          "shortForecast": "Mostly Clear",
          "detailedForecast": "Mostly clear, with a low around 31."
        },
        {
          "number": 8,
          "name": "Tuesday",
          "startTime": "2026-02-03T06:00:00-07:00",
          "endTime": "2026-02-03T18:00:00-07:00",
          "isDaytime": true,
          "temperature": 51,
          "temperatureUnit": "F",
          "temperatureTrend": null,
          "probabilityOfPrecipitation": {
            "unitCode": "wmoUnit:percent",
            "value": 0
          },
          "windSpeed": "2 to 6 mph",
          "windDirection": "ESE",
          "icon": "https://api.weather.gov/icons/land/day/few?size=medium",
          "shortForecast": "Sunny",
          "detailedForecast": "Sunny, with a high near 51."
        },
        {
          "number": 9,
          "name": "Tuesday Night",
          "startTime": "2026-02-03T18:00:00-07:00",
          "endTime": "2026-02-04T06:00:00-07:00",
          "isDaytime": false,
          "temperature": 30,
          "temperatureUnit": "F",
          "temperatureTrend": null,
          "probabilityOfPrecipitation": {
            "unitCode": "wmoUnit:percent",
            "value": 0
          },
          "windSpeed": "2 to 6 mph",
          "windDirection": "NE",
          "icon": "https://api.weather.gov/icons/land/night/few?size=medium",
          "shortForecast": "Mostly Clear",
          "detailedForecast": "Mostly clear, with a low around 30."
        },
        {
          "number": 10,
          "name": "Wednesday",
          "startTime": "2026-02-04T06:00:00-07:00",
          "endTime": "2026-02-04T18:00:00-07:00",
          "isDaytime": true,
          "temperature": 51,
          "temperatureUnit": "F",
          "temperatureTrend": null,
          "probabilityOfPrecipitation": {
            "unitCode": "wmoUnit:percent",
            "value": 0
          },
          "windSpeed": "2 to 6 mph",
          "windDirection": "NNW",
          "icon": "https://api.weather.gov/icons/land/day/few?size=medium",
          "shortForecast": "Sunny",
          "detailedForecast": "Sunny, with a high near 51."
        },
        {
          "number": 11,
          "name": "Wednesday Night",
          "startTime": "2026-02-04T18:00:00-07:00",
          "endTime": "2026-02-05T06:00:00-07:00",
          "isDaytime": false,
          "temperature": 32,
          "temperatureUnit": "F",
          "temperatureTrend": null,
          "probabilityOfPrecipitation": {
            "unitCode": "wmoUnit:percent",
            "value": 0
          },
          "windSpeed": "5 mph",
          "windDirection": "NE",
          "icon": "https://api.weather.gov/icons/land/night/few?size=medium",
          "shortForecast": "Mostly Clear",
          "detailedForecast": "Mostly clear, with a low around 32."
        },
        {
          "number": 12,
          "name": "Thursday",
          "startTime": "2026-02-05T06:00:00-07:00",
          "endTime": "2026-02-05T18:00:00-07:00",
          "isDaytime": true,
          "temperature": 52,
          "temperatureUnit": "F",
          "temperatureTrend": null,
          "probabilityOfPrecipitation": {
            "unitCode": "wmoUnit:percent",
            "value": 0
          },
          "windSpeed": "5 mph",
          "windDirection": "S",
          "icon": "https://api.weather.gov/icons/land/day/few?size=medium",
          "shortForecast": "Sunny",
          "detailedForecast": "Sunny, with a high near 52."
        },
        {
          "number": 13,
          "name": "Thursday Night",
          "startTime": "2026-02-05T18:00:00-07:00",
          "endTime": "2026-02-06T06:00:00-07:00",
          "isDaytime": false,
          "temperature": 32,
          "temperatureUnit": "F",
          "temperatureTrend": null,
          "probabilityOfPrecipitation": {
            "unitCode": "wmoUnit:percent",
            "value": 0
          },
          "windSpeed": "5 mph",
          "windDirection": "NE",
          "icon": "https://api.weather.gov/icons/land/night/few?size=medium",
          "shortForecast": "Mostly Clear",
          "detailedForecast": "Mostly clear, with a low around 32."
        },
        {
          "number": 14,
          "name": "Friday",
          "startTime": "2026-02-06T06:00:00-07:00",
          "endTime": "2026-02-06T18:00:00-07:00",
          "isDaytime": true,
          "temperature": 54,
          "temperatureUnit": "F",
          "temperatureTrend": null,
          "probabilityOfPrecipitation": {
            "unitCode": "wmoUnit:percent",
            "value": 0
          },
          "windSpeed": "5 mph",
          "windDirection": "WSW",
          "icon": "https://api.weather.gov/icons/land/day/few?size=medium",
          "shortForecast": "Sunny",
          "detailedForecast": "Sunny, with a high near 54."
        }
      ]
    }
  },
  "windMapScreenshotMetadata": {
    "kind": "storage#object",
    "id": "wasatch-wind-static/wind-map-save.png/1769824835046787",
    "selfLink": "https://www.googleapis.com/storage/v1/b/wasatch-wind-static/o/wind-map-save.png",
    "mediaLink": "https://storage.googleapis.com/download/storage/v1/b/wasatch-wind-static/o/wind-map-save.png?generation=1769824835046787&alt=media",
    "name": "wind-map-save.png",
    "bucket": "wasatch-wind-static",
    "generation": "1769824835046787",
    "metageneration": "2",
    "contentType": "image/png",
    "storageClass": "STANDARD",
    "size": "863630",
    "md5Hash": "QQ3b8091gk2e8QWzKOrJFw==",
    "crc32c": "YEFGFA==",
    "etag": "CIOb7qTXtJIDEAI=",
    "timeCreated": "2026-01-31T02:00:35.059Z",
    "updated": "2026-01-31T02:00:35.132Z",
    "timeStorageClassUpdated": "2026-01-31T02:00:35.059Z",
    "timeFinalized": "2026-01-31T02:00:35.059Z"
  }
}