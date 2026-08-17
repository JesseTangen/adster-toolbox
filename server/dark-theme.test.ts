import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";

const projectRoot = resolve(import.meta.dirname, "..");

describe("dark theme", () => {
  it("enables persistent switching and exposes a sidebar toggle", () => {
    const app = readFileSync(resolve(projectRoot, "client/src/App.tsx"), "utf8");
    const sidebar = readFileSync(resolve(projectRoot, "client/src/components/DashboardLayout.tsx"), "utf8");

    expect(app).toContain("switchable");
    expect(sidebar).toContain('role="switch"');
    expect(sidebar).toContain('aria-label="Toggle dark mode"');
  });

  it("defines the supplied deep-green and aqua dark theme tokens", () => {
    const css = readFileSync(resolve(projectRoot, "client/src/index.css"), "utf8");

    expect(css).toContain(".dark {");
    expect(css).toContain("--background: #071c19");
    expect(css).toContain("--primary: #00f7ba");
    expect(css).toContain("--secondary: #009973");
    expect(css).toContain("html.dark .toolbox-directory-card");
  });

  it("keeps LocalBusiness and QA controls dark-aware without replacing their light classes", () => {
    const localSchema = readFileSync(resolve(projectRoot, "client/src/pages/LocalSchema.tsx"), "utf8");
    const qaChecklists = readFileSync(resolve(projectRoot, "client/src/pages/QaChecklists.tsx"), "utf8");

    expect(localSchema).toContain("bg-white/75");
    expect(localSchema).toContain("dark:bg-[#0a241f]");
    expect(localSchema).toContain("dark:bg-[#073a2e]");
    expect(qaChecklists).toContain("dark:bg-[#0a241f]");
    expect(qaChecklists).toContain("dark:accent-[#00f7ba]");
  });

  it("keeps the Campaign canvas and both exports light inside dark mode", () => {
    const wireframeBuilder = readFileSync(resolve(projectRoot, "client/src/pages/WireframeBuilder.tsx"), "utf8");
    const css = readFileSync(resolve(projectRoot, "client/src/index.css"), "utf8");

    expect(wireframeBuilder.match(/light-wireframe-document/g)).toHaveLength(3);
    expect(wireframeBuilder).toContain('data-wireframe-export="desktop"');
    expect(wireframeBuilder).toContain('data-wireframe-export="mobile"');
    expect(css).toContain("html.dark .light-wireframe-document");
    expect(css).toContain('light-wireframe-document [class~="bg-[#eff8fc]"]');
  });
});
