const API_BASE_URL = '/api/v1'
const DEFAULT_CSRF_COOKIE = 'bgp_csrf'
const CSRF_HEADER_NAME = 'x-csrf-token'

let csrfCookieName = DEFAULT_CSRF_COOKIE

/**
 * @param {string} name
 */
function getCookieValue(name) {
  const escapedName = name.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
  const match = document.cookie.match(new RegExp(`(?:^|; )${escapedName}=([^;]*)`))
  return match ? decodeURIComponent(match[1]) : ''
}

/**
 * @param {string} path
 * @param {RequestInit} [init]
 */
async function request(path, init = {}) {
  const response = await fetch(`${API_BASE_URL}${path}`, {
    ...init,
    credentials: 'include',
    headers: {
      'Content-Type': 'application/json',
      ...(init.headers || {}),
    },
  })

  const payload = await response.json().catch(() => ({}))

  if (!response.ok || payload?.success === false) {
    const error = new Error(payload?.error || 'Request failed')
    error.statusCode = payload?.statusCode || response.status
    error.code = payload?.code || 'REQUEST_FAILED'
    throw error
  }

  return payload
}

export async function issueCsrfToken() {
  const payload = await request('/auth/csrf-token', {
    method: 'GET',
    headers: {},
  })

  if (payload?.data?.csrfCookie) {
    csrfCookieName = payload.data.csrfCookie
  }

  return payload.data
}

export async function getCurrentUser() {
  const payload = await request('/auth/me', {
    method: 'GET',
    headers: {},
  })

  return payload.data
}

/**
 * @param {'/auth/login' | '/auth/register'} path
 * @param {{ username: string, password: string }} body
 */
async function sendAuthRequest(path, body) {
  await issueCsrfToken()
  const csrfToken = getCookieValue(csrfCookieName)

  if (!csrfToken) {
    const error = new Error('Missing CSRF token cookie')
    error.statusCode = 403
    error.code = 'CSRF_TOKEN_REQUIRED'
    throw error
  }

  const payload = await request(path, {
    method: 'POST',
    headers: {
      [CSRF_HEADER_NAME]: csrfToken,
    },
    body: JSON.stringify(body),
  })

  return payload.data
}

/**
 * @param {{ username: string, password: string }} body
 */
export function login(body) {
  return sendAuthRequest('/auth/login', body)
}

/**
 * @param {{ username: string, password: string }} body
 */
export function register(body) {
  return sendAuthRequest('/auth/register', body)
}

export async function logout() {
  await issueCsrfToken()
  const csrfToken = getCookieValue(csrfCookieName)

  if (!csrfToken) {
    const error = new Error('Missing CSRF token cookie')
    error.statusCode = 403
    error.code = 'CSRF_TOKEN_REQUIRED'
    throw error
  }

  const payload = await request('/auth/logout', {
    method: 'POST',
    headers: {
      [CSRF_HEADER_NAME]: csrfToken,
    },
  })

  return payload.data
}

export { API_BASE_URL }
