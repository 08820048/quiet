function ready(fn) {
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", fn, { once: true });
    return;
  }
  fn();
}

function initThemeAndSearch() {
  const themeToggle = document.getElementById("theme-toggle");
  const themeWordmark = document.getElementById("theme-transition-wordmark");
  const headerSearch = document.getElementById("header-search");
  const hasSearch = document.body.classList.contains("has-search");
  let isThemeTransitionRunning = false;
  let themeWordmarkHideTimer = null;
  const syncSearch = (value) => {
    window.dispatchEvent(
      new CustomEvent("globalsearchchange", {
        detail: { query: value },
      }),
    );
  };
  const isTypingTarget = (target) =>
    target instanceof HTMLElement &&
    Boolean(
      target.closest(
        'input, textarea, select, [contenteditable="true"], [contenteditable=""]',
      ),
    );

  const applyTheme = (theme) => {
    const resolvedTheme = theme === "dark" ? "dark" : "light";
    document.documentElement.dataset.theme = resolvedTheme;
    localStorage.setItem("theme", resolvedTheme);
    if (themeToggle) {
      themeToggle.textContent = resolvedTheme === "dark" ? "light" : "dark";
      themeToggle.setAttribute(
        "aria-label",
        resolvedTheme === "dark"
          ? "Switch to light mode"
          : "Switch to dark mode",
      );
      themeToggle.setAttribute(
        "title",
        resolvedTheme === "dark" ? "Switch to light mode" : "Switch to dark mode",
      );
    }
  };

  const shouldReduceMotion = () =>
    window.matchMedia?.("(prefers-reduced-motion: reduce)")?.matches ?? false;

  const showThemeWordmark = () => {
    if (!(themeWordmark instanceof HTMLElement)) {
      return;
    }
    if (themeWordmarkHideTimer) {
      window.clearTimeout(themeWordmarkHideTimer);
      themeWordmarkHideTimer = null;
    }
    themeWordmark.hidden = false;
    themeWordmark.classList.add("is-visible");
  };

  const hideThemeWordmark = (delay = 0) => {
    if (!(themeWordmark instanceof HTMLElement)) {
      return;
    }
    if (themeWordmarkHideTimer) {
      window.clearTimeout(themeWordmarkHideTimer);
    }
    themeWordmarkHideTimer = window.setTimeout(() => {
      themeWordmark.classList.remove("is-visible");
      themeWordmark.hidden = true;
      themeWordmarkHideTimer = null;
    }, delay);
  };

  const getThemeToggleOrigin = (event) => {
    if (
      typeof event?.clientX === "number" &&
      typeof event?.clientY === "number" &&
      (event.clientX !== 0 || event.clientY !== 0)
    ) {
      return { x: event.clientX, y: event.clientY };
    }

    if (themeToggle instanceof HTMLElement) {
      const rect = themeToggle.getBoundingClientRect();
      return {
        x: rect.left + rect.width / 2,
        y: rect.top + rect.height / 2,
      };
    }

    return {
      x: window.innerWidth,
      y: 0,
    };
  };

  const animateThemeChange = async (nextTheme, event) => {
    if (shouldReduceMotion()) {
      applyTheme(nextTheme);
      return;
    }

    if (typeof document.startViewTransition !== "function") {
      showThemeWordmark();
      applyTheme(nextTheme);
      hideThemeWordmark(420);
      return;
    }

    const { x, y } = getThemeToggleOrigin(event);
    const endRadius = Math.hypot(
      Math.max(x, window.innerWidth - x),
      Math.max(y, window.innerHeight - y),
    );

    const transition = document.startViewTransition(() => {
      applyTheme(nextTheme);
      showThemeWordmark();
    });

    try {
      await transition.ready;
      document.documentElement.animate(
        {
          clipPath: [
            `circle(0px at ${x}px ${y}px)`,
            `circle(${endRadius}px at ${x}px ${y}px)`,
          ],
        },
        {
          duration: 1100,
          easing: "cubic-bezier(0.22, 1, 0.36, 1)",
          pseudoElement: "::view-transition-new(root)",
        },
      );
      await transition.finished;
    } catch {
      applyTheme(nextTheme);
    } finally {
      hideThemeWordmark();
    }
  };

  applyTheme(document.documentElement.dataset.theme);

  if (themeToggle) {
    themeToggle.addEventListener("click", async (event) => {
      if (isThemeTransitionRunning) {
        return;
      }
      isThemeTransitionRunning = true;
      const nextTheme =
        document.documentElement.dataset.theme === "dark" ? "light" : "dark";
      try {
        await animateThemeChange(nextTheme, event);
      } finally {
        isThemeTransitionRunning = false;
      }
    });
  }

  if (headerSearch && hasSearch) {
    const initialQuery =
      new URLSearchParams(window.location.search).get("q") ?? "";
    headerSearch.value = initialQuery;
    syncSearch(initialQuery);

    headerSearch.addEventListener("input", (event) => {
      const query = event.currentTarget.value;
      const url = new URL(window.location.href);
      if (query.trim()) {
        url.searchParams.set("q", query);
      } else {
        url.searchParams.delete("q");
      }
      window.history.replaceState({}, "", url.toString());
      syncSearch(query);
    });

    headerSearch.addEventListener("keydown", (event) => {
      if (event.key === "Escape") {
        event.preventDefault();
        if (headerSearch.value) {
          headerSearch.value = "";
          const url = new URL(window.location.href);
          url.searchParams.delete("q");
          window.history.replaceState({}, "", url.toString());
          syncSearch("");
        } else {
          headerSearch.blur();
        }
      }
    });
  }

  document.addEventListener("keydown", (event) => {
    if (event.key !== "/" || event.metaKey || event.ctrlKey || event.altKey) {
      return;
    }
    if (isTypingTarget(event.target)) {
      return;
    }
    event.preventDefault();

    if (headerSearch && hasSearch) {
      headerSearch.focus();
      headerSearch.select();
      return;
    }

    const url = new URL("/search", window.location.origin);
    window.location.assign(url.toString());
  });
}

