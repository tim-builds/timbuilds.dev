# Classic game follow-up — research, not additional shipped games

## Space Cadet

The bundled MIT SpaceCadetPinball engine uses CC0 Open Cadet replacement art/sounds. The replacement's deliberately different palette and neon-space table explain why it does not look like the original Windows game. Source and hashes remain in vendor/pinball/provenance.json; no original Microsoft game data was added.

Upstream engine: https://github.com/k4zmu2a/SpaceCadetPinball . It supports original Windows and Full Tilt resources, which are not included with that engine. Upstream lists alula's browser port; its public entry redirects to https://pinball.alula.me/ . On 2026-09-18 this page rendered the original colorful Space Cadet table in an isolated Chrome profile. The portfolio provides an explicitly external link to that version, not a locally repackaged copy or a claim that Microsoft's original assets became CC0.

Replacement artwork author: https://github.com/andrewnakas/open-cadet .

## Exact Candystand games located

Flashpoint's public database (https://flashpointproject.github.io/flashpoint-database/) and its documented front-end API returned these entries on 2026-09-18:

- **Candystand.com Billiards**, Skyworks Technologies, Inc., Shockwave, ID `69386cc8-d252-9731-d6ff-75d81e0b1864`. Version `0829.1`; original launch path `candystand.com/games/billiards/csplmain.dcr`. The archive screenshot shows the green table with the **Life Savers** logo, not a generic pool clone.
- **Candystand Miniature Golf / Candystand Mini Golf Classic**, Skyworks Technologies, Inc., Shockwave, ID `83be04f3-975d-4a3b-9d7b-2f23b524849a`. Original launch path `candystand.com/shock/csmgmain.dcr`. The screenshot shows the branded miniature-golf course; archive notes distinguish the older multi-brand variant.
- A separate **Billiards** entry by Fuel Industries uses `games/billiards4/loader.dcr`; it should not be silently substituted for the requested Skyworks/Life Savers game.

Both requested entries are labelled playable **in Flashpoint**, which runs a Shockwave projector. This is not evidence that they already work as embedded modern-browser games. No Candystand binaries, obsolete browser plugin, Flashpoint installation or executables were installed or published in this change.

## Browser integration path to test next

DirPlayer is a current Rust/WebAssembly Shockwave emulator with an embeddable JavaScript polyfill: https://github.com/igorlira/dirplayer-rs . It is the relevant kind of runtime for these `.dcr` games; treating them as ordinary Flash `.swf` files is not enough.

Before adding live Start-menu entries: verify redistribution permission for the exact original game data; obtain the complete DCR/external-cast dependencies; test menus, aiming/power, computer opponent, every golf hole, sound, pause/close and mobile input in a isolated prototype. Preserve branding only for the actual originals. If emulation needs unsupported Director behavior, report that specifically rather than presenting a different game as Candystand. A launcher link or a recreation is a different feature and must be labelled as such.

Standalone preservation reference for Mini Golf: https://oneweakness.com/candy-stand-minigolf . Those archived downloads do not themselves grant permission to republish the game assets.
