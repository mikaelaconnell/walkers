import { useLocalSearchParams, useRouter } from 'expo-router';
import { useState } from 'react';
import { ClubButton } from '../components/ClubButton';
import { Field } from '../components/Field';
import { MonoLabel } from '../components/MonoLabel';
import { Screen } from '../components/Screen';
import { Serif } from '../components/Serif';
import { StripedHeading } from '../components/StripedHeading';
import { useAuth } from '../lib/auth';
import { insertProfile } from '../lib/insertProfile';
import { clearPendingApplication, peekPendingApplication } from '../lib/pendingApplication';
import { REVIEW_EMAIL } from '../lib/reviewAccess';
import { supabase } from '../lib/supabase';

export default function Verify() {
  const router = useRouter();
  const { refreshProfile } = useAuth();
  const { email, mode } = useLocalSearchParams<{ email: string; mode: 'apply' | 'signin' }>();
  const [code, setCode] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');

  async function confirm() {
    if (code.trim().length < 6) { setError('enter the 6 digit code from your email'); return; }
    setBusy(true);
    setError('');
    const { data, error: otpError } =
      email === REVIEW_EMAIL
        ? await supabase.auth.signInWithPassword({ email, password: code.trim() })
        : await supabase.auth.verifyOtp({ email: email!, token: code.trim(), type: 'email' });
    if (otpError || !data.session) { setBusy(false); setError('that code did not work. check the newest email.'); return; }

    if (mode === 'apply') {
      const app = peekPendingApplication();
      if (app) {
        const { ok } = await insertProfile(data.session.user.id, app);
        if (!ok) {
          setBusy(false);
          setError('we could not save your application. try once more.');
          return;
        }
        clearPendingApplication();
      }
    }
    await refreshProfile();
    setBusy(false);
    router.replace('/');
  }

  return (
    <Screen pad={24} gap={22}>
      <StripedHeading text="check your email" size={30} />
      <Serif size={14}>We sent a 6 digit code to {email}. Enter it here and you're set.</Serif>
      <Field label="Code" value={code} onChangeText={setCode} placeholder="123456" keyboardType="number-pad" autoCapitalize="none" />
      <ClubButton label={busy ? 'checking...' : 'confirm'} onPress={confirm} disabled={busy} />
      {error ? <MonoLabel size={9}>{error}</MonoLabel> : null}
    </Screen>
  );
}
