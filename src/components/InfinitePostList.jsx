import { useEffect, useMemo, useState } from 'react';
import InfiniteScroll from 'react-infinite-scroll-component';

const PAGE_SIZE = 4;

/** Render a minimal infinite-scrolling list of posts */
export default function InfinitePostList({ posts }) {
  const [visibleCount, setVisibleCount] = useState(posts.length);

  const visiblePosts = useMemo(() => posts.slice(0, visibleCount), [posts, visibleCount]);

  const loadMore = () => {
    setVisibleCount((count) => Math.min(count + PAGE_SIZE, posts.length));
  };

  useEffect(() => {
    setVisibleCount(posts.length);
  }, [posts.length]);

  return (
    <InfiniteScroll
      dataLength={visiblePosts.length}
      next={loadMore}
      hasMore={visiblePosts.length < posts.length}
      loader={<div className="infinite-status">Loading more...</div>}
      endMessage={<div className="infinite-status">No more posts</div>}
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
