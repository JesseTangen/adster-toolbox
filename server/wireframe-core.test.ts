import { describe, expect, it } from "vitest";
import { createWireframeSection, moveWireframeSection, wireframeSectionDefinitions } from "@adster/wireframe-core";

describe("wireframe core", () => {
  it("provides the requested site section catalog with style variants", () => {
    expect(wireframeSectionDefinitions.map(item => item.type)).toEqual(expect.arrayContaining([
      "header", "hero", "cards", "split", "faq", "articles", "products", "footer",
    ]));
    expect(wireframeSectionDefinitions.every(item => item.variants.length >= 3)).toBe(true);
  });

  it("creates editable sections and reorders them without changing their content", () => {
    const hero = createWireframeSection("hero", "hero-1");
    const faq = createWireframeSection("faq", "faq-1");
    const reordered = moveWireframeSection([hero, faq], 1, 0);

    expect(hero.variant).toBe("split");
    expect(reordered.map(section => section.id)).toEqual(["faq-1", "hero-1"]);
  });
});
