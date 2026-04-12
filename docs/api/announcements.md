# Announcements API

This document explains how to list and create announcements in Build Guilds Portal.

## Base path

All announcement endpoints are mounted under:

- `/api/v1/announcements`

## Security model

- Listing announcements requires an authenticated session.
- Creating announcements requires an authenticated session and an organizer or admin role.
- Creating announcements also requires CSRF protection because it uses `POST`.
- Requests must include credentials/cookies so session and CSRF cookies are sent.

## Common response envelope

Successful responses:

```json
{
  "success": true,
  "data": {},
  "message": "Optional message"
}
```

Error responses:

```json
{
  "success": false,
  "error": "Error message",
  "code": "ERROR_CODE",
  "statusCode": 400
}
```

## Announcement object

Announcements currently use this shape:

```json
{
  "id": "uuid",
  "time": "2026-04-12T10:22:17.000Z",
  "content": "Short announcement text",
  "author": "organizer_username"
}
```

## Endpoint: List announcements

- Method: `GET`
- URL: `/api/v1/announcements`
- Auth required: Yes
- CSRF required: No

Description:

- Returns all announcements ordered by newest first.

Success response (`200`):

```json
{
  "success": true,
  "data": [
    {
      "id": "9b7d4e4f-25a1-4f8c-9d15-4b6a5f8d1d9f",
      "time": "2026-04-12T10:22:17.000Z",
      "content": "Registration opens at 4 PM.",
      "author": "admin_user"
    }
  ],
  "message": "Announcements loaded"
}
```

Common errors:

- `401 UNAUTHORIZED`

## Endpoint: Create announcement

- Method: `POST`
- URL: `/api/v1/announcements/create`
- Auth required: Yes
- Role required: Organizer or Admin
- CSRF required: Yes
- CSRF cookie: `bgp_csrf`
- CSRF header: `x-csrf-token` (validated against current session)

Request body:

```json
{
  "content": "Please move to the main hall at 5 PM."
}
```

Success response (`201`):

```json
{
  "success": true,
  "data": {
    "id": "9b7d4e4f-25a1-4f8c-9d15-4b6a5f8d1d9f",
    "time": "2026-04-12T10:22:17.000Z",
    "content": "Please move to the main hall at 5 PM.",
    "author": "organizer_user"
  },
  "message": "Announcement created"
}
```

Common errors:

- `401 UNAUTHORIZED`
- `403 FORBIDDEN`
- `403 CSRF_TOKEN_REQUIRED`
- `403 CSRF_TOKEN_INVALID`
- `422 VALIDATION_ERROR`

## cURL example

```bash
# 1) Get CSRF token and store session cookies
curl -i -c cookies.txt http://localhost:3000/api/v1/auth/csrf-token

# 2) List announcements with the saved session
curl -i -b cookies.txt http://localhost:3000/api/v1/announcements

# 3) Create an announcement as an organizer/admin
curl -i -b cookies.txt -c cookies.txt \
  -H "Content-Type: application/json" \
  -H "x-csrf-token: <csrf-cookie-value>" \
  -d '{"content":"Please head to the main hall at 5 PM."}' \
  http://localhost:3000/api/v1/announcements/create
```

## Notes

- The list endpoint returns announcements newest first.
- The create endpoint stores the authenticated user's username as the announcement author.