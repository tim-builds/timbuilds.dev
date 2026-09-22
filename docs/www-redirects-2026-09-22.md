# WWW completion — September 22, 2026

## Current routes

| Incoming hostname | Permanent HTTPS destination |
| --- | --- |
| `www.timbuilds.dev` | `https://timbuilds.dev` with the original path and query |
| `www.tim-builds.dev` | `https://tim-builds.dev` with the original path and query |

Both HTTP and HTTPS requests receive a 301. Each apex remains a direct Cloudflare Pages site; neither spelling redirects to the other. The pre-existing primary-WWW certificate mismatch is resolved.

## Saved configuration

Each zone has exactly one active WWW Single Redirect: `WWW to primary - preserve paths and queries` or `WWW to hyphenated apex - preserve paths and queries`. Its source is `http*://www.<matching-domain>/*`, target `https://<matching-domain>/${2}`, status 301, and Preserve query string is enabled. The exact wildcard captures are intentional: the first matches the optional `s` in `https`; the second carries the path.

Only each `www` DNS record changed, from the original DNS-only/Auto CNAME to `tim-builds.github.io` into a **proxied A record to `192.0.2.1`, TTL Auto**. The reserved address is a redirect-only placeholder, not an application origin. The active edge rule handles the request, and the existing free Universal SSL handles HTTPS. Neither redirect now depends on GitHub Pages. No extra Pages binding, paid service or account-wide TLS/security change was made.

## Verified evidence

`node tools/verify-www.mjs` passed 44 exact redirects across both protocols/hostnames, including policy/recovery/friend/court/app-link/project paths, encoded query values, duplicate keys and unknown paths. Following the redirects reached the corresponding apex, retained recovery no-store and real 404s, and did not loop or clear site storage. Strict certificate verification stayed enabled.

Eight ordinary browser navigations preserved paths, queries and harmless fragments through WWW and Pages clean-URL redirects. Root project hashes still opened the correct project; recovery used an inert marker, not tokens; friend links used a synthetic handle without launching an app. Phone-sized destination screenshots were inspected. This is **not** real password recovery, a physical-phone test or old-install acceptance.

Fresh parity checks verified all 214 runtime files on each apex. Both authenticated DNS-table comparisons preserved their apex and all other records; independent DNS checks retained all 13 MX/TXT rows and nameservers. Public app/game/policy source, private Candystand runtime, Supabase and native OpenHoops implementation are unchanged. Detailed account snapshots and test evidence remain ignored/private.

## Rollback and remaining work

A separately authorized per-host rollback can restore that WWW record's original CNAME, DNS-only/Auto, and disable only its new rule. Verify the retained GitHub origin first; the primary WWW old state had a certificate mismatch, so it is not a healthy-HTTPS fallback guarantee. Never roll back a whole zone or touch mail/apex records for a WWW-only problem. Account/device acceptance remains open in #20; repository consolidation is already complete.

References: [Single Redirect configuration](https://developers.cloudflare.com/rules/url-forwarding/single-redirects/settings/), [matching one hostname while preserving paths and queries](https://developers.cloudflare.com/rules/url-forwarding/examples/redirect-all-different-hostname/), [Cloudflare redirect-only DNS setup](https://developers.cloudflare.com/pages/how-to/www-redirect/).
