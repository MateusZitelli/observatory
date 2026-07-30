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

The deployed application is intentionally static and has no build step.

```sh
python3 -m http.server 5173
```

Open <http://127.0.0.1:5173/>.

The page loads Tailwind CSS and Three.js from public CDNs, so an internet
connection is required on first load. `pano360.jpg` must remain beside
`index.html`.

## Development

The deployable simulator lives on `main`. A strict modular TypeScript prototype
is preserved separately on `agent/typescript-oxc-refactor` while its runtime and
feature parity are completed.

## Deployment

Pushes to `main` publish the static files to GitHub Pages through
`.github/workflows/pages.yml`.
