export type ToolStatus = "available" | "planned";

export type ToolboxTool = {
  id: string;
  name: string;
  category: "Schema" | "Planning" | "Quality";
  description: string;
  path?: string;
  status: ToolStatus;
  eyebrow: string;
};

export const toolboxTools: ToolboxTool[] = [
  {
    id: "local-schema",
    name: "LocalBusiness Schema",
    category: "Schema",
    description: "Build, validate, save, and copy LocalBusiness JSON-LD for location pages.",
    path: "/local-schema",
    status: "available",
    eyebrow: "Structured data",
  },
  {
    id: "other-schema",
    name: "Other Schema",
    category: "Schema",
    description: "A future workspace for the next schema patterns your strategy team standardizes.",
    status: "planned",
    eyebrow: "Structured data",
  },
  {
    id: "wireframe-builder",
    name: "Wireframe Builder",
    category: "Planning",
    description: "Turn strategic page requirements into shareable content and wireframe briefs.",
    path: "/wireframe-builder",
    status: "available",
    eyebrow: "Experience planning",
  },
  {
    id: "qa-checklists",
    name: "QA Checklists",
    category: "Quality",
    description: "Run reusable launch and handoff checklists without leaving the strategist workspace.",
    status: "planned",
    eyebrow: "Delivery quality",
  },
];

export const toolboxCategories = ["All tools", "Schema", "Planning", "Quality"] as const;
export type ToolboxCategory = (typeof toolboxCategories)[number];
