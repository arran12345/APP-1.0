# Pulse — minimalist fitness tracker

A clean, mobile-first fitness app for average gym-goers. Track weekly gym
attendance, log workouts, monitor body metrics, and log calories &
protein — without the bloat of mainstream fitness apps.

Built as a **Next.js Progressive Web App** so a single codebase runs on
**iPhone, Android, and web** (installable to the home screen on all three).

---

## Stack

| Layer        | Choice                                            | Why                                                     |
| ------------ | ------------------------------------------------- | ------------------------------------------------------- |
| Framework    | Next.js 15 (App Router) + React 19 + TypeScript   | One codebase for web + iOS/Android via PWA install      |
| Styling      | Tailwind CSS 3                                    | Constraint-based design, fast iteration, zero runtime   |
| State        | Zustand + `persist` middleware → `localStorage`   | Tiny, ergonomic, offline-first, no backend required     |
| Charts       | Recharts                                          | Accessible, declarative, themeable                      |
| Dates        | date-fns                                          | Tree-shakeable, immutable, TZ-safe day math             |
| Icons        | lucide-react                                      | Stroke-based icons that match the engineering aesthetic |

---

## Getting started

```bash
npm install
npm run dev      # http://localhost:3000
npm run build && npm start
npm run typecheck
```

### Optional: AI meal estimation

The food log has an **AI estimate** field that turns a plain-text meal
description into kcal + protein and auto-fills the form. It calls Claude
server-side via `/api/estimate-food` using structured outputs (so the
response is always valid JSON).

Without an API key the route returns 503 and the rest of the app works
unchanged — manual entry is unaffected.

To enable AI estimation:

1. Get an API key from <https://console.anthropic.com>
2. Add it to your deployment:
   - **Vercel:** Project → Settings → Environment Variables → add
     `ANTHROPIC_API_KEY = sk-ant-...` for Production and Preview, then
     redeploy.
   - **Local dev:** create `.env.local` with
     `ANTHROPIC_API_KEY=sk-ant-...` and restart `npm run dev`.

The route defaults to `claude-opus-4-7`. For a faster / cheaper run on
this simple extraction task, swap `model` to `claude-haiku-4-5` in
`app/api/estimate-food/route.ts`.

To install as an app:

- **iPhone / Safari** → Share → "Add to Home Screen"
- **Android / Chrome** → "Install app" prompt or menu → "Install app"
- **Desktop** → Address bar install icon

---

## Architecture

```
app/                      Next.js App Router pages
  page.tsx                Dashboard
  workouts/               List + detail
  nutrition/              Food log
  progress/               Body metrics + charts
  layout.tsx              Root layout: <html>, <body>, BottomNav, manifest
  globals.css             Tailwind base + container utility
components/
  ui/                     Headless primitives (Card, Button, Input, Modal, …)
  dashboard/              Dashboard composition
  workouts/               Workout list, detail, ExerciseBlock
  nutrition/              NutritionScreen
  progress/               ProgressScreen + MetricChart
  Hydrated.tsx            Client-only gate to avoid SSR/CSR mismatch
lib/
  types.ts                Domain types
  store.ts                Single Zustand store + selectors
  date.ts                 DateKey helpers (week math, formatters)
  utils.ts                cn(), uid()
public/
  manifest.webmanifest    PWA manifest
  icon.svg                App icon
```

### Key design decisions

**One store, fine-grained selectors.** All state lives in one Zustand store
persisted under `pulse:v1`. Components subscribe to narrow slices to keep
re-renders minimal. Derived data (weekly progress, streaks, exercise
history) lives in pure selector functions in `lib/store.ts` rather than in
state — single source of truth, no caches to invalidate.

**`DateKey` instead of `Date`.** Day-bucketed data (workouts, food, body
metrics) uses ISO `YYYY-MM-DD` strings, sidestepping timezone bugs around
day boundaries. Full ISO timestamps are reserved for ordered events
(`workout.startedAt`, `workout.endedAt`).

**Offline-first by default.** No network. localStorage is the source of
truth; PWA install gives users an app-like experience without sync
complexity. Easy to bolt on a sync layer later (the store actions are pure
JSON transitions).

**Mobile-first, capped width.** Layout is a centered 28rem column
(`.app-container`). On desktop the app feels like a native phone window;
on mobile it fills the viewport. A sticky `BottomNav` with safe-area
insets is the primary navigation.

**Engineering-inspired dark theme.** Near-black surfaces with a single
lime accent (`#A3E635`). Tabular numerals, uppercase eyebrows, dashed
grids — readable, calm, never flashy. Animations are deliberately subtle
(`fade-in`, `pop`) so the UI feels responsive but not distracting.

**Fast set entry.** New sets carry forward the previous set's weight &
reps (see `addSet` in `lib/store.ts`). The +/- stepper on every numeric
field means common adjustments are one tap; the keypad still works for
power users.

---

## Features

### Dashboard (`/`)

- Weekly gym tracker with M T W T F S S checkboxes, % complete, editable goal
- Streak counter (tolerates a single rest day so a normal 3–5/week
  lifter's streak doesn't reset on Wednesdays)
- Today's calorie & protein vs. target
- Latest weight + recent workouts
- One-tap **Start workout**

### Workouts (`/workouts`)

- Chronological history grouped by month
- Custom workout titles (free text + quick picks: Push / Pull / Legs / …)
- Per workout: rename, finish, delete
- Per exercise: add/remove, rename, drag-free set list with done/undone toggle
- **Progressive-overload hint:** each exercise card shows the top set
  from your last session of that exercise

### Nutrition (`/nutrition`)

- Today's calories & protein with target bars
- One-tap log entry (name, kcal, protein) — no database, no scanning,
  no decisions
- Editable daily targets

### Progress (`/progress`)

- Bodyweight + body-fat % logging
- 30 / 60 / 180 day trend chart (Recharts area)
- Delta vs. range start
- Full history with deletion

---

## Code quality

- TypeScript strict mode
- No `any` in app code
- Pure-function selectors with no hidden state
- Components stay small (UI primitives ≤ 100 LOC each)
- Accessibility: semantic landmarks, `aria-label` on icon-only buttons,
  focus rings via `focus-visible`, keyboard support in modals (Esc to close)
