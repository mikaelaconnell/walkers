import { ReactNode } from 'react';
import { ScrollView, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { colors } from '../theme/tokens';

type Props = { children: ReactNode; scroll?: boolean; pad?: number; gap?: number };

export function Screen({ children, scroll = true, pad = 22, gap = 20 }: Props) {
  const inner = { paddingHorizontal: pad, paddingVertical: 20, gap, flexGrow: 1 } as const;
  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.clubBlue }} edges={['top']}>
      {scroll ? (
        <ScrollView contentContainerStyle={inner} keyboardShouldPersistTaps="handled">{children}</ScrollView>
      ) : (
        <View style={[inner, { flex: 1 }]}>{children}</View>
      )}
    </SafeAreaView>
  );
}