function initImageViewer() {
  const viewer = document.getElementById("image-viewer");
  const viewerImage = document.getElementById("image-viewer-image");
  const viewerCaption = document.getElementById("image-viewer-caption");
  const closeButton = document.getElementById("image-viewer-close");
  const images = Array.from(
    document.querySelectorAll(".post-detail .post-content img"),
  );

  if (
    !viewer ||
    !viewerImage ||
    !viewerCaption ||
    !closeButton ||
    !images.length
  ) {
    return;
  }

  let activeImage = null;
  let closeTimer = null;

  const openViewer = (image) => {
    if (!(image instanceof HTMLImageElement)) return;

    if (closeTimer) {
      window.clearTimeout(closeTimer);
      closeTimer = null;
    }

    activeImage = image;
    viewerImage.src = image.currentSrc || image.src;
    viewerImage.alt = image.alt || "";
    viewerCaption.textContent = image.alt || "";
    viewerCaption.hidden = !image.alt;
    viewer.hidden = false;
    viewer.setAttribute("aria-hidden", "false");
    document.body.classList.add("is-image-viewer-open");
    window.requestAnimationFrame(() => {
      viewer.classList.add("is-open");
    });
    closeButton.focus();
  };

  const closeViewer = () => {
    if (viewer.hidden) return;
    viewer.classList.remove("is-open");
    viewer.setAttribute("aria-hidden", "true");
    document.body.classList.remove("is-image-viewer-open");
    closeTimer = window.setTimeout(() => {
      viewer.hidden = true;
      viewerImage.removeAttribute("src");
      viewerImage.alt = "";
      viewerCaption.textContent = "";
      viewerCaption.hidden = true;
      if (activeImage) {
        activeImage.focus();
        activeImage = null;
      }
      closeTimer = null;
    }, 180);
  };

  images.forEach((image) => {
    image.classList.add("zoomable-image");
    if (!image.hasAttribute("tabindex")) {
      image.tabIndex = 0;
    }
    image.setAttribute("role", "button");
    image.setAttribute(
      "aria-label",
      image.alt ? `查看大图：${image.alt}` : "查看大图",
    );

    image.addEventListener("click", (event) => {
      event.preventDefault();
      openViewer(image);
    });
    image.addEventListener("keydown", (event) => {
      if (event.key === "Enter" || event.key === " ") {
        event.preventDefault();
        openViewer(image);
      }
    });
  });

  viewer.addEventListener("click", (event) => {
    if (event.target === viewer) {
      closeViewer();
    }
  });

  closeButton.addEventListener("click", closeViewer);

  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape" && !viewer.hidden) {
      closeViewer();
    }
  });
}

function initBackToTop() {
  const button = document.getElementById("back-to-top");
  if (!button || !document.body.classList.contains("post-detail-page")) return;

  const syncVisibility = () => {
    button.classList.toggle("is-visible", window.scrollY > 320);
  };

  button.addEventListener("click", () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  });

  window.addEventListener("scroll", syncVisibility, { passive: true });
  syncVisibility();
}

ready(() => {
  initThemeAndSearch();
  initImageViewer();
  initBackToTop();
});
