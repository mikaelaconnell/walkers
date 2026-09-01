import { Stack } from 'expo-router';
import { useFonts, Nunito_600SemiBold, Nunito_800ExtraBold } from '@expo-google-fonts/nunito';
import { DMMono_400Regular, DMMono_500Medium } from '@expo-google-fonts/dm-mono';
import { colors } from '../theme/tokens';

export default function RootLayout() {
  const [loaded] = useFonts({ Nunito_600SemiBold, Nunito_800ExtraBold, DMMono_400Regular, DMMono_500Medium });
  if (!loaded) return null;
  return <Stack screenOptions={{ headerShown: false, contentStyle: { backgroundColor: colors.clubBlue } }} />;
}
