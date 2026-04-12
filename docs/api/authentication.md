# Authentication API

This document explains how to use the current authentication system for Build Guild Portal.

## Base path

All authentication endpoints are mounted under:

- `/api/v1/auth`

## Security model

- Authentication state is stored in a server-side session.
- Session ID is sent in an HttpOnly cookie.
- CSRF protection is required for unsafe HTTP methods (`POST`, `PATCH`, `PUT`, `DELETE`).
- CSRF token is delivered in the `bgp_csrf` cookie (or `CSRF_COOKIE_NAME` value if overridden).
- For unsafe methods, clients must send the token in the `x-csrf-token` request header.
- Server verifies the header token against the token stored for the current session.
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

## Endpoint: Get CSRF token

- Method: `GET`
- URL: `/api/v1/auth/csrf-token`
- Auth required: No
- CSRF header required: No

Description:

- Issues or rotates a CSRF token for the current session.
- For anonymous visitors, this works with guest session flow and sets a CSRF cookie bound to that guest session.
- The token format is 32 hexadecimal characters.

Example response:

```json
{
  "success": true,
  "data": {
    "csrfCookie": "bgp_csrf"
  },
  "message": "CSRF token issued"
}
```

## Endpoint: Register

- Method: `POST`
- URL: `/api/v1/auth/register`
- Auth required: No
- CSRF required: Yes
- CSRF cookie: `bgp_csrf`
- CSRF header: `x-csrf-token` (validated against current session)

Request body:

```json
{
  "username": "new_user",
  "password": "strong_password"
}
```

Success response (`200`):

```json
{
  "success": true,
  "data": {
    "user": {
      "username": "new_user",
      "role": "participant"
    },
    "message": "Registered successfully"
  },
  "message": "Registered successfully"
}
```

Common errors:

- `409 USERNAME_TAKEN`
- `403 CSRF_TOKEN_REQUIRED`
- `403 CSRF_TOKEN_INVALID`
- `422 VALIDATION_ERROR`

## Endpoint: Login

- Method: `POST`
- URL: `/api/v1/auth/login`
- Auth required: No
- CSRF required: Yes
- CSRF cookie: `bgp_csrf`
- CSRF header: `x-csrf-token` (validated against current session)

Request body:

```json
{
  "username": "existing_user",
  "password": "user_password"
}
```

Success response (`200`):

```json
{
  "success": true,
  "data": {
    "user": {
      "username": "existing_user",
      "role": "participant"
    },
    "message": "Logged in successfully"
  },
  "message": "Logged in successfully"
}
```

Common errors:

- `401 INVALID_CREDENTIALS`
- `403 CSRF_TOKEN_REQUIRED`
- `403 CSRF_TOKEN_INVALID`
- `422 VALIDATION_ERROR`

## Endpoint: Logout

- Method: `POST`
- URL: `/api/v1/auth/logout`
- Auth required: Yes
- CSRF required: Yes
- CSRF cookie: `bgp_csrf`
- CSRF header: `x-csrf-token` (validated against current session)

Success response (`200`):

```json
{
  "success": true,
  "data": null,
  "message": "Logged out successfully"
}
```

Common errors:

- `401 UNAUTHORIZED`
- `403 CSRF_TOKEN_REQUIRED`
- `403 CSRF_TOKEN_INVALID`

## Recommended client flow

1. Call `GET /api/v1/auth/csrf-token`.
2. Read the `bgp_csrf` cookie value on the client.
3. For every unsafe request, send `x-csrf-token` with the same cookie value.
4. Ensure credentials/cookies are included in all requests.
5. After successful auth, the CSRF cookie is rotated automatically.
6. On logout, call `POST /api/v1/auth/logout`; the CSRF cookie is cleared.

## cURL example

```bash
# 1) Get CSRF token and store cookie
curl -i -c cookies.txt http://localhost:3000/api/v1/auth/csrf-token

# 2) Extract CSRF cookie value and send it in x-csrf-token
# (example shown with a placeholder)

# 3) Register using cookie-backed session + csrf header
curl -i -b cookies.txt -c cookies.txt \
  -H "Content-Type: application/json" \
  -H "x-csrf-token: <csrf-cookie-value>" \
  -d '{"username":"new_user","password":"strong_password"}' \
  http://localhost:3000/api/v1/auth/register
```

## Related docs

- [Announcements API](./announcements.md)
