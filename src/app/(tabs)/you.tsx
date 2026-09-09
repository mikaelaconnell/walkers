import { useFocusEffect, useRouter } from 'expo-router';
import { useCallback, useState } from 'react';
import { Pressable, Text, View } from 'react-native';
import { Avatar } from '@/components/Avatar';
import { Card } from '@/components/Card';
import { MonoLabel } from '@/components/MonoLabel';
import { Screen } from '@/components/Screen';
import { Serif } from '@/components/Serif';
import { StripedHeading } from '@/components/StripedHeading';
import { useAuth } from '@/lib/auth';
import { supabase } from '@/lib/supabase';
import { colors, creamA, deepBlueA, fonts } from '@/theme/tokens';

const CHIPS = ['Good with dogs', 'Easy pace', 'Cafe trained'];
const SETTINGS = ['Edit my details', 'House rules', 'Report something', "Bring a friend (she'll be reviewed too)"];

export default function YouTab() {
  const router = useRouter();
  const { session, profile } = useAuth();
  const [stats, setStats] = useState({ walks: 0, miles: 0, cafes: 0 });
  const [deleteArmed, setDeleteArmed] = useState(false);
  const [deleting, setDeleting] = useState(false);

  async function deleteAccount() {
    if (!deleteArmed) { setDeleteArmed(true); return; }
    setDeleting(true);
    const { error } = await supabase.functions.invoke('delete-account');
    if (error) { setDeleting(false); setDeleteArmed(false); return; }
    await supabase.auth.signOut();
    router.replace('/');
  }

  const load = useCallback(async () => {
    if (!session) return;
    const today = new Date().toISOString().slice(0, 10);
    const { data } = await supabase.from('rsvps').select('walk:walks(walk_date, distance_miles, coffee_stop_name)').eq('user_id', session.user.id);
    const past = (data ?? [])
      .map((r) => r.walk as unknown as { walk_date: string; distance_miles: number; coffee_stop_name: string | null })
      .filter((w) => w && w.walk_date < today);
    setStats({
      walks: past.length,
      miles: past.reduce((sum, w) => sum + Number(w.distance_miles), 0),
      cafes: new Set(past.map((w) => w.coffee_stop_name).filter(Boolean)).size,
    });
  }, [session]);

  useFocusEffect(useCallback(() => { load(); }, [load]));

  if (!profile) return null;

  return (
    <Screen>
      <View style={{ alignItems: 'center', gap: 6 }}>
        <Avatar initial={profile.first_name[0]} size={62} />
        <Text style={{ fontFamily: fonts.heading, fontSize: 26, color: colors.cream, letterSpacing: -0.9 }}>{profile.first_name.toLowerCase()}</Text>
        <Text style={{ fontFamily: fonts.mono, fontSize: 11.5, color: creamA(0.75) }}>@{profile.instagram_handle}</Text>
        <MonoLabel size={8.5} color={creamA(0.8)}>Approved member</MonoLabel>
      </View>

      <View style={{ flexDirection: 'row', backgroundColor: colors.cream }}>
        {([['walks', stats.walks], ['miles', stats.miles], ['cafes', stats.cafes]] as const).map(([label, value], i) => (
          <View key={label} style={{ flex: 1, alignItems: 'center', paddingVertical: 14, gap: 4, borderLeftWidth: i ? 1 : 0, borderColor: deepBlueA(0.25) }}>
            <Text style={{ fontFamily: fonts.heading, fontSize: 24, color: colors.deepBlue }}>{value}</Text>
            <MonoLabel size={8} color={deepBlueA(0.9)}>{label}</MonoLabel>
          </View>
        ))}
      </View>

      {profile.has_dog && profile.dog_name ? (
        <Card variant="outline">
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
            <View style={{ flex: 1 }}>
              <StripedHeading text="the dog" size={24} stripeHeight={18} />
            </View>
            <MonoLabel size={9} color={creamA(0.7)}>No. {String(7).padStart(2, '0')}b</MonoLabel>
          </View>
          <View style={{ flexDirection: 'row', gap: 14, alignItems: 'center' }}>
            <Avatar initial={profile.dog_name[0]} size={70} />
            <View style={{ gap: 4 }}>
              <Text style={{ fontFamily: fonts.heading, fontSize: 24, color: colors.cream, letterSpacing: -0.8 }}>{profile.dog_name.toLowerCase()}</Text>
              <Serif size={13}>{[profile.dog_breed, profile.dog_size].filter(Boolean).join(' · ')}</Serif>
            </View>
          </View>
          <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
            {CHIPS.map((c) => (
              <View key={c} style={{ borderWidth: 1, borderColor: creamA(0.55), paddingHorizontal: 10, paddingVertical: 7 }}>
                <MonoLabel size={8.5}>{c}</MonoLabel>
              </View>
            ))}
          </View>
        </Card>
      ) : null}

      <View style={{ borderTopWidth: 1.5, borderColor: creamA(0.9) }}>
        {SETTINGS.map((label, i) => (
          <View key={label} style={{ paddingVertical: 15, borderTopWidth: i ? 1 : 0, borderColor: creamA(0.25), opacity: i === SETTINGS.length - 1 ? 0.75 : 1 }}>
            <Serif size={14.5}>{label}</Serif>
          </View>
        ))}
        <Pressable
          onPress={() => supabase.auth.signOut().then(() => router.replace('/'))}
          style={{ paddingVertical: 15, borderTopWidth: 1, borderColor: creamA(0.25), minHeight: 44 }}
        >
          <Serif size={14.5} color={creamA(0.7)}>Sign out</Serif>
        </Pressable>
        <Pressable
          onPress={deleteAccount}
          disabled={deleting}
          style={{ paddingVertical: 15, borderTopWidth: 1, borderColor: creamA(0.25), minHeight: 44 }}
        >
          <Serif size={14.5} color={creamA(0.55)}>
            {deleting ? 'Deleting...' : deleteArmed ? 'Tap again to permanently delete your account' : 'Delete my account'}
          </Serif>
          {deleteArmed && !deleting ? (
            <Serif size={12} color={creamA(0.45)}>This removes your profile and walk history for good.</Serif>
          ) : null}
        </Pressable>
      </View>
    </Screen>
  );
}
