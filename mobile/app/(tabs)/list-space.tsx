import React from 'react';
import { StyleSheet, View, Text, ScrollView, TouchableOpacity, SafeAreaView } from 'react-native';
import { useRouter } from 'expo-router';

export default function OwnerDashboard() {
  const router = useRouter();
  
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

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <Text style={styles.headerTitle}>Owner Dashboard</Text>
        
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
            <TouchableOpacity>
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
    backgroundColor: '#fff',
  },
  scrollContent: {
    padding: 20,
    paddingTop: 40,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 20,
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
  },
  addButton: {
    color: '#D4AF37',
    fontWeight: 'bold',
    fontSize: 16,
  },
  earningsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  earningCard: {
    backgroundColor: '#f8f8f8',
    padding: 15,
    borderRadius: 12,
    flex: 1,
    marginHorizontal: 5,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#eee',
  },
  earningLabel: {
    fontSize: 12,
    color: '#666',
    marginBottom: 5,
  },
  earningValue: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  listingCard: {
    backgroundColor: '#fff',
    padding: 15,
    borderRadius: 12,
    marginBottom: 15,
    borderWidth: 1,
    borderColor: '#eee',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
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
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusActive: {
    backgroundColor: '#e6ffe6',
  },
  statusPaused: {
    backgroundColor: '#ffeee6',
  },
  statusText: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#333',
  },
  listingDetails: {
    fontSize: 14,
    color: '#666',
    marginBottom: 12,
  },
  listingActions: {
    flexDirection: 'row',
    gap: 10,
  },
  actionButton: {
    backgroundColor: '#f0f0f0',
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 8,
  },
  actionButtonText: {
    fontWeight: '600',
  },
  actionButtonSecondary: {
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#ddd',
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 8,
  },
  actionButtonTextSecondary: {
    fontWeight: '600',
    color: '#555',
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
  }
});
