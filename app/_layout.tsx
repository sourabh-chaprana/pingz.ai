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
import { useRoute } from "@react-navigation/native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { fetchRecentTemplates } from "@/src/features/home/homeThunks";
import { useRouter } from "expo-router";
import { searchTemplates } from "@/src/features/search/searchThunks";
import { clearSearch } from "@/src/features/search/searchSlice";
import SearchResults from "@/app/SearchResult";

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

// Custom splash screen component
function CustomSplashScreen() {
  return (
    <View style={styles.splashContainer}>
      <Image
        source={require("../assets/images/pingz.png")} // Make sure to add your logo to assets folder
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
        <View style={styles.recentDesignsList}>
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
                  {template.templateName}
                </ThemedText>
              </TouchableOpacity>
            ))
          ) : (
            <ThemedText style={styles.noRecentDesignsText}>
              No recent designs found
            </ThemedText>
          )}
        </View>
      )}
    </View>
  );
}

function CustomDrawerContent(props: any) {
  const isAuthenticated = useSelector((state: RootState) =>
    Boolean(state.auth.token)
  );

  return (
    <View style={{ flex: 1 }}>
      <ProfileHeader />
      <MenuItem
        icon="home-outline"
        label="Home"
        onPress={() => props.navigation.navigate("(tabs)")}
      />

      <MenuItem
        icon="bulb-outline"
        label="Dream Lab"
        onPress={() => props.navigation.navigate("dreamlab")}
      />
      <MenuItem
        icon="help-circle-outline"
        label="Ask Canva"
        onPress={() => props.navigation.navigate("ask")}
      />
      <MenuItem
        icon="list-outline"
        label="Transactions"
        onPress={() => props.navigation.navigate("transaction")}
      />
      <MenuItem
        icon="help-circle-outline"
        label="Account"
        onPress={() => props.navigation.navigate("account")}
      />

      {/* Add divider before Recent designs section */}
      <View style={styles.divider} />

      {/* Add the Recent designs section */}
      {isAuthenticated && (
        <RecentDesignsSection navigation={props.navigation} />
      )}
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
                placeholder="Search your content and Canva's"
                placeholderTextColor="#666"
                style={searchStyles.searchInput}
                onFocus={handleSearchFocus}
                onChangeText={setSearchText}
                value={searchText}
              />
            </Animated.View>

            <Animated.View
              style={[searchStyles.notificationButtonContainer, searchBarStyle]}
            >
              <TouchableOpacity
                style={searchStyles.notificationButton}
                activeOpacity={0.7}
              >
                <Ionicons name="notifications-outline" size={24} color="#333" />
              </TouchableOpacity>
            </Animated.View>
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
                placeholder="Search your content and Canva's"
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

function DrawerNavigator() {
  const isAuthenticated = useSelector(
    (state: RootState) => state.auth.isAuthenticated
  );

  return (
    <Drawer
      drawerContent={(props) => <CustomDrawerContent {...props} />}
      screenOptions={({ navigation }) => ({
        headerShown: isAuthenticated, // Only show header when authenticated
        header: () => <SearchHeader navigation={navigation} />,
        headerStyle: {
          backgroundColor: "transparent",
          elevation: 0, // Remove shadow on Android
          shadowOpacity: 0, // Remove shadow on iOS
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
      {isAuthenticated && (
        <>
          <Drawer.Screen name="brand" options={{ title: "Brand" }} />
          <Drawer.Screen name="apps" options={{ title: "Apps" }} />
          <Drawer.Screen name="dreamlab" options={{ title: "Dream Lab" }} />
          <Drawer.Screen name="ask" options={{ title: "Ask Canva" }} />
          <Drawer.Screen
            name="transaction"
            options={{ title: "Transactions" }}
          />
          <Drawer.Screen name="trash" options={{ title: "Trash" }} />
          <Drawer.Screen
            name="template-editor/[id]"
            options={{
              title: "Template Editor",
              drawerItemStyle: { display: "none" }, // Hide from drawer list
            }}
          />
        </>
      )}
    </Drawer>
  );
}

export default function RootLayout() {
  const colorScheme = useColorScheme();
  const [loaded] = useFonts({
    SpaceMono: require("../assets/fonts/SpaceMono-Regular.ttf"),
  });
  const [isAppReady, setIsAppReady] = useState(false);
  const [isTokenLoaded, setIsTokenLoaded] = useState(false);

  // Create the animated scroll value
  const scrollY = React.useRef(new Animated.Value(0)).current;

  useEffect(() => {
    async function prepare() {
      try {
        // Load fonts and any other resources here
        if (loaded) {
          // Wait for a short delay to show the splash screen
          await new Promise((resolve) => setTimeout(resolve, 2000)); // 2 seconds splash visibility
          setIsAppReady(true);
        }
      } catch (e) {
        console.warn(e);
      }
    }

    prepare();
  }, [loaded]);

  useEffect(() => {
    if (isAppReady) {
      // Hide the splash screen once everything is ready
      SplashScreen.hideAsync();
    }
  }, [isAppReady]);

  useEffect(() => {
    // Check if token exists on app startup
    const loadToken = async () => {
      try {
        const token = await AsyncStorage.getItem("auth_token");

        // If no token is found, you might want to redirect to login
        // depending on your app's requirements

        setIsTokenLoaded(true);
      } catch (error) {
        console.error("Failed to load authentication token:", error);
        setIsTokenLoaded(true);
      }
    };

    loadToken();
  }, []);

  if (!loaded || !isAppReady || !isTokenLoaded) {
    // Show custom splash screen while loading
    return <CustomSplashScreen />;
  }

  return (
    <Provider store={store}>
      <ThemeProvider value={colorScheme === "dark" ? DarkTheme : DefaultTheme}>
        <ScrollProvider value={{ scrollY }}>
          <DrawerNavigator />
          <StatusBar style="auto" />
          <Toast />
        </ScrollProvider>
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
    backgroundColor: "#FFFFFF", // Customize this to match your brand
  },
  logo: {
    width: width * 0.7,
    height: height * 0.3,
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
    marginTop: 5,
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
