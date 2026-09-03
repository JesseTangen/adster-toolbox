import fs from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";

const projectRoot = path.resolve(import.meta.dirname, "..");

describe("GitHub Pages SPA fallback", () => {
  it("ships a custom 404 page that preserves the requested root-domain route", () => {
    const fallback = fs.readFileSync(path.join(projectRoot, "client/public/404.html"), "utf8");
    expect(fallback).toContain("appRoute");
    expect(fallback).toContain("location.pathname.slice(1)");
    expect(fallback).toContain('location.host + "/?/" + appRoute');
  });

  it("restores a preserved fallback route before React loads", () => {
    const index = fs.readFileSync(path.join(projectRoot, "client/index.html"), "utf8");
    expect(index).toContain("GitHub Pages SPA fallback");
    expect(index).toContain("history.replaceState");
  });

  it("ships the supplied favicon and blocks crawler indexing in the application document", () => {
    const index = fs.readFileSync(path.join(projectRoot, "client/index.html"), "utf8");
    expect(index).toContain('<meta name="robots" content="noindex, nofollow" />');
    expect(index).toContain('rel="icon" type="image/png" sizes="32x32" href="/favicon-32x32.png"');
    expect(fs.existsSync(path.join(projectRoot, "client/public/favicon-32x32.png"))).toBe(true);
  });
});
