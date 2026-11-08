# Wedding Invite Site 💛

A beautiful, mobile-first wedding invitation website (South Indian temple
theme) with per-event RSVP tracking and an admin analytics dashboard.

**Stack (all free):** static site → GitHub Pages · backend → Supabase (Postgres) ·
total cost: **$0**

## Files

| File | What it is |
|---|---|
| `index.html` | The public invite: cover, hero, countdown, couple, story, events journey with footprint trail, compact RSVP form, Rama–Sita footer |
| `admin.html` | Family-only dashboard: per-event RSVP stats + responses table |
| `js/content.js` | **EDIT THIS** — all names, dates, venues, story. Nothing else needs changing for content |
| `js/config.js` | Supabase project URL + anon key (fill in after creating the project) |
| `js/app.js`, `js/admin.js` | Site logic (no need to touch) |
| `css/style.css` | Temple theme (cream / lattice gold / maroon / dark green) |
| `assets/` | Background photos (marigold cover, tuberose band), Rama–Sita footer art, background music MP3 |
| `supabase/schema.sql` | Database tables + security policies — run once in Supabase SQL Editor |

## Setup (one time)

1. **Supabase project** — create a free project at supabase.com.
2. **Database** — open SQL Editor → New query → paste `supabase/schema.sql` → Run.
   Creates the `rsvps` table (per-event attendance: pelli, mehendi, haldi,
   wedding) with Row Level Security: anyone can *submit* an RSVP;
   only the admin login can *read* them.
3. **Admin user** — Authentication → Add user → create an email + password
   (this is the login for `admin.html`).
4. **Wire the site** — Project Settings → Data API → copy the Project URL and
   the `anon public` key into `js/config.js`.
5. **Deploy** — the site lives in the GitHub fork `Chaitu568/VijayNavyaWedding`
   with GitHub Pages enabled (main branch, root). Pushing to `main` redeploys:
   https://chaitu568.github.io/VijayNavyaWedding/

## Local preview

```bash
cd wedding-invite && python3 -m http.server 8000
# open http://localhost:8000  (admin at http://localhost:8000/admin.html)
```

## Media (photos, music, video)

All in `js/content.js` — no code changes needed:

- **Couple portraits** — set `couplePhotos.groom` / `couplePhotos.bride`
  to image paths (e.g. drop files in a `photos/` folder next to `index.html`).
  Empty shows an elegant monogram placeholder.
- **Background music** — ships as `assets/music.mp3` (a veena instrumental
  placeholder). To change the song, replace that one file, same name.
  A floating sound-toggle button appears automatically; empty `musicUrl` hides it.
  Music starts when the guest taps "Open Invitation".
- **YouTube video** — paste the full watch URL into `youtubeUrl` when ready.
  The video section stays completely hidden until then (no placeholder).

## Notes

- RSVP analytics also available as a SQL view: `v_event_headcount`
  (guest totals per celebration).
- Free-tier caveat: Supabase pauses the project after 7 days of inactivity;
  first visit after a pause takes a few seconds to wake. A free cron ping
  (e.g. cron-job.org hitting the site daily) prevents it.
- Keep `admin.html` unlinked from the public nav — share the URL only with family.
