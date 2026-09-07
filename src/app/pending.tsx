import { Redirect, useRouter } from 'expo-router';
import { useEffect } from 'react';
import { Text, View } from 'react-native';
import { MonoLabel } from '../components/MonoLabel';
import { Screen } from '../components/Screen';
import { Serif } from '../components/Serif';
import { StripedHeading } from '../components/StripedHeading';
import { useAuth } from '../lib/auth';
import { supabase } from '../lib/supabase';
import { colors, creamA, fonts } from '../theme/tokens';

const STEPS: [string, string, number][] = [
  ['01', 'We review your answers and your handle', 1],
  ['02', 'You get a note from us, and the house rules', 0.75],
  ['03', 'Meet point unlocks 24h before the walk', 0.6],
];

export default function Pending() {
  const router = useRouter();
  const { session, profile, loading, refreshProfile } = useAuth();

  useEffect(() => {
    const t = setInterval(refreshProfile, 15000);
    return () => clearInterval(t);
  }, [refreshProfile]);

  if (loading) return null;
  if (!session || !profile) return <Redirect href="/" />;
  if (profile.membership_status === 'approved') return <Redirect href="/(tabs)/walks" />;

  return (
    <Screen pad={24} scroll={false}>
      <View style={{ gap: 10, marginTop: 12 }}>
        <MonoLabel size={10}>Application received</MonoLabel>
        <Text style={{ fontFamily: fonts.heading, fontSize: 34, color: colors.cream, letterSpacing: -1.2 }}>thanks,</Text>
        <StripedHeading text={profile.first_name || 'Maya'} size={34} />
      </View>

      <Serif size={15}>
        One of us reads every application by hand, usually within a couple of days. We'll check your Instagram, say hi, and send the walk details once you're in.
      </Serif>

      <View style={{ flex: 1 }} />

      <View style={{ borderTopWidth: 1.5, borderColor: creamA(0.9) }}>
        {STEPS.map(([num, text, opacity], i) => (
          <View key={num} style={{ flexDirection: 'row', gap: 14, paddingVertical: 14, opacity, borderTopWidth: i ? 1 : 0, borderColor: creamA(0.25) }}>
            <MonoLabel size={10}>{num}</MonoLabel>
            <Serif size={14} style={{ flex: 1 }}>{text}</Serif>
          </View>
        ))}
      </View>

      <Text onPress={() => { supabase.auth.signOut().then(() => router.replace('/')); }} style={{ fontFamily: fonts.headingSemi, fontSize: 12, color: creamA(0.6), textAlign: 'center', paddingVertical: 12 }}>
        sign out for now
      </Text>
    </Screen>
  );
}
