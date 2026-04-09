# Authentication API

This document explains how to use the current authentication system for Build Guild Portal.

## Base path

All authentication endpoints are mounted under:

- `/api/v1/auth`

## Security model

- Authentication state is stored in a server-side session.
- Session ID is sent in an HttpOnly cookie.
- CSRF protection is required for unsafe HTTP methods (`POST`, `PATCH`, `PUT`, `DELETE`).
- CSRF token is session-bound and must be sent in the `x-csrf-token` header.

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
- For anonymous visitors, this works with guest session flow and returns a valid token bound to that guest session.

Example response:

```json
{
  "success": true,
  "data": {
    "csrfToken": "<token-value>"
  },
  "message": "CSRF token issued"
}
```

## Endpoint: Register

- Method: `POST`
- URL: `/api/v1/auth/register`
- Auth required: No
- CSRF header required: Yes (`x-csrf-token`)

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
    "csrfToken": "<fresh-auth-token>",
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
- CSRF header required: Yes (`x-csrf-token`)

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
    "csrfToken": "<fresh-auth-token>",
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
- CSRF header required: Yes (`x-csrf-token`)

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
2. Store returned `csrfToken` in memory on the client.
3. Send the token in `x-csrf-token` for `POST /register` or `POST /login`.
4. Replace token with the new `csrfToken` returned after successful auth.
5. Use current token for any authenticated unsafe request.
6. On logout, call `POST /api/v1/auth/logout` with `x-csrf-token`.

## cURL example

```bash
# 1) Get CSRF token and store cookie
curl -i -c cookies.txt http://localhost:3000/api/v1/auth/csrf-token

# 2) Register using cookie + csrf header
curl -i -b cookies.txt -c cookies.txt \
  -H "Content-Type: application/json" \
  -H "x-csrf-token: <token-from-step-1>" \
  -d '{"username":"new_user","password":"strong_password"}' \
  http://localhost:3000/api/v1/auth/register
```
