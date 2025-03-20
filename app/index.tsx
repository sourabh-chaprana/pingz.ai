import { Redirect } from 'expo-router';
import { useAppSelector } from '../src/hooks/redux';

export default function Index() {
  const { isAuthenticated } = useAppSelector((state: { auth: any }) => state.auth);

  if (!isAuthenticated) {
    return <Redirect href="/login" />;
  }

  return <Redirect href="/(tabs)" />;
} 