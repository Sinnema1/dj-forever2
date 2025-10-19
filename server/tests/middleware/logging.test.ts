/**
 * @fileoverview Request ID Middleware Tests
 * @module tests/middleware/logging
 *
 * Comprehensive test suite for request ID middleware ensuring:
 * - UUID v4 format generation
 * - X-Request-ID header presence on all responses
 * - Request context population for services and resolvers
 * - No performance degradation from UUID generation
 */

import { describe, it, expect } from "vitest";
import request from "supertest";
import express, { Request, Response } from "express";
import { withRequestId } from "../../src/middleware/logging.js";

/**
 * Helper function to create a test Express app with request ID middleware.
 * Used to isolate middleware behavior in unit tests.
 */
function createTestApp() {
  const app = express();
  app.use(withRequestId);
  return app;
}

describe("Request ID Middleware", () => {
  describe("X-Request-ID Header", () => {
    it("should add X-Request-ID header to all responses", async () => {
      const app = createTestApp();
      app.get("/test", (req, res) => res.json({ status: "ok" }));

      const response = await request(app).get("/test");

      expect(response.headers["x-request-id"]).toBeDefined();
      expect(typeof response.headers["x-request-id"]).toBe("string");
    });

    it("should generate unique request IDs for different requests", async () => {
      const app = createTestApp();
      app.get("/test", (req, res) => res.json({ status: "ok" }));

      const [response1, response2] = await Promise.all([
        request(app).get("/test"),
        request(app).get("/test"),
      ]);

      const requestId1 = response1.headers["x-request-id"];
      const requestId2 = response2.headers["x-request-id"];

      expect(requestId1).toBeDefined();
      expect(requestId2).toBeDefined();
      expect(requestId1).not.toBe(requestId2);
    });

    it("should include request ID header on error responses", async () => {
      const app = createTestApp();
      app.get("/test", (req, res) => {
        res.status(500).json({ error: "Internal Server Error" });
      });

      const response = await request(app).get("/test");

      expect(response.status).toBe(500);
      expect(response.headers["x-request-id"]).toBeDefined();
    });
  });

  describe("UUID v4 Format Validation", () => {
    it("should generate valid UUID v4 format", async () => {
      const app = createTestApp();
      app.get("/test", (req, res) => res.json({ status: "ok" }));

      const response = await request(app).get("/test");
      const requestId = response.headers["x-request-id"];

      // UUID v4 format: xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx
      // Where y is one of [8, 9, a, b]
      const uuidV4Regex =
        /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

      expect(requestId).toMatch(uuidV4Regex);
    });

    it("should generate cryptographically random UUIDs", async () => {
      const app = createTestApp();
      app.get("/test", (req, res) => res.json({ status: "ok" }));

      // Generate multiple UUIDs to verify randomness
      const requestIds = new Set<string>();
      const numRequests = 100;

      for (let i = 0; i < numRequests; i++) {
        const response = await request(app).get("/test");
        requestIds.add(response.headers["x-request-id"]);
      }

      // All 100 UUIDs should be unique (collision probability is astronomically low)
      expect(requestIds.size).toBe(numRequests);
    });
  });

  describe("Request Context Population", () => {
    it("should attach requestId to req.context", async () => {
      const app = createTestApp();

      let capturedRequestId: string | undefined;
      app.get("/test", (req: Request, res: Response) => {
        capturedRequestId = req.context?.requestId;
        res.json({ requestId: capturedRequestId });
      });

      const response = await request(app).get("/test");

      expect(capturedRequestId).toBeDefined();
      expect(typeof capturedRequestId).toBe("string");
      expect(capturedRequestId).toBe(response.headers["x-request-id"]);
    });

    it("should make requestId available throughout request lifecycle", async () => {
      const app = createTestApp();

      const requestIds: string[] = [];

      // Multiple middleware layers to verify context persists
      app.use((req, res, next) => {
        requestIds.push(req.context?.requestId || "");
        next();
      });

      app.use((req, res, next) => {
        requestIds.push(req.context?.requestId || "");
        next();
      });

      app.get("/test", (req, res) => {
        requestIds.push(req.context?.requestId || "");
        res.json({ status: "ok" });
      });

      await request(app).get("/test");

      // All three middleware/handler should see the same requestId
      expect(requestIds).toHaveLength(3);
      expect(requestIds[0]).toBeDefined();
      expect(requestIds[0]).toBe(requestIds[1]);
      expect(requestIds[1]).toBe(requestIds[2]);
    });

    it("should preserve existing context properties", async () => {
      const app = express();

      // Middleware that sets other context properties
      app.use((req, res, next) => {
        req.context = { userId: "test-user-123" };
        next();
      });

      app.use(withRequestId);

      app.get("/test", (req, res) => {
        res.json({
          userId: req.context?.userId,
          requestId: req.context?.requestId,
        });
      });

      const response = await request(app).get("/test");

      expect(response.body.userId).toBe("test-user-123");
      expect(response.body.requestId).toBeDefined();
      expect(typeof response.body.requestId).toBe("string");
    });
  });

  describe("Performance", () => {
    it("should have minimal performance overhead (<10ms per request)", async () => {
      const app = createTestApp();
      app.get("/test", (req, res) => res.json({ status: "ok" }));

      const startTime = Date.now();
      const numRequests = 100;

      for (let i = 0; i < numRequests; i++) {
        await request(app).get("/test");
      }

      const endTime = Date.now();
      const avgTimePerRequest = (endTime - startTime) / numRequests;

      // UUID generation should add less than 10ms overhead per request
      // (In practice, it's typically <1ms)
      expect(avgTimePerRequest).toBeLessThan(10);
    });
  });

  describe("Edge Cases", () => {
    it("should work with POST requests", async () => {
      const app = createTestApp();
      app.use(express.json());
      app.post("/test", (req, res) => res.json({ received: req.body }));

      const response = await request(app).post("/test").send({ data: "test" });

      expect(response.headers["x-request-id"]).toBeDefined();
    });

    it("should work with different HTTP methods", async () => {
      const app = createTestApp();
      app.use(express.json());

      app.get("/test", (req, res) => res.json({ method: "GET" }));
      app.post("/test", (req, res) => res.json({ method: "POST" }));
      app.put("/test", (req, res) => res.json({ method: "PUT" }));
      app.delete("/test", (req, res) => res.json({ method: "DELETE" }));

      const [getRes, postRes, putRes, deleteRes] = await Promise.all([
        request(app).get("/test"),
        request(app).post("/test"),
        request(app).put("/test"),
        request(app).delete("/test"),
      ]);

      expect(getRes.headers["x-request-id"]).toBeDefined();
      expect(postRes.headers["x-request-id"]).toBeDefined();
      expect(putRes.headers["x-request-id"]).toBeDefined();
      expect(deleteRes.headers["x-request-id"]).toBeDefined();
    });

    it("should work with async route handlers", async () => {
      const app = createTestApp();

      app.get("/test", async (req, res) => {
        // Simulate async operation
        await new Promise((resolve) => setTimeout(resolve, 10));
        res.json({ requestId: req.context?.requestId });
      });

      const response = await request(app).get("/test");

      expect(response.headers["x-request-id"]).toBeDefined();
      expect(response.body.requestId).toBe(response.headers["x-request-id"]);
    });
  });
});
