# Saved projects validation

The browser-level IndexedDB workflow created a wireframe and a sitemap, made a structural edit in each module, waited for automatic local persistence, reloaded both routes, and confirmed the names and edited content were restored. It then copied each active project, confirmed the copied project opened, deleted that copy, and confirmed the original project reopened.

The desktop sitemap capture shows the Saved sitemaps panel alongside the page tree and the saved tree with its added top-level page. The phone-width capture shows the panel at the top of the module with an accessible project selector, sitemap-name field, and New, Copy, and Delete controls; the controls remain usable before the tree, canvas, and selected-page editor.

The workflow used a fresh browser context, so persistence was verified through IndexedDB rather than a pre-existing application session. The test intentionally leaves the browser’s created verification projects in its isolated test profile only; it does not alter a user’s live browser data.
