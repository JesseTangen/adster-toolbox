import { describe, expect, it } from "vitest";

const clientId = process.env.VITE_GOOGLE_CLIENT_ID;

describe("Google OAuth configuration", () => {
  it("provides a browser OAuth client that Google accepts for an authorization request", async () => {
    expect(clientId).toMatch(/^[\w-]+\.apps\.googleusercontent\.com$/);

    const response = await fetch(
      `https://accounts.google.com/o/oauth2/v2/auth?client_id=${encodeURIComponent(clientId!)}&redirect_uri=${encodeURIComponent("https://localhost")}&response_type=token&scope=${encodeURIComponent("https://www.googleapis.com/auth/spreadsheets.readonly")}`,
      { redirect: "manual" },
    );

    expect([200, 302]).toContain(response.status);
    expect((await response.text()).toLowerCase()).not.toContain("invalid_client");
  }, 15_000);
});
