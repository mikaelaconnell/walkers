import { render } from '@testing-library/react-native';
import AdminLayout from '../app/admin/_layout';

const mockRedirectFn = jest.fn();
const mockStackFn = jest.fn();

jest.mock('expo-router', () => {
  const Stack = (props: any) => {
    mockStackFn(props);
    return null;
  };
  return {
    Redirect: ({ href }: { href: string }) => {
      mockRedirectFn(href);
      return null;
    },
    Stack,
  };
});

jest.mock('@/lib/auth', () => ({
  useAuth: jest.fn(),
}));

const mockUseAuth = require('@/lib/auth').useAuth as jest.Mock;

const authState = (over: object) => ({ session: null, profile: null, loading: false, refreshProfile: jest.fn(), ...over });

describe('AdminLayout guard', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('renders nothing while loading', async () => {
    mockUseAuth.mockReturnValue(authState({ loading: true }));
    const view = await render(<AdminLayout />);
    expect(view.toJSON()).toBeNull();
    expect(mockRedirectFn).not.toHaveBeenCalled();
    expect(mockStackFn).not.toHaveBeenCalled();
  });

  test('redirects to / when profile role is not owner', async () => {
    mockUseAuth.mockReturnValue(authState({ profile: { role: 'member' } }));
    await render(<AdminLayout />);
    expect(mockRedirectFn).toHaveBeenCalledWith('/');
    expect(mockStackFn).not.toHaveBeenCalled();
  });

  test('redirects to / when profile is missing', async () => {
    mockUseAuth.mockReturnValue(authState({}));
    await render(<AdminLayout />);
    expect(mockRedirectFn).toHaveBeenCalledWith('/');
  });

  test('renders the Stack for an owner', async () => {
    mockUseAuth.mockReturnValue(authState({ profile: { role: 'owner' } }));
    await render(<AdminLayout />);
    expect(mockStackFn).toHaveBeenCalled();
    expect(mockRedirectFn).not.toHaveBeenCalled();
  });
});
