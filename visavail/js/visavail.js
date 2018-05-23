(function (global, factory) {
	typeof exports === 'object' && typeof module !== 'undefined' ? module.exports = factory() :
		typeof define === 'function' && define.amd ? define(factory) :
		(global.visavail = factory());
}(this, (function () {
	var visavail = {};
	function visavailChart(custom_options, dataset) {

		var options = {
			id_div_container: "visavail_container",
			id_div_graph: "example",
			margin: {
				// top margin includes title and legend
				top: 70,

				// right margin should provide space for last horz. axis title
				right: 40,

				bottom: 20,

				// left margin should provide space for y axis titles
				left: 100,
			},
			width: 940,
			barHeight: 18,
			lineSpacing: 14,
			paddingTopHeading: -50,
			paddingBottom: 10,
			paddingLeft: -100,
			// year ticks to be emphasized or not 
			emphasizeYearTicks: true,
			emphasizeMonthTicks: true,
			// define chart pagination
			// max. no. of datasets that is displayed, 0: all
			maxDisplayDatasets: 0,
			// dataset that is displayed first in the current
			// display, chart will show datasets "curDisplayFirstDataset" to
			// "curDisplayFirstDataset+maxDisplayDatasets"
			curDisplayFirstDataset: 0,
			// range of dates that will be shown
			// if from-date (1st element) or to-date (2nd element) is zero,
			// it will be determined according to your data (default: automatically)

			displayDateRange: [0, 0],

			//if true reminder to use the correct data format for d3
			customCategories: false,
			isDateOnlyFormat: true,
			tooltip: {
				class: 'tooltip',
				//height of tooltip , correspond to line-height of class tooltip from css 
				height: 11
			},

			legend: {
				enabled: true,
				has_no_data_text: 'No Data available',
				has_data_text: 'Data available'

			},
			// title of chart is drawn or not (default: true)
			title: {
				enabled: true,
				text: 'Data Availability Plot',
			},
			sub_title: {
				enabled: true,
				from_text: 'from',
				to_text: 'to',
			},
			// if false remeber to set the padding and margin
			ytitle: true,
			//custom icon call (for example font awesome)
			icon:{
				class_has_data : 'fas fa-fw fa-check',
				class_has_no_data: 'fas fa-fw fa-times'
			},
			//copy the correct format from https://github.com/d3/d3-time-format/tree/master/locale
			locale: {
				"dateTime": "%A %e %B %Y, %X",
				"date": "%d/%m/%Y",
				"time": "%H:%M:%S",
				"periods": ["AM", "PM"],
				"days": moment.weekdays(),
				"shortDays": moment.weekdaysShort(),
				"months": moment.months(),
				"shortMonths": moment.monthsShort()
			},
			//use custom time format (for infomation about symbol visit: http://pubs.opengroup.org/onlinepubs/009604599/utilities/date.html)
			customTimeFormat : {
				formatMillisecond : ".%L",
				formatSecond : ":%S",
				formatMinute : "%H:%M",
				formatHour : "%H",
				formatDay : "%a %d",
				formatWeek : "%b %d",
				formatMonth : "%B",
				formatYear : "%Y"
			},
			zoom: {
				enabled: false,
				//return domain of current scale 
				onzoom: function onzoom(){},
				//return event of at start 
				onzoomstart: function onzoomstart(){},
				//return domain of current scale at the endo of the scale zoom
				onzoomend: function onzoomend(){},
			},
			responsive: true
		}

		if (custom_options != null) {
			for (var key in custom_options) {
				if (options.hasOwnProperty(key)) {
					if (typeof options[key] == 'object') {
						for (var sub_key in custom_options[key]) {
							if (options[key].hasOwnProperty(sub_key))
								options[key][sub_key] = custom_options[key][sub_key];
						}
					} else
						options[key] = custom_options[key];
				}
			}
		}

		//function for custom tick format of x axis
		function multiFormat(date) {
			return (d3.timeSecond(date) < date ? d3.timeFormat(options.customTimeFormat.formatMillisecond)
			: d3.timeMinute(date) < date ? d3.timeFormat(options.customTimeFormat.formatSecond)
			: d3.timeHour(date) < date ? d3.timeFormat(options.customTimeFormat.formatMinute)
			: d3.timeDay(date) < date ? d3.timeFormat(options.customTimeFormat.formatHour)
			: d3.timeMonth(date) < date ? (d3.timeWeek(date) < date ? d3.timeFormat(options.customTimeFormat.formatDay) : d3.timeFormat(options.customTimeFormat.formatWeek))
			: d3.timeYear(date) < date ? d3.timeFormat(options.customTimeFormat.formatMonth)
			: d3.timeFormat(options.customTimeFormat.formatYear))(date);
		}
		
		// global div for tooltip
		var div = d3.select('body').append('div')
			.attr('class', options.tooltip.class)
			.style('opacity', 0);

		function chart(selection) {
			selection.each(function drawGraph(dataset) {
				//set to locale with moment
				d3.timeFormatDefaultLocale(options.locale);
				var width = options.width - options.margin.left - options.margin.right;
				var maxPages = 0;
				var startSet;
				var endSet;
				if (options.maxDisplayDatasets !== 0) {
					startSet = options.curDisplayFirstDataset;
					if (options.curDisplayFirstDataset + options.maxDisplayDatasets > dataset.length) {
						endSet = dataset.length;
					} else {
						endSet = options.curDisplayFirstDataset + options.maxDisplayDatasets;
					}
					maxPages = Math.ceil(dataset.length / options.maxDisplayDatasets);
				} else {
					startSet = 0;
					endSet = dataset.length;
				}

				// append data attribute in HTML for pagination interface
				selection.attr('data-max-pages', maxPages);

				var noOfDatasets = endSet - startSet;
				var height = options.barHeight * noOfDatasets + options.lineSpacing * noOfDatasets - 1;

				// check how data is arranged
				options.definedBlocks = false;
				for (var i = 0; i < dataset.length; i++) {
					if(dataset[i].description)
						options.tooltip.description = true;
					if (dataset[i].data[0].length === 3) {
						options.definedBlocks = true;
						break;
					} else {
						if (options.definedBlocks) {
							throw new Error('Detected different data formats in input data. Format can either be ' +
								'continuous data format or time gap data format but not both.');
						}
					}
				}
				
				// parse data text strings to JavaScript date stamps
				var parseDate = d3.timeParse('%Y-%m-%d');
				var parseDateTime = d3.timeParse('%Y-%m-%d %H:%M:%S');
				var parseDateRegEx = new RegExp(/^\d{4}-\d{2}-\d{2}$/);
				var parseDateTimeRegEx = new RegExp(/^\d{4}-\d{2}-\d{2} \d{2}:\d{2}:\d{2}$/);

				dataset.forEach(function (d) {
					d.data.forEach(function (d1) {
						if (!(d1[0] instanceof Date)) {
							if (parseDateRegEx.test(d1[0])) {
								// d1[0] is date without time data
								d1[0] = parseDate(d1[0]);
							} else if (parseDateTimeRegEx.test(d1[0])) {
								// d1[0] is date with time data
								d1[0] = parseDateTime(d1[0]);
								options.isDateOnlyFormat = false;
							} else {
								throw new Error('Date/time format not recognized. Pick between \'YYYY-MM-DD\' or ' +
									'\'YYYY-MM-DD HH:MM:SS\'.');
							}

							if (!options.definedBlocks) {
								d1[2] = d3.timeSecond.offset(d1[0], d.interval_s);
							} else {
								if (parseDateRegEx.test(d1[2])) {
									// d1[2] is date without time data
									d1[2] = parseDate(d1[2]);
								} else if (parseDateTimeRegEx.test(d1[2])) {
									// d1[2] is date with time data
									d1[2] = parseDateTime(d1[2]);
								} else {
									throw new Error('Date/time format not recognized. Pick between \'YYYY-MM-DD\' or ' +
										'\'YYYY-MM-DD HH:MM:SS\'.');
								}
							}
						}
					});
				});

				// cluster data by dates to form time blocks
				dataset.forEach(function (series, seriesI) {
					var tmpData = [];
					var dataLength = series.data.length;
					series.data.forEach(function (d, i) {
						if (i !== 0 && i < dataLength) {
							if (d[1] === tmpData[tmpData.length - 1][1]) {
								// the value has not changed since the last date
								if (options.definedBlocks) {
									if (tmpData[tmpData.length - 1][2].getTime() === d[0].getTime()) {
										// end of old and start of new block are the same
										tmpData[tmpData.length - 1][2] = d[2];
										tmpData[tmpData.length - 1][3] = 1;
									} else {
										tmpData.push(d);
									}
								} else {
									tmpData[tmpData.length - 1][2] = d[2];
									tmpData[tmpData.length - 1][3] = 1;
								}
							} else {
								// the value has changed since the last date
								d[3] = 0;
								if (!options.definedBlocks) {
									// extend last block until new block starts
									tmpData[tmpData.length - 1][2] = d[0];
								}
								tmpData.push(d);
							}
						} else if (i === 0) {
							d[3] = 0;
							tmpData.push(d);
						}
					});
					dataset[seriesI].disp_data = tmpData;
				});
		
				// determine start and end dates among all nested datasets
				var startDate = options.displayDateRange[0];
				var endDate = options.displayDateRange[1];
				if(startDate !== 0)
					startDate = moment(startDate)
				if(endDate !== 0)
					endDate = moment(endDate)

				if(options.displayDateRange[0] === 0 || options.displayDateRange[1] === 0){
					dataset.forEach(function (series, seriesI) {
						if (series.disp_data.length > 0) {
							if (startDate === 0 && endDate === 0) {
								startDate = series.disp_data[0][0];
								endDate = series.disp_data[series.disp_data.length - 1][2];
							} else {
								if (options.displayDateRange[0] === 0 && series.disp_data[0][0] < startDate)
									startDate = series.disp_data[0][0];
								if (options.displayDateRange[1] === 0 && series.disp_data[series.disp_data.length - 1][2] > endDate)
									endDate = series.disp_data[series.disp_data.length - 1][2];
							}
						}
					});
				}

				// define scales
				if(options.xScale){
					var xScale = options.xScale.range([0, width]);
				} else {
					var xScale = d3.scaleTime()
						.domain([startDate, endDate])
						.range([0, width])
				}
					// define axes
				var xAxis = d3.axisTop()
					.scale(xScale)
					.tickFormat(multiFormat);
				
				// create SVG element
				var svg = d3.select(this).append('svg')
					.attr('width', width + options.margin.left + options.margin.right)
					.attr('height', height + options.margin.top + options.margin.bottom)
					.append('g')
					.attr('transform', 'translate(' + options.margin.left + ',' + options.margin.top + ')');

				// create basic element groups
				svg.append('g').attr('id', 'g_title');
				svg.append('g').attr('id', 'g_axis');
				
				if (options.zoom.enabled) {
					//implement zooming
					var zoom = d3.zoom()
					.on("zoom", zoomed)
					.on("start", function () {
						var e = d3.event;
						if (e && e.type === "brush") {
							return;
						}
						startEvent = e;
						options.zoom.onzoomstart.call(this, e);
					})
					.on('end', function () {
						var e = d3.event.sourceEvent;
						if (e && e.type === "brush") {
							return;
						}
						// if click, do nothing. otherwise, click interaction will be canceled.
						if (e && startEvent.clientX === e.clientX && startEvent.clientY === e.clientY) {
							return;
						}
						options.zoom.onzoomend.call(this, options.xScale.domain());
					});
			;
					// this rect acts as a layer so that zooming works anywhere in the svg. otherwise, 
					// if zoom is called on just svg, zoom functionality will only work when the pointer is over a block.
					svg.append('rect')
						.attr('id', 'zoom')
						.attr('width', width)
						.attr('height', height)
						.attr('fill-opacity', 0)
						.attr('cursor', "ew-resize")
						.attr('x', 0)
						.attr('y', 0)
					svg.call(zoom)
				}
				svg.append('g').attr('id', 'g_data');
				
				if (options.ytitle) {
					// create y axis labels
					var labels = svg.select('#g_axis').append('g').attr('id', 'yAxis').selectAll('text')
						.data(dataset.slice(startSet, endSet))
						.enter();

					// text labels
					labels.append('text')
						.attr('x', options.paddingLeft)
						.attr('y', options.lineSpacing + options.barHeight / 2)
						.text(function (d) {
							if (!(d.measure_html != null)) {
								return d.measure;
							}
						})
						.attr('transform', function (d, i) {
							return 'translate(0,' + ((options.lineSpacing + options.barHeight) * i) + ')';
						})
						.attr('class', function (d) {
							var returnCSSClass = 'ytitle';
							if (d.measure_url != null) {
								returnCSSClass = returnCSSClass + ' link';
							}
							return returnCSSClass;
						})
						.on('click', function (d) {
							if (d.measure_url != null) {
								return window.open(d.measure_url);
							}
							return null;
						});

					// HTML labels
					labels.append('foreignObject')
						.attr('x', options.paddingLeft)
						.attr('y', options.lineSpacing)
						.attr('transform', function (d, i) {
							return 'translate(0,' + ((options.lineSpacing + options.barHeight) * i) + ')';
						})
						.attr('width', -1 * options.paddingLeft)
						.attr('height', options.barHeight)
						.attr('class', 'ytitle')
						.html(function (d) {
							if (d.measure_html != null) {
								return d.measure_html;
							}
						});
				}
				//xAxis
				svg.select('#g_axis').append('g').attr('id', 'vGrid');
				
				function createVGrid(scale){
					svg.select('#vGrid').selectAll('line.vert_grid').data(scale.ticks())
						.enter()
						.append('line')
						.attr('x1', function (d) {
							return scale(d);
						})
						.attr('x2', function (d) {
							return scale(d);
						})
						.attr('y1', 0)
						.attr('y2', options.barHeight * noOfDatasets + options.lineSpacing * noOfDatasets - 1 + options.paddingBottom)
						.attr('class', 'vert_grid');
				}

				// create vertical grid
				if (noOfDatasets) {
					createVGrid(xScale)
				}

				// create horizontal grid
				svg.select('#g_axis').append('g').attr('id', 'hGrid').selectAll('line.horz_grid').data(dataset)
					.enter()
					.append('line')
					.attr('x1', 0)
					.attr('x2', width)
					.attr('y1', function (d, i) {
						return ((options.lineSpacing + options.barHeight) * i) + options.lineSpacing + options.barHeight / 2;
					})
					.attr('y2', function (d, i) {
						return ((options.lineSpacing + options.barHeight) * i) + options.lineSpacing + options.barHeight / 2;
					})
					.attr('class', 'horz_grid');
					
				// create x axis
				if (noOfDatasets) {
					svg.select('#g_axis').append('g')
						.attr('class', 'xAxis')
						.call(xAxis);
				}

				
				// make y groups for different data series
				var g = svg.select('#g_data').selectAll('.g_data')
					.data(dataset.slice(startSet, endSet))
					.enter()
					.append('g')
					.attr('transform', function (d, i) {
						return 'translate(0,' + ((options.lineSpacing + options.barHeight) * i) + ')';
					})
					.attr('cursor', 'pointer')
					.attr('class', 'dataset');

				// add data series
				g.selectAll('rect')
					.data(function (d) {
						return d.disp_data;
					})
					.enter()
					.append('rect')
					.attr('x', function (d) {
						if(xScale(d[0]) < 0)
							return 0
						return xScale(d[0]);
					})
					.attr('width', function (d) {
						if ((xScale(d[2]) - xScale(d[0]))  < 0 || (xScale(d[2]) < 0 && xScale(d[1]) < 0))
							return 0;
						if (xScale(d[0]) < 0 && xScale(d[2]) > 0)
							return xScale(d[2]) 
						if (xScale(d[2]) < 0 && xScale(d[1]) > 0)
							return xScale(d[1]) 
						return ((xScale(d[2]) - xScale(d[0])));
					})
					.attr('y', options.lineSpacing)
					.attr('height', options.barHeight)
					.attr('class', function (d) {
						if (options.definedBlocks) {
							var series = dataset.filter(
								function (series) {
									return series.disp_data.indexOf(d) >= 0;
								}
							)[0];
							if (series && series.categories) {
								d3.select(this).attr('fill', series.categories[d[1]].color);
								return '';
							}
						} else {
							if (d[1] === 1) {
								// data available
								return 'rect_has_data';
							} else {
								// no data available
								return 'rect_has_no_data';
							}
						}
					})
					.on('mouseover', function (d, i) {
						var matrix = this.getScreenCTM().translate(+this.getAttribute('x'), +this.getAttribute('y'));
						div.transition()
							.duration(200)
							.style('opacity', 0.9);
						div.html(function () {
							
								var output = '';
								if (options.definedBlocks) {
									// custom categories: display category name
									output = '&nbsp;' + d[1] + '&nbsp;';
								} else {
									if (d[1] === 1) {
										// checkmark icon
										output = '<i class=" '+ options.icon.class_has_data +' tooltip_has_data"></i>';
									} else {
										// cross icon
										output = '<i class=" '+ options.icon.class_has_no_data + ' tooltip_has_no_data"></i>';
									}
								}
								if(options.tooltip.description){
									var series = dataset.filter(
										function (series) {
											return series.disp_data.indexOf(d) >= 0;
										}
									)[0];
									if (series && series.description && series.description[i]) {
										output += ' ' + series.description[i] + ' ';
									}
								}
								if (options.isDateOnlyFormat) {
									if (d[2] > d3.timeSecond.offset(d[0], 86400)) {
										return output + moment(d[0]).format('l') +
											' - ' + moment(d[2]).format('l');
									}
									return output + moment(d[0]).format('l');
								} else {
									if (d[2] > d3.timeSecond.offset(d[0], 86400)) {	
										return output + moment(d[0]).format('l') + ' ' +
											moment(d[0]).format('LTS') + ' - ' +
											moment(d[2]).format('l') + ' ' +
											moment(d[2]).format('LTS');
									}
									return output + moment(d[0]).format('LTS') + ' - ' +
										moment(d[2]).format('LTS');
								}
							})
							.style('left', function () {
								return (d3.event.pageX) + 'px';
							})
							.style('top', function () {
								return window.pageYOffset + matrix.f - options.tooltip.height + 'px';
							})
							.style('height', options.barHeight + options.tooltip.height + 'px');
					})
					.on('mouseout', function () {
						div.transition()
							.duration(500)
							.style('opacity', 0);
					})
					.on("mousemove", function(){
					
						div.style('left', (d3.event.pageX) + 'px')
					})
					;
				// rework ticks and grid for better visual structure
				function isYear(t) {
					return +t === +(new Date(t.getFullYear(), 0, 1, 0, 0, 0));
				}

				function isMonth(t) {
					return +t === +(new Date(t.getFullYear(), t.getMonth(), 1, 0, 0, 0));
				}

				// year emphasis
				// ensure year emphasis is only active if years are the biggest clustering unit
				function emphasize(scale){
					var xTicks = scale.ticks();
					var isYearTick = xTicks.map(isYear);
					var isMonthTick = xTicks.map(isMonth);

					if (options.emphasizeYearTicks &&
						!(isYearTick.every(function (d) {
							return d === true;
						})) &&
						isMonthTick.every(function (d) {
							return d === true;
						})) {
						d3.selectAll('g.tick').each(function (d, i) {
							if (isYearTick[i]) {
								d3.select(this)
									.attr('class', 'tick x_tick_emph');
							}
						});
						d3.selectAll('.vert_grid').each(function (d, i) {
							if (isYearTick[i]) {
								d3.select(this)
									.attr('class', 'vert_grid vert_grid_emph');
							}
						});
					}
					// month emphasis
					// ensure year emphasis is only active if month are the biggest clustering unit
					if (options.emphasizeMonthTicks &&
						!isMonthTick.every(function (d) {
							return d === true;
						})) {
						d3.selectAll('g.tick').each(function (d, i) {
							if (isMonthTick[i]) {
								d3.select(this)
									.attr('class', 'tick x_tick_emph');
							}
						});
						d3.selectAll('.vert_grid').each(function (d, i) {
							if (isMonthTick[i]) {
								d3.select(this)
									.attr('class', 'vert_grid vert_grid_emph');
							}
						});
					}
				}
				emphasize(xScale);

				// create title
				if (options.title.enabled) {
					svg.select('#g_title')
						.append('text')
						.attr('x', options.paddingLeft)
						.attr('y', options.paddingTopHeading)
						.text(options.title.text)
						.attr('class', 'heading');
				}
				// create subtitle
				if (options.sub_title.enabled) {	
					var subtitleText = '';
					if (noOfDatasets) {
						if (options.isDateOnlyFormat) {
							subtitleText = options.sub_title.from_text + ' ' + moment(startDate).format('MMMM Y') +
								' ' + options.sub_title.to_text + ' ' +
								moment(endDate).format('MMMM Y');
						} else {
							subtitleText = options.sub_title.from_text + ' ' + moment(startDate).format('l') + ' ' +
								moment(startDate).format('LTS') + ' ' + options.sub_title.to_text + ' ' +
								moment(endDate).format('l') + ' ' +
								moment(endDate).format('LTS');
						}
					}

					svg.select('#g_title')
						.append('text')
						.attr('x', options.paddingLeft)
						.attr('y', options.paddingTopHeading + 17)
						.text(subtitleText)
						.attr('class', 'subheading');
				}
				// create legend
				if (!options.definedBlocks && options.legend.enabled) {
					var legend = svg.select('#g_title')
						.append('g')
						.attr('id', 'g_legend')
						.attr('transform', 'translate(0,-12)');

					legend.append('rect')
						.attr('x', width + options.margin.right - 150)
						.attr('y', options.paddingTopHeading)
						.attr('height', 15)
						.attr('width', 15)
						.attr('class', 'rect_has_data');

					legend.append('text')
						.attr('x', width + options.margin.right - 150 + 20)
						.attr('y', options.paddingTopHeading + 8.5)
						.text(options.legend.has_data_text)
						.attr('class', 'legend');

					legend.append('rect')
						.attr('x', width + options.margin.right - 150)
						.attr('y', options.paddingTopHeading + 17)
						.attr('height', 15)
						.attr('width', 15)
						.attr('class', 'rect_has_no_data');

					legend.append('text')
						.attr('x', width + options.margin.right - 150 + 20)
						.attr('y', options.paddingTopHeading + 8.5 + 15 + 2)
						.text(options.legend.has_no_data_text)
						.attr('class', 'legend');
				}

				// function for zoomed	
				function zoomed() {
					//prevent event null for type != zooming
					if (d3.event.sourceEvent == null && d3.event.type !== "zoom")
						return
					options.xScale = d3.event.transform.rescaleX(xScale);
					//position of tooltip when zooming or translate
					if (d3.event.sourceEvent !== null && d3.event.type == "zoom")
						div.style('left', (d3.event.pageX) + 'px')

					g.selectAll('rect')
						.attr('x', function (d) {
							if(options.xScale(d[0]) < 0)
								return 0
							return options.xScale(d[0]);
						})
						.attr('width', function (d) {
							if ((options.xScale(d[2]) - options.xScale(d[0]))  < 0 || (options.xScale(d[2]) < 0 && options.xScale(d[1]) < 0))
								return 0;
							if (options.xScale(d[0]) < 0 && options.xScale(d[2]) > 0)
								return options.xScale(d[2]) 
							if (options.xScale(d[2]) < 0 && options.xScale(d[1]) > 0)
								return options.xScale(d[1]) 
							return ((options.xScale(d[2]) - options.xScale(d[0])));
						})

					//change label x axis
					svg.select(".xAxis").call(xAxis.scale(options.xScale));
					//change v grid data axis
					svg.select('#vGrid').selectAll('line').remove();		
					createVGrid(options.xScale);
					emphasize(options.xScale);

					options.zoom.onzoom.call(this, options.xScale.domain())

				}			
			});
		};


		chart.width = function (_) {
			if (!arguments.length) return options.width;
			options.width = _;
			return chart;
		};

		chart.drawTitle = function (_) {
			if (!arguments.length) return options.title.enabled;
			options.title.enabled = _;
			return chart;
		};

		chart.maxDisplayDatasets = function (_) {
			if (!arguments.length) return  options.maxDisplayDatasets;
			options.maxDisplayDatasets = _;
			return chart;
		};

		chart.curDisplayFirstDataset = function (_) {
			if (!arguments.length) return  options.curDisplayFirstDataset;
			options.curDisplayFirstDataset = _;
			return chart;
		};

		

		chart.emphasizeYearTicks = function (_) {
			if (!arguments.length) return  options.emphasizeYearTicks;
			options.emphasizeYearTicks = _;
			return chart;
		};
		

		chart.displayDateRange = function (id_element, date_range) {
			if (!arguments.length) return  options.displayDateRange;
			options.displayDateRange = date_range ;
			return chart.updateGraph(id_element)
		};

		chart.resizeWidth = function(id_element, width){
			options.width = width;
			return chart.updateGraph(id_element)
		};

		chart.updateGraph = function(id_element, dataset){
			document.getElementById(id_element).innerHTML = "";
			if(dataset){
				return createGraph(id_element,dataset)
			}
			d3.select('#' + id_element)
					.call(chart);
			return chart;
		};

		chart.createGraph = function(id_element, dataset){
			d3.select('#' + id_element)
					.datum(dataset)
					.call(chart);
			return chart;
		};
				// function for resposive
		function responsive() {
			chart.resizeWidth(options.id_div_graph, document.getElementById(options.id_div_container).offsetWidth);
		}

		if(options.responsive)
			window.addEventListener("resize", responsive);
		
		chart.createGraph(options.id_div_graph, dataset);
		return chart;

	}

	visavail.generate = function (config, dataset) {
		return new visavailChart(config, dataset);
	};
	return visavail;
})));