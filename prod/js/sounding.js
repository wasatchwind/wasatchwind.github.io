"use strict";

//////////////////////////////////////////////////////////////////////
// Process 2 charts: KSLC Radiosonde and NWS Soaring Guidance (SRG) //
//////////////////////////////////////////////////////////////////////
function processSounding(soaringText, kslcSoundingData, hiTemp, srgNegative3, srgTopOfLift) {

  ////////////////////////////////
  // Process SRG sounding chart //
  ////////////////////////////////

  const getAdjustedTempF = (altitude) => celsiusToF(altitude.Temp_c - altitude.Thermal_Index); // Convert SRG lapse temps Celsius to Fahrenheit

  const srgSoundingData = getSrgSoundingData(soaringText);
  const tempF5k = getAdjustedTempF(srgSoundingData.find(d => d.Altitude_ft === 5000)); // Bottom of chart lapse point
  const tempF20k = getAdjustedTempF(srgSoundingData.find(d => d.Altitude_ft === 20000)); // Top of chart lapse point
  const srgLapse = Math.round(((tempF20k - tempF5k) / 15) * 100) / 100; // Calculate SRG lapse °F/1k' (x2-x1)/(y2-y1) and round to hundredths
  const srgLiftParams = getSrgLiftParams(srgSoundingData, srgNegative3, srgTopOfLift);

  document.getElementById("negative3").textContent = srgNegative3.toLocaleString(); // Marquee -3 Index
  document.getElementById("top-of-lift").textContent = srgTopOfLift.toLocaleString(); // Marquee Top of Lift
  document.getElementById("model-lapse").textContent = `Model Lapse Rate ${srgLapse}° F / 1,000 ft`; // SRG sounding footer

  buildSoundingChart("#srg-sounding-chart", srgSoundingData, hiTemp, srgLiftParams);

  ////////////////////////////////////////////
  // Process KSLC radiosonde sounding chart //
  ////////////////////////////////////////////

  // Process KSLC Radiosonde sounding chart if data datestamp (format yyyy-mm-dd) matches today
  const formattedDate = new Date().toLocaleDateString("fr-CA", { year: "numeric", month: "2-digit", day: "2-digit" }); // fr-CA format yyyy-mm-dd
  if (kslcSoundingData["date"] !== formattedDate) return;

  // Build DOM for KSLC sounding chart
  document.getElementById("kslc-sounding").innerHTML = `
    <div class="mb-4">
      <div class="display-3 text-info">KSLC Radiosonde ${new Date().toLocaleString("en-US", { month: "short", day: "numeric" })}</div>
      <div class="fs-1 text-info">Typically avaialable sometime after 12pm daily</div>
      <div class="bg-dark border rounded-4">
        <a href="https://weather.rap.ucar.edu/upper/displayUpper.php?img=KSLC.png&endDate=-1&endTime=-1&duration=0" target="_blank">
          <div class="w-100" id="kslc-sounding-chart"></div>
          <div class="display-6 fw-semibold mb-4 text-info">DALR: Dry Adiabatic Lapse Rate -5.4° F / 1,000 ft</div>
        </a>
        <div class="border-top border-2 display-4 my-4">Visualize Other Thermal Temps:</div>
        <div class="collapse display-6 fw-semibold text-danger" id="out-of-range"></div>
        <div class="d-flex display-3 fw-semibold justify-content-around py-3 text-warning border-bottom">
          <div class="clickable" id="d3-clear">Reset</div>
          <input class="bg-dark border border-2 border-warning rounded-4 text-center text-warning" type="number" min="0" max="109" placeholder="&deg; F" id="user-temp">
          <div class="clickable" id="d3-update">Enter</div>
      </div>
    </div>`;

  kslcSoundingData = kslcSoundingData["observations"].slice(1); // Remove first element (date) to leave only observations

  const surfaceAltFt = 4229;
  const kslcSoundingLiftParams = getKslcSoundingLiftParams(kslcSoundingData, hiTemp);
  const negative3 = kslcSoundingLiftParams.negative3 ? Math.round(kslcSoundingLiftParams.negative3).toLocaleString() : "Ø";
  const topOfLift = kslcSoundingLiftParams.topOfLift > surfaceAltFt ? Math.round(kslcSoundingLiftParams.topOfLift).toLocaleString() : "Ø";

  // KSLC sounding overwrites SRG sounding Marquee data for -3 Index and Top of Lift
  document.getElementById("negative3").textContent = negative3;
  document.getElementById("top-of-lift").textContent = topOfLift;

  // "chart" stores returned functions that allow KSLC sounding chart updates and reset from user input
  const chart = buildSoundingChart("#kslc-sounding-chart", kslcSoundingData, hiTemp, kslcSoundingLiftParams);

  // Listeners for KSLC sounding chart user input
  document.getElementById("d3-clear").addEventListener("click", () => { chart.reset() });
  document.getElementById("d3-update").addEventListener("click", () => { chart.update(Number(document.getElementById("user-temp").value)) });
}

