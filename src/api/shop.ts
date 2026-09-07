import { supabase } from '@/lib/supabase';

export type Product = {
  id: string; name: string; description: string | null; price_cents: number;
  sizes: string[]; photo_path: string | null; club_only: boolean; active: boolean; sort: number;
};

export async function fetchProducts(): Promise<Product[]> {
  const { data } = await supabase.from('products').select('*').eq('active', true).order('sort');
  return (data as Product[]) ?? [];
}

export async function startCheckout(productId: string, size: string | null): Promise<string> {
  const { data, error } = await supabase.functions.invoke('create-checkout', { body: { productId, size } });
  if (error || !data?.url) throw new Error('checkout unavailable');
  return data.url as string;
}
