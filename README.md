# Wedding Invite Site 💛

A beautiful, mobile-first wedding invitation website with RSVP tracking,
a moderated wishes wall, and an admin analytics dashboard.

**Stack (all free):** static site → Cloudflare Pages · backend → Supabase (Postgres) ·
page analytics → Cloudflare Web Analytics · total cost: **$0**

## Files

| File | What it is |
|---|---|
| `index.html` | The public invite: hero, countdown, families, story, events, RSVP form, wishes wall |
| `admin.html` | Family-only dashboard: RSVP stats, responses table, wish moderation |
| `js/content.js` | **EDIT THIS** — all names, dates, venues, story. Nothing else needs changing for content |
| `js/config.js` | Supabase project URL + anon key (fill in after creating the project) |
| `js/app.js`, `js/admin.js` | Site logic (no need to touch) |
| `css/style.css` | Theme (ivory / maroon / gold) |
| `supabase/schema.sql` | Database tables + security policies — run once in Supabase SQL Editor |

## Setup (one time)

1. **Supabase project** — create a free project at supabase.com.
2. **Database** — open SQL Editor → New query → paste `supabase/schema.sql` → Run.
   Creates `rsvps` and `wishes` tables with Row Level Security:
   - anyone can *submit* RSVPs/wishes; only the admin login can *read* RSVPs;
     wishes are publicly readable only after approval.
3. **Admin user** — Authentication → Add user → create an email + password
   (this is the login for `admin.html`).
4. **Wire the site** — Project Settings → Data API → copy the Project URL and
   the `anon public` key into `js/config.js`.
5. **Deploy** — push this folder to a GitHub repo, then in Cloudflare Pages:
   "Create project → Connect to Git", build command empty, output directory `/`.
   Free `your-site.pages.dev` link included; custom domain optional (~$10/yr).
6. **Analytics** — Cloudflare Dashboard → Web Analytics → add site → paste the
   one-line script into `index.html` `<head>`.

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
- **Background music** — set `musicUrl` to a direct MP3 URL
  (e.g. `"music.mp3"` for a file beside `index.html`).
  A floating sound-toggle button appears automatically; empty hides it.
  Music starts when the guest taps "Open Invitation".
- **YouTube video** — paste the full watch URL into `youtubeUrl` when ready.
  The video section stays completely hidden until then (no placeholder).

## Notes

- RSVP analytics also available as SQL views: `v_event_headcount`, `v_meal_split`.
- Free-tier caveat: Supabase pauses the project after 7 days of inactivity;
  first visit after a pause takes a few seconds to wake. A free cron ping
  (e.g. cron-job.org hitting the site daily) prevents it.
- Keep `admin.html` unlinked from the public nav — share the URL only with family.
