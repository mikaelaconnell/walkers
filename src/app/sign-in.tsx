import { useRouter } from 'expo-router';
import { useState } from 'react';
import { Pressable } from 'react-native';
import { ClubButton } from '../components/ClubButton';
import { Field } from '../components/Field';
import { MonoLabel } from '../components/MonoLabel';
import { Screen } from '../components/Screen';
import { Serif } from '../components/Serif';
import { StripedHeading } from '../components/StripedHeading';
import { REVIEW_EMAIL } from '../lib/reviewAccess';
import { supabase } from '../lib/supabase';

export default function SignIn() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');

  async function send() {
    if (!/^\S+@\S+\.\S+$/.test(email.trim())) { setError('that does not look like an email'); return; }
    if (email.trim().toLowerCase() === REVIEW_EMAIL) {
      router.push({ pathname: '/verify', params: { email: REVIEW_EMAIL, mode: 'signin' } });
      return;
    }
    setBusy(true);
    setError('');
    const { error: otpError } = await supabase.auth.signInWithOtp({ email: email.trim(), options: { shouldCreateUser: false } });
    setBusy(false);
    if (otpError) { setError("we can't find that email. maybe apply first?"); return; }
    router.push({ pathname: '/verify', params: { email: email.trim(), mode: 'signin' } });
  }

  return (
    <Screen pad={24} gap={22}>
      <Pressable onPress={() => router.back()} style={{ minHeight: 44, justifyContent: 'center' }}>
        <MonoLabel size={10}>{'←'} Back</MonoLabel>
      </Pressable>
      <StripedHeading text="welcome back" size={30} />
      <Serif size={14}>Enter the email you applied with and we'll send a code.</Serif>
      <Field label="Email" value={email} onChangeText={setEmail} placeholder="maya@example.com" error={error} autoCapitalize="none" keyboardType="email-address" />
      <ClubButton label={busy ? 'sending...' : 'send code'} onPress={send} disabled={busy} />
    </Screen>
  );
}
