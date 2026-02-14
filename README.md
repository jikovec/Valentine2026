# Valentine2026

Valentine website with:
- password gate (date-based)
- photo gallery with modal
- Tailwind CSS

## Tech
- HTML
- Tailwind CSS v4
- Vanilla JS (modules)

## Project folders
- `src/` → source files (edit these)
- `assets/photos/` → your photo files
- `docs/` → build output (generated)

## Install
```bash
npm install
```

## Run (development)

```bash
npm run dev
```

## Build

```bash
npm run build
```

## Preview built site

```bash
npm run preview
```

Open: `http://localhost:4173`

## Where to edit

* Relationship date: `src/js/config.js` → `RELATIONSHIP_DATE`
* Gallery items (alt/caption/paths): `src/js/config.js` → `GALLERY_ITEMS`
* Main HTML: `src/index.html`
* Styles: `src/input.css`
* Logic: `src/js/main.js`, `src/js/gallery.js`

## Important

* Edit only `src/` and `assets/`.
* Photo filenames in `assets/photos/` must match paths in `GALLERY_ITEMS`.