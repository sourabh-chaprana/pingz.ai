import {
  DarkTheme,
  DefaultTheme,
  ThemeProvider,
} from "@react-navigation/native";
import { useFonts } from "expo-font";
import { Drawer } from "expo-router/drawer";
import * as SplashScreen from "expo-splash-screen";
import { StatusBar } from "expo-status-bar";
import { useEffect, useState, useRef } from "react";
import {
  View,
  Image,
  StyleSheet,
  Dimensions,
  TextInput,
  TouchableOpacity,
  Platform,
  Animated,
  ActivityIndicator,
  Keyboard,
  ScrollView,
  BackHandler,
} from "react-native";
import "react-native-reanimated";
import { useColorScheme } from "@/hooks/useColorScheme";
import { Ionicons } from "@expo/vector-icons";
import { ProfileHeader } from "@/components/ProfileHeader";
import { MenuItem } from "@/components/MenuItem";
import { Tabs } from "expo-router";
import { createElevation } from "@/utils/styles";
import { Provider, useSelector, useDispatch } from "react-redux";
import { store } from "../src/store";
import { RootState } from "../src/store";
import React from "react";
import Toast from "react-native-toast-message";
import { ThemedText } from "@/components/ThemedText";
import { useRoute, useFocusEffect } from "@react-navigation/native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { fetchRecentTemplates } from "@/src/features/home/homeThunks";
import { useRouter } from "expo-router";
import { searchTemplates } from "@/src/features/search/searchThunks";
import { clearSearch } from "@/src/features/search/searchSlice";
import SearchResults from "@/app/SearchResult";
import { logoutUser, setTokens } from "@/src/features/auth/authSlice";
import { Slot } from "expo-router";
import { performLogout } from "@/src/services/api";
import { fetchHolidayTemplates } from "@/src/features/home/homeThunks";
import { fetchWhatsNewTags } from "@/src/features/home/homeThunks";
import { fetchCategories } from "@/src/features/home/homeThunks";
import { Buffer } from 'buffer';

// Prevent the splash screen from auto-hiding before asset loading is complete.
SplashScreen.preventAutoHideAsync();

// Create a context to share scroll position with the header
const ScrollContext = React.createContext<{
  scrollY: Animated.Value;
}>({
  scrollY: new Animated.Value(0),
});

// Export the provider and hook to use in other components
export const ScrollProvider = ScrollContext.Provider;
export const useScrollContext = () => React.useContext(ScrollContext);

const toCamelCase = (str: string) => {
  if (!str) return "";

  // Convert to camelCase and add spaces
  const withSpaces = str
    .split(/[-_\s]+/)
    .map((word) => {
      // Always capitalize first letter of each word
      return word.charAt(0).toUpperCase() + word.slice(1).toLowerCase();
    })
    .join(" ");

  return withSpaces;
};

// Custom splash screen component
function CustomSplashScreen() {
  return (
    <View style={styles.splashContainer}>
      <Image
        source={require("../assets/images/pingz.png")}
        style={styles.logo}
        resizeMode="contain"
      />
    </View>
  );
}

// Create a new component for the Recent Designs section in the drawer
function RecentDesignsSection({ navigation }: { navigation: any }) {
  const [expanded, setExpanded] = useState(true);
  const dispatch = useDispatch();
  const router = useRouter();

  // Get the recent templates from Redux store
  const { recentTemplates, loading } = useSelector(
    (state: RootState) => state.home
  );

  // Fetch recent templates when the component mounts
  useEffect(() => {
    dispatch(fetchRecentTemplates());
  }, [dispatch]);

  const toggleExpanded = () => {
    setExpanded(!expanded);
  };

  const handleTemplatePress = (templateId: string) => {
    // Use router.push instead of navigation.navigate
    router.push(`/template-editor/${templateId}`);
  };

  return (
    <View style={styles.recentDesignsContainer}>
      <TouchableOpacity
        style={styles.recentDesignsHeader}
        onPress={toggleExpanded}
      >
        <ThemedText style={styles.recentDesignsTitle}>
          Recent designs
        </ThemedText>
        <Ionicons
          name={expanded ? "chevron-down" : "chevron-forward"}
          size={20}
          color="#333"
        />
      </TouchableOpacity>

      {expanded && (
        <ScrollView
          style={styles.recentDesignsList}
          showsVerticalScrollIndicator={true}
        >
          {loading ? (
            <ActivityIndicator
              size="small"
              color="#8B3DFF"
              style={{ marginVertical: 10 }}
            />
          ) : recentTemplates && recentTemplates.length > 0 ? (
            recentTemplates.slice(0, 5).map((template) => (
              <TouchableOpacity
                key={template.id}
                style={styles.recentDesignItem}
                onPress={() => handleTemplatePress(template.id)}
              >
                <Image
                  source={{ uri: template.url }}
                  style={styles.recentDesignThumbnail}
                  resizeMode="cover"
                />
                <ThemedText
                  style={styles.recentDesignText}
                  numberOfLines={1}
                  ellipsizeMode="tail"
                >
                  {toCamelCase(template?.templateName)}
                </ThemedText>
              </TouchableOpacity>
            ))
          ) : (
            <ThemedText style={styles.noRecentDesignsText}>
              No recent designs found
            </ThemedText>
          )}
        </ScrollView>
      )}
    </View>
  );
}

