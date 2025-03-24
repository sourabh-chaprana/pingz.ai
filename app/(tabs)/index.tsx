import { ScrollView, StyleSheet, TouchableOpacity, View, Image, Modal, Dimensions, Animated } from 'react-native';
import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { Ionicons } from '@expo/vector-icons';
import { useState, useRef, useEffect } from 'react';
import React from 'react';
import { useScrollContext } from '@/app/_layout';
import { useRouter } from 'expo-router';
import { useDispatch, useSelector } from 'react-redux';
import { fetchTemplatesByCategory } from '@/src/features/template/templateThunks';
import { RootState } from '@/src/store';

// Add more icons & categories data
const categoryData = [
  { id: '1', name: 'Recommended', icon: 'star', color: '#FF9933' },
  { id: '2', name: 'eCommerce', icon: 'cart', color: '#00CC99' },
  { id: '3', name: 'Marketing', icon: 'megaphone', color: '#6699FF' },
  { id: '4', name: 'Events', icon: 'calendar', color: '#9966CC' },
  { id: '5', name: 'Holidays', icon: 'gift', color: '#FF6666' },
  { id: '6', name: 'Anniversary', icon: 'heart', color: '#FF3366' },
  { id: '7', name: 'Birthday', icon: 'gift', color: '#9933CC' },
  { id: '8', name: 'Auto_Dealers', icon: 'car', color: '#666666' },
  { id: '9', name: 'Restaurants', icon: 'restaurant', color: '#FF6600' },
  { id: '10', name: 'Flirt', icon: 'heart', color: '#FF3366' },
  { id: '11', name: 'Shayari_Poem', icon: 'leaf', color: '#00CC99' },
  { id: '12', name: 'Fashion_Style', icon: 'shirt', color: '#3366CC' },
  { id: '13', name: 'Invitations', icon: 'mail', color: '#3399FF' },
  // { id: '1', name: 'Featured', icon: 'star', color: '#FFA500' },
  // { id: '2', name: 'eCommerce', icon: 'cart', color: '#00BCD4' },
  // { id: '3', name: 'Marketing', icon: 'chatbubble', color: '#2196F3' },
  // { id: '4', name: 'Events', icon: 'calendar', color: '#9C27B0' },
  // { id: '5', name: 'Holidays', icon: 'gift', color: '#E91E63' },
];

// Updated whatsNewData with free images
const whatsNewData = [
  {
    id: '1',
    title: "Illuminate your designs with Ramadan vibes",
    imageUrl: "https://source.unsplash.com/random/500x300/?ramadan",
    color: "#FFB800"
  },
  {
    id: '2',
    title: "Ugadi celebrations with creative designs",
    imageUrl: "https://source.unsplash.com/random/500x300/?celebration",
    color: "#4CAF50"
  },
  {
    id: '3',
    title: "Spring celebrations",
    imageUrl: "https://source.unsplash.com/random/500x300/?spring",
    color: "#9C27B0"
  },
];

// Add more AI features data
const aiFeatureData = [
  { id: '1', text: 'Make me an image', icon: 'help-circle' },
  { id: '2', text: 'Write my first draft', icon: 'create' },
  { id: '3', text: 'Design a logo', icon: 'color-palette' },
  { id: '4', text: 'Create a presentation', icon: 'easel' },
  { id: '5', text: 'Edit my photo', icon: 'image' },
];

// Add recent designs data
const recentDesignsData = [
  {
    id: '1',
    title: "Photography Portfolio",
    type: "Website",
    imageUrl: "https://source.unsplash.com/random/500x300/?photography",
    color: "#5D3FD3"
  },
  {
    id: '2',
    title: "Business Card",
    type: "Print",
    imageUrl: "https://source.unsplash.com/random/500x300/?business,card",
    color: "#FF7F50"
  },
  {
    id: '3',
    title: "Social Media Post",
    type: "Instagram",
    imageUrl: "https://source.unsplash.com/random/500x300/?social,media",
    color: "#1DA1F2"
  },
];

function WhatsNewCard({ title, imageUrl, color }: { title: string; imageUrl: string; color: string }) {
  return (
    <TouchableOpacity style={[styles.whatsNewCard, { backgroundColor: color }]}>
      <ThemedText style={styles.whatsNewTitle}>{title} <Ionicons name="chevron-forward" size={16} color="#fff" /></ThemedText>
      <Image 
        source={{ uri: imageUrl }} 
        style={styles.whatsNewImage}
        resizeMode="cover"
      />
    </TouchableOpacity>
  );
}

function OptionsMenu({ visible, onClose, onDelete, onFavorite }: { 
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
            <ThemedText style={styles.optionText}>Add to Favorites sourabh-2</ThemedText>
          </TouchableOpacity>
          <TouchableOpacity style={styles.optionItem} onPress={onDelete}>
            <Ionicons name="trash-outline" size={24} color="#ff4444" />
            <ThemedText style={[styles.optionText, { color: '#ff4444' }]}>Delete</ThemedText>
          </TouchableOpacity>
        </View>
      </TouchableOpacity>
    </Modal>
  );
}

