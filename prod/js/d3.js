'use strict';
// D3 Globals
let dalrFlag = 0
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

function decodedSkewTChart(maxTemp, data, liftParams) {
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
        .y(d => y(d.Altitude_m * 3.28084 / 1000))
    svg.append('path').datum(data)
        .attr('d', tempLine)
        .attr('fill', 'none')
        .attr('stroke', 'var(--bs-red)')
        .attr('stroke-width', 4)
    
    // Plot Dewpoint line
    const dewpointLine = d3.line()
        .x(d => x((d.Dewpoint_c * 9 / 5) + 32))
        .y(d => y(d.Altitude_m * 3.28084 / 1000))
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
        .attr('y1', y(params.neg3 * 3.28084 / 1000))
        .attr('x2', x((params.neg3Temp * 9 / 5) + 32 - 5.4))
        .attr('y2', y(params.neg3 * 3.28084 / 1000))

    // -3 label
    svg.append('g').append('text')
        .attr('class', 'neg3label')
        .attr('x', x((params.neg3Temp * 9 / 5) + 32 + 1))
        .attr('y', y(params.neg3 * 3.284084 / 1000 - 0.2))
        .text('-3')

    // Top of lift point
    svg.append('g').append('circle')
        .attr('class', 'tolcircle')
        .attr('fill', 'white')
        .attr('cx', x((params.tolTemp * 9 / 5) + 32))
        .attr('cy', y(params.tol * 3.284084 / 1000))
        .attr('r', 6)

    // Top of lift label
    svg.append('g').append('text')
        .attr('class', 'tollabel')
        .attr('x', x((params.tolTemp * 9 / 5) + 32 + 2))
        .attr('y', y(params.tol * 3.284084 / 1000 - 0.2))
        .text('ToL')
};

function d3Update() {
    const userTemp = parseInt(document.getElementById('user-temp').value)
    if (userTemp > (soundingData[1].Temp_c * 9 / 5) + 32 + 5.4 && userTemp < 106) {
        const userLiftParams = getLiftParams(userTemp, soundingData)
        if (userLiftParams === null) {
            d3Clear()
            return
        }
        dalrFlag = 1
        d3Clear()
        drawDALRParams(userTemp, userLiftParams)
        dalrFlag = 0
    } else d3Clear()
};

function d3Clear() {
    document.getElementById('user-temp').value = null
    svg.select('line.dalrline').remove()
    svg.select('line.neg3line').remove()
    svg.select('text.neg3label').remove()
    svg.select('text.tollabel').remove()
    svg.select('text.maxtemp').remove()
    svg.select('circle.tolcircle').remove()
    document.getElementById('neg3').innerHTML = Math.round(liftParams.neg3 * 3.28084).toLocaleString()
    document.getElementById('tol').innerHTML = Math.round(liftParams.tol * 3.28084).toLocaleString()
    if (dalrFlag === 0) {
//         document.getElementById('neg3').innerHTML = Math.round(liftParams.neg3 * 3.28084).toLocaleString()
//         document.getElementById('tol').innerHTML = Math.round(liftParams.tol * 3.28084).toLocaleString()
        drawDALRParams(maxTempF, liftParams)
    }
};
