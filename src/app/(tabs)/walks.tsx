import { useFocusEffect, useRouter } from 'expo-router';
import { useCallback, useState } from 'react';
import { Platform, Text, View } from 'react-native';
import { fetchMeetPoint, fetchRsvp, fetchUpcomingWalk, setRsvp, type MeetPoint, type Walk } from '@/api/walks';
import { Avatar } from '@/components/Avatar';
import { Card } from '@/components/Card';
import { ClubButton } from '@/components/ClubButton';
import { DogLogo } from '@/components/DogLogo';
import { ImagePlaceholder } from '@/components/ImagePlaceholder';
import { MonoLabel } from '@/components/MonoLabel';
import { Screen } from '@/components/Screen';
import { Serif } from '@/components/Serif';
import { StripedHeading } from '@/components/StripedHeading';
import { HOUSE_RULES_SUMMARY } from '@/lib/copy';
import { useAuth } from '@/lib/auth';
import { colors, creamA, deepBlueA, fonts, inkA } from '@/theme/tokens';

function Metric({ label, value }: { label: string; value: string }) {
  return (
    <View style={{ flex: 1, alignItems: 'center', gap: 4, paddingVertical: 12 }}>
      <MonoLabel size={8} color={deepBlueA(0.9)}>{label}</MonoLabel>
      <Text style={{ fontFamily: fonts.heading, fontSize: 15, color: colors.deepBlue }}>{value}</Text>
    </View>
  );
}

export default function WalksTab() {
  const router = useRouter();
  const { session, profile } = useAuth();
  const [walk, setWalk] = useState<Walk | null>(null);
  const [meet, setMeet] = useState<MeetPoint | null>(null);
  const [rsvped, setRsvped] = useState(false);

  const load = useCallback(async () => {
    const w = await fetchUpcomingWalk();
    setWalk(w);
    if (w && session) {
      setMeet(await fetchMeetPoint(w.id));
      setRsvped(await fetchRsvp(w.id, session.user.id));
    }
  }, [session]);

  useFocusEffect(useCallback(() => { load(); }, [load]));

  const [firstWord, ...rest] = (walk?.name ?? '').split(' ');

  return (
    <Screen>
      <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
          <DogLogo width={36} />
          <Text style={{ fontFamily: fonts.heading, fontSize: 16, color: colors.cream }}>walkers social club</Text>
        </View>
        {profile ? <Avatar initial={profile.first_name[0]} size={30} /> : null}
      </View>

      {walk ? (
        <Card variant="cream" style={{ padding: 22, paddingHorizontal: 20 }}>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
            <MonoLabel color={colors.deepBlue} size={9}>This Saturday</MonoLabel>
            <MonoLabel color={deepBlueA(0.8)} size={9}>Walk no. {String(walk.walk_number).padStart(2, '0')}</MonoLabel>
          </View>
          <View style={{ gap: 4 }}>
            <StripedHeading text={firstWord} size={36} color={colors.deepBlue} stripeColor={colors.clubBlue} stripeHeight={24} />
            {rest.length ? <Text style={{ fontFamily: fonts.heading, fontSize: 36, lineHeight: 34, color: colors.deepBlue, letterSpacing: -1.3 }}>{rest.join(' ')}</Text> : null}
          </View>
          <Serif color={inkA(0.85)} size={14}>Two easy miles along the water, finishing for coffee in the West Village.</Serif>

          <View style={{ flexDirection: 'row', borderTopWidth: 1.5, borderBottomWidth: 1.5, borderColor: deepBlueA(0.35) }}>
            <Metric label="Time" value={walk.start_time} />
            <View style={{ width: 1, backgroundColor: deepBlueA(0.35) }} />
            <Metric label="Pace" value={`${walk.pace} · ${walk.distance_miles} mi`} />
            <View style={{ width: 1, backgroundColor: deepBlueA(0.35) }} />
            <Metric label="Walking" value={`${walk.headcount} · ${walk.dog_count} dogs`} />
          </View>

          {meet ? (
            <View style={{ backgroundColor: colors.clubBlue, padding: 16, gap: 8 }}>
              <MonoLabel size={9}>Meet point · Unlocked</MonoLabel>
              <Text style={{ fontFamily: fonts.heading, fontSize: 18, color: colors.cream }}>{meet.meet_point}</Text>
              {meet.meet_note ? <Serif size={13}>{meet.meet_note}</Serif> : null}
            </View>
          ) : (
            <View style={{ borderWidth: 1.5, borderColor: deepBlueA(0.5), borderStyle: 'dashed', padding: 16, gap: 8 }}>
              <MonoLabel color={colors.deepBlue} size={9}>Meet point · Locked</MonoLabel>
              <Text selectable={false} style={{ fontFamily: fonts.heading, fontSize: 18, color: colors.deepBlue, opacity: 0.45, ...(Platform.OS === 'web' ? ({ filter: 'blur(5px)', userSelect: 'none' } as object) : {}) }}>
                west village, somewhere good
              </Text>
              <Serif size={13} color={inkA(0.7)}>Unlocks 24 hours before the walk, for approved members only.</Serif>
            </View>
          )}

          {session ? (
            <ClubButton
              variant="deep"
              label={rsvped ? 'you’re in: see you saturday' : 'count me in for saturday'}
              disabled={rsvped}
              onPress={async () => {
                if (!session || !walk) return;
                await setRsvp(walk.id, session.user.id);
                setRsvped(true);
              }}
            />
          ) : (
            <ClubButton variant="deep" label="request to join" onPress={() => router.push('/apply')} />
          )}
        </Card>
      ) : (
        <Card variant="outline">
          <Serif>No walk on the board yet. Check back soon.</Serif>
        </Card>
      )}

      <Card variant="outline" style={{ padding: 18, paddingHorizontal: 20 }}>
        <MonoLabel size={9}>A little something</MonoLabel>
        <Text style={{ fontFamily: fonts.heading, fontSize: 26, color: colors.cream, letterSpacing: -0.9 }}>for the early ones</Text>
        <Serif size={14}>
          We bring a box of club merch to every walk: sweatshirts, caps, totes, bandanas for the dogs. First to arrive, first to take one home. That's all we'll say.
        </Serif>
      </Card>

      {walk?.coffee_stop_name ? (
        <View style={{ gap: 8 }}>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
            <MonoLabel size={9}>The coffee stop</MonoLabel>
            <MonoLabel size={9} color={creamA(0.7)}>New every week</MonoLabel>
          </View>
          <View style={{ backgroundColor: colors.cream, padding: 14, flexDirection: 'row', gap: 14 }}>
            <ImagePlaceholder height={74} width={74} />
            <View style={{ flex: 1, gap: 4, justifyContent: 'center' }}>
              <Text style={{ fontFamily: fonts.heading, fontSize: 17, color: colors.deepBlue }}>
                {walk.coffee_stop_name} · {walk.coffee_stop_address}
              </Text>
              {walk.coffee_stop_note ? <Serif size={12.5} color={inkA(0.8)}>{walk.coffee_stop_note}</Serif> : null}
            </View>
          </View>
        </View>
      ) : null}

      <View style={{ borderTopWidth: 1.5, borderColor: creamA(0.9), paddingTop: 14, gap: 8 }}>
        <MonoLabel size={9}>House rules</MonoLabel>
        <Serif size={14}>{HOUSE_RULES_SUMMARY}</Serif>
      </View>
    </Screen>
  );
}
