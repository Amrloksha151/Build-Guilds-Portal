# Build Guilds Portal

## Local Development

### Run Frontend + Backend With One Command

1. Open a terminal in `server/`.
2. Install dependencies once:
	`npm install`
3. Start both apps:
	`npm run dev:full`

This starts:
- Backend on `http://localhost:3000`
- Frontend (Vite) on `http://localhost:5173`

The frontend uses a Vite proxy for `/api`, so browser requests to `/api/v1/*` are forwarded to the backend. This keeps local requests under the same host from the browser perspective and matches production routing behavior.

### Run Services Separately

- Backend only (from `server/`): `npm run dev`
- Frontend only (from `client/build-guilds/`): `npm run dev`