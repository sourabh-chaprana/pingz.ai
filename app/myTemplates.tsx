import React, { useEffect } from 'react';
import { StyleSheet, View, FlatList, Image, TouchableOpacity, ActivityIndicator, Dimensions, Platform } from 'react-native';
import { useRouter } from 'expo-router';
import { ThemedText } from '@/components/ThemedText';
import { useDispatch, useSelector } from 'react-redux';
import { fetchTemplates } from '@/src/features/home/homeThunks';
import { resetTemplates } from '@/src/features/home/homeSlice';
import { RootState } from '@/src/store';

interface Template {
  id: string;
  templateName: string;
  url: string;
  description: string;
  event: string;
  premium: boolean;
}

const toCamelCase = (str: string) => {
  if (!str) return '';
  
  // Convert to camelCase and add spaces
  const withSpaces = str
    .split(/[-_\s]+/)
    .map((word) => {
      // Always capitalize first letter of each word
      return word.charAt(0).toUpperCase() + word.slice(1).toLowerCase();
    })
    .join(' ');
  
  return withSpaces;
};

export default function MyTemplates() {
  const dispatch = useDispatch();
  const router = useRouter();
  const windowWidth = Dimensions.get('window').width;
  const numColumns = 2;
  const cardWidth = (windowWidth - 48) / numColumns; // 48 = padding + gap

  const { templates, loading, pagination } = useSelector((state: RootState) => state.home);

  useEffect(() => {
    dispatch(resetTemplates());
    loadTemplates();
  }, []);

  const loadTemplates = async () => {
    // Don't fetch if already loading or no more pages
    if (loading || pagination.isLoadingMore || !pagination.hasMore) return;

    dispatch(
      fetchTemplates({
        page: pagination.currentPage,
        size: 10,
      })
    );
  };

  const handleTemplatePress = (templateId: string) => {
    router.push(`/template-editor/${templateId}`);
  };

  const renderTemplate = ({ item }: { item: Template }) => (
    <TouchableOpacity
      style={[styles.card, { width: cardWidth }]}
      onPress={() => handleTemplatePress(item.id)}
    >
      <View style={styles.imageContainer}>
        <Image
          source={{ uri: item.url }}
          style={styles.image}
          resizeMode="contain"
        />
        {item.premium && (
          <View style={styles.premiumBadge}>
            <ThemedText style={styles.premiumText}>Pro</ThemedText>
          </View>
        )}
      </View>
    </TouchableOpacity>
  );

  const renderFooter = () => {
    if (!pagination.isLoadingMore) return null;
    return (
      <View style={styles.footer}>
        <ActivityIndicator size="large" color="#8B3DFF" />
      </View>
    );
  };

  if (loading && templates.length === 0) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#8B3DFF" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <FlatList
        data={templates}
        renderItem={renderTemplate}
        keyExtractor={item => item.id}
        numColumns={2}
        contentContainerStyle={styles.listContainer}
        onEndReached={loadTemplates}
        onEndReachedThreshold={0.5}
        ListFooterComponent={renderFooter}
        // Add these props to improve performance
        removeClippedSubviews={true}
        maxToRenderPerBatch={10}
        windowSize={10}
        initialNumToRender={10}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  listContainer: {
    padding: 16,
    gap: 16,
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 16,
    overflow: 'hidden',
    marginHorizontal: 8,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 6,
  },
  imageContainer: {
    width: '100%',
    aspectRatio: 1,
    backgroundColor: '#f5f5f5',
    padding: 8,
    position: 'relative',
  },
  image: {
    width: '100%',
    height: '100%',
  },
  premiumBadge: {
    position: 'absolute',
    top: 8,
    right: 8,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
  },
  premiumText: {
    fontSize: 10,
    color: '#FFFFFF',
    fontWeight: '600',
  },
  footer: {
    paddingVertical: 20,
    alignItems: 'center',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fff',
  },
}); 