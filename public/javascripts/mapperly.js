/* ==========================================================
 * Copyright 2012 David Swartz
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 * ========================================================== */

var projection = d3.geo.transverseMercator()
    .rotate([73.96, -40.69])
	.scale(1000000); 

var path = d3.geo.path().projection(projection);

var zoom = d3.behavior.zoom()
	.scaleExtent([0.25, 4])
	.on("zoom", zoommove)

var map = d3.select("#vis")
	.append("svg")
   	.call(zoom);

var lineToColors = d3.map({ 
	"1" : "#EF3E42",
	"2" : "#EF3E42",
	"3" : "#EF3E42",
	"4" : "#00A65C",
	"5" : "#00A65C",
	"6" : "#00A65C",
	"7" : "#9D3D97",
	"A" : "#0039A6",
	"C" : "#0039A6",
	"E" : "#0039A6",
	"B" : "#F58220",
	"D" : "#F58220",
	"F" : "#F58220",
	"M" : "#F58220",
	"G" : "#7DC242",
	"J" : "#B0720D",
	"Z" : "#B0720D",
	"L" : "#939598",
	"N" : "#FFD520",
	"Q" : "#FFD520",
	"R" : "#FFD520",
	"S" : "#6C6D70",
	"SIR" : "#1D70B3"
});
var lines = map.append("svg:g").attr("id", "line");
d3.json("assets/data/paths.json", function(data) {
	lines.selectAll("line")
		.data(data.features)
		.enter().append("svg:path")
		.attr("stroke", function(d, i) { return d3.rgb(lineToColors.get(d.properties.lines[0])); })
		.attr("stroke-dasharray", "20,5,20,5,20,5,20,5,20,5,20,5,20,5,20,100")
		.attr("stroke-dashoffset", 0)
		.transition()
            .duration(240000)
            .ease("linear")
            .attr("stroke-dashoffset", 10000)
		.attr("d", path);

    path
      
});

var transfers = map.append("svg:g").attr("id", "transfer");
d3.json("assets/data/transfers.json", function(data) {
	transfers.selectAll("transfer")
		.data(data.features)
		.enter().append("svg:path")
		.attr("d", path);
});

var stops = map.append("svg:g").attr("id", "stop");
d3.json("assets/data/stops.json", function(data) {
	stops.selectAll("stop")
		.data(data.features)
		.enter().append("svg:path")
		.attr("d", path);
	stops.selectAll("stop")
		.data(data.features)
	    .enter().append("svg:text")
		.text(function(d) { return d.properties.name; }) 
		.attr("dy", 6)
		.attr("id", "label")
		.attr("transform", function(d) { return "translate(" + projection(d.geometry.coordinates) + ")"; })
		.attr("x", function(d) { return 6; })
		.attr("y", function(d) { return -6; })
		.style("text-anchor", function(d) { return "start"; });
});

function zoommove() {
  lines.attr("transform", "translate("+d3.event.translate+")"+" scale("+d3.event.scale+")");
  transfers.attr("transform", "translate("+d3.event.translate+")"+" scale("+d3.event.scale+")");
  stops.attr("transform", "translate("+d3.event.translate+")"+" scale("+d3.event.scale+")");
}
