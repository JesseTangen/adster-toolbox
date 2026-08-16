import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

describe("header title", () => {
  it("renders the requested Adster Schema Studio brand title", () => {
    const source = readFileSync(new URL("../client/src/pages/Home.tsx", import.meta.url), "utf8");

    expect(source).toContain(">Adster Schema Studio</p>");
  });
});
