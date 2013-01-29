var width = 970,
    height = 500;
var drink_names = new Array("pop","soda","coke","other","none","null")

var path = d3.geo.path();
	
var svg = d3.select("body").append("svg")
    .attr("width", width)
    .attr("height", height);

var color = d3.scale.ordinal()
	.domain(drink_names)
    .range(["green","blue","#FF3333","purple","#994C00","grey"]);	
	
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

	
//Draw the map and legend	
function ready(error, us, pvscounty_fips) {
  var data=topojson.object(us, us.objects.counties).geometries
  var typeById = {};
  var countyName = {};
  var pct = [{},{},{},{}];
  var num = [{},{},{},{}];
  
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
  });

  svg.append("g")
      .attr("class", "counties")
    .selectAll("path")
      .data(topojson.object(us, us.objects.counties).geometries)
    .enter().append("path")
		.attr("class", function(d) { return typeById[d.id]; })
		.attr("d", path);

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
	  lx = width - 50;
	  
  var legend = svg.append("g")
	.attr("class", "legend");
	
  var legend_item=legend.selectAll("legend_item")
		.data(["Pop", "Soda", "Coke", "Other", "No Majority", "No Data"])
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

  legend_item.selectAll("rect")
  .on('mouseover',function(d){
		d3.select(this).style('stroke','yellow');
		d3.selectAll(".guide")
			.style("display","none");
		d3.select("#guide_"+d)
			.style("display","block");
			
		var selected_class = d3.select(this).attr("class");
		d3.selectAll(".counties").selectAll("." + selected_class)
			.attr("class","unselected");
	})
  
  .on('mouseout', function(d){
		//restore unselected classes to original colors
		var selected_class = d3.select(this).style('stroke','')
		.attr("class");
		d3.selectAll(".counties").selectAll(".unselected")
			.attr("class",  selected_class);
			
		//change guide back to overall
		d3.selectAll(".guide")
			.style("display","none");
		d3.select("#guide_overall")
			.style("display","block")});

			

}



