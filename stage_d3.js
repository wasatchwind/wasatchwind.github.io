'use strict';
let surfaceAlt = 4229/1000 // KSLC elevation adjusted to d3 y-axis scale
let visibleScreenWidth = document.documentElement.clientWidth
visibleScreenWidth = (visibleScreenWidth > 1080) ? visibleScreenWidth * 0.6 : visibleScreenWidth * 0.89
const visibleScreenHeight = visibleScreenWidth * 0.679
const margin = {
    top: visibleScreenHeight * 0.023,
    right: visibleScreenWidth * 0.028,
    bottom: visibleScreenHeight * 0.133,
    left: visibleScreenWidth * 0.09
}
const width = visibleScreenWidth - margin.left - margin.right
const height = visibleScreenHeight - margin.top - margin.bottom
const dalr = 5.4 // Equivalent to 3°C
let dalrYInt
const dalrSlope = -1/dalr
const svg = d3.select('#skew-t-d3').append('svg')
    .attr('class', 'svgbg')
    .attr('width', width + margin.left + margin.right)
    .attr('height', height + margin.top + margin.bottom)
    .append('g')
    .attr('transform', `translate(${margin.left},${margin.top})`)
const x = d3.scaleLinear()
    .range([-10, width])
    .domain([-10, 110])
const y = d3.scaleLinear()
    .range([height, 0])
    .domain([surfaceAlt, 18])
function drawD3LapseChart(data, maxTemp) {
    svg.selectAll('*').remove()
    const p1 = `M ${x(36)} -1, `
    const p2 = `L ${x(110)} ${y(surfaceAlt)}, `
    const p3 = `L ${width + margin.right} ${y(surfaceAlt)}, `
    const p4 = `L ${width + margin.right} -1, `
    const p5 = `L ${x(36)} -1`
    const polygon = p1 + p2 + p3 + p4 + p5
    const xAxisGrid = d3.axisTop(x)
        .tickSize(0-y(4))
        .tickFormat('')
        .ticks(19)
    const dalrAxisGrid = d3.range(-5,111,5)
    const yAxisGrid = d3.axisLeft(y)
        .tickSize(-innerWidth)
        .tickFormat('')
    const tempLine = d3.line()
        .x(function(d) { return x((d.Temp_c * 9 / 5) + 32) })
        .y(function(d) { return y(d.Altitude_m * 3.281 / 1000) })
    const dpLine = d3.line()
        .x(function(d) { return x((d.Dewpoint_c * 9 / 5) + 32) })
        .y(function(d) { return y(d.Altitude_m * 3.281 / 1000) })
    svg.append('g') // Draw vertical x axis gridlines
        .attr('class', 'gridticks')
        .call(xAxisGrid)
    svg.append('g') // Draw horizontal y axis gridlines
        .attr('class', 'gridticks')
        .call(yAxisGrid)
    svg.append('g').selectAll('dalr-lines') // Draw skewed DALR x axis gridlines
        .data(dalrAxisGrid).enter().append('line')
        .attr('class', 'dalrgrid')
        .attr('x1', function(d) { return x(d-(18-surfaceAlt)*dalr) })
        .attr('x2', function(d) { return x(d) })
        .attr('y1', y(18))
        .attr('y2', y(surfaceAlt))
    svg.append('path').datum(data) // Plot sounding temp line
        .attr('fill', 'none')
        .attr('stroke', wwRed)
        .attr('stroke-width', 5)
        .attr('d', tempLine)
    svg.append('path').datum(data) // Plot sounding dew point line
        .attr('fill', 'none')
        .attr('stroke', wwGrn)
        .attr('stroke-width', 4)
        .attr('d', dpLine)
    svg.append('line') // Draw Max Temp DALR line
        .attr('stroke', wwBlu)
        .attr('stroke-width', 4)
        .attr('x1', x(maxTemp-(18-surfaceAlt)*dalr))
        .attr('x2', x(maxTemp))
        .attr('y1', y(18))
        .attr('y2', y(surfaceAlt))
    svg.append('g').append('rect') // Draw blank rectangle to clip temp line above chart
        .attr('class', 'svgbg')
        .attr('x', 0 - margin.left)
        .attr('y', 0 - margin.top)
        .attr('width', width)
        .attr('height', margin.top)
    svg.append('g').append('rect') // Draw blank rectangle to clip temp line left of chart
        .attr('class', 'svgbg')
        .attr('x', 0 - margin.left)
        .attr('y', 0)
        .attr('width', margin.left)
        .attr('height', height)
    svg.append('g') // Draw x axis
        .attr('transform', `translate(0, ${height})`)
        .attr('class', 'xAxis')
        .call(d3.axisBottom(x))
    svg.append('g') // Draw y axis
        .attr('class', 'yAxis')
        .call(d3.axisLeft(y))
    svg.append('text') // x axis label (Temp)
        .attr('transform', `translate(${(width - margin.left - margin.right) / 2}, ${(height + margin.top + 60)})`)
        .attr('class', 'xLabel')
        .text('Temp °F')
    svg.append('text') // y axis label (Altitude)
        .attr('transform', 'rotate(-90)')
        .attr('y', margin.left * -0.74)
        .attr('x', 0 - (height / 2))
        .attr('class', 'yLabel')
        .text('Altitude ( x1,000 ft )')
    svg.append('path') // Draw blank gray polygon to clip upper right grid
        .attr('d', polygon)
        .attr('fill', '#212529')
    svg.append('text') // DALR label
        .attr('class', 'dalrlabel')
        .attr('transform', `rotate(46, ${x(5)}, ${y(3)})`)
        .style('text-anchor', 'start')
        .text(`Dry Adiabatic Lapse Rate: -5.4 °F / 1,000 ft`)
    svg.append('text') // Legend: "Forecast Max Temp" text label
        .attr('class', 'templabel')
        .attr('text-anchor', 'end')
        .attr('x', x(110))
        .attr('y', y(17))
        .text(`Forecast Max Temp: ${maxTemp}° F`)
    svg.append('text') // Legend: "Alternate Max Temp" text label
        .attr('class', 'alternatemax')
        .attr('text-anchor', 'end')
        .attr('x', x(110))
        .attr('y', y(15.5))
        .text('Alternate Max Temp')
    svg.append('text') // Legend: "Sounding Temp" text label
        .attr('class', 'raoblabel')
        .attr('text-anchor', 'end')
        .attr('x', x(110))
        .attr('y', y(14))
        .text('Sounding Temp')
    svg.append('text') // Legend: "Dewpoint" text label
        .attr('class', 'dewpointlabel')
        .attr('text-anchor', 'end')
        .attr('x', x(110))
        .attr('y', y(12.5))
        .text('Dewpoint')
}

