import React, { useState, useEffect } from 'react';
import { Stack, useRouter, useSegments } from 'expo-router';
import { View, Image, StyleSheet } from 'react-native';
import { supabase } from '../lib/supabase';
import { Session } from '@supabase/supabase-js';

function CustomSplashScreen({ onFinish }: { onFinish: () => void }) {
  useEffect(() => {
    // Show GIF animation and then start the app immediately after it plays once
    const finishTimer = setTimeout(() => {
      onFinish();
    }, 2300); // 2.3 seconds matches the new GIF duration perfectly

    return () => {
      clearTimeout(finishTimer);
    };
  }, []);

  return (
    <View style={styles.splashContainer}>
      <Image 
        source={require('../assets/logoanimation.gif')} 
        style={styles.logoGif} 
        resizeMode="contain" 
      />
    </View>
  );
}

export default function RootLayout() {
  const [isReady, setIsReady] = useState(false);
  const [session, setSession] = useState<Session | null>(null);
  const router = useRouter();
  const segments = useSegments();

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
    });
    
    return () => subscription.unsubscribe();
  }, []);

  useEffect(() => {
    if (!isReady) return;

    const inAuthGroup = segments[0] === 'login';

    if (!session && !inAuthGroup) {
      // Redirect to the sign-in page.
      router.replace('/login');
    } else if (session && inAuthGroup) {
      // Redirect away from the sign-in page.
      router.replace('/(tabs)');
    }
  }, [session, isReady, segments]);

  if (!isReady) {
    return <CustomSplashScreen onFinish={() => setIsReady(true)} />;
  }

  return (
    <Stack>
      <Stack.Screen name="login" options={{ headerShown: false }} />
      <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
      <Stack.Screen name="parking/[id]" options={{ presentation: 'modal', title: 'Parking Details' }} />
      <Stack.Screen name="booking/confirm" options={{ title: 'Confirm Booking' }} />
    </Stack>
  );
}

const styles = StyleSheet.create({
  splashContainer: {
    flex: 1,
    backgroundColor: '#000000',
    justifyContent: 'center',
    alignItems: 'center',
  },
  logoGif: {
    width: 300,
    height: 300,
  }
});
