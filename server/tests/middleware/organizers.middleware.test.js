import { beforeEach, describe, expect, it, vi } from "vitest";

const middlewareModule = await import("../../src/middleware/organizers.middleware.js");
const organizersMiddleware = middlewareModule.default;

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

function createReq(user = null) {
  return { user };
}

describe("organizers.middleware", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("returns unauthorized when req.user is missing", () => {
    const req = createReq();
    const res = createRes();
    const next = vi.fn();

    organizersMiddleware(req, res, next);

    expect(next).not.toHaveBeenCalled();
    expect(res.statusCode).toBe(401);
    expect(res.body.success).toBe(false);
    expect(res.body.code).toBe("UNAUTHORIZED");
  });

  it("returns forbidden for participant role", () => {
    const req = createReq({
      id: "u-1",
      username: "participant",
      role: "participant",
    });
    const res = createRes();
    const next = vi.fn();

    organizersMiddleware(req, res, next);

    expect(next).not.toHaveBeenCalled();
    expect(res.statusCode).toBe(403);
    expect(res.body.success).toBe(false);
    expect(res.body.code).toBe("FORBIDDEN");
  });

  it("allows organizer role", () => {
    const req = createReq({
      id: "u-2",
      username: "organizer",
      role: "organizer",
    });
    const res = createRes();
    const next = vi.fn();

    organizersMiddleware(req, res, next);

    expect(next).toHaveBeenCalledTimes(1);
    expect(res.body).toBeNull();
  });

  it("allows admin role", () => {
    const req = createReq({
      id: "u-3",
      username: "admin",
      role: "admin",
    });
    const res = createRes();
    const next = vi.fn();

    organizersMiddleware(req, res, next);

    expect(next).toHaveBeenCalledTimes(1);
    expect(res.body).toBeNull();
  });
});
