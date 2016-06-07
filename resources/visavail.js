function visavailChart() {

  // define chart layout
  var margin = {
    top: 70, // top margin includes title and legend
    right: 40, // right margin should provide space for last horz. axis title
    bottom: 20,
    left: 100 // left margin should provide space for y axis titles
  };

  var dataHeight = 18; // height of horizontal data bars
  var lineSpacing = 14; // spacing between horizontal data bars
  var paddingTopHeading = -50; // vertical space for heading
  var paddingBottom = 10; // vertical overhang of vertical grid lines on bottom
  var paddingLeft = -100; // space for y axis titles

  var width = 940 - margin.left - margin.right;

  // global div for tooltip
  var div = d3.select('body').append('div')
    .attr('class', 'tooltip')
    .style('opacity', 0);

  function chart(selection) {
    selection.each(function(dataset) {

      var no_of_datasets = dataset.length;
      var height = dataHeight * no_of_datasets + lineSpacing * no_of_datasets - 1;

      // parse data text strings to JavaScript date stamps
      var parseDate = d3.time.format('%Y-%m-%d');
      dataset.forEach(function(d) {
        d.data.forEach(function(d1) {
          d1[0] = parseDate.parse(d1[0]);
          d1[2] = d3.time.second.offset(d1[0], d.interval_s)
        });
      });

      // cluster data by dates to form time blocks
      dataset.forEach(function(series, series_i) {
        var tmp_data = [];
        var data_length = series.data.length;
        series.data.forEach(function(d, i) {
          if (i != 0 && i < data_length) {
            if (d[1] == tmp_data[tmp_data.length - 1][1]) {
              // the value has not changed since the last date
              tmp_data[tmp_data.length - 1][2] = d[2];
              tmp_data[tmp_data.length - 1][3] = 1;
            } else {
              // the value has changed since the last date
              d[3] = 0;
              tmp_data.push(d);
            }
          } else if (i == 0) {
            d[3] = 0;
            tmp_data.push(d);
          }
        });
        dataset[series_i].data = tmp_data;
      });

      // determine start and end dates among all nested datasets
      var start_date = 0;
      var end_date = 0;

      dataset.forEach(function(series, series_i) {
        if (series_i == 0) {
          start_date = series.data[0][0];
          end_date = series.data[series.data.length - 1][2];
        } else {
          if (series.data[0][0] < start_date) {
            start_date = series.data[0][0];
          }
          if (series.data[series.data.length - 1][2] > end_date)
            end_date = series.data[series.data.length - 1][2];
        }
      });

      // define scales
      var xScale = d3.time.scale()
        .domain([start_date, end_date])
        .range([0, width])
        .nice();

      // define axes
      var xAxis = d3.svg.axis()
        .scale(xScale)
        .orient('top');

      // create SVG element
      var svg = d3.select(this).append('svg')
        .attr('width', width + margin.left + margin.right)
        .attr('height', height + margin.top + margin.bottom)
        .append('g')
        .attr('transform', 'translate(' + margin.left + ',' + margin.top + ')');

      // create basic element groups
      svg.append('g').attr('id', 'g_title');
      svg.append('g').attr('id', 'g_axis');
      svg.append('g').attr('id', 'g_data');

      // create y axis labels
      svg.select('#g_axis').selectAll('text')
        .data(dataset)
        .enter()
        .append('text')
        .attr('x', paddingLeft)
        .attr('y', lineSpacing + dataHeight / 2)
        .text(function(d) {
          return d.measure
        })
        .attr('transform', function(d, i) {
          return 'translate(0,' + ((lineSpacing + dataHeight) * i) + ')';
        })
        .attr('class', 'ytitle');

      // create vertical grid
      svg.select('#g_axis').selectAll('line.vert_grid').data(xScale.ticks()).enter()
        .append('line')
        .attr({
          'class': 'vert_grid',
          'x1': function(d) {
            return xScale(d);
          },
          'x2': function(d) {
            return xScale(d);
          },
          'y1': 0,
          'y2': dataHeight * no_of_datasets + lineSpacing * no_of_datasets - 1 + paddingBottom
        });

      // create horizontal grid
      svg.select('#g_axis').selectAll('line.horz_grid').data(dataset).enter()
        .append('line')
        .attr({
          'class': 'horz_grid',
          'x1': 0,
          'x2': width,
          'y1': function(d, i) {
            return ((lineSpacing + dataHeight) * i) + lineSpacing + dataHeight / 2
          },
          'y2': function(d, i) {
            return ((lineSpacing + dataHeight) * i) + lineSpacing + dataHeight / 2
          }
        });

      // create x axis
      svg.select('#g_axis').append('g')
        .attr('class', 'axis')
        .call(xAxis);

      // make y groups for different data series
      var g = svg.select('#g_data').selectAll('.g_data')
        .data(dataset)
        .enter()
        .append('g')
        .attr('transform', function(d, i) {
          return 'translate(0,' + ((lineSpacing + dataHeight) * i) + ')';
        })
        .attr('class', 'dataset');

      // add data series
      g.selectAll('rect')
        .data(function(d) {
          return d.data
        })
        .enter()
        .append('rect')
        .attr('x', function(d) {
          return xScale(d[0])
        })
        .attr('y', lineSpacing)
        .attr('width', function(d) {
          return (xScale(d[2]) - xScale(d[0]))
        })
        .attr('height', dataHeight)
        .attr('class', function(d) {
          if (d[1] == 1) {
            return 'rect_has_data'
          } else {
            return 'rect_has_no_data'
          }
        })
        .on('mouseover', function(d, i) {
          var matrix = this.getScreenCTM().translate(+this.getAttribute('x'), +this.getAttribute('y'));
          div.transition()
            .duration(200)
            .style('opacity', .9);
          div.html(function() {
              var output = '';
              if (d[1] == 1) {
                  output = '<i class="icon-ok tooltip_has_data"></i>'
              } else {
                  output = '<i class="icon-cancel tooltip_has_no_data"></i>'
              }
              if (d[2] > d3.time.second.offset(d[0], 86400)) {
                return output + moment(parseDate(d[0])).format('l') + ' - ' + moment(parseDate(d[2])).format('l');
              } else {
                return output + moment(parseDate(d[0])).format('l');
              }
            })
            .style('left', function() {
              return window.pageXOffset + matrix.e + 'px'
            })
            .style('top', function() {
              return window.pageYOffset + matrix.f - 11 + 'px'
            })
            .style('height', dataHeight + 11 + 'px')
        })
        .on('mouseout', function() {
          div.transition()
            .duration(500)
            .style('opacity', 0);
        });

      // create title
      svg.select('#g_title')
        .append('text')
        .attr('x', paddingLeft)
        .attr('y', paddingTopHeading)
        .text('Data Availability Plot')
        .attr('class', 'heading');

      // create subtitle
      svg.select('#g_title')
        .append('text')
        .attr('x', paddingLeft)
        .attr('y', paddingTopHeading + 17)
        .text('from ' + moment(parseDate(start_date)).format('MMMM Y') + ' to ' + moment(parseDate(end_date)).format('MMMM Y'))
        .attr('class', 'subheading');

      // create legend
      var legend = svg.select('#g_title')
        .append('g')
        .attr('id', 'g_legend')
        .attr('transform', 'translate(0,-12)');

      legend.append('rect')
        .attr('x', width + margin.right - 120)
        .attr('y', paddingTopHeading)
        .attr('height', 15)
        .attr('width', 15)
        .attr('class', 'rect_has_data');

      legend.append('text')
        .attr('x', width + margin.right - 120 + 20)
        .attr('y', paddingTopHeading + 8.5)
        .text('Data available')
        .attr('class', 'legend');

      legend.append('rect')
        .attr('x', width + margin.right - 120)
        .attr('y', paddingTopHeading + 17)
        .attr('height', 15)
        .attr('width', 15)
        .attr('class', 'rect_has_no_data');

      legend.append('text')
        .attr('x', width + margin.right - 120 + 20)
        .attr('y', paddingTopHeading + 8.5 + 15 + 2)
        .text('No data available')
        .attr('class', 'legend');
    });
  }

  chart.width = function(_) {
    if (!arguments.length) return width;
    width = _;
    return chart;
  };

  return chart;
}
