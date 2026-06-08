# My App Store 📱

A personal "app store" for apps you build with Claude Code. The store is a hub
page (a PWA) that lists your apps; you push to git, GitHub Pages auto-deploys, and
you install each app to your iPhone home screen where it runs full-screen.

Apps come in two flavours:
- **Built-in** — scaffolded into this repo under `apps/<id>/` (good for small tools).
- **Linked** — an app hosted in its *own* repo/host; the store just links to it via
  a `url` in `apps.json`. Keeps each app's source private and self-contained.

- **No Mac/Xcode/Apple Developer account needed.** Just a browser + git.
- **Updates go live in ~1–10 min.** Push → Pages redeploys in ~1 min; browsers then
  cache for up to 10 min (hard-refresh to see changes immediately). See *Notes*.
- **Each app is its own home-screen icon.** The hub is the store you browse.

---

## Live site

**https://emilmeggle.github.io/MyAppStore/** — hosted free on GitHub Pages.

Every `git push` to `main` auto-redeploys (the live site updates in ~1 min; your
browser may show a cached copy for up to 10 min — see *Notes / gotchas*).

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

Wait ~1 min for Pages to rebuild, then **hard-refresh** Welcome on your phone (or
wait out the ~10-min browser cache) → it shows **`v2`**. That's the whole loop.

---

## Add a new app

**A) Built-in app** (scaffolded into this repo):

```bash
npm run new-app -- "Tip Calculator" --emoji "💸" --desc "Split the bill fast"
```

This scaffolds `apps/tip-calculator/`, generates its icon, and registers it in
`apps.json`. Then build the UI in `apps/tip-calculator/index.html` (it starts as a
blank shell) and `git add -A && git commit -m "add tip calculator" && git push`.

**B) Linked app** (lives in its own repo/host — see below):

```bash
npm run new-app -- "Gravity Sim" --emoji "🪐" --url "https://you.github.io/Gravity/"
```

This adds **only** an `apps.json` entry pointing at that URL — no local files. Then
`git add apps.json && git commit -m "link gravity" && git push`.

Options for both: `--emoji "🎯"`, `--desc "..."`, `--colors "#7C3AED,#2563EB"`, `--version "1.2"`.

---

## Connecting an existing project

You almost always want a **linked app** (option B above): your project keeps living
in its own repo (private if you like), deploys itself to its own URL, and the store
just points at it. One command registers it:

```bash
npm run new-app -- "My Project" --emoji "🎯" --url "https://my-project-url/"
```

Paste-in block for the other project's `CLAUDE.md` (so it knows how to register):

> This project is listed in my App Store (`~/MyAppStore`, live at
> https://emilmeggle.github.io/MyAppStore/). After deploying this project to its own
> URL, register/update it in the store with:
> `cd ~/MyAppStore && npm run new-app -- "<Name>" --emoji "<x>" --url "<deployed-url>" && git add apps.json && git commit -m "link <name>" && git push`
> (Re-running with the same name just updates the existing entry.)

**Alternative — host the app *inside* this repo** (only if you want it served from
the store's own domain). Build it to static files with **relative** asset paths
(Vite: `base: './'`; CRA: `"homepage": "."`; Next.js: static export — heavier),
`npm run new-app -- "Name" --emoji "🎯"`, copy your build into `apps/<id>/`
(keeping the shell's iOS `<head>` + `manifest.webmanifest`), then push.

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
apps.json               the registry (each app: id, name, emoji, version, updated,
                          + either "slug" for a built-in app or "url" for a linked one)
manifest.webmanifest    makes the hub itself installable
apps/<id>/              one folder per built-in app
  index.html              the app
  manifest.webmanifest    makes that app installable as its own icon
icons/<id>-{180,192,512}.png   generated home-screen icons
scripts/new-app.mjs     scaffolds a built-in app, or registers a --url linked app
scripts/gen-icon.mjs    generates icons (ImageMagick)
scripts/serve.mjs       local preview server
vercel.json             cache headers — only used if you switch to the Vercel route
                          (GitHub Pages ignores it; see Notes)
```

## Notes / gotchas

- **Use relative paths** in apps, never a leading `/` (the site is served from a
  subpath on GitHub Pages). Apps live at `apps/<slug>/`, so use `../../icons/...`
  for icons and `../../` to link back to the store. The `new-app` script does this
  for you.
- **Update timing on GitHub Pages.** Pages serves `Cache-Control: max-age=600`
  (10 min) on everything and **ignores `vercel.json`**. So after a push: the live
  site is fresh in ~1 min, but a browser that already loaded a page keeps a cached
  copy for up to 10 min. To see changes now: **hard-refresh** (desktop: Cmd/Ctrl+
  Shift+R; iOS: close the tab/app and reopen, or wait it out).
- **No service worker (yet).** That means no offline mode and no desktop "Install"
  button — and it's why the 10-min cache above applies. Adding a network-first
  service worker would make same-origin updates **instant** and enable desktop
  install; it can't help *linked* (cross-origin) apps. Ask if you want it.
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
