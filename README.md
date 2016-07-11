Visavail.js - A Time Data Availability Chart
=============================
This library visualizes the availability of time-dependent data with a chart on a website.

Description
-----------
The Visavail.js chart allows a quick insight into which periods of time a time-dependent dataset covers. It is visually similar to a Gantt chart and allows easy identification of missing pieces and gaps in large datasets. Missing periods of data are marked in red while blocks of complete periods of data are marked in green. The user discovers dates that define start and end of such periods by tooltips, as shown in the picture below.

![Preview of Visavail.js chart](preview.jpg "Visavail.js Sample Chart")

An example use case is the visualization of a dataset that contains time-dependent stock market data. The question the Visavail.js chart tries to answer is

*"Do I have continuous stock market data in my dataset and if not, where are the gaps?"*

The Visavail.js library takes single data points with dates and information about data availability as inputs, combines them into time blocks, and visualizes these blocks.

Demo
----
A demo of Visavail.js in action is displayed at [http://bit.ly/1tevllL](http://bit.ly/1tevllL). The source code of the demo is shown in [examples/example_basic.htm](example_basic.htm).

Usage
-----
Input data format, display style and dependencies have to be considered for using the Visavail.js library successfully. The respective code snippets are explained below.

### Input Data Format
The input to the Visavail.js library is a JSON-like structure. There are two formats that Visavail.js accepts. Which format is right for you depends on your use case.

#### Continuous Data
You should use the continuous data format if you want to display continuous recordings. Visavail.js assumes that the availability of some data are valid until a next data point shows up.
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

#### Data With Time Gaps
You should use the time gap data format if you want to display recordings that are not continuous. The availability data are valid for a specific period of time. This period is defined by a start
and an end date, as shown in the code below. In this case, no information about `"interval_s"` (as explained in the previous use case) is needed.
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

### Display Style
The display style of the chart is defined by a CSS style. The names of the different CSS classes in the [CSS style file](visavail/css/visavail.css) are self-explanatory.

### Implementation
To use the chart in your project, follow these steps:

1. Copy the `vendors` folder and the `visavail` folder to the *root folder* of your project.

2. Assuming that your website is in the *root folder*, add the following lines to the `<head>` of your website:
    ```html
    <link href="https://fonts.googleapis.com/css?family=Muli" rel="stylesheet" type="text/css">
    <link href="./visavail/css/visavail.css" rel="stylesheet" type="text/css">
    <link href="./vendors/font-awesome/css/font-awesome.min.css" rel="stylesheet" type="text/css">
    ```
3. And the following lines to the `<body>` of your website:
    ```html
    <script src="./vendors/moment/moment-with-locales.min.js" type="text/javascript"></script>
    <script>
        moment.locale("en");
    </script>
    <script src="./vendors/d3/d3.min.js" charset="utf-8"></script>
    <script type="text/javascript">
        var dataset = ... // see examples/example_basic.htm
    </script>
    <script src="./visavail/js/visavail.js"></script>
    
    <p id="example"><!-- Visavail.js chart will be inserted here --></p>
    
    <script>
        var chart = visavailChart().width(800); // define width of chart in px
        d3.select("#example")
                .datum(dataset)
                .call(chart);
    </script>
    ```

Examples
--------
Four examples are provided with Visavail.js.

1. **Basic Example** The [basic example](examples/example_basic.htm) gives you the quick "plug and play" experience.

2. **Time Gap Example** Check out the [time gap example](examples/example_timegaps.htm) for getting to know how to define time gaps in your input dataset.

2. **Pagination with Bootstrap** As datasets grow bigger, you might want to display the data in pages. [This Bootstrap pagination example](examples/example_pagination_bootstrap.htm) has you covered.

3. **Responsive Layout with Bootstrap** When optimizing for mobile, [this example with responsive layout](examples/example_responsive_bootstrap.htm) is a good starting point.

Download
--------
An archive with the library can be downloaded from the [releases page](https://github.com/flrs/visavail/releases).

Dependencies
------------
Visavail.js depends on a couple of libraries:
* [D3.js JavaScript library](https://d3js.org/) as a visualization framework,
* [Moment.js](http://momentjs.com/) for formatting dates in tooltips and
* [Font Awesome](http://fontawesome.io) for icons in the tooltips.

Contribution
------------
I am happy about any contribution or feedback. Please let me know about your comments via the Issues tab on [GitHub](https://github.com/flrs/visavail/issues).

License
-------
The Visavail.js library is distributed under the [MIT License (MIT)](https://github.com/flrs/visavail/blob/master/LICENSE.md). Please also take note of the licenses of the dependencies.
