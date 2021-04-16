# Visavail.js - A Time Data Availability Chart <!-- omit in toc -->
This library visualizes the availability of time-dependent data with a chart on a website.

<br>

## Table of Contents <!-- omit in toc -->

- [7.1. License](#-71-license)](#71-license-71-license)
- [1. Description](#1-description)
- [2. Demo](#2-demo)
- [3. Usage](#3-usage)
  - [3.1. Input Data Format](#31-input-data-format)
    - [3.1.1. Continuous Data](#311-continuous-data)
    - [3.1.2. Data With Time Gaps](#312-data-with-time-gaps)
    - [3.1.3. Data With Dates and Times](#313-data-with-dates-and-times)
    - [3.1.4. Data With Custom Categories](#314-data-with-custom-categories)
    - [3.1.5. Display Style](#315-display-style)
    - [3.1.6. Type of Chart](#316-type-of-chart)
  - [3.2. Data Options](#32-data-options)
    - [3.2.0.1. ~~Measure Labels with HTML~~](#3201-measure-labels-with-html)
    - [3.2.1. Icon property](#321-icon-property)
    - [3.2.2. Percentage property](#322-percentage-property)
    - [3.2.3. Compeld data example](#323-compeld-data-example)
  - [3.3. Chart Options](#33-chart-options)
    - [3.3.1. Margin](#331-margin)
    - [3.3.2. Padding](#332-padding)
    - [3.3.3. Y Title Tooltip](#333-y-title-tooltip)
    - [3.3.4. Tooltip](#334-tooltip)
    - [3.3.4.1. 3.3.4.1 Hover Zoom Option](#3341-3341-hover-zoom-option)
    - [3.3.5. Legend](#335-legend)
    - [3.3.6. Title](#336-title)
    - [3.3.7. Sub Title](#337-sub-title)
    - [3.3.8. Icon](#338-icon)
    - [3.3.9. Graph](#339-graph)
    - [3.3.10. Responsive](#3310-responsive)
    - [3.3.11. Zoom](#3311-zoom)
    - [3.3.12. Sub Chart](#3312-sub-chart)
    - [3.3.12.1. Sub Chart Graph Option](#33121-sub-chart-graph-option)
    - [3.3.13. Custom Tick Format](#3313-custom-tick-format)
    - [3.3.14. Y Percentage](#3314-y-percentage)
    - [3.3.15. Example Usage](#3315-example-usage)
    - [3.3.16. Implementation](#3316-implementation)
    - [3.3.17. Integrate on Angular](#3317-integrate-on-angular)
    - [3.3.18. Integrate on React.js](#3318-integrate-on-reactjs)
    - [3.3.19. 3.1.29.Visavail Function](#3319-3129visavail-function)
- [4. Public Projects With Visavail.js](#4-public-projects-with-visavailjs)
- [5. Download](#5-download)
- [6. Dependencies](#6-dependencies)
- [7. Contribution](#7-contribution)
  - [# 7.1. License](#-71-license)

# 7.1. License](#-71-license)


<br>

# 1. Description
The Visavail.js chart allows a quick insight into which periods of time a time-dependent dataset covers. It is visually similar to a Gantt chart and allows easy identification of missing pieces and gaps in large datasets. Missing periods of data are marked in red while blocks of complete periods of data are marked in green. The user discovers dates that define start and end of such periods by tooltips, as shown in the picture below.

![Preview of Visavail.js chart](preview.jpg "Visavail.js Sample Chart")

An example use case is the visualization of a dataset that contains time-dependent stock market data. The question the Visavail.js chart tries to answer is

*"Do I have continuous stock market data in my dataset and if not, where are the gaps?"*

The Visavail.js library takes single data points with dates and information about data availability as inputs, combines them into time blocks, and visualizes these blocks.

<br>

# 2. Demo
Some example of Visavail.js in action is displayed at [Demo](https://flrs.github.io/visavail/docs/index.html). 
The source code of the a basic demo is shown in the file [basic.html](https://github.com/flrs/visavail/blob/master/docs/samples/basic.html).

<br>

# 3. Usage
Input data format, display style and dependencies have to be considered for using the Visavail.js library successfully. The respective code snippets are explained below.

<br>

## 3.1. Input Data Format
The input to the Visavail.js library is a JSON-like structure. There are four formats that Visavail.js accepts. Which format is right for you depends on your use case.

<br>

### 3.1.1. Continuous Data
You should use the continuous data format if you want to display continuous recordings. Visavail.js assumes that information about the availability of some data is valid until the next data point shows up.
Thus, the library will plot a continuous bar from the first to the last data point. The last data point will be assumed valid for a period of `"interval_s"`.
The below code comments point out the elements that should be included in the input data.
```javascript
var dataset = [{
    "measure": "Annual Report", // name of the data series, will become y-axis label
    "measure_description": "Descripion of Annual Report" // description of y-axis label, visible with mouse over
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
If you want to add some descpription regarding measure, you can add a `"measure_description"` key to single dataset.
Without enable y_title_tooltip enablement you can see the description as a svg title (no html enablement), if you enable the tooltip funziton for y title you can use also html tag for tooltip.

<br>

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

<br>

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

<br>

### 3.1.4. Data With Custom Categories
If you want to show data in other categories than "data available" and "no data available", the following example is for you. Visavail.js also supports displaying data in custom categories. In this case, you have to assign all of your categories a name and a `class` that is used for displaying the category in the chart.

The chart legend will not appear on charts with data in custom categories. 
In adding you have a `tooltip_html` key that you can use to display some html code when you hover over the bars in the chart. 
If `tooltip_html` is empty we display the name of value used on categories.

See the code below for an example.
```javascript
var dataset = [{
    "measure": "Fat Bike",
    "categories": { // category names and their colors defined here
        "0": {class: "rect_has_no_data", tooltip_html: '<i class="fas fa-fw fa-exclamation-circle tooltip_has_no_data"></i>' },
        "1": {class: "rect_has_data", tooltip_html: '<i class="fas fa-fw fa-check tooltip_has_data"></i>'},
        "Zoe": {class: "rect_purple" , tooltip_html: '<i class="fas fa-fw fa-trophy tooltip_purple"></i>'},
    },
    "category_percentage": "Zoe", // if percentage enable, calculates the percentage of this category
    "data": [
        ["2016-01-01 12:00:00", "Kim", "2016-01-01 13:00:00"],
        ["2016-01-01 14:22:51", "Zoe", "2016-01-01 16:14:12"],
        ["2016-01-01 16:14:12", "Bert", "2016-01-01 17:14:12"],
        ["2016-01-01 19:20:05", "Zoe", "2016-01-01 20:30:00"]
    ]
}];
```

<br>

### 3.1.5. Display Style

The display style of the chart is defined by a CSS style. The names of the different CSS classes in the [CSS style file](https://github.com/flrs/visavail/blob/master/visavail.css) are self-explanatory.

<br>

### 3.1.6. Type of Chart

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

<br>

## 3.2. Data Options

The options of the data are in JSON format and you can customize everything.
| Name | Type | Default | Description |
| ---- |------| ------- | ---------- |
| *measure* | `string` | Name of measure that will be displayed on left side |
| *measure_url* | `string` | Url that you can set as a link of measure|
| *measure_description* | `string` | Description of mesurament diplayed when `y_title_tooltip` is enabled|
| *interval_s* | `number` | Used on dataset without defined block to define dimension of last block |
| *data* | `[ [] ... []]` | Array of Array Object that contain data to be displayed |
| *icon* | `Object{}` | **[more info](#321-icon-property)** | Json Object that contain icon setting that will be pre-append to y title |
| *percentage* | `Object{}` | **[more info](#322-percentage-property)** | Json Object used in cans og char option: `y_percentage.enable` and `y_percentage.custom_percentage` is setted a true  |

#<br>

### 3.2.0.1. ~~Measure Labels with HTML~~
~~Measure labels can be expressed in full HTML via the `measure_html` property in the `dataset`. Here is an example:~~
_At the moment this type of labels are suspended due to incompatibility with IE11 and wrapping text_

**WE HAVE INTRODUCED `measure_description` that in combination with `y_title_tooltip` can support html tag**

<br>

### 3.2.1. Icon property
| Name | Type | Default | Description |
| ---- |------| ------- | ---------- |
| *url* | `string` | Url of image|
| *width* | `int` | Width of image to be used |
| *height* | `int` | Width of image to be used |
| *padding* | `Object{left: int, right: int }` | Object with 2 key, left, for add margin to left, right to add margin on right |
| *background_class* | `string` | Class for customize the circle appended on the background of icon |

<br>

<br>

### 3.2.2. Percentage property
| Name | Type | Default | Description |
| ---- |------| ------- | ---------- |
| *measure* | `string` | Value to set on the right of the graph|
| *class* | `string` | Class to be used for this custom param |  

<br>

### 3.2.3. Compeld data example
This is a simple compelx example with all data features enabled:
```javascript
var dataset = [{
    "measure": "Fat Bike",
    "categories": { // category names and their colors defined here
        "0": {class: "rect_has_no_data", tooltip_html: '<i class="fas fa-fw fa-exclamation-circle tooltip_has_no_data"></i>' },
        "1": {class: "rect_has_data", tooltip_html: '<i class="fas fa-fw fa-check tooltip_has_data"></i>'},
        "Zoe": {class: "rect_purple" , tooltip_html: '<i class="fas fa-fw fa-trophy tooltip_purple"></i>'},
    },
    "category_percentage": "Zoe", // if percentage enable, calculates the percentage of this category
    "data": [
        ["2016-01-01 12:00:00", "Kim", "2016-01-01 13:00:00"],
        ["2016-01-01 14:22:51", "Zoe", "2016-01-01 16:14:12"],
        ["2016-01-01 16:14:12", "Bert", "2016-01-01 17:14:12"],
        ["2016-01-01 19:20:05", "Zoe", "2016-01-01 20:30:00"]
    ],
    "icon": {
      "url":"your_url_file",
      "width": 24,
      "height":24,
      "padding": {
          "left": 0,
          "right": 5
      },
      "background_class": "icon_class"
    },
    "percentage": { //used for customize right text
        "measure": "45 %",
        class: "y_percentace_test"
    }
}];
```
<br>

## 3.3. Chart Options

The options of the chart are in JSON format and you can customize everything.
You can pass the JSON Object to library with custom settings

| Name | Type | Default | Description |
| ---- |------| ------- | ---------- |
| *id_div_container* | `string` | **visavail_container** | Id of div that contain the graph tag |
| *moment_locale* | `string` | autodetect | The lib autodetect language browser and set the moment library automatically. You can change this parameter with a string contained into locale moment.js lib. if you set to null moment use "en" format as default (see moment.js library)|
| *margin* | `Object{}` | **[more info](#331-margin)** | Json Object that contain margin of graphs include title, legent etc. |
| *padding* | `Object{}` | **[more info](#332-padding)** | Json Object that contain padding of graphs |
| *width* | `number` | **960** | Width of the graph, this option was ignored if option resposive is enabled |
| *reduce_space_wrap* | `number` | **36** | Space for three dots when you use a simple title of mesurment |
| *line_spacing* | `number` | **16** | Space between two row of dataset |
| *emphasize_year_ticks* | `boolean` | **true** | Emphasize the year when the range of data cover one more year |
| *emphasize_month_ticks* | `boolean` | **true** | Emphasize the month when the range of data cover one more month and not exceed the year |
| *max_display_datasets* | `number` | **0** | max. no. of datasets that is displayed, 0: all (is the same option of original library) |
| *ticks_for_graph* | `number` | **6** | number of ticks that is displayed, null: max enter in the tick (may cause overlap problem). N.B the ticks are controlled by d3.js lib. in some case this value will be ignored but help you for prevent overlap xaxis top |
| *cur_display_first_dataset* | `number` | **0** | current first dataset to display (is the same option of original library) |
| *display_date_range* | `Array[]` | **[0,0]** | range of dates that will be shown. If from-date (1st element) or to-date (2nd element) is zero, it will be determined according to your data (default: automatically) |
| *custom_categories* | `boolean` | **false** | Set to true if you want to use custom category |
| *is_date_only_format* | `boolean` | **false** | Check if the date is with date only ( will set Automatically) |
| *show_y_title* | `boolean` | **true** | If you set to fale, reminder to set properly margin and padding left |
| *y_title_some_unavailability_class* | `string` | some_unavailability | Set a additional custom class to y_title when some unavailability, if you want |
| *y_title_total_unavailability_class* | `string` | total_unavailability | Set a additional custom class to y_title when total unavailability, if you want |
| *y_title_total_availability_class* | `string` | total_availability | Set a additional custom class to y_title when total availability, if you want |
| *date_in_utc* | `boolean` | **false** | Set true or false in base of your type of date. If true we use moment to set the date in the current user timezone or in the timezone set by script. For improve the speed of graph we suggest to you to set this parameter to false and convert your dataset with moment before send to graph |
| *date_is_descending* | `boolean` | **false** | Set true if you want display your dataset is descending version (from now to old). If false the data was diplayed in standard view N.B.: the data in dataset is in ascending order |
| *defined_blocks* | `boolean` | **false** | If set to true the we ignore interval_s options in datasets and we use a block defined. This option is set automatically if in there is a date/time defined |
| *onClickBlock* | `function(d,i)` | null | return "d" an arry with date and value precessed and "i" value of block clicked item |
| *y_title_tooltip* | `Object{}` | **[more info](#333-y-title-tooltip)** | Json Object that contain tooltip option for the graph. For the content of div we use  `"measure_description"` tag that can be contain also html tag|
| *y_percentage* | `Object{}` | **[more info](#3314-y-percentage)** | Json Object that contain y_percentage option for the graph |
| *tooltip* | `Object{}` | **[more info](#334-tooltip)** | Json Object that contain tooltip option for the graph |
| *legend* | `Object{}` | **[more info](#335-legend)** | Json Object that contain legend option for the graph |
| *title* | `Object{}` | **[more info](#336-title)** | Json Object that contain title option for the graph |
| *sub_title* | `Object{}` | **[more info](#337-sub-title)** | Json Object that contain sub-title option for the graph |
| *icon* | `Object{}` | **[more info](#338-icon)** | Json Object that contain icon option for the graph |
| *graph* | `Object{}` | **[more info](#339-graph)** | Json Object that contain option for custom type of graph |
| *responsive* | `Object{}` | **[more info](#3310-responsive)** | Json Object that contain option for responsive layout of graph |
| *zoom* | `Object{}` | **[more info](#3311-zoom)** | Json Object that contain option for zoom in the graph |
| *sub_chart* | `Object{}` | **[more info](#3312-sub-chart)** | Json Object that contain option for enable sub-chart in the graph |
| *custom_time_format* | `Object{}` | **[more info](#3313-custom-tick-format)** | Json Object that contain option for customize the x-axes tick into graph |

<br>

### 3.3.1. Margin

| Name | Type | Default | Description |
| ---- |------| ------- | ---------- |
| *top* | `number` | 65 | Number express in px |
| *bottom* | `number` | 40 | Number express in px |
| *right* | `number` | 20 | Number express in px |
| *left* | `number` | 100 | Number express in px |

<br>

### 3.3.2. Padding

| Name | Type | Default | Description |
| ---- |------| ------- | ---------- |
| *top* | `number` | -50 | Number express in px |
| *bottom* | `number` | 10 | Number express in px (not used at the moment) |
| *right* | `number` | 0 | Number express in px, used for move the y percentage on the right |
| *left* | `number` | -100 | Number express in px, used for move the y title on the left |

<br>

### 3.3.3. Y Title Tooltip

| Name | Type | Default | Description |
| ---- |------| ------- | ---------- |
| *enabled* | `boolean` | false | enable possibility to activate tooltip over on Y lable |
| *class* | `string` | y-tooltip | Set a custrom class if you want |
| *type* | `string` | right | Three type of tooltip:  "top" is a div on top of y label, "bottom" is a div on bottom of y label,"right" is a div on right of y label, |
| *spacing* | `Object{}` |```{left: 15, right:15, top: 15,bottom:10}``` | used to add space to tooltip in base of tooltip type selected |
| *fixed* | `boolean` | false | Valid only on "left" tooltip type, if true fixed the tooltip all right of y lable |
| *duration* | `number` | 150 | Number in ms for the animation duration (all tooltip otpion) |

<br>

### 3.3.4. Tooltip

| Name | Type | Default | Description |
| ---- |------| ------- | ---------- |
| *class* | `string` | tooltip | Set a custrom class if you want |
| *height* | `number` | 10 | height of tooltip , correspond to line-height of class tooltip from css) |
| *position* | `string` | top | Two type of tooltip:  "top" is a div before bar follow the mouse only left, "overlay" follow the mouse left and height |
| *left_spacing* | `number` | 0 | Left space from tooltip and mouse |
| *date_plus_time* | `boolean` | false | enable date and time on tooltip (override the *is_date_only_format* option) |
| *only_first_date* | `boolean` | false | show only first date on tooltip (we suggest to use this on rhombus or circle graph) |
| *duration* | `number` | 150 | Number in ms for the animation duration (all tooltip otpion) |
| *hover_zoom* | `Object{}` |**[more info](#3341-hover-zoom-option)**|option for zoom block on hover |

#<br>

### 3.3.4.1. 3.3.4.1 Hover Zoom Option
| Name | Type | Default | Description |
| ---- |------| ------- | ---------- |
| *enabled* | `boolean` | false | Enable block zoom whe mouse hover |
| *ratio* | `number` | 0.4 | Number from 0 to 1 that incrase the block size. It will be multiplied with option line_spacing |


<br>

### 3.3.5. Legend

| Name | Type | Default | Description |
| ---- |------| ------- | ---------- |
| *enabled* | `boolean` | true | Enable the legend (If you use a custom categories the legend is hidden) |
| *line_space* | `number` | 12 | height of legend font , correspond to line-height of class tooltip from css) |
| *offset* | `number` | 5 | Distance from two data of legend |
| *x_right_offset* | `number` | 150 | Legend position distance from right |
| *has_no_data_text* | `string` | No Data available | String for no data available |
| *has_data_text* | `string` | Data available | String for no data available |

<br>

### 3.3.6. Title

| Name | Type | Default | Description |
| ---- |------| ------- | ---------- |
| *enabled* | `boolean` | true | Enable the title |
| *line_space* | `number` | 16 | height of legend font , correspond to line-height of class tooltip from css) |
| *text* | `string` | Data Availability Plot | String Title |

<br>

### 3.3.7. Sub Title

| Name | Type | Default | Description |
| ---- |------| ------- | ---------- |
| *enabled* | `boolean` | true | Enable the title |
| *line_space* | `number` | 16 | height of legend font , correspond to line-height of class tooltip from css) |
| *from_text* | `string` | from | String for from date |
| *to_text* | `string` | to | String for to date  |

<br>

### 3.3.8. Icon

| Name | Type | Default | Description |
| ---- |------| ------- | ---------- |
| *class_has_data* | `string` | fas fa-fw fa-check | custom icon call (for example font awesome) |
| *class_has_no_data* | `string` | fas fa-fw fa-times | custom icon call (for example font awesome)  |

<br>

### 3.3.9. Graph

| Name | Type | Default | Description |
| ---- |------| ------- | ---------- |
| *type* | `string` | bar | There are three type of graph; "bar" is a classical horizzontal bar, "rhombus" use a rhombus for a simple alert, "circle" a drop for a event chart |
| *height* | `number` | 20 | height of type of graph |
| *width* | `number` | 20 | width of type of graph, used only for rhombus type and circle type|

<br>

### 3.3.10. Responsive

| Name | Type | Default | Description |
| ---- |------| ------- | ---------- |
| *enabled* | `boolean` | false | Enable the resposive chart for a responsive layout (this option recreate the chart when the page or div of chart will be resized) |
| *onresize* | `function` | null | at the moment not supported |


<br>

### 3.3.11. Zoom

| Name | Type | Default | Description |
| ---- |------| ------- | ---------- |
| *enabled* | `boolean` | false | Enable the zoom in the chart. We can zoom with mousewheel and you can mof left-right for move in the graph |
| *onZoom* | `function(e)` | null | return a current array with current domain of current zoom in date format |
| *onZoomStart* | `function(e)` | null | return a d3.event json object when zoom start |
| *onZoomEnd* | `function(e)` | null | return a array with current domain of current zoom in date format at the end of the zoom |


<br>

### 3.3.12. Sub Chart

| Name | Type | Default | Description |
| ---- |------| ------- | ---------- |
| *enabled* | `boolean` | false | Enable the sub-chart under the chart. We can drag, move, zoom with this |
| *height* | `number` | 0 | Height of bottom sub chart |
| *animation* | `boolean` | true | Enable animation when you drag, move the sub_chart bar |
| *margin* | `Object{}` |{top:20, bottom:0}|Integer value to add some space top or bottom after sub_chart |
| *graph* | `Object{}` |**[more info](#33121-sub-chart-graph-option)**|option for zoom block on hover |


#<br>

### 3.3.12.1. Sub Chart Graph Option

| Name | Type | Default | Description |
| ---- |------| ------- | ---------- |
| *enabled* | `boolean` | true | Create a mini chart into sub_chart bar (need to have a sufficient height to contain the graph) |
| *width* | `number` | 7 | width of type of graph, used only for rhombus type and circle type |
| *height* | `number` | 7 | height of type of graph into sub_chart|
| *line_spacing* | `number` | 7 | Space between two row of dataset into sub_chart |


<br>

### 3.3.13. Custom Tick Format

This library use moment.js to customize and convert the date format/language in base of moment.locale() function (we autodetect the browser language!). If you what change manually the tick format you can customize with this option.

With set this option you override the automatic tick format execute by library for a specific locale. 

| Name | Type | Default | Description |
| ---- |------| ------- | ---------- |
| *format_millisecond* | `string` | moment convertion | custom format for millisecond |
| *format_second* | `string` | moment convertion | custom format for second |
| *format_minute* | `string` | moment convertion | custom format for minute |
| *format_hour* | `string` | moment convertion | custom format for hour |
| *format_day* | `string` | moment convertion | custom format for day |
| *format_week* | `string` | moment convertion | custom format for week |
| *format_month* | `string` | moment convertion | custom format for month |
| *format_year* | `string` | moment convertion | custom format for year |


<br>

### 3.3.14. Y Percentage

| Name | Type | Default | Description |
| ---- |------| ------- | ---------- |
| *enabled* | `boolean` | false | enable percentage |
| *some_unavailability_class* | `string` | some_unavailability | Set a additional custom class to y_percentage when some unavailability, if you want |
| *total_unavailability_class* | `string` | total_unavailability | Set a additional custom class to y_percentage when total unavailability, if you want |
| *total_availability_class* | `string` | total_availability | Set a additional custom class to y_percentage when total availability, if you want |
| *percentageFormat* | `function` | See code | Set a custom percentage format function if you want |
| *unavailabililty_percentage* | `boolean` | false | If true, calculates the percentage of unavailability instead of availability. Not valid if custom categories enabled |
| *custom_percentage* | `boolean` | false | If true, append a custom text present in the measurment data under key: `percentage.measure` |

<br>

### 3.3.15. Example Usage

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

<br>

### 3.3.16. Implementation
To use the chart in your project, follow these steps:

1. Copy the `visavail.js` and `visavail.css` into your *css and js* forder project (for minify version).

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

  
<br>

### 3.3.17. Integrate on Angular

You can use this library in your Anular 2+ project (tested from 2 to 8 version). Follow this step to integrate it:

1. Add to your `package.json` d3, moment and visavail package with npm installation

2. In your component in the import section insert this line
    ```javascript 
    import * as visavail from "visavail";
    ```

3.  Create JSON an object in your component class that can be contain the dataset, options and chart

4.  Add the div in your html where you want to put the graph

5.  Call visavail.generate(...) funtion to generate the graph

An example of implementation, you can found [HERE](https://codesandbox.io/s/angular-o8gxt)


<br>

### 3.3.18. Integrate on React.js

You can use this library in your React project (not compleated tested). Follow this step to integrate it:

1. Add to your `package.json` d3, moment and visavail package with npm installation

2. In your component in the import section insert this line
    ```javascript 
    import * as visavail from "visavail";
    ```

3.  Create JSON an object in your component class that can be contain the dataset, options and chart

4.  Add the div in your render() function 

5.  Call visavail.generate(...) funtion to generate the graph into componentDidMount()

6.  If you want update the chart with new data, you can call the updateGraph(dataset) function into componentDidUpdate() react function

An example of implementation, you can found [HERE](https://codesandbox.io/s/crazy-surf-9hpmg)


<br>

### 3.3.19. 3.1.29.Visavail Function

The Visavail library have inside a series of function for update, change and delete the graph without using manual funtion.
Below you can find a table that explain thi function.
You can associate `chart = visavail.generate(.....)` and call `chart.someFunctio()` to change the graph

| Name | Argument | Description |
| ---- |------| ---------- |
| *udpateGraph(options, dataset)* | options: JSON object with options, dataset: Array of JSON | With this function you can update the graph with new optiorn or new data or something related to dataset object. If you wnat mantain same oprion, you che put the first argument as null |
| *resizeWidth(width)* | width: Number| With this function you can update manually the width of the graph |
| *displayDateRange(date_range, dataset)* | date_range: [first date, second_date], dataset: Array of JSON | With this function you can update the date range of the graph to focus the graph in a specific time of period |
| *destroy()* | empty | With this function you can delete the graph and all div generate by library |


<br>

# 4. Public Projects With Visavail.js

- [Jina Yoon](https://jinayoon.github.io/) of Brown University used Visavail.js in her [sleep tracker comparison](http://sleep.cs.brown.edu/comparison/)
- [GanttLab](https://gitlab.com/ganttlab/ganttlab) uses Visavail.js to present Gitlab and Github issues in a Gantt chart

<br>

# 5. Download
An archive with the library can be downloaded from the [releases page](https://github.com/flrs/visavail/releases).

<br>

# 6. Dependencies
Visavail.js depends on a couple of libraries:
* [D3.js JavaScript library](https://d3js.org/) as a visualization framework,
* [Moment.js](http://momentjs.com/) for formatting dates in tooltips and
* [Font Awesome](http://fontawesome.io) for icons in the tooltips.

<br>

# 7. Contribution
We are happy about any contribution or feedback. Please let us know about your comments via the Issues tab on [GitHub](https://github.com/flrs/visavail/issues).

<br>

# 7.1. License
-------
The Visavail.js library is distributed under the [MIT License (MIT)](https://github.com/flrs/visavail/blob/master/LICENSE.md). Please also take note of the licenses of the dependencies.
