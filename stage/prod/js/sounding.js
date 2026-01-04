"use strict";

function processSounding(data, hiTemp) {
  if (now.getHours() >= 7) document.getElementById("sounding-div").style.display = "block";
  else return;
  liftParams = getLiftParams(data, hiTemp);
  document.getElementById("neg3").innerHTML = liftParams.neg3 ? Math.round(liftParams.neg3 * ftPerMeter).toLocaleString() : "--";
  document.getElementById("tol").innerHTML = liftParams.tol > 1289 ? Math.round(liftParams.tol * ftPerMeter).toLocaleString() : "--";

  buildSoundingChart(data, hiTemp, liftParams);
}

function getLiftParams(data, temp, position = 0) {
  const params = { neg3: null, neg3Temp: null, tol: null, tolTemp: null };
  const tempC = (temp - 32) * 5 / 9;
  const surfaceAlt_m = 1289;
  const dalrSlope = -101.6;
  const dalrYInt = surfaceAlt_m - dalrSlope * tempC;

  let foundNeg3 = false, foundTOL = false;

  function interpolate(x1, y1, x2, y2) {
    const slope = (y1 - y2) / (x1 - x2);
    const yInt = y1 - slope * x1;
    return { slope, yInt };
  }

  while (position < data.length && (!foundNeg3 || !foundTOL)) {
    const { Temp_c, Altitude_m } = data[position];
    const ti = Temp_c - ((Altitude_m - dalrYInt) / dalrSlope);

    // Find -3 thermal index altitude and temp (neg3)
    if (!foundNeg3 && ti >= -3) {
      if (position === 0) {
        params.neg3 = null;
        params.neg3Temp = null;
      } else {
        const { Temp_c: t1, Altitude_m: a1 } = data[position];
        const { Temp_c: t2, Altitude_m: a2 } = data[position - 1];

        if (t1 !== t2) {
          const { slope, yInt } = interpolate(t1, a1, t2, a2);
          const targetX = (yInt - dalrYInt - (3 * dalrSlope)) / (dalrSlope - slope);
          params.neg3 = a1 + (targetX - t1) * (a2 - a1) / (t2 - t1);
          params.neg3Temp = targetX + 3;
        } else {
          params.neg3 = (t1 + 3) * dalrSlope + dalrYInt;
          params.neg3Temp = (params.neg3 - dalrYInt) / dalrSlope;
        }
      }
      foundNeg3 = true;
    }

    // Find 0 thermal index altitude and temp (top of lift)
    if (foundNeg3 && !foundTOL && ti >= 0) {
      const { Temp_c: t1, Altitude_m: a1 } = data[position];
      const { Temp_c: t2, Altitude_m: a2 } = data[position - 1];

      if (t1 !== t2) {
        const { slope, yInt } = interpolate(t1, a1, t2, a2);
        const targetX = -yInt / slope;
        params.tol = a1 + (targetX - t1);
      } else params.tol = t1 * dalrSlope + dalrYInt;

      params.tolTemp = (params.tol - dalrYInt) / dalrSlope;
      foundTOL = true;
    }
    position++;
  }
  return params;
}



