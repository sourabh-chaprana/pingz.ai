import { StyleSheet, ScrollView, View, TouchableOpacity } from 'react-native';
import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { Ionicons } from '@expo/vector-icons';
import { createElevation } from '@/utils/styles';

const createOptions = [
  { title: 'Design', icon: 'brush-outline', color: '#4CAF50' },
  { title: 'Photo Edit', icon: 'image-outline', color: '#2196F3' },
  { title: 'Video', icon: 'videocam-outline', color: '#9C27B0' },
  { title: 'Presentation', icon: 'easel-outline', color: '#FF9800' },
  { title: 'Document', icon: 'document-outline', color: '#F44336' },
];

function CreateOption({ title, icon, color }: { title: string; icon: any; color: string }) {
  return (
    <TouchableOpacity style={styles.optionCard}>
      <View style={[styles.iconContainer, { backgroundColor: color }]}>
        <Ionicons name={icon} size={24} color="#fff" />
      </View>
      <ThemedText style={styles.optionTitle}>{title}</ThemedText>
    </TouchableOpacity>
  );
}

export default function CreateScreen() {
  return (
    <ThemedView style={styles.container}>
      <View style={styles.header}>
        <ThemedText style={styles.title}>Create</ThemedText>
      </View>
      <ScrollView style={styles.content}>
        {createOptions.map((option, index) => (
          <CreateOption key={index} {...option} />
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
  optionCard: {
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
  optionTitle: {
    fontSize: 16,
    fontWeight: '500',
  },
}); 