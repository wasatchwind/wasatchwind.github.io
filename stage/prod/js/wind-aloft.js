"use strict";

function processWindAloft(openMeteo, windAloft6, windAloft12, windAloft24) {
  windAloft6 = parseWindAloft(windAloft6.productText);
  windAloft12 = parseWindAloft(windAloft12.productText);
  windAloft24 = parseWindAloft(windAloft24.productText);
  injectWindAloftIntoOpenMeteo(openMeteo, windAloft6, windAloft12, windAloft24);
  windAloftLongterm(windAloft24);
  buildWindAloftForecast(openMeteo);
}

function parseWindAloft(text) {
  const timeframe = text.match(/FOR USE\s+(\d{2})00-(\d{2})00Z/);
  const starttime = Number(timeframe[1]);
  const endtime = Number(timeframe[2]);
  const slc = text.match(/^SLC.*$/m)?.[0];
  const alts = ["altitude9k", "altitude12k", "altitude18k"];
  const windspeed = {};
  const winddirection = {};
  const temperature = {};
  const data = slc.slice(17, 41);

  for (let i = 0; i < alts.length; i++) {
    const block = data.slice(i * 8, i * 8 + 7);
    const dir = parseInt(block.slice(0, 2), 10) * 10;
    winddirection[alts[i]] = dir === 990 ? null : dir;
    windspeed[alts[i]] = Math.round(parseInt(block.slice(2, 4)) * 1.15078);
    temperature[alts[i]] = Math.round(parseInt(block.slice(4, 7)) * 9 / 5 + 32);
  }

  return { starttime, endtime, windspeed, winddirection, temperature };
}

// Function to assimilate the NWS Wind Aloft data (windAloft) into the primary data source (openMeteo)
function injectWindAloftIntoOpenMeteo(openMeteo, windAloft6, windAloft12, windAloft24) {
  const altitudes = ["9k", "12k", "18k"];
  const fields = ["winddirection", "windspeed"];

  function isHourInRange(hour, start, end) {
    if (start < end) return hour >= start && hour < end;
    else return hour >= start || hour < end;
  }

  // Helper function to select the correct forecast (UTC) for a given local time
  function forecastSelector(utcHour) {
    if (isHourInRange(utcHour, windAloft6.starttime, windAloft6.endtime)) return windAloft6;
    if (isHourInRange(utcHour, windAloft12.starttime, windAloft12.endtime)) return windAloft12;
    return windAloft24;
  }

  for (const alt of altitudes) {
    for (const field of fields) {
      openMeteo[`${field}_${alt.replace("k", "000")}`] = openMeteo.time.map(t => {
        const forecast = forecastSelector(new Date(t).getUTCHours());
        return forecast[field][`altitude${alt}`];
      });
    }
  }
}



