# VISAVAIL V 1.5.0

* bug fix on parsing data
* adding new features for add precentage autocalculate or custom
* move thext in front of graph
* add support to icon before y title
* Update readme
  
* # VISAVAIL V 1.4.1

* bug fix 
* align new example for custom categories
BREAKING CHANGE
* custom categories now use classes
  
# VISAVAIL V 1.3.1

* bug fix for parsing date and utc
* merge pull [#42](https://github.com/flrs/visavail/pull/42)
* add new example with pure Data Object
  
# VISAVAIL V 1.2.3

* bug fix for display_date_range

# VISAVAIL V 1.2.2

* bug fix for title show
* update doc with react.js integration
* update doc with viasavail function available
* add function to update options of graph

  BREAKING CHANGE
*updateGraph function now have two argument, first "custom_option" (if you don't want change options you put this to null) and second argument dataset. Before only dataset argument

# VISAVAIL V 1.2.1

* bug fix for tooltip top position
* Add new example with large dataset
* Rewrite function to load custom options
* Add option to create mini graph into sub_chart enablment (this increase laod time of graph in the first instance)
    
  BREAKING CHANGE
* new default option for date_in_utc is FALSE due to increase the speed of graph (moment need a lot of ms to calculate UTC date, see README file) 
* remove touch event captured due to performane iussue and compatibility with smartphone

# VISAVAIL V 1.2.0

* bug fixing
* zoom bug fixing in responsive layout
* integrate d3.js sub chart to zoom/select/move with a buttom bar 

# VISAVAIL V 1.1.0

* bug fixing
* add possibility to create and configure a tooltip on Y label (compatible with HTML)


# VISAVAIL V 1.0.16

* add measure_description into dataset to add some description on lable (see with mouse over)

# VISAVAIL V 1.0.15

* update readme and fix some links

# VISAVAIL V 1.0.12

* add option tooltip for display only first date
* fix bugs on date_plus_time option on tooltip ( now this option override the is_date_only_format calculated automatically)
  
# VISAVAIL V 1.0.11

* move tooltip inside graph container
* css & js refactor for position of tooltip when move
* fix some bugs
  
# VISAVAIL V 1.0.8

* Adding new option for date and time on tooltip
* fix some bugs on mobile and other
  
# VISAVAIL V 1.0.7

* Adding new option and animation for hover tooltip. Now you can zoom the block when hover whit mouse.


# VISAVAIL V 1.0.6

* Fix displayDateRange function and now integrate dataset (for change dataset)


# VISAVAIL V 1.0.5

* Fix tooltip change and redraw when update graph

# VISAVAIL V 1.0.4

* Adding option for density of tick for prevent the overlap of text in x
* Fix moment.locale autodetect, change and override
* Update documentation

# VISAVAIL V 1.0.3

* Fix npm dependecies
* Adding support for custom tick format with specific option
* Adding example for custom tick format
* Adding option for customize the moment.locale() option
* Fix function for autodetect browser language and change dinamically the tick format


# VISAVAIL V 1.0.2

* npm support: now you can isntall for nodejs or other with npm install visavail 
 

# VISAVAIL V 1.0.1

* Adding possibility to use custom categories without define_blocks variable setter. Whit this optione we ignore intervals option for the point of the graph but we consider this option in the last point of the graph (for each object in the dataset) 
* Adding example for this type 
* Insert depedency for Moment (required for process the dataset)
