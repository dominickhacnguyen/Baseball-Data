// function to filter data by handedness
function filterByHand(data, hand) {
	"use strict";
	var filtered = data.filter(function (d) {
		if (hand === null) {
			return true;
		}
		return d.handedness === hand;
	});
	return filtered;
}

// function to convert handoptions text to handedness field values
function convertCategory(category) {
	"use strict";
	switch (category) {
		case "Both":
			return "B";
		case "Left":
			return "L";
		case "Right":
			return "R";
		default:
			return null;
	}
}

// function to draw scatter plot and labels
function draw(data) {
	"use strict";
	var margin = {top: 20, right: 20, bottom: 20, left: 20};
	var buffer = 50;
	var chartWidth = window.innerWidth;
	var chartHeight = window.innerHeight;
	var width = chartWidth - margin.left - margin.right - buffer;
	var height = chartHeight - margin.top - margin.bottom - buffer;

	// setup x (batting avg)
	var xValue = function (d) { return d.avg; };
	var xScale = d3.scale.linear().range([0, width]);
	var xMap = function (d) { return xScale(xValue(d)); };
	var xAxis = d3.svg.axis().scale(xScale).orient("bottom");

	// setup y (home runs)
	var yValue = function (d) { return d.HR; };
	var yScale = d3.scale.linear().range([height, 0]);
	var yMap = function (d) { return yScale(yValue(d)); };
	var yAxis = d3.svg.axis().scale(yScale).orient("left");

	// setup fill color
	var handOptions = ["Both", "Left", "Right", "All"];
	var cValue = function (d) { return d.handedness; };
	var colors = ["#23adff", '#42f480', "#f44242", "#ffbb2b"];
	var color = d3.scale.ordinal().domain(["B", "L", "R", ""]);
	color.range(colors);

	// add the graph canvas to the body of the webpage
	var svg = d3.select("body").append("svg");
	svg.attr("width", width + margin.left + margin.right)
		.attr("height", height + margin.top + margin.bottom)
		.append("g");
//		.attr("transform", "translate(" + margin.left + "," + margin.top + ")");

	// add the tooltip area to the webpage
	var tooltip = d3.select("body").append("div");
	tooltip.attr("class", "tooltip")
		.style("opacity", 0);

	// Check if tooltip is in bounds
	function inBounds(value, axis) {
		if (axis === "height" && value < 100) {
			return value + 150;
		}
		if (axis === "width" && value > width - 100) {
			return value - 125;
		}
		return value;
	}

	// change string (from CSV) into number format
	data.forEach(function (d) {
		d.weight = +d.weight;
		d.height = +d.height;
		d.avg = +d.avg;
		d.HR = +d.HR;
		d.id = +d.id;
	});

	// add in buffer to data domain to prevent circles from overlapping axes
	xScale.domain([d3.min(data, xValue) - 0.01, d3.max(data, xValue) + 0.01]);
	yScale.domain([d3.min(data, yValue) - 10, d3.max(data, yValue) + 50]);
	
	// x-axis
	svg.append("g")
		.attr("class", "x axis")
		.attr("transform", "translate(0," + height + ")")
		.call(xAxis)
		.append("text")
		.attr("class", "label")
		.attr("x", width)
		.attr("y", -6)
		.style("text-anchor", "end")
		.text("Batting Average");

	// y-axis
	svg.append("g")
		.attr("class", "y axis")
		.call(yAxis)
		.append("text")
		.attr("class", "label")
		.attr("transform", "rotate(-90)")
		.attr("y", 6)
		.attr("dy", ".71em")
		.style("text-anchor", "end")
		.text("# of Home Runs");
	
	// draw legend title
	d3.select("body").append("text").text("Handedness")
		.attr("id", "legendTitle")
		.style("opacity", 0)
		.transition().duration(1000)
		.style("opacity", 1);
	
	// draw toggle options
	var buttons = d3.select("body")
		.append("div")
		.attr("class", "hand_buttons")
		.selectAll("div")
		.data(handOptions)
		.enter()
		.append("div")
		.attr("class", "hand_button")
		.style("background-color", color)
		.text(function (d) { return d; });
	
	buttons.on("click", function (d) {
		
		// update data on button click
		render(d);
		
		// style all buttons to normal
		d3.selectAll('.hand_button')
			.transition().duration(500)
			.style("opacity", 0.5)
			.style("color", "#000000");

		// change style of button that was clicked
		d3.select(this)
			.transition().duration(500)
			.style("opacity", 1)
			.style("color", "#FFFFFF");
		
		// style all bars to normal
		d3.selectAll('.bar')
			.transition().duration(500)
			.style("opacity", 0.5)
			.style("color", "#000000");

		// change style of the bars of the hand that was clicked
		d3.selectAll("#" + d + "AvgBar, #" + d + "HrBar")
			.transition().duration(500)
			.style("opacity", 1)
			.style("color", "#FFFFFF");

	});
	
	// fade in toggle options
	buttons.style("opacity", 0)
		.transition().duration(1500)
		.style("opacity", 0.75);
	
	function render(category) {
		// convert category to correct field value
		category = convertCategory(category);
		
		// Filter data by handedness
		var filtered = filterByHand(data, category);
		
		var circles = svg.selectAll("circle")
			.data(filtered, function (d) {return d.id; });
		
		// fade out & remove previous unrelated data
		circles.exit()
			.transition()
			.duration(750)
			.style("opacity", 0)
			.remove();
		
		// fade in & append binded data elements
		circles.enter()
			.append("circle")
			.attr("r", 5)
			.attr("cx", xMap)
			.attr("cy", yMap)
			.style("fill", function (d) { return color(cValue(d)); })
			.style("stroke", "none")
			.style("opacity", 0)
			.transition().duration(750)
			.style("opacity", 0.5);
		
		circles.on("mouseover", function (d) {
			tooltip.transition()
				.duration(200)
				.style("opacity", 1);
			
			// set up outline of preview tooltip
			tooltip.html("<div id='tooltip'><div class='resultDiv'><h2 id='player' class='result'></h2></div></div>")
				.style("left", inBounds(d3.event.pageX + 10, "width") + "px")
				.style("top", (d3.event.pageY - 10) + "px");
			
			// import player name in preview tooltip
			document.getElementById("player").innerHTML = d.name;

			d3.select(this)
				.transition()
				.duration(200)
				.style("stroke", "#FFFFFF")
				.style("opacity", 0.9)
				.style("cursor", "pointer");

		})
			.on("click", function (d) {
				// set up outline of overview tooltip
				tooltip.html(
					"<div id='tooltip'><div class='resultDiv'><h2 id='player' class='result'></h2></div> \
					<div class='resultDiv'><h2>Batting Avg:&nbsp;<h2 id='avg' class='result'></h2></h2></div> \
					<div class='resultDiv'><h2>Home Runs:&nbsp;</h2><h2 id='hr' class='result'></h2></div> \
					<div class='resultDiv'><h2>Height:&nbsp;</h2><h2 id='height' class='result'></h2></div> \
					<div class='resultDiv'><h2>Weight:&nbsp;</h2><h2 id='weight' class='result'></h2></div></div>"
				)
					.style("left", inBounds(d3.event.pageX + 10, "width") + "px")
					.style("top", inBounds(d3.event.pageY - 170, "height") + "px")
					.style("color", color(cValue(d)))
					.style("opacity", 0.5)
					.transition().duration(300)
					.style("opacity", 1);

				// import fields to overview tooltip
				document.getElementById("player").innerHTML = d.name;
				document.getElementById("avg").innerHTML = d.avg;
				document.getElementById("hr").innerHTML = d.HR;
				document.getElementById("height").innerHTML = d.height + " in";
				document.getElementById("weight").innerHTML = d.weight + " lbs";
				document.getElementById("handedness").innerHTML = d.handedness;
		
				d3.select(this)
					.transition()
					.duration(200)
					.attr("r", 8)
					.style("opacity", 1);
			})
			.on("mouseout", function (d) {
				tooltip.transition()
					.duration(200)
					.style("opacity", 0);

				d3.select(this)
					.transition()
					.duration(200)
					.attr("r", 5)
					.style("stroke", "none")
					.style("opacity", 0.5)
					.style("cursor", "default");
			});
		
		// Add average summary statistics
		d3.select(".chart")
			.selectAll("bar")
			.data(data)
			.enter().append("div")
			.style("width", function(d) { return d * 10 + "px"; })
			.text(function(d) { return d; });
	}
	//  draw initial chart with all data points
	render("All");
	// draw summary area
	drawSummary(data, colors, handOptions);
}

