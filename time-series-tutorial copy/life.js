var regions = { "SAS": "South Asia" , "ECS": "Europe and Central Asia", "MEA": "Middle East & North Africa", "SSF": "Sub-Saharan Africa", "LCN": "Latin America & Caribbean", "EAS": "East Asia &amp; Pacific", "NAC": "North America" },
	w = 925,
	h = 550,
	margin = 30,
	minLift = 0,
	maxLift = 15,
	format=d3.time.format("%m/%d/%y")
	startDate=format.parse("01/10/08"),
	endDate=format.parse("01/06/09");
	
	console.log(startDate)
var x = d3.time.scale();
	x.domain([startDate, endDate])
	.range([0 + margin -5, w]);
	x.ticks(5);
	x.tickFormat(5);

var y = d3.scale.linear()
	.domain([maxLift, minLift])
	.range([0 + margin, h - margin]); 

var vis = d3.select("#vis")
    .append("svg:svg")
    .attr("width", w)
    .attr("height", h)
    .append("svg:g");
			
var line = d3.svg.line()
    .x(function(d,i) { return x(d.x); })
    .y(function(d) { return y(d.y); });
					

/* Regions
var countries_regions = {};
d3.text('country-regions.csv', 'text/csv', function(text) {
    var regions = d3.csv.parseRows(text);
    for (i=1; i < regions.length; i++) {
        countries_regions[regions[i][0]] = regions[i][1];
    }
});
*/

var startEnd = {},
    countryCodes = {};
d3.text('cleaned-lift-data.csv', 'text/csv', function(text) {
    var countries = d3.csv.parseRows(text);
	var rawdates = countries[0].slice(1,countries[0].length)
	var dates=[]
    
    for (i=1; i < countries.length; i++) {
        var values = countries[i].slice(1, countries[i.length-1]);
        var currData = [];
        countryCodes[countries[i][0]] = countries[i][0];        
        var started = false;
        for (j=0; j < values.length; j++) {
			dates[j] = format.parse(rawdates[j])
            if (values[j] != '') {
                currData.push({ x: dates[j], y: values[j] });
                if (!started) {
                    startEnd[countries[i][0]] = { 'startDate':dates[j], 'startVal':values[j] };
                    started = true;
                } else if (j == values.length-1) {
                    startEnd[countries[i][0]]['endDate'] = dates[j];
                    startEnd[countries[i][0]]['endVal'] = values[j];
                }
                
            }
        }
        
        // Actual line
        vis.append("svg:path")
            .data([currData])
            .attr("country", countries[i][1])
            .attr("d", line)
            .on("mouseover", onmouseover)
            .on("mouseout", onmouseout);
    }
});  
   


/********************
 *    Add Axes	    *
 ********************/

var xAxis = d3.svg.axis().scale(x)
    .orient("bottom").ticks(10)
    .tickFormat(d3.time.format("%Y-%m-%d"));
/*	
vis.append("svg:line")
    .attr("x1", x(startDate))
    .attr("y1", y(minLift))
    .attr("x2", x(endDate))
    .attr("y2", y(minLift))
    .attr("class", "axis")

vis.append("svg:line")
    .attr("x1", x(startDate))
    .attr("y1", y(minLift))
    .attr("x2", x(startDate))
    .attr("y2", y(maxLift))
    .attr("class", "axis")
			
vis.selectAll(".xLabel")
    .data(x.ticks(5))
    .enter().append("svg:text")
    .attr("class", "xLabel")
    .text(String)
    .attr("x", function(d) { return x(d) })
    .attr("y", h-10)
    .attr("text-anchor", "middle")

vis.selectAll(".yLabel")
    .data(y.ticks(4))
    .enter().append("svg:text")
    .attr("class", "yLabel")
    .text(String)
	.attr("x", 0)
	.attr("y", function(d) { return y(d) })
	.attr("text-anchor", "right")
	.attr("dy", 3)
			
vis.selectAll(".xTicks")
    .data(x.ticks(5))
    .enter().append("svg:line")
    .attr("class", "xTicks")
    .attr("x1", function(d) { return x(d); })
    .attr("y1", y(minLift))
    .attr("x2", function(d) { return x(d); })
    .attr("y2", y(minLift)+7)
	
vis.selectAll(".yTicks")
    .data(y.ticks(4))
    .enter().append("svg:line")
    .attr("class", "yTicks")
    .attr("y1", function(d) { return y(d); })
    .attr("x1", x(startDate-0.5))
    .attr("y2", function(d) { return y(d); })
    .attr("x2", x(startDate))
*/
/*****************************/


function onclick(d, i) {
    var currClass = d3.select(this).attr("class");
    if (d3.select(this).classed('selected')) {
        d3.select(this).attr("class", currClass.substring(0, currClass.length-9));
    } else {
        d3.select(this).classed('selected', true);
    }
}

function onmouseover(d, i) {
    var currClass = d3.select(this).attr("class");
    d3.select(this)
        .attr("class", currClass + " current");
    
    var countryCode = $(this).attr("country");
    var countryVals = startEnd[countryCode];
    var percentChange = 100 * (countryVals['endVal'] - countryVals['startVal']) / countryVals['startVal'];
    
    var blurb = '<h2>' + countryCodes[countryCode] + '</h2>';
    blurb += "<p>On average: a life expectancy of " + Math.round(countryVals['startVal']) + " dates in " + countryVals['startDate'] + " and " + Math.round(countryVals['endVal']) + " dates in " + countryVals['endDate'] + ", ";
    if (percentChange >= 0) {
        blurb += "an increase of " + Math.round(percentChange) + " percent."
    } else {
        blurb += "a decrease of " + -1 * Math.round(percentChange) + " percent."
    }
    blurb += "</p>";
    
    $("#default-blurb").hide();
    $("#blurb-content").html(blurb);
}
function onmouseout(d, i) {
    var currClass = d3.select(this).attr("class");
    var prevClass = currClass.substring(0, currClass.length-8);
    d3.select(this)
        .attr("class", prevClass);
    // $("#blurb").text("hi again");
    $("#default-blurb").show();
    $("#blurb-content").html('');
}


$(document).ready(function() {
    $('#filters a').click(function() {
        var countryId = $(this).attr("id");
        $(this).toggleClass(countryId);
    });
    
});