////////////////////////////////////////
// Main Wind Aloft Forecast component //
////////////////////////////////////////
function buildWindAloftForecast(data) {
  buildWindAloftContainer("current6");
  buildWindAloftContainer("next6");

  // Build the HTML DOM containers for the Wind Aloft Forecast component (current 6 and next 6 hours)
  function buildWindAloftContainer(timeframe) {
    const container = document.getElementById(`wind-aloft-rows-${timeframe}`);
    const startIndex = timeframe === "current6" ? 0 : 6;
    const slice = timeframe === "current6" ? [0, 6] : [6, 12];
    const pressureLevels = [625, 700, 750, 775, 800, 825, 850, 875];
    const rowCount = pressureLevels.length + 4 // Surface + NWS 9, 12, 18 (4)

    // Calculate the mean geopotential altitude for current 6 and next 6 hours
    const geopotentialMeans = pressureLevels.map(hPa => {
      const key = `geopotential_height_${hPa}hPa`;
      const cohort = data[key].slice(...slice);
      const avgMeters = cohort.reduce((a, b) => a + b, 0) / cohort.length;
      return Math.round(avgMeters * ftPerMeter).toLocaleString();
    });

    const labels = [
      { label: "18,000", sub: "NWS" },
      { label: geopotentialMeans[0], sub: `${pressureLevels[0]} hPa` },
      { label: "12,000", sub: "NWS" },
      { label: geopotentialMeans[1], sub: `${pressureLevels[1]} hPa` },
      { label: "9,000", sub: "NWS" },
      { label: geopotentialMeans[2], sub: `${pressureLevels[2]} hPa` },
      { label: geopotentialMeans[3], sub: `${pressureLevels[3]} hPa` },
      { label: geopotentialMeans[4], sub: `${pressureLevels[4]} hPa` },
      { label: geopotentialMeans[5], sub: `${pressureLevels[5]} hPa` },
      { label: geopotentialMeans[6], sub: `${pressureLevels[6]} hPa` },
      { label: geopotentialMeans[7], sub: `${pressureLevels[7]} hPa` },
      { label: "4,260", sub: "Surface" },
      { label: "", sub: "" } // Time row is empty in column 1 of the grid
    ];

    // Build rows
    labels.forEach((row, rowIndex) => {
      const rowEl = document.createElement("div");
      rowEl.className = "wind-aloft-row";

      for (let col = 0; col < 7; col++) {
        const cell = document.createElement("div");
        cell.className = "display-5 wind-aloft-cell";

        // Column 1: Labels
        if (col === 0) cell.innerHTML = `<div>${row.label}</div>${`<div class="display-6 fw-semibold fs-2 text-secondary">${row.sub}</div>`}`;

        // Data cells
        else if (rowIndex < rowCount) {
          const windAloftRows = [
            { speed: "windspeed_18000", dir: "winddirection_18000" },
            { speed: `windspeed_${pressureLevels[0]}hPa`, dir: `winddirection_${pressureLevels[0]}hPa` },
            { speed: "windspeed_12000", dir: "winddirection_12000" },
            { speed: `windspeed_${pressureLevels[1]}hPa`, dir: `winddirection_${pressureLevels[1]}hPa` },
            { speed: "windspeed_9000", dir: "winddirection_9000" },
            { speed: `windspeed_${pressureLevels[2]}hPa`, dir: `winddirection_${pressureLevels[2]}hPa` },
            { speed: `windspeed_${pressureLevels[3]}hPa`, dir: `winddirection_${pressureLevels[3]}hPa` },
            { speed: `windspeed_${pressureLevels[4]}hPa`, dir: `winddirection_${pressureLevels[4]}hPa` },
            { speed: `windspeed_${pressureLevels[5]}hPa`, dir: `winddirection_${pressureLevels[5]}hPa` },
            { speed: `windspeed_${pressureLevels[6]}hPa`, dir: `winddirection_${pressureLevels[6]}hPa` },
            { speed: `windspeed_${pressureLevels[7]}hPa`, dir: `winddirection_${pressureLevels[7]}hPa` },
            { speed: "wind_speed_10m", dir: "wind_direction_10m" }
          ];

          const hourIndex = startIndex + (col - 1);
          const rowConfig = windAloftRows[rowIndex];
          const speed = data[rowConfig.speed][hourIndex];
          const direction = data[rowConfig.dir][hourIndex];
          const altitude = Math.round(Number(row.label.replace(/,/, "")) / 1000);

          populateWindCell(cell, speed, direction, altitude);
        }

        // Time row
        else {
          const time = new Date(data.time[startIndex + (col - 1)]);
          cell.textContent = time.toLocaleTimeString([], { hour: "numeric", hour12: true }).toLowerCase();
        }

        rowEl.appendChild(cell);
      }

      container.appendChild(rowEl);
    });

    function populateWindCell(cell, speed, direction, altitude) {
      const speedEl = document.createElement("div");
      speedEl.className = "fs-1 fw-semibold text-white wind-aloft-forecast-speed";
      speedEl.textContent = Math.round(speed);

      const barb = speed < 0.5 ? "calm" : Math.min(50, Math.floor(speed / 5) * 5);
      const img = document.createElement("img");
      img.src = `prod/images/barbs/barb${barb}.png`;
      img.className = "wind-aloft-forecast-barb";
      img.alt = Math.round(speed);
      img.style.transform = `rotate(${direction}deg)`;

      cell.append(speedEl, img);
      cell.style.backgroundColor = windSpeedColor(Math.round(speed), altitude);
    }
  }
}



