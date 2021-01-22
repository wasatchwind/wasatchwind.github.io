function draw_lapse_chart (data, maxTemp, dalr) {
    let margin = {top: 15, right: 25, bottom: 80, left: 90};
    let width = 880 - margin.left - margin.right;
    let height = 640 - margin.top - margin.bottom;
    let polygon = 'M 192 0, L 765 545, L 880 545, L 880 0, L 446 0';
    let svg = d3.select('#skewt').append('svg')
        .attr('width', width + margin.left + margin.right)
        .attr('height', height + margin.top + margin.bottom)
        .append('g')
        .attr('transform', 'translate(' + margin.left + ',' + margin.top + ')');
    let x = d3.scaleLinear()
        .range([0, width])
        .domain([0,100]);
    let y = d3.scaleLinear()
        .range([height, 0])
        .domain([4,18]);
    let xAxisGrid = d3.range(0,105,5);
    let yAxisGrid = d3.axisLeft(y)
        .tickSize(-innerWidth)
        .tickFormat('')
        .ticks(14);
    let tempLine = d3.line()
        .x(function(d) { return x((d.Temp_c * 9 / 5) + 32); })
        .y(function(d) { return y(d.Altitude_m * 3.281 / 1000); });
    
    svg.append('g') // Draw horizontal y axis gridlines
        .attr('class', 'yTicks')
        .call(yAxisGrid);
    svg.append('g').selectAll("lapselines") // Draw skewed DALR x axis gridlines
        .data(xAxisGrid).enter().append("line")
        .attr('class', 'xTicks')
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
        .attr('fill', '#000050')
        .attr('x', 0 - margin.left)
        .attr('y', 0 - margin.top)
        .attr('width', width)
        .attr('height', margin.top);
    svg.append('g').append('rect') // Draw blank rectangle to clip temp line left of chart
        .attr('fill', '#000050')
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
        .attr('transform', 'translate(' +  (width - margin.left - margin.right)/2 + ',' + (height + margin.top + 60) + ')')
        .attr('class', 'xLabel')
        .text('Temp \u00B0F');
    svg.append('text') // y axis label (Altitude)
        .attr('transform', 'rotate(-90)')
        .attr('y', -65)
        .attr('x', 0 - (height / 2))
        .attr('class', 'yLabel')
        .text('Altitude ( x1,000 ft )');
    svg.append('line') // Draw Max Temp DALR line
        .attr('stroke', 'lightgreen')
        .attr('stroke-width', 2)
        .attr('x1', x(maxTemp))
        .attr('y1', y(4.229))
        .attr('x2', x(0))
        .attr('y2', y((maxTemp/dalr)+4.229));
    svg.append('path') // Draw blank gray triangle to clip upper right grid
        .attr('d', polygon)
        .attr('fill', 'rgb(100,100,100)');
    svg.append('text') // DALR label
        .attr('x', 460)
        .attr('y', -160)
        .attr('transform', 'rotate(43)')
        .attr('class', 'dalrLabel')
        .text('\u2190 DALR (-5.38 \u00B0F / 1000 ft) \u2192');
    svg.append('line') // Legend red line
        .attr('stroke', 'red')
        .attr('stroke-width', 5)
        .attr('x1', 400)
        .attr('y1', 40)
        .attr('x2', 450)
        .attr('y2', 40);
    svg.append('text') // Legend red line text label
        .attr('x', 480)
        .attr('y', 45)
        .attr('class', 'dalrLabel')
        .text('Sounding Temp');
    svg.append('line') // Legend green line
        .attr('stroke', 'lightgreen')
        .attr('stroke-width', 4)
        .attr('x1', 400)
        .attr('y1', 90)
        .attr('x2', 450)
        .attr('y2', 90);
    svg.append('text') // Legend green line text label
        .attr('x', 480)
        .attr('y', 95)
        .attr('class', 'dalrLabel')
        .text('Forecast Max Temp');
}
