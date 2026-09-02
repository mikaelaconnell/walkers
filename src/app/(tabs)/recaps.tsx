import { useFocusEffect } from 'expo-router';
import { useCallback, useState } from 'react';
import { Image, Text, View } from 'react-native';
import { Avatar } from '@/components/Avatar';
import { ImagePlaceholder } from '@/components/ImagePlaceholder';
import { MonoLabel } from '@/components/MonoLabel';
import { Screen } from '@/components/Screen';
import { Serif } from '@/components/Serif';
import { StripedHeading } from '@/components/StripedHeading';
import { supabase } from '@/lib/supabase';
import { colors, creamA, fonts } from '@/theme/tokens';

type RecapPhoto = { id: string; path: string; caption: string | null; span: 'full' | 'half'; sort: number };
type RecapNote = { id: string; author_name: string; author_handle: string; quote: string };

export default function RecapsTab() {
  const [photos, setPhotos] = useState<RecapPhoto[]>([]);
  const [notes, setNotes] = useState<RecapNote[]>([]);

  const load = useCallback(async () => {
    const today = new Date().toISOString().slice(0, 10);
    const { data: lastWalk } = await supabase.from('walks').select('id').lt('walk_date', today).order('walk_date', { ascending: false }).limit(1);
    const walkId = lastWalk?.[0]?.id;
    if (!walkId) { setPhotos([]); setNotes([]); return; }
    const [p, n] = await Promise.all([
      supabase.from('recap_photos').select('*').eq('walk_id', walkId).order('sort'),
      supabase.from('recap_notes').select('*').eq('walk_id', walkId),
    ]);
    setPhotos((p.data as RecapPhoto[]) ?? []);
    setNotes((n.data as RecapNote[]) ?? []);
  }, []);

  useFocusEffect(useCallback(() => { load(); }, [load]));

  const url = (path: string) => supabase.storage.from('recaps').getPublicUrl(path).data.publicUrl;
  const fulls = photos.filter((p) => p.span === 'full');
  const halves = photos.filter((p) => p.span === 'half');

  return (
    <Screen>
      <View style={{ gap: 4 }}>
        <StripedHeading text="last" size={32} />
        <Text style={{ fontFamily: fonts.heading, fontSize: 32, color: colors.cream, letterSpacing: -1.1 }}>saturday</Text>
      </View>

      {photos.length === 0 ? (
        <View style={{ gap: 8 }}>
          <ImagePlaceholder height={170} />
          <View style={{ flexDirection: 'row', gap: 8 }}>
            <ImagePlaceholder height={118} style={{ flex: 1 }} width="auto" />
            <ImagePlaceholder height={118} style={{ flex: 1 }} width="auto" />
          </View>
          <MonoLabel size={9} color={creamA(0.6)}>Photos land here after the first walk</MonoLabel>
        </View>
      ) : (
        <View style={{ gap: 8 }}>
          {fulls.map((p) => (
            <Image key={p.id} source={{ uri: url(p.path) }} style={{ width: '100%', height: 170 }} resizeMode="cover" />
          ))}
          <View style={{ flexDirection: 'row', gap: 8, flexWrap: 'wrap' }}>
            {halves.map((p) => (
              <Image key={p.id} source={{ uri: url(p.path) }} style={{ flexBasis: '48%', flexGrow: 1, height: 118 }} resizeMode="cover" />
            ))}
          </View>
        </View>
      )}

      {notes.map((n, i) => (
        <View key={n.id} style={{ flexDirection: 'row', gap: 12, paddingTop: 14, borderTopWidth: i ? 1 : 0, borderColor: creamA(0.3) }}>
          <Avatar initial={n.author_name[0]} size={26} />
          <View style={{ flex: 1, gap: 4 }}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
              <Text style={{ fontFamily: fonts.heading, fontSize: 13, color: colors.cream }}>{n.author_name}</Text>
              <Text style={{ fontFamily: fonts.mono, fontSize: 11, color: creamA(0.7) }}>@{n.author_handle}</Text>
            </View>
            <Serif size={14.5}>{n.quote}</Serif>
          </View>
        </View>
      ))}
    </Screen>
  );
}
