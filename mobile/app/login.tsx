import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ActivityIndicator, SafeAreaView, Platform } from 'react-native';
import { supabase } from '../lib/supabase';
import * as WebBrowser from 'expo-web-browser';
import * as Linking from 'expo-linking';

// Ensure the web browser closes if auth is cancelled
WebBrowser.maybeCompleteAuthSession();

export default function LoginScreen() {
  const [loading, setLoading] = useState(false);

  // Set up the deep link for OAuth redirection
  const redirectTo = Linking.createURL('/(tabs)');

  const handleGoogleLogin = async () => {
    setLoading(true);
    
    // 1. Get the OAuth provider URL from Supabase
    const { data, error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo,
        skipBrowserRedirect: true,
      },
    });

    if (error) {
      console.error(error);
      setLoading(false);
      return;
    }

    if (!data?.url) {
      console.error("No URL returned for OAuth");
      setLoading(false);
      return;
    }

    // 2. Open the URL in the system browser
    try {
      const result = await WebBrowser.openAuthSessionAsync(data.url, redirectTo);
      
      // 3. Handle the redirect back into the app
      if (result.type === 'success') {
        const url = new URL(result.url);
        // Supabase will attach `#access_token=...` or `?code=...` 
        // We can pass the URL to supabase to process the session
        await supabase.auth.getSessionFromUrl(result.url);
      }
    } catch (err) {
      console.error('Browser error:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.formContainer}>
        <Text style={styles.title}>Welcome to ParkNGo</Text>
        <Text style={styles.subtitle}>Sign in to discover and book parking</Text>

        <TouchableOpacity 
          style={[styles.primaryButton, loading && styles.disabledButton]} 
          onPress={handleGoogleLogin}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color="#000" />
          ) : (
            <Text style={styles.primaryButtonText}>
              Continue with Google
            </Text>
          )}
        </TouchableOpacity>

        <TouchableOpacity 
          style={styles.guestButton} 
          onPress={async () => {
            setLoading(true);
            const { error } = await supabase.auth.signInAnonymously();
            if (error) {
              console.error(error);
              alert("Please enable Anonymous Sign-ins in your Supabase Dashboard!");
            }
            setLoading(false);
          }}
          disabled={loading}
        >
          <Text style={styles.guestButtonText}>
            Continue as Guest
          </Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000000',
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
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 16,
    color: '#AAA',
    marginBottom: 40,
    textAlign: 'center',
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
    marginBottom: 16,
  },
  disabledButton: {
    opacity: 0.7,
  },
  primaryButtonText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#000',
  },
  guestButton: {
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#333',
    backgroundColor: '#1E1E1E',
  },
  guestButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFF',
  }
});
