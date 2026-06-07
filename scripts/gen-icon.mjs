// Generate opaque PNG home-screen icons with ImageMagick.
// iOS requires PNG (not SVG) for apple-touch-icon and composites any
// transparency onto black, so we render a full-bleed opaque gradient + a
// bold monogram. iOS rounds the corners itself, so we keep a square canvas.
//
// Usage (CLI):  node scripts/gen-icon.mjs <slug> <label> [color1] [color2]
// Usage (lib):  import { genIcon } from './gen-icon.mjs'

import { execFileSync } from 'node:child_process';
import { mkdirSync, rmSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const HERE = dirname(fileURLToPath(import.meta.url));
const ICONS_DIR = join(HERE, '..', 'icons');
const FONT = '/System/Library/Fonts/Supplemental/Arial Bold.ttf';
const SIZES = [180, 192, 512];

export function genIcon({ slug, label, color1 = '#7C3AED', color2 = '#2563EB', dir = ICONS_DIR }) {
  mkdirSync(dir, { recursive: true });
  const text = String(label || slug || '?').trim();
  // Use first 1-2 characters as a monogram (handles emoji poorly, so we use letters).
  const mono = [...text].filter((c) => /[\p{L}\p{N}]/u.test(c)).slice(0, 2).join('').toUpperCase() || '?';
  const pointsize = mono.length > 1 ? 380 : 560;
  const master = join(dir, `.${slug}-master.png`);

  execFileSync('magick', [
    '-size', '1024x1024',
    `gradient:${color1}-${color2}`,
    '-gravity', 'center',
    '-font', FONT,
    '-fill', 'white',
    '-pointsize', String(pointsize),
    '-annotate', '0', mono,
    '-alpha', 'remove', '-alpha', 'off', // bake to opaque (iOS composites alpha onto black)
    master,
  ]);

  for (const size of SIZES) {
    execFileSync('magick', [
      master,
      '-resize', `${size}x${size}`,
      '-alpha', 'remove', '-alpha', 'off',
      join(dir, `${slug}-${size}.png`),
    ]);
  }
  rmSync(master, { force: true });
  return SIZES.map((s) => `icons/${slug}-${s}.png`);
}

// CLI entry
if (import.meta.url === `file://${process.argv[1]}`) {
  const [slug, label, color1, color2] = process.argv.slice(2);
  if (!slug) {
    console.error('usage: node scripts/gen-icon.mjs <slug> <label> [color1] [color2]');
    process.exit(1);
  }
  const out = genIcon({ slug, label: label || slug, color1, color2 });
  console.log('wrote:\n  ' + out.join('\n  '));
}
