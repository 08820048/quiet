// Client entry for Mermaid rendering (bundled by Vite/Astro)
// - Imports the local `mermaid` package (declared in package.json).
// - Finds fenced code blocks with `language-mermaid` (or existing `div.mermaid`) and renders them to SVG.
// - Keeps the original diagram source on the rendered container so we can re-render on theme changes.
// - Provides robust handling for different mermaid render APIs (promise, callback, sync).
//
// Notes:
// - This module is meant to be loaded as an ES module in the browser
//   (e.g. <script type="module" src="/src/client/mermaid-client.js" defer></script>).
// - We deliberately avoid mutating the original <code> or <pre> until rendering succeeds.
// - If rendering fails, we leave the original code block in place for author debugging.

import mermaidRaw from "mermaid";

const mermaid = mermaidRaw?.default ?? mermaidRaw;

function uid(prefix = "m") {
  return `${prefix}${Math.random().toString(36).slice(2, 9)}`;
}

/**
 * Normalize/collect candidate elements that contain mermaid text.
 * Accepts:
 *  - pre[data-language="mermaid"] (Astro/Shiki output)
 *  - pre > code.language-mermaid
 *  - code.language-mermaid
 *  - div.mermaid
 */
function collectMermaidSources() {
  const results = [];
  const seen = new Set();

  // Astro/Shiki renders mermaid fences as <pre data-language="mermaid"><code>...</code></pre>
  document.querySelectorAll('pre[data-language="mermaid"]').forEach((pre) => {
    seen.add(pre);
    results.push({ el: pre, source: pre.textContent || "" });
  });

  // pre > code.language-mermaid
  document.querySelectorAll("pre > code.language-mermaid").forEach((code) => {
    const pre = code.parentElement;
    if (!pre || seen.has(pre)) return;
    seen.add(pre);
    results.push({ el: pre, source: code.textContent || "" });
  });

  // standalone code.language-mermaid (in case renderer placed directly)
  document.querySelectorAll("code.language-mermaid").forEach((code) => {
    // skip if already captured via pre > code above
    if (
      code.parentElement &&
      code.parentElement.tagName.toLowerCase() === "pre"
    )
      return;
    if (seen.has(code)) return;
    seen.add(code);
    results.push({ el: code, source: code.textContent || "" });
  });

  // already existing div.mermaid (treat its textContent as source)
  document.querySelectorAll("div.mermaid").forEach((div) => {
    if (seen.has(div)) return;
    seen.add(div);
    results.push({ el: div, source: div.textContent || "" });
  });

  return results;
}

/**
 * Render a single mermaid diagram into a container element.
 * - targetEl: the element to replace (pre, code or existing div)
 * - src: the mermaid diagram text
 * Returns a Promise that resolves once rendering is done.
 */
function renderDiagram(targetEl, src) {
  return new Promise((resolve, reject) => {
    if (!src || !src.trim()) {
      return resolve(null);
    }
    const definition = src.trim();
    const id = uid("mermaid-");

    const container = document.createElement("div");
    container.className = "mermaid-rendered";
    // store original source so we can re-render on theme changes
    container.dataset.mermaidSource = definition;
    // make accessible
    container.setAttribute("aria-label", "mermaid diagram");

    // helper that inserts svg into container
    const insertSvg = (maybeSvgOrObj) => {
      // mermaid may return a string or an object {svg: '...'}
      const svg =
        maybeSvgOrObj && maybeSvgOrObj.svg ? maybeSvgOrObj.svg : maybeSvgOrObj;
      if (typeof svg === "string") {
        container.innerHTML = svg;
        // Replace the original element only after successful render
        try {
          targetEl.replaceWith(container);
        } catch (e) {
          // fallback: append next to target and hide target
          targetEl.style.display = "none";
          targetEl.parentElement &&
            targetEl.parentElement.insertBefore(
              container,
              targetEl.nextSibling,
            );
        }
        container.dataset.mermaidRendered = "true";
        resolve(container);
      } else {
        reject(new Error("Mermaid produced no SVG"));
      }
    };

    // Try promise-based render first
    try {
      const maybe = mermaid.render(id, definition);
      // If returns a promise
      if (maybe && typeof maybe.then === "function") {
        maybe
          .then((res) => insertSvg(res))
          .catch((err) => {
            // fallback to callback API
            try {
              mermaid.render(id, definition, (svgCode) => insertSvg(svgCode));
            } catch (e) {
              reject(err);
            }
          });
        return;
      }
      // If returns synchronously a string or object
      if (typeof maybe === "string" || (maybe && maybe.svg)) {
        insertSvg(maybe);
        return;
      }

      // Last fallback: try callback API (some versions accept a callback)
      mermaid.render(id, definition, (svgCode) => {
        insertSvg(svgCode);
      });
    } catch (err) {
      // If render throws immediately, attempt callback form as final fallback
      try {
        mermaid.render(id, definition, (svgCode) => {
          insertSvg(svgCode);
        });
      } catch (finalErr) {
        reject(finalErr || err);
      }
    }
  });
}

