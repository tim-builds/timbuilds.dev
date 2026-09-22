# Historical preview-stage record

The preview-only restrictions and interim publishing instructions below were superseded by the approved production migrations in #20, #36 and #37. Follow the root README.md and HOSTING.md for routine updates. Retain this dated evidence; do not restart the migration from it.

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

## Preview project created — September 22

Cloudflare project `timbuilds-site` is now connected through GitHub to `tim-builds/timbuilds.dev`. The existing GitHub app authorization was reused; no second repository was connected to this project. No custom domains or paid upgrades were added.

The dashboard's required initial build attempted current `main` and failed without creating a production deployment. Main remains unchanged; it does not yet contain this branch's exporter. Automatic production deployments have now been disabled. Custom preview deployment is restricted to `prep/pages-20-current` (the wildcard include was removed). This documentation commit triggers the first intended Git preview build.

Current local verification: 214 public runtime files pass exact byte checks under local Pages. All 142 browser check groups pass, including the mocked reset/friend-fragment checks. This paragraph does not yet claim hosted verification. OAuth credentials are stored using Wrangler's OS-keychain-backed encrypted storage; no credential is present in Git or this document.

Hosted checks must pass `--git-ref=<full deployment commit SHA>` to compare against the exact Linux/Git build source, not Windows CRLF working-copy bytes. This is strict byte comparison against a pinned commit, not normalization or a weaker comparison. Local Pages checks omit the option and compare the actual local export.

## Hosted preview verified — September 22

- Git-integrated project: `timbuilds-site`, repository `tim-builds/timbuilds.dev`.
- Successful preview deployment: `0f3653b0-00f9-4e54-aff3-0643a9862662`.
- Deployed source: `fa29dc05e525b07a27e25dfa874546ba519e2088`.
- Pinned URL: https://0f3653b0.timbuilds-site.pages.dev/ . Branch alias: https://prep-pages-20-current.timbuilds-site.pages.dev/ . The bare project hostname has no successful production deployment and is not the preview link.
- All 214 exported runtime files pass strict comparison against the pinned Git objects. Reset no-store, WASM MIME, true 404/private-path denial, same-origin redirects, query retention and no Clear-Site-Data pass.
- All 142 browser check groups pass on the hosted HTTPS preview, including the current project list, eleven OS themes, public games, mobile/desktop layout and mocked reset/friend fragments. The 390-pixel landing screenshot was visually inspected.
- Verifier-only commit `6e4640cdd8187d6a67295894771a3a80dc425666` increases Git-blob read capacity for existing large game assets and waits for the actual newly opened pinball canvas before measuring it. It changes no website/runtime bytes. Its `[CF-Pages-Skip]` record is intentionally not a deployed revision. Later documentation-only records may likewise be skipped.
- Saved account settings were reopened and verified: production branch main, automatic production builds disabled, Custom preview branches containing only `prep/pages-20-current`; no custom domains configured. Existing GitHub-app authorization was reused, not broadly changed. Only this repository is attached to this Pages project.
- Both live domains remain on GitHub Pages. Canonical main `64519aa` and old source main `4fc0ff9` are unchanged and still differ only in CNAME. Eight live route bodies on each domain match their original Git content. No DNS/mail/registration, paid-plan, corporate/store, native-app or private-runtime change was performed.

The hosted preview stage is complete, not the migration. This PR stays draft/unmerged and #20 stays open. Real-account recovery, old-install physical-device app links, account-side DNS/TLS review, concrete cutover approval, one-hostname-at-a-time rollout, rollback and reconciliation of the old repository's unique work remain separate gates. #35's detailed operator research remains private and no entity action is authorized by this preview approval.

Detailed browser/HTTP evidence remains in ignored `.qa/`; no owner key, authentication token, private game file, personal record or handoff packet was committed. Owned local Pages test processes and the disposable preview browser were stopped after verification; the owner's normal browser and private demo were not closed.
