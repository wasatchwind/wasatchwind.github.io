"use strict";

function processSounding(data, hiTemp) {
  if (now.getHours() < 7) return;
  liftParams = getLiftParams(data, hiTemp);

  const negative3 = liftParams.negative3 ? Math.round(liftParams.negative3 * ftPerMeter).toLocaleString() : "--";
  const topOfLift = liftParams.topOfLift > surfaceAltMeters ? Math.round(liftParams.topOfLift * ftPerMeter).toLocaleString() : "--";

  document.getElementById("negative3").textContent = negative3;
  document.getElementById("top-of-lift").textContent = topOfLift;

  buildSoundingChart(data, hiTemp, liftParams);
}

function getLiftParams(data, temp, index = 0) {
  const params = { negative3: null, negative3Temp: null, topOfLift: null, topOfLiftTemp: null };
  const tempC = (temp - 32) * 5 / 9;
  const dalrSlope = -101.6;
  const dalrYIntercept = surfaceAltMeters - dalrSlope * tempC;

  let foundNegative3 = false, foundTopOfLift = false;

  // Helper function for when interpolation between data points is necessary
  function interpolate(x1, y1, x2, y2) {
    const slope = (y1 - y2) / (x1 - x2);
    const yIntercept = y1 - slope * x1;
    return { slope, yIntercept };
  }

  // Loop through all data until the thermal indices found (or null) for -3 (negative3) and 0 (topOfLift)
  while (index < data.length && (!foundNegative3 || !foundTopOfLift)) {
    const { Temp_c, Altitude_m } = data[index];
    const thermalIndex = Temp_c - ((Altitude_m - dalrYIntercept) / dalrSlope);

    try {
      // Find thermal index = -3 (negative3); skip ahead if found
      if (!foundNegative3 && thermalIndex >= -3) {
        if (index === 0) {
          params.negative3 = null;
          params.negative3Temp = null;
        } else {
          const { Temp_c: t1, Altitude_m: a1 } = data[index];
          const { Temp_c: t2, Altitude_m: a2 } = data[index - 1];

          if (t1 !== t2) { // Need to interpolate
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
        const { Temp_c: t1, Altitude_m: a1 } = data[index];
        const { Temp_c: t2, Altitude_m: a2 } = data[index - 1];

        if (t1 !== t2) { // Need to interpolate
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



//////////////////////////////////////////
// Build Morning Sounding Profile Chart //
//////////////////////////////////////////
function buildSoundingChart(data, hiTemp, liftParams) {

  // Set vertical x axis gridlines
  const xAxisGrid = d3.axisTop(x).tickSize(0 - y(4)).ticks(23);
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
    .y(d => y(d.Altitude_m * ftPerMeter / 1000));
  svg.append("path").datum(data)
    .attr("d", tempLine)
    .attr("fill", "none")
    .attr("stroke", "var(--bs-orange)")
    .attr("stroke-width", 4);

  // Plot Dewpoint line
  const dewpointLine = d3.line()
    .x(d => x((d.Dewpoint_c * 9 / 5) + 32))
    .y(d => y(d.Altitude_m * ftPerMeter / 1000));
  svg.append("path").datum(data)
    .attr("d", dewpointLine)
    .attr("fill", "none")
    .attr("stroke", "var(--bs-teal)")
    .attr("stroke-width", 3);

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
    .call(d3.axisLeft(y).tickFormat(d => `${d}k`));

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
  svg.append("text")
    .attr("class", "dewpoint")
    .attr("text-anchor", "end")
    .attr("x", x(113))
    .attr("y", y(11.5))
    .text("Dewpoint");
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
    .text("DALR");

  ////////////////////////
  // Wind Barbs Section //
  ////////////////////////
  const barbAltitudes = y.ticks(16);       // Ensure a barb for each y tick altitude (every 1,000 ft) e.g. [5, 6, ..., 20]
  const barbAnchorX = x(-20);              // Barb x coordinate positioning left of the y axis
  const staffLength = 30;                  // Barb staff length (px)
  const tineSpacing = 8;                   // Spacing between tines along staff (px)
  const tineLength = 15;                   // Length of a full tine (px)

  // Helper function to find the nearest sounding level data for each barb altitude
  function dataAtBarbAltitudes(barbAltitude) {
    return data.reduce((best, current) => {
      const currentAlt = (current.Altitude_m * ftPerMeter) / 1000;
      const bestAlt = (best.Altitude_m * ftPerMeter) / 1000;
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
          .attr("points", `${p1x},${p1y} ${p2x},${p2y} ${p3x},${p3y}`)
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
  }); // End of Wind Barbs Section

  drawDALRParams(hiTemp, liftParams);
}



/////////////////////////////////
// Draw User Update Components //
/////////////////////////////////
function drawDALRParams(temp, params) { // Dynamic elements based on user temp input
  const dalr = 5.4;
  const negative3TempF = celsiusToF(params.negative3Temp);
  const topOfLiftTempF = celsiusToF(params.topOfLiftTemp);
  const negative3AltFt = params.negative3 * ftPerMeter / 1000;
  const topOfLiftAltFt = params.topOfLift * ftPerMeter / 1000;

  // Legend label top of lift
  svg.append("text")
    .attr("class", "white")
    .attr("text-anchor", "end")
    .attr("x", x(113))
    .attr("y", y(19))
    .text(`Top of Lift: ${params.topOfLift < surfaceAltMeters ? "--" : Math.round(params.topOfLift * ftPerMeter).toLocaleString()}`);

  // Legend label -3 index
  svg.append("text")
    .attr("class", "white")
    .attr("text-anchor", "end")
    .attr("x", x(113))
    .attr("y", y(17))
    .text(`-3 Index: ${!params.negative3 ? "--" : Math.round(params.negative3 * ftPerMeter).toLocaleString()}`);

  // Legend label max temp
  svg.append("text")
    .attr("class", "white")
    .attr("text-anchor", "end")
    .attr("x", x(113))
    .attr("y", y(15))
    .text(`@ ${temp}°`);

  // Max temp DALR line
  svg.append("g").append("line")
    .attr("class", "dalrline")
    .attr("stroke", "var(--bs-info)")
    .attr("stroke-width", 3)
    .attr("x1", function () {
      if (x(temp - (maxAlt - surfaceAlt) * dalr) > x(-10)) return x(temp - (maxAlt - surfaceAlt) * dalr)
      else return x(-10)
    })
    .attr("x2", x(temp))
    .attr("y1", function () {
      if (x(temp - (maxAlt - surfaceAlt) * dalr) < x(-10)) return y(-1 / dalr * (-10 - temp) + surfaceAlt)
    })
    .attr("y2", y(surfaceAlt));

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

  if (params.topOfLift > surfaceAltMeters) {
    // Top of lift point
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