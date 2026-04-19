"use strict";

function processSounding(soundingData, hiTemp) {
  document.getElementById("sounding").innerHTML = `
    <div class="mb-4">
      <div class="display-3 text-info">KSLC Radiosonde</div>
      <div class="fs-1 text-info">Typically avaialable sometime after noon daily</div>
      <div class="bg-dark border rounded-4">
        <a href="https://weather.rap.ucar.edu/upper/displayUpper.php?img=KSLC.png&endDate=-1&endTime=-1&duration=0" target="_blank">
          <div class="w-100" id="sounding-chart"></div>
          <div class="display-6 fw-semibold mb-4 text-info">DALR: Dry Adiabatic Lapse Rate -5.4° F / 1,000 ft</div>
        </a>
        <div class="border-top border-2 display-4 my-4 text-info">Visualize Other Thermal Temps:</div>
        <div class="collapse display-6 text-info" id="out-of-range"></div>
        <div class="d-flex display-3 fw-semibold justify-content-around py-3 text-warning border-bottom">
          <div class="clickable" id="d3-clear">Reset</div>
          <input class="bg-dark border border-2 border-warning rounded-4 text-center text-warning" type="number" min="0" max="110" placeholder="&deg; F" id="user-temp">
          <div class="clickable" id="d3-update">Enter</div>
      </div>
    </div>`;

  soundingData = soundingData["observations"].slice(1); // Slice removes the date/time element

  const soundingLiftParams = getSoundingLiftParams(soundingData, hiTemp);
  const negative3 = soundingLiftParams.negative3 ? Math.round(soundingLiftParams.negative3).toLocaleString() : "Ø";
  const topOfLift = soundingLiftParams.topOfLift > 4229 ? Math.round(soundingLiftParams.topOfLift).toLocaleString() : "Ø";

  document.getElementById("negative3").textContent = negative3;
  document.getElementById("top-of-lift").textContent = topOfLift;

  document.getElementById("d3-update").addEventListener("click", d3Update);
  document.getElementById("d3-clear").addEventListener("click", () => d3Clear()); // Function format necessary since params are expected

  buildSoundingChart("#sounding-chart", soundingData, hiTemp, soundingLiftParams);
}

function getSoundingLiftParams(data, tempF) {
  let index = 0, foundNegative3 = false, foundTopOfLift = false;
  const tempC = (tempF - 32) * 5 / 9; // Source data is Deg C and Thermal Index measured in Deg C
  const params = { negative3: null, negative3Temp: null, topOfLift: null, topOfLiftTemp: null };
  const lapseDegC = -3 // Per 1000 ft
  const dalrSlope = 1000 / lapseDegC; // Slope = (y2 - y1)/(x2 - x1) e.g. (6000-5000)/(0-3) = -333.333 using ft & deg C
  const dalrYIntercept = 4229 - dalrSlope * tempC; // y=mx+b => b=y-mx

  // Helper function for when interpolation between data points is necessary
  function interpolate(x1, y1, x2, y2) {
    const slope = (y1 - y2) / (x1 - x2);
    const yIntercept = y1 - slope * x1; // y=mx+b => b=y-mx
    return { slope, yIntercept };
  }

  // Loop through all data until the thermal indices found (or null) for -3 (negative3) and 0 (topOfLift)
  while (index < data.length && (!foundNegative3 || !foundTopOfLift)) {
    const { Altitude_ft, Temp_c } = data[index];
    const dalrTempC = (Altitude_ft - dalrYIntercept) / dalrSlope // y=mx+b => x=(y-b)/m
    const thermalIndex = Temp_c - dalrTempC;

    try {
      // Find thermal index = -3 (negative3); skip ahead if found
      if (!foundNegative3 && thermalIndex >= -3) {
        if (index === 0) {
          params.negative3 = null;
          params.negative3Temp = null;
        } else {
          const { Temp_c: t1, Altitude_ft: a1 } = data[index];
          const { Temp_c: t2, Altitude_ft: a2 } = data[index - 1];

          if (t1 !== t2) { // Interpolatation required
            const { slope, yIntercept } = interpolate(t1, a1, t2, a2);
            const targetX = (yIntercept - dalrYIntercept - (3 * dalrSlope)) / (dalrSlope - slope);
            params.negative3 = a1 + (targetX - t1) * (a2 - a1) / (t2 - t1);
            params.negative3Temp = targetX + 3;
          } else {
            params.negative3 = (t1 + 3) * dalrSlope + dalrYIntercept;
            params.negative3Temp = (params.negative3 - dalrYIntercept) / dalrSlope;
          }
        }
        foundNegative3 = true;
      }

      // Find thermal index = 0 (topOfLift)
      if (foundNegative3 && !foundTopOfLift && thermalIndex >= 0) {
        const { Temp_c: t1, Altitude_ft: a1 } = data[index];
        const { Temp_c: t2, Altitude_ft: a2 } = data[index - 1];

        if (t1 !== t2) { // Interpolatation required
          const { slope, yIntercept } = interpolate(t1, a1, t2, a2);
          const targetX = -yIntercept / slope;
          params.topOfLift = a1 + (targetX - t1);
        } else params.topOfLift = t1 * dalrSlope + dalrYIntercept;

        params.topOfLiftTemp = (params.topOfLift - dalrYIntercept) / dalrSlope;
        foundTopOfLift = true;
      }

      index++;
    } catch { break; }
  }
  return params;
}

