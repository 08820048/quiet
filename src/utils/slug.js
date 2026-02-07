const isAscii = (value) => /^[\x00-\x7F]*$/.test(value);

const fnv1a32 = (input) => {
  let hash = 0x811c9dc5;
  for (let i = 0; i < input.length; i += 1) {
    hash ^= input.charCodeAt(i);
    hash = Math.imul(hash, 0x01000193);
  }
  return (hash >>> 0).toString(16).padStart(8, '0');
};

export const resolvePostSlug = (fileName) => {
  const raw = String(fileName).trim().toLowerCase();
  const asciiBase = raw
    .normalize('NFKD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');

  const base = asciiBase || 'post';
  if (!isAscii(raw)) {
    return `${base}-${fnv1a32(raw)}`;
  }
  return base;
};
