# Kikoe homepage

An Astro + TypeScript static website based on the design in `Kikoe — Home-html.zip`. It preserves the original English copy, screenshots, and light/dark color schemes. Page content is generated at build time and does not require React in the browser.

## Local development

Requires Node.js ≥ 22.22.0 (Node 24 recommended) and npm.

```sh
npm ci
npm run dev
```

The development URL is printed by the command, usually `http://localhost:4321/`.

```sh
npm run check       # Astro / TypeScript checks
npm run build       # Output to dist/
npm run preview     # Preview dist/, usually at http://localhost:4321/
```

## Production builds and deployment

Set the actual deployment URL in an environment variable or `.env`. Production builds require a public HTTPS URL:

```sh
SITE_URL=https://your-real-domain/ npm run build:production
```

For deployment under a subpath, include the deployment directory in the URL:

```sh
SITE_URL=https://your-real-domain/kikoe/ BASE_PATH=/kikoe/ npm run build:production
```

If `BASE_PATH` is not set, it is inferred from the path in `SITE_URL`; an explicitly set `BASE_PATH` takes precedence. `.env.example` documents the configuration. If you copy it, update or remove `BASE_PATH` to match your deployment directory. Assets, homepage links, canonical URLs, social image URLs, and the sitemap use the same prefix. Rebuild whenever the deployment directory changes.

Upload the **contents of `dist/`** to the root of your static hosting service or to the configured subdirectory. Install development dependencies in the build environment; production only needs the static files and does not require a Node.js server.

- Static hosting build command: `npm run build:production`; publish directory: `dist`; environment variable: `SITE_URL`. Set `BASE_PATH` for subpath deployments.
- On a self-managed server such as Nginx, return `404.html` with an HTTP 404 status for unknown paths. Do not rewrite every path to the homepage. Update the error-page location for subpath deployments.
- HTTPS hosting supports the Clipboard API; if it is unavailable, the page prompts users to copy manually.
- Do not set long-lived immutable caching for HTML. Hashed assets under `/_astro/` can be cached long-term. Add the appropriate prefix for custom subpaths.

A regular build without `SITE_URL` is for preview: it includes the full page content, but adds `noindex`, blocks crawling in `robots.txt`, and omits the canonical URL and sitemap. **Before launching or enabling indexing, run a production build with the real public URL.** The repository does not assume a domain or include production account configuration; local builds do not publish automatically. The workflow below can deploy to GitHub Pages.

## GitHub Pages

1. Push the repository to the `main` branch on GitHub.
2. In the repository, go to **Settings → Pages → Build and deployment → Source** and select **GitHub Actions**.
3. Run the workflow manually from **Actions → Deploy to GitHub Pages**, or push to `main` again to trigger a deployment.

`.github/workflows/pages.yml` runs checks and browser acceptance tests, builds the production `dist/`, then uploads and deploys it through the official GitHub Pages Actions. No `gh-pages` branch or personal access token is required. The deployment URL appears in the workflow's `github-pages` environment. Other branches and pull requests continue to use the existing CI checks and do not publish to Pages.

The workflow uses `base_url` and `base_path` returned by `actions/configure-pages` to set `SITE_URL` and `BASE_PATH` automatically. It supports project sites (`https://username.github.io/repository/`), user or organization root sites, and custom domains configured in Pages; no repository variables need to be entered manually. For a custom domain, configure the domain, DNS, and HTTPS in **Settings → Pages**, then run the deployment again so the canonical URL, social image, and sitemap are updated. No CNAME file is needed when publishing with Actions.

On a project site, the generated `robots.txt` is located at `/repository/robots.txt`, while search engines only read `robots.txt` at the domain root. The sitemap uses the full site URL and can be submitted directly in search-engine webmaster tools. For an independent robots policy, use a custom domain or a user/organization root site.

## SEO and performance

Production builds provide a title, description, canonical URL, Open Graph and Twitter metadata, WebSite / SoftwareApplication JSON-LD, `robots.txt`, `sitemap.xml`, and a `noindex` 404 page. The social image and icons ship with the static output. No version, rating, or review information is fabricated.

Screenshots are generated as responsive WebP images; the hero screenshots load with priority and feature screenshots are lazy-loaded. Inter is hosted locally, and its license is at `public/licenses/inter.txt`. The page supports semantic navigation, a skip link, visible focus indicators, system light/dark preferences, and locally remembered theme choices. Features and download links come from the upstream Kikoe project; the website itself does not record or upload audio.

## Verification

Install the test browser on first use:

```sh
npx playwright install chromium
# On Linux, if system libraries are missing, use: npx playwright install --with-deps chromium
npm test
```

Tests cover rejecting production builds without a public URL, preventing indexing of local previews, production SEO, subpath assets, desktop and mobile layouts, light and dark themes, menus and Escape, clipboard success and failure, reduced motion, operation without JavaScript, and 404 behavior.

Tests build in an isolated temporary directory on the current filesystem and clean it up automatically without overwriting `dist/`; browser screenshots are saved in the ignored `test-results/` directory. GitHub Actions runs checks, tests, and a regular preview build, then uploads the build output and screenshots. CI output is blocked from indexing by default; the GitHub Pages deployment workflow separately runs a production build using the real Pages URL. For other hosting platforms, set `SITE_URL` yourself before deployment.

## Maintenance

- `src/pages/index.astro`: homepage copy, feature data, and page composition.
- `src/site.ts`: site metadata, upstream URLs, install commands, and path utilities.
- `src/layouts/Base.astro`: SEO, document scaffolding, and browser interactions.
- `src/styles/global.css`: design tokens and responsive layout.
- `src/assets/`: source screenshots and app icon.

After adjusting the brand icon or hero screenshot, run `npm run assets` and commit the regenerated `public/social.png` and `public/apple-touch-icon.png`. Keep the design ZIP as a visual reference; production code does not load the design tool's vendor code, `support.js`, or component packages.

Submit project changes in reviewable stages. After making changes, run `npm run check`, `npm test`, and `npm run build`. Do not commit screenshots or build output.
