const { formatNote, safeScreenName, contentTypeFor } = require('./lib');

describe('formatNote', () => {
  it('formats a note as a markdown section with screen and timestamp', () => {
    const out = formatNote({ screen: 'walks', note: 'headline too big', timestamp: '2026-09-21 10:00' });
    expect(out).toBe('\n## walks (2026-09-21 10:00)\n\nheadline too big\n');
  });
  it('trims surrounding whitespace from the note body', () => {
    const out = formatNote({ screen: 'you', note: '  more space above button \n', timestamp: 't' });
    expect(out).toContain('\n\nmore space above button\n');
  });
});

describe('safeScreenName', () => {
  it('accepts lowercase slugs', () => {
    expect(safeScreenName('house-rules')).toBe(true);
  });
  it('rejects path traversal and uppercase', () => {
    expect(safeScreenName('../etc')).toBe(false);
    expect(safeScreenName('Walks')).toBe(false);
    expect(safeScreenName('')).toBe(false);
  });
});

describe('contentTypeFor', () => {
  it('maps known extensions', () => {
    expect(contentTypeFor('index.html')).toBe('text/html');
    expect(contentTypeFor('refs/walks.png')).toBe('image/png');
  });
  it('falls back to octet-stream', () => {
    expect(contentTypeFor('x.bin')).toBe('application/octet-stream');
  });
});
