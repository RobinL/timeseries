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

	var lineColor;

	//ReDraw the axes
	this.reDraw = function() {
		
		//Get domain

		var xDomain = [0,100];
		var yDomain = [0,100];


		// Append all series
		allSeries = [].concat.apply([],series.sims);
		allSeries = allSeries.concat(series.startforecast[0]);

		getXLength = _.reduce(series.sims, function(a,b) {
			return Math.max(a,b.length)
		},series.sims[0].length);


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
		minEnd = _.reduce(series.sims,function(a,b,i) {
			if (i==0) return a;
			else return Math.min(a,b[b.length-1]);
		}, _.last(series.sims[0]));
	

		maxEnd = _.reduce(series.sims,function(a,b,i) {
			if (i==0) return a;
			else return Math.max(a,b[b.length-1]);
		}, _.last(series.sims[0]));

		//allSeries[allSeries.length-1] is the mid point of the uncertainty because its the forecast
		lineColor=d3.scale.linear()
			.domain([minEnd,_.last(series.startforecast[1]),maxEnd])
			.range(["red","steelblue", "red"]);

		debugger;

		if (!$("#toggle").is(':checked')) {
			reDrawSims();
		} else {
			reDrawFan();
		}

		reDrawStartAndForecast();

	}

	function reDrawSims() {

		//Delete any fans that might exist
		var fans = svgObj.svg.selectAll(".fanlines").remove();
		//Update and enter the new series

		var seriesBound = svgObj.svg.selectAll(".lines").data(series.sims);

		//Plot each series

		seriesBound.enter().append("path")      // Add the valueline path.
			.attr("d", function(d) {
				return valueline(d)
			})
			.attr("class", "lines")
			.style("stroke-width", function(d,i) {
				return 2
			})
			
			
		seriesBound     
			.attr("d", function(d) {
				return valueline(d)
			})
			.attr("class", "lines")
			.style("stroke", function(d,i) {
				return lineColor(d[d.length-1]);
			})
			.style("opacity", function(d,i) {
				return parseFloat($("#inputOpacity").val())
			})

		//Later might need an exit here
		seriesBound     
			.exit()
			.remove();
			
	}

	function reDrawFan() {

		
		//Delete any fans that might exist
		var fans = svgObj.svg.selectAll(".lines").remove();
		//Update and enter the new series

		var seriesBound = svgObj.svg.selectAll(".fanlines").data(series.fans);

		var valueline2 = d3.svg.line()
			.defined(function(d) { return d != null; })
		    .x(function(d,i) { return x(i); })
		    .y(function(d) { return y(d); });

		//Plot each series

		seriesBound.enter().append("path")      // Add the valueline path.
			.attr("d", function(d) {
				return valueline2(d)
			})
			.attr("class", "fanlines")
			.style("stroke-width", 1)
			
			
		seriesBound     
			.attr("d", function(d) {
				return valueline2(d)
			})
			.attr("class", "fanlines")
			.style("stroke", function(d,i) {
				return lineColor(d[d.length-1]);
			})
			.style("opacity", function(d,i) {
				if ((i+1)%5==0&&i!=49) {return 1}
				else {return 0.1}
			})
			.style("stroke-width", function(d,i) {
				if ((i+1)%5==0) {return 1}
				else {return 1}
			})

		//Later might need an exit here
		seriesBound     
			.exit()
			.remove();
			
	}

	function reDrawStartAndForecast() {


		var seriesBound = svgObj.svg.selectAll(".startForecast").data(series.startforecast);

		//Plot each series

		seriesBound.enter().append("path")      // Add the valueline path.
			.attr("d", function(d) {
				return valueline(d)
			})
			.attr("class", "startForecast")
			.style("stroke-width", function(d,i) {
				if (i==0) {return 2;}
				else if (i== 1) {return 1}
			})
			
			
		seriesBound     
			.attr("d", function(d) {
				return valueline(d)
			})
			.attr("class", "lines")
			.style("stroke", function(d,i) {
				if (i ==0) return undefined;
				else if (i== 1) {return "#1AF224"}
			})
			.style("opacity", function(d,i) {
				if (i==0) {return 1;}
				else if (i== 1) {return 1}
			})

		//Later might need an exit here
		seriesBound     
			.exit()
			.remove();

	}


	var series = {sims: [],
				  fans: [],
				  startforecast:[]};

	this.addSim = function(ar) {
		series.sims.push(ar);
		
	}

	this.addFan = function(ar) {
		series.fans.push(ar);
		
	}

	this.addStart = function(ar){
		series.startforecast[0] = ar;
	}

	this.addForecast = function(ar){
		series.startforecast[1] = ar;
	}

	this.removeAllSims = function() {
		while (series.sims.length>1) {
			series.pop()
		}	
	}

	this.removeAllData = function() {
		series.sims = [];
		series.fans = [];
	}

	this.getSims = function(){
		return series.sims;
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

	var lineChartContainer = new SvgStore(900,500,svgMargin,svgHolder);

	var lineC = new LineChart(lineChartContainer);

	var model = new TimeSeriesModel(lineC);

	//send sims to chart
	model.getModelParams();
	model.generateNewStart();
	model.generateSims();
	

	lineC.reDraw();

	setTimeout(model.generateFan,200);

	$("#redraw").on("click", function() {
		$("#toggle").prop('checked', false)
		model.getModelParams();
		lineC.removeAllData();
		model.regenerateStart();
		model.generateSims();
		
		lineC.reDraw();

		setTimeout(model.generateFan,200);
	})

	$("#newErrors").on("click", function() {
		$("#toggle").prop('checked', false)
		model.getModelParams();
		lineC.removeAllData();
		model.generateNewStart();
		model.generateSims();
		
		lineC.reDraw();

		setTimeout(model.generateFan,200);		
	})

	$("#toggle").on("click", function() {
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

		function textToArray(text) {
			var returnArray = [];

			returnArray = text.split(",")
			_.map(returnArray, function(x,i, ar) {
				ar[i] = parseFloat(x)
			});

			return returnArray;

		}

		spec.alpha = parseFloat($("#inputAlpha").val());
		spec.theta = parseFloat($("#inputTheta").val());
		spec.errorvar = parseFloat($("#inputErrorVar").val());
		spec.beta = parseFloat($("#inputBetas").val());
		spec.gamma = parseFloat($("#inputGammas").val());


	
		spec.betas = textToArray($("#inputBetas").val());
		spec.gammas = textToArray($("#inputGammas").val());

		numPoints = $("#inputNumPoints").val();
		numSims = $("#inputNumSims").val();
	}


	var startData;
	var fanSeries;
	
	//forecast is boolean - if true then continuation is generated with no errors
	function generateContinuation(forecast) {

		var newData = [];
		var errors = [];

		errors = startData.errors;
		
		var newErrors = d3.range(numPoints);

		_.map(newErrors,function(x,i,ar){
			if (forecast) {ar[i] = 0}
			else {ar[i] = d3.random.normal(0,spec.errorvar)();};
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

				if ($("#inputBigError").val() && i == Math.floor(7*numPoints/8)) {
					ar[i] = parseFloat($("#inputBigError").val());
				}
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
			
			returnSeries[i] = spec.alpha + spec.theta*i;

			_.each(spec.betas, function(x,j) {
				returnSeries[i] +=x*lag(returnSeries,i,j+1);
			})

			_.each(spec.gammas, function(x,j) {
				returnSeries[i] +=x*lag(errors,i,j+1) ;
			})

			
			returnSeries[i] = returnSeries[i] + errors[i];

		});	

		return returnSeries;ar

	}

	this.generateSims = function() {
		for (var i = 0; i < numSims; i++) {
			var newdata = generateContinuation();
			chart.addSim(newdata.series,0);
		};

		var newdata = generateContinuation(1);
			chart.addForecast(newdata.series,0);

	}

	this.generateNewStart = function() {
		startData = undefined;
		startData = generateStart(numPoints);
		chart.addStart(startData.series);
	}

	this.regenerateStart = function() {
		startData = generateStart(numPoints);
		chart.addStart(startData.series);
	}

	this.generateFan = function() {

		var sims = chart.getSims().slice(0);

		for (var i = 0; i < 1000; i++) {
			sims.push(generateContinuation().series)
		};
		
		var transposed = d3.transpose(sims)
		scales = [];

		_.each(transposed, function(x,i,ar) {
			ar[i].sort(function(a, b) {
    		return a - b;
			});

		})

		_.each(transposed, function(x,i,ar) {
			scales.push(d3.scale.quantile().domain([0,100]).range(x));
		});

		//Write fan

		fanSeries = [];


		_.each(scales, function(x,i,ar) {

			for (var j = 1; j <= 99; j++) {
				if (fanSeries[j]) 	{
					fanSeries[j].push(x(j));
				}
				else {
					fanSeries[j] = [];
					fanSeries[j].push(x(j));
				}
			};
		})

		_.each(fanSeries, function(x,i) {
			chart.addFan(x);
		})



		
		

	}


}


