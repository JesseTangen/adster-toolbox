# Strategist Toolbox App Boundary

This workspace reserves `apps/toolbox` for the delivery application as the toolbox expands. The current platform-managed React and Express application remains at the repository root to preserve its established preview and static Pages build contract.

The user-facing shell is already route-based: the catalog lives at `/` and Local Schema at `/local-schema`. New modules should be added as routes first, then moved into a standalone app only when they require a distinct runtime, security boundary, release cadence, or technology stack.
