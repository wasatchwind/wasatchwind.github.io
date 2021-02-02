function draw_lapse_chart (data, maxTemp, dalr) {
    const visibleScreenWidth = document.documentElement.clientWidth * 0.9;
    const margin = {top: 15, right: visibleScreenWidth * 0.026, bottom: 80, left: visibleScreenWidth * 0.09};
    const width = visibleScreenWidth - margin.left - margin.right;
    const height = 660 - margin.top - margin.bottom;
    const svg = d3.select('#skewt').append('svg')
        .attr('class', 'svg-bg')
        .attr('width', width + margin.left + margin.right)
        .attr('height', height + margin.top + margin.bottom)
        .append('g')
        .attr('transform', 'translate(' + margin.left + ',' + margin.top + ')');
    const x = d3.scaleLinear()
        .range([0, width])
        .domain([0,100]);
    const y = d3.scaleLinear()
        .range([height, 0])
        .domain([4,18]);
    const c1 = x(25);
    const c2 = x(100);
    const c3 = y(4);
    const polygon = 'M ' + c1 + ' 0, L ' + c2 + ' ' + c3 + ', L ' + (width + margin.right) + ' ' + c3 + ', L ' + (width + margin.right) + ' 0, L ' + c1 + ' 0';
    const dalrLabelPosition = 'rotate(43, 0, ' + visibleScreenWidth * 0.8 + ')';
    const xAxisGrid = d3.axisTop(x)
        .tickSize(0-y(4))
        .tickFormat('')
        .ticks(19);
    const dalrAxisGrid = d3.range(0,105,5);
    const yAxisGrid = d3.axisLeft(y)
        .tickSize(-innerWidth)
        .tickFormat('')
    const tempLine = d3.line()
        .x(function(d) { return x((d.Temp_c * 9 / 5) + 32); })
        .y(function(d) { return y(d.Altitude_m * 3.281 / 1000); });
    svg.append('g') // Draw vertical x axis gridlines
        .attr('class', 'grid-ticks')
        .call(xAxisGrid);
    svg.append('g') // Draw horizontal y axis gridlines
        .attr('class', 'grid-ticks')
        .call(yAxisGrid);
    svg.append('g').selectAll("dalr-lines") // Draw skewed DALR x axis gridlines
        .data(dalrAxisGrid).enter().append("line")
        .attr('class', 'grid-dalr')
        .attr('x1', function(d) { return x(d-75) })
        .attr('x2', function(d) { return x(d) })
        .attr('y1', y(18))
        .attr('y2', y(4.229));
    svg.append('path').datum(data) // Plot sounding temp line
        .attr('fill', 'none')
        .attr('stroke', 'red')
        .attr('stroke-width', 5)
        .attr('d', tempLine);
    svg.append('g').append('rect') // Draw blank rectangle to clip temp line above chart
        .attr('class', 'svg-bg')
        .attr('x', 0 - margin.left)
        .attr('y', 0 - margin.top)
        .attr('width', width)
        .attr('height', margin.top);
    svg.append('g').append('rect') // Draw blank rectangle to clip temp line left of chart
        .attr('class', 'svg-bg')
        .attr('x', 0 - margin.left)
        .attr('y', 0)
        .attr('width', margin.left)
        .attr('height', height);
    svg.append('g') // Draw x axis
        .attr('transform', 'translate(0,' + height + ')')
        .attr('class', 'xAxis')
        .call(d3.axisBottom(x));
    svg.append('g') // Draw y axis
        .attr('class', 'yAxis')
        .call(d3.axisLeft(y));
    svg.append('text') // x axis label (Temp)
        .attr('transform', 'translate(' +  (width - margin.left - margin.right) / 2 + ',' + (height + margin.top + 60) + ')')
        .attr('class', 'xLabel')
        .text('Temp \u00B0F');
    svg.append('text') // y axis label (Altitude)
        .attr('transform', 'rotate(-90)')
        .attr('y', margin.left * -0.74)
        .attr('x', 0 - (height / 2))
        .attr('class', 'yLabel')
        .text('Altitude ( x1,000 ft )');
    svg.append('line') // Draw Max Temp DALR line
        .attr('stroke', 'lightgreen')
        .attr('stroke-width', 2)
        .attr('x1', x(maxTemp))
        .attr('y1', y(4.229))
        .attr('x2', x(0))
        .attr('y2', y((maxTemp / dalr) + 4.229));
    svg.append('path') // Draw blank gray polygon to clip upper right grid
        .attr('d', polygon)
        .attr('fill', 'rgb(80,80,80)');
    svg.append('text') // DALR label
        .attr('class', 'dalrLabel')
        // .attr('x', x(55))
        // .attr('y', 200)
        .attr('transform', dalrLabelPosition)
        .style('text-anchor', 'start')
        .text('\u2190 DALR (-5.38 \u00B0F / 1000 ft) \u2192');
    svg.append('line') // Legend green line
        .attr('stroke', 'lightgreen')
        .attr('stroke-width', 4)
        .attr('x1', x(40))
        .attr('y1', y(17))
        .attr('x2', x(45))
        .attr('y2', y(17));
    svg.append('text') // Legend green line text label
        .attr('class', 'dalrLabel')
        .attr('x', x(47))
        .attr('y', y(17))
        .text('Forecast Max Temp DALR Line');
    svg.append('line') // Legend red line
        .attr('stroke', 'red')
        .attr('stroke-width', 5)
        .attr('x1', x(50))
        .attr('y1', y(15.5))
        .attr('x2', x(55))
        .attr('y2', y(15.5));
    svg.append('text') // Legend red line text label
        .attr('class', 'dalrLabel')
        .attr('x', x(57))
        .attr('y', y(15.5))
        .text('Sounding Temperature');
}

