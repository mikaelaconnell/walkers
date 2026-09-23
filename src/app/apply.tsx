import { useRouter } from 'expo-router';
import { useState } from 'react';
import { Pressable, Text, View } from 'react-native';
import { Card } from '../components/Card';
import { ClubButton } from '../components/ClubButton';
import { DogLogo } from '../components/DogLogo';
import { Field } from '../components/Field';
import { MonoLabel } from '../components/MonoLabel';
import { Screen } from '../components/Screen';
import { Segmented } from '../components/Segmented';
import { Serif } from '../components/Serif';
import { StripedHeading } from '../components/StripedHeading';
import { useAuth } from '../lib/auth';
import { insertProfile } from '../lib/insertProfile';
import { setPendingApplication } from '../lib/pendingApplication';
import { supabase } from '../lib/supabase';
import type { ApplicationInput, DogSize } from '../lib/types';
import { ApplicationErrors, stripHandle, validateApplication } from '../lib/validation';
import { colors, creamA, fonts, inkA } from '../theme/tokens';

export default function Apply() {
  const router = useRouter();
  const { refreshProfile } = useAuth();
  const [form, setForm] = useState<ApplicationInput>({
    firstName: '', email: '', instagramHandle: '', hasDog: null, dogName: '', dogBreed: '', dogSize: null, why: '',
  });
  const [errors, setErrors] = useState<ApplicationErrors>({});
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState('');

  const set = <K extends keyof ApplicationInput>(k: K, v: ApplicationInput[K]) => setForm((f) => ({ ...f, [k]: v }));

  async function submit() {
    const errs = validateApplication(form);
    setErrors(errs);
    if (Object.keys(errs).length) return;
    setSubmitting(true);
    setSubmitError('');
    const cleaned: ApplicationInput = {
      ...form,
      instagramHandle: stripHandle(form.instagramHandle),
      ...(form.hasDog ? {} : { dogName: '', dogBreed: '', dogSize: null }),
    };
    const { data: sessionData } = await supabase.auth.getSession();
    if (sessionData.session) {
      const { ok } = await insertProfile(sessionData.session.user.id, cleaned);
      setSubmitting(false);
      if (!ok) { setSubmitError('we could not save your application. try once more.'); return; }
      await refreshProfile();
      router.replace('/');
      return;
    }

    const { error } = await supabase.auth.signInWithOtp({ email: cleaned.email.trim(), options: { shouldCreateUser: true } });
    setSubmitting(false);
    if (error) { setSubmitError('something went wrong sending your code. try again in a minute.'); return; }
    setPendingApplication(cleaned);
    router.push({ pathname: '/verify', params: { email: cleaned.email.trim(), mode: 'apply' } });
  }

  return (
    <Screen pad={24} gap={22}>
      <Pressable onPress={() => router.back()} style={{ minHeight: 44, justifyContent: 'center' }}>
        <MonoLabel size={10}>{'←'} Back</MonoLabel>
      </Pressable>

      <View style={{ gap: 6 }}>
        <Text style={{ fontFamily: fonts.heading, fontSize: 34, color: colors.cream, letterSpacing: -1.2 }}>tell us about you</Text>
      </View>
      <Field label="First name" value={form.firstName} onChangeText={(t) => set('firstName', t)} placeholder="Maya" error={errors.firstName} autoCapitalize="words" />
      <Field label="Email" value={form.email} onChangeText={(t) => set('email', t)} placeholder="maya@example.com" error={errors.email} helper="No newsletters." autoCapitalize="none" keyboardType="email-address" />
      <Field label="Instagram handle" value={form.instagramHandle} onChangeText={(t) => set('instagramHandle', t)} placeholder="mayawalks" prefix="@" error={errors.instagramHandle} helper="To apply, follow @walkersnewyork on Instagram." autoCapitalize="none" />

      <View style={{ gap: 6 }}>
        <MonoLabel color={creamA(0.85)}>Bringing a dog?</MonoLabel>
        <Segmented
          options={[{ label: 'yes, I have a dog', value: 'yes' }, { label: 'just me', value: 'no' }]}
          value={form.hasDog === null ? null : form.hasDog ? 'yes' : 'no'}
          onChange={(v) => set('hasDog', v === 'yes')}
        />
        {errors.hasDog ? <MonoLabel size={9}>{errors.hasDog}</MonoLabel> : null}
      </View>

      {form.hasDog ? (
        <Card variant="cream" style={{ padding: 18 }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
            <View style={{ flex: 1 }}>
              <StripedHeading text="the dog" size={24} color={colors.deepBlue} stripeColor={colors.clubBlue} stripeHeight={18} />
            </View>
            <DogLogo width={38} color={colors.clubBlue} />
          </View>
          <Field palette="cream" label="Dog's name" value={form.dogName} onChangeText={(t) => set('dogName', t)} placeholder="Miso" error={errors.dogName} autoCapitalize="words" />
          <Field palette="cream" label="Breed / mix" value={form.dogBreed} onChangeText={(t) => set('dogBreed', t)} placeholder="Corgi mix" autoCapitalize="words" />
          <View style={{ gap: 6 }}>
            <MonoLabel color={colors.deepBlue}>Size</MonoLabel>
            <Segmented
              palette="cream" compact
              options={[{ label: 'Small', value: 'small' }, { label: 'Medium', value: 'medium' }, { label: 'Large', value: 'large' }]}
              value={form.dogSize}
              onChange={(v) => set('dogSize', v as DogSize)}
            />
          </View>
          <Serif size={12} color={inkA(0.8)}>Two miles at an easy pace, leashed the whole way. Tell us if yours is nervous around other dogs.</Serif>
        </Card>
      ) : null}

      <Field label="Why do you want to walk with us?" value={form.why} onChangeText={(t) => set('why', t)} placeholder="Moved here in March and I'm looking for a Saturday routine..." multiline error={errors.why} />

      <ClubButton label={submitting ? 'sending...' : 'send application'} onPress={submit} disabled={submitting} />
      {submitError ? <MonoLabel size={9}>{submitError}</MonoLabel> : null}
    </Screen>
  );
}