// Function to convert Celsius to Fahrenheit
function celsiusToF(temp) { return (temp * 9 / 5) + 32 }

//////////////////////////////////////////////////////////////////////////////////
// SRG functions to get sounding data and lift params before building the chart //
//////////////////////////////////////////////////////////////////////////////////
function getSrgSoundingData(text) { // Extracts SRG model forecast table via RegEx to formatted sounding data
  const table = text.match(/Height\s+Temperature\s+Wind[\s\S]*?-{5,}([\s\S]*?)\n\s*\n/);
  const rows = table[1].split("\n").map(line => line.trim()).filter(line => /^\d{4,5}\s/.test(line));
  const nwsData = rows.map(line => {
    const parts = line.split(/\s+/);
    return {
      Altitude_ft: Number(parts[0]),
      Thermal_Index: Number(parts[10]),
      Temp_c: Number(parts[1]),
      Wind_Direction: Number(parts[3]),
      Wind_Speed_kt: Number(parts[4])
    }
  });
  // Reverse the data order so that lowest altitude is first since SRG chart lists altitude in descending order
  return nwsData.sort((a, b) => a.Altitude_ft - b.Altitude_ft);
}

function getSrgLiftParams(data, srgNegative3, srgTopOfLift) {
  const tempAtNeg3 = getTempAtAltitude(data, srgNegative3) + 3; // Find where the temp difference is 3° C
  const tempAtTopOfLift = getTempAtAltitude(data, srgTopOfLift); // Find where the temp difference is 0° C

  function getTempAtAltitude(data, targetAlt) {
    for (let i = 0; i < data.length - 1; i++) {
      const a = data[i];
      const b = data[i + 1];
      const tempFound = targetAlt >= a.Altitude_ft && targetAlt <= b.Altitude_ft;
      if (tempFound) return a.Temp_c + ((targetAlt - a.Altitude_ft) * (b.Temp_c - a.Temp_c)) / (b.Altitude_ft - a.Altitude_ft);
    }
  }
  return { negative3: srgNegative3, negative3Temp: tempAtNeg3, topOfLift: srgTopOfLift, topOfLiftTemp: tempAtTopOfLift }
}

