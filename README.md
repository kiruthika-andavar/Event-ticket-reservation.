# Gatherly — Multi-Tenant Event & Ticket Reservation System

A Next.js + TypeScript starter for an event marketplace. The UI includes event discovery, search/category filters, organizer dashboard preview, event creation form preview, and responsive layouts.

## Important implementation status

- Working UI: event discovery, search, category filters, dashboard/create-event preview interactions using sample data.
- API implementation included: published event listing (Redis cache if configured), transactional ticket hold, mock payment approval/rejection, hold-expiry cron endpoint, aggregate analytics.
- PostgreSQL schema: users, events, ticket tiers, orders, payments, and role enums.
- Not production-ready until real authentication/session middleware, ownership checks on every protected API, and authorization-aware analytics are added. The UI sign-in button is currently a demo notice, not authentication.
- The mock payment endpoint is a development simulation. It is not a real payment provider.
- Cron runs every 10 minutes on supported Vercel plans; check your plan's cron limits. For stricter expiry timing, use a queue/worker or an external scheduler.
- The current UI's event cards use sample data; connect `/api/events` to render the database-backed list before claiming end-to-end integration.

## Local setup

1. Install Node.js 20+ and PostgreSQL.
2. Copy `.env.example` to `.env` and set `DATABASE_URL`. Set `REDIS_URL` if using Redis.
3. Install dependencies: `npm install`
4. Create tables: `npx prisma db push`
5. Seed demo data: `npm run db:seed`
6. Start: `npm run dev`

Open http://localhost:3000.

## API routes

- `GET /api/events` — published events, optionally cached in Redis for 60 seconds.
- `POST /api/reservations` — body `{ "userId": "...", "eventId": "...", "tierId": "...", "quantity": 1 }`. Creates a 10-minute hold under a PostgreSQL transaction with `SELECT ... FOR UPDATE`.
- `POST /api/payments/mock` — body `{ "orderId": "...", "outcome": "approve" }` or `"reject"`.
- `GET /api/cron/expire-holds` — protected by `Authorization: Bearer <CRON_SECRET>`.
- `GET /api/analytics` — aggregate demo analytics; add authentication and organizer scoping before production.

## Deploy to Vercel

1. Push this project to a GitHub repository.
2. Import the repository at https://vercel.com/new.
3. Configure `DATABASE_URL`, `CRON_SECRET`, and optionally `REDIS_URL` in Vercel Project Settings → Environment Variables.
4. Provision a hosted PostgreSQL database and Redis instance separately, unless your platform integration provides them.
5. Deploy. Then run `npx prisma db push` and `npm run db:seed` from a secure local environment with the production `DATABASE_URL`.
6. Verify deployment logs and test the API endpoints.

## Production checklist

- Add Auth.js or another trusted authentication provider.
- Never accept `userId` as proof of identity; derive it from the authenticated session.
- Enforce role checks and tenant/organizer ownership in every write/read API.
- Add rate limiting, request logging, idempotency keys, CSRF protections where relevant, and proper error handling.
- Add a robust queue/worker or verify scheduled cron limits for expiry.
- Write concurrency tests that issue simultaneous reservation requests against a seeded ticket tier.
- Use a real payment provider webhook only if accepting real payments.
