import path from 'node:path';
import { resolvePostMetadata } from './postMetadata.js';
import { resolvePostSlug, slugifyText } from './slug.js';

const modules = import.meta.glob('../content/blog/*.md', { eager: true });

const buildSearchText = (post) =>
  [
    post.title,
    post.description,
    post.category,
    post.tags.join(' '),
    post.plainText.slice(0, 800),
  ]
    .filter(Boolean)
    .join('\n')
    .toLowerCase();

const postsPromise = Promise.all(
  Object.entries(modules).map(async ([moduleKey, mod]) => {
    const filePath = mod.file;
    const raw = await mod.rawContent();
    const frontmatter = mod.frontmatter && typeof mod.frontmatter === 'object' ? mod.frontmatter : {};
    const fileName = path.basename(filePath, path.extname(filePath));
    const slug = resolvePostSlug(fileName);
    const metadata = resolvePostMetadata(raw, frontmatter, fileName);
    const sortDate = metadata.sortDate ?? metadata.updatedAt ?? metadata.publishedAt ?? new Date(0);

    const post = {
      id: fileName,
      moduleKey,
      filePath,
      fileName,
      slug,
      url: `/blog/${slug}`,
      title: metadata.title,
      description: metadata.description,
      category: metadata.category,
      tags: metadata.tags,
      coverImage: metadata.coverImage,
      publishedAt: metadata.publishedAt,
      updatedAt: metadata.updatedAt,
      sortDate,
      sortValue: sortDate.valueOf(),
      plainText: metadata.plainText,
      readingMinutes: metadata.readingMinutes,
    };

    return {
      ...post,
      searchText: buildSearchText(post),
    };
  })
).then((posts) => posts.sort((a, b) => b.sortDate.valueOf() - a.sortDate.valueOf()));

export const getAllPosts = () => postsPromise;

export const getPostBySlug = async (slug) => {
  const posts = await getAllPosts();
  return posts.find((post) => post.slug === slug) ?? null;
};

export const getTagEntries = async () => {
  const posts = await getAllPosts();
  const map = new Map();

  posts.forEach((post) => {
    post.tags.forEach((tag) => {
      const key = tag;
      const existing = map.get(key) ?? {
        name: tag,
        slug: slugifyText(tag),
        count: 0,
        posts: [],
      };
      existing.count += 1;
      existing.posts.push(post);
      map.set(key, existing);
    });
  });

  return Array.from(map.values()).sort((a, b) => {
    if (b.count !== a.count) {
      return b.count - a.count;
    }
    return a.name.localeCompare(b.name, 'zh-CN');
  });
};

export const getTagEntryBySlug = async (slug) => {
  const tags = await getTagEntries();
  return tags.find((tag) => tag.slug === slug) ?? null;
};

export const getArchiveGroups = async () => {
  const posts = await getAllPosts();
  const groups = new Map();

  posts.forEach((post) => {
    const year = String((post.updatedAt ?? post.publishedAt ?? post.sortDate).getUTCFullYear());
    const existing = groups.get(year) ?? [];
    existing.push(post);
    groups.set(year, existing);
  });

  return Array.from(groups.entries())
    .sort((a, b) => Number(b[0]) - Number(a[0]))
    .map(([year, yearPosts]) => ({
      year,
      posts: yearPosts,
    }));
};

export const getRelatedPosts = async (targetPost, limit = 3) => {
  const posts = await getAllPosts();

  return posts
    .filter((post) => post.slug !== targetPost.slug)
    .map((post) => {
      let score = 0;
      if (targetPost.category && post.category === targetPost.category) {
        score += 2;
      }
      const sharedTags = post.tags.filter((tag) => targetPost.tags.includes(tag)).length;
      score += sharedTags * 3;
      return { post, score };
    })
    .filter((entry) => entry.score > 0)
    .sort((a, b) => {
      if (b.score !== a.score) {
        return b.score - a.score;
      }
      return b.post.sortDate.valueOf() - a.post.sortDate.valueOf();
    })
    .slice(0, limit)
    .map((entry) => entry.post);
};
