
"use strict";

////////////////////////////////////////
// Main Wind Aloft Forecast component //
////////////////////////////////////////
function processWindAloft(data) {
  try {
    const windAloftDestinationUrl = "https://aviationweather.gov/gfa/#winds";
    const windAloftContainer = document.getElementById("wind-aloft");

    if (!windAloftContainer) {
      throw new Error('Could not find element with id "wind-aloft".');
    }

    // Format API timestamps as local 12-hour times (e.g. 2pm)
    const formatTime = time =>
      new Date(time).toLocaleTimeString([], {
        hour: "numeric",
        hour12: true
      }).toLowerCase();

    //////////////////////////////////////////
    // Build the next 24 hours of forecast  //
    //////////////////////////////////////////

    function build24HourForecast(data) {
      const hourMilliseconds = 60 * 60 * 1000;

      // Start at the beginning of the current UTC hour
      const startTime =
        Math.floor(Date.now() / hourMilliseconds) * hourMilliseconds;

      const endTime = startTime + 24 * hourMilliseconds;
      const forecastByTime = new Map();

      // Add short forecast records first
      const shortForecast =
        data.short_forecast?.hourly_forecast || [];

      shortForecast.forEach(hour => {
        const time = new Date(hour.valid_time_utc).getTime();

        if (
          Number.isFinite(time) &&
          time >= startTime &&
          time < endTime
        ) {
          forecastByTime.set(time, hour);
        }
      });

      // Fill any remaining hours with extended forecast records
      const extendedForecast =
        data.extended_forecast?.hourly_forecast || [];

      extendedForecast.forEach(hour => {
        const time = new Date(hour.valid_time_utc).getTime();

        if (
          Number.isFinite(time) &&
          time >= startTime &&
          time < endTime &&
          !forecastByTime.has(time)
        ) {
          forecastByTime.set(time, hour);
        }
      });

      // Return exactly 24 hourly positions.
      // Missing forecast records are represented by null.
      return Array.from({ length: 24 }, (_, index) => {
        const time = startTime + index * hourMilliseconds;

        return {
          time,
          data: forecastByTime.get(time) || null
        };
      });
    }

    const hourlyForecast = build24HourForecast(data);

    //////////////////////////////////////////
    // Define the four 6-hour forecast views //
    //////////////////////////////////////////

    const timeframes = [
      {
        key: "hours1to6",
        id: "wind-aloft-hours1to6",
        gridId: "openmeteo-grid-hours1to6",
        startIndex: 0
      },
      {
        key: "hours7to12",
        id: "wind-aloft-hours7to12",
        gridId: "openmeteo-grid-hours7to12",
        startIndex: 6
      },
      {
        key: "hours13to18",
        id: "wind-aloft-hours13to18",
        gridId: "openmeteo-grid-hours13to18",
        startIndex: 12
      },
      {
        key: "hours19to24",
        id: "wind-aloft-hours19to24",
        gridId: "openmeteo-grid-hours19to24",
        startIndex: 18
      }
    ];

    // Build the HTML container for each forecast period
    const buildAllWindAloftSixHourCharts = ({ id, gridId }, index) => `
      <div class="bg-dark border ${index === 0 ? "" : "collapse"} rounded-4" id="${id}">
        <a href="${windAloftDestinationUrl}" target="_blank">
          <div id="${gridId}" class="wind-aloft-grid"></div>
        </a>
        <div class="display-3 fw-semibold mt-4 pt-4 text-warning clickable wind-aloft-toggle"></div>
      </div>`;

    // Insert the forecast heading and all forecast containers
    windAloftContainer.innerHTML = `
      <div class="mb-4">
        <div class="display-3 text-info">Wind Aloft Forecast @ KSLC 24 hrs</div>
        ${timeframes.map(buildAllWindAloftSixHourCharts).join("")}
      </div>`;

    // Store references to all forecast containers
    const views = Object.fromEntries(
      timeframes.map(({ key, id }) => [
        key,
        document.getElementById(id)
      ])
    );

    // Handle navigation clicks using event delegation
    windAloftContainer.addEventListener("click", e => {
      const button = e.target.closest("[data-wind-view]");
      if (!button) return;

      showWindAloftView(button.dataset.windView);
    });

    // Display the selected forecast and update navigation links
    function showWindAloftView(timeframe) {

      // Show only the selected forecast period
      Object.entries(views).forEach(([key, element]) => {
        element.classList.toggle("collapse", key !== timeframe);
      });

      // Build navigation links in fixed positions
      timeframes.forEach((view, index) => {
        const toggle =
          views[view.key].querySelector(".wind-aloft-toggle");

        const previous = index > 0
          ? `<div data-wind-view="${timeframes[index - 1].key}">-6 hours</div>`
          : "";

        const next = index < timeframes.length - 1
          ? `<div data-wind-view="${timeframes[index + 1].key}">+6 hours</div>`
          : "";

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
      const container = document.getElementById(timeframe.gridId);

      // Get the six hourly forecast records for this panel
      const startIndex = timeframe.startIndex;
      const panelHours = hourlyForecast.slice(
        startIndex,
        startIndex + 6
      );

      // Pressure levels, ordered from highest to lowest altitude
      const pressureLevels = [
        500, 550, 650, 675, 700, 725,
        750, 775, 800, 825, 850
      ];

      // AWS pressure-level keys and surface key
      const windAloftRows = [
        ...pressureLevels.map(hPa => ({
          key: `${hPa}mb`,
          label: `${hPa} hPa`
        })),
        {
          key: "surface_80m",
          label: "80m"
        },
        {
          key: "surface_10m",
          label: "Surface"
        }
      ];

      const rowCount = windAloftRows.length;

      // Calculate mean altitude for each pressure level
      // using the available records in this 6-hour panel
      const altitudeMeans = pressureLevels.map(hPa => {
        const altitudes = panelHours
          .map(hour =>
            hour.data?.locations?.KSLC?.[`${hPa}mb`]?.altitude_ft
          )
          .filter(value =>
            value !== null &&
            value !== undefined &&
            Number.isFinite(Number(value))
          )
          .map(Number);

        if (altitudes.length === 0) return "—";

        const average =
          altitudes.reduce((sum, value) => sum + value, 0) /
          altitudes.length;

        return Math.round(average).toLocaleString();
      });

      // Define column 1 labels for pressure levels, surface, and time
      const labels = [
        ...pressureLevels.map((hPa, index) => ({
          label: altitudeMeans[index],
          sub: `${hPa} hPa`
        })),
        {
          label: "4,488",
          sub: "80m"
        },
        {
          label: "4,226",
          sub: "Surface"
        },
        {
          label: "",
          sub: ""
        }
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
            const hour = panelHours[col - 1];
            const rowConfig = windAloftRows[rowIndex];

            // AWS data for KSLC only
            const wind = hour?.data?.locations?.KSLC?.[rowConfig.key];

            const speed = wind?.speed_mph;
            const direction = wind?.direction_deg;

            // Use the AWS altitude for pressure levels.
            // Preserve the original 4,226 ft surface altitude.
            const altitudeFt =
              rowConfig.key === "surface_80m"
                ? 4488
                : rowConfig.key === "surface_10m"
                  ? 4226
                  : wind?.altitude_ft;

            const altitude = Number.isFinite(Number(altitudeFt))
              ? Math.round(Number(altitudeFt) / 1000)
              : 0;

            populateWindCell(cell, speed, direction, altitude);
          }

          // Final row: display forecast time/hour
          else {
            cell.textContent = formatTime(
              hourlyForecast[startIndex + (col - 1)].time
            );
          }

          rowEl.appendChild(cell);
        }

        container.appendChild(rowEl);
      });


      ////////////////////////////////////////
      // Populate an individual wind cell  //
      ////////////////////////////////////////

      function populateWindCell(cell, speed, direction, altitude) {

        // Handle missing forecast data
        if (
          speed === null ||
          speed === undefined ||
          speed === "" ||
          !Number.isFinite(Number(speed))
        ) {
          cell.textContent = "—";
          return;
        }

        speed = Number(speed);

        // Display wind speed
        const speedEl = document.createElement("div");
        speedEl.className =
          "fs-1 fw-semibold text-white wind-aloft-forecast-speed";

        speedEl.textContent = Math.round(speed);

        // Select the appropriate wind barb image
        const barb = speed < 0.5
          ? "calm"
          : Math.min(50, Math.floor(speed / 5) * 5);

        const img = document.createElement("img");
        img.src = `prod/images/barbs/barb${barb}.png`;
        img.className = "wind-aloft-forecast-barb";
        img.alt = Math.round(speed);

        const windDirection = Number.isFinite(Number(direction))
          ? Number(direction)
          : 0;

        img.style.transform = `rotate(${windDirection}deg)`;

        // Add speed and barb, then color the cell
        // based on wind speed and altitude
        cell.append(speedEl, img);

        cell.style.backgroundColor = windSpeedColor(
          Math.round(speed),
          altitude
        );
      }
    }

  } catch (error) {
    console.error("AWS Wind Aloft data error:", error);
    return;
  }
}




































