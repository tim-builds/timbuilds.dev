# Hosting and portability

## Current recommendation

Keep this portfolio on GitHub Pages for now. Its desktop, games, drawing tools and local notes run in the visitor's browser. The host serves HTML, JavaScript, CSS, pictures and the pinball WebAssembly/data files; it does not run a copy of Windows or a game server. GitHub Pages is a static hosting service, which matches this architecture: https://docs.github.com/en/pages/getting-started-with-github-pages/what-is-github-pages

The release-7 portable payload is approximately 10.35 MiB across 131 files; the largest file is the 4.53 MiB pinball WASM. Re-run `node tools/export-site.mjs --check` for current sizes. This is comfortably below GitHub Pages' 1 GB published-site limit. GitHub also documents a 100 GB/month soft bandwidth limit and restrictions on primarily commercial transaction/SaaS sites: https://docs.github.com/en/pages/getting-started-with-github-pages/github-pages-limits

Cloudflare Pages would also work, and would offer explicit header/redirect configuration and an optional Functions/Workers path for future backend features. Its documented 25 MiB single-asset limit is above this site's largest asset. For a new Cloudflare deployment, also evaluate Workers Static Assets rather than assuming Pages is the only route. Documentation: https://developers.cloudflare.com/pages/platform/limits/ , https://developers.cloudflare.com/pages/configuration/headers/ , https://developers.cloudflare.com/workers/static-assets/migration-guides/migrate-from-pages/

Vercel can host this static build, but nothing in this portfolio needs its server-rendering features. Hobby is restricted to personal non-commercial use; commercial usage requires a paid plan. A growing client business or advertising services merits reviewing that policy rather than assuming Hobby covers it: https://vercel.com/docs/limits/fair-use-guidelines

Changing host would not improve desktop gesture logic or remove browser tab-closing restrictions; those are client-side behaviours. It also would not change third-party artwork rights. Keep the bundled credits and source notices wherever the site is deployed.

## Hypothetical migration checklist — no migration has been performed

1. Run the generated-HTML, static-asset and browser checks before exporting. `node tools/export-site.mjs` creates a timestamped ignored `.qa/portable-site-*` directory. Upload only that public output, not the whole development workspace. The export deliberately excludes Git history, tools, other QA files, domain CNAME configuration and the private owner recovery file.
2. Deploy it as static files, preserving `/openhoops/`, `/.well-known/`, `/portfolio/` and `/legacy-stubs/` paths. Do not add a catch-all rewrite that masks the OpenHoops policy/account/app-link pages. Keep WASM responses as `application/wasm` and honour the existing per-document content security policies.
3. Test the new temporary host: all OS skins, games, text-policy viewer, mobile controls, canonical OpenHoops paths and asset hashes. A different preview hostname has separate browser storage and will not automatically recognise the owner key.
4. Only after separate approval, configure HTTPS for the same `timbuilds.dev` domain and change its web-hosting DNS records. Preserve mail records, domain ownership settings and the separate interim `tim-builds.dev` migration plan. Do not change DNS or shut down the previous host merely to create a preview.
5. Confirm the final HTTPS hostname/port are unchanged. Browser localStorage and IndexedDB are scoped to origin, not to the hosting vendor, so an origin-preserving migration normally keeps local notes/preferences and enrolled owner keys. Moving to another hostname does not transfer those automatically. Do not clear site data or send Clear-Site-Data during the migration. See https://developer.mozilla.org/en-US/docs/Web/API/Window/localStorage and https://developer.mozilla.org/en-US/docs/Web/API/IndexedDB_API/Using_IndexedDB .
6. Run the browser suite against the final domain, then retain a rollback route until verified.

There is no application database migration or framework rewrite needed for the current portfolio. Future server-side accounts, shared data, payment processing, or multiplayer infrastructure would be a different hosting decision.
