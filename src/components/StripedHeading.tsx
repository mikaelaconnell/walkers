import { Text, View } from 'react-native';
import { colors, fonts } from '../theme/tokens';

type Props = { text: string; size?: number; color?: string; stripeColor?: string; stripeHeight?: number };

export function StripedHeading({ text, size = 34, color = colors.cream, stripeColor = colors.cream, stripeHeight = 22 }: Props) {
  const rows = Math.ceil(stripeHeight / 6);
  return (
    <View style={{ flexDirection: 'row', alignItems: 'center' }}>
      <Text style={{ fontFamily: fonts.heading, fontSize: size, lineHeight: size * 0.95, color, letterSpacing: size * -0.035, textTransform: 'lowercase' }}>
        {text}
      </Text>
      <View style={{ flex: 1, marginLeft: 7, height: stripeHeight, justifyContent: 'space-between' }}>
        {Array.from({ length: rows }).map((_, i) => (
          <View key={i} style={{ height: 2, backgroundColor: stripeColor }} />
        ))}
      </View>
    </View>
  );
}
