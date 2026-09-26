import React, { useState, useEffect, useRef, useCallback } from 'react';
import { StyleSheet, View, Text, TextInput, TouchableOpacity, Alert, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import * as Location from 'expo-location';
import LeafletMap from '../../components/LeafletMap';
import ShimmerPlaceholder from '../../components/ShimmerPlaceholder';

// Updated IP address based on current network interface
const API_BASE_URL = 'http://10.13.36.137:8000';

export default function HomeScreen() {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState('');
  const [nearbyParking, setNearbyParking] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [showList, setShowList] = useState(true);
  const [suggestions, setSuggestions] = useState<any[]>([]);
  
  // 3 distinct location concepts:
  // 1. userLocation  - GPS blue dot (never moves unless GPS updates)
  // 2. searchLocation - purple pin where user searched (set after selecting a yellow result)
  // 3. searchResults  - yellow pins showing geocoding matches (shown before user picks one)
  const [userLocation, setUserLocation] = useState<{lat: number, lng: number} | null>(null);
  const [searchLocation, setSearchLocation] = useState<{lat: number, lng: number} | null>(null);
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [mapCenter, setMapCenter] = useState({ lat: 12.9353, lng: 77.5348 });

  // Debounced search suggestions using Nominatim
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const fetchSuggestions = useCallback((query: string) => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    if (query.length < 3) { setSuggestions([]); return; }
    debounceRef.current = setTimeout(async () => {
      try {
        const res = await fetch(
          `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query)}&limit=5`,
          { headers: { 'User-Agent': 'ParkNGoApp/1.0' } }
        );
        const text = await res.text();
        try {
          const data = JSON.parse(text);
          setSuggestions(data || []);
        } catch { setSuggestions([]); }
      } catch { setSuggestions([]); }
    }, 400);
  }, []);

  const onSearchTextChange = (text: string) => {
    setSearchQuery(text);
    fetchSuggestions(text);
  };

  const onSuggestionTap = (item: any) => {
    const lat = parseFloat(item.lat);
    const lng = parseFloat(item.lon);
    setSuggestions([]);
    setSearchQuery(item.display_name.split(',').slice(0, 2).join(', '));
    setNearbyParking([]);
    setSearchResults([]);
    setSearchLocation({ lat, lng });
    setMapCenter({ lat, lng });
    fetchNearbyParking(lat, lng);
  };

  // ── Fetch parking spots within 1km of a coordinate ──
  const fetchNearbyParking = async (lat: number, lng: number) => {
    try {
      setLoading(true);
      const response = await fetch(
        `${API_BASE_URL}/api/parking/nearby?lat=${lat}&lng=${lng}&vehicle_type=SUV&radius_km=1.0`
      );
      
      if (response.ok) {
        let results = await response.json();
        // Add walking time estimate (~80 m/min walking speed)
        results = results.map((space: any) => ({
          ...space,
          walk_time_mins: Math.max(1, Math.ceil(space.distance / 80)),
        }));
        setNearbyParking(results);
      } else {
        console.error('Failed to fetch parking spaces:', response.status);
        setNearbyParking([]);
      }
    } catch (error) {
      console.error('Error fetching parking:', error);
      setNearbyParking([]);
    } finally {
      setLoading(false);
    }
  };

  // ── Get user's real GPS location on mount ──
  const getUserLocation = async () => {
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Location Permission Denied', 'Showing default location.');
        fetchNearbyParking(mapCenter.lat, mapCenter.lng);
        return;
      }
      const location = await Location.getCurrentPositionAsync({});
      const { latitude, longitude } = location.coords;
      setUserLocation({ lat: latitude, lng: longitude });
      setMapCenter({ lat: latitude, lng: longitude });
      fetchNearbyParking(latitude, longitude);
    } catch (error) {
      console.error('Error getting location', error);
      fetchNearbyParking(mapCenter.lat, mapCenter.lng);
    }
  };

  useEffect(() => {
    getUserLocation();
  }, []);

  // ── Search: geocode query → show yellow pins ──
  const handleSearch = async () => {
    if (!searchQuery.trim()) return;
    setSuggestions([]); // clear dropdown
    try {
      setLoading(true);
      const response = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(searchQuery)}`,
        { headers: { 'User-Agent': 'ParkNGoApp/1.0', 'Accept-Language': 'en-US,en;q=0.9' } }
      );
      const text = await response.text();
      let data;
      try { data = JSON.parse(text); } catch (e) {
        console.error('Nominatim non-JSON:', text.substring(0, 100));
        throw new Error('Invalid response');
      }

      if (data && data.length > 0) {
        // Phase 1: clear old parking, show yellow location pins
        setNearbyParking([]);
        setSearchLocation(null);
        setSearchResults(data.slice(0, 5));
        setMapCenter({ lat: parseFloat(data[0].lat), lng: parseFloat(data[0].lon) });
      } else {
        Alert.alert('Location not found', 'Try a different search term.');
      }
    } catch (error) {
      console.error('Geocoding error:', error);
      Alert.alert('Error', 'Failed to search location.');
    } finally {
      setLoading(false);
    }
  };

  // ── User taps a yellow pin → confirm that location, fetch parking ──
  const handleSearchResultSelect = (lat: number, lng: number) => {
    setSearchResults([]);           // remove yellow pins
    setSearchLocation({ lat, lng }); // drop purple pin
    setMapCenter({ lat, lng });
    fetchNearbyParking(lat, lng);    // fetch 1km radius parking
  };

  const handleMarkerPress = (id: string) => {
    router.push(`/parking/${id}`);
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Search Bar + Suggestions */}
      <View style={styles.searchContainer}>
        <TextInput
          style={styles.searchInput}
          placeholder="🔍 Search a destination..."
          placeholderTextColor="#888"
          value={searchQuery}
          onChangeText={onSearchTextChange}
          onSubmitEditing={handleSearch}
          returnKeyType="search"
        />
        {suggestions.length > 0 && (
          <View style={styles.suggestionsDropdown}>
            {suggestions.map((item: any, i: number) => (
              <TouchableOpacity key={i} style={styles.suggestionItem} onPress={() => onSuggestionTap(item)}>
                <Text style={styles.suggestionText} numberOfLines={1}>
                  📍 {item.display_name}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        )}
      </View>

      {/* Map – 3 marker types: blue dot (you), yellow (search candidates), red (parking) + purple (selected) */}
      <LeafletMap
        spaces={nearbyParking}
        searchResults={searchResults}
        onMarkerPress={handleMarkerPress}
        onSearchResultSelect={handleSearchResultSelect}
        centerLat={mapCenter.lat}
        centerLng={mapCenter.lng}
        userLat={userLocation?.lat}
        userLng={userLocation?.lng}
        searchLat={searchLocation?.lat}
        searchLng={searchLocation?.lng}
      />

      {/* Bottom Panel */}
      <View style={styles.bottomContainer}>
        {loading ? (
          <View style={styles.listContainer}>
            <Text style={styles.listTitle}>Finding parking...</Text>
            {[1, 2].map((i) => (
              <View key={i} style={styles.listItem}>
                <View>
                  <ShimmerPlaceholder width={150} height={20} style={{ marginBottom: 6 }} />
                  <ShimmerPlaceholder width={100} height={14} />
                </View>
                <ShimmerPlaceholder width={60} height={20} />
              </View>
            ))}
          </View>
        ) : nearbyParking.length > 0 ? (
          <View style={styles.listContainer}>
            <View style={styles.listHeader}>
              <Text style={styles.listTitle}>
                Nearby Parking ({nearbyParking.length})
              </Text>
              <TouchableOpacity onPress={() => setShowList(!showList)}>
                <Text style={styles.toggleText}>{showList ? 'Hide ▾' : 'Show ▸'}</Text>
              </TouchableOpacity>
            </View>

            {showList && (
              <ScrollView style={{ maxHeight: 180 }} nestedScrollEnabled>
                {nearbyParking.map(space => (
                  <TouchableOpacity key={space.id} style={styles.listItem} onPress={() => handleMarkerPress(space.id)}>
                    <View style={{ flex: 1 }}>
                      <Text style={styles.listName} numberOfLines={1}>{space.name}</Text>
                      <Text style={styles.listDetails}>
                        {space.distance_formatted} away • 🚶 {space.walk_time_mins} min walk
                      </Text>
                    </View>
                    <Text style={styles.listPrice}>₹{space.price_per_hour}/hr</Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>
            )}
          </View>
        ) : searchResults.length > 0 ? (
          <View style={styles.listContainer}>
            <Text style={styles.listTitle}>Tap a yellow pin to select location</Text>
          </View>
        ) : null}

        <TouchableOpacity
          style={styles.primaryButton}
          onPress={() => fetchNearbyParking(mapCenter.lat, mapCenter.lng)}
          disabled={loading}
        >
          <Text style={styles.primaryButtonText}>
            {loading ? 'Searching...' : '🅿️ Find Parking Here'}
          </Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000000',
  },
  searchContainer: {
    position: 'absolute',
    top: 15,
    left: 20,
    right: 20,
    zIndex: 1,
    backgroundColor: '#1E1E1E',
    borderRadius: 8,
    paddingHorizontal: 15,
    paddingVertical: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.5,
    shadowRadius: 4,
    elevation: 3,
  },
  searchInput: {
    fontSize: 16,
    color: '#FFF',
  },
  suggestionsDropdown: {
    backgroundColor: '#1E1E1E',
    borderTopWidth: 1,
    borderTopColor: '#333',
    marginTop: 10,
  },
  suggestionItem: {
    paddingVertical: 10,
    paddingHorizontal: 5,
    borderBottomWidth: 1,
    borderBottomColor: '#2a2a2a',
  },
  suggestionText: {
    color: '#DDD',
    fontSize: 13,
  },
  bottomContainer: {
    position: 'absolute',
    bottom: 20,
    left: 20,
    right: 20,
  },
  primaryButton: {
    backgroundColor: '#FFD700',
    paddingVertical: 15,
    borderRadius: 12,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 4,
  },
  primaryButtonText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#000',
  },
  listContainer: {
    backgroundColor: '#1E1E1E',
    borderRadius: 12,
    padding: 15,
    marginBottom: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.5,
    shadowRadius: 4,
    elevation: 3,
  },
  listHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  listTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#FFF',
  },
  toggleText: {
    color: '#3b82f6',
    fontSize: 14,
    fontWeight: '600',
  },
  listItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#333',
  },
  listName: {
    fontSize: 14,
    fontWeight: '600',
    color: '#FFF',
  },
  listDetails: {
    fontSize: 12,
    color: '#AAA',
    marginTop: 2,
  },
  listPrice: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#FFD700',
  },
});
