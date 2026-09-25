# Hosting and publishing

## Current production

`tim-builds/timbuilds.dev` is the only website source. Cloudflare Worker **`timbuilds-web`** serves both `https://timbuilds.dev` and `https://tim-builds.dev` through their existing routes. Neither apex redirects to the other. Workers Builds from `main` is the only deploy path; the former Pages project `timbuilds-site` and the GitHub Pages sites are gone (see the 2026-09-25 note below). Routine publishing does not change DNS or email.

The Worker uses Static Assets. `tools/build-cloudflare.mjs` copies only approved public source into `dist/`, then generates `404.html`, `_headers`, and an `.assetsignore` rule excluding its local export marker. `wrangler.jsonc` is the single Worker configuration for `timbuilds-web`: it points only at `dist/`, declares the existing apex routes and workers.dev hostname, and serves real 404s. The old Pages configuration, the `wrangler.workers.jsonc` file name and the GitHub Pages `CNAME` file were retired on 2026-09-25, so a bare `wrangler deploy` now targets the correct Worker and uploads only `dist/`. Do not upload the repository root, private runtime, QA results, owner files, local configuration, or browser profiles.

## Publishing from Git

Workers Builds is connected to `tim-builds/timbuilds.dev`, production branch `main`, root `/`, with Node **24.18.0**. Its exact commands are:

```text
Build:  npm ci && npm run build:worker
Deploy: npx wrangler deploy
```

`package-lock.json` pins Wrangler. `build:worker` checks generated source, project sites, portfolio and media, then creates and checks the allowlisted export. No `--config` flag is needed: since 2026-09-25 the default `wrangler.jsonc` is the Worker configuration for `timbuilds-web` (the old Pages configuration and the `wrangler.workers.jsonc` name were retired). Workers previews are disabled, so a feature branch does not publish a preview of this production Worker, and no Pages project remains to build previews. Change the preview rule only with owner approval.

For routine changes, branch from current canonical `main`, edit source and generators, regenerate outputs, run the README checks, and review the complete diff in one PR. After required checks and independent review pass, merge to `main`. Workers Builds runs the commands above and deploys the complete `dist/` export to `timbuilds-web`; the existing routes expose it on both apexes. Do not manually deploy old source while a PR is in flight.

For local serving checks, run `npm ci`, `npm run build:worker`, and `npx wrangler dev` with a disposable browser profile. `npx wrangler deploy --dry-run` validates the upload without changing production. The workers.dev hostname reaches the production Worker, so it is not an isolated staging site.

## Response behavior and verification

Workers Static Assets applies the generated `_headers` rules. HTML uses `Cache-Control: public, max-age=0, must-revalidate, no-transform`; reset and confirmation HTML use `no-store, no-transform`. Preserve `Referrer-Policy: no-referrer`, `X-Content-Type-Options: nosniff`, document CSP, WebAssembly MIME, real 404s, clean HTML redirects, paths, queries, and browser-held fragments. Do not emit `Clear-Site-Data` or an SPA fallback.

After a merge, read the Workers Build **ID, successful status, source commit, deployment ID, and active Worker version**. Re-read both routes to confirm they still target `timbuilds-web`. From a checkout containing that commit, run `node tools/build-cloudflare.mjs` and `node tools/verify-cloudflare.mjs https://timbuilds.dev --git-ref=<full-deployed-commit-sha>`; repeat for `https://tim-builds.dev`. Check live headers and browser behavior on both domains, including OpenHoops, screenshots, project tabs, recovery and app-link routes, redirects, query/fragment handling, and actual 404s. Windows working-copy line endings are not the reference for a Linux build. Keep test results in ignored `.qa/`.

The former staged Worker added `X-TimBuilds-Release` and fetched unchanged files from pinned Pages deployment `4a80b07d.timbuilds-site.pages.dev`, which was deleted with the Pages project on 2026-09-25. A complete Static Assets deployment serves the export itself; prove the new release with build metadata and body hashes rather than that old header. Real-account recovery, physical-device and old-install acceptance remain open until separately exercised. Never use real passwords or recovery tokens in these checks.

## Rollback