// "use strict";

// ////////////////////////////////////////
// // Main Wind Aloft Forecast component //
// ////////////////////////////////////////
// function processWindAloft(data) {
//   const windAloftDestinationUrl = "https://aviationweather.gov/gfa/#winds";

//   console.log(data);

//   // Format API timestamps as local 12-hour times (e.g. 2pm)
//   const formatTime = time => new Date(time).toLocaleTimeString([], { hour: "numeric", hour12: true }).toLowerCase();
//   const windAloftContainer = document.getElementById("wind-aloft");

//   // Define 4 consecutive 6-hour forecast periods; startIndex identifies the first hourly data point for each view
//   const timeframes = [
//     { key: "hours1to6", id: "wind-aloft-hours1to6", gridId: "grid-hours1to6", startIndex: 0 },
//     { key: "hours7to12", id: "wind-aloft-hours7to12", gridId: "grid-hours7to12", startIndex: 6 },
//     { key: "hours13to18", id: "wind-aloft-hours13to18", gridId: "grid-hours13to18", startIndex: 12 },
//     { key: "hours19to24", id: "wind-aloft-hours19to24", gridId: "grid-hours19to24", startIndex: 18 }
//   ];

//   // Build the HTML container for each forecast period (all start collapsed except the first)
//   const buildAllWindAloftSixHourCharts = ({ id, gridId }, index) => `
//       <div class="bg-dark border ${index === 0 ? "" : "collapse"} rounded-4" id="${id}">
//         <a href="${windAloftDestinationUrl}" target="_blank">
//           <div id="${gridId}" class="wind-aloft-grid"></div>
//         </a>
//         <div class="display-3 fw-semibold mt-4 pt-4 text-warning clickable wind-aloft-toggle"></div>
//       </div>`;

