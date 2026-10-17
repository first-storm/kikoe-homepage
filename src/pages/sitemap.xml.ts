import type { APIRoute } from 'astro';
import { local } from '../site';
export const GET: APIRoute = ({ site }) => {
  const url = site ? new URL(local(), site).href.replace(/&/g,'&amp;').replace(/</g,'&lt;') : undefined;
  return new Response(`<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">${url ? `<url><loc>${url}</loc></url>` : ''}</urlset>\n`, { headers: { 'Content-Type': 'application/xml; charset=utf-8' } });
};
