# QA Checklists maintenance guide

The **QA Checklists** module reads its entire catalog from `packages/checklists/src/index.ts`. Each definition contains a stable ID, a user-facing name, a short description, optional update label, and a list of sections. Each section contains concise check items, with optional guidance and a required flag. This structure keeps checklist maintenance close to the domain content rather than the page UI.

| Change needed | Where to edit | Result |
|---|---|---|
| Add a QA list | Append one `ChecklistDefinition` to `checklistDefinitions` | A new selectable list appears in the QA workspace automatically. |
| Add or revise a check | Edit the relevant section’s `items` list | The active checklist shows the revised item and tracks it independently. |
| Add a review grouping | Append a `section()` entry to a definition | The workspace renders a new collapsible section with its own completion count. |
| Change the landing-card text | Edit `packages/config/src/tool-registry.ts` | The Toolbox catalog reflects the revised description. |

Progress and per-check evidence notes are stored locally in the strategist’s browser, keyed by checklist ID. Each check exposes a compact **Add note** control for an owner, follow-up, evidence link, or review finding. This information is intentionally not shared between browsers or users, so a future multi-user rollout can replace this local persistence with a shared project record without changing the catalog shape.

## Validation notes

The SEO workflow rendered with five grouped review sections at desktop width, while the mobile layout stacked the list library, progress card, sections, and review-status panels without clipping checklist controls. The per-check note affordance remains compact as an **Add note** disclosure under each item at both widths. A live browser test also confirmed that all five named QA lists are selectable, a completed SEO check and its evidence note persist through page reload, the **Remaining** filter hides completed checks, and Technical QA displays its update label.
