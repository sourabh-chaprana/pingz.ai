import { Image, StyleSheet, TouchableOpacity, View } from 'react-native';
import { ThemedText } from './ThemedText';
import { Ionicons } from '@expo/vector-icons';
import { useEffect } from 'react';
import { useAppDispatch, useAppSelector } from '../src/hooks/redux';
// import { fetchUserData } from '../src/features/auth/authThunks';
import { fetchUserData } from '@/src/features/accounts/accountsThunk';

export function ProfileHeader() {
  const dispatch = useAppDispatch();
  const userData = useAppSelector((state) => state.auth.user);
  const loading = useAppSelector((state) => state.auth.loading);

  useEffect(() => {
    dispatch(fetchUserData());
  }, [dispatch]);

  if (loading) {
    return (
      <View style={styles.container}>
        <ThemedText>Loading...</ThemedText>
      </View>
    );
  }



  const isSubscriptionActive = () => {
    if (!userData?.subscriptionExpiry) return false;
    const expiryDate = new Date(userData.subscriptionExpiry);
    return expiryDate > new Date();
  };

  return (
    <View style={styles.container}>
      <View style={styles.profileSection}>
        <Image
          source={{ 
            uri: userData?.profileImage || 'https://images.unsplash.com/photo-1633332755192-727a05c4013d?w=200&h=200&fit=crop' 
          }}
          style={styles.profileImage}
        />
        <View style={styles.profileInfo}>
          <ThemedText style={styles.name}>{userData?.firstName}</ThemedText>
          <ThemedText style={styles.subtitle}>{userData?.type}</ThemedText>
          {userData?.mobileNumber && (
            <ThemedText style={styles.contactInfo}>{userData.mobileNumber}</ThemedText>
          )}
        </View>
        <TouchableOpacity>
          <Ionicons name="chevron-down" size={24} color="#666" />
        </TouchableOpacity>
      </View>
      
      {!isSubscriptionActive() && (
        <TouchableOpacity style={styles.proButton}>
          <Ionicons name="star-outline" size={20} color="#fff" style={styles.crownIcon} />
          <ThemedText style={styles.proText}>Upgrade to PRO</ThemedText>
        </TouchableOpacity>
      )}
      
      {isSubscriptionActive() && (
        <View style={styles.subscriptionInfo}>
          <ThemedText style={styles.expiryText}>
            PRO membership expires on: {new Date(userData?.subscriptionExpiry).toLocaleDateString()}
          </ThemedText>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 16,
    marginTop: 50,
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
    marginBottom: 4,
  },
  contactInfo: {
    fontSize: 12,
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
  subscriptionInfo: {
    backgroundColor: '#f0f0f0',
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  expiryText: {
    fontSize: 12,
    color: '#666',
  },
});