function d3Update() {
    let userTemp = parseInt(document.getElementById('user-temp').value)
    userTemp = (userTemp>110 || isNaN(userTemp)) ? -10 : userTemp
    svg.select('line.userline').remove()
    if (userTemp<111 && userTemp>(raobDataStored[0].Temp_c*9/5)+32) {
        const xCutoff = -8.5
        svg.append('g').append('line')
            .attr('class', 'userline')
            .attr('stroke', wwYlw)
            .attr('stroke-width', 4)
            .attr('x1', function() {
                if (x(userTemp-(18-surfaceAlt)*dalr)>x(xCutoff)) return x(userTemp-(18-surfaceAlt)*dalr)
                else { return x(xCutoff)}
            })
            .attr('x2', x(userTemp))
            .attr('y1', function() {
                if (x(userTemp-(18-surfaceAlt)*dalr)<x(xCutoff)) return y(-1/dalr*(xCutoff-userTemp)+surfaceAlt)
            })
            .attr('y2', y(surfaceAlt))
        dalrYInt = (userTemp/dalr) + surfaceAlt
        const tol = calculateToL()
        const neg3 = calculateNeg3()
        const rol = calculateRoL(tol)
        document.getElementById('user-input-tol').innerHTML = tol['Alt'].toLocaleString()
        document.getElementById('user-input-tol-m').innerHTML = `${Math.round(tol['Alt']/3.281).toLocaleString()} m`
        document.getElementById('user-input-neg3').innerHTML = neg3.toLocaleString()
        document.getElementById('user-input-neg3-m').innerHTML = `${Math.round(neg3/3.281).toLocaleString()} m`
        document.getElementById('user-input-rol').innerHTML = rol.toLocaleString()
        document.getElementById('user-input-rol-m').innerHTML = `${Math.round(rol/19.7)/10} m/s`
    }
    else { d3Clear() }
}

function d3Clear() {
    svg.select('line.userline').remove()
    document.getElementById('user-temp').value = null
    document.getElementById('user-input-tol').innerHTML = '&nbsp;'
    document.getElementById('user-input-tol-m').innerHTML = '&nbsp;'
    document.getElementById('user-input-neg3').innerHTML = '&nbsp;'
    document.getElementById('user-input-neg3-m').innerHTML = '&nbsp;'
    document.getElementById('user-input-rol').innerHTML = '&nbsp;'
    document.getElementById('user-input-rol-m').innerHTML = '&nbsp;'
}

