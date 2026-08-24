import { createHmac, timingSafeEqual } from "node:crypto";
import type { Request, Response } from "express";
import { refreshPromptLibrary } from "./promptLibrary";

const MAX_WEBHOOK_AGE_MS = 1000 * 60 * 5;

function signature(timestamp: string, body: string) {
  const secret = process.env.PROMPT_LIBRARY_WEBHOOK_SECRET;
  if (!secret) throw new Error("Prompt Library webhook signing is not configured.");
  return createHmac("sha256", secret).update(`${timestamp}.${body}`).digest("hex");
}

export function isValidPromptLibraryWebhook(timestamp: string | undefined, providedSignature: string | undefined, body: string, now = Date.now()) {
  if (!timestamp || !providedSignature || !/^[a-f0-9]{64}$/i.test(providedSignature)) return false;
  const timestampValue = Number(timestamp);
  if (!Number.isFinite(timestampValue) || Math.abs(now - timestampValue) > MAX_WEBHOOK_AGE_MS) return false;
  try {
    const expected = signature(timestamp, body);
    return timingSafeEqual(Buffer.from(providedSignature, "hex"), Buffer.from(expected, "hex"));
  } catch {
    return false;
  }
}

export async function promptLibraryWebhook(request: Request & { rawBody?: Buffer }, response: Response) {
  const body = request.rawBody?.toString("utf8") ?? JSON.stringify(request.body ?? {});
  const timestamp = request.header("x-adster-timestamp") ?? undefined;
  const providedSignature = request.header("x-adster-signature") ?? undefined;
  if (!isValidPromptLibraryWebhook(timestamp, providedSignature, body)) return response.status(401).json({ error: "Invalid Prompt Library webhook signature." });

  try {
    const snapshot = await refreshPromptLibrary();
    return response.status(202).json({ refreshedAt: snapshot.refreshedAt.toISOString(), promptCount: snapshot.items.length });
  } catch {
    return response.status(502).json({ error: "Prompt Library source refresh failed." });
  }
}