////////////////////////////////////////////////
// Wind Aloft Longterm (NWS 24 hour forecast) //
////////////////////////////////////////////////
function windAloftLongterm(data) {
  const altitudes = [18, 12, 9];

  buildWindAloftLongtermContainer(altitudes);
  injectWindAloftLongTermData(altitudes);

  // Build the HTML DOM container for wind aloft long term
  function buildWindAloftLongtermContainer(altitudes) {
    const container = document.getElementById("wind-aloft-rows-longterm");

    altitudes.forEach((alt, index) => {
      const row = document.createElement("div");
      row.className = "align-items-center d-flex display-3 justify-content-around";
      row.id = `wind-aloft-longterm-${alt}k`;

      row.innerHTML = `
        <div class="col">${alt.toLocaleString()},000</div>
        <img class="col-1" id="wind-aloft-longterm-dir-${alt}k">
        <div class="col d-flex justify-content-center fw-semibold" id="wind-aloft-longterm-speed-${alt}k"></div>
        <div class="col" id="wind-aloft-longterm-temp-${alt}k"></div>`;

      container.appendChild(row);

      // Insert border after first 2 rows but not the third/final row
      if (index < altitudes.length - 1) {
        container.appendChild(document.createElement("div")).className = "border border-dark";
      }
    });
  }

  // Load long term data (forecast24h) into the container
  function injectWindAloftLongTermData(altitudes) {

    // Format start and end time from UTC
    const formatTime = utc => {
      const timezoneOffset = now.getTimezoneOffset() / 60;
      const local24 = (((utc - timezoneOffset) % 24) + 24) % 24;

      if (local24 === 0) return "Midnight";
      if (local24 === 12) return "Noon";

      const isPM = local24 >= 12;
      const hour12 = local24 % 12 || 12;

      return `${hour12} ${isPM ? "pm" : "am"}`;
    };

    // Set the formatted start/end time into the heading
    const headingEl = document.getElementById("wind-aloft-time-longterm");
    headingEl.textContent = `Wind Aloft ${formatTime(data.starttime)} - ${formatTime(data.endtime)} ${nextDay}`;

    // Normalize the data into an object
    const byAltitude = {};
    altitudes.forEach(alt => {
      byAltitude[alt] = {
        speed: data.windspeed[`altitude${alt}k`],
        dir: data.winddirection[`altitude${alt}k`],
        temp: data.temperature[`altitude${alt}k`]
      };
    });

    // Render
    altitudes.forEach(alt => {
      const { speed, dir, temp } = byAltitude[alt];

      const row = document.getElementById(`wind-aloft-longterm-${alt}k`);
      const barb = speed < 0.5 ? "calm" : Math.min(50, Math.floor(speed / 5) * 5);

      row.style.backgroundColor = windSpeedColor(Math.round(speed), alt);
      document.getElementById(`wind-aloft-longterm-dir-${alt}k`).src = `prod/images/barbs/barb${barb}.png`;
      document.getElementById(`wind-aloft-longterm-dir-${alt}k`).style.transform = `rotate(${dir}deg)`;
      document.getElementById(`wind-aloft-longterm-speed-${alt}k`).textContent = Math.round(speed);
      document.getElementById(`wind-aloft-longterm-temp-${alt}k`).innerHTML = `${temp}&deg;`;
    });
  }
}