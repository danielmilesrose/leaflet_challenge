const url = "https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/1.0_week.geojson";

// Perform a GET request to the query URL/
d3.json(url).then(function (data) {
    // Once we get a response, send the data.features object to the createFeatures function.
    createFeatures(data.features);
});

function createFeatures(earthquakeData) {
    // Define a function that we want to run once for each feature in the features array.
    // Give each feature a popup that describes the place, depth, magnitude, and time of the earthquake.
    function onEachFeature(feature, layer) {
        layer.bindPopup(
            `<h3>${feature.properties.place}</h3>
            <h5>${new Date(feature.properties.time)}</h5><hr>
            Depth: ${feature.geometry.coordinates[2]}, <br>
            Magnitude: ${feature.properties.mag}`);
    }

    // Create a GeoJSON layer that contains the features array on the earthquakeData object.
    // Run the onEachFeature function once for each piece of data in the array.
    let earthquakes = L.geoJSON(earthquakeData, {
        pointToLayer: function(feature, latlng) {
            return L.circleMarker(latlng, {
                radius: feature.properties.mag * 4,
                fillColor: depthColor(feature.geometry.coordinates[2]),
                color: "fff",
                weight: .5,
                opacity: .5,
                fillOpacity: 0.8
            });
        },
        onEachFeature: onEachFeature
    });
  
    // Send our earthquakes layer to the createMap function/
    createMap(earthquakes);
}

function createMap(earthquakes) {
    // Create the base layers.
    let street = L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
    });
  
    let topo = L.tileLayer('https://{s}.tile.opentopomap.org/{z}/{x}/{y}.png', {
        attribution: 'Map data: &copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors, <a href="http://viewfinderpanoramas.org">SRTM</a> | Map style: &copy; <a href="https://opentopomap.org">OpenTopoMap</a> (<a href="https://creativecommons.org/licenses/by-sa/3.0/">CC-BY-SA</a>)'
    });
  
    // Create a baseMaps object.
    let baseMaps = {
        "Street Map": street,
        "Topographic Map": topo
    };
  
    // Create an overlay object to hold our overlay.
    let overlayMaps = {
        Earthquakes: earthquakes
    };

    // Create our map, giving it the streetmap and earthquakes layers to display on load.
    let myMap = L.map("map", {
        center: [37.09, -95.71],
        zoom: 3,
        layers: [street, earthquakes]
    });
  
    // Create a layer control.
    // Pass it our baseMaps and overlayMaps.
    // Add the layer control to the map.
    L.control.layers(baseMaps, overlayMaps, {
        collapsed: false
    }).addTo(myMap);

    // Add legend
    let legend = L.control({position: "bottomright"});
    legend.onAdd = function() {
        let div = L.DomUtil.create("div", "info legend");
        let depths = ['-10-10', '10-30', '30-50', '50-70', '70-90', '90+'];
        let colors = ['green', 'yellow', 'gold', 'orange', 'orangered', 'red'];
        
        div.innerHTML += "<h3 style='text-align: center'>Depth</h3>";
        for (let i = 0; i < depths.length; i++) {
            div.innerHTML +=
                '<div style="background-color:' + colors[i] + '; width: 20px; height: 20px; display: inline-block;"></div> ' +
                depths[i] + '<br>';
        }
        return div;
    };
    legend.addTo(myMap);
}

// Define the depthColor function
function depthColor(depth) {
    if (depth < 10) {
        return "green";
    } else if (depth < 30) {
        return "yellow";
    } else if (depth < 50) {
        return "gold";
    } else if (depth < 70) {
        return "orange";
    } else if (depth < 90) {
        return "orangered";
    } else {
        return "red";
    }
}
