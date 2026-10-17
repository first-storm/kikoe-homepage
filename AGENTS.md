# Kikoe Website Maintenance Guidelines

- Use `Kikoe — Home-html.zip` in the repository root as the visual reference. Preserve the existing English copy, colors, spacing, screenshots, and page structure. Production components use Astro and native CSS.
- Base product capabilities, installation methods, and links on the actual contents of `https://github.com/first-storm/Kikoe`. Verify upstream before updating download information; include only versions, platforms, and features that can be confirmed.
- Maintain shared metadata and installation commands in `src/site.ts`. Use its `local()` helper to generate internal paths that support subpath deployments.
- Maintain SEO and document scaffolding in `src/layouts/Base.astro`. When adding a public page, update sitemap routes and provide a unique title and accurate description. Keep 404 pages `noindex`.
- Builds without `SITE_URL` are previews and must remain `noindex` and blocked from crawling. Production builds must use a real public HTTPS URL. When changing URL handling, verify both root-path and subpath deployments.
- Keep page content, navigation, and download entry points usable without JavaScript. Interactions must support keyboards, visible focus, light and dark modes, and reduced-motion preferences. Show copy success only after the API succeeds.
- After changing screenshots or icons, run `npm run assets` to update the social image and touch icon. Preserve asset and font licenses.
- Before delivery, run `npm run check`, `npm test`, and `npm run build`. Playwright Chromium must be installed before the first browser test. Put temporary test output on the same filesystem as the repository to avoid Astro cross-filesystem asset move failures.
- Submit changes in complete, reviewable stages and stage only relevant source and documentation. Commit dependency lockfile changes when applicable; keep `dist`, browser screenshots, caches, and local environment files ignored. Review `git diff` and `git status` before committing.
