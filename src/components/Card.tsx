import { ReactNode } from 'react';
import { View, ViewStyle } from 'react-native';
import { colors, creamA, deepBlueA } from '../theme/tokens';

type Props = { children: ReactNode; variant?: 'cream' | 'outline' | 'dashed'; style?: ViewStyle };

export function Card({ children, variant = 'cream', style }: Props) {
  const variants: Record<string, ViewStyle> = {
    cream: { backgroundColor: colors.cream },
    outline: { borderWidth: 1.5, borderColor: creamA(0.45) },
    dashed: { borderWidth: 1.5, borderColor: deepBlueA(0.5), borderStyle: 'dashed' },
  };
  return <View style={[{ padding: 20, gap: 16 }, variants[variant], style]}>{children}</View>;
}
