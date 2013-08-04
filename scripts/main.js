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

		//Colour scale for series
		minEnd = _.reduce(series,function(a,b,i) {
			if (i==0) return a;
			else return Math.min(a,b[b.length-1]);
		}, series[1][series[1].length-1]);

		maxEnd = _.reduce(series,function(a,b,i) {
			if (i==0) return a;
			else return Math.max(a,b[b.length-1]);
		}, series[1][series[1].length-1]);

		var lineColor=d3.scale.linear().domain([minEnd,(minEnd+maxEnd)/2,maxEnd]).range(["red","steelblue", "red"]);
		
		//Update and enter the new series

		var seriesBound = svgObj.svg.selectAll(".lines").data(series);

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
		seriesBound     
			.exit()
			.remove();
			

	}

	var series = [];

	this.addSeries = function(ar,rd) {
		series.push(ar);
		if (rd) this.reDraw();
	}

	this.removeAllSims = function() {
		while (series.length>1) {
			series.pop()
		}	
	}

	this.removeAllData = function() {
		series = [];
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

	var lineC = new LineChart(lineChartContainer);

	var model = new TimeSeriesModel(lineC);

	//send sims to chart
	model.getModelParams();
	model.generateNewStart();
	model.generateSims();

	lineC.reDraw();

	$("#redraw").on("click", function() {
		model.getModelParams();
		lineC.removeAllData();
		model.regenerateStart();
		model.generateSims();
		lineC.reDraw();
	})

	$("#newErrors").on("click", function() {
		model.getModelParams();
		lineC.removeAllData();
		model.generateNewStart();
		model.generateSims();
		lineC.reDraw();
	})


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



function TimeSeriesModel(chart) {

	var spec = {
		errorvar: 1,
		alpha: 0,
		theta: 0,
		beta: 1,
		gamma: 0
	};

	var numPoints
	var numSims


	this.getModelParams = function() {

		spec.alpha = parseFloat($("#inputAlpha").val());
		spec.theta = parseFloat($("#inputTheta").val());
		spec.errorvar = parseFloat($("#inputErrorVar").val());
		spec.beta = parseFloat($("#inputBetas").val());
		spec.gamma = parseFloat($("#inputGammas").val());

		 numPoints = $("#inputNumPoints").val();
		numSims = $("#inputNumSims").val();
	}


	var startData;

	function generateContinuation() {

		var newData = [];
		var errors = [];

		errors = startData.errors;
		
		var newErrors = d3.range(numPoints);
		_.map(newErrors,function(x,i,ar){
			ar[i] = d3.random.normal(0,spec.errorvar)();
		});

		errors= errors.concat(newErrors);

		var series = ARIMA(spec,errors);

		
		for (var i = 0; i < startData.series.length; i++) {
			series[i] = undefined;
		};
		
		return {series:series, errors:errors};

	}


	 function generateStart() {

		var newData = [];

		if (startData) {
			errors = startData.errors;
		} else {

			var errors = d3.range(numPoints);
			_.map(errors,function(x,i,ar){
				ar[i] = d3.random.normal(0,spec.errorvar)();
			});

		}

		var series = ARIMA(spec,errors);

		return {series:series, errors:errors};

	}

	

	function ARIMA(spec, errors) {

		function lag(array,i,order) {
			if (array[i-order]) return array[i-order]
				else return 0;
		}

		var returnSeries = [];
		_.map(errors, function(x,i,ar) {
			returnSeries[i] = spec.alpha + spec.theta*i+ spec.beta*lag(returnSeries,i,1)+ spec.gamma*lag(errors,i,1) + errors[i];

		});	

		return returnSeries;

	}

	this.generateSims = function() {
		for (var i = 0; i < numSims; i++) {
			var newdata = generateContinuation();
			chart.addSeries(newdata.series,0);
		};
	}

	this.generateNewStart = function() {
		startData = undefined;
		startData = generateStart(numPoints);
		chart.addSeries(startData.series);
	}

	this.regenerateStart = function() {
		startData = generateStart(numPoints);
		chart.addSeries(startData.series);
	}



}




