# Sitemap Planner Maintenance Guide

Sitemap Planner stores the current page tree in the browser under `adster-sitemap-planner-tree`. The active selected page is stored separately, so a strategist can continue working in the same part of the hierarchy after a refresh.

The reusable tree contract lives in `packages/sitemap-core/src/index.ts`. Each page has an `id`, `title`, `slug`, `kind`, and recursive `children` array. Add or revise default starter pages in `defaultSitemap`; use the exported pure helpers for page insertion, editing, removal, and sibling ordering rather than adding component-specific mutations.

The Planner’s core interaction model is deliberately compact. **Add top-level page** creates a child of Homepage, **Add child** nests a new page under the selected page, and the inspector edits title, path, and role. Move controls reorder siblings; the Homepage root remains protected. This keeps the module straightforward to extend with future page metadata such as owner, SEO intent, template, or status.

Desktop review confirmed the connected tree canvas, nested page markers, and selected-page inspector form clearly show hierarchy and editing context. On mobile, the catalog, tree, canvas, and inspector stack into a single vertical planning flow while preserving the page controls and navigation relationships.
