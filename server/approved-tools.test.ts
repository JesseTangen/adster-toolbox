import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
import { approvedToolCategories, approvedTools } from "@adster/toolbox-config";

const pageSource = readFileSync("client/src/pages/ApprovedTools.tsx", "utf8");

describe("Approved Tools directory", () => {
  it("starts with the approved UTM and design resources", () => {
    expect(approvedToolCategories).toEqual(["All tools", "UTM", "Design"]);
    expect(approvedTools).toEqual(expect.arrayContaining([
      expect.objectContaining({
        id: "campaign-url-builder",
        name: "Campaign URL Builder",
        category: "UTM",
        url: "https://ga-dev-tools.google/campaign-url-builder/",
      }),
      expect.objectContaining({
        id: "canva",
        name: "Canva",
        category: "Design",
        url: "https://www.canva.com/",
      }),
    ]));
  });

  it("searches the catalog and opens every external resource safely in a new tab", () => {
    expect(pageSource).toContain("Search tools, categories, or outcomes");
    expect(pageSource).toContain('target="_blank"');
    expect(pageSource).toContain('rel="noopener noreferrer"');
    expect(pageSource).toContain("Open link");
  });
});
