Visavail.js - A Time Data Availability Chart
=============================
This library visualizes the availability of time-dependent data with a chart on a website.
This is a fork of the Visavail original library [https://github.com/flrs/visavail](https://github.com/flrs/visavail).

I modify the structure of library and implement new functionality for a better and dynamic library.

Table of contents
----
<!-- TOC -->

- [1. Description](#1-description)
- [2. Demo](#2-demo)
- [3. Usage](#3-usage)
	- [3.1. Input Data Format](#31-input-data-format)
		- [3.1.1. Continuous Data](#311-continuous-data)
		- [3.1.2. Data With Time Gaps](#312-data-with-time-gaps)
		- [3.1.3. Data With Dates and Times](#313-data-with-dates-and-times)
		- [3.1.4. Data With Custom Categories](#314-data-with-custom-categories)
		- [3.1.5. Linking Measure Labels](#315-linking-measure-labels)
		- [3.1.6. Measure Labels with HTML](#316-measure-labels-with-html)
	- [3.2. Display Style](#32-display-style)
		- [3.2.1. Type of Chart](#321-type-of-chart)
	- [3.3. Options](#33-options)
		- [3.3.1. Margin](#331-margin)
		- [3.3.2. Padding](#332-padding)
		- [3.3.3. Tooltip](#333-tooltip)
		- [3.3.4. Legend](#334-legend)
		- [3.3.5. Title](#335-title)
		- [3.3.6. Sub Title](#336-sub-title)
		- [3.3.7. Icon](#337-icon)
		- [3.3.8. Graph](#338-graph)
		- [3.3.9. Responsive](#339-responsive)
		- [3.3.10. Zoom](#3310-zoom)
		- [3.3.11. Example Usage](#3311-example-usage)
	- [3.4. Implementation](#34-implementation)
- [4. Download](#4-download)
- [5. Dependencies](#5-dependencies)
- [6. Contribution](#6-contribution)
- [7. License](#7-license)

<!-- /TOC -->

# 1. Description
-----------
The Visavail.js chart allows a quick insight into which periods of time a time-dependent dataset covers. It is visually similar to a Gantt chart and allows easy identification of missing pieces and gaps in large datasets. Missing periods of data are marked in red while blocks of complete periods of data are marked in green. The user discovers dates that define start and end of such periods by tooltips, as shown in the picture below.

![Preview of Visavail.js chart](preview.jpg "Visavail.js Sample Chart")

An example use case is the visualization of a dataset that contains time-dependent stock market data. The question the Visavail.js chart tries to answer is

*"Do I have continuous stock market data in my dataset and if not, where are the gaps?"*

The Visavail.js library takes single data points with dates and information about data availability as inputs, combines them into time blocks, and visualizes these blocks.

# 2. Demo
----
Some example of Visavail.js in action is displayed at [Demo](https://tanganellilore.github.io/visavail/docs/index.html). 
The source code of the a basic demo is shown in the file [basic.html](https://github.com/tanganellilore/visavail/blob/master/docs/samples/basic.html).

# 3. Usage
-----
Input data format, display style and dependencies have to be considered for using the Visavail.js library successfully. The respective code snippets are explained below.

## 3.1. Input Data Format
The input to the Visavail.js library is a JSON-like structure. There are three formats that Visavail.js accepts. Which format is right for you depends on your use case.

### 3.1.1. Continuous Data
You should use the continuous data format if you want to display continuous recordings. Visavail.js assumes that information about the availability of some data is valid until the next data point shows up.
Thus, the library will plot a continuous bar from the first to the last data point. The last data point will be assumed valid for a period of `"interval_s"`.
The below code comments point out the elements that should be included in the input data.
```javascript
var dataset = [{
    "measure": "Annual Report", // name of the data series, will become y-axis label
    "interval_s": 365 * 24 * 60 * 60, // time period in seconds a single data point is expected to cover
    "data": [
        ["2015-01-01", 0], // data as arrays of period start data string and bit determining
                           // if data are available for that period
        ["2016-01-01", 1],
        ["2017-01-01", 1],
        ["2018-01-01", 1]
    ]
}];
```

### 3.1.2. Data With Time Gaps
You should use the time gap data format if you want to display recordings that are not continuous. The availability data are valid for a specific period of time. This period is defined by a start and an end date, as shown in the code below. 
In this case, no information about `"interval_s"` (as explained in the previous use case) is needed.
```javascript
var dataset = [{
    "measure": "Annual Report", // name of the data series, will become y-axis label
    "data": [
        ["2015-01-01", 0, "2015-03-04"], // data as arrays of period start data string,
                                         // bit determining if data are available for that
                                         // period and period end data string
        ["2016-01-01", 1, "2016-03-03"],
        ["2017-01-01", 1, "2017-03-06"],
        ["2018-01-01", 1, "2018-04-01"]
    ]
}];
```

### 3.1.3. Data With Dates and Times
The library also supports the display of data in smaller units than days as in the previous examples. Visavail.js currently supports display of data in second intervals. The code below is based on the time gap data format outlined above.
To display date and time data correctly, all data must be formatted in a 24-hour format.
```javascript
var dataset = [{
    "measure": "Room Occupancy", // name of the data series, will become y-axis label
    "data": [
        ["2016-01-01 12:00:00", 1, "2016-01-01 13:00:00"], // 24-hour format
        ["2016-01-01 14:22:51", 1, "2016-01-01 16:14:12"],
        ["2016-01-01 19:20:05", 0, "2016-01-01 20:30:00"],
        ["2016-01-01 20:30:00", 1, "2016-01-01 22:00:00"]
    ]
}];
```

### 3.1.4. Data With Custom Categories
If you want to show data in other categories than "data available" and "no data available", the following example is for you. Visavail.js also supports displaying data in custom categories. In this case, you have to assign all of your categories a name and a color that is used for displaying the category in the chart.

The chart legend will not appear on charts with data in custom categories. Instead, the category name will be shown in the tooltip that appears when you hover over the bars in the chart. See the code below for an example.
```javascript
var dataset = [{
    "measure": "Fat Bike",
    "categories": { // category names and their colors defined here
        "Kim": { "color": "#377eb8" },
        "Bert": { "color": "#ff7f00" },
        "Zoe": { "color": "purple" },
        },
    "data": [
        ["2016-01-01 12:00:00", "Kim", "2016-01-01 13:00:00"],
        ["2016-01-01 14:22:51", "Zoe", "2016-01-01 16:14:12"],
        ["2016-01-01 16:14:12", "Bert", "2016-01-01 17:14:12"],
        ["2016-01-01 19:20:05", "Zoe", "2016-01-01 20:30:00"]
    ]
}];
```

### 3.1.5. Linking Measure Labels
If you want to add a link to your measure label, you can do so by adding an URL through the `measure_url` property in the `dataset`. Here is an example:
```javascript
var dataset = [{
    "measure": "Annual Report",
    "measure_url": "http://www.github.com/flrs/visavail" // link definition
    "interval_s": 365 * 24 * 60 * 60,
    "data": [
        ["2015-01-01", 0], 
        ["2016-01-01", 1],
        ["2017-01-01", 1],
        ["2018-01-01", 1]
    ]
}];
```

### 3.1.6. Measure Labels with HTML
Measure labels can be expressed in full HTML via the `measure_html` property in the `dataset`. Here is an example:
```javascript
var dataset = [{
    "measure_html": "<span title='Price of security at end of day'>&#x1F6AA; Closing Price</span>", // HTML code
    "interval_s": 365 * 24 * 60 * 60,
    "data": [
        ["2015-01-01", 0], 
        ["2016-01-01", 1],
        ["2017-01-01", 1],
        ["2018-01-01", 1]
    ]
}];
```

## 3.2. Display Style
The display style of the chart is defined by a CSS style. The names of the different CSS classes in the [CSS style file](https://github.com/tanganellilore/visavail/blob/master/visavail.css) are self-explanatory.

### 3.2.1. Type of Chart
The library support three type of chart for different type of visualization "bar" (default), "rhombus", "circle".
If you want to change type of graph you can follow this code
```javascript
var options = {
	graph:{
		type: "circle",
		height:30,
		width:30
	}
};
```



## 3.3. Options
The options of the chart are in JSON format and you can customize everything.
You can pass the JSON Object to library with custom settings

| Name | Type | Default | Description |
| ---- |------| ------- | ---------- |
| *id_div_container* | `string` | **visavail_container** | Id of div that contain the graph tag |
| *id_div_graph* | `string` | **example** | Id of div that contain the graph |
| *margin* | `Object{}` | **[more info](#331-margin)** | Json Object that contain margin of graphs include title, legent etc. |
| *padding* | `Object{}` | **[more info](#331-padding)** | Json Object that contain padding of graphs |
| *width* | `number` | **960** | Width of the graph, this option was ignored if option resposive is enabled |
| *reduce_space_wrap* | `number` | **36** | Space for three dots when you use a simple title of mesurment |
| *line_spacing* | `number` | **16** | Space between two row of dataset |
| *emphasize_year_ticks* | `boolean` | **true** | Emphasize the year when the range of data cover one more year |
| *emphasize_month_ticks* | `boolean` | **true** | Emphasize the month when the range of data cover one more month and not exceed the year |
| *max_display_datasets* | `number` | **0** | max. no. of datasets that is displayed, 0: all (is the same option of original library) |
| *cur_display_first_dataset* | `number` | **0** | current first dataset to display (is the same option of original library) |
| *display_date_range* | `Array[]` | **[0,0]** | range of dates that will be shown. If from-date (1st element) or to-date (2nd element) is zero, it will be determined according to your data (default: automatically) |
| *custom_categories* | `boolean` | **false** | Set to true if you want to use custom category |
| *is_date_only_format* | `boolean` | **false** | Check if the date is with date only ( will set Automatically) |
| *show_y_title* | `boolean` | **true** | If you set to fale, reminder to set properly margin and padding left |
| *date_in_utc* | `boolean` | **true** | Set true or false in base of your type of date. If true we use moment to set the date in the current user timezone or in the timezone set by script |
| *defined_blocks* | `boolean` | **false** | If set to true the we ignore interval_s options in datasets and we use a block defined. This option is set automatically if in there is a date/time defined |
| *onClickBlock* | `function(d,i)` | null | return "d" an arry with date and value precessed and "i" value of block clicked item |
| *tooltip* | `Object{}` | **[more info](#333-tooltip)** | Json Object that contain tooltip option for the graph |
| *legend* | `Object{}` | **[more info](#334-legend)** | Json Object that contain legend option for the graph |
| *title* | `Object{}` | **[more info](#335-title)** | Json Object that contain title option for the graph |
| *sub_title* | `Object{}` | **[more info](#336-sub-title)** | Json Object that contain sub-title option for the graph |
| *icon* | `Object{}` | **[more info](#337-icon)** | Json Object that contain icon option for the graph |
| *graph* | `Object{}` | **[more info](#338-graph)** | Json Object that contain option for custom type of graph |
| *responsive* | `Object{}` | **[more info](#339-responsive)** | Json Object that contain option for responsive layout of graph |
| *zoom* | `Object{}` | **[more info](#3310-zoom)** | Json Object that contain option for zoom in the graph |

### 3.3.1. Margin

| Name | Type | Default | Description |
| ---- |------| ------- | ---------- |
| *top* | `number` | 65 | Number express in px |
| *bottom* | `number` | 40 | Number express in px |
| *right* | `number` | 20 | Number express in px |
| *left* | `number` | 100 | Number express in px |

### 3.3.2. Padding
| Name | Type | Default | Description |
| ---- |------| ------- | ---------- |
| *top* | `number` | -50 | Number express in px |
| *bottom* | `number` | 10 | Number express in px (not used at the moment) |
| *right* | `number` | 0 | Number express in px (not used at the moment) |
| *left* | `number` | -100 | Number express in px, used for move the y title on the left |

### 3.3.3. Tooltip
| Name | Type | Default | Description |
| ---- |------| ------- | ---------- |
| *class* | `string` | tooltip | Set a custrom class if you want |
| *height* | `number` | 10 | height of tooltip , correspond to line-height of class tooltip from css) |
| *position* | `string` | top | Two type of tooltip:  "top" is a div before bar follow the mouse only left, "overlay" follow the mouse left and height |
| *left_spacing* | `number` | 0 | Left space from tooltip and mouse |

### 3.3.4. Legend
| Name | Type | Default | Description |
| ---- |------| ------- | ---------- |
| *enabled* | `boolean` | true | Enable the legend (If you use a custom categories the legend is hidden) |
| *line_space* | `number` | 12 | height of legend font , correspond to line-height of class tooltip from css) |
| *offset* | `number` | 5 | Distance from two data of legend |
| *has_no_data_text* | `string` | No Data available | String for no data available |
| *has_data_text* | `string` | Data available | String for no data available |

### 3.3.5. Title
| Name | Type | Default | Description |
| ---- |------| ------- | ---------- |
| *enabled* | `boolean` | true | Enable the title |
| *line_space* | `number` | 16 | height of legend font , correspond to line-height of class tooltip from css) |
| *text* | `string` | Data Availability Plot | String Title |

### 3.3.6. Sub Title
| Name | Type | Default | Description |
| ---- |------| ------- | ---------- |
| *enabled* | `boolean` | true | Enable the title |
| *line_space* | `number` | 16 | height of legend font , correspond to line-height of class tooltip from css) |
| *from_text* | `string` | from | String for from date |
| *to_text* | `string` | to | String for to date  |

### 3.3.7. Icon
| Name | Type | Default | Description |
| ---- |------| ------- | ---------- |
| *class_has_data* | `string` | fas fa-fw fa-check | custom icon call (for example font awesome) |
| *class_has_no_data* | `string` | fas fa-fw fa-times | custom icon call (for example font awesome)  |

### 3.3.8. Graph
| Name | Type | Default | Description |
| ---- |------| ------- | ---------- |
| *type* | `string` | bar | There are three type of graph; "bar" is a classical horizzontal bar, "rhombus" use a rhombus for a simple alert, "circle" a drop for a event chart |
| *height* | `number` | 20 | height of type of graph |
| *width* | `number` | 20 | width of type of graph, used only for rhombus type and circle type|

### 3.3.9. Responsive
| Name | Type | Default | Description |
| ---- |------| ------- | ---------- |
| *enabled* | `boolean` | false | Enable the resposive chart for a responsive layout (this option recreate the chart when the page or div of chart will be resized) |
| *onresize* | `function` | null | at the moment not supported |

### 3.3.10. Zoom
| Name | Type | Default | Description |
| ---- |------| ------- | ---------- |
| *enabled* | `boolean` | false | Enable the zoom in the chart. We can zoom with mousewheel and you can mof left-right for move in the graph |
| *onZoom* | `function(e)` | null | return a current array with current domain of current zoom in date format |
| *onZoomStart* | `function(e)` | null | return a d3.event json object when zoom start |
| *onZoomEnd* | `function(e)` | null | return a array with current domain of current zoom in date format at the end of the zoom |


### 3.3.11. Example Usage
In this example we use a custom id for a div container and div graph, custom icon for tooltip, enabled zoom and resposive layout
```javascript
var options = {
	id_div_container: "visavail_container",
	id_div_graph: "visavail_graph",

	icon: {
		class_has_data: 'fas fa-fw fa-check',
		class_has_no_data: 'fas fa-fw fa-exclamation-circle'
	},
	zoom:{
		enabled:true,
	},
	responsive:{
		enabled:true,
	}
};
```

## 3.4. Implementation
To use the chart in your project, follow these steps:

1. Copy the `visavail.js` and `visavail.css` into your *css and js* forder project.

2. Assuming that your website is in the *root folder*, add the following lines to the `<head>` of your website:
    ```html
    <link href="https://fonts.googleapis.com/css?family=Muli" rel="stylesheet" type="text/css">
    <link href="./css/visavail.css" rel="stylesheet" type="text/css">
    <link href="./css/font-awesome.min.css" rel="stylesheet" type="text/css">
    ```
3. And the following lines to the `<body>` of your website:
    ```html
    <script src="./js/moment-with-locales.min.js" type="text/javascript"></script>
    <script src="./js/d3.min.js" charset="utf-8"></script>
    <script src="./visavail/js/visavail.js"></script>
    
    <div style="overflow: hidden;" class="visavail" id="visavail_container">
		<p id="visavail_graph"><!-- Visavail.js chart will be placed here --></p>
	</div>
    
	<script type="text/javascript">
		moment.locale("en");
		var dataset = ... // see examples/example_basic.htm
		var options = {
			id_div_container: "visavail_container",
			id_div_graph: "visavail_graph",
		};
		
		var chart = visavail.generate(options, dataset)
    </script>
	```


# 4. Download
--------
An archive with the library can be downloaded from the [releases page](https://github.com/flrs/visavail/releases).

# 5. Dependencies
------------
Visavail.js depends on a couple of libraries:
* [D3.js JavaScript library](https://d3js.org/) as a visualization framework,
* [Moment.js](http://momentjs.com/) for formatting dates in tooltips and
* [Font Awesome](http://fontawesome.io) for icons in the tooltips.

# 6. Contribution
------------
I am happy about any contribution or feedback. Please let me know about your comments via the Issues tab on [GitHub](https://github.com/flrs/visavail/issues).

# 7. License
-------
The Visavail.js library is distributed under the [MIT License (MIT)](https://github.com/flrs/visavail/blob/master/LICENSE.md). Please also take note of the licenses of the dependencies.
