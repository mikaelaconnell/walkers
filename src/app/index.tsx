import { Link, Redirect, useRouter } from 'expo-router';
import { Platform, View } from 'react-native';
import { ClubButton } from '../components/ClubButton';
import { DogLogo } from '../components/DogLogo';
import { MonoLabel } from '../components/MonoLabel';
import { Screen } from '../components/Screen';
import { Serif } from '../components/Serif';
import { StripedHeading } from '../components/StripedHeading';
import { useAuth } from '../lib/auth';
import { creamA, fonts } from '../theme/tokens';
import { Text } from 'react-native';

export default function Welcome() {
  const router = useRouter();
  const { session, profile, loading } = useAuth();

  if (loading) return null;
  if (session && profile?.membership_status === 'approved') return <Redirect href="/(tabs)/walks" />;
  if (session && profile) return <Redirect href="/pending" />;
  if (session && !profile) return <Redirect href="/apply" />;

  return (
    <Screen pad={24}>
      <View style={{ gap: 10, marginTop: 12 }}>
        <StripedHeading text="walkers" size={38} stripeHeight={24} />
        <StripedHeading text="social club" size={38} stripeHeight={24} />
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
          <View style={{ flex: 1 }}>
            <StripedHeading text="new york" size={38} stripeHeight={24} />
          </View>
          <DogLogo width={60} />
        </View>
        <Serif size={14} color={creamA(0.85)}>Est 2026 · Dog Walk Social Club</Serif>
      </View>

      <Serif size={16} style={{ maxWidth: 300 }}>
        A weekend walking club for women in New York. Bring your dog, or just bring yourself. We finish at a new coffee shop every time.
      </Serif>

      {Platform.OS === 'web' ? (
        <View style={{ gap: 8 }}>
          <StripedHeading text="everyone's welcome to apply" size={20} stripeHeight={16} />
          <Serif size={14}>
            We're building an inclusive community of women who walk. We review every application by hand and keep the group small on purpose: it's how we keep every walk safe and friendly.
          </Serif>
          <Link href="/store" style={{ fontFamily: fonts.headingSemi, fontSize: 13, color: creamA(0.9) }}>
            visit the shop
          </Link>
        </View>
      ) : null}

      <View style={{ flex: 1 }} />

      <View style={{ borderTopWidth: 1.5, borderBottomWidth: 1.5, borderColor: creamA(0.45), paddingVertical: 16, gap: 8 }}>
        <MonoLabel>How it works</MonoLabel>
        <Serif size={14}>
          Everyone's welcome to apply. Every member is approved by hand, and we cap each walk so it stays small. Once you're in, the meet point lands in the app 24 hours before we walk.
        </Serif>
      </View>

      <ClubButton label="request to join" onPress={() => router.push('/apply')} />
      <Text
        onPress={() => router.push('/sign-in')}
        style={{ fontFamily: fonts.headingSemi, fontSize: 12, color: creamA(0.8), textAlign: 'center', paddingVertical: 12 }}
      >
        already a member? sign in
      </Text>
    </Screen>
  );
}
