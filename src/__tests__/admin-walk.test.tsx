import { act, fireEvent, render, screen } from '@testing-library/react-native';
import AdminWalk from '../app/admin/walk';

const mockBack = jest.fn();

jest.mock('expo-router', () => ({
  useRouter: () => ({ back: mockBack }),
}));

type QueryResult = { data: unknown; error: unknown };

function makeBuilder(result: QueryResult) {
  const builder: Record<string, unknown> = {};
  builder.select = jest.fn(() => builder);
  builder.gte = jest.fn(() => builder);
  builder.order = jest.fn(() => builder);
  builder.limit = jest.fn(() => builder);
  builder.eq = jest.fn(() => builder);
  builder.maybeSingle = jest.fn(() => Promise.resolve(result));
  builder.single = jest.fn(() => Promise.resolve(result));
  builder.update = jest.fn(() => builder);
  builder.insert = jest.fn(() => builder);
  builder.upsert = jest.fn(() => Promise.resolve(result));
  builder.then = (resolve: (value: QueryResult) => unknown) => resolve(result);
  return builder;
}

const mockFrom = jest.fn();

jest.mock('../lib/supabase', () => ({
  supabase: {
    from: (table: string) => mockFrom(table),
  },
}));

const walk = {
  id: 'w1',
  walk_number: 4,
  name: 'hudson river loop',
  walk_date: '2026-09-12',
  start_time: '9:30 am',
  headcount: 12,
  dog_count: 6,
  reveal_at: '2026-09-11T09:00:00-04:00',
  coffee_stop_name: 'Sey',
  coffee_stop_address: 'Bedford St',
  coffee_stop_note: null,
};

const meetPoint = { walk_id: 'w1', meet_point: 'Pier 45 lawn', meet_note: 'By the flagpole' };

describe('AdminWalk', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('loads the upcoming walk and its meet point into the form', async () => {
    mockFrom.mockImplementation((table: string) => {
      if (table === 'walks') return makeBuilder({ data: [walk], error: null });
      if (table === 'walk_meet_points') return makeBuilder({ data: meetPoint, error: null });
      throw new Error(`unexpected table query: ${table}`);
    });

    await render(<AdminWalk />);

    expect(await screen.findByDisplayValue('hudson river loop')).toBeTruthy();
    expect(screen.getByDisplayValue('4')).toBeTruthy();
    expect(screen.getByDisplayValue('2026-09-12')).toBeTruthy();
    expect(screen.getByDisplayValue('2026-09-11T09:00:00-04:00')).toBeTruthy();
    expect(screen.getByDisplayValue('Pier 45 lawn')).toBeTruthy();
    expect(screen.getByDisplayValue('By the flagpole')).toBeTruthy();
  });

  test('shows the required-fields message when saving with a blank name', async () => {
    mockFrom.mockImplementation((table: string) => {
      if (table === 'walks') return makeBuilder({ data: [], error: null });
      throw new Error(`unexpected table query: ${table}`);
    });

    await render(<AdminWalk />);

    await act(async () => {
      fireEvent.press(screen.getByText('save walk'));
    });

    expect(await screen.findByText('walk number, name, date, and reveal time are required')).toBeTruthy();
  });

  test('a successful update save shows "saved"', async () => {
    const updateBuilder = makeBuilder({ data: null, error: null });
    const walksBuilder = makeBuilder({ data: [walk], error: null });
    walksBuilder.update = jest.fn(() => updateBuilder);
    updateBuilder.eq = jest.fn(() => Promise.resolve({ data: null, error: null }));

    mockFrom.mockImplementation((table: string) => {
      if (table === 'walks') return walksBuilder;
      if (table === 'walk_meet_points') return makeBuilder({ data: meetPoint, error: null });
      throw new Error(`unexpected table query: ${table}`);
    });

    await render(<AdminWalk />);
    await screen.findByDisplayValue('hudson river loop');

    await act(async () => {
      fireEvent.press(screen.getByText('save walk'));
    });

    expect(await screen.findByText('saved')).toBeTruthy();
  });

  test('a save error surfaces the failure message', async () => {
    const updateBuilder = makeBuilder({ data: null, error: null });
    const walksBuilder = makeBuilder({ data: [walk], error: null });
    walksBuilder.update = jest.fn(() => updateBuilder);
    updateBuilder.eq = jest.fn(() => Promise.resolve({ data: null, error: { message: 'network down' } }));

    mockFrom.mockImplementation((table: string) => {
      if (table === 'walks') return walksBuilder;
      if (table === 'walk_meet_points') return makeBuilder({ data: meetPoint, error: null });
      throw new Error(`unexpected table query: ${table}`);
    });

    await render(<AdminWalk />);
    await screen.findByDisplayValue('hudson river loop');

    await act(async () => {
      fireEvent.press(screen.getByText('save walk'));
    });

    expect(await screen.findByText('walk save failed: network down')).toBeTruthy();
  });
});
