import React, { useState } from 'react';
import { StyleSheet, View, Text, TouchableOpacity, ActivityIndicator } from 'react-native';
import { useRouter } from 'expo-router';

export default function VerifyQRScreen() {
  const router = useRouter();
  const [scanning, setScanning] = useState(true);
  const [result, setResult] = useState<string | null>(null);

  // Mock QR scan after 1.5 seconds
  React.useEffect(() => {
    if (scanning) {
      const timer = setTimeout(() => {
        setScanning(false);
        setResult('valid');
      }, 1500);
      return () => clearTimeout(timer);
    }
  }, [scanning]);

  return (
    <View style={styles.container}>
      {scanning ? (
        <View style={styles.scanContainer}>
          <View style={styles.cameraBox}>
            <ActivityIndicator size="large" color="#FFD700" />
            <Text style={styles.scanText}>Scanning QR Code...</Text>
          </View>
        </View>
      ) : (
        <View style={styles.resultContainer}>
          {result === 'valid' ? (
            <View style={styles.validBox}>
              <Text style={styles.validTitle}>✓ Valid Parking Pass</Text>
              <View style={styles.divider} />
              <Text style={styles.detailText}>Vehicle: KA XX XXXX</Text>
              <Text style={styles.detailText}>Booking: #PNGO1024</Text>
              <Text style={styles.detailText}>Valid until: 6:00 PM</Text>
            </View>
          ) : (
            <View style={styles.invalidBox}>
              <Text style={styles.invalidTitle}>✕ Invalid or Expired Pass</Text>
            </View>
          )}

          <TouchableOpacity 
            style={styles.doneButton}
            onPress={() => router.back()}
          >
            <Text style={styles.doneButtonText}>Done</Text>
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
  },
  scanContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  cameraBox: {
    width: 250,
    height: 250,
    borderWidth: 2,
    borderColor: '#FFD700',
    borderStyle: 'dashed',
    justifyContent: 'center',
    alignItems: 'center',
  },
  scanText: {
    color: '#fff',
    marginTop: 20,
    fontSize: 16,
  },
  resultContainer: {
    flex: 1,
    backgroundColor: '#fff',
    padding: 20,
    justifyContent: 'center',
  },
  validBox: {
    backgroundColor: '#e6ffe6',
    padding: 20,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#b3ffb3',
    marginBottom: 40,
  },
  validTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#006600',
    marginBottom: 15,
  },
  invalidBox: {
    backgroundColor: '#ffe6e6',
    padding: 20,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#ffb3b3',
    marginBottom: 40,
  },
  invalidTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#cc0000',
  },
  divider: {
    height: 1,
    backgroundColor: '#ccc',
    marginVertical: 15,
  },
  detailText: {
    fontSize: 16,
    marginBottom: 10,
    color: '#333',
  },
  doneButton: {
    backgroundColor: '#333',
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  doneButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  }
});
