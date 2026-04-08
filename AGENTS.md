# AGENTS.md — Build Guild Portal
> Co-programming rules for GitHub Copilot and all AI agents working on this project.
> Read this file in full before generating any code, file, or suggestion.

---

## Project Overview

**Build Guild Portal** is an event management platform for a Build Guild hackathon/workshop event.
Participants track activities, earn points, and collaborate in real-time during the event.

| Layer       | Technology                                                          |
|-------------|---------------------------------------------------------------------|
| Client      | React + Vite + JavaScript + Tailwind CSS + React Router v6          |
| Server      | Express.js + Neon (PostgreSQL serverless) + RESTful API             |
| Deployment  | Vercel — serverless functions (server) + static (client)            |
| Design      | Blueprint style guide — see Design System section                   |
| Components  | `@hackclub/theme-ui` components + Tailwind CSS utilities only       |
| Icons       | `@hackclub/icons`                                                   |

---

## Repository Structure

```
build-guild-portal/
├── AGENTS.md                          ← you are here
├── vercel.json                        ← monorepo routing config
├── shared/
│   └── constants.js                   ← shared constants (roles, statuses…) used by both sides
│
├── client/                            ← React Vite app
│   ├── index.html
│   ├── vite.config.js
│   ├── tailwind.config.js
│   └── src/
│       ├── main.jsx                   ← app entry + router bootstrap
│       ├── components/
│       │   ├── ui/                    ← wrappers around Hack Club theme-ui components
│       │   ├── layout/                ← Nav, Sidebar, PageWrapper, Footer
│       │   ├── activities/            ← ActivityCard, ActivityList, CheckInButton, StatusBadge
│       │   └── auth/                  ← LoginForm, RegisterForm, ProtectedRoute
│       ├── pages/                     ← one file per route (Dashboard, Activities, Leaderboard…)
│       ├── hooks/                     ← custom hooks: useAuth, useActivities, useLeaderboard…
│       ├── lib/
│       │   ├── api.js                 ← ALL fetch calls live here — never fetch inside components
│       │   ├── constants.js           ← client-side constants (routes, query keys…)
│       │   └── helpers.js
│       └── styles/
│           └── global.css             ← Tailwind directives + blueprint font imports
│
└── server/                            ← Express.js API
    ├── api/
    │   └── index.js                   ← Vercel serverless entry point — wraps the Express app
    └── src/
        ├── app.js                     ← Express app factory — NO app.listen() here
        ├── routes/                    ← route declarations only, zero business logic
        │   ├── auth.routes.js
        │   ├── activities.routes.js
        │   ├── participants.routes.js
        │   └── leaderboard.routes.js
        ├── controllers/               ← one controller per resource, all business logic lives here
        │   ├── auth.controller.js
        │   ├── activities.controller.js
        │   ├── participants.controller.js
        │   └── leaderboard.controller.js
        ├── middleware/
        │   ├── auth.middleware.js     ← session validation, attaches req.user
        │   ├── rbac.middleware.js     ← role-based access control
        │   ├── validate.middleware.js ← Zod schema validation factory
        │   ├── rateLimit.middleware.js
        │   └── error.middleware.js    ← centralised error handler (always last)
        ├── db/
        │   ├── client.js              ← Neon connection singleton
        │   └── migrations/            ← numbered .sql files: 001_init.sql, 002_…sql
        ├── models/                    ← JSDoc-documented shapes mirroring DB tables
        └── utils/
          ├── session.js             ← session store + cookie helpers
            ├── hash.js                ← bcrypt helpers
            └── response.js            ← sendSuccess / sendError / sendPaginated helpers
```

> **Rule**: Never create files outside this structure without a written justification comment at the top of the file explaining why.

---

## Language Rules — JavaScript Only

This project uses **plain JavaScript (ES Modules)**. TypeScript is not used anywhere in this repo.

- All files use `.js` on the server and `.js` / `.jsx` on the client. No `.ts`, `.tsx`, or `tsconfig.json` files anywhere.
- Use **ES Module syntax** (`import` / `export`) throughout — no `require()` or `module.exports`.
- Client Vite config, Tailwind config, and all tooling config files are plain `.js`.
- Use **JSDoc comments** to document function signatures on the server (`/** @param {string} id */`). This gives Copilot and editors useful hints without a TypeScript compiler.
- Shared string constants (role names, activity statuses, etc.) live in `shared/constants.js` and are imported by both client and server. This replaces what would be a shared types file in TypeScript.
- Do not add type annotations, generics, or type-only imports. If Copilot suggests TypeScript syntax, reject it and ask for plain JS.

---

## Middleware Stack — Order Is Mandatory

