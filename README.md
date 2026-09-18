# timBuilds portfolio

A switchable Windows 95 / 98 / 2000 / XP-inspired portfolio in plain HTML, CSS and JavaScript. Windows 2000 is the default. No package installation, application server, analytics service or hosted database is required.

## Where it lives

The existing host is **GitHub Pages**, publishing `main` from the repository root. DNS is managed in Cloudflare; Cloudflare is not the website build host.

There are two repositories because the domain migration is unfinished:

- `tim-builds/site` serves `tim-builds.dev` and remains the authoring source under the existing interim migration procedure.
- `tim-builds/timbuilds.dev` serves `timbuilds.dev`. Synchronise the source history into it with an ordinary merge while preserving that repository's `CNAME`.

Do not change either domain's CNAME, DNS, mail settings or hosting settings for routine portfolio updates. Do not turn either site into a redirect as part of a portfolio edit. The existing migration procedure lives in OpenHoops' `docs/DOMAIN-MIGRATION.md`.

The portfolio changes only the root page and its own `portfolio/` assets. Existing `openhoops/`, `.well-known/` and `legacy-stubs/` files continue to serve unchanged. In particular, password recovery, app links, privacy, terms and account deletion are separate from this portfolio.

## Edit the portfolio

1. Update `portfolio/projects.json` for project titles, descriptions, categories, statuses and links.
2. Run `node tools/build-portfolio.mjs` to regenerate the checked-in `index.html`.
3. Run `node tools/build-portfolio.mjs --check` and `node tools/verify-portfolio.mjs`.
4. Check `node --check portfolio/site.js` and preview on a local static web server.
5. Review and merge the change. Pages serves the committed files directly. Then synchronise through the existing second-repository process.

Layout: `portfolio/template.html`. Styles: `portfolio/site.css`, `desktop.css`, `shell.css`, `wallpapers.css`, `breach.css`, `classic-apps.css` and `environments.css`. Catalogue interactions: `portfolio/site.js`. Window management, desktop selection, wallpapers and the access puzzle are separate small scripts. All pixel icons and project-sketch SVGs are original illustrations. The Windows 95 Plus! wallpaper archive and Open Cadet game have separate sources and notices in portfolio/THIRD-PARTY-NOTICES.md. Project illustrations are labelled and are not represented as app screenshots. The archived wallpapers include Microsoft artwork and branding; no proprietary icon pack or font file is bundled.

## Catalogue scope

The catalogue is a shallow, September 17, 2026 review of the connected repositories: project descriptions, root READMEs, relevant introductory project notes and public homepages. It is not a code audit. Recheck deployment status when updating a project. A live demo is not the same as a production business service.

The portfolio includes a public catalogue and a separately encrypted owner catalogue. Grit Athletics links to the coach-owned Cloudflare Pages website without depending on access to its transferred repository. The OpenHoops website/redirect repositories are represented by the OpenHoops entry; the two domain repositories represent one portfolio, not two different projects.

Private repositories remain private. Their entries include only high-level project descriptions, no private source links, internal evidence, user records, personal financial figures or configuration. The household dashboard is described generically. The public catalogue contains high-level descriptions only. Existing public research and source repositories remain public; moving a catalogue entry does not change its source repository permissions.

The existing `support@timbuilds.dev` address is reused. There is no contact-form endpoint: the mail buttons open the visitor's mail application. Public preferences (selected Windows version, a separate wallpaper and placement for each version, icon positions, window geometry and optional sound settings) use localStorage. Browser Notepad and its Recycle Bin also use localStorage; these notes are never uploaded. Paint stays in memory unless the visitor explicitly exports a PNG. The access puzzle stores only its current layer number and random seed in sessionStorage; typed challenge responses are neither stored nor transmitted. Owner access uses a non-exportable CryptoKey in IndexedDB. Failure of storage or clipboard permissions does not block public browsing. No project activity is fetched from GitHub at runtime.

## Interaction checks

For optional automated browser checks, run `node tools/browser-check.mjs` with an installed Chrome/Chromium (or set `PORTFOLIO_CHROME`). It uses a separate temporary browser profile and a loopback-only static server, without touching normal browser sessions. Results go to ignored `.qa/`. `--capture-social` regenerates the social-sharing screenshot.

Check category filters, search and its empty state, sorting, grid/list layouts, project-detail modals (including Escape/outside dismissal), browser Back, direct project hashes, Start menu, multi-window focus and task switching, minimise/restore/maximise, contact copying, and wallpaper persistence. Auxiliary windows are non-modal and stay open when another window is selected. Check desktop, a 320 px phone layout and enlarged text. Static project descriptions and public links remain in HTML when scripts are disabled.

Rollback: revert the portfolio commit through the normal review/merge path and synchronise that revert to the second repository. Do not change domains or remove OpenHoops paths.

## Desktop and Locked folder

On screens wider than 820 px, the whole desktop is available: icons start 12 px from its top-left corner. Drag an empty area to draw a selection marquee, Ctrl/Shift-click to add to the selection, and drag a selected icon to move the group. A blank click clears the selection. Icons snap to a grid and remember positions locally. Double-click opens a shortcut; Enter and touchscreen taps also work. Arrow keys navigate icons; Alt + arrow keys move a selected group. Display settings provides Arrange icons on left and Reset My Projects. Pointer cancellation and window blur cancel active desktop gestures.