// Add this interface for the token payload
interface TokenPayload {
  name: string;
  userType: string;
  membership: string;
  userId: string;
  email: string;
  sub: string;
  iat: number;
  exp: number;
}

function CustomDrawerContent(props: any) {
  const isAuthenticated = useSelector((state: RootState) =>
    Boolean(state.auth.token)
  );
  const dispatch = useDispatch();
  const router = useRouter();
  const [isPro, setIsPro] = useState(false);

  const handleLogout = async () => {
    try {
      // Use the centralized logout function
      await performLogout();

      // Explicitly navigate to login screen
      router.replace("/login");

      // Show success message
      Toast.show({
        type: "success",
        text1: "Logged out successfully",
      });
    } catch (error) {
      console.error("Logout error:", error);
      Toast.show({
        type: "error",
        text1: "Error",
        text2: "Failed to logout. Please try again.",
      });
    }
  };

  // Add this useEffect to check the token when component mounts
  useEffect(() => {
    const checkMembership = async () => {
      try {
        const token = await AsyncStorage.getItem('auth_token');
        if (token) {
          // Manual JWT decoding
          const payload = token.split('.')[1];
          const decoded = JSON.parse(Buffer.from(payload, 'base64').toString());
          setIsPro(decoded.membership === 'PRO');
        }
      } catch (error) {
        console.error('Error checking membership:', error);
        setIsPro(false);
      }
    };

    checkMembership();
  }, []);

  return (
    <View style={{ flex: 1 }}>
      {/* Fixed content */}
      <ProfileHeader />
      <MenuItem
        icon="home-outline"
        label="Home"
        onPress={() => props.navigation.navigate("(tabs)")}
      />
      {/* <MenuItem
        icon="bulb-outline"
        label="My Templates"
        onPress={() => props.navigation.navigate("myTemplates")}
      /> */}
      {/* <MenuItem
        icon="help-circle-outline"
        label="Ask Canva"
        onPress={() => props.navigation.navigate("ask")}
      /> */}
      {/* Only show Transaction menu if user is PRO */}
      {isPro && (
        <MenuItem
          icon="list-outline"
          label="Transactions"
          onPress={() => props.navigation.navigate("transaction")}
        />
      )}
      <MenuItem
        icon="help-circle-outline"
        label="Account"
        onPress={() => props.navigation.navigate("account")}
      />

      <View style={styles.divider} />

      {/* Recent designs section */}
      {isAuthenticated && (
        <RecentDesignsSection navigation={props.navigation} />
      )}

      {/* Fixed logout section at bottom */}
      <View style={{ marginTop: "auto" }}>
        <View style={styles.divider} />
        <MenuItem
          icon="log-out-outline"
          label="Logout"
          onPress={handleLogout}
          style={styles.logoutButton}
        />
      </View>
    </View>
  );
}

