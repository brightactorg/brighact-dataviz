import * as am4core from "@amcharts/amcharts4/core";
import * as am4maps from "@amcharts/amcharts4/maps";
import am4geodata_worldLow from "@amcharts/amcharts4-geodata/worldLow";
import am4themes_animated from "@amcharts/amcharts4/themes/animated";

import data from './data/violence_by_country.json';

let slides = [...document.getElementsByClassName('slides')];
const arrow = document.getElementById('next');

arrow.addEventListener('click', function (e) {
  let currentSlide = slides.find(item => item.dataset.status === 'active');
  let currentIndex = slides.indexOf(currentSlide);
  
  if (currentIndex >= 0 && currentIndex < slides.length) {
    let nextSlide = slides[currentIndex + 1] || slides[0];
    currentSlide.removeAttribute('data-status');
    nextSlide.setAttribute('data-status', 'active');
  } 
});

am4core.ready(function() {
  am4core.useTheme(am4themes_animated);
  var map = am4core.create('map-chart', am4maps.MapChart);
  map.geodata = am4geodata_worldLow;
  map.projection = new am4maps.projections.Miller();

  map.homeZoomLevel = 3;
  map.homeGeoPoint = {
    latitude: 52,
    longitude: 10
  };

  // Polygon Series
  var polygonSeries = map.series.push(new am4maps.MapPolygonSeries());;
  polygonSeries.useGeodata = true;
  polygonSeries.exclude = ['AQ'];
  polygonSeries.nonScalingStroke = true;
  polygonSeries.strokeWidth = 0.1;
  polygonSeries.calculateVisualCenter = true;

  // Configure map visual
  var polygonTemplate = polygonSeries.mapPolygons.template;
  polygonTemplate.fill = am4core.color("#F7F0ED");
  polygonTemplate.stroke = am4core.color("#000");

  map.backgroundSeries.mapPolygons.template.polygon.fill = am4core.color("#F7F0ED");
  map.backgroundSeries.mapPolygons.template.polygon.fillOpacity = 1;

  // bubbles and external data
  var imageSeries = map.series.push(new am4maps.MapImageSeries());
  imageSeries.data = data;

  imageSeries.dataFields.value = "value";

  // Configure bubble visual
  var imageTemplate = imageSeries.mapImages.template;
  imageTemplate.nonScaling = true;
  imageTemplate.tooltipHTML = "{country}: <strong>{value}%</strong>";
  
  imageSeries.tooltip.getFillFromObject = false;
  imageSeries.tooltip.background.fill = am4core.color("#000");
  imageSeries.tooltip.label.fill = am4core.color("#F7F0ED");

  var circle = imageTemplate.createChild(am4core.Circle);
  circle.fillOpacity = 0.7;
  circle.fill = am4core.color("#171AA8");
  
  imageSeries.heatRules.push({
    "target": circle,
    "property": "radius",
    "min": 8,
    "max": 35,
    "dataField": "value"
  })
  
  // Add latitude and longitude
  imageTemplate.adapter.add("latitude", function (latitude, target) {
    var polygon = polygonSeries.getPolygonById(target.dataItem.dataContext.id);
    if (polygon) {
      return polygon.visualLatitude;
    }
    return latitude;
  })

  imageTemplate.adapter.add("longitude", function (longitude, target) {
    var polygon = polygonSeries.getPolygonById(target.dataItem.dataContext.id);
    if (polygon) {
      return polygon.visualLongitude;
    }
    return longitude;
  })
  
  // Zoom
  map.zoomControl = new am4maps.ZoomControl();
  map.chartContainer.wheelable = false;
  
  // Hover on country
  var hoverState = polygonTemplate.states.create('hover');
  hoverState.properties.fill = am4core.color("#D9D1CE");

  // Legend
  var legendContainer = am4core.create("map-legend", am4core.Container);
  legendContainer.width = am4core.percent(100);
  legendContainer.height = am4core.percent(100);

  map.legend = new am4maps.Legend();
  map.legend.data = data;
  map.legend.position = "absolute";
  map.legend.parent = legendContainer;
  map.legend.scrollable = true;
  map.legend.maxWidth = "100";
  map.legend.markers.template.disabled = true;

  map.legend.labels.template.text = "{country}:";
  map.legend.labels.template.fill = am4core.color("#000");
  map.legend.labels.template.textTransform = "uppercase";
  map.legend.valueLabels.template.text = "[bold]{value}%[/]";
  map.legend.valueLabels.template.fill = am4core.color("#171AA8");
  map.legend.valueLabels.template.align = "right";
  map.legend.valueLabels.template.textAlign = "start";
  map.legend.itemContainers.template.paddingTop = 5;
  map.legend.itemContainers.template.paddingLeft = 0;
  map.legend.itemContainers.template.paddingBottom = 5;
  map.legend.itemContainers.template.togglable = false;
  
  map.legend.itemContainers.template.events.on("toggled", function(event) {
    var item = event.target;
    var polygonItem = polygonSeries.getPolygonById(item.dataItem.dataContext.id);
    
    if (item.isActive) {
      map.zoomToRectangle(polygonItem.dataItem.north, polygonItem.dataItem.east, polygonItem.dataItem.south, polygonItem.dataItem.west, true, 1);
      polygonItem.isHover = true;
    
    } else if (!item.isActive) {
      map.goHome(500); // srsly haha
    }
  })
})