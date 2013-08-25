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

function isPointVisible(coordinates) {
	var p = projection(coordinates);
	return p[0] > -20 && p[0] < width + 20 && p[1] > -20 && p[1] < height + 20;
}

function showLabel(d) {
	return isPointVisible(d.geometry.coordinates); 
}

var originJson = {
    lat : 40.707944,
    lon : -74.003683
};
  
var upperLeftJson = {
    lat : 40.908,
    lon : -74.261
};

var lowerRightJson = {
    lat : 40.490,
    lon : -73.745
};

var initialScale = 800000;

var minScaleFactor = 0.5;
var maxScaleFactor = 4;

var width = 1130;
var height = 550;

var projection = d3.geo.albers().origin([originJson.lon, originJson.lat]).scale(initialScale).translate([width/4, height*5/8]);

var s = projection.scale();
var path = d3.geo.path().projection(projection);
path.pointRadius(6);
var zoom = d3.behavior.zoom()
	.translate(projection.translate())
	.scaleExtent([minScaleFactor, maxScaleFactor])
	.on("zoom", panzoom);
var map = d3.select("#vis").append("svg:svg")
	.call(zoom);
var coast = map.append("svg:g").attr("id", "coast");
var lines = map.append("svg:g").attr("id", "line");
var transfers = map.append("svg:g").attr("id", "transfer");
var stops = map.append("svg:g").attr("id", "stop");

// Force directed layout (http://bl.ocks.org/1095795)
var force = d3.layout.force()
	.linkStrength(10)
	.linkDistance(10)
	.charge(-1000)
	.gravity(0)
	.friction(0.3)
	.size([width, height]);

var nodes = force.nodes();
var links = force.links();

force.on("tick", function() {
	links.forEach(function(d) { // TODO <<<< HERE, should only need to do this on panzoom (not each tick)
		var sourceScreen = projection(d.source.coords);
		d.source.x = sourceScreen[0];
		d.source.y = sourceScreen[1];
		d.target.offset = [d.target.x - d.source.x, d.target.y - d.source.y];
	});

	map.selectAll("g.node")
		.attr("transform", function(d) { return "translate(" + d.x + "," + d.y + ")"; });
	
	map.selectAll("line.link")
		.attr("x1", function(d) { return d.source.x; })
		.attr("y1", function(d) { return d.source.y; })
		.attr("x2", function(d) { return d.target.x; })
		.attr("y2", function(d) { return d.target.y; });
});

function restart() { // TODO if I can pass in nodes and links can change updateNodes to be functional
	var link = map.selectAll("line.link")
		.data(links);
	
	link.enter().insert("svg:line", "g.node")
		.attr("class", "link");
	
	link.exit().remove();
	
	var node = map.selectAll("g.node")
		.data(nodes, function(d) { return d.name }); // Needed or else label text changes
	
	var nodeEnter = node.enter().append("svg:g")
		.attr("class", "node");
	
	nodeEnter.append("svg:text")
		.text(function(d) { return d.name }) 
		.attr("dy", 6)	
		.attr("id", "backer");	
	nodeEnter.append("svg:text")
		.text(function(d) { return d.name }) 
		.attr("dy", 6)	
		.attr("id", "label");
	
	node.exit().remove();

	nodes.filter(function(n) { return !n.fixed }).forEach(function(d) {
		var sourceScreen = projection(d.coords);
		d.x = sourceScreen[0] + d.offset[0];
		d.y = sourceScreen[1] + d.offset[1];
	});
	
	force.start();
}

function containsCoords(nodes, coords) {
	return nodes.some(function(n, i) { 
		return coords[0] == n.coords[0] && coords[1] == n.coords[1] 
	});
}

function updateNodes() { 
	// Note: modify existing arrays as reference is kept in the force-layout

	// Updates list of visible nodes
	var updatedNodes = stopsJson.features.filter(showLabel)
		.map(function(n) { 
			n.coords = n.geometry.coordinates;
			return n;
		});

	// Removes nodes no longer visible
	nodes
		.map(function(n, i) {
			return !containsCoords(updatedNodes, n.coords) ? i : undefined; 
		}) 
	    .filter(function(i) {
			return !_.isUndefined(i); 
		})
		.reverse()
	    .forEach(function(i) { 
			nodes.splice(i,1) 
		});

	// Removes links for nodes which are no longer visible
	links
		.map(function(l, i) {
			return !containsCoords(updatedNodes, l.source.coords) ? i : undefined; 
		})
	    .filter(function(i) {
			return !_.isUndefined(i); 
		})
		.reverse()
	    .forEach(function(i) { 
			links.splice(i,1) 
		});

	// Adds nodes and links which become visible
	var toAdd = updatedNodes
		.filter(function(n) { return !containsCoords(nodes, n.coords) })
		.forEach(function(n) { 
			// Get current screen position of stop
			var screen = projection(n.coords);

			// Adds jitter to initial label position avoid initial label bounce
			var xJitter = Math.random()*10;
			var yJitter = Math.sqrt(100 - xJitter*xJitter);
			n.x = screen[0] + xJitter;
			n.y = screen[1] + yJitter;
			n.offset = [xJitter, yJitter];

			// Adds node for floating label
			nodes.push(n); 

			// Adds node for fixed stop
			var f = {x: screen[0], y: screen[1], fixed: true, coords: n.coords};
			nodes.push(f);

			// Adds link between stop and label
			links.push({source: f, target: n});
		});

	restart();
}

