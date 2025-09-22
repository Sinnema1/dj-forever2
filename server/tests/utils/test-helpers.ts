/**
 * Test Utilities for Server Tests
 * Common helpers, fixtures, and utilities for testing
 */

import jwt from "jsonwebtoken";
import { vi, expect } from "vitest";
import { config } from "../../src/config/index";
import User from "../../src/models/User";
import RSVP from "../../src/models/RSVP";
import { dbManager } from "../../src/utils/database";

/**
 * Test Data Factory
 * Create test data with consistent, valid defaults
 */
export class TestDataFactory {
  /**
   * Generate a valid test user
   */
  static createUserData(overrides: Partial<any> = {}) {
    const defaults = {
      fullName: "Test User",
      email: "test@example.com",
      isAdmin: false,
      isInvited: true,
      hasRSVPed: false,
      qrToken: this.generateQRToken(),
    };

    return { ...defaults, ...overrides };
  }

  /**
   * Generate a valid test RSVP
   */
  static createRSVPData(userId: string, overrides: Partial<any> = {}) {
    const defaults = {
      userId,
      attending: "YES" as const,
      guestCount: 1,
      guests: [
        {
          fullName: "Test Guest",
          mealPreference: "chicken",
          allergies: "None",
        },
      ],
      additionalNotes: "Test RSVP",
    };

    return { ...defaults, ...overrides };
  }

  /**
   * Generate a unique QR token
   */
  static generateQRToken(): string {
    return Math.random().toString(36).slice(2) + Date.now().toString(36);
  }

  /**
   * Generate a unique email address
   */
  static generateEmail(prefix = "test"): string {
    return `${prefix}-${Date.now()}@example.com`;
  }

  /**
   * Create a valid JWT token for testing
   */
  static createTestToken(payload: any = {}) {
    const defaultPayload = {
      userId: "test-user-id",
      email: "test@example.com",
      fullName: "Test User",
      isAdmin: false,
    };

    return jwt.sign({ ...defaultPayload, ...payload }, config.auth.jwtSecret, {
      expiresIn: "1h",
    });
  }
}

/**
 * Database Test Helpers
 * Utilities for managing test database state
 */
export class TestDatabaseHelpers {
  /**
   * Clear all collections
   */
  static async clearDatabase(): Promise<void> {
    await dbManager.clearDatabase({ confirm: true, quiet: true });
  }

  /**
   * Seed the database with test users
   */
  static async seedUsers(count = 3): Promise<any[]> {
    const users = [];

    for (let i = 0; i < count; i++) {
      const userData = TestDataFactory.createUserData({
        fullName: `Test User ${i + 1}`,
        email: TestDataFactory.generateEmail(`user${i + 1}`),
        isAdmin: i === 0, // First user is admin
      });

      const user = await User.create(userData);
      users.push(user);
    }

    return users;
  }

  /**
   * Seed the database with test RSVPs
   */
  static async seedRSVPs(users: any[], count?: number): Promise<any[]> {
    const rsvpCount = count || users.length;
    const rsvps = [];

    for (let i = 0; i < rsvpCount && i < users.length; i++) {
      const rsvpData = TestDataFactory.createRSVPData(users[i]._id, {
        attending: i % 3 === 0 ? "NO" : i % 3 === 1 ? "MAYBE" : "YES",
        guests: [
          {
            fullName: `Guest ${i + 1}`,
            mealPreference: ["chicken", "beef", "vegetarian"][i % 3],
          },
        ],
      });

      const rsvp = await RSVP.create(rsvpData);
      rsvps.push(rsvp);

      // Update user's hasRSVPed status
      await User.findByIdAndUpdate(users[i]._id, { hasRSVPed: true });
    }

    return rsvps;
  }

  /**
   * Get database statistics for assertions
   */
  static async getDatabaseStats() {
    return dbManager.getDatabaseStats();
  }
}

/**
 * Mock Helpers
 * Utilities for mocking external dependencies
 */
export class MockHelpers {
  /**
   * Mock Express request object
   */
  static mockRequest(overrides: any = {}) {
    const defaults = {
      headers: {},
      body: {},
      params: {},
      query: {},
      user: null,
      ip: "127.0.0.1",
    };

    return { ...defaults, ...overrides };
  }

