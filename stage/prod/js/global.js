"use strict";

const now = new Date();
const nextDay = `${new Date(Date.now() + 86400000).toLocaleString("en-us", { weekday: "short" })}+`;
const navItems = ["Today", nextDay, "Settings", "Misc.", "GPS", "Cams", "Now"];
const timezoneOffset = now.getTimezoneOffset() / 60;
const ftPerMeter = 3.28084;
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

// If hiTemp, liftParams, and soundingData are not global then D3 Reset/Update won't work
let slider, hiTemp, liftParams = {}, soundingData = {}, activeNav = 0;

// D3
const screenWidth = window.innerWidth;
const proportionalHeight = screenWidth * 0.67;
const margin = {
  top: proportionalHeight * 0.04,
  bottom: proportionalHeight * 0.08,
  left: screenWidth * 0.02,
  right: screenWidth * 0.027
};
const extraLeft = margin.left * 4.5; // Adjusts final left margin spacing for fitting wind barbs
const width = screenWidth - margin.left - margin.right;
const height = proportionalHeight - margin.top - margin.bottom;
const surfaceAlt = 4.229;
const maxAlt = 20;
const x = d3.scaleLinear().range([0, width - margin.left - margin.right - extraLeft]).domain([-10, 110]);
const y = d3.scaleLinear().range([height, 0]).domain([surfaceAlt, maxAlt]);
const svg = d3.select("#skew-t-d3")
  .append("svg")
  .attr("class", "svgbg")
  .attr("width", width)
  .attr("height", proportionalHeight)
  .append("g")
  .attr("transform", `translate(${margin.left + extraLeft},${margin.top})`);

const data = {
  "openMeteo": {
    "latitude": 40.764416,
    "longitude": -111.981255,
    "generationtime_ms": 1.2291669845581055,
    "utc_offset_seconds": -25200,
    "timezone": "America/Denver",
    "timezone_abbreviation": "GMT-7",
    "elevation": 1288,
    "hourly_units": {
      "time": "iso8601",
      "wind_speed_10m": "mp/h",
      "wind_direction_10m": "°",
      "windspeed_850hPa": "mp/h",
      "windspeed_800hPa": "mp/h",
      "windspeed_750hPa": "mp/h",
      "windspeed_700hPa": "mp/h",
      "windspeed_650hPa": "mp/h",
      "windspeed_600hPa": "mp/h",
      "windspeed_550hPa": "mp/h",
      "winddirection_850hPa": "°",
      "winddirection_800hPa": "°",
      "winddirection_750hPa": "°",
      "winddirection_700hPa": "°",
      "winddirection_650hPa": "°",
      "winddirection_600hPa": "°",
      "winddirection_550hPa": "°",
      "geopotential_height_850hPa": "m",
      "geopotential_height_800hPa": "m",
      "geopotential_height_750hPa": "m",
      "geopotential_height_700hPa": "m",
      "geopotential_height_650hPa": "m",
      "geopotential_height_600hPa": "m",
      "geopotential_height_550hPa": "m"
    },
    "hourly": {
      "time": [
        "2026-01-04T14:00",
        "2026-01-04T15:00",
        "2026-01-04T16:00",
        "2026-01-04T17:00",
        "2026-01-04T18:00",
        "2026-01-04T19:00",
        "2026-01-04T20:00",
        "2026-01-04T21:00",
        "2026-01-04T22:00",
        "2026-01-04T23:00",
        "2026-01-05T00:00",
        "2026-01-05T01:00"
      ],
      "wind_speed_10m": [
        8.6,
        2.3,
        2.3,
        5.6,
        4.1,
        8.3,
        3.9,
        3.1,
        7.2,
        8.6,
        11.2,
        12
      ],
      "wind_direction_10m": [
        205,
        253,
        349,
        220,
        167,
        175,
        211,
        21,
        176,
        160,
        157,
        172
      ],
      "windspeed_850hPa": [
        13.9,
        8.8,
        4.6,
        11.3,
        12.4,
        14.6,
        10.1,
        9.3,
        15.7,
        16.7,
        19.3,
        21.5
      ],
      "windspeed_800hPa": [
        21,
        17.5,
        17.6,
        25.8,
        26.6,
        22.9,
        21.1,
        22.2,
        26.2,
        26.9,
        29,
        33.5
      ],
      "windspeed_750hPa": [
        24,
        22,
        23.7,
        31.5,
        35.6,
        29.3,
        27.8,
        31.7,
        30.4,
        38.1,
        40.3,
        41.4
      ],
      "windspeed_700hPa": [
        25.5,
        24.8,
        26.5,
        34.1,
        40.7,
        34.6,
        32.3,
        37.6,
        34.7,
        44.6,
        44.5,
        42
      ],
      "windspeed_650hPa": [
        27.6,
        27.3,
        28.2,
        35.1,
        41.9,
        37.7,
        36,
        40.1,
        37.6,
        46.2,
        46.1,
        42.3
      ],
      "windspeed_600hPa": [
        31.3,
        31.4,
        30.2,
        36.3,
        41.7,
        41.4,
        39.5,
        41.5,
        42,
        45.8,
        47,
        43.5
      ],
      "windspeed_550hPa": [
        40.2,
        38.9,
        36.8,
        37.3,
        42.8,
        45.7,
        42,
        42,
        46.7,
        45.3,
        45.9,
        43.5
      ],
      "winddirection_850hPa": [
        218,
        225,
        202,
        219,
        207,
        209,
        216,
        203,
        200,
        177,
        177,
        182
      ],
      "winddirection_800hPa": [
        218,
        217,
        216,
        221,
        223,
        221,
        223,
        208,
        211,
        214,
        218,
        221
      ],
      "winddirection_750hPa": [
        219,
        220,
        221,
        220,
        228,
        229,
        227,
        221,
        225,
        233,
        235,
        238
      ],
      "winddirection_700hPa": [
        219,
        223,
        223,
        222,
        228,
        232,
        230,
        226,
        233,
        240,
        241,
        247
      ],
      "winddirection_650hPa": [
        222,
        225,
        224,
        223,
        225,
        230,
        228,
        228,
        236,
        240,
        241,
        247
      ],
      "winddirection_600hPa": [
        228,
        230,
        226,
        226,
        225,
        226,
        225,
        230,
        232,
        236,
        236,
        241
      ],
      "winddirection_550hPa": [
        237,
        237,
        234,
        230,
        227,
        224,
        229,
        234,
        229,
        233,
        230,
        232
      ],
      "geopotential_height_850hPa": [
        1436,
        1432,
        1418,
        1417,
        1421,
        1433,
        1430,
        1424,
        1426,
        1425,
        1422,
        1417
      ],
      "geopotential_height_800hPa": [
        1937,
        1934,
        1920,
        1917,
        1921,
        1932,
        1928,
        1922,
        1922,
        1920,
        1918,
        1913
      ],
      "geopotential_height_750hPa": [
        2462,
        2459,
        2446,
        2442,
        2446,
        2455,
        2450,
        2443,
        2442,
        2440,
        2438,
        2433
      ],
      "geopotential_height_700hPa": [
        3014,
        3011,
        2999,
        2993,
        2997,
        3005,
        3000,
        2992,
        2990,
        2988,
        2986,
        2981
      ],
      "geopotential_height_650hPa": [
        3595,
        3593,
        3581,
        3576,
        3579,
        3587,
        3582,
        3572,
        3571,
        3568,
        3565,
        3560
      ],
      "geopotential_height_600hPa": [
        4212,
        4210,
        4198,
        4194,
        4198,
        4204,
        4199,
        4189,
        4188,
        4184,
        4181,
        4176
      ],
      "geopotential_height_550hPa": [
        4870,
        4868,
        4857,
        4855,
        4859,
        4865,
        4859,
        4849,
        4848,
        4844,
        4840,
        4833
      ],
      "winddirection_9000": [
        230,
        230,
        230,
        230,
        230,
        230,
        240,
        240,
        240,
        240,
        240,
        240
      ],
      "windspeed_9000": [
        36.8,
        36.8,
        36.8,
        36.8,
        36.8,
        36.8,
        33.4,
        33.4,
        33.4,
        33.4,
        33.4,
        33.4
      ],
      "winddirection_12000": [
        230,
        230,
        230,
        230,
        230,
        230,
        230,
        230,
        230,
        230,
        230,
        230
      ],
      "windspeed_12000": [
        39.1,
        39.1,
        39.1,
        39.1,
        39.1,
        39.1,
        23,
        23,
        23,
        23,
        23,
        23
      ],
      "winddirection_18000": [
        220,
        220,
        220,
        220,
        220,
        220,
        230,
        230,
        230,
        230,
        230,
        230
      ],
      "windspeed_18000": [
        47.2,
        47.2,
        47.2,
        47.2,
        47.2,
        47.2,
        42.6,
        42.6,
        42.6,
        42.6,
        42.6,
        42.6
      ]
    },
    "daily_units": {
      "time": "iso8601",
      "sunset": "iso8601",
      "temperature_2m_max": "°F"
    },
    "daily": {
      "time": [
        "2026-01-04"
      ],
      "sunset": [
        "2026-01-04T17:13"
      ],
      "temperature_2m_max": [
        55.5
      ]
    }
  },
  "synoptic": {
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
          "end": "2026-01-04T20:54:00Z"
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
          },
          "wind_gust": {
            "wind_gust_set_1": {}
          }
        },
        "OBSERVATIONS": {
          "date_time": [
            "1:50 PM",
            "1:54 PM",
            "1:55 PM",
            "2:00 PM",
            "2:05 PM",
            "2:10 PM",
            "2:15 PM",
            "2:20 PM",
            "2:25 PM",
            "2:30 PM",
            "2:35 PM",
            "2:40 PM",
            "2:40 PM"
          ],
          "air_temp_set_1": [
            53.6,
            53.06,
            53.6,
            53.6,
            53.6,
            53.6,
            53.6,
            53.6,
            53.6,
            53.6,
            53.6,
            53.6
          ],
          "wind_speed_set_1": [
            10.36,
            11.51,
            10.36,
            9.21,
            10.36,
            11.51,
            16.11,
            16.11,
            14.96,
            16.11,
            14.96,
            13.81
          ],
          "wind_direction_set_1": [
            140,
            150,
            150,
            150,
            160,
            170,
            170,
            170,
            160,
            170,
            160,
            170,
            170
          ],
          "altimeter_set_1": [
            29.81,
            29.8,
            29.8,
            29.8,
            29.81,
            29.8,
            29.8,
            29.8,
            29.79,
            29.79,
            29.79,
            29.79
          ],
          "wind_gust_set_1": [
            null,
            null,
            null,
            null,
            null,
            null,
            null,
            21.86,
            20.71,
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
          "end": "2026-01-04T20:35:00Z"
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
          },
          "wind_gust": {
            "wind_gust_set_1": {}
          }
        },
        "OBSERVATIONS": {
          "date_time": [
            "10:55 AM",
            "11:15 AM",
            "11:35 AM",
            "11:55 AM",
            "12:15 PM",
            "12:35 PM",
            "12:55 PM",
            "1:15 PM",
            "1:35 PM",
            "1:55 PM",
            "2:15 PM",
            "2:35 PM",
            "2:35 PM"
          ],
          "air_temp_set_1": [
            50,
            50,
            50,
            51.8,
            51.8,
            51.8,
            51.8,
            51.8,
            51.8,
            51.8,
            51.8,
            51.8
          ],
          "wind_speed_set_1": [
            11.51,
            14.96,
            16.11,
            16.11,
            14.96,
            null,
            14.96,
            null,
            17.26,
            14.96,
            13.81,
            13.81
          ],
          "wind_direction_set_1": [
            150,
            160,
            160,
            160,
            160,
            null,
            160,
            null,
            160,
            160,
            160,
            160,
            160
          ],
          "altimeter_set_1": [
            29.91,
            29.9,
            29.89,
            29.88,
            29.87,
            29.86,
            29.85,
            29.84,
            29.83,
            29.83,
            29.82,
            29.82
          ],
          "wind_gust_set_1": [
            null,
            18.41,
            24.17,
            25.32,
            24.17,
            null,
            null,
            null,
            null,
            null,
            null,
            19.56
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
          "end": "2026-01-04T20:50:00Z"
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
            "12:50 PM",
            "1:00 PM",
            "1:10 PM",
            "1:20 PM",
            "1:30 PM",
            "1:40 PM",
            "1:50 PM",
            "2:00 PM",
            "2:10 PM",
            "2:20 PM",
            "2:30 PM",
            "2:40 PM",
            "2:40 PM"
          ],
          "air_temp_set_1": [
            50,
            50.66,
            50.81,
            50.61,
            50.58,
            50.53,
            50.63,
            50.86,
            51.5,
            51.37,
            51.42,
            51.65
          ],
          "wind_speed_set_1": [
            8.5,
            6.93,
            8.76,
            8.78,
            10.18,
            6.27,
            5.85,
            1.99,
            9.25,
            4.61,
            4.25,
            6.48
          ],
          "wind_direction_set_1": [
            147.4,
            124.2,
            142,
            140.2,
            135.5,
            185.9,
            180.2,
            88.3,
            156.2,
            155.5,
            171.7,
            133.2,
            133.2
          ],
          "wind_gust_set_1": [
            16.43,
            17.54,
            20.39,
            16.43,
            16.66,
            16.88,
            16.88,
            11.84,
            19.94,
            17.76,
            11.84,
            14.47
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
          "end": "2026-01-04T20:00:00Z"
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
            "9:00 AM",
            "10:00 AM",
            "11:00 AM",
            "12:00 PM",
            "1:00 PM",
            "2:00 PM",
            "2:00 PM"
          ],
          "air_temp_set_1": [
            22,
            22.9,
            23.4,
            23.4,
            22.7,
            22.3
          ],
          "wind_speed_set_1": [
            13.9,
            17,
            19.2,
            18.7,
            22,
            21.6
          ],
          "wind_direction_set_1": [
            181.1,
            180.7,
            186.9,
            191.5,
            189.9,
            185.2,
            185.2
          ],
          "wind_gust_set_1": [
            27.4,
            32.1,
            32.8,
            39.7,
            48.3,
            43.2
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
          "end": "2026-01-04T20:45:00Z"
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
            "12:00 PM",
            "12:15 PM",
            "12:30 PM",
            "12:45 PM",
            "1:00 PM",
            "1:15 PM",
            "1:30 PM",
            "1:45 PM",
            "2:00 PM",
            "2:15 PM",
            "2:30 PM",
            "2:45 PM",
            "2:45 PM"
          ],
          "air_temp_set_1": [
            27.55,
            27.49,
            27.12,
            26.75,
            27.49,
            27.55,
            27.67,
            27.73,
            27.73,
            27.66,
            27.61,
            27.61
          ],
          "wind_speed_set_1": [
            23.3,
            17.22,
            18.5,
            18.39,
            19.83,
            21.15,
            23.82,
            21.42,
            19.15,
            20.14,
            26.25,
            26.4
          ],
          "wind_direction_set_1": [
            222.8,
            238.8,
            256.1,
            244.2,
            234.2,
            223.7,
            223.4,
            228,
            233.2,
            224,
            196.9,
            201.2,
            201.2
          ],
          "wind_gust_set_1": [
            39.3,
            29.79,
            24.4,
            24.2,
            33.99,
            36,
            34.89,
            32.6,
            32.4,
            32.9,
            36.4,
            40.3
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
          "end": "2026-01-04T20:30:00Z"
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
            "11:45 AM",
            "12:00 PM",
            "12:15 PM",
            "12:30 PM",
            "12:45 PM",
            "1:00 PM",
            "1:15 PM",
            "1:30 PM",
            "1:45 PM",
            "2:00 PM",
            "2:15 PM",
            "2:30 PM",
            "2:30 PM"
          ],
          "air_temp_set_1": [
            23,
            23,
            23,
            23,
            22,
            23,
            22,
            22,
            22,
            22,
            22,
            22
          ],
          "wind_speed_set_1": [
            18,
            19,
            18,
            14.99,
            22,
            17,
            20,
            21,
            16,
            18,
            22,
            33.99
          ],
          "wind_direction_set_1": [
            202.5,
            225,
            225,
            202.5,
            180,
            202.5,
            180,
            202.5,
            202.5,
            225,
            225,
            247.5,
            247.5
          ],
          "wind_gust_set_1": [
            31.99,
            41.99,
            41.99,
            31,
            40.99,
            34.99,
            38,
            45,
            30,
            39,
            43.99,
            65
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
          "end": "2026-01-04T20:55:00Z"
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
            "1:50 PM",
            "1:55 PM",
            "2:00 PM",
            "2:05 PM",
            "2:10 PM",
            "2:15 PM",
            "2:20 PM",
            "2:25 PM",
            "2:30 PM",
            "2:35 PM",
            "2:40 PM",
            "2:45 PM",
            "2:45 PM"
          ],
          "air_temp_set_1": [
            47.95,
            48.03,
            48.17,
            48.13,
            48.04,
            48.11,
            48.19,
            48.21,
            48.29,
            48.34,
            48.22,
            48.04
          ],
          "wind_speed_set_1": [
            22.74,
            21.6,
            21.9,
            21.8,
            22.2,
            21.99,
            21.04,
            23.52,
            22.68,
            23.14,
            22.97,
            22.98
          ],
          "wind_direction_set_1": [
            157.24,
            156.84,
            156.47,
            155.63,
            153.29,
            152.35,
            155.62,
            154.43,
            161.35,
            161.3,
            161.81,
            159.65,
            159.65
          ],
          "wind_gust_set_1": [
            27.57,
            24.9,
            25.03,
            26.96,
            25.42,
            26.04,
            26,
            27.66,
            25.9,
            28.01,
            27,
            27.62
          ],
          "altimeter_set_1d": [
            29.91,
            29.91,
            29.91,
            29.91,
            29.91,
            29.91,
            29.91,
            29.9,
            29.9,
            29.9,
            29.9,
            29.9
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
          "end": "2026-01-04T20:00:00Z"
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
            "11:15 AM",
            "11:30 AM",
            "11:45 AM",
            "12:00 PM",
            "12:15 PM",
            "12:30 PM",
            "12:45 PM",
            "1:00 PM",
            "1:15 PM",
            "1:30 PM",
            "1:45 PM",
            "2:00 PM",
            "2:00 PM"
          ],
          "air_temp_set_1": [
            24.65,
            24.47,
            24.39,
            24.42,
            24.22,
            24.19,
            23.96,
            23.71,
            23.78,
            23.65,
            23.45,
            23.68
          ],
          "wind_speed_set_1": [
            15.07,
            18.99,
            21.66,
            15.07,
            16.44,
            16.26,
            15.78,
            22.79,
            17.23,
            16.92,
            21.65,
            17.75
          ],
          "wind_direction_set_1": [
            209.9,
            191.4,
            207.7,
            208.1,
            201.2,
            195.5,
            213.5,
            192.5,
            225.9,
            192.6,
            198.6,
            214.6,
            214.6
          ],
          "wind_gust_set_1": [
            34.43,
            42.77,
            31.67,
            28.02,
            31.67,
            29.95,
            38.82,
            31.15,
            33.46,
            40.17,
            36.59,
            31.97
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
          "end": "2026-01-04T20:45:00Z"
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
            "11:31 AM",
            "11:45 AM",
            "12:00 PM",
            "12:16 PM",
            "12:31 PM",
            "12:45 PM",
            "1:00 PM",
            "1:15 PM",
            "1:45 PM",
            "2:00 PM",
            "2:15 PM",
            "2:45 PM",
            "2:45 PM"
          ],
          "air_temp_set_1": [
            45,
            45,
            45,
            44,
            44,
            43,
            42,
            43,
            45,
            45,
            46,
            46
          ],
          "wind_speed_set_1": [
            8,
            5.99,
            5.99,
            7,
            7,
            10,
            5,
            5,
            5,
            8,
            5.99,
            5.99
          ],
          "wind_direction_set_1": [
            124,
            127,
            195,
            187,
            157,
            229,
            136,
            223,
            184,
            90,
            128,
            109,
            109
          ],
          "wind_gust_set_1": [
            22,
            17,
            19,
            19,
            22,
            22,
            20,
            11,
            25,
            13,
            22,
            23
          ],
          "altimeter_set_1": [
            29.65,
            29.65,
            29.65,
            29.64,
            29.63,
            29.62,
            29.61,
            29.6,
            29.58,
            29.58,
            29.58,
            29.57
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
          "end": "2026-01-04T20:10:00Z"
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
            "12:20 PM",
            "12:30 PM",
            "12:40 PM",
            "12:50 PM",
            "1:00 PM",
            "1:10 PM",
            "1:20 PM",
            "1:30 PM",
            "1:40 PM",
            "1:50 PM",
            "2:00 PM",
            "2:10 PM",
            "2:10 PM"
          ],
          "air_temp_set_1": [
            28.48,
            28.55,
            28.61,
            28.47,
            28.58,
            28.49,
            28.23,
            28.41,
            28.17,
            27.96,
            28.06,
            27.72
          ],
          "wind_speed_set_1": [
            15.01,
            12.58,
            11.92,
            12.35,
            10.03,
            12.62,
            12.43,
            11.36,
            12.61,
            11.54,
            12.83,
            14.94
          ],
          "wind_direction_set_1": [
            198.8,
            197.4,
            186.7,
            187.5,
            187.9,
            191.5,
            185.1,
            189.1,
            184.3,
            186.7,
            180.5,
            188.7,
            188.7
          ],
          "wind_gust_set_1": [
            23.1,
            23.22,
            16.15,
            20.62,
            15.4,
            22.6,
            18.63,
            13.79,
            17.76,
            16.51,
            19,
            20.24
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
          "end": "2026-01-04T20:40:00Z"
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
            "12:40 PM",
            "12:50 PM",
            "1:00 PM",
            "1:10 PM",
            "1:20 PM",
            "1:30 PM",
            "1:40 PM",
            "1:50 PM",
            "2:00 PM",
            "2:10 PM",
            "2:20 PM",
            "2:30 PM",
            "2:30 PM"
          ],
          "air_temp_set_1": [
            49.44,
            49.7,
            50.4,
            50.35,
            50.13,
            50.35,
            50.61,
            51.05,
            51.26,
            51.16,
            51.41,
            51.59
          ],
          "wind_speed_set_1": [
            11.23,
            12.26,
            14.61,
            18.76,
            15.92,
            17.73,
            12.56,
            12.22,
            8.57,
            13.31,
            9.22,
            11.44
          ],
          "wind_direction_set_1": [
            191.9,
            185.2,
            188.8,
            192.6,
            189.1,
            188.3,
            205.1,
            203.7,
            211,
            200.2,
            198.1,
            201.4,
            201.4
          ],
          "wind_gust_set_1": [
            24.55,
            24.33,
            22.58,
            28.71,
            26.51,
            28.06,
            23.67,
            20.39,
            21.26,
            21.47,
            26.96,
            27.18
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
      "METADATA_QUERY_TIME": "5.4 ms",
      "METADATA_PARSE_TIME": "0.4 ms",
      "TOTAL_METADATA_TIME": "5.8 ms",
      "DATA_QUERY_TIME": "6.8 ms",
      "QC_QUERY_TIME": "3.7 ms",
      "DATA_PARSE_TIME": "20.7 ms",
      "TOTAL_DATA_TIME": "31.2 ms",
      "TOTAL_TIME": "37.0 ms",
      "VERSION": "v2.30.4"
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
  "windAloft": {
    "forecast6h": {
      "starttime": 20,
      "endtime": 3,
      "windspeed": {
        "altitude9k": 36.8,
        "altitude12k": 39.1,
        "altitude18k": 47.2
      },
      "winddirection": {
        "altitude9k": 230,
        "altitude12k": 230,
        "altitude18k": 220
      },
      "temperature": {
        "altitude9k": 28,
        "altitude12k": 18,
        "altitude18k": -4
      }
    },
    "forecast12h": {
      "starttime": 3,
      "endtime": 12,
      "windspeed": {
        "altitude9k": 33.4,
        "altitude12k": 23,
        "altitude18k": 42.6
      },
      "winddirection": {
        "altitude9k": 240,
        "altitude12k": 230,
        "altitude18k": 230
      },
      "temperature": {
        "altitude9k": 27,
        "altitude12k": 16,
        "altitude18k": -8
      }
    },
    "forecast24h": {
      "starttime": 12,
      "endtime": 0,
      "windspeed": {
        "altitude9k": 18.4,
        "altitude12k": 21.9,
        "altitude18k": 34.5
      },
      "winddirection": {
        "altitude9k": 260,
        "altitude12k": 260,
        "altitude18k": 230
      },
      "temperature": {
        "altitude9k": 23,
        "altitude12k": 12,
        "altitude18k": -13
      }
    }
  },
  "sounding": [
    {
      "Pressure_mb": 866.8,
      "Altitude_m": 1289,
      "Temp_c": 10.8,
      "Dewpoint_c": 2.1,
      "Wind_Direction": 172,
      "Wind_Speed_kt": 3.5
    },
    {
      "Pressure_mb": 866.2,
      "Altitude_m": 1297,
      "Temp_c": 10.8,
      "Dewpoint_c": 2,
      "Wind_Direction": 171,
      "Wind_Speed_kt": 7.9
    },
    {
      "Pressure_mb": 865.6,
      "Altitude_m": 1305,
      "Temp_c": 10.9,
      "Dewpoint_c": 1.8,
      "Wind_Direction": 171,
      "Wind_Speed_kt": 7.9
    },
    {
      "Pressure_mb": 864.9,
      "Altitude_m": 1312,
      "Temp_c": 10.9,
      "Dewpoint_c": 1.6,
      "Wind_Direction": 171,
      "Wind_Speed_kt": 7.9
    },
    {
      "Pressure_mb": 864.3,
      "Altitude_m": 1316,
      "Temp_c": 10.9,
      "Dewpoint_c": 1.4,
      "Wind_Direction": 171,
      "Wind_Speed_kt": 7.9
    },
    {
      "Pressure_mb": 863.6,
      "Altitude_m": 1321,
      "Temp_c": 11,
      "Dewpoint_c": 1.2,
      "Wind_Direction": 171,
      "Wind_Speed_kt": 7.9
    },
    {
      "Pressure_mb": 863,
      "Altitude_m": 1326,
      "Temp_c": 11,
      "Dewpoint_c": 1,
      "Wind_Direction": 171,
      "Wind_Speed_kt": 7.9
    },
    {
      "Pressure_mb": 862.7,
      "Altitude_m": 1329,
      "Temp_c": 11,
      "Dewpoint_c": 0.8,
      "Wind_Direction": 171,
      "Wind_Speed_kt": 7.9
    },
    {
      "Pressure_mb": 862,
      "Altitude_m": 1336,
      "Temp_c": 10.9,
      "Dewpoint_c": 0.6,
      "Wind_Direction": 170,
      "Wind_Speed_kt": 7.9
    },
    {
      "Pressure_mb": 861.5,
      "Altitude_m": 1341,
      "Temp_c": 10.9,
      "Dewpoint_c": 0.6,
      "Wind_Direction": 170,
      "Wind_Speed_kt": 7.8
    },
    {
      "Pressure_mb": 861,
      "Altitude_m": 1346,
      "Temp_c": 10.9,
      "Dewpoint_c": 0.5,
      "Wind_Direction": 170,
      "Wind_Speed_kt": 7.8
    },
    {
      "Pressure_mb": 860.5,
      "Altitude_m": 1350,
      "Temp_c": 10.8,
      "Dewpoint_c": 0.5,
      "Wind_Direction": 169,
      "Wind_Speed_kt": 7.8
    },
    {
      "Pressure_mb": 860,
      "Altitude_m": 1355,
      "Temp_c": 10.8,
      "Dewpoint_c": 0.5,
      "Wind_Direction": 169,
      "Wind_Speed_kt": 7.7
    },
    {
      "Pressure_mb": 859.4,
      "Altitude_m": 1360,
      "Temp_c": 10.7,
      "Dewpoint_c": 0.4,
      "Wind_Direction": 169,
      "Wind_Speed_kt": 7.7
    },
    {
      "Pressure_mb": 858.9,
      "Altitude_m": 1365,
      "Temp_c": 10.7,
      "Dewpoint_c": 0.4,
      "Wind_Direction": 168,
      "Wind_Speed_kt": 7.7
    },
    {
      "Pressure_mb": 858.4,
      "Altitude_m": 1370,
      "Temp_c": 10.7,
      "Dewpoint_c": 0.4,
      "Wind_Direction": 168,
      "Wind_Speed_kt": 7.6
    },
    {
      "Pressure_mb": 857.8,
      "Altitude_m": 1375,
      "Temp_c": 10.6,
      "Dewpoint_c": 0.3,
      "Wind_Direction": 168,
      "Wind_Speed_kt": 7.7
    },
    {
      "Pressure_mb": 857.3,
      "Altitude_m": 1380,
      "Temp_c": 10.6,
      "Dewpoint_c": 0.3,
      "Wind_Direction": 167,
      "Wind_Speed_kt": 7.7
    },
    {
      "Pressure_mb": 856.8,
      "Altitude_m": 1386,
      "Temp_c": 10.5,
      "Dewpoint_c": 0.2,
      "Wind_Direction": 167,
      "Wind_Speed_kt": 7.8
    },
    {
      "Pressure_mb": 856.2,
      "Altitude_m": 1392,
      "Temp_c": 10.5,
      "Dewpoint_c": 0.2,
      "Wind_Direction": 167,
      "Wind_Speed_kt": 7.8
    },
    {
      "Pressure_mb": 855.8,
      "Altitude_m": 1396,
      "Temp_c": 10.5,
      "Dewpoint_c": 0.2,
      "Wind_Direction": 167,
      "Wind_Speed_kt": 7.8
    },
    {
      "Pressure_mb": 855,
      "Altitude_m": 1403,
      "Temp_c": 10.4,
      "Dewpoint_c": 0.1,
      "Wind_Direction": 167,
      "Wind_Speed_kt": 7.9
    },
    {
      "Pressure_mb": 854.4,
      "Altitude_m": 1409,
      "Temp_c": 10.3,
      "Dewpoint_c": 0.1,
      "Wind_Direction": 166,
      "Wind_Speed_kt": 7.9
    },
    {
      "Pressure_mb": 853.8,
      "Altitude_m": 1415,
      "Temp_c": 10.3,
      "Dewpoint_c": 0.1,
      "Wind_Direction": 166,
      "Wind_Speed_kt": 8
    },
    {
      "Pressure_mb": 853.2,
      "Altitude_m": 1421,
      "Temp_c": 10.3,
      "Dewpoint_c": 0.1,
      "Wind_Direction": 166,
      "Wind_Speed_kt": 8
    },
    {
      "Pressure_mb": 852.6,
      "Altitude_m": 1427,
      "Temp_c": 10.2,
      "Dewpoint_c": 0,
      "Wind_Direction": 166,
      "Wind_Speed_kt": 8.1
    },
    {
      "Pressure_mb": 852,
      "Altitude_m": 1432,
      "Temp_c": 10.2,
      "Dewpoint_c": 0,
      "Wind_Direction": 166,
      "Wind_Speed_kt": 8.1
    },
    {
      "Pressure_mb": 851.4,
      "Altitude_m": 1438,
      "Temp_c": 10.1,
      "Dewpoint_c": 0,
      "Wind_Direction": 165,
      "Wind_Speed_kt": 8.2
    },
    {
      "Pressure_mb": 850.8,
      "Altitude_m": 1444,
      "Temp_c": 10.1,
      "Dewpoint_c": -0.1,
      "Wind_Direction": 165,
      "Wind_Speed_kt": 8.2
    },
    {
      "Pressure_mb": 850,
      "Altitude_m": 1452,
      "Temp_c": 10,
      "Dewpoint_c": -0.1,
      "Wind_Direction": 165,
      "Wind_Speed_kt": 8.3
    },
    {
      "Pressure_mb": 849.5,
      "Altitude_m": 1457,
      "Temp_c": 10,
      "Dewpoint_c": -0.1,
      "Wind_Direction": 165,
      "Wind_Speed_kt": 8.4
    },
    {
      "Pressure_mb": 848.9,
      "Altitude_m": 1463,
      "Temp_c": 9.9,
      "Dewpoint_c": -0.1,
      "Wind_Direction": 165,
      "Wind_Speed_kt": 8.4
    },
    {
      "Pressure_mb": 848.3,
      "Altitude_m": 1469,
      "Temp_c": 9.9,
      "Dewpoint_c": -0.2,
      "Wind_Direction": 165,
      "Wind_Speed_kt": 8.5
    },
    {
      "Pressure_mb": 847.7,
      "Altitude_m": 1475,
      "Temp_c": 9.8,
      "Dewpoint_c": -0.2,
      "Wind_Direction": 165,
      "Wind_Speed_kt": 8.6
    },
    {
      "Pressure_mb": 847.1,
      "Altitude_m": 1481,
      "Temp_c": 9.8,
      "Dewpoint_c": -0.2,
      "Wind_Direction": 165,
      "Wind_Speed_kt": 8.7
    },
    {
      "Pressure_mb": 846.5,
      "Altitude_m": 1487,
      "Temp_c": 9.8,
      "Dewpoint_c": -0.2,
      "Wind_Direction": 165,
      "Wind_Speed_kt": 8.8
    },
    {
      "Pressure_mb": 845.9,
      "Altitude_m": 1492,
      "Temp_c": 9.7,
      "Dewpoint_c": -0.2,
      "Wind_Direction": 165,
      "Wind_Speed_kt": 8.9
    },
    {
      "Pressure_mb": 845.2,
      "Altitude_m": 1500,
      "Temp_c": 9.7,
      "Dewpoint_c": -0.2,
      "Wind_Direction": 165,
      "Wind_Speed_kt": 9
    },
    {
      "Pressure_mb": 844.9,
      "Altitude_m": 1503,
      "Temp_c": 9.7,
      "Dewpoint_c": -0.2,
      "Wind_Direction": 165,
      "Wind_Speed_kt": 9
    },
    {
      "Pressure_mb": 844.4,
      "Altitude_m": 1508,
      "Temp_c": 9.7,
      "Dewpoint_c": -0.1,
      "Wind_Direction": 165,
      "Wind_Speed_kt": 9.1
    },
    {
      "Pressure_mb": 843.9,
      "Altitude_m": 1513,
      "Temp_c": 9.6,
      "Dewpoint_c": -0.1,
      "Wind_Direction": 165,
      "Wind_Speed_kt": 9.2
    },
    {
      "Pressure_mb": 843.4,
      "Altitude_m": 1518,
      "Temp_c": 9.6,
      "Dewpoint_c": -0.1,
      "Wind_Direction": 165,
      "Wind_Speed_kt": 9.3
    },
    {
      "Pressure_mb": 842.8,
      "Altitude_m": 1522,
      "Temp_c": 9.6,
      "Dewpoint_c": -0.1,
      "Wind_Direction": 165,
      "Wind_Speed_kt": 9.4
    },
    {
      "Pressure_mb": 842.4,
      "Altitude_m": 1527,
      "Temp_c": 9.5,
      "Dewpoint_c": -0.1,
      "Wind_Direction": 165,
      "Wind_Speed_kt": 9.5
    },
    {
      "Pressure_mb": 841.9,
      "Altitude_m": 1532,
      "Temp_c": 9.5,
      "Dewpoint_c": -0.1,
      "Wind_Direction": 165,
      "Wind_Speed_kt": 9.5
    },
    {
      "Pressure_mb": 841.4,
      "Altitude_m": 1537,
      "Temp_c": 9.5,
      "Dewpoint_c": -0.1,
      "Wind_Direction": 165,
      "Wind_Speed_kt": 9.6
    },
    {
      "Pressure_mb": 840.9,
      "Altitude_m": 1541,
      "Temp_c": 9.5,
      "Dewpoint_c": -0.1,
      "Wind_Direction": 166,
      "Wind_Speed_kt": 9.7
    },
    {
      "Pressure_mb": 840.4,
      "Altitude_m": 1546,
      "Temp_c": 9.4,
      "Dewpoint_c": -0.1,
      "Wind_Direction": 166,
      "Wind_Speed_kt": 9.8
    },
    {
      "Pressure_mb": 839.9,
      "Altitude_m": 1551,
      "Temp_c": 9.4,
      "Dewpoint_c": -0.1,
      "Wind_Direction": 166,
      "Wind_Speed_kt": 9.9
    },
    {
      "Pressure_mb": 839.5,
      "Altitude_m": 1556,
      "Temp_c": 9.3,
      "Dewpoint_c": -0.2,
      "Wind_Direction": 166,
      "Wind_Speed_kt": 0
    },
    {
      "Pressure_mb": 839,
      "Altitude_m": 1561,
      "Temp_c": 9.3,
      "Dewpoint_c": -0.2,
      "Wind_Direction": 166,
      "Wind_Speed_kt": 0.1
    },
    {
      "Pressure_mb": 838.6,
      "Altitude_m": 1565,
      "Temp_c": 9.2,
      "Dewpoint_c": -0.2,
      "Wind_Direction": 166,
      "Wind_Speed_kt": 0.2
    },
    {
      "Pressure_mb": 838.1,
      "Altitude_m": 1570,
      "Temp_c": 9.2,
      "Dewpoint_c": -0.2,
      "Wind_Direction": 166,
      "Wind_Speed_kt": 0.3
    },
    {
      "Pressure_mb": 837.6,
      "Altitude_m": 1574,
      "Temp_c": 9.1,
      "Dewpoint_c": -0.2,
      "Wind_Direction": 166,
      "Wind_Speed_kt": 0.4
    },
    {
      "Pressure_mb": 837.2,
      "Altitude_m": 1578,
      "Temp_c": 9.1,
      "Dewpoint_c": -0.2,
      "Wind_Direction": 166,
      "Wind_Speed_kt": 0.5
    },
    {
      "Pressure_mb": 836.7,
      "Altitude_m": 1583,
      "Temp_c": 9.1,
      "Dewpoint_c": -0.3,
      "Wind_Direction": 166,
      "Wind_Speed_kt": 0.6
    },
    {
      "Pressure_mb": 836.1,
      "Altitude_m": 1587,
      "Temp_c": 9,
      "Dewpoint_c": -0.3,
      "Wind_Direction": 167,
      "Wind_Speed_kt": 0.7
    },
    {
      "Pressure_mb": 835.6,
      "Altitude_m": 1593,
      "Temp_c": 9,
      "Dewpoint_c": -0.3,
      "Wind_Direction": 167,
      "Wind_Speed_kt": 0.8
    },
    {
      "Pressure_mb": 835.1,
      "Altitude_m": 1598,
      "Temp_c": 8.9,
      "Dewpoint_c": -0.3,
      "Wind_Direction": 167,
      "Wind_Speed_kt": 0.9
    },
    {
      "Pressure_mb": 834.5,
      "Altitude_m": 1604,
      "Temp_c": 8.9,
      "Dewpoint_c": -0.3,
      "Wind_Direction": 167,
      "Wind_Speed_kt": 1
    },
    {
      "Pressure_mb": 834,
      "Altitude_m": 1610,
      "Temp_c": 8.8,
      "Dewpoint_c": -0.3,
      "Wind_Direction": 167,
      "Wind_Speed_kt": 1.1
    },
    {
      "Pressure_mb": 833.5,
      "Altitude_m": 1616,
      "Temp_c": 8.8,
      "Dewpoint_c": -0.3,
      "Wind_Direction": 167,
      "Wind_Speed_kt": 1.2
    },
    {
      "Pressure_mb": 833,
      "Altitude_m": 1621,
      "Temp_c": 8.8,
      "Dewpoint_c": -0.3,
      "Wind_Direction": 167,
      "Wind_Speed_kt": 1.4
    },
    {
      "Pressure_mb": 832.4,
      "Altitude_m": 1626,
      "Temp_c": 8.7,
      "Dewpoint_c": -0.3,
      "Wind_Direction": 167,
      "Wind_Speed_kt": 1.5
    },
    {
      "Pressure_mb": 831.9,
      "Altitude_m": 1631,
      "Temp_c": 8.7,
      "Dewpoint_c": -0.3,
      "Wind_Direction": 167,
      "Wind_Speed_kt": 1.6
    },
    {
      "Pressure_mb": 831.4,
      "Altitude_m": 1636,
      "Temp_c": 8.7,
      "Dewpoint_c": -0.3,
      "Wind_Direction": 167,
      "Wind_Speed_kt": 1.7
    },
    {
      "Pressure_mb": 830.9,
      "Altitude_m": 1641,
      "Temp_c": 8.7,
      "Dewpoint_c": -0.3,
      "Wind_Direction": 168,
      "Wind_Speed_kt": 1.7
    },
    {
      "Pressure_mb": 830.4,
      "Altitude_m": 1645,
      "Temp_c": 8.6,
      "Dewpoint_c": -0.3,
      "Wind_Direction": 168,
      "Wind_Speed_kt": 1.8
    },
    {
      "Pressure_mb": 830,
      "Altitude_m": 1650,
      "Temp_c": 8.6,
      "Dewpoint_c": -0.3,
      "Wind_Direction": 169,
      "Wind_Speed_kt": 1.9
    },
    {
      "Pressure_mb": 829.5,
      "Altitude_m": 1655,
      "Temp_c": 8.6,
      "Dewpoint_c": -0.3,
      "Wind_Direction": 169,
      "Wind_Speed_kt": 2
    },
    {
      "Pressure_mb": 829,
      "Altitude_m": 1659,
      "Temp_c": 8.5,
      "Dewpoint_c": -0.2,
      "Wind_Direction": 170,
      "Wind_Speed_kt": 2.1
    },
    {
      "Pressure_mb": 828.5,
      "Altitude_m": 1664,
      "Temp_c": 8.5,
      "Dewpoint_c": -0.2,
      "Wind_Direction": 170,
      "Wind_Speed_kt": 2.2
    },
    {
      "Pressure_mb": 828.1,
      "Altitude_m": 1669,
      "Temp_c": 8.5,
      "Dewpoint_c": -0.2,
      "Wind_Direction": 170,
      "Wind_Speed_kt": 2.3
    },
    {
      "Pressure_mb": 827.7,
      "Altitude_m": 1673,
      "Temp_c": 8.4,
      "Dewpoint_c": -0.2,
      "Wind_Direction": 171,
      "Wind_Speed_kt": 2.4
    },
    {
      "Pressure_mb": 827.3,
      "Altitude_m": 1676,
      "Temp_c": 8.4,
      "Dewpoint_c": -0.2,
      "Wind_Direction": 171,
      "Wind_Speed_kt": 2.5
    },
    {
      "Pressure_mb": 826.9,
      "Altitude_m": 1680,
      "Temp_c": 8.3,
      "Dewpoint_c": -0.2,
      "Wind_Direction": 172,
      "Wind_Speed_kt": 2.6
    },
    {
      "Pressure_mb": 826.5,
      "Altitude_m": 1684,
      "Temp_c": 8.3,
      "Dewpoint_c": -0.3,
      "Wind_Direction": 172,
      "Wind_Speed_kt": 2.6
    },
    {
      "Pressure_mb": 826.2,
      "Altitude_m": 1688,
      "Temp_c": 8.3,
      "Dewpoint_c": -0.3,
      "Wind_Direction": 173,
      "Wind_Speed_kt": 2.7
    },
    {
      "Pressure_mb": 825.8,
      "Altitude_m": 1692,
      "Temp_c": 8.2,
      "Dewpoint_c": -0.3,
      "Wind_Direction": 173,
      "Wind_Speed_kt": 2.8
    },
    {
      "Pressure_mb": 825.3,
      "Altitude_m": 1697,
      "Temp_c": 8.2,
      "Dewpoint_c": -0.3,
      "Wind_Direction": 173,
      "Wind_Speed_kt": 2.9
    },
    {
      "Pressure_mb": 824.8,
      "Altitude_m": 1701,
      "Temp_c": 8.1,
      "Dewpoint_c": -0.3,
      "Wind_Direction": 174,
      "Wind_Speed_kt": 3
    },
    {
      "Pressure_mb": 824.3,
      "Altitude_m": 1706,
      "Temp_c": 8.1,
      "Dewpoint_c": -0.3,
      "Wind_Direction": 174,
      "Wind_Speed_kt": 3.1
    },
    {
      "Pressure_mb": 823.8,
      "Altitude_m": 1711,
      "Temp_c": 8.1,
      "Dewpoint_c": -0.3,
      "Wind_Direction": 175,
      "Wind_Speed_kt": 3.2
    },
    {
      "Pressure_mb": 823.4,
      "Altitude_m": 1716,
      "Temp_c": 8,
      "Dewpoint_c": -0.3,
      "Wind_Direction": 175,
      "Wind_Speed_kt": 3.3
    },
    {
      "Pressure_mb": 822.9,
      "Altitude_m": 1721,
      "Temp_c": 8,
      "Dewpoint_c": -0.3,
      "Wind_Direction": 175,
      "Wind_Speed_kt": 3.4
    },
    {
      "Pressure_mb": 822.5,
      "Altitude_m": 1725,
      "Temp_c": 7.9,
      "Dewpoint_c": -0.3,
      "Wind_Direction": 176,
      "Wind_Speed_kt": 3.5
    },
    {
      "Pressure_mb": 822,
      "Altitude_m": 1729,
      "Temp_c": 7.9,
      "Dewpoint_c": -0.3,
      "Wind_Direction": 176,
      "Wind_Speed_kt": 3.5
    },
    {
      "Pressure_mb": 821.6,
      "Altitude_m": 1734,
      "Temp_c": 7.9,
      "Dewpoint_c": -0.3,
      "Wind_Direction": 176,
      "Wind_Speed_kt": 3.5
    },
    {
      "Pressure_mb": 821.2,
      "Altitude_m": 1738,
      "Temp_c": 7.8,
      "Dewpoint_c": -0.3,
      "Wind_Direction": 176,
      "Wind_Speed_kt": 3.5
    },
    {
      "Pressure_mb": 820.8,
      "Altitude_m": 1742,
      "Temp_c": 7.8,
      "Dewpoint_c": -0.3,
      "Wind_Direction": 177,
      "Wind_Speed_kt": 3.5
    },
    {
      "Pressure_mb": 820.3,
      "Altitude_m": 1746,
      "Temp_c": 7.7,
      "Dewpoint_c": -0.3,
      "Wind_Direction": 177,
      "Wind_Speed_kt": 3.5
    },
    {
      "Pressure_mb": 819.9,
      "Altitude_m": 1750,
      "Temp_c": 7.7,
      "Dewpoint_c": -0.3,
      "Wind_Direction": 177,
      "Wind_Speed_kt": 3.5
    },
    {
      "Pressure_mb": 819.5,
      "Altitude_m": 1754,
      "Temp_c": 7.7,
      "Dewpoint_c": -0.3,
      "Wind_Direction": 178,
      "Wind_Speed_kt": 3.5
    },
    {
      "Pressure_mb": 819.1,
      "Altitude_m": 1758,
      "Temp_c": 7.6,
      "Dewpoint_c": -0.3,
      "Wind_Direction": 178,
      "Wind_Speed_kt": 3.5
    },
    {
      "Pressure_mb": 818.7,
      "Altitude_m": 1763,
      "Temp_c": 7.6,
      "Dewpoint_c": -0.4,
      "Wind_Direction": 178,
      "Wind_Speed_kt": 3.5
    },
    {
      "Pressure_mb": 818.3,
      "Altitude_m": 1767,
      "Temp_c": 7.6,
      "Dewpoint_c": -0.4,
      "Wind_Direction": 178,
      "Wind_Speed_kt": 3.5
    },
    {
      "Pressure_mb": 817.9,
      "Altitude_m": 1771,
      "Temp_c": 7.5,
      "Dewpoint_c": -0.4,
      "Wind_Direction": 179,
      "Wind_Speed_kt": 3.5
    },
    {
      "Pressure_mb": 817.5,
      "Altitude_m": 1775,
      "Temp_c": 7.5,
      "Dewpoint_c": -0.4,
      "Wind_Direction": 179,
      "Wind_Speed_kt": 3.4
    },
    {
      "Pressure_mb": 817.1,
      "Altitude_m": 1779,
      "Temp_c": 7.5,
      "Dewpoint_c": -0.4,
      "Wind_Direction": 179,
      "Wind_Speed_kt": 3.4
    },
    {
      "Pressure_mb": 816.6,
      "Altitude_m": 1783,
      "Temp_c": 7.4,
      "Dewpoint_c": -0.4,
      "Wind_Direction": 180,
      "Wind_Speed_kt": 3.4
    },
    {
      "Pressure_mb": 816.2,
      "Altitude_m": 1788,
      "Temp_c": 7.4,
      "Dewpoint_c": -0.4,
      "Wind_Direction": 180,
      "Wind_Speed_kt": 3.4
    },
    {
      "Pressure_mb": 815.8,
      "Altitude_m": 1792,
      "Temp_c": 7.4,
      "Dewpoint_c": -0.4,
      "Wind_Direction": 180,
      "Wind_Speed_kt": 3.4
    },
    {
      "Pressure_mb": 815.4,
      "Altitude_m": 1796,
      "Temp_c": 7.3,
      "Dewpoint_c": -0.4,
      "Wind_Direction": 180,
      "Wind_Speed_kt": 3.4
    },
    {
      "Pressure_mb": 815,
      "Altitude_m": 1800,
      "Temp_c": 7.3,
      "Dewpoint_c": -0.5,
      "Wind_Direction": 181,
      "Wind_Speed_kt": 3.4
    },
    {
      "Pressure_mb": 814.5,
      "Altitude_m": 1805,
      "Temp_c": 7.2,
      "Dewpoint_c": -0.5,
      "Wind_Direction": 181,
      "Wind_Speed_kt": 3.4
    },
    {
      "Pressure_mb": 814,
      "Altitude_m": 1809,
      "Temp_c": 7.2,
      "Dewpoint_c": -0.5,
      "Wind_Direction": 181,
      "Wind_Speed_kt": 3.4
    },
    {
      "Pressure_mb": 813.6,
      "Altitude_m": 1814,
      "Temp_c": 7.2,
      "Dewpoint_c": -0.5,
      "Wind_Direction": 181,
      "Wind_Speed_kt": 3.4
    },
    {
      "Pressure_mb": 813.1,
      "Altitude_m": 1818,
      "Temp_c": 7.1,
      "Dewpoint_c": -0.6,
      "Wind_Direction": 181,
      "Wind_Speed_kt": 3.3
    },
    {
      "Pressure_mb": 812.7,
      "Altitude_m": 1823,
      "Temp_c": 7.1,
      "Dewpoint_c": -0.6,
      "Wind_Direction": 181,
      "Wind_Speed_kt": 3.3
    },
    {
      "Pressure_mb": 812.3,
      "Altitude_m": 1828,
      "Temp_c": 7,
      "Dewpoint_c": -0.6,
      "Wind_Direction": 182,
      "Wind_Speed_kt": 3.3
    },
    {
      "Pressure_mb": 811.9,
      "Altitude_m": 1833,
      "Temp_c": 7,
      "Dewpoint_c": -0.7,
      "Wind_Direction": 182,
      "Wind_Speed_kt": 3.2
    },
    {
      "Pressure_mb": 811.4,
      "Altitude_m": 1838,
      "Temp_c": 6.9,
      "Dewpoint_c": -0.7,
      "Wind_Direction": 182,
      "Wind_Speed_kt": 3.2
    },
    {
      "Pressure_mb": 811,
      "Altitude_m": 1842,
      "Temp_c": 6.9,
      "Dewpoint_c": -0.7,
      "Wind_Direction": 182,
      "Wind_Speed_kt": 3.1
    },
    {
      "Pressure_mb": 810.6,
      "Altitude_m": 1845,
      "Temp_c": 6.9,
      "Dewpoint_c": -0.7,
      "Wind_Direction": 182,
      "Wind_Speed_kt": 3.1
    },
    {
      "Pressure_mb": 810.3,
      "Altitude_m": 1848,
      "Temp_c": 6.9,
      "Dewpoint_c": -0.7,
      "Wind_Direction": 182,
      "Wind_Speed_kt": 3
    },
    {
      "Pressure_mb": 809.8,
      "Altitude_m": 1852,
      "Temp_c": 6.9,
      "Dewpoint_c": -0.8,
      "Wind_Direction": 182,
      "Wind_Speed_kt": 3
    },
    {
      "Pressure_mb": 809.5,
      "Altitude_m": 1855,
      "Temp_c": 6.9,
      "Dewpoint_c": -0.8,
      "Wind_Direction": 182,
      "Wind_Speed_kt": 3
    },
    {
      "Pressure_mb": 809.1,
      "Altitude_m": 1858,
      "Temp_c": 6.9,
      "Dewpoint_c": -0.8,
      "Wind_Direction": 182,
      "Wind_Speed_kt": 2.9
    },
    {
      "Pressure_mb": 808.7,
      "Altitude_m": 1862,
      "Temp_c": 6.9,
      "Dewpoint_c": -0.9,
      "Wind_Direction": 182,
      "Wind_Speed_kt": 2.9
    },
    {
      "Pressure_mb": 808.3,
      "Altitude_m": 1867,
      "Temp_c": 6.9,
      "Dewpoint_c": -0.9,
      "Wind_Direction": 182,
      "Wind_Speed_kt": 2.8
    },
    {
      "Pressure_mb": 807.9,
      "Altitude_m": 1872,
      "Temp_c": 6.9,
      "Dewpoint_c": -1,
      "Wind_Direction": 182,
      "Wind_Speed_kt": 2.8
    },
    {
      "Pressure_mb": 807.5,
      "Altitude_m": 1876,
      "Temp_c": 6.9,
      "Dewpoint_c": -1,
      "Wind_Direction": 182,
      "Wind_Speed_kt": 2.7
    },
    {
      "Pressure_mb": 807,
      "Altitude_m": 1881,
      "Temp_c": 6.9,
      "Dewpoint_c": -1.1,
      "Wind_Direction": 182,
      "Wind_Speed_kt": 2.7
    },
    {
      "Pressure_mb": 806.5,
      "Altitude_m": 1886,
      "Temp_c": 6.9,
      "Dewpoint_c": -1.1,
      "Wind_Direction": 182,
      "Wind_Speed_kt": 2.6
    },
    {
      "Pressure_mb": 806.1,
      "Altitude_m": 1890,
      "Temp_c": 6.9,
      "Dewpoint_c": -1.1,
      "Wind_Direction": 182,
      "Wind_Speed_kt": 2.6
    },
    {
      "Pressure_mb": 805.6,
      "Altitude_m": 1895,
      "Temp_c": 6.9,
      "Dewpoint_c": -1.2,
      "Wind_Direction": 182,
      "Wind_Speed_kt": 2.6
    },
    {
      "Pressure_mb": 805.1,
      "Altitude_m": 1900,
      "Temp_c": 6.9,
      "Dewpoint_c": -1.2,
      "Wind_Direction": 183,
      "Wind_Speed_kt": 2.5
    },
    {
      "Pressure_mb": 804.6,
      "Altitude_m": 1905,
      "Temp_c": 6.9,
      "Dewpoint_c": -1.3,
      "Wind_Direction": 183,
      "Wind_Speed_kt": 2.3
    },
    {
      "Pressure_mb": 804.1,
      "Altitude_m": 1910,
      "Temp_c": 6.8,
      "Dewpoint_c": -1.3,
      "Wind_Direction": 184,
      "Wind_Speed_kt": 2.2
    },
    {
      "Pressure_mb": 803.5,
      "Altitude_m": 1915,
      "Temp_c": 6.8,
      "Dewpoint_c": -1.4,
      "Wind_Direction": 185,
      "Wind_Speed_kt": 2.1
    },
    {
      "Pressure_mb": 803,
      "Altitude_m": 1921,
      "Temp_c": 6.7,
      "Dewpoint_c": -1.4,
      "Wind_Direction": 185,
      "Wind_Speed_kt": 2
    },
    {
      "Pressure_mb": 802.5,
      "Altitude_m": 1927,
      "Temp_c": 6.7,
      "Dewpoint_c": -1.5,
      "Wind_Direction": 186,
      "Wind_Speed_kt": 1.9
    },
    {
      "Pressure_mb": 801.9,
      "Altitude_m": 1933,
      "Temp_c": 6.7,
      "Dewpoint_c": -1.5,
      "Wind_Direction": 186,
      "Wind_Speed_kt": 1.8
    },
    {
      "Pressure_mb": 801.3,
      "Altitude_m": 1939,
      "Temp_c": 6.6,
      "Dewpoint_c": -1.6,
      "Wind_Direction": 187,
      "Wind_Speed_kt": 1.7
    },
    {
      "Pressure_mb": 800.7,
      "Altitude_m": 1945,
      "Temp_c": 6.6,
      "Dewpoint_c": -1.6,
      "Wind_Direction": 188,
      "Wind_Speed_kt": 1.6
    },
    {
      "Pressure_mb": 800.1,
      "Altitude_m": 1951,
      "Temp_c": 6.5,
      "Dewpoint_c": -1.7,
      "Wind_Direction": 188,
      "Wind_Speed_kt": 1.5
    },
    {
      "Pressure_mb": 799.5,
      "Altitude_m": 1957,
      "Temp_c": 6.5,
      "Dewpoint_c": -1.7,
      "Wind_Direction": 189,
      "Wind_Speed_kt": 1.4
    },
    {
      "Pressure_mb": 798.9,
      "Altitude_m": 1964,
      "Temp_c": 6.4,
      "Dewpoint_c": -1.8,
      "Wind_Direction": 190,
      "Wind_Speed_kt": 1.3
    },
    {
      "Pressure_mb": 798.3,
      "Altitude_m": 1970,
      "Temp_c": 6.4,
      "Dewpoint_c": -1.8,
      "Wind_Direction": 190,
      "Wind_Speed_kt": 1.2
    },
    {
      "Pressure_mb": 797.7,
      "Altitude_m": 1976,
      "Temp_c": 6.4,
      "Dewpoint_c": -1.9,
      "Wind_Direction": 191,
      "Wind_Speed_kt": 1.1
    },
    {
      "Pressure_mb": 797.1,
      "Altitude_m": 1983,
      "Temp_c": 6.3,
      "Dewpoint_c": -1.9,
      "Wind_Direction": 192,
      "Wind_Speed_kt": 1
    },
    {
      "Pressure_mb": 796.7,
      "Altitude_m": 1987,
      "Temp_c": 6.3,
      "Dewpoint_c": -1.9,
      "Wind_Direction": 192,
      "Wind_Speed_kt": 1
    },
    {
      "Pressure_mb": 795.9,
      "Altitude_m": 1995,
      "Temp_c": 6.2,
      "Dewpoint_c": -2,
      "Wind_Direction": 193,
      "Wind_Speed_kt": 0.9
    },
    {
      "Pressure_mb": 795.2,
      "Altitude_m": 2002,
      "Temp_c": 6.2,
      "Dewpoint_c": -2,
      "Wind_Direction": 194,
      "Wind_Speed_kt": 0.8
    },
    {
      "Pressure_mb": 794.6,
      "Altitude_m": 2008,
      "Temp_c": 6.1,
      "Dewpoint_c": -2.1,
      "Wind_Direction": 194,
      "Wind_Speed_kt": 0.7
    },
    {
      "Pressure_mb": 794.1,
      "Altitude_m": 2014,
      "Temp_c": 6.1,
      "Dewpoint_c": -2.1,
      "Wind_Direction": 195,
      "Wind_Speed_kt": 0.6
    },
    {
      "Pressure_mb": 793.5,
      "Altitude_m": 2020,
      "Temp_c": 6,
      "Dewpoint_c": -2.2,
      "Wind_Direction": 195,
      "Wind_Speed_kt": 0.5
    },
    {
      "Pressure_mb": 793,
      "Altitude_m": 2025,
      "Temp_c": 6,
      "Dewpoint_c": -2.2,
      "Wind_Direction": 195,
      "Wind_Speed_kt": 0.4
    },
    {
      "Pressure_mb": 792.5,
      "Altitude_m": 2031,
      "Temp_c": 6,
      "Dewpoint_c": -2.3,
      "Wind_Direction": 196,
      "Wind_Speed_kt": 0.3
    },
    {
      "Pressure_mb": 791.9,
      "Altitude_m": 2036,
      "Temp_c": 5.9,
      "Dewpoint_c": -2.3,
      "Wind_Direction": 196,
      "Wind_Speed_kt": 0.2
    },
    {
      "Pressure_mb": 791.4,
      "Altitude_m": 2042,
      "Temp_c": 5.9,
      "Dewpoint_c": -2.3,
      "Wind_Direction": 196,
      "Wind_Speed_kt": 0.1
    },
    {
      "Pressure_mb": 790.8,
      "Altitude_m": 2047,
      "Temp_c": 5.8,
      "Dewpoint_c": -2.4,
      "Wind_Direction": 196,
      "Wind_Speed_kt": 0
    },
    {
      "Pressure_mb": 790.2,
      "Altitude_m": 2053,
      "Temp_c": 5.8,
      "Dewpoint_c": -2.4,
      "Wind_Direction": 196,
      "Wind_Speed_kt": 9.9
    },
    {
      "Pressure_mb": 789.6,
      "Altitude_m": 2060,
      "Temp_c": 5.7,
      "Dewpoint_c": -2.5,
      "Wind_Direction": 196,
      "Wind_Speed_kt": 9.8
    },
    {
      "Pressure_mb": 789,
      "Altitude_m": 2066,
      "Temp_c": 5.7,
      "Dewpoint_c": -2.5,
      "Wind_Direction": 196,
      "Wind_Speed_kt": 9.7
    },
    {
      "Pressure_mb": 788.4,
      "Altitude_m": 2073,
      "Temp_c": 5.6,
      "Dewpoint_c": -2.6,
      "Wind_Direction": 197,
      "Wind_Speed_kt": 9.6
    },
    {
      "Pressure_mb": 787.7,
      "Altitude_m": 2079,
      "Temp_c": 5.6,
      "Dewpoint_c": -2.6,
      "Wind_Direction": 197,
      "Wind_Speed_kt": 9.5
    },
    {
      "Pressure_mb": 787.1,
      "Altitude_m": 2086,
      "Temp_c": 5.5,
      "Dewpoint_c": -2.6,
      "Wind_Direction": 197,
      "Wind_Speed_kt": 9.4
    },
    {
      "Pressure_mb": 786.4,
      "Altitude_m": 2093,
      "Temp_c": 5.4,
      "Dewpoint_c": -2.7,
      "Wind_Direction": 197,
      "Wind_Speed_kt": 9.3
    },
    {
      "Pressure_mb": 785.7,
      "Altitude_m": 2100,
      "Temp_c": 5.4,
      "Dewpoint_c": -2.7,
      "Wind_Direction": 197,
      "Wind_Speed_kt": 9.2
    },
    {
      "Pressure_mb": 785.1,
      "Altitude_m": 2107,
      "Temp_c": 5.3,
      "Dewpoint_c": -2.8,
      "Wind_Direction": 197,
      "Wind_Speed_kt": 9.1
    },
    {
      "Pressure_mb": 784.5,
      "Altitude_m": 2113,
      "Temp_c": 5.3,
      "Dewpoint_c": -2.8,
      "Wind_Direction": 197,
      "Wind_Speed_kt": 9
    },
    {
      "Pressure_mb": 783.8,
      "Altitude_m": 2120,
      "Temp_c": 5.2,
      "Dewpoint_c": -2.8,
      "Wind_Direction": 198,
      "Wind_Speed_kt": 8.9
    },
    {
      "Pressure_mb": 783.2,
      "Altitude_m": 2127,
      "Temp_c": 5.1,
      "Dewpoint_c": -2.9,
      "Wind_Direction": 198,
      "Wind_Speed_kt": 8.8
    },
    {
      "Pressure_mb": 782.5,
      "Altitude_m": 2133,
      "Temp_c": 5.1,
      "Dewpoint_c": -2.9,
      "Wind_Direction": 198,
      "Wind_Speed_kt": 8.7
    },
    {
      "Pressure_mb": 781.9,
      "Altitude_m": 2140,
      "Temp_c": 5,
      "Dewpoint_c": -3,
      "Wind_Direction": 198,
      "Wind_Speed_kt": 8.6
    },
    {
      "Pressure_mb": 781.3,
      "Altitude_m": 2147,
      "Temp_c": 5,
      "Dewpoint_c": -3,
      "Wind_Direction": 198,
      "Wind_Speed_kt": 8.4
    },
    {
      "Pressure_mb": 780.6,
      "Altitude_m": 2153,
      "Temp_c": 4.9,
      "Dewpoint_c": -3,
      "Wind_Direction": 198,
      "Wind_Speed_kt": 8.3
    },
    {
      "Pressure_mb": 780,
      "Altitude_m": 2160,
      "Temp_c": 4.9,
      "Dewpoint_c": -3.1,
      "Wind_Direction": 197,
      "Wind_Speed_kt": 8.2
    },
    {
      "Pressure_mb": 779.4,
      "Altitude_m": 2167,
      "Temp_c": 4.8,
      "Dewpoint_c": -3.1,
      "Wind_Direction": 197,
      "Wind_Speed_kt": 8
    },
    {
      "Pressure_mb": 778.7,
      "Altitude_m": 2173,
      "Temp_c": 4.8,
      "Dewpoint_c": -3.1,
      "Wind_Direction": 197,
      "Wind_Speed_kt": 7.9
    },
    {
      "Pressure_mb": 778.1,
      "Altitude_m": 2180,
      "Temp_c": 4.7,
      "Dewpoint_c": -3.2,
      "Wind_Direction": 196,
      "Wind_Speed_kt": 7.8
    },
    {
      "Pressure_mb": 777.4,
      "Altitude_m": 2187,
      "Temp_c": 4.7,
      "Dewpoint_c": -3.2,
      "Wind_Direction": 196,
      "Wind_Speed_kt": 7.6
    },
    {
      "Pressure_mb": 776.8,
      "Altitude_m": 2194,
      "Temp_c": 4.6,
      "Dewpoint_c": -3.2,
      "Wind_Direction": 195,
      "Wind_Speed_kt": 7.5
    },
    {
      "Pressure_mb": 776.1,
      "Altitude_m": 2200,
      "Temp_c": 4.6,
      "Dewpoint_c": -3.3,
      "Wind_Direction": 195,
      "Wind_Speed_kt": 7.4
    },
    {
      "Pressure_mb": 775.6,
      "Altitude_m": 2206,
      "Temp_c": 4.5,
      "Dewpoint_c": -3.3,
      "Wind_Direction": 195,
      "Wind_Speed_kt": 7.3
    },
    {
      "Pressure_mb": 775,
      "Altitude_m": 2212,
      "Temp_c": 4.5,
      "Dewpoint_c": -3.3,
      "Wind_Direction": 194,
      "Wind_Speed_kt": 7.1
    },
    {
      "Pressure_mb": 774.4,
      "Altitude_m": 2218,
      "Temp_c": 4.4,
      "Dewpoint_c": -3.4,
      "Wind_Direction": 194,
      "Wind_Speed_kt": 7
    },
    {
      "Pressure_mb": 773.9,
      "Altitude_m": 2224,
      "Temp_c": 4.4,
      "Dewpoint_c": -3.4,
      "Wind_Direction": 193,
      "Wind_Speed_kt": 6.9
    },
    {
      "Pressure_mb": 773.3,
      "Altitude_m": 2230,
      "Temp_c": 4.4,
      "Dewpoint_c": -3.4,
      "Wind_Direction": 193,
      "Wind_Speed_kt": 6.7
    },
    {
      "Pressure_mb": 772.7,
      "Altitude_m": 2236,
      "Temp_c": 4.3,
      "Dewpoint_c": -3.5,
      "Wind_Direction": 192,
      "Wind_Speed_kt": 6.6
    },
    {
      "Pressure_mb": 772.2,
      "Altitude_m": 2242,
      "Temp_c": 4.3,
      "Dewpoint_c": -3.5,
      "Wind_Direction": 192,
      "Wind_Speed_kt": 6.5
    },
    {
      "Pressure_mb": 771.6,
      "Altitude_m": 2248,
      "Temp_c": 4.2,
      "Dewpoint_c": -3.5,
      "Wind_Direction": 191,
      "Wind_Speed_kt": 6.4
    },
    {
      "Pressure_mb": 771,
      "Altitude_m": 2255,
      "Temp_c": 4.2,
      "Dewpoint_c": -3.6,
      "Wind_Direction": 191,
      "Wind_Speed_kt": 6.2
    },
    {
      "Pressure_mb": 770.4,
      "Altitude_m": 2261,
      "Temp_c": 4.1,
      "Dewpoint_c": -3.6,
      "Wind_Direction": 190,
      "Wind_Speed_kt": 6.1
    },
    {
      "Pressure_mb": 769.9,
      "Altitude_m": 2267,
      "Temp_c": 4.1,
      "Dewpoint_c": -3.6,
      "Wind_Direction": 189,
      "Wind_Speed_kt": 6
    },
    {
      "Pressure_mb": 769.3,
      "Altitude_m": 2272,
      "Temp_c": 4,
      "Dewpoint_c": -3.7,
      "Wind_Direction": 190,
      "Wind_Speed_kt": 6
    },
    {
      "Pressure_mb": 768.8,
      "Altitude_m": 2278,
      "Temp_c": 4,
      "Dewpoint_c": -3.7,
      "Wind_Direction": 190,
      "Wind_Speed_kt": 5.9
    },
    {
      "Pressure_mb": 768.3,
      "Altitude_m": 2284,
      "Temp_c": 3.9,
      "Dewpoint_c": -3.7,
      "Wind_Direction": 191,
      "Wind_Speed_kt": 5.9
    },
    {
      "Pressure_mb": 767.8,
      "Altitude_m": 2289,
      "Temp_c": 3.9,
      "Dewpoint_c": -3.7,
      "Wind_Direction": 191,
      "Wind_Speed_kt": 5.9
    },
    {
      "Pressure_mb": 767.2,
      "Altitude_m": 2295,
      "Temp_c": 3.8,
      "Dewpoint_c": -3.8,
      "Wind_Direction": 192,
      "Wind_Speed_kt": 5.9
    },
    {
      "Pressure_mb": 766.7,
      "Altitude_m": 2300,
      "Temp_c": 3.7,
      "Dewpoint_c": -3.8,
      "Wind_Direction": 193,
      "Wind_Speed_kt": 5.8
    },
    {
      "Pressure_mb": 766.2,
      "Altitude_m": 2305,
      "Temp_c": 3.7,
      "Dewpoint_c": -3.8,
      "Wind_Direction": 193,
      "Wind_Speed_kt": 5.8
    },
    {
      "Pressure_mb": 765.7,
      "Altitude_m": 2310,
      "Temp_c": 3.6,
      "Dewpoint_c": -3.9,
      "Wind_Direction": 194,
      "Wind_Speed_kt": 5.8
    },
    {
      "Pressure_mb": 765.3,
      "Altitude_m": 2315,
      "Temp_c": 3.6,
      "Dewpoint_c": -3.9,
      "Wind_Direction": 194,
      "Wind_Speed_kt": 5.8
    },
    {
      "Pressure_mb": 764.8,
      "Altitude_m": 2320,
      "Temp_c": 3.6,
      "Dewpoint_c": -3.9,
      "Wind_Direction": 195,
      "Wind_Speed_kt": 5.7
    },
    {
      "Pressure_mb": 764.3,
      "Altitude_m": 2325,
      "Temp_c": 3.5,
      "Dewpoint_c": -3.9,
      "Wind_Direction": 195,
      "Wind_Speed_kt": 5.7
    },
    {
      "Pressure_mb": 763.8,
      "Altitude_m": 2331,
      "Temp_c": 3.5,
      "Dewpoint_c": -4,
      "Wind_Direction": 196,
      "Wind_Speed_kt": 5.7
    },
    {
      "Pressure_mb": 763.3,
      "Altitude_m": 2336,
      "Temp_c": 3.4,
      "Dewpoint_c": -4,
      "Wind_Direction": 196,
      "Wind_Speed_kt": 5.7
    },
    {
      "Pressure_mb": 762.8,
      "Altitude_m": 2341,
      "Temp_c": 3.4,
      "Dewpoint_c": -4,
      "Wind_Direction": 197,
      "Wind_Speed_kt": 5.7
    },
    {
      "Pressure_mb": 762.4,
      "Altitude_m": 2346,
      "Temp_c": 3.3,
      "Dewpoint_c": -4,
      "Wind_Direction": 198,
      "Wind_Speed_kt": 5.6
    },
    {
      "Pressure_mb": 761.9,
      "Altitude_m": 2351,
      "Temp_c": 3.3,
      "Dewpoint_c": -4.1,
      "Wind_Direction": 198,
      "Wind_Speed_kt": 5.6
    },
    {
      "Pressure_mb": 761.4,
      "Altitude_m": 2356,
      "Temp_c": 3.2,
      "Dewpoint_c": -4.1,
      "Wind_Direction": 199,
      "Wind_Speed_kt": 5.6
    },
    {
      "Pressure_mb": 760.9,
      "Altitude_m": 2361,
      "Temp_c": 3.2,
      "Dewpoint_c": -4.1,
      "Wind_Direction": 199,
      "Wind_Speed_kt": 5.6
    },
    {
      "Pressure_mb": 760.4,
      "Altitude_m": 2367,
      "Temp_c": 3.1,
      "Dewpoint_c": -4.1,
      "Wind_Direction": 200,
      "Wind_Speed_kt": 5.6
    },
    {
      "Pressure_mb": 760,
      "Altitude_m": 2372,
      "Temp_c": 3.1,
      "Dewpoint_c": -4.2,
      "Wind_Direction": 201,
      "Wind_Speed_kt": 5.6
    },
    {
      "Pressure_mb": 759.5,
      "Altitude_m": 2377,
      "Temp_c": 3.1,
      "Dewpoint_c": -4.2,
      "Wind_Direction": 201,
      "Wind_Speed_kt": 5.6
    },
    {
      "Pressure_mb": 759,
      "Altitude_m": 2382,
      "Temp_c": 3,
      "Dewpoint_c": -4.2,
      "Wind_Direction": 202,
      "Wind_Speed_kt": 5.7
    },
    {
      "Pressure_mb": 758.6,
      "Altitude_m": 2387,
      "Temp_c": 3,
      "Dewpoint_c": -4.2,
      "Wind_Direction": 203,
      "Wind_Speed_kt": 5.7
    },
    {
      "Pressure_mb": 758.1,
      "Altitude_m": 2392,
      "Temp_c": 2.9,
      "Dewpoint_c": -4.2,
      "Wind_Direction": 204,
      "Wind_Speed_kt": 5.8
    },
    {
      "Pressure_mb": 757.6,
      "Altitude_m": 2396,
      "Temp_c": 2.9,
      "Dewpoint_c": -4.3,
      "Wind_Direction": 204,
      "Wind_Speed_kt": 5.9
    },
    {
      "Pressure_mb": 757.2,
      "Altitude_m": 2401,
      "Temp_c": 2.8,
      "Dewpoint_c": -4.3,
      "Wind_Direction": 205,
      "Wind_Speed_kt": 6
    },
    {
      "Pressure_mb": 756.7,
      "Altitude_m": 2406,
      "Temp_c": 2.8,
      "Dewpoint_c": -4.3,
      "Wind_Direction": 206,
      "Wind_Speed_kt": 6
    },
    {
      "Pressure_mb": 756.3,
      "Altitude_m": 2411,
      "Temp_c": 2.7,
      "Dewpoint_c": -4.3,
      "Wind_Direction": 206,
      "Wind_Speed_kt": 6.1
    },
    {
      "Pressure_mb": 755.8,
      "Altitude_m": 2416,
      "Temp_c": 2.7,
      "Dewpoint_c": -4.3,
      "Wind_Direction": 207,
      "Wind_Speed_kt": 6.2
    },
    {
      "Pressure_mb": 755.4,
      "Altitude_m": 2421,
      "Temp_c": 2.7,
      "Dewpoint_c": -4.3,
      "Wind_Direction": 208,
      "Wind_Speed_kt": 6.2
    },
    {
      "Pressure_mb": 754.9,
      "Altitude_m": 2426,
      "Temp_c": 2.6,
      "Dewpoint_c": -4.4,
      "Wind_Direction": 208,
      "Wind_Speed_kt": 6.3
    },
    {
      "Pressure_mb": 754.5,
      "Altitude_m": 2430,
      "Temp_c": 2.6,
      "Dewpoint_c": -4.4,
      "Wind_Direction": 209,
      "Wind_Speed_kt": 6.4
    },
    {
      "Pressure_mb": 754,
      "Altitude_m": 2435,
      "Temp_c": 2.5,
      "Dewpoint_c": -4.4,
      "Wind_Direction": 209,
      "Wind_Speed_kt": 6.5
    },
    {
      "Pressure_mb": 753.6,
      "Altitude_m": 2440,
      "Temp_c": 2.5,
      "Dewpoint_c": -4.4,
      "Wind_Direction": 210,
      "Wind_Speed_kt": 6.5
    },
    {
      "Pressure_mb": 753.1,
      "Altitude_m": 2445,
      "Temp_c": 2.4,
      "Dewpoint_c": -4.4,
      "Wind_Direction": 210,
      "Wind_Speed_kt": 6.6
    },
    {
      "Pressure_mb": 752.7,
      "Altitude_m": 2450,
      "Temp_c": 2.4,
      "Dewpoint_c": -4.4,
      "Wind_Direction": 211,
      "Wind_Speed_kt": 6.7
    },
    {
      "Pressure_mb": 752.2,
      "Altitude_m": 2454,
      "Temp_c": 2.3,
      "Dewpoint_c": -4.5,
      "Wind_Direction": 211,
      "Wind_Speed_kt": 6.8
    },
    {
      "Pressure_mb": 751.8,
      "Altitude_m": 2459,
      "Temp_c": 2.3,
      "Dewpoint_c": -4.5,
      "Wind_Direction": 212,
      "Wind_Speed_kt": 6.8
    },
    {
      "Pressure_mb": 751.3,
      "Altitude_m": 2464,
      "Temp_c": 2.3,
      "Dewpoint_c": -4.5,
      "Wind_Direction": 212,
      "Wind_Speed_kt": 6.9
    },
    {
      "Pressure_mb": 750.9,
      "Altitude_m": 2469,
      "Temp_c": 2.2,
      "Dewpoint_c": -4.5,
      "Wind_Direction": 213,
      "Wind_Speed_kt": 7
    },
    {
      "Pressure_mb": 750.4,
      "Altitude_m": 2474,
      "Temp_c": 2.2,
      "Dewpoint_c": -4.5,
      "Wind_Direction": 213,
      "Wind_Speed_kt": 7
    },
    {
      "Pressure_mb": 750,
      "Altitude_m": 2479,
      "Temp_c": 2.1,
      "Dewpoint_c": -4.5,
      "Wind_Direction": 214,
      "Wind_Speed_kt": 7
    },
    {
      "Pressure_mb": 749.5,
      "Altitude_m": 2483,
      "Temp_c": 2.1,
      "Dewpoint_c": -4.5,
      "Wind_Direction": 214,
      "Wind_Speed_kt": 7
    },
    {
      "Pressure_mb": 749.1,
      "Altitude_m": 2488,
      "Temp_c": 2,
      "Dewpoint_c": -4.6,
      "Wind_Direction": 214,
      "Wind_Speed_kt": 7
    },
    {
      "Pressure_mb": 748.6,
      "Altitude_m": 2493,
      "Temp_c": 2,
      "Dewpoint_c": -4.6,
      "Wind_Direction": 214,
      "Wind_Speed_kt": 7
    },
    {
      "Pressure_mb": 748.1,
      "Altitude_m": 2498,
      "Temp_c": 1.9,
      "Dewpoint_c": -4.6,
      "Wind_Direction": 215,
      "Wind_Speed_kt": 7
    },
    {
      "Pressure_mb": 747.7,
      "Altitude_m": 2503,
      "Temp_c": 1.9,
      "Dewpoint_c": -4.6,
      "Wind_Direction": 215,
      "Wind_Speed_kt": 7
    },
    {
      "Pressure_mb": 747.2,
      "Altitude_m": 2508,
      "Temp_c": 1.9,
      "Dewpoint_c": -4.6,
      "Wind_Direction": 215,
      "Wind_Speed_kt": 7
    },
    {
      "Pressure_mb": 746.8,
      "Altitude_m": 2513,
      "Temp_c": 1.8,
      "Dewpoint_c": -4.6,
      "Wind_Direction": 216,
      "Wind_Speed_kt": 7
    },
    {
      "Pressure_mb": 746.3,
      "Altitude_m": 2518,
      "Temp_c": 1.8,
      "Dewpoint_c": -4.7,
      "Wind_Direction": 216,
      "Wind_Speed_kt": 7
    },
    {
      "Pressure_mb": 745.9,
      "Altitude_m": 2522,
      "Temp_c": 1.7,
      "Dewpoint_c": -4.7,
      "Wind_Direction": 216,
      "Wind_Speed_kt": 7
    },
    {
      "Pressure_mb": 745.5,
      "Altitude_m": 2527,
      "Temp_c": 1.7,
      "Dewpoint_c": -4.7,
      "Wind_Direction": 216,
      "Wind_Speed_kt": 7
    },
    {
      "Pressure_mb": 745.1,
      "Altitude_m": 2531,
      "Temp_c": 1.6,
      "Dewpoint_c": -4.7,
      "Wind_Direction": 217,
      "Wind_Speed_kt": 7
    },
    {
      "Pressure_mb": 744.7,
      "Altitude_m": 2536,
      "Temp_c": 1.6,
      "Dewpoint_c": -4.7,
      "Wind_Direction": 217,
      "Wind_Speed_kt": 7
    },
    {
      "Pressure_mb": 744.3,
      "Altitude_m": 2540,
      "Temp_c": 1.6,
      "Dewpoint_c": -4.7,
      "Wind_Direction": 217,
      "Wind_Speed_kt": 7
    },
    {
      "Pressure_mb": 743.9,
      "Altitude_m": 2545,
      "Temp_c": 1.5,
      "Dewpoint_c": -4.7,
      "Wind_Direction": 218,
      "Wind_Speed_kt": 7
    },
    {
      "Pressure_mb": 743.5,
      "Altitude_m": 2549,
      "Temp_c": 1.5,
      "Dewpoint_c": -4.8,
      "Wind_Direction": 218,
      "Wind_Speed_kt": 7
    },
    {
      "Pressure_mb": 743,
      "Altitude_m": 2553,
      "Temp_c": 1.4,
      "Dewpoint_c": -4.8,
      "Wind_Direction": 218,
      "Wind_Speed_kt": 7.1
    },
    {
      "Pressure_mb": 742.6,
      "Altitude_m": 2558,
      "Temp_c": 1.4,
      "Dewpoint_c": -4.8,
      "Wind_Direction": 219,
      "Wind_Speed_kt": 7.1
    },
    {
      "Pressure_mb": 742.2,
      "Altitude_m": 2562,
      "Temp_c": 1.3,
      "Dewpoint_c": -4.8,
      "Wind_Direction": 219,
      "Wind_Speed_kt": 7.1
    },
    {
      "Pressure_mb": 741.8,
      "Altitude_m": 2567,
      "Temp_c": 1.3,
      "Dewpoint_c": -4.8,
      "Wind_Direction": 218,
      "Wind_Speed_kt": 7.1
    },
    {
      "Pressure_mb": 741.4,
      "Altitude_m": 2572,
      "Temp_c": 1.2,
      "Dewpoint_c": -4.8,
      "Wind_Direction": 218,
      "Wind_Speed_kt": 7.1
    },
    {
      "Pressure_mb": 740.9,
      "Altitude_m": 2576,
      "Temp_c": 1.2,
      "Dewpoint_c": -4.8,
      "Wind_Direction": 218,
      "Wind_Speed_kt": 7.2
    },
    {
      "Pressure_mb": 740.5,
      "Altitude_m": 2581,
      "Temp_c": 1.1,
      "Dewpoint_c": -4.8,
      "Wind_Direction": 218,
      "Wind_Speed_kt": 7.2
    },
    {
      "Pressure_mb": 740,
      "Altitude_m": 2586,
      "Temp_c": 1.1,
      "Dewpoint_c": -4.9,
      "Wind_Direction": 217,
      "Wind_Speed_kt": 7.2
    },
    {
      "Pressure_mb": 739.6,
      "Altitude_m": 2591,
      "Temp_c": 1,
      "Dewpoint_c": -4.9,
      "Wind_Direction": 217,
      "Wind_Speed_kt": 7.3
    },
    {
      "Pressure_mb": 739.1,
      "Altitude_m": 2596,
      "Temp_c": 1,
      "Dewpoint_c": -4.9,
      "Wind_Direction": 217,
      "Wind_Speed_kt": 7.3
    },
    {
      "Pressure_mb": 738.6,
      "Altitude_m": 2602,
      "Temp_c": 0.9,
      "Dewpoint_c": -4.9,
      "Wind_Direction": 216,
      "Wind_Speed_kt": 7.3
    },
    {
      "Pressure_mb": 738.1,
      "Altitude_m": 2607,
      "Temp_c": 0.9,
      "Dewpoint_c": -4.9,
      "Wind_Direction": 216,
      "Wind_Speed_kt": 7.4
    },
    {
      "Pressure_mb": 737.6,
      "Altitude_m": 2612,
      "Temp_c": 0.9,
      "Dewpoint_c": -5,
      "Wind_Direction": 216,
      "Wind_Speed_kt": 7.4
    },
    {
      "Pressure_mb": 737.1,
      "Altitude_m": 2618,
      "Temp_c": 0.8,
      "Dewpoint_c": -5,
      "Wind_Direction": 216,
      "Wind_Speed_kt": 7.4
    },
    {
      "Pressure_mb": 736.6,
      "Altitude_m": 2623,
      "Temp_c": 0.8,
      "Dewpoint_c": -5,
      "Wind_Direction": 215,
      "Wind_Speed_kt": 7.5
    },
    {
      "Pressure_mb": 736.1,
      "Altitude_m": 2628,
      "Temp_c": 0.7,
      "Dewpoint_c": -5,
      "Wind_Direction": 215,
      "Wind_Speed_kt": 7.5
    },
    {
      "Pressure_mb": 735.7,
      "Altitude_m": 2634,
      "Temp_c": 0.7,
      "Dewpoint_c": -5,
      "Wind_Direction": 215,
      "Wind_Speed_kt": 7.5
    },
    {
      "Pressure_mb": 735.2,
      "Altitude_m": 2639,
      "Temp_c": 0.6,
      "Dewpoint_c": -5,
      "Wind_Direction": 214,
      "Wind_Speed_kt": 7.6
    },
    {
      "Pressure_mb": 734.7,
      "Altitude_m": 2644,
      "Temp_c": 0.6,
      "Dewpoint_c": -5.1,
      "Wind_Direction": 214,
      "Wind_Speed_kt": 7.6
    },
    {
      "Pressure_mb": 734.2,
      "Altitude_m": 2649,
      "Temp_c": 0.5,
      "Dewpoint_c": -5.1,
      "Wind_Direction": 214,
      "Wind_Speed_kt": 7.6
    },
    {
      "Pressure_mb": 733.7,
      "Altitude_m": 2655,
      "Temp_c": 0.5,
      "Dewpoint_c": -5.1,
      "Wind_Direction": 214,
      "Wind_Speed_kt": 7.7
    },
    {
      "Pressure_mb": 733.2,
      "Altitude_m": 2660,
      "Temp_c": 0.4,
      "Dewpoint_c": -5.1,
      "Wind_Direction": 213,
      "Wind_Speed_kt": 7.7
    },
    {
      "Pressure_mb": 732.7,
      "Altitude_m": 2666,
      "Temp_c": 0.3,
      "Dewpoint_c": -5.1,
      "Wind_Direction": 213,
      "Wind_Speed_kt": 7.7
    },
    {
      "Pressure_mb": 732.2,
      "Altitude_m": 2672,
      "Temp_c": 0.3,
      "Dewpoint_c": -5.2,
      "Wind_Direction": 213,
      "Wind_Speed_kt": 7.7
    },
    {
      "Pressure_mb": 731.7,
      "Altitude_m": 2677,
      "Temp_c": 0.2,
      "Dewpoint_c": -5.2,
      "Wind_Direction": 213,
      "Wind_Speed_kt": 7.7
    },
    {
      "Pressure_mb": 731.2,
      "Altitude_m": 2683,
      "Temp_c": 0.2,
      "Dewpoint_c": -5.2,
      "Wind_Direction": 213,
      "Wind_Speed_kt": 7.7
    },
    {
      "Pressure_mb": 730.7,
      "Altitude_m": 2688,
      "Temp_c": 0.1,
      "Dewpoint_c": -5.2,
      "Wind_Direction": 213,
      "Wind_Speed_kt": 7.8
    },
    {
      "Pressure_mb": 730.2,
      "Altitude_m": 2694,
      "Temp_c": 0.1,
      "Dewpoint_c": -5.2,
      "Wind_Direction": 213,
      "Wind_Speed_kt": 7.8
    },
    {
      "Pressure_mb": 729.7,
      "Altitude_m": 2699,
      "Temp_c": 0,
      "Dewpoint_c": -5.3,
      "Wind_Direction": 213,
      "Wind_Speed_kt": 7.8
    },
    {
      "Pressure_mb": 729.2,
      "Altitude_m": 2704,
      "Temp_c": 0,
      "Dewpoint_c": -5.3,
      "Wind_Direction": 213,
      "Wind_Speed_kt": 7.8
    },
    {
      "Pressure_mb": 728.7,
      "Altitude_m": 2710,
      "Temp_c": -0.1,
      "Dewpoint_c": -5.3,
      "Wind_Direction": 213,
      "Wind_Speed_kt": 7.8
    },
    {
      "Pressure_mb": 728.2,
      "Altitude_m": 2715,
      "Temp_c": -0.1,
      "Dewpoint_c": -5.3,
      "Wind_Direction": 213,
      "Wind_Speed_kt": 7.8
    },
    {
      "Pressure_mb": 727.8,
      "Altitude_m": 2720,
      "Temp_c": -0.2,
      "Dewpoint_c": -5.3,
      "Wind_Direction": 214,
      "Wind_Speed_kt": 7.8
    },
    {
      "Pressure_mb": 727.3,
      "Altitude_m": 2726,
      "Temp_c": -0.2,
      "Dewpoint_c": -5.3,
      "Wind_Direction": 214,
      "Wind_Speed_kt": 7.8
    },
    {
      "Pressure_mb": 726.8,
      "Altitude_m": 2731,
      "Temp_c": -0.3,
      "Dewpoint_c": -5.4,
      "Wind_Direction": 214,
      "Wind_Speed_kt": 7.8
    },
    {
      "Pressure_mb": 726.3,
      "Altitude_m": 2736,
      "Temp_c": -0.3,
      "Dewpoint_c": -5.4,
      "Wind_Direction": 214,
      "Wind_Speed_kt": 7.8
    },
    {
      "Pressure_mb": 725.8,
      "Altitude_m": 2741,
      "Temp_c": -0.4,
      "Dewpoint_c": -5.4,
      "Wind_Direction": 214,
      "Wind_Speed_kt": 7.8
    },
    {
      "Pressure_mb": 725.3,
      "Altitude_m": 2746,
      "Temp_c": -0.4,
      "Dewpoint_c": -5.4,
      "Wind_Direction": 214,
      "Wind_Speed_kt": 7.8
    },
    {
      "Pressure_mb": 724.8,
      "Altitude_m": 2752,
      "Temp_c": -0.5,
      "Dewpoint_c": -5.4,
      "Wind_Direction": 214,
      "Wind_Speed_kt": 7.8
    },
    {
      "Pressure_mb": 724.3,
      "Altitude_m": 2758,
      "Temp_c": -0.5,
      "Dewpoint_c": -5.5,
      "Wind_Direction": 214,
      "Wind_Speed_kt": 7.8
    },
    {
      "Pressure_mb": 723.8,
      "Altitude_m": 2764,
      "Temp_c": -0.6,
      "Dewpoint_c": -5.5,
      "Wind_Direction": 214,
      "Wind_Speed_kt": 7.8
    },
    {
      "Pressure_mb": 723.3,
      "Altitude_m": 2770,
      "Temp_c": -0.6,
      "Dewpoint_c": -5.5,
      "Wind_Direction": 214,
      "Wind_Speed_kt": 7.8
    },
    {
      "Pressure_mb": 722.8,
      "Altitude_m": 2776,
      "Temp_c": -0.7,
      "Dewpoint_c": -5.5,
      "Wind_Direction": 214,
      "Wind_Speed_kt": 7.8
    },
    {
      "Pressure_mb": 722.3,
      "Altitude_m": 2781,
      "Temp_c": -0.7,
      "Dewpoint_c": -5.6,
      "Wind_Direction": 214,
      "Wind_Speed_kt": 7.8
    },
    {
      "Pressure_mb": 721.8,
      "Altitude_m": 2787,
      "Temp_c": -0.8,
      "Dewpoint_c": -5.6,
      "Wind_Direction": 215,
      "Wind_Speed_kt": 7.8
    },
    {
      "Pressure_mb": 721.2,
      "Altitude_m": 2792,
      "Temp_c": -0.8,
      "Dewpoint_c": -5.6,
      "Wind_Direction": 215,
      "Wind_Speed_kt": 7.9
    },
    {
      "Pressure_mb": 720.7,
      "Altitude_m": 2798,
      "Temp_c": -0.9,
      "Dewpoint_c": -5.6,
      "Wind_Direction": 215,
      "Wind_Speed_kt": 7.9
    },
    {
      "Pressure_mb": 720.2,
      "Altitude_m": 2804,
      "Temp_c": -0.9,
      "Dewpoint_c": -5.6,
      "Wind_Direction": 216,
      "Wind_Speed_kt": 7.9
    },
    {
      "Pressure_mb": 719.7,
      "Altitude_m": 2809,
      "Temp_c": -1,
      "Dewpoint_c": -5.6,
      "Wind_Direction": 216,
      "Wind_Speed_kt": 7.9
    },
    {
      "Pressure_mb": 719.2,
      "Altitude_m": 2815,
      "Temp_c": -1,
      "Dewpoint_c": -5.7,
      "Wind_Direction": 216,
      "Wind_Speed_kt": 7.9
    },
    {
      "Pressure_mb": 718.7,
      "Altitude_m": 2820,
      "Temp_c": -1.1,
      "Dewpoint_c": -5.7,
      "Wind_Direction": 217,
      "Wind_Speed_kt": 7.9
    },
    {
      "Pressure_mb": 718.2,
      "Altitude_m": 2826,
      "Temp_c": -1.1,
      "Dewpoint_c": -5.7,
      "Wind_Direction": 217,
      "Wind_Speed_kt": 7.9
    },
    {
      "Pressure_mb": 717.8,
      "Altitude_m": 2831,
      "Temp_c": -1.2,
      "Dewpoint_c": -5.7,
      "Wind_Direction": 218,
      "Wind_Speed_kt": 7.9
    },
    {
      "Pressure_mb": 717.3,
      "Altitude_m": 2836,
      "Temp_c": -1.2,
      "Dewpoint_c": -5.7,
      "Wind_Direction": 218,
      "Wind_Speed_kt": 8
    },
    {
      "Pressure_mb": 716.9,
      "Altitude_m": 2842,
      "Temp_c": -1.3,
      "Dewpoint_c": -5.7,
      "Wind_Direction": 218,
      "Wind_Speed_kt": 8
    },
    {
      "Pressure_mb": 716.4,
      "Altitude_m": 2846,
      "Temp_c": -1.3,
      "Dewpoint_c": -5.8,
      "Wind_Direction": 219,
      "Wind_Speed_kt": 8
    },
    {
      "Pressure_mb": 716,
      "Altitude_m": 2851,
      "Temp_c": -1.4,
      "Dewpoint_c": -5.8,
      "Wind_Direction": 219,
      "Wind_Speed_kt": 8
    },
    {
      "Pressure_mb": 715.5,
      "Altitude_m": 2856,
      "Temp_c": -1.4,
      "Dewpoint_c": -5.8,
      "Wind_Direction": 219,
      "Wind_Speed_kt": 8
    },
    {
      "Pressure_mb": 715.1,
      "Altitude_m": 2861,
      "Temp_c": -1.5,
      "Dewpoint_c": -5.8,
      "Wind_Direction": 220,
      "Wind_Speed_kt": 8
    },
    {
      "Pressure_mb": 714.7,
      "Altitude_m": 2866,
      "Temp_c": -1.5,
      "Dewpoint_c": -5.8,
      "Wind_Direction": 220,
      "Wind_Speed_kt": 8
    },
    {
      "Pressure_mb": 714.3,
      "Altitude_m": 2870,
      "Temp_c": -1.5,
      "Dewpoint_c": -5.8,
      "Wind_Direction": 220,
      "Wind_Speed_kt": 8.1
    },
    {
      "Pressure_mb": 714,
      "Altitude_m": 2874,
      "Temp_c": -1.6,
      "Dewpoint_c": -5.8,
      "Wind_Direction": 221,
      "Wind_Speed_kt": 8.1
    },
    {
      "Pressure_mb": 713.6,
      "Altitude_m": 2878,
      "Temp_c": -1.6,
      "Dewpoint_c": -5.9,
      "Wind_Direction": 221,
      "Wind_Speed_kt": 8.1
    },
    {
      "Pressure_mb": 713.2,
      "Altitude_m": 2882,
      "Temp_c": -1.7,
      "Dewpoint_c": -5.9,
      "Wind_Direction": 221,
      "Wind_Speed_kt": 8.1
    },
    {
      "Pressure_mb": 712.8,
      "Altitude_m": 2886,
      "Temp_c": -1.7,
      "Dewpoint_c": -5.9,
      "Wind_Direction": 221,
      "Wind_Speed_kt": 8.2
    },
    {
      "Pressure_mb": 712.4,
      "Altitude_m": 2890,
      "Temp_c": -1.7,
      "Dewpoint_c": -5.9,
      "Wind_Direction": 222,
      "Wind_Speed_kt": 8.3
    },
    {
      "Pressure_mb": 712.1,
      "Altitude_m": 2894,
      "Temp_c": -1.8,
      "Dewpoint_c": -5.9,
      "Wind_Direction": 222,
      "Wind_Speed_kt": 8.3
    },
    {
      "Pressure_mb": 711.7,
      "Altitude_m": 2898,
      "Temp_c": -1.8,
      "Dewpoint_c": -6,
      "Wind_Direction": 222,
      "Wind_Speed_kt": 8.4
    },
    {
      "Pressure_mb": 711.3,
      "Altitude_m": 2903,
      "Temp_c": -1.9,
      "Dewpoint_c": -6,
      "Wind_Direction": 222,
      "Wind_Speed_kt": 8.4
    },
    {
      "Pressure_mb": 710.9,
      "Altitude_m": 2907,
      "Temp_c": -1.9,
      "Dewpoint_c": -6,
      "Wind_Direction": 222,
      "Wind_Speed_kt": 8.5
    },
    {
      "Pressure_mb": 710.5,
      "Altitude_m": 2911,
      "Temp_c": -1.9,
      "Dewpoint_c": -6,
      "Wind_Direction": 223,
      "Wind_Speed_kt": 8.5
    },
    {
      "Pressure_mb": 710,
      "Altitude_m": 2916,
      "Temp_c": -2,
      "Dewpoint_c": -6,
      "Wind_Direction": 223,
      "Wind_Speed_kt": 8.6
    },
    {
      "Pressure_mb": 709.6,
      "Altitude_m": 2921,
      "Temp_c": -2,
      "Dewpoint_c": -6,
      "Wind_Direction": 223,
      "Wind_Speed_kt": 8.6
    },
    {
      "Pressure_mb": 709.1,
      "Altitude_m": 2927,
      "Temp_c": -2,
      "Dewpoint_c": -6.1,
      "Wind_Direction": 223,
      "Wind_Speed_kt": 8.7
    },
    {
      "Pressure_mb": 708.7,
      "Altitude_m": 2932,
      "Temp_c": -2.1,
      "Dewpoint_c": -6.1,
      "Wind_Direction": 223,
      "Wind_Speed_kt": 8.7
    },
    {
      "Pressure_mb": 708.3,
      "Altitude_m": 2937,
      "Temp_c": -2.1,
      "Dewpoint_c": -6.1,
      "Wind_Direction": 224,
      "Wind_Speed_kt": 8.8
    },
    {
      "Pressure_mb": 707.9,
      "Altitude_m": 2942,
      "Temp_c": -2.1,
      "Dewpoint_c": -6.1,
      "Wind_Direction": 224,
      "Wind_Speed_kt": 8.8
    },
    {
      "Pressure_mb": 707.6,
      "Altitude_m": 2946,
      "Temp_c": -2.2,
      "Dewpoint_c": -6.1,
      "Wind_Direction": 224,
      "Wind_Speed_kt": 8.9
    },
    {
      "Pressure_mb": 707.2,
      "Altitude_m": 2949,
      "Temp_c": -2.2,
      "Dewpoint_c": -6.1,
      "Wind_Direction": 224,
      "Wind_Speed_kt": 8.9
    },
    {
      "Pressure_mb": 706.9,
      "Altitude_m": 2953,
      "Temp_c": -2.2,
      "Dewpoint_c": -6.2,
      "Wind_Direction": 224,
      "Wind_Speed_kt": 9
    },
    {
      "Pressure_mb": 706.5,
      "Altitude_m": 2957,
      "Temp_c": -2.3,
      "Dewpoint_c": -6.2,
      "Wind_Direction": 225,
      "Wind_Speed_kt": 9.1
    },
    {
      "Pressure_mb": 706.2,
      "Altitude_m": 2960,
      "Temp_c": -2.3,
      "Dewpoint_c": -6.2,
      "Wind_Direction": 225,
      "Wind_Speed_kt": 9.1
    },
    {
      "Pressure_mb": 705.8,
      "Altitude_m": 2964,
      "Temp_c": -2.3,
      "Dewpoint_c": -6.2,
      "Wind_Direction": 225,
      "Wind_Speed_kt": 9.2
    },
    {
      "Pressure_mb": 705.5,
      "Altitude_m": 2968,
      "Temp_c": -2.3,
      "Dewpoint_c": -6.2,
      "Wind_Direction": 225,
      "Wind_Speed_kt": 9.2
    },
    {
      "Pressure_mb": 705.2,
      "Altitude_m": 2972,
      "Temp_c": -2.4,
      "Dewpoint_c": -6.2,
      "Wind_Direction": 226,
      "Wind_Speed_kt": 9.1
    },
    {
      "Pressure_mb": 704.8,
      "Altitude_m": 2975,
      "Temp_c": -2.4,
      "Dewpoint_c": -6.3,
      "Wind_Direction": 226,
      "Wind_Speed_kt": 9.1
    },
    {
      "Pressure_mb": 704.5,
      "Altitude_m": 2979,
      "Temp_c": -2.4,
      "Dewpoint_c": -6.3,
      "Wind_Direction": 227,
      "Wind_Speed_kt": 9.1
    },
    {
      "Pressure_mb": 704.2,
      "Altitude_m": 2983,
      "Temp_c": -2.5,
      "Dewpoint_c": -6.3,
      "Wind_Direction": 227,
      "Wind_Speed_kt": 9.1
    },
    {
      "Pressure_mb": 703.8,
      "Altitude_m": 2987,
      "Temp_c": -2.5,
      "Dewpoint_c": -6.3,
      "Wind_Direction": 228,
      "Wind_Speed_kt": 9.1
    },
    {
      "Pressure_mb": 703.5,
      "Altitude_m": 2991,
      "Temp_c": -2.5,
      "Dewpoint_c": -6.4,
      "Wind_Direction": 228,
      "Wind_Speed_kt": 9.1
    },
    {
      "Pressure_mb": 703.1,
      "Altitude_m": 2995,
      "Temp_c": -2.5,
      "Dewpoint_c": -6.4,
      "Wind_Direction": 229,
      "Wind_Speed_kt": 9.1
    },
    {
      "Pressure_mb": 702.8,
      "Altitude_m": 2999,
      "Temp_c": -2.6,
      "Dewpoint_c": -6.4,
      "Wind_Direction": 229,
      "Wind_Speed_kt": 9.1
    },
    {
      "Pressure_mb": 702.4,
      "Altitude_m": 3003,
      "Temp_c": -2.6,
      "Dewpoint_c": -6.5,
      "Wind_Direction": 230,
      "Wind_Speed_kt": 9.1
    },
    {
      "Pressure_mb": 702.1,
      "Altitude_m": 3007,
      "Temp_c": -2.6,
      "Dewpoint_c": -6.5,
      "Wind_Direction": 230,
      "Wind_Speed_kt": 9.1
    },
    {
      "Pressure_mb": 701.7,
      "Altitude_m": 3010,
      "Temp_c": -2.6,
      "Dewpoint_c": -6.5,
      "Wind_Direction": 231,
      "Wind_Speed_kt": 9.1
    },
    {
      "Pressure_mb": 701.4,
      "Altitude_m": 3014,
      "Temp_c": -2.7,
      "Dewpoint_c": -6.5,
      "Wind_Direction": 231,
      "Wind_Speed_kt": 9.1
    },
    {
      "Pressure_mb": 701.1,
      "Altitude_m": 3018,
      "Temp_c": -2.7,
      "Dewpoint_c": -6.6,
      "Wind_Direction": 232,
      "Wind_Speed_kt": 9.1
    },
    {
      "Pressure_mb": 700.8,
      "Altitude_m": 3021,
      "Temp_c": -2.7,
      "Dewpoint_c": -6.6,
      "Wind_Direction": 232,
      "Wind_Speed_kt": 9.1
    },
    {
      "Pressure_mb": 700.4,
      "Altitude_m": 3025,
      "Temp_c": -2.7,
      "Dewpoint_c": -6.6,
      "Wind_Direction": 233,
      "Wind_Speed_kt": 9.1
    },
    {
      "Pressure_mb": 700,
      "Altitude_m": 3030,
      "Temp_c": -2.8,
      "Dewpoint_c": -6.7,
      "Wind_Direction": 233,
      "Wind_Speed_kt": 9.1
    },
    {
      "Pressure_mb": 699.7,
      "Altitude_m": 3033,
      "Temp_c": -2.8,
      "Dewpoint_c": -6.7,
      "Wind_Direction": 233,
      "Wind_Speed_kt": 9.1
    },
    {
      "Pressure_mb": 699.4,
      "Altitude_m": 3038,
      "Temp_c": -2.8,
      "Dewpoint_c": -6.8,
      "Wind_Direction": 234,
      "Wind_Speed_kt": 9.1
    },
    {
      "Pressure_mb": 699,
      "Altitude_m": 3042,
      "Temp_c": -2.9,
      "Dewpoint_c": -6.8,
      "Wind_Direction": 234,
      "Wind_Speed_kt": 9.1
    },
    {
      "Pressure_mb": 698.6,
      "Altitude_m": 3046,
      "Temp_c": -2.9,
      "Dewpoint_c": -6.8,
      "Wind_Direction": 234,
      "Wind_Speed_kt": 9.1
    },
    {
      "Pressure_mb": 698.2,
      "Altitude_m": 3051,
      "Temp_c": -2.9,
      "Dewpoint_c": -6.9,
      "Wind_Direction": 234,
      "Wind_Speed_kt": 9.1
    },
    {
      "Pressure_mb": 697.9,
      "Altitude_m": 3054,
      "Temp_c": -2.9,
      "Dewpoint_c": -6.9,
      "Wind_Direction": 234,
      "Wind_Speed_kt": 9.2
    },
    {
      "Pressure_mb": 697.5,
      "Altitude_m": 3058,
      "Temp_c": -3,
      "Dewpoint_c": -6.9,
      "Wind_Direction": 234,
      "Wind_Speed_kt": 9.2
    },
    {
      "Pressure_mb": 697.2,
      "Altitude_m": 3061,
      "Temp_c": -3,
      "Dewpoint_c": -7,
      "Wind_Direction": 234,
      "Wind_Speed_kt": 9.2
    },
    {
      "Pressure_mb": 696.8,
      "Altitude_m": 3065,
      "Temp_c": -3,
      "Dewpoint_c": -7,
      "Wind_Direction": 234,
      "Wind_Speed_kt": 9.2
    },
    {
      "Pressure_mb": 696.5,
      "Altitude_m": 3068,
      "Temp_c": -3.1,
      "Dewpoint_c": -7,
      "Wind_Direction": 234,
      "Wind_Speed_kt": 9.2
    },
    {
      "Pressure_mb": 696.1,
      "Altitude_m": 3073,
      "Temp_c": -3.1,
      "Dewpoint_c": -7.1,
      "Wind_Direction": 234,
      "Wind_Speed_kt": 9.3
    },
    {
      "Pressure_mb": 695.8,
      "Altitude_m": 3078,
      "Temp_c": -3.1,
      "Dewpoint_c": -7.1,
      "Wind_Direction": 234,
      "Wind_Speed_kt": 9.3
    },
    {
      "Pressure_mb": 695.3,
      "Altitude_m": 3084,
      "Temp_c": -3.2,
      "Dewpoint_c": -7.1,
      "Wind_Direction": 233,
      "Wind_Speed_kt": 9.3
    },
    {
      "Pressure_mb": 694.8,
      "Altitude_m": 3089,
      "Temp_c": -3.2,
      "Dewpoint_c": -7.2,
      "Wind_Direction": 233,
      "Wind_Speed_kt": 9.3
    },
    {
      "Pressure_mb": 694.4,
      "Altitude_m": 3095,
      "Temp_c": -3.3,
      "Dewpoint_c": -7.2,
      "Wind_Direction": 233,
      "Wind_Speed_kt": 9.3
    },
    {
      "Pressure_mb": 693.9,
      "Altitude_m": 3101,
      "Temp_c": -3.3,
      "Dewpoint_c": -7.3,
      "Wind_Direction": 233,
      "Wind_Speed_kt": 9.3
    },
    {
      "Pressure_mb": 693.4,
      "Altitude_m": 3106,
      "Temp_c": -3.3,
      "Dewpoint_c": -7.3,
      "Wind_Direction": 233,
      "Wind_Speed_kt": 9.4
    },
    {
      "Pressure_mb": 693,
      "Altitude_m": 3110,
      "Temp_c": -3.4,
      "Dewpoint_c": -7.3,
      "Wind_Direction": 233,
      "Wind_Speed_kt": 9.4
    },
    {
      "Pressure_mb": 692.6,
      "Altitude_m": 3115,
      "Temp_c": -3.4,
      "Dewpoint_c": -7.4,
      "Wind_Direction": 233,
      "Wind_Speed_kt": 9.4
    },
    {
      "Pressure_mb": 692.2,
      "Altitude_m": 3120,
      "Temp_c": -3.5,
      "Dewpoint_c": -7.4,
      "Wind_Direction": 233,
      "Wind_Speed_kt": 9.4
    },
    {
      "Pressure_mb": 691.8,
      "Altitude_m": 3124,
      "Temp_c": -3.5,
      "Dewpoint_c": -7.4,
      "Wind_Direction": 233,
      "Wind_Speed_kt": 9.4
    },
    {
      "Pressure_mb": 691.4,
      "Altitude_m": 3129,
      "Temp_c": -3.5,
      "Dewpoint_c": -7.5,
      "Wind_Direction": 233,
      "Wind_Speed_kt": 9.4
    },
    {
      "Pressure_mb": 691,
      "Altitude_m": 3133,
      "Temp_c": -3.6,
      "Dewpoint_c": -7.5,
      "Wind_Direction": 233,
      "Wind_Speed_kt": 9.5
    },
    {
      "Pressure_mb": 690.6,
      "Altitude_m": 3138,
      "Temp_c": -3.6,
      "Dewpoint_c": -7.5,
      "Wind_Direction": 232,
      "Wind_Speed_kt": 9.4
    },
    {
      "Pressure_mb": 690.1,
      "Altitude_m": 3142,
      "Temp_c": -3.7,
      "Dewpoint_c": -7.6,
      "Wind_Direction": 232,
      "Wind_Speed_kt": 9.3
    },
    {
      "Pressure_mb": 689.7,
      "Altitude_m": 3146,
      "Temp_c": -3.7,
      "Dewpoint_c": -7.6,
      "Wind_Direction": 232,
      "Wind_Speed_kt": 9.3
    },
    {
      "Pressure_mb": 689.3,
      "Altitude_m": 3151,
      "Temp_c": -3.7,
      "Dewpoint_c": -7.7,
      "Wind_Direction": 232,
      "Wind_Speed_kt": 9.2
    },
    {
      "Pressure_mb": 688.9,
      "Altitude_m": 3156,
      "Temp_c": -3.8,
      "Dewpoint_c": -7.7,
      "Wind_Direction": 232,
      "Wind_Speed_kt": 9.1
    },
    {
      "Pressure_mb": 688.5,
      "Altitude_m": 3161,
      "Temp_c": -3.8,
      "Dewpoint_c": -7.7,
      "Wind_Direction": 231,
      "Wind_Speed_kt": 9
    },
    {
      "Pressure_mb": 688.1,
      "Altitude_m": 3166,
      "Temp_c": -3.9,
      "Dewpoint_c": -7.7,
      "Wind_Direction": 231,
      "Wind_Speed_kt": 9
    },
    {
      "Pressure_mb": 687.6,
      "Altitude_m": 3172,
      "Temp_c": -3.9,
      "Dewpoint_c": -7.8,
      "Wind_Direction": 231,
      "Wind_Speed_kt": 8.9
    },
    {
      "Pressure_mb": 687.2,
      "Altitude_m": 3177,
      "Temp_c": -3.9,
      "Dewpoint_c": -7.8,
      "Wind_Direction": 231,
      "Wind_Speed_kt": 8.8
    },
    {
      "Pressure_mb": 686.8,
      "Altitude_m": 3182,
      "Temp_c": -4,
      "Dewpoint_c": -7.8,
      "Wind_Direction": 231,
      "Wind_Speed_kt": 8.8
    },
    {
      "Pressure_mb": 686.4,
      "Altitude_m": 3187,
      "Temp_c": -4,
      "Dewpoint_c": -7.8,
      "Wind_Direction": 231,
      "Wind_Speed_kt": 8.7
    },
    {
      "Pressure_mb": 685.9,
      "Altitude_m": 3191,
      "Temp_c": -4.1,
      "Dewpoint_c": -7.9,
      "Wind_Direction": 230,
      "Wind_Speed_kt": 8.6
    },
    {
      "Pressure_mb": 685.5,
      "Altitude_m": 3196,
      "Temp_c": -4.1,
      "Dewpoint_c": -7.9,
      "Wind_Direction": 230,
      "Wind_Speed_kt": 8.6
    },
    {
      "Pressure_mb": 685.1,
      "Altitude_m": 3200,
      "Temp_c": -4.1,
      "Dewpoint_c": -7.9,
      "Wind_Direction": 230,
      "Wind_Speed_kt": 8.5
    },
    {
      "Pressure_mb": 684.7,
      "Altitude_m": 3204,
      "Temp_c": -4.2,
      "Dewpoint_c": -7.9,
      "Wind_Direction": 230,
      "Wind_Speed_kt": 8.4
    },
    {
      "Pressure_mb": 684.2,
      "Altitude_m": 3209,
      "Temp_c": -4.2,
      "Dewpoint_c": -8,
      "Wind_Direction": 229,
      "Wind_Speed_kt": 8.4
    },
    {
      "Pressure_mb": 683.8,
      "Altitude_m": 3214,
      "Temp_c": -4.3,
      "Dewpoint_c": -8,
      "Wind_Direction": 229,
      "Wind_Speed_kt": 8.3
    },
    {
      "Pressure_mb": 683.4,
      "Altitude_m": 3220,
      "Temp_c": -4.3,
      "Dewpoint_c": -8,
      "Wind_Direction": 229,
      "Wind_Speed_kt": 8.2
    },
    {
      "Pressure_mb": 682.9,
      "Altitude_m": 3225,
      "Temp_c": -4.3,
      "Dewpoint_c": -8,
      "Wind_Direction": 229,
      "Wind_Speed_kt": 8.2
    },
    {
      "Pressure_mb": 682.5,
      "Altitude_m": 3231,
      "Temp_c": -4.4,
      "Dewpoint_c": -8.1,
      "Wind_Direction": 229,
      "Wind_Speed_kt": 8.1
    },
    {
      "Pressure_mb": 682.1,
      "Altitude_m": 3236,
      "Temp_c": -4.4,
      "Dewpoint_c": -8.1,
      "Wind_Direction": 229,
      "Wind_Speed_kt": 8.1
    },
    {
      "Pressure_mb": 681.7,
      "Altitude_m": 3241,
      "Temp_c": -4.4,
      "Dewpoint_c": -8.1,
      "Wind_Direction": 229,
      "Wind_Speed_kt": 8.1
    },
    {
      "Pressure_mb": 681.3,
      "Altitude_m": 3245,
      "Temp_c": -4.5,
      "Dewpoint_c": -8.2,
      "Wind_Direction": 230,
      "Wind_Speed_kt": 8.1
    },
    {
      "Pressure_mb": 680.8,
      "Altitude_m": 3250,
      "Temp_c": -4.5,
      "Dewpoint_c": -8.2,
      "Wind_Direction": 230,
      "Wind_Speed_kt": 8.1
    },
    {
      "Pressure_mb": 680.4,
      "Altitude_m": 3254,
      "Temp_c": -4.6,
      "Dewpoint_c": -8.3,
      "Wind_Direction": 231,
      "Wind_Speed_kt": 8.2
    },
    {
      "Pressure_mb": 680,
      "Altitude_m": 3259,
      "Temp_c": -4.6,
      "Dewpoint_c": -8.3,
      "Wind_Direction": 231,
      "Wind_Speed_kt": 8.2
    },
    {
      "Pressure_mb": 679.6,
      "Altitude_m": 3263,
      "Temp_c": -4.6,
      "Dewpoint_c": -8.3,
      "Wind_Direction": 232,
      "Wind_Speed_kt": 8.2
    },
    {
      "Pressure_mb": 679.2,
      "Altitude_m": 3268,
      "Temp_c": -4.7,
      "Dewpoint_c": -8.4,
      "Wind_Direction": 232,
      "Wind_Speed_kt": 8.2
    },
    {
      "Pressure_mb": 678.8,
      "Altitude_m": 3273,
      "Temp_c": -4.7,
      "Dewpoint_c": -8.4,
      "Wind_Direction": 232,
      "Wind_Speed_kt": 8.2
    },
    {
      "Pressure_mb": 678.4,
      "Altitude_m": 3277,
      "Temp_c": -4.8,
      "Dewpoint_c": -8.4,
      "Wind_Direction": 233,
      "Wind_Speed_kt": 8.2
    },
    {
      "Pressure_mb": 678,
      "Altitude_m": 3282,
      "Temp_c": -4.8,
      "Dewpoint_c": -8.5,
      "Wind_Direction": 233,
      "Wind_Speed_kt": 8.3
    },
    {
      "Pressure_mb": 677.6,
      "Altitude_m": 3287,
      "Temp_c": -4.8,
      "Dewpoint_c": -8.5,
      "Wind_Direction": 234,
      "Wind_Speed_kt": 8.3
    },
    {
      "Pressure_mb": 677.2,
      "Altitude_m": 3291,
      "Temp_c": -4.9,
      "Dewpoint_c": -8.5,
      "Wind_Direction": 234,
      "Wind_Speed_kt": 8.3
    },
    {
      "Pressure_mb": 676.8,
      "Altitude_m": 3296,
      "Temp_c": -4.9,
      "Dewpoint_c": -8.6,
      "Wind_Direction": 234,
      "Wind_Speed_kt": 8.3
    },
    {
      "Pressure_mb": 676.4,
      "Altitude_m": 3301,
      "Temp_c": -4.9,
      "Dewpoint_c": -8.6,
      "Wind_Direction": 235,
      "Wind_Speed_kt": 8.3
    },
    {
      "Pressure_mb": 675.9,
      "Altitude_m": 3306,
      "Temp_c": -5,
      "Dewpoint_c": -8.6,
      "Wind_Direction": 235,
      "Wind_Speed_kt": 8.4
    },
    {
      "Pressure_mb": 675.5,
      "Altitude_m": 3311,
      "Temp_c": -5,
      "Dewpoint_c": -8.7,
      "Wind_Direction": 236,
      "Wind_Speed_kt": 8.4
    },
    {
      "Pressure_mb": 675.1,
      "Altitude_m": 3316,
      "Temp_c": -5.1,
      "Dewpoint_c": -8.7,
      "Wind_Direction": 236,
      "Wind_Speed_kt": 8.4
    },
    {
      "Pressure_mb": 674.7,
      "Altitude_m": 3321,
      "Temp_c": -5.1,
      "Dewpoint_c": -8.7,
      "Wind_Direction": 236,
      "Wind_Speed_kt": 8.4
    },
    {
      "Pressure_mb": 674.3,
      "Altitude_m": 3326,
      "Temp_c": -5.2,
      "Dewpoint_c": -8.8,
      "Wind_Direction": 237,
      "Wind_Speed_kt": 8.4
    },
    {
      "Pressure_mb": 673.9,
      "Altitude_m": 3330,
      "Temp_c": -5.2,
      "Dewpoint_c": -8.8,
      "Wind_Direction": 237,
      "Wind_Speed_kt": 8.4
    },
    {
      "Pressure_mb": 673.5,
      "Altitude_m": 3335,
      "Temp_c": -5.2,
      "Dewpoint_c": -8.8,
      "Wind_Direction": 237,
      "Wind_Speed_kt": 8.4
    },
    {
      "Pressure_mb": 673.1,
      "Altitude_m": 3339,
      "Temp_c": -5.3,
      "Dewpoint_c": -8.9,
      "Wind_Direction": 237,
      "Wind_Speed_kt": 8.3
    },
    {
      "Pressure_mb": 672.5,
      "Altitude_m": 3346,
      "Temp_c": -5.3,
      "Dewpoint_c": -8.9,
      "Wind_Direction": 237,
      "Wind_Speed_kt": 8.3
    },
    {
      "Pressure_mb": 672.2,
      "Altitude_m": 3348,
      "Temp_c": -5.3,
      "Dewpoint_c": -9,
      "Wind_Direction": 237,
      "Wind_Speed_kt": 8.2
    },
    {
      "Pressure_mb": 671.8,
      "Altitude_m": 3353,
      "Temp_c": -5.4,
      "Dewpoint_c": -9,
      "Wind_Direction": 237,
      "Wind_Speed_kt": 8.2
    },
    {
      "Pressure_mb": 671.3,
      "Altitude_m": 3359,
      "Temp_c": -5.4,
      "Dewpoint_c": -9.1,
      "Wind_Direction": 237,
      "Wind_Speed_kt": 8.2
    },
    {
      "Pressure_mb": 670.9,
      "Altitude_m": 3365,
      "Temp_c": -5.5,
      "Dewpoint_c": -9.1,
      "Wind_Direction": 237,
      "Wind_Speed_kt": 8.1
    },
    {
      "Pressure_mb": 670.5,
      "Altitude_m": 3370,
      "Temp_c": -5.5,
      "Dewpoint_c": -9.2,
      "Wind_Direction": 238,
      "Wind_Speed_kt": 8.1
    },
    {
      "Pressure_mb": 670,
      "Altitude_m": 3376,
      "Temp_c": -5.5,
      "Dewpoint_c": -9.2,
      "Wind_Direction": 238,
      "Wind_Speed_kt": 8
    },
    {
      "Pressure_mb": 669.5,
      "Altitude_m": 3381,
      "Temp_c": -5.6,
      "Dewpoint_c": -9.3,
      "Wind_Direction": 238,
      "Wind_Speed_kt": 8
    },
    {
      "Pressure_mb": 669.1,
      "Altitude_m": 3387,
      "Temp_c": -5.6,
      "Dewpoint_c": -9.3,
      "Wind_Direction": 238,
      "Wind_Speed_kt": 8
    },
    {
      "Pressure_mb": 668.6,
      "Altitude_m": 3392,
      "Temp_c": -5.7,
      "Dewpoint_c": -9.4,
      "Wind_Direction": 238,
      "Wind_Speed_kt": 7.9
    },
    {
      "Pressure_mb": 668.2,
      "Altitude_m": 3397,
      "Temp_c": -5.7,
      "Dewpoint_c": -9.4,
      "Wind_Direction": 238,
      "Wind_Speed_kt": 7.9
    },
    {
      "Pressure_mb": 667.7,
      "Altitude_m": 3403,
      "Temp_c": -5.7,
      "Dewpoint_c": -9.5,
      "Wind_Direction": 238,
      "Wind_Speed_kt": 7.8
    },
    {
      "Pressure_mb": 667.3,
      "Altitude_m": 3408,
      "Temp_c": -5.8,
      "Dewpoint_c": -9.5,
      "Wind_Direction": 238,
      "Wind_Speed_kt": 7.8
    },
    {
      "Pressure_mb": 666.9,
      "Altitude_m": 3413,
      "Temp_c": -5.8,
      "Dewpoint_c": -9.6,
      "Wind_Direction": 238,
      "Wind_Speed_kt": 7.8
    },
    {
      "Pressure_mb": 666.5,
      "Altitude_m": 3417,
      "Temp_c": -5.9,
      "Dewpoint_c": -9.6,
      "Wind_Direction": 239,
      "Wind_Speed_kt": 7.7
    },
    {
      "Pressure_mb": 666.1,
      "Altitude_m": 3422,
      "Temp_c": -5.9,
      "Dewpoint_c": -9.7,
      "Wind_Direction": 239,
      "Wind_Speed_kt": 7.7
    },
    {
      "Pressure_mb": 665.7,
      "Altitude_m": 3426,
      "Temp_c": -5.9,
      "Dewpoint_c": -9.7,
      "Wind_Direction": 239,
      "Wind_Speed_kt": 7.6
    },
    {
      "Pressure_mb": 665.3,
      "Altitude_m": 3431,
      "Temp_c": -6,
      "Dewpoint_c": -9.8,
      "Wind_Direction": 238,
      "Wind_Speed_kt": 7.6
    },
    {
      "Pressure_mb": 664.9,
      "Altitude_m": 3435,
      "Temp_c": -6,
      "Dewpoint_c": -9.8,
      "Wind_Direction": 238,
      "Wind_Speed_kt": 7.6
    },
    {
      "Pressure_mb": 664.5,
      "Altitude_m": 3440,
      "Temp_c": -6.1,
      "Dewpoint_c": -9.8,
      "Wind_Direction": 238,
      "Wind_Speed_kt": 7.5
    },
    {
      "Pressure_mb": 664.1,
      "Altitude_m": 3445,
      "Temp_c": -6.1,
      "Dewpoint_c": -9.9,
      "Wind_Direction": 237,
      "Wind_Speed_kt": 7.5
    },
    {
      "Pressure_mb": 663.7,
      "Altitude_m": 3450,
      "Temp_c": -6.2,
      "Dewpoint_c": -9.9,
      "Wind_Direction": 237,
      "Wind_Speed_kt": 7.4
    },
    {
      "Pressure_mb": 663.3,
      "Altitude_m": 3454,
      "Temp_c": -6.2,
      "Dewpoint_c": -10,
      "Wind_Direction": 236,
      "Wind_Speed_kt": 7.4
    },
    {
      "Pressure_mb": 662.9,
      "Altitude_m": 3459,
      "Temp_c": -6.3,
      "Dewpoint_c": -10,
      "Wind_Direction": 236,
      "Wind_Speed_kt": 7.4
    },
    {
      "Pressure_mb": 662.4,
      "Altitude_m": 3464,
      "Temp_c": -6.3,
      "Dewpoint_c": -10,
      "Wind_Direction": 235,
      "Wind_Speed_kt": 7.3
    },
    {
      "Pressure_mb": 661.9,
      "Altitude_m": 3470,
      "Temp_c": -6.4,
      "Dewpoint_c": -10.1,
      "Wind_Direction": 235,
      "Wind_Speed_kt": 7.3
    },
    {
      "Pressure_mb": 661.5,
      "Altitude_m": 3476,
      "Temp_c": -6.4,
      "Dewpoint_c": -10.1,
      "Wind_Direction": 235,
      "Wind_Speed_kt": 7.3
    },
    {
      "Pressure_mb": 661,
      "Altitude_m": 3481,
      "Temp_c": -6.5,
      "Dewpoint_c": -10.2,
      "Wind_Direction": 234,
      "Wind_Speed_kt": 7.2
    },
    {
      "Pressure_mb": 660.5,
      "Altitude_m": 3487,
      "Temp_c": -6.5,
      "Dewpoint_c": -10.2,
      "Wind_Direction": 234,
      "Wind_Speed_kt": 7.2
    },
    {
      "Pressure_mb": 660.1,
      "Altitude_m": 3493,
      "Temp_c": -6.6,
      "Dewpoint_c": -10.2,
      "Wind_Direction": 233,
      "Wind_Speed_kt": 7.2
    },
    {
      "Pressure_mb": 659.6,
      "Altitude_m": 3498,
      "Temp_c": -6.6,
      "Dewpoint_c": -10.3,
      "Wind_Direction": 233,
      "Wind_Speed_kt": 7.1
    },
    {
      "Pressure_mb": 659,
      "Altitude_m": 3504,
      "Temp_c": -6.7,
      "Dewpoint_c": -10.3,
      "Wind_Direction": 232,
      "Wind_Speed_kt": 7.1
    },
    {
      "Pressure_mb": 658.5,
      "Altitude_m": 3510,
      "Temp_c": -6.7,
      "Dewpoint_c": -10.3,
      "Wind_Direction": 232,
      "Wind_Speed_kt": 7.1
    },
    {
      "Pressure_mb": 658,
      "Altitude_m": 3517,
      "Temp_c": -6.8,
      "Dewpoint_c": -10.3,
      "Wind_Direction": 231,
      "Wind_Speed_kt": 7
    },
    {
      "Pressure_mb": 657.5,
      "Altitude_m": 3523,
      "Temp_c": -6.8,
      "Dewpoint_c": -10.4,
      "Wind_Direction": 231,
      "Wind_Speed_kt": 7
    },
    {
      "Pressure_mb": 657,
      "Altitude_m": 3529,
      "Temp_c": -6.9,
      "Dewpoint_c": -10.4,
      "Wind_Direction": 230,
      "Wind_Speed_kt": 7
    },
    {
      "Pressure_mb": 656.6,
      "Altitude_m": 3534,
      "Temp_c": -6.9,
      "Dewpoint_c": -10.4,
      "Wind_Direction": 230,
      "Wind_Speed_kt": 6.9
    },
    {
      "Pressure_mb": 656.2,
      "Altitude_m": 3539,
      "Temp_c": -7,
      "Dewpoint_c": -10.5,
      "Wind_Direction": 230,
      "Wind_Speed_kt": 6.9
    },
    {
      "Pressure_mb": 655.8,
      "Altitude_m": 3544,
      "Temp_c": -7,
      "Dewpoint_c": -10.5,
      "Wind_Direction": 230,
      "Wind_Speed_kt": 6.9
    },
    {
      "Pressure_mb": 655.3,
      "Altitude_m": 3549,
      "Temp_c": -7.1,
      "Dewpoint_c": -10.5,
      "Wind_Direction": 230,
      "Wind_Speed_kt": 6.9
    },
    {
      "Pressure_mb": 654.9,
      "Altitude_m": 3554,
      "Temp_c": -7.1,
      "Dewpoint_c": -10.5,
      "Wind_Direction": 231,
      "Wind_Speed_kt": 6.9
    },
    {
      "Pressure_mb": 654.5,
      "Altitude_m": 3559,
      "Temp_c": -7.2,
      "Dewpoint_c": -10.6,
      "Wind_Direction": 231,
      "Wind_Speed_kt": 6.9
    },
    {
      "Pressure_mb": 654.1,
      "Altitude_m": 3564,
      "Temp_c": -7.2,
      "Dewpoint_c": -10.6,
      "Wind_Direction": 231,
      "Wind_Speed_kt": 6.9
    },
    {
      "Pressure_mb": 653.6,
      "Altitude_m": 3569,
      "Temp_c": -7.3,
      "Dewpoint_c": -10.6,
      "Wind_Direction": 231,
      "Wind_Speed_kt": 6.9
    },
    {
      "Pressure_mb": 653.2,
      "Altitude_m": 3574,
      "Temp_c": -7.3,
      "Dewpoint_c": -10.7,
      "Wind_Direction": 231,
      "Wind_Speed_kt": 6.9
    },
    {
      "Pressure_mb": 652.8,
      "Altitude_m": 3579,
      "Temp_c": -7.4,
      "Dewpoint_c": -10.7,
      "Wind_Direction": 232,
      "Wind_Speed_kt": 6.9
    },
    {
      "Pressure_mb": 652.3,
      "Altitude_m": 3584,
      "Temp_c": -7.4,
      "Dewpoint_c": -10.8,
      "Wind_Direction": 232,
      "Wind_Speed_kt": 6.9
    },
    {
      "Pressure_mb": 651.9,
      "Altitude_m": 3590,
      "Temp_c": -7.5,
      "Dewpoint_c": -10.8,
      "Wind_Direction": 232,
      "Wind_Speed_kt": 6.9
    },
    {
      "Pressure_mb": 651.5,
      "Altitude_m": 3595,
      "Temp_c": -7.5,
      "Dewpoint_c": -10.8,
      "Wind_Direction": 232,
      "Wind_Speed_kt": 6.9
    },
    {
      "Pressure_mb": 651,
      "Altitude_m": 3600,
      "Temp_c": -7.6,
      "Dewpoint_c": -10.9,
      "Wind_Direction": 232,
      "Wind_Speed_kt": 6.9
    },
    {
      "Pressure_mb": 650.5,
      "Altitude_m": 3606,
      "Temp_c": -7.6,
      "Dewpoint_c": -10.9,
      "Wind_Direction": 233,
      "Wind_Speed_kt": 6.9
    },
    {
      "Pressure_mb": 650.1,
      "Altitude_m": 3611,
      "Temp_c": -7.6,
      "Dewpoint_c": -10.9,
      "Wind_Direction": 233,
      "Wind_Speed_kt": 6.9
    },
    {
      "Pressure_mb": 649.6,
      "Altitude_m": 3617,
      "Temp_c": -7.7,
      "Dewpoint_c": -11,
      "Wind_Direction": 233,
      "Wind_Speed_kt": 6.9
    },
    {
      "Pressure_mb": 649.2,
      "Altitude_m": 3622,
      "Temp_c": -7.7,
      "Dewpoint_c": -11,
      "Wind_Direction": 233,
      "Wind_Speed_kt": 6.9
    },
    {
      "Pressure_mb": 648.7,
      "Altitude_m": 3628,
      "Temp_c": -7.8,
      "Dewpoint_c": -11.1,
      "Wind_Direction": 233,
      "Wind_Speed_kt": 6.9
    },
    {
      "Pressure_mb": 648.3,
      "Altitude_m": 3633,
      "Temp_c": -7.8,
      "Dewpoint_c": -11.1,
      "Wind_Direction": 234,
      "Wind_Speed_kt": 6.9
    },
    {
      "Pressure_mb": 647.8,
      "Altitude_m": 3639,
      "Temp_c": -7.9,
      "Dewpoint_c": -11.1,
      "Wind_Direction": 234,
      "Wind_Speed_kt": 6.9
    },
    {
      "Pressure_mb": 647.3,
      "Altitude_m": 3644,
      "Temp_c": -7.9,
      "Dewpoint_c": -11.1,
      "Wind_Direction": 234,
      "Wind_Speed_kt": 6.9
    },
    {
      "Pressure_mb": 646.9,
      "Altitude_m": 3650,
      "Temp_c": -8,
      "Dewpoint_c": -11.2,
      "Wind_Direction": 234,
      "Wind_Speed_kt": 6.9
    },
    {
      "Pressure_mb": 646.4,
      "Altitude_m": 3655,
      "Temp_c": -8,
      "Dewpoint_c": -11.2,
      "Wind_Direction": 235,
      "Wind_Speed_kt": 6.9
    },
    {
      "Pressure_mb": 646,
      "Altitude_m": 3661,
      "Temp_c": -8.1,
      "Dewpoint_c": -11.2,
      "Wind_Direction": 235,
      "Wind_Speed_kt": 6.9
    },
    {
      "Pressure_mb": 645.5,
      "Altitude_m": 3667,
      "Temp_c": -8.1,
      "Dewpoint_c": -11.3,
      "Wind_Direction": 235,
      "Wind_Speed_kt": 6.9
    },
    {
      "Pressure_mb": 645.1,
      "Altitude_m": 3672,
      "Temp_c": -8.1,
      "Dewpoint_c": -11.3,
      "Wind_Direction": 235,
      "Wind_Speed_kt": 7
    },
    {
      "Pressure_mb": 644.6,
      "Altitude_m": 3678,
      "Temp_c": -8.2,
      "Dewpoint_c": -11.3,
      "Wind_Direction": 236,
      "Wind_Speed_kt": 7
    },
    {
      "Pressure_mb": 644.2,
      "Altitude_m": 3683,
      "Temp_c": -8.2,
      "Dewpoint_c": -11.3,
      "Wind_Direction": 236,
      "Wind_Speed_kt": 7
    },
    {
      "Pressure_mb": 643.7,
      "Altitude_m": 3688,
      "Temp_c": -8.3,
      "Dewpoint_c": -11.4,
      "Wind_Direction": 236,
      "Wind_Speed_kt": 7
    },
    {
      "Pressure_mb": 643.3,
      "Altitude_m": 3692,
      "Temp_c": -8.3,
      "Dewpoint_c": -11.4,
      "Wind_Direction": 236,
      "Wind_Speed_kt": 7
    },
    {
      "Pressure_mb": 642.9,
      "Altitude_m": 3697,
      "Temp_c": -8.4,
      "Dewpoint_c": -11.4,
      "Wind_Direction": 237,
      "Wind_Speed_kt": 7
    },
    {
      "Pressure_mb": 642.5,
      "Altitude_m": 3702,
      "Temp_c": -8.4,
      "Dewpoint_c": -11.5,
      "Wind_Direction": 237,
      "Wind_Speed_kt": 7
    },
    {
      "Pressure_mb": 642.1,
      "Altitude_m": 3707,
      "Temp_c": -8.5,
      "Dewpoint_c": -11.5,
      "Wind_Direction": 237,
      "Wind_Speed_kt": 7.1
    },
    {
      "Pressure_mb": 641.7,
      "Altitude_m": 3712,
      "Temp_c": -8.5,
      "Dewpoint_c": -11.5,
      "Wind_Direction": 237,
      "Wind_Speed_kt": 7.1
    },
    {
      "Pressure_mb": 641.3,
      "Altitude_m": 3717,
      "Temp_c": -8.6,
      "Dewpoint_c": -11.5,
      "Wind_Direction": 238,
      "Wind_Speed_kt": 7.1
    },
    {
      "Pressure_mb": 640.9,
      "Altitude_m": 3722,
      "Temp_c": -8.6,
      "Dewpoint_c": -11.6,
      "Wind_Direction": 238,
      "Wind_Speed_kt": 7.1
    },
    {
      "Pressure_mb": 640.4,
      "Altitude_m": 3727,
      "Temp_c": -8.6,
      "Dewpoint_c": -11.6,
      "Wind_Direction": 238,
      "Wind_Speed_kt": 7.1
    },
    {
      "Pressure_mb": 640,
      "Altitude_m": 3732,
      "Temp_c": -8.7,
      "Dewpoint_c": -11.6,
      "Wind_Direction": 238,
      "Wind_Speed_kt": 7.1
    },
    {
      "Pressure_mb": 639.6,
      "Altitude_m": 3738,
      "Temp_c": -8.7,
      "Dewpoint_c": -11.7,
      "Wind_Direction": 239,
      "Wind_Speed_kt": 7.1
    },
    {
      "Pressure_mb": 639.1,
      "Altitude_m": 3743,
      "Temp_c": -8.8,
      "Dewpoint_c": -11.7,
      "Wind_Direction": 239,
      "Wind_Speed_kt": 7.2
    },
    {
      "Pressure_mb": 638.7,
      "Altitude_m": 3748,
      "Temp_c": -8.8,
      "Dewpoint_c": -11.7,
      "Wind_Direction": 239,
      "Wind_Speed_kt": 7.1
    },
    {
      "Pressure_mb": 638.3,
      "Altitude_m": 3754,
      "Temp_c": -8.9,
      "Dewpoint_c": -11.8,
      "Wind_Direction": 239,
      "Wind_Speed_kt": 7.1
    },
    {
      "Pressure_mb": 637.9,
      "Altitude_m": 3759,
      "Temp_c": -8.9,
      "Dewpoint_c": -11.8,
      "Wind_Direction": 239,
      "Wind_Speed_kt": 7
    },
    {
      "Pressure_mb": 637.4,
      "Altitude_m": 3764,
      "Temp_c": -9,
      "Dewpoint_c": -11.8,
      "Wind_Direction": 239,
      "Wind_Speed_kt": 7
    },
    {
      "Pressure_mb": 637,
      "Altitude_m": 3769,
      "Temp_c": -9,
      "Dewpoint_c": -11.8,
      "Wind_Direction": 240,
      "Wind_Speed_kt": 7
    },
    {
      "Pressure_mb": 636.6,
      "Altitude_m": 3775,
      "Temp_c": -9,
      "Dewpoint_c": -11.9,
      "Wind_Direction": 240,
      "Wind_Speed_kt": 6.9
    },
    {
      "Pressure_mb": 636.1,
      "Altitude_m": 3780,
      "Temp_c": -9.1,
      "Dewpoint_c": -11.9,
      "Wind_Direction": 240,
      "Wind_Speed_kt": 6.9
    },
    {
      "Pressure_mb": 635.7,
      "Altitude_m": 3785,
      "Temp_c": -9.1,
      "Dewpoint_c": -12,
      "Wind_Direction": 240,
      "Wind_Speed_kt": 6.9
    },
    {
      "Pressure_mb": 635.3,
      "Altitude_m": 3790,
      "Temp_c": -9.2,
      "Dewpoint_c": -12,
      "Wind_Direction": 240,
      "Wind_Speed_kt": 6.8
    },
    {
      "Pressure_mb": 634.9,
      "Altitude_m": 3795,
      "Temp_c": -9.2,
      "Dewpoint_c": -12,
      "Wind_Direction": 241,
      "Wind_Speed_kt": 6.8
    },
    {
      "Pressure_mb": 634.5,
      "Altitude_m": 3800,
      "Temp_c": -9.3,
      "Dewpoint_c": -12.1,
      "Wind_Direction": 241,
      "Wind_Speed_kt": 6.8
    },
    {
      "Pressure_mb": 634.1,
      "Altitude_m": 3805,
      "Temp_c": -9.3,
      "Dewpoint_c": -12.1,
      "Wind_Direction": 241,
      "Wind_Speed_kt": 6.7
    },
    {
      "Pressure_mb": 633.6,
      "Altitude_m": 3810,
      "Temp_c": -9.3,
      "Dewpoint_c": -12.2,
      "Wind_Direction": 241,
      "Wind_Speed_kt": 6.7
    },
    {
      "Pressure_mb": 633.2,
      "Altitude_m": 3815,
      "Temp_c": -9.4,
      "Dewpoint_c": -12.2,
      "Wind_Direction": 241,
      "Wind_Speed_kt": 6.7
    },
    {
      "Pressure_mb": 632.8,
      "Altitude_m": 3820,
      "Temp_c": -9.4,
      "Dewpoint_c": -12.2,
      "Wind_Direction": 241,
      "Wind_Speed_kt": 6.6
    },
    {
      "Pressure_mb": 632.4,
      "Altitude_m": 3825,
      "Temp_c": -9.5,
      "Dewpoint_c": -12.3,
      "Wind_Direction": 242,
      "Wind_Speed_kt": 6.6
    },
    {
      "Pressure_mb": 632,
      "Altitude_m": 3831,
      "Temp_c": -9.5,
      "Dewpoint_c": -12.3,
      "Wind_Direction": 242,
      "Wind_Speed_kt": 6.5
    },
    {
      "Pressure_mb": 631.5,
      "Altitude_m": 3836,
      "Temp_c": -9.6,
      "Dewpoint_c": -12.4,
      "Wind_Direction": 242,
      "Wind_Speed_kt": 6.5
    },
    {
      "Pressure_mb": 631.1,
      "Altitude_m": 3841,
      "Temp_c": -9.6,
      "Dewpoint_c": -12.4,
      "Wind_Direction": 242,
      "Wind_Speed_kt": 6.5
    },
    {
      "Pressure_mb": 630.7,
      "Altitude_m": 3846,
      "Temp_c": -9.7,
      "Dewpoint_c": -12.4,
      "Wind_Direction": 242,
      "Wind_Speed_kt": 6.4
    },
    {
      "Pressure_mb": 630.3,
      "Altitude_m": 3851,
      "Temp_c": -9.7,
      "Dewpoint_c": -12.5,
      "Wind_Direction": 242,
      "Wind_Speed_kt": 6.4
    },
    {
      "Pressure_mb": 629.9,
      "Altitude_m": 3856,
      "Temp_c": -9.8,
      "Dewpoint_c": -12.5,
      "Wind_Direction": 242,
      "Wind_Speed_kt": 6.4
    },
    {
      "Pressure_mb": 629.5,
      "Altitude_m": 3861,
      "Temp_c": -9.8,
      "Dewpoint_c": -12.6,
      "Wind_Direction": 242,
      "Wind_Speed_kt": 6.4
    },
    {
      "Pressure_mb": 629.1,
      "Altitude_m": 3866,
      "Temp_c": -9.8,
      "Dewpoint_c": -12.6,
      "Wind_Direction": 242,
      "Wind_Speed_kt": 6.4
    },
    {
      "Pressure_mb": 628.7,
      "Altitude_m": 3871,
      "Temp_c": -9.9,
      "Dewpoint_c": -12.6,
      "Wind_Direction": 242,
      "Wind_Speed_kt": 6.4
    },
    {
      "Pressure_mb": 628.3,
      "Altitude_m": 3876,
      "Temp_c": -9.9,
      "Dewpoint_c": -12.7,
      "Wind_Direction": 242,
      "Wind_Speed_kt": 6.4
    },
    {
      "Pressure_mb": 627.8,
      "Altitude_m": 3881,
      "Temp_c": -10,
      "Dewpoint_c": -12.7,
      "Wind_Direction": 242,
      "Wind_Speed_kt": 6.4
    },
    {
      "Pressure_mb": 627.4,
      "Altitude_m": 3886,
      "Temp_c": -10,
      "Dewpoint_c": -12.5,
      "Wind_Direction": 242,
      "Wind_Speed_kt": 6.4
    },
    {
      "Pressure_mb": 626.9,
      "Altitude_m": 3892,
      "Temp_c": -10,
      "Dewpoint_c": -12.5,
      "Wind_Direction": 242,
      "Wind_Speed_kt": 6.4
    },
    {
      "Pressure_mb": 626.5,
      "Altitude_m": 3897,
      "Temp_c": -10.1,
      "Dewpoint_c": -12.5,
      "Wind_Direction": 242,
      "Wind_Speed_kt": 6.4
    },
    {
      "Pressure_mb": 626.1,
      "Altitude_m": 3903,
      "Temp_c": -10.1,
      "Dewpoint_c": -12.6,
      "Wind_Direction": 242,
      "Wind_Speed_kt": 6.4
    },
    {
      "Pressure_mb": 625.7,
      "Altitude_m": 3908,
      "Temp_c": -10.2,
      "Dewpoint_c": -12.6,
      "Wind_Direction": 242,
      "Wind_Speed_kt": 6.4
    },
    {
      "Pressure_mb": 625.3,
      "Altitude_m": 3913,
      "Temp_c": -10.2,
      "Dewpoint_c": -12.6,
      "Wind_Direction": 242,
      "Wind_Speed_kt": 6.4
    },
    {
      "Pressure_mb": 624.9,
      "Altitude_m": 3918,
      "Temp_c": -10.3,
      "Dewpoint_c": -12.7,
      "Wind_Direction": 242,
      "Wind_Speed_kt": 6.4
    },
    {
      "Pressure_mb": 624.5,
      "Altitude_m": 3923,
      "Temp_c": -10.3,
      "Dewpoint_c": -12.7,
      "Wind_Direction": 242,
      "Wind_Speed_kt": 6.4
    },
    {
      "Pressure_mb": 624.1,
      "Altitude_m": 3928,
      "Temp_c": -10.4,
      "Dewpoint_c": -12.8,
      "Wind_Direction": 242,
      "Wind_Speed_kt": 6.4
    },
    {
      "Pressure_mb": 623.7,
      "Altitude_m": 3932,
      "Temp_c": -10.4,
      "Dewpoint_c": -12.8,
      "Wind_Direction": 242,
      "Wind_Speed_kt": 6.4
    },
    {
      "Pressure_mb": 623.3,
      "Altitude_m": 3937,
      "Temp_c": -10.4,
      "Dewpoint_c": -12.8,
      "Wind_Direction": 242,
      "Wind_Speed_kt": 6.4
    },
    {
      "Pressure_mb": 622.9,
      "Altitude_m": 3942,
      "Temp_c": -10.5,
      "Dewpoint_c": -12.8,
      "Wind_Direction": 242,
      "Wind_Speed_kt": 6.4
    },
    {
      "Pressure_mb": 622.5,
      "Altitude_m": 3947,
      "Temp_c": -10.5,
      "Dewpoint_c": -12.9,
      "Wind_Direction": 242,
      "Wind_Speed_kt": 6.4
    },
    {
      "Pressure_mb": 622.2,
      "Altitude_m": 3951,
      "Temp_c": -10.6,
      "Dewpoint_c": -12.9,
      "Wind_Direction": 242,
      "Wind_Speed_kt": 6.4
    },
    {
      "Pressure_mb": 621.8,
      "Altitude_m": 3956,
      "Temp_c": -10.6,
      "Dewpoint_c": -12.9,
      "Wind_Direction": 242,
      "Wind_Speed_kt": 6.4
    },
    {
      "Pressure_mb": 621.4,
      "Altitude_m": 3961,
      "Temp_c": -10.7,
      "Dewpoint_c": -13,
      "Wind_Direction": 242,
      "Wind_Speed_kt": 6.4
    },
    {
      "Pressure_mb": 621,
      "Altitude_m": 3966,
      "Temp_c": -10.7,
      "Dewpoint_c": -13,
      "Wind_Direction": 243,
      "Wind_Speed_kt": 6.5
    },
    {
      "Pressure_mb": 620.6,
      "Altitude_m": 3971,
      "Temp_c": -10.8,
      "Dewpoint_c": -13.1,
      "Wind_Direction": 243,
      "Wind_Speed_kt": 6.5
    },
    {
      "Pressure_mb": 620.1,
      "Altitude_m": 3976,
      "Temp_c": -10.8,
      "Dewpoint_c": -13.1,
      "Wind_Direction": 243,
      "Wind_Speed_kt": 6.5
    },
    {
      "Pressure_mb": 619.7,
      "Altitude_m": 3981,
      "Temp_c": -10.8,
      "Dewpoint_c": -13.1,
      "Wind_Direction": 243,
      "Wind_Speed_kt": 6.6
    },
    {
      "Pressure_mb": 619.3,
      "Altitude_m": 3986,
      "Temp_c": -10.9,
      "Dewpoint_c": -13.2,
      "Wind_Direction": 243,
      "Wind_Speed_kt": 6.6
    },
    {
      "Pressure_mb": 618.9,
      "Altitude_m": 3992,
      "Temp_c": -10.9,
      "Dewpoint_c": -13.2,
      "Wind_Direction": 243,
      "Wind_Speed_kt": 6.6
    },
    {
      "Pressure_mb": 618.5,
      "Altitude_m": 3997,
      "Temp_c": -11,
      "Dewpoint_c": -13.2,
      "Wind_Direction": 243,
      "Wind_Speed_kt": 6.7
    },
    {
      "Pressure_mb": 618.1,
      "Altitude_m": 4002,
      "Temp_c": -11,
      "Dewpoint_c": -13.3,
      "Wind_Direction": 244,
      "Wind_Speed_kt": 6.7
    },
    {
      "Pressure_mb": 617.7,
      "Altitude_m": 4007,
      "Temp_c": -11.1,
      "Dewpoint_c": -13.3,
      "Wind_Direction": 244,
      "Wind_Speed_kt": 6.7
    },
    {
      "Pressure_mb": 617.3,
      "Altitude_m": 4012,
      "Temp_c": -11.1,
      "Dewpoint_c": -13.3,
      "Wind_Direction": 244,
      "Wind_Speed_kt": 6.8
    },
    {
      "Pressure_mb": 616.8,
      "Altitude_m": 4017,
      "Temp_c": -11.2,
      "Dewpoint_c": -13.4,
      "Wind_Direction": 244,
      "Wind_Speed_kt": 6.8
    },
    {
      "Pressure_mb": 616.4,
      "Altitude_m": 4022,
      "Temp_c": -11.2,
      "Dewpoint_c": -13.4,
      "Wind_Direction": 244,
      "Wind_Speed_kt": 6.8
    },
    {
      "Pressure_mb": 616,
      "Altitude_m": 4027,
      "Temp_c": -11.3,
      "Dewpoint_c": -13.4,
      "Wind_Direction": 244,
      "Wind_Speed_kt": 6.9
    },
    {
      "Pressure_mb": 615.6,
      "Altitude_m": 4032,
      "Temp_c": -11.3,
      "Dewpoint_c": -13.4,
      "Wind_Direction": 244,
      "Wind_Speed_kt": 6.9
    },
    {
      "Pressure_mb": 615.2,
      "Altitude_m": 4037,
      "Temp_c": -11.4,
      "Dewpoint_c": -13.5,
      "Wind_Direction": 245,
      "Wind_Speed_kt": 6.9
    },
    {
      "Pressure_mb": 614.8,
      "Altitude_m": 4042,
      "Temp_c": -11.4,
      "Dewpoint_c": -13.5,
      "Wind_Direction": 245,
      "Wind_Speed_kt": 7
    },
    {
      "Pressure_mb": 614.4,
      "Altitude_m": 4047,
      "Temp_c": -11.4,
      "Dewpoint_c": -13.6,
      "Wind_Direction": 245,
      "Wind_Speed_kt": 7
    },
    {
      "Pressure_mb": 614,
      "Altitude_m": 4053,
      "Temp_c": -11.5,
      "Dewpoint_c": -13.7,
      "Wind_Direction": 245,
      "Wind_Speed_kt": 7
    },
    {
      "Pressure_mb": 613.6,
      "Altitude_m": 4058,
      "Temp_c": -11.5,
      "Dewpoint_c": -13.7,
      "Wind_Direction": 245,
      "Wind_Speed_kt": 7
    },
    {
      "Pressure_mb": 613.1,
      "Altitude_m": 4063,
      "Temp_c": -11.5,
      "Dewpoint_c": -13.8,
      "Wind_Direction": 245,
      "Wind_Speed_kt": 7
    },
    {
      "Pressure_mb": 612.7,
      "Altitude_m": 4069,
      "Temp_c": -11.6,
      "Dewpoint_c": -13.9,
      "Wind_Direction": 245,
      "Wind_Speed_kt": 7
    },
    {
      "Pressure_mb": 612.3,
      "Altitude_m": 4074,
      "Temp_c": -11.6,
      "Dewpoint_c": -14,
      "Wind_Direction": 245,
      "Wind_Speed_kt": 7
    },
    {
      "Pressure_mb": 611.8,
      "Altitude_m": 4080,
      "Temp_c": -11.6,
      "Dewpoint_c": -14,
      "Wind_Direction": 245,
      "Wind_Speed_kt": 7.1
    },
    {
      "Pressure_mb": 611.4,
      "Altitude_m": 4085,
      "Temp_c": -11.7,
      "Dewpoint_c": -14.1,
      "Wind_Direction": 245,
      "Wind_Speed_kt": 7.1
    },
    {
      "Pressure_mb": 611,
      "Altitude_m": 4091,
      "Temp_c": -11.7,
      "Dewpoint_c": -14.2,
      "Wind_Direction": 245,
      "Wind_Speed_kt": 7.1
    },
    {
      "Pressure_mb": 610.6,
      "Altitude_m": 4096,
      "Temp_c": -11.7,
      "Dewpoint_c": -14.3,
      "Wind_Direction": 245,
      "Wind_Speed_kt": 7.1
    },
    {
      "Pressure_mb": 610.2,
      "Altitude_m": 4102,
      "Temp_c": -11.8,
      "Dewpoint_c": -14.4,
      "Wind_Direction": 245,
      "Wind_Speed_kt": 7.1
    },
    {
      "Pressure_mb": 609.8,
      "Altitude_m": 4107,
      "Temp_c": -11.8,
      "Dewpoint_c": -14.4,
      "Wind_Direction": 245,
      "Wind_Speed_kt": 7.1
    },
    {
      "Pressure_mb": 609.3,
      "Altitude_m": 4112,
      "Temp_c": -11.8,
      "Dewpoint_c": -14.5,
      "Wind_Direction": 246,
      "Wind_Speed_kt": 7.1
    },
    {
      "Pressure_mb": 608.9,
      "Altitude_m": 4116,
      "Temp_c": -11.8,
      "Dewpoint_c": -14.6,
      "Wind_Direction": 246,
      "Wind_Speed_kt": 7.1
    },
    {
      "Pressure_mb": 608.6,
      "Altitude_m": 4121,
      "Temp_c": -11.9,
      "Dewpoint_c": -14.6,
      "Wind_Direction": 246,
      "Wind_Speed_kt": 7.1
    },
    {
      "Pressure_mb": 608.2,
      "Altitude_m": 4125,
      "Temp_c": -11.9,
      "Dewpoint_c": -14.7,
      "Wind_Direction": 246,
      "Wind_Speed_kt": 7.2
    },
    {
      "Pressure_mb": 607.9,
      "Altitude_m": 4130,
      "Temp_c": -11.9,
      "Dewpoint_c": -14.8,
      "Wind_Direction": 246,
      "Wind_Speed_kt": 7.2
    },
    {
      "Pressure_mb": 607.5,
      "Altitude_m": 4134,
      "Temp_c": -11.9,
      "Dewpoint_c": -14.8,
      "Wind_Direction": 246,
      "Wind_Speed_kt": 7.2
    },
    {
      "Pressure_mb": 607.2,
      "Altitude_m": 4138,
      "Temp_c": -11.9,
      "Dewpoint_c": -14.9,
      "Wind_Direction": 246,
      "Wind_Speed_kt": 7.2
    },
    {
      "Pressure_mb": 606.8,
      "Altitude_m": 4143,
      "Temp_c": -12,
      "Dewpoint_c": -14.9,
      "Wind_Direction": 246,
      "Wind_Speed_kt": 7.2
    },
    {
      "Pressure_mb": 606.5,
      "Altitude_m": 4147,
      "Temp_c": -12,
      "Dewpoint_c": -15,
      "Wind_Direction": 246,
      "Wind_Speed_kt": 7.2
    },
    {
      "Pressure_mb": 606.2,
      "Altitude_m": 4152,
      "Temp_c": -12,
      "Dewpoint_c": -15.1,
      "Wind_Direction": 246,
      "Wind_Speed_kt": 7.2
    },
    {
      "Pressure_mb": 605.9,
      "Altitude_m": 4156,
      "Temp_c": -12,
      "Dewpoint_c": -15.1,
      "Wind_Direction": 247,
      "Wind_Speed_kt": 7.2
    },
    {
      "Pressure_mb": 605.5,
      "Altitude_m": 4160,
      "Temp_c": -12.1,
      "Dewpoint_c": -15.2,
      "Wind_Direction": 247,
      "Wind_Speed_kt": 7.2
    },
    {
      "Pressure_mb": 605.2,
      "Altitude_m": 4163,
      "Temp_c": -12.1,
      "Dewpoint_c": -15.2,
      "Wind_Direction": 248,
      "Wind_Speed_kt": 7.2
    },
    {
      "Pressure_mb": 604.9,
      "Altitude_m": 4167,
      "Temp_c": -12.1,
      "Dewpoint_c": -15.3,
      "Wind_Direction": 248,
      "Wind_Speed_kt": 7.2
    },
    {
      "Pressure_mb": 604.7,
      "Altitude_m": 4170,
      "Temp_c": -12.1,
      "Dewpoint_c": -15.4,
      "Wind_Direction": 249,
      "Wind_Speed_kt": 7.2
    },
    {
      "Pressure_mb": 604.3,
      "Altitude_m": 4174,
      "Temp_c": -12.2,
      "Dewpoint_c": -15.4,
      "Wind_Direction": 249,
      "Wind_Speed_kt": 7.2
    },
    {
      "Pressure_mb": 603.9,
      "Altitude_m": 4178,
      "Temp_c": -12.2,
      "Dewpoint_c": -15.4,
      "Wind_Direction": 250,
      "Wind_Speed_kt": 7.2
    },
    {
      "Pressure_mb": 603.6,
      "Altitude_m": 4183,
      "Temp_c": -12.3,
      "Dewpoint_c": -15.4,
      "Wind_Direction": 250,
      "Wind_Speed_kt": 7.2
    },
    {
      "Pressure_mb": 603.3,
      "Altitude_m": 4187,
      "Temp_c": -12.3,
      "Dewpoint_c": -15.5,
      "Wind_Direction": 251,
      "Wind_Speed_kt": 7.2
    },
    {
      "Pressure_mb": 603,
      "Altitude_m": 4191,
      "Temp_c": -12.3,
      "Dewpoint_c": -15.5,
      "Wind_Direction": 251,
      "Wind_Speed_kt": 7.2
    },
    {
      "Pressure_mb": 602.7,
      "Altitude_m": 4195,
      "Temp_c": -12.4,
      "Dewpoint_c": -15.5,
      "Wind_Direction": 252,
      "Wind_Speed_kt": 7.3
    },
    {
      "Pressure_mb": 602.3,
      "Altitude_m": 4200,
      "Temp_c": -12.4,
      "Dewpoint_c": -15.6,
      "Wind_Direction": 252,
      "Wind_Speed_kt": 7.3
    },
    {
      "Pressure_mb": 602,
      "Altitude_m": 4204,
      "Temp_c": -12.5,
      "Dewpoint_c": -15.6,
      "Wind_Direction": 253,
      "Wind_Speed_kt": 7.3
    },
    {
      "Pressure_mb": 601.7,
      "Altitude_m": 4208,
      "Temp_c": -12.5,
      "Dewpoint_c": -15.6,
      "Wind_Direction": 253,
      "Wind_Speed_kt": 7.3
    },
    {
      "Pressure_mb": 601.3,
      "Altitude_m": 4212,
      "Temp_c": -12.5,
      "Dewpoint_c": -15.6,
      "Wind_Direction": 254,
      "Wind_Speed_kt": 7.3
    },
    {
      "Pressure_mb": 601,
      "Altitude_m": 4216,
      "Temp_c": -12.6,
      "Dewpoint_c": -15.7,
      "Wind_Direction": 254,
      "Wind_Speed_kt": 7.3
    },
    {
      "Pressure_mb": 600.7,
      "Altitude_m": 4221,
      "Temp_c": -12.6,
      "Dewpoint_c": -15.7,
      "Wind_Direction": 255,
      "Wind_Speed_kt": 7.3
    },
    {
      "Pressure_mb": 600.4,
      "Altitude_m": 4225,
      "Temp_c": -12.6,
      "Dewpoint_c": -15.7,
      "Wind_Direction": 255,
      "Wind_Speed_kt": 7.3
    },
    {
      "Pressure_mb": 600.1,
      "Altitude_m": 4228,
      "Temp_c": -12.7,
      "Dewpoint_c": -15.7,
      "Wind_Direction": 256,
      "Wind_Speed_kt": 7.3
    },
    {
      "Pressure_mb": 599.8,
      "Altitude_m": 4232,
      "Temp_c": -12.7,
      "Dewpoint_c": -15.8,
      "Wind_Direction": 255,
      "Wind_Speed_kt": 7.3
    },
    {
      "Pressure_mb": 599.5,
      "Altitude_m": 4235,
      "Temp_c": -12.7,
      "Dewpoint_c": -15.8,
      "Wind_Direction": 255,
      "Wind_Speed_kt": 7.4
    },
    {
      "Pressure_mb": 599.2,
      "Altitude_m": 4239,
      "Temp_c": -12.8,
      "Dewpoint_c": -15.8,
      "Wind_Direction": 254,
      "Wind_Speed_kt": 7.4
    },
    {
      "Pressure_mb": 598.9,
      "Altitude_m": 4243,
      "Temp_c": -12.8,
      "Dewpoint_c": -15.9,
      "Wind_Direction": 254,
      "Wind_Speed_kt": 7.4
    },
    {
      "Pressure_mb": 598.7,
      "Altitude_m": 4246,
      "Temp_c": -12.8,
      "Dewpoint_c": -15.9,
      "Wind_Direction": 254,
      "Wind_Speed_kt": 7.4
    },
    {
      "Pressure_mb": 598.4,
      "Altitude_m": 4250,
      "Temp_c": -12.9,
      "Dewpoint_c": -15.9,
      "Wind_Direction": 253,
      "Wind_Speed_kt": 7.5
    },
    {
      "Pressure_mb": 598.1,
      "Altitude_m": 4253,
      "Temp_c": -12.9,
      "Dewpoint_c": -16,
      "Wind_Direction": 253,
      "Wind_Speed_kt": 7.5
    },
    {
      "Pressure_mb": 597.8,
      "Altitude_m": 4257,
      "Temp_c": -12.9,
      "Dewpoint_c": -16,
      "Wind_Direction": 252,
      "Wind_Speed_kt": 7.5
    },
    {
      "Pressure_mb": 597.5,
      "Altitude_m": 4260,
      "Temp_c": -13,
      "Dewpoint_c": -16,
      "Wind_Direction": 252,
      "Wind_Speed_kt": 7.5
    },
    {
      "Pressure_mb": 597.3,
      "Altitude_m": 4264,
      "Temp_c": -13,
      "Dewpoint_c": -16,
      "Wind_Direction": 251,
      "Wind_Speed_kt": 7.6
    },
    {
      "Pressure_mb": 597,
      "Altitude_m": 4268,
      "Temp_c": -13,
      "Dewpoint_c": -16.1,
      "Wind_Direction": 251,
      "Wind_Speed_kt": 7.6
    },
    {
      "Pressure_mb": 596.7,
      "Altitude_m": 4271,
      "Temp_c": -13.1,
      "Dewpoint_c": -16.1,
      "Wind_Direction": 251,
      "Wind_Speed_kt": 7.6
    },
    {
      "Pressure_mb": 596.4,
      "Altitude_m": 4275,
      "Temp_c": -13.1,
      "Dewpoint_c": -16.1,
      "Wind_Direction": 250,
      "Wind_Speed_kt": 7.7
    },
    {
      "Pressure_mb": 596.1,
      "Altitude_m": 4278,
      "Temp_c": -13.1,
      "Dewpoint_c": -16.2,
      "Wind_Direction": 250,
      "Wind_Speed_kt": 7.7
    },
    {
      "Pressure_mb": 595.9,
      "Altitude_m": 4282,
      "Temp_c": -13.2,
      "Dewpoint_c": -16.2,
      "Wind_Direction": 249,
      "Wind_Speed_kt": 7.7
    },
    {
      "Pressure_mb": 595.5,
      "Altitude_m": 4286,
      "Temp_c": -13.2,
      "Dewpoint_c": -16.3,
      "Wind_Direction": 249,
      "Wind_Speed_kt": 7.7
    },
    {
      "Pressure_mb": 595.2,
      "Altitude_m": 4290,
      "Temp_c": -13.2,
      "Dewpoint_c": -16.3,
      "Wind_Direction": 248,
      "Wind_Speed_kt": 7.8
    },
    {
      "Pressure_mb": 594.9,
      "Altitude_m": 4294,
      "Temp_c": -13.3,
      "Dewpoint_c": -16.3,
      "Wind_Direction": 248,
      "Wind_Speed_kt": 7.8
    },
    {
      "Pressure_mb": 594.6,
      "Altitude_m": 4299,
      "Temp_c": -13.3,
      "Dewpoint_c": -16.4,
      "Wind_Direction": 248,
      "Wind_Speed_kt": 7.8
    },
    {
      "Pressure_mb": 594.2,
      "Altitude_m": 4303,
      "Temp_c": -13.3,
      "Dewpoint_c": -16.4,
      "Wind_Direction": 247,
      "Wind_Speed_kt": 7.9
    },
    {
      "Pressure_mb": 593.9,
      "Altitude_m": 4307,
      "Temp_c": -13.4,
      "Dewpoint_c": -16.5,
      "Wind_Direction": 247,
      "Wind_Speed_kt": 7.9
    },
    {
      "Pressure_mb": 593.6,
      "Altitude_m": 4310,
      "Temp_c": -13.4,
      "Dewpoint_c": -16.5,
      "Wind_Direction": 247,
      "Wind_Speed_kt": 8
    },
    {
      "Pressure_mb": 593.4,
      "Altitude_m": 4314,
      "Temp_c": -13.4,
      "Dewpoint_c": -16.6,
      "Wind_Direction": 247,
      "Wind_Speed_kt": 8
    },
    {
      "Pressure_mb": 593.1,
      "Altitude_m": 4317,
      "Temp_c": -13.5,
      "Dewpoint_c": -16.6,
      "Wind_Direction": 247,
      "Wind_Speed_kt": 8.1
    },
    {
      "Pressure_mb": 592.8,
      "Altitude_m": 4321,
      "Temp_c": -13.5,
      "Dewpoint_c": -16.6,
      "Wind_Direction": 248,
      "Wind_Speed_kt": 8.1
    },
    {
      "Pressure_mb": 592.5,
      "Altitude_m": 4324,
      "Temp_c": -13.5,
      "Dewpoint_c": -16.7,
      "Wind_Direction": 248,
      "Wind_Speed_kt": 8.2
    },
    {
      "Pressure_mb": 592.3,
      "Altitude_m": 4328,
      "Temp_c": -13.6,
      "Dewpoint_c": -16.7,
      "Wind_Direction": 248,
      "Wind_Speed_kt": 8.2
    },
    {
      "Pressure_mb": 591.8,
      "Altitude_m": 4333,
      "Temp_c": -13.6,
      "Dewpoint_c": -16.8,
      "Wind_Direction": 248,
      "Wind_Speed_kt": 8.3
    },
    {
      "Pressure_mb": 591.4,
      "Altitude_m": 4339,
      "Temp_c": -13.7,
      "Dewpoint_c": -16.9,
      "Wind_Direction": 248,
      "Wind_Speed_kt": 8.3
    },
    {
      "Pressure_mb": 591,
      "Altitude_m": 4344,
      "Temp_c": -13.7,
      "Dewpoint_c": -16.9,
      "Wind_Direction": 248,
      "Wind_Speed_kt": 8.4
    },
    {
      "Pressure_mb": 590.6,
      "Altitude_m": 4349,
      "Temp_c": -13.7,
      "Dewpoint_c": -17,
      "Wind_Direction": 248,
      "Wind_Speed_kt": 8.4
    },
    {
      "Pressure_mb": 590.2,
      "Altitude_m": 4355,
      "Temp_c": -13.8,
      "Dewpoint_c": -17.1,
      "Wind_Direction": 248,
      "Wind_Speed_kt": 8.5
    },
    {
      "Pressure_mb": 589.8,
      "Altitude_m": 4360,
      "Temp_c": -13.8,
      "Dewpoint_c": -17.1,
      "Wind_Direction": 248,
      "Wind_Speed_kt": 8.5
    },
    {
      "Pressure_mb": 589.3,
      "Altitude_m": 4365,
      "Temp_c": -13.9,
      "Dewpoint_c": -17.2,
      "Wind_Direction": 248,
      "Wind_Speed_kt": 8.6
    },
    {
      "Pressure_mb": 588.9,
      "Altitude_m": 4371,
      "Temp_c": -13.9,
      "Dewpoint_c": -17.3,
      "Wind_Direction": 248,
      "Wind_Speed_kt": 8.6
    },
    {
      "Pressure_mb": 588.5,
      "Altitude_m": 4377,
      "Temp_c": -13.9,
      "Dewpoint_c": -17.4,
      "Wind_Direction": 248,
      "Wind_Speed_kt": 8.7
    },
    {
      "Pressure_mb": 588,
      "Altitude_m": 4383,
      "Temp_c": -14,
      "Dewpoint_c": -17.4,
      "Wind_Direction": 248,
      "Wind_Speed_kt": 8.7
    },
    {
      "Pressure_mb": 587.6,
      "Altitude_m": 4388,
      "Temp_c": -14,
      "Dewpoint_c": -17.5,
      "Wind_Direction": 248,
      "Wind_Speed_kt": 8.8
    },
    {
      "Pressure_mb": 587.1,
      "Altitude_m": 4394,
      "Temp_c": -14,
      "Dewpoint_c": -17.5,
      "Wind_Direction": 248,
      "Wind_Speed_kt": 8.8
    },
    {
      "Pressure_mb": 586.8,
      "Altitude_m": 4400,
      "Temp_c": -14.1,
      "Dewpoint_c": -17.6,
      "Wind_Direction": 248,
      "Wind_Speed_kt": 8.9
    },
    {
      "Pressure_mb": 586.4,
      "Altitude_m": 4404,
      "Temp_c": -14.1,
      "Dewpoint_c": -17.7,
      "Wind_Direction": 248,
      "Wind_Speed_kt": 8.9
    },
    {
      "Pressure_mb": 586,
      "Altitude_m": 4409,
      "Temp_c": -14.1,
      "Dewpoint_c": -17.8,
      "Wind_Direction": 248,
      "Wind_Speed_kt": 9
    },
    {
      "Pressure_mb": 585.7,
      "Altitude_m": 4413,
      "Temp_c": -14.1,
      "Dewpoint_c": -17.9,
      "Wind_Direction": 248,
      "Wind_Speed_kt": 9
    },
    {
      "Pressure_mb": 585.3,
      "Altitude_m": 4418,
      "Temp_c": -14.2,
      "Dewpoint_c": -18,
      "Wind_Direction": 247,
      "Wind_Speed_kt": 9.1
    },
    {
      "Pressure_mb": 584.9,
      "Altitude_m": 4422,
      "Temp_c": -14.2,
      "Dewpoint_c": -18.1,
      "Wind_Direction": 247,
      "Wind_Speed_kt": 9.1
    },
    {
      "Pressure_mb": 584.6,
      "Altitude_m": 4427,
      "Temp_c": -14.2,
      "Dewpoint_c": -18.2,
      "Wind_Direction": 247,
      "Wind_Speed_kt": 9.2
    },
    {
      "Pressure_mb": 584.3,
      "Altitude_m": 4431,
      "Temp_c": -14.2,
      "Dewpoint_c": -18.3,
      "Wind_Direction": 247,
      "Wind_Speed_kt": 9.2
    },
    {
      "Pressure_mb": 584,
      "Altitude_m": 4435,
      "Temp_c": -14.3,
      "Dewpoint_c": -18.4,
      "Wind_Direction": 247,
      "Wind_Speed_kt": 9.3
    },
    {
      "Pressure_mb": 583.7,
      "Altitude_m": 4439,
      "Temp_c": -14.3,
      "Dewpoint_c": -18.5,
      "Wind_Direction": 247,
      "Wind_Speed_kt": 9.3
    },
    {
      "Pressure_mb": 583.4,
      "Altitude_m": 4443,
      "Temp_c": -14.3,
      "Dewpoint_c": -18.6,
      "Wind_Direction": 246,
      "Wind_Speed_kt": 9.4
    },
    {
      "Pressure_mb": 583.1,
      "Altitude_m": 4446,
      "Temp_c": -14.3,
      "Dewpoint_c": -18.6,
      "Wind_Direction": 246,
      "Wind_Speed_kt": 9.4
    },
    {
      "Pressure_mb": 582.8,
      "Altitude_m": 4450,
      "Temp_c": -14.3,
      "Dewpoint_c": -18.7,
      "Wind_Direction": 246,
      "Wind_Speed_kt": 9.5
    },
    {
      "Pressure_mb": 582.5,
      "Altitude_m": 4454,
      "Temp_c": -14.3,
      "Dewpoint_c": -18.8,
      "Wind_Direction": 246,
      "Wind_Speed_kt": 9.6
    },
    {
      "Pressure_mb": 582.1,
      "Altitude_m": 4459,
      "Temp_c": -14.3,
      "Dewpoint_c": -19,
      "Wind_Direction": 246,
      "Wind_Speed_kt": 9.6
    },
    {
      "Pressure_mb": 581.8,
      "Altitude_m": 4463,
      "Temp_c": -14.3,
      "Dewpoint_c": -19.1,
      "Wind_Direction": 246,
      "Wind_Speed_kt": 9.7
    },
    {
      "Pressure_mb": 581.5,
      "Altitude_m": 4467,
      "Temp_c": -14.3,
      "Dewpoint_c": -19.3,
      "Wind_Direction": 245,
      "Wind_Speed_kt": 9.7
    },
    {
      "Pressure_mb": 581.2,
      "Altitude_m": 4471,
      "Temp_c": -14.3,
      "Dewpoint_c": -19.5,
      "Wind_Direction": 245,
      "Wind_Speed_kt": 9.8
    },
    {
      "Pressure_mb": 580.9,
      "Altitude_m": 4476,
      "Temp_c": -14.3,
      "Dewpoint_c": -19.6,
      "Wind_Direction": 245,
      "Wind_Speed_kt": 9.8
    },
    {
      "Pressure_mb": 580.6,
      "Altitude_m": 4480,
      "Temp_c": -14.3,
      "Dewpoint_c": -19.8,
      "Wind_Direction": 245,
      "Wind_Speed_kt": 9.9
    },
    {
      "Pressure_mb": 580.3,
      "Altitude_m": 4483,
      "Temp_c": -14.3,
      "Dewpoint_c": -20,
      "Wind_Direction": 245,
      "Wind_Speed_kt": 9.9
    },
    {
      "Pressure_mb": 580,
      "Altitude_m": 4487,
      "Temp_c": -14.3,
      "Dewpoint_c": -20.2,
      "Wind_Direction": 245,
      "Wind_Speed_kt": 0
    },
    {
      "Pressure_mb": 579.7,
      "Altitude_m": 4491,
      "Temp_c": -14.3,
      "Dewpoint_c": -20.3,
      "Wind_Direction": 245,
      "Wind_Speed_kt": 0.1
    },
    {
      "Pressure_mb": 579.4,
      "Altitude_m": 4495,
      "Temp_c": -14.3,
      "Dewpoint_c": -20.5,
      "Wind_Direction": 245,
      "Wind_Speed_kt": 0.2
    },
    {
      "Pressure_mb": 579.1,
      "Altitude_m": 4498,
      "Temp_c": -14.3,
      "Dewpoint_c": -20.7,
      "Wind_Direction": 245,
      "Wind_Speed_kt": 0.3
    },
    {
      "Pressure_mb": 578.8,
      "Altitude_m": 4502,
      "Temp_c": -14.3,
      "Dewpoint_c": -20.9,
      "Wind_Direction": 245,
      "Wind_Speed_kt": 0.4
    },
    {
      "Pressure_mb": 578.5,
      "Altitude_m": 4506,
      "Temp_c": -14.3,
      "Dewpoint_c": -21.1,
      "Wind_Direction": 245,
      "Wind_Speed_kt": 0.5
    },
    {
      "Pressure_mb": 578.2,
      "Altitude_m": 4510,
      "Temp_c": -14.4,
      "Dewpoint_c": -21.3,
      "Wind_Direction": 245,
      "Wind_Speed_kt": 0.6
    },
    {
      "Pressure_mb": 577.9,
      "Altitude_m": 4514,
      "Temp_c": -14.4,
      "Dewpoint_c": -21.4,
      "Wind_Direction": 245,
      "Wind_Speed_kt": 0.7
    },
    {
      "Pressure_mb": 577.6,
      "Altitude_m": 4518,
      "Temp_c": -14.4,
      "Dewpoint_c": -21.6,
      "Wind_Direction": 245,
      "Wind_Speed_kt": 0.8
    },
    {
      "Pressure_mb": 577.3,
      "Altitude_m": 4522,
      "Temp_c": -14.4,
      "Dewpoint_c": -21.7,
      "Wind_Direction": 245,
      "Wind_Speed_kt": 0.9
    },
    {
      "Pressure_mb": 577,
      "Altitude_m": 4526,
      "Temp_c": -14.4,
      "Dewpoint_c": -21.9,
      "Wind_Direction": 245,
      "Wind_Speed_kt": 1
    },
    {
      "Pressure_mb": 576.6,
      "Altitude_m": 4530,
      "Temp_c": -14.4,
      "Dewpoint_c": -22,
      "Wind_Direction": 245,
      "Wind_Speed_kt": 1.1
    },
    {
      "Pressure_mb": 576.3,
      "Altitude_m": 4535,
      "Temp_c": -14.4,
      "Dewpoint_c": -22.2,
      "Wind_Direction": 245,
      "Wind_Speed_kt": 1.2
    },
    {
      "Pressure_mb": 576,
      "Altitude_m": 4539,
      "Temp_c": -14.5,
      "Dewpoint_c": -22.3,
      "Wind_Direction": 245,
      "Wind_Speed_kt": 1.3
    },
    {
      "Pressure_mb": 575.7,
      "Altitude_m": 4544,
      "Temp_c": -14.5,
      "Dewpoint_c": -22.5,
      "Wind_Direction": 245,
      "Wind_Speed_kt": 1.4
    },
    {
      "Pressure_mb": 575.3,
      "Altitude_m": 4548,
      "Temp_c": -14.5,
      "Dewpoint_c": -22.6,
      "Wind_Direction": 245,
      "Wind_Speed_kt": 1.5
    },
    {
      "Pressure_mb": 575,
      "Altitude_m": 4553,
      "Temp_c": -14.5,
      "Dewpoint_c": -22.8,
      "Wind_Direction": 244,
      "Wind_Speed_kt": 1.6
    },
    {
      "Pressure_mb": 574.7,
      "Altitude_m": 4557,
      "Temp_c": -14.5,
      "Dewpoint_c": -22.9,
      "Wind_Direction": 244,
      "Wind_Speed_kt": 1.7
    },
    {
      "Pressure_mb": 574.4,
      "Altitude_m": 4561,
      "Temp_c": -14.6,
      "Dewpoint_c": -23.1,
      "Wind_Direction": 244,
      "Wind_Speed_kt": 1.8
    },
    {
      "Pressure_mb": 574,
      "Altitude_m": 4565,
      "Temp_c": -14.6,
      "Dewpoint_c": -23.3,
      "Wind_Direction": 244,
      "Wind_Speed_kt": 1.9
    },
    {
      "Pressure_mb": 573.7,
      "Altitude_m": 4569,
      "Temp_c": -14.6,
      "Dewpoint_c": -23.3,
      "Wind_Direction": 244,
      "Wind_Speed_kt": 1.9
    },
    {
      "Pressure_mb": 573.4,
      "Altitude_m": 4573,
      "Temp_c": -14.7,
      "Dewpoint_c": -23.4,
      "Wind_Direction": 244,
      "Wind_Speed_kt": 1.9
    },
    {
      "Pressure_mb": 573.1,
      "Altitude_m": 4577,
      "Temp_c": -14.7,
      "Dewpoint_c": -23.5,
      "Wind_Direction": 244,
      "Wind_Speed_kt": 2
    },
    {
      "Pressure_mb": 572.8,
      "Altitude_m": 4581,
      "Temp_c": -14.7,
      "Dewpoint_c": -23.6,
      "Wind_Direction": 244,
      "Wind_Speed_kt": 2
    },
    {
      "Pressure_mb": 572.5,
      "Altitude_m": 4585,
      "Temp_c": -14.8,
      "Dewpoint_c": -23.7,
      "Wind_Direction": 244,
      "Wind_Speed_kt": 2
    },
    {
      "Pressure_mb": 572.2,
      "Altitude_m": 4589,
      "Temp_c": -14.8,
      "Dewpoint_c": -23.7,
      "Wind_Direction": 244,
      "Wind_Speed_kt": 2
    },
    {
      "Pressure_mb": 571.9,
      "Altitude_m": 4593,
      "Temp_c": -14.8,
      "Dewpoint_c": -23.8,
      "Wind_Direction": 244,
      "Wind_Speed_kt": 2
    },
    {
      "Pressure_mb": 571.5,
      "Altitude_m": 4597,
      "Temp_c": -14.9,
      "Dewpoint_c": -23.9,
      "Wind_Direction": 244,
      "Wind_Speed_kt": 2
    },
    {
      "Pressure_mb": 571.2,
      "Altitude_m": 4602,
      "Temp_c": -14.9,
      "Dewpoint_c": -24,
      "Wind_Direction": 244,
      "Wind_Speed_kt": 2
    },
    {
      "Pressure_mb": 570.8,
      "Altitude_m": 4607,
      "Temp_c": -14.9,
      "Dewpoint_c": -24.1,
      "Wind_Direction": 244,
      "Wind_Speed_kt": 2
    },
    {
      "Pressure_mb": 570.4,
      "Altitude_m": 4612,
      "Temp_c": -15,
      "Dewpoint_c": -24.2,
      "Wind_Direction": 244,
      "Wind_Speed_kt": 2
    },
    {
      "Pressure_mb": 570.1,
      "Altitude_m": 4617,
      "Temp_c": -15,
      "Dewpoint_c": -24.2,
      "Wind_Direction": 244,
      "Wind_Speed_kt": 2.1
    },
    {
      "Pressure_mb": 569.7,
      "Altitude_m": 4623,
      "Temp_c": -15,
      "Dewpoint_c": -24.3,
      "Wind_Direction": 244,
      "Wind_Speed_kt": 2.1
    },
    {
      "Pressure_mb": 569.3,
      "Altitude_m": 4628,
      "Temp_c": -15,
      "Dewpoint_c": -24.4,
      "Wind_Direction": 244,
      "Wind_Speed_kt": 2.1
    },
    {
      "Pressure_mb": 569,
      "Altitude_m": 4633,
      "Temp_c": -15,
      "Dewpoint_c": -24.6,
      "Wind_Direction": 244,
      "Wind_Speed_kt": 2.1
    },
    {
      "Pressure_mb": 568.6,
      "Altitude_m": 4637,
      "Temp_c": -15,
      "Dewpoint_c": -24.8,
      "Wind_Direction": 244,
      "Wind_Speed_kt": 2.1
    },
    {
      "Pressure_mb": 568.3,
      "Altitude_m": 4642,
      "Temp_c": -15,
      "Dewpoint_c": -25,
      "Wind_Direction": 244,
      "Wind_Speed_kt": 2.1
    },
    {
      "Pressure_mb": 567.9,
      "Altitude_m": 4646,
      "Temp_c": -15.1,
      "Dewpoint_c": -25.2,
      "Wind_Direction": 244,
      "Wind_Speed_kt": 2.1
    },
    {
      "Pressure_mb": 567.6,
      "Altitude_m": 4651,
      "Temp_c": -15.1,
      "Dewpoint_c": -25.4,
      "Wind_Direction": 244,
      "Wind_Speed_kt": 2.1
    },
    {
      "Pressure_mb": 567.3,
      "Altitude_m": 4655,
      "Temp_c": -15.1,
      "Dewpoint_c": -25.6,
      "Wind_Direction": 244,
      "Wind_Speed_kt": 2.1
    },
    {
      "Pressure_mb": 567,
      "Altitude_m": 4658,
      "Temp_c": -15.1,
      "Dewpoint_c": -25.8,
      "Wind_Direction": 244,
      "Wind_Speed_kt": 2.2
    },
    {
      "Pressure_mb": 566.7,
      "Altitude_m": 4662,
      "Temp_c": -15.1,
      "Dewpoint_c": -26,
      "Wind_Direction": 244,
      "Wind_Speed_kt": 2.2
    },
    {
      "Pressure_mb": 566.5,
      "Altitude_m": 4665,
      "Temp_c": -15.1,
      "Dewpoint_c": -26.2,
      "Wind_Direction": 244,
      "Wind_Speed_kt": 2.3
    },
    {
      "Pressure_mb": 566.2,
      "Altitude_m": 4669,
      "Temp_c": -15.1,
      "Dewpoint_c": -26.4,
      "Wind_Direction": 244,
      "Wind_Speed_kt": 2.3
    },
    {
      "Pressure_mb": 565.9,
      "Altitude_m": 4673,
      "Temp_c": -15.1,
      "Dewpoint_c": -26.6,
      "Wind_Direction": 244,
      "Wind_Speed_kt": 2.4
    },
    {
      "Pressure_mb": 565.5,
      "Altitude_m": 4678,
      "Temp_c": -15.1,
      "Dewpoint_c": -26.8,
      "Wind_Direction": 244,
      "Wind_Speed_kt": 2.4
    },
    {
      "Pressure_mb": 565.1,
      "Altitude_m": 4684,
      "Temp_c": -15.1,
      "Dewpoint_c": -27.1,
      "Wind_Direction": 243,
      "Wind_Speed_kt": 2.5
    },
    {
      "Pressure_mb": 564.7,
      "Altitude_m": 4690,
      "Temp_c": -15.1,
      "Dewpoint_c": -27.3,
      "Wind_Direction": 243,
      "Wind_Speed_kt": 2.5
    },
    {
      "Pressure_mb": 564.2,
      "Altitude_m": 4695,
      "Temp_c": -15.1,
      "Dewpoint_c": -27.6,
      "Wind_Direction": 243,
      "Wind_Speed_kt": 2.6
    },
    {
      "Pressure_mb": 563.8,
      "Altitude_m": 4701,
      "Temp_c": -15.2,
      "Dewpoint_c": -27.9,
      "Wind_Direction": 243,
      "Wind_Speed_kt": 2.6
    },
    {
      "Pressure_mb": 563.4,
      "Altitude_m": 4707,
      "Temp_c": -15.2,
      "Dewpoint_c": -28.2,
      "Wind_Direction": 243,
      "Wind_Speed_kt": 2.7
    },
    {
      "Pressure_mb": 563,
      "Altitude_m": 4712,
      "Temp_c": -15.2,
      "Dewpoint_c": -28.5,
      "Wind_Direction": 243,
      "Wind_Speed_kt": 2.7
    },
    {
      "Pressure_mb": 562.6,
      "Altitude_m": 4717,
      "Temp_c": -15.2,
      "Dewpoint_c": -28.8,
      "Wind_Direction": 243,
      "Wind_Speed_kt": 2.8
    },
    {
      "Pressure_mb": 562.2,
      "Altitude_m": 4722,
      "Temp_c": -15.2,
      "Dewpoint_c": -29.1,
      "Wind_Direction": 243,
      "Wind_Speed_kt": 2.8
    },
    {
      "Pressure_mb": 561.8,
      "Altitude_m": 4728,
      "Temp_c": -15.2,
      "Dewpoint_c": -29.4,
      "Wind_Direction": 243,
      "Wind_Speed_kt": 2.9
    },
    {
      "Pressure_mb": 561.4,
      "Altitude_m": 4733,
      "Temp_c": -15.2,
      "Dewpoint_c": -29.7,
      "Wind_Direction": 243,
      "Wind_Speed_kt": 2.9
    },
    {
      "Pressure_mb": 561.1,
      "Altitude_m": 4738,
      "Temp_c": -15.2,
      "Dewpoint_c": -30,
      "Wind_Direction": 243,
      "Wind_Speed_kt": 3
    },
    {
      "Pressure_mb": 560.8,
      "Altitude_m": 4743,
      "Temp_c": -15.2,
      "Dewpoint_c": -30.4,
      "Wind_Direction": 243,
      "Wind_Speed_kt": 3
    },
    {
      "Pressure_mb": 560.4,
      "Altitude_m": 4747,
      "Temp_c": -15.2,
      "Dewpoint_c": -30.8,
      "Wind_Direction": 243,
      "Wind_Speed_kt": 3.1
    },
    {
      "Pressure_mb": 560.1,
      "Altitude_m": 4751,
      "Temp_c": -15.3,
      "Dewpoint_c": -31.1,
      "Wind_Direction": 243,
      "Wind_Speed_kt": 3.1
    },
    {
      "Pressure_mb": 559.8,
      "Altitude_m": 4755,
      "Temp_c": -15.3,
      "Dewpoint_c": -31.5,
      "Wind_Direction": 243,
      "Wind_Speed_kt": 3.2
    },
    {
      "Pressure_mb": 559.5,
      "Altitude_m": 4759,
      "Temp_c": -15.3,
      "Dewpoint_c": -31.7,
      "Wind_Direction": 243,
      "Wind_Speed_kt": 3.2
    },
    {
      "Pressure_mb": 559.2,
      "Altitude_m": 4763,
      "Temp_c": -15.3,
      "Dewpoint_c": -31.9,
      "Wind_Direction": 243,
      "Wind_Speed_kt": 3.3
    },
    {
      "Pressure_mb": 558.9,
      "Altitude_m": 4767,
      "Temp_c": -15.4,
      "Dewpoint_c": -32,
      "Wind_Direction": 243,
      "Wind_Speed_kt": 3.3
    },
    {
      "Pressure_mb": 558.6,
      "Altitude_m": 4772,
      "Temp_c": -15.4,
      "Dewpoint_c": -32.2,
      "Wind_Direction": 244,
      "Wind_Speed_kt": 3.3
    },
    {
      "Pressure_mb": 558.2,
      "Altitude_m": 4776,
      "Temp_c": -15.4,
      "Dewpoint_c": -32.3,
      "Wind_Direction": 244,
      "Wind_Speed_kt": 3.4
    },
    {
      "Pressure_mb": 557.9,
      "Altitude_m": 4781,
      "Temp_c": -15.4,
      "Dewpoint_c": -32.5,
      "Wind_Direction": 244,
      "Wind_Speed_kt": 3.4
    },
    {
      "Pressure_mb": 557.5,
      "Altitude_m": 4785,
      "Temp_c": -15.5,
      "Dewpoint_c": -32.6,
      "Wind_Direction": 244,
      "Wind_Speed_kt": 3.5
    },
    {
      "Pressure_mb": 557.2,
      "Altitude_m": 4790,
      "Temp_c": -15.5,
      "Dewpoint_c": -32.8,
      "Wind_Direction": 244,
      "Wind_Speed_kt": 3.5
    },
    {
      "Pressure_mb": 556.9,
      "Altitude_m": 4794,
      "Temp_c": -15.5,
      "Dewpoint_c": -32.9,
      "Wind_Direction": 245,
      "Wind_Speed_kt": 3.6
    },
    {
      "Pressure_mb": 556.5,
      "Altitude_m": 4799,
      "Temp_c": -15.5,
      "Dewpoint_c": -33.1,
      "Wind_Direction": 245,
      "Wind_Speed_kt": 3.6
    },
    {
      "Pressure_mb": 556.2,
      "Altitude_m": 4803,
      "Temp_c": -15.6,
      "Dewpoint_c": -33.2,
      "Wind_Direction": 245,
      "Wind_Speed_kt": 3.6
    },
    {
      "Pressure_mb": 555.9,
      "Altitude_m": 4808,
      "Temp_c": -15.6,
      "Dewpoint_c": -33.4,
      "Wind_Direction": 245,
      "Wind_Speed_kt": 3.7
    },
    {
      "Pressure_mb": 555.5,
      "Altitude_m": 4813,
      "Temp_c": -15.6,
      "Dewpoint_c": -33.6,
      "Wind_Direction": 245,
      "Wind_Speed_kt": 3.7
    },
    {
      "Pressure_mb": 555.2,
      "Altitude_m": 4817,
      "Temp_c": -15.7,
      "Dewpoint_c": -33.7,
      "Wind_Direction": 245,
      "Wind_Speed_kt": 3.8
    },
    {
      "Pressure_mb": 554.9,
      "Altitude_m": 4822,
      "Temp_c": -15.7,
      "Dewpoint_c": -33.8,
      "Wind_Direction": 246,
      "Wind_Speed_kt": 3.8
    },
    {
      "Pressure_mb": 554.6,
      "Altitude_m": 4826,
      "Temp_c": -15.7,
      "Dewpoint_c": -33.9,
      "Wind_Direction": 246,
      "Wind_Speed_kt": 3.9
    },
    {
      "Pressure_mb": 554.3,
      "Altitude_m": 4830,
      "Temp_c": -15.8,
      "Dewpoint_c": -34,
      "Wind_Direction": 246,
      "Wind_Speed_kt": 3.9
    },
    {
      "Pressure_mb": 553.9,
      "Altitude_m": 4834,
      "Temp_c": -15.8,
      "Dewpoint_c": -34.1,
      "Wind_Direction": 246,
      "Wind_Speed_kt": 3.9
    },
    {
      "Pressure_mb": 553.6,
      "Altitude_m": 4839,
      "Temp_c": -15.8,
      "Dewpoint_c": -34.2,
      "Wind_Direction": 246,
      "Wind_Speed_kt": 4
    },
    {
      "Pressure_mb": 553.3,
      "Altitude_m": 4843,
      "Temp_c": -15.8,
      "Dewpoint_c": -34.3,
      "Wind_Direction": 246,
      "Wind_Speed_kt": 4
    },
    {
      "Pressure_mb": 553,
      "Altitude_m": 4847,
      "Temp_c": -15.9,
      "Dewpoint_c": -34.4,
      "Wind_Direction": 246,
      "Wind_Speed_kt": 4.1
    },
    {
      "Pressure_mb": 552.7,
      "Altitude_m": 4851,
      "Temp_c": -15.9,
      "Dewpoint_c": -34.5,
      "Wind_Direction": 246,
      "Wind_Speed_kt": 4.2
    },
    {
      "Pressure_mb": 552.4,
      "Altitude_m": 4855,
      "Temp_c": -15.9,
      "Dewpoint_c": -34.5,
      "Wind_Direction": 246,
      "Wind_Speed_kt": 4.2
    },
    {
      "Pressure_mb": 552.1,
      "Altitude_m": 4859,
      "Temp_c": -15.9,
      "Dewpoint_c": -34.6,
      "Wind_Direction": 246,
      "Wind_Speed_kt": 4.3
    },
    {
      "Pressure_mb": 551.8,
      "Altitude_m": 4863,
      "Temp_c": -16,
      "Dewpoint_c": -34.7,
      "Wind_Direction": 246,
      "Wind_Speed_kt": 4.4
    },
    {
      "Pressure_mb": 551.6,
      "Altitude_m": 4867,
      "Temp_c": -16,
      "Dewpoint_c": -34.8,
      "Wind_Direction": 246,
      "Wind_Speed_kt": 4.4
    },
    {
      "Pressure_mb": 551.2,
      "Altitude_m": 4871,
      "Temp_c": -16,
      "Dewpoint_c": -34.9,
      "Wind_Direction": 246,
      "Wind_Speed_kt": 4.5
    },
    {
      "Pressure_mb": 550.9,
      "Altitude_m": 4874,
      "Temp_c": -16,
      "Dewpoint_c": -34.9,
      "Wind_Direction": 246,
      "Wind_Speed_kt": 4.6
    },
    {
      "Pressure_mb": 550.6,
      "Altitude_m": 4879,
      "Temp_c": -16,
      "Dewpoint_c": -35,
      "Wind_Direction": 246,
      "Wind_Speed_kt": 4.6
    },
    {
      "Pressure_mb": 550.2,
      "Altitude_m": 4884,
      "Temp_c": -16,
      "Dewpoint_c": -35,
      "Wind_Direction": 246,
      "Wind_Speed_kt": 4.7
    },
    {
      "Pressure_mb": 549.9,
      "Altitude_m": 4889,
      "Temp_c": -16,
      "Dewpoint_c": -35,
      "Wind_Direction": 246,
      "Wind_Speed_kt": 4.8
    },
    {
      "Pressure_mb": 549.6,
      "Altitude_m": 4894,
      "Temp_c": -16,
      "Dewpoint_c": -35.1,
      "Wind_Direction": 246,
      "Wind_Speed_kt": 4.8
    },
    {
      "Pressure_mb": 549.2,
      "Altitude_m": 4899,
      "Temp_c": -16,
      "Dewpoint_c": -35.1,
      "Wind_Direction": 246,
      "Wind_Speed_kt": 4.9
    },
    {
      "Pressure_mb": 548.9,
      "Altitude_m": 4904,
      "Temp_c": -16,
      "Dewpoint_c": -35.1,
      "Wind_Direction": 246,
      "Wind_Speed_kt": 5
    },
    {
      "Pressure_mb": 548.5,
      "Altitude_m": 4909,
      "Temp_c": -16,
      "Dewpoint_c": -35.2,
      "Wind_Direction": 246,
      "Wind_Speed_kt": 5
    },
    {
      "Pressure_mb": 548.1,
      "Altitude_m": 4914,
      "Temp_c": -16.1,
      "Dewpoint_c": -35.2,
      "Wind_Direction": 246,
      "Wind_Speed_kt": 5.1
    },
    {
      "Pressure_mb": 547.6,
      "Altitude_m": 4921,
      "Temp_c": -16.1,
      "Dewpoint_c": -35.3,
      "Wind_Direction": 246,
      "Wind_Speed_kt": 5.2
    },
    {
      "Pressure_mb": 547.4,
      "Altitude_m": 4924,
      "Temp_c": -16.1,
      "Dewpoint_c": -35.3,
      "Wind_Direction": 246,
      "Wind_Speed_kt": 5.2
    },
    {
      "Pressure_mb": 547.1,
      "Altitude_m": 4929,
      "Temp_c": -16.1,
      "Dewpoint_c": -35.3,
      "Wind_Direction": 246,
      "Wind_Speed_kt": 5.3
    },
    {
      "Pressure_mb": 546.6,
      "Altitude_m": 4935,
      "Temp_c": -16.1,
      "Dewpoint_c": -35.3,
      "Wind_Direction": 246,
      "Wind_Speed_kt": 5.5
    },
    {
      "Pressure_mb": 546.4,
      "Altitude_m": 4938,
      "Temp_c": -16.1,
      "Dewpoint_c": -35.2,
      "Wind_Direction": 246,
      "Wind_Speed_kt": 5.5
    },
    {
      "Pressure_mb": 546,
      "Altitude_m": 4943,
      "Temp_c": -16.1,
      "Dewpoint_c": -34.9,
      "Wind_Direction": 246,
      "Wind_Speed_kt": 5.7
    },
    {
      "Pressure_mb": 545.7,
      "Altitude_m": 4947,
      "Temp_c": -16.1,
      "Dewpoint_c": -34.7,
      "Wind_Direction": 246,
      "Wind_Speed_kt": 5.8
    },
    {
      "Pressure_mb": 545.3,
      "Altitude_m": 4952,
      "Temp_c": -16.1,
      "Dewpoint_c": -34.5,
      "Wind_Direction": 246,
      "Wind_Speed_kt": 5.9
    },
    {
      "Pressure_mb": 545,
      "Altitude_m": 4957,
      "Temp_c": -16.1,
      "Dewpoint_c": -34.2,
      "Wind_Direction": 246,
      "Wind_Speed_kt": 6
    },
    {
      "Pressure_mb": 544.7,
      "Altitude_m": 4961,
      "Temp_c": -16.1,
      "Dewpoint_c": -34,
      "Wind_Direction": 246,
      "Wind_Speed_kt": 6.1
    },
    {
      "Pressure_mb": 544.4,
      "Altitude_m": 4965,
      "Temp_c": -16.1,
      "Dewpoint_c": -33.8,
      "Wind_Direction": 246,
      "Wind_Speed_kt": 6.2
    },
    {
      "Pressure_mb": 544.1,
      "Altitude_m": 4969,
      "Temp_c": -16.1,
      "Dewpoint_c": -33.6,
      "Wind_Direction": 246,
      "Wind_Speed_kt": 6.3
    },
    {
      "Pressure_mb": 543.8,
      "Altitude_m": 4973,
      "Temp_c": -16.1,
      "Dewpoint_c": -33.4,
      "Wind_Direction": 246,
      "Wind_Speed_kt": 6.4
    },
    {
      "Pressure_mb": 543.5,
      "Altitude_m": 4977,
      "Temp_c": -16.1,
      "Dewpoint_c": -33.1,
      "Wind_Direction": 246,
      "Wind_Speed_kt": 6.6
    },
    {
      "Pressure_mb": 543.2,
      "Altitude_m": 4981,
      "Temp_c": -16.1,
      "Dewpoint_c": -32.9,
      "Wind_Direction": 247,
      "Wind_Speed_kt": 6.7
    },
    {
      "Pressure_mb": 542.8,
      "Altitude_m": 4986,
      "Temp_c": -16.1,
      "Dewpoint_c": -32.8,
      "Wind_Direction": 247,
      "Wind_Speed_kt": 6.8
    },
    {
      "Pressure_mb": 542.5,
      "Altitude_m": 4991,
      "Temp_c": -16.1,
      "Dewpoint_c": -32.6,
      "Wind_Direction": 247,
      "Wind_Speed_kt": 6.9
    },
    {
      "Pressure_mb": 542.1,
      "Altitude_m": 4996,
      "Temp_c": -16.1,
      "Dewpoint_c": -32.4,
      "Wind_Direction": 247,
      "Wind_Speed_kt": 7
    },
    {
      "Pressure_mb": 541.8,
      "Altitude_m": 5001,
      "Temp_c": -16.1,
      "Dewpoint_c": -32.1,
      "Wind_Direction": 247,
      "Wind_Speed_kt": 7.1
    },
    {
      "Pressure_mb": 541.4,
      "Altitude_m": 5007,
      "Temp_c": -16.1,
      "Dewpoint_c": -31.8,
      "Wind_Direction": 247,
      "Wind_Speed_kt": 7.2
    },
    {
      "Pressure_mb": 541.1,
      "Altitude_m": 5012,
      "Temp_c": -16.2,
      "Dewpoint_c": -31.6,
      "Wind_Direction": 247,
      "Wind_Speed_kt": 7.4
    },
    {
      "Pressure_mb": 540.8,
      "Altitude_m": 5017,
      "Temp_c": -16.2,
      "Dewpoint_c": -31.3,
      "Wind_Direction": 247,
      "Wind_Speed_kt": 7.5
    },
    {
      "Pressure_mb": 540.5,
      "Altitude_m": 5021,
      "Temp_c": -16.2,
      "Dewpoint_c": -31.1,
      "Wind_Direction": 247,
      "Wind_Speed_kt": 7.6
    },
    {
      "Pressure_mb": 540.2,
      "Altitude_m": 5025,
      "Temp_c": -16.2,
      "Dewpoint_c": -30.9,
      "Wind_Direction": 247,
      "Wind_Speed_kt": 7.6
    },
    {
      "Pressure_mb": 539.9,
      "Altitude_m": 5029,
      "Temp_c": -16.2,
      "Dewpoint_c": -30.6,
      "Wind_Direction": 247,
      "Wind_Speed_kt": 7.7
    },
    {
      "Pressure_mb": 539.5,
      "Altitude_m": 5032,
      "Temp_c": -16.2,
      "Dewpoint_c": -30.4,
      "Wind_Direction": 247,
      "Wind_Speed_kt": 7.7
    },
    {
      "Pressure_mb": 539.2,
      "Altitude_m": 5036,
      "Temp_c": -16.2,
      "Dewpoint_c": -30.2,
      "Wind_Direction": 247,
      "Wind_Speed_kt": 7.7
    },
    {
      "Pressure_mb": 538.9,
      "Altitude_m": 5040,
      "Temp_c": -16.2,
      "Dewpoint_c": -30,
      "Wind_Direction": 247,
      "Wind_Speed_kt": 7.8
    },
    {
      "Pressure_mb": 538.6,
      "Altitude_m": 5044,
      "Temp_c": -16.3,
      "Dewpoint_c": -29.8,
      "Wind_Direction": 247,
      "Wind_Speed_kt": 7.8
    },
    {
      "Pressure_mb": 538.3,
      "Altitude_m": 5049,
      "Temp_c": -16.3,
      "Dewpoint_c": -29.6,
      "Wind_Direction": 247,
      "Wind_Speed_kt": 7.9
    },
    {
      "Pressure_mb": 538,
      "Altitude_m": 5054,
      "Temp_c": -16.3,
      "Dewpoint_c": -29.4,
      "Wind_Direction": 247,
      "Wind_Speed_kt": 7.9
    },
    {
      "Pressure_mb": 537.7,
      "Altitude_m": 5058,
      "Temp_c": -16.3,
      "Dewpoint_c": -29.4,
      "Wind_Direction": 247,
      "Wind_Speed_kt": 7.9
    },
    {
      "Pressure_mb": 537.4,
      "Altitude_m": 5062,
      "Temp_c": -16.3,
      "Dewpoint_c": -29.4,
      "Wind_Direction": 247,
      "Wind_Speed_kt": 8
    },
    {
      "Pressure_mb": 537.1,
      "Altitude_m": 5067,
      "Temp_c": -16.4,
      "Dewpoint_c": -29.5,
      "Wind_Direction": 247,
      "Wind_Speed_kt": 8
    },
    {
      "Pressure_mb": 536.8,
      "Altitude_m": 5071,
      "Temp_c": -16.4,
      "Dewpoint_c": -29.5,
      "Wind_Direction": 247,
      "Wind_Speed_kt": 8.1
    },
    {
      "Pressure_mb": 536.4,
      "Altitude_m": 5076,
      "Temp_c": -16.4,
      "Dewpoint_c": -29.6,
      "Wind_Direction": 247,
      "Wind_Speed_kt": 8.1
    },
    {
      "Pressure_mb": 536.1,
      "Altitude_m": 5081,
      "Temp_c": -16.4,
      "Dewpoint_c": -29.6,
      "Wind_Direction": 247,
      "Wind_Speed_kt": 8.1
    },
    {
      "Pressure_mb": 535.8,
      "Altitude_m": 5085,
      "Temp_c": -16.4,
      "Dewpoint_c": -29.7,
      "Wind_Direction": 247,
      "Wind_Speed_kt": 8.2
    },
    {
      "Pressure_mb": 535.4,
      "Altitude_m": 5090,
      "Temp_c": -16.5,
      "Dewpoint_c": -29.7,
      "Wind_Direction": 247,
      "Wind_Speed_kt": 8.2
    },
    {
      "Pressure_mb": 535.1,
      "Altitude_m": 5095,
      "Temp_c": -16.5,
      "Dewpoint_c": -29.8,
      "Wind_Direction": 247,
      "Wind_Speed_kt": 8.3
    },
    {
      "Pressure_mb": 534.8,
      "Altitude_m": 5099,
      "Temp_c": -16.5,
      "Dewpoint_c": -29.8,
      "Wind_Direction": 247,
      "Wind_Speed_kt": 8.3
    },
    {
      "Pressure_mb": 534.4,
      "Altitude_m": 5104,
      "Temp_c": -16.5,
      "Dewpoint_c": -29.9,
      "Wind_Direction": 247,
      "Wind_Speed_kt": 8.3
    },
    {
      "Pressure_mb": 534.1,
      "Altitude_m": 5109,
      "Temp_c": -16.6,
      "Dewpoint_c": -30,
      "Wind_Direction": 247,
      "Wind_Speed_kt": 8.4
    },
    {
      "Pressure_mb": 533.8,
      "Altitude_m": 5114,
      "Temp_c": -16.6,
      "Dewpoint_c": -30,
      "Wind_Direction": 247,
      "Wind_Speed_kt": 8.4
    },
    {
      "Pressure_mb": 533.4,
      "Altitude_m": 5118,
      "Temp_c": -16.6,
      "Dewpoint_c": -30.1,
      "Wind_Direction": 247,
      "Wind_Speed_kt": 8.5
    },
    {
      "Pressure_mb": 533,
      "Altitude_m": 5124,
      "Temp_c": -16.7,
      "Dewpoint_c": -30.3,
      "Wind_Direction": 247,
      "Wind_Speed_kt": 8.6
    },
    {
      "Pressure_mb": 532.6,
      "Altitude_m": 5129,
      "Temp_c": -16.7,
      "Dewpoint_c": -30.6,
      "Wind_Direction": 247,
      "Wind_Speed_kt": 8.7
    },
    {
      "Pressure_mb": 532.2,
      "Altitude_m": 5135,
      "Temp_c": -16.7,
      "Dewpoint_c": -30.8,
      "Wind_Direction": 247,
      "Wind_Speed_kt": 8.7
    },
    {
      "Pressure_mb": 531.8,
      "Altitude_m": 5141,
      "Temp_c": -16.8,
      "Dewpoint_c": -31,
      "Wind_Direction": 247,
      "Wind_Speed_kt": 8.8
    },
    {
      "Pressure_mb": 531.4,
      "Altitude_m": 5147,
      "Temp_c": -16.8,
      "Dewpoint_c": -31.3,
      "Wind_Direction": 247,
      "Wind_Speed_kt": 8.9
    },
    {
      "Pressure_mb": 531,
      "Altitude_m": 5153,
      "Temp_c": -16.8,
      "Dewpoint_c": -31.5,
      "Wind_Direction": 247,
      "Wind_Speed_kt": 8.9
    },
    {
      "Pressure_mb": 530.6,
      "Altitude_m": 5159,
      "Temp_c": -16.9,
      "Dewpoint_c": -31.8,
      "Wind_Direction": 247,
      "Wind_Speed_kt": 9
    },
    {
      "Pressure_mb": 530.2,
      "Altitude_m": 5164,
      "Temp_c": -16.9,
      "Dewpoint_c": -32,
      "Wind_Direction": 247,
      "Wind_Speed_kt": 9.1
    },
    {
      "Pressure_mb": 529.8,
      "Altitude_m": 5169,
      "Temp_c": -16.9,
      "Dewpoint_c": -32.3,
      "Wind_Direction": 247,
      "Wind_Speed_kt": 9.2
    },
    {
      "Pressure_mb": 529.4,
      "Altitude_m": 5175,
      "Temp_c": -17,
      "Dewpoint_c": -32.5,
      "Wind_Direction": 247,
      "Wind_Speed_kt": 9.2
    },
    {
      "Pressure_mb": 529,
      "Altitude_m": 5180,
      "Temp_c": -17,
      "Dewpoint_c": -32.8,
      "Wind_Direction": 247,
      "Wind_Speed_kt": 9.3
    },
    {
      "Pressure_mb": 528.7,
      "Altitude_m": 5186,
      "Temp_c": -17,
      "Dewpoint_c": -33.1,
      "Wind_Direction": 247,
      "Wind_Speed_kt": 9.4
    },
    {
      "Pressure_mb": 528.4,
      "Altitude_m": 5190,
      "Temp_c": -17,
      "Dewpoint_c": -33.3,
      "Wind_Direction": 247,
      "Wind_Speed_kt": 9.5
    },
    {
      "Pressure_mb": 528.1,
      "Altitude_m": 5195,
      "Temp_c": -17.1,
      "Dewpoint_c": -33.6,
      "Wind_Direction": 247,
      "Wind_Speed_kt": 9.5
    },
    {
      "Pressure_mb": 527.7,
      "Altitude_m": 5199,
      "Temp_c": -17.1,
      "Dewpoint_c": -33.9,
      "Wind_Direction": 247,
      "Wind_Speed_kt": 9.6
    },
    {
      "Pressure_mb": 527.4,
      "Altitude_m": 5203,
      "Temp_c": -17.1,
      "Dewpoint_c": -34.1,
      "Wind_Direction": 248,
      "Wind_Speed_kt": 9.7
    },
    {
      "Pressure_mb": 527.1,
      "Altitude_m": 5208,
      "Temp_c": -17.2,
      "Dewpoint_c": -34.4,
      "Wind_Direction": 248,
      "Wind_Speed_kt": 9.7
    },
    {
      "Pressure_mb": 526.8,
      "Altitude_m": 5212,
      "Temp_c": -17.2,
      "Dewpoint_c": -34.7,
      "Wind_Direction": 248,
      "Wind_Speed_kt": 9.8
    },
    {
      "Pressure_mb": 526.5,
      "Altitude_m": 5216,
      "Temp_c": -17.2,
      "Dewpoint_c": -35,
      "Wind_Direction": 248,
      "Wind_Speed_kt": 9.9
    },
    {
      "Pressure_mb": 526.2,
      "Altitude_m": 5221,
      "Temp_c": -17.3,
      "Dewpoint_c": -35.3,
      "Wind_Direction": 248,
      "Wind_Speed_kt": 0
    },
    {
      "Pressure_mb": 525.9,
      "Altitude_m": 5225,
      "Temp_c": -17.3,
      "Dewpoint_c": -35.6,
      "Wind_Direction": 247,
      "Wind_Speed_kt": 0.1
    },
    {
      "Pressure_mb": 525.6,
      "Altitude_m": 5229,
      "Temp_c": -17.3,
      "Dewpoint_c": -35.9,
      "Wind_Direction": 247,
      "Wind_Speed_kt": 0.1
    },
    {
      "Pressure_mb": 525.3,
      "Altitude_m": 5234,
      "Temp_c": -17.3,
      "Dewpoint_c": -36.2,
      "Wind_Direction": 247,
      "Wind_Speed_kt": 0.2
    },
    {
      "Pressure_mb": 524.9,
      "Altitude_m": 5238,
      "Temp_c": -17.4,
      "Dewpoint_c": -36.6,
      "Wind_Direction": 247,
      "Wind_Speed_kt": 0.3
    },
    {
      "Pressure_mb": 524.5,
      "Altitude_m": 5243,
      "Temp_c": -17.4,
      "Dewpoint_c": -36.9,
      "Wind_Direction": 247,
      "Wind_Speed_kt": 0.4
    },
    {
      "Pressure_mb": 524.2,
      "Altitude_m": 5248,
      "Temp_c": -17.4,
      "Dewpoint_c": -37.3,
      "Wind_Direction": 247,
      "Wind_Speed_kt": 0.4
    },
    {
      "Pressure_mb": 523.8,
      "Altitude_m": 5254,
      "Temp_c": -17.5,
      "Dewpoint_c": -37.4,
      "Wind_Direction": 247,
      "Wind_Speed_kt": 0.5
    },
    {
      "Pressure_mb": 523.4,
      "Altitude_m": 5259,
      "Temp_c": -17.5,
      "Dewpoint_c": -37.5,
      "Wind_Direction": 247,
      "Wind_Speed_kt": 0.6
    },
    {
      "Pressure_mb": 523.1,
      "Altitude_m": 5265,
      "Temp_c": -17.6,
      "Dewpoint_c": -37.6,
      "Wind_Direction": 247,
      "Wind_Speed_kt": 0.7
    },
    {
      "Pressure_mb": 522.7,
      "Altitude_m": 5270,
      "Temp_c": -17.6,
      "Dewpoint_c": -37.7,
      "Wind_Direction": 247,
      "Wind_Speed_kt": 0.8
    },
    {
      "Pressure_mb": 522.4,
      "Altitude_m": 5276,
      "Temp_c": -17.6,
      "Dewpoint_c": -37.8,
      "Wind_Direction": 247,
      "Wind_Speed_kt": 0.8
    },
    {
      "Pressure_mb": 522,
      "Altitude_m": 5281,
      "Temp_c": -17.7,
      "Dewpoint_c": -37.9,
      "Wind_Direction": 247,
      "Wind_Speed_kt": 0.9
    },
    {
      "Pressure_mb": 521.7,
      "Altitude_m": 5286,
      "Temp_c": -17.7,
      "Dewpoint_c": -38,
      "Wind_Direction": 247,
      "Wind_Speed_kt": 1
    },
    {
      "Pressure_mb": 521.3,
      "Altitude_m": 5291,
      "Temp_c": -17.7,
      "Dewpoint_c": -38.1,
      "Wind_Direction": 247,
      "Wind_Speed_kt": 1.1
    },
    {
      "Pressure_mb": 520.9,
      "Altitude_m": 5296,
      "Temp_c": -17.8,
      "Dewpoint_c": -38.2,
      "Wind_Direction": 247,
      "Wind_Speed_kt": 1.2
    },
    {
      "Pressure_mb": 520.6,
      "Altitude_m": 5301,
      "Temp_c": -17.8,
      "Dewpoint_c": -38.3,
      "Wind_Direction": 247,
      "Wind_Speed_kt": 1.2
    },
    {
      "Pressure_mb": 520.2,
      "Altitude_m": 5306,
      "Temp_c": -17.8,
      "Dewpoint_c": -38.4,
      "Wind_Direction": 247,
      "Wind_Speed_kt": 1.3
    },
    {
      "Pressure_mb": 519.8,
      "Altitude_m": 5312,
      "Temp_c": -17.9,
      "Dewpoint_c": -38.5,
      "Wind_Direction": 247,
      "Wind_Speed_kt": 1.4
    },
    {
      "Pressure_mb": 519.3,
      "Altitude_m": 5318,
      "Temp_c": -17.9,
      "Dewpoint_c": -38.6,
      "Wind_Direction": 247,
      "Wind_Speed_kt": 1.5
    },
    {
      "Pressure_mb": 519.1,
      "Altitude_m": 5323,
      "Temp_c": -17.9,
      "Dewpoint_c": -38.6,
      "Wind_Direction": 248,
      "Wind_Speed_kt": 1.6
    },
    {
      "Pressure_mb": 518.7,
      "Altitude_m": 5328,
      "Temp_c": -18,
      "Dewpoint_c": -38.6,
      "Wind_Direction": 248,
      "Wind_Speed_kt": 1.7
    },
    {
      "Pressure_mb": 518.3,
      "Altitude_m": 5333,
      "Temp_c": -18,
      "Dewpoint_c": -38.6,
      "Wind_Direction": 248,
      "Wind_Speed_kt": 1.8
    },
    {
      "Pressure_mb": 518,
      "Altitude_m": 5338,
      "Temp_c": -18.1,
      "Dewpoint_c": -38.6,
      "Wind_Direction": 248,
      "Wind_Speed_kt": 1.9
    },
    {
      "Pressure_mb": 517.6,
      "Altitude_m": 5343,
      "Temp_c": -18.1,
      "Dewpoint_c": -38.6,
      "Wind_Direction": 248,
      "Wind_Speed_kt": 2
    },
    {
      "Pressure_mb": 517.3,
      "Altitude_m": 5348,
      "Temp_c": -18.1,
      "Dewpoint_c": -38.6,
      "Wind_Direction": 249,
      "Wind_Speed_kt": 2.1
    },
    {
      "Pressure_mb": 516.9,
      "Altitude_m": 5353,
      "Temp_c": -18.2,
      "Dewpoint_c": -38.6,
      "Wind_Direction": 249,
      "Wind_Speed_kt": 2.2
    },
    {
      "Pressure_mb": 516.6,
      "Altitude_m": 5358,
      "Temp_c": -18.2,
      "Dewpoint_c": -38.5,
      "Wind_Direction": 249,
      "Wind_Speed_kt": 2.2
    },
    {
      "Pressure_mb": 516.2,
      "Altitude_m": 5363,
      "Temp_c": -18.2,
      "Dewpoint_c": -38.5,
      "Wind_Direction": 249,
      "Wind_Speed_kt": 2.3
    },
    {
      "Pressure_mb": 515.9,
      "Altitude_m": 5369,
      "Temp_c": -18.3,
      "Dewpoint_c": -38.5,
      "Wind_Direction": 250,
      "Wind_Speed_kt": 2.4
    },
    {
      "Pressure_mb": 515.5,
      "Altitude_m": 5374,
      "Temp_c": -18.3,
      "Dewpoint_c": -38.5,
      "Wind_Direction": 250,
      "Wind_Speed_kt": 2.5
    },
    {
      "Pressure_mb": 515.2,
      "Altitude_m": 5379,
      "Temp_c": -18.3,
      "Dewpoint_c": -38.5,
      "Wind_Direction": 250,
      "Wind_Speed_kt": 2.6
    },
    {
      "Pressure_mb": 514.8,
      "Altitude_m": 5384,
      "Temp_c": -18.4,
      "Dewpoint_c": -38.5,
      "Wind_Direction": 250,
      "Wind_Speed_kt": 2.7
    },
    {
      "Pressure_mb": 514.4,
      "Altitude_m": 5390,
      "Temp_c": -18.4,
      "Dewpoint_c": -38.5,
      "Wind_Direction": 250,
      "Wind_Speed_kt": 2.8
    },
    {
      "Pressure_mb": 514.1,
      "Altitude_m": 5394,
      "Temp_c": -18.5,
      "Dewpoint_c": -38.4,
      "Wind_Direction": 251,
      "Wind_Speed_kt": 2.9
    },
    {
      "Pressure_mb": 513.8,
      "Altitude_m": 5399,
      "Temp_c": -18.5,
      "Dewpoint_c": -38.3,
      "Wind_Direction": 251,
      "Wind_Speed_kt": 3
    },
    {
      "Pressure_mb": 513.4,
      "Altitude_m": 5404,
      "Temp_c": -18.5,
      "Dewpoint_c": -38.2,
      "Wind_Direction": 251,
      "Wind_Speed_kt": 3.1
    },
    {
      "Pressure_mb": 513.1,
      "Altitude_m": 5409,
      "Temp_c": -18.6,
      "Dewpoint_c": -38.1,
      "Wind_Direction": 251,
      "Wind_Speed_kt": 3.2
    },
    {
      "Pressure_mb": 512.8,
      "Altitude_m": 5414,
      "Temp_c": -18.6,
      "Dewpoint_c": -38,
      "Wind_Direction": 251,
      "Wind_Speed_kt": 3.3
    },
    {
      "Pressure_mb": 512.4,
      "Altitude_m": 5419,
      "Temp_c": -18.6,
      "Dewpoint_c": -37.9,
      "Wind_Direction": 252,
      "Wind_Speed_kt": 3.5
    },
    {
      "Pressure_mb": 512.1,
      "Altitude_m": 5424,
      "Temp_c": -18.7,
      "Dewpoint_c": -37.8,
      "Wind_Direction": 252,
      "Wind_Speed_kt": 3.6
    },
    {
      "Pressure_mb": 511.7,
      "Altitude_m": 5428,
      "Temp_c": -18.7,
      "Dewpoint_c": -37.7,
      "Wind_Direction": 252,
      "Wind_Speed_kt": 3.7
    },
    {
      "Pressure_mb": 511.4,
      "Altitude_m": 5433,
      "Temp_c": -18.7,
      "Dewpoint_c": -37.6,
      "Wind_Direction": 252,
      "Wind_Speed_kt": 3.8
    },
    {
      "Pressure_mb": 511.1,
      "Altitude_m": 5438,
      "Temp_c": -18.8,
      "Dewpoint_c": -37.5,
      "Wind_Direction": 252,
      "Wind_Speed_kt": 3.9
    },
    {
      "Pressure_mb": 510.7,
      "Altitude_m": 5443,
      "Temp_c": -18.8,
      "Dewpoint_c": -37.4,
      "Wind_Direction": 252,
      "Wind_Speed_kt": 4.1
    },
    {
      "Pressure_mb": 510.4,
      "Altitude_m": 5448,
      "Temp_c": -18.8,
      "Dewpoint_c": -37.3,
      "Wind_Direction": 252,
      "Wind_Speed_kt": 4.2
    },
    {
      "Pressure_mb": 510,
      "Altitude_m": 5453,
      "Temp_c": -18.9,
      "Dewpoint_c": -37.2,
      "Wind_Direction": 252,
      "Wind_Speed_kt": 4.3
    },
    {
      "Pressure_mb": 509.7,
      "Altitude_m": 5458,
      "Temp_c": -18.9,
      "Dewpoint_c": -37,
      "Wind_Direction": 252,
      "Wind_Speed_kt": 4.4
    },
    {
      "Pressure_mb": 509.4,
      "Altitude_m": 5464,
      "Temp_c": -18.9,
      "Dewpoint_c": -36.7,
      "Wind_Direction": 253,
      "Wind_Speed_kt": 4.6
    },
    {
      "Pressure_mb": 509,
      "Altitude_m": 5469,
      "Temp_c": -18.9,
      "Dewpoint_c": -36.5,
      "Wind_Direction": 253,
      "Wind_Speed_kt": 4.7
    },
    {
      "Pressure_mb": 508.7,
      "Altitude_m": 5474,
      "Temp_c": -19,
      "Dewpoint_c": -36.3,
      "Wind_Direction": 253,
      "Wind_Speed_kt": 4.8
    },
    {
      "Pressure_mb": 508.3,
      "Altitude_m": 5478,
      "Temp_c": -19,
      "Dewpoint_c": -36.1,
      "Wind_Direction": 253,
      "Wind_Speed_kt": 4.9
    },
    {
      "Pressure_mb": 508,
      "Altitude_m": 5483,
      "Temp_c": -19,
      "Dewpoint_c": -35.9,
      "Wind_Direction": 253,
      "Wind_Speed_kt": 5.1
    },
    {
      "Pressure_mb": 507.6,
      "Altitude_m": 5488,
      "Temp_c": -19.1,
      "Dewpoint_c": -35.7,
      "Wind_Direction": 253,
      "Wind_Speed_kt": 5.2
    },
    {
      "Pressure_mb": 507.3,
      "Altitude_m": 5493,
      "Temp_c": -19.1,
      "Dewpoint_c": -35.5,
      "Wind_Direction": 253,
      "Wind_Speed_kt": 5.3
    },
    {
      "Pressure_mb": 506.9,
      "Altitude_m": 5498,
      "Temp_c": -19.1,
      "Dewpoint_c": -35.3,
      "Wind_Direction": 253,
      "Wind_Speed_kt": 5.4
    },
    {
      "Pressure_mb": 506.6,
      "Altitude_m": 5504,
      "Temp_c": -19.2,
      "Dewpoint_c": -35.1,
      "Wind_Direction": 253,
      "Wind_Speed_kt": 5.6
    },
    {
      "Pressure_mb": 506.2,
      "Altitude_m": 5510,
      "Temp_c": -19.2,
      "Dewpoint_c": -34.9,
      "Wind_Direction": 253,
      "Wind_Speed_kt": 5.7
    },
    {
      "Pressure_mb": 505.9,
      "Altitude_m": 5515,
      "Temp_c": -19.2,
      "Dewpoint_c": -34.7,
      "Wind_Direction": 253,
      "Wind_Speed_kt": 5.8
    },
    {
      "Pressure_mb": 505.5,
      "Altitude_m": 5521,
      "Temp_c": -19.3,
      "Dewpoint_c": -34.5,
      "Wind_Direction": 253,
      "Wind_Speed_kt": 5.9
    },
    {
      "Pressure_mb": 505.2,
      "Altitude_m": 5527,
      "Temp_c": -19.3,
      "Dewpoint_c": -34.4,
      "Wind_Direction": 253,
      "Wind_Speed_kt": 5.9
    },
    {
      "Pressure_mb": 504.8,
      "Altitude_m": 5531,
      "Temp_c": -19.3,
      "Dewpoint_c": -34.2,
      "Wind_Direction": 253,
      "Wind_Speed_kt": 5.9
    },
    {
      "Pressure_mb": 504.5,
      "Altitude_m": 5536,
      "Temp_c": -19.4,
      "Dewpoint_c": -34.1,
      "Wind_Direction": 253,
      "Wind_Speed_kt": 6
    },
    {
      "Pressure_mb": 504.1,
      "Altitude_m": 5540,
      "Temp_c": -19.4,
      "Dewpoint_c": -34,
      "Wind_Direction": 254,
      "Wind_Speed_kt": 6
    },
    {
      "Pressure_mb": 503.8,
      "Altitude_m": 5545,
      "Temp_c": -19.4,
      "Dewpoint_c": -33.8,
      "Wind_Direction": 254,
      "Wind_Speed_kt": 6
    },
    {
      "Pressure_mb": 503.5,
      "Altitude_m": 5550,
      "Temp_c": -19.5,
      "Dewpoint_c": -33.7,
      "Wind_Direction": 254,
      "Wind_Speed_kt": 6.1
    },
    {
      "Pressure_mb": 503.2,
      "Altitude_m": 5554,
      "Temp_c": -19.5,
      "Dewpoint_c": -33.6,
      "Wind_Direction": 254,
      "Wind_Speed_kt": 6.1
    },
    {
      "Pressure_mb": 502.8,
      "Altitude_m": 5559,
      "Temp_c": -19.5,
      "Dewpoint_c": -33.5,
      "Wind_Direction": 254,
      "Wind_Speed_kt": 6.2
    },
    {
      "Pressure_mb": 502.5,
      "Altitude_m": 5564,
      "Temp_c": -19.5,
      "Dewpoint_c": -33.3,
      "Wind_Direction": 254,
      "Wind_Speed_kt": 6.2
    },
    {
      "Pressure_mb": 502.2,
      "Altitude_m": 5568,
      "Temp_c": -19.6,
      "Dewpoint_c": -33.2,
      "Wind_Direction": 254,
      "Wind_Speed_kt": 6.2
    },
    {
      "Pressure_mb": 501.8,
      "Altitude_m": 5573,
      "Temp_c": -19.6,
      "Dewpoint_c": -33.1,
      "Wind_Direction": 254,
      "Wind_Speed_kt": 6.3
    },
    {
      "Pressure_mb": 501.5,
      "Altitude_m": 5579,
      "Temp_c": -19.6,
      "Dewpoint_c": -33,
      "Wind_Direction": 254,
      "Wind_Speed_kt": 6.3
    },
    {
      "Pressure_mb": 501.1,
      "Altitude_m": 5584,
      "Temp_c": -19.7,
      "Dewpoint_c": -32.9,
      "Wind_Direction": 254,
      "Wind_Speed_kt": 6.4
    },
    {
      "Pressure_mb": 500.9,
      "Altitude_m": 5588,
      "Temp_c": -19.7,
      "Dewpoint_c": -32.8,
      "Wind_Direction": 254,
      "Wind_Speed_kt": 6.4
    },
    {
      "Pressure_mb": 500.4,
      "Altitude_m": 5595,
      "Temp_c": -19.7,
      "Dewpoint_c": -32.9,
      "Wind_Direction": 254,
      "Wind_Speed_kt": 6.4
    },
    {
      "Pressure_mb": 500,
      "Altitude_m": 5601,
      "Temp_c": -19.8,
      "Dewpoint_c": -33,
      "Wind_Direction": 254,
      "Wind_Speed_kt": 6.5
    },
    {
      "Pressure_mb": 499.7,
      "Altitude_m": 5606,
      "Temp_c": -19.8,
      "Dewpoint_c": -33.1,
      "Wind_Direction": 254,
      "Wind_Speed_kt": 6.5
    },
    {
      "Pressure_mb": 499.3,
      "Altitude_m": 5612,
      "Temp_c": -19.8,
      "Dewpoint_c": -33.2,
      "Wind_Direction": 254,
      "Wind_Speed_kt": 6.5
    },
    {
      "Pressure_mb": 499,
      "Altitude_m": 5617,
      "Temp_c": -19.9,
      "Dewpoint_c": -33.4,
      "Wind_Direction": 254,
      "Wind_Speed_kt": 6.6
    },
    {
      "Pressure_mb": 498.6,
      "Altitude_m": 5622,
      "Temp_c": -19.9,
      "Dewpoint_c": -33.5,
      "Wind_Direction": 254,
      "Wind_Speed_kt": 6.6
    },
    {
      "Pressure_mb": 498.3,
      "Altitude_m": 5627,
      "Temp_c": -19.9,
      "Dewpoint_c": -33.6,
      "Wind_Direction": 253,
      "Wind_Speed_kt": 6.6
    },
    {
      "Pressure_mb": 498,
      "Altitude_m": 5632,
      "Temp_c": -19.9,
      "Dewpoint_c": -33.7,
      "Wind_Direction": 253,
      "Wind_Speed_kt": 6.6
    },
    {
      "Pressure_mb": 497.6,
      "Altitude_m": 5637,
      "Temp_c": -20,
      "Dewpoint_c": -33.8,
      "Wind_Direction": 253,
      "Wind_Speed_kt": 6.7
    },
    {
      "Pressure_mb": 497.3,
      "Altitude_m": 5641,
      "Temp_c": -20,
      "Dewpoint_c": -33.9,
      "Wind_Direction": 253,
      "Wind_Speed_kt": 6.7
    },
    {
      "Pressure_mb": 497,
      "Altitude_m": 5646,
      "Temp_c": -20,
      "Dewpoint_c": -34,
      "Wind_Direction": 253,
      "Wind_Speed_kt": 6.7
    },
    {
      "Pressure_mb": 496.7,
      "Altitude_m": 5651,
      "Temp_c": -20.1,
      "Dewpoint_c": -34.2,
      "Wind_Direction": 253,
      "Wind_Speed_kt": 6.7
    },
    {
      "Pressure_mb": 496.5,
      "Altitude_m": 5654,
      "Temp_c": -20.1,
      "Dewpoint_c": -34.2,
      "Wind_Direction": 253,
      "Wind_Speed_kt": 6.7
    },
    {
      "Pressure_mb": 496,
      "Altitude_m": 5661,
      "Temp_c": -20.2,
      "Dewpoint_c": -34.2,
      "Wind_Direction": 253,
      "Wind_Speed_kt": 6.7
    },
    {
      "Pressure_mb": 495.7,
      "Altitude_m": 5665,
      "Temp_c": -20.2,
      "Dewpoint_c": -34.2,
      "Wind_Direction": 252,
      "Wind_Speed_kt": 6.8
    },
    {
      "Pressure_mb": 495.4,
      "Altitude_m": 5670,
      "Temp_c": -20.2,
      "Dewpoint_c": -34.2,
      "Wind_Direction": 252,
      "Wind_Speed_kt": 6.8
    },
    {
      "Pressure_mb": 495,
      "Altitude_m": 5675,
      "Temp_c": -20.3,
      "Dewpoint_c": -34.2,
      "Wind_Direction": 252,
      "Wind_Speed_kt": 6.8
    },
    {
      "Pressure_mb": 494.7,
      "Altitude_m": 5680,
      "Temp_c": -20.3,
      "Dewpoint_c": -34.2,
      "Wind_Direction": 252,
      "Wind_Speed_kt": 6.8
    },
    {
      "Pressure_mb": 494.4,
      "Altitude_m": 5685,
      "Temp_c": -20.3,
      "Dewpoint_c": -34.2,
      "Wind_Direction": 252,
      "Wind_Speed_kt": 6.8
    },
    {
      "Pressure_mb": 494.1,
      "Altitude_m": 5690,
      "Temp_c": -20.4,
      "Dewpoint_c": -34.2,
      "Wind_Direction": 252,
      "Wind_Speed_kt": 6.8
    },
    {
      "Pressure_mb": 493.7,
      "Altitude_m": 5695,
      "Temp_c": -20.4,
      "Dewpoint_c": -34.2,
      "Wind_Direction": 252,
      "Wind_Speed_kt": 6.9
    },
    {
      "Pressure_mb": 493.3,
      "Altitude_m": 5700,
      "Temp_c": -20.5,
      "Dewpoint_c": -34.2,
      "Wind_Direction": 252,
      "Wind_Speed_kt": 6.9
    },
    {
      "Pressure_mb": 493,
      "Altitude_m": 5706,
      "Temp_c": -20.5,
      "Dewpoint_c": -34.2,
      "Wind_Direction": 252,
      "Wind_Speed_kt": 6.9
    },
    {
      "Pressure_mb": 492.6,
      "Altitude_m": 5711,
      "Temp_c": -20.5,
      "Dewpoint_c": -34.2,
      "Wind_Direction": 251,
      "Wind_Speed_kt": 6.9
    },
    {
      "Pressure_mb": 492.3,
      "Altitude_m": 5717,
      "Temp_c": -20.6,
      "Dewpoint_c": -34.2,
      "Wind_Direction": 251,
      "Wind_Speed_kt": 6.9
    },
    {
      "Pressure_mb": 491.9,
      "Altitude_m": 5722,
      "Temp_c": -20.6,
      "Dewpoint_c": -34.2,
      "Wind_Direction": 251,
      "Wind_Speed_kt": 6.9
    },
    {
      "Pressure_mb": 491.5,
      "Altitude_m": 5728,
      "Temp_c": -20.7,
      "Dewpoint_c": -34.1,
      "Wind_Direction": 251,
      "Wind_Speed_kt": 6.9
    },
    {
      "Pressure_mb": 491,
      "Altitude_m": 5735,
      "Temp_c": -20.8,
      "Dewpoint_c": -34,
      "Wind_Direction": 251,
      "Wind_Speed_kt": 6.8
    },
    {
      "Pressure_mb": 490.6,
      "Altitude_m": 5741,
      "Temp_c": -20.8,
      "Dewpoint_c": -33.9,
      "Wind_Direction": 251,
      "Wind_Speed_kt": 6.8
    },
    {
      "Pressure_mb": 490.2,
      "Altitude_m": 5748,
      "Temp_c": -20.9,
      "Dewpoint_c": -33.8,
      "Wind_Direction": 251,
      "Wind_Speed_kt": 6.7
    },
    {
      "Pressure_mb": 489.8,
      "Altitude_m": 5754,
      "Temp_c": -20.9,
      "Dewpoint_c": -33.7,
      "Wind_Direction": 251,
      "Wind_Speed_kt": 6.7
    },
    {
      "Pressure_mb": 489.3,
      "Altitude_m": 5761,
      "Temp_c": -21,
      "Dewpoint_c": -33.6,
      "Wind_Direction": 251,
      "Wind_Speed_kt": 6.7
    },
    {
      "Pressure_mb": 488.9,
      "Altitude_m": 5767,
      "Temp_c": -21,
      "Dewpoint_c": -33.5,
      "Wind_Direction": 250,
      "Wind_Speed_kt": 6.6
    },
    {
      "Pressure_mb": 488.6,
      "Altitude_m": 5773,
      "Temp_c": -21.1,
      "Dewpoint_c": -33.4,
      "Wind_Direction": 250,
      "Wind_Speed_kt": 6.6
    },
    {
      "Pressure_mb": 488.2,
      "Altitude_m": 5778,
      "Temp_c": -21.1,
      "Dewpoint_c": -33.3,
      "Wind_Direction": 250,
      "Wind_Speed_kt": 6.5
    },
    {
      "Pressure_mb": 487.8,
      "Altitude_m": 5784,
      "Temp_c": -21.2,
      "Dewpoint_c": -33.2,
      "Wind_Direction": 250,
      "Wind_Speed_kt": 6.5
    },
    {
      "Pressure_mb": 487.5,
      "Altitude_m": 5789,
      "Temp_c": -21.3,
      "Dewpoint_c": -33.1,
      "Wind_Direction": 250,
      "Wind_Speed_kt": 6.5
    },
    {
      "Pressure_mb": 487.1,
      "Altitude_m": 5795,
      "Temp_c": -21.3,
      "Dewpoint_c": -33,
      "Wind_Direction": 250,
      "Wind_Speed_kt": 6.4
    },
    {
      "Pressure_mb": 486.7,
      "Altitude_m": 5801,
      "Temp_c": -21.4,
      "Dewpoint_c": -32.9,
      "Wind_Direction": 250,
      "Wind_Speed_kt": 6.4
    },
    {
      "Pressure_mb": 486.3,
      "Altitude_m": 5807,
      "Temp_c": -21.4,
      "Dewpoint_c": -32.8,
      "Wind_Direction": 250,
      "Wind_Speed_kt": 6.3
    },
    {
      "Pressure_mb": 485.9,
      "Altitude_m": 5813,
      "Temp_c": -21.5,
      "Dewpoint_c": -32.7,
      "Wind_Direction": 250,
      "Wind_Speed_kt": 6.3
    },
    {
      "Pressure_mb": 485.5,
      "Altitude_m": 5820,
      "Temp_c": -21.5,
      "Dewpoint_c": -32.7,
      "Wind_Direction": 250,
      "Wind_Speed_kt": 6.3
    },
    {
      "Pressure_mb": 485.1,
      "Altitude_m": 5826,
      "Temp_c": -21.5,
      "Dewpoint_c": -32.6,
      "Wind_Direction": 249,
      "Wind_Speed_kt": 6.2
    },
    {
      "Pressure_mb": 484.7,
      "Altitude_m": 5831,
      "Temp_c": -21.6,
      "Dewpoint_c": -32.5,
      "Wind_Direction": 249,
      "Wind_Speed_kt": 6.2
    },
    {
      "Pressure_mb": 484.4,
      "Altitude_m": 5835,
      "Temp_c": -21.6,
      "Dewpoint_c": -32.4,
      "Wind_Direction": 249,
      "Wind_Speed_kt": 6.1
    },
    {
      "Pressure_mb": 484.1,
      "Altitude_m": 5840,
      "Temp_c": -21.7,
      "Dewpoint_c": -32.3,
      "Wind_Direction": 249,
      "Wind_Speed_kt": 6.2
    },
    {
      "Pressure_mb": 483.8,
      "Altitude_m": 5845,
      "Temp_c": -21.7,
      "Dewpoint_c": -32.2,
      "Wind_Direction": 249,
      "Wind_Speed_kt": 6.3
    },
    {
      "Pressure_mb": 483.5,
      "Altitude_m": 5850,
      "Temp_c": -21.8,
      "Dewpoint_c": -32.1,
      "Wind_Direction": 249,
      "Wind_Speed_kt": 6.3
    },
    {
      "Pressure_mb": 483.1,
      "Altitude_m": 5855,
      "Temp_c": -21.8,
      "Dewpoint_c": -32.1,
      "Wind_Direction": 249,
      "Wind_Speed_kt": 6.4
    },
    {
      "Pressure_mb": 482.8,
      "Altitude_m": 5859,
      "Temp_c": -21.9,
      "Dewpoint_c": -32,
      "Wind_Direction": 249,
      "Wind_Speed_kt": 6.5
    },
    {
      "Pressure_mb": 482.5,
      "Altitude_m": 5864,
      "Temp_c": -21.9,
      "Dewpoint_c": -31.9,
      "Wind_Direction": 249,
      "Wind_Speed_kt": 6.5
    },
    {
      "Pressure_mb": 482.2,
      "Altitude_m": 5869,
      "Temp_c": -22,
      "Dewpoint_c": -31.8,
      "Wind_Direction": 249,
      "Wind_Speed_kt": 6.6
    },
    {
      "Pressure_mb": 481.9,
      "Altitude_m": 5874,
      "Temp_c": -22,
      "Dewpoint_c": -31.7,
      "Wind_Direction": 249,
      "Wind_Speed_kt": 6.7
    },
    {
      "Pressure_mb": 481.6,
      "Altitude_m": 5878,
      "Temp_c": -22,
      "Dewpoint_c": -31.6,
      "Wind_Direction": 249,
      "Wind_Speed_kt": 6.7
    },
    {
      "Pressure_mb": 481.3,
      "Altitude_m": 5883,
      "Temp_c": -22.1,
      "Dewpoint_c": -31.4,
      "Wind_Direction": 248,
      "Wind_Speed_kt": 6.8
    },
    {
      "Pressure_mb": 481,
      "Altitude_m": 5888,
      "Temp_c": -22.1,
      "Dewpoint_c": -31.3,
      "Wind_Direction": 248,
      "Wind_Speed_kt": 6.9
    },
    {
      "Pressure_mb": 480.6,
      "Altitude_m": 5893,
      "Temp_c": -22.1,
      "Dewpoint_c": -31.2,
      "Wind_Direction": 248,
      "Wind_Speed_kt": 6.9
    },
    {
      "Pressure_mb": 480.3,
      "Altitude_m": 5898,
      "Temp_c": -22.2,
      "Dewpoint_c": -31,
      "Wind_Direction": 248,
      "Wind_Speed_kt": 7
    },
    {
      "Pressure_mb": 480,
      "Altitude_m": 5902,
      "Temp_c": -22.2,
      "Dewpoint_c": -30.9,
      "Wind_Direction": 248,
      "Wind_Speed_kt": 7.1
    },
    {
      "Pressure_mb": 479.7,
      "Altitude_m": 5907,
      "Temp_c": -22.3,
      "Dewpoint_c": -30.7,
      "Wind_Direction": 248,
      "Wind_Speed_kt": 7.1
    },
    {
      "Pressure_mb": 479.4,
      "Altitude_m": 5912,
      "Temp_c": -22.3,
      "Dewpoint_c": -30.6,
      "Wind_Direction": 248,
      "Wind_Speed_kt": 7.2
    },
    {
      "Pressure_mb": 479.1,
      "Altitude_m": 5917,
      "Temp_c": -22.3,
      "Dewpoint_c": -30.5,
      "Wind_Direction": 248,
      "Wind_Speed_kt": 7.3
    },
    {
      "Pressure_mb": 478.8,
      "Altitude_m": 5922,
      "Temp_c": -22.4,
      "Dewpoint_c": -30.4,
      "Wind_Direction": 248,
      "Wind_Speed_kt": 7.3
    },
    {
      "Pressure_mb": 478.5,
      "Altitude_m": 5926,
      "Temp_c": -22.4,
      "Dewpoint_c": -30.2,
      "Wind_Direction": 248,
      "Wind_Speed_kt": 7.4
    },
    {
      "Pressure_mb": 478.2,
      "Altitude_m": 5931,
      "Temp_c": -22.5,
      "Dewpoint_c": -30.1,
      "Wind_Direction": 248,
      "Wind_Speed_kt": 7.5
    },
    {
      "Pressure_mb": 477.9,
      "Altitude_m": 5936,
      "Temp_c": -22.5,
      "Dewpoint_c": -30,
      "Wind_Direction": 248,
      "Wind_Speed_kt": 7.5
    },
    {
      "Pressure_mb": 477.6,
      "Altitude_m": 5940,
      "Temp_c": -22.5,
      "Dewpoint_c": -29.9,
      "Wind_Direction": 248,
      "Wind_Speed_kt": 7.6
    },
    {
      "Pressure_mb": 477.2,
      "Altitude_m": 5945,
      "Temp_c": -22.6,
      "Dewpoint_c": -29.8,
      "Wind_Direction": 248,
      "Wind_Speed_kt": 7.6
    },
    {
      "Pressure_mb": 477,
      "Altitude_m": 5949,
      "Temp_c": -22.6,
      "Dewpoint_c": -29.6,
      "Wind_Direction": 248,
      "Wind_Speed_kt": 7.7
    },
    {
      "Pressure_mb": 476.7,
      "Altitude_m": 5954,
      "Temp_c": -22.6,
      "Dewpoint_c": -29.5,
      "Wind_Direction": 248,
      "Wind_Speed_kt": 7.8
    },
    {
      "Pressure_mb": 476.4,
      "Altitude_m": 5958,
      "Temp_c": -22.7,
      "Dewpoint_c": -29.4,
      "Wind_Direction": 248,
      "Wind_Speed_kt": 7.8
    },
    {
      "Pressure_mb": 476.1,
      "Altitude_m": 5962,
      "Temp_c": -22.7,
      "Dewpoint_c": -29.3,
      "Wind_Direction": 248,
      "Wind_Speed_kt": 7.9
    },
    {
      "Pressure_mb": 475.8,
      "Altitude_m": 5967,
      "Temp_c": -22.8,
      "Dewpoint_c": -29.2,
      "Wind_Direction": 248,
      "Wind_Speed_kt": 7.9
    },
    {
      "Pressure_mb": 475.5,
      "Altitude_m": 5972,
      "Temp_c": -22.8,
      "Dewpoint_c": -29.1,
      "Wind_Direction": 248,
      "Wind_Speed_kt": 8
    },
    {
      "Pressure_mb": 475.2,
      "Altitude_m": 5976,
      "Temp_c": -22.8,
      "Dewpoint_c": -29,
      "Wind_Direction": 248,
      "Wind_Speed_kt": 8.1
    },
    {
      "Pressure_mb": 474.9,
      "Altitude_m": 5981,
      "Temp_c": -22.9,
      "Dewpoint_c": -28.9,
      "Wind_Direction": 249,
      "Wind_Speed_kt": 8.1
    },
    {
      "Pressure_mb": 474.6,
      "Altitude_m": 5986,
      "Temp_c": -22.9,
      "Dewpoint_c": -28.8,
      "Wind_Direction": 249,
      "Wind_Speed_kt": 8.2
    },
    {
      "Pressure_mb": 474.3,
      "Altitude_m": 5990,
      "Temp_c": -22.9,
      "Dewpoint_c": -28.7,
      "Wind_Direction": 249,
      "Wind_Speed_kt": 8.2
    },
    {
      "Pressure_mb": 474,
      "Altitude_m": 5995,
      "Temp_c": -23,
      "Dewpoint_c": -28.6,
      "Wind_Direction": 249,
      "Wind_Speed_kt": 8.3
    },
    {
      "Pressure_mb": 473.7,
      "Altitude_m": 5999,
      "Temp_c": -23,
      "Dewpoint_c": -28.5,
      "Wind_Direction": 249,
      "Wind_Speed_kt": 8.4
    },
    {
      "Pressure_mb": 473.4,
      "Altitude_m": 6004,
      "Temp_c": -23.1,
      "Dewpoint_c": -28.5,
      "Wind_Direction": 249,
      "Wind_Speed_kt": 8.4
    },
    {
      "Pressure_mb": 473.1,
      "Altitude_m": 6009,
      "Temp_c": -23.1,
      "Dewpoint_c": -28.5,
      "Wind_Direction": 249,
      "Wind_Speed_kt": 8.5
    },
    {
      "Pressure_mb": 472.8,
      "Altitude_m": 6013,
      "Temp_c": -23.1,
      "Dewpoint_c": -28.5,
      "Wind_Direction": 249,
      "Wind_Speed_kt": 8.6
    },
    {
      "Pressure_mb": 472.5,
      "Altitude_m": 6018,
      "Temp_c": -23.2,
      "Dewpoint_c": -28.5,
      "Wind_Direction": 249,
      "Wind_Speed_kt": 8.6
    },
    {
      "Pressure_mb": 472.3,
      "Altitude_m": 6022,
      "Temp_c": -23.2,
      "Dewpoint_c": -28.4,
      "Wind_Direction": 249,
      "Wind_Speed_kt": 8.7
    },
    {
      "Pressure_mb": 472,
      "Altitude_m": 6026,
      "Temp_c": -23.3,
      "Dewpoint_c": -28.4,
      "Wind_Direction": 249,
      "Wind_Speed_kt": 8.7
    },
    {
      "Pressure_mb": 471.7,
      "Altitude_m": 6031,
      "Temp_c": -23.3,
      "Dewpoint_c": -28.4,
      "Wind_Direction": 249,
      "Wind_Speed_kt": 8.7
    },
    {
      "Pressure_mb": 471.4,
      "Altitude_m": 6035,
      "Temp_c": -23.3,
      "Dewpoint_c": -28.4,
      "Wind_Direction": 249,
      "Wind_Speed_kt": 8.7
    },
    {
      "Pressure_mb": 471.1,
      "Altitude_m": 6040,
      "Temp_c": -23.4,
      "Dewpoint_c": -28.4,
      "Wind_Direction": 249,
      "Wind_Speed_kt": 8.7
    },
    {
      "Pressure_mb": 470.8,
      "Altitude_m": 6045,
      "Temp_c": -23.4,
      "Dewpoint_c": -28.3,
      "Wind_Direction": 249,
      "Wind_Speed_kt": 8.8
    },
    {
      "Pressure_mb": 470.5,
      "Altitude_m": 6050,
      "Temp_c": -23.4,
      "Dewpoint_c": -28.3,
      "Wind_Direction": 249,
      "Wind_Speed_kt": 8.8
    },
    {
      "Pressure_mb": 470.1,
      "Altitude_m": 6055,
      "Temp_c": -23.5,
      "Dewpoint_c": -28.3,
      "Wind_Direction": 249,
      "Wind_Speed_kt": 8.8
    },
    {
      "Pressure_mb": 469.9,
      "Altitude_m": 6059,
      "Temp_c": -23.5,
      "Dewpoint_c": -28.3,
      "Wind_Direction": 249,
      "Wind_Speed_kt": 8.8
    },
    {
      "Pressure_mb": 469.6,
      "Altitude_m": 6064,
      "Temp_c": -23.5,
      "Dewpoint_c": -28.4,
      "Wind_Direction": 249,
      "Wind_Speed_kt": 8.8
    },
    {
      "Pressure_mb": 469.3,
      "Altitude_m": 6069,
      "Temp_c": -23.6,
      "Dewpoint_c": -28.4,
      "Wind_Direction": 249,
      "Wind_Speed_kt": 8.8
    },
    {
      "Pressure_mb": 469,
      "Altitude_m": 6073,
      "Temp_c": -23.6,
      "Dewpoint_c": -28.5,
      "Wind_Direction": 249,
      "Wind_Speed_kt": 8.8
    },
    {
      "Pressure_mb": 468.7,
      "Altitude_m": 6078,
      "Temp_c": -23.7,
      "Dewpoint_c": -28.6,
      "Wind_Direction": 249,
      "Wind_Speed_kt": 8.9
    },
    {
      "Pressure_mb": 468.4,
      "Altitude_m": 6082,
      "Temp_c": -23.7,
      "Dewpoint_c": -28.6,
      "Wind_Direction": 249,
      "Wind_Speed_kt": 8.9
    },
    {
      "Pressure_mb": 468.1,
      "Altitude_m": 6087,
      "Temp_c": -23.7,
      "Dewpoint_c": -28.7,
      "Wind_Direction": 249,
      "Wind_Speed_kt": 8.9
    },
    {
      "Pressure_mb": 467.8,
      "Altitude_m": 6091,
      "Temp_c": -23.8,
      "Dewpoint_c": -28.7,
      "Wind_Direction": 249,
      "Wind_Speed_kt": 8.9
    },
    {
      "Pressure_mb": 467.5,
      "Altitude_m": 6096,
      "Temp_c": -23.8,
      "Dewpoint_c": -28.8,
      "Wind_Direction": 249,
      "Wind_Speed_kt": 8.9
    },
    {
      "Pressure_mb": 467.2,
      "Altitude_m": 6100,
      "Temp_c": -23.8,
      "Dewpoint_c": -28.9,
      "Wind_Direction": 249,
      "Wind_Speed_kt": 8.9
    },
    {
      "Pressure_mb": 466.9,
      "Altitude_m": 6105,
      "Temp_c": -23.9,
      "Dewpoint_c": -28.9,
      "Wind_Direction": 249,
      "Wind_Speed_kt": 9
    },
    {
      "Pressure_mb": 466.6,
      "Altitude_m": 6110,
      "Temp_c": -23.9,
      "Dewpoint_c": -29,
      "Wind_Direction": 249,
      "Wind_Speed_kt": 9
    },
    {
      "Pressure_mb": 466.3,
      "Altitude_m": 6114,
      "Temp_c": -23.9,
      "Dewpoint_c": -29,
      "Wind_Direction": 249,
      "Wind_Speed_kt": 9
    },
    {
      "Pressure_mb": 466,
      "Altitude_m": 6119,
      "Temp_c": -24,
      "Dewpoint_c": -29.1,
      "Wind_Direction": 249,
      "Wind_Speed_kt": 9
    },
    {
      "Pressure_mb": 465.7,
      "Altitude_m": 6124,
      "Temp_c": -24,
      "Dewpoint_c": -29.1,
      "Wind_Direction": 249,
      "Wind_Speed_kt": 9.1
    },
    {
      "Pressure_mb": 465.4,
      "Altitude_m": 6128,
      "Temp_c": -24,
      "Dewpoint_c": -29.2,
      "Wind_Direction": 249,
      "Wind_Speed_kt": 9.1
    },
    {
      "Pressure_mb": 465.1,
      "Altitude_m": 6133,
      "Temp_c": -24.1,
      "Dewpoint_c": -29.2,
      "Wind_Direction": 249,
      "Wind_Speed_kt": 9.1
    },
    {
      "Pressure_mb": 464.8,
      "Altitude_m": 6138,
      "Temp_c": -24.1,
      "Dewpoint_c": -29.3,
      "Wind_Direction": 249,
      "Wind_Speed_kt": 9.2
    },
    {
      "Pressure_mb": 464.5,
      "Altitude_m": 6142,
      "Temp_c": -24.1,
      "Dewpoint_c": -29.3,
      "Wind_Direction": 249,
      "Wind_Speed_kt": 9.2
    },
    {
      "Pressure_mb": 464.3,
      "Altitude_m": 6147,
      "Temp_c": -24.2,
      "Dewpoint_c": -29.3,
      "Wind_Direction": 249,
      "Wind_Speed_kt": 9.2
    },
    {
      "Pressure_mb": 464,
      "Altitude_m": 6151,
      "Temp_c": -24.2,
      "Dewpoint_c": -29.4,
      "Wind_Direction": 249,
      "Wind_Speed_kt": 9.3
    },
    {
      "Pressure_mb": 463.7,
      "Altitude_m": 6156,
      "Temp_c": -24.2,
      "Dewpoint_c": -29.4,
      "Wind_Direction": 249,
      "Wind_Speed_kt": 9.3
    },
    {
      "Pressure_mb": 463.4,
      "Altitude_m": 6160,
      "Temp_c": -24.3,
      "Dewpoint_c": -29.5,
      "Wind_Direction": 248,
      "Wind_Speed_kt": 9.3
    },
    {
      "Pressure_mb": 463.1,
      "Altitude_m": 6165,
      "Temp_c": -24.3,
      "Dewpoint_c": -29.5,
      "Wind_Direction": 248,
      "Wind_Speed_kt": 9.4
    },
    {
      "Pressure_mb": 462.8,
      "Altitude_m": 6169,
      "Temp_c": -24.4,
      "Dewpoint_c": -29.5,
      "Wind_Direction": 248,
      "Wind_Speed_kt": 9.4
    },
    {
      "Pressure_mb": 462.6,
      "Altitude_m": 6173,
      "Temp_c": -24.4,
      "Dewpoint_c": -29.6,
      "Wind_Direction": 248,
      "Wind_Speed_kt": 9.4
    },
    {
      "Pressure_mb": 462.3,
      "Altitude_m": 6178,
      "Temp_c": -24.4,
      "Dewpoint_c": -29.6,
      "Wind_Direction": 248,
      "Wind_Speed_kt": 9.5
    },
    {
      "Pressure_mb": 462,
      "Altitude_m": 6182,
      "Temp_c": -24.5,
      "Dewpoint_c": -29.7,
      "Wind_Direction": 248,
      "Wind_Speed_kt": 9.5
    },
    {
      "Pressure_mb": 461.7,
      "Altitude_m": 6187,
      "Temp_c": -24.5,
      "Dewpoint_c": -29.7,
      "Wind_Direction": 248,
      "Wind_Speed_kt": 9.6
    },
    {
      "Pressure_mb": 461.4,
      "Altitude_m": 6191,
      "Temp_c": -24.5,
      "Dewpoint_c": -29.7,
      "Wind_Direction": 248,
      "Wind_Speed_kt": 9.6
    },
    {
      "Pressure_mb": 461.2,
      "Altitude_m": 6195,
      "Temp_c": -24.6,
      "Dewpoint_c": -29.7,
      "Wind_Direction": 248,
      "Wind_Speed_kt": 9.6
    },
    {
      "Pressure_mb": 460.9,
      "Altitude_m": 6200,
      "Temp_c": -24.6,
      "Dewpoint_c": -29.8,
      "Wind_Direction": 248,
      "Wind_Speed_kt": 9.7
    },
    {
      "Pressure_mb": 460.6,
      "Altitude_m": 6204,
      "Temp_c": -24.6,
      "Dewpoint_c": -29.8,
      "Wind_Direction": 248,
      "Wind_Speed_kt": 9.7
    },
    {
      "Pressure_mb": 460.3,
      "Altitude_m": 6208,
      "Temp_c": -24.7,
      "Dewpoint_c": -29.8,
      "Wind_Direction": 248,
      "Wind_Speed_kt": 9.7
    },
    {
      "Pressure_mb": 460.1,
      "Altitude_m": 6212,
      "Temp_c": -24.7,
      "Dewpoint_c": -29.8,
      "Wind_Direction": 248,
      "Wind_Speed_kt": 9.7
    },
    {
      "Pressure_mb": 459.8,
      "Altitude_m": 6217,
      "Temp_c": -24.8,
      "Dewpoint_c": -29.9,
      "Wind_Direction": 248,
      "Wind_Speed_kt": 9.7
    },
    {
      "Pressure_mb": 459.5,
      "Altitude_m": 6221,
      "Temp_c": -24.8,
      "Dewpoint_c": -29.9,
      "Wind_Direction": 248,
      "Wind_Speed_kt": 9.7
    },
    {
      "Pressure_mb": 459.2,
      "Altitude_m": 6226,
      "Temp_c": -24.8,
      "Dewpoint_c": -29.9,
      "Wind_Direction": 248,
      "Wind_Speed_kt": 9.7
    },
    {
      "Pressure_mb": 458.9,
      "Altitude_m": 6230,
      "Temp_c": -24.9,
      "Dewpoint_c": -29.9,
      "Wind_Direction": 248,
      "Wind_Speed_kt": 9.8
    },
    {
      "Pressure_mb": 458.7,
      "Altitude_m": 6235,
      "Temp_c": -24.9,
      "Dewpoint_c": -30,
      "Wind_Direction": 248,
      "Wind_Speed_kt": 9.8
    },
    {
      "Pressure_mb": 458.4,
      "Altitude_m": 6239,
      "Temp_c": -24.9,
      "Dewpoint_c": -30,
      "Wind_Direction": 248,
      "Wind_Speed_kt": 9.8
    },
    {
      "Pressure_mb": 458.1,
      "Altitude_m": 6244,
      "Temp_c": -25,
      "Dewpoint_c": -30,
      "Wind_Direction": 248,
      "Wind_Speed_kt": 9.8
    },
    {
      "Pressure_mb": 457.8,
      "Altitude_m": 6249,
      "Temp_c": -25,
      "Dewpoint_c": -30,
      "Wind_Direction": 248,
      "Wind_Speed_kt": 9.8
    },
    {
      "Pressure_mb": 457.5,
      "Altitude_m": 6254,
      "Temp_c": -25.1,
      "Dewpoint_c": -30.1,
      "Wind_Direction": 248,
      "Wind_Speed_kt": 9.8
    },
    {
      "Pressure_mb": 457.2,
      "Altitude_m": 6258,
      "Temp_c": -25.1,
      "Dewpoint_c": -30.1,
      "Wind_Direction": 248,
      "Wind_Speed_kt": 9.8
    },
    {
      "Pressure_mb": 456.9,
      "Altitude_m": 6263,
      "Temp_c": -25.1,
      "Dewpoint_c": -30.1,
      "Wind_Direction": 248,
      "Wind_Speed_kt": 9.8
    },
    {
      "Pressure_mb": 456.6,
      "Altitude_m": 6268,
      "Temp_c": -25.2,
      "Dewpoint_c": -30.2,
      "Wind_Direction": 248,
      "Wind_Speed_kt": 9.8
    },
    {
      "Pressure_mb": 456.3,
      "Altitude_m": 6273,
      "Temp_c": -25.2,
      "Dewpoint_c": -30.2,
      "Wind_Direction": 248,
      "Wind_Speed_kt": 9.8
    },
    {
      "Pressure_mb": 456,
      "Altitude_m": 6278,
      "Temp_c": -25.3,
      "Dewpoint_c": -30.2,
      "Wind_Direction": 248,
      "Wind_Speed_kt": 9.9
    },
    {
      "Pressure_mb": 455.7,
      "Altitude_m": 6282,
      "Temp_c": -25.3,
      "Dewpoint_c": -30.3,
      "Wind_Direction": 248,
      "Wind_Speed_kt": 9.9
    },
    {
      "Pressure_mb": 455.4,
      "Altitude_m": 6287,
      "Temp_c": -25.3,
      "Dewpoint_c": -30.3,
      "Wind_Direction": 248,
      "Wind_Speed_kt": 9.9
    },
    {
      "Pressure_mb": 455.1,
      "Altitude_m": 6292,
      "Temp_c": -25.4,
      "Dewpoint_c": -30.3,
      "Wind_Direction": 248,
      "Wind_Speed_kt": 9.9
    },
    {
      "Pressure_mb": 454.8,
      "Altitude_m": 6297,
      "Temp_c": -25.4,
      "Dewpoint_c": -30.3,
      "Wind_Direction": 248,
      "Wind_Speed_kt": 9.9
    },
    {
      "Pressure_mb": 454.5,
      "Altitude_m": 6302,
      "Temp_c": -25.5,
      "Dewpoint_c": -30.4,
      "Wind_Direction": 248,
      "Wind_Speed_kt": 9.9
    },
    {
      "Pressure_mb": 454.1,
      "Altitude_m": 6307,
      "Temp_c": -25.5,
      "Dewpoint_c": -30.4,
      "Wind_Direction": 248,
      "Wind_Speed_kt": 9.9
    },
    {
      "Pressure_mb": 453.8,
      "Altitude_m": 6311,
      "Temp_c": -25.6,
      "Dewpoint_c": -30.4,
      "Wind_Direction": 248,
      "Wind_Speed_kt": 9.9
    },
    {
      "Pressure_mb": 453.5,
      "Altitude_m": 6316,
      "Temp_c": -25.6,
      "Dewpoint_c": -30.5,
      "Wind_Direction": 248,
      "Wind_Speed_kt": 9.9
    },
    {
      "Pressure_mb": 453.2,
      "Altitude_m": 6321,
      "Temp_c": -25.7,
      "Dewpoint_c": -30.5,
      "Wind_Direction": 248,
      "Wind_Speed_kt": 9.9
    },
    {
      "Pressure_mb": 452.9,
      "Altitude_m": 6326,
      "Temp_c": -25.7,
      "Dewpoint_c": -30.5,
      "Wind_Direction": 248,
      "Wind_Speed_kt": 9.9
    },
    {
      "Pressure_mb": 452.6,
      "Altitude_m": 6331,
      "Temp_c": -25.8,
      "Dewpoint_c": -30.6,
      "Wind_Direction": 248,
      "Wind_Speed_kt": 9.9
    },
    {
      "Pressure_mb": 452.3,
      "Altitude_m": 6337,
      "Temp_c": -25.8,
      "Dewpoint_c": -30.6,
      "Wind_Direction": 248,
      "Wind_Speed_kt": 9.9
    },
    {
      "Pressure_mb": 452,
      "Altitude_m": 6342,
      "Temp_c": -25.8,
      "Dewpoint_c": -30.6,
      "Wind_Direction": 248,
      "Wind_Speed_kt": 9.9
    },
    {
      "Pressure_mb": 451.7,
      "Altitude_m": 6347,
      "Temp_c": -25.9,
      "Dewpoint_c": -30.7,
      "Wind_Direction": 248,
      "Wind_Speed_kt": 9.9
    },
    {
      "Pressure_mb": 451.3,
      "Altitude_m": 6352,
      "Temp_c": -25.9,
      "Dewpoint_c": -30.7,
      "Wind_Direction": 248,
      "Wind_Speed_kt": 0
    },
    {
      "Pressure_mb": 451,
      "Altitude_m": 6357,
      "Temp_c": -26,
      "Dewpoint_c": -30.7,
      "Wind_Direction": 248,
      "Wind_Speed_kt": 0
    },
    {
      "Pressure_mb": 450.7,
      "Altitude_m": 6362,
      "Temp_c": -26,
      "Dewpoint_c": -30.7,
      "Wind_Direction": 248,
      "Wind_Speed_kt": 0
    },
    {
      "Pressure_mb": 450.4,
      "Altitude_m": 6366,
      "Temp_c": -26.1,
      "Dewpoint_c": -30.8,
      "Wind_Direction": 248,
      "Wind_Speed_kt": 0
    },
    {
      "Pressure_mb": 450.1,
      "Altitude_m": 6371,
      "Temp_c": -26.1,
      "Dewpoint_c": -30.8,
      "Wind_Direction": 248,
      "Wind_Speed_kt": 0
    },
    {
      "Pressure_mb": 449.8,
      "Altitude_m": 6376,
      "Temp_c": -26.2,
      "Dewpoint_c": -30.8,
      "Wind_Direction": 248,
      "Wind_Speed_kt": 0
    },
    {
      "Pressure_mb": 449.5,
      "Altitude_m": 6381,
      "Temp_c": -26.2,
      "Dewpoint_c": -30.9,
      "Wind_Direction": 248,
      "Wind_Speed_kt": 0
    },
    {
      "Pressure_mb": 449.2,
      "Altitude_m": 6385,
      "Temp_c": -26.3,
      "Dewpoint_c": -30.9,
      "Wind_Direction": 248,
      "Wind_Speed_kt": 0
    },
    {
      "Pressure_mb": 448.9,
      "Altitude_m": 6390,
      "Temp_c": -26.3,
      "Dewpoint_c": -30.9,
      "Wind_Direction": 248,
      "Wind_Speed_kt": 0
    },
    {
      "Pressure_mb": 448.6,
      "Altitude_m": 6395,
      "Temp_c": -26.4,
      "Dewpoint_c": -31,
      "Wind_Direction": 248,
      "Wind_Speed_kt": 0
    },
    {
      "Pressure_mb": 448.3,
      "Altitude_m": 6400,
      "Temp_c": -26.4,
      "Dewpoint_c": -31,
      "Wind_Direction": 248,
      "Wind_Speed_kt": 0.1
    },
    {
      "Pressure_mb": 448.1,
      "Altitude_m": 6404,
      "Temp_c": -26.4,
      "Dewpoint_c": -31,
      "Wind_Direction": 247,
      "Wind_Speed_kt": 0.1
    },
    {
      "Pressure_mb": 447.8,
      "Altitude_m": 6409,
      "Temp_c": -26.5,
      "Dewpoint_c": -31.1,
      "Wind_Direction": 247,
      "Wind_Speed_kt": 0.1
    },
    {
      "Pressure_mb": 447.5,
      "Altitude_m": 6414,
      "Temp_c": -26.5,
      "Dewpoint_c": -31.1,
      "Wind_Direction": 247,
      "Wind_Speed_kt": 0.2
    },
    {
      "Pressure_mb": 447.2,
      "Altitude_m": 6419,
      "Temp_c": -26.6,
      "Dewpoint_c": -31.1,
      "Wind_Direction": 247,
      "Wind_Speed_kt": 0.2
    },
    {
      "Pressure_mb": 446.9,
      "Altitude_m": 6423,
      "Temp_c": -26.6,
      "Dewpoint_c": -31.2,
      "Wind_Direction": 247,
      "Wind_Speed_kt": 0.3
    },
    {
      "Pressure_mb": 446.6,
      "Altitude_m": 6428,
      "Temp_c": -26.7,
      "Dewpoint_c": -31.2,
      "Wind_Direction": 247,
      "Wind_Speed_kt": 0.3
    },
    {
      "Pressure_mb": 446.3,
      "Altitude_m": 6433,
      "Temp_c": -26.7,
      "Dewpoint_c": -31.2,
      "Wind_Direction": 247,
      "Wind_Speed_kt": 0.3
    },
    {
      "Pressure_mb": 445.9,
      "Altitude_m": 6438,
      "Temp_c": -26.8,
      "Dewpoint_c": -31.3,
      "Wind_Direction": 247,
      "Wind_Speed_kt": 0.4
    },
    {
      "Pressure_mb": 445.6,
      "Altitude_m": 6443,
      "Temp_c": -26.8,
      "Dewpoint_c": -31.3,
      "Wind_Direction": 247,
      "Wind_Speed_kt": 0.4
    },
    {
      "Pressure_mb": 445.3,
      "Altitude_m": 6448,
      "Temp_c": -26.9,
      "Dewpoint_c": -31.3,
      "Wind_Direction": 247,
      "Wind_Speed_kt": 0.5
    },
    {
      "Pressure_mb": 445,
      "Altitude_m": 6453,
      "Temp_c": -26.9,
      "Dewpoint_c": -31.4,
      "Wind_Direction": 247,
      "Wind_Speed_kt": 0.5
    },
    {
      "Pressure_mb": 444.7,
      "Altitude_m": 6458,
      "Temp_c": -27,
      "Dewpoint_c": -31.4,
      "Wind_Direction": 247,
      "Wind_Speed_kt": 0.6
    },
    {
      "Pressure_mb": 444.3,
      "Altitude_m": 6464,
      "Temp_c": -27,
      "Dewpoint_c": -31.4,
      "Wind_Direction": 247,
      "Wind_Speed_kt": 0.6
    },
    {
      "Pressure_mb": 444,
      "Altitude_m": 6470,
      "Temp_c": -27.1,
      "Dewpoint_c": -31.5,
      "Wind_Direction": 247,
      "Wind_Speed_kt": 0.6
    },
    {
      "Pressure_mb": 443.6,
      "Altitude_m": 6475,
      "Temp_c": -27.1,
      "Dewpoint_c": -31.5,
      "Wind_Direction": 247,
      "Wind_Speed_kt": 0.7
    },
    {
      "Pressure_mb": 443.3,
      "Altitude_m": 6481,
      "Temp_c": -27.2,
      "Dewpoint_c": -31.5,
      "Wind_Direction": 247,
      "Wind_Speed_kt": 0.7
    },
    {
      "Pressure_mb": 443,
      "Altitude_m": 6487,
      "Temp_c": -27.2,
      "Dewpoint_c": -31.6,
      "Wind_Direction": 247,
      "Wind_Speed_kt": 0.8
    },
    {
      "Pressure_mb": 442.6,
      "Altitude_m": 6493,
      "Temp_c": -27.3,
      "Dewpoint_c": -31.6,
      "Wind_Direction": 247,
      "Wind_Speed_kt": 0.8
    },
    {
      "Pressure_mb": 442.3,
      "Altitude_m": 6498,
      "Temp_c": -27.3,
      "Dewpoint_c": -31.6,
      "Wind_Direction": 247,
      "Wind_Speed_kt": 0.9
    },
    {
      "Pressure_mb": 442,
      "Altitude_m": 6503,
      "Temp_c": -27.4,
      "Dewpoint_c": -31.6,
      "Wind_Direction": 247,
      "Wind_Speed_kt": 0.8
    },
    {
      "Pressure_mb": 441.6,
      "Altitude_m": 6509,
      "Temp_c": -27.4,
      "Dewpoint_c": -31.7,
      "Wind_Direction": 247,
      "Wind_Speed_kt": 0.8
    },
    {
      "Pressure_mb": 441.3,
      "Altitude_m": 6514,
      "Temp_c": -27.5,
      "Dewpoint_c": -31.7,
      "Wind_Direction": 247,
      "Wind_Speed_kt": 0.8
    },
    {
      "Pressure_mb": 441,
      "Altitude_m": 6519,
      "Temp_c": -27.5,
      "Dewpoint_c": -31.7,
      "Wind_Direction": 247,
      "Wind_Speed_kt": 0.8
    },
    {
      "Pressure_mb": 440.7,
      "Altitude_m": 6524,
      "Temp_c": -27.6,
      "Dewpoint_c": -31.7,
      "Wind_Direction": 247,
      "Wind_Speed_kt": 0.8
    },
    {
      "Pressure_mb": 440.4,
      "Altitude_m": 6529,
      "Temp_c": -27.6,
      "Dewpoint_c": -31.7,
      "Wind_Direction": 247,
      "Wind_Speed_kt": 0.7
    },
    {
      "Pressure_mb": 440.1,
      "Altitude_m": 6534,
      "Temp_c": -27.7,
      "Dewpoint_c": -31.7,
      "Wind_Direction": 247,
      "Wind_Speed_kt": 0.7
    },
    {
      "Pressure_mb": 439.8,
      "Altitude_m": 6539,
      "Temp_c": -27.7,
      "Dewpoint_c": -31.7,
      "Wind_Direction": 247,
      "Wind_Speed_kt": 0.7
    },
    {
      "Pressure_mb": 439.4,
      "Altitude_m": 6544,
      "Temp_c": -27.7,
      "Dewpoint_c": -31.7,
      "Wind_Direction": 247,
      "Wind_Speed_kt": 0.7
    },
    {
      "Pressure_mb": 439.1,
      "Altitude_m": 6549,
      "Temp_c": -27.8,
      "Dewpoint_c": -31.7,
      "Wind_Direction": 247,
      "Wind_Speed_kt": 0.7
    },
    {
      "Pressure_mb": 438.8,
      "Altitude_m": 6554,
      "Temp_c": -27.8,
      "Dewpoint_c": -31.7,
      "Wind_Direction": 247,
      "Wind_Speed_kt": 0.6
    },
    {
      "Pressure_mb": 438.5,
      "Altitude_m": 6560,
      "Temp_c": -27.9,
      "Dewpoint_c": -31.7,
      "Wind_Direction": 247,
      "Wind_Speed_kt": 0.6
    },
    {
      "Pressure_mb": 438.2,
      "Altitude_m": 6565,
      "Temp_c": -27.9,
      "Dewpoint_c": -31.7,
      "Wind_Direction": 247,
      "Wind_Speed_kt": 0.6
    },
    {
      "Pressure_mb": 437.8,
      "Altitude_m": 6570,
      "Temp_c": -28,
      "Dewpoint_c": -31.7,
      "Wind_Direction": 247,
      "Wind_Speed_kt": 0.6
    },
    {
      "Pressure_mb": 437.5,
      "Altitude_m": 6576,
      "Temp_c": -28,
      "Dewpoint_c": -31.8,
      "Wind_Direction": 247,
      "Wind_Speed_kt": 0.6
    },
    {
      "Pressure_mb": 437.2,
      "Altitude_m": 6581,
      "Temp_c": -28.1,
      "Dewpoint_c": -31.8,
      "Wind_Direction": 247,
      "Wind_Speed_kt": 0.5
    },
    {
      "Pressure_mb": 436.9,
      "Altitude_m": 6586,
      "Temp_c": -28.1,
      "Dewpoint_c": -31.8,
      "Wind_Direction": 247,
      "Wind_Speed_kt": 0.5
    },
    {
      "Pressure_mb": 436.6,
      "Altitude_m": 6591,
      "Temp_c": -28.2,
      "Dewpoint_c": -31.9,
      "Wind_Direction": 247,
      "Wind_Speed_kt": 0.5
    },
    {
      "Pressure_mb": 436.3,
      "Altitude_m": 6596,
      "Temp_c": -28.2,
      "Dewpoint_c": -31.9,
      "Wind_Direction": 247,
      "Wind_Speed_kt": 0.5
    },
    {
      "Pressure_mb": 436,
      "Altitude_m": 6601,
      "Temp_c": -28.3,
      "Dewpoint_c": -31.9,
      "Wind_Direction": 247,
      "Wind_Speed_kt": 0.5
    },
    {
      "Pressure_mb": 435.7,
      "Altitude_m": 6606,
      "Temp_c": -28.3,
      "Dewpoint_c": -31.9,
      "Wind_Direction": 247,
      "Wind_Speed_kt": 0.4
    },
    {
      "Pressure_mb": 435.3,
      "Altitude_m": 6612,
      "Temp_c": -28.4,
      "Dewpoint_c": -32,
      "Wind_Direction": 247,
      "Wind_Speed_kt": 0.4
    },
    {
      "Pressure_mb": 435,
      "Altitude_m": 6617,
      "Temp_c": -28.4,
      "Dewpoint_c": -32,
      "Wind_Direction": 247,
      "Wind_Speed_kt": 0.4
    },
    {
      "Pressure_mb": 434.7,
      "Altitude_m": 6623,
      "Temp_c": -28.5,
      "Dewpoint_c": -32,
      "Wind_Direction": 247,
      "Wind_Speed_kt": 0.4
    },
    {
      "Pressure_mb": 434.3,
      "Altitude_m": 6628,
      "Temp_c": -28.5,
      "Dewpoint_c": -32.1,
      "Wind_Direction": 247,
      "Wind_Speed_kt": 0.4
    },
    {
      "Pressure_mb": 434,
      "Altitude_m": 6634,
      "Temp_c": -28.6,
      "Dewpoint_c": -32.1,
      "Wind_Direction": 247,
      "Wind_Speed_kt": 0.3
    },
    {
      "Pressure_mb": 433.6,
      "Altitude_m": 6639,
      "Temp_c": -28.6,
      "Dewpoint_c": -32.1,
      "Wind_Direction": 247,
      "Wind_Speed_kt": 0.3
    },
    {
      "Pressure_mb": 433.3,
      "Altitude_m": 6645,
      "Temp_c": -28.6,
      "Dewpoint_c": -32.2,
      "Wind_Direction": 247,
      "Wind_Speed_kt": 0.3
    },
    {
      "Pressure_mb": 432.9,
      "Altitude_m": 6651,
      "Temp_c": -28.7,
      "Dewpoint_c": -32.2,
      "Wind_Direction": 247,
      "Wind_Speed_kt": 0.3
    },
    {
      "Pressure_mb": 432.6,
      "Altitude_m": 6657,
      "Temp_c": -28.7,
      "Dewpoint_c": -32.2,
      "Wind_Direction": 247,
      "Wind_Speed_kt": 0.2
    },
    {
      "Pressure_mb": 432.2,
      "Altitude_m": 6663,
      "Temp_c": -28.8,
      "Dewpoint_c": -32.3,
      "Wind_Direction": 247,
      "Wind_Speed_kt": 0.2
    },
    {
      "Pressure_mb": 431.9,
      "Altitude_m": 6669,
      "Temp_c": -28.8,
      "Dewpoint_c": -32.3,
      "Wind_Direction": 247,
      "Wind_Speed_kt": 0.2
    },
    {
      "Pressure_mb": 431.5,
      "Altitude_m": 6675,
      "Temp_c": -28.9,
      "Dewpoint_c": -32.3,
      "Wind_Direction": 247,
      "Wind_Speed_kt": 0.2
    },
    {
      "Pressure_mb": 431.1,
      "Altitude_m": 6681,
      "Temp_c": -28.9,
      "Dewpoint_c": -32.4,
      "Wind_Direction": 247,
      "Wind_Speed_kt": 0.1
    },
    {
      "Pressure_mb": 430.8,
      "Altitude_m": 6687,
      "Temp_c": -29,
      "Dewpoint_c": -32.4,
      "Wind_Direction": 247,
      "Wind_Speed_kt": 0.1
    },
    {
      "Pressure_mb": 430.4,
      "Altitude_m": 6694,
      "Temp_c": -29,
      "Dewpoint_c": -32.4,
      "Wind_Direction": 247,
      "Wind_Speed_kt": 0.1
    },
    {
      "Pressure_mb": 430,
      "Altitude_m": 6700,
      "Temp_c": -29.1,
      "Dewpoint_c": -32.5,
      "Wind_Direction": 247,
      "Wind_Speed_kt": 0.1
    },
    {
      "Pressure_mb": 429.7,
      "Altitude_m": 6706,
      "Temp_c": -29.1,
      "Dewpoint_c": -32.5,
      "Wind_Direction": 247,
      "Wind_Speed_kt": 0.1
    },
    {
      "Pressure_mb": 429.3,
      "Altitude_m": 6711,
      "Temp_c": -29.2,
      "Dewpoint_c": -32.6,
      "Wind_Direction": 247,
      "Wind_Speed_kt": 0
    },
    {
      "Pressure_mb": 429,
      "Altitude_m": 6716,
      "Temp_c": -29.2,
      "Dewpoint_c": -32.6,
      "Wind_Direction": 248,
      "Wind_Speed_kt": 0
    },
    {
      "Pressure_mb": 428.7,
      "Altitude_m": 6721,
      "Temp_c": -29.3,
      "Dewpoint_c": -32.6,
      "Wind_Direction": 247,
      "Wind_Speed_kt": 0
    },
    {
      "Pressure_mb": 428.4,
      "Altitude_m": 6726,
      "Temp_c": -29.3,
      "Dewpoint_c": -32.7,
      "Wind_Direction": 247,
      "Wind_Speed_kt": 0.1
    },
    {
      "Pressure_mb": 428.1,
      "Altitude_m": 6731,
      "Temp_c": -29.3,
      "Dewpoint_c": -32.7,
      "Wind_Direction": 247,
      "Wind_Speed_kt": 0.1
    },
    {
      "Pressure_mb": 427.8,
      "Altitude_m": 6736,
      "Temp_c": -29.4,
      "Dewpoint_c": -32.7,
      "Wind_Direction": 247,
      "Wind_Speed_kt": 0.1
    },
    {
      "Pressure_mb": 427.5,
      "Altitude_m": 6741,
      "Temp_c": -29.4,
      "Dewpoint_c": -32.8,
      "Wind_Direction": 247,
      "Wind_Speed_kt": 0.2
    },
    {
      "Pressure_mb": 427.2,
      "Altitude_m": 6747,
      "Temp_c": -29.5,
      "Dewpoint_c": -32.8,
      "Wind_Direction": 247,
      "Wind_Speed_kt": 0.2
    },
    {
      "Pressure_mb": 426.9,
      "Altitude_m": 6752,
      "Temp_c": -29.5,
      "Dewpoint_c": -32.8,
      "Wind_Direction": 247,
      "Wind_Speed_kt": 0.2
    },
    {
      "Pressure_mb": 426.5,
      "Altitude_m": 6758,
      "Temp_c": -29.5,
      "Dewpoint_c": -32.9,
      "Wind_Direction": 247,
      "Wind_Speed_kt": 0.3
    },
    {
      "Pressure_mb": 426.2,
      "Altitude_m": 6763,
      "Temp_c": -29.6,
      "Dewpoint_c": -32.9,
      "Wind_Direction": 247,
      "Wind_Speed_kt": 0.3
    },
    {
      "Pressure_mb": 425.9,
      "Altitude_m": 6768,
      "Temp_c": -29.6,
      "Dewpoint_c": -32.9,
      "Wind_Direction": 247,
      "Wind_Speed_kt": 0.3
    },
    {
      "Pressure_mb": 425.6,
      "Altitude_m": 6774,
      "Temp_c": -29.7,
      "Dewpoint_c": -33,
      "Wind_Direction": 247,
      "Wind_Speed_kt": 0.4
    },
    {
      "Pressure_mb": 425.3,
      "Altitude_m": 6779,
      "Temp_c": -29.7,
      "Dewpoint_c": -33,
      "Wind_Direction": 247,
      "Wind_Speed_kt": 0.4
    },
    {
      "Pressure_mb": 424.9,
      "Altitude_m": 6785,
      "Temp_c": -29.8,
      "Dewpoint_c": -33.1,
      "Wind_Direction": 247,
      "Wind_Speed_kt": 0.4
    },
    {
      "Pressure_mb": 424.6,
      "Altitude_m": 6790,
      "Temp_c": -29.8,
      "Dewpoint_c": -33.1,
      "Wind_Direction": 247,
      "Wind_Speed_kt": 0.5
    },
    {
      "Pressure_mb": 424.3,
      "Altitude_m": 6795,
      "Temp_c": -29.8,
      "Dewpoint_c": -33.1,
      "Wind_Direction": 247,
      "Wind_Speed_kt": 0.5
    },
    {
      "Pressure_mb": 424,
      "Altitude_m": 6800,
      "Temp_c": -29.9,
      "Dewpoint_c": -33.2,
      "Wind_Direction": 247,
      "Wind_Speed_kt": 0.5
    },
    {
      "Pressure_mb": 423.7,
      "Altitude_m": 6805,
      "Temp_c": -29.9,
      "Dewpoint_c": -33.2,
      "Wind_Direction": 247,
      "Wind_Speed_kt": 0.6
    },
    {
      "Pressure_mb": 423.4,
      "Altitude_m": 6810,
      "Temp_c": -30,
      "Dewpoint_c": -33.3,
      "Wind_Direction": 247,
      "Wind_Speed_kt": 0.6
    },
    {
      "Pressure_mb": 423.1,
      "Altitude_m": 6815,
      "Temp_c": -30,
      "Dewpoint_c": -33.3,
      "Wind_Direction": 247,
      "Wind_Speed_kt": 0.6
    },
    {
      "Pressure_mb": 422.8,
      "Altitude_m": 6820,
      "Temp_c": -30.1,
      "Dewpoint_c": -33.4,
      "Wind_Direction": 247,
      "Wind_Speed_kt": 0.7
    },
    {
      "Pressure_mb": 422.5,
      "Altitude_m": 6825,
      "Temp_c": -30.1,
      "Dewpoint_c": -33.4,
      "Wind_Direction": 247,
      "Wind_Speed_kt": 0.7
    },
    {
      "Pressure_mb": 422.2,
      "Altitude_m": 6830,
      "Temp_c": -30.2,
      "Dewpoint_c": -33.5,
      "Wind_Direction": 247,
      "Wind_Speed_kt": 0.7
    },
    {
      "Pressure_mb": 421.9,
      "Altitude_m": 6835,
      "Temp_c": -30.2,
      "Dewpoint_c": -33.5,
      "Wind_Direction": 247,
      "Wind_Speed_kt": 0.7
    },
    {
      "Pressure_mb": 421.6,
      "Altitude_m": 6841,
      "Temp_c": -30.2,
      "Dewpoint_c": -33.5,
      "Wind_Direction": 247,
      "Wind_Speed_kt": 0.7
    },
    {
      "Pressure_mb": 421.2,
      "Altitude_m": 6846,
      "Temp_c": -30.3,
      "Dewpoint_c": -33.6,
      "Wind_Direction": 247,
      "Wind_Speed_kt": 0.7
    },
    {
      "Pressure_mb": 420.9,
      "Altitude_m": 6851,
      "Temp_c": -30.3,
      "Dewpoint_c": -33.6,
      "Wind_Direction": 247,
      "Wind_Speed_kt": 0.8
    },
    {
      "Pressure_mb": 420.6,
      "Altitude_m": 6857,
      "Temp_c": -30.4,
      "Dewpoint_c": -33.7,
      "Wind_Direction": 247,
      "Wind_Speed_kt": 0.8
    },
    {
      "Pressure_mb": 420.2,
      "Altitude_m": 6863,
      "Temp_c": -30.4,
      "Dewpoint_c": -33.7,
      "Wind_Direction": 247,
      "Wind_Speed_kt": 0.8
    },
    {
      "Pressure_mb": 419.9,
      "Altitude_m": 6869,
      "Temp_c": -30.4,
      "Dewpoint_c": -33.7,
      "Wind_Direction": 247,
      "Wind_Speed_kt": 0.8
    },
    {
      "Pressure_mb": 419.6,
      "Altitude_m": 6875,
      "Temp_c": -30.5,
      "Dewpoint_c": -33.8,
      "Wind_Direction": 247,
      "Wind_Speed_kt": 0.8
    },
    {
      "Pressure_mb": 419.3,
      "Altitude_m": 6881,
      "Temp_c": -30.5,
      "Dewpoint_c": -33.8,
      "Wind_Direction": 247,
      "Wind_Speed_kt": 0.8
    },
    {
      "Pressure_mb": 418.9,
      "Altitude_m": 6886,
      "Temp_c": -30.6,
      "Dewpoint_c": -33.8,
      "Wind_Direction": 247,
      "Wind_Speed_kt": 0.9
    },
    {
      "Pressure_mb": 418.6,
      "Altitude_m": 6892,
      "Temp_c": -30.6,
      "Dewpoint_c": -33.9,
      "Wind_Direction": 247,
      "Wind_Speed_kt": 0.9
    },
    {
      "Pressure_mb": 418.3,
      "Altitude_m": 6897,
      "Temp_c": -30.6,
      "Dewpoint_c": -33.9,
      "Wind_Direction": 247,
      "Wind_Speed_kt": 0.9
    },
    {
      "Pressure_mb": 417.9,
      "Altitude_m": 6903,
      "Temp_c": -30.7,
      "Dewpoint_c": -34,
      "Wind_Direction": 247,
      "Wind_Speed_kt": 0.9
    },
    {
      "Pressure_mb": 417.6,
      "Altitude_m": 6908,
      "Temp_c": -30.7,
      "Dewpoint_c": -34,
      "Wind_Direction": 247,
      "Wind_Speed_kt": 0.9
    },
    {
      "Pressure_mb": 417.3,
      "Altitude_m": 6913,
      "Temp_c": -30.7,
      "Dewpoint_c": -34,
      "Wind_Direction": 247,
      "Wind_Speed_kt": 1
    },
    {
      "Pressure_mb": 417,
      "Altitude_m": 6918,
      "Temp_c": -30.8,
      "Dewpoint_c": -34.1,
      "Wind_Direction": 247,
      "Wind_Speed_kt": 1
    },
    {
      "Pressure_mb": 416.7,
      "Altitude_m": 6923,
      "Temp_c": -30.8,
      "Dewpoint_c": -34.1,
      "Wind_Direction": 247,
      "Wind_Speed_kt": 1
    },
    {
      "Pressure_mb": 416.5,
      "Altitude_m": 6928,
      "Temp_c": -30.8,
      "Dewpoint_c": -34.1,
      "Wind_Direction": 247,
      "Wind_Speed_kt": 1
    },
    {
      "Pressure_mb": 416.2,
      "Altitude_m": 6933,
      "Temp_c": -30.9,
      "Dewpoint_c": -34.2,
      "Wind_Direction": 247,
      "Wind_Speed_kt": 1
    },
    {
      "Pressure_mb": 415.9,
      "Altitude_m": 6938,
      "Temp_c": -30.9,
      "Dewpoint_c": -34.2,
      "Wind_Direction": 247,
      "Wind_Speed_kt": 1
    },
    {
      "Pressure_mb": 415.6,
      "Altitude_m": 6942,
      "Temp_c": -30.9,
      "Dewpoint_c": -34.2,
      "Wind_Direction": 247,
      "Wind_Speed_kt": 1
    },
    {
      "Pressure_mb": 415.3,
      "Altitude_m": 6947,
      "Temp_c": -31,
      "Dewpoint_c": -34.2,
      "Wind_Direction": 247,
      "Wind_Speed_kt": 0.9
    },
    {
      "Pressure_mb": 415.1,
      "Altitude_m": 6951,
      "Temp_c": -31,
      "Dewpoint_c": -34.3,
      "Wind_Direction": 247,
      "Wind_Speed_kt": 0.9
    },
    {
      "Pressure_mb": 414.8,
      "Altitude_m": 6956,
      "Temp_c": -31,
      "Dewpoint_c": -34.3,
      "Wind_Direction": 247,
      "Wind_Speed_kt": 0.9
    },
    {
      "Pressure_mb": 414.5,
      "Altitude_m": 6961,
      "Temp_c": -31,
      "Dewpoint_c": -34.3,
      "Wind_Direction": 247,
      "Wind_Speed_kt": 0.9
    },
    {
      "Pressure_mb": 414.3,
      "Altitude_m": 6965,
      "Temp_c": -31.1,
      "Dewpoint_c": -34.3,
      "Wind_Direction": 247,
      "Wind_Speed_kt": 0.9
    },
    {
      "Pressure_mb": 414,
      "Altitude_m": 6970,
      "Temp_c": -31.1,
      "Dewpoint_c": -34.4,
      "Wind_Direction": 247,
      "Wind_Speed_kt": 0.9
    },
    {
      "Pressure_mb": 413.7,
      "Altitude_m": 6974,
      "Temp_c": -31.1,
      "Dewpoint_c": -34.4,
      "Wind_Direction": 247,
      "Wind_Speed_kt": 0.9
    },
    {
      "Pressure_mb": 413.5,
      "Altitude_m": 6979,
      "Temp_c": -31.2,
      "Dewpoint_c": -34.4,
      "Wind_Direction": 247,
      "Wind_Speed_kt": 0.8
    },
    {
      "Pressure_mb": 413.2,
      "Altitude_m": 6983,
      "Temp_c": -31.2,
      "Dewpoint_c": -34.4,
      "Wind_Direction": 247,
      "Wind_Speed_kt": 0.8
    },
    {
      "Pressure_mb": 412.9,
      "Altitude_m": 6988,
      "Temp_c": -31.2,
      "Dewpoint_c": -34.5,
      "Wind_Direction": 247,
      "Wind_Speed_kt": 0.8
    },
    {
      "Pressure_mb": 412.7,
      "Altitude_m": 6992,
      "Temp_c": -31.3,
      "Dewpoint_c": -34.5,
      "Wind_Direction": 247,
      "Wind_Speed_kt": 0.8
    },
    {
      "Pressure_mb": 412.3,
      "Altitude_m": 6999,
      "Temp_c": -31.3,
      "Dewpoint_c": -34.5,
      "Wind_Direction": 247,
      "Wind_Speed_kt": 0.8
    },
    {
      "Pressure_mb": 412.1,
      "Altitude_m": 7002,
      "Temp_c": -31.3,
      "Dewpoint_c": -34.5,
      "Wind_Direction": 247,
      "Wind_Speed_kt": 0.8
    },
    {
      "Pressure_mb": 411.8,
      "Altitude_m": 7007,
      "Temp_c": -31.4,
      "Dewpoint_c": -34.6,
      "Wind_Direction": 247,
      "Wind_Speed_kt": 0.8
    },
    {
      "Pressure_mb": 411.6,
      "Altitude_m": 7011,
      "Temp_c": -31.4,
      "Dewpoint_c": -34.6,
      "Wind_Direction": 247,
      "Wind_Speed_kt": 0.7
    },
    {
      "Pressure_mb": 411.3,
      "Altitude_m": 7016,
      "Temp_c": -31.4,
      "Dewpoint_c": -34.7,
      "Wind_Direction": 247,
      "Wind_Speed_kt": 0.7
    },
    {
      "Pressure_mb": 411,
      "Altitude_m": 7021,
      "Temp_c": -31.5,
      "Dewpoint_c": -34.7,
      "Wind_Direction": 247,
      "Wind_Speed_kt": 0.7
    },
    {
      "Pressure_mb": 410.7,
      "Altitude_m": 7025,
      "Temp_c": -31.5,
      "Dewpoint_c": -34.7,
      "Wind_Direction": 247,
      "Wind_Speed_kt": 0.7
    },
    {
      "Pressure_mb": 410.5,
      "Altitude_m": 7030,
      "Temp_c": -31.5,
      "Dewpoint_c": -34.8,
      "Wind_Direction": 247,
      "Wind_Speed_kt": 0.7
    },
    {
      "Pressure_mb": 410.2,
      "Altitude_m": 7035,
      "Temp_c": -31.5,
      "Dewpoint_c": -34.8,
      "Wind_Direction": 247,
      "Wind_Speed_kt": 0.7
    },
    {
      "Pressure_mb": 409.9,
      "Altitude_m": 7040,
      "Temp_c": -31.6,
      "Dewpoint_c": -34.8,
      "Wind_Direction": 247,
      "Wind_Speed_kt": 0.7
    },
    {
      "Pressure_mb": 409.6,
      "Altitude_m": 7044,
      "Temp_c": -31.6,
      "Dewpoint_c": -34.9,
      "Wind_Direction": 247,
      "Wind_Speed_kt": 0.7
    },
    {
      "Pressure_mb": 409.4,
      "Altitude_m": 7049,
      "Temp_c": -31.6,
      "Dewpoint_c": -34.9,
      "Wind_Direction": 247,
      "Wind_Speed_kt": 0.7
    },
    {
      "Pressure_mb": 409.1,
      "Altitude_m": 7053,
      "Temp_c": -31.7,
      "Dewpoint_c": -34.9,
      "Wind_Direction": 247,
      "Wind_Speed_kt": 0.6
    },
    {
      "Pressure_mb": 408.9,
      "Altitude_m": 7058,
      "Temp_c": -31.7,
      "Dewpoint_c": -35,
      "Wind_Direction": 247,
      "Wind_Speed_kt": 0.6
    },
    {
      "Pressure_mb": 408.6,
      "Altitude_m": 7062,
      "Temp_c": -31.7,
      "Dewpoint_c": -35,
      "Wind_Direction": 247,
      "Wind_Speed_kt": 0.6
    },
    {
      "Pressure_mb": 408.3,
      "Altitude_m": 7067,
      "Temp_c": -31.7,
      "Dewpoint_c": -35,
      "Wind_Direction": 247,
      "Wind_Speed_kt": 0.6
    },
    {
      "Pressure_mb": 408.1,
      "Altitude_m": 7071,
      "Temp_c": -31.8,
      "Dewpoint_c": -35,
      "Wind_Direction": 247,
      "Wind_Speed_kt": 0.6
    },
    {
      "Pressure_mb": 407.8,
      "Altitude_m": 7076,
      "Temp_c": -31.8,
      "Dewpoint_c": -35.1,
      "Wind_Direction": 247,
      "Wind_Speed_kt": 0.6
    },
    {
      "Pressure_mb": 407.6,
      "Altitude_m": 7080,
      "Temp_c": -31.8,
      "Dewpoint_c": -35.1,
      "Wind_Direction": 247,
      "Wind_Speed_kt": 0.6
    },
    {
      "Pressure_mb": 407.3,
      "Altitude_m": 7085,
      "Temp_c": -31.8,
      "Dewpoint_c": -35.1,
      "Wind_Direction": 247,
      "Wind_Speed_kt": 0.6
    },
    {
      "Pressure_mb": 407.1,
      "Altitude_m": 7089,
      "Temp_c": -31.9,
      "Dewpoint_c": -35.1,
      "Wind_Direction": 247,
      "Wind_Speed_kt": 0.6
    },
    {
      "Pressure_mb": 406.8,
      "Altitude_m": 7093,
      "Temp_c": -31.9,
      "Dewpoint_c": -35.2,
      "Wind_Direction": 247,
      "Wind_Speed_kt": 0.5
    },
    {
      "Pressure_mb": 406.6,
      "Altitude_m": 7098,
      "Temp_c": -31.9,
      "Dewpoint_c": -35.2,
      "Wind_Direction": 247,
      "Wind_Speed_kt": 0.5
    },
    {
      "Pressure_mb": 406.3,
      "Altitude_m": 7102,
      "Temp_c": -31.9,
      "Dewpoint_c": -35.2,
      "Wind_Direction": 247,
      "Wind_Speed_kt": 0.5
    },
    {
      "Pressure_mb": 406.1,
      "Altitude_m": 7106,
      "Temp_c": -32,
      "Dewpoint_c": -35.2,
      "Wind_Direction": 247,
      "Wind_Speed_kt": 0.5
    },
    {
      "Pressure_mb": 405.8,
      "Altitude_m": 7111,
      "Temp_c": -32,
      "Dewpoint_c": -35.3,
      "Wind_Direction": 247,
      "Wind_Speed_kt": 0.5
    },
    {
      "Pressure_mb": 405.6,
      "Altitude_m": 7115,
      "Temp_c": -32,
      "Dewpoint_c": -35.3,
      "Wind_Direction": 247,
      "Wind_Speed_kt": 0.5
    },
    {
      "Pressure_mb": 405.3,
      "Altitude_m": 7119,
      "Temp_c": -32,
      "Dewpoint_c": -35.3,
      "Wind_Direction": 247,
      "Wind_Speed_kt": 0.5
    },
    {
      "Pressure_mb": 405.1,
      "Altitude_m": 7123,
      "Temp_c": -32.1,
      "Dewpoint_c": -35.3,
      "Wind_Direction": 247,
      "Wind_Speed_kt": 0.5
    },
    {
      "Pressure_mb": 404.9,
      "Altitude_m": 7127,
      "Temp_c": -32.1,
      "Dewpoint_c": -35.3,
      "Wind_Direction": 247,
      "Wind_Speed_kt": 0.6
    },
    {
      "Pressure_mb": 404.6,
      "Altitude_m": 7132,
      "Temp_c": -32.1,
      "Dewpoint_c": -35.4,
      "Wind_Direction": 247,
      "Wind_Speed_kt": 0.6
    },
    {
      "Pressure_mb": 404.4,
      "Altitude_m": 7136,
      "Temp_c": -32.1,
      "Dewpoint_c": -35.4,
      "Wind_Direction": 247,
      "Wind_Speed_kt": 0.6
    },
    {
      "Pressure_mb": 404.1,
      "Altitude_m": 7140,
      "Temp_c": -32.1,
      "Dewpoint_c": -35.4,
      "Wind_Direction": 247,
      "Wind_Speed_kt": 0.6
    },
    {
      "Pressure_mb": 403.9,
      "Altitude_m": 7144,
      "Temp_c": -32.2,
      "Dewpoint_c": -35.4,
      "Wind_Direction": 247,
      "Wind_Speed_kt": 0.6
    },
    {
      "Pressure_mb": 403.6,
      "Altitude_m": 7149,
      "Temp_c": -32.2,
      "Dewpoint_c": -35.5,
      "Wind_Direction": 247,
      "Wind_Speed_kt": 0.7
    },
    {
      "Pressure_mb": 403.4,
      "Altitude_m": 7153,
      "Temp_c": -32.2,
      "Dewpoint_c": -35.5,
      "Wind_Direction": 247,
      "Wind_Speed_kt": 0.7
    },
    {
      "Pressure_mb": 403.2,
      "Altitude_m": 7157,
      "Temp_c": -32.2,
      "Dewpoint_c": -35.5,
      "Wind_Direction": 247,
      "Wind_Speed_kt": 0.7
    },
    {
      "Pressure_mb": 402.9,
      "Altitude_m": 7162,
      "Temp_c": -32.2,
      "Dewpoint_c": -35.5,
      "Wind_Direction": 247,
      "Wind_Speed_kt": 0.7
    },
    {
      "Pressure_mb": 402.7,
      "Altitude_m": 7166,
      "Temp_c": -32.3,
      "Dewpoint_c": -35.5,
      "Wind_Direction": 247,
      "Wind_Speed_kt": 0.7
    },
    {
      "Pressure_mb": 402.4,
      "Altitude_m": 7170,
      "Temp_c": -32.3,
      "Dewpoint_c": -35.6,
      "Wind_Direction": 247,
      "Wind_Speed_kt": 0.7
    },
    {
      "Pressure_mb": 402.2,
      "Altitude_m": 7174,
      "Temp_c": -32.3,
      "Dewpoint_c": -35.6,
      "Wind_Direction": 247,
      "Wind_Speed_kt": 0.8
    },
    {
      "Pressure_mb": 402,
      "Altitude_m": 7177,
      "Temp_c": -32.3,
      "Dewpoint_c": -35.6,
      "Wind_Direction": 247,
      "Wind_Speed_kt": 0.8
    },
    {
      "Pressure_mb": 401.7,
      "Altitude_m": 7183,
      "Temp_c": -32.4,
      "Dewpoint_c": -35.6,
      "Wind_Direction": 247,
      "Wind_Speed_kt": 0.8
    },
    {
      "Pressure_mb": 401.5,
      "Altitude_m": 7187,
      "Temp_c": -32.4,
      "Dewpoint_c": -35.6,
      "Wind_Direction": 247,
      "Wind_Speed_kt": 0.8
    },
    {
      "Pressure_mb": 401.2,
      "Altitude_m": 7191,
      "Temp_c": -32.4,
      "Dewpoint_c": -35.7,
      "Wind_Direction": 247,
      "Wind_Speed_kt": 0.8
    },
    {
      "Pressure_mb": 401,
      "Altitude_m": 7195,
      "Temp_c": -32.4,
      "Dewpoint_c": -35.7,
      "Wind_Direction": 247,
      "Wind_Speed_kt": 0.8
    },
    {
      "Pressure_mb": 400.7,
      "Altitude_m": 7200,
      "Temp_c": -32.4,
      "Dewpoint_c": -35.7,
      "Wind_Direction": 247,
      "Wind_Speed_kt": 0.8
    },
    {
      "Pressure_mb": 400.5,
      "Altitude_m": 7204,
      "Temp_c": -32.5,
      "Dewpoint_c": -35.7,
      "Wind_Direction": 247,
      "Wind_Speed_kt": 0.8
    },
    {
      "Pressure_mb": 400.3,
      "Altitude_m": 7208,
      "Temp_c": -32.5,
      "Dewpoint_c": -35.8,
      "Wind_Direction": 247,
      "Wind_Speed_kt": 0.8
    },
    {
      "Pressure_mb": 400,
      "Altitude_m": 7213,
      "Temp_c": -32.5,
      "Dewpoint_c": -35.8,
      "Wind_Direction": 247,
      "Wind_Speed_kt": 0.8
    },
    {
      "Pressure_mb": 399.8,
      "Altitude_m": 7217,
      "Temp_c": -32.5,
      "Dewpoint_c": -35.8,
      "Wind_Direction": 247,
      "Wind_Speed_kt": 0.8
    },
    {
      "Pressure_mb": 399.5,
      "Altitude_m": 7221,
      "Temp_c": -32.6,
      "Dewpoint_c": -35.8,
      "Wind_Direction": 247,
      "Wind_Speed_kt": 0.8
    },
    {
      "Pressure_mb": 399.3,
      "Altitude_m": 7225,
      "Temp_c": -32.6,
      "Dewpoint_c": -35.8,
      "Wind_Direction": 247,
      "Wind_Speed_kt": 0.8
    },
    {
      "Pressure_mb": 399,
      "Altitude_m": 7229,
      "Temp_c": -32.6,
      "Dewpoint_c": -35.9,
      "Wind_Direction": 247,
      "Wind_Speed_kt": 0.8
    },
    {
      "Pressure_mb": 398.8,
      "Altitude_m": 7234,
      "Temp_c": -32.7,
      "Dewpoint_c": -35.9,
      "Wind_Direction": 247,
      "Wind_Speed_kt": 0.8
    },
    {
      "Pressure_mb": 398.6,
      "Altitude_m": 7238,
      "Temp_c": -32.7,
      "Dewpoint_c": -35.9,
      "Wind_Direction": 247,
      "Wind_Speed_kt": 0.8
    },
    {
      "Pressure_mb": 398.3,
      "Altitude_m": 7242,
      "Temp_c": -32.7,
      "Dewpoint_c": -36,
      "Wind_Direction": 246,
      "Wind_Speed_kt": 0.8
    },
    {
      "Pressure_mb": 398.1,
      "Altitude_m": 7246,
      "Temp_c": -32.8,
      "Dewpoint_c": -36,
      "Wind_Direction": 246,
      "Wind_Speed_kt": 0.8
    },
    {
      "Pressure_mb": 397.8,
      "Altitude_m": 7251,
      "Temp_c": -32.8,
      "Dewpoint_c": -36,
      "Wind_Direction": 246,
      "Wind_Speed_kt": 0.8
    },
    {
      "Pressure_mb": 397.6,
      "Altitude_m": 7255,
      "Temp_c": -32.8,
      "Dewpoint_c": -36.1,
      "Wind_Direction": 246,
      "Wind_Speed_kt": 0.8
    },
    {
      "Pressure_mb": 397.4,
      "Altitude_m": 7259,
      "Temp_c": -32.9,
      "Dewpoint_c": -36.1,
      "Wind_Direction": 246,
      "Wind_Speed_kt": 0.8
    },
    {
      "Pressure_mb": 397.1,
      "Altitude_m": 7264,
      "Temp_c": -32.9,
      "Dewpoint_c": -36.1,
      "Wind_Direction": 246,
      "Wind_Speed_kt": 0.8
    },
    {
      "Pressure_mb": 396.9,
      "Altitude_m": 7268,
      "Temp_c": -32.9,
      "Dewpoint_c": -36.2,
      "Wind_Direction": 246,
      "Wind_Speed_kt": 0.8
    },
    {
      "Pressure_mb": 396.6,
      "Altitude_m": 7272,
      "Temp_c": -32.9,
      "Dewpoint_c": -36.2,
      "Wind_Direction": 246,
      "Wind_Speed_kt": 0.8
    },
    {
      "Pressure_mb": 396.4,
      "Altitude_m": 7276,
      "Temp_c": -33,
      "Dewpoint_c": -36.2,
      "Wind_Direction": 246,
      "Wind_Speed_kt": 0.8
    },
    {
      "Pressure_mb": 396.2,
      "Altitude_m": 7281,
      "Temp_c": -33,
      "Dewpoint_c": -36.3,
      "Wind_Direction": 246,
      "Wind_Speed_kt": 0.8
    },
    {
      "Pressure_mb": 395.9,
      "Altitude_m": 7285,
      "Temp_c": -33,
      "Dewpoint_c": -36.3,
      "Wind_Direction": 246,
      "Wind_Speed_kt": 0.8
    },
    {
      "Pressure_mb": 395.7,
      "Altitude_m": 7289,
      "Temp_c": -33.1,
      "Dewpoint_c": -36.3,
      "Wind_Direction": 246,
      "Wind_Speed_kt": 0.8
    },
    {
      "Pressure_mb": 395.5,
      "Altitude_m": 7293,
      "Temp_c": -33.1,
      "Dewpoint_c": -36.4,
      "Wind_Direction": 246,
      "Wind_Speed_kt": 0.8
    },
    {
      "Pressure_mb": 395.2,
      "Altitude_m": 7297,
      "Temp_c": -33.1,
      "Dewpoint_c": -36.4,
      "Wind_Direction": 246,
      "Wind_Speed_kt": 0.8
    },
    {
      "Pressure_mb": 395,
      "Altitude_m": 7301,
      "Temp_c": -33.1,
      "Dewpoint_c": -36.4,
      "Wind_Direction": 246,
      "Wind_Speed_kt": 0.9
    },
    {
      "Pressure_mb": 394.8,
      "Altitude_m": 7305,
      "Temp_c": -33.2,
      "Dewpoint_c": -36.5,
      "Wind_Direction": 246,
      "Wind_Speed_kt": 0.9
    },
    {
      "Pressure_mb": 394.5,
      "Altitude_m": 7309,
      "Temp_c": -33.2,
      "Dewpoint_c": -36.5,
      "Wind_Direction": 246,
      "Wind_Speed_kt": 0.9
    },
    {
      "Pressure_mb": 394.3,
      "Altitude_m": 7313,
      "Temp_c": -33.2,
      "Dewpoint_c": -36.5,
      "Wind_Direction": 246,
      "Wind_Speed_kt": 0.9
    },
    {
      "Pressure_mb": 394.1,
      "Altitude_m": 7317,
      "Temp_c": -33.3,
      "Dewpoint_c": -36.5,
      "Wind_Direction": 246,
      "Wind_Speed_kt": 1
    },
    {
      "Pressure_mb": 393.9,
      "Altitude_m": 7321,
      "Temp_c": -33.3,
      "Dewpoint_c": -36.6,
      "Wind_Direction": 246,
      "Wind_Speed_kt": 1
    },
    {
      "Pressure_mb": 393.6,
      "Altitude_m": 7325,
      "Temp_c": -33.3,
      "Dewpoint_c": -36.6,
      "Wind_Direction": 246,
      "Wind_Speed_kt": 1
    },
    {
      "Pressure_mb": 393.4,
      "Altitude_m": 7329,
      "Temp_c": -33.3,
      "Dewpoint_c": -36.6,
      "Wind_Direction": 246,
      "Wind_Speed_kt": 1
    },
    {
      "Pressure_mb": 393.2,
      "Altitude_m": 7334,
      "Temp_c": -33.4,
      "Dewpoint_c": -36.7,
      "Wind_Direction": 245,
      "Wind_Speed_kt": 1
    },
    {
      "Pressure_mb": 393,
      "Altitude_m": 7338,
      "Temp_c": -33.4,
      "Dewpoint_c": -36.7,
      "Wind_Direction": 245,
      "Wind_Speed_kt": 1.1
    },
    {
      "Pressure_mb": 392.8,
      "Altitude_m": 7341,
      "Temp_c": -33.4,
      "Dewpoint_c": -36.7,
      "Wind_Direction": 245,
      "Wind_Speed_kt": 1.1
    },
    {
      "Pressure_mb": 392.5,
      "Altitude_m": 7345,
      "Temp_c": -33.4,
      "Dewpoint_c": -36.7,
      "Wind_Direction": 245,
      "Wind_Speed_kt": 1.1
    },
    {
      "Pressure_mb": 392.3,
      "Altitude_m": 7349,
      "Temp_c": -33.5,
      "Dewpoint_c": -36.8,
      "Wind_Direction": 245,
      "Wind_Speed_kt": 1.1
    },
    {
      "Pressure_mb": 392.1,
      "Altitude_m": 7353,
      "Temp_c": -33.5,
      "Dewpoint_c": -36.8,
      "Wind_Direction": 245,
      "Wind_Speed_kt": 1.2
    },
    {
      "Pressure_mb": 391.9,
      "Altitude_m": 7356,
      "Temp_c": -33.5,
      "Dewpoint_c": -36.8,
      "Wind_Direction": 245,
      "Wind_Speed_kt": 1.2
    },
    {
      "Pressure_mb": 391.7,
      "Altitude_m": 7360,
      "Temp_c": -33.5,
      "Dewpoint_c": -36.8,
      "Wind_Direction": 245,
      "Wind_Speed_kt": 1.2
    },
    {
      "Pressure_mb": 391.5,
      "Altitude_m": 7364,
      "Temp_c": -33.5,
      "Dewpoint_c": -36.9,
      "Wind_Direction": 245,
      "Wind_Speed_kt": 1.2
    },
    {
      "Pressure_mb": 391.3,
      "Altitude_m": 7368,
      "Temp_c": -33.6,
      "Dewpoint_c": -36.9,
      "Wind_Direction": 245,
      "Wind_Speed_kt": 1.3
    },
    {
      "Pressure_mb": 391.1,
      "Altitude_m": 7371,
      "Temp_c": -33.6,
      "Dewpoint_c": -36.9,
      "Wind_Direction": 245,
      "Wind_Speed_kt": 1.3
    },
    {
      "Pressure_mb": 390.8,
      "Altitude_m": 7375,
      "Temp_c": -33.6,
      "Dewpoint_c": -36.9,
      "Wind_Direction": 245,
      "Wind_Speed_kt": 1.4
    },
    {
      "Pressure_mb": 390.6,
      "Altitude_m": 7379,
      "Temp_c": -33.6,
      "Dewpoint_c": -36.9,
      "Wind_Direction": 245,
      "Wind_Speed_kt": 1.4
    },
    {
      "Pressure_mb": 390.4,
      "Altitude_m": 7383,
      "Temp_c": -33.7,
      "Dewpoint_c": -37,
      "Wind_Direction": 245,
      "Wind_Speed_kt": 1.4
    },
    {
      "Pressure_mb": 390.2,
      "Altitude_m": 7387,
      "Temp_c": -33.7,
      "Dewpoint_c": -37,
      "Wind_Direction": 245,
      "Wind_Speed_kt": 1.5
    },
    {
      "Pressure_mb": 390,
      "Altitude_m": 7391,
      "Temp_c": -33.7,
      "Dewpoint_c": -37,
      "Wind_Direction": 245,
      "Wind_Speed_kt": 1.5
    },
    {
      "Pressure_mb": 389.7,
      "Altitude_m": 7395,
      "Temp_c": -33.7,
      "Dewpoint_c": -37,
      "Wind_Direction": 245,
      "Wind_Speed_kt": 1.6
    },
    {
      "Pressure_mb": 389.5,
      "Altitude_m": 7399,
      "Temp_c": -33.7,
      "Dewpoint_c": -37,
      "Wind_Direction": 245,
      "Wind_Speed_kt": 1.6
    },
    {
      "Pressure_mb": 389.3,
      "Altitude_m": 7403,
      "Temp_c": -33.8,
      "Dewpoint_c": -37.1,
      "Wind_Direction": 245,
      "Wind_Speed_kt": 1.6
    },
    {
      "Pressure_mb": 389.1,
      "Altitude_m": 7408,
      "Temp_c": -33.8,
      "Dewpoint_c": -37.1,
      "Wind_Direction": 245,
      "Wind_Speed_kt": 1.7
    },
    {
      "Pressure_mb": 388.8,
      "Altitude_m": 7412,
      "Temp_c": -33.8,
      "Dewpoint_c": -37.1,
      "Wind_Direction": 245,
      "Wind_Speed_kt": 1.7
    },
    {
      "Pressure_mb": 388.6,
      "Altitude_m": 7416,
      "Temp_c": -33.8,
      "Dewpoint_c": -37.1,
      "Wind_Direction": 245,
      "Wind_Speed_kt": 1.7
    },
    {
      "Pressure_mb": 388.4,
      "Altitude_m": 7420,
      "Temp_c": -33.8,
      "Dewpoint_c": -37.2,
      "Wind_Direction": 245,
      "Wind_Speed_kt": 1.8
    },
    {
      "Pressure_mb": 388.2,
      "Altitude_m": 7424,
      "Temp_c": -33.9,
      "Dewpoint_c": -37.2,
      "Wind_Direction": 245,
      "Wind_Speed_kt": 1.8
    },
    {
      "Pressure_mb": 387.9,
      "Altitude_m": 7428,
      "Temp_c": -33.9,
      "Dewpoint_c": -37.2,
      "Wind_Direction": 245,
      "Wind_Speed_kt": 1.9
    },
    {
      "Pressure_mb": 387.7,
      "Altitude_m": 7432,
      "Temp_c": -33.9,
      "Dewpoint_c": -37.2,
      "Wind_Direction": 245,
      "Wind_Speed_kt": 1.9
    },
    {
      "Pressure_mb": 387.5,
      "Altitude_m": 7436,
      "Temp_c": -33.9,
      "Dewpoint_c": -37.2,
      "Wind_Direction": 245,
      "Wind_Speed_kt": 1.9
    },
    {
      "Pressure_mb": 387.2,
      "Altitude_m": 7440,
      "Temp_c": -34,
      "Dewpoint_c": -37.3,
      "Wind_Direction": 245,
      "Wind_Speed_kt": 2
    },
    {
      "Pressure_mb": 387,
      "Altitude_m": 7445,
      "Temp_c": -34,
      "Dewpoint_c": -37.3,
      "Wind_Direction": 245,
      "Wind_Speed_kt": 2
    },
    {
      "Pressure_mb": 386.8,
      "Altitude_m": 7449,
      "Temp_c": -34,
      "Dewpoint_c": -37.3,
      "Wind_Direction": 245,
      "Wind_Speed_kt": 2
    },
    {
      "Pressure_mb": 386.6,
      "Altitude_m": 7453,
      "Temp_c": -34,
      "Dewpoint_c": -37.4,
      "Wind_Direction": 245,
      "Wind_Speed_kt": 2.1
    },
    {
      "Pressure_mb": 386.3,
      "Altitude_m": 7457,
      "Temp_c": -34.1,
      "Dewpoint_c": -37.4,
      "Wind_Direction": 244,
      "Wind_Speed_kt": 2.1
    },
    {
      "Pressure_mb": 386.1,
      "Altitude_m": 7460,
      "Temp_c": -34.1,
      "Dewpoint_c": -37.4,
      "Wind_Direction": 244,
      "Wind_Speed_kt": 2.2
    },
    {
      "Pressure_mb": 385.9,
      "Altitude_m": 7464,
      "Temp_c": -34.1,
      "Dewpoint_c": -37.5,
      "Wind_Direction": 244,
      "Wind_Speed_kt": 2.2
    },
    {
      "Pressure_mb": 385.7,
      "Altitude_m": 7468,
      "Temp_c": -34.2,
      "Dewpoint_c": -37.5,
      "Wind_Direction": 244,
      "Wind_Speed_kt": 2.2
    },
    {
      "Pressure_mb": 385.4,
      "Altitude_m": 7473,
      "Temp_c": -34.2,
      "Dewpoint_c": -37.5,
      "Wind_Direction": 244,
      "Wind_Speed_kt": 2.3
    },
    {
      "Pressure_mb": 385.2,
      "Altitude_m": 7478,
      "Temp_c": -34.2,
      "Dewpoint_c": -37.6,
      "Wind_Direction": 244,
      "Wind_Speed_kt": 2.3
    },
    {
      "Pressure_mb": 384.9,
      "Altitude_m": 7482,
      "Temp_c": -34.2,
      "Dewpoint_c": -37.6,
      "Wind_Direction": 244,
      "Wind_Speed_kt": 2.4
    },
    {
      "Pressure_mb": 384.7,
      "Altitude_m": 7487,
      "Temp_c": -34.3,
      "Dewpoint_c": -37.6,
      "Wind_Direction": 243,
      "Wind_Speed_kt": 2.4
    },
    {
      "Pressure_mb": 384.4,
      "Altitude_m": 7491,
      "Temp_c": -34.3,
      "Dewpoint_c": -37.7,
      "Wind_Direction": 243,
      "Wind_Speed_kt": 2.5
    },
    {
      "Pressure_mb": 384.2,
      "Altitude_m": 7496,
      "Temp_c": -34.3,
      "Dewpoint_c": -37.7,
      "Wind_Direction": 243,
      "Wind_Speed_kt": 2.5
    },
    {
      "Pressure_mb": 383.9,
      "Altitude_m": 7501,
      "Temp_c": -34.4,
      "Dewpoint_c": -37.8,
      "Wind_Direction": 243,
      "Wind_Speed_kt": 2.5
    },
    {
      "Pressure_mb": 383.6,
      "Altitude_m": 7506,
      "Temp_c": -34.4,
      "Dewpoint_c": -37.8,
      "Wind_Direction": 243,
      "Wind_Speed_kt": 2.6
    },
    {
      "Pressure_mb": 383.4,
      "Altitude_m": 7511,
      "Temp_c": -34.4,
      "Dewpoint_c": -37.8,
      "Wind_Direction": 243,
      "Wind_Speed_kt": 2.6
    },
    {
      "Pressure_mb": 383.1,
      "Altitude_m": 7515,
      "Temp_c": -34.5,
      "Dewpoint_c": -37.9,
      "Wind_Direction": 243,
      "Wind_Speed_kt": 2.7
    },
    {
      "Pressure_mb": 382.8,
      "Altitude_m": 7520,
      "Temp_c": -34.5,
      "Dewpoint_c": -37.9,
      "Wind_Direction": 242,
      "Wind_Speed_kt": 2.7
    },
    {
      "Pressure_mb": 382.6,
      "Altitude_m": 7525,
      "Temp_c": -34.5,
      "Dewpoint_c": -38,
      "Wind_Direction": 242,
      "Wind_Speed_kt": 2.7
    },
    {
      "Pressure_mb": 382.4,
      "Altitude_m": 7529,
      "Temp_c": -34.6,
      "Dewpoint_c": -38,
      "Wind_Direction": 242,
      "Wind_Speed_kt": 2.8
    },
    {
      "Pressure_mb": 382.1,
      "Altitude_m": 7533,
      "Temp_c": -34.6,
      "Dewpoint_c": -38,
      "Wind_Direction": 242,
      "Wind_Speed_kt": 2.8
    },
    {
      "Pressure_mb": 381.9,
      "Altitude_m": 7537,
      "Temp_c": -34.6,
      "Dewpoint_c": -38.1,
      "Wind_Direction": 242,
      "Wind_Speed_kt": 2.9
    },
    {
      "Pressure_mb": 381.7,
      "Altitude_m": 7541,
      "Temp_c": -34.7,
      "Dewpoint_c": -38.1,
      "Wind_Direction": 242,
      "Wind_Speed_kt": 2.9
    },
    {
      "Pressure_mb": 381.5,
      "Altitude_m": 7544,
      "Temp_c": -34.7,
      "Dewpoint_c": -38.1,
      "Wind_Direction": 242,
      "Wind_Speed_kt": 2.9
    },
    {
      "Pressure_mb": 381.3,
      "Altitude_m": 7548,
      "Temp_c": -34.7,
      "Dewpoint_c": -38.2,
      "Wind_Direction": 242,
      "Wind_Speed_kt": 3
    },
    {
      "Pressure_mb": 381.1,
      "Altitude_m": 7553,
      "Temp_c": -34.8,
      "Dewpoint_c": -38.2,
      "Wind_Direction": 242,
      "Wind_Speed_kt": 3
    },
    {
      "Pressure_mb": 380.8,
      "Altitude_m": 7557,
      "Temp_c": -34.8,
      "Dewpoint_c": -38.3,
      "Wind_Direction": 242,
      "Wind_Speed_kt": 3.1
    },
    {
      "Pressure_mb": 380.6,
      "Altitude_m": 7561,
      "Temp_c": -34.8,
      "Dewpoint_c": -38.3,
      "Wind_Direction": 242,
      "Wind_Speed_kt": 3.1
    },
    {
      "Pressure_mb": 380.4,
      "Altitude_m": 7565,
      "Temp_c": -34.9,
      "Dewpoint_c": -38.3,
      "Wind_Direction": 242,
      "Wind_Speed_kt": 3.1
    },
    {
      "Pressure_mb": 380.2,
      "Altitude_m": 7568,
      "Temp_c": -34.9,
      "Dewpoint_c": -38.4,
      "Wind_Direction": 242,
      "Wind_Speed_kt": 3.2
    },
    {
      "Pressure_mb": 379.9,
      "Altitude_m": 7573,
      "Temp_c": -34.9,
      "Dewpoint_c": -38.4,
      "Wind_Direction": 242,
      "Wind_Speed_kt": 3.2
    },
    {
      "Pressure_mb": 379.7,
      "Altitude_m": 7577,
      "Temp_c": -35,
      "Dewpoint_c": -38.4,
      "Wind_Direction": 242,
      "Wind_Speed_kt": 3.2
    },
    {
      "Pressure_mb": 379.5,
      "Altitude_m": 7581,
      "Temp_c": -35,
      "Dewpoint_c": -38.5,
      "Wind_Direction": 242,
      "Wind_Speed_kt": 3.3
    },
    {
      "Pressure_mb": 379.3,
      "Altitude_m": 7585,
      "Temp_c": -35,
      "Dewpoint_c": -38.5,
      "Wind_Direction": 242,
      "Wind_Speed_kt": 3.3
    },
    {
      "Pressure_mb": 379,
      "Altitude_m": 7589,
      "Temp_c": -35.1,
      "Dewpoint_c": -38.5,
      "Wind_Direction": 242,
      "Wind_Speed_kt": 3.4
    },
    {
      "Pressure_mb": 378.8,
      "Altitude_m": 7594,
      "Temp_c": -35.1,
      "Dewpoint_c": -38.5,
      "Wind_Direction": 242,
      "Wind_Speed_kt": 3.4
    },
    {
      "Pressure_mb": 378.6,
      "Altitude_m": 7598,
      "Temp_c": -35.1,
      "Dewpoint_c": -38.6,
      "Wind_Direction": 242,
      "Wind_Speed_kt": 3.4
    }
  ],
  "soaringForecast": "<!DOCTYPE html><html class=\"no-js\">\n    <head>\n        <!-- Meta -->\n        <meta name=\"viewport\" content=\"width=device-width\" />\n        <link rel=\"schema.DC\" href=\"http://purl.org/dc/elements/1.1/\" />\n        <title>National Weather Service</title>\n        <meta name=\"DC.title\" content=\"National Weather Service\" />\n        <meta name=\"DC.description\" content=\"NOAA National Weather Service\" />\n        <meta name=\"DC.creator\" content=\"US Department of Commerce, NOAA, National Weather Service\" />\n        <meta name=\"DC.date.created\" scheme=\"ISO8601\" content=\"2026-01-04T21:44:01+00:00\" />\n        <meta name=\"DC.language\" scheme=\"DCTERMS.RFC1766\" content=\"EN-US\" />\n        <meta name=\"DC.keywords\" content=\"weather\" />\n        <meta name=\"DC.publisher\" content=\"NOAA's National Weather Service\" />\n        <meta name=\"DC.contributor\" content=\"National Weather Service\" />\n        <meta name=\"DC.rights\" content=\"/disclaimer.php\" />\n        <meta name=\"rating\" content=\"General\" />\n        <meta name=\"robots\" content=\"index,follow\" />\n\n        <!-- Icons -->\n        <link rel=\"shortcut icon\" href=\"/build/images/favicon.eab6deff.ico\" type=\"image/x-icon\" />\n\n                    <link rel=\"stylesheet\" href=\"/build/app.b5803bc3.css\">\n        \n                    <script src=\"/build/runtime.5332280c.js\"></script><script src=\"/build/662.4c16084d.js\"></script><script src=\"/build/app.b0ab6b61.js\"></script>\n            <script type=\"text/javascript\" id=\"_fed_an_ua_tag\" src=\"https://dap.digitalgov.gov/Universal-Federated-Analytics-Min.js?agency=DOC&amp;subagency=NOAA\"></script>\n            <script type=\"text/javascript\">\n                // GoogleAnalyticsObject is defined in the federated analytics script, but PUA option not used as forecast UA needs sampleRate\n                window[window['GoogleAnalyticsObject']]('create', 'UA-40768555-1', 'weather.gov', {'sampleRate': 6});\n                window[window['GoogleAnalyticsObject']]('set', 'anonymizeIp', true);\n                window[window['GoogleAnalyticsObject']]('require', 'linkid');\n                window[window['GoogleAnalyticsObject']]('send', 'pageview');\n            </script>\n            </head>\n    <body>\n        <main class=\"container\">\n            <header class=\"row clearfix\" id=\"page-header\">\n    <a href=\"//www.noaa.gov\" id=\"header-noaa\" class=\"pull-left\"><img src=\"/build/images/header/noaa.d87e0251.png\" alt=\"National Oceanic and Atmospheric Administration\"/></a>\n    <a href=\"https://www.weather.gov\" id=\"header-nws\" class=\"pull-left\"><img src=\"/build/images/header/nws.4e6585d8.png\" alt=\"National Weather Service\"/></a>\n    <a href=\"//www.commerce.gov\" id=\"header-doc\" class=\"pull-right\"><img src=\"/build/images/header/doc.b38ba91a.png\" alt=\"United States Department of Commerce\"/></a>\n</header>\n\n            <nav class=\"navbar navbar-default row\" role=\"navigation\">\n    <div class=\"container-fluid\">\n        <div class=\"navbar-header\">\n            <button type=\"button\" class=\"navbar-toggle collapsed\" data-toggle=\"collapse\" data-target=\"#top-nav\">\n                <span class=\"sr-only\">Toggle navigation</span>\n                <span class=\"icon-bar\"></span>\n                <span class=\"icon-bar\"></span>\n                <span class=\"icon-bar\"></span>\n            </button>\n        </div>\n        <div class=\"collapse navbar-collapse\" id=\"top-nav\">\n            <ul class=\"nav navbar-nav\">\n                <li><a href=\"//www.weather.gov\">HOME</a></li>\n                                    <li class=\"dropdown\">\n                        <a href=\"https://www.weather.gov/forecastmaps/\" class=\"dropdown-toggle\" data-toggle=\"dropdown\">\n                                                            FORECAST\n                                                        <span class=\"caret\"></span>\n                        </a>\n                        <ul class=\"dropdown-menu\" role=\"menu\">\n                                                                                        <li>\n                                    <a href=\"https://www.weather.gov\">Local</a>\n                                </li>\n                                                            <li>\n                                    <a href=\"https://digital.weather.gov\">Graphical</a>\n                                </li>\n                                                            <li>\n                                    <a href=\"https://aviationweather.gov\">Aviation</a>\n                                </li>\n                                                            <li>\n                                    <a href=\"https://www.weather.gov/marine/\">Marine</a>\n                                </li>\n                                                            <li>\n                                    <a href=\"https://water.noaa.gov\">Rivers and Lakes</a>\n                                </li>\n                                                            <li>\n                                    <a href=\"https://www.nhc.noaa.gov\">Hurricanes</a>\n                                </li>\n                                                            <li>\n                                    <a href=\"https://www.spc.noaa.gov\">Severe Weather</a>\n                                </li>\n                                                            <li>\n                                    <a href=\"https://www.weather.gov/fire/\">Fire Weather</a>\n                                </li>\n                                                            <li>\n                                    <a href=\"https://gml.noaa.gov/grad/solcalc/\">Sunrise/Sunset</a>\n                                </li>\n                                                            <li>\n                                    <a href=\"https://www.cpc.ncep.noaa.gov\">Long Range Forecasts</a>\n                                </li>\n                                                            <li>\n                                    <a href=\"https://www.cpc.ncep.noaa.gov\">Climate Prediction</a>\n                                </li>\n                                                            <li>\n                                    <a href=\"https://www.swpc.noaa.gov\">Space Weather</a>\n                                </li>\n                                                    </ul>\n                    </li>\n                                    <li class=\"dropdown\">\n                        <a href=\"https://www.weather.gov/wrh/climate\" class=\"dropdown-toggle\" data-toggle=\"dropdown\">\n                                                            PAST WEATHER\n                                                        <span class=\"caret\"></span>\n                        </a>\n                        <ul class=\"dropdown-menu\" role=\"menu\">\n                                                                                        <li>\n                                    <a href=\"https://www.weather.gov/wrh/climate\">Past Weather</a>\n                                </li>\n                                                            <li>\n                                    <a href=\"https://gml.noaa.gov/grad/solcalc/\">Astronomical Data</a>\n                                </li>\n                                                            <li>\n                                    <a href=\"https://www.climate.gov/maps-data/dataset/past-weather-zip-code-data-table\">Certified Weather Data</a>\n                                </li>\n                                                    </ul>\n                    </li>\n                                    <li class=\"dropdown\">\n                        <a href=\"https://www.weather.gov/safety/\" class=\"dropdown-toggle\" data-toggle=\"dropdown\">\n                                                            SAFETY\n                                                        <span class=\"caret\"></span>\n                        </a>\n                        <ul class=\"dropdown-menu\" role=\"menu\">\n                                                                                </ul>\n                    </li>\n                                    <li class=\"dropdown\">\n                        <a href=\"https://www.weather.gov/informationcenter\" class=\"dropdown-toggle\" data-toggle=\"dropdown\">\n                                                            INFORMATION\n                                                        <span class=\"caret\"></span>\n                        </a>\n                        <ul class=\"dropdown-menu\" role=\"menu\">\n                                                                                        <li>\n                                    <a href=\"https://www.weather.gov/wrn/wea\">Wireless Emergency Alerts</a>\n                                </li>\n                                                            <li>\n                                    <a href=\"https://www.weather.gov/wrn/\">Weather-Ready Nation</a>\n                                </li>\n                                                            <li>\n                                    <a href=\"https://www.weather.gov/owlie/publication_brochures\">Brochures</a>\n                                </li>\n                                                            <li>\n                                    <a href=\"https://www.weather.gov/coop/\">Cooperative Observers</a>\n                                </li>\n                                                            <li>\n                                    <a href=\"https://www.weather.gov/briefing/\">Daily Briefing</a>\n                                </li>\n                                                            <li>\n                                    <a href=\"https://www.weather.gov/hazstat\">Damage/Fatality/Injury Statistics</a>\n                                </li>\n                                                            <li>\n                                    <a href=\"http://mag.ncep.noaa.gov\">Forecast Models</a>\n                                </li>\n                                                            <li>\n                                    <a href=\"https://www.weather.gov/gis/\">GIS Data Portal</a>\n                                </li>\n                                                            <li>\n                                    <a href=\"https://www.weather.gov/nwr\">NOAA Weather Radio</a>\n                                </li>\n                                                            <li>\n                                    <a href=\"https://www.weather.gov/publications/\">Publications</a>\n                                </li>\n                                                            <li>\n                                    <a href=\"https://www.weather.gov/skywarn/\">SKYWARN Storm Spotters</a>\n                                </li>\n                                                            <li>\n                                    <a href=\"https://www.weather.gov/stormready\">StormReady</a>\n                                </li>\n                                                            <li>\n                                    <a href=\"https://www.weather.gov/tsunamiready/\">TsunamiReady</a>\n                                </li>\n                                                            <li>\n                                    <a href=\"https://www.weather.gov/notification/\">Service Change Notices</a>\n                                </li>\n                                                    </ul>\n                    </li>\n                                    <li class=\"dropdown\">\n                        <a href=\"https://www.weather.gov/education/\" class=\"dropdown-toggle\" data-toggle=\"dropdown\">\n                                                            EDUCATION\n                                                        <span class=\"caret\"></span>\n                        </a>\n                        <ul class=\"dropdown-menu\" role=\"menu\">\n                                                                                </ul>\n                    </li>\n                                    <li class=\"dropdown\">\n                        <a href=\"https://www.weather.gov/news\" class=\"dropdown-toggle\" data-toggle=\"dropdown\">\n                                                            NEWS\n                                                        <span class=\"caret\"></span>\n                        </a>\n                        <ul class=\"dropdown-menu\" role=\"menu\">\n                                                                                </ul>\n                    </li>\n                                    <li class=\"dropdown\">\n                        <a href=\"https://www.weather.gov/search/\" class=\"dropdown-toggle\" data-toggle=\"dropdown\">\n                                                            SEARCH\n                                                        <span class=\"caret\"></span>\n                        </a>\n                        <ul class=\"dropdown-menu\" role=\"menu\">\n                                                            <li>\n                                    <div id=\"site-search\">\n                                        <form method=\"get\" action=\"//search.usa.gov/search\" style=\"margin-bottom: 0; margin-top: 0;\">\n                                            <input type=\"hidden\" name=\"v:project\" value=\"firstgov\" />\n                                            <label for=\"query\">Search For</label>\n                                            <input type=\"text\" name=\"query\" id=\"query\" size=\"12\" />\n                                            <input type=\"submit\" value=\"Go\" />\n                                            <p>\n                                                <input type=\"radio\" name=\"affiliate\" checked=\"checked\" value=\"nws.noaa.gov\" id=\"nws\" />\n                                                <label for=\"nws\" class=\"search-scope\">NWS</label>\n                                                <input type=\"radio\" name=\"affiliate\" value=\"noaa.gov\" id=\"noaa\" />\n                                                <label for=\"noaa\" class=\"search-scope\">All NOAA</label>\n                                            </p>\n                                        </form>\n                                    </div>\n                                </li>\n                                                                                </ul>\n                    </li>\n                                    <li class=\"dropdown\">\n                        <a href=\"https://www.weather.gov/about/\" class=\"dropdown-toggle\" data-toggle=\"dropdown\">\n                                                            ABOUT\n                                                        <span class=\"caret\"></span>\n                        </a>\n                        <ul class=\"dropdown-menu\" role=\"menu\">\n                                                                                        <li>\n                                    <a href=\"https://www.weather.gov/about/\">About NWS</a>\n                                </li>\n                                                            <li>\n                                    <a href=\"https://www.weather.gov/organization\">Organization</a>\n                                </li>\n                                                            <li>\n                                    <a href=\"https://sites.google.com/a/noaa.gov/nws-insider/\">For NWS Employees</a>\n                                </li>\n                                                            <li>\n                                    <a href=\"https://www.weather.gov/ncep/\">National Centers</a>\n                                </li>\n                                                            <li>\n                                    <a href=\"https://www.noaa.gov/nws-careers\">Careers</a>\n                                </li>\n                                                            <li>\n                                    <a href=\"https://www.weather.gov/contact\">Contact Us</a>\n                                </li>\n                                                            <li>\n                                    <a href=\"https://forecast.weather.gov/glossary.php\">Glossary</a>\n                                </li>\n                                                            <li>\n                                    <a href=\"https://www.weather.gov/socialmedia\">Social Media</a>\n                                </li>\n                                                            <li>\n                                    <a href=\"https://www.noaa.gov/NWStransformation\">NWS Transformation</a>\n                                </li>\n                                                    </ul>\n                    </li>\n                            </ul>\n        </div>\n    </div>\n</nav>\n\n            <div class=\"contentArea\">\n                    \n        <span style=\"font-size: 20px; font-weight:bold;\">Soaring Guidance </span><br />Issued by NWS Salt Lake City, UT\n        <br />\n        <br />\n        <div>\n                    <a href=\"/\">Home</a>&nbsp;|&nbsp;\n                    <b>Current Version</b>&nbsp;|&nbsp;\n                    <a href=\"?site=SLC&issuedby=SLC&product=SRG&format=TXT&version=2&glossary=0\">Previous Version</a>&nbsp;|&nbsp;\n                    <a href=\"?site=SLC&issuedby=SLC&product=SRG&format=ci&version=1&glossary=0\">Graphics & Text</a>&nbsp;|&nbsp;\n                    <a href=\"javascript:window.print()\">Print</a>&nbsp;|&nbsp;<a href=\"product_types.php?site=SLC\">Product List</a>&nbsp;|&nbsp;\n                    <a href=\"?site=SLC&issuedby=SLC&product=SRG&format=TXT&version=1&glossary=1\">Glossary On</a></div>\n                <div>Versions:\n                            <b>1</b> \n                            \n<a href=\"?site=SLC&issuedby=SLC&product=SRG&format=TXT&version=2&glossary=0\">2</a> \n                            \n<a href=\"?site=SLC&issuedby=SLC&product=SRG&format=TXT&version=3&glossary=0\">3</a> \n                            \n<a href=\"?site=SLC&issuedby=SLC&product=SRG&format=TXT&version=4&glossary=0\">4</a> \n                            \n<a href=\"?site=SLC&issuedby=SLC&product=SRG&format=TXT&version=5&glossary=0\">5</a> \n                            \n<a href=\"?site=SLC&issuedby=SLC&product=SRG&format=TXT&version=6&glossary=0\">6</a> \n                            \n<a href=\"?site=SLC&issuedby=SLC&product=SRG&format=TXT&version=7&glossary=0\">7</a> \n                    <hr size=\"1\" width=\"520\" noshade=\"noshade\" align=\"left\" />\n        </div>\n        <pre class=\"glossaryProduct\">\n176\nUXUS97 KSLC 041227\nSRGSLC\n\nSoaring Forecast\nNational Weather Service Salt Lake City, Utah\n527 AM MST Sunday, January 4, 2026\n\nThis forecast is for Sunday, January 4, 2026:\n\nIf the trigger temperature of 47.6 F/8.7 C is reached...then\n   Thermal Soaring Index....................... Poor\n   Maximum rate of lift........................ 58 ft/min (0.3 m/s)\n   Maximum height of thermals.................. 11101 ft MSL (6175 ft AGL)\n\nForecast maximum temperature................... 52.0 F/11.6 C\nTime of trigger temperature.................... 0900 MST\nTime of overdevelopment........................ None\nMiddle/high clouds during soaring window....... Broken/overcast opaque middle\nSurface winds during soaring window............ 20 mph or less\nHeight of the -3 thermal index................. 8384 ft MSL (3458 ft AGL)\nThermal soaring outlook for Monday 01/05....... Poor\n\nWave Soaring Index............................. Not available\n\nRemarks...\n\nSunrise/Sunset.................... 07:52:12 / 17:13:36 MST\nTotal possible sunshine........... 9 hr 21 min 24 sec (561 min 24 sec)\nAltitude of sun at 12:32:54 MST... 26.11 degrees\n\nUpper air data from rawinsonde observation taken on 01/04/2026 at 0500 MST\n\nFreezing level.................. 7216 ft MSL (2290 ft AGL)\nConvective condensation level... 8355 ft MSL (3429 ft AGL)\nLifted condensation level....... 9638 ft MSL (4711 ft AGL)\nLifted index.................... -1.1\nK index......................... +24.5\n\nHeight  Temperature  Wind  Wind Spd  Lapse Rate  ConvectionT  Thermal  Lift Rate\nft MSL  deg C deg F   Dir   kt  m/s  C/km F/kft  deg C deg F   Index    fpm  m/s\n--------------------------------------------------------------------------------\n 26000  -41.6 -42.9   230   64   33   7.7   4.2   23.2  73.7     9.4      M    M\n 24000  -37.0 -34.6   235   53   27   7.6   4.2   21.5  70.7     8.3      M    M\n 22000  -32.3 -26.1   230   40   21   6.8   3.7   19.2  66.6     6.6      M    M\n 20000  -27.9 -18.2   230   32   16   8.5   4.6   17.6  63.6     5.4      M    M\n 18000  -22.9  -9.2   230   29   15   8.4   4.6   16.7  62.1     4.7      M    M\n 16000  -18.1  -0.6   235   27   14   7.8   4.3   15.6  60.1     3.8      M    M\n 14000  -13.6   7.5   240   25   13   7.7   4.2   14.2  57.6     2.5      M    M\n 12000   -9.3  15.3   245   23   12   7.1   3.9   12.6  54.7     0.9      M    M\n 10000   -5.4  22.3   245   22   11   7.0   3.8   10.7  51.2    -1.0    368  1.9\n  9000   -3.6  25.5   235   23   12   6.9   3.8    9.6  49.2    -2.1    284  1.4\n  8000   -1.3  29.7   225   23   12   6.9   3.8    8.3  46.9    -3.5    177  0.9\n  7000    0.6  33.1   210   22   11   6.8   3.7    7.3  45.1    -4.6     91  0.5\n  6000    2.4  36.3   195   16    8   8.9   4.9    6.1  43.0    -5.8      9  0.0\n  5000    4.6  40.3   180    8    4   7.9   4.4    5.5  41.9    -6.5      M    M\n\n * * * * * * Numerical weather prediction model forecast data valid * * * * * *\n\n           01/04/2026 at 0800 MST          |       01/04/2026 at 1100 MST\n                                           |\nCAPE...   +17.5    LI...       -0.3        | CAPE...   +69.1    LI...       +0.2\nCINH...   -20.0    K Index... +19.2        | CINH...   -23.4    K Index... +17.2\n                                           |\nHeight Temperature  Wnd WndSpd  Lapse Rate | Temperature  Wnd WndSpd  Lapse Rate\nft MSL deg C deg F  Dir kt m/s  C/km F/kft | deg C deg F  Dir kt m/s  C/km F/kft\n--------------------------------------------------------------------------------\n 26000 -35.7 -32.3  250  73 38   6.6   3.6 | -34.8 -30.6  245  80 41   6.6   3.6\n 24000 -31.7 -25.1  245  67 35   6.6   3.6 | -30.9 -23.6  240  72 37   6.7   3.7\n 22000 -27.7 -17.9  245  59 31   5.8   3.2 | -27.1 -16.8  240  67 34   6.3   3.5\n 20000 -24.0 -11.2  240  52 27   6.6   3.6 | -23.6 -10.5  240  60 31   5.4   3.0\n 18000 -19.8  -3.6  235  44 23   8.2   4.5 | -19.9  -3.8  240  50 26   5.6   3.1\n 16000 -15.3   4.5  235  34 17   6.9   3.8 | -15.8   3.6  240  38 20   8.1   4.5\n 14000 -11.5  11.3  230  24 12   6.5   3.6 | -11.1  12.0  230  29 15   7.1   3.9\n 12000  -7.6  18.3  220  20 10   6.9   3.8 |  -7.5  18.5  220  25 13   6.4   3.5\n 10000  -3.5  25.7  220  19 10   7.6   4.1 |  -3.6  25.5  215  26 14   7.1   3.9\n  9000  -1.2  29.8  220  18 10   8.2   4.5 |  -1.4  29.5  210  26 13   8.2   4.5\n  8000   1.1  34.0  210  18  9   7.4   4.1 |   1.0  33.8  205  25 13   7.8   4.3\n  7000   3.3  37.9  200  19 10   5.5   3.0 |   3.2  37.8  195  24 12   6.5   3.5\n  6000   5.4  41.7  185  20 10   4.8   2.6 |   5.4  41.7  185  23 12   7.3   4.0\n  5000   6.2  43.2  160   9  5   3.8   2.1 |   8.1  46.6  170  11  6   4.1   2.3\n\n           01/04/2026 at 1400 MST          |       01/04/2026 at 1700 MST\n                                           |\nCAPE...  +113.5    LI...        0.0        | CAPE...   +91.2    LI...       +0.6\nCINH...   -15.0    K Index... +18.7        | CINH...   -10.3    K Index... +21.4\n                                           |\nHeight Temperature  Wnd WndSpd  Lapse Rate | Temperature  Wnd WndSpd  Lapse Rate\nft MSL deg C deg F  Dir kt m/s  C/km F/kft | deg C deg F  Dir kt m/s  C/km F/kft\n--------------------------------------------------------------------------------\n 26000 -35.0 -31.0  240  81 42   6.6   3.6 | -36.3 -33.3  235  82 42   7.6   4.2\n 24000 -31.0 -23.8  235  75 38   6.6   3.6 | -31.7 -25.1  235  75 39   7.6   4.2\n 22000 -26.9 -16.4  240  68 35   7.0   3.8 | -27.0 -16.6  235  62 32   6.8   3.7\n 20000 -23.2  -9.8  240  61 31   5.0   2.8 | -23.1  -9.6  235  51 26   6.4   3.5\n 18000 -19.9  -3.8  235  49 25   4.6   2.5 | -19.4  -2.9  235  41 21   5.5   3.0\n 16000 -16.3   2.7  230  38 19   7.5   4.1 | -16.1   3.0  230  36 19   5.7   3.1\n 14000 -11.6  11.1  230  30 15   7.9   4.4 | -12.3   9.9  225  30 16   7.3   4.0\n 12000  -7.5  18.5  225  31 16   6.7   3.7 |  -8.0  17.6  220  34 17   7.1   3.9\n 10000  -3.7  25.3  220  29 15   6.6   3.6 |  -3.8  25.2  215  33 17   7.5   4.1\n  9000  -1.6  29.1  215  28 14   7.9   4.3 |  -1.7  28.9  210  31 16   7.9   4.3\n  8000   0.7  33.3  205  26 14   8.3   4.5 |   0.5  32.9  205  28 14   7.5   4.1\n  7000   3.2  37.8  200  24 12   7.2   3.9 |   2.7  36.9  195  25 13   6.3   3.5\n  6000   5.6  42.1  190  19 10   7.8   4.3 |   5.0  41.0  190  19 10   6.4   3.5\n  5000   8.2  46.8  180  13  7   4.5   2.5 |   7.6  45.7  170   9  5  12.9   7.1\n________________________________________________________________________________\n\nThis product is issued once per day by approximately 0600 MST/0700 MDT\n(1300 UTC). This product is not continuously monitored nor updated after\nthe initial issuance.\n\nThe information contained herein is based on the 1200 UTC rawinsonde observation\nat the Salt Lake City, Utah International Airport and/or numerical weather\nprediction model data representative of the airport. These data may not be\nrepresentative of other areas along the Wasatch Front. Erroneous data such as\nthese should not be used.\n\nThe content and format of this report as well as the issuance times are subject\nto change without prior notice.\n\n042025\n\n\n</pre>\n\n                </div>\n            <footer>\n                                <div class=\"footer-legal\">\n    <div id=\"footerLogo\" class=\"col-xs-12 col-sm-2 col-md-2\">\n        <a href=\"//www.usa.gov\"><img src=\"/css/images/usa_gov.png\" alt=\"usa.gov\" width=\"110\" height=\"30\" /></a>\n    </div>\n    <div class=\"col-xs-12 col-sm-4 col-md-4\">\n        <ul class=\"list-unstyled footer-legal-content\">\n            <li><a href=\"//www.commerce.gov\">US Dept of Commerce</a></li>\n            <li><a href=\"//www.noaa.gov\">National Oceanic and Atmospheric Administration</a></li>\n            <li><a href=\"https://www.weather.gov\">National Weather Service</a></li>\n                        <li>1325 East West Highway<br /></li>\n                        <li>Silver Spring, MD 20910</li>\n            <li><br /><a href=\"https://www.weather.gov/Contact\">Comments? Questions? Please Contact Us.</a></li>\n        </ul>\n    </div>\n    <div class=\"col-xs-12 col-sm-3 col-md-3\">\n        <ul class=\"list-unstyled\">\n            <li><a href=\"https://www.weather.gov/disclaimer\">Disclaimer</a></li>\n            <li><a href=\"//www.cio.noaa.gov/services_programs/info_quality.html\">Information Quality</a></li>\n            <li><a href=\"https://www.weather.gov/help\">Help</a></li>\n            <li><a href=\"//www.weather.gov/glossary\">Glossary</a></li>\n        </ul>\n    </div>\n    <div class=\"col-xs-12 col-sm-3 col-md-3\">\n        <ul class=\"list-unstyled\">\n            <li><a href=\"https://www.weather.gov/privacy\">Privacy Policy</a></li>\n            <li><a href=\"https://www.noaa.gov/foia-freedom-of-information-act\">Freedom of Information Act (FOIA)</a></li>\n            <li><a href=\"https://www.weather.gov/about\">About Us</a></li>\n            <li><a href=\"https://www.weather.gov/careers\">Career Opportunities</a></li>\n        </ul>\n    </div>\n</div>\n\n            </footer>\n        </main>\n    </body>\n</html>\n",
  "areaForecast": "<!DOCTYPE html><html class=\"no-js\">\n    <head>\n        <!-- Meta -->\n        <meta name=\"viewport\" content=\"width=device-width\" />\n        <link rel=\"schema.DC\" href=\"http://purl.org/dc/elements/1.1/\" />\n        <title>National Weather Service</title>\n        <meta name=\"DC.title\" content=\"National Weather Service\" />\n        <meta name=\"DC.description\" content=\"NOAA National Weather Service\" />\n        <meta name=\"DC.creator\" content=\"US Department of Commerce, NOAA, National Weather Service\" />\n        <meta name=\"DC.date.created\" scheme=\"ISO8601\" content=\"2026-01-04T21:44:01+00:00\" />\n        <meta name=\"DC.language\" scheme=\"DCTERMS.RFC1766\" content=\"EN-US\" />\n        <meta name=\"DC.keywords\" content=\"weather\" />\n        <meta name=\"DC.publisher\" content=\"NOAA's National Weather Service\" />\n        <meta name=\"DC.contributor\" content=\"National Weather Service\" />\n        <meta name=\"DC.rights\" content=\"/disclaimer.php\" />\n        <meta name=\"rating\" content=\"General\" />\n        <meta name=\"robots\" content=\"index,follow\" />\n\n        <!-- Icons -->\n        <link rel=\"shortcut icon\" href=\"/build/images/favicon.eab6deff.ico\" type=\"image/x-icon\" />\n\n                    <link rel=\"stylesheet\" href=\"/build/app.b5803bc3.css\">\n        \n                    <script src=\"/build/runtime.5332280c.js\"></script><script src=\"/build/662.4c16084d.js\"></script><script src=\"/build/app.b0ab6b61.js\"></script>\n            <script type=\"text/javascript\" id=\"_fed_an_ua_tag\" src=\"https://dap.digitalgov.gov/Universal-Federated-Analytics-Min.js?agency=DOC&amp;subagency=NOAA\"></script>\n            <script type=\"text/javascript\">\n                // GoogleAnalyticsObject is defined in the federated analytics script, but PUA option not used as forecast UA needs sampleRate\n                window[window['GoogleAnalyticsObject']]('create', 'UA-40768555-1', 'weather.gov', {'sampleRate': 6});\n                window[window['GoogleAnalyticsObject']]('set', 'anonymizeIp', true);\n                window[window['GoogleAnalyticsObject']]('require', 'linkid');\n                window[window['GoogleAnalyticsObject']]('send', 'pageview');\n            </script>\n            </head>\n    <body>\n        <main class=\"container\">\n            <header class=\"row clearfix\" id=\"page-header\">\n    <a href=\"//www.noaa.gov\" id=\"header-noaa\" class=\"pull-left\"><img src=\"/build/images/header/noaa.d87e0251.png\" alt=\"National Oceanic and Atmospheric Administration\"/></a>\n    <a href=\"https://www.weather.gov\" id=\"header-nws\" class=\"pull-left\"><img src=\"/build/images/header/nws.4e6585d8.png\" alt=\"National Weather Service\"/></a>\n    <a href=\"//www.commerce.gov\" id=\"header-doc\" class=\"pull-right\"><img src=\"/build/images/header/doc.b38ba91a.png\" alt=\"United States Department of Commerce\"/></a>\n</header>\n\n            <nav class=\"navbar navbar-default row\" role=\"navigation\">\n    <div class=\"container-fluid\">\n        <div class=\"navbar-header\">\n            <button type=\"button\" class=\"navbar-toggle collapsed\" data-toggle=\"collapse\" data-target=\"#top-nav\">\n                <span class=\"sr-only\">Toggle navigation</span>\n                <span class=\"icon-bar\"></span>\n                <span class=\"icon-bar\"></span>\n                <span class=\"icon-bar\"></span>\n            </button>\n        </div>\n        <div class=\"collapse navbar-collapse\" id=\"top-nav\">\n            <ul class=\"nav navbar-nav\">\n                <li><a href=\"//www.weather.gov\">HOME</a></li>\n                                    <li class=\"dropdown\">\n                        <a href=\"https://www.weather.gov/forecastmaps/\" class=\"dropdown-toggle\" data-toggle=\"dropdown\">\n                                                            FORECAST\n                                                        <span class=\"caret\"></span>\n                        </a>\n                        <ul class=\"dropdown-menu\" role=\"menu\">\n                                                                                        <li>\n                                    <a href=\"https://www.weather.gov\">Local</a>\n                                </li>\n                                                            <li>\n                                    <a href=\"https://digital.weather.gov\">Graphical</a>\n                                </li>\n                                                            <li>\n                                    <a href=\"https://aviationweather.gov\">Aviation</a>\n                                </li>\n                                                            <li>\n                                    <a href=\"https://www.weather.gov/marine/\">Marine</a>\n                                </li>\n                                                            <li>\n                                    <a href=\"https://water.noaa.gov\">Rivers and Lakes</a>\n                                </li>\n                                                            <li>\n                                    <a href=\"https://www.nhc.noaa.gov\">Hurricanes</a>\n                                </li>\n                                                            <li>\n                                    <a href=\"https://www.spc.noaa.gov\">Severe Weather</a>\n                                </li>\n                                                            <li>\n                                    <a href=\"https://www.weather.gov/fire/\">Fire Weather</a>\n                                </li>\n                                                            <li>\n                                    <a href=\"https://gml.noaa.gov/grad/solcalc/\">Sunrise/Sunset</a>\n                                </li>\n                                                            <li>\n                                    <a href=\"https://www.cpc.ncep.noaa.gov\">Long Range Forecasts</a>\n                                </li>\n                                                            <li>\n                                    <a href=\"https://www.cpc.ncep.noaa.gov\">Climate Prediction</a>\n                                </li>\n                                                            <li>\n                                    <a href=\"https://www.swpc.noaa.gov\">Space Weather</a>\n                                </li>\n                                                    </ul>\n                    </li>\n                                    <li class=\"dropdown\">\n                        <a href=\"https://www.weather.gov/wrh/climate\" class=\"dropdown-toggle\" data-toggle=\"dropdown\">\n                                                            PAST WEATHER\n                                                        <span class=\"caret\"></span>\n                        </a>\n                        <ul class=\"dropdown-menu\" role=\"menu\">\n                                                                                        <li>\n                                    <a href=\"https://www.weather.gov/wrh/climate\">Past Weather</a>\n                                </li>\n                                                            <li>\n                                    <a href=\"https://gml.noaa.gov/grad/solcalc/\">Astronomical Data</a>\n                                </li>\n                                                            <li>\n                                    <a href=\"https://www.climate.gov/maps-data/dataset/past-weather-zip-code-data-table\">Certified Weather Data</a>\n                                </li>\n                                                    </ul>\n                    </li>\n                                    <li class=\"dropdown\">\n                        <a href=\"https://www.weather.gov/safety/\" class=\"dropdown-toggle\" data-toggle=\"dropdown\">\n                                                            SAFETY\n                                                        <span class=\"caret\"></span>\n                        </a>\n                        <ul class=\"dropdown-menu\" role=\"menu\">\n                                                                                </ul>\n                    </li>\n                                    <li class=\"dropdown\">\n                        <a href=\"https://www.weather.gov/informationcenter\" class=\"dropdown-toggle\" data-toggle=\"dropdown\">\n                                                            INFORMATION\n                                                        <span class=\"caret\"></span>\n                        </a>\n                        <ul class=\"dropdown-menu\" role=\"menu\">\n                                                                                        <li>\n                                    <a href=\"https://www.weather.gov/wrn/wea\">Wireless Emergency Alerts</a>\n                                </li>\n                                                            <li>\n                                    <a href=\"https://www.weather.gov/wrn/\">Weather-Ready Nation</a>\n                                </li>\n                                                            <li>\n                                    <a href=\"https://www.weather.gov/owlie/publication_brochures\">Brochures</a>\n                                </li>\n                                                            <li>\n                                    <a href=\"https://www.weather.gov/coop/\">Cooperative Observers</a>\n                                </li>\n                                                            <li>\n                                    <a href=\"https://www.weather.gov/briefing/\">Daily Briefing</a>\n                                </li>\n                                                            <li>\n                                    <a href=\"https://www.weather.gov/hazstat\">Damage/Fatality/Injury Statistics</a>\n                                </li>\n                                                            <li>\n                                    <a href=\"http://mag.ncep.noaa.gov\">Forecast Models</a>\n                                </li>\n                                                            <li>\n                                    <a href=\"https://www.weather.gov/gis/\">GIS Data Portal</a>\n                                </li>\n                                                            <li>\n                                    <a href=\"https://www.weather.gov/nwr\">NOAA Weather Radio</a>\n                                </li>\n                                                            <li>\n                                    <a href=\"https://www.weather.gov/publications/\">Publications</a>\n                                </li>\n                                                            <li>\n                                    <a href=\"https://www.weather.gov/skywarn/\">SKYWARN Storm Spotters</a>\n                                </li>\n                                                            <li>\n                                    <a href=\"https://www.weather.gov/stormready\">StormReady</a>\n                                </li>\n                                                            <li>\n                                    <a href=\"https://www.weather.gov/tsunamiready/\">TsunamiReady</a>\n                                </li>\n                                                            <li>\n                                    <a href=\"https://www.weather.gov/notification/\">Service Change Notices</a>\n                                </li>\n                                                    </ul>\n                    </li>\n                                    <li class=\"dropdown\">\n                        <a href=\"https://www.weather.gov/education/\" class=\"dropdown-toggle\" data-toggle=\"dropdown\">\n                                                            EDUCATION\n                                                        <span class=\"caret\"></span>\n                        </a>\n                        <ul class=\"dropdown-menu\" role=\"menu\">\n                                                                                </ul>\n                    </li>\n                                    <li class=\"dropdown\">\n                        <a href=\"https://www.weather.gov/news\" class=\"dropdown-toggle\" data-toggle=\"dropdown\">\n                                                            NEWS\n                                                        <span class=\"caret\"></span>\n                        </a>\n                        <ul class=\"dropdown-menu\" role=\"menu\">\n                                                                                </ul>\n                    </li>\n                                    <li class=\"dropdown\">\n                        <a href=\"https://www.weather.gov/search/\" class=\"dropdown-toggle\" data-toggle=\"dropdown\">\n                                                            SEARCH\n                                                        <span class=\"caret\"></span>\n                        </a>\n                        <ul class=\"dropdown-menu\" role=\"menu\">\n                                                            <li>\n                                    <div id=\"site-search\">\n                                        <form method=\"get\" action=\"//search.usa.gov/search\" style=\"margin-bottom: 0; margin-top: 0;\">\n                                            <input type=\"hidden\" name=\"v:project\" value=\"firstgov\" />\n                                            <label for=\"query\">Search For</label>\n                                            <input type=\"text\" name=\"query\" id=\"query\" size=\"12\" />\n                                            <input type=\"submit\" value=\"Go\" />\n                                            <p>\n                                                <input type=\"radio\" name=\"affiliate\" checked=\"checked\" value=\"nws.noaa.gov\" id=\"nws\" />\n                                                <label for=\"nws\" class=\"search-scope\">NWS</label>\n                                                <input type=\"radio\" name=\"affiliate\" value=\"noaa.gov\" id=\"noaa\" />\n                                                <label for=\"noaa\" class=\"search-scope\">All NOAA</label>\n                                            </p>\n                                        </form>\n                                    </div>\n                                </li>\n                                                                                </ul>\n                    </li>\n                                    <li class=\"dropdown\">\n                        <a href=\"https://www.weather.gov/about/\" class=\"dropdown-toggle\" data-toggle=\"dropdown\">\n                                                            ABOUT\n                                                        <span class=\"caret\"></span>\n                        </a>\n                        <ul class=\"dropdown-menu\" role=\"menu\">\n                                                                                        <li>\n                                    <a href=\"https://www.weather.gov/about/\">About NWS</a>\n                                </li>\n                                                            <li>\n                                    <a href=\"https://www.weather.gov/organization\">Organization</a>\n                                </li>\n                                                            <li>\n                                    <a href=\"https://sites.google.com/a/noaa.gov/nws-insider/\">For NWS Employees</a>\n                                </li>\n                                                            <li>\n                                    <a href=\"https://www.weather.gov/ncep/\">National Centers</a>\n                                </li>\n                                                            <li>\n                                    <a href=\"https://www.noaa.gov/nws-careers\">Careers</a>\n                                </li>\n                                                            <li>\n                                    <a href=\"https://www.weather.gov/contact\">Contact Us</a>\n                                </li>\n                                                            <li>\n                                    <a href=\"https://forecast.weather.gov/glossary.php\">Glossary</a>\n                                </li>\n                                                            <li>\n                                    <a href=\"https://www.weather.gov/socialmedia\">Social Media</a>\n                                </li>\n                                                            <li>\n                                    <a href=\"https://www.noaa.gov/NWStransformation\">NWS Transformation</a>\n                                </li>\n                                                    </ul>\n                    </li>\n                            </ul>\n        </div>\n    </div>\n</nav>\n\n            <div class=\"contentArea\">\n                    \n        <span style=\"font-size: 20px; font-weight:bold;\">Area Forecast Discussion </span><br />Issued by NWS Salt Lake City, UT\n        <br />\n        <br />\n        <div>\n                    <b>Current Version</b>&nbsp;|&nbsp;\n                    <a href=\"?site=NWS&issuedby=SLC&product=AFD&format=TXT&version=2&glossary=0\">Previous Version</a>&nbsp;|&nbsp;\n                    <a href=\"?site=NWS&issuedby=SLC&product=AFD&format=ci&version=1&glossary=0\">Graphics & Text</a>&nbsp;|&nbsp;\n                    <a href=\"javascript:window.print()\">Print</a>&nbsp;|&nbsp;<a href=\"product_types.php?site=NWS\">Product List</a>&nbsp;|&nbsp;\n                    <a href=\"?site=NWS&issuedby=SLC&product=AFD&format=TXT&version=1&glossary=1\">Glossary On</a></div>\n                <div>Versions:\n                            <b>1</b> \n                            \n<a href=\"?site=NWS&issuedby=SLC&product=AFD&format=TXT&version=2&glossary=0\">2</a> \n                            \n<a href=\"?site=NWS&issuedby=SLC&product=AFD&format=TXT&version=3&glossary=0\">3</a> \n                            \n<a href=\"?site=NWS&issuedby=SLC&product=AFD&format=TXT&version=4&glossary=0\">4</a> \n                            \n<a href=\"?site=NWS&issuedby=SLC&product=AFD&format=TXT&version=5&glossary=0\">5</a> \n                            \n<a href=\"?site=NWS&issuedby=SLC&product=AFD&format=TXT&version=6&glossary=0\">6</a> \n                            \n<a href=\"?site=NWS&issuedby=SLC&product=AFD&format=TXT&version=7&glossary=0\">7</a> \n                            \n<a href=\"?site=NWS&issuedby=SLC&product=AFD&format=TXT&version=8&glossary=0\">8</a> \n                            \n<a href=\"?site=NWS&issuedby=SLC&product=AFD&format=TXT&version=9&glossary=0\">9</a> \n                            \n<a href=\"?site=NWS&issuedby=SLC&product=AFD&format=TXT&version=10&glossary=0\">10</a> \n                            \n<a href=\"?site=NWS&issuedby=SLC&product=AFD&format=TXT&version=11&glossary=0\">11</a> \n                            \n<a href=\"?site=NWS&issuedby=SLC&product=AFD&format=TXT&version=12&glossary=0\">12</a> \n                            \n<a href=\"?site=NWS&issuedby=SLC&product=AFD&format=TXT&version=13&glossary=0\">13</a> \n                            \n<a href=\"?site=NWS&issuedby=SLC&product=AFD&format=TXT&version=14&glossary=0\">14</a> \n                    <hr size=\"1\" width=\"520\" noshade=\"noshade\" align=\"left\" />\n        </div>\n        <pre class=\"glossaryProduct\">\n235\nFXUS65 KSLC 041000\nAFDSLC\n\nArea Forecast Discussion\nNational Weather Service Salt Lake City UT\n300 AM MST Sun Jan 4 2026\n\n.KEY MESSAGES...\n\n- A warm, moisture rich storm will bring valley rain and mountain\n  snow late today through Monday. The heaviest precipitation is\n  anticipated late tonight through Monday morning across northern\n  Utah, resulting in travel impacts for mountain routes.\n\n- After a relative lull Tuesday, a pair of colder systems will\n  impact the area late Wednesday into early Friday, bringing the\n  potential for accumulating snow to the northern valleys, as well\n  as significant mountain snow accumulations.\n\n&&\n\n\n.DISCUSSION...A mild, deep layer southwesterly flow resides across\nthe Intermountain region early this morning, downstream from a\ndeepening upper trough just off the Pacific Coast. An embedded\nshortwave trough which lifted through northern Utah earlier,\nbringing a band of precipitation mainly north of I-80, has\ncontinued northeast into the northern Rockies region, leaving only\nscattered showers across the far north. A combination of cloud\ncover and gusty south winds have kept min temps elevated in the\n40s overnight, with temperatures falling into the 30s across\neastern valleys where better radiational cooling has occurred.\n\nThrough much of the day today this mild southwesterly flow will\nremain in place across the forecast area as the upstream trough\napproaches the California Coast. This will allow max temps to\nclimb into the 50s across most valleys, while occasional showers\npersist mainly north of I-80.\n\nThe upstream trough will move onshore late today, before lifting\nnortheast through the Great Basin overnight through Monday\nmorning. Large scale ascent will overspread northern Utah by early\nthis evening, with forcing increasing overnight as the trough axis\napproaches, resulting in an increase in precipitation across\nnorthern Utah, as well as the higher terrain of southwest Utah.\nPrecipitation will be maximized late tonight through Monday\nmorning as the trough axis lifts through the region, before\ngradually tapering off Monday afternoon through Monday evening in\nthe wake of this trough.\n\nWith the mild airmass in place snow levels will remain at or\nabove 7000 feet through this evening before falling into the\n6000-6500 foot range Monday. Areas favored in southwesterly flow\nsuch as Provo Canyon and the Ben Lomond area stand to do quite\nwell through Monday Morning, with SWE totals potentially\napproaching 3\". Through Monday evening mountain snow totals of\n8-18 inches are probable, with local totals in excess of 24\"\ndepending on how long precipitation lingers into the\nafternoon/evening Monday. Snow totals diminish very quickly\nacross central and southern Utah with a general 2-5\" expected\nmainly late Sunday night into Monday. Locally higher totals\napproaching 8\" are possible near Brian Head and higher elevations\nof the Pine Valleys in southwest Utah.\n\nIn terms of valley rain, the Wasatch Back, northern Wasatch Front\nand Cache Valley will be most favored for rainfall through this\nevening, while the Salt Lake and Tooele Valleys will struggle to\nsee measurable precip owing to gusty downsloping south winds, with\nmeasurable precip likely delayed until late tonight as the trough\naxis arrives. Any snowfall across the Wasatch Back late in the\nevent should remain minimal.\n\nIn the wake of this trough Tuesday will see a relative lull under\na general zonal flow, as the next upstream shortwave approaches\nthe Pacific Northwest coast. The airmass will remain mild, with\nmax temps running 5-10 degrees above climo across the forecast\narea. Lingering moisture will maintain a small chance (20-30%) of\nmountain snow showers mainly across the north.\n\nThe pattern remains active through the later portion of the week\nmainly across northern Utah, as a pair of shortwave troughs dig\nthrough the region. Although there remains some spread regarding\nhow these troughs evolve, the most likely scenario brings the\nfirst wave into the forecast area Wednesday. This wave looks to\nimpact mainly northern and central Utah, with pre-frontal snow\ndeveloping across the higher terrain Wednesday morning, followed\nby a cold frontal passage Wednesday afternoon/evening. Snow levels\nfall to near 5000 feet with this frontal passage, and potentially\nlower within heavier precipitation.\n\nOn the back side of this initial wave, a second system Thursday\nwill allow colder air to dive into northern Utah, dropping snow\nlevels to the valley floors. Although significant widespread\naccumulation is not currently expected with this wave, local\neffects (orographics, lake enhancement) could allow for notable\naccumulation in the northern valleys including the Wasatch Front,\nmost likely along bench locations.\n\nMid level ridging will amplify across the region late in the week\nthrough next weekend resulting in a drying trend with the\npotential for valley inversions becoming established.\n\n&&\n\n.AVIATION...KSLC...Gusty southwest winds are expected to prevail\nat the terminal throughout the day, peaking this evening ahead of\nwidespread showers moving into the area overnight. Gradually\ndecreasing CIGS are expected throughout the day, with mountain\nobscuration due to showers anchoring along the high terrain\nlikely. Widespread rainfall is expected to impact the terminal\nearly Monday morning, with a 30-40% chance for MVFR conditions and\na 10-20% chance for IFR conditions throughout the morning.\n\n.REST OF UTAH AND SOUTHWEST WYOMING...Showery precipitation\nongoing across areas generally east of the Wasatch will continue\nthrough around mid-morning, bringing CIG reductions and terrain\nobscuration to terminals across this area. Gusty southwesterly winds\nprevail for most terminals today ahead of a frontal boundary moving\nthrough the region late tonight, peaking late this afternoon and\nevening with gusts 20-30kts for most locations. Widespread\nprecipitation is expected to move into the northern airspace early\nthis afternoon ahead of the main frontal passage, with precipitation\ncoverage spreading into southern Utah early Monday morning. These\nshowers will bring periodic MVFR conditions and localized IFR\nconditions, mainly to higher elevation terminals.\n\n&&\n\n.SLC WATCHES/WARNINGS/ADVISORIES...\nUT...Winter Weather Advisory until 11 PM MST Monday for UTZ110>112.\n\nWY...None.\n\n&&\n\n$$\n\nPUBLIC...Seaman\nAVIATION...Whitlam\n\nFor more information from NOAA`s National Weather Service visit...\nhttp://weather.gov/saltlakecity\n\n\n</pre>\n\n                </div>\n            <footer>\n                                <div class=\"footer-legal\">\n    <div id=\"footerLogo\" class=\"col-xs-12 col-sm-2 col-md-2\">\n        <a href=\"//www.usa.gov\"><img src=\"/css/images/usa_gov.png\" alt=\"usa.gov\" width=\"110\" height=\"30\" /></a>\n    </div>\n    <div class=\"col-xs-12 col-sm-4 col-md-4\">\n        <ul class=\"list-unstyled footer-legal-content\">\n            <li><a href=\"//www.commerce.gov\">US Dept of Commerce</a></li>\n            <li><a href=\"//www.noaa.gov\">National Oceanic and Atmospheric Administration</a></li>\n            <li><a href=\"https://www.weather.gov\">National Weather Service</a></li>\n                        <li>1325 East West Highway<br /></li>\n                        <li>Silver Spring, MD 20910</li>\n            <li><br /><a href=\"https://www.weather.gov/Contact\">Comments? Questions? Please Contact Us.</a></li>\n        </ul>\n    </div>\n    <div class=\"col-xs-12 col-sm-3 col-md-3\">\n        <ul class=\"list-unstyled\">\n            <li><a href=\"https://www.weather.gov/disclaimer\">Disclaimer</a></li>\n            <li><a href=\"//www.cio.noaa.gov/services_programs/info_quality.html\">Information Quality</a></li>\n            <li><a href=\"https://www.weather.gov/help\">Help</a></li>\n            <li><a href=\"//www.weather.gov/glossary\">Glossary</a></li>\n        </ul>\n    </div>\n    <div class=\"col-xs-12 col-sm-3 col-md-3\">\n        <ul class=\"list-unstyled\">\n            <li><a href=\"https://www.weather.gov/privacy\">Privacy Policy</a></li>\n            <li><a href=\"https://www.noaa.gov/foia-freedom-of-information-act\">Freedom of Information Act (FOIA)</a></li>\n            <li><a href=\"https://www.weather.gov/about\">About Us</a></li>\n            <li><a href=\"https://www.weather.gov/careers\">Career Opportunities</a></li>\n        </ul>\n    </div>\n</div>\n\n            </footer>\n        </main>\n    </body>\n</html>\n",
  "nwsForecast": {
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
      "generatedAt": "2026-01-04T21:27:00+00:00",
      "updateTime": "2026-01-04T21:04:38+00:00",
      "validTimes": "2026-01-04T15:00:00+00:00/P7DT10H",
      "elevation": {
        "unitCode": "wmoUnit:m",
        "value": 1278.9408
      },
      "periods": [
        {
          "number": 1,
          "name": "This Afternoon",
          "startTime": "2026-01-04T14:00:00-07:00",
          "endTime": "2026-01-04T18:00:00-07:00",
          "isDaytime": true,
          "temperature": 52,
          "temperatureUnit": "F",
          "temperatureTrend": null,
          "probabilityOfPrecipitation": {
            "unitCode": "wmoUnit:percent",
            "value": 44
          },
          "windSpeed": "12 mph",
          "windDirection": "S",
          "icon": "https://api.weather.gov/icons/land/day/tsra,40?size=medium",
          "shortForecast": "Chance Showers And Thunderstorms",
          "detailedForecast": "A chance of showers and thunderstorms. Cloudy. High near 52, with temperatures falling to around 50 in the afternoon. South wind around 12 mph. Chance of precipitation is 40%."
        },
        {
          "number": 2,
          "name": "Tonight",
          "startTime": "2026-01-04T18:00:00-07:00",
          "endTime": "2026-01-05T06:00:00-07:00",
          "isDaytime": false,
          "temperature": 39,
          "temperatureUnit": "F",
          "temperatureTrend": null,
          "probabilityOfPrecipitation": {
            "unitCode": "wmoUnit:percent",
            "value": 88
          },
          "windSpeed": "6 to 10 mph",
          "windDirection": "SSE",
          "icon": "https://api.weather.gov/icons/land/night/tsra,60/tsra,90?size=medium",
          "shortForecast": "Showers And Thunderstorms",
          "detailedForecast": "A chance of showers and thunderstorms before 8pm, then rain between 8pm and 5am, then showers and thunderstorms. Cloudy. Low around 39, with temperatures rising to around 41 overnight. South southeast wind 6 to 10 mph. Chance of precipitation is 90%."
        },
        {
          "number": 3,
          "name": "Monday",
          "startTime": "2026-01-05T06:00:00-07:00",
          "endTime": "2026-01-05T18:00:00-07:00",
          "isDaytime": true,
          "temperature": 48,
          "temperatureUnit": "F",
          "temperatureTrend": null,
          "probabilityOfPrecipitation": {
            "unitCode": "wmoUnit:percent",
            "value": 85
          },
          "windSpeed": "6 mph",
          "windDirection": "S",
          "icon": "https://api.weather.gov/icons/land/day/tsra,90/tsra,60?size=medium",
          "shortForecast": "Showers And Thunderstorms",
          "detailedForecast": "Showers and thunderstorms before 8am, then rain between 8am and 11am, then showers and thunderstorms likely between 11am and 5pm, then a slight chance of rain. Mostly cloudy. High near 48, with temperatures falling to around 45 in the afternoon. South wind around 6 mph. Chance of precipitation is 90%."
        },
        {
          "number": 4,
          "name": "Monday Night",
          "startTime": "2026-01-05T18:00:00-07:00",
          "endTime": "2026-01-06T06:00:00-07:00",
          "isDaytime": false,
          "temperature": 33,
          "temperatureUnit": "F",
          "temperatureTrend": null,
          "probabilityOfPrecipitation": {
            "unitCode": "wmoUnit:percent",
            "value": 19
          },
          "windSpeed": "6 mph",
          "windDirection": "SSE",
          "icon": "https://api.weather.gov/icons/land/night/rain,20/sct?size=medium",
          "shortForecast": "Slight Chance Light Rain then Partly Cloudy",
          "detailedForecast": "A slight chance of rain before 11pm. Partly cloudy, with a low around 33. South southeast wind around 6 mph. Chance of precipitation is 20%."
        },
        {
          "number": 5,
          "name": "Tuesday",
          "startTime": "2026-01-06T06:00:00-07:00",
          "endTime": "2026-01-06T18:00:00-07:00",
          "isDaytime": true,
          "temperature": 48,
          "temperatureUnit": "F",
          "temperatureTrend": null,
          "probabilityOfPrecipitation": {
            "unitCode": "wmoUnit:percent",
            "value": 14
          },
          "windSpeed": "8 mph",
          "windDirection": "S",
          "icon": "https://api.weather.gov/icons/land/day/sct?size=medium",
          "shortForecast": "Mostly Sunny",
          "detailedForecast": "Mostly sunny, with a high near 48. South wind around 8 mph."
        },
        {
          "number": 6,
          "name": "Tuesday Night",
          "startTime": "2026-01-06T18:00:00-07:00",
          "endTime": "2026-01-07T06:00:00-07:00",
          "isDaytime": false,
          "temperature": 35,
          "temperatureUnit": "F",
          "temperatureTrend": null,
          "probabilityOfPrecipitation": {
            "unitCode": "wmoUnit:percent",
            "value": 48
          },
          "windSpeed": "6 mph",
          "windDirection": "S",
          "icon": "https://api.weather.gov/icons/land/night/rain,20/rain,50?size=medium",
          "shortForecast": "Chance Light Rain",
          "detailedForecast": "A chance of rain after 11pm. Partly cloudy, with a low around 35. Chance of precipitation is 50%."
        },
        {
          "number": 7,
          "name": "Wednesday",
          "startTime": "2026-01-07T06:00:00-07:00",
          "endTime": "2026-01-07T18:00:00-07:00",
          "isDaytime": true,
          "temperature": 44,
          "temperatureUnit": "F",
          "temperatureTrend": null,
          "probabilityOfPrecipitation": {
            "unitCode": "wmoUnit:percent",
            "value": 57
          },
          "windSpeed": "8 mph",
          "windDirection": "SW",
          "icon": "https://api.weather.gov/icons/land/day/rain,60/snow,60?size=medium",
          "shortForecast": "Light Rain Likely",
          "detailedForecast": "Rain likely before 5pm, then a chance of rain and snow. Mostly cloudy, with a high near 44."
        },
        {
          "number": 8,
          "name": "Wednesday Night",
          "startTime": "2026-01-07T18:00:00-07:00",
          "endTime": "2026-01-08T06:00:00-07:00",
          "isDaytime": false,
          "temperature": 29,
          "temperatureUnit": "F",
          "temperatureTrend": null,
          "probabilityOfPrecipitation": {
            "unitCode": "wmoUnit:percent",
            "value": 60
          },
          "windSpeed": "6 mph",
          "windDirection": "S",
          "icon": "https://api.weather.gov/icons/land/night/snow,50/snow,60?size=medium",
          "shortForecast": "Chance Rain And Snow",
          "detailedForecast": "A chance of rain and snow before 8pm, then a chance of rain and snow between 8pm and 2am, then a chance of rain and snow between 2am and 5am, then snow showers likely and a slight chance of thunderstorms. Mostly cloudy, with a low around 29. New snow accumulation of less than one inch possible."
        },
        {
          "number": 9,
          "name": "Thursday",
          "startTime": "2026-01-08T06:00:00-07:00",
          "endTime": "2026-01-08T18:00:00-07:00",
          "isDaytime": true,
          "temperature": 39,
          "temperatureUnit": "F",
          "temperatureTrend": null,
          "probabilityOfPrecipitation": {
            "unitCode": "wmoUnit:percent",
            "value": 60
          },
          "windSpeed": "5 to 10 mph",
          "windDirection": "WNW",
          "icon": "https://api.weather.gov/icons/land/day/snow,60/snow,50?size=medium",
          "shortForecast": "Snow Showers Likely",
          "detailedForecast": "Snow showers likely and a slight chance of thunderstorms before 5pm, then a slight chance of snow. Mostly cloudy, with a high near 39. New snow accumulation of less than one inch possible."
        },
        {
          "number": 10,
          "name": "Thursday Night",
          "startTime": "2026-01-08T18:00:00-07:00",
          "endTime": "2026-01-09T06:00:00-07:00",
          "isDaytime": false,
          "temperature": 24,
          "temperatureUnit": "F",
          "temperatureTrend": null,
          "probabilityOfPrecipitation": {
            "unitCode": "wmoUnit:percent",
            "value": 21
          },
          "windSpeed": "7 mph",
          "windDirection": "WSW",
          "icon": "https://api.weather.gov/icons/land/night/snow,20?size=medium",
          "shortForecast": "Slight Chance Light Snow",
          "detailedForecast": "A slight chance of snow. Mostly cloudy, with a low around 24."
        },
        {
          "number": 11,
          "name": "Friday",
          "startTime": "2026-01-09T06:00:00-07:00",
          "endTime": "2026-01-09T18:00:00-07:00",
          "isDaytime": true,
          "temperature": 38,
          "temperatureUnit": "F",
          "temperatureTrend": null,
          "probabilityOfPrecipitation": {
            "unitCode": "wmoUnit:percent",
            "value": 18
          },
          "windSpeed": "7 mph",
          "windDirection": "S",
          "icon": "https://api.weather.gov/icons/land/day/snow,20?size=medium",
          "shortForecast": "Slight Chance Light Snow",
          "detailedForecast": "A slight chance of snow before 5pm. Partly sunny, with a high near 38."
        },
        {
          "number": 12,
          "name": "Friday Night",
          "startTime": "2026-01-09T18:00:00-07:00",
          "endTime": "2026-01-10T06:00:00-07:00",
          "isDaytime": false,
          "temperature": 22,
          "temperatureUnit": "F",
          "temperatureTrend": null,
          "probabilityOfPrecipitation": {
            "unitCode": "wmoUnit:percent",
            "value": 4
          },
          "windSpeed": "5 mph",
          "windDirection": "ENE",
          "icon": "https://api.weather.gov/icons/land/night/sct?size=medium",
          "shortForecast": "Partly Cloudy",
          "detailedForecast": "Partly cloudy, with a low around 22."
        },
        {
          "number": 13,
          "name": "Saturday",
          "startTime": "2026-01-10T06:00:00-07:00",
          "endTime": "2026-01-10T18:00:00-07:00",
          "isDaytime": true,
          "temperature": 40,
          "temperatureUnit": "F",
          "temperatureTrend": null,
          "probabilityOfPrecipitation": {
            "unitCode": "wmoUnit:percent",
            "value": 3
          },
          "windSpeed": "3 mph",
          "windDirection": "SSE",
          "icon": "https://api.weather.gov/icons/land/day/sct?size=medium",
          "shortForecast": "Mostly Sunny",
          "detailedForecast": "Mostly sunny, with a high near 40."
        },
        {
          "number": 14,
          "name": "Saturday Night",
          "startTime": "2026-01-10T18:00:00-07:00",
          "endTime": "2026-01-11T06:00:00-07:00",
          "isDaytime": false,
          "temperature": 23,
          "temperatureUnit": "F",
          "temperatureTrend": null,
          "probabilityOfPrecipitation": {
            "unitCode": "wmoUnit:percent",
            "value": 0
          },
          "windSpeed": "3 mph",
          "windDirection": "E",
          "icon": "https://api.weather.gov/icons/land/night/few?size=medium",
          "shortForecast": "Mostly Clear",
          "detailedForecast": "Mostly clear, with a low around 23."
        }
      ]
    }
  },
  "windMapMeta": {
    "kind": "storage#object",
    "id": "wasatch-wind-static/wind-map-save.png/1767563134833239",
    "selfLink": "https://www.googleapis.com/storage/v1/b/wasatch-wind-static/o/wind-map-save.png",
    "mediaLink": "https://storage.googleapis.com/download/storage/v1/b/wasatch-wind-static/o/wind-map-save.png?generation=1767563134833239&alt=media",
    "name": "wind-map-save.png",
    "bucket": "wasatch-wind-static",
    "generation": "1767563134833239",
    "metageneration": "2",
    "contentType": "image/png",
    "storageClass": "STANDARD",
    "size": "887472",
    "md5Hash": "dCapsL+MNAAuwtHRk/jMXw==",
    "crc32c": "S9w5cg==",
    "etag": "CNeklObt8pEDEAI=",
    "timeCreated": "2026-01-04T21:45:34.843Z",
    "updated": "2026-01-04T21:45:34.917Z",
    "timeStorageClassUpdated": "2026-01-04T21:45:34.843Z",
    "timeFinalized": "2026-01-04T21:45:34.843Z"
  }
}