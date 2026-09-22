# Hosting and publishing

## Current production

Both apex addresses, `timbuilds.dev` and `tim-builds.dev`, serve the same Cloudflare Pages project: **`timbuilds-site`**, Git-connected to **`tim-builds/timbuilds.dev`**, production branch **`main`**. Do not redirect either apex to the other. DNS and email are different responsibilities; publishing a new site version does not require changing domain/mail records.

The static export uses framework preset **None**, repository-root build context, output **dist**, and the configured Node version **24.18.0**. The current build command is:

```sh
node tools/build-portfolio.mjs --check && node tools/build-project-sites.mjs --check && node tools/verify-portfolio.mjs && node tools/verify-media.mjs && node tools/build-cloudflare.mjs
```

`tools/build-cloudflare.mjs` copies only the approved public source trees and generates a real 404 and hosting headers. It excludes Git, tools, QA, CNAME, local configuration and private original-game/recovery files. Do not replace this with a raw folder upload. No Pages Functions, paid upgrade or external runtime service is required by this portfolio.

## Preview and response behavior

Production deployments are enabled for `main`. Automatic previews are restricted to `prep/pages-20-current`; private branches and `archive/site/*` are not deployment targets. A new feature branch needs an explicitly approved preview allowlist addition if a hosted preview is necessary. Local testing does not change the account.

HTML responses include `Cache-Control: public, max-age=0, must-revalidate, no-transform`. Recovery HTML instead uses `no-store, no-transform`. This avoids Cloudflare's zone-level email-link rewriting without changing its account-wide settings. Non-HTML caching is untouched. The global export headers retain `Referrer-Policy: no-referrer` and `X-Content-Type-Options: nosniff`. Preserve original inline/document CSP rules, WebAssembly MIME and URL query/fragment behavior.

Pages removes `.html` in some canonical URLs; the migration tests check recovery/friend fragments and court queries through these redirects. Do not add an SPA fallback or broad redirect that replaces a real policy, recovery or app-link response with the portfolio.

## Verify a deployment

Run `node tools/build-cloudflare.mjs`, then `node tools/verify-cloudflare.mjs https://timbuilds.dev --git-ref=<full-deployed-commit-sha>` and repeat for the hyphenated apex. The full SHA must identify the actual deployment; Windows working-copy line endings are not the reference for a Linux build. Also verify `tools/test-cloudflare-headers.mjs`, current headers and the relevant browser tests. Hosted browser runs support `PORTFOLIO_ORIGIN`; keep results and screenshots in ignored `.qa/`.

Each apex passed 214 runtime-file parity checks and 142 browser-check groups after the migration. Those are dated results, not permanent certification. Recovery used a mocked Supabase client; real-account recovery, physical-device and old-install acceptance remain open. Never collect real passwords or recovery tokens in public tickets or chat.

## Rollback and remaining domain work

For an ordinary code regression, revert the offending change in canonical `main`, verify the new deployment, and do not copy the revert into the old repository. An authorized Pages rollback to a known-good production deployment is also possible; reconcile source afterward so the next deployment does not undo the rollback.

The former GitHub Pages services and their CNAME bindings are retained as frozen fallback origins. Archiving the old repository makes it read-only, not deleted; unarchive it before an emergency edit/rebuild. A privately saved Git bundle and named historical refs provide additional recovery material. Do not remove these fallbacks merely because the public domains no longer direct apex traffic there. A DNS rollback is a separate account operation requiring current confirmation of the exact original records and TLS; caches make instant recovery impossible to promise.

## WWW aliases — completed September 22, 2026

Both WWW hostnames now terminate HTTPS and redirect at Cloudflare, independently of the frozen GitHub origins. Each zone has one active Single Redirect: `http*://www.<matching-domain>/*` to `https://<matching-domain>/${2}`, status 301, Preserve query string enabled. Neither apex redirects to the other. Browser-held fragments were checked with harmless markers, not live credentials.

Only each zone's `www` DNS record changed: a proxied A record to `192.0.2.1`, TTL Auto, as a redirect-only record. The redirect runs at the edge; that reserved address is not an application server. Do not disable its proxy or remove the redirect without arranging a replacement. The existing free Universal SSL serves the WWW certificates. No extra Pages custom-domain binding or paid feature is required.

The former `www.timbuilds.dev` certificate mismatch is fixed. Both aliases preserve paths and queries, including OpenHoops URLs. The exact rule names, checks and rollback are recorded in [the WWW completion note](docs/www-redirects-2026-09-22.md). Both apex Pages records, all email records, nameservers, account-wide TLS/security settings and private game runtime were unchanged.

For an authorized WWW-only rollback, restore that hostname's saved original `CNAME www -> tim-builds.github.io`, DNS only / Auto, and disable only its new WWW redirect. Re-check the frozen GitHub origin first. The primary WWW previously had a certificate mismatch, so returning to that old configuration is not a guarantee of healthy HTTPS. Keep both apexes and all mail untouched.

Re-read active rules and DNS before edits, and confirm saved state rather than relying on a reported click. Do not use another write channel to bypass a blocked action.

## References

Cloudflare Pages domains: https://developers.cloudflare.com/pages/configuration/custom-domains/
Pages headers and email rewriting: https://developers.cloudflare.com/pages/configuration/headers/ and https://developers.cloudflare.com/waf/tools/scrape-shield/email-address-obfuscation/
WWW redirects: https://developers.cloudflare.com/pages/how-to/www-redirect/
GitHub archival: https://docs.github.com/en/repositories/archiving-a-github-repository/archiving-repositories

Earlier hosting assessments and release descriptions are preserved in `docs/history/`. They are historical context, not instructions to restore the old publishing workflow.
