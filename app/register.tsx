import { useState } from 'react';
import { StyleSheet, View, TouchableOpacity, TextInput, Dimensions, Platform } from 'react-native';
import { useRouter } from 'expo-router';
import { ThemedText } from '../components/ThemedText';
import { ThemedView } from '../components/ThemedView';
import { useAppDispatch, useAppSelector } from '../src/hooks/redux';
import { register } from '../src/features/auth/authThunks';
import { Ionicons, FontAwesome } from '@expo/vector-icons';
import Toast from 'react-native-toast-message';

const { width } = Dimensions.get('window');

export default function RegisterScreen() {
  const router = useRouter();
  const dispatch = useAppDispatch();
  const { loading, error } = useAppSelector((state: { auth: any; }) => state.auth);
  
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  const handleRegister = async () => {
    try {
      const result = await dispatch(register({ name, email, password })).unwrap();
      if (result) {
        console.log('Registration successful:', result);
        Toast.show({
          type: 'success',
          text1: 'Success',
          text2: 'Account created successfully',
        });
        router.replace('/(tabs)');
      }
    } catch (error) {
      console.log('Registration failed:', error);
      Toast.show({
        type: 'error',
        text1: 'Registration Failed',
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
        <ThemedText style={styles.title}>Create an account</ThemedText>
        
        <View style={styles.loginLinkContainer}>
          <ThemedText style={styles.loginLinkText}>Already have an account? </ThemedText>
          <TouchableOpacity onPress={() => router.push('/login')}>
            <ThemedText style={styles.loginLink}>Login</ThemedText>
          </TouchableOpacity>
        </View>

        {error && (
          <ThemedText style={styles.error}>{error}</ThemedText>
        )}

        <ThemedText style={styles.inputLabel}>Full Name</ThemedText>
        <TextInput
          style={styles.input}
          placeholder="Enter your full name"
          value={name}
          onChangeText={setName}
          autoCapitalize="words"
        />

        <ThemedText style={styles.inputLabel}>Email address</ThemedText>
        <TextInput
          style={styles.input}
          placeholder="Enter your email"
          value={email}
          onChangeText={setEmail}
          autoCapitalize="none"
          keyboardType="email-address"
        />

        <ThemedText style={styles.inputLabel}>Password</ThemedText>
        <View style={styles.passwordContainer}>
          <TextInput
            style={styles.passwordInput}
            placeholder="Create a password"
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

        <TouchableOpacity 
          style={styles.registerButton}
          onPress={handleRegister}
          disabled={loading}
        >
          <ThemedText style={styles.buttonText}>
            {loading ? 'Processing...' : 'Create Account'}
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
            By clicking Create account you agree to our{' '}
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
    marginBottom: 16,
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
  registerButton: {
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
