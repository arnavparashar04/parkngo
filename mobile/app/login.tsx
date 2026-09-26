import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, ActivityIndicator, Alert, SafeAreaView, KeyboardAvoidingView, Platform } from 'react-native';
import { supabase } from '../lib/supabase';
import { useRouter } from 'expo-router';

export default function LoginScreen() {
  const [phoneNumber, setPhoneNumber] = useState('');
  const [otp, setOtp] = useState('');
  const [loading, setLoading] = useState(false);
  const [otpSent, setOtpSent] = useState(false);
  const router = useRouter();

  async function signInWithPhone() {
    if (!phoneNumber) {
      Alert.alert('Error', 'Please enter a valid phone number (e.g. +13334445555)');
      return;
    }

    setLoading(true);
    const { error } = await supabase.auth.signInWithOtp({
      phone: phoneNumber,
    });
    setLoading(false);

    if (error) {
      Alert.alert('Error', error.message);
    } else {
      setOtpSent(true);
      Alert.alert('Success', 'OTP sent to your phone!');
    }
  }

  async function verifyOtp() {
    if (!otp) {
      Alert.alert('Error', 'Please enter the OTP');
      return;
    }

    setLoading(true);
    const { error, data } = await supabase.auth.verifyOtp({
      phone: phoneNumber,
      token: otp,
      type: 'sms',
    });
    setLoading(false);

    if (error) {
      Alert.alert('Error', error.message);
    } else if (data.session) {
      // Navigate to the main tabs if successful
      router.replace('/(tabs)');
    }
  }

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView 
        style={styles.keyboardContainer}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <View style={styles.formContainer}>
          <Text style={styles.title}>Welcome to ParkNGo</Text>
          <Text style={styles.subtitle}>
            {otpSent ? 'Enter the code sent to your phone' : 'Enter your phone number to continue'}
          </Text>

          <View style={styles.inputContainer}>
            <TextInput
              style={styles.input}
              placeholder={otpSent ? "6-digit OTP" : "+1 234 567 8900"}
              placeholderTextColor="#888"
              value={otpSent ? otp : phoneNumber}
              onChangeText={otpSent ? setOtp : setPhoneNumber}
              keyboardType="phone-pad"
              autoCapitalize="none"
              editable={!loading}
            />
          </View>

          <TouchableOpacity 
            style={[styles.primaryButton, loading && styles.disabledButton]} 
            onPress={otpSent ? verifyOtp : signInWithPhone}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color="#000" />
            ) : (
              <Text style={styles.primaryButtonText}>
                {otpSent ? 'Verify OTP' : 'Send OTP'}
              </Text>
            )}
          </TouchableOpacity>

          {otpSent && (
            <TouchableOpacity 
              style={styles.secondaryButton} 
              onPress={() => { setOtpSent(false); setOtp(''); }}
              disabled={loading}
            >
              <Text style={styles.secondaryButtonText}>Change Phone Number</Text>
            </TouchableOpacity>
          )}
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000000',
  },
  keyboardContainer: {
    flex: 1,
  },
  formContainer: {
    flex: 1,
    justifyContent: 'center',
    padding: 24,
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#FFD700',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#AAA',
    marginBottom: 32,
  },
  inputContainer: {
    backgroundColor: '#1E1E1E',
    borderRadius: 12,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: '#333',
  },
  input: {
    fontSize: 18,
    color: '#FFF',
    paddingHorizontal: 16,
    paddingVertical: 16,
  },
  primaryButton: {
    backgroundColor: '#FFD700',
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 4,
  },
  disabledButton: {
    opacity: 0.7,
  },
  primaryButtonText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#000',
  },
  secondaryButton: {
    marginTop: 16,
    paddingVertical: 12,
    alignItems: 'center',
  },
  secondaryButtonText: {
    fontSize: 16,
    color: '#FFD700',
    fontWeight: '600',
  }
});
