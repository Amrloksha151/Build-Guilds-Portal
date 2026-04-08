export const ROLES = Object.freeze({
  GUEST: "guest",
  PARTICIPANT: "participant",
  ORGANIZER: "organizer",
  ADMIN: "admin",
});

export const ROLE_ORDER = [ROLES.GUEST, ROLES.PARTICIPANT, ROLES.ORGANIZER, ROLES.ADMIN];

export const ACTIVITY_STATUSES = Object.freeze({
  UPCOMING: "upcoming",
  LIVE: "live",
  COMPLETED: "completed",
  CANCELLED: "cancelled",
});
