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
  initialLat?: number;
  initialLng?: number;
  initialZoom?: number;
  onMarkerPress: (id: string) => void;
}

export default function LeafletMap({
  spaces,
  initialLat = 12.9353,
  initialLng = 77.5348,
  initialZoom = 15,
  onMarkerPress,
}: LeafletMapProps) {
  const webViewRef = useRef<WebView>(null);

  // Update markers when spaces change
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
      background-color: #FFD700;
      color: #000000;
      border: 2px solid #000000;
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
      background-color: #e6c200;
    }
    /* Hide Leaflet bottom attribution bar for clean app UI */
    .leaflet-control-attribution {
      display: none !important;
    }
    /* Zoom controls in dark style */
    .leaflet-bar a {
      background-color: #1E1E1E !important;
      color: #FFD700 !important;
      border-color: #333333 !important;
    }
  </style>
</head>
<body>
  <div id="map"></div>
  <script>
    // Initialize map with Dark Matter tiles (free OpenStreetMap tiles by CartoDB)
    var map = L.map('map', {
      zoomControl: false,
      attributionControl: false
    }).setView([${initialLat}, ${initialLng}], ${initialZoom});

    // Dark Matter tile layer - NO API KEY NEEDED
    L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png', {
      maxZoom: 19,
      subdomains: 'abcd'
    }).addTo(map);

    // Zoom control at top right
    L.control.zoom({ position: 'topright' }).addTo(map);

    var markersLayer = L.layerGroup().addTo(map);

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

    window.updateParkingMarkers = function(parkingList) {
      markersLayer.clearLayers();
      if (parkingList && parkingList.length > 0) {
        parkingList.forEach(function(space) {
          var m = createMarker(space);
          markersLayer.addLayer(m);
        });
      }
    };

    // Initial load
    window.updateParkingMarkers(${JSON.stringify(spaces)});
  </script>
</body>
</html>
  `;

  const handleMessage = (event: any) => {
    try {
      const data = JSON.parse(event.nativeEvent.data);
      if (data.type === 'MARKER_CLICK' && data.id) {
        onMarkerPress(data.id);
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