function buildSoundingChart(id, data, hiTemp, liftParams) {
  const kslcSounding = data.length > 14 ? true : false;
  const ftPerMeter = 3.28084;
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
  const surfaceAlt = kslcSounding ? 4.229 : 5;
  const surfaceAltMeters = Math.round(surfaceAlt * 1000 / ftPerMeter);
  const maxAlt = 20;
  const x = d3.scaleLinear().range([0, width - margin.left - margin.right - windBarbs]).domain([-10, 110]);
  const y = d3.scaleLinear().range([height, 0]).domain([surfaceAlt, maxAlt]);
  const svg = d3.select(id)
    .append("svg")
    .attr("class", "svgbg")
    .attr("width", width)
    .attr("height", proportionalHeight)
    .append("g")
    .attr("transform", `translate(${margin.left + windBarbs}, ${margin.top})`);

  // Set vertical x axis gridlines
  const xAxisGrid = d3.axisTop(x).tickSize(0 - y(surfaceAlt)).ticks(20);
  svg.append("g")
    .attr("class", "gridticks")
    .call(xAxisGrid);

  // Set horizontal y axis gridlines
  const yAxisGrid = d3.axisLeft(y).tickSize(0 - x(110)).ticks(15);
  svg.append("g")
    .attr("class", "gridticks")
    .call(yAxisGrid);

  // Draw skewed border line
  svg.append("g").append("line")
    .attr("stroke", "white")
    .attr("x1", x(110))
    .attr("y1", y(surfaceAlt))
    .attr("x2", x(25))
    .attr("y2", y(20));

  // Plot Temp line
  const tempLine = d3.line()
    .x(d => x((d.Temp_c * 9 / 5) + 32))
    .y(d => y(d.Altitude_ft / 1000));
  svg.append("path").datum(data)
    .attr("d", tempLine)
    .attr("fill", "none")
    .attr("stroke", "var(--bs-orange)")
    .attr("stroke-width", 4);

  // Plot Dewpoint line if it exists (only available in KSLC noon sounding data)
  if (kslcSounding) {
    const dewpointLine = d3.line()
      .x(d => x((d.Dewpoint_c * 9 / 5) + 32))
      .y(d => y(d.Altitude_ft / 1000));
    svg.append("path").datum(data)
      .attr("d", dewpointLine)
      .attr("fill", "none")
      .attr("stroke", "var(--bs-teal)")
      .attr("stroke-width", 3);
  } else { // Plot NWS SRG lapse line
    const dewpointLine = d3.line()
      .x(d => x(((d.Temp_c - d.Thermal_Index) * 9 / 5) + 32))
      .y(d => y(d.Altitude_ft / 1000));
    svg.append("path").datum(data)
      .attr("d", dewpointLine)
      .attr("fill", "none")
      .attr("stroke", "var(--bs-info)")
      .attr("stroke-width", 3);
  }

  // Draw blank rectangle to cover temp & dewpoint lines above chart
  svg.append("g").append("rect")
    .attr("class", "svgbg")
    .attr("height", margin.top)
    .attr("width", width)
    .attr("x", 0 - margin.left)
    .attr("y", 0 - margin.top);

  // Draw blank rectangle to cover temp & dewpoint lines above and left of chart
  svg.append("g").append("rect")
    .attr("class", "svgbg")
    .attr("height", y(2))
    .attr("width", x(15))
    .attr("x", x(-35))
    .attr("y", y(22));

  // Draw x axis
  svg.append("g")
    .attr("class", "xAxis")
    .attr("transform", `translate(0, ${height})`)
    .call(d3.axisBottom(x).tickFormat(d => `${d}°`));

  // Draw y axis
  svg.append("g")
    .attr("class", "yAxis")
    .call(d3.axisLeft(y).tickFormat(d => `${d} k`));

  // Draw blank gray polygon to cover upper right grid
  const p1 = `M ${x(25)} 0, `;
  const p2 = `L ${x(110)} ${y(surfaceAlt)}, `;
  const p3 = `L ${width + margin.right} ${y(surfaceAlt)}, `;
  const p4 = `L ${width + margin.right} 0, `;
  const p5 = `L ${x(25)} 0`;
  const polygon = p1 + p2 + p3 + p4 + p5;
  svg.append("path")
    .attr("class", "svgbg")
    .attr("d", polygon);

  // Legend labels
  if (kslcSounding) {
    svg.append("text")
      .attr("class", "dewpoint")
      .attr("text-anchor", "end")
      .attr("x", x(113))
      .attr("y", y(11.5))
      .text("Dewpoint");
  }
  svg.append("text")
    .attr("class", "temp")
    .attr("text-anchor", "end")
    .attr("x", x(113))
    .attr("y", y(10.25))
    .text("Air Temp");
  svg.append("text")
    .attr("class", "dalr")
    .attr("text-anchor", "end")
    .attr("x", x(113))
    .attr("y", y(9))
    .text(kslcSounding ? "DALR" : "Lapse");

  const dalr = 5.4;
  const negative3TempF = celsiusToF(liftParams.negative3Temp);
  const topOfLiftTempF = celsiusToF(liftParams.topOfLiftTemp);
  const negative3AltFt = liftParams.negative3 / 1000;
  const topOfLiftAltFt = liftParams.topOfLift / 1000;

  // Legend label top of lift
  svg.append("text")
    .attr("class", "white")
    .attr("text-anchor", "end")
    .attr("x", x(113))
    .attr("y", y(19))
    .text(`Top of Lift: ${liftParams.topOfLift < surfaceAltMeters ? "Ø" : Math.round(liftParams.topOfLift).toLocaleString()} `);

  // Legend label -3 index
  svg.append("text")
    .attr("class", "white")
    .attr("text-anchor", "end")
    .attr("x", x(113))
    .attr("y", y(17))
    .text(`- 3 Index: ${!liftParams.negative3 || liftParams.negative3 === "None" ? "Ø" : Math.round(liftParams.negative3).toLocaleString()} `);

  // Legend label max temp
  svg.append("text")
    .attr("class", "white")
    .attr("text-anchor", "end")
    .attr("x", x(113))
    .attr("y", y(15))
    .text(`@${hiTemp}°`);

  // Max temp DALR line
  if (kslcSounding) {
    svg.append("g").append("line")
      .attr("class", "dalrline")
      .attr("stroke", "var(--bs-info)")
      .attr("stroke-width", 3)
      .attr("x1", function () {
        if (x(hiTemp - (maxAlt - surfaceAlt) * dalr) > x(-10)) return x(hiTemp - (maxAlt - surfaceAlt) * dalr)
        else return x(-10)
      })
      .attr("x2", x(hiTemp))
      .attr("y1", function () {
        if (x(hiTemp - (maxAlt - surfaceAlt) * dalr) < x(-10)) return y(-1 / dalr * (-10 - hiTemp) + surfaceAlt)
      })
      .attr("y2", y(surfaceAlt));
  }

  if (negative3AltFt) { // Only draw -3 line/label marker if there's a -3 value
    // -3 index line
    svg.append("g").append("line")
      .attr("class", "neg3line")
      .attr("stroke", "white")
      .attr("stroke-width", 3)
      .attr("x1", x(negative3TempF))
      .attr("y1", y(negative3AltFt))
      .attr("x2", x(negative3TempF - dalr))
      .attr("y2", y(negative3AltFt));

    // -3 label
    svg.append("g").append("text")
      .attr("class", "liftlabels")
      .attr("x", x(negative3TempF + 2)) // Shift label to the right slightly
      .attr("y", y(negative3AltFt - 0.3)) // Shift label slightly lower to center vertically
      .text("-3");
  }

  if (liftParams.topOfLift > surfaceAltMeters && topOfLiftTempF > -10) {
    // Top of lift point marker
    svg.append("g").append("circle")
      .attr("class", "tolcircle")
      .attr("fill", "white")
      .attr("cx", x(topOfLiftTempF))
      .attr("cy", y(topOfLiftAltFt))
      .attr("r", 6);

    // Top of lift label
    svg.append("g").append("text")
      .attr("class", "liftlabels")
      .attr("x", x(topOfLiftTempF + 2)) // Shift label to the right slightly
      .attr("y", y(topOfLiftAltFt - 0.3)) // Shift label slightly lower to center vertically
      .text("ToL");
  }
}



