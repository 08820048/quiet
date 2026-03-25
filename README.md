# Quiet

Quiet is a minimal personal blog built with Astro and Markdown.

It focuses on fast static delivery, simple content authoring, and a clean reading experience with archive navigation, tag discovery, dark mode, Mermaid diagrams, KaTeX math, image preview, and client-side search.

## Features

- Markdown-based blog posts stored in `src/content/blog`
- Shared post metadata parser for title, summary, tags, category, publish/update dates, and reading time
- Astro static site generation
- React-powered post search on the homepage and `/search`
- Archive and tag index pages for content navigation
- Mermaid rendering in article detail pages
- KaTeX math support
- Dark and light theme switching
- Click-to-preview images in article pages
- Floating back-to-top button on article detail pages
- RSS, sitemap, robots.txt, JSON-LD, and Open Graph metadata

## Stack

- Astro
- React
- TypeScript
- Shiki
- Mermaid
- KaTeX

## Project Structure

```text
src/
  client/         Client-side modules for Mermaid and site UI
  components/     React components
  content/blog/   Markdown articles
  layouts/        Shared Astro layouts
  pages/          Astro routes
  styles/         Global styles
```

## Local Development

Requirements:

- Node.js 18+
- npm

Install dependencies:

```bash
npm install
```

Start the development server:

```bash
npm run dev
```

Build the site:

```bash
npm run build
```

Preview the production build:

```bash
npm run preview
```

Run Astro checks:

```bash
npm run typecheck
```

## Content Authoring

- Add new posts under `src/content/blog`
- The homepage, archive, search, RSS, and sitemap all use the shared parsed post metadata
- Article detail pages are generated from the Markdown files

## License

This project is licensed under the MIT License. See `LICENSE` for details.
