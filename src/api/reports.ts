import { supabase } from '@/lib/supabase';

export async function submitReport(userId: string, body: string): Promise<boolean> {
  const { error } = await supabase.from('reports').insert({ user_id: userId, body });
  return !error;
}
