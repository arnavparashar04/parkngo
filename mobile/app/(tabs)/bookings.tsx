import React, { useState } from 'react';
import { StyleSheet, View, Text, ScrollView, TouchableOpacity, SafeAreaView } from 'react-native';

export default function BookingsScreen() {
  const [activeTab, setActiveTab] = useState<'Upcoming' | 'Completed' | 'Cancelled'>('Upcoming');

  // Mock Data
  const bookings = [
    {
      id: '1',
      parkingName: 'PES University Parking',
      date: 'Today',
      time: '4:00 PM - 6:00 PM',
      vehicle: 'KA XX XXXX',
      amount: '₹80',
      status: 'Upcoming'
    },
    {
      id: '2',
      parkingName: 'Forum Mall Parking',
      date: 'Yesterday',
      time: '12:00 PM - 3:00 PM',
      vehicle: 'KA XX XXXX',
      amount: '₹150',
      status: 'Completed'
    },
    {
      id: '3',
      parkingName: 'Residential Parking',
      date: '22 Sep 2026',
      time: '9:00 AM - 10:00 AM',
      vehicle: 'KA 05 CD 5678',
      amount: '₹20',
      status: 'Cancelled'
    }
  ];

  const filteredBookings = bookings.filter(b => b.status === activeTab);

  return (
    <SafeAreaView style={styles.container}>
      {/* Tabs */}
      <View style={styles.tabsContainer}>
        {['Upcoming', 'Completed', 'Cancelled'].map(tab => (
          <TouchableOpacity 
            key={tab} 
            style={[styles.tab, activeTab === tab && styles.activeTab]}
            onPress={() => setActiveTab(tab as any)}
          >
            <Text style={[styles.tabText, activeTab === tab && styles.activeTabText]}>{tab}</Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* List */}
      <ScrollView contentContainerStyle={styles.listContainer}>
        {filteredBookings.length === 0 ? (
          <Text style={styles.emptyText}>No {activeTab.toLowerCase()} bookings.</Text>
        ) : (
          filteredBookings.map(booking => (
            <View key={booking.id} style={styles.bookingCard}>
              <View style={styles.cardHeader}>
                <Text style={styles.parkingName}>{booking.parkingName}</Text>
                <Text style={styles.amount}>{booking.amount}</Text>
              </View>
              <View style={styles.divider} />
              <Text style={styles.detailText}>📅 {booking.date} • {booking.time}</Text>
              <Text style={styles.detailText}>🚗 {booking.vehicle}</Text>
              
              {activeTab === 'Upcoming' && (
                <View style={styles.actionRow}>
                  <TouchableOpacity style={styles.primaryButton}>
                    <Text style={styles.primaryButtonText}>View Pass</Text>
                  </TouchableOpacity>
                  <TouchableOpacity style={styles.secondaryButton}>
                    <Text style={styles.secondaryButtonText}>Get Directions</Text>
                  </TouchableOpacity>
                </View>
              )}
            </View>
          ))
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#121212',
  },
  header: {
    padding: 20,
    paddingTop: 40,
    backgroundColor: '#1E1E1E',
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#FFF',
  },
  tabsContainer: {
    flexDirection: 'row',
    backgroundColor: '#1E1E1E',
    borderBottomWidth: 1,
    borderBottomColor: '#333',
  },
  tab: {
    flex: 1,
    paddingVertical: 15,
    alignItems: 'center',
    borderBottomWidth: 3,
    borderBottomColor: 'transparent',
  },
  activeTab: {
    borderBottomColor: '#FFD700',
  },
  tabText: {
    fontSize: 16,
    color: '#AAA',
    fontWeight: '500',
  },
  activeTabText: {
    color: '#FFD700',
    fontWeight: 'bold',
  },
  listContainer: {
    padding: 20,
  },
  emptyText: {
    textAlign: 'center',
    color: '#888',
    marginTop: 40,
    fontSize: 16,
  },
  bookingCard: {
    backgroundColor: '#1E1E1E',
    padding: 20,
    borderRadius: 12,
    marginBottom: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.5,
    shadowRadius: 4,
    elevation: 2,
    borderWidth: 1,
    borderColor: '#333',
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 15,
  },
  parkingName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#FFF',
    flex: 1,
  },
  amount: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#FFD700',
  },
  divider: {
    height: 1,
    backgroundColor: '#333',
    marginBottom: 15,
  },
  detailText: {
    fontSize: 15,
    color: '#AAA',
    marginBottom: 8,
  },
  actionRow: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 15,
  },
  primaryButton: {
    flex: 1,
    backgroundColor: '#FFD700',
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  primaryButtonText: {
    fontWeight: 'bold',
    color: '#000',
  },
  secondaryButton: {
    flex: 1,
    backgroundColor: '#333',
    borderWidth: 1,
    borderColor: '#555',
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  secondaryButtonText: {
    fontWeight: 'bold',
    color: '#FFF',
  }
});
