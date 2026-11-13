"use strict";

////////////////////////////////////////
// Main Wind Aloft Forecast component //
////////////////////////////////////////
function processWindAloft(data) {
  return;
  try {
    const windAloftUrl = "https://aviationweather.gov/gfa/#winds";

    const buildWindAloftSection = ({ id, gridId, label }) => `
    <div class="bg-dark border ${id.includes("next") ? "collapse" : ""} rounded-4" id="${id}">
      <a href="${windAloftUrl}" target="_blank">
        <div id="${gridId}"></div>
      </a>
      <div class="display-3 fw-semibold mt-4 pt-4 text-warning clickable wind-aloft-toggle">
        ${label}
      </div>
    </div>`;

    const formatTime = (time) => { return new Date(time).toLocaleTimeString([], { hour: "numeric", hour12: true }).toLowerCase() }
    const ranges = [
      `${formatTime(data.time[0])} - ${formatTime(data.time[5])}`,
      `${formatTime(data.time[6])} - ${formatTime(data.time[11])}`
    ];

    document.getElementById("wind-aloft").innerHTML = `
    <div class="mb-4">
      <div class="display-3 text-info">Wind Aloft Forecast @ KSLC</div>
      ${buildWindAloftSection({ id: "wind-aloft-current6", gridId: "openmeteo-grid-current6", label: `${ranges[1]} &#187;` })}
      ${buildWindAloftSection({ id: "wind-aloft-next6", gridId: "openmeteo-grid-next6", label: `&#171; ${ranges[0]}` })}
    </div>`;

    const windAloftContainer = document.getElementById("wind-aloft");
    const currentEl = document.getElementById("wind-aloft-current6");
    const nextEl = document.getElementById("wind-aloft-next6");

    windAloftContainer.addEventListener("click", (e) => {
      if (!e.target.closest(".wind-aloft-toggle")) return;
      toggleWindAloftView();
    });

    function toggleWindAloftView() {
      currentEl.classList.toggle("collapse");
      nextEl.classList.toggle("collapse");
    }

    populateWindAloftData("current6");
    populateWindAloftData("next6");

    // Populate the current6 and next6 hour Wind Aloft Forecast views
    function populateWindAloftData(timeframe) {
      const ftPerMeter = 3.28084;
      const container = document.getElementById(`openmeteo-grid-${timeframe}`);
      const startIndex = timeframe === "current6" ? 0 : 6;
      const slice = timeframe === "current6" ? [0, 6] : [6, 12];
      const pressureLevels = [550, 650, 675, 700, 725, 750, 775, 800, 825, 850, 875];
      const rowCount = pressureLevels.length + 1 // Pressure Levels + Surface

      // Calculate the mean geopotential altitude for current6 and next6
      const geopotentialMeans = pressureLevels.map(hPa => {
        const key = `geopotential_height_${hPa}hPa`;
        const cohort = data[key].slice(...slice);
        const avgMeters = cohort.reduce((a, b) => a + b, 0) / cohort.length;
        return Math.round(avgMeters * ftPerMeter).toLocaleString();
      });

      const labels = [
        ...pressureLevels.map((hPa, index) => ({
          label: geopotentialMeans[index],
          sub: `${hPa} hPa`
        })),
        { label: "4,260", sub: "Surface" },
        { label: "", sub: "" } // Time row
      ];

      // Build rows
      labels.forEach((row, rowIndex) => {
        const rowEl = document.createElement("div");
        rowEl.className = "wind-aloft-row";

        for (let col = 0; col < 7; col++) {
          const cell = document.createElement("div");
          cell.className = "display-5 wind-aloft-cell";
          if (col === 0) cell.style.cssText = "min-width: 140px; width: 140px;";

          // Column 1: Labels
          if (col === 0) cell.innerHTML = `<div>${row.label}</div>${`<div class="display-6 fw-semibold fs-2 text-secondary">${row.sub}</div>`}`;

          // Data cells
          else if (rowIndex < rowCount) {
            const windAloftRows = [
              ...pressureLevels.map(hPa => ({
                speed: `windspeed_${hPa}hPa`,
                dir: `winddirection_${hPa}hPa`
              })),
              {
                speed: "wind_speed_10m",
                dir: "wind_direction_10m"
              }
            ];

            const hourIndex = startIndex + (col - 1);
            const rowConfig = windAloftRows[rowIndex];
            const speed = data[rowConfig.speed]?.[hourIndex] ?? 0;
            const direction = data[rowConfig.dir]?.[hourIndex] ?? 0;
            const altitude = Math.round(Number(row.label.replace(/,/, "")) / 1000);

            populateWindCell(cell, speed, direction, altitude);
          }

          // Time row
          else cell.textContent = formatTime(data.time[startIndex + (col - 1)]);

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
  } catch (error) {
    console.log("Open Meteo data error");
    return;
  }
}