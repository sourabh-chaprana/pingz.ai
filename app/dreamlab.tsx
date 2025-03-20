import { StyleSheet, View, Text } from 'react-native';
import AppLayout from '@/components/AppLayout';

export default function DreamLabScreen() {
  return (
    <AppLayout>
      <View style={styles.container}>
        <Text style={styles.title}>Dream Lab</Text>
        <Text style={styles.text}>Explore innovative features and experiments.</Text>
      </View>
    </AppLayout>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
    color: '#333',
  },
  text: {
    fontSize: 16,
    textAlign: 'center',
    color: '#666',
  },
}); 