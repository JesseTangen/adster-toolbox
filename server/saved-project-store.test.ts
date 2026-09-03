import { describe, expect, it } from "vitest";
import { cloneSavedProjectData, createSavedProject, normalizeProjectName, sortSavedProjects } from "../client/src/lib/savedProjects";

describe("browser saved-project records", () => {
  it("normalizes empty names and gives new records timestamps", () => {
    const project = createSavedProject("wireframe", "   ", { sections: 3 }, 1234);

    expect(project.name).toBe("Untitled wireframe");
    expect(project.kind).toBe("wireframe");
    expect(project.createdAt).toBe(1234);
    expect(project.updatedAt).toBe(1234);
    expect(project.id).toMatch(/^wireframe-/);
    expect(normalizeProjectName("  Campaign   landing page ", "Fallback")).toBe("Campaign landing page");
  });

  it("sorts recent records first and duplicates record data without shared references", () => {
    const records = sortSavedProjects([
      { id: "older", kind: "sitemap" as const, name: "Older", data: { pages: ["home"] }, createdAt: 1, updatedAt: 10 },
      { id: "newer", kind: "sitemap" as const, name: "Newer", data: { pages: ["about"] }, createdAt: 1, updatedAt: 20 },
    ]);
    const cloned = cloneSavedProjectData(records[0]?.data);
    cloned.pages.push("contact");

    expect(records.map(record => record.id)).toEqual(["newer", "older"]);
    expect(records[0]?.data.pages).toEqual(["about"]);
  });
});
