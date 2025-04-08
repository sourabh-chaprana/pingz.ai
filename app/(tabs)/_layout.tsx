import { Stack } from "expo-router";
import { useEffect } from "react";
import { useRouter } from "expo-router";
import { useSelector } from "react-redux";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { RootState } from "@/src/store";

export default function TabLayout() {
  const router = useRouter();
  const isAuthenticated = useSelector(
    (state: RootState) => state.auth.isAuthenticated
  );

  useEffect(() => {
    const checkAuth = async () => {
      const token = await AsyncStorage.getItem("auth_token");
      if (!token || !isAuthenticated) {
        router.replace("/login");
      }
    };

    checkAuth();
  }, [isAuthenticated]);

  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="index" />
      <Stack.Screen name="projects" />
      <Stack.Screen name="create" />
      <Stack.Screen name="templates" />
      <Stack.Screen name="pro" />
    </Stack>
  );
}