// function draw_lapse_chart (data, maxTemp, dalr) {
//     let visibleScreenWidth = document.documentElement.clientWidth * 0.9;
//     let margin = {top: 15, right: visibleScreenWidth * 0.026, bottom: 80, left: visibleScreenWidth * 0.09};
//     let width = visibleScreenWidth - margin.left - margin.right;
//     let height = 660 - margin.top - margin.bottom;
//     let svg = d3.select('#skewt').append('svg')
//         .attr('class', 'svg-bg')
//         .attr('width', width + margin.left + margin.right)
//         .attr('height', height + margin.top + margin.bottom)
//         .append('g')
//         .attr('transform', 'translate(' + margin.left + ',' + margin.top + ')');
//     let x = d3.scaleLinear()
//         .range([0, width])
//         .domain([0,100]);
//     let y = d3.scaleLinear()
//         .range([height, 0])
//         .domain([4,18]);
//     let c1 = x(25);
//     let c2 = x(100);
//     let c3 = y(4);
//     let polygon = 'M ' + c1 + ' 0, L ' + c2 + ' ' + c3 + ', L ' + (width + margin.right) + ' ' + c3 + ', L ' + (width + margin.right) + ' 0, L ' + c1 + ' 0';
//     let xAxisGrid = d3.axisTop(x)
//         .tickSize(0-y(4))
//         .tickFormat('')
//         .ticks(19);
//     let dalrAxisGrid = d3.range(0,105,5);
//     let yAxisGrid = d3.axisLeft(y)
//         .tickSize(-innerWidth)
//         .tickFormat('')
//     let tempLine = d3.line()
//         .x(function(d) { return x((d.Temp_c * 9 / 5) + 32); })
//         .y(function(d) { return y(d.Altitude_m * 3.281 / 1000); });
//     svg.append('g') // Draw vertical x axis gridlines
//         .attr('class', 'grid-ticks')
//         .call(xAxisGrid);
//     svg.append('g') // Draw horizontal y axis gridlines
//         .attr('class', 'grid-ticks')
//         .call(yAxisGrid);
//     svg.append('g').selectAll("dalr-lines") // Draw skewed DALR x axis gridlines
//         .data(dalrAxisGrid).enter().append("line")
//         .attr('class', 'grid-dalr')
//         .attr('x1', function(d) { return x(d-75) })
//         .attr('x2', function(d) { return x(d) })
//         .attr('y1', y(18))
//         .attr('y2', y(4.229));
//     svg.append('path').datum(data) // Plot sounding temp line
//         .attr('fill', 'none')
//         .attr('stroke', 'red')
//         .attr('stroke-width', 5)
//         .attr('d', tempLine);
//     svg.append('g').append('rect') // Draw blank rectangle to clip temp line above chart
//         .attr('class', 'svg-bg')
//         .attr('x', 0 - margin.left)
//         .attr('y', 0 - margin.top)
//         .attr('width', width)
//         .attr('height', margin.top);
//     svg.append('g').append('rect') // Draw blank rectangle to clip temp line left of chart
//         .attr('class', 'svg-bg')
//         .attr('x', 0 - margin.left)
//         .attr('y', 0)
//         .attr('width', margin.left)
//         .attr('height', height);
//     svg.append('g') // Draw x axis
//         .attr('transform', 'translate(0,' + height + ')')
//         .attr('class', 'xAxis')
//         .call(d3.axisBottom(x));
//     svg.append('g') // Draw y axis
//         .attr('class', 'yAxis')
//         .call(d3.axisLeft(y));
//     svg.append('text') // x axis label (Temp)
//         .attr('transform', 'translate(' +  (width - margin.left - margin.right) / 2 + ',' + (height + margin.top + 60) + ')')
//         .attr('class', 'xLabel')
//         .text('Temp \u00B0F');
//     svg.append('text') // y axis label (Altitude)
//         .attr('transform', 'rotate(-90)')
//         .attr('y', margin.left * -0.74)
//         .attr('x', 0 - (height / 2))
//         .attr('class', 'yLabel')
//         .text('Altitude ( x1,000 ft )');
//     svg.append('line') // Draw Max Temp DALR line
//         .attr('stroke', 'lightgreen')
//         .attr('stroke-width', 2)
//         .attr('x1', x(maxTemp))
//         .attr('y1', y(4.229))
//         .attr('x2', x(0))
//         .attr('y2', y((maxTemp / dalr) + 4.229));
//     svg.append('path') // Draw blank gray polygon to clip upper right grid
//         .attr('d', polygon)
//         .attr('fill', 'rgb(80,80,80)');
//     svg.append('text') // DALR label
//         .attr('class', 'dalrLabel')
//         .attr('x', visibleScreenWidth * 0.47)
//         .attr('y', -160)
//         .attr('transform', 'rotate(43)')
//         .text('\u2190 DALR (-5.38 \u00B0F / 1000 ft) \u2192');
//     svg.append('line') // Legend green line
//         .attr('stroke', 'lightgreen')
//         .attr('stroke-width', 4)
//         .attr('x1', x(40))
//         .attr('y1', y(17))
//         .attr('x2', x(45))
//         .attr('y2', y(17));
//     svg.append('text') // Legend green line text label
//         .attr('class', 'dalrLabel')
//         .attr('x', x(47))
//         .attr('y', y(17))
//         .text('Forecast Max Temp DALR Line');
//     svg.append('line') // Legend red line
//         .attr('stroke', 'red')
//         .attr('stroke-width', 5)
//         .attr('x1', x(50))
//         .attr('y1', y(15.5))
//         .attr('x2', x(55))
//         .attr('y2', y(15.5));
//     svg.append('text') // Legend red line text label
//         .attr('class', 'dalrLabel')
//         .attr('x', x(57))
//         .attr('y', y(15.5))
//         .text('Sounding Temperature');
// }
