import { useEffect, useMemo, useState } from "react";
import InfiniteScroll from "react-infinite-scroll-component";

const PAGE_SIZE = 24;

/** Render a minimal infinite-scrolling list of posts */
export default function InfinitePostList({ posts }) {
  const [query, setQuery] = useState(
    typeof window !== "undefined"
      ? (new URLSearchParams(window.location.search).get("q") ?? "")
      : "",
  );
  const [visibleCount, setVisibleCount] = useState(
    Math.min(PAGE_SIZE, posts.length),
  );

  const filteredPosts = useMemo(() => {
    const keyword = query.trim().toLowerCase();
    if (!keyword) {
      return posts;
    }
    return posts.filter((post) => post.title.toLowerCase().includes(keyword));
  }, [posts, query]);

  const visiblePosts = useMemo(
    () => filteredPosts.slice(0, visibleCount),
    [filteredPosts, visibleCount],
  );

  const loadMore = () => {
    setVisibleCount((count) =>
      Math.min(count + PAGE_SIZE, filteredPosts.length),
    );
  };

  useEffect(() => {
    setVisibleCount(Math.min(PAGE_SIZE, filteredPosts.length));
  }, [filteredPosts.length]);

  useEffect(() => {
    const handleSearchChange = (event) => {
      const nextQuery =
        typeof event.detail?.query === "string" ? event.detail.query : "";
      setQuery(nextQuery);
    };

    window.addEventListener("globalsearchchange", handleSearchChange);
    return () =>
      window.removeEventListener("globalsearchchange", handleSearchChange);
  }, []);

  return (
    <>
      {filteredPosts.length === 0 ? (
        <div className="infinite-status">No matching articles.</div>
      ) : (
        <InfiniteScroll
          dataLength={visiblePosts.length}
          next={loadMore}
          hasMore={visiblePosts.length < filteredPosts.length}
          loader={<div className="infinite-status">Loading more...</div>}
          endMessage={<div className="infinite-status">No more posts</div>}
        >
          <ul className="post-list">
            {visiblePosts.map((post) => (
              <li className="post-list-item" key={post.id}>
                <svg
                  className="post-item-icon"
                  viewBox="0 0 24 24"
                  aria-hidden="true"
                >
                  <path
                    d="M7 3h7l5 5v13H7z"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.7"
                  />
                  <path
                    d="M14 3v5h5"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.7"
                  />
                  <path
                    d="M10 13h6M10 17h6"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.7"
                  />
                </svg>
                <div className="post-list-content">
                  <a className="post-link" href={post.url}>
                    {post.title}
                  </a>
                  <time className="post-list-date" dateTime={post.updatedAtISO}>
                    {post.updatedAtLabel}
                  </time>
                </div>
              </li>
            ))}
          </ul>
        </InfiniteScroll>
      )}
    </>
  );
}
