# Classic-game compatibility and publishing decision — 2026-09-18

No new original game data has been published. Open Cadet remains unchanged. A successful emulator load is not redistribution clearance.

## Private compatibility test

Runtime: upstream DirPlayer polyfill v0.8.1, in disposable Chrome. A loopback-only server supplied unmodified archive DCR/CCT files; non-loopback requests were blocked. No obsolete plugin/projector or native game executable was installed or run. Private archives, scripts, screenshots and logs are in the worktree's ignored `.qa/candystand/`, excluded from the deployment export.

| Game | Files tested | Result |
| --- | --- | --- |
| Candystand.com Billiards, Skyworks, archive ID `69386cc8-d252-9731-d6ff-75d81e0b1864` | Default `candystand.com/games/billiards/csplmain.dcr` | Branded loading screen renders at 608×395. The game reports `** ERROR 21 **` and remains at loading after correctly timed mouse press/release. No playable match or AI opponent verified. The error's cause is not established; this is not proof of a general DirPlayer impossibility. |
| Candystand Miniature Golf / Classic, Skyworks, ID `83be04f3-975d-4a3b-9d7b-2f23b524849a` | `csmgmain.dcr` and `csmgholes.cct` | Menu and all 18 distinct hole scenes render at 624×350. Selecting a tee, aiming and releasing a shot on hole 1 increments its stroke counter. Returning to the menu works. No JavaScript exceptions or game alerts during these checks. |

Mini Golf is **partially compatible**, not fully certified: no completed 18-hole round; hole-completion/scoring, multiplayer, auditory fidelity, mobile input and the portfolio's pause/close lifecycle still require testing.

Exact tested SHA-256 values:
- Polyfill ZIP: `6f5000412c50833345a630ade25fb70359dc4e1aae66352c80de7da77542162c`
- Billiards DCR: `2e4940e6339ab22223713573b6bea7d2b0ab93ac09264ac8548b0a88e448e199`
- Mini Golf DCR: `d20c63f3896af107a1818da597499704fbb3472f1826c1d2b510c31c8bd35726`
- Mini Golf cast: `ae8995cbc2e8f4c39e84852f54879072c8988a4911576d2a8561b1cf0c993c3d`

## Permissions findings

Space Cadet: the MIT engine excludes original resources. Microsoft's account of its Cinematronics agreement says it did not permit independent distribution. No current verified public permission to redistribute the original artwork/audio/data was found. Retain CC0 Open Cadet and the existing external link; do not import original files just because another site hosts them.

Candystand: public preservation downloads establish availability, not permission. The Mini Golf archive attributes trademark/copyright to Candystand/Nabisco and states the games belong to their owners; it grants no sublicense. No verified website-redistribution grant was found for either original. The current chain of title for code, art/audio and branding remains unverified. DirPlayer's GPL license does not license the games. No live Candystand entries or original game assets should be published on this evidence.

## Ways forward without silently republishing unlicensed assets

For the **exact originals**, obtain written permission covering the particular code, artwork, audio, branding, public web delivery and any required adaptation. Trace the rights with the original developer/publisher or their successors rather than assuming ownership from a brand acquisition. Then resolve the Billiards startup failure and complete gameplay, desktop/mobile and lifecycle testing. A museum/archive's ability to preserve or distribute a copy is not a sublicense to this portfolio.

For a practical low-dependency alternative, commission/write original HTML5 billiards and miniature golf with original code, art/audio, branding and new hole designs. Retain the top-down aim/power feel, not copied Candystand graphics or course layouts. This is a different product and must be named honestly. A licensed modern game with an explicit embedding agreement is another option. Both avoid requiring visitors to install an obsolete browser plugin.

A local-file import player would avoid serving game files from timbuilds.dev, but it would not establish users' rights or fix Billiards compatibility; it is not represented as automatic legal clearance. No contacts or permission requests have been sent on the owner's behalf.

## Sources reviewed

- Microsoft licensing account: https://devblogs.microsoft.com/oldnewthing/20181221-00/?p=100535
- Engine/resources separation: https://github.com/k4zmu2a/SpaceCadetPinball
- DirPlayer and tagged release: https://github.com/igorlira/dirplayer-rs/releases/tag/v0.8.1
- Archive metadata: https://flashpointproject.github.io/flashpoint-database/ and the API linked by its own repository
- Preservation context: https://flashpointarchive.org/faq
- Mini Golf archive disclaimer: https://oneweakness.com/candy-stand-minigolf
- Game concepts versus expressive artwork: https://www.copyright.gov/register/tx-games.html

This is a publishing-risk recommendation based on available evidence, not a legal opinion or a definitive determination of present ownership.
