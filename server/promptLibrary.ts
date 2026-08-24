import { createSign } from "node:crypto";
import { parsePromptLibraryRows, type PromptLibraryItem } from "@adster/prompt-library";
import { getPromptLibrarySnapshot, savePromptLibrarySnapshot } from "./db";

type ServiceAccountCredential = {
  client_email?: string;
  private_key?: string;
  token_uri?: string;
};

type SheetMetadata = {
  properties?: { title?: string };
  sheets?: Array<{ properties?: { sheetId?: number; title?: string } }>;
};

type SheetValues = { values?: string[][] };

export type PromptLibrarySnapshot = {
  sourceTitle: string;
  items: PromptLibraryItem[];
  refreshedAt: Date;
};

const SHEET_ID = "1cbrkAG-pC8Ne4lL4bBiviNdfVM9dnMrXgydoHefRvAI";
const SHEET_GID = 422903836;
const CACHE_WINDOW_MS = 1000 * 60 * 5;

function encode(value: string) {
  return Buffer.from(value).toString("base64url");
}

export function normalizeServiceAccountPrivateKey(privateKey: string) {
  return privateKey
    .replace(/-----BEGIN\s*PRIVATE\s*KEY-----/, "-----BEGIN PRIVATE KEY-----")
    .replace(/-----END\s*PRIVATE\s*KEY-----/, "-----END PRIVATE KEY-----");
}

function getCredential(): Required<Pick<ServiceAccountCredential, "client_email" | "private_key">> & ServiceAccountCredential {
  const raw = process.env.GOOGLE_SERVICE_ACCOUNT_JSON;
  if (!raw) throw new Error("The Prompt Library source credential is not configured.");
  let credential: ServiceAccountCredential;
  try {
    credential = JSON.parse(raw) as ServiceAccountCredential;
  } catch {
    throw new Error("The Prompt Library source credential is not valid JSON.");
  }
  if (!credential.client_email || !credential.private_key) throw new Error("The Prompt Library source credential is incomplete.");
  return credential as Required<Pick<ServiceAccountCredential, "client_email" | "private_key">> & ServiceAccountCredential;
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
  return `${unsigned}.${signer.sign(normalizeServiceAccountPrivateKey(credential.private_key), "base64url")}`;
}

async function fetchGoogleAccessToken() {
  const credential = getCredential();
  const response = await fetch(credential.token_uri ?? "https://oauth2.googleapis.com/token", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      grant_type: "urn:ietf:params:oauth:grant-type:jwt-bearer",
      assertion: createAssertion(credential),
    }),
  });
  const result = await response.json() as { access_token?: string };
  if (!response.ok || !result.access_token) throw new Error("Google could not authorize the Prompt Library source reader.");
  return result.access_token;
}

async function googleFetch<T>(path: string, token: string) {
  const response = await fetch(`https://sheets.googleapis.com/v4/${path}`, { headers: { Authorization: `Bearer ${token}` } });
  if (!response.ok) throw new Error(response.status === 403 ? "The Prompt Library service account does not have access to the configured Sheet." : "Google Sheets could not load the Prompt Library source.");
  return response.json() as Promise<T>;
}

export async function fetchPromptLibrarySource(): Promise<Omit<PromptLibrarySnapshot, "refreshedAt">> {
  const token = await fetchGoogleAccessToken();
  const metadata = await googleFetch<SheetMetadata>(`spreadsheets/${SHEET_ID}?fields=properties.title,sheets.properties`, token);
  const tab = metadata.sheets?.find(entry => entry.properties?.sheetId === SHEET_GID)?.properties;
  if (!tab?.title) throw new Error("The configured Prompt Library tab could not be found in the source Sheet.");
  const range = encodeURIComponent(`${tab.title}!A:ZZ`);
  const values = await googleFetch<SheetValues>(`spreadsheets/${SHEET_ID}/values/${range}?valueRenderOption=FORMATTED_VALUE`, token);
  return { sourceTitle: tab.title, items: parsePromptLibraryRows(values.values ?? []) };
}

export async function refreshPromptLibrary() {
  const source = await fetchPromptLibrarySource();
  const refreshedAt = new Date();
  await savePromptLibrarySnapshot({ ...source, refreshedAt });
  return { ...source, refreshedAt };
}

export async function getCurrentPromptLibrary() {
  const cached = await getPromptLibrarySnapshot();
  if (cached && Date.now() - cached.refreshedAt.getTime() < CACHE_WINDOW_MS) return cached;
  return refreshPromptLibrary();
}
