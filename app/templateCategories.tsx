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
    <View style={styles.templateCard}>
      <View style={styles.templateImageContainer}>
        <Image 
          source={{ uri: item.url || 'https://via.placeholder.com/150' }} 
          style={styles.templateImage}
          resizeMode="cover"
        />
        {item.premium && (
          <View style={styles.premiumBadge}>
            <ThemedText style={styles.premiumText}>Premium</ThemedText>
          </View>
        )}
      </View>
      <View style={styles.templateContent}>
        <View style={styles.templateInfo}>
          <ThemedText style={styles.templateTitle}>{item.templateName}</ThemedText>
          {item.description && (
            <ThemedText style={styles.templateDescription}>{item.description}</ThemedText>
          )}
          <View style={styles.categoryTag}>
            <ThemedText style={styles.categoryText}>{item.category || category}</ThemedText>
          </View>
        </View>
        <TouchableOpacity 
          style={styles.useTemplateButton}
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
          <ThemedText style={styles.useTemplateText}>Use Template</ThemedText>
        </TouchableOpacity>
      </View>
    </View>
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
        <ThemedText style={styles.headerTitle}>{category} Templates</ThemedText>
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
    padding: 16,
  },
  templateCard: {
    width: '100%',
    marginBottom: 16,
    borderRadius: 12,
    overflow: 'hidden',
    backgroundColor: '#fff',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  templateImageContainer: {
    width: '100%',
    height: 200,
    position: 'relative',
  },
  templateImage: {
    width: '100%',
    height: '100%',
  },
  templateContent: {
    padding: 16,
  },
  templateInfo: {
    marginBottom: 16,
  },
  templateTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1A1A1A',
    marginBottom: 8,
  },
  templateDescription: {
    fontSize: 14,
    color: '#666',
    marginBottom: 12,
  },
  categoryTag: {
    backgroundColor: '#F5F7FA',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
    alignSelf: 'flex-start',
  },
  categoryText: {
    fontSize: 12,
    color: '#666',
    fontWeight: '500',
  },
  premiumBadge: {
    position: 'absolute',
    top: 12,
    right: 12,
    backgroundColor: '#FFB800',
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 6,
  },
  premiumText: {
    color: '#FFFFFF',
    fontSize: 12,
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
  useTemplateButton: {
    backgroundColor: '#8B3DFF',
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
    alignSelf: 'flex-start',
    elevation: 2,
    shadowColor: '#8B3DFF',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
  },
  useTemplateText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
}); 