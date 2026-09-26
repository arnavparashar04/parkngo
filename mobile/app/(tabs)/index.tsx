import React, { useState, useEffect } from 'react';
import { StyleSheet, View, Text, TextInput, TouchableOpacity, SafeAreaView, Platform, ActivityIndicator } from 'react-native';
import MapView, { Marker } from 'react-native-maps';
import { useRouter } from 'expo-router';

// Use 10.0.2.2 for Android emulator, localhost for iOS simulator/web
const API_BASE_URL = Platform.OS === 'android' ? 'http://10.0.2.2:8000' : 'http://localhost:8000';

export default function HomeScreen() {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState('');
  const [nearbyParking, setNearbyParking] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchNearbyParking = async () => {
    try {
      setLoading(true);
      // Hardcoded location for PES University for now
      const lat = 12.9353;
      const lng = 77.5348;
      const response = await fetch(`${API_BASE_URL}/api/parking/nearby?lat=${lat}&lng=${lng}&vehicle_type=SUV`);
      
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

  useEffect(() => {
    fetchNearbyParking();
  }, []);

  const handleMarkerPress = (id: string) => {
    router.push(`/parking/${id}`);
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Search Bar */}
      <View style={styles.searchContainer}>
        <TextInput 
          style={styles.searchInput}
          placeholder="🔍 Where are you going?"
          value={searchQuery}
          onChangeText={setSearchQuery}
        />
      </View>

      {/* Google Map */}
      <MapView 
        style={styles.map}
        initialRegion={{
          latitude: 12.9353,
          longitude: 77.5348,
          latitudeDelta: 0.01,
          longitudeDelta: 0.01,
        }}
        showsUserLocation
      >
        {nearbyParking.map(space => (
          <Marker 
            key={space.id}
            coordinate={{ latitude: space.latitude, longitude: space.longitude }}
            onPress={() => handleMarkerPress(space.id)}
          >
            <View style={styles.markerContainer}>
              <Text style={styles.markerText}>🅿️ ₹{space.price_per_hour}</Text>
            </View>
          </Marker>
        ))}
      </MapView>

      {/* Floating Find Parking Button */}
      <View style={styles.bottomContainer}>
        <TouchableOpacity 
          style={styles.primaryButton}
          onPress={fetchNearbyParking}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color="#000" />
          ) : (
            <Text style={styles.primaryButtonText}>Find Parking</Text>
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
    paddingVertical: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  searchInput: {
    fontSize: 16,
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
