import User from "../models/user.js";
import { hashPassword, verifyPassword } from "../utils/hash.js";
import { sendError, sendSuccess } from "../utils/response.js";

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

    req.session.userId = user.id;

    await new Promise((resolve, reject) => {
      req.session.save((error) => {
        if (error) {
          reject(error);
          return;
        }

        resolve();
      });
    });

    return sendSuccess(
      res,
      {
        username: user.username,
        role: user.role,
      },
      "Registered successfully",
      200
    );
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

    req.session.userId = user.id;

    await new Promise((resolve, reject) => {
      req.session.save((error) => {
        if (error) {
          reject(error);
          return;
        }

        resolve();
      });
    });

    return sendSuccess(
      res,
      {
        username: user.username,
        role: user.role,
      },
      "Logged in successfully",
      200
    );
  } catch (error) {
    return next(error);
  }
}

export default {
  register,
  login,
};
