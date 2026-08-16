import { describe, expect, it } from "vitest";
import { checklistDefinitions, getChecklistItemCount } from "@adster/checklists";

describe("QA checklist catalog", () => {
  it("includes the supplied QA workflows with structured sections and checks", () => {
    expect(checklistDefinitions.map(checklist => checklist.id)).toEqual([
      "seo-qa",
      "technical-qa",
      "user-qa",
      "content-qa",
      "google-ads-qa",
    ]);
    expect(checklistDefinitions.every(checklist => checklist.sections.length > 0 && getChecklistItemCount(checklist) > 0)).toBe(true);
  });

  it("retains the core SEO and Technical QA requirements", () => {
    const seo = checklistDefinitions.find(checklist => checklist.id === "seo-qa");
    const technical = checklistDefinitions.find(checklist => checklist.id === "technical-qa");
    expect(seo?.sections.flatMap(section => section.items).map(item => item.id)).toContain("schema-validates");
    expect(technical?.sections.flatMap(section => section.items).map(item => item.id)).toContain("keyboard");
  });
});
