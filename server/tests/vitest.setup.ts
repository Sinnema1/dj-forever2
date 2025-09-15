/**
 * Vitest Setup for Server Tests
 * Handles database connections, test environment setup, and cleanup
 */

import { config as dotenvConfig } from "dotenv";
import { beforeAll, afterAll } from "vitest";
import { dbManager } from "../src/utils/database";
import { logger } from "../src/utils/logger";

// Load test environment variables
dotenvConfig({ path: ".env.test" });

// Ensure we're using a test database
const TEST_DB_NAME = "djforever2_test";
process.env.MONGODB_DB_NAME = TEST_DB_NAME;
process.env.NODE_ENV = "test";

// Set logging to minimal for tests
process.env.LOG_LEVEL = "ERROR";

let setupComplete = false;

beforeAll(async () => {
  if (setupComplete) return;

  try {
    logger.info("Setting up test environment...");

    // Connect to test database
    await dbManager.connect({
      dbName: TEST_DB_NAME,
      quiet: false,
    });

    // Ensure we're using the test database
    const stats = await dbManager.getDatabaseStats();
    if (stats.name !== TEST_DB_NAME) {
      throw new Error(
        `Expected test database '${TEST_DB_NAME}', but connected to '${stats.name}'`
      );
    }

    // Clear any existing test data
    await dbManager.clearDatabase({
      confirm: true,
      quiet: true,
    });

    logger.info("Test environment setup complete");
    setupComplete = true;
  } catch (error) {
    logger.error("Test setup failed:", error);
    throw error;
  }
});

afterAll(async () => {
  try {
    logger.info("Cleaning up test environment...");

    // Clear test data and disconnect
    if (dbManager.getConnectionStatus()) {
      await dbManager.clearDatabase({
        confirm: true,
        quiet: true,
      });

      await dbManager.disconnect({ quiet: true });
    }

    logger.info("Test cleanup complete");
  } catch (error) {
    logger.error("Test cleanup failed:", error);
    // Don't throw here to avoid masking test failures
  }
});