For a code regression, revert the offending change in canonical `main`, wait for the checked Worker build, and verify both apexes. For urgent restoration, select a known-good `timbuilds-web` version in Cloudflare, confirm its deployment and both domains, then reconcile `main` before the next build. These are the only rollback paths. The pre-migration Worker version `de9a79d4-88eb-474a-84cd-6969f2f8b946` depended on the deleted Pages deployment `4a80b07d-216b-44b3-9f33-8d6007e0a644` and is **not** a valid rollback choice.

There is no Pages fallback behind the Worker. Removing the two apex Worker routes would leave both apexes pointing at the originless placeholder `192.0.2.1`, so the sites would stop serving; do not remove routes. DNS rollback is a separate owner-authorized account action. The privately saved Git bundle of the deleted repository and the `archive/site/*` branches remain historical material, not an authoring lane or a hosting fallback.

## Pages and GitHub Pages retired — September 25, 2026

- Both apex DNS records (`timbuilds.dev`, `tim-builds.dev`) changed from `CNAME -> timbuilds-site.pages.dev` to a **proxied A record to `192.0.2.1`**, the same originless placeholder pattern as the `www` records. The Worker routes serve all apex traffic. WWW redirects, MX, SPF, DKIM and SES records were unchanged.
- The Cloudflare Pages project `timbuilds-site` was deleted after its custom domains were removed; `timbuilds-site.pages.dev` and its pinned deployments no longer exist.
- GitHub Pages was disabled on `tim-builds/timbuilds.dev`. The retired `tim-builds/site` repository was deleted by the owner; a full private Git bundle (all branches) is kept on the owner's PC. The `archive/site/*` branches here remain.

Rollback for the DNS change: restoring the old apex `CNAME -> timbuilds-site.pages.dev` is **no longer possible**, because that Pages project is deleted. The apex A records only carry the Worker routes; if they must change, keep them proxied and keep the routes on `timbuilds-web`. Any DNS change needs the owner's specific authority.

## WWW aliases — completed September 22, 2026

Both WWW hostnames now terminate HTTPS and redirect at Cloudflare, independently of the former GitHub origins. Each zone has one active Single Redirect: `http*://www.<matching-domain>/*` to `https://<matching-domain>/${2}`, status 301, Preserve query string enabled. Neither apex redirects to the other. Browser-held fragments were checked with harmless markers, not live credentials.

Only each zone's `www` DNS record changed: a proxied A record to `192.0.2.1`, TTL Auto, as a redirect-only record. The redirect runs at the edge; that reserved address is not an application server. Do not disable its proxy or remove the redirect without arranging a replacement. The existing free Universal SSL serves the WWW certificates. No extra Pages custom-domain binding or paid feature is required.

The former `www.timbuilds.dev` certificate mismatch is fixed. Both aliases preserve paths and queries, including OpenHoops URLs. The exact rule names, checks and rollback are recorded in [the WWW completion note](docs/www-redirects-2026-09-22.md). The apex records (then Pages CNAMEs, since replaced on September 25), all email records, nameservers, account-wide TLS/security settings and private game runtime were unchanged.

The former WWW-only rollback (restoring `CNAME www -> tim-builds.github.io`) is **no longer available**: the GitHub Pages origins were disabled or deleted on September 25, 2026. Keep the WWW redirects in place; any replacement needs owner authority and must keep both apexes and all mail untouched.

Re-read active rules and DNS before edits, and confirm saved state rather than relying on a reported click. Do not use another write channel to bypass a blocked action.

## References

Workers Builds configuration: https://developers.cloudflare.com/workers/ci-cd/builds/configuration/
Workers Static Assets, headers and real 404s: https://developers.cloudflare.com/workers/static-assets/ and https://developers.cloudflare.com/workers/static-assets/routing/static-site-generation/
Cloudflare Pages domains: https://developers.cloudflare.com/pages/configuration/custom-domains/
Pages headers and email rewriting: https://developers.cloudflare.com/pages/configuration/headers/ and https://developers.cloudflare.com/waf/tools/scrape-shield/email-address-obfuscation/
WWW redirects: https://developers.cloudflare.com/pages/how-to/www-redirect/
GitHub archival: https://docs.github.com/en/repositories/archiving-a-github-repository/archiving-repositories

Earlier hosting assessments and release descriptions are preserved in `docs/history/`. They are historical context, not instructions to restore the old publishing workflow.
