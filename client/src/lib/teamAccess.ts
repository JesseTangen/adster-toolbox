export const TEAM_ACCESS_SESSION_KEY = "adster-toolbox-team-access";

// This is a lightweight client-side verifier, not a security boundary. The source and
// deployed application are public, so do not use this gate to protect confidential data.
export const TEAM_ACCESS_HASH = "da7fe2dc903089e2647d1bf563b6dda2b8827a1215e721a8df0d538e0c9feb46";

export async function hashTeamAccessCode(value: string) {
  const data = new TextEncoder().encode(value);
  const digest = await crypto.subtle.digest("SHA-256", data);
  return Array.from(new Uint8Array(digest)).map(byte => byte.toString(16).padStart(2, "0")).join("");
}

export async function verifyTeamAccessCode(value: string) {
  return (await hashTeamAccessCode(value)) === TEAM_ACCESS_HASH;
}
