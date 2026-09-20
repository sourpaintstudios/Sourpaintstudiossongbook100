# Sour Paint Studios Songbook — project rules

Follow these on every turn. They override the habit of rescaffolding.

## Do not rewrite working UI

- `public/songbook.html` is the product. Edit it in place. Never replace the file from a template. Never regenerate the player, library, editor, or import UI unless the user asked for that specific change.
- Do not recreate `src/router.tsx`, `src/routes/__root.tsx`, `vite.config.ts`, or `startup.sh` unless they are actually broken.
- Incremental diffs only. If a feature already exists (Import lyrics, PDF OCR, image OCR, localStorage key `spss_songbook_v1`), fix that path. Do not build a second copy.

## Persistence (required)

- Songs must survive rebuilds and reloads.
- Source of truth: `migrations/0002_songs.sql` table `songbook_blob` plus `public/songbook-persist.js`.
- Keep `localStorage` key `spss_songbook_v1` as the offline cache.
- After any save or successful import, write both localStorage and `POST /api/songs`.
- On boot, `GET /api/songs` and merge if the server payload has songs.
- Do not turn auth on unless the user asks for accounts.
- Database stays ON (`deploy.database: true`). Do not flip it off.

## Import

- Import already lives in `songbook.html` (`import-file-input`, PDF.js + Tesseract).
- After extracted text is accepted, it must land in the editor fields and then persist through the save path above.
- Support PDFs, images, and plain text. Do not strip the existing OCR flow.
