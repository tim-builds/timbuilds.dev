# Owner-only Candystand phone demo

This is a separate, temporary private runtime for issue #25. It does not add original games or a demo URL to the public timbuilds.dev site. Public-game compatibility and redistribution work in #21, #22 and #23 remains open.

## Security boundary

The gateway binds to **127.0.0.1 only**. Every request must have the exact configured HTTPS hostname and HTTPS forwarding indicator. All desktop, emulator, movie and cast files require authentication; an anonymous visitor can only see the login form. Hiding a menu or knowing the URL is not the access control.

The owner password is cryptographically random, 18 bytes encoded as base64url. Only its SHA-256 hash is used by the server. A successful login creates a 256-bit random Secure, HttpOnly, host-only, SameSite=Strict cookie. Sessions expire after 12 hours. Login is rate-limited and same-origin POST checks protect login/logout. Restarting the gateway invalidates every session.

The emulator runs in an opaque `sandbox="allow-scripts"` iframe without parent storage access. Because that sandbox cannot use the desktop cookie, it receives a separate random 256-bit capability limited to game/emulator frame resources. This is a credential, not a public share link. It expires and is revoked with its parent session. Do not publish full iframe URLs, browser network traces, screenshots containing URLs, login cookies or capability values.

All responses use no-store. Login pages use same-origin referrer policy so form POSTs retain an exact Origin; other resources use no-referrer; game resource CORS allows only the opaque `null` origin. Exact file allowlists prevent exposing private config, archives, Git history or arbitrary computer files. CSP limits emulator networking. These controls do not prevent an authenticated owner from deliberately sharing credentials or downloaded files.

## Current operator location

The active copy on Playground is `C:/Users/flushatoilet/Desktop/dev/lanes/site-private-phone-demo`. Runtime information, the assigned hostname, owner password, test evidence, and configuration are in ignored `.qa/private-demo/`. Do not commit or upload that directory. The game assets remain in the existing ignored single-repository-migration QA directory, referenced by exact paths in config; preserve those files while this demo is in use.

The Internet-facing instance uses a verified official `cloudflared` binary through a Cloudflare Quick Tunnel. This is **not Cloudflare Access**, email OTP, a Cloudflare Pages deployment, or a permanent custom domain. Quick Tunnels have no uptime guarantee. The machine must remain awake, online, and running both gateway and tunnel. Closing the shell that launched these detached processes does not intentionally stop them; restarting/sleeping the machine interrupts access. A new tunnel normally has a new URL.

The owner can use **Start > Programs > Candystand (Private)**, then choose Billiards or Miniature Golf. This folder is the last item below the public games in the private desktop only. Rotate the phone sideways and use Fullscreen. Touchpad mode supports slide-to-aim, Tap to click, and Hold / move / Release to drag; Direct touch is also available. Pause, Restart and Lock are provided. Lock revokes the current browser session and its game capabilities, but another separately signed-in browser has its own session.

## Start and stop

Prepare a private config by extending the classic-lab example with `ownerOnly: true`, `passwordHash` (SHA-256 of a generated random password) and `originFile` (path to a private text file containing the assigned HTTPS origin). Do not use a short human-chosen password with this hashing scheme. Keep privateTest true and the original exact game allowlists.

Run `node tools/private-demo/serve.mjs .qa/private-demo/config.json 8806`. The gateway refuses requests when the origin file is absent/invalid or the Host does not match; there is no unauthenticated startup phase. Start the verified cloudflared executable with `tunnel --url http://127.0.0.1:8806 --no-autoupdate --protocol http2`. Update the private origin file to the newly assigned HTTPS hostname. Do not add a Host-header override and do not point any tunnel at the unprotected classic-lab test server.

The active gateway/tunnel PIDs are in `.qa/private-demo/runtime.json`. Before stopping, verify each PID's executable/command still matches this worktree's gateway or cloudflared instance; do not kill all Node or Cloudflare processes. Stop only those two owned processes. Revoking access for everyone also requires stopping/restarting the gateway or rotating the password and restarting it.

No scheduled service or automatic PC-restart recovery is installed. No firewall inbound rule, DNS, mail, public-site settings, Supabase settings or other agent's worktree is changed.

## Verification

`node tools/private-demo/auth.test.mjs` exercises 61 checks: anonymous file denial, HTTPS/Host restrictions, login CSRF, secure-cookie flags, scoped opaque-frame capabilities, bad paths, expiry, logout revocation and rate limits.

`node tools/private-demo/https.test.mjs <private-config.json>` starts an independent loopback-only HTTPS fixture with a freshly generated **test-only** password and self-signed local certificate. It requires Chrome and OpenSSL. It uses the production gateway implementation, exercises the browser login/cookie/frame flow, and never uses the live owner password. Ports 8808 and 8810 must be free. It closes its own fixture and disposable browser. Certificate trust is relaxed only in that disposable test browser, not on the user's actual browser or system.

Separately verify the actual public HTTPS endpoint anonymously: homepage is login-only; direct game/cast/emulator/config URLs and guessed frame capabilities return 401; HTTP is rejected. Do not call a loopback fixture a hosted/physical-phone test. Do not weaken authentication to make a test pass.

The live owner's automated sign-in was blocked by the execution tool. Therefore the final live phone login/gameplay must be verified by the owner; local integration results do not claim that verification. Full completed matches/rounds, all rules, AI and audio fidelity are not certified.

## Permanent upgrade

After the owner authorizes Cloudflare, prefer a separate stable demo hostname with Access allowing only the owner's exact email via one-time PIN. Protect every route/asset and close any alternate origin or preview bypass before attaching a public-site launcher. Authentication must be set up before a private build is uploaded. The public-site migration and original-asset permission decisions remain separate scopes.