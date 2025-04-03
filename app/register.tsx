import { useState, useRef, useEffect } from 'react';
import { StyleSheet, View, TouchableOpacity, TextInput, Dimensions, Platform, Modal, Switch } from 'react-native';
import { useRouter } from 'expo-router';
import { ThemedText } from '../components/ThemedText';
import { ThemedView } from '../components/ThemedView';
import { useAppDispatch, useAppSelector } from '../src/hooks/redux';
import { register, verifyOtp, resendOtp,login } from '../src/features/auth/authThunks';
import { Ionicons, FontAwesome } from '@expo/vector-icons';
import Toast from 'react-native-toast-message';
import * as Clipboard from 'expo-clipboard';

const { width } = Dimensions.get('window');

export default function RegisterScreen() {
  const router = useRouter();
  const dispatch = useAppDispatch();
  const { loading, error } = useAppSelector((state: { auth: any; }) => state.auth);
  
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [mobileNumber, setMobileNumber] = useState('');
  const [password, setPassword] = useState('');
  const [userType, setUserType] = useState('USER');
  const [showPassword, setShowPassword] = useState(false);
  const [showOtpModal, setShowOtpModal] = useState(false);
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [otpVerificationLoading, setOtpVerificationLoading] = useState(false);
  const [useMobile, setUseMobile] = useState(false);
  const [txnId, setTxnId] = useState('');
  const [resendLoading, setResendLoading] = useState(false);
  const [countdown, setCountdown] = useState(0);
  const countdownTimerRef = useRef<NodeJS.Timeout | null>(null);
  
  // Create refs for OTP inputs
  const otpInputs = useRef<Array<TextInput | null>>([null, null, null, null, null, null]);

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

  const handleRegister = async () => {
    try {
      // Validate inputs
      if (!name) {
        Toast.show({
          type: 'error',
          text1: 'Name Required',
          text2: 'Please enter your name',
        });
        return;
      }
      
      if (useMobile) {
        if (!mobileNumber) {
          Toast.show({
            type: 'error',
            text1: 'Mobile Number Required',
            text2: 'Please enter your mobile number',
          });
          return;
        }
        
        // Create payload for mobile registration (no password needed)
        const payload = {
          name,
          mobileNumber,
          userType
        };
        
        const result = await dispatch(register(payload)).unwrap();
        if (result) {
          
          // Store transaction ID for OTP verification
            setTxnId(result?.txnId);

            console.log('Mobile registration started:', result,);

          
          Toast.show({
            type: 'success',
            text1: 'Success',
            text2: 'OTP sent to your mobile',
          });
          
          // Start the countdown timer
          startCountdownTimer();
          
          // Clear name but keep mobile for OTP verification
          // setName('');
          setShowOtpModal(true);
        }
      } else {
        // Email registration - validate email and password
        if (!email) {
          Toast.show({
            type: 'error',
            text1: 'Email Required',
            text2: 'Please enter your email',
          });
          return;
        }
        
        if (!password) {
          Toast.show({
            type: 'error',
            text1: 'Password Required',
            text2: 'Please enter a password',
          });
          return;
        }
        
        const payload = {
          name,
          email,
          password,
          userType
        };
        
        const result = await dispatch(register(payload)).unwrap();
        if (result) {
          console.log('Email registration started:', result);
          
          Toast.show({
            type: 'success',
            text1: 'Success',
            text2: 'OTP sent to your email',
          });
          
          // Clear name and password but keep email for OTP verification
          setName('');
          setPassword('');
          setShowOtpModal(true);
          setTxnId(result?.txnId);
        }
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
      
      // Create payload based on whether we're using email or mobile
      const payload: VerifyOtpCredentials = { code: otpCode };
      console.log('txnId-----', txnId);
      if (txnId) {
        payload.txnId = txnId;
      } else if (!useMobile) {
        payload.email = email;
      }
      
      const result = await dispatch(verifyOtp(payload)).unwrap();
      
      // Check if verification was successful
      if (result && result.success) {
        // Explicitly show success toast
        Toast.show({
          type: 'success',
          text1: 'Success',
          text2: 'Account verified successfully',
        });
        
        // Clear form and OTP data
        setShowOtpModal(false);
        setEmail('');
        setMobileNumber('');
        setOtp(['', '', '', '', '', '']);
        setTxnId('');
        
        // Navigate to login only on success
        setTimeout(() => {
          router.replace('/login');
        }, 300);
      } else {
        // Just hide modal but stay on register page
        Toast.show({
          type: 'info',
          text1: 'Verification Issue',
          text2: 'Please try again or contact support',
        });
        setShowOtpModal(false);
      }
    } catch (error) {
      // Ensure error toast is shown
      Toast.show({
        type: 'error',
        text1: 'Verification Failed',
        text2: typeof error === 'string' ? error : 'Invalid OTP',
      });
      // Stay on register page, don't close modal so user can try again
    } finally {
      setOtpVerificationLoading(false);
    }
  };
  
  const handleResendOtp = async () => {
    try {
      setResendLoading(true);
      
      if (!useMobile || !mobileNumber) {
        Toast.show({
          type: 'error',
          text1: 'Error',
          text2: 'Mobile number is required to resend OTP',
        });
        return;
      }
      const payload = {
        name,
        mobileNumber,
        userType
      };
      const result = await dispatch(register(payload)).unwrap();
      
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
          </>
        )}

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
            <ThemedText style={styles.otpTitle}>Verify your {useMobile ? 'mobile number' : 'email'}</ThemedText>
            <ThemedText style={styles.otpDescription}>
              Enter the 6-digit code sent to {useMobile ? mobileNumber : email}
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
                  textContentType="oneTimeCode"
                  autoComplete={Platform.OS === 'android' ? 'sms-otp' : 'off'}
                />
              ))}
            </View>

            <TouchableOpacity 
              style={styles.verifyButton}
              onPress={handleVerifyOtp}
              disabled={otpVerificationLoading}
            >
              <ThemedText style={styles.buttonText}>
                {otpVerificationLoading ? 'Verifying...' : 'Verify OTP'}
              </ThemedText>
            </TouchableOpacity>

            {useMobile && (
              <TouchableOpacity 
                style={[
                  styles.resendButton, 
                  (resendLoading || countdown > 0) && styles.disabledButton
                ]}
                onPress={handleResendOtp}
                disabled={resendLoading || countdown > 0}
              >
                <ThemedText style={[
                  styles.resendButtonText,
                  countdown > 0 && styles.countdownText
                ]}>
                  {resendLoading 
                    ? 'Sending...' 
                    : countdown > 0 
                      ? `Resend OTP in ${countdown}s` 
                      : 'Resend OTP'
                  }
                </ThemedText>
              </TouchableOpacity>
            )}

            <TouchableOpacity onPress={handleCloseModal}>
              <ThemedText style={styles.cancelText}>Cancel</ThemedText>
            </TouchableOpacity>

            {/* <TouchableOpacity 
              style={styles.pasteButton}
              onPress={async () => {
                try {
                  const clipboardContent = await Clipboard.getStringAsync();
                  // Check if clipboard contains a 6-digit number
                  const otpRegex = /\b\d{6}\b/;
                  const match = clipboardContent.match(otpRegex);
                  
                  if (match && match[0]) {
                    const clipboardOtp = match[0].split('');
                    setOtp(clipboardOtp);
                  } else {
                    Toast.show({
                      type: 'error',
                      text1: 'Invalid OTP',
                      text2: 'No valid 6-digit code found in clipboard',
                    });
                  }
                } catch (error) {
                  console.error('Failed to read clipboard:', error);
                }
              }}
            >
              <ThemedText style={styles.pasteButtonText}>
                Paste from clipboard
              </ThemedText>
            </TouchableOpacity> */}
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
  // OTP Modal Styles
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
  cancelText: {
    color: '#666',
    fontSize: 16,
    marginTop: 8,
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
  countdownText: {
    color: '#2ecc71',
    fontWeight: '600',
  },
  pasteButton: {
    backgroundColor: '#6949FF',
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
    width: '100%',
    marginBottom: 16,
  },
  pasteButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});
