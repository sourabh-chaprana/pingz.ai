import { Platform } from 'react-native';

export const createElevation = (elevation: number) => {
  if (Platform.OS === 'ios') {
    return {
      shadowColor: '#000',
      shadowOffset: {
        width: 0,
        height: elevation / 2,
      },
      shadowOpacity: 0.25,
      shadowRadius: elevation,
    };
  } else {
    return {
      elevation,
    };
  }
};

export const isIOS = Platform.OS === 'ios';
export const isAndroid = Platform.OS === 'android'; 