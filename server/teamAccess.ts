import { createHmac, timingSafeEqual } from "node:crypto";
import type { Request } from "express";

export const TEAM_ACCESS_COOKIE = "adster_team_access";
const SESSION_DURATION_MS = 1000 * 60 * 60 * 12;

function requiredSecret(name: "TEAM_ACCESS_CODE" | "JWT_SECRET") {
  const value = process.env[name];
  if (!value) throw new Error(`${name} is not configured.`);
  return value;
}

function safeEquals(left: string, right: string) {
  const leftBuffer = Buffer.from(left);
  const rightBuffer = Buffer.from(right);
  return leftBuffer.length === rightBuffer.length && timingSafeEqual(leftBuffer, rightBuffer);
}

function signature(payload: string) {
  return createHmac("sha256", requiredSecret("JWT_SECRET")).update(`adster-team-access.${payload}`).digest("base64url");
}

function getCookie(header: string, name: string) {
  return header.split(";").map(entry => entry.trim()).find(entry => entry.startsWith(`${name}=`))?.slice(name.length + 1);
}

function serializeCookie(value: string, maxAge: number) {
  const secure = process.env.NODE_ENV === "production" ? "; Secure" : "";
  return `${TEAM_ACCESS_COOKIE}=${value}; Path=/; HttpOnly; SameSite=Lax; Max-Age=${maxAge}${secure}`;
}

export function verifyTeamAccessCode(code: string) {
  return safeEquals(code, requiredSecret("TEAM_ACCESS_CODE"));
}

export function createTeamAccessSession(now = Date.now()) {
  const expiresAt = now + SESSION_DURATION_MS;
  const payload = String(expiresAt);
  return `${payload}.${signature(payload)}`;
}

export function hasTeamAccess(request: Pick<Request, "headers">, now = Date.now()) {
  const rawCookie = request.headers.cookie;
  if (!rawCookie) return false;
  const token = getCookie(rawCookie, TEAM_ACCESS_COOKIE);
  if (!token) return false;
  const [expiresAtValue, providedSignature, ...rest] = token.split(".");
  const expiresAt = Number(expiresAtValue);
  return rest.length === 0 && Number.isFinite(expiresAt) && expiresAt > now && Boolean(providedSignature) && safeEquals(providedSignature, signature(expiresAtValue));
}

export function teamAccessCookie(token: string) {
  return serializeCookie(token, Math.floor(SESSION_DURATION_MS / 1000));
}

export function clearTeamAccessCookie() {
  return serializeCookie("", 0);
}
