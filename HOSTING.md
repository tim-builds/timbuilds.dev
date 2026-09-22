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

At this checkpoint, the `www` records still point to `tim-builds.github.io`. The hyphenated `www` already redirects correctly. The pre-existing `www.timbuilds.dev` certificate mismatch remains open: the attempted Cloudflare redirect-rule save hit a tool safety-status block, so no `www` DNS rewrite is claimed complete. Keep this honest rather than treating apex migration as proof of `www` health. Do not delete the GitHub fallback while its `www` redirects are still in use.

The scoped intended finish is `www.timbuilds.dev` to `https://timbuilds.dev` and `www.tim-builds.dev` to `https://tim-builds.dev`, preserving paths, queries and browser-held fragments, without redirecting either apex to the other. Re-read active rules and DNS before retrying; a reported button click is not saved-state evidence. Do not use a second write channel to bypass a blocked action.

## References

Cloudflare Pages domains: https://developers.cloudflare.com/pages/configuration/custom-domains/
Pages headers and email rewriting: https://developers.cloudflare.com/pages/configuration/headers/ and https://developers.cloudflare.com/waf/tools/scrape-shield/email-address-obfuscation/
WWW redirects: https://developers.cloudflare.com/pages/how-to/www-redirect/
GitHub archival: https://docs.github.com/en/repositories/archiving-a-github-repository/archiving-repositories

Earlier hosting assessments and release descriptions are preserved in `docs/history/`. They are historical context, not instructions to restore the old publishing workflow.
