# Approved Tools validation

The **Approved Tool Directory** is an active Toolbox module at `/approved-tools` and is available from the dashboard card and persistent sidebar. Its updateable catalog is defined in `packages/config/src/approved-tools.ts`, where each entry supplies its name, category, description, URL, and searchable outcome terms. Adding a future approved resource requires one additional catalog record; the directory and filters update automatically.

The initial catalog contains Google’s Campaign URL Builder under **UTM** and Canva under **Design**. Each card uses an external anchor with `target="_blank"` and `rel="noopener noreferrer"`, so resources open in a separate tab without handing the new page access to the original Toolbox context. Search matches the tool name, category, description, and outcome terms; category filters narrow the current catalog without changing the search input.

Browser verification confirmed the UTM filter isolates Campaign URL Builder, a Canva search isolates Canva, both links retain their intended destinations and safe new-tab attributes, and the directory has no document-level horizontal overflow at 1440 px or 390 px. Visual review confirmed the requested light card treatment, category pills, search field, two-column desktop grid, and stacked mobile presentation.
