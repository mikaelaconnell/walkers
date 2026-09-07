import Svg, { Ellipse, Rect } from 'react-native-svg';
import { colors } from '../theme/tokens';

export function DogLogo({ width = 60, color = colors.cream }: { width?: number; color?: string }) {
  const h = (width * 84) / 124;
  return (
    <Svg width={width} height={h} viewBox="0 0 124 84">
      <Ellipse cx="58" cy="38" rx="34" ry="16" fill={color} />
      <Ellipse cx="96" cy="26" rx="13" ry="10" fill={color} />
      <Rect x="104" y="12" width="8" height="10" rx="4" fill={color} />
      <Rect x="30" y="48" width="7" height="26" rx="3.5" fill={color} />
      <Rect x="48" y="50" width="7" height="24" rx="3.5" fill={color} />
      <Rect x="68" y="50" width="7" height="24" rx="3.5" fill={color} />
      <Rect x="84" y="48" width="7" height="26" rx="3.5" fill={color} />
      <Ellipse cx="20" cy="28" rx="10" ry="5" fill={color} transform="rotate(-35 20 28)" />
    </Svg>
  );
}
