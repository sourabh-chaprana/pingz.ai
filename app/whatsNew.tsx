import React, { useEffect, useState } from 'react';
import { 
  View, 
  StyleSheet, 
  Image, 
  TouchableOpacity, 
  ScrollView, 
  ActivityIndicator,
  Dimensions 
} from 'react-native';
import { useRouter } from 'expo-router';
import { ThemedView } from '@/components/ThemedView';
import { ThemedText } from '@/components/ThemedText';
import { Ionicons } from '@expo/vector-icons';
import { useDispatch, useSelector } from 'react-redux';
import { fetchWhatsNewTags } from '@/src/features/home/homeThunks';
import { RootState } from '@/src/store';

// Helper function to convert to title case
const toCamelCase = (str: string) => {
  if (!str) return '';
  
  const withSpaces = str
    .split(/[-_\s]+/)
    .map((word) => {
      return word.charAt(0).toUpperCase() + word.slice(1).toLowerCase();
    })
    .join(' ');
  
  return withSpaces;
};

// What's New Card component without title overlay
function WhatsNewCard({
  webp,
  tags,
  onPress,
}: {
  label?: string; // Made optional since we're not using it
  webp: string;
  tags: string[];
  onPress: () => void;
}) {
  return (
    <TouchableOpacity 
      style={styles.whatsNewCard}
      onPress={onPress}
    >
      {/* Display the webp image from base64 without overlay text */}
      <Image
        source={{ uri: `data:image/webp;base64,${webp}` }}
        style={styles.whatsNewImage}
        resizeMode="cover"
      />
      {/* Removed the text overlay */}
    </TouchableOpacity>
  );
}

export default function WhatsNewPage() {
  const router = useRouter();
  const dispatch = useDispatch();
  
  // Get What's New tags from Redux state
  const {
    whatsNewTags,
    whatsNewLoading,
    whatsNewError
  } = useSelector((state: RootState) => state.home);

  // Fetch What's New tags on component mount
  useEffect(() => {
    dispatch(fetchWhatsNewTags());
  }, [dispatch]);
  
  // Function to handle card click
  const handleWhatsNewTagClick = (tagGroup: { id: string; label: string; tags: string[] }) => {
    // Construct the query string from tags
    const queryString = tagGroup.tags.join('&');
    
    // Navigate to activeTemplate with the query string and source parameter
    router.push({
      pathname: '/activeTemplate',
      params: { 
        query: queryString,
        label: tagGroup.label,
        source: 'whatsNew'  // Add source parameter
      }
    });
  };

  return (
    <ThemedView style={styles.container}>
      {/* Simplified header with just a back button - no title */}
      <View style={styles.header}>
        <TouchableOpacity 
          style={styles.backButton}
          onPress={() => router.back()}
        >
          <Ionicons name="arrow-back" size={24} color="#333" />
        </TouchableOpacity>
        <ThemedText style={styles.headerTitle}>What's New</ThemedText>
      </View>
      
      {/* Content */}
      {whatsNewLoading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#8B3DFF" />
        </View>
      ) : whatsNewError ? (
        <View style={styles.errorContainer}>
          <Ionicons name="alert-circle-outline" size={48} color="#ff4444" />
        </View>
      ) : (
        <ScrollView 
          contentContainerStyle={styles.content}
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.cardsGrid}>
            {whatsNewTags.map((tagGroup) => (
              <WhatsNewCard
                key={tagGroup.id}
                webp={tagGroup.webp}
                tags={tagGroup.tags}
                onPress={() => handleWhatsNewTagClick(tagGroup)}
              />
            ))}
          </View>
        </ScrollView>
      )}
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  backButton: {
    padding: 8,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginLeft: 8,
  },
  content: {
    padding: 16,
  },
  cardsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  whatsNewCard: {
    width: '48%', // Two cards per row with some margin
    height: 150,
    borderRadius: 12,
    marginBottom: 16,
    overflow: 'hidden',
    position: 'relative',
    backgroundColor: '#fff',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.1,
    shadowRadius: 5,
    elevation: 3,
  },
  whatsNewImage: {
    position: 'absolute',
    top: 0,
    left: 0,
    width: '100%',
    height: '100%',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  }
});
