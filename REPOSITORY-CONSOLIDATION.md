# One website repository — current operational source

**Use `tim-builds/timbuilds.dev` for all new website changes.** Both main domains deploy canonical `main` through Cloudflare Pages project `timbuilds-site`. The former source-to-mirror procedure is retired. No native app code, database, account, store identity or private game runtime was consolidated into the public website.

## Reconciled history

Audit date: September 22, 2026. Old repository main `4fc0ff980c55b477c48bfb9acdc3985e88142ec8` is an ancestor of canonical main `e84323acb8014cfa5fe5574c3a52c55221713096`. The public app/game/policy source was not rewritten for cleanup. The remaining old PR #1, `privacy/crash-scope-correction`, is superseded by merged commit `2e30d3932aa2a90c582d093ea3af9e14ac016802` and later approved privacy revisions. That merged correction addresses native-only crash-reporting scope and US hosting without the stale patch's unverified exact cutoff claim. The current page no longer contains the erroneous statement that an update adds native crash reporting to older installs.

Do not merge the July patch over the later September policy. Closing it as superseded preserves its discussion rather than claiming its exact commit was merged. Its original commit and the other non-ancestral branch heads are retained in canonical historical branches:

| Historical branch in canonical repository | Exact original head |
| --- | --- |
| `archive/site/assetlinks-481` | `1b6cc1e1191b8c5bc3627caa10ae680721c080d8` |
| `archive/site/privacy-precision-corrections` | `e66d6382df86e8048d3af6766907c58194957a86` |
| `archive/site/integrated-clock-year` | `8cf25bbf3d6e09e4808ae01199f19aa617fbf96a` |
| `archive/site/crash-scope-correction` | `55cfa627265206f6bfc7e9232f60c3ff4ce5cfa2` |

These branches are archival evidence, not production or preview targets. Their capabilities already have later main-line implementations; no old file should overwrite a current implementation. The complete original repository refs and PR discussion were also backed up privately. No branch, tag, PR history or issue was deleted.

## One-place workflow

Use the fresh `Desktop/dev/timbuilds.dev` checkout on Playground, or clone the canonical repository. Existing named lanes and the running private-demo checkout must not be reset or moved. The old `Desktop/dev/openhoops-site` checkout is historical; its saved worktrees remain available. Do not use its stale main or old `origin` for new website work. The old repository's retirement notice and archival/read-only state prevent successful routine publishing there.

Canonical README/AGENTS/HOSTING are authoritative for website authoring. Older native-app migration notes and old local instructions do not reinstate the mirror. Coordinate any native-repository documentation-pointer update through its lead; cleanup does not edit that implementation or pause its work.

## Not being claimed complete

Real-account recovery, physical-phone and old-install App Link acceptance remain open. The existing primary-www TLS issue and final www redirect cleanup remain separate in #20. GitHub Pages fallbacks are retained, including existing www behavior, and can be edited again after unarchiving if explicitly needed. Archiving the old source is reversible; deleting it is not approved.

The original migration proposal, hosting comparison and detailed desktop release notes remain under `docs/history/`. Operator/entity research (#35), raw DNS snapshots, credentials and private test evidence are outside public Git.
