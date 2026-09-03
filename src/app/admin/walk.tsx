import { useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import { Pressable } from 'react-native';
import { ClubButton } from '../../components/ClubButton';
import { Field } from '../../components/Field';
import { MonoLabel } from '../../components/MonoLabel';
import { Screen } from '../../components/Screen';
import { Serif } from '../../components/Serif';
import { StripedHeading } from '../../components/StripedHeading';
import { supabase } from '../../lib/supabase';

type Form = {
  id: string | null; walk_number: string; name: string; walk_date: string; start_time: string;
  headcount: string; dog_count: string; reveal_at: string;
  coffee_stop_name: string; coffee_stop_address: string; coffee_stop_note: string;
  meet_point: string; meet_note: string;
};

const EMPTY: Form = {
  id: null, walk_number: '', name: '', walk_date: '', start_time: '9:30 am', headcount: '0', dog_count: '0',
  reveal_at: '', coffee_stop_name: '', coffee_stop_address: '', coffee_stop_note: '', meet_point: '', meet_note: '',
};

export default function AdminWalk() {
  const router = useRouter();
  const [form, setForm] = useState<Form>(EMPTY);
  const [status, setStatus] = useState('');

  useEffect(() => {
    (async () => {
      const today = new Date().toISOString().slice(0, 10);
      const { data } = await supabase.from('walks').select('*').gte('walk_date', today).order('walk_date').limit(1);
      const w = data?.[0];
      if (!w) return;
      const { data: mp } = await supabase.from('walk_meet_points').select('*').eq('walk_id', w.id).maybeSingle();
      setForm({
        id: w.id, walk_number: String(w.walk_number), name: w.name, walk_date: w.walk_date,
        start_time: w.start_time, headcount: String(w.headcount), dog_count: String(w.dog_count),
        reveal_at: w.reveal_at, coffee_stop_name: w.coffee_stop_name ?? '', coffee_stop_address: w.coffee_stop_address ?? '',
        coffee_stop_note: w.coffee_stop_note ?? '', meet_point: mp?.meet_point ?? '', meet_note: mp?.meet_note ?? '',
      });
    })();
  }, []);

  const set = (k: keyof Form) => (v: string) => setForm((f) => ({ ...f, [k]: v }));

  async function save() {
    setStatus('');
    if (!form.name || !form.walk_date || !form.reveal_at || !form.walk_number) {
      setStatus('walk number, name, date, and reveal time are required');
      return;
    }
    const walkRow = {
      walk_number: Number(form.walk_number), name: form.name.toLowerCase(), walk_date: form.walk_date,
      start_time: form.start_time, headcount: Number(form.headcount), dog_count: Number(form.dog_count),
      reveal_at: form.reveal_at, coffee_stop_name: form.coffee_stop_name || null,
      coffee_stop_address: form.coffee_stop_address || null, coffee_stop_note: form.coffee_stop_note || null,
    };
    let walkId = form.id;
    if (walkId) {
      const { error } = await supabase.from('walks').update(walkRow).eq('id', walkId);
      if (error) { setStatus(`walk save failed: ${error.message}`); return; }
    } else {
      const { data, error } = await supabase.from('walks').insert(walkRow).select('id').single();
      if (error || !data) { setStatus(`walk save failed: ${error?.message}`); return; }
      walkId = data.id;
      setForm((f) => ({ ...f, id: walkId }));
    }
    if (form.meet_point) {
      const { error } = await supabase.from('walk_meet_points').upsert({ walk_id: walkId, meet_point: form.meet_point, meet_note: form.meet_note || null });
      if (error) { setStatus(`meet point save failed: ${error.message}`); return; }
    }
    setStatus('saved');
  }

  return (
    <Screen gap={18}>
      <Pressable onPress={() => router.back()} style={{ minHeight: 44, justifyContent: 'center' }}>
        <MonoLabel size={10}>{'←'} Applications</MonoLabel>
      </Pressable>
      <StripedHeading text="this week's walk" size={26} />
      <Field label="Walk number" value={form.walk_number} onChangeText={set('walk_number')} keyboardType="number-pad" />
      <Field label="Name" value={form.name} onChangeText={set('name')} placeholder="hudson river loop" autoCapitalize="none" />
      <Field label="Date (YYYY-MM-DD)" value={form.walk_date} onChangeText={set('walk_date')} placeholder="2026-09-05" autoCapitalize="none" />
      <Field label="Start time" value={form.start_time} onChangeText={set('start_time')} autoCapitalize="none" />
      <Field label="Reveal at (ISO with offset)" value={form.reveal_at} onChangeText={set('reveal_at')} placeholder="2026-09-04T09:00:00-04:00" helper="Friday 9am New York time the day before, written with the -04:00 or -05:00 offset." autoCapitalize="none" />
      <Field label="Meet point" value={form.meet_point} onChangeText={set('meet_point')} placeholder="Pier 45 lawn: Christopher St and West St" />
      <Field label="Meet note" value={form.meet_note} onChangeText={set('meet_note')} placeholder="Look for the cream tote. We leave at 9:40 sharp." />
      <Field label="Expected headcount" value={form.headcount} onChangeText={set('headcount')} keyboardType="number-pad" />
      <Field label="Expected dogs" value={form.dog_count} onChangeText={set('dog_count')} keyboardType="number-pad" />
      <Field label="Coffee stop" value={form.coffee_stop_name} onChangeText={set('coffee_stop_name')} placeholder="Sey" />
      <Field label="Coffee stop street" value={form.coffee_stop_address} onChangeText={set('coffee_stop_address')} placeholder="Bedford St" />
      <Field label="Coffee stop note" value={form.coffee_stop_note} onChangeText={set('coffee_stop_note')} />
      <ClubButton label="save walk" onPress={save} />
      {status ? <Serif size={13}>{status}</Serif> : null}
    </Screen>
  );
}
