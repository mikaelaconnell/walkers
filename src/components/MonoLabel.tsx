import { ReactNode } from 'react';
import { Text } from 'react-native';
import { creamA, fonts } from '../theme/tokens';

export function MonoLabel({ children, color = creamA(1), size = 9 }: { children: ReactNode; color?: string; size?: number }) {
  return (
    <Text style={{ fontFamily: fonts.monoMed, fontSize: size, letterSpacing: size * 0.22, color, textTransform: 'uppercase' }}>
      {children}
    </Text>
  );
}
