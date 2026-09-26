import { Tabs } from 'expo-router';
import { useColorScheme, Image, StyleSheet } from 'react-native';

export default function TabLayout() {
  const colorScheme = useColorScheme();
  
  return (
    <Tabs screenOptions={{
      tabBarActiveTintColor: '#FFD700', // Yellow
      tabBarInactiveTintColor: '#888',
      tabBarStyle: {
        backgroundColor: '#000000',
        borderTopColor: '#222',
        height: 60,
        paddingBottom: 8,
        paddingTop: 8,
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
          tabBarIcon: ({ color, focused }) => (
            <Image 
              source={require('../../assets/home.png')} 
              style={[
                styles.tabIcon, 
                { tintColor: color, opacity: focused ? 1 : 0.7 }
              ]} 
              resizeMode="contain"
            />
          ),
        }}
      />
      <Tabs.Screen
        name="bookings"
        options={{
          title: 'My Bookings',
          tabBarLabel: 'Bookings',
          tabBarIcon: ({ color, focused }) => (
            <Image 
              source={require('../../assets/bookings.png')} 
              style={[
                styles.tabIcon, 
                { tintColor: color, opacity: focused ? 1 : 0.7 }
              ]} 
              resizeMode="contain"
            />
          ),
        }}
      />
      <Tabs.Screen
        name="list-space"
        options={{
          title: 'Owner Dashboard',
          tabBarLabel: 'List Space',
          tabBarIcon: ({ color, focused }) => (
            <Image 
              source={require('../../assets/list.png')} 
              style={[
                styles.tabIcon, 
                { tintColor: color, opacity: focused ? 1 : 0.7 }
              ]} 
              resizeMode="contain"
            />
          ),
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: 'Profile',
          tabBarLabel: 'Profile',
          tabBarIcon: ({ color, focused }) => (
            <Image 
              source={require('../../assets/profile.png')} 
              style={[
                styles.tabIcon, 
                { tintColor: color, opacity: focused ? 1 : 0.7 }
              ]} 
              resizeMode="contain"
            />
          ),
        }}
      />
    </Tabs>
  );
}

const styles = StyleSheet.create({
  tabIcon: {
    width: 24,
    height: 24,
  },
});
