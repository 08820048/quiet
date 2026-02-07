import path from 'node:path';
import { resolvePostSlug } from '../utils/slug.js';

const escapeXml = (value) =>
  value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/\"/g, '&quot;')
    .replace(/'/g, '&apos;');

export async function GET(context) {
  const site = context.site ?? new URL('https://example.com');
  const staticPaths = ['/', '/projects', '/links', '/rss.xml'];

  const blogModules = import.meta.glob('../content/blog/*.md', { eager: true });
  const blogPaths = Object.values(blogModules).map((mod) => {
    const fileName = path.basename(mod.file, path.extname(mod.file));
    const slug = resolvePostSlug(fileName);
    return `/blog/${slug}`;
  });

  const allPaths = [...new Set([...staticPaths, ...blogPaths])];

  const urls = allPaths
    .map((pathname) => {
      const href = new URL(pathname, site).href;
      return `  <url><loc>${escapeXml(href)}</loc></url>`;
    })
    .join('\n');

  const xml = `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls}\n</urlset>`;

  return new Response(xml, {
    headers: {
      'Content-Type': 'application/xml; charset=utf-8',
    },
  });
}
