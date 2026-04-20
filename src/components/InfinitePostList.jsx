import { startTransition, useDeferredValue, useEffect, useMemo, useState } from "react";
import InfiniteScroll from "react-infinite-scroll-component";

const PAGE_SIZE = 24;

const buildTokens = (value) =>
  value
    .trim()
    .toLowerCase()
    .split(/\s+/)
    .filter(Boolean);

const getMatchScore = (post, tokens) => {
  let score = 0;
  const title = post.title.toLowerCase();
  const description = (post.description ?? "").toLowerCase();
  const category = (post.category ?? "").toLowerCase();
  const searchText = (post.searchText ?? "").toLowerCase();
  const tags = Array.isArray(post.tags) ? post.tags.map((tag) => tag.toLowerCase()) : [];

  tokens.forEach((token) => {
    if (title.includes(token)) score += 8;
    if (category.includes(token)) score += 4;
    if (tags.some((tag) => tag.includes(token))) score += 5;
    if (description.includes(token)) score += 3;
    if (searchText.includes(token)) score += 1;
  });

  return score;
};

/** Render a minimal infinite-scrolling list of posts */
export default function InfinitePostList({
  posts,
  showPreview = false,
  showResultSummary = false,
}) {
  const [query, setQuery] = useState(
    typeof window !== "undefined"
      ? (new URLSearchParams(window.location.search).get("q") ?? "")
      : "",
  );
  const [visibleCount, setVisibleCount] = useState(
    Math.min(PAGE_SIZE, posts.length),
  );
  const deferredQuery = useDeferredValue(query);

  const filteredPosts = useMemo(() => {
    const tokens = buildTokens(deferredQuery);
    if (tokens.length === 0) {
      return posts;
    }
    return posts
      .map((post) => ({
        post,
        score: getMatchScore(post, tokens),
      }))
      .filter((entry) => entry.score > 0)
      .sort((a, b) => {
        if (b.score !== a.score) {
          return b.score - a.score;
        }
        return (b.post.dateValue ?? 0) - (a.post.dateValue ?? 0);
      })
      .map((entry) => entry.post);
  }, [deferredQuery, posts]);

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
      startTransition(() => {
        setQuery(nextQuery);
      });
    };

    window.addEventListener("globalsearchchange", handleSearchChange);
    return () =>
      window.removeEventListener("globalsearchchange", handleSearchChange);
  }, []);

  return (
    <>
      {showResultSummary ? (
        <div className="infinite-summary">
          <span>{filteredPosts.length} results</span>
          {deferredQuery.trim() ? <span>for “{deferredQuery.trim()}”</span> : null}
        </div>
      ) : null}
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
                  <div className="post-list-heading">
                    <a className="post-link" href={post.url}>
                      {post.title}
                    </a>
                    <time className="post-list-date" dateTime={post.updatedAtISO}>
                      {post.updatedAtLabel}
                    </time>
                  </div>
                  {showPreview ? (
                    <>
                      {post.description ? (
                        <p className="post-list-description">{post.description}</p>
                      ) : null}
                    </>
                  ) : null}
                </div>
              </li>
            ))}
          </ul>
        </InfiniteScroll>
      )}
    </>
  );
}
