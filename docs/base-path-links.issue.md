---
title: Fix root-relative links broken by site/base config (GitHub Pages subpath)
---

## Problem

The site is deployed to GitHub Pages as a project site, configured in [astro/astro.config.mjs](../astro/astro.config.mjs):

```js
site: "https://kea-dev.github.io",
base: "/kanban-starlight",
```

Served at `https://kea-dev.github.io/kanban-starlight/`. Astro/Starlight do not prepend `base` to hand-written root-relative URLs. The Starlight boilerplate contains such links, which resolve to `https://kea-dev.github.io/guides/example/` and return 404.

Known offender: [astro/src/content/docs/index.mdx](../astro/src/content/docs/index.mdx), hero action `link: /guides/example/`.

Not affected: `sidebar` entries using `slug`, and `autogenerate`; Starlight applies `base` to those.

## Solution

Make every internal link base-aware, with no hard-coded `/kanban-starlight` prefix in content.

1. Frontmatter hero actions (`index.mdx`): Starlight does not rewrite `hero.actions[].link`, so use the base-prefixed path: `/kanban-starlight/guides/example/`.
2. Markdown/MDX body links: use relative links (`../reference/example/`) which are base-independent.
3. Components/Astro files: use `import.meta.env.BASE_URL` for any root-relative URL.
4. Guard against regressions: a build-time check that fails on root-relative internal links lacking the base.

Preferred approach for 1: derive the prefix from one source of truth rather than duplicating the string. Since frontmatter cannot evaluate expressions, accept a single documented hard-coded prefix there, or move the hero to a component using `import.meta.env.BASE_URL`.

## Spec

### Requirements

- R1: Every internal link on the built site resolves with HTTP 200 under `https://kea-dev.github.io/kanban-starlight/`.
- R2: Changing `base` in `astro.config.mjs` requires edits in at most one additional place (the hero frontmatter), documented with a comment.
- R3: Local `astro dev` and `astro build` + `astro preview` both work with the base.
- R4: A check runs in CI and fails when a built HTML file contains an internal `href`/`src` starting with `/` but not with the base.

### Acceptance criteria

- Clicking "Example Guide" on the landing page opens `/kanban-starlight/guides/example/`.
- Logo, favicon, sidebar, search, and edit/social links work on the deployed site.
- The check in R4 passes on `main` and fails if `link: /guides/example/` is reintroduced.

### Out of scope

- Moving to a custom domain (which would remove `base`).
- Content rewrites beyond link fixes.

## Plan

- [ ] 1. Audit: grep `astro/src` for root-relative links (`](/`, `link: /`, `href="/`, `src="/`) and review `public/` references (favicon config). Only known hit so far is `index.mdx:11`.
- [ ] 2. Fix `index.mdx` hero link to `/kanban-starlight/guides/example/` with a one-line comment about `base`.
- [ ] 3. Check Starlight config for other root-relative values (`favicon`, `logo`, `customCss`, `head` entries) and make them base-aware.
- [ ] 4. Add a link check script (e.g. `astro/scripts/check-base-links.mjs`) that scans `dist/**/*.html` for `href="/` or `src="/` not starting with `/kanban-starlight/`; expose as `npm run check:links` in [astro/package.json](../astro/package.json).
- [ ] 5. Wire the check into the Pages build workflow after `astro build`.
- [ ] 6. Verify: `npm run build && npm run preview`, click through landing, guide, reference pages; confirm check passes.
- [ ] 7. Note the base-path rule in [astro/README.md](../astro/README.md) so new content follows it.

## Risks

- Hard-coded prefix in frontmatter drifts from `base`; mitigated by the R4 check.
- Future boilerplate upgrades may reintroduce root-relative links; the CI check catches this.