The window manager registers My Projects and independent About Tim, Say Hello, GitHub, Display, Help and Locked windows. Each has its own taskbar button, focus state, title-bar drag, edge/corner resizing, keyboard movement/resizing, maximise/restore, minimise and close. A taskbar click minimises the currently focused window; otherwise it restores or brings that window forward. Closing removes its task, reopening reuses its window identity rather than creating duplicates. Auxiliary windows are non-modal, do not lock the desktop and retain their contents while minimised. Project details still use the existing modal/hash navigation. Narrow screens retain the scrolling portfolio and use viewport-bounded auxiliary windows. The taskbar scrolls horizontally instead of overflowing the phone.

Display shows a wallpaper collection for the selected Windows version, followed by twelve separately labelled original CSS backgrounds. Windows 95 has twelve Plus! archive pictures; Windows 98 has Clouds and five inherited classic theme choices; Windows 2000 has six archive pictures and a solid-blue option; XP has seven archive pictures including Bliss. The archived images are self-hosted at their source resolution, with Fit, Fill, Center and Tile placement. All options have live thumbnail/monitor previews and retain browser-local preferences. No remote runtime image requests, font downloads or wallpaper accounts are used.

Locked is below Experiments. Visitors enter an access-terminal puzzle, with no out-of-character “just for fun” banner. The first layer is deliberately easy. A correct response advances to another layer; an incorrect one stays on the current layer with its recovery hint. Twelve introductory layers lead into seeded procedural variations. There is no terminal success state and no path from challenge completion to the owner catalogue.

Nine challenge types cover hinted passphrases, shifted-letter fragments, distorted-text CAPTCHAs, absurd object-and-caption selection grids, boot-sequence memory, packet-routing mazes, arithmetic checksums, simultaneous response-policy checks and ordered sector defragmentation. Every layer has a hint. Visual challenges have labelled controls or text alternatives; the memory sequence supports reduced motion and its timers stop on minimise/close. Grids, sequence length and active DOM are bounded even as layer numbers increase. Typed responses exist only in the current input and are not copied into storage, URLs, logs or requests. The form has no action endpoint; its submit event is handled locally, and the existing CSP rejects external form submission. These are puzzle responses, not users’ actual account credentials.

The seven owner records are AES-256-GCM ciphertext in portfolio/locked.json. They are absent from the public projects.json, generated HTML, public filters and search. This moves catalogue cards, not the linked apps or their full source into this website. Web Crypto decrypts only with the private key. IndexedDB stores an imported, non-exportable CryptoKey; there is no fingerprint, IP allowlist, hardcoded password or owner=true bypass.

The owner catalogue and key live outside Git, in the user-local timbuilds-owner/catalogue.json directory (LOCALAPPDATA on Windows). Keep a private backup. Never upload that file or an enrollment URL. Run node tools/seal-locked.mjs locally after editing the owner records. To recognise this Chrome profile, run node tools/open-owner.mjs locally after deployment; --legacy enrolls the interim alternate domain. Enrollment validates the key, removes the fragment from the current history entry and remembers the browser key when storage is available. The two domains and separate browser profiles have separate storage. A browser with storage disabled gets session-only access, clearly labelled.

This is browser-held capability access, not hardware identity or a substitute for a server-backed account system. Anyone with the recovery file, control of an enrolled profile, a sufficiently privileged extension or same-origin script execution can use that access. To revoke old capabilities, rotate the key, reseal and re-enroll. Clearing site data removes recognition. Encryption cannot erase earlier public Git history, caches or source URLs. No repository visibility, domain, paid service or account setting is changed.

Verification: `node tools/test-challenges.mjs` checks 1,536 generated layers across nine types and three seeds, including valid/invalid responses, size bounds and maze reachability. `node tools/browser-check.mjs` and its `check-shell.mjs` helper exercise the first 24 layers through actual UI controls, check that no challenge network requests occur, and cover marquee/group selection, task switching, independent window geometry, version-specific wallpaper options, 320–3440 px layouts, scrolling, spoofed flags and storage-denied fallback. When the local owner file is available it also checks decryption, persistence, invalid keys and key removal, using a disposable Chrome profile. Owner secrets never enter screenshots, logs or the checked-in test fixtures.

## Classic accessories (desktop release 4)

Click the clock for Date/Time Properties: a live local clock, month navigation, date selection and Today. It cannot change the computer clock. Right-click the desktop, icons, title bars, taskbar buttons and clock for contextual menus. Shift-right-click retains the browser menu; the Menu key and Shift+F10 work on the shell controls. Ctrl+Escape opens Start; Alt+F6 cycles open windows. Taskbar context options cascade/tile windows, show the desktop and restore the previous set.

