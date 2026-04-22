function ready(fn) {
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", fn, { once: true });
    return;
  }
  fn();
}

function initThemeAndSearch() {
  const siteNav = document.querySelector(".site-nav");
  const themeToggle = document.getElementById("theme-toggle");
  const searchToggle = document.getElementById("header-search-toggle");
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
  const syncSearchToggleState = () => {
    if (!(searchToggle instanceof HTMLElement) || !(siteNav instanceof HTMLElement)) {
      return;
    }
    searchToggle.setAttribute(
      "aria-expanded",
      siteNav.classList.contains("is-search-expanded") ? "true" : "false",
    );
  };
  const openSearch = () => {
    if (!(siteNav instanceof HTMLElement)) {
      return false;
    }

    if (siteNav.classList.contains("is-condensed")) {
      if (!hasSearch || !(headerSearch instanceof HTMLInputElement)) {
        const url = new URL("/search", window.location.origin);
        window.location.assign(url.toString());
        return true;
      }

      siteNav.classList.add("is-search-expanded");
      siteNav.classList.remove("is-menu-expanded");
      syncSearchToggleState();
      window.requestAnimationFrame(() => {
        headerSearch.focus();
        headerSearch.select();
      });
      return true;
    }

    if (headerSearch instanceof HTMLInputElement) {
      headerSearch.focus();
      headerSearch.select();
      return true;
    }

    return false;
  };

  const applyTheme = (theme) => {
    const resolvedTheme = theme === "dark" ? "dark" : "light";
    document.documentElement.dataset.theme = resolvedTheme;
    localStorage.setItem("theme", resolvedTheme);
    if (themeToggle) {
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
      themeToggle.setAttribute(
        "aria-pressed",
        resolvedTheme === "dark" ? "true" : "false",
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

  if (searchToggle) {
    searchToggle.addEventListener("click", () => {
      if (!(siteNav instanceof HTMLElement)) {
        return;
      }

      if (!siteNav.classList.contains("is-condensed")) {
        openSearch();
        return;
      }

      if (!hasSearch || !(headerSearch instanceof HTMLInputElement)) {
        const url = new URL("/search", window.location.origin);
        window.location.assign(url.toString());
        return;
      }

      const shouldOpen = !siteNav.classList.contains("is-search-expanded");
      siteNav.classList.toggle("is-search-expanded", shouldOpen);
      siteNav.classList.remove("is-menu-expanded");
      syncSearchToggleState();

      if (shouldOpen) {
        window.requestAnimationFrame(() => {
          headerSearch.focus();
          headerSearch.select();
        });
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

    if ((headerSearch && hasSearch) || searchToggle) {
      openSearch();
      return;
    }

    const url = new URL("/search", window.location.origin);
    window.location.assign(url.toString());
  });

  syncSearchToggleState();
}

function initAdaptiveHeader() {
  const siteNav = document.querySelector(".site-nav");
  const menuToggle = document.getElementById("nav-menu-toggle");
  const searchToggle = document.getElementById("header-search-toggle");
  const shouldAlwaysDistribute = document.body.classList.contains("post-detail-page");
  const distributeScrollRange = 220;
  const condensedThreshold = 0.64;
  const isDesktop = () => window.innerWidth > 720;

  if (!(siteNav instanceof HTMLElement)) {
    return;
  }

  let currentProgress = shouldAlwaysDistribute ? 1 : 0;
  let targetProgress = currentProgress;
  let animationFrameId = 0;
  const syncToggleStates = () => {
    if (menuToggle instanceof HTMLElement) {
      menuToggle.setAttribute(
        "aria-expanded",
        siteNav.classList.contains("is-menu-expanded") ? "true" : "false",
      );
    }
    if (searchToggle instanceof HTMLElement) {
      searchToggle.setAttribute(
        "aria-expanded",
        siteNav.classList.contains("is-search-expanded") ? "true" : "false",
      );
    }
  };
  const syncCondensedState = (progress) => {
    const shouldCondense = isDesktop() && progress >= condensedThreshold;
    siteNav.classList.toggle("is-condensed", shouldCondense);
    if (!shouldCondense) {
      siteNav.classList.remove("is-menu-expanded", "is-search-expanded");
    }
    syncToggleStates();
  };

  const applyProgress = (progress) => {
    siteNav.style.setProperty(
      "--nav-distribute-progress",
      progress.toFixed(3),
    );
    syncCondensedState(progress);
  };

  const animateProgress = () => {
    currentProgress += (targetProgress - currentProgress) * 0.14;

    if (Math.abs(targetProgress - currentProgress) < 0.001) {
      currentProgress = targetProgress;
      applyProgress(currentProgress);
      animationFrameId = 0;
      return;
    }

    applyProgress(currentProgress);
    animationFrameId = window.requestAnimationFrame(animateProgress);
  };

  const updateTargetProgress = () => {
    targetProgress = shouldAlwaysDistribute
      ? 1
      : Math.max(0, Math.min(window.scrollY / distributeScrollRange, 1));

    if (animationFrameId !== 0) {
      return;
    }

    animationFrameId = window.requestAnimationFrame(animateProgress);
  };

  applyProgress(currentProgress);

  if (menuToggle instanceof HTMLElement) {
    menuToggle.addEventListener("click", () => {
      if (!siteNav.classList.contains("is-condensed")) {
        return;
      }
      const shouldOpen = !siteNav.classList.contains("is-menu-expanded");
      siteNav.classList.toggle("is-menu-expanded", shouldOpen);
      siteNav.classList.remove("is-search-expanded");
      syncToggleStates();
    });
  }

  document.addEventListener("click", (event) => {
    if (!siteNav.classList.contains("is-condensed")) {
      return;
    }
    if (event.target instanceof Node && siteNav.contains(event.target)) {
      return;
    }
    siteNav.classList.remove("is-menu-expanded", "is-search-expanded");
    syncToggleStates();
  });

  document.addEventListener("keydown", (event) => {
    if (event.key !== "Escape") {
      return;
    }
    if (!siteNav.classList.contains("is-condensed")) {
      return;
    }
    siteNav.classList.remove("is-menu-expanded", "is-search-expanded");
    syncToggleStates();
  });

  if (shouldAlwaysDistribute) {
    return;
  }

  window.addEventListener("scroll", updateTargetProgress, { passive: true });
  window.addEventListener("resize", updateTargetProgress, { passive: true });
  updateTargetProgress();
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
  initAdaptiveHeader();
  initThemeAndSearch();
  initImageViewer();
  initBackToTop();
});
