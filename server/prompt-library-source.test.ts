import { describe, expect, it } from "vitest";
import { fetchPromptLibrarySource } from "./promptLibrary";

describe("Prompt Library service-account source", () => {
  it("reads the shared source tab through the server-owned service account", async () => {
    const source = await fetchPromptLibrarySource();
    expect(source.sourceTitle).toBeTruthy();
    expect(Array.isArray(source.items)).toBe(true);
  }, 20_000);
});
