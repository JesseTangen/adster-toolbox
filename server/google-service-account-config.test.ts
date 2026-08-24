import { createSign } from "node:crypto";
import { describe, expect, it } from "vitest";

type ServiceAccountCredential = {
  client_email?: string;
  private_key?: string;
  token_uri?: string;
};

function encode(value: string) {
  return Buffer.from(value).toString("base64url");
}

function normalizePrivateKey(privateKey: string) {
  return privateKey
    .replace(/-----BEGIN\s*PRIVATE\s*KEY-----/, "-----BEGIN PRIVATE KEY-----")
    .replace(/-----END\s*PRIVATE\s*KEY-----/, "-----END PRIVATE KEY-----");
}

function createAssertion(credential: Required<Pick<ServiceAccountCredential, "client_email" | "private_key">> & ServiceAccountCredential) {
  const now = Math.floor(Date.now() / 1000);
  const header = encode(JSON.stringify({ alg: "RS256", typ: "JWT" }));
  const claims = encode(JSON.stringify({
    iss: credential.client_email,
    scope: "https://www.googleapis.com/auth/spreadsheets.readonly",
    aud: credential.token_uri ?? "https://oauth2.googleapis.com/token",
    iat: now,
    exp: now + 300,
  }));
  const unsigned = `${header}.${claims}`;
  const signer = createSign("RSA-SHA256");
  signer.update(unsigned);
  signer.end();
  return `${unsigned}.${signer.sign(normalizePrivateKey(credential.private_key), "base64url")}`;
}

describe("Google service-account configuration", () => {
  it("exchanges the server-only service-account JSON for a Google Sheets read token", async () => {
    const rawCredential = process.env.GOOGLE_SERVICE_ACCOUNT_JSON;
    expect(rawCredential).toBeTruthy();
    const credential = JSON.parse(rawCredential!) as ServiceAccountCredential;
    expect(credential.client_email).toMatch(/\.iam\.gserviceaccount\.com$/);
    expect(typeof credential.private_key).toBe("string");
    const normalizedPrivateKey = normalizePrivateKey(credential.private_key!);
    expect(normalizedPrivateKey.startsWith("-----BEGIN PRIVATE KEY-----\n")).toBe(true);
    expect(normalizedPrivateKey.endsWith("-----END PRIVATE KEY-----\n")).toBe(true);

    const response = await fetch(credential.token_uri ?? "https://oauth2.googleapis.com/token", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({
        grant_type: "urn:ietf:params:oauth:grant-type:jwt-bearer",
        assertion: createAssertion(credential as Required<Pick<ServiceAccountCredential, "client_email" | "private_key">> & ServiceAccountCredential),
      }),
    });
    const result = await response.json() as { access_token?: string; error_description?: string };
    expect(response.ok, result.error_description).toBe(true);
    expect(result.access_token).toMatch(/^ya29\./);
  }, 15_000);
});
