// *******************************
// Displaying data in the console
// *******************************

d3.json("https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/all_day.geojson").then(function(data){
    console.log(data);
});

d3.json("https://raw.githubusercontent.com/fraxen/tectonicplates/master/GeoJSON/PB2002_boundaries.json").then(function(data1){
        console.log(data1);
    });

// ***********************
// Creating base layers
// ***********************

    // Create the base layers.
    // Create the tile layer that will be the background of our map
    var graymap = L.tileLayer("https://api.mapbox.com/styles/v1/{id}/tiles/{z}/{x}/{y}?access_token={accessToken}", {
    attribution: "© <a href='https://www.mapbox.com/about/maps/'>Mapbox</a> © <a href='http://www.openstreetmap.org/copyright'>OpenStreetMap</a> <strong><a href='https://www.mapbox.com/map-feedback/' target='_blank'>Improve this map</a></strong>",
    tileSize: 512,
    maxZoom: 18,
    zoomOffset: -1,
    id: "mapbox/light-v10",
    accessToken: API_KEY
    });

    var satellitemap = L.tileLayer("https://api.mapbox.com/styles/v1/{id}/tiles/{z}/{x}/{y}?access_token={accessToken}", {
    attribution: "© <a href='https://www.mapbox.com/about/maps/'>Mapbox</a> © <a href='http://www.openstreetmap.org/copyright'>OpenStreetMap</a> <strong><a href='https://www.mapbox.com/map-feedback/' target='_blank'>Improve this map</a></strong>",
    tileSize: 512,
    maxZoom: 18,
    zoomOffset: -1,
    id: "mapbox/satellite-v9",
    accessToken: API_KEY
    });

    var outdoors = L.tileLayer("https://api.mapbox.com/styles/v1/{id}/tiles/{z}/{x}/{y}?access_token={accessToken}", {
    attribution: "© <a href='https://www.mapbox.com/about/maps/'>Mapbox</a> © <a href='http://www.openstreetmap.org/copyright'>OpenStreetMap</a> <strong><a href='https://www.mapbox.com/map-feedback/' target='_blank'>Improve this map</a></strong>",
    tileSize: 512,
    maxZoom: 18,
    zoomOffset: -1,
    id: "mapbox/outdoors-v11",
    accessToken: API_KEY
    });
    
    // Create Layergroups to hold the markers for the overlays
    var earthquakeData = new L.LayerGroup();
    var tectonicPlates = new L.LayerGroup();

    // Create a baseMaps object.
    var baselayers = {
        "Satellite": satellitemap,
        "Graymap": graymap,
        "Outdoors": outdoors
    };
    
   // Create an overlay object to hold our overlay.
    var overlays = {
        "Earthquakes": earthquakeData, 
        "Tectonicplates" : tectonicPlates
    };


    // Create map with all three layers on it.
    var myMap = L.map("map", {
        center: [
        37.09, -95.71
        ],
        zoom: 3,
        layers: [satellitemap, graymap, outdoors]
    });

    // Add the layer control to the map.
    L.control.layers(baselayers, overlays, {
    collapsed: false
    }).addTo(myMap);

// **************************************
// Getting the earthquake geojson data
// **************************************

// Get the earthquake geojson data. 
d3.json("https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/all_day.geojson").then(function(data) {

    // Function to hold the styling info for the circle markers
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
    // function that picks color for the circle markers
    function getColor(progress) {
        const thresholds = [10, 30, 50, 70, 90];
        const colors = ["LimeGreen","Yellow","Orange","DarkOrange","Crimson", "FireBrick"]
        return colors.find((col, index) => {
        return index >= thresholds.length || progress < thresholds[index];
        });
    }


     // This function determines the radius of the earthquake marker based on its magnitude.
    function getRadiussize(magnitude) {
     return magnitude * 6;
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
    }).addTo(earthquakeData);

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

    // Adding legend to the map
    legend.addTo(myMap);

    });

    // **************************************
    // Getting the tectonic geojson data
    // **************************************
    
    // get tectonic plates data from geojson url
    d3.json("https://raw.githubusercontent.com/fraxen/tectonicplates/master/GeoJSON/PB2002_boundaries.json").then(function(plateData) {
        // Adding our geoJSON data, along with style information, to the tectonicplates
        // layer.
        L.geoJson(plateData, {
            color: "#ff6500",
            weight: 2
        })
        .addTo(tectonicPlates);

            tectonicPlates.addTo(myMap);
    });
