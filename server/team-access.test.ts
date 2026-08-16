import { describe, expect, it } from "vitest";
import { TEAM_ACCESS_HASH, hashTeamAccessCode, verifyTeamAccessCode } from "../client/src/lib/teamAccess";

describe("team access verifier", () => {
  it("uses a SHA-256 verifier instead of storing the clear-text access code", async () => {
    expect(TEAM_ACCESS_HASH).toMatch(/^[a-f0-9]{64}$/);
    expect(await hashTeamAccessCode("")).toBe("e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855");
  });

  it("rejects an empty access attempt", async () => {
    expect(await verifyTeamAccessCode("")).toBe(false);
  });
});
