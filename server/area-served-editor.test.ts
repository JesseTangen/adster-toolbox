import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
import { areaServedTypes } from "@adster/schema-core";

const editorSource = readFileSync("client/src/components/AreaServedEditor.tsx", "utf8");

describe("repeatable area served editor", () => {
  it("offers typed City, State, and Country entries with add and remove controls", () => {
    expect(areaServedTypes).toEqual(["City", "State", "Country"]);
    expect(editorSource).toContain("Area served ${index + 1} type");
    expect(editorSource).toContain("Add service area");
    expect(editorSource).toContain("Remove service area ${index + 1}");
  });
});
