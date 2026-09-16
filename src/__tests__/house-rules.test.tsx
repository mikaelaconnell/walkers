import { act, fireEvent, render, screen } from '@testing-library/react-native';
import HouseRules from '../app/house-rules';
import { HOUSE_RULES } from '../lib/copy';

const mockBack = jest.fn();

jest.mock('expo-router', () => ({
  useRouter: () => ({ back: mockBack }),
}));

describe('HouseRules', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('renders every rule with its detail', async () => {
    await render(<HouseRules />);
    for (const r of HOUSE_RULES) {
      expect(screen.getByText(r.rule.toLowerCase())).toBeTruthy();
      expect(screen.getByText(r.detail)).toBeTruthy();
    }
  });

  test('goes back when Back is tapped', async () => {
    await render(<HouseRules />);
    const backButton = screen.getByText('Back');
    await act(async () => {
      fireEvent.press(backButton);
    });
    expect(mockBack).toHaveBeenCalled();
  });
});
