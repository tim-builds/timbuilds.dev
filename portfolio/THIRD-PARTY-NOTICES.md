# Desktop artwork and program credits

## Windows 95 Plus! wallpapers

The twelve `wallpapers/win95-*.jpg` pictures are archived Microsoft Windows 95 Plus! theme artwork, not newly generated interpretations. Sources and SHA-256 checksums are recorded individually in `wallpapers/provenance.json`.

Archive: https://archive.org/details/sc-wall (creator credited by the archive: Microsoft). Theme names include Dangerous Creatures, Inside Your Computer, Leonardo da Vinci, More Windows, Mystery, Nature, Science, Sports, The 60s USA, The Golden Era, Travel and Windows 95.

The downloaded archival JPEGs are 800 × 600 or 1024 × 768 pixels. Center and Tile retain the source size; Fit and Fill scale the image for the browser viewport. They are not described as native 4K, AI-upscaled, public-domain or covered by the software engine's MIT license. Copyright in this Microsoft artwork belongs to its respective rights holders.

The separate twelve CSS-pattern/gradient backgrounds and the site's pixel-art interface icons are original timBuilds illustrations. They are not represented as original Microsoft files.

## Pinball

Engine: https://github.com/k4zmu2a/SpaceCadetPinball — MIT; see `vendor/pinball/ENGINE-LICENSE.txt`.

Replacement table graphics and sounds: https://github.com/andrewnakas/open-cadet — CC0; see `vendor/pinball/CC0-LICENSE.txt` and `vendor/pinball/OPEN-CADET-NOTICE.md`. These are new Open Cadet assets, not the original Microsoft/Maxis/Cinematronics artwork or recordings.

The WebAssembly/JavaScript build and preload package were retrieved from https://www.exebrowser.com/apps/space-cadet/. All 48 substantive assets in the preload package were compared byte-for-byte with the Open Cadet source at commit `4ae332be705f86bfb62f8d8ac1dc1f11918977dd`. Binary hashes, individual asset hashes and source URLs are in `vendor/pinball/provenance.json`.

Only the runtime build and CC0 preload package are used. The upstream page wrapper, advertisements, analytics, save bridge and external scripts are not included. The desktop supplies its own local wrapper, touch controls, loading/error states, and minimise/close lifecycle. Pinball loads only when opened and requires a browser with WebGL available.

## Browser accessories

Notepad, Calculator, Paint, Minesweeper, clock/calendar, menus, shell folders, volume controls and the voluntary starfield screen saver are browser-based reimplementations written for this site. They do not run Windows executables or change the visitor's operating system. Notepad and Recycle Bin operate on browser-local notes; Paint exports only when Save PNG is chosen. Run accepts a fixed list of web-program names and does not execute shell commands.

Windows, Microsoft, Space Cadet and other product names are their respective owners' marks. This independent portfolio is not Microsoft software and is not affiliated with or endorsed by Microsoft, Maxis or Cinematronics.

The bundled browser runtime also includes Emscripten and SDL components; their notices are included as vendor/pinball/EMSCRIPTEN-LICENSE.txt and vendor/pinball/SDL-LICENSE.txt.