//   // Insert the forecast heading and all forecast containers
//   document.getElementById("wind-aloft").innerHTML = `
//       <div class="mb-4">
//         <div class="display-3 text-info">Wind Aloft Forecast 24 hrs</div>
//         ${timeframes.map(buildAllWindAloftSixHourCharts).join("")}
//       </div>`;

//   // Store references to all forecast containers, indexed by timeframe key
//   const views = Object.fromEntries(timeframes.map(({ key, id }) => [key, document.getElementById(id)]));

//   // Handle navigation clicks using event delegation
//   windAloftContainer.addEventListener("click", e => {
//     const button = e.target.closest("[data-wind-view]");
//     if (!button) return;

//     showWindAloftView(button.dataset.windView);
//   });

//   // Display the selected forecast and update navigation links
//   function showWindAloftView(timeframe) {

//     // Show only the selected forecast period
//     Object.entries(views).forEach(([key, element]) => { element.classList.toggle("collapse", key !== timeframe); });

//     // Build navigation links in fixed positions
//     timeframes.forEach((view, index) => {
//       const toggle = views[view.key].querySelector(".wind-aloft-toggle");
//       const previous = index > 0 ? `<div data-wind-view="${timeframes[index - 1].key}">-6 hours</div>` : "";
//       const next = index < timeframes.length - 1 ? `<div data-wind-view="${timeframes[index + 1].key}">+6 hours</div>` : "";

