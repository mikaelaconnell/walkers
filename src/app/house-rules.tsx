import { useRouter } from 'expo-router';
import { Pressable, Text, View } from 'react-native';
import { MonoLabel } from '../components/MonoLabel';
import { Screen } from '../components/Screen';
import { Serif } from '../components/Serif';
import { StripedHeading } from '../components/StripedHeading';
import { HOUSE_RULES } from '../lib/copy';
import { colors, creamA, fonts } from '../theme/tokens';

export default function HouseRules() {
  const router = useRouter();
  return (
    <Screen pad={24}>
      <Pressable onPress={() => router.back()} style={{ minHeight: 44, justifyContent: 'center' }} accessibilityRole="button">
        <MonoLabel size={10} color={creamA(0.8)}>Back</MonoLabel>
      </Pressable>
      <StripedHeading text="house rules" size={32} stripeHeight={22} />
      <Serif size={14} color={creamA(0.85)}>How we keep every walk safe and friendly.</Serif>
      <View>
        {HOUSE_RULES.map((r, i) => (
          <View key={r.rule} style={{ paddingVertical: 16, borderTopWidth: i ? 1 : 0, borderColor: creamA(0.25), gap: 6 }}>
            <Text style={{ fontFamily: fonts.heading, fontSize: 18, color: colors.cream, letterSpacing: -0.5 }}>{r.rule.toLowerCase()}</Text>
            <Serif size={14}>{r.detail}</Serif>
          </View>
        ))}
      </View>
    </Screen>
  );
}
