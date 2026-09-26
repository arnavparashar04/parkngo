import React from 'react';
import { StyleSheet, View, Text, ScrollView, TouchableOpacity } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';

export default function ParkingDetailsScreen() {
  const { id } = useLocalSearchParams();
  const router = useRouter();

  // Mock data for MVP
  const parkingDetails = {
    id,
    name: "PES University Parking",
    price_per_hour: 30,
    distance: "180m",
    rating: 4.7,
    vehicle_compatible: true,
    covered: true,
    dimensions: "SUV Compatible",
    features: ["Covered", "CCTV", "Well-lit"],
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.imagePlaceholder}>
        <Text style={styles.imageText}>Parking Image Preview</Text>
      </View>

      <View style={styles.content}>
        <Text style={styles.title}>{parkingDetails.name}</Text>
        
        <View style={styles.row}>
          <Text style={styles.price}>₹{parkingDetails.price_per_hour}/hr</Text>
          <Text style={styles.rating}>⭐ {parkingDetails.rating}</Text>
        </View>

        <Text style={styles.distance}>{parkingDetails.distance} away from destination</Text>

        <View style={styles.divider} />

        <Text style={styles.sectionTitle}>Details</Text>
        <Text style={styles.detailText}>• {parkingDetails.dimensions}</Text>
        {parkingDetails.features.map(f => (
          <Text key={f} style={styles.detailText}>• {f}</Text>
        ))}

        <View style={styles.divider} />

        <TouchableOpacity 
          style={styles.bookButton}
          onPress={() => router.push(`/booking/confirm?id=${id}`)}
        >
          <Text style={styles.bookButtonText}>Book Parking</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  imagePlaceholder: {
    height: 250,
    backgroundColor: '#eee',
    justifyContent: 'center',
    alignItems: 'center',
  },
  imageText: {
    color: '#888',
    fontSize: 16,
  },
  content: {
    padding: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  price: {
    fontSize: 20,
    fontWeight: '600',
    color: '#333',
  },
  rating: {
    fontSize: 16,
    fontWeight: '500',
  },
  distance: {
    fontSize: 16,
    color: '#666',
    marginBottom: 20,
  },
  divider: {
    height: 1,
    backgroundColor: '#ddd',
    marginVertical: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  detailText: {
    fontSize: 16,
    color: '#444',
    marginBottom: 5,
  },
  bookButton: {
    backgroundColor: '#FFD700',
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 20,
  },
  bookButtonText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#000',
  }
});
