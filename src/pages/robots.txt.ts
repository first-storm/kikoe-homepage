import type { APIRoute } from 'astro';
import { local } from '../site';
export const GET: APIRoute = ({ site }) => new Response(site
  ? `User-agent: *\nAllow: /\nSitemap: ${new URL(local('sitemap.xml'), site).href}\n`
  : 'User-agent: *\nDisallow: /\n', { headers: { 'Content-Type': 'text/plain; charset=utf-8' } });