Every incoming request passes through middleware in exactly this order.
Do not reorder, skip, or move any layer into controllers or route files.

```
Request
  → cors()
  → helmet()
  → rateLimitMiddleware          ← global; authRateLimit applied additionally on /auth routes
  → express.json()
  → [authMiddleware]             ← protected routes only (session cookie validation)
  → [optionalAuth]               ← public routes that benefit from knowing the user if present
  → [rbacMiddleware]             ← role-restricted routes only
  → [validateMiddleware]         ← routes with a request body or query schema
  → controller function
  → errorMiddleware              ← always last, registered after all routes in app.js
```

---

## RESTful API Conventions

All endpoints live under `/api/v1/`. Follow these URL patterns strictly:

| Action         | Method | Path                              |
|----------------|--------|-----------------------------------|
| List           | GET    | `/api/v1/{resource}`              |
| Get one        | GET    | `/api/v1/{resource}/:id`          |
| Create         | POST   | `/api/v1/{resource}`              |
| Partial update | PATCH  | `/api/v1/{resource}/:id`          |
| Delete         | DELETE | `/api/v1/{resource}/:id`          |
| Sub-action     | POST   | `/api/v1/{resource}/:id/action`   |

**Response envelope** — every response must use one of the three helpers in `utils/response.js`:

```js
// Success
sendSuccess(res, data, message, statusCode)
// → { success: true, data, message? }

// Error
sendError(res, message, code, statusCode)
// → { success: false, error, code, statusCode }

// Paginated list
sendPaginated(res, data, total, page, pageSize)
// → { success: true, data, pagination: { page, pageSize, total, totalPages } }
```

Never call `res.json()` or `res.send()` directly in routes or controllers.

---

## Permissions Matrix

Roles are loaded from the server-side session as `req.user.role`. The `rbacMiddleware` reads `req.user.role`.
Role strings are defined as constants in `shared/constants.js` — never hardcode the string `'admin'` etc. inline.
Use `requireRole(...roles)` for minimum-role gates and `requireSelfOrRole(paramKey, ...roles)` for self-or-elevated access.

| Role          | Activities  | Check-in  | Leaderboard | Participants | Admin Routes |
|---------------|-------------|-----------|-------------|--------------|--------------|
| `guest`       | read        | ✗         | read        | ✗            | ✗            |
| `participant` | read        | self only | read        | own profile  | ✗            |
| `organizer`   | full CRUD   | any       | read        | read all     | ✗            |
| `admin`       | full CRUD   | any       | full CRUD   | full CRUD    | ✓            |

Role hierarchy (ascending): `guest` → `participant` → `organizer` → `admin`

---

## Database Rules (Neon / PostgreSQL)

- Use `@neondatabase/serverless` driver — **not** the `pg` package. Required for Vercel cold-start performance.
- The Neon client is instantiated **once at module scope** in `db/client.js` and reused across warm invocations.
- All queries go through the `getDb()` function exported from `db/client.js`. Never import or instantiate `neon()` elsewhere.
- **Parameterised queries only.** No string interpolation in SQL. Ever.
- Migrations live in `src/db/migrations/` as numbered SQL files (`001_init.sql`, `002_add_teams.sql`…).
- Schema changes always require a new migration file — never alter existing migration files after they have been committed.

---

## Vercel Serverless Rules

- `src/app.js` exports an Express `app` created by a factory function `createApp()`. It must **never** call `app.listen()`.
- `api/index.js` is the only file that exports the serverless handler: `export default app`.
- `vercel.json` rewrites `/api/*` to the serverless function and all other paths to `index.html` for the SPA.
- The `buildCommand` in `vercel.json` should point to `client/` and `outputDirectory` to `client/dist`.
- Keep the Express app and Neon client at **module scope** (outside the handler function) to survive warm invocations without re-initialisation.
- Maximum function duration is 10 seconds — avoid long-running synchronous operations.

### Session Authentication on Serverless (Mandatory)

- Authentication must use **server-side sessions with secure HttpOnly cookies**, not JWT bearer tokens.
- Use `cookie-parser` and `crypto` (Node built-in) to issue opaque session IDs; never put role, user ID, or permissions in client-readable cookies.
- Session cookies must be configured as: `HttpOnly`, `Secure` in production, `SameSite=Lax` (or `None` only when cross-site is required with HTTPS), and path `/`.
- `authMiddleware` must resolve the session from the cookie, hydrate `req.user`, and reject invalid/expired sessions.
- Session persistence must be backed by Postgres (Neon) via a `sessions` table. In-memory stores are forbidden because Vercel functions are stateless across invocations.
- Keep session read/write operations short and indexed (`session_id`, `expires_at`) to stay within serverless duration limits.
- Logout must invalidate the session server-side and clear the cookie in the same response.

