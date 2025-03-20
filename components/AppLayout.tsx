import React from 'react';
import { View, StyleSheet, Text } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons, MaterialIcons } from '@expo/vector-icons';
import { TouchableOpacity } from 'react-native-gesture-handler';
import { createElevation } from '../utils/styles';

export default function AppLayout({ children }) {
  const router = useRouter();
  
  return (
    <View style={styles.container}>
      <View style={styles.content}>
        {children}
      </View>
      
      {/* Custom Tab Bar */}
      <View style={styles.tabBar}>
        <TouchableOpacity onPress={() => router.push('/(tabs)')} style={styles.tabItem}>
          <Ionicons name="home-outline" size={24} color="#666" />
          <Text style={styles.tabLabel}>Home</Text>
        </TouchableOpacity>
        
        <TouchableOpacity onPress={() => router.push('/(tabs)/projects')} style={styles.tabItem}>
          <Ionicons name="folder-outline" size={24} color="#666" />
          <Text style={styles.tabLabel}>Projects</Text>
        </TouchableOpacity>
        
        <TouchableOpacity style={styles.tabItem}>
          <View style={styles.createButton}>
            <Ionicons name="add" size={32} color="#fff" />
          </View>
        </TouchableOpacity>
        
        <TouchableOpacity onPress={() => router.push('/(tabs)/templates')} style={styles.tabItem}>
          <Ionicons name="grid-outline" size={24} color="#666" />
          <Text style={styles.tabLabel}>Templates</Text>
        </TouchableOpacity>
        
        <TouchableOpacity onPress={() => router.push('/(tabs)/pro')} style={styles.tabItem}>
          <Ionicons name="star-outline" size={24} color="#666" />
          <Text style={styles.tabLabel}>Pro</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f8f8',
  },
  content: {
    flex: 1,
  },
  tabBar: {
    flexDirection: 'row',
    borderTopWidth: 1,
    borderTopColor: '#eee',
    backgroundColor: '#fff',
    height: 60,
    justifyContent: 'space-around',
    alignItems: 'center',
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    paddingBottom: 8,
    paddingTop: 8,
  },
  tabItem: {
    alignItems: 'center',
    justifyContent: 'center',
    flex: 1,
    height: 60,
  },
  tabLabel: {
    fontSize: 12,
    marginTop: 4,
    color: '#666',
  },
  createButton: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#8B3DFF',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: -30,
    ...createElevation(5),
  },
}); 