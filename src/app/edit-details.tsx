import { Redirect, useRouter } from 'expo-router';
import { useState } from 'react';
import { Pressable, View } from 'react-native';
import { Field } from '@/components/Field';
import { ClubButton } from '@/components/ClubButton';
import { MonoLabel } from '@/components/MonoLabel';
import { Screen } from '@/components/Screen';
import { Segmented } from '@/components/Segmented';
import { Serif } from '@/components/Serif';
import { StripedHeading } from '@/components/StripedHeading';
import { useAuth } from '@/lib/auth';
import { supabase } from '@/lib/supabase';
import type { DogSize } from '@/lib/types';
import { stripHandle } from '@/lib/validation';
import { creamA } from '@/theme/tokens';

export default function EditDetails() {
  const router = useRouter();
  const { session, profile, refreshProfile } = useAuth();
  const [firstName, setFirstName] = useState(profile?.first_name ?? '');
  const [handle, setHandle] = useState(profile?.instagram_handle ?? '');
  const [hasDog, setHasDog] = useState<boolean>(profile?.has_dog ?? false);
  const [dogName, setDogName] = useState(profile?.dog_name ?? '');
  const [dogBreed, setDogBreed] = useState(profile?.dog_breed ?? '');
  const [dogSize, setDogSize] = useState<DogSize | null>(profile?.dog_size ?? null);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  if (!session || !profile) return <Redirect href="/" />;

  async function save() {
    const name = firstName.trim();
    const ig = stripHandle(handle).trim();
    if (!name || !ig) { setError('name and instagram are both required.'); return; }
    setSaving(true);
    setError('');
    const { error: err } = await supabase
      .from('profiles')
      .update({
        first_name: name,
        instagram_handle: ig,
        has_dog: hasDog,
        dog_name: hasDog ? dogName.trim() || null : null,
        dog_breed: hasDog ? dogBreed.trim() || null : null,
        dog_size: hasDog ? dogSize : null,
      })
      .eq('id', session!.user.id);
    setSaving(false);
    if (err) { setError('we could not save that. try once more.'); return; }
    await refreshProfile();
    router.back();
  }

  return (
    <Screen pad={24}>
      <Pressable onPress={() => router.back()} style={{ minHeight: 44, justifyContent: 'center' }} accessibilityRole="button">
        <MonoLabel size={10} color={creamA(0.8)}>Back</MonoLabel>
      </Pressable>
      <StripedHeading text="edit my details" size={30} stripeHeight={22} />
      <Serif size={14} color={creamA(0.85)}>Change anything below and hit save.</Serif>
      <Field label="First name" value={firstName} onChangeText={setFirstName} autoCapitalize="words" />
      <Field label="Instagram" value={handle} onChangeText={setHandle} prefix="@" autoCapitalize="none" />
      <View style={{ gap: 8 }}>
        <MonoLabel color={creamA(0.85)}>Walking with a dog?</MonoLabel>
        <Segmented
          options={[{ label: 'with my dog', value: 'yes' }, { label: 'just me', value: 'no' }]}
          value={hasDog ? 'yes' : 'no'}
          onChange={(v) => setHasDog(v === 'yes')}
        />
      </View>
      {hasDog ? (
        <View style={{ gap: 16 }}>
          <Field label="Dog's name" value={dogName} onChangeText={setDogName} autoCapitalize="words" />
          <Field label="Breed" value={dogBreed} onChangeText={setDogBreed} autoCapitalize="words" />
          <View style={{ gap: 8 }}>
            <MonoLabel color={creamA(0.85)}>Size</MonoLabel>
            <Segmented
              compact
              options={[{ label: 'small', value: 'small' }, { label: 'medium', value: 'medium' }, { label: 'large', value: 'large' }]}
              value={dogSize}
              onChange={(v) => setDogSize(v as DogSize)}
            />
          </View>
        </View>
      ) : null}
      {error ? <MonoLabel size={9}>{error}</MonoLabel> : null}
      <ClubButton label={saving ? 'saving...' : 'save'} onPress={save} disabled={saving} />
    </Screen>
  );
}
