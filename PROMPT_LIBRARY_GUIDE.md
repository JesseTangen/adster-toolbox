# Prompt Library Guide

The Prompt Library reads the configured tab in the Adster Resources Google Sheet directly from each visitor’s current Google account. It does not copy source prompts into the repository or persist Google access tokens.

## Team workflow

Each strategist opens **Prompt Library**, selects **Connect Google & load prompts**, and grants the read-only Google Sheets permission in the browser. Google determines which account is used and whether it already has access to the source sheet. When access is granted, the library reads the current tab, derives its categories from the sheet, and exposes search plus copy actions.

The module reloads the source when it opens, whenever **Refresh source** is selected, and every two minutes while the module remains open. This means edits in the sheet appear without a source-code or deployment update. If a Google access token expires, the strategist is asked to reconnect.

## Source columns

The importer recognizes these optional columns regardless of order: **Prompt title** or **Name**, **Prompt** or **Prompt text**, **Category**, **Description** or **Context**, and **Tags** or **Keywords**. Unrecognized columns remain available as source data without breaking the load. Empty rows are ignored.

## Google configuration

The deployed Toolbox must use a Google OAuth **Web application** client with the Google Sheets API enabled. Add each Toolbox domain as an authorized JavaScript origin. The OAuth client ID is exposed to the browser as `VITE_GOOGLE_CLIENT_ID`; the module requests only the `spreadsheets.readonly` scope. No OAuth client secret should be added to the frontend.

If Google displays `Error 401: invalid_client`, the configured identifier is not an active OAuth client suitable for this browser flow. Create or select a **Web application** client in the Google Cloud project, complete that project’s OAuth app registration, enable Google Sheets API, add the Toolbox preview and production origins, and replace `VITE_GOOGLE_CLIENT_ID` with that client’s ID.
