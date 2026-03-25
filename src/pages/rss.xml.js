import rss from '@astrojs/rss';
import path from 'node:path';
import { resolvePostSlug } from '../utils/slug.js';
import { resolvePostMetadata } from '../utils/postMetadata.js';

/** 生成 RSS 条目 */
export async function GET(context) {
  const modules = import.meta.glob('../content/blog/*.md', { eager: true });
  const items = await Promise.all(
    Object.values(modules).map(async (mod) => {
      const entry = mod;
      if (!entry || typeof entry !== 'object') {
        return null;
      }
      const typed = entry;
      const filePath = typed.file;
      if (!filePath) {
        return null;
      }
      const raw = await typed.rawContent();
      const frontmatter =
        typed.frontmatter && typeof typed.frontmatter === 'object' ? typed.frontmatter : {};
      const fileName = path.basename(filePath, path.extname(filePath));
      const { title, publishedAt, sortDate } = resolvePostMetadata(raw, frontmatter, fileName);
      const slug = resolvePostSlug(fileName);

      return {
        title,
        pubDate: publishedAt ?? sortDate ?? new Date(0),
        description: typeof frontmatter.description === 'string' ? frontmatter.description : '',
        link: `/blog/${slug}`,
      };
    })
  );

  const normalized = items.filter(Boolean);
  normalized.sort((a, b) => b.pubDate.valueOf() - a.pubDate.valueOf());

  return rss({
    title: '极简 Markdown 博客',
    description: '一个极简的 Markdown 技术博客',
    site: context.site,
    items: normalized,
  });
}
