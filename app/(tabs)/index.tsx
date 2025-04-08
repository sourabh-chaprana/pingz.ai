import {
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  View,
  Image,
  Modal,
  Dimensions,
  Animated,
  ActivityIndicator,
} from "react-native";
import { ThemedText } from "@/components/ThemedText";
import { ThemedView } from "@/components/ThemedView";
import { Ionicons } from "@expo/vector-icons";
import { useState, useRef, useEffect } from "react";
import React from "react";
import { useScrollContext } from "@/app/_layout";
import { useRouter } from "expo-router";
import { useDispatch, useSelector } from "react-redux";
import {
  fetchTemplatesByCategory,
  fetchCategories,
} from "@/src/features/template/templateThunks";
import {
  fetchRecentTemplates,
  fetchWhatsNewTags,
  fetchTemplatesByTag,
  fetchHolidayTemplates,
} from "@/src/features/home/homeThunks";
import { RootState } from "@/src/store";
import AsyncStorage from "@react-native-async-storage/async-storage";

// Add more icons & categories data
// const categoryData = [
//   { id: '1', name: 'Recommended', icon: 'star', color: '#FF9933' },
//   { id: '2', name: 'eCommerce', icon: 'cart', color: '#00CC99' },
//   { id: '3', name: 'Marketing', icon: 'megaphone', color: '#6699FF' },
//   { id: '4', name: 'Events', icon: 'calendar', color: '#9966CC' },
//   { id: '5', name: 'Holidays', icon: 'gift', color: '#FF6666' },
//   { id: '6', name: 'Anniversary', icon: 'heart', color: '#FF3366' },
//   { id: '7', name: 'Birthday', icon: 'gift', color: '#9933CC' },
//   { id: '8', name: 'Auto_Dealers', icon: 'car', color: '#666666' },
//   { id: '9', name: 'Restaurants', icon: 'restaurant', color: '#FF6600' },
//   { id: '10', name: 'Flirt', icon: 'heart', color: '#FF3366' },
//   { id: '11', name: 'Shayari_Poem', icon: 'leaf', color: '#00CC99' },
//   { id: '12', name: 'Fashion_Style', icon: 'shirt', color: '#3366CC' },
//   { id: '13', name: 'Invitations', icon: 'mail', color: '#3399FF' },
//   // { id: '1', name: 'Featured', icon: 'star', color: '#FFA500' },
//   // { id: '2', name: 'eCommerce', icon: 'cart', color: '#00BCD4' },
//   // { id: '3', name: 'Marketing', icon: 'chatbubble', color: '#2196F3' },
//   // { id: '4', name: 'Events', icon: 'calendar', color: '#9C27B0' },
//   // { id: '5', name: 'Holidays', icon: 'gift', color: '#E91E63' },
// ];

// Updated whatsNewData with free images
const whatsNewData = [
  {
    id: "1",
    title: "Illuminate your designs with Ramadan vibes",
    imageUrl: "https://source.unsplash.com/random/500x300/?ramadan",
    color: "#FFB800",
  },
  {
    id: "2",
    title: "Ugadi celebrations with creative designs",
    imageUrl: "https://source.unsplash.com/random/500x300/?celebration",
    color: "#4CAF50",
  },
  {
    id: "3",
    title: "Spring celebrations",
    imageUrl: "https://source.unsplash.com/random/500x300/?spring",
    color: "#9C27B0",
  },
];

// Add more AI features data
const aiFeatureData = [
  { id: "1", text: "Make me an image", icon: "help-circle" },
  { id: "2", text: "Write my first draft", icon: "create" },
  { id: "3", text: "Design a logo", icon: "color-palette" },
  { id: "4", text: "Create a presentation", icon: "easel" },
  { id: "5", text: "Edit my photo", icon: "image" },
];

// Add recent designs data
const recentDesignsData = [
  {
    id: "1",
    title: "Photography Portfolio",
    type: "Website",
    imageUrl: "https://source.unsplash.com/random/500x300/?photography",
    color: "#5D3FD3",
  },
  {
    id: "2",
    title: "Business Card",
    type: "Print",
    imageUrl: "https://source.unsplash.com/random/500x300/?business,card",
    color: "#FF7F50",
  },
  {
    id: "3",
    title: "Social Media Post",
    type: "Instagram",
    imageUrl: "https://source.unsplash.com/random/500x300/?social,media",
    color: "#1DA1F2",
  },
];

// Add the toCamelCase function at the top of the file
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

