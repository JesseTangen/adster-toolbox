# Team Access gate

The Toolbox uses a **lightweight front-end access gate** to keep the shared workflow out of casual view. It hashes the entered access code in the browser, compares that value with the verifier in `client/src/lib/teamAccess.ts`, and stores a successful check only in `sessionStorage`. Closing the browser session or selecting **Sign out** requires the code again.

> This is intentionally a convenience gate, not strong authentication. The repository and static deployment are public, so it must not be used to protect credentials, client data, or other confidential material.

| Change | Location | Notes |
|---|---|---|
| Change the shared access code | `client/src/lib/teamAccess.ts` | Replace `TEAM_ACCESS_HASH` with the SHA-256 hash of the replacement code; do not commit the plain-text value. |
| Change the access-screen language | `client/src/pages/TeamAccess.tsx` | Keep the lightweight-security notice intact and accurate. |
| Change session behaviour | `client/src/App.tsx` | The current gate intentionally uses `sessionStorage`, so access expires when the browser session ends. |

## Validation notes

The access screen keeps the brand block, shared-code field, primary action, and lightweight-security notice readable at desktop and narrow mobile widths. A live browser check confirmed that an invalid code is rejected, a valid code grants session-only access to the Toolbox and protected routes, and **Sign out** returns the browser to the access screen.
