import { SafeAreaView } from 'react-native-safe-area-context';
import React, { useState } from 'react';
import { StyleSheet, View, Text, ScrollView, TouchableOpacity, TextInput, Image, ActivityIndicator, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import * as ImagePicker from 'expo-image-picker';

const API_BASE_URL = 'http://10.13.36.137:8000';

export default function OwnerDashboard() {
  const router = useRouter();
  const [showAddForm, setShowAddForm] = useState(false);
  
  // Add form state
  const [name, setName] = useState('');
  const [address, setAddress] = useState('');
  const [description, setDescription] = useState('');
  const [price, setPrice] = useState('');
  const [spots, setSpots] = useState('');
  const [latitude, setLatitude] = useState('');
  const [longitude, setLongitude] = useState('');
  const [images, setImages] = useState<string[]>([]);
  const [saving, setSaving] = useState(false);

  // Mock data for Owner Dashboard
  const earnings = {
    today: 240,
    week: 1240,
    month: 4850
  };

  const listings = [
    {
      id: '1',
      name: 'PES University Parking',
      status: 'Active',
      price: 30,
      bookings_today: 2,
    },
    {
      id: '2',
      name: 'Residential Parking (Backup)',
      status: 'Paused',
      price: 20,
      bookings_today: 0,
    }
  ];

  const pickImageFromCamera = async () => {
    const { status } = await ImagePicker.requestCameraPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Camera permission is required');
      return;
    }
    const result = await ImagePicker.launchCameraAsync({
      allowsEditing: true,
      aspect: [16, 9],
      quality: 0.6,
    });
    if (!result.canceled) {
      setImages([...images, result.assets[0].uri]);
    }
  };

  const pickImageFromGallery = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Gallery permission is required');
      return;
    }
    const result = await ImagePicker.launchImageLibraryAsync({
      allowsMultipleSelection: true,
      mediaTypes: ['images'],
      quality: 0.6,
    });
    if (!result.canceled) {
      setImages([...images, ...result.assets.map(a => a.uri)]);
    }
  };

  const handlePublish = async () => {
    if (!name || !address || !price || !spots || !latitude || !longitude) {
      Alert.alert('Missing Fields', 'Please fill out all required fields.');
      return;
    }
    setSaving(true);
    try {
      const response = await fetch(`${API_BASE_URL}/api/parking/`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          owner_id: 'owner_demo',
          name,
          description: description || 'Parking space available.',
          address,
          latitude: parseFloat(latitude),
          longitude: parseFloat(longitude),
          price_per_hour: parseFloat(price),
          daily_max_price: parseFloat(price) * 8,
          total_spots: parseInt(spots),
          compatible_vehicles: ['Bike', 'Scooter', 'Sedan', 'Hatchback', 'SUV'],
          amenities: ['CCTV'],
          images: images.length > 0 ? images : [
            'https://images.unsplash.com/photo-1590674899484-d5640e854abe?auto=format&fit=crop&w=800&q=80'
          ],
        }),
      });
      if (response.ok) {
        Alert.alert('Success!', 'Your parking spot has been listed.');
        setShowAddForm(false);
        setName(''); setAddress(''); setDescription(''); setPrice('');
        setSpots(''); setLatitude(''); setLongitude(''); setImages([]);
      } else {
        Alert.alert('Error', 'Failed to create listing.');
      }
    } catch (error) {
      console.error(error);
      Alert.alert('Error', 'Could not connect to server.');
    } finally {
      setSaving(false);
    }
  };

  if (showAddForm) {
    return (
      <SafeAreaView style={styles.container}>
        <ScrollView contentContainerStyle={styles.scrollContent}>
          <View style={styles.formHeader}>
            <TouchableOpacity onPress={() => setShowAddForm(false)}>
              <Text style={styles.backButton}>← Back</Text>
            </TouchableOpacity>
            <Text style={styles.headerTitle}>Add Parking Spot</Text>
          </View>

          {/* Image Upload */}
          <Text style={styles.label}>Photos</Text>
          <ScrollView horizontal style={{ marginBottom: 15 }}>
            {images.map((uri, i) => (
              <Image key={i} source={{ uri }} style={styles.thumbnail} />
            ))}
            <TouchableOpacity style={styles.addImageBtn} onPress={pickImageFromCamera}>
              <Text style={styles.addImageText}>📸</Text>
              <Text style={styles.addImageLabel}>Camera</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.addImageBtn} onPress={pickImageFromGallery}>
              <Text style={styles.addImageText}>🖼️</Text>
              <Text style={styles.addImageLabel}>Gallery</Text>
            </TouchableOpacity>
          </ScrollView>

          <Text style={styles.label}>Name *</Text>
          <TextInput style={styles.input} placeholder="e.g. My Driveway" placeholderTextColor="#666"
            value={name} onChangeText={setName} />

          <Text style={styles.label}>Address *</Text>
          <TextInput style={styles.input} placeholder="Full address" placeholderTextColor="#666"
            value={address} onChangeText={setAddress} />

          <Text style={styles.label}>Description</Text>
          <TextInput style={[styles.input, { height: 80 }]} placeholder="Describe your spot..." placeholderTextColor="#666"
            value={description} onChangeText={setDescription} multiline />

          <View style={styles.row}>
            <View style={{ flex: 1, marginRight: 8 }}>
              <Text style={styles.label}>Price (₹/hr) *</Text>
              <TextInput style={styles.input} placeholder="40" placeholderTextColor="#666"
                keyboardType="numeric" value={price} onChangeText={setPrice} />
            </View>
            <View style={{ flex: 1, marginLeft: 8 }}>
              <Text style={styles.label}>Total Spots *</Text>
              <TextInput style={styles.input} placeholder="2" placeholderTextColor="#666"
                keyboardType="numeric" value={spots} onChangeText={setSpots} />
            </View>
          </View>

          <View style={styles.row}>
            <View style={{ flex: 1, marginRight: 8 }}>
              <Text style={styles.label}>Latitude *</Text>
              <TextInput style={styles.input} placeholder="12.9353" placeholderTextColor="#666"
                keyboardType="decimal-pad" value={latitude} onChangeText={setLatitude} />
            </View>
            <View style={{ flex: 1, marginLeft: 8 }}>
              <Text style={styles.label}>Longitude *</Text>
              <TextInput style={styles.input} placeholder="77.5348" placeholderTextColor="#666"
                keyboardType="decimal-pad" value={longitude} onChangeText={setLongitude} />
            </View>
          </View>

          <TouchableOpacity style={styles.publishButton} onPress={handlePublish} disabled={saving}>
            {saving ? (
              <ActivityIndicator color="#000" />
            ) : (
              <Text style={styles.publishButtonText}>Publish Listing</Text>
            )}
          </TouchableOpacity>
        </ScrollView>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        
        {/* Earnings Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Earnings</Text>
          <View style={styles.earningsRow}>
            <View style={styles.earningCard}>
              <Text style={styles.earningLabel}>Today</Text>
              <Text style={styles.earningValue}>₹{earnings.today}</Text>
            </View>
            <View style={styles.earningCard}>
              <Text style={styles.earningLabel}>This Week</Text>
              <Text style={styles.earningValue}>₹{earnings.week}</Text>
            </View>
            <View style={styles.earningCard}>
              <Text style={styles.earningLabel}>This Month</Text>
              <Text style={styles.earningValue}>₹{earnings.month}</Text>
            </View>
          </View>
        </View>

        {/* Listings Section */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>My Listings</Text>
            <TouchableOpacity onPress={() => setShowAddForm(true)}>
              <Text style={styles.addButton}>+ Add Space</Text>
            </TouchableOpacity>
          </View>

          {listings.map(listing => (
            <View key={listing.id} style={styles.listingCard}>
              <View style={styles.listingHeader}>
                <Text style={styles.listingName}>{listing.name}</Text>
                <View style={[styles.statusBadge, listing.status === 'Active' ? styles.statusActive : styles.statusPaused]}>
                  <Text style={styles.statusText}>{listing.status}</Text>
                </View>
              </View>
              <Text style={styles.listingDetails}>₹{listing.price}/hr • {listing.bookings_today} bookings today</Text>
              <View style={styles.listingActions}>
                <TouchableOpacity style={styles.actionButton}>
                  <Text style={styles.actionButtonText}>Edit</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.actionButtonSecondary}>
                  <Text style={styles.actionButtonTextSecondary}>
                    {listing.status === 'Active' ? 'Pause' : 'Resume'}
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
          ))}
        </View>

        {/* Verify QR Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Verify Driver</Text>
          <TouchableOpacity 
            style={styles.qrButton}
            onPress={() => router.push('/owner/verify')}
          >
            <Text style={styles.qrButtonText}>📷 Scan QR Pass</Text>
          </TouchableOpacity>
        </View>
        
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000000',
  },
  scrollContent: {
    padding: 20,
    paddingTop: 10,
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#FFF',
  },
  section: {
    marginBottom: 30,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 15,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 15,
    color: '#FFF',
  },
  addButton: {
    color: '#FFD700',
    fontWeight: 'bold',
    fontSize: 16,
  },
  earningsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  earningCard: {
    backgroundColor: '#1E1E1E',
    padding: 15,
    borderRadius: 12,
    flex: 1,
    marginHorizontal: 5,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#333',
  },
  earningLabel: {
    fontSize: 12,
    color: '#AAA',
    marginBottom: 5,
  },
  earningValue: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#FFD700',
  },
  listingCard: {
    backgroundColor: '#1E1E1E',
    padding: 15,
    borderRadius: 12,
    marginBottom: 15,
    borderWidth: 1,
    borderColor: '#333',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.5,
    shadowRadius: 4,
    elevation: 2,
  },
  listingHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  listingName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFF',
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusActive: {
    backgroundColor: '#2A4B2A',
  },
  statusPaused: {
    backgroundColor: '#4B2A2A',
  },
  statusText: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#FFF',
  },
  listingDetails: {
    fontSize: 14,
    color: '#AAA',
    marginBottom: 12,
  },
  listingActions: {
    flexDirection: 'row',
    gap: 10,
  },
  actionButton: {
    backgroundColor: '#FFD700',
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 8,
  },
  actionButtonText: {
    fontWeight: '600',
    color: '#000',
  },
  actionButtonSecondary: {
    backgroundColor: '#333',
    borderWidth: 1,
    borderColor: '#555',
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 8,
  },
  actionButtonTextSecondary: {
    fontWeight: '600',
    color: '#FFF',
  },
  qrButton: {
    backgroundColor: '#FFD700',
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  qrButtonText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#000',
  },
  // ── Add form styles ──
  formHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 15,
    marginBottom: 20,
  },
  backButton: {
    color: '#3b82f6',
    fontSize: 16,
    fontWeight: '600',
  },
  label: {
    color: '#FFF',
    fontSize: 14,
    fontWeight: '500',
    marginBottom: 6,
    marginTop: 10,
  },
  input: {
    backgroundColor: '#1E1E1E',
    borderWidth: 1,
    borderColor: '#333',
    borderRadius: 8,
    padding: 14,
    color: '#FFF',
    fontSize: 16,
  },
  row: {
    flexDirection: 'row',
  },
  thumbnail: {
    width: 80,
    height: 80,
    borderRadius: 8,
    marginRight: 10,
  },
  addImageBtn: {
    width: 80,
    height: 80,
    backgroundColor: '#1E1E1E',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#333',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 10,
  },
  addImageText: {
    fontSize: 24,
  },
  addImageLabel: {
    color: '#AAA',
    fontSize: 10,
    marginTop: 2,
  },
  publishButton: {
    backgroundColor: '#FFD700',
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 25,
    marginBottom: 40,
  },
  publishButtonText: {
    color: '#000',
    fontSize: 18,
    fontWeight: 'bold',
  },
});
