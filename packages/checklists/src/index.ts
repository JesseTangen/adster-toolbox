export type ChecklistItem = {
  id: string;
  label: string;
  required?: boolean;
};

export type ChecklistDefinition = {
  id: string;
  name: string;
  items: ChecklistItem[];
};

export const checklistDefinitions: ChecklistDefinition[] = [
  {
    id: "strategy-handoff",
    name: "Strategy handoff review",
    items: [
      { id: "objective", label: "Page objective and audience are documented.", required: true },
      { id: "content", label: "Content requirements and source inputs are identified.", required: true },
      { id: "measurement", label: "Measurement requirements are noted before handoff.", required: true },
      { id: "review", label: "Stakeholder review path is confirmed." },
    ],
  },
];
