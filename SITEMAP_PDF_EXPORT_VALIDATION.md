# Sitemap PDF export validation

The Sitemap Planner export produces a landscape letter PDF titled **Sitemap review** with the active project name, page and depth totals, a dated footer, and an indented visual hierarchy. Each page row includes the page title, URL path, and page role, making the document suitable for client review without exposing editor controls.

The browser export check confirmed that the Download PDF control produces a file ending in `-sitemap-review.pdf`. PDF inspection confirmed a valid one-page letter PDF with extractable sitemap content for the starter tree; the visual review confirmed the hierarchy lines, page cards, stat badges, and footer are legible.

The live Planner capture confirms **Download PDF** is available in the module header before the top-level-page and reset controls. After export, the interface reports the generated review filename and download-start feedback without altering the current saved sitemap.

## Header simplification

The revised PDF header removes the former Toolbox masthead and generic **Sitemap review** label. The active sitemap name is now the sole document title, while the page and depth totals remain available at the right edge for review context.

## Compact header

The export heading band has been reduced from 118 to 59 points, a 50% reduction. The sitemap title and page/depth cards remain fully contained in the compact heading, and the navigation hierarchy begins below the new header with sufficient whitespace for clear client review.
