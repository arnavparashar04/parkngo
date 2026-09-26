import { Tabs } from 'expo-router';
import { useColorScheme } from 'react-native';

export default function TabLayout() {
  const colorScheme = useColorScheme();
  
  return (
    <Tabs screenOptions={{
      tabBarActiveTintColor: '#FFD700', // Yellow
      tabBarInactiveTintColor: '#888',
      tabBarStyle: {
        backgroundColor: '#000000',
        borderTopColor: '#333',
      },
      headerStyle: {
        backgroundColor: '#1E1E1E',
      },
      headerTintColor: '#FFD700',
      headerTitleStyle: {
        fontWeight: 'bold',
        fontSize: 20,
      },
    }}>
      <Tabs.Screen
        name="index"
        options={{
          title: 'ParkNGo',
          tabBarLabel: 'Home',
        }}
      />
      <Tabs.Screen
        name="bookings"
        options={{
          title: 'My Bookings',
          tabBarLabel: 'Bookings',
        }}
      />
      <Tabs.Screen
        name="list-space"
        options={{
          title: 'Owner Dashboard',
          tabBarLabel: 'List Space',
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: 'Profile',
          tabBarLabel: 'Profile',
        }}
      />
    </Tabs>
  );
}
