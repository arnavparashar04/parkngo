import React, { useState, useEffect, useRef } from 'react';
import { Stack } from 'expo-router';
import { View, Image, Animated, StyleSheet, Dimensions } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';

const { width } = Dimensions.get('window');

function CustomSplashScreen({ onFinish }: { onFinish: () => void }) {
  const shimmerValue = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const anim = Animated.loop(
      Animated.sequence([
        Animated.timing(shimmerValue, { 
          toValue: 1, 
          duration: 1500, 
          useNativeDriver: true 
        }),
        Animated.timing(shimmerValue, { 
          toValue: 0, 
          duration: 0, 
          useNativeDriver: true 
        }),
        Animated.delay(200)
      ])
    );
    
    anim.start();

    const timer = setTimeout(() => {
      onFinish();
    }, 3500);

    return () => {
      anim.stop();
      clearTimeout(timer);
    };
  }, []);

  const translateX = shimmerValue.interpolate({
    inputRange: [0, 1],
    outputRange: [-width * 0.8, width * 0.8]
  });

  return (
    <View style={styles.splashContainer}>
      <View style={styles.logoWrapper}>
        <Image source={require('../assets/logo.png')} style={styles.logo} resizeMode="contain" />
        <Animated.View style={[StyleSheet.absoluteFill, { transform: [{ translateX }], opacity: 0.8 }]}>
          <LinearGradient
            colors={['transparent', 'rgba(255,255,255,0.2)', 'rgba(255,255,255,0.9)', 'rgba(255,255,255,0.2)', 'transparent']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={StyleSheet.absoluteFill}
          />
        </Animated.View>
      </View>
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
    backgroundColor: '#121212',
    justifyContent: 'center',
    alignItems: 'center',
  },
  logoWrapper: {
    width: 250,
    height: 100,
    overflow: 'hidden',
  },
  logo: {
    width: '100%',
    height: '100%',
  }
});
