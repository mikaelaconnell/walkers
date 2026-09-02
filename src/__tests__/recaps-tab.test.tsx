import { render, screen } from '@testing-library/react-native';
import RecapsTab from '../app/(tabs)/recaps';

type JsonNode = { type: string; props: Record<string, unknown>; children: JsonNode[] | string[] | null } | string;

function findImageUris(node: JsonNode | JsonNode[] | null): string[] {
  if (node == null) return [];
  if (Array.isArray(node)) return node.flatMap((child) => findImageUris(child));
  if (typeof node === 'string') return [];
  const own = node.type === 'Image' ? [(node.props.source as { uri: string }).uri] : [];
  return own.concat(findImageUris(node.children as JsonNode[] | null));
}

jest.mock('expo-router', () => {
  const { useEffect } = require('react');
  return {
    useFocusEffect: (callback: () => void) => useEffect(callback, [callback]),
  };
});

type QueryResult = { data: unknown[] | null };

function makeBuilder(result: QueryResult) {
  const builder: Record<string, unknown> = {};
  builder.select = jest.fn(() => builder);
  builder.eq = jest.fn(() => builder);
  builder.order = jest.fn(() => builder);
  builder.limit = jest.fn(() => builder);
  builder.lt = jest.fn(() => builder);
  builder.then = (resolve: (value: QueryResult) => unknown) => resolve(result);
  return builder;
}

const mockFrom = jest.fn();
const mockStorageFrom = jest.fn();

jest.mock('@/lib/supabase', () => ({
  supabase: {
    from: (table: string) => mockFrom(table),
    storage: { from: (bucket: string) => mockStorageFrom(bucket) },
  },
}));

describe('RecapsTab', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockStorageFrom.mockImplementation(() => ({
      getPublicUrl: (path: string) => ({ data: { publicUrl: `https://cdn.test/${path}` } }),
    }));
  });

  test('renders the placeholder grid and never queries recap photos or notes when there is no past walk', async () => {
    mockFrom.mockImplementation((table: string) => {
      if (table === 'walks') return makeBuilder({ data: [] });
      throw new Error(`unexpected table query: ${table}`);
    });

    await render(<RecapsTab />);

    expect(await screen.findByText('Photos land here after the first walk')).toBeTruthy();
    expect(mockFrom).toHaveBeenCalledWith('walks');
    expect(mockFrom).not.toHaveBeenCalledWith('recap_photos');
    expect(mockFrom).not.toHaveBeenCalledWith('recap_notes');
  });

  test('renders photos and notes for the last walk', async () => {
    const photos = [
      { id: 'p1', path: 'walk1/full-a.jpg', caption: null, span: 'full', sort: 1 },
      { id: 'p2', path: 'walk1/half-a.jpg', caption: null, span: 'half', sort: 2 },
      { id: 'p3', path: 'walk1/half-b.jpg', caption: null, span: 'half', sort: 3 },
    ];
    const notes = [
      { id: 'n1', author_name: 'Jamie', author_handle: 'jamiewalks', quote: 'Best Saturday habit I have.' },
    ];

    mockFrom.mockImplementation((table: string) => {
      if (table === 'walks') return makeBuilder({ data: [{ id: 'w1' }] });
      if (table === 'recap_photos') return makeBuilder({ data: photos });
      if (table === 'recap_notes') return makeBuilder({ data: notes });
      throw new Error(`unexpected table query: ${table}`);
    });

    await render(<RecapsTab />);

    expect(await screen.findByText('Jamie')).toBeTruthy();
    expect(screen.getByText('@jamiewalks')).toBeTruthy();
    expect(screen.getByText('Best Saturday habit I have.')).toBeTruthy();

    const uris = findImageUris(screen.toJSON());
    expect(uris).toEqual(
      expect.arrayContaining([
        'https://cdn.test/walk1/full-a.jpg',
        'https://cdn.test/walk1/half-a.jpg',
        'https://cdn.test/walk1/half-b.jpg',
      ])
    );
    expect(uris).toHaveLength(3);
  });
});
