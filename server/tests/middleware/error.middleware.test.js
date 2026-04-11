import { describe, expect, it, vi } from "vitest";
import { errorMiddleware } from "../../src/middleware/error.middleware.js";

describe("error.middleware", () => {
  it("delegates to next when headers were already sent", () => {
    const err = new Error("already written");
    const req = {};
    const res = {
      headersSent: true,
      status: vi.fn(),
      json: vi.fn(),
    };
    const next = vi.fn();

    errorMiddleware(err, req, res, next);

    expect(next).toHaveBeenCalledWith(err);
    expect(res.status).not.toHaveBeenCalled();
    expect(res.json).not.toHaveBeenCalled();
  });

  it("writes standardized error payload when headers are not sent", () => {
    const err = new Error("boom");
    const req = {};
    const payloadState = { statusCode: null, body: null };
    const res = {
      headersSent: false,
      status(code) {
        payloadState.statusCode = code;
        return this;
      },
      json(payload) {
        payloadState.body = payload;
        return this;
      },
    };
    const next = vi.fn();

    errorMiddleware(err, req, res, next);

    expect(next).not.toHaveBeenCalled();
    expect(payloadState.statusCode).toBe(500);
    expect(payloadState.body).toMatchObject({
      success: false,
      error: "Internal server error",
      code: "INTERNAL_SERVER_ERROR",
      statusCode: 500,
    });
  });
});
