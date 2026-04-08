import crypto from "node:crypto";

const SALT_BYTES = 16;

/**
 * @returns {string}
 */
export function generateSalt() {
  return crypto.randomBytes(SALT_BYTES).toString("hex");
}

/**
 * @param {string} password
 * @param {string} salt
 * @returns {string}
 */
export function sha256(password, salt) {
  return crypto.createHash("sha256").update(`${salt}:${password}`).digest("hex");
}

/**
 * Stores password as "salt:hash" so no extra DB column is required.
 * @param {string} password
 * @returns {string}
 */
export function hashPassword(password) {
  const salt = generateSalt();
  const digest = sha256(password, salt);
  return `${salt}:${digest}`;
}

/**
 * @param {string} password
 * @param {string} storedValue
 * @returns {boolean}
 */
export function verifyPassword(password, storedValue) {
  if (!storedValue || !storedValue.includes(":")) {
    return false;
  }

  const [salt, storedHash] = storedValue.split(":");

  if (!salt || !storedHash) {
    return false;
  }

  const computedHash = sha256(password, salt);

  return crypto.timingSafeEqual(
    Buffer.from(computedHash, "hex"),
    Buffer.from(storedHash, "hex")
  );
}
