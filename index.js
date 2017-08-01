function draw(data){
	var margin = {top: 20, right: 20, bottom: 20, left: 40},
	    buffer = 75,
	    chartWidth = window.innerWidth,
	    chartHeight = window.innerHeight,
	    width = chartWidth - margin.left - margin.right - buffer,
	    height = chartHeight - margin.top - margin.bottom - buffer;

	// setup x (batting avg)
	var xValue = function(d) { return d.avg;}, 
	xScale = d3.scale.linear().range([0, width]), 
	xMap = function(d) { return xScale(xValue(d));},
	xAxis = d3.svg.axis().scale(xScale).orient("bottom");

	// setup y (home runs)
	var yValue = function(d) { return d.HR;}, 
	yScale = d3.scale.linear().range([height, 0]),
	yMap = function(d) { return yScale(yValue(d));}, 
	yAxis = d3.svg.axis().scale(yScale).orient("left");

	// setup fill color
	var handOptions = ["Both","Left", "Right", "All"];
	var cValue = function(d) { return d.handedness;},
	color = d3.scale.category20c();
	var color = d3.scale.ordinal().domain(["B", "L", "R", ""])
	      .range(["#23adff", '#42f480', "#f44242", "#ffbb2b"]);

	// add the graph canvas to the body of the webpage
	var svg = d3.select("body").append("svg")
	.attr("width", width + margin.left + margin.right)
	.attr("height", height + margin.top + margin.bottom)
	.append("g")
	.attr("transform", "translate(" + margin.left + "," + margin.top + ")");

	// add the tooltip area to the webpage
	var tooltip = d3.select("body").append("div")
	.attr("class", "tooltip")
	.style("opacity", 0);


	// Check if tooltip is in bounds
	function inBounds(value, axis) {
		if (axis == "height" && value < 100){
			return value + 150;
		} else if (axis == "width" && value > width - 100) {
			return value - 125;
		} else {
			return value;
		}
	}

	// change string (from CSV) into number format
	data.forEach(function(d) {
		d.weight = +d.weight;
		d.height = +d.height;
		d.avg = +d.avg;
		d.HR = +d.HR;
		d.id = +d.id;
	});

	// add in buffer to data domain to prevent circles from overlapping axes
	xScale.domain([d3.min(data, xValue)-0.01, d3.max(data, xValue) +0.01]);
	yScale.domain([d3.min(data, yValue)-10, d3.max(data, yValue)+50]);

	var avg_max = d3.max(data, function(d) {
		return d.avg;
	});

	var radius = d3.scale.sqrt()
	.domain([0, avg_max])
	.range([0, 15]);

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
	
	// draw header title and info
	svg.append("text").text("Baseball Data")
	.attr("id", "title")
	.attr("x",  50)
	.attr("y", 20);
	
	svg.append("text").text("What makes a baseball player hit more home runs?")
	.attr("class", "info")
	.attr("x", 50)
	.attr("y", 60);
	
	svg.append("text").text("Click on a player to see more stats!")
	.attr("class", "info")
	.attr("x", 50)
	.attr("y", 87);
	
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
		.attr("id", function(d){return d.handedness;} + "Category")
		.style("background-color", color)
		.text(function(d) { return d;});
	
	buttons.on("click", function(d) {
		
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

	});
	
	// fade in toggle options
	buttons.style("opacity", 0)
		.transition().duration(1500)
		.style("opacity", 0.75);
	
	// function to convert handoptions text to handedness field values
	function convertCategory (category) {
		switch (category) {
			case "Both":
				return "B";
				break;
			case "Left":
				return "L";
				break;
			case "Right":
				return "R";
				break;
			default:
				return null;
		}
	}

	function render(category) {
		category = convertCategory(category);
		
		var filtered = data.filter(function(d){
			if (category == null){
				return true;
			}
			return d.handedness == category;
		})
		
		var circles = svg.selectAll("circle")
		.data(filtered, function(d) {return d.name;});
		
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
			.style("fill", function(d) { return color(cValue(d));}) 
			.style("stroke", "none")
			.style("opacity", 0)
			.transition().duration(750)
			.style("opacity", 0.5);
		
		circles.on("mouseover", function(d) {
			tooltip.transition()
			.duration(200)
			.style("opacity", 1);
			
			// set up outline of preview tooltip
			tooltip.html("<div id='tooltip'><div class='resultDiv'><h2 id='player' class='result'></h2></div></div>")
			.style("left", inBounds(d3.event.pageX + 10, "width") +"px")
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
			.on("click", function(d){
				// set up outline of overview tooltip
				tooltip.html("<div id='tooltip'><div class='resultDiv'><h2 id='player' class='result'></h2></div> \
						<div class='resultDiv'><h2>Batting Avg:&nbsp;<h2 id='avg' class='result'></h2></h2></div> \
						<div class='resultDiv'><h2>Home Runs:&nbsp;</h2><h2 id='hr' class='result'></h2></div> \
						<div class='resultDiv'><h2>Height:&nbsp;</h2><h2 id='height' class='result'></h2></div> \
						<div class='resultDiv'><h2>Weight:&nbsp;</h2><h2 id='weight' class='result'></h2></div></div>")
				.style("left", inBounds(d3.event.pageX + 10, "width") +"px")
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
			.on("mouseout", function(d) {
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
	}
	render("All");
}