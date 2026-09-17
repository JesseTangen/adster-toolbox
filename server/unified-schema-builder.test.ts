import { describe, expect, it } from "vitest";
import {
  buildUnifiedSchema,
  cloneUnifiedSchemaDraft,
  createUnifiedSchemaDraft,
  getSchemaBuilderTypeLabel,
  validateUnifiedSchemaDraft,
} from "@adster/schema-core";

describe("unified Schema Builder core", () => {
  it("starts without a schema type and emits only the Schema.org context", () => {
    const draft = createUnifiedSchemaDraft();

    expect(draft.schemaType).toBe("");
    expect(buildUnifiedSchema(draft)).toEqual({ "@context": "https://schema.org" });
    expect(validateUnifiedSchemaDraft(draft).recommendations).toEqual(expect.arrayContaining([
      expect.objectContaining({ label: "Schema type" }),
    ]));
    expect(getSchemaBuilderTypeLabel(draft.schemaType)).toBe("Please select");
  });

  it("builds LocalBusiness JSON-LD after LocalBusiness is selected", () => {
    const schema = buildUnifiedSchema({
      ...createUnifiedSchemaDraft("LocalBusiness"),
      label: "Downtown location",
      localBusiness: {
        ...createUnifiedSchemaDraft("LocalBusiness").localBusiness,
        name: "Downtown Studio",
        addressLocality: "Calgary",
      },
    });

    expect(schema).toMatchObject({
      "@context": "https://schema.org",
      "@type": "LocalBusiness",
      name: "Downtown Studio",
      address: { "@type": "PostalAddress", addressLocality: "Calgary" },
    });
  });

  it("builds FAQPage JSON-LD after FAQPage is selected", () => {
    const draft = createUnifiedSchemaDraft("FAQPage");
    draft.faqPage.questions = [{ id: "faq-1", question: "What do you offer?", answer: "We offer strategic services." }];

    expect(buildUnifiedSchema(draft)).toMatchObject({
      "@context": "https://schema.org",
      "@type": "FAQPage",
      mainEntity: [{
        "@type": "Question",
        name: "What do you offer?",
        acceptedAnswer: { "@type": "Answer", text: "We offer strategic services." },
      }],
    });
  });

  it("clones nested LocalBusiness schedules and FAQ questions with fresh identifiers", () => {
    const draft = createUnifiedSchemaDraft("FAQPage");
    draft.faqPage.questions = [{ id: "faq-1", question: "Question", answer: "Answer" }];
    draft.localBusiness.openingHoursRows = [{ id: "hours-1", dayOfWeek: ["Monday"], opens: "09:00", closes: "17:00" }];

    const clone = cloneUnifiedSchemaDraft(draft);

    expect(clone.id).not.toBe(draft.id);
    expect(clone.faqPage.questions[0]?.id).not.toBe(draft.faqPage.questions[0]?.id);
    expect(clone.localBusiness.openingHoursRows[0]?.id).not.toBe(draft.localBusiness.openingHoursRows[0]?.id);
  });
});
