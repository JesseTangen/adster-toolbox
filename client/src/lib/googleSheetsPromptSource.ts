import { parsePromptLibraryRows, type PromptLibraryItem } from "@adster/prompt-library";

declare global {
  interface Window {
    google?: {
      accounts?: {
        oauth2?: {
          initTokenClient: (config: GoogleTokenClientConfig) => GoogleTokenClient;
        };
      };
    };
  }
}

type GoogleTokenResponse = { access_token?: string; error?: string; error_description?: string };
type GoogleTokenClient = { requestAccessToken: (overrides?: { prompt?: string }) => void };
type GoogleTokenClientConfig = {
  client_id: string;
  scope: string;
  callback: (response: GoogleTokenResponse) => void;
  error_callback?: (response: GoogleTokenResponse) => void;
};

type SheetMetadataResponse = {
  properties?: { title?: string };
  sheets?: Array<{ properties?: { sheetId?: number; title?: string } }>;
};

type SheetValuesResponse = { values?: string[][] };

export type PromptSheetSnapshot = {
  title: string;
  items: PromptLibraryItem[];
};

const GOOGLE_IDENTITY_SCRIPT_ID = "adster-google-identity-services";
export const PROMPT_LIBRARY_SHEET_ID = "1cbrkAG-pC8Ne4lL4bBiviNdfVM9dnMrXgydoHefRvAI";
export const PROMPT_LIBRARY_SHEET_GID = 422903836;
export const PROMPT_LIBRARY_SHEET_URL = `https://docs.google.com/spreadsheets/d/${PROMPT_LIBRARY_SHEET_ID}/edit?gid=${PROMPT_LIBRARY_SHEET_GID}`;
const SHEETS_READONLY_SCOPE = "https://www.googleapis.com/auth/spreadsheets.readonly";

function getClientId() {
  const clientId = import.meta.env.VITE_GOOGLE_CLIENT_ID as string | undefined;
  if (!clientId) throw new Error("Google sign-in is not configured for this Toolbox deployment.");
  return clientId;
}

function loadGoogleIdentityServices() {
  if (window.google?.accounts?.oauth2) return Promise.resolve();

  return new Promise<void>((resolve, reject) => {
    const existing = document.getElementById(GOOGLE_IDENTITY_SCRIPT_ID) as HTMLScriptElement | null;
    const script = existing ?? document.createElement("script");
    const finish = () => window.google?.accounts?.oauth2 ? resolve() : reject(new Error("Google sign-in did not initialize."));

    script.addEventListener("load", finish, { once: true });
    script.addEventListener("error", () => reject(new Error("Google sign-in could not be loaded.")), { once: true });
    if (!existing) {
      script.id = GOOGLE_IDENTITY_SCRIPT_ID;
      script.src = "https://accounts.google.com/gsi/client";
      script.async = true;
      script.defer = true;
      document.head.appendChild(script);
    }
  });
}

/** Opens Google’s account-and-consent dialog and returns a short-lived, in-browser Sheets read token. */
export async function requestPromptSheetAccessToken(selectAccount = true) {
  await loadGoogleIdentityServices();
  const oauth = window.google?.accounts?.oauth2;
  if (!oauth) throw new Error("Google sign-in is unavailable in this browser.");

  return new Promise<string>((resolve, reject) => {
    const client = oauth.initTokenClient({
      client_id: getClientId(),
      scope: SHEETS_READONLY_SCOPE,
      callback: response => response.access_token ? resolve(response.access_token) : reject(new Error(response.error_description || response.error || "Google did not grant sheet access.")),
      error_callback: response => reject(new Error(response.error_description || response.error || "Google sign-in was interrupted.")),
    });
    client.requestAccessToken({ prompt: selectAccount ? "select_account" : "" });
  });
}

async function googleFetch<T>(path: string, accessToken: string) {
  const response = await fetch(`https://sheets.googleapis.com/v4/${path}`, {
    headers: { Authorization: `Bearer ${accessToken}` },
  });
  if (!response.ok) {
    const message = await response.text();
    throw new Error(response.status === 401 ? "Google access has expired. Connect your account again to refresh the library." : response.status === 403 ? "This Google account does not have access to the Prompt Library sheet." : `Google Sheets could not load the source (${response.status}). ${message}`);
  }
  return response.json() as Promise<T>;
}

/** Reads the latest rows from the protected source tab using only the signed-in browser user’s granted access. */
export async function getPromptSheetSnapshot(accessToken: string): Promise<PromptSheetSnapshot> {
  const metadata = await googleFetch<SheetMetadataResponse>(`spreadsheets/${PROMPT_LIBRARY_SHEET_ID}?fields=properties.title,sheets.properties`, accessToken);
  const sheet = metadata.sheets?.find(entry => entry.properties?.sheetId === PROMPT_LIBRARY_SHEET_GID)?.properties;
  if (!sheet?.title) throw new Error("The configured Prompt Library tab could not be found in this sheet.");

  const range = encodeURIComponent(`${sheet.title}!A:ZZ`);
  const values = await googleFetch<SheetValuesResponse>(`spreadsheets/${PROMPT_LIBRARY_SHEET_ID}/values/${range}?valueRenderOption=FORMATTED_VALUE`, accessToken);

  return { title: sheet.title, items: parsePromptLibraryRows(values.values ?? []) };
}
