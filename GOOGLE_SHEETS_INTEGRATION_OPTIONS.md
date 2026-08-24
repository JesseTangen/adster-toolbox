# Google Sheets Integration Options — Verified Notes

## Source-backed facts

- The Google Sheets API reads structured spreadsheet cell values, and spreadsheet and sheet identifiers remain stable even when their titles change. Source: [Google Sheets API concepts](https://developers.google.com/workspace/sheets/api/guides/concepts).
- A Google Workspace service account is an application identity rather than an end user. For a specific Sheet, it can be granted direct access by sharing that sheet with the service account email at Viewer level; domain-wide delegation is not required for this narrow use case. Source: [Google Workspace credentials](https://developers.google.com/workspace/guides/create-credentials).
- A server-to-server service account flow lets an application call Google APIs without involving end users. Source: [OAuth 2.0 for service accounts](https://developers.google.com/identity/protocols/oauth2/service-account).
- Google Drive notifications can notify an HTTPS webhook when a watched file changes, but require a receiving endpoint and notification channels must be renewed. Source: [Google Drive push notifications](https://developers.google.com/workspace/drive/api/guides/push).
- An Apps Script installable edit trigger can run after a spreadsheet value edit and runs as its creator; it can invoke services that require authorization. Source: [Apps Script installable triggers](https://developers.google.com/apps-script/guides/triggers/installable).

## Architecture implication

For the proprietary Prompt Library sheet, the practical low-friction baseline is a server-side service account with read-only, sheet-specific access. Keep its key out of source control and the browser, read the source through the Toolbox backend, and serve only the prompt records to users who pass the existing Toolbox access gate. Add an Apps Script webhook or Drive change notification only if immediate propagation is needed; otherwise refresh on module load plus a short server cache or a scheduled refresh.
