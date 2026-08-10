# Render Deployment Notes (What Worked)

This document captures the exact steps that worked to deploy this API on Render.

## 1. Render Service Settings

Use these values in the Render Web Service:

- Root Directory: `api`
- Build Command: `npm install`
- Start Command: `npm run start`

Why this works:

- The repository root package does not have a `start` script.
- The API package in `api` has the real server scripts.

## 2. Start Command Behavior

`npm run start` now runs migrations before booting the server:

- `npm run db:migrate && node src/index.mjs`
- set in package.json

Why this works:

- Prevents `500` errors caused by missing tables on fresh deploys.

## 3. Database Configuration That Worked

Production uses PostgreSQL.

Required env vars on Render:

- `DB_CLIENT=pg`
- `DB_USE_SSL=true`
- `DATABASE_URL=<Render External Database URL>`

Important:

- Do not leave localhost DB values active in production (`DB_HOST=localhost`, etc.), or migrations fail with `ECONNREFUSED`.
- If `DATABASE_URL` is present, the app uses it.

## 4. Root + Docs Behavior

These routing/docs updates worked:

- `/` redirects to `/docs`
- Swagger uses current host/origin (no hardcoded localhost server URL)

Why this works:

- Prevents Swagger "NetworkError when attempting to fetch resource" in production.

## 5. If `/api/events` Returns 500

Most common cause was DB connectivity/migration state.

Checklist:

1. Confirm Render env vars above are correct.
2. Redeploy service.
3. Check deploy logs for successful migration.

## 6. If `/api/events` Returns 200 but Empty Data

A response like below means DB is healthy but not seeded:

- `data: []`
- `totalItems: 0`

Run seed once.

### Free Render plan (no Shell available)

Seed from local machine against Render DB:

.env

```
DATABASE_URL="<Render External Database URL>"
DB_CLIENT="pg"
DB_USE_SSL="true"
```

Terminal

```
npm run db:seed
```

Then test again:

- `GET /api/events?page=0&pageSize=20`
