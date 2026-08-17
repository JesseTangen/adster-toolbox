import { describe, expect, it } from "vitest";
import { createWireframeSection, moveWireframeSection, multiColumnContentStyles, wireframeSectionDefinitions } from "@adster/wireframe-core";

describe("wireframe core", () => {
  it("provides the requested site section catalog with style variants", () => {
    expect(wireframeSectionDefinitions.map(item => item.type)).toEqual(expect.arrayContaining([
      "header", "hero", "columns", "split", "faq", "articles", "products", "footer",
    ]));
    expect(wireframeSectionDefinitions.map(item => item.type)).not.toContain("cards");
    expect(wireframeSectionDefinitions.filter(item => !["header", "footer", "split", "columns"].includes(item.type)).every(item => item.variants.length >= 3)).toBe(true);
    expect(wireframeSectionDefinitions.find(item => item.type === "header")?.variants).toEqual([]);
    expect(wireframeSectionDefinitions.find(item => item.type === "footer")?.variants).toEqual([]);
    expect(wireframeSectionDefinitions.find(item => item.type === "split")?.variants.map(variant => variant.id)).toEqual(["image-left", "image-right"]);
    expect(wireframeSectionDefinitions.find(item => item.type === "columns")?.variants.map(variant => variant.id)).toEqual(["two", "three", "four"]);
    expect(multiColumnContentStyles.map(style => style.id)).toEqual(["feature", "blog", "service", "collection", "product"]);
  });

  it("creates editable sections and reorders them without changing their content", () => {
    const hero = createWireframeSection("hero", "hero-1");
    const faq = createWireframeSection("faq", "faq-1");
    const reordered = moveWireframeSection([hero, faq], 1, 0);

    const header = createWireframeSection("header", "header-1");
    const columns = createWireframeSection("columns", "columns-1");
    const footer = createWireframeSection("footer", "footer-1");
    const framedSections = [header, hero, faq, footer];

    expect(hero.variant).toBe("split");
    expect(header.title).toBe("[Brand Name]");
    expect(columns.multiColumnStyle).toBe("feature");
    expect(columns.multiColumnMedia).toBe("image");
    expect(columns.multiColumnPresentation).toBe("basic");
    expect(columns.showReadMore).toBe(true);
    expect(moveWireframeSection(framedSections, 0, 1)).toBe(framedSections);
    expect(moveWireframeSection(framedSections, 1, 3)).toBe(framedSections);
    expect(reordered.map(section => section.id)).toEqual(["faq-1", "hero-1"]);
  });
});
