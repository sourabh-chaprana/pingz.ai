import React, { useEffect, useState } from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
  KeyboardAvoidingView,
  Alert,
  Platform,
  Image,
  Text,
} from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from '../src/store';
import { fetchUserData, updateUserData } from '../src/features/accounts/accountsThunk';
import { resetUpdateStatus } from '../src/features/accounts/accountSlice';
import { ThemedText } from '@/components/ThemedText';
import { Ionicons } from '@expo/vector-icons';
import Animated, { 
  withTiming, 
  useAnimatedStyle, 
  useSharedValue 
} from 'react-native-reanimated';
import { useRouter } from 'expo-router';

// Try to import image picker, but don't fail if it's not available
let ImagePicker: any = null;
let FileSystem: any = null;
try {
  ImagePicker = require('expo-image-picker');
  FileSystem = require('expo-file-system');
} catch (error) {
  console.log('expo dependencies not available');
}

// Import FileReader type for TypeScript
declare const FileReader: any;

type ImageType = 'profile' | 'header' | 'footer';

export default function AccountScreen() {
  const dispatch = useDispatch();
  const { userData, loading, error, updateSuccess } = useSelector(
    (state: RootState) => state.account
  );
  const router = useRouter();

  // Form state
  const [mobileNumber, setMobileNumber] = useState('');
  const [dob, setDob] = useState('');
  const [anniversaryDate, setAnniversaryDate] = useState('');
  const [purposeOfUse, setPurposeOfUse] = useState('');
  
  // Image state - store file paths for binary data
  const [profileImagePath, setProfileImagePath] = useState('');
  const [headerImagePath, setHeaderImagePath] = useState('');
  const [footerImagePath, setFooterImagePath] = useState('');
  
  // Preview URLs for display
  const [profilePreview, setProfilePreview] = useState('');
  const [headerPreview, setHeaderPreview] = useState('');
  const [footerPreview, setFooterPreview] = useState('');
  
  // File names for display
  const [profileFileName, setProfileFileName] = useState('');
  const [headerFileName, setHeaderFileName] = useState('');
  const [footerFileName, setFooterFileName] = useState('');

  // State for file objects
  const [profileFile, setProfileFile] = useState<File | null>(null);
  const [headerFile, setHeaderFile] = useState<File | null>(null);
  const [footerFile, setFooterFile] = useState<File | null>(null);

  // Add state for section collapse
  const [expandedSection, setExpandedSection] = useState<string>('personal');
  
  // Function to handle section toggle
  const toggleSection = (section: string) => {
    setExpandedSection(expandedSection === section ? '' : section);
  };

  // Load user data on component mount
  useEffect(() => {
    dispatch(fetchUserData());
  }, [dispatch]);

  // Update local state when userData is loaded
  useEffect(() => {
    if (userData) {
      setMobileNumber(userData.mobileNumber || '');
      setDob(userData.dob || '');
      setAnniversaryDate(userData.anniversaryDate || '');
      setPurposeOfUse(userData.purposeOfUse || '');
      
      // Set existing image URLs for preview
      setProfilePreview(userData.profileImage || '');
      setHeaderPreview(userData.header || '');
      setFooterPreview(userData.footer || '');
      
      // Extract file names from URLs
      if (userData.profileImage) {
        const parts = userData.profileImage.split('/');
        setProfileFileName(parts[parts.length - 1]);
      }
      
      if (userData.header) {
        const parts = userData.header.split('/');
        setHeaderFileName(parts[parts.length - 1]);
      }
      
      if (userData.footer) {
        const parts = userData.footer.split('/');
        setFooterFileName(parts[parts.length - 1]);
      }
    }
  }, [userData]);

  // Show success message when update is successful and fetch latest data
  useEffect(() => {
    if (updateSuccess) {
      Alert.alert('Success', 'Your profile has been updated successfully.');
      
      // Reset local image paths
      setProfileImagePath('');
      setHeaderImagePath('');
      setFooterImagePath('');
      
      // Fetch updated user data
      dispatch(fetchUserData());
      dispatch(resetUpdateStatus());
    }
  }, [updateSuccess, dispatch]);

  // Handle picking an image
  const pickImage = (type: ImageType) => {
    // Check if we're running on web or native
    if (Platform.OS === 'web') {
      // Create a hidden file input element
      const fileInput = document.createElement('input');
      fileInput.type = 'file';
      fileInput.accept = 'image/*';
      fileInput.style.display = 'none';
      
      // Handle file selection
      fileInput.onchange = (event) => {
        const file = event.target.files[0];
        if (!file) return;
        
        // Store the selected file based on image type
        switch (type) {
          case 'profile':
            setProfileFile(file);
            setProfilePreview(URL.createObjectURL(file));
            setProfileFileName(file.name);
            break;
          case 'header':
            setHeaderFile(file);
            setHeaderPreview(URL.createObjectURL(file));
            setHeaderFileName(file.name);
            break;
          case 'footer':
            setFooterFile(file);
            setFooterPreview(URL.createObjectURL(file));
            setFooterFileName(file.name);
            break;
        }
        
        // Clean up
        document.body.removeChild(fileInput);
      };
      
      // Add to DOM and trigger click
      document.body.appendChild(fileInput);
      fileInput.click();
    } else {
      // Use ImagePicker for native mobile platforms
      if (!ImagePicker) {
        Alert.alert('Error', 'Image picker is not available on this device');
        return;
      }
      
      (async () => {
        try {
          // Request permission
          const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
          if (status !== 'granted') {
            Alert.alert('Permission required', 'Please grant camera roll permissions to upload images');
            return;
          }
          
          // Launch image picker
          const result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ImagePicker.MediaTypeOptions.Images,
            allowsEditing: true,
            aspect: [4, 3],
            quality: 1,
          });
          
          if (!result.canceled && result.assets && result.assets[0]) {
            const selectedAsset = result.assets[0];
            const uri = selectedAsset.uri;
            
            // Get file info
            const fileInfo = await FileSystem.getInfoAsync(uri);
            const fileName = uri.split('/').pop() || 'image.jpg';
            
            // Update state based on type
            switch (type) {
              case 'profile':
                setProfilePreview(uri);
                setProfileFileName(fileName);
                setProfileImagePath(uri);
                break;
              case 'header':
                setHeaderPreview(uri);
                setHeaderFileName(fileName);
                setHeaderImagePath(uri);
                break;
              case 'footer':
                setFooterPreview(uri);
                setFooterFileName(fileName);
                setFooterImagePath(uri);
                break;
            }
          }
        } catch (error) {
          console.error('Error picking image:', error);
          Alert.alert('Error', 'Failed to pick image');
        }
      })();
    }
  };

  // Convert a File object to base64
  const fileToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => {
        // Remove the data:image/jpeg;base64, prefix
        const base64 = reader.result as string;
        const base64Data = base64.split(',')[1];
        resolve(base64Data);
      };
      reader.onerror = error => reject(error);
    });
  };

  // Handle form submission with all data including images
  const handleSubmit = async () => {
    // Create a FormData object
    const formData = new FormData();
    
    // Add text fields
    formData.append('mobileNumber', mobileNumber);
    formData.append('dob', dob);
    formData.append('purposeOfUse', purposeOfUse);
    
    if (anniversaryDate) {
      formData.append('anniversaryDate', anniversaryDate);
    }
    
    // Handle image uploads based on platform
    if (Platform.OS === 'web') {
      // Web platform - use File objects
      if (profileFile) {
        formData.append('profile', profileFile);
        console.log('Adding profile image:', profileFile.name);
      }
      
      if (headerFile) {
        formData.append('header', headerFile);
        console.log('Adding header image:', headerFile.name);
      }
      
      if (footerFile) {
        formData.append('footer', footerFile);
        console.log('Adding footer image:', footerFile.name);
      }
    } else {
      // Native platforms - use URIs and create file objects
      if (profileImagePath) {
        const fileName = profileImagePath.split('/').pop() || 'profile.jpg';
        const fileType = fileName.split('.').pop().toLowerCase() === 'png' ? 'image/png' : 'image/jpeg';
        
        // Create a file object for React Native
        formData.append('profile', {
          uri: profileImagePath,
          name: fileName,
          type: fileType,
        } as any);
        console.log('Adding profile image (native):', fileName);
      }
      
      if (headerImagePath) {
        const fileName = headerImagePath.split('/').pop() || 'header.jpg';
        const fileType = fileName.split('.').pop().toLowerCase() === 'png' ? 'image/png' : 'image/jpeg';
        
        formData.append('header', {
          uri: headerImagePath,
          name: fileName,
          type: fileType,
        } as any);
        console.log('Adding header image (native):', fileName);
      }
      
      if (footerImagePath) {
        const fileName = footerImagePath.split('/').pop() || 'footer.jpg';
        const fileType = fileName.split('.').pop().toLowerCase() === 'png' ? 'image/png' : 'image/jpeg';
        
        formData.append('footer', {
          uri: footerImagePath,
          name: fileName,
          type: fileType,
        } as any);
        console.log('Adding footer image (native):', fileName);
      }
    }
    
    // Log the form data entries for debugging
    console.log('Form data being sent:');
    if (Platform.OS === 'web') {
      for (const pair of formData.entries()) {
        console.log(pair[0], pair[1]);
      }
    } else {
      // On React Native, we can't iterate through FormData entries
      // So we just log that we're sending the form data
      console.log('Sending form data with images (platform specific)');
    }
    
    // Send the FormData object directly
    dispatch(updateUserData(formData));
  };

  // Get display URL for an image type
  const getDisplayUrl = (type: ImageType) => {
    switch (type) {
      case 'profile':
        return profilePreview;
      case 'header':
        return headerPreview;
      case 'footer':
        return footerPreview;
    }
  };
  
  // Get file name for an image type
  const getFileName = (type: ImageType) => {
    switch (type) {
      case 'profile':
        return profileFileName;
      case 'header':
        return headerFileName;
      case 'footer':
        return footerFileName;
    }
  };

  // Check if an image has been newly selected
  const isNewlySelected = (type: ImageType) => {
    switch (type) {
      case 'profile':
        return !!profileImagePath;
      case 'header':
        return !!headerImagePath;
      case 'footer':
        return !!footerImagePath;
    }
  };

  // Render an image section
  const renderImageSection = (type: ImageType, label: string) => {
    const displayUrl = getDisplayUrl(type);
    const fileName = getFileName(type);
    const isNew = isNewlySelected(type);
    
    return (
      <View style={styles.formGroup}>
        <ThemedText style={styles.label}>{label}</ThemedText>
        <View style={styles.imageContainer}>
          <View style={styles.imagePreviewContainer}>
            {displayUrl ? (
              <>
                <Image source={{ uri: displayUrl }} style={styles.imagePreview} />
                {isNew && (
                  <View style={styles.newBadge}>
                    <Text style={styles.newBadgeText}>New</Text>
                  </View>
                )}
              </>
            ) : (
              <View style={styles.noImagePlaceholder}>
                <Ionicons name="image-outline" size={40} color="#ddd" />
                <ThemedText style={styles.noImageText}>No image</ThemedText>
              </View>
            )}
          </View>
          <View style={styles.imageInfoContainer}>
            <Text style={styles.imageFilename} numberOfLines={1} ellipsizeMode="middle">
              {fileName || 'No file selected'}
            </Text>
            <TouchableOpacity 
              style={styles.uploadButton} 
              onPress={() => pickImage(type)}
              disabled={loading}
            >
              <Ionicons name="cloud-upload-outline" size={16} color="#fff" />
              <Text style={styles.uploadButtonText}>
                {displayUrl ? 'Change' : 'Upload'}
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    );
  };

  // Section render helper
  const renderSection = (
    id: string,
    title: string,
    icon: string,
    children: React.ReactNode
  ) => {
    const isExpanded = expandedSection === id;

    return (
      <View style={styles.section}>
        <TouchableOpacity 
          style={styles.sectionHeader}
          onPress={() => toggleSection(id)}
        >
          <View style={styles.sectionHeaderLeft}>
            <Ionicons name={icon} size={24} color="#8B3DFF" />
            <ThemedText style={styles.sectionTitle}>{title}</ThemedText>
          </View>
          <Ionicons 
            name={isExpanded ? 'chevron-up' : 'chevron-down'} 
            size={24} 
            color="#8B3DFF" 
          />
        </TouchableOpacity>
        
        {isExpanded && (
          <View style={styles.sectionContent}>
            {children}
          </View>
        )}
      </View>
    );
  };

  // Update the profile header section
  const ProfileHeader = () => {
    return (
      <View style={styles.profileHeader}>
        {/* Back Button */}
        <TouchableOpacity 
          style={styles.backButton}
          onPress={() => router.back()}
        >
          <Ionicons name="arrow-back" size={24} color="#333" />
        </TouchableOpacity>
        
        <View style={styles.profileHeaderContent}>
          {/* Left side - Profile Image */}
          <TouchableOpacity onPress={() => pickImage('profile')}>
            <View style={styles.profileImageContainer}>
              {profilePreview ? (
                <Image source={{ uri: profilePreview }} style={styles.profileImage} />
              ) : (
                <View style={styles.profilePlaceholder}>
                  <Ionicons name="person" size={40} color="#8B3DFF" />
                </View>
              )}
              <View style={styles.cameraIconOverlay}>
                <Ionicons name="camera" size={20} color="#fff" />
              </View>
            </View>
          </TouchableOpacity>

          {/* Right side - User Info */}
          <View style={styles.userInfoContainer}>
            <ThemedText style={styles.profileName}>
              {userData?.firstName} {userData?.lastName || ''}
            </ThemedText>
            <ThemedText style={styles.profileEmail}>{userData?.email}</ThemedText>
            <View style={styles.proBadge}>
              <Ionicons name="star" size={14} color="#fff" />
              <ThemedText style={styles.proBadgeText}>PRO</ThemedText>
            </View>
          </View>
        </View>
      </View>
    );
  };

  if (loading && !userData) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#8B3DFF" />
      </View>
    );
  }

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={{ flex: 1 }}
    >
      <ScrollView style={styles.container}>
        {/* Profile Header Section */}
        <ProfileHeader />

        <View style={styles.formContainer}>
          {/* Personal Information Section */}
          {renderSection('personal', 'Personal Information', 'person-circle-outline', (
            <>
              <View style={styles.inputGroup}>
                <ThemedText style={styles.label}>First Name</ThemedText>
                <TextInput
                  style={[styles.input, styles.disabledInput]}
                  value={userData?.firstName || ''}
                  editable={false}
                />
              </View>
              <View style={styles.inputGroup}>
                <ThemedText style={styles.label}>Last Name</ThemedText>
                <TextInput
                  style={[styles.input, styles.disabledInput]}
                  value={userData?.lastName || ''}
                  editable={false}
                />
              </View>
            </>
          ))}

          {/* Contact Information Section */}
          {renderSection('contact', 'Contact Information', 'call-outline', (
            <>
              <View style={styles.inputGroup}>
                <ThemedText style={styles.label}>Email</ThemedText>
                <TextInput
                  style={[styles.input, styles.disabledInput]}
                  value={userData?.email || ''}
                  editable={false}
                />
              </View>
              <View style={styles.inputGroup}>
                <ThemedText style={styles.label}>Mobile Number</ThemedText>
                <TextInput
                  style={styles.input}
                  value={mobileNumber}
                  onChangeText={setMobileNumber}
                  placeholder="Enter your mobile number"
                  keyboardType="phone-pad"
                />
              </View>
            </>
          ))}

          {/* Important Dates Section */}
          {renderSection('dates', 'Important Dates', 'calendar-outline', (
            <>
              <View style={styles.inputGroup}>
                <ThemedText style={styles.label}>Date of Birth</ThemedText>
                <TextInput
                  style={styles.input}
                  value={dob}
                  onChangeText={setDob}
                  placeholder="YYYY-MM-DD"
                />
              </View>
              <View style={styles.inputGroup}>
                <ThemedText style={styles.label}>Anniversary Date</ThemedText>
                <TextInput
                  style={styles.input}
                  value={anniversaryDate}
                  onChangeText={setAnniversaryDate}
                  placeholder="YYYY-MM-DD"
                />
              </View>
            </>
          ))}

          {/* Profile Media Section */}
          {renderSection('media', 'Profile Media', 'images-outline', (
            <>
              {renderImageSection('header', 'Header Image')}
              {renderImageSection('footer', 'Footer Image')}
            </>
          ))}

          {/* Purpose of Use Section */}
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Ionicons name="information-circle-outline" size={24} color="#8B3DFF" />
              <ThemedText style={styles.sectionTitle}>Purpose of Use</ThemedText>
            </View>
            
            <View style={styles.sectionContent}>
              <View style={styles.formGroup}>
                <ThemedText style={styles.label}>Purpose of Use</ThemedText>
                <TextInput
                  style={[styles.input, styles.textArea]}
                  value={purposeOfUse}
                  onChangeText={setPurposeOfUse}
                  placeholder="Enter your purpose of use"
                  multiline
                  numberOfLines={4}
                />
              </View>
            </View>
          </View>

          {/* Submit Button */}
          <TouchableOpacity 
            style={styles.submitButton}
            onPress={handleSubmit}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator size="small" color="#fff" />
            ) : (
              <>
                <Ionicons name="save-outline" size={20} color="#fff" style={styles.submitIcon} />
                <ThemedText style={styles.submitButtonText}>Save Changes</ThemedText>
              </>
            )}
          </TouchableOpacity>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f7fa',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  profileHeader: {
    position: 'relative',
    paddingTop: 30,
    paddingVertical: 20,
    paddingHorizontal: 30,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  profileHeaderContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  profileImageContainer: {
    marginLeft:30,
    position: 'relative',
    width: 80,
    height: 80,
    borderRadius: 40,
    marginRight: 16,
  },
  profileImage: {
    width: '100%',
    height: '100%',
    borderRadius: 40,
    borderWidth: 2,
    borderColor: '#fff',
  },
  profilePlaceholder: {
    width: '100%',
    height: '100%',
    borderRadius: 40,
    backgroundColor: '#f0f0f0',
    justifyContent: 'center',
    alignItems: 'center',
  },
  cameraIconOverlay: {
    position: 'absolute',
    bottom: -2,
    right: -2,
    backgroundColor: '#8B3DFF',
    width: 28,
    height: 28,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#fff',
  },
  userInfoContainer: {
    flex: 1,
  },
  profileName: {
    fontSize: 20,
    fontWeight: '600',
    color: '#333',
    marginBottom: 4,
  },
  profileEmail: {
    fontSize: 14,
    color: '#666',
    marginBottom: 8,
  },
  proBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#8B3DFF',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 16,
    alignSelf: 'flex-start',
  },
  proBadgeText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '600',
    marginLeft: 4,
  },
  formContainer: {
    padding: 20,
  },
  section: {
    backgroundColor: '#fff',
    borderRadius: 16,
    marginBottom: 16,
    overflow: 'hidden',
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    backgroundColor: '#fff',
  },
  sectionHeaderLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    marginLeft: 12,
  },
  sectionContent: {
    padding: 16,
    backgroundColor: '#fff',
    borderTopWidth: 1,
    borderTopColor: '#f0f0f0',
  },
  inputGroup: {
    marginBottom: 16,
  },
  label: {
    fontSize: 14,
    fontWeight: '500',
    color: '#666',
    marginBottom: 8,
  },
  input: {
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#e1e4e8',
    borderRadius: 12,
    padding: 14,
    fontSize: 16,
    color: '#333',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  disabledInput: {
    backgroundColor: '#f8f9fa',
    color: '#999',
  },
  textArea: {
    minHeight: 100,
    textAlignVertical: 'top',
  },
  submitButton: {
    flexDirection: 'row',
    backgroundColor: '#8B3DFF',
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 24,
    marginBottom: 32,
    elevation: 4,
    shadowColor: '#8B3DFF',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
  },
  submitIcon: {
    marginRight: 8,
  },
  submitButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  imageContainer: {
    marginTop: 8,
    borderWidth: 1,
    borderColor: '#e1e4e8',
    borderRadius: 12,
    overflow: 'hidden',
    backgroundColor: '#fff',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  imagePreviewContainer: {
    height: 160,
    backgroundColor: '#f5f5f5',
    position: 'relative',
  },
  imagePreview: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  newBadge: {
    position: 'absolute',
    top: 10,
    right: 10,
    backgroundColor: '#4CAF50',
    borderRadius: 10,
    paddingHorizontal: 8,
    paddingVertical: 2,
  },
  newBadgeText: {
    color: 'white',
    fontSize: 12,
    fontWeight: 'bold',
  },
  noImagePlaceholder: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  noImageText: {
    marginTop: 10,
    color: '#999',
  },
  imageInfoContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 12,
    borderTopWidth: 1,
    borderTopColor: '#eee',
  },
  imageFilename: {
    flex: 1,
    fontSize: 14,
    color: '#555',
    marginRight: 10,
  },
  uploadButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#8B3DFF',
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 4,
  },
  uploadButtonText: {
    color: '#fff',
    fontWeight: '500',
    marginLeft: 5,
  },
  backButton: {
    position: 'absolute',
    top: 10,
    left: 10,
    zIndex: 10,
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    justifyContent: 'center',
    alignItems: 'center',
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
      },
      android: {
        elevation: 3,
      },
    }),
  },
}); 