import React, { useState, useEffect } from 'react';
import { StyleSheet, View, Text, TextInput, TouchableOpacity, SafeAreaView, Platform, ActivityIndicator } from 'react-native';
import MapView, { Marker, PROVIDER_GOOGLE } from 'react-native-maps';
import { useRouter } from 'expo-router';
import ShimmerPlaceholder from '../../components/ShimmerPlaceholder';

// Use computer's local IP address so it works on emulators and physical devices
const API_BASE_URL = 'http://10.57.179.137:8000';

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
          placeholderTextColor="#888"
          value={searchQuery}
          onChangeText={setSearchQuery}
        />
      </View>

      {/* Google Map */}
      <MapView 
        style={styles.map}
        provider={Platform.OS === 'ios' ? PROVIDER_GOOGLE : undefined}
        customMapStyle={[
          {
            "elementType": "geometry",
            "stylers": [
              {
                "color": "#212121"
              }
            ]
          },
          {
            "elementType": "labels.icon",
            "stylers": [
              {
                "visibility": "off"
              }
            ]
          },
          {
            "elementType": "labels.text.fill",
            "stylers": [
              {
                "color": "#757575"
              }
            ]
          },
          {
            "elementType": "labels.text.stroke",
            "stylers": [
              {
                "color": "#212121"
              }
            ]
          },
          {
            "featureType": "administrative",
            "elementType": "geometry",
            "stylers": [
              {
                "color": "#757575"
              }
            ]
          },
          {
            "featureType": "administrative.country",
            "elementType": "labels.text.fill",
            "stylers": [
              {
                "color": "#9e9e9e"
              }
            ]
          },
          {
            "featureType": "administrative.land_parcel",
            "stylers": [
              {
                "visibility": "off"
              }
            ]
          },
          {
            "featureType": "administrative.locality",
            "elementType": "labels.text.fill",
            "stylers": [
              {
                "color": "#bdbdbd"
              }
            ]
          },
          {
            "featureType": "poi",
            "elementType": "labels.text.fill",
            "stylers": [
              {
                "color": "#757575"
              }
            ]
          },
          {
            "featureType": "poi.park",
            "elementType": "geometry",
            "stylers": [
              {
                "color": "#181818"
              }
            ]
          },
          {
            "featureType": "poi.park",
            "elementType": "labels.text.fill",
            "stylers": [
              {
                "color": "#616161"
              }
            ]
          },
          {
            "featureType": "poi.park",
            "elementType": "labels.text.stroke",
            "stylers": [
              {
                "color": "#1b1b1b"
              }
            ]
          },
          {
            "featureType": "road",
            "elementType": "geometry.fill",
            "stylers": [
              {
                "color": "#2c2c2c"
              }
            ]
          },
          {
            "featureType": "road",
            "elementType": "labels.text.fill",
            "stylers": [
              {
                "color": "#8a8a8a"
              }
            ]
          },
          {
            "featureType": "road.arterial",
            "elementType": "geometry",
            "stylers": [
              {
                "color": "#373737"
              }
            ]
          },
          {
            "featureType": "road.highway",
            "elementType": "geometry",
            "stylers": [
              {
                "color": "#3c3c3c"
              }
            ]
          },
          {
            "featureType": "road.highway.controlled_access",
            "elementType": "geometry",
            "stylers": [
              {
                "color": "#4e4e4e"
              }
            ]
          },
          {
            "featureType": "road.local",
            "elementType": "labels.text.fill",
            "stylers": [
              {
                "color": "#616161"
              }
            ]
          },
          {
            "featureType": "transit",
            "elementType": "labels.text.fill",
            "stylers": [
              {
                "color": "#757575"
              }
            ]
          },
          {
            "featureType": "water",
            "elementType": "geometry",
            "stylers": [
              {
                "color": "#000000"
              }
            ]
          },
          {
            "featureType": "water",
            "elementType": "labels.text.fill",
            "stylers": [
              {
                "color": "#3d3d3d"
              }
            ]
          }
        ]}
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
            <Text style={styles.listTitle}>Recommended Spots</Text>
            {nearbyParking.map(space => (
              <TouchableOpacity key={space.id} style={styles.listItem} onPress={() => handleMarkerPress(space.id)}>
                <View>
                  <Text style={styles.listName}>{space.name}</Text>
                  <Text style={styles.listDetails}>Score: {space.recommendation_score} • {space.distance}m</Text>
                </View>
                <Text style={styles.listPrice}>₹{space.price_per_hour}/hr</Text>
              </TouchableOpacity>
            ))}
          </View>
        )}

        <TouchableOpacity 
          style={styles.primaryButton}
          onPress={fetchNearbyParking}
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
  listTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 10,
    color: '#FFF',
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
