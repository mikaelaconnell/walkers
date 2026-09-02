import { act, fireEvent, render, screen } from '@testing-library/react-native';
import { ShopScreen } from './ShopScreen';

jest.mock('expo-router', () => {
  const { Text: RNText } = require('react-native');
  return {
    Link: ({ href, children, style }: any) => <RNText style={style}>{children}</RNText>,
  };
});

jest.mock('expo-web-browser', () => ({
  openBrowserAsync: jest.fn(),
}));

jest.mock('@/api/shop', () => ({
  fetchProducts: jest.fn(),
  startCheckout: jest.fn(),
}));

jest.mock('@/lib/supabase', () => ({
  supabase: {
    storage: {
      from: () => ({
        getPublicUrl: (path: string) => ({ data: { publicUrl: `https://cdn.test/${path}` } }),
      }),
    },
  },
}));

const api = require('@/api/shop') as {
  fetchProducts: jest.Mock;
  startCheckout: jest.Mock;
};

const sellable = {
  id: 'p1',
  name: 'Club Tote',
  description: null,
  price_cents: 4500,
  sizes: [],
  photo_path: null,
  club_only: false,
  active: true,
  sort: 1,
};

const clubOnly = {
  id: 'p2',
  name: 'Walk Box Bandana',
  description: null,
  price_cents: 0,
  sizes: [],
  photo_path: null,
  club_only: true,
  active: true,
  sort: 2,
};

describe('ShopScreen', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('renders sellable products with name, price, and a buy button', async () => {
    api.fetchProducts.mockResolvedValue([sellable]);

    await render(<ShopScreen />);

    expect(await screen.findByText('Club Tote')).toBeTruthy();
    expect(screen.getByText('$45')).toBeTruthy();
    expect(screen.getByText('buy')).toBeTruthy();
  });

  test('renders club-only products in the Not for sale block without a buy button', async () => {
    api.fetchProducts.mockResolvedValue([sellable, clubOnly]);

    await render(<ShopScreen />);

    expect(await screen.findByText('Not for sale')).toBeTruthy();
    expect(screen.getByText('Walk Box Bandana')).toBeTruthy();
    expect(screen.getByText('Club only')).toBeTruthy();
    expect(screen.getAllByText('buy')).toHaveLength(1);
  });

  test('publicPage renders the header wordmark and request-to-join footer', async () => {
    api.fetchProducts.mockResolvedValue([]);

    await render(<ShopScreen publicPage />);

    expect(await screen.findByText('walkers social club')).toBeTruthy();
    expect(screen.getByText('request to join')).toBeTruthy();
  });

  test('member mode (default) does not render the header wordmark or request-to-join footer', async () => {
    api.fetchProducts.mockResolvedValue([]);

    await render(<ShopScreen />);

    await screen.findByText('the shop');
    expect(screen.queryByText('walkers social club')).toBeNull();
    expect(screen.queryByText('request to join')).toBeNull();
  });

  test('a failed checkout shows the napping error on buy press', async () => {
    api.fetchProducts.mockResolvedValue([sellable]);
    api.startCheckout.mockRejectedValue(new Error('checkout unavailable'));

    await render(<ShopScreen />);

    const button = await screen.findByText('buy');
    await act(async () => {
      fireEvent.press(button);
    });

    expect(await screen.findByText('checkout is napping. try again shortly.')).toBeTruthy();
  });
});
