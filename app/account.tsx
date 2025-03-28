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
        <View style={styles.header}>
          <ThemedText style={styles.title}>Account Settings</ThemedText>
        </View>

        {error && (
          <View style={styles.errorContainer}>
            <ThemedText style={styles.errorText}>{error}</ThemedText>
          </View>
        )}

        {/* Profile Section */}
        <View style={styles.profileSection}>
          <TouchableOpacity onPress={() => pickImage('profile')}>
            {profilePreview ? (
              <View style={styles.profileImageWrapper}>
                <Image source={{ uri: profilePreview }} style={styles.profileImage} />
                {profileImagePath && (
                  <View style={styles.profileNewBadge}>
                    <Text style={styles.newBadgeText}>New</Text>
                  </View>
                )}
              </View>
            ) : (
              <View style={styles.profilePlaceholder}>
                <Ionicons name="person" size={50} color="#ccc" />
              </View>
            )}
            <View style={styles.changePhotoButton}>
              <ThemedText style={styles.changePhotoText}>Change Photo</ThemedText>
            </View>
          </TouchableOpacity>
          <ThemedText style={styles.profileName}>
            {userData?.firstName} {userData?.lastName || ''}
          </ThemedText>
          <ThemedText style={styles.profileEmail}>{userData?.email}</ThemedText>
          {userData?.membership && (
            <View style={styles.membershipBadge}>
              <ThemedText style={styles.membershipText}>{userData.membership}</ThemedText>
            </View>
          )}
        </View>

        {/* Form Fields */}
        <View style={styles.formContainer}>
          {/* Disabled Fields */}
          <View style={styles.formGroup}>
            <ThemedText style={styles.label}>First Name</ThemedText>
            <TextInput
              style={[styles.input, styles.disabledInput]}
              value={userData?.firstName || ''}
              editable={false}
            />
          </View>

          <View style={styles.formGroup}>
            <ThemedText style={styles.label}>Last Name</ThemedText>
            <TextInput
              style={[styles.input, styles.disabledInput]}
              value={userData?.lastName || ''}
              editable={false}
            />
          </View>

          <View style={styles.formGroup}>
            <ThemedText style={styles.label}>Email</ThemedText>
            <TextInput
              style={[styles.input, styles.disabledInput]}
              value={userData?.email || ''}
              editable={false}
            />
          </View>

          {/* Editable Fields */}
          <View style={styles.formGroup}>
            <ThemedText style={styles.label}>Mobile Number</ThemedText>
            <TextInput
              style={styles.input}
              value={mobileNumber}
              onChangeText={setMobileNumber}
              placeholder="Enter your mobile number"
              keyboardType="phone-pad"
            />
          </View>

          <View style={styles.formGroup}>
            <ThemedText style={styles.label}>Date of Birth (YYYY-MM-DD)</ThemedText>
            <TextInput
              style={styles.input}
              value={dob}
              onChangeText={setDob}
              placeholder="YYYY-MM-DD"
              keyboardType="default"
            />
          </View>

          <View style={styles.formGroup}>
            <ThemedText style={styles.label}>Anniversary Date (YYYY-MM-DD)</ThemedText>
            <TextInput
              style={styles.input}
              value={anniversaryDate}
              onChangeText={setAnniversaryDate}
              placeholder="YYYY-MM-DD"
              keyboardType="default"
            />
          </View>

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

          {/* Image Sections */}
          {renderImageSection('header', 'Header Image')}
          {renderImageSection('footer', 'Footer Image')}

          {/* Submit Button */}
          <TouchableOpacity 
            style={styles.submitButton}
            onPress={handleSubmit}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator size="small" color="#fff" />
            ) : (
              <ThemedText style={styles.submitButtonText}>Update Profile</ThemedText>
            )}
          </TouchableOpacity>

          {!ImagePicker && (
            <View style={styles.webNoticeContainer}>
              <Ionicons name="information-circle-outline" size={20} color="#666" />
              <ThemedText style={styles.webNoticeText}>
                For better image upload experience, please use the web version at pingz.ai
              </ThemedText>
            </View>
          )}
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f9f9f9',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  header: {
    padding: 20,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
  },
  errorContainer: {
    backgroundColor: '#ffe0e0',
    padding: 10,
    marginHorizontal: 20,
    marginTop: 10,
    borderRadius: 5,
  },
  errorText: {
    color: '#d32f2f',
  },
  profileSection: {
    alignItems: 'center',
    marginVertical: 20,
    paddingHorizontal: 20,
  },
  profileImageWrapper: {
    position: 'relative',
  },
  profileImage: {
    width: 100,
    height: 100,
    borderRadius: 50,
  },
  profilePlaceholder: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: '#f0f0f0',
    justifyContent: 'center',
    alignItems: 'center',
  },
  profileNewBadge: {
    position: 'absolute',
    top: 0,
    right: 0,
    backgroundColor: '#4CAF50',
    borderRadius: 10,
    paddingHorizontal: 8,
    paddingVertical: 2,
  },
  changePhotoButton: {
    marginTop: 10,
    backgroundColor: '#8B3DFF',
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 15,
  },
  changePhotoText: {
    color: '#fff',
    fontWeight: '500',
    fontSize: 14,
  },
  profileName: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
    marginTop: 15,
  },
  profileEmail: {
    fontSize: 16,
    color: '#666',
    marginTop: 5,
  },
  membershipBadge: {
    marginTop: 10,
    paddingHorizontal: 12,
    paddingVertical: 4,
    backgroundColor: '#8B3DFF',
    borderRadius: 20,
  },
  membershipText: {
    color: 'white',
    fontWeight: 'bold',
  },
  formContainer: {
    padding: 20,
  },
  formGroup: {
    marginBottom: 20,
  },
  label: {
    fontSize: 16,
    marginBottom: 8,
    color: '#555',
    fontWeight: '500',
  },
  input: {
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
  },
  textArea: {
    minHeight: 100,
    textAlignVertical: 'top',
  },
  disabledInput: {
    backgroundColor: '#f0f0f0',
    color: '#888',
  },
  imageContainer: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    backgroundColor: '#fff',
    overflow: 'hidden',
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
  submitButton: {
    backgroundColor: '#8B3DFF',
    padding: 15,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 20,
  },
  submitButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  webNoticeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 20,
    padding: 15,
    backgroundColor: '#f0f0f0',
    borderRadius: 8,
  },
  webNoticeText: {
    marginLeft: 10,
    color: '#666',
    fontSize: 14,
    flex: 1,
  },
}); 