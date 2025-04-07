import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Platform } from 'react-native';
import { 
  fetchTemplatesStart, 
  fetchTemplatesSuccess, 
  fetchTemplatesFailure,
  fetchTemplateByIdStart,
  fetchTemplateByIdSuccess,
  fetchTemplateByIdFailure,
  generateImageStart,
  generateImageSuccess,
  generateImageFailure,
  fetchMediaStart,
  fetchMediaSuccess,
  fetchMediaFailure,
  fetchCategoriesStart,
  fetchCategoriesSuccess,
  fetchCategoriesFailure,
  CategoryResponse
} from './templateSlice';
import { AppDispatch } from '@/src/store';
import api from '@/src/services/api';
import Toast from 'react-native-toast-message';


const IMAGE_API_URL = 'https://pingz.ai/api/render/api/image/overlay-text';
const TOKEN_KEY = 'token';
const CORS_PROXY = 'https://corsproxy.io/?';

// Updated approach using icon library mappings
// This assumes we're using icons from libraries like Ionicons (currently in your code)
// but the approach works similarly with Lucide icons

// Define icon categories for semantic matching
const iconMappings = {
  // Events and occasions
  'anniversary': 'heart',
  'birthday': 'gift',
  'wedding': 'heart-circle',
  'graduation': 'school',
  'celebration': 'sparkles',
  'party': 'sparkles',
  'holiday': 'gift',
  'festival': 'sparkles',
  'occasion': 'calendar',
  'event': 'calendar',
  'ceremony': 'ribbon',
  
  // Business and marketing
  'marketing': 'megaphone',
  'business': 'briefcase',
  'corporate': 'business',
  'professional': 'briefcase',
  'ecommerce': 'cart',
  'shop': 'cart',
  'store': 'cart',
  'sales': 'cash',
  'finance': 'cash',
  'investment': 'trending-up',
  
  // Food and dining
  'food': 'restaurant',
  'restaurant': 'restaurant',
  'dining': 'restaurant',
  'cuisine': 'restaurant',
  'cooking': 'restaurant',
  'bakery': 'cafe',
  'cafe': 'cafe',
  
  // Fashion and appearance
  'fashion': 'shirt',
  'clothing': 'shirt',
  'style': 'shirt',
  'outfit': 'shirt',
  'accessories': 'glasses',
  'beauty': 'brush',
  
  // Travel and transport
  'travel': 'airplane',
  'tourism': 'airplane',
  'vacation': 'airplane',
  'trip': 'airplane',
  'auto': 'car',
  'vehicle': 'car',
  'automotive': 'car',
  'transport': 'car',
  
  // Communication
  'invitation': 'mail',
  'invite': 'mail',
  'announcement': 'mail',
  'message': 'mail',
  'communication': 'chatbubbles',
  'social': 'people',
  'community': 'people',
  
  // Education and knowledge
  'education': 'school',
  'learning': 'school',
  'academic': 'school',
  'training': 'book',
  'workshop': 'build',
  
  // Health and wellness
  'health': 'fitness',
  'medical': 'medkit',
  'wellness': 'fitness',
  'fitness': 'barbell',
  'exercise': 'barbell',
  'yoga': 'body',
  
  // Arts and entertainment
  'art': 'color-palette',
  'design': 'brush',
  'creative': 'color-palette',
  'music': 'musical-notes',
  'entertainment': 'film',
  'movie': 'film',
  'game': 'game-controller',
  'gaming': 'game-controller',
  'photography': 'camera',
  
  // Other categories
  'nature': 'leaf',
  'environment': 'leaf',
  'technology': 'hardware-chip',
  'tech': 'hardware-chip',
  'digital': 'hardware-chip',
  'sports': 'basketball',
  'religious': 'book',
  'spiritual': 'book',
  'charity': 'heart',
  'nonprofit': 'people',
  
  // Special categories
  'thank': 'thumbs-up',
  'appreciation': 'thumbs-up',
  'trending': 'trending-up',
  'popular': 'trending-up',
  'recommended': 'star',
  'featured': 'star',
  'new': 'sparkles',
};

// Color palette with semantic associations
const colorCategories = {
  love: ['#FF3366', '#FF6B81', '#FF4757', '#FF6B6B'],
  nature: ['#2ECC71', '#26de81', '#20bf6b', '#2ed573'],
  business: ['#3498DB', '#0984e3', '#1e3799', '#4a69bd'],
  food: ['#FF9933', '#FF6600', '#FF7F50', '#FFA07A'],
  creativity: ['#9C27B0', '#6C5CE7', '#8E44AD', '#A29BFE'],
  technology: ['#34495E', '#2c3e50', '#57606f', '#747d8c'],
  celebration: ['#F1C40F', '#feca57', '#ffdd59', '#FFCD00'],
  health: ['#00CC99', '#1abc9c', '#16a085', '#55efc4'],
  communication: ['#00BCD4', '#81ecec', '#00cec9', '#34e7e4'],
  default: ['#607D8B', '#7f8c8d', '#95a5a6', '#b2bec3']
};

