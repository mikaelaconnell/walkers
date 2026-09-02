import { act, fireEvent, render, screen } from '@testing-library/react-native';
import WalksTab from '../app/(tabs)/walks';

jest.mock('expo-router', () => {
  const { useEffect } = require('react');
  return {
    useFocusEffect: (callback: () => void) => useEffect(callback, [callback]),
  };
});

jest.mock('@/api/walks', () => ({
  fetchUpcomingWalk: jest.fn(),
  fetchMeetPoint: jest.fn(),
  fetchRsvp: jest.fn(),
  setRsvp: jest.fn(),
}));

jest.mock('@/lib/auth', () => ({
  useAuth: jest.fn(),
}));

const api = require('@/api/walks') as {
  fetchUpcomingWalk: jest.Mock;
  fetchMeetPoint: jest.Mock;
  fetchRsvp: jest.Mock;
  setRsvp: jest.Mock;
};
const mockUseAuth = require('@/lib/auth').useAuth as jest.Mock;

const walk = {
  id: 'w1',
  walk_number: 3,
  name: 'Riverside Ramble',
  walk_date: '2026-09-05',
  start_time: '9:00am',
  pace: 'easy',
  distance_miles: 2,
  reveal_at: '2026-09-04T00:00:00.000Z',
  coffee_stop_name: null,
  coffee_stop_address: null,
  coffee_stop_note: null,
  headcount: 8,
  dog_count: 5,
};

describe('WalksTab', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockUseAuth.mockReturnValue({
      session: { user: { id: 'u1' } },
      profile: { first_name: 'Maya' },
      loading: false,
      refreshProfile: jest.fn(),
    });
    api.fetchRsvp.mockResolvedValue(false);
    api.setRsvp.mockResolvedValue(undefined);
  });

  test('renders the locked meet point card when fetchMeetPoint resolves null', async () => {
    api.fetchUpcomingWalk.mockResolvedValue(walk);
    api.fetchMeetPoint.mockResolvedValue(null);

    await render(<WalksTab />);

    expect(await screen.findByText('Meet point · Locked')).toBeTruthy();
    expect(screen.queryByText('Meet point · Unlocked')).toBeNull();
  });

  test('renders the unlocked meet point text when fetchMeetPoint resolves a value', async () => {
    api.fetchUpcomingWalk.mockResolvedValue(walk);
    api.fetchMeetPoint.mockResolvedValue({ meet_point: 'Pier 45 lawn', meet_note: 'By the flagpole' });

    await render(<WalksTab />);

    expect(await screen.findByText('Meet point · Unlocked')).toBeTruthy();
    expect(screen.getByText('Pier 45 lawn')).toBeTruthy();
    expect(screen.getByText('By the flagpole')).toBeTruthy();
  });

  test('renders the no-walk card when there is no upcoming walk', async () => {
    api.fetchUpcomingWalk.mockResolvedValue(null);

    await render(<WalksTab />);

    expect(await screen.findByText('No walk on the board yet. Check back soon.')).toBeTruthy();
  });

  test('pressing the RSVP button calls setRsvp and flips the label', async () => {
    api.fetchUpcomingWalk.mockResolvedValue(walk);
    api.fetchMeetPoint.mockResolvedValue(null);

    await render(<WalksTab />);

    const button = await screen.findByText('count me in for saturday');
    await act(async () => {
      fireEvent.press(button);
    });

    await screen.findByText('you’re in: see you saturday');
    expect(api.setRsvp).toHaveBeenCalledWith('w1', 'u1');
  });
});
