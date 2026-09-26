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
    backgroundColor: '#000000',
  },
  scrollContent: {
    padding: 20,
    paddingTop: 40,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 20,
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
  }
});
