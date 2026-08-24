# Prompt Library Sheet-Edit Webhook Setup

The Prompt Library now reads its private source through the Toolbox server’s Google service account. It does not require individual strategists to sign in to Google. The Sheet’s Apps Script sends a signed **change signal** after an editor updates the source; it does not send prompt content. The server verifies that signal, then independently re-reads the Sheet with the read-only service account and updates its cache.

## Before configuring the trigger

Publish the full-stack Toolbox after its final checkpoint. GitHub Pages alone cannot receive a signed server webhook or hold the service-account credential. Set `WEBHOOK_URL` below to the deployed Toolbox URL followed by `/api/prompt-library/sync`.

## Apps Script

Open the source Sheet, then select **Extensions → Apps Script**. Replace the starter code with the following. Set `WEBHOOK_URL` to the deployed URL and set `WEBHOOK_SECRET` to the same value stored in the company password manager and in the Toolbox’s `PROMPT_LIBRARY_WEBHOOK_SECRET` setting. Never paste either value into GitHub or a shared document.

```javascript
const WEBHOOK_URL = "https://YOUR-TOOLBOX-DOMAIN/api/prompt-library/sync";
const WEBHOOK_SECRET = "PASTE_THE_SHARED_WEBHOOK_SECRET_HERE";

function onPromptLibraryEdit(event) {
  const timestamp = String(Date.now());
  const payload = JSON.stringify({
    event: "sheet-edit",
    sheetId: event.source.getId(),
    editedRange: event.range.getA1Notation(),
  });
  const signatureBytes = Utilities.computeHmacSha256Signature(`${timestamp}.${payload}`, WEBHOOK_SECRET);
  const signature = signatureBytes.map(byte => (`0${(byte & 0xff).toString(16)}`).slice(-2)).join("");

  UrlFetchApp.fetch(WEBHOOK_URL, {
    method: "post",
    contentType: "application/json",
    payload,
    headers: {
      "X-Adster-Timestamp": timestamp,
      "X-Adster-Signature": signature,
    },
    muteHttpExceptions: true,
  });
}
```

In the Apps Script sidebar, select **Triggers**, then **Add Trigger**. Choose the `onPromptLibraryEdit` function, event source **From spreadsheet**, and event type **On edit**. Complete the authorization prompt using a Sheet owner or a designated automation owner. Apps Script installable triggers run under their creator’s authorization, so record that owner in your internal credentials vault.

## Verification

Edit a non-critical cell in the source tab and wait a few seconds. The server should return HTTP `202`, then the Prompt Library module should show the new source cache when it is reopened or refreshed. If a request is rejected, confirm that the timestamp is current, the exact secret matches in both places, and the deployed URL is correct.
