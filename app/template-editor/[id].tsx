import React, { useState, useEffect } from 'react';
import { 
  StyleSheet, 
  View, 
  TouchableOpacity, 
  Image, 
  TextInput, 
  ScrollView, 
  ActivityIndicator,
  Platform,
  Switch
} from 'react-native';
import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { Ionicons } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useSelector, useDispatch } from 'react-redux';
import { RootState } from '@/src/store';
import { 
  fetchTemplateById, 
  fetchTemplatesByCategory, 
  generateImage,
  fetchMediaLibrary 
} from '@/src/features/template/templateThunks';
import { 
  clearGeneratedImage,
  generateImageStart,
  generateImageSuccess,
  generateImageFailure
} from '@/src/features/template/templateSlice';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Toast from 'react-native-toast-message';
import api from '@/src/services/api';
import * as FileSystem from 'expo-file-system';
import * as Sharing from 'expo-sharing';
import * as MediaLibrary from 'expo-media-library';
import { fetchUserData } from '@/src/features/accounts/accountsThunk';
import * as ImagePicker from 'expo-image-picker';

// Update the toCamelCase function to ensure first letter is always capitalized
const toCamelCase = (str: string) => {
  if (!str) return '';
  
  // First convert to camelCase and add spaces
  const withSpaces = str
    .split(/[-_\s]+/)
    .map((word) => {
      // Always capitalize first letter of each word
      return word.charAt(0).toUpperCase() + word.slice(1).toLowerCase();
    })
    .join(' ');
  
  return withSpaces;
};

