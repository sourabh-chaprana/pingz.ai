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
    <TouchableOpacity style={styles.templateCard}>
      <Image 
        source={{ uri: item.url || 'https://via.placeholder.com/150' }} 
        style={styles.templateImage}
        resizeMode="cover"
      />
      <View style={styles.templateInfo}>
        <ThemedText style={styles.templateTitle}>{item.templateName}</ThemedText>
        {item.description && (
          <ThemedText style={styles.templateDescription}>{item.description}</ThemedText>
        )}
        {item.premium && (
          <View style={styles.premiumBadge}>
            <ThemedText style={styles.premiumText}>Premium</ThemedText>
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
          numColumns={2}
          contentContainerStyle={styles.templateGrid}
          showsVerticalScrollIndicator={false}
          columnWrapperStyle={styles.templateRow}
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
    paddingTop: 50,
    paddingBottom: 16,
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
  templateRow: {
    justifyContent: 'space-between',
  },
  templateCard: {
    width: '48%',
    marginBottom: 16,
    borderRadius: 12,
    overflow: 'hidden',
    backgroundColor: '#fff',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  templateImage: {
    width: '100%',
    height: 160,
    backgroundColor: '#f5f5f5',
  },
  templateInfo: {
    padding: 12,
  },
  templateTitle: {
    fontSize: 14,
    fontWeight: '600',
  },
  templateDescription: {
    fontSize: 12,
    color: '#666',
    marginTop: 4,
  },
  premiumBadge: {
    position: 'absolute',
    top: 8,
    right: 8,
    backgroundColor: '#FFC107',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
  },
  premiumText: {
    fontSize: 10,
    fontWeight: 'bold',
    color: '#fff',
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