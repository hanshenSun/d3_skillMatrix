<script src="https://d3js.org/d3.v4.min.js"></script>
<script>

var format = d3.format(",d");
var stratify = d3.stratify()
    .parentId(function(d) { return d.id.substring(0, d.id.lastIndexOf(".")); });

var svg = d3.select("svg"),
    margin = 30,
    diameter = +svg.attr("width"),
    g = svg.append("g").attr("transform", "translate(" + diameter / 2 + "," + diameter / 2 + ")");

var color = d3.scaleLinear()
    .domain([-1, 5])
    .range(["rgb(255,255,255)", "rgb(112,243,255)"])
    .interpolate(d3.interpolateRgb);

var colorBall = d3.scaleLinear()
    .domain([0.5, 5])
    .range(["white", "rgb(0,219,73)"])
    .interpolate(d3.interpolateRgb);

var pack = d3.pack()
    .size([diameter - margin, diameter - margin])
    .padding(2);


d3.csv("Github_skills.csv", function(error, root) {
  if (error) throw error;


  var root = stratify(root)
      .sum(function(d) { return d.value; })
      .sort(function(a, b) { return b.value - a.value; });


  var focus = root,
      nodes = pack(root).descendants(),
      view;

  var circle = g.selectAll("circle")
    .data(nodes)
    .enter().append("circle")
  		.attr("fill-opacity", function(d){return (d.depth ==0) ? 0:0.5})
  		.attr("opacity", function(d) {return (d.depth ==3) ? (d.value <2) ? 0: 1 : 1})

  		.attr("stroke", "#00a3a3")
  		.attr("stroke-width",function(d){return (d.depth ==3) ? 0: 0.5})
      .attr("class", function(d) { return d.parent ? d.children ? "node" : "node node--leaf" : "node node--root"; })
  		.style("fill", function(d) { return (d.depth == 3) ? colorBall(d.value) : color(d.depth)})
      .on("click", function(d) { if (focus !== d) zoom(d), d3.event.stopPropagation(); });


    svg.selectAll("circle").append("title").text(function(d) {return d.id.substring(d.id.lastIndexOf(".")+1)});


  var text = g.selectAll("text")
    .data(nodes)
    .enter().append("text")
      .attr("class", "label")
  		.style("font-size", function(d) {return (d.depth <2) ? "15px": "15px"})
  		.style("font-weight", function(d) {return (d.depth <2) ? "bold": "regular"})
      .style("fill-opacity", function(d) { return d.parent === root ? 1 : 0; })
      .style("display", function(d) { return d.parent === root ? "inline" : "none"; })
  		.text(function(d) { return (d.depth == 3) ? d.id.substring(d.id.lastIndexOf(".")+1) + "\n" + d.value : d.id.substring(d.id.lastIndexOf(".")+1) })
  	.attr("opacity", function(d) {return (d.depth ==3) ? (d.value <2) ? 0: 1 : 1});










  var node = g.selectAll("circle,text");



  svg.on("click", function() { zoom(root); });

  zoomTo([root.x, root.y, root.r * 2 + margin]);

  function zoom(d) {
    var focus0 = focus; focus = d;

    var transition = d3.transition()
        .duration(d3.event.altKey ? 7500 : 750)
        .tween("zoom", function(d) {
          var i = d3.interpolateZoom(view, [focus.x, focus.y, focus.r * 2 + margin]);
          return function(t) { zoomTo(i(t)); };
        });

    transition.selectAll("text")
      .filter(function(d) { return d.parent === focus || this.style.display === "inline"; })
        .style("fill-opacity", function(d) { return d.parent === focus ? 1 : 0.2; })
        .on("start", function(d) { if (d.parent === focus) this.style.display = "inline"; })
        .on("end", function(d) { if (d.parent !== focus) this.style.display = "inline"; });
  }

  function zoomTo(v) {
    var k = diameter / v[2]; view = v;
    node.attr("transform", function(d) { return "translate(" + (d.x - v[0]) * k + "," + (d.y - v[1]) * k + ")"; });
    circle.attr("r", function(d) { return d.r * k; });
  }
});

</script>