/////////////////////////////////
// Draw User Update Components //
/////////////////////////////////
// function drawDALRParams(temp, params, useNwsSounding) { // Dynamic elements based on user temp input
//   const dalr = 5.4;
//   const negative3TempF = celsiusToF(params.negative3Temp);
//   const topOfLiftTempF = celsiusToF(params.topOfLiftTemp);
//   const negative3AltFt = params.negative3 / 1000;
//   const topOfLiftAltFt = params.topOfLift / 1000;

//   // Legend label top of lift
//   svg.append("text")
//     .attr("class", "white")
//     .attr("text-anchor", "end")
//     .attr("x", x(113))
//     .attr("y", y(19))
//     .text(`Top of Lift: ${params.topOfLift < surfaceAltMeters ? "Ø" : Math.round(params.topOfLift).toLocaleString()} `);

//   // Legend label -3 index
//   svg.append("text")
//     .attr("class", "white")
//     .attr("text-anchor", "end")
//     .attr("x", x(113))
//     .attr("y", y(17))
//     .text(`- 3 Index: ${!params.negative3 ? "Ø" : Math.round(params.negative3).toLocaleString()} `);

//   // Legend label max temp
//   svg.append("text")
//     .attr("class", "white")
//     .attr("text-anchor", "end")
//     .attr("x", x(113))
//     .attr("y", y(15))
//     .text(`@${temp}°`);

