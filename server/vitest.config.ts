import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    setupFiles: ["./tests/vitest.setup.ts"],
    environment: "node",
    globals: true,
    // Use threads pool with maxConcurrency: 1 for true sequential execution
    // Forks pool doesn't guarantee sequential execution in this vitest version
    pool: "threads",
    maxConcurrency: 1, // Run one test at a time across all files
    minThreads: 1,
    maxThreads: 1,
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
    testTimeout: 30000, // 30 seconds for database operations and server startup
    hookTimeout: 30000, // 30 seconds for setup/teardown hooks
    sequence: {
      shuffle: false, // Keep tests in deterministic order
    },
    reporters: ["verbose"],
  },
  esbuild: {
    target: "node18", // Match your Node.js version
  },
});
