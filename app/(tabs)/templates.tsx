import { StyleSheet, View, TouchableOpacity, ScrollView } from 'react-native';
import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { Ionicons } from '@expo/vector-icons';
import { createElevation } from '@/utils/styles';

const templateCategories = [
  { title: 'Social Media', icon: 'share-social-outline', color: '#4CAF50' },
  { title: 'Marketing', icon: 'megaphone-outline', color: '#2196F3' },
  { title: 'Business', icon: 'briefcase-outline', color: '#9C27B0' },
  { title: 'Education', icon: 'school-outline', color: '#FF9800' },
  { title: 'Personal', icon: 'person-outline', color: '#F44336' },
];

function TemplateCategory({ title, icon, color }: { title: string; icon: any; color: string }) {
  return (
    <TouchableOpacity style={styles.categoryCard}>
      <View style={[styles.iconContainer, { backgroundColor: color }]}>
        <Ionicons name={icon} size={24} color="#fff" />
      </View>
      <ThemedText style={styles.categoryTitle}>{title}</ThemedText>
    </TouchableOpacity>
  );
}

export default function TemplatesScreen() {
  return (
    <ThemedView style={styles.container}>
      <View style={styles.header}>
        <ThemedText style={styles.title}>Templates</ThemedText>
      </View>
      <ScrollView style={styles.content}>
        {templateCategories.map((category, index) => (
          <TemplateCategory key={index} {...category} />
        ))}
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
    padding: 16,
  },
  categoryCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    backgroundColor: '#fff',
    borderRadius: 12,
    marginBottom: 12,
    ...createElevation(2),
  },
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  categoryTitle: {
    fontSize: 16,
    fontWeight: '500',
  },
}); 