import { useMemo, useState } from 'react';
import InfiniteScroll from 'react-infinite-scroll-component';

const PAGE_SIZE = 4;

/** 渲染首页极简文章列表 */
export default function InfinitePostList({ posts }) {
  const [visibleCount, setVisibleCount] = useState(Math.min(PAGE_SIZE, posts.length));

  const visiblePosts = useMemo(() => posts.slice(0, visibleCount), [posts, visibleCount]);

  /** 加载下一页文章标题 */
  const loadMore = () => {
    setVisibleCount((count) => Math.min(count + PAGE_SIZE, posts.length));
  };

  return (
    <InfiniteScroll
      dataLength={visiblePosts.length}
      next={loadMore}
      hasMore={visiblePosts.length < posts.length}
      loader={<div className="infinite-status">加载更多...</div>}
      endMessage={<div className="infinite-status">已经到底了</div>}
    >
      <ul className="post-list">
        {visiblePosts.map((post) => (
          <li className="post-list-item" key={post.id}>
            <a className="post-link" href={post.url}>
              {post.title}
            </a>
          </li>
        ))}
      </ul>
    </InfiniteScroll>
  );
}