function interpolate(x1, y1, x2, y2, input, inputType) {
    const xDiff = (x1===x2) ? x1 : x2-x1
    if (inputType==='x') return y1+((input-x1)*(y2-y1)/(xDiff))
    return x1+((input-y1)*(xDiff)/(y2-y1))
}

function calculateToL(position = 0, tol = {}) {
    // https://www.weather.gov/otx/Soaring_Forecast_Information
    // Compare each RAOB data point temp °C with calculated DALR temp °C at the same altitude
    // Calculated DALR temp: y=mx+b. Temp is the 'x' value, so x=(y-b)/m ('x' must be converted to °C)
    // Where: y = roabDataStored[position].Altitude_m*3.281/1000 (convert to imperial for dalrYInt)
    // Where: b = dalrYInt (imperial units)
    // Where: m = dalrSlope (imperial units)
    // While RAOB < DALR, lift exists. As altitude increases, the lines converge at Top of Lift (ToL)
    // Temp difference below convergence is the Thermal Index (TI). At ToL, TI=0
    // Convergence typically lies between RAOB data points, so interpolation is necessary
    // Interpolation requires RAOB data postions above (position) and below (position-1) convergence
    while (raobDataStored[position].Temp_c<((((raobDataStored[position].Altitude_m*3.281/1000)-dalrYInt)/dalrSlope)-32)*5/9) position++
    const raobLine = raobLineObj(position)
    // Formula derivation: find where RAOB temp (x value) and DALR temp (x value) are equal
    // Solve for x: x=(y-b)/m. ToL is where RAOB x: (y-b)/m equals DALR x: (y-b)/m
    // Solve for y (since y is the same for both) for final formula:
    // ToL=(RAOB y intercept/RAOB slope-DALR y intercept/DALR slope)/(1/RAOB slope-1/DALR Slope)
    tol['Alt'] = Math.round((raobLine['YInt']/raobLine['Slope']-dalrYInt/dalrSlope)/(1/raobLine['Slope']-1/dalrSlope)*1000)
    // Calculate ToL temp °F using ToL alt on DALR line: x=(y-b)/m (used in Max Rate of Lift calculation)
    tol['Temp'] = ((tol['Alt']/1000)-dalrYInt)/dalrSlope
    return tol
}

function calculateNeg3(position = 0) {
    // Same as ToL, except find where temp difference is -3°C instead of equal
    while (raobDataStored[position].Temp_c-((((raobDataStored[position].Altitude_m*3.281/1000)-dalrYInt)/dalrSlope)-32)*5/9<-3) position++
    const raobLine = raobLineObj(position)
    return parseInt((((raobLine['YInt']/raobLine['Slope'])-(dalrYInt/dalrSlope)-5.4)/((1/raobLine['Slope'])-(1/dalrSlope)))*1000)
}

function calculateRoL(tol, position = 0) {
    const firstUsableLiftAlt = surfaceAlt+4
    while (raobDataStored[position].Altitude_m*3.281/1000<firstUsableLiftAlt) position++
    const raobLine = raobLineObj(position)
    const fulTemp = interpolate(raobLine['x1'], raobLine['y1'], raobLine['x2'], raobLine['y2'], firstUsableLiftAlt, 'y')
    const fulYInt = firstUsableLiftAlt-(dalrSlope*fulTemp)
    const fulSurfaceTemp = (((surfaceAlt-fulYInt)/dalrSlope)-32)*5/9
    return Math.round(2.4*(tol['Alt']/3.281/100+10*(fulSurfaceTemp-((tol['Temp'])-32)*5/9)))
}

function raobLineObj(position, raobLine = {}) {
    raobLine['x1'] = (raobDataStored[position].Temp_c*9/5)+32
    raobLine['y1'] = raobDataStored[position].Altitude_m*3.281/1000
    raobLine['x2'] = (raobDataStored[position-1].Temp_c*9/5)+32
    raobLine['y2'] = raobDataStored[position-1].Altitude_m*3.281/1000
    // In case RAOB Temps are the same (x1===x2), use xDiff (vertical line/infinite slope)
    const xDiff = raobLine['x1']===raobLine['x2'] ? raobLine['x1'] : raobLine['x2']-raobLine['x1']
    raobLine['Slope'] = (raobLine['y2']-raobLine['y1'])/xDiff // m=(y2-y1)/(x2-x1)
    raobLine['YInt'] = raobLine['y1']-(raobLine['Slope']*raobLine['x1']) // b=y-mx
    return raobLine
}
