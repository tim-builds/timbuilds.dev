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

Layout: `portfolio/template.html`. Styles: `portfolio/site.css`. Interactions: `portfolio/site.js`. All pixel icons and project-sketch SVGs are original illustrations. Project illustrations are labelled and are not represented as app screenshots. No Microsoft logo, proprietary icon pack or font file is bundled.

## Catalogue scope

The catalogue is a shallow, September 17, 2026 review of the connected repositories: project descriptions, root READMEs, relevant introductory project notes and public homepages. It is not a code audit. Recheck deployment status when updating a project. A live demo is not the same as a production business service.

The portfolio covers the product, tool and research repositories under `flushatoilet`, plus this site. The OpenHoops website/redirect repositories are represented by the OpenHoops entry; the two domain repositories represent one portfolio, not two different projects.

Private repositories remain private. Their entries include only high-level project descriptions, no private source links, internal evidence, user records, personal financial figures or configuration. The household dashboard is described generically. The health-research entry is a research reference, not advice or a current provider endorsement. Public source links are limited to the already-public research repositories and this portfolio source.

The existing `support@timbuilds.dev` address is reused. There is no contact-form endpoint: the mail buttons open the visitor's mail application. The only persistence is a browser-local wallpaper preference; failure of storage or clipboard permissions does not block browsing. No project activity is fetched from GitHub at runtime.

## Interaction checks

For optional automated browser checks, run `node tools/browser-check.mjs` with an installed Chrome/Chromium (or set `PORTFOLIO_CHROME`). It uses a separate temporary browser profile and a loopback-only static server, without touching normal browser sessions. Results go to ignored `.qa/`. `--capture-social` regenerates the social-sharing screenshot.

Check category filters, search and its empty state, sorting, grid/list layouts, all project dialogs, Escape/outside dismissal, browser Back, direct project hashes, Start menu, minimise/restore/maximise, contact copying (including denied clipboard access), and wallpaper persistence. Check desktop, a 320 px phone layout and enlarged text. Static project descriptions and public links remain in HTML when scripts are disabled.

Rollback: revert the portfolio commit through the normal review/merge path and synchronise that revert to the second repository. Do not change domains or remove OpenHoops paths.
