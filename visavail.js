(function (global, factory) {
	typeof exports === 'object' && typeof module !== 'undefined' ? module.exports = factory() :
		typeof define === 'function' && define.amd ? define(factory) :
		(global.visavail = factory());
}(this, (function () {
	var visavail = {};
	function visavailChart(custom_options, dataset) {
		var d3 = window.d3 ? window.d3 : typeof require !== 'undefined' ? require("d3") : undefined;
		var moment = window.moment ? window.moment : typeof require !== 'undefined' ? require("moment") : undefined;

		if(!d3)
			throw new Error('Require D3.js before visavail script');
		if(!moment)
			throw new Error('Require moment before visavail script');
		var options = {
			id: "",
			id_div_container: "visavail_container",
			id_div_graph: "example",
			margin: {
				// top margin includes title and legend
				top: 65,

				// right margin should provide space for last horz. axis title
				right: 40,

				bottom: 20,

				// left margin should provide space for y axis titles
				left: 100,
			},
			width: 960,

            reduce_space_wrap: 35,
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

			display_date_range: [0, 0],

			//if true reminder to use the correct data format for d3
			custom_categories: false,
			isDateOnlyFormat: true,
			tooltip: {
				class: 'tooltip',
				//height of tooltip , correspond to line-height of class tooltip from css
				height: 11,
				//position: "top" is a div before bar follow the mouse only left, "overlay" follow the mouse left and height
				position: "top",
				left_spacing: 0
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
			date_in_utc: true,
			
			//copy the correct format from https://github.com/d3/d3-time-format/tree/master/locale
			// locale: {
			// 	"dateTime": "%A %e %B %Y, %X",
			// 	"date": "%d/%m/%Y",
			// 	"time": "%H:%M:%S",
			// 	"periods": ["AM", "PM"],
			// 	"days": moment.weekdays(),
			// 	"shortDays": moment.weekdaysShort(),
			// 	"months": moment.months(),
			// 	"shortMonths": moment.monthsShort()
			// },
			//use custom time format (for infomation about symbol visit: http://pubs.opengroup.org/onlinepubs/009604599/utilities/date.html)
			// customTimeFormat : {
			// 	formatMillisecond : ".%L",
			// 	formatSecond : ":%S",
			// 	formatMinute : "%H:%M",
			// 	formatHour : "%H",
			// 	formatDay : "%a %d",
			// 	formatWeek : "%b %d",
			// 	formatMonth : "%B",
			// 	formatYear : "%Y"
			// },
			zoom: {
				enabled: false,
				//return domain of current scale
				onzoom: function onzoom(){},
				//return event of at start
				onzoomstart: function onzoomstart(){},
				//return domain of current scale at the endo of the scale zoom
				onzoomend: function onzoomend(){},
			},
			onclickblock: function onclickblock(){},
			definedBlocks: false,
			graph:{
				type: "bar" ,
				width: 20,
				height:18
			},
			responsive: {
				enabled: false,
				onresize: function onresize(){},
			}
		}
		var date_format_local = moment().creationData().locale._longDateFormat;

		function convertMomentToStrftime(momentFormat){
			var replacements =  {"ddd":"a","dddd":"A","MMM":"b","MMMM":"B","lll":"c","DD":"d","D":"e","YYYY-MM-DD":"F","HH":"H","H":"k","hh":"I","h":"l","DDDD":"j","DDD":"-j","MM":"m","M":"-m","mm":"M","m":"-M","A":"p","a":"P","ss":"S","s":"-S","E":"u","d":"w","WW":"W","ll":"x","LTS":"X","YY":"y","YYYY":"Y","ZZ":"z","z":"Z","SSS":"f","%":"%"}
			var tokens = momentFormat.split(/( |\/|:)/);
			var strftime = tokens.map(function (token) {
				// Replace strftime tokens with moment formats
				if(token[0] == ":" || token[0] == "/" || token[0] == " ")
					return token
				else 
					if (replacements.hasOwnProperty(token))
						return "%" + replacements[token];
				// Escape non-token strings to avoid accidental formatting
				return token.length > 0 ? '[' + token + ']' : token;
				}).join('');
			return strftime;
		}
		function periodInLocal(){
			if (date_format_local.LTS.indexOf('a') > -1 ||  date_format_local.LTS.indexOf('A') > -1)
				return ["AM", "PM"];
			return [];
			
		}

		options.locale = {
			"dateTime": convertMomentToStrftime(date_format_local.LLLL),
			"date": convertMomentToStrftime(date_format_local.L),
			"time": convertMomentToStrftime(date_format_local.LTS),
			"periods": periodInLocal(),
			"days": moment.weekdays(),
			"shortDays": moment.weekdaysShort(),
			"months": moment.months(),
			"shortMonths": moment.monthsShort()
		};

		options.customTimeFormat = {
			formatMillisecond : ".%L",
			formatSecond : ":%S",
			formatMinute : "%H:%M",
			formatHour : "%H",
			formatDay : "%a %d",
			formatWeek : "%b %d",
			formatMonth : "%B",
			formatYear : "%Y"
		};

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

		if(!custom_options.hasOwnProperty("width"))
			options.width = document.getElementById(options.id_div_container).offsetWidth;

		options.id = "visavail-" + Math.random().toString(36).substring(7);
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
			.attr('class', "visavail-tooltip " + options.id)
			.attr('id', options.id)
			.append('div')
			.attr('class', (options.tooltip.class+"-"+options.tooltip.position ))
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
				var height = options.graph.height * noOfDatasets + options.lineSpacing * noOfDatasets - 1;

				// check how data is arranged
				for (var i = 0; i < dataset.length; i++) {
					if(dataset[i].description)
						options.tooltip.description = true;
					if (dataset[i].data[0] != null && dataset[i].data[0].length == 3 ){
						options.definedBlocks = true
						if(!Number.isInteger(dataset[i].data[0][1])) 
							options.custom_categories = true;
						break;
					}
				}

				// parse data text strings to JavaScript date stamps
				// var parseDate = d3.timeParse('%Y-%m-%d');
				// var parseDateTime = d3.timeParse('%Y-%m-%d %H:%M:%S');
				if(options.date_in_utc){
					var parseDate = function(date) {return moment.utc(date).toDate()};
					var parseDateTime =  function(date) {return moment.utc(date).toDate()};
				} else {
					var parseDate = function(date) {return moment(date).toDate()};
					var parseDateTime =  function(date) {return moment(date).toDate()};
					
				}
				
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
									d1[2] = d1[0];
									if(options.graph.type != "rhombus")
										console.error('Date/time format not recognized. Pick between \'YYYY-MM-DD\' or ' +
										'\'YYYY-MM-DD HH:MM:SS\'.');
								}
							}
						}
					});
				});
				var startDate = moment().year(2999),
					endDate = moment().year(0);

				// cluster data by dates to form time blocks
				dataset.forEach(function (series, seriesI) {
					var tmpData = [];
					var dataLength = series.data.length;
					series.data.forEach(function (d, i) {
						if(moment(d[2]).isSameOrAfter(endDate))
							endDate = d[2]
						if(moment(d[0]).isSameOrBefore(startDate))
							startDate = d[0]
						
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

				if(options.display_date_range[0] != 0)
					startDate = moment(options.display_date_range[0]);
				if(options.display_date_range[1] != 0)
					endDate = moment(options.display_date_range[1])
				// define scales
				var xScale = d3.scaleTime()
					.domain([startDate, endDate])
					.range([0, width])

					// define axes
				var xAxis = d3.axisTop(xScale)
					.scale(xScale)
					//.tickFormat(multiFormat);

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
					options.zoomed = d3.zoom()
						.scaleExtent([1,Infinity])
						.translateExtent([[0,0],[width, options.height]])
						.extent([[0, 0], [width, options.height]])
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
							// if(e == null)
							// 	zoomed();
							if (e && e.type === "brush") {
								return;
							}
							// if click, do nothing. otherwise, click interaction will be canceled.
							if (e && startEvent.clientX === e.clientX && startEvent.clientY === e.clientY) {
								return;
							}
							options["scale"] = d3.zoomTransform(svg.node())
							options.zoom.onzoomend.call(this, xScale.domain());
						});

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
					svg.call(options.zoomed)

				}
				svg.append('g').attr('id', 'g_data');

				if (options.ytitle) {
					// create y axis labels
					var labels = svg.select('#g_axis').append('g').attr('id', 'yAxis').selectAll('text')
						.data(dataset.slice(startSet, endSet))
						.enter();

					// text labels
					// labels.append('text')
					// 	.attr('x', options.paddingLeft)
					// 	.attr('y', options.lineSpacing + options.graph.height / 2)
					// 	.html(function (d) {
							
					// 	})
					// 	.each(wrap)
					// 	.attr('transform', function (d, i) {
					// 		return 'translate(0,' + ((options.lineSpacing + options.graph.height) * i) + ')';
					// 	})
					// 	.attr('class', function (d) {
					// 		var returnCSSClass = 'ytitle';
					// 		if (d.measure_url != null) {
					// 			returnCSSClass = returnCSSClass + ' link';
					// 		}
					// 		return returnCSSClass;
					// 	})
						// .on('click', function (d) {
						// 	if (d.measure_url != null) {
						// 		return window.open(d.measure_url);
						// 	}
						// 	return null;
						// })
					// 	.append('title')
					// 	.text(function (d) {
					// 		return d.measure;
					// 	})

					// HTML labels
					labels.append('foreignObject')
						.attr('x', options.paddingLeft)
						.attr('y', options.lineSpacing)
						.attr('transform', function (d, i) {
							return 'translate(0,' + ((options.lineSpacing + options.graph.height) * i) + ')';
						})
						.attr('width', -1 * options.paddingLeft)
						.attr('height', options.graph.height)
						.attr('class', function (d) {
							var returnCSSClass = 'ytitle';
							if (d.measure_url != null) {
								returnCSSClass = returnCSSClass + ' link';
							}
							return returnCSSClass;
						})
						.html(function (d) {
							if (d.measure_html != null) {
								return d.measure_html;
							} else {
								return d.measure;
							}
						})
						.on('click', function (d) {
							if (d.measure_url != null) {
								return window.open(d.measure_url);
							}
							return null;
						});

                    function wrap() {
                        var self = d3.select(this),
                            textLength = self.node().getComputedTextLength(),
                            text = self.text();
						 while (textLength > (options.margin.left + options.reduce_space_wrap) && text.length > 0) {
                            text = text.slice(0, -1);
                            self.text(text + '...');
                            textLength = self.node().getComputedTextLength();
                        }
                    }
				}
				//xAxis
				svg.select('#g_axis').append('g').attr('id', 'vGrid');

				function createVGrid(scale){
					svg.select('#vGrid')
						.selectAll('line.vert_grid')
						.data(scale.ticks())
						.enter()
						.append('line')
						.attr('x1', function (d) {
							return scale(d);
						})
						.attr('x2', function (d) {
							return scale(d);
						})
						.attr('y1', 0)
						.attr('y2', options.graph.height * noOfDatasets + options.lineSpacing * noOfDatasets - 1 + options.paddingBottom)
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
						return ((options.lineSpacing + options.graph.height) * i) + options.lineSpacing + options.graph.height / 2;
					})
					.attr('y2', function (d, i) {
						return ((options.lineSpacing + options.graph.height) * i) + options.lineSpacing + options.graph.height / 2;
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
						return 'translate(0,' + ((options.lineSpacing + options.graph.height) * i) + ')';
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
						return xForRect(d, xScale)
					})
					.attr('width', function (d) {
						return widthForRect(d, xScale)
					})
					.attr('y', options.lineSpacing)
					.attr('height', options.graph.height)
					.attr('transform',  function (d) {
						return transformForTypeOfGraph(d, xScale)
					})
					.attr('rx',  function (d) {
						return roundedRect()
					})
					.attr('ry',  function (d) {
						return roundedRect()
					})
					.attr('class', function (d) {
						if (options.custom_categories) {
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
								if (options.custom_categories) {
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
								if(document.body.clientWidth < (d3.event.pageX + div.property('offsetWidth' + options.tooltip.left_spacing)))
									return ((d3.event.pageX - div.property('offsetWidth')) - options.tooltip.left_spacing)+ 'px';
								return (d3.event.pageX + options.tooltip.left_spacing)+ 'px';
							})

						if(options.tooltip.position === "top"){
							div.style('top', function () {
								return window.pageYOffset + matrix.f - options.tooltip.height + 'px';
							})
							.style('height', options.graph.height + options.tooltip.height + 'px')
							if((width + options.margin.right) < (d3.event.pageX + div.property('offsetWidth'))){
								div.style('border-right', "solid thin rgb(0, 0, 0)")
									.style('border-left', "none");
							} else {
								div.style('border-left', "solid thin rgb(0, 0, 0)")
									.style('border-right', "none");
							}

						}
						if(options.tooltip.position === "overlay"){
							div.style('top', (d3.event.pageY) + 'px')
						}
					})
					.on('mouseout', function () {
						div.transition()
							.duration(500)
							.style('opacity', 0);
					})
					.on('click', function(d,i){
						options.onclickblock.call(this, d,i);
					})
					.on("mousemove", function(){

						div.style('left',  function () {
							if(document.body.clientWidth < (d3.event.pageX + div.property('offsetWidth') + options.tooltip.left_spacing))
								return ((d3.event.pageX - div.property('offsetWidth')) - options.tooltip.left_spacing)+ 'px';
							return (d3.event.pageX + options.tooltip.left_spacing)+ 'px';
						});

						if(options.tooltip.position === "top"){
							if(document.body.clientWidth < (d3.event.pageX + div.property('offsetWidth'))){
								div.style('border-right', "solid thin rgb(0, 0, 0)")
									.style('border-left', "none");
							} else {
								div.style('border-left', "solid thin rgb(0, 0, 0)")
									.style('border-right', "none");
							}
						}
						if(options.tooltip.position === "overlay"){
							div.style('top', (d3.event.pageY) + 'px')
						}
					});
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
						d3.selectAll('#' + options.id_div_graph +' g.tick').each(function (d, i) {
							if (isYearTick[i]) {
								d3.select(this)
									.attr('class', 'tick x_tick_emph');
							}
						});
						d3.selectAll('#' + options.id_div_graph +' .vert_grid').each(function (d, i) {
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
                        d3.selectAll('#' + options.id_div_graph +' g.tick').each(function (d, i) {
                            if (isMonthTick[i]) {
								d3.select(this)
									.attr('class', 'tick x_tick_emph');
							}
						});
						d3.selectAll('#' + options.id_div_graph + ' g.vert_grid').each(function (d, i) {
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
				if (!options.custom_categories && options.legend.enabled) {
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
					if ((d3.event.sourceEvent == null && d3.event.type !== "zoom"))
						return
					if(d3.event.transform.k || d3.event.transform.x){
						options.xScale = d3.event.transform.rescaleX(xScale);
						//position of tooltip when zooming or translate
						if (d3.event.sourceEvent !== null && d3.event.type == "zoom")
							div.style('left', (d3.event.pageX) + 'px')

						g.selectAll('rect')
							.attr('x', function (d) {
								return xForRect(d, options.xScale);
							})
							.attr('width', function (d) {
								return widthForRect(d, options.xScale);
							})
							.attr('transform',  function (d) {
								return transformForTypeOfGraph(d, options.xScale)
							})

						//change label x axis
						svg.select(".xAxis").call(xAxis.scale(options.xScale));
						//change v grid data axis
						svg.select('#vGrid').selectAll('line').remove();
						createVGrid(options.xScale);
						emphasize(options.xScale);

						options.zoom.onzoom.call(this, options.xScale.domain())
					}

				}
				//restore to previous zoom
				if(options.scale)
					svg.call(options.zoomed.transform, d3.zoomIdentity.translate(options.scale.x, options.scale.x).scale(options.scale.k))

				function xForRect(d, xScale){
					if(xScale(d[0]) < 0)
						return 0
					if(options.graph.type == "rhombus" || options.graph.type == "circle")
						return xScale(d[0]) - options.graph.width/2
					
					return xScale(d[0]);
				}
				function widthForRect(d, xScale){
					if ((xScale(d[2]) - xScale(d[0]))  < 0 || (xScale(d[2]) < 0 && xScale(d[1]) < 0))
						return 0;
					if(options.graph.type == "rhombus" || options.graph.type == "circle" ){
						if(xScale(d[0]) < 0)
							return 0
						return options.graph.width;
					}

					if (xScale(d[0]) < 0 && xScale(d[2]) > 0)
						return xScale(d[2])
					if (xScale(d[2]) < 0 && xScale(d[1]) > 0)
						return xScale(d[1])
					return ((xScale(d[2]) - xScale(d[0])));
				}

				function transformForTypeOfGraph(d, xScale){
					if((options.graph.type == "rhombus" || options.graph.type == "circle" )&& xScale(d[0]) > 0 )
						return  'rotate(45 '+ xScale(d[0]) + "  " + (options.graph.height/2 + options.lineSpacing)+")"
					else if((options.graph.type == "rhombus" || options.graph.type == "circle" ) && xScale(d[0]) <= 0 )
						return  'rotate(45 0 '+ (options.graph.height/2 + options.lineSpacing) +')'
				}

				function roundedRect(){
					if(options.graph.type == "circle")
						return 200000
					return 0  
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


		chart.displayDateRange = function (date_range) {
			if (!arguments.length) return  options.display_date_range;
			options.display_date_range = date_range ;
			if(!document.getElementById(options.id_div_graph) ){
                return chart;
            }
            return chart.updateGraph()
		};


		chart.resizeWidth = function(width){
			options.width = width;
			return chart.updateGraph()
		};

		chart.updateGraph = function(dataset){
			if(document.getElementById(options.id_div_graph) && document.getElementById(options.id_div_graph).innerHTML != "" ){
				document.getElementById(options.id_div_graph).innerHTML = "";
				if(dataset){
					return chart.createGraph(dataset)
				}
                d3.select('#' + options.id_div_graph)
						.call(chart);
			}
			return chart;
		};

		chart.createGraph = function(dataset){
			d3.select('#' + options.id_div_graph)
					.datum(dataset)
					.call(chart);
			return chart;
		};

		chart.destroy = function(_){
            if(document.getElementById(options.id_div_graph))
				document.getElementById(options.id_div_graph).innerHTML = "";
			if(document.getElementById(options.id))
				document.getElementById(options.id).remove();
			Object.keys(options).forEach(function (key) {
				options[key] = null;
			});
			return null;
		};

		options.responsive["function"] = function () {
            if (!options.id_div_container || !document.getElementById(options.id_div_graph) || document.getElementById(options.id_div_graph).innerHTML == "" ) {
                return;
            }
           chart.resizeWidth(document.getElementById(options.id_div_container).offsetWidth);
		}

		if(options.responsive.enabled){
			window.addEventListener("resize", options.responsive.function);
		}

		chart.createGraph(dataset);
		return chart;

	}

	visavail.generate = function (config, dataset) {
		return new visavailChart(config, dataset);
	};
	return visavail;
})));