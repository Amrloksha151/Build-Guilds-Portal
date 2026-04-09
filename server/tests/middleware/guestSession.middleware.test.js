import { beforeEach, describe, expect, it, vi } from "vitest";

const csrfUtils = {
  createOrRotateCsrfToken: vi.fn(),
};

vi.mock("../../src/utils/csrf.js", () => csrfUtils);

const middlewareModule = await import("../../src/middleware/guestSession.middleware.js");
const guestSessionMiddleware = middlewareModule.default;

function createReq({ sessionOverrides = {}, sessionID = "guest-sid" } = {}) {
  const req = {
    sessionID,
    session: {
      save(callback) {
        callback();
      },
      ...sessionOverrides,
    },
  };

  return req;
}

describe("guestSession.middleware", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("skips bootstrap when request is already authenticated", async () => {
    const req = createReq({
      sessionOverrides: { userId: "user-1" },
    });
    const res = {};
    const next = vi.fn();

    await guestSessionMiddleware(req, res, next);

    expect(csrfUtils.createOrRotateCsrfToken).not.toHaveBeenCalled();
    expect(next).toHaveBeenCalledTimes(1);
  });

  it("bootstraps guest flags and initial csrf token", async () => {
    csrfUtils.createOrRotateCsrfToken.mockResolvedValue("token");

    const req = createReq();
    const res = {};
    const next = vi.fn();

    await guestSessionMiddleware(req, res, next);

    expect(req.session.isGuest).toBe(true);
    expect(typeof req.session.guestAssignedAt).toBe("string");
    expect(typeof req.session.csrfBootstrap).toBe("string");
    expect(typeof req.session.csrfTokenIssuedAt).toBe("string");
    expect(csrfUtils.createOrRotateCsrfToken).toHaveBeenCalledWith("guest-sid");
    expect(next).toHaveBeenCalledTimes(1);
  });

  it("does not re-bootstrap when guest markers already exist", async () => {
    const req = createReq({
      sessionOverrides: {
        isGuest: true,
        guestAssignedAt: new Date().toISOString(),
        csrfBootstrap: "bootstrap-id",
        csrfTokenIssuedAt: new Date().toISOString(),
      },
    });
    const res = {};
    const next = vi.fn();

    await guestSessionMiddleware(req, res, next);

    expect(csrfUtils.createOrRotateCsrfToken).not.toHaveBeenCalled();
    expect(next).toHaveBeenCalledTimes(1);
  });
});
