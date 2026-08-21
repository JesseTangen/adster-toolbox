import { describe, expect, it } from "vitest";
import { addSitemapChild, cloneSitemapTree, createSitemapPage, defaultSitemap, findSitemapPage, getSitemapStats, moveSitemapPage, removeSitemapPage, reorderSitemapSibling, slugifySitemapTitle, updateSitemapPage } from "@adster/sitemap-core";

describe("sitemap core", () => {
  it("adds, updates, and finds nested pages without mutating the starter tree", () => {
    const tree = cloneSitemapTree(defaultSitemap);
    const child = createSitemapPage("case-studies", "Case studies");
    const updated = addSitemapChild(tree, "resources", child);
    const renamed = updateSitemapPage(updated, "case-studies", { title: "Client stories", slug: "/resources/client-stories" });

    expect(findSitemapPage(renamed, "case-studies")).toMatchObject({ title: "Client stories", slug: "/resources/client-stories" });
    expect(findSitemapPage(defaultSitemap, "case-studies")).toBeUndefined();
  });

  it("moves siblings, protects the root, removes descendants, and reports tree depth", () => {
    const tree = cloneSitemapTree(defaultSitemap);
    const moved = moveSitemapPage(tree, "contact", -1);
    const withoutAbout = removeSitemapPage(moved, "about");

    expect(withoutAbout.children.map(page => page.id)).toEqual(["services", "contact", "resources"]);
    expect(removeSitemapPage(tree, "home").id).toBe("home");
    expect(getSitemapStats(tree)).toEqual({ pages: 6, maxDepth: 2 });
  });

  it("creates predictable starter slugs", () => {
    expect(slugifySitemapTitle("  Our Work & Case Studies ")).toBe("/our-work-case-studies");
  });

  it("reorders only sibling pages for handle-based dragging", () => {
    const tree = cloneSitemapTree(defaultSitemap);
    const reordered = reorderSitemapSibling(tree, "contact", "about");
    const invalidBranchMove = reorderSitemapSibling(reordered, "service-detail", "about");

    expect(reordered.children.map(page => page.id)).toEqual(["services", "contact", "about", "resources"]);
    expect(invalidBranchMove.children.map(page => page.id)).toEqual(["services", "contact", "about", "resources"]);
  });
});