// Map categories to color groups
const categoryColorAssociations = {
  // Love/Emotion
  'anniversary': 'love',
  'wedding': 'love',
  'heart': 'love',
  'flirt': 'love',
  'valentine': 'love',
  
  // Nature
  'environment': 'nature',
  'garden': 'nature',
  'plant': 'nature',
  'eco': 'nature',
  'outdoor': 'nature',
  
  // Business
  'professional': 'business',
  'corporate': 'business',
  'marketing': 'business',
  'finance': 'business',
  'ecommerce': 'business',
  'commerce': 'business',
  'sales': 'business',
  
  // Food
  'restaurant': 'food',
  'dining': 'food',
  'cuisine': 'food',
  'cafe': 'food',
  'bakery': 'food',
  'cooking': 'food',
  
  // Creativity
  'design': 'creativity',
  'art': 'creativity',
  'music': 'creativity',
  'creative': 'creativity',
  'photography': 'creativity',
  
  // Technology
  'tech': 'technology',
  'digital': 'technology',
  'software': 'technology',
  'electronic': 'technology',
  'gadget': 'technology',
  
  // Celebration
  'birthday': 'celebration',
  'party': 'celebration',
  'festival': 'celebration',
  'holiday': 'celebration',
  'event': 'celebration',
  
  // Health
  'fitness': 'health',
  'wellness': 'health',
  'medical': 'health',
  'exercise': 'health',
  'yoga': 'health',
  
  // Communication
  'invitation': 'communication',
  'message': 'communication',
  'mail': 'communication',
  'contact': 'communication',
  'email': 'communication'
};

// Enhanced function that finds the most appropriate icon and semantically relevant color
const getCategoryIconData = (categoryName: string) => {
  if (!categoryName) return { icon: 'apps', color: colorCategories.default[0] };
  
  // Normalize the category name
  const normalizedName = categoryName.toLowerCase().trim();
  const words = normalizedName.split(/[\s_-]+/);
  
  // Find the most appropriate icon
  let iconFound = false;
  let iconName = '';
  
  // 1. Try to find direct matches for the whole category name
  if (iconMappings[normalizedName]) {
    iconName = iconMappings[normalizedName];
    iconFound = true;
  }
  
  // 2. If not found, try to match with individual words
  if (!iconFound) {
    for (const word of words) {
      if (iconMappings[word]) {
        iconName = iconMappings[word];
        iconFound = true;
        break;
      }
    }
  }
  
  // 3. If still not found, try partial matching
  if (!iconFound) {
    // Sort the keys by length (descending) to match the most specific keys first
    const sortedKeys = Object.keys(iconMappings).sort((a, b) => b.length - a.length);
    
    for (const key of sortedKeys) {
      if (normalizedName.includes(key)) {
        iconName = iconMappings[key];
        iconFound = true;
        break;
      }
    }
  }
  
  // If no icon found, use default
  if (!iconFound) {
    iconName = 'apps';
  }
  
  // Find the most appropriate color category
  let colorCategory = 'default';
  
  // Try to find direct matches for color association
  for (const word of words) {
    if (categoryColorAssociations[word]) {
      colorCategory = categoryColorAssociations[word];
      break;
    }
  }
  
  // If no direct match, try partial matching
  if (colorCategory === 'default') {
    for (const key in categoryColorAssociations) {
      if (normalizedName.includes(key)) {
        colorCategory = categoryColorAssociations[key];
        break;
      }
    }
  }
  
  // Get a color from the appropriate category - use the hash of the category name to get consistent color
  const colorOptions = colorCategories[colorCategory];
  const hashCode = normalizedName.split('').reduce((a, b) => {
    a = ((a << 5) - a) + b.charCodeAt(0);
    return a & a;
  }, 0);
  
  const colorIndex = Math.abs(hashCode) % colorOptions.length;
  const color = colorOptions[colorIndex];
  
  return { icon: iconName, color };
};

