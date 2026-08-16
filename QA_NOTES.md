# API-free GitHub Pages QA notes

## 2026-08-14 — Maps removal verification

The Google Maps import panel, map canvas, Places search, and API-key-based loader were removed from the static application. The remaining experience is manual business-data entry, client-side JSON-LD generation, validation, clipboard copy, and session-only schema storage.

| Check | Result | Evidence |
|---|---|---|
| TypeScript | Passed | `pnpm check` completed without errors. |
| Automated tests | Passed | `pnpm test` completed with 2 test files and 5 tests passing. |
| GitHub Pages artifact | Passed | `pnpm build:pages` completed and produced `dist/public`. |
| Desktop layout | Passed | Verified at 1280×720: the left workspace panel, manual entry form, JSON-LD preview, and schema check align without a Maps panel. |
| Tablet layout | Passed | Verified at 768×1024: workspace, form, preview, and validation sections stack cleanly with no horizontal clipping. |
| Mobile layout | Passed | Verified at 375×812: action controls remain available, fields stay within the viewport, and the preview and validation cards follow the form in a readable order. |

No layout regressions were observed at the verified breakpoints, so no responsive CSS changes were required.

## 2026-08-14 — Updated header logo verification

The header SVG has been replaced with the owner-supplied updated blue logo. The image is embedded as a PNG data URI in the client bundle, so the GitHub Pages artifact does not rely on a hosted runtime asset.

| Check | Result | Evidence |
|---|---|---|
| TypeScript | Passed | `pnpm check` completed without errors after the logo update. |
| Automated tests | Passed | `pnpm test` completed with 3 test files and 6 tests passing, including a bundled-logo regression check. |
| GitHub Pages artifact | Passed | `pnpm build:pages` compiled the embedded logo into the static output. |
| Desktop header | Passed | Verified at 1280×720: the updated blue logo displays alongside the Schema Studio wordmark without changing the header layout. |
| Mobile header | Passed | Verified at 375×812: the updated blue logo remains visible and proportionate beside the wordmark and Save control. |

No header spacing or responsive adjustments were required after the logo replacement.

## 2026-08-14 — Adster Schema Studio title verification

The requested title change is present in the application header as **“Adster Schema Studio.”** At the 1280×720 desktop breakpoint, the full title displays beside the supplied blue logo, remains distinct from the supporting LocalBusiness JSON-LD label, and does not displace the header navigation or Save control. A focused regression test now asserts that the requested title remains in the header source.
