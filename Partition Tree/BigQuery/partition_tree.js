//partition_tree.js
var w = 1120,
    h = 600,
    x = d3.scale.linear().range([0, w]),
    y = d3.scale.linear().range([0, h]),
    col = d3.scale.ordinal()
            .domain(["parent","PaceCredit", "Spend", "RevenueModelExt"])
            .range([d3.rgb(225,25,50), d3.rgb(50,110,140), d3.rgb(160,180,200), d3.rgb(64,64,64), d3.rgb(164,164,164)]);

var vis = d3.select("#body").append("div")
    .attr("class", "chart")
    .style("width", w + "px")
    .style("height", h + "px")
  .append("svg:svg")
    .attr("width", w)
    .attr("height", h);

var partition = d3.layout.partition()
    .value(function(d) { return d.size; });

//  Sort alphabetically.  Primarily interested in sorting the dates chronologically
partition.sort(function(a, b) { return (a.name < b.name ? -1 : (a.name == b.name ? 0 : 1 )); } )

d3.json("partition_tree.json", function(root) {
  var g = vis.selectAll("g")
      .data(partition.nodes(root))
      .enter()
      .append("svg:g")
      .attr("transform", function(d) { return "translate(" + x(d.y) + "," + y(d.x) + ")"; })
      .on("click", click);



	// Build Rectangles 
  var kx = w / root.dx,
      ky = h / 1;
      
  g.append("svg:rect")
      .attr("width", function(d) { return root.dy * kx; })
      .attr("height", function(d) { return d.dx * ky; })
      .style("fill", function(d) { return d.class ? col(d.class) : "rgb(50,110,140)" })
      .attr("class", function(d) { return d.children ? "parent" : "child"; })
      ;
  
  g.append("svg:text")
      .attr("transform", transform)
      .attr("dy", ".35em")
      .style("opacity", function(d) { return d.dx * ky > 12 ? 1 : 0; })
      .text(function(d) { return d.name; })

  d3.select(window)
      .on("click", function() { click(root); })

  function click(d) {
    if (!d.children) return;

    kx = (d.y ? w - 40 : w) / (1 - d.y);
    ky = h / d.dx;
    x.domain([d.y, 1]).range([d.y ? 40 : 0, w]);
    y.domain([d.x, d.x + d.dx]);

    var t = g.transition()
        .duration(d3.event.altKey ? 7500 : 750)
        .attr("transform", function(d) { return "translate(" + x(d.y) + "," + y(d.x) + ")"; });

    t.select("rect")
        .attr("width", d.dy * kx)
        .attr("height", function(d) { return d.dx * ky; });

    t.select("text")
        .attr("transform", transform)
        .style("opacity", function(d) { return d.dx * ky > 12 ? 1 : 0; });

    d3.event.stopPropagation();
  }

  function transform(d) {
    return "translate(8," + d.dx * ky / 2 + ")";
  }
});