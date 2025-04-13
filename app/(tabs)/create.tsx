import { StyleSheet, ScrollView, View, TouchableOpacity, Image } from 'react-native';
import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { Ionicons } from '@expo/vector-icons';
import { createElevation } from '@/utils/styles';
import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchCategories } from "@/src/features/template/templateThunks";
import { RootState } from '@/src/store';
import { useRouter } from 'expo-router';
import { ActivityIndicator } from 'react-native';

export default function CreateScreen() {
  const dispatch = useDispatch();
  const router = useRouter();
  const { categories, loadingCategories, categoriesError } = useSelector(
    (state: RootState) => state.templates
  );

  useEffect(() => {
    dispatch(fetchCategories());
  }, [dispatch]);

  const handleCategoryPress = (categoryId: string, categoryName: string) => {
    router.push({
      pathname: '/templateCategories',
      params: { category: categoryName.toLowerCase() }
    });
  };

  if (loadingCategories) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#8B3DFF" />
        <ThemedText style={styles.loadingText}>Loading categories...</ThemedText>
      </View>
    );
  }

  if (categoriesError) {
    return (
      <View style={styles.errorContainer}>
        <Ionicons name="alert-circle" size={48} color="#FF4444" />
        <ThemedText style={styles.errorText}>{categoriesError}</ThemedText>
      </View>
    );
  }

  return (
    <ThemedView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity 
          style={styles.backButton}
          onPress={() => router.back()}
        >
          <Ionicons name="arrow-back" size={24} color="#333" />
        </TouchableOpacity>
        <ThemedText style={styles.title}>Category</ThemedText>
      </View>
      
      <ScrollView style={styles.content}>
        <View style={styles.grid}>
          {categories.map((category) => (
            <TouchableOpacity 
              key={category.id}
              style={styles.gridItem}
              onPress={() => handleCategoryPress(category.id, category.name)}
            >
              <View style={styles.imageContainer}>
                {category.thumbnail ? (
                  <>
                    <Image 
                      source={{ 
                        uri: `data:image/png;base64,${category.thumbnail}` 
                      }}
                      style={styles.categoryImage}
                      resizeMode="cover"
                    />
                    <View style={styles.titleOverlay}>
                      <ThemedText style={styles.overlayText}>
                        {category.name}
                      </ThemedText>
                    </View>
                  </>
                ) : (
                  <View style={[styles.iconContainer, { backgroundColor: category.color }]}>
                    <Ionicons name={category.icon.toLowerCase()} size={24} color="#fff" />
                    <ThemedText style={styles.iconText}>{category.name}</ThemedText>
                  </View>
                )}
              </View>
            </TouchableOpacity>
          ))}
        </View>
      </ScrollView>
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
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
    backgroundColor: '#fff',
    ...createElevation(2),
  },
  backButton: {
    padding: 8,
    marginRight: 8,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    flex: 1,
  },
  content: {
    flex: 1,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    padding: 8,
  },
  gridItem: {
    width: '50%',
    padding: 8,
  },
  imageContainer: {
    aspectRatio: 1,
    borderRadius: 12,
    overflow: 'hidden',
    backgroundColor: '#f5f5f5',
    ...createElevation(2),
    position: 'relative',
  },
  categoryImage: {
    width: '100%',
    height: '100%',
  },
  titleOverlay: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    padding: 12,
  },
  overlayText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
    textAlign: 'center',
  },
  iconContainer: {
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 16,
  },
  iconText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
    marginTop: 8,
    textAlign: 'center',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 12,
    fontSize: 16,
    color: '#666',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  errorText: {
    marginTop: 12,
    fontSize: 16,
    color: '#FF4444',
    textAlign: 'center',
  },
}); 