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

## Windows 98, Windows 2000 and Windows XP appearance

The additional archived Windows 2000 and Windows XP images come from https://archive.org/details/windows-wallpapers, specifically the `Windows 2000-Me.zip` and `Windows XP-Server 2003-Server 2003 R2.zip` collections. Only selected image files are included, not operating-system executables. Source archive URLs, exact members, original dimensions and SHA-256 hashes are in `wallpapers/environment-provenance.json`.

The Windows 2000 collection includes Windows 2000, Boiling Point, Chateau, Iceberg, Paradise and Gold Petals. The XP collection includes Bliss, Ascent, Autumn, Azul, Crystal, Red moon desert and Tulips. Most of these archive copies are 800 × 600; Iceberg is 800 × 527 and the Boiling Point texture is 163 × 293. They are unchanged archival copies, not 4K remasters. Small texture pictures are suitable for the Tile setting.

The Windows 98 Clouds image is the archived image distributed by the 98.js recreation at https://98.js.org/images/clouds.jpg. Its source and hash are in the same environment provenance file. Five other choices in the Windows 98 view reuse the inherited Windows/Plus! theme pictures already recorded in `wallpapers/provenance.json`; they are labelled as shared classic themes rather than exclusive Windows 98 assets.

Copyright in archived Windows artwork remains with Microsoft and the respective photographers/artists and rights holders. The images are not presented as public-domain, or as covered by the pinball engine’s MIT license. The site’s era-specific interface styles and desktop preview diagrams are CSS reimplementations, not extracted operating-system skins. No Windows font files are bundled.

## Classic Macintosh and Linux desktops

The System 7 and Mac OS 9 window treatments, menu bars and three grey/monochrome desktop patterns are CSS re-creations. They do not include Apple operating-system executables or font files. The three Mac OS 9 pictures are unmodified 2560 × 1920 exports served by Stephen Hackett's 512 Pixels Mac OS 9 archive/remaster project, not represented as untouched original system files. Original artwork belongs to Apple and its respective creators. Archive: https://512pixels.net/projects/mac-os-9-5k-wallpapers/ . Individual source URLs and hashes are in `wallpapers/platform-provenance.json`.

Ubuntu Lucid Lynx, Bosque TK and Warm Lights were extracted unchanged from the official Ubuntu `ubuntu-wallpapers_0.31.3.tar.gz` source package. The package licenses its images under Creative Commons Attribution 2.0. Its copyright/author notice and licence text are preserved in `wallpapers/licenses/ubuntu-copyright.txt` and `ubuntu-authors.txt`. Source: https://old-releases.ubuntu.com/ubuntu/pool/main/u/ubuntu-wallpapers/ubuntu-wallpapers_0.31.3.tar.gz .

KDE Default Blue (Qwertz), Blue Bend (Everaldo Coelho), and Triple Gears (Jörg Gastner) were extracted unchanged from the official KDE 3.5.10 source archive. The corresponding upstream CREDITS allow commercial and noncommercial use, distribution and modification; that notice is included in `wallpapers/licenses/kde-credits.txt`. Source: https://download.kde.org/Attic/3.5.10/src/kdebase-3.5.10.tar.bz2 .

The Macintosh, Ubuntu GNOME 2 and KDE Plastik-style browser shells are independently implemented CSS and JavaScript, not an emulated or installed operating system. Applications remain the existing timBuilds web accessories. No Apple, Canonical or KDE affiliation/endorsement is implied. Runtime wallpaper requests stay on this site's own origin; source URLs are provenance only.

## Release 7 games and power sequences

Solitaire, Reversi and Mini Golf are original browser implementations in this repository. Mini Golf uses nine original course layouts and canvas artwork, not Kolf or Microsoft Golf assets. Startup/shutdown graphics and sequences are CSS/HTML recreations of the selected desktop era; they are not recordings of the operating systems and do not boot or power off a real device. Existing wallpaper/game attribution remains unchanged.

## Release 9 project visuals

The public catalogue uses new 1200×700 captures/compositions of the user's projects. Live-site captures preserve their visible branding. Development/store fixtures are labelled as such, not represented as live users or current production data. North of the 6ix and Household Money use explicitly labelled design/concept studies; no personal financial amounts are disclosed. Lo-fi Lab uses an actual waveform of the user's original Harbor Lights composition, not the unrelated cover-track audio. Underlying screenshots may include map-provider attribution or existing project artwork; those attributions are preserved. Public output paths, labels, descriptions and SHA-256 hashes are recorded in media/provenance.json. Raw private source files and audio are not bundled.
