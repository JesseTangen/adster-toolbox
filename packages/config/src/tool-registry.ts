export type ToolStatus = "available" | "planned";

export type ToolboxTool = {
  id: string;
  name: string;
  category: "Schema" | "Planning" | "Quality" | "Knowledge";
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
    id: "knowledge-base",
    name: "Knowledge Base",
    category: "Knowledge",
    description: "A future shared reference library for strategy methods, examples, and team guidance.",
    status: "planned",
    eyebrow: "Shared knowledge",
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
    description: "Run SEO, Technical, User, Content, and Google Ads QA workflows from one reusable review workspace.",
    path: "/qa-checklists",
    status: "available",
    eyebrow: "Delivery quality",
  },
  {
    id: "prompt-library",
    name: "Prompt Library",
    category: "Planning",
    description: "A future collection of reusable prompts for research, planning, and production workflows.",
    status: "planned",
    eyebrow: "Reusable prompts",
  },
];

export const toolboxCategories = ["All tools", "Schema", "Planning", "Quality", "Knowledge"] as const;
export type ToolboxCategory = (typeof toolboxCategories)[number];
