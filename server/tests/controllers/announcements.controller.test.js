import { beforeEach, describe, expect, it, vi } from "vitest";

const announcementModel = {
  findAll: vi.fn(),
  create: vi.fn(),
};

vi.mock("../../src/models/announcement.js", () => ({
  default: announcementModel,
}));

const controllerModule = await import("../../src/controllers/announcements.controller.js");
const announcementsController = controllerModule.default;

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

function createReq({ body = {}, validatedBody = null, user = null } = {}) {
  return {
    body,
    validated: validatedBody ? { body: validatedBody } : undefined,
    user,
  };
}

describe("announcements.controller", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("lists announcements ordered by newest first", async () => {
    announcementModel.findAll.mockResolvedValue([
      { id: "a-2", content: "second" },
      { id: "a-1", content: "first" },
    ]);

    const req = createReq();
    const res = createRes();
    const next = vi.fn();

    await announcementsController.getAnnouncements(req, res, next);

    expect(next).not.toHaveBeenCalled();
    expect(announcementModel.findAll).toHaveBeenCalledWith({
      order: [["time", "DESC"]],
    });
    expect(res.statusCode).toBe(200);
    expect(res.body.success).toBe(true);
    expect(Array.isArray(res.body.data)).toBe(true);
  });

  it("creates announcement using validated body when available", async () => {
    announcementModel.create.mockResolvedValue({
      id: "a-1",
      content: "validated content",
      author: "organizer",
    });

    const req = createReq({
      body: { content: "raw content" },
      validatedBody: { content: "validated content" },
      user: {
        id: "u-1",
        username: "organizer",
        role: "organizer",
      },
    });
    const res = createRes();
    const next = vi.fn();

    await announcementsController.createAnnouncement(req, res, next);

    expect(next).not.toHaveBeenCalled();
    expect(announcementModel.create).toHaveBeenCalledWith(
      expect.objectContaining({
        content: "validated content",
        author: "organizer",
        time: expect.any(Date),
      })
    );
    expect(res.statusCode).toBe(201);
    expect(res.body.success).toBe(true);
    expect(res.body.data.id).toBe("a-1");
  });

  it("forwards model errors to next", async () => {
    const failure = new Error("db failed");
    announcementModel.findAll.mockRejectedValue(failure);

    const req = createReq();
    const res = createRes();
    const next = vi.fn();

    await announcementsController.getAnnouncements(req, res, next);

    expect(next).toHaveBeenCalledWith(failure);
    expect(res.body).toBeNull();
  });
});
