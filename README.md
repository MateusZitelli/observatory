# Observatory

Interactive technical simulator for a private roll-off-roof observatory in
Piedade, São Paulo.

## Features

- Equatorial mount and telescope visualization
- Configurable pier, mount, tube, room, roof, and observer geometry
- Telescope and room 3D views
- Dimensioned 2D plans and architectural sections
- Local sky map with an optional 360° panorama
- Browser-local state persistence

## Run locally

Install the pinned dependencies and start Vite:

```sh
npm ci
npm run dev -- --host 127.0.0.1 --port 5173
```

Open <http://127.0.0.1:5173/>.

Tailwind CSS and Three.js r128 are built from pinned local dependencies.
`pano360.jpg` must remain beside `index.html`.

## Development

Run all line-length, lint, and strict TypeScript checks with:

```sh
npm run check
```

## Deployment

`npm run build` creates the complete static site in `dist`. Pushes to `main`
publish that artifact to GitHub Pages through `.github/workflows/pages.yml`.