function DesignCard({ title, type, imageUrl }: { title: string; type: string; imageUrl?: string }) {
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
  const screenWidth = Dimensions.get('window').width;
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
          animated: true
        });
      } else {
        setCurrentIndex(0);
        scrollViewRef.current?.scrollTo({
          x: 0,
          animated: true
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
            color={item.color}
          />
        ))}
      </ScrollView>
      <View style={styles.paginationDots}>
        {whatsNewData.map((_, index) => (
          <View
            key={index}
            style={[
              styles.dot,
              { backgroundColor: currentIndex === index ? '#8B3DFF' : '#D8D8D8' }
            ]}
          />
        ))}
      </View>
    </View>
  );
}

// Function for category icons
function CategoryIcon({ icon, name, color, onPress }: { 
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
      <ThemedText style={styles.categoryName}>{name}</ThemedText>
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

// Function for Recent Design Cards in new style
function RecentDesignCard({ title, type, imageUrl, color }: { 
  title: string;
  type: string;
  imageUrl: string;
  color: string;
}) {
  return (
    <TouchableOpacity style={[styles.recentDesignCard, { backgroundColor: color }]}>
      <View style={styles.recentDesignInfo}>
        <ThemedText style={styles.recentDesignTitle}>{title}</ThemedText>
        <ThemedText style={styles.recentDesignType}>{type}</ThemedText>
      </View>
      <Image 
        source={{ uri: imageUrl }} 
        style={styles.recentDesignImage}
        resizeMode="cover"
      />
    </TouchableOpacity>
  );
}

export default function HomeScreen() {
  // Get the scroll context and navigation
  const { scrollY } = useScrollContext();
  const router = useRouter();
  const dispatch = useDispatch();
  
  // Check if user is authenticated
  const isAuthenticated = useSelector(
    (state: RootState) => Boolean(state.auth.token)
  );
  
  // Handle scroll events
  const handleScroll = Animated.event(
    [{ nativeEvent: { contentOffset: { y: scrollY } } }],
    { useNativeDriver: false }
  );
  
  // Handle category press with auth check
  const handleCategoryPress = (categoryName: string) => {
    if (!isAuthenticated) {
      // If not authenticated, redirect to login
      router.replace('/login');
      return;
    }
    
    // Pre-fetch the data for better UX
    dispatch(fetchTemplatesByCategory(categoryName));
    
    // Navigate to templateCategories with the category name
    router.push(`/templateCategories?category=${categoryName}`);
  };
  
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
            source={{ uri: "https://img.freepik.com/free-photo/vivid-blurred-colorful-wallpaper-background_58702-3773.jpg?t=st=1742381953~exp=1742385553~hmac=02f32b860999373a9284b0063442882c4cf6a6af557bca445c5d88e50487dcda&w=996" }} 
            style={styles.heroBannerBackground}
            resizeMode="cover"
          />
          <View style={styles.heroTextContainer}>
            <ThemedText style={styles.heroText}>
              What will you design today?
            </ThemedText>
          </View>
        </View>

        {/* Categories section with updated onPress handler */}
        <View style={styles.categoriesContainer}>
          <ScrollView 
            horizontal 
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.categoriesScrollContent}
          >
            {categoryData.map((category) => (
              <CategoryIcon
                key={category.id}
                icon={category.icon}
                name={category.name}
                color={category.color}
                onPress={() => handleCategoryPress(category.name)}
              />
            ))}
          </ScrollView>
        </View>

        {/* AI Features section - now scrollable */}
        <View style={styles.aiFeaturesSection}>
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
        </View>

        {/* What's new section */}
        <View style={styles.sectionContainer}>
          <ThemedText style={styles.sectionTitle}>What's new card</ThemedText>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            style={styles.whatsNewScroll}
            contentContainerStyle={styles.whatsNewScrollContent}
            pagingEnabled
          >
            {whatsNewData.map((item, index) => (
              <WhatsNewCard
                key={item.id}
                title={item.title}
                imageUrl={item.imageUrl}
                color={item.color}
              />
            ))}
          </ScrollView>
          <View style={styles.paginationDots}>
            {whatsNewData.map((_, index) => (
              <View
                key={index}
                style={[
                  styles.dot,
                  { backgroundColor: index === 0 ? '#8B3DFF' : '#D8D8D8' }
                ]}
              />
            ))}
          </View>
        </View>

        {/* Recent designs section - now with card style like What's New */}
        <View style={styles.sectionContainer}>
          <View style={styles.sectionHeader}>
            <ThemedText style={styles.sectionTitle}>Recent designs</ThemedText>
            <TouchableOpacity>
              <ThemedText style={styles.seeAll}>See all</ThemedText>
            </TouchableOpacity>
          </View>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            style={styles.recentDesignsScroll}
            contentContainerStyle={styles.recentDesignsScrollContent}
          >
            {recentDesignsData.map((item) => (
              <RecentDesignCard
                key={item.id}
                title={item.title}
                type={item.type}
                imageUrl={item.imageUrl}
                color={item.color}
              />
            ))}
          </ScrollView>
          <View style={styles.paginationDots}>
            {recentDesignsData.map((_, index) => (
              <View
                key={index}
                style={[
                  styles.dot,
                  { backgroundColor: index === 0 ? '#8B3DFF' : '#D8D8D8' }
                ]}
              />
            ))}
          </View>
        </View>
      </Animated.ScrollView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  scrollContent: {
    paddingTop: 16, // Proper spacing from the top
  },
  heroBanner: {
    height: 160,
    marginHorizontal: 16,
    marginBottom: 24,
    borderRadius: 20,
    overflow: 'hidden',
    shadowColor: '#000',
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
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(85, 60, 180, 0.3)',
  },
  heroText: {
    fontSize: 26,
    fontWeight: 'bold',
    color: '#fff',
    textAlign: 'center',
    textShadowColor: 'rgba(0, 0, 0, 0.3)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 3,
  },
  categoriesContainer: {
    marginBottom: 20,
  },
  categoriesScrollContent: {
    paddingHorizontal: 16,
    paddingBottom: 8,
  },
  categoryItem: {
    alignItems: 'center',
    marginRight: 20,
    width: 72,
  },
  categoryIconContainer: {
    width: 56,
    height: 56,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 28,
    backgroundColor: '#FF4D4D',
    marginBottom: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 3,
  },
  categoryName: {
    fontSize: 13,
    textAlign: 'center',
  },
  aiFeaturesSection: {
    marginBottom: 24,
  },
  aiFeaturesScrollContent: {
    paddingHorizontal: 16,
    paddingBottom: 8,
  },
  aiFeatureButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f2f0f7',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 22,
    marginRight: 12,
    width: 180,
    shadowColor: '#8B3DFF',
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
    fontWeight: '500',
    color: '#333',
  },
  sectionContainer: {
    marginBottom: 24,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginLeft: 16,
    marginBottom: 12,
  },
  seeAll: {
    color: '#8B3DFF',
    fontSize: 15,
    fontWeight: '500',
  },
  whatsNewScroll: {
    paddingLeft: 16,
  },
  whatsNewScrollContent: {
    paddingRight: 16,
  },
  whatsNewCard: {
    width: 260,
    height: 140,
    borderRadius: 16,
    padding: 16,
    marginRight: 12,
    overflow: 'hidden',
    justifyContent: 'flex-start',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.1,
    shadowRadius: 5,
    elevation: 3,
  },
  whatsNewTitle: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
    maxWidth: '80%',
    zIndex: 1,
    textShadowColor: 'rgba(0, 0, 0, 0.3)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 3,
  },
  whatsNewImage: {
    width: '70%',
    height: '90%',
    position: 'absolute',
    bottom: 0,
    right: -20,
    opacity: 0.85,
  },
  paginationDots: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
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
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 4,
    elevation: 2,
  },
  designPreview: {
    width: 60,
    height: 60,
    backgroundColor: '#f5f5f5',
    borderRadius: 6,
    overflow: 'hidden',
  },
  designPreviewImage: {
    width: '100%',
    height: '100%',
  },
  designInfo: {
    flex: 1,
    marginLeft: 12,
  },
  designTitle: {
    fontSize: 15,
    fontWeight: '600',
  },
  designType: {
    fontSize: 13,
    color: '#666',
    marginTop: 4,
  },
  moreButton: {
    padding: 8,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  optionsMenu: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 8,
    width: '80%',
    maxWidth: 300,
  },
  optionItem: {
    flexDirection: 'row',
    alignItems: 'center',
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
    width: 260,
    height: 140,
    borderRadius: 16,
    padding: 16,
    marginRight: 12,
    overflow: 'hidden',
    justifyContent: 'flex-start',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.1,
    shadowRadius: 5,
    elevation: 3,
  },
  recentDesignInfo: {
    zIndex: 1,
  },
  recentDesignTitle: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
    maxWidth: '80%',
    textShadowColor: 'rgba(0, 0, 0, 0.3)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 3,
  },
  recentDesignType: {
    color: '#fff',
    fontSize: 14,
    opacity: 0.9,
    marginTop: 4,
    textShadowColor: 'rgba(0, 0, 0, 0.3)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 2,
  },
  recentDesignImage: {
    width: '70%',
    height: '90%',
    position: 'absolute',
    bottom: 0,
    right: -20,
    opacity: 0.85,
  },
  section: {
    marginBottom: 24,
  },
});