// function to draw summary area
function drawSummary(data, colors, handOptions) {
	// get filtered data by handedness
	var filtered_both = filterByHand(data, convertCategory(handOptions[0]));
	var filtered_left = filterByHand(data, convertCategory(handOptions[1]));
	var filtered_right = filterByHand(data, convertCategory(handOptions[2]));
	
	// function to compute average
	function average(array) {
		var sum = 0;
		for (var i = 0; i < array.length; i++) {
			sum += array[i];
		}
		return sum / array.length;
	}
	
	// average filtered batting avg data
	var both_batting_avg = parseFloat(d3.mean(filtered_both, function(d) { return d.avg; }).toFixed(3));
	var left_batting_avg = parseFloat(d3.mean(filtered_left, function(d) { return d.avg; }).toFixed(3));
	var right_batting_avg = parseFloat(d3.mean(filtered_right, function(d) { return d.avg; }).toFixed(3));
	var batting_avg_list = [both_batting_avg, left_batting_avg, right_batting_avg];
	var avg_batting_avg = parseFloat(average(batting_avg_list).toFixed(3));
	batting_avg_list.push(avg_batting_avg);
	
	var batting_avg_dict = [
		{hand: handOptions[0], value: batting_avg_list[0], color: colors[0]},
		{hand: handOptions[1], value: batting_avg_list[1], color: colors[1]},
		{hand: handOptions[2], value: batting_avg_list[2], color: colors[2]},
		{hand: handOptions[3], value: batting_avg_list[3], color: colors[3]},
	];
	
	// average filtered home run data
	var both_hr = parseFloat(d3.mean(filtered_both, function(d) { return d.HR; }).toFixed(1));
	var left_hr = parseFloat(d3.mean(filtered_left, function(d) { return d.HR; }).toFixed(1));
	var right_hr = parseFloat(d3.mean(filtered_right, function(d) { return d.HR; }).toFixed(1));
	var hr_list = [both_hr, left_hr, right_hr];
	var avg_hr = parseFloat(average(hr_list).toFixed(1));
	hr_list.push(avg_hr);
	
	var hr_dict = [
		{hand: handOptions[0], value: hr_list[0], color: colors[0]},
		{hand: handOptions[1], value: hr_list[1], color: colors[1]},
		{hand: handOptions[2], value: hr_list[2], color: colors[2]},
		{hand: handOptions[3], value: hr_list[3], color: colors[3]},
	];
	
	// scale data to x position
	var x_avg = d3.scale.linear()
		.domain([0, d3.max(batting_avg_list)])
		.range([0, 5]);
	
	var x_hr = d3.scale.linear()
		.domain([0, d3.max(hr_list)])
		.range([0, 5]);
	
	// append batting avg summary to body
	var batting_avg_summary = d3.select("body")
		.append("div")
		.attr("class", "summaryChart")
		.attr("id", "battingAvgSummary")
		.append("h1")
		.text("Average Batting Avg");
	
	batting_avg_summary.selectAll('.battingAvgBar')
		.data(batting_avg_dict)
		.enter().append("div")
		.attr("class", "bar battingAvgBar")
		.attr("id", function(d) { return d.hand + "AvgBar"; })
		.text(function(d) { return d.value; })
		.style("width", 0 + "vw")
		.style("opacity", 0)
		.transition().duration(1000)
		.style("width", function(d) { return x_avg(d.value) + "vw"; })
		.style("opacity", 1)
		.style("background-color", function(d) { return d.color; });
		
	
	// append home run summary to body
	var hr_summary = d3.select("body")
		.append("div")
		.attr("class", "summaryChart")
		.attr("id", "hrAvgSummary")
		.append("h1")
		.text("Average Home Runs");
	
	hr_summary.selectAll('.hrAvgBar')
		.data(hr_dict)
		.enter().append("div")
		.attr("class", "bar hrAvgBar")
		.attr("id", function(d) { return d.hand + "HrBar"; })
		.text(function(d) { return d.value; })
		.style("width", 0 + "vw")
		.style("opacity", 0)
		.transition().duration(1000)
		.style("width", function(d) { return x_hr(d.value) + "vw"; })
		.style("opacity", 1)
		.style("background-color", function(d) { return d.color; });
}