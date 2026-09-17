# timBuilds portfolio

A Windows 95-inspired portfolio in plain HTML, CSS and JavaScript. No package installation, application server, analytics service or hosted database is required.

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

Layout: `portfolio/template.html`. Styles: `portfolio/site.css`, `desktop.css`, `shell.css`, `wallpapers.css` and `breach.css`. Catalogue interactions: `portfolio/site.js`. Window management, desktop selection, wallpapers and the access puzzle are separate small scripts. All pixel icons and project-sketch SVGs are original illustrations. Project illustrations are labelled and are not represented as app screenshots. No Microsoft logo, proprietary icon pack or font file is bundled.

## Catalogue scope

The catalogue is a shallow, September 17, 2026 review of the connected repositories: project descriptions, root READMEs, relevant introductory project notes and public homepages. It is not a code audit. Recheck deployment status when updating a project. A live demo is not the same as a production business service.

The portfolio includes a public catalogue and a separately encrypted owner catalogue. Grit Athletics links to the coach-owned Cloudflare Pages website without depending on access to its transferred repository. The OpenHoops website/redirect repositories are represented by the OpenHoops entry; the two domain repositories represent one portfolio, not two different projects.

Private repositories remain private. Their entries include only high-level project descriptions, no private source links, internal evidence, user records, personal financial figures or configuration. The household dashboard is described generically. The public catalogue contains high-level descriptions only. Existing public research and source repositories remain public; moving a catalogue entry does not change its source repository permissions.

The existing `support@timbuilds.dev` address is reused. There is no contact-form endpoint: the mail buttons open the visitor's mail application. Public preferences (wallpaper, icon positions and window geometry) use localStorage. The access puzzle stores only its current layer number and random seed in sessionStorage; typed challenge responses are neither stored nor transmitted. Owner access uses a non-exportable CryptoKey in IndexedDB. Failure of storage or clipboard permissions does not block public browsing. No project activity is fetched from GitHub at runtime.

## Interaction checks

For optional automated browser checks, run `node tools/browser-check.mjs` with an installed Chrome/Chromium (or set `PORTFOLIO_CHROME`). It uses a separate temporary browser profile and a loopback-only static server, without touching normal browser sessions. Results go to ignored `.qa/`. `--capture-social` regenerates the social-sharing screenshot.

Check category filters, search and its empty state, sorting, grid/list layouts, project-detail modals (including Escape/outside dismissal), browser Back, direct project hashes, Start menu, multi-window focus and task switching, minimise/restore/maximise, contact copying, and wallpaper persistence. Auxiliary windows are non-modal and stay open when another window is selected. Check desktop, a 320 px phone layout and enlarged text. Static project descriptions and public links remain in HTML when scripts are disabled.

Rollback: revert the portfolio commit through the normal review/merge path and synchronise that revert to the second repository. Do not change domains or remove OpenHoops paths.

## Desktop and Locked folder

On screens wider than 820 px, the whole desktop is available: icons start 12 px from its top-left corner. Drag an empty area to draw a selection marquee, Ctrl/Shift-click to add to the selection, and drag a selected icon to move the group. A blank click clears the selection. Icons snap to a grid and remember positions locally. Double-click opens a shortcut; Enter and touchscreen taps also work. Arrow keys navigate icons; Alt + arrow keys move a selected group. Display settings provides Arrange icons on left and Reset My Projects. Pointer cancellation and window blur cancel active desktop gestures.

The window manager registers My Projects and independent About Tim, Say Hello, GitHub, Display, Help and Locked windows. Each has its own taskbar button, focus state, title-bar drag, edge/corner resizing, keyboard movement/resizing, maximise/restore, minimise and close. A taskbar click minimises the currently focused window; otherwise it restores or brings that window forward. Closing removes its task, reopening reuses its window identity rather than creating duplicates. Auxiliary windows are non-modal, do not lock the desktop and retain their contents while minimised. Project details still use the existing modal/hash navigation. Narrow screens retain the scrolling portfolio and use viewport-bounded auxiliary windows. The taskbar scrolls horizontally instead of overflowing the phone.

Display includes twelve original CSS wallpapers: Classic teal, Night shift, Olive desk, Deep space, After-hours arcade, Poolside tiles, Saved by the desktop, Bubble machine, Cloud nine, Circuit board, Desert sunset and Graphite 95. All have live thumbnail/monitor previews and retain the existing browser-local wallpaper preference. No remote imagery, font downloads, wallpaper accounts or animation loops are introduced.

Locked is below Experiments. Visitors enter an access-terminal puzzle, with no out-of-character “just for fun” banner. The first layer is deliberately easy. A correct response advances to another layer; an incorrect one stays on the current layer with its recovery hint. Twelve introductory layers lead into seeded procedural variations. There is no terminal success state and no path from challenge completion to the owner catalogue.

Nine challenge types cover hinted passphrases, shifted-letter fragments, distorted-text CAPTCHAs, absurd object-and-caption selection grids, boot-sequence memory, packet-routing mazes, arithmetic checksums, simultaneous response-policy checks and ordered sector defragmentation. Every layer has a hint. Visual challenges have labelled controls or text alternatives; the memory sequence supports reduced motion and its timers stop on minimise/close. Grids, sequence length and active DOM are bounded even as layer numbers increase. Typed responses exist only in the current input and are not copied into storage, URLs, logs or requests. The form has no action endpoint; its submit event is handled locally, and the existing CSP rejects external form submission. These are puzzle responses, not users’ actual account credentials.

The seven owner records are AES-256-GCM ciphertext in portfolio/locked.json. They are absent from the public projects.json, generated HTML, public filters and search. This moves catalogue cards, not the linked apps or their full source into this website. Web Crypto decrypts only with the private key. IndexedDB stores an imported, non-exportable CryptoKey; there is no fingerprint, IP allowlist, hardcoded password or owner=true bypass.

The owner catalogue and key live outside Git, in the user-local timbuilds-owner/catalogue.json directory (LOCALAPPDATA on Windows). Keep a private backup. Never upload that file or an enrollment URL. Run node tools/seal-locked.mjs locally after editing the owner records. To recognise this Chrome profile, run node tools/open-owner.mjs locally after deployment; --legacy enrolls the interim alternate domain. Enrollment validates the key, removes the fragment from the current history entry and remembers the browser key when storage is available. The two domains and separate browser profiles have separate storage. A browser with storage disabled gets session-only access, clearly labelled.

This is browser-held capability access, not hardware identity or a substitute for a server-backed account system. Anyone with the recovery file, control of an enrolled profile, a sufficiently privileged extension or same-origin script execution can use that access. To revoke old capabilities, rotate the key, reseal and re-enroll. Clearing site data removes recognition. Encryption cannot erase earlier public Git history, caches or source URLs. No repository visibility, domain, paid service or account setting is changed.

Verification: `node tools/test-challenges.mjs` checks 1,536 generated layers across nine types and three seeds, including valid/invalid responses, size bounds and maze reachability. `node tools/browser-check.mjs` and its `check-shell.mjs` helper exercise the first 24 layers through actual UI controls, check that no challenge network requests occur, and cover marquee/group selection, task switching, independent window geometry, 12 wallpapers, 320–3440 px layouts, scrolling, spoofed flags and storage-denied fallback. When the local owner file is available it also checks decryption, persistence, invalid keys and key removal, using a disposable Chrome profile. Owner secrets never enter screenshots, logs or the checked-in test fixtures.
