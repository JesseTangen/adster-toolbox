# Strategist Toolbox Architecture

The **Strategist Toolbox** is a single internal product that presents focused strategy utilities through one shared catalog, navigation model, visual system, and release process. The present application makes the existing LocalBusiness generator the first route-based module at `/local-schema`, while the toolbox catalog at `/` provides search and category-based discovery for the current and planned modules.

> The guiding rule is to isolate **tool-specific logic** without fragmenting the strategist experience. A module remains a route in the toolbox until it has a materially different runtime, security boundary, release cadence, or technology stack.

## Workspace layout

| Location | Responsibility | Current state |
|---|---|---|
| `/` | Platform-managed React/Express delivery application, Vite build configuration, and the shared toolbox shell. | Active application runtime. |
| `apps/toolbox` | Reserved application boundary for a future extracted toolbox delivery package. | Scaffolded intentionally; the active delivery runtime remains at the repository root to preserve the established preview and static Pages contract. |
| `packages/schema-core` | Pure LocalBusiness schema generation, validation, type catalogs, and associated domain types. | Active and consumed by the Local Schema route and tests. |
| `packages/config` | Toolbox tool registry, category definitions, and other product-level configuration. | Active and consumed by the landing catalog and tests. |
| `packages/ui` | Shared visual primitives and composable strategist-tool interface patterns. | Active; the toolbox catalog consumes its shared available and planned card treatments. |
| `packages/checklists` | Checklist definitions and reusable item types for future QA and delivery workflows. | Active; it provides the initial four-point strategy handoff definition used by the toolbox landing page. |

The repository is configured as a pnpm workspace through `pnpm-workspace.yaml`. Internal package imports use named boundaries such as `@adster/schema-core` and `@adster/toolbox-config`, allowing new tools to reuse stable contracts instead of reaching into another module’s implementation files.

## Tool module contract

Every tool begins with an entry in `packages/config/src/tool-registry.ts`. The registry records its stable ID, category, user-facing description, route, and availability status. The toolbox catalog uses this configuration to render discovery cards and the side navigation exposes active and planned modules consistently.

| Module | Route | Shared dependency | Status |
|---|---|---|---|
| Local Schema | `/local-schema` | `@adster/schema-core` | Available |
| Other Schema | To be assigned | `@adster/schema-core` | Planned |
| Wireframe Builder | To be assigned | `@adster/toolbox-ui`, `@adster/toolbox-config` | Planned |
| QA Checklists | To be assigned | `@adster/checklists`, `@adster/toolbox-ui` | Planned |

A future module should use the shared sidebar and catalog first, declare its domain data in the most focused shared package possible, register a route in `client/src/App.tsx`, and then add a concise registry record. Its tests should exercise the package contract independently of the page, as the Local Schema and toolbox registry tests do today.

## Deployment and access direction

The project retains one build and deployment pipeline. The portable `build:pages` command remains available for the existing GitHub Pages workflow, while the managed preview continues to support the root application. This means a strategist enters through one protected distribution point selected by the team, not a tool-specific deployment per module.

The present Local Schema experience remains API-free and session-based so it can run in the portable build. The root application is therefore the supported toolbox shell for the current workspace: it is the single place that owns routing, the shared sidebar, the catalog, and both managed-preview and portable-build configuration. If the toolbox later requires identity-specific data, persistent drafts, or role-based controls, that addition should be designed once at this root application boundary and then shared across modules rather than implemented separately inside each tool.

## Extraction decision

Keep a tool as a route when it shares the same strategist audience, client runtime, UI patterns, and release timing. Promote it to a separate application or repository only when the tool needs an independently managed client relationship, a different security model, a release schedule that would create coordination overhead, or a technology stack that cannot be maintained within the toolbox runtime. This decision preserves coherence for the team while leaving a deliberate path for genuinely independent products.
