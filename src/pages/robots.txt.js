import { getSiteOrigin } from '../utils/site.js';

export async function GET(context) {
  const site = getSiteOrigin(context.site);
  const lines = [
    'User-agent: *',
    'Allow: /',
    '',
    `Sitemap: ${new URL('/sitemap.xml', site).href}`,
  ];

  return new Response(lines.join('\n'), {
    headers: {
      'Content-Type': 'text/plain; charset=utf-8',
    },
  });
}
