"use strict";

var learningPath = "#tree",
    margin = {
        top: 10,
        right: 10,
        bottom: 10,
        left: 200
    },
    width = 1400,
    height = 800;
    
var i = 0,
    duration = 500,
    brancheSpacing = 250,
    lineHeight = 20,
    frameheight = "800px",
    root;

var tree = d3.layout.tree().size([height, width]);

var diagonal = d3.svg.diagonal().projection(function(d) { return [d.y, d.x]; });

var svg = d3.select(learningPath).append("svg")
    .attr("width", width)
    .attr("height", height)
    .append("g")
    .attr("transform", "translate(" + margin.left + "," + margin.top + ")");


root = treeData[0];
root.x0 = height / 2;
root.y0 = 0;
  
update(root);

d3.select(self.frameElement).style("height", frameheight);

function update(source) {

    // Compute the new tree layout.
    var nodes = tree.nodes(root).reverse(),
        links = tree.links(nodes);

    // Normalize for fixed-depth.
    nodes.forEach(function (d) {
        if (d.depth === 1) {
            d.y = d.depth * brancheSpacing / 1.45;
        } else if(d.depth === 2) {
            d.y = d.depth * brancheSpacing / 1.35;
        } else {
            d.y = d.depth * brancheSpacing;
        }
    });

    // Update the nodes
    var node = svg.selectAll("g.node")
        .data(nodes, function(d) { return d.id || (d.id = ++i); });
    
    // Enter any new nodes at the parent's previous position.
    var nodeEnter = node.enter().append("g")
        .attr("class", "node")
        .attr("transform", function (d) {
            return "translate(" + source.y0 + "," + source.x0 + ")";
        })
        .on("click", click);

    // Add Circle
    nodeEnter.append("circle")
        .attr("r", 1e-6)
        .style("fill", function (d) {
            return d._children ? "#ff4019" : "#fff";
        });


    // Add Text
    nodeEnter.append("text")
        .each(function (d) {

            if (d._children || d.children) {
                var maxCharLength = "20";
            } else {
                var maxCharLength = "200";
            }

            var lines = wordwrap(d.name, maxCharLength).split("\n");
            
            d3.select(this)
                .attr("text-anchor", function (d) {
                    return d.children || d._children ? "end" : "start";
                })
                .attr("x", function (d) {
                    return d.children || d._children ? -15 : 15;
                })
                .attr("class", "text-node")
                .style("fill-opacity", 1e-6);

            if (lines.length === 2) {
                d3.select(this).attr("y", "-1.6em");
            } else if (lines.length === 3) {
                d3.select(this).attr("y", "-2.5em");
            } else {
                d3.select(this).attr("y", "-1.1em");
            }
            
            for (var i = 0; i < lines.length; i++) {
                d3.select(this)
                    .append("tspan")
                    .attr("dy", lineHeight)
                    .attr("class", "text-span-" + i)
                    .attr("x", function (d) {
                        return d.children || d._children ? -14 : 14;
                    })
                    .text(lines[i]);

            }
        });
    
    // Transition nodes to their new position.
    var nodeUpdate = node.transition()
        .duration(duration)
        .attr("transform", function (d) {
            return "translate(" + d.y + "," + d.x + ")";
        });
    
    nodeUpdate.select("circle")
        .attr("r", 10)
        .style("fill", function (d) {
            return d._children ? "#ff4019" : "#fff";
        });
    
    nodeUpdate.select("text")
        .style("fill-opacity", 1);
    
    // Transition exiting nodes to the parent's new position.
    var nodeExit = node.exit().transition()
        .duration(duration)
        .attr("transform", function (d) {
            return "translate(" + source.y + "," + source.x + ")";
        })
        .remove();
    
    nodeExit.select("circle")
        .attr("r", 1e-6);
    
    nodeExit.select("text")
        .style("fill-opacity", 1e-6);
    
    // Update the links
    var link = svg.selectAll("path.link")
        .data(links, function (d) {
            return d.target.id;
        });
    
    // Enter any new links at the parent's previous position.
    link.enter().insert("path", "g")
        .attr("class", "link")
        .attr("d", function(d) {
            var o = {
                x: source.x0,
                y: source.y0
            };
            return diagonal({
                source: o,
                target: o
            });
        });
    
    // Transition links to their new position.
    link.transition().duration(duration).attr("d", diagonal);

    // Transition exiting nodes to the parent's new position.
    link.exit().transition()
      .duration(duration)
      .attr("d", function(d) {
          var o = {x: source.x, y: source.y};
          return diagonal({source: o, target: o});
      })
      .remove();
    
    // Stash the old positions for transition.
    nodes.forEach(function(d) {
      d.x0 = d.x;
      d.y0 = d.y;
    });
    centerNode(d);
}

// Function to center node when clicked/dropped so node doesn't get lost 
// when collapsing/ moving with large amount of children.
function centerNode(source) {
    scale = zoomListener.scale();
    x = -source.y0;
    y = -source.x0;
    x = x * scale + viewerWidth / 2;
    y = y * scale + viewerHeight / 2;
    d3.select('g').transition()
        .duration(duration)
        .attr("transform", "translate(" + x + "," + y + ")scale(" + scale + ")");
    zoomListener.scale(scale);
    zoomListener.translate([x, y]);
}

// 
function wordwrap(str, width, brk, cut) {
    brk = brk || "\n";
    width = width || 75;
    cut = cut || false;
    if (!str) { return str; }
    var regex = ".{1," + width + "}(\\s|$)" + (cut ? "|.{" + width + "}|.+$" : "|\\S+?(\\s|$)");
    return str.match(RegExp(regex, "g")).join(brk);
}

// Toggle children on click.
function click(d) {
    if (d.children) {
        d._children = d.children;
        d.children = null;
    } else {
        d.children = d._children;
        d._children = null;
    }
    update(d);
    centerNode(d);
}



