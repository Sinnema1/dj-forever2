import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    setupFiles: ["./tests/vitest.setup.ts"],
    environment: "node",
    globals: true,
    maxConcurrency: 1, // Run tests sequentially to avoid database race conditions
    coverage: {
      provider: "c8",
      reporter: ["text", "json", "html"],
      exclude: [
        "node_modules/",
        "tests/",
        "src/scripts/",
        "src/seeds/",
        "**/*.d.ts",
        "dist/",
        "coverage/",
      ],
    },
    testTimeout: 30000, // 30 seconds for database operations
    hookTimeout: 30000, // 30 seconds for setup/teardown
    sequence: {
      shuffle: false, // Keep tests in order for database tests
    },
    reporters: ["verbose"],
  },
  esbuild: {
    target: "node18", // Match your Node.js version
  },
});
