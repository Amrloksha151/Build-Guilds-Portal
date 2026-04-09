import { beforeEach, describe, expect, it, vi } from "vitest";

const userModel = {
  findOne: vi.fn(),
  create: vi.fn(),
};

const hashUtils = {
  hashPassword: vi.fn(),
  verifyPassword: vi.fn(),
};

const csrfUtils = {
  createOrRotateCsrfToken: vi.fn(),
  revokeCsrfTokens: vi.fn(),
};

vi.mock("../../src/models/user.js", () => ({
  default: userModel,
}));

vi.mock("../../src/utils/hash.js", () => hashUtils);
vi.mock("../../src/utils/csrf.js", () => csrfUtils);

const authControllerModule = await import("../../src/controllers/auth.controller.js");
const authController = authControllerModule.default;

function createRes() {
  return {
    statusCode: 200,
    body: null,
    status(code) {
      this.statusCode = code;
      return this;
    },
    json(payload) {
      this.body = payload;
      return this;
    },
  };
}

function createReq({ body = {}, validatedBody = null, sessionID = "guest-sid" } = {}) {
  const req = {
    body,
    validated: validatedBody ? { body: validatedBody } : undefined,
    sessionID,
    session: {
      regenerate(callback) {
        req.sessionID = "auth-sid";
        callback();
      },
      save(callback) {
        callback();
      },
      destroy(callback) {
        callback();
      },
    },
  };

  return req;
}

describe("auth.controller", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("issues CSRF token for a guest session", async () => {
    csrfUtils.createOrRotateCsrfToken.mockResolvedValue("guest-token");

    const req = createReq();
    const res = createRes();
    const next = vi.fn();

    await authController.csrfToken(req, res, next);

    expect(next).not.toHaveBeenCalled();
    expect(req.session.isGuest).toBe(true);
    expect(typeof req.session.guestAssignedAt).toBe("string");
    expect(res.statusCode).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.csrfToken).toBe("guest-token");
  });

  it("rejects duplicate usernames during registration", async () => {
    userModel.findOne.mockResolvedValue({ id: "u1" });

    const req = createReq({
      validatedBody: { username: "taken", password: "password123" },
    });
    const res = createRes();
    const next = vi.fn();

    await authController.register(req, res, next);

    expect(next).not.toHaveBeenCalled();
    expect(res.statusCode).toBe(409);
    expect(res.body.success).toBe(false);
    expect(res.body.code).toBe("USERNAME_TAKEN");
  });

  it("rotates session and returns auth payload on register", async () => {
    userModel.findOne.mockResolvedValue(null);
    hashUtils.hashPassword.mockReturnValue("hashed-password");
    userModel.create.mockResolvedValue({
      id: "user-1",
      username: "new-user",
      role: "participant",
    });
    csrfUtils.createOrRotateCsrfToken.mockResolvedValue("fresh-token");

    const req = createReq({
      validatedBody: { username: "new-user", password: "password123" },
      sessionID: "guest-sid",
    });
    const res = createRes();
    const next = vi.fn();

    await authController.register(req, res, next);

    expect(next).not.toHaveBeenCalled();
    expect(csrfUtils.revokeCsrfTokens).toHaveBeenCalledWith("guest-sid");
    expect(res.statusCode).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.user.username).toBe("new-user");
    expect(res.body.data.csrfToken).toBe("fresh-token");
    expect(req.session.isGuest).toBe(false);
  });

  it("rejects login with invalid credentials", async () => {
    userModel.findOne.mockResolvedValue({
      id: "u1",
      username: "user",
      passwordHash: "hash",
      role: "participant",
    });
    hashUtils.verifyPassword.mockReturnValue(false);

    const req = createReq({
      validatedBody: { username: "user", password: "bad-password" },
    });
    const res = createRes();
    const next = vi.fn();

    await authController.login(req, res, next);

    expect(next).not.toHaveBeenCalled();
    expect(res.statusCode).toBe(401);
    expect(res.body.success).toBe(false);
    expect(res.body.code).toBe("INVALID_CREDENTIALS");
  });

  it("logs out by revoking token and destroying session", async () => {
    csrfUtils.revokeCsrfTokens.mockResolvedValue();

    const req = createReq({ sessionID: "active-sid" });
    const res = createRes();
    const next = vi.fn();

    await authController.logout(req, res, next);

    expect(csrfUtils.revokeCsrfTokens).toHaveBeenCalledWith("active-sid");
    expect(next).not.toHaveBeenCalled();
    expect(res.statusCode).toBe(200);
    expect(res.body.success).toBe(true);
  });
});
