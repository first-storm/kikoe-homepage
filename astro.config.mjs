import { defineConfig } from 'astro/config';
import { loadEnv } from 'vite';
import { rm } from 'node:fs/promises';
const env = { ...loadEnv(process.env.NODE_ENV ?? 'production', process.cwd(), ''), ...process.env };
const site = env.SITE_URL?.trim() || undefined;
if (site) {
  const url = new URL(site);
  if (!['https:', 'http:'].includes(url.protocol) || url.search || url.hash || url.username || url.password) {
    throw new Error('SITE_URL must be a public HTTP(S) URL without query, hash, or credentials.');
  }
}
const base = env.BASE_PATH || (site ? new URL(site).pathname : '/');
if (!base.startsWith('/') || base.includes('..') || /[?#]/.test(base)) throw new Error('BASE_PATH must be an absolute URL path.');
export default defineConfig({
  site, base, output: 'static', trailingSlash: 'always',
  integrations: [{
    name: 'omit-unconfigured-sitemap',
    hooks: { 'astro:build:done': async ({ dir }) => { if (!site) await rm(new URL('sitemap.xml', dir), { force: true }); } },
  }],
});
