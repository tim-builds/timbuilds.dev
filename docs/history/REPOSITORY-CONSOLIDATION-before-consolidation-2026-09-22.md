# Historical record — superseded

Do not follow the former two-repository publishing instructions below. The root README.md, AGENTS.md and HOSTING.md describe the current single-source workflow. This snapshot preserves the earlier implementation/research notes without making them operational instructions.

---

# One website repository — proposed migration, not a completed cutover

## What is duplicated today

Read-only audit on 2026-09-18: `tim-builds/site` publishes `tim-builds.dev` and `tim-builds/timbuilds.dev` publishes `timbuilds.dev`; both use GitHub Pages, `main`, repository root. Both contain the portfolio, `/portfolio/`, `/projects/`, `/openhoops/`, `.well-known/`, and historical stubs. They are not a portfolio-versus-OpenHoops split. The native OpenHoops application is a different project and is outside this proposal.

At source `ed52e7d73a96115e38db42aa777f68debee84b11` and canonical `2013017a5bcf010d7bc7204f02d2f07c9ef3e54d`, GitHub's comparison confirms the canonical history contains the source, with **CNAME as the only file difference**. Refresh this comparison immediately before cutover.

## Proposed destination

Keep `tim-builds/timbuilds.dev` as the single authoring repository for both the portfolio and OpenHoops website. Deploy its static payload to one project capable of serving both existing hostnames, for example Cloudflare Pages. Initially serve the same content on both domains; this is simpler and safer than changing password-recovery origins during the repository change. No framework rewrite, app merge, Supabase database migration, or new login system is needed for this arrangement.

Cloudflare supports multiple custom domains on a Pages project: https://developers.cloudflare.com/pages/configuration/custom-domains/ . Existing host suitability and export instructions are in HOSTING.md.

## Approval and verification gates

1. Preserve both repositories and their history; create and test a preview from the canonical repo. Do not rename, delete, archive, change CNAME, repoint an existing developer checkout, or edit live DNS just to create that preview.
2. Check root portfolio assets and every protected `/openhoops/` route, especially reset, privacy, terms, account deletion, court and add-friend links, plus `.well-known/assetlinks.json`. Policies and deletion instructions must still be directly readable by crawlers, not just JavaScript redirects.
3. Review current DNS, TLS and host bindings read-only. Obtain approval for the concrete web-record cutover. Preserve all MX/TXT/mail routing and both registered domains. Keep the exact HTTPS hostnames and paths so browser storage and recovery callbacks do not silently change origin.
4. Test recovery with an authorized account and shared links on real devices, including an old install. The existing OpenHoops `docs/DOMAIN-MIGRATION.md` contains unresolved auth/store/legacy-link gates; this proposal does not declare them completed or change the Supabase allowlist.
5. Cut over the two web origins one at a time with rollback available. Verify TLS, callback fragments, ordinary query strings, app handoff, direct policy text, desktop state and games on the real domains. Do not issue Clear-Site-Data.
6. Only after verification, make the canonical repo the documented authoring source, update the separate app's source pointers in a coordinated change, and retire the duplicate deployment. Archive the old repo for rollback first; deletion would be a separate explicit decision. Old-domain compatibility must remain hosted even after its old repository is retired.

Until that migration is approved and verified, the current source-to-mirror merge procedure remains in force. **This document changes no hosting, DNS, auth, repository settings or publishing permissions.**
