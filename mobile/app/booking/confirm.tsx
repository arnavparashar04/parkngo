import React, { useState } from 'react';
import { StyleSheet, View, Text, TouchableOpacity } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';

export default function BookingConfirmScreen() {
  const { id } = useLocalSearchParams();
  const router = useRouter();
  const [confirmed, setConfirmed] = useState(false);

  if (confirmed) {
    return (
      <View style={styles.container}>
        <View style={styles.passCard}>
          <Text style={styles.passTitle}>PARKNGO PASS</Text>
          
          <View style={styles.qrPlaceholder}>
            <Text style={{ color: '#888' }}>QR CODE</Text>
          </View>
          
          <View style={styles.passDetails}>
            <Text style={styles.detailText}>Booking: #PNGO1024</Text>
            <Text style={styles.detailText}>Vehicle: KA XX XXXX</Text>
            <Text style={styles.detailText}>4:00 PM - 6:00 PM</Text>
          </View>
        </View>
        <TouchableOpacity 
          style={styles.doneButton}
          onPress={() => router.navigate('/(tabs)')}
        >
          <Text style={styles.doneButtonText}>Done</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.summaryTitle}>Booking Summary</Text>
      
      <View style={styles.summaryBox}>
        <Text style={styles.summaryText}>Parking duration: 2 hours</Text>
        <Text style={styles.summaryText}>Price: ₹40/hour</Text>
        <View style={styles.divider} />
        <Text style={styles.totalText}>Total: ₹80</Text>
      </View>

      <TouchableOpacity 
        style={styles.confirmButton}
        onPress={() => setConfirmed(true)}
      >
        <Text style={styles.confirmButtonText}>Confirm Booking</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#121212',
  },
  summaryTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 20,
    color: '#FFF',
  },
  summaryBox: {
    padding: 20,
    backgroundColor: '#1E1E1E',
    borderRadius: 12,
    marginBottom: 30,
  },
  summaryText: {
    fontSize: 16,
    marginBottom: 10,
    color: '#AAA',
  },
  divider: {
    height: 1,
    backgroundColor: '#333',
    marginVertical: 15,
  },
  totalText: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#FFD700',
  },
  confirmButton: {
    backgroundColor: '#FFD700',
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  confirmButtonText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#000',
  },
  passCard: {
    backgroundColor: '#1E1E1E',
    borderRadius: 16,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.5,
    shadowRadius: 8,
    elevation: 5,
    alignItems: 'center',
    marginVertical: 40,
    borderWidth: 1,
    borderColor: '#333',
  },
  passTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 20,
    letterSpacing: 2,
    color: '#FFD700',
  },
  qrPlaceholder: {
    width: 200,
    height: 200,
    backgroundColor: '#333',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 30,
    borderWidth: 2,
    borderStyle: 'dashed',
    borderColor: '#555',
  },
  passDetails: {
    width: '100%',
    alignItems: 'flex-start',
  },
  detailText: {
    fontSize: 16,
    marginBottom: 8,
    color: '#FFF',
    fontWeight: '500',
  },
  doneButton: {
    backgroundColor: '#FFD700',
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  doneButtonText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#000',
  }
});
