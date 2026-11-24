"use strict";

////////////////////////////////////////
// Main Wind Aloft Forecast component //
////////////////////////////////////////
function processWindAloft(data) {
  try {
    const windAloftDestinationUrl = "https://aviationweather.gov/gfa/#winds";

    // Format API timestamps as local 12-hour times (e.g. 2pm)
    const formatTime = time => new Date(time).toLocaleTimeString([], { hour: "numeric", hour12: true }).toLowerCase();
    const windAloftContainer = document.getElementById("wind-aloft");

    // Define 4 consecutive 6-hour forecast periods; startIndex identifies the first hourly data point for each view
    const timeframes = [
      { key: "hours1to6", id: "wind-aloft-hours1to6", gridId: "openmeteo-grid-hours1to6", startIndex: 0 },
      { key: "hours7to12", id: "wind-aloft-hours7to12", gridId: "openmeteo-grid-hours7to12", startIndex: 6 },
      { key: "hours13to18", id: "wind-aloft-hours13to18", gridId: "openmeteo-grid-hours13to18", startIndex: 12 },
      { key: "hours19to24", id: "wind-aloft-hours19to24", gridId: "openmeteo-grid-hours19to24", startIndex: 18 }
    ];

    // Build the HTML container for each forecast period (all start collapsed except the first)
    const buildAllWindAloftSixHourCharts = ({ id, gridId }, index) => `
      <div class="bg-dark border ${index === 0 ? "" : "collapse"} rounded-4" id="${id}">
        <a href="${windAloftDestinationUrl}" target="_blank">
          <div id="${gridId}" class="wind-aloft-grid"></div>
        </a>
        <div class="display-3 fw-semibold mt-4 pt-4 text-warning clickable wind-aloft-toggle"></div>
      </div>`;

    // Insert the forecast heading and all forecast containers
    document.getElementById("wind-aloft").innerHTML = `
      <div class="mb-4">
        <div class="display-3 text-info">Wind Aloft Forecast @ KSLC 24 hrs</div>
        ${timeframes.map(buildAllWindAloftSixHourCharts).join("")}
      </div>`;

    // Store references to all forecast containers, indexed by timeframe key
    const views = Object.fromEntries(timeframes.map(({ key, id }) => [key, document.getElementById(id)]));

    // Handle navigation clicks using event delegation
    windAloftContainer.addEventListener("click", e => {
      const button = e.target.closest("[data-wind-view]");
      if (!button) return;

      showWindAloftView(button.dataset.windView);
    });

    // Display the selected forecast and update navigation links
    function showWindAloftView(timeframe) {

      // Show only the selected forecast period
      Object.entries(views).forEach(([key, element]) => { element.classList.toggle("collapse", key !== timeframe); });

      // Build navigation links in fixed positions
      timeframes.forEach((view, index) => {
        const toggle = views[view.key].querySelector(".wind-aloft-toggle");
        const previous = index > 0 ? `<div data-wind-view="${timeframes[index - 1].key}">-6 hours</div>` : "";
        const next = index < timeframes.length - 1 ? `<div data-wind-view="${timeframes[index + 1].key}">+6 hours</div>` : "";

        toggle.innerHTML = `
          <div class="d-flex justify-content-around">
            <div class="col-4">${previous}</div>
            <div class="col-4">${next}</div>
          </div>`;
      });
    }

    // Initialize the first view and populate all forecast grids
    showWindAloftView("hours1to6");
    timeframes.forEach(populateWindAloftData);

    ////////////////////////////////////////
    // Populate each 6-hour forecast grid //
    ////////////////////////////////////////
    function populateWindAloftData(timeframe) {
      const ftPerMeter = 3.28084;
      const container = document.getElementById(timeframe.gridId);

      // Determine the six hourly data indices for this forecast period
      const startIndex = timeframe.startIndex;
      const slice = [startIndex, startIndex + 6];

      // Pressure levels, ordered from highest to lowest altitude
      const pressureLevels = [500, 550, 650, 675, 700, 725, 750, 775, 800, 825, 850];
      const rowCount = pressureLevels.length + 1; // Include surface level

      // Map each pressure level and surface to its wind speed and direction arrays
      const windAloftRows = [
        ...pressureLevels.map(hPa => ({
          speed: `windspeed_${hPa}hPa`,
          dir: `winddirection_${hPa}hPa`
        })),
        { speed: "wind_speed_10m", dir: "wind_direction_10m" }
      ];

      // Calculate mean geopotential altitude for each pressure level over six hours
      const geopotentialMeans = pressureLevels.map(hPa => {
        const key = `geopotential_height_${hPa}hPa`;
        const cohort = data[key].slice(...slice);
        const avgMeters = cohort.reduce((a, b) => a + b, 0) / cohort.length;

        return Math.round(avgMeters * ftPerMeter).toLocaleString();
      });

      // Define column 1 labels for pressure levels, surface, and time
      const labels = [
        ...pressureLevels.map((hPa, index) => ({
          label: geopotentialMeans[index],
          sub: `${hPa} hPa`
        })),
        { label: "4,226", sub: "Surface" },
        { label: "", sub: "" } // Final row displays forecast times
      ];

      // Build grid row by row
      labels.forEach((row, rowIndex) => {
        const rowEl = document.createElement("div");
        rowEl.className = "wind-aloft-row";

        // Each row has one label column followed by six hourly columns
        for (let col = 0; col < 7; col++) {
          const cell = document.createElement("div");
          cell.className = "display-5 wind-aloft-cell";

          // First column: altitude and pressure-level labels
          if (col === 0) {
            cell.innerHTML = `
              <div>${row.label}</div>
              <div class="display-6 fw-semibold fs-2 text-secondary">${row.sub}</div>`;
          }

          // Remaining columns: wind speed, direction, and barb
          else if (rowIndex < rowCount) {
            const hourIndex = startIndex + (col - 1);
            const rowConfig = windAloftRows[rowIndex];
            const speed = data[rowConfig.speed]?.[hourIndex] ?? 0;
            const direction = data[rowConfig.dir]?.[hourIndex] ?? 0;
            const altitude = Math.round(Number(row.label.replace(/,/, "")) / 1000);

            populateWindCell(cell, speed, direction, altitude);
          }

          // Final row: display forecast time/hour
          else { cell.textContent = formatTime(data.time[startIndex + (col - 1)]); }

          rowEl.appendChild(cell);
        }

        container.appendChild(rowEl);
      });

      // Populate an individual wind cell with speed, barb, direction, and color
      function populateWindCell(cell, speed, direction, altitude) {
        const speedEl = document.createElement("div");
        speedEl.className = "fs-1 fw-semibold text-white wind-aloft-forecast-speed";
        speedEl.textContent = Math.round(speed);

        // Select the appropriate wind barb image
        const barb = speed < 0.5 ? "calm" : Math.min(50, Math.floor(speed / 5) * 5);

        const img = document.createElement("img");
        img.src = `prod/images/barbs/barb${barb}.png`;
        img.className = "wind-aloft-forecast-barb";
        img.alt = Math.round(speed);
        img.style.transform = `rotate(${direction}deg)`;

        // Add speed and barb, then color the cell based on wind speed and altitude
        cell.append(speedEl, img);
        cell.style.backgroundColor = windSpeedColor(Math.round(speed), altitude);
      }
    }
  } catch (error) {
    console.error("Open Meteo Wind Aloft data error:", error);
    return;
  }
}