// Updated WhatsNewCard component to display tag group image and label
function WhatsNewCard({
  label,
  webp,
  tags,
  onPress,
}: {
  label: string;
  webp: string;
  tags: string[];
  onPress: () => void;
}) {
  return (
    <TouchableOpacity style={styles.whatsNewCard} onPress={onPress}>
      {/* Display the webp image from base64 */}
      <Image
        source={{ uri: `data:image/webp;base64,${webp}` }}
        style={styles.whatsNewImage}
        resizeMode="cover"
      />
      <View style={styles.whatsNewOverlay}>
        <ThemedText style={styles.whatsNewTitle}>
          {toCamelCase(label)}
        </ThemedText>
      </View>
    </TouchableOpacity>
  );
}

function OptionsMenu({
  visible,
  onClose,
  onDelete,
  onFavorite,
}: {
  visible: boolean;
  onClose: () => void;
  onDelete: () => void;
  onFavorite: () => void;
}) {
  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <TouchableOpacity
        style={styles.modalOverlay}
        activeOpacity={1}
        onPress={onClose}
      >
        <View style={styles.optionsMenu}>
          <TouchableOpacity style={styles.optionItem} onPress={onFavorite}>
            <Ionicons name="star-outline" size={24} color="#333" />
            <ThemedText style={styles.optionText}>
              Add to Favorites sourabh-2
            </ThemedText>
          </TouchableOpacity>
          <TouchableOpacity style={styles.optionItem} onPress={onDelete}>
            <Ionicons name="trash-outline" size={24} color="#ff4444" />
            <ThemedText style={[styles.optionText, { color: "#ff4444" }]}>
              Delete
            </ThemedText>
          </TouchableOpacity>
        </View>
      </TouchableOpacity>
    </Modal>
  );
}

function DesignCard({
  title,
  type,
  imageUrl,
}: {
  title: string;
  type: string;
  imageUrl?: string;
}) {
  const [showOptions, setShowOptions] = useState(false);

  const handleDelete = () => {
    // Implement delete functionality
    setShowOptions(false);
  };

  const handleFavorite = () => {
    // Implement favorite functionality
    setShowOptions(false);
  };

  return (
    <>
      <TouchableOpacity style={styles.designCard}>
        <View style={styles.designPreview}>
          {imageUrl && (
            <Image
              source={{ uri: imageUrl }}
              style={styles.designPreviewImage}
              resizeMode="cover"
            />
          )}
        </View>
        <View style={styles.designInfo}>
          <ThemedText style={styles.designTitle}>{title}</ThemedText>
          <ThemedText style={styles.designType}>{type}</ThemedText>
        </View>
        <TouchableOpacity
          style={styles.moreButton}
          onPress={() => setShowOptions(true)}
        >
          <Ionicons name="ellipsis-horizontal" size={20} color="#666" />
        </TouchableOpacity>
      </TouchableOpacity>
      <OptionsMenu
        visible={showOptions}
        onClose={() => setShowOptions(false)}
        onDelete={handleDelete}
        onFavorite={handleFavorite}
      />
    </>
  );
}

function WhatsNewSection() {
  const scrollViewRef = useRef<ScrollView>(null);
  const [currentIndex, setCurrentIndex] = useState(0);
  const screenWidth = Dimensions.get("window").width;
  const cardWidth = 280; // Width of each card
  const cardMargin = 12; // Margin between cards
  const totalWidth = cardWidth + cardMargin;

  // Create an extended array for infinite scroll effect
  const extendedData = [...whatsNewData, ...whatsNewData];

  useEffect(() => {
    const scrollInterval = setInterval(() => {
      if (currentIndex < whatsNewData.length - 1) {
        setCurrentIndex(currentIndex + 1);
        scrollViewRef.current?.scrollTo({
          x: (currentIndex + 1) * totalWidth,
          animated: true,
        });
      } else {
        setCurrentIndex(0);
        scrollViewRef.current?.scrollTo({
          x: 0,
          animated: true,
        });
      }
    }, 5000); // Scroll every 5 seconds

    return () => clearInterval(scrollInterval);
  }, [currentIndex]);

  const handleScroll = (event: any) => {
    const scrollX = event.nativeEvent.contentOffset.x;
    const index = Math.round(scrollX / totalWidth);
    setCurrentIndex(index % whatsNewData.length);
  };

  return (
    <View style={styles.section}>
      <ThemedText style={styles.sectionTitle}>What's new card</ThemedText>
      <ScrollView
        ref={scrollViewRef}
        horizontal
        showsHorizontalScrollIndicator={false}
        style={styles.whatsNewScroll}
        pagingEnabled
        onScroll={handleScroll}
        scrollEventThrottle={16}
      >
        {extendedData.map((item, index) => (
          <WhatsNewCard
            key={`${item.id}-${index}`}
            title={item.title}
            imageUrl={item.imageUrl}
            onPress={() => router.push(`/template-editor/${item.id}`)}
          />
        ))}
      </ScrollView>
      <View style={styles.paginationDots}>
        {whatsNewData.map((_, index) => (
          <View
            key={index}
            style={[
              styles.dot,
              {
                backgroundColor: currentIndex === index ? "#8B3DFF" : "#D8D8D8",
              },
            ]}
          />
        ))}
      </View>
    </View>
  );
}

