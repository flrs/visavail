Visavail.js - A Time Data Availability Visualization Chart
=============================
This library visualizes the availability of time-dependent data with a chart on a website.

Description
-----------
The Visavail.js visualization allows a quick insight into which periods of time a time-dependent dataset covers. It is built up similar to a Gantt chart and allows easy identification of missing pieces and gaps in large datasets. Missing periods of data are marked in red while blocks of complete periods of data are marked in green. The user can discover dates that define start and end of such periods by tooltips, such as shown in the below picture.

![Preview of Visavail.js chart](preview.jpg "Visavail.js Sample Chart")

An example use case is the visualization of a dataset that contains time-dependent stock market data. The question the Visavail.js chart tries to answer is

*"Do I have continuous stock market data in my database and if not, where are the gaps?"*

The Visavail.js library takes single data points with dates and information about data availability as inputs, combines them into time blocks, and visualizes these blocks.

Usage
-----
Input data format, display style and implementation have to be considered for using the Visavail.js library successfully. An example is provided in the file [example.htm](example.htm). Code of this file is explained below.

### Input Data Format
The input to the Visavail.js library is a JSON-like structure. The below code comments point out the elements that should be included in the input data.
```javascript
var dataset = [{
    "measure": "Annual Report", // name of the data series, will become y-axis label
    "interval_s": 365 * 24 * 60 * 60, // time period in seconds a single data point is expected to cover
    "data": [
        ["2015-01-01", 0], // data as arrays of period start data string and bit determining if data is available for that period
        ["2016-01-01", 1],
        ["2017-01-01", 1],
        ["2018-01-01", 1]
    ]
}];
```

### Display Style
The display style of the chart is defined by a CSS style. The names of the different CSS classes in the [example file](example.htm) are self-explanatory.

### Implementation
To use the chart, the following lines should be added to the `<head>` of the website:
```html
<link href='https://fonts.googleapis.com/css?family=Muli' rel='stylesheet' type='text/css'>
<style>
    ... /* see example.htm */
</style>
<link rel="stylesheet" type="text/css" href="./vendors/fontello/css/fontello.css">
```

And the following lines to the `<body>` of the website:
```html
<script src="./vendors/moment/moment-with-locales.min.js" type="text/javascript"></script>
<script>
    moment.locale('en');
</script>
<script src="./vendors/d3/d3.min.js" charset="utf-8"></script>
<script type="text/javascript">
    var dataset = ...// see example.htm
</script>
<script src="./resources/visavail.js"></script>

<p id="example"><!-- chart will be inserted here --></p>

<script>
    var chart = visavailChart().width(800); // define width of chart in px
    d3.select("#example")
            .datum(dataset)
            .call(chart);
</script>
```

Download
--------
An archive with the library can be downloaded from the [releases page](https://github.com/flrs/visavail/releases).

Dependencies
------------
Visavail.js depends on the [D3.js JavaScript library](https://d3js.org/) as a visualization framework and [Moment.js](http://momentjs.com/) for formatting dates in tooltips.

Contribution
------------
I am happy about any contribution or feedback. Please let me know about your comments via the Issues tab on [GitHub](https://github.com/flrs/visavail/issues).

License
-------
The Visavail.js library is distributed under the [MIT License (MIT)](https://github.com/flrs/visavail/blob/master/LICENSE.md). Please also take note of the licenses of the dependencies.
