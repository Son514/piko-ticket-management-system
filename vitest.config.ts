import { fileURLToPath } from "node:url";

import { defineConfig } from "vitest/config";

export default defineConfig({
  resolve: {
    alias: {
      "@": fileURLToPath(new URL("./src", import.meta.url)),
      "server-only": fileURLToPath(
        new URL("./tests/stubs/server-only.ts", import.meta.url),
      ),
    },
  },
  test: {
    environment: "node",
    include: ["src/**/*.test.{ts,tsx}"],
    clearMocks: true,
    restoreMocks: true,
    testTimeout: 15000,
    coverage: {
      provider: "v8",
      reporter: ["text", "html"],
      reportsDirectory: "./coverage",
      include: [
        "src/lib/roles.ts",
        "src/lib/ticket-permissions.ts",
        "src/lib/tickets.ts",
        "src/lib/validation/admin.ts",
        "src/lib/validation/auth.ts",
        "src/lib/validation/ticket-filters.ts",
        "src/lib/validation/ticket-update.ts",
        "src/lib/validation/tickets.ts",
        "src/app/server/auth/constants.ts",
        "src/app/server/auth/password.ts",
        "src/app/server/auth/rate-limit.ts",
        "src/app/server/auth/tokens.ts",
        "src/app/server/storage.ts",
      ],
      exclude: ["**/*.test.ts"],
    },
  },
});
