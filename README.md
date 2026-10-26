# piko-ticket-management-system

A Next.js app with Prisma 8, Prisma Composer, password authentication, and password reset email over Gmail SMTP.

## Run locally

```bash
bun install
bun run dev:composer
```

This builds the app and starts it with Composer. PostgreSQL projects get a local Prisma Postgres database and apply the committed migrations automatically.

To use the framework's development server directly, run `bun run dev`. This direct mode requires `DATABASE_URL`.

## Authentication

- Sign up at `/signup`, sign in at `/login`.
- `/dashboard` and `/account` are protected. `/` redirects to the dashboard when signed in and to the login page otherwise.
- Passwords are hashed with scrypt from Node's `crypto` module.
- Sessions are opaque tokens in an httpOnly cookie; only a SHA-256 hash is stored in the database.
- Password reset links are single-use, expire after one hour, and revoke all sessions when used.

In local development, seeded demo accounts use the password `password123`. Demo passwords are not seeded into non-local deployments:

| Email | Username |
| --- | --- |
| `alice@prisma.io` | `alice` |
| `bob@prisma.io` | `bob` |
| `carol@prisma.io` | `carol` |

## Email

Copy `.env.example` to `.env` and fill in the Gmail values. `SMTP_PASS` must be a Google App Password, not your account password. If SMTP is not configured, the reset link is logged to the server console in development.

## Deploy

```bash
bun run deploy
```

The deploy script builds the framework output, provisions Prisma Postgres when selected, applies migrations, and deploys the app to Prisma Compute.

The starter users are inserted idempotently from `src/prisma/seed.ts` on the first database query through the Composer service binding.

## Prisma

- Contract: `src/prisma/contract.prisma`
- Prisma and Composer config: `prisma.config.ts`
- Composer app: `module.ts` and `service.ts`

After changing the contract, run:

```bash
bun run contract:emit
bun run migration:plan -- --name <name>
bunx prisma db migrate --advance-ref db
```

`bun run dev:composer` also applies committed migrations when it starts the app.
