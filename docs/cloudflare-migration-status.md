# Single-repository migration — staged, not cut over

Owner approved the migration on 2026-09-18. Destination: `tim-builds/timbuilds.dev`, with both the portfolio and `/openhoops/` in this repository, serving both `timbuilds.dev` and `tim-builds.dev`. No domain, DNS, mail, CNAME, Supabase, production deployment, developer remote or repository-retirement setting has changed in this preparation.

## Completed preparation

- Built an explicit public-file export with `node tools/build-cloudflare.mjs`. `dist` includes 181 source files (15,543,084 bytes) plus a generated real 404 page and conservative HTTP headers; Git history, tools, private QA and CNAME are excluded. The original game data used for compatibility research never enters the export.
- Wrangler 4.135.0 local Pages runtime serves all 180 checked public files byte-identically. The `.nojekyll` publishing marker is not a runtime file. Confirmed WASM MIME, same-origin redirects, actual 404s, reset-page no-store and no Clear-Site-Data.
- All 139 existing browser-check groups passed against that local Pages runtime. This is **not** a hosted Cloudflare preview or live-domain cutover.
- Browser checks proved reset-token and friend-username fragments survive Pages' `.html` to extensionless redirects. Reset used a deliberately mocked Supabase client and dummy tokens; no actual password was submitted or account modified. Friend links retain the expected app-scheme URL.
- Baseline read: all eight checked OpenHoops/asset-link routes return HTTP 200 on each current live domain, with matching content hashes across hosts. Public DNS A/AAAA/MX/TXT snapshots and the detailed HTTP baseline are private QA evidence.

## Current blocker

Wrangler is not authenticated to the owner's Cloudflare account. The scoped, five-minute OAuth device request expired without completion. No Cloudflare project or hosted preview was created. A fresh interactive authorization is needed; credentials must stay in the OS credential store, not Git, docs or chat. Pages access alone must not be assumed to grant DNS write access. Git-integrated setup may also require approval of Cloudflare's GitHub application for this one repository.

## Repeatable local verification

`node tools/build-cloudflare.mjs`

`npx --yes wrangler@4.135.0 pages dev dist --ip 127.0.0.1 --port 8798`

`node tools/verify-cloudflare.mjs http://127.0.0.1:8798`

Set `PORTFOLIO_ORIGIN=http://127.0.0.1:8798`, then run `node tools/browser-check.mjs --migration`. The extra migration check intercepts authentication requests and never submits real credentials.

## Remaining execution sequence

1. Authorize Cloudflare. Create a **Git-integrated** Pages project for `tim-builds/timbuilds.dev` so future commits publish without a second repository. Do not accidentally create a Direct Upload project and assume it can later be converted to Git integration. Candidate name: `timbuilds-site`; confirm availability first. Production branch: `main`. Build command: `node tools/build-portfolio.mjs --check && node tools/verify-portfolio.mjs && node tools/build-cloudflare.mjs`. Output: `dist`. Node version: 24.18.0.
2. Build this branch as a hosted preview and rerun the HTTP and browser checks against its actual HTTPS URL. Review account-side zone/TLS/DNS records before making changes; the public DNS snapshot is not a substitute for Cloudflare record IDs/configuration.
3. Add custom-domain bindings before changing the corresponding web records. Migrate one existing hostname at a time, preserving both apex and existing www behavior, query strings and fragments. Keep content served at both origins rather than redirecting recovery sessions between them. Preserve every mail-related record and routing rule, registration/renewal setting, and the Supabase allowlist.
4. Verify HTTPS, all protected routes, direct policy text, app links and stored desktop state on each hostname. Complete an owner-authorized real-account recovery and real-device/old-install link test before claiming those checks. Retain GitHub Pages and the existing source history for rollback until both domains are verified.
5. Only then change the documented authoring source and coordinated OpenHoops documentation pointers to the canonical repository. Retire/archive the duplicate after checking remaining issues/PRs and preserving history; do not delete it or silently discard its records. Stop the mirror procedure only after the new single-source deployment is operating.

References: https://developers.cloudflare.com/pages/get-started/git-integration/ ; https://developers.cloudflare.com/pages/get-started/direct-upload/ ; https://developers.cloudflare.com/pages/configuration/custom-domains/ ; https://developers.cloudflare.com/pages/configuration/serving-pages/

The existing `REPOSITORY-CONSOLIDATION.md` and OpenHoops migration runbook remain the governing safety gates. This staging change does not declare them completed.
