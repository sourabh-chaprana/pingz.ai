import axios from 'axios';
import Constants from 'expo-constants';
import { Platform } from 'react-native';

// Create a custom axios instance that ignores SSL certificate errors on Android
const insecureAxios = axios.create();

if (Platform.OS === 'android' && Constants.expoConfig?.extra?.allowInsecureConnections) {
  console.log('⚠️ WARNING: SSL certificate validation is disabled');
  
  // This is the key fix - it modifies the underlying XMLHttpRequest used by axios
  (global as any).XMLHttpRequest = (global as any).originalXMLHttpRequest || (global as any).XMLHttpRequest;
}

export default insecureAxios; 