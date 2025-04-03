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

  // Add user data state to store header/footer images
  const userData = useSelector((state: RootState) => state.account.userData);
  console.log('userData----', userData);

  // Add this to track where we came from
  const category = currentTemplate?.category || params.category;

  // Initial data fetching
  useEffect(() => {
    dispatch(fetchTemplateById(templateId));
    dispatch(fetchUserData());
    if (currentTemplate?.event) {
      dispatch(fetchTemplatesByCategory(currentTemplate.event));
    }
  }, [templateId, dispatch]);
  
  // Reset form when template changes
  useEffect(() => {
    if (currentTemplate && currentTemplate.templateVariables) {
      resetForm();
    }
  }, [currentTemplate]);

  // Reset when navigating back
  useEffect(() => {
    if (clearGeneratedImage) {
      dispatch(clearGeneratedImage());
    }
    resetForm();
    dispatch(fetchTemplateById(templateId));
  }, [templateId]);

  // Initialize header/footer images from user data with the correct property names
  useEffect(() => {
    if (userData) {
      // Use the correct property names from userData
      setHeaderImage(userData.header || null);
      setFooterImage(userData.footer || null);
    }
  }, [userData]);

  // Media handlers
  const handleSelectMedia = () => {
    setIsMediaLibraryOpen(true);
    dispatch(fetchMediaLibrary()); // Use the Redux thunk directly
  };

  const handleCloseMediaLibrary = () => {
    setIsMediaLibraryOpen(false);
  };

  const handleImageSelect = (imageUrl: string) => {
    setSelectedImage(imageUrl);
    // Make sure to include any position data from the template variable
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

  // Image field renderer
  const renderImageField = (variable: string) => {
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

  // Modify the handleGenerateImage function to include header/footer
  const handleGenerateImage = () => {
    if (!currentTemplate) return;
    
    // Create the payload with the proper structure
    const payload = {
      imageUrl: currentTemplate.url,
      mediaType: currentTemplate.mediaType || "image",
      textOverlays: currentTemplate.templateVariables
        .filter(variable => variable.name.toLowerCase() !== 'image')
        .map(variable => ({
          text: templateVariables[variable.name] || "",
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
      if (Platform.OS === 'web') {
        // Web download logic
        const response = await fetch(generatedImage);
        const blob = await response.blob();
        const blobUrl = URL.createObjectURL(blob);
        
        const link = document.createElement('a');
        link.href = blobUrl;
        link.download = `pingz_${Date.now()}.png`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(blobUrl);
        
        Toast.show({
          type: 'success',
          text1: 'Success',
          text2: 'Image downloaded successfully',
          position: 'bottom',
        });
      } 
      else if (Platform.OS === 'ios') {
        // iOS-specific download logic
        const { status } = await MediaLibrary.requestPermissionsAsync();
        
        if (status !== 'granted') {
          Toast.show({
            type: 'error',
            text1: 'Permission Required',
            text2: 'Please grant media library permissions to save images',
            position: 'bottom',
          });
          return;
        }

        // Create a temporary file
        const filename = `pingz_${Date.now()}.png`;
        const fileUri = `${FileSystem.cacheDirectory}${filename}`;

        // Download or write the file
        if (generatedImage.startsWith('data:')) {
          const base64Data = generatedImage.split(',')[1];
          await FileSystem.writeAsStringAsync(fileUri, base64Data, {
            encoding: FileSystem.EncodingType.Base64,
          });
        } else {
          const downloadResult = await FileSystem.downloadAsync(
            generatedImage,
            fileUri
          );

          if (downloadResult.status !== 200) {
            throw new Error('Failed to download image');
          }
        }

        // On iOS, simply save to gallery without album creation
        await MediaLibrary.saveToLibraryAsync(fileUri);
        
        // Cleanup
        try {
          await FileSystem.deleteAsync(fileUri);
        } catch (cleanupError) {
          console.error('Cleanup error:', cleanupError);
        }
        
        // Show success toast
        Toast.show({
          type: 'success',
          text1: 'Success',
          text2: 'Image saved to gallery',
          position: 'bottom',
        });
      }
      else if (Platform.OS === 'android') {
        // Android-specific download logic
        const { status } = await MediaLibrary.requestPermissionsAsync();
        
        if (status !== 'granted') {
          // Use the custom success/error UI instead of Toast
          setShowPermissionError(true);
          setTimeout(() => {
            setShowPermissionError(false);
          }, 3000);
          return;
        }

        // Create a temporary file
        const filename = `pingz_${Date.now()}.png`;
        const fileUri = `${FileSystem.cacheDirectory}${filename}`;

        // Download or write the file
        if (generatedImage.startsWith('data:')) {
          const base64Data = generatedImage.split(',')[1];
          await FileSystem.writeAsStringAsync(fileUri, base64Data, {
            encoding: FileSystem.EncodingType.Base64,
          });
        } else {
          const downloadResult = await FileSystem.downloadAsync(
            generatedImage,
            fileUri
          );

          if (downloadResult.status !== 200) {
            throw new Error('Failed to download image');
          }
        }

        // Save to media library - store the result in a variable
        const asset = await MediaLibrary.createAssetAsync(fileUri);
        
        // Show the custom success UI instead of Toast
        setShowDownloadSuccess(true);
        console.log("Download success message showing now");
        
        // Try to create album in the background
        try {
          MediaLibrary.getAlbumAsync('Pingz')
            .then(album => {
              if (album === null) {
                return MediaLibrary.createAlbumAsync('Pingz', asset, false);
              } else {
                return MediaLibrary.addAssetsToAlbumAsync([asset], album, false);
              }
            })
            .catch(error => {
              console.log("Album creation error (ignored):", error);
            });
        } catch (albumError) {
          console.log("Album creation outer error (ignored):", albumError);
        }

        // Cleanup the temporary file
        try {
          await FileSystem.deleteAsync(fileUri);
        } catch (cleanupError) {
          console.error('Cleanup error:', cleanupError);
        }

        // After 3 seconds, hide the indicator
        setTimeout(() => {
          setShowDownloadSuccess(false);
        }, 3000);
      }
    } catch (error) {
      console.error('Download error:', error);
      Toast.show({
        type: 'error',
        text1: 'Download Failed',
        text2: 'Failed to save image',
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

  // Loading and error states
  if (loading) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color="#8B3DFF" />
        <ThemedText style={styles.loadingText}>Loading template...</ThemedText>
      </View>
    );
  }
  
  if (error || !currentTemplate) {
    return (
      <View style={styles.centerContainer}>
        <Ionicons name="warning" size={48} color="#ff4444" />
        <ThemedText style={styles.errorText}>
          {error || 'Failed to load template'}
        </ThemedText>
        <TouchableOpacity 
          style={styles.retryButton} 
          onPress={() => dispatch(fetchTemplateById(templateId))}
        >
          <ThemedText style={styles.retryText}>Retry</ThemedText>
        </TouchableOpacity>
      </View>
    );
  }
  
  // Main render
  return (
    <ThemedView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity 
          style={styles.backButton} 
          onPress={() => {
            if (category) {
              // Navigate back to template categories with the correct category
              router.replace({
                pathname: '/templateCategories',
                params: { category }
              });
            } else {
              // Fallback to normal back behavior
              router.back();
            }
          }}
        >
          <Ionicons name="arrow-back" size={24} color="#8B3DFF" />
        </TouchableOpacity>
        <ThemedText style={styles.headerTitle}>{currentTemplate.templateName}</ThemedText>
      </View>
      
      {/* Main Content */}
      <ScrollView style={styles.scrollView}>
        {/* Preview Section */}
        <View style={styles.previewContainer}>
          <View style={styles.previewImageContainer}>
            {generatingImage ? (
              <View style={styles.loadingOverlay}>
                <ActivityIndicator size="large" color="#8B3DFF" />
                <ThemedText style={styles.loadingText}>Generating image...</ThemedText>
              </View>
            ) : generatedImage ? (
              <Image
                source={{ uri: generatedImage }}
                style={styles.previewImage}
                resizeMode="contain"
              />
            ) : (
              <Image
                source={{ uri: currentTemplate.url || 'https://via.placeholder.com/300x500' }}
                style={styles.previewImage}
                resizeMode="contain"
              />
            )}
            
            {generateImageError && (
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
              <ThemedText style={styles.generateButtonText}>Generate Image</ThemedText>
            </TouchableOpacity>

            {/* Action Icons */}
            <View style={styles.actionIcons}>
              <TouchableOpacity 
                style={[
                  styles.iconButton,
                  !generatedImage && styles.iconButtonDisabled
                ]} 
                onPress={handleDownload}
                disabled={!generatedImage}
              >
                <Ionicons 
                  name="download-outline" 
                  size={24} 
                  color={generatedImage ? "#8B3DFF" : "#CCCCCC"} 
                />
              </TouchableOpacity>
              
              <TouchableOpacity 
                style={[
                  styles.iconButton,
                  !generatedImage && styles.iconButtonDisabled
                ]} 
                onPress={handleShare}
                disabled={!generatedImage}
              >
                <Ionicons 
                  name="share-social-outline" 
                  size={24} 
                  color={generatedImage ? "#8B3DFF" : "#CCCCCC"} 
                />
              </TouchableOpacity>
              
              <TouchableOpacity style={styles.iconButton} onPress={() => console.log('Bulk')}>
                <Ionicons name="albums-outline" size={24} color="#8B3DFF" />
              </TouchableOpacity>
            </View>
          </View>
        </View>
        
        {/* Template Variables Form */}
        <View style={styles.formContainer}>
          <ThemedText style={styles.formTitle}>Customize Template</ThemedText>
          
          {currentTemplate.templateVariables?.map((variable, index) => (
            <View key={index} style={styles.formGroup}>
              <ThemedText style={styles.formLabel}>{variable.name}</ThemedText>
              {renderImageField(variable.name)}
            </View>
          ))}
          
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
    marginTop: 16,
    fontSize: 16,
    color: '#666',
  },
  errorText: {
    marginTop: 16,
    fontSize: 16,
    color: '#ff4444',
    textAlign: 'center',
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
    backgroundColor: 'rgba(255, 255, 255, 0.8)',
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
    backgroundColor: 'rgba(255, 255, 255, 0.8)',
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
}); 