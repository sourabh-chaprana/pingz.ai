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

// Icon mapping object for categories
const categoryIconMap: Record<string, { icon: string; color: string }> = {
  recommended: { icon: 'star', color: '#FF9933' },
  ecommerce: { icon: 'cart', color: '#00CC99' },
  marketing: { icon: 'megaphone', color: '#6699FF' },
  events: { icon: 'calendar', color: '#9966CC' },
  holidays: { icon: 'gift', color: '#FF6666' },
  anniversary: { icon: 'heart', color: '#FF3366' },
  birthday: { icon: 'gift', color: '#9933CC' },
  auto_dealers: { icon: 'car', color: '#666666' },
  restaurants: { icon: 'restaurant', color: '#FF6600' },
  flirt: { icon: 'heart', color: '#FF3366' },
  shayari_poem: { icon: 'leaf', color: '#00CC99' },
  fashion_style: { icon: 'shirt', color: '#3366CC' },
  invitations: { icon: 'mail', color: '#3399FF' },
  default: { icon: 'apps', color: '#999999' }
};

// Helper function to get icon data
const getCategoryIconData = (categoryName: string) => {
  const normalizedName = categoryName.toLowerCase().replace(/[_\s]+/g, '_');
  return categoryIconMap[normalizedName] || categoryIconMap.default;
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
      
      const token = await AsyncStorage.getItem(TOKEN_KEY);
      
      if (!token) {
        throw new Error('Authentication token not found');
      }
      
      const response = await axios({
        method: 'get',
        url: 'https://pingz.ai/api/template/api/media',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
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