import { Link } from 'expo-router';
import * as WebBrowser from 'expo-web-browser';
import { useEffect, useState } from 'react';
import { Image, Platform, Text, View } from 'react-native';
import { fetchProducts, startCheckout, type Product } from '@/api/shop';
import { ClubButton } from '@/components/ClubButton';
import { DogLogo } from '@/components/DogLogo';
import { ImagePlaceholder } from '@/components/ImagePlaceholder';
import { MonoLabel } from '@/components/MonoLabel';
import { Screen } from '@/components/Screen';
import { Segmented } from '@/components/Segmented';
import { Serif } from '@/components/Serif';
import { StripedHeading } from '@/components/StripedHeading';
import { supabase } from '@/lib/supabase';
import { colors, creamA, fonts, inkA } from '@/theme/tokens';

const dollars = (cents: number) => `$${(cents / 100).toFixed(0)}`;

function ProductCell({ product }: { product: Product }) {
  const [size, setSize] = useState<string | null>(product.sizes[0] ?? null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const photoUrl = product.photo_path ? supabase.storage.from('products').getPublicUrl(product.photo_path).data.publicUrl : null;

  async function buy() {
    setBusy(true);
    setError('');
    try {
      const url = await startCheckout(product.id, size);
      if (Platform.OS === 'web') { window.location.href = url; } else { await WebBrowser.openBrowserAsync(url); }
    } catch {
      setError('checkout is napping. try again shortly.');
    }
    setBusy(false);
  }

  return (
    <View style={{ flexBasis: '47%', flexGrow: 1, gap: 8 }}>
      {photoUrl ? (
        <Image source={{ uri: photoUrl }} style={{ width: '100%', aspectRatio: 1 }} resizeMode="cover" />
      ) : (
        <ImagePlaceholder height={160} />
      )}
      <Text style={{ fontFamily: fonts.heading, fontSize: 14, color: colors.cream }}>{product.name}</Text>
      {product.club_only ? (
        <MonoLabel size={10.5} color={creamA(0.75)}>Club only</MonoLabel>
      ) : (
        <>
          <MonoLabel size={10.5} color={creamA(0.9)}>{dollars(product.price_cents)}</MonoLabel>
          {product.sizes.length > 1 ? <Segmented compact options={product.sizes.map((s) => ({ label: s, value: s }))} value={size} onChange={setSize} /> : null}
          <ClubButton label={busy ? 'one sec...' : 'buy'} onPress={buy} disabled={busy} />
          {error ? <MonoLabel size={9}>{error}</MonoLabel> : null}
        </>
      )}
    </View>
  );
}

export function ShopScreen({ publicPage }: { publicPage?: boolean }) {
  const [products, setProducts] = useState<Product[]>([]);
  useEffect(() => { fetchProducts().then(setProducts); }, []);

  return (
    <Screen>
      {publicPage ? (
        <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
            <DogLogo width={36} />
            <Text style={{ fontFamily: fonts.heading, fontSize: 16, color: colors.cream }}>walkers social club</Text>
          </View>
          <Link href="/" style={{ fontFamily: fonts.headingSemi, fontSize: 12, color: creamA(0.8) }}>home</Link>
        </View>
      ) : null}

      <StripedHeading text="the shop" size={32} />
      <Serif size={14}>Made in small runs. The walk box comes out of the same run.</Serif>

      <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 14 }}>
        {products.filter((p) => !p.club_only).map((p) => <ProductCell key={p.id} product={p} />)}
      </View>

      {products.some((p) => p.club_only) ? (
        <View style={{ backgroundColor: colors.cream, padding: 16, gap: 8 }}>
          <MonoLabel color={colors.deepBlue} size={9}>Not for sale</MonoLabel>
          <Serif color={inkA(0.85)} size={13.5}>
            The pieces in the walk box are club only. You can't buy them: you show up early.
          </Serif>
          <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 14 }}>
            {products.filter((p) => p.club_only).map((p) => <ProductCell key={p.id} product={p} />)}
          </View>
        </View>
      ) : null}

      {publicPage ? (
        <View style={{ gap: 10, borderTopWidth: 1.5, borderColor: creamA(0.45), paddingTop: 16 }}>
          <Serif size={14}>
            The shop is open to everyone. The Saturday walks are members only: we review every application by hand and keep the group small on purpose.
          </Serif>
          <Link href="/" style={{ fontFamily: fonts.heading, fontSize: 14, color: colors.cream }}>request to join</Link>
        </View>
      ) : null}
    </Screen>
  );
}
