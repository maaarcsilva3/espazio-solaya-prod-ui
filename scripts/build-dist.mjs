import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, '..');
const DIST = path.join(ROOT, 'dist');
const STATIC_SRC = path.join(ROOT, 'Static');
const STATIC_DEST = path.join(DIST, 'Static');

const KEEP_STATIC_FILES = [
  'logo gold.png',
  'logo and title.png',
  'title only.png',
  'Rosemartin.otf',
  'solaya_aerial_view.mp4',
];

function rmrf(dir) {
  if (fs.existsSync(dir)) fs.rmSync(dir, { recursive: true, force: true });
}

function copyFile(src, dest) {
  fs.mkdirSync(path.dirname(dest), { recursive: true });
  fs.copyFileSync(src, dest);
}

function copyDir(src, dest) {
  fs.mkdirSync(dest, { recursive: true });
  for (const entry of fs.readdirSync(src, { withFileTypes: true })) {
    const from = path.join(src, entry.name);
    const to = path.join(dest, entry.name);
    if (entry.isDirectory()) copyDir(from, to);
    else fs.copyFileSync(from, to);
  }
}

function formatBytes(n) {
  if (n < 1024) return `${n} B`;
  if (n < 1024 ** 2) return `${(n / 1024).toFixed(1)} KB`;
  return `${(n / 1024 ** 2).toFixed(1)} MB`;
}

function dirSize(dir) {
  let total = 0;
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const p = path.join(dir, entry.name);
    total += entry.isDirectory() ? dirSize(p) : fs.statSync(p).size;
  }
  return total;
}

rmrf(DIST);
fs.mkdirSync(STATIC_DEST, { recursive: true });

// Keep source <base href> (e.g. /dev/espazio-at-solaya/) for reverse-proxy deploys
const html = fs.readFileSync(path.join(ROOT, 'index.html'), 'utf8');
fs.writeFileSync(path.join(DIST, 'index.html'), html);

for (const name of KEEP_STATIC_FILES) {
  const src = path.join(STATIC_SRC, name);
  if (!fs.existsSync(src)) throw new Error(`Missing required asset: Static/${name}`);
  copyFile(src, path.join(STATIC_DEST, name));
}

const spacesSrc = path.join(STATIC_SRC, 'spaces');
if (!fs.existsSync(spacesSrc)) throw new Error('Missing Static/spaces — run npm run optimize-images first');
copyDir(spacesSrc, path.join(STATIC_DEST, 'spaces'));

const size = dirSize(DIST);
console.log(`Built ${DIST}`);
console.log(`Size: ${formatBytes(size)}`);
