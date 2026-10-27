# Testing

## Unit tests

```bash
bun run test          # run once
bun run test:watch    # watch mode
bun run test:coverage # coverage report
```

Vitest currently runs 95 tests. No database or dev server is needed.

## E2E tests

Playwright needs a dedicated, disposable Postgres database. Never point it at your development or production database.

### First-time setup

```bash
# Install the Playwright browser
bunx playwright install chromium

# Create the E2E database
createdb piko_e2e
```

### Run

```bash
E2E_DATABASE_URL=postgresql://user:password@localhost:5432/piko_e2e bun run test:e2e
```
