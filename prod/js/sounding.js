'use strict';
// D3 Globals
let maxTempF, liftParams = {}
const surfaceAlt = 4.229
const maxAlt = 20
const dalr = 5.4
const screenWidth = window.innerWidth
const proportionalHeight = screenWidth * 0.67
const margin = {
  top: proportionalHeight * 0.04,
  bottom: proportionalHeight * 0.08,
  left: screenWidth * 0.055,
  right: screenWidth * 0.025
}
const width = screenWidth - margin.left - margin.right
const height = proportionalHeight - margin.top - margin.bottom
const x = d3.scaleLinear().range([0, width - margin.left - margin.right]).domain([-10, 110])
const y = d3.scaleLinear().range([height, 0]).domain([surfaceAlt, maxAlt])
const svg = d3.select('#skew-t-d3')
  .append('svg')
  .attr('class', 'svgbg')
  .attr('width', width)
  .attr('height', proportionalHeight)
  .append('g')
  .attr('transform', `translate(${margin.left},${margin.top})`)

function sounding(data, text) {
  maxTempF = processSoaringForecast(text)
  liftParams = getLiftParams(data, maxTempF)
  document.getElementById('neg3').innerHTML = liftParams.neg3 ? Math.round(liftParams.neg3 * ftPerMeter).toLocaleString() : '--'
  document.getElementById('tol').innerHTML = liftParams.tol ? Math.round(liftParams.tol * ftPerMeter).toLocaleString() : '--'
  decodedSkewTChart(data, maxTempF, liftParams)
  if (now.getHours() >= 7) {
    document.getElementById('hi-res-sounding-div').style.display = 'block'
    document.getElementById('nws-soaring-forecast-div').style.display = 'block'
  }
};

function processSoaringForecast(text) {
  // WINTER FORMAT:
  // const soaringForecast = extractText(text, /[Dd][Aa][Tt][Ee]\.{3}.+/, /\n[Uu][Pp][Pp]/, 0)
  // const hiTempRow = soaringForecast.search(/[Mm][Aa][Xx]\s[Tt][Ee][Mm][Pp].+/)
  // const hiTemp = parseInt(soaringForecast.slice(hiTempRow + 23, hiTempRow + 26))

  // SUMMER FORMAT:
  const rawForecast = extractText(text, /(?<=This forecast is for )/, /\nWave/, 0).split('\n')
  const date = rawForecast[0]
  const rateOfLift = rawForecast[4].slice(48)
  const topOfLift = parseInt(rawForecast[5].match(/\d{4,5}/)[0]).toLocaleString()
  const hiTemp = parseInt(rawForecast[7].match(/\d{2,3}/))
  const odTime = rawForecast[9].slice(48)
  const neg3 = parseInt(rawForecast[12].match(/\d{4,5}/)[0]).toLocaleString()
  const soaringForecast = `${date}
  
  Top of Lift: ${topOfLift}
  Height of -3 Index: ${neg3}
  
  Max Rate of Lift:
  ${rateOfLift}
  
  Overdevelopment Time: ${odTime}`
  
  document.getElementById('soaring-forecast').innerText = soaringForecast
  document.getElementById('hi-temp').innerHTML = hiTemp
  return hiTemp
};

function interpolate(x1, y1, x2, y2) {
  const slope = (y1 - y2) / (x1 - x2)
  const yInt = y1 - (slope * x1)
  return { slope, yInt }
};

function getLiftParams(data, temp) {
  let position = 0
  const params = {}
  const tempC = (temp - 32) * 5 / 9
  const surfaceAlt_m = 1289
  const dalrSlope = -101.6 // Metric equivalent to -5.4 F / 1,000' (1000/3.28084 & 3deg C) = 101.6
  const dalrYInt = surfaceAlt_m - (dalrSlope * tempC)

  // First find height of -3 index (thermal index = -3)
  while (data[position].Temp_c - ((data[position].Altitude_m - dalrYInt) / dalrSlope) < -3) position++
  if (position === 0) {
    params.neg3 = null
    params.neg3Temp = null
  } else {
    const { Temp_c: temp1, Altitude_m: alt1 } = data[position]
    const { Temp_c: temp2, Altitude_m: alt2 } = data[position - 1]
    if (temp1 !== temp2) {
      const { slope, yInt } = interpolate(temp1, alt1, temp2, alt2)
      const targetX = (yInt - dalrYInt - (3 * dalrSlope)) / (dalrSlope - slope)
      params.neg3 = alt1 + (targetX - temp1) * (alt2 - alt1) / (temp2 - temp1)
      params.neg3Temp = targetX + 3
    } else {
      params.neg3 = (temp1 + 3) * dalrSlope + dalrYInt
      params.neg3Temp = (params.neg3 - dalrYInt) / dalrSlope
    }
  }

  // Next find top of lift (thermal index = 0)
  try {
    while (data[position].Temp_c - ((data[position].Altitude_m - dalrYInt) / dalrSlope) < 0) position++
    const { Temp_c: temp1, Altitude_m: alt1 } = data[position]
    const { Temp_c: temp2, Altitude_m: alt2 } = data[position - 1]
    if (temp1 !== temp2) {
      const { slope, yInt } = interpolate(temp1, alt1, temp2, alt2)
      const targetX = -yInt / slope
      params.tol = alt1 + (targetX - temp1)
    } else {
      params.tol = temp1 * dalrSlope + dalrYInt
    }
    params.tolTemp = (params.tol - dalrYInt) / dalrSlope
  } catch (error) {
    params.tol = null
    params.tolTemp = null
  }
  return params
};

