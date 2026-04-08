import crypto from "node:crypto";
import { getDb } from "../db/client.js";

export function createSessionId() {
  return crypto.randomBytes(32).toString("hex");
}

export function getSessionCookieName() {
  return process.env.SESSION_COOKIE_NAME ?? "bgp_session";
}

export function getSessionTtlMs() {
  const ttl = process.env.SESSION_TTL ?? "7d";
  const match = ttl.match(/^(\d+)([smhd])$/i);

  if (!match) {
    return 7 * 24 * 60 * 60 * 1000;
  }

  const amount = Number.parseInt(match[1], 10);
  const unit = match[2].toLowerCase();

  const multipliers = {
    s: 1000,
    m: 60 * 1000,
    h: 60 * 60 * 1000,
    d: 24 * 60 * 60 * 1000,
  };

  return amount * multipliers[unit];
}

export function getSessionExpiresAt() {
  return new Date(Date.now() + getSessionTtlMs());
}

/**
 * @param {import("express").Response} res
 * @param {string} sessionId
 */
export function setSessionCookie(res, sessionId) {
  const cookieName = getSessionCookieName();

  res.cookie(cookieName, sessionId, {
    maxAge: getSessionTtlMs(),
    httpOnly: true,
    path: "/",
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
  });
}

/**
 * @param {import("express").Response} res
 */
export function clearSessionCookie(res) {
  const cookieName = getSessionCookieName();
  res.clearCookie(cookieName, {
    httpOnly: true,
    path: "/",
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
  });
}

/**
 * @param {{ userId: string, email: string, name: string, role: string }} session
 */
export async function createSession(session) {
  const db = getDb();
  const sessionId = createSessionId();
  const expiresAt = getSessionExpiresAt();

  await db`
    insert into sessions (session_id, user_id, email, name, role, expires_at)
    values (${sessionId}, ${session.userId}, ${session.email}, ${session.name}, ${session.role}, ${expiresAt})
  `;

  return { sessionId, expiresAt };
}

/**
 * @param {string} sessionId
 */
export async function getSessionById(sessionId) {
  const db = getDb();
  const sessions = await db`
    select session_id, user_id, email, name, role, expires_at
    from sessions
    where session_id = ${sessionId}
      and expires_at > now()
    limit 1
  `;

  return sessions[0] ?? null;
}

/**
 * @param {string} sessionId
 */
export async function deleteSessionById(sessionId) {
  const db = getDb();

  await db`delete from sessions where session_id = ${sessionId}`;
}