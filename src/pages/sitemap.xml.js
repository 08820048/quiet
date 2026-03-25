import { getAllPosts, getTagEntries } from '../utils/posts.js';
import { getSiteOrigin } from '../utils/site.js';

const escapeXml = (value) =>
  value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/\"/g, '&quot;')
    .replace(/'/g, '&apos;');

export async function GET(context) {
  const site = getSiteOrigin(context.site);
  const [posts, tags] = await Promise.all([getAllPosts(), getTagEntries()]);

  const staticPaths = [
    { pathname: '/', lastmod: posts[0]?.sortDate },
    { pathname: '/archive', lastmod: posts[0]?.sortDate },
    { pathname: '/search', lastmod: posts[0]?.sortDate },
    { pathname: '/tags', lastmod: posts[0]?.sortDate },
    { pathname: '/projects' },
    { pathname: '/links' },
    { pathname: '/rss.xml', lastmod: posts[0]?.sortDate },
  ];

  const blogPaths = posts.map((post) => ({
    pathname: post.url,
    lastmod: post.updatedAt ?? post.publishedAt ?? post.sortDate,
  }));

  const tagPaths = tags.map((tag) => ({
    pathname: `/tags/${tag.slug}`,
    lastmod: tag.posts[0]?.updatedAt ?? tag.posts[0]?.publishedAt ?? tag.posts[0]?.sortDate,
  }));

  const allPaths = [...staticPaths, ...blogPaths, ...tagPaths];

  const urls = allPaths
    .map(({ pathname, lastmod }) => {
      const href = new URL(pathname, site).href;
      const lastmodXml = lastmod ? `<lastmod>${lastmod.toISOString()}</lastmod>` : '';
      return `  <url><loc>${escapeXml(href)}</loc>${lastmodXml}</url>`;
    })
    .join('\n');

  const xml = `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls}\n</urlset>`;

  return new Response(xml, {
    headers: {
      'Content-Type': 'application/xml; charset=utf-8',
    },
  });
}
