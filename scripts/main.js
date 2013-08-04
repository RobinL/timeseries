// Linechart class
function LineChart(svgObj){
	
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


		//Colour scale
		minEnd = _.reduce(series,function(a,b,i) {
			if (i==0) return a;
			else return Math.min(a,b[b.length-1]);
		}, series[1][series[1].length-1]);

		maxEnd = _.reduce(series,function(a,b,i) {
			if (i==0) return a;
			else return Math.max(a,b[b.length-1]);
		}, series[1][series[1].length-1]);


		var lineColor=d3.scale.linear().domain([minEnd,(minEnd+maxEnd)/2,maxEnd]).range(["red","steelblue", "red"]);


		//Plot each series

		seriesBound.enter().append("path")      // Add the valueline path.
			.attr("d", function(d) {
				return valueline(d)
			})
			.attr("class", "lines")
			.style("opacity", function(d,i) {
				if (i==0) {return 1;}
				else {return 0.1;}
			})
			.style("stroke-width", function(d,i) {
				if (i==0) {return 2;}
				else {return 2;}
			})
			.style("stroke", function(d,i) {
				if (i ==0) return undefined;
				else return lineColor(d[d.length-1]);
			})
			

		
		seriesBound     
			.attr("d", function(d) {
				return valueline(d)
			})
			.attr("class", "lines");

		//Later might need an exit here

	}

	var series = [];
	this.addSeries = function(ar,rd) {
		series.push(ar);
		if (rd) this.reDraw();
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

	var lineChartContainer = new SvgStore(800,500,svgMargin,svgHolder);

	var numPoints=200;

	var lineC = new LineChart(lineChartContainer);

	

	var spec = {
		v: 1,
		c: 0,
		t: 0,
		ar: 1,
		ma: 0
	};

	var startData = generateSeries(spec,numPoints);
	lineC.addSeries(startData.series);

	// Add a bunch of lines all starting at the beginning of the forecast horizon
	for (var i = 0; i < 50; i++) {
		var newdata = generateSeries(spec, numPoints,startData);
		lineC.addSeries(newdata.series,0);
	};

	lineC.reDraw();

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



function generateSeries(spec,numPoints, startData) {

	var newData = [];
	var errors = [];

	if (startData) {
		errors = startData.errors;
	}

	var newErrors = d3.range(numPoints);
	_.map(newErrors,function(x,i,ar){
		ar[i] = d3.random.normal(0,spec.v)();
	});

	errors= errors.concat(newErrors);

	var series = ARIMA(spec,errors);

	if (startData){
		for (var i = 0; i < startData.series.length; i++) {
			series[i] = undefined;
		};
	};

	return {series:series, errors:errors};

}

function ARIMA(spec, errors) {

	function lag(array,i,order) {
		if (array[i-order]) return array[i-order]
			else return 0;
	}

	var returnSeries = [];
	_.map(errors, function(x,i,ar) {
		returnSeries[i] = spec.c + spec.t*i+ spec.ar*lag(returnSeries,i,1)+ spec.ma*lag(errors,i,1) + errors[i];

	});	

	return returnSeries;

}

