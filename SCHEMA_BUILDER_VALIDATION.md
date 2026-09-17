# Schema Builder Validation

## Scope

The unified **Schema Builder** replaces separate schema-tool discovery with a type-aware workspace. It begins without a schema type selected, then reveals the applicable LocalBusiness or FAQPage editor after the user selects a type. Existing `/local-schema` and `/faq-schema` routes remain available for compatibility, while the dashboard and sidebar now point to `/schema-builder`.

## Functional verification

| Area | Verification result |
|---|---|
| Initial state | The browser displayed only **Your schemas**, **Identity & classification**, and **Live JSON-LD** before a schema type was chosen. The output contained only the Schema.org context. |
| Type selection | The Schema type dropdown offered **Please select** as the default, plus **LocalBusiness** and **FAQPage**. |
| LocalBusiness branch | Selecting LocalBusiness revealed the existing type picker, identity, contact, address/geo/hours, and conditional subtype fields. The live output emitted `LocalBusiness` JSON-LD and linked to the LocalBusiness specification. |
| FAQPage branch | Selecting FAQPage hid LocalBusiness fields and displayed multiple question-and-answer controls. A completed pair emitted a `FAQPage` with nested `Question` and `acceptedAnswer` values; the editor can add more pairs. |
| Saved schemas | The left-side heading reads **Your schemas**. Each saved schema shows its workspace name and schema type in monospace text. FAQPage selection and completed values restored after a full page reload. |
| Discovery and compatibility | Schema Builder is the sole Schema entry in the sidebar and dashboard. The pre-existing direct LocalBusiness and FAQ URLs are retained as compatibility routes. |
| Responsive layout | Authenticated 1440 px and 375 px checks passed. The mobile view stacks the workspace without document-level horizontal overflow; long code lines scroll inside the code panel rather than widening the viewport. |

## Automated and build verification

The complete Vitest suite passed with **21 test files and 49 tests**, including four dedicated unified-schema core tests. TypeScript checking passed. The full-stack `pnpm build` and custom-domain GitHub Pages `pnpm build:pages` targets both completed successfully, and the Pages artifact contains Schema Builder.

## Schema type picker refinement

The native Schema type `select` was replaced with the same Popover/Command picker pattern used by the LocalBusiness `@type` control. Both controls now share the two-line, monospace-label trigger, chevron affordance, rounded popover surface, option checkmark, keyboard-accessible command items, hover/focus styling, and responsive width. Browser verification confirmed the menu exposes **Please select**, **LocalBusiness**, and **FAQPage** with concise descriptions; selecting LocalBusiness updates the trigger and displays the matching editor. The full suite passed with **22 test files and 51 tests**, along with TypeScript, full-stack, and GitHub Pages builds.