//////////////////////////
// Build Sounding Chart //
//////////////////////////
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

  // Wind barbs section:
  // Wind barbs constants
  const numBarbs = 15; // Sync with y-axis tick count
  const barbAltitudes = y.ticks(numBarbs); // Align barbs with displayed altitudes (every 1,000 ft)
  const barbAnchorX = x(-20);              // Base barb staff position to the left of the y axis)
  const shaftLen = 28;                     // Barb staff length (px)
  const barbSpacing = 7;                   // Spacing between successive symbols along staff (px)
  const barbLen = 8;                       // length of a full barb (px)
  const pennantSpacing = barbSpacing * 2;  // How much space a pennant takes

  // Find the nearest sounding level (converted to the y-axis units)
  function nearestLevelForTick(altKft) {
    if (!data || !data.length) return null;
    return data.reduce((best, cur) => {
      const curAltKft = (cur.Altitude_m * ftPerMeter) / 1000;
      const bestAltKft = (best.Altitude_m * ftPerMeter) / 1000;
      return (Math.abs(curAltKft - altKft) < Math.abs(bestAltKft - altKft)) ? cur : best;
    });
  }

  // Draw a circle for calm wind (speed 0)
  function drawCalm(cx, cy) {
    svg.append("circle")
      .attr("cx", cx)
      .attr("cy", cy)
      .attr("r", 3)
      .attr("fill", "white")
      .attr("stroke", "none");
  }

  // Iterate ticks and draw one barb per tick
  barbAltitudes.forEach(tickAlt => {
    const level = nearestLevelForTick(tickAlt);
    if (!level) return;

    const windDir = +level.Wind_Direction; // Degrees (meteorological)
    const windSpd = +level.Wind_Speed_kt;  // Knots
    const yPos = y(tickAlt);               // Pixel y for the tick

    if (!isFinite(windSpd) || windSpd === 0) {
      drawCalm(barbAnchorX, yPos); // Calm or no speed data
      return;
    }

    // Unit vectors:
    // Shaft unit vector (u) points in the wind direction (meteorological angle)
    const rad = (windDir % 360) * Math.PI / 180;
    const ux = Math.sin(rad);      // x component of unit shaft
    const uy = -Math.cos(rad);     // y component (SVG y axis is downward)
    // Perpendicular (points on the right side of the shaft)
    const px = Math.cos(rad);
    const py = Math.sin(rad);

    // Tip (outer) end of the shaft
    const tipX = barbAnchorX + shaftLen * ux;
    const tipY = yPos + shaftLen * uy;

    // Draw the staff (base -> tip)
    svg.append("line")
      .attr("x1", barbAnchorX)
      .attr("y1", yPos)
      .attr("x2", tipX)
      .attr("y2", tipY)
      .attr("stroke", "white")
      .attr("stroke-width", 5)
      .attr("stroke-linecap", "round");

    // Draw a circle at the anchor
    svg.append("circle")
      .attr("cx", barbAnchorX)
      .attr("cy", yPos)
      .attr("r", 5)              // slightly larger than half stroke-width (so it stands out)
      .attr("fill", "white")    // or "white", or any highlight color
      .attr("stroke", "none");   // or use stroke if you want a border

    // Convert speed to nearest 5 knots (standard)
    let roundedSpeed = Math.round(windSpd / 5) * 5;

    // Create symbol sequence from outer -> inner: pennants (50), full(10), half(5)
    const symbols = [];
    while (roundedSpeed >= 50) { symbols.push("pennant"); roundedSpeed -= 50; }
    while (roundedSpeed >= 10) { symbols.push("full"); roundedSpeed -= 10; }
    if (roundedSpeed >= 5) symbols.push("half");

    // Draw symbols starting at the tip and moving back along the shaft
    let offset = 0; // px along the shaft from the tip inward
    symbols.forEach(sym => {
      // Position on shaft where this symbol is attached
      const posX = tipX - offset * ux;
      const posY = tipY - offset * uy;

      if (sym === "pennant") { // pennant = filled triangle
        // Three points: pos (on shaft), pos + perp, pos - small step along shaft + perp
        const p1x = posX;
        const p1y = posY;
        const p2x = posX + barbLen * px;
        const p2y = posY + barbLen * py;
        const p3x = posX - pennantSpacing * ux + barbLen * px;
        const p3y = posY - pennantSpacing * uy + barbLen * py;

        svg.append("polygon")
          .attr("points", `${p1x},${p1y} ${p2x},${p2y} ${p3x},${p3y}`)
          .attr("fill", "red")
          .attr("stroke", "none");

        offset += pennantSpacing; // Pennant takes more space
      } else if (sym === "full") {
        const endX = posX + barbLen * px;
        const endY = posY + barbLen * py;
        svg.append("line")
          .attr("x1", posX)
          .attr("y1", posY)
          .attr("x2", endX)
          .attr("y2", endY)
          .attr("stroke", "white")
          .attr("stroke-width", 5)
          .attr("stroke-linecap", "round");

        offset += barbSpacing;
      } else if (sym === "half") {
        const endX = posX + (barbLen * 0.6) * px;
        const endY = posY + (barbLen * 0.6) * py;
        svg.append("line")
          .attr("x1", posX)
          .attr("y1", posY)
          .attr("x2", endX)
          .attr("y2", endY)
          .attr("stroke", "white")
          .attr("stroke-width", 5)
          .attr("stroke-linecap", "round");

        offset += barbSpacing;
      }
    });
  }); // End Wind barbs section

  drawDALRParams(hiTemp, liftParams);
}



//////////////////////////
// Draw resetable parts //
//////////////////////////
function drawDALRParams(temp, params) { // Dynamic elements based on user temp input
  const dalr = 5.4;

  // Legend label top of lift
  svg.append("text")
    .attr("class", "white")
    .attr("text-anchor", "end")
    .attr("x", x(113))
    .attr("y", y(19))
    .text(`Top of Lift: ${params.tol < 1289 ? "--" : Math.round(params.tol * ftPerMeter).toLocaleString()}`);

  // Legend label -3 index
  svg.append("text")
    .attr("class", "white")
    .attr("text-anchor", "end")
    .attr("x", x(113))
    .attr("y", y(17))
    .text(`-3 Index: ${!params.neg3 ? "--" : Math.round(params.neg3 * ftPerMeter).toLocaleString()}`);

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
    .attr("x1", x((params.neg3Temp * 9 / 5) + 32))
    .attr("y1", y(params.neg3 * ftPerMeter / 1000))
    .attr("x2", x((params.neg3Temp * 9 / 5) + 32 - 5.4))
    .attr("y2", y(params.neg3 * ftPerMeter / 1000));

  // -3 label
  svg.append("g").append("text")
    .attr("class", "liftlabels")
    .attr("x", x((params.neg3Temp * 9 / 5) + 32 + 2))
    .attr("y", y(params.neg3 * ftPerMeter / 1000 - 0.3))
    .text("-3");

  if (params.tol > 1288) {
    // Top of lift point
    svg.append("g").append("circle")
      .attr("class", "tolcircle")
      .attr("fill", "white")
      .attr("cx", x((params.tolTemp * 9 / 5) + 32))
      .attr("cy", y(params.tol * ftPerMeter / 1000))
      .attr("r", 6);

    // Top of lift label
    svg.append("g").append("text")
      .attr("class", "liftlabels")
      .attr("x", x((params.tolTemp * 9 / 5) + 32 + 2))
      .attr("y", y(params.tol * ftPerMeter / 1000 - 0.3))
      .text("ToL");
  }
}