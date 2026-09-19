# Private classic-game integration laboratory

This development tool is **not a public game release**. It loads operator-supplied, lawfully usable local movie files into a private copy of the timBuilds desktop. No game assets, emulator binaries, asset downloader, obsolete plugin, or third-party executable is included.

## Run

Create an ignored `.qa/classic-config.json` from `config.example.json`, replacing placeholder paths with the local files you are authorized to test. The `engine` directory must contain the upstream DirPlayer polyfill and its supporting files. The tested runtime is upstream v0.8.1. Configure any embedding parameters needed by that movie in the private configuration; do not patch checks out of the game.

```sh
node tools/classic-lab/serve.mjs .qa/classic-config.json 8796
node tools/classic-lab/check.mjs http://127.0.0.1:8796
```

Visit `http://127.0.0.1:8796/`. Local-only entries appear at the bottom of Programs; app IDs have a `lab-` prefix. They are not registered by the production website.

The check script uses a disposable Chrome profile, writes reports/screenshots only to `.qa/classic-integration/`, and closes its own browser. Set `PORTFOLIO_CHROME` to override the installed Chrome/Chromium path. Its supplied two-game assertions are integration tests, not full gameplay certification or permission clearance.

## Boundaries

The server binds only to `127.0.0.1`, rejects other Host headers, serves exact game-file allowlists, and never exposes private configuration paths to the page. The game iframe has `sandbox="allow-scripts"` without same-origin, forms, popups, or top-navigation permission. A restrictive content security policy permits its runtime requests only to the loopback server. Opaque-origin CORS is used for those local resources; this is not a production authentication system.

Emulator preferences live in an in-memory Storage shim inside the sandbox, rather than the desktop's storage. The message bridge accepts only the expected parent/source/origin and playback boolean. Window resizing scales a fixed logical frame, and closing the app removes its iframe and listeners. Debug messages are diagnostic only and must not be interpreted as commands.

Game permissions and engine licensing are separate. A successful test does not authorize public redistribution, and a simulated browser does not change that. Before publishing a DirPlayer-based implementation, comply with its GPL-3.0 license and corresponding-source obligations, and obtain the necessary game/branding authorization separately. These original adapter sources do not contain any decompiled game program.

Do not upload `.qa`, private archives, derived screenshots, or local configuration to GitHub or a public deployment. Keep Cloudflare migration work separate.
