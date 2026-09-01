import { colors, creamA, fonts } from './tokens';

test('handoff colors are exact', () => {
  expect(colors.clubBlue).toBe('#4B77AB');
  expect(colors.deepBlue).toBe('#3D6494');
  expect(colors.cream).toBe('#F4F1E8');
  expect(colors.ink).toBe('#22364F');
});

test('cream alpha helper emits rgba', () => {
  expect(creamA(0.4)).toBe('rgba(244, 241, 232, 0.4)');
});

test('heading font is Nunito 800', () => {
  expect(fonts.heading).toBe('Nunito_800ExtraBold');
});
