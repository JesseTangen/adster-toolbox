import { describe, expect, it } from "vitest";
import { checklistDefinitions } from "@adster/checklists";
import { toolboxCategories, toolboxTools } from "@adster/toolbox-config";
import { toolboxCardClassNames } from "@adster/toolbox-ui";

describe("Strategist Toolbox registry", () => {
  it("exposes Local Schema as the available route-based first module", () => {
    expect(toolboxTools).toContainEqual(
      expect.objectContaining({
        id: "local-schema",
        path: "/local-schema",
        status: "available",
      }),
    );
  });

  it("defines discovery categories for current and future tool modules", () => {
    expect(toolboxCategories).toEqual(["All tools", "Schema", "Planning", "Quality"]);
    expect(toolboxTools.every(tool => tool.category !== undefined)).toBe(true);
  });

  it("exposes shared UI and checklist contracts for future tool modules", () => {
    expect(toolboxCardClassNames.available).toContain("border-primary");
    expect(checklistDefinitions[0]?.items).toHaveLength(4);
  });
});
