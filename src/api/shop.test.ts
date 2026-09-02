jest.mock('../lib/supabase', () => {
  const builder: any = {
    __result: { data: null as unknown },
    select: jest.fn(() => builder),
    eq: jest.fn(() => builder),
    order: jest.fn(() => builder),
    then: (resolve: (value: unknown) => void) => resolve(builder.__result),
  };
  return {
    supabase: {
      from: jest.fn(() => builder),
      functions: { invoke: jest.fn() },
      __builder: builder,
    },
  };
});

import { fetchProducts, startCheckout } from './shop';

const { supabase } = require('../lib/supabase') as {
  supabase: { from: jest.Mock; functions: { invoke: jest.Mock }; __builder: any };
};
const builder = supabase.__builder;

beforeEach(() => {
  jest.clearAllMocks();
  builder.__result = { data: null };
});

describe('fetchProducts', () => {
  test('queries active products ordered by sort', async () => {
    const products = [{ id: 'p1', name: 'Tote', price_cents: 4500, sizes: [], photo_path: null, club_only: false, active: true, sort: 1 }];
    builder.__result = { data: products };

    const result = await fetchProducts();

    expect(supabase.from).toHaveBeenCalledWith('products');
    expect(builder.select).toHaveBeenCalledWith('*');
    expect(builder.eq).toHaveBeenCalledWith('active', true);
    expect(builder.order).toHaveBeenCalledWith('sort');
    expect(result).toEqual(products);
  });

  test('returns an empty array when the query returns no data', async () => {
    builder.__result = { data: null };
    expect(await fetchProducts()).toEqual([]);
  });
});

describe('startCheckout', () => {
  test('invokes create-checkout with the productId and size and returns the url', async () => {
    supabase.functions.invoke.mockResolvedValue({ data: { url: 'https://checkout.test/session' }, error: null });

    const result = await startCheckout('p1', 'M');

    expect(supabase.functions.invoke).toHaveBeenCalledWith('create-checkout', { body: { productId: 'p1', size: 'M' } });
    expect(result).toBe('https://checkout.test/session');
  });

  test('throws checkout unavailable when the function returns an error', async () => {
    supabase.functions.invoke.mockResolvedValue({ data: null, error: new Error('boom') });

    await expect(startCheckout('p1', null)).rejects.toThrow('checkout unavailable');
  });

  test('throws checkout unavailable when the response has no url', async () => {
    supabase.functions.invoke.mockResolvedValue({ data: {}, error: null });

    await expect(startCheckout('p1', null)).rejects.toThrow('checkout unavailable');
  });
});
