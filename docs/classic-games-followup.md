# Original Candystand follow-up: issues #21, #22 and #23

This follow-up changes development tools and documentation only. Cloudflare sign-in, migration, DNS, mail, live game menus, and the current Open Cadet assets were not changed. Original game files and emulator binaries remain outside the committed tree. Earlier migration work remains in draft PR #19.

## #21 — Billiards startup resolved in the private laboratory

The previous `ERROR 21` was traced to missing embedding parameters: the movie's startup handler expected `sw1` and `sw2`, which the first bare-embed test did not supply. Supplying the expected launch configuration in the private harness advanced the **same unmodified** movie to table selection. No game bytecode or emulator was patched and no game check was removed.

Confirmed with actual mouse input: Classic table selection, 8-ball setup, name entry, entering the original Life Savers table, placing the cue ball, aiming/power input, a break shot, moving/colliding balls, and pocketed balls. The Rules overlay opens, although its text extends beyond the intended panel; it is not visually certified. The game is configured with a computer opponent, but a complete AI turn and completed match were **not** verified.

This supersedes the previous conclusion that gameplay was blocked at loading. It does **not** resolve public redistribution permission. The tested DCR remains SHA-256 `2e4940e6339ab22223713573b6bea7d2b0ab93ac09264ac8548b0a88e448e199`.

## #22 — Mini Golf integrated privately into the actual desktop

The original Mini Golf now runs in a real timBuilds app window in the local prototype, not only a standalone test page. Its full-18 mode and player-count selection were exercised. A 390px emulated touchscreen tap opened the selected first-hole scene. Prior verified coverage remains: all 18 distinct hole scenes, tee selection, aim/release and a counted stroke on hole 1.

The integration checks below cover both games. A complete 18-hole round, full scoring/course-transition coverage, all play modes, auditory fidelity, touch shot reliability and physical-phone behavior are still pending. A rendered course or player-count dialog is not a completed gameplay test.

## Reusable integration and isolation

`tools/classic-lab/` serves an operator-supplied private configuration on loopback only and adds two explicitly private-test Start-menu entries. The game iframe is sandboxed without same-origin, top-navigation, popup or form privileges. Emulator preference storage is ephemeral, so it cannot read the desktop's notes or owner key. The Content Security Policy allows only the lab's local runtime resources; the harness does not download or serve original assets from a public origin.

Repeatable checks passed for both games: opaque iframe isolation; pause/resume; minimize/restore; retained iframe across resizing; proportional fit at 320, 390 and 1440px; close cleanup and a fresh runtime on reopen. The tests also reject foreign Host headers, refuse private-file/config access, and retain a desktop storage sentinel. Screenshots and reports remain under ignored `.qa/`.

Source entry points: `tools/classic-lab/README.md`, `serve.mjs`, `host.js`, `frame.js`, `browser.mjs`, and `check.mjs`. No original game files or compiled emulator are included, and production `index.html` is unchanged.

## #23 — Permissions: concrete referral prepared, not a license grant

Garry Kitchen's own site describes his founding of Skyworks and its launch of LifeSavers Candystand, and provides a public contact address. He is a useful **referral lead**, not a confirmed present rights holder. A permission/referral email was saved as a Gmail draft for the owner to review; it has **not been sent**. It asks who controls the particular games and covers code, artwork, sound, branding, public web delivery and emulator adaptation. It also asks about an authorized externally hosted version that expressly permits embedding.

The present chain of rights remains unverified. Neither archival availability, an emulator's license, a publisher/brand acquisition, nor the existence of another browser port establishes the required permission. Space Cadet remains unchanged because no applicable grant for the original resources has been identified.

Presentation is not a substitute for clearance:
- Hosting original files in a desktop window and hosting them inside the simulated browser have the same underlying public-delivery question.
- Embedding an authorized publisher-hosted player may be viable if that publisher permits it and its terms cover the proposed use. No such authorized player has yet been verified for these exact originals.
- Loading a visitor's local files avoids distributing those files from the site, but is not proof that the visitor has a lawful copy, does not fix compatibility, and is not a blanket legal exemption.

The recommended route for the exact originals is permission plus completion of compatibility tests. A newly created HTML5 game with original code/assets/layouts is a fallback, not a substitute being silently shipped here. This is a practical publishing recommendation, not a legal opinion or definitive ownership determination.

Sources checked:
- https://www.garrykitchen.com/ (Skyworks/Candystand history)
- https://www.garrykitchen.com/contact.html (public referral contact)
- https://www.copyright.gov/help/faq/faq-fairuse.html (permission and rights-status guidance)
- https://github.com/igorlira/dirplayer-rs/releases/tag/v0.8.1 (pinned emulator)
- https://devblogs.microsoft.com/oldnewthing/20181221-00/?p=100535 (original Space Cadet distribution history)

## Remaining release gates

Keep #21, #22 and #23 open. No original game should enter a public build or public Start menu until permission and the remaining gameplay tests are resolved. Preserve the working laboratory and report so these tests do not have to be reconstructed. Do not resume issue #20's Cloudflare migration as a side effect.
