import { createClient } from 'npm:@supabase/supabase-js@2';

const service = createClient(Deno.env.get('SUPABASE_URL')!, Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!);
const cors = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, content-type, x-client-info, apikey',
  'Content-Type': 'application/json',
};

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: cors });

  const caller = createClient(Deno.env.get('SUPABASE_URL')!, Deno.env.get('SUPABASE_ANON_KEY')!, {
    global: { headers: { Authorization: req.headers.get('Authorization')! } },
  });
  const { data: userData } = await caller.auth.getUser();
  const user = userData?.user;
  if (!user) return new Response(JSON.stringify({ error: 'unauthorized' }), { status: 401, headers: cors });

  // The owner account runs the club; deleting it would orphan admin. Owners
  // remove themselves from the Supabase dashboard instead.
  const { data: profile } = await service.from('profiles').select('role').eq('id', user.id).maybeSingle();
  if (profile?.role === 'owner') {
    return new Response(JSON.stringify({ error: 'owner accounts cannot be deleted here' }), { status: 403, headers: cors });
  }

  const { error } = await service.auth.admin.deleteUser(user.id);
  if (error) return new Response(JSON.stringify({ error: 'delete failed' }), { status: 500, headers: cors });

  return new Response(JSON.stringify({ ok: true }), { headers: cors });
});
