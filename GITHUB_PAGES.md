# GitHub Pages deployment

This repository now includes a static GitHub Pages build. It publishes the React client at:

```
https://jessetangeng.github.io/localbusiness-schema-builder/
```

## One-time repository configuration

In **Settings → Pages**, set the publishing source to **GitHub Actions**. Do not publish the repository root directly from the `main` branch: the source repository contains TypeScript and application source, while GitHub Pages needs the built `dist/public` artifact.

No API key, external service, or repository secret is required. The static tool is designed for manual business-data entry, client-side JSON-LD generation, and session-only saved locations.

## Deploying

Every push to `main` runs `.github/workflows/deploy-pages.yml`. The workflow installs dependencies, runs `pnpm build:pages`, uploads `dist/public`, and deploys the artifact to Pages. You can also start it manually from the repository **Actions** tab.

The static version keeps the JSON-LD generator and session-based saved locations. It intentionally does not call the Manus Express, tRPC, OAuth, or third-party data APIs, as GitHub Pages cannot run server-side services and this build requires no external API configuration.
