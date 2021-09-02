'use strict';
// https://stackoverflow.com/questions/13313043/d3-js-animate-rotation
let surfaceAlt = 4229/1000 // KSLC elevation
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
    const p3 = `L ${width + margin.right - 3} ${y(surfaceAlt)}, `
    const p4 = `L ${width + margin.right - 3} -1, `
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
    svg.append('line') // Draw User Temp DALR line
        .attr('stroke', wwYlw)
        .attr('stroke-width', 4)
        .attr('x1', x(userTemp-(18-surfaceAlt)*dalr))
        .attr('x2', x(userTemp))
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
        .text(`Dry Adiabatic Lapse Rate: -5.38 °F / 1,000 ft`)
    svg.append('text') // Legend Max Temp text label
        .attr('class', 'templabel')
        .attr('x', x(58))
        .attr('y', y(17))
        .text(`Forecast Max Temp: ${maxTemp}°`) // What if no Soarcast for high temp??? !!!!!!!!!!!!!!!!!!!
    svg.append('text') // Legend Sounding text label
        .attr('class', 'raoblabel')
        .attr('x', x(75))
        .attr('y', y(15.5))
        .text('Sounding Temp')
    svg.append('text') // Legend Dew Point text label
        .attr('class', 'dewpointlabel')
        .attr('x', x(87))
        .attr('y', y(14))
        .text('Dewpoint')
    // svg.append('svg:image')
    //     .attr('xlink:href', 'images/arrowbox.png')
    //     .attr('width', 50)
    //     .attr('height', 50)
    //     .attr('x', x(-9))
    //     .attr('y', y(10.67))
    //     .attr('transform', 'rotate(-10)')
    // svg.append('svg:image')
    //     .attr('xlink:href', 'images/arrowbox.png')
    //     .attr('width', 50)
    //     .attr('height', 50)
    //     .attr('x', x(-9))
    //     .attr('y', y(10.67))
    //     .attrTween('transform', function(d, i, a) {
    //         return d3.interpolateString('translate(0,0) rotate(0)'), 'translate(0,0)' + 'rotate(' + d * 1.8 + ', 63, 54.77)'
    //     })
}

function d3Update() {
    userTemp = parseInt(document.getElementById('user-temp').value)
    userTemp = (userTemp>110 || isNaN(userTemp)) ? -10 : userTemp
    if (userTemp!==-10 && userTemp>=(raobData[0].Temp_c*9/5)+32) {
        drawD3LapseChart(raobData, maxTemp)
        calculateMaxHeightOfThermal(raobData, userTemp)
    }
    else { d3Clear() }
}

function d3Clear() {
    userTemp = -10
    svg.selectAll('*').remove()
    drawD3LapseChart(raobData, maxTemp)
    document.getElementById('user-temp').value = null
    document.getElementById('user-input-tol').innerHTML = '&nbsp;'
    document.getElementById('user-input-tol-m').innerHTML = '&nbsp;'
    document.getElementById('user-input-neg3').innerHTML = '&nbsp;'
    document.getElementById('user-input-neg3-m').innerHTML = '&nbsp;'
    document.getElementById('user-input-rol').innerHTML = '&nbsp;'
    document.getElementById('user-input-rol-m').innerHTML = '&nbsp;'
}

function calculateMaxHeightOfThermal (raobData, maxTemp, maxPosition = 0) {
    // While: Determine the position of the sounding data where it crosses the DALR to obtain interpolation points
    // While DALR line > RAOB Temp Line:
    while ((maxTemp-(((raobData[maxPosition].Altitude_m-raobData[0].Altitude_m)*3.281/1000)*dalr)) > ((raobData[maxPosition].Temp_c*9/5)+32))
        maxPosition++
    const yIntercept = (maxTemp/dalr) + 4.229 // SLC Altitude
    const dalrSlope = -1 / dalr
    const x1 = ((raobData[maxPosition].Temp_c*9/5)+32)
    const y1 = raobData[maxPosition].Altitude_m*3.281/1000
    const x2 = ((raobData[maxPosition-1].Temp_c*9/5)+32)
    const y2 = raobData[maxPosition-1].Altitude_m*3.281/1000
    const maxThermalHeight = Math.round((dalrSlope*((((x2-x1)/(y2-y1)*(y1-yIntercept))-x1)/((((x2-x1)/(y2-y1))*dalrSlope)-1))+yIntercept)*1000)
    document.getElementById('user-input-tol').innerHTML = maxThermalHeight.toLocaleString()
    document.getElementById('user-input-tol-m').innerHTML = Math.round(maxThermalHeight / 3.28) + ' m'
    document.getElementById('user-input-neg3').innerHTML = 'tbd'
    document.getElementById('user-input-neg3-m').innerHTML = 'tbd'
    document.getElementById('user-input-rol').innerHTML = 'tbd'
    document.getElementById('user-input-rol-m').innerHTML = 'tbd'
    // EXPERIMENTAL!
    // const maxThermalHeightTemp = (((maxThermalHeight/1000)-y1)/((y2-y1)/(x2-x1)))+x1
    // console.log('Temp Max Height of Thermals: ' + maxThermalHeightTemp)
    // console.log('Temp @ 4000 ft AGL: ' + 'TBD')
    // END EXPERIMENTAL}
}
