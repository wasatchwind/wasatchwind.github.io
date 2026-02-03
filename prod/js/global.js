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

// Used in 2 places: 1) Displaying station wind data and 2) Station on/off toggle in user settings
// Can't rely on Synoptic data because stations sometimes go offline
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

// Global required for D3.js Reset/Update: Morning Sounding Profile (visualize other thermal temps)
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


// FOR TESTING - REMOVE IN PROD
const data = {
  "openMeteo": {
    "latitude": 40.764416,
    "longitude": -111.981255,
    "generationtime_ms": 4.304647445678711,
    "utc_offset_seconds": -25200,
    "timezone": "America/Denver",
    "timezone_abbreviation": "GMT-7",
    "elevation": 1288,
    "hourly_units": {
      "time": "iso8601",
      "geopotential_height_875hPa": "m",
      "geopotential_height_850hPa": "m",
      "geopotential_height_825hPa": "m",
      "geopotential_height_800hPa": "m",
      "geopotential_height_775hPa": "m",
      "geopotential_height_750hPa": "m",
      "geopotential_height_700hPa": "m",
      "geopotential_height_625hPa": "m",
      "wind_direction_10m": "°",
      "winddirection_875hPa": "°",
      "winddirection_850hPa": "°",
      "winddirection_825hPa": "°",
      "winddirection_800hPa": "°",
      "winddirection_775hPa": "°",
      "winddirection_750hPa": "°",
      "winddirection_700hPa": "°",
      "winddirection_625hPa": "°",
      "wind_speed_10m": "mp/h",
      "windspeed_875hPa": "mp/h",
      "windspeed_850hPa": "mp/h",
      "windspeed_825hPa": "mp/h",
      "windspeed_800hPa": "mp/h",
      "windspeed_775hPa": "mp/h",
      "windspeed_750hPa": "mp/h",
      "windspeed_700hPa": "mp/h",
      "windspeed_625hPa": "mp/h"
    },
    "hourly": {
      "time": [
        "2026-01-31T20:00",
        "2026-01-31T21:00",
        "2026-01-31T22:00",
        "2026-01-31T23:00",
        "2026-02-01T00:00",
        "2026-02-01T01:00",
        "2026-02-01T02:00",
        "2026-02-01T03:00",
        "2026-02-01T04:00",
        "2026-02-01T05:00",
        "2026-02-01T06:00",
        "2026-02-01T07:00"
      ],
      "geopotential_height_875hPa": [
        1339,
        1348,
        1344,
        1343,
        1335,
        1329,
        1323,
        1325,
        1328,
        1327,
        1323,
        1322
      ],
      "geopotential_height_850hPa": [
        1578,
        1586,
        1582,
        1582,
        1574,
        1567,
        1562,
        1564,
        1566,
        1566,
        1561,
        1560
      ],
      "geopotential_height_825hPa": [
        1823,
        1832,
        1827,
        1827,
        1819,
        1813,
        1808,
        1810,
        1813,
        1813,
        1807,
        1806
      ],
      "geopotential_height_800hPa": [
        2075,
        2084,
        2079,
        2080,
        2072,
        2066,
        2061,
        2063,
        2066,
        2066,
        2060,
        2059
      ],
      "geopotential_height_775hPa": [
        2334,
        2343,
        2338,
        2339,
        2331,
        2325,
        2320,
        2323,
        2326,
        2326,
        2320,
        2320
      ],
      "geopotential_height_750hPa": [
        2600,
        2609,
        2604,
        2605,
        2597,
        2591,
        2586,
        2589,
        2592,
        2593,
        2587,
        2587
      ],
      "geopotential_height_700hPa": [
        3155,
        3164,
        3159,
        3159,
        3152,
        3146,
        3142,
        3145,
        3149,
        3150,
        3145,
        3145
      ],
      "geopotential_height_625hPa": [
        4053,
        4061,
        4057,
        4059,
        4052,
        4046,
        4042,
        4046,
        4051,
        4053,
        4048,
        4050
      ],
      "wind_direction_10m": [
        317,
        297,
        111,
        195,
        126,
        162,
        22,
        90,
        105,
        283,
        79,
        270
      ],
      "winddirection_875hPa": [
        360,
        326,
        90,
        175,
        157,
        139,
        140,
        124,
        124,
        180,
        117,
        198
      ],
      "winddirection_850hPa": [
        106,
        135,
        129,
        162,
        171,
        155,
        159,
        168,
        158,
        160,
        171,
        180
      ],
      "winddirection_825hPa": [
        129,
        135,
        135,
        158,
        180,
        174,
        171,
        171,
        164,
        163,
        165,
        169
      ],
      "winddirection_800hPa": [
        214,
        243,
        233,
        189,
        197,
        187,
        180,
        182,
        184,
        185,
        187,
        185
      ],
      "winddirection_775hPa": [
        291,
        297,
        284,
        216,
        220,
        208,
        199,
        198,
        198,
        197,
        201,
        204
      ],
      "winddirection_750hPa": [
        322,
        322,
        318,
        270,
        243,
        234,
        227,
        223,
        217,
        214,
        218,
        224
      ],
      "winddirection_700hPa": [
        333,
        336,
        338,
        337,
        310,
        292,
        277,
        273,
        265,
        259,
        257,
        253
      ],
      "winddirection_625hPa": [
        333,
        335,
        336,
        332,
        320,
        312,
        308,
        308,
        304,
        291,
        281,
        273
      ],
      "wind_speed_10m": [
        4,
        3.5,
        1.9,
        4.4,
        5,
        2.8,
        1.2,
        2,
        2.6,
        2.1,
        1.1,
        3.6
      ],
      "windspeed_875hPa": [
        0.5,
        1,
        1.6,
        3.3,
        3.5,
        2.9,
        2.1,
        2,
        2,
        0.8,
        1.2,
        0.9
      ],
      "windspeed_850hPa": [
        2.1,
        0.8,
        1.8,
        4.5,
        5.7,
        6,
        7.3,
        8.4,
        6.7,
        5.7,
        6.9,
        8.2
      ],
      "windspeed_825hPa": [
        1.9,
        1.3,
        2.1,
        4.8,
        6.8,
        8.3,
        9.3,
        9.3,
        8.6,
        8.3,
        8.3,
        9.4
      ],
      "windspeed_800hPa": [
        1.1,
        1.4,
        1.6,
        3.8,
        6.5,
        7.8,
        8.7,
        9,
        9.7,
        10,
        10.3,
        10.9
      ],
      "windspeed_775hPa": [
        2.8,
        2.9,
        2.7,
        2.8,
        5.6,
        6.3,
        6.9,
        7.2,
        7.5,
        7.9,
        8.4,
        8.9
      ],
      "windspeed_750hPa": [
        6.1,
        5.6,
        4.1,
        2.1,
        5.4,
        5.9,
        6.6,
        6.6,
        6.9,
        7.4,
        8.3,
        9.5
      ],
      "windspeed_700hPa": [
        16,
        15.2,
        12.5,
        9.7,
        9,
        9.2,
        8.9,
        8.5,
        8.9,
        10.2,
        11.9,
        13.3
      ],
      "windspeed_625hPa": [
        25.9,
        24.4,
        22.8,
        19.8,
        18.4,
        17,
        16.1,
        16.1,
        15.3,
        14.2,
        14.9,
        16.5
      ],
      "winddirection_9000": [
        310,
        310,
        310,
        310,
        310,
        310,
        240,
        240,
        240,
        240,
        240,
        240
      ],
      "windspeed_9000": [
        8,
        8,
        8,
        8,
        8,
        8,
        8,
        8,
        8,
        8,
        8,
        8
      ],
      "winddirection_12000": [
        310,
        310,
        310,
        310,
        310,
        310,
        270,
        270,
        270,
        270,
        270,
        270
      ],
      "windspeed_12000": [
        17,
        17,
        17,
        17,
        17,
        17,
        16,
        16,
        16,
        16,
        16,
        16
      ],
      "winddirection_18000": [
        310,
        310,
        310,
        310,
        310,
        310,
        290,
        290,
        290,
        290,
        290,
        290
      ],
      "windspeed_18000": [
        44,
        44,
        44,
        44,
        44,
        44,
        36,
        36,
        36,
        36,
        36,
        36
      ]
    },
    "daily_units": {
      "time": "iso8601",
      "sunset": "iso8601",
      "temperature_2m_max": "°F"
    },
    "daily": {
      "time": [
        "2026-01-31"
      ],
      "sunset": [
        "2026-01-31T17:44"
      ],
      "temperature_2m_max": [
        50.9
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
          "end": "2026-02-01T03:35:00Z"
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
            "7:50 PM",
            "7:54 PM",
            "7:55 PM",
            "8:00 PM",
            "8:05 PM",
            "8:10 PM",
            "8:15 PM",
            "8:20 PM",
            "8:25 PM",
            "8:30 PM",
            "8:35 PM",
            "8:40 PM",
            "8:40 PM"
          ],
          "air_temp_set_1": [
            39.2,
            37.94,
            37.4,
            37.4,
            39.2,
            39.2,
            39.2,
            39.2,
            39.2,
            39.2,
            39.2,
            37.4
          ],
          "wind_speed_set_1": [
            0,
            0,
            0,
            0,
            0,
            0,
            0,
            3.45,
            4.6,
            4.6,
            3.45,
            3.45,
            3.45
          ],
          "wind_direction_set_1": [
            0,
            0,
            0,
            0,
            0,
            0,
            0,
            250,
            250,
            250,
            240,
            230,
            230
          ],
          "altimeter_set_1": [
            30.36,
            30.36,
            30.36,
            30.36,
            30.36,
            30.36,
            30.36,
            30.36,
            30.36,
            30.36,
            30.36,
            30.36
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
          "end": "2026-02-01T03:35:00Z"
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
            "4:55 PM",
            "5:15 PM",
            "5:35 PM",
            "5:55 PM",
            "6:15 PM",
            "6:35 PM",
            "6:55 PM",
            "7:15 PM",
            "7:35 PM",
            "7:55 PM",
            "8:15 PM",
            "8:35 PM",
            "8:35 PM"
          ],
          "air_temp_set_1": [
            48.2,
            46.4,
            44.6,
            41,
            41,
            41,
            41,
            37.4,
            37.4,
            37.4,
            37.4,
            37.4
          ],
          "wind_speed_set_1": [
            null,
            4.6,
            5.75,
            5.75,
            4.6,
            2.3,
            2.3,
            0,
            2.3,
            3.45,
            1.15,
            3.45,
            3.45
          ],
          "wind_direction_set_1": [
            null,
            10,
            350,
            360,
            330,
            260,
            230,
            0,
            310,
            300,
            230,
            250,
            250
          ],
          "altimeter_set_1": [
            30.37,
            30.37,
            30.37,
            30.37,
            30.37,
            30.37,
            30.37,
            30.37,
            30.37,
            30.37,
            30.37,
            30.37
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
          "end": "2026-02-01T03:30:00Z"
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
            "6:50 PM",
            "7:00 PM",
            "7:10 PM",
            "7:20 PM",
            "7:30 PM",
            "7:40 PM",
            "7:50 PM",
            "8:00 PM",
            "8:10 PM",
            "8:20 PM",
            "8:30 PM",
            "8:40 PM",
            "8:40 PM"
          ],
          "air_temp_set_1": [
            43.42,
            43.08,
            42.96,
            42.66,
            42.32,
            42.14,
            41.99,
            41.99,
            42.45,
            45.6,
            42.09,
            42.04
          ],
          "wind_speed_set_1": [
            2.02,
            1.12,
            2,
            1.65,
            0.78,
            0.78,
            1.2,
            3.1,
            0.6,
            6.32,
            3.28,
            2,
            2
          ],
          "wind_direction_set_1": [
            82.6,
            264.7,
            76.64,
            347.1,
            340.6,
            317.7,
            103.2,
            96.5,
            308,
            44.27,
            158.3,
            81.3,
            81.3
          ],
          "wind_gust_set_1": [
            7.01,
            8.99,
            5.04,
            5.04,
            6.57,
            3.95,
            5.48,
            8.11,
            3.95,
            9.42,
            8.99,
            5.26,
            5.26
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
          "end": "2026-02-01T03:00:00Z"
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
            "3:00 PM",
            "4:00 PM",
            "5:00 PM",
            "6:00 PM",
            "7:00 PM",
            "8:00 PM",
            "8:00 PM"
          ],
          "air_temp_set_1": [
            26.5,
            26.9,
            28.3,
            26.4,
            26.1,
            26.5
          ],
          "wind_speed_set_1": [
            22.99,
            25.2,
            19.6,
            19.6,
            16.2,
            20.7,
            20.7
          ],
          "wind_direction_set_1": [
            327.3,
            330,
            311.7,
            302.9,
            302.9,
            313.7,
            313.7
          ],
          "wind_gust_set_1": [
            29.6,
            31.9,
            28.19,
            30.2,
            26.1,
            31.5,
            31.5
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
          "end": "2026-02-01T03:30:00Z"
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
            "6:00 PM",
            "6:15 PM",
            "6:30 PM",
            "6:45 PM",
            "7:00 PM",
            "7:15 PM",
            "7:30 PM",
            "7:45 PM",
            "8:00 PM",
            "8:15 PM",
            "8:30 PM",
            "8:45 PM",
            "8:45 PM"
          ],
          "air_temp_set_1": [
            28.94,
            28.94,
            29.31,
            29.56,
            29.31,
            29.86,
            29.8,
            30.72,
            30.96,
            31.76,
            31.76,
            31.63
          ],
          "wind_speed_set_1": [
            13.1,
            13.89,
            12.96,
            12.88,
            11.05,
            12.2,
            11.93,
            11.37,
            11.84,
            11.47,
            11.48,
            11.48,
            11.48
          ],
          "wind_direction_set_1": [
            263.8,
            263.5,
            269.8,
            276.1,
            271.2,
            272.8,
            274.1,
            273,
            275.9,
            283.1,
            279.7,
            279.4,
            279.4
          ],
          "wind_gust_set_1": [
            14.2,
            15.1,
            13.69,
            13.99,
            12,
            13.5,
            12.6,
            12.5,
            12.7,
            12.6,
            12.3,
            12,
            12
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
          "end": "2026-02-01T03:30:00Z"
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
            "5:45 PM",
            "6:00 PM",
            "6:15 PM",
            "6:30 PM",
            "6:45 PM",
            "7:00 PM",
            "7:15 PM",
            "7:30 PM",
            "7:45 PM",
            "8:00 PM",
            "8:15 PM",
            "8:30 PM",
            "8:30 PM"
          ],
          "air_temp_set_1": [
            26,
            25,
            26,
            26,
            26,
            26,
            26,
            26,
            27,
            27,
            26,
            27
          ],
          "wind_speed_set_1": [
            19,
            17,
            13,
            12,
            17,
            18,
            16,
            21,
            21,
            19,
            17,
            17,
            17
          ],
          "wind_direction_set_1": [
            292.5,
            292.5,
            270,
            292.5,
            292.5,
            292.5,
            292.5,
            315,
            315,
            315,
            337.5,
            315,
            315
          ],
          "wind_gust_set_1": [
            25,
            23.99,
            20,
            18,
            22.99,
            30,
            23.99,
            27,
            25,
            27,
            22.99,
            22.99,
            22.99
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
          "end": "2026-02-01T03:40:00Z"
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
            "7:50 PM",
            "7:55 PM",
            "8:00 PM",
            "8:05 PM",
            "8:10 PM",
            "8:15 PM",
            "8:20 PM",
            "8:25 PM",
            "8:30 PM",
            "8:35 PM",
            "8:40 PM",
            "8:45 PM",
            "8:45 PM"
          ],
          "air_temp_set_1": [
            39.82,
            39.82,
            40.02,
            40.42,
            40.77,
            40.82,
            40.62,
            40.24,
            40.35,
            40.46,
            40.78,
            40.95
          ],
          "wind_speed_set_1": [
            6.99,
            6.27,
            7.4,
            7.71,
            9.19,
            6.73,
            5.65,
            5.52,
            4.6,
            4.94,
            6.13,
            5.95,
            5.95
          ],
          "wind_direction_set_1": [
            1.15,
            358.71,
            2.72,
            4.02,
            10.83,
            12.94,
            357.45,
            0.49,
            2.54,
            8.56,
            8.18,
            4.07,
            4.07
          ],
          "wind_gust_set_1": [
            10.44,
            9.08,
            9.86,
            10.39,
            10.83,
            8.41,
            7.06,
            6.66,
            5.52,
            6.35,
            6.71,
            6.62,
            6.62
          ],
          "altimeter_set_1d": [
            30.46,
            30.46,
            30.46,
            30.46,
            30.46,
            30.46,
            30.46,
            30.46,
            30.47,
            30.47,
            30.47,
            30.47
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
          "end": "2026-02-01T03:00:00Z"
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
            "5:15 PM",
            "5:30 PM",
            "5:45 PM",
            "6:00 PM",
            "6:15 PM",
            "6:30 PM",
            "6:45 PM",
            "7:00 PM",
            "7:15 PM",
            "7:30 PM",
            "7:45 PM",
            "8:00 PM",
            "8:00 PM"
          ],
          "air_temp_set_1": [
            28.51,
            28.67,
            28.69,
            28.49,
            28.61,
            28.36,
            28.16,
            28.51,
            28.57,
            28.43,
            28.84,
            28.39
          ],
          "wind_speed_set_1": [
            3.73,
            3.93,
            4.41,
            4.72,
            3.54,
            4.57,
            5.04,
            3.22,
            4.1,
            6.36,
            6.51,
            5.34,
            5.34
          ],
          "wind_direction_set_1": [
            305.9,
            315.4,
            294.1,
            316.9,
            301.6,
            295.2,
            311.3,
            286.2,
            287.7,
            306.8,
            305.6,
            305.4,
            305.4
          ],
          "wind_gust_set_1": [
            8.06,
            8.57,
            8.64,
            9.54,
            7.23,
            7.74,
            7.67,
            7.01,
            7.23,
            8.79,
            10.43,
            8.64,
            8.64
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
          "end": "2026-02-01T03:45:00Z"
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
            "6:00 PM",
            "6:15 PM",
            "6:30 PM",
            "6:45 PM",
            "7:00 PM",
            "7:15 PM",
            "7:30 PM",
            "7:46 PM",
            "8:00 PM",
            "8:16 PM",
            "8:30 PM",
            "8:45 PM",
            "8:45 PM"
          ],
          "air_temp_set_1": [
            40,
            40,
            40,
            40,
            40,
            40,
            40,
            40,
            39,
            38,
            38,
            38
          ],
          "wind_speed_set_1": [
            5,
            5,
            7,
            5.99,
            8,
            9,
            5.99,
            1,
            2,
            2,
            2,
            3,
            3
          ],
          "wind_direction_set_1": [
            86,
            101,
            85,
            93,
            94,
            93,
            101,
            196,
            196,
            84,
            89,
            90,
            90
          ],
          "wind_gust_set_1": [
            8,
            8,
            9,
            10,
            11,
            11,
            10,
            5,
            4,
            5.99,
            5,
            5.99,
            5.99
          ],
          "altimeter_set_1": [
            30.23,
            30.23,
            30.23,
            30.23,
            30.22,
            30.23,
            30.22,
            30.23,
            30.23,
            30.23,
            30.23,
            30.23
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
          "end": "2026-02-01T03:10:00Z"
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
            "6:20 PM",
            "6:30 PM",
            "6:40 PM",
            "6:50 PM",
            "7:00 PM",
            "7:10 PM",
            "7:20 PM",
            "7:30 PM",
            "7:40 PM",
            "7:50 PM",
            "8:00 PM",
            "8:10 PM",
            "8:10 PM"
          ],
          "air_temp_set_1": [
            31.46,
            31.32,
            31.43,
            31.43,
            31.34,
            31.21,
            31.31,
            31.49,
            31.53,
            31.72,
            31.98,
            32.09
          ],
          "wind_speed_set_1": [
            7.8,
            6.42,
            5.63,
            5.61,
            5.89,
            7.79,
            7.65,
            7.36,
            6.23,
            5.13,
            5.86,
            5.58,
            5.58
          ],
          "wind_direction_set_1": [
            205.3,
            207.3,
            212.2,
            208.3,
            210.2,
            207.8,
            205.1,
            212,
            211.3,
            228,
            226.8,
            228.8,
            228.8
          ],
          "wind_gust_set_1": [
            10.43,
            9.8,
            7.82,
            7.57,
            8.19,
            9.69,
            9.8,
            8.19,
            7.08,
            6.33,
            7.33,
            6.95,
            6.95
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
          "end": "2026-02-01T03:30:00Z"
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
            "6:40 PM",
            "6:50 PM",
            "7:00 PM",
            "7:10 PM",
            "7:20 PM",
            "7:30 PM",
            "7:40 PM",
            "7:50 PM",
            "8:00 PM",
            "8:10 PM",
            "8:20 PM",
            "8:30 PM",
            "8:30 PM"
          ],
          "air_temp_set_1": [
            41.67,
            41.35,
            41.39,
            42.59,
            43.35,
            44.19,
            44.26,
            44.41,
            44.4,
            44.99,
            42.15,
            40.66
          ],
          "wind_speed_set_1": [
            2.34,
            2.4,
            3.87,
            4.95,
            4.91,
            5.55,
            5.63,
            5.79,
            7.27,
            5.16,
            2.78,
            0.08,
            0.08
          ],
          "wind_direction_set_1": [
            100.9,
            114.1,
            106.7,
            82.3,
            73.63,
            86.9,
            76.22,
            82,
            65.17,
            87.1,
            207.2,
            170.2,
            170.2
          ],
          "wind_gust_set_1": [
            3.95,
            3.95,
            6.79,
            7.89,
            8.77,
            9.21,
            8.11,
            9.21,
            9.86,
            12.7,
            5.04,
            3.95,
            3.95
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
      "METADATA_QUERY_TIME": "50.1 ms",
      "METADATA_PARSE_TIME": "0.3 ms",
      "TOTAL_METADATA_TIME": "50.5 ms",
      "DATA_QUERY_TIME": "5.6 ms",
      "QC_QUERY_TIME": "6.4 ms",
      "DATA_PARSE_TIME": "11.1 ms",
      "TOTAL_DATA_TIME": "23.1 ms",
      "TOTAL_TIME": "73.6 ms",
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
    "@id": "https://api.weather.gov/products/f00820d8-9c32-443c-b3f7-accabe4bb93f",
    "id": "f00820d8-9c32-443c-b3f7-accabe4bb93f",
    "wmoCollectiveId": "FBUS31",
    "issuingOffice": "KWNO",
    "issuanceTime": "2026-02-01T01:59:00+00:00",
    "productCode": "FD1",
    "productName": "6 Hour Winds Aloft Forecast",
    "productText": "\n000\nFBUS31 KWNO 010159\nFD1US1\nDATA BASED ON 010000Z    \nVALID 010600Z   FOR USE 0200-0900Z. TEMPS NEG ABV 24000\n\nFT  3000    6000    9000   12000   18000   24000  30000  34000  39000\nABI      2723+01 3221+00 3324-05 3345-18 3261-27 316743 317253 298063\nABQ              3611+04 0513-01 3537-14 3542-26 344443 324253 314865\nABR 3035 3026-05 3139-08 3144-13 3158-26 3261-38 327549 327555 326059\nACK 0526 0807-07 9900-09 2616-15 2242-26 2160-38 690351 710256 239057\nACY 0337 0419-08 0316-11 3512-18 2040-28 1969-39 187354 216956 226555\nAGC 0221 0324-13 0323-16 0218-22 2715-34 2211-44 251155 290854 251453\nALB 0126 0215-11 0108-14 9900-21 2459-27 2172-41 226555 215957 226157\nALS                      3310-04 3333-18 3452-28 346143 336353 326263\nAMA      0220    3629+01 3432-06 3352-18 3362-29 338143 338353 327964\nAST 1828 1939+04 2044-01 2054-08 2059-22 2182-32 710144 710154 227959\nATL 3331 3536-13 3535-18 3438-24 3462-33 3370-40 317345 307346 307848\nAVP 0134 0215-10 0315-15 3511-21 2446-29 2058-42 215455 214356 214856\nAXN 2139 2523-05 2527-09 2623-14 2824-26 2722-36 252450 252160 303362\nBAM              2013+06 2214+00 2429-14 2442-28 244043 243253 253966\nBCE                      3608+00 3320-14 3324-27 322443 302853 293064\nBDL 0424 0510-11 0511-15 2916-19 2344-28 2171-39 218754 227259 227156\nBFF      3322    3233-02 3237-09 3353-22 3360-33 339246 840856 349664\nBGR 0208 9900-10 9900-15 9900-21 2559-29 2484-40 730052 239457 247956\nBHM 3326 3540-13 3643-15 3552-19 3372-29 3379-38 319248 319352 308249\nBIH      9900    1710+07 1809+02 1925-14 2030-27 222743 232553 243962\nBIL      3026    2926-03 3131-05 3239-21 3151-32 318146 319255 329265\nBLH 0210 1113+15 1215+08 1006+03 1115-13 1120-27 130942 161251 211659\nBML 0215 3605-11 9900-14 9900-21 2422-32 2465-42 236953 226956 236557\nBNA 3623 0133-13 0137-16 3645-21 3655-33 3572-41 347252 336653 316451\nBOI      1714+07 2213+04 2418-02 2742-15 2646-28 264844 264854 265867\nBOS 0522 0711-10 0807-14 2720-18 2449-27 2276-38 219853 228359 228057\nBRL 2705 3305-09 3412-13 3517-19 3432-29 3542-39 355752 366260 355362\nBRO 0811 9900+03 2811-02 2926-02 3040-12 2950-23 287539 299048 780759\nBUF 0116 0228-12 0227-16 0326-22 0324-34 0218-46 280955 301156 251455\nCAE 3438 3623-15 3622-20 0117-25 1342-34 1607-42 273541 275043 276045\nCAR 3610 9900-10 9900-15 2406-21 2306-34 2213-44 234253 235655 246256\nCGI 0215 0123-10 0129-14 3630-19 3546-29 3457-40 356853 346757 326155\nCHS 3341 3530-16 3425-20 9900-25 1129-33 2523-37 265639 266641 266944\nCLE 0126 0226-12 0328-16 0330-22 0334-34 0334-46 022755 362357 311955\nCLL 1607 3017+01 3127-04 3236-08 3155-17 3070-27 308343 308453 790361\nCMH 3624 0327-12 0330-17 0331-22 0232-35 0236-45 012755 362455 312653\nCOU 9900 3307-07 3312-12 3318-17 3433-27 3438-38 354851 354960 335260\nCRP 1310 2812+03 2715-03 3130-04 3045-13 3046-25 296940 297251 299359\nCRW 3517 0120-16 0223-17 0214-21 2605-35 9900-45 340554 311352 292051\nCSG 3329 3536-13 3438-17 3446-22 3271-29 3285-37 800346 309348 298345\nCVG 0119 0328-13 0232-17 0235-21 0244-34 0247-45 364455 363754 333754\nCZI              3120-01 3026-06 3245-21 3254-32 328245 329355 339066\nDAL 2110 2814-02 3132-04 3337-10 3271-20 3186-30 319645 800353 801062\nDBQ 2312 2306-08 3108-13 3310-19 3425-29 3537-39 355452 365961 355364\nDEN              3106+01 3418-06 3342-21 3357-30 337945 349054 348365\nDIK      3250-01 3260-06 3268-11 3284-24 3299-34 830948 832157 339362\nDLH 2143 2145-08 2141-13 2325-16 2818-26 3020-36 322551 342660 333368\nDLN              2718+00 3024-04 3134-18 2957-30 307345 306655 307467\nDRT 1626 2212+03 3112+01 3321-01 3132-14 3030-25 295440 296251 297460\nDSM 2223 2321-07 2318-12 2716-17 3227-26 3329-37 343251 353260 334363\nECK 0220 0328-11 0328-15 0227-22 0232-34 0238-45 024456 013659 352658\nEKN      0220-14 0321-16 3612-21 2314-34 1923-45 231255 261252 241952\nELP      9900    0223+04 0114+00 3624-13 3431-25 323940 294151 295161\nELY              2008+06 2608+00 2815-14 2624-27 262844 272554 273766\nEMI 0138 0317-12 0112-14 3315-19 2322-31 1946-42 204754 213554 224353\nEVV 3625 0225-11 0132-15 0135-20 0148-32 3562-42 356254 346057 335453\nEYW 3333 2941+00 2851+05 2863+01 2778-09 2785-22 751538 751548 760352\nFAT 1707 1712+13 1713+08 1915+01 2027-15 2038-27 213042 223452 233962\nGPI      2415+03 2730-01 2723-07 2938-20 2872-30 286745 287655 287467\nFLO 3539 0428-12 9900-15 0210-22 1134-34 1654-43 243343 254643 256244\nFMN              9900+04 0308-02 3443-14 3553-27 345143 324753 314263\nFOT 2014 2024+06 2036+01 1949-05 2173-17 2082-30 219243 219254 228759\nFSD 2231 2924-03 2926-06 3030-13 3140-25 3136-37 272750 313458 325061\nFSM 2705 2909-06 3020-10 3128-14 3337-26 3238-38 313750 316251 317454\nFWA 0317 0223-12 0228-15 0230-21 0234-34 0241-44 015355 014959 343556\nGAG      3525+05 3437-01 3445-10 3371-22 3489-32 841146 840956 329660\nGCK      3624+04 3440-01 3448-09 3471-21 3484-33 850746 841156 339261\nGEG      2213+06 2421+00 2525-06 2541-18 2564-30 257244 267054 265366\nGFK 2934 2927-06 2828-09 2926-15 2726-25 2418-37 202750 232157 313958\nGGW      3245+01 3142-05 3245-09 3262-22 3274-33 329548 811457 820065\nGJT              9900+02 3313-04 3444-15 3353-28 336344 335753 315865\nGLD      3525    3341-02 3347-10 3464-21 3477-33 359547 841155 349063\nGRB 2209 9900-09 3405-14 3310-20 3519-31 3638-41 365754 366161 364864\nGRI      3333-01 3442-06 3443-12 3457-25 3561-37 358949 359157 347360\nGSP 3434 3615-14 0121-18 0223-23 0824-37 0411-44 312344 293845 284846\nGTF      2919    2818-01 3025-07 3033-19 3067-30 307346 298555 308766\nH51 0514 3423+03 3321-03 3034-04 2951-12 2959-24 287040 287950 790158\nH52 3622 3429-01 3342-03 3144-04 2968-12 2873-25 289140 279750 790657\nH61 3430 3141-07 3152-03 3070-02 2889-13 7701-25 771240 771948 771654\nHAT 0163 0549-07 1019-07 3111-15 1922-25 1641-36 207050 227449 239148\nHOU 9900 3218+01 3130-04 3138-09 3060-17 3070-26 307642 298652 790461\nHSV 3423 3638-13 3642-15 3650-20 3463-30 3479-39 327750 317952 317950\nICT 2325 2918-05 3433-06 3338-12 3345-25 3444-39 345250 346454 336455\nILM 3647 0331-07 0527-12 0912-17 1621-31 1749-44 225244 235344 237045\nIMB              2115+03 2226-04 2351-17 2363-29 237144 237254 247363\nIND 0117 0223-11 0229-15 0233-20 0142-33 0151-43 365855 365658 344455\nINK      2312+03 3614+01 0118-01 3328-14 3331-25 324042 305951 297160\nINL 2048 2151-07 2239-09 2227-14 2522-25 2618-35 281851 291960 302868\nJAN 3628 3630-09 3534-11 3440-14 3256-24 3165-35 308948 791652 800155\nJAX 3034 3234-14 3149-18 3061-21 2895-23 7830-29 772143 772245 289448\nJFK 0428 0416-10 3608-12 3017-17 2141-27 2064-39 198654 217557 226656\nJOT 0308 0313-10 0113-15 3617-20 3630-31 3645-42 366555 366061 355160\nLAS      0708+13 9900+08 9900+03 9900-13 1710-27 200843 250752 252462\nLBB      3016+03 3619+02 3423-04 3434-18 3357-26 326242 326353 317064\nLCH 0414 3519-03 3341-05 3246-11 3161-19 3082-27 309643 299852 791060\nLIT 3411 3618-07 3424-11 3333-15 3340-26 3240-37 313751 306254 308055\nLKV              2029+04 2033-02 2258-16 2262-29 226543 226754 237364\nLND              3114+00 3123-04 3245-18 3262-29 327345 327354 327367\nLOU 0116 0229-12 0233-17 0238-21 0148-34 0148-44 365553 354954 334252\nLRD 1710 1914+04 2708+00 3021-02 3037-13 2947-23 285441 287749 289559\nLSE 2220 2217-08 2313-13 2612-19 3321-27 3433-38 354252 364761 354766\nLWS 1908 2211+07 2419+01 2526-05 2641-17 2554-29 266844 265954 266865\nMBW              2821    3026-06 3242-20 3355-31 337845 338755 338465\nMCW 2231 2230-07 2226-12 2518-16 3125-25 3228-37 343051 343260 333866\nMEM 3618 3628-09 3631-13 3535-17 3451-27 3363-37 327050 316858 317754\nMGM 3329 3539-13 3544-15 3454-18 3375-27 3187-35 800447 299952 298849\nMIA 3041 3041-01 2860-01 2875+01 2693-10 7600-24 751838 751448 750952\nMKC 2317 2318-07 2416-13 2918-15 3330-26 3328-38 341951 351960 335557\nMKG 0215 0316-11 0218-15 0220-21 0126-33 0137-43 364155 014660 364060\nMLB 3137 3051-07 2963-06 2878-07 7707-15 7618-26 762341 762848 762250\nMLS      3228+02 3041-05 3147-08 3259-22 3268-33 329847 821556 339965\nMOB 3632 3636-07 3440-10 3350-13 3171-22 3089-32 792445 792851 790856\nMOT      3348-06 3250-08 3256-13 3260-27 3275-37 831348 830856 327358\nMQT 2110 2305-09 2709-15 2910-20 3414-31 3534-41 365253 365761 354565\nMRF              3414+03 3317+00 3224-13 3132-24 304740 294851 295860\nMSP 2243 2141-08 2140-12 2421-15 3024-25 3021-36 322451 332460 323168\nMSY 0224 3528-05 3337-07 3246-10 3065-21 3095-28 790844 791252 791859\nOKC 2320 2621-05 3331-03 3347-11 3354-25 3371-37 329546 329851 319257\nOMA 2235 2227-08 2919-08 3226-13 3333-25 3229-37 301551 301560 345361\nONL      3234-01 3342-06 3349-11 3467-24 3479-36 359949 850557 337162\nONT 0906 9900+14 9900+09 1005+03 1615-14 1330-27 151542 161951 223258\nORF 0151 0432-07 0326-12 1215-15 2232-28 1954-41 205052 205951 227150\nOTH 2027 2136+06 2142-01 2052-07 2065-20 2091-30 700244 710353 228356\nPDX 1612 1925+06 2137-01 2145-07 2155-20 2183-31 219244 229253 237460\nPFN 3435 3436-09 3343-12 3256-14 3187-22 7903-32 792945 793349 781553\nPHX 0608 0717+14 0818+08 0609+03 0315-13 0417-26 360842 280651 281662\nPIE 3334 3147-08 3057-07 2972-07 7800-16 7714-26 771742 772748 761852\nPIH      1908    2712+02 2816-03 3041-16 3050-29 305945 305754 305967\nPIR      3246-02 3259-06 3261-11 3270-25 3288-36 830848 831957 337862\nPLB 0213 0312-12 0309-15 0409-22 9900-34 2220-44 233454 223755 234356\nPRC              0608+07 0510+04 0109-13 0414-26 010543 330751 292362\nPSB      0322-12 0220-16 0118-22 2527-32 2147-43 222755 221955 222754\nPSX 1208 3019+02 3020-03 3132-06 3052-15 3055-25 296842 298551 299659\nPUB              3307+01 3113-06 3341-19 3357-29 347144 347954 337565\nPWM 0309 9900-10 9900-15 3405-21 2573-27 2380-39 710553 229058 238057\nRAP      3234+03 3251-04 3242-09 3261-22 3369-33 338948 831256 830265\nRBL 1711 1823+10 1931+04 1938-03 2159-16 2167-29 216743 226753 227262\nRDM      1812+09 2119+02 2133-04 2256-18 2275-30 228245 228454 237861\nRDU 3647 0531-09 0326-13 1005-19 1920-32 1747-44 212849 223447 235248\nRIC 0143 0422-11 0426-13 3610-19 1633-29 1634-43 204452 214251 225451\nRKS              3024    3024-04 3347-17 3257-29 327545 326954 327566\nRNO      1713    1916+07 2021+01 2142-15 2251-28 224543 224453 234564\nROA 3329 0322-12 0319-15 0213-20 1719-34 1522-45 211652 251650 252750\nROW      3109    0214+03 0411-01 3532-14 3333-26 324242 324353 305862\nSAC 1815 1916+11 1826+06 1926+00 2147-15 2155-28 215143 225253 225463\nSAN 1006 0605+14 0609+09 0909+03 1221-14 1230-27 142442 181750 222757\nSAT 1707 2514+03 2715-02 3227-04 3042-14 3042-25 296541 297251 298659\nSAV 3338 3236-16 3137-22 3234-27 3037-32 2863-34 287938 278041 277745\nSBA 9900 1407+14 1607+09 1807+02 1724-14 1632-27 181542 182052 222658\nSEA 1914 2029+05 2135-01 2145-08 2152-21 2280-31 228344 228654 236261\nSFO 2011 2118+11 1824+06 2024+00 2047-15 2052-28 215043 215152 225362\nSGF 3005 3109-07 3115-11 3121-17 3333-26 3328-37 342951 342860 325256\nSHV 0406 3512-05 3226-08 3238-14 3154-23 3077-34 801145 791451 810858\nSIY      2022+08 2033+02 2043-04 2168-17 2176-29 217843 228053 228062\nSLC      9900    3107+03 3115-02 3138-15 3148-28 315144 304754 305367\nSLN 2330 3323-03 3433-06 3337-12 3344-25 3453-39 344751 346255 346657\nSPI 3609 0115-09 3516-14 3517-19 3533-30 3550-40 366354 356460 345659\nSPS 2416 2726-01 3232-01 3339-08 3374-20 3284-29 329745 319954 800864\nSSM 3405 0113-10 3615-15 3615-21 3619-33 3628-44 363755 364361 363562\nSTL 0206 3613-09 3616-13 3619-18 3438-29 3550-39 356053 356559 335758\nSYR 0117 0118-12 0116-16 0112-22 2905-34 2229-44 233455 222355 222855\nT01 0412 3422+00 3337-04 3243-08 3063-15 2967-25 297642 299751 790759\nT06 0220 3424-03 3340-05 3249-08 3070-17 2981-26 298842 790252 781358\nT07 3629 3431-05 3340-07 3154-09 2979-18 2997-26 790243 781452 782156\nTCC      0614    0213+02 3425-03 3428-18 3355-26 336242 336253 326664\nTLH 3232 3332-13 3346-15 3265-16 3087-23 7913-31 781845 782348 780950\nTRI      3625-19 0221-17 0320-22 0708-36 0610-46 351549 302348 293249\nTUL 2415 2418-07 2923-08 3230-13 3242-26 3237-39 324050 325652 326253\nTUS      0916+14 0821+08 0615+04 0520-12 0317-26 320941 271151 261960\nTVC 3608 0113-10 0115-15 3617-21 3622-33 0134-43 364055 014561 363761\nTYS 3518 3627-18 0127-18 0126-23 0130-37 3637-44 344149 314047 314348\nWJF      0912+13 9900+09 9900+03 1716-14 1529-26 171442 181952 222959\nYKM 9900 2114+06 2322+00 2332-06 2246-19 2269-30 237844 247454 247063\nZUN              0313+04 0220+01 3528-13 3634-26 353243 323253 303763\n2XG 3048 2939-11 2635-16 2665-18 7606-20 7635-27 754042 754145 269649\n4J3 3433 3338-08 3148-08 3163-10 2991-18 7810-28 781943 782450 771753\n"
  },
  "windAloft12": {
    "@context": {
      "@version": "1.1",
      "@vocab": "https://api.weather.gov/ontology#"
    },
    "@id": "https://api.weather.gov/products/55b7359c-89c8-4faf-8b63-35d25dd85795",
    "id": "55b7359c-89c8-4faf-8b63-35d25dd85795",
    "wmoCollectiveId": "FBUS33",
    "issuingOffice": "KWNO",
    "issuanceTime": "2026-02-01T01:59:00+00:00",
    "productCode": "FD3",
    "productName": "24 Hour Winds Aloft Forecast",
    "productText": "\n000\nFBUS33 KWNO 010159\nFD3US3\nDATA BASED ON 010000Z    \nVALID 011200Z   FOR USE 0900-1800Z. TEMPS NEG ABV 24000\n\nFT  3000    6000    9000   12000   18000   24000  30000  34000  39000\nABI      3316+04 0129+00 3534-07 3344-17 3356-27 326643 326854 308163\nABQ              1205+04 9900-01 3640-14 3646-26 333743 324253 304962\nABR 3336 3332-06 3243-09 3354-14 3366-26 3395-35 832748 831557 338457\nACK 0434 0628-09 0712-09 0218-16 2808-26 1655-36 164151 164958 216255\nACY 0431 0230-10 3618-12 3522-16 2213-27 2120-41 175156 224754 244352\nAGC 3422 3630-12 0130-16 0133-22 0129-34 3616-44 361453 290855 281854\nALB 0232 0221-10 0214-15 0311-20 2548-28 2268-40 207456 215258 223655\nALS                      2916-03 3549-15 3455-27 335443 325453 325665\nAMA      0112    3624+00 3428-07 3344-18 3455-28 346944 347354 327264\nAST 2230 2136+01 2145-04 2145-10 2044-24 2070-36 700348 710453 216552\nATL 3230 3535-10 3435-14 3439-20 3358-30 3269-39 316948 307450 296848\nAVP 0136 0224-11 0216-15 0115-20 2636-29 2251-42 196856 214257 243054\nAXN 3030 2928-07 3029-10 3029-15 3124-28 3022-39 312251 323454 334955\nBAM              2216+06 2222+01 2335-15 2343-29 235244 244953 245364\nBCE                      9900+01 3111-14 2719-27 252344 262254 283964\nBDL 0428 0423-10 0423-14 3613-17 2436-27 2047-39 186653 205159 224855\nBFF      3120    3127-02 3237-06 3247-20 3361-31 339346 830055 339065\nBGR 0423 0614-09 0715-14 0716-20 2840-27 2362-38 700051 208459 236758\nBHM 3527 3534-08 3540-12 3442-17 3358-27 3369-38 317150 307054 297451\nBIH      9900    2009+07 2312+02 2129-15 2042-28 212844 213053 223961\nBIL      3021    3025-01 3030-06 3048-19 3169-30 308245 308855 308967\nBLH 0508 1115+14 1215+07 1008+03 1514-14 1424-27 162142 201951 252558\nBML 0415 0514-11 0608-14 0613-20 2724-29 2367-39 199252 206859 224558\nBNA 3517 3629-10 3634-13 3537-19 3548-30 3461-41 346852 336156 325553\nBOI      1717+08 2217+04 2425-02 2444-17 2457-30 246444 246354 247065\nBOS 0625 0626-11 0418-14 0213-17 2743-27 1961-36 185853 186059 215556\nBRL 2319 2416-08 2416-13 2718-18 3126-27 3231-37 323851 323760 325062\nBRO 0809 2505+03 2813-01 3224-02 2942-13 2852-24 298638 299848 289759\nBUF 3614 0233-12 0232-16 0230-21 0126-34 0124-46 361254 280655 261556\nCAE 3532 3328-12 3521-14 3523-21 1206-34 3127-43 295044 285844 275846\nCAR 0415 0611-09 0809-15 0606-21 9900-32 2576-38 720651 237359 235058\nCGI 2907 3317-08 3318-13 3223-18 3439-27 3351-38 346251 346259 335959\nCHS 3437 3338-12 3529-14 3531-21 0616-33 2944-40 287342 277443 267645\nCLE 3626 0126-11 0129-16 0130-22 0131-34 0136-44 014054 363457 342256\nCLL 2612 3021+00 3227-03 3333-09 3272-17 3180-28 318843 309153 790261\nCMH 3522 3624-11 0128-16 0131-21 3630-33 0139-44 364654 363756 332654\nCOU 2318 2522-08 2517-12 3023-15 3234-26 3237-37 314351 314360 336060\nCRP 1407 2613+03 3118-02 3424-05 3144-15 3051-25 297041 297950 299359\nCRW 3420 3631-13 0132-16 0129-22 0129-34 3524-44 363253 331853 292252\nCSG 3326 3434-09 3441-13 3448-18 3270-27 3174-38 298548 298351 288050\nCVG 3414 3624-11 0127-15 3630-20 3638-32 3648-43 365454 355057 334055\nCZI              3223-01 3228-06 3247-18 3272-29 328546 328956 319667\nDAL 2614 2831-03 3332-03 3341-10 3475-20 3390-30 339746 329954 811161\nDBQ 2225 2322-08 2322-13 2419-18 2920-27 3121-37 322751 332560 324363\nDEN              3009+02 3123-03 3341-18 3364-29 337844 337054 324965\nDIK      3347-02 3255-07 3362-10 3375-21 3281-33 830248 821757 821162\nDLH 2235 2235-07 2619-10 2524-15 2417-27 2215-37 221251 231460 332461\nDLN              2517+02 2723-04 2831-17 2755-29 275945 276555 287566\nDRT 1823 3307+05 3510+00 3514-03 3230-14 3135-25 305141 306550 297760\nDSM 2334 2430-06 2929-09 2931-15 3139-27 3039-38 315151 325356 325859\nECK 3621 0121-11 0122-15 0127-21 0128-33 0136-44 014355 363959 353158\nEKN      3634-14 0131-16 3625-22 3216-33 2911-44 990053 271253 272352\nELP      0606    0814+03 0408-01 3522-13 3524-25 322141 293551 284960\nELY              2117+05 2317+01 2421-14 2333-28 243444 243054 264264\nEMI 0237 0129-11 0224-15 0119-20 2529-31 2152-42 185255 213155 243353\nEVV 3616 3518-10 3524-13 3426-19 3437-30 3558-40 357153 356758 335157\nEYW 3429 3148-03 2945+04 2854+00 2675-10 2685-22 760738 760147 751854\nFAT 9900 1906+11 2014+06 2119+00 2135-15 2043-28 212943 193453 224159\nGPI      2410+02 2623-01 2731-06 2643-19 2667-30 267445 266954 285467\nFLO 3535 3533-10 3530-14 3532-21 0121-35 0908-44 273544 264444 265946\nFMN              3106+04 3005+00 3538-14 3448-26 334043 314253 304563\nFOT 2025 2229+04 2338-01 2249-06 2368-18 2283-31 229845 710655 228958\nFSD 3130 3129-07 3249-08 3252-14 3265-27 3384-37 832448 830856 337657\nFSM 2515 2523-06 3126-08 3235-12 3338-26 3439-37 344949 347054 337056\nFWA 3415 0119-10 0122-15 0125-21 3629-32 3638-43 364654 364859 344157\nGAG      3314+03 3539-02 3439-09 3458-19 3361-30 349045 349455 328663\nGCK      3313+03 3335-02 3335-08 3355-20 3359-31 348845 349755 338164\nGEG      2013+06 2215+01 2421-07 2347-21 2374-30 238545 239255 246163\nGFK 3233 3233-10 3339-10 3342-14 3340-25 3233-38 334250 335354 336056\nGGW      3128-01 3136-04 3143-08 3156-21 3156-32 318247 810156 801068\nGJT              9900+01 3213-03 3439-14 3250-27 324844 314954 305366\nGLD      3216    3128-02 3236-06 3353-21 3360-31 348845 349555 348766\nGRB 2318 2215-09 2211-14 2611-20 3314-28 3526-39 353552 364161 344265\nGRI      3342+01 3349-05 3249-10 3264-24 3386-34 349849 841957 339963\nGSP 3435 3518-10 3521-15 3420-21 2216-34 3330-43 324048 304747 285347\nGTF      2815    2820-01 2828-07 2842-19 2966-30 287845 297155 296867\nH51 0512 3321+02 3123-02 3229-04 3049-14 2966-24 297241 299248 780058\nH52 0120 3431+00 3343-02 3142-06 2962-14 2871-24 288540 289549 770556\nH61 3428 3240-01 3147-03 3054-05 2782-13 2788-24 760739 770849 761253\nHAT 3654 0246-08 0332-11 1208-14 3406-27 1211-39 203850 236546 248146\nHOU 2707 3122+00 3128-04 3337-10 3171-17 3180-27 308743 299253 791560\nHSV 3524 3534-09 3539-13 3540-18 3454-28 3368-39 337251 326754 306352\nICT 2621 3320+00 3436-05 3442-09 3453-23 3479-33 348848 850057 339163\nILM 3544 3634-09 3621-13 3635-20 0216-31 0714-45 253344 244943 246945\nIMB              2229+02 2238-05 2158-20 2284-30 229345 229854 238760\nIND 3513 3617-10 3621-14 3623-20 3532-31 3547-42 356053 355658 344457\nINK      3505+07 0715+03 0414-02 3327-13 3234-26 323841 324551 306461\nINL 2330 2424-09 2421-10 2521-15 2419-25 2415-36 222151 232160 312260\nJAN 3418 3426-06 3333-10 3335-15 3237-26 3230-38 314349 296651 307453\nJAX 3236 3339-09 3244-13 3157-17 2986-23 7803-33 774141 772447 760850\nJFK 0528 0325-10 0318-14 3516-17 2317-27 1828-39 175455 214557 224154\nJOT 2609 2808-09 3007-14 3309-19 3423-29 3440-39 355552 355560 345263\nLAS      1208+13 1711+07 2009+02 2112-14 1822-27 201543 221852 242761\nLBB      0510+08 0222+01 3627-06 3238-16 3447-27 335242 335453 317064\nLCH 0106 3220-02 3235-06 3242-11 3171-21 8001-29 791243 791653 801256\nLIT 2911 3018-06 3120-12 3129-15 3338-26 3331-38 342750 333956 315754\nLKV              2239+01 2248-04 2264-18 2276-30 228344 228454 228462\nLND              3119+02 3231-03 3242-16 3158-29 316645 306555 317367\nLOU 3310 3624-11 3628-14 3633-20 3639-32 3551-42 355553 355457 334554\nLRD 1810 2206+02 3311+00 3319-02 3035-13 2951-24 296339 298748 299960\nLSE 2236 2235-08 2131-14 2423-16 2817-27 2712-37 291551 301360 323362\nLWS 1712 1812+07 2114+02 2323-05 2347-19 2470-30 247745 248354 247463\nMBW              2835    3131-04 3347-17 3263-29 338245 327755 328366\nMCW 2338 2528-06 2827-10 2726-15 2818-28 2619-39 261951 292556 324857\nMEM 3311 3421-08 3425-12 3330-16 3340-26 3346-38 345051 334958 315554\nMGM 3323 3535-07 3442-11 3346-16 3260-26 3166-36 306949 298752 288151\nMIA 3244 3142+00 2951+00 2863-01 2686-11 2699-23 760639 751048 751952\nMKC 2526 2821-05 3231-08 3236-12 3461-25 3471-37 348950 349458 337761\nMKG 3109 3309-10 3510-15 3613-20 3524-31 3637-42 365353 016061 354260\nMLB 3337 3242-07 3058-07 2969-08 2796-15 7616-25 762141 762349 762453\nMLS      3121+01 3238-03 3144-07 3153-21 3159-32 319046 319856 810367\nMOB 3631 3431-05 3334-09 3240-13 3045-25 2965-35 782544 783151 288754\nMOT      3439-05 3339-09 3349-13 3369-24 8301-33 820649 830358 820461\nMQT 2226 2118-08 2316-14 2416-20 3110-28 3421-39 352952 363861 353467\nMRF              0309+01 0409-02 3323-13 3227-24 313741 295250 286760\nMSP 2429 2819-06 2824-11 2724-16 2516-28 2218-39 202251 211758 323457\nMSY 3616 3526-04 3338-07 3244-13 3058-23 7900-30 782043 782251 299756\nOKC 2528 3319+01 3532-04 3442-09 3564-21 3482-32 349247 349756 329961\nOMA 2728 3132-02 3248-07 3253-12 3274-25 3393-37 831749 831358 338160\nONL      3249+00 3259-06 3258-11 3275-24 3395-34 830549 842757 830363\nONT 9900 1105+13 1208+08 1405+02 1617-15 1630-28 162643 182151 222557\nORF 0137 0143-10 0138-12 0129-18 3610-29 1419-41 174754 224849 245849\nOTH 2136 2138+02 2142-03 2140-09 2257-24 2189-33 711546 712254 237652\nPDX 2018 2033+03 2040-03 2049-10 2143-23 2179-33 710647 712255 226754\nPFN 3534 3337-05 3345-09 3251-13 3059-23 2981-34 783043 783150 770054\nPHX 1017 1213+13 1012+07 0911+03 0611-14 1020-26 170942 231651 263059\nPIE 3226 3242-06 3153-05 3061-08 2885-16 7610-25 761641 772049 761753\nPIH      1908    2413+03 2720-03 2834-15 2744-29 275444 265154 285966\nPIR      3349-01 3261-07 3261-11 3383-23 3396-33 830649 832457 831563\nPLB 3620 0420-11 0519-15 0518-22 0209-33 2352-41 207955 214657 222756\nPRC              1007+07 9900+02 0606-14 1213-27 190943 231351 263060\nPSB      0127-12 0127-16 0128-22 2916-32 2226-43 192554 222556 262654\nPSX 2107 2921+02 3123-03 3433-07 3253-16 3061-26 307242 298851 299959\nPUB              2515+01 3018-03 3344-17 3463-28 346643 336554 324964\nPWM 0423 0517-09 0517-14 0611-19 2639-27 2360-38 198952 197558 226458\nRAP      3331+01 3245-05 3253-06 3261-20 3365-32 329646 820856 830566\nRBL 1711 2218+08 2331+02 2243-04 2262-17 2270-30 228344 228454 228161\nRDM      2314+07 2225+00 2238-08 2166-20 2284-31 710345 720754 238658\nRDU 3639 3634-09 3626-13 3526-19 3215-32 1727-45 211649 243148 254947\nRIC 0138 0135-10 3625-12 3625-18 2815-31 1937-43 184153 223451 244550\nRKS              2921    3124-03 3340-15 3153-29 315745 305955 316768\nRNO      2412    2232+05 2132+00 2242-16 2258-28 225543 225953 235963\nROA 3233 0128-10 3624-15 3417-20 2726-33 2425-46 250552 261751 273450\nROW      1106    0909+03 0208-02 3431-14 3431-26 333842 324353 305462\nSAC 2408 2313+10 2320+03 2132-01 2248-17 2258-28 216043 225753 226161\nSAN 1006 0807+13 1010+08 1112+03 1325-14 1430-28 162642 202049 232456\nSAT 2209 2413+03 3315-01 3422-04 3140-15 3046-25 306241 297551 298660\nSAV 3330 3334-11 3428-15 3526-22 3036-30 2976-35 289643 278945 269145\nSBA 9900 9900+13 9900+07 1805+01 1820-15 1736-28 162944 172452 223356\nSEA 2228 2033+03 2042-03 2053-10 2148-23 2162-35 710147 229854 215955\nSFO 3010 2616+10 2423+04 2129-01 2241-16 2253-28 215643 225253 225661\nSGF 2418 2523-07 2718-11 3126-13 3238-25 3339-36 324050 334958 336459\nSHV 2507 2915-05 3128-09 3135-13 3342-26 3255-38 327046 318349 319254\nSIY      2121+06 2238-01 2251-07 2264-18 2273-30 229945 720254 228657\nSLC      9900    2407+03 2714-01 2931-14 2844-28 274544 273754 284865\nSLN 3221 3428+01 3335-04 3340-10 3356-24 3481-34 349248 840657 339063\nSPI 2512 2809-09 3113-13 3217-19 3328-27 3444-38 345351 345460 335462\nSPS 2624 3218+04 3535-02 3538-09 3463-19 3369-30 338845 339355 319763\nSSM 2911 3608-10 3509-15 3509-21 3615-32 0129-42 015353 016562 353862\nSTL 2511 2912-08 3114-13 3119-18 3232-27 3343-37 335251 335260 335762\nSYR 3519 0224-11 0323-15 0323-21 0215-34 2326-43 203554 223355 242155\nT01 3306 3226+01 3236-04 3242-09 3166-17 2977-26 298842 299652 781159\nT06 0113 3325-02 3340-05 3249-11 3073-17 2887-27 289742 780652 781557\nT07 3521 3330-04 3337-07 3243-10 2970-19 2896-27 780742 771451 781556\nTCC      9900    3606+01 3417-04 3338-16 3447-27 345243 335953 326464\nTLH 3432 3340-08 3347-10 3258-14 3067-24 2981-35 783243 782350 279852\nTRI      3633-13 3529-16 3422-21 3418-34 3427-44 353751 322950 293850\nTUL 2620 3117-05 3330-06 3339-12 3449-24 3579-35 359948 359556 338959\nTUS      1223+14 1312+08 0814+03 0615-13 0818-26 180642 252350 263558\nTVC 2911 3408-10 3609-15 3611-21 3619-31 3633-42 015253 016461 354061\nTYS 3513 3632-12 3634-15 3636-21 3643-33 3551-42 345351 324751 304949\nWJF      0908+12 9900+08 1805+02 1817-15 1733-28 162644 172452 222757\nYKM 9900 1817+06 2023+00 2132-08 2154-22 2285-32 720246 721055 227058\nZUN              0606+04 0411+01 3624-13 3630-26 322243 312552 294062\n2XG 3148 3144-11 3041-15 2863-16 7702-20 7621-30 764641 763447 753048\n4J3 3424 3338-05 3348-07 3151-10 2977-19 7707-26 771842 771951 771554\n"
  },
  "windAloft24": {
    "@context": {
      "@version": "1.1",
      "@vocab": "https://api.weather.gov/ontology#"
    },
    "@id": "https://api.weather.gov/products/bc0f615c-1cf1-49ce-a8bd-ab0cfbe4e64f",
    "id": "bc0f615c-1cf1-49ce-a8bd-ab0cfbe4e64f",
    "wmoCollectiveId": "FBUS35",
    "issuingOffice": "KWNO",
    "issuanceTime": "2026-02-01T01:59:00+00:00",
    "productCode": "FD5",
    "productName": "Winds Aloft Forecast",
    "productText": "\n000\nFBUS35 KWNO 010159\nFD5US5\nDATA BASED ON 010000Z    \nVALID 020000Z   FOR USE 1800-0600Z. TEMPS NEG ABV 24000\n\nFT  3000    6000    9000   12000   18000   24000  30000  34000  39000\nABI      2406+07 3415+02 3419-01 3434-12 3440-26 324343 314952 316461\nABQ              2706+05 3106+01 0214-13 3411-27 272244 262952 273759\nABR 3316 3330-04 3340-06 3351-10 3262-21 3269-32 820047 822156 820662\nACK 0241 0236-07 3424-10 0113-15 0318-27 9900-38 232154 213255 235451\nACY 0128 3419-09 3217-14 2815-19 2323-29 1927-41 203056 232951 243850\nAGC 3122 3529-11 3530-16 3529-21 3534-33 3637-43 354253 333555 322952\nALB 3632 0326-10 0219-14 3617-21 2019-30 2245-41 213656 212855 252654\nALS                      3216+01 3326-14 3136-28 284144 293953 294562\nAMA      2425    2830+03 3125-01 3538-14 3445-27 325043 314852 305163\nAST 2227 2423-02 2428-07 2534-12 2747-25 2750-38 275252 265654 265353\nATL 3223 3323-06 3226-11 3130-17 3040-27 2937-39 284251 284852 295452\nAVP 3432 0231-10 0125-15 3619-21 2509-32 2040-42 212653 241852 262552\nAXN 3226 3336-06 3341-10 3348-14 3263-25 3399-33 821648 832556 328460\nBAM              2717+02 2628-03 2540-17 2448-31 236746 226655 236960\nBCE                      2711+00 2320-14 2235-28 224345 234153 254859\nBDL 0232 0227-08 0123-14 2915-18 2217-28 1817-40 213356 213356 243653\nBFF      2913    3027+01 3132-04 3149-17 3161-30 317345 317155 308064\nBGR 0434 0431-08 0427-13 3614-18 1710-27 2214-39 232754 233060 233555\nBHM 3113 3121-06 3025-12 3034-16 3157-27 3160-40 316949 316751 316551\nBIH      9900    9900+06 2608+00 2226-16 2234-29 214046 214154 234958\nBIL      2516    2829+03 2833-04 2750-20 2757-31 278346 277955 278965\nBLH 0710 1008+13 1210+07 1511+01 1523-15 1530-29 182941 212949 233653\nBML 3630 0426-09 0323-14 0215-21 2017-28 2428-39 233757 213658 252655\nBNA 3009 3017-08 2920-13 2926-18 3129-30 3024-40 311951 313652 325152\nBOI      2919+05 2721-02 2731-08 2551-20 2569-33 249546 239755 248761\nBOS 0235 0332-09 0223-12 2717-16 3111-27 2806-40 232855 213157 244053\nBRL 2617 3221-06 3121-11 3232-16 3343-27 3355-37 348948 348655 337055\nBRO 1110 2424+04 9900+02 3311+00 3225-12 3039-23 297237 287048 278657\nBUF 3419 0125-11 0126-16 0124-21 0131-33 0137-44 014354 363055 322354\nCAE 3225 3424-08 3330-12 3231-17 3144-28 3159-38 296550 286354 276550\nCAR 0422 0421-09 0520-14 0516-20 2122-28 2427-39 234254 223860 242857\nCGI 2416 2922-06 3033-11 3142-17 3248-28 3361-39 338448 338052 336852\nCHS 3324 3428-07 3326-12 3232-17 3151-28 3063-37 297048 277152 267248\nCLE 3410 3417-10 3517-15 3519-20 3524-32 3634-42 016352 365258 343356\nCLL 2314 3120+05 3321+01 3326-03 3244-13 3349-26 325942 316153 307759\nCMH 3210 3317-10 3319-14 3320-20 3425-31 3536-42 366152 355358 333555\nCOU 2722 3229-05 3243-08 3249-13 3368-25 8400-33 841348 842655 339357\nCRP 2105 2813+05 3412+02 3315+00 3229-13 3133-24 305140 298049 288357\nCRW 2916 3525-11 3529-15 3530-20 3433-31 3438-42 334052 334055 303452\nCSG 3320 3322-06 3125-11 3134-15 3147-27 2948-39 295449 295951 296052\nCVG 2908 3110-09 3013-14 3114-20 3324-29 3335-39 354252 354359 334655\nCZI              2912+03 3023-03 2842-18 2956-30 287445 287254 288065\nDAL 2619 3220+05 3328+01 3333-04 3246-15 3465-26 327042 326953 316463\nDBQ 2415 3018-08 2817-12 3125-16 3232-28 3337-37 335148 346454 336156\nDEN              3019+05 3118-02 3140-15 3051-29 305745 295354 296363\nDIK      3223-01 3228-03 3136-08 3160-21 3171-32 308746 800255 800165\nDLH 3120 3219-11 3332-10 3231-16 3128-28 3129-39 326049 337555 325755\nDLN              2633+01 2638-07 2546-19 2566-32 259046 249655 258963\nDRT 1610 9900+07 9900+03 9900+01 3317-12 3223-24 293740 296349 285958\nDSM 3321 3231-05 3340-08 3343-13 3377-22 3498-33 831547 842655 339261\nECK 3010 3310-09 3409-14 3510-20 3520-31 3635-41 365253 365360 353759\nEKN      3434-12 3434-15 3429-20 3532-33 3436-43 344152 323354 303251\nELP      1307    1811+04 9900+01 1013-12 0811-26 251741 263650 263658\nELY              2512+04 2717+00 2430-16 2439-29 234846 225255 236060\nEMI 3439 3627-10 3525-15 3526-21 3319-34 2712-44 261451 272452 273050\nEVV 2313 2616-08 2519-15 3025-18 3019-29 3013-39 360651 322355 334952\nEYW 3322 3229+01 3034-02 2851-05 2778-11 2693-22 761335 761845 751953\nFAT 3410 9900+11 9900+06 2612+00 2227-17 2325-29 213346 222953 234558\nGPI      2521+01 2630-05 2442-11 2440-25 2453-36 259348 249155 256855\nFLO 3329 3326-08 3329-13 3330-19 3140-30 3152-39 296248 286251 276650\nFMN              9900+04 3009+01 3007-14 2922-28 263245 263453 273959\nFOT 9900 2611+03 2822+01 2731-05 2647-20 2759-32 286049 256156 255454\nFSD 3323 3331-03 3336-07 3349-10 3367-21 3378-32 830946 832655 830662\nFSM 2721 3226+02 3242-05 3255-08 3367-20 3375-32 349945 841054 338461\nFWA 2408 2811-09 2810-14 3010-20 3321-29 3428-39 353652 353859 344657\nGAG      2727+09 2925+02 3131-03 3451-16 3462-28 326644 327054 326763\nGCK      3013+07 3120+02 3226-03 3351-16 3363-29 326744 326554 327163\nGEG      2629-01 2533-07 2541-13 2340-26 2245-39 248549 247653 246754\nGFK 3427 3334-08 3340-09 3347-14 3368-24 3389-34 820849 822256 327959\nGGW      2510+02 2922-02 2928-06 2953-21 2859-32 287948 780356 279364\nGJT              2309+03 2715+00 2723-14 2743-28 264845 264554 265161\nGLD      3010    3223+02 3330-03 3354-16 3262-29 326645 316654 317464\nGRB 2226 2135-10 2127-13 2418-17 2713-27 2614-37 261651 272159 323857\nGRI      3339+00 3340-02 3346-07 3359-20 3377-30 339146 830055 339962\nGSP 3119 3522-08 3324-13 3229-18 3242-29 3155-38 305550 295055 285352\nGTF      2628    2727-01 2519-07 2547-23 2567-32 259347 751056 258161\nH51 0705 2819+03 3315+00 3421-01 3237-13 3140-24 296939 298648 770257\nH52 3613 3424+01 3235-02 3239-06 3165-13 3077-24 299340 781547 772756\nH61 3319 3227-01 3134-04 3140-09 2966-18 7705-25 772037 772446 763253\nHAT 3333 3125-07 2930-12 2629-18 2223-31 2225-44 265047 256747 256646\nHOU 2612 3124+05 3322+00 3427-03 3248-14 3254-26 316842 317352 298658\nHSV 3011 3120-07 3024-12 3031-17 3147-28 3149-41 315350 315751 315851\nICT 3220 3132+05 3142-02 3245-06 3353-19 3475-29 349045 339355 339062\nILM 3333 3228-08 3124-13 2824-19 3033-32 3045-39 285547 276549 266948\nIMB              2727-06 2741-10 2646-23 2564-35 248650 239054 246756\nIND 2411 2612-09 2713-14 2712-19 3217-28 3321-39 352451 342859 334655\nINK      2011+09 9900+04 2705+01 0317-12 0315-25 292442 293551 294559\nINL 3123 3322-13 3227-12 3230-17 3236-28 3246-38 326549 327454 325254\nJAN 2816 2823-05 3139-05 3147-09 3274-22 3290-33 339148 339354 810855\nJAX 3122 3327-04 3333-08 3237-13 3051-24 2955-35 275947 267251 760049\nJFK 0229 0118-09 3417-14 2814-18 2216-29 1825-41 223256 212853 243952\nJOT 2223 2128-10 2416-12 2815-17 2910-28 2909-37 321150 321858 334755\nLAS      9900+13 2206+06 2107+01 2016-15 1922-29 193945 213551 234557\nLBB      2321+09 2816+04 3121+00 3526-13 3533-26 323843 314352 315162\nLCH 3017 3229+03 3229-02 3435-05 3361-16 3271-27 317843 318353 309558\nLIT 2522 3235+00 3337-07 3254-11 3284-21 3390-33 830748 842055 329957\nLKV              2723-03 2635-06 2541-21 2560-34 238048 238354 246059\nLND              2822+04 2926+00 2737-16 2750-29 276446 266455 267064\nLOU 2807 2911-08 2914-14 2915-19 3223-29 3226-39 342751 333158 324553\nLRD 1513 1808+06 9900+04 3506+00 3220-12 3031-23 296138 296649 277758\nLSE 2715 2817-10 2819-11 3022-15 3233-28 3237-37 336648 337155 326256\nLWS 2609 2631+00 2533-06 2536-12 2442-26 2569-35 249849 740255 247857\nMBW              2738    2934-02 2836-16 2954-29 296445 285754 286563\nMCW 3227 3234-06 3343-08 3346-13 3360-25 3494-33 831648 843055 338460\nMEM 2721 3128-05 3241-09 3251-15 3272-27 3296-35 831349 830254 328453\nMGM 3416 3222-05 3126-10 3037-14 3158-26 3163-39 317748 307351 307152\nMIA 3018 3227+01 3029-03 2839-08 2687-12 7603-23 762437 753644 753754\nMKC 3422 3238-01 3242-06 3352-10 3378-21 3386-33 841246 842955 349861\nMKG 2320 2417-10 2313-14 2411-19 3213-27 3419-38 352351 352860 344260\nMLB 3019 3227-03 3134-06 3038-10 2937-23 2690-29 752139 752545 753750\nMLS      2612+04 2924-01 3034-05 2954-19 2960-31 288046 289355 289465\nMOB 3415 3122-04 3134-07 3246-10 3264-22 3290-32 318447 318654 800954\nMOT      3325-04 3333-06 3243-10 3151-22 3155-33 308548 801357 800362\nMQT 2235 2140-09 2133-13 2223-16 2617-28 2616-38 261952 262660 313258\nMRF              1609+04 1405+00 0209-12 3309-24 282540 285850 284958\nMSP 3124 3430-07 3339-09 3342-14 3247-27 3477-35 831648 832356 327758\nMSY 3014 3022-02 3236-04 3340-07 3369-18 3274-31 318745 810251 800758\nOKC 2816 3024+06 3234+00 3242-04 3250-18 3471-28 338045 338154 337561\nOMA 3221 3332-02 3336-06 3352-10 3369-21 3380-32 830846 832755 840561\nONL      3342-01 3343-02 3347-07 3259-20 3276-30 329246 820455 820163\nONT 9900 1106+13 1007+06 1008+00 1518-16 1523-30 182641 212549 233754\nORF 3338 3323-09 3022-14 2818-20 2330-31 2237-44 262750 253949 265247\nOTH 2120 2420-01 2529-03 2635-08 2746-23 2747-37 265050 256554 265154\nPDX 2219 2424-02 2530-07 2534-12 2749-25 2753-38 265851 256354 255152\nPFN 3621 3222-04 3130-08 3141-11 3055-24 3064-34 307847 298352 299151\nPHX 1113 1409+14 1509+06 1608+02 1520-14 1527-27 192943 212850 243455\nPIE 3325 3329-02 3231-06 3138-10 3038-22 2956-31 760439 760945 752551\nPIH      2218    2627+02 2529-04 2549-18 2554-30 257146 247356 257962\nPIR      3236+00 3238-03 3243-08 3265-20 3279-30 329047 810156 810765\nPLB 0124 0326-10 0322-15 0215-21 2207-32 2127-42 212954 232456 251655\nPRC              9900+06 1805+02 1716-14 1728-28 183344 213051 243656\nPSB      3632-10 3627-15 3626-21 3528-35 3529-45 352652 321952 302552\nPSX 2608 3017+05 3315+01 3420-02 3239-13 3244-25 315742 297350 298057\nPUB              2809+04 3221+00 3334-15 3244-28 305145 304954 305863\nPWM 0435 0430-08 0430-14 3116-17 1606-27 2813-40 242356 213459 243554\nRAP      2912+03 3128-01 3134-05 3155-19 3167-30 307746 308455 309366\nRBL 3607 3006+05 2816+02 2629-03 2642-19 2551-32 245547 236956 244959\nRDM      2519+00 2630-06 2637-09 2641-23 2657-36 247650 247754 245856\nRDU 3435 3427-08 3328-14 3332-20 3233-32 3138-41 304549 284451 275249\nRIC 3336 3426-09 3424-14 3326-21 3226-33 2922-43 292350 273150 274049\nRKS              2724    2830-03 2739-16 2751-29 275946 265755 266362\nRNO      2706    2514+03 2622-02 2533-17 2438-31 235446 235555 236460\nROA 3133 3534-09 3426-14 3324-20 3334-33 3340-42 324251 313753 294250\nROW      2115    2312+05 3208+01 0315-13 3613-26 282143 282951 284059\nSAC 3411 9900+08 2712+04 2721-02 2528-17 2433-31 234946 235355 245459\nSAN 9900 1308+13 1305+06 1606+00 1913-15 1816-30 192440 212448 243551\nSAT 2107 2606+05 3311+02 3314+00 3326-12 3130-24 304240 297149 286957\nSAV 3223 3426-06 3330-10 3235-16 3153-26 3061-36 286349 277054 267450\nSBA 9900 9900+13 0206+07 3505+00 1708-17 1711-30 221443 212650 243655\nSEA 2329 2427-03 2529-08 2632-13 2832-27 2853-39 286052 265652 254951\nSFO 3412 3105+09 2810+04 2819-01 2523-17 2427-31 244446 234655 244858\nSGF 2732 3143-01 3153-08 3263-12 3386-20 3392-33 841547 843155 339560\nSHV 2516 3328+02 3234-02 3247-06 3361-18 3271-30 349644 338653 317662\nSIY      9900+02 2623-01 2634-06 2546-22 2559-34 245949 247554 245255\nSLC      1906    2517+04 2622-02 2636-17 2549-29 256046 246155 246561\nSLN 3423 3128+03 3239-02 3243-06 3355-20 3375-29 339246 339955 339362\nSPI 2422 2714-08 2820-12 3023-17 3230-28 3333-38 332949 345253 335953\nSPS 2811 3017+07 3223+01 3231-02 3342-16 3458-27 336443 326353 315462\nSSM 2418 2215-09 2314-15 2314-20 3009-29 3317-39 352652 333260 333663\nSTL 2425 3121-06 3029-11 3134-16 3347-27 3363-38 349548 348853 337154\nSYR 3422 0228-11 0228-16 0226-22 0219-34 0106-45 990052 290754 281654\nT01 3213 3127+02 3229-01 3432-04 3256-14 3163-25 317342 308751 299657\nT06 3112 3127+00 3236-03 3336-06 3263-15 3176-27 318942 309552 790556\nT07 3415 3223-02 3134-05 3242-08 3366-18 3176-30 308944 801249 299952\nTCC      2324    2920+06 3216+01 3630-14 3427-27 313743 304352 304562\nTLH 3423 3325-04 3126-08 3037-13 2951-24 2857-35 286648 287352 288251\nTRI      3426-10 3427-14 3327-19 3334-30 3247-40 325451 315355 294852\nTUL 2921 3128+04 3243-04 3253-07 3261-20 3368-30 349545 840454 348162\nTUS      1312+14 2105+07 1707+01 1421-14 1521-26 222742 232950 253454\nTVC 2320 2317-10 2215-14 2313-19 3111-28 3318-38 342352 342760 333961\nTYS 2909 3420-09 3323-13 3225-19 3232-29 3140-39 313951 303957 304452\nWJF      9900+13 9900+07 9900+00 1616-16 1620-30 192643 202750 243855\nYKM 2417 2631-01 2732-06 2735-13 2745-26 2760-39 257350 257353 246054\nZUN              9900+06 9900+02 1308-13 1905-27 222344 242852 263858\n2XG 3127 3125-05 3025-11 3040-14 2961-24 2767-33 259444 752147 752750\n4J3 3517 3224-03 3231-06 3139-10 3046-21 3063-32 298043 289047 770551\n"
  },
  "sounding": [
    {
      "Pressure_mb": 882.9,
      "Altitude_m": 1289,
      "Temp_c": -0.7,
      "Dewpoint_c": -1.8,
      "Wind_Direction": 272,
      "Wind_Speed_kt": 0.5
    },
    {
      "Pressure_mb": 882.4,
      "Altitude_m": 1294,
      "Temp_c": -0.4,
      "Dewpoint_c": -1.9,
      "Wind_Direction": 63,
      "Wind_Speed_kt": 1.4
    },
    {
      "Pressure_mb": 881.8,
      "Altitude_m": 1300,
      "Temp_c": -0.2,
      "Dewpoint_c": -1.9,
      "Wind_Direction": 63,
      "Wind_Speed_kt": 1.4
    },
    {
      "Pressure_mb": 881.2,
      "Altitude_m": 1305,
      "Temp_c": 0.1,
      "Dewpoint_c": -1.9,
      "Wind_Direction": 63,
      "Wind_Speed_kt": 1.4
    },
    {
      "Pressure_mb": 880.7,
      "Altitude_m": 1311,
      "Temp_c": 0.3,
      "Dewpoint_c": -2,
      "Wind_Direction": 64,
      "Wind_Speed_kt": 1.4
    },
    {
      "Pressure_mb": 880.1,
      "Altitude_m": 1316,
      "Temp_c": 0.6,
      "Dewpoint_c": -2,
      "Wind_Direction": 64,
      "Wind_Speed_kt": 1.4
    },
    {
      "Pressure_mb": 879.5,
      "Altitude_m": 1320,
      "Temp_c": 0.9,
      "Dewpoint_c": -2.1,
      "Wind_Direction": 64,
      "Wind_Speed_kt": 1.4
    },
    {
      "Pressure_mb": 879,
      "Altitude_m": 1324,
      "Temp_c": 1.1,
      "Dewpoint_c": -2.2,
      "Wind_Direction": 70,
      "Wind_Speed_kt": 1.4
    },
    {
      "Pressure_mb": 878.6,
      "Altitude_m": 1328,
      "Temp_c": 1.3,
      "Dewpoint_c": -2.2,
      "Wind_Direction": 77,
      "Wind_Speed_kt": 1.4
    },
    {
      "Pressure_mb": 878.1,
      "Altitude_m": 1332,
      "Temp_c": 1.6,
      "Dewpoint_c": -2.3,
      "Wind_Direction": 84,
      "Wind_Speed_kt": 1.4
    },
    {
      "Pressure_mb": 877.7,
      "Altitude_m": 1337,
      "Temp_c": 1.8,
      "Dewpoint_c": -2.3,
      "Wind_Direction": 91,
      "Wind_Speed_kt": 1.5
    },
    {
      "Pressure_mb": 877.2,
      "Altitude_m": 1341,
      "Temp_c": 2.1,
      "Dewpoint_c": -2.4,
      "Wind_Direction": 98,
      "Wind_Speed_kt": 1.5
    },
    {
      "Pressure_mb": 876.8,
      "Altitude_m": 1345,
      "Temp_c": 2.3,
      "Dewpoint_c": -2.4,
      "Wind_Direction": 105,
      "Wind_Speed_kt": 1.5
    },
    {
      "Pressure_mb": 876.3,
      "Altitude_m": 1349,
      "Temp_c": 2.5,
      "Dewpoint_c": -2.5,
      "Wind_Direction": 112,
      "Wind_Speed_kt": 1.5
    },
    {
      "Pressure_mb": 875.8,
      "Altitude_m": 1354,
      "Temp_c": 2.8,
      "Dewpoint_c": -2.5,
      "Wind_Direction": 118,
      "Wind_Speed_kt": 1.5
    },
    {
      "Pressure_mb": 875.3,
      "Altitude_m": 1358,
      "Temp_c": 3,
      "Dewpoint_c": -2.6,
      "Wind_Direction": 124,
      "Wind_Speed_kt": 1.5
    },
    {
      "Pressure_mb": 874.9,
      "Altitude_m": 1363,
      "Temp_c": 3.2,
      "Dewpoint_c": -2.7,
      "Wind_Direction": 128,
      "Wind_Speed_kt": 1.6
    },
    {
      "Pressure_mb": 874.4,
      "Altitude_m": 1367,
      "Temp_c": 3.5,
      "Dewpoint_c": -2.8,
      "Wind_Direction": 131,
      "Wind_Speed_kt": 1.7
    },
    {
      "Pressure_mb": 873.9,
      "Altitude_m": 1371,
      "Temp_c": 3.7,
      "Dewpoint_c": -2.9,
      "Wind_Direction": 134,
      "Wind_Speed_kt": 1.7
    },
    {
      "Pressure_mb": 873.2,
      "Altitude_m": 1377,
      "Temp_c": 4,
      "Dewpoint_c": -3,
      "Wind_Direction": 138,
      "Wind_Speed_kt": 1.9
    },
    {
      "Pressure_mb": 872.8,
      "Altitude_m": 1381,
      "Temp_c": 4,
      "Dewpoint_c": -3.2,
      "Wind_Direction": 140,
      "Wind_Speed_kt": 1.9
    },
    {
      "Pressure_mb": 872.2,
      "Altitude_m": 1386,
      "Temp_c": 4,
      "Dewpoint_c": -3.4,
      "Wind_Direction": 142,
      "Wind_Speed_kt": 2
    },
    {
      "Pressure_mb": 871.7,
      "Altitude_m": 1392,
      "Temp_c": 4,
      "Dewpoint_c": -3.5,
      "Wind_Direction": 145,
      "Wind_Speed_kt": 2.1
    },
    {
      "Pressure_mb": 871.1,
      "Altitude_m": 1397,
      "Temp_c": 4,
      "Dewpoint_c": -3.7,
      "Wind_Direction": 147,
      "Wind_Speed_kt": 2.2
    },
    {
      "Pressure_mb": 870.6,
      "Altitude_m": 1403,
      "Temp_c": 4,
      "Dewpoint_c": -3.9,
      "Wind_Direction": 148,
      "Wind_Speed_kt": 2.3
    },
    {
      "Pressure_mb": 870,
      "Altitude_m": 1408,
      "Temp_c": 4,
      "Dewpoint_c": -4.1,
      "Wind_Direction": 150,
      "Wind_Speed_kt": 2.4
    },
    {
      "Pressure_mb": 869.5,
      "Altitude_m": 1413,
      "Temp_c": 3.9,
      "Dewpoint_c": -4.3,
      "Wind_Direction": 152,
      "Wind_Speed_kt": 2.4
    },
    {
      "Pressure_mb": 869,
      "Altitude_m": 1418,
      "Temp_c": 3.9,
      "Dewpoint_c": -4.5,
      "Wind_Direction": 153,
      "Wind_Speed_kt": 2.5
    },
    {
      "Pressure_mb": 868.5,
      "Altitude_m": 1423,
      "Temp_c": 3.9,
      "Dewpoint_c": -4.7,
      "Wind_Direction": 154,
      "Wind_Speed_kt": 2.6
    },
    {
      "Pressure_mb": 867.9,
      "Altitude_m": 1427,
      "Temp_c": 3.9,
      "Dewpoint_c": -4.9,
      "Wind_Direction": 157,
      "Wind_Speed_kt": 2.7
    },
    {
      "Pressure_mb": 867.4,
      "Altitude_m": 1432,
      "Temp_c": 3.9,
      "Dewpoint_c": -5.1,
      "Wind_Direction": 160,
      "Wind_Speed_kt": 2.9
    },
    {
      "Pressure_mb": 866.9,
      "Altitude_m": 1437,
      "Temp_c": 3.9,
      "Dewpoint_c": -5.3,
      "Wind_Direction": 163,
      "Wind_Speed_kt": 3
    },
    {
      "Pressure_mb": 866.4,
      "Altitude_m": 1442,
      "Temp_c": 3.9,
      "Dewpoint_c": -5.5,
      "Wind_Direction": 165,
      "Wind_Speed_kt": 3.1
    },
    {
      "Pressure_mb": 865.9,
      "Altitude_m": 1447,
      "Temp_c": 3.9,
      "Dewpoint_c": -5.7,
      "Wind_Direction": 168,
      "Wind_Speed_kt": 3.2
    },
    {
      "Pressure_mb": 865.4,
      "Altitude_m": 1451,
      "Temp_c": 3.9,
      "Dewpoint_c": -5.7,
      "Wind_Direction": 170,
      "Wind_Speed_kt": 3.3
    },
    {
      "Pressure_mb": 864.9,
      "Altitude_m": 1456,
      "Temp_c": 3.9,
      "Dewpoint_c": -5.8,
      "Wind_Direction": 172,
      "Wind_Speed_kt": 3.4
    },
    {
      "Pressure_mb": 864.4,
      "Altitude_m": 1461,
      "Temp_c": 3.8,
      "Dewpoint_c": -5.9,
      "Wind_Direction": 174,
      "Wind_Speed_kt": 3.6
    },
    {
      "Pressure_mb": 863.9,
      "Altitude_m": 1466,
      "Temp_c": 3.8,
      "Dewpoint_c": -5.9,
      "Wind_Direction": 175,
      "Wind_Speed_kt": 3.7
    },
    {
      "Pressure_mb": 863.4,
      "Altitude_m": 1470,
      "Temp_c": 3.8,
      "Dewpoint_c": -6,
      "Wind_Direction": 177,
      "Wind_Speed_kt": 3.8
    },
    {
      "Pressure_mb": 862.9,
      "Altitude_m": 1475,
      "Temp_c": 3.8,
      "Dewpoint_c": -6.1,
      "Wind_Direction": 178,
      "Wind_Speed_kt": 3.9
    },
    {
      "Pressure_mb": 862.4,
      "Altitude_m": 1480,
      "Temp_c": 3.8,
      "Dewpoint_c": -6.1,
      "Wind_Direction": 180,
      "Wind_Speed_kt": 4
    },
    {
      "Pressure_mb": 861.9,
      "Altitude_m": 1484,
      "Temp_c": 3.8,
      "Dewpoint_c": -6.2,
      "Wind_Direction": 181,
      "Wind_Speed_kt": 4.1
    },
    {
      "Pressure_mb": 861.4,
      "Altitude_m": 1489,
      "Temp_c": 3.8,
      "Dewpoint_c": -6.3,
      "Wind_Direction": 182,
      "Wind_Speed_kt": 4.3
    },
    {
      "Pressure_mb": 860.9,
      "Altitude_m": 1494,
      "Temp_c": 3.8,
      "Dewpoint_c": -6.3,
      "Wind_Direction": 184,
      "Wind_Speed_kt": 4.3
    },
    {
      "Pressure_mb": 860.2,
      "Altitude_m": 1500,
      "Temp_c": 3.7,
      "Dewpoint_c": -6.4,
      "Wind_Direction": 185,
      "Wind_Speed_kt": 4.5
    },
    {
      "Pressure_mb": 859.9,
      "Altitude_m": 1503,
      "Temp_c": 3.7,
      "Dewpoint_c": -6.5,
      "Wind_Direction": 186,
      "Wind_Speed_kt": 4.6
    },
    {
      "Pressure_mb": 859.4,
      "Altitude_m": 1507,
      "Temp_c": 3.7,
      "Dewpoint_c": -6.5,
      "Wind_Direction": 186,
      "Wind_Speed_kt": 4.7
    },
    {
      "Pressure_mb": 858.9,
      "Altitude_m": 1512,
      "Temp_c": 3.7,
      "Dewpoint_c": -6.6,
      "Wind_Direction": 187,
      "Wind_Speed_kt": 4.8
    },
    {
      "Pressure_mb": 858.4,
      "Altitude_m": 1517,
      "Temp_c": 3.7,
      "Dewpoint_c": -6.6,
      "Wind_Direction": 187,
      "Wind_Speed_kt": 4.8
    },
    {
      "Pressure_mb": 857.9,
      "Altitude_m": 1521,
      "Temp_c": 3.7,
      "Dewpoint_c": -6.7,
      "Wind_Direction": 188,
      "Wind_Speed_kt": 4.9
    },
    {
      "Pressure_mb": 857.4,
      "Altitude_m": 1526,
      "Temp_c": 3.6,
      "Dewpoint_c": -6.7,
      "Wind_Direction": 188,
      "Wind_Speed_kt": 5
    },
    {
      "Pressure_mb": 856.8,
      "Altitude_m": 1531,
      "Temp_c": 3.6,
      "Dewpoint_c": -6.8,
      "Wind_Direction": 189,
      "Wind_Speed_kt": 5.1
    },
    {
      "Pressure_mb": 856.3,
      "Altitude_m": 1536,
      "Temp_c": 3.6,
      "Dewpoint_c": -6.8,
      "Wind_Direction": 189,
      "Wind_Speed_kt": 5.1
    },
    {
      "Pressure_mb": 855.8,
      "Altitude_m": 1542,
      "Temp_c": 3.6,
      "Dewpoint_c": -6.8,
      "Wind_Direction": 190,
      "Wind_Speed_kt": 5.2
    },
    {
      "Pressure_mb": 855.3,
      "Altitude_m": 1547,
      "Temp_c": 3.5,
      "Dewpoint_c": -6.9,
      "Wind_Direction": 190,
      "Wind_Speed_kt": 5.3
    },
    {
      "Pressure_mb": 854.8,
      "Altitude_m": 1552,
      "Temp_c": 3.5,
      "Dewpoint_c": -6.9,
      "Wind_Direction": 191,
      "Wind_Speed_kt": 5.4
    },
    {
      "Pressure_mb": 854.2,
      "Altitude_m": 1557,
      "Temp_c": 3.5,
      "Dewpoint_c": -7,
      "Wind_Direction": 191,
      "Wind_Speed_kt": 5.4
    },
    {
      "Pressure_mb": 853.7,
      "Altitude_m": 1562,
      "Temp_c": 3.5,
      "Dewpoint_c": -7,
      "Wind_Direction": 192,
      "Wind_Speed_kt": 5.5
    },
    {
      "Pressure_mb": 853.2,
      "Altitude_m": 1567,
      "Temp_c": 3.4,
      "Dewpoint_c": -7.1,
      "Wind_Direction": 192,
      "Wind_Speed_kt": 5.6
    },
    {
      "Pressure_mb": 852.7,
      "Altitude_m": 1571,
      "Temp_c": 3.4,
      "Dewpoint_c": -7.1,
      "Wind_Direction": 192,
      "Wind_Speed_kt": 5.7
    },
    {
      "Pressure_mb": 852.3,
      "Altitude_m": 1574,
      "Temp_c": 3.4,
      "Dewpoint_c": -7.1,
      "Wind_Direction": 193,
      "Wind_Speed_kt": 5.7
    },
    {
      "Pressure_mb": 851.7,
      "Altitude_m": 1581,
      "Temp_c": 3.5,
      "Dewpoint_c": -7.1,
      "Wind_Direction": 193,
      "Wind_Speed_kt": 5.8
    },
    {
      "Pressure_mb": 851.2,
      "Altitude_m": 1586,
      "Temp_c": 3.5,
      "Dewpoint_c": -7.1,
      "Wind_Direction": 193,
      "Wind_Speed_kt": 5.9
    },
    {
      "Pressure_mb": 850.7,
      "Altitude_m": 1591,
      "Temp_c": 3.6,
      "Dewpoint_c": -7,
      "Wind_Direction": 194,
      "Wind_Speed_kt": 6
    },
    {
      "Pressure_mb": 850,
      "Altitude_m": 1597,
      "Temp_c": 3.6,
      "Dewpoint_c": -7,
      "Wind_Direction": 194,
      "Wind_Speed_kt": 6.1
    },
    {
      "Pressure_mb": 849.7,
      "Altitude_m": 1600,
      "Temp_c": 3.7,
      "Dewpoint_c": -7,
      "Wind_Direction": 195,
      "Wind_Speed_kt": 6.2
    },
    {
      "Pressure_mb": 849.2,
      "Altitude_m": 1605,
      "Temp_c": 3.7,
      "Dewpoint_c": -6.9,
      "Wind_Direction": 194,
      "Wind_Speed_kt": 6.2
    },
    {
      "Pressure_mb": 848.6,
      "Altitude_m": 1610,
      "Temp_c": 3.8,
      "Dewpoint_c": -6.9,
      "Wind_Direction": 194,
      "Wind_Speed_kt": 6.2
    },
    {
      "Pressure_mb": 848.1,
      "Altitude_m": 1614,
      "Temp_c": 3.8,
      "Dewpoint_c": -6.9,
      "Wind_Direction": 194,
      "Wind_Speed_kt": 6.2
    },
    {
      "Pressure_mb": 847.6,
      "Altitude_m": 1619,
      "Temp_c": 3.9,
      "Dewpoint_c": -6.8,
      "Wind_Direction": 194,
      "Wind_Speed_kt": 6.2
    },
    {
      "Pressure_mb": 847.1,
      "Altitude_m": 1624,
      "Temp_c": 3.9,
      "Dewpoint_c": -6.8,
      "Wind_Direction": 194,
      "Wind_Speed_kt": 6.2
    },
    {
      "Pressure_mb": 846.6,
      "Altitude_m": 1629,
      "Temp_c": 4,
      "Dewpoint_c": -6.8,
      "Wind_Direction": 194,
      "Wind_Speed_kt": 6.2
    },
    {
      "Pressure_mb": 846.1,
      "Altitude_m": 1634,
      "Temp_c": 4,
      "Dewpoint_c": -6.7,
      "Wind_Direction": 194,
      "Wind_Speed_kt": 6.3
    },
    {
      "Pressure_mb": 845.6,
      "Altitude_m": 1639,
      "Temp_c": 4.1,
      "Dewpoint_c": -6.7,
      "Wind_Direction": 194,
      "Wind_Speed_kt": 6.3
    },
    {
      "Pressure_mb": 845,
      "Altitude_m": 1644,
      "Temp_c": 4.1,
      "Dewpoint_c": -6.7,
      "Wind_Direction": 194,
      "Wind_Speed_kt": 6.3
    },
    {
      "Pressure_mb": 844.5,
      "Altitude_m": 1649,
      "Temp_c": 4.1,
      "Dewpoint_c": -6.7,
      "Wind_Direction": 194,
      "Wind_Speed_kt": 6.3
    },
    {
      "Pressure_mb": 844,
      "Altitude_m": 1654,
      "Temp_c": 4.2,
      "Dewpoint_c": -6.7,
      "Wind_Direction": 194,
      "Wind_Speed_kt": 6.3
    },
    {
      "Pressure_mb": 843.5,
      "Altitude_m": 1659,
      "Temp_c": 4.2,
      "Dewpoint_c": -6.7,
      "Wind_Direction": 194,
      "Wind_Speed_kt": 6.3
    },
    {
      "Pressure_mb": 843,
      "Altitude_m": 1664,
      "Temp_c": 4.2,
      "Dewpoint_c": -6.7,
      "Wind_Direction": 194,
      "Wind_Speed_kt": 6.3
    },
    {
      "Pressure_mb": 842.5,
      "Altitude_m": 1669,
      "Temp_c": 4.2,
      "Dewpoint_c": -6.7,
      "Wind_Direction": 194,
      "Wind_Speed_kt": 6.3
    },
    {
      "Pressure_mb": 842,
      "Altitude_m": 1674,
      "Temp_c": 4.3,
      "Dewpoint_c": -6.7,
      "Wind_Direction": 194,
      "Wind_Speed_kt": 6.4
    },
    {
      "Pressure_mb": 841.5,
      "Altitude_m": 1679,
      "Temp_c": 4.3,
      "Dewpoint_c": -6.7,
      "Wind_Direction": 194,
      "Wind_Speed_kt": 6.4
    },
    {
      "Pressure_mb": 841,
      "Altitude_m": 1684,
      "Temp_c": 4.3,
      "Dewpoint_c": -6.6,
      "Wind_Direction": 194,
      "Wind_Speed_kt": 6.4
    },
    {
      "Pressure_mb": 840.5,
      "Altitude_m": 1689,
      "Temp_c": 4.3,
      "Dewpoint_c": -6.6,
      "Wind_Direction": 194,
      "Wind_Speed_kt": 6.4
    },
    {
      "Pressure_mb": 839.9,
      "Altitude_m": 1693,
      "Temp_c": 4.4,
      "Dewpoint_c": -6.6,
      "Wind_Direction": 194,
      "Wind_Speed_kt": 6.4
    },
    {
      "Pressure_mb": 839.4,
      "Altitude_m": 1698,
      "Temp_c": 4.4,
      "Dewpoint_c": -6.6,
      "Wind_Direction": 194,
      "Wind_Speed_kt": 6.4
    },
    {
      "Pressure_mb": 838.9,
      "Altitude_m": 1703,
      "Temp_c": 4.4,
      "Dewpoint_c": -6.6,
      "Wind_Direction": 194,
      "Wind_Speed_kt": 6.4
    },
    {
      "Pressure_mb": 838.7,
      "Altitude_m": 1706,
      "Temp_c": 4.4,
      "Dewpoint_c": -6.6,
      "Wind_Direction": 194,
      "Wind_Speed_kt": 6.3
    },
    {
      "Pressure_mb": 837.9,
      "Altitude_m": 1713,
      "Temp_c": 4.4,
      "Dewpoint_c": -6.7,
      "Wind_Direction": 193,
      "Wind_Speed_kt": 6.3
    },
    {
      "Pressure_mb": 837.4,
      "Altitude_m": 1718,
      "Temp_c": 4.4,
      "Dewpoint_c": -6.7,
      "Wind_Direction": 193,
      "Wind_Speed_kt": 6.2
    },
    {
      "Pressure_mb": 836.9,
      "Altitude_m": 1723,
      "Temp_c": 4.4,
      "Dewpoint_c": -6.8,
      "Wind_Direction": 193,
      "Wind_Speed_kt": 6.2
    },
    {
      "Pressure_mb": 836.4,
      "Altitude_m": 1728,
      "Temp_c": 4.4,
      "Dewpoint_c": -6.8,
      "Wind_Direction": 192,
      "Wind_Speed_kt": 6.1
    },
    {
      "Pressure_mb": 835.9,
      "Altitude_m": 1733,
      "Temp_c": 4.4,
      "Dewpoint_c": -6.9,
      "Wind_Direction": 192,
      "Wind_Speed_kt": 6
    },
    {
      "Pressure_mb": 835.5,
      "Altitude_m": 1737,
      "Temp_c": 4.3,
      "Dewpoint_c": -6.9,
      "Wind_Direction": 191,
      "Wind_Speed_kt": 6
    },
    {
      "Pressure_mb": 835,
      "Altitude_m": 1742,
      "Temp_c": 4.3,
      "Dewpoint_c": -6.9,
      "Wind_Direction": 191,
      "Wind_Speed_kt": 5.9
    },
    {
      "Pressure_mb": 834.5,
      "Altitude_m": 1746,
      "Temp_c": 4.3,
      "Dewpoint_c": -7,
      "Wind_Direction": 191,
      "Wind_Speed_kt": 5.9
    },
    {
      "Pressure_mb": 834,
      "Altitude_m": 1751,
      "Temp_c": 4.3,
      "Dewpoint_c": -7,
      "Wind_Direction": 190,
      "Wind_Speed_kt": 5.8
    },
    {
      "Pressure_mb": 833.5,
      "Altitude_m": 1755,
      "Temp_c": 4.3,
      "Dewpoint_c": -7.1,
      "Wind_Direction": 190,
      "Wind_Speed_kt": 5.8
    },
    {
      "Pressure_mb": 833.1,
      "Altitude_m": 1760,
      "Temp_c": 4.3,
      "Dewpoint_c": -7.1,
      "Wind_Direction": 189,
      "Wind_Speed_kt": 5.7
    },
    {
      "Pressure_mb": 832.6,
      "Altitude_m": 1765,
      "Temp_c": 4.3,
      "Dewpoint_c": -7.1,
      "Wind_Direction": 189,
      "Wind_Speed_kt": 5.7
    },
    {
      "Pressure_mb": 832.1,
      "Altitude_m": 1770,
      "Temp_c": 4.3,
      "Dewpoint_c": -7.2,
      "Wind_Direction": 188,
      "Wind_Speed_kt": 5.6
    },
    {
      "Pressure_mb": 831.6,
      "Altitude_m": 1774,
      "Temp_c": 4.3,
      "Dewpoint_c": -7.2,
      "Wind_Direction": 188,
      "Wind_Speed_kt": 5.6
    },
    {
      "Pressure_mb": 831.1,
      "Altitude_m": 1779,
      "Temp_c": 4.2,
      "Dewpoint_c": -7.3,
      "Wind_Direction": 187,
      "Wind_Speed_kt": 5.5
    },
    {
      "Pressure_mb": 830.7,
      "Altitude_m": 1784,
      "Temp_c": 4.2,
      "Dewpoint_c": -7.3,
      "Wind_Direction": 187,
      "Wind_Speed_kt": 5.5
    },
    {
      "Pressure_mb": 830.2,
      "Altitude_m": 1789,
      "Temp_c": 4.2,
      "Dewpoint_c": -7.4,
      "Wind_Direction": 187,
      "Wind_Speed_kt": 5.4
    },
    {
      "Pressure_mb": 829.7,
      "Altitude_m": 1793,
      "Temp_c": 4.2,
      "Dewpoint_c": -7.4,
      "Wind_Direction": 186,
      "Wind_Speed_kt": 5.4
    },
    {
      "Pressure_mb": 829,
      "Altitude_m": 1800,
      "Temp_c": 4.2,
      "Dewpoint_c": -7.4,
      "Wind_Direction": 186,
      "Wind_Speed_kt": 5.6
    },
    {
      "Pressure_mb": 828.8,
      "Altitude_m": 1802,
      "Temp_c": 4.2,
      "Dewpoint_c": -7.5,
      "Wind_Direction": 186,
      "Wind_Speed_kt": 5.6
    },
    {
      "Pressure_mb": 828.3,
      "Altitude_m": 1807,
      "Temp_c": 4.2,
      "Dewpoint_c": -7.5,
      "Wind_Direction": 186,
      "Wind_Speed_kt": 5.7
    },
    {
      "Pressure_mb": 827.8,
      "Altitude_m": 1811,
      "Temp_c": 4.2,
      "Dewpoint_c": -7.5,
      "Wind_Direction": 186,
      "Wind_Speed_kt": 5.8
    },
    {
      "Pressure_mb": 827.3,
      "Altitude_m": 1816,
      "Temp_c": 4.2,
      "Dewpoint_c": -7.6,
      "Wind_Direction": 186,
      "Wind_Speed_kt": 6
    },
    {
      "Pressure_mb": 826.8,
      "Altitude_m": 1821,
      "Temp_c": 4.2,
      "Dewpoint_c": -7.6,
      "Wind_Direction": 187,
      "Wind_Speed_kt": 6.1
    },
    {
      "Pressure_mb": 826.3,
      "Altitude_m": 1826,
      "Temp_c": 4.1,
      "Dewpoint_c": -7.7,
      "Wind_Direction": 187,
      "Wind_Speed_kt": 6.2
    },
    {
      "Pressure_mb": 825.6,
      "Altitude_m": 1834,
      "Temp_c": 4.1,
      "Dewpoint_c": -7.7,
      "Wind_Direction": 187,
      "Wind_Speed_kt": 6.4
    },
    {
      "Pressure_mb": 825.3,
      "Altitude_m": 1837,
      "Temp_c": 4.1,
      "Dewpoint_c": -7.7,
      "Wind_Direction": 187,
      "Wind_Speed_kt": 6.4
    },
    {
      "Pressure_mb": 824.8,
      "Altitude_m": 1842,
      "Temp_c": 4.2,
      "Dewpoint_c": -7.7,
      "Wind_Direction": 187,
      "Wind_Speed_kt": 6.6
    },
    {
      "Pressure_mb": 824.2,
      "Altitude_m": 1847,
      "Temp_c": 4.2,
      "Dewpoint_c": -7.7,
      "Wind_Direction": 187,
      "Wind_Speed_kt": 6.7
    },
    {
      "Pressure_mb": 823.7,
      "Altitude_m": 1852,
      "Temp_c": 4.2,
      "Dewpoint_c": -7.7,
      "Wind_Direction": 187,
      "Wind_Speed_kt": 6.8
    },
    {
      "Pressure_mb": 823.2,
      "Altitude_m": 1858,
      "Temp_c": 4.3,
      "Dewpoint_c": -7.6,
      "Wind_Direction": 187,
      "Wind_Speed_kt": 6.9
    },
    {
      "Pressure_mb": 822.6,
      "Altitude_m": 1863,
      "Temp_c": 4.3,
      "Dewpoint_c": -7.6,
      "Wind_Direction": 187,
      "Wind_Speed_kt": 7
    },
    {
      "Pressure_mb": 822.1,
      "Altitude_m": 1868,
      "Temp_c": 4.3,
      "Dewpoint_c": -7.6,
      "Wind_Direction": 187,
      "Wind_Speed_kt": 7.1
    },
    {
      "Pressure_mb": 821.6,
      "Altitude_m": 1873,
      "Temp_c": 4.3,
      "Dewpoint_c": -7.6,
      "Wind_Direction": 187,
      "Wind_Speed_kt": 7.3
    },
    {
      "Pressure_mb": 821.2,
      "Altitude_m": 1878,
      "Temp_c": 4.4,
      "Dewpoint_c": -7.5,
      "Wind_Direction": 187,
      "Wind_Speed_kt": 7.4
    },
    {
      "Pressure_mb": 820.7,
      "Altitude_m": 1883,
      "Temp_c": 4.4,
      "Dewpoint_c": -7.5,
      "Wind_Direction": 187,
      "Wind_Speed_kt": 7.5
    },
    {
      "Pressure_mb": 820.2,
      "Altitude_m": 1887,
      "Temp_c": 4.4,
      "Dewpoint_c": -7.5,
      "Wind_Direction": 187,
      "Wind_Speed_kt": 7.6
    },
    {
      "Pressure_mb": 819.8,
      "Altitude_m": 1892,
      "Temp_c": 4.5,
      "Dewpoint_c": -7.5,
      "Wind_Direction": 187,
      "Wind_Speed_kt": 7.7
    },
    {
      "Pressure_mb": 819.3,
      "Altitude_m": 1896,
      "Temp_c": 4.5,
      "Dewpoint_c": -7.5,
      "Wind_Direction": 187,
      "Wind_Speed_kt": 7.8
    },
    {
      "Pressure_mb": 818.8,
      "Altitude_m": 1900,
      "Temp_c": 4.5,
      "Dewpoint_c": -7.4,
      "Wind_Direction": 187,
      "Wind_Speed_kt": 7.9
    },
    {
      "Pressure_mb": 818.4,
      "Altitude_m": 1905,
      "Temp_c": 4.5,
      "Dewpoint_c": -7.4,
      "Wind_Direction": 187,
      "Wind_Speed_kt": 7.9
    },
    {
      "Pressure_mb": 817.9,
      "Altitude_m": 1910,
      "Temp_c": 4.5,
      "Dewpoint_c": -7.4,
      "Wind_Direction": 187,
      "Wind_Speed_kt": 8
    },
    {
      "Pressure_mb": 817.4,
      "Altitude_m": 1914,
      "Temp_c": 4.5,
      "Dewpoint_c": -7.3,
      "Wind_Direction": 186,
      "Wind_Speed_kt": 8.1
    },
    {
      "Pressure_mb": 817,
      "Altitude_m": 1919,
      "Temp_c": 4.5,
      "Dewpoint_c": -7.3,
      "Wind_Direction": 186,
      "Wind_Speed_kt": 8.1
    },
    {
      "Pressure_mb": 816.5,
      "Altitude_m": 1924,
      "Temp_c": 4.5,
      "Dewpoint_c": -7.3,
      "Wind_Direction": 186,
      "Wind_Speed_kt": 8.2
    },
    {
      "Pressure_mb": 816.1,
      "Altitude_m": 1929,
      "Temp_c": 4.5,
      "Dewpoint_c": -7.2,
      "Wind_Direction": 186,
      "Wind_Speed_kt": 8.2
    },
    {
      "Pressure_mb": 815.6,
      "Altitude_m": 1933,
      "Temp_c": 4.5,
      "Dewpoint_c": -7.2,
      "Wind_Direction": 186,
      "Wind_Speed_kt": 8.3
    },
    {
      "Pressure_mb": 815.2,
      "Altitude_m": 1937,
      "Temp_c": 4.5,
      "Dewpoint_c": -7.2,
      "Wind_Direction": 186,
      "Wind_Speed_kt": 8.4
    },
    {
      "Pressure_mb": 814.7,
      "Altitude_m": 1942,
      "Temp_c": 4.5,
      "Dewpoint_c": -7.1,
      "Wind_Direction": 185,
      "Wind_Speed_kt": 8.4
    },
    {
      "Pressure_mb": 814.3,
      "Altitude_m": 1946,
      "Temp_c": 4.5,
      "Dewpoint_c": -7.1,
      "Wind_Direction": 185,
      "Wind_Speed_kt": 8.5
    },
    {
      "Pressure_mb": 813.8,
      "Altitude_m": 1950,
      "Temp_c": 4.5,
      "Dewpoint_c": -7.1,
      "Wind_Direction": 185,
      "Wind_Speed_kt": 8.6
    },
    {
      "Pressure_mb": 813.4,
      "Altitude_m": 1955,
      "Temp_c": 4.5,
      "Dewpoint_c": -7,
      "Wind_Direction": 185,
      "Wind_Speed_kt": 8.6
    },
    {
      "Pressure_mb": 812.9,
      "Altitude_m": 1959,
      "Temp_c": 4.5,
      "Dewpoint_c": -7,
      "Wind_Direction": 185,
      "Wind_Speed_kt": 8.7
    },
    {
      "Pressure_mb": 812.5,
      "Altitude_m": 1964,
      "Temp_c": 4.5,
      "Dewpoint_c": -7,
      "Wind_Direction": 185,
      "Wind_Speed_kt": 8.8
    },
    {
      "Pressure_mb": 812,
      "Altitude_m": 1968,
      "Temp_c": 4.5,
      "Dewpoint_c": -7,
      "Wind_Direction": 185,
      "Wind_Speed_kt": 8.8
    },
    {
      "Pressure_mb": 811.6,
      "Altitude_m": 1973,
      "Temp_c": 4.4,
      "Dewpoint_c": -6.9,
      "Wind_Direction": 185,
      "Wind_Speed_kt": 8.9
    },
    {
      "Pressure_mb": 811.1,
      "Altitude_m": 1978,
      "Temp_c": 4.4,
      "Dewpoint_c": -6.9,
      "Wind_Direction": 184,
      "Wind_Speed_kt": 9
    },
    {
      "Pressure_mb": 810.7,
      "Altitude_m": 1982,
      "Temp_c": 4.4,
      "Dewpoint_c": -6.9,
      "Wind_Direction": 184,
      "Wind_Speed_kt": 9
    },
    {
      "Pressure_mb": 810.2,
      "Altitude_m": 1987,
      "Temp_c": 4.3,
      "Dewpoint_c": -6.9,
      "Wind_Direction": 184,
      "Wind_Speed_kt": 9
    },
    {
      "Pressure_mb": 809.7,
      "Altitude_m": 1991,
      "Temp_c": 4.3,
      "Dewpoint_c": -6.9,
      "Wind_Direction": 185,
      "Wind_Speed_kt": 8.9
    },
    {
      "Pressure_mb": 809.3,
      "Altitude_m": 1996,
      "Temp_c": 4.3,
      "Dewpoint_c": -6.9,
      "Wind_Direction": 185,
      "Wind_Speed_kt": 8.8
    },
    {
      "Pressure_mb": 808.8,
      "Altitude_m": 2000,
      "Temp_c": 4.3,
      "Dewpoint_c": -6.8,
      "Wind_Direction": 185,
      "Wind_Speed_kt": 8.8
    },
    {
      "Pressure_mb": 808.4,
      "Altitude_m": 2005,
      "Temp_c": 4.2,
      "Dewpoint_c": -6.8,
      "Wind_Direction": 185,
      "Wind_Speed_kt": 8.7
    },
    {
      "Pressure_mb": 807.9,
      "Altitude_m": 2010,
      "Temp_c": 4.2,
      "Dewpoint_c": -6.8,
      "Wind_Direction": 185,
      "Wind_Speed_kt": 8.6
    },
    {
      "Pressure_mb": 807.5,
      "Altitude_m": 2014,
      "Temp_c": 4.2,
      "Dewpoint_c": -6.8,
      "Wind_Direction": 186,
      "Wind_Speed_kt": 8.6
    },
    {
      "Pressure_mb": 807.1,
      "Altitude_m": 2018,
      "Temp_c": 4.2,
      "Dewpoint_c": -6.8,
      "Wind_Direction": 186,
      "Wind_Speed_kt": 8.5
    },
    {
      "Pressure_mb": 806.7,
      "Altitude_m": 2022,
      "Temp_c": 4.1,
      "Dewpoint_c": -6.8,
      "Wind_Direction": 186,
      "Wind_Speed_kt": 8.4
    },
    {
      "Pressure_mb": 806.2,
      "Altitude_m": 2027,
      "Temp_c": 4.2,
      "Dewpoint_c": -6.6,
      "Wind_Direction": 186,
      "Wind_Speed_kt": 8.4
    },
    {
      "Pressure_mb": 805.8,
      "Altitude_m": 2032,
      "Temp_c": 4.2,
      "Dewpoint_c": -6.5,
      "Wind_Direction": 186,
      "Wind_Speed_kt": 8.3
    },
    {
      "Pressure_mb": 805.2,
      "Altitude_m": 2037,
      "Temp_c": 4.2,
      "Dewpoint_c": -6.4,
      "Wind_Direction": 187,
      "Wind_Speed_kt": 8.2
    },
    {
      "Pressure_mb": 804.7,
      "Altitude_m": 2042,
      "Temp_c": 4.2,
      "Dewpoint_c": -6.3,
      "Wind_Direction": 187,
      "Wind_Speed_kt": 8.2
    },
    {
      "Pressure_mb": 804.2,
      "Altitude_m": 2048,
      "Temp_c": 4.3,
      "Dewpoint_c": -6.2,
      "Wind_Direction": 187,
      "Wind_Speed_kt": 8.1
    },
    {
      "Pressure_mb": 803.6,
      "Altitude_m": 2053,
      "Temp_c": 4.3,
      "Dewpoint_c": -6.1,
      "Wind_Direction": 187,
      "Wind_Speed_kt": 8
    },
    {
      "Pressure_mb": 803.1,
      "Altitude_m": 2058,
      "Temp_c": 4.3,
      "Dewpoint_c": -6,
      "Wind_Direction": 188,
      "Wind_Speed_kt": 8
    },
    {
      "Pressure_mb": 802.6,
      "Altitude_m": 2064,
      "Temp_c": 4.3,
      "Dewpoint_c": -5.9,
      "Wind_Direction": 188,
      "Wind_Speed_kt": 7.9
    },
    {
      "Pressure_mb": 802.1,
      "Altitude_m": 2069,
      "Temp_c": 4.3,
      "Dewpoint_c": -5.8,
      "Wind_Direction": 188,
      "Wind_Speed_kt": 7.8
    },
    {
      "Pressure_mb": 801.5,
      "Altitude_m": 2074,
      "Temp_c": 4.4,
      "Dewpoint_c": -5.7,
      "Wind_Direction": 188,
      "Wind_Speed_kt": 7.8
    },
    {
      "Pressure_mb": 801,
      "Altitude_m": 2080,
      "Temp_c": 4.4,
      "Dewpoint_c": -5.6,
      "Wind_Direction": 188,
      "Wind_Speed_kt": 7.7
    },
    {
      "Pressure_mb": 800.4,
      "Altitude_m": 2085,
      "Temp_c": 4.4,
      "Dewpoint_c": -5.5,
      "Wind_Direction": 188,
      "Wind_Speed_kt": 7.6
    },
    {
      "Pressure_mb": 799.7,
      "Altitude_m": 2092,
      "Temp_c": 4.4,
      "Dewpoint_c": -5.4,
      "Wind_Direction": 188,
      "Wind_Speed_kt": 7.5
    },
    {
      "Pressure_mb": 799.4,
      "Altitude_m": 2096,
      "Temp_c": 4.4,
      "Dewpoint_c": -5.4,
      "Wind_Direction": 188,
      "Wind_Speed_kt": 7.4
    },
    {
      "Pressure_mb": 799,
      "Altitude_m": 2100,
      "Temp_c": 4.4,
      "Dewpoint_c": -5.4,
      "Wind_Direction": 188,
      "Wind_Speed_kt": 7.3
    },
    {
      "Pressure_mb": 798.4,
      "Altitude_m": 2107,
      "Temp_c": 4.4,
      "Dewpoint_c": -5.3,
      "Wind_Direction": 188,
      "Wind_Speed_kt": 7.2
    },
    {
      "Pressure_mb": 797.9,
      "Altitude_m": 2112,
      "Temp_c": 4.4,
      "Dewpoint_c": -5.3,
      "Wind_Direction": 188,
      "Wind_Speed_kt": 7.1
    },
    {
      "Pressure_mb": 797.4,
      "Altitude_m": 2117,
      "Temp_c": 4.3,
      "Dewpoint_c": -5.3,
      "Wind_Direction": 188,
      "Wind_Speed_kt": 7
    },
    {
      "Pressure_mb": 796.9,
      "Altitude_m": 2122,
      "Temp_c": 4.3,
      "Dewpoint_c": -5.3,
      "Wind_Direction": 188,
      "Wind_Speed_kt": 6.9
    },
    {
      "Pressure_mb": 796.4,
      "Altitude_m": 2127,
      "Temp_c": 4.3,
      "Dewpoint_c": -5.3,
      "Wind_Direction": 188,
      "Wind_Speed_kt": 6.8
    },
    {
      "Pressure_mb": 795.9,
      "Altitude_m": 2132,
      "Temp_c": 4.3,
      "Dewpoint_c": -5.3,
      "Wind_Direction": 188,
      "Wind_Speed_kt": 6.7
    },
    {
      "Pressure_mb": 795.4,
      "Altitude_m": 2137,
      "Temp_c": 4.2,
      "Dewpoint_c": -5.3,
      "Wind_Direction": 188,
      "Wind_Speed_kt": 6.6
    },
    {
      "Pressure_mb": 794.9,
      "Altitude_m": 2142,
      "Temp_c": 4.2,
      "Dewpoint_c": -5.3,
      "Wind_Direction": 188,
      "Wind_Speed_kt": 6.5
    },
    {
      "Pressure_mb": 794.4,
      "Altitude_m": 2147,
      "Temp_c": 4.2,
      "Dewpoint_c": -5.3,
      "Wind_Direction": 188,
      "Wind_Speed_kt": 6.4
    },
    {
      "Pressure_mb": 793.9,
      "Altitude_m": 2152,
      "Temp_c": 4.2,
      "Dewpoint_c": -5.3,
      "Wind_Direction": 188,
      "Wind_Speed_kt": 6.3
    },
    {
      "Pressure_mb": 793.4,
      "Altitude_m": 2157,
      "Temp_c": 4.1,
      "Dewpoint_c": -5.3,
      "Wind_Direction": 188,
      "Wind_Speed_kt": 6.2
    },
    {
      "Pressure_mb": 792.9,
      "Altitude_m": 2162,
      "Temp_c": 4.1,
      "Dewpoint_c": -5.3,
      "Wind_Direction": 188,
      "Wind_Speed_kt": 6.1
    },
    {
      "Pressure_mb": 792.4,
      "Altitude_m": 2167,
      "Temp_c": 4.1,
      "Dewpoint_c": -5.3,
      "Wind_Direction": 187,
      "Wind_Speed_kt": 6
    },
    {
      "Pressure_mb": 791.9,
      "Altitude_m": 2172,
      "Temp_c": 4,
      "Dewpoint_c": -5.3,
      "Wind_Direction": 187,
      "Wind_Speed_kt": 5.9
    },
    {
      "Pressure_mb": 791.4,
      "Altitude_m": 2178,
      "Temp_c": 4,
      "Dewpoint_c": -5.4,
      "Wind_Direction": 187,
      "Wind_Speed_kt": 5.9
    },
    {
      "Pressure_mb": 790.9,
      "Altitude_m": 2183,
      "Temp_c": 3.9,
      "Dewpoint_c": -5.4,
      "Wind_Direction": 187,
      "Wind_Speed_kt": 5.8
    },
    {
      "Pressure_mb": 790.4,
      "Altitude_m": 2188,
      "Temp_c": 3.9,
      "Dewpoint_c": -5.4,
      "Wind_Direction": 188,
      "Wind_Speed_kt": 5.7
    },
    {
      "Pressure_mb": 789.9,
      "Altitude_m": 2193,
      "Temp_c": 3.8,
      "Dewpoint_c": -5.5,
      "Wind_Direction": 189,
      "Wind_Speed_kt": 5.5
    },
    {
      "Pressure_mb": 789.4,
      "Altitude_m": 2199,
      "Temp_c": 3.8,
      "Dewpoint_c": -5.5,
      "Wind_Direction": 190,
      "Wind_Speed_kt": 5.5
    },
    {
      "Pressure_mb": 788.9,
      "Altitude_m": 2204,
      "Temp_c": 3.7,
      "Dewpoint_c": -5.5,
      "Wind_Direction": 191,
      "Wind_Speed_kt": 5.4
    },
    {
      "Pressure_mb": 788.4,
      "Altitude_m": 2209,
      "Temp_c": 3.7,
      "Dewpoint_c": -5.6,
      "Wind_Direction": 192,
      "Wind_Speed_kt": 5.3
    },
    {
      "Pressure_mb": 787.9,
      "Altitude_m": 2214,
      "Temp_c": 3.6,
      "Dewpoint_c": -5.6,
      "Wind_Direction": 193,
      "Wind_Speed_kt": 5.3
    },
    {
      "Pressure_mb": 787.4,
      "Altitude_m": 2219,
      "Temp_c": 3.6,
      "Dewpoint_c": -5.6,
      "Wind_Direction": 195,
      "Wind_Speed_kt": 5.2
    },
    {
      "Pressure_mb": 786.8,
      "Altitude_m": 2224,
      "Temp_c": 3.5,
      "Dewpoint_c": -5.7,
      "Wind_Direction": 196,
      "Wind_Speed_kt": 5.1
    },
    {
      "Pressure_mb": 786.3,
      "Altitude_m": 2230,
      "Temp_c": 3.5,
      "Dewpoint_c": -5.7,
      "Wind_Direction": 197,
      "Wind_Speed_kt": 5
    },
    {
      "Pressure_mb": 785.7,
      "Altitude_m": 2236,
      "Temp_c": 3.4,
      "Dewpoint_c": -5.7,
      "Wind_Direction": 198,
      "Wind_Speed_kt": 4.9
    },
    {
      "Pressure_mb": 785.2,
      "Altitude_m": 2241,
      "Temp_c": 3.4,
      "Dewpoint_c": -5.8,
      "Wind_Direction": 200,
      "Wind_Speed_kt": 4.9
    },
    {
      "Pressure_mb": 784.6,
      "Altitude_m": 2247,
      "Temp_c": 3.4,
      "Dewpoint_c": -5.8,
      "Wind_Direction": 201,
      "Wind_Speed_kt": 4.8
    },
    {
      "Pressure_mb": 784.1,
      "Altitude_m": 2253,
      "Temp_c": 3.3,
      "Dewpoint_c": -5.8,
      "Wind_Direction": 203,
      "Wind_Speed_kt": 4.7
    },
    {
      "Pressure_mb": 783.5,
      "Altitude_m": 2259,
      "Temp_c": 3.3,
      "Dewpoint_c": -5.9,
      "Wind_Direction": 204,
      "Wind_Speed_kt": 4.6
    },
    {
      "Pressure_mb": 782.9,
      "Altitude_m": 2265,
      "Temp_c": 3.2,
      "Dewpoint_c": -5.9,
      "Wind_Direction": 206,
      "Wind_Speed_kt": 4.5
    },
    {
      "Pressure_mb": 782.4,
      "Altitude_m": 2271,
      "Temp_c": 3.2,
      "Dewpoint_c": -5.9,
      "Wind_Direction": 207,
      "Wind_Speed_kt": 4.4
    },
    {
      "Pressure_mb": 781.8,
      "Altitude_m": 2277,
      "Temp_c": 3.1,
      "Dewpoint_c": -5.9,
      "Wind_Direction": 209,
      "Wind_Speed_kt": 4.4
    },
    {
      "Pressure_mb": 781.2,
      "Altitude_m": 2283,
      "Temp_c": 3.1,
      "Dewpoint_c": -6,
      "Wind_Direction": 211,
      "Wind_Speed_kt": 4.3
    },
    {
      "Pressure_mb": 780.6,
      "Altitude_m": 2289,
      "Temp_c": 3,
      "Dewpoint_c": -6,
      "Wind_Direction": 212,
      "Wind_Speed_kt": 4.2
    },
    {
      "Pressure_mb": 780.1,
      "Altitude_m": 2294,
      "Temp_c": 3,
      "Dewpoint_c": -6,
      "Wind_Direction": 214,
      "Wind_Speed_kt": 4.1
    },
    {
      "Pressure_mb": 779.6,
      "Altitude_m": 2300,
      "Temp_c": 2.9,
      "Dewpoint_c": -6.1,
      "Wind_Direction": 215,
      "Wind_Speed_kt": 4.1
    },
    {
      "Pressure_mb": 779.1,
      "Altitude_m": 2305,
      "Temp_c": 2.9,
      "Dewpoint_c": -6.1,
      "Wind_Direction": 217,
      "Wind_Speed_kt": 4
    },
    {
      "Pressure_mb": 778.5,
      "Altitude_m": 2311,
      "Temp_c": 2.8,
      "Dewpoint_c": -6.1,
      "Wind_Direction": 218,
      "Wind_Speed_kt": 4
    },
    {
      "Pressure_mb": 778,
      "Altitude_m": 2316,
      "Temp_c": 2.8,
      "Dewpoint_c": -6.1,
      "Wind_Direction": 219,
      "Wind_Speed_kt": 4
    },
    {
      "Pressure_mb": 777.5,
      "Altitude_m": 2322,
      "Temp_c": 2.7,
      "Dewpoint_c": -6.2,
      "Wind_Direction": 220,
      "Wind_Speed_kt": 4
    },
    {
      "Pressure_mb": 777,
      "Altitude_m": 2327,
      "Temp_c": 2.7,
      "Dewpoint_c": -6.2,
      "Wind_Direction": 221,
      "Wind_Speed_kt": 4
    },
    {
      "Pressure_mb": 776.4,
      "Altitude_m": 2333,
      "Temp_c": 2.6,
      "Dewpoint_c": -6.2,
      "Wind_Direction": 223,
      "Wind_Speed_kt": 3.9
    },
    {
      "Pressure_mb": 775.9,
      "Altitude_m": 2338,
      "Temp_c": 2.6,
      "Dewpoint_c": -6.2,
      "Wind_Direction": 224,
      "Wind_Speed_kt": 3.9
    },
    {
      "Pressure_mb": 775.4,
      "Altitude_m": 2343,
      "Temp_c": 2.5,
      "Dewpoint_c": -6.3,
      "Wind_Direction": 225,
      "Wind_Speed_kt": 3.9
    },
    {
      "Pressure_mb": 774.9,
      "Altitude_m": 2349,
      "Temp_c": 2.5,
      "Dewpoint_c": -6.3,
      "Wind_Direction": 227,
      "Wind_Speed_kt": 3.9
    },
    {
      "Pressure_mb": 774.4,
      "Altitude_m": 2354,
      "Temp_c": 2.4,
      "Dewpoint_c": -6.3,
      "Wind_Direction": 228,
      "Wind_Speed_kt": 3.8
    },
    {
      "Pressure_mb": 773.8,
      "Altitude_m": 2359,
      "Temp_c": 2.4,
      "Dewpoint_c": -6.3,
      "Wind_Direction": 229,
      "Wind_Speed_kt": 3.8
    },
    {
      "Pressure_mb": 773.3,
      "Altitude_m": 2365,
      "Temp_c": 2.3,
      "Dewpoint_c": -6.4,
      "Wind_Direction": 231,
      "Wind_Speed_kt": 3.8
    },
    {
      "Pressure_mb": 772.8,
      "Altitude_m": 2370,
      "Temp_c": 2.3,
      "Dewpoint_c": -6.4,
      "Wind_Direction": 232,
      "Wind_Speed_kt": 3.7
    },
    {
      "Pressure_mb": 772.3,
      "Altitude_m": 2376,
      "Temp_c": 2.2,
      "Dewpoint_c": -6.4,
      "Wind_Direction": 234,
      "Wind_Speed_kt": 3.7
    },
    {
      "Pressure_mb": 771.7,
      "Altitude_m": 2382,
      "Temp_c": 2.2,
      "Dewpoint_c": -6.4,
      "Wind_Direction": 235,
      "Wind_Speed_kt": 3.7
    },
    {
      "Pressure_mb": 771.2,
      "Altitude_m": 2387,
      "Temp_c": 2.1,
      "Dewpoint_c": -6.4,
      "Wind_Direction": 236,
      "Wind_Speed_kt": 3.7
    },
    {
      "Pressure_mb": 770.6,
      "Altitude_m": 2393,
      "Temp_c": 2.1,
      "Dewpoint_c": -6.5,
      "Wind_Direction": 238,
      "Wind_Speed_kt": 3.6
    },
    {
      "Pressure_mb": 770.1,
      "Altitude_m": 2398,
      "Temp_c": 2,
      "Dewpoint_c": -6.5,
      "Wind_Direction": 239,
      "Wind_Speed_kt": 3.6
    },
    {
      "Pressure_mb": 769.5,
      "Altitude_m": 2404,
      "Temp_c": 2,
      "Dewpoint_c": -6.5,
      "Wind_Direction": 241,
      "Wind_Speed_kt": 3.6
    },
    {
      "Pressure_mb": 769,
      "Altitude_m": 2410,
      "Temp_c": 1.9,
      "Dewpoint_c": -6.5,
      "Wind_Direction": 242,
      "Wind_Speed_kt": 3.7
    },
    {
      "Pressure_mb": 768.4,
      "Altitude_m": 2416,
      "Temp_c": 1.9,
      "Dewpoint_c": -6.6,
      "Wind_Direction": 243,
      "Wind_Speed_kt": 3.7
    },
    {
      "Pressure_mb": 767.9,
      "Altitude_m": 2422,
      "Temp_c": 1.8,
      "Dewpoint_c": -6.6,
      "Wind_Direction": 245,
      "Wind_Speed_kt": 3.8
    },
    {
      "Pressure_mb": 767.4,
      "Altitude_m": 2428,
      "Temp_c": 1.8,
      "Dewpoint_c": -6.6,
      "Wind_Direction": 246,
      "Wind_Speed_kt": 3.9
    },
    {
      "Pressure_mb": 766.9,
      "Altitude_m": 2433,
      "Temp_c": 1.8,
      "Dewpoint_c": -6.6,
      "Wind_Direction": 247,
      "Wind_Speed_kt": 4
    },
    {
      "Pressure_mb": 766.4,
      "Altitude_m": 2438,
      "Temp_c": 1.7,
      "Dewpoint_c": -6.6,
      "Wind_Direction": 248,
      "Wind_Speed_kt": 4
    },
    {
      "Pressure_mb": 765.8,
      "Altitude_m": 2444,
      "Temp_c": 1.7,
      "Dewpoint_c": -6.7,
      "Wind_Direction": 249,
      "Wind_Speed_kt": 4.1
    },
    {
      "Pressure_mb": 765.3,
      "Altitude_m": 2449,
      "Temp_c": 1.6,
      "Dewpoint_c": -6.7,
      "Wind_Direction": 250,
      "Wind_Speed_kt": 4.2
    },
    {
      "Pressure_mb": 764.8,
      "Altitude_m": 2454,
      "Temp_c": 1.6,
      "Dewpoint_c": -6.7,
      "Wind_Direction": 251,
      "Wind_Speed_kt": 4.3
    },
    {
      "Pressure_mb": 764.3,
      "Altitude_m": 2459,
      "Temp_c": 1.5,
      "Dewpoint_c": -6.7,
      "Wind_Direction": 252,
      "Wind_Speed_kt": 4.3
    },
    {
      "Pressure_mb": 763.8,
      "Altitude_m": 2465,
      "Temp_c": 1.5,
      "Dewpoint_c": -6.7,
      "Wind_Direction": 253,
      "Wind_Speed_kt": 4.4
    },
    {
      "Pressure_mb": 763.3,
      "Altitude_m": 2470,
      "Temp_c": 1.5,
      "Dewpoint_c": -6.8,
      "Wind_Direction": 254,
      "Wind_Speed_kt": 4.5
    },
    {
      "Pressure_mb": 762.7,
      "Altitude_m": 2476,
      "Temp_c": 1.4,
      "Dewpoint_c": -6.8,
      "Wind_Direction": 255,
      "Wind_Speed_kt": 4.6
    },
    {
      "Pressure_mb": 762.2,
      "Altitude_m": 2482,
      "Temp_c": 1.4,
      "Dewpoint_c": -6.8,
      "Wind_Direction": 256,
      "Wind_Speed_kt": 4.6
    },
    {
      "Pressure_mb": 761.7,
      "Altitude_m": 2487,
      "Temp_c": 1.3,
      "Dewpoint_c": -6.8,
      "Wind_Direction": 256,
      "Wind_Speed_kt": 4.7
    },
    {
      "Pressure_mb": 761.2,
      "Altitude_m": 2492,
      "Temp_c": 1.3,
      "Dewpoint_c": -6.8,
      "Wind_Direction": 257,
      "Wind_Speed_kt": 4.7
    },
    {
      "Pressure_mb": 760.7,
      "Altitude_m": 2498,
      "Temp_c": 1.3,
      "Dewpoint_c": -6.8,
      "Wind_Direction": 258,
      "Wind_Speed_kt": 4.8
    },
    {
      "Pressure_mb": 760.2,
      "Altitude_m": 2503,
      "Temp_c": 1.2,
      "Dewpoint_c": -6.9,
      "Wind_Direction": 259,
      "Wind_Speed_kt": 4.9
    },
    {
      "Pressure_mb": 759.7,
      "Altitude_m": 2508,
      "Temp_c": 1.2,
      "Dewpoint_c": -6.9,
      "Wind_Direction": 259,
      "Wind_Speed_kt": 5
    },
    {
      "Pressure_mb": 759.2,
      "Altitude_m": 2513,
      "Temp_c": 1.1,
      "Dewpoint_c": -6.9,
      "Wind_Direction": 260,
      "Wind_Speed_kt": 5.1
    },
    {
      "Pressure_mb": 758.7,
      "Altitude_m": 2518,
      "Temp_c": 1.1,
      "Dewpoint_c": -6.9,
      "Wind_Direction": 261,
      "Wind_Speed_kt": 5.1
    },
    {
      "Pressure_mb": 758.2,
      "Altitude_m": 2524,
      "Temp_c": 1.1,
      "Dewpoint_c": -6.9,
      "Wind_Direction": 262,
      "Wind_Speed_kt": 5.2
    },
    {
      "Pressure_mb": 757.8,
      "Altitude_m": 2529,
      "Temp_c": 1,
      "Dewpoint_c": -6.9,
      "Wind_Direction": 263,
      "Wind_Speed_kt": 5.2
    },
    {
      "Pressure_mb": 757.3,
      "Altitude_m": 2534,
      "Temp_c": 1,
      "Dewpoint_c": -7,
      "Wind_Direction": 264,
      "Wind_Speed_kt": 5.3
    },
    {
      "Pressure_mb": 756.8,
      "Altitude_m": 2539,
      "Temp_c": 1,
      "Dewpoint_c": -7,
      "Wind_Direction": 265,
      "Wind_Speed_kt": 5.4
    },
    {
      "Pressure_mb": 756.3,
      "Altitude_m": 2545,
      "Temp_c": 0.9,
      "Dewpoint_c": -7,
      "Wind_Direction": 266,
      "Wind_Speed_kt": 5.5
    },
    {
      "Pressure_mb": 755.8,
      "Altitude_m": 2550,
      "Temp_c": 0.9,
      "Dewpoint_c": -7,
      "Wind_Direction": 267,
      "Wind_Speed_kt": 5.5
    },
    {
      "Pressure_mb": 755.3,
      "Altitude_m": 2555,
      "Temp_c": 0.8,
      "Dewpoint_c": -7,
      "Wind_Direction": 268,
      "Wind_Speed_kt": 5.6
    },
    {
      "Pressure_mb": 754.8,
      "Altitude_m": 2560,
      "Temp_c": 0.8,
      "Dewpoint_c": -7.1,
      "Wind_Direction": 269,
      "Wind_Speed_kt": 5.7
    },
    {
      "Pressure_mb": 754.3,
      "Altitude_m": 2565,
      "Temp_c": 0.8,
      "Dewpoint_c": -7.1,
      "Wind_Direction": 270,
      "Wind_Speed_kt": 5.8
    },
    {
      "Pressure_mb": 753.9,
      "Altitude_m": 2570,
      "Temp_c": 0.7,
      "Dewpoint_c": -7.1,
      "Wind_Direction": 271,
      "Wind_Speed_kt": 5.8
    },
    {
      "Pressure_mb": 753.4,
      "Altitude_m": 2575,
      "Temp_c": 0.7,
      "Dewpoint_c": -7.1,
      "Wind_Direction": 272,
      "Wind_Speed_kt": 5.9
    },
    {
      "Pressure_mb": 752.9,
      "Altitude_m": 2580,
      "Temp_c": 0.7,
      "Dewpoint_c": -7.1,
      "Wind_Direction": 273,
      "Wind_Speed_kt": 6
    },
    {
      "Pressure_mb": 752.4,
      "Altitude_m": 2586,
      "Temp_c": 0.6,
      "Dewpoint_c": -7.2,
      "Wind_Direction": 274,
      "Wind_Speed_kt": 6
    },
    {
      "Pressure_mb": 751.9,
      "Altitude_m": 2591,
      "Temp_c": 0.6,
      "Dewpoint_c": -7.2,
      "Wind_Direction": 275,
      "Wind_Speed_kt": 6.1
    },
    {
      "Pressure_mb": 751.4,
      "Altitude_m": 2596,
      "Temp_c": 0.5,
      "Dewpoint_c": -7.2,
      "Wind_Direction": 275,
      "Wind_Speed_kt": 6.1
    },
    {
      "Pressure_mb": 750.9,
      "Altitude_m": 2602,
      "Temp_c": 0.5,
      "Dewpoint_c": -7.2,
      "Wind_Direction": 276,
      "Wind_Speed_kt": 6.2
    },
    {
      "Pressure_mb": 750.4,
      "Altitude_m": 2607,
      "Temp_c": 0.5,
      "Dewpoint_c": -7.2,
      "Wind_Direction": 277,
      "Wind_Speed_kt": 6.3
    },
    {
      "Pressure_mb": 749.9,
      "Altitude_m": 2613,
      "Temp_c": 0.4,
      "Dewpoint_c": -7.3,
      "Wind_Direction": 278,
      "Wind_Speed_kt": 6.4
    },
    {
      "Pressure_mb": 749.3,
      "Altitude_m": 2619,
      "Temp_c": 0.4,
      "Dewpoint_c": -7.3,
      "Wind_Direction": 278,
      "Wind_Speed_kt": 6.4
    },
    {
      "Pressure_mb": 748.8,
      "Altitude_m": 2624,
      "Temp_c": 0.4,
      "Dewpoint_c": -7.3,
      "Wind_Direction": 278,
      "Wind_Speed_kt": 6.6
    },
    {
      "Pressure_mb": 748.3,
      "Altitude_m": 2630,
      "Temp_c": 0.3,
      "Dewpoint_c": -7.3,
      "Wind_Direction": 278,
      "Wind_Speed_kt": 6.7
    },
    {
      "Pressure_mb": 747.7,
      "Altitude_m": 2636,
      "Temp_c": 0.3,
      "Dewpoint_c": -7.3,
      "Wind_Direction": 278,
      "Wind_Speed_kt": 6.8
    },
    {
      "Pressure_mb": 747.2,
      "Altitude_m": 2641,
      "Temp_c": 0.3,
      "Dewpoint_c": -7.3,
      "Wind_Direction": 277,
      "Wind_Speed_kt": 6.9
    },
    {
      "Pressure_mb": 746.7,
      "Altitude_m": 2647,
      "Temp_c": 0.2,
      "Dewpoint_c": -7.3,
      "Wind_Direction": 277,
      "Wind_Speed_kt": 7
    },
    {
      "Pressure_mb": 746.2,
      "Altitude_m": 2652,
      "Temp_c": 0.2,
      "Dewpoint_c": -7.4,
      "Wind_Direction": 277,
      "Wind_Speed_kt": 7.1
    },
    {
      "Pressure_mb": 745.7,
      "Altitude_m": 2658,
      "Temp_c": 0.1,
      "Dewpoint_c": -7.4,
      "Wind_Direction": 277,
      "Wind_Speed_kt": 7.2
    },
    {
      "Pressure_mb": 745.2,
      "Altitude_m": 2663,
      "Temp_c": 0.1,
      "Dewpoint_c": -7.4,
      "Wind_Direction": 277,
      "Wind_Speed_kt": 7.3
    },
    {
      "Pressure_mb": 744.7,
      "Altitude_m": 2669,
      "Temp_c": 0.1,
      "Dewpoint_c": -7.4,
      "Wind_Direction": 276,
      "Wind_Speed_kt": 7.4
    },
    {
      "Pressure_mb": 744.2,
      "Altitude_m": 2674,
      "Temp_c": 0,
      "Dewpoint_c": -7.4,
      "Wind_Direction": 276,
      "Wind_Speed_kt": 7.5
    },
    {
      "Pressure_mb": 743.7,
      "Altitude_m": 2679,
      "Temp_c": 0,
      "Dewpoint_c": -7.4,
      "Wind_Direction": 276,
      "Wind_Speed_kt": 7.6
    },
    {
      "Pressure_mb": 743.2,
      "Altitude_m": 2684,
      "Temp_c": 0,
      "Dewpoint_c": -7.4,
      "Wind_Direction": 276,
      "Wind_Speed_kt": 7.7
    },
    {
      "Pressure_mb": 742.8,
      "Altitude_m": 2689,
      "Temp_c": 0,
      "Dewpoint_c": -7.4,
      "Wind_Direction": 276,
      "Wind_Speed_kt": 7.8
    },
    {
      "Pressure_mb": 742.3,
      "Altitude_m": 2694,
      "Temp_c": 0,
      "Dewpoint_c": -7.4,
      "Wind_Direction": 276,
      "Wind_Speed_kt": 7.9
    },
    {
      "Pressure_mb": 741.8,
      "Altitude_m": 2699,
      "Temp_c": -0.1,
      "Dewpoint_c": -7.4,
      "Wind_Direction": 276,
      "Wind_Speed_kt": 8
    },
    {
      "Pressure_mb": 741.3,
      "Altitude_m": 2705,
      "Temp_c": -0.1,
      "Dewpoint_c": -7.4,
      "Wind_Direction": 275,
      "Wind_Speed_kt": 8.1
    },
    {
      "Pressure_mb": 740.8,
      "Altitude_m": 2710,
      "Temp_c": -0.1,
      "Dewpoint_c": -7.4,
      "Wind_Direction": 275,
      "Wind_Speed_kt": 8.2
    },
    {
      "Pressure_mb": 740.3,
      "Altitude_m": 2716,
      "Temp_c": -0.1,
      "Dewpoint_c": -7.4,
      "Wind_Direction": 275,
      "Wind_Speed_kt": 8.4
    },
    {
      "Pressure_mb": 739.8,
      "Altitude_m": 2721,
      "Temp_c": -0.2,
      "Dewpoint_c": -7.4,
      "Wind_Direction": 275,
      "Wind_Speed_kt": 8.5
    },
    {
      "Pressure_mb": 739.3,
      "Altitude_m": 2726,
      "Temp_c": -0.2,
      "Dewpoint_c": -7.4,
      "Wind_Direction": 275,
      "Wind_Speed_kt": 8.6
    },
    {
      "Pressure_mb": 738.8,
      "Altitude_m": 2732,
      "Temp_c": -0.2,
      "Dewpoint_c": -7.4,
      "Wind_Direction": 275,
      "Wind_Speed_kt": 8.6
    },
    {
      "Pressure_mb": 738.3,
      "Altitude_m": 2737,
      "Temp_c": -0.2,
      "Dewpoint_c": -7.4,
      "Wind_Direction": 276,
      "Wind_Speed_kt": 8.6
    },
    {
      "Pressure_mb": 737.8,
      "Altitude_m": 2743,
      "Temp_c": -0.3,
      "Dewpoint_c": -7.4,
      "Wind_Direction": 277,
      "Wind_Speed_kt": 8.7
    },
    {
      "Pressure_mb": 737.3,
      "Altitude_m": 2748,
      "Temp_c": -0.3,
      "Dewpoint_c": -7.4,
      "Wind_Direction": 277,
      "Wind_Speed_kt": 8.7
    },
    {
      "Pressure_mb": 736.9,
      "Altitude_m": 2753,
      "Temp_c": -0.3,
      "Dewpoint_c": -7.5,
      "Wind_Direction": 278,
      "Wind_Speed_kt": 8.8
    },
    {
      "Pressure_mb": 736.4,
      "Altitude_m": 2759,
      "Temp_c": -0.4,
      "Dewpoint_c": -7.5,
      "Wind_Direction": 278,
      "Wind_Speed_kt": 8.8
    },
    {
      "Pressure_mb": 735.9,
      "Altitude_m": 2764,
      "Temp_c": -0.4,
      "Dewpoint_c": -7.5,
      "Wind_Direction": 279,
      "Wind_Speed_kt": 8.9
    },
    {
      "Pressure_mb": 735.4,
      "Altitude_m": 2769,
      "Temp_c": -0.4,
      "Dewpoint_c": -7.5,
      "Wind_Direction": 280,
      "Wind_Speed_kt": 8.9
    },
    {
      "Pressure_mb": 734.9,
      "Altitude_m": 2774,
      "Temp_c": -0.5,
      "Dewpoint_c": -7.5,
      "Wind_Direction": 280,
      "Wind_Speed_kt": 9
    },
    {
      "Pressure_mb": 734.5,
      "Altitude_m": 2779,
      "Temp_c": -0.5,
      "Dewpoint_c": -7.5,
      "Wind_Direction": 281,
      "Wind_Speed_kt": 9
    },
    {
      "Pressure_mb": 734,
      "Altitude_m": 2784,
      "Temp_c": -0.5,
      "Dewpoint_c": -7.5,
      "Wind_Direction": 281,
      "Wind_Speed_kt": 9.1
    },
    {
      "Pressure_mb": 733.6,
      "Altitude_m": 2789,
      "Temp_c": -0.5,
      "Dewpoint_c": -7.6,
      "Wind_Direction": 282,
      "Wind_Speed_kt": 9.1
    },
    {
      "Pressure_mb": 733.2,
      "Altitude_m": 2794,
      "Temp_c": -0.6,
      "Dewpoint_c": -7.6,
      "Wind_Direction": 282,
      "Wind_Speed_kt": 9.2
    },
    {
      "Pressure_mb": 732.7,
      "Altitude_m": 2798,
      "Temp_c": -0.6,
      "Dewpoint_c": -7.6,
      "Wind_Direction": 283,
      "Wind_Speed_kt": 9.2
    },
    {
      "Pressure_mb": 732.3,
      "Altitude_m": 2803,
      "Temp_c": -0.6,
      "Dewpoint_c": -7.6,
      "Wind_Direction": 283,
      "Wind_Speed_kt": 9.3
    },
    {
      "Pressure_mb": 731.8,
      "Altitude_m": 2808,
      "Temp_c": -0.7,
      "Dewpoint_c": -7.6,
      "Wind_Direction": 284,
      "Wind_Speed_kt": 9.3
    },
    {
      "Pressure_mb": 731.4,
      "Altitude_m": 2812,
      "Temp_c": -0.7,
      "Dewpoint_c": -7.6,
      "Wind_Direction": 284,
      "Wind_Speed_kt": 9.4
    },
    {
      "Pressure_mb": 730.9,
      "Altitude_m": 2817,
      "Temp_c": -0.8,
      "Dewpoint_c": -7.7,
      "Wind_Direction": 285,
      "Wind_Speed_kt": 9.4
    },
    {
      "Pressure_mb": 730.4,
      "Altitude_m": 2823,
      "Temp_c": -0.8,
      "Dewpoint_c": -7.7,
      "Wind_Direction": 285,
      "Wind_Speed_kt": 9.5
    },
    {
      "Pressure_mb": 730,
      "Altitude_m": 2828,
      "Temp_c": -0.9,
      "Dewpoint_c": -7.7,
      "Wind_Direction": 286,
      "Wind_Speed_kt": 9.5
    },
    {
      "Pressure_mb": 729.5,
      "Altitude_m": 2833,
      "Temp_c": -0.9,
      "Dewpoint_c": -7.8,
      "Wind_Direction": 286,
      "Wind_Speed_kt": 9.6
    },
    {
      "Pressure_mb": 729,
      "Altitude_m": 2838,
      "Temp_c": -0.9,
      "Dewpoint_c": -7.8,
      "Wind_Direction": 287,
      "Wind_Speed_kt": 9.6
    },
    {
      "Pressure_mb": 728.5,
      "Altitude_m": 2843,
      "Temp_c": -1,
      "Dewpoint_c": -7.8,
      "Wind_Direction": 287,
      "Wind_Speed_kt": 9.6
    },
    {
      "Pressure_mb": 728.1,
      "Altitude_m": 2849,
      "Temp_c": -1,
      "Dewpoint_c": -7.8,
      "Wind_Direction": 288,
      "Wind_Speed_kt": 9.6
    },
    {
      "Pressure_mb": 727.6,
      "Altitude_m": 2854,
      "Temp_c": -1.1,
      "Dewpoint_c": -7.9,
      "Wind_Direction": 288,
      "Wind_Speed_kt": 9.7
    },
    {
      "Pressure_mb": 727.1,
      "Altitude_m": 2860,
      "Temp_c": -1.1,
      "Dewpoint_c": -7.9,
      "Wind_Direction": 289,
      "Wind_Speed_kt": 9.7
    },
    {
      "Pressure_mb": 726.6,
      "Altitude_m": 2865,
      "Temp_c": -1.2,
      "Dewpoint_c": -7.9,
      "Wind_Direction": 289,
      "Wind_Speed_kt": 9.7
    },
    {
      "Pressure_mb": 726.1,
      "Altitude_m": 2871,
      "Temp_c": -1.2,
      "Dewpoint_c": -8,
      "Wind_Direction": 290,
      "Wind_Speed_kt": 9.7
    },
    {
      "Pressure_mb": 725.6,
      "Altitude_m": 2877,
      "Temp_c": -1.3,
      "Dewpoint_c": -8,
      "Wind_Direction": 290,
      "Wind_Speed_kt": 9.8
    },
    {
      "Pressure_mb": 725.1,
      "Altitude_m": 2882,
      "Temp_c": -1.3,
      "Dewpoint_c": -8,
      "Wind_Direction": 291,
      "Wind_Speed_kt": 9.8
    },
    {
      "Pressure_mb": 724.6,
      "Altitude_m": 2887,
      "Temp_c": -1.4,
      "Dewpoint_c": -8.1,
      "Wind_Direction": 291,
      "Wind_Speed_kt": 9.8
    },
    {
      "Pressure_mb": 724.1,
      "Altitude_m": 2893,
      "Temp_c": -1.4,
      "Dewpoint_c": -8.1,
      "Wind_Direction": 292,
      "Wind_Speed_kt": 9.9
    },
    {
      "Pressure_mb": 723.6,
      "Altitude_m": 2898,
      "Temp_c": -1.4,
      "Dewpoint_c": -8.1,
      "Wind_Direction": 292,
      "Wind_Speed_kt": 9.9
    },
    {
      "Pressure_mb": 723.1,
      "Altitude_m": 2903,
      "Temp_c": -1.5,
      "Dewpoint_c": -8.1,
      "Wind_Direction": 293,
      "Wind_Speed_kt": 9.9
    },
    {
      "Pressure_mb": 722.6,
      "Altitude_m": 2909,
      "Temp_c": -1.5,
      "Dewpoint_c": -8.2,
      "Wind_Direction": 293,
      "Wind_Speed_kt": 0
    },
    {
      "Pressure_mb": 722.2,
      "Altitude_m": 2914,
      "Temp_c": -1.6,
      "Dewpoint_c": -8.2,
      "Wind_Direction": 294,
      "Wind_Speed_kt": 0
    },
    {
      "Pressure_mb": 721.7,
      "Altitude_m": 2919,
      "Temp_c": -1.6,
      "Dewpoint_c": -8.2,
      "Wind_Direction": 294,
      "Wind_Speed_kt": 0
    },
    {
      "Pressure_mb": 721.2,
      "Altitude_m": 2924,
      "Temp_c": -1.7,
      "Dewpoint_c": -8.3,
      "Wind_Direction": 295,
      "Wind_Speed_kt": 0.1
    },
    {
      "Pressure_mb": 720.8,
      "Altitude_m": 2929,
      "Temp_c": -1.7,
      "Dewpoint_c": -8.3,
      "Wind_Direction": 295,
      "Wind_Speed_kt": 0.1
    },
    {
      "Pressure_mb": 720.3,
      "Altitude_m": 2935,
      "Temp_c": -1.8,
      "Dewpoint_c": -8.3,
      "Wind_Direction": 296,
      "Wind_Speed_kt": 0.1
    },
    {
      "Pressure_mb": 719.8,
      "Altitude_m": 2940,
      "Temp_c": -1.8,
      "Dewpoint_c": -8.4,
      "Wind_Direction": 296,
      "Wind_Speed_kt": 0.1
    },
    {
      "Pressure_mb": 719.4,
      "Altitude_m": 2945,
      "Temp_c": -1.9,
      "Dewpoint_c": -8.4,
      "Wind_Direction": 296,
      "Wind_Speed_kt": 0.1
    },
    {
      "Pressure_mb": 718.9,
      "Altitude_m": 2950,
      "Temp_c": -1.9,
      "Dewpoint_c": -8.4,
      "Wind_Direction": 297,
      "Wind_Speed_kt": 0.1
    },
    {
      "Pressure_mb": 718.4,
      "Altitude_m": 2955,
      "Temp_c": -1.9,
      "Dewpoint_c": -8.5,
      "Wind_Direction": 297,
      "Wind_Speed_kt": 0.1
    },
    {
      "Pressure_mb": 718,
      "Altitude_m": 2960,
      "Temp_c": -2,
      "Dewpoint_c": -8.5,
      "Wind_Direction": 297,
      "Wind_Speed_kt": 0.1
    },
    {
      "Pressure_mb": 717.5,
      "Altitude_m": 2965,
      "Temp_c": -2,
      "Dewpoint_c": -8.5,
      "Wind_Direction": 298,
      "Wind_Speed_kt": 0.1
    },
    {
      "Pressure_mb": 717,
      "Altitude_m": 2970,
      "Temp_c": -2.1,
      "Dewpoint_c": -8.6,
      "Wind_Direction": 298,
      "Wind_Speed_kt": 0.1
    },
    {
      "Pressure_mb": 716.6,
      "Altitude_m": 2976,
      "Temp_c": -2.1,
      "Dewpoint_c": -8.6,
      "Wind_Direction": 299,
      "Wind_Speed_kt": 0.1
    },
    {
      "Pressure_mb": 716.1,
      "Altitude_m": 2981,
      "Temp_c": -2.1,
      "Dewpoint_c": -8.7,
      "Wind_Direction": 299,
      "Wind_Speed_kt": 0.1
    },
    {
      "Pressure_mb": 715.6,
      "Altitude_m": 2986,
      "Temp_c": -2.2,
      "Dewpoint_c": -8.7,
      "Wind_Direction": 299,
      "Wind_Speed_kt": 0.1
    },
    {
      "Pressure_mb": 715.2,
      "Altitude_m": 2991,
      "Temp_c": -2.2,
      "Dewpoint_c": -8.8,
      "Wind_Direction": 300,
      "Wind_Speed_kt": 0.1
    },
    {
      "Pressure_mb": 714.7,
      "Altitude_m": 2997,
      "Temp_c": -2.3,
      "Dewpoint_c": -8.8,
      "Wind_Direction": 300,
      "Wind_Speed_kt": 0.2
    },
    {
      "Pressure_mb": 714.2,
      "Altitude_m": 3002,
      "Temp_c": -2.3,
      "Dewpoint_c": -8.8,
      "Wind_Direction": 300,
      "Wind_Speed_kt": 0.2
    },
    {
      "Pressure_mb": 713.8,
      "Altitude_m": 3007,
      "Temp_c": -2.3,
      "Dewpoint_c": -8.9,
      "Wind_Direction": 301,
      "Wind_Speed_kt": 0.2
    },
    {
      "Pressure_mb": 713.3,
      "Altitude_m": 3012,
      "Temp_c": -2.4,
      "Dewpoint_c": -8.9,
      "Wind_Direction": 301,
      "Wind_Speed_kt": 0.2
    },
    {
      "Pressure_mb": 712.8,
      "Altitude_m": 3017,
      "Temp_c": -2.4,
      "Dewpoint_c": -9,
      "Wind_Direction": 302,
      "Wind_Speed_kt": 0.2
    },
    {
      "Pressure_mb": 712.4,
      "Altitude_m": 3022,
      "Temp_c": -2.4,
      "Dewpoint_c": -9,
      "Wind_Direction": 302,
      "Wind_Speed_kt": 0.2
    },
    {
      "Pressure_mb": 711.9,
      "Altitude_m": 3028,
      "Temp_c": -2.4,
      "Dewpoint_c": -9.1,
      "Wind_Direction": 302,
      "Wind_Speed_kt": 0.2
    },
    {
      "Pressure_mb": 711.4,
      "Altitude_m": 3033,
      "Temp_c": -2.4,
      "Dewpoint_c": -9.1,
      "Wind_Direction": 303,
      "Wind_Speed_kt": 0.2
    },
    {
      "Pressure_mb": 711,
      "Altitude_m": 3038,
      "Temp_c": -2.4,
      "Dewpoint_c": -9.2,
      "Wind_Direction": 303,
      "Wind_Speed_kt": 0.2
    },
    {
      "Pressure_mb": 710.5,
      "Altitude_m": 3043,
      "Temp_c": -2.4,
      "Dewpoint_c": -9.3,
      "Wind_Direction": 303,
      "Wind_Speed_kt": 0.2
    },
    {
      "Pressure_mb": 710.1,
      "Altitude_m": 3048,
      "Temp_c": -2.4,
      "Dewpoint_c": -9.3,
      "Wind_Direction": 303,
      "Wind_Speed_kt": 0.1
    },
    {
      "Pressure_mb": 709.6,
      "Altitude_m": 3053,
      "Temp_c": -2.4,
      "Dewpoint_c": -9.4,
      "Wind_Direction": 303,
      "Wind_Speed_kt": 0.1
    },
    {
      "Pressure_mb": 709.2,
      "Altitude_m": 3058,
      "Temp_c": -2.4,
      "Dewpoint_c": -9.5,
      "Wind_Direction": 303,
      "Wind_Speed_kt": 0.1
    },
    {
      "Pressure_mb": 708.7,
      "Altitude_m": 3064,
      "Temp_c": -2.4,
      "Dewpoint_c": -9.5,
      "Wind_Direction": 303,
      "Wind_Speed_kt": 0.1
    },
    {
      "Pressure_mb": 708.3,
      "Altitude_m": 3069,
      "Temp_c": -2.4,
      "Dewpoint_c": -9.6,
      "Wind_Direction": 304,
      "Wind_Speed_kt": 0
    },
    {
      "Pressure_mb": 707.8,
      "Altitude_m": 3073,
      "Temp_c": -2.4,
      "Dewpoint_c": -9.7,
      "Wind_Direction": 304,
      "Wind_Speed_kt": 0
    },
    {
      "Pressure_mb": 707.4,
      "Altitude_m": 3078,
      "Temp_c": -2.4,
      "Dewpoint_c": -9.7,
      "Wind_Direction": 304,
      "Wind_Speed_kt": 0
    },
    {
      "Pressure_mb": 706.7,
      "Altitude_m": 3085,
      "Temp_c": -2.4,
      "Dewpoint_c": -9.8,
      "Wind_Direction": 304,
      "Wind_Speed_kt": 0
    },
    {
      "Pressure_mb": 706.5,
      "Altitude_m": 3088,
      "Temp_c": -2.4,
      "Dewpoint_c": -9.9,
      "Wind_Direction": 304,
      "Wind_Speed_kt": 9.9
    },
    {
      "Pressure_mb": 706,
      "Altitude_m": 3093,
      "Temp_c": -2.4,
      "Dewpoint_c": -10,
      "Wind_Direction": 304,
      "Wind_Speed_kt": 9.9
    },
    {
      "Pressure_mb": 705.5,
      "Altitude_m": 3099,
      "Temp_c": -2.4,
      "Dewpoint_c": -10,
      "Wind_Direction": 304,
      "Wind_Speed_kt": 9.9
    },
    {
      "Pressure_mb": 705,
      "Altitude_m": 3104,
      "Temp_c": -2.4,
      "Dewpoint_c": -10.1,
      "Wind_Direction": 304,
      "Wind_Speed_kt": 9.9
    },
    {
      "Pressure_mb": 704.6,
      "Altitude_m": 3110,
      "Temp_c": -2.4,
      "Dewpoint_c": -10.2,
      "Wind_Direction": 304,
      "Wind_Speed_kt": 9.8
    },
    {
      "Pressure_mb": 704.1,
      "Altitude_m": 3115,
      "Temp_c": -2.4,
      "Dewpoint_c": -10.3,
      "Wind_Direction": 304,
      "Wind_Speed_kt": 9.8
    },
    {
      "Pressure_mb": 703.6,
      "Altitude_m": 3120,
      "Temp_c": -2.4,
      "Dewpoint_c": -10.4,
      "Wind_Direction": 304,
      "Wind_Speed_kt": 9.8
    },
    {
      "Pressure_mb": 703.2,
      "Altitude_m": 3126,
      "Temp_c": -2.4,
      "Dewpoint_c": -10.5,
      "Wind_Direction": 304,
      "Wind_Speed_kt": 9.8
    },
    {
      "Pressure_mb": 702.7,
      "Altitude_m": 3131,
      "Temp_c": -2.4,
      "Dewpoint_c": -10.6,
      "Wind_Direction": 304,
      "Wind_Speed_kt": 9.7
    },
    {
      "Pressure_mb": 702.2,
      "Altitude_m": 3136,
      "Temp_c": -2.4,
      "Dewpoint_c": -10.7,
      "Wind_Direction": 305,
      "Wind_Speed_kt": 9.7
    },
    {
      "Pressure_mb": 701.8,
      "Altitude_m": 3142,
      "Temp_c": -2.4,
      "Dewpoint_c": -10.8,
      "Wind_Direction": 305,
      "Wind_Speed_kt": 9.7
    },
    {
      "Pressure_mb": 701.3,
      "Altitude_m": 3147,
      "Temp_c": -2.4,
      "Dewpoint_c": -10.9,
      "Wind_Direction": 304,
      "Wind_Speed_kt": 9.8
    },
    {
      "Pressure_mb": 700.8,
      "Altitude_m": 3152,
      "Temp_c": -2.3,
      "Dewpoint_c": -11,
      "Wind_Direction": 304,
      "Wind_Speed_kt": 9.8
    },
    {
      "Pressure_mb": 700.3,
      "Altitude_m": 3157,
      "Temp_c": -2.3,
      "Dewpoint_c": -11.1,
      "Wind_Direction": 304,
      "Wind_Speed_kt": 9.9
    },
    {
      "Pressure_mb": 700,
      "Altitude_m": 3161,
      "Temp_c": -2.4,
      "Dewpoint_c": -11.3,
      "Wind_Direction": 304,
      "Wind_Speed_kt": 0
    },
    {
      "Pressure_mb": 699.4,
      "Altitude_m": 3168,
      "Temp_c": -2.4,
      "Dewpoint_c": -11.6,
      "Wind_Direction": 304,
      "Wind_Speed_kt": 0.1
    },
    {
      "Pressure_mb": 698.9,
      "Altitude_m": 3174,
      "Temp_c": -2.4,
      "Dewpoint_c": -11.9,
      "Wind_Direction": 303,
      "Wind_Speed_kt": 0.2
    },
    {
      "Pressure_mb": 698.4,
      "Altitude_m": 3179,
      "Temp_c": -2.4,
      "Dewpoint_c": -12.2,
      "Wind_Direction": 303,
      "Wind_Speed_kt": 0.3
    },
    {
      "Pressure_mb": 697.9,
      "Altitude_m": 3185,
      "Temp_c": -2.5,
      "Dewpoint_c": -12.4,
      "Wind_Direction": 303,
      "Wind_Speed_kt": 0.3
    },
    {
      "Pressure_mb": 697.4,
      "Altitude_m": 3190,
      "Temp_c": -2.5,
      "Dewpoint_c": -12.7,
      "Wind_Direction": 303,
      "Wind_Speed_kt": 0.4
    },
    {
      "Pressure_mb": 696.9,
      "Altitude_m": 3196,
      "Temp_c": -2.5,
      "Dewpoint_c": -13,
      "Wind_Direction": 303,
      "Wind_Speed_kt": 0.5
    },
    {
      "Pressure_mb": 696.4,
      "Altitude_m": 3202,
      "Temp_c": -2.5,
      "Dewpoint_c": -13.2,
      "Wind_Direction": 303,
      "Wind_Speed_kt": 0.6
    },
    {
      "Pressure_mb": 695.9,
      "Altitude_m": 3208,
      "Temp_c": -2.6,
      "Dewpoint_c": -13.5,
      "Wind_Direction": 302,
      "Wind_Speed_kt": 0.7
    },
    {
      "Pressure_mb": 695.4,
      "Altitude_m": 3214,
      "Temp_c": -2.6,
      "Dewpoint_c": -13.8,
      "Wind_Direction": 302,
      "Wind_Speed_kt": 0.7
    },
    {
      "Pressure_mb": 694.9,
      "Altitude_m": 3219,
      "Temp_c": -2.6,
      "Dewpoint_c": -14.1,
      "Wind_Direction": 302,
      "Wind_Speed_kt": 0.8
    },
    {
      "Pressure_mb": 694.4,
      "Altitude_m": 3225,
      "Temp_c": -2.6,
      "Dewpoint_c": -14.4,
      "Wind_Direction": 302,
      "Wind_Speed_kt": 0.9
    },
    {
      "Pressure_mb": 693.9,
      "Altitude_m": 3231,
      "Temp_c": -2.7,
      "Dewpoint_c": -14.7,
      "Wind_Direction": 302,
      "Wind_Speed_kt": 1
    },
    {
      "Pressure_mb": 693.4,
      "Altitude_m": 3237,
      "Temp_c": -2.7,
      "Dewpoint_c": -15,
      "Wind_Direction": 302,
      "Wind_Speed_kt": 1.1
    },
    {
      "Pressure_mb": 692.9,
      "Altitude_m": 3242,
      "Temp_c": -2.7,
      "Dewpoint_c": -15.2,
      "Wind_Direction": 302,
      "Wind_Speed_kt": 1.1
    },
    {
      "Pressure_mb": 692.4,
      "Altitude_m": 3248,
      "Temp_c": -2.7,
      "Dewpoint_c": -15.4,
      "Wind_Direction": 301,
      "Wind_Speed_kt": 1.2
    },
    {
      "Pressure_mb": 691.9,
      "Altitude_m": 3254,
      "Temp_c": -2.7,
      "Dewpoint_c": -15.7,
      "Wind_Direction": 301,
      "Wind_Speed_kt": 1.3
    },
    {
      "Pressure_mb": 691.4,
      "Altitude_m": 3260,
      "Temp_c": -2.7,
      "Dewpoint_c": -15.9,
      "Wind_Direction": 301,
      "Wind_Speed_kt": 1.4
    },
    {
      "Pressure_mb": 690.9,
      "Altitude_m": 3265,
      "Temp_c": -2.7,
      "Dewpoint_c": -16.1,
      "Wind_Direction": 301,
      "Wind_Speed_kt": 1.4
    },
    {
      "Pressure_mb": 690.5,
      "Altitude_m": 3271,
      "Temp_c": -2.7,
      "Dewpoint_c": -16.4,
      "Wind_Direction": 301,
      "Wind_Speed_kt": 1.5
    },
    {
      "Pressure_mb": 690,
      "Altitude_m": 3276,
      "Temp_c": -2.7,
      "Dewpoint_c": -16.6,
      "Wind_Direction": 301,
      "Wind_Speed_kt": 1.5
    },
    {
      "Pressure_mb": 689.5,
      "Altitude_m": 3281,
      "Temp_c": -2.7,
      "Dewpoint_c": -16.9,
      "Wind_Direction": 301,
      "Wind_Speed_kt": 1.6
    },
    {
      "Pressure_mb": 689.1,
      "Altitude_m": 3286,
      "Temp_c": -2.7,
      "Dewpoint_c": -17.1,
      "Wind_Direction": 301,
      "Wind_Speed_kt": 1.6
    },
    {
      "Pressure_mb": 688.7,
      "Altitude_m": 3292,
      "Temp_c": -2.7,
      "Dewpoint_c": -17.4,
      "Wind_Direction": 301,
      "Wind_Speed_kt": 1.7
    },
    {
      "Pressure_mb": 688.3,
      "Altitude_m": 3297,
      "Temp_c": -2.7,
      "Dewpoint_c": -17.6,
      "Wind_Direction": 301,
      "Wind_Speed_kt": 1.7
    },
    {
      "Pressure_mb": 687.9,
      "Altitude_m": 3301,
      "Temp_c": -2.7,
      "Dewpoint_c": -17.9,
      "Wind_Direction": 301,
      "Wind_Speed_kt": 1.7
    },
    {
      "Pressure_mb": 687.5,
      "Altitude_m": 3305,
      "Temp_c": -2.7,
      "Dewpoint_c": -18.2,
      "Wind_Direction": 301,
      "Wind_Speed_kt": 1.8
    },
    {
      "Pressure_mb": 687.1,
      "Altitude_m": 3309,
      "Temp_c": -2.8,
      "Dewpoint_c": -18.1,
      "Wind_Direction": 300,
      "Wind_Speed_kt": 1.8
    },
    {
      "Pressure_mb": 686.8,
      "Altitude_m": 3313,
      "Temp_c": -2.8,
      "Dewpoint_c": -18.1,
      "Wind_Direction": 300,
      "Wind_Speed_kt": 1.9
    },
    {
      "Pressure_mb": 686.4,
      "Altitude_m": 3316,
      "Temp_c": -2.8,
      "Dewpoint_c": -18,
      "Wind_Direction": 300,
      "Wind_Speed_kt": 1.9
    },
    {
      "Pressure_mb": 686.1,
      "Altitude_m": 3320,
      "Temp_c": -2.8,
      "Dewpoint_c": -18,
      "Wind_Direction": 300,
      "Wind_Speed_kt": 2
    },
    {
      "Pressure_mb": 685.7,
      "Altitude_m": 3324,
      "Temp_c": -2.9,
      "Dewpoint_c": -17.9,
      "Wind_Direction": 300,
      "Wind_Speed_kt": 2
    },
    {
      "Pressure_mb": 685.4,
      "Altitude_m": 3328,
      "Temp_c": -2.9,
      "Dewpoint_c": -17.9,
      "Wind_Direction": 300,
      "Wind_Speed_kt": 2.1
    },
    {
      "Pressure_mb": 685.1,
      "Altitude_m": 3332,
      "Temp_c": -2.9,
      "Dewpoint_c": -17.8,
      "Wind_Direction": 300,
      "Wind_Speed_kt": 2.1
    },
    {
      "Pressure_mb": 684.7,
      "Altitude_m": 3336,
      "Temp_c": -2.9,
      "Dewpoint_c": -17.8,
      "Wind_Direction": 300,
      "Wind_Speed_kt": 2.2
    },
    {
      "Pressure_mb": 684.3,
      "Altitude_m": 3341,
      "Temp_c": -3,
      "Dewpoint_c": -17.7,
      "Wind_Direction": 300,
      "Wind_Speed_kt": 2.2
    },
    {
      "Pressure_mb": 684,
      "Altitude_m": 3345,
      "Temp_c": -3,
      "Dewpoint_c": -17.7,
      "Wind_Direction": 300,
      "Wind_Speed_kt": 2.3
    },
    {
      "Pressure_mb": 683.6,
      "Altitude_m": 3349,
      "Temp_c": -3,
      "Dewpoint_c": -17.6,
      "Wind_Direction": 300,
      "Wind_Speed_kt": 2.3
    },
    {
      "Pressure_mb": 683.3,
      "Altitude_m": 3353,
      "Temp_c": -3,
      "Dewpoint_c": -17.6,
      "Wind_Direction": 300,
      "Wind_Speed_kt": 2.3
    },
    {
      "Pressure_mb": 682.7,
      "Altitude_m": 3359,
      "Temp_c": -3.1,
      "Dewpoint_c": -17.5,
      "Wind_Direction": 301,
      "Wind_Speed_kt": 2.3
    },
    {
      "Pressure_mb": 682.5,
      "Altitude_m": 3362,
      "Temp_c": -3.1,
      "Dewpoint_c": -17.5,
      "Wind_Direction": 301,
      "Wind_Speed_kt": 2.4
    },
    {
      "Pressure_mb": 682.1,
      "Altitude_m": 3366,
      "Temp_c": -3.1,
      "Dewpoint_c": -17.6,
      "Wind_Direction": 301,
      "Wind_Speed_kt": 2.4
    },
    {
      "Pressure_mb": 681.6,
      "Altitude_m": 3371,
      "Temp_c": -3.2,
      "Dewpoint_c": -17.6,
      "Wind_Direction": 301,
      "Wind_Speed_kt": 2.4
    },
    {
      "Pressure_mb": 681.2,
      "Altitude_m": 3376,
      "Temp_c": -3.2,
      "Dewpoint_c": -17.7,
      "Wind_Direction": 301,
      "Wind_Speed_kt": 2.4
    },
    {
      "Pressure_mb": 680.8,
      "Altitude_m": 3382,
      "Temp_c": -3.2,
      "Dewpoint_c": -17.7,
      "Wind_Direction": 301,
      "Wind_Speed_kt": 2.4
    },
    {
      "Pressure_mb": 680.4,
      "Altitude_m": 3387,
      "Temp_c": -3.3,
      "Dewpoint_c": -17.8,
      "Wind_Direction": 302,
      "Wind_Speed_kt": 2.4
    },
    {
      "Pressure_mb": 679.9,
      "Altitude_m": 3392,
      "Temp_c": -3.3,
      "Dewpoint_c": -17.8,
      "Wind_Direction": 302,
      "Wind_Speed_kt": 2.5
    },
    {
      "Pressure_mb": 679.5,
      "Altitude_m": 3397,
      "Temp_c": -3.3,
      "Dewpoint_c": -17.9,
      "Wind_Direction": 302,
      "Wind_Speed_kt": 2.5
    },
    {
      "Pressure_mb": 679,
      "Altitude_m": 3403,
      "Temp_c": -3.3,
      "Dewpoint_c": -17.9,
      "Wind_Direction": 302,
      "Wind_Speed_kt": 2.5
    },
    {
      "Pressure_mb": 678.6,
      "Altitude_m": 3408,
      "Temp_c": -3.4,
      "Dewpoint_c": -17.9,
      "Wind_Direction": 302,
      "Wind_Speed_kt": 2.5
    },
    {
      "Pressure_mb": 678.1,
      "Altitude_m": 3413,
      "Temp_c": -3.4,
      "Dewpoint_c": -18,
      "Wind_Direction": 302,
      "Wind_Speed_kt": 2.5
    },
    {
      "Pressure_mb": 677.7,
      "Altitude_m": 3418,
      "Temp_c": -3.4,
      "Dewpoint_c": -18,
      "Wind_Direction": 303,
      "Wind_Speed_kt": 2.6
    },
    {
      "Pressure_mb": 677.2,
      "Altitude_m": 3423,
      "Temp_c": -3.5,
      "Dewpoint_c": -18.1,
      "Wind_Direction": 303,
      "Wind_Speed_kt": 2.6
    },
    {
      "Pressure_mb": 676.8,
      "Altitude_m": 3428,
      "Temp_c": -3.5,
      "Dewpoint_c": -18.2,
      "Wind_Direction": 303,
      "Wind_Speed_kt": 2.6
    },
    {
      "Pressure_mb": 676.3,
      "Altitude_m": 3434,
      "Temp_c": -3.5,
      "Dewpoint_c": -18.4,
      "Wind_Direction": 303,
      "Wind_Speed_kt": 2.6
    },
    {
      "Pressure_mb": 675.8,
      "Altitude_m": 3439,
      "Temp_c": -3.6,
      "Dewpoint_c": -18.5,
      "Wind_Direction": 303,
      "Wind_Speed_kt": 2.6
    },
    {
      "Pressure_mb": 675.4,
      "Altitude_m": 3445,
      "Temp_c": -3.6,
      "Dewpoint_c": -18.7,
      "Wind_Direction": 304,
      "Wind_Speed_kt": 2.7
    },
    {
      "Pressure_mb": 674.9,
      "Altitude_m": 3450,
      "Temp_c": -3.7,
      "Dewpoint_c": -18.9,
      "Wind_Direction": 304,
      "Wind_Speed_kt": 2.7
    },
    {
      "Pressure_mb": 674.5,
      "Altitude_m": 3456,
      "Temp_c": -3.7,
      "Dewpoint_c": -19,
      "Wind_Direction": 304,
      "Wind_Speed_kt": 2.8
    },
    {
      "Pressure_mb": 674,
      "Altitude_m": 3461,
      "Temp_c": -3.7,
      "Dewpoint_c": -19.2,
      "Wind_Direction": 304,
      "Wind_Speed_kt": 2.9
    },
    {
      "Pressure_mb": 673.6,
      "Altitude_m": 3466,
      "Temp_c": -3.8,
      "Dewpoint_c": -19.4,
      "Wind_Direction": 304,
      "Wind_Speed_kt": 3
    },
    {
      "Pressure_mb": 673.1,
      "Altitude_m": 3472,
      "Temp_c": -3.8,
      "Dewpoint_c": -19.5,
      "Wind_Direction": 304,
      "Wind_Speed_kt": 3.1
    },
    {
      "Pressure_mb": 672.7,
      "Altitude_m": 3477,
      "Temp_c": -3.8,
      "Dewpoint_c": -19.7,
      "Wind_Direction": 304,
      "Wind_Speed_kt": 3.2
    },
    {
      "Pressure_mb": 672.2,
      "Altitude_m": 3482,
      "Temp_c": -3.9,
      "Dewpoint_c": -19.9,
      "Wind_Direction": 304,
      "Wind_Speed_kt": 3.3
    },
    {
      "Pressure_mb": 671.7,
      "Altitude_m": 3488,
      "Temp_c": -3.9,
      "Dewpoint_c": -20,
      "Wind_Direction": 304,
      "Wind_Speed_kt": 3.4
    },
    {
      "Pressure_mb": 671.2,
      "Altitude_m": 3493,
      "Temp_c": -4,
      "Dewpoint_c": -20.2,
      "Wind_Direction": 305,
      "Wind_Speed_kt": 3.5
    },
    {
      "Pressure_mb": 670.8,
      "Altitude_m": 3499,
      "Temp_c": -4,
      "Dewpoint_c": -20.4,
      "Wind_Direction": 305,
      "Wind_Speed_kt": 3.6
    },
    {
      "Pressure_mb": 670.3,
      "Altitude_m": 3505,
      "Temp_c": -4,
      "Dewpoint_c": -20.6,
      "Wind_Direction": 305,
      "Wind_Speed_kt": 3.7
    },
    {
      "Pressure_mb": 669.8,
      "Altitude_m": 3510,
      "Temp_c": -4.1,
      "Dewpoint_c": -20.7,
      "Wind_Direction": 305,
      "Wind_Speed_kt": 3.8
    },
    {
      "Pressure_mb": 669.3,
      "Altitude_m": 3516,
      "Temp_c": -4.1,
      "Dewpoint_c": -20.9,
      "Wind_Direction": 305,
      "Wind_Speed_kt": 3.8
    },
    {
      "Pressure_mb": 668.9,
      "Altitude_m": 3521,
      "Temp_c": -4.1,
      "Dewpoint_c": -21.1,
      "Wind_Direction": 305,
      "Wind_Speed_kt": 3.9
    },
    {
      "Pressure_mb": 668.4,
      "Altitude_m": 3526,
      "Temp_c": -4.2,
      "Dewpoint_c": -21.3,
      "Wind_Direction": 305,
      "Wind_Speed_kt": 4
    },
    {
      "Pressure_mb": 668,
      "Altitude_m": 3532,
      "Temp_c": -4.2,
      "Dewpoint_c": -21.4,
      "Wind_Direction": 305,
      "Wind_Speed_kt": 4.1
    },
    {
      "Pressure_mb": 667.5,
      "Altitude_m": 3537,
      "Temp_c": -4.2,
      "Dewpoint_c": -21.6,
      "Wind_Direction": 305,
      "Wind_Speed_kt": 4.2
    },
    {
      "Pressure_mb": 667.1,
      "Altitude_m": 3542,
      "Temp_c": -4.3,
      "Dewpoint_c": -21.8,
      "Wind_Direction": 305,
      "Wind_Speed_kt": 4.3
    },
    {
      "Pressure_mb": 666.6,
      "Altitude_m": 3548,
      "Temp_c": -4.3,
      "Dewpoint_c": -22,
      "Wind_Direction": 306,
      "Wind_Speed_kt": 4.4
    },
    {
      "Pressure_mb": 666.2,
      "Altitude_m": 3553,
      "Temp_c": -4.4,
      "Dewpoint_c": -22.2,
      "Wind_Direction": 306,
      "Wind_Speed_kt": 4.5
    },
    {
      "Pressure_mb": 665.7,
      "Altitude_m": 3559,
      "Temp_c": -4.4,
      "Dewpoint_c": -22.4,
      "Wind_Direction": 306,
      "Wind_Speed_kt": 4.5
    },
    {
      "Pressure_mb": 665.2,
      "Altitude_m": 3565,
      "Temp_c": -4.4,
      "Dewpoint_c": -22.6,
      "Wind_Direction": 306,
      "Wind_Speed_kt": 4.5
    },
    {
      "Pressure_mb": 664.7,
      "Altitude_m": 3571,
      "Temp_c": -4.5,
      "Dewpoint_c": -22.7,
      "Wind_Direction": 306,
      "Wind_Speed_kt": 4.5
    },
    {
      "Pressure_mb": 664.2,
      "Altitude_m": 3577,
      "Temp_c": -4.5,
      "Dewpoint_c": -22.8,
      "Wind_Direction": 307,
      "Wind_Speed_kt": 4.6
    },
    {
      "Pressure_mb": 663.7,
      "Altitude_m": 3582,
      "Temp_c": -4.5,
      "Dewpoint_c": -22.8,
      "Wind_Direction": 307,
      "Wind_Speed_kt": 4.6
    },
    {
      "Pressure_mb": 663.3,
      "Altitude_m": 3587,
      "Temp_c": -4.5,
      "Dewpoint_c": -22.9,
      "Wind_Direction": 307,
      "Wind_Speed_kt": 4.6
    },
    {
      "Pressure_mb": 662.9,
      "Altitude_m": 3591,
      "Temp_c": -4.5,
      "Dewpoint_c": -22.9,
      "Wind_Direction": 307,
      "Wind_Speed_kt": 4.6
    },
    {
      "Pressure_mb": 662.5,
      "Altitude_m": 3596,
      "Temp_c": -4.6,
      "Dewpoint_c": -23,
      "Wind_Direction": 308,
      "Wind_Speed_kt": 4.6
    },
    {
      "Pressure_mb": 662.1,
      "Altitude_m": 3600,
      "Temp_c": -4.6,
      "Dewpoint_c": -23,
      "Wind_Direction": 308,
      "Wind_Speed_kt": 4.7
    },
    {
      "Pressure_mb": 661.8,
      "Altitude_m": 3605,
      "Temp_c": -4.6,
      "Dewpoint_c": -23.1,
      "Wind_Direction": 308,
      "Wind_Speed_kt": 4.7
    },
    {
      "Pressure_mb": 661.4,
      "Altitude_m": 3610,
      "Temp_c": -4.6,
      "Dewpoint_c": -23.1,
      "Wind_Direction": 308,
      "Wind_Speed_kt": 4.7
    },
    {
      "Pressure_mb": 660.9,
      "Altitude_m": 3615,
      "Temp_c": -4.6,
      "Dewpoint_c": -23.1,
      "Wind_Direction": 309,
      "Wind_Speed_kt": 4.7
    },
    {
      "Pressure_mb": 660.5,
      "Altitude_m": 3620,
      "Temp_c": -4.7,
      "Dewpoint_c": -23.2,
      "Wind_Direction": 309,
      "Wind_Speed_kt": 4.7
    },
    {
      "Pressure_mb": 660.1,
      "Altitude_m": 3626,
      "Temp_c": -4.7,
      "Dewpoint_c": -23.2,
      "Wind_Direction": 309,
      "Wind_Speed_kt": 4.8
    },
    {
      "Pressure_mb": 659.6,
      "Altitude_m": 3631,
      "Temp_c": -4.7,
      "Dewpoint_c": -23.3,
      "Wind_Direction": 310,
      "Wind_Speed_kt": 4.8
    },
    {
      "Pressure_mb": 659,
      "Altitude_m": 3638,
      "Temp_c": -4.7,
      "Dewpoint_c": -23.3,
      "Wind_Direction": 310,
      "Wind_Speed_kt": 4.8
    },
    {
      "Pressure_mb": 658.8,
      "Altitude_m": 3641,
      "Temp_c": -4.8,
      "Dewpoint_c": -23.3,
      "Wind_Direction": 310,
      "Wind_Speed_kt": 4.8
    },
    {
      "Pressure_mb": 658.3,
      "Altitude_m": 3646,
      "Temp_c": -4.8,
      "Dewpoint_c": -23.3,
      "Wind_Direction": 310,
      "Wind_Speed_kt": 4.8
    },
    {
      "Pressure_mb": 657.9,
      "Altitude_m": 3652,
      "Temp_c": -4.8,
      "Dewpoint_c": -23.3,
      "Wind_Direction": 311,
      "Wind_Speed_kt": 4.9
    },
    {
      "Pressure_mb": 657.5,
      "Altitude_m": 3657,
      "Temp_c": -4.8,
      "Dewpoint_c": -23.3,
      "Wind_Direction": 311,
      "Wind_Speed_kt": 4.9
    },
    {
      "Pressure_mb": 657,
      "Altitude_m": 3662,
      "Temp_c": -4.8,
      "Dewpoint_c": -23.2,
      "Wind_Direction": 311,
      "Wind_Speed_kt": 4.8
    },
    {
      "Pressure_mb": 656.6,
      "Altitude_m": 3667,
      "Temp_c": -4.8,
      "Dewpoint_c": -23.2,
      "Wind_Direction": 311,
      "Wind_Speed_kt": 4.8
    },
    {
      "Pressure_mb": 656.2,
      "Altitude_m": 3672,
      "Temp_c": -4.8,
      "Dewpoint_c": -23.2,
      "Wind_Direction": 310,
      "Wind_Speed_kt": 4.8
    },
    {
      "Pressure_mb": 655.8,
      "Altitude_m": 3677,
      "Temp_c": -4.8,
      "Dewpoint_c": -23.2,
      "Wind_Direction": 310,
      "Wind_Speed_kt": 4.7
    },
    {
      "Pressure_mb": 655.4,
      "Altitude_m": 3682,
      "Temp_c": -4.8,
      "Dewpoint_c": -23.2,
      "Wind_Direction": 310,
      "Wind_Speed_kt": 4.7
    },
    {
      "Pressure_mb": 655,
      "Altitude_m": 3686,
      "Temp_c": -4.8,
      "Dewpoint_c": -23.1,
      "Wind_Direction": 310,
      "Wind_Speed_kt": 4.7
    },
    {
      "Pressure_mb": 654.6,
      "Altitude_m": 3691,
      "Temp_c": -4.8,
      "Dewpoint_c": -23.1,
      "Wind_Direction": 310,
      "Wind_Speed_kt": 4.6
    },
    {
      "Pressure_mb": 654.2,
      "Altitude_m": 3696,
      "Temp_c": -4.8,
      "Dewpoint_c": -23.1,
      "Wind_Direction": 310,
      "Wind_Speed_kt": 4.6
    },
    {
      "Pressure_mb": 653.8,
      "Altitude_m": 3700,
      "Temp_c": -4.8,
      "Dewpoint_c": -23.1,
      "Wind_Direction": 309,
      "Wind_Speed_kt": 4.6
    },
    {
      "Pressure_mb": 653.5,
      "Altitude_m": 3704,
      "Temp_c": -4.8,
      "Dewpoint_c": -23.1,
      "Wind_Direction": 309,
      "Wind_Speed_kt": 4.5
    },
    {
      "Pressure_mb": 653.1,
      "Altitude_m": 3709,
      "Temp_c": -4.8,
      "Dewpoint_c": -23,
      "Wind_Direction": 309,
      "Wind_Speed_kt": 4.5
    },
    {
      "Pressure_mb": 652.8,
      "Altitude_m": 3713,
      "Temp_c": -4.9,
      "Dewpoint_c": -23,
      "Wind_Direction": 309,
      "Wind_Speed_kt": 4.5
    },
    {
      "Pressure_mb": 652.4,
      "Altitude_m": 3717,
      "Temp_c": -4.9,
      "Dewpoint_c": -22.9,
      "Wind_Direction": 309,
      "Wind_Speed_kt": 4.4
    },
    {
      "Pressure_mb": 652.1,
      "Altitude_m": 3722,
      "Temp_c": -4.9,
      "Dewpoint_c": -22.9,
      "Wind_Direction": 309,
      "Wind_Speed_kt": 4.4
    },
    {
      "Pressure_mb": 651.7,
      "Altitude_m": 3726,
      "Temp_c": -4.9,
      "Dewpoint_c": -22.9,
      "Wind_Direction": 309,
      "Wind_Speed_kt": 4.4
    },
    {
      "Pressure_mb": 651.4,
      "Altitude_m": 3730,
      "Temp_c": -4.9,
      "Dewpoint_c": -22.8,
      "Wind_Direction": 308,
      "Wind_Speed_kt": 4.3
    },
    {
      "Pressure_mb": 651,
      "Altitude_m": 3734,
      "Temp_c": -4.9,
      "Dewpoint_c": -22.8,
      "Wind_Direction": 308,
      "Wind_Speed_kt": 4.3
    },
    {
      "Pressure_mb": 650.7,
      "Altitude_m": 3738,
      "Temp_c": -5,
      "Dewpoint_c": -22.8,
      "Wind_Direction": 308,
      "Wind_Speed_kt": 4.3
    },
    {
      "Pressure_mb": 650.3,
      "Altitude_m": 3742,
      "Temp_c": -5,
      "Dewpoint_c": -22.7,
      "Wind_Direction": 308,
      "Wind_Speed_kt": 4.2
    },
    {
      "Pressure_mb": 650,
      "Altitude_m": 3746,
      "Temp_c": -5,
      "Dewpoint_c": -22.7,
      "Wind_Direction": 308,
      "Wind_Speed_kt": 4.2
    },
    {
      "Pressure_mb": 649.7,
      "Altitude_m": 3750,
      "Temp_c": -5,
      "Dewpoint_c": -22.7,
      "Wind_Direction": 308,
      "Wind_Speed_kt": 4.3
    },
    {
      "Pressure_mb": 649.3,
      "Altitude_m": 3754,
      "Temp_c": -5,
      "Dewpoint_c": -22.7,
      "Wind_Direction": 307,
      "Wind_Speed_kt": 4.3
    },
    {
      "Pressure_mb": 648.9,
      "Altitude_m": 3758,
      "Temp_c": -5,
      "Dewpoint_c": -22.6,
      "Wind_Direction": 307,
      "Wind_Speed_kt": 4.4
    },
    {
      "Pressure_mb": 648.5,
      "Altitude_m": 3763,
      "Temp_c": -5.1,
      "Dewpoint_c": -22.6,
      "Wind_Direction": 307,
      "Wind_Speed_kt": 4.5
    },
    {
      "Pressure_mb": 648.2,
      "Altitude_m": 3768,
      "Temp_c": -5.1,
      "Dewpoint_c": -22.6,
      "Wind_Direction": 307,
      "Wind_Speed_kt": 4.5
    },
    {
      "Pressure_mb": 647.8,
      "Altitude_m": 3773,
      "Temp_c": -5.1,
      "Dewpoint_c": -22.6,
      "Wind_Direction": 306,
      "Wind_Speed_kt": 4.6
    },
    {
      "Pressure_mb": 647.4,
      "Altitude_m": 3778,
      "Temp_c": -5.1,
      "Dewpoint_c": -22.5,
      "Wind_Direction": 306,
      "Wind_Speed_kt": 4.7
    },
    {
      "Pressure_mb": 647,
      "Altitude_m": 3783,
      "Temp_c": -5.1,
      "Dewpoint_c": -22.5,
      "Wind_Direction": 306,
      "Wind_Speed_kt": 4.7
    },
    {
      "Pressure_mb": 646.6,
      "Altitude_m": 3788,
      "Temp_c": -5.1,
      "Dewpoint_c": -22.5,
      "Wind_Direction": 306,
      "Wind_Speed_kt": 4.8
    },
    {
      "Pressure_mb": 646.2,
      "Altitude_m": 3792,
      "Temp_c": -5.1,
      "Dewpoint_c": -22.5,
      "Wind_Direction": 305,
      "Wind_Speed_kt": 4.9
    },
    {
      "Pressure_mb": 645.8,
      "Altitude_m": 3797,
      "Temp_c": -5.1,
      "Dewpoint_c": -22.4,
      "Wind_Direction": 305,
      "Wind_Speed_kt": 4.9
    },
    {
      "Pressure_mb": 645.5,
      "Altitude_m": 3802,
      "Temp_c": -5.1,
      "Dewpoint_c": -22.4,
      "Wind_Direction": 305,
      "Wind_Speed_kt": 5
    },
    {
      "Pressure_mb": 645.1,
      "Altitude_m": 3806,
      "Temp_c": -5.1,
      "Dewpoint_c": -22.4,
      "Wind_Direction": 305,
      "Wind_Speed_kt": 5.1
    },
    {
      "Pressure_mb": 644.7,
      "Altitude_m": 3811,
      "Temp_c": -5.1,
      "Dewpoint_c": -22.4,
      "Wind_Direction": 305,
      "Wind_Speed_kt": 5.1
    },
    {
      "Pressure_mb": 644.3,
      "Altitude_m": 3816,
      "Temp_c": -5.1,
      "Dewpoint_c": -22.4,
      "Wind_Direction": 304,
      "Wind_Speed_kt": 5.2
    },
    {
      "Pressure_mb": 643.9,
      "Altitude_m": 3821,
      "Temp_c": -5.1,
      "Dewpoint_c": -22.3,
      "Wind_Direction": 304,
      "Wind_Speed_kt": 5.3
    },
    {
      "Pressure_mb": 643.6,
      "Altitude_m": 3823,
      "Temp_c": -5.1,
      "Dewpoint_c": -22.3,
      "Wind_Direction": 304,
      "Wind_Speed_kt": 5.3
    },
    {
      "Pressure_mb": 643.1,
      "Altitude_m": 3831,
      "Temp_c": -5.1,
      "Dewpoint_c": -22.4,
      "Wind_Direction": 304,
      "Wind_Speed_kt": 5.4
    },
    {
      "Pressure_mb": 642.7,
      "Altitude_m": 3836,
      "Temp_c": -5.1,
      "Dewpoint_c": -22.5,
      "Wind_Direction": 303,
      "Wind_Speed_kt": 5.5
    },
    {
      "Pressure_mb": 642.3,
      "Altitude_m": 3841,
      "Temp_c": -5.2,
      "Dewpoint_c": -22.6,
      "Wind_Direction": 303,
      "Wind_Speed_kt": 5.6
    },
    {
      "Pressure_mb": 641.9,
      "Altitude_m": 3845,
      "Temp_c": -5.2,
      "Dewpoint_c": -22.6,
      "Wind_Direction": 303,
      "Wind_Speed_kt": 5.7
    },
    {
      "Pressure_mb": 641.5,
      "Altitude_m": 3850,
      "Temp_c": -5.2,
      "Dewpoint_c": -22.7,
      "Wind_Direction": 303,
      "Wind_Speed_kt": 5.8
    },
    {
      "Pressure_mb": 641.1,
      "Altitude_m": 3855,
      "Temp_c": -5.2,
      "Dewpoint_c": -22.8,
      "Wind_Direction": 303,
      "Wind_Speed_kt": 5.9
    },
    {
      "Pressure_mb": 640.7,
      "Altitude_m": 3859,
      "Temp_c": -5.3,
      "Dewpoint_c": -22.9,
      "Wind_Direction": 303,
      "Wind_Speed_kt": 5.9
    },
    {
      "Pressure_mb": 640.3,
      "Altitude_m": 3864,
      "Temp_c": -5.3,
      "Dewpoint_c": -23,
      "Wind_Direction": 303,
      "Wind_Speed_kt": 6
    },
    {
      "Pressure_mb": 639.8,
      "Altitude_m": 3869,
      "Temp_c": -5.3,
      "Dewpoint_c": -23.1,
      "Wind_Direction": 303,
      "Wind_Speed_kt": 6.1
    },
    {
      "Pressure_mb": 639.4,
      "Altitude_m": 3875,
      "Temp_c": -5.4,
      "Dewpoint_c": -23.1,
      "Wind_Direction": 303,
      "Wind_Speed_kt": 6.2
    },
    {
      "Pressure_mb": 638.9,
      "Altitude_m": 3881,
      "Temp_c": -5.4,
      "Dewpoint_c": -23.2,
      "Wind_Direction": 303,
      "Wind_Speed_kt": 6.3
    },
    {
      "Pressure_mb": 638.4,
      "Altitude_m": 3887,
      "Temp_c": -5.4,
      "Dewpoint_c": -23.3,
      "Wind_Direction": 303,
      "Wind_Speed_kt": 6.4
    },
    {
      "Pressure_mb": 637.9,
      "Altitude_m": 3893,
      "Temp_c": -5.4,
      "Dewpoint_c": -23.4,
      "Wind_Direction": 303,
      "Wind_Speed_kt": 6.5
    },
    {
      "Pressure_mb": 637.4,
      "Altitude_m": 3899,
      "Temp_c": -5.5,
      "Dewpoint_c": -23.6,
      "Wind_Direction": 303,
      "Wind_Speed_kt": 6.6
    },
    {
      "Pressure_mb": 637,
      "Altitude_m": 3905,
      "Temp_c": -5.5,
      "Dewpoint_c": -23.9,
      "Wind_Direction": 303,
      "Wind_Speed_kt": 6.7
    },
    {
      "Pressure_mb": 636.6,
      "Altitude_m": 3910,
      "Temp_c": -5.5,
      "Dewpoint_c": -24.2,
      "Wind_Direction": 303,
      "Wind_Speed_kt": 6.8
    },
    {
      "Pressure_mb": 636.2,
      "Altitude_m": 3915,
      "Temp_c": -5.5,
      "Dewpoint_c": -24.5,
      "Wind_Direction": 303,
      "Wind_Speed_kt": 6.9
    },
    {
      "Pressure_mb": 635.8,
      "Altitude_m": 3920,
      "Temp_c": -5.6,
      "Dewpoint_c": -24.7,
      "Wind_Direction": 303,
      "Wind_Speed_kt": 7
    },
    {
      "Pressure_mb": 635.3,
      "Altitude_m": 3925,
      "Temp_c": -5.6,
      "Dewpoint_c": -25,
      "Wind_Direction": 303,
      "Wind_Speed_kt": 7.1
    },
    {
      "Pressure_mb": 634.9,
      "Altitude_m": 3931,
      "Temp_c": -5.6,
      "Dewpoint_c": -25.3,
      "Wind_Direction": 303,
      "Wind_Speed_kt": 7.2
    },
    {
      "Pressure_mb": 634.6,
      "Altitude_m": 3935,
      "Temp_c": -5.6,
      "Dewpoint_c": -25.6,
      "Wind_Direction": 303,
      "Wind_Speed_kt": 7.3
    },
    {
      "Pressure_mb": 634.2,
      "Altitude_m": 3939,
      "Temp_c": -5.7,
      "Dewpoint_c": -25.9,
      "Wind_Direction": 303,
      "Wind_Speed_kt": 7.4
    },
    {
      "Pressure_mb": 633.9,
      "Altitude_m": 3943,
      "Temp_c": -5.7,
      "Dewpoint_c": -26.3,
      "Wind_Direction": 303,
      "Wind_Speed_kt": 7.5
    },
    {
      "Pressure_mb": 633.5,
      "Altitude_m": 3948,
      "Temp_c": -5.7,
      "Dewpoint_c": -26.6,
      "Wind_Direction": 303,
      "Wind_Speed_kt": 7.5
    },
    {
      "Pressure_mb": 633.1,
      "Altitude_m": 3952,
      "Temp_c": -5.8,
      "Dewpoint_c": -26.9,
      "Wind_Direction": 303,
      "Wind_Speed_kt": 7.5
    },
    {
      "Pressure_mb": 632.6,
      "Altitude_m": 3959,
      "Temp_c": -5.8,
      "Dewpoint_c": -27.4,
      "Wind_Direction": 304,
      "Wind_Speed_kt": 7.5
    },
    {
      "Pressure_mb": 632.4,
      "Altitude_m": 3962,
      "Temp_c": -5.8,
      "Dewpoint_c": -27.4,
      "Wind_Direction": 304,
      "Wind_Speed_kt": 7.5
    },
    {
      "Pressure_mb": 632,
      "Altitude_m": 3967,
      "Temp_c": -5.8,
      "Dewpoint_c": -27.4,
      "Wind_Direction": 304,
      "Wind_Speed_kt": 7.5
    },
    {
      "Pressure_mb": 631.6,
      "Altitude_m": 3971,
      "Temp_c": -5.9,
      "Dewpoint_c": -27.4,
      "Wind_Direction": 304,
      "Wind_Speed_kt": 7.5
    },
    {
      "Pressure_mb": 631.2,
      "Altitude_m": 3976,
      "Temp_c": -5.9,
      "Dewpoint_c": -27.4,
      "Wind_Direction": 304,
      "Wind_Speed_kt": 7.5
    },
    {
      "Pressure_mb": 630.8,
      "Altitude_m": 3981,
      "Temp_c": -5.9,
      "Dewpoint_c": -27.4,
      "Wind_Direction": 305,
      "Wind_Speed_kt": 7.5
    },
    {
      "Pressure_mb": 630.4,
      "Altitude_m": 3986,
      "Temp_c": -5.9,
      "Dewpoint_c": -27.4,
      "Wind_Direction": 305,
      "Wind_Speed_kt": 7.5
    },
    {
      "Pressure_mb": 630,
      "Altitude_m": 3991,
      "Temp_c": -6,
      "Dewpoint_c": -27.4,
      "Wind_Direction": 305,
      "Wind_Speed_kt": 7.5
    },
    {
      "Pressure_mb": 629.6,
      "Altitude_m": 3996,
      "Temp_c": -6,
      "Dewpoint_c": -27.3,
      "Wind_Direction": 305,
      "Wind_Speed_kt": 7.5
    },
    {
      "Pressure_mb": 629.2,
      "Altitude_m": 4001,
      "Temp_c": -6,
      "Dewpoint_c": -27.3,
      "Wind_Direction": 305,
      "Wind_Speed_kt": 7.5
    },
    {
      "Pressure_mb": 628.8,
      "Altitude_m": 4006,
      "Temp_c": -6,
      "Dewpoint_c": -27.3,
      "Wind_Direction": 306,
      "Wind_Speed_kt": 7.5
    },
    {
      "Pressure_mb": 628.4,
      "Altitude_m": 4011,
      "Temp_c": -6.1,
      "Dewpoint_c": -27.3,
      "Wind_Direction": 306,
      "Wind_Speed_kt": 7.5
    },
    {
      "Pressure_mb": 628,
      "Altitude_m": 4016,
      "Temp_c": -6.1,
      "Dewpoint_c": -27.3,
      "Wind_Direction": 306,
      "Wind_Speed_kt": 7.5
    },
    {
      "Pressure_mb": 627.7,
      "Altitude_m": 4021,
      "Temp_c": -6.1,
      "Dewpoint_c": -27.3,
      "Wind_Direction": 306,
      "Wind_Speed_kt": 7.5
    },
    {
      "Pressure_mb": 627.3,
      "Altitude_m": 4025,
      "Temp_c": -6.1,
      "Dewpoint_c": -27.3,
      "Wind_Direction": 306,
      "Wind_Speed_kt": 7.5
    },
    {
      "Pressure_mb": 626.9,
      "Altitude_m": 4030,
      "Temp_c": -6.2,
      "Dewpoint_c": -27.2,
      "Wind_Direction": 307,
      "Wind_Speed_kt": 7.5
    },
    {
      "Pressure_mb": 626.5,
      "Altitude_m": 4034,
      "Temp_c": -6.2,
      "Dewpoint_c": -27,
      "Wind_Direction": 307,
      "Wind_Speed_kt": 7.5
    },
    {
      "Pressure_mb": 626.2,
      "Altitude_m": 4039,
      "Temp_c": -6.2,
      "Dewpoint_c": -26.9,
      "Wind_Direction": 307,
      "Wind_Speed_kt": 7.5
    },
    {
      "Pressure_mb": 625.8,
      "Altitude_m": 4044,
      "Temp_c": -6.3,
      "Dewpoint_c": -26.8,
      "Wind_Direction": 307,
      "Wind_Speed_kt": 7.5
    },
    {
      "Pressure_mb": 625.4,
      "Altitude_m": 4048,
      "Temp_c": -6.3,
      "Dewpoint_c": -26.7,
      "Wind_Direction": 307,
      "Wind_Speed_kt": 7.5
    },
    {
      "Pressure_mb": 625,
      "Altitude_m": 4053,
      "Temp_c": -6.3,
      "Dewpoint_c": -26.6,
      "Wind_Direction": 307,
      "Wind_Speed_kt": 7.5
    },
    {
      "Pressure_mb": 624.6,
      "Altitude_m": 4059,
      "Temp_c": -6.4,
      "Dewpoint_c": -26.5,
      "Wind_Direction": 307,
      "Wind_Speed_kt": 7.6
    },
    {
      "Pressure_mb": 624.2,
      "Altitude_m": 4064,
      "Temp_c": -6.4,
      "Dewpoint_c": -26.4,
      "Wind_Direction": 307,
      "Wind_Speed_kt": 7.6
    },
    {
      "Pressure_mb": 623.8,
      "Altitude_m": 4069,
      "Temp_c": -6.4,
      "Dewpoint_c": -26.2,
      "Wind_Direction": 307,
      "Wind_Speed_kt": 7.6
    },
    {
      "Pressure_mb": 623.4,
      "Altitude_m": 4074,
      "Temp_c": -6.5,
      "Dewpoint_c": -26.1,
      "Wind_Direction": 307,
      "Wind_Speed_kt": 7.6
    },
    {
      "Pressure_mb": 623,
      "Altitude_m": 4079,
      "Temp_c": -6.5,
      "Dewpoint_c": -26,
      "Wind_Direction": 307,
      "Wind_Speed_kt": 7.6
    },
    {
      "Pressure_mb": 622.6,
      "Altitude_m": 4084,
      "Temp_c": -6.5,
      "Dewpoint_c": -25.9,
      "Wind_Direction": 307,
      "Wind_Speed_kt": 7.7
    },
    {
      "Pressure_mb": 622.1,
      "Altitude_m": 4091,
      "Temp_c": -6.6,
      "Dewpoint_c": -25.8,
      "Wind_Direction": 307,
      "Wind_Speed_kt": 7.7
    },
    {
      "Pressure_mb": 621.8,
      "Altitude_m": 4094,
      "Temp_c": -6.6,
      "Dewpoint_c": -25.9,
      "Wind_Direction": 307,
      "Wind_Speed_kt": 7.7
    },
    {
      "Pressure_mb": 621.4,
      "Altitude_m": 4099,
      "Temp_c": -6.6,
      "Dewpoint_c": -26,
      "Wind_Direction": 307,
      "Wind_Speed_kt": 7.7
    },
    {
      "Pressure_mb": 621,
      "Altitude_m": 4104,
      "Temp_c": -6.7,
      "Dewpoint_c": -26.1,
      "Wind_Direction": 307,
      "Wind_Speed_kt": 7.7
    },
    {
      "Pressure_mb": 620.6,
      "Altitude_m": 4109,
      "Temp_c": -6.7,
      "Dewpoint_c": -26.2,
      "Wind_Direction": 307,
      "Wind_Speed_kt": 7.8
    },
    {
      "Pressure_mb": 620.2,
      "Altitude_m": 4114,
      "Temp_c": -6.7,
      "Dewpoint_c": -26.3,
      "Wind_Direction": 307,
      "Wind_Speed_kt": 7.8
    },
    {
      "Pressure_mb": 619.8,
      "Altitude_m": 4119,
      "Temp_c": -6.8,
      "Dewpoint_c": -26.4,
      "Wind_Direction": 307,
      "Wind_Speed_kt": 7.8
    },
    {
      "Pressure_mb": 619.4,
      "Altitude_m": 4124,
      "Temp_c": -6.8,
      "Dewpoint_c": -26.5,
      "Wind_Direction": 307,
      "Wind_Speed_kt": 7.8
    },
    {
      "Pressure_mb": 619,
      "Altitude_m": 4129,
      "Temp_c": -6.8,
      "Dewpoint_c": -26.6,
      "Wind_Direction": 307,
      "Wind_Speed_kt": 7.8
    },
    {
      "Pressure_mb": 618.6,
      "Altitude_m": 4134,
      "Temp_c": -6.8,
      "Dewpoint_c": -26.7,
      "Wind_Direction": 307,
      "Wind_Speed_kt": 7.9
    },
    {
      "Pressure_mb": 618.3,
      "Altitude_m": 4138,
      "Temp_c": -6.9,
      "Dewpoint_c": -26.9,
      "Wind_Direction": 307,
      "Wind_Speed_kt": 7.9
    },
    {
      "Pressure_mb": 618,
      "Altitude_m": 4143,
      "Temp_c": -6.9,
      "Dewpoint_c": -27,
      "Wind_Direction": 308,
      "Wind_Speed_kt": 7.9
    },
    {
      "Pressure_mb": 617.6,
      "Altitude_m": 4147,
      "Temp_c": -6.9,
      "Dewpoint_c": -27.1,
      "Wind_Direction": 308,
      "Wind_Speed_kt": 7.9
    },
    {
      "Pressure_mb": 617.3,
      "Altitude_m": 4151,
      "Temp_c": -6.9,
      "Dewpoint_c": -27.2,
      "Wind_Direction": 308,
      "Wind_Speed_kt": 8
    },
    {
      "Pressure_mb": 616.9,
      "Altitude_m": 4155,
      "Temp_c": -7,
      "Dewpoint_c": -27.3,
      "Wind_Direction": 308,
      "Wind_Speed_kt": 8
    },
    {
      "Pressure_mb": 616.6,
      "Altitude_m": 4160,
      "Temp_c": -7,
      "Dewpoint_c": -27.4,
      "Wind_Direction": 308,
      "Wind_Speed_kt": 8
    },
    {
      "Pressure_mb": 616.3,
      "Altitude_m": 4164,
      "Temp_c": -7,
      "Dewpoint_c": -27.6,
      "Wind_Direction": 308,
      "Wind_Speed_kt": 8
    },
    {
      "Pressure_mb": 616,
      "Altitude_m": 4167,
      "Temp_c": -7,
      "Dewpoint_c": -27.7,
      "Wind_Direction": 308,
      "Wind_Speed_kt": 8.1
    },
    {
      "Pressure_mb": 615.7,
      "Altitude_m": 4171,
      "Temp_c": -7.1,
      "Dewpoint_c": -27.8,
      "Wind_Direction": 308,
      "Wind_Speed_kt": 8.1
    },
    {
      "Pressure_mb": 615.4,
      "Altitude_m": 4175,
      "Temp_c": -7.1,
      "Dewpoint_c": -28,
      "Wind_Direction": 308,
      "Wind_Speed_kt": 8.1
    },
    {
      "Pressure_mb": 615.1,
      "Altitude_m": 4178,
      "Temp_c": -7.1,
      "Dewpoint_c": -28.1,
      "Wind_Direction": 308,
      "Wind_Speed_kt": 8.1
    },
    {
      "Pressure_mb": 614.8,
      "Altitude_m": 4182,
      "Temp_c": -7.1,
      "Dewpoint_c": -28.2,
      "Wind_Direction": 309,
      "Wind_Speed_kt": 8.2
    },
    {
      "Pressure_mb": 614.5,
      "Altitude_m": 4185,
      "Temp_c": -7.2,
      "Dewpoint_c": -28.4,
      "Wind_Direction": 309,
      "Wind_Speed_kt": 8.2
    },
    {
      "Pressure_mb": 614.2,
      "Altitude_m": 4189,
      "Temp_c": -7.2,
      "Dewpoint_c": -28.5,
      "Wind_Direction": 309,
      "Wind_Speed_kt": 8.2
    },
    {
      "Pressure_mb": 613.9,
      "Altitude_m": 4193,
      "Temp_c": -7.2,
      "Dewpoint_c": -28.6,
      "Wind_Direction": 309,
      "Wind_Speed_kt": 8.3
    },
    {
      "Pressure_mb": 613.5,
      "Altitude_m": 4198,
      "Temp_c": -7.2,
      "Dewpoint_c": -28.8,
      "Wind_Direction": 309,
      "Wind_Speed_kt": 8.3
    },
    {
      "Pressure_mb": 613.4,
      "Altitude_m": 4200,
      "Temp_c": -7.3,
      "Dewpoint_c": -28.9,
      "Wind_Direction": 309,
      "Wind_Speed_kt": 8.3
    },
    {
      "Pressure_mb": 612.9,
      "Altitude_m": 4206,
      "Temp_c": -7.3,
      "Dewpoint_c": -29.1,
      "Wind_Direction": 309,
      "Wind_Speed_kt": 8.3
    },
    {
      "Pressure_mb": 612.6,
      "Altitude_m": 4210,
      "Temp_c": -7.3,
      "Dewpoint_c": -29.1,
      "Wind_Direction": 309,
      "Wind_Speed_kt": 8.4
    },
    {
      "Pressure_mb": 612.2,
      "Altitude_m": 4214,
      "Temp_c": -7.4,
      "Dewpoint_c": -29.2,
      "Wind_Direction": 309,
      "Wind_Speed_kt": 8.4
    },
    {
      "Pressure_mb": 611.8,
      "Altitude_m": 4219,
      "Temp_c": -7.4,
      "Dewpoint_c": -29.3,
      "Wind_Direction": 310,
      "Wind_Speed_kt": 8.4
    },
    {
      "Pressure_mb": 611.5,
      "Altitude_m": 4224,
      "Temp_c": -7.4,
      "Dewpoint_c": -29.3,
      "Wind_Direction": 310,
      "Wind_Speed_kt": 8.4
    },
    {
      "Pressure_mb": 611.1,
      "Altitude_m": 4228,
      "Temp_c": -7.4,
      "Dewpoint_c": -29.4,
      "Wind_Direction": 310,
      "Wind_Speed_kt": 8.4
    },
    {
      "Pressure_mb": 610.8,
      "Altitude_m": 4233,
      "Temp_c": -7.5,
      "Dewpoint_c": -29.5,
      "Wind_Direction": 310,
      "Wind_Speed_kt": 8.4
    },
    {
      "Pressure_mb": 610.4,
      "Altitude_m": 4238,
      "Temp_c": -7.5,
      "Dewpoint_c": -29.5,
      "Wind_Direction": 310,
      "Wind_Speed_kt": 8.4
    },
    {
      "Pressure_mb": 610,
      "Altitude_m": 4243,
      "Temp_c": -7.5,
      "Dewpoint_c": -29.6,
      "Wind_Direction": 310,
      "Wind_Speed_kt": 8.4
    },
    {
      "Pressure_mb": 609.6,
      "Altitude_m": 4248,
      "Temp_c": -7.6,
      "Dewpoint_c": -29.7,
      "Wind_Direction": 310,
      "Wind_Speed_kt": 8.4
    },
    {
      "Pressure_mb": 609.2,
      "Altitude_m": 4253,
      "Temp_c": -7.6,
      "Dewpoint_c": -29.8,
      "Wind_Direction": 310,
      "Wind_Speed_kt": 8.4
    },
    {
      "Pressure_mb": 608.8,
      "Altitude_m": 4258,
      "Temp_c": -7.6,
      "Dewpoint_c": -29.8,
      "Wind_Direction": 310,
      "Wind_Speed_kt": 8.4
    },
    {
      "Pressure_mb": 608.4,
      "Altitude_m": 4263,
      "Temp_c": -7.7,
      "Dewpoint_c": -29.9,
      "Wind_Direction": 310,
      "Wind_Speed_kt": 8.4
    },
    {
      "Pressure_mb": 608,
      "Altitude_m": 4269,
      "Temp_c": -7.7,
      "Dewpoint_c": -30,
      "Wind_Direction": 310,
      "Wind_Speed_kt": 8.4
    },
    {
      "Pressure_mb": 607.8,
      "Altitude_m": 4272,
      "Temp_c": -7.7,
      "Dewpoint_c": -30,
      "Wind_Direction": 310,
      "Wind_Speed_kt": 8.4
    },
    {
      "Pressure_mb": 607.3,
      "Altitude_m": 4278,
      "Temp_c": -7.8,
      "Dewpoint_c": -29,
      "Wind_Direction": 310,
      "Wind_Speed_kt": 8.4
    },
    {
      "Pressure_mb": 606.9,
      "Altitude_m": 4283,
      "Temp_c": -7.8,
      "Dewpoint_c": -28.2,
      "Wind_Direction": 310,
      "Wind_Speed_kt": 8.4
    },
    {
      "Pressure_mb": 606.5,
      "Altitude_m": 4288,
      "Temp_c": -7.8,
      "Dewpoint_c": -27.6,
      "Wind_Direction": 310,
      "Wind_Speed_kt": 8.4
    },
    {
      "Pressure_mb": 606.2,
      "Altitude_m": 4292,
      "Temp_c": -7.9,
      "Dewpoint_c": -26.9,
      "Wind_Direction": 310,
      "Wind_Speed_kt": 8.4
    },
    {
      "Pressure_mb": 605.8,
      "Altitude_m": 4297,
      "Temp_c": -7.9,
      "Dewpoint_c": -26.3,
      "Wind_Direction": 310,
      "Wind_Speed_kt": 8.4
    },
    {
      "Pressure_mb": 605.4,
      "Altitude_m": 4302,
      "Temp_c": -7.9,
      "Dewpoint_c": -25.8,
      "Wind_Direction": 310,
      "Wind_Speed_kt": 8.4
    },
    {
      "Pressure_mb": 605,
      "Altitude_m": 4306,
      "Temp_c": -8,
      "Dewpoint_c": -25.2,
      "Wind_Direction": 310,
      "Wind_Speed_kt": 8.4
    },
    {
      "Pressure_mb": 604.7,
      "Altitude_m": 4311,
      "Temp_c": -8,
      "Dewpoint_c": -24.7,
      "Wind_Direction": 310,
      "Wind_Speed_kt": 8.4
    },
    {
      "Pressure_mb": 604.3,
      "Altitude_m": 4316,
      "Temp_c": -8,
      "Dewpoint_c": -24.2,
      "Wind_Direction": 310,
      "Wind_Speed_kt": 8.4
    },
    {
      "Pressure_mb": 603.9,
      "Altitude_m": 4321,
      "Temp_c": -8.1,
      "Dewpoint_c": -23.7,
      "Wind_Direction": 310,
      "Wind_Speed_kt": 8.5
    },
    {
      "Pressure_mb": 603.6,
      "Altitude_m": 4325,
      "Temp_c": -8.1,
      "Dewpoint_c": -23.3,
      "Wind_Direction": 310,
      "Wind_Speed_kt": 8.5
    },
    {
      "Pressure_mb": 603.2,
      "Altitude_m": 4330,
      "Temp_c": -8.1,
      "Dewpoint_c": -22.9,
      "Wind_Direction": 310,
      "Wind_Speed_kt": 8.6
    },
    {
      "Pressure_mb": 602.8,
      "Altitude_m": 4335,
      "Temp_c": -8.2,
      "Dewpoint_c": -22.4,
      "Wind_Direction": 310,
      "Wind_Speed_kt": 8.7
    },
    {
      "Pressure_mb": 602.5,
      "Altitude_m": 4340,
      "Temp_c": -8.2,
      "Dewpoint_c": -22.1,
      "Wind_Direction": 310,
      "Wind_Speed_kt": 8.7
    },
    {
      "Pressure_mb": 602.1,
      "Altitude_m": 4344,
      "Temp_c": -8.2,
      "Dewpoint_c": -21.8,
      "Wind_Direction": 311,
      "Wind_Speed_kt": 8.8
    },
    {
      "Pressure_mb": 601.7,
      "Altitude_m": 4349,
      "Temp_c": -8.2,
      "Dewpoint_c": -21.5,
      "Wind_Direction": 311,
      "Wind_Speed_kt": 8.9
    },
    {
      "Pressure_mb": 601.4,
      "Altitude_m": 4354,
      "Temp_c": -8.3,
      "Dewpoint_c": -21.2,
      "Wind_Direction": 311,
      "Wind_Speed_kt": 8.9
    },
    {
      "Pressure_mb": 601,
      "Altitude_m": 4358,
      "Temp_c": -8.3,
      "Dewpoint_c": -21,
      "Wind_Direction": 311,
      "Wind_Speed_kt": 9
    },
    {
      "Pressure_mb": 600.6,
      "Altitude_m": 4363,
      "Temp_c": -8.3,
      "Dewpoint_c": -20.7,
      "Wind_Direction": 311,
      "Wind_Speed_kt": 9.1
    },
    {
      "Pressure_mb": 600.3,
      "Altitude_m": 4368,
      "Temp_c": -8.3,
      "Dewpoint_c": -20.4,
      "Wind_Direction": 311,
      "Wind_Speed_kt": 9.1
    },
    {
      "Pressure_mb": 599.9,
      "Altitude_m": 4373,
      "Temp_c": -8.4,
      "Dewpoint_c": -20.1,
      "Wind_Direction": 311,
      "Wind_Speed_kt": 9.2
    },
    {
      "Pressure_mb": 599.5,
      "Altitude_m": 4377,
      "Temp_c": -8.4,
      "Dewpoint_c": -19.9,
      "Wind_Direction": 311,
      "Wind_Speed_kt": 9.3
    },
    {
      "Pressure_mb": 599.1,
      "Altitude_m": 4383,
      "Temp_c": -8.4,
      "Dewpoint_c": -19.6,
      "Wind_Direction": 311,
      "Wind_Speed_kt": 9.3
    },
    {
      "Pressure_mb": 598.7,
      "Altitude_m": 4388,
      "Temp_c": -8.4,
      "Dewpoint_c": -19.4,
      "Wind_Direction": 311,
      "Wind_Speed_kt": 9.4
    },
    {
      "Pressure_mb": 598.4,
      "Altitude_m": 4393,
      "Temp_c": -8.5,
      "Dewpoint_c": -19.2,
      "Wind_Direction": 311,
      "Wind_Speed_kt": 9.4
    },
    {
      "Pressure_mb": 598,
      "Altitude_m": 4398,
      "Temp_c": -8.5,
      "Dewpoint_c": -18.9,
      "Wind_Direction": 311,
      "Wind_Speed_kt": 9.5
    },
    {
      "Pressure_mb": 597.6,
      "Altitude_m": 4403,
      "Temp_c": -8.5,
      "Dewpoint_c": -18.8,
      "Wind_Direction": 312,
      "Wind_Speed_kt": 9.6
    },
    {
      "Pressure_mb": 597.2,
      "Altitude_m": 4408,
      "Temp_c": -8.5,
      "Dewpoint_c": -18.8,
      "Wind_Direction": 312,
      "Wind_Speed_kt": 9.6
    },
    {
      "Pressure_mb": 596.8,
      "Altitude_m": 4413,
      "Temp_c": -8.6,
      "Dewpoint_c": -18.8,
      "Wind_Direction": 312,
      "Wind_Speed_kt": 9.7
    },
    {
      "Pressure_mb": 596.4,
      "Altitude_m": 4418,
      "Temp_c": -8.6,
      "Dewpoint_c": -18.7,
      "Wind_Direction": 312,
      "Wind_Speed_kt": 9.7
    },
    {
      "Pressure_mb": 596.1,
      "Altitude_m": 4422,
      "Temp_c": -8.6,
      "Dewpoint_c": -18.7,
      "Wind_Direction": 311,
      "Wind_Speed_kt": 9.6
    },
    {
      "Pressure_mb": 595.7,
      "Altitude_m": 4427,
      "Temp_c": -8.6,
      "Dewpoint_c": -18.7,
      "Wind_Direction": 311,
      "Wind_Speed_kt": 9.6
    },
    {
      "Pressure_mb": 595.3,
      "Altitude_m": 4432,
      "Temp_c": -8.7,
      "Dewpoint_c": -18.7,
      "Wind_Direction": 311,
      "Wind_Speed_kt": 9.5
    },
    {
      "Pressure_mb": 595,
      "Altitude_m": 4437,
      "Temp_c": -8.7,
      "Dewpoint_c": -18.7,
      "Wind_Direction": 311,
      "Wind_Speed_kt": 9.5
    },
    {
      "Pressure_mb": 594.7,
      "Altitude_m": 4440,
      "Temp_c": -8.7,
      "Dewpoint_c": -18.7,
      "Wind_Direction": 311,
      "Wind_Speed_kt": 9.5
    },
    {
      "Pressure_mb": 594.4,
      "Altitude_m": 4444,
      "Temp_c": -8.8,
      "Dewpoint_c": -18.7,
      "Wind_Direction": 311,
      "Wind_Speed_kt": 9.4
    },
    {
      "Pressure_mb": 594.1,
      "Altitude_m": 4448,
      "Temp_c": -8.8,
      "Dewpoint_c": -18.7,
      "Wind_Direction": 311,
      "Wind_Speed_kt": 9.4
    },
    {
      "Pressure_mb": 593.8,
      "Altitude_m": 4452,
      "Temp_c": -8.8,
      "Dewpoint_c": -18.7,
      "Wind_Direction": 310,
      "Wind_Speed_kt": 9.3
    },
    {
      "Pressure_mb": 593.5,
      "Altitude_m": 4455,
      "Temp_c": -8.8,
      "Dewpoint_c": -18.6,
      "Wind_Direction": 310,
      "Wind_Speed_kt": 9.3
    },
    {
      "Pressure_mb": 593.3,
      "Altitude_m": 4459,
      "Temp_c": -8.8,
      "Dewpoint_c": -18.6,
      "Wind_Direction": 310,
      "Wind_Speed_kt": 9.2
    },
    {
      "Pressure_mb": 593,
      "Altitude_m": 4463,
      "Temp_c": -8.9,
      "Dewpoint_c": -18.6,
      "Wind_Direction": 310,
      "Wind_Speed_kt": 9.2
    },
    {
      "Pressure_mb": 592.7,
      "Altitude_m": 4467,
      "Temp_c": -8.9,
      "Dewpoint_c": -18.6,
      "Wind_Direction": 310,
      "Wind_Speed_kt": 9.2
    },
    {
      "Pressure_mb": 592.4,
      "Altitude_m": 4471,
      "Temp_c": -8.9,
      "Dewpoint_c": -18.7,
      "Wind_Direction": 310,
      "Wind_Speed_kt": 9.1
    },
    {
      "Pressure_mb": 592.1,
      "Altitude_m": 4475,
      "Temp_c": -9,
      "Dewpoint_c": -18.7,
      "Wind_Direction": 310,
      "Wind_Speed_kt": 9.1
    },
    {
      "Pressure_mb": 591.8,
      "Altitude_m": 4479,
      "Temp_c": -9,
      "Dewpoint_c": -18.7,
      "Wind_Direction": 309,
      "Wind_Speed_kt": 9
    },
    {
      "Pressure_mb": 591.5,
      "Altitude_m": 4482,
      "Temp_c": -9,
      "Dewpoint_c": -18.7,
      "Wind_Direction": 309,
      "Wind_Speed_kt": 9
    },
    {
      "Pressure_mb": 591.2,
      "Altitude_m": 4486,
      "Temp_c": -9,
      "Dewpoint_c": -18.7,
      "Wind_Direction": 309,
      "Wind_Speed_kt": 9
    },
    {
      "Pressure_mb": 590.9,
      "Altitude_m": 4490,
      "Temp_c": -9.1,
      "Dewpoint_c": -18.7,
      "Wind_Direction": 309,
      "Wind_Speed_kt": 8.9
    },
    {
      "Pressure_mb": 590.6,
      "Altitude_m": 4494,
      "Temp_c": -9.1,
      "Dewpoint_c": -18.7,
      "Wind_Direction": 309,
      "Wind_Speed_kt": 8.9
    },
    {
      "Pressure_mb": 590.3,
      "Altitude_m": 4498,
      "Temp_c": -9.1,
      "Dewpoint_c": -18.7,
      "Wind_Direction": 309,
      "Wind_Speed_kt": 8.9
    },
    {
      "Pressure_mb": 590,
      "Altitude_m": 4502,
      "Temp_c": -9.2,
      "Dewpoint_c": -18.7,
      "Wind_Direction": 309,
      "Wind_Speed_kt": 8.8
    },
    {
      "Pressure_mb": 589.7,
      "Altitude_m": 4506,
      "Temp_c": -9.2,
      "Dewpoint_c": -18.7,
      "Wind_Direction": 309,
      "Wind_Speed_kt": 8.8
    },
    {
      "Pressure_mb": 589.4,
      "Altitude_m": 4509,
      "Temp_c": -9.2,
      "Dewpoint_c": -18.7,
      "Wind_Direction": 309,
      "Wind_Speed_kt": 8.8
    },
    {
      "Pressure_mb": 589.1,
      "Altitude_m": 4513,
      "Temp_c": -9.2,
      "Dewpoint_c": -18.7,
      "Wind_Direction": 309,
      "Wind_Speed_kt": 8.7
    },
    {
      "Pressure_mb": 588.8,
      "Altitude_m": 4517,
      "Temp_c": -9.3,
      "Dewpoint_c": -18.7,
      "Wind_Direction": 309,
      "Wind_Speed_kt": 8.7
    },
    {
      "Pressure_mb": 588.5,
      "Altitude_m": 4521,
      "Temp_c": -9.3,
      "Dewpoint_c": -18.8,
      "Wind_Direction": 309,
      "Wind_Speed_kt": 8.7
    },
    {
      "Pressure_mb": 588.2,
      "Altitude_m": 4525,
      "Temp_c": -9.3,
      "Dewpoint_c": -18.8,
      "Wind_Direction": 309,
      "Wind_Speed_kt": 8.7
    },
    {
      "Pressure_mb": 587.9,
      "Altitude_m": 4529,
      "Temp_c": -9.4,
      "Dewpoint_c": -18.8,
      "Wind_Direction": 309,
      "Wind_Speed_kt": 8.6
    },
    {
      "Pressure_mb": 587.6,
      "Altitude_m": 4533,
      "Temp_c": -9.4,
      "Dewpoint_c": -18.8,
      "Wind_Direction": 309,
      "Wind_Speed_kt": 8.6
    },
    {
      "Pressure_mb": 587.4,
      "Altitude_m": 4537,
      "Temp_c": -9.4,
      "Dewpoint_c": -18.8,
      "Wind_Direction": 309,
      "Wind_Speed_kt": 8.6
    },
    {
      "Pressure_mb": 587.1,
      "Altitude_m": 4540,
      "Temp_c": -9.4,
      "Dewpoint_c": -18.8,
      "Wind_Direction": 309,
      "Wind_Speed_kt": 8.6
    },
    {
      "Pressure_mb": 586.8,
      "Altitude_m": 4544,
      "Temp_c": -9.5,
      "Dewpoint_c": -18.8,
      "Wind_Direction": 309,
      "Wind_Speed_kt": 8.5
    },
    {
      "Pressure_mb": 586.5,
      "Altitude_m": 4548,
      "Temp_c": -9.5,
      "Dewpoint_c": -18.8,
      "Wind_Direction": 309,
      "Wind_Speed_kt": 8.5
    },
    {
      "Pressure_mb": 586.2,
      "Altitude_m": 4551,
      "Temp_c": -9.5,
      "Dewpoint_c": -18.8,
      "Wind_Direction": 309,
      "Wind_Speed_kt": 8.5
    },
    {
      "Pressure_mb": 585.9,
      "Altitude_m": 4555,
      "Temp_c": -9.6,
      "Dewpoint_c": -18.9,
      "Wind_Direction": 309,
      "Wind_Speed_kt": 8.4
    },
    {
      "Pressure_mb": 585.6,
      "Altitude_m": 4559,
      "Temp_c": -9.6,
      "Dewpoint_c": -18.9,
      "Wind_Direction": 309,
      "Wind_Speed_kt": 8.4
    },
    {
      "Pressure_mb": 585.4,
      "Altitude_m": 4562,
      "Temp_c": -9.6,
      "Dewpoint_c": -18.9,
      "Wind_Direction": 309,
      "Wind_Speed_kt": 8.4
    },
    {
      "Pressure_mb": 585.1,
      "Altitude_m": 4566,
      "Temp_c": -9.7,
      "Dewpoint_c": -18.9,
      "Wind_Direction": 309,
      "Wind_Speed_kt": 8.4
    },
    {
      "Pressure_mb": 584.8,
      "Altitude_m": 4570,
      "Temp_c": -9.7,
      "Dewpoint_c": -19,
      "Wind_Direction": 309,
      "Wind_Speed_kt": 8.3
    },
    {
      "Pressure_mb": 584.5,
      "Altitude_m": 4574,
      "Temp_c": -9.7,
      "Dewpoint_c": -19,
      "Wind_Direction": 309,
      "Wind_Speed_kt": 8.3
    },
    {
      "Pressure_mb": 584.1,
      "Altitude_m": 4579,
      "Temp_c": -9.8,
      "Dewpoint_c": -19.1,
      "Wind_Direction": 308,
      "Wind_Speed_kt": 8.3
    },
    {
      "Pressure_mb": 583.8,
      "Altitude_m": 4584,
      "Temp_c": -9.8,
      "Dewpoint_c": -19.1,
      "Wind_Direction": 308,
      "Wind_Speed_kt": 8.3
    },
    {
      "Pressure_mb": 583.4,
      "Altitude_m": 4589,
      "Temp_c": -9.8,
      "Dewpoint_c": -19.2,
      "Wind_Direction": 308,
      "Wind_Speed_kt": 8.3
    },
    {
      "Pressure_mb": 583,
      "Altitude_m": 4594,
      "Temp_c": -9.8,
      "Dewpoint_c": -19.2,
      "Wind_Direction": 308,
      "Wind_Speed_kt": 8.3
    },
    {
      "Pressure_mb": 582.7,
      "Altitude_m": 4598,
      "Temp_c": -9.9,
      "Dewpoint_c": -19.3,
      "Wind_Direction": 308,
      "Wind_Speed_kt": 8.3
    },
    {
      "Pressure_mb": 582.3,
      "Altitude_m": 4603,
      "Temp_c": -9.9,
      "Dewpoint_c": -19.3,
      "Wind_Direction": 307,
      "Wind_Speed_kt": 8.3
    },
    {
      "Pressure_mb": 582,
      "Altitude_m": 4607,
      "Temp_c": -9.9,
      "Dewpoint_c": -19.4,
      "Wind_Direction": 307,
      "Wind_Speed_kt": 8.3
    },
    {
      "Pressure_mb": 581.6,
      "Altitude_m": 4612,
      "Temp_c": -10,
      "Dewpoint_c": -19.4,
      "Wind_Direction": 307,
      "Wind_Speed_kt": 8.3
    },
    {
      "Pressure_mb": 581.3,
      "Altitude_m": 4616,
      "Temp_c": -10,
      "Dewpoint_c": -19.5,
      "Wind_Direction": 307,
      "Wind_Speed_kt": 8.3
    },
    {
      "Pressure_mb": 580.9,
      "Altitude_m": 4622,
      "Temp_c": -10,
      "Dewpoint_c": -18.6,
      "Wind_Direction": 307,
      "Wind_Speed_kt": 8.3
    },
    {
      "Pressure_mb": 580.6,
      "Altitude_m": 4625,
      "Temp_c": -10.1,
      "Dewpoint_c": -18.6,
      "Wind_Direction": 306,
      "Wind_Speed_kt": 8.3
    },
    {
      "Pressure_mb": 580.3,
      "Altitude_m": 4630,
      "Temp_c": -10.1,
      "Dewpoint_c": -18.6,
      "Wind_Direction": 306,
      "Wind_Speed_kt": 8.2
    },
    {
      "Pressure_mb": 580,
      "Altitude_m": 4634,
      "Temp_c": -10.1,
      "Dewpoint_c": -18.6,
      "Wind_Direction": 306,
      "Wind_Speed_kt": 8.2
    },
    {
      "Pressure_mb": 579.7,
      "Altitude_m": 4638,
      "Temp_c": -10.2,
      "Dewpoint_c": -18.6,
      "Wind_Direction": 306,
      "Wind_Speed_kt": 8.2
    },
    {
      "Pressure_mb": 579.4,
      "Altitude_m": 4642,
      "Temp_c": -10.2,
      "Dewpoint_c": -18.6,
      "Wind_Direction": 306,
      "Wind_Speed_kt": 8.2
    },
    {
      "Pressure_mb": 579,
      "Altitude_m": 4646,
      "Temp_c": -10.2,
      "Dewpoint_c": -18.6,
      "Wind_Direction": 306,
      "Wind_Speed_kt": 8.2
    },
    {
      "Pressure_mb": 578.7,
      "Altitude_m": 4650,
      "Temp_c": -10.3,
      "Dewpoint_c": -18.5,
      "Wind_Direction": 305,
      "Wind_Speed_kt": 8.2
    },
    {
      "Pressure_mb": 578.4,
      "Altitude_m": 4655,
      "Temp_c": -10.3,
      "Dewpoint_c": -18.5,
      "Wind_Direction": 305,
      "Wind_Speed_kt": 8.2
    },
    {
      "Pressure_mb": 578.1,
      "Altitude_m": 4659,
      "Temp_c": -10.3,
      "Dewpoint_c": -18.5,
      "Wind_Direction": 305,
      "Wind_Speed_kt": 8.2
    },
    {
      "Pressure_mb": 577.8,
      "Altitude_m": 4663,
      "Temp_c": -10.4,
      "Dewpoint_c": -18.5,
      "Wind_Direction": 305,
      "Wind_Speed_kt": 8.2
    },
    {
      "Pressure_mb": 577.5,
      "Altitude_m": 4667,
      "Temp_c": -10.4,
      "Dewpoint_c": -18.5,
      "Wind_Direction": 305,
      "Wind_Speed_kt": 8.2
    },
    {
      "Pressure_mb": 577.2,
      "Altitude_m": 4671,
      "Temp_c": -10.4,
      "Dewpoint_c": -18.5,
      "Wind_Direction": 305,
      "Wind_Speed_kt": 8.2
    },
    {
      "Pressure_mb": 576.9,
      "Altitude_m": 4675,
      "Temp_c": -10.5,
      "Dewpoint_c": -18.5,
      "Wind_Direction": 305,
      "Wind_Speed_kt": 8.3
    },
    {
      "Pressure_mb": 576.6,
      "Altitude_m": 4679,
      "Temp_c": -10.5,
      "Dewpoint_c": -18.4,
      "Wind_Direction": 305,
      "Wind_Speed_kt": 8.3
    },
    {
      "Pressure_mb": 576.2,
      "Altitude_m": 4684,
      "Temp_c": -10.5,
      "Dewpoint_c": -18.4,
      "Wind_Direction": 305,
      "Wind_Speed_kt": 8.3
    },
    {
      "Pressure_mb": 575.9,
      "Altitude_m": 4688,
      "Temp_c": -10.6,
      "Dewpoint_c": -18.3,
      "Wind_Direction": 305,
      "Wind_Speed_kt": 8.3
    },
    {
      "Pressure_mb": 575.6,
      "Altitude_m": 4693,
      "Temp_c": -10.6,
      "Dewpoint_c": -18.2,
      "Wind_Direction": 305,
      "Wind_Speed_kt": 8.3
    },
    {
      "Pressure_mb": 575.2,
      "Altitude_m": 4697,
      "Temp_c": -10.6,
      "Dewpoint_c": -18.1,
      "Wind_Direction": 305,
      "Wind_Speed_kt": 8.3
    },
    {
      "Pressure_mb": 574.9,
      "Altitude_m": 4701,
      "Temp_c": -10.6,
      "Dewpoint_c": -18,
      "Wind_Direction": 305,
      "Wind_Speed_kt": 8.3
    },
    {
      "Pressure_mb": 574.6,
      "Altitude_m": 4706,
      "Temp_c": -10.7,
      "Dewpoint_c": -17.9,
      "Wind_Direction": 305,
      "Wind_Speed_kt": 8.3
    },
    {
      "Pressure_mb": 574.2,
      "Altitude_m": 4711,
      "Temp_c": -10.7,
      "Dewpoint_c": -17.9,
      "Wind_Direction": 305,
      "Wind_Speed_kt": 8.4
    },
    {
      "Pressure_mb": 573.9,
      "Altitude_m": 4715,
      "Temp_c": -10.7,
      "Dewpoint_c": -17.8,
      "Wind_Direction": 305,
      "Wind_Speed_kt": 8.4
    },
    {
      "Pressure_mb": 573.5,
      "Altitude_m": 4720,
      "Temp_c": -10.8,
      "Dewpoint_c": -17.7,
      "Wind_Direction": 305,
      "Wind_Speed_kt": 8.4
    },
    {
      "Pressure_mb": 573.2,
      "Altitude_m": 4724,
      "Temp_c": -10.8,
      "Dewpoint_c": -17.6,
      "Wind_Direction": 305,
      "Wind_Speed_kt": 8.4
    },
    {
      "Pressure_mb": 572.9,
      "Altitude_m": 4729,
      "Temp_c": -10.8,
      "Dewpoint_c": -17.5,
      "Wind_Direction": 305,
      "Wind_Speed_kt": 8.4
    },
    {
      "Pressure_mb": 572.5,
      "Altitude_m": 4733,
      "Temp_c": -10.8,
      "Dewpoint_c": -17.5,
      "Wind_Direction": 305,
      "Wind_Speed_kt": 8.4
    },
    {
      "Pressure_mb": 572.2,
      "Altitude_m": 4738,
      "Temp_c": -10.9,
      "Dewpoint_c": -17.4,
      "Wind_Direction": 305,
      "Wind_Speed_kt": 8.4
    },
    {
      "Pressure_mb": 571.8,
      "Altitude_m": 4743,
      "Temp_c": -10.9,
      "Dewpoint_c": -17.3,
      "Wind_Direction": 305,
      "Wind_Speed_kt": 8.4
    },
    {
      "Pressure_mb": 571.4,
      "Altitude_m": 4748,
      "Temp_c": -10.9,
      "Dewpoint_c": -17.2,
      "Wind_Direction": 305,
      "Wind_Speed_kt": 8.5
    },
    {
      "Pressure_mb": 571.1,
      "Altitude_m": 4753,
      "Temp_c": -10.9,
      "Dewpoint_c": -17.1,
      "Wind_Direction": 305,
      "Wind_Speed_kt": 8.6
    },
    {
      "Pressure_mb": 570.7,
      "Altitude_m": 4758,
      "Temp_c": -11,
      "Dewpoint_c": -17,
      "Wind_Direction": 305,
      "Wind_Speed_kt": 8.7
    },
    {
      "Pressure_mb": 570.3,
      "Altitude_m": 4763,
      "Temp_c": -11,
      "Dewpoint_c": -16.9,
      "Wind_Direction": 304,
      "Wind_Speed_kt": 8.8
    },
    {
      "Pressure_mb": 570,
      "Altitude_m": 4767,
      "Temp_c": -11,
      "Dewpoint_c": -16.8,
      "Wind_Direction": 304,
      "Wind_Speed_kt": 9
    },
    {
      "Pressure_mb": 569.7,
      "Altitude_m": 4771,
      "Temp_c": -11,
      "Dewpoint_c": -16.8,
      "Wind_Direction": 304,
      "Wind_Speed_kt": 9.1
    },
    {
      "Pressure_mb": 569.5,
      "Altitude_m": 4775,
      "Temp_c": -11.1,
      "Dewpoint_c": -16.7,
      "Wind_Direction": 304,
      "Wind_Speed_kt": 9.2
    },
    {
      "Pressure_mb": 569.2,
      "Altitude_m": 4779,
      "Temp_c": -11.1,
      "Dewpoint_c": -16.6,
      "Wind_Direction": 304,
      "Wind_Speed_kt": 9.3
    },
    {
      "Pressure_mb": 568.9,
      "Altitude_m": 4783,
      "Temp_c": -11.1,
      "Dewpoint_c": -16.5,
      "Wind_Direction": 304,
      "Wind_Speed_kt": 9.5
    },
    {
      "Pressure_mb": 568.6,
      "Altitude_m": 4786,
      "Temp_c": -11.2,
      "Dewpoint_c": -16.4,
      "Wind_Direction": 304,
      "Wind_Speed_kt": 9.6
    },
    {
      "Pressure_mb": 568.3,
      "Altitude_m": 4790,
      "Temp_c": -11.2,
      "Dewpoint_c": -16.3,
      "Wind_Direction": 304,
      "Wind_Speed_kt": 9.7
    },
    {
      "Pressure_mb": 568,
      "Altitude_m": 4795,
      "Temp_c": -11.2,
      "Dewpoint_c": -16.3,
      "Wind_Direction": 304,
      "Wind_Speed_kt": 9.8
    },
    {
      "Pressure_mb": 567.6,
      "Altitude_m": 4799,
      "Temp_c": -11.2,
      "Dewpoint_c": -16.2,
      "Wind_Direction": 304,
      "Wind_Speed_kt": 0
    },
    {
      "Pressure_mb": 567.3,
      "Altitude_m": 4803,
      "Temp_c": -11.3,
      "Dewpoint_c": -16.2,
      "Wind_Direction": 304,
      "Wind_Speed_kt": 0.1
    },
    {
      "Pressure_mb": 567,
      "Altitude_m": 4808,
      "Temp_c": -11.3,
      "Dewpoint_c": -16.1,
      "Wind_Direction": 304,
      "Wind_Speed_kt": 0.2
    },
    {
      "Pressure_mb": 566.7,
      "Altitude_m": 4812,
      "Temp_c": -11.3,
      "Dewpoint_c": -16.1,
      "Wind_Direction": 304,
      "Wind_Speed_kt": 0.4
    },
    {
      "Pressure_mb": 566.4,
      "Altitude_m": 4816,
      "Temp_c": -11.4,
      "Dewpoint_c": -16.1,
      "Wind_Direction": 304,
      "Wind_Speed_kt": 0.5
    },
    {
      "Pressure_mb": 566,
      "Altitude_m": 4821,
      "Temp_c": -11.4,
      "Dewpoint_c": -16,
      "Wind_Direction": 303,
      "Wind_Speed_kt": 0.6
    },
    {
      "Pressure_mb": 565.7,
      "Altitude_m": 4826,
      "Temp_c": -11.4,
      "Dewpoint_c": -16,
      "Wind_Direction": 303,
      "Wind_Speed_kt": 0.7
    },
    {
      "Pressure_mb": 565.4,
      "Altitude_m": 4830,
      "Temp_c": -11.4,
      "Dewpoint_c": -16,
      "Wind_Direction": 303,
      "Wind_Speed_kt": 0.9
    },
    {
      "Pressure_mb": 565,
      "Altitude_m": 4835,
      "Temp_c": -11.5,
      "Dewpoint_c": -15.9,
      "Wind_Direction": 303,
      "Wind_Speed_kt": 1
    },
    {
      "Pressure_mb": 564.7,
      "Altitude_m": 4839,
      "Temp_c": -11.5,
      "Dewpoint_c": -15.9,
      "Wind_Direction": 303,
      "Wind_Speed_kt": 1
    },
    {
      "Pressure_mb": 564.3,
      "Altitude_m": 4844,
      "Temp_c": -11.5,
      "Dewpoint_c": -15.9,
      "Wind_Direction": 304,
      "Wind_Speed_kt": 1.1
    },
    {
      "Pressure_mb": 564,
      "Altitude_m": 4849,
      "Temp_c": -11.6,
      "Dewpoint_c": -15.9,
      "Wind_Direction": 304,
      "Wind_Speed_kt": 1.2
    },
    {
      "Pressure_mb": 563.6,
      "Altitude_m": 4854,
      "Temp_c": -11.6,
      "Dewpoint_c": -15.8,
      "Wind_Direction": 304,
      "Wind_Speed_kt": 1.2
    },
    {
      "Pressure_mb": 563.3,
      "Altitude_m": 4858,
      "Temp_c": -11.6,
      "Dewpoint_c": -15.8,
      "Wind_Direction": 304,
      "Wind_Speed_kt": 1.3
    },
    {
      "Pressure_mb": 562.9,
      "Altitude_m": 4864,
      "Temp_c": -11.7,
      "Dewpoint_c": -15.8,
      "Wind_Direction": 304,
      "Wind_Speed_kt": 1.3
    },
    {
      "Pressure_mb": 562.5,
      "Altitude_m": 4868,
      "Temp_c": -11.7,
      "Dewpoint_c": -15.9,
      "Wind_Direction": 304,
      "Wind_Speed_kt": 1.4
    },
    {
      "Pressure_mb": 562.2,
      "Altitude_m": 4873,
      "Temp_c": -11.7,
      "Dewpoint_c": -15.9,
      "Wind_Direction": 304,
      "Wind_Speed_kt": 1.5
    },
    {
      "Pressure_mb": 561.9,
      "Altitude_m": 4878,
      "Temp_c": -11.8,
      "Dewpoint_c": -15.9,
      "Wind_Direction": 305,
      "Wind_Speed_kt": 1.5
    },
    {
      "Pressure_mb": 561.6,
      "Altitude_m": 4882,
      "Temp_c": -11.8,
      "Dewpoint_c": -16,
      "Wind_Direction": 305,
      "Wind_Speed_kt": 1.6
    },
    {
      "Pressure_mb": 561.2,
      "Altitude_m": 4886,
      "Temp_c": -11.8,
      "Dewpoint_c": -16,
      "Wind_Direction": 305,
      "Wind_Speed_kt": 1.7
    },
    {
      "Pressure_mb": 560.9,
      "Altitude_m": 4891,
      "Temp_c": -11.8,
      "Dewpoint_c": -16,
      "Wind_Direction": 305,
      "Wind_Speed_kt": 1.7
    },
    {
      "Pressure_mb": 560.6,
      "Altitude_m": 4895,
      "Temp_c": -11.9,
      "Dewpoint_c": -16,
      "Wind_Direction": 305,
      "Wind_Speed_kt": 1.8
    },
    {
      "Pressure_mb": 560.3,
      "Altitude_m": 4899,
      "Temp_c": -11.9,
      "Dewpoint_c": -16.1,
      "Wind_Direction": 305,
      "Wind_Speed_kt": 1.8
    },
    {
      "Pressure_mb": 560,
      "Altitude_m": 4903,
      "Temp_c": -11.9,
      "Dewpoint_c": -16.1,
      "Wind_Direction": 305,
      "Wind_Speed_kt": 1.9
    },
    {
      "Pressure_mb": 559.7,
      "Altitude_m": 4908,
      "Temp_c": -12,
      "Dewpoint_c": -16.1,
      "Wind_Direction": 306,
      "Wind_Speed_kt": 2
    },
    {
      "Pressure_mb": 559.4,
      "Altitude_m": 4912,
      "Temp_c": -12,
      "Dewpoint_c": -16.2,
      "Wind_Direction": 306,
      "Wind_Speed_kt": 2
    },
    {
      "Pressure_mb": 559.1,
      "Altitude_m": 4916,
      "Temp_c": -12,
      "Dewpoint_c": -16.2,
      "Wind_Direction": 306,
      "Wind_Speed_kt": 2.1
    },
    {
      "Pressure_mb": 558.8,
      "Altitude_m": 4920,
      "Temp_c": -12,
      "Dewpoint_c": -16.2,
      "Wind_Direction": 306,
      "Wind_Speed_kt": 2.1
    },
    {
      "Pressure_mb": 558.4,
      "Altitude_m": 4924,
      "Temp_c": -12.1,
      "Dewpoint_c": -16.3,
      "Wind_Direction": 306,
      "Wind_Speed_kt": 2.2
    },
    {
      "Pressure_mb": 558.1,
      "Altitude_m": 4928,
      "Temp_c": -12.1,
      "Dewpoint_c": -16.3,
      "Wind_Direction": 306,
      "Wind_Speed_kt": 2.3
    },
    {
      "Pressure_mb": 557.8,
      "Altitude_m": 4933,
      "Temp_c": -12.1,
      "Dewpoint_c": -16.4,
      "Wind_Direction": 306,
      "Wind_Speed_kt": 2.4
    },
    {
      "Pressure_mb": 557.5,
      "Altitude_m": 4937,
      "Temp_c": -12.1,
      "Dewpoint_c": -16.4,
      "Wind_Direction": 306,
      "Wind_Speed_kt": 2.4
    },
    {
      "Pressure_mb": 557.2,
      "Altitude_m": 4942,
      "Temp_c": -12.2,
      "Dewpoint_c": -16.5,
      "Wind_Direction": 306,
      "Wind_Speed_kt": 2.5
    },
    {
      "Pressure_mb": 556.8,
      "Altitude_m": 4946,
      "Temp_c": -12.2,
      "Dewpoint_c": -16.5,
      "Wind_Direction": 306,
      "Wind_Speed_kt": 2.6
    },
    {
      "Pressure_mb": 556.5,
      "Altitude_m": 4951,
      "Temp_c": -12.2,
      "Dewpoint_c": -16.6,
      "Wind_Direction": 306,
      "Wind_Speed_kt": 2.7
    },
    {
      "Pressure_mb": 556.2,
      "Altitude_m": 4955,
      "Temp_c": -12.2,
      "Dewpoint_c": -16.6,
      "Wind_Direction": 306,
      "Wind_Speed_kt": 2.8
    },
    {
      "Pressure_mb": 555.9,
      "Altitude_m": 4959,
      "Temp_c": -12.2,
      "Dewpoint_c": -16.7,
      "Wind_Direction": 306,
      "Wind_Speed_kt": 2.8
    },
    {
      "Pressure_mb": 555.6,
      "Altitude_m": 4964,
      "Temp_c": -12.2,
      "Dewpoint_c": -16.7,
      "Wind_Direction": 306,
      "Wind_Speed_kt": 2.9
    },
    {
      "Pressure_mb": 555.2,
      "Altitude_m": 4968,
      "Temp_c": -12.3,
      "Dewpoint_c": -16.8,
      "Wind_Direction": 306,
      "Wind_Speed_kt": 3
    },
    {
      "Pressure_mb": 554.9,
      "Altitude_m": 4973,
      "Temp_c": -12.3,
      "Dewpoint_c": -16.8,
      "Wind_Direction": 306,
      "Wind_Speed_kt": 3.1
    },
    {
      "Pressure_mb": 554.6,
      "Altitude_m": 4977,
      "Temp_c": -12.3,
      "Dewpoint_c": -16.8,
      "Wind_Direction": 306,
      "Wind_Speed_kt": 3.2
    },
    {
      "Pressure_mb": 554,
      "Altitude_m": 4984,
      "Temp_c": -12.3,
      "Dewpoint_c": -16.9,
      "Wind_Direction": 306,
      "Wind_Speed_kt": 3.3
    },
    {
      "Pressure_mb": 553.8,
      "Altitude_m": 4987,
      "Temp_c": -12.3,
      "Dewpoint_c": -16.9,
      "Wind_Direction": 306,
      "Wind_Speed_kt": 3.3
    },
    {
      "Pressure_mb": 553.5,
      "Altitude_m": 4992,
      "Temp_c": -12.3,
      "Dewpoint_c": -17,
      "Wind_Direction": 307,
      "Wind_Speed_kt": 3.4
    },
    {
      "Pressure_mb": 553.1,
      "Altitude_m": 4997,
      "Temp_c": -12.3,
      "Dewpoint_c": -17,
      "Wind_Direction": 307,
      "Wind_Speed_kt": 3.5
    },
    {
      "Pressure_mb": 552.8,
      "Altitude_m": 5002,
      "Temp_c": -12.3,
      "Dewpoint_c": -17,
      "Wind_Direction": 307,
      "Wind_Speed_kt": 3.6
    },
    {
      "Pressure_mb": 552.4,
      "Altitude_m": 5007,
      "Temp_c": -12.3,
      "Dewpoint_c": -17,
      "Wind_Direction": 307,
      "Wind_Speed_kt": 3.6
    },
    {
      "Pressure_mb": 552.1,
      "Altitude_m": 5012,
      "Temp_c": -12.3,
      "Dewpoint_c": -17.1,
      "Wind_Direction": 307,
      "Wind_Speed_kt": 3.7
    },
    {
      "Pressure_mb": 551.8,
      "Altitude_m": 5017,
      "Temp_c": -12.3,
      "Dewpoint_c": -17.1,
      "Wind_Direction": 307,
      "Wind_Speed_kt": 3.8
    },
    {
      "Pressure_mb": 551.5,
      "Altitude_m": 5021,
      "Temp_c": -12.3,
      "Dewpoint_c": -17.1,
      "Wind_Direction": 307,
      "Wind_Speed_kt": 3.9
    },
    {
      "Pressure_mb": 551.1,
      "Altitude_m": 5026,
      "Temp_c": -12.3,
      "Dewpoint_c": -17.2,
      "Wind_Direction": 307,
      "Wind_Speed_kt": 3.9
    },
    {
      "Pressure_mb": 550.8,
      "Altitude_m": 5030,
      "Temp_c": -12.3,
      "Dewpoint_c": -17.2,
      "Wind_Direction": 307,
      "Wind_Speed_kt": 4
    },
    {
      "Pressure_mb": 550.5,
      "Altitude_m": 5034,
      "Temp_c": -12.3,
      "Dewpoint_c": -17.2,
      "Wind_Direction": 307,
      "Wind_Speed_kt": 4.1
    },
    {
      "Pressure_mb": 550.2,
      "Altitude_m": 5038,
      "Temp_c": -12.4,
      "Dewpoint_c": -17.2,
      "Wind_Direction": 307,
      "Wind_Speed_kt": 4.2
    },
    {
      "Pressure_mb": 549.9,
      "Altitude_m": 5042,
      "Temp_c": -12.4,
      "Dewpoint_c": -17.3,
      "Wind_Direction": 307,
      "Wind_Speed_kt": 4.2
    },
    {
      "Pressure_mb": 549.6,
      "Altitude_m": 5046,
      "Temp_c": -12.4,
      "Dewpoint_c": -17.3,
      "Wind_Direction": 307,
      "Wind_Speed_kt": 4.3
    },
    {
      "Pressure_mb": 549.3,
      "Altitude_m": 5050,
      "Temp_c": -12.4,
      "Dewpoint_c": -17.3,
      "Wind_Direction": 308,
      "Wind_Speed_kt": 4.4
    },
    {
      "Pressure_mb": 549,
      "Altitude_m": 5055,
      "Temp_c": -12.4,
      "Dewpoint_c": -17.3,
      "Wind_Direction": 308,
      "Wind_Speed_kt": 4.5
    },
    {
      "Pressure_mb": 548.7,
      "Altitude_m": 5059,
      "Temp_c": -12.4,
      "Dewpoint_c": -17.3,
      "Wind_Direction": 308,
      "Wind_Speed_kt": 4.5
    },
    {
      "Pressure_mb": 548.4,
      "Altitude_m": 5063,
      "Temp_c": -12.4,
      "Dewpoint_c": -17.4,
      "Wind_Direction": 308,
      "Wind_Speed_kt": 4.6
    },
    {
      "Pressure_mb": 548,
      "Altitude_m": 5067,
      "Temp_c": -12.4,
      "Dewpoint_c": -17.4,
      "Wind_Direction": 308,
      "Wind_Speed_kt": 4.7
    },
    {
      "Pressure_mb": 547.7,
      "Altitude_m": 5072,
      "Temp_c": -12.5,
      "Dewpoint_c": -17.4,
      "Wind_Direction": 308,
      "Wind_Speed_kt": 4.8
    },
    {
      "Pressure_mb": 547.4,
      "Altitude_m": 5077,
      "Temp_c": -12.5,
      "Dewpoint_c": -17.4,
      "Wind_Direction": 308,
      "Wind_Speed_kt": 4.9
    },
    {
      "Pressure_mb": 547.1,
      "Altitude_m": 5081,
      "Temp_c": -12.5,
      "Dewpoint_c": -17.5,
      "Wind_Direction": 308,
      "Wind_Speed_kt": 4.9
    },
    {
      "Pressure_mb": 546.7,
      "Altitude_m": 5086,
      "Temp_c": -12.5,
      "Dewpoint_c": -17.5,
      "Wind_Direction": 308,
      "Wind_Speed_kt": 5
    },
    {
      "Pressure_mb": 546.3,
      "Altitude_m": 5091,
      "Temp_c": -12.5,
      "Dewpoint_c": -17.5,
      "Wind_Direction": 309,
      "Wind_Speed_kt": 5.1
    },
    {
      "Pressure_mb": 545.9,
      "Altitude_m": 5097,
      "Temp_c": -12.6,
      "Dewpoint_c": -17.5,
      "Wind_Direction": 309,
      "Wind_Speed_kt": 5.2
    },
    {
      "Pressure_mb": 545.6,
      "Altitude_m": 5101,
      "Temp_c": -12.6,
      "Dewpoint_c": -17.5,
      "Wind_Direction": 309,
      "Wind_Speed_kt": 5.2
    },
    {
      "Pressure_mb": 545.2,
      "Altitude_m": 5108,
      "Temp_c": -12.6,
      "Dewpoint_c": -17.6,
      "Wind_Direction": 309,
      "Wind_Speed_kt": 5.3
    },
    {
      "Pressure_mb": 544.8,
      "Altitude_m": 5113,
      "Temp_c": -12.6,
      "Dewpoint_c": -17.6,
      "Wind_Direction": 309,
      "Wind_Speed_kt": 5.3
    },
    {
      "Pressure_mb": 544.5,
      "Altitude_m": 5119,
      "Temp_c": -12.7,
      "Dewpoint_c": -17.6,
      "Wind_Direction": 309,
      "Wind_Speed_kt": 5.3
    },
    {
      "Pressure_mb": 544.1,
      "Altitude_m": 5123,
      "Temp_c": -12.7,
      "Dewpoint_c": -17.6,
      "Wind_Direction": 309,
      "Wind_Speed_kt": 5.3
    },
    {
      "Pressure_mb": 543.8,
      "Altitude_m": 5128,
      "Temp_c": -12.7,
      "Dewpoint_c": -17.6,
      "Wind_Direction": 309,
      "Wind_Speed_kt": 5.3
    },
    {
      "Pressure_mb": 543.5,
      "Altitude_m": 5132,
      "Temp_c": -12.8,
      "Dewpoint_c": -17.7,
      "Wind_Direction": 309,
      "Wind_Speed_kt": 5.3
    },
    {
      "Pressure_mb": 543.1,
      "Altitude_m": 5137,
      "Temp_c": -12.8,
      "Dewpoint_c": -17.7,
      "Wind_Direction": 310,
      "Wind_Speed_kt": 5.3
    },
    {
      "Pressure_mb": 542.8,
      "Altitude_m": 5141,
      "Temp_c": -12.8,
      "Dewpoint_c": -17.7,
      "Wind_Direction": 310,
      "Wind_Speed_kt": 5.3
    },
    {
      "Pressure_mb": 542.5,
      "Altitude_m": 5146,
      "Temp_c": -12.8,
      "Dewpoint_c": -17.7,
      "Wind_Direction": 310,
      "Wind_Speed_kt": 5.3
    },
    {
      "Pressure_mb": 542.2,
      "Altitude_m": 5150,
      "Temp_c": -12.9,
      "Dewpoint_c": -17.8,
      "Wind_Direction": 310,
      "Wind_Speed_kt": 5.4
    },
    {
      "Pressure_mb": 541.8,
      "Altitude_m": 5155,
      "Temp_c": -12.9,
      "Dewpoint_c": -17.8,
      "Wind_Direction": 310,
      "Wind_Speed_kt": 5.4
    },
    {
      "Pressure_mb": 541.5,
      "Altitude_m": 5160,
      "Temp_c": -12.9,
      "Dewpoint_c": -17.8,
      "Wind_Direction": 310,
      "Wind_Speed_kt": 5.4
    },
    {
      "Pressure_mb": 541.2,
      "Altitude_m": 5164,
      "Temp_c": -12.9,
      "Dewpoint_c": -17.8,
      "Wind_Direction": 310,
      "Wind_Speed_kt": 5.4
    },
    {
      "Pressure_mb": 540.9,
      "Altitude_m": 5169,
      "Temp_c": -13,
      "Dewpoint_c": -17.8,
      "Wind_Direction": 310,
      "Wind_Speed_kt": 5.4
    },
    {
      "Pressure_mb": 540.5,
      "Altitude_m": 5173,
      "Temp_c": -13,
      "Dewpoint_c": -17.9,
      "Wind_Direction": 310,
      "Wind_Speed_kt": 5.4
    },
    {
      "Pressure_mb": 540.2,
      "Altitude_m": 5178,
      "Temp_c": -13,
      "Dewpoint_c": -17.9,
      "Wind_Direction": 311,
      "Wind_Speed_kt": 5.4
    },
    {
      "Pressure_mb": 539.8,
      "Altitude_m": 5183,
      "Temp_c": -13.1,
      "Dewpoint_c": -17.9,
      "Wind_Direction": 311,
      "Wind_Speed_kt": 5.4
    },
    {
      "Pressure_mb": 539.5,
      "Altitude_m": 5188,
      "Temp_c": -13.1,
      "Dewpoint_c": -17.9,
      "Wind_Direction": 311,
      "Wind_Speed_kt": 5.4
    },
    {
      "Pressure_mb": 539.1,
      "Altitude_m": 5193,
      "Temp_c": -13.1,
      "Dewpoint_c": -17.9,
      "Wind_Direction": 311,
      "Wind_Speed_kt": 5.4
    },
    {
      "Pressure_mb": 538.7,
      "Altitude_m": 5198,
      "Temp_c": -13.1,
      "Dewpoint_c": -17.9,
      "Wind_Direction": 311,
      "Wind_Speed_kt": 5.4
    },
    {
      "Pressure_mb": 538.4,
      "Altitude_m": 5204,
      "Temp_c": -13.2,
      "Dewpoint_c": -18,
      "Wind_Direction": 311,
      "Wind_Speed_kt": 5.4
    },
    {
      "Pressure_mb": 538,
      "Altitude_m": 5210,
      "Temp_c": -13.2,
      "Dewpoint_c": -18,
      "Wind_Direction": 311,
      "Wind_Speed_kt": 5.4
    },
    {
      "Pressure_mb": 537.6,
      "Altitude_m": 5215,
      "Temp_c": -13.2,
      "Dewpoint_c": -18,
      "Wind_Direction": 311,
      "Wind_Speed_kt": 5.5
    },
    {
      "Pressure_mb": 537.2,
      "Altitude_m": 5221,
      "Temp_c": -13.3,
      "Dewpoint_c": -18,
      "Wind_Direction": 311,
      "Wind_Speed_kt": 5.5
    },
    {
      "Pressure_mb": 536.8,
      "Altitude_m": 5226,
      "Temp_c": -13.3,
      "Dewpoint_c": -18,
      "Wind_Direction": 311,
      "Wind_Speed_kt": 5.5
    },
    {
      "Pressure_mb": 536.4,
      "Altitude_m": 5232,
      "Temp_c": -13.3,
      "Dewpoint_c": -18,
      "Wind_Direction": 311,
      "Wind_Speed_kt": 5.5
    },
    {
      "Pressure_mb": 536.1,
      "Altitude_m": 5238,
      "Temp_c": -13.3,
      "Dewpoint_c": -18.1,
      "Wind_Direction": 311,
      "Wind_Speed_kt": 5.6
    },
    {
      "Pressure_mb": 535.7,
      "Altitude_m": 5243,
      "Temp_c": -13.4,
      "Dewpoint_c": -18.1,
      "Wind_Direction": 311,
      "Wind_Speed_kt": 5.6
    },
    {
      "Pressure_mb": 535.4,
      "Altitude_m": 5247,
      "Temp_c": -13.4,
      "Dewpoint_c": -18.1,
      "Wind_Direction": 311,
      "Wind_Speed_kt": 5.6
    },
    {
      "Pressure_mb": 535.1,
      "Altitude_m": 5251,
      "Temp_c": -13.4,
      "Dewpoint_c": -18.1,
      "Wind_Direction": 311,
      "Wind_Speed_kt": 5.6
    },
    {
      "Pressure_mb": 534.7,
      "Altitude_m": 5255,
      "Temp_c": -13.4,
      "Dewpoint_c": -18.1,
      "Wind_Direction": 311,
      "Wind_Speed_kt": 5.7
    },
    {
      "Pressure_mb": 534.4,
      "Altitude_m": 5260,
      "Temp_c": -13.4,
      "Dewpoint_c": -18.1,
      "Wind_Direction": 311,
      "Wind_Speed_kt": 5.7
    },
    {
      "Pressure_mb": 534.1,
      "Altitude_m": 5264,
      "Temp_c": -13.5,
      "Dewpoint_c": -18.1,
      "Wind_Direction": 311,
      "Wind_Speed_kt": 5.7
    },
    {
      "Pressure_mb": 533.9,
      "Altitude_m": 5268,
      "Temp_c": -13.5,
      "Dewpoint_c": -18.1,
      "Wind_Direction": 311,
      "Wind_Speed_kt": 5.8
    },
    {
      "Pressure_mb": 533.6,
      "Altitude_m": 5272,
      "Temp_c": -13.5,
      "Dewpoint_c": -18.1,
      "Wind_Direction": 311,
      "Wind_Speed_kt": 5.8
    },
    {
      "Pressure_mb": 533.3,
      "Altitude_m": 5276,
      "Temp_c": -13.5,
      "Dewpoint_c": -18.1,
      "Wind_Direction": 311,
      "Wind_Speed_kt": 5.8
    },
    {
      "Pressure_mb": 533,
      "Altitude_m": 5280,
      "Temp_c": -13.5,
      "Dewpoint_c": -18.1,
      "Wind_Direction": 311,
      "Wind_Speed_kt": 5.8
    },
    {
      "Pressure_mb": 532.7,
      "Altitude_m": 5284,
      "Temp_c": -13.6,
      "Dewpoint_c": -18.1,
      "Wind_Direction": 311,
      "Wind_Speed_kt": 5.9
    },
    {
      "Pressure_mb": 532.4,
      "Altitude_m": 5288,
      "Temp_c": -13.6,
      "Dewpoint_c": -18.1,
      "Wind_Direction": 311,
      "Wind_Speed_kt": 5.9
    },
    {
      "Pressure_mb": 532.1,
      "Altitude_m": 5293,
      "Temp_c": -13.6,
      "Dewpoint_c": -18.1,
      "Wind_Direction": 311,
      "Wind_Speed_kt": 5.9
    },
    {
      "Pressure_mb": 531.8,
      "Altitude_m": 5297,
      "Temp_c": -13.6,
      "Dewpoint_c": -18.1,
      "Wind_Direction": 311,
      "Wind_Speed_kt": 5.9
    },
    {
      "Pressure_mb": 531.5,
      "Altitude_m": 5302,
      "Temp_c": -13.6,
      "Dewpoint_c": -18.1,
      "Wind_Direction": 311,
      "Wind_Speed_kt": 5.9
    },
    {
      "Pressure_mb": 531.2,
      "Altitude_m": 5306,
      "Temp_c": -13.6,
      "Dewpoint_c": -18.1,
      "Wind_Direction": 311,
      "Wind_Speed_kt": 5.8
    },
    {
      "Pressure_mb": 530.8,
      "Altitude_m": 5311,
      "Temp_c": -13.7,
      "Dewpoint_c": -18.1,
      "Wind_Direction": 311,
      "Wind_Speed_kt": 5.8
    },
    {
      "Pressure_mb": 530.5,
      "Altitude_m": 5315,
      "Temp_c": -13.7,
      "Dewpoint_c": -18.1,
      "Wind_Direction": 311,
      "Wind_Speed_kt": 5.7
    },
    {
      "Pressure_mb": 530.2,
      "Altitude_m": 5320,
      "Temp_c": -13.7,
      "Dewpoint_c": -18.1,
      "Wind_Direction": 311,
      "Wind_Speed_kt": 5.7
    },
    {
      "Pressure_mb": 529.9,
      "Altitude_m": 5324,
      "Temp_c": -13.7,
      "Dewpoint_c": -18.1,
      "Wind_Direction": 311,
      "Wind_Speed_kt": 5.7
    },
    {
      "Pressure_mb": 529.6,
      "Altitude_m": 5329,
      "Temp_c": -13.7,
      "Dewpoint_c": -18.1,
      "Wind_Direction": 311,
      "Wind_Speed_kt": 5.6
    },
    {
      "Pressure_mb": 529.3,
      "Altitude_m": 5333,
      "Temp_c": -13.7,
      "Dewpoint_c": -18.1,
      "Wind_Direction": 311,
      "Wind_Speed_kt": 5.6
    },
    {
      "Pressure_mb": 529,
      "Altitude_m": 5337,
      "Temp_c": -13.8,
      "Dewpoint_c": -18.1,
      "Wind_Direction": 311,
      "Wind_Speed_kt": 5.5
    },
    {
      "Pressure_mb": 528.7,
      "Altitude_m": 5341,
      "Temp_c": -13.8,
      "Dewpoint_c": -18.1,
      "Wind_Direction": 311,
      "Wind_Speed_kt": 5.5
    },
    {
      "Pressure_mb": 528.4,
      "Altitude_m": 5345,
      "Temp_c": -13.8,
      "Dewpoint_c": -18.1,
      "Wind_Direction": 311,
      "Wind_Speed_kt": 5.4
    },
    {
      "Pressure_mb": 528.2,
      "Altitude_m": 5349,
      "Temp_c": -13.8,
      "Dewpoint_c": -18.1,
      "Wind_Direction": 311,
      "Wind_Speed_kt": 5.4
    },
    {
      "Pressure_mb": 527.9,
      "Altitude_m": 5354,
      "Temp_c": -13.8,
      "Dewpoint_c": -18.1,
      "Wind_Direction": 311,
      "Wind_Speed_kt": 5.3
    },
    {
      "Pressure_mb": 527.6,
      "Altitude_m": 5358,
      "Temp_c": -13.8,
      "Dewpoint_c": -18.1,
      "Wind_Direction": 311,
      "Wind_Speed_kt": 5.3
    },
    {
      "Pressure_mb": 527.3,
      "Altitude_m": 5362,
      "Temp_c": -13.8,
      "Dewpoint_c": -18.1,
      "Wind_Direction": 311,
      "Wind_Speed_kt": 5.2
    },
    {
      "Pressure_mb": 527,
      "Altitude_m": 5366,
      "Temp_c": -13.9,
      "Dewpoint_c": -18.1,
      "Wind_Direction": 311,
      "Wind_Speed_kt": 5.2
    },
    {
      "Pressure_mb": 526.7,
      "Altitude_m": 5370,
      "Temp_c": -13.9,
      "Dewpoint_c": -18.1,
      "Wind_Direction": 311,
      "Wind_Speed_kt": 5.1
    },
    {
      "Pressure_mb": 526.5,
      "Altitude_m": 5374,
      "Temp_c": -13.9,
      "Dewpoint_c": -18.2,
      "Wind_Direction": 311,
      "Wind_Speed_kt": 5.1
    },
    {
      "Pressure_mb": 526.2,
      "Altitude_m": 5378,
      "Temp_c": -13.9,
      "Dewpoint_c": -18.2,
      "Wind_Direction": 311,
      "Wind_Speed_kt": 5.1
    },
    {
      "Pressure_mb": 525.9,
      "Altitude_m": 5382,
      "Temp_c": -13.9,
      "Dewpoint_c": -18.2,
      "Wind_Direction": 311,
      "Wind_Speed_kt": 5
    },
    {
      "Pressure_mb": 525.6,
      "Altitude_m": 5386,
      "Temp_c": -14,
      "Dewpoint_c": -18.2,
      "Wind_Direction": 311,
      "Wind_Speed_kt": 5.1
    },
    {
      "Pressure_mb": 525.3,
      "Altitude_m": 5390,
      "Temp_c": -14,
      "Dewpoint_c": -18.2,
      "Wind_Direction": 311,
      "Wind_Speed_kt": 5.2
    },
    {
      "Pressure_mb": 525.1,
      "Altitude_m": 5394,
      "Temp_c": -14,
      "Dewpoint_c": -18.2,
      "Wind_Direction": 311,
      "Wind_Speed_kt": 5.2
    },
    {
      "Pressure_mb": 524.8,
      "Altitude_m": 5398,
      "Temp_c": -14,
      "Dewpoint_c": -18.2,
      "Wind_Direction": 311,
      "Wind_Speed_kt": 5.3
    },
    {
      "Pressure_mb": 524.5,
      "Altitude_m": 5402,
      "Temp_c": -14.1,
      "Dewpoint_c": -18.2,
      "Wind_Direction": 311,
      "Wind_Speed_kt": 5.4
    },
    {
      "Pressure_mb": 524.2,
      "Altitude_m": 5406,
      "Temp_c": -14.1,
      "Dewpoint_c": -18.2,
      "Wind_Direction": 311,
      "Wind_Speed_kt": 5.4
    },
    {
      "Pressure_mb": 523.9,
      "Altitude_m": 5410,
      "Temp_c": -14.1,
      "Dewpoint_c": -18.2,
      "Wind_Direction": 311,
      "Wind_Speed_kt": 5.5
    },
    {
      "Pressure_mb": 523.6,
      "Altitude_m": 5415,
      "Temp_c": -14.1,
      "Dewpoint_c": -18.2,
      "Wind_Direction": 311,
      "Wind_Speed_kt": 5.6
    },
    {
      "Pressure_mb": 523.3,
      "Altitude_m": 5419,
      "Temp_c": -14.2,
      "Dewpoint_c": -18.3,
      "Wind_Direction": 311,
      "Wind_Speed_kt": 5.7
    },
    {
      "Pressure_mb": 523,
      "Altitude_m": 5424,
      "Temp_c": -14.2,
      "Dewpoint_c": -18.3,
      "Wind_Direction": 312,
      "Wind_Speed_kt": 5.7
    },
    {
      "Pressure_mb": 522.7,
      "Altitude_m": 5429,
      "Temp_c": -14.2,
      "Dewpoint_c": -18.3,
      "Wind_Direction": 312,
      "Wind_Speed_kt": 5.8
    },
    {
      "Pressure_mb": 522.4,
      "Altitude_m": 5433,
      "Temp_c": -14.2,
      "Dewpoint_c": -18.3,
      "Wind_Direction": 312,
      "Wind_Speed_kt": 5.9
    },
    {
      "Pressure_mb": 522.1,
      "Altitude_m": 5438,
      "Temp_c": -14.3,
      "Dewpoint_c": -18.3,
      "Wind_Direction": 312,
      "Wind_Speed_kt": 5.9
    },
    {
      "Pressure_mb": 521.8,
      "Altitude_m": 5442,
      "Temp_c": -14.3,
      "Dewpoint_c": -18.3,
      "Wind_Direction": 312,
      "Wind_Speed_kt": 6
    },
    {
      "Pressure_mb": 521.5,
      "Altitude_m": 5446,
      "Temp_c": -14.3,
      "Dewpoint_c": -18.4,
      "Wind_Direction": 312,
      "Wind_Speed_kt": 6.1
    },
    {
      "Pressure_mb": 521.2,
      "Altitude_m": 5450,
      "Temp_c": -14.4,
      "Dewpoint_c": -18.4,
      "Wind_Direction": 312,
      "Wind_Speed_kt": 6.2
    },
    {
      "Pressure_mb": 520.9,
      "Altitude_m": 5455,
      "Temp_c": -14.4,
      "Dewpoint_c": -18.4,
      "Wind_Direction": 312,
      "Wind_Speed_kt": 6.2
    },
    {
      "Pressure_mb": 520.6,
      "Altitude_m": 5459,
      "Temp_c": -14.4,
      "Dewpoint_c": -18.4,
      "Wind_Direction": 312,
      "Wind_Speed_kt": 6.3
    },
    {
      "Pressure_mb": 520.2,
      "Altitude_m": 5464,
      "Temp_c": -14.5,
      "Dewpoint_c": -18.4,
      "Wind_Direction": 312,
      "Wind_Speed_kt": 6.4
    },
    {
      "Pressure_mb": 520.1,
      "Altitude_m": 5467,
      "Temp_c": -14.5,
      "Dewpoint_c": -18.4,
      "Wind_Direction": 312,
      "Wind_Speed_kt": 6.5
    },
    {
      "Pressure_mb": 519.8,
      "Altitude_m": 5471,
      "Temp_c": -14.5,
      "Dewpoint_c": -18.5,
      "Wind_Direction": 312,
      "Wind_Speed_kt": 6.5
    },
    {
      "Pressure_mb": 519.5,
      "Altitude_m": 5474,
      "Temp_c": -14.5,
      "Dewpoint_c": -18.5,
      "Wind_Direction": 312,
      "Wind_Speed_kt": 6.5
    },
    {
      "Pressure_mb": 519.2,
      "Altitude_m": 5478,
      "Temp_c": -14.6,
      "Dewpoint_c": -18.5,
      "Wind_Direction": 312,
      "Wind_Speed_kt": 6.5
    },
    {
      "Pressure_mb": 519,
      "Altitude_m": 5482,
      "Temp_c": -14.6,
      "Dewpoint_c": -18.6,
      "Wind_Direction": 312,
      "Wind_Speed_kt": 6.5
    },
    {
      "Pressure_mb": 518.7,
      "Altitude_m": 5487,
      "Temp_c": -14.6,
      "Dewpoint_c": -18.6,
      "Wind_Direction": 312,
      "Wind_Speed_kt": 6.6
    },
    {
      "Pressure_mb": 518.4,
      "Altitude_m": 5491,
      "Temp_c": -14.6,
      "Dewpoint_c": -18.6,
      "Wind_Direction": 312,
      "Wind_Speed_kt": 6.6
    },
    {
      "Pressure_mb": 518.1,
      "Altitude_m": 5495,
      "Temp_c": -14.7,
      "Dewpoint_c": -18.7,
      "Wind_Direction": 312,
      "Wind_Speed_kt": 6.6
    },
    {
      "Pressure_mb": 517.8,
      "Altitude_m": 5500,
      "Temp_c": -14.7,
      "Dewpoint_c": -18.7,
      "Wind_Direction": 312,
      "Wind_Speed_kt": 6.6
    },
    {
      "Pressure_mb": 517.5,
      "Altitude_m": 5504,
      "Temp_c": -14.7,
      "Dewpoint_c": -18.7,
      "Wind_Direction": 312,
      "Wind_Speed_kt": 6.7
    },
    {
      "Pressure_mb": 517.2,
      "Altitude_m": 5508,
      "Temp_c": -14.7,
      "Dewpoint_c": -18.7,
      "Wind_Direction": 312,
      "Wind_Speed_kt": 6.7
    },
    {
      "Pressure_mb": 516.9,
      "Altitude_m": 5513,
      "Temp_c": -14.8,
      "Dewpoint_c": -18.8,
      "Wind_Direction": 313,
      "Wind_Speed_kt": 6.7
    },
    {
      "Pressure_mb": 516.6,
      "Altitude_m": 5517,
      "Temp_c": -14.8,
      "Dewpoint_c": -18.8,
      "Wind_Direction": 313,
      "Wind_Speed_kt": 6.7
    },
    {
      "Pressure_mb": 516.3,
      "Altitude_m": 5522,
      "Temp_c": -14.8,
      "Dewpoint_c": -18.8,
      "Wind_Direction": 313,
      "Wind_Speed_kt": 6.7
    },
    {
      "Pressure_mb": 516,
      "Altitude_m": 5526,
      "Temp_c": -14.8,
      "Dewpoint_c": -18.9,
      "Wind_Direction": 313,
      "Wind_Speed_kt": 6.8
    },
    {
      "Pressure_mb": 515.7,
      "Altitude_m": 5531,
      "Temp_c": -14.9,
      "Dewpoint_c": -18.9,
      "Wind_Direction": 313,
      "Wind_Speed_kt": 6.8
    },
    {
      "Pressure_mb": 515.4,
      "Altitude_m": 5535,
      "Temp_c": -14.9,
      "Dewpoint_c": -18.9,
      "Wind_Direction": 313,
      "Wind_Speed_kt": 6.8
    },
    {
      "Pressure_mb": 515.1,
      "Altitude_m": 5540,
      "Temp_c": -14.9,
      "Dewpoint_c": -18.9,
      "Wind_Direction": 313,
      "Wind_Speed_kt": 6.8
    },
    {
      "Pressure_mb": 514.8,
      "Altitude_m": 5544,
      "Temp_c": -14.9,
      "Dewpoint_c": -19,
      "Wind_Direction": 313,
      "Wind_Speed_kt": 6.9
    },
    {
      "Pressure_mb": 514.5,
      "Altitude_m": 5549,
      "Temp_c": -15,
      "Dewpoint_c": -19,
      "Wind_Direction": 313,
      "Wind_Speed_kt": 6.9
    },
    {
      "Pressure_mb": 514.1,
      "Altitude_m": 5554,
      "Temp_c": -15,
      "Dewpoint_c": -19,
      "Wind_Direction": 313,
      "Wind_Speed_kt": 6.9
    },
    {
      "Pressure_mb": 513.8,
      "Altitude_m": 5558,
      "Temp_c": -15,
      "Dewpoint_c": -19,
      "Wind_Direction": 313,
      "Wind_Speed_kt": 6.9
    },
    {
      "Pressure_mb": 513.5,
      "Altitude_m": 5562,
      "Temp_c": -15,
      "Dewpoint_c": -19.1,
      "Wind_Direction": 313,
      "Wind_Speed_kt": 6.9
    },
    {
      "Pressure_mb": 513.2,
      "Altitude_m": 5567,
      "Temp_c": -15,
      "Dewpoint_c": -19.1,
      "Wind_Direction": 313,
      "Wind_Speed_kt": 6.9
    },
    {
      "Pressure_mb": 512.9,
      "Altitude_m": 5571,
      "Temp_c": -15.1,
      "Dewpoint_c": -19.1,
      "Wind_Direction": 313,
      "Wind_Speed_kt": 6.9
    },
    {
      "Pressure_mb": 512.6,
      "Altitude_m": 5575,
      "Temp_c": -15.1,
      "Dewpoint_c": -19.1,
      "Wind_Direction": 313,
      "Wind_Speed_kt": 6.9
    },
    {
      "Pressure_mb": 512.3,
      "Altitude_m": 5580,
      "Temp_c": -15.1,
      "Dewpoint_c": -19.1,
      "Wind_Direction": 314,
      "Wind_Speed_kt": 6.9
    },
    {
      "Pressure_mb": 512,
      "Altitude_m": 5584,
      "Temp_c": -15.1,
      "Dewpoint_c": -19.2,
      "Wind_Direction": 314,
      "Wind_Speed_kt": 6.9
    },
    {
      "Pressure_mb": 511.7,
      "Altitude_m": 5589,
      "Temp_c": -15.2,
      "Dewpoint_c": -19.2,
      "Wind_Direction": 314,
      "Wind_Speed_kt": 6.9
    },
    {
      "Pressure_mb": 511.4,
      "Altitude_m": 5593,
      "Temp_c": -15.2,
      "Dewpoint_c": -19.2,
      "Wind_Direction": 314,
      "Wind_Speed_kt": 7
    },
    {
      "Pressure_mb": 511.1,
      "Altitude_m": 5598,
      "Temp_c": -15.2,
      "Dewpoint_c": -19.3,
      "Wind_Direction": 314,
      "Wind_Speed_kt": 7
    },
    {
      "Pressure_mb": 510.8,
      "Altitude_m": 5603,
      "Temp_c": -15.2,
      "Dewpoint_c": -19.3,
      "Wind_Direction": 314,
      "Wind_Speed_kt": 7
    },
    {
      "Pressure_mb": 510.5,
      "Altitude_m": 5608,
      "Temp_c": -15.3,
      "Dewpoint_c": -19.3,
      "Wind_Direction": 314,
      "Wind_Speed_kt": 7
    },
    {
      "Pressure_mb": 510.2,
      "Altitude_m": 5612,
      "Temp_c": -15.3,
      "Dewpoint_c": -19.3,
      "Wind_Direction": 314,
      "Wind_Speed_kt": 7
    },
    {
      "Pressure_mb": 509.9,
      "Altitude_m": 5616,
      "Temp_c": -15.3,
      "Dewpoint_c": -19.4,
      "Wind_Direction": 314,
      "Wind_Speed_kt": 7
    },
    {
      "Pressure_mb": 509.6,
      "Altitude_m": 5621,
      "Temp_c": -15.4,
      "Dewpoint_c": -19.4,
      "Wind_Direction": 314,
      "Wind_Speed_kt": 7
    },
    {
      "Pressure_mb": 509.3,
      "Altitude_m": 5625,
      "Temp_c": -15.4,
      "Dewpoint_c": -19.4,
      "Wind_Direction": 314,
      "Wind_Speed_kt": 7
    },
    {
      "Pressure_mb": 509,
      "Altitude_m": 5630,
      "Temp_c": -15.4,
      "Dewpoint_c": -19.5,
      "Wind_Direction": 314,
      "Wind_Speed_kt": 7
    },
    {
      "Pressure_mb": 508.7,
      "Altitude_m": 5634,
      "Temp_c": -15.5,
      "Dewpoint_c": -19.5,
      "Wind_Direction": 314,
      "Wind_Speed_kt": 7
    },
    {
      "Pressure_mb": 508.4,
      "Altitude_m": 5638,
      "Temp_c": -15.5,
      "Dewpoint_c": -19.5,
      "Wind_Direction": 314,
      "Wind_Speed_kt": 7
    },
    {
      "Pressure_mb": 508.1,
      "Altitude_m": 5642,
      "Temp_c": -15.5,
      "Dewpoint_c": -19.5,
      "Wind_Direction": 314,
      "Wind_Speed_kt": 7
    },
    {
      "Pressure_mb": 507.8,
      "Altitude_m": 5646,
      "Temp_c": -15.5,
      "Dewpoint_c": -19.6,
      "Wind_Direction": 314,
      "Wind_Speed_kt": 7.1
    },
    {
      "Pressure_mb": 507.6,
      "Altitude_m": 5651,
      "Temp_c": -15.6,
      "Dewpoint_c": -19.6,
      "Wind_Direction": 314,
      "Wind_Speed_kt": 7.1
    },
    {
      "Pressure_mb": 507.3,
      "Altitude_m": 5655,
      "Temp_c": -15.6,
      "Dewpoint_c": -19.6,
      "Wind_Direction": 314,
      "Wind_Speed_kt": 7.2
    },
    {
      "Pressure_mb": 507,
      "Altitude_m": 5659,
      "Temp_c": -15.6,
      "Dewpoint_c": -19.6,
      "Wind_Direction": 314,
      "Wind_Speed_kt": 7.2
    },
    {
      "Pressure_mb": 506.7,
      "Altitude_m": 5663,
      "Temp_c": -15.6,
      "Dewpoint_c": -19.6,
      "Wind_Direction": 314,
      "Wind_Speed_kt": 7.3
    },
    {
      "Pressure_mb": 506.5,
      "Altitude_m": 5667,
      "Temp_c": -15.6,
      "Dewpoint_c": -19.7,
      "Wind_Direction": 314,
      "Wind_Speed_kt": 7.3
    },
    {
      "Pressure_mb": 506.2,
      "Altitude_m": 5671,
      "Temp_c": -15.7,
      "Dewpoint_c": -19.7,
      "Wind_Direction": 314,
      "Wind_Speed_kt": 7.3
    },
    {
      "Pressure_mb": 505.9,
      "Altitude_m": 5675,
      "Temp_c": -15.7,
      "Dewpoint_c": -19.7,
      "Wind_Direction": 314,
      "Wind_Speed_kt": 7.4
    },
    {
      "Pressure_mb": 505.6,
      "Altitude_m": 5679,
      "Temp_c": -15.7,
      "Dewpoint_c": -19.7,
      "Wind_Direction": 314,
      "Wind_Speed_kt": 7.4
    },
    {
      "Pressure_mb": 505.3,
      "Altitude_m": 5684,
      "Temp_c": -15.7,
      "Dewpoint_c": -19.7,
      "Wind_Direction": 314,
      "Wind_Speed_kt": 7.5
    },
    {
      "Pressure_mb": 505.1,
      "Altitude_m": 5688,
      "Temp_c": -15.8,
      "Dewpoint_c": -19.7,
      "Wind_Direction": 314,
      "Wind_Speed_kt": 7.5
    },
    {
      "Pressure_mb": 504.8,
      "Altitude_m": 5692,
      "Temp_c": -15.8,
      "Dewpoint_c": -19.8,
      "Wind_Direction": 314,
      "Wind_Speed_kt": 7.6
    },
    {
      "Pressure_mb": 504.5,
      "Altitude_m": 5696,
      "Temp_c": -15.8,
      "Dewpoint_c": -19.8,
      "Wind_Direction": 314,
      "Wind_Speed_kt": 7.6
    },
    {
      "Pressure_mb": 504.2,
      "Altitude_m": 5700,
      "Temp_c": -15.8,
      "Dewpoint_c": -19.8,
      "Wind_Direction": 314,
      "Wind_Speed_kt": 7.7
    },
    {
      "Pressure_mb": 503.9,
      "Altitude_m": 5704,
      "Temp_c": -15.8,
      "Dewpoint_c": -19.9,
      "Wind_Direction": 314,
      "Wind_Speed_kt": 7.7
    },
    {
      "Pressure_mb": 503.7,
      "Altitude_m": 5709,
      "Temp_c": -15.8,
      "Dewpoint_c": -19.9,
      "Wind_Direction": 314,
      "Wind_Speed_kt": 7.8
    },
    {
      "Pressure_mb": 503.4,
      "Altitude_m": 5713,
      "Temp_c": -15.9,
      "Dewpoint_c": -19.9,
      "Wind_Direction": 314,
      "Wind_Speed_kt": 7.8
    },
    {
      "Pressure_mb": 503.1,
      "Altitude_m": 5717,
      "Temp_c": -15.9,
      "Dewpoint_c": -19.9,
      "Wind_Direction": 314,
      "Wind_Speed_kt": 7.8
    },
    {
      "Pressure_mb": 502.8,
      "Altitude_m": 5722,
      "Temp_c": -15.9,
      "Dewpoint_c": -20,
      "Wind_Direction": 314,
      "Wind_Speed_kt": 7.9
    },
    {
      "Pressure_mb": 502.5,
      "Altitude_m": 5726,
      "Temp_c": -15.9,
      "Dewpoint_c": -20,
      "Wind_Direction": 314,
      "Wind_Speed_kt": 7.9
    },
    {
      "Pressure_mb": 502.2,
      "Altitude_m": 5730,
      "Temp_c": -15.9,
      "Dewpoint_c": -20,
      "Wind_Direction": 314,
      "Wind_Speed_kt": 7.9
    },
    {
      "Pressure_mb": 501.9,
      "Altitude_m": 5735,
      "Temp_c": -15.9,
      "Dewpoint_c": -20.1,
      "Wind_Direction": 314,
      "Wind_Speed_kt": 7.9
    },
    {
      "Pressure_mb": 501.7,
      "Altitude_m": 5739,
      "Temp_c": -15.9,
      "Dewpoint_c": -20.1,
      "Wind_Direction": 314,
      "Wind_Speed_kt": 7.9
    },
    {
      "Pressure_mb": 501.4,
      "Altitude_m": 5743,
      "Temp_c": -16,
      "Dewpoint_c": -20.1,
      "Wind_Direction": 314,
      "Wind_Speed_kt": 7.9
    },
    {
      "Pressure_mb": 501.1,
      "Altitude_m": 5748,
      "Temp_c": -16,
      "Dewpoint_c": -20.2,
      "Wind_Direction": 314,
      "Wind_Speed_kt": 7.9
    },
    {
      "Pressure_mb": 500.8,
      "Altitude_m": 5752,
      "Temp_c": -16,
      "Dewpoint_c": -20.2,
      "Wind_Direction": 314,
      "Wind_Speed_kt": 7.9
    },
    {
      "Pressure_mb": 500.5,
      "Altitude_m": 5756,
      "Temp_c": -16,
      "Dewpoint_c": -20.2,
      "Wind_Direction": 314,
      "Wind_Speed_kt": 7.9
    },
    {
      "Pressure_mb": 500.2,
      "Altitude_m": 5761,
      "Temp_c": -16,
      "Dewpoint_c": -20.3,
      "Wind_Direction": 314,
      "Wind_Speed_kt": 7.9
    },
    {
      "Pressure_mb": 500,
      "Altitude_m": 5764,
      "Temp_c": -16,
      "Dewpoint_c": -20.3,
      "Wind_Direction": 314,
      "Wind_Speed_kt": 7.9
    },
    {
      "Pressure_mb": 499.6,
      "Altitude_m": 5769,
      "Temp_c": -16.1,
      "Dewpoint_c": -20.4,
      "Wind_Direction": 314,
      "Wind_Speed_kt": 7.9
    },
    {
      "Pressure_mb": 499.3,
      "Altitude_m": 5774,
      "Temp_c": -16.1,
      "Dewpoint_c": -20.5,
      "Wind_Direction": 314,
      "Wind_Speed_kt": 7.9
    },
    {
      "Pressure_mb": 499.1,
      "Altitude_m": 5778,
      "Temp_c": -16.1,
      "Dewpoint_c": -20.6,
      "Wind_Direction": 314,
      "Wind_Speed_kt": 7.9
    },
    {
      "Pressure_mb": 498.8,
      "Altitude_m": 5783,
      "Temp_c": -16.2,
      "Dewpoint_c": -20.6,
      "Wind_Direction": 314,
      "Wind_Speed_kt": 7.9
    },
    {
      "Pressure_mb": 498.5,
      "Altitude_m": 5787,
      "Temp_c": -16.2,
      "Dewpoint_c": -20.7,
      "Wind_Direction": 314,
      "Wind_Speed_kt": 7.9
    },
    {
      "Pressure_mb": 498.2,
      "Altitude_m": 5791,
      "Temp_c": -16.2,
      "Dewpoint_c": -20.7,
      "Wind_Direction": 314,
      "Wind_Speed_kt": 7.9
    },
    {
      "Pressure_mb": 497.9,
      "Altitude_m": 5796,
      "Temp_c": -16.3,
      "Dewpoint_c": -20.8,
      "Wind_Direction": 314,
      "Wind_Speed_kt": 7.9
    },
    {
      "Pressure_mb": 497.6,
      "Altitude_m": 5800,
      "Temp_c": -16.3,
      "Dewpoint_c": -20.9,
      "Wind_Direction": 314,
      "Wind_Speed_kt": 7.9
    },
    {
      "Pressure_mb": 497.4,
      "Altitude_m": 5804,
      "Temp_c": -16.3,
      "Dewpoint_c": -20.9,
      "Wind_Direction": 314,
      "Wind_Speed_kt": 7.9
    },
    {
      "Pressure_mb": 497.2,
      "Altitude_m": 5806,
      "Temp_c": -16.3,
      "Dewpoint_c": -21,
      "Wind_Direction": 314,
      "Wind_Speed_kt": 7.9
    },
    {
      "Pressure_mb": 496.8,
      "Altitude_m": 5812,
      "Temp_c": -16.4,
      "Dewpoint_c": -21,
      "Wind_Direction": 314,
      "Wind_Speed_kt": 7.9
    },
    {
      "Pressure_mb": 496.6,
      "Altitude_m": 5816,
      "Temp_c": -16.4,
      "Dewpoint_c": -21,
      "Wind_Direction": 314,
      "Wind_Speed_kt": 7.9
    },
    {
      "Pressure_mb": 496.3,
      "Altitude_m": 5820,
      "Temp_c": -16.5,
      "Dewpoint_c": -21.1,
      "Wind_Direction": 314,
      "Wind_Speed_kt": 7.9
    },
    {
      "Pressure_mb": 496,
      "Altitude_m": 5824,
      "Temp_c": -16.5,
      "Dewpoint_c": -21.1,
      "Wind_Direction": 314,
      "Wind_Speed_kt": 8
    },
    {
      "Pressure_mb": 495.8,
      "Altitude_m": 5828,
      "Temp_c": -16.5,
      "Dewpoint_c": -21.1,
      "Wind_Direction": 314,
      "Wind_Speed_kt": 8
    },
    {
      "Pressure_mb": 495.5,
      "Altitude_m": 5832,
      "Temp_c": -16.6,
      "Dewpoint_c": -21.2,
      "Wind_Direction": 314,
      "Wind_Speed_kt": 8
    },
    {
      "Pressure_mb": 495.2,
      "Altitude_m": 5836,
      "Temp_c": -16.6,
      "Dewpoint_c": -21.2,
      "Wind_Direction": 314,
      "Wind_Speed_kt": 8
    },
    {
      "Pressure_mb": 494.9,
      "Altitude_m": 5840,
      "Temp_c": -16.6,
      "Dewpoint_c": -21.2,
      "Wind_Direction": 314,
      "Wind_Speed_kt": 8.1
    },
    {
      "Pressure_mb": 494.7,
      "Altitude_m": 5844,
      "Temp_c": -16.7,
      "Dewpoint_c": -21.3,
      "Wind_Direction": 314,
      "Wind_Speed_kt": 8.1
    },
    {
      "Pressure_mb": 494.4,
      "Altitude_m": 5849,
      "Temp_c": -16.7,
      "Dewpoint_c": -21.3,
      "Wind_Direction": 314,
      "Wind_Speed_kt": 8.1
    },
    {
      "Pressure_mb": 494.1,
      "Altitude_m": 5853,
      "Temp_c": -16.7,
      "Dewpoint_c": -21.3,
      "Wind_Direction": 314,
      "Wind_Speed_kt": 8.1
    },
    {
      "Pressure_mb": 493.8,
      "Altitude_m": 5858,
      "Temp_c": -16.8,
      "Dewpoint_c": -21.4,
      "Wind_Direction": 314,
      "Wind_Speed_kt": 8.1
    },
    {
      "Pressure_mb": 493.5,
      "Altitude_m": 5862,
      "Temp_c": -16.8,
      "Dewpoint_c": -21.4,
      "Wind_Direction": 314,
      "Wind_Speed_kt": 8.2
    },
    {
      "Pressure_mb": 493.2,
      "Altitude_m": 5866,
      "Temp_c": -16.8,
      "Dewpoint_c": -21.4,
      "Wind_Direction": 314,
      "Wind_Speed_kt": 8.2
    },
    {
      "Pressure_mb": 493,
      "Altitude_m": 5871,
      "Temp_c": -16.9,
      "Dewpoint_c": -21.4,
      "Wind_Direction": 314,
      "Wind_Speed_kt": 8.2
    },
    {
      "Pressure_mb": 492.7,
      "Altitude_m": 5875,
      "Temp_c": -16.9,
      "Dewpoint_c": -21.5,
      "Wind_Direction": 314,
      "Wind_Speed_kt": 8.2
    },
    {
      "Pressure_mb": 492.4,
      "Altitude_m": 5879,
      "Temp_c": -16.9,
      "Dewpoint_c": -21.5,
      "Wind_Direction": 314,
      "Wind_Speed_kt": 8.3
    },
    {
      "Pressure_mb": 492.1,
      "Altitude_m": 5883,
      "Temp_c": -17,
      "Dewpoint_c": -21.5,
      "Wind_Direction": 314,
      "Wind_Speed_kt": 8.3
    },
    {
      "Pressure_mb": 491.8,
      "Altitude_m": 5888,
      "Temp_c": -17,
      "Dewpoint_c": -21.5,
      "Wind_Direction": 314,
      "Wind_Speed_kt": 8.3
    },
    {
      "Pressure_mb": 491.5,
      "Altitude_m": 5892,
      "Temp_c": -17,
      "Dewpoint_c": -21.6,
      "Wind_Direction": 314,
      "Wind_Speed_kt": 8.3
    },
    {
      "Pressure_mb": 491.3,
      "Altitude_m": 5896,
      "Temp_c": -17.1,
      "Dewpoint_c": -21.6,
      "Wind_Direction": 314,
      "Wind_Speed_kt": 8.3
    },
    {
      "Pressure_mb": 491,
      "Altitude_m": 5900,
      "Temp_c": -17.1,
      "Dewpoint_c": -21.6,
      "Wind_Direction": 314,
      "Wind_Speed_kt": 8.4
    },
    {
      "Pressure_mb": 490.7,
      "Altitude_m": 5905,
      "Temp_c": -17.1,
      "Dewpoint_c": -21.7,
      "Wind_Direction": 314,
      "Wind_Speed_kt": 8.4
    },
    {
      "Pressure_mb": 490.4,
      "Altitude_m": 5909,
      "Temp_c": -17.2,
      "Dewpoint_c": -21.7,
      "Wind_Direction": 314,
      "Wind_Speed_kt": 8.4
    },
    {
      "Pressure_mb": 490.2,
      "Altitude_m": 5913,
      "Temp_c": -17.2,
      "Dewpoint_c": -21.7,
      "Wind_Direction": 314,
      "Wind_Speed_kt": 8.4
    },
    {
      "Pressure_mb": 489.9,
      "Altitude_m": 5918,
      "Temp_c": -17.2,
      "Dewpoint_c": -21.7,
      "Wind_Direction": 314,
      "Wind_Speed_kt": 8.4
    },
    {
      "Pressure_mb": 489.6,
      "Altitude_m": 5922,
      "Temp_c": -17.3,
      "Dewpoint_c": -21.8,
      "Wind_Direction": 314,
      "Wind_Speed_kt": 8.5
    },
    {
      "Pressure_mb": 489.3,
      "Altitude_m": 5926,
      "Temp_c": -17.3,
      "Dewpoint_c": -21.8,
      "Wind_Direction": 314,
      "Wind_Speed_kt": 8.5
    },
    {
      "Pressure_mb": 489,
      "Altitude_m": 5931,
      "Temp_c": -17.3,
      "Dewpoint_c": -21.8,
      "Wind_Direction": 314,
      "Wind_Speed_kt": 8.5
    },
    {
      "Pressure_mb": 488.7,
      "Altitude_m": 5935,
      "Temp_c": -17.4,
      "Dewpoint_c": -21.8,
      "Wind_Direction": 314,
      "Wind_Speed_kt": 8.5
    },
    {
      "Pressure_mb": 488.5,
      "Altitude_m": 5939,
      "Temp_c": -17.4,
      "Dewpoint_c": -21.9,
      "Wind_Direction": 314,
      "Wind_Speed_kt": 8.5
    },
    {
      "Pressure_mb": 488.2,
      "Altitude_m": 5944,
      "Temp_c": -17.5,
      "Dewpoint_c": -21.9,
      "Wind_Direction": 314,
      "Wind_Speed_kt": 8.6
    },
    {
      "Pressure_mb": 487.9,
      "Altitude_m": 5948,
      "Temp_c": -17.5,
      "Dewpoint_c": -21.9,
      "Wind_Direction": 314,
      "Wind_Speed_kt": 8.6
    },
    {
      "Pressure_mb": 487.6,
      "Altitude_m": 5952,
      "Temp_c": -17.5,
      "Dewpoint_c": -21.9,
      "Wind_Direction": 314,
      "Wind_Speed_kt": 8.6
    },
    {
      "Pressure_mb": 487.3,
      "Altitude_m": 5956,
      "Temp_c": -17.6,
      "Dewpoint_c": -21.9,
      "Wind_Direction": 314,
      "Wind_Speed_kt": 8.6
    },
    {
      "Pressure_mb": 487.1,
      "Altitude_m": 5960,
      "Temp_c": -17.6,
      "Dewpoint_c": -22,
      "Wind_Direction": 314,
      "Wind_Speed_kt": 8.6
    },
    {
      "Pressure_mb": 486.8,
      "Altitude_m": 5965,
      "Temp_c": -17.6,
      "Dewpoint_c": -22,
      "Wind_Direction": 314,
      "Wind_Speed_kt": 8.7
    },
    {
      "Pressure_mb": 486.5,
      "Altitude_m": 5969,
      "Temp_c": -17.7,
      "Dewpoint_c": -22,
      "Wind_Direction": 314,
      "Wind_Speed_kt": 8.7
    },
    {
      "Pressure_mb": 486.3,
      "Altitude_m": 5973,
      "Temp_c": -17.7,
      "Dewpoint_c": -22,
      "Wind_Direction": 314,
      "Wind_Speed_kt": 8.7
    },
    {
      "Pressure_mb": 486,
      "Altitude_m": 5977,
      "Temp_c": -17.7,
      "Dewpoint_c": -22.1,
      "Wind_Direction": 314,
      "Wind_Speed_kt": 8.7
    },
    {
      "Pressure_mb": 485.7,
      "Altitude_m": 5981,
      "Temp_c": -17.8,
      "Dewpoint_c": -22.1,
      "Wind_Direction": 314,
      "Wind_Speed_kt": 8.7
    },
    {
      "Pressure_mb": 485.5,
      "Altitude_m": 5985,
      "Temp_c": -17.8,
      "Dewpoint_c": -22.1,
      "Wind_Direction": 314,
      "Wind_Speed_kt": 8.7
    },
    {
      "Pressure_mb": 485.2,
      "Altitude_m": 5989,
      "Temp_c": -17.8,
      "Dewpoint_c": -22.1,
      "Wind_Direction": 315,
      "Wind_Speed_kt": 8.7
    },
    {
      "Pressure_mb": 484.9,
      "Altitude_m": 5993,
      "Temp_c": -17.9,
      "Dewpoint_c": -22.1,
      "Wind_Direction": 315,
      "Wind_Speed_kt": 8.7
    },
    {
      "Pressure_mb": 484.7,
      "Altitude_m": 5997,
      "Temp_c": -17.9,
      "Dewpoint_c": -22.2,
      "Wind_Direction": 315,
      "Wind_Speed_kt": 8.7
    },
    {
      "Pressure_mb": 484.4,
      "Altitude_m": 6002,
      "Temp_c": -18,
      "Dewpoint_c": -22.2,
      "Wind_Direction": 315,
      "Wind_Speed_kt": 8.7
    },
    {
      "Pressure_mb": 484.1,
      "Altitude_m": 6006,
      "Temp_c": -18,
      "Dewpoint_c": -22.2,
      "Wind_Direction": 315,
      "Wind_Speed_kt": 8.7
    },
    {
      "Pressure_mb": 483.8,
      "Altitude_m": 6011,
      "Temp_c": -18,
      "Dewpoint_c": -22.2,
      "Wind_Direction": 315,
      "Wind_Speed_kt": 8.7
    },
    {
      "Pressure_mb": 483.5,
      "Altitude_m": 6015,
      "Temp_c": -18.1,
      "Dewpoint_c": -22.3,
      "Wind_Direction": 315,
      "Wind_Speed_kt": 8.7
    },
    {
      "Pressure_mb": 483.2,
      "Altitude_m": 6020,
      "Temp_c": -18.1,
      "Dewpoint_c": -22.3,
      "Wind_Direction": 315,
      "Wind_Speed_kt": 8.7
    },
    {
      "Pressure_mb": 482.9,
      "Altitude_m": 6025,
      "Temp_c": -18.2,
      "Dewpoint_c": -22.3,
      "Wind_Direction": 315,
      "Wind_Speed_kt": 8.6
    },
    {
      "Pressure_mb": 482.6,
      "Altitude_m": 6029,
      "Temp_c": -18.2,
      "Dewpoint_c": -22.4,
      "Wind_Direction": 315,
      "Wind_Speed_kt": 8.6
    },
    {
      "Pressure_mb": 482.3,
      "Altitude_m": 6034,
      "Temp_c": -18.2,
      "Dewpoint_c": -22.4,
      "Wind_Direction": 315,
      "Wind_Speed_kt": 8.6
    },
    {
      "Pressure_mb": 482,
      "Altitude_m": 6038,
      "Temp_c": -18.3,
      "Dewpoint_c": -22.4,
      "Wind_Direction": 315,
      "Wind_Speed_kt": 8.6
    },
    {
      "Pressure_mb": 481.8,
      "Altitude_m": 6042,
      "Temp_c": -18.3,
      "Dewpoint_c": -22.4,
      "Wind_Direction": 315,
      "Wind_Speed_kt": 8.6
    },
    {
      "Pressure_mb": 481.5,
      "Altitude_m": 6047,
      "Temp_c": -18.4,
      "Dewpoint_c": -22.5,
      "Wind_Direction": 315,
      "Wind_Speed_kt": 8.6
    },
    {
      "Pressure_mb": 481.2,
      "Altitude_m": 6051,
      "Temp_c": -18.4,
      "Dewpoint_c": -22.5,
      "Wind_Direction": 315,
      "Wind_Speed_kt": 8.6
    },
    {
      "Pressure_mb": 480.9,
      "Altitude_m": 6056,
      "Temp_c": -18.4,
      "Dewpoint_c": -22.5,
      "Wind_Direction": 315,
      "Wind_Speed_kt": 8.6
    },
    {
      "Pressure_mb": 480.6,
      "Altitude_m": 6060,
      "Temp_c": -18.5,
      "Dewpoint_c": -22.5,
      "Wind_Direction": 316,
      "Wind_Speed_kt": 8.6
    },
    {
      "Pressure_mb": 480.3,
      "Altitude_m": 6065,
      "Temp_c": -18.5,
      "Dewpoint_c": -22.6,
      "Wind_Direction": 316,
      "Wind_Speed_kt": 8.6
    },
    {
      "Pressure_mb": 480,
      "Altitude_m": 6069,
      "Temp_c": -18.6,
      "Dewpoint_c": -22.6,
      "Wind_Direction": 316,
      "Wind_Speed_kt": 8.6
    },
    {
      "Pressure_mb": 479.7,
      "Altitude_m": 6074,
      "Temp_c": -18.6,
      "Dewpoint_c": -22.6,
      "Wind_Direction": 316,
      "Wind_Speed_kt": 8.6
    },
    {
      "Pressure_mb": 479.5,
      "Altitude_m": 6078,
      "Temp_c": -18.6,
      "Dewpoint_c": -22.7,
      "Wind_Direction": 316,
      "Wind_Speed_kt": 8.6
    },
    {
      "Pressure_mb": 479.2,
      "Altitude_m": 6083,
      "Temp_c": -18.7,
      "Dewpoint_c": -22.7,
      "Wind_Direction": 316,
      "Wind_Speed_kt": 8.6
    },
    {
      "Pressure_mb": 478.9,
      "Altitude_m": 6087,
      "Temp_c": -18.7,
      "Dewpoint_c": -22.7,
      "Wind_Direction": 316,
      "Wind_Speed_kt": 8.7
    },
    {
      "Pressure_mb": 478.5,
      "Altitude_m": 6094,
      "Temp_c": -18.8,
      "Dewpoint_c": -22.7,
      "Wind_Direction": 316,
      "Wind_Speed_kt": 8.7
    },
    {
      "Pressure_mb": 478.3,
      "Altitude_m": 6097,
      "Temp_c": -18.8,
      "Dewpoint_c": -22.8,
      "Wind_Direction": 316,
      "Wind_Speed_kt": 8.7
    },
    {
      "Pressure_mb": 478,
      "Altitude_m": 6101,
      "Temp_c": -18.8,
      "Dewpoint_c": -22.8,
      "Wind_Direction": 316,
      "Wind_Speed_kt": 8.7
    },
    {
      "Pressure_mb": 477.7,
      "Altitude_m": 6106,
      "Temp_c": -18.9,
      "Dewpoint_c": -22.8,
      "Wind_Direction": 316,
      "Wind_Speed_kt": 8.8
    },
    {
      "Pressure_mb": 477.4,
      "Altitude_m": 6110,
      "Temp_c": -18.9,
      "Dewpoint_c": -22.9,
      "Wind_Direction": 316,
      "Wind_Speed_kt": 8.8
    },
    {
      "Pressure_mb": 477.1,
      "Altitude_m": 6115,
      "Temp_c": -18.9,
      "Dewpoint_c": -22.9,
      "Wind_Direction": 316,
      "Wind_Speed_kt": 8.8
    },
    {
      "Pressure_mb": 476.8,
      "Altitude_m": 6119,
      "Temp_c": -18.9,
      "Dewpoint_c": -22.9,
      "Wind_Direction": 316,
      "Wind_Speed_kt": 8.8
    },
    {
      "Pressure_mb": 476.6,
      "Altitude_m": 6123,
      "Temp_c": -19,
      "Dewpoint_c": -23,
      "Wind_Direction": 316,
      "Wind_Speed_kt": 8.8
    },
    {
      "Pressure_mb": 476.3,
      "Altitude_m": 6128,
      "Temp_c": -19,
      "Dewpoint_c": -23,
      "Wind_Direction": 316,
      "Wind_Speed_kt": 8.9
    },
    {
      "Pressure_mb": 476,
      "Altitude_m": 6132,
      "Temp_c": -19,
      "Dewpoint_c": -23,
      "Wind_Direction": 316,
      "Wind_Speed_kt": 8.9
    },
    {
      "Pressure_mb": 475.7,
      "Altitude_m": 6136,
      "Temp_c": -19.1,
      "Dewpoint_c": -23.1,
      "Wind_Direction": 316,
      "Wind_Speed_kt": 8.9
    },
    {
      "Pressure_mb": 475.5,
      "Altitude_m": 6141,
      "Temp_c": -19.1,
      "Dewpoint_c": -23.1,
      "Wind_Direction": 317,
      "Wind_Speed_kt": 8.9
    },
    {
      "Pressure_mb": 475.2,
      "Altitude_m": 6145,
      "Temp_c": -19.1,
      "Dewpoint_c": -23.1,
      "Wind_Direction": 317,
      "Wind_Speed_kt": 9
    },
    {
      "Pressure_mb": 474.9,
      "Altitude_m": 6149,
      "Temp_c": -19.1,
      "Dewpoint_c": -23.2,
      "Wind_Direction": 317,
      "Wind_Speed_kt": 9
    },
    {
      "Pressure_mb": 474.6,
      "Altitude_m": 6154,
      "Temp_c": -19.2,
      "Dewpoint_c": -23.2,
      "Wind_Direction": 317,
      "Wind_Speed_kt": 9
    },
    {
      "Pressure_mb": 474.3,
      "Altitude_m": 6158,
      "Temp_c": -19.2,
      "Dewpoint_c": -23.3,
      "Wind_Direction": 317,
      "Wind_Speed_kt": 9
    },
    {
      "Pressure_mb": 474.1,
      "Altitude_m": 6162,
      "Temp_c": -19.2,
      "Dewpoint_c": -23.3,
      "Wind_Direction": 317,
      "Wind_Speed_kt": 9
    },
    {
      "Pressure_mb": 473.8,
      "Altitude_m": 6167,
      "Temp_c": -19.3,
      "Dewpoint_c": -23.3,
      "Wind_Direction": 317,
      "Wind_Speed_kt": 9
    },
    {
      "Pressure_mb": 473.5,
      "Altitude_m": 6171,
      "Temp_c": -19.3,
      "Dewpoint_c": -23.4,
      "Wind_Direction": 317,
      "Wind_Speed_kt": 9
    },
    {
      "Pressure_mb": 473.2,
      "Altitude_m": 6176,
      "Temp_c": -19.3,
      "Dewpoint_c": -23.4,
      "Wind_Direction": 316,
      "Wind_Speed_kt": 9
    },
    {
      "Pressure_mb": 472.9,
      "Altitude_m": 6180,
      "Temp_c": -19.3,
      "Dewpoint_c": -23.5,
      "Wind_Direction": 316,
      "Wind_Speed_kt": 9
    },
    {
      "Pressure_mb": 472.6,
      "Altitude_m": 6185,
      "Temp_c": -19.4,
      "Dewpoint_c": -23.5,
      "Wind_Direction": 316,
      "Wind_Speed_kt": 9
    },
    {
      "Pressure_mb": 472.3,
      "Altitude_m": 6190,
      "Temp_c": -19.4,
      "Dewpoint_c": -23.5,
      "Wind_Direction": 316,
      "Wind_Speed_kt": 8.9
    },
    {
      "Pressure_mb": 472,
      "Altitude_m": 6194,
      "Temp_c": -19.4,
      "Dewpoint_c": -23.6,
      "Wind_Direction": 316,
      "Wind_Speed_kt": 8.9
    },
    {
      "Pressure_mb": 471.7,
      "Altitude_m": 6199,
      "Temp_c": -19.4,
      "Dewpoint_c": -23.6,
      "Wind_Direction": 316,
      "Wind_Speed_kt": 8.9
    },
    {
      "Pressure_mb": 471.5,
      "Altitude_m": 6203,
      "Temp_c": -19.5,
      "Dewpoint_c": -23.7,
      "Wind_Direction": 316,
      "Wind_Speed_kt": 8.9
    },
    {
      "Pressure_mb": 471.2,
      "Altitude_m": 6208,
      "Temp_c": -19.5,
      "Dewpoint_c": -23.7,
      "Wind_Direction": 316,
      "Wind_Speed_kt": 8.9
    },
    {
      "Pressure_mb": 470.9,
      "Altitude_m": 6213,
      "Temp_c": -19.5,
      "Dewpoint_c": -23.8,
      "Wind_Direction": 316,
      "Wind_Speed_kt": 8.9
    },
    {
      "Pressure_mb": 470.6,
      "Altitude_m": 6217,
      "Temp_c": -19.5,
      "Dewpoint_c": -23.8,
      "Wind_Direction": 316,
      "Wind_Speed_kt": 8.9
    },
    {
      "Pressure_mb": 470.3,
      "Altitude_m": 6222,
      "Temp_c": -19.6,
      "Dewpoint_c": -23.8,
      "Wind_Direction": 316,
      "Wind_Speed_kt": 8.9
    },
    {
      "Pressure_mb": 470,
      "Altitude_m": 6227,
      "Temp_c": -19.6,
      "Dewpoint_c": -23.9,
      "Wind_Direction": 316,
      "Wind_Speed_kt": 8.8
    },
    {
      "Pressure_mb": 469.7,
      "Altitude_m": 6231,
      "Temp_c": -19.6,
      "Dewpoint_c": -23.9,
      "Wind_Direction": 316,
      "Wind_Speed_kt": 8.8
    },
    {
      "Pressure_mb": 469.4,
      "Altitude_m": 6236,
      "Temp_c": -19.6,
      "Dewpoint_c": -24,
      "Wind_Direction": 316,
      "Wind_Speed_kt": 8.8
    },
    {
      "Pressure_mb": 469.1,
      "Altitude_m": 6241,
      "Temp_c": -19.7,
      "Dewpoint_c": -24,
      "Wind_Direction": 316,
      "Wind_Speed_kt": 8.8
    },
    {
      "Pressure_mb": 468.8,
      "Altitude_m": 6246,
      "Temp_c": -19.7,
      "Dewpoint_c": -24.1,
      "Wind_Direction": 316,
      "Wind_Speed_kt": 8.8
    },
    {
      "Pressure_mb": 468.5,
      "Altitude_m": 6250,
      "Temp_c": -19.7,
      "Dewpoint_c": -24.1,
      "Wind_Direction": 316,
      "Wind_Speed_kt": 8.8
    },
    {
      "Pressure_mb": 468.2,
      "Altitude_m": 6255,
      "Temp_c": -19.8,
      "Dewpoint_c": -24.2,
      "Wind_Direction": 315,
      "Wind_Speed_kt": 8.7
    },
    {
      "Pressure_mb": 467.9,
      "Altitude_m": 6260,
      "Temp_c": -19.8,
      "Dewpoint_c": -24.2,
      "Wind_Direction": 315,
      "Wind_Speed_kt": 8.6
    },
    {
      "Pressure_mb": 467.6,
      "Altitude_m": 6265,
      "Temp_c": -19.8,
      "Dewpoint_c": -24.3,
      "Wind_Direction": 315,
      "Wind_Speed_kt": 8.6
    },
    {
      "Pressure_mb": 467.3,
      "Altitude_m": 6269,
      "Temp_c": -19.8,
      "Dewpoint_c": -24.3,
      "Wind_Direction": 315,
      "Wind_Speed_kt": 8.5
    },
    {
      "Pressure_mb": 467,
      "Altitude_m": 6274,
      "Temp_c": -19.9,
      "Dewpoint_c": -24.4,
      "Wind_Direction": 315,
      "Wind_Speed_kt": 8.4
    },
    {
      "Pressure_mb": 466.7,
      "Altitude_m": 6279,
      "Temp_c": -19.9,
      "Dewpoint_c": -24.4,
      "Wind_Direction": 315,
      "Wind_Speed_kt": 8.3
    },
    {
      "Pressure_mb": 466.4,
      "Altitude_m": 6284,
      "Temp_c": -19.9,
      "Dewpoint_c": -24.5,
      "Wind_Direction": 315,
      "Wind_Speed_kt": 8.3
    },
    {
      "Pressure_mb": 466.1,
      "Altitude_m": 6289,
      "Temp_c": -19.9,
      "Dewpoint_c": -24.6,
      "Wind_Direction": 314,
      "Wind_Speed_kt": 8.2
    },
    {
      "Pressure_mb": 465.8,
      "Altitude_m": 6293,
      "Temp_c": -20,
      "Dewpoint_c": -24.7,
      "Wind_Direction": 314,
      "Wind_Speed_kt": 8.1
    },
    {
      "Pressure_mb": 465.5,
      "Altitude_m": 6298,
      "Temp_c": -20,
      "Dewpoint_c": -24.9,
      "Wind_Direction": 314,
      "Wind_Speed_kt": 8.1
    },
    {
      "Pressure_mb": 465.2,
      "Altitude_m": 6302,
      "Temp_c": -20,
      "Dewpoint_c": -25,
      "Wind_Direction": 314,
      "Wind_Speed_kt": 8
    },
    {
      "Pressure_mb": 464.9,
      "Altitude_m": 6307,
      "Temp_c": -20,
      "Dewpoint_c": -25.1,
      "Wind_Direction": 314,
      "Wind_Speed_kt": 7.9
    },
    {
      "Pressure_mb": 464.7,
      "Altitude_m": 6312,
      "Temp_c": -20.1,
      "Dewpoint_c": -25.2,
      "Wind_Direction": 314,
      "Wind_Speed_kt": 7.9
    },
    {
      "Pressure_mb": 464.4,
      "Altitude_m": 6316,
      "Temp_c": -20.1,
      "Dewpoint_c": -25.3,
      "Wind_Direction": 314,
      "Wind_Speed_kt": 7.8
    },
    {
      "Pressure_mb": 464.1,
      "Altitude_m": 6320,
      "Temp_c": -20.1,
      "Dewpoint_c": -25.4,
      "Wind_Direction": 313,
      "Wind_Speed_kt": 7.7
    },
    {
      "Pressure_mb": 463.8,
      "Altitude_m": 6325,
      "Temp_c": -20.1,
      "Dewpoint_c": -25.5,
      "Wind_Direction": 313,
      "Wind_Speed_kt": 7.7
    },
    {
      "Pressure_mb": 463.6,
      "Altitude_m": 6329,
      "Temp_c": -20.1,
      "Dewpoint_c": -25.7,
      "Wind_Direction": 313,
      "Wind_Speed_kt": 7.6
    },
    {
      "Pressure_mb": 463.3,
      "Altitude_m": 6333,
      "Temp_c": -20.2,
      "Dewpoint_c": -25.8,
      "Wind_Direction": 313,
      "Wind_Speed_kt": 7.5
    },
    {
      "Pressure_mb": 463,
      "Altitude_m": 6337,
      "Temp_c": -20.2,
      "Dewpoint_c": -25.9,
      "Wind_Direction": 313,
      "Wind_Speed_kt": 7.4
    },
    {
      "Pressure_mb": 462.7,
      "Altitude_m": 6342,
      "Temp_c": -20.2,
      "Dewpoint_c": -26,
      "Wind_Direction": 313,
      "Wind_Speed_kt": 7.4
    },
    {
      "Pressure_mb": 462.5,
      "Altitude_m": 6346,
      "Temp_c": -20.2,
      "Dewpoint_c": -26,
      "Wind_Direction": 313,
      "Wind_Speed_kt": 7.4
    },
    {
      "Pressure_mb": 462.2,
      "Altitude_m": 6350,
      "Temp_c": -20.3,
      "Dewpoint_c": -26.1,
      "Wind_Direction": 313,
      "Wind_Speed_kt": 7.4
    },
    {
      "Pressure_mb": 461.9,
      "Altitude_m": 6355,
      "Temp_c": -20.3,
      "Dewpoint_c": -26.1,
      "Wind_Direction": 313,
      "Wind_Speed_kt": 7.4
    },
    {
      "Pressure_mb": 461.7,
      "Altitude_m": 6359,
      "Temp_c": -20.3,
      "Dewpoint_c": -26.2,
      "Wind_Direction": 312,
      "Wind_Speed_kt": 7.4
    },
    {
      "Pressure_mb": 461.4,
      "Altitude_m": 6364,
      "Temp_c": -20.4,
      "Dewpoint_c": -26.2,
      "Wind_Direction": 312,
      "Wind_Speed_kt": 7.4
    },
    {
      "Pressure_mb": 461.1,
      "Altitude_m": 6368,
      "Temp_c": -20.4,
      "Dewpoint_c": -26.3,
      "Wind_Direction": 312,
      "Wind_Speed_kt": 7.4
    },
    {
      "Pressure_mb": 460.8,
      "Altitude_m": 6372,
      "Temp_c": -20.5,
      "Dewpoint_c": -26.3,
      "Wind_Direction": 312,
      "Wind_Speed_kt": 7.4
    },
    {
      "Pressure_mb": 460.6,
      "Altitude_m": 6377,
      "Temp_c": -20.5,
      "Dewpoint_c": -26.4,
      "Wind_Direction": 312,
      "Wind_Speed_kt": 7.4
    },
    {
      "Pressure_mb": 460.3,
      "Altitude_m": 6381,
      "Temp_c": -20.5,
      "Dewpoint_c": -26.4,
      "Wind_Direction": 312,
      "Wind_Speed_kt": 7.5
    },
    {
      "Pressure_mb": 460,
      "Altitude_m": 6385,
      "Temp_c": -20.6,
      "Dewpoint_c": -26.5,
      "Wind_Direction": 312,
      "Wind_Speed_kt": 7.5
    },
    {
      "Pressure_mb": 459.7,
      "Altitude_m": 6390,
      "Temp_c": -20.6,
      "Dewpoint_c": -26.6,
      "Wind_Direction": 312,
      "Wind_Speed_kt": 7.5
    },
    {
      "Pressure_mb": 459.5,
      "Altitude_m": 6394,
      "Temp_c": -20.7,
      "Dewpoint_c": -26.6,
      "Wind_Direction": 312,
      "Wind_Speed_kt": 7.5
    },
    {
      "Pressure_mb": 459.3,
      "Altitude_m": 6397,
      "Temp_c": -20.7,
      "Dewpoint_c": -26.7,
      "Wind_Direction": 312,
      "Wind_Speed_kt": 7.5
    },
    {
      "Pressure_mb": 458.9,
      "Altitude_m": 6403,
      "Temp_c": -20.7,
      "Dewpoint_c": -26.7,
      "Wind_Direction": 312,
      "Wind_Speed_kt": 7.5
    },
    {
      "Pressure_mb": 458.7,
      "Altitude_m": 6407,
      "Temp_c": -20.8,
      "Dewpoint_c": -26.7,
      "Wind_Direction": 312,
      "Wind_Speed_kt": 7.5
    },
    {
      "Pressure_mb": 458.4,
      "Altitude_m": 6412,
      "Temp_c": -20.8,
      "Dewpoint_c": -26.8,
      "Wind_Direction": 312,
      "Wind_Speed_kt": 7.5
    },
    {
      "Pressure_mb": 458.1,
      "Altitude_m": 6416,
      "Temp_c": -20.9,
      "Dewpoint_c": -26.8,
      "Wind_Direction": 312,
      "Wind_Speed_kt": 7.5
    },
    {
      "Pressure_mb": 457.8,
      "Altitude_m": 6421,
      "Temp_c": -20.9,
      "Dewpoint_c": -26.8,
      "Wind_Direction": 312,
      "Wind_Speed_kt": 7.5
    },
    {
      "Pressure_mb": 457.5,
      "Altitude_m": 6426,
      "Temp_c": -21,
      "Dewpoint_c": -26.9,
      "Wind_Direction": 311,
      "Wind_Speed_kt": 7.5
    },
    {
      "Pressure_mb": 457.2,
      "Altitude_m": 6431,
      "Temp_c": -21,
      "Dewpoint_c": -26.9,
      "Wind_Direction": 311,
      "Wind_Speed_kt": 7.6
    },
    {
      "Pressure_mb": 456.9,
      "Altitude_m": 6436,
      "Temp_c": -21.1,
      "Dewpoint_c": -26.9,
      "Wind_Direction": 311,
      "Wind_Speed_kt": 7.6
    },
    {
      "Pressure_mb": 456.6,
      "Altitude_m": 6441,
      "Temp_c": -21.1,
      "Dewpoint_c": -27,
      "Wind_Direction": 311,
      "Wind_Speed_kt": 7.6
    },
    {
      "Pressure_mb": 456.2,
      "Altitude_m": 6446,
      "Temp_c": -21.1,
      "Dewpoint_c": -27,
      "Wind_Direction": 312,
      "Wind_Speed_kt": 7.6
    },
    {
      "Pressure_mb": 455.9,
      "Altitude_m": 6451,
      "Temp_c": -21.2,
      "Dewpoint_c": -27.1,
      "Wind_Direction": 312,
      "Wind_Speed_kt": 7.7
    },
    {
      "Pressure_mb": 455.6,
      "Altitude_m": 6456,
      "Temp_c": -21.2,
      "Dewpoint_c": -27.1,
      "Wind_Direction": 312,
      "Wind_Speed_kt": 7.7
    },
    {
      "Pressure_mb": 455.3,
      "Altitude_m": 6462,
      "Temp_c": -21.3,
      "Dewpoint_c": -27.1,
      "Wind_Direction": 312,
      "Wind_Speed_kt": 7.7
    },
    {
      "Pressure_mb": 455,
      "Altitude_m": 6467,
      "Temp_c": -21.3,
      "Dewpoint_c": -27.2,
      "Wind_Direction": 312,
      "Wind_Speed_kt": 7.7
    },
    {
      "Pressure_mb": 454.7,
      "Altitude_m": 6472,
      "Temp_c": -21.4,
      "Dewpoint_c": -27.2,
      "Wind_Direction": 312,
      "Wind_Speed_kt": 7.8
    },
    {
      "Pressure_mb": 454.4,
      "Altitude_m": 6477,
      "Temp_c": -21.4,
      "Dewpoint_c": -27.2,
      "Wind_Direction": 312,
      "Wind_Speed_kt": 7.8
    },
    {
      "Pressure_mb": 454,
      "Altitude_m": 6482,
      "Temp_c": -21.5,
      "Dewpoint_c": -27.2,
      "Wind_Direction": 312,
      "Wind_Speed_kt": 7.8
    },
    {
      "Pressure_mb": 453.7,
      "Altitude_m": 6487,
      "Temp_c": -21.5,
      "Dewpoint_c": -27.3,
      "Wind_Direction": 312,
      "Wind_Speed_kt": 7.8
    },
    {
      "Pressure_mb": 453.4,
      "Altitude_m": 6492,
      "Temp_c": -21.6,
      "Dewpoint_c": -27.3,
      "Wind_Direction": 312,
      "Wind_Speed_kt": 7.9
    },
    {
      "Pressure_mb": 453.1,
      "Altitude_m": 6497,
      "Temp_c": -21.6,
      "Dewpoint_c": -27.3,
      "Wind_Direction": 312,
      "Wind_Speed_kt": 7.9
    },
    {
      "Pressure_mb": 452.8,
      "Altitude_m": 6502,
      "Temp_c": -21.7,
      "Dewpoint_c": -27.3,
      "Wind_Direction": 312,
      "Wind_Speed_kt": 7.9
    },
    {
      "Pressure_mb": 452.5,
      "Altitude_m": 6508,
      "Temp_c": -21.7,
      "Dewpoint_c": -27.4,
      "Wind_Direction": 312,
      "Wind_Speed_kt": 7.9
    },
    {
      "Pressure_mb": 452.2,
      "Altitude_m": 6513,
      "Temp_c": -21.8,
      "Dewpoint_c": -27.4,
      "Wind_Direction": 312,
      "Wind_Speed_kt": 8
    },
    {
      "Pressure_mb": 451.9,
      "Altitude_m": 6517,
      "Temp_c": -21.8,
      "Dewpoint_c": -27.4,
      "Wind_Direction": 312,
      "Wind_Speed_kt": 8
    },
    {
      "Pressure_mb": 451.6,
      "Altitude_m": 6522,
      "Temp_c": -21.9,
      "Dewpoint_c": -27.5,
      "Wind_Direction": 312,
      "Wind_Speed_kt": 8
    },
    {
      "Pressure_mb": 451.3,
      "Altitude_m": 6527,
      "Temp_c": -21.9,
      "Dewpoint_c": -27.5,
      "Wind_Direction": 312,
      "Wind_Speed_kt": 8
    },
    {
      "Pressure_mb": 451,
      "Altitude_m": 6532,
      "Temp_c": -22,
      "Dewpoint_c": -27.5,
      "Wind_Direction": 312,
      "Wind_Speed_kt": 8.1
    },
    {
      "Pressure_mb": 450.7,
      "Altitude_m": 6537,
      "Temp_c": -22,
      "Dewpoint_c": -27.6,
      "Wind_Direction": 312,
      "Wind_Speed_kt": 8.1
    },
    {
      "Pressure_mb": 450.4,
      "Altitude_m": 6542,
      "Temp_c": -22,
      "Dewpoint_c": -27.6,
      "Wind_Direction": 312,
      "Wind_Speed_kt": 8.1
    },
    {
      "Pressure_mb": 450.1,
      "Altitude_m": 6547,
      "Temp_c": -22.1,
      "Dewpoint_c": -27.6,
      "Wind_Direction": 312,
      "Wind_Speed_kt": 8.1
    },
    {
      "Pressure_mb": 449.8,
      "Altitude_m": 6552,
      "Temp_c": -22.1,
      "Dewpoint_c": -27.7,
      "Wind_Direction": 312,
      "Wind_Speed_kt": 8.1
    },
    {
      "Pressure_mb": 449.5,
      "Altitude_m": 6557,
      "Temp_c": -22.2,
      "Dewpoint_c": -27.7,
      "Wind_Direction": 312,
      "Wind_Speed_kt": 8.1
    },
    {
      "Pressure_mb": 449.1,
      "Altitude_m": 6562,
      "Temp_c": -22.2,
      "Dewpoint_c": -27.7,
      "Wind_Direction": 312,
      "Wind_Speed_kt": 8.1
    },
    {
      "Pressure_mb": 448.8,
      "Altitude_m": 6567,
      "Temp_c": -22.3,
      "Dewpoint_c": -27.8,
      "Wind_Direction": 312,
      "Wind_Speed_kt": 8.1
    },
    {
      "Pressure_mb": 448.4,
      "Altitude_m": 6573,
      "Temp_c": -22.3,
      "Dewpoint_c": -27.8,
      "Wind_Direction": 312,
      "Wind_Speed_kt": 8.1
    },
    {
      "Pressure_mb": 448.1,
      "Altitude_m": 6579,
      "Temp_c": -22.4,
      "Dewpoint_c": -27.8,
      "Wind_Direction": 312,
      "Wind_Speed_kt": 8.1
    },
    {
      "Pressure_mb": 447.7,
      "Altitude_m": 6585,
      "Temp_c": -22.4,
      "Dewpoint_c": -27.9,
      "Wind_Direction": 312,
      "Wind_Speed_kt": 8.1
    },
    {
      "Pressure_mb": 447.4,
      "Altitude_m": 6591,
      "Temp_c": -22.5,
      "Dewpoint_c": -27.9,
      "Wind_Direction": 312,
      "Wind_Speed_kt": 8.1
    },
    {
      "Pressure_mb": 447,
      "Altitude_m": 6597,
      "Temp_c": -22.5,
      "Dewpoint_c": -27.9,
      "Wind_Direction": 312,
      "Wind_Speed_kt": 8.1
    },
    {
      "Pressure_mb": 446.7,
      "Altitude_m": 6603,
      "Temp_c": -22.6,
      "Dewpoint_c": -28,
      "Wind_Direction": 312,
      "Wind_Speed_kt": 8.1
    },
    {
      "Pressure_mb": 446.4,
      "Altitude_m": 6608,
      "Temp_c": -22.6,
      "Dewpoint_c": -28,
      "Wind_Direction": 311,
      "Wind_Speed_kt": 8.1
    },
    {
      "Pressure_mb": 446,
      "Altitude_m": 6613,
      "Temp_c": -22.6,
      "Dewpoint_c": -28,
      "Wind_Direction": 311,
      "Wind_Speed_kt": 8.1
    },
    {
      "Pressure_mb": 445.7,
      "Altitude_m": 6618,
      "Temp_c": -22.7,
      "Dewpoint_c": -28.1,
      "Wind_Direction": 311,
      "Wind_Speed_kt": 8.1
    },
    {
      "Pressure_mb": 445.4,
      "Altitude_m": 6624,
      "Temp_c": -22.7,
      "Dewpoint_c": -28.1,
      "Wind_Direction": 311,
      "Wind_Speed_kt": 8.1
    },
    {
      "Pressure_mb": 445.1,
      "Altitude_m": 6629,
      "Temp_c": -22.8,
      "Dewpoint_c": -28.1,
      "Wind_Direction": 311,
      "Wind_Speed_kt": 8.1
    },
    {
      "Pressure_mb": 444.8,
      "Altitude_m": 6633,
      "Temp_c": -22.8,
      "Dewpoint_c": -28.1,
      "Wind_Direction": 311,
      "Wind_Speed_kt": 8.1
    },
    {
      "Pressure_mb": 444.5,
      "Altitude_m": 6638,
      "Temp_c": -22.9,
      "Dewpoint_c": -28.2,
      "Wind_Direction": 311,
      "Wind_Speed_kt": 8.1
    },
    {
      "Pressure_mb": 444.2,
      "Altitude_m": 6643,
      "Temp_c": -22.9,
      "Dewpoint_c": -28.2,
      "Wind_Direction": 311,
      "Wind_Speed_kt": 8.2
    },
    {
      "Pressure_mb": 444,
      "Altitude_m": 6647,
      "Temp_c": -22.9,
      "Dewpoint_c": -28.2,
      "Wind_Direction": 311,
      "Wind_Speed_kt": 8.3
    },
    {
      "Pressure_mb": 443.7,
      "Altitude_m": 6652,
      "Temp_c": -23,
      "Dewpoint_c": -28.3,
      "Wind_Direction": 311,
      "Wind_Speed_kt": 8.3
    },
    {
      "Pressure_mb": 443.4,
      "Altitude_m": 6657,
      "Temp_c": -23,
      "Dewpoint_c": -28.3,
      "Wind_Direction": 310,
      "Wind_Speed_kt": 8.4
    },
    {
      "Pressure_mb": 443,
      "Altitude_m": 6662,
      "Temp_c": -23.1,
      "Dewpoint_c": -28.3,
      "Wind_Direction": 310,
      "Wind_Speed_kt": 8.5
    },
    {
      "Pressure_mb": 442.7,
      "Altitude_m": 6667,
      "Temp_c": -23.1,
      "Dewpoint_c": -28.4,
      "Wind_Direction": 310,
      "Wind_Speed_kt": 8.5
    },
    {
      "Pressure_mb": 442.4,
      "Altitude_m": 6672,
      "Temp_c": -23.2,
      "Dewpoint_c": -28.4,
      "Wind_Direction": 310,
      "Wind_Speed_kt": 8.6
    },
    {
      "Pressure_mb": 442.1,
      "Altitude_m": 6678,
      "Temp_c": -23.2,
      "Dewpoint_c": -28.4,
      "Wind_Direction": 310,
      "Wind_Speed_kt": 8.7
    },
    {
      "Pressure_mb": 441.8,
      "Altitude_m": 6683,
      "Temp_c": -23.3,
      "Dewpoint_c": -28.5,
      "Wind_Direction": 310,
      "Wind_Speed_kt": 8.7
    },
    {
      "Pressure_mb": 441.5,
      "Altitude_m": 6687,
      "Temp_c": -23.3,
      "Dewpoint_c": -28.5,
      "Wind_Direction": 310,
      "Wind_Speed_kt": 8.8
    },
    {
      "Pressure_mb": 441.3,
      "Altitude_m": 6692,
      "Temp_c": -23.4,
      "Dewpoint_c": -28.5,
      "Wind_Direction": 309,
      "Wind_Speed_kt": 8.9
    },
    {
      "Pressure_mb": 441,
      "Altitude_m": 6696,
      "Temp_c": -23.4,
      "Dewpoint_c": -28.6,
      "Wind_Direction": 309,
      "Wind_Speed_kt": 9
    },
    {
      "Pressure_mb": 440.7,
      "Altitude_m": 6701,
      "Temp_c": -23.5,
      "Dewpoint_c": -28.6,
      "Wind_Direction": 309,
      "Wind_Speed_kt": 9
    },
    {
      "Pressure_mb": 440.4,
      "Altitude_m": 6706,
      "Temp_c": -23.5,
      "Dewpoint_c": -28.6,
      "Wind_Direction": 309,
      "Wind_Speed_kt": 9.1
    },
    {
      "Pressure_mb": 440.1,
      "Altitude_m": 6710,
      "Temp_c": -23.6,
      "Dewpoint_c": -28.7,
      "Wind_Direction": 309,
      "Wind_Speed_kt": 9.2
    },
    {
      "Pressure_mb": 439.8,
      "Altitude_m": 6716,
      "Temp_c": -23.6,
      "Dewpoint_c": -28.7,
      "Wind_Direction": 309,
      "Wind_Speed_kt": 9.2
    },
    {
      "Pressure_mb": 439.5,
      "Altitude_m": 6722,
      "Temp_c": -23.7,
      "Dewpoint_c": -28.7,
      "Wind_Direction": 309,
      "Wind_Speed_kt": 9.3
    },
    {
      "Pressure_mb": 439.1,
      "Altitude_m": 6727,
      "Temp_c": -23.7,
      "Dewpoint_c": -28.8,
      "Wind_Direction": 308,
      "Wind_Speed_kt": 9.4
    },
    {
      "Pressure_mb": 438.8,
      "Altitude_m": 6733,
      "Temp_c": -23.8,
      "Dewpoint_c": -28.8,
      "Wind_Direction": 308,
      "Wind_Speed_kt": 9.5
    },
    {
      "Pressure_mb": 438.4,
      "Altitude_m": 6738,
      "Temp_c": -23.8,
      "Dewpoint_c": -28.8,
      "Wind_Direction": 308,
      "Wind_Speed_kt": 9.5
    },
    {
      "Pressure_mb": 438.1,
      "Altitude_m": 6744,
      "Temp_c": -23.9,
      "Dewpoint_c": -28.9,
      "Wind_Direction": 308,
      "Wind_Speed_kt": 9.5
    },
    {
      "Pressure_mb": 437.7,
      "Altitude_m": 6750,
      "Temp_c": -23.9,
      "Dewpoint_c": -28.9,
      "Wind_Direction": 308,
      "Wind_Speed_kt": 9.6
    },
    {
      "Pressure_mb": 437.3,
      "Altitude_m": 6757,
      "Temp_c": -24,
      "Dewpoint_c": -28.9,
      "Wind_Direction": 308,
      "Wind_Speed_kt": 9.6
    },
    {
      "Pressure_mb": 436.9,
      "Altitude_m": 6763,
      "Temp_c": -24,
      "Dewpoint_c": -29,
      "Wind_Direction": 308,
      "Wind_Speed_kt": 9.6
    },
    {
      "Pressure_mb": 436.6,
      "Altitude_m": 6770,
      "Temp_c": -24.1,
      "Dewpoint_c": -29,
      "Wind_Direction": 308,
      "Wind_Speed_kt": 9.6
    },
    {
      "Pressure_mb": 436.2,
      "Altitude_m": 6776,
      "Temp_c": -24.1,
      "Dewpoint_c": -29,
      "Wind_Direction": 309,
      "Wind_Speed_kt": 9.6
    },
    {
      "Pressure_mb": 435.8,
      "Altitude_m": 6783,
      "Temp_c": -24.2,
      "Dewpoint_c": -29,
      "Wind_Direction": 309,
      "Wind_Speed_kt": 9.6
    },
    {
      "Pressure_mb": 435.5,
      "Altitude_m": 6789,
      "Temp_c": -24.2,
      "Dewpoint_c": -29.1,
      "Wind_Direction": 309,
      "Wind_Speed_kt": 9.7
    },
    {
      "Pressure_mb": 435.2,
      "Altitude_m": 6794,
      "Temp_c": -24.3,
      "Dewpoint_c": -29.1,
      "Wind_Direction": 309,
      "Wind_Speed_kt": 9.7
    },
    {
      "Pressure_mb": 434.9,
      "Altitude_m": 6798,
      "Temp_c": -24.3,
      "Dewpoint_c": -29.1,
      "Wind_Direction": 309,
      "Wind_Speed_kt": 9.7
    },
    {
      "Pressure_mb": 434.6,
      "Altitude_m": 6803,
      "Temp_c": -24.4,
      "Dewpoint_c": -29.1,
      "Wind_Direction": 309,
      "Wind_Speed_kt": 9.7
    },
    {
      "Pressure_mb": 434.3,
      "Altitude_m": 6808,
      "Temp_c": -24.4,
      "Dewpoint_c": -29.2,
      "Wind_Direction": 309,
      "Wind_Speed_kt": 9.7
    },
    {
      "Pressure_mb": 434,
      "Altitude_m": 6813,
      "Temp_c": -24.5,
      "Dewpoint_c": -29.2,
      "Wind_Direction": 309,
      "Wind_Speed_kt": 9.7
    },
    {
      "Pressure_mb": 433.7,
      "Altitude_m": 6817,
      "Temp_c": -24.5,
      "Dewpoint_c": -29.2,
      "Wind_Direction": 309,
      "Wind_Speed_kt": 9.8
    },
    {
      "Pressure_mb": 433.4,
      "Altitude_m": 6822,
      "Temp_c": -24.6,
      "Dewpoint_c": -29.2,
      "Wind_Direction": 309,
      "Wind_Speed_kt": 9.8
    },
    {
      "Pressure_mb": 433.2,
      "Altitude_m": 6827,
      "Temp_c": -24.6,
      "Dewpoint_c": -29.3,
      "Wind_Direction": 309,
      "Wind_Speed_kt": 9.8
    },
    {
      "Pressure_mb": 432.9,
      "Altitude_m": 6832,
      "Temp_c": -24.7,
      "Dewpoint_c": -29.3,
      "Wind_Direction": 309,
      "Wind_Speed_kt": 9.8
    },
    {
      "Pressure_mb": 432.6,
      "Altitude_m": 6837,
      "Temp_c": -24.7,
      "Dewpoint_c": -29.3,
      "Wind_Direction": 309,
      "Wind_Speed_kt": 9.8
    },
    {
      "Pressure_mb": 432.3,
      "Altitude_m": 6841,
      "Temp_c": -24.8,
      "Dewpoint_c": -29.3,
      "Wind_Direction": 309,
      "Wind_Speed_kt": 9.8
    },
    {
      "Pressure_mb": 432,
      "Altitude_m": 6846,
      "Temp_c": -24.8,
      "Dewpoint_c": -29.3,
      "Wind_Direction": 309,
      "Wind_Speed_kt": 9.9
    },
    {
      "Pressure_mb": 431.8,
      "Altitude_m": 6850,
      "Temp_c": -24.9,
      "Dewpoint_c": -29.4,
      "Wind_Direction": 309,
      "Wind_Speed_kt": 9.9
    },
    {
      "Pressure_mb": 431.5,
      "Altitude_m": 6855,
      "Temp_c": -24.9,
      "Dewpoint_c": -29.4,
      "Wind_Direction": 309,
      "Wind_Speed_kt": 9.9
    },
    {
      "Pressure_mb": 431.2,
      "Altitude_m": 6860,
      "Temp_c": -24.9,
      "Dewpoint_c": -29.4,
      "Wind_Direction": 310,
      "Wind_Speed_kt": 0
    },
    {
      "Pressure_mb": 430.9,
      "Altitude_m": 6864,
      "Temp_c": -25,
      "Dewpoint_c": -29.4,
      "Wind_Direction": 310,
      "Wind_Speed_kt": 0
    },
    {
      "Pressure_mb": 430.7,
      "Altitude_m": 6869,
      "Temp_c": -25,
      "Dewpoint_c": -29.4,
      "Wind_Direction": 310,
      "Wind_Speed_kt": 0
    },
    {
      "Pressure_mb": 430.4,
      "Altitude_m": 6874,
      "Temp_c": -25.1,
      "Dewpoint_c": -29.5,
      "Wind_Direction": 310,
      "Wind_Speed_kt": 0
    },
    {
      "Pressure_mb": 430.1,
      "Altitude_m": 6879,
      "Temp_c": -25.1,
      "Dewpoint_c": -29.5,
      "Wind_Direction": 310,
      "Wind_Speed_kt": 0.1
    },
    {
      "Pressure_mb": 429.8,
      "Altitude_m": 6884,
      "Temp_c": -25.2,
      "Dewpoint_c": -29.5,
      "Wind_Direction": 310,
      "Wind_Speed_kt": 0.1
    },
    {
      "Pressure_mb": 429.5,
      "Altitude_m": 6889,
      "Temp_c": -25.2,
      "Dewpoint_c": -29.5,
      "Wind_Direction": 310,
      "Wind_Speed_kt": 0.1
    },
    {
      "Pressure_mb": 429.2,
      "Altitude_m": 6894,
      "Temp_c": -25.3,
      "Dewpoint_c": -29.5,
      "Wind_Direction": 310,
      "Wind_Speed_kt": 0.2
    },
    {
      "Pressure_mb": 428.9,
      "Altitude_m": 6899,
      "Temp_c": -25.3,
      "Dewpoint_c": -29.5,
      "Wind_Direction": 310,
      "Wind_Speed_kt": 0.2
    },
    {
      "Pressure_mb": 428.6,
      "Altitude_m": 6904,
      "Temp_c": -25.4,
      "Dewpoint_c": -29.6,
      "Wind_Direction": 310,
      "Wind_Speed_kt": 0.2
    },
    {
      "Pressure_mb": 428.3,
      "Altitude_m": 6908,
      "Temp_c": -25.4,
      "Dewpoint_c": -29.6,
      "Wind_Direction": 310,
      "Wind_Speed_kt": 0.3
    },
    {
      "Pressure_mb": 428.1,
      "Altitude_m": 6913,
      "Temp_c": -25.5,
      "Dewpoint_c": -29.6,
      "Wind_Direction": 310,
      "Wind_Speed_kt": 0.3
    },
    {
      "Pressure_mb": 427.8,
      "Altitude_m": 6917,
      "Temp_c": -25.5,
      "Dewpoint_c": -29.6,
      "Wind_Direction": 310,
      "Wind_Speed_kt": 0.3
    },
    {
      "Pressure_mb": 427.5,
      "Altitude_m": 6921,
      "Temp_c": -25.6,
      "Dewpoint_c": -29.6,
      "Wind_Direction": 310,
      "Wind_Speed_kt": 0.3
    },
    {
      "Pressure_mb": 427.3,
      "Altitude_m": 6926,
      "Temp_c": -25.6,
      "Dewpoint_c": -29.6,
      "Wind_Direction": 310,
      "Wind_Speed_kt": 0.4
    },
    {
      "Pressure_mb": 427,
      "Altitude_m": 6931,
      "Temp_c": -25.7,
      "Dewpoint_c": -29.7,
      "Wind_Direction": 311,
      "Wind_Speed_kt": 0.4
    },
    {
      "Pressure_mb": 426.7,
      "Altitude_m": 6936,
      "Temp_c": -25.7,
      "Dewpoint_c": -29.7,
      "Wind_Direction": 311,
      "Wind_Speed_kt": 0.4
    },
    {
      "Pressure_mb": 426.3,
      "Altitude_m": 6941,
      "Temp_c": -25.8,
      "Dewpoint_c": -29.7,
      "Wind_Direction": 311,
      "Wind_Speed_kt": 0.5
    },
    {
      "Pressure_mb": 426,
      "Altitude_m": 6946,
      "Temp_c": -25.8,
      "Dewpoint_c": -29.7,
      "Wind_Direction": 311,
      "Wind_Speed_kt": 0.5
    },
    {
      "Pressure_mb": 425.7,
      "Altitude_m": 6952,
      "Temp_c": -25.8,
      "Dewpoint_c": -29.7,
      "Wind_Direction": 310,
      "Wind_Speed_kt": 0.5
    },
    {
      "Pressure_mb": 425.4,
      "Altitude_m": 6957,
      "Temp_c": -25.9,
      "Dewpoint_c": -29.7,
      "Wind_Direction": 310,
      "Wind_Speed_kt": 0.5
    },
    {
      "Pressure_mb": 425.1,
      "Altitude_m": 6963,
      "Temp_c": -25.9,
      "Dewpoint_c": -29.8,
      "Wind_Direction": 310,
      "Wind_Speed_kt": 0.5
    },
    {
      "Pressure_mb": 424.8,
      "Altitude_m": 6968,
      "Temp_c": -26,
      "Dewpoint_c": -29.8,
      "Wind_Direction": 310,
      "Wind_Speed_kt": 0.5
    },
    {
      "Pressure_mb": 424.5,
      "Altitude_m": 6974,
      "Temp_c": -26,
      "Dewpoint_c": -29.8,
      "Wind_Direction": 310,
      "Wind_Speed_kt": 0.5
    },
    {
      "Pressure_mb": 424.2,
      "Altitude_m": 6979,
      "Temp_c": -26.1,
      "Dewpoint_c": -29.8,
      "Wind_Direction": 310,
      "Wind_Speed_kt": 0.5
    },
    {
      "Pressure_mb": 423.9,
      "Altitude_m": 6984,
      "Temp_c": -26.1,
      "Dewpoint_c": -29.8,
      "Wind_Direction": 310,
      "Wind_Speed_kt": 0.5
    },
    {
      "Pressure_mb": 423.6,
      "Altitude_m": 6988,
      "Temp_c": -26.2,
      "Dewpoint_c": -29.9,
      "Wind_Direction": 309,
      "Wind_Speed_kt": 0.5
    },
    {
      "Pressure_mb": 423.4,
      "Altitude_m": 6993,
      "Temp_c": -26.2,
      "Dewpoint_c": -29.9,
      "Wind_Direction": 309,
      "Wind_Speed_kt": 0.5
    },
    {
      "Pressure_mb": 423.1,
      "Altitude_m": 6997,
      "Temp_c": -26.3,
      "Dewpoint_c": -29.9,
      "Wind_Direction": 309,
      "Wind_Speed_kt": 0.5
    },
    {
      "Pressure_mb": 422.8,
      "Altitude_m": 7002,
      "Temp_c": -26.3,
      "Dewpoint_c": -29.9,
      "Wind_Direction": 309,
      "Wind_Speed_kt": 0.5
    },
    {
      "Pressure_mb": 422.6,
      "Altitude_m": 7007,
      "Temp_c": -26.4,
      "Dewpoint_c": -29.9,
      "Wind_Direction": 309,
      "Wind_Speed_kt": 0.5
    },
    {
      "Pressure_mb": 422.3,
      "Altitude_m": 7011,
      "Temp_c": -26.4,
      "Dewpoint_c": -29.9,
      "Wind_Direction": 309,
      "Wind_Speed_kt": 0.5
    },
    {
      "Pressure_mb": 422,
      "Altitude_m": 7015,
      "Temp_c": -26.4,
      "Dewpoint_c": -30,
      "Wind_Direction": 309,
      "Wind_Speed_kt": 0.5
    },
    {
      "Pressure_mb": 421.8,
      "Altitude_m": 7020,
      "Temp_c": -26.5,
      "Dewpoint_c": -30,
      "Wind_Direction": 308,
      "Wind_Speed_kt": 0.5
    },
    {
      "Pressure_mb": 421.5,
      "Altitude_m": 7024,
      "Temp_c": -26.5,
      "Dewpoint_c": -30,
      "Wind_Direction": 308,
      "Wind_Speed_kt": 0.5
    },
    {
      "Pressure_mb": 421.3,
      "Altitude_m": 7029,
      "Temp_c": -26.6,
      "Dewpoint_c": -30,
      "Wind_Direction": 308,
      "Wind_Speed_kt": 0.5
    },
    {
      "Pressure_mb": 421,
      "Altitude_m": 7033,
      "Temp_c": -26.6,
      "Dewpoint_c": -30,
      "Wind_Direction": 308,
      "Wind_Speed_kt": 0.5
    },
    {
      "Pressure_mb": 420.7,
      "Altitude_m": 7038,
      "Temp_c": -26.7,
      "Dewpoint_c": -30,
      "Wind_Direction": 308,
      "Wind_Speed_kt": 0.5
    },
    {
      "Pressure_mb": 420.5,
      "Altitude_m": 7042,
      "Temp_c": -26.7,
      "Dewpoint_c": -30.1,
      "Wind_Direction": 308,
      "Wind_Speed_kt": 0.5
    },
    {
      "Pressure_mb": 420.2,
      "Altitude_m": 7047,
      "Temp_c": -26.8,
      "Dewpoint_c": -30.1,
      "Wind_Direction": 308,
      "Wind_Speed_kt": 0.5
    },
    {
      "Pressure_mb": 419.9,
      "Altitude_m": 7051,
      "Temp_c": -26.8,
      "Dewpoint_c": -30.1,
      "Wind_Direction": 308,
      "Wind_Speed_kt": 0.6
    },
    {
      "Pressure_mb": 419.6,
      "Altitude_m": 7056,
      "Temp_c": -26.9,
      "Dewpoint_c": -30.1,
      "Wind_Direction": 308,
      "Wind_Speed_kt": 0.6
    },
    {
      "Pressure_mb": 419.3,
      "Altitude_m": 7061,
      "Temp_c": -26.9,
      "Dewpoint_c": -30.1,
      "Wind_Direction": 308,
      "Wind_Speed_kt": 0.6
    },
    {
      "Pressure_mb": 419.1,
      "Altitude_m": 7066,
      "Temp_c": -26.9,
      "Dewpoint_c": -30.1,
      "Wind_Direction": 308,
      "Wind_Speed_kt": 0.6
    },
    {
      "Pressure_mb": 418.8,
      "Altitude_m": 7071,
      "Temp_c": -27,
      "Dewpoint_c": -30.2,
      "Wind_Direction": 308,
      "Wind_Speed_kt": 0.6
    },
    {
      "Pressure_mb": 418.5,
      "Altitude_m": 7076,
      "Temp_c": -27,
      "Dewpoint_c": -30.2,
      "Wind_Direction": 308,
      "Wind_Speed_kt": 0.6
    },
    {
      "Pressure_mb": 418.2,
      "Altitude_m": 7081,
      "Temp_c": -27.1,
      "Dewpoint_c": -30.2,
      "Wind_Direction": 308,
      "Wind_Speed_kt": 0.7
    },
    {
      "Pressure_mb": 417.9,
      "Altitude_m": 7086,
      "Temp_c": -27.1,
      "Dewpoint_c": -30.2,
      "Wind_Direction": 308,
      "Wind_Speed_kt": 0.7
    },
    {
      "Pressure_mb": 417.6,
      "Altitude_m": 7091,
      "Temp_c": -27.2,
      "Dewpoint_c": -30.2,
      "Wind_Direction": 308,
      "Wind_Speed_kt": 0.7
    },
    {
      "Pressure_mb": 417.4,
      "Altitude_m": 7096,
      "Temp_c": -27.2,
      "Dewpoint_c": -30.2,
      "Wind_Direction": 308,
      "Wind_Speed_kt": 0.7
    },
    {
      "Pressure_mb": 417.1,
      "Altitude_m": 7101,
      "Temp_c": -27.3,
      "Dewpoint_c": -30.3,
      "Wind_Direction": 308,
      "Wind_Speed_kt": 0.7
    },
    {
      "Pressure_mb": 416.8,
      "Altitude_m": 7106,
      "Temp_c": -27.3,
      "Dewpoint_c": -30.3,
      "Wind_Direction": 308,
      "Wind_Speed_kt": 0.7
    },
    {
      "Pressure_mb": 416.6,
      "Altitude_m": 7110,
      "Temp_c": -27.3,
      "Dewpoint_c": -30.3,
      "Wind_Direction": 308,
      "Wind_Speed_kt": 0.8
    },
    {
      "Pressure_mb": 416.3,
      "Altitude_m": 7115,
      "Temp_c": -27.4,
      "Dewpoint_c": -30.3,
      "Wind_Direction": 309,
      "Wind_Speed_kt": 0.8
    },
    {
      "Pressure_mb": 416.1,
      "Altitude_m": 7119,
      "Temp_c": -27.4,
      "Dewpoint_c": -30.3,
      "Wind_Direction": 309,
      "Wind_Speed_kt": 0.8
    },
    {
      "Pressure_mb": 415.8,
      "Altitude_m": 7123,
      "Temp_c": -27.5,
      "Dewpoint_c": -30.3,
      "Wind_Direction": 309,
      "Wind_Speed_kt": 0.8
    },
    {
      "Pressure_mb": 415.5,
      "Altitude_m": 7127,
      "Temp_c": -27.5,
      "Dewpoint_c": -30.4,
      "Wind_Direction": 309,
      "Wind_Speed_kt": 0.8
    },
    {
      "Pressure_mb": 415.3,
      "Altitude_m": 7131,
      "Temp_c": -27.6,
      "Dewpoint_c": -30.4,
      "Wind_Direction": 309,
      "Wind_Speed_kt": 0.9
    },
    {
      "Pressure_mb": 415,
      "Altitude_m": 7136,
      "Temp_c": -27.6,
      "Dewpoint_c": -30.4,
      "Wind_Direction": 309,
      "Wind_Speed_kt": 0.8
    },
    {
      "Pressure_mb": 414.7,
      "Altitude_m": 7141,
      "Temp_c": -27.6,
      "Dewpoint_c": -30.4,
      "Wind_Direction": 309,
      "Wind_Speed_kt": 0.8
    },
    {
      "Pressure_mb": 414.5,
      "Altitude_m": 7146,
      "Temp_c": -27.7,
      "Dewpoint_c": -30.4,
      "Wind_Direction": 309,
      "Wind_Speed_kt": 0.8
    },
    {
      "Pressure_mb": 414.2,
      "Altitude_m": 7151,
      "Temp_c": -27.7,
      "Dewpoint_c": -30.4,
      "Wind_Direction": 309,
      "Wind_Speed_kt": 0.8
    },
    {
      "Pressure_mb": 413.9,
      "Altitude_m": 7156,
      "Temp_c": -27.8,
      "Dewpoint_c": -30.4,
      "Wind_Direction": 309,
      "Wind_Speed_kt": 0.8
    },
    {
      "Pressure_mb": 413.7,
      "Altitude_m": 7160,
      "Temp_c": -27.8,
      "Dewpoint_c": -30.5,
      "Wind_Direction": 309,
      "Wind_Speed_kt": 0.7
    },
    {
      "Pressure_mb": 413.5,
      "Altitude_m": 7165,
      "Temp_c": -27.8,
      "Dewpoint_c": -30.5,
      "Wind_Direction": 309,
      "Wind_Speed_kt": 0.7
    },
    {
      "Pressure_mb": 413.2,
      "Altitude_m": 7168,
      "Temp_c": -27.9,
      "Dewpoint_c": -30.5,
      "Wind_Direction": 310,
      "Wind_Speed_kt": 0.7
    },
    {
      "Pressure_mb": 413,
      "Altitude_m": 7172,
      "Temp_c": -27.9,
      "Dewpoint_c": -30.5,
      "Wind_Direction": 310,
      "Wind_Speed_kt": 0.7
    },
    {
      "Pressure_mb": 412.8,
      "Altitude_m": 7175,
      "Temp_c": -28,
      "Dewpoint_c": -30.5,
      "Wind_Direction": 310,
      "Wind_Speed_kt": 0.7
    },
    {
      "Pressure_mb": 412.6,
      "Altitude_m": 7179,
      "Temp_c": -28,
      "Dewpoint_c": -30.5,
      "Wind_Direction": 310,
      "Wind_Speed_kt": 0.7
    },
    {
      "Pressure_mb": 412.4,
      "Altitude_m": 7182,
      "Temp_c": -28,
      "Dewpoint_c": -30.5,
      "Wind_Direction": 310,
      "Wind_Speed_kt": 0.6
    },
    {
      "Pressure_mb": 412.1,
      "Altitude_m": 7186,
      "Temp_c": -28.1,
      "Dewpoint_c": -30.5,
      "Wind_Direction": 310,
      "Wind_Speed_kt": 0.6
    },
    {
      "Pressure_mb": 411.9,
      "Altitude_m": 7190,
      "Temp_c": -28.1,
      "Dewpoint_c": -30.5,
      "Wind_Direction": 310,
      "Wind_Speed_kt": 0.6
    },
    {
      "Pressure_mb": 411.7,
      "Altitude_m": 7194,
      "Temp_c": -28.2,
      "Dewpoint_c": -30.6,
      "Wind_Direction": 310,
      "Wind_Speed_kt": 0.6
    },
    {
      "Pressure_mb": 411.5,
      "Altitude_m": 7198,
      "Temp_c": -28.2,
      "Dewpoint_c": -30.6,
      "Wind_Direction": 310,
      "Wind_Speed_kt": 0.6
    },
    {
      "Pressure_mb": 411.3,
      "Altitude_m": 7201,
      "Temp_c": -28.2,
      "Dewpoint_c": -30.6,
      "Wind_Direction": 310,
      "Wind_Speed_kt": 0.5
    },
    {
      "Pressure_mb": 411,
      "Altitude_m": 7205,
      "Temp_c": -28.3,
      "Dewpoint_c": -30.6,
      "Wind_Direction": 311,
      "Wind_Speed_kt": 0.5
    },
    {
      "Pressure_mb": 410.8,
      "Altitude_m": 7209,
      "Temp_c": -28.3,
      "Dewpoint_c": -30.6,
      "Wind_Direction": 311,
      "Wind_Speed_kt": 0.5
    },
    {
      "Pressure_mb": 410.6,
      "Altitude_m": 7213,
      "Temp_c": -28.4,
      "Dewpoint_c": -30.7,
      "Wind_Direction": 311,
      "Wind_Speed_kt": 0.5
    },
    {
      "Pressure_mb": 410.4,
      "Altitude_m": 7217,
      "Temp_c": -28.4,
      "Dewpoint_c": -30.7,
      "Wind_Direction": 311,
      "Wind_Speed_kt": 0.5
    },
    {
      "Pressure_mb": 410.1,
      "Altitude_m": 7221,
      "Temp_c": -28.4,
      "Dewpoint_c": -30.7,
      "Wind_Direction": 311,
      "Wind_Speed_kt": 0.4
    },
    {
      "Pressure_mb": 409.9,
      "Altitude_m": 7225,
      "Temp_c": -28.5,
      "Dewpoint_c": -30.7,
      "Wind_Direction": 311,
      "Wind_Speed_kt": 0.4
    },
    {
      "Pressure_mb": 409.7,
      "Altitude_m": 7229,
      "Temp_c": -28.5,
      "Dewpoint_c": -30.7,
      "Wind_Direction": 311,
      "Wind_Speed_kt": 0.3
    },
    {
      "Pressure_mb": 409.4,
      "Altitude_m": 7233,
      "Temp_c": -28.6,
      "Dewpoint_c": -30.8,
      "Wind_Direction": 311,
      "Wind_Speed_kt": 0.3
    },
    {
      "Pressure_mb": 409.2,
      "Altitude_m": 7237,
      "Temp_c": -28.6,
      "Dewpoint_c": -30.8,
      "Wind_Direction": 311,
      "Wind_Speed_kt": 0.2
    },
    {
      "Pressure_mb": 409,
      "Altitude_m": 7241,
      "Temp_c": -28.7,
      "Dewpoint_c": -30.8,
      "Wind_Direction": 311,
      "Wind_Speed_kt": 0.2
    },
    {
      "Pressure_mb": 408.7,
      "Altitude_m": 7246,
      "Temp_c": -28.7,
      "Dewpoint_c": -30.8,
      "Wind_Direction": 311,
      "Wind_Speed_kt": 0.2
    },
    {
      "Pressure_mb": 408.5,
      "Altitude_m": 7250,
      "Temp_c": -28.7,
      "Dewpoint_c": -30.9,
      "Wind_Direction": 311,
      "Wind_Speed_kt": 0.1
    },
    {
      "Pressure_mb": 408.2,
      "Altitude_m": 7254,
      "Temp_c": -28.8,
      "Dewpoint_c": -30.9,
      "Wind_Direction": 311,
      "Wind_Speed_kt": 0.1
    },
    {
      "Pressure_mb": 408,
      "Altitude_m": 7259,
      "Temp_c": -28.8,
      "Dewpoint_c": -30.9,
      "Wind_Direction": 311,
      "Wind_Speed_kt": 0
    },
    {
      "Pressure_mb": 407.7,
      "Altitude_m": 7263,
      "Temp_c": -28.9,
      "Dewpoint_c": -31,
      "Wind_Direction": 312,
      "Wind_Speed_kt": 0
    },
    {
      "Pressure_mb": 407.5,
      "Altitude_m": 7268,
      "Temp_c": -28.9,
      "Dewpoint_c": -31,
      "Wind_Direction": 312,
      "Wind_Speed_kt": 9.9
    },
    {
      "Pressure_mb": 407.2,
      "Altitude_m": 7272,
      "Temp_c": -29,
      "Dewpoint_c": -31,
      "Wind_Direction": 312,
      "Wind_Speed_kt": 9.9
    },
    {
      "Pressure_mb": 406.9,
      "Altitude_m": 7277,
      "Temp_c": -29,
      "Dewpoint_c": -31.1,
      "Wind_Direction": 312,
      "Wind_Speed_kt": 9.9
    },
    {
      "Pressure_mb": 406.6,
      "Altitude_m": 7283,
      "Temp_c": -29.1,
      "Dewpoint_c": -31.1,
      "Wind_Direction": 312,
      "Wind_Speed_kt": 9.8
    },
    {
      "Pressure_mb": 406.3,
      "Altitude_m": 7288,
      "Temp_c": -29.1,
      "Dewpoint_c": -31.1,
      "Wind_Direction": 312,
      "Wind_Speed_kt": 9.8
    },
    {
      "Pressure_mb": 406,
      "Altitude_m": 7294,
      "Temp_c": -29.2,
      "Dewpoint_c": -31.2,
      "Wind_Direction": 312,
      "Wind_Speed_kt": 9.7
    },
    {
      "Pressure_mb": 405.7,
      "Altitude_m": 7299,
      "Temp_c": -29.2,
      "Dewpoint_c": -31.2,
      "Wind_Direction": 312,
      "Wind_Speed_kt": 9.7
    },
    {
      "Pressure_mb": 405.4,
      "Altitude_m": 7305,
      "Temp_c": -29.2,
      "Dewpoint_c": -31.3,
      "Wind_Direction": 312,
      "Wind_Speed_kt": 9.7
    },
    {
      "Pressure_mb": 405.1,
      "Altitude_m": 7309,
      "Temp_c": -29.3,
      "Dewpoint_c": -31.3,
      "Wind_Direction": 312,
      "Wind_Speed_kt": 9.7
    },
    {
      "Pressure_mb": 404.8,
      "Altitude_m": 7316,
      "Temp_c": -29.3,
      "Dewpoint_c": -31.3,
      "Wind_Direction": 312,
      "Wind_Speed_kt": 9.8
    },
    {
      "Pressure_mb": 404.5,
      "Altitude_m": 7321,
      "Temp_c": -29.4,
      "Dewpoint_c": -31.4,
      "Wind_Direction": 312,
      "Wind_Speed_kt": 9.8
    },
    {
      "Pressure_mb": 404.2,
      "Altitude_m": 7326,
      "Temp_c": -29.4,
      "Dewpoint_c": -31.4,
      "Wind_Direction": 312,
      "Wind_Speed_kt": 9.9
    },
    {
      "Pressure_mb": 403.9,
      "Altitude_m": 7331,
      "Temp_c": -29.4,
      "Dewpoint_c": -31.5,
      "Wind_Direction": 312,
      "Wind_Speed_kt": 9.9
    },
    {
      "Pressure_mb": 403.6,
      "Altitude_m": 7336,
      "Temp_c": -29.5,
      "Dewpoint_c": -31.5,
      "Wind_Direction": 312,
      "Wind_Speed_kt": 0
    },
    {
      "Pressure_mb": 403.3,
      "Altitude_m": 7341,
      "Temp_c": -29.5,
      "Dewpoint_c": -31.6,
      "Wind_Direction": 312,
      "Wind_Speed_kt": 0
    },
    {
      "Pressure_mb": 403,
      "Altitude_m": 7346,
      "Temp_c": -29.5,
      "Dewpoint_c": -31.6,
      "Wind_Direction": 312,
      "Wind_Speed_kt": 0.1
    },
    {
      "Pressure_mb": 402.7,
      "Altitude_m": 7351,
      "Temp_c": -29.6,
      "Dewpoint_c": -31.7,
      "Wind_Direction": 312,
      "Wind_Speed_kt": 0.1
    },
    {
      "Pressure_mb": 402.4,
      "Altitude_m": 7357,
      "Temp_c": -29.6,
      "Dewpoint_c": -31.7,
      "Wind_Direction": 312,
      "Wind_Speed_kt": 0.2
    },
    {
      "Pressure_mb": 402.1,
      "Altitude_m": 7362,
      "Temp_c": -29.6,
      "Dewpoint_c": -31.7,
      "Wind_Direction": 312,
      "Wind_Speed_kt": 0.3
    },
    {
      "Pressure_mb": 401.8,
      "Altitude_m": 7367,
      "Temp_c": -29.7,
      "Dewpoint_c": -31.8,
      "Wind_Direction": 312,
      "Wind_Speed_kt": 0.3
    },
    {
      "Pressure_mb": 401.5,
      "Altitude_m": 7372,
      "Temp_c": -29.7,
      "Dewpoint_c": -31.8,
      "Wind_Direction": 312,
      "Wind_Speed_kt": 0.4
    },
    {
      "Pressure_mb": 401.3,
      "Altitude_m": 7377,
      "Temp_c": -29.7,
      "Dewpoint_c": -31.9,
      "Wind_Direction": 312,
      "Wind_Speed_kt": 0.4
    },
    {
      "Pressure_mb": 401,
      "Altitude_m": 7382,
      "Temp_c": -29.8,
      "Dewpoint_c": -31.9,
      "Wind_Direction": 312,
      "Wind_Speed_kt": 0.5
    },
    {
      "Pressure_mb": 400.8,
      "Altitude_m": 7386,
      "Temp_c": -29.7,
      "Dewpoint_c": -31.9,
      "Wind_Direction": 312,
      "Wind_Speed_kt": 0.5
    },
    {
      "Pressure_mb": 400.5,
      "Altitude_m": 7391,
      "Temp_c": -29.7,
      "Dewpoint_c": -31.9,
      "Wind_Direction": 312,
      "Wind_Speed_kt": 0.6
    },
    {
      "Pressure_mb": 400.2,
      "Altitude_m": 7396,
      "Temp_c": -29.7,
      "Dewpoint_c": -31.9,
      "Wind_Direction": 312,
      "Wind_Speed_kt": 0.6
    },
    {
      "Pressure_mb": 400,
      "Altitude_m": 7400,
      "Temp_c": -29.7,
      "Dewpoint_c": -31.9,
      "Wind_Direction": 312,
      "Wind_Speed_kt": 0.7
    },
    {
      "Pressure_mb": 399.7,
      "Altitude_m": 7405,
      "Temp_c": -29.7,
      "Dewpoint_c": -31.9,
      "Wind_Direction": 312,
      "Wind_Speed_kt": 0.7
    },
    {
      "Pressure_mb": 399.5,
      "Altitude_m": 7409,
      "Temp_c": -29.6,
      "Dewpoint_c": -31.9,
      "Wind_Direction": 312,
      "Wind_Speed_kt": 0.8
    },
    {
      "Pressure_mb": 399.3,
      "Altitude_m": 7413,
      "Temp_c": -29.6,
      "Dewpoint_c": -31.9,
      "Wind_Direction": 312,
      "Wind_Speed_kt": 0.9
    },
    {
      "Pressure_mb": 399,
      "Altitude_m": 7418,
      "Temp_c": -29.6,
      "Dewpoint_c": -31.8,
      "Wind_Direction": 312,
      "Wind_Speed_kt": 1
    },
    {
      "Pressure_mb": 398.8,
      "Altitude_m": 7422,
      "Temp_c": -29.6,
      "Dewpoint_c": -31.8,
      "Wind_Direction": 312,
      "Wind_Speed_kt": 1.1
    },
    {
      "Pressure_mb": 398.5,
      "Altitude_m": 7426,
      "Temp_c": -29.6,
      "Dewpoint_c": -31.8,
      "Wind_Direction": 312,
      "Wind_Speed_kt": 1.2
    },
    {
      "Pressure_mb": 398.3,
      "Altitude_m": 7430,
      "Temp_c": -29.6,
      "Dewpoint_c": -31.8,
      "Wind_Direction": 312,
      "Wind_Speed_kt": 1.3
    },
    {
      "Pressure_mb": 398.1,
      "Altitude_m": 7434,
      "Temp_c": -29.5,
      "Dewpoint_c": -31.8,
      "Wind_Direction": 312,
      "Wind_Speed_kt": 1.4
    },
    {
      "Pressure_mb": 397.9,
      "Altitude_m": 7438,
      "Temp_c": -29.5,
      "Dewpoint_c": -31.8,
      "Wind_Direction": 312,
      "Wind_Speed_kt": 1.5
    },
    {
      "Pressure_mb": 397.7,
      "Altitude_m": 7441,
      "Temp_c": -29.5,
      "Dewpoint_c": -31.8,
      "Wind_Direction": 312,
      "Wind_Speed_kt": 1.6
    },
    {
      "Pressure_mb": 397.5,
      "Altitude_m": 7445,
      "Temp_c": -29.5,
      "Dewpoint_c": -31.8,
      "Wind_Direction": 312,
      "Wind_Speed_kt": 1.7
    },
    {
      "Pressure_mb": 397.3,
      "Altitude_m": 7448,
      "Temp_c": -29.4,
      "Dewpoint_c": -31.8,
      "Wind_Direction": 312,
      "Wind_Speed_kt": 1.8
    },
    {
      "Pressure_mb": 397.1,
      "Altitude_m": 7452,
      "Temp_c": -29.4,
      "Dewpoint_c": -31.8,
      "Wind_Direction": 312,
      "Wind_Speed_kt": 1.9
    },
    {
      "Pressure_mb": 396.9,
      "Altitude_m": 7455,
      "Temp_c": -29.4,
      "Dewpoint_c": -31.8,
      "Wind_Direction": 312,
      "Wind_Speed_kt": 2
    },
    {
      "Pressure_mb": 396.7,
      "Altitude_m": 7459,
      "Temp_c": -29.3,
      "Dewpoint_c": -31.8,
      "Wind_Direction": 312,
      "Wind_Speed_kt": 2.1
    },
    {
      "Pressure_mb": 396.5,
      "Altitude_m": 7462,
      "Temp_c": -29.3,
      "Dewpoint_c": -31.8,
      "Wind_Direction": 312,
      "Wind_Speed_kt": 2.2
    },
    {
      "Pressure_mb": 396.3,
      "Altitude_m": 7466,
      "Temp_c": -29.3,
      "Dewpoint_c": -31.8,
      "Wind_Direction": 312,
      "Wind_Speed_kt": 2.3
    },
    {
      "Pressure_mb": 396.2,
      "Altitude_m": 7469,
      "Temp_c": -29.2,
      "Dewpoint_c": -31.8,
      "Wind_Direction": 312,
      "Wind_Speed_kt": 2.4
    },
    {
      "Pressure_mb": 396,
      "Altitude_m": 7472,
      "Temp_c": -29.2,
      "Dewpoint_c": -31.8,
      "Wind_Direction": 312,
      "Wind_Speed_kt": 2.5
    },
    {
      "Pressure_mb": 395.8,
      "Altitude_m": 7476,
      "Temp_c": -29.2,
      "Dewpoint_c": -31.8,
      "Wind_Direction": 312,
      "Wind_Speed_kt": 2.6
    },
    {
      "Pressure_mb": 395.6,
      "Altitude_m": 7479,
      "Temp_c": -29.1,
      "Dewpoint_c": -31.8,
      "Wind_Direction": 312,
      "Wind_Speed_kt": 2.7
    },
    {
      "Pressure_mb": 395.4,
      "Altitude_m": 7483,
      "Temp_c": -29.1,
      "Dewpoint_c": -31.8,
      "Wind_Direction": 312,
      "Wind_Speed_kt": 2.7
    },
    {
      "Pressure_mb": 395.2,
      "Altitude_m": 7486,
      "Temp_c": -29.1,
      "Dewpoint_c": -31.8,
      "Wind_Direction": 312,
      "Wind_Speed_kt": 2.7
    },
    {
      "Pressure_mb": 395,
      "Altitude_m": 7490,
      "Temp_c": -29.1,
      "Dewpoint_c": -31.9,
      "Wind_Direction": 312,
      "Wind_Speed_kt": 2.8
    },
    {
      "Pressure_mb": 394.8,
      "Altitude_m": 7494,
      "Temp_c": -29.1,
      "Dewpoint_c": -31.9,
      "Wind_Direction": 312,
      "Wind_Speed_kt": 2.8
    },
    {
      "Pressure_mb": 394.6,
      "Altitude_m": 7498,
      "Temp_c": -29.1,
      "Dewpoint_c": -31.9,
      "Wind_Direction": 312,
      "Wind_Speed_kt": 2.8
    },
    {
      "Pressure_mb": 394.4,
      "Altitude_m": 7502,
      "Temp_c": -29.1,
      "Dewpoint_c": -32,
      "Wind_Direction": 312,
      "Wind_Speed_kt": 2.8
    },
    {
      "Pressure_mb": 394.1,
      "Altitude_m": 7505,
      "Temp_c": -29.1,
      "Dewpoint_c": -32,
      "Wind_Direction": 312,
      "Wind_Speed_kt": 2.8
    },
    {
      "Pressure_mb": 393.9,
      "Altitude_m": 7509,
      "Temp_c": -29.1,
      "Dewpoint_c": -32.1,
      "Wind_Direction": 312,
      "Wind_Speed_kt": 2.8
    },
    {
      "Pressure_mb": 393.7,
      "Altitude_m": 7513,
      "Temp_c": -29.1,
      "Dewpoint_c": -32.1,
      "Wind_Direction": 312,
      "Wind_Speed_kt": 2.9
    },
    {
      "Pressure_mb": 393.5,
      "Altitude_m": 7516,
      "Temp_c": -29.1,
      "Dewpoint_c": -32.1,
      "Wind_Direction": 312,
      "Wind_Speed_kt": 2.9
    },
    {
      "Pressure_mb": 393.4,
      "Altitude_m": 7520,
      "Temp_c": -29.1,
      "Dewpoint_c": -32.2,
      "Wind_Direction": 312,
      "Wind_Speed_kt": 2.9
    },
    {
      "Pressure_mb": 393.2,
      "Altitude_m": 7523,
      "Temp_c": -29.1,
      "Dewpoint_c": -32.2,
      "Wind_Direction": 312,
      "Wind_Speed_kt": 2.9
    },
    {
      "Pressure_mb": 393,
      "Altitude_m": 7526,
      "Temp_c": -29.2,
      "Dewpoint_c": -32.3,
      "Wind_Direction": 312,
      "Wind_Speed_kt": 2.9
    },
    {
      "Pressure_mb": 392.8,
      "Altitude_m": 7530,
      "Temp_c": -29.2,
      "Dewpoint_c": -32.3,
      "Wind_Direction": 312,
      "Wind_Speed_kt": 2.9
    },
    {
      "Pressure_mb": 392.6,
      "Altitude_m": 7533,
      "Temp_c": -29.2,
      "Dewpoint_c": -32.3,
      "Wind_Direction": 311,
      "Wind_Speed_kt": 2.9
    },
    {
      "Pressure_mb": 392.4,
      "Altitude_m": 7537,
      "Temp_c": -29.2,
      "Dewpoint_c": -32.4,
      "Wind_Direction": 311,
      "Wind_Speed_kt": 3
    },
    {
      "Pressure_mb": 392.2,
      "Altitude_m": 7540,
      "Temp_c": -29.2,
      "Dewpoint_c": -32.4,
      "Wind_Direction": 311,
      "Wind_Speed_kt": 3
    },
    {
      "Pressure_mb": 392,
      "Altitude_m": 7544,
      "Temp_c": -29.2,
      "Dewpoint_c": -32.5,
      "Wind_Direction": 311,
      "Wind_Speed_kt": 3
    },
    {
      "Pressure_mb": 391.8,
      "Altitude_m": 7547,
      "Temp_c": -29.3,
      "Dewpoint_c": -32.6,
      "Wind_Direction": 311,
      "Wind_Speed_kt": 3
    },
    {
      "Pressure_mb": 391.6,
      "Altitude_m": 7551,
      "Temp_c": -29.3,
      "Dewpoint_c": -32.6,
      "Wind_Direction": 311,
      "Wind_Speed_kt": 3
    },
    {
      "Pressure_mb": 391.4,
      "Altitude_m": 7555,
      "Temp_c": -29.3,
      "Dewpoint_c": -32.7,
      "Wind_Direction": 311,
      "Wind_Speed_kt": 3
    },
    {
      "Pressure_mb": 391.2,
      "Altitude_m": 7558,
      "Temp_c": -29.3,
      "Dewpoint_c": -32.7,
      "Wind_Direction": 311,
      "Wind_Speed_kt": 3
    },
    {
      "Pressure_mb": 391,
      "Altitude_m": 7562,
      "Temp_c": -29.4,
      "Dewpoint_c": -32.8,
      "Wind_Direction": 312,
      "Wind_Speed_kt": 3
    },
    {
      "Pressure_mb": 390.8,
      "Altitude_m": 7565,
      "Temp_c": -29.4,
      "Dewpoint_c": -32.8,
      "Wind_Direction": 312,
      "Wind_Speed_kt": 3
    },
    {
      "Pressure_mb": 390.6,
      "Altitude_m": 7569,
      "Temp_c": -29.4,
      "Dewpoint_c": -32.9,
      "Wind_Direction": 312,
      "Wind_Speed_kt": 3
    },
    {
      "Pressure_mb": 390.4,
      "Altitude_m": 7573,
      "Temp_c": -29.4,
      "Dewpoint_c": -32.9,
      "Wind_Direction": 312,
      "Wind_Speed_kt": 3
    },
    {
      "Pressure_mb": 390.2,
      "Altitude_m": 7576,
      "Temp_c": -29.5,
      "Dewpoint_c": -33,
      "Wind_Direction": 312,
      "Wind_Speed_kt": 3
    },
    {
      "Pressure_mb": 390,
      "Altitude_m": 7580,
      "Temp_c": -29.5,
      "Dewpoint_c": -33,
      "Wind_Direction": 312,
      "Wind_Speed_kt": 3
    },
    {
      "Pressure_mb": 389.8,
      "Altitude_m": 7584,
      "Temp_c": -29.5,
      "Dewpoint_c": -33.1,
      "Wind_Direction": 312,
      "Wind_Speed_kt": 3
    },
    {
      "Pressure_mb": 389.6,
      "Altitude_m": 7587,
      "Temp_c": -29.5,
      "Dewpoint_c": -33.1,
      "Wind_Direction": 312,
      "Wind_Speed_kt": 3
    },
    {
      "Pressure_mb": 389.4,
      "Altitude_m": 7591,
      "Temp_c": -29.6,
      "Dewpoint_c": -33.2,
      "Wind_Direction": 312,
      "Wind_Speed_kt": 3
    },
    {
      "Pressure_mb": 389.2,
      "Altitude_m": 7595,
      "Temp_c": -29.6,
      "Dewpoint_c": -33.2,
      "Wind_Direction": 312,
      "Wind_Speed_kt": 3
    },
    {
      "Pressure_mb": 389,
      "Altitude_m": 7599,
      "Temp_c": -29.6,
      "Dewpoint_c": -33.3,
      "Wind_Direction": 312,
      "Wind_Speed_kt": 3
    }
  ],
  "soaringForecast": {
    "@context": {
      "@version": "1.1",
      "@vocab": "https://api.weather.gov/ontology#"
    },
    "@id": "https://api.weather.gov/products/e10963e1-5c34-4f05-a0fb-0a7be79910af",
    "id": "e10963e1-5c34-4f05-a0fb-0a7be79910af",
    "wmoCollectiveId": "UXUS97",
    "issuingOffice": "KSLC",
    "issuanceTime": "2026-01-31T12:31:00+00:00",
    "productCode": "SRG",
    "productName": "Soaring Guidance",
    "productText": "\n000\nUXUS97 KSLC 311231\nSRGSLC\n\nSoaring Forecast\nNational Weather Service Salt Lake City, Utah\n531 AM MST Saturday, January 31, 2026\n\nThis forecast is for Saturday, January 31, 2026:\n\nIf the trigger temperature of 60.9 F/16.0 C is reached...then\n   Thermal Soaring Index....................... Poor\n   Maximum rate of lift........................ 122 ft/min (0.6 m/s)\n   Maximum height of thermals.................. 6490 ft MSL (1565 ft AGL)\n\nForecast maximum temperature................... 52.0 F/11.6 C\nTime of trigger temperature.................... None\nTime of overdevelopment........................ None\nMiddle/high clouds during soaring window....... None\nSurface winds during soaring window............ 20 mph or less\nHeight of the -3 thermal index................. 5361 ft MSL (436 ft AGL)\nThermal soaring outlook for Sunday 02/01....... Poor\n\nWave Soaring Index............................. Not available\n\nRemarks... \n\nSunrise/Sunset.................... 07:38:32 / 17:44:05 MST\nTotal possible sunshine........... 10 hr 5 min 33 sec (605 min 33 sec)\nAltitude of sun at 12:41:18 MST... 31.22 degrees\n\nUpper air data from rawinsonde observation taken on 01/31/2026 at 0500 MST\n\nFreezing level.................. 11507 ft MSL (6582 ft AGL)\nConvective condensation level... 19764 ft MSL (14839 ft AGL)\nLifted condensation level....... 13303 ft MSL (8378 ft AGL)\nLifted index.................... +11.6\nK index......................... -15.1\n\nHeight  Temperature  Wind  Wind Spd  Lapse Rate  ConvectionT  Thermal  Lift Rate\nft MSL  deg C deg F   Dir   kt  m/s  C/km F/kft  deg C deg F   Index    fpm  m/s\n--------------------------------------------------------------------------------\n 26000  -32.4 -26.3   280   41   21   7.8   4.3   32.2  90.0    16.6      M    M\n 24000  -27.7 -17.9   280   40   20   8.5   4.6   31.0  87.7    16.0      M    M\n 22000  -22.0  -7.6   285   37   19   8.4   4.6   29.8  85.7    15.5      M    M\n 20000  -17.2   1.0   295   32   16   8.1   4.4   28.6  83.6    14.8      M    M\n 18000  -12.4   9.7   305   25   13   7.9   4.3   27.4  81.4    14.1      M    M\n 16000   -8.2  17.2   305   18    9   6.6   3.6   25.6  78.1    12.8      M    M\n 14000   -4.4  24.1   290   15    8   5.7   3.1   23.3  73.9    11.0      M    M\n 12000   -1.0  30.2   275   12    6   6.0   3.3   20.8  69.4     8.8      M    M\n 10000    2.3  36.1   245    8    4   5.4   3.0   18.1  64.6     6.4      M    M\n  9000    3.8  38.8   230    7    4   4.6   2.5   16.6  61.9     5.0      M    M\n  8000    5.0  41.0   215    7    3   3.4   1.8   14.9  58.8     3.4      M    M\n  7000    6.1  43.0   190    7    3   3.1   1.7   12.4  54.3     0.8      M    M\n  6000    7.0  44.6   175    6    3   1.2   0.7   10.5  50.8    -1.1     86  0.4\n  5000    2.8  37.0   125    5    3 -99.0 -54.3    3.3  37.9    -8.4    185  0.9\n\n * * * * * * Numerical weather prediction model forecast data valid * * * * * * \n\n           01/31/2026 at 0800 MST          |       01/31/2026 at 1100 MST        \n                                           |\nCAPE...     0.0    LI...       +7.1        | CAPE...     0.0    LI...       +7.8\nCINH...    -0.0    K Index...  +5.9        | CINH...     0.0    K Index...  +4.7\n                                           |\nHeight Temperature  Wnd WndSpd  Lapse Rate | Temperature  Wnd WndSpd  Lapse Rate\nft MSL deg C deg F  Dir kt m/s  C/km F/kft | deg C deg F  Dir kt m/s  C/km F/kft\n--------------------------------------------------------------------------------\n 26000 -32.2 -26.0  310  67 35   7.4   4.1 | -32.0 -25.6  315  69 35   7.5   4.1\n 24000 -27.8 -18.0  315  67 34   7.1   3.9 | -27.5 -17.5  320  65 34   7.2   3.9\n 22000 -23.6 -10.5  315  65 33   7.1   3.9 | -22.7  -8.9  320  60 31   7.2   4.0\n 20000 -19.2  -2.6  315  58 30   6.2   3.4 | -18.9  -2.0  320  51 26   6.2   3.4\n 18000 -15.6   3.9  315  50 26   6.1   3.4 | -15.4   4.3  320  43 22   5.3   2.9\n 16000 -12.1  10.2  310  41 21   6.4   3.5 | -11.9  10.6  315  38 20   5.9   3.2\n 14000  -8.4  16.9  310  33 17   6.4   3.5 |  -8.3  17.1  315  32 16   5.6   3.1\n 12000  -4.4  24.1  310  27 14   5.6   3.1 |  -4.6  23.7  315  25 13   6.5   3.6\n 10000  -1.1  30.0  305  19 10   5.4   3.0 |  -0.9  30.4  315  18  9   5.5   3.0\n  9000   0.3  32.5  300  13  7   4.4   2.4 |   0.6  33.1  310  12  6   4.1   2.3\n  8000   1.5  34.7  290   8  4   4.3   2.4 |   1.7  35.1  295   6  3   3.6   2.0\n  7000   2.8  37.0  255   5  2   4.4   2.4 |   3.0  37.4  260   3  2   4.9   2.7\n  6000   4.0  39.2  195   4  2   3.2   1.8 |   4.2  39.6  200   3  2   4.9   2.7\n  5000   3.6  38.5  145   5  3 -19.5 -10.7 |   7.0  44.6  160   2  1  10.0   5.5\n\n           01/31/2026 at 1400 MST          |       01/31/2026 at 1700 MST        \n                                           |\nCAPE...     0.0    LI...       +8.3        | CAPE...     0.0    LI...       +8.1\nCINH...     0.0    K Index...  +2.1        | CINH...    -0.0    K Index...  -1.7\n                                           |\nHeight Temperature  Wnd WndSpd  Lapse Rate | Temperature  Wnd WndSpd  Lapse Rate\nft MSL deg C deg F  Dir kt m/s  C/km F/kft | deg C deg F  Dir kt m/s  C/km F/kft\n--------------------------------------------------------------------------------\n 26000 -32.1 -25.8  320  65 33   8.0   4.4 | -31.8 -25.2  320  59 30   7.9   4.3\n 24000 -27.3 -17.1  320  63 33   6.7   3.7 | -27.1 -16.8  320  56 29   7.3   4.0\n 22000 -22.9  -9.2  320  56 29   6.6   3.6 | -22.7  -8.9  320  52 27   7.3   4.0\n 20000 -18.6  -1.5  315  51 26   7.2   4.0 | -18.3  -0.9  315  47 24   7.4   4.0\n 18000 -14.6   5.7  320  45 23   6.4   3.5 | -13.7   7.3  320  42 22   6.3   3.4\n 16000 -11.0  12.2  320  37 19   5.7   3.1 | -10.0  14.0  325  35 18   6.1   3.3\n 14000  -7.7  18.1  320  30 16   5.7   3.1 |  -6.5  20.3  325  28 15   5.3   2.9\n 12000  -4.4  24.1  320  23 12   5.9   3.2 |  -3.6  25.5  325  21 11   5.7   3.1\n 10000  -0.5  31.1  320  14  7   6.5   3.6 |  -0.0  32.0  315  11  6   6.8   3.7\n  9000   1.2  34.2  320   9  5   5.3   2.9 |   1.7  35.1  300   7  4   6.6   3.6\n  8000   2.6  36.7  305   4  2   4.7   2.6 |   3.4  38.1  270   4  2   2.0   1.1\n  7000   3.9  39.0  255   1  1   6.0   3.3 |   5.3  41.5  220   3  2   0.7   0.4\n  6000   5.6  42.1  225   2  1   8.3   4.6 |   6.4  43.5  225   2  1   5.6   3.1\n  5000   8.3  46.9  255   1  1  13.1   7.2 |   8.0  46.4  295   1  1   8.3   4.6\n________________________________________________________________________________\n\nThis product is issued once per day by approximately 0600 MST/0700 MDT \n(1300 UTC). This product is not continuously monitored nor updated after\nthe initial issuance. \n\nThe information contained herein is based on the 1200 UTC rawinsonde observation\nat the Salt Lake City, Utah International Airport and/or numerical weather \nprediction model data representative of the airport. These data may not be\nrepresentative of other areas along the Wasatch Front. Erroneous data such as\nthese should not be used.\n\nThe content and format of this report as well as the issuance times are subject\nto change without prior notice.\n\n042025\n"
  },
  "areaForecast": {
    "@context": {
      "@version": "1.1",
      "@vocab": "https://api.weather.gov/ontology#"
    },
    "@id": "https://api.weather.gov/products/f1b87f85-b7bf-455c-a8db-1841c268fee1",
    "id": "f1b87f85-b7bf-455c-a8db-1841c268fee1",
    "wmoCollectiveId": "FXUS65",
    "issuingOffice": "KSLC",
    "issuanceTime": "2026-01-31T20:06:00+00:00",
    "productCode": "AFD",
    "productName": "Area Forecast Discussion",
    "productText": "\n000\nFXUS65 KSLC 312006\nAFDSLC\n\nArea Forecast Discussion\nNational Weather Service Salt Lake City UT\n106 PM MST Sat Jan 31 2026\n\n.KEY MESSAGES...\n\n- A strong area of high pressure will bring dry and stable\n  conditions through the next 7 to 10 days. \n\n&&\n\n.DISCUSSION...Good news...bad news. \n\nWe'll start with the good news. A stout upper level ridge and rex\nblock will set up over the next 7 to 10 days across the West. The\ngood news is that several weak shortwave troughs will either \nflatten the ridge and push weak cold fronts through the region or \nshortwave troughs will try to undercut the ridge and keep strong \nvalley inversion from developing. Correspondingly, Utah DEQ has \nseveral monitored north basins including the Salt Lake Valley \nremaining at yellow/moderate air quality through Monday. \n\nNow the bad news...With a strong ridge in place, even with these \nshortwave troughs helping to prevent strong inversions from \ndeveloping, an analysis of various ensemble systems shows a less \nthan 5% chance of measurable precipitation across nearly the \nentire state of Utah through next Saturday. Somewhere around 50% \nof ensemble members break down the rex block and bring in at least\n0.01\" of precipitation across northern Utah Sunday into Monday\n(Feb 8-9), with around 25% showing measurable precipitation \nacross southern Utah.\n\n\n&&\n\n.AVIATION...KSLC...VFR conditions will prevail with SCT-BKN high-\nlevel clouds moving into the area this afternoon and evening. \nWinds will remain light and terrain-driven, with a gradual \ntransition to southeasterly by 03-04z.\n\n.REST OF UTAH AND SOUTHWEST WYOMING...VFR conditions will prevail\nin most areas, with light, terrain-driven winds. While the fog \nthreat has decreased, there is still a chance overnight at KLGU \n(30% chance between 11-17z) and in the early morning at KHCR (10% \nchance between 12-16z).\n\n&& \n\n&&\n\n.SLC WATCHES/WARNINGS/ADVISORIES...\nUT...None.\nWY...None.\n\n&&\n\n$$\n\nKruse/Cunningham\n\nFor more information from NOAA's National Weather Service visit...\nhttp://weather.gov/saltlakecity\n"
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
      "generatedAt": "2026-02-01T02:15:13+00:00",
      "updateTime": "2026-01-31T21:11:48+00:00",
      "validTimes": "2026-01-31T15:00:00+00:00/P7DT13H",
      "elevation": {
        "unitCode": "wmoUnit:m",
        "value": 1278.9408
      },
      "periods": [
        {
          "number": 1,
          "name": "Tonight",
          "startTime": "2026-01-31T19:00:00-07:00",
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
          "icon": "https://api.weather.gov/icons/land/night/sct?size=medium",
          "shortForecast": "Partly Cloudy",
          "detailedForecast": "Partly cloudy. Low around 31, with temperatures rising to around 33 overnight. Southeast wind around 5 mph."
        },
        {
          "number": 2,
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
          "windSpeed": "6 mph",
          "windDirection": "SSE",
          "icon": "https://api.weather.gov/icons/land/day/sct?size=medium",
          "shortForecast": "Mostly Sunny",
          "detailedForecast": "Mostly sunny. High near 54, with temperatures falling to around 51 in the afternoon. South southeast wind around 6 mph."
        },
        {
          "number": 3,
          "name": "Sunday Night",
          "startTime": "2026-02-01T18:00:00-07:00",
          "endTime": "2026-02-02T06:00:00-07:00",
          "isDaytime": false,
          "temperature": 33,
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
          "detailedForecast": "Mostly cloudy. Low around 33, with temperatures rising to around 35 overnight. South southeast wind around 3 mph."
        },
        {
          "number": 4,
          "name": "Monday",
          "startTime": "2026-02-02T06:00:00-07:00",
          "endTime": "2026-02-02T18:00:00-07:00",
          "isDaytime": true,
          "temperature": 51,
          "temperatureUnit": "F",
          "temperatureTrend": null,
          "probabilityOfPrecipitation": {
            "unitCode": "wmoUnit:percent",
            "value": 0
          },
          "windSpeed": "2 to 7 mph",
          "windDirection": "N",
          "icon": "https://api.weather.gov/icons/land/day/sct?size=medium",
          "shortForecast": "Mostly Sunny",
          "detailedForecast": "Mostly sunny, with a high near 51. North wind 2 to 7 mph."
        },
        {
          "number": 5,
          "name": "Monday Night",
          "startTime": "2026-02-02T18:00:00-07:00",
          "endTime": "2026-02-03T06:00:00-07:00",
          "isDaytime": false,
          "temperature": 30,
          "temperatureUnit": "F",
          "temperatureTrend": null,
          "probabilityOfPrecipitation": {
            "unitCode": "wmoUnit:percent",
            "value": 0
          },
          "windSpeed": "2 to 6 mph",
          "windDirection": "ENE",
          "icon": "https://api.weather.gov/icons/land/night/few?size=medium",
          "shortForecast": "Mostly Clear",
          "detailedForecast": "Mostly clear, with a low around 30. East northeast wind 2 to 6 mph."
        },
        {
          "number": 6,
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
          "windDirection": "S",
          "icon": "https://api.weather.gov/icons/land/day/few?size=medium",
          "shortForecast": "Sunny",
          "detailedForecast": "Sunny, with a high near 51."
        },
        {
          "number": 7,
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
          "windDirection": "ENE",
          "icon": "https://api.weather.gov/icons/land/night/few?size=medium",
          "shortForecast": "Mostly Clear",
          "detailedForecast": "Mostly clear, with a low around 30."
        },
        {
          "number": 8,
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
          "windSpeed": "5 mph",
          "windDirection": "NW",
          "icon": "https://api.weather.gov/icons/land/day/few?size=medium",
          "shortForecast": "Sunny",
          "detailedForecast": "Sunny, with a high near 51."
        },
        {
          "number": 9,
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
          "number": 10,
          "name": "Thursday",
          "startTime": "2026-02-05T06:00:00-07:00",
          "endTime": "2026-02-05T18:00:00-07:00",
          "isDaytime": true,
          "temperature": 53,
          "temperatureUnit": "F",
          "temperatureTrend": null,
          "probabilityOfPrecipitation": {
            "unitCode": "wmoUnit:percent",
            "value": 0
          },
          "windSpeed": "5 mph",
          "windDirection": "ESE",
          "icon": "https://api.weather.gov/icons/land/day/few?size=medium",
          "shortForecast": "Sunny",
          "detailedForecast": "Sunny, with a high near 53."
        },
        {
          "number": 11,
          "name": "Thursday Night",
          "startTime": "2026-02-05T18:00:00-07:00",
          "endTime": "2026-02-06T06:00:00-07:00",
          "isDaytime": false,
          "temperature": 34,
          "temperatureUnit": "F",
          "temperatureTrend": null,
          "probabilityOfPrecipitation": {
            "unitCode": "wmoUnit:percent",
            "value": 0
          },
          "windSpeed": "5 mph",
          "windDirection": "E",
          "icon": "https://api.weather.gov/icons/land/night/few?size=medium",
          "shortForecast": "Mostly Clear",
          "detailedForecast": "Mostly clear, with a low around 34."
        },
        {
          "number": 12,
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
          "windDirection": "SSW",
          "icon": "https://api.weather.gov/icons/land/day/sct?size=medium",
          "shortForecast": "Mostly Sunny",
          "detailedForecast": "Mostly sunny, with a high near 54."
        },
        {
          "number": 13,
          "name": "Friday Night",
          "startTime": "2026-02-06T18:00:00-07:00",
          "endTime": "2026-02-07T06:00:00-07:00",
          "isDaytime": false,
          "temperature": 35,
          "temperatureUnit": "F",
          "temperatureTrend": null,
          "probabilityOfPrecipitation": {
            "unitCode": "wmoUnit:percent",
            "value": 0
          },
          "windSpeed": "5 mph",
          "windDirection": "ENE",
          "icon": "https://api.weather.gov/icons/land/night/sct?size=medium",
          "shortForecast": "Partly Cloudy",
          "detailedForecast": "Partly cloudy, with a low around 35."
        },
        {
          "number": 14,
          "name": "Saturday",
          "startTime": "2026-02-07T06:00:00-07:00",
          "endTime": "2026-02-07T18:00:00-07:00",
          "isDaytime": true,
          "temperature": 55,
          "temperatureUnit": "F",
          "temperatureTrend": null,
          "probabilityOfPrecipitation": {
            "unitCode": "wmoUnit:percent",
            "value": 1
          },
          "windSpeed": "2 to 6 mph",
          "windDirection": "SW",
          "icon": "https://api.weather.gov/icons/land/day/sct?size=medium",
          "shortForecast": "Mostly Sunny",
          "detailedForecast": "Mostly sunny, with a high near 55."
        }
      ]
    }
  },
  "windMapScreenshotMetadata": {
    "kind": "storage#object",
    "id": "wasatch-wind-static/wind-map-save.png/1769914834862784",
    "selfLink": "https://www.googleapis.com/storage/v1/b/wasatch-wind-static/o/wind-map-save.png",
    "mediaLink": "https://storage.googleapis.com/download/storage/v1/b/wasatch-wind-static/o/wind-map-save.png?generation=1769914834862784&alt=media",
    "name": "wind-map-save.png",
    "bucket": "wasatch-wind-static",
    "generation": "1769914834862784",
    "metageneration": "2",
    "contentType": "image/png",
    "storageClass": "STANDARD",
    "size": "863273",
    "md5Hash": "cddpXBEBfTz+ttJ2DQUTUw==",
    "crc32c": "18rA2A==",
    "etag": "CMCFj8imt5IDEAI=",
    "timeCreated": "2026-02-01T03:00:34.875Z",
    "updated": "2026-02-01T03:00:34.954Z",
    "timeStorageClassUpdated": "2026-02-01T03:00:34.875Z",
    "timeFinalized": "2026-02-01T03:00:34.875Z"
  }
}