var width = 980,
    height = 500;
var drink_names = new Array("pop","soda","coke","other","none","null")
var min_respondents = 5

var path = d3.geo.path();
	
var svg = d3.select("body").append("svg")
    .attr("width", width)
    .attr("height", height);

var color = d3.scale.ordinal()
	.domain(drink_names)
    .range(["green","rgb(60,100,255)","#FF3333","purple","#994C00","grey"]);	
	
queue()
    .defer(d3.json, "us.json")
    .defer(d3.tsv, "pvscounty_fips.tsv")
    .await(ready)


//Create tooltip
var tooltip = d3.select("body")
	.append("div")
	.attr("class","tooltip")
	.style("position", "absolute")
	.style("z-index", "10")
	.style("visibility", "hidden");	

var tooltip_title=tooltip.append("div")
	.text("County")


//Add tooltip svg and bar chart
var tw = 100,
	th = 100,
	number_height = 15,
	bh = th - number_height,
	pad = 4,
	bw = (tw-3*pad)/4;
	
barchart = tooltip.append("div").append("svg")
	.attr("width", tw)
	.attr("height", th);


//Build bars
var bars = new Array();
for (var i = 0; i < 4; i++) {
	bars[i]=barchart.append("g")
	.attr("class","bar");
	
	bars[i].append("rect")
	.attr("class",drink_names[i])
	.attr("x",pad*i + bw*i)
	.attr("width", bw)	
	.attr("y",th)
	.attr("height",0);
	
	bars[i].append("text")
	  .text(0)
	  .attr("x",pad*i + bw*i + bw/2)
	  .attr("y",th - 5)
}

var lattitude = d3.scale.linear()
	.domain([0,51])
	.range([879,0]);
var longitude = d3.scale.linear()
	.domain([0,122.8])
	.range([2186,0])

