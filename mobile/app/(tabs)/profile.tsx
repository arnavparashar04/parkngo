import { SafeAreaView } from 'react-native-safe-area-context';
import React, { useState, useEffect } from 'react';
import { StyleSheet, View, Text, ScrollView, TouchableOpacity, Switch, TextInput, Alert, ActivityIndicator } from 'react-native';

const API_BASE_URL = 'http://10.13.36.137:8000';
const USER_ID = 'user_arnav'; // Local demo user ID

export default function ProfileScreen() {
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  
  // Edit profile state
  const [editing, setEditing] = useState(false);
  const [editName, setEditName] = useState('');
  const [editEmail, setEditEmail] = useState('');
  const [editPhone, setEditPhone] = useState('');
  
  // Add vehicle state
  const [showAddVehicle, setShowAddVehicle] = useState(false);
  const [vMake, setVMake] = useState('');
  const [vModel, setVModel] = useState('');
  const [vPlate, setVPlate] = useState('');
  const [vType, setVType] = useState('Sedan');
  const vehicleTypes = ['Bike', 'Scooter', 'Hatchback', 'Sedan', 'SUV'];

  const fetchProfile = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/user/${USER_ID}`);
      if (response.ok) {
        const data = await response.json();
        setUser(data);
        setEditName(data.full_name);
        setEditEmail(data.email);
        setEditPhone(data.phone_number || '');
      }
    } catch (error) {
      console.error('Error fetching profile:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProfile();
  }, []);

  const handleSaveProfile = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/user/`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: editEmail,
          full_name: editName,
          phone_number: editPhone,
          role: 'both',
        }),
      });
      if (response.ok) {
        Alert.alert('Profile Updated!');
        setEditing(false);
        fetchProfile();
      }
    } catch (error) {
      Alert.alert('Error', 'Could not update profile.');
    }
  };

  const handleAddVehicle = async () => {
    if (!vMake || !vModel || !vPlate) {
      Alert.alert('Fill all fields');
      return;
    }
    try {
      const response = await fetch(`${API_BASE_URL}/api/user/${USER_ID}/vehicles`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          make: vMake,
          model: vModel,
          license_plate: vPlate,
          vehicle_type: vType,
          is_default: false,
        }),
      });
      if (response.ok) {
        Alert.alert('Vehicle Added!');
        setShowAddVehicle(false);
        setVMake(''); setVModel(''); setVPlate('');
        fetchProfile();
      }
    } catch (error) {
      Alert.alert('Error', 'Could not add vehicle.');
    }
  };

  const handleDeleteVehicle = async (vehicleId: string) => {
    try {
      await fetch(`${API_BASE_URL}/api/user/${USER_ID}/vehicles/${vehicleId}`, {
        method: 'DELETE',
      });
      fetchProfile();
    } catch (error) {
      Alert.alert('Error', 'Could not delete vehicle.');
    }
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
          <ActivityIndicator size="large" color="#FFD700" />
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        
        {/* Header section */}
        <View style={styles.header}>
          <View style={styles.avatarPlaceholder}>
            <Text style={styles.avatarText}>{(user?.full_name || 'U').charAt(0)}</Text>
          </View>
          {editing ? (
            <View style={styles.userInfo}>
              <TextInput style={styles.editInput} value={editName} onChangeText={setEditName}
                placeholder="Full Name" placeholderTextColor="#666" />
              <TextInput style={styles.editInput} value={editEmail} onChangeText={setEditEmail}
                placeholder="Email" placeholderTextColor="#666" keyboardType="email-address" />
              <TextInput style={styles.editInput} value={editPhone} onChangeText={setEditPhone}
                placeholder="Phone" placeholderTextColor="#666" keyboardType="phone-pad" />
              <View style={{ flexDirection: 'row', gap: 10, marginTop: 8 }}>
                <TouchableOpacity style={styles.saveBtn} onPress={handleSaveProfile}>
                  <Text style={styles.saveBtnText}>Save</Text>
                </TouchableOpacity>
                <TouchableOpacity onPress={() => setEditing(false)}>
                  <Text style={styles.cancelText}>Cancel</Text>
                </TouchableOpacity>
              </View>
            </View>
          ) : (
            <View style={styles.userInfo}>
              <Text style={styles.userName}>{user?.full_name}</Text>
              <Text style={styles.userEmail}>{user?.email}</Text>
              <Text style={styles.userPhone}>{user?.phone_number}</Text>
            </View>
          )}
        </View>

        {/* Vehicles Section */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>My Vehicles</Text>
            <TouchableOpacity onPress={() => setShowAddVehicle(!showAddVehicle)}>
              <Text style={styles.addButton}>{showAddVehicle ? '✕ Close' : '+ Add'}</Text>
            </TouchableOpacity>
          </View>

          {showAddVehicle && (
            <View style={styles.addVehicleForm}>
              <TextInput style={styles.editInput} placeholder="Make (e.g. Honda)" placeholderTextColor="#666"
                value={vMake} onChangeText={setVMake} />
              <TextInput style={styles.editInput} placeholder="Model (e.g. City)" placeholderTextColor="#666"
                value={vModel} onChangeText={setVModel} />
              <TextInput style={styles.editInput} placeholder="License Plate (e.g. KA 01 AB 1234)" placeholderTextColor="#666"
                value={vPlate} onChangeText={setVPlate} autoCapitalize="characters" />
              <Text style={{ color: '#AAA', fontSize: 13, marginBottom: 6 }}>Vehicle Type:</Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginBottom: 10 }}>
                {vehicleTypes.map(t => (
                  <TouchableOpacity key={t} onPress={() => setVType(t)}
                    style={[styles.typeChip, vType === t && styles.typeChipActive]}>
                    <Text style={[styles.typeChipText, vType === t && styles.typeChipTextActive]}>{t}</Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>
              <TouchableOpacity style={styles.saveBtn} onPress={handleAddVehicle}>
                <Text style={styles.saveBtnText}>Add Vehicle</Text>
              </TouchableOpacity>
            </View>
          )}

          {user?.vehicles && user.vehicles.map((vehicle: any) => (
            <View key={vehicle.id} style={styles.vehicleCard}>
              <View style={{ flex: 1 }}>
                <Text style={styles.vehicleModel}>{vehicle.make} {vehicle.model} ({vehicle.vehicle_type})</Text>
                <Text style={styles.vehicleReg}>{vehicle.license_plate}</Text>
              </View>
              <TouchableOpacity onPress={() => handleDeleteVehicle(vehicle.id)}>
                <Text style={{ color: '#E53935', fontSize: 14 }}>Remove</Text>
              </TouchableOpacity>
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
              thumbColor={'#FFF'}
            />
          </View>
        </View>

        {/* Account Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Account</Text>
          <TouchableOpacity style={styles.actionRow} onPress={() => setEditing(true)}>
            <Text style={styles.actionText}>Edit Profile</Text>
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
  container: { flex: 1, backgroundColor: '#000000' },
  scrollContent: { padding: 20, paddingTop: 10 },
  header: { flexDirection: 'row', alignItems: 'center', marginBottom: 30 },
  avatarPlaceholder: {
    width: 70, height: 70, borderRadius: 35, backgroundColor: '#FFD700',
    justifyContent: 'center', alignItems: 'center', marginRight: 15,
  },
  avatarText: { fontSize: 28, fontWeight: 'bold', color: '#000' },
  userInfo: { flex: 1 },
  userName: { fontSize: 22, fontWeight: 'bold', marginBottom: 3, color: '#FFF' },
  userEmail: { fontSize: 14, color: '#AAA', marginBottom: 2 },
  userPhone: { fontSize: 14, color: '#888' },
  editInput: {
    backgroundColor: '#1E1E1E', borderWidth: 1, borderColor: '#333', borderRadius: 8,
    padding: 10, color: '#FFF', fontSize: 14, marginBottom: 8,
  },
  saveBtn: {
    backgroundColor: '#FFD700', paddingVertical: 8, paddingHorizontal: 18,
    borderRadius: 8, alignItems: 'center',
  },
  saveBtnText: { color: '#000', fontWeight: 'bold', fontSize: 14 },
  cancelText: { color: '#888', fontSize: 14, paddingVertical: 8 },
  section: {
    marginBottom: 25, backgroundColor: '#1E1E1E', borderRadius: 12,
    padding: 18, elevation: 2,
  },
  sectionHeader: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12,
  },
  sectionTitle: { fontSize: 18, fontWeight: 'bold', color: '#FFF', marginBottom: 8 },
  addButton: { color: '#FFD700', fontWeight: 'bold', fontSize: 15 },
  addVehicleForm: {
    backgroundColor: '#151515', borderRadius: 8, padding: 12, marginBottom: 12,
    borderWidth: 1, borderColor: '#333',
  },
  typeChip: {
    backgroundColor: '#333', paddingVertical: 6, paddingHorizontal: 14,
    borderRadius: 16, marginRight: 8,
  },
  typeChipActive: { backgroundColor: '#FFD700' },
  typeChipText: { color: '#FFF', fontSize: 13 },
  typeChipTextActive: { color: '#000', fontWeight: 'bold' },
  vehicleCard: {
    backgroundColor: '#222', padding: 14, borderRadius: 8, marginBottom: 8,
    borderWidth: 1, borderColor: '#333', flexDirection: 'row', alignItems: 'center',
  },
  vehicleModel: { fontSize: 15, fontWeight: 'bold', marginBottom: 3, color: '#FFF' },
  vehicleReg: { fontSize: 13, color: '#AAA' },
  settingRow: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 12,
  },
  settingLabel: { fontSize: 15, color: '#FFF' },
  settingValue: { fontSize: 15, color: '#888' },
  divider: { height: 1, backgroundColor: '#333' },
  actionRow: { paddingVertical: 14, borderBottomWidth: 1, borderBottomColor: '#333' },
  actionText: { fontSize: 15, color: '#FFF', fontWeight: '500' },
});
