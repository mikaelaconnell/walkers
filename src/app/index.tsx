import { Text, View } from 'react-native';
import { colors, fonts } from '../theme/tokens';

export default function Welcome() {
  return (
    <View style={{ flex: 1, backgroundColor: colors.clubBlue, alignItems: 'center', justifyContent: 'center' }}>
      <Text style={{ fontFamily: fonts.heading, fontSize: 38, color: colors.cream }}>walkers</Text>
    </View>
  );
}
