import * as am4core from "@amcharts/amcharts4/core";
import * as am4maps from "@amcharts/amcharts4/maps";
import * as am4charts from "@amcharts/amcharts4/charts";
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

  let violenceChart = am4core.create("type-violence__chart", am4charts.XYChart);
  violenceChart.data = [
    {
      type: "Any of the above, excluding pushed or shoved",
      current: 5,
      previous: 20
    },
    {
      type: "Any of the above",
      current: 7,
      previous: 24
    },
    {
      type: "Beat head against something",
      current: 1,
      previous: 5
    },
    {
      type: "Cut, stabbed or shot",
      current: 0,
      previous: 1
    },
    {
      type: "Tried to suffocate or strangle",
      current: 1,
      previous: 5
    },
    {
      type: "Burned",
      current: 0,
      previous: 1
    },
    {
      type: "Beat with a fist or a hard object, or kicked",
      current: 1,
      previous: 9
    },
    {
      type: "Grabbed or pulled by the hair",
      current: 2,
      previous: 10
    },
    {
      type: "Hard object thrown at them",
      current: 2,
      previous: 8
    },
    {
      type: "Slapped",
      current: 4,
      previous: 15
    },
    {
      type: "Pushed or shoved",
      current: 5,
      previous: 19,
    },
];

    let typeViolenceAxis = violenceChart.yAxes.push(new am4charts.CategoryAxis());
    typeViolenceAxis.dataFields.category = "type";
    typeViolenceAxis.renderer.cellStartLocation = 0.1;
    typeViolenceAxis.renderer.cellEndLocation = 0.8;

    let label = typeViolenceAxis.renderer.labels.template;
    label.wrap = true;
    label.maxWidth = 220;
    label.fill = am4core.color("#FFFFFF");
    label.padding(10, 20, 5, 0);

    let valueViolenceAxis = violenceChart.xAxes.push(new am4charts.ValueAxis());
    valueViolenceAxis.renderer.minGridDistance = 80;
    typeViolenceAxis.renderer.grid.template.disabled = true;
    valueViolenceAxis.renderer.grid.template.disabled = true;
    valueViolenceAxis.renderer.labels.template.disabled = true;

    let series1 = violenceChart.series.push(new am4charts.ColumnSeries());
    series1.dataFields.valueX = "current";
    series1.dataFields.categoryY = "type";
    series1.columns.template.fill = am4core.color("#FF5933");
    series1.columns.template.stroke = am4core.color("#FF5933");
    series1.columns.template.tooltipText = "Current partner: [bold]{valueX}[/]%";
    series1.tooltip.autoTextColor = false;
    series1.tooltip.label.fill = am4core.color("#FFFFFF");
    series1.name = "Current";
    // series1.stacked = true;

    let currentLabel = series1.bullets.push(new am4charts.LabelBullet());
    currentLabel.label.text = "{valueX}%";
    currentLabel.label.truncate = false;
    currentLabel.label.hideOversized = false;
    currentLabel.label.horizontalCenter = "left";
    currentLabel.label.dx = 10;
    currentLabel.label.fill = am4core.color('#fff');


    let series2 = violenceChart.series.push(new am4charts.ColumnSeries());
    series2.dataFields.valueX = "previous";
    series2.dataFields.categoryY = "type";
    series2.columns.template.fill = am4core.color("#fff");
    series2.columns.template.stroke = am4core.color("#fff");
    series2.columns.template.tooltipText = "Previous partner: [bold]{valueX}[/]%";
    series2.tooltip.autoTextColor = false;
    series2.tooltip.label.fill = am4core.color("#171AA8");
    series2.name = "Previous";
    // series2.stacked = true;
   // series2.columns.template.width = am4core.percent(60);

    let previousLabel = series2.bullets.push(new am4charts.LabelBullet());
    previousLabel.label.text = "{valueX}%";
    previousLabel.label.truncate = false;
    previousLabel.label.hideOversized = false;
    previousLabel.label.hideOversized = false;
    previousLabel.label.horizontalCenter = "left";
    previousLabel.label.dx = 10;
    previousLabel.label.fill = am4core.color('#fff');

    // Hubei Province Chart
    let hubeiChart = am4core.create("hubei__chart", am4charts.XYChart);
    hubeiChart.data = [{
        date: "February 2019",
        cases: 47
      },
      {
        date: "February 2020",
        cases: 162
      }
    ];

    let categoryAxis = hubeiChart.xAxes.push(new am4charts.CategoryAxis());
    categoryAxis.dataFields.category = "date";
    let valueAxis = hubeiChart.yAxes.push(new am4charts.ValueAxis());
    valueAxis.renderer.minGridDistance = 100;
    categoryAxis.renderer.grid.template.disabled = true;
    valueAxis.renderer.grid.template.disabled = true;

    let series = hubeiChart.series.push(new am4charts.ColumnSeries());
    series.dataFields.valueY = "cases";
    series.dataFields.categoryX = "date";
    series.columns.template.fill = am4core.color("#FF5933");
    series.columns.template.stroke = am4core.color("#FF5933");
    series.columns.template.tooltipText = "{valueY} cases";
    series.tooltip.autoTextColor = false;
    series.tooltip.label.fill = am4core.color("#FFFFFF");

    let valueLabel = series.bullets.push(new am4charts.LabelBullet());
    valueLabel.label.text = "{valueY} cases";
    valueLabel.label.fill = am4core.color('#fff');
    valueLabel.label.dy = 15;
})