export const SITE_NAME = 'Quiet';
export const SITE_DESCRIPTION = 'Minimal, fast, and geeky developer notes by XuYi.';
export const SITE_LOCALE = 'zh-CN';
export const SITE_OG_LOCALE = 'zh_CN';
export const SITE_AUTHOR = {
  name: 'XuYi',
  url: 'https://x.com/xuyixff',
};
export const SEARCH_PLACEHOLDER = 'Search posts, tags, and summaries...';
export const DEFAULT_OG_IMAGE_PATH = '/og-default.svg';

export const NAV_ITEMS = [
  { href: '/', label: 'Home' },
  { href: '/archive', label: 'Archive' },
  { href: '/search', label: 'Search' },
  { href: '/projects', label: 'Products' },
  { href: '/links', label: 'Links' },
  { href: '/rss.xml', label: 'Feed' },
];

export const getSiteOrigin = (site) => {
  if (site instanceof URL) {
    return site;
  }
  if (typeof site === 'string' && site) {
    return new URL(site);
  }
  return new URL('https://example.com');
};

export const getAbsoluteUrl = (pathname, site) => new URL(pathname, getSiteOrigin(site));