//Display soda cities
function displayCities(x,y,text){
	//var x = longitude(coordlong),
	//    y = lattitude(lat);
	var dot = svg.append('g')
		.attr("class","city");
	console.log(x,y);
	dot.append('svg:circle')
		.attr('cx',x)
		.attr('cy',y)
		.attr('r',3);
	dot.append("text")
		.text(text)
		.attr('x', x + 10)
		.attr('y', y + 4);
}

	
//Draw the map and legend	
function ready(error, us, pvscounty_fips) {
  var data=topojson.object(us, us.objects.counties).geometries
  var typeById = {};
  var countyName = {};
  var pct = [{},{},{},{}];
  var num = [{},{},{},{},{}];
  
  //Hide the loading signal
  d3.select("#Loading")
	.style("display","none")
  
  
  pvscounty_fips.forEach(function(d) {
	typeById[d.id] = d.majority;
	countyName[d.id] = d.County_Name;
	pct[0][d.id] = d.PCTPOP;
	pct[1][d.id] = d.PCTSODA;
	pct[2][d.id] = d.PCTCOKE;
	pct[3][d.id] = d.PCTOTHER;
	num[0][d.id] = d.SUMPOP;
	num[1][d.id] = d.SUMSODA;
	num[2][d.id] = d.SUMCOKE;
	num[3][d.id] = d.SUMOTHER;
	num[4][d.id] = d.SUMCOUNT;
  });
  

 //draw and color counties
  svg.append("g")
      .attr("class", "counties")
    .selectAll("path")
      .data(data)
    .enter().append("path")
		.attr("d", path)
		.attr("class", function(d) {
			if(num[4][d.id] < min_respondents){
				return "null";
			} else {
				return typeById[d.id];
			}
		});
 //add state outlines
  svg.append("path")
      .datum(topojson.mesh(us, us.objects.states, function(a, b) { return a.id !== b.id; }))
      .attr("class", "states")
      .attr("d", path);

  
	/*******************
	 *Mouseover actions*
	 *******************/
  //Highlight county on mouseover
  var county = svg.select("g").selectAll("path")
  
  county.on('mouseover',function(d){
		var selected_county = d3.select(this)
			.style('stroke','yellow')
			tooltip_title.text(countyName[d.id])
			tooltip.style("visibility", "visible")
			
		for (var i = 0; i < 4; i++) {
			bars[i].selectAll("rect").transition()
			  .attr("y", th - pct[i][d.id]*bh)
			  .attr("height", pct[i][d.id]*bh);
			bars[i].selectAll("text").transition()
			  .attr("y", th - pct[i][d.id]*bh - 5)
			  .text(num[i][d.id]);
		}
		
		//Add line to indicate majority
		barchart.append("svg:line")
		.attr("x1",0)
		.attr("x2",tw)
		.attr("y1",th - 0.5*bh)
		.attr("y2",th - 0.5*bh)
		.style("stroke","grey")
		.style("opacity",0.75);
	})
	.on("mousemove", function(){
		tooltip.style("top", (d3.mouse(this)[1]-20)+"px")
			.style("left",(d3.mouse(this)[0]+20)+"px")
	;})

	
	//on mouseout, restore bars to zero and hide tooltip
	.on('mouseout', function(d){
		d3.select(this).style('stroke','')
		barchart.selectAll("rect").transition()
			.attr("height",0)
			.attr("y",th);
		barchart.selectAll("text").transition()
			.attr("y",th);
		barchart.selectAll("line").remove();
		tooltip.style("visibility", "hidden");
	;});
	
	
	
	/*******************
	 **** Legend *******
	 *******************/
  var ly = 100,
	  lx = width - 60;
	  
  var legend = svg.append("g")
	.attr("class", "legend");
	
  var legend_item=legend.selectAll("legend_item")
		.data(["Pop", "Soda", "Coke", "Other", "No Majority", "Insufficient Data"])
		.enter().append("g")
		.attr("transform", function(d, i) { return "translate(25," + (ly + i * 20) + ")"; });
  
  legend_item.append("rect")
      .attr("x", lx + 6)
      .attr("width", 18)
      .attr("height", 18)
	  .data(drink_names)
      .attr("class", function(d) {return(d); });

  legend_item.append("text")
      .attr("x", lx)
      .attr("y", 9)
      .attr("dy", ".35em")
      .style("text-anchor", "end")
      .text(function(d) { return d; });

	   
 
  //Legend Mouseovers
  legend_item.selectAll("rect")
  .on('mouseover',function(d){
	
	//only display the hovered type
	var selected_class = d3.select(this).attr("class");
  	d3.selectAll(".counties").selectAll("path")
		.classed("unselected",true);
	d3.selectAll(".counties").selectAll("." + selected_class)
		.classed("unselected",false);
	if(selected_class == "soda"){
		displayCities(582,233,"St. Louis");
		displayCities(758,440,"Miami");
		displayCities(737,394,"Orlando");
		//displayCities(38,90,"St. Louis");
		//displayCities(25.7,80.2,"Miami");
	} else if(selected_class == "coke"){
		displayCities(676,310,"Atlanta")
	}

	//apply yellow stroke to legend and display type-specific guide
	d3.select(this).style('stroke','yellow');
	d3.selectAll(".guide")
		.style("display","none");
	d3.select("#guide_"+d)
		.style("display","block");
  })
  
  .on('mouseout', function(d){
	
	//restore all colors
	var selected_class = d3.select(this).attr("class");
	d3.selectAll(".counties").selectAll(".unselected")
		.classed("unselected",  false);
		
	//remove yellow stroke and resume overall guide
	d3.select(this).style('stroke','')
	d3.selectAll(".guide")
		.style("display","none");
	d3.select("#guide_overall")
		.style("display","block")
	d3.selectAll(".city").remove()
  })

	//Map fading effects
	//legend_item.selectAll("rect")
	//.on('mouseover',function(){

				
		//change guide back to overall
	//.on('mouseout',function(d){
}



