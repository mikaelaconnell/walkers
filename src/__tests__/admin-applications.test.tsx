import { act, fireEvent, render, screen } from '@testing-library/react-native';
import AdminApplications from '../app/admin/index';

jest.mock('expo-router', () => {
  const { useEffect } = require('react');
  const React = require('react');
  const { Text } = require('react-native');
  return {
    useFocusEffect: (callback: () => void) => useEffect(callback, [callback]),
    Link: ({ children, style }: any) => React.createElement(Text, { style }, children),
  };
});

type QueryResult = { data: unknown[] | null };

function makeBuilder(result: QueryResult) {
  const builder: Record<string, unknown> = {};
  builder.select = jest.fn(() => builder);
  builder.eq = jest.fn(() => builder);
  builder.order = jest.fn(() => builder);
  builder.then = (resolve: (value: QueryResult) => unknown) => resolve(result);
  return builder;
}

const mockFrom = jest.fn();
const mockInvoke = jest.fn();

jest.mock('@/lib/supabase', () => ({
  supabase: {
    from: (table: string) => mockFrom(table),
    functions: { invoke: (...args: unknown[]) => mockInvoke(...args) },
  },
}));

const pendingApp = {
  id: 'u1',
  first_name: 'Maya',
  instagram_handle: 'mayawalks',
  has_dog: true,
  dog_name: 'Biscuit',
  dog_breed: 'Corgi',
  dog_size: 'small',
  why: 'I want to make walking friends',
  membership_status: 'pending',
  role: 'member',
  created_at: '2026-08-01T00:00:00.000Z',
};

describe('AdminApplications', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockInvoke.mockResolvedValue({ data: { ok: true }, error: null });
  });

  test('renders "Nothing waiting. Nice." when there are no pending profiles', async () => {
    mockFrom.mockImplementation((table: string) => {
      if (table === 'profiles') return makeBuilder({ data: [] });
      throw new Error(`unexpected table query: ${table}`);
    });

    await render(<AdminApplications />);

    expect(await screen.findByText('Nothing waiting. Nice.')).toBeTruthy();
  });

  test('renders a pending application with lowercased name, handle, dog line, and why quote', async () => {
    mockFrom.mockImplementation((table: string) => {
      if (table === 'profiles') return makeBuilder({ data: [pendingApp] });
      throw new Error(`unexpected table query: ${table}`);
    });

    await render(<AdminApplications />);

    expect(await screen.findByText('maya')).toBeTruthy();
    expect(screen.getByText('@mayawalks')).toBeTruthy();
    expect(screen.getByText('Dog: Biscuit (Corgi, small)')).toBeTruthy();
    expect(screen.getByText('"I want to make walking friends"')).toBeTruthy();
  });

  test('pressing approve invokes review-application with decision approved and reloads', async () => {
    mockFrom.mockImplementation((table: string) => makeBuilder({ data: [pendingApp] }));

    await render(<AdminApplications />);
    await screen.findByText('maya');
    mockFrom.mockClear();

    const approveButton = screen.getByText('approve');
    await act(async () => {
      fireEvent.press(approveButton);
    });

    expect(mockInvoke).toHaveBeenCalledWith('review-application', { body: { userId: 'u1', decision: 'approved' } });
    expect(mockFrom).toHaveBeenCalledWith('profiles');
  });

  test('pressing decline invokes review-application with decision declined', async () => {
    mockFrom.mockImplementation((table: string) => makeBuilder({ data: [pendingApp] }));

    await render(<AdminApplications />);
    await screen.findByText('maya');

    const declineButton = screen.getByText('decline');
    await act(async () => {
      fireEvent.press(declineButton);
    });

    expect(mockInvoke).toHaveBeenCalledWith('review-application', { body: { userId: 'u1', decision: 'declined' } });
  });

  test('the instagram handle is wrapped in a pressable with hitSlop reaching a 44pt touch target', async () => {
    mockFrom.mockImplementation((table: string) => makeBuilder({ data: [pendingApp] }));

    await render(<AdminApplications />);
    await screen.findByText('maya');

    const link = screen.getByTestId('instagram-link-u1');
    expect(link.props.hitSlop).toBeTruthy();
    const { top = 0, bottom = 0 } = link.props.hitSlop;
    // fontSize 13 renders at roughly 16-18pt tall; the added hitSlop must close the gap to 44pt.
    expect(top + bottom).toBeGreaterThanOrEqual(26);

    const handleText = screen.getByText('@mayawalks');
    expect(handleText.parent).toBe(link);
  });

  test('shows an inline error when review-application fails, and clears it on the next attempt', async () => {
    mockFrom.mockImplementation((table: string) => makeBuilder({ data: [pendingApp] }));
    mockInvoke.mockResolvedValueOnce({ data: null, error: { message: 'network down' } });

    await render(<AdminApplications />);
    await screen.findByText('maya');

    await act(async () => {
      fireEvent.press(screen.getByText('approve'));
    });

    expect(await screen.findByText("couldn't reach the server, try again")).toBeTruthy();

    mockInvoke.mockResolvedValueOnce({ data: { ok: true }, error: null });
    await act(async () => {
      fireEvent.press(screen.getByText('approve'));
    });

    expect(screen.queryByText("couldn't reach the server, try again")).toBeNull();
  });
});
