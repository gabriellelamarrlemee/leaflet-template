import * as d3 from 'd3';
import * as topojson from "topojson-client";
import '../style/style.css';
import 'bootstrap/dist/css/bootstrap.css';

// Set up the map
var map = L.map('map').setView([33.8361, -81.1637], 6);
L.esri.basemapLayer('Topographic').addTo(map);
var svg = d3.select(map.getPanes().overlayPane).append("svg");
var g = svg.append("g").attr("class", "leaflet-zoom-hide");


// Load data
Promise.all([
  // d3.csv('data/all_sites.csv'),
  // d3.csv('data/streamdata.csv')
]).then(([]) =>  {

});


// Draw the map data
