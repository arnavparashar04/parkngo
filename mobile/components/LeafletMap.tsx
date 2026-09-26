import React, { useRef, useEffect } from 'react';
import { StyleSheet, View } from 'react-native';
import { WebView } from 'react-native-webview';

interface ParkingSpace {
  id: string;
  name: string;
  latitude: number;
  longitude: number;
  price_per_hour: number;
}

interface LeafletMapProps {
  spaces: ParkingSpace[];
  searchResults?: any[];
  initialLat?: number;
  initialLng?: number;
  initialZoom?: number;
  centerLat?: number;
  centerLng?: number;
  userLat?: number;
  userLng?: number;
  searchLat?: number;
  searchLng?: number;
  onMarkerPress: (id: string) => void;
  onSearchResultSelect?: (lat: number, lng: number) => void;
}

export default function LeafletMap({
  spaces,
  searchResults = [],
  initialLat = 12.9353,
  initialLng = 77.5348,
  initialZoom = 15,
  centerLat,
  centerLng,
  userLat,
  userLng,
  searchLat,
  searchLng,
  onMarkerPress,
  onSearchResultSelect,
}: LeafletMapProps) {
  const webViewRef = useRef<WebView>(null);

  // Update parking markers when spaces change
  useEffect(() => {
    if (webViewRef.current) {
      const script = `
        if (window.updateParkingMarkers) {
          window.updateParkingMarkers(${JSON.stringify(spaces)});
        }
        true;
      `;
      webViewRef.current.injectJavaScript(script);
    }
  }, [spaces]);

  // Update search result markers
  useEffect(() => {
    if (webViewRef.current) {
      const script = `
        if (window.updateSearchResults) {
          window.updateSearchResults(${JSON.stringify(searchResults)});
        }
        true;
      `;
      webViewRef.current.injectJavaScript(script);
    }
  }, [searchResults]);

  // Update map center and location markers
  useEffect(() => {
    if (webViewRef.current) {
      const script = `
        if (window.updateMapLocations) {
          window.updateMapLocations(
            ${centerLat !== undefined ? centerLat : 'null'}, 
            ${centerLng !== undefined ? centerLng : 'null'},
            ${userLat !== undefined ? userLat : 'null'}, 
            ${userLng !== undefined ? userLng : 'null'},
            ${searchLat !== undefined ? searchLat : 'null'}, 
            ${searchLng !== undefined ? searchLng : 'null'}
          );
        }
        true;
      `;
      webViewRef.current.injectJavaScript(script);
    }
  }, [centerLat, centerLng, userLat, userLng, searchLat, searchLng]);

  const htmlContent = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no" />
  <link rel="stylesheet" href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css" />
  <script src="https://unpkg.com/leaflet@1.9.4/dist/leaflet.js"></script>
  <style>
    html, body, #map {
      height: 100%;
      width: 100%;
      margin: 0;
      padding: 0;
      background-color: #000000;
    }
    .parking-marker {
      background-color: #E53935; /* Red */
      color: #FFFFFF;
      border: 2px solid #FFFFFF;
      border-radius: 8px;
      font-weight: 800;
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      font-size: 13px;
      padding: 4px 8px;
      white-space: nowrap;
      box-shadow: 0 4px 10px rgba(0,0,0,0.6);
      text-align: center;
      cursor: pointer;
      display: inline-block;
      transform: translate(-50%, -50%);
    }
    .parking-marker:active {
      transform: translate(-50%, -50%) scale(0.95);
      background-color: #B71C1C;
    }
    /* Yellow search result pointer */
    .search-result-marker {
      background-color: #FFEB3B; /* Yellow */
      color: #000000;
      border: 2px solid #000000;
      border-radius: 50%;
      width: 24px;
      height: 24px;
      display: flex;
      align-items: center;
      justify-content: center;
      font-weight: bold;
      box-shadow: 0 4px 10px rgba(0,0,0,0.6);
      transform: translate(-50%, -50%);
      cursor: pointer;
      font-size: 12px;
    }
    .search-result-marker:active {
      transform: translate(-50%, -50%) scale(0.95);
      background-color: #FBC02D;
    }
    /* Pure dark mode filter for OpenStreetMap tiles - NO watermark, NO API keys needed */
    .leaflet-tile-pane {
      filter: invert(100%) hue-rotate(180deg) brightness(85%) contrast(95%);
    }
    /* Hide Leaflet bottom attribution bar for clean app UI */
    .leaflet-control-attribution {
      display: none !important;
    }
    /* Zoom controls in dark style */
    .leaflet-bar a {
      background-color: #1E1E1E !important;
      color: #E53935 !important;
      border-color: #333333 !important;
    }
    /* Current Location Marker (Blue Dot) */
    .current-location {
      background-color: #3b82f6;
      border: 3px solid white;
      border-radius: 50%;
      width: 16px;
      height: 16px;
      box-shadow: 0 0 10px rgba(59, 130, 246, 0.8);
      transform: translate(-50%, -50%);
    }
    /* Search Location Marker (Purple Pin) */
    .search-location {
      background-color: #9C27B0;
      color: #FFFFFF;
      border: 2px solid #FFFFFF;
      border-radius: 50%;
      width: 24px;
      height: 24px;
      display: flex;
      align-items: center;
      justify-content: center;
      font-weight: bold;
      box-shadow: 0 4px 10px rgba(0,0,0,0.6);
      transform: translate(-50%, -50%);
    }
  </style>
