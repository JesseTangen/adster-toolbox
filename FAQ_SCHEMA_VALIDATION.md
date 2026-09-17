# FAQ Schema Validation

## Scope

The **FAQ Schema** module is available at `/faq-schema` in the Adster Creative Toolbox. It follows the established LocalBusiness Schema workspace pattern: a session-saved schema list, an active workspace, a live copyable JSON-LD script panel, field-level guidance, and a direct link to the applicable Schema.org definition. The generated document represents `FAQPage` through a `mainEntity` array of `Question` items, each with a nested `acceptedAnswer` of type `Answer`, consistent with the FAQPage specification.[1]

## Functional verification

| Area | Verification result |
|---|---|
| Multiple FAQ pairs | Two independently entered question-and-answer pairs were rendered as separate `mainEntity` items in the live JSON-LD. |
| Required pair validation | A question without an answer, or an answer without a question, produces an explicit correction and is excluded from output until complete. |
| Content fidelity | The editor labels both values as exact visible content and includes a reminder that the published page must expose the same FAQ material. |
| Session workspace | Naming and editing a schema created an automatic saved-session entry; the active schema and both completed pairs restored after a full page reload. |
| Module discovery | The Dashboard, shared schema category, and sidebar navigation expose **FAQ Schema** as an available route. |
| Responsive layout | Authenticated desktop and 375 px mobile captures showed the workspace, editor, live code, validation panel, and copy control without horizontal overflow. |

## Automated and build verification

The full Vitest suite passed with **20 test files and 45 tests**, including dedicated FAQPage construction, incomplete-pair exclusion, validation, and toolbox-registry coverage. TypeScript checking passed. Both the full-stack `pnpm build` and GitHub Pages `pnpm build:pages` targets completed successfully, and the root-domain Pages artifact contains the FAQ Schema module.

## References

[1]: https://schema.org/FAQPage "Schema.org FAQPage"
