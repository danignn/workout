# Bloom 🌸

A personal training app built from a 4-day glute-focused plan. It runs in the browser and
installs to a phone home screen as a PWA — no app store, no account, no server.

**Live app:** https://danignn.github.io/workout/

## What it does

- **Today** — the day's session, a week strip, habit tracking (water, steps, sleep, protein)
  and a cycle-phase training note.
- **Plan** — the full week, the rest-timing rules, every form video, and the plan's notes.
- **Workout** — log reps and weight per set, tick each set off, and get the right rest
  countdown started automatically (3 min after a squat, 45 sec after kickbacks).
- **Progress** — weight-over-time charts per exercise, personal bests, weekly volume,
  body measurements and progress photos.
- **Meals** — 30 high-protein meal ideas with a daily log against a protein target.
- **Me** — settings, cycle tracking, install guide, and backup/restore.

Progression is automated from the plan's own rule: hit 15 reps on every set and the app
tells you to add 2.5kg and drop back down the rep range.

## Where the data lives

Everything is stored in the browser on the device, in `localStorage` (logs, meals,
measurements, settings) and IndexedDB (progress photos). Nothing is uploaded anywhere.
That means it works offline and stays private, but also that clearing browser data loses
the log — so **Me → Download a backup** writes a JSON file that restores onto a new phone.

## Installing on a phone

1. Open the link in **Safari** (iPhone) or **Chrome** (Android).
2. iPhone: Share → *Add to Home Screen*. Android: ⋮ menu → *Install app*.

It then opens full screen with no browser bars and works without a signal.

## Development

```bash
npm install
npm run dev      # local dev server
npm run build    # production build into dist/
npm run preview  # serve the production build
```

The app is deployed by `.github/workflows/deploy.yml` on every push. It builds with
`base: '/workout/'` for GitHub Pages project sites; set `VITE_BASE=/` to deploy at a
domain root instead.

### Stack

React 18 + TypeScript + Vite. No UI framework, no chart library, no backend — hand-written
CSS and SVG throughout, which keeps the bundle around 80KB gzipped and the whole thing
cacheable offline by `public/sw.js`.

## Credits

Training plan and form cues are the user's own. Video references are TikToks from
[@vera.armishaw](https://www.tiktok.com/@vera.armishaw), embedded and linked, not rehosted.