// Custom search header component
function SearchHeader({ navigation }: { navigation: any }) {
  const isAuthenticated = useSelector(
    (state: RootState) => state.auth.isAuthenticated
  );
  const route = useRoute();
  const [isSearchActive, setIsSearchActive] = useState(false);
  const searchInputRef = useRef<TextInput>(null);
  const [searchText, setSearchText] = useState("");
  const dispatch = useDispatch();
  const router = useRouter();

  // Get the scroll position from context
  const { scrollY } = useScrollContext();

  // Calculate the header background opacity based on scroll position
  const headerBackgroundOpacity = scrollY.interpolate({
    inputRange: [0, 50],
    outputRange: [0, 1],
    extrapolate: "clamp",
  });

  // Create animated values for the search bar and button styles
  const searchBarStyle = {
    backgroundColor: "rgba(255, 255, 255, 0.85)",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: headerBackgroundOpacity.interpolate({
      inputRange: [0, 1],
      outputRange: [0, 0.1],
    }),
    shadowRadius: 3,
    elevation: headerBackgroundOpacity.interpolate({
      inputRange: [0, 1],
      outputRange: [0, 1],
    }),
    borderWidth: headerBackgroundOpacity.interpolate({
      inputRange: [0, 1],
      outputRange: [0, 1],
    }),
    borderColor: "rgba(0, 0, 0, 0.05)",
  };

  const handleSearchFocus = () => {
    setIsSearchActive(true);
  };

  const handleSearchBlur = () => {
    if (!searchText) {
      setIsSearchActive(false);
    }
  };

  const handleSearchCancel = () => {
    setSearchText("");
    setIsSearchActive(false);
    dispatch(clearSearch());
    Keyboard.dismiss();
  };

  const handleSearchSubmit = () => {
    if (searchText.trim()) {
      dispatch(searchTemplates(searchText.trim()));
    }
    Keyboard.dismiss();
  };

  const handleClearSearch = () => {
    setSearchText("");
    dispatch(clearSearch());
    searchInputRef.current?.focus();
  };

  // If not authenticated, return null or an empty view
  if (!isAuthenticated) {
    return null;
  }

  return (
    <View
      style={[
        searchStyles.headerContainer,
        isSearchActive && searchStyles.searchActiveHeader,
      ]}
    >
      {!isSearchActive ? (
        <>
          {/* Background Image - shown when not scrolled and search not active */}
          <Animated.View
            style={[
              searchStyles.backgroundImageContainer,
              { opacity: Animated.subtract(1, headerBackgroundOpacity) },
            ]}
          >
            <Image
              source={{
                uri: "https://img.freepik.com/free-photo/blurred-blue-sky-sea-well-use-as-blur-backdrop-ocean-concept-blurry-pastel-colored-sunshine_1258-239.jpg?t=st=1742402532~exp=1742406132~hmac=791461f45fbda633c20276a20237f9c7a1a8047b6463cf35f2a606a0bf6abe1d&w=996",
              }}
              style={searchStyles.backgroundImage}
              resizeMode="cover"
            />
          </Animated.View>

          {/* White background - shown when scrolled */}
          <Animated.View
            style={[
              searchStyles.whiteBackground,
              { opacity: headerBackgroundOpacity },
            ]}
          />

          {/* Normal header layout */}
          <View style={searchStyles.searchControls}>
            <Animated.View
              style={[searchStyles.menuButtonContainer, searchBarStyle]}
            >
              <TouchableOpacity
                style={searchStyles.menuButton}
                onPress={() => navigation.toggleDrawer()}
              >
                <Ionicons name="menu-outline" size={24} color="#333" />
              </TouchableOpacity>
            </Animated.View>

            <Animated.View
              style={[searchStyles.searchContainer, searchBarStyle]}
            >
              <Ionicons name="search" size={20} color="#666" />
              <TextInput
                ref={searchInputRef}
                placeholder="Search Images "
                placeholderTextColor="#666"
                style={searchStyles.searchInput}
                onFocus={handleSearchFocus}
                onChangeText={setSearchText}
                value={searchText}
              />
            </Animated.View>

            {/* <Animated.View
              style={[searchStyles.notificationButtonContainer, searchBarStyle]}
            >
              <TouchableOpacity
                style={searchStyles.notificationButton}
                activeOpacity={0.7}
              >
                <Ionicons name="notifications-outline" size={24} color="#333" />
              </TouchableOpacity>
            </Animated.View> */}
          </View>
        </>
      ) : (
        // Search active layout with full screen search UI
        <View style={searchStyles.searchFullContainer}>
          {/* Search bar with back button */}
          <View style={searchStyles.searchBarContainer}>
            <View style={searchStyles.searchActiveInputContainer}>
              <TouchableOpacity
                style={searchStyles.backButton}
                onPress={handleSearchCancel}
              >
                <Ionicons name="arrow-back" size={24} color="#333" />
              </TouchableOpacity>

              <TextInput
                ref={searchInputRef}
                placeholder="Search Images "
                placeholderTextColor="#666"
                style={searchStyles.searchActiveInput}
                autoFocus={true}
                onBlur={handleSearchBlur}
                onChangeText={setSearchText}
                value={searchText}
                onSubmitEditing={handleSearchSubmit}
                returnKeyType="search"
              />

              {searchText.length > 0 && (
                <TouchableOpacity
                  style={searchStyles.clearButton}
                  onPress={handleClearSearch}
                >
                  <Ionicons name="close-circle" size={20} color="#999" />
                </TouchableOpacity>
              )}
            </View>
          </View>

          {/* Dedicated search results component */}
          <SearchResults query={searchText} />
        </View>
      )}
    </View>
  );
}

