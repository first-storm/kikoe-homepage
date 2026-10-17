import { loadEnv } from 'vite';
import { spawnSync } from 'node:child_process';
const env = { ...loadEnv('production', process.cwd(), ''), ...process.env };
if (!env.SITE_URL?.trim()) {
  console.error('Production builds require SITE_URL. Set it to the real public URL in your environment or .env.');
  process.exit(1);
}
const url = new URL(env.SITE_URL);
if (url.protocol !== 'https:' || ['localhost', '127.0.0.1', '::1'].includes(url.hostname) || url.hostname.endsWith('.example')) {
  throw new Error('Production SITE_URL must be a real public HTTPS URL.');
}
const result = spawnSync(process.execPath, ['node_modules/astro/bin/astro.mjs', 'build'], { stdio: 'inherit', env });
process.exit(result.status ?? 1);
