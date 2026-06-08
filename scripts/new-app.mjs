// Scaffold a new app into the store: creates apps/<slug>/, generates icons,
// and registers it in apps.json so the hub shows it.
//
// Usage:
//   node scripts/new-app.mjs "Tip Calculator" --emoji "💸" --desc "Split the bill"
//   node scripts/new-app.mjs "Habits" --emoji "✅" --colors "#10B981,#14B8A6"
//
// After scaffolding, build the real UI inside apps/<slug>/index.html (it ships
// as a blank shell), then: git add -A && git commit && git push  -> Vercel deploys.

import { readFileSync, writeFileSync, mkdirSync, existsSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { genIcon } from './gen-icon.mjs';

const HERE = dirname(fileURLToPath(import.meta.url));
const ROOT = join(HERE, '..');

// Curated gradient palette; pick deterministically from the slug if none given.
const PALETTE = [
  ['#7C3AED', '#2563EB'], ['#EC4899', '#F97316'], ['#14B8A6', '#22C55E'],
  ['#6366F1', '#06B6D4'], ['#F43F5E', '#8B5CF6'], ['#F59E0B', '#EF4444'],
  ['#0EA5E9', '#6366F1'], ['#10B981', '#14B8A6'], ['#8B5CF6', '#EC4899'],
];

function slugify(s) {
  return s.toLowerCase().trim()
    .replace(/['"]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

function parseArgs(argv) {
  const args = { _: [] };
  for (let i = 0; i < argv.length; i++) {
    const a = argv[i];
    if (a.startsWith('--')) { args[a.slice(2)] = argv[++i]; }
    else { args._.push(a); }
  }
  return args;
}

function pickColors(slug, override) {
  if (override) {
    const [c1, c2] = override.split(',').map((s) => s.trim());
    if (c1 && c2) return [c1, c2];
  }
  let h = 0;
  for (const ch of slug) h = (h * 31 + ch.charCodeAt(0)) >>> 0;
  return PALETTE[h % PALETTE.length];
}

const appTemplate = ({ name, slug, desc, emoji, c1, c2 }) => `<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover" />
  <title>${name}</title>
  <meta name="description" content="${desc}" />
  <link rel="manifest" href="manifest.webmanifest" />
  <meta name="theme-color" content="#0b0b0f" />
  <!-- iOS add-to-home-screen. Apps live at apps/<slug>/, so ../../ reaches the store root. -->
  <link rel="apple-touch-icon" href="../../icons/${slug}-180.png" />
  <link rel="icon" href="../../icons/${slug}-180.png" />
  <meta name="apple-mobile-web-app-capable" content="yes" />
  <meta name="mobile-web-app-capable" content="yes" />
  <meta name="apple-mobile-web-app-status-bar-style" content="black" />
  <meta name="apple-mobile-web-app-title" content="${name}" />
  <style>
    :root { --c1:${c1}; --c2:${c2}; }
    * { box-sizing: border-box; -webkit-tap-highlight-color: transparent; }
    html, body { margin: 0; height: 100%; }
    body {
      font: 16px/1.5 -apple-system, BlinkMacSystemFont, "Segoe UI", system-ui, sans-serif;
      color: #f4f4f5; background: #0b0b0f;
      padding: max(env(safe-area-inset-top), 16px) 20px max(env(safe-area-inset-bottom), 24px);
      display: flex; flex-direction: column; align-items: center; text-align: center; gap: 18px;
    }
    .badge {
      width: 84px; height: 84px; border-radius: 22px; margin-top: 8vh;
      display: grid; place-items: center; font-size: 42px;
      background: linear-gradient(145deg, var(--c1), var(--c2));
      box-shadow: 0 10px 30px -8px var(--c1);
    }
    h1 { margin: 0; font-size: 26px; letter-spacing: -0.02em; }
    p { margin: 0; color: #a1a1aa; max-width: 32ch; }
    .hint { margin-top: auto; font-size: 13px; color: #71717a; }
    a { color: #c4b5fd; }
  </style>
</head>
<body>
  <a href="../../" style="position:fixed;top:max(env(safe-area-inset-top),16px);left:18px;color:#c4b5fd;text-decoration:none;font-size:14px">‹ All apps</a>
  <div class="badge">${emoji}</div>
  <h1>${name}</h1>
  <p>${desc}</p>
  <p style="color:#52525b">This app is a blank shell — build it out in
     <code>apps/${slug}/index.html</code>, then push to deploy.</p>
  <p class="hint" id="installHint" hidden>Tap <b>Share</b> → <b>Add to Home Screen</b> to install ${name}.</p>
  <script>
    // Show the install hint only when running in the browser (not already installed).
    var standalone = window.navigator.standalone === true ||
      window.matchMedia('(display-mode: standalone)').matches;
    if (!standalone) document.getElementById('installHint').hidden = false;
  </script>
</body>
</html>
`;

const manifestTemplate = ({ name, slug, desc, c1 }) => JSON.stringify({
  name,
  short_name: name,
  description: desc,
  start_url: './',
  scope: './',
  display: 'standalone',
  orientation: 'portrait',
  background_color: '#0b0b0f',
  theme_color: '#0b0b0f',
  icons: [
    { src: `../../icons/${slug}-192.png`, sizes: '192x192', type: 'image/png', purpose: 'any' },
    { src: `../../icons/${slug}-512.png`, sizes: '512x512', type: 'image/png', purpose: 'any' },
  ],
}, null, 2) + '\n';

function main() {
  const args = parseArgs(process.argv.slice(2));
  const name = (args.name || args._.join(' ')).trim();
  if (!name) {
    console.error('usage: node scripts/new-app.mjs "App Name" [--emoji "🎯"] [--desc "..."] [--colors "#hex,#hex"]');
    process.exit(1);
  }
  const slug = slugify(name);
  const emoji = args.emoji || '🧩';
  const desc = args.desc || name;
  const [c1, c2] = pickColors(slug, args.colors);

  const appDir = join(ROOT, 'apps', slug);
  if (existsSync(appDir)) {
    console.error(`✗ apps/${slug} already exists. Pick a different name or delete it first.`);
    process.exit(1);
  }
  mkdirSync(appDir, { recursive: true });
  writeFileSync(join(appDir, 'index.html'), appTemplate({ name, slug, desc, emoji, c1, c2 }));
  writeFileSync(join(appDir, 'manifest.webmanifest'), manifestTemplate({ name, slug, desc, c1 }));
  genIcon({ slug, label: name, color1: c1, color2: c2 });

  // Register in apps.json (skip if already present).
  const appsPath = join(ROOT, 'apps.json');
  const store = JSON.parse(readFileSync(appsPath, 'utf8'));
  store.apps = store.apps || [];
  if (!store.apps.some((a) => a.slug === slug)) {
    store.apps.push({ slug, name, emoji, description: desc, color1: c1, color2: c2 });
    writeFileSync(appsPath, JSON.stringify(store, null, 2) + '\n');
  }

  console.log(`✓ Created app "${name}"  (slug: ${slug})`);
  console.log(`  • apps/${slug}/index.html      ← build your app here`);
  console.log(`  • apps/${slug}/manifest.webmanifest`);
  console.log(`  • icons/${slug}-{180,192,512}.png`);
  console.log(`  • registered in apps.json`);
  console.log(`\nNext:  open the file, build the UI, then:`);
  console.log(`  git add -A && git commit -m "add ${slug}" && git push`);
}

main();