//   // Max temp DALR line
//   if (!useNwsSounding) {
//     svg.append("g").append("line")
//       .attr("class", "dalrline")
//       .attr("stroke", "var(--bs-info)")
//       .attr("stroke-width", 3)
//       .attr("x1", function () {
//         if (x(temp - (maxAlt - surfaceAlt) * dalr) > x(-10)) return x(temp - (maxAlt - surfaceAlt) * dalr)
//         else return x(-10)
//       })
//       .attr("x2", x(temp))
//       .attr("y1", function () {
//         if (x(temp - (maxAlt - surfaceAlt) * dalr) < x(-10)) return y(-1 / dalr * (-10 - temp) + surfaceAlt)
//       })
//       .attr("y2", y(surfaceAlt));
//   }

//   // -3 index line
//   svg.append("g").append("line")
//     .attr("class", "neg3line")
//     .attr("stroke", "white")
//     .attr("stroke-width", 3)
//     .attr("x1", x(negative3TempF))
//     .attr("y1", y(negative3AltFt))
//     .attr("x2", x(negative3TempF - dalr))
//     .attr("y2", y(negative3AltFt));

//   // -3 label
//   svg.append("g").append("text")
//     .attr("class", "liftlabels")
//     .attr("x", x(negative3TempF + 2)) // Shift label to the right slightly
//     .attr("y", y(negative3AltFt - 0.3)) // Shift label slightly lower to center vertically
//     .text("-3");

//   if (params.topOfLift > surfaceAltMeters && topOfLiftTempF > -10) {
//     // Top of lift point marker
//     svg.append("g").append("circle")
//       .attr("class", "tolcircle")
//       .attr("fill", "white")
//       .attr("cx", x(topOfLiftTempF))
//       .attr("cy", y(topOfLiftAltFt))
//       .attr("r", 6);

//     // Top of lift label
//     svg.append("g").append("text")
//       .attr("class", "liftlabels")
//       .attr("x", x(topOfLiftTempF + 2)) // Shift label to the right slightly
//       .attr("y", y(topOfLiftAltFt - 0.3)) // Shift label slightly lower to center vertically
//       .text("ToL");
//   }
// }