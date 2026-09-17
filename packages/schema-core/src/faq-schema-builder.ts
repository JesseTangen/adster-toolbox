export type FaqQuestionDraft = {
  id: string;
  question: string;
  answer: string;
};

export type FaqSchemaDraft = {
  id: string;
  label: string;
  questions: FaqQuestionDraft[];
};

export type FaqSchemaValidationIssue = {
  field: "questions";
  label: string;
  message: string;
  severity: "error" | "recommended";
};

export type FaqPageSchema = {
  "@context": "https://schema.org";
  "@type": "FAQPage";
  mainEntity: Array<{
    "@type": "Question";
    name: string;
    acceptedAnswer: {
      "@type": "Answer";
      text: string;
    };
  }>;
};

export function createFaqQuestionDraft(): FaqQuestionDraft {
  return {
    id: crypto.randomUUID(),
    question: "",
    answer: "",
  };
}

export function createFaqSchemaDraft(): FaqSchemaDraft {
  return {
    id: crypto.randomUUID(),
    label: "",
    questions: [createFaqQuestionDraft()],
  };
}

export function buildFaqPageSchema(draft: FaqSchemaDraft): FaqPageSchema {
  const mainEntity = draft.questions
    .filter(item => item.question.trim().length > 0 && item.answer.trim().length > 0)
    .map(item => ({
      "@type": "Question" as const,
      name: item.question.trim(),
      acceptedAnswer: {
        "@type": "Answer" as const,
        text: item.answer.trim(),
      },
    }));

  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity,
  };
}

export function validateFaqSchemaDraft(draft: FaqSchemaDraft) {
  const errors: FaqSchemaValidationIssue[] = [];
  const recommendations: FaqSchemaValidationIssue[] = [];
  const populatedQuestions = draft.questions.filter(item => item.question.trim().length > 0 || item.answer.trim().length > 0);

  if (populatedQuestions.length === 0) {
    recommendations.push({
      field: "questions",
      label: "mainEntity",
      message: "Add at least one visible question and its answer to build an FAQPage.",
      severity: "recommended",
    });
  }

  populatedQuestions.forEach((item, index) => {
    const questionNumber = draft.questions.indexOf(item) + 1;
    if (!item.question.trim()) {
      errors.push({
        field: "questions",
        label: `Question ${questionNumber}`,
        message: "Add the exact visible question before publishing this FAQ entry.",
        severity: "error",
      });
    }
    if (!item.answer.trim()) {
      errors.push({
        field: "questions",
        label: `Answer ${questionNumber}`,
        message: "Add the exact visible answer before publishing this FAQ entry.",
        severity: "error",
      });
    }
  });

  return { errors, recommendations };
}
