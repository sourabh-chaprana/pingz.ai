import { useState, useRef } from 'react';
import { StyleSheet, View, TouchableOpacity, TextInput, Dimensions, Platform, Switch, Modal } from 'react-native';
import { useRouter } from 'expo-router';
import { ThemedText } from '../components/ThemedText';
import { ThemedView } from '../components/ThemedView';
import { useAppDispatch, useAppSelector } from '../src/hooks/redux';
import { login, resendOtp, verifyOtp } from '../src/features/auth/authThunks';
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
  const [mobileNumber, setMobileNumber] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [useMobile, setUseMobile] = useState(false);
  
  // OTP related states
  const [showOtpModal, setShowOtpModal] = useState(false);
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [otpVerificationLoading, setOtpVerificationLoading] = useState(false);
  const [txnId, setTxnId] = useState('');
  const [resendLoading, setResendLoading] = useState(false);
  
  // Create refs for OTP inputs
  const otpInputs = useRef<Array<TextInput | null>>([null, null, null, null, null, null]);

  const handleLogin = async () => {
    try {
      if (useMobile) {
        // Mobile login flow
        if (!mobileNumber) {
          Toast.show({
            type: 'error',
            text1: 'Validation Error',
            text2: 'Please enter your mobile number',
          });
          return;
        }
        
        // Send OTP to mobile number
        const result = await dispatch(resendOtp({ mobileNumber })).unwrap();
        
        if (result && result.txnId) {
          setTxnId(result.txnId);
          Toast.show({
            type: 'success',
            text1: 'OTP Sent',
            text2: 'Please enter the OTP sent to your mobile',
          });
          
          // Show OTP modal
          setShowOtpModal(true);
        }
      } else {
        // Email login flow - requires password
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

  const handleOtpChange = (value: string, index: number) => {
    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);
    
    // Auto focus to next input
    if (value && index < 5 && otpInputs.current[index + 1]) {
      otpInputs.current[index + 1]?.focus();
    }
  };

  const handleVerifyOtp = async () => {
    const otpCode = otp.join('');
    if (otpCode.length !== 6) {
      Toast.show({
        type: 'error',
        text1: 'Invalid OTP',
        text2: 'Please enter all 6 digits',
      });
      return;
    }

    try {
      setOtpVerificationLoading(true);
      
      // Verify OTP for mobile login
      const payload = { 
        otp: otpCode,
        txnId: txnId
      };
      
      const result = await dispatch(login(payload)).unwrap();
      
      if (result && (result.success || result.idToken)) {
        // If the API returned tokens, store them
        if (result.idToken) {
          await Storage.setItem('token', result.idToken);
          await Storage.setItem('refreshToken', result.refreshToken || '');
        }
        
        Toast.show({
          type: 'success',
          text1: 'Success',
          text2: 'Login successful',
        });
        
        // Clear OTP data and close modal
        setShowOtpModal(false);
        setOtp(['', '', '', '', '', '']);
        setTxnId('');
        
        // Navigate to main app
        setTimeout(() => {
          router.replace('/(tabs)');
        }, 300);
      } else {
        Toast.show({
          type: 'error',
          text1: 'Verification Failed',
          text2: 'Invalid OTP or session expired',
        });
      }
    } catch (error) {
      Toast.show({
        type: 'error',
        text1: 'Verification Failed',
        text2: typeof error === 'string' ? error : 'Invalid OTP',
      });
    } finally {
      setOtpVerificationLoading(false);
    }
  };

  const handleResendOtp = async () => {
    try {
      setResendLoading(true);
      
      if (!mobileNumber) {
        Toast.show({
          type: 'error',
          text1: 'Error',
          text2: 'Mobile number is required to resend OTP',
        });
        return;
      }
      
      const result = await dispatch(resendOtp({ mobileNumber })).unwrap();
      
      if (result && result.txnId) {
        setTxnId(result.txnId);
        Toast.show({
          type: 'success',
          text1: 'Success',
          text2: 'OTP sent again to your mobile',
        });
        
        // Clear OTP fields
        setOtp(['', '', '', '', '', '']);
        if (otpInputs.current[0]) {
          otpInputs.current[0]?.focus();
        }
      }
    } catch (error) {
      Toast.show({
        type: 'error',
        text1: 'Error',
        text2: typeof error === 'string' ? error : 'Failed to resend OTP',
      });
    } finally {
      setResendLoading(false);
    }
  };
  
  const handleCloseModal = () => {
    setShowOtpModal(false);
    setOtp(['', '', '', '', '', '']);
  };

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  const toggleAuthMethod = () => {
    setUseMobile(!useMobile);
    // Clear email/mobile when switching between methods
    setEmail('');
    setMobileNumber('');
    setPassword('');
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

        {/* Auth method toggle */}
        <View style={styles.authToggleContainer}>
          <ThemedText style={styles.authToggleText}>
            {useMobile ? "Use Email Instead" : "Use Mobile Number Instead"}
          </ThemedText>
          <Switch
            value={useMobile}
            onValueChange={toggleAuthMethod}
            trackColor={{ false: '#ccc', true: '#8372FF' }}
            thumbColor={useMobile ? '#6949FF' : '#f4f3f4'}
          />
        </View>

        {useMobile ? (
          <>
            <ThemedText style={styles.inputLabel}>Mobile Number</ThemedText>
            <TextInput
              style={styles.input}
              placeholder="Enter your mobile number"
              value={mobileNumber}
              onChangeText={setMobileNumber}
              keyboardType="phone-pad"
            />
          </>
        ) : (
          <>
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
          </>
        )}

        <TouchableOpacity 
          style={styles.loginButton}
          onPress={handleLogin}
          disabled={loading}
        >
          <ThemedText style={styles.buttonText}>
            {loading ? 'Processing...' : useMobile ? 'Get OTP' : 'Continue'}
          </ThemedText>
        </TouchableOpacity>

        <View style={styles.dividerContainer}>
          <View style={styles.divider} />
          <ThemedText style={styles.dividerText}>or sign in with</ThemedText>
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
      </View>

      {/* OTP Verification Modal */}
      <Modal
        visible={showOtpModal}
        transparent
        animationType="slide"
        onRequestClose={handleCloseModal}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.otpModalContainer}>
            <ThemedText style={styles.otpTitle}>Verify your mobile number</ThemedText>
            <ThemedText style={styles.otpDescription}>
              Enter the 6-digit code sent to {mobileNumber}
            </ThemedText>

            <View style={styles.otpInputContainer}>
              {otp.map((digit, index) => (
                <TextInput
                  key={index}
                  style={styles.otpInput}
                  value={digit}
                  onChangeText={(value) => handleOtpChange(value, index)}
                  keyboardType="number-pad"
                  maxLength={1}
                  ref={ref => otpInputs.current[index] = ref}
                />
              ))}
            </View>

            <TouchableOpacity 
              style={styles.verifyButton}
              onPress={handleVerifyOtp}
              disabled={otpVerificationLoading}
            >
              <ThemedText style={styles.buttonText}>
                {otpVerificationLoading ? 'Verifying...' : 'Login with OTP'}
              </ThemedText>
            </TouchableOpacity>

            <TouchableOpacity 
              style={[styles.resendButton, resendLoading && styles.disabledButton]}
              onPress={handleResendOtp}
              disabled={resendLoading}
            >
              <ThemedText style={styles.resendButtonText}>
                {resendLoading ? 'Sending...' : 'Resend OTP'}
              </ThemedText>
            </TouchableOpacity>

            <TouchableOpacity onPress={handleCloseModal}>
              <ThemedText style={styles.cancelText}>Cancel</ThemedText>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

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
  authToggleContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  authToggleText: {
    fontSize: 14,
    color: '#6949FF',
  },
  error: {
    color: '#ff4444',
    marginBottom: 16,
    textAlign: 'center',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  otpModalContainer: {
    width: '100%',
    maxWidth: 400,
    backgroundColor: 'white',
    borderRadius: 16,
    padding: 24,
    alignItems: 'center',
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.2,
        shadowRadius: 8,
      },
      android: {
        elevation: 8,
      },
    }),
  },
  otpTitle: {
    fontSize: 22,
    fontWeight: '700',
    marginBottom: 12,
    textAlign: 'center',
  },
  otpDescription: {
    fontSize: 14,
    color: '#666',
    marginBottom: 24,
    textAlign: 'center',
  },
  otpInputContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
    marginBottom: 32,
  },
  otpInput: {
    width: 46,
    height: 54,
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    fontSize: 20,
    textAlign: 'center',
    backgroundColor: '#f5f5f5',
  },
  verifyButton: {
    backgroundColor: '#6949FF',
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
    width: '100%',
    marginBottom: 16,
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
  resendButton: {
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: '#6949FF',
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
    width: '100%',
    marginBottom: 16,
  },
  resendButtonText: {
    color: '#6949FF',
    fontSize: 16,
    fontWeight: '600',
  },
  disabledButton: {
    opacity: 0.6,
    borderColor: '#999',
  },
  cancelText: {
    color: '#666',
    fontSize: 16,
    marginTop: 8,
  },
}); 