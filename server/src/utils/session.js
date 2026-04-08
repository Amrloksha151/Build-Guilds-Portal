const DEFAULT_SESSION_TTL = "7d";

/**
 * @param {string | undefined} ttl
 * @returns {number}
 */
export function parseSessionTtlMs(ttl) {
  const value = (ttl || DEFAULT_SESSION_TTL).trim();
  const match = value.match(/^(\d+)([smhd])$/i);

  if (!match) {
    return 7 * 24 * 60 * 60 * 1000;
  }

  const amount = Number(match[1]);
  const unit = match[2].toLowerCase();

  if (unit === "s") return amount * 1000;
  if (unit === "m") return amount * 60 * 1000;
  if (unit === "h") return amount * 60 * 60 * 1000;
  return amount * 24 * 60 * 60 * 1000;
}

/**
 * @param {boolean} isProduction
 * @returns {{ httpOnly: boolean, secure: boolean, sameSite: "lax", path: string, maxAge: number }}
 */
export function buildSessionCookieOptions(isProduction) {
  return {
    httpOnly: true,
    secure: isProduction,
    sameSite: "lax",
    path: "/",
    maxAge: parseSessionTtlMs(process.env.SESSION_TTL),
  };
}
