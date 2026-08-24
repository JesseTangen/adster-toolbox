import { describe, expect, it } from "vitest";
import { clearTeamAccessCookie, createTeamAccessSession, hasTeamAccess, teamAccessCookie, verifyTeamAccessCode } from "./teamAccess";

describe("server-enforced Team access", () => {
  it("validates the server-only access code without retaining it in the client", () => {
    expect(verifyTeamAccessCode(process.env.TEAM_ACCESS_CODE!)).toBe(true);
    expect(verifyTeamAccessCode("not-the-team-code")).toBe(false);
  });

  it("accepts a signed, unexpired HTTP-only session and rejects a tampered value", () => {
    const now = 1_730_000_000_000;
    const token = createTeamAccessSession(now);
    expect(hasTeamAccess({ headers: { cookie: `adster_team_access=${token}` } }, now + 1)).toBe(true);
    expect(hasTeamAccess({ headers: { cookie: `adster_team_access=${token}x` } }, now + 1)).toBe(false);
    expect(teamAccessCookie(token)).toContain("HttpOnly");
    expect(clearTeamAccessCookie()).toContain("Max-Age=0");
  });
});
