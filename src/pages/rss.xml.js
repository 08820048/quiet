import rss from '@astrojs/rss';
import { getAllPosts } from '../utils/posts.js';
import { SITE_DESCRIPTION, SITE_NAME } from '../utils/site.js';

/** 生成 RSS 条目 */
export async function GET(context) {
  const posts = await getAllPosts();

  return rss({
    title: `${SITE_NAME} RSS`,
    description: SITE_DESCRIPTION,
    site: context.site,
    items: posts.map((post) => ({
      title: post.title,
      pubDate: post.publishedAt ?? post.sortDate,
      description: post.description,
      link: post.url,
    })),
  });
}