function decodedSkewTChart(data, maxTemp, liftParams) {
  // Set vertical x axis gridlines
  const xAxisGrid = d3.axisTop(x).tickSize(0 - y(4)).ticks(23)
  svg.append('g')
    .attr('class', 'gridticks')
    .call(xAxisGrid)
  
  // Set horizontal y axis gridlines
  const yAxisGrid = d3.axisLeft(y).tickSize(0- x(110)).ticks(15)
  svg.append('g')
    .attr('class', 'gridticks')
    .call(yAxisGrid)

  // Draw skewed border line
  svg.append('g').append('line')
    .attr('stroke', 'white')
    .attr('x1', x(110))
    .attr('y1', y(surfaceAlt))
    .attr('x2', x(25))
    .attr('y2', y(20))
  
  // Plot Temp line
  const tempLine = d3.line()
    .x(d => x((d.Temp_c * 9 / 5) + 32))
    .y(d => y(d.Altitude_m * ftPerMeter / 1000))
  svg.append('path').datum(data)
    .attr('d', tempLine)
    .attr('fill', 'none')
    .attr('stroke', 'var(--bs-red)')
    .attr('stroke-width', 4)
  
  // Plot Dewpoint line
  const dewpointLine = d3.line()
    .x(d => x((d.Dewpoint_c * 9 / 5) + 32))
    .y(d => y(d.Altitude_m * ftPerMeter / 1000))
  svg.append('path').datum(data)
    .attr('d', dewpointLine)
    .attr('fill', 'none')
    .attr('stroke', 'var(--bs-teal)')
    .attr('stroke-width', 3)
  
  // Draw blank rectangle to cover temp & dewpoint lines above chart
  svg.append('g').append('rect')
    .attr('class', 'svgbg')
    .attr('height', margin.top)
    .attr('width', width)
    .attr('x', 0 - margin.left)
    .attr('y', 0 - margin.top)
  
  // Draw blank rectangle to cover temp & dewpoint lines left of chart
  svg.append('g').append('rect')
    .attr('class', 'svgbg')
    .attr('height', height)
    .attr('width', margin.left)
    .attr('x', 0 - margin.left)
    .attr('y', 0 - margin.top)
  
  // Draw x axis
  svg.append('g')
    .attr('class', 'xAxis')
    .attr('transform', `translate(0, ${height})`)
    .call(d3.axisBottom(x).tickFormat(d => `${d}°`))
  
  // Draw y axis
  svg.append('g')
    .attr('class', 'yAxis')
    .call(d3.axisLeft(y).tickFormat(d => `${d}k'`))
  
  // Draw blank gray polygon to cover upper right grid
  const p1 = `M ${x(25)} 0, `
  const p2 = `L ${x(110)} ${y(surfaceAlt)}, `
  const p3 = `L ${width + margin.right} ${y(surfaceAlt)}, `
  const p4 = `L ${width + margin.right} 0, `
  const p5 = `L ${x(25)} 0`
  const polygon = p1 + p2 + p3 + p4 + p5
  svg.append('path')
    .attr('class', 'svgbg')
    .attr('d', polygon)
  
  // DALR label
  svg.append('text')
    .attr('class', 'dalrlabel')
    .attr('transform', `rotate(45, ${x(-3)}, ${y(6)})`)
    .style('text-anchor', 'start')
    .text(`Dry Adiabatic Lapse Rate: -5.4° F / 1,000 ft`)
  
  // Legend labels
  svg.append('text')
    .attr('class', 'dewpoint')
    .attr('text-anchor', 'end')
    .attr('x', x(113))
    .attr('y', y(16.5))
    .text('Dewpoint')
  svg.append('text')
    .attr('class', 'temp')
    .attr('text-anchor', 'end')
    .attr('x', x(113))
    .attr('y', y(14.5))
    .text('Temp')
  
  drawDALRParams(maxTemp, liftParams)
};

