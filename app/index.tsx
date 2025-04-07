import { Redirect } from 'expo-router';
import { useEffect, useState } from 'react';
import { useAppSelector } from '../src/hooks/redux';
import { ActivityIndicator, View } from 'react-native';
import { verifyStoredToken } from '../src/services/api';
import { useDispatch } from 'react-redux';
import { logoutUser } from '../src/features/auth/authSlice';

export default function Index() {
  const { isAuthenticated, token } = useAppSelector((state: { auth: any }) => state.auth);
  const [checking, setChecking] = useState(true);
  const [hasToken, setHasToken] = useState(false);
  const dispatch = useDispatch();

  useEffect(() => {
    async function checkToken() {
      try {
        // Use the API service function to verify token
        const tokenExists = await verifyStoredToken();
        console.log('Token verification result:', tokenExists);
        setHasToken(tokenExists);
        
        // Only clear auth state if we're sure there's no token
        if (!tokenExists && !token) {
          console.log('No token found, clearing auth state');
          dispatch(logoutUser());
        }
      } catch (error) {
        console.error('Error checking token:', error);
        setHasToken(false);
      } finally {
        setChecking(false);
      }
    }
    
    checkToken();
  }, [dispatch, token]);

  // Add debug logging
  console.log("Auth state:", { isAuthenticated, hasToken, token: !!token, checking });

  if (checking) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" color="#8B3DFF" />
      </View>
    );
  }

  // Consider both Redux auth state AND token verification
  if (isAuthenticated || hasToken) {
    console.log('Authenticated, redirecting to tabs');
    return <Redirect href="/(tabs)" />;
  }

  console.log('Not authenticated, redirecting to login');
  return <Redirect href="/login" />;
} 