Start has Programs and Settings submenus plus Run and Shut Down. Run uses an explicit web-program allowlist; it never executes shell commands. My Computer, Accessories, Games and Control Panel are local shell folders. Extra desktop shortcuts expose the accessories, Minesweeper, Pinball and Recycle Bin. Existing portfolio icons, owner access and access-terminal challenges remain separate and unchanged.

Notepad provides browser-local autosave, Open text file, Save .txt, selection, wrapping and reversible browser-note recycling. File pickers read only the visitor-selected text file (maximum 1 MB). New/recycle first saves the previous text to the local Recycle Bin; quota errors preserve the current note. Emptying the browser bin needs a second confirmation and never touches device files. Paint provides pencil/brush/eraser, lines, rectangles and ellipses, twelve-step undo/redo and explicit PNG export. Closing Paint discards the in-memory drawing, as its interface states. Calculator supports standard arithmetic, memory, percent, square root, reciprocal and keyboard input. Minesweeper has beginner/intermediate boards, safe first clicks, flood reveal, flags, chording, keyboard navigation and a touch flag toggle. Its timer pauses while minimised.

Pinball is the MIT SpaceCadetPinball engine with verified CC0 Open Cadet replacement graphics and audio, self-hosted and loaded on demand. All 48 data/sound files in the preload package were verified against the pinned upstream commit. It has keyboard/touch launch and flipper controls, new game, pause and optional sound, pauses on minimise/hidden tab, and unloads the iframe on close. It requires WebGL; unsupported browsers get an explicit message. The parent portfolio retains its strict CSP; only the game document allows WebAssembly compilation. No upstream tracking/advertising/save wrapper is shipped. See the bundled notices and provenance, including the prebuilt-engine source URL and hashes.

The twelve archived Microsoft Windows 95 Plus! images are 800×600 or 1024×768, not claimed as 4K remasters or public-domain. Center and Tile use original dimensions; Fit and Fill scale them. Display preserves previously saved preferences. The optional starfield screen saver and safe-to-close-tab screen are confined to the web page, exit by keyboard/pointer and do not change real power or lock settings. Sound is opt-in.

Validation: node tools/test-accessories.mjs covers calculator scenarios and 250 deterministic minefields; node tools/test-challenges.mjs retains the 1,536-layer checks. node tools/browser-check.mjs exercises actual mouse, keyboard, file-state and rendering behaviour through an isolated Chrome profile. QA enables software WebGL in that disposable profile for the VM; it does not modify the user’s Chrome settings. Browser tests include original-image decoding, Paint stroke/undo, live pinball rendering, local-only runtime requests, close/minimise lifecycle, context menus, clock/calendar, Start/Run, note recycle/restore, narrow viewports and unchanged owner encryption.

## Four Windows environments (desktop release 5)

Windows 2000 is the initial environment for new visitors and existing visitors who have not selected a version. Existing old-style wallpaper preferences migrate into the Windows 95 profile only; they do not override the new 2000 default. After a visitor explicitly chooses a version, that choice wins on subsequent visits. Each version independently remembers its wallpaper and Fit/Fill/Center/Tile placement in timbuilds.environment.v1. Invalid or blocked storage does not prevent browsing; it falls back to 2000 and permits in-session changes.

Switch via Start → Windows version, Start → Settings → Windows version (classic layouts), Display Properties’ version selector/Appearance button, Control Panel, the taskbar version badge, the desktop or taskbar context menu, or Run → winver. Windows XP uses a two-column Start menu with All Programs and Switch Windows. The current Windows version is also reflected in System Properties and the small desktop caption.

Skins update window frames, title bars, active/inactive states, taskbar, Start button, menus, controls and explorer sidebars. Windows 95 uses flat navy and grey, 98 uses classic grey with a navy/light-blue gradient, 2000 uses professional grey and a subdued blue gradient, and XP uses rounded Luna-blue windows, orange-red Close buttons, a green Start button and a two-column menu. These are web reimplementations, not OS images or booted virtual machines.

Switching is immediate without navigation or reload. Mounted app bodies and their state are preserved, including unsaved Notepad text, Paint pixels, a started Minesweeper board, a running pinball iframe and the encrypted owner catalogue. The shared window manager recomputes bounds when the taskbar height changes. No owner key, account, project link, domain setting or operating-system setting is changed.

Theme metadata and allowlisted wallpaper paths live in portfolio/environment-data.js. The small synchronous portfolio/versions.js applies saved appearance before first paint; its static HTML/CSS fallback is Windows 2000. portfolio/environments.css is the last theme stylesheet. portfolio/start-menus.js defines era-specific menu markup and environment-ui.js supplies the picker. Wallpaper data is local and does not request third-party content at runtime. New image sources, dimensions and SHA-256 hashes live in wallpapers/environment-provenance.json. Shared Windows 98 theme pictures are labelled as shared, not claimed as exclusive Windows 98 assets. Original archive images are not AI-upscaled or described as modern native-resolution remasters.

Tests: node tools/test-environments.mjs validates defaulting, preference migration, allowlists, isolated per-version persistence and storage-denied fallbacks. Browser checks additionally cover actual wallpaper decoding, all four Start menus, keyboard switching, 320–3440 px layouts, app-state retention, window controls under every skin, and owner/pinball continuity while switching.
