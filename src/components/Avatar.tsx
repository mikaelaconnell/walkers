import { Text, View } from 'react-native';
import { colors, fonts } from '../theme/tokens';

export function Avatar({ initial, size = 30 }: { initial: string; size?: number }) {
  return (
    <View style={{ width: size, height: size, borderRadius: size / 2, backgroundColor: colors.cream, alignItems: 'center', justifyContent: 'center' }}>
      <Text style={{ fontFamily: fonts.heading, fontSize: size * 0.45, color: colors.deepBlue, textTransform: 'lowercase' }}>{initial}</Text>
    </View>
  );
}
