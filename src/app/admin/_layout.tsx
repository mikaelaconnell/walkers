import { Redirect, Stack } from 'expo-router';
import { useAuth } from '@/lib/auth';
import { colors } from '@/theme/tokens';

export default function AdminLayout() {
  const { profile, loading } = useAuth();
  if (loading) return null;
  if (profile?.role !== 'owner') return <Redirect href="/" />;
  return <Stack screenOptions={{ headerShown: false, contentStyle: { backgroundColor: colors.clubBlue } }} />;
}
