import crypto from "node:crypto";
import User from "../models/user.js";
import { hashPassword, verifyPassword } from "../utils/hash.js";
import { createOrRotateCsrfToken, revokeCsrfTokens } from "../utils/csrf.js";
import { sendError, sendSuccess } from "../utils/response.js";

function saveSession(session) {
  return new Promise((resolve, reject) => {
    session.save((error) => {
      if (error) {
        reject(error);
        return;
      }

      resolve();
    });
  });
}

function regenerateSession(req) {
  return new Promise((resolve, reject) => {
    req.session.regenerate((error) => {
      if (error) {
        reject(error);
        return;
      }

      resolve();
    });
  });
}

async function issueAuthPayload(req, user, message) {
  const previousSessionSid = req.sessionID;

  await regenerateSession(req);

  if (previousSessionSid && previousSessionSid !== req.sessionID) {
    await revokeCsrfTokens(previousSessionSid);
  }

  req.session.userId = user.id;
  req.session.isGuest = false;
  delete req.session.guestAssignedAt;
  req.session.authenticatedAt = new Date().toISOString();
  req.session.csrfBootstrap = crypto.randomUUID();
  req.session.csrfTokenIssuedAt = new Date().toISOString();

  const csrfToken = await createOrRotateCsrfToken(req.sessionID);

  await saveSession(req.session);

  return {
    user: {
      username: user.username,
      role: user.role,
    },
    csrfToken,
    message,
  };
}

/**
 * @param {import('express').Request} req
 * @param {import('express').Response} res
 * @param {import('express').NextFunction} next
 */
async function register(req, res, next) {
  try {
    const { username, password } = req.validated?.body || req.body;
    const normalizedUsername = username.trim();

    const existingUser = await User.findOne({
      where: { username: normalizedUsername },
    });

    if (existingUser) {
      return sendError(res, "Username already exists", "USERNAME_TAKEN", 409);
    }

    const passwordHash = hashPassword(password);

    const user = await User.create({
      username: normalizedUsername,
      passwordHash,
    });

    const payload = await issueAuthPayload(req, user, "Registered successfully");

    return sendSuccess(res, payload, payload.message, 200);
  } catch (error) {
    return next(error);
  }
}

/**
 * @param {import('express').Request} req
 * @param {import('express').Response} res
 * @param {import('express').NextFunction} next
 */
async function login(req, res, next) {
  try {
    const { username, password } = req.validated?.body || req.body;

    const user = await User.findOne({
      where: { username: username.trim() },
    });

    if (!user || !verifyPassword(password, user.passwordHash)) {
      return sendError(res, "Invalid credentials", "INVALID_CREDENTIALS", 401);
    }

    const payload = await issueAuthPayload(req, user, "Logged in successfully");

    return sendSuccess(res, payload, payload.message, 200);
  } catch (error) {
    return next(error);
  }
}

/**
 * @param {import('express').Request} req
 * @param {import('express').Response} res
 * @param {import('express').NextFunction} next
 */
async function csrfToken(req, res, next) {
  try {
    if (!req.session.userId) {
      req.session.isGuest = true;
      req.session.guestAssignedAt = req.session.guestAssignedAt || new Date().toISOString();
    }

    req.session.csrfBootstrap = req.session.csrfBootstrap || crypto.randomUUID();
    req.session.csrfTokenIssuedAt = new Date().toISOString();

    const csrfToken = await createOrRotateCsrfToken(req.sessionID);
    await saveSession(req.session);

    return sendSuccess(res, { csrfToken }, "CSRF token issued", 200);
  } catch (error) {
    return next(error);
  }
}

/**
 * @param {import('express').Request} req
 * @param {import('express').Response} res
 * @param {import('express').NextFunction} next
 */
async function logout(req, res, next) {
  try {
    const sessionSid = req.sessionID;
    await revokeCsrfTokens(sessionSid);

    await new Promise((resolve, reject) => {
      req.session.destroy((error) => {
        if (error) {
          reject(error);
          return;
        }

        resolve();
      });
    });

    return sendSuccess(res, null, "Logged out successfully", 200);
  } catch (error) {
    return next(error);
  }
}

export default {
  register,
  login,
  csrfToken,
  logout,
};
