import Stripe from 'npm:stripe@17';
import { createClient } from 'npm:@supabase/supabase-js@2';

const stripe = new Stripe(Deno.env.get('STRIPE_SECRET_KEY')!);
const db = createClient(Deno.env.get('SUPABASE_URL')!, Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!);
const cors = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, content-type, x-client-info, apikey',
  'Content-Type': 'application/json',
};

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: cors });
  try {
    const { productId, size } = await req.json();
    const { data: product } = await db.from('products').select('*').eq('id', productId).single();
    if (!product || !product.active || product.club_only) {
      return new Response(JSON.stringify({ error: 'not for sale' }), { status: 400, headers: cors });
    }
    const site = Deno.env.get('SITE_URL')!;
    const session = await stripe.checkout.sessions.create({
      mode: 'payment',
      line_items: [{
        quantity: 1,
        price_data: {
          currency: 'usd',
          unit_amount: product.price_cents,
          product_data: { name: size ? `${product.name} (${size})` : product.name },
        },
      }],
      shipping_address_collection: { allowed_countries: ['US'] },
      metadata: { product_id: product.id, product_name: product.name, size: size ?? '' },
      success_url: `${site}/store?checkout=success`,
      cancel_url: `${site}/store?checkout=cancelled`,
    });
    return new Response(JSON.stringify({ url: session.url }), { headers: cors });
  } catch (e) {
    return new Response(JSON.stringify({ error: String(e) }), { status: 500, headers: cors });
  }
});
