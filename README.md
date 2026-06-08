# My App Store 📱

A personal "app store" for apps you build with Claude Code. Each app is a small
web app (PWA). You push to git, Vercel auto-deploys, and you install each app to
your iPhone home screen where it runs full-screen like a native app.

- **No Mac/Xcode/Apple Developer account needed.** Just a browser + git.
- **Updates are instant.** Push to git → Vercel redeploys → reopen the app.
- **Each app is its own home-screen icon.** The hub (`/`) is the store you browse.

---

## Live site

**https://emilmeggle.github.io/MyAppStore/** — hosted free on GitHub Pages.

Every `git push` to `main` auto-redeploys (takes ~1 min to go live).

> The repo is **public** (required for free GitHub Pages). Never put secrets or
> API keys in these apps. To go private later, switch hosting to Vercel — see
> [Going private later](#going-private-later-optional) at the bottom.

---

## On your iPhone: install an app

1. Open **https://emilmeggle.github.io/MyAppStore/** in **Safari** (must be Safari, not Chrome, for install).
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

- **Use relative paths** in apps, never a leading `/` (the site is served from a
  subpath on GitHub Pages). Apps live at `apps/<slug>/`, so use `../../icons/...`
  for icons and `../../` to link back to the store. The `new-app` script does this
  for you.
- **No service worker on purpose** — it would make pushed updates show up stale on
  iOS. Trade-off: apps need a network connection to load (data saved in
  `localStorage`, like Scratchpad, still persists offline once loaded).
- **Icons are PNG, opaque, square.** iOS rounds the corners itself; don't pre-round.
- Install must be done in **Safari** on iOS (Chrome on iOS can't Add to Home Screen).

---

## Going private later (optional)

If you'd rather the source not be public, switch hosting to Vercel:

1. In **https://vercel.com/new**, sign in **with GitHub** → import **`MyAppStore`** → **Deploy**.
2. Make the repo private again: `gh repo edit emilmeggle/MyAppStore --visibility private`.
3. Disable GitHub Pages: `gh api -X DELETE repos/emilmeggle/MyAppStore/pages`.

Your URL becomes `https://my-app-store-xxxx.vercel.app` (served at the root, so the
relative paths still work). Updates still deploy automatically on every `git push`.