```json
{
  "rewrites": [
    { "source": "/api/(.*)", "destination": "/server/api/index" },
    { "source": "/((?!api).*)", "destination": "/index.html" }
  ],
  "functions": {
    "server/api/index.js": { "maxDuration": 10 }
  }
}
```

---

## Client Rules

### Routing
- Use React Router v6 with `createBrowserRouter` and `<RouterProvider>` in `main.jsx`.
- Nested layouts use `<Outlet />` — never nest `<Routes>` inside components.
- Protected routes wrap children with `<ProtectedRoute>` which reads `useAuth()` and redirects unauthenticated users to `/login`.

### State & Data Fetching
- Global auth state lives in a React Context provided at the root. Access via `useAuth()` hook.
- Server state (activities, leaderboard, etc.) uses **React Query** (`@tanstack/react-query`).
- All API calls are defined as functions in `src/lib/api.js` and consumed by hooks in `src/hooks/`.
- Never call `fetch` or `axios` directly inside a component or page.

### Styling — Hack Club Components + Tailwind Only
- UI is built exclusively with **Hack Club theme-ui components** (`@hackclub/theme-ui`) and **Tailwind CSS utility classes**.
- **Bootstrap is strictly forbidden.** Do not install or reference `bootstrap`, `react-bootstrap`, or any Bootstrap-derived library anywhere in the project.
- No inline `style={}` props, no CSS modules, no styled-components, no other component libraries.
- Hack Club components (`Box`, `Card`, `Button`, `Badge`, `Input`, `Text`, `Heading`, `Container`, `Grid`, `Flex`…) handle base structure and semantic HTML.
- Tailwind utility classes layer Blueprint design tokens on top of Hack Club components via the `className` prop.
- All icons import from `@hackclub/icons`: `import Icon from '@hackclub/icons/Icon'` (named per-icon imports, not the barrel).
- Responsive breakpoints follow Tailwind defaults: `sm` 640px / `md` 768px / `lg` 1024px / `xl` 1280px.

### Component Rules
- Functional components only — no class components.
- Every component file exports its component as the **default export**.
- Utility files, hooks, and lib files use **named exports only**.
- Prop documentation uses JSDoc `/** @param {object} props */` comments on the component function.

---

## Design System — Blueprint Style

The UI follows the "Blueprint" engineering aesthetic from the project style guide.

### Color Palette

Configure all tokens as custom Tailwind colors under `theme.extend.colors.blueprint` in `tailwind.config.js`.

| Token          | Hex       | Tailwind class          | Usage                              |
|----------------|-----------|-------------------------|------------------------------------|
| Dark           | `#0E305B` | `blueprint-dark`        | Primary background, cards          |
| Darker         | `#081C35` | `blueprint-darker`      | Deepest bg, navbars                |
| Light          | `#DBE4EE` | `blueprint-light`       | Light surfaces, input borders      |
| Danger         | `#FE8E86` | `blueprint-danger`      | Error states, destructive actions  |
| Warning        | `#FFC857` | `blueprint-warning`     | Warnings, pending/in-progress      |
| Success        | `#A8F0AE` | `blueprint-success`     | Completed, confirmed, live         |

### Typography

| Role      | Font              | Tailwind class   | Apply to                     |
|-----------|-------------------|------------------|------------------------------|
| Headings  | R&C Guidelines    | `font-display`   | H1, H2, H3, hero text        |
| Body      | Phantom Sans      | `font-sans`      | All body copy, UI labels     |

Import both fonts in `src/styles/global.css`.
In `tailwind.config.js` set:
- `theme.extend.fontFamily.sans` → `['Phantom Sans', 'sans-serif']`
- `theme.extend.fontFamily.display` → `['R&C Guidelines', 'sans-serif']`

### Text on Coloured Backgrounds

| Background           | Text colour                              |
|----------------------|------------------------------------------|
| `blueprint-dark`     | White `#FFFFFF`                          |
| `blueprint-darker`   | White `#FFFFFF`                          |
| `blueprint-light`    | `blueprint-darker` (`#081C35`)           |
| `blueprint-danger`   | Danger dark variant — never plain black  |
| `blueprint-warning`  | Warning dark variant — never plain black |
| `blueprint-success`  | Success dark variant — never plain black |

### Activity Status → Colour Mapping

| Status      | Badge background       | Badge text         |
|-------------|------------------------|--------------------|
| `upcoming`  | `blueprint-light`      | `blueprint-darker` |
| `live`      | `blueprint-success`    | success dark       |
| `completed` | `blueprint-darker`     | white              |
| `cancelled` | `blueprint-danger`     | danger dark        |

---

## Validation Rules

