import React, { useState, useEffect } from 'react';
import { StyleSheet, View, Text, ScrollView, TouchableOpacity, ActivityIndicator, Image } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';

const API_BASE_URL = 'http://10.13.36.137:8000';

export default function ParkingDetailsScreen() {
  const { id } = useLocalSearchParams();
  const router = useRouter();
  
  const [parkingDetails, setParkingDetails] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDetails = async () => {
      try {
        const response = await fetch(`${API_BASE_URL}/api/parking/${id}`);
        if (response.ok) {
          const data = await response.json();
          setParkingDetails(data);
        } else {
          console.error("Failed to fetch parking details");
        }
      } catch (error) {
        console.error("Error fetching:", error);
      } finally {
        setLoading(false);
      }
    };
    
    if (id) {
      fetchDetails();
    }
  }, [id]);

  if (loading) {
    return (
      <View style={[styles.container, { justifyContent: 'center', alignItems: 'center' }]}>
        <ActivityIndicator size="large" color="#FFD700" />
      </View>
    );
  }

  if (!parkingDetails) {
    return (
      <View style={[styles.container, { justifyContent: 'center', alignItems: 'center' }]}>
        <Text style={styles.title}>Parking not found</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      {parkingDetails.images && parkingDetails.images.length > 0 ? (
        <Image 
          source={{ uri: parkingDetails.images[0] }} 
          style={styles.imagePlaceholder} 
          resizeMode="cover"
        />
      ) : (
        <View style={styles.imagePlaceholder}>
          <Text style={styles.imageText}>No Image Available</Text>
        </View>
      )}

      <View style={styles.content}>
        <Text style={styles.title}>{parkingDetails.name}</Text>
        <Text style={styles.address}>{parkingDetails.address}</Text>
        
        <View style={styles.row}>
          <Text style={styles.price}>₹{parkingDetails.price_per_hour}/hr</Text>
          <Text style={styles.rating}>⭐ {parkingDetails.rating} ({parkingDetails.total_reviews} reviews)</Text>
        </View>

        <View style={styles.divider} />

        <Text style={styles.sectionTitle}>Description</Text>
        <Text style={styles.detailText}>{parkingDetails.description}</Text>

        <View style={styles.divider} />

        <Text style={styles.sectionTitle}>Features & Amenities</Text>
        {parkingDetails.amenities && parkingDetails.amenities.map((f: string) => (
          <Text key={f} style={styles.detailText}>• {f}</Text>
        ))}

        <Text style={styles.sectionTitle} style={{marginTop: 10, fontSize: 18, fontWeight: 'bold', color: '#FFF'}}>Compatible Vehicles</Text>
        {parkingDetails.compatible_vehicles && parkingDetails.compatible_vehicles.map((v: string) => (
          <Text key={v} style={styles.detailText}>• {v}</Text>
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
    backgroundColor: '#000000',
  },
  imagePlaceholder: {
    height: 250,
    width: '100%',
    backgroundColor: '#1E1E1E',
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
    marginBottom: 5,
    color: '#FFF',
  },
  address: {
    fontSize: 14,
    color: '#AAA',
    marginBottom: 15,
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
    color: '#FFD700',
  },
  rating: {
    fontSize: 16,
    fontWeight: '500',
    color: '#FFF',
  },
  divider: {
    height: 1,
    backgroundColor: '#333',
    marginVertical: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10,
    color: '#FFF',
  },
  detailText: {
    fontSize: 16,
    color: '#AAA',
    marginBottom: 5,
    lineHeight: 22,
  },
  bookButton: {
    backgroundColor: '#FFD700',
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 20,
    marginBottom: 40,
  },
  bookButtonText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#000',
  }
});


