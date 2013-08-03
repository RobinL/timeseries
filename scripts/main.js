var vis = (function() {

var svgMargin = {
		top: 40,
		right: 40,
		bottom: 40,
		left: 40
	};

var svgHolder = d3.select("#svgholder");

var lineChartContainer = new SvgStore(500,500,svgMargin,svgHolder);

var errors = d3.range(1000);
_.map(errors,function(x,i,ar){
	ar[i] = d3.random.normal(0,1)();
});

var data = [];

_.map(errors, function(x,i,ar) {
	if (i) data.push(x+data[i-1]);
	else data.push(x);
})

var lineC = new LineChart(lineChartContainer, data);



})()


function LineChart(svgObj, ar){
//will want an update() method to update 
//To scale to svg
var x = d3.scale.linear()
		.domain([0,ar.length])
		.range([0, svgObj.width]);

var y = d3.scale.linear()
		.domain(d3.extent(ar))
		.range([svgObj.height, 0]);


var xAxis = d3.svg.axis().scale(x)
    .orient("bottom").ticks(5);

var yAxis = d3.svg.axis().scale(y)
    .orient("left").ticks(5);

var valueline = d3.svg.line()
    .x(function(d,i) { return x(i); })
    .y(function(d) { return y(d); });

svgObj.svg.append("path")      // Add the valueline path.
        .attr("d", valueline(ar));

svgObj.svg.append("g")         // Add the X Axis
    .attr("class", "x axis")
    .attr("transform", "translate(0," + y(0)+ ")")
    .call(xAxis);

svgObj.svg.append("g")         // Add the Y Axis
    .attr("class", "y axis")
    .call(yAxis);




}

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