d3.json("assets/data/coasts.json", function(data) {
	coast.selectAll("coast")
		.data(data.features)
		.enter().append("svg:path")
		.attr("d", path);
});

d3.json("assets/data/paths.json", function(data) {
	lines.selectAll("line")
		.data(data.features)
		.enter().append("svg:path")
		.attr("stroke", function(d, i) { 
			return d3.rgb(lineToColors.get(d.lines[0])) 
		})
		.attr("d", path);
//		.each(createTransition());
});

d3.json("assets/data/transfers.json", function(data) {
	transfers.selectAll("transfer")
		.data(data.features)
		.enter().append("svg:path")
		.attr("d", path);
});


d3.json("assets/data/stops.json", function(data) {
	stopsJson = data;
	stops.selectAll("stop")
		.data(data.features)
		.enter().append("svg:path")
		.attr("d", path);
	updateNodes();
});

function panzoom() {
	// Updates the projection ignoring translation bounds
	projection.translate(d3.event.translate);
	projection.scale(s * d3.event.scale);
	panzoomed(d3.event.scale, d3.event.translate);
}

function panzoomed(scale, t) {
	// Computes the translation bounds
	var upperLeft = projection([upperLeftJson.lon, upperLeftJson.lat]);
	var lowerRight = projection([lowerRightJson.lon, lowerRightJson.lat]);
	if (upperLeft[0] > 0) {
		t[0] -= upperLeft[0];
	}
	if (upperLeft[1] > 0) {
		t[1] -= upperLeft[1];
	}
	if (lowerRight[0] < width) {
		t[0] -= (lowerRight[0] - width);
	}
	if (lowerRight[1] < height) {
		t[1] -= (lowerRight[1] - height);
	}

	// Updates the projection and zoom accounting for translation bounds
	projection.translate(t);
	projection.scale(s * scale);

	zoom.translate(t).scale(scale);

	updateNodes();

	coast.selectAll("path").attr("d", path);
	lines.selectAll("path").attr("d", path);
	transfers.selectAll("path").attr("d", path);
	stops.selectAll("path").attr("d", path);
}

function createTransition() {
	return function(d, i) {
		var gs = _.sortBy(_.uniq(d.routes, function(r) { return r.color }), function(r) { return r.index; });
		if (gs.length > 1) {
			d3.select(this).transition()
				.delay()
				.duration(gs[0].index * 2000)
				.attr("stroke", d3.rgb(gs[0].color))
				.each("end", transition(gs, 1));
		}
	};
}

function transition(gs, i) {
	return function() {				  
		var delay = gs[i].index - gs[i == 0 ? gs.length -1 : i - 1].index;
		if (delay < 0) delay += 6
		d3.select(this).transition()
			.delay(500)
			.duration(delay * 2000 - 500)
			.attr("stroke", d3.rgb(gs[i].color))
			.each("end", transition(gs, i == gs.length - 1 ? 0 : i + 1));
	};
}

/* UI button functions */

function doZoom(multiple) {
	var zoomFactor = Math.min(maxScaleFactor, zoom.scale() * multiple);
	var pan = [width/2 + zoomFactor/zoom.scale()*(zoom.translate()[0] - width/2), height/2 + zoomFactor/zoom.scale()*(zoom.translate()[1] - height/2)];
	projection.scale(s * zoomFactor);
	projection.translate(pan);
	panzoomed(zoomFactor, pan);
}

function zoomIn() { doZoom(2); }
function zoomOut() { doZoom(0.5); }

function doPan(p) {
	var pan = [zoom.translate()[0] + p[0], zoom.translate()[1] + p[1]];
	projection.translate(pan);
	panzoomed(zoom.scale(), pan);
}

function panLeft() { doPan([width/4, 0]); }
function panRight() { doPan([-width/4, 0]); }
function panUp() { doPan([0, height/4]); }
function panDown() { doPan([0, -height/4]); }
