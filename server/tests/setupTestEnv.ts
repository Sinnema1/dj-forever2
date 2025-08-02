import { beforeAll } from "vitest";

// Global test setup: reseed the test database before running tests
import { execSync } from "child_process";

beforeAll(() => {
  // Clean and reseed the test database using dedicated scripts
  execSync("MONGODB_DB_NAME=test_db npm run clean:db && npm run seed-test", {
    stdio: "inherit",
  });
});
