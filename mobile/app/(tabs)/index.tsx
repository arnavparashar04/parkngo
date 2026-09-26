import React, { useState } from 'react';
import { StyleSheet, View, Text, TextInput, TouchableOpacity, SafeAreaView } from 'react-native';
import MapView, { Marker } from 'react-native-maps';
import { useRouter } from 'expo-router';

export default function HomeScreen() {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState('');
  
  // Dummy data matching our backend MVP design
  const nearbyParking = [
    {
      id: "parking_123",
      latitude: 12.9353,
      longitude: 77.5348,
      price_per_hour: 30,
      name: "PES University Parking"
    },
    {
      id: "parking_124",
      latitude: 12.9360,
      longitude: 77.5355,
      price_per_hour: 20,
      name: "Residential Parking"
    }
  ];

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
        <TouchableOpacity style={styles.primaryButton}>
          <Text style={styles.primaryButtonText}>Find Parking</Text>
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
    top: 50,
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