export default function TemplateEditor() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const dispatch = useDispatch();
  const templateId = params.id as string;
  
  // Redux state
  const { 
    currentTemplate, 
    templates, 
    loading, 
    error,
    generatedImage,
    generatingImage,
    generateImageError,
    mediaLibrary,
    loadingMedia,
    mediaError
  } = useSelector((state: RootState) => state.templates);

  // Local state
  const [templateVariables, setTemplateVariables] = useState<{[key: string]: string}>({});
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [isMediaLibraryOpen, setIsMediaLibraryOpen] = useState(false);
  const [showDownloadSuccess, setShowDownloadSuccess] = useState(false);
  const [showPermissionError, setShowPermissionError] = useState(false);
  const [addHeader, setAddHeader] = useState(false);
  const [addFooter, setAddFooter] = useState(false);
  const [headerImage, setHeaderImage] = useState<string | null>(null);
  const [footerImage, setFooterImage] = useState<string | null>(null);
  const [imageLoading, setImageLoading] = useState(false);
  const [showProModal, setShowProModal] = useState(false);
  const [isInitialized, setIsInitialized] = useState(false);

  // Add user data state to store header/footer images
  const userData = useSelector((state: RootState) => state.account.userData);

  // Add this to track where we came from
  const category = currentTemplate?.category || params.category;

  // Single useEffect for initial data fetching
  useEffect(() => {
    const fetchInitialData = async () => {
      try {
        await Promise.all([
          dispatch(fetchTemplateById(templateId)),
          dispatch(fetchUserData())
        ]);
        setIsInitialized(true);
      } catch (error) {
        console.error('Error fetching initial data:', error);
        Toast.show({
          type: 'error',
          text1: 'Error',
          text2: 'Failed to load template data',
          position: 'bottom',
        });
      }
    };

    fetchInitialData();
  }, [templateId]); // Only depend on templateId

  // Separate useEffect for template variables reset
  useEffect(() => {
    if (currentTemplate?.templateVariables) {
      resetForm();
    }
  }, [currentTemplate?.id]); // Only reset when template ID changes

  // Separate useEffect for header/footer images
  useEffect(() => {
    if (userData?.header || userData?.footer) {
      setHeaderImage(userData.header || null);
      setFooterImage(userData.footer || null);
    }
  }, [userData?.header, userData?.footer]); // Only update when header/footer changes

  // Separate useEffect for category templates
  useEffect(() => {
    if (currentTemplate?.event && !templates.length) {
      dispatch(fetchTemplatesByCategory(currentTemplate.event));
    }
  }, [currentTemplate?.event]); // Only fetch when event changes and templates are empty

  // Add new useEffect to clear state when template ID changes
  useEffect(() => {
    // Clear all relevant states when template changes
    dispatch(clearGeneratedImage());
    setSelectedImage(null);
    setTemplateVariables({});
    setAddHeader(false);
    setAddFooter(false);
    setImageLoading(true);
    setShowDownloadSuccess(false);
    setShowPermissionError(false);
    
    // Reset any error states
    if (generateImageError) {
      dispatch(generateImageFailure(null));
    }
  }, [templateId]); // Only run when templateId changes

  // Media handlers
  const handleSelectMedia = () => {
    setIsMediaLibraryOpen(true);
    dispatch(fetchMediaLibrary()); // Use the Redux thunk directly
  };

  const handleCloseMediaLibrary = () => {
    setIsMediaLibraryOpen(false);
  };

  const handleImageSelect = (imageUrl: string) => {
    // Clear any previous errors first
    if (generateImageError) {
      dispatch(generateImageFailure(null));
    }
    
    setSelectedImage(imageUrl);
    const imageVariable = currentTemplate?.templateVariables.find(
      variable => variable.name.toLowerCase() === 'image'
    );
    
    if (imageVariable) {
      handleVariableChange('image', imageUrl);
    }
    setIsMediaLibraryOpen(false);
  };

  const handleDeleteImage = () => {
    setSelectedImage(null);
    handleVariableChange('image', '');
  };

  // Form handlers
  const handleVariableChange = (key: string, value: string) => {
    setTemplateVariables(prev => ({
      ...prev,
      [key]: value
    }));
  };

  const resetForm = () => {
    if (currentTemplate?.templateVariables) {
      const initialVariables = {};
      currentTemplate.templateVariables.forEach(variable => {
        initialVariables[variable.name] = '';
      });
      setTemplateVariables(initialVariables);
      setSelectedImage(null);
      setAddHeader(false);
      setAddFooter(false);
    }
  };

  // Add this function to handle camera capture
  const handleCameraCapture = async () => {
    try {
      // Request camera permissions
      const { status } = await ImagePicker.requestCameraPermissionsAsync();
      if (status !== 'granted') {
        Toast.show({
          type: 'error',
          text1: 'Permission Required',
          text2: 'Please grant camera permissions to take photos',
          position: 'bottom',
        });
        return;
      }

      // Launch camera
      const result = await ImagePicker.launchCameraAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [4, 3],
        quality: 1,
      });

      if (!result.canceled && result.assets && result.assets[0]) {
        handleImageSelect(result.assets[0].uri);
      }
    } catch (error) {
      console.error('Camera error:', error);
      Toast.show({
        type: 'error',
        text1: 'Camera Error',
        text2: 'Failed to capture photo',
        position: 'bottom',
      });
    }
  };

  // Update the renderImageField function
  const renderImageField = (variable: string, type: string = 'text') => {
    // Handle photo type inputs
    if (type.toLowerCase() === 'photo' || variable.toLowerCase() === 'photo') {
      return (
        <View style={styles.imageFieldContainer}>
          {selectedImage ? (
            <View style={styles.selectedImageContainer}>
              <Image 
                source={{ uri: selectedImage }} 
                style={styles.selectedImage} 
                resizeMode="cover"
              />
              <View style={styles.imageActions}>
                <TouchableOpacity 
                  style={styles.imageActionButton} 
                  onPress={handleSelectMedia}
                >
                  <Ionicons name="images-outline" size={20} color="#8B3DFF" />
                </TouchableOpacity>
                <TouchableOpacity 
                  style={styles.imageActionButton} 
                  onPress={handleCameraCapture}
                >
                  <Ionicons name="camera-outline" size={20} color="#8B3DFF" />
                </TouchableOpacity>
                <TouchableOpacity 
                  style={[styles.imageActionButton, styles.deleteButton]} 
                  onPress={handleDeleteImage}
                >
                  <Ionicons name="trash" size={20} color="#FF4444" />
                </TouchableOpacity>
              </View>
            </View>
          ) : (
            <View style={styles.photoUploadContainer}>
              <TouchableOpacity 
                style={styles.uploadButton}
                onPress={handleSelectMedia}
              >
                <Ionicons name="images-outline" size={24} color="#8B3DFF" />
                <ThemedText style={styles.uploadButtonText}>Choose from Gallery</ThemedText>
              </TouchableOpacity>
              
              <View style={styles.orDivider}>
                <View style={styles.dividerLine} />
                <ThemedText style={styles.orText}>OR</ThemedText>
                <View style={styles.dividerLine} />
              </View>

              <TouchableOpacity 
                style={styles.uploadButton}
                onPress={handleCameraCapture}
              >
                <Ionicons name="camera-outline" size={24} color="#8B3DFF" />
                <ThemedText style={styles.uploadButtonText}>Take Photo</ThemedText>
              </TouchableOpacity>
            </View>
          )}
        </View>
      );
    }
    
    // Handle image type (existing media library functionality)
    if (variable.toLowerCase() === 'image') {
      return (
        <View style={styles.imageFieldContainer}>
          {selectedImage ? (
            <View style={styles.selectedImageContainer}>
              <Image 
                source={{ uri: selectedImage }} 
                style={styles.selectedImage} 
                resizeMode="cover"
              />
              <View style={styles.imageActions}>
                <TouchableOpacity 
                  style={styles.imageActionButton} 
                  onPress={handleSelectMedia}
                >
                  <Ionicons name="reload" size={20} color="#8B3DFF" />
                </TouchableOpacity>
                <TouchableOpacity 
                  style={[styles.imageActionButton, styles.deleteButton]} 
                  onPress={handleDeleteImage}
                >
                  <Ionicons name="trash" size={20} color="#FF4444" />
                </TouchableOpacity>
              </View>
            </View>
          ) : (
            <TouchableOpacity 
              style={styles.selectMediaButton} 
              onPress={handleSelectMedia}
            >
              <Ionicons name="image-outline" size={24} color="#8B3DFF" />
              <ThemedText style={styles.selectMediaText}>Select Media</ThemedText>
            </TouchableOpacity>
          )}
        </View>
      );
    }
    
    // Default text input
    return (
      <TextInput
        style={styles.formInput}
        placeholder={`Enter ${variable}...`}
        value={templateVariables[variable] || ''}
        onChangeText={(text) => handleVariableChange(variable, text)}
      />
    );
  };

  // Media Library Modal
  const renderMediaLibrary = () => {
    if (!isMediaLibraryOpen) return null;

    return (
      <View style={styles.modalOverlay}>
        <View style={styles.modalContent}>
          <View style={styles.modalHeader}>
            <ThemedText style={styles.modalTitle}>Media Library</ThemedText>
            <TouchableOpacity onPress={handleCloseMediaLibrary}>
              <Ionicons name="close" size={24} color="#333" />
            </TouchableOpacity>
          </View>
          
          {loadingMedia ? (
            <View style={styles.mediaLoadingContainer}>
              <ActivityIndicator size="large" color="#8B3DFF" />
              <ThemedText style={styles.loadingText}>Loading media...</ThemedText>
            </View>
          ) : mediaError ? (
            <View style={styles.mediaErrorContainer}>
              <ThemedText style={styles.errorText}>{mediaError}</ThemedText>
            </View>
          ) : (
            <ScrollView style={styles.mediaGrid}>
              <View style={styles.mediaGridContent}>
                {mediaLibrary.map((item, index) => (
                  <TouchableOpacity
                    key={item.id || index}
                    style={styles.mediaItem}
                    onPress={() => handleImageSelect(item.url)}
                  >
                    <Image
                      source={{ uri: item.url }}
                      style={styles.mediaItemImage}
                      resizeMode="cover"
                    />
                  </TouchableOpacity>
                ))}
              </View>
            </ScrollView>
          )}
        </View>
      </View>
    );
  };

  // Move this function definition to the top of the component, after the state declarations
  const renderProModal = () => {
    if (!showProModal) return null;

    return (
      <View style={styles.modalOverlay}>
        <View style={styles.proModalContainer}>
          <View style={styles.proModalHeader}>
            <ThemedText style={styles.proModalTitle}>Pro Feature</ThemedText>
            <TouchableOpacity onPress={() => setShowProModal(false)}>
              <Ionicons name="close" size={24} color="#333" />
            </TouchableOpacity>
          </View>
          
          <View style={styles.proModalContent}>
            <Ionicons name="star" size={48} color="#FFD700" />
            <ThemedText style={styles.proModalText}>
              Bulk sharing is available with Pro account on web
            </ThemedText>
            <TouchableOpacity 
              style={styles.proModalButton}
              onPress={() => setShowProModal(false)}
            >
              <ThemedText style={styles.proModalButtonText}>Got it</ThemedText>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    );
  };

  // Modify the handleGenerateImage function
  const handleGenerateImage = () => {
    if (!currentTemplate) return;
    
    // Clear any previous errors and generated images
    dispatch(clearGeneratedImage());
    dispatch(generateImageFailure(null));
    
    // Check if template has any variables that need to be filled
    const hasRequiredVariables = currentTemplate.templateVariables.some(variable => {
      // Check if the variable is required (you may need to add this field in your template model)
      return variable.required && !templateVariables[variable.name];
    });

    if (hasRequiredVariables) {
      Toast.show({
        type: 'warning',
        text1: 'Missing Information',
        text2: 'Please fill in all required fields',
        position: 'bottom',
      });
      return;
    }
    
    // Create the payload with the proper structure
    const payload = {
      imageUrl: currentTemplate.url,
      mediaType: currentTemplate.mediaType || "image",
      textOverlays: currentTemplate.templateVariables
        .filter(variable => variable.name.toLowerCase() !== 'image')
        .map(variable => ({
          text: templateVariables[variable.name] || "", // Empty string if no value
          width: parseInt(variable.posWidth) || 300,
          height: parseInt(variable.posHeight) || 150,
          x: parseInt(variable.x) || 0,
          y: parseInt(variable.y) || 0,
          font: variable.font || "Arial",
          fontFamily: variable.fontFamily || "https://pingz.ai/api/template/fonts/Arial.ttf",
          fontSize: variable.fontSize || "30",
          color: variable.color || "#000000"
        })),
      imageOverlays: []
    };

    // Add image overlays if they exist
    const imageVariable = currentTemplate.templateVariables.find(
      variable => variable.name.toLowerCase() === 'image'
    );

    if (imageVariable && templateVariables['image']) {
      payload.imageOverlays.push({
        imageUrl: templateVariables['image'],
        width: parseInt(imageVariable.posWidth) || 0,
        height: parseInt(imageVariable.posHeight) || 0,
        x: parseInt(imageVariable.x) || 10,
        y: parseInt(imageVariable.y) || 10
      });
    }

    // Add header if checked and available
    if (addHeader && headerImage) {
      payload.header = headerImage;
      console.log('Adding header image:', headerImage);
    }
    
    // Add footer if checked and available
    if (addFooter && footerImage) {
      payload.footer = footerImage;
      console.log('Adding footer image:', footerImage);
    }
    
    console.log('Generate image payload:', JSON.stringify(payload, null, 2));
    
    dispatch(generateImage(payload))
      .catch(error => {
        console.error('Failed to generate image:', error);
      });
  };

  const handleDownload = async () => {
    const imageToDownload = generatedImage || currentTemplate?.url;
    
    if (!imageToDownload) {
      Toast.show({
        type: 'error',
        text1: 'No Image',
        text2: 'No image available to download',
        position: 'bottom',
      });
      return;
    }

    try {
      if (Platform.OS === 'web') {
        // Web download logic
        const link = document.createElement('a');
        link.href = imageToDownload;
        link.download = `pingz_${Date.now()}.png`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        
        Toast.show({
          type: 'success',
          text1: 'Success',
          text2: 'Image downloaded successfully',
          position: 'bottom',
        });
      } 
      else if (Platform.OS === 'ios' || Platform.OS === 'android') {
        // First check if we need storage permissions
        if (Platform.OS === 'android') {
          // On newer Android, we need storage permissions
          const { status } = await MediaLibrary.requestPermissionsAsync();
          if (status !== 'granted') {
            Toast.show({
              type: 'error',
              text1: 'Permission Required',
              text2: 'Please allow access to save images',
              position: 'bottom',
            });
            return;
          }
        }

        // On iOS we don't need permissions for this method
        
        // Alternative download approach for mobile
        try {
          // First download the image to cache
          const filename = `pingz_${Date.now()}.png`;
          let fileUri = '';
          
          if (imageToDownload.startsWith('data:')) {
            // Handle data URLs
            fileUri = FileSystem.cacheDirectory + filename;
            const base64Data = imageToDownload.split(',')[1];
            await FileSystem.writeAsStringAsync(fileUri, base64Data, {
              encoding: FileSystem.EncodingType.Base64,
            });
          } else {
            // Regular URL - download with specific options to avoid audio permissions
            const downloadOptions = {
              headers: {
                'Accept': 'image/png,image/jpeg',
                'Content-Type': 'image/png'
              }
            };
            
            const downloadResult = await FileSystem.downloadAsync(
              imageToDownload,
              FileSystem.cacheDirectory + filename,
              downloadOptions
            );
            
            if (downloadResult.status !== 200) {
              throw new Error('Download failed');
            }
            
            fileUri = downloadResult.uri;
          }
          
          // Now save to photo library using a different method
          const asset = await MediaLibrary.createAssetAsync(fileUri);
          
          // Delete the temporary file
          await FileSystem.deleteAsync(fileUri, { idempotent: true });
          
          Toast.show({
            type: 'success',
            text1: 'Success',
            text2: 'Image saved to gallery',
            position: 'bottom',
          });
        } catch (err) {
          console.error('Download error:', err);
          throw new Error('Failed to download image: ' + err.message);
        }
      }
    } catch (error) {
      console.error('Download error:', error);
      Toast.show({
        type: 'error',
        text1: 'Download Failed',
        text2: error.message || 'Failed to save image',
        position: 'bottom',
      });
    }
  };

  const handleShare = async () => {
    if (!generatedImage) {
      Toast.show({
        type: 'error',
        text1: 'No Image',
        text2: 'Please generate an image first',
        position: 'bottom',
      });
      return;
    }

    try {
      // For mobile platforms
      if (Platform.OS !== 'web') {
        let fileUri;
        
        try {
          // Handle data URLs
          if (generatedImage.startsWith('data:')) {
            // Create a temporary file from the data URL
            const base64Data = generatedImage.split(',')[1];
            const tempFilename = `${FileSystem.cacheDirectory}temp_share_${Date.now()}.png`;
            await FileSystem.writeAsStringAsync(tempFilename, base64Data, {
              encoding: FileSystem.EncodingType.Base64,
            });
            fileUri = tempFilename;
          } else {
            // Handle regular URLs
            const filename = `pingz_${Date.now()}.png`;
            const downloadUri = `${FileSystem.cacheDirectory}${filename}`;
            
            const downloadResult = await FileSystem.downloadAsync(
              generatedImage,
              downloadUri
            );

            if (downloadResult.status !== 200) {
              throw new Error('Failed to download image');
            }
            
            fileUri = downloadResult.uri;
          }

          // Check if sharing is available
          const isAvailable = await Sharing.isAvailableAsync();
          if (!isAvailable) {
            Toast.show({
              type: 'error',
              text1: 'Sharing Unavailable',
              text2: 'Sharing is not available on this device',
              position: 'bottom',
            });
            return;
          }

          // Share the local file
          await Sharing.shareAsync(fileUri, {
            mimeType: 'image/png',
            dialogTitle: 'Share Image',
            UTI: 'public.png' // This helps on iOS
          });
        } finally {
          // Clean up temporary file
          if (fileUri && fileUri.includes('temp_share_')) {
            try {
              await FileSystem.deleteAsync(fileUri);
            } catch (cleanupError) {
              console.error('Error cleaning up temp file:', cleanupError);
            }
          }
        }
      } else {
        // Web platform sharing
        if (navigator.share) {
          try {
            if (generatedImage.startsWith('data:')) {
              // Convert data URL to blob for web sharing
              const response = await fetch(generatedImage);
              const blob = await response.blob();
              const file = new File([blob], 'image.png', { type: 'image/png' });

              await navigator.share({
                title: 'Share Image',
                text: 'Check out this image!',
                files: [file]
              });
            } else {
              await navigator.share({
                title: 'Share Image',
                text: 'Check out this image!',
                url: generatedImage
              });
            }
          } catch (shareError) {
            console.error('Share error:', shareError);
            // Fallback to opening in new tab
            window.open(generatedImage, '_blank');
          }
        } else {
          // Fallback for browsers that don't support sharing
          window.open(generatedImage, '_blank');
        }
      }
    } catch (error) {
      console.error('Share error:', error);
      Toast.show({
        type: 'error',
        text1: 'Share Failed',
        text2: 'Failed to share image',
        position: 'bottom',
      });
    }
  };

  // Add this near the top of your component
  useEffect(() => {
    // Make sure Toast is properly loaded before configuring
    if (Toast && typeof Toast.show === 'function') {
      // Some versions of react-native-toast-message might not have setConfig
      // We can use the config prop when showing toasts instead
    }
  }, []);

  // Add retry mechanism for failed loads
  useEffect(() => {
    let retryCount = 0;
    const maxRetries = 3;
    
    const retryLoadImage = () => {
      if (retryCount < maxRetries && (generateImageError || !generatedImage)) {
        retryCount++;
        console.log(`Retrying image load attempt ${retryCount}`);
        handleGenerateImage();
      }
    };

    if (generateImageError) {
      // Wait 2 seconds before retrying
      const retryTimer = setTimeout(retryLoadImage, 2000);
      return () => clearTimeout(retryTimer);
    }
  }, [generateImageError]);

  // Add this effect to handle loading states
  useEffect(() => {
    // If we have a generated image or template URL and we're not generating,
    // ensure loading is false
    if ((generatedImage || currentTemplate?.url) && !generatingImage) {
      setImageLoading(false);
    }
  }, [generatedImage, currentTemplate?.url, generatingImage]);

  // Add timeout to force-clear loading state
  useEffect(() => {
    if (imageLoading) {
      // Force clear loading state after 10 seconds
      const timeoutId = setTimeout(() => {
        setImageLoading(false);
      }, 10000);

      return () => clearTimeout(timeoutId);
    }
  }, [imageLoading]);

  // Add this near the top of your component
  useEffect(() => {
    const handleError = (error: Error) => {
      console.error('Template Editor Error:', error);
      Toast.show({
        type: 'error',
        text1: 'Error',
        text2: 'Something went wrong. Please try again.',
        position: 'bottom',
      });
    };

    // Add error event listener
    if (Platform.OS === 'web') {
      window.addEventListener('error', handleError);
      return () => window.removeEventListener('error', handleError);
    }
  }, []);

  // Add better null checks for template variables
  const renderTemplateVariables = () => {
    if (!currentTemplate?.templateVariables) {
      return null;
    }

    return currentTemplate.templateVariables.map((variable, index) => (
      <View key={index} style={styles.formGroup}>
        <ThemedText style={styles.formLabel}>
          {toCamelCase(variable.name)}
        </ThemedText>
        {renderImageField(variable.name, variable.type)}
      </View>
    ));
  };

  // Main render
  if (!isInitialized || loading || !currentTemplate) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color="#8B3DFF" />
        <ThemedText style={styles.loadingText}>
          {!isInitialized ? 'Initializing...' : loading ? 'Loading template...' : 'Template not found'}
        </ThemedText>
      </View>
    );
  }

  return (
    <ThemedView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity 
          style={styles.backButton} 
          onPress={() => {
            // First check if we have a source parameter that indicates where we came from
            const source = params.source;
            
            // Check if we have search query parameters
            const searchQuery = params.searchQuery || params.query;
            const searchLabel = params.label;
            
            if (source === 'holiday') {
              // If we came from the holiday page, go back there
              router.push('/holiday');
            }
            else if (source === 'myTemplates') {
              // If we came from my templates page
              router.push('/myTemplates');
            }
            else if (source === 'whatsNew') {
              // If we came from what's new page
              router.push('/whatsNew');
            }
            else if (searchQuery) {
              // If we have search parameters, go back to activeTemplate with those parameters
              router.push({
                pathname: '/activeTemplate',
                params: { 
                  query: searchQuery,
                  label: searchLabel || searchQuery
                }
              });
            }
            // Otherwise use the existing category logic
            else if (category) {
              router.replace({
                pathname: '/templateCategories',
                params: { category }
              });
            } 
            // Default fallback
            else {
              router.back();
            }
          }}
        >
          <Ionicons name="arrow-back" size={24} color="#8B3DFF" />
        </TouchableOpacity>
        <ThemedText style={styles.headerTitle}>
          {toCamelCase(currentTemplate?.event || category || 'category')}
        </ThemedText>
      </View>
      
      {/* Main Content */}
      <ScrollView style={styles.scrollView}>
        {/* Preview Section */}
        <View style={styles.previewContainer}>
          <View style={styles.previewImageContainer}>
            <Image
              source={{ 
                uri: generatedImage || (currentTemplate?.url) || 'https://via.placeholder.com/300x500',
                headers: {
                  'Cache-Control': 'no-cache',
                  'Pragma': 'no-cache'
                },
                cache: Platform.OS === 'web' ? 'reload' : 'default'
              }}
              style={styles.previewImage}
              resizeMode="contain"
              onLoadStart={() => {
                setImageLoading(true);
                // Reset error state when starting new load
                if (generateImageError) {
                  dispatch(generateImageFailure(null));
                }
              }}
              onLoad={() => {
                setImageLoading(false);
              }}
              onError={(error) => {
                console.error('Image load error:', error);
                setImageLoading(false);
                Toast.show({
                  type: 'error',
                  text1: 'Image Load Error',
                  text2: 'Failed to load image. Please try again.',
                  position: 'bottom',
                });
              }}
            />
            
            {/* Only show loading overlay when actually loading */}
            {((imageLoading && !generatedImage) || generatingImage) && (
              <View style={styles.loadingOverlay}>
                <ActivityIndicator size="large" color="#8B3DFF" />
                <ThemedText style={styles.loadingText}>
                  {generatingImage ? 'Generating image...' : 'Loading image...'}
                </ThemedText>
              </View>
            )}

            {/* Only show error if it's current */}
            {generateImageError && !imageLoading && (
              <View style={styles.errorContainer}>
                <ThemedText style={styles.errorText}>{generateImageError}</ThemedText>
              </View>
            )}
          </View>
          
          {/* Action buttons fixed at the bottom */}
          <View style={styles.previewActionsContainer}>
            <TouchableOpacity 
              style={styles.generateButton} 
              onPress={handleGenerateImage}
            >
              <ThemedText style={styles.generateButtonText}>Preview Image</ThemedText>
            </TouchableOpacity>

            {/* Action Icons */}
            <View style={styles.actionIcons}>
              <TouchableOpacity 
                style={[
                  styles.iconButton,
                  (!generatedImage && !currentTemplate?.url) && styles.iconButtonDisabled
                ]} 
                onPress={handleDownload}
                disabled={!generatedImage && !currentTemplate?.url}
              >
                <Ionicons 
                  name="download-outline" 
                  size={24} 
                  color={(generatedImage || currentTemplate?.url) ? "#8B3DFF" : "#CCCCCC"} 
                />
              </TouchableOpacity>
              
              <TouchableOpacity 
                style={[
                  styles.iconButton,
                  (!generatedImage && !currentTemplate?.url) && styles.iconButtonDisabled
                ]} 
                onPress={handleShare}
                disabled={!generatedImage && !currentTemplate?.url}
              >
                <Ionicons 
                  name="share-social-outline" 
                  size={24} 
                  color={(generatedImage || currentTemplate?.url) ? "#8B3DFF" : "#CCCCCC"} 
                />
              </TouchableOpacity>
              
              <TouchableOpacity style={styles.iconButton} onPress={() => setShowProModal(true)}>
                <Ionicons name="albums-outline" size={24} color="#8B3DFF" />
              </TouchableOpacity>
            </View>
          </View>
        </View>
        
        {/* Template Variables Form */}
        <View style={styles.formContainer}>
          <ThemedText style={styles.formTitle}>Customize Template</ThemedText>
          
          {renderTemplateVariables()}
          
          {/* Header & Footer Options */}
          <View style={styles.optionsContainer}>
            <View style={styles.checkboxContainer}>
              <Switch
                value={addHeader}
                onValueChange={setAddHeader}
                trackColor={{ false: "#767577", true: "#8B3DFF" }}
                thumbColor={addHeader ? "#ffffff" : "#f4f3f4"}
              />
              <ThemedText style={styles.checkboxLabel}>Add header</ThemedText>
            </View>
            
            <View style={styles.checkboxContainer}>
              <Switch
                value={addFooter}
                onValueChange={setAddFooter}
                trackColor={{ false: "#767577", true: "#8B3DFF" }}
                thumbColor={addFooter ? "#ffffff" : "#f4f3f4"}
              />
              <ThemedText style={styles.checkboxLabel}>Add footer</ThemedText>
            </View>
          </View>
          
          {/* Show header/footer image previews */}
          {(addHeader || addFooter) && (
            <View style={styles.previewImagesContainer}>
              <View style={styles.previewImagesRow}>
                {addHeader && headerImage && (
                  <View style={styles.previewImageWrapper}>
                    <ThemedText style={styles.previewImageLabel}>Header Image Preview</ThemedText>
                    <Image 
                      source={{ uri: headerImage }} 
                      style={styles.previewHeaderFooterImage} 
                      resizeMode="cover"
                    />
                  </View>
                )}
                
                {addFooter && footerImage && (
                  <View style={styles.previewImageWrapper}>
                    <ThemedText style={styles.previewImageLabel}>Footer Image Preview</ThemedText>
                    <Image 
                      source={{ uri: footerImage }} 
                      style={styles.previewHeaderFooterImage} 
                      resizeMode="cover"
                    />
                  </View>
                )}
              </View>
            </View>
          )}
        </View>
        
        {/* Similar Templates Section */}
        <View style={styles.templatesScrollContainer}>
          <ThemedText style={styles.similarTemplatesTitle}>Similar Templates</ThemedText>
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            {templates.map((template) => (
              <TouchableOpacity 
                key={template.id} 
                style={[
                  styles.scrollTemplate,
                  template.id === templateId && styles.selectedScrollTemplate
                ]}
                onPress={() => router.replace(`/template-editor/${template.id}`)}
              >
                <Image
                  source={{ uri: template.url || 'https://via.placeholder.com/150' }}
                  style={styles.scrollTemplateImage}
                  resizeMode="cover"
                />
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>
      </ScrollView>
      
      {renderMediaLibrary()}

      {showDownloadSuccess && (
        <View style={{
          position: 'absolute',
          bottom: 20,
          left: 0,
          right: 0,
          alignItems: 'center',
          zIndex: 9999,
        }}>
          <View style={{
            backgroundColor: '#4CAF50',
            paddingVertical: 10,
            paddingHorizontal: 20,
            borderRadius: 25,
            flexDirection: 'row',
            alignItems: 'center',
          }}>
            <Ionicons name="checkmark-circle" size={24} color="white" />
            <ThemedText style={{ color: 'white', marginLeft: 10, fontWeight: 'bold' }}>
              Image saved to gallery
            </ThemedText>
          </View>
        </View>
      )}

      {showPermissionError && (
        <View style={{
          position: 'absolute',
          bottom: 20,
          left: 0,
          right: 0,
          alignItems: 'center',
          zIndex: 9999,
        }}>
          <View style={{
            backgroundColor: '#FF5252',
            paddingVertical: 10,
            paddingHorizontal: 20,
            borderRadius: 25,
            flexDirection: 'row',
            alignItems: 'center',
          }}>
            <Ionicons name="alert-circle" size={24} color="white" />
            <ThemedText style={{ color: 'white', marginLeft: 10, fontWeight: 'bold' }}>
              Permission required to save images
            </ThemedText>
          </View>
        </View>
      )}

      {renderProModal()}
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  scrollView: {
    flex: 1,
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingTop: 10,
    paddingBottom: 10,
    backgroundColor: '#fff',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
  },
  backButton: {
    padding: 8,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginLeft: 16,
    color: '#333',
  },
  previewContainer: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    margin: 16,
    height: 380,
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'space-between',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  previewImageContainer: {
    width: '100%',
    height: 250,
    position: 'relative',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f5f7fa',
  },
  previewImage: {
    width: '100%',
    height: '100%',
    objectFit: 'contain',
  },
  formContainer: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 20,
    margin: 16,
    marginTop: 0,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  formTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 20,
    color: '#333',
  },
  formGroup: {
    marginBottom: 16,
  },
  formLabel: {
    fontSize: 14,
    marginBottom: 8,
    color: '#555',
    fontWeight: '500',
  },
  formInput: {
    backgroundColor: '#f5f7fa',
    borderWidth: 1,
    borderColor: '#e0e4e8',
    borderRadius: 8,
    padding: 14,
    fontSize: 16,
  },
  noVariablesText: {
    fontSize: 14,
    color: '#666',
    fontStyle: 'italic',
    marginVertical: 20,
    textAlign: 'center',
  },
  generateButton: {
    width: '85%',
    margin: 'auto',
    backgroundColor: '#8B3DFF',
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
    marginBottom: 6,
    elevation: 2,
  },
  generateButtonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
  },
  templatesScrollContainer: {
    backgroundColor: '#fff',
    paddingVertical: 16,
    paddingHorizontal: 16,
    borderTopWidth: 1,
    borderTopColor: '#e0e4e8',
  },
  similarTemplatesTitle: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 12,
    color: '#333',
  },
  scrollTemplate: {
    width: 80,
    height: 80,
    marginRight: 12,
    borderRadius: 10,
    overflow: 'hidden',
    borderWidth: 2,
    borderColor: 'transparent',
  },
  selectedScrollTemplate: {
    borderColor: '#8B3DFF',
  },
  scrollTemplateImage: {
    width: '100%',
    height: '100%',
  },
  loadingText: {
    marginTop: 12,
    fontSize: 16,
    color: '#666',
  },
  errorText: {
    color: '#ff4444',
    textAlign: 'center',
    fontSize: 16,
    fontWeight: '500',
  },
  retryButton: {
    marginTop: 16,
    paddingVertical: 10,
    paddingHorizontal: 20,
    backgroundColor: '#8B3DFF',
    borderRadius: 8,
  },
  retryText: {
    color: '#fff',
    fontWeight: '600',
  },
  loadingOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    zIndex: 5,
  },
  errorContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    padding: 20,
  },
  imageFieldContainer: {
    minHeight: 120,
    borderRadius: 8,
    overflow: 'hidden',
  },
  selectMediaButton: {
    backgroundColor: '#f5f7fa',
    borderWidth: 1,
    borderColor: '#e0e4e8',
    borderRadius: 8,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 120,
  },
  selectMediaText: {
    marginLeft: 8,
    fontSize: 16,
    color: '#8B3DFF',
    fontWeight: '500',
  },
  selectedImageContainer: {
    position: 'relative',
    borderRadius: 8,
    overflow: 'hidden',
  },
  selectedImage: {
    width: '100%',
    height: 120,
    borderRadius: 8,
  },
  imageActions: {
    position: 'absolute',
    bottom: 8,
    right: 8,
    flexDirection: 'row',
  },
  imageActionButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'white',
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
    elevation: 3,
  },
  deleteButton: {
    backgroundColor: '#FFE5E5',
  },
  modalOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: 'white',
    borderRadius: 12,
    width: '90%',
    height: '80%',
    padding: 16,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  mediaLoadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  mediaGrid: {
    flex: 1,
  },
  mediaGridContent: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    padding: 8,
  },
  mediaItem: {
    width: '33.33%',
    aspectRatio: 1,
    padding: 4,
  },
  mediaItemImage: {
    width: '100%',
    height: '100%',
    borderRadius: 8,
    backgroundColor: '#f5f7fa',
  },
  mediaErrorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  actionIcons: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    width: '100%',
  },
  iconButton: {
    padding: 8,
    borderRadius: 20,
    backgroundColor: '#F8F9FA',
    marginHorizontal: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  iconButtonDisabled: {
    backgroundColor: '#F0F0F0',
    shadowOpacity: 0,
    elevation: 0,
  },
  checkboxContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 16,
  },
  checkboxLabel: {
    marginLeft: 8,
    fontSize: 14,
    color: '#555',
  },
  optionsContainer: {
    flexDirection: 'row',
    marginBottom: 16,
    marginTop: 4,
  },
  previewImagesContainer: {
    marginBottom: 16,
    marginTop: 8,
  },
  previewImagesRow: {
    flexDirection: 'row',
    justifyContent: 'flex-start',
    flexWrap: 'wrap',
  },
  previewImageWrapper: {
    marginRight: 16,
    marginBottom: 16,
    flex: 1,
    maxWidth: '45%',
  },
  previewImageLabel: {
    fontSize: 14,
    fontWeight: '500',
    marginBottom: 8,
    color: '#555',
  },
  previewHeaderFooterImage: {
    width: '100%',
    aspectRatio: 1,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#e0e4e8',
  },
  previewActionsContainer: {
    width: '100%',
    minHeight: 80,
    marginTop: 'auto',
    paddingTop: 10,
  },
  photoUploadContainer: {
    backgroundColor: '#f5f7fa',
    borderWidth: 1,
    borderColor: '#e0e4e8',
    borderRadius: 8,
    padding: 16,
    minHeight: 200,
  },
  uploadButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#fff',
    padding: 16,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#e0e4e8',
    marginVertical: 8,
  },
  uploadButtonText: {
    marginLeft: 8,
    fontSize: 16,
    color: '#8B3DFF',
    fontWeight: '500',
  },
  orDivider: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 16,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: '#e0e4e8',
  },
  orText: {
    marginHorizontal: 16,
    color: '#666',
    fontSize: 14,
  },
  proModalContainer: {
    backgroundColor: 'white',
    borderRadius: 16,
    width: '80%',
    maxWidth: 320,
    padding: 24,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  proModalHeader: {
    width: '100%',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  proModalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
  },
  proModalContent: {
    alignItems: 'center',
    paddingVertical: 16,
  },
  proModalText: {
    fontSize: 16,
    textAlign: 'center',
    marginTop: 16,
    marginBottom: 24,
    color: '#666',
    lineHeight: 22,
  },
  proModalButton: {
    backgroundColor: '#8B3DFF',
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
    minWidth: 120,
    alignItems: 'center',
  },
  proModalButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
}); 