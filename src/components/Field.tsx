import { Text, TextInput, View } from 'react-native';
import { colors, creamA, deepBlueA, fonts, inkA } from '../theme/tokens';
import { MonoLabel } from './MonoLabel';
import { Serif } from './Serif';

type Props = {
  label: string; value: string; onChangeText: (t: string) => void;
  placeholder?: string; helper?: string; error?: string; prefix?: string;
  multiline?: boolean; palette?: 'blue' | 'cream';
  autoCapitalize?: 'none' | 'words' | 'sentences'; keyboardType?: 'default' | 'email-address' | 'number-pad';
};

export function Field({ label, value, onChangeText, placeholder, helper, error, prefix, multiline, palette = 'blue', autoCapitalize = 'sentences', keyboardType = 'default' }: Props) {
  const onBlue = palette === 'blue';
  const textColor = onBlue ? colors.cream : colors.ink;
  const borderColor = onBlue ? creamA(0.5) : deepBlueA(0.45);
  const labelColor = onBlue ? creamA(0.85) : colors.deepBlue;
  const placeholderColor = onBlue ? creamA(0.45) : inkA(0.35);
  return (
    <View style={{ gap: 6 }}>
      <MonoLabel color={labelColor}>{label}</MonoLabel>
      <View style={{ flexDirection: 'row', alignItems: multiline ? 'flex-start' : 'center', borderBottomWidth: 1.5, borderColor: error ? (onBlue ? colors.cream : colors.deepBlue) : borderColor, ...(multiline ? { borderWidth: 1.5, backgroundColor: onBlue ? creamA(0.08) : undefined, padding: 11 } : {}) }}>
        {prefix ? <Text style={{ fontFamily: fonts.mono, fontSize: 16, color: onBlue ? creamA(0.6) : inkA(0.6) }}>{prefix}</Text> : null}
        <TextInput
          value={value}
          onChangeText={onChangeText}
          placeholder={placeholder}
          placeholderTextColor={placeholderColor}
          multiline={multiline}
          numberOfLines={multiline ? 4 : 1}
          autoCapitalize={autoCapitalize}
          keyboardType={keyboardType}
          style={{ flex: 1, fontFamily: fonts.body, fontSize: multiline ? 15 : 16, color: textColor, paddingVertical: multiline ? 0 : 9, minHeight: multiline ? 88 : 44, textAlignVertical: 'top' }}
        />
      </View>
      {error ? <MonoLabel color={onBlue ? colors.cream : colors.deepBlue} size={9}>{error}</MonoLabel> : null}
      {helper && !error ? <Serif size={12} color={onBlue ? creamA(0.75) : inkA(0.7)}>{helper}</Serif> : null}
    </View>
  );
}