// Function for category icons
function CategoryIcon({
  icon,
  name,
  color,
  onPress,
}: {
  icon: string;
  name: string;
  color: string;
  onPress: () => void;
}) {
  return (
    <TouchableOpacity style={styles.categoryItem} onPress={onPress}>
      <View style={[styles.categoryIconContainer, { backgroundColor: color }]}>
        <Ionicons name={icon as any} size={24} color="#fff" />
      </View>
      <ThemedText style={styles.categoryName}>{toCamelCase(name)}</ThemedText>
    </TouchableOpacity>
  );
}

// Function for the AI feature buttons
function AIFeatureButton({ icon, text }: { icon: string; text: string }) {
  return (
    <TouchableOpacity style={styles.aiFeatureButton}>
      <View style={styles.aiFeatureIcon}>
        <Ionicons name={icon as any} size={22} color="#8B3DFF" />
      </View>
      <ThemedText style={styles.aiFeatureText}>{text}</ThemedText>
    </TouchableOpacity>
  );
}

// Updated RecentDesignCard component to include navigation and fix image display
function RecentDesignCard({
  id,
  title,
  description,
  imageUrl,
}: {
  id: string;
  title: string;
  description: string;
  imageUrl: string;
}) {
  const router = useRouter();

  const handlePress = () => {
    router.push(`/template-editor/${id}`);
  };

  return (
    <TouchableOpacity style={styles.recentDesignCard} onPress={handlePress}>
      <Image
        source={{ uri: imageUrl }}
        style={styles.recentDesignImage}
        resizeMode="cover"
      />
      <View style={styles.recentDesignInfo}>
        <ThemedText style={styles.recentDesignTitle}>
          {toCamelCase(title)}
        </ThemedText>
        <ThemedText style={styles.recentDesignType}>
          {toCamelCase(description)}
        </ThemedText>
      </View>
    </TouchableOpacity>
  );
}

// First, let's update the ComingSoonCard component to support custom messages
function ComingSoonCard({
  title = "Coming Soon!",
  text = "New templates are on the way",
}) {
  return (
    <View style={styles.comingSoonCard}>
      <View style={styles.comingSoonContent}>
        <Ionicons name="time-outline" size={32} color="#8B3DFF" />
        <ThemedText style={styles.comingSoonTitle}>{title}</ThemedText>
        <ThemedText style={styles.comingSoonText}>{text}</ThemedText>
      </View>
    </View>
  );
}

