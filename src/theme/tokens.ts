export const colors = {
  clubBlue: '#4B77AB',
  deepBlue: '#3D6494',
  cream: '#F4F1E8',
  sand: '#DCD6C8',
  ink: '#22364F',
  chalkRed: '#C4362B',
  stripeA: '#E2DDCE',
  stripeB: '#EDE8DA',
} as const;

export const fonts = {
  heading: 'Nunito_800ExtraBold',
  headingSemi: 'Nunito_600SemiBold',
  body: 'Georgia',
  mono: 'DMMono_400Regular',
  monoMed: 'DMMono_500Medium',
} as const;

export const creamA = (a: number) => `rgba(244, 241, 232, ${a})`;
export const deepBlueA = (a: number) => `rgba(61, 100, 148, ${a})`;
export const inkA = (a: number) => `rgba(34, 54, 79, ${a})`;
export const clubBlueA = (a: number) => `rgba(75, 119, 171, ${a})`;
