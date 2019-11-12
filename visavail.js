(function (global, factory) {
	typeof exports === 'object' && typeof module !== 'undefined' ? module.exports = factory() :
		typeof define === 'function' && define.amd ? define(factory) :
		(global.visavail = factory());
}(this, (function () {
	var visavail = {};

	//ie11 fixing 

	Number.isInteger = Number.isInteger || function(value) {
		return typeof value === "number" && 
			   isFinite(value) && 
			   Math.floor(value) === value;
	};
	Element.prototype.remove =  Element.prototype.remove || function() {
			if (this.parentNode) {
				this.parentNode.removeChild(this);
			}
		};


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
			moment_locale: window.navigator.userLanguage || window.navigator.language,
            reduce_space_wrap: 35,
			line_spacing: 26,
			padding:{
				top: -49,
				bottom: 0,
				right: 0,
				left: -100
			},
			// year ticks to be emphasized or not
			emphasize_year_ticks: true,
			emphasize_month_ticks: true,
			ticks_for_graph: 6,
			// define chart pagination
			// max. no. of datasets that is displayed, 0: all
			max_display_datasets: 0,
			// dataset that is displayed first in the current
			// display, chart will show datasets "cur_display_first_dataset" to
			// "cur_display_first_dataset+max_display_datasets"
			cur_display_first_dataset: 0,
			// range of dates that will be shown
			// if from-date (1st element) or to-date (2nd element) is zero,
			// it will be determined according to your data (default: automatically)
			display_date_range: [0, 0],
			//if true reminder to use the correct data format for d3
			custom_categories: false,
			is_date_only_format: true,
		
			date_in_utc: true,
			date_is_descending: false,
			// if false remeber to set the padding and margin
			show_y_title: true,
			defined_blocks: false,
			tooltip: {
				class: 'tooltip',
				//height of tooltip , correspond to line-height of class tooltip from css
				height: 11,
				//position: "top" is a div before bar follow the mouse only left, "overlay" follow the mouse left and height
				position: "top",
				left_spacing: 0,
				date_plus_time: false,
				only_first_date: false,
				duration: 150,
				hover_zoom: {
					enabled: false,
					ratio: .4,
				}
			},
			legend: {
				enabled: true,
				line_space: 12,
				offset: 5,
				has_no_data_text: 'No Data available',
				has_data_text: 'Data available'
			},
			// title of chart is drawn or not (default: true)
			title: {
				enabled: true,
				text: 'Data Availability Plot',
				line_spacing: 16
			},
			sub_title: {
				enabled: true,
				from_text: 'from',
				to_text: 'to',
				line_spacing: 16
			},
			//custom icon call (for example font awesome)
			icon:{
				class_has_data : 'fas fa-fw fa-check',
				class_has_no_data: 'fas fa-fw fa-times'
			},
			zoom: {
				enabled: false,
				//return domain of current scale
				onZoom: function onZoom(){},
				//return event of at start
				onZoomStart: function onZoomStart(){},
				//return domain of current scale at the endo of the scale zoom
				onZoomEnd: function onZoomEnd(){},
			},
			onClickBlock: function onclickblock(){},
			graph:{
				type: "bar" ,
				width: 20,
				height:18,
				hover_zoom: 5
			},
			responsive: {
				enabled: false,
				onresize: function onresize(){},
			},
			
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
			custom_time_format : {
				format_millisecond : ".%L",
				format_second : ":%S",
				format_minute : "%H:%M",
				format_hour : "%H",
				format_day : "%a %d",
				format_week : "%b %d",
				format_month : "%B",
				format_year : "%Y"
			},
		}
		function convertMomentToStrftime(momentFormat){
			var replacements =  {"ddd":"a","dddd":"A","MMM":"b","MMMM":"B","lll":"c","DD":"d","D":"e","YYYY-MM-DD":"F","HH":"H","H":"H","hh":"I","h":"I","DDDD":"j","DDD":"-j","MM":"m","M":"-m","mm":"M","m":"-M","A":"p","a":"P","ss":"S","s":"-S","E":"u","d":"w","WW":"W","ll":"x","LTS":"X","YY":"y","YYYY":"Y","ZZ":"z","z":"Z","SSS":"L","%":"%"}
			var tokens = momentFormat.split(/( |\/|:|,|\]|\[|\.)/);
			
			var strftime = tokens.map(function (token) {
				// Replace strftime tokens with moment formats
				if(token[0] == ":" || token[0] == "/" || token[0] == " " || token[0] == ",")
					return token
				else 
					if (token[0] == "[" || token[0] == "]")
						return
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
				return true;
			return false;
			
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

		moment.locale(options.moment_locale);
		var date_format_local = moment().creationData().locale._longDateFormat;
		
		options.locale = {
			"dateTime": convertMomentToStrftime(date_format_local.LLLL),
			"date": convertMomentToStrftime(date_format_local.L),
			"time": convertMomentToStrftime(date_format_local.LTS),
			"periods": ["AM", "PM"],
			"days": moment.weekdays(),
			"shortDays": moment.weekdaysShort(),
			"months": moment.months(),
			"shortMonths": moment.monthsShort()
		};

		if (!options.custom_time_format){
			options.custom_time_format = {
				format_millisecond : convertMomentToStrftime("SSS"),
				format_second : convertMomentToStrftime(":ss"),
				format_minute : convertMomentToStrftime(date_format_local.LT),
				format_hour : convertMomentToStrftime(date_format_local.LT.substring(0,1) + (periodInLocal()? " " + date_format_local.LT.slice(-1): "") ),
				format_day : convertMomentToStrftime("ddd DD"), 
				format_week : convertMomentToStrftime("MMM DD"),
				format_month : convertMomentToStrftime("MMMM"),
				format_year : convertMomentToStrftime("YYYY")
			};
		};

		if(!custom_options.hasOwnProperty("width"))
			options.width = document.getElementById(options.id_div_graph).offsetWidth;

		options.id = "visavail-" + Math.random().toString(36).substring(7);

		//function for custom tick format of x axis
		function multiFormat(date) {
			return (d3.timeSecond(date) < date ? d3.timeFormat(options.custom_time_format.format_millisecond)
			: d3.timeMinute(date) < date ? d3.timeFormat(options.custom_time_format.format_second)
			: d3.timeHour(date) < date ? d3.timeFormat(options.custom_time_format.format_minute)
			: d3.timeDay(date) < date ? d3.timeFormat(options.custom_time_format.format_hour)
			: d3.timeMonth(date) < date ? (d3.timeWeek(date) < date ? d3.timeFormat(options.custom_time_format.format_day) 
			: d3.timeFormat(options.custom_time_format.format_week))
			: d3.timeYear(date) < date ? d3.timeFormat(options.custom_time_format.format_month)
			: d3.timeFormat(options.custom_time_format.format_year))(date);
		}
		


		function chart(selection) {
			selection.each(function drawGraph(dataset) {
				//set to locale with moment
				d3.timeFormatDefaultLocale(options.locale);
				
				// global div for tooltip
				var div = d3.select('#'+options.id_div_container).append('div')
					.attr('class', "visavail-tooltip " + options.id)
					.attr('id', options.id)
					.append('div')
					.attr('class', (options.tooltip.class+"-"+options.tooltip.position ))
					.style('opacity', 0);
				var width = options.width - options.margin.left - options.margin.right;
				var maxPages = 0;
				var startSet;
				var endSet;
				if (options.max_display_datasets !== 0) {
					startSet = options.cur_display_first_dataset;
					if (options.cur_display_first_dataset + options.max_display_datasets > dataset.length) {
						endSet = dataset.length;
					} else {
						endSet = options.cur_display_first_dataset + options.max_display_datasets;
					}
					maxPages = Math.ceil(dataset.length / options.max_display_datasets);
				} else {
					startSet = 0;
					endSet = dataset.length;
				}

				// append data attribute in HTML for pagination interface
				selection.attr('data-max-pages', maxPages);

				var noOfDatasets = endSet - startSet;
				var height = options.graph.height * noOfDatasets + options.line_spacing * noOfDatasets - 1;

				// check how data is arranged
				for (var i = 0; i < dataset.length; i++) {
					if(dataset[i].description)
						options.tooltip.description = true;
					if (dataset[i].data[0] != null && dataset[i].data[0].length == 3 ){
						options.defined_blocks = true
						if(!options.custom_categories && !Number.isInteger(dataset[i].data[0][1])) 
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
								options.is_date_only_format = false;
							} else {
								throw new Error('Date/time format not recognized. Pick between \'YYYY-MM-DD\' or ' +
									'\'YYYY-MM-DD HH:MM:SS\'.');
							}
							if (!options.defined_blocks) {
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
								if (options.defined_blocks) {
									if (tmpData[tmpData.length - 1][2].getTime() === d[0].getTime()) {
										// end of old and start of new block are the same
										tmpData[tmpData.length - 1][2] = d[2];
										tmpData[tmpData.length - 1][3] = d[1];
									} else {
										tmpData.push(d);
									}
								} else {
									
									tmpData[tmpData.length - 1][2] = d[2];
									tmpData[tmpData.length - 1][3] = d[1];
								}
							} else {
								// the value has changed since the last date
								if (!options.defined_blocks) {
									// extend last block until new block starts
									tmpData[tmpData.length - 1][2] = d[0];
								}
								tmpData.push(d);
							}
						} else if (i === 0) {
							d[3] =  d[1];
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
				options.xScale = xScale;

				if(options.date_is_descending)
					xScale.domain([endDate, startDate])
					
				// define axes
				var xAxis = d3.axisTop(xScale)
					.scale(xScale)
					.ticks(options.ticks_for_graph)
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
					options.zoomed = d3.zoom()
						.scaleExtent([1,Infinity])
						.translateExtent([[0,0],[width, options.height]])
						.extent([[0, 0], [width, options.height]])
						
						.on("start", function () {
							var e = d3.event;
							//console.log(e.type, e.transform.k, e.transform.x, e.sourceEvent)
														
							if (e.sourceEvent && e.sourceEvent.type === "brush") {
								return;
							}
							if( e.sourceEvent && e.sourceEvent.type === "touchstart" && e.sourceEvent.cancelable){
								event.preventDefault();
								event.stopImmediatePropagation();
							}
							//define startEvent for fix error in click
							if(e.transform.k || e.transform.x){
								start_event = e;
								options.zoom.onZoomStart.call(this, e);
							}
							
						})
						.on("zoom", zoomed)
						
						.on('end', function () {
							var e = d3.event;
							//console.log( e.type, e.transform.k, e.transform.x, e.sourceEvent)
							if(e == null)
								return
							if (e.sourceEvent && e.sourceEvent.type === "brush") {
								return;
							}
							if(e.sourceEvent && e.sourceEvent.type === "touchend" && e.sourceEvent.cancelable){
								event.preventDefault();
	  							event.stopImmediatePropagation();
							}
							// if click, do nothing. otherwise, click interaction will be canceled.
// 							if (start_event.sourceEvent && e.sourceEvent && start_event.sourceEvent.type === "touchend"&&  
// 								start_event.sourceEvent.clientX == e.sourceEvent.clientX && start_event.sourceEvent.clientY == e.sourceEvent.clientY) {
// 								console.log("enter to click")
// 								return;
// 							}
							
							if(e.transform.k || e.transform.x){
								//console.log("entrato nell'options.scale con x end")
								options["scale"] = d3.zoomTransform(svg.select("#g_data").node())
								options.zoom.onZoomEnd.call(this, xScale.domain());
							} else {
								//console.log("entrato nell'options.scale con x start")
								
								e.transform.k = start_event.transform.k;
								e.transform.x = start_event.transform.x;
								options["scale"] = d3.zoomTransform(svg.select("#g_data").node())
								options.zoom.onZoomEnd.call(this, xScale.domain());
							}
						});
						
				}
				svg.append('g')
				.attr('id', 'g_data')
				.append('rect')
						.attr('id', 'zoom')
						.attr('width', width)
						.attr('height', height)
						.attr('fill-opacity', 0)
						.attr('cursor', "ew-resize")
						.attr('x', 0)
						.attr('y', 0)
				if (options.zoom.enabled)
					svg.select("#g_data").call(options.zoomed)

				//.call(options.zoomed);

				if (options.show_y_title) {
					// create y axis labels
					svg.select('#g_axis').append('g').attr('id', 'yAxis').selectAll('text')
						.data(dataset.slice(startSet, endSet))
						.enter()
						.append('g')
						.attr('id', function (d,i) {
							return i;
						})
						.append('title')
                        .text(function (d) {
                                 return d.measure;
						});

					svg.select('#yAxis').selectAll("g").append('text')
						.attr('x', options.padding.left)
						.attr('y', options.line_spacing + options.graph.height / 2)
						.text(function (d) {
							return d.measure || d.measure_html;
							/*if (!(d.measure_html != null)) {
								return d.measure;
							}*/
						})
						.each(wrap)
						.attr('transform', function (d, i) {
							return 'translate(0,' + ((options.line_spacing + options.graph.height) * i) + ')';
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

					/*svg.select('#yAxis').selectAll("g")
						.insert('text', ':first-child')
						
						.attr('x', options.padding.left)
						.attr('y', options.line_spacing)
						.attr('transform', function (d, i) {
							return 'translate(0,' + ((options.line_spacing + options.graph.height) * i) + ')';
						})
						.attr('width', -1 * options.padding.left)
						.attr('height', options.graph.height)
						.attr('class', 'ytitle')
						.append("xhtml:div")
						.html(function (d) {
							if (d.measure_html != null) {
								return d.measure_html;
							}
						});
					*/
                    function wrap() {
                        var self = d3.select(this),
                            textLength = self.node().getComputedTextLength(),
							text = self.text();
						
						 while (textLength > (-1 * options.padding.left + options.reduce_space_wrap) && text.length > 0) {
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
						.data(scale.ticks(options.ticks_for_graph))
						.enter()
						.append('line')
						.attr('x1', function (d) {
							return scale(d);
						})
						.attr('x2', function (d) {
							return scale(d);
						})
						.attr('y1', 0)
						.attr('y2', options.graph.height * noOfDatasets + options.line_spacing * noOfDatasets - 1 + options.margin.bottom)
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
						return ((options.line_spacing + options.graph.height) * i) + options.line_spacing + options.graph.height / 2;
					})
					.attr('y2', function (d, i) {
						return ((options.line_spacing + options.graph.height) * i) + options.line_spacing + options.graph.height / 2;
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
						return 'translate(0,' + ((options.line_spacing + options.graph.height) * i) + ')';
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
						return xForPoint(d, xScale, 0)
					})
					.attr('width', function (d) {
						return widthForPoint(d, xScale, 0)
					})
					.attr('y', options.line_spacing)
					.attr('height', options.graph.height)
					.attr('transform',  function (d) {
						return transformForTypeOfGraph(d, xScale, 0)
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
						redrawTooltipWhenOver(this, dataset, d3.event.layerX, d3.event.layerY, d, i);
					})
					.on("touchstart", function (d, i) {
						redrawTooltipWhenOver(this, dataset, d3.event.touches[0].layerX, d3.event.touches[0].layerY, d, i);
					})
					.on('mouseout', function () {
						redrawTooltipWhenOut(this)
					})
					.on("touchleave", function () {
						redrawTooltipWhenOut(this)
					})
					.on("touchcancel", function () {
						redrawTooltipWhenOut(this)
					})
					.on('click', function(d,i){
						options.onClickBlock.call(this, d,i);
					})
					.on("mousemove", function(){
						redrawTooltipWhenMoved(d3.event.layerX, d3.event.layerY, this)
					})
					.on("touchmove", function () {
						redrawTooltipWhenMoved(d3.event.touches[0].layerX, d3.event.touches[0].layerY)
					});
				

				
				function redrawTooltipWhenMoved(pageX, pageY, obj){
					div.style('left',  function () {
						if(options.width < (pageX + div.property('offsetWidth') + options.tooltip.left_spacing))
							return ((pageX - div.property('offsetWidth')) - options.tooltip.left_spacing)+ 'px';
						return (pageX + options.tooltip.left_spacing)+ 'px';
					});

					if(options.tooltip.position === "top"){
						if(options.width < (pageX + div.property('offsetWidth') + options.tooltip.left_spacing)){
							div.style('border-right', "solid thin rgb(0, 0, 0)")
								.style('border-left', "none");
						} else {
							div.style('border-left', "solid thin rgb(0, 0, 0)")
								.style('border-right', "none");
						}
					}
					if(options.tooltip.position === "overlay"){
						if(document.getElementById(options.id_div_graph).offsetHeight < pageY+ div.property('offsetHeight'))
							div.style('top', (document.getElementById(options.id_div_graph).offsetHeight - div.property('offsetHeight')) + 'px')
						else
							div.style('top', (pageY) + 'px')
					}
				}

				function redrawTooltipWhenOut(obj){
					if(options.tooltip.hover_zoom.enabled){
						d3.select(obj).transition()
							.duration(options.tooltip.duration)
							.attr('x', function (d) {
								return xForPoint(d,  options.xScale, 0)
							})
							.attr('width', function (d) {
								return widthForPoint(d,  options.xScale, 0)
							})
							.attr('y', options.line_spacing)
							.attr('height', options.graph.height)
							.attr('transform',  function (d) {
								return transformForTypeOfGraph(d,  options.xScale, 0)
							})
					}
					div.transition()
						.duration(options.tooltip.duration)
						.style('opacity', 0);
				}
				
				function redrawTooltipWhenOver(obj, dataset, pageX, pageY, d, i){
					if(options.tooltip.hover_zoom.enabled){
						d3.select(obj).transition()
							.duration(options.tooltip.duration)
							.attr('x', function (d) {
								if(options.graph.type == "rhombus" || options.graph.type == "circle")
									return xForPoint(d, options.xScale, options.line_spacing*options.tooltip.hover_zoom.ratio*2)
								return xForPoint(d,  options.xScale, 0)	
							})
							.attr('width', function (d) {
								if(options.graph.type == "rhombus" || options.graph.type == "circle")
									return widthForPoint(d,  options.xScale, options.line_spacing*options.tooltip.hover_zoom.ratio)
								return widthForPoint(d,  options.xScale, 0)
							})
							.attr('y', options.line_spacing - options.line_spacing*options.tooltip.hover_zoom.ratio/2)
							.attr('height', options.graph.height+options.line_spacing*options.tooltip.hover_zoom.ratio)
							.attr('transform',  function (d) {
								return transformForTypeOfGraph(d,  options.xScale, options.line_spacing*options.tooltip.hover_zoom.ratio)
							})
					}
					var matrix = obj.getCTM().translate(obj.getAttribute('x'), obj.getAttribute('y'));
					div.transition()
						.duration(options.tooltip.duration)
						.style('opacity', 1);
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
							
							if (options.is_date_only_format && !options.tooltip.date_plus_time) {
								if (d[2] > d3.timeSecond.offset(d[0], 86400) && !options.tooltip.only_first_date) {
									if(options.date_is_descending)
										return output + moment(d[2]).format('l') +
										' - ' + moment(d[0]).format('l');
									return output + moment(d[0]).format('l') +
										' - ' + moment(d[2]).format('l');
								}
								if(options.date_is_descending)
									return output + moment(d[2]).format('l');
								return output + moment(d[0]).format('l');
							} else {
								if(!options.tooltip.only_first_date){
									if ((d[2] > d3.timeSecond.offset(d[0], 86400) || options.tooltip.date_plus_time)) {
										if(options.date_is_descending)
											return output + moment(d[2]).format('l') + ' ' +
												moment(d[2]).format('LTS') + ' - ' +
												moment(d[0]).format('l') + ' ' +
												moment(d[0]).format('LTS');
										return output + moment(d[0]).format('l') + ' ' +
											moment(d[0]).format('LTS') + ' - ' +
											moment(d[2]).format('l') + ' ' +
											moment(d[2]).format('LTS');
									}
									if(options.date_is_descending)
										return output + moment(d[2]).format('LTS') + ' - ' +
										moment(d[0]).format('LTS');
									return output + moment(d[0]).format('LTS') + ' - ' +
										moment(d[2]).format('LTS');
								} else {
									console.log("entrato nell'esle")
									if (d[2] > d3.timeSecond.offset(d[0], 86400) || options.tooltip.date_plus_time) {
										if(options.date_is_descending)
											return output + moment(d[2]).format('l') + ' ' +
												moment(d[2]).format('LTS');
										return output + moment(d[0]).format('l') + ' ' +
											moment(d[0]).format('LTS');
									}
									if(options.date_is_descending)
										return output + moment(d[2]).format('LTS');
									return output + moment(d[0]).format('LTS');
								}								
							}
						})
						.style('left', function () {
							if(options.width < (pageX + div.property('offsetWidth') + options.tooltip.left_spacing))
								return ((pageX - div.property('offsetWidth')) - options.tooltip.left_spacing)+ 'px';
							return (pageX + options.tooltip.left_spacing)+ 'px';
						})

					if(options.tooltip.position === "top"){
						div.style('top', function () {
							if(options.tooltip.hover_zoom.enabled)
								return window.pageYOffset + matrix.f - options.tooltip.height - options.tooltip.hover_zoom.ratio*options.line_spacing + 'px';
							return window.pageYOffset + matrix.f  - options.tooltip.height + 'px';
						})
						.style('height', 
							function(){
								if(options.tooltip.hover_zoom.enabled)
									return	options.tooltip.hover_zoom.ratio*options.line_spacing + options.graph.height + options.tooltip.height + 'px'
								return	options.graph.height + options.tooltip.height + 'px'
							})
						
						if(options.width < (pageX + div.property('offsetWidth') + options.tooltip.left_spacing)){
							div.style('border-right', "solid thin rgb(0, 0, 0)")
								.style('border-left', "none");
						} else {
							div.style('border-left', "solid thin rgb(0, 0, 0)")
								.style('border-right', "none");
						}

					}
					if(options.tooltip.position === "overlay"){
						div.style('top', (pageY) + 'px')
					}

				}

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
					var xTicks = scale.ticks(options.ticks_for_graph);
					var isYearTick = xTicks.map(isYear);
					var isMonthTick = xTicks.map(isMonth);

					if (options.emphasize_year_ticks &&
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
					if (options.emphasize_month_ticks &&
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
						.attr('x', options.padding.left)
						.attr('y', options.padding.top)
						.text(options.title.text)
						.attr('class', 'heading');
				}
				// create subtitle
				if (options.sub_title.enabled) {
					var subtitleText = '';
					if (noOfDatasets) {
						if (options.is_date_only_format) {
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
						.attr('x', options.padding.left)
						.attr('y', options.padding.top + options.title.line_spacing)
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
						.attr('y', options.padding.top)
						.attr('height', 15)
						.attr('width', 15)
						.attr('class', 'rect_has_data');

					legend.append('text')
						.attr('x', width + options.margin.right - 150 + 20)
						.attr('y', options.padding.top + options.legend.line_space - options.legend.offset/2)
						.text(options.legend.has_data_text)
						.attr('class', 'legend');

					legend.append('rect')
						.attr('x', width + options.margin.right - 150)
						.attr('y', options.padding.top + options.legend.line_space + options.legend.offset)
						.attr('height', 15)
						.attr('width', 15)
						.attr('class', 'rect_has_no_data');

					legend.append('text')
						.attr('x', width + options.margin.right - 150 + 20)
						.attr('y', options.padding.top + options.legend.line_space * 2 +  options.legend.offset/2)
						.text(options.legend.has_no_data_text)
						.attr('class', 'legend');
				}

				// function for zoomed
				function zoomed() {	
					//prevent event null for type != zooming
					var e = d3.event		
					if (e && e.type !== "zoom")
						return

					if(e.transform.k || e.transform.x){
						options.xScale = e.transform.rescaleX(xScale);
						
						//redraw tooltip
						if(e.sourceEvent && e.sourceEvent== "touchmove")
							redrawTooltipWhenMoved(e.sourceEvent.touches[0].layerX, e.sourceEvent.touches[0].layerY)
						else if(e.sourceEvent)
								redrawTooltipWhenMoved(e.sourceEvent.layerX, e.sourceEvent.layerY)
							
						g.selectAll('rect')
							.attr('x', function (d) {
								return xForPoint(d, options.xScale, 0);
							})
							.attr('width', function (d) {
								return widthForPoint(d, options.xScale, 0);
							})
							.attr('transform',  function (d) {
								return transformForTypeOfGraph(d, options.xScale, 0)
							})

						//change label x axis
						svg.select(".xAxis").call(xAxis.scale(options.xScale));
						//change v grid data axis
						svg.select('#vGrid').selectAll('line').remove();
						createVGrid(options.xScale);
						emphasize(options.xScale);

						options.zoom.onZoom.call(this, options.xScale.domain())
					}

				}
				
				//restore to previous zoom
				if(options.scale){
					svg.select("#g_data").call(options.zoomed.transform, d3.zoomIdentity.translate(options.scale.x, options.scale.x).scale(options.scale.k))
					
				}

				function xForPoint(d, xScale, ratio){
					var x_scale = xScale(d[0]) - ratio;
					if(options.date_is_descending)
						x_scale = xScale(d[2]) - ratio;
					if(isNaN(x_scale) || x_scale < 0 || x_scale + ratio > width)
						return 0 - ratio/2
					if(options.graph.type == "rhombus" || options.graph.type == "circle")
						return xScale(d[0]) - options.graph.width/2 
					
					return x_scale;
				}
				
				function widthForPoint(d, xScale, ratio){
					
					var x_scale_d0 = xScale(d[0]) - ratio;
					var x_scale_d2 = xScale(d[2]) + ratio;
					
					if(options.date_is_descending) {
						x_scale_d0 = xScale(d[2]) - ratio;
						x_scale_d2 =  xScale(d[0]) + ratio;
					}
					
					if(isNaN(x_scale_d0) || isNaN(x_scale_d2) || (!options.date_is_descending && (x_scale_d2 - x_scale_d0) < 0) || x_scale_d2 < 0 && x_scale_d0 < 0 ) 
						return 0;

					if(options.date_is_descending && (x_scale_d2 - x_scale_d0) < 0)
						return (-1*(x_scale_d2 - x_scale_d0))

					if(options.graph.type == "rhombus" || options.graph.type == "circle" ){
						if(x_scale_d0 + ratio < 0)
							return 0 - ratio
						return options.graph.width + ratio;
					}

					if (x_scale_d0 < 0 && x_scale_d2 > 0)
						return x_scale_d2 > width ? width : x_scale_d2 - ratio

					if (x_scale_d2 < 0 && x_scale_d0 > 0)
						return x_scale_d0 > width ? width  : x_scale_d0 - ratio
					
					if (x_scale_d2 > width)
						return width - x_scale_d0 < 0 ? 0 : (width - x_scale_d0 + ratio);
					else
						return x_scale_d2 - x_scale_d0;
					
				}

				function transformForTypeOfGraph(d, xScale, ratio){
					var x_scale = xScale(d[0]);
					// if(options.date_is_descending)
					// 	x_scale = xScale(d[2]);
					if((options.graph.type == "rhombus" || options.graph.type == "circle" )&& x_scale > 0 )
						return  'rotate(45 '+ (x_scale) + "  " + (options.graph.height/2 + options.line_spacing-ratio)+")"
					else if((options.graph.type == "rhombus" || options.graph.type == "circle" ) && x_scale <= 0 )
						return  'rotate(45 0 '+ (options.graph.height/2 + options.line_spacing-ratio) +')'
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
			if (!arguments.length) return  options.max_display_datasets;
			options.max_display_datasets = _;
			return chart;
		};

		chart.curDisplayFirstDataset = function (_) {
			if (!arguments.length) return  options.cur_display_first_dataset;
			options.cur_display_first_dataset = _;
			return chart;
		};



		chart.emphasizeYearTicks = function (_) {
			if (!arguments.length) return  options.emphasize_year_ticks;
			options.emphasize_year_ticks = _;
			return chart;
		};


		chart.displayDateRange = function (date_range, dataset) {
			if (!arguments.length) return  options.display_date_range;
			options.display_date_range = date_range ;
			if(!document.getElementById(options.id_div_graph) ){
                return chart;
            }
            return chart.updateGraph(dataset)
		};


		chart.resizeWidth = function(width){
			options.width = width;
			return chart.updateGraph()
		};

		chart.updateGraph = function(dataset){
			if(document.getElementById(options.id_div_graph) && document.getElementById(options.id_div_graph).innerHTML != "" ){
				document.getElementById(options.id_div_graph).innerHTML = "";
				if(document.getElementById(options.id))
					document.getElementById(options.id).remove();
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
           chart.resizeWidth(document.getElementById(options.id_div_graph).offsetWidth);
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
