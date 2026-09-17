import {
  buildFaqPageSchema,
  createFaqSchemaDraft,
  type FaqSchemaDraft,
  validateFaqSchemaDraft,
} from "./faq-schema-builder";
import {
  buildLocalBusinessSchema,
  createSchemaDraft,
  type SchemaDraft,
  type ValidationIssue,
  validateSchemaDraft,
} from "./schema-builder";

export const schemaBuilderTypes = ["", "LocalBusiness", "FAQPage"] as const;
export type SchemaBuilderType = (typeof schemaBuilderTypes)[number];

export type UnifiedSchemaDraft = {
  id: string;
  label: string;
  schemaType: SchemaBuilderType;
  localBusiness: SchemaDraft;
  faqPage: FaqSchemaDraft;
};

export type UnifiedSchemaValidationIssue = Pick<ValidationIssue, "label" | "message" | "severity"> & {
  field: string;
};

export function createUnifiedSchemaDraft(schemaType: SchemaBuilderType = ""): UnifiedSchemaDraft {
  return {
    id: crypto.randomUUID(),
    label: "",
    schemaType,
    localBusiness: createSchemaDraft(),
    faqPage: createFaqSchemaDraft(),
  };
}

export function getSchemaBuilderTypeLabel(schemaType: SchemaBuilderType) {
  return schemaType || "Please select";
}

export function getUnifiedSchemaName(draft: UnifiedSchemaDraft) {
  if (draft.label.trim()) return draft.label.trim();
  if (draft.schemaType === "LocalBusiness") return draft.localBusiness.name.trim() || "Untitled LocalBusiness";
  if (draft.schemaType === "FAQPage") return draft.faqPage.questions.find(item => item.question.trim())?.question.trim() || "Untitled FAQPage";
  return "Untitled schema";
}

export function buildUnifiedSchema(draft: UnifiedSchemaDraft) {
  if (draft.schemaType === "LocalBusiness") {
    return buildLocalBusinessSchema({ ...draft.localBusiness, label: draft.label });
  }
  if (draft.schemaType === "FAQPage") {
    return buildFaqPageSchema({ ...draft.faqPage, label: draft.label });
  }
  return { "@context": "https://schema.org" };
}

export function validateUnifiedSchemaDraft(draft: UnifiedSchemaDraft) {
  const errors: UnifiedSchemaValidationIssue[] = [];
  const recommendations: UnifiedSchemaValidationIssue[] = [];

  if (!draft.schemaType) {
    recommendations.push({
      field: "schemaType",
      label: "Schema type",
      message: "Choose a schema type to load the relevant fields and JSON-LD structure.",
      severity: "recommended",
    });
    return { errors, recommendations };
  }

  const validation = draft.schemaType === "LocalBusiness"
    ? validateSchemaDraft({ ...draft.localBusiness, label: draft.label })
    : validateFaqSchemaDraft({ ...draft.faqPage, label: draft.label });

  errors.push(...validation.errors.map(issue => ({ ...issue, field: String(issue.field) })));
  recommendations.push(...validation.recommendations.map(issue => ({ ...issue, field: String(issue.field) })));

  return { errors, recommendations };
}

export function cloneUnifiedSchemaDraft(draft: UnifiedSchemaDraft): UnifiedSchemaDraft {
  return {
    ...draft,
    id: crypto.randomUUID(),
    label: draft.label ? `${draft.label} copy` : `${getSchemaBuilderTypeLabel(draft.schemaType)} copy`,
    localBusiness: {
      ...draft.localBusiness,
      id: crypto.randomUUID(),
      openingHoursRows: draft.localBusiness.openingHoursRows.map(row => ({ ...row, id: crypto.randomUUID() })),
    },
    faqPage: {
      ...draft.faqPage,
      id: crypto.randomUUID(),
      questions: draft.faqPage.questions.map(item => ({ ...item, id: crypto.randomUUID() })),
    },
  };
}
