import { Image, StyleSheet, TouchableOpacity, View } from 'react-native';
import { ThemedText } from './ThemedText';
import { Ionicons } from '@expo/vector-icons';

export function ProfileHeader() {
  return (
    <View style={styles.container}>
      <View style={styles.profileSection}>
        <Image
          source={{ 
            uri: 'https://images.unsplash.com/photo-1633332755192-727a05c4013d?w=200&h=200&fit=crop' 
          }}
          style={styles.profileImage}
        />
        <View style={styles.profileInfo}>
          <ThemedText style={styles.name}>SOURABH CHAPRANA</ThemedText>
          <ThemedText style={styles.subtitle}>Personal</ThemedText>
        </View>
        <TouchableOpacity>
          <Ionicons name="chevron-down" size={24} color="#666" />
        </TouchableOpacity>
      </View>
      <TouchableOpacity style={styles.proButton}>
        <Ionicons name="star-outline" size={20} color="#fff" style={styles.crownIcon} />
        <ThemedText style={styles.proText}>Try Pro for 14 days</ThemedText>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 16,
    marginTop:50,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  profileSection: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  profileImage: {
    width: 48,
    height: 48,
    borderRadius: 24,
    marginRight: 12,
  },
  profileInfo: {
    flex: 1,
  },
  name: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  subtitle: {
    fontSize: 14,
    color: '#666',
  },
  proButton: {
    backgroundColor: '#8B3DFF',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 12,
    borderRadius: 8,
  },
  crownIcon: {
    marginRight: 8,
  },
  proText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
}); 