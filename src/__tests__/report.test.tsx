import { act, fireEvent, render, screen } from '@testing-library/react-native';

const mockBack = jest.fn();
jest.mock('expo-router', () => ({
  useRouter: () => ({ back: mockBack }),
  Redirect: ({ href }: { href: string }) => {
    const { Text } = require('react-native');
    return <Text>{`redirect:${href}`}</Text>;
  },
}));

jest.mock('@/lib/auth', () => ({ useAuth: jest.fn() }));

const mockInsert = jest.fn(() => Promise.resolve({ error: null }));
jest.mock('@/lib/supabase', () => ({
  supabase: { from: () => ({ insert: mockInsert }) },
}));

import Report from '../app/report';

const mockUseAuth = require('@/lib/auth').useAuth as jest.Mock;

describe('Report', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockUseAuth.mockReturnValue({ session: { user: { id: 'u1' } }, profile: { first_name: 'Maya' } });
    mockInsert.mockResolvedValue({ error: null });
  });

  it('redirects signed-out users home', async () => {
    mockUseAuth.mockReturnValue({ session: null, profile: null });
    await render(<Report />);
    expect(screen.getByText('redirect:/')).toBeTruthy();
  });

  it('submits a report and shows the sent state', async () => {
    await render(<Report />);
    const input = await screen.findByPlaceholderText('what happened, in your own words');
    fireEvent.changeText(input, 'someone was off leash');
    const button = await screen.findByText('send it');
    await act(async () => { fireEvent.press(button); });
    expect(mockInsert).toHaveBeenCalledWith({ user_id: 'u1', body: 'someone was off leash' });
    expect(screen.getByText(/we got it/i)).toBeTruthy();
  });

  it('does not submit an empty report', async () => {
    await render(<Report />);
    const button = await screen.findByText('send it');
    await act(async () => { fireEvent.press(button); });
    expect(mockInsert).not.toHaveBeenCalled();
  });
});
