import { DimensionValue, View, ViewStyle } from 'react-native';
import { colors } from '../theme/tokens';

type Props = { height: number; width?: DimensionValue; style?: ViewStyle };

export function ImagePlaceholder({ height, width = '100%', style }: Props) {
  const bars = Math.ceil(height / 8);
  return (
    <View style={[{ height, width, overflow: 'hidden' }, style]}>
      {Array.from({ length: bars }).map((_, i) => (
        <View key={i} style={{ height: 8, backgroundColor: i % 2 ? colors.stripeB : colors.stripeA }} />
      ))}
    </View>
  );
}
