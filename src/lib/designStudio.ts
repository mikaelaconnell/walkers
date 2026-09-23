// Local design review only: lets the design studio page (localhost:4100)
// toggle this web preview between guest and the demo member account.
// Inert in production builds and on native.
import { Platform } from 'react-native';
import { supabase } from './supabase';
import { REVIEW_EMAIL } from './reviewAccess';

const STUDIO_ORIGIN = 'http://localhost:4100';

export function initDesignStudio() {
  if (!__DEV__ || Platform.OS !== 'web' || typeof window === 'undefined') return;
  if (window.parent === window) return;
  window.addEventListener('message', async (event: MessageEvent) => {
    if (event.origin !== STUDIO_ORIGIN) return;
    const data = (event.data ?? {}) as { cmd?: string; code?: string };
    const reply = (msg: Record<string, unknown>) =>
      window.parent.postMessage({ studio: true, ...msg }, STUDIO_ORIGIN);
    try {
      if (data.cmd === 'signOut') {
        await supabase.auth.signOut();
        reply({ state: 'guest' });
      } else if (data.cmd === 'signInDemo') {
        const { error } = await supabase.auth.signInWithPassword({
          email: REVIEW_EMAIL,
          password: String(data.code ?? ''),
        });
        if (error) throw error;
        reply({ state: 'member' });
      }
    } catch (err) {
      reply({ error: err instanceof Error ? err.message : String(err) });
    }
  });
}
