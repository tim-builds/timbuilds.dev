# Hosting and publishing

## Current production

`tim-builds/timbuilds.dev` is the only website source. Cloudflare Worker **`timbuilds-web`** serves both `https://timbuilds.dev` and `https://tim-builds.dev` through their existing routes. Neither apex redirects to the other. The Git-integrated Pages project **`timbuilds-site`** still builds `main` as a fallback; it is no longer the normal path for apex traffic. Routine publishing does not change DNS or email.

The Worker uses Static Assets. `tools/build-cloudflare.mjs` copies only approved public source into `dist/`, then generates `404.html`, `_headers`, and an `.assetsignore` rule excluding its local export marker. `wrangler.workers.jsonc` points only at `dist/`, declares the existing apex routes and workers.dev hostname, and serves real 404s. The separate `wrangler.jsonc` remains the Pages configuration. Do not upload the repository root, private runtime, QA results, owner files, local configuration, or browser profiles.

## Publishing from Git

Workers Builds is connected to `tim-builds/timbuilds.dev`, production branch `main`, root `/`, with Node **24.18.0**. Its exact commands are:

```text
Build:  npm ci && npm run build:worker
Deploy: npx wrangler deploy --config wrangler.workers.jsonc
```

`package-lock.json` pins Wrangler. `build:worker` checks generated source, project sites, portfolio and media, then creates and checks the allowlisted export. The named deploy configuration is required because the default `wrangler.jsonc` still targets Pages. Workers previews are disabled, so a feature branch does not publish a preview of this production Worker. Pages previews remain restricted to `prep/pages-20-current`. Change either preview rule only with owner approval.

For routine changes, branch from current canonical `main`, edit source and generators, regenerate outputs, run the README checks, and review the complete diff in one PR. After required checks and independent review pass, merge to `main`. Workers Builds runs the commands above and deploys the complete `dist/` export to `timbuilds-web`; the existing routes expose it on both apexes. Pages also builds that same `main` source as fallback. Do not manually deploy old source while a PR is in flight.

For local serving checks, run `npm ci`, `npm run build:worker`, and `npx wrangler dev --config wrangler.workers.jsonc` with a disposable browser profile. `npx wrangler deploy --config wrangler.workers.jsonc --dry-run` validates the upload without changing production. The workers.dev hostname reaches the production Worker, so it is not an isolated staging site.

## Response behavior and verification

Workers Static Assets applies the generated `_headers` rules. HTML uses `Cache-Control: public, max-age=0, must-revalidate, no-transform`; reset and confirmation HTML use `no-store, no-transform`. Preserve `Referrer-Policy: no-referrer`, `X-Content-Type-Options: nosniff`, document CSP, WebAssembly MIME, real 404s, clean HTML redirects, paths, queries, and browser-held fragments. Do not emit `Clear-Site-Data` or an SPA fallback.

After a merge, read the Workers Build **ID, successful status, source commit, deployment ID, and active Worker version**. Re-read both routes to confirm they still target `timbuilds-web`. From a checkout containing that commit, run `node tools/build-cloudflare.mjs` and `node tools/verify-cloudflare.mjs https://timbuilds.dev --git-ref=<full-deployed-commit-sha>`; repeat for `https://tim-builds.dev`. Check live headers and browser behavior on both domains, including OpenHoops, screenshots, project tabs, recovery and app-link routes, redirects, query/fragment handling, and actual 404s. Windows working-copy line endings are not the reference for a Linux build. Keep test results in ignored `.qa/`.

The former staged Worker added `X-TimBuilds-Release` and fetched unchanged files from pinned Pages deployment `4a80b07d.timbuilds-site.pages.dev`. A complete Static Assets deployment serves the export itself; prove the new release with build metadata and body hashes rather than that old header. Real-account recovery, physical-device and old-install acceptance remain open until separately exercised. Never use real passwords or recovery tokens in these checks.

## Rollback and retained fallbacks

For a code regression, revert the offending change in canonical `main`, wait for the checked Worker build, and verify both apexes. For urgent restoration, select a known-good `timbuilds-web` version in Cloudflare, confirm its deployment and both domains, then reconcile `main` before the next build. The pre-migration Worker version `de9a79d4-88eb-474a-84cd-6969f2f8b946` depends on pinned Pages deployment `4a80b07d-216b-44b3-9f33-8d6007e0a644`; retain that deployment while it remains a rollback choice.

The Pages project stays Git-connected to `main` as a fallback. Removing the two apex Worker routes would send traffic to the **current** Pages production deployment, which may be newer than the pinned version above. Re-read routes, Pages deployment, and TLS before such a change; do not remove routes merely to simplify the setup. DNS rollback is a separate owner-authorized account action. The former GitHub Pages origins, privately saved Git bundle, and named historical refs remain recovery material; the retired repository is not an authoring lane.
## WWW aliases — completed September 22, 2026

Both WWW hostnames now terminate HTTPS and redirect at Cloudflare, independently of the frozen GitHub origins. Each zone has one active Single Redirect: `http*://www.<matching-domain>/*` to `https://<matching-domain>/${2}`, status 301, Preserve query string enabled. Neither apex redirects to the other. Browser-held fragments were checked with harmless markers, not live credentials.

Only each zone's `www` DNS record changed: a proxied A record to `192.0.2.1`, TTL Auto, as a redirect-only record. The redirect runs at the edge; that reserved address is not an application server. Do not disable its proxy or remove the redirect without arranging a replacement. The existing free Universal SSL serves the WWW certificates. No extra Pages custom-domain binding or paid feature is required.

The former `www.timbuilds.dev` certificate mismatch is fixed. Both aliases preserve paths and queries, including OpenHoops URLs. The exact rule names, checks and rollback are recorded in [the WWW completion note](docs/www-redirects-2026-09-22.md). Both apex Pages records, all email records, nameservers, account-wide TLS/security settings and private game runtime were unchanged.

For an authorized WWW-only rollback, restore that hostname's saved original `CNAME www -> tim-builds.github.io`, DNS only / Auto, and disable only its new WWW redirect. Re-check the frozen GitHub origin first. The primary WWW previously had a certificate mismatch, so returning to that old configuration is not a guarantee of healthy HTTPS. Keep both apexes and all mail untouched.

Re-read active rules and DNS before edits, and confirm saved state rather than relying on a reported click. Do not use another write channel to bypass a blocked action.

## References

Workers Builds configuration: https://developers.cloudflare.com/workers/ci-cd/builds/configuration/
Workers Static Assets, headers and real 404s: https://developers.cloudflare.com/workers/static-assets/ and https://developers.cloudflare.com/workers/static-assets/routing/static-site-generation/
Cloudflare Pages domains: https://developers.cloudflare.com/pages/configuration/custom-domains/
Pages headers and email rewriting: https://developers.cloudflare.com/pages/configuration/headers/ and https://developers.cloudflare.com/waf/tools/scrape-shield/email-address-obfuscation/
WWW redirects: https://developers.cloudflare.com/pages/how-to/www-redirect/
GitHub archival: https://docs.github.com/en/repositories/archiving-a-github-repository/archiving-repositories

Earlier hosting assessments and release descriptions are preserved in `docs/history/`. They are historical context, not instructions to restore the old publishing workflow.
