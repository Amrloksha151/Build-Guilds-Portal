import { beforeEach, describe, expect, it, vi } from "vitest";

const csrfUtils = {
  verifyCsrfToken: vi.fn(),
};

vi.mock("../../src/utils/csrf.js", () => csrfUtils);

const middlewareModule = await import("../../src/middleware/csrf.middleware.js");
const csrfMiddleware = middlewareModule.default;

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

function createReq({ method = "POST", sessionID = "sid-1", headerToken } = {}) {
  return {
    method,
    sessionID,
    get(headerName) {
      if (headerName.toLowerCase() === "x-csrf-token") {
        return headerToken;
      }
      return undefined;
    },
  };
}

describe("csrf.middleware", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("skips validation for safe methods", async () => {
    const req = createReq({ method: "GET" });
    const res = createRes();
    const next = vi.fn();

    await csrfMiddleware(req, res, next);

    expect(next).toHaveBeenCalledTimes(1);
    expect(csrfUtils.verifyCsrfToken).not.toHaveBeenCalled();
  });

  it("rejects missing csrf header", async () => {
    const req = createReq();
    const res = createRes();
    const next = vi.fn();

    await csrfMiddleware(req, res, next);

    expect(next).not.toHaveBeenCalled();
    expect(res.statusCode).toBe(403);
    expect(res.body.code).toBe("CSRF_TOKEN_REQUIRED");
  });

  it("rejects invalid header token for the current session", async () => {
    csrfUtils.verifyCsrfToken.mockResolvedValue(false);

    const req = createReq({
      headerToken: "invalid-token",
    });
    const res = createRes();
    const next = vi.fn();

    await csrfMiddleware(req, res, next);

    expect(next).not.toHaveBeenCalled();
    expect(res.statusCode).toBe(403);
    expect(res.body.code).toBe("CSRF_TOKEN_INVALID");
    expect(csrfUtils.verifyCsrfToken).toHaveBeenCalledWith("sid-1", "invalid-token");
  });

  it("accepts header token when server-side session-bound token check passes", async () => {
    csrfUtils.verifyCsrfToken.mockResolvedValue(true);

    const req = createReq({
      headerToken: "valid-token",
    });
    const res = createRes();
    const next = vi.fn();

    await csrfMiddleware(req, res, next);

    expect(csrfUtils.verifyCsrfToken).toHaveBeenCalledWith("sid-1", "valid-token");
    expect(next).toHaveBeenCalledTimes(1);
  });
});
