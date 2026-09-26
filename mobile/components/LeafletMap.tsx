import React, { useRef, useEffect } from 'react';
import { StyleSheet, View } from 'react-native';
import { WebView } from 'react-native-webview';

interface ParkingSpace {
  id: string;
  name: string;
  latitude: number;
  longitude: number;
  price_per_hour: number;
  walk_time_mins?: number;
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
  const mapReady = useRef(false);

  const inject = (script: string) => {
    if (webViewRef.current && mapReady.current) {
      webViewRef.current.injectJavaScript(script + '\ntrue;');
    }
  };

  // Sync parking markers
  useEffect(() => {
    inject(`window.setParkingMarkers && window.setParkingMarkers(${JSON.stringify(spaces)});`);
  }, [spaces]);

  // Sync search result markers
  useEffect(() => {
    inject(`window.setSearchResults && window.setSearchResults(${JSON.stringify(searchResults)});`);
  }, [searchResults]);

  // Sync user location blue dot
  useEffect(() => {
    if (userLat !== undefined && userLng !== undefined) {
      inject(`window.setUserLocation && window.setUserLocation(${userLat}, ${userLng});`);
    }
  }, [userLat, userLng]);

  // Sync selected search location purple pin + zoom
  useEffect(() => {
    if (searchLat !== undefined && searchLng !== undefined) {
      inject(`window.setSearchPin && window.setSearchPin(${searchLat}, ${searchLng});`);
    } else {
      inject(`window.clearSearchPin && window.clearSearchPin();`);
    }
  }, [searchLat, searchLng]);

  // Center map
  useEffect(() => {
    if (centerLat !== undefined && centerLng !== undefined) {
      inject(`window.panTo && window.panTo(${centerLat}, ${centerLng});`);
    }
  }, [centerLat, centerLng]);

  const htmlContent = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8"/>
  <meta name="viewport" content="width=device-width,initial-scale=1,maximum-scale=1,user-scalable=no"/>
  <link rel="stylesheet" href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css"/>
  <script src="https://unpkg.com/leaflet@1.9.4/dist/leaflet.js"></script>
  <style>
    *{margin:0;padding:0}
    html,body,#map{height:100%;width:100%;background:#000}

