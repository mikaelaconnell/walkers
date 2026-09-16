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

const mockUpdate = jest.fn();
const mockEq = jest.fn();
jest.mock('@/lib/supabase', () => ({
  supabase: {
    from: () => ({ update: (row: unknown) => { mockUpdate(row); return { eq: (col: string, v: string) => mockEq(col, v) }; } }),
  },
}));

import EditDetails from '../app/edit-details';

const mockUseAuth = require('@/lib/auth').useAuth as jest.Mock;
const mockRefresh = jest.fn();

const profile = {
  id: 'u1', first_name: 'Maya', instagram_handle: 'mayawalks', has_dog: true,
  dog_name: 'Biscuit', dog_breed: 'Corgi', dog_size: 'small', why: null,
  membership_status: 'approved', role: 'member',
};

describe('EditDetails', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockEq.mockResolvedValue({ error: null });
    mockUseAuth.mockReturnValue({ session: { user: { id: 'u1' } }, profile, refreshProfile: mockRefresh });
  });

  it('redirects signed-out users home', async () => {
    mockUseAuth.mockReturnValue({ session: null, profile: null, refreshProfile: mockRefresh });
    await render(<EditDetails />);
    expect(screen.getByText('redirect:/')).toBeTruthy();
  });

  it('prefills from the profile and saves trimmed values', async () => {
    await render(<EditDetails />);
    const input = await screen.findByDisplayValue('Maya');
    expect(input).toBeTruthy();
    fireEvent.changeText(input, '  May  ');
    const button = await screen.findByText('save');
    await act(async () => { fireEvent.press(button); });
    expect(mockUpdate).toHaveBeenCalledWith(expect.objectContaining({ first_name: 'May', instagram_handle: 'mayawalks' }));
    expect(mockEq).toHaveBeenCalledWith('id', 'u1');
    expect(mockRefresh).toHaveBeenCalled();
    expect(mockBack).toHaveBeenCalled();
  });

  it('clears dog fields when has dog is switched off', async () => {
    await render(<EditDetails />);
    const segmentButton = await screen.findByText('just me');
    fireEvent.press(segmentButton);
    const button = await screen.findByText('save');
    await act(async () => { fireEvent.press(button); });
    expect(mockUpdate).toHaveBeenCalledWith(expect.objectContaining({ has_dog: false, dog_name: null, dog_breed: null, dog_size: null }));
  });

  it('blocks an empty first name', async () => {
    await render(<EditDetails />);
    const input = await screen.findByDisplayValue('Maya');
    fireEvent.changeText(input, '');
    const button = await screen.findByText('save');
    await act(async () => { fireEvent.press(button); });
    expect(mockUpdate).not.toHaveBeenCalled();
  });
});
