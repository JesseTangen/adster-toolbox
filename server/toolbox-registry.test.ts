import { describe, expect, it } from "vitest";
import { checklistDefinitions } from "@adster/checklists";
import { toolboxCategories, toolboxTools } from "@adster/toolbox-config";
import { toolboxCardClassNames } from "@adster/toolbox-ui";

describe("Strategist Toolbox registry", () => {
  it("exposes Local Schema as the available route-based first module", () => {
    expect(toolboxTools).toContainEqual(
      expect.objectContaining({
        id: "local-schema",
        name: "LocalBusiness Schema",
        path: "/local-schema",
        status: "available",
      }),
    );
  });

  it("defines discovery categories for current and future tool modules", () => {
    expect(toolboxCategories).toEqual(["All tools", "Schema", "Planning", "Quality", "Knowledge"]);
    expect(toolboxTools.every(tool => tool.category !== undefined)).toBe(true);
  });

  it("keeps Knowledge Base planned while activating Prompt Library from its route", () => {
    expect(toolboxTools).toEqual(expect.arrayContaining([
      expect.objectContaining({ id: "knowledge-base", name: "Knowledge Base", status: "planned", category: "Knowledge" }),
      expect.objectContaining({ id: "prompt-library", name: "Prompt Library", path: "/prompt-library", status: "available", category: "Planning" }),
    ]));
    expect(toolboxTools.some(tool => tool.id === "other-schema")).toBe(false);
  });

  it("activates the planning and quality modules as available Toolbox routes", () => {
    expect(toolboxTools).toEqual(expect.arrayContaining([
      expect.objectContaining({ id: "wireframe-builder", path: "/wireframe-builder", status: "available" }),
      expect.objectContaining({ id: "sitemap-planner", name: "Sitemap Planner", path: "/sitemap-planner", status: "available", category: "Planning" }),
      expect.objectContaining({ id: "qa-checklists", path: "/qa-checklists", status: "available" }),
    ]));
  });

  it("exposes shared UI and a structured QA checklist contract", () => {
    expect(toolboxCardClassNames.available).toContain("border-primary");
    expect(checklistDefinitions).toHaveLength(5);
    expect(checklistDefinitions.every(checklist => checklist.sections.length > 0)).toBe(true);
  });
});
