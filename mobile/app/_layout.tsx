import { Stack } from 'expo-router';
import { useColorScheme } from 'react-native';

export default function RootLayout() {
  const colorScheme = useColorScheme();

  return (
    <Stack>
      <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
      <Stack.Screen name="parking/[id]" options={{ presentation: 'modal', title: 'Parking Details' }} />
      <Stack.Screen name="booking/confirm" options={{ title: 'Confirm Booking' }} />
    </Stack>
  );
}