function drawDALRParams (temp, params) {
  // Legend label max temp
  svg.append('text')
    .attr('class', 'maxtemp')
    .attr('text-anchor', 'end')
    .attr('x', x(113))
    .attr('y', y(18.5))
    .text(`Max Temp DALR: ${temp}°`)

  // Max temp DALR line
  svg.append('g').append('line')
    .attr('class', 'dalrline')
    .attr('stroke', 'var(--bs-info)')
    .attr('stroke-width', 3)
    .attr('x1', function() {
      if (x(temp - (maxAlt - surfaceAlt) * dalr) > x(-10)) return x(temp - (maxAlt - surfaceAlt) * dalr)
      else return x(-10)
    })
    .attr('x2', x(temp))
    .attr('y1', function() {
      if (x(temp - (maxAlt - surfaceAlt) * dalr) < x(-10)) return y(-1/dalr * (-10 - temp) + surfaceAlt)
    })
    .attr('y2', y(surfaceAlt))

  // -3 index line
  svg.append('g').append('line')
    .attr('class', 'neg3line')
    .attr('stroke', 'white')
    .attr('stroke-width', 2)
    .attr('x1', x((params.neg3Temp * 9 / 5) + 32))
    .attr('y1', y(params.neg3 * ftPerMeter / 1000))
    .attr('x2', x((params.neg3Temp * 9 / 5) + 32 - 5.4))
    .attr('y2', y(params.neg3 * ftPerMeter / 1000))
  
  // -3 label
  svg.append('g').append('text')
    .attr('class', 'liftlabels')
    .attr('x', x((params.neg3Temp * 9 / 5) + 32 - 3))
    .attr('y', y(params.neg3 * ftPerMeter / 1000 - 0.6))
    .text('-3')
  
  // -3 height
  svg.append('g').append('text')
    .attr('class', 'liftheights')
    .attr('x', x((params.neg3Temp * 9 / 5) + 32 + 4))
    .attr('y', y(params.neg3 * ftPerMeter / 1000 - 0.5))
    .text(Math.round(params.neg3 * ftPerMeter).toLocaleString())

  // Top of lift point
  svg.append('g').append('circle')
    .attr('class', 'tolcircle')
    .attr('fill', 'white')
    .attr('cx', x((params.tolTemp * 9 / 5) + 32))
    .attr('cy', y(params.tol * ftPerMeter / 1000))
    .attr('r', 6)

  // Top of lift label
  svg.append('g').append('text')
    .attr('class', 'liftlabels')
    .attr('x', x((params.tolTemp * 9 / 5) + 32 + 2))
    .attr('y', y(params.tol * ftPerMeter / 1000))
    .text('ToL')
  
  // Top of lift height
  svg.append('g').append('text')
    .attr('class', 'liftheights')
    .attr('x', x((params.tolTemp * 9 / 5) + 32 + 10))
    .attr('y', y(params.tol * ftPerMeter / 1000))
    .text(`${Math.round(params.tol * ftPerMeter).toLocaleString()}`)
};

function d3Update(userLiftParams) {
  document.getElementById('out-of-range').style.display = 'none'
  const userTemp = parseInt(document.getElementById('user-temp').value)
  if (!userTemp) return
  try {
    userLiftParams = getLiftParams(soundingData, userTemp)
  } catch {
    outOfRange(userTemp)
    return
  }
  if ((userLiftParams.tolTemp * 9 / 5) + 32 < -10 || userLiftParams.tol * ftPerMeter / 1000 > 20 || !userLiftParams.tol) {
    outOfRange(userTemp)
  } else {
    clearChart()
    drawDALRParams(userTemp, userLiftParams)
  }
};

function outOfRange(userTemp) {
  document.getElementById('out-of-range').innerHTML = `Error: parameters out of range for ${userTemp}&deg;`
  document.getElementById('out-of-range').style.display = 'block'
  document.getElementById('user-temp').value = null
  return
};

function d3Clear() {
  document.getElementById('out-of-range').style.display = 'none'
  clearChart()
  drawDALRParams(maxTempF, liftParams)
};

function clearChart() {
  document.getElementById('user-temp').value = null
  svg.select('line.dalrline').remove()
  svg.select('line.neg3line').remove()
  svg.selectAll('text.liftlabels').remove()
  svg.selectAll('text.liftheights').remove()
  svg.select('text.maxtemp').remove()
  svg.select('circle.tolcircle').remove()
};
