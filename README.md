# timBuilds website

**The only authoring and publishing repository is `tim-builds/timbuilds.dev`.** Both `https://timbuilds.dev` and `https://tim-builds.dev` route to Cloudflare Worker `timbuilds-web`. Workers Builds publishes the checked public export from this repository's `main`; it is the only deploy path. The former Pages project `timbuilds-site`, the GitHub Pages sites and the old `tim-builds/site` repository were retired on 2026-09-25 (see `HOSTING.md`).

The portfolio is plain HTML, CSS and JavaScript: eleven selectable Windows/Mac/Linux-inspired desktops, a maximized list-first My Projects window, fitted wallpapers, and browser-based games/accessories. XP remains the default. Hosting the desktop needs no application database, framework installation, analytics service or Pages Function. The separate OpenHoops backend is not part of this repository consolidation.

## Routine changes

1. Work in a branch of this repository. A fresh checkout is `git clone https://github.com/tim-builds/timbuilds.dev.git`.
2. Edit `portfolio/projects.json`, `portfolio/template.html` and the relevant `portfolio/` scripts/styles. Keep source labels, accessible descriptions and artwork provenance accurate.
3. Regenerate with `node tools/build-portfolio.mjs` and, when project websites change, `node tools/build-project-sites.mjs`.
4. Run the checks below and `npm ci && npm run build:worker`; review the diff and merge the approved PR into this repository's `main`.
5. Workers Builds runs the same checked export and deploys only `dist/` to `timbuilds-web` using `wrangler.jsonc`. Verify the build's source commit and both live addresses. No second-repository sync or routine DNS change is needed.

```sh
node tools/build-portfolio.mjs --check
node tools/build-project-sites.mjs --check
node tools/verify-portfolio.mjs
node tools/verify-media.mjs
node tools/build-cloudflare.mjs
node tools/test-cloudflare-headers.mjs
node tools/browser-check.mjs --migration
npx wrangler deploy --dry-run
```

The browser suite uses an isolated disposable Chrome profile; results belong in ignored `.qa/`. Real-account password resets and physical-device tests require their own authority and are not implied by these automated checks. See `HOSTING.md` for deployment, preview restrictions, response headers, live checks and rollback.

## Boundaries

Preserve `/openhoops/` policy/recovery/friend/court routes, `.well-known/assetlinks.json`, and historical stubs. Do not change the native OpenHoops repository, signing keys, Supabase settings, mail records, domain registration, or browser storage merely to publish a website edit. Both main addresses must remain usable; do not redirect one main address to the other.

The authenticated Candystand runtime is separate and is not deployed by the public export. Do not merge its private runtime branch into `main`, upload its game binaries/configuration, or expose its credentials. The encrypted owner catalogue is distinct from those private games: its key/recovery file stays outside Git. Never publish operator/entity research or private QA.

## Map of the source

`portfolio/projects.json` is the public catalogue; `tools/build-portfolio.mjs` generates root `index.html`. `portfolio/` holds the desktop and accessory code, media, themes and notices. `projects/` contains standalone project information websites, and `openhoops/` contains the existing app website and compatibility routes. `.well-known/` supports Android App Links. `tools/build-cloudflare.mjs` is the allowlist-based hosting exporter; `wrangler.jsonc` publishes its `dist/` output as Workers Static Assets.

Public browser preferences and Notepad contents remain browser-local. Paint stays in memory unless exported. The owner catalogue uses the existing encryption/key mechanism; this workflow does not grant access to it. Detailed implementation history and original limitations are preserved under `docs/history/`, not silently deleted.

## Migration record

`REPOSITORY-CONSOLIDATION.md` records the repository reconciliation and remaining acceptance items. Issue #20 remains the migration evidence index. The old `tim-builds/site` repository was deleted on 2026-09-25; a full private Git bundle and this repository's `archive/site/*` branches are the remaining historical material, not a second place to make current changes. Old interim authoring instructions, including references from the native app's historical migration runbook, are superseded **for website publishing only** by this README. They do not authorize native-app or account changes.

Keep third-party notices and image-source limitations in `portfolio/THIRD-PARTY-NOTICES.md`. Website hosting changes neither artwork rights nor the security boundary of browser-held owner keys.
