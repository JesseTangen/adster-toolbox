import { describe, expect, it } from "vitest";
import {
  buildHowToSchema,
  createHowToSchemaDraft,
  validateHowToSchemaDraft,
} from "@adster/schema-core";

describe("HowTo schema builder", () => {
  it("builds compact HowTo JSON-LD with ordered HowToStep items", () => {
    const draft = createHowToSchemaDraft();
    Object.assign(draft, {
      name: "Change a flat tire",
      description: "Safe instructions for replacing a flat tire.",
      url: "https://example.com/change-a-flat-tire",
      image: "https://example.com/images/flat-tire.jpg",
      prepTime: "PT10M",
      performTime: "PT20M",
      totalTime: "PT30M",
      estimatedCost: "$20",
      yield: "One safely changed tire",
      supply: "Spare tire\nWheel wedges",
      tool: "Lug wrench, Jack",
      steps: [
        { id: "step-1", name: "Secure the car", text: "Turn on hazard lights and set the wheel wedges.", image: "" },
        { id: "step-2", name: "Raise the vehicle", text: "Position the jack and raise the flat tire.", image: "https://example.com/images/jack.jpg" },
      ],
    });

    expect(buildHowToSchema(draft)).toEqual({
      "@context": "https://schema.org",
      "@type": "HowTo",
      name: "Change a flat tire",
      description: "Safe instructions for replacing a flat tire.",
      url: "https://example.com/change-a-flat-tire",
      image: "https://example.com/images/flat-tire.jpg",
      estimatedCost: "$20",
      prepTime: "PT10M",
      performTime: "PT20M",
      totalTime: "PT30M",
      yield: "One safely changed tire",
      supply: ["Spare tire", "Wheel wedges"],
      tool: ["Lug wrench", "Jack"],
      step: [
        { "@type": "HowToStep", position: 1, name: "Secure the car", text: "Turn on hazard lights and set the wheel wedges." },
        { "@type": "HowToStep", position: 2, name: "Raise the vehicle", text: "Position the jack and raise the flat tire.", image: "https://example.com/images/jack.jpg" },
      ],
    });
  });

  it("omits blank values and incomplete steps from the output", () => {
    const schema = buildHowToSchema(createHowToSchemaDraft());

    expect(schema).toEqual({
      "@context": "https://schema.org",
      "@type": "HowTo",
    });
  });

  it("guides missing visible steps and rejects invalid URLs and durations", () => {
    const draft = createHowToSchemaDraft();
    Object.assign(draft, {
      url: "not-a-url",
      image: "also-not-a-url",
      totalTime: "30 minutes",
      steps: [{ id: "step-1", name: "Incomplete", text: "", image: "not-an-image-url" }],
    });

    const validation = validateHowToSchemaDraft(draft);

    expect(validation.errors.map(issue => issue.label)).toEqual(expect.arrayContaining(["url", "image", "totalTime", "Step 1", "Step 1 image"]));
    expect(validation.recommendations.some(issue => issue.label === "name")).toBe(true);
  });
});
