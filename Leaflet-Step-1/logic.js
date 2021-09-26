// Displaying the earthquake geojson data 
var link = "https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/all_day.geojson";

d3.json(link).then(function(data){

    console.log(data);
});

// *******************
// Create tile layer
// *******************

// Create a map object.
var myMap = L.map("map", {
    center: [40.7, -94.5],
    zoom: 3
});

  // Create the tile layer that will be the background of our map
  L.tileLayer("https://api.mapbox.com/styles/v1/{id}/tiles/{z}/{x}/{y}?access_token={accessToken}", {
        attribution: "© <a href='https://www.mapbox.com/about/maps/'>Mapbox</a> © <a href='http://www.openstreetmap.org/copyright'>OpenStreetMap</a> <strong><a href='https://www.mapbox.com/map-feedback/' target='_blank'>Improve this map</a></strong>",
        tileSize: 512,
        maxZoom: 18,
        zoomOffset: -1,
        id: "mapbox/light-v10",
        accessToken: API_KEY
    }).addTo(myMap);


// get the geojson earthquake data
d3.json(link).then(function(data) {

  function styleInfo(feature) {
    return {
      opacity: 1,
      fillOpacity: 1,
      fillColor: getColor(feature.geometry.coordinates[2]),
      radius: getRadiussize(feature.properties.mag),
      color: "#ffffff",
      stroke: true,
      weight: 0.9
    };
  }
  // function getColor to pick the colors for the Circlemarkers
  function getColor(progress) {
    const thresholds = [10, 30, 50, 70, 90];
    const colors = ["LimeGreen","Yellow","Orange","DarkOrange","Crimson", "FireBrick"]
    return colors.find((col, index) => {
        return index >= thresholds.length || progress < thresholds[index];
    });
  }


  // This function determines the radius of the earthquake marker based on its magnitude.
  function getRadiussize(magnitude) {
  return magnitude * 4;
  }

  // add a GeoJSON layer to the map once the file is loaded.
  L.geoJson(data, {
    pointToLayer: function(feature, latlng) {
      return L.circleMarker(latlng);
    },
    style: styleInfo,
    // We create a popup for each marker to display the magnitude and location of the earthquake after the marker has been created and styled
    onEachFeature: function(feature, layer) {
      layer.bindPopup(
        "Magnitude: "
          + feature.properties.mag
          + "<br>Depth: "
          + feature.geometry.coordinates[2]
          + "<br>Location: "
          + feature.properties.place
      );
    }
  }).addTo(myMap);

    // Create a layer control
    // Pass in our baseMaps and overlayMaps
    // Add the layer control to the map
  var legend = L.control({position: 'bottomright'});

legend.onAdd = function (map) {

    var div = L.DomUtil.create('div', 'info legend'),
            grades = [-10, 10, 30, 50, 70, 90],
            legendInfo = "<h3>Depth</h3>";
            legend = []
            div.innerHTML = legendInfo;

        // loop through the depth intervals and color the legend
        for (var i = 0; i < grades.length; i++) {
            div.innerHTML += '<i style="background:' + getColor(grades[i] + 1) + '"></i> ' +
                grades[i] + (grades[i + 1] ? '&ndash;' + grades[i + 1] + '<br>' : '+');
        }

    return div;
};

legend.addTo(myMap);

});

  


