import { supabase } from '../lib/supabase';

export type Walk = {
  id: string; walk_number: number; name: string; walk_date: string; start_time: string;
  pace: string; distance_miles: number; reveal_at: string;
  coffee_stop_name: string | null; coffee_stop_address: string | null; coffee_stop_note: string | null;
  headcount: number; dog_count: number;
};

export type MeetPoint = { meet_point: string; meet_note: string | null };

export async function fetchUpcomingWalk(): Promise<Walk | null> {
  const today = new Date().toISOString().slice(0, 10);
  const { data } = await supabase.from('walks').select('*').gte('walk_date', today).order('walk_date', { ascending: true }).limit(1);
  return data?.[0] ?? null;
}

export async function fetchMeetPoint(walkId: string): Promise<MeetPoint | null> {
  const { data } = await supabase.rpc('get_meet_point', { p_walk_id: walkId });
  return data?.[0] ?? null;
}

export async function fetchRsvp(walkId: string, userId: string): Promise<boolean> {
  const { data } = await supabase.from('rsvps').select('walk_id').eq('walk_id', walkId).eq('user_id', userId);
  return (data?.length ?? 0) > 0;
}

export async function setRsvp(walkId: string, userId: string): Promise<void> {
  await supabase.from('rsvps').upsert({ walk_id: walkId, user_id: userId });
}