    /* ── Dark mode tile filter ── */
    .leaflet-tile-pane{filter:invert(100%) hue-rotate(180deg) brightness(85%) contrast(95%)}
    .leaflet-control-attribution{display:none!important}
    .leaflet-bar a{background:#1E1E1E!important;color:#FFD700!important;border-color:#333!important}

    /* ── Parking spot (RED) ── */
    .p-marker{
      background:#E53935;color:#fff;border:2px solid #fff;border-radius:8px;
      font:800 12px/-apple-system,sans-serif;padding:3px 7px;white-space:nowrap;
      box-shadow:0 3px 8px rgba(0,0,0,.6);text-align:center;
      transform:translate(-50%,-100%);cursor:pointer;
    }
    .p-marker::after{
      content:'';position:absolute;bottom:-8px;left:50%;transform:translateX(-50%);
      border:6px solid transparent;border-top-color:#E53935;
    }

    /* ── Search candidate (YELLOW numbered) ── */
    .sr-marker{
      background:#FFEB3B;color:#000;border:2px solid #000;border-radius:50%;
      width:28px;height:28px;display:flex;align-items:center;justify-content:center;
      font:bold 13px sans-serif;box-shadow:0 3px 8px rgba(0,0,0,.6);
      transform:translate(-50%,-50%);cursor:pointer;
    }

    /* ── User location (BLUE pulsing dot) ── */
    .u-dot{
      background:#3b82f6;border:3px solid #fff;border-radius:50%;
      width:16px;height:16px;box-shadow:0 0 12px rgba(59,130,246,.8);
      transform:translate(-50%,-50%);
      animation:pulse 2s infinite;
    }
    @keyframes pulse{0%,100%{box-shadow:0 0 6px rgba(59,130,246,.6)}50%{box-shadow:0 0 18px rgba(59,130,246,.9)}}

    /* ── Selected search location (PURPLE pin) ── */
    .s-pin{
      background:#9C27B0;color:#fff;border:2px solid #fff;border-radius:50%;
      width:26px;height:26px;display:flex;align-items:center;justify-content:center;
      font:bold 14px sans-serif;box-shadow:0 3px 10px rgba(156,39,176,.6);
      transform:translate(-50%,-50%);
    }
  </style>
</head>
<body>
<div id="map"></div>
<script>
  var map = L.map('map',{zoomControl:false,attributionControl:false})
    .setView([${initialLat},${initialLng}],${initialZoom});
  L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png',{maxZoom:19}).addTo(map);
  L.control.zoom({position:'topright'}).addTo(map);

  // Layer groups
  var parkingLayer = L.layerGroup().addTo(map);
  var searchLayer  = L.layerGroup().addTo(map);
  var userMarker   = null;
  var searchPin    = null;

  function msg(obj){window.ReactNativeWebView&&window.ReactNativeWebView.postMessage(JSON.stringify(obj));}

  // ── Parking markers (RED) ──
  window.setParkingMarkers = function(list){
    parkingLayer.clearLayers();
    if(!list||!list.length) return;
    var bounds=[];
    list.forEach(function(s){
      var label = s.walk_time_mins ? '🅿️ ₹'+s.price_per_hour+' • '+s.walk_time_mins+'min' : '🅿️ ₹'+s.price_per_hour;
      var icon=L.divIcon({className:'',html:'<div class="p-marker">'+label+'</div>',iconSize:[0,0]});
      var m=L.marker([s.latitude,s.longitude],{icon:icon});
      m.on('click',function(){msg({type:'MARKER_CLICK',id:s.id});});
      parkingLayer.addLayer(m);
      bounds.push([s.latitude,s.longitude]);
    });
    // Include search pin in bounds if present
    if(searchPin){bounds.push(searchPin.getLatLng());}
    if(userMarker){bounds.push(userMarker.getLatLng());}
    if(bounds.length>1) map.fitBounds(bounds,{padding:[60,60],maxZoom:16});
  };

  // ── Search candidates (YELLOW) ──
  window.setSearchResults = function(list){
    searchLayer.clearLayers();
    if(!list||!list.length) return;
    var bounds=[];
    list.forEach(function(r,i){
      var lat=parseFloat(r.lat),lon=parseFloat(r.lon);
      var icon=L.divIcon({className:'',html:'<div class="sr-marker">'+(i+1)+'</div>',iconSize:[0,0]});
      var m=L.marker([lat,lon],{icon:icon});
      m.on('click',function(){msg({type:'SEARCH_RESULT_CLICK',lat:lat,lng:lon});});
      searchLayer.addLayer(m);
      bounds.push([lat,lon]);
    });
    if(bounds.length) map.fitBounds(bounds,{padding:[60,60],maxZoom:16});
  };

  // ── User GPS location (BLUE dot) ──
  window.setUserLocation = function(lat,lng){
    if(userMarker) map.removeLayer(userMarker);
    var icon=L.divIcon({className:'',html:'<div class="u-dot"></div>',iconSize:[0,0]});
    userMarker=L.marker([lat,lng],{icon:icon,interactive:false}).addTo(map);
  };

  // ── Selected search location (PURPLE pin) ──
  window.setSearchPin = function(lat,lng){
    if(searchPin) map.removeLayer(searchPin);
    var icon=L.divIcon({className:'',html:'<div class="s-pin">📍</div>',iconSize:[0,0]});
    searchPin=L.marker([lat,lng],{icon:icon,interactive:false}).addTo(map);
    map.setView([lat,lng],15);
  };
  window.clearSearchPin = function(){
    if(searchPin){map.removeLayer(searchPin);searchPin=null;}
  };

  // ── Pan map ──
  window.panTo = function(lat,lng){map.setView([lat,lng],map.getZoom());};

  // Signal ready
  window.ReactNativeWebView && window.ReactNativeWebView.postMessage(JSON.stringify({type:'MAP_READY'}));
</script>
</body>
</html>
  `;

  const handleMessage = (event: any) => {
    try {
      const data = JSON.parse(event.nativeEvent.data);
      if (data.type === 'MAP_READY') {
        mapReady.current = true;
        // Push initial state now that map is ready
        if (spaces.length) inject(`window.setParkingMarkers(${JSON.stringify(spaces)});`);
        if (searchResults.length) inject(`window.setSearchResults(${JSON.stringify(searchResults)});`);
        if (userLat !== undefined && userLng !== undefined) inject(`window.setUserLocation(${userLat},${userLng});`);
        if (searchLat !== undefined && searchLng !== undefined) inject(`window.setSearchPin(${searchLat},${searchLng});`);
      } else if (data.type === 'MARKER_CLICK' && data.id) {
        onMarkerPress(data.id);
      } else if (data.type === 'SEARCH_RESULT_CLICK' && onSearchResultSelect) {
        onSearchResultSelect(data.lat, data.lng);
      }
    } catch (err) {
      console.error('Map message error:', err);
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
        javaScriptEnabled
        domStorageEnabled
        startInLoadingState={false}
        scrollEnabled={false}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, width: '100%', height: '100%', backgroundColor: '#000' },
  webview:   { flex: 1, backgroundColor: '#000' },
});
