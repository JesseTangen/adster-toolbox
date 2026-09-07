import { describe, expect, it } from "vitest";
import { defaultSitemap } from "@adster/sitemap-core";
import { flattenSitemapForPdf, sitemapPdfFilename } from "../client/src/lib/sitemapPdf";

describe("sitemap PDF export helpers", () => {
  it("preserves sitemap hierarchy order for the client-review export", () => {
    const entries = flattenSitemapForPdf(defaultSitemap);

    expect(entries.map(entry => `${entry.depth}:${entry.title}`)).toEqual([
      "0:Homepage",
      "1:Services",
      "2:Service detail",
      "1:About",
      "1:Resources",
      "1:Contact",
    ]);
  });

  it("creates a client-review filename from the project name", () => {
    expect(sitemapPdfFilename("North Star / Website Plan")).toBe("north-star-website-plan-sitemap-review.pdf");
    expect(sitemapPdfFilename("  ")).toBe("sitemap-sitemap-review.pdf");
  });
});