function AppContent() {
  const router = useRouter();
  const dispatch = useDispatch();
  const scrollY = React.useRef(new Animated.Value(0)).current;
  const isAuthenticated = useSelector((state: RootState) => state.auth.isAuthenticated);

  const [loaded] = useFonts({
    SpaceMono: require("../assets/fonts/SpaceMono-Regular.ttf"),
  });
  const [isAppReady, setIsAppReady] = useState(false);

  // Add this effect to trigger API calls when authenticated
  useEffect(() => {
    if (isAuthenticated) {
      // Fetch initial data
      dispatch(fetchHolidayTemplates());
      dispatch(fetchWhatsNewTags());
      dispatch(fetchRecentTemplates());
      // dispatch(fetchRecentTemplates());
    }
  }, [isAuthenticated, dispatch]);

  // Define checkAuthAndRedirect with router as parameter
  const checkAuthAndRedirect = async () => {
    try {
      const token = await AsyncStorage.getItem("auth_token");
      if (!token && router.pathname !== "/login") {
        router.push("/login");
      }
    } catch (error) {
      console.error("Error checking authentication:", error);
      router.push("/login");
    }
  };

  // Initial setup effect
  useEffect(() => {
    async function prepare() {
      try {
        if (loaded) {
          const token = await AsyncStorage.getItem("auth_token");
          const refreshToken = await AsyncStorage.getItem("refreshToken");

          if (token) {
            dispatch(setTokens({ token, refreshToken }));
          }

          await new Promise((resolve) => setTimeout(resolve, 2000));
          setIsAppReady(true);
        }
      } catch (e) {
        console.warn(e);
        setIsAppReady(true);
      }
    }

    prepare();
  }, [loaded, dispatch]);

  // Auth check effect
  useEffect(() => {
    if (!isAppReady) return;
    checkAuthAndRedirect();
  }, [isAppReady, isAuthenticated]);

  // Add back handler effect
  useFocusEffect(
    React.useCallback(() => {
      const backHandler = BackHandler.addEventListener(
        "hardwareBackPress",
        async () => {
          const token = await AsyncStorage.getItem("auth_token");
          if (!token) {
            router.push("/login");
            return true;
          }
          return false;
        }
      );

      return () => backHandler.remove();
    }, [router])
  );

  // Handle splash screen
  useEffect(() => {
    if (isAppReady) {
      SplashScreen.hideAsync();
    }
  }, [isAppReady]);

  if (!loaded || !isAppReady) {
    return <CustomSplashScreen />;
  }

  // Return Slot for initial render
  if (!isAuthenticated) {
    return <Slot />;
  }

  // Return DrawerNavigator for authenticated users
  return (
    <ScrollProvider value={{ scrollY }}>
      <DrawerNavigator />
      <StatusBar style="auto" />
      <Toast />
    </ScrollProvider>
  );
}

function DrawerNavigator() {
  const router = useRouter();
  const isAuthenticated = useSelector(
    (state: RootState) => state.auth.isAuthenticated
  );

  useEffect(() => {
    const checkAuth = async () => {
      const token = await AsyncStorage.getItem("auth_token");
      if (!token && router.pathname !== "/login") {
        router.push("/login");
      }
    };

    checkAuth();
  }, [isAuthenticated, router]);

  return (
    <>
      <Drawer
        drawerContent={(props) => <CustomDrawerContent {...props} />}
        screenOptions={({ navigation }) => ({
          headerShown: isAuthenticated,
          header: () =>
            isAuthenticated ? <SearchHeader navigation={navigation} /> : null,
          headerStyle: {
            backgroundColor: "transparent",
            elevation: 0,
            shadowOpacity: 0,
          },
          headerTintColor: "#333",
          drawerStyle: {
            backgroundColor: "#fff",
          },
          drawerActiveBackgroundColor: "#f0e6ff",
          drawerActiveTintColor: "#8B3DFF",
          swipeEnabled: isAuthenticated,
        })}
      >
        <Drawer.Screen
          name="(tabs)"
          options={{
            title: "Home",
          }}
        />
        <Drawer.Screen
          name="login"
          options={{
            title: "Login",
            drawerItemStyle: { display: "none" },
            swipeEnabled: false,
          }}
        />
        {isAuthenticated && (
          <>
            <Drawer.Screen name="brand" options={{ title: "Brand" }} />
            <Drawer.Screen name="apps" options={{ title: "Apps" }} />
            <Drawer.Screen
              name="myTemplates"
              options={{ title: "My Templates" }}
            />
            <Drawer.Screen
              name="transaction"
              options={{ title: "Transactions" }}
            />
            <Drawer.Screen name="whatsNew" options={{ title: "What's New" }} />
            <Drawer.Screen
              name="template-editor/[id]"
              options={{
                title: "Template Editor",
                drawerItemStyle: { display: "none" },
              }}
            />
          </>
        )}
      </Drawer>

      {/* Add the global tab bar here */}
      {isAuthenticated && router.pathname !== "/login" && <GlobalTabBar />}
    </>
  );
}

