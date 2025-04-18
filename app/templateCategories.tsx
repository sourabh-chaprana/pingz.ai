import { StyleSheet, FlatList, TouchableOpacity, Image, View, ActivityIndicator } from 'react-native';
import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { Ionicons } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { fetchTemplatesByCategory } from '@/src/features/template/templateThunks';
import { RootState } from '@/src/store';
import { Template } from '@/src/features/template/templateSlice';

const toCamelCase = (str: string) => {
  // First convert to camelCase and add spaces
  const withSpaces = str
    .split(/[-_\s]+/)
    .map((word, index) => {
      // Capitalize first letter of each word
      return word.charAt(0).toUpperCase() + word.slice(1).toLowerCase();
    })
    .join(' ');
  
  return withSpaces;
};

export default function TemplateCategories() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const dispatch = useDispatch();
  
  // Get category from params
  const category = params.category as string;
  
  // Get templates data and auth state from Redux store
  const { templates, loading, error, currentCategory } = useSelector(
    (state: RootState) => state.templates
  );
  
  const isAuthenticated = useSelector(
    (state: RootState) => Boolean(state.auth.token)
  );
  
  useEffect(() => {
    // Check if user is authenticated before fetching
    if (!isAuthenticated) {
      // If not authenticated, redirect to login
      router.replace('/login');
      return;
    }
    
    // If we don't have templates for the current category, fetch them
    if (category && (!currentCategory || currentCategory !== category)) {
      dispatch(fetchTemplatesByCategory(category));
    }
  }, [category, currentCategory, dispatch, isAuthenticated, router]);
  
  const handleRetry = () => {
    dispatch(fetchTemplatesByCategory(category));
  };
  
  const renderTemplateItem = ({ item }: { item: Template }) => (
    <TouchableOpacity 
      style={styles.templateCard}
      onPress={() => {
        console.log('Navigating to template editor with ID:', item.id);
        router.push({
          pathname: '/template-editor/[id]',
          params: { 
            id: item.id,
            category: item.category || category
          }
        });
      }}
    >
      <View style={styles.templateImageContainer}>
        <Image 
          source={{ uri: item.url || 'https://via.placeholder.com/150' }} 
          style={styles.templateImage}
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
  
  // If not authenticated, don't render anything (redirection happens in useEffect)
  if (!isAuthenticated) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color="#8B3DFF" />
        <ThemedText style={styles.loadingText}>Checking authentication...</ThemedText>
      </View>
    );
  }
  
  return (
    <ThemedView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={24} color="#333" />
        </TouchableOpacity>
        <ThemedText style={styles.headerTitle}>
          {toCamelCase(category)} Templates
        </ThemedText>
      </View>
      
      {loading ? (
        <View style={styles.centerContainer}>
          <ActivityIndicator size="large" color="#8B3DFF" />
          <ThemedText style={styles.loadingText}>Loading templates...</ThemedText>
        </View>
      ) : error ? (
        <View style={styles.centerContainer}>
          <Ionicons name="warning" size={48} color="#ff4444" />
          <ThemedText style={styles.errorText}>{error}</ThemedText>
          <TouchableOpacity 
            style={styles.retryButton} 
            onPress={handleRetry}
          >
            <ThemedText style={styles.retryText}>Retry</ThemedText>
          </TouchableOpacity>
        </View>
      ) : templates.length === 0 ? (
        <View style={styles.centerContainer}>
          <Ionicons name="folder-open-outline" size={48} color="#999" />
          <ThemedText style={styles.emptyText}>No templates found for {category}</ThemedText>
        </View>
      ) : (
        <FlatList
          data={templates}
          renderItem={renderTemplateItem}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.templateGrid}
          numColumns={2}
          columnWrapperStyle={styles.row}
          showsVerticalScrollIndicator={false}
        />
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
    paddingHorizontal: 16,
    paddingTop: 10,
    paddingBottom: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  backButton: {
    padding: 8,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginLeft: 16,
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  retryButton: {
    marginTop: 16,
    paddingVertical: 10,
    paddingHorizontal: 20,
    backgroundColor: '#8B3DFF',
    borderRadius: 8,
  },
  retryText: {
    color: '#fff',
    fontWeight: '600',
  },
  templateGrid: {
    padding: 12,
  },
  row: {
    flex: 1,
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  templateCard: {
    width: '48%',
    borderRadius: 16,
    overflow: 'hidden',
    backgroundColor: '#fff',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 6,
    marginBottom: 4,
  },
  templateImageContainer: {
    width: '100%',
    aspectRatio: 1,
    position: 'relative',
    backgroundColor: '#f5f5f5',
    padding: 8,
  },
  templateImage: {
    width: '100%',
    height: '100%',
  },
  premiumBadge: {
    position: 'absolute',
    top: 8,
    right: 8,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderRadius: 4,
  },
  premiumText: {
    color: '#FFFFFF',
    fontSize: 10,
    fontWeight: '600',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: '#666',
  },
  errorText: {
    marginTop: 16,
    fontSize: 16,
    color: '#ff4444',
    textAlign: 'center',
  },
  emptyText: {
    marginTop: 16,
    fontSize: 16,
    color: '#999',
    textAlign: 'center',
  },
}); 