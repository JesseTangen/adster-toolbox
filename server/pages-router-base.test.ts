import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

describe("GitHub Pages router base", () => {
  it("scopes client routes to Vite's deployed base path", () => {
    const source = readFileSync(new URL("../client/src/App.tsx", import.meta.url), "utf8");

    expect(source).toContain("const pagesBasePath = import.meta.env.BASE_URL");
    expect(source).toContain("<WouterRouter base={pagesBasePath}>{routes}</WouterRouter>");
  });
});
