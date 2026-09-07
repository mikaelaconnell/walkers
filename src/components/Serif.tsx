import { ReactNode } from 'react';
import { Text, TextStyle } from 'react-native';
import { creamA, fonts } from '../theme/tokens';

export function Serif({ children, size = 15, color, style }: { children: ReactNode; size?: number; color?: string; style?: TextStyle }) {
  return (
    <Text style={[{ fontFamily: fonts.body, fontSize: size, lineHeight: size * 1.6, color: color ?? creamA(0.9) }, style]}>
      {children}
    </Text>
  );
}
