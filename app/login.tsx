import { useState, useRef, useEffect } from 'react';
import { StyleSheet, View, TouchableOpacity, TextInput, Dimensions, Platform, Switch, Modal, ScrollView, Image } from 'react-native';
import { useRouter } from 'expo-router';
import { ThemedText } from '../components/ThemedText';
import { ThemedView } from '../components/ThemedView';
import { useAppDispatch, useAppSelector } from '../src/hooks/redux';
import { login, resendOtp, verifyOtp } from '../src/features/auth/authThunks';
import { Ionicons, FontAwesome } from '@expo/vector-icons';
import Toast from 'react-native-toast-message';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Device from 'expo-device';
import { Linking, NativeModules } from 'react-native';
import * as Clipboard from 'expo-clipboard';
import * as WebBrowser from 'expo-web-browser';
import * as Google from 'expo-auth-session/providers/google';
import { maybeCompleteAuthSession } from 'expo-web-browser';
import { setTokens } from '../src/features/auth/authSlice';
import api, { BASE_URL } from '@/src/services/api';
import { GoogleSignin, statusCodes } from '@react-native-google-signin/google-signin';
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

// Initialize WebBrowser for auth redirect
maybeCompleteAuthSession();

interface GoogleLoginResponse {
  idToken: string;
  refreshToken?: string;
  // ... any other fields
}

