# Litewrite

Distraction-free notes app. Backbone + webpack, synced via remoteStorage
(also Dropbox/Google Drive). Static site, no server-side app logic.

## Test tiers

**Tier 1 - smoke** (fast, no backend): `npm run test:smoke`, or `npm test`
for lint + smoke. Playwright against `npm run dev` (webpack-dev-server on
:8000). Spec files: `tests/smoke/`, config: `playwright.config.js`.

**Tier 2 - acceptance** (real remoteStorage sync, containerised): `make
accept` or `npm run test:accept` - both just run `scripts/accept.sh`,
identically on a laptop and in CI (`.github/workflows/acceptance.yml`).
Brings up three containers via `docker-compose.acceptance.yml`: `app`
(built litewrite, served by `docker/app.Dockerfile`), `remotestorage` (a
real armadietto server, `docker/armadietto.conf.json`), `tests`
(`mcr.microsoft.com/playwright` image, browsers pre-installed - never run
`playwright install`). Spec files: `tests/acceptance/`, config:
`playwright.acceptance.config.js`. Image tags are pinned by digest; bump
deliberately, not silently.

## Where things live

- `src/` - app code (`litewrite.js` wires everything up in `main.js`)
- `lib/` - vendored/patched third-party code, aliased in webpack config
- `scripts/webpack.config.js`, `scripts/server.js` - build and prod server
- `style/`, `img/` - static assets copied straight into the deploy

## Deploy

`.github/workflows/deploy.yml` builds and publishes to the `gh-pages`
branch on every push to `main`, serving http://litewrite.net. Static
files only (`index.html`, `litewrite.min.js`, `service-worker.js`,
`style/`, `img/`) - no Docker involved in the real deploy.

## Conventions

- `standard` style: no semicolons, single quotes, no unused vars (`npm run lint` / `npm run format`)
- CommonJS (`require`/`module.exports`) throughout, not ESM
