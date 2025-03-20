import { useState } from 'react';
import { StyleSheet, View, TouchableOpacity, TextInput, Dimensions, Platform } from 'react-native';
import { useRouter } from 'expo-router';
import { ThemedText } from '../components/ThemedText';
import { ThemedView } from '../components/ThemedView';
import { useAppDispatch, useAppSelector } from '../src/hooks/redux';
import { login } from '../src/features/auth/authThunks';
import { Ionicons, FontAwesome } from '@expo/vector-icons';
import Toast from 'react-native-toast-message';
import AsyncStorage from '@react-native-async-storage/async-storage';

const { width } = Dimensions.get('window');

// Determine if we're running in a web environment
const isWeb = typeof window !== 'undefined' && window.localStorage;

// Create a unified API for storage
export const Storage = {
  setItem: async (key: string, value: string) => {
    if (isWeb) {
      localStorage.setItem(key, value);
      return;
    }
    return AsyncStorage.setItem(key, value);
  },
  
  getItem: async (key: string) => {
    if (isWeb) {
      return localStorage.getItem(key);
    }
    return AsyncStorage.getItem(key);
  },
  
  removeItem: async (key: string) => {
    if (isWeb) {
      localStorage.removeItem(key);
      return;
    }
    return AsyncStorage.removeItem(key);
  }
};

export default function LoginScreen() {
  const router = useRouter();
  const dispatch = useAppDispatch();
  const { loading, error } = useAppSelector((state: { auth: any; }) => state.auth);
  
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  const handleLogin = async () => {
    try {
      if (!email || !password) {
        Toast.show({
          type: 'error',
          text1: 'Validation Error',
          text2: 'Please enter both email and password',
        });
        return;
      }
      
      console.log('Attempting login with:', { email }); // Don't log password
      const result = await dispatch(login({ email, password })).unwrap();
      console.log('Login API response:', result);
      
      if (result) {
        Toast.show({
          type: 'success',
          text1: 'Success',
          text2: result.message || 'Login successful',
        });
        
        // Add slight delay to allow state to update before navigation
        setTimeout(() => {
          router.replace('/(tabs)');
        }, 300); // Increased delay for mobile
      }
    } catch (error) {
      console.error('Login error details:', error);
      Toast.show({
        type: 'error',
        text1: 'Login Failed',
        text2: typeof error === 'string' ? error : 'Something went wrong',
      });
    }
  };

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  return (
    <ThemedView style={styles.container}>
      <View style={styles.card}>
        <ThemedText style={styles.title}>Login to your account</ThemedText>
        
        <View style={styles.loginLinkContainer}>
          <ThemedText style={styles.loginLinkText}>Don't have an account? </ThemedText>
          <TouchableOpacity onPress={() => router.push('/register')}>
            <ThemedText style={styles.loginLink}>Create account</ThemedText>
          </TouchableOpacity>
        </View>

        {/* {error && (
          <ThemedText style={styles.error}>{error}</ThemedText>
        )} */}

        <ThemedText style={styles.inputLabel}>Email address</ThemedText>
        <TextInput
          style={styles.input}
          placeholder="Email address"
          value={email}
          onChangeText={setEmail}
          autoCapitalize="none"
          keyboardType="email-address"
        />

        <ThemedText style={styles.inputLabel}>Password</ThemedText>
        <View style={styles.passwordContainer}>
          <TextInput
            style={styles.passwordInput}
            placeholder="Password"
            value={password}
            onChangeText={setPassword}
            secureTextEntry={!showPassword}
          />
          <TouchableOpacity onPress={togglePasswordVisibility} style={styles.eyeIcon}>
            <Ionicons 
              name={showPassword ? "eye-off-outline" : "eye-outline"} 
              size={22} 
              color="#777" 
            />
          </TouchableOpacity>
        </View>

        <TouchableOpacity style={styles.recoveryLink}>
          <ThemedText style={styles.recoveryText}>Recovery Password</ThemedText>
        </TouchableOpacity>

        <TouchableOpacity 
          style={styles.loginButton}
          onPress={handleLogin}
          disabled={loading}
        >
          <ThemedText style={styles.buttonText}>
            {loading ? 'Processing...' : 'Continue'}
          </ThemedText>
        </TouchableOpacity>

        <View style={styles.dividerContainer}>
          <View style={styles.divider} />
          <ThemedText style={styles.dividerText}>or sign up with</ThemedText>
          <View style={styles.divider} />
        </View>

        <View style={styles.socialContainer}>
          <TouchableOpacity style={styles.socialButton}>
            <FontAwesome name="google" size={22} color="#DB4437" />
          </TouchableOpacity>
          <TouchableOpacity style={styles.socialButton}>
            <FontAwesome name="apple" size={22} color="#000000" />
          </TouchableOpacity>
          <TouchableOpacity style={styles.socialButton}>
            <FontAwesome name="facebook" size={22} color="#4267B2" />
          </TouchableOpacity>
        </View>

        {/* <View style={styles.termsContainer}>
          <ThemedText style={styles.termsText}>
            By clicking Create account you agree to Recognotes{' '}
            <ThemedText style={styles.termsLink}>Terms of use</ThemedText> and{' '}
            <ThemedText style={styles.termsLink}>Privacy policy</ThemedText>
          </ThemedText>
        </View> */}
      </View>
      <Toast />
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
  card: {
    width: '100%',
    maxWidth: 450,
    padding: 20,
    borderRadius: 24,
    backgroundColor: '#fff',
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 8,
      },
      android: {
        elevation: 4,
      },
    }),
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    marginBottom: 8,
    textAlign: 'center',
  },
  loginLinkContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginBottom: 24,
  },
  loginLinkText: {
    fontSize: 14,
    color: '#666',
  },
  loginLink: {
    fontSize: 14,
    color: '#6949FF',
    fontWeight: '600',
  },
  inputLabel: {
    fontSize: 14,
    marginBottom: 8,
    color: '#333',
  },
  input: {
    backgroundColor: '#f5f5f5',
    padding: 16,
    borderRadius: 8,
    marginBottom: 16,
    fontSize: 16,
  },
  passwordContainer: {
    flexDirection: 'row',
    backgroundColor: '#f5f5f5',
    borderRadius: 8,
    marginBottom: 8,
  },
  passwordInput: {
    flex: 1,
    padding: 16,
    fontSize: 16,
  },
  eyeIcon: {
    padding: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  recoveryLink: {
    alignSelf: 'flex-end',
    marginBottom: 24,
  },
  recoveryText: {
    fontSize: 14,
    color: '#666',
  },
  loginButton: {
    backgroundColor: '#6949FF',
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
    marginBottom: 24,
    ...Platform.select({
      ios: {
        shadowColor: '#6949FF',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
      },
      android: {
        elevation: 6,
      },
    }),
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  dividerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 24,
  },
  divider: {
    flex: 1,
    height: 1,
    backgroundColor: '#E0E0E0',
  },
  dividerText: {
    paddingHorizontal: 12,
    color: '#666',
    fontSize: 14,
  },
  socialContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 24,
  },
  socialButton: {
    width: width / 5,
    height: 48,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#E0E0E0',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fff',
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
      },
      android: {
        elevation: 2,
      },
    }),
  },
  termsContainer: {
    alignItems: 'center',
  },
  termsText: {
    fontSize: 12,
    color: '#666',
    textAlign: 'center',
    lineHeight: 18,
  },
  termsLink: {
    color: '#6949FF',
    fontWeight: '500',
  },
  error: {
    color: '#ff4444',
    marginBottom: 16,
    textAlign: 'center',
  },
}); 