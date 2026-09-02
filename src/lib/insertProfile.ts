import { supabase } from './supabase';
import type { ApplicationInput } from './types';

export async function insertProfile(userId: string, app: ApplicationInput): Promise<{ ok: boolean }> {
  const { error } = await supabase.from('profiles').insert({
    id: userId,
    first_name: app.firstName.trim(),
    instagram_handle: app.instagramHandle,
    has_dog: app.hasDog === true,
    dog_name: app.dogName.trim() || null,
    dog_breed: app.dogBreed.trim() || null,
    dog_size: app.dogSize,
    why: app.why.trim() || null,
  });
  return { ok: !error || error.code === '23505' };
}
