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

## Roles

- **Customer** — sees only their own tickets.
- **Agent** — sees the full ticket queue.
- **Admin** — sees the ticket queue and can manage users, roles, and account access from `/admin/users`.

New signups default to `customer`. Admins can change roles and deactivate accounts; deactivation revokes the user's sessions and blocks sign-in.

To bootstrap the first admin, promote an existing account:

```bash
bun run role:set you@example.com admin
```

For production, run the same command with the production `DATABASE_URL` from the Prisma Console:

```bash
DATABASE_URL="<production-database-url>" bun run role:set you@example.com admin
```

Local demo roles are Alice (`admin`), Bob (`agent`), and Carol (`customer`). Existing demo users can be promoted with the same command.

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