  /**
   * Mock Express response object
   */
  static mockResponse() {
    const res: any = {
      status: vi.fn().mockReturnThis(),
      json: vi.fn().mockReturnThis(),
      send: vi.fn().mockReturnThis(),
      setHeader: vi.fn().mockReturnThis(),
    };

    return res;
  }

  /**
   * Mock GraphQL context
   */
  static mockGraphQLContext(user: any = null) {
    return {
      req: this.mockRequest({ user }),
      user,
    };
  }
}

/**
 * Assertion Helpers
 * Common assertions for testing
 */
export class AssertionHelpers {
  /**
   * Assert that an object matches a partial structure
   */
  static expectObjectToMatch(actual: any, expected: any) {
    for (const [key, value] of Object.entries(expected)) {
      expect(actual).toHaveProperty(key, value);
    }
  }

  /**
   * Assert that an error has the expected properties
   */
  static expectError(
    error: any,
    expectedMessage?: string,
    expectedCode?: string
  ) {
    expect(error).toBeInstanceOf(Error);

    if (expectedMessage) {
      expect(error.message).toContain(expectedMessage);
    }

    if (expectedCode) {
      expect(error.code).toBe(expectedCode);
    }
  }

  /**
   * Assert that a response has the expected status and structure
   */
  static expectResponse(
    response: any,
    expectedStatus: number,
    expectedKeys?: string[]
  ) {
    expect(response.status).toHaveBeenCalledWith(expectedStatus);

    if (expectedKeys) {
      const [[responseData]] = response.json.mock.calls;
      expectedKeys.forEach((key) => {
        expect(responseData).toHaveProperty(key);
      });
    }
  }
}

/**
 * Performance Test Helpers
 * Utilities for performance and load testing
 */
export class PerformanceHelpers {
  /**
   * Measure execution time of an async function
   */
  static async measureTime<T>(
    fn: () => Promise<T>
  ): Promise<{ result: T; duration: number }> {
    const start = Date.now();
    const result = await fn();
    const duration = Date.now() - start;

    return { result, duration };
  }

  /**
   * Run a function multiple times and collect timing data
   */
  static async benchmarkFunction<T>(
    fn: () => Promise<T>,
    iterations = 10
  ): Promise<{
    results: T[];
    timings: number[];
    avgTime: number;
    minTime: number;
    maxTime: number;
  }> {
    const results: T[] = [];
    const timings: number[] = [];

    for (let i = 0; i < iterations; i++) {
      const { result, duration } = await this.measureTime(fn);
      results.push(result);
      timings.push(duration);
    }

    const avgTime =
      timings.reduce((sum, time) => sum + time, 0) / timings.length;
    const minTime = Math.min(...timings);
    const maxTime = Math.max(...timings);

    return { results, timings, avgTime, minTime, maxTime };
  }
}

/**
 * Integration Test Helpers
 * Utilities for end-to-end and integration testing
 */
export class IntegrationHelpers {
  /**
   * Setup complete test scenario with users and RSVPs
   */
  static async setupTestScenario(
    options: {
      userCount?: number;
      rsvpCount?: number;
      includeAdmin?: boolean;
    } = {}
  ) {
    const { userCount = 3, rsvpCount = 2, includeAdmin = true } = options;

    await TestDatabaseHelpers.clearDatabase();

    const users = await TestDatabaseHelpers.seedUsers(userCount);
    if (includeAdmin && users.length > 0) {
      await User.findByIdAndUpdate(users[0]._id, { isAdmin: true });
      users[0].isAdmin = true;
    }

    const rsvps = await TestDatabaseHelpers.seedRSVPs(users, rsvpCount);

    return { users, rsvps };
  }

  /**
   * Wait for a condition to be true (polling with timeout)
   */
  static async waitFor(
    condition: () => Promise<boolean> | boolean,
    options: { timeout?: number; interval?: number } = {}
  ): Promise<void> {
    const { timeout = 5000, interval = 100 } = options;
    const start = Date.now();

    while (Date.now() - start < timeout) {
      if (await condition()) {
        return;
      }
      await new Promise((resolve) => setTimeout(resolve, interval));
    }

    throw new Error(`Condition not met within ${timeout}ms`);
  }
}
