import { Redirect, useRouter } from 'expo-router';
import { useState } from 'react';
import { Pressable, View } from 'react-native';
import { submitReport } from '@/api/reports';
import { ClubButton } from '@/components/ClubButton';
import { Field } from '@/components/Field';
import { MonoLabel } from '@/components/MonoLabel';
import { Screen } from '@/components/Screen';
import { Serif } from '@/components/Serif';
import { StripedHeading } from '@/components/StripedHeading';
import { useAuth } from '@/lib/auth';
import { creamA } from '@/theme/tokens';

export default function Report() {
  const router = useRouter();
  const { session } = useAuth();
  const [body, setBody] = useState('');
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState('');

  if (!session) return <Redirect href="/" />;

  async function send() {
    if (!body.trim()) { setError('tell us what happened first.'); return; }
    setSending(true);
    setError('');
    const ok = await submitReport(session!.user.id, body.trim());
    setSending(false);
    if (!ok) { setError('that did not go through. try once more.'); return; }
    setSent(true);
  }

  return (
    <Screen pad={24}>
      <Pressable onPress={() => router.back()} style={{ minHeight: 44, justifyContent: 'center' }} accessibilityRole="button">
        <MonoLabel size={10} color={creamA(0.8)}>Back</MonoLabel>
      </Pressable>
      <StripedHeading text="report something" size={30} stripeHeight={22} />
      {sent ? (
        <View style={{ gap: 10 }}>
          <Serif size={15}>We got it. Thank you for telling us.</Serif>
          <Serif size={14} color={creamA(0.85)}>An organizer reads every report. If someone is in danger right now, call 911 first.</Serif>
          <ClubButton label="done" onPress={() => router.back()} />
        </View>
      ) : (
        <View style={{ gap: 16 }}>
          <Serif size={14} color={creamA(0.85)}>
            Something felt off on a walk, in the group, or in the app? Tell us here. Only organizers can read it.
          </Serif>
          <Field
            label="What happened"
            value={body}
            onChangeText={setBody}
            placeholder="what happened, in your own words"
            multiline
            error={error}
          />
          <ClubButton label={sending ? 'sending...' : 'send it'} onPress={send} disabled={sending} />
        </View>
      )}
    </Screen>
  );
}
