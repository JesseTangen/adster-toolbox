# Sitemap PDF export validation

The Sitemap Planner export produces a landscape letter PDF titled **Sitemap review** with the active project name, page and depth totals, a dated footer, and an indented visual hierarchy. Each page row includes the page title, URL path, and page role, making the document suitable for client review without exposing editor controls.

The browser export check confirmed that the Download PDF control produces a file ending in `-sitemap-review.pdf`. PDF inspection confirmed a valid one-page letter PDF with extractable sitemap content for the starter tree; the visual review confirmed the hierarchy lines, page cards, stat badges, and footer are legible.

The live Planner capture confirms **Download PDF** is available in the module header before the top-level-page and reset controls. After export, the interface reports the generated review filename and download-start feedback without altering the current saved sitemap.
