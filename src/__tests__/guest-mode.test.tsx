import { act, fireEvent, render, screen } from '@testing-library/react-native';
import WalksTab from '../app/(tabs)/walks';
import YouTab from '../app/(tabs)/you';
import RecapsTab from '../app/(tabs)/recaps';

const mockPush = jest.fn();
jest.mock('expo-router', () => {
  const { useEffect } = require('react');
  return {
    useFocusEffect: (callback: () => void) => useEffect(callback, [callback]),
    useRouter: () => ({ push: mockPush, replace: jest.fn() }),
  };
});

jest.mock('@/lib/auth', () => ({ useAuth: jest.fn() }));

jest.mock('@/api/walks', () => ({
  fetchUpcomingWalk: jest.fn().mockResolvedValue({
    id: 'w1', walk_number: 9, name: 'washington square loop', walk_date: '2099-01-01', start_time: '10:00',
    pace: 'easy', distance_miles: 2, reveal_at: '2099-01-01', coffee_stop_name: null, coffee_stop_address: null,
    coffee_stop_note: null, headcount: 8, dog_count: 5,
  }),
  fetchMeetPoint: jest.fn().mockResolvedValue(null),
  fetchRsvp: jest.fn().mockResolvedValue(false),
  setRsvp: jest.fn(),
}));

const mockFrom = jest.fn((_table: string) => { throw new Error('guests must not query supabase from these tabs'); });
jest.mock('@/lib/supabase', () => ({ supabase: { from: (t: string) => mockFrom(t) } }));

const mockUseAuth = require('@/lib/auth').useAuth as jest.Mock;

describe('guest mode', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockUseAuth.mockReturnValue({ session: null, profile: null, loading: false });
  });

  it('walks tab shows the walk and a request-to-join button for guests', async () => {
    await render(<WalksTab />);
    expect(await screen.findByText('request to join')).toBeTruthy();
    await act(async () => { fireEvent.press(screen.getByText('request to join')); });
    expect(mockPush).toHaveBeenCalledWith('/apply');
  });

  it('you tab shows a join prompt for guests', async () => {
    await render(<YouTab />);
    await act(async () => { fireEvent.press(screen.getByText('request to join')); });
    expect(mockPush).toHaveBeenCalledWith('/apply');
    await act(async () => { fireEvent.press(screen.getByText('already a member? sign in')); });
    expect(mockPush).toHaveBeenCalledWith('/sign-in');
  });

  it('recaps tab shows a join prompt for guests', async () => {
    await render(<RecapsTab />);
    expect(screen.getByText(/members/i)).toBeTruthy();
  });
});
