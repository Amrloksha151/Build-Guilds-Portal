import crypto from "node:crypto";
import { Op } from "sequelize";
import CsrfToken from "../models/csrfToken.js";
import { parseSessionTtlMs } from "./session.js";

const CSRF_TOKEN_BYTES = 32;
const CSRF_TTL_MS = parseSessionTtlMs(process.env.SESSION_TTL);

/**
 * @returns {string}
 */
export function generateRawCsrfToken() {
  return crypto.randomBytes(CSRF_TOKEN_BYTES).toString("hex");
}

/**
 * @param {string} token
 * @returns {string}
 */
export function hashCsrfToken(token) {
  return crypto.createHash("sha256").update(token).digest("hex");
}

/**
 * @param {string} sessionSid
 * @returns {Promise<{ rawToken: string, expiresAt: Date }>}
 */
export async function issueCsrfToken(sessionSid) {
  const rawToken = generateRawCsrfToken();
  const tokenHash = hashCsrfToken(rawToken);
  const expiresAt = new Date(Date.now() + CSRF_TTL_MS);

  await CsrfToken.upsert({
    id: crypto.randomUUID(),
    sessionSid,
    tokenHash,
    expiresAt,
  });

  return { rawToken, expiresAt };
}

/**
 * @param {string} sessionSid
 * @param {string} presentedToken
 * @returns {Promise<boolean>}
 */
export async function verifyCsrfToken(sessionSid, presentedToken) {
  if (!sessionSid || !presentedToken) {
    return false;
  }

  const tokenRecord = await CsrfToken.findOne({
    where: {
      sessionSid,
      expiresAt: {
        [Op.gt]: new Date(),
      },
    },
  });

  if (!tokenRecord) {
    return false;
  }

  const presentedHash = hashCsrfToken(presentedToken);
  const expectedHash = tokenRecord.tokenHash;

  if (!expectedHash) {
    return false;
  }

  const expectedBuffer = Buffer.from(expectedHash, "hex");
  const presentedBuffer = Buffer.from(presentedHash, "hex");

  if (expectedBuffer.length !== presentedBuffer.length) {
    return false;
  }

  return crypto.timingSafeEqual(expectedBuffer, presentedBuffer);
}

/**
 * @param {string} sessionSid
 * @returns {Promise<void>}
 */
export async function revokeCsrfTokens(sessionSid) {
  if (!sessionSid) {
    return;
  }

  await CsrfToken.destroy({
    where: {
      sessionSid,
    },
  });
}

/**
 * @param {string} sessionSid
 * @returns {Promise<string>}
 */
export async function createOrRotateCsrfToken(sessionSid) {
  const { rawToken } = await issueCsrfToken(sessionSid);
  return rawToken;
}
