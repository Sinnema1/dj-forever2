import { beforeAll } from "vitest";

// Global test setup: reseed the test database before running tests
import { execSync } from "child_process";

beforeAll(() => {
  // Clean and reseed the test database using dedicated scripts
  execSync(
    "MONGODB_DB_NAME=djforever2_test npm run clean:db && npm run seed-test",
    {
      stdio: "inherit",
    }
  );
});
