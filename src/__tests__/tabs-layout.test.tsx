import { fireEvent, render, screen } from '@testing-library/react-native';
import TabsLayout, { TextTabBar } from '../app/(tabs)/_layout';
import { colors, creamA } from '../theme/tokens';

const mockRedirectFn = jest.fn();
const mockTabsFn = jest.fn();

jest.mock('expo-router', () => {
  const Tabs = ({ children }: any) => {
    mockTabsFn();
    return children;
  };
  Tabs.Screen = () => null;
  return {
    Redirect: ({ href }: { href: string }) => {
      mockRedirectFn(href);
      return null;
    },
    Tabs,
  };
});

jest.mock('react-native-safe-area-context', () => ({
  useSafeAreaInsets: () => ({ top: 0, bottom: 0, left: 0, right: 0 }),
}));

jest.mock('@/lib/auth', () => ({
  useAuth: jest.fn(),
}));

const mockUseAuth = require('@/lib/auth').useAuth as jest.Mock;

const authState = (over: object) => ({ session: null, profile: null, loading: false, refreshProfile: jest.fn(), ...over });

describe('TabsLayout guard', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('renders nothing while loading', async () => {
    mockUseAuth.mockReturnValue(authState({ loading: true }));
    const view = await render(<TabsLayout />);
    expect(view.toJSON()).toBeNull();
    expect(mockRedirectFn).not.toHaveBeenCalled();
  });

  test('renders Tabs for a signed-out guest', async () => {
    mockUseAuth.mockReturnValue(authState({}));
    await render(<TabsLayout />);
    expect(mockTabsFn).toHaveBeenCalled();
    expect(mockRedirectFn).not.toHaveBeenCalled();
  });

  test('redirects to /pending when profile is not approved', async () => {
    mockUseAuth.mockReturnValue(authState({ session: { user: { id: '123' } }, profile: { membership_status: 'pending' } }));
    await render(<TabsLayout />);
    expect(mockRedirectFn).toHaveBeenCalledWith('/pending');
  });

  test('redirects to /apply when session exists but profile is missing', async () => {
    mockUseAuth.mockReturnValue(authState({ session: { user: { id: '123' } } }));
    await render(<TabsLayout />);
    expect(mockRedirectFn).toHaveBeenCalledWith('/apply');
  });

  test('renders Tabs for an approved member', async () => {
    mockUseAuth.mockReturnValue(authState({ session: { user: { id: '123' } }, profile: { membership_status: 'approved' } }));
    await render(<TabsLayout />);
    expect(mockTabsFn).toHaveBeenCalled();
    expect(mockRedirectFn).not.toHaveBeenCalled();
  });
});

describe('TextTabBar', () => {
  const routes = [
    { key: 'walks-1', name: 'walks' },
    { key: 'recaps-1', name: 'recaps' },
    { key: 'shop-1', name: 'shop' },
    { key: 'you-1', name: 'you' },
  ];

  const barProps = (index: number, navigate: jest.Mock) =>
    ({
      state: { index, routes },
      navigation: { navigate },
      descriptors: {},
      insets: { top: 0, bottom: 0, left: 0, right: 0 },
    }) as any;

  test('renders all four lowercase labels', async () => {
    await render(<TextTabBar {...barProps(0, jest.fn())} />);
    expect(screen.getByText('walks')).toBeTruthy();
    expect(screen.getByText('recaps')).toBeTruthy();
    expect(screen.getByText('shop')).toBeTruthy();
    expect(screen.getByText('you')).toBeTruthy();
  });

  test('active label is cream and inactive labels are faded', async () => {
    await render(<TextTabBar {...barProps(0, jest.fn())} />);
    expect(screen.getByText('walks').props.style.color).toBe('#F4F1E8');
    expect(screen.getByText('walks').props.style.color).toBe(colors.cream);
    for (const name of ['recaps', 'shop', 'you']) {
      expect(screen.getByText(name).props.style.color).toBe(creamA(0.5));
      expect(screen.getByText(name).props.style.color).not.toBe('#F4F1E8');
    }
  });

  test('pressing a tab navigates to that route name', async () => {
    const navigate = jest.fn();
    await render(<TextTabBar {...barProps(0, navigate)} />);
    fireEvent.press(screen.getByText('shop'));
    expect(navigate).toHaveBeenCalledWith('shop');
  });
});
