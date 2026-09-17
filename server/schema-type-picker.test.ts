import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
import { getSchemaBuilderTypeLabel } from "@adster/schema-core";

const pickerSource = readFileSync("client/src/components/SchemaTypePicker.tsx", "utf8");

describe("Schema type picker", () => {
  it("uses the same Popover command-picker pattern as the LocalBusiness @type control", () => {
    expect(pickerSource).toContain("PopoverTrigger");
    expect(pickerSource).toContain("CommandItem");
    expect(pickerSource).toContain("ChevronsUpDown");
    expect(pickerSource).toContain("min-h-12");
  });

  it("keeps Please select, LocalBusiness, and FAQPage as the selectable starting types", () => {
    expect(pickerSource).toContain('value: ""');
    expect(pickerSource).toContain('value: "LocalBusiness"');
    expect(pickerSource).toContain('value: "FAQPage"');
    expect(getSchemaBuilderTypeLabel("")).toBe("Please select");
  });
});