export default function HomeScreen() {
  // Get the scroll context and navigation
  const { scrollY } = useScrollContext();
  const router = useRouter();
  const dispatch = useDispatch();

  // Add a state to track initial data loading
  const [initialDataFetched, setInitialDataFetched] = useState(false);

  // Check if user is authenticated
  const isAuthenticated = useSelector((state: RootState) =>
    Boolean(state.auth.token)
  );

  // Get the recent templates from the home state
  const {
    recentTemplates,
    loading: loadingRecentTemplates,
    error: recentTemplatesError,
  } = useSelector((state: RootState) => state.home);

  // Get holiday templates
  const {
    holidayTemplates,
    loading: holidayLoading,
    error: holidayError,
  } = useSelector((state: RootState) => state.home);

  // Get categories data
  const { categories, loadingCategories, categoriesError } = useSelector(
    (state: RootState) => state.templates
  );

  // Add state to track current recent design index
  const [recentDesignIndex, setRecentDesignIndex] = useState(0);
  // Add state for holiday index
  const [holidayIndex, setHolidayIndex] = useState(0);

  // Fetch data when the component mounts
  useEffect(() => {
    if (isAuthenticated && !initialDataFetched) {
      console.log("Fetching initial home data...");

      // Use Promise.all to fetch all data in parallel
      const fetchAllData = async () => {
        try {
          await Promise.all([
            dispatch(fetchCategories()),
            dispatch(fetchRecentTemplates()),
            dispatch(fetchWhatsNewTags()),
            dispatch(fetchHolidayTemplates()),
          ]);

          console.log("All initial data fetched successfully");
          setInitialDataFetched(true);
        } catch (error) {
          console.error("Error fetching initial data:", error);
        }
      };

      fetchAllData();
    }
  }, [isAuthenticated, initialDataFetched, dispatch]);

  // Add new useEffect to log data changes
  useEffect(() => {
    console.log("Recent templates updated:", {
      count: recentTemplates?.length || 0,
      loading: loadingRecentTemplates,
      error: recentTemplatesError,
    });

    console.log("Holiday templates updated:", {
      count: holidayTemplates?.length || 0,
      loading: holidayLoading,
      error: holidayError,
    });
  }, [
    recentTemplates,
    loadingRecentTemplates,
    recentTemplatesError,
    holidayTemplates,
    holidayLoading,
    holidayError,
  ]);

  // Handle scroll events
  const handleScroll = Animated.event(
    [{ nativeEvent: { contentOffset: { y: scrollY } } }],
    { useNativeDriver: false }
  );

  // Handle category press with auth check
  const handleCategoryPress = (categoryName: string) => {
    if (!isAuthenticated) {
      // If not authenticated, redirect to login
      router.replace("/login");
      return;
    }

    // Pre-fetch the data for better UX
    dispatch(fetchTemplatesByCategory(categoryName));

    // Navigate to templateCategories with the category name
    router.push(`/templateCategories?category=${categoryName}`);
  };

  const { whatsNewTags, whatsNewTemplates, whatsNewLoading, whatsNewError } =
    useSelector((state: RootState) => state.home);

  const [currentWhatsNewIndex, setCurrentWhatsNewIndex] = useState(0);

  // Function to handle What's New tag group click - call search API here
  const handleWhatsNewTagClick = (tagGroup: {
    id: string;
    label: string;
    tags: string[];
  }) => {
    // Construct the query string from tags
    const queryString = tagGroup.tags.join("&");

    // Navigate to activeTemplate page with the query string
    router.push({
      pathname: "/activeTemplate",
      params: {
        query: queryString,
        label: tagGroup.label,
      },
    });
  };

  // Prepare what's new data for display
  // Flatten all tag groups' templates and combine them for display
  const whatsNewItems = whatsNewTags.flatMap((tagGroup) =>
    tagGroup.tags.flatMap((tag) =>
      (whatsNewTemplates[tag] || []).map((template) => ({
        id: template.id,
        title: template.templateName,
        imageUrl: template.url,
        description: template.description,
      }))
    )
  );

  return (
    <ThemedView style={styles.container}>
      <Animated.ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
        onScroll={handleScroll}
        scrollEventThrottle={16} // Important for smooth animation
      >
        {/* Hero banner with image background */}
        <View style={styles.heroBanner}>
          <Image
            source={{
              uri: "https://img.freepik.com/free-photo/vivid-blurred-colorful-wallpaper-background_58702-3773.jpg?t=st=1742381953~exp=1742385553~hmac=02f32b860999373a9284b0063442882c4cf6a6af557bca445c5d88e50487dcda&w=996",
            }}
            style={styles.heroBannerBackground}
            resizeMode="cover"
          />
          <View style={styles.heroTextContainer}>
            <ThemedText style={styles.heroText}>
              What you want to Communicate today ?
            </ThemedText>
          </View>
        </View>

        {/* Categories section with updated onPress handler */}
        <View style={styles.categoriesContainer}>
          {loadingCategories ? (
            <ActivityIndicator size="large" color="#8B3DFF" />
          ) : categoriesError ? (
            <ThemedText style={styles.errorText}>{categoriesError}</ThemedText>
          ) : (
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.categoriesScrollContent}
            >
              {categories.map((category) => (
                <CategoryIcon
                  key={category.id}
                  icon={category.icon}
                  name={category.name}
                  color={category.color}
                  onPress={() => handleCategoryPress(category.name)}
                />
              ))}
            </ScrollView>
          )}
        </View>

        {/* AI Features section - now scrollable */}
        {/* <View style={styles.aiFeaturesSection}>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.aiFeaturesScrollContent}
          >
            {aiFeatureData.map((feature) => (
              <AIFeatureButton
                key={feature.id}
                icon={feature.icon}
                text={feature.text}
              />
            ))}
          </ScrollView>
        </View> */}

        {/* What's new section */}
        <View style={styles.sectionContainer}>
          <View style={styles.sectionHeader}>
            <ThemedText style={styles.sectionTitle}>What's new</ThemedText>
            {whatsNewTags.length > 0 && (
              <TouchableOpacity onPress={() => router.push("/whatsNew")}>
                <ThemedText style={styles.seeAll}>See all</ThemedText>
              </TouchableOpacity>
            )}
          </View>

          {whatsNewLoading ? (
            <ActivityIndicator size="large" color="#8B3DFF" />
          ) : whatsNewError ? (
            <ThemedText style={styles.errorText}>{whatsNewError}</ThemedText>
          ) : whatsNewTags.length === 0 ? (
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              style={styles.whatsNewScroll}
              contentContainerStyle={styles.whatsNewScrollContent}
            >
              <ComingSoonCard />
            </ScrollView>
          ) : (
            <>
              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                style={styles.whatsNewScroll}
                contentContainerStyle={styles.whatsNewScrollContent}
                pagingEnabled
                onScroll={(event) => {
                  const scrollX = event.nativeEvent.contentOffset.x;
                  const itemWidth = 182; // card width (170) + margin (12)
                  const totalItems = whatsNewTags.length;

                  // Get the current index considering the infinite scrolling
                  let index = Math.round(scrollX / itemWidth) % totalItems;
                  if (index < 0) index += totalItems;

                  setCurrentWhatsNewIndex(index);

                  // Check if we've scrolled to the duplicate section and need to loop back
                  if (scrollX >= itemWidth * totalItems) {
                    // Silently scroll back to the original set
                    const scrollViewRef = event.target as any;
                    scrollViewRef?.scrollTo({
                      x: scrollX % (itemWidth * totalItems),
                      animated: false,
                    });
                  } else if (scrollX < 0) {
                    // Scroll to the end of the original set
                    const scrollViewRef = event.target as any;
                    scrollViewRef?.scrollTo({
                      x: itemWidth * totalItems + scrollX,
                      animated: false,
                    });
                  }
                }}
                scrollEventThrottle={16}
              >
                {/* Prepend with the last few items for looping backwards */}
                {whatsNewTags.slice(-3).map((tagGroup, index) => (
                  <WhatsNewCard
                    key={`prepend-${tagGroup.id}-${index}`}
                    label={tagGroup.label}
                    webp={tagGroup.webp}
                    tags={tagGroup.tags}
                    onPress={() => handleWhatsNewTagClick(tagGroup)}
                  />
                ))}

                {/* Original items */}
                {whatsNewTags.map((tagGroup, index) => (
                  <WhatsNewCard
                    key={`${tagGroup.id}-${index}`}
                    label={tagGroup.label}
                    webp={tagGroup.webp}
                    tags={tagGroup.tags}
                    onPress={() => handleWhatsNewTagClick(tagGroup)}
                  />
                ))}

                {/* Append with the first few items for looping forwards */}
                {whatsNewTags.slice(0, 3).map((tagGroup, index) => (
                  <WhatsNewCard
                    key={`append-${tagGroup.id}-${index}`}
                    label={tagGroup.label}
                    webp={tagGroup.webp}
                    tags={tagGroup.tags}
                    onPress={() => handleWhatsNewTagClick(tagGroup)}
                  />
                ))}
              </ScrollView>
              <View style={styles.paginationDots}>
                {whatsNewTags.map((_, index) => (
                  <View
                    key={index}
                    style={[
                      styles.dot,
                      {
                        backgroundColor:
                          currentWhatsNewIndex === index
                            ? "#8B3DFF"
                            : "#D8D8D8",
                      },
                    ]}
                  />
                ))}
              </View>
            </>
          )}
        </View>

        {/* Recent designs section */}
        <View style={styles.sectionContainer}>
          <View style={styles.sectionHeader}>
            <ThemedText style={styles.sectionTitle}>Recent designs</ThemedText>
            {recentTemplates?.length > 0 && (
              <TouchableOpacity onPress={() => router.push("/myTemplates")}>
                <ThemedText style={styles.seeAll}>See all</ThemedText>
              </TouchableOpacity>
            )}
          </View>

          {loadingRecentTemplates ? (
            <ActivityIndicator
              size="large"
              color="#8B3DFF"
              style={{ marginTop: 10 }}
            />
          ) : recentTemplatesError ? (
            <ThemedText style={styles.errorText}>
              {recentTemplatesError}
            </ThemedText>
          ) : !recentTemplates || recentTemplates.length === 0 ? (
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              style={styles.recentDesignsScroll}
              contentContainerStyle={styles.recentDesignsScrollContent}
            >
              <ComingSoonCard
                title="No Recent Templates"
                text="You haven't created any templates yet"
              />
            </ScrollView>
          ) : (
            <>
              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                style={styles.recentDesignsScroll}
                contentContainerStyle={styles.recentDesignsScrollContent}
                onScroll={(event) => {
                  const scrollX = event.nativeEvent.contentOffset.x;
                  const itemWidth = 182; // card width (170) + margin (12)
                  const visibleTemplates = recentTemplates.slice(0, 5);
                  const totalItems = visibleTemplates.length;

                  // Get the current index considering the infinite scrolling
                  let index = Math.round(scrollX / itemWidth) % totalItems;
                  if (index < 0) index += totalItems;

                  setRecentDesignIndex(index);

                  // Check if we've scrolled to the duplicate section and need to loop back
                  if (scrollX >= itemWidth * totalItems) {
                    // Silently scroll back to the original set
                    const scrollViewRef = event.target as any;
                    scrollViewRef?.scrollTo({
                      x: scrollX % (itemWidth * totalItems),
                      animated: false,
                    });
                  } else if (scrollX < 0) {
                    // Scroll to the end of the original set
                    const scrollViewRef = event.target as any;
                    scrollViewRef?.scrollTo({
                      x: itemWidth * totalItems + scrollX,
                      animated: false,
                    });
                  }
                }}
                scrollEventThrottle={16}
                pagingEnabled
              >
                {/* Prepend with the last few items for looping backwards */}
                {recentTemplates
                  .slice(-3)
                  .slice(0, 5)
                  .map((template) => (
                    <RecentDesignCard
                      key={`prepend-${template.id}`}
                      id={template.id}
                      title={template.templateName || "Untitled Template"}
                      description={template.description || "Design"}
                      imageUrl={template.url}
                    />
                  ))}

                {/* Original items */}
                {recentTemplates.slice(0, 5).map((template) => (
                  <RecentDesignCard
                    key={template.id}
                    id={template.id}
                    title={template.templateName || "Untitled Template"}
                    description={template.description || "Design"}
                    imageUrl={template.url}
                  />
                ))}

                {/* Append with the first few items for looping forwards */}
                {recentTemplates.slice(0, 3).map((template) => (
                  <RecentDesignCard
                    key={`append-${template.id}`}
                    id={template.id}
                    title={template.templateName || "Untitled Template"}
                    description={template.description || "Design"}
                    imageUrl={template.url}
                  />
                ))}
              </ScrollView>
              <View style={styles.paginationDots}>
                {recentTemplates.slice(0, 5).map((_, index) => (
                  <View
                    key={index}
                    style={[
                      styles.dot,
                      {
                        backgroundColor:
                          recentDesignIndex === index ? "#8B3DFF" : "#D8D8D8",
                      },
                    ]}
                  />
                ))}
              </View>
            </>
          )}
        </View>

        {/* Holidays section - similar update as above */}
        <View style={styles.sectionContainer}>
          <View style={styles.sectionHeader}>
            <ThemedText style={styles.sectionTitle}>
              Holidays template
            </ThemedText>
            {holidayTemplates?.length > 0 && (
              <TouchableOpacity onPress={() => router.push("/holiday")}>
                <ThemedText style={styles.seeAll}>See all</ThemedText>
              </TouchableOpacity>
            )}
          </View>

          {holidayLoading ? (
            <ActivityIndicator
              size="large"
              color="#8B3DFF"
              style={{ marginTop: 10 }}
            />
          ) : holidayError ? (
            <ThemedText style={styles.errorText}>{holidayError}</ThemedText>
          ) : !holidayTemplates || holidayTemplates.length === 0 ? (
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              style={styles.recentDesignsScroll}
              contentContainerStyle={styles.recentDesignsScrollContent}
            >
              <ComingSoonCard />
            </ScrollView>
          ) : (
            <>
              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                style={styles.recentDesignsScroll}
                contentContainerStyle={styles.recentDesignsScrollContent}
                pagingEnabled
                onScroll={(event) => {
                  const scrollX = event.nativeEvent.contentOffset.x;
                  const itemWidth = 182; // card width (170) + margin (12)
                  const visibleTemplates = holidayTemplates.slice(0, 5);
                  const totalItems = visibleTemplates.length;

                  // Get the current index considering the infinite scrolling
                  let index = Math.round(scrollX / itemWidth) % totalItems;
                  if (index < 0) index += totalItems;

                  // Update a state for the holiday section (need to add this state)
                  setHolidayIndex(index);

                  // Check if we've scrolled to the duplicate section and need to loop back
                  if (scrollX >= itemWidth * totalItems) {
                    // Silently scroll back to the original set
                    const scrollViewRef = event.target as any;
                    scrollViewRef?.scrollTo({
                      x: scrollX % (itemWidth * totalItems),
                      animated: false,
                    });
                  } else if (scrollX < 0) {
                    // Scroll to the end of the original set
                    const scrollViewRef = event.target as any;
                    scrollViewRef?.scrollTo({
                      x: itemWidth * totalItems + scrollX,
                      animated: false,
                    });
                  }
                }}
                scrollEventThrottle={16}
              >
                {/* Prepend with the last few items for looping backwards */}
                {holidayTemplates
                  .slice(-3)
                  .slice(0, 5)
                  .map((template) => (
                    <RecentDesignCard
                      key={`prepend-${template.id}`}
                      id={template.id}
                      title={template.templateName || "Untitled Template"}
                      description={template.description || "Holiday Design"}
                      imageUrl={template.url}
                    />
                  ))}

                {/* Original items */}
                {holidayTemplates.slice(0, 5).map((template) => (
                  <RecentDesignCard
                    key={template.id}
                    id={template.id}
                    title={template.templateName || "Untitled Template"}
                    description={template.description || "Holiday Design"}
                    imageUrl={template.url}
                  />
                ))}

                {/* Append with the first few items for looping forwards */}
                {holidayTemplates.slice(0, 3).map((template) => (
                  <RecentDesignCard
                    key={`append-${template.id}`}
                    id={template.id}
                    title={template.templateName || "Untitled Template"}
                    description={template.description || "Holiday Design"}
                    imageUrl={template.url}
                  />
                ))}
              </ScrollView>
              {holidayTemplates.length > 0 && (
                <View style={styles.paginationDots}>
                  {holidayTemplates.slice(0, 5).map((_, index) => (
                    <View
                      key={index}
                      style={[
                        styles.dot,
                        {
                          backgroundColor:
                            holidayIndex === index ? "#8B3DFF" : "#D8D8D8",
                        },
                      ]}
                    />
                  ))}
                </View>
              )}
            </>
          )}
        </View>
      </Animated.ScrollView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
  },
  scrollContent: {
    paddingTop: 16, // Proper spacing from the top
  },
  heroBanner: {
    height: 160,
    marginHorizontal: 16,
    marginBottom: 24,
    borderRadius: 20,
    overflow: "hidden",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  heroBannerBackground: {
    ...StyleSheet.absoluteFillObject,
  },
  heroTextContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(85, 60, 180, 0.3)",
  },
  heroText: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#fff",
    textAlign: "center",
    textShadowColor: "rgba(0, 0, 0, 0.3)",
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 3,
    padding:25
  },
  categoriesContainer: {
    marginBottom: 20,
  },
  categoriesScrollContent: {
    paddingHorizontal: 16,
    paddingBottom: 8,
  },
  categoryItem: {
    alignItems: "center",
    marginRight: 20,
    width: 72,
  },
  categoryIconContainer: {
    width: 56,
    height: 56,
    justifyContent: "center",
    alignItems: "center",
    borderRadius: 28,
    backgroundColor: "#FF4D4D",
    marginBottom: 8,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 3,
  },
  categoryName: {
    fontSize: 11,
    textAlign: "center",
    marginTop: 5,
    width: "100%", // Ensure text has enough space
    flexWrap: "wrap", // Allow text to wrap if needed
  },
  aiFeaturesSection: {
    marginBottom: 24,
  },
  aiFeaturesScrollContent: {
    paddingHorizontal: 16,
    paddingBottom: 8,
  },
  aiFeatureButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#f2f0f7",
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 22,
    marginRight: 12,
    width: 180,
    shadowColor: "#8B3DFF",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 1,
  },
  aiFeatureIcon: {
    marginRight: 8,
  },
  aiFeatureText: {
    fontSize: 14,
    fontWeight: "500",
    color: "#333",
  },
  sectionContainer: {
    marginBottom: 24,
  },
  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 16,
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "bold",
    marginLeft: 16,
    marginBottom: 12,
  },
  seeAll: {
    color: "#8B3DFF",
    fontSize: 15,
    fontWeight: "500",
  },
  whatsNewScroll: {
    paddingLeft: 16,
  },
  whatsNewScrollContent: {
    paddingRight: 16,
  },
  whatsNewCard: {
    width: 170,
    height: 150,
    borderRadius: 12,
    marginRight: 12,
    overflow: "hidden",
    position: "relative",
    backgroundColor: "#fff",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.1,
    shadowRadius: 5,
    elevation: 3,
  },
  whatsNewImage: {
    position: "absolute",
    top: 0,
    left: 0,
    width: "100%",
    height: "100%",
  },
  whatsNewOverlay: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    padding: 10,
    backgroundColor: "rgba(0, 0, 0, 0.3)",
  },
  whatsNewTitle: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
    textShadowColor: "rgba(0, 0, 0, 0.5)",
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 3,
  },
  paginationDots: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    marginTop: 12,
  },
  dot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    marginHorizontal: 3,
  },
  designsGrid: {
    paddingHorizontal: 16,
  },
  designCard: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 10,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 4,
    elevation: 2,
  },
  designPreview: {
    width: 60,
    height: 60,
    backgroundColor: "#f5f5f5",
    borderRadius: 6,
    overflow: "hidden",
  },
  designPreviewImage: {
    width: "100%",
    height: "100%",
  },
  designInfo: {
    flex: 1,
    marginLeft: 12,
  },
  designTitle: {
    fontSize: 15,
    fontWeight: "600",
  },
  designType: {
    fontSize: 13,
    color: "#666",
    marginTop: 4,
  },
  moreButton: {
    padding: 8,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "center",
    alignItems: "center",
  },
  optionsMenu: {
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 8,
    width: "80%",
    maxWidth: 300,
  },
  optionItem: {
    flexDirection: "row",
    alignItems: "center",
    padding: 16,
    borderRadius: 8,
  },
  optionText: {
    fontSize: 16,
    marginLeft: 12,
  },
  recentDesignsScroll: {
    paddingLeft: 16,
  },
  recentDesignsScrollContent: {
    paddingRight: 16,
  },
  recentDesignCard: {
    width: 170,
    height: 150,
    borderRadius: 12,
    padding: 0,
    marginRight: 12,
    overflow: "hidden",
    justifyContent: "flex-end",
    backgroundColor: "#fff",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.1,
    shadowRadius: 5,
    elevation: 3,
    position: "relative",
  },
  recentDesignImage: {
    position: "absolute",
    top: 0,
    left: 0,
    width: "100%",
    height: "100%",
  },
  recentDesignInfo: {
    zIndex: 1,
    padding: 10,
    width: "100%",
    backgroundColor: "rgba(0, 0, 0, 0.3)",
  },
  recentDesignTitle: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
    textShadowColor: "rgba(0, 0, 0, 0.5)",
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 3,
  },
  recentDesignType: {
    color: "#fff",
    fontSize: 14,
    opacity: 0.9,
    marginTop: 2,
    textShadowColor: "rgba(0, 0, 0, 0.5)",
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 2,
  },
  section: {
    marginBottom: 20,
  },
  errorText: {
    color: "#ff4444",
    fontSize: 16,
    fontWeight: "bold",
    textAlign: "center",
    marginTop: 20,
  },
  noDataText: {
    fontSize: 16,
    textAlign: "center",
    marginTop: 20,
    color: "#666",
  },
  comingSoonCard: {
    width: 170,
    height: 150,
    backgroundColor: "#f8f8f8",
    borderRadius: 12,
    marginRight: 12,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 1.5,
    borderColor: "#e0e0e0",
    borderStyle: "dashed",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.1,
    shadowRadius: 5,
    elevation: 3,
  },
  comingSoonContent: {
    alignItems: "center",
    justifyContent: "center",
    padding: 16,
  },
  comingSoonTitle: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#8B3DFF",
    marginTop: 8,
    marginBottom: 4,
  },
  comingSoonText: {
    fontSize: 12,
    color: "#666",
    textAlign: "center",
    lineHeight: 16,
  },
});
