import { act, fireEvent, render, screen } from '@testing-library/react-native';
import { Share } from 'react-native';
import YouTab from '../app/(tabs)/you';

jest.mock('expo-router', () => {
  const { useEffect } = require('react');
  return {
    useFocusEffect: (callback: () => void) => useEffect(callback, [callback]),
    useRouter: () => ({ replace: mockReplace, push: mockPush }),
  };
});

jest.mock('@/lib/auth', () => ({
  useAuth: jest.fn(),
}));

type QueryResult = { data: unknown[] | null };

function makeBuilder(result: QueryResult) {
  const builder: Record<string, unknown> = {};
  builder.select = jest.fn(() => builder);
  builder.eq = jest.fn(() => builder);
  builder.then = (resolve: (value: QueryResult) => unknown) => resolve(result);
  return builder;
}

const mockFrom = jest.fn();
const mockSignOut = jest.fn();
const mockReplace = jest.fn();
const mockPush = jest.fn();

jest.mock('@/lib/supabase', () => ({
  supabase: {
    from: (table: string) => mockFrom(table),
    auth: { signOut: () => mockSignOut() },
  },
}));

const mockUseAuth = require('@/lib/auth').useAuth as jest.Mock;

const baseProfile = {
  id: 'p1',
  first_name: 'Maya',
  instagram_handle: 'mayawalks',
  has_dog: false,
  dog_name: null,
  dog_breed: null,
  dog_size: null,
  why: null,
  membership_status: 'approved',
  role: 'member',
};

describe('YouTab', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockSignOut.mockResolvedValue(undefined);
    mockFrom.mockImplementation((table: string) => {
      if (table === 'rsvps') return makeBuilder({ data: [] });
      throw new Error(`unexpected table query: ${table}`);
    });
    mockUseAuth.mockReturnValue({
      session: { user: { id: 'u1' } },
      profile: baseProfile,
      loading: false,
      refreshProfile: jest.fn(),
    });
  });

  test('renders the profile header', async () => {
    await render(<YouTab />);

    expect(await screen.findByText('maya')).toBeTruthy();
    expect(screen.getByText('@mayawalks')).toBeTruthy();
    expect(screen.getByText('Approved member')).toBeTruthy();
  });

  test('stats strip counts only past walks, sums their miles, and counts distinct cafes', async () => {
    mockFrom.mockImplementation((table: string) => {
      if (table === 'rsvps') {
        return makeBuilder({
          data: [
            { walk: { walk_date: '2020-01-01', distance_miles: 2, coffee_stop_name: 'Cafe A' } },
            { walk: { walk_date: '2020-02-01', distance_miles: 3, coffee_stop_name: 'Cafe A' } },
            { walk: { walk_date: '2020-03-01', distance_miles: 1.5, coffee_stop_name: 'Cafe B' } },
            { walk: { walk_date: '2099-01-01', distance_miles: 5, coffee_stop_name: 'Cafe C' } },
          ],
        });
      }
      throw new Error(`unexpected table query: ${table}`);
    });

    await render(<YouTab />);

    expect(await screen.findByText('3')).toBeTruthy();
    expect(screen.getByText('6.5')).toBeTruthy();
    expect(screen.getByText('2')).toBeTruthy();
  });

  test('renders the dog card when has_dog and dog_name are set', async () => {
    mockUseAuth.mockReturnValue({
      session: { user: { id: 'u1' } },
      profile: { ...baseProfile, has_dog: true, dog_name: 'Biscuit', dog_breed: 'Corgi', dog_size: 'small' },
      loading: false,
      refreshProfile: jest.fn(),
    });

    await render(<YouTab />);

    expect(await screen.findByText('biscuit')).toBeTruthy();
    expect(screen.getByText('Corgi · small')).toBeTruthy();
  });

  test('does not render the dog card when has_dog is false', async () => {
    await render(<YouTab />);

    await screen.findByText('maya');
    expect(screen.queryByText('the dog')).toBeNull();
  });

  test('pressing Sign out calls supabase.auth.signOut and then navigates to /', async () => {
    await render(<YouTab />);

    const button = await screen.findByText('Sign out');
    await act(async () => {
      fireEvent.press(button);
    });

    expect(mockSignOut).toHaveBeenCalled();
    expect(mockReplace).toHaveBeenCalledWith('/');
  });

  describe('YouTab settings rows', () => {
    it('routes to edit details, house rules, and report', async () => {
      await render(<YouTab />);
      await act(async () => { fireEvent.press(screen.getByText('Edit my details')); });
      expect(mockPush).toHaveBeenCalledWith('/edit-details');
      await act(async () => { fireEvent.press(screen.getByText('House rules')); });
      expect(mockPush).toHaveBeenCalledWith('/house-rules');
      await act(async () => { fireEvent.press(screen.getByText('Report something')); });
      expect(mockPush).toHaveBeenCalledWith('/report');
    });

    it('opens the share sheet for bring a friend', async () => {
      const shareSpy = jest.spyOn(Share, 'share').mockResolvedValue({ action: Share.dismissedAction });
      await render(<YouTab />);
      await act(async () => {
        fireEvent.press(screen.getByText(/Bring a friend/));
      });
      expect(shareSpy).toHaveBeenCalledWith(expect.objectContaining({ message: expect.stringContaining('walkersnewyork.com') }));
    });

    it('shows the instagram handle with a single @', async () => {
      mockUseAuth.mockReturnValue({
        session: { user: { id: 'p1' } },
        profile: { ...baseProfile, instagram_handle: '@mayawalks' },
        loading: false,
        refreshProfile: jest.fn(),
      });
      await render(<YouTab />);
      expect(await screen.findByText('@mayawalks')).toBeTruthy();
    });

    it('does not throw when the share sheet is unavailable', async () => {
      jest.spyOn(Share, 'share').mockRejectedValue(new Error('Share is not supported in this browser'));
      await render(<YouTab />);
      await act(async () => { fireEvent.press(screen.getByText(/Bring a friend/)); });
      // reaching here without an unhandled rejection is the assertion
      expect(Share.share).toHaveBeenCalled();
    });
  });
});
