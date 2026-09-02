import { createClient } from 'npm:@supabase/supabase-js@2';

const service = createClient(Deno.env.get('SUPABASE_URL')!, Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!);
const FROM = 'Walkers Social Club <onboarding@resend.dev>';
const cors = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, content-type, x-client-info, apikey',
  'Content-Type': 'application/json',
};

const EMAILS = {
  approved: {
    subject: "you're in: walkers social club",
    text: (name: string) =>
      `Hi ${name},\n\nWe read your application and we'd love to have you. Open the app: this Saturday's walk is on the board, and the meet point unlocks 24 hours before we set off.\n\nThe house rules, short version: women only, leashes on, no photos of anyone who hasn't said yes, and tell us if something feels off.\n\nSee you Saturday.\n\nwalkers social club new york`,
  },
  declined: {
    subject: 'about your walkers application',
    text: (name: string) =>
      `Hi ${name},\n\nThank you for applying. We keep each walk deliberately small, so we can't bring everyone in right away. We'll hold on to your application and reach out when space opens up.\n\nwalkers social club new york`,
  },
};

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: cors });

  const caller = createClient(Deno.env.get('SUPABASE_URL')!, Deno.env.get('SUPABASE_ANON_KEY')!, {
    global: { headers: { Authorization: req.headers.get('Authorization')! } },
  });
  const { data: isOwner } = await caller.rpc('is_owner');
  if (!isOwner) return new Response(JSON.stringify({ error: 'forbidden' }), { status: 403, headers: cors });

  const { userId, decision } = await req.json();
  if (decision !== 'approved' && decision !== 'declined') {
    return new Response(JSON.stringify({ error: 'bad decision' }), { status: 400, headers: cors });
  }

  const { data: profile } = await service.from('profiles').select('first_name').eq('id', userId).single();
  if (!profile) return new Response(JSON.stringify({ error: 'not found' }), { status: 404, headers: cors });

  await service.from('profiles').update({ membership_status: decision }).eq('id', userId);

  const { data: userData } = await service.auth.admin.getUserById(userId);
  const email = userData?.user?.email;
  if (email) {
    const t = EMAILS[decision as 'approved' | 'declined'];
    await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: { Authorization: `Bearer ${Deno.env.get('RESEND_API_KEY')}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({ from: FROM, to: email, subject: t.subject, text: t.text(profile.first_name) }),
    });
  }
  return new Response(JSON.stringify({ ok: true }), { headers: cors });
});
