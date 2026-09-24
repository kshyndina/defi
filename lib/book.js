import fs from 'node:fs';
import path from 'node:path';
import { gunzipSync } from 'node:zlib';

let cached;

export function getBook() {
  if (cached) return cached;
  const base = path.join(process.cwd(), 'data-chunks');
  const encoded = Array.from({ length: 9 }, (_, index) =>
    fs.readFileSync(path.join(base, `chunk-${String(index).padStart(2, '0')}.txt`), 'utf8')
  ).join('');
  cached = JSON.parse(gunzipSync(Buffer.from(encoded, 'base64')).toString('utf8'));
  return cached;
}