</head>
<body>
  <div id="map"></div>
  <script>
    var map = L.map('map', {
      zoomControl: false,
      attributionControl: false
    }).setView([${initialLat}, ${initialLng}], ${initialZoom});

    // 100% Free OpenStreetMap tile server - NO API KEY OR ACCOUNT REQUIRED
    L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
      maxZoom: 19
    }).addTo(map);

    // Zoom control at top right
    L.control.zoom({ position: 'topright' }).addTo(map);

    var markersLayer = L.layerGroup().addTo(map);
    var searchResultsLayer = L.layerGroup().addTo(map);
    var currentLocationMarker = null;
    var searchLocationMarker = null;
    var currentLat = null;
    var currentLng = null;

    function createMarker(space) {
      var icon = L.divIcon({
        className: 'custom-div-icon',
        html: '<div class="parking-marker">🅿️ ₹' + space.price_per_hour + '</div>',
        iconSize: [0, 0]
      });

      var marker = L.marker([space.latitude, space.longitude], { icon: icon });
      marker.on('click', function() {
        if (window.ReactNativeWebView) {
          window.ReactNativeWebView.postMessage(JSON.stringify({
            type: 'MARKER_CLICK',
            id: space.id
          }));
        }
      });
      return marker;
    }

    function createSearchResultMarker(result, index) {
      var icon = L.divIcon({
        className: 'custom-div-icon',
        html: '<div class="search-result-marker">' + (index + 1) + '</div>',
        iconSize: [0, 0]
      });

      var lat = parseFloat(result.lat);
      var lon = parseFloat(result.lon);
      var marker = L.marker([lat, lon], { icon: icon });
      
      marker.on('click', function() {
        if (window.ReactNativeWebView) {
          window.ReactNativeWebView.postMessage(JSON.stringify({
            type: 'SEARCH_RESULT_CLICK',
            lat: lat,
            lng: lon
          }));
        }
      });
      return marker;
    }

    window.updateParkingMarkers = function(parkingList) {
      markersLayer.clearLayers();
      if (parkingList && parkingList.length > 0) {
        var bounds = [];
        
        parkingList.forEach(function(space) {
          var m = createMarker(space);
          markersLayer.addLayer(m);
          bounds.push([space.latitude, space.longitude]);
        });
        
        if (currentLat !== null && currentLng !== null) {
          bounds.push([currentLat, currentLng]);
        }
        
        if (bounds.length > 0) {
          map.fitBounds(bounds, { padding: [50, 50], maxZoom: 16 });
        }
      }
    };

    window.updateSearchResults = function(resultsList) {
      searchResultsLayer.clearLayers();
      if (resultsList && resultsList.length > 0) {
        var bounds = [];
        
        resultsList.forEach(function(result, index) {
          var m = createSearchResultMarker(result, index);
          searchResultsLayer.addLayer(m);
          bounds.push([parseFloat(result.lat), parseFloat(result.lon)]);
        });
        
        if (bounds.length > 0) {
          map.fitBounds(bounds, { padding: [50, 50], maxZoom: 16 });
        }
      }
    };

    window.updateMapLocations = function(cLat, cLng, uLat, uLng, sLat, sLng) {
      if (cLat !== null && cLng !== null) {
        currentLat = cLat;
        currentLng = cLng;
        map.setView([cLat, cLng], 14);
      }
      
      // Update user location marker (blue dot)
      if (currentLocationMarker) {
        map.removeLayer(currentLocationMarker);
      }
      if (uLat !== null && uLng !== null) {
        var userIcon = L.divIcon({
          className: 'custom-div-icon',
          html: '<div class="current-location"></div>',
          iconSize: [0, 0]
        });
        currentLocationMarker = L.marker([uLat, uLng], { icon: userIcon }).addTo(map);
      }

      // Update searched location marker (purple pin)
      if (searchLocationMarker) {
        map.removeLayer(searchLocationMarker);
      }
      if (sLat !== null && sLng !== null) {
        var searchIcon = L.divIcon({
          className: 'custom-div-icon',
          html: '<div class="search-location">🎯</div>',
          iconSize: [0, 0]
        });
        searchLocationMarker = L.marker([sLat, sLng], { icon: searchIcon }).addTo(map);
      }
    };

    // Initial load
    window.updateParkingMarkers(${JSON.stringify(spaces)});
    window.updateSearchResults(${JSON.stringify(searchResults)});
  </script>
</body>
</html>
  `;

  const handleMessage = (event: any) => {
    try {
      const data = JSON.parse(event.nativeEvent.data);
      if (data.type === 'MARKER_CLICK' && data.id) {
        onMarkerPress(data.id);
      } else if (data.type === 'SEARCH_RESULT_CLICK' && onSearchResultSelect) {
        onSearchResultSelect(data.lat, data.lng);
      }
    } catch (err) {
      console.error('Error handling map message:', err);
    }
  };

  return (
    <View style={styles.container}>
      <WebView
        ref={webViewRef}
        originWhitelist={['*']}
        source={{ html: htmlContent }}
        style={styles.webview}
        onMessage={handleMessage}
        javaScriptEnabled={true}
        domStorageEnabled={true}
        startInLoadingState={false}
        scrollEnabled={false}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    width: '100%',
    height: '100%',
    backgroundColor: '#000000',
  },
  webview: {
    flex: 1,
    backgroundColor: '#000000',
  },
});