export default function LoginScreen() {
  const router = useRouter();
  const dispatch = useAppDispatch();
  const { loading, error } = useAppSelector((state: { auth: any; }) => state.auth);
  
  const [email, setEmail] = useState('');
  const [mobileNumber, setMobileNumber] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [useMobile, setUseMobile] = useState(true);
  
  // OTP related states
  const [showOtpModal, setShowOtpModal] = useState(false);
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [otpVerificationLoading, setOtpVerificationLoading] = useState(false);
  const [txnId, setTxnId] = useState('');
  const [resendLoading, setResendLoading] = useState(false);
  const [countdown, setCountdown] = useState(0);
  const countdownTimerRef = useRef<NodeJS.Timeout | null>(null);
  
  // Create refs for OTP inputs
  const otpInputs = useRef<Array<TextInput | null>>([null, null, null, null, null, null]);

  // Add a state flag to track ongoing authentication
  const [isGoogleAuthInProgress, setIsGoogleAuthInProgress] = useState(false);

  // Update Google Auth configuration with proper client IDs and redirect URIs
  const [googleRequest, googleResponse, promptGoogleAsync] = Google.useAuthRequest({
    androidClientId: '697533994940-5f64m89umo7ikbbllv3smq7pka4m0c5j.apps.googleusercontent.com',
    webClientId: '697533994940-vjis4vdlaalkrqcbht0fib2s9ltq5hda.apps.googleusercontent.com',
    // Add iOS client ID if you have one
    // iosClientId: 'YOUR_IOS_CLIENT_ID',
    // expoClientId: "1025763914604-4i6tjf76eh9ucs6gm5r3p2es7a6kl5ju.apps.googleusercontent.com",
    scopes: ['profile', 'email'],
    redirectUri: Platform.select({
      // Use one of the authorized redirect URIs from your Google Console
      web: 'http://localhost:8081/dashboard',
      default: undefined
    })
  });

  const [showCountryCodeModal, setShowCountryCodeModal] = useState(false);
  const [countryCode, setCountryCode] = useState('+91'); // Default to India

  // Common country codes
  const countryCodes = [
    { name: 'India', code: '+91', flag: '🇮🇳' },
    { name: 'USA', code: '+1', flag: '🇺🇸' },
    { name: 'Canada', code: '+1', flag: '🇨🇦' },
    { name: 'UK', code: '+44', flag: '🇬🇧' },
    { name: 'Australia', code: '+61', flag: '🇦🇺' },
    { name: 'Germany', code: '+49', flag: '🇩🇪' },
    { name: 'France', code: '+33', flag: '🇫🇷' },
    { name: 'China', code: '+86', flag: '🇨🇳' },
    { name: 'Japan', code: '+81', flag: '🇯🇵' },
    { name: 'Russia', code: '+7', flag: '🇷🇺' },
    { name: 'Brazil', code: '+55', flag: '🇧🇷' },
    { name: 'South Africa', code: '+27', flag: '🇿🇦' },
  ];

  // Add this state for search functionality
  const [searchQuery, setSearchQuery] = useState('');
  const [filteredCountryCodes, setFilteredCountryCodes] = useState(countryCodes);

  // Add this function to handle search
  const handleSearch = (text: string) => {
    setSearchQuery(text);
    if (text.trim() === '') {
      setFilteredCountryCodes(countryCodes);
    } else {
      const filtered = countryCodes.filter(country => 
        country.name.toLowerCase().includes(text.toLowerCase()) ||
        country.code.includes(text)
      );
      setFilteredCountryCodes(filtered);
    }
  };

  const startCountdownTimer = () => {
    setCountdown(60);
    
    if (countdownTimerRef.current) {
      clearInterval(countdownTimerRef.current);
    }
    
    countdownTimerRef.current = setInterval(() => {
      setCountdown(prevCount => {
        if (prevCount <= 1) {
          if (countdownTimerRef.current) {
            clearInterval(countdownTimerRef.current);
          }
          return 0;
        }
        return prevCount - 1;
      });
    }, 1000);
  };

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
        
        // Format the mobile number with a space between country code and number
        const formattedMobileNumber = `${countryCode} ${mobileNumber}`;
        
        // Send OTP to mobile number with country code
        const result = await dispatch(resendOtp({ 
          mobileNumber: formattedMobileNumber
        })).unwrap();
        
        if (result && result.txnId) {
          setTxnId(result.txnId);
          Toast.show({
            type: 'success',
            text1: 'OTP Sent',
            text2: 'Please enter the OTP sent to your mobile',
          });
          
          // Start the countdown timer
          startCountdownTimer();
          
          // Show OTP modal
          setShowOtpModal(true);
        }
      } else {
        // Email login flow
        if (!email || !password) {
          Toast.show({
            type: 'error',
            text1: 'Validation Error',
            text2: 'Please enter both email and password',
          });
          return;
        }
        
        console.log('Attempting login with:', { email });
        const result = await dispatch(login({ email, password })).unwrap();
        console.log('Login API response:', result);
        
        if (result) {
          // First update Redux store immediately
          dispatch(setTokens({ 
            token: result.idToken, 
            refreshToken: result.refreshToken 
          }));
          
          // Then store tokens in AsyncStorage
          await AsyncStorage.setItem('auth_token', result.idToken);
          await AsyncStorage.setItem('refreshToken', result.refreshToken || '');

          Toast.show({
            type: 'success',
            text1: 'Success',
            text2: result.message || 'Login successful',
          });

          // Add a small delay to ensure tokens are saved before navigation
          setTimeout(() => {
            router.replace('/(tabs)');
          }, 300);
        }
      }
    } catch (error) {
      console.error('Login error:', error);
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
      
      // Format the mobile number with a space
      const formattedMobileNumber = `${countryCode} ${mobileNumber}`;
      
      // Login with OTP
      const payload = { 
        otp: otpCode,
        txnId: txnId,
        mobileNumber: formattedMobileNumber,
        loginType: 'mobile' // Add this to differentiate from email login
      };
      
      const result = await dispatch(login(payload)).unwrap();
      
      if (result && result.idToken) {
        // Store the tokens in AsyncStorage
        await AsyncStorage.setItem('auth_token', result.idToken);
        await AsyncStorage.setItem('refreshToken', result.refreshToken || '');
        
        // Update Redux store
        dispatch(setTokens({ 
          token: result.idToken, 
          refreshToken: result.refreshToken 
        }));

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
        router.replace('/(tabs)');
      } else {
        Toast.show({
          type: 'error',
          text1: 'Verification Failed',
          text2: 'Invalid OTP or session expired',
        });
      }
    } catch (error) {
      console.error('OTP verification error:', error);
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
      
      // Format the mobile number with a space
      const formattedMobileNumber = `${countryCode} ${mobileNumber}`;
      
      const result = await dispatch(resendOtp({ 
        mobileNumber: formattedMobileNumber 
      })).unwrap();
      
      if (result && result.txnId) {
        setTxnId(result.txnId);
        Toast.show({
          type: 'success',
          text1: 'Success',
          text2: 'OTP sent again to your mobile',
        });
        
        // Start the countdown timer
        startCountdownTimer();
        
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
    
    // Clear the countdown timer
    if (countdownTimerRef.current) {
      clearInterval(countdownTimerRef.current);
      setCountdown(0);
    }
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

  // Add this function near your other Google-related functions
  const configureGoogleSignIn = () => {
    if (Platform.OS === 'android') {
      GoogleSignin.configure({
        webClientId: '697533994940-vjis4vdlaalkrqcbht0fib2s9ltq5hda.apps.googleusercontent.com', // Use web client ID
        androidClientId: '697533994940-5f64m89umo7ikbbllv3smq7pka4m0c5j.apps.googleusercontent.com',
        offlineAccess: true,
      });
    }
  };

  // Add the Android sign-in handler
  const handleAndroidGoogleSignIn = async () => {
    try {
      setIsGoogleAuthInProgress(true);
      
      await GoogleSignin.hasPlayServices();
      const userInfo = await GoogleSignin.signIn();
      
      if (userInfo.idToken) {
        // Send the token to your backend
        const tokenExchangeResponse = await fetch(`${BASE_URL}user/google?token=${userInfo.idToken}`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          }
        });

        if (!tokenExchangeResponse.ok) {
          throw new Error('Failed to exchange token');
        }

        const data = await tokenExchangeResponse.json();
        
        if (data.idToken) {
          // Store tokens in AsyncStorage
          await AsyncStorage.setItem('auth_token', data.idToken);
          if (data.refreshToken) {
            await AsyncStorage.setItem('refreshToken', data.refreshToken);
          }

          Toast.show({
            type: 'success',
            text1: 'Success',
            text2: 'Google login successful',
          });

          // Navigate to home page
          setTimeout(() => {
            router.replace('/(tabs)');
          }, 300);
        }
      }
    } catch (error: any) {
      console.error('Google Sign-In Error:', error);
      if (error.code === statusCodes.SIGN_IN_CANCELLED) {
        // User cancelled the login flow
      } else if (error.code === statusCodes.IN_PROGRESS) {
        // Operation is in progress already
      } else {
        Toast.show({
          type: 'error',
          text1: 'Login Failed',
          text2: 'Failed to complete Google login',
        });
      }
    } finally {
      setIsGoogleAuthInProgress(false);
    }
  };

  // Update the useEffect to configure Google Sign-In for Android
  useEffect(() => {
    if (Platform.OS === 'web') {
      // Existing web configuration...
      const script = document.createElement('script');
      script.src = "https://accounts.google.com/gsi/client";
      script.async = true;
      script.defer = true;
      script.onload = () => {
        // Initialize Google Sign-In after script loads
        if (window.google?.accounts) {
          window.google.accounts.id.initialize({
            client_id: '697533994940-vjis4vdlaalkrqcbht0fib2s9ltq5hda.apps.googleusercontent.com',
            callback: handleGoogleCredentialResponse,
            auto_select: false,
            cancel_on_tap_outside: true,
          });

          // Render the custom Google button
          window.google.accounts.id.renderButton(
            document.getElementById("googleButton"),
            { 
              type: "standard",
              theme: "outline",
              size: "large",
              text: "sign_in_with",
              shape: "rectangular",
              width: 250
            }
          );
        }
      };
      document.body.appendChild(script);

      return () => {
        // Cleanup
        const googleScript = document.querySelector('script[src="https://accounts.google.com/gsi/client"]');
        if (googleScript) {
          googleScript.remove();
        }
      };
    } else {
      // Configure Google Sign-In for Android
      configureGoogleSignIn();
    }
  }, []);

  // Update the handleGoogleCredentialResponse function
  const handleGoogleCredentialResponse = async (response: any) => {
    console.log("Google Response:", response);
    if (response.credential) {
      try {
        setIsGoogleAuthInProgress(true);
        
        // Send the credential to your backend
        const tokenExchangeResponse = await fetch(`${BASE_URL}user/google?token=${response.credential}`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          }
        });

        if (!tokenExchangeResponse.ok) {
          throw new Error('Failed to exchange token');
        }

        const data = await tokenExchangeResponse.json();
        console.log("Token exchange response:", data);
        
        if (data.idToken) {
          // Store tokens in AsyncStorage
          await AsyncStorage.setItem('auth_token', data.idToken);
          if (data.refreshToken) {
            await AsyncStorage.setItem('refreshToken', data.refreshToken);
          }

          Toast.show({
            type: 'success',
            text1: 'Success',
            text2: 'Google login successful',
          });

          // Navigate to home page
          setTimeout(() => {
            router.replace('/(tabs)');
          }, 300);
        } else {
          throw new Error('No token received from server');
        }
      } catch (error) {
        console.error('Google login error:', error);
        Toast.show({
          type: 'error',
          text1: 'Login Failed',
          text2: 'Failed to complete Google login',
        });
      } finally {
        setIsGoogleAuthInProgress(false);
      }
    }
  };

  // Update the social container in your return statement
  const renderGoogleButton = () => {
    if (Platform.OS === 'web') {
      return (
        <div 
          id="googleButton"
          style={{
            display: 'flex',
            justifyContent: 'center',
            width: '100%'
          }}
        />
      );
    } else {
      return (
        <TouchableOpacity 
          style={[
            styles.socialButton,
            isGoogleAuthInProgress && styles.disabledButton
          ]}
          onPress={handleAndroidGoogleSignIn}
          disabled={isGoogleAuthInProgress}
        >
          <FontAwesome name="google" size={22} color="#DB4437" />
        </TouchableOpacity>
      );
    }
  };

  return (
    <ThemedView style={styles.container}>
      <View style={styles.card}>
        <Image 
          source={require('../assets/images/pingz.png')}
          style={styles.logo}
          resizeMode="contain"
        />
        <ThemedText style={styles.title}>L to Pingz</ThemedText>
        
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
            <View style={styles.phoneContainer}>
              <TouchableOpacity 
                style={styles.countryCodeSelector}
                onPress={() => setShowCountryCodeModal(true)}
              >
                <ThemedText style={styles.countryCodeText}>{countryCode}</ThemedText>
                <Ionicons name="chevron-down" size={16} color="#666" />
              </TouchableOpacity>
              <TextInput
                style={styles.phoneInput}
                placeholder="Enter your mobile number"
                value={mobileNumber}
                onChangeText={(text) => {
                  // Remove any spaces and non-numeric characters
                  const cleanedText = text.replace(/[\s\D]/g, '');
                  setMobileNumber(cleanedText);
                }}
                keyboardType="phone-pad"
              />
            </View>
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
          {renderGoogleButton()}
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
              Enter the 6-digit code sent to {countryCode} {mobileNumber}
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
              style={[
                styles.resendButton, 
                (resendLoading || countdown > 0) && styles.disabledButton
              ]}
              onPress={handleResendOtp}
              disabled={resendLoading || countdown > 0}
            >
              <ThemedText style={styles.resendButtonText}>
                {resendLoading 
                  ? 'Sending...' 
                  : countdown > 0 
                    ? `Resend OTP in ${countdown}s` 
                    : 'Resend OTP'
                }
              </ThemedText>
            </TouchableOpacity>

            <TouchableOpacity onPress={handleCloseModal}>
              <ThemedText style={styles.cancelText}>Cancel</ThemedText>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* Country Code Modal */}
      <Modal
        visible={showCountryCodeModal}
        transparent
        animationType="slide"
        onRequestClose={() => setShowCountryCodeModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.countryCodeModalContainer}>
            <ThemedText style={styles.countryCodeTitle}>Select Country Code</ThemedText>
            
            <View style={styles.searchContainer}>
              <Ionicons name="search" size={20} color="#666" style={styles.searchIcon} />
              <TextInput
                style={styles.searchInput}
                placeholder="Search country..."
                value={searchQuery}
                onChangeText={handleSearch}
                autoFocus={true}
              />
            </View>
            
            <ScrollView 
              style={styles.countryListScrollView}
              showsVerticalScrollIndicator={false}
            >
              <View style={styles.countryListContainer}>
                {filteredCountryCodes.map((country) => (
                  <TouchableOpacity
                    key={country.name}
                    style={styles.countryItem}
                    onPress={() => {
                      setCountryCode(country.code);
                      setShowCountryCodeModal(false);
                      setSearchQuery('');
                      setFilteredCountryCodes(countryCodes);
                    }}
                  >
                    <View style={styles.flagContainer}>
                      <ThemedText style={styles.countryFlag}>{country.flag}</ThemedText>
                    </View>
                    <ThemedText style={styles.countryName}>{country.name}</ThemedText>
                    <ThemedText style={styles.countryCodeItemText}>{country.code}</ThemedText>
                  </TouchableOpacity>
                ))}
                
                {filteredCountryCodes.length === 0 && (
                  <View style={styles.noResultsContainer}>
                    <ThemedText style={styles.noResultsText}>No countries found</ThemedText>
                  </View>
                )}
              </View>
            </ScrollView>
            
            <TouchableOpacity 
              style={styles.cancelButton}
              onPress={() => {
                setShowCountryCodeModal(false);
                setSearchQuery('');
                setFilteredCountryCodes(countryCodes);
              }}
            >
              <ThemedText style={styles.cancelButtonText}>Cancel</ThemedText>
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
  logo: {
    width: 120,
    height: 120,
    alignSelf: 'center',
    marginBottom: 16,
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
  phoneContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  countryCodeSelector: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
    padding: 16,
    borderRadius: 8,
    marginRight: 8,
    minWidth: 80,
    justifyContent: 'space-between',
  },
  countryCodeText: {
    fontSize: 16,
    color: '#333',
    marginRight: 4,
  },
  phoneInput: {
    flex: 1,
    backgroundColor: '#f5f5f5',
    padding: 16,
    borderRadius: 8,
    fontSize: 16,
  },
  countryCodeModalContainer: {
    width: '90%',
    maxWidth: 400,
    backgroundColor: 'white',
    borderRadius: 20,
    overflow: 'hidden',
    maxHeight: '80%',
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
  countryCodeTitle: {
    fontSize: 20,
    fontWeight: '700',
    marginTop: 20,
    marginBottom: 16,
    textAlign: 'center',
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
    borderRadius: 10,
    paddingHorizontal: 12,
    marginHorizontal: 16,
    marginBottom: 16,
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    padding: 12,
    fontSize: 16,
    height: 48,
  },
  countryListScrollView: {
    width: '100%',
    maxHeight: '70%',
  },
  countryListContainer: {
    width: '100%',
    paddingBottom: 8,
  },
  countryItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  flagContainer: {
    width: 32,
    height: 24,
    marginRight: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  countryFlag: {
    fontSize: 24,
  },
  countryName: {
    flex: 1,
    fontSize: 16,
    color: '#333',
  },
  countryCodeItemText: {
    fontSize: 16,
    color: '#666',
    fontWeight: '600',
    width: 50,
    textAlign: 'right',
  },
  cancelButton: {
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: '#f0f0f0',
    alignItems: 'center',
    width: '100%',
  },
  cancelButtonText: {
    fontSize: 16,
    color: '#666',
    fontWeight: '500',
  },
  noResultsContainer: {
    padding: 20,
    alignItems: 'center',
  },
  noResultsText: {
    fontSize: 16,
    color: '#666',
  },
  webSocialButton: {
    flexDirection: 'row',
    width: 'auto',
    paddingHorizontal: 16,
    minWidth: 200,
  },
  socialButtonText: {
    marginLeft: 8,
    fontSize: 14,
    fontWeight: '500',
  },
}); 