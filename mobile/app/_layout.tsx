import React, { useState, useEffect } from 'react';
import { Stack } from 'expo-router';
import { View, Image, StyleSheet } from 'react-native';

function CustomSplashScreen({ onFinish }: { onFinish: () => void }) {
  useEffect(() => {
    // Show GIF animation and then start the app immediately after it plays once
    const finishTimer = setTimeout(() => {
      onFinish();
    }, 1400); // Reduced duration so the GIF doesn't loop twice

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

  if (!isReady) {
    return <CustomSplashScreen onFinish={() => setIsReady(true)} />;
  }

  return (
    <Stack>
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
