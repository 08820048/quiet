function ready(fn) {
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", fn, { once: true });
    return;
  }
  fn();
}

function initThemeAndSearch() {
  const themeToggle = document.getElementById("theme-toggle");
  const headerSearch = document.getElementById("header-search");
  const isHomePage = document.body.classList.contains("home-page");

  const applyTheme = (theme) => {
    const resolvedTheme = theme === "dark" ? "dark" : "light";
    document.documentElement.dataset.theme = resolvedTheme;
    localStorage.setItem("theme", resolvedTheme);
    if (themeToggle) {
      themeToggle.textContent = resolvedTheme === "dark" ? "light" : "dark";
    }
  };

  applyTheme(document.documentElement.dataset.theme);

  if (themeToggle) {
    themeToggle.addEventListener("click", () => {
      const nextTheme =
        document.documentElement.dataset.theme === "dark" ? "light" : "dark";
      applyTheme(nextTheme);
    });
  }

  if (!headerSearch) return;

  if (!isHomePage) {
    headerSearch.value = "";
    headerSearch.setAttribute("disabled", "true");
    return;
  }

  const syncSearch = (value) => {
    window.dispatchEvent(
      new CustomEvent("globalsearchchange", {
        detail: { query: value },
      }),
    );
  };

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
