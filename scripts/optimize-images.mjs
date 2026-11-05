import fs from 'fs';
import path from 'path';
import sharp from 'sharp';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, '..');
const SOURCE = path.resolve('C:/Users/marcf/Desktop/Solaya Selected Images/new images');
const OUT = path.join(ROOT, 'Static', 'spaces');

const SIZES = {
  hero: 1600,
  gallery: 900,
};

/** Explicit source → slug mapping for stable filenames */
const MANIFEST = [
  // Solaya Gate — Copy of 1.jpg is the sweeping-arch arrival shot
  { folder: 'Solaya Gate', file: 'Copy of 1.jpg', slug: 'gate-01' },
  { folder: 'Solaya Gate', file: 'Copy of 1(1).jpg', slug: 'gate-02' },
  { folder: 'Solaya Gate', file: 'Copy of 2.jpg', slug: 'gate-03' },
  { folder: 'Solaya Gate', file: 'Copy of 2(1).jpg', slug: 'gate-04' },
  { folder: 'Solaya Gate', file: 'Copy of 3.jpg', slug: 'gate-05' },
  { folder: 'Solaya Gate', file: 'Copy of 3 (1).jpg', slug: 'gate-06' },
  { folder: 'Solaya Gate', file: 'Copy of 4.jpg', slug: 'gate-07' },
  // Function Hall
  { folder: 'Function Hall', file: 'Copy of 1.jpg', slug: 'hall-01' },
  { folder: 'Function Hall', file: 'Copy of 2.jpg', slug: 'hall-02' },
  { folder: 'Function Hall', file: 'Copy of 3.jpg', slug: 'hall-03' },
  { folder: 'Function Hall', file: 'Copy of 4.jpg', slug: 'hall-04' },
  { folder: 'Function Hall', file: 'Copy of 5.jpg', slug: 'hall-05' },
  { folder: 'Function Hall', file: 'Copy of 6.jpg', slug: 'hall-06' },
  { folder: 'Function Hall', file: 'Copy of 7.jpg', slug: 'hall-07' },
  // Couple Villa
  { folder: 'Couple Villa', file: 'Copy of 1.jpg', slug: 'couple-01' },
  { folder: 'Couple Villa', file: 'Copy of 2.jpg', slug: 'couple-02' },
  { folder: 'Couple Villa', file: 'Copy of 3.jpg', slug: 'couple-03' },
  { folder: 'Couple Villa', file: 'Copy of 4.jpg', slug: 'couple-04' },
  // Dorm Villa
  { folder: 'Dorm Villa', file: 'Copy of 1.jpg', slug: 'dorm-01' },
  { folder: 'Dorm Villa', file: 'Copy of 2.jpg', slug: 'dorm-02' },
  { folder: 'Dorm Villa', file: 'Copy of 3.jpg', slug: 'dorm-03' },
  { folder: 'Dorm Villa', file: 'Copy of 4.jpg', slug: 'dorm-04' },
  // Admin
  { folder: 'Admin', file: 'Copy of 1.jpg', slug: 'admin-01' },
  { folder: 'Admin', file: 'Copy of 2.jpg', slug: 'admin-02' },
  { folder: 'Admin', file: 'Copy of 3.jpg', slug: 'admin-03' },
];

async function emit(input, slug, width, suffix) {
  const base = path.join(OUT, `${slug}${suffix ? `-${suffix}` : ''}-${width}`);
  const pipeline = sharp(input).rotate().resize({
    width,
    withoutEnlargement: true,
    fit: 'inside',
  });

  await Promise.all([
    pipeline.clone().webp({ quality: 78 }).toFile(`${base}.webp`),
    pipeline.clone().jpeg({ quality: 82, mozjpeg: true }).toFile(`${base}.jpg`),
  ]);
}

async function main() {
  fs.mkdirSync(OUT, { recursive: true });

  for (const item of MANIFEST) {
    const input = path.join(SOURCE, item.folder, item.file);
    if (!fs.existsSync(input)) {
      throw new Error(`Missing source: ${input}`);
    }
    console.log(`Optimizing ${item.slug}...`);
    await emit(input, item.slug, SIZES.hero, 'hero');
    await emit(input, item.slug, SIZES.gallery, 'gallery');
  }

  console.log(`Done. Wrote assets to ${OUT}`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
