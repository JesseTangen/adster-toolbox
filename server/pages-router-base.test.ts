import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

describe("GitHub Pages router base", () => {
  it("uses Vite's deployed base path while detecting static export independently", () => {
    const source = readFileSync(new URL("../client/src/App.tsx", import.meta.url), "utf8");

    expect(source).toContain("const pagesBasePath = import.meta.env.BASE_URL");
    expect(source).toContain('const isStaticExport = import.meta.env.VITE_STATIC_EXPORT === "true"');
    expect(source).toContain("<WouterRouter base={pagesBasePath}>{routes}</WouterRouter>");
  });

  it("builds the configured custom-domain Pages artifact from the domain root", () => {
    const config = readFileSync(new URL("../vite.config.ts", import.meta.url), "utf8");
    const packageJson = readFileSync(new URL("../package.json", import.meta.url), "utf8");

    expect(config).toContain("GITHUB_PAGES_CUSTOM_DOMAIN");
    expect(config).toContain('base: isGitHubPagesBuild && !isGitHubPagesCustomDomain ? `/${githubPagesRepository}/` : "/"');
    expect(packageJson).toContain("GITHUB_PAGES=true GITHUB_PAGES_CUSTOM_DOMAIN=true vite build");
  });
});
