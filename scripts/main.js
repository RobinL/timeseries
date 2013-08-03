// Linechart class
function LineChart(svgObj){
	//will want an update() method to update 
	//To scale to svg

	var svgObj = svgObj;

	var x = d3.scale.linear()
			.domain([0,100])
			.range([0, svgObj.width]);

	var y = d3.scale.linear()
			.domain([0,100])
			.range([svgObj.height, 0]);


	var xAxis = d3.svg.axis().scale(x)
	    .orient("bottom").ticks(5);

	var yAxis = d3.svg.axis().scale(y)
	    .orient("left").ticks(5);

	var valueline = d3.svg.line()
		.defined(function(d) { return d != null; })
	    .x(function(d,i) { return x(i); })
	    .y(function(d) { return y(d); });

	svgObj.svg.append("g")         // Add the X Axis
		    .attr("class", "x axis")
		    .attr("transform", "translate(0," + y(0)+ ")")
		    .call(xAxis);

	svgObj.svg.append("g")         // Add the Y Axis
	    .attr("class", "y axis")
	    .call(yAxis);

	this.reDraw = function() {

		
		//Get domain

		var xDomain = [0,100];
		var yDomain = [0,100];

		allSeries = _.reduce(series,function(a,b) {
			return a.concat(b)
		});

		getXLength = _.reduce(series, function(a,b) {
			return Math.max(a,b.length)
		},series[0].length);


		x = d3.scale.linear()
			.domain([0,getXLength])
			.range([0, svgObj.width]);

		y = d3.scale.linear()
				.domain(d3.extent(allSeries))
				.range([svgObj.height, 0]);

		//plot axes

		var xAxis = d3.svg.axis().scale(x)
	    .orient("bottom").ticks(5);

	

		var yAxis = d3.svg.axis().scale(y)
		    .orient("left").ticks(5);

		svgObj.svg.select(".x.axis")         // Add the X Axis
		    .call(xAxis);

		svgObj.svg.select(".y.axis") 
		    .call(yAxis);



		//Update and enter the new series

		var seriesBound = svgObj.svg.selectAll(".lines").data(series);

		//Plot each series

		seriesBound.enter().append("path")      // Add the valueline path.
		        .attr("d", function(d) {
		        	return valueline(d)
		        })
		        .attr("class", "lines");

		//Later might need an exit here
		seriesBound     // Add the valueline path.
		        .attr("d", function(d) {
		        	return valueline(d)
		        })
		        .attr("class", "lines");


		

	}

	var series = [];
	this.addSeries = function(ar) {

		series.push(ar);
		this.reDraw();

	}




}


var vis = (function() {

var svgMargin = {
		top: 40,
		right: 40,
		bottom: 40,
		left: 40
	};

var svgHolder = d3.select("#svgholder");

var lineChartContainer = new SvgStore(500,500,svgMargin,svgHolder);

var numPoints=500;




var lineC = new LineChart(lineChartContainer);

var startData = randomWalk(numPoints);
lineC.addSeries(startData.series);

var newdata = randomWalk(numPoints,startData);
lineC.addSeries(newdata.series);

var newdata = randomWalk(numPoints,startData);
lineC.addSeries(newdata.series);





})()




// SvgStore initialises a new SVG into a container
function SvgStore(width,height,margins,holder){

	this.height = height;
	this.width = width;

	this.svgMargin = margins;

	this.svgHeight =  height + this.svgMargin.top+this.svgMargin.bottom;
	this.svgWidth  =  width + this.svgMargin.left+this.svgMargin.right;
	
	this.svg = holder.append("svg")
		.attr("width", this.svgWidth)
		.attr("height", this.svgHeight)
		.append("g")
		.attr("class","margingroup")
		.attr("transform", "translate(" + this.svgMargin.left + "," + this.svgMargin.top + ")");
}


function randomWalk(numPoints,startData){

var newData = [];
var errors = [];

if (startData) {
	errors = startData.errors;
}


var newErrors = d3.range(numPoints);
_.map(newErrors,function(x,i,ar){
	ar[i] = d3.random.normal(0,1)();
});

errors= errors.concat(newErrors);


var series = [];


_.map(errors, function(x,i,ar) {
	if (i) series.push(x+series[i-1]);
	else series.push(0);
});

if (startData){
	for (var i = 0; i < startData.series.length; i++) {
		series[i] = undefined;
	};
};


return {series:series, errors:errors};

}
