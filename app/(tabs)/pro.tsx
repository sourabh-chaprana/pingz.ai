import { StyleSheet, ScrollView, View, TouchableOpacity } from 'react-native';
import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { Ionicons } from '@expo/vector-icons';
import { createElevation } from '@/utils/styles';

export default function ProScreen() {
  return (
    <ThemedView style={styles.container}>
      <ScrollView>
        <View style={styles.header}>
          <ThemedText style={styles.title}>Canva Pro</ThemedText>
        </View>
        <View style={styles.content}>
          <View style={styles.proCard}>
            <Ionicons name="star" size={48} color="#8B3DFF" />
            <ThemedText style={styles.proTitle}>Unlock Pro Features</ThemedText>
            <ThemedText style={styles.proText}>
              Get access to premium features, templates, and more
            </ThemedText>
            <TouchableOpacity style={styles.proButton}>
              <ThemedText style={styles.buttonText}>Try Pro for Free</ThemedText>
            </TouchableOpacity>
          </View>
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
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  content: {
    flex: 1,
    padding: 20,
    marginTop: 20,
  },
  proCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 24,
    alignItems: 'center',
    ...createElevation(3),
  },
  proTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginTop: 16,
    marginBottom: 8,
  },
  proText: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    marginBottom: 24,
  },
  proButton: {
    backgroundColor: '#8B3DFF',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
}); 