/**
 * Render all found mermaid sources on the page.
 * Returns a Promise that resolves when all are rendered (or skipped).
 */
async function renderAllDiagrams() {
  if (!document || !mermaid) return;
  // initialize with theme
  const theme =
    document.documentElement.dataset.theme === "dark" ? "dark" : "default";
  try {
    mermaid.initialize({ startOnLoad: false, theme });
  } catch (e) {
    // ignore initialization errors; some versions may throw on multiple init calls
    // eslint-disable-next-line no-console
    console.warn("mermaid.initialize warning", e);
  }

  const sources = collectMermaidSources();

  // If nothing found, nothing to do
  if (!sources.length) return;

  const jobs = sources.map(async ({ el, source }) => {
    // If element already replaced with our rendered container, skip
    if (el.dataset && el.dataset.mermaidRendered === "true") return null;
    try {
      const rendered = await renderDiagram(el, source);
      return rendered;
    } catch (err) {
      // log but don't fail other renders
      // eslint-disable-next-line no-console
      console.error("Failed to render mermaid diagram:", err);
      return null;
    }
  });

  return Promise.all(jobs);
}

/**
 * Re-render existing rendered diagrams (useful when theme changes).
 * Will re-render only elements that we previously rendered (contain dataset.mermaidSource).
 */
async function rerenderExisting() {
  if (!document || !mermaid) return;
  const theme =
    document.documentElement.dataset.theme === "dark" ? "dark" : "default";
  try {
    mermaid.initialize({ startOnLoad: false, theme });
  } catch (e) {
    // eslint-disable-next-line no-console
    console.warn("mermaid.initialize warning", e);
  }

  const containers = Array.from(
    document.querySelectorAll(".mermaid-rendered"),
  ).filter((c) => c.dataset && c.dataset.mermaidSource);

  const jobs = containers.map(async (container) => {
    const src = container.dataset.mermaidSource;
    const id = uid("mermaid-");
    try {
      const maybe = mermaid.render(id, src);
      if (maybe && typeof maybe.then === "function") {
        await maybe.then((res) => {
          const svg = res && res.svg ? res.svg : res;
          container.innerHTML = svg;
        });
      } else if (typeof maybe === "string" || (maybe && maybe.svg)) {
        const svg = maybe && maybe.svg ? maybe.svg : maybe;
        container.innerHTML = svg;
      } else {
        // callback form
        await new Promise((res, rej) => {
          try {
            mermaid.render(id, src, (svgCode) => {
              container.innerHTML = svgCode;
              res();
            });
          } catch (err) {
            rej(err);
          }
        });
      }
    } catch (err) {
      // eslint-disable-next-line no-console
      console.error("Failed to re-render mermaid diagram:", err);
    }
  });

  return Promise.all(jobs);
}

// Debounce helper
function debounce(fn, wait = 100) {
  let t = null;
  return (...args) => {
    clearTimeout(t);
    t = setTimeout(() => fn(...args), wait);
  };
}

const debouncedRerender = debounce(() => rerenderExisting(), 120);

// Setup: render diagrams once DOM is ready
if (
  document.readyState === "complete" ||
  document.readyState === "interactive"
) {
  // Slight delay to allow Markdown renderer to finish injecting code blocks
  setTimeout(() => renderAllDiagrams(), 30);
} else {
  document.addEventListener("DOMContentLoaded", () => {
    setTimeout(() => renderAllDiagrams(), 30);
  });
}

// Observe theme changes (data-theme on <html>)
if (typeof MutationObserver !== "undefined") {
  const observer = new MutationObserver((mutations) => {
    for (const m of mutations) {
      if (m.attributeName === "data-theme") {
        debouncedRerender();
        break;
      }
    }
  });
  try {
    observer.observe(document.documentElement, { attributes: true });
  } catch (e) {
    // ignore if observe fails
    // eslint-disable-next-line no-console
    console.warn("Failed to observe theme changes for mermaid re-rendering", e);
  }
}

// Expose a small global API for manual control (optional)
if (typeof window !== "undefined") {
  window.__mermaidClient = {
    renderAll: renderAllDiagrams,
    rerender: rerenderExisting,
  };
}
