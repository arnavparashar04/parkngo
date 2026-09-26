import React from 'react';
import { StyleSheet, View, Text, ScrollView, TouchableOpacity, SafeAreaView, Switch } from 'react-native';

export default function ProfileScreen() {
  // Mock data for user profile
  const user = {
    name: 'Arnav Parashar',
    email: 'arnav@example.com',
    phone: '+91 98765 43210',
    vehicles: [
      { id: '1', model: 'Honda City (Sedan)', reg: 'KA 01 AB 1234' },
      { id: '2', model: 'Royal Enfield (Bike)', reg: 'KA 05 CD 5678' }
    ]
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        
        {/* Header section */}
        <View style={styles.header}>
          <View style={styles.avatarPlaceholder}>
            <Text style={styles.avatarText}>{user.name.charAt(0)}</Text>
          </View>
          <View style={styles.userInfo}>
            <Text style={styles.userName}>{user.name}</Text>
            <Text style={styles.userEmail}>{user.email}</Text>
            <Text style={styles.userPhone}>{user.phone}</Text>
          </View>
        </View>

        {/* Vehicles Section */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>My Vehicles</Text>
            <TouchableOpacity>
              <Text style={styles.addButton}>+ Add</Text>
            </TouchableOpacity>
          </View>
          {user.vehicles.map(vehicle => (
            <View key={vehicle.id} style={styles.vehicleCard}>
              <Text style={styles.vehicleModel}>{vehicle.model}</Text>
              <Text style={styles.vehicleReg}>{vehicle.reg}</Text>
            </View>
          ))}
        </View>

        {/* Settings Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Settings</Text>
          
          <TouchableOpacity style={styles.settingRow}>
            <Text style={styles.settingLabel}>Appearance (Light/Dark)</Text>
            <Text style={styles.settingValue}>System {'>'}</Text>
          </TouchableOpacity>
          <View style={styles.divider} />
          
          <View style={styles.settingRow}>
            <Text style={styles.settingLabel}>Push Notifications</Text>
            <Switch 
              value={true} 
              onValueChange={() => {}} 
              trackColor={{ false: '#767577', true: '#FFD700' }}
              thumbColor={true ? '#FFF' : '#f4f3f4'}
            />
          </View>
          <View style={styles.divider} />
          
          <TouchableOpacity style={styles.settingRow}>
            <Text style={styles.settingLabel}>Saved Parking</Text>
            <Text style={styles.settingValue}>{'>'}</Text>
          </TouchableOpacity>
          <View style={styles.divider} />

          <TouchableOpacity style={styles.settingRow}>
            <Text style={styles.settingLabel}>Booking History</Text>
            <Text style={styles.settingValue}>{'>'}</Text>
          </TouchableOpacity>
        </View>

        {/* Account Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Account</Text>
          <TouchableOpacity style={styles.actionRow}>
            <Text style={styles.actionText}>Edit Profile</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.actionRow}>
            <Text style={styles.actionText}>Change Password</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.actionRow}>
            <Text style={[styles.actionText, { color: 'red' }]}>Log Out</Text>
          </TouchableOpacity>
        </View>

      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#121212',
  },
  scrollContent: {
    padding: 20,
    paddingTop: 40,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 40,
  },
  avatarPlaceholder: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#FFD700',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 20,
  },
  avatarText: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#000',
  },
  userInfo: {
    flex: 1,
  },
  userName: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 5,
    color: '#FFF',
  },
  userEmail: {
    fontSize: 16,
    color: '#AAA',
    marginBottom: 2,
  },
  userPhone: {
    fontSize: 16,
    color: '#888',
  },
  section: {
    marginBottom: 35,
    backgroundColor: '#1E1E1E',
    borderRadius: 12,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.5,
    shadowRadius: 4,
    elevation: 2,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 15,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#FFF',
    marginBottom: 10,
  },
  addButton: {
    color: '#FFD700',
    fontWeight: 'bold',
    fontSize: 16,
  },
  vehicleCard: {
    backgroundColor: '#222',
    padding: 15,
    borderRadius: 8,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: '#333',
  },
  vehicleModel: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 4,
    color: '#FFF',
  },
  vehicleReg: {
    fontSize: 14,
    color: '#AAA',
  },
  settingRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
  },
  settingLabel: {
    fontSize: 16,
    color: '#FFF',
  },
  settingValue: {
    fontSize: 16,
    color: '#888',
  },
  divider: {
    height: 1,
    backgroundColor: '#333',
  },
  actionRow: {
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#333',
  },
  actionText: {
    fontSize: 16,
    color: '#FFF',
    fontWeight: '500',
  }
});
