import React, { useState, useEffect, useRef } from 'react';
import {
  StyleSheet,
  View,
  Text,
  TextInput,
  TouchableOpacity,
  SafeAreaView,
  Platform,
  ActivityIndicator,
  Alert,
} from 'react-native';
import MapView, { Marker, PROVIDER_GOOGLE, Callout, Region } from 'react-native-maps';
import { useRouter } from 'expo-router';
import { geocodeAddress, openGoogleMapsNavigation } from '../../services/googleMaps';

// Use 10.0.2.2 for Android emulator, localhost for iOS simulator/web
const API_BASE_URL = Platform.OS === 'android' ? 'http://10.0.2.2:8000' : 'http://localhost:8000';

const DEFAULT_REGION: Region = {
  latitude: 12.9353,
  longitude: 77.5348,
  latitudeDelta: 0.015,
  longitudeDelta: 0.015,
};

export default function HomeScreen() {
  const router = useRouter();
  const mapRef = useRef<MapView>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [nearbyParking, setNearbyParking] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [searching, setSearching] = useState(false);
  const [currentCoords, setCurrentCoords] = useState({
    latitude: DEFAULT_REGION.latitude,
    longitude: DEFAULT_REGION.longitude,
  });

  const fetchNearbyParking = async (lat = currentCoords.latitude, lng = currentCoords.longitude) => {
    try {
      setLoading(true);
      const response = await fetch(
        `${API_BASE_URL}/api/parking/nearby?lat=${lat}&lng=${lng}&vehicle_type=SUV`
      );

      if (response.ok) {
        const data = await response.json();
        setNearbyParking(data);
      } else {
        console.error('Failed to fetch parking spaces');
      }
    } catch (error) {
      console.error('Error fetching parking:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = async () => {
    if (!searchQuery.trim()) return;
    try {
      setSearching(true);
      const result = await geocodeAddress(searchQuery);
      if (result) {
        const newCoords = { latitude: result.latitude, longitude: result.longitude };
        setCurrentCoords(newCoords);
        mapRef.current?.animateToRegion(
          {
            ...newCoords,
            latitudeDelta: 0.015,
            longitudeDelta: 0.015,
          },
          1000
        );
        await fetchNearbyParking(result.latitude, result.longitude);
      } else {
        Alert.alert('Location not found', 'Could not locate the requested address. Please try another search.');
      }
    } catch (error) {
      console.error('Error during address search:', error);
    } finally {
      setSearching(false);
    }
  };

  useEffect(() => {
    fetchNearbyParking();
  }, []);

  const handleMarkerPress = (id: string) => {
    router.push(`/parking/${id}`);
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Search Bar with Google Geocoding */}
      <View style={styles.searchContainer}>
        <TextInput
          style={styles.searchInput}
          placeholder="🔍 Where are you going?"
          value={searchQuery}
          onChangeText={setSearchQuery}
          returnKeyType="search"
          onSubmitEditing={handleSearch}
        />
        {searching && <ActivityIndicator size="small" color="#000" style={styles.searchSpinner} />}
        {searchQuery.length > 0 && !searching && (
          <TouchableOpacity onPress={handleSearch} style={styles.searchButton}>
            <Text style={styles.searchButtonText}>Go</Text>
          </TouchableOpacity>
        )}
      </View>

      {/* Google Map */}
      <MapView
        ref={mapRef}
        provider={Platform.OS === 'android' || Platform.OS === 'ios' ? PROVIDER_GOOGLE : undefined}
        style={styles.map}
        initialRegion={DEFAULT_REGION}
        showsUserLocation
        showsMyLocationButton
        showsCompass
        onRegionChangeComplete={(region) => {
          setCurrentCoords({ latitude: region.latitude, longitude: region.longitude });
        }}
      >
        {nearbyParking.map((space) => (
          <Marker
            key={space.id}
            coordinate={{ latitude: space.latitude, longitude: space.longitude }}
          >
            <View style={styles.markerContainer}>
              <Text style={styles.markerText}>🅿️ ₹{space.price_per_hour}</Text>
            </View>
            <Callout onPress={() => handleMarkerPress(space.id)}>
              <View style={styles.calloutContainer}>
                <Text style={styles.calloutTitle}>{space.name}</Text>
                <Text style={styles.calloutPrice}>₹{space.price_per_hour}/hr • ⭐ {space.rating}</Text>
                <Text style={styles.calloutAction}>Tap to view & book ➔</Text>
              </View>
            </Callout>
          </Marker>
        ))}
      </MapView>

      {/* Floating Find Parking Button */}
      <View style={styles.bottomContainer}>
        <TouchableOpacity
          style={styles.primaryButton}
          onPress={() => fetchNearbyParking()}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color="#000" />
          ) : (
            <Text style={styles.primaryButtonText}>Find Parking Here</Text>
          )}
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  searchContainer: {
    position: 'absolute',
    top: 15,
    left: 20,
    right: 20,
    zIndex: 1,
    backgroundColor: 'white',
    borderRadius: 8,
    paddingHorizontal: 15,
    paddingVertical: 8,
    flexDirection: 'row',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    paddingVertical: 6,
  },
  searchSpinner: {
    marginLeft: 8,
  },
  searchButton: {
    backgroundColor: '#FFD700',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
    marginLeft: 8,
  },
  searchButtonText: {
    fontWeight: 'bold',
    fontSize: 14,
    color: '#000',
  },
  calloutContainer: {
    padding: 8,
    minWidth: 150,
  },
  calloutTitle: {
    fontWeight: 'bold',
    fontSize: 14,
    marginBottom: 4,
  },
  calloutPrice: {
    fontSize: 12,
    color: '#444',
    marginBottom: 4,
  },
  calloutAction: {
    fontSize: 12,
    fontWeight: '600',
    color: '#0066cc',
  },
  map: {
    width: '100%',
    height: '100%',
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
  }
});
