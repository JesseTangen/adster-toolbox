import { createHmac } from "node:crypto";
import { describe, expect, it } from "vitest";
import { isValidPromptLibraryWebhook } from "./promptLibraryWebhook";

describe("Prompt Library sheet-edit webhook", () => {
  it("accepts a current HMAC-signed event and rejects tampered or stale events", () => {
    const secret = process.env.PROMPT_LIBRARY_WEBHOOK_SECRET;
    expect(secret).toBeTruthy();
    const now = 1_730_000_000_000;
    const timestamp = String(now);
    const body = JSON.stringify({ event: "sheet-edit", sheetId: "configured-source" });
    const signature = createHmac("sha256", secret!).update(`${timestamp}.${body}`).digest("hex");

    expect(isValidPromptLibraryWebhook(timestamp, signature, body, now)).toBe(true);
    expect(isValidPromptLibraryWebhook(timestamp, `${signature.slice(0, -1)}0`, body, now)).toBe(false);
    expect(isValidPromptLibraryWebhook(String(now - 300_001), signature, body, now)).toBe(false);
  });
});
