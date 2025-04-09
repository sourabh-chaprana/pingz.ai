import React, { useEffect, useState } from 'react';
import { View, StyleSheet, FlatList, Image, TouchableOpacity, ActivityIndicator } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { ThemedView } from '@/components/ThemedView';
import { ThemedText } from '@/components/ThemedText';
import { api } from '@/src/services/api';
import { Template } from '@/src/features/home/homeSlice';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Ionicons } from '@expo/vector-icons';

export default function ActiveTemplatePage() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const { query, label } = params;
  
  const [templates, setTemplates] = useState<Template[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch templates based on query params - only when page loads
  useEffect(() => {
    const fetchTemplates = async () => {
      try {
        setLoading(true);
        const token = await AsyncStorage.getItem('auth_token');
        
        if (!token) {
          setError('Authentication required');
          setLoading(false);
          return;
        }
        
        console.log('Fetching templates with query:', query);
        
        const response = await api.get(`/template/search?query=${query}`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        
        console.log('Template search results:', response.data.length);
        setTemplates(response.data);
        setLoading(false);
      } catch (err: any) {
        console.error('Error fetching templates:', err);
        setError(err.response?.data?.message || 'Failed to fetch templates');
        setLoading(false);
      }
    };

    if (query) {
      fetchTemplates();
    } else {
      setError('No search query provided');
      setLoading(false);
    }
  }, [query]);

  // Function to render a template item - now without overlay text
  const renderTemplateItem = ({ item }: { item: Template }) => (
    <TouchableOpacity
      style={styles.templateCard}
      onPress={() => router.push({
        pathname: `/template-editor/${item.id}`,
        params: {
          searchQuery: query,
          label: label,
          source: params.source || 'activeTemplate'
        }
      })}
    >
      <Image
        source={{ uri: item.url }}
        style={styles.templateImage}
        resizeMode="cover"
      />
      {/* Removed the template overlay with title and description */}
    </TouchableOpacity>
  );

  // Display only the back button and search results count in header
  return (
    <ThemedView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity 
          style={styles.backButton}
          onPress={() => router.back()}
        >
          <Ionicons name="arrow-back" size={24} color="#333" />
        </TouchableOpacity>
        <ThemedText style={styles.headerTitle}>
          {label || query || 'Results'}
        </ThemedText>
      </View>

      {loading ? (
        <View style={styles.loaderContainer}>
          <ActivityIndicator size="large" color="#8B3DFF" />
        </View>
      ) : error ? (
        <View style={styles.errorContainer}>
          <Ionicons name="alert-circle-outline" size={48} color="#ff4444" />
          <ThemedText style={styles.errorText}>{error}</ThemedText>
        </View>
      ) : templates.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Ionicons name="search-outline" size={64} color="#ccc" />
          <ThemedText style={styles.emptyText}>No templates found</ThemedText>
        </View>
      ) : (
        <FlatList
          data={templates}
          renderItem={renderTemplateItem}
          keyExtractor={(item) => item.id}
          numColumns={2}
          contentContainerStyle={styles.listContent}
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
    padding: 16,
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
  listContent: {
    padding: 12,
  },
  templateCard: {
    flex: 1,
    margin: 8,
    height: 180,
    borderRadius: 12,
    overflow: 'hidden',
    backgroundColor: '#f5f5f5',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  templateImage: {
    width: '100%',
    height: '100%',
  },
  loaderContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  errorText: {
    textAlign: 'center',
    color: '#ff4444',
    marginTop: 12,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#666',
    marginTop: 12,
  }
});