// Add this new component for the global tab bar
function GlobalTabBar() {
  const router = useRouter();

  return (
    <View style={tabStyles.container}>
      <TouchableOpacity
        style={tabStyles.tabItem}
        onPress={() => router.push("/(tabs)")}
      >
        <Ionicons
          name="home-outline"
          size={24}
          color={router.pathname === "/(tabs)" ? "#8B3DFF" : "#666"}
        />
        <ThemedText
          style={[
            tabStyles.tabLabel,
            router.pathname === "/(tabs)" && tabStyles.activeTabLabel,
          ]}
        >
          Home
        </ThemedText>
      </TouchableOpacity>

      {/* <TouchableOpacity
        style={tabStyles.tabItem}
        onPress={() => router.push("/(tabs)/projects")}
      >
        <Ionicons
          name="folder-outline"
          size={24}
          color={router.pathname === "/(tabs)/projects" ? "#8B3DFF" : "#666"}
        />
        <ThemedText
          style={[
            tabStyles.tabLabel,
            router.pathname === "/(tabs)/projects" && tabStyles.activeTabLabel,
          ]}
        >
          Projects
        </ThemedText>
      </TouchableOpacity> */}

      <TouchableOpacity
        style={tabStyles.centerTabItem}
        onPress={() => router.push("/(tabs)/create")}
      >
        <View style={tabStyles.centerButton}>
          <Image
            source={require("../assets/images/pingz.png")}
            style={{ width: 36, height: 36 }}
            resizeMode="contain"
          />
        </View>
      </TouchableOpacity>

      {/* <TouchableOpacity
        style={tabStyles.tabItem}
        onPress={() => router.push("/(tabs)/templates")}
      >
        <Ionicons
          name="grid-outline"
          size={24}
          color={router.pathname === "/(tabs)/templates" ? "#8B3DFF" : "#666"}
        />
        <ThemedText
          style={[
            tabStyles.tabLabel,
            router.pathname === "/(tabs)/templates" && tabStyles.activeTabLabel,
          ]}
        >
          Templates
        </ThemedText>
      </TouchableOpacity> */}

      <TouchableOpacity
        style={tabStyles.tabItem}
        onPress={() => router.push("/(tabs)/pro")}
      >
        <Ionicons
          name="star-outline"
          size={24}
          color={router.pathname === "/(tabs)/pro" ? "#8B3DFF" : "#666"}
        />
        <ThemedText
          style={[
            tabStyles.tabLabel,
            router.pathname === "/(tabs)/pro" && tabStyles.activeTabLabel,
          ]}
        >
          Pro
        </ThemedText>
      </TouchableOpacity>
    </View>
  );
}

// Export the wrapper component
export default function RootLayout() {
  const colorScheme = useColorScheme();

  return (
    <Provider store={store}>
      <ThemeProvider value={colorScheme === "dark" ? DarkTheme : DefaultTheme}>
        <AppContent />
      </ThemeProvider>
    </Provider>
  );
}

const { width, height } = Dimensions.get("window");