//////////////////////////////////////////////////////////////////////////////////////////////////////////
// Get KSLC sounding chart lift params before building the chart - Also used for user input lift params //
//////////////////////////////////////////////////////////////////////////////////////////////////////////
function getKslcSoundingLiftParams(data, tempF) {
  let index = 0, foundNegative3 = false, foundTopOfLift = false;
  const surfaceAltFt = 4229;
  const tempC = (tempF - 32) * 5 / 9; // Convert input tempF to °C since source data is °C and Thermal Index is °C
  const params = { negative3: null, negative3Temp: null, topOfLift: null, topOfLiftTemp: null };
  const lapseDegC = -3 // 3 °C / 1,000 ft === -5.4 °F / 1,000 ft
  const dalrSlope = 1000 / lapseDegC; // Slope = (y2 - y1)/(x2 - x1) e.g. (6000-5000)/(0-3) = -333.333 using ft & °C
  const dalrYIntercept = surfaceAltFt - dalrSlope * tempC; // y=mx+b => b=y-mx

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

//////////////////////////////////////////////////////////////////////////////////
// Build Sounding Chart - used twice: once for SRG and once for KSLC radiosonde //
//////////////////////////////////////////////////////////////////////////////////
function buildSoundingChart(id, data, hiTemp, liftParams) {

  // Set up chart x/y grid and SVG
  const isKslcSounding = data.length > 14 ? true : false; // SRG data always has length 14
  const dalrDegF = 5.4;
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
  const surfaceAlt = isKslcSounding ? 4.229 : 5; // Formatted for chart grid KSLC bottom: 4,229 ft., SRG bottom: 5,000 ft.
  const surfaceAltMeters = Math.round(surfaceAlt * 1000 / ftPerMeter);
  const maxAlt = 20;
  const xMin = -10;
  const xMax = 110;
  const x = d3.scaleLinear().range([0, width - margin.left - margin.right - windBarbs]).domain([xMin, xMax]);
  const y = d3.scaleLinear().range([height, 0]).domain([surfaceAlt, maxAlt]);
  const svg = d3.select(id) // Either #srg-sounding-chart or #kslc-sounding-chart
    .append("svg")
    .attr("fill", "#212529")
    .attr("width", width)
    .attr("height", proportionalHeight)
    .append("g")
    .attr("transform", `translate(${margin.left + windBarbs}, ${margin.top})`);

  // Format lift params to °F and chart grid (4.229 for altitude 4,229)
  const negative3TempF = celsiusToF(liftParams.negative3Temp);
  const topOfLiftTempF = celsiusToF(liftParams.topOfLiftTemp);
  const negative3AltFt = liftParams.negative3 / 1000;
  const topOfLiftAltFt = liftParams.topOfLift / 1000;

  // Variables required for updating and resetting the KSLC chart w/ user temp input
  let currentTemp = hiTemp;
  const initialTemp = hiTemp;
  const userInputChartElements = {
    dalrLine: svg.append("g").append("line").attr("class", "dalrline").attr("stroke", "var(--bs-info)").attr("stroke-width", 3),
    neg3Line: svg.append("g").append("line").attr("class", "neg3line").attr("stroke", "white").attr("stroke-width", 3),
    neg3Label: svg.append("g").append("text").attr("fill", "white").attr("font-size", "200%").text("-3"),
    tolCircle: svg.append("g").append("circle").attr("class", "tolcircle").attr("fill", "white").attr("r", 6),
    tolLabel: svg.append("g").append("text").attr("fill", "white").attr("font-size", "200%").text("ToL"),
  }

  ///////////////////////////////////////////////////
  // Draw primary components of the sounding chart //
  ///////////////////////////////////////////////////

  // Set vertical x axis gridlines & ticks
  const [min, max] = x.domain();
  const xAxisGrid = d3.axisTop(x)
    .tickFormat("")
    .ticks(10) // Tick labels every 10
    .tickSizeInner(-y(surfaceAlt))
    .tickSizeOuter(0)
    .tickValues(d3.range(Math.ceil(min / 5) * 5, max + 5, 5)); // Grid lines step every 5

  svg.append("g")
    .call(xAxisGrid)
    .selectAll("line")
    .attr("stroke", "lightgray")
    .attr("stroke-opacity", 0.5);

  // Set horizontal y axis gridlines & ticks
  const yAxisGrid = d3.axisLeft(y)
    .tickSize(0 - x(xMax))
    .ticks(15);

  svg.append("g")
    .call(yAxisGrid)
    .selectAll("line")
    .attr("stroke", "lightgray")
    .attr("stroke-opacity", 0.5);

  // Plot air temp line
  const tempLine = d3.line()
    .x(d => x(celsiusToF(d.Temp_c)))
    .y(d => y(d.Altitude_ft / 1000));

  svg.append("path").datum(data)
    .attr("d", tempLine)
    .attr("fill", "none")
    .attr("stroke", "var(--bs-orange)")
    .attr("stroke-width", 4);

  // Plot dewpoint line and DALR line if KSLC sounding; otherwise only plot SRG lapse line
  if (isKslcSounding) {
    const dewpointLine = d3.line()
      .x(d => x(celsiusToF(d.Dewpoint_c)))
      .y(d => y(d.Altitude_ft / 1000));

    svg.append("path").datum(data)
      .attr("d", dewpointLine)
      .attr("fill", "none")
      .attr("stroke", "var(--bs-teal)")
      .attr("stroke-width", 3);

    userInputChartElements.dalrLine
      .attr("x1", function () { if (x(hiTemp - (maxAlt - surfaceAlt) * dalrDegF) > x(xMin)) return x(hiTemp - (maxAlt - surfaceAlt) * dalrDegF) })
      .attr("x2", x(hiTemp))
      .attr("y1", function () { if (x(hiTemp - (maxAlt - surfaceAlt) * dalrDegF) < x(xMin)) return y(-1 / dalrDegF * (xMin - hiTemp) + surfaceAlt) })
      .attr("y2", y(surfaceAlt));
  } else {
    const srgLapseLine = d3.line()
      .x(d => x(celsiusToF(d.Temp_c - d.Thermal_Index)))
      .y(d => y(d.Altitude_ft / 1000));

    svg.append("path").datum(data)
      .attr("d", srgLapseLine)
      .attr("fill", "none")
      .attr("stroke", "var(--bs-info)")
      .attr("stroke-width", 3);
  }

  // Draw blank rectangle to cover any lines that extend left of chart
  svg.append("g").append("rect")
    .attr("height", y(2))
    .attr("width", x(15))
    .attr("x", x(-35))
    .attr("y", y(22));

  // Draw blank polygon to cover area above and right of chart grid
  const p1 = `M ${x(xMin)} ${0 - margin.top}, `; // Top left start point M
  const p2 = `L ${width} ${0 - margin.top}, `; // Top right corner
  const p3 = `L ${width} ${y(surfaceAlt)}, `; // Bottom right corner
  const p4 = `L ${x(xMax)} ${y(surfaceAlt)}, `; // Bottom right edge of grid
  const p5 = `L ${x(25)} 0`; // Top right edge of grid
  const p6 = `L ${x(xMin)} 0`; // Top left edge of grid
  const p7 = `L ${x(xMin)} ${0 - margin.top}`; // Back to start point
  const polygon = p1 + p2 + p3 + p4 + p5 + p6 + p7;
  svg.append("path").attr("d", polygon);

  // Draw x axis
  svg.append("g")
    .call(d3.axisBottom(x).tickFormat(d => `${d}°`))
    .attr("transform", `translate(0, ${height})`)
    .style("font-size", "200%");

  // Draw y axis
  svg.append("g")
    .call(d3.axisLeft(y).tickFormat(d => `${d} k`))
    .attr("class", "yAxis")
    .style("font-size", "200%");

  // Draw slanted border line on right side of grid
  svg.append("g").append("line")
    .attr("stroke", "lightgray")
    .attr("x1", x(xMax))
    .attr("y1", y(surfaceAlt))
    .attr("x2", x(25))
    .attr("y2", y(maxAlt));

  /////////////////////////////////////////////////////
  // Draw legend labels in upper right area of chart //
  /////////////////////////////////////////////////////

  const tolLegend = svg.append("text") // Top of Lift
    .attr("class", "legend-label-upper")
    .attr("text-anchor", "end")
    .attr("x", x(113))
    .attr("y", y(19))
    .text(`Top of Lift: ${liftParams.topOfLift < surfaceAltMeters ? "Ø" : Math.round(liftParams.topOfLift).toLocaleString()} `);

  const neg3Legend = svg.append("text") // -3 Index
    .attr("class", "legend-label-upper")
    .attr("text-anchor", "end")
    .attr("x", x(113))
    .attr("y", y(17))
    .text(`- 3 Index: ${!liftParams.negative3 || liftParams.negative3 === "None" ? "Ø" : Math.round(liftParams.negative3).toLocaleString()} `);

  const hiTempLegend = svg.append("text") // Max surface air temp
    .attr("class", "legend-label-upper")
    .attr("text-anchor", "end")
    .attr("x", x(113))
    .attr("y", y(15))
    .text(`@${hiTemp}°`);

  /////////////////////////////////////////////////////
  // Draw legend labels in lower right area of chart //
  /////////////////////////////////////////////////////

  if (isKslcSounding) { // Only KSLC has Dewpoint & DALR line (DALR line can change with user input)
    svg.append("text")
      .attr("class", "legend-label-lower")
      .attr("text-anchor", "end")
      .attr("x", x(113))
      .attr("y", y(11.5))
      .style("fill", "var(--bs-teal)")
      .text("Dewpoint");
  }

  svg.append("text") // Air Temp label
    .attr("class", "legend-label-lower")
    .attr("text-anchor", "end")
    .attr("x", x(113))
    .attr("y", y(10.25))
    .style("fill", "var(--bs-orange)")
    .text("Air Temp");

  svg.append("text") // DALR (KSLC) or Lapse (SRG)
    .attr("class", "legend-label-lower")
    .attr("text-anchor", "end")
    .attr("x", x(113))
    .attr("y", y(9))
    .style("fill", "var(--bs-info)")
    .text(isKslcSounding ? "DALR" : "Lapse");

  /////////////////////////////////////////////////
  // Draw -3 Index and Top of Lift (ToL) markers //
  /////////////////////////////////////////////////

  const markerShift = { "x": 2, "y": 0.3}
  if (negative3TempF > x(xMin)) { // Only draw -3 Index marker if it's on the chart
    userInputChartElements.neg3Line.style("display", null)
      .attr("x1", x(negative3TempF))
      .attr("y1", y(negative3AltFt))
      .attr("x2", x(negative3TempF - dalrDegF))
      .attr("y2", y(negative3AltFt));

    userInputChartElements.neg3Label.style("display", null)
      .attr("x", x(negative3TempF + markerShift.x))
      .attr("y", y(negative3AltFt - markerShift.y));
  }

  if (liftParams.topOfLift > surfaceAltMeters && topOfLiftTempF > x(xMin)) { // Only draw ToL marker if it's on the chart
    userInputChartElements.tolCircle.style("display", null)
      .attr("cx", x(topOfLiftTempF))
      .attr("cy", y(topOfLiftAltFt));

    userInputChartElements.tolLabel.style("display", null) // Top of lift label
      .attr("x", x(topOfLiftTempF + markerShift.x))
      .attr("y", y(topOfLiftAltFt - markerShift.y));
  }

  drawWindBarbs(data, svg, x, y); // Draw wind barbs left of the chart

  return { // Stores details in "chart" to enable user input and reset without global variables
    update(newTemp) {
      currentTemp = newTemp;
      document.getElementById("user-temp").value = null;
      document.getElementById("out-of-range").style.display = "none";
      drawUserInput(currentTemp);
    },
    reset() {
      currentTemp = initialTemp;
      document.getElementById("user-temp").value = null;
      document.getElementById("out-of-range").style.display = "none";
      drawUserInput(currentTemp);
    }
  };

  ////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
  // Helper function to update/reset chart with user temp input. 5 elements: dalrLine, neg3Line, neg3Label, tolCircle, tolLabel //
  ////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

  function drawUserInput(temp) {
    const liftParams = getKslcSoundingLiftParams(data, temp);
    if (!liftParams.topOfLift && !liftParams.negative3) {
      document.getElementById("out-of-range").textContent = `${temp}° out of range`;
      document.getElementById("out-of-range").style.display = "block";
      document.getElementById("user-temp").value = null;
      return;
    }

    const negative3TempF = celsiusToF(liftParams.negative3Temp);
    const topOfLiftTempF = celsiusToF(liftParams.topOfLiftTemp);
    const negative3AltFt = liftParams.negative3 / 1000;
    const topOfLiftAltFt = liftParams.topOfLift / 1000;

    userInputChartElements.dalrLine
      .attr("x1", function () { if (x(temp - (maxAlt - surfaceAlt) * dalrDegF) > x(xMin)) return x(temp - (maxAlt - surfaceAlt) * dalrDegF) })
      .attr("x2", x(temp))
      .attr("y1", function () { if (x(temp - (maxAlt - surfaceAlt) * dalrDegF) < x(xMin)) return y(-1 / dalrDegF * (xMin - temp) + surfaceAlt) })
      .attr("y2", y(surfaceAlt));

    userInputChartElements.tolCircle
      .attr("cx", x(topOfLiftTempF))
      .attr("cy", y(topOfLiftAltFt));

    userInputChartElements.tolLabel
      .attr("x", x(topOfLiftTempF + markerShift.x))
      .attr("y", y(topOfLiftAltFt - markerShift.y));

    userInputChartElements.neg3Line
      .attr("x1", x(negative3TempF))
      .attr("y1", y(negative3AltFt))
      .attr("x2", x(negative3TempF - dalrDegF))
      .attr("y2", y(negative3AltFt));

    userInputChartElements.neg3Label
      .attr("x", x(negative3TempF + markerShift.x))
      .attr("y", y(negative3AltFt - markerShift.y));

    tolLegend.text(`Top of Lift: ${liftParams.topOfLift < surfaceAltMeters ? "Ø" : Math.round(liftParams.topOfLift).toLocaleString()} `);
    neg3Legend.text(`- 3 Index: ${!liftParams.negative3 || liftParams.negative3 === "None" ? "Ø" : Math.round(liftParams.negative3).toLocaleString()} `);
    hiTempLegend.text(`@${temp}°`);
  }
} // End of buildSoundingChart() function

////////////////////////////////////////////////
// Draw wind barbs left of the sounding chart //
////////////////////////////////////////////////
function drawWindBarbs(data, svg, x, y) {
  const barbAltitudes = y.ticks(16);       // Ensure a barb for each y tick altitude (every 1,000 ft) e.g. [5, 6, ..., 20]
  const barbAnchorX = x(-20);              // Barb x coordinate positioning left of the y axis
  const staffLength = 30;                  // Barb staff length (px)
  const tineSpacing = 8;                   // Spacing between tines along staff (px)
  const tineLength = 15;                   // Length of a full tine (px)

  // Helper function to find the nearest sounding level data for each barb altitude
  function dataAtBarbAltitudes(barbAltitude) {
    return data.reduce((best, current) => {
      const currentAlt = current.Altitude_ft / 1000;
      const bestAlt = best.Altitude_ft / 1000;
      return (Math.abs(currentAlt - barbAltitude) < Math.abs(bestAlt - barbAltitude)) ? current : best;
    });
  }

  // Draw a circle for barb anchor (no barb for calm wind)
  function drawAnchorCircle(cx, cy) {
    svg.append("circle")
      .attr("cx", cx)
      .attr("cy", cy)
      .attr("r", 5)
      .attr("fill", "white");
  }

  function drawBarbStaff(anchorX, anchorY, tipX, tipY) {
    svg.append("line")
      .attr("x1", anchorX)
      .attr("y1", anchorY)
      .attr("x2", tipX)
      .attr("y2", tipY)
      .attr("stroke", "white")
      .attr("stroke-width", 5);
  }

  // Draw barbs at each 1,000' altitude tick
  barbAltitudes.forEach(barbAltitude => {
    const dataAtBarbAltitude = dataAtBarbAltitudes(barbAltitude);
    const windDir = dataAtBarbAltitude.Wind_Direction;
    const windSpd = dataAtBarbAltitude.Wind_Speed_kt;
    const yPos = y(barbAltitude);

    drawAnchorCircle(barbAnchorX, yPos);
    if (windSpd < 1) return; // Only draw circle for calm (no staff)
    let barbSpeed = Math.round(windSpd / 5) * 5; // Convert speed to nearest 5 knots

    // Staff unit vector (u) points in the wind direction
    const rad = (windDir % 360) * Math.PI / 180;
    const staffX = Math.sin(rad);
    const staffY = -Math.cos(rad); // D3 SVG y axis is downward
    const tineX = Math.cos(rad);
    const tineY = Math.sin(rad);
    const tipX = barbAnchorX + staffLength * staffX;
    const tipY = yPos + staffLength * staffY;

    drawBarbStaff(barbAnchorX, yPos, tipX, tipY);

    // Create tines sequence array outer to inner
    const tines = [];
    if (barbSpeed >= 45) {
      tines.push("pennant");
      barbSpeed = 0;
    }
    while (barbSpeed >= 10) {
      tines.push("full");
      barbSpeed -= 10;
    }
    if (barbSpeed >= 5) tines.push("half");

    // Draw tines starting at the tip and moving back along the staff
    let offset = 0; // px along the staff from the tip inward
    tines.forEach(tine => {
      // Position on staff where a tine is attached
      const posX = tipX - offset * staffX;
      const posY = tipY - offset * staffY;

      if (tine === "pennant") {
        // p1: base on staff, p2: length, p3: width
        const width = 15;
        const p1x = posX;
        const p1y = posY;
        const p2x = posX + tineLength * tineX;
        const p2y = posY + tineLength * tineY;
        const p3x = tipX - width * staffX;
        const p3y = tipY - width * staffY;

        svg.append("polygon")
          .attr("points", `${p1x},${p1y} ${p2x},${p2y} ${p3x},${p3y} `)
          .attr("fill", "red");

      } else {
        const lengthModifier = tine === "half" ? 0.7 : 1;
        const endX = posX + tineLength * lengthModifier * tineX;
        const endY = posY + tineLength * lengthModifier * tineY;
        svg.append("line")
          .attr("x1", posX)
          .attr("y1", posY)
          .attr("x2", endX)
          .attr("y2", endY)
          .attr("stroke", "white")
          .attr("stroke-width", 5);
      }

      offset += tineSpacing;
    });
  });
}
