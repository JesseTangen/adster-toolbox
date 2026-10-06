export type HowToStepDraft = {
  id: string;
  name: string;
  text: string;
  image: string;
};

export type HowToSchemaDraft = {
  id: string;
  label: string;
  name: string;
  description: string;
  url: string;
  image: string;
  estimatedCost: string;
  prepTime: string;
  performTime: string;
  totalTime: string;
  yield: string;
  supply: string;
  tool: string;
  steps: HowToStepDraft[];
};

export type HowToSchemaValidationIssue = {
  field: "name" | "url" | "image" | "timing" | "steps";
  label: string;
  message: string;
  severity: "error" | "recommended";
};

function compact(record: Record<string, unknown>) {
  return Object.fromEntries(
    Object.entries(record).filter(([, value]) => {
      if (typeof value === "string") return value.trim().length > 0;
      if (Array.isArray(value)) return value.length > 0;
      return value !== undefined && value !== null;
    }),
  );
}

function splitList(value: string) {
  return value
    .split(/\n|,/)
    .map(item => item.trim())
    .filter(Boolean);
}

function isUrl(value: string) {
  try {
    const url = new URL(value);
    return url.protocol === "https:" || url.protocol === "http:";
  } catch {
    return false;
  }
}

function isIso8601Duration(value: string) {
  return /^P(?=\d|T\d)(?:\d+Y)?(?:\d+M)?(?:\d+D)?(?:T(?=\d)(?:\d+H)?(?:\d+M)?(?:\d+(?:\.\d+)?S)?)?$/.test(value);
}

export function createHowToStepDraft(): HowToStepDraft {
  return {
    id: crypto.randomUUID(),
    name: "",
    text: "",
    image: "",
  };
}

export function createHowToSchemaDraft(): HowToSchemaDraft {
  return {
    id: crypto.randomUUID(),
    label: "",
    name: "",
    description: "",
    url: "",
    image: "",
    estimatedCost: "",
    prepTime: "",
    performTime: "",
    totalTime: "",
    yield: "",
    supply: "",
    tool: "",
    steps: [createHowToStepDraft()],
  };
}

export function buildHowToSchema(draft: HowToSchemaDraft) {
  const steps = draft.steps
    .filter(item => item.text.trim().length > 0)
    .map((item, index) => compact({
      "@type": "HowToStep",
      position: index + 1,
      name: item.name,
      text: item.text,
      image: item.image,
    }));

  return compact({
    "@context": "https://schema.org",
    "@type": "HowTo",
    name: draft.name,
    description: draft.description,
    url: draft.url,
    image: draft.image,
    estimatedCost: draft.estimatedCost,
    prepTime: draft.prepTime,
    performTime: draft.performTime,
    totalTime: draft.totalTime,
    yield: draft.yield,
    supply: splitList(draft.supply),
    tool: splitList(draft.tool),
    step: steps,
  });
}

export function validateHowToSchemaDraft(draft: HowToSchemaDraft) {
  const errors: HowToSchemaValidationIssue[] = [];
  const recommendations: HowToSchemaValidationIssue[] = [];
  const populatedSteps = draft.steps.filter(item => item.name.trim() || item.text.trim() || item.image.trim());

  if (!draft.name.trim()) {
    recommendations.push({
      field: "name",
      label: "name",
      message: "Add the visible title of the instructions.",
      severity: "recommended",
    });
  }

  if (!draft.url.trim()) {
    recommendations.push({
      field: "url",
      label: "url",
      message: "Add the canonical URL of the page containing these instructions.",
      severity: "recommended",
    });
  } else if (!isUrl(draft.url.trim())) {
    errors.push({ field: "url", label: "url", message: "Use a valid absolute URL.", severity: "error" });
  }

  if (draft.image.trim() && !isUrl(draft.image.trim())) {
    errors.push({ field: "image", label: "image", message: "Use a valid absolute image URL.", severity: "error" });
  }

  for (const [field, label, value] of [
    ["prepTime", "prepTime", draft.prepTime],
    ["performTime", "performTime", draft.performTime],
    ["totalTime", "totalTime", draft.totalTime],
  ] as const) {
    if (value.trim() && !isIso8601Duration(value.trim())) {
      errors.push({
        field: "timing",
        label,
        message: "Use ISO 8601 duration, for example PT15M or PT1H30M.",
        severity: "error",
      });
    }
  }

  if (populatedSteps.length === 0) {
    recommendations.push({
      field: "steps",
      label: "step",
      message: "Add at least one visible instruction step.",
      severity: "recommended",
    });
  }

  populatedSteps.forEach(item => {
    const number = draft.steps.indexOf(item) + 1;
    if (!item.text.trim()) {
      errors.push({
        field: "steps",
        label: `Step ${number}`,
        message: "Add the visible instruction text for this step.",
        severity: "error",
      });
    }
    if (item.image.trim() && !isUrl(item.image.trim())) {
      errors.push({
        field: "steps",
        label: `Step ${number} image`,
        message: "Use a valid absolute image URL.",
        severity: "error",
      });
    }
  });

  return { errors, recommendations };
}
