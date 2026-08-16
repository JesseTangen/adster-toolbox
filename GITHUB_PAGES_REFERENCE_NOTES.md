# GitHub Pages deployment references

## GitHub Pages workflow setup

GitHub’s custom-workflow documentation confirms that repository Pages must be enabled before a custom workflow can publish, and that `actions/configure-pages@v5` is the standard configuration step. The repository Pages configuration was verified as workflow-based at `https://jessetangen.github.io/Adster-Schema-Studio/`.

Source: <https://docs.github.com/en/pages/getting-started-with-github-pages/using-custom-workflows-with-github-pages>

## Pages initialization caveat

The `enablement` input in `actions/configure-pages@v5` can attempt to enable Pages, but the action manifest specifies that it requires a token other than the default `GITHUB_TOKEN` and appropriate repository or Pages administration permissions. Therefore this repository uses the one-time repository Settings → Pages enablement flow instead.

Source: <https://raw.githubusercontent.com/actions/configure-pages/v5/action.yml>

## Client router base path

Wouter documents the `Router base` property for applications deployed in a subfolder. The client router uses Vite’s generated base URL so routes remain relative to `/Adster-Schema-Studio/` in the GitHub Pages build.

Source: <https://github.com/molefrog/wouter>