- All request bodies and query strings are validated with **Zod schemas**.
- Zod schemas are defined inline in the route file, adjacent to the route that uses them.
- Use the `validate(schema, target)` middleware factory from `middleware/validate.middleware.js`.
- On validation failure the middleware returns HTTP 422 with an `issues` array — never throw manually.
- Never use `express-validator`, manual `if (!body.x)` guards, or `assert` for request validation.

---

## Error Handling Rules

- Every controller function must be wrapped in `try/catch`.
- On catch, call `next(error)` — do not call `sendError` inside a catch block directly.
- Attach `statusCode` and `code` properties to thrown errors so `errorMiddleware` serialises them correctly.
- `errorMiddleware` is the single place that writes error responses to the client.
- Never log `req.body`, tokens, passwords, or any PII. Redact before logging.
- In production (`NODE_ENV=production`) stack traces must not appear in API responses.

---

## Environment Variables

Secrets live in `.env` (local) and Vercel Environment Settings (production). **Never commit `.env`.**

```env
# Server
DATABASE_URL=          # Neon connection string (required)
SESSION_SECRET=        # minimum 32 random characters (required)
SESSION_TTL=           # e.g. "7d"
SESSION_COOKIE_NAME=   # e.g. "bgp_session"
CORS_ORIGIN=           # client origin URL

# Client (Vite — must be prefixed VITE_)
VITE_API_BASE_URL=     # server API base URL
```

---

## Feature Development Workflow

When adding any new feature, work through layers **in this order** — do not skip steps:

1. `shared/constants.js` — add any new role names, status values, or shared string constants
2. `server/src/db/migrations/` — new `.sql` file if the schema changes
3. `server/src/models/` — JSDoc-documented shape for the new resource
4. `server/src/controllers/` — controller functions with full try/catch + `next(error)`
5. `server/src/routes/` — register routes with the correct middleware chain
6. `client/src/lib/api.js` — API call function for the new endpoint
7. `client/src/hooks/` — React Query hook wrapping the API call
8. `client/src/pages/` or `client/src/components/` — UI built with Hack Club components + Tailwind

---

## Commit Convention

```
<type>(<scope>): <short imperative description>
```

**Types**: `feat` · `fix` · `chore` · `docs` · `refactor` · `test` · `style`

**Scopes**: `auth` · `activities` · `leaderboard` · `participants` · `ui` · `db` · `deploy` · `shared` · `config`

Examples:
```
feat(activities): add check-in endpoint with point calculation
fix(auth): handle expired session gracefully in authMiddleware
chore(db): add migration for teams table
docs(agents): clarify RBAC middleware usage
```

---

## Testing Guidelines

- Unit tests for all functions in `utils/` using **Vitest**.
- Integration tests for all API routes using **Supertest** (run the real Express app, no mocking).
- Component tests for all page-level components using **Vitest** + **@testing-library/react**.
- Test files colocate with their source file: `foo.js` → `foo.test.js`, `Foo.jsx` → `Foo.test.jsx`.
- Coverage targets: 80% statements on server utils and controllers, 70% on client hooks.
- Never mock the Neon database in integration tests — use a dedicated Neon test branch.

---

## Things Copilot Must Never Do

- Use TypeScript — no `.ts` or `.tsx` files, no `tsconfig.json`, no type annotations or generics anywhere.
- Use `require()` or `module.exports` — ES Modules (`import`/`export`) only throughout the repo.
- Call `app.listen()` anywhere in the server — Vercel manages the HTTP lifecycle.
- Import `neon` or `pg` directly in controllers or routes — always go through `db/client.js`.
- Write raw `res.json()` or `res.send()` in routes or controllers — use `response.js` helpers only.
- Use JWT authentication or bearer tokens — this project uses server-side session cookies only.
- Fetch data directly inside React components — always go through `src/lib/api.js` and a hook.
- Hardcode role or status strings inline — always import them from `shared/constants.js`.
- Add new middleware inside a controller or route handler body.
- Use `express-validator` — Zod is the only permitted validation library.
- Commit `.env` or any file containing secrets or credentials.
- Include stack traces in production API error responses.
- Use string interpolation inside SQL queries — parameterised queries only.
- Use `useEffect` + `fetch` for data fetching — use React Query hooks instead.
- Use Bootstrap, `react-bootstrap`, or any Bootstrap-derived library — the UI stack is Hack Club components + Tailwind only.
- Use any component library other than `@hackclub/theme-ui` — no MUI, Chakra, Ant Design, shadcn, Radix primitives, etc.
- Add inline `style={}` props for layout or theming — use Tailwind classes and Blueprint tokens instead.
- Import icons from any source other than `@hackclub/icons`.

---