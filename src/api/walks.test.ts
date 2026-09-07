jest.mock('../lib/supabase', () => {
  const builder: any = {
    __result: { data: null as unknown },
    select: jest.fn(() => builder),
    gte: jest.fn(() => builder),
    order: jest.fn(() => builder),
    limit: jest.fn(() => builder),
    eq: jest.fn(() => builder),
    upsert: jest.fn(() => Promise.resolve(builder.__result)),
    then: (resolve: (value: unknown) => void) => resolve(builder.__result),
  };
  return {
    supabase: {
      from: jest.fn(() => builder),
      rpc: jest.fn(() => Promise.resolve(builder.__result)),
      __builder: builder,
    },
  };
});

import { fetchMeetPoint, fetchRsvp, fetchUpcomingWalk, setRsvp } from './walks';

const { supabase } = require('../lib/supabase') as {
  supabase: { from: jest.Mock; rpc: jest.Mock; __builder: any };
};
const builder = supabase.__builder;

beforeEach(() => {
  jest.clearAllMocks();
  builder.__result = { data: null };
});

describe('fetchUpcomingWalk', () => {
  test("queries walks filtered by today's date, ordered and limited to one", async () => {
    const walk = { id: 'w1', walk_number: 3, name: 'Riverside Ramble' };
    builder.__result = { data: [walk] };

    const result = await fetchUpcomingWalk();

    expect(supabase.from).toHaveBeenCalledWith('walks');
    expect(builder.select).toHaveBeenCalledWith('*');
    const today = new Date().toISOString().slice(0, 10);
    expect(builder.gte).toHaveBeenCalledWith('walk_date', today);
    expect(builder.order).toHaveBeenCalledWith('walk_date', { ascending: true });
    expect(builder.limit).toHaveBeenCalledWith(1);
    expect(result).toEqual(walk);
  });

  test('returns null when no upcoming walk exists', async () => {
    builder.__result = { data: [] };
    expect(await fetchUpcomingWalk()).toBeNull();
  });

  test('returns null when the query returns no data', async () => {
    builder.__result = { data: null };
    expect(await fetchUpcomingWalk()).toBeNull();
  });
});

describe('fetchMeetPoint', () => {
  test('calls the get_meet_point RPC with p_walk_id and returns the first row', async () => {
    const meet = { meet_point: 'Pier 45 lawn', meet_note: 'By the flagpole' };
    builder.__result = { data: [meet] };

    const result = await fetchMeetPoint('w1');

    expect(supabase.rpc).toHaveBeenCalledWith('get_meet_point', { p_walk_id: 'w1' });
    expect(result).toEqual(meet);
  });

  test('returns null when locked (RPC returns no rows)', async () => {
    builder.__result = { data: [] };
    expect(await fetchMeetPoint('w1')).toBeNull();
  });
});

describe('fetchRsvp', () => {
  test('returns true only when a matching row exists', async () => {
    builder.__result = { data: [{ walk_id: 'w1' }] };

    const result = await fetchRsvp('w1', 'u1');

    expect(supabase.from).toHaveBeenCalledWith('rsvps');
    expect(builder.select).toHaveBeenCalledWith('walk_id');
    expect(builder.eq).toHaveBeenNthCalledWith(1, 'walk_id', 'w1');
    expect(builder.eq).toHaveBeenNthCalledWith(2, 'user_id', 'u1');
    expect(result).toBe(true);
  });

  test('returns false when no matching row exists', async () => {
    builder.__result = { data: [] };
    expect(await fetchRsvp('w1', 'u1')).toBe(false);
  });
});

describe('setRsvp', () => {
  test('upserts a row keyed by walk_id and user_id', async () => {
    await setRsvp('w1', 'u1');

    expect(supabase.from).toHaveBeenCalledWith('rsvps');
    expect(builder.upsert).toHaveBeenCalledWith({ walk_id: 'w1', user_id: 'u1' });
  });
});
