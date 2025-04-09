import AsyncStorage from "@react-native-async-storage/async-storage";

export const getAuthToken = async () => {
  try {
    const token = await AsyncStorage.getItem("token");
    if (!token) {
      console.warn("No auth token found in storage");
    }
    return token;
  } catch (error) {
    console.error("Error retrieving auth token:", error);
    return null;
  }
};
