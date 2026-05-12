# Weston — Website

Static marketing site for **Weston**, a small upcycling business that reworks second-hand cabinets, bedside tables, and drawers by hand into modern farmhouse pieces.

Built with [Astro](https://astro.build) + vanilla CSS. No framework runtime, no CMS, no database.

---

## Run locally

```bash
npm install
npm run dev
```

Then open <http://localhost:4321>.

Useful scripts:

| Command           | What it does                              |
| ----------------- | ----------------------------------------- |
| `npm run dev`     | Start the dev server with hot reload      |
| `npm run build`   | Produce a production build in `./dist`    |
| `npm run preview` | Preview the production build locally      |

Node **18+** is required.

---

## Add or edit a piece

All pieces are defined in a single JSON file:

```
src/data/pieces.json
```

Each entry looks like this:

```json
{
  "id": "the-ashford",
  "name": "The Ashford",
  "category": "Sideboard",
  "colour": "Olive",
  "price": 850,
  "status": "available",
  "dimensions": "120 x 45 x 80 cm",
  "description": "Short paragraph used on the card and detail page.",
  "story": "Longer paragraph — the piece's backstory or process notes.",
  "images": ["/images/the-ashford.svg"],
  "featured": true
}
```

Field notes:

- `id` — URL slug. Lower-case, hyphen-separated. The detail page lives at `/pieces/<id>`.
- `category` — Sideboard, Bedside, Chest, Drawers, Cabinet.
- `colour` — Olive, Navy, Charcoal, Cream.
- `price` — number in GBP. No `£` symbol.
- `status` — `"available"`, `"sold"`, or `"reserved"`.
- `dimensions` — free-text, e.g. `120 x 45 x 80 cm` (W × D × H).
- `images` — array of paths from `/public`. Main image first.
- `featured` — currently informational; not used to filter the grid.

**To add a piece:**

1. Drop one or more image files into `public/images/` (any web format — `.webp`, `.jpg`, or `.svg`).
2. Add a new object to `pieces.json`.
3. Run `npm run dev` and check the homepage grid + the `/pieces/<id>` detail page.

**To remove or sell a piece:**

- To take it down entirely, delete its object from `pieces.json` (or comment it out).
- To mark sold, change `"status"` to `"sold"`.

---

## Swap placeholder images for real photos

The site ships with simple SVG placeholders so you can see the layout before you have photos. They live in `public/images/` (e.g. `the-ashford.svg`).

When you have real photos:

1. Optimise them. Aim for ~1600px wide, modern format (`.webp` ideal, `.jpg` fine).
2. Save them into `public/images/` with sensible filenames (e.g. `the-ashford-01.webp`).
3. Update the corresponding piece in `pieces.json`:

   ```json
   "images": [
     "/images/the-ashford-01.webp",
     "/images/the-ashford-02.webp",
     "/images/the-ashford-03.webp"
   ]
   ```

The **first image** in the array is the main/hero image used on cards and as the Open Graph image. The rest appear as thumbnails on the detail page.

You can leave the old SVGs in `public/images/` until you've replaced them; they aren't referenced once you update the JSON.

---

## Enquiry form (Formspree)

The contact form posts to a [Formspree](https://formspree.io) endpoint.

1. Sign up at Formspree and create a new form.
2. Copy your form action URL (looks like `https://formspree.io/f/abcdwxyz`).
3. Copy `.env.example` to `.env` and paste the URL:

   ```
   FORMSPREE_ENDPOINT=https://formspree.io/f/abcdwxyz
   ```

4. Restart the dev server.

If the env var is missing, the form still renders and validates but shows a small "not configured" hint. Replace Formspree with Resend, Web3Forms, or any service that accepts `multipart/form-data` POST requests — the client-side logic in `src/components/ContactForm.astro` is provider-agnostic.

### Pre-filling the form via URL

Two query params are supported:

- `?type=commission` — pre-selects the Commission option in the dropdown. Also works with `general`, `piece`, `trade`.
- `?piece=the-ashford` — pre-fills the message field with "I'm enquiring about The Ashford." and selects the Piece Enquiry option.

These are used by the "Commission a Piece" CTA in the hero and the "Enquire About This Piece" CTA on each detail page.

---

## Deploy to Vercel

1. Push this repo to GitHub.
2. Go to <https://vercel.com/new> and import the repo.
3. Vercel auto-detects Astro — the defaults are correct:
   - **Build command:** `npm run build`
   - **Output directory:** `dist`
4. Add the environment variable in the Vercel dashboard:
   - Key: `FORMSPREE_ENDPOINT`
   - Value: your Formspree URL
5. Deploy.

Once you have a real domain (e.g. `weston.co.uk`):

- Point DNS to Vercel.
- Update `site` in `astro.config.mjs` so the sitemap, canonical tags, and OG image URLs use the correct host.

---

## Tech notes for future you

- **Stack:** Astro 5, vanilla CSS, zero JS frameworks. The only JS in the bundle is the mobile-nav toggle and the contact form validation/submission script.
- **Styling:** Single global stylesheet at `src/styles/global.css` plus component-scoped `<style>` blocks. Brand tokens (colours, fonts, spacing) are CSS custom properties — edit them in one place.
- **Components:** All under `src/components/`. Each is a self-contained `.astro` file.
- **Routing:** File-based via `src/pages/`. The dynamic piece page is `src/pages/pieces/[slug].astro`.
- **SEO:** Per-page title/description/OG via the `Base` layout. Schema.org `Product` markup on piece pages (no offer/price block since we don't sell online).
- **Sitemap + robots:** `@astrojs/sitemap` integration auto-generates `sitemap-*.xml` at build. `public/robots.txt` references it.
- **Analytics:** Not wired up. A comment in `src/layouts/Base.astro` marks where to drop the Plausible or GA snippet.

---

## File map

```
weston/
├── src/
│   ├── pages/
│   │   ├── index.astro            # Homepage
│   │   └── pieces/[slug].astro    # Dynamic piece detail pages
│   ├── components/                # Nav, Hero, PieceGrid, Story, Commissions, ContactForm, Footer, ...
│   ├── data/pieces.json           # Piece catalogue — edit this
│   ├── layouts/Base.astro         # Page shell, meta tags, fonts
│   └── styles/global.css          # CSS variables + base styles
├── public/
│   ├── favicon.svg
│   ├── og-image.svg
│   ├── robots.txt
│   └── images/                    # Piece + hero + story images
├── astro.config.mjs
├── package.json
└── .env.example                   # FORMSPREE_ENDPOINT placeholder
```

---

## Out of scope

This site is deliberately small. No e-commerce, no accounts, no blog, no CMS, no analytics, no cookie banner. If those become needed later, Astro can host all of them — but for now, less is more.