// Template category
export const fetchTemplatesByCategory = (categoryName: string) => {
  return async (dispatch: AppDispatch) => {
    try {
      dispatch(fetchTemplatesStart(categoryName));
      
      const formattedCategory = categoryName.toLowerCase().replace(/\s+/g, '-');
      const response = await api.get(`/template/event/${formattedCategory}`, {
        timeout: 30000,
        headers: {
          'Authorization': `Bearer ${await AsyncStorage.getItem('token')}`
        }
      });
      
      dispatch(fetchTemplatesSuccess(response.data));
      return response.data;
    } catch (error) {
      console.error('Template fetch error:', error);
      
      let errorMessage = 'Failed to fetch templates';
      
      if (error.code === 'ECONNABORTED' || error.message.includes('timeout')) {
        errorMessage = 'Request timed out. Please check your connection and try again.';
      } else if (error.response) {
        errorMessage = `Error ${error.response.status}: ${error.response.data?.message || 'Server error'}`;
      } else if (error.request) {
        errorMessage = 'No response from server. Please check your connection.';
      } else if (error instanceof Error) {
        errorMessage = error.message;
      }
      
      Toast.show({
        type: 'error',
        text1: 'Loading Error',
        text2: errorMessage,
        position: 'bottom',
      });
      
      dispatch(fetchTemplatesFailure(errorMessage));
      throw error;
    }
  };
};

// Single template
export const fetchTemplateById = (templateId: string) => {
  return async (dispatch: AppDispatch) => {
    try {
      dispatch(fetchTemplateByIdStart());
      
      const response = await api.get(`/template/${templateId}`);
      
      dispatch(fetchTemplateByIdSuccess(response.data));
      return response.data;
    } catch (error) {
      const errorMessage = getErrorMessage(error);
      dispatch(fetchTemplateByIdFailure(errorMessage));
      throw error;
    }
  };
};

// Generate image
export const generateImage = (payload) => {
  return async (dispatch: AppDispatch) => {
    try {
      dispatch(generateImageStart());

      console.log('API Payload:', JSON.stringify(payload, null, 2));

      // Different handling for web and mobile platforms
      if (Platform.OS === 'web') {
        const response = await api.post('render/api/image/overlay-text', payload, {
          headers: {
            'Accept': 'image/png;base64',
            'Content-Type': 'application/json'
          },
          responseType: 'blob'
        });
        const imageUrl = URL.createObjectURL(response.data);
        dispatch(generateImageSuccess(imageUrl));
        return imageUrl;
      } else {
        // For mobile platforms, request base64 data
        const response = await api.post('render/api/image/overlay-text', payload, {
          headers: {
            'Accept': 'image/png;base64',
            'Content-Type': 'application/json'
          },
          responseType: 'arraybuffer'
        });

        // Convert array buffer to base64
        const bytes = new Uint8Array(response.data);
        let binary = '';
        bytes.forEach(byte => binary += String.fromCharCode(byte));
        const base64Data = btoa(binary);
        
        const imageUrl = `data:image/png;base64,${base64Data}`;
        dispatch(generateImageSuccess(imageUrl));
        return imageUrl;
      }

    } catch (error) {
      console.error('Generate image error:', error);
      const errorMessage = getErrorMessage(error);
      Toast.show({
        type: 'error',
        text1: 'Image Generation Failed',
        text2: errorMessage,
        position: 'bottom',
      });
      dispatch(generateImageFailure(errorMessage));
      throw error;
    }
  };
};

// Media library
export const fetchMediaLibrary = () => {
  return async (dispatch: AppDispatch) => {
    try {
      dispatch(fetchMediaStart());
      
      const response = await api.get('/template/api/media');
      
      dispatch(fetchMediaSuccess(response.data));
      return response.data;
    } catch (error) {
      console.error('Media fetch error:', error);
      const errorMessage = getErrorMessage(error);
      dispatch(fetchMediaFailure(errorMessage));
      throw error;
    }
  };
};

// Add this to your existing thunks
export const fetchCategories = () => {
  return async (dispatch: AppDispatch) => {
    try {
      dispatch(fetchCategoriesStart());
      
      const token = await AsyncStorage.getItem('token');
      if (!token) {
        throw new Error('Authentication token not found');
      }

      const response = await api.get('/template/event', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      // Transform the API response to include icons and colors
      const categoriesWithIcons = response.data.map((category: CategoryResponse) => ({
        ...category,
        ...getCategoryIconData(category.name)
      }));

      dispatch(fetchCategoriesSuccess(categoriesWithIcons));
      return categoriesWithIcons;

    } catch (error) {
      console.error('Categories fetch error:', error);
      const errorMessage = getErrorMessage(error);
      
      Toast.show({
        type: 'error',
        text1: 'Loading Error',
        text2: errorMessage,
        position: 'bottom',
      });
      
      dispatch(fetchCategoriesFailure(errorMessage));
      throw error;
    }
  };
};

// Helper function to extract error messages
function getErrorMessage(error) {
  if (error.response) {
    return `Error ${error.response.status}: ${error.response.data?.message || 'Server error'}`;
  } else if (error.request) {
    return 'No response from server. Please check your connection.';
  } else if (error instanceof Error) {
    return error.message;
  }
  return 'An unknown error occurred';
} 