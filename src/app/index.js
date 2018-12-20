import * as d3 from 'd3';
import * as topojson from "topojson-client";
import '../style/style.css';
import 'bootstrap/dist/css/bootstrap.css';
var titleCase = require('./modules/titleCase');

// Basemap options
var base = {
  'Empty': L.tileLayer(''),
  'OpenStreetMap': L.tileLayer('http://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    'attribution': 'Map data &copy; OpenStreetMap contributors'}),
  'EsriTopographic': L.esri.basemapLayer('Topographic')
}

// Set up the map
var map = L.map('map', {'layers':[base.Empty],zoomControl:false}).setView([41.8781, -87.6298], 10);

// Disable map dragging
map.dragging.disable();
    map.touchZoom.disable();
    map.doubleClickZoom.disable();
    map.scrollWheelZoom.disable();


// var svg = d3.select(map.getPanes().overlayPane).append("svg").attr('class','key');
// svg.attr('width', '100%').attr('height','100%');
var svg = d3.select('#key');
var keyWidth = document.getElementById('key').getBoundingClientRect().width;

//Append a defs (for definition) element to your SVG
var defs = svg.append("defs");

//Append a linearGradient element to the defs and give it a unique id
var linearGradient = defs.append("linearGradient")
    .attr("id", "linear-gradient");

//Horizontal gradient
linearGradient
    .attr("x1", "0%").attr("y1", "0%")
    .attr("x2", "100%").attr("y2", "0%");

var g = svg.append("g");
var caLayer, cpsLayer, commLayer;

var getColor = d3.scaleLinear().range(["#FFF500", "#007AFF"]);
var keyXScale = d3.scaleLinear().range([0, keyWidth-20]);

function polyStyle(feature) {
    return {
        fillColor: getColor(feature.properties.Enrollment),
        weight: 1,
        opacity: 1,
        color: 'white',
        fillOpacity: 0.7
    };
}

var pointStyle = {
    radius: 3,
    fillColor: "#000",
    weight: 0,
    fillOpacity: 0.5
};

function highlightFeature(e) {
    var layer = e.target;

    layer.setStyle({
        weight: 3,
        color: '#666',
        dashArray: '',
        fillOpacity: 0.7
    });

    infoUpdate(layer.feature.properties);

    if (!L.Browser.ie && !L.Browser.opera && !L.Browser.edge) {
        layer.bringToFront();
    }
}

function resetHighlight(e) {
    caLayer.resetStyle(e.target);
    infoUpdate();
}

function zoomToFeature(e) {
    map.fitBounds(e.target.getBounds());
}

function onEachFeature(feature, layer) {
    layer.on({
        mouseover: highlightFeature,
        mouseout: resetHighlight
    });
}

var infoUpdate = function (props) {
  d3.select('#sidebar-header').text(props ? titleCase(props.community) + ': ' + props.Enrollment : 'Hover over a community area');
};


// Load data
Promise.all([
  d3.json('data/cps_programs.geojson'),
  d3.json('data/community_programs_utf.geojson'),
  d3.json('data/all_ca_enrollment.geojson')
]).then(([cps, comm, ca]) =>  {

  console.log(cps);
  console.log(comm);
  console.log(ca);

  var maxEnrollment = d3.max(ca.features, function(d){ return d.properties.Enrollment; });
  var minEnrollment = d3.min(ca.features, function(d){ return d.properties.Enrollment; });

  getColor.domain([minEnrollment,maxEnrollment]);
  keyXScale.domain([minEnrollment,maxEnrollment]);

  linearGradient.selectAll("stop")
    .data( getColor.range() )
    .enter().append("stop")
    .attr("offset", function(d,i) { return i/(getColor.range().length-1); })
    .attr("stop-color", function(d) { return d; });

  // Add map layers
  caLayer = L.geoJSON(ca, {
    style: polyStyle,
    onEachFeature: onEachFeature
  }).addTo(map);

  map.fitBounds(caLayer.getBounds());

  // cpsLayer = L.geoJSON(cps, {
  //     pointToLayer: function (feature, latlng) { return L.circleMarker(latlng, pointStyle); }
  // }).addTo(map);
  //
  // commLayer = L.geoJSON(comm, {
  //     pointToLayer: function (feature, latlng) { return L.circleMarker(latlng, pointStyle); }
  // }).addTo(map);

  // Add continuous legend
  var keyRect = g.append("rect")
    .attr("width", keyWidth - 20)
    .attr("height", 6)
    .style("fill", "url(#linear-gradient)");

  var keyLabelsLow = g.append('text')
    .attr('x',keyXScale(minEnrollment)).attr('y',20)
    .attr('class','key-labels')
    .text(minEnrollment);

  var keyLabelsMid = g.append('text')
    .attr('x',keyXScale((maxEnrollment-minEnrollment)/2)).attr('y',20)
    .attr('class','key-labels')
    .text((maxEnrollment-minEnrollment)/2)
    .style('text-anchor','middle');

  var keyLabelsHigh = g.append('text')
    .attr('x',keyXScale(maxEnrollment)).attr('y',20)
    .attr('class','key-labels')
    .text(maxEnrollment)
    .style('text-anchor','end');


});


// TO DO
// Add toggle buttons for seeing different views of the map ie. enrollment, pct. full, comm vs. cps
