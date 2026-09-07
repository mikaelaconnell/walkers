import { Link, useFocusEffect } from 'expo-router';
import { useCallback, useState } from 'react';
import { Linking, Pressable, Text, View } from 'react-native';
import { Card } from '@/components/Card';
import { ClubButton } from '@/components/ClubButton';
import { MonoLabel } from '@/components/MonoLabel';
import { Screen } from '@/components/Screen';
import { Serif } from '@/components/Serif';
import { StripedHeading } from '@/components/StripedHeading';
import { supabase } from '@/lib/supabase';
import type { Profile } from '@/lib/types';
import { colors, creamA, fonts, inkA } from '@/theme/tokens';

export default function AdminApplications() {
  const [apps, setApps] = useState<Profile[]>([]);
  const [busyId, setBusyId] = useState<string | null>(null);
  const [decideError, setDecideError] = useState<{ id: string; message: string } | null>(null);

  const load = useCallback(async () => {
    const { data } = await supabase.from('profiles').select('*').eq('membership_status', 'pending').order('created_at');
    setApps((data as Profile[]) ?? []);
  }, []);

  useFocusEffect(useCallback(() => { load(); }, [load]));

  async function decide(userId: string, decision: 'approved' | 'declined') {
    setBusyId(userId);
    setDecideError(null);
    const { error } = await supabase.functions.invoke('review-application', { body: { userId, decision } });
    setBusyId(null);
    if (error) {
      setDecideError({ id: userId, message: "couldn't reach the server, try again" });
      return;
    }
    load();
  }

  return (
    <Screen>
      <StripedHeading text="applications" size={30} />
      <Link href="/admin/walk" style={{ fontFamily: fonts.headingSemi, fontSize: 13, color: creamA(0.85) }}>
        edit this week's walk
      </Link>

      {apps.length === 0 ? <Serif>Nothing waiting. Nice.</Serif> : null}

      {apps.map((a) => (
        <Card key={a.id} variant="cream">
          <Text style={{ fontFamily: fonts.heading, fontSize: 20, color: colors.deepBlue }}>{a.first_name.toLowerCase()}</Text>
          <Pressable
            onPress={() => Linking.openURL(`https://instagram.com/${a.instagram_handle}`)}
            hitSlop={{ top: 16, bottom: 16, left: 12, right: 12 }}
            testID={`instagram-link-${a.id}`}
          >
            <Text style={{ fontFamily: fonts.mono, fontSize: 13, color: colors.deepBlue, textDecorationLine: 'underline' }}>
              @{a.instagram_handle}
            </Text>
          </Pressable>
          <Serif color={inkA(0.85)} size={13.5}>
            {a.has_dog ? `Dog: ${a.dog_name ?? ''} (${[a.dog_breed, a.dog_size].filter(Boolean).join(', ')})` : 'No dog, just her'}
          </Serif>
          {a.why ? <Serif color={inkA(0.85)} size={13.5}>"{a.why}"</Serif> : null}
          <View style={{ flexDirection: 'row', gap: 10 }}>
            <View style={{ flex: 1 }}>
              <ClubButton variant="deep" label={busyId === a.id ? '...' : 'approve'} onPress={() => decide(a.id, 'approved')} disabled={busyId === a.id} />
            </View>
            <View style={{ flex: 1 }}>
              <ClubButton variant="deep" label={busyId === a.id ? '...' : 'decline'} onPress={() => decide(a.id, 'declined')} disabled={busyId === a.id} />
            </View>
          </View>
          {decideError?.id === a.id ? <MonoLabel color={colors.deepBlue} size={9}>{decideError.message}</MonoLabel> : null}
          <MonoLabel color={colors.deepBlue} size={8}>Applied {new Date((a as Profile & { created_at?: string }).created_at ?? '').toLocaleDateString()}</MonoLabel>
        </Card>
      ))}
    </Screen>
  );
}
