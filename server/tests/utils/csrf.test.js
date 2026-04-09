import { beforeEach, describe, expect, it, vi } from "vitest";

const csrfTokenModel = {
  findOne: vi.fn(),
  create: vi.fn(),
  update: vi.fn(),
};

vi.mock("../../src/models/csrfToken.js", () => ({
  default: csrfTokenModel,
}));

const csrfUtils = await import("../../src/utils/csrf.js");

describe("utils/csrf issueCsrfToken", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("throws unauthorized error when session id is missing", async () => {
    await expect(csrfUtils.issueCsrfToken("")).rejects.toMatchObject({
      statusCode: 401,
      code: "UNAUTHORIZED",
    });
  });

  it("updates existing token row for the same session", async () => {
    const save = vi.fn().mockResolvedValue();
    csrfTokenModel.findOne.mockResolvedValue({
      tokenHash: "old-hash",
      expiresAt: new Date(0),
      save,
    });

    const result = await csrfUtils.issueCsrfToken("sid-existing");

    expect(csrfTokenModel.create).not.toHaveBeenCalled();
    expect(save).toHaveBeenCalledTimes(1);
    expect(result.rawToken).toMatch(/^[a-f0-9]{32}$/);
  });

  it("creates token row when none exists", async () => {
    csrfTokenModel.findOne.mockResolvedValue(null);
    csrfTokenModel.create.mockResolvedValue();

    const result = await csrfUtils.issueCsrfToken("sid-new");

    expect(csrfTokenModel.create).toHaveBeenCalledTimes(1);
    expect(csrfTokenModel.update).not.toHaveBeenCalled();
    expect(result.rawToken).toMatch(/^[a-f0-9]{32}$/);
  });

  it("falls back to update on unique-constraint create race", async () => {
    csrfTokenModel.findOne.mockResolvedValue(null);

    const raceError = new Error("duplicate key value violates unique constraint");
    raceError.name = "SequelizeUniqueConstraintError";
    csrfTokenModel.create.mockRejectedValue(raceError);
    csrfTokenModel.update.mockResolvedValue([1]);

    const result = await csrfUtils.issueCsrfToken("sid-race");

    expect(csrfTokenModel.create).toHaveBeenCalledTimes(1);
    expect(csrfTokenModel.update).toHaveBeenCalledTimes(1);
    expect(result.rawToken).toMatch(/^[a-f0-9]{32}$/);
  });
});
