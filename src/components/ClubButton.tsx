import { Pressable, Text } from 'react-native';
import { colors, fonts } from '../theme/tokens';

type Props = { label: string; onPress: () => void; variant?: 'cream' | 'deep'; disabled?: boolean };

export function ClubButton({ label, onPress, variant = 'cream', disabled }: Props) {
  const bg = variant === 'cream' ? colors.cream : colors.deepBlue;
  const fg = variant === 'cream' ? colors.deepBlue : colors.cream;
  return (
    <Pressable
      onPress={onPress}
      disabled={disabled}
      style={({ pressed }) => ({
        backgroundColor: bg, paddingVertical: 18, borderRadius: 2, alignItems: 'center', minHeight: 44,
        opacity: disabled ? 0.6 : pressed ? 0.85 : 1,
      })}
    >
      <Text style={{ fontFamily: fonts.heading, fontSize: 15, color: fg, textTransform: 'lowercase' }}>{label}</Text>
    </Pressable>
  );
}
