// Pure helpers for the design studio server; kept dependency-free so they
// can be unit tested without opening sockets.

function formatNote({ screen, note, timestamp }) {
  return `\n## ${screen} (${timestamp})\n\n${String(note).trim()}\n`;
}

function safeScreenName(name) {
  return typeof name === 'string' && /^[a-z0-9][a-z0-9-]{0,39}$/.test(name);
}

const TYPES = {
  '.html': 'text/html',
  '.png': 'image/png',
  '.md': 'text/markdown',
  '.js': 'text/javascript',
  '.json': 'application/json',
};

function contentTypeFor(filePath) {
  const dot = filePath.lastIndexOf('.');
  const ext = dot === -1 ? '' : filePath.slice(dot);
  return TYPES[ext] || 'application/octet-stream';
}

module.exports = { formatNote, safeScreenName, contentTypeFor };
