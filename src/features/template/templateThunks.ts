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
  fetchMediaFailure
} from './templateSlice';
import { AppDispatch } from '@/src/store';
import api from '@/src/services/api';
import Toast from 'react-native-toast-message';


const IMAGE_API_URL = 'https://pingz.ai/api/render/api/image/overlay-text';
const TOKEN_KEY = 'token';
const CORS_PROXY = 'https://corsproxy.io/?';

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
export const generateImage = (currentTemplate: any, templateVariables: any) => {
  return async (dispatch: AppDispatch) => {
    try {
      dispatch(generateImageStart());

      // Prepare text overlays
      const textOverlays = currentTemplate.templateVariables
        .filter(variable => variable.name.toLowerCase() !== 'image')
        .map(variable => ({
          text: templateVariables[variable.name] || "",
          width: parseInt(variable.posWidth) || 300,
          height: parseInt(variable.posHeight) || 150,
          x: parseInt(variable.x) || 120,
          y: parseInt(variable.y) || 250,
          font: variable.font || "Arial",
          fontFamily: variable.fontFamily || "https://pingz.ai/api/template/fonts/Arial.ttf",
          fontSize: variable.fontSize || "30",
          color: variable.color || "#000000"
        }));

      // Prepare image overlays
      const imageOverlays = [];
      const imageVariable = currentTemplate.templateVariables.find(
        variable => variable.name.toLowerCase() === 'image'
      );

      if (imageVariable && templateVariables['image']) {
        imageOverlays.push({
          imageUrl: templateVariables['image'],
          width: parseInt(imageVariable.posWidth) || 0,
          height: parseInt(imageVariable.posHeight) || 0,
          x: parseInt(imageVariable.x) || 10,
          y: parseInt(imageVariable.y) || 10
        });
      }

      const payload = {
        imageUrl: currentTemplate.url,
        mediaType: currentTemplate.mediaType || "image",
        textOverlays: textOverlays,
        imageOverlays: imageOverlays
      };

      console.log('Generate Image Payload:', payload); // For debugging

      // Single API call for all platforms
      const response = await api.post('render/api/image/overlay-text', payload, {
        headers: {
          'Accept': 'image/png;base64',
          'Content-Type': 'application/json'
        },
        responseType: Platform.OS === 'web' ? 'blob' : 'text'
      });

      let imageUrl;
      if (Platform.OS === 'web') {
        imageUrl = URL.createObjectURL(response.data);
      } else {
        imageUrl = `data:image/png;base64,${response.data}`;
      }

      dispatch(generateImageSuccess(imageUrl));
      return imageUrl;

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