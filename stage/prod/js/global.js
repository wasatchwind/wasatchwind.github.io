// "use strict";

const ftPerMeter = 3.28084;
const now = new Date();
const nextDay = `${new Date(Date.now() + 86400000).toLocaleString("en-us", { weekday: "short" })}`;

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
    "generationtime_ms": 2.8793811798095703,
    "utc_offset_seconds": -25200,
    "timezone": "America/Denver",
    "timezone_abbreviation": "GMT-7",
    "elevation": 1288,
    "hourly_units": {
      "time": "iso8601",
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
      "geopotential_height_700hPa": "m",
      "geopotential_height_625hPa": "m"
    },
    "hourly": {
      "time": [
        "2026-01-15T20:00",
        "2026-01-15T21:00",
        "2026-01-15T22:00",
        "2026-01-15T23:00",
        "2026-01-16T00:00",
        "2026-01-16T01:00",
        "2026-01-16T02:00",
        "2026-01-16T03:00",
        "2026-01-16T04:00",
        "2026-01-16T05:00",
        "2026-01-16T06:00",
        "2026-01-16T07:00"
      ],
      "wind_speed_10m": [
        4.7,
        2.6,
        3.2,
        0.7,
        2.5,
        2.1,
        0.9,
        1.1,
        3.1,
        2.1,
        2,
        1.1
      ],
      "wind_direction_10m": [
        275,
        218,
        115,
        72,
        260,
        302,
        76,
        143,
        111,
        148,
        180,
        191
      ],
      "windspeed_875hPa": [
        2.3,
        3,
        1.4,
        1.7,
        2.3,
        2.8,
        3.3,
        2.5,
        1.1,
        0.9,
        1.2,
        0.6
      ],
      "windspeed_850hPa": [
        6.2,
        3.8,
        3.2,
        4.8,
        4.7,
        5.3,
        7,
        7.5,
        7.3,
        6.6,
        6,
        4.6
      ],
      "windspeed_825hPa": [
        6.6,
        5.7,
        5.3,
        6,
        5.8,
        6.7,
        7.9,
        7.6,
        7.6,
        7.8,
        9.1,
        8.2
      ],
      "windspeed_800hPa": [
        7.9,
        7.9,
        7.8,
        9.1,
        9.1,
        9.4,
        9.5,
        10.3,
        9.3,
        10.3,
        13.1,
        11.9
      ],
      "windspeed_775hPa": [
        10.5,
        12.2,
        13.2,
        16,
        18.5,
        17.2,
        16.2,
        16.1,
        14.5,
        14.8,
        17,
        14.1
      ],
      "windspeed_750hPa": [
        17.6,
        20.3,
        22.1,
        26.9,
        28.4,
        26.1,
        24.7,
        22.1,
        19.1,
        18.5,
        20.4,
        15.8
      ],
      "windspeed_700hPa": [
        29.7,
        32,
        34,
        37.8,
        37.5,
        34.8,
        33.2,
        30.3,
        28,
        28.1,
        28.4,
        25.4
      ],
      "windspeed_625hPa": [
        37.2,
        39.3,
        42.3,
        43.5,
        42.2,
        43.4,
        43.3,
        42.9,
        42.5,
        41.7,
        40.6,
        41.7
      ],
      "winddirection_875hPa": [
        324,
        265,
        281,
        321,
        315,
        331,
        336,
        311,
        284,
        288,
        333,
        333
      ],
      "winddirection_850hPa": [
        360,
        333,
        333,
        353,
        346,
        335,
        328,
        326,
        321,
        335,
        352,
        7
      ],
      "winddirection_825hPa": [
        350,
        332,
        333,
        349,
        348,
        347,
        347,
        347,
        339,
        353,
        11,
        30
      ],
      "winddirection_800hPa": [
        342,
        334,
        337,
        352,
        6,
        17,
        23,
        25,
        15,
        16,
        25,
        43
      ],
      "winddirection_775hPa": [
        355,
        352,
        351,
        2,
        14,
        21,
        25,
        27,
        18,
        25,
        32,
        50
      ],
      "winddirection_750hPa": [
        2,
        359,
        357,
        4,
        10,
        12,
        16,
        21,
        17,
        24,
        33,
        48
      ],
      "winddirection_700hPa": [
        359,
        359,
        357,
        359,
        4,
        4,
        9,
        12,
        8,
        9,
        18,
        22
      ],
      "winddirection_625hPa": [
        351,
        350,
        348,
        350,
        354,
        358,
        1,
        360,
        356,
        354,
        356,
        354
      ],
      "geopotential_height_875hPa": [
        1329,
        1324,
        1319,
        1331,
        1332,
        1328,
        1330,
        1330,
        1333,
        1336,
        1339,
        1342
      ],
      "geopotential_height_850hPa": [
        1565,
        1559,
        1555,
        1566,
        1567,
        1563,
        1565,
        1565,
        1568,
        1570,
        1572,
        1575
      ],
      "geopotential_height_825hPa": [
        1807,
        1801,
        1796,
        1808,
        1809,
        1805,
        1806,
        1806,
        1809,
        1810,
        1813,
        1816
      ],
      "geopotential_height_800hPa": [
        2056,
        2050,
        2045,
        2056,
        2057,
        2053,
        2055,
        2054,
        2057,
        2058,
        2060,
        2063
      ],
      "geopotential_height_775hPa": [
        2312,
        2306,
        2300,
        2311,
        2312,
        2308,
        2310,
        2309,
        2311,
        2312,
        2315,
        2317
      ],
      "geopotential_height_750hPa": [
        2575,
        2569,
        2563,
        2574,
        2575,
        2571,
        2572,
        2571,
        2573,
        2573,
        2575,
        2578
      ],
      "geopotential_height_700hPa": [
        3127,
        3121,
        3115,
        3125,
        3124,
        3119,
        3119,
        3117,
        3118,
        3118,
        3119,
        3121
      ],
      "geopotential_height_625hPa": [
        4022,
        4016,
        4010,
        4015,
        4012,
        4005,
        4003,
        4001,
        4002,
        4000,
        3998,
        3999
      ],
      "winddirection_9000": [
        340,
        340,
        340,
        340,
        340,
        340,
        350,
        350,
        350,
        350,
        350,
        350
      ],
      "windspeed_9000": [
        38,
        38,
        38,
        38,
        38,
        38,
        28,
        28,
        28,
        28,
        28,
        28
      ],
      "winddirection_12000": [
        340,
        340,
        340,
        340,
        340,
        340,
        340,
        340,
        340,
        340,
        340,
        340
      ],
      "windspeed_12000": [
        47,
        47,
        47,
        47,
        47,
        47,
        46,
        46,
        46,
        46,
        46,
        46
      ],
      "winddirection_18000": [
        340,
        340,
        340,
        340,
        340,
        340,
        340,
        340,
        340,
        340,
        340,
        340
      ],
      "windspeed_18000": [
        53,
        53,
        53,
        53,
        53,
        53,
        59,
        59,
        59,
        59,
        59,
        59
      ]
    },
    "daily_units": {
      "time": "iso8601",
      "sunset": "iso8601",
      "temperature_2m_max": "°F"
    },
    "daily": {
      "time": [
        "2026-01-15"
      ],
      "sunset": [
        "2026-01-15T17:25"
      ],
      "temperature_2m_max": [
        46
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
          "end": "2026-01-16T02:55:00Z"
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
            "7:20 PM",
            "7:25 PM",
            "7:30 PM",
            "7:35 PM",
            "7:40 PM",
            "7:45 PM",
            "7:50 PM",
            "7:54 PM",
            "7:55 PM",
            "8:00 PM",
            "8:05 PM",
            "8:10 PM",
            "8:10 PM"
          ],
          "air_temp_set_1": [
            33.8,
            35.6,
            35.6,
            33.8,
            33.8,
            33.8,
            33.8,
            33.98,
            33.8,
            33.8,
            33.8,
            33.8
          ],
          "wind_speed_set_1": [
            3.45,
            3.45,
            3.45,
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
          "wind_direction_set_1": [
            270,
            270,
            290,
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
          "altimeter_set_1": [
            30.3,
            30.3,
            30.3,
            30.3,
            30.3,
            30.3,
            30.3,
            30.31,
            30.3,
            30.3,
            30.3,
            30.3
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
          "end": "2026-01-16T02:55:00Z"
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
            "4:15 PM",
            "4:35 PM",
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
            "7:55 PM"
          ],
          "air_temp_set_1": [
            44.6,
            42.8,
            41,
            39.2,
            37.4,
            37.4,
            33.8,
            37.4,
            32,
            33.8,
            32,
            32
          ],
          "wind_speed_set_1": [
            null,
            null,
            8.06,
            3.45,
            2.3,
            6.91,
            4.6,
            2.3,
            1.15,
            2.3,
            4.6,
            2.3
          ],
          "wind_direction_set_1": [
            null,
            null,
            310,
            340,
            40,
            20,
            330,
            280,
            220,
            250,
            270,
            280,
            280
          ],
          "altimeter_set_1": [
            30.34,
            30.33,
            30.32,
            30.31,
            30.3,
            30.32,
            30.32,
            30.31,
            30.31,
            30.3,
            30.31,
            30.31
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
          "end": "2026-01-16T02:50:00Z"
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
            37.55,
            38.03,
            38.05,
            37.59,
            36.89,
            36.53,
            36.15,
            35.92,
            35.54,
            35.59,
            35.38,
            34.32
          ],
          "wind_speed_set_1": [
            4.61,
            2.52,
            5.72,
            4.93,
            0.17,
            2.81,
            2.4,
            0.68,
            3.34,
            2.47,
            2.59,
            1.58
          ],
          "wind_direction_set_1": [
            103.2,
            93,
            48.12,
            62.5,
            119.8,
            74.84,
            70.19,
            291.8,
            79.55,
            46.71,
            282.9,
            146,
            146
          ],
          "wind_gust_set_1": [
            7.46,
            7.01,
            8.99,
            12.06,
            2.4,
            5.7,
            5.48,
            3.29,
            5.91,
            6.13,
            4.38,
            3.29
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
          "end": "2026-01-16T02:00:00Z"
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
            26.3,
            26.4,
            26,
            26,
            25.8,
            26.1
          ],
          "wind_speed_set_1": [
            27.19,
            27.89,
            26.59,
            30.8,
            32.5,
            32.5
          ],
          "wind_direction_set_1": [
            330.1,
            327.9,
            323.4,
            323.8,
            317.6,
            319.6,
            319.6
          ],
          "wind_gust_set_1": [
            38.6,
            37.3,
            38.49,
            43.5,
            44.1,
            47.6
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
          "end": "2026-01-16T03:00:00Z"
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
            "8:15 PM",
            "8:15 PM"
          ],
          "air_temp_set_1": [
            30.66,
            30.29,
            30.41,
            30.17,
            29.68,
            29.43,
            28.64,
            28.39,
            28.94,
            29.07,
            30.04,
            28.52
          ],
          "wind_speed_set_1": [
            25.34,
            25.17,
            22.53,
            24.2,
            23.72,
            26.58,
            24.47,
            22.68,
            27.06,
            30.85,
            31.78,
            32.07
          ],
          "wind_direction_set_1": [
            304.1,
            302.3,
            301.7,
            305,
            299.8,
            304,
            303.7,
            303.6,
            307.9,
            309.9,
            308.6,
            305.8,
            305.8
          ],
          "wind_gust_set_1": [
            31.3,
            29.3,
            28.7,
            29.19,
            28.4,
            30.8,
            29.3,
            27.49,
            34.2,
            37,
            38.49,
            38
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
          "end": "2026-01-16T02:30:00Z"
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
            26,
            26,
            26,
            27,
            26,
            26,
            26,
            26,
            26,
            26,
            27,
            27
          ],
          "wind_speed_set_1": [
            28,
            30,
            31.99,
            30,
            32.99,
            32.99,
            36,
            38,
            33.99,
            34.99,
            39,
            39
          ],
          "wind_direction_set_1": [
            315,
            315,
            315,
            315,
            315,
            315,
            315,
            292.5,
            315,
            315,
            315,
            315,
            315
          ],
          "wind_gust_set_1": [
            41.99,
            41.99,
            39,
            40.99,
            43.99,
            43.99,
            48,
            48,
            54,
            59,
            55,
            55
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
          "end": "2026-01-16T03:00:00Z"
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
            "7:20 PM",
            "7:25 PM",
            "7:30 PM",
            "7:35 PM",
            "7:40 PM",
            "7:45 PM",
            "7:50 PM",
            "7:55 PM",
            "8:00 PM",
            "8:05 PM",
            "8:10 PM",
            "8:15 PM",
            "8:15 PM"
          ],
          "air_temp_set_1": [
            36.27,
            36.05,
            36.07,
            35.97,
            35.88,
            35.8,
            35.31,
            35.1,
            35.31,
            35.3,
            35.22,
            35.06
          ],
          "wind_speed_set_1": [
            7.35,
            5.89,
            5.65,
            6.77,
            6.95,
            5.86,
            7.41,
            9.54,
            9.53,
            9.59,
            8.77,
            9.24
          ],
          "wind_direction_set_1": [
            17.75,
            16.05,
            22.34,
            23.25,
            19.24,
            12.66,
            6.66,
            10.68,
            5.07,
            6.58,
            2.99,
            4.14,
            4.14
          ],
          "wind_gust_set_1": [
            10.08,
            7.85,
            7.19,
            7.63,
            8.24,
            7.41,
            9.11,
            11.22,
            11.58,
            11.8,
            11.83,
            12.31
          ],
          "altimeter_set_1d": [
            30.38,
            30.38,
            30.38,
            30.39,
            30.39,
            30.39,
            30.39,
            30.39,
            30.39,
            30.38,
            30.38,
            30.39
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
          "end": "2026-01-16T02:00:00Z"
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
            27.04,
            26.66,
            26.73,
            26.76,
            26.5,
            26.07,
            25.89,
            25.86,
            26.07,
            25.92,
            26.18,
            26.02
          ],
          "wind_speed_set_1": [
            9.74,
            9.91,
            9.15,
            12.45,
            12.37,
            10.18,
            10.31,
            10.84,
            11.83,
            10.18,
            11.99,
            13.8
          ],
          "wind_direction_set_1": [
            317.1,
            319.9,
            316.2,
            317.4,
            323.9,
            325.2,
            329.4,
            323.2,
            329.9,
            321,
            321,
            324.9,
            324.9
          ],
          "wind_gust_set_1": [
            15.28,
            19.38,
            15.05,
            16.17,
            17.22,
            17.43,
            17.6,
            18.85,
            18.78,
            18.33,
            19.45,
            21.61
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
          "end": "2026-01-16T03:00:00Z"
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
            "8:15 PM",
            "8:15 PM"
          ],
          "air_temp_set_1": [
            37,
            35,
            34,
            33,
            34,
            35,
            35,
            34,
            33,
            32,
            32,
            32
          ],
          "wind_speed_set_1": [
            1,
            1,
            1,
            5,
            0,
            5.99,
            4,
            2,
            2,
            2,
            2,
            1
          ],
          "wind_direction_set_1": [
            157,
            144,
            144,
            88,
            69,
            94,
            78,
            178,
            178,
            178,
            178,
            178,
            178
          ],
          "wind_gust_set_1": [
            4,
            3,
            4,
            8,
            8,
            11,
            10,
            5,
            4,
            4,
            4,
            4
          ],
          "altimeter_set_1": [
            30.19,
            30.19,
            30.21,
            30.21,
            30.21,
            30.2,
            30.19,
            30.19,
            30.19,
            30.19,
            30.19,
            30.19
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
          "end": "2026-01-16T02:10:00Z"
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
            32.19,
            31.46,
            31.94,
            31.56,
            31.92,
            32.83,
            32.9,
            32.28,
            32.27,
            31.76,
            31.31,
            31.53
          ],
          "wind_speed_set_1": [
            8.57,
            7.35,
            9.26,
            11.09,
            8.1,
            8.74,
            10.43,
            8.04,
            7.44,
            10.22,
            8.39,
            9.29
          ],
          "wind_direction_set_1": [
            329.1,
            325.1,
            326,
            331.9,
            328.7,
            322.9,
            327.6,
            323.1,
            329.7,
            324.9,
            322.1,
            315.7,
            315.7
          ],
          "wind_gust_set_1": [
            18.01,
            20.74,
            21.11,
            26.08,
            19.38,
            21.24,
            19.87,
            21.85,
            17.13,
            23.47,
            20.62,
            17.02
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
          "end": "2026-01-16T02:40:00Z"
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
            "6:10 PM",
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
            "8:00 PM"
          ],
          "air_temp_set_1": [
            36.35,
            35.63,
            35.16,
            35.67,
            36.07,
            34.94,
            34.54,
            33.59,
            32.95,
            32.61,
            33.01,
            34.25
          ],
          "wind_speed_set_1": [
            2.96,
            2.35,
            4.8,
            4.32,
            3.77,
            2.61,
            1.32,
            2.14,
            0,
            1.85,
            3.79,
            1.25
          ],
          "wind_direction_set_1": [
            75.7,
            118.7,
            108.3,
            124.1,
            95.8,
            106.6,
            146.4,
            159,
            0,
            83.4,
            113.3,
            234.9,
            234.9
          ],
          "wind_gust_set_1": [
            6.79,
            6.35,
            6.57,
            6.79,
            4.82,
            4.17,
            3.07,
            2.64,
            2.19,
            4.38,
            5.26,
            5.26
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
      "METADATA_QUERY_TIME": "4.2 ms",
      "METADATA_PARSE_TIME": "0.4 ms",
      "TOTAL_METADATA_TIME": "4.5 ms",
      "DATA_QUERY_TIME": "7.9 ms",
      "QC_QUERY_TIME": "3.8 ms",
      "DATA_PARSE_TIME": "12.3 ms",
      "TOTAL_DATA_TIME": "24.0 ms",
      "TOTAL_TIME": "28.5 ms",
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
  "windAloft6": {
    "@context": {
      "@version": "1.1",
      "@vocab": "https://api.weather.gov/ontology#"
    },
    "@id": "https://api.weather.gov/products/cc3a01ba-e9f5-4fd0-9ab5-87abb7f2b31b",
    "id": "cc3a01ba-e9f5-4fd0-9ab5-87abb7f2b31b",
    "wmoCollectiveId": "FBUS31",
    "issuingOffice": "KWNO",
    "issuanceTime": "2026-01-16T02:00:00+00:00",
    "productCode": "FD1",
    "productName": "6 Hour Winds Aloft Forecast",
    "productText": "\n000\nFBUS31 KWNO 160200\nFD1US1\nDATA BASED ON 160000Z    \nVALID 160600Z   FOR USE 0200-0900Z. TEMPS NEG ABV 24000\n\nFT  3000    6000    9000   12000   18000   24000  30000  34000  39000\nABI      2740+11 2919+05 2719-01 2945-13 2966-26 296940 287350 285252\nABQ              3427+04 3426+00 3142-14 2958-27 296942 296749 296558\nABR 3138 3343-11 3338-17 3335-22 3449-33 3555-44 335148 334645 313342\nACK 2816 2427-09 2342-12 2353-18 7029-19 6816-28 694045 706948 710249\nACY 2932 3128-13 3033-16 3024-22 2726-33 2440-38 234940 235241 235244\nAGC 2929 3027-17 3136-15 3348-18 3362-28 3359-39 315249 304947 285145\nALB 2825 3030-19 3037-19 3041-23 2831-31 2251-35 216341 215943 225346\nALS                      3332-03 3338-19 3355-32 306844 308849 298552\nAMA      0507    3417+05 3523-04 3135-18 2965-29 299742 299648 288252\nAST 0823 0318+13 0117+08 0120+02 3529-16 3429-27 342645 343255 323762\nATL 2920 3123-03 3127-05 3033-10 2951-21 2963-33 288445 780144 790045\nAVP 3029 3345-15 3142-16 3031-22 3134-32 3027-42 253642 243742 243844\nAXN 3238 3228-10 3131-15 3126-22 2917-35 2926-45 312845 302842 303041\nBAM              0315+06 0218-01 3637-14 0141-28 353945 334353 326257\nBCE                      3626+01 3432-15 3434-28 316244 316751 316557\nBDL 3022 2926-17 2733-18 2539-21 2269-28 6917-33 209841 217944 216446\nBFF      3239    3453-13 3375-17 3078-26 3178-41 319048 318847 315948\nBGR 9900 1822-09 2045-11 2154-16 7214-22 6935-27 695143 707751 711455\nBHM 2616 2921-02 2925-03 3039-07 3049-21 2970-32 298744 299644 780247\nBIH      9900    0509+06 0608+00 0421-13 3421-26 322543 332951 342657\nBIL      3245    3460-14 3368-20 3395-26 8415-37 852650 840453 349251\nBLH 3514 0209+13 0613+08 0507+03 0510-12 1706-25 060943 061252 322155\nBML 3023 2010-14 2025-19 2053-21 2188-23 6953-30 704143 700647 217849\nBNA 2422 2824-04 2825-06 3030-11 3048-23 2951-35 286747 297847 289445\nBOI      3522+07 3627+03 3531-04 3546-17 3462-29 356946 356955 335460\nBOS 3025 2432-13 2248-14 2262-18 7112-23 6940-29 695143 702147 218249\nBRL 2541 2722-04 2924-06 2830-13 2843-26 2762-38 286451 276750 275645\nBRO 1907 9900+09 3014+05 3015+01 3224-10 3023-22 284537 286447 275657\nBUF 2927 3130-16 3232-19 3231-21 3447-31 3463-40 324348 293247 283244\nCAE 3117 3216-09 3236-08 3352-11 3066-21 3071-34 298646 289345 289543\nCAR 1510 1712-07 1935-10 2042-16 2288-25 7143-30 717444 716552 721154\nCGI 2437 2630-04 2734-06 2736-11 2942-23 2949-36 286749 288447 287444\nCHS 3122 3220-08 3239-08 3155-08 2967-20 2972-33 289444 289945 780043\nCLE 2725 2922-13 3130-13 3135-17 3149-28 3156-39 316052 305049 294045\nCLL 2330 2820+09 3121+04 2927-02 2941-13 3056-26 296039 286647 275454\nCMH 2523 2820-12 3131-11 3135-16 3144-27 3153-38 315851 305749 295343\nCOU 2541 2925-03 3031-04 3036-11 2942-23 2860-36 286749 296751 297446\nCRP 2012 2715+09 2813+03 3116+00 3219-11 3132-24 294839 284448 264756\nCRW 2719 2930-14 3236-11 3242-16 3350-26 3260-37 316650 296048 296144\nCSG 2917 3123+00 2925-03 2936-08 2949-20 2970-32 289343 289844 780347\nCVG 2424 2922-08 2932-10 3033-14 3036-26 3048-38 305750 296151 297745\nCZI              3358-13 3370-19 3276-31 8301-38 830148 328549 337347\nDAL 2440 2821+10 3025+04 3030-04 2853-15 2973-28 298441 299047 287350\nDBQ 2634 2822-04 2828-08 2830-15 2742-28 2653-41 276148 276549 274943\nDEN              3317-05 2941-09 3157-22 3171-35 328049 308052 317348\nDIK      3251-12 3353-16 3353-20 3341-31 3341-43 324150 335048 344842\nDLH 3328 3325-08 3217-14 3016-21 2813-34 2628-44 281546 292543 282643\nDLN              3426-08 3431-11 3468-21 3480-33 850149 851857 347956\nDRT 2028 2416+11 2817+05 2919+01 3128-11 3030-25 284140 274950 274957\nDSM 3231 2923-02 2837-08 2847-14 2847-29 2867-42 277848 276146 285444\nECK 2721 2821-13 3023-15 3027-18 3042-28 3149-40 314652 304350 283645\nEKN      3033-17 3142-14 3350-17 3361-26 3356-38 305149 305347 285745\nELP      2916    3118+07 3120+02 3029-10 3032-25 273242 272753 264257\nELY              0220+05 0124-01 3638-14 3639-28 334145 325852 316357\nEMI 3033 3336-12 3133-16 3032-22 3030-33 3244-39 294443 274142 264643\nEVV 2429 2627-06 2723-08 2824-11 2946-24 2954-37 285950 287448 287246\nEYW 3518 3215+08 2820+08 2831+03 2541-11 2553-22 258336 268345 266552\nFAT 9900 1105+14 1310+09 1009+03 0615-12 0213-25 361642 351551 021956\nGPI      0709-04 0215-10 3652-11 3474-21 3478-32 349748 851856 358960\nFLO 3220 3221-09 3134-12 3251-14 3074-21 3076-35 298146 288844 288442\nFMN              3420+04 3427+00 3439-17 3144-30 307943 298250 296654\nFOT 0914 1116+17 0813+11 0714+04 0715-13 0215-26 332242 322652 322756\nFSD 3137 3340-10 3338-16 3145-23 2939-35 2948-42 305245 304044 304842\nFSM 2442 3028+05 2937+00 2941-07 2955-21 2957-34 298643 790046 288946\nFWA 2531 2725-09 2826-12 2929-15 2945-28 2950-39 294950 295251 285946\nGAG      3212+10 3129+03 3131-06 3143-20 3153-34 298443 299948 289449\nGCK      3025+08 3136+01 3239-08 3053-23 3171-35 297247 298648 289350\nGEG      0417+00 3627+00 3528-06 3452-19 3468-30 358146 358656 357864\nGFK 3240 3427-11 3123-17 3232-21 3438-32 3545-43 343350 332846 312642\nGGW      3359-12 3456-15 3454-20 3448-33 3459-42 358047 347648 346646\nGJT              3214+01 3428-04 3343-19 3363-32 336747 317453 308152\nGLD      3554    3626-06 3043-09 3168-24 3082-35 308449 299751 297949\nGRB 2431 2618-08 2824-11 2831-17 2733-29 2541-41 263849 275449 273444\nGRI      3344-07 3141-12 3169-17 2871-27 2984-41 298948 298647 297743\nGSP 2811 2917-08 3334-07 3343-13 3061-22 2968-35 298148 298846 299143\nGTF      3434    3453-13 3354-20 3593-24 8506-35 852450 853056 349556\nH51 1909 3509+08 3015+05 3219+00 3226-11 3126-23 294337 284147 264556\nH52 0605 3010+06 2715+06 2925+01 2736-14 2750-24 285336 285245 264253\nH61 3516 3221+05 3023+05 2835+01 2647-14 2564-24 267938 277844 275851\nHAT 3030 2729-13 2831-17 2835-22 2748-29 2757-31 266738 267140 257443\nHOU 2218 3014+08 3126+04 3030-02 2934-12 3048-26 295639 286046 265254\nHSV 2518 2822-03 2924-05 3037-08 2949-21 2963-34 297945 299145 780046\nICT 0120 3318+05 3235-02 3152-09 2955-22 2966-35 297348 298348 299749\nILM 3129 3029-11 3142-14 3249-18 3173-22 2974-34 287845 278442 278042\nIMB              0212+03 3523-02 3639-15 3346-28 354845 354955 334861\nIND 2430 2727-08 2825-10 2829-13 2942-26 2950-38 295350 286051 287145\nINK      3122+14 3022+06 3023+01 2938-11 2946-26 294641 284951 274756\nINL 3323 3223-10 3120-15 3015-21 2311-35 2108-45 351047 331645 322443\nJAN 2418 3025+03 3031-02 2935-05 2953-18 2967-30 299241 298944 278551\nJAX 3229 3133+03 3139-01 2942-04 2854-18 2879-28 279540 279545 288948\nJFK 3025 3128-15 2929-16 2827-22 2536-32 2258-36 216340 216243 225645\nJOT 2443 2528-07 2731-09 2732-14 2744-27 2747-39 275251 286351 285945\nLAS      0421+11 0315+06 0217+02 3617-12 3224-26 313243 313051 332758\nLBB      3416+13 3415+06 3121+00 3048-14 2968-27 297741 288149 296353\nLCH 2216 3116+05 3030+02 2931-02 2939-13 3054-27 296739 297245 276453\nLIT 2436 2832+04 2936-01 2942-07 2954-22 2867-33 289343 299945 288746\nLKV              0507+08 0318+00 0124-13 3630-27 363045 333553 325559\nLND              3615-11 3245-13 3356-22 3394-35 840650 337753 328354\nLOU 2424 2925-06 2930-08 3032-13 3042-24 2949-37 295949 297150 288146\nLRD 1923 2414+11 2714+06 3012+01 3317-10 3127-23 283939 285349 275457\nLSE 2727 2922-06 2925-12 2627-17 2639-29 2543-44 274547 265446 283842\nLWS 9900 0112+01 3624+00 3530-06 3551-19 3468-30 358346 358656 357462\nMBW              3420    3137-14 3275-26 3294-36 830549 318752 329150\nMCW 3234 3028-07 2928-12 2736-18 2544-29 2664-44 275946 275444 273942\nMEM 2432 2725+01 2933-05 2945-09 2948-22 2866-34 288444 299544 289345\nMGM 2913 3020+00 2926-02 3039-06 3047-20 2970-30 289242 289045 289649\nMIA 3427 3122+08 2726+08 2838+02 2650-13 2564-23 267737 267945 266553\nMKC 3225 3224+02 3130-05 3043-13 2853-25 2768-37 287949 297649 297547\nMKG 2329 2527-12 2734-12 2730-17 2841-27 2837-40 284550 295552 284344\nMLB 3427 3228+04 3032+02 2846+00 2769-14 2576-25 269439 279444 277350\nMLS      3254-10 3356-15 3357-20 3349-33 3354-43 347647 347846 346144\nMOB 2606 2921+02 2928+00 2933-04 3051-16 2960-28 297640 297644 288352\nMOT      3249-15 3349-16 3348-19 3240-30 3340-42 334251 334447 344243\nMQT 2325 2513-12 2918-13 2724-18 2628-28 2538-42 242549 273149 282544\nMRF              3020+08 3023+02 3026-10 3026-26 273441 274052 274557\nMSP 3332 3325-08 3221-14 3122-21 2636-33 2549-45 282946 283743 292941\nMSY 2309 3020+04 2927+01 3032-03 2943-13 3053-27 297039 308145 277753\nOKC 2621 3116+08 3020+01 2940-05 3043-21 2956-32 299443 790447 289148\nOMA 3349 3233-06 2941-09 2949-15 2863-28 2888-42 288046 287046 296242\nONL      3248-09 3151-15 3148-21 3062-33 2967-40 306747 305746 296943\nONT 0510 0708+13 0812+07 0914+03 1017-12 1313-25 092342 111951 020954\nORF 3026 3130-13 3131-17 3232-22 3136-33 3045-36 275038 265540 266243\nOTH 0911 0712+18 0516+09 0523+02 0225-15 0115-27 352044 322453 313959\nPDX 1033 0611+13 0216+07 0123+01 3640-15 3332-27 352545 343755 334361\nPFN 3414 3021+02 2933+00 2939-04 2949-17 2859-28 287240 288043 288351\nPHX 3006 0406+13 0409+08 0105+02 3513-11 2713-25 310942 341152 292557\nPIE 3319 3226+04 3130+02 2939-01 2758-14 2667-25 268539 278744 277250\nPIH      2708    3627-01 3438-06 3454-19 3465-31 348347 359056 336958\nPIR      3248-10 3246-17 3353-20 3453-32 3454-42 325149 325347 304244\nPLB 2822 2407-19 9900-22 3106-27 2513-30 2044-34 206141 215943 215046\nPRC              0507+07 0111+02 3222-11 2927-25 312643 302651 323158\nPSB      3236-14 3133-19 3032-22 3238-31 3467-39 314647 283944 274343\nPSX 2114 2914+09 3116+04 3020-01 3027-11 3140-25 295138 285148 254754\nPUB              3419+03 3517-05 3034-21 3157-34 305947 308450 298650\nPWM 3018 2226-12 2153-13 2164-17 7111-23 6945-28 695543 704148 219352\nRAP      3257-08 3363-15 3359-19 3349-31 3233-41 314749 326148 325445\nRBL 0907 0910+14 0815+10 0715+04 0417-13 0217-27 332942 323452 323357\nRDM      0914+08 0508+06 0116+00 3632-14 3428-28 363245 343854 335060\nRDU 3125 3326-10 3128-14 3136-20 3268-26 3172-36 297144 286943 277143\nRIC 3025 3337-12 3133-16 3130-21 3242-32 3268-37 305742 275341 275743\nRKS              3620    3343-09 3364-21 3379-34 338650 347155 328953\nRNO      1107    0922+06 0618+03 0124-13 0127-27 333243 324351 324356\nROA 3027 3037-10 3127-12 3234-17 3358-27 3268-38 307549 296946 286641\nROW      3145    3522+08 3322+02 3042-12 2956-26 296041 286251 284254\nSAC 9900 0205+14 0811+10 0815+05 0721-13 0215-26 341842 342251 352156\nSAN 3608 0409+12 0607+08 9900+03 1214-13 1413-26 112743 240849 282053\nSAT 2117 2520+10 2713+04 3014+00 3122-11 3134-25 294939 284649 274856\nSAV 3124 3222-05 3246-03 3045-07 2960-19 2972-33 780243 780243 289845\nSBA 9900 1013+13 0919+07 1020+02 1024-12 1119-25 093342 102451 081152\nSEA 0915 0811+10 0211+04 3525+00 3443-16 3442-28 353645 364155 343763\nSFO 9900 9900+14 0609+08 0817+04 0819-12 0519-26 031242 010850 031655\nSGF 2544 2935-01 3035-03 3040-09 3046-22 2956-35 296447 297749 299046\nSHV 2328 2930+07 3031+00 3032-05 2953-17 2975-29 299340 299646 278151\nSIY      1122+15 0921+10 0613+03 0121-13 0124-27 352844 323453 324457\nSLC      9900    3433+02 3441-04 3446-17 3458-31 346547 346054 327958\nSLN 3429 3432+00 3125-04 3134-12 2961-25 2971-37 298748 299749 288949\nSPI 2540 2625-06 2627-07 2833-12 2738-25 2749-38 285952 287251 285945\nSPS 2540 2723+12 2816+04 2717-04 2850-17 2976-29 299442 299947 287651\nSSM 2318 2314-14 2519-16 2722-19 2930-28 2937-40 282251 292751 282547\nSTL 2441 2828-06 2831-05 2834-11 2835-24 2849-37 286050 287150 286545\nSYR 2929 3244-16 3338-18 3235-23 3337-33 3235-41 262642 253144 242844\nT01 2111 3614+07 3123+04 3123-02 3026-12 3137-25 305238 285546 264953\nT06 2108 3216+04 3019+03 3026-01 2933-13 3036-26 295937 295744 275753\nT07 9900 2818+04 2827+02 2931-02 2943-14 2843-26 296537 286743 276752\nTCC      0412    3519+06 3416-02 3138-16 2967-28 298942 288949 287355\nTLH 3318 3123+02 2930-01 2940-05 2949-18 2869-28 287740 288444 288849\nTRI      2928-11 3237-08 3242-14 3151-24 3060-36 307149 297349 298544\nTUL 2640 2926+06 2936+00 3038-08 3051-21 3051-35 297845 299647 780247\nTUS      3108+12 3110+07 3110+04 3110-11 1907-25 990043 990053 272356\nTVC 2331 2424-13 2730-13 2725-19 2929-27 2834-41 283652 294450 283144\nTYS 2517 2923-07 3130-07 3134-13 3049-23 2958-35 297249 298146 298745\nWJF      0618+13 0920+07 0922+03 0821-12 1311-25 081942 101652 042054\nYKM 0406 0613+05 0309+01 3521-02 3546-16 3451-28 355245 365156 355164\nZUN              3619+04 3422+00 3236-13 2949-26 295342 295151 295158\n2XG 3234 2938+01 2945+01 2750-03 2758-18 2781-29 761040 761445 279748\n4J3 3513 3121+04 3030+01 2937-02 2852-15 2760-26 277338 277843 287651\n"
  },
  "windAloft12": {
    "@context": {
      "@version": "1.1",
      "@vocab": "https://api.weather.gov/ontology#"
    },
    "@id": "https://api.weather.gov/products/d1153770-de91-4246-92dc-849d0bbd3a95",
    "id": "d1153770-de91-4246-92dc-849d0bbd3a95",
    "wmoCollectiveId": "FBUS33",
    "issuingOffice": "KWNO",
    "issuanceTime": "2026-01-16T02:00:00+00:00",
    "productCode": "FD3",
    "productName": "24 Hour Winds Aloft Forecast",
    "productText": "\n000\nFBUS33 KWNO 160200\nFD3US3\nDATA BASED ON 160000Z    \nVALID 161200Z   FOR USE 0900-1800Z. TEMPS NEG ABV 24000\n\nFT  3000    6000    9000   12000   18000   24000  30000  34000  39000\nABI      2916+11 3117+04 3219-01 2844-15 2872-27 277642 277452 285856\nABQ              3425+03 3328-01 3238-16 3147-30 297244 297651 297655\nABR 3332 3243-15 3241-19 3340-21 3141-31 3236-43 333851 333046 323343\nACK 2732 2740-13 2744-15 2744-21 2743-33 2548-39 236239 236640 246642\nACY 3134 3031-13 2938-17 3148-18 3164-28 3068-38 296846 276442 266641\nAGC 2528 2827-11 2831-11 2840-15 2956-26 2858-39 276850 275250 285644\nALB 2933 3244-15 3142-18 3045-22 3048-33 3167-39 305745 274142 274743\nALS                      3242-06 3261-19 3266-32 316148 297955 308353\nAMA      0246    3215+00 2621-06 3048-19 3061-32 289145 289950 289552\nAST 1122 0413+14 0115+08 3525+03 3427-15 3424-28 021044 041555 342963\nATL 2717 2725-01 2731-04 2740-08 2750-22 2777-33 289941 770443 771048\nAVP 3027 3138-14 3141-15 3150-18 3156-29 3062-39 296048 286046 285542\nAXN 3238 3319-12 3019-18 3120-21 3237-32 3344-43 342949 322346 312542\nBAM              0118+04 3621-02 3537-14 3548-27 014545 364455 335261\nBCE                      3633-03 3340-15 3446-29 344646 335055 316858\nBDL 2930 3149-15 3145-16 2947-21 2947-33 3058-41 285142 265041 265342\nBFF      3249    3364-16 3360-22 3252-34 3263-42 327445 336745 325845\nBGR 2926 2421-17 2126-21 2040-24 2050-31 2060-34 217039 216442 225644\nBHM 2425 2628+00 2829-04 2942-08 2848-22 2881-32 780341 770544 760749\nBIH      9900    0207+05 0614+01 0518-13 0117-27 342743 343251 323556\nBIL      3245    3450-16 3458-21 3599-26 8513-36 852151 850554 359052\nBLH 0219 0215+14 0217+08 3614+03 3306-13 3011-25 321242 331851 311655\nBML 2930 3030-17 3230-21 3330-27 3123-34 2826-36 243439 234141 243943\nBNA 2433 2537-04 2547-07 2746-10 2849-23 2861-35 287845 279148 770544\nBOI      3412+06 3519+02 3524-04 3552-16 3564-28 367045 367455 366964\nBOS 2832 2938-14 2948-16 2852-22 2959-33 2754-40 244940 245640 245442\nBRL 3136 3032-07 2835-13 2651-19 2573-28 2584-42 276948 277045 276244\nBRO 2021 2008+10 2813+07 2821+02 2916-10 2727-22 286538 277648 276758\nBUF 2728 2928-15 3031-14 3038-18 2950-27 2957-40 295549 294951 275044\nCAE 2511 2821+00 2727-04 2838-09 2755-22 2770-34 279441 770142 760349\nCAR 0113 1719-08 1816-15 1925-23 1838-31 6801-34 199443 198045 206447\nCGI 2640 2633-03 2733-05 2837-12 2757-25 2776-36 279948 279248 770346\nCHS 3007 2918+01 2926-03 2841-08 2752-20 2775-32 279739 770342 760049\nCLE 2524 2524-11 2635-12 2632-16 2748-27 2760-40 276950 275150 285744\nCLL 2234 2623+10 2518+03 2524-04 2852-13 2863-26 276541 276651 276456\nCMH 2525 2626-09 2540-12 2546-14 2647-26 2762-39 277750 275550 277346\nCOU 3232 3040-05 2644-07 2651-14 2876-27 2775-41 770147 279549 289845\nCRP 2021 2513+10 2616+06 2722+00 2924-11 2837-24 275340 286849 277558\nCRW 2423 2726-07 2637-08 2639-13 2849-25 2761-38 276550 287349 268944\nCSG 2614 2823+00 2830-02 2839-06 2847-21 2782-31 780340 770644 269649\nCVG 2431 2435-08 2547-09 2644-13 2648-25 2758-38 277951 278449 266946\nCZI              3359-16 3461-22 3587-30 8525-38 850748 348949 346249\nDAL 2647 2719+10 2421+03 2528-05 2745-18 2878-28 289642 279451 277253\nDBQ 3136 3028-08 3027-14 2826-21 2540-34 2456-42 265246 275044 264343\nDEN              3334-09 3245-16 3176-25 3298-38 329149 319050 316650\nDIK      3251-16 3458-18 3460-21 3354-33 3446-43 345447 356144 344845\nDLH 3321 3219-10 2911-16 2909-22 9900-35 9900-45 331747 311644 302242\nDLN              3621-12 3545-11 3464-22 3483-32 369448 860857 358759\nDRT 2309 2922+11 2820+06 2825+00 2832-10 2836-26 285342 276852 276857\nDSM 3244 3139-10 3033-16 3035-22 3044-33 2959-39 285647 285646 294343\nECK 2517 2326-11 2623-13 2635-18 2740-28 2652-41 265451 274150 274944\nEKN      2831-10 2833-09 2837-13 2950-25 2860-38 276549 276450 278143\nELP      3419    3220+06 3125+01 3028-13 2736-26 283544 293153 293856\nELY              0127+03 3631-03 3439-14 3551-28 364545 344455 335761\nEMI 3033 3026-11 3036-12 3047-16 3059-27 2969-39 297447 286347 275841\nEVV 2546 2532-06 2738-06 2740-12 2755-25 2774-37 279249 279147 288146\nEYW 0214 3508+10 2718+08 2722+02 2539-12 2556-22 258535 268644 258054\nFAT 9900 9900+14 9900+08 0608+02 0612-13 0210-26 351942 342251 342354\nGPI      0605-05 3514-12 3544-11 3461-20 3586-30 369746 860957 850765\nFLO 2810 2922-01 2931-04 2841-10 2755-22 2763-34 279142 770242 760547\nFMN              3328+03 3331-03 3241-16 3251-31 315247 306654 307454\nFOT 1008 0916+16 0818+11 0716+03 0308-14 0513-27 031744 352352 322854\nFSD 3136 3341-12 3137-18 3137-20 3242-31 3340-43 314350 313247 304343\nFSM 2926 2822+06 2725+00 2835-08 2858-21 2862-35 780545 771247 770048\nFWA 2334 2431-09 2547-09 2640-14 2642-27 2654-40 267951 277448 276045\nGAG      3639-02 3022-03 2832-08 2956-21 2966-34 288647 289950 289951\nGCK      3537-05 3456-09 3161-13 2868-24 2981-37 299248 780651 286949\nGEG      0805+01 3417-01 3428-07 3463-16 3469-28 367545 368255 357765\nGFK 3438 3231-19 3323-17 3330-21 3229-30 3130-42 332951 332645 332843\nGGW      3460-13 3463-17 3459-23 3592-30 8524-39 851249 359250 357949\nGJT              3417-04 3237-07 3355-19 3366-32 347849 336855 328355\nGLD      3349    3361-12 3165-18 2987-26 3093-39 298545 298548 297451\nGRB 2613 2710-09 2615-13 2417-19 2433-30 2336-45 244048 263044 273742\nGRI      3246-10 3244-17 3138-20 3130-32 3127-42 294547 295446 296444\nGSP 2610 2723-01 2629-05 2733-10 2756-23 2759-36 279044 279843 770045\nGTF      3327    3535-15 3549-19 3583-24 8400-33 861949 862057 850058\nH51 1816 3507+10 3011+05 2714+01 2918-10 2832-23 275439 286948 277558\nH52 1508 2606+07 2816+05 2617+00 2822-12 2834-22 264737 265946 267755\nH61 0711 3113+08 2820+04 2726+01 2741-14 2754-23 265736 265445 256455\nHAT 3319 2931-07 3041-08 3043-11 2867-22 2776-35 279244 279942 770742\nHOU 2225 2621+09 2612+02 2720-03 2845-12 2954-26 276141 275951 266657\nHSV 2428 2634-01 2636-05 2847-09 2852-22 2856-34 289543 780345 760546\nICT 3537 3348-05 2944-06 2954-12 2870-25 2887-37 279247 780750 278950\nILM 3312 2926-05 3033-04 2840-09 2757-22 2764-34 279142 770541 770745\nIMB              3511+03 3524-01 3646-15 3545-26 364145 014355 354164\nIND 2441 2429-08 2642-08 2740-13 2750-26 2654-40 268650 268448 276544\nINK      3321+11 3121+06 3128+00 2941-13 2859-26 275543 274752 284657\nINL 3225 3117-12 2911-18 2208-22 3505-34 3621-43 011549 321346 311843\nJAN 2432 2825+04 2923-01 2834-06 2849-20 2882-29 780040 279847 268052\nJAX 3309 2917+04 2826-01 2937-04 2852-16 2770-28 278539 278443 268751\nJFK 2935 3133-13 2929-17 2936-20 3049-31 3172-38 295845 275641 266043\nJOT 2529 2626-06 2638-10 2546-16 2452-29 2665-42 256550 266946 265442\nLAS      0321+10 0420+07 0222+02 0120-14 3325-27 323843 324451 314456\nLBB      0326+10 0217+04 3214-04 2937-17 2876-28 288943 288751 287153\nLCH 2226 2713+06 3017+01 3026-03 2750-13 2961-27 287040 276750 266556\nLIT 2554 2828+06 2633-02 2739-09 2852-21 2861-34 780944 781246 760047\nLKV              0309+07 0217+01 0129-14 3532-27 022845 012755 344461\nLND              3324-11 3335-16 3586-23 8404-34 851251 840056 348152\nLOU 2433 2535-07 2551-08 2744-12 2751-24 2763-37 278050 279049 277144\nLRD 1928 2513+12 2818+07 2826+01 2917-10 2732-24 275240 277049 277858\nLSE 3332 3333-09 3227-15 3118-22 2611-34 2421-45 263345 283342 272942\nLWS 9900 0707+01 3514-01 3427-06 3563-16 3470-28 357645 017955 358265\nMBW              3249    3161-20 3391-28 8414-38 840148 339250 337149\nMCW 3140 3137-10 3129-16 3125-23 3228-36 3238-43 294346 284244 292743\nMEM 2539 2824+02 2738-04 2850-10 2850-22 2863-34 780144 770545 279746\nMGM 2417 2822+01 2927-02 2837-06 2851-19 2883-30 780140 770345 269050\nMIA 0312 3211+09 2721+06 2728+01 2649-12 2563-23 256836 256545 258053\nMKC 3245 3137-07 2943-11 2849-16 2770-27 2785-41 289847 288447 278847\nMKG 2326 2332-09 2526-10 2427-16 2645-29 2759-43 255350 264946 264844\nMLB 0312 3116+07 2927+02 2736-01 2653-14 2663-25 267037 267444 256951\nMLS      3251-13 3460-17 3461-23 3470-32 8516-39 850448 358948 356246\nMOB 2321 3013+03 3023+00 2832-03 2760-14 2870-28 288339 277947 258053\nMOT      3351-21 3447-18 3448-22 3349-32 3446-43 344248 345044 344044\nMQT 2809 2815-09 2714-14 2615-20 2533-31 2344-45 242848 231546 282243\nMRF              3123+07 2925+01 2833-11 2734-26 274643 275653 275856\nMSP 3231 3122-11 3121-17 2919-23 3227-35 3438-44 332947 302444 292541\nMSY 2325 2708+04 3121+00 2829-03 2750-13 2862-27 277339 276848 257255\nOKC 0252 3517+04 2820+00 2728-07 2852-19 2956-34 289946 770949 780150\nOMA 3141 3241-11 3138-16 3244-19 3140-31 2947-41 294649 285347 296144\nONL      3250-11 3244-16 3341-21 3133-31 3234-43 303550 303847 305143\nONT 0321 0614+14 0614+08 0711+03 1005-13 0506-25 070942 030851 291255\nORF 3327 2933-09 3044-09 3048-13 2961-25 2869-36 278145 278345 278445\nOTH 0811 0511+17 0514+09 0524+03 0525-15 0116-27 361844 352454 323660\nPDX 1032 0706+12 0215+08 3624+02 3534-15 3429-28 012044 032555 353463\nPFN 2510 2821+03 2827+01 2832-03 2860-14 2867-28 288238 278145 258153\nPHX 9900 0208+12 3614+07 3516+02 3218-12 2930-26 302843 313252 313155\nPIE 3309 3019+07 2927+03 2732-02 2746-14 2752-25 276137 276544 256753\nPIH      0413    3527-06 3540-07 3454-20 3471-31 358147 368556 347761\nPIR      3250-13 3347-19 3249-21 3242-32 3134-43 323750 334046 333943\nPLB 2928 3126-15 3225-18 3335-24 3349-35 3248-42 293742 273042 273743\nPRC              0108+06 0217+02 3325-14 3038-26 314643 304651 314657\nPSB      3131-12 3035-12 3041-17 3058-28 2958-40 296748 295950 285942\nPSX 2022 2616+10 2515+03 2720-01 2835-11 2843-25 275641 275850 276657\nPUB              2918-08 3245-10 3267-22 3073-34 317848 298852 307651\nPWM 2828 2924-19 2930-23 2734-27 2637-30 2542-36 235139 235240 235042\nRAP      3263-11 3360-17 3457-21 3340-33 3331-44 345446 346146 335545\nRBL 0508 0913+14 0817+10 0613+03 0812-13 0617-27 022843 363252 333555\nRDM      1114+08 9900+07 0120+01 0135-15 3532-26 022545 022555 343763\nRDU 3121 2927-06 3033-07 2936-13 2852-23 2864-35 278246 279144 771243\nRIC 3126 2926-08 2937-09 3043-14 2956-26 2967-37 287646 277645 278043\nRKS              3117    3242-11 3476-22 3490-34 850851 359656 338055\nRNO      0807    0821+06 0714+01 0318-13 0326-27 022545 363453 334656\nROA 2819 2826-04 2827-07 2731-13 2847-25 2862-37 287349 278047 279942\nROW      0125    3615+05 3318-01 3137-16 2864-27 287043 286952 296054\nSAC 0407 0905+14 0910+09 0715+04 0414-13 0416-27 012242 352651 332754\nSAN 0406 0510+13 0407+08 9900+03 9900-13 0508-26 111042 293049 293254\nSAT 2126 2417+10 2620+06 2724+00 2832-11 2840-25 275341 276650 277158\nSAV 2906 2918+03 2825-02 2939-06 2749-20 2782-30 770039 279842 269750\nSBA 0905 0912+13 1017+07 1113+02 1114-13 0816-25 102042 081450 260854\nSEA 0912 0408+09 3513+04 3528+01 3440-15 3436-27 363444 013255 353664\nSFO 3506 9900+14 1007+08 0814+03 0819-13 0515-26 021842 361250 351653\nSGF 3533 3028-02 2637-04 2852-11 2967-26 2791-36 770448 289549 770748\nSHV 2548 2724+08 2820+01 2827-06 2848-19 2879-29 780142 289849 267351\nSIY      1020+15 0817+09 0512+01 0207-13 0311-27 012344 363453 334158\nSLC      9900    3524-02 3440-05 3451-19 3459-31 367347 358057 337659\nSLN 3336 3348-07 3132-12 3153-16 2884-27 2899-39 289746 780148 278047\nSPI 2827 2730-04 2639-08 2648-16 2663-27 2772-41 268948 268648 288145\nSPS 0341 3610+11 3009+03 2913-05 2838-18 2879-29 780243 780150 278552\nSSM 1925 2126-15 2320-13 2620-18 2625-29 2524-44 243249 241849 272644\nSTL 3130 2838-03 2640-06 2646-14 2766-27 2766-40 760248 279149 289346\nSYR 2932 3136-15 3139-17 3146-20 3156-31 3059-39 305249 284948 284043\nT01 2118 2608+07 3014+03 2919-02 2836-12 2945-25 275940 275750 266857\nT06 2115 9900+06 3015+03 2922-02 2737-12 2947-26 285739 266149 266956\nT07 1809 2912+05 2818+03 2822-03 2739-12 2848-26 276138 266347 256656\nTCC      0442    3608+00 2718-05 3146-18 3061-31 298545 289351 299153\nTLH 3008 2820+02 2828+00 2832-03 2857-16 2872-28 288838 288444 268351\nTRI      2725-05 2635-07 2635-11 2743-24 2757-36 287048 279145 760244\nTUL 0141 3318+01 2729-02 2741-08 2861-22 2873-35 279947 770448 770649\nTUS      0109+12 3611+07 3315+02 3213-12 3023-26 301643 311852 322355\nTVC 2225 2425-10 2622-11 2621-17 2631-29 2539-44 244551 263346 274443\nTYS 2521 2627-05 2637-06 2640-11 2752-23 2753-36 287646 279646 770443\nWJF      0525+12 0623+07 0715+02 0906-12 0405-25 040842 021151 350655\nYKM 0508 0510+05 3513+02 3527-01 3546-15 3446-26 364945 364555 364265\nZUN              3417+03 3525-01 3336-15 3048-28 306343 296651 306456\n2XG 3611 3020+02 3029+00 2740-03 2751-17 2673-27 278439 269442 268150\n4J3 9900 2820+05 2828+02 2832-03 2843-13 2849-26 276537 276445 256554\n"
  },
  "windAloft24": {
    "@context": {
      "@version": "1.1",
      "@vocab": "https://api.weather.gov/ontology#"
    },
    "@id": "https://api.weather.gov/products/5120cae6-99a6-48c1-b5f8-98a854c49e74",
    "id": "5120cae6-99a6-48c1-b5f8-98a854c49e74",
    "wmoCollectiveId": "FBUS35",
    "issuingOffice": "KWNO",
    "issuanceTime": "2026-01-16T02:00:00+00:00",
    "productCode": "FD5",
    "productName": "Winds Aloft Forecast",
    "productText": "\n000\nFBUS35 KWNO 160200\nFD5US5\nDATA BASED ON 160000Z    \nVALID 170000Z   FOR USE 1800-0600Z. TEMPS NEG ABV 24000\n\nFT  3000    6000    9000   12000   18000   24000  30000  34000  39000\nABI      0219-02 3021-01 2937-05 2852-17 2863-31 278645 279152 279554\nABQ              3221+02 3331-04 3144-18 3247-31 317147 317055 307558\nABR 3327 3338-26 3435-27 3534-26 3532-32 3532-43 343145 343344 343342\nACK 2916 2734-07 2642-10 2557-14 2672-26 2679-39 269848 761446 761743\nACY 2323 2638-06 2644-08 2650-11 2765-24 2781-37 269949 752047 752146\nAGC 2234 2548-05 2554-09 2570-14 2587-25 2594-39 760850 750350 249547\nALB 2316 2527-10 2527-12 2536-15 2649-28 2664-42 267251 259348 259345\nALS                      3335-10 3358-22 3364-34 317650 327858 308157\nAMA      3621    3226-09 3044-10 3072-22 3078-34 299249 308454 298253\nAST 0922 0616+13 0415+07 0216+01 3515-13 0205-25 050543 090954 031664\nATL 2031 2530+03 2433-02 2439-06 2656-20 2692-28 760144 259852 259755\nAVP 2022 2540-08 2535-09 2650-13 2656-26 2776-41 268949 751049 750446\nAXN 3232 3426-24 3405-21 9900-23 3209-33 3109-43 331349 321745 322543\nBAM              3612+02 3525-02 3634-13 3643-26 015144 025955 365764\nBCE                      3529-04 3537-15 3456-28 355745 357154 356161\nBDL 2518 2631-09 2632-11 2641-14 2753-27 2663-41 258648 760648 750644\nBFF      3348    3354-19 3464-27 3470-33 3488-40 348647 347248 336447\nBGR 3225 3132-12 2938-14 2846-20 2868-28 2771-42 265848 266745 257943\nBHM 2041 2442+04 2544-03 2551-07 2555-20 2692-28 760444 259851 259355\nBIH      9900    3606+05 0213+01 0117-13 0230-26 012644 362453 323857\nBIL      3237    3449-14 3458-20 3579-27 8603-36 861849 862053 368953\nBLH 3616 0411+13 0314+07 3612+02 3522-13 3525-26 313342 304650 315554\nBML 3023 3029-11 2834-13 2739-19 2756-29 2754-43 265950 256947 257345\nBNA 2232 2442-04 2462-06 2478-10 2575-23 2586-35 752345 752351 751150\nBOI      1406-01 3517-01 3526-06 3647-14 3559-27 366444 017655 017966\nBOS 3018 2628-08 2633-11 2641-16 2655-27 2668-40 259050 760347 760144\nBRL 2926 2924-13 2724-20 2629-22 2622-32 2621-43 254147 255045 265144\nBRO 2123 2812+13 3024+08 2926+02 2839-10 2747-24 256638 267348 267056\nBUF 2140 2433-10 2441-12 2348-17 2366-29 2484-41 258251 257748 257545\nCAE 2423 2527+03 2527-01 2533-07 2558-19 2690-28 760043 750252 259555\nCAR 3236 3138-15 3047-18 2951-23 2959-31 2867-41 276149 265846 256341\nCGI 2720 2620-08 2544-12 2667-16 2588-25 2499-37 751747 750349 269348\nCHS 2313 2518+03 2523+00 2534-05 2663-16 2680-27 259142 750051 259855\nCLE 2343 2642-07 2643-14 2655-20 2597-27 7522-39 750649 258448 248146\nCLL 3615 2215+04 2632+02 2932-03 2750-15 2764-27 267244 268050 279056\nCMH 2338 2539-07 2545-12 2564-16 2593-25 7507-39 751851 750649 258047\nCOU 2927 3029-11 2925-19 2834-23 2736-33 2653-41 257244 266444 255945\nCRP 2211 2812+10 2918+06 2928+00 2846-12 2759-25 267740 268648 269357\nCRW 2238 2448-06 2562-06 2561-11 2572-24 2588-37 761049 751350 751049\nCSG 2131 2524+03 2427-02 2434-05 2665-15 2685-27 269644 750152 750155\nCVG 2528 2536-07 2642-11 2558-14 2596-24 2494-38 751351 750951 258847\nCZI              3356-16 3464-23 3589-28 8501-39 850149 369251 346551\nDAL 3515 3441-03 2725-02 2849-07 2861-18 2773-31 760145 760652 760053\nDBQ 3026 2627-15 2625-18 2725-21 2634-31 2627-43 263051 263347 263943\nDEN              3333-11 3247-19 3486-27 3384-36 339751 338353 327151\nDIK      3347-21 3457-23 3554-26 3543-34 3547-42 367345 356747 355845\nDLH 3326 9900-13 3305-19 1408-23 1211-35 3112-44 321349 310847 301644\nDLN              3418-10 3438-13 3682-18 3693-31 861246 862756 861362\nDRT 0221 3115+07 2924+05 3022+00 2839-14 2847-27 277342 279149 279556\nDSM 3127 3032-17 3029-19 2927-23 2728-32 2625-43 272548 273444 273743\nECK 2334 2530-11 2534-15 2534-22 2540-35 2566-39 246347 245946 254644\nEKN      2451-04 2653-07 2562-11 2679-24 2694-38 760748 751149 751048\nELP      9900    3417+04 3224-01 3037-15 2944-28 296243 286952 297755\nELY              3614+00 3526-03 3643-13 3651-28 016245 366454 356063\nEMI 2135 2538-05 2642-06 2651-11 2763-25 2787-38 760049 751748 752347\nEVV 2621 2622-08 2637-12 2561-15 2483-25 2492-38 751848 750650 259548\nEYW 1017 1312+11 2014+10 2220+03 2533-10 2657-17 255735 246546 237258\nFAT 9900 9900+14 9900+08 0306+02 0219-13 0521-26 041243 311751 313755\nGPI      9900-05 3522-08 3643-12 3673-16 3682-30 369645 369954 860365\nFLO 2521 2525+03 2628-01 2535-07 2558-20 2691-28 760342 750351 259755\nFMN              3423+01 3333-05 3241-19 3253-31 326848 337055 316959\nFOT 9900 0913+16 0916+09 0820+04 0613-13 0911-27 111544 071252 332655\nFSD 3328 3235-22 3239-25 3136-23 2935-32 2932-43 322749 322844 312642\nFSM 3018 3130-08 3038-13 2767-14 2694-23 7606-34 761347 269849 760350\nFWA 2532 2728-09 2729-14 2742-18 2560-30 7512-40 750049 258248 257145\nGAG      3336-05 3240-14 3267-20 3092-25 8001-35 309448 298151 297749\nGCK      3344-07 3247-16 3257-24 3181-31 3193-38 318947 307748 306547\nGEG      0307+00 0117-02 0235-05 3644-15 3556-27 365944 366854 366765\nGFK 3437 3629-24 0319-22 0319-23 0217-33 0416-44 011648 352646 342843\nGGW      3450-17 3562-19 3570-23 3595-29 8616-38 861447 860950 368150\nGJT              3613-07 3438-10 3354-20 3470-32 337449 358655 336557\nGLD      3347    3350-18 3353-26 3270-34 3384-40 328045 316846 325746\nGRB 3122 3318-11 3012-16 2811-23 2315-35 2730-44 283149 262546 262943\nGRI      3242-14 3247-21 3245-25 3132-35 3227-45 313646 314343 314143\nGSP 2125 2539+01 2541-02 2639-07 2555-22 2690-30 761143 750651 259554\nGTF      3322    3438-13 3545-16 3690-21 8606-32 863146 514056 861760\nH51 1916 2215+11 2720+07 2926+01 2741-10 2751-23 257138 267748 267656\nH52 1712 2111+06 2319+06 2524+01 2426-10 2751-21 257537 257448 257157\nH61 1009 1613+08 2118+07 2228+02 2522-10 2647-21 267636 258347 249257\nHAT 2323 2530+02 2536-03 2642-07 2648-20 2774-31 761341 751050 259851\nHOU 2216 2627+08 2524+02 2730-03 2751-13 2663-26 268142 760749 760857\nHSV 2043 2452+02 2455-04 2461-08 2562-21 2686-31 761844 751452 750252\nICT 3227 3231-09 3239-18 3136-23 2940-34 2964-40 287544 287344 295445\nILM 2423 2624+03 2629-01 2635-07 2654-19 2687-29 760442 750451 259955\nIMB              0116+03 0128-01 3634-12 3538-25 013844 014054 364565\nIND 2527 2525-09 2529-14 2538-18 2589-26 2499-40 750650 259349 258247\nINK      0807+02 2918+01 3124-02 2941-16 2953-29 287344 287952 288656\nINL 3326 0208-14 0707-19 1410-22 1319-34 0916-45 041450 011048 331544\nJAN 2131 2544+03 2441-02 2451-07 2658-18 2690-27 259945 259751 269554\nJAX 2606 2216+05 2528+03 2533-02 2653-12 2659-26 258240 259849 750956\nJFK 2517 2636-08 2640-10 2655-12 2765-26 2772-40 269548 751547 751746\nJOT 2726 2823-12 2625-17 2630-19 2527-31 2532-43 254949 255748 255743\nLAS      0218+09 0216+05 0123+01 3423-13 3536-27 354344 354153 324459\nLBB      0310+00 3119-04 3034-06 2954-19 2964-32 299247 298753 287753\nLCH 2223 2527+08 2529+01 2633-05 2653-13 2568-27 268043 760949 760956\nLIT 3017 2919-05 2740-06 2455-10 2678-22 2696-34 752446 752351 760549\nLKV              0213+06 0119+01 0126-13 0129-26 032444 043355 013864\nLND              3214-11 3434-17 3572-25 3474-34 359850 861054 357954\nLOU 2429 2525-06 2538-10 2559-13 2485-23 2488-37 751849 751051 259248\nLRD 3406 3410+11 3022+06 2930+01 2843-12 2755-25 267640 268047 268557\nLSE 3129 2908-14 9900-19 2510-22 2621-31 2724-43 282551 262346 272843\nLWS 9900 0206+01 0113-02 0128-06 0149-15 3558-27 366544 367354 017565\nMBW              3242    3356-22 3485-27 3492-37 349651 358953 347052\nMCW 3127 3129-22 2923-17 2922-22 2725-32 2623-43 282350 282445 283143\nMEM 2623 2428-03 2539-06 2472-09 2574-22 2592-34 752745 752551 750949\nMGM 2134 2524+04 2528-02 2438-05 2665-15 2682-27 259444 750452 750155\nMIA 0813 1309+11 2319+09 2324+03 2536-12 2649-19 267136 257646 248558\nMKC 3027 3133-12 3031-20 2935-23 2932-33 2834-44 274744 275343 274743\nMKG 2729 2831-09 2831-15 2730-21 2729-35 2756-43 265048 254547 264144\nMLB 1208 2309+08 2420+05 2432+02 2527-11 2645-23 267937 269446 740757\nMLS      3244-13 3465-20 3465-24 3587-31 8517-39 860548 860050 357348\nMOB 2023 2225+05 2526+00 2537-04 2563-13 2567-26 258343 750850 761056\nMOT      3539-26 3546-23 3640-24 3530-33 3638-43 365347 365646 355044\nMQT 3114 3216-13 3317-15 3217-21 2909-34 9900-47 281149 271146 262044\nMRF              2925+04 3023+00 2935-15 2848-27 285743 286250 287155\nMSP 3231 3210-18 1706-19 9900-23 2712-32 2616-43 291551 291645 302342\nMSY 2122 2224+05 2525+02 2535-04 2559-12 2564-27 258142 760849 761357\nOKC 3326 3229-07 3245-13 3066-15 2884-23 2896-36 780649 279451 268949\nOMA 3324 3132-15 3147-23 3135-24 2931-33 2925-44 292847 293543 283743\nONL      3246-17 3252-24 3254-24 3136-34 3235-44 333448 324144 324243\nONT 0322 0714+14 0612+08 0309+03 0414-13 0317-26 302142 293250 313953\nORF 2431 2532-01 2638-05 2645-09 2654-22 2668-35 761343 752349 750049\nOTH 0908 0410+16 0312+10 0118+03 0113-14 0407-27 101244 102154 351959\nPDX 1030 0711+12 0515+07 0219+01 3521-13 3616-25 011343 031854 022765\nPFN 2025 2316+03 2427+02 2435-02 2555-12 2659-26 258341 760249 751357\nPHX 3506 0312+12 0111+06 3413+00 3330-14 3335-27 324543 314751 307256\nPIE 1107 2011+07 2323+05 2333+01 2526-11 2647-23 268437 259046 740057\nPIH      0309    3624-07 3433-11 3674-18 3580-30 369646 861256 369962\nPIR      3346-19 3357-26 3359-26 3350-33 3454-44 344647 344544 344643\nPLB 2611 2718-12 2628-13 2733-20 2756-29 2768-43 265653 256448 256245\nPRC              0211+05 3513-01 3328-13 3440-27 344744 334352 315758\nPSB      2445-06 2446-08 2561-13 2575-26 2686-40 269850 750650 750146\nPSX 2121 2618+09 2719+04 2824-02 2748-13 2760-25 268340 269548 760357\nPUB              3321-08 3132-14 3274-26 3273-36 328652 338154 317053\nPWM 3121 2925-09 2735-13 2741-19 2764-28 2680-42 267950 268546 268544\nRAP      3358-14 3368-23 3468-26 3460-33 3563-41 357546 356647 345746\nRBL 0309 0806+14 0813+09 0713+03 0420-13 0516-26 061744 061453 342956\nRDM      1011+08 0510+05 0219+01 3625-13 3626-25 012543 033054 023764\nRDU 2330 2536+01 2636-03 2638-08 2654-21 2676-33 761942 751350 259651\nRIC 2334 2637-02 2641-04 2644-08 2760-23 2675-35 760445 752349 750948\nRKS              3119    3323-14 3466-24 3473-33 359350 860955 358057\nRNO      9900    0809+06 0317+02 0223-13 0229-26 022744 012654 362860\nROA 2025 2541-02 2642-03 2547-10 2564-23 2678-36 760946 752350 751348\nROW      1506    3021+02 3122-03 3041-17 3050-31 297546 297453 298056\nSAC 9900 9900+14 0806+09 0811+03 0322-13 0521-26 071744 030752 323554\nSAN 0508 0509+14 0411+08 0410+03 0313-12 0110-26 293340 295149 314454\nSAT 9900 3209+09 2918+04 2927-01 2848-13 2760-26 267941 269248 279957\nSAV 2410 2416+03 2525+01 2535-04 2664-15 2674-27 258942 750051 750355\nSBA 9900 0917+14 0817+08 0810+03 0813-13 0710-26 271341 283649 302753\nSEA 0810 0610+09 0417+05 0119-01 3526-12 3527-25 362043 022054 362765\nSFO 9900 9900+14 9900+08 1011+03 0821-13 0924-27 091043 300650 312453\nSGF 3027 3030-10 2932-18 2935-22 2655-31 2585-38 259343 268444 257247\nSHV 2914 3015+00 2537-02 2648-07 2762-18 2679-31 760544 760852 760453\nSIY      1110+14 0409+08 0320+03 0318-13 0515-26 051544 061954 012060\nSLC      9900    3620-04 3530-09 3559-17 3575-30 369747 861055 368360\nSLN 3229 3233-11 3247-19 3240-24 3035-35 2938-43 295443 295843 294344\nSPI 2724 2826-11 2724-19 2628-21 2437-32 2467-41 247646 256846 256746\nSPS 3522 3427-04 3256-07 2853-08 2868-20 2880-33 289748 279152 279654\nSSM 1714 9900-14 9900-16 9900-21 2108-32 1519-46 212049 241946 252944\nSTL 2827 2827-11 2822-18 2628-21 2561-31 2490-40 258845 257445 257346\nSYR 2127 2325-10 2333-12 2541-15 2554-28 2568-41 268354 257648 258245\nT01 2018 2417+09 2523+03 2727-03 2546-11 2656-25 268140 269448 760257\nT06 1919 2317+05 2421+03 2630-02 2544-11 2552-25 268940 269548 750057\nT07 1915 2017+04 2320+04 2527-02 2540-11 2550-25 268839 259248 259857\nTCC      1607    2611-05 3031-08 3059-20 3067-33 298748 308155 298155\nTLH 2218 2315+03 2429+02 2437-03 2657-13 2662-26 258541 760349 751256\nTRI      2550+00 2559-05 2547-09 2568-23 2583-34 761945 752551 750849\nTUL 3127 3127-08 3130-16 2940-20 2885-27 7710-35 770046 279247 267246\nTUS      9900+12 0109+07 3312+01 3326-14 3234-27 305043 305850 306555\nTVC 2618 2714-12 2920-15 2921-21 2917-33 2713-47 262847 253145 253143\nTYS 2138 2454+01 2460-04 2555-08 2565-23 2684-33 762344 752451 750950\nWJF      0628+13 0621+07 0415+02 0415-13 0419-27 301942 292850 313753\nYKM 0409 0513+04 0321+03 0128-02 3634-13 3442-25 354143 014054 354565\nZUN              3610+02 3318-03 3239-16 3243-30 336345 336153 307159\n2XG 1507 2415+06 2523+03 2531-01 2651-12 2651-26 257640 259648 751356\n4J3 1813 2116+06 2227+05 2436+00 2537-12 2653-24 269038 259447 259557\n"
  },
  "sounding": [
    {
      "Pressure_mb": 882.9,
      "Altitude_m": 1289,
      "Temp_c": -0.6,
      "Dewpoint_c": -3.4,
      "Wind_Direction": 160,
      "Wind_Speed_kt": 1
    },
    {
      "Pressure_mb": 882.3,
      "Altitude_m": 1296,
      "Temp_c": -0.6,
      "Dewpoint_c": -3.8,
      "Wind_Direction": 156,
      "Wind_Speed_kt": 4.4
    },
    {
      "Pressure_mb": 881.7,
      "Altitude_m": 1303,
      "Temp_c": -0.5,
      "Dewpoint_c": -4.1,
      "Wind_Direction": 156,
      "Wind_Speed_kt": 4.4
    },
    {
      "Pressure_mb": 881,
      "Altitude_m": 1309,
      "Temp_c": -0.5,
      "Dewpoint_c": -4.4,
      "Wind_Direction": 156,
      "Wind_Speed_kt": 4.4
    },
    {
      "Pressure_mb": 880.4,
      "Altitude_m": 1314,
      "Temp_c": -0.4,
      "Dewpoint_c": -4.7,
      "Wind_Direction": 156,
      "Wind_Speed_kt": 4.3
    },
    {
      "Pressure_mb": 879.7,
      "Altitude_m": 1319,
      "Temp_c": -0.4,
      "Dewpoint_c": -5.1,
      "Wind_Direction": 156,
      "Wind_Speed_kt": 4.3
    },
    {
      "Pressure_mb": 879.1,
      "Altitude_m": 1324,
      "Temp_c": -0.4,
      "Dewpoint_c": -5.4,
      "Wind_Direction": 156,
      "Wind_Speed_kt": 4.3
    },
    {
      "Pressure_mb": 878.6,
      "Altitude_m": 1329,
      "Temp_c": -0.3,
      "Dewpoint_c": -5.8,
      "Wind_Direction": 158,
      "Wind_Speed_kt": 4.2
    },
    {
      "Pressure_mb": 878.3,
      "Altitude_m": 1331,
      "Temp_c": -0.2,
      "Dewpoint_c": -6,
      "Wind_Direction": 159,
      "Wind_Speed_kt": 4.1
    },
    {
      "Pressure_mb": 877.6,
      "Altitude_m": 1338,
      "Temp_c": -0.1,
      "Dewpoint_c": -5.8,
      "Wind_Direction": 161,
      "Wind_Speed_kt": 3.9
    },
    {
      "Pressure_mb": 877,
      "Altitude_m": 1343,
      "Temp_c": 0,
      "Dewpoint_c": -5.7,
      "Wind_Direction": 163,
      "Wind_Speed_kt": 3.8
    },
    {
      "Pressure_mb": 876.5,
      "Altitude_m": 1347,
      "Temp_c": 0.1,
      "Dewpoint_c": -5.6,
      "Wind_Direction": 165,
      "Wind_Speed_kt": 3.7
    },
    {
      "Pressure_mb": 876,
      "Altitude_m": 1352,
      "Temp_c": 0.1,
      "Dewpoint_c": -5.5,
      "Wind_Direction": 167,
      "Wind_Speed_kt": 3.5
    },
    {
      "Pressure_mb": 875.6,
      "Altitude_m": 1356,
      "Temp_c": 0.2,
      "Dewpoint_c": -5.3,
      "Wind_Direction": 169,
      "Wind_Speed_kt": 3.4
    },
    {
      "Pressure_mb": 875.1,
      "Altitude_m": 1360,
      "Temp_c": 0.3,
      "Dewpoint_c": -5.2,
      "Wind_Direction": 172,
      "Wind_Speed_kt": 3.3
    },
    {
      "Pressure_mb": 874.6,
      "Altitude_m": 1365,
      "Temp_c": 0.4,
      "Dewpoint_c": -5.1,
      "Wind_Direction": 174,
      "Wind_Speed_kt": 3.2
    },
    {
      "Pressure_mb": 874.1,
      "Altitude_m": 1369,
      "Temp_c": 0.5,
      "Dewpoint_c": -5,
      "Wind_Direction": 174,
      "Wind_Speed_kt": 3.1
    },
    {
      "Pressure_mb": 873.7,
      "Altitude_m": 1373,
      "Temp_c": 0.6,
      "Dewpoint_c": -4.9,
      "Wind_Direction": 174,
      "Wind_Speed_kt": 3.1
    },
    {
      "Pressure_mb": 873.2,
      "Altitude_m": 1378,
      "Temp_c": 0.7,
      "Dewpoint_c": -4.8,
      "Wind_Direction": 174,
      "Wind_Speed_kt": 3.1
    },
    {
      "Pressure_mb": 872.5,
      "Altitude_m": 1383,
      "Temp_c": 0.8,
      "Dewpoint_c": -4.6,
      "Wind_Direction": 174,
      "Wind_Speed_kt": 3.1
    },
    {
      "Pressure_mb": 872.2,
      "Altitude_m": 1386,
      "Temp_c": 0.8,
      "Dewpoint_c": -4.6,
      "Wind_Direction": 174,
      "Wind_Speed_kt": 3
    },
    {
      "Pressure_mb": 871.6,
      "Altitude_m": 1391,
      "Temp_c": 0.9,
      "Dewpoint_c": -4.5,
      "Wind_Direction": 174,
      "Wind_Speed_kt": 3
    },
    {
      "Pressure_mb": 871.1,
      "Altitude_m": 1396,
      "Temp_c": 1,
      "Dewpoint_c": -4.4,
      "Wind_Direction": 174,
      "Wind_Speed_kt": 3
    },
    {
      "Pressure_mb": 870.6,
      "Altitude_m": 1401,
      "Temp_c": 1.1,
      "Dewpoint_c": -4.4,
      "Wind_Direction": 173,
      "Wind_Speed_kt": 3
    },
    {
      "Pressure_mb": 870.1,
      "Altitude_m": 1406,
      "Temp_c": 1.1,
      "Dewpoint_c": -4.3,
      "Wind_Direction": 173,
      "Wind_Speed_kt": 2.9
    },
    {
      "Pressure_mb": 869.6,
      "Altitude_m": 1411,
      "Temp_c": 1.2,
      "Dewpoint_c": -4.2,
      "Wind_Direction": 173,
      "Wind_Speed_kt": 2.9
    },
    {
      "Pressure_mb": 869,
      "Altitude_m": 1416,
      "Temp_c": 1.3,
      "Dewpoint_c": -4.2,
      "Wind_Direction": 173,
      "Wind_Speed_kt": 2.9
    },
    {
      "Pressure_mb": 868.5,
      "Altitude_m": 1421,
      "Temp_c": 1.4,
      "Dewpoint_c": -4.1,
      "Wind_Direction": 173,
      "Wind_Speed_kt": 2.9
    },
    {
      "Pressure_mb": 868,
      "Altitude_m": 1426,
      "Temp_c": 1.5,
      "Dewpoint_c": -4,
      "Wind_Direction": 173,
      "Wind_Speed_kt": 2.9
    },
    {
      "Pressure_mb": 867.4,
      "Altitude_m": 1431,
      "Temp_c": 1.5,
      "Dewpoint_c": -3.9,
      "Wind_Direction": 171,
      "Wind_Speed_kt": 2.8
    },
    {
      "Pressure_mb": 866.9,
      "Altitude_m": 1436,
      "Temp_c": 1.6,
      "Dewpoint_c": -3.9,
      "Wind_Direction": 170,
      "Wind_Speed_kt": 2.8
    },
    {
      "Pressure_mb": 866.4,
      "Altitude_m": 1441,
      "Temp_c": 1.7,
      "Dewpoint_c": -3.8,
      "Wind_Direction": 169,
      "Wind_Speed_kt": 2.7
    },
    {
      "Pressure_mb": 865.9,
      "Altitude_m": 1445,
      "Temp_c": 1.8,
      "Dewpoint_c": -3.7,
      "Wind_Direction": 167,
      "Wind_Speed_kt": 2.7
    },
    {
      "Pressure_mb": 865.4,
      "Altitude_m": 1450,
      "Temp_c": 1.8,
      "Dewpoint_c": -3.7,
      "Wind_Direction": 166,
      "Wind_Speed_kt": 2.7
    },
    {
      "Pressure_mb": 864.9,
      "Altitude_m": 1455,
      "Temp_c": 1.9,
      "Dewpoint_c": -3.7,
      "Wind_Direction": 164,
      "Wind_Speed_kt": 2.6
    },
    {
      "Pressure_mb": 864.4,
      "Altitude_m": 1459,
      "Temp_c": 1.9,
      "Dewpoint_c": -3.7,
      "Wind_Direction": 163,
      "Wind_Speed_kt": 2.6
    },
    {
      "Pressure_mb": 863.9,
      "Altitude_m": 1464,
      "Temp_c": 2,
      "Dewpoint_c": -3.7,
      "Wind_Direction": 161,
      "Wind_Speed_kt": 2.5
    },
    {
      "Pressure_mb": 863.4,
      "Altitude_m": 1468,
      "Temp_c": 2,
      "Dewpoint_c": -3.8,
      "Wind_Direction": 159,
      "Wind_Speed_kt": 2.5
    },
    {
      "Pressure_mb": 863,
      "Altitude_m": 1472,
      "Temp_c": 2,
      "Dewpoint_c": -3.8,
      "Wind_Direction": 158,
      "Wind_Speed_kt": 2.5
    },
    {
      "Pressure_mb": 862.5,
      "Altitude_m": 1477,
      "Temp_c": 2.1,
      "Dewpoint_c": -3.8,
      "Wind_Direction": 156,
      "Wind_Speed_kt": 2.4
    },
    {
      "Pressure_mb": 862,
      "Altitude_m": 1481,
      "Temp_c": 2.1,
      "Dewpoint_c": -3.8,
      "Wind_Direction": 154,
      "Wind_Speed_kt": 2.4
    },
    {
      "Pressure_mb": 861.6,
      "Altitude_m": 1485,
      "Temp_c": 2.1,
      "Dewpoint_c": -3.9,
      "Wind_Direction": 152,
      "Wind_Speed_kt": 2.3
    },
    {
      "Pressure_mb": 861.1,
      "Altitude_m": 1490,
      "Temp_c": 2.2,
      "Dewpoint_c": -3.9,
      "Wind_Direction": 150,
      "Wind_Speed_kt": 2.3
    },
    {
      "Pressure_mb": 860.6,
      "Altitude_m": 1494,
      "Temp_c": 2.2,
      "Dewpoint_c": -3.9,
      "Wind_Direction": 148,
      "Wind_Speed_kt": 2.3
    },
    {
      "Pressure_mb": 860,
      "Altitude_m": 1500,
      "Temp_c": 2.2,
      "Dewpoint_c": -3.9,
      "Wind_Direction": 145,
      "Wind_Speed_kt": 2.2
    },
    {
      "Pressure_mb": 859.7,
      "Altitude_m": 1503,
      "Temp_c": 2.3,
      "Dewpoint_c": -3.9,
      "Wind_Direction": 144,
      "Wind_Speed_kt": 2.2
    },
    {
      "Pressure_mb": 859.2,
      "Altitude_m": 1508,
      "Temp_c": 2.3,
      "Dewpoint_c": -4,
      "Wind_Direction": 143,
      "Wind_Speed_kt": 2.1
    },
    {
      "Pressure_mb": 858.7,
      "Altitude_m": 1513,
      "Temp_c": 2.4,
      "Dewpoint_c": -4,
      "Wind_Direction": 142,
      "Wind_Speed_kt": 2
    },
    {
      "Pressure_mb": 858.2,
      "Altitude_m": 1517,
      "Temp_c": 2.4,
      "Dewpoint_c": -4,
      "Wind_Direction": 142,
      "Wind_Speed_kt": 1.9
    },
    {
      "Pressure_mb": 857.7,
      "Altitude_m": 1522,
      "Temp_c": 2.5,
      "Dewpoint_c": -4,
      "Wind_Direction": 141,
      "Wind_Speed_kt": 1.9
    },
    {
      "Pressure_mb": 857.1,
      "Altitude_m": 1527,
      "Temp_c": 2.6,
      "Dewpoint_c": -4,
      "Wind_Direction": 140,
      "Wind_Speed_kt": 1.8
    },
    {
      "Pressure_mb": 856.6,
      "Altitude_m": 1532,
      "Temp_c": 2.6,
      "Dewpoint_c": -4,
      "Wind_Direction": 139,
      "Wind_Speed_kt": 1.7
    },
    {
      "Pressure_mb": 856.1,
      "Altitude_m": 1537,
      "Temp_c": 2.7,
      "Dewpoint_c": -4,
      "Wind_Direction": 138,
      "Wind_Speed_kt": 1.6
    },
    {
      "Pressure_mb": 855.6,
      "Altitude_m": 1542,
      "Temp_c": 2.8,
      "Dewpoint_c": -4,
      "Wind_Direction": 136,
      "Wind_Speed_kt": 1.6
    },
    {
      "Pressure_mb": 855.1,
      "Altitude_m": 1547,
      "Temp_c": 2.9,
      "Dewpoint_c": -4,
      "Wind_Direction": 135,
      "Wind_Speed_kt": 1.5
    },
    {
      "Pressure_mb": 854.5,
      "Altitude_m": 1552,
      "Temp_c": 2.9,
      "Dewpoint_c": -4,
      "Wind_Direction": 133,
      "Wind_Speed_kt": 1.4
    },
    {
      "Pressure_mb": 854,
      "Altitude_m": 1557,
      "Temp_c": 3,
      "Dewpoint_c": -4,
      "Wind_Direction": 132,
      "Wind_Speed_kt": 1.3
    },
    {
      "Pressure_mb": 853.4,
      "Altitude_m": 1563,
      "Temp_c": 3.1,
      "Dewpoint_c": -4,
      "Wind_Direction": 130,
      "Wind_Speed_kt": 1.2
    },
    {
      "Pressure_mb": 852.8,
      "Altitude_m": 1568,
      "Temp_c": 3.1,
      "Dewpoint_c": -4,
      "Wind_Direction": 127,
      "Wind_Speed_kt": 1.2
    },
    {
      "Pressure_mb": 852.3,
      "Altitude_m": 1573,
      "Temp_c": 3.2,
      "Dewpoint_c": -4,
      "Wind_Direction": 124,
      "Wind_Speed_kt": 1.1
    },
    {
      "Pressure_mb": 851.7,
      "Altitude_m": 1578,
      "Temp_c": 3.3,
      "Dewpoint_c": -4,
      "Wind_Direction": 121,
      "Wind_Speed_kt": 1
    },
    {
      "Pressure_mb": 851.2,
      "Altitude_m": 1584,
      "Temp_c": 3.3,
      "Dewpoint_c": -4,
      "Wind_Direction": 117,
      "Wind_Speed_kt": 0.9
    },
    {
      "Pressure_mb": 850.6,
      "Altitude_m": 1589,
      "Temp_c": 3.4,
      "Dewpoint_c": -4,
      "Wind_Direction": 113,
      "Wind_Speed_kt": 0.9
    },
    {
      "Pressure_mb": 850,
      "Altitude_m": 1595,
      "Temp_c": 3.4,
      "Dewpoint_c": -4,
      "Wind_Direction": 107,
      "Wind_Speed_kt": 0.8
    },
    {
      "Pressure_mb": 849.5,
      "Altitude_m": 1599,
      "Temp_c": 3.4,
      "Dewpoint_c": -4,
      "Wind_Direction": 102,
      "Wind_Speed_kt": 0.7
    },
    {
      "Pressure_mb": 849,
      "Altitude_m": 1605,
      "Temp_c": 3.5,
      "Dewpoint_c": -4,
      "Wind_Direction": 95,
      "Wind_Speed_kt": 0.6
    },
    {
      "Pressure_mb": 848.4,
      "Altitude_m": 1610,
      "Temp_c": 3.5,
      "Dewpoint_c": -4.1,
      "Wind_Direction": 102,
      "Wind_Speed_kt": 0.7
    },
    {
      "Pressure_mb": 847.9,
      "Altitude_m": 1615,
      "Temp_c": 3.5,
      "Dewpoint_c": -4.1,
      "Wind_Direction": 110,
      "Wind_Speed_kt": 0.7
    },
    {
      "Pressure_mb": 847.4,
      "Altitude_m": 1620,
      "Temp_c": 3.6,
      "Dewpoint_c": -4.1,
      "Wind_Direction": 119,
      "Wind_Speed_kt": 0.7
    },
    {
      "Pressure_mb": 846.9,
      "Altitude_m": 1625,
      "Temp_c": 3.6,
      "Dewpoint_c": -4.1,
      "Wind_Direction": 130,
      "Wind_Speed_kt": 0.8
    },
    {
      "Pressure_mb": 846.3,
      "Altitude_m": 1630,
      "Temp_c": 3.6,
      "Dewpoint_c": -4.1,
      "Wind_Direction": 140,
      "Wind_Speed_kt": 0.8
    },
    {
      "Pressure_mb": 845.8,
      "Altitude_m": 1635,
      "Temp_c": 3.7,
      "Dewpoint_c": -4.2,
      "Wind_Direction": 151,
      "Wind_Speed_kt": 0.9
    },
    {
      "Pressure_mb": 845.3,
      "Altitude_m": 1640,
      "Temp_c": 3.7,
      "Dewpoint_c": -4.2,
      "Wind_Direction": 160,
      "Wind_Speed_kt": 0.9
    },
    {
      "Pressure_mb": 844.8,
      "Altitude_m": 1645,
      "Temp_c": 3.7,
      "Dewpoint_c": -4.2,
      "Wind_Direction": 168,
      "Wind_Speed_kt": 1
    },
    {
      "Pressure_mb": 844.2,
      "Altitude_m": 1650,
      "Temp_c": 3.7,
      "Dewpoint_c": -4.3,
      "Wind_Direction": 174,
      "Wind_Speed_kt": 1
    },
    {
      "Pressure_mb": 843.7,
      "Altitude_m": 1655,
      "Temp_c": 3.8,
      "Dewpoint_c": -4.3,
      "Wind_Direction": 180,
      "Wind_Speed_kt": 1
    },
    {
      "Pressure_mb": 843.2,
      "Altitude_m": 1660,
      "Temp_c": 3.8,
      "Dewpoint_c": -4.4,
      "Wind_Direction": 185,
      "Wind_Speed_kt": 1.1
    },
    {
      "Pressure_mb": 842.7,
      "Altitude_m": 1665,
      "Temp_c": 3.8,
      "Dewpoint_c": -4.4,
      "Wind_Direction": 189,
      "Wind_Speed_kt": 1.1
    },
    {
      "Pressure_mb": 842.2,
      "Altitude_m": 1669,
      "Temp_c": 3.8,
      "Dewpoint_c": -4.5,
      "Wind_Direction": 192,
      "Wind_Speed_kt": 1.2
    },
    {
      "Pressure_mb": 841.8,
      "Altitude_m": 1673,
      "Temp_c": 3.8,
      "Dewpoint_c": -4.5,
      "Wind_Direction": 195,
      "Wind_Speed_kt": 1.2
    },
    {
      "Pressure_mb": 841.4,
      "Altitude_m": 1677,
      "Temp_c": 3.8,
      "Dewpoint_c": -4.6,
      "Wind_Direction": 197,
      "Wind_Speed_kt": 1.3
    },
    {
      "Pressure_mb": 841,
      "Altitude_m": 1681,
      "Temp_c": 3.8,
      "Dewpoint_c": -4.6,
      "Wind_Direction": 199,
      "Wind_Speed_kt": 1.3
    },
    {
      "Pressure_mb": 840.6,
      "Altitude_m": 1685,
      "Temp_c": 3.8,
      "Dewpoint_c": -4.7,
      "Wind_Direction": 201,
      "Wind_Speed_kt": 1.3
    },
    {
      "Pressure_mb": 840.2,
      "Altitude_m": 1688,
      "Temp_c": 3.8,
      "Dewpoint_c": -4.8,
      "Wind_Direction": 202,
      "Wind_Speed_kt": 1.4
    },
    {
      "Pressure_mb": 839.8,
      "Altitude_m": 1692,
      "Temp_c": 3.9,
      "Dewpoint_c": -4.8,
      "Wind_Direction": 204,
      "Wind_Speed_kt": 1.4
    },
    {
      "Pressure_mb": 839.4,
      "Altitude_m": 1697,
      "Temp_c": 3.9,
      "Dewpoint_c": -4.9,
      "Wind_Direction": 205,
      "Wind_Speed_kt": 1.5
    },
    {
      "Pressure_mb": 839,
      "Altitude_m": 1701,
      "Temp_c": 3.9,
      "Dewpoint_c": -4.9,
      "Wind_Direction": 201,
      "Wind_Speed_kt": 1.6
    },
    {
      "Pressure_mb": 838.6,
      "Altitude_m": 1705,
      "Temp_c": 3.9,
      "Dewpoint_c": -5,
      "Wind_Direction": 197,
      "Wind_Speed_kt": 1.7
    },
    {
      "Pressure_mb": 838.1,
      "Altitude_m": 1709,
      "Temp_c": 3.9,
      "Dewpoint_c": -5,
      "Wind_Direction": 194,
      "Wind_Speed_kt": 1.8
    },
    {
      "Pressure_mb": 837.7,
      "Altitude_m": 1713,
      "Temp_c": 3.9,
      "Dewpoint_c": -5.1,
      "Wind_Direction": 191,
      "Wind_Speed_kt": 1.9
    },
    {
      "Pressure_mb": 837.3,
      "Altitude_m": 1718,
      "Temp_c": 4,
      "Dewpoint_c": -5.1,
      "Wind_Direction": 189,
      "Wind_Speed_kt": 2
    },
    {
      "Pressure_mb": 836.8,
      "Altitude_m": 1722,
      "Temp_c": 4,
      "Dewpoint_c": -5.2,
      "Wind_Direction": 186,
      "Wind_Speed_kt": 2.1
    },
    {
      "Pressure_mb": 836.4,
      "Altitude_m": 1726,
      "Temp_c": 4,
      "Dewpoint_c": -5.2,
      "Wind_Direction": 184,
      "Wind_Speed_kt": 2.2
    },
    {
      "Pressure_mb": 835.9,
      "Altitude_m": 1730,
      "Temp_c": 4.1,
      "Dewpoint_c": -5.3,
      "Wind_Direction": 182,
      "Wind_Speed_kt": 2.3
    },
    {
      "Pressure_mb": 835.4,
      "Altitude_m": 1734,
      "Temp_c": 4.1,
      "Dewpoint_c": -5.3,
      "Wind_Direction": 180,
      "Wind_Speed_kt": 2.4
    },
    {
      "Pressure_mb": 835,
      "Altitude_m": 1739,
      "Temp_c": 4.1,
      "Dewpoint_c": -5.4,
      "Wind_Direction": 179,
      "Wind_Speed_kt": 2.5
    },
    {
      "Pressure_mb": 834.5,
      "Altitude_m": 1744,
      "Temp_c": 4.1,
      "Dewpoint_c": -5.4,
      "Wind_Direction": 177,
      "Wind_Speed_kt": 2.6
    },
    {
      "Pressure_mb": 834,
      "Altitude_m": 1749,
      "Temp_c": 4.2,
      "Dewpoint_c": -5.5,
      "Wind_Direction": 176,
      "Wind_Speed_kt": 2.7
    },
    {
      "Pressure_mb": 833.5,
      "Altitude_m": 1754,
      "Temp_c": 4.2,
      "Dewpoint_c": -5.6,
      "Wind_Direction": 175,
      "Wind_Speed_kt": 2.8
    },
    {
      "Pressure_mb": 833,
      "Altitude_m": 1759,
      "Temp_c": 4.2,
      "Dewpoint_c": -5.6,
      "Wind_Direction": 174,
      "Wind_Speed_kt": 2.9
    },
    {
      "Pressure_mb": 832.5,
      "Altitude_m": 1764,
      "Temp_c": 4.3,
      "Dewpoint_c": -5.6,
      "Wind_Direction": 172,
      "Wind_Speed_kt": 3
    },
    {
      "Pressure_mb": 832.2,
      "Altitude_m": 1767,
      "Temp_c": 4.3,
      "Dewpoint_c": -5.6,
      "Wind_Direction": 172,
      "Wind_Speed_kt": 3.1
    },
    {
      "Pressure_mb": 831.5,
      "Altitude_m": 1774,
      "Temp_c": 4.3,
      "Dewpoint_c": -5.7,
      "Wind_Direction": 171,
      "Wind_Speed_kt": 3.2
    },
    {
      "Pressure_mb": 831,
      "Altitude_m": 1779,
      "Temp_c": 4.3,
      "Dewpoint_c": -5.8,
      "Wind_Direction": 170,
      "Wind_Speed_kt": 3.3
    },
    {
      "Pressure_mb": 830.5,
      "Altitude_m": 1784,
      "Temp_c": 4.2,
      "Dewpoint_c": -5.8,
      "Wind_Direction": 169,
      "Wind_Speed_kt": 3.4
    },
    {
      "Pressure_mb": 830,
      "Altitude_m": 1789,
      "Temp_c": 4.2,
      "Dewpoint_c": -5.9,
      "Wind_Direction": 168,
      "Wind_Speed_kt": 3.5
    },
    {
      "Pressure_mb": 829.4,
      "Altitude_m": 1794,
      "Temp_c": 4.2,
      "Dewpoint_c": -5.9,
      "Wind_Direction": 169,
      "Wind_Speed_kt": 3.5
    },
    {
      "Pressure_mb": 828.8,
      "Altitude_m": 1800,
      "Temp_c": 4.2,
      "Dewpoint_c": -6,
      "Wind_Direction": 169,
      "Wind_Speed_kt": 3.5
    },
    {
      "Pressure_mb": 828.4,
      "Altitude_m": 1804,
      "Temp_c": 4.2,
      "Dewpoint_c": -6,
      "Wind_Direction": 169,
      "Wind_Speed_kt": 3.6
    },
    {
      "Pressure_mb": 828,
      "Altitude_m": 1808,
      "Temp_c": 4.2,
      "Dewpoint_c": -6.1,
      "Wind_Direction": 170,
      "Wind_Speed_kt": 3.6
    },
    {
      "Pressure_mb": 827.5,
      "Altitude_m": 1813,
      "Temp_c": 4.2,
      "Dewpoint_c": -6.1,
      "Wind_Direction": 170,
      "Wind_Speed_kt": 3.6
    },
    {
      "Pressure_mb": 827,
      "Altitude_m": 1817,
      "Temp_c": 4.2,
      "Dewpoint_c": -6.2,
      "Wind_Direction": 171,
      "Wind_Speed_kt": 3.6
    },
    {
      "Pressure_mb": 826.5,
      "Altitude_m": 1822,
      "Temp_c": 4.2,
      "Dewpoint_c": -6.2,
      "Wind_Direction": 171,
      "Wind_Speed_kt": 3.6
    },
    {
      "Pressure_mb": 826,
      "Altitude_m": 1827,
      "Temp_c": 4.2,
      "Dewpoint_c": -6.3,
      "Wind_Direction": 171,
      "Wind_Speed_kt": 3.6
    },
    {
      "Pressure_mb": 825.5,
      "Altitude_m": 1832,
      "Temp_c": 4.2,
      "Dewpoint_c": -6.3,
      "Wind_Direction": 172,
      "Wind_Speed_kt": 3.6
    },
    {
      "Pressure_mb": 825,
      "Altitude_m": 1837,
      "Temp_c": 4.2,
      "Dewpoint_c": -6.3,
      "Wind_Direction": 172,
      "Wind_Speed_kt": 3.6
    },
    {
      "Pressure_mb": 824.6,
      "Altitude_m": 1842,
      "Temp_c": 4.2,
      "Dewpoint_c": -6.3,
      "Wind_Direction": 173,
      "Wind_Speed_kt": 3.6
    },
    {
      "Pressure_mb": 824.1,
      "Altitude_m": 1847,
      "Temp_c": 4.2,
      "Dewpoint_c": -6.3,
      "Wind_Direction": 173,
      "Wind_Speed_kt": 3.7
    },
    {
      "Pressure_mb": 823.6,
      "Altitude_m": 1852,
      "Temp_c": 4.2,
      "Dewpoint_c": -6.3,
      "Wind_Direction": 173,
      "Wind_Speed_kt": 3.7
    },
    {
      "Pressure_mb": 823.1,
      "Altitude_m": 1857,
      "Temp_c": 4.2,
      "Dewpoint_c": -6.4,
      "Wind_Direction": 174,
      "Wind_Speed_kt": 3.7
    },
    {
      "Pressure_mb": 822.6,
      "Altitude_m": 1861,
      "Temp_c": 4.1,
      "Dewpoint_c": -6.4,
      "Wind_Direction": 174,
      "Wind_Speed_kt": 3.7
    },
    {
      "Pressure_mb": 822.1,
      "Altitude_m": 1866,
      "Temp_c": 4.1,
      "Dewpoint_c": -6.4,
      "Wind_Direction": 175,
      "Wind_Speed_kt": 3.7
    },
    {
      "Pressure_mb": 821.6,
      "Altitude_m": 1871,
      "Temp_c": 4.1,
      "Dewpoint_c": -6.4,
      "Wind_Direction": 175,
      "Wind_Speed_kt": 3.7
    },
    {
      "Pressure_mb": 821.1,
      "Altitude_m": 1875,
      "Temp_c": 4.1,
      "Dewpoint_c": -6.4,
      "Wind_Direction": 175,
      "Wind_Speed_kt": 3.7
    },
    {
      "Pressure_mb": 820.6,
      "Altitude_m": 1880,
      "Temp_c": 4.1,
      "Dewpoint_c": -6.4,
      "Wind_Direction": 176,
      "Wind_Speed_kt": 3.8
    },
    {
      "Pressure_mb": 820.1,
      "Altitude_m": 1886,
      "Temp_c": 4.1,
      "Dewpoint_c": -6.5,
      "Wind_Direction": 176,
      "Wind_Speed_kt": 3.8
    },
    {
      "Pressure_mb": 819.6,
      "Altitude_m": 1891,
      "Temp_c": 4.1,
      "Dewpoint_c": -6.5,
      "Wind_Direction": 175,
      "Wind_Speed_kt": 3.6
    },
    {
      "Pressure_mb": 818.9,
      "Altitude_m": 1898,
      "Temp_c": 4.1,
      "Dewpoint_c": -6.6,
      "Wind_Direction": 173,
      "Wind_Speed_kt": 3.5
    },
    {
      "Pressure_mb": 818.6,
      "Altitude_m": 1901,
      "Temp_c": 4.1,
      "Dewpoint_c": -6.6,
      "Wind_Direction": 173,
      "Wind_Speed_kt": 3.5
    },
    {
      "Pressure_mb": 818.1,
      "Altitude_m": 1906,
      "Temp_c": 4.1,
      "Dewpoint_c": -6.7,
      "Wind_Direction": 171,
      "Wind_Speed_kt": 3.4
    },
    {
      "Pressure_mb": 817.6,
      "Altitude_m": 1911,
      "Temp_c": 4.1,
      "Dewpoint_c": -6.7,
      "Wind_Direction": 170,
      "Wind_Speed_kt": 3.3
    },
    {
      "Pressure_mb": 817.1,
      "Altitude_m": 1916,
      "Temp_c": 4.1,
      "Dewpoint_c": -6.7,
      "Wind_Direction": 168,
      "Wind_Speed_kt": 3.2
    },
    {
      "Pressure_mb": 816.6,
      "Altitude_m": 1921,
      "Temp_c": 4.1,
      "Dewpoint_c": -6.8,
      "Wind_Direction": 166,
      "Wind_Speed_kt": 3.1
    },
    {
      "Pressure_mb": 816.1,
      "Altitude_m": 1926,
      "Temp_c": 4.2,
      "Dewpoint_c": -6.8,
      "Wind_Direction": 165,
      "Wind_Speed_kt": 3
    },
    {
      "Pressure_mb": 815.6,
      "Altitude_m": 1931,
      "Temp_c": 4.2,
      "Dewpoint_c": -6.9,
      "Wind_Direction": 163,
      "Wind_Speed_kt": 2.9
    },
    {
      "Pressure_mb": 815.1,
      "Altitude_m": 1936,
      "Temp_c": 4.2,
      "Dewpoint_c": -6.9,
      "Wind_Direction": 160,
      "Wind_Speed_kt": 2.8
    },
    {
      "Pressure_mb": 814.6,
      "Altitude_m": 1941,
      "Temp_c": 4.2,
      "Dewpoint_c": -6.9,
      "Wind_Direction": 158,
      "Wind_Speed_kt": 2.7
    },
    {
      "Pressure_mb": 814.1,
      "Altitude_m": 1946,
      "Temp_c": 4.2,
      "Dewpoint_c": -7,
      "Wind_Direction": 155,
      "Wind_Speed_kt": 2.6
    },
    {
      "Pressure_mb": 813.6,
      "Altitude_m": 1951,
      "Temp_c": 4.2,
      "Dewpoint_c": -7,
      "Wind_Direction": 152,
      "Wind_Speed_kt": 2.4
    },
    {
      "Pressure_mb": 813.1,
      "Altitude_m": 1956,
      "Temp_c": 4.2,
      "Dewpoint_c": -7.1,
      "Wind_Direction": 149,
      "Wind_Speed_kt": 2.3
    },
    {
      "Pressure_mb": 812.6,
      "Altitude_m": 1961,
      "Temp_c": 4.2,
      "Dewpoint_c": -7.2,
      "Wind_Direction": 146,
      "Wind_Speed_kt": 2.2
    },
    {
      "Pressure_mb": 812.1,
      "Altitude_m": 1966,
      "Temp_c": 4.2,
      "Dewpoint_c": -7.2,
      "Wind_Direction": 142,
      "Wind_Speed_kt": 2.1
    },
    {
      "Pressure_mb": 811.6,
      "Altitude_m": 1971,
      "Temp_c": 4.2,
      "Dewpoint_c": -7.3,
      "Wind_Direction": 138,
      "Wind_Speed_kt": 2
    },
    {
      "Pressure_mb": 811,
      "Altitude_m": 1976,
      "Temp_c": 4.3,
      "Dewpoint_c": -7.3,
      "Wind_Direction": 134,
      "Wind_Speed_kt": 1.9
    },
    {
      "Pressure_mb": 810.5,
      "Altitude_m": 1981,
      "Temp_c": 4.3,
      "Dewpoint_c": -7.4,
      "Wind_Direction": 129,
      "Wind_Speed_kt": 1.8
    },
    {
      "Pressure_mb": 810.1,
      "Altitude_m": 1986,
      "Temp_c": 4.3,
      "Dewpoint_c": -7.5,
      "Wind_Direction": 124,
      "Wind_Speed_kt": 1.7
    },
    {
      "Pressure_mb": 809.6,
      "Altitude_m": 1991,
      "Temp_c": 4.3,
      "Dewpoint_c": -7.5,
      "Wind_Direction": 124,
      "Wind_Speed_kt": 1.7
    },
    {
      "Pressure_mb": 809.1,
      "Altitude_m": 1996,
      "Temp_c": 4.3,
      "Dewpoint_c": -7.6,
      "Wind_Direction": 124,
      "Wind_Speed_kt": 1.6
    },
    {
      "Pressure_mb": 808.6,
      "Altitude_m": 2000,
      "Temp_c": 4.3,
      "Dewpoint_c": -7.6,
      "Wind_Direction": 123,
      "Wind_Speed_kt": 1.6
    },
    {
      "Pressure_mb": 808.2,
      "Altitude_m": 2005,
      "Temp_c": 4.4,
      "Dewpoint_c": -7.7,
      "Wind_Direction": 123,
      "Wind_Speed_kt": 1.5
    },
    {
      "Pressure_mb": 807.7,
      "Altitude_m": 2010,
      "Temp_c": 4.4,
      "Dewpoint_c": -7.8,
      "Wind_Direction": 123,
      "Wind_Speed_kt": 1.5
    },
    {
      "Pressure_mb": 807.2,
      "Altitude_m": 2015,
      "Temp_c": 4.4,
      "Dewpoint_c": -7.8,
      "Wind_Direction": 122,
      "Wind_Speed_kt": 1.4
    },
    {
      "Pressure_mb": 806.7,
      "Altitude_m": 2020,
      "Temp_c": 4.4,
      "Dewpoint_c": -7.9,
      "Wind_Direction": 121,
      "Wind_Speed_kt": 1.4
    },
    {
      "Pressure_mb": 806.3,
      "Altitude_m": 2024,
      "Temp_c": 4.4,
      "Dewpoint_c": -8,
      "Wind_Direction": 121,
      "Wind_Speed_kt": 1.3
    },
    {
      "Pressure_mb": 805.8,
      "Altitude_m": 2029,
      "Temp_c": 4.4,
      "Dewpoint_c": -8.1,
      "Wind_Direction": 119,
      "Wind_Speed_kt": 1.3
    },
    {
      "Pressure_mb": 805.3,
      "Altitude_m": 2034,
      "Temp_c": 4.5,
      "Dewpoint_c": -8.1,
      "Wind_Direction": 118,
      "Wind_Speed_kt": 1.2
    },
    {
      "Pressure_mb": 804.8,
      "Altitude_m": 2039,
      "Temp_c": 4.5,
      "Dewpoint_c": -8.2,
      "Wind_Direction": 115,
      "Wind_Speed_kt": 1.1
    },
    {
      "Pressure_mb": 804.4,
      "Altitude_m": 2044,
      "Temp_c": 4.6,
      "Dewpoint_c": -8.3,
      "Wind_Direction": 111,
      "Wind_Speed_kt": 1.1
    },
    {
      "Pressure_mb": 803.9,
      "Altitude_m": 2048,
      "Temp_c": 4.6,
      "Dewpoint_c": -8.4,
      "Wind_Direction": 101,
      "Wind_Speed_kt": 1
    },
    {
      "Pressure_mb": 803.5,
      "Altitude_m": 2053,
      "Temp_c": 4.7,
      "Dewpoint_c": -8.4,
      "Wind_Direction": 74,
      "Wind_Speed_kt": 1
    },
    {
      "Pressure_mb": 803,
      "Altitude_m": 2057,
      "Temp_c": 4.7,
      "Dewpoint_c": -8.5,
      "Wind_Direction": 7,
      "Wind_Speed_kt": 0.9
    },
    {
      "Pressure_mb": 802.6,
      "Altitude_m": 2062,
      "Temp_c": 4.8,
      "Dewpoint_c": -8.6,
      "Wind_Direction": 335,
      "Wind_Speed_kt": 0.9
    },
    {
      "Pressure_mb": 802.1,
      "Altitude_m": 2066,
      "Temp_c": 4.8,
      "Dewpoint_c": -8.6,
      "Wind_Direction": 324,
      "Wind_Speed_kt": 0.8
    },
    {
      "Pressure_mb": 801.7,
      "Altitude_m": 2071,
      "Temp_c": 4.8,
      "Dewpoint_c": -8.7,
      "Wind_Direction": 319,
      "Wind_Speed_kt": 0.8
    },
    {
      "Pressure_mb": 801.2,
      "Altitude_m": 2075,
      "Temp_c": 4.9,
      "Dewpoint_c": -8.8,
      "Wind_Direction": 317,
      "Wind_Speed_kt": 0.7
    },
    {
      "Pressure_mb": 800.8,
      "Altitude_m": 2080,
      "Temp_c": 4.9,
      "Dewpoint_c": -8.9,
      "Wind_Direction": 315,
      "Wind_Speed_kt": 0.7
    },
    {
      "Pressure_mb": 800.3,
      "Altitude_m": 2084,
      "Temp_c": 5,
      "Dewpoint_c": -8.9,
      "Wind_Direction": 309,
      "Wind_Speed_kt": 0.7
    },
    {
      "Pressure_mb": 799.9,
      "Altitude_m": 2088,
      "Temp_c": 5,
      "Dewpoint_c": -9,
      "Wind_Direction": 303,
      "Wind_Speed_kt": 0.8
    },
    {
      "Pressure_mb": 799.6,
      "Altitude_m": 2092,
      "Temp_c": 5.1,
      "Dewpoint_c": -9,
      "Wind_Direction": 299,
      "Wind_Speed_kt": 0.8
    },
    {
      "Pressure_mb": 798.8,
      "Altitude_m": 2100,
      "Temp_c": 5,
      "Dewpoint_c": -9.1,
      "Wind_Direction": 292,
      "Wind_Speed_kt": 0.9
    },
    {
      "Pressure_mb": 798.3,
      "Altitude_m": 2105,
      "Temp_c": 5,
      "Dewpoint_c": -9.2,
      "Wind_Direction": 288,
      "Wind_Speed_kt": 1
    },
    {
      "Pressure_mb": 797.8,
      "Altitude_m": 2111,
      "Temp_c": 5,
      "Dewpoint_c": -9.3,
      "Wind_Direction": 285,
      "Wind_Speed_kt": 1
    },
    {
      "Pressure_mb": 797.2,
      "Altitude_m": 2116,
      "Temp_c": 5,
      "Dewpoint_c": -9.4,
      "Wind_Direction": 281,
      "Wind_Speed_kt": 1.1
    },
    {
      "Pressure_mb": 796.7,
      "Altitude_m": 2122,
      "Temp_c": 5,
      "Dewpoint_c": -9.4,
      "Wind_Direction": 279,
      "Wind_Speed_kt": 1.1
    },
    {
      "Pressure_mb": 796.1,
      "Altitude_m": 2127,
      "Temp_c": 5,
      "Dewpoint_c": -9.5,
      "Wind_Direction": 276,
      "Wind_Speed_kt": 1.2
    },
    {
      "Pressure_mb": 795.6,
      "Altitude_m": 2133,
      "Temp_c": 5,
      "Dewpoint_c": -9.6,
      "Wind_Direction": 274,
      "Wind_Speed_kt": 1.3
    },
    {
      "Pressure_mb": 795.1,
      "Altitude_m": 2138,
      "Temp_c": 4.9,
      "Dewpoint_c": -9.7,
      "Wind_Direction": 272,
      "Wind_Speed_kt": 1.3
    },
    {
      "Pressure_mb": 794.6,
      "Altitude_m": 2144,
      "Temp_c": 4.9,
      "Dewpoint_c": -9.8,
      "Wind_Direction": 270,
      "Wind_Speed_kt": 1.4
    },
    {
      "Pressure_mb": 794.1,
      "Altitude_m": 2149,
      "Temp_c": 4.9,
      "Dewpoint_c": -9.9,
      "Wind_Direction": 268,
      "Wind_Speed_kt": 1.4
    },
    {
      "Pressure_mb": 793.6,
      "Altitude_m": 2154,
      "Temp_c": 4.9,
      "Dewpoint_c": -10,
      "Wind_Direction": 267,
      "Wind_Speed_kt": 1.5
    },
    {
      "Pressure_mb": 793.1,
      "Altitude_m": 2159,
      "Temp_c": 4.9,
      "Dewpoint_c": -10.1,
      "Wind_Direction": 266,
      "Wind_Speed_kt": 1.6
    },
    {
      "Pressure_mb": 792.7,
      "Altitude_m": 2163,
      "Temp_c": 4.9,
      "Dewpoint_c": -10.1,
      "Wind_Direction": 264,
      "Wind_Speed_kt": 1.6
    },
    {
      "Pressure_mb": 792.2,
      "Altitude_m": 2167,
      "Temp_c": 4.9,
      "Dewpoint_c": -10.2,
      "Wind_Direction": 263,
      "Wind_Speed_kt": 1.7
    },
    {
      "Pressure_mb": 791.8,
      "Altitude_m": 2171,
      "Temp_c": 4.8,
      "Dewpoint_c": -10.2,
      "Wind_Direction": 262,
      "Wind_Speed_kt": 1.8
    },
    {
      "Pressure_mb": 791.4,
      "Altitude_m": 2175,
      "Temp_c": 4.8,
      "Dewpoint_c": -10.3,
      "Wind_Direction": 261,
      "Wind_Speed_kt": 1.8
    },
    {
      "Pressure_mb": 791,
      "Altitude_m": 2179,
      "Temp_c": 4.8,
      "Dewpoint_c": -10.4,
      "Wind_Direction": 261,
      "Wind_Speed_kt": 1.9
    },
    {
      "Pressure_mb": 790.5,
      "Altitude_m": 2185,
      "Temp_c": 4.8,
      "Dewpoint_c": -10.4,
      "Wind_Direction": 262,
      "Wind_Speed_kt": 1.9
    },
    {
      "Pressure_mb": 790,
      "Altitude_m": 2190,
      "Temp_c": 4.8,
      "Dewpoint_c": -10.5,
      "Wind_Direction": 264,
      "Wind_Speed_kt": 1.9
    },
    {
      "Pressure_mb": 789.6,
      "Altitude_m": 2196,
      "Temp_c": 4.7,
      "Dewpoint_c": -10.6,
      "Wind_Direction": 265,
      "Wind_Speed_kt": 1.9
    },
    {
      "Pressure_mb": 789.1,
      "Altitude_m": 2201,
      "Temp_c": 4.7,
      "Dewpoint_c": -10.6,
      "Wind_Direction": 267,
      "Wind_Speed_kt": 1.9
    },
    {
      "Pressure_mb": 788.6,
      "Altitude_m": 2206,
      "Temp_c": 4.7,
      "Dewpoint_c": -10.7,
      "Wind_Direction": 269,
      "Wind_Speed_kt": 1.9
    },
    {
      "Pressure_mb": 788.1,
      "Altitude_m": 2211,
      "Temp_c": 4.7,
      "Dewpoint_c": -10.8,
      "Wind_Direction": 270,
      "Wind_Speed_kt": 1.8
    },
    {
      "Pressure_mb": 787.6,
      "Altitude_m": 2215,
      "Temp_c": 4.7,
      "Dewpoint_c": -10.8,
      "Wind_Direction": 272,
      "Wind_Speed_kt": 1.8
    },
    {
      "Pressure_mb": 787.2,
      "Altitude_m": 2220,
      "Temp_c": 4.6,
      "Dewpoint_c": -10.9,
      "Wind_Direction": 274,
      "Wind_Speed_kt": 1.8
    },
    {
      "Pressure_mb": 786.7,
      "Altitude_m": 2224,
      "Temp_c": 4.6,
      "Dewpoint_c": -10.9,
      "Wind_Direction": 276,
      "Wind_Speed_kt": 1.8
    },
    {
      "Pressure_mb": 786.3,
      "Altitude_m": 2228,
      "Temp_c": 4.6,
      "Dewpoint_c": -11,
      "Wind_Direction": 278,
      "Wind_Speed_kt": 1.8
    },
    {
      "Pressure_mb": 785.9,
      "Altitude_m": 2233,
      "Temp_c": 4.6,
      "Dewpoint_c": -11,
      "Wind_Direction": 279,
      "Wind_Speed_kt": 1.8
    },
    {
      "Pressure_mb": 785.5,
      "Altitude_m": 2237,
      "Temp_c": 4.5,
      "Dewpoint_c": -11.1,
      "Wind_Direction": 281,
      "Wind_Speed_kt": 1.8
    },
    {
      "Pressure_mb": 785,
      "Altitude_m": 2242,
      "Temp_c": 4.5,
      "Dewpoint_c": -11.1,
      "Wind_Direction": 283,
      "Wind_Speed_kt": 1.8
    },
    {
      "Pressure_mb": 784.6,
      "Altitude_m": 2246,
      "Temp_c": 4.5,
      "Dewpoint_c": -11.2,
      "Wind_Direction": 285,
      "Wind_Speed_kt": 1.8
    },
    {
      "Pressure_mb": 784.2,
      "Altitude_m": 2251,
      "Temp_c": 4.4,
      "Dewpoint_c": -11.2,
      "Wind_Direction": 287,
      "Wind_Speed_kt": 1.8
    },
    {
      "Pressure_mb": 783.8,
      "Altitude_m": 2255,
      "Temp_c": 4.4,
      "Dewpoint_c": -11.3,
      "Wind_Direction": 289,
      "Wind_Speed_kt": 1.8
    },
    {
      "Pressure_mb": 783.4,
      "Altitude_m": 2259,
      "Temp_c": 4.3,
      "Dewpoint_c": -11.3,
      "Wind_Direction": 290,
      "Wind_Speed_kt": 1.8
    },
    {
      "Pressure_mb": 783,
      "Altitude_m": 2263,
      "Temp_c": 4.3,
      "Dewpoint_c": -11.4,
      "Wind_Direction": 292,
      "Wind_Speed_kt": 1.8
    },
    {
      "Pressure_mb": 782.6,
      "Altitude_m": 2267,
      "Temp_c": 4.3,
      "Dewpoint_c": -11.5,
      "Wind_Direction": 294,
      "Wind_Speed_kt": 1.8
    },
    {
      "Pressure_mb": 782.2,
      "Altitude_m": 2271,
      "Temp_c": 4.2,
      "Dewpoint_c": -11.5,
      "Wind_Direction": 296,
      "Wind_Speed_kt": 1.8
    },
    {
      "Pressure_mb": 782,
      "Altitude_m": 2274,
      "Temp_c": 4.2,
      "Dewpoint_c": -11.6,
      "Wind_Direction": 296,
      "Wind_Speed_kt": 1.8
    },
    {
      "Pressure_mb": 781.4,
      "Altitude_m": 2280,
      "Temp_c": 4.2,
      "Dewpoint_c": -11.6,
      "Wind_Direction": 295,
      "Wind_Speed_kt": 1.8
    },
    {
      "Pressure_mb": 781,
      "Altitude_m": 2283,
      "Temp_c": 4.1,
      "Dewpoint_c": -11.6,
      "Wind_Direction": 295,
      "Wind_Speed_kt": 1.9
    },
    {
      "Pressure_mb": 780.7,
      "Altitude_m": 2287,
      "Temp_c": 4.1,
      "Dewpoint_c": -11.7,
      "Wind_Direction": 294,
      "Wind_Speed_kt": 1.9
    },
    {
      "Pressure_mb": 780.3,
      "Altitude_m": 2291,
      "Temp_c": 4,
      "Dewpoint_c": -11.7,
      "Wind_Direction": 294,
      "Wind_Speed_kt": 2
    },
    {
      "Pressure_mb": 779.8,
      "Altitude_m": 2295,
      "Temp_c": 4,
      "Dewpoint_c": -11.7,
      "Wind_Direction": 294,
      "Wind_Speed_kt": 2
    },
    {
      "Pressure_mb": 779.4,
      "Altitude_m": 2299,
      "Temp_c": 4,
      "Dewpoint_c": -11.8,
      "Wind_Direction": 293,
      "Wind_Speed_kt": 2
    },
    {
      "Pressure_mb": 779,
      "Altitude_m": 2304,
      "Temp_c": 3.9,
      "Dewpoint_c": -11.8,
      "Wind_Direction": 293,
      "Wind_Speed_kt": 2.1
    },
    {
      "Pressure_mb": 778.6,
      "Altitude_m": 2308,
      "Temp_c": 3.9,
      "Dewpoint_c": -11.8,
      "Wind_Direction": 293,
      "Wind_Speed_kt": 2.1
    },
    {
      "Pressure_mb": 778.1,
      "Altitude_m": 2313,
      "Temp_c": 3.9,
      "Dewpoint_c": -11.9,
      "Wind_Direction": 293,
      "Wind_Speed_kt": 2.1
    },
    {
      "Pressure_mb": 777.7,
      "Altitude_m": 2318,
      "Temp_c": 3.8,
      "Dewpoint_c": -11.9,
      "Wind_Direction": 292,
      "Wind_Speed_kt": 2.2
    },
    {
      "Pressure_mb": 777.2,
      "Altitude_m": 2323,
      "Temp_c": 3.8,
      "Dewpoint_c": -11.9,
      "Wind_Direction": 292,
      "Wind_Speed_kt": 2.2
    },
    {
      "Pressure_mb": 776.7,
      "Altitude_m": 2328,
      "Temp_c": 3.7,
      "Dewpoint_c": -12,
      "Wind_Direction": 292,
      "Wind_Speed_kt": 2.3
    },
    {
      "Pressure_mb": 776.2,
      "Altitude_m": 2333,
      "Temp_c": 3.7,
      "Dewpoint_c": -12,
      "Wind_Direction": 292,
      "Wind_Speed_kt": 2.3
    },
    {
      "Pressure_mb": 775.8,
      "Altitude_m": 2338,
      "Temp_c": 3.7,
      "Dewpoint_c": -12,
      "Wind_Direction": 291,
      "Wind_Speed_kt": 2.3
    },
    {
      "Pressure_mb": 775.3,
      "Altitude_m": 2343,
      "Temp_c": 3.6,
      "Dewpoint_c": -12.1,
      "Wind_Direction": 291,
      "Wind_Speed_kt": 2.4
    },
    {
      "Pressure_mb": 774.8,
      "Altitude_m": 2348,
      "Temp_c": 3.6,
      "Dewpoint_c": -12.1,
      "Wind_Direction": 291,
      "Wind_Speed_kt": 2.4
    },
    {
      "Pressure_mb": 774.3,
      "Altitude_m": 2353,
      "Temp_c": 3.6,
      "Dewpoint_c": -12.1,
      "Wind_Direction": 291,
      "Wind_Speed_kt": 2.4
    },
    {
      "Pressure_mb": 773.8,
      "Altitude_m": 2358,
      "Temp_c": 3.5,
      "Dewpoint_c": -12.2,
      "Wind_Direction": 290,
      "Wind_Speed_kt": 2.5
    },
    {
      "Pressure_mb": 773.4,
      "Altitude_m": 2363,
      "Temp_c": 3.5,
      "Dewpoint_c": -12.2,
      "Wind_Direction": 290,
      "Wind_Speed_kt": 2.5
    },
    {
      "Pressure_mb": 772.9,
      "Altitude_m": 2368,
      "Temp_c": 3.5,
      "Dewpoint_c": -12.2,
      "Wind_Direction": 288,
      "Wind_Speed_kt": 2.6
    },
    {
      "Pressure_mb": 772.4,
      "Altitude_m": 2374,
      "Temp_c": 3.4,
      "Dewpoint_c": -12.2,
      "Wind_Direction": 287,
      "Wind_Speed_kt": 2.7
    },
    {
      "Pressure_mb": 771.9,
      "Altitude_m": 2379,
      "Temp_c": 3.4,
      "Dewpoint_c": -12.3,
      "Wind_Direction": 285,
      "Wind_Speed_kt": 2.8
    },
    {
      "Pressure_mb": 771.4,
      "Altitude_m": 2384,
      "Temp_c": 3.4,
      "Dewpoint_c": -12.3,
      "Wind_Direction": 284,
      "Wind_Speed_kt": 2.9
    },
    {
      "Pressure_mb": 771,
      "Altitude_m": 2389,
      "Temp_c": 3.3,
      "Dewpoint_c": -12.3,
      "Wind_Direction": 282,
      "Wind_Speed_kt": 2.9
    },
    {
      "Pressure_mb": 770.5,
      "Altitude_m": 2393,
      "Temp_c": 3.3,
      "Dewpoint_c": -12.3,
      "Wind_Direction": 281,
      "Wind_Speed_kt": 3
    },
    {
      "Pressure_mb": 770,
      "Altitude_m": 2398,
      "Temp_c": 3.2,
      "Dewpoint_c": -12.4,
      "Wind_Direction": 279,
      "Wind_Speed_kt": 3.1
    },
    {
      "Pressure_mb": 769.6,
      "Altitude_m": 2403,
      "Temp_c": 3.2,
      "Dewpoint_c": -12.4,
      "Wind_Direction": 278,
      "Wind_Speed_kt": 3.2
    },
    {
      "Pressure_mb": 769.1,
      "Altitude_m": 2408,
      "Temp_c": 3.2,
      "Dewpoint_c": -12.5,
      "Wind_Direction": 277,
      "Wind_Speed_kt": 3.3
    },
    {
      "Pressure_mb": 768.6,
      "Altitude_m": 2413,
      "Temp_c": 3.2,
      "Dewpoint_c": -12.5,
      "Wind_Direction": 276,
      "Wind_Speed_kt": 3.3
    },
    {
      "Pressure_mb": 768.1,
      "Altitude_m": 2419,
      "Temp_c": 3.1,
      "Dewpoint_c": -12.5,
      "Wind_Direction": 275,
      "Wind_Speed_kt": 3.4
    },
    {
      "Pressure_mb": 767.6,
      "Altitude_m": 2424,
      "Temp_c": 3.1,
      "Dewpoint_c": -12.6,
      "Wind_Direction": 274,
      "Wind_Speed_kt": 3.5
    },
    {
      "Pressure_mb": 767.1,
      "Altitude_m": 2430,
      "Temp_c": 3.1,
      "Dewpoint_c": -12.6,
      "Wind_Direction": 273,
      "Wind_Speed_kt": 3.6
    },
    {
      "Pressure_mb": 766.5,
      "Altitude_m": 2435,
      "Temp_c": 3.1,
      "Dewpoint_c": -12.6,
      "Wind_Direction": 272,
      "Wind_Speed_kt": 3.7
    },
    {
      "Pressure_mb": 766,
      "Altitude_m": 2440,
      "Temp_c": 3.1,
      "Dewpoint_c": -12.6,
      "Wind_Direction": 271,
      "Wind_Speed_kt": 3.8
    },
    {
      "Pressure_mb": 765.6,
      "Altitude_m": 2446,
      "Temp_c": 3.1,
      "Dewpoint_c": -12.7,
      "Wind_Direction": 270,
      "Wind_Speed_kt": 3.8
    },
    {
      "Pressure_mb": 765.1,
      "Altitude_m": 2450,
      "Temp_c": 3.1,
      "Dewpoint_c": -12.7,
      "Wind_Direction": 269,
      "Wind_Speed_kt": 3.9
    },
    {
      "Pressure_mb": 764.7,
      "Altitude_m": 2455,
      "Temp_c": 3.1,
      "Dewpoint_c": -12.7,
      "Wind_Direction": 269,
      "Wind_Speed_kt": 4
    },
    {
      "Pressure_mb": 764.2,
      "Altitude_m": 2460,
      "Temp_c": 3.1,
      "Dewpoint_c": -12.7,
      "Wind_Direction": 268,
      "Wind_Speed_kt": 4.1
    },
    {
      "Pressure_mb": 763.8,
      "Altitude_m": 2464,
      "Temp_c": 3.1,
      "Dewpoint_c": -12.8,
      "Wind_Direction": 267,
      "Wind_Speed_kt": 4.2
    },
    {
      "Pressure_mb": 763.3,
      "Altitude_m": 2469,
      "Temp_c": 3.1,
      "Dewpoint_c": -12.8,
      "Wind_Direction": 268,
      "Wind_Speed_kt": 4.1
    },
    {
      "Pressure_mb": 762.8,
      "Altitude_m": 2474,
      "Temp_c": 3.1,
      "Dewpoint_c": -12.8,
      "Wind_Direction": 269,
      "Wind_Speed_kt": 4.1
    },
    {
      "Pressure_mb": 762.2,
      "Altitude_m": 2482,
      "Temp_c": 3.1,
      "Dewpoint_c": -12.9,
      "Wind_Direction": 270,
      "Wind_Speed_kt": 4
    },
    {
      "Pressure_mb": 761.9,
      "Altitude_m": 2485,
      "Temp_c": 3.2,
      "Dewpoint_c": -12.9,
      "Wind_Direction": 270,
      "Wind_Speed_kt": 4
    },
    {
      "Pressure_mb": 761.4,
      "Altitude_m": 2490,
      "Temp_c": 3.2,
      "Dewpoint_c": -12.9,
      "Wind_Direction": 271,
      "Wind_Speed_kt": 3.9
    },
    {
      "Pressure_mb": 760.9,
      "Altitude_m": 2495,
      "Temp_c": 3.3,
      "Dewpoint_c": -12.9,
      "Wind_Direction": 272,
      "Wind_Speed_kt": 3.9
    },
    {
      "Pressure_mb": 760.4,
      "Altitude_m": 2500,
      "Temp_c": 3.3,
      "Dewpoint_c": -12.9,
      "Wind_Direction": 272,
      "Wind_Speed_kt": 3.8
    },
    {
      "Pressure_mb": 760,
      "Altitude_m": 2504,
      "Temp_c": 3.3,
      "Dewpoint_c": -13,
      "Wind_Direction": 273,
      "Wind_Speed_kt": 3.8
    },
    {
      "Pressure_mb": 759.6,
      "Altitude_m": 2508,
      "Temp_c": 3.4,
      "Dewpoint_c": -13,
      "Wind_Direction": 274,
      "Wind_Speed_kt": 3.8
    },
    {
      "Pressure_mb": 759.2,
      "Altitude_m": 2513,
      "Temp_c": 3.4,
      "Dewpoint_c": -13,
      "Wind_Direction": 275,
      "Wind_Speed_kt": 3.8
    },
    {
      "Pressure_mb": 758.8,
      "Altitude_m": 2517,
      "Temp_c": 3.5,
      "Dewpoint_c": -13,
      "Wind_Direction": 276,
      "Wind_Speed_kt": 3.7
    },
    {
      "Pressure_mb": 758.4,
      "Altitude_m": 2521,
      "Temp_c": 3.5,
      "Dewpoint_c": -13,
      "Wind_Direction": 277,
      "Wind_Speed_kt": 3.7
    },
    {
      "Pressure_mb": 758,
      "Altitude_m": 2526,
      "Temp_c": 3.6,
      "Dewpoint_c": -13,
      "Wind_Direction": 277,
      "Wind_Speed_kt": 3.6
    },
    {
      "Pressure_mb": 757.5,
      "Altitude_m": 2531,
      "Temp_c": 3.6,
      "Dewpoint_c": -13,
      "Wind_Direction": 278,
      "Wind_Speed_kt": 3.6
    },
    {
      "Pressure_mb": 757,
      "Altitude_m": 2537,
      "Temp_c": 3.7,
      "Dewpoint_c": -13.1,
      "Wind_Direction": 279,
      "Wind_Speed_kt": 3.5
    },
    {
      "Pressure_mb": 756.6,
      "Altitude_m": 2542,
      "Temp_c": 3.7,
      "Dewpoint_c": -13.2,
      "Wind_Direction": 280,
      "Wind_Speed_kt": 3.5
    },
    {
      "Pressure_mb": 756.1,
      "Altitude_m": 2547,
      "Temp_c": 3.8,
      "Dewpoint_c": -13.3,
      "Wind_Direction": 281,
      "Wind_Speed_kt": 3.4
    },
    {
      "Pressure_mb": 755.6,
      "Altitude_m": 2552,
      "Temp_c": 3.8,
      "Dewpoint_c": -13.4,
      "Wind_Direction": 282,
      "Wind_Speed_kt": 3.4
    },
    {
      "Pressure_mb": 755.2,
      "Altitude_m": 2556,
      "Temp_c": 3.8,
      "Dewpoint_c": -13.6,
      "Wind_Direction": 283,
      "Wind_Speed_kt": 3.4
    },
    {
      "Pressure_mb": 754.7,
      "Altitude_m": 2561,
      "Temp_c": 3.8,
      "Dewpoint_c": -13.7,
      "Wind_Direction": 284,
      "Wind_Speed_kt": 3.3
    },
    {
      "Pressure_mb": 754.3,
      "Altitude_m": 2565,
      "Temp_c": 3.8,
      "Dewpoint_c": -13.8,
      "Wind_Direction": 286,
      "Wind_Speed_kt": 3.4
    },
    {
      "Pressure_mb": 753.9,
      "Altitude_m": 2570,
      "Temp_c": 3.9,
      "Dewpoint_c": -14,
      "Wind_Direction": 289,
      "Wind_Speed_kt": 3.4
    },
    {
      "Pressure_mb": 753.5,
      "Altitude_m": 2574,
      "Temp_c": 3.9,
      "Dewpoint_c": -14.1,
      "Wind_Direction": 291,
      "Wind_Speed_kt": 3.4
    },
    {
      "Pressure_mb": 753,
      "Altitude_m": 2579,
      "Temp_c": 3.9,
      "Dewpoint_c": -14.2,
      "Wind_Direction": 293,
      "Wind_Speed_kt": 3.4
    },
    {
      "Pressure_mb": 752.6,
      "Altitude_m": 2584,
      "Temp_c": 3.9,
      "Dewpoint_c": -14.4,
      "Wind_Direction": 295,
      "Wind_Speed_kt": 3.4
    },
    {
      "Pressure_mb": 752.2,
      "Altitude_m": 2588,
      "Temp_c": 3.9,
      "Dewpoint_c": -14.5,
      "Wind_Direction": 298,
      "Wind_Speed_kt": 3.4
    },
    {
      "Pressure_mb": 751.8,
      "Altitude_m": 2593,
      "Temp_c": 4,
      "Dewpoint_c": -14.7,
      "Wind_Direction": 300,
      "Wind_Speed_kt": 3.4
    },
    {
      "Pressure_mb": 751.4,
      "Altitude_m": 2597,
      "Temp_c": 4,
      "Dewpoint_c": -14.8,
      "Wind_Direction": 302,
      "Wind_Speed_kt": 3.4
    },
    {
      "Pressure_mb": 751,
      "Altitude_m": 2602,
      "Temp_c": 4,
      "Dewpoint_c": -14.9,
      "Wind_Direction": 305,
      "Wind_Speed_kt": 3.5
    },
    {
      "Pressure_mb": 750.4,
      "Altitude_m": 2607,
      "Temp_c": 4,
      "Dewpoint_c": -15,
      "Wind_Direction": 307,
      "Wind_Speed_kt": 3.5
    },
    {
      "Pressure_mb": 750.1,
      "Altitude_m": 2610,
      "Temp_c": 4,
      "Dewpoint_c": -15.1,
      "Wind_Direction": 309,
      "Wind_Speed_kt": 3.5
    },
    {
      "Pressure_mb": 749.7,
      "Altitude_m": 2615,
      "Temp_c": 4,
      "Dewpoint_c": -15.2,
      "Wind_Direction": 311,
      "Wind_Speed_kt": 3.5
    },
    {
      "Pressure_mb": 749.3,
      "Altitude_m": 2619,
      "Temp_c": 4,
      "Dewpoint_c": -15.3,
      "Wind_Direction": 314,
      "Wind_Speed_kt": 3.5
    },
    {
      "Pressure_mb": 748.9,
      "Altitude_m": 2623,
      "Temp_c": 4,
      "Dewpoint_c": -15.5,
      "Wind_Direction": 316,
      "Wind_Speed_kt": 3.5
    },
    {
      "Pressure_mb": 748.5,
      "Altitude_m": 2628,
      "Temp_c": 4,
      "Dewpoint_c": -15.6,
      "Wind_Direction": 318,
      "Wind_Speed_kt": 3.5
    },
    {
      "Pressure_mb": 748.1,
      "Altitude_m": 2632,
      "Temp_c": 4,
      "Dewpoint_c": -15.7,
      "Wind_Direction": 320,
      "Wind_Speed_kt": 3.5
    },
    {
      "Pressure_mb": 747.7,
      "Altitude_m": 2637,
      "Temp_c": 4,
      "Dewpoint_c": -15.8,
      "Wind_Direction": 322,
      "Wind_Speed_kt": 3.5
    },
    {
      "Pressure_mb": 747.3,
      "Altitude_m": 2641,
      "Temp_c": 4,
      "Dewpoint_c": -16,
      "Wind_Direction": 324,
      "Wind_Speed_kt": 3.6
    },
    {
      "Pressure_mb": 746.9,
      "Altitude_m": 2646,
      "Temp_c": 4,
      "Dewpoint_c": -16.1,
      "Wind_Direction": 326,
      "Wind_Speed_kt": 3.6
    },
    {
      "Pressure_mb": 746.4,
      "Altitude_m": 2651,
      "Temp_c": 4,
      "Dewpoint_c": -16.2,
      "Wind_Direction": 328,
      "Wind_Speed_kt": 3.6
    },
    {
      "Pressure_mb": 746,
      "Altitude_m": 2655,
      "Temp_c": 4,
      "Dewpoint_c": -16.4,
      "Wind_Direction": 327,
      "Wind_Speed_kt": 3.7
    },
    {
      "Pressure_mb": 745.6,
      "Altitude_m": 2660,
      "Temp_c": 4,
      "Dewpoint_c": -16.5,
      "Wind_Direction": 326,
      "Wind_Speed_kt": 3.9
    },
    {
      "Pressure_mb": 745.2,
      "Altitude_m": 2664,
      "Temp_c": 4,
      "Dewpoint_c": -16.6,
      "Wind_Direction": 325,
      "Wind_Speed_kt": 4
    },
    {
      "Pressure_mb": 744.7,
      "Altitude_m": 2669,
      "Temp_c": 4,
      "Dewpoint_c": -16.7,
      "Wind_Direction": 324,
      "Wind_Speed_kt": 4.2
    },
    {
      "Pressure_mb": 744.3,
      "Altitude_m": 2674,
      "Temp_c": 4,
      "Dewpoint_c": -16.8,
      "Wind_Direction": 323,
      "Wind_Speed_kt": 4.3
    },
    {
      "Pressure_mb": 743.9,
      "Altitude_m": 2678,
      "Temp_c": 4,
      "Dewpoint_c": -16.9,
      "Wind_Direction": 322,
      "Wind_Speed_kt": 4.5
    },
    {
      "Pressure_mb": 743.5,
      "Altitude_m": 2683,
      "Temp_c": 4,
      "Dewpoint_c": -17,
      "Wind_Direction": 321,
      "Wind_Speed_kt": 4.6
    },
    {
      "Pressure_mb": 743.1,
      "Altitude_m": 2687,
      "Temp_c": 4,
      "Dewpoint_c": -17.1,
      "Wind_Direction": 321,
      "Wind_Speed_kt": 4.8
    },
    {
      "Pressure_mb": 742.7,
      "Altitude_m": 2692,
      "Temp_c": 4,
      "Dewpoint_c": -17.3,
      "Wind_Direction": 320,
      "Wind_Speed_kt": 4.9
    },
    {
      "Pressure_mb": 742.2,
      "Altitude_m": 2696,
      "Temp_c": 4,
      "Dewpoint_c": -17.4,
      "Wind_Direction": 319,
      "Wind_Speed_kt": 5.1
    },
    {
      "Pressure_mb": 741.8,
      "Altitude_m": 2701,
      "Temp_c": 4,
      "Dewpoint_c": -17.5,
      "Wind_Direction": 319,
      "Wind_Speed_kt": 5.2
    },
    {
      "Pressure_mb": 741.3,
      "Altitude_m": 2706,
      "Temp_c": 4,
      "Dewpoint_c": -17.6,
      "Wind_Direction": 318,
      "Wind_Speed_kt": 5.4
    },
    {
      "Pressure_mb": 740.9,
      "Altitude_m": 2711,
      "Temp_c": 4,
      "Dewpoint_c": -17.7,
      "Wind_Direction": 318,
      "Wind_Speed_kt": 5.5
    },
    {
      "Pressure_mb": 740.4,
      "Altitude_m": 2716,
      "Temp_c": 4,
      "Dewpoint_c": -17.8,
      "Wind_Direction": 317,
      "Wind_Speed_kt": 5.7
    },
    {
      "Pressure_mb": 740,
      "Altitude_m": 2721,
      "Temp_c": 4,
      "Dewpoint_c": -18,
      "Wind_Direction": 317,
      "Wind_Speed_kt": 5.8
    },
    {
      "Pressure_mb": 739.6,
      "Altitude_m": 2726,
      "Temp_c": 4,
      "Dewpoint_c": -18,
      "Wind_Direction": 316,
      "Wind_Speed_kt": 6
    },
    {
      "Pressure_mb": 739.2,
      "Altitude_m": 2731,
      "Temp_c": 4,
      "Dewpoint_c": -18.1,
      "Wind_Direction": 316,
      "Wind_Speed_kt": 6.1
    },
    {
      "Pressure_mb": 738.8,
      "Altitude_m": 2735,
      "Temp_c": 4,
      "Dewpoint_c": -18.2,
      "Wind_Direction": 315,
      "Wind_Speed_kt": 6.3
    },
    {
      "Pressure_mb": 738.4,
      "Altitude_m": 2739,
      "Temp_c": 4,
      "Dewpoint_c": -18.3,
      "Wind_Direction": 315,
      "Wind_Speed_kt": 6.4
    },
    {
      "Pressure_mb": 738.1,
      "Altitude_m": 2743,
      "Temp_c": 4,
      "Dewpoint_c": -18.4,
      "Wind_Direction": 315,
      "Wind_Speed_kt": 6.6
    },
    {
      "Pressure_mb": 737.7,
      "Altitude_m": 2747,
      "Temp_c": 3.9,
      "Dewpoint_c": -18.5,
      "Wind_Direction": 315,
      "Wind_Speed_kt": 6.7
    },
    {
      "Pressure_mb": 737.2,
      "Altitude_m": 2751,
      "Temp_c": 3.9,
      "Dewpoint_c": -18.5,
      "Wind_Direction": 316,
      "Wind_Speed_kt": 6.7
    },
    {
      "Pressure_mb": 736.8,
      "Altitude_m": 2755,
      "Temp_c": 3.9,
      "Dewpoint_c": -18.6,
      "Wind_Direction": 316,
      "Wind_Speed_kt": 6.8
    },
    {
      "Pressure_mb": 736.3,
      "Altitude_m": 2760,
      "Temp_c": 3.9,
      "Dewpoint_c": -18.7,
      "Wind_Direction": 317,
      "Wind_Speed_kt": 6.9
    },
    {
      "Pressure_mb": 735.9,
      "Altitude_m": 2766,
      "Temp_c": 3.9,
      "Dewpoint_c": -18.8,
      "Wind_Direction": 317,
      "Wind_Speed_kt": 6.9
    },
    {
      "Pressure_mb": 735.5,
      "Altitude_m": 2771,
      "Temp_c": 3.9,
      "Dewpoint_c": -18.9,
      "Wind_Direction": 318,
      "Wind_Speed_kt": 7
    },
    {
      "Pressure_mb": 735,
      "Altitude_m": 2776,
      "Temp_c": 3.9,
      "Dewpoint_c": -19,
      "Wind_Direction": 318,
      "Wind_Speed_kt": 7.1
    },
    {
      "Pressure_mb": 734.5,
      "Altitude_m": 2781,
      "Temp_c": 3.9,
      "Dewpoint_c": -19.1,
      "Wind_Direction": 319,
      "Wind_Speed_kt": 7.2
    },
    {
      "Pressure_mb": 734,
      "Altitude_m": 2786,
      "Temp_c": 3.8,
      "Dewpoint_c": -19.2,
      "Wind_Direction": 319,
      "Wind_Speed_kt": 7.2
    },
    {
      "Pressure_mb": 733.5,
      "Altitude_m": 2792,
      "Temp_c": 3.8,
      "Dewpoint_c": -19.2,
      "Wind_Direction": 320,
      "Wind_Speed_kt": 7.3
    },
    {
      "Pressure_mb": 733.2,
      "Altitude_m": 2796,
      "Temp_c": 3.8,
      "Dewpoint_c": -19.2,
      "Wind_Direction": 320,
      "Wind_Speed_kt": 7.4
    },
    {
      "Pressure_mb": 732.4,
      "Altitude_m": 2804,
      "Temp_c": 3.8,
      "Dewpoint_c": -19.3,
      "Wind_Direction": 321,
      "Wind_Speed_kt": 7.5
    },
    {
      "Pressure_mb": 731.9,
      "Altitude_m": 2810,
      "Temp_c": 3.8,
      "Dewpoint_c": -19.3,
      "Wind_Direction": 321,
      "Wind_Speed_kt": 7.5
    },
    {
      "Pressure_mb": 731.4,
      "Altitude_m": 2816,
      "Temp_c": 3.9,
      "Dewpoint_c": -19.4,
      "Wind_Direction": 321,
      "Wind_Speed_kt": 7.6
    },
    {
      "Pressure_mb": 731,
      "Altitude_m": 2821,
      "Temp_c": 3.9,
      "Dewpoint_c": -19.4,
      "Wind_Direction": 322,
      "Wind_Speed_kt": 7.7
    },
    {
      "Pressure_mb": 730.5,
      "Altitude_m": 2826,
      "Temp_c": 3.9,
      "Dewpoint_c": -19.5,
      "Wind_Direction": 322,
      "Wind_Speed_kt": 7.8
    },
    {
      "Pressure_mb": 730,
      "Altitude_m": 2832,
      "Temp_c": 3.9,
      "Dewpoint_c": -19.5,
      "Wind_Direction": 323,
      "Wind_Speed_kt": 7.9
    },
    {
      "Pressure_mb": 729.5,
      "Altitude_m": 2837,
      "Temp_c": 3.9,
      "Dewpoint_c": -19.6,
      "Wind_Direction": 323,
      "Wind_Speed_kt": 7.9
    },
    {
      "Pressure_mb": 729,
      "Altitude_m": 2842,
      "Temp_c": 3.9,
      "Dewpoint_c": -19.6,
      "Wind_Direction": 323,
      "Wind_Speed_kt": 8
    },
    {
      "Pressure_mb": 728.6,
      "Altitude_m": 2847,
      "Temp_c": 3.9,
      "Dewpoint_c": -19.6,
      "Wind_Direction": 324,
      "Wind_Speed_kt": 8.1
    },
    {
      "Pressure_mb": 728.2,
      "Altitude_m": 2851,
      "Temp_c": 3.9,
      "Dewpoint_c": -19.7,
      "Wind_Direction": 324,
      "Wind_Speed_kt": 8.2
    },
    {
      "Pressure_mb": 728,
      "Altitude_m": 2854,
      "Temp_c": 3.9,
      "Dewpoint_c": -19.7,
      "Wind_Direction": 324,
      "Wind_Speed_kt": 8.2
    },
    {
      "Pressure_mb": 727.4,
      "Altitude_m": 2860,
      "Temp_c": 3.9,
      "Dewpoint_c": -19.6,
      "Wind_Direction": 325,
      "Wind_Speed_kt": 8.3
    },
    {
      "Pressure_mb": 727,
      "Altitude_m": 2865,
      "Temp_c": 3.9,
      "Dewpoint_c": -19.6,
      "Wind_Direction": 326,
      "Wind_Speed_kt": 8.3
    },
    {
      "Pressure_mb": 726.6,
      "Altitude_m": 2869,
      "Temp_c": 3.9,
      "Dewpoint_c": -19.5,
      "Wind_Direction": 326,
      "Wind_Speed_kt": 8.4
    },
    {
      "Pressure_mb": 726.2,
      "Altitude_m": 2874,
      "Temp_c": 3.9,
      "Dewpoint_c": -19.5,
      "Wind_Direction": 326,
      "Wind_Speed_kt": 8.4
    },
    {
      "Pressure_mb": 725.8,
      "Altitude_m": 2879,
      "Temp_c": 3.9,
      "Dewpoint_c": -19.4,
      "Wind_Direction": 327,
      "Wind_Speed_kt": 8.5
    },
    {
      "Pressure_mb": 725.3,
      "Altitude_m": 2883,
      "Temp_c": 3.9,
      "Dewpoint_c": -19.4,
      "Wind_Direction": 327,
      "Wind_Speed_kt": 8.5
    },
    {
      "Pressure_mb": 724.9,
      "Altitude_m": 2888,
      "Temp_c": 3.9,
      "Dewpoint_c": -19.4,
      "Wind_Direction": 328,
      "Wind_Speed_kt": 8.6
    },
    {
      "Pressure_mb": 724.5,
      "Altitude_m": 2893,
      "Temp_c": 3.9,
      "Dewpoint_c": -19.3,
      "Wind_Direction": 328,
      "Wind_Speed_kt": 8.6
    },
    {
      "Pressure_mb": 724.1,
      "Altitude_m": 2898,
      "Temp_c": 3.9,
      "Dewpoint_c": -19.3,
      "Wind_Direction": 328,
      "Wind_Speed_kt": 8.7
    },
    {
      "Pressure_mb": 723.6,
      "Altitude_m": 2903,
      "Temp_c": 3.9,
      "Dewpoint_c": -19.2,
      "Wind_Direction": 329,
      "Wind_Speed_kt": 8.8
    },
    {
      "Pressure_mb": 723.2,
      "Altitude_m": 2908,
      "Temp_c": 3.9,
      "Dewpoint_c": -19.2,
      "Wind_Direction": 329,
      "Wind_Speed_kt": 8.8
    },
    {
      "Pressure_mb": 722.7,
      "Altitude_m": 2913,
      "Temp_c": 3.8,
      "Dewpoint_c": -19.2,
      "Wind_Direction": 330,
      "Wind_Speed_kt": 8.9
    },
    {
      "Pressure_mb": 722.2,
      "Altitude_m": 2919,
      "Temp_c": 3.8,
      "Dewpoint_c": -19.1,
      "Wind_Direction": 330,
      "Wind_Speed_kt": 8.9
    },
    {
      "Pressure_mb": 721.8,
      "Altitude_m": 2924,
      "Temp_c": 3.8,
      "Dewpoint_c": -19,
      "Wind_Direction": 330,
      "Wind_Speed_kt": 9
    },
    {
      "Pressure_mb": 721.3,
      "Altitude_m": 2928,
      "Temp_c": 3.8,
      "Dewpoint_c": -18.9,
      "Wind_Direction": 331,
      "Wind_Speed_kt": 9
    },
    {
      "Pressure_mb": 720.9,
      "Altitude_m": 2933,
      "Temp_c": 3.8,
      "Dewpoint_c": -18.9,
      "Wind_Direction": 331,
      "Wind_Speed_kt": 9.1
    },
    {
      "Pressure_mb": 720.5,
      "Altitude_m": 2937,
      "Temp_c": 3.8,
      "Dewpoint_c": -18.8,
      "Wind_Direction": 331,
      "Wind_Speed_kt": 9.2
    },
    {
      "Pressure_mb": 720.1,
      "Altitude_m": 2942,
      "Temp_c": 3.8,
      "Dewpoint_c": -18.7,
      "Wind_Direction": 332,
      "Wind_Speed_kt": 9.2
    },
    {
      "Pressure_mb": 719.6,
      "Altitude_m": 2947,
      "Temp_c": 3.7,
      "Dewpoint_c": -18.6,
      "Wind_Direction": 332,
      "Wind_Speed_kt": 9.3
    },
    {
      "Pressure_mb": 719.2,
      "Altitude_m": 2952,
      "Temp_c": 3.7,
      "Dewpoint_c": -18.6,
      "Wind_Direction": 332,
      "Wind_Speed_kt": 9.4
    },
    {
      "Pressure_mb": 718.8,
      "Altitude_m": 2957,
      "Temp_c": 3.7,
      "Dewpoint_c": -18.5,
      "Wind_Direction": 332,
      "Wind_Speed_kt": 9.4
    },
    {
      "Pressure_mb": 718.3,
      "Altitude_m": 2962,
      "Temp_c": 3.7,
      "Dewpoint_c": -18.4,
      "Wind_Direction": 333,
      "Wind_Speed_kt": 9.5
    },
    {
      "Pressure_mb": 717.8,
      "Altitude_m": 2968,
      "Temp_c": 3.7,
      "Dewpoint_c": -18.3,
      "Wind_Direction": 333,
      "Wind_Speed_kt": 9.6
    },
    {
      "Pressure_mb": 717.4,
      "Altitude_m": 2973,
      "Temp_c": 3.6,
      "Dewpoint_c": -18.3,
      "Wind_Direction": 333,
      "Wind_Speed_kt": 9.6
    },
    {
      "Pressure_mb": 716.9,
      "Altitude_m": 2978,
      "Temp_c": 3.6,
      "Dewpoint_c": -18.2,
      "Wind_Direction": 333,
      "Wind_Speed_kt": 9.7
    },
    {
      "Pressure_mb": 716.4,
      "Altitude_m": 2984,
      "Temp_c": 3.6,
      "Dewpoint_c": -18.1,
      "Wind_Direction": 333,
      "Wind_Speed_kt": 9.8
    },
    {
      "Pressure_mb": 716,
      "Altitude_m": 2989,
      "Temp_c": 3.6,
      "Dewpoint_c": -18,
      "Wind_Direction": 334,
      "Wind_Speed_kt": 9.8
    },
    {
      "Pressure_mb": 715.5,
      "Altitude_m": 2994,
      "Temp_c": 3.5,
      "Dewpoint_c": -17.9,
      "Wind_Direction": 334,
      "Wind_Speed_kt": 9.9
    },
    {
      "Pressure_mb": 715.1,
      "Altitude_m": 2998,
      "Temp_c": 3.5,
      "Dewpoint_c": -17.8,
      "Wind_Direction": 334,
      "Wind_Speed_kt": 0
    },
    {
      "Pressure_mb": 714.7,
      "Altitude_m": 3003,
      "Temp_c": 3.5,
      "Dewpoint_c": -17.7,
      "Wind_Direction": 334,
      "Wind_Speed_kt": 0
    },
    {
      "Pressure_mb": 714.3,
      "Altitude_m": 3008,
      "Temp_c": 3.5,
      "Dewpoint_c": -17.6,
      "Wind_Direction": 334,
      "Wind_Speed_kt": 0.1
    },
    {
      "Pressure_mb": 713.9,
      "Altitude_m": 3012,
      "Temp_c": 3.4,
      "Dewpoint_c": -17.6,
      "Wind_Direction": 335,
      "Wind_Speed_kt": 0.2
    },
    {
      "Pressure_mb": 713.5,
      "Altitude_m": 3017,
      "Temp_c": 3.4,
      "Dewpoint_c": -17.5,
      "Wind_Direction": 335,
      "Wind_Speed_kt": 0.2
    },
    {
      "Pressure_mb": 713.1,
      "Altitude_m": 3021,
      "Temp_c": 3.4,
      "Dewpoint_c": -17.4,
      "Wind_Direction": 335,
      "Wind_Speed_kt": 0.3
    },
    {
      "Pressure_mb": 712.7,
      "Altitude_m": 3026,
      "Temp_c": 3.3,
      "Dewpoint_c": -17.3,
      "Wind_Direction": 335,
      "Wind_Speed_kt": 0.4
    },
    {
      "Pressure_mb": 712.3,
      "Altitude_m": 3030,
      "Temp_c": 3.3,
      "Dewpoint_c": -17.2,
      "Wind_Direction": 335,
      "Wind_Speed_kt": 0.4
    },
    {
      "Pressure_mb": 711.9,
      "Altitude_m": 3034,
      "Temp_c": 3.3,
      "Dewpoint_c": -17.1,
      "Wind_Direction": 335,
      "Wind_Speed_kt": 0.5
    },
    {
      "Pressure_mb": 711.5,
      "Altitude_m": 3039,
      "Temp_c": 3.2,
      "Dewpoint_c": -17,
      "Wind_Direction": 336,
      "Wind_Speed_kt": 0.6
    },
    {
      "Pressure_mb": 711.1,
      "Altitude_m": 3044,
      "Temp_c": 3.2,
      "Dewpoint_c": -16.9,
      "Wind_Direction": 336,
      "Wind_Speed_kt": 0.7
    },
    {
      "Pressure_mb": 710.7,
      "Altitude_m": 3048,
      "Temp_c": 3.2,
      "Dewpoint_c": -16.9,
      "Wind_Direction": 336,
      "Wind_Speed_kt": 0.7
    },
    {
      "Pressure_mb": 710.3,
      "Altitude_m": 3054,
      "Temp_c": 3.2,
      "Dewpoint_c": -16.9,
      "Wind_Direction": 336,
      "Wind_Speed_kt": 0.8
    },
    {
      "Pressure_mb": 709.8,
      "Altitude_m": 3059,
      "Temp_c": 3.1,
      "Dewpoint_c": -16.9,
      "Wind_Direction": 336,
      "Wind_Speed_kt": 0.9
    },
    {
      "Pressure_mb": 709.4,
      "Altitude_m": 3064,
      "Temp_c": 3.1,
      "Dewpoint_c": -17,
      "Wind_Direction": 336,
      "Wind_Speed_kt": 1
    },
    {
      "Pressure_mb": 708.9,
      "Altitude_m": 3069,
      "Temp_c": 3.1,
      "Dewpoint_c": -17,
      "Wind_Direction": 337,
      "Wind_Speed_kt": 1.1
    },
    {
      "Pressure_mb": 708.5,
      "Altitude_m": 3074,
      "Temp_c": 3,
      "Dewpoint_c": -17,
      "Wind_Direction": 337,
      "Wind_Speed_kt": 1.2
    },
    {
      "Pressure_mb": 708.1,
      "Altitude_m": 3078,
      "Temp_c": 3,
      "Dewpoint_c": -17,
      "Wind_Direction": 337,
      "Wind_Speed_kt": 1.3
    },
    {
      "Pressure_mb": 707.7,
      "Altitude_m": 3083,
      "Temp_c": 3,
      "Dewpoint_c": -17,
      "Wind_Direction": 337,
      "Wind_Speed_kt": 1.4
    },
    {
      "Pressure_mb": 707.3,
      "Altitude_m": 3087,
      "Temp_c": 3,
      "Dewpoint_c": -17.1,
      "Wind_Direction": 337,
      "Wind_Speed_kt": 1.5
    },
    {
      "Pressure_mb": 706.9,
      "Altitude_m": 3092,
      "Temp_c": 2.9,
      "Dewpoint_c": -17.1,
      "Wind_Direction": 337,
      "Wind_Speed_kt": 1.6
    },
    {
      "Pressure_mb": 706.6,
      "Altitude_m": 3096,
      "Temp_c": 2.9,
      "Dewpoint_c": -17.1,
      "Wind_Direction": 338,
      "Wind_Speed_kt": 1.7
    },
    {
      "Pressure_mb": 706.2,
      "Altitude_m": 3100,
      "Temp_c": 2.9,
      "Dewpoint_c": -17.1,
      "Wind_Direction": 338,
      "Wind_Speed_kt": 1.8
    },
    {
      "Pressure_mb": 705.8,
      "Altitude_m": 3105,
      "Temp_c": 2.9,
      "Dewpoint_c": -17.2,
      "Wind_Direction": 338,
      "Wind_Speed_kt": 1.9
    },
    {
      "Pressure_mb": 705.4,
      "Altitude_m": 3109,
      "Temp_c": 2.8,
      "Dewpoint_c": -17.2,
      "Wind_Direction": 338,
      "Wind_Speed_kt": 2
    },
    {
      "Pressure_mb": 705,
      "Altitude_m": 3113,
      "Temp_c": 2.8,
      "Dewpoint_c": -17.2,
      "Wind_Direction": 338,
      "Wind_Speed_kt": 2.1
    },
    {
      "Pressure_mb": 704.6,
      "Altitude_m": 3118,
      "Temp_c": 2.8,
      "Dewpoint_c": -17.3,
      "Wind_Direction": 338,
      "Wind_Speed_kt": 2.1
    },
    {
      "Pressure_mb": 704.2,
      "Altitude_m": 3122,
      "Temp_c": 2.8,
      "Dewpoint_c": -17.4,
      "Wind_Direction": 338,
      "Wind_Speed_kt": 2.2
    },
    {
      "Pressure_mb": 703.8,
      "Altitude_m": 3127,
      "Temp_c": 2.8,
      "Dewpoint_c": -17.5,
      "Wind_Direction": 339,
      "Wind_Speed_kt": 2.3
    },
    {
      "Pressure_mb": 703.4,
      "Altitude_m": 3132,
      "Temp_c": 2.8,
      "Dewpoint_c": -17.6,
      "Wind_Direction": 339,
      "Wind_Speed_kt": 2.4
    },
    {
      "Pressure_mb": 702.9,
      "Altitude_m": 3138,
      "Temp_c": 2.8,
      "Dewpoint_c": -17.6,
      "Wind_Direction": 338,
      "Wind_Speed_kt": 2.5
    },
    {
      "Pressure_mb": 702.5,
      "Altitude_m": 3143,
      "Temp_c": 2.7,
      "Dewpoint_c": -17.7,
      "Wind_Direction": 338,
      "Wind_Speed_kt": 2.5
    },
    {
      "Pressure_mb": 702,
      "Altitude_m": 3148,
      "Temp_c": 2.7,
      "Dewpoint_c": -17.8,
      "Wind_Direction": 338,
      "Wind_Speed_kt": 2.6
    },
    {
      "Pressure_mb": 701.5,
      "Altitude_m": 3154,
      "Temp_c": 2.7,
      "Dewpoint_c": -17.8,
      "Wind_Direction": 338,
      "Wind_Speed_kt": 2.6
    },
    {
      "Pressure_mb": 701.1,
      "Altitude_m": 3159,
      "Temp_c": 2.7,
      "Dewpoint_c": -17.9,
      "Wind_Direction": 337,
      "Wind_Speed_kt": 2.6
    },
    {
      "Pressure_mb": 700.7,
      "Altitude_m": 3164,
      "Temp_c": 2.7,
      "Dewpoint_c": -18,
      "Wind_Direction": 337,
      "Wind_Speed_kt": 2.7
    },
    {
      "Pressure_mb": 700.2,
      "Altitude_m": 3169,
      "Temp_c": 2.7,
      "Dewpoint_c": -18.1,
      "Wind_Direction": 337,
      "Wind_Speed_kt": 2.7
    },
    {
      "Pressure_mb": 700,
      "Altitude_m": 3171,
      "Temp_c": 2.7,
      "Dewpoint_c": -18.1,
      "Wind_Direction": 337,
      "Wind_Speed_kt": 2.8
    },
    {
      "Pressure_mb": 699.4,
      "Altitude_m": 3178,
      "Temp_c": 2.7,
      "Dewpoint_c": -18.2,
      "Wind_Direction": 336,
      "Wind_Speed_kt": 2.8
    },
    {
      "Pressure_mb": 698.9,
      "Altitude_m": 3183,
      "Temp_c": 2.7,
      "Dewpoint_c": -18.4,
      "Wind_Direction": 336,
      "Wind_Speed_kt": 2.9
    },
    {
      "Pressure_mb": 698.4,
      "Altitude_m": 3190,
      "Temp_c": 2.7,
      "Dewpoint_c": -18.6,
      "Wind_Direction": 336,
      "Wind_Speed_kt": 2.9
    },
    {
      "Pressure_mb": 698,
      "Altitude_m": 3194,
      "Temp_c": 2.7,
      "Dewpoint_c": -18.7,
      "Wind_Direction": 336,
      "Wind_Speed_kt": 3
    },
    {
      "Pressure_mb": 697.6,
      "Altitude_m": 3199,
      "Temp_c": 2.7,
      "Dewpoint_c": -18.8,
      "Wind_Direction": 335,
      "Wind_Speed_kt": 3
    },
    {
      "Pressure_mb": 697.1,
      "Altitude_m": 3205,
      "Temp_c": 2.7,
      "Dewpoint_c": -19,
      "Wind_Direction": 335,
      "Wind_Speed_kt": 3
    },
    {
      "Pressure_mb": 696.7,
      "Altitude_m": 3210,
      "Temp_c": 2.7,
      "Dewpoint_c": -19.2,
      "Wind_Direction": 335,
      "Wind_Speed_kt": 3.1
    },
    {
      "Pressure_mb": 696.2,
      "Altitude_m": 3216,
      "Temp_c": 2.7,
      "Dewpoint_c": -19.3,
      "Wind_Direction": 335,
      "Wind_Speed_kt": 3.1
    },
    {
      "Pressure_mb": 695.7,
      "Altitude_m": 3221,
      "Temp_c": 2.8,
      "Dewpoint_c": -19.5,
      "Wind_Direction": 334,
      "Wind_Speed_kt": 3.2
    },
    {
      "Pressure_mb": 695.3,
      "Altitude_m": 3225,
      "Temp_c": 2.8,
      "Dewpoint_c": -19.6,
      "Wind_Direction": 334,
      "Wind_Speed_kt": 3.2
    },
    {
      "Pressure_mb": 694.9,
      "Altitude_m": 3230,
      "Temp_c": 2.8,
      "Dewpoint_c": -19.8,
      "Wind_Direction": 334,
      "Wind_Speed_kt": 3.3
    },
    {
      "Pressure_mb": 694.5,
      "Altitude_m": 3235,
      "Temp_c": 2.8,
      "Dewpoint_c": -20,
      "Wind_Direction": 334,
      "Wind_Speed_kt": 3.3
    },
    {
      "Pressure_mb": 694.1,
      "Altitude_m": 3240,
      "Temp_c": 2.8,
      "Dewpoint_c": -20.1,
      "Wind_Direction": 333,
      "Wind_Speed_kt": 3.3
    },
    {
      "Pressure_mb": 693.6,
      "Altitude_m": 3246,
      "Temp_c": 2.8,
      "Dewpoint_c": -20.3,
      "Wind_Direction": 333,
      "Wind_Speed_kt": 3.4
    },
    {
      "Pressure_mb": 693.3,
      "Altitude_m": 3249,
      "Temp_c": 2.8,
      "Dewpoint_c": -20.3,
      "Wind_Direction": 333,
      "Wind_Speed_kt": 3.4
    },
    {
      "Pressure_mb": 692.9,
      "Altitude_m": 3254,
      "Temp_c": 2.8,
      "Dewpoint_c": -20.3,
      "Wind_Direction": 332,
      "Wind_Speed_kt": 3.4
    },
    {
      "Pressure_mb": 692.6,
      "Altitude_m": 3257,
      "Temp_c": 2.8,
      "Dewpoint_c": -20.2,
      "Wind_Direction": 332,
      "Wind_Speed_kt": 3.4
    },
    {
      "Pressure_mb": 692,
      "Altitude_m": 3263,
      "Temp_c": 2.8,
      "Dewpoint_c": -20.2,
      "Wind_Direction": 331,
      "Wind_Speed_kt": 3.5
    },
    {
      "Pressure_mb": 691.6,
      "Altitude_m": 3268,
      "Temp_c": 2.8,
      "Dewpoint_c": -20.2,
      "Wind_Direction": 331,
      "Wind_Speed_kt": 3.5
    },
    {
      "Pressure_mb": 691.2,
      "Altitude_m": 3273,
      "Temp_c": 2.7,
      "Dewpoint_c": -20.2,
      "Wind_Direction": 331,
      "Wind_Speed_kt": 3.5
    },
    {
      "Pressure_mb": 690.8,
      "Altitude_m": 3278,
      "Temp_c": 2.7,
      "Dewpoint_c": -20.2,
      "Wind_Direction": 330,
      "Wind_Speed_kt": 3.6
    },
    {
      "Pressure_mb": 690.4,
      "Altitude_m": 3283,
      "Temp_c": 2.7,
      "Dewpoint_c": -20.1,
      "Wind_Direction": 330,
      "Wind_Speed_kt": 3.6
    },
    {
      "Pressure_mb": 690,
      "Altitude_m": 3288,
      "Temp_c": 2.6,
      "Dewpoint_c": -20.1,
      "Wind_Direction": 330,
      "Wind_Speed_kt": 3.6
    },
    {
      "Pressure_mb": 689.6,
      "Altitude_m": 3293,
      "Temp_c": 2.6,
      "Dewpoint_c": -20.1,
      "Wind_Direction": 329,
      "Wind_Speed_kt": 3.7
    },
    {
      "Pressure_mb": 689.1,
      "Altitude_m": 3297,
      "Temp_c": 2.6,
      "Dewpoint_c": -20.1,
      "Wind_Direction": 329,
      "Wind_Speed_kt": 3.7
    },
    {
      "Pressure_mb": 688.7,
      "Altitude_m": 3302,
      "Temp_c": 2.5,
      "Dewpoint_c": -20.1,
      "Wind_Direction": 329,
      "Wind_Speed_kt": 3.7
    },
    {
      "Pressure_mb": 688.3,
      "Altitude_m": 3307,
      "Temp_c": 2.5,
      "Dewpoint_c": -20.1,
      "Wind_Direction": 328,
      "Wind_Speed_kt": 3.8
    },
    {
      "Pressure_mb": 687.9,
      "Altitude_m": 3312,
      "Temp_c": 2.5,
      "Dewpoint_c": -20.1,
      "Wind_Direction": 328,
      "Wind_Speed_kt": 3.8
    },
    {
      "Pressure_mb": 687.5,
      "Altitude_m": 3317,
      "Temp_c": 2.4,
      "Dewpoint_c": -20.1,
      "Wind_Direction": 327,
      "Wind_Speed_kt": 3.8
    },
    {
      "Pressure_mb": 687.1,
      "Altitude_m": 3322,
      "Temp_c": 2.4,
      "Dewpoint_c": -20.1,
      "Wind_Direction": 327,
      "Wind_Speed_kt": 3.9
    },
    {
      "Pressure_mb": 686.7,
      "Altitude_m": 3327,
      "Temp_c": 2.4,
      "Dewpoint_c": -20.1,
      "Wind_Direction": 327,
      "Wind_Speed_kt": 3.9
    },
    {
      "Pressure_mb": 686.4,
      "Altitude_m": 3331,
      "Temp_c": 2.3,
      "Dewpoint_c": -20.2,
      "Wind_Direction": 326,
      "Wind_Speed_kt": 4
    },
    {
      "Pressure_mb": 686,
      "Altitude_m": 3335,
      "Temp_c": 2.3,
      "Dewpoint_c": -20.2,
      "Wind_Direction": 326,
      "Wind_Speed_kt": 4
    },
    {
      "Pressure_mb": 685.6,
      "Altitude_m": 3339,
      "Temp_c": 2.3,
      "Dewpoint_c": -20.2,
      "Wind_Direction": 326,
      "Wind_Speed_kt": 4
    },
    {
      "Pressure_mb": 685.2,
      "Altitude_m": 3343,
      "Temp_c": 2.2,
      "Dewpoint_c": -20.2,
      "Wind_Direction": 326,
      "Wind_Speed_kt": 4.1
    },
    {
      "Pressure_mb": 684.9,
      "Altitude_m": 3347,
      "Temp_c": 2.2,
      "Dewpoint_c": -20.3,
      "Wind_Direction": 326,
      "Wind_Speed_kt": 4.1
    },
    {
      "Pressure_mb": 684.5,
      "Altitude_m": 3352,
      "Temp_c": 2.2,
      "Dewpoint_c": -20.3,
      "Wind_Direction": 326,
      "Wind_Speed_kt": 4.2
    },
    {
      "Pressure_mb": 684.2,
      "Altitude_m": 3356,
      "Temp_c": 2.2,
      "Dewpoint_c": -20.3,
      "Wind_Direction": 325,
      "Wind_Speed_kt": 4.2
    },
    {
      "Pressure_mb": 683.8,
      "Altitude_m": 3360,
      "Temp_c": 2.1,
      "Dewpoint_c": -20.3,
      "Wind_Direction": 325,
      "Wind_Speed_kt": 4.3
    },
    {
      "Pressure_mb": 683.4,
      "Altitude_m": 3365,
      "Temp_c": 2.1,
      "Dewpoint_c": -20.3,
      "Wind_Direction": 325,
      "Wind_Speed_kt": 4.3
    },
    {
      "Pressure_mb": 683,
      "Altitude_m": 3369,
      "Temp_c": 2.1,
      "Dewpoint_c": -20.4,
      "Wind_Direction": 325,
      "Wind_Speed_kt": 4.4
    },
    {
      "Pressure_mb": 682.6,
      "Altitude_m": 3374,
      "Temp_c": 2,
      "Dewpoint_c": -20.4,
      "Wind_Direction": 325,
      "Wind_Speed_kt": 4.4
    },
    {
      "Pressure_mb": 682.2,
      "Altitude_m": 3378,
      "Temp_c": 2,
      "Dewpoint_c": -20.4,
      "Wind_Direction": 325,
      "Wind_Speed_kt": 4.5
    },
    {
      "Pressure_mb": 681.8,
      "Altitude_m": 3383,
      "Temp_c": 2,
      "Dewpoint_c": -20.5,
      "Wind_Direction": 324,
      "Wind_Speed_kt": 4.5
    },
    {
      "Pressure_mb": 681.4,
      "Altitude_m": 3388,
      "Temp_c": 1.9,
      "Dewpoint_c": -20.5,
      "Wind_Direction": 324,
      "Wind_Speed_kt": 4.6
    },
    {
      "Pressure_mb": 681,
      "Altitude_m": 3393,
      "Temp_c": 1.9,
      "Dewpoint_c": -20.6,
      "Wind_Direction": 324,
      "Wind_Speed_kt": 4.6
    },
    {
      "Pressure_mb": 680.6,
      "Altitude_m": 3398,
      "Temp_c": 1.9,
      "Dewpoint_c": -20.6,
      "Wind_Direction": 324,
      "Wind_Speed_kt": 4.7
    },
    {
      "Pressure_mb": 680.2,
      "Altitude_m": 3404,
      "Temp_c": 1.9,
      "Dewpoint_c": -20.6,
      "Wind_Direction": 324,
      "Wind_Speed_kt": 4.7
    },
    {
      "Pressure_mb": 679.8,
      "Altitude_m": 3409,
      "Temp_c": 1.8,
      "Dewpoint_c": -20.7,
      "Wind_Direction": 324,
      "Wind_Speed_kt": 4.8
    },
    {
      "Pressure_mb": 679.4,
      "Altitude_m": 3413,
      "Temp_c": 1.8,
      "Dewpoint_c": -20.7,
      "Wind_Direction": 323,
      "Wind_Speed_kt": 4.8
    },
    {
      "Pressure_mb": 679,
      "Altitude_m": 3417,
      "Temp_c": 1.8,
      "Dewpoint_c": -20.7,
      "Wind_Direction": 323,
      "Wind_Speed_kt": 4.9
    },
    {
      "Pressure_mb": 678.7,
      "Altitude_m": 3421,
      "Temp_c": 1.8,
      "Dewpoint_c": -20.8,
      "Wind_Direction": 323,
      "Wind_Speed_kt": 4.9
    },
    {
      "Pressure_mb": 678.3,
      "Altitude_m": 3426,
      "Temp_c": 1.8,
      "Dewpoint_c": -20.8,
      "Wind_Direction": 323,
      "Wind_Speed_kt": 4.9
    },
    {
      "Pressure_mb": 677.9,
      "Altitude_m": 3430,
      "Temp_c": 1.7,
      "Dewpoint_c": -20.8,
      "Wind_Direction": 323,
      "Wind_Speed_kt": 5
    },
    {
      "Pressure_mb": 677.6,
      "Altitude_m": 3434,
      "Temp_c": 1.7,
      "Dewpoint_c": -20.9,
      "Wind_Direction": 322,
      "Wind_Speed_kt": 5
    },
    {
      "Pressure_mb": 677.2,
      "Altitude_m": 3438,
      "Temp_c": 1.7,
      "Dewpoint_c": -20.8,
      "Wind_Direction": 322,
      "Wind_Speed_kt": 5
    },
    {
      "Pressure_mb": 676.9,
      "Altitude_m": 3442,
      "Temp_c": 1.7,
      "Dewpoint_c": -20.8,
      "Wind_Direction": 322,
      "Wind_Speed_kt": 5.1
    },
    {
      "Pressure_mb": 676.5,
      "Altitude_m": 3447,
      "Temp_c": 1.6,
      "Dewpoint_c": -20.8,
      "Wind_Direction": 322,
      "Wind_Speed_kt": 5.1
    },
    {
      "Pressure_mb": 676.1,
      "Altitude_m": 3451,
      "Temp_c": 1.6,
      "Dewpoint_c": -20.8,
      "Wind_Direction": 321,
      "Wind_Speed_kt": 5.1
    },
    {
      "Pressure_mb": 675.7,
      "Altitude_m": 3455,
      "Temp_c": 1.6,
      "Dewpoint_c": -20.8,
      "Wind_Direction": 321,
      "Wind_Speed_kt": 5.2
    },
    {
      "Pressure_mb": 675.4,
      "Altitude_m": 3459,
      "Temp_c": 1.5,
      "Dewpoint_c": -20.8,
      "Wind_Direction": 321,
      "Wind_Speed_kt": 5.2
    },
    {
      "Pressure_mb": 675,
      "Altitude_m": 3464,
      "Temp_c": 1.5,
      "Dewpoint_c": -20.8,
      "Wind_Direction": 321,
      "Wind_Speed_kt": 5.2
    },
    {
      "Pressure_mb": 674.6,
      "Altitude_m": 3469,
      "Temp_c": 1.5,
      "Dewpoint_c": -20.8,
      "Wind_Direction": 320,
      "Wind_Speed_kt": 5.3
    },
    {
      "Pressure_mb": 674.2,
      "Altitude_m": 3474,
      "Temp_c": 1.4,
      "Dewpoint_c": -20.7,
      "Wind_Direction": 320,
      "Wind_Speed_kt": 5.3
    },
    {
      "Pressure_mb": 673.8,
      "Altitude_m": 3479,
      "Temp_c": 1.4,
      "Dewpoint_c": -20.7,
      "Wind_Direction": 320,
      "Wind_Speed_kt": 5.3
    },
    {
      "Pressure_mb": 673.4,
      "Altitude_m": 3484,
      "Temp_c": 1.4,
      "Dewpoint_c": -20.7,
      "Wind_Direction": 320,
      "Wind_Speed_kt": 5.4
    },
    {
      "Pressure_mb": 672.9,
      "Altitude_m": 3489,
      "Temp_c": 1.4,
      "Dewpoint_c": -20.7,
      "Wind_Direction": 319,
      "Wind_Speed_kt": 5.4
    },
    {
      "Pressure_mb": 672.5,
      "Altitude_m": 3494,
      "Temp_c": 1.3,
      "Dewpoint_c": -20.7,
      "Wind_Direction": 319,
      "Wind_Speed_kt": 5.4
    },
    {
      "Pressure_mb": 672.1,
      "Altitude_m": 3499,
      "Temp_c": 1.3,
      "Dewpoint_c": -20.7,
      "Wind_Direction": 319,
      "Wind_Speed_kt": 5.5
    },
    {
      "Pressure_mb": 671.7,
      "Altitude_m": 3504,
      "Temp_c": 1.3,
      "Dewpoint_c": -20.7,
      "Wind_Direction": 319,
      "Wind_Speed_kt": 5.5
    },
    {
      "Pressure_mb": 671.3,
      "Altitude_m": 3509,
      "Temp_c": 1.2,
      "Dewpoint_c": -20.6,
      "Wind_Direction": 318,
      "Wind_Speed_kt": 5.6
    },
    {
      "Pressure_mb": 670.9,
      "Altitude_m": 3514,
      "Temp_c": 1.2,
      "Dewpoint_c": -20.6,
      "Wind_Direction": 318,
      "Wind_Speed_kt": 5.6
    },
    {
      "Pressure_mb": 670.5,
      "Altitude_m": 3519,
      "Temp_c": 1.1,
      "Dewpoint_c": -20.6,
      "Wind_Direction": 318,
      "Wind_Speed_kt": 5.6
    },
    {
      "Pressure_mb": 670,
      "Altitude_m": 3524,
      "Temp_c": 1.1,
      "Dewpoint_c": -20.6,
      "Wind_Direction": 318,
      "Wind_Speed_kt": 5.5
    },
    {
      "Pressure_mb": 669.6,
      "Altitude_m": 3529,
      "Temp_c": 1.1,
      "Dewpoint_c": -20.6,
      "Wind_Direction": 318,
      "Wind_Speed_kt": 5.5
    },
    {
      "Pressure_mb": 669.2,
      "Altitude_m": 3534,
      "Temp_c": 1,
      "Dewpoint_c": -20.6,
      "Wind_Direction": 318,
      "Wind_Speed_kt": 5.5
    },
    {
      "Pressure_mb": 668.8,
      "Altitude_m": 3539,
      "Temp_c": 1,
      "Dewpoint_c": -20.6,
      "Wind_Direction": 318,
      "Wind_Speed_kt": 5.5
    },
    {
      "Pressure_mb": 668.5,
      "Altitude_m": 3543,
      "Temp_c": 0.9,
      "Dewpoint_c": -20.5,
      "Wind_Direction": 318,
      "Wind_Speed_kt": 5.4
    },
    {
      "Pressure_mb": 668.1,
      "Altitude_m": 3548,
      "Temp_c": 0.9,
      "Dewpoint_c": -20.5,
      "Wind_Direction": 317,
      "Wind_Speed_kt": 5.4
    },
    {
      "Pressure_mb": 667.7,
      "Altitude_m": 3553,
      "Temp_c": 0.9,
      "Dewpoint_c": -20.5,
      "Wind_Direction": 317,
      "Wind_Speed_kt": 5.4
    },
    {
      "Pressure_mb": 667.1,
      "Altitude_m": 3559,
      "Temp_c": 0.8,
      "Dewpoint_c": -20.5,
      "Wind_Direction": 317,
      "Wind_Speed_kt": 5.3
    },
    {
      "Pressure_mb": 666.9,
      "Altitude_m": 3562,
      "Temp_c": 0.8,
      "Dewpoint_c": -20.5,
      "Wind_Direction": 317,
      "Wind_Speed_kt": 5.3
    },
    {
      "Pressure_mb": 666.5,
      "Altitude_m": 3566,
      "Temp_c": 0.7,
      "Dewpoint_c": -20.6,
      "Wind_Direction": 317,
      "Wind_Speed_kt": 5.3
    },
    {
      "Pressure_mb": 666.1,
      "Altitude_m": 3571,
      "Temp_c": 0.7,
      "Dewpoint_c": -20.6,
      "Wind_Direction": 317,
      "Wind_Speed_kt": 5.3
    },
    {
      "Pressure_mb": 665.7,
      "Altitude_m": 3576,
      "Temp_c": 0.7,
      "Dewpoint_c": -20.7,
      "Wind_Direction": 317,
      "Wind_Speed_kt": 5.2
    },
    {
      "Pressure_mb": 665.3,
      "Altitude_m": 3581,
      "Temp_c": 0.6,
      "Dewpoint_c": -20.7,
      "Wind_Direction": 317,
      "Wind_Speed_kt": 5.2
    },
    {
      "Pressure_mb": 664.9,
      "Altitude_m": 3586,
      "Temp_c": 0.6,
      "Dewpoint_c": -20.8,
      "Wind_Direction": 317,
      "Wind_Speed_kt": 5.2
    },
    {
      "Pressure_mb": 664.5,
      "Altitude_m": 3591,
      "Temp_c": 0.5,
      "Dewpoint_c": -20.8,
      "Wind_Direction": 317,
      "Wind_Speed_kt": 5.2
    },
    {
      "Pressure_mb": 664,
      "Altitude_m": 3596,
      "Temp_c": 0.5,
      "Dewpoint_c": -20.8,
      "Wind_Direction": 316,
      "Wind_Speed_kt": 5.1
    },
    {
      "Pressure_mb": 663.6,
      "Altitude_m": 3601,
      "Temp_c": 0.4,
      "Dewpoint_c": -20.9,
      "Wind_Direction": 316,
      "Wind_Speed_kt": 5.1
    },
    {
      "Pressure_mb": 663.2,
      "Altitude_m": 3606,
      "Temp_c": 0.4,
      "Dewpoint_c": -20.9,
      "Wind_Direction": 316,
      "Wind_Speed_kt": 5.1
    },
    {
      "Pressure_mb": 662.8,
      "Altitude_m": 3611,
      "Temp_c": 0.4,
      "Dewpoint_c": -21,
      "Wind_Direction": 316,
      "Wind_Speed_kt": 5.1
    },
    {
      "Pressure_mb": 662.3,
      "Altitude_m": 3617,
      "Temp_c": 0.3,
      "Dewpoint_c": -21,
      "Wind_Direction": 316,
      "Wind_Speed_kt": 5
    },
    {
      "Pressure_mb": 661.9,
      "Altitude_m": 3622,
      "Temp_c": 0.3,
      "Dewpoint_c": -21.1,
      "Wind_Direction": 316,
      "Wind_Speed_kt": 5
    },
    {
      "Pressure_mb": 661.5,
      "Altitude_m": 3627,
      "Temp_c": 0.2,
      "Dewpoint_c": -21.1,
      "Wind_Direction": 316,
      "Wind_Speed_kt": 5
    },
    {
      "Pressure_mb": 661.1,
      "Altitude_m": 3632,
      "Temp_c": 0.2,
      "Dewpoint_c": -21.2,
      "Wind_Direction": 316,
      "Wind_Speed_kt": 5
    },
    {
      "Pressure_mb": 660.7,
      "Altitude_m": 3637,
      "Temp_c": 0.1,
      "Dewpoint_c": -21.3,
      "Wind_Direction": 316,
      "Wind_Speed_kt": 5
    },
    {
      "Pressure_mb": 660.3,
      "Altitude_m": 3642,
      "Temp_c": 0.1,
      "Dewpoint_c": -21.4,
      "Wind_Direction": 315,
      "Wind_Speed_kt": 5
    },
    {
      "Pressure_mb": 659.8,
      "Altitude_m": 3647,
      "Temp_c": 0.1,
      "Dewpoint_c": -21.4,
      "Wind_Direction": 315,
      "Wind_Speed_kt": 5
    },
    {
      "Pressure_mb": 659.5,
      "Altitude_m": 3652,
      "Temp_c": 0,
      "Dewpoint_c": -21.5,
      "Wind_Direction": 315,
      "Wind_Speed_kt": 4.9
    },
    {
      "Pressure_mb": 659.1,
      "Altitude_m": 3657,
      "Temp_c": 0,
      "Dewpoint_c": -21.6,
      "Wind_Direction": 315,
      "Wind_Speed_kt": 4.9
    },
    {
      "Pressure_mb": 658.7,
      "Altitude_m": 3662,
      "Temp_c": -0.1,
      "Dewpoint_c": -21.7,
      "Wind_Direction": 315,
      "Wind_Speed_kt": 4.9
    },
    {
      "Pressure_mb": 658.3,
      "Altitude_m": 3666,
      "Temp_c": -0.1,
      "Dewpoint_c": -21.8,
      "Wind_Direction": 315,
      "Wind_Speed_kt": 4.9
    },
    {
      "Pressure_mb": 658,
      "Altitude_m": 3670,
      "Temp_c": -0.1,
      "Dewpoint_c": -21.9,
      "Wind_Direction": 315,
      "Wind_Speed_kt": 4.9
    },
    {
      "Pressure_mb": 657.6,
      "Altitude_m": 3674,
      "Temp_c": -0.2,
      "Dewpoint_c": -21.9,
      "Wind_Direction": 315,
      "Wind_Speed_kt": 4.9
    },
    {
      "Pressure_mb": 657.2,
      "Altitude_m": 3679,
      "Temp_c": -0.2,
      "Dewpoint_c": -22,
      "Wind_Direction": 315,
      "Wind_Speed_kt": 4.9
    },
    {
      "Pressure_mb": 656.8,
      "Altitude_m": 3683,
      "Temp_c": -0.2,
      "Dewpoint_c": -22.1,
      "Wind_Direction": 314,
      "Wind_Speed_kt": 4.8
    },
    {
      "Pressure_mb": 656.5,
      "Altitude_m": 3687,
      "Temp_c": -0.3,
      "Dewpoint_c": -22.2,
      "Wind_Direction": 314,
      "Wind_Speed_kt": 4.8
    },
    {
      "Pressure_mb": 656.1,
      "Altitude_m": 3691,
      "Temp_c": -0.3,
      "Dewpoint_c": -22.2,
      "Wind_Direction": 314,
      "Wind_Speed_kt": 4.8
    },
    {
      "Pressure_mb": 655.7,
      "Altitude_m": 3696,
      "Temp_c": -0.4,
      "Dewpoint_c": -22.3,
      "Wind_Direction": 314,
      "Wind_Speed_kt": 4.8
    },
    {
      "Pressure_mb": 655.4,
      "Altitude_m": 3701,
      "Temp_c": -0.4,
      "Dewpoint_c": -22.3,
      "Wind_Direction": 314,
      "Wind_Speed_kt": 4.8
    },
    {
      "Pressure_mb": 655,
      "Altitude_m": 3706,
      "Temp_c": -0.4,
      "Dewpoint_c": -22.4,
      "Wind_Direction": 314,
      "Wind_Speed_kt": 4.8
    },
    {
      "Pressure_mb": 654.6,
      "Altitude_m": 3711,
      "Temp_c": -0.5,
      "Dewpoint_c": -22.4,
      "Wind_Direction": 314,
      "Wind_Speed_kt": 4.9
    },
    {
      "Pressure_mb": 654.2,
      "Altitude_m": 3716,
      "Temp_c": -0.5,
      "Dewpoint_c": -22.4,
      "Wind_Direction": 314,
      "Wind_Speed_kt": 4.9
    },
    {
      "Pressure_mb": 653.8,
      "Altitude_m": 3721,
      "Temp_c": -0.6,
      "Dewpoint_c": -22.5,
      "Wind_Direction": 314,
      "Wind_Speed_kt": 5
    },
    {
      "Pressure_mb": 653.5,
      "Altitude_m": 3725,
      "Temp_c": -0.6,
      "Dewpoint_c": -22.5,
      "Wind_Direction": 314,
      "Wind_Speed_kt": 5.1
    },
    {
      "Pressure_mb": 653.1,
      "Altitude_m": 3729,
      "Temp_c": -0.6,
      "Dewpoint_c": -22.6,
      "Wind_Direction": 314,
      "Wind_Speed_kt": 5.2
    },
    {
      "Pressure_mb": 652.8,
      "Altitude_m": 3733,
      "Temp_c": -0.7,
      "Dewpoint_c": -22.6,
      "Wind_Direction": 314,
      "Wind_Speed_kt": 5.3
    },
    {
      "Pressure_mb": 652.4,
      "Altitude_m": 3737,
      "Temp_c": -0.7,
      "Dewpoint_c": -22.6,
      "Wind_Direction": 314,
      "Wind_Speed_kt": 5.4
    },
    {
      "Pressure_mb": 652.1,
      "Altitude_m": 3742,
      "Temp_c": -0.8,
      "Dewpoint_c": -22.7,
      "Wind_Direction": 314,
      "Wind_Speed_kt": 5.5
    },
    {
      "Pressure_mb": 651.7,
      "Altitude_m": 3746,
      "Temp_c": -0.8,
      "Dewpoint_c": -22.7,
      "Wind_Direction": 314,
      "Wind_Speed_kt": 5.5
    },
    {
      "Pressure_mb": 651.5,
      "Altitude_m": 3749,
      "Temp_c": -0.8,
      "Dewpoint_c": -22.8,
      "Wind_Direction": 314,
      "Wind_Speed_kt": 5.6
    },
    {
      "Pressure_mb": 651.1,
      "Altitude_m": 3754,
      "Temp_c": -0.9,
      "Dewpoint_c": -22.8,
      "Wind_Direction": 314,
      "Wind_Speed_kt": 5.7
    },
    {
      "Pressure_mb": 650.7,
      "Altitude_m": 3758,
      "Temp_c": -0.9,
      "Dewpoint_c": -22.8,
      "Wind_Direction": 314,
      "Wind_Speed_kt": 5.8
    },
    {
      "Pressure_mb": 650.3,
      "Altitude_m": 3762,
      "Temp_c": -0.9,
      "Dewpoint_c": -22.8,
      "Wind_Direction": 314,
      "Wind_Speed_kt": 5.9
    },
    {
      "Pressure_mb": 649.9,
      "Altitude_m": 3767,
      "Temp_c": -1,
      "Dewpoint_c": -22.8,
      "Wind_Direction": 313,
      "Wind_Speed_kt": 6
    },
    {
      "Pressure_mb": 649.6,
      "Altitude_m": 3772,
      "Temp_c": -1,
      "Dewpoint_c": -22.8,
      "Wind_Direction": 313,
      "Wind_Speed_kt": 6.1
    },
    {
      "Pressure_mb": 649.2,
      "Altitude_m": 3777,
      "Temp_c": -1.1,
      "Dewpoint_c": -22.9,
      "Wind_Direction": 313,
      "Wind_Speed_kt": 6.1
    },
    {
      "Pressure_mb": 648.8,
      "Altitude_m": 3782,
      "Temp_c": -1.1,
      "Dewpoint_c": -22.9,
      "Wind_Direction": 313,
      "Wind_Speed_kt": 6.2
    },
    {
      "Pressure_mb": 648.4,
      "Altitude_m": 3786,
      "Temp_c": -1.2,
      "Dewpoint_c": -22.9,
      "Wind_Direction": 313,
      "Wind_Speed_kt": 6.3
    },
    {
      "Pressure_mb": 648,
      "Altitude_m": 3791,
      "Temp_c": -1.2,
      "Dewpoint_c": -22.9,
      "Wind_Direction": 313,
      "Wind_Speed_kt": 6.4
    },
    {
      "Pressure_mb": 647.5,
      "Altitude_m": 3797,
      "Temp_c": -1.2,
      "Dewpoint_c": -22.9,
      "Wind_Direction": 313,
      "Wind_Speed_kt": 6.5
    },
    {
      "Pressure_mb": 647.1,
      "Altitude_m": 3802,
      "Temp_c": -1.3,
      "Dewpoint_c": -23,
      "Wind_Direction": 313,
      "Wind_Speed_kt": 6.5
    },
    {
      "Pressure_mb": 646.7,
      "Altitude_m": 3808,
      "Temp_c": -1.3,
      "Dewpoint_c": -23,
      "Wind_Direction": 313,
      "Wind_Speed_kt": 6.5
    },
    {
      "Pressure_mb": 646.2,
      "Altitude_m": 3813,
      "Temp_c": -1.4,
      "Dewpoint_c": -23,
      "Wind_Direction": 313,
      "Wind_Speed_kt": 6.5
    },
    {
      "Pressure_mb": 645.8,
      "Altitude_m": 3819,
      "Temp_c": -1.4,
      "Dewpoint_c": -23,
      "Wind_Direction": 313,
      "Wind_Speed_kt": 6.5
    },
    {
      "Pressure_mb": 645.3,
      "Altitude_m": 3824,
      "Temp_c": -1.5,
      "Dewpoint_c": -23,
      "Wind_Direction": 313,
      "Wind_Speed_kt": 6.5
    },
    {
      "Pressure_mb": 644.9,
      "Altitude_m": 3830,
      "Temp_c": -1.5,
      "Dewpoint_c": -23.1,
      "Wind_Direction": 312,
      "Wind_Speed_kt": 6.5
    },
    {
      "Pressure_mb": 644.4,
      "Altitude_m": 3835,
      "Temp_c": -1.5,
      "Dewpoint_c": -23.1,
      "Wind_Direction": 312,
      "Wind_Speed_kt": 6.5
    },
    {
      "Pressure_mb": 644,
      "Altitude_m": 3841,
      "Temp_c": -1.6,
      "Dewpoint_c": -23.1,
      "Wind_Direction": 312,
      "Wind_Speed_kt": 6.5
    },
    {
      "Pressure_mb": 643.5,
      "Altitude_m": 3847,
      "Temp_c": -1.6,
      "Dewpoint_c": -23.1,
      "Wind_Direction": 312,
      "Wind_Speed_kt": 6.5
    },
    {
      "Pressure_mb": 643.1,
      "Altitude_m": 3852,
      "Temp_c": -1.6,
      "Dewpoint_c": -23.1,
      "Wind_Direction": 312,
      "Wind_Speed_kt": 6.6
    },
    {
      "Pressure_mb": 642.7,
      "Altitude_m": 3857,
      "Temp_c": -1.7,
      "Dewpoint_c": -23.1,
      "Wind_Direction": 312,
      "Wind_Speed_kt": 6.6
    },
    {
      "Pressure_mb": 642.3,
      "Altitude_m": 3862,
      "Temp_c": -1.7,
      "Dewpoint_c": -23.1,
      "Wind_Direction": 312,
      "Wind_Speed_kt": 6.6
    },
    {
      "Pressure_mb": 641.9,
      "Altitude_m": 3867,
      "Temp_c": -1.8,
      "Dewpoint_c": -23.2,
      "Wind_Direction": 311,
      "Wind_Speed_kt": 6.6
    },
    {
      "Pressure_mb": 641.5,
      "Altitude_m": 3872,
      "Temp_c": -1.8,
      "Dewpoint_c": -23.2,
      "Wind_Direction": 311,
      "Wind_Speed_kt": 6.6
    },
    {
      "Pressure_mb": 641.1,
      "Altitude_m": 3877,
      "Temp_c": -1.8,
      "Dewpoint_c": -23.2,
      "Wind_Direction": 311,
      "Wind_Speed_kt": 6.6
    },
    {
      "Pressure_mb": 640.7,
      "Altitude_m": 3882,
      "Temp_c": -1.9,
      "Dewpoint_c": -23.2,
      "Wind_Direction": 311,
      "Wind_Speed_kt": 6.6
    },
    {
      "Pressure_mb": 640.4,
      "Altitude_m": 3886,
      "Temp_c": -1.9,
      "Dewpoint_c": -23.3,
      "Wind_Direction": 311,
      "Wind_Speed_kt": 6.6
    },
    {
      "Pressure_mb": 640.1,
      "Altitude_m": 3890,
      "Temp_c": -1.9,
      "Dewpoint_c": -23.4,
      "Wind_Direction": 311,
      "Wind_Speed_kt": 6.6
    },
    {
      "Pressure_mb": 639.7,
      "Altitude_m": 3894,
      "Temp_c": -2,
      "Dewpoint_c": -23.5,
      "Wind_Direction": 311,
      "Wind_Speed_kt": 6.6
    },
    {
      "Pressure_mb": 639.4,
      "Altitude_m": 3898,
      "Temp_c": -2,
      "Dewpoint_c": -23.6,
      "Wind_Direction": 310,
      "Wind_Speed_kt": 6.6
    },
    {
      "Pressure_mb": 639,
      "Altitude_m": 3902,
      "Temp_c": -2,
      "Dewpoint_c": -23.7,
      "Wind_Direction": 310,
      "Wind_Speed_kt": 6.7
    },
    {
      "Pressure_mb": 638.7,
      "Altitude_m": 3906,
      "Temp_c": -2.1,
      "Dewpoint_c": -23.8,
      "Wind_Direction": 310,
      "Wind_Speed_kt": 6.7
    },
    {
      "Pressure_mb": 638.4,
      "Altitude_m": 3911,
      "Temp_c": -2.1,
      "Dewpoint_c": -23.9,
      "Wind_Direction": 310,
      "Wind_Speed_kt": 6.8
    },
    {
      "Pressure_mb": 638,
      "Altitude_m": 3915,
      "Temp_c": -2.1,
      "Dewpoint_c": -24,
      "Wind_Direction": 310,
      "Wind_Speed_kt": 6.8
    },
    {
      "Pressure_mb": 637.7,
      "Altitude_m": 3919,
      "Temp_c": -2.2,
      "Dewpoint_c": -24.1,
      "Wind_Direction": 310,
      "Wind_Speed_kt": 6.8
    },
    {
      "Pressure_mb": 637.3,
      "Altitude_m": 3924,
      "Temp_c": -2.2,
      "Dewpoint_c": -24.2,
      "Wind_Direction": 310,
      "Wind_Speed_kt": 6.9
    },
    {
      "Pressure_mb": 637,
      "Altitude_m": 3928,
      "Temp_c": -2.2,
      "Dewpoint_c": -24.3,
      "Wind_Direction": 310,
      "Wind_Speed_kt": 6.9
    },
    {
      "Pressure_mb": 636.5,
      "Altitude_m": 3933,
      "Temp_c": -2.3,
      "Dewpoint_c": -24.4,
      "Wind_Direction": 310,
      "Wind_Speed_kt": 6.9
    },
    {
      "Pressure_mb": 636.1,
      "Altitude_m": 3938,
      "Temp_c": -2.3,
      "Dewpoint_c": -24.5,
      "Wind_Direction": 310,
      "Wind_Speed_kt": 7
    },
    {
      "Pressure_mb": 635.7,
      "Altitude_m": 3944,
      "Temp_c": -2.3,
      "Dewpoint_c": -24.7,
      "Wind_Direction": 310,
      "Wind_Speed_kt": 7
    },
    {
      "Pressure_mb": 635.3,
      "Altitude_m": 3949,
      "Temp_c": -2.4,
      "Dewpoint_c": -24.9,
      "Wind_Direction": 310,
      "Wind_Speed_kt": 7
    },
    {
      "Pressure_mb": 634.9,
      "Altitude_m": 3954,
      "Temp_c": -2.4,
      "Dewpoint_c": -25.1,
      "Wind_Direction": 310,
      "Wind_Speed_kt": 7.1
    },
    {
      "Pressure_mb": 634.5,
      "Altitude_m": 3959,
      "Temp_c": -2.4,
      "Dewpoint_c": -25.3,
      "Wind_Direction": 310,
      "Wind_Speed_kt": 7.1
    },
    {
      "Pressure_mb": 634,
      "Altitude_m": 3965,
      "Temp_c": -2.4,
      "Dewpoint_c": -25.5,
      "Wind_Direction": 310,
      "Wind_Speed_kt": 7.2
    },
    {
      "Pressure_mb": 633.6,
      "Altitude_m": 3970,
      "Temp_c": -2.4,
      "Dewpoint_c": -25.6,
      "Wind_Direction": 310,
      "Wind_Speed_kt": 7.2
    },
    {
      "Pressure_mb": 633.1,
      "Altitude_m": 3976,
      "Temp_c": -2.5,
      "Dewpoint_c": -25.8,
      "Wind_Direction": 310,
      "Wind_Speed_kt": 7.2
    },
    {
      "Pressure_mb": 632.7,
      "Altitude_m": 3981,
      "Temp_c": -2.5,
      "Dewpoint_c": -26,
      "Wind_Direction": 310,
      "Wind_Speed_kt": 7.3
    },
    {
      "Pressure_mb": 632.3,
      "Altitude_m": 3987,
      "Temp_c": -2.5,
      "Dewpoint_c": -26.2,
      "Wind_Direction": 310,
      "Wind_Speed_kt": 7.3
    },
    {
      "Pressure_mb": 631.8,
      "Altitude_m": 3992,
      "Temp_c": -2.5,
      "Dewpoint_c": -26.4,
      "Wind_Direction": 310,
      "Wind_Speed_kt": 7.3
    },
    {
      "Pressure_mb": 631.4,
      "Altitude_m": 3997,
      "Temp_c": -2.5,
      "Dewpoint_c": -26.6,
      "Wind_Direction": 310,
      "Wind_Speed_kt": 7.4
    },
    {
      "Pressure_mb": 631.1,
      "Altitude_m": 4002,
      "Temp_c": -2.5,
      "Dewpoint_c": -26.8,
      "Wind_Direction": 310,
      "Wind_Speed_kt": 7.3
    },
    {
      "Pressure_mb": 630.7,
      "Altitude_m": 4007,
      "Temp_c": -2.5,
      "Dewpoint_c": -27,
      "Wind_Direction": 310,
      "Wind_Speed_kt": 7.2
    },
    {
      "Pressure_mb": 630.3,
      "Altitude_m": 4012,
      "Temp_c": -2.5,
      "Dewpoint_c": -27.4,
      "Wind_Direction": 310,
      "Wind_Speed_kt": 7.1
    },
    {
      "Pressure_mb": 629.9,
      "Altitude_m": 4017,
      "Temp_c": -2.5,
      "Dewpoint_c": -28,
      "Wind_Direction": 310,
      "Wind_Speed_kt": 7
    },
    {
      "Pressure_mb": 629.5,
      "Altitude_m": 4021,
      "Temp_c": -2.5,
      "Dewpoint_c": -28.6,
      "Wind_Direction": 310,
      "Wind_Speed_kt": 7
    },
    {
      "Pressure_mb": 629.2,
      "Altitude_m": 4025,
      "Temp_c": -2.5,
      "Dewpoint_c": -29.2,
      "Wind_Direction": 310,
      "Wind_Speed_kt": 6.9
    },
    {
      "Pressure_mb": 628.9,
      "Altitude_m": 4029,
      "Temp_c": -2.5,
      "Dewpoint_c": -29.8,
      "Wind_Direction": 310,
      "Wind_Speed_kt": 6.8
    },
    {
      "Pressure_mb": 628.6,
      "Altitude_m": 4033,
      "Temp_c": -2.4,
      "Dewpoint_c": -30.5,
      "Wind_Direction": 310,
      "Wind_Speed_kt": 6.7
    },
    {
      "Pressure_mb": 628.2,
      "Altitude_m": 4036,
      "Temp_c": -2.3,
      "Dewpoint_c": -31.2,
      "Wind_Direction": 310,
      "Wind_Speed_kt": 6.6
    },
    {
      "Pressure_mb": 627.9,
      "Altitude_m": 4041,
      "Temp_c": -2.2,
      "Dewpoint_c": -32,
      "Wind_Direction": 310,
      "Wind_Speed_kt": 6.5
    },
    {
      "Pressure_mb": 627.6,
      "Altitude_m": 4046,
      "Temp_c": -2.1,
      "Dewpoint_c": -32.8,
      "Wind_Direction": 310,
      "Wind_Speed_kt": 6.5
    },
    {
      "Pressure_mb": 627.2,
      "Altitude_m": 4051,
      "Temp_c": -2.1,
      "Dewpoint_c": -33.7,
      "Wind_Direction": 310,
      "Wind_Speed_kt": 6.4
    },
    {
      "Pressure_mb": 626.8,
      "Altitude_m": 4055,
      "Temp_c": -2,
      "Dewpoint_c": -34.7,
      "Wind_Direction": 310,
      "Wind_Speed_kt": 6.3
    },
    {
      "Pressure_mb": 626.4,
      "Altitude_m": 4060,
      "Temp_c": -1.9,
      "Dewpoint_c": -35.8,
      "Wind_Direction": 310,
      "Wind_Speed_kt": 6.2
    },
    {
      "Pressure_mb": 626.1,
      "Altitude_m": 4065,
      "Temp_c": -1.8,
      "Dewpoint_c": -37.1,
      "Wind_Direction": 310,
      "Wind_Speed_kt": 6.1
    },
    {
      "Pressure_mb": 625.7,
      "Altitude_m": 4070,
      "Temp_c": -1.7,
      "Dewpoint_c": -38.5,
      "Wind_Direction": 310,
      "Wind_Speed_kt": 6
    },
    {
      "Pressure_mb": 625.3,
      "Altitude_m": 4075,
      "Temp_c": -1.6,
      "Dewpoint_c": -39,
      "Wind_Direction": 310,
      "Wind_Speed_kt": 6
    },
    {
      "Pressure_mb": 624.9,
      "Altitude_m": 4080,
      "Temp_c": -1.6,
      "Dewpoint_c": -39.6,
      "Wind_Direction": 310,
      "Wind_Speed_kt": 5.9
    },
    {
      "Pressure_mb": 624.5,
      "Altitude_m": 4085,
      "Temp_c": -1.5,
      "Dewpoint_c": -40.1,
      "Wind_Direction": 310,
      "Wind_Speed_kt": 5.8
    },
    {
      "Pressure_mb": 624.1,
      "Altitude_m": 4090,
      "Temp_c": -1.4,
      "Dewpoint_c": -40.7,
      "Wind_Direction": 310,
      "Wind_Speed_kt": 5.7
    },
    {
      "Pressure_mb": 623.7,
      "Altitude_m": 4095,
      "Temp_c": -1.4,
      "Dewpoint_c": -41.4,
      "Wind_Direction": 310,
      "Wind_Speed_kt": 5.7
    },
    {
      "Pressure_mb": 623.3,
      "Altitude_m": 4100,
      "Temp_c": -1.4,
      "Dewpoint_c": -42.1,
      "Wind_Direction": 310,
      "Wind_Speed_kt": 5.7
    },
    {
      "Pressure_mb": 622.9,
      "Altitude_m": 4105,
      "Temp_c": -1.4,
      "Dewpoint_c": -42.9,
      "Wind_Direction": 310,
      "Wind_Speed_kt": 5.7
    },
    {
      "Pressure_mb": 622.5,
      "Altitude_m": 4110,
      "Temp_c": -1.4,
      "Dewpoint_c": -43.8,
      "Wind_Direction": 310,
      "Wind_Speed_kt": 5.7
    },
    {
      "Pressure_mb": 622.1,
      "Altitude_m": 4115,
      "Temp_c": -1.4,
      "Dewpoint_c": -44.7,
      "Wind_Direction": 310,
      "Wind_Speed_kt": 5.7
    },
    {
      "Pressure_mb": 621.7,
      "Altitude_m": 4121,
      "Temp_c": -1.4,
      "Dewpoint_c": -45.7,
      "Wind_Direction": 310,
      "Wind_Speed_kt": 5.7
    },
    {
      "Pressure_mb": 621.3,
      "Altitude_m": 4126,
      "Temp_c": -1.4,
      "Dewpoint_c": -46.9,
      "Wind_Direction": 310,
      "Wind_Speed_kt": 5.7
    },
    {
      "Pressure_mb": 620.9,
      "Altitude_m": 4131,
      "Temp_c": -1.4,
      "Dewpoint_c": -48.2,
      "Wind_Direction": 310,
      "Wind_Speed_kt": 5.7
    },
    {
      "Pressure_mb": 620.3,
      "Altitude_m": 4138,
      "Temp_c": -1.4,
      "Dewpoint_c": -50.5,
      "Wind_Direction": 311,
      "Wind_Speed_kt": 5.7
    },
    {
      "Pressure_mb": 620.1,
      "Altitude_m": 4141,
      "Temp_c": -1.4,
      "Dewpoint_c": -50.5,
      "Wind_Direction": 311,
      "Wind_Speed_kt": 5.7
    },
    {
      "Pressure_mb": 619.7,
      "Altitude_m": 4146,
      "Temp_c": -1.4,
      "Dewpoint_c": -50.5,
      "Wind_Direction": 311,
      "Wind_Speed_kt": 5.7
    },
    {
      "Pressure_mb": 619.3,
      "Altitude_m": 4151,
      "Temp_c": -1.4,
      "Dewpoint_c": -50.5,
      "Wind_Direction": 311,
      "Wind_Speed_kt": 5.7
    },
    {
      "Pressure_mb": 618.9,
      "Altitude_m": 4156,
      "Temp_c": -1.4,
      "Dewpoint_c": -50.5,
      "Wind_Direction": 311,
      "Wind_Speed_kt": 5.7
    },
    {
      "Pressure_mb": 618.5,
      "Altitude_m": 4161,
      "Temp_c": -1.4,
      "Dewpoint_c": -50.5,
      "Wind_Direction": 311,
      "Wind_Speed_kt": 5.7
    },
    {
      "Pressure_mb": 618.1,
      "Altitude_m": 4167,
      "Temp_c": -1.5,
      "Dewpoint_c": -50.6,
      "Wind_Direction": 311,
      "Wind_Speed_kt": 5.7
    },
    {
      "Pressure_mb": 617.7,
      "Altitude_m": 4172,
      "Temp_c": -1.5,
      "Dewpoint_c": -50.6,
      "Wind_Direction": 311,
      "Wind_Speed_kt": 5.7
    },
    {
      "Pressure_mb": 617.3,
      "Altitude_m": 4178,
      "Temp_c": -1.5,
      "Dewpoint_c": -50.6,
      "Wind_Direction": 311,
      "Wind_Speed_kt": 5.7
    },
    {
      "Pressure_mb": 616.9,
      "Altitude_m": 4183,
      "Temp_c": -1.5,
      "Dewpoint_c": -50.6,
      "Wind_Direction": 311,
      "Wind_Speed_kt": 5.7
    },
    {
      "Pressure_mb": 616.5,
      "Altitude_m": 4189,
      "Temp_c": -1.6,
      "Dewpoint_c": -50.6,
      "Wind_Direction": 311,
      "Wind_Speed_kt": 5.7
    },
    {
      "Pressure_mb": 616,
      "Altitude_m": 4194,
      "Temp_c": -1.6,
      "Dewpoint_c": -50.6,
      "Wind_Direction": 311,
      "Wind_Speed_kt": 5.7
    },
    {
      "Pressure_mb": 615.5,
      "Altitude_m": 4200,
      "Temp_c": -1.6,
      "Dewpoint_c": -50.6,
      "Wind_Direction": 311,
      "Wind_Speed_kt": 5.8
    },
    {
      "Pressure_mb": 615.3,
      "Altitude_m": 4203,
      "Temp_c": -1.7,
      "Dewpoint_c": -50.6,
      "Wind_Direction": 311,
      "Wind_Speed_kt": 5.8
    },
    {
      "Pressure_mb": 614.9,
      "Altitude_m": 4208,
      "Temp_c": -1.7,
      "Dewpoint_c": -50.7,
      "Wind_Direction": 311,
      "Wind_Speed_kt": 5.8
    },
    {
      "Pressure_mb": 614.6,
      "Altitude_m": 4212,
      "Temp_c": -1.7,
      "Dewpoint_c": -50.7,
      "Wind_Direction": 311,
      "Wind_Speed_kt": 5.9
    },
    {
      "Pressure_mb": 614.2,
      "Altitude_m": 4217,
      "Temp_c": -1.8,
      "Dewpoint_c": -50.7,
      "Wind_Direction": 311,
      "Wind_Speed_kt": 5.9
    },
    {
      "Pressure_mb": 613.9,
      "Altitude_m": 4222,
      "Temp_c": -1.8,
      "Dewpoint_c": -50.7,
      "Wind_Direction": 311,
      "Wind_Speed_kt": 5.9
    },
    {
      "Pressure_mb": 613.5,
      "Altitude_m": 4226,
      "Temp_c": -1.8,
      "Dewpoint_c": -50.7,
      "Wind_Direction": 310,
      "Wind_Speed_kt": 6
    },
    {
      "Pressure_mb": 613.2,
      "Altitude_m": 4230,
      "Temp_c": -1.8,
      "Dewpoint_c": -50.7,
      "Wind_Direction": 310,
      "Wind_Speed_kt": 6
    },
    {
      "Pressure_mb": 612.9,
      "Altitude_m": 4234,
      "Temp_c": -1.9,
      "Dewpoint_c": -50.8,
      "Wind_Direction": 310,
      "Wind_Speed_kt": 6
    },
    {
      "Pressure_mb": 612.5,
      "Altitude_m": 4239,
      "Temp_c": -1.9,
      "Dewpoint_c": -50.8,
      "Wind_Direction": 310,
      "Wind_Speed_kt": 6.1
    },
    {
      "Pressure_mb": 612.2,
      "Altitude_m": 4243,
      "Temp_c": -1.9,
      "Dewpoint_c": -50.8,
      "Wind_Direction": 310,
      "Wind_Speed_kt": 6.1
    },
    {
      "Pressure_mb": 611.9,
      "Altitude_m": 4247,
      "Temp_c": -2,
      "Dewpoint_c": -50.8,
      "Wind_Direction": 310,
      "Wind_Speed_kt": 6.2
    },
    {
      "Pressure_mb": 611.6,
      "Altitude_m": 4251,
      "Temp_c": -2,
      "Dewpoint_c": -50.8,
      "Wind_Direction": 310,
      "Wind_Speed_kt": 6.2
    },
    {
      "Pressure_mb": 611.2,
      "Altitude_m": 4256,
      "Temp_c": -2,
      "Dewpoint_c": -50.8,
      "Wind_Direction": 309,
      "Wind_Speed_kt": 6.2
    },
    {
      "Pressure_mb": 610.9,
      "Altitude_m": 4260,
      "Temp_c": -2,
      "Dewpoint_c": -50.9,
      "Wind_Direction": 309,
      "Wind_Speed_kt": 6.3
    },
    {
      "Pressure_mb": 610.6,
      "Altitude_m": 4264,
      "Temp_c": -2.1,
      "Dewpoint_c": -50.9,
      "Wind_Direction": 309,
      "Wind_Speed_kt": 6.3
    },
    {
      "Pressure_mb": 610.2,
      "Altitude_m": 4268,
      "Temp_c": -2.1,
      "Dewpoint_c": -50.9,
      "Wind_Direction": 309,
      "Wind_Speed_kt": 6.4
    },
    {
      "Pressure_mb": 609.9,
      "Altitude_m": 4273,
      "Temp_c": -2.1,
      "Dewpoint_c": -50.9,
      "Wind_Direction": 309,
      "Wind_Speed_kt": 6.4
    },
    {
      "Pressure_mb": 609.6,
      "Altitude_m": 4277,
      "Temp_c": -2.2,
      "Dewpoint_c": -50.9,
      "Wind_Direction": 309,
      "Wind_Speed_kt": 6.4
    },
    {
      "Pressure_mb": 609.2,
      "Altitude_m": 4282,
      "Temp_c": -2.2,
      "Dewpoint_c": -50.9,
      "Wind_Direction": 309,
      "Wind_Speed_kt": 6.5
    },
    {
      "Pressure_mb": 608.8,
      "Altitude_m": 4287,
      "Temp_c": -2.2,
      "Dewpoint_c": -51,
      "Wind_Direction": 309,
      "Wind_Speed_kt": 6.4
    },
    {
      "Pressure_mb": 608.4,
      "Altitude_m": 4292,
      "Temp_c": -2.2,
      "Dewpoint_c": -51,
      "Wind_Direction": 309,
      "Wind_Speed_kt": 6.4
    },
    {
      "Pressure_mb": 608.1,
      "Altitude_m": 4296,
      "Temp_c": -2.3,
      "Dewpoint_c": -51,
      "Wind_Direction": 309,
      "Wind_Speed_kt": 6.4
    },
    {
      "Pressure_mb": 607.7,
      "Altitude_m": 4301,
      "Temp_c": -2.3,
      "Dewpoint_c": -51,
      "Wind_Direction": 309,
      "Wind_Speed_kt": 6.3
    },
    {
      "Pressure_mb": 607.3,
      "Altitude_m": 4306,
      "Temp_c": -2.3,
      "Dewpoint_c": -51,
      "Wind_Direction": 309,
      "Wind_Speed_kt": 6.3
    },
    {
      "Pressure_mb": 606.9,
      "Altitude_m": 4312,
      "Temp_c": -2.3,
      "Dewpoint_c": -51.1,
      "Wind_Direction": 310,
      "Wind_Speed_kt": 6.3
    },
    {
      "Pressure_mb": 606.5,
      "Altitude_m": 4317,
      "Temp_c": -2.4,
      "Dewpoint_c": -51.1,
      "Wind_Direction": 310,
      "Wind_Speed_kt": 6.2
    },
    {
      "Pressure_mb": 606.1,
      "Altitude_m": 4322,
      "Temp_c": -2.4,
      "Dewpoint_c": -51.1,
      "Wind_Direction": 310,
      "Wind_Speed_kt": 6.2
    },
    {
      "Pressure_mb": 605.8,
      "Altitude_m": 4327,
      "Temp_c": -2.4,
      "Dewpoint_c": -51.1,
      "Wind_Direction": 310,
      "Wind_Speed_kt": 6.2
    },
    {
      "Pressure_mb": 605.4,
      "Altitude_m": 4332,
      "Temp_c": -2.5,
      "Dewpoint_c": -51.1,
      "Wind_Direction": 310,
      "Wind_Speed_kt": 6.1
    },
    {
      "Pressure_mb": 605,
      "Altitude_m": 4337,
      "Temp_c": -2.5,
      "Dewpoint_c": -51.1,
      "Wind_Direction": 310,
      "Wind_Speed_kt": 6.1
    },
    {
      "Pressure_mb": 604.6,
      "Altitude_m": 4342,
      "Temp_c": -2.5,
      "Dewpoint_c": -51.2,
      "Wind_Direction": 311,
      "Wind_Speed_kt": 6
    },
    {
      "Pressure_mb": 604.2,
      "Altitude_m": 4347,
      "Temp_c": -2.5,
      "Dewpoint_c": -51.2,
      "Wind_Direction": 311,
      "Wind_Speed_kt": 6
    },
    {
      "Pressure_mb": 603.8,
      "Altitude_m": 4352,
      "Temp_c": -2.6,
      "Dewpoint_c": -51.2,
      "Wind_Direction": 311,
      "Wind_Speed_kt": 6
    },
    {
      "Pressure_mb": 603.4,
      "Altitude_m": 4358,
      "Temp_c": -2.6,
      "Dewpoint_c": -51.2,
      "Wind_Direction": 311,
      "Wind_Speed_kt": 5.9
    },
    {
      "Pressure_mb": 603,
      "Altitude_m": 4363,
      "Temp_c": -2.6,
      "Dewpoint_c": -51.2,
      "Wind_Direction": 311,
      "Wind_Speed_kt": 5.9
    },
    {
      "Pressure_mb": 602.6,
      "Altitude_m": 4368,
      "Temp_c": -2.6,
      "Dewpoint_c": -51.2,
      "Wind_Direction": 311,
      "Wind_Speed_kt": 5.9
    },
    {
      "Pressure_mb": 602.3,
      "Altitude_m": 4372,
      "Temp_c": -2.7,
      "Dewpoint_c": -51.2,
      "Wind_Direction": 312,
      "Wind_Speed_kt": 5.8
    },
    {
      "Pressure_mb": 602,
      "Altitude_m": 4376,
      "Temp_c": -2.7,
      "Dewpoint_c": -51.3,
      "Wind_Direction": 312,
      "Wind_Speed_kt": 5.8
    },
    {
      "Pressure_mb": 601.6,
      "Altitude_m": 4381,
      "Temp_c": -2.7,
      "Dewpoint_c": -51.3,
      "Wind_Direction": 312,
      "Wind_Speed_kt": 5.8
    },
    {
      "Pressure_mb": 601.3,
      "Altitude_m": 4385,
      "Temp_c": -2.8,
      "Dewpoint_c": -51.3,
      "Wind_Direction": 312,
      "Wind_Speed_kt": 5.8
    },
    {
      "Pressure_mb": 601,
      "Altitude_m": 4390,
      "Temp_c": -2.8,
      "Dewpoint_c": -51.3,
      "Wind_Direction": 312,
      "Wind_Speed_kt": 5.8
    },
    {
      "Pressure_mb": 600.6,
      "Altitude_m": 4394,
      "Temp_c": -2.8,
      "Dewpoint_c": -51.3,
      "Wind_Direction": 312,
      "Wind_Speed_kt": 5.8
    },
    {
      "Pressure_mb": 600.3,
      "Altitude_m": 4398,
      "Temp_c": -2.8,
      "Dewpoint_c": -51.3,
      "Wind_Direction": 312,
      "Wind_Speed_kt": 5.8
    },
    {
      "Pressure_mb": 600,
      "Altitude_m": 4402,
      "Temp_c": -2.8,
      "Dewpoint_c": -51.3,
      "Wind_Direction": 312,
      "Wind_Speed_kt": 5.8
    },
    {
      "Pressure_mb": 599.7,
      "Altitude_m": 4406,
      "Temp_c": -2.9,
      "Dewpoint_c": -51.4,
      "Wind_Direction": 312,
      "Wind_Speed_kt": 5.8
    },
    {
      "Pressure_mb": 599.3,
      "Altitude_m": 4411,
      "Temp_c": -2.9,
      "Dewpoint_c": -51.4,
      "Wind_Direction": 312,
      "Wind_Speed_kt": 5.8
    },
    {
      "Pressure_mb": 599,
      "Altitude_m": 4415,
      "Temp_c": -2.9,
      "Dewpoint_c": -51.4,
      "Wind_Direction": 311,
      "Wind_Speed_kt": 5.8
    },
    {
      "Pressure_mb": 598.7,
      "Altitude_m": 4420,
      "Temp_c": -3,
      "Dewpoint_c": -51.4,
      "Wind_Direction": 311,
      "Wind_Speed_kt": 5.8
    },
    {
      "Pressure_mb": 598.3,
      "Altitude_m": 4425,
      "Temp_c": -3,
      "Dewpoint_c": -51.4,
      "Wind_Direction": 311,
      "Wind_Speed_kt": 5.9
    },
    {
      "Pressure_mb": 598,
      "Altitude_m": 4429,
      "Temp_c": -3,
      "Dewpoint_c": -51.5,
      "Wind_Direction": 311,
      "Wind_Speed_kt": 5.9
    },
    {
      "Pressure_mb": 597.6,
      "Altitude_m": 4434,
      "Temp_c": -3.1,
      "Dewpoint_c": -51.5,
      "Wind_Direction": 311,
      "Wind_Speed_kt": 5.9
    },
    {
      "Pressure_mb": 597.2,
      "Altitude_m": 4439,
      "Temp_c": -3.1,
      "Dewpoint_c": -51.5,
      "Wind_Direction": 311,
      "Wind_Speed_kt": 5.9
    },
    {
      "Pressure_mb": 596.8,
      "Altitude_m": 4444,
      "Temp_c": -3.1,
      "Dewpoint_c": -51.5,
      "Wind_Direction": 311,
      "Wind_Speed_kt": 5.9
    },
    {
      "Pressure_mb": 596.5,
      "Altitude_m": 4449,
      "Temp_c": -3.2,
      "Dewpoint_c": -51.5,
      "Wind_Direction": 311,
      "Wind_Speed_kt": 5.9
    },
    {
      "Pressure_mb": 596.1,
      "Altitude_m": 4454,
      "Temp_c": -3.2,
      "Dewpoint_c": -51.5,
      "Wind_Direction": 311,
      "Wind_Speed_kt": 5.9
    },
    {
      "Pressure_mb": 595.7,
      "Altitude_m": 4459,
      "Temp_c": -3.2,
      "Dewpoint_c": -51.6,
      "Wind_Direction": 311,
      "Wind_Speed_kt": 5.9
    },
    {
      "Pressure_mb": 595.3,
      "Altitude_m": 4464,
      "Temp_c": -3.2,
      "Dewpoint_c": -51.6,
      "Wind_Direction": 311,
      "Wind_Speed_kt": 5.9
    },
    {
      "Pressure_mb": 594.9,
      "Altitude_m": 4469,
      "Temp_c": -3.3,
      "Dewpoint_c": -51.6,
      "Wind_Direction": 311,
      "Wind_Speed_kt": 5.9
    },
    {
      "Pressure_mb": 594.6,
      "Altitude_m": 4474,
      "Temp_c": -3.3,
      "Dewpoint_c": -51.6,
      "Wind_Direction": 311,
      "Wind_Speed_kt": 5.9
    },
    {
      "Pressure_mb": 594.2,
      "Altitude_m": 4479,
      "Temp_c": -3.3,
      "Dewpoint_c": -51.6,
      "Wind_Direction": 311,
      "Wind_Speed_kt": 5.9
    },
    {
      "Pressure_mb": 593.8,
      "Altitude_m": 4484,
      "Temp_c": -3.4,
      "Dewpoint_c": -51.7,
      "Wind_Direction": 311,
      "Wind_Speed_kt": 5.9
    },
    {
      "Pressure_mb": 593.5,
      "Altitude_m": 4489,
      "Temp_c": -3.4,
      "Dewpoint_c": -51.7,
      "Wind_Direction": 311,
      "Wind_Speed_kt": 5.8
    },
    {
      "Pressure_mb": 593.1,
      "Altitude_m": 4494,
      "Temp_c": -3.4,
      "Dewpoint_c": -51.7,
      "Wind_Direction": 311,
      "Wind_Speed_kt": 5.8
    },
    {
      "Pressure_mb": 592.8,
      "Altitude_m": 4498,
      "Temp_c": -3.4,
      "Dewpoint_c": -51.7,
      "Wind_Direction": 311,
      "Wind_Speed_kt": 5.8
    },
    {
      "Pressure_mb": 592.4,
      "Altitude_m": 4503,
      "Temp_c": -3.5,
      "Dewpoint_c": -51.7,
      "Wind_Direction": 311,
      "Wind_Speed_kt": 5.7
    },
    {
      "Pressure_mb": 592,
      "Altitude_m": 4508,
      "Temp_c": -3.5,
      "Dewpoint_c": -51.8,
      "Wind_Direction": 310,
      "Wind_Speed_kt": 5.7
    },
    {
      "Pressure_mb": 591.7,
      "Altitude_m": 4513,
      "Temp_c": -3.5,
      "Dewpoint_c": -51.8,
      "Wind_Direction": 310,
      "Wind_Speed_kt": 5.7
    },
    {
      "Pressure_mb": 591.3,
      "Altitude_m": 4518,
      "Temp_c": -3.5,
      "Dewpoint_c": -51.8,
      "Wind_Direction": 310,
      "Wind_Speed_kt": 5.6
    },
    {
      "Pressure_mb": 590.9,
      "Altitude_m": 4523,
      "Temp_c": -3.6,
      "Dewpoint_c": -51.8,
      "Wind_Direction": 310,
      "Wind_Speed_kt": 5.6
    },
    {
      "Pressure_mb": 590.6,
      "Altitude_m": 4528,
      "Temp_c": -3.6,
      "Dewpoint_c": -51.8,
      "Wind_Direction": 310,
      "Wind_Speed_kt": 5.6
    },
    {
      "Pressure_mb": 590.2,
      "Altitude_m": 4533,
      "Temp_c": -3.6,
      "Dewpoint_c": -51.8,
      "Wind_Direction": 310,
      "Wind_Speed_kt": 5.5
    },
    {
      "Pressure_mb": 589.8,
      "Altitude_m": 4538,
      "Temp_c": -3.6,
      "Dewpoint_c": -51.8,
      "Wind_Direction": 310,
      "Wind_Speed_kt": 5.5
    },
    {
      "Pressure_mb": 589.5,
      "Altitude_m": 4542,
      "Temp_c": -3.7,
      "Dewpoint_c": -51.9,
      "Wind_Direction": 310,
      "Wind_Speed_kt": 5.5
    },
    {
      "Pressure_mb": 589.2,
      "Altitude_m": 4546,
      "Temp_c": -3.7,
      "Dewpoint_c": -51.9,
      "Wind_Direction": 310,
      "Wind_Speed_kt": 5.4
    },
    {
      "Pressure_mb": 588.9,
      "Altitude_m": 4551,
      "Temp_c": -3.7,
      "Dewpoint_c": -51.9,
      "Wind_Direction": 310,
      "Wind_Speed_kt": 5.4
    },
    {
      "Pressure_mb": 588.6,
      "Altitude_m": 4555,
      "Temp_c": -3.7,
      "Dewpoint_c": -51.9,
      "Wind_Direction": 310,
      "Wind_Speed_kt": 5.4
    },
    {
      "Pressure_mb": 588.3,
      "Altitude_m": 4559,
      "Temp_c": -3.7,
      "Dewpoint_c": -51.9,
      "Wind_Direction": 310,
      "Wind_Speed_kt": 5.3
    },
    {
      "Pressure_mb": 588,
      "Altitude_m": 4563,
      "Temp_c": -3.7,
      "Dewpoint_c": -51.9,
      "Wind_Direction": 310,
      "Wind_Speed_kt": 5.3
    },
    {
      "Pressure_mb": 587.6,
      "Altitude_m": 4567,
      "Temp_c": -3.8,
      "Dewpoint_c": -51.9,
      "Wind_Direction": 310,
      "Wind_Speed_kt": 5.3
    },
    {
      "Pressure_mb": 587.3,
      "Altitude_m": 4570,
      "Temp_c": -3.8,
      "Dewpoint_c": -51.9,
      "Wind_Direction": 310,
      "Wind_Speed_kt": 5.2
    },
    {
      "Pressure_mb": 587,
      "Altitude_m": 4574,
      "Temp_c": -3.8,
      "Dewpoint_c": -51.9,
      "Wind_Direction": 310,
      "Wind_Speed_kt": 5.1
    },
    {
      "Pressure_mb": 586.7,
      "Altitude_m": 4578,
      "Temp_c": -3.8,
      "Dewpoint_c": -51.9,
      "Wind_Direction": 310,
      "Wind_Speed_kt": 5
    },
    {
      "Pressure_mb": 586.4,
      "Altitude_m": 4583,
      "Temp_c": -3.8,
      "Dewpoint_c": -51.9,
      "Wind_Direction": 310,
      "Wind_Speed_kt": 4.9
    },
    {
      "Pressure_mb": 586.1,
      "Altitude_m": 4588,
      "Temp_c": -3.8,
      "Dewpoint_c": -52,
      "Wind_Direction": 310,
      "Wind_Speed_kt": 4.8
    },
    {
      "Pressure_mb": 585.8,
      "Altitude_m": 4592,
      "Temp_c": -3.8,
      "Dewpoint_c": -52,
      "Wind_Direction": 309,
      "Wind_Speed_kt": 4.7
    },
    {
      "Pressure_mb": 585.5,
      "Altitude_m": 4597,
      "Temp_c": -3.9,
      "Dewpoint_c": -52,
      "Wind_Direction": 309,
      "Wind_Speed_kt": 4.6
    },
    {
      "Pressure_mb": 585.2,
      "Altitude_m": 4601,
      "Temp_c": -3.9,
      "Dewpoint_c": -52,
      "Wind_Direction": 309,
      "Wind_Speed_kt": 4.5
    },
    {
      "Pressure_mb": 584.9,
      "Altitude_m": 4605,
      "Temp_c": -3.9,
      "Dewpoint_c": -52,
      "Wind_Direction": 309,
      "Wind_Speed_kt": 4.4
    },
    {
      "Pressure_mb": 584.5,
      "Altitude_m": 4609,
      "Temp_c": -4,
      "Dewpoint_c": -52,
      "Wind_Direction": 309,
      "Wind_Speed_kt": 4.3
    },
    {
      "Pressure_mb": 584.2,
      "Altitude_m": 4613,
      "Temp_c": -4,
      "Dewpoint_c": -52,
      "Wind_Direction": 309,
      "Wind_Speed_kt": 4.2
    },
    {
      "Pressure_mb": 583.9,
      "Altitude_m": 4617,
      "Temp_c": -4,
      "Dewpoint_c": -52.1,
      "Wind_Direction": 309,
      "Wind_Speed_kt": 4.1
    },
    {
      "Pressure_mb": 583.6,
      "Altitude_m": 4620,
      "Temp_c": -4.1,
      "Dewpoint_c": -52.1,
      "Wind_Direction": 309,
      "Wind_Speed_kt": 4
    },
    {
      "Pressure_mb": 583.3,
      "Altitude_m": 4624,
      "Temp_c": -4.1,
      "Dewpoint_c": -52.1,
      "Wind_Direction": 309,
      "Wind_Speed_kt": 3.9
    },
    {
      "Pressure_mb": 583,
      "Altitude_m": 4628,
      "Temp_c": -4.2,
      "Dewpoint_c": -52.1,
      "Wind_Direction": 308,
      "Wind_Speed_kt": 3.8
    },
    {
      "Pressure_mb": 582.7,
      "Altitude_m": 4633,
      "Temp_c": -4.2,
      "Dewpoint_c": -52.1,
      "Wind_Direction": 308,
      "Wind_Speed_kt": 3.7
    },
    {
      "Pressure_mb": 582.4,
      "Altitude_m": 4637,
      "Temp_c": -4.2,
      "Dewpoint_c": -52.2,
      "Wind_Direction": 308,
      "Wind_Speed_kt": 3.6
    },
    {
      "Pressure_mb": 582,
      "Altitude_m": 4642,
      "Temp_c": -4.3,
      "Dewpoint_c": -52.2,
      "Wind_Direction": 308,
      "Wind_Speed_kt": 3.5
    },
    {
      "Pressure_mb": 581.7,
      "Altitude_m": 4646,
      "Temp_c": -4.3,
      "Dewpoint_c": -52.2,
      "Wind_Direction": 308,
      "Wind_Speed_kt": 3.4
    },
    {
      "Pressure_mb": 581.3,
      "Altitude_m": 4651,
      "Temp_c": -4.4,
      "Dewpoint_c": -52.2,
      "Wind_Direction": 308,
      "Wind_Speed_kt": 3.3
    },
    {
      "Pressure_mb": 580.9,
      "Altitude_m": 4656,
      "Temp_c": -4.4,
      "Dewpoint_c": -52.3,
      "Wind_Direction": 308,
      "Wind_Speed_kt": 3.4
    },
    {
      "Pressure_mb": 580.5,
      "Altitude_m": 4662,
      "Temp_c": -4.4,
      "Dewpoint_c": -52.3,
      "Wind_Direction": 308,
      "Wind_Speed_kt": 3.4
    },
    {
      "Pressure_mb": 580.2,
      "Altitude_m": 4668,
      "Temp_c": -4.5,
      "Dewpoint_c": -52.3,
      "Wind_Direction": 308,
      "Wind_Speed_kt": 3.5
    },
    {
      "Pressure_mb": 579.8,
      "Altitude_m": 4674,
      "Temp_c": -4.5,
      "Dewpoint_c": -52.3,
      "Wind_Direction": 308,
      "Wind_Speed_kt": 3.5
    },
    {
      "Pressure_mb": 579.5,
      "Altitude_m": 4679,
      "Temp_c": -4.6,
      "Dewpoint_c": -52.3,
      "Wind_Direction": 308,
      "Wind_Speed_kt": 3.6
    },
    {
      "Pressure_mb": 579.1,
      "Altitude_m": 4684,
      "Temp_c": -4.6,
      "Dewpoint_c": -52.4,
      "Wind_Direction": 308,
      "Wind_Speed_kt": 3.6
    },
    {
      "Pressure_mb": 578.8,
      "Altitude_m": 4688,
      "Temp_c": -4.6,
      "Dewpoint_c": -52.4,
      "Wind_Direction": 309,
      "Wind_Speed_kt": 3.7
    },
    {
      "Pressure_mb": 578.5,
      "Altitude_m": 4692,
      "Temp_c": -4.7,
      "Dewpoint_c": -52.4,
      "Wind_Direction": 309,
      "Wind_Speed_kt": 3.7
    },
    {
      "Pressure_mb": 578.1,
      "Altitude_m": 4695,
      "Temp_c": -4.7,
      "Dewpoint_c": -52.4,
      "Wind_Direction": 309,
      "Wind_Speed_kt": 3.8
    },
    {
      "Pressure_mb": 577.9,
      "Altitude_m": 4699,
      "Temp_c": -4.8,
      "Dewpoint_c": -52.5,
      "Wind_Direction": 309,
      "Wind_Speed_kt": 3.8
    },
    {
      "Pressure_mb": 577.6,
      "Altitude_m": 4703,
      "Temp_c": -4.8,
      "Dewpoint_c": -52.5,
      "Wind_Direction": 309,
      "Wind_Speed_kt": 3.9
    },
    {
      "Pressure_mb": 577.3,
      "Altitude_m": 4707,
      "Temp_c": -4.8,
      "Dewpoint_c": -52.5,
      "Wind_Direction": 309,
      "Wind_Speed_kt": 3.9
    },
    {
      "Pressure_mb": 577,
      "Altitude_m": 4710,
      "Temp_c": -4.9,
      "Dewpoint_c": -52.5,
      "Wind_Direction": 309,
      "Wind_Speed_kt": 4
    },
    {
      "Pressure_mb": 576.8,
      "Altitude_m": 4714,
      "Temp_c": -4.9,
      "Dewpoint_c": -52.6,
      "Wind_Direction": 309,
      "Wind_Speed_kt": 4
    },
    {
      "Pressure_mb": 576.5,
      "Altitude_m": 4717,
      "Temp_c": -5,
      "Dewpoint_c": -52.6,
      "Wind_Direction": 309,
      "Wind_Speed_kt": 4
    },
    {
      "Pressure_mb": 576.2,
      "Altitude_m": 4721,
      "Temp_c": -5,
      "Dewpoint_c": -52.6,
      "Wind_Direction": 309,
      "Wind_Speed_kt": 4.1
    },
    {
      "Pressure_mb": 575.9,
      "Altitude_m": 4724,
      "Temp_c": -5,
      "Dewpoint_c": -52.6,
      "Wind_Direction": 310,
      "Wind_Speed_kt": 4.1
    },
    {
      "Pressure_mb": 575.7,
      "Altitude_m": 4729,
      "Temp_c": -5.1,
      "Dewpoint_c": -52.6,
      "Wind_Direction": 310,
      "Wind_Speed_kt": 4.2
    },
    {
      "Pressure_mb": 575.4,
      "Altitude_m": 4733,
      "Temp_c": -5.1,
      "Dewpoint_c": -52.7,
      "Wind_Direction": 310,
      "Wind_Speed_kt": 4.2
    },
    {
      "Pressure_mb": 575.1,
      "Altitude_m": 4737,
      "Temp_c": -5.2,
      "Dewpoint_c": -52.7,
      "Wind_Direction": 310,
      "Wind_Speed_kt": 4.3
    },
    {
      "Pressure_mb": 574.8,
      "Altitude_m": 4741,
      "Temp_c": -5.2,
      "Dewpoint_c": -52.7,
      "Wind_Direction": 310,
      "Wind_Speed_kt": 4.3
    },
    {
      "Pressure_mb": 574.5,
      "Altitude_m": 4745,
      "Temp_c": -5.2,
      "Dewpoint_c": -52.7,
      "Wind_Direction": 310,
      "Wind_Speed_kt": 4.3
    },
    {
      "Pressure_mb": 574.2,
      "Altitude_m": 4749,
      "Temp_c": -5.3,
      "Dewpoint_c": -52.7,
      "Wind_Direction": 311,
      "Wind_Speed_kt": 4.3
    },
    {
      "Pressure_mb": 573.9,
      "Altitude_m": 4752,
      "Temp_c": -5.3,
      "Dewpoint_c": -52.8,
      "Wind_Direction": 311,
      "Wind_Speed_kt": 4.3
    },
    {
      "Pressure_mb": 573.6,
      "Altitude_m": 4757,
      "Temp_c": -5.3,
      "Dewpoint_c": -52.8,
      "Wind_Direction": 311,
      "Wind_Speed_kt": 4.4
    },
    {
      "Pressure_mb": 573.3,
      "Altitude_m": 4761,
      "Temp_c": -5.4,
      "Dewpoint_c": -52.8,
      "Wind_Direction": 311,
      "Wind_Speed_kt": 4.4
    },
    {
      "Pressure_mb": 573,
      "Altitude_m": 4765,
      "Temp_c": -5.4,
      "Dewpoint_c": -52.8,
      "Wind_Direction": 312,
      "Wind_Speed_kt": 4.4
    },
    {
      "Pressure_mb": 572.7,
      "Altitude_m": 4769,
      "Temp_c": -5.5,
      "Dewpoint_c": -52.9,
      "Wind_Direction": 312,
      "Wind_Speed_kt": 4.4
    },
    {
      "Pressure_mb": 572.4,
      "Altitude_m": 4773,
      "Temp_c": -5.5,
      "Dewpoint_c": -52.9,
      "Wind_Direction": 312,
      "Wind_Speed_kt": 4.4
    },
    {
      "Pressure_mb": 572.1,
      "Altitude_m": 4778,
      "Temp_c": -5.5,
      "Dewpoint_c": -52.9,
      "Wind_Direction": 312,
      "Wind_Speed_kt": 4.5
    },
    {
      "Pressure_mb": 571.8,
      "Altitude_m": 4782,
      "Temp_c": -5.6,
      "Dewpoint_c": -52.9,
      "Wind_Direction": 313,
      "Wind_Speed_kt": 4.5
    },
    {
      "Pressure_mb": 571.5,
      "Altitude_m": 4786,
      "Temp_c": -5.6,
      "Dewpoint_c": -53,
      "Wind_Direction": 313,
      "Wind_Speed_kt": 4.5
    },
    {
      "Pressure_mb": 571.2,
      "Altitude_m": 4790,
      "Temp_c": -5.7,
      "Dewpoint_c": -53,
      "Wind_Direction": 313,
      "Wind_Speed_kt": 4.5
    },
    {
      "Pressure_mb": 570.9,
      "Altitude_m": 4794,
      "Temp_c": -5.7,
      "Dewpoint_c": -53,
      "Wind_Direction": 313,
      "Wind_Speed_kt": 4.5
    },
    {
      "Pressure_mb": 570.6,
      "Altitude_m": 4798,
      "Temp_c": -5.7,
      "Dewpoint_c": -53,
      "Wind_Direction": 314,
      "Wind_Speed_kt": 4.6
    },
    {
      "Pressure_mb": 570.3,
      "Altitude_m": 4803,
      "Temp_c": -5.8,
      "Dewpoint_c": -53.1,
      "Wind_Direction": 314,
      "Wind_Speed_kt": 4.6
    },
    {
      "Pressure_mb": 569.9,
      "Altitude_m": 4807,
      "Temp_c": -5.8,
      "Dewpoint_c": -53.1,
      "Wind_Direction": 314,
      "Wind_Speed_kt": 4.6
    },
    {
      "Pressure_mb": 569.6,
      "Altitude_m": 4811,
      "Temp_c": -5.9,
      "Dewpoint_c": -53.1,
      "Wind_Direction": 314,
      "Wind_Speed_kt": 4.6
    },
    {
      "Pressure_mb": 569.3,
      "Altitude_m": 4816,
      "Temp_c": -5.9,
      "Dewpoint_c": -53.2,
      "Wind_Direction": 315,
      "Wind_Speed_kt": 4.6
    },
    {
      "Pressure_mb": 569,
      "Altitude_m": 4820,
      "Temp_c": -5.9,
      "Dewpoint_c": -53.2,
      "Wind_Direction": 315,
      "Wind_Speed_kt": 4.7
    },
    {
      "Pressure_mb": 568.7,
      "Altitude_m": 4824,
      "Temp_c": -6,
      "Dewpoint_c": -53.2,
      "Wind_Direction": 315,
      "Wind_Speed_kt": 4.7
    },
    {
      "Pressure_mb": 568.4,
      "Altitude_m": 4829,
      "Temp_c": -6,
      "Dewpoint_c": -53.2,
      "Wind_Direction": 315,
      "Wind_Speed_kt": 4.7
    },
    {
      "Pressure_mb": 568.1,
      "Altitude_m": 4833,
      "Temp_c": -6.1,
      "Dewpoint_c": -53.3,
      "Wind_Direction": 315,
      "Wind_Speed_kt": 4.7
    },
    {
      "Pressure_mb": 567.8,
      "Altitude_m": 4837,
      "Temp_c": -6.1,
      "Dewpoint_c": -53.3,
      "Wind_Direction": 315,
      "Wind_Speed_kt": 4.7
    },
    {
      "Pressure_mb": 567.4,
      "Altitude_m": 4842,
      "Temp_c": -6.2,
      "Dewpoint_c": -53.3,
      "Wind_Direction": 315,
      "Wind_Speed_kt": 4.7
    },
    {
      "Pressure_mb": 567.1,
      "Altitude_m": 4846,
      "Temp_c": -6.2,
      "Dewpoint_c": -53.3,
      "Wind_Direction": 315,
      "Wind_Speed_kt": 4.8
    },
    {
      "Pressure_mb": 566.7,
      "Altitude_m": 4850,
      "Temp_c": -6.2,
      "Dewpoint_c": -53.4,
      "Wind_Direction": 316,
      "Wind_Speed_kt": 4.8
    },
    {
      "Pressure_mb": 566.4,
      "Altitude_m": 4855,
      "Temp_c": -6.3,
      "Dewpoint_c": -53.4,
      "Wind_Direction": 316,
      "Wind_Speed_kt": 4.8
    },
    {
      "Pressure_mb": 566,
      "Altitude_m": 4860,
      "Temp_c": -6.3,
      "Dewpoint_c": -53.4,
      "Wind_Direction": 316,
      "Wind_Speed_kt": 4.8
    },
    {
      "Pressure_mb": 565.7,
      "Altitude_m": 4865,
      "Temp_c": -6.4,
      "Dewpoint_c": -53.5,
      "Wind_Direction": 316,
      "Wind_Speed_kt": 4.8
    },
    {
      "Pressure_mb": 565.4,
      "Altitude_m": 4870,
      "Temp_c": -6.4,
      "Dewpoint_c": -53.5,
      "Wind_Direction": 316,
      "Wind_Speed_kt": 4.8
    },
    {
      "Pressure_mb": 565,
      "Altitude_m": 4875,
      "Temp_c": -6.5,
      "Dewpoint_c": -53.5,
      "Wind_Direction": 316,
      "Wind_Speed_kt": 4.9
    },
    {
      "Pressure_mb": 564.6,
      "Altitude_m": 4880,
      "Temp_c": -6.5,
      "Dewpoint_c": -53.5,
      "Wind_Direction": 316,
      "Wind_Speed_kt": 4.9
    },
    {
      "Pressure_mb": 564.3,
      "Altitude_m": 4885,
      "Temp_c": -6.6,
      "Dewpoint_c": -53.6,
      "Wind_Direction": 316,
      "Wind_Speed_kt": 4.9
    },
    {
      "Pressure_mb": 563.9,
      "Altitude_m": 4890,
      "Temp_c": -6.6,
      "Dewpoint_c": -53.6,
      "Wind_Direction": 316,
      "Wind_Speed_kt": 4.9
    },
    {
      "Pressure_mb": 563.6,
      "Altitude_m": 4895,
      "Temp_c": -6.6,
      "Dewpoint_c": -53.6,
      "Wind_Direction": 317,
      "Wind_Speed_kt": 4.9
    },
    {
      "Pressure_mb": 563.2,
      "Altitude_m": 4900,
      "Temp_c": -6.7,
      "Dewpoint_c": -53.6,
      "Wind_Direction": 317,
      "Wind_Speed_kt": 4.9
    },
    {
      "Pressure_mb": 562.9,
      "Altitude_m": 4905,
      "Temp_c": -6.7,
      "Dewpoint_c": -53.7,
      "Wind_Direction": 317,
      "Wind_Speed_kt": 5
    },
    {
      "Pressure_mb": 562.6,
      "Altitude_m": 4909,
      "Temp_c": -6.7,
      "Dewpoint_c": -53.7,
      "Wind_Direction": 317,
      "Wind_Speed_kt": 5
    },
    {
      "Pressure_mb": 562.3,
      "Altitude_m": 4913,
      "Temp_c": -6.8,
      "Dewpoint_c": -53.7,
      "Wind_Direction": 317,
      "Wind_Speed_kt": 5
    },
    {
      "Pressure_mb": 561.9,
      "Altitude_m": 4918,
      "Temp_c": -6.8,
      "Dewpoint_c": -53.7,
      "Wind_Direction": 317,
      "Wind_Speed_kt": 5
    },
    {
      "Pressure_mb": 561.6,
      "Altitude_m": 4922,
      "Temp_c": -6.8,
      "Dewpoint_c": -53.8,
      "Wind_Direction": 317,
      "Wind_Speed_kt": 5
    },
    {
      "Pressure_mb": 561.3,
      "Altitude_m": 4927,
      "Temp_c": -6.9,
      "Dewpoint_c": -53.8,
      "Wind_Direction": 316,
      "Wind_Speed_kt": 5
    },
    {
      "Pressure_mb": 561,
      "Altitude_m": 4930,
      "Temp_c": -6.9,
      "Dewpoint_c": -53.8,
      "Wind_Direction": 316,
      "Wind_Speed_kt": 5
    },
    {
      "Pressure_mb": 560.8,
      "Altitude_m": 4934,
      "Temp_c": -6.9,
      "Dewpoint_c": -53.8,
      "Wind_Direction": 316,
      "Wind_Speed_kt": 5
    },
    {
      "Pressure_mb": 560.5,
      "Altitude_m": 4938,
      "Temp_c": -7,
      "Dewpoint_c": -53.8,
      "Wind_Direction": 316,
      "Wind_Speed_kt": 4.9
    },
    {
      "Pressure_mb": 560.2,
      "Altitude_m": 4941,
      "Temp_c": -7,
      "Dewpoint_c": -53.9,
      "Wind_Direction": 316,
      "Wind_Speed_kt": 4.9
    },
    {
      "Pressure_mb": 560,
      "Altitude_m": 4945,
      "Temp_c": -7,
      "Dewpoint_c": -53.9,
      "Wind_Direction": 316,
      "Wind_Speed_kt": 4.9
    },
    {
      "Pressure_mb": 559.7,
      "Altitude_m": 4948,
      "Temp_c": -7.1,
      "Dewpoint_c": -53.9,
      "Wind_Direction": 315,
      "Wind_Speed_kt": 4.9
    },
    {
      "Pressure_mb": 559.4,
      "Altitude_m": 4952,
      "Temp_c": -7.1,
      "Dewpoint_c": -53.9,
      "Wind_Direction": 315,
      "Wind_Speed_kt": 4.9
    },
    {
      "Pressure_mb": 559.2,
      "Altitude_m": 4956,
      "Temp_c": -7.1,
      "Dewpoint_c": -53.9,
      "Wind_Direction": 315,
      "Wind_Speed_kt": 4.9
    },
    {
      "Pressure_mb": 558.9,
      "Altitude_m": 4960,
      "Temp_c": -7.2,
      "Dewpoint_c": -54,
      "Wind_Direction": 315,
      "Wind_Speed_kt": 4.9
    },
    {
      "Pressure_mb": 558.6,
      "Altitude_m": 4964,
      "Temp_c": -7.2,
      "Dewpoint_c": -54,
      "Wind_Direction": 315,
      "Wind_Speed_kt": 4.9
    },
    {
      "Pressure_mb": 558.4,
      "Altitude_m": 4967,
      "Temp_c": -7.2,
      "Dewpoint_c": -54,
      "Wind_Direction": 315,
      "Wind_Speed_kt": 4.9
    },
    {
      "Pressure_mb": 558.1,
      "Altitude_m": 4971,
      "Temp_c": -7.3,
      "Dewpoint_c": -54,
      "Wind_Direction": 314,
      "Wind_Speed_kt": 4.9
    },
    {
      "Pressure_mb": 557.8,
      "Altitude_m": 4975,
      "Temp_c": -7.3,
      "Dewpoint_c": -54,
      "Wind_Direction": 314,
      "Wind_Speed_kt": 4.9
    },
    {
      "Pressure_mb": 557.5,
      "Altitude_m": 4979,
      "Temp_c": -7.3,
      "Dewpoint_c": -54.1,
      "Wind_Direction": 314,
      "Wind_Speed_kt": 4.9
    },
    {
      "Pressure_mb": 557.2,
      "Altitude_m": 4983,
      "Temp_c": -7.3,
      "Dewpoint_c": -54.1,
      "Wind_Direction": 314,
      "Wind_Speed_kt": 4.9
    },
    {
      "Pressure_mb": 556.9,
      "Altitude_m": 4987,
      "Temp_c": -7.4,
      "Dewpoint_c": -54.1,
      "Wind_Direction": 314,
      "Wind_Speed_kt": 4.9
    },
    {
      "Pressure_mb": 556.7,
      "Altitude_m": 4991,
      "Temp_c": -7.4,
      "Dewpoint_c": -54.1,
      "Wind_Direction": 314,
      "Wind_Speed_kt": 4.8
    },
    {
      "Pressure_mb": 556.4,
      "Altitude_m": 4995,
      "Temp_c": -7.4,
      "Dewpoint_c": -54.1,
      "Wind_Direction": 314,
      "Wind_Speed_kt": 4.8
    },
    {
      "Pressure_mb": 556.1,
      "Altitude_m": 4999,
      "Temp_c": -7.5,
      "Dewpoint_c": -54.2,
      "Wind_Direction": 314,
      "Wind_Speed_kt": 4.8
    },
    {
      "Pressure_mb": 555.8,
      "Altitude_m": 5003,
      "Temp_c": -7.5,
      "Dewpoint_c": -54.2,
      "Wind_Direction": 314,
      "Wind_Speed_kt": 4.8
    },
    {
      "Pressure_mb": 555.5,
      "Altitude_m": 5007,
      "Temp_c": -7.5,
      "Dewpoint_c": -54.2,
      "Wind_Direction": 314,
      "Wind_Speed_kt": 4.8
    },
    {
      "Pressure_mb": 555.2,
      "Altitude_m": 5012,
      "Temp_c": -7.6,
      "Dewpoint_c": -54.2,
      "Wind_Direction": 314,
      "Wind_Speed_kt": 4.8
    },
    {
      "Pressure_mb": 554.9,
      "Altitude_m": 5016,
      "Temp_c": -7.6,
      "Dewpoint_c": -54.3,
      "Wind_Direction": 314,
      "Wind_Speed_kt": 4.8
    },
    {
      "Pressure_mb": 554.6,
      "Altitude_m": 5020,
      "Temp_c": -7.7,
      "Dewpoint_c": -54.3,
      "Wind_Direction": 314,
      "Wind_Speed_kt": 4.8
    },
    {
      "Pressure_mb": 554.3,
      "Altitude_m": 5024,
      "Temp_c": -7.7,
      "Dewpoint_c": -54.3,
      "Wind_Direction": 314,
      "Wind_Speed_kt": 4.8
    },
    {
      "Pressure_mb": 554,
      "Altitude_m": 5029,
      "Temp_c": -7.7,
      "Dewpoint_c": -54.3,
      "Wind_Direction": 314,
      "Wind_Speed_kt": 4.8
    },
    {
      "Pressure_mb": 553.7,
      "Altitude_m": 5033,
      "Temp_c": -7.8,
      "Dewpoint_c": -54.4,
      "Wind_Direction": 314,
      "Wind_Speed_kt": 4.8
    },
    {
      "Pressure_mb": 553.3,
      "Altitude_m": 5038,
      "Temp_c": -7.8,
      "Dewpoint_c": -54.4,
      "Wind_Direction": 314,
      "Wind_Speed_kt": 4.8
    },
    {
      "Pressure_mb": 553,
      "Altitude_m": 5042,
      "Temp_c": -7.8,
      "Dewpoint_c": -54.4,
      "Wind_Direction": 314,
      "Wind_Speed_kt": 4.8
    },
    {
      "Pressure_mb": 552.7,
      "Altitude_m": 5046,
      "Temp_c": -7.9,
      "Dewpoint_c": -54.4,
      "Wind_Direction": 315,
      "Wind_Speed_kt": 4.8
    },
    {
      "Pressure_mb": 552.3,
      "Altitude_m": 5051,
      "Temp_c": -7.9,
      "Dewpoint_c": -54.5,
      "Wind_Direction": 315,
      "Wind_Speed_kt": 4.8
    },
    {
      "Pressure_mb": 552,
      "Altitude_m": 5057,
      "Temp_c": -8,
      "Dewpoint_c": -54.5,
      "Wind_Direction": 315,
      "Wind_Speed_kt": 4.8
    },
    {
      "Pressure_mb": 551.6,
      "Altitude_m": 5062,
      "Temp_c": -8,
      "Dewpoint_c": -54.5,
      "Wind_Direction": 315,
      "Wind_Speed_kt": 4.8
    },
    {
      "Pressure_mb": 551.2,
      "Altitude_m": 5067,
      "Temp_c": -8,
      "Dewpoint_c": -54.5,
      "Wind_Direction": 315,
      "Wind_Speed_kt": 4.8
    },
    {
      "Pressure_mb": 550.9,
      "Altitude_m": 5072,
      "Temp_c": -8,
      "Dewpoint_c": -54.6,
      "Wind_Direction": 315,
      "Wind_Speed_kt": 4.8
    },
    {
      "Pressure_mb": 550.5,
      "Altitude_m": 5077,
      "Temp_c": -8.1,
      "Dewpoint_c": -54.6,
      "Wind_Direction": 315,
      "Wind_Speed_kt": 4.8
    },
    {
      "Pressure_mb": 550.1,
      "Altitude_m": 5083,
      "Temp_c": -8.1,
      "Dewpoint_c": -54.6,
      "Wind_Direction": 315,
      "Wind_Speed_kt": 4.8
    },
    {
      "Pressure_mb": 549.8,
      "Altitude_m": 5088,
      "Temp_c": -8.1,
      "Dewpoint_c": -54.6,
      "Wind_Direction": 315,
      "Wind_Speed_kt": 4.8
    },
    {
      "Pressure_mb": 549.4,
      "Altitude_m": 5093,
      "Temp_c": -8.2,
      "Dewpoint_c": -54.6,
      "Wind_Direction": 315,
      "Wind_Speed_kt": 4.9
    },
    {
      "Pressure_mb": 549,
      "Altitude_m": 5098,
      "Temp_c": -8.2,
      "Dewpoint_c": -54.7,
      "Wind_Direction": 315,
      "Wind_Speed_kt": 4.9
    },
    {
      "Pressure_mb": 548.7,
      "Altitude_m": 5103,
      "Temp_c": -8.2,
      "Dewpoint_c": -54.7,
      "Wind_Direction": 314,
      "Wind_Speed_kt": 5
    },
    {
      "Pressure_mb": 548.3,
      "Altitude_m": 5108,
      "Temp_c": -8.3,
      "Dewpoint_c": -54.7,
      "Wind_Direction": 314,
      "Wind_Speed_kt": 5
    },
    {
      "Pressure_mb": 547.9,
      "Altitude_m": 5114,
      "Temp_c": -8.3,
      "Dewpoint_c": -54.7,
      "Wind_Direction": 314,
      "Wind_Speed_kt": 5.1
    },
    {
      "Pressure_mb": 547.6,
      "Altitude_m": 5119,
      "Temp_c": -8.3,
      "Dewpoint_c": -54.8,
      "Wind_Direction": 314,
      "Wind_Speed_kt": 5.1
    },
    {
      "Pressure_mb": 547.2,
      "Altitude_m": 5124,
      "Temp_c": -8.4,
      "Dewpoint_c": -54.8,
      "Wind_Direction": 314,
      "Wind_Speed_kt": 5.2
    },
    {
      "Pressure_mb": 546.9,
      "Altitude_m": 5129,
      "Temp_c": -8.4,
      "Dewpoint_c": -54.8,
      "Wind_Direction": 314,
      "Wind_Speed_kt": 5.2
    },
    {
      "Pressure_mb": 546.5,
      "Altitude_m": 5134,
      "Temp_c": -8.4,
      "Dewpoint_c": -54.8,
      "Wind_Direction": 314,
      "Wind_Speed_kt": 5.3
    },
    {
      "Pressure_mb": 546.1,
      "Altitude_m": 5139,
      "Temp_c": -8.4,
      "Dewpoint_c": -54.8,
      "Wind_Direction": 314,
      "Wind_Speed_kt": 5.3
    },
    {
      "Pressure_mb": 545.8,
      "Altitude_m": 5145,
      "Temp_c": -8.5,
      "Dewpoint_c": -54.9,
      "Wind_Direction": 313,
      "Wind_Speed_kt": 5.4
    },
    {
      "Pressure_mb": 545.4,
      "Altitude_m": 5150,
      "Temp_c": -8.5,
      "Dewpoint_c": -54.9,
      "Wind_Direction": 313,
      "Wind_Speed_kt": 5.4
    },
    {
      "Pressure_mb": 545,
      "Altitude_m": 5155,
      "Temp_c": -8.5,
      "Dewpoint_c": -54.9,
      "Wind_Direction": 313,
      "Wind_Speed_kt": 5.5
    },
    {
      "Pressure_mb": 544.6,
      "Altitude_m": 5160,
      "Temp_c": -8.5,
      "Dewpoint_c": -54.9,
      "Wind_Direction": 313,
      "Wind_Speed_kt": 5.5
    },
    {
      "Pressure_mb": 544.3,
      "Altitude_m": 5166,
      "Temp_c": -8.6,
      "Dewpoint_c": -54.9,
      "Wind_Direction": 313,
      "Wind_Speed_kt": 5.6
    },
    {
      "Pressure_mb": 543.8,
      "Altitude_m": 5173,
      "Temp_c": -8.6,
      "Dewpoint_c": -54.9,
      "Wind_Direction": 313,
      "Wind_Speed_kt": 5.7
    },
    {
      "Pressure_mb": 543.6,
      "Altitude_m": 5176,
      "Temp_c": -8.6,
      "Dewpoint_c": -55,
      "Wind_Direction": 313,
      "Wind_Speed_kt": 5.7
    },
    {
      "Pressure_mb": 543.3,
      "Altitude_m": 5180,
      "Temp_c": -8.6,
      "Dewpoint_c": -55,
      "Wind_Direction": 312,
      "Wind_Speed_kt": 5.8
    },
    {
      "Pressure_mb": 542.9,
      "Altitude_m": 5185,
      "Temp_c": -8.7,
      "Dewpoint_c": -55,
      "Wind_Direction": 312,
      "Wind_Speed_kt": 5.8
    },
    {
      "Pressure_mb": 542.6,
      "Altitude_m": 5189,
      "Temp_c": -8.7,
      "Dewpoint_c": -55,
      "Wind_Direction": 312,
      "Wind_Speed_kt": 5.9
    },
    {
      "Pressure_mb": 542.3,
      "Altitude_m": 5194,
      "Temp_c": -8.7,
      "Dewpoint_c": -55,
      "Wind_Direction": 312,
      "Wind_Speed_kt": 5.9
    },
    {
      "Pressure_mb": 542,
      "Altitude_m": 5198,
      "Temp_c": -8.7,
      "Dewpoint_c": -55,
      "Wind_Direction": 312,
      "Wind_Speed_kt": 6
    },
    {
      "Pressure_mb": 541.7,
      "Altitude_m": 5203,
      "Temp_c": -8.7,
      "Dewpoint_c": -55,
      "Wind_Direction": 312,
      "Wind_Speed_kt": 6.1
    },
    {
      "Pressure_mb": 541.4,
      "Altitude_m": 5208,
      "Temp_c": -8.8,
      "Dewpoint_c": -55,
      "Wind_Direction": 312,
      "Wind_Speed_kt": 6.1
    },
    {
      "Pressure_mb": 541.1,
      "Altitude_m": 5212,
      "Temp_c": -8.8,
      "Dewpoint_c": -55,
      "Wind_Direction": 311,
      "Wind_Speed_kt": 6.2
    },
    {
      "Pressure_mb": 540.8,
      "Altitude_m": 5217,
      "Temp_c": -8.8,
      "Dewpoint_c": -55.1,
      "Wind_Direction": 311,
      "Wind_Speed_kt": 6.2
    },
    {
      "Pressure_mb": 540.4,
      "Altitude_m": 5221,
      "Temp_c": -8.8,
      "Dewpoint_c": -55.1,
      "Wind_Direction": 311,
      "Wind_Speed_kt": 6.3
    },
    {
      "Pressure_mb": 540.1,
      "Altitude_m": 5225,
      "Temp_c": -8.8,
      "Dewpoint_c": -55.1,
      "Wind_Direction": 311,
      "Wind_Speed_kt": 6.4
    },
    {
      "Pressure_mb": 539.9,
      "Altitude_m": 5228,
      "Temp_c": -8.8,
      "Dewpoint_c": -55.1,
      "Wind_Direction": 311,
      "Wind_Speed_kt": 6.4
    },
    {
      "Pressure_mb": 539.6,
      "Altitude_m": 5232,
      "Temp_c": -8.9,
      "Dewpoint_c": -55.1,
      "Wind_Direction": 311,
      "Wind_Speed_kt": 6.5
    },
    {
      "Pressure_mb": 539.4,
      "Altitude_m": 5235,
      "Temp_c": -8.9,
      "Dewpoint_c": -55.1,
      "Wind_Direction": 311,
      "Wind_Speed_kt": 6.6
    },
    {
      "Pressure_mb": 539.1,
      "Altitude_m": 5239,
      "Temp_c": -8.9,
      "Dewpoint_c": -55.1,
      "Wind_Direction": 310,
      "Wind_Speed_kt": 6.6
    },
    {
      "Pressure_mb": 538.9,
      "Altitude_m": 5242,
      "Temp_c": -8.9,
      "Dewpoint_c": -55.1,
      "Wind_Direction": 310,
      "Wind_Speed_kt": 6.7
    },
    {
      "Pressure_mb": 538.6,
      "Altitude_m": 5246,
      "Temp_c": -8.9,
      "Dewpoint_c": -55.1,
      "Wind_Direction": 310,
      "Wind_Speed_kt": 6.7
    },
    {
      "Pressure_mb": 538.4,
      "Altitude_m": 5250,
      "Temp_c": -9,
      "Dewpoint_c": -55.1,
      "Wind_Direction": 310,
      "Wind_Speed_kt": 6.8
    },
    {
      "Pressure_mb": 538.1,
      "Altitude_m": 5254,
      "Temp_c": -9,
      "Dewpoint_c": -55.2,
      "Wind_Direction": 310,
      "Wind_Speed_kt": 6.9
    },
    {
      "Pressure_mb": 537.8,
      "Altitude_m": 5258,
      "Temp_c": -9,
      "Dewpoint_c": -55.2,
      "Wind_Direction": 310,
      "Wind_Speed_kt": 6.9
    },
    {
      "Pressure_mb": 537.5,
      "Altitude_m": 5262,
      "Temp_c": -9,
      "Dewpoint_c": -55.2,
      "Wind_Direction": 310,
      "Wind_Speed_kt": 7
    },
    {
      "Pressure_mb": 537.2,
      "Altitude_m": 5266,
      "Temp_c": -9.1,
      "Dewpoint_c": -55.2,
      "Wind_Direction": 309,
      "Wind_Speed_kt": 7.1
    },
    {
      "Pressure_mb": 537,
      "Altitude_m": 5270,
      "Temp_c": -9.1,
      "Dewpoint_c": -55.2,
      "Wind_Direction": 310,
      "Wind_Speed_kt": 7.1
    },
    {
      "Pressure_mb": 536.7,
      "Altitude_m": 5274,
      "Temp_c": -9.1,
      "Dewpoint_c": -55.2,
      "Wind_Direction": 310,
      "Wind_Speed_kt": 7.1
    },
    {
      "Pressure_mb": 536.4,
      "Altitude_m": 5278,
      "Temp_c": -9.1,
      "Dewpoint_c": -55.3,
      "Wind_Direction": 310,
      "Wind_Speed_kt": 7.1
    },
    {
      "Pressure_mb": 536.1,
      "Altitude_m": 5283,
      "Temp_c": -9.2,
      "Dewpoint_c": -55.3,
      "Wind_Direction": 310,
      "Wind_Speed_kt": 7.2
    },
    {
      "Pressure_mb": 535.8,
      "Altitude_m": 5287,
      "Temp_c": -9.2,
      "Dewpoint_c": -55.3,
      "Wind_Direction": 310,
      "Wind_Speed_kt": 7.2
    },
    {
      "Pressure_mb": 535.6,
      "Altitude_m": 5291,
      "Temp_c": -9.2,
      "Dewpoint_c": -55.3,
      "Wind_Direction": 310,
      "Wind_Speed_kt": 7.2
    },
    {
      "Pressure_mb": 535.3,
      "Altitude_m": 5294,
      "Temp_c": -9.2,
      "Dewpoint_c": -55.3,
      "Wind_Direction": 310,
      "Wind_Speed_kt": 7.2
    },
    {
      "Pressure_mb": 535,
      "Altitude_m": 5298,
      "Temp_c": -9.3,
      "Dewpoint_c": -55.3,
      "Wind_Direction": 310,
      "Wind_Speed_kt": 7.2
    },
    {
      "Pressure_mb": 534.7,
      "Altitude_m": 5302,
      "Temp_c": -9.3,
      "Dewpoint_c": -55.4,
      "Wind_Direction": 310,
      "Wind_Speed_kt": 7.3
    },
    {
      "Pressure_mb": 534.5,
      "Altitude_m": 5306,
      "Temp_c": -9.3,
      "Dewpoint_c": -55.4,
      "Wind_Direction": 310,
      "Wind_Speed_kt": 7.3
    },
    {
      "Pressure_mb": 534.2,
      "Altitude_m": 5310,
      "Temp_c": -9.3,
      "Dewpoint_c": -55.4,
      "Wind_Direction": 310,
      "Wind_Speed_kt": 7.3
    },
    {
      "Pressure_mb": 533.9,
      "Altitude_m": 5314,
      "Temp_c": -9.4,
      "Dewpoint_c": -55.4,
      "Wind_Direction": 310,
      "Wind_Speed_kt": 7.3
    },
    {
      "Pressure_mb": 533.6,
      "Altitude_m": 5319,
      "Temp_c": -9.4,
      "Dewpoint_c": -55.4,
      "Wind_Direction": 310,
      "Wind_Speed_kt": 7.4
    },
    {
      "Pressure_mb": 533.3,
      "Altitude_m": 5323,
      "Temp_c": -9.4,
      "Dewpoint_c": -55.4,
      "Wind_Direction": 310,
      "Wind_Speed_kt": 7.4
    },
    {
      "Pressure_mb": 533,
      "Altitude_m": 5327,
      "Temp_c": -9.4,
      "Dewpoint_c": -55.4,
      "Wind_Direction": 310,
      "Wind_Speed_kt": 7.4
    },
    {
      "Pressure_mb": 532.7,
      "Altitude_m": 5331,
      "Temp_c": -9.5,
      "Dewpoint_c": -55.5,
      "Wind_Direction": 310,
      "Wind_Speed_kt": 7.4
    },
    {
      "Pressure_mb": 532.5,
      "Altitude_m": 5335,
      "Temp_c": -9.5,
      "Dewpoint_c": -55.5,
      "Wind_Direction": 311,
      "Wind_Speed_kt": 7.4
    },
    {
      "Pressure_mb": 532.2,
      "Altitude_m": 5340,
      "Temp_c": -9.5,
      "Dewpoint_c": -55.5,
      "Wind_Direction": 311,
      "Wind_Speed_kt": 7.5
    },
    {
      "Pressure_mb": 531.9,
      "Altitude_m": 5344,
      "Temp_c": -9.5,
      "Dewpoint_c": -55.5,
      "Wind_Direction": 311,
      "Wind_Speed_kt": 7.5
    },
    {
      "Pressure_mb": 531.5,
      "Altitude_m": 5348,
      "Temp_c": -9.6,
      "Dewpoint_c": -55.5,
      "Wind_Direction": 311,
      "Wind_Speed_kt": 7.5
    },
    {
      "Pressure_mb": 531.2,
      "Altitude_m": 5353,
      "Temp_c": -9.6,
      "Dewpoint_c": -55.5,
      "Wind_Direction": 310,
      "Wind_Speed_kt": 7.5
    },
    {
      "Pressure_mb": 530.9,
      "Altitude_m": 5357,
      "Temp_c": -9.6,
      "Dewpoint_c": -55.5,
      "Wind_Direction": 310,
      "Wind_Speed_kt": 7.5
    },
    {
      "Pressure_mb": 530.6,
      "Altitude_m": 5362,
      "Temp_c": -9.7,
      "Dewpoint_c": -55.6,
      "Wind_Direction": 310,
      "Wind_Speed_kt": 7.5
    },
    {
      "Pressure_mb": 530.2,
      "Altitude_m": 5367,
      "Temp_c": -9.7,
      "Dewpoint_c": -55.6,
      "Wind_Direction": 309,
      "Wind_Speed_kt": 7.6
    },
    {
      "Pressure_mb": 529.9,
      "Altitude_m": 5372,
      "Temp_c": -9.7,
      "Dewpoint_c": -55.6,
      "Wind_Direction": 309,
      "Wind_Speed_kt": 7.6
    },
    {
      "Pressure_mb": 529.6,
      "Altitude_m": 5377,
      "Temp_c": -9.8,
      "Dewpoint_c": -55.6,
      "Wind_Direction": 309,
      "Wind_Speed_kt": 7.6
    },
    {
      "Pressure_mb": 529.2,
      "Altitude_m": 5382,
      "Temp_c": -9.8,
      "Dewpoint_c": -55.6,
      "Wind_Direction": 309,
      "Wind_Speed_kt": 7.6
    },
    {
      "Pressure_mb": 528.9,
      "Altitude_m": 5388,
      "Temp_c": -9.8,
      "Dewpoint_c": -55.7,
      "Wind_Direction": 308,
      "Wind_Speed_kt": 7.6
    },
    {
      "Pressure_mb": 528.5,
      "Altitude_m": 5393,
      "Temp_c": -9.9,
      "Dewpoint_c": -55.7,
      "Wind_Direction": 308,
      "Wind_Speed_kt": 7.6
    },
    {
      "Pressure_mb": 528.2,
      "Altitude_m": 5398,
      "Temp_c": -9.9,
      "Dewpoint_c": -55.7,
      "Wind_Direction": 308,
      "Wind_Speed_kt": 7.6
    },
    {
      "Pressure_mb": 527.8,
      "Altitude_m": 5403,
      "Temp_c": -9.9,
      "Dewpoint_c": -55.7,
      "Wind_Direction": 307,
      "Wind_Speed_kt": 7.7
    },
    {
      "Pressure_mb": 527.5,
      "Altitude_m": 5408,
      "Temp_c": -10,
      "Dewpoint_c": -55.8,
      "Wind_Direction": 307,
      "Wind_Speed_kt": 7.7
    },
    {
      "Pressure_mb": 527.1,
      "Altitude_m": 5413,
      "Temp_c": -10,
      "Dewpoint_c": -53.1,
      "Wind_Direction": 307,
      "Wind_Speed_kt": 7.7
    },
    {
      "Pressure_mb": 526.8,
      "Altitude_m": 5418,
      "Temp_c": -10,
      "Dewpoint_c": -53.1,
      "Wind_Direction": 306,
      "Wind_Speed_kt": 7.7
    },
    {
      "Pressure_mb": 526.5,
      "Altitude_m": 5423,
      "Temp_c": -10.1,
      "Dewpoint_c": -53.1,
      "Wind_Direction": 306,
      "Wind_Speed_kt": 7.7
    },
    {
      "Pressure_mb": 526.1,
      "Altitude_m": 5428,
      "Temp_c": -10.1,
      "Dewpoint_c": -53.2,
      "Wind_Direction": 306,
      "Wind_Speed_kt": 7.7
    },
    {
      "Pressure_mb": 525.8,
      "Altitude_m": 5432,
      "Temp_c": -10.2,
      "Dewpoint_c": -53.2,
      "Wind_Direction": 306,
      "Wind_Speed_kt": 7.8
    },
    {
      "Pressure_mb": 525.5,
      "Altitude_m": 5437,
      "Temp_c": -10.2,
      "Dewpoint_c": -53.2,
      "Wind_Direction": 305,
      "Wind_Speed_kt": 7.8
    },
    {
      "Pressure_mb": 525.1,
      "Altitude_m": 5442,
      "Temp_c": -10.2,
      "Dewpoint_c": -53.3,
      "Wind_Direction": 305,
      "Wind_Speed_kt": 7.8
    },
    {
      "Pressure_mb": 524.8,
      "Altitude_m": 5446,
      "Temp_c": -10.3,
      "Dewpoint_c": -53.3,
      "Wind_Direction": 305,
      "Wind_Speed_kt": 7.8
    },
    {
      "Pressure_mb": 524.4,
      "Altitude_m": 5451,
      "Temp_c": -10.3,
      "Dewpoint_c": -53.3,
      "Wind_Direction": 305,
      "Wind_Speed_kt": 7.8
    },
    {
      "Pressure_mb": 524.1,
      "Altitude_m": 5457,
      "Temp_c": -10.4,
      "Dewpoint_c": -53.4,
      "Wind_Direction": 305,
      "Wind_Speed_kt": 7.7
    },
    {
      "Pressure_mb": 523.8,
      "Altitude_m": 5462,
      "Temp_c": -10.4,
      "Dewpoint_c": -53.4,
      "Wind_Direction": 305,
      "Wind_Speed_kt": 7.7
    },
    {
      "Pressure_mb": 523.5,
      "Altitude_m": 5466,
      "Temp_c": -10.4,
      "Dewpoint_c": -53.4,
      "Wind_Direction": 305,
      "Wind_Speed_kt": 7.7
    },
    {
      "Pressure_mb": 523,
      "Altitude_m": 5473,
      "Temp_c": -10.5,
      "Dewpoint_c": -53.4,
      "Wind_Direction": 304,
      "Wind_Speed_kt": 7.6
    },
    {
      "Pressure_mb": 522.6,
      "Altitude_m": 5479,
      "Temp_c": -10.5,
      "Dewpoint_c": -53.5,
      "Wind_Direction": 304,
      "Wind_Speed_kt": 7.6
    },
    {
      "Pressure_mb": 522.2,
      "Altitude_m": 5485,
      "Temp_c": -10.6,
      "Dewpoint_c": -53.5,
      "Wind_Direction": 304,
      "Wind_Speed_kt": 7.5
    },
    {
      "Pressure_mb": 521.8,
      "Altitude_m": 5491,
      "Temp_c": -10.6,
      "Dewpoint_c": -53.5,
      "Wind_Direction": 304,
      "Wind_Speed_kt": 7.5
    },
    {
      "Pressure_mb": 521.4,
      "Altitude_m": 5497,
      "Temp_c": -10.7,
      "Dewpoint_c": -53.6,
      "Wind_Direction": 304,
      "Wind_Speed_kt": 7.4
    },
    {
      "Pressure_mb": 521,
      "Altitude_m": 5503,
      "Temp_c": -10.7,
      "Dewpoint_c": -53.6,
      "Wind_Direction": 304,
      "Wind_Speed_kt": 7.4
    },
    {
      "Pressure_mb": 520.6,
      "Altitude_m": 5509,
      "Temp_c": -10.8,
      "Dewpoint_c": -53.6,
      "Wind_Direction": 304,
      "Wind_Speed_kt": 7.4
    },
    {
      "Pressure_mb": 520.2,
      "Altitude_m": 5515,
      "Temp_c": -10.8,
      "Dewpoint_c": -53.7,
      "Wind_Direction": 304,
      "Wind_Speed_kt": 7.3
    },
    {
      "Pressure_mb": 519.8,
      "Altitude_m": 5521,
      "Temp_c": -10.9,
      "Dewpoint_c": -53.7,
      "Wind_Direction": 304,
      "Wind_Speed_kt": 7.3
    },
    {
      "Pressure_mb": 519.4,
      "Altitude_m": 5527,
      "Temp_c": -10.9,
      "Dewpoint_c": -53.7,
      "Wind_Direction": 304,
      "Wind_Speed_kt": 7.2
    },
    {
      "Pressure_mb": 519,
      "Altitude_m": 5533,
      "Temp_c": -10.9,
      "Dewpoint_c": -53.8,
      "Wind_Direction": 304,
      "Wind_Speed_kt": 7.2
    },
    {
      "Pressure_mb": 518.6,
      "Altitude_m": 5539,
      "Temp_c": -11,
      "Dewpoint_c": -53.8,
      "Wind_Direction": 304,
      "Wind_Speed_kt": 7.1
    },
    {
      "Pressure_mb": 518.3,
      "Altitude_m": 5545,
      "Temp_c": -11,
      "Dewpoint_c": -53.8,
      "Wind_Direction": 304,
      "Wind_Speed_kt": 7.1
    },
    {
      "Pressure_mb": 518,
      "Altitude_m": 5551,
      "Temp_c": -11.1,
      "Dewpoint_c": -53.8,
      "Wind_Direction": 304,
      "Wind_Speed_kt": 7.1
    },
    {
      "Pressure_mb": 517.6,
      "Altitude_m": 5555,
      "Temp_c": -11.1,
      "Dewpoint_c": -53.9,
      "Wind_Direction": 304,
      "Wind_Speed_kt": 7
    },
    {
      "Pressure_mb": 517.3,
      "Altitude_m": 5559,
      "Temp_c": -11.2,
      "Dewpoint_c": -53.9,
      "Wind_Direction": 304,
      "Wind_Speed_kt": 7
    },
    {
      "Pressure_mb": 517,
      "Altitude_m": 5563,
      "Temp_c": -11.2,
      "Dewpoint_c": -53.9,
      "Wind_Direction": 304,
      "Wind_Speed_kt": 7
    },
    {
      "Pressure_mb": 516.7,
      "Altitude_m": 5567,
      "Temp_c": -11.2,
      "Dewpoint_c": -53.9,
      "Wind_Direction": 304,
      "Wind_Speed_kt": 7.1
    },
    {
      "Pressure_mb": 516.4,
      "Altitude_m": 5571,
      "Temp_c": -11.3,
      "Dewpoint_c": -54,
      "Wind_Direction": 304,
      "Wind_Speed_kt": 7.1
    },
    {
      "Pressure_mb": 516.2,
      "Altitude_m": 5575,
      "Temp_c": -11.3,
      "Dewpoint_c": -54,
      "Wind_Direction": 304,
      "Wind_Speed_kt": 7.2
    },
    {
      "Pressure_mb": 515.9,
      "Altitude_m": 5578,
      "Temp_c": -11.3,
      "Dewpoint_c": -54,
      "Wind_Direction": 303,
      "Wind_Speed_kt": 7.2
    },
    {
      "Pressure_mb": 515.7,
      "Altitude_m": 5582,
      "Temp_c": -11.4,
      "Dewpoint_c": -54,
      "Wind_Direction": 303,
      "Wind_Speed_kt": 7.2
    },
    {
      "Pressure_mb": 515.4,
      "Altitude_m": 5586,
      "Temp_c": -11.4,
      "Dewpoint_c": -54,
      "Wind_Direction": 303,
      "Wind_Speed_kt": 7.3
    },
    {
      "Pressure_mb": 515.1,
      "Altitude_m": 5589,
      "Temp_c": -11.4,
      "Dewpoint_c": -54.1,
      "Wind_Direction": 303,
      "Wind_Speed_kt": 7.3
    },
    {
      "Pressure_mb": 514.9,
      "Altitude_m": 5593,
      "Temp_c": -11.5,
      "Dewpoint_c": -54.1,
      "Wind_Direction": 303,
      "Wind_Speed_kt": 7.4
    },
    {
      "Pressure_mb": 514.5,
      "Altitude_m": 5598,
      "Temp_c": -11.5,
      "Dewpoint_c": -54.1,
      "Wind_Direction": 303,
      "Wind_Speed_kt": 7.4
    },
    {
      "Pressure_mb": 514.3,
      "Altitude_m": 5601,
      "Temp_c": -11.5,
      "Dewpoint_c": -54.1,
      "Wind_Direction": 303,
      "Wind_Speed_kt": 7.5
    },
    {
      "Pressure_mb": 514.1,
      "Altitude_m": 5605,
      "Temp_c": -11.6,
      "Dewpoint_c": -54.2,
      "Wind_Direction": 303,
      "Wind_Speed_kt": 7.5
    },
    {
      "Pressure_mb": 513.8,
      "Altitude_m": 5610,
      "Temp_c": -11.6,
      "Dewpoint_c": -54.2,
      "Wind_Direction": 303,
      "Wind_Speed_kt": 7.5
    },
    {
      "Pressure_mb": 513.5,
      "Altitude_m": 5614,
      "Temp_c": -11.6,
      "Dewpoint_c": -54.2,
      "Wind_Direction": 303,
      "Wind_Speed_kt": 7.6
    },
    {
      "Pressure_mb": 513.2,
      "Altitude_m": 5618,
      "Temp_c": -11.7,
      "Dewpoint_c": -54.2,
      "Wind_Direction": 303,
      "Wind_Speed_kt": 7.6
    },
    {
      "Pressure_mb": 512.9,
      "Altitude_m": 5623,
      "Temp_c": -11.7,
      "Dewpoint_c": -54.3,
      "Wind_Direction": 303,
      "Wind_Speed_kt": 7.7
    },
    {
      "Pressure_mb": 512.5,
      "Altitude_m": 5628,
      "Temp_c": -11.8,
      "Dewpoint_c": -54.3,
      "Wind_Direction": 303,
      "Wind_Speed_kt": 7.7
    },
    {
      "Pressure_mb": 512.2,
      "Altitude_m": 5633,
      "Temp_c": -11.8,
      "Dewpoint_c": -54.3,
      "Wind_Direction": 303,
      "Wind_Speed_kt": 7.8
    },
    {
      "Pressure_mb": 511.9,
      "Altitude_m": 5638,
      "Temp_c": -11.8,
      "Dewpoint_c": -54.3,
      "Wind_Direction": 302,
      "Wind_Speed_kt": 7.8
    },
    {
      "Pressure_mb": 511.6,
      "Altitude_m": 5643,
      "Temp_c": -11.9,
      "Dewpoint_c": -54.4,
      "Wind_Direction": 302,
      "Wind_Speed_kt": 7.9
    },
    {
      "Pressure_mb": 511.3,
      "Altitude_m": 5647,
      "Temp_c": -11.9,
      "Dewpoint_c": -54.4,
      "Wind_Direction": 302,
      "Wind_Speed_kt": 7.8
    },
    {
      "Pressure_mb": 511,
      "Altitude_m": 5652,
      "Temp_c": -11.9,
      "Dewpoint_c": -54.4,
      "Wind_Direction": 302,
      "Wind_Speed_kt": 7.8
    },
    {
      "Pressure_mb": 510.6,
      "Altitude_m": 5657,
      "Temp_c": -12,
      "Dewpoint_c": -54.4,
      "Wind_Direction": 302,
      "Wind_Speed_kt": 7.8
    },
    {
      "Pressure_mb": 510.3,
      "Altitude_m": 5662,
      "Temp_c": -12,
      "Dewpoint_c": -54.5,
      "Wind_Direction": 302,
      "Wind_Speed_kt": 7.8
    },
    {
      "Pressure_mb": 510,
      "Altitude_m": 5667,
      "Temp_c": -12,
      "Dewpoint_c": -54.5,
      "Wind_Direction": 302,
      "Wind_Speed_kt": 7.8
    },
    {
      "Pressure_mb": 509.7,
      "Altitude_m": 5671,
      "Temp_c": -12.1,
      "Dewpoint_c": -54.5,
      "Wind_Direction": 302,
      "Wind_Speed_kt": 7.8
    },
    {
      "Pressure_mb": 509.3,
      "Altitude_m": 5676,
      "Temp_c": -12.1,
      "Dewpoint_c": -54.6,
      "Wind_Direction": 302,
      "Wind_Speed_kt": 7.8
    },
    {
      "Pressure_mb": 509,
      "Altitude_m": 5681,
      "Temp_c": -12.2,
      "Dewpoint_c": -54.6,
      "Wind_Direction": 302,
      "Wind_Speed_kt": 7.8
    },
    {
      "Pressure_mb": 508.7,
      "Altitude_m": 5687,
      "Temp_c": -12.2,
      "Dewpoint_c": -54.6,
      "Wind_Direction": 302,
      "Wind_Speed_kt": 7.8
    },
    {
      "Pressure_mb": 508.3,
      "Altitude_m": 5692,
      "Temp_c": -12.2,
      "Dewpoint_c": -54.6,
      "Wind_Direction": 302,
      "Wind_Speed_kt": 7.8
    },
    {
      "Pressure_mb": 508,
      "Altitude_m": 5697,
      "Temp_c": -12.2,
      "Dewpoint_c": -54.7,
      "Wind_Direction": 302,
      "Wind_Speed_kt": 7.8
    },
    {
      "Pressure_mb": 507.7,
      "Altitude_m": 5701,
      "Temp_c": -12.3,
      "Dewpoint_c": -54.7,
      "Wind_Direction": 302,
      "Wind_Speed_kt": 7.8
    },
    {
      "Pressure_mb": 507.4,
      "Altitude_m": 5706,
      "Temp_c": -12.3,
      "Dewpoint_c": -54.7,
      "Wind_Direction": 302,
      "Wind_Speed_kt": 7.8
    },
    {
      "Pressure_mb": 507.1,
      "Altitude_m": 5710,
      "Temp_c": -12.3,
      "Dewpoint_c": -54.7,
      "Wind_Direction": 301,
      "Wind_Speed_kt": 7.8
    },
    {
      "Pressure_mb": 506.8,
      "Altitude_m": 5715,
      "Temp_c": -12.3,
      "Dewpoint_c": -54.7,
      "Wind_Direction": 301,
      "Wind_Speed_kt": 7.8
    },
    {
      "Pressure_mb": 506.5,
      "Altitude_m": 5719,
      "Temp_c": -12.4,
      "Dewpoint_c": -54.8,
      "Wind_Direction": 301,
      "Wind_Speed_kt": 7.7
    },
    {
      "Pressure_mb": 506.2,
      "Altitude_m": 5724,
      "Temp_c": -12.4,
      "Dewpoint_c": -54.8,
      "Wind_Direction": 301,
      "Wind_Speed_kt": 7.7
    },
    {
      "Pressure_mb": 505.9,
      "Altitude_m": 5728,
      "Temp_c": -12.4,
      "Dewpoint_c": -54.8,
      "Wind_Direction": 301,
      "Wind_Speed_kt": 7.7
    },
    {
      "Pressure_mb": 505.6,
      "Altitude_m": 5732,
      "Temp_c": -12.4,
      "Dewpoint_c": -54.8,
      "Wind_Direction": 301,
      "Wind_Speed_kt": 7.7
    },
    {
      "Pressure_mb": 505.4,
      "Altitude_m": 5736,
      "Temp_c": -12.5,
      "Dewpoint_c": -54.8,
      "Wind_Direction": 301,
      "Wind_Speed_kt": 7.7
    },
    {
      "Pressure_mb": 505.1,
      "Altitude_m": 5741,
      "Temp_c": -12.5,
      "Dewpoint_c": -54.9,
      "Wind_Direction": 301,
      "Wind_Speed_kt": 7.8
    },
    {
      "Pressure_mb": 504.8,
      "Altitude_m": 5745,
      "Temp_c": -12.5,
      "Dewpoint_c": -54.9,
      "Wind_Direction": 301,
      "Wind_Speed_kt": 7.9
    },
    {
      "Pressure_mb": 504.5,
      "Altitude_m": 5749,
      "Temp_c": -12.5,
      "Dewpoint_c": -54.9,
      "Wind_Direction": 301,
      "Wind_Speed_kt": 8
    },
    {
      "Pressure_mb": 504.2,
      "Altitude_m": 5753,
      "Temp_c": -12.6,
      "Dewpoint_c": -54.9,
      "Wind_Direction": 302,
      "Wind_Speed_kt": 8.1
    },
    {
      "Pressure_mb": 503.9,
      "Altitude_m": 5758,
      "Temp_c": -12.6,
      "Dewpoint_c": -54.9,
      "Wind_Direction": 302,
      "Wind_Speed_kt": 8.1
    },
    {
      "Pressure_mb": 503.6,
      "Altitude_m": 5762,
      "Temp_c": -12.6,
      "Dewpoint_c": -54.9,
      "Wind_Direction": 302,
      "Wind_Speed_kt": 8.2
    },
    {
      "Pressure_mb": 503.3,
      "Altitude_m": 5767,
      "Temp_c": -12.6,
      "Dewpoint_c": -54.9,
      "Wind_Direction": 302,
      "Wind_Speed_kt": 8.3
    },
    {
      "Pressure_mb": 503,
      "Altitude_m": 5771,
      "Temp_c": -12.6,
      "Dewpoint_c": -55,
      "Wind_Direction": 302,
      "Wind_Speed_kt": 8.4
    },
    {
      "Pressure_mb": 502.7,
      "Altitude_m": 5776,
      "Temp_c": -12.7,
      "Dewpoint_c": -55,
      "Wind_Direction": 302,
      "Wind_Speed_kt": 8.5
    },
    {
      "Pressure_mb": 502.4,
      "Altitude_m": 5781,
      "Temp_c": -12.7,
      "Dewpoint_c": -55,
      "Wind_Direction": 302,
      "Wind_Speed_kt": 8.6
    },
    {
      "Pressure_mb": 502.1,
      "Altitude_m": 5787,
      "Temp_c": -12.7,
      "Dewpoint_c": -55,
      "Wind_Direction": 302,
      "Wind_Speed_kt": 8.6
    },
    {
      "Pressure_mb": 501.7,
      "Altitude_m": 5792,
      "Temp_c": -12.7,
      "Dewpoint_c": -55,
      "Wind_Direction": 302,
      "Wind_Speed_kt": 8.7
    },
    {
      "Pressure_mb": 501.4,
      "Altitude_m": 5797,
      "Temp_c": -12.8,
      "Dewpoint_c": -55,
      "Wind_Direction": 303,
      "Wind_Speed_kt": 8.8
    },
    {
      "Pressure_mb": 501,
      "Altitude_m": 5803,
      "Temp_c": -12.8,
      "Dewpoint_c": -55,
      "Wind_Direction": 303,
      "Wind_Speed_kt": 8.9
    },
    {
      "Pressure_mb": 500.7,
      "Altitude_m": 5807,
      "Temp_c": -12.8,
      "Dewpoint_c": -55.1,
      "Wind_Direction": 303,
      "Wind_Speed_kt": 9
    },
    {
      "Pressure_mb": 500.4,
      "Altitude_m": 5811,
      "Temp_c": -12.8,
      "Dewpoint_c": -55.1,
      "Wind_Direction": 303,
      "Wind_Speed_kt": 9.1
    },
    {
      "Pressure_mb": 500,
      "Altitude_m": 5817,
      "Temp_c": -12.9,
      "Dewpoint_c": -55.1,
      "Wind_Direction": 303,
      "Wind_Speed_kt": 9.2
    },
    {
      "Pressure_mb": 499.8,
      "Altitude_m": 5820,
      "Temp_c": -12.9,
      "Dewpoint_c": -55.1,
      "Wind_Direction": 303,
      "Wind_Speed_kt": 9.2
    },
    {
      "Pressure_mb": 499.5,
      "Altitude_m": 5824,
      "Temp_c": -12.9,
      "Dewpoint_c": -55.1,
      "Wind_Direction": 303,
      "Wind_Speed_kt": 9.3
    },
    {
      "Pressure_mb": 499.2,
      "Altitude_m": 5829,
      "Temp_c": -12.9,
      "Dewpoint_c": -55.1,
      "Wind_Direction": 303,
      "Wind_Speed_kt": 9.4
    },
    {
      "Pressure_mb": 499,
      "Altitude_m": 5833,
      "Temp_c": -13,
      "Dewpoint_c": -55.2,
      "Wind_Direction": 303,
      "Wind_Speed_kt": 9.4
    },
    {
      "Pressure_mb": 498.6,
      "Altitude_m": 5838,
      "Temp_c": -13,
      "Dewpoint_c": -55.2,
      "Wind_Direction": 303,
      "Wind_Speed_kt": 9.4
    },
    {
      "Pressure_mb": 498.3,
      "Altitude_m": 5843,
      "Temp_c": -13,
      "Dewpoint_c": -55.2,
      "Wind_Direction": 303,
      "Wind_Speed_kt": 9.5
    },
    {
      "Pressure_mb": 498,
      "Altitude_m": 5848,
      "Temp_c": -13,
      "Dewpoint_c": -55.2,
      "Wind_Direction": 303,
      "Wind_Speed_kt": 9.5
    },
    {
      "Pressure_mb": 497.7,
      "Altitude_m": 5852,
      "Temp_c": -13.1,
      "Dewpoint_c": -55.2,
      "Wind_Direction": 303,
      "Wind_Speed_kt": 9.5
    },
    {
      "Pressure_mb": 497.4,
      "Altitude_m": 5857,
      "Temp_c": -13.1,
      "Dewpoint_c": -55.3,
      "Wind_Direction": 303,
      "Wind_Speed_kt": 9.6
    },
    {
      "Pressure_mb": 497.1,
      "Altitude_m": 5862,
      "Temp_c": -13.1,
      "Dewpoint_c": -55.3,
      "Wind_Direction": 303,
      "Wind_Speed_kt": 9.6
    },
    {
      "Pressure_mb": 496.8,
      "Altitude_m": 5866,
      "Temp_c": -13.1,
      "Dewpoint_c": -55.3,
      "Wind_Direction": 303,
      "Wind_Speed_kt": 9.6
    },
    {
      "Pressure_mb": 496.5,
      "Altitude_m": 5870,
      "Temp_c": -13.2,
      "Dewpoint_c": -55.3,
      "Wind_Direction": 303,
      "Wind_Speed_kt": 9.6
    },
    {
      "Pressure_mb": 496.2,
      "Altitude_m": 5875,
      "Temp_c": -13.2,
      "Dewpoint_c": -55.3,
      "Wind_Direction": 303,
      "Wind_Speed_kt": 9.7
    },
    {
      "Pressure_mb": 495.9,
      "Altitude_m": 5879,
      "Temp_c": -13.2,
      "Dewpoint_c": -55.3,
      "Wind_Direction": 303,
      "Wind_Speed_kt": 9.7
    },
    {
      "Pressure_mb": 495.6,
      "Altitude_m": 5884,
      "Temp_c": -13.2,
      "Dewpoint_c": -55.4,
      "Wind_Direction": 303,
      "Wind_Speed_kt": 9.7
    },
    {
      "Pressure_mb": 495.3,
      "Altitude_m": 5889,
      "Temp_c": -13.3,
      "Dewpoint_c": -55.4,
      "Wind_Direction": 303,
      "Wind_Speed_kt": 9.8
    },
    {
      "Pressure_mb": 495,
      "Altitude_m": 5894,
      "Temp_c": -13.3,
      "Dewpoint_c": -55.4,
      "Wind_Direction": 303,
      "Wind_Speed_kt": 9.8
    },
    {
      "Pressure_mb": 494.7,
      "Altitude_m": 5899,
      "Temp_c": -13.3,
      "Dewpoint_c": -55.4,
      "Wind_Direction": 303,
      "Wind_Speed_kt": 9.8
    },
    {
      "Pressure_mb": 494.4,
      "Altitude_m": 5904,
      "Temp_c": -13.3,
      "Dewpoint_c": -55.4,
      "Wind_Direction": 303,
      "Wind_Speed_kt": 9.8
    },
    {
      "Pressure_mb": 494.1,
      "Altitude_m": 5909,
      "Temp_c": -13.4,
      "Dewpoint_c": -55.4,
      "Wind_Direction": 303,
      "Wind_Speed_kt": 9.9
    },
    {
      "Pressure_mb": 493.7,
      "Altitude_m": 5913,
      "Temp_c": -13.4,
      "Dewpoint_c": -55.5,
      "Wind_Direction": 303,
      "Wind_Speed_kt": 9.9
    },
    {
      "Pressure_mb": 493.4,
      "Altitude_m": 5918,
      "Temp_c": -13.4,
      "Dewpoint_c": -55.5,
      "Wind_Direction": 303,
      "Wind_Speed_kt": 9.9
    },
    {
      "Pressure_mb": 493.1,
      "Altitude_m": 5923,
      "Temp_c": -13.4,
      "Dewpoint_c": -55.5,
      "Wind_Direction": 303,
      "Wind_Speed_kt": 9.9
    },
    {
      "Pressure_mb": 492.8,
      "Altitude_m": 5927,
      "Temp_c": -13.5,
      "Dewpoint_c": -55.5,
      "Wind_Direction": 303,
      "Wind_Speed_kt": 0
    },
    {
      "Pressure_mb": 492.6,
      "Altitude_m": 5932,
      "Temp_c": -13.5,
      "Dewpoint_c": -55.5,
      "Wind_Direction": 303,
      "Wind_Speed_kt": 0
    },
    {
      "Pressure_mb": 492.3,
      "Altitude_m": 5936,
      "Temp_c": -13.5,
      "Dewpoint_c": -55.6,
      "Wind_Direction": 303,
      "Wind_Speed_kt": 0.1
    },
    {
      "Pressure_mb": 492,
      "Altitude_m": 5941,
      "Temp_c": -13.6,
      "Dewpoint_c": -55.6,
      "Wind_Direction": 303,
      "Wind_Speed_kt": 0.1
    },
    {
      "Pressure_mb": 491.7,
      "Altitude_m": 5945,
      "Temp_c": -13.6,
      "Dewpoint_c": -55.6,
      "Wind_Direction": 303,
      "Wind_Speed_kt": 0.1
    },
    {
      "Pressure_mb": 491.4,
      "Altitude_m": 5950,
      "Temp_c": -13.6,
      "Dewpoint_c": -55.6,
      "Wind_Direction": 303,
      "Wind_Speed_kt": 0.2
    },
    {
      "Pressure_mb": 491.1,
      "Altitude_m": 5954,
      "Temp_c": -13.6,
      "Dewpoint_c": -55.6,
      "Wind_Direction": 303,
      "Wind_Speed_kt": 0.2
    },
    {
      "Pressure_mb": 490.8,
      "Altitude_m": 5958,
      "Temp_c": -13.7,
      "Dewpoint_c": -55.7,
      "Wind_Direction": 303,
      "Wind_Speed_kt": 0.3
    },
    {
      "Pressure_mb": 490.5,
      "Altitude_m": 5963,
      "Temp_c": -13.7,
      "Dewpoint_c": -55.7,
      "Wind_Direction": 303,
      "Wind_Speed_kt": 0.3
    },
    {
      "Pressure_mb": 490.3,
      "Altitude_m": 5967,
      "Temp_c": -13.7,
      "Dewpoint_c": -55.7,
      "Wind_Direction": 303,
      "Wind_Speed_kt": 0.3
    },
    {
      "Pressure_mb": 490,
      "Altitude_m": 5972,
      "Temp_c": -13.8,
      "Dewpoint_c": -55.7,
      "Wind_Direction": 303,
      "Wind_Speed_kt": 0.4
    },
    {
      "Pressure_mb": 489.7,
      "Altitude_m": 5976,
      "Temp_c": -13.8,
      "Dewpoint_c": -55.7,
      "Wind_Direction": 303,
      "Wind_Speed_kt": 0.4
    },
    {
      "Pressure_mb": 489.4,
      "Altitude_m": 5981,
      "Temp_c": -13.8,
      "Dewpoint_c": -55.8,
      "Wind_Direction": 303,
      "Wind_Speed_kt": 0.5
    },
    {
      "Pressure_mb": 489.1,
      "Altitude_m": 5985,
      "Temp_c": -13.8,
      "Dewpoint_c": -55.8,
      "Wind_Direction": 303,
      "Wind_Speed_kt": 0.5
    },
    {
      "Pressure_mb": 488.8,
      "Altitude_m": 5989,
      "Temp_c": -13.9,
      "Dewpoint_c": -55.8,
      "Wind_Direction": 303,
      "Wind_Speed_kt": 0.5
    },
    {
      "Pressure_mb": 488.5,
      "Altitude_m": 5994,
      "Temp_c": -13.9,
      "Dewpoint_c": -55.8,
      "Wind_Direction": 303,
      "Wind_Speed_kt": 0.6
    },
    {
      "Pressure_mb": 488.2,
      "Altitude_m": 5998,
      "Temp_c": -13.9,
      "Dewpoint_c": -55.8,
      "Wind_Direction": 303,
      "Wind_Speed_kt": 0.6
    },
    {
      "Pressure_mb": 488,
      "Altitude_m": 6003,
      "Temp_c": -13.9,
      "Dewpoint_c": -55.8,
      "Wind_Direction": 303,
      "Wind_Speed_kt": 0.7
    },
    {
      "Pressure_mb": 487.7,
      "Altitude_m": 6007,
      "Temp_c": -13.9,
      "Dewpoint_c": -55.9,
      "Wind_Direction": 304,
      "Wind_Speed_kt": 0.7
    },
    {
      "Pressure_mb": 487.4,
      "Altitude_m": 6012,
      "Temp_c": -14,
      "Dewpoint_c": -55.9,
      "Wind_Direction": 304,
      "Wind_Speed_kt": 0.7
    },
    {
      "Pressure_mb": 487.1,
      "Altitude_m": 6016,
      "Temp_c": -14,
      "Dewpoint_c": -55.9,
      "Wind_Direction": 303,
      "Wind_Speed_kt": 0.8
    },
    {
      "Pressure_mb": 486.8,
      "Altitude_m": 6021,
      "Temp_c": -14,
      "Dewpoint_c": -55.9,
      "Wind_Direction": 303,
      "Wind_Speed_kt": 0.9
    },
    {
      "Pressure_mb": 486.5,
      "Altitude_m": 6025,
      "Temp_c": -14,
      "Dewpoint_c": -55.9,
      "Wind_Direction": 303,
      "Wind_Speed_kt": 1
    },
    {
      "Pressure_mb": 486.2,
      "Altitude_m": 6029,
      "Temp_c": -14.1,
      "Dewpoint_c": -55.9,
      "Wind_Direction": 303,
      "Wind_Speed_kt": 1.1
    },
    {
      "Pressure_mb": 486,
      "Altitude_m": 6034,
      "Temp_c": -14.1,
      "Dewpoint_c": -55.9,
      "Wind_Direction": 303,
      "Wind_Speed_kt": 1.2
    },
    {
      "Pressure_mb": 485.7,
      "Altitude_m": 6039,
      "Temp_c": -14.1,
      "Dewpoint_c": -55.9,
      "Wind_Direction": 303,
      "Wind_Speed_kt": 1.3
    },
    {
      "Pressure_mb": 485.4,
      "Altitude_m": 6043,
      "Temp_c": -14.1,
      "Dewpoint_c": -55.9,
      "Wind_Direction": 303,
      "Wind_Speed_kt": 1.4
    },
    {
      "Pressure_mb": 485.1,
      "Altitude_m": 6048,
      "Temp_c": -14.1,
      "Dewpoint_c": -55.9,
      "Wind_Direction": 303,
      "Wind_Speed_kt": 1.5
    },
    {
      "Pressure_mb": 484.8,
      "Altitude_m": 6052,
      "Temp_c": -14.2,
      "Dewpoint_c": -55.9,
      "Wind_Direction": 302,
      "Wind_Speed_kt": 1.6
    },
    {
      "Pressure_mb": 484.5,
      "Altitude_m": 6057,
      "Temp_c": -14.2,
      "Dewpoint_c": -55.9,
      "Wind_Direction": 302,
      "Wind_Speed_kt": 1.7
    },
    {
      "Pressure_mb": 484.2,
      "Altitude_m": 6061,
      "Temp_c": -14.2,
      "Dewpoint_c": -55.9,
      "Wind_Direction": 302,
      "Wind_Speed_kt": 1.8
    },
    {
      "Pressure_mb": 484,
      "Altitude_m": 6065,
      "Temp_c": -14.2,
      "Dewpoint_c": -55.9,
      "Wind_Direction": 302,
      "Wind_Speed_kt": 1.9
    },
    {
      "Pressure_mb": 483.7,
      "Altitude_m": 6070,
      "Temp_c": -14.2,
      "Dewpoint_c": -55.8,
      "Wind_Direction": 302,
      "Wind_Speed_kt": 2
    },
    {
      "Pressure_mb": 483.4,
      "Altitude_m": 6074,
      "Temp_c": -14.3,
      "Dewpoint_c": -55.8,
      "Wind_Direction": 302,
      "Wind_Speed_kt": 2.1
    },
    {
      "Pressure_mb": 483.1,
      "Altitude_m": 6078,
      "Temp_c": -14.3,
      "Dewpoint_c": -55.8,
      "Wind_Direction": 302,
      "Wind_Speed_kt": 2.1
    },
    {
      "Pressure_mb": 482.9,
      "Altitude_m": 6082,
      "Temp_c": -14.3,
      "Dewpoint_c": -55.8,
      "Wind_Direction": 302,
      "Wind_Speed_kt": 2.2
    },
    {
      "Pressure_mb": 482.6,
      "Altitude_m": 6087,
      "Temp_c": -14.3,
      "Dewpoint_c": -55.8,
      "Wind_Direction": 302,
      "Wind_Speed_kt": 2.3
    },
    {
      "Pressure_mb": 482.3,
      "Altitude_m": 6091,
      "Temp_c": -14.4,
      "Dewpoint_c": -55.7,
      "Wind_Direction": 301,
      "Wind_Speed_kt": 2.4
    },
    {
      "Pressure_mb": 482.1,
      "Altitude_m": 6095,
      "Temp_c": -14.4,
      "Dewpoint_c": -55.4,
      "Wind_Direction": 301,
      "Wind_Speed_kt": 2.5
    },
    {
      "Pressure_mb": 481.8,
      "Altitude_m": 6099,
      "Temp_c": -14.4,
      "Dewpoint_c": -55.1,
      "Wind_Direction": 301,
      "Wind_Speed_kt": 2.6
    },
    {
      "Pressure_mb": 481.5,
      "Altitude_m": 6104,
      "Temp_c": -14.4,
      "Dewpoint_c": -54.8,
      "Wind_Direction": 301,
      "Wind_Speed_kt": 2.6
    },
    {
      "Pressure_mb": 481.2,
      "Altitude_m": 6108,
      "Temp_c": -14.4,
      "Dewpoint_c": -54.6,
      "Wind_Direction": 301,
      "Wind_Speed_kt": 2.6
    },
    {
      "Pressure_mb": 481,
      "Altitude_m": 6112,
      "Temp_c": -14.5,
      "Dewpoint_c": -54.3,
      "Wind_Direction": 301,
      "Wind_Speed_kt": 2.5
    },
    {
      "Pressure_mb": 480.7,
      "Altitude_m": 6117,
      "Temp_c": -14.5,
      "Dewpoint_c": -54,
      "Wind_Direction": 301,
      "Wind_Speed_kt": 2.5
    },
    {
      "Pressure_mb": 480.4,
      "Altitude_m": 6121,
      "Temp_c": -14.5,
      "Dewpoint_c": -53.8,
      "Wind_Direction": 300,
      "Wind_Speed_kt": 2.5
    },
    {
      "Pressure_mb": 480.1,
      "Altitude_m": 6125,
      "Temp_c": -14.6,
      "Dewpoint_c": -53.6,
      "Wind_Direction": 300,
      "Wind_Speed_kt": 2.5
    },
    {
      "Pressure_mb": 479.9,
      "Altitude_m": 6130,
      "Temp_c": -14.6,
      "Dewpoint_c": -53.4,
      "Wind_Direction": 300,
      "Wind_Speed_kt": 2.4
    },
    {
      "Pressure_mb": 479.6,
      "Altitude_m": 6134,
      "Temp_c": -14.6,
      "Dewpoint_c": -53.1,
      "Wind_Direction": 300,
      "Wind_Speed_kt": 2.4
    },
    {
      "Pressure_mb": 479.3,
      "Altitude_m": 6138,
      "Temp_c": -14.7,
      "Dewpoint_c": -52.9,
      "Wind_Direction": 300,
      "Wind_Speed_kt": 2.4
    },
    {
      "Pressure_mb": 479,
      "Altitude_m": 6143,
      "Temp_c": -14.7,
      "Dewpoint_c": -52.7,
      "Wind_Direction": 299,
      "Wind_Speed_kt": 2.4
    },
    {
      "Pressure_mb": 478.7,
      "Altitude_m": 6147,
      "Temp_c": -14.7,
      "Dewpoint_c": -52.5,
      "Wind_Direction": 299,
      "Wind_Speed_kt": 2.3
    },
    {
      "Pressure_mb": 478.5,
      "Altitude_m": 6152,
      "Temp_c": -14.8,
      "Dewpoint_c": -52.1,
      "Wind_Direction": 299,
      "Wind_Speed_kt": 2.3
    },
    {
      "Pressure_mb": 478.2,
      "Altitude_m": 6156,
      "Temp_c": -14.8,
      "Dewpoint_c": -51.6,
      "Wind_Direction": 299,
      "Wind_Speed_kt": 2.3
    },
    {
      "Pressure_mb": 477.9,
      "Altitude_m": 6161,
      "Temp_c": -14.8,
      "Dewpoint_c": -51.1,
      "Wind_Direction": 299,
      "Wind_Speed_kt": 2.3
    },
    {
      "Pressure_mb": 477.6,
      "Altitude_m": 6165,
      "Temp_c": -14.8,
      "Dewpoint_c": -50.7,
      "Wind_Direction": 299,
      "Wind_Speed_kt": 2.2
    },
    {
      "Pressure_mb": 477.3,
      "Altitude_m": 6170,
      "Temp_c": -14.9,
      "Dewpoint_c": -50.3,
      "Wind_Direction": 298,
      "Wind_Speed_kt": 2.2
    },
    {
      "Pressure_mb": 477,
      "Altitude_m": 6175,
      "Temp_c": -14.9,
      "Dewpoint_c": -49.9,
      "Wind_Direction": 298,
      "Wind_Speed_kt": 2.2
    },
    {
      "Pressure_mb": 476.7,
      "Altitude_m": 6179,
      "Temp_c": -15,
      "Dewpoint_c": -49.5,
      "Wind_Direction": 298,
      "Wind_Speed_kt": 2.2
    },
    {
      "Pressure_mb": 476.4,
      "Altitude_m": 6184,
      "Temp_c": -15,
      "Dewpoint_c": -49.2,
      "Wind_Direction": 298,
      "Wind_Speed_kt": 2.2
    },
    {
      "Pressure_mb": 476.1,
      "Altitude_m": 6188,
      "Temp_c": -15.1,
      "Dewpoint_c": -48.9,
      "Wind_Direction": 298,
      "Wind_Speed_kt": 2.1
    },
    {
      "Pressure_mb": 475.8,
      "Altitude_m": 6193,
      "Temp_c": -15.1,
      "Dewpoint_c": -48.6,
      "Wind_Direction": 298,
      "Wind_Speed_kt": 2.1
    },
    {
      "Pressure_mb": 475.5,
      "Altitude_m": 6197,
      "Temp_c": -15.1,
      "Dewpoint_c": -48.3,
      "Wind_Direction": 298,
      "Wind_Speed_kt": 2.1
    },
    {
      "Pressure_mb": 475.2,
      "Altitude_m": 6203,
      "Temp_c": -15.2,
      "Dewpoint_c": -48,
      "Wind_Direction": 298,
      "Wind_Speed_kt": 2.1
    },
    {
      "Pressure_mb": 474.8,
      "Altitude_m": 6208,
      "Temp_c": -15.2,
      "Dewpoint_c": -47.7,
      "Wind_Direction": 298,
      "Wind_Speed_kt": 2
    },
    {
      "Pressure_mb": 474.5,
      "Altitude_m": 6214,
      "Temp_c": -15.3,
      "Dewpoint_c": -47.4,
      "Wind_Direction": 298,
      "Wind_Speed_kt": 2
    },
    {
      "Pressure_mb": 474.2,
      "Altitude_m": 6220,
      "Temp_c": -15.3,
      "Dewpoint_c": -47.2,
      "Wind_Direction": 298,
      "Wind_Speed_kt": 2
    },
    {
      "Pressure_mb": 473.8,
      "Altitude_m": 6226,
      "Temp_c": -15.4,
      "Dewpoint_c": -47,
      "Wind_Direction": 298,
      "Wind_Speed_kt": 2
    },
    {
      "Pressure_mb": 473.4,
      "Altitude_m": 6232,
      "Temp_c": -15.4,
      "Dewpoint_c": -46.8,
      "Wind_Direction": 298,
      "Wind_Speed_kt": 2
    },
    {
      "Pressure_mb": 473.1,
      "Altitude_m": 6237,
      "Temp_c": -15.5,
      "Dewpoint_c": -46.5,
      "Wind_Direction": 298,
      "Wind_Speed_kt": 1.9
    },
    {
      "Pressure_mb": 472.7,
      "Altitude_m": 6243,
      "Temp_c": -15.5,
      "Dewpoint_c": -46.3,
      "Wind_Direction": 298,
      "Wind_Speed_kt": 1.9
    },
    {
      "Pressure_mb": 472.3,
      "Altitude_m": 6249,
      "Temp_c": -15.6,
      "Dewpoint_c": -46.1,
      "Wind_Direction": 298,
      "Wind_Speed_kt": 1.9
    },
    {
      "Pressure_mb": 472,
      "Altitude_m": 6255,
      "Temp_c": -15.6,
      "Dewpoint_c": -45.9,
      "Wind_Direction": 298,
      "Wind_Speed_kt": 1.9
    },
    {
      "Pressure_mb": 471.7,
      "Altitude_m": 6260,
      "Temp_c": -15.6,
      "Dewpoint_c": -45.8,
      "Wind_Direction": 298,
      "Wind_Speed_kt": 1.8
    },
    {
      "Pressure_mb": 471.4,
      "Altitude_m": 6266,
      "Temp_c": -15.7,
      "Dewpoint_c": -45.6,
      "Wind_Direction": 298,
      "Wind_Speed_kt": 1.8
    },
    {
      "Pressure_mb": 471,
      "Altitude_m": 6272,
      "Temp_c": -15.7,
      "Dewpoint_c": -45.4,
      "Wind_Direction": 297,
      "Wind_Speed_kt": 1.8
    },
    {
      "Pressure_mb": 470.7,
      "Altitude_m": 6276,
      "Temp_c": -15.8,
      "Dewpoint_c": -45.2,
      "Wind_Direction": 297,
      "Wind_Speed_kt": 1.8
    },
    {
      "Pressure_mb": 470.4,
      "Altitude_m": 6281,
      "Temp_c": -15.8,
      "Dewpoint_c": -45.1,
      "Wind_Direction": 297,
      "Wind_Speed_kt": 1.7
    },
    {
      "Pressure_mb": 470.1,
      "Altitude_m": 6285,
      "Temp_c": -15.9,
      "Dewpoint_c": -44.9,
      "Wind_Direction": 297,
      "Wind_Speed_kt": 1.7
    },
    {
      "Pressure_mb": 469.8,
      "Altitude_m": 6289,
      "Temp_c": -15.9,
      "Dewpoint_c": -44.8,
      "Wind_Direction": 297,
      "Wind_Speed_kt": 1.7
    },
    {
      "Pressure_mb": 469.5,
      "Altitude_m": 6294,
      "Temp_c": -16,
      "Dewpoint_c": -44.7,
      "Wind_Direction": 297,
      "Wind_Speed_kt": 1.7
    },
    {
      "Pressure_mb": 469.3,
      "Altitude_m": 6298,
      "Temp_c": -16,
      "Dewpoint_c": -44.6,
      "Wind_Direction": 297,
      "Wind_Speed_kt": 1.6
    },
    {
      "Pressure_mb": 469,
      "Altitude_m": 6303,
      "Temp_c": -16.1,
      "Dewpoint_c": -44.6,
      "Wind_Direction": 297,
      "Wind_Speed_kt": 1.6
    },
    {
      "Pressure_mb": 468.7,
      "Altitude_m": 6307,
      "Temp_c": -16.1,
      "Dewpoint_c": -44.5,
      "Wind_Direction": 297,
      "Wind_Speed_kt": 1.6
    },
    {
      "Pressure_mb": 468.5,
      "Altitude_m": 6311,
      "Temp_c": -16.2,
      "Dewpoint_c": -44.4,
      "Wind_Direction": 297,
      "Wind_Speed_kt": 1.5
    },
    {
      "Pressure_mb": 468.2,
      "Altitude_m": 6315,
      "Temp_c": -16.2,
      "Dewpoint_c": -44.3,
      "Wind_Direction": 297,
      "Wind_Speed_kt": 1.5
    },
    {
      "Pressure_mb": 467.9,
      "Altitude_m": 6319,
      "Temp_c": -16.2,
      "Dewpoint_c": -44.2,
      "Wind_Direction": 297,
      "Wind_Speed_kt": 1.5
    },
    {
      "Pressure_mb": 467.7,
      "Altitude_m": 6324,
      "Temp_c": -16.3,
      "Dewpoint_c": -44.2,
      "Wind_Direction": 297,
      "Wind_Speed_kt": 1.4
    },
    {
      "Pressure_mb": 467.4,
      "Altitude_m": 6328,
      "Temp_c": -16.3,
      "Dewpoint_c": -44.1,
      "Wind_Direction": 297,
      "Wind_Speed_kt": 1.4
    },
    {
      "Pressure_mb": 467.1,
      "Altitude_m": 6332,
      "Temp_c": -16.4,
      "Dewpoint_c": -44,
      "Wind_Direction": 297,
      "Wind_Speed_kt": 1.4
    },
    {
      "Pressure_mb": 466.9,
      "Altitude_m": 6337,
      "Temp_c": -16.4,
      "Dewpoint_c": -43.9,
      "Wind_Direction": 297,
      "Wind_Speed_kt": 1.4
    },
    {
      "Pressure_mb": 466.6,
      "Altitude_m": 6341,
      "Temp_c": -16.5,
      "Dewpoint_c": -43.9,
      "Wind_Direction": 297,
      "Wind_Speed_kt": 1.3
    },
    {
      "Pressure_mb": 466.3,
      "Altitude_m": 6346,
      "Temp_c": -16.5,
      "Dewpoint_c": -43.8,
      "Wind_Direction": 296,
      "Wind_Speed_kt": 1.3
    },
    {
      "Pressure_mb": 466,
      "Altitude_m": 6350,
      "Temp_c": -16.5,
      "Dewpoint_c": -43.7,
      "Wind_Direction": 296,
      "Wind_Speed_kt": 1.3
    },
    {
      "Pressure_mb": 465.7,
      "Altitude_m": 6355,
      "Temp_c": -16.6,
      "Dewpoint_c": -43.7,
      "Wind_Direction": 296,
      "Wind_Speed_kt": 1.2
    },
    {
      "Pressure_mb": 465.5,
      "Altitude_m": 6359,
      "Temp_c": -16.6,
      "Dewpoint_c": -43.6,
      "Wind_Direction": 296,
      "Wind_Speed_kt": 1.2
    },
    {
      "Pressure_mb": 465.2,
      "Altitude_m": 6364,
      "Temp_c": -16.7,
      "Dewpoint_c": -43.6,
      "Wind_Direction": 296,
      "Wind_Speed_kt": 1.2
    },
    {
      "Pressure_mb": 464.9,
      "Altitude_m": 6368,
      "Temp_c": -16.7,
      "Dewpoint_c": -43.5,
      "Wind_Direction": 296,
      "Wind_Speed_kt": 1.1
    },
    {
      "Pressure_mb": 464.6,
      "Altitude_m": 6373,
      "Temp_c": -16.8,
      "Dewpoint_c": -43.5,
      "Wind_Direction": 296,
      "Wind_Speed_kt": 1.1
    },
    {
      "Pressure_mb": 464.3,
      "Altitude_m": 6378,
      "Temp_c": -16.8,
      "Dewpoint_c": -43.4,
      "Wind_Direction": 296,
      "Wind_Speed_kt": 1.1
    },
    {
      "Pressure_mb": 464,
      "Altitude_m": 6383,
      "Temp_c": -16.8,
      "Dewpoint_c": -43.4,
      "Wind_Direction": 296,
      "Wind_Speed_kt": 1
    },
    {
      "Pressure_mb": 463.7,
      "Altitude_m": 6387,
      "Temp_c": -16.9,
      "Dewpoint_c": -43.3,
      "Wind_Direction": 296,
      "Wind_Speed_kt": 1
    },
    {
      "Pressure_mb": 463.4,
      "Altitude_m": 6392,
      "Temp_c": -16.9,
      "Dewpoint_c": -43.3,
      "Wind_Direction": 296,
      "Wind_Speed_kt": 1
    },
    {
      "Pressure_mb": 463.2,
      "Altitude_m": 6397,
      "Temp_c": -17,
      "Dewpoint_c": -43.2,
      "Wind_Direction": 296,
      "Wind_Speed_kt": 1
    },
    {
      "Pressure_mb": 462.9,
      "Altitude_m": 6401,
      "Temp_c": -17,
      "Dewpoint_c": -43.2,
      "Wind_Direction": 296,
      "Wind_Speed_kt": 1
    },
    {
      "Pressure_mb": 462.6,
      "Altitude_m": 6406,
      "Temp_c": -17.1,
      "Dewpoint_c": -43.1,
      "Wind_Direction": 296,
      "Wind_Speed_kt": 1
    },
    {
      "Pressure_mb": 462.3,
      "Altitude_m": 6411,
      "Temp_c": -17.1,
      "Dewpoint_c": -43.1,
      "Wind_Direction": 296,
      "Wind_Speed_kt": 1
    },
    {
      "Pressure_mb": 462,
      "Altitude_m": 6415,
      "Temp_c": -17.2,
      "Dewpoint_c": -43,
      "Wind_Direction": 296,
      "Wind_Speed_kt": 0.9
    },
    {
      "Pressure_mb": 461.7,
      "Altitude_m": 6420,
      "Temp_c": -17.2,
      "Dewpoint_c": -43,
      "Wind_Direction": 296,
      "Wind_Speed_kt": 0.9
    },
    {
      "Pressure_mb": 461.4,
      "Altitude_m": 6425,
      "Temp_c": -17.2,
      "Dewpoint_c": -43,
      "Wind_Direction": 296,
      "Wind_Speed_kt": 0.9
    },
    {
      "Pressure_mb": 461.1,
      "Altitude_m": 6430,
      "Temp_c": -17.3,
      "Dewpoint_c": -43,
      "Wind_Direction": 296,
      "Wind_Speed_kt": 0.9
    },
    {
      "Pressure_mb": 460.8,
      "Altitude_m": 6435,
      "Temp_c": -17.3,
      "Dewpoint_c": -42.9,
      "Wind_Direction": 296,
      "Wind_Speed_kt": 0.9
    },
    {
      "Pressure_mb": 460.5,
      "Altitude_m": 6440,
      "Temp_c": -17.4,
      "Dewpoint_c": -42.9,
      "Wind_Direction": 296,
      "Wind_Speed_kt": 0.9
    },
    {
      "Pressure_mb": 460.2,
      "Altitude_m": 6445,
      "Temp_c": -17.4,
      "Dewpoint_c": -42.9,
      "Wind_Direction": 296,
      "Wind_Speed_kt": 0.9
    },
    {
      "Pressure_mb": 459.9,
      "Altitude_m": 6450,
      "Temp_c": -17.5,
      "Dewpoint_c": -42.8,
      "Wind_Direction": 296,
      "Wind_Speed_kt": 0.9
    },
    {
      "Pressure_mb": 459.6,
      "Altitude_m": 6454,
      "Temp_c": -17.5,
      "Dewpoint_c": -42.8,
      "Wind_Direction": 296,
      "Wind_Speed_kt": 0.8
    },
    {
      "Pressure_mb": 459.3,
      "Altitude_m": 6459,
      "Temp_c": -17.5,
      "Dewpoint_c": -42.8,
      "Wind_Direction": 296,
      "Wind_Speed_kt": 0.8
    },
    {
      "Pressure_mb": 459.1,
      "Altitude_m": 6463,
      "Temp_c": -17.6,
      "Dewpoint_c": -42.8,
      "Wind_Direction": 296,
      "Wind_Speed_kt": 0.8
    },
    {
      "Pressure_mb": 458.8,
      "Altitude_m": 6468,
      "Temp_c": -17.6,
      "Dewpoint_c": -42.7,
      "Wind_Direction": 296,
      "Wind_Speed_kt": 0.8
    },
    {
      "Pressure_mb": 458.5,
      "Altitude_m": 6472,
      "Temp_c": -17.7,
      "Dewpoint_c": -42.7,
      "Wind_Direction": 296,
      "Wind_Speed_kt": 0.8
    },
    {
      "Pressure_mb": 458.2,
      "Altitude_m": 6477,
      "Temp_c": -17.7,
      "Dewpoint_c": -42.7,
      "Wind_Direction": 296,
      "Wind_Speed_kt": 0.8
    },
    {
      "Pressure_mb": 458,
      "Altitude_m": 6481,
      "Temp_c": -17.8,
      "Dewpoint_c": -42.6,
      "Wind_Direction": 296,
      "Wind_Speed_kt": 0.8
    },
    {
      "Pressure_mb": 457.7,
      "Altitude_m": 6486,
      "Temp_c": -17.8,
      "Dewpoint_c": -42.6,
      "Wind_Direction": 296,
      "Wind_Speed_kt": 0.7
    },
    {
      "Pressure_mb": 457.4,
      "Altitude_m": 6490,
      "Temp_c": -17.8,
      "Dewpoint_c": -42.6,
      "Wind_Direction": 296,
      "Wind_Speed_kt": 0.7
    },
    {
      "Pressure_mb": 457.1,
      "Altitude_m": 6495,
      "Temp_c": -17.9,
      "Dewpoint_c": -42.6,
      "Wind_Direction": 296,
      "Wind_Speed_kt": 0.7
    },
    {
      "Pressure_mb": 456.8,
      "Altitude_m": 6499,
      "Temp_c": -17.9,
      "Dewpoint_c": -42.5,
      "Wind_Direction": 296,
      "Wind_Speed_kt": 0.7
    },
    {
      "Pressure_mb": 456.6,
      "Altitude_m": 6504,
      "Temp_c": -18,
      "Dewpoint_c": -42.5,
      "Wind_Direction": 296,
      "Wind_Speed_kt": 0.7
    },
    {
      "Pressure_mb": 456.3,
      "Altitude_m": 6508,
      "Temp_c": -18,
      "Dewpoint_c": -42.5,
      "Wind_Direction": 296,
      "Wind_Speed_kt": 0.6
    },
    {
      "Pressure_mb": 456,
      "Altitude_m": 6513,
      "Temp_c": -18,
      "Dewpoint_c": -42.5,
      "Wind_Direction": 296,
      "Wind_Speed_kt": 0.6
    },
    {
      "Pressure_mb": 455.7,
      "Altitude_m": 6517,
      "Temp_c": -18.1,
      "Dewpoint_c": -42.4,
      "Wind_Direction": 295,
      "Wind_Speed_kt": 0.6
    },
    {
      "Pressure_mb": 455.5,
      "Altitude_m": 6522,
      "Temp_c": -18.1,
      "Dewpoint_c": -42.4,
      "Wind_Direction": 295,
      "Wind_Speed_kt": 0.6
    },
    {
      "Pressure_mb": 455.2,
      "Altitude_m": 6526,
      "Temp_c": -18.2,
      "Dewpoint_c": -42.4,
      "Wind_Direction": 295,
      "Wind_Speed_kt": 0.6
    },
    {
      "Pressure_mb": 454.9,
      "Altitude_m": 6531,
      "Temp_c": -18.2,
      "Dewpoint_c": -42.3,
      "Wind_Direction": 295,
      "Wind_Speed_kt": 0.5
    },
    {
      "Pressure_mb": 454.7,
      "Altitude_m": 6535,
      "Temp_c": -18.2,
      "Dewpoint_c": -42.3,
      "Wind_Direction": 295,
      "Wind_Speed_kt": 0.5
    },
    {
      "Pressure_mb": 454.4,
      "Altitude_m": 6540,
      "Temp_c": -18.3,
      "Dewpoint_c": -42.3,
      "Wind_Direction": 295,
      "Wind_Speed_kt": 0.5
    },
    {
      "Pressure_mb": 454.1,
      "Altitude_m": 6544,
      "Temp_c": -18.3,
      "Dewpoint_c": -42.3,
      "Wind_Direction": 295,
      "Wind_Speed_kt": 0.5
    },
    {
      "Pressure_mb": 453.9,
      "Altitude_m": 6548,
      "Temp_c": -18.4,
      "Dewpoint_c": -42.3,
      "Wind_Direction": 295,
      "Wind_Speed_kt": 0.5
    },
    {
      "Pressure_mb": 453.6,
      "Altitude_m": 6553,
      "Temp_c": -18.4,
      "Dewpoint_c": -42.3,
      "Wind_Direction": 295,
      "Wind_Speed_kt": 0.5
    },
    {
      "Pressure_mb": 453.3,
      "Altitude_m": 6557,
      "Temp_c": -18.4,
      "Dewpoint_c": -42.3,
      "Wind_Direction": 295,
      "Wind_Speed_kt": 0.4
    },
    {
      "Pressure_mb": 453.1,
      "Altitude_m": 6561,
      "Temp_c": -18.5,
      "Dewpoint_c": -42.3,
      "Wind_Direction": 295,
      "Wind_Speed_kt": 0.4
    },
    {
      "Pressure_mb": 452.8,
      "Altitude_m": 6566,
      "Temp_c": -18.5,
      "Dewpoint_c": -42.3,
      "Wind_Direction": 294,
      "Wind_Speed_kt": 0.4
    },
    {
      "Pressure_mb": 452.5,
      "Altitude_m": 6570,
      "Temp_c": -18.6,
      "Dewpoint_c": -42.3,
      "Wind_Direction": 294,
      "Wind_Speed_kt": 0.4
    },
    {
      "Pressure_mb": 452.2,
      "Altitude_m": 6575,
      "Temp_c": -18.6,
      "Dewpoint_c": -42.3,
      "Wind_Direction": 294,
      "Wind_Speed_kt": 0.4
    },
    {
      "Pressure_mb": 452,
      "Altitude_m": 6579,
      "Temp_c": -18.6,
      "Dewpoint_c": -42.3,
      "Wind_Direction": 294,
      "Wind_Speed_kt": 0.4
    },
    {
      "Pressure_mb": 451.7,
      "Altitude_m": 6584,
      "Temp_c": -18.7,
      "Dewpoint_c": -42.3,
      "Wind_Direction": 294,
      "Wind_Speed_kt": 0.5
    },
    {
      "Pressure_mb": 451.4,
      "Altitude_m": 6588,
      "Temp_c": -18.7,
      "Dewpoint_c": -42.3,
      "Wind_Direction": 294,
      "Wind_Speed_kt": 0.5
    },
    {
      "Pressure_mb": 451.2,
      "Altitude_m": 6592,
      "Temp_c": -18.8,
      "Dewpoint_c": -42.3,
      "Wind_Direction": 294,
      "Wind_Speed_kt": 0.5
    },
    {
      "Pressure_mb": 450.9,
      "Altitude_m": 6597,
      "Temp_c": -18.8,
      "Dewpoint_c": -42.2,
      "Wind_Direction": 294,
      "Wind_Speed_kt": 0.5
    },
    {
      "Pressure_mb": 450.7,
      "Altitude_m": 6601,
      "Temp_c": -18.8,
      "Dewpoint_c": -42.2,
      "Wind_Direction": 294,
      "Wind_Speed_kt": 0.5
    },
    {
      "Pressure_mb": 450.4,
      "Altitude_m": 6605,
      "Temp_c": -18.9,
      "Dewpoint_c": -42.2,
      "Wind_Direction": 294,
      "Wind_Speed_kt": 0.5
    },
    {
      "Pressure_mb": 450.1,
      "Altitude_m": 6610,
      "Temp_c": -18.9,
      "Dewpoint_c": -42.2,
      "Wind_Direction": 294,
      "Wind_Speed_kt": 0.6
    },
    {
      "Pressure_mb": 449.8,
      "Altitude_m": 6614,
      "Temp_c": -19,
      "Dewpoint_c": -42.2,
      "Wind_Direction": 294,
      "Wind_Speed_kt": 0.6
    },
    {
      "Pressure_mb": 449.6,
      "Altitude_m": 6619,
      "Temp_c": -19,
      "Dewpoint_c": -42.2,
      "Wind_Direction": 294,
      "Wind_Speed_kt": 0.6
    },
    {
      "Pressure_mb": 449.3,
      "Altitude_m": 6624,
      "Temp_c": -19.1,
      "Dewpoint_c": -42.1,
      "Wind_Direction": 293,
      "Wind_Speed_kt": 0.6
    },
    {
      "Pressure_mb": 449,
      "Altitude_m": 6628,
      "Temp_c": -19.1,
      "Dewpoint_c": -42.1,
      "Wind_Direction": 293,
      "Wind_Speed_kt": 0.6
    },
    {
      "Pressure_mb": 448.7,
      "Altitude_m": 6633,
      "Temp_c": -19.1,
      "Dewpoint_c": -42.1,
      "Wind_Direction": 293,
      "Wind_Speed_kt": 0.6
    },
    {
      "Pressure_mb": 448.5,
      "Altitude_m": 6637,
      "Temp_c": -19.2,
      "Dewpoint_c": -42.1,
      "Wind_Direction": 293,
      "Wind_Speed_kt": 0.7
    },
    {
      "Pressure_mb": 448.2,
      "Altitude_m": 6642,
      "Temp_c": -19.2,
      "Dewpoint_c": -42.1,
      "Wind_Direction": 293,
      "Wind_Speed_kt": 0.7
    },
    {
      "Pressure_mb": 447.9,
      "Altitude_m": 6647,
      "Temp_c": -19.3,
      "Dewpoint_c": -42.1,
      "Wind_Direction": 293,
      "Wind_Speed_kt": 0.7
    },
    {
      "Pressure_mb": 447.6,
      "Altitude_m": 6652,
      "Temp_c": -19.3,
      "Dewpoint_c": -42.1,
      "Wind_Direction": 293,
      "Wind_Speed_kt": 0.7
    },
    {
      "Pressure_mb": 447.3,
      "Altitude_m": 6656,
      "Temp_c": -19.4,
      "Dewpoint_c": -42,
      "Wind_Direction": 293,
      "Wind_Speed_kt": 0.7
    },
    {
      "Pressure_mb": 447,
      "Altitude_m": 6661,
      "Temp_c": -19.4,
      "Dewpoint_c": -42,
      "Wind_Direction": 293,
      "Wind_Speed_kt": 0.7
    },
    {
      "Pressure_mb": 446.8,
      "Altitude_m": 6665,
      "Temp_c": -19.4,
      "Dewpoint_c": -42,
      "Wind_Direction": 293,
      "Wind_Speed_kt": 0.7
    },
    {
      "Pressure_mb": 446.5,
      "Altitude_m": 6670,
      "Temp_c": -19.5,
      "Dewpoint_c": -42,
      "Wind_Direction": 293,
      "Wind_Speed_kt": 0.7
    },
    {
      "Pressure_mb": 446.2,
      "Altitude_m": 6674,
      "Temp_c": -19.5,
      "Dewpoint_c": -42,
      "Wind_Direction": 293,
      "Wind_Speed_kt": 0.7
    },
    {
      "Pressure_mb": 446,
      "Altitude_m": 6678,
      "Temp_c": -19.6,
      "Dewpoint_c": -42,
      "Wind_Direction": 293,
      "Wind_Speed_kt": 0.6
    },
    {
      "Pressure_mb": 445.7,
      "Altitude_m": 6683,
      "Temp_c": -19.6,
      "Dewpoint_c": -41.9,
      "Wind_Direction": 293,
      "Wind_Speed_kt": 0.6
    },
    {
      "Pressure_mb": 445.4,
      "Altitude_m": 6687,
      "Temp_c": -19.7,
      "Dewpoint_c": -41.9,
      "Wind_Direction": 293,
      "Wind_Speed_kt": 0.6
    },
    {
      "Pressure_mb": 445.2,
      "Altitude_m": 6692,
      "Temp_c": -19.7,
      "Dewpoint_c": -41.9,
      "Wind_Direction": 293,
      "Wind_Speed_kt": 0.6
    },
    {
      "Pressure_mb": 444.9,
      "Altitude_m": 6697,
      "Temp_c": -19.8,
      "Dewpoint_c": -41.9,
      "Wind_Direction": 293,
      "Wind_Speed_kt": 0.6
    },
    {
      "Pressure_mb": 444.6,
      "Altitude_m": 6702,
      "Temp_c": -19.8,
      "Dewpoint_c": -41.9,
      "Wind_Direction": 293,
      "Wind_Speed_kt": 0.5
    },
    {
      "Pressure_mb": 444.3,
      "Altitude_m": 6707,
      "Temp_c": -19.8,
      "Dewpoint_c": -41.9,
      "Wind_Direction": 293,
      "Wind_Speed_kt": 0.5
    },
    {
      "Pressure_mb": 444,
      "Altitude_m": 6712,
      "Temp_c": -19.9,
      "Dewpoint_c": -41.9,
      "Wind_Direction": 293,
      "Wind_Speed_kt": 0.5
    },
    {
      "Pressure_mb": 443.7,
      "Altitude_m": 6717,
      "Temp_c": -19.9,
      "Dewpoint_c": -41.9,
      "Wind_Direction": 293,
      "Wind_Speed_kt": 0.5
    },
    {
      "Pressure_mb": 443.4,
      "Altitude_m": 6722,
      "Temp_c": -20,
      "Dewpoint_c": -41.9,
      "Wind_Direction": 293,
      "Wind_Speed_kt": 0.5
    },
    {
      "Pressure_mb": 443.1,
      "Altitude_m": 6727,
      "Temp_c": -20,
      "Dewpoint_c": -41.9,
      "Wind_Direction": 293,
      "Wind_Speed_kt": 0.5
    },
    {
      "Pressure_mb": 442.8,
      "Altitude_m": 6732,
      "Temp_c": -20.1,
      "Dewpoint_c": -41.9,
      "Wind_Direction": 293,
      "Wind_Speed_kt": 0.4
    },
    {
      "Pressure_mb": 442.5,
      "Altitude_m": 6737,
      "Temp_c": -20.1,
      "Dewpoint_c": -42,
      "Wind_Direction": 292,
      "Wind_Speed_kt": 0.4
    },
    {
      "Pressure_mb": 442.2,
      "Altitude_m": 6741,
      "Temp_c": -20.1,
      "Dewpoint_c": -42,
      "Wind_Direction": 292,
      "Wind_Speed_kt": 0.4
    },
    {
      "Pressure_mb": 441.9,
      "Altitude_m": 6746,
      "Temp_c": -20.2,
      "Dewpoint_c": -42,
      "Wind_Direction": 292,
      "Wind_Speed_kt": 0.4
    },
    {
      "Pressure_mb": 441.7,
      "Altitude_m": 6750,
      "Temp_c": -20.2,
      "Dewpoint_c": -42,
      "Wind_Direction": 292,
      "Wind_Speed_kt": 0.4
    },
    {
      "Pressure_mb": 441.4,
      "Altitude_m": 6755,
      "Temp_c": -20.3,
      "Dewpoint_c": -42,
      "Wind_Direction": 292,
      "Wind_Speed_kt": 0.4
    },
    {
      "Pressure_mb": 441.2,
      "Altitude_m": 6759,
      "Temp_c": -20.3,
      "Dewpoint_c": -42,
      "Wind_Direction": 292,
      "Wind_Speed_kt": 0.4
    },
    {
      "Pressure_mb": 440.9,
      "Altitude_m": 6764,
      "Temp_c": -20.3,
      "Dewpoint_c": -42,
      "Wind_Direction": 292,
      "Wind_Speed_kt": 0.4
    },
    {
      "Pressure_mb": 440.6,
      "Altitude_m": 6768,
      "Temp_c": -20.4,
      "Dewpoint_c": -42.1,
      "Wind_Direction": 292,
      "Wind_Speed_kt": 0.4
    },
    {
      "Pressure_mb": 440.4,
      "Altitude_m": 6773,
      "Temp_c": -20.4,
      "Dewpoint_c": -42.1,
      "Wind_Direction": 292,
      "Wind_Speed_kt": 0.4
    },
    {
      "Pressure_mb": 440.2,
      "Altitude_m": 6775,
      "Temp_c": -20.4,
      "Dewpoint_c": -42.1,
      "Wind_Direction": 292,
      "Wind_Speed_kt": 0.4
    },
    {
      "Pressure_mb": 439.8,
      "Altitude_m": 6782,
      "Temp_c": -20.5,
      "Dewpoint_c": -42.1,
      "Wind_Direction": 292,
      "Wind_Speed_kt": 0.4
    },
    {
      "Pressure_mb": 439.5,
      "Altitude_m": 6786,
      "Temp_c": -20.5,
      "Dewpoint_c": -42.2,
      "Wind_Direction": 292,
      "Wind_Speed_kt": 0.4
    },
    {
      "Pressure_mb": 439.3,
      "Altitude_m": 6791,
      "Temp_c": -20.6,
      "Dewpoint_c": -42.2,
      "Wind_Direction": 292,
      "Wind_Speed_kt": 0.4
    },
    {
      "Pressure_mb": 439,
      "Altitude_m": 6796,
      "Temp_c": -20.6,
      "Dewpoint_c": -42.2,
      "Wind_Direction": 292,
      "Wind_Speed_kt": 0.4
    },
    {
      "Pressure_mb": 438.7,
      "Altitude_m": 6800,
      "Temp_c": -20.7,
      "Dewpoint_c": -42.3,
      "Wind_Direction": 292,
      "Wind_Speed_kt": 0.4
    },
    {
      "Pressure_mb": 438.4,
      "Altitude_m": 6805,
      "Temp_c": -20.7,
      "Dewpoint_c": -42.3,
      "Wind_Direction": 292,
      "Wind_Speed_kt": 0.4
    },
    {
      "Pressure_mb": 438.2,
      "Altitude_m": 6810,
      "Temp_c": -20.7,
      "Dewpoint_c": -42.3,
      "Wind_Direction": 292,
      "Wind_Speed_kt": 0.3
    },
    {
      "Pressure_mb": 437.9,
      "Altitude_m": 6815,
      "Temp_c": -20.8,
      "Dewpoint_c": -42.4,
      "Wind_Direction": 292,
      "Wind_Speed_kt": 0.3
    },
    {
      "Pressure_mb": 437.6,
      "Altitude_m": 6819,
      "Temp_c": -20.8,
      "Dewpoint_c": -42.4,
      "Wind_Direction": 292,
      "Wind_Speed_kt": 0.3
    },
    {
      "Pressure_mb": 437.3,
      "Altitude_m": 6824,
      "Temp_c": -20.8,
      "Dewpoint_c": -42.4,
      "Wind_Direction": 292,
      "Wind_Speed_kt": 0.3
    },
    {
      "Pressure_mb": 437,
      "Altitude_m": 6828,
      "Temp_c": -20.9,
      "Dewpoint_c": -42.4,
      "Wind_Direction": 292,
      "Wind_Speed_kt": 0.3
    },
    {
      "Pressure_mb": 436.8,
      "Altitude_m": 6833,
      "Temp_c": -20.9,
      "Dewpoint_c": -42.5,
      "Wind_Direction": 292,
      "Wind_Speed_kt": 0.3
    },
    {
      "Pressure_mb": 436.5,
      "Altitude_m": 6837,
      "Temp_c": -20.9,
      "Dewpoint_c": -42.5,
      "Wind_Direction": 292,
      "Wind_Speed_kt": 0.3
    },
    {
      "Pressure_mb": 436.3,
      "Altitude_m": 6842,
      "Temp_c": -21,
      "Dewpoint_c": -42.5,
      "Wind_Direction": 292,
      "Wind_Speed_kt": 0.3
    },
    {
      "Pressure_mb": 436,
      "Altitude_m": 6846,
      "Temp_c": -21,
      "Dewpoint_c": -42.5,
      "Wind_Direction": 292,
      "Wind_Speed_kt": 0.3
    },
    {
      "Pressure_mb": 435.8,
      "Altitude_m": 6850,
      "Temp_c": -21,
      "Dewpoint_c": -42.5,
      "Wind_Direction": 292,
      "Wind_Speed_kt": 0.3
    },
    {
      "Pressure_mb": 435.5,
      "Altitude_m": 6854,
      "Temp_c": -21.1,
      "Dewpoint_c": -42.6,
      "Wind_Direction": 292,
      "Wind_Speed_kt": 0.3
    },
    {
      "Pressure_mb": 435.3,
      "Altitude_m": 6859,
      "Temp_c": -21.1,
      "Dewpoint_c": -42.6,
      "Wind_Direction": 292,
      "Wind_Speed_kt": 0.3
    },
    {
      "Pressure_mb": 435,
      "Altitude_m": 6863,
      "Temp_c": -21.1,
      "Dewpoint_c": -42.6,
      "Wind_Direction": 292,
      "Wind_Speed_kt": 0.3
    },
    {
      "Pressure_mb": 434.7,
      "Altitude_m": 6867,
      "Temp_c": -21.2,
      "Dewpoint_c": -42.6,
      "Wind_Direction": 293,
      "Wind_Speed_kt": 0.3
    },
    {
      "Pressure_mb": 434.5,
      "Altitude_m": 6872,
      "Temp_c": -21.2,
      "Dewpoint_c": -42.6,
      "Wind_Direction": 293,
      "Wind_Speed_kt": 0.2
    },
    {
      "Pressure_mb": 434.2,
      "Altitude_m": 6876,
      "Temp_c": -21.3,
      "Dewpoint_c": -42.7,
      "Wind_Direction": 293,
      "Wind_Speed_kt": 0.2
    },
    {
      "Pressure_mb": 434,
      "Altitude_m": 6880,
      "Temp_c": -21.3,
      "Dewpoint_c": -42.7,
      "Wind_Direction": 293,
      "Wind_Speed_kt": 0.2
    },
    {
      "Pressure_mb": 433.7,
      "Altitude_m": 6885,
      "Temp_c": -21.3,
      "Dewpoint_c": -42.7,
      "Wind_Direction": 293,
      "Wind_Speed_kt": 0.2
    },
    {
      "Pressure_mb": 433.5,
      "Altitude_m": 6889,
      "Temp_c": -21.4,
      "Dewpoint_c": -42.7,
      "Wind_Direction": 293,
      "Wind_Speed_kt": 0.2
    },
    {
      "Pressure_mb": 433.2,
      "Altitude_m": 6894,
      "Temp_c": -21.4,
      "Dewpoint_c": -42.7,
      "Wind_Direction": 293,
      "Wind_Speed_kt": 0.2
    },
    {
      "Pressure_mb": 432.9,
      "Altitude_m": 6898,
      "Temp_c": -21.4,
      "Dewpoint_c": -42.7,
      "Wind_Direction": 293,
      "Wind_Speed_kt": 0.2
    },
    {
      "Pressure_mb": 432.7,
      "Altitude_m": 6902,
      "Temp_c": -21.5,
      "Dewpoint_c": -42.8,
      "Wind_Direction": 293,
      "Wind_Speed_kt": 0.2
    },
    {
      "Pressure_mb": 432.4,
      "Altitude_m": 6907,
      "Temp_c": -21.5,
      "Dewpoint_c": -42.8,
      "Wind_Direction": 294,
      "Wind_Speed_kt": 0.1
    },
    {
      "Pressure_mb": 432.2,
      "Altitude_m": 6911,
      "Temp_c": -21.5,
      "Dewpoint_c": -42.8,
      "Wind_Direction": 294,
      "Wind_Speed_kt": 0.1
    },
    {
      "Pressure_mb": 432,
      "Altitude_m": 6915,
      "Temp_c": -21.6,
      "Dewpoint_c": -42.8,
      "Wind_Direction": 294,
      "Wind_Speed_kt": 0.1
    },
    {
      "Pressure_mb": 431.7,
      "Altitude_m": 6919,
      "Temp_c": -21.6,
      "Dewpoint_c": -42.8,
      "Wind_Direction": 294,
      "Wind_Speed_kt": 0.1
    },
    {
      "Pressure_mb": 431.5,
      "Altitude_m": 6923,
      "Temp_c": -21.7,
      "Dewpoint_c": -42.8,
      "Wind_Direction": 294,
      "Wind_Speed_kt": 0.1
    },
    {
      "Pressure_mb": 431.2,
      "Altitude_m": 6927,
      "Temp_c": -21.7,
      "Dewpoint_c": -42.8,
      "Wind_Direction": 294,
      "Wind_Speed_kt": 0.1
    },
    {
      "Pressure_mb": 431,
      "Altitude_m": 6931,
      "Temp_c": -21.7,
      "Dewpoint_c": -42.8,
      "Wind_Direction": 294,
      "Wind_Speed_kt": 0.1
    },
    {
      "Pressure_mb": 430.7,
      "Altitude_m": 6935,
      "Temp_c": -21.8,
      "Dewpoint_c": -42.9,
      "Wind_Direction": 294,
      "Wind_Speed_kt": 0.1
    },
    {
      "Pressure_mb": 430.5,
      "Altitude_m": 6940,
      "Temp_c": -21.8,
      "Dewpoint_c": -42.9,
      "Wind_Direction": 294,
      "Wind_Speed_kt": 0.1
    },
    {
      "Pressure_mb": 430.2,
      "Altitude_m": 6944,
      "Temp_c": -21.8,
      "Dewpoint_c": -42.9,
      "Wind_Direction": 294,
      "Wind_Speed_kt": 0.2
    },
    {
      "Pressure_mb": 429.9,
      "Altitude_m": 6949,
      "Temp_c": -21.9,
      "Dewpoint_c": -42.9,
      "Wind_Direction": 294,
      "Wind_Speed_kt": 0.2
    },
    {
      "Pressure_mb": 429.7,
      "Altitude_m": 6953,
      "Temp_c": -21.9,
      "Dewpoint_c": -42.9,
      "Wind_Direction": 294,
      "Wind_Speed_kt": 0.2
    },
    {
      "Pressure_mb": 429.4,
      "Altitude_m": 6958,
      "Temp_c": -22,
      "Dewpoint_c": -42.9,
      "Wind_Direction": 294,
      "Wind_Speed_kt": 0.2
    },
    {
      "Pressure_mb": 429.2,
      "Altitude_m": 6962,
      "Temp_c": -22,
      "Dewpoint_c": -43,
      "Wind_Direction": 294,
      "Wind_Speed_kt": 0.2
    },
    {
      "Pressure_mb": 428.9,
      "Altitude_m": 6967,
      "Temp_c": -22,
      "Dewpoint_c": -43,
      "Wind_Direction": 294,
      "Wind_Speed_kt": 0.3
    },
    {
      "Pressure_mb": 428.6,
      "Altitude_m": 6972,
      "Temp_c": -22.1,
      "Dewpoint_c": -43,
      "Wind_Direction": 294,
      "Wind_Speed_kt": 0.3
    },
    {
      "Pressure_mb": 428.4,
      "Altitude_m": 6976,
      "Temp_c": -22.1,
      "Dewpoint_c": -43,
      "Wind_Direction": 294,
      "Wind_Speed_kt": 0.3
    },
    {
      "Pressure_mb": 428.1,
      "Altitude_m": 6981,
      "Temp_c": -22.1,
      "Dewpoint_c": -43,
      "Wind_Direction": 294,
      "Wind_Speed_kt": 0.3
    },
    {
      "Pressure_mb": 427.8,
      "Altitude_m": 6985,
      "Temp_c": -22.2,
      "Dewpoint_c": -43.1,
      "Wind_Direction": 294,
      "Wind_Speed_kt": 0.3
    },
    {
      "Pressure_mb": 427.6,
      "Altitude_m": 6990,
      "Temp_c": -22.2,
      "Dewpoint_c": -43.1,
      "Wind_Direction": 294,
      "Wind_Speed_kt": 0.3
    },
    {
      "Pressure_mb": 427.3,
      "Altitude_m": 6994,
      "Temp_c": -22.3,
      "Dewpoint_c": -43.1,
      "Wind_Direction": 294,
      "Wind_Speed_kt": 0.4
    },
    {
      "Pressure_mb": 427.1,
      "Altitude_m": 6999,
      "Temp_c": -22.3,
      "Dewpoint_c": -43.1,
      "Wind_Direction": 294,
      "Wind_Speed_kt": 0.4
    },
    {
      "Pressure_mb": 426.8,
      "Altitude_m": 7003,
      "Temp_c": -22.3,
      "Dewpoint_c": -43.1,
      "Wind_Direction": 294,
      "Wind_Speed_kt": 0.4
    },
    {
      "Pressure_mb": 426.5,
      "Altitude_m": 7007,
      "Temp_c": -22.4,
      "Dewpoint_c": -43.2,
      "Wind_Direction": 294,
      "Wind_Speed_kt": 0.4
    },
    {
      "Pressure_mb": 426.3,
      "Altitude_m": 7012,
      "Temp_c": -22.4,
      "Dewpoint_c": -43.2,
      "Wind_Direction": 294,
      "Wind_Speed_kt": 0.4
    },
    {
      "Pressure_mb": 426,
      "Altitude_m": 7016,
      "Temp_c": -22.4,
      "Dewpoint_c": -43.2,
      "Wind_Direction": 295,
      "Wind_Speed_kt": 0.5
    },
    {
      "Pressure_mb": 425.8,
      "Altitude_m": 7020,
      "Temp_c": -22.5,
      "Dewpoint_c": -43.2,
      "Wind_Direction": 295,
      "Wind_Speed_kt": 0.5
    },
    {
      "Pressure_mb": 425.5,
      "Altitude_m": 7025,
      "Temp_c": -22.5,
      "Dewpoint_c": -43.2,
      "Wind_Direction": 295,
      "Wind_Speed_kt": 0.5
    },
    {
      "Pressure_mb": 425.3,
      "Altitude_m": 7029,
      "Temp_c": -22.6,
      "Dewpoint_c": -43.2,
      "Wind_Direction": 295,
      "Wind_Speed_kt": 0.5
    },
    {
      "Pressure_mb": 425.1,
      "Altitude_m": 7033,
      "Temp_c": -22.6,
      "Dewpoint_c": -43.2,
      "Wind_Direction": 295,
      "Wind_Speed_kt": 0.5
    },
    {
      "Pressure_mb": 424.8,
      "Altitude_m": 7037,
      "Temp_c": -22.6,
      "Dewpoint_c": -43.2,
      "Wind_Direction": 295,
      "Wind_Speed_kt": 0.6
    },
    {
      "Pressure_mb": 424.6,
      "Altitude_m": 7042,
      "Temp_c": -22.7,
      "Dewpoint_c": -43.2,
      "Wind_Direction": 295,
      "Wind_Speed_kt": 0.6
    },
    {
      "Pressure_mb": 424.3,
      "Altitude_m": 7046,
      "Temp_c": -22.7,
      "Dewpoint_c": -43.3,
      "Wind_Direction": 295,
      "Wind_Speed_kt": 0.6
    },
    {
      "Pressure_mb": 424,
      "Altitude_m": 7051,
      "Temp_c": -22.7,
      "Dewpoint_c": -43.3,
      "Wind_Direction": 295,
      "Wind_Speed_kt": 0.6
    },
    {
      "Pressure_mb": 423.8,
      "Altitude_m": 7055,
      "Temp_c": -22.8,
      "Dewpoint_c": -43.3,
      "Wind_Direction": 295,
      "Wind_Speed_kt": 0.6
    },
    {
      "Pressure_mb": 423.5,
      "Altitude_m": 7059,
      "Temp_c": -22.8,
      "Dewpoint_c": -43.3,
      "Wind_Direction": 295,
      "Wind_Speed_kt": 0.7
    },
    {
      "Pressure_mb": 423.3,
      "Altitude_m": 7064,
      "Temp_c": -22.9,
      "Dewpoint_c": -43.3,
      "Wind_Direction": 295,
      "Wind_Speed_kt": 0.7
    },
    {
      "Pressure_mb": 423,
      "Altitude_m": 7068,
      "Temp_c": -22.9,
      "Dewpoint_c": -43.3,
      "Wind_Direction": 295,
      "Wind_Speed_kt": 0.7
    },
    {
      "Pressure_mb": 422.8,
      "Altitude_m": 7073,
      "Temp_c": -22.9,
      "Dewpoint_c": -43.3,
      "Wind_Direction": 295,
      "Wind_Speed_kt": 0.7
    },
    {
      "Pressure_mb": 422.5,
      "Altitude_m": 7077,
      "Temp_c": -23,
      "Dewpoint_c": -43.3,
      "Wind_Direction": 295,
      "Wind_Speed_kt": 0.7
    },
    {
      "Pressure_mb": 422.3,
      "Altitude_m": 7081,
      "Temp_c": -23,
      "Dewpoint_c": -43.3,
      "Wind_Direction": 295,
      "Wind_Speed_kt": 0.8
    },
    {
      "Pressure_mb": 422,
      "Altitude_m": 7086,
      "Temp_c": -23.1,
      "Dewpoint_c": -43.3,
      "Wind_Direction": 295,
      "Wind_Speed_kt": 0.8
    },
    {
      "Pressure_mb": 421.8,
      "Altitude_m": 7090,
      "Temp_c": -23.1,
      "Dewpoint_c": -43.4,
      "Wind_Direction": 295,
      "Wind_Speed_kt": 0.8
    },
    {
      "Pressure_mb": 421.5,
      "Altitude_m": 7095,
      "Temp_c": -23.1,
      "Dewpoint_c": -43.4,
      "Wind_Direction": 295,
      "Wind_Speed_kt": 0.8
    },
    {
      "Pressure_mb": 421.3,
      "Altitude_m": 7099,
      "Temp_c": -23.2,
      "Dewpoint_c": -43.4,
      "Wind_Direction": 295,
      "Wind_Speed_kt": 0.8
    },
    {
      "Pressure_mb": 421,
      "Altitude_m": 7103,
      "Temp_c": -23.2,
      "Dewpoint_c": -43.4,
      "Wind_Direction": 295,
      "Wind_Speed_kt": 0.8
    },
    {
      "Pressure_mb": 420.8,
      "Altitude_m": 7107,
      "Temp_c": -23.3,
      "Dewpoint_c": -43.4,
      "Wind_Direction": 295,
      "Wind_Speed_kt": 0.8
    },
    {
      "Pressure_mb": 420.5,
      "Altitude_m": 7111,
      "Temp_c": -23.3,
      "Dewpoint_c": -43.4,
      "Wind_Direction": 295,
      "Wind_Speed_kt": 0.8
    },
    {
      "Pressure_mb": 420.3,
      "Altitude_m": 7116,
      "Temp_c": -23.3,
      "Dewpoint_c": -43.4,
      "Wind_Direction": 295,
      "Wind_Speed_kt": 0.8
    },
    {
      "Pressure_mb": 420,
      "Altitude_m": 7120,
      "Temp_c": -23.4,
      "Dewpoint_c": -43.5,
      "Wind_Direction": 295,
      "Wind_Speed_kt": 0.8
    },
    {
      "Pressure_mb": 419.8,
      "Altitude_m": 7124,
      "Temp_c": -23.4,
      "Dewpoint_c": -43.5,
      "Wind_Direction": 295,
      "Wind_Speed_kt": 0.8
    },
    {
      "Pressure_mb": 419.5,
      "Altitude_m": 7129,
      "Temp_c": -23.5,
      "Dewpoint_c": -43.5,
      "Wind_Direction": 295,
      "Wind_Speed_kt": 0.8
    },
    {
      "Pressure_mb": 419.3,
      "Altitude_m": 7133,
      "Temp_c": -23.5,
      "Dewpoint_c": -43.5,
      "Wind_Direction": 295,
      "Wind_Speed_kt": 0.8
    },
    {
      "Pressure_mb": 419,
      "Altitude_m": 7138,
      "Temp_c": -23.5,
      "Dewpoint_c": -43.5,
      "Wind_Direction": 295,
      "Wind_Speed_kt": 0.8
    },
    {
      "Pressure_mb": 418.8,
      "Altitude_m": 7142,
      "Temp_c": -23.6,
      "Dewpoint_c": -43.5,
      "Wind_Direction": 295,
      "Wind_Speed_kt": 0.8
    },
    {
      "Pressure_mb": 418.5,
      "Altitude_m": 7146,
      "Temp_c": -23.6,
      "Dewpoint_c": -43.5,
      "Wind_Direction": 295,
      "Wind_Speed_kt": 0.8
    },
    {
      "Pressure_mb": 418.3,
      "Altitude_m": 7151,
      "Temp_c": -23.7,
      "Dewpoint_c": -43.6,
      "Wind_Direction": 295,
      "Wind_Speed_kt": 0.8
    },
    {
      "Pressure_mb": 418,
      "Altitude_m": 7155,
      "Temp_c": -23.7,
      "Dewpoint_c": -43.6,
      "Wind_Direction": 295,
      "Wind_Speed_kt": 0.8
    },
    {
      "Pressure_mb": 417.8,
      "Altitude_m": 7159,
      "Temp_c": -23.8,
      "Dewpoint_c": -43.6,
      "Wind_Direction": 295,
      "Wind_Speed_kt": 0.8
    },
    {
      "Pressure_mb": 417.6,
      "Altitude_m": 7163,
      "Temp_c": -23.8,
      "Dewpoint_c": -43.6,
      "Wind_Direction": 295,
      "Wind_Speed_kt": 0.8
    },
    {
      "Pressure_mb": 417.3,
      "Altitude_m": 7168,
      "Temp_c": -23.8,
      "Dewpoint_c": -43.6,
      "Wind_Direction": 295,
      "Wind_Speed_kt": 0.9
    },
    {
      "Pressure_mb": 417.1,
      "Altitude_m": 7172,
      "Temp_c": -23.9,
      "Dewpoint_c": -43.6,
      "Wind_Direction": 295,
      "Wind_Speed_kt": 0.9
    },
    {
      "Pressure_mb": 416.8,
      "Altitude_m": 7177,
      "Temp_c": -23.9,
      "Dewpoint_c": -43.7,
      "Wind_Direction": 295,
      "Wind_Speed_kt": 0.9
    },
    {
      "Pressure_mb": 416.5,
      "Altitude_m": 7181,
      "Temp_c": -24,
      "Dewpoint_c": -43.7,
      "Wind_Direction": 295,
      "Wind_Speed_kt": 0.9
    },
    {
      "Pressure_mb": 416.3,
      "Altitude_m": 7185,
      "Temp_c": -24,
      "Dewpoint_c": -43.7,
      "Wind_Direction": 295,
      "Wind_Speed_kt": 0.9
    },
    {
      "Pressure_mb": 416,
      "Altitude_m": 7190,
      "Temp_c": -24.1,
      "Dewpoint_c": -43.7,
      "Wind_Direction": 295,
      "Wind_Speed_kt": 0.9
    },
    {
      "Pressure_mb": 415.8,
      "Altitude_m": 7195,
      "Temp_c": -24.1,
      "Dewpoint_c": -43.7,
      "Wind_Direction": 295,
      "Wind_Speed_kt": 0.9
    },
    {
      "Pressure_mb": 415.5,
      "Altitude_m": 7199,
      "Temp_c": -24.1,
      "Dewpoint_c": -43.7,
      "Wind_Direction": 295,
      "Wind_Speed_kt": 1
    },
    {
      "Pressure_mb": 415.2,
      "Altitude_m": 7204,
      "Temp_c": -24.2,
      "Dewpoint_c": -43.7,
      "Wind_Direction": 295,
      "Wind_Speed_kt": 1
    },
    {
      "Pressure_mb": 415,
      "Altitude_m": 7208,
      "Temp_c": -24.2,
      "Dewpoint_c": -43.7,
      "Wind_Direction": 295,
      "Wind_Speed_kt": 1.1
    },
    {
      "Pressure_mb": 414.7,
      "Altitude_m": 7213,
      "Temp_c": -24.3,
      "Dewpoint_c": -43.7,
      "Wind_Direction": 295,
      "Wind_Speed_kt": 1.2
    },
    {
      "Pressure_mb": 414.5,
      "Altitude_m": 7218,
      "Temp_c": -24.3,
      "Dewpoint_c": -43.6,
      "Wind_Direction": 296,
      "Wind_Speed_kt": 1.2
    },
    {
      "Pressure_mb": 414.2,
      "Altitude_m": 7222,
      "Temp_c": -24.4,
      "Dewpoint_c": -43.6,
      "Wind_Direction": 296,
      "Wind_Speed_kt": 1.3
    },
    {
      "Pressure_mb": 413.9,
      "Altitude_m": 7227,
      "Temp_c": -24.4,
      "Dewpoint_c": -43.6,
      "Wind_Direction": 296,
      "Wind_Speed_kt": 1.3
    },
    {
      "Pressure_mb": 413.7,
      "Altitude_m": 7231,
      "Temp_c": -24.4,
      "Dewpoint_c": -43.6,
      "Wind_Direction": 296,
      "Wind_Speed_kt": 1.4
    },
    {
      "Pressure_mb": 413.4,
      "Altitude_m": 7236,
      "Temp_c": -24.5,
      "Dewpoint_c": -43.6,
      "Wind_Direction": 296,
      "Wind_Speed_kt": 1.5
    },
    {
      "Pressure_mb": 413.2,
      "Altitude_m": 7240,
      "Temp_c": -24.5,
      "Dewpoint_c": -43.6,
      "Wind_Direction": 296,
      "Wind_Speed_kt": 1.5
    },
    {
      "Pressure_mb": 412.9,
      "Altitude_m": 7245,
      "Temp_c": -24.6,
      "Dewpoint_c": -43.6,
      "Wind_Direction": 296,
      "Wind_Speed_kt": 1.6
    },
    {
      "Pressure_mb": 412.7,
      "Altitude_m": 7249,
      "Temp_c": -24.6,
      "Dewpoint_c": -43.6,
      "Wind_Direction": 296,
      "Wind_Speed_kt": 1.6
    },
    {
      "Pressure_mb": 412.4,
      "Altitude_m": 7253,
      "Temp_c": -24.6,
      "Dewpoint_c": -43.6,
      "Wind_Direction": 296,
      "Wind_Speed_kt": 1.7
    },
    {
      "Pressure_mb": 412.2,
      "Altitude_m": 7258,
      "Temp_c": -24.7,
      "Dewpoint_c": -43.6,
      "Wind_Direction": 296,
      "Wind_Speed_kt": 1.8
    },
    {
      "Pressure_mb": 411.9,
      "Altitude_m": 7262,
      "Temp_c": -24.7,
      "Dewpoint_c": -43.6,
      "Wind_Direction": 296,
      "Wind_Speed_kt": 1.8
    },
    {
      "Pressure_mb": 411.7,
      "Altitude_m": 7266,
      "Temp_c": -24.8,
      "Dewpoint_c": -43.6,
      "Wind_Direction": 296,
      "Wind_Speed_kt": 1.9
    },
    {
      "Pressure_mb": 411.5,
      "Altitude_m": 7270,
      "Temp_c": -24.8,
      "Dewpoint_c": -43.6,
      "Wind_Direction": 296,
      "Wind_Speed_kt": 1.9
    },
    {
      "Pressure_mb": 411.2,
      "Altitude_m": 7275,
      "Temp_c": -24.9,
      "Dewpoint_c": -43.6,
      "Wind_Direction": 296,
      "Wind_Speed_kt": 2
    },
    {
      "Pressure_mb": 411,
      "Altitude_m": 7279,
      "Temp_c": -24.9,
      "Dewpoint_c": -43.6,
      "Wind_Direction": 296,
      "Wind_Speed_kt": 2.1
    },
    {
      "Pressure_mb": 410.7,
      "Altitude_m": 7283,
      "Temp_c": -24.9,
      "Dewpoint_c": -43.6,
      "Wind_Direction": 296,
      "Wind_Speed_kt": 2.1
    },
    {
      "Pressure_mb": 410.5,
      "Altitude_m": 7288,
      "Temp_c": -25,
      "Dewpoint_c": -43.6,
      "Wind_Direction": 297,
      "Wind_Speed_kt": 2
    },
    {
      "Pressure_mb": 410.3,
      "Altitude_m": 7292,
      "Temp_c": -25,
      "Dewpoint_c": -43.6,
      "Wind_Direction": 297,
      "Wind_Speed_kt": 2
    },
    {
      "Pressure_mb": 410,
      "Altitude_m": 7296,
      "Temp_c": -25.1,
      "Dewpoint_c": -43.6,
      "Wind_Direction": 297,
      "Wind_Speed_kt": 2
    },
    {
      "Pressure_mb": 409.8,
      "Altitude_m": 7300,
      "Temp_c": -25.1,
      "Dewpoint_c": -43.6,
      "Wind_Direction": 297,
      "Wind_Speed_kt": 2
    },
    {
      "Pressure_mb": 409.5,
      "Altitude_m": 7305,
      "Temp_c": -25.1,
      "Dewpoint_c": -43.6,
      "Wind_Direction": 297,
      "Wind_Speed_kt": 2
    },
    {
      "Pressure_mb": 409.3,
      "Altitude_m": 7309,
      "Temp_c": -25.2,
      "Dewpoint_c": -43.6,
      "Wind_Direction": 297,
      "Wind_Speed_kt": 2
    },
    {
      "Pressure_mb": 409,
      "Altitude_m": 7313,
      "Temp_c": -25.2,
      "Dewpoint_c": -43.6,
      "Wind_Direction": 297,
      "Wind_Speed_kt": 2
    },
    {
      "Pressure_mb": 408.7,
      "Altitude_m": 7318,
      "Temp_c": -25.3,
      "Dewpoint_c": -43.6,
      "Wind_Direction": 297,
      "Wind_Speed_kt": 2
    },
    {
      "Pressure_mb": 408.5,
      "Altitude_m": 7323,
      "Temp_c": -25.3,
      "Dewpoint_c": -43.6,
      "Wind_Direction": 297,
      "Wind_Speed_kt": 2
    },
    {
      "Pressure_mb": 408.2,
      "Altitude_m": 7328,
      "Temp_c": -25.4,
      "Dewpoint_c": -43.6,
      "Wind_Direction": 297,
      "Wind_Speed_kt": 1.9
    },
    {
      "Pressure_mb": 408,
      "Altitude_m": 7332,
      "Temp_c": -25.4,
      "Dewpoint_c": -43.6,
      "Wind_Direction": 297,
      "Wind_Speed_kt": 1.9
    },
    {
      "Pressure_mb": 407.7,
      "Altitude_m": 7337,
      "Temp_c": -25.4,
      "Dewpoint_c": -43.6,
      "Wind_Direction": 297,
      "Wind_Speed_kt": 1.9
    },
    {
      "Pressure_mb": 407.4,
      "Altitude_m": 7342,
      "Temp_c": -25.5,
      "Dewpoint_c": -43.6,
      "Wind_Direction": 297,
      "Wind_Speed_kt": 1.9
    },
    {
      "Pressure_mb": 407.2,
      "Altitude_m": 7346,
      "Temp_c": -25.5,
      "Dewpoint_c": -43.6,
      "Wind_Direction": 297,
      "Wind_Speed_kt": 1.9
    },
    {
      "Pressure_mb": 406.9,
      "Altitude_m": 7351,
      "Temp_c": -25.6,
      "Dewpoint_c": -43.6,
      "Wind_Direction": 297,
      "Wind_Speed_kt": 1.9
    },
    {
      "Pressure_mb": 406.6,
      "Altitude_m": 7356,
      "Temp_c": -25.6,
      "Dewpoint_c": -43.6,
      "Wind_Direction": 297,
      "Wind_Speed_kt": 1.9
    },
    {
      "Pressure_mb": 406.4,
      "Altitude_m": 7361,
      "Temp_c": -25.6,
      "Dewpoint_c": -43.6,
      "Wind_Direction": 297,
      "Wind_Speed_kt": 1.9
    },
    {
      "Pressure_mb": 406.1,
      "Altitude_m": 7365,
      "Temp_c": -25.7,
      "Dewpoint_c": -43.7,
      "Wind_Direction": 297,
      "Wind_Speed_kt": 1.9
    },
    {
      "Pressure_mb": 405.8,
      "Altitude_m": 7370,
      "Temp_c": -25.7,
      "Dewpoint_c": -43.7,
      "Wind_Direction": 297,
      "Wind_Speed_kt": 1.9
    },
    {
      "Pressure_mb": 405.6,
      "Altitude_m": 7375,
      "Temp_c": -25.8,
      "Dewpoint_c": -43.7,
      "Wind_Direction": 297,
      "Wind_Speed_kt": 1.9
    },
    {
      "Pressure_mb": 405.3,
      "Altitude_m": 7380,
      "Temp_c": -25.8,
      "Dewpoint_c": -43.7,
      "Wind_Direction": 297,
      "Wind_Speed_kt": 1.9
    },
    {
      "Pressure_mb": 405.1,
      "Altitude_m": 7384,
      "Temp_c": -25.9,
      "Dewpoint_c": -43.7,
      "Wind_Direction": 298,
      "Wind_Speed_kt": 1.9
    },
    {
      "Pressure_mb": 404.8,
      "Altitude_m": 7389,
      "Temp_c": -25.9,
      "Dewpoint_c": -43.7,
      "Wind_Direction": 298,
      "Wind_Speed_kt": 2
    },
    {
      "Pressure_mb": 404.5,
      "Altitude_m": 7394,
      "Temp_c": -25.9,
      "Dewpoint_c": -43.7,
      "Wind_Direction": 298,
      "Wind_Speed_kt": 2
    },
    {
      "Pressure_mb": 404.3,
      "Altitude_m": 7398,
      "Temp_c": -26,
      "Dewpoint_c": -43.7,
      "Wind_Direction": 298,
      "Wind_Speed_kt": 2
    },
    {
      "Pressure_mb": 404,
      "Altitude_m": 7403,
      "Temp_c": -26,
      "Dewpoint_c": -43.7,
      "Wind_Direction": 298,
      "Wind_Speed_kt": 2.1
    },
    {
      "Pressure_mb": 403.8,
      "Altitude_m": 7408,
      "Temp_c": -26.1,
      "Dewpoint_c": -43.7,
      "Wind_Direction": 298,
      "Wind_Speed_kt": 2.1
    },
    {
      "Pressure_mb": 403.5,
      "Altitude_m": 7412,
      "Temp_c": -26.1,
      "Dewpoint_c": -43.7,
      "Wind_Direction": 298,
      "Wind_Speed_kt": 2.1
    },
    {
      "Pressure_mb": 403.3,
      "Altitude_m": 7417,
      "Temp_c": -26.1,
      "Dewpoint_c": -43.7,
      "Wind_Direction": 298,
      "Wind_Speed_kt": 2.1
    },
    {
      "Pressure_mb": 403,
      "Altitude_m": 7421,
      "Temp_c": -26.2,
      "Dewpoint_c": -43.8,
      "Wind_Direction": 298,
      "Wind_Speed_kt": 2.2
    },
    {
      "Pressure_mb": 402.8,
      "Altitude_m": 7426,
      "Temp_c": -26.2,
      "Dewpoint_c": -43.8,
      "Wind_Direction": 299,
      "Wind_Speed_kt": 2.2
    },
    {
      "Pressure_mb": 402.5,
      "Altitude_m": 7430,
      "Temp_c": -26.3,
      "Dewpoint_c": -43.8,
      "Wind_Direction": 299,
      "Wind_Speed_kt": 2.2
    },
    {
      "Pressure_mb": 402.3,
      "Altitude_m": 7434,
      "Temp_c": -26.3,
      "Dewpoint_c": -43.8,
      "Wind_Direction": 299,
      "Wind_Speed_kt": 2.3
    },
    {
      "Pressure_mb": 402,
      "Altitude_m": 7439,
      "Temp_c": -26.3,
      "Dewpoint_c": -43.8,
      "Wind_Direction": 299,
      "Wind_Speed_kt": 2.3
    },
    {
      "Pressure_mb": 401.8,
      "Altitude_m": 7443,
      "Temp_c": -26.4,
      "Dewpoint_c": -43.8,
      "Wind_Direction": 299,
      "Wind_Speed_kt": 2.3
    },
    {
      "Pressure_mb": 401.5,
      "Altitude_m": 7447,
      "Temp_c": -26.4,
      "Dewpoint_c": -43.8,
      "Wind_Direction": 299,
      "Wind_Speed_kt": 2.3
    },
    {
      "Pressure_mb": 401.3,
      "Altitude_m": 7452,
      "Temp_c": -26.5,
      "Dewpoint_c": -43.8,
      "Wind_Direction": 299,
      "Wind_Speed_kt": 2.4
    },
    {
      "Pressure_mb": 401,
      "Altitude_m": 7456,
      "Temp_c": -26.5,
      "Dewpoint_c": -43.9,
      "Wind_Direction": 299,
      "Wind_Speed_kt": 2.4
    },
    {
      "Pressure_mb": 400.8,
      "Altitude_m": 7461,
      "Temp_c": -26.5,
      "Dewpoint_c": -43.9,
      "Wind_Direction": 299,
      "Wind_Speed_kt": 2.4
    },
    {
      "Pressure_mb": 400.6,
      "Altitude_m": 7465,
      "Temp_c": -26.6,
      "Dewpoint_c": -43.9,
      "Wind_Direction": 299,
      "Wind_Speed_kt": 2.5
    },
    {
      "Pressure_mb": 400.3,
      "Altitude_m": 7469,
      "Temp_c": -26.6,
      "Dewpoint_c": -43.9,
      "Wind_Direction": 299,
      "Wind_Speed_kt": 2.5
    },
    {
      "Pressure_mb": 400,
      "Altitude_m": 7475,
      "Temp_c": -26.7,
      "Dewpoint_c": -43.9,
      "Wind_Direction": 299,
      "Wind_Speed_kt": 2.5
    },
    {
      "Pressure_mb": 399.8,
      "Altitude_m": 7478,
      "Temp_c": -26.7,
      "Dewpoint_c": -43.9,
      "Wind_Direction": 299,
      "Wind_Speed_kt": 2.6
    },
    {
      "Pressure_mb": 399.6,
      "Altitude_m": 7482,
      "Temp_c": -26.7,
      "Dewpoint_c": -43.9,
      "Wind_Direction": 299,
      "Wind_Speed_kt": 2.6
    },
    {
      "Pressure_mb": 399.4,
      "Altitude_m": 7487,
      "Temp_c": -26.8,
      "Dewpoint_c": -44,
      "Wind_Direction": 299,
      "Wind_Speed_kt": 2.6
    },
    {
      "Pressure_mb": 399.1,
      "Altitude_m": 7491,
      "Temp_c": -26.8,
      "Dewpoint_c": -44,
      "Wind_Direction": 300,
      "Wind_Speed_kt": 2.6
    },
    {
      "Pressure_mb": 398.9,
      "Altitude_m": 7495,
      "Temp_c": -26.9,
      "Dewpoint_c": -44,
      "Wind_Direction": 300,
      "Wind_Speed_kt": 2.7
    },
    {
      "Pressure_mb": 398.6,
      "Altitude_m": 7500,
      "Temp_c": -26.9,
      "Dewpoint_c": -44,
      "Wind_Direction": 300,
      "Wind_Speed_kt": 2.7
    },
    {
      "Pressure_mb": 398.4,
      "Altitude_m": 7504,
      "Temp_c": -26.9,
      "Dewpoint_c": -44,
      "Wind_Direction": 300,
      "Wind_Speed_kt": 2.7
    },
    {
      "Pressure_mb": 398.1,
      "Altitude_m": 7509,
      "Temp_c": -27,
      "Dewpoint_c": -44,
      "Wind_Direction": 300,
      "Wind_Speed_kt": 2.8
    },
    {
      "Pressure_mb": 397.9,
      "Altitude_m": 7513,
      "Temp_c": -27,
      "Dewpoint_c": -44.1,
      "Wind_Direction": 300,
      "Wind_Speed_kt": 2.8
    },
    {
      "Pressure_mb": 397.7,
      "Altitude_m": 7517,
      "Temp_c": -27.1,
      "Dewpoint_c": -44.1,
      "Wind_Direction": 300,
      "Wind_Speed_kt": 2.8
    },
    {
      "Pressure_mb": 397.4,
      "Altitude_m": 7521,
      "Temp_c": -27.1,
      "Dewpoint_c": -44.1,
      "Wind_Direction": 300,
      "Wind_Speed_kt": 2.9
    },
    {
      "Pressure_mb": 397.2,
      "Altitude_m": 7526,
      "Temp_c": -27.1,
      "Dewpoint_c": -44.1,
      "Wind_Direction": 300,
      "Wind_Speed_kt": 2.9
    },
    {
      "Pressure_mb": 397,
      "Altitude_m": 7530,
      "Temp_c": -27.2,
      "Dewpoint_c": -44.1,
      "Wind_Direction": 300,
      "Wind_Speed_kt": 2.9
    },
    {
      "Pressure_mb": 396.7,
      "Altitude_m": 7534,
      "Temp_c": -27.2,
      "Dewpoint_c": -44.1,
      "Wind_Direction": 300,
      "Wind_Speed_kt": 3
    },
    {
      "Pressure_mb": 396.5,
      "Altitude_m": 7538,
      "Temp_c": -27.3,
      "Dewpoint_c": -44.2,
      "Wind_Direction": 300,
      "Wind_Speed_kt": 3
    },
    {
      "Pressure_mb": 396.2,
      "Altitude_m": 7543,
      "Temp_c": -27.3,
      "Dewpoint_c": -44.2,
      "Wind_Direction": 300,
      "Wind_Speed_kt": 3
    },
    {
      "Pressure_mb": 396,
      "Altitude_m": 7548,
      "Temp_c": -27.3,
      "Dewpoint_c": -44.2,
      "Wind_Direction": 300,
      "Wind_Speed_kt": 3
    },
    {
      "Pressure_mb": 395.7,
      "Altitude_m": 7552,
      "Temp_c": -27.4,
      "Dewpoint_c": -44.2,
      "Wind_Direction": 300,
      "Wind_Speed_kt": 3.1
    },
    {
      "Pressure_mb": 395.5,
      "Altitude_m": 7557,
      "Temp_c": -27.4,
      "Dewpoint_c": -44.2,
      "Wind_Direction": 300,
      "Wind_Speed_kt": 3.2
    },
    {
      "Pressure_mb": 395.2,
      "Altitude_m": 7562,
      "Temp_c": -27.5,
      "Dewpoint_c": -44.2,
      "Wind_Direction": 300,
      "Wind_Speed_kt": 3.2
    },
    {
      "Pressure_mb": 395,
      "Altitude_m": 7566,
      "Temp_c": -27.5,
      "Dewpoint_c": -44.2,
      "Wind_Direction": 300,
      "Wind_Speed_kt": 3.3
    },
    {
      "Pressure_mb": 394.7,
      "Altitude_m": 7571,
      "Temp_c": -27.5,
      "Dewpoint_c": -44.3,
      "Wind_Direction": 300,
      "Wind_Speed_kt": 3.3
    },
    {
      "Pressure_mb": 394.5,
      "Altitude_m": 7575,
      "Temp_c": -27.6,
      "Dewpoint_c": -44.3,
      "Wind_Direction": 300,
      "Wind_Speed_kt": 3.4
    },
    {
      "Pressure_mb": 394.3,
      "Altitude_m": 7579,
      "Temp_c": -27.6,
      "Dewpoint_c": -44.3,
      "Wind_Direction": 300,
      "Wind_Speed_kt": 3.4
    },
    {
      "Pressure_mb": 394,
      "Altitude_m": 7583,
      "Temp_c": -27.6,
      "Dewpoint_c": -44.3,
      "Wind_Direction": 300,
      "Wind_Speed_kt": 3.5
    },
    {
      "Pressure_mb": 393.8,
      "Altitude_m": 7588,
      "Temp_c": -27.7,
      "Dewpoint_c": -44.3,
      "Wind_Direction": 300,
      "Wind_Speed_kt": 3.5
    },
    {
      "Pressure_mb": 393.6,
      "Altitude_m": 7592,
      "Temp_c": -27.7,
      "Dewpoint_c": -44.3,
      "Wind_Direction": 300,
      "Wind_Speed_kt": 3.6
    },
    {
      "Pressure_mb": 393.3,
      "Altitude_m": 7596,
      "Temp_c": -27.7,
      "Dewpoint_c": -44.3,
      "Wind_Direction": 300,
      "Wind_Speed_kt": 3.7
    },
    {
      "Pressure_mb": 393.1,
      "Altitude_m": 7600,
      "Temp_c": -27.8,
      "Dewpoint_c": -44.3,
      "Wind_Direction": 300,
      "Wind_Speed_kt": 3.7
    }
  ],
  "soaringForecast": {
    "@context": {
      "@version": "1.1",
      "@vocab": "https://api.weather.gov/ontology#"
    },
    "@id": "https://api.weather.gov/products/6688119e-313b-4724-a7f6-5da35bc7ed4d",
    "id": "6688119e-313b-4724-a7f6-5da35bc7ed4d",
    "wmoCollectiveId": "UXUS97",
    "issuingOffice": "KSLC",
    "issuanceTime": "2026-01-15T12:28:00+00:00",
    "productCode": "SRG",
    "productName": "Soaring Guidance",
    "productText": "\n000\nUXUS97 KSLC 151228\nSRGSLC\n\nSoaring Forecast\nNational Weather Service Salt Lake City, Utah\n528 AM MST Thursday, January 15, 2026\n\nThis forecast is for Thursday, January 15, 2026:\n\nIf the trigger temperature of 52.9 F/11.6 C is reached...then\n   Thermal Soaring Index....................... Fair\n   Maximum rate of lift........................ 217 ft/min (1.1 m/s)\n   Maximum height of thermals.................. 7017 ft MSL (2093 ft AGL)\n\nForecast maximum temperature................... 42.0 F/6.0 C\nTime of trigger temperature.................... None\nTime of overdevelopment........................ None\nMiddle/high clouds during soaring window....... None\nSurface winds during soaring window............ 20 mph or less\nHeight of the -3 thermal index................. 6176 ft MSL (1252 ft AGL)\nThermal soaring outlook for Friday 01/16....... Fair\n\nWave Soaring Index............................. Not available\n\nRemarks... \n\nSunrise/Sunset.................... 07:49:44 / 17:24:56 MST\nTotal possible sunshine........... 9 hr 35 min 12 sec (575 min 12 sec)\nAltitude of sun at 12:37:20 MST... 27.61 degrees\n\nUpper air data from rawinsonde observation taken on 01/15/2026 at 0500 MST\n\nFreezing level.................. Entire airmass below 32 F / 0 C \nConvective condensation level... 18472 ft MSL (13548 ft AGL)\nLifted condensation level....... 11618 ft MSL (6694 ft AGL)\nLifted index.................... +13.8\nK index......................... -24.4\n\nHeight  Temperature  Wind  Wind Spd  Lapse Rate  ConvectionT  Thermal  Lift Rate\nft MSL  deg C deg F   Dir   kt  m/s  C/km F/kft  deg C deg F   Index    fpm  m/s\n--------------------------------------------------------------------------------\n 26000  -35.8 -32.4   350   69   35   8.4   4.6   29.1  84.5    18.5      M    M\n 24000  -30.8 -23.4   345   67   34   8.1   4.5   28.3  82.9    18.2      M    M\n 22000  -26.2 -15.2   340   59   30   7.7   4.2   26.7  80.0    17.3      M    M\n 20000  -20.9  -5.6   340   52   27   7.8   4.3   25.1  77.1    16.5      M    M\n 18000  -16.4   2.5   335   47   24   7.1   3.9   23.6  74.4    15.6      M    M\n 16000  -12.4   9.7   340   42   22   6.1   3.3   21.5  70.8    14.1      M    M\n 14000   -8.5  16.7   345   36   18   5.9   3.3   19.3  66.7    12.4      M    M\n 12000   -5.5  22.1   350   30   16   4.8   2.6   16.3  61.3     9.8      M    M\n 10000   -2.3  27.9   350   23   12   5.9   3.3   13.5  56.3     7.4      M    M\n  9000   -0.7  30.7   355   19   10   3.4   1.8   12.1  53.8     6.2      M    M\n  8000   -0.2  31.6   360   14    7   0.7   0.4    9.6  49.3     3.7      M    M\n  7000   -0.9  30.4   355    6    3  -3.0  -1.6    5.4  41.7    -0.5    218  1.1\n  6000   -1.3  29.7   360    2    1   1.5   0.8    2.1  35.8    -3.9    202  1.0\n  5000   -0.7  30.7   000    0    0 -36.5 -20.0   -0.1  31.7    -6.2    153  0.8\n\n * * * * * * Numerical weather prediction model forecast data valid * * * * * * \n\n           01/15/2026 at 0800 MST          |       01/15/2026 at 1100 MST        \n                                           |\nCAPE...     0.0    LI...       +9.0        | CAPE...     0.0    LI...       +8.8\nCINH...     0.0    K Index... -21.3        | CINH...    -0.1    K Index... -16.4\n                                           |\nHeight Temperature  Wnd WndSpd  Lapse Rate | Temperature  Wnd WndSpd  Lapse Rate\nft MSL deg C deg F  Dir kt m/s  C/km F/kft | deg C deg F  Dir kt m/s  C/km F/kft\n--------------------------------------------------------------------------------\n 26000 -31.1 -24.0  300  62 32   8.1   4.4 | -32.1 -25.8  305  66 34   7.3   4.0\n 24000 -26.3 -15.3  300  60 31   8.2   4.5 | -27.7 -17.9  310  61 31   8.2   4.5\n 22000 -21.4  -6.5  300  55 29   8.2   4.5 | -22.8  -9.0  320  55 28   8.1   4.4\n 20000 -16.7   1.9  300  52 27   7.7   4.2 | -18.0  -0.4  325  52 27   8.0   4.4\n 18000 -11.8  10.8  305  48 25   6.9   3.8 | -12.9   8.8  330  49 25   7.0   3.9\n 16000  -7.8  18.0  310  41 21   6.2   3.4 |  -9.6  14.7  335  43 22   4.7   2.6\n 14000  -4.6  23.7  315  37 19   4.6   2.5 |  -6.5  20.3  335  37 19   6.4   3.5\n 12000  -1.6  29.1  325  32 16   6.1   3.4 |  -2.8  27.0  340  28 14   6.0   3.3\n 10000   1.8  35.2  325  24 12   5.2   2.8 |   0.6  33.1  340  22 11   5.0   2.7\n  9000   2.9  37.2  320  18  9   1.8   1.0 |   1.8  35.2  335  18  9   2.5   1.4\n  8000   3.1  37.6  310  11  5  -0.2  -0.1 |   2.4  36.3  330  11  6   1.0   0.6\n  7000   2.9  37.2  280   5  3   1.1   0.6 |   2.5  36.5  315   5  3   2.2   1.2\n  6000   2.7  36.9  225   3  1  -0.2  -0.1 |   2.7  36.9  275   1  1   3.5   1.9\n  5000   2.4  36.3  165   2  1  -8.2  -4.5 |   3.8  38.8  215   1  1  14.6   8.0\n\n           01/15/2026 at 1400 MST          |       01/15/2026 at 1700 MST        \n                                           |\nCAPE...     0.0    LI...       +7.9        | CAPE...     0.0    LI...       +7.0\nCINH...    -0.0    K Index... -27.9        | CINH...    -0.2    K Index... -19.6\n                                           |\nHeight Temperature  Wnd WndSpd  Lapse Rate | Temperature  Wnd WndSpd  Lapse Rate\nft MSL deg C deg F  Dir kt m/s  C/km F/kft | deg C deg F  Dir kt m/s  C/km F/kft\n--------------------------------------------------------------------------------\n 26000 -33.4 -28.1  320  69 36   7.8   4.3 | -34.7 -30.5  330  58 30   8.0   4.4\n 24000 -28.7 -19.7  320  62 32   7.6   4.2 | -29.9 -21.8  330  55 29   8.3   4.5\n 22000 -24.2 -11.6  325  55 28   7.6   4.2 | -24.9 -12.8  335  53 27   8.3   4.6\n 20000 -19.0  -2.2  330  48 25   7.7   4.2 | -20.3  -4.5  335  50 26   7.3   4.0\n 18000 -14.2   6.4  340  42 21   8.1   4.4 | -15.4   4.3  335  45 23   7.3   4.0\n 16000  -9.5  14.9  345  36 19   7.7   4.2 | -10.8  12.6  335  40 21   8.0   4.4\n 14000  -5.8  21.6  350  32 16   3.6   2.0 |  -6.2  20.8  340  35 18   6.1   3.3\n 12000  -3.3  26.1  345  25 13   5.6   3.0 |  -2.8  27.0  345  28 14   4.8   2.6\n 10000  -0.1  31.8  335  17  9   5.0   2.8 |  -0.0  32.0  345  21 11   5.4   3.0\n  9000   1.2  34.2  335  14  7   2.4   1.3 |   1.2  34.2  340  17  9   4.2   2.3\n  8000   1.6  34.9  330  11  6   0.9   0.5 |   2.0  35.6  345  12  6   1.2   0.7\n  7000   1.9  35.4  320   6  3   2.1   1.1 |   2.2  36.0  345   7  3   1.3   0.7\n  6000   2.5  36.5  325   4  2   6.8   3.8 |   2.7  36.9  335   3  2   3.1   1.7\n  5000   4.7  40.5  330   4  2  16.1   8.8 |   3.8  38.8  320   2  1   8.7   4.8\n________________________________________________________________________________\n\nThis product is issued once per day by approximately 0600 MST/0700 MDT \n(1300 UTC). This product is not continuously monitored nor updated after\nthe initial issuance. \n\nThe information contained herein is based on the 1200 UTC rawinsonde observation\nat the Salt Lake City, Utah International Airport and/or numerical weather \nprediction model data representative of the airport. These data may not be\nrepresentative of other areas along the Wasatch Front. Erroneous data such as\nthese should not be used.\n\nThe content and format of this report as well as the issuance times are subject\nto change without prior notice.\n\n042025\n"
  },
  "areaForecast": {
    "@context": {
      "@version": "1.1",
      "@vocab": "https://api.weather.gov/ontology#"
    },
    "@id": "https://api.weather.gov/products/e64e8640-2bf0-406d-af54-0380b81faebd",
    "id": "e64e8640-2bf0-406d-af54-0380b81faebd",
    "wmoCollectiveId": "FXUS65",
    "issuingOffice": "KSLC",
    "issuanceTime": "2026-01-15T22:12:00+00:00",
    "productCode": "AFD",
    "productName": "Area Forecast Discussion",
    "productText": "\n000\nFXUS65 KSLC 152212\nAFDSLC\n\nArea Forecast Discussion\nNational Weather Service Salt Lake City UT\n312 PM MST Thu Jan 15 2026\n\n.KEY MESSAGES...\n\n- Cooling aloft with a slight increase in winds aloft overnight\n  will help to bring a slight improvement to valley\n  inversions/haze, but significant improvement is unlikely.\n\n- Pattern will continue to favor dry conditions with inversions\n  remaining with the next potential storm not until next Thursday.\n\n&&\n\n.DISCUSSION...A deep trough with an arctic airmass will be moving\ninto the eastern half of the CONUS tonight into the weekend. Our\nCWA will on the westward periphery of this trough. This will be\nclose enough in proximity to introduce some cooler air aloft.\nCurrent 700 mb temperatures are a couple of degrees above\nfreezing, but by this time tomorrow it will be 5-10 degrees\ncooler, depending on location. Areas more north and east will be\ncolder aloft than areas further south and west. This will help to\nalleviate valley inversion conditions and haze. Some model\nsoundings have valley inversions breaking by tomorrow afternoon,\nwhile others just weaken the inversion slightly. Regardless, all\nof these model soundings do bring inversion conditions back rather\nquickly. Therefore, expect slight inversion improvements, but it\nis unlikely that valleys will completely clear out with this\ngrazing trough.\n\nEven though we likely won't completely clear out, flow aloft does\nstay out of the north/west with cooler air continuing to advect\ninto the area aloft. This will help to prevent inversions from\nbecoming well established, and profiles become more favorable for\nenough diurnal mixing to help limit the haze build up in the \nvalleys through next week.\n\nThe next storm is still a week away with the earliest arrival by\nnext Thursday. However, don't hang your hat on a storm next\nThursday just yet. There is still a large amount of uncertainty \nin the guidance to suggest that a dry streak could continue beyond\nThursday. ~50% of ensemble members bring a storm from the PNW \ninto the CWA by next Thursday. The other remaining members either \ndelay the arrival or keep the dry pattern going. We will have to \nwait for guidance to converge on a solution before discussing \ndetails that far out. \n\n\n&&\n\n.AVIATION...KSLC...MVFR visibility will prevail through the valid \nTAF period as valley haze remains prevalent. Early morning VIS may \ndrop into the high-end IFR category between 10-15Z, with the chance \nof dense fog at the terminal less than 20% during this time. \nimproving through the mid-morning. Northwest winds will switch back \nto the southeast by 03Z, but will become light and variable at times \novernight. \n\n.REST OF UTAH AND SOUTHWEST WYOMING...Local areas of dense fog will \nbe possible across northern Utah between 10-18Z, mainly around KLGU, \nKHCR and near KBMC. Persistent haze will bring MVFR VIS along the \nWasatch Front throughout the TAF period. Otherwise expect light, \ndiurnally driven flows across all terminals today alongside clear \nskies.\n\n&&\n\n.SLC WATCHES/WARNINGS/ADVISORIES...\nUT...None.\nWY...None.\n&&\n\n$$\n\nPUBLIC...Mahan\nAVIATION...Seaman\n\nFor more information from NOAA's National Weather Service visit...\nhttp://weather.gov/saltlakecity\n"
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
      "generatedAt": "2026-01-16T03:22:38+00:00",
      "updateTime": "2026-01-15T21:04:42+00:00",
      "validTimes": "2026-01-15T15:00:00+00:00/P7DT10H",
      "elevation": {
        "unitCode": "wmoUnit:m",
        "value": 1278.9408
      },
      "periods": [
        {
          "number": 1,
          "name": "Tonight",
          "startTime": "2026-01-15T20:00:00-07:00",
          "endTime": "2026-01-16T06:00:00-07:00",
          "isDaytime": false,
          "temperature": 25,
          "temperatureUnit": "F",
          "temperatureTrend": null,
          "probabilityOfPrecipitation": {
            "unitCode": "wmoUnit:percent",
            "value": 0
          },
          "windSpeed": "2 mph",
          "windDirection": "WNW",
          "icon": "https://api.weather.gov/icons/land/night/fog?size=medium",
          "shortForecast": "Haze",
          "detailedForecast": "Haze and areas of fog. Mostly clear, with a low around 25. West northwest wind around 2 mph."
        },
        {
          "number": 2,
          "name": "Friday",
          "startTime": "2026-01-16T06:00:00-07:00",
          "endTime": "2026-01-16T18:00:00-07:00",
          "isDaytime": true,
          "temperature": 41,
          "temperatureUnit": "F",
          "temperatureTrend": null,
          "probabilityOfPrecipitation": {
            "unitCode": "wmoUnit:percent",
            "value": 0
          },
          "windSpeed": "2 to 6 mph",
          "windDirection": "NW",
          "icon": "https://api.weather.gov/icons/land/day/fog?size=medium",
          "shortForecast": "Haze",
          "detailedForecast": "Haze and areas of fog. Mostly sunny. High near 41, with temperatures falling to around 39 in the afternoon. Northwest wind 2 to 6 mph."
        },
        {
          "number": 3,
          "name": "Friday Night",
          "startTime": "2026-01-16T18:00:00-07:00",
          "endTime": "2026-01-17T06:00:00-07:00",
          "isDaytime": false,
          "temperature": 23,
          "temperatureUnit": "F",
          "temperatureTrend": null,
          "probabilityOfPrecipitation": {
            "unitCode": "wmoUnit:percent",
            "value": 0
          },
          "windSpeed": "2 to 6 mph",
          "windDirection": "N",
          "icon": "https://api.weather.gov/icons/land/night/haze/few?size=medium",
          "shortForecast": "Haze then Mostly Clear",
          "detailedForecast": "Haze before 11pm. Mostly clear. Low around 23, with temperatures rising to around 25 overnight. North wind 2 to 6 mph."
        },
        {
          "number": 4,
          "name": "Saturday",
          "startTime": "2026-01-17T06:00:00-07:00",
          "endTime": "2026-01-17T18:00:00-07:00",
          "isDaytime": true,
          "temperature": 41,
          "temperatureUnit": "F",
          "temperatureTrend": null,
          "probabilityOfPrecipitation": {
            "unitCode": "wmoUnit:percent",
            "value": 0
          },
          "windSpeed": "5 mph",
          "windDirection": "NNW",
          "icon": "https://api.weather.gov/icons/land/day/few?size=medium",
          "shortForecast": "Sunny",
          "detailedForecast": "Sunny, with a high near 41. North northwest wind around 5 mph."
        },
        {
          "number": 5,
          "name": "Saturday Night",
          "startTime": "2026-01-17T18:00:00-07:00",
          "endTime": "2026-01-18T06:00:00-07:00",
          "isDaytime": false,
          "temperature": 25,
          "temperatureUnit": "F",
          "temperatureTrend": null,
          "probabilityOfPrecipitation": {
            "unitCode": "wmoUnit:percent",
            "value": 0
          },
          "windSpeed": "3 mph",
          "windDirection": "SE",
          "icon": "https://api.weather.gov/icons/land/night/few?size=medium",
          "shortForecast": "Mostly Clear",
          "detailedForecast": "Mostly clear, with a low around 25. Southeast wind around 3 mph."
        },
        {
          "number": 6,
          "name": "Sunday",
          "startTime": "2026-01-18T06:00:00-07:00",
          "endTime": "2026-01-18T18:00:00-07:00",
          "isDaytime": true,
          "temperature": 47,
          "temperatureUnit": "F",
          "temperatureTrend": null,
          "probabilityOfPrecipitation": {
            "unitCode": "wmoUnit:percent",
            "value": 0
          },
          "windSpeed": "3 mph",
          "windDirection": "WSW",
          "icon": "https://api.weather.gov/icons/land/day/few?size=medium",
          "shortForecast": "Sunny",
          "detailedForecast": "Sunny, with a high near 47."
        },
        {
          "number": 7,
          "name": "Sunday Night",
          "startTime": "2026-01-18T18:00:00-07:00",
          "endTime": "2026-01-19T06:00:00-07:00",
          "isDaytime": false,
          "temperature": 26,
          "temperatureUnit": "F",
          "temperatureTrend": null,
          "probabilityOfPrecipitation": {
            "unitCode": "wmoUnit:percent",
            "value": 0
          },
          "windSpeed": "3 mph",
          "windDirection": "N",
          "icon": "https://api.weather.gov/icons/land/night/few?size=medium",
          "shortForecast": "Mostly Clear",
          "detailedForecast": "Mostly clear, with a low around 26."
        },
        {
          "number": 8,
          "name": "M.L. King Jr. Day",
          "startTime": "2026-01-19T06:00:00-07:00",
          "endTime": "2026-01-19T18:00:00-07:00",
          "isDaytime": true,
          "temperature": 44,
          "temperatureUnit": "F",
          "temperatureTrend": null,
          "probabilityOfPrecipitation": {
            "unitCode": "wmoUnit:percent",
            "value": 0
          },
          "windSpeed": "5 mph",
          "windDirection": "NE",
          "icon": "https://api.weather.gov/icons/land/day/few?size=medium",
          "shortForecast": "Sunny",
          "detailedForecast": "Sunny, with a high near 44."
        },
        {
          "number": 9,
          "name": "Monday Night",
          "startTime": "2026-01-19T18:00:00-07:00",
          "endTime": "2026-01-20T06:00:00-07:00",
          "isDaytime": false,
          "temperature": 27,
          "temperatureUnit": "F",
          "temperatureTrend": null,
          "probabilityOfPrecipitation": {
            "unitCode": "wmoUnit:percent",
            "value": 0
          },
          "windSpeed": "5 mph",
          "windDirection": "NE",
          "icon": "https://api.weather.gov/icons/land/night/skc?size=medium",
          "shortForecast": "Clear",
          "detailedForecast": "Clear, with a low around 27."
        },
        {
          "number": 10,
          "name": "Tuesday",
          "startTime": "2026-01-20T06:00:00-07:00",
          "endTime": "2026-01-20T18:00:00-07:00",
          "isDaytime": true,
          "temperature": 47,
          "temperatureUnit": "F",
          "temperatureTrend": null,
          "probabilityOfPrecipitation": {
            "unitCode": "wmoUnit:percent",
            "value": 0
          },
          "windSpeed": "5 mph",
          "windDirection": "SW",
          "icon": "https://api.weather.gov/icons/land/day/few?size=medium",
          "shortForecast": "Sunny",
          "detailedForecast": "Sunny, with a high near 47."
        },
        {
          "number": 11,
          "name": "Tuesday Night",
          "startTime": "2026-01-20T18:00:00-07:00",
          "endTime": "2026-01-21T06:00:00-07:00",
          "isDaytime": false,
          "temperature": 29,
          "temperatureUnit": "F",
          "temperatureTrend": null,
          "probabilityOfPrecipitation": {
            "unitCode": "wmoUnit:percent",
            "value": 0
          },
          "windSpeed": "3 mph",
          "windDirection": "SSE",
          "icon": "https://api.weather.gov/icons/land/night/sct?size=medium",
          "shortForecast": "Partly Cloudy",
          "detailedForecast": "Partly cloudy, with a low around 29."
        },
        {
          "number": 12,
          "name": "Wednesday",
          "startTime": "2026-01-21T06:00:00-07:00",
          "endTime": "2026-01-21T18:00:00-07:00",
          "isDaytime": true,
          "temperature": 49,
          "temperatureUnit": "F",
          "temperatureTrend": null,
          "probabilityOfPrecipitation": {
            "unitCode": "wmoUnit:percent",
            "value": 3
          },
          "windSpeed": "5 mph",
          "windDirection": "SSW",
          "icon": "https://api.weather.gov/icons/land/day/sct?size=medium",
          "shortForecast": "Mostly Sunny",
          "detailedForecast": "Mostly sunny, with a high near 49."
        },
        {
          "number": 13,
          "name": "Wednesday Night",
          "startTime": "2026-01-21T18:00:00-07:00",
          "endTime": "2026-01-22T06:00:00-07:00",
          "isDaytime": false,
          "temperature": 31,
          "temperatureUnit": "F",
          "temperatureTrend": null,
          "probabilityOfPrecipitation": {
            "unitCode": "wmoUnit:percent",
            "value": 5
          },
          "windSpeed": "3 mph",
          "windDirection": "S",
          "icon": "https://api.weather.gov/icons/land/night/sct?size=medium",
          "shortForecast": "Partly Cloudy",
          "detailedForecast": "Partly cloudy, with a low around 31."
        },
        {
          "number": 14,
          "name": "Thursday",
          "startTime": "2026-01-22T06:00:00-07:00",
          "endTime": "2026-01-22T18:00:00-07:00",
          "isDaytime": true,
          "temperature": 49,
          "temperatureUnit": "F",
          "temperatureTrend": null,
          "probabilityOfPrecipitation": {
            "unitCode": "wmoUnit:percent",
            "value": 10
          },
          "windSpeed": "6 mph",
          "windDirection": "SSW",
          "icon": "https://api.weather.gov/icons/land/day/bkn?size=medium",
          "shortForecast": "Partly Sunny",
          "detailedForecast": "Partly sunny, with a high near 49."
        }
      ]
    }
  },
  "windMapScreenshotMetadata": {
    "kind": "storage#object",
    "id": "wasatch-wind-static/wind-map-save.png/1768532426472052",
    "selfLink": "https://www.googleapis.com/storage/v1/b/wasatch-wind-static/o/wind-map-save.png",
    "mediaLink": "https://storage.googleapis.com/download/storage/v1/b/wasatch-wind-static/o/wind-map-save.png?generation=1768532426472052&alt=media",
    "name": "wind-map-save.png",
    "bucket": "wasatch-wind-static",
    "generation": "1768532426472052",
    "metageneration": "2",
    "contentType": "image/png",
    "storageClass": "STANDARD",
    "size": "490007",
    "md5Hash": "Hp+sd0yRo662dnvkNku4YQ==",
    "crc32c": "1DwLGA==",
    "etag": "CPT0ttiIj5IDEAI=",
    "timeCreated": "2026-01-16T03:00:26.485Z",
    "updated": "2026-01-16T03:00:26.560Z",
    "timeStorageClassUpdated": "2026-01-16T03:00:26.485Z",
    "timeFinalized": "2026-01-16T03:00:26.485Z"
  }
}