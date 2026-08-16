import { describe, expect, it } from "vitest";
import { headerLogoSrc } from "../client/src/lib/headerLogo";

describe("bundled header logo", () => {
  it("ships the supplied PNG as a self-contained client asset", () => {
    expect(headerLogoSrc).toMatch(/^data:image\/png;base64,/);
    expect(Buffer.from(headerLogoSrc.split(",")[1] ?? "", "base64").byteLength).toBeGreaterThan(50_000);
  });
});
