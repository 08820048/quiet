import rss from '@astrojs/rss';
import path from 'node:path';
import { stat } from 'node:fs/promises';
import { resolvePostSlug } from '../utils/slug.js';

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
      const fileStat = await stat(filePath);
      const raw = await typed.rawContent();
      const frontmatter =
        typed.frontmatter && typeof typed.frontmatter === 'object' ? typed.frontmatter : {};
      const fileName = path.basename(filePath, path.extname(filePath));
      const titleFromContent = raw
        .split('\n')
        .map((line) => line.trim())
        .find((line) => line.startsWith('# '))
        ?.replace(/^#\s+/, '');
      const title =
        (typeof frontmatter.title === 'string' ? frontmatter.title : undefined) ??
        titleFromContent ??
        fileName;
      const pubDate =
        frontmatter.date instanceof Date
          ? frontmatter.date
          : frontmatter.date
            ? new Date(String(frontmatter.date))
            : fileStat.mtime;
      const slug = resolvePostSlug(fileName);

      return {
        title,
        pubDate,
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