//       toggle.innerHTML = `
//           <div class="d-flex justify-content-around">
//             <div class="col-4">${previous}</div>
//             <div class="col-4">${next}</div>
//           </div>`;
//     });
//   }

//   // Initialize the first view and populate all forecast grids
//   showWindAloftView("hours1to6");
//   timeframes.forEach(populateWindAloftData);

//   ////////////////////////////////////////
//   // Populate each 6-hour forecast grid //
//   ////////////////////////////////////////
//   function populateWindAloftData(timeframe) {
//     const container = document.getElementById(timeframe.gridId);

//     // Determine the six hourly data indices for this forecast period
//     const startIndex = timeframe.startIndex;

//     // Pressure levels, ordered from highest to lowest altitude
//     const pressureLevels = [500, 550, 650, 675, 700, 725, 750, 775, 800, 825, 850, "surface_80m", "surface_10m"];

//     // Map each pressure level and surface data to its wind speed and direction arrays
//     const windAloftRows = [
//       ...pressureLevels.map(hPa => ({
//         speed: hPa,
//         dir: hPa
//       }))
//     ];

//     // Define column 1 labels for pressure levels, surface, and time
//     const labels = [
//       ...pressureLevels.map((hPa, index) => ({
//         label: `data.short_forecast.hourly_forecast[index].locations.KSLC.${hPa}.altitude_ft`,
//         sub: `${hPa} hPa`
//       })),
//       { label: "80m", sub: "Surface  80m" },
//       { label: "10m", sub: "Surface  10m" },
//       { label: "", sub: "" } // Final row displays forecast times
//     ];

//     // Build grid row by row
//     labels.forEach((row, rowIndex) => {
//       const rowEl = document.createElement("div");
//       rowEl.className = "wind-aloft-row";

//       // Each row has one label column followed by six hourly columns
//       for (let col = 0; col < 7; col++) {
//         const cell = document.createElement("div");
//         cell.className = "display-5 wind-aloft-cell";

//         // First column: altitude and pressure-level labels
//         if (col === 0) {
//           cell.innerHTML = `
//               <div>${row.label}</div>
//               <div class="display-6 fw-semibold fs-2 text-secondary">${row.sub}</div>`;
//         }

//         // Remaining columns: wind speed, direction, and barb
//         else if (rowIndex < pressureLevels.length) {
//           const hourIndex = startIndex + (col - 1);
//           const rowConfig = windAloftRows[rowIndex];
//           const speed = data.short_forecast.hourly_forecast[hourIndex].locations.KSLC[rowConfig].speed_mph;
//           const direction = `data.short_forecast.hourly_forecast${[hourIndex]}.locations.KSLC.${rowConfig}.direction_deg`;
//           const altitude = Math.round(Number(row.label.replace(/,/, "")) / 1000);

//           populateWindCell(cell, speed, direction, altitude);
//         }

//         // Final row: display forecast time/hour
//         else { cell.textContent = formatTime(data.short_forecast.hourly_forecast[startIndex + (col - 1)]); }

//         rowEl.appendChild(cell);
//       }

//       container.appendChild(rowEl);
//     });

//     // Populate an individual wind cell with speed, barb, direction, and color
//     function populateWindCell(cell, speed, direction, altitude) {
//       const speedEl = document.createElement("div");
//       speedEl.className = "fs-1 fw-semibold text-white wind-aloft-forecast-speed";
//       speedEl.textContent = Math.round(speed);

//       // Select the appropriate wind barb image
//       const barb = speed < 0.5 ? "calm" : Math.min(50, Math.floor(speed / 5) * 5);

//       const img = document.createElement("img");
//       img.src = `prod/images/barbs/barb${barb}.png`;
//       img.className = "wind-aloft-forecast-barb";
//       img.alt = Math.round(speed);
//       img.style.transform = `rotate(${direction}deg)`;

//       // Add speed and barb, then color the cell based on wind speed and altitude
//       cell.append(speedEl, img);
//       cell.style.backgroundColor = windSpeedColor(Math.round(speed), altitude);
//     }
//   }
// }