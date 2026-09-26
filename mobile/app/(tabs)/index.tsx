import React, { useState, useEffect } from 'react';
import { StyleSheet, View, Text, TextInput, TouchableOpacity, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import * as Location from 'expo-location';
import LeafletMap from '../../components/LeafletMap';
import ShimmerPlaceholder from '../../components/ShimmerPlaceholder';

// Updated IP address based on current network interface
const API_BASE_URL = 'http://172.29.45.137:8000';

export default function HomeScreen() {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState('');
  const [nearbyParking, setNearbyParking] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  
  const [userLocation, setUserLocation] = useState<{lat: number, lng: number} | null>(null);
  const [searchLocation, setSearchLocation] = useState<{lat: number, lng: number} | null>(null);
  const [searchResults, setSearchResults] = useState<any[]>([]);
  // Default map center
  const [mapCenter, setMapCenter] = useState({ lat: 12.9353, lng: 77.5348 });

  const fetchNearbyParking = async (lat: number, lng: number) => {
    try {
      setLoading(true);
      // Strictly 1km radius
      const response = await fetch(`${API_BASE_URL}/api/parking/nearby?lat=${lat}&lng=${lng}&vehicle_type=SUV&radius_km=1.0`);
      
      if (response.ok) {
        let results = await response.json();
        
        // Calculate estimated walking time (approx 80 meters per minute)
        results = results.map((space: any) => ({
          ...space,
          walk_time_mins: Math.ceil(space.distance / 80)
        }));
        
        setNearbyParking(results);
        if (results.length === 0) {
          Alert.alert("No spots found", "No parking spots found within 1km of this location.");
        }
      } else {
        console.error('Failed to fetch parking spaces:', response.status);
      }
    } catch (error) {
      console.error('Error fetching parking:', error);
    } finally {
      setLoading(false);
    }
  };

  const getUserLocation = async () => {
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permission to access location was denied');
        // Fallback to default location
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

  const handleSearch = async () => {
    if (!searchQuery.trim()) return;
    try {
      setLoading(true);
      // Use Nominatim free geocoding API with required User-Agent header
      const response = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(searchQuery)}`,
        {
          headers: {
            'User-Agent': 'ParkNGoApp/1.0',
            'Accept-Language': 'en-US,en;q=0.9'
          }
        }
      );
      
      const text = await response.text();
      let data;
      try {
        data = JSON.parse(text);
      } catch (e) {
        console.error("Nominatim responded with non-JSON:", text.substring(0, 100));
        throw new Error("Invalid response from map server");
      }
      
      if (data && data.length > 0) {
        // Clear previous parking spots while we wait for user to select a location
        setNearbyParking([]);
        setSearchLocation(null);
        // Show up to 5 best matches
        setSearchResults(data.slice(0, 5));
        
        // Center map to the first match so they are in view
        const lat = parseFloat(data[0].lat);
        const lng = parseFloat(data[0].lon);
        setMapCenter({ lat, lng });
      } else {
        Alert.alert('Location not found', 'Please try a different search term.');
      }
    } catch (error) {
      console.error('Geocoding error:', error);
      Alert.alert('Error', 'Failed to search location.');
    } finally {
      setLoading(false);
    }
  };

  const handleMarkerPress = (id: string) => {
    router.push(`/parking/${id}`);
  };

  const handleSearchResultSelect = (lat: number, lng: number) => {
    // Clear search results and fetch parking
    setSearchResults([]);
    setSearchLocation({ lat, lng });
    setMapCenter({ lat, lng });
    fetchNearbyParking(lat, lng);
  };

  const [showList, setShowList] = useState(true);

  return (
    <SafeAreaView style={styles.container}>
      {/* Search Bar */}
      <View style={styles.searchContainer}>
        <TextInput 
          style={styles.searchInput}
          placeholder="🔍 Where are you going?"
          placeholderTextColor="#888"
          value={searchQuery}
          onChangeText={setSearchQuery}
          onSubmitEditing={handleSearch}
          returnKeyType="search"
        />
      </View>

      {/* Interactive Dark Map (OpenStreetMap / Leaflet) - No API Key Needed */}
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

      {/* Bottom Container */}
      <View style={styles.bottomContainer}>
        {loading ? (
          <View style={styles.listContainer}>
            <Text style={styles.listTitle}>Loading Spots...</Text>
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
        ) : nearbyParking.length > 0 && (
          <View style={styles.listContainer}>
            <View style={styles.listHeader}>
              <Text style={styles.listTitle}>Recommended Spots</Text>
              <TouchableOpacity onPress={() => setShowList(!showList)}>
                <Text style={styles.toggleText}>{showList ? 'Hide' : 'Show'}</Text>
              </TouchableOpacity>
            </View>
            
            {showList && nearbyParking.slice(0, 3).map(space => (
              <TouchableOpacity key={space.id} style={styles.listItem} onPress={() => handleMarkerPress(space.id)}>
                <View style={{flex: 1}}>
                  <Text style={styles.listName} numberOfLines={1}>{space.name}</Text>
                  <Text style={styles.listDetails}>Score: {space.recommendation_score} • {space.distance_formatted} • 🚶 {space.walk_time_mins} min</Text>
                </View>
                <Text style={styles.listPrice}>₹{space.price_per_hour}/hr</Text>
              </TouchableOpacity>
            ))}
          </View>
        )}

        <TouchableOpacity 
          style={styles.primaryButton}
          onPress={() => fetchNearbyParking(mapCenter.lat, mapCenter.lng)}
          disabled={loading}
        >
          <Text style={styles.primaryButtonText}>{loading ? 'Finding Parking...' : 'Refresh Parking'}</Text>
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
  map: {
    ...StyleSheet.absoluteFillObject,
  },
  markerContainer: {
    backgroundColor: '#FFD700',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
    borderColor: '#000',
    borderWidth: 1,
  },
  markerText: {
    fontWeight: 'bold',
    fontSize: 12,
    color: '#000',
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
  }
});
