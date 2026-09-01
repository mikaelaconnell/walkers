import { Pressable, Text, View } from 'react-native';
import { colors, creamA, deepBlueA, fonts } from '../theme/tokens';

type Option = { label: string; value: string };
type Props = { options: Option[]; value: string | null; onChange: (v: string) => void; palette?: 'blue' | 'cream'; compact?: boolean };

export function Segmented({ options, value, onChange, palette = 'blue', compact }: Props) {
  const onBlue = palette === 'blue';
  return (
    <View style={{ flexDirection: 'row', gap: 8 }}>
      {options.map((o) => {
        const selected = o.value === value;
        const bg = selected ? (onBlue ? colors.cream : '#223A63') : 'transparent';
        const fg = selected ? (onBlue ? colors.deepBlue : colors.cream) : onBlue ? colors.cream : colors.deepBlue;
        const border = selected ? (onBlue ? colors.cream : '#223A63') : onBlue ? creamA(0.4) : deepBlueA(0.45);
        return (
          <Pressable
            key={o.value}
            onPress={() => onChange(o.value)}
            style={{ flex: 1, backgroundColor: bg, borderWidth: 1.5, borderColor: border, borderRadius: 2, paddingVertical: compact ? 12 : 13, alignItems: 'center', minHeight: 44, justifyContent: 'center' }}
          >
            <Text style={{ fontFamily: compact ? fonts.monoMed : fonts.heading, fontSize: compact ? 10 : 13, letterSpacing: compact ? 0.8 : 0, color: fg, textTransform: compact ? 'uppercase' : 'lowercase' }}>
              {o.label}
            </Text>
          </Pressable>
        );
      })}
    </View>
  );
}
