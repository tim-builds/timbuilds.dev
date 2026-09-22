# Cloudflare Pages preview — issue #20

## Approved scope

The owner approved publishing this refreshed migration branch, connecting only `tim-builds/timbuilds.dev` to a Free Git-integrated Pages project, and testing a hosted preview. This is not approval for custom-domain bindings, DNS/mail changes, paid upgrades, live cutover or repository archival. Native openHoops implementation and operator setup (#35) remain separate; detailed operator research stays outside public Git.

The branch starts from canonical `64519aab74f8279a7c899e7ce1d50966b0d369bd`. It preserves the eleven OS themes, list-first project page and approved report-note disclosures. The old draft PR #19 must not overwrite current main.

## Project configuration

- Git provider: GitHub; repository: `tim-builds/timbuilds.dev` only.
- Proposed project name: `timbuilds-site`, subject to availability.
- Production branch: `main`; disable automatic production deployments during this preview stage.
- Preview setting: Custom; allow only `prep/pages-20-current` initially. Other branches, including the private-demo branch, must not automatically deploy.
- Framework: None. Root: repository root. Node: `24.18.0`.
- Build: `node tools/build-portfolio.mjs --check && node tools/build-project-sites.mjs --check && node tools/verify-portfolio.mjs && node tools/verify-media.mjs && node tools/build-cloudflare.mjs`
- Output: `dist`. No Functions, bindings, secrets, analytics or custom domains.

Use Git integration, not Direct Upload. This is a public-site preview, not the private Candystand demo. A successful local check is not a hosted deployment.

## Verification

Run the build command above, then `npx --yes wrangler@4.135.0 pages dev dist --ip 127.0.0.1 --port 8798`. Run `node tools/verify-cloudflare.mjs http://127.0.0.1:8798`. Set `PORTFOLIO_ORIGIN` to local Pages or the actual hosted HTTPS origin and run `node tools/browser-check.mjs --migration`.

The export allows only public runtime roots and rejects symlinks, private/configuration paths and original Director movie/cast files. CNAME, Git, QA, tools and operator notes are excluded. Real 404s, reset no-store headers and no Clear-Site-Data are required. The migration browser test deliberately mocks Supabase and uses dummy reset tokens; it never changes a real account.

## Remaining gates

Record the actual Git deployment ID, preview origin and commit after Cloudflare reports success. Verify every exported runtime file, desktop behaviour, same-origin routing, query and fragment retention, policy/app-link paths and absence of private game assets. Real-account recovery and physical-device/old-install app-link tests require separate approval and must not be confused with mocked tests.

Keep both GitHub Pages sites, repositories, authoring/mirror procedures and developer remotes intact. Reconcile unique work (including old repo PR #1) before retirement. Read-only DNS/TLS review and a hostname-by-hostname rollback plan precede later cutover approval.

References: https://developers.cloudflare.com/pages/get-started/git-integration/ ; https://developers.cloudflare.com/pages/configuration/branch-build-controls/ ; https://developers.cloudflare.com/pages/configuration/preview-deployments/ .
