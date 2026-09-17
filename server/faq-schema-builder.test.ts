import { describe, expect, it } from "vitest";
import { buildFaqPageSchema, createFaqSchemaDraft, validateFaqSchemaDraft } from "@adster/schema-core";

describe("FAQPage schema builder", () => {
  it("builds a FAQPage with multiple Question and acceptedAnswer entries", () => {
    const schema = buildFaqPageSchema({
      ...createFaqSchemaDraft(),
      questions: [
        { id: "one", question: "What services do you offer?", answer: "We provide SEO and content strategy." },
        { id: "two", question: "Do you work with local businesses?", answer: "Yes, we support local businesses and multi-location brands." },
      ],
    });

    expect(schema).toEqual({
      "@context": "https://schema.org",
      "@type": "FAQPage",
      mainEntity: [
        {
          "@type": "Question",
          name: "What services do you offer?",
          acceptedAnswer: {
            "@type": "Answer",
            text: "We provide SEO and content strategy.",
          },
        },
        {
          "@type": "Question",
          name: "Do you work with local businesses?",
          acceptedAnswer: {
            "@type": "Answer",
            text: "Yes, we support local businesses and multi-location brands.",
          },
        },
      ],
    });
  });

  it("does not emit incomplete FAQ entries", () => {
    const schema = buildFaqPageSchema({
      ...createFaqSchemaDraft(),
      questions: [
        { id: "complete", question: "A complete question?", answer: "A complete answer." },
        { id: "missing-answer", question: "What is missing?", answer: "" },
        { id: "missing-question", question: "", answer: "A question." },
      ],
    });

    expect(schema.mainEntity).toHaveLength(1);
    expect(schema.mainEntity[0]).toMatchObject({ name: "A complete question?", acceptedAnswer: { text: "A complete answer." } });
  });

  it("guides empty entries and flags incomplete question-answer pairs", () => {
    const emptyValidation = validateFaqSchemaDraft(createFaqSchemaDraft());
    const incompleteValidation = validateFaqSchemaDraft({
      ...createFaqSchemaDraft(),
      questions: [{ id: "partial", question: "Is an answer required?", answer: "" }],
    });

    expect(emptyValidation.recommendations).toEqual(expect.arrayContaining([
      expect.objectContaining({ label: "mainEntity" }),
    ]));
    expect(incompleteValidation.errors).toEqual(expect.arrayContaining([
      expect.objectContaining({ label: "Answer 1" }),
    ]));
  });
});
