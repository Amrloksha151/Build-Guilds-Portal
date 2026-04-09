import crypto from "node:crypto";
import { Op } from "sequelize";
import CsrfToken from "../models/csrfToken.js";
import { parseSessionTtlMs } from "./session.js";

export const CSRF_COOKIE_NAME = process.env.CSRF_COOKIE_NAME || "bgp_csrf";

const CSRF_TOKEN_BYTES = 16;
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
  if (!sessionSid) {
    const error = new Error("Session not initialized");
    error.statusCode = 401;
    error.code = "UNAUTHORIZED";
    throw error;
  }

  const rawToken = generateRawCsrfToken();
  const tokenHash = hashCsrfToken(rawToken);
  const expiresAt = new Date(Date.now() + CSRF_TTL_MS);

  const existingToken = await CsrfToken.findOne({
    where: {
      sessionSid,
    },
  });

  if (existingToken) {
    existingToken.tokenHash = tokenHash;
    existingToken.expiresAt = expiresAt;
    await existingToken.save();

    return { rawToken, expiresAt };
  }

  try {
    await CsrfToken.create({
      id: crypto.randomUUID(),
      sessionSid,
      tokenHash,
      expiresAt,
    });
  } catch (error) {
    // Handle concurrent first-write races by updating the session-scoped row.
    if (error?.name !== "SequelizeUniqueConstraintError") {
      throw error;
    }

    await CsrfToken.update(
      {
        tokenHash,
        expiresAt,
      },
      {
        where: {
          sessionSid,
        },
      }
    );
  }

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
