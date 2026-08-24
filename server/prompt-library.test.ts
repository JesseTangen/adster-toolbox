import { describe, expect, it } from "vitest";
import { getPromptCategories, parsePromptLibraryRows } from "@adster/prompt-library";

describe("Prompt Library sheet parser", () => {
  it("maps recognized prompt-sheet headers without embedding prompt fixtures in the application", () => {
    const prompts = parsePromptLibraryRows([
      ["Prompt title", "Category", "Prompt", "Tags", "Description"],
      ["Brief assistant", "Planning", "Use the supplied brief.", "strategy; discovery", "Starts a planning session"],
      ["", "", "", "", ""],
    ]);

    expect(prompts).toHaveLength(1);
    expect(prompts[0]).toMatchObject({
      title: "Brief assistant",
      category: "Planning",
      prompt: "Use the supplied brief.",
      tags: ["strategy", "discovery"],
      sourceRow: 2,
    });
    expect(getPromptCategories(prompts)).toEqual(["Planning"]);
  });

  it("keeps source values usable when the sheet uses an unfamiliar column order", () => {
    const prompts = parsePromptLibraryRows([
      ["Copy", "Audience"],
      ["Create a concise strategy outline.", "Marketing"],
    ]);

    expect(prompts[0]?.prompt).toBe("Create a concise strategy outline.");
    expect(prompts[0]?.fields).toEqual({ copy: "Create a concise strategy outline.", audience: "Marketing" });
  });
});
