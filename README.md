# My App Store 📱

A personal "app store" for apps you build with Claude Code. Each app is a small
web app (PWA). You push to git, Vercel auto-deploys, and you install each app to
your iPhone home screen where it runs full-screen like a native app.

- **No Mac/Xcode/Apple Developer account needed.** Just a browser + git.
- **Updates are instant.** Push to git → Vercel redeploys → reopen the app.
- **Each app is its own home-screen icon.** The hub (`/`) is the store you browse.

---

## One-time setup: connect to Vercel (≈2 min, you do this once)

The GitHub repo is already created and pushed (see below). To get a public URL:

1. Go to **https://vercel.com/new**
2. Sign in **with GitHub** (top button) and authorize Vercel if asked.
3. Under **Import Git Repository**, find **`MyAppStore`** → click **Import**.
4. Leave everything default (Framework Preset: **Other**, no build command) → **Deploy**.
5. After ~20s you get a URL like `https://my-app-store-xxxx.vercel.app`.

That URL is your app store. Every future `git push` redeploys it automatically.

> Optional: in the Vercel project → **Settings → Domains** you can add a custom
> domain or rename the project for a tidier URL.

---

## On your iPhone: install an app

1. Open your Vercel URL in **Safari** (must be Safari, not Chrome, for install).
2. Tap an app to open it.
3. Tap the **Share** button → **Add to Home Screen** → **Add**.
4. That app now has its own icon and opens full-screen.

Do the same on the store page itself (`/`) to keep the whole store one tap away.

### Test the update loop
Open the **Welcome** app — it shows a big **`v1`**. On your Mac, change `v1` to
`v2` in [`apps/welcome/index.html`](apps/welcome/index.html), then:

```bash
git add -A && git commit -m "bump welcome" && git push
```

Wait ~20s, reopen Welcome on your phone → it shows **`v2`**. That's the whole loop.

---

## Add a new app

```bash
npm run new-app -- "Tip Calculator" --emoji "💸" --desc "Split the bill fast"
```

This scaffolds `apps/tip-calculator/`, generates its icons, and registers it in
`apps.json` so it shows up in the store. Then:

1. Build the actual app in `apps/tip-calculator/index.html` (it starts as a blank
   shell — this is where Claude Code does the work).
2. `git add -A && git commit -m "add tip calculator" && git push`

Options: `--emoji "🎯"`, `--desc "..."`, `--colors "#7C3AED,#2563EB"`.

---

## Preview locally (optional)

```bash
npm run dev          # serves at http://localhost:4000
```

Open it in your desktop browser. (Phones can't reach localhost unless on the same
wifi via your machine's LAN IP — for real on-device testing, just push & deploy.)

---

## How it's laid out

```
index.html              the store (hub) — lists apps from apps.json
apps.json               the registry of apps (edit to reorder / change text)
manifest.webmanifest    makes the hub itself installable
apps/<slug>/            one folder per app
  index.html              the app
  manifest.webmanifest    makes that app installable as its own icon
icons/<slug>-{180,192,512}.png   generated home-screen icons
scripts/new-app.mjs     scaffolds a new app
scripts/gen-icon.mjs    generates icons (ImageMagick)
scripts/serve.mjs       local preview server
vercel.json             cache headers (keeps updates instant)
```

## Notes / gotchas

- **Use root-absolute paths** in apps (`/icons/...`, `/apps/<slug>/...`). Apps live
  in subfolders, so relative paths break.
- **No service worker on purpose** — it would make pushed updates show up stale on
  iOS. Trade-off: apps need a network connection to load (data saved in
  `localStorage`, like Scratchpad, still persists offline once loaded).
- **Icons are PNG, opaque, square.** iOS rounds the corners itself; don't pre-round.
- Install must be done in **Safari** on iOS (Chrome on iOS can't Add to Home Screen).
