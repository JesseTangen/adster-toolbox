export const approvedToolCategories = ["All tools", "UTM", "Design"] as const;
export type ApprovedToolCategory = (typeof approvedToolCategories)[number];

export type ApprovedTool = {
  id: string;
  name: string;
  category: Exclude<ApprovedToolCategory, "All tools">;
  description: string;
  url: string;
  outcomes: string[];
};

// Add new approved resources here. Each entry is rendered as a new-tab external link.
export const approvedTools: ApprovedTool[] = [
  {
    id: "campaign-url-builder",
    name: "Campaign URL Builder",
    category: "UTM",
    description: "Create campaign-tagged URLs that pass UTM parameters into Google Analytics for clear campaign attribution.",
    url: "https://ga-dev-tools.google/campaign-url-builder/",
    outcomes: ["Campaign tracking", "Google Analytics", "URL parameters"],
  },
  {
    id: "canva",
    name: "Canva",
    category: "Design",
    description: "Create on-brand visual assets, presentations, social content, and simple design collateral for strategic work.",
    url: "https://www.canva.com/",
    outcomes: ["Visual design", "Presentations", "Social content"],
  },
];
