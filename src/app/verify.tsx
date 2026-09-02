import { useLocalSearchParams, useRouter } from 'expo-router';
import { useState } from 'react';
import { ClubButton } from '../components/ClubButton';
import { Field } from '../components/Field';
import { MonoLabel } from '../components/MonoLabel';
import { Screen } from '../components/Screen';
import { Serif } from '../components/Serif';
import { StripedHeading } from '../components/StripedHeading';
import { useAuth } from '../lib/auth';
import { takePendingApplication } from '../lib/pendingApplication';
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
    const { data, error: otpError } = await supabase.auth.verifyOtp({ email: email!, token: code.trim(), type: 'email' });
    if (otpError || !data.session) { setBusy(false); setError('that code did not work. check the newest email.'); return; }

    if (mode === 'apply') {
      const app = takePendingApplication();
      if (app) {
        const { error: insertError } = await supabase.from('profiles').insert({
          id: data.session.user.id,
          first_name: app.firstName.trim(),
          instagram_handle: app.instagramHandle,
          has_dog: app.hasDog === true,
          dog_name: app.dogName.trim() || null,
          dog_breed: app.dogBreed.trim() || null,
          dog_size: app.dogSize,
          why: app.why.trim() || null,
        });
        if (insertError && insertError.code !== '23505') {
          setBusy(false);
          setError('we could not save your application. try once more.');
          return;
        }
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
