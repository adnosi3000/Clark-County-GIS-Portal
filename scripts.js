var map = L.map('mapid').setView([36, -115.25090228559984], 8);

L.tileLayer('https://api.mapbox.com/styles/v1/{id}/tiles/{z}/{x}/{y}?access_token=pk.eyJ1IjoibWFwYm94IiwiYSI6ImNpejY4NXVycTA2emYycXBndHRqcmZ3N3gifQ.rJcFIG214AriISLbB6B5aw', {
  maxZoom: 18,
  attribution: 'Map data &copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors, ' +
    'Imagery © <a href="https://www.mapbox.com/">Mapbox</a>',
  id: 'mapbox/streets-v11',
  tileSize: 512,
  zoomOffset: -1
}).addTo(map);

var kodyPocztowe = L.geoJSON(zipCodes, {
  style: function(feature){
    return{
      color: '#7094db'
    }
  },
  onEachFeature: function(feature, layer){
    layer.bindPopup('<p>ZIP Code:<br><b>'+feature.properties.ZIP+'</b></p>');
    layer.on('mouseover', function(){
      this.setStyle({fillColor: '#00ffff'})
    });
    layer.on('mouseout', function(){
      this.setStyle({fillColor: '#7094db'})
    })
  }
}).addTo(map);

var posterunek = L.icon({
  iconUrl: 'fire-station.png',
  iconSize: [32, 32],
  iconAnchor: [16, 32],
  popupAnchor: [0, -34],
});

var trzesienie = L.icon({
  iconUrl: 'crack.png',
  iconSize: [32, 32],
  iconAnchor: [16, 32],
  popupAnchor: [0, -34],
});

function hideIcons() {
  if(map.hasLayer(strazPozarna)) {
    map.removeLayer(strazPozarna);
  } else {
    strazPozarna.addTo(map);
  };
}

function hideAreas() {
  if(map.hasLayer(kodyPocztowe)) {
    map.removeLayer(kodyPocztowe);
  } else {
    kodyPocztowe.addTo(map);
  };
}

function hideEarthQuakes() {
  if(map.hasLayer(earthquakes)) {
    map.removeLayer(earthquakes);
  } else {
    earthquakes.addTo(map);
  };
};

function showSlider(){
  if (document.getElementById('slider').style.marginLeft == "-325px"){
    document.getElementById('slider').style.marginLeft = "15px";
    document.getElementById('button1').innerHTML = "Hide"
  } else {
    document.getElementById('slider').style.marginLeft = "-325px";
    document.getElementById('button1').innerHTML = "Show"
  }
};

var strazPozarna = L.geoJSON(fireStations, {
  onEachFeature: function(feature, layer){
    layer.bindPopup('<p><b>Fire Station:</b> '+feature.properties.FAC_NAME+'</p><b>Address:</b> '+feature.properties.FAC_ADD+'</p><p><b>Engines:</b> '+feature.properties.ENGINE+'</p><p><b>Battalion:</b> '+feature.properties.BATTALION+'</p>');
    layer.setIcon(posterunek)
  }
}).addTo(map);

var myRequest = new XMLHttpRequest();
myRequest.open('GET', 'https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/all_day.geojson');
myRequest.onload = function(){
  var earthquakes = JSON.parse(myRequest.responseText);
  window.earthquakes = L.geoJSON(earthquakes, {
    onEachFeature: function(feature, layer){
      layer.setIcon(trzesienie);
      layer.bindPopup('<p><b>Earthquake location: </b>'+ feature.properties.place +'</p><p><b>Magnitude: </b>'+ feature.properties.mag +'</p>')
    }
  }).addTo(map);
  var heatMapPoints = [];
  earthquakes.features.forEach(function(feature){
    heatMapPoints.push([feature.geometry.coordinates[1], feature.geometry.coordinates[0], feature.properties.mag/6])
  });
  var heat = L.heatLayer(heatMapPoints, {
    radius: 25,
    minOpacity: 0.8,
    gradient: {0.4: 'yellow', 0.85: 'orange', 1: 'red'}
  }).addTo(map);
};
myRequest.send();

function SearchEarthquakeByLocation(){
  var userInput = document.getElementById('filterByName').value;
  earthquakes.eachLayer(function(layer){
    if (layer.feature.properties.place.toLowerCase().indexOf(userInput.toLowerCase())>=1){
      layer.addTo(map)
    } else if(userInput ==''){
      layer.addTo(map)
    } else {
      map.removeLayer(layer);
    }
  })
};

function filterByMagnitude(){
  var userInput = document.getElementById('magValue').value;
  document.getElementById('magInfo').innerHTML = userInput;
  earthquakes.eachLayer(function(layer){
    if (layer.feature.properties.mag < userInput){
      layer.addTo(map)
    } else {
      map.removeLayer(layer);
    }
  })
};

function filterByBattalion(){
  var userInput = document.getElementById('filterByBattalion').value;
  strazPozarna.eachLayer(function(layer){
    if (layer.feature.properties.BATTALION == userInput){
      layer.addTo(map)
    } else if(userInput ==''){
      layer.addTo(map)
    } else {
      map.removeLayer(layer);
    }
  })
};

var ZIPCodeList = "";
for (i=0; i<zipCodes.features.length; i++){
  ZIPCodeList = ZIPCodeList + "<option>"+(String(zipCodes.features[i].properties.ZIP)+"</option>");
};
document.getElementById('zoomByZIP').innerHTML = ZIPCodeList;
function zoomByZIP(){
  var code = document.getElementById('zoomByZIP').value;
  for (i=0; i<zipCodes.features.length; i++){
    if (String(zipCodes.features[i].properties.ZIP) == code){
      var coords = zipCodes.features[i].geometry.coordinates[0];
      maxLon = zipCodes.features[i].geometry.coordinates[0][0][0];
      maxLat = zipCodes.features[i].geometry.coordinates[0][0][1];
      minLon = zipCodes.features[i].geometry.coordinates[0][0][0];
      minLat = zipCodes.features[i].geometry.coordinates[0][0][1];
      for (j=1; j<coords.length; j++){
        if (zipCodes.features[i].geometry.coordinates[0][j][0] > maxLon){
          maxLon = zipCodes.features[i].geometry.coordinates[0][j][0]
        };
        if (zipCodes.features[i].geometry.coordinates[0][j][1] > maxLat){
          maxLat = zipCodes.features[i].geometry.coordinates[0][j][1]
        };
        if (zipCodes.features[i].geometry.coordinates[0][j][0] < minLon){
          minLon = zipCodes.features[i].geometry.coordinates[0][j][0]
        };
        if (zipCodes.features[i].geometry.coordinates[0][j][1] < minLat){
          minLat = zipCodes.features[i].geometry.coordinates[0][j][1]
        };
      };
      var middleLon = (maxLon + minLon)/2;
      var middleLat = (maxLat + minLat)/2;
      map.setView([middleLat, middleLon], 14);
      break;
    }
  }
};
