import { Tabs } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { View, Image } from 'react-native';
import { createElevation } from '../../utils/styles';

export default function TabLayout() {
  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: '#8B3DFF',
        tabBarInactiveTintColor: '#666',
        tabBarStyle: {
          height: 60,
          paddingBottom: 8,
          paddingTop: 8,
        },
        headerShown: false,
      }}>
      <Tabs.Screen
        name="index"
        options={{
          title: 'Home',
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="home-outline" size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="projects"
        options={{
          title: 'Projects',
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="folder-outline" size={size} color={color} />
          ),
        }}
      />
       <Tabs.Screen
        name="create"
        options={{
          title: '',
          tabBarIcon: () => (
            <View style={{
              width: 56,
              height: 56,
              backgroundColor: '#FFFFFF',
              borderWidth: 2,
              borderColor: '#FF4785',
              borderRadius: 28,
              justifyContent: 'center',
              alignItems: 'center',
              marginTop: -30,
              ...createElevation(5),
            }}>
              <Image 
                         
                         source={require('../../assets/images/pingz.png')} 
                          style={{ width: 36, height: 36 }} 
                          resizeMode="contain" 
              />
            </View>
          ),
        }}
      />
      <Tabs.Screen
        name="templates"
        options={{
          title: 'Templates',
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="grid-outline" size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="pro"
        options={{
          title: 'Pro',
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="star-outline" size={size} color={color} />
          ),
        }}
      />
    </Tabs>
  );
}
