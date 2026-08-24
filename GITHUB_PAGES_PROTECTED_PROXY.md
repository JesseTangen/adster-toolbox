# Protected Prompt Library Proxy for GitHub Pages

## Purpose

The public Toolbox remains at `https://jessetangen.github.io/adster-toolbox/`. A separate protected API serves prompt data. The browser never receives the Google service-account credential, and the prompt text is never included in the GitHub Pages artifact.

> GitHub Pages is a static hosting service. It cannot store runtime secrets, read a private Sheet, validate a webhook, or provide a protected API. [1]

## Recommended topology

| Component | Responsibility | Trust boundary |
|---|---|---|
| GitHub Pages | Serves the Toolbox shell and Prompt Library user interface. | Public; contains no prompt data or credentials. |
| Cloudflare Access | Authenticates a team member through the company identity provider and permits approved users, such as `@adster.ca` accounts. | Identity and authorization boundary. |
| Cloudflare Worker | Validates Access identity, reads the cached prompt collection, responds to the browser, and accepts signed source-change events. | Private application boundary. |
| Cloudflare KV or D1 | Stores the normalized prompt snapshot and refresh metadata. | Private cache; no Google credential. |
| Google Sheets API | Supplies the authoritative prompt content. | Read-only service-account access to one shared Sheet. |
| Bound Apps Script | Sends a signed “source changed” event after a source edit. | Refresh signal only; never sends prompt text. |

## Setup sequence

1. Create a Cloudflare account and deploy a Worker at a dedicated API host, such as `prompts-api.<company-domain>`. The GitHub Pages URL remains unchanged.
2. Configure Cloudflare Zero Trust and connect the company identity provider. Create an Access application for the API host with an **Allow** policy for the Adster domain or a specific team group. Access policies can restrict applications by identity attributes such as email domain. [2]
3. Store `GOOGLE_SERVICE_ACCOUNT_JSON`, `SHEET_ID`, `WEBHOOK_SECRET`, `POLICY_AUD`, and `TEAM_DOMAIN` as Worker secrets. Worker secrets are encrypted bindings and are not exposed by the dashboard or deployment tooling after creation. [3]
4. Share the Prompt Library Sheet with the service-account email as **Viewer**. The Worker obtains a short-lived Google token, reads the allowed sheet range, normalizes the rows, and writes the snapshot to KV or D1.
5. Add `GET /v1/prompts`. Cloudflare Access protects this route. The Worker also validates the `Cf-Access-Jwt-Assertion` signature, issuer, and Access application audience before returning cached prompts. Cloudflare recommends Worker-side JWT validation. [4]
6. Add `POST /v1/webhooks/sheets`. This route accepts no prompt content. It requires an HMAC signature, a fresh timestamp, and a replay-safe event identifier. A valid event causes the Worker to re-read the Sheet through the service account and replace the cached snapshot.
7. Add a bound Google Apps Script installable edit trigger. It sends the signed source-change event to the webhook. Optionally require a Cloudflare Access service token for this machine-to-machine request in addition to the HMAC signature.
8. Update the GitHub Pages Prompt Library to call only the API URL through `fetch`. Set CORS to the exact origin `https://jessetangen.github.io`, not to `*`, and do not place the service-account credential, an API token, or source content in the static bundle.
9. Test with a permitted and a non-permitted account. A permitted user should receive the cached prompts; a non-permitted user should receive no prompt data. Edit the Sheet and confirm that the webhook updates the cache.

## User experience and security condition

Every team member must have a real identity session at the protected API. Cloudflare Access can use the user’s existing company identity-provider session, reducing friction, but it cannot securely return proprietary data to an anonymous browser.

The public GitHub Pages shell can remain visible. The sensitive API response is protected. If the team requires the entire Toolbox interface to be private, move the Toolbox to a custom domain behind the same Access policy; the GitHub Pages-only URL cannot itself enforce the proxy’s identity policy.

## Repository changes

| Keep in the GitHub repository | Keep outside the repository |
|---|---|
| React Prompt Library UI, Worker source code, request types, webhook documentation, and deployment workflow. | Google service-account JSON, webhook HMAC secret, Access service token, cache contents, and any prompt data. |

### References

[1]: https://docs.github.com/en/pages/getting-started-with-github-pages/what-is-github-pages "GitHub Docs: About GitHub Pages"
[2]: https://developers.cloudflare.com/cloudflare-one/access-controls/policies/ "Cloudflare: Access policies"
[3]: https://developers.cloudflare.com/workers/configuration/secrets/ "Cloudflare: Worker secrets"
[4]: https://developers.cloudflare.com/cloudflare-one/access-controls/applications/http-apps/authorization-cookie/validating-json/ "Cloudflare: Validate Access JWTs"