const styles = StyleSheet.create({
  splashContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#FFFFFF",
  },
  logo: {
    width: '80%',
    height: undefined,
    aspectRatio: 1,
  },
  divider: {
    height: 1,
    backgroundColor: "#e0e0e0",
    marginVertical: 10,
    marginHorizontal: 10,
  },
  recentDesignsContainer: {
    marginTop: 5,
    paddingHorizontal: 10,
    maxHeight: 300,
  },
  recentDesignsHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 10,
    paddingHorizontal: 10,
  },
  recentDesignsTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#333",
  },
  recentDesignsList: {
    maxHeight: 250,
  },
  recentDesignItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 8,
    paddingHorizontal: 10,
    borderRadius: 8,
  },
  recentDesignThumbnail: {
    width: 40,
    height: 40,
    borderRadius: 5,
    marginRight: 10,
  },
  recentDesignText: {
    fontSize: 14,
    color: "#333",
    flex: 1,
  },
  noRecentDesignsText: {
    fontSize: 14,
    color: "#888",
    paddingVertical: 10,
    paddingHorizontal: 10,
    fontStyle: "italic",
  },
  logoutButton: {
    borderTopWidth: 1,
    borderTopColor: "#e0e0e0",
    paddingVertical: 12,
  },
});

// Update search header styles
const searchStyles = StyleSheet.create({
  headerContainer: {
    position: "relative",
    backgroundColor: "transparent",
    paddingTop: Platform.OS === "ios" ? 45 : 35,
    paddingBottom: 12,
    borderBottomWidth: 0,
    zIndex: 1000,
  },
  searchActiveHeader: {
    backgroundColor: "#fff",
    paddingTop: Platform.OS === "ios" ? 45 : 35,
    paddingBottom: 0, // Remove bottom padding in search mode
    height: "100%", // Make the header container take full height
  },
  backgroundImageContainer: {
    ...StyleSheet.absoluteFillObject,
  },
  backgroundImage: {
    ...StyleSheet.absoluteFillObject,
    opacity: 0.9,
  },
  whiteBackground: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "#fff",
  },
  searchControls: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 8,
    zIndex: 1,
  },
  searchActiveControls: {
    paddingHorizontal: 4,
    paddingVertical: 8,
  },
  menuButtonContainer: {
    borderRadius: 22,
    marginRight: 8,
  },
  menuButton: {
    width: 44,
    height: 44,
    justifyContent: "center",
    alignItems: "center",
  },
  searchContainer: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    borderRadius: 20,
    paddingHorizontal: 14,
    paddingVertical: 10,
    marginHorizontal: 8,
  },
  notificationButtonContainer: {
    borderRadius: 22,
    marginLeft: 8,
  },
  notificationButton: {
    width: 44,
    height: 44,
    justifyContent: "center",
    alignItems: "center",
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    marginLeft: 8,
    color: "#333",
    paddingVertical: 0,
  },
  // Full screen search container
  searchFullContainer: {
    flex: 1,
    width: "100%",
    height: "100%",
    backgroundColor: "#fff",
  },
  // Rename this to avoid duplication with 'searchActiveHeader'
  searchBarContainer: {
    paddingHorizontal: 8,
    paddingVertical: 8,
    borderBottomWidth: 0,
  },
  searchActiveInputContainer: {
    flexDirection: "row",
    alignItems: "center",
    width: "100%",
    backgroundColor: "#fff",
    borderWidth: 1,
    borderColor: "#e0e0e0",
    borderRadius: 24,
    paddingLeft: 6,
    paddingRight: 12,
    overflow: "hidden",
  },
  backButton: {
    width: 44,
    height: 44,
    justifyContent: "center",
    alignItems: "center",
  },
  searchActiveInput: {
    flex: 1,
    fontSize: 16,
    paddingVertical: Platform.OS === "ios" ? 12 : 10,
    color: "#333",
    height: 44,
  },
  clearButton: {
    padding: 8,
  },
});

// Add these styles at the bottom of your file
const tabStyles = StyleSheet.create({
  container: {
    flexDirection: "row",
    height: 60,
    backgroundColor: "#fff",
    borderTopWidth: 1,
    borderTopColor: "#eee",
    paddingBottom: 8,
    paddingTop: 8,
    ...createElevation(5),
  },
  tabItem: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  centerTabItem: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  centerButton: {
    width: 56,
    height: 56,
    backgroundColor: "#FFFFFF",
    borderWidth: 2,
    borderColor: "#FF4785",
    borderRadius: 28,
    justifyContent: "center",
    alignItems: "center",
    marginTop: -30,
    ...createElevation(5),
  },
  tabLabel: {
    fontSize: 12,
    color: "#666",
    marginTop: 2,
  },
  activeTabLabel: {
    color: "#8B3DFF",
  },
});
