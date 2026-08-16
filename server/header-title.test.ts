import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

describe("LocalBusiness shared header", () => {
  it("uses the shared Toolbox header structure while retaining the LocalBusiness title and save action", () => {
    const source = readFileSync(new URL("../client/src/pages/LocalSchema.tsx", import.meta.url), "utf8");

    expect(source).toContain('flex flex-col gap-4 border-b border-border/80 bg-background/95 py-4 backdrop-blur-xl lg:flex-row lg:items-center lg:justify-between');
    expect(source).toContain('font-editorial text-xl leading-none tracking-tight">LocalBusiness Schema</p>');
    expect(source).toContain('Adster Creative Toolbox</p>');
    expect(source).toContain('flex flex-wrap items-center gap-2');
    expect(source).toContain('>Session workspace</span>');
    expect(source).toContain('>Save schema</span>');
    expect(source).not.toContain('Schema.org aligned');
  });
});
