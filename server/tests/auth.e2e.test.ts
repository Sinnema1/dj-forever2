import { describe, beforeAll, afterAll, it, expect } from "vitest";
import request from "supertest";
import mongoose from "mongoose";
import { createTestServer } from "./utils/testServer";
import { setupTestUser } from "./utils/setupTestUser";

let app: any;
let stop: () => Promise<void>;

describe("Auth End-to-End", () => {
  beforeAll(async () => {
    const server = await createTestServer();
    app = server.app;
    stop = server.stop;

    // Setup test user directly in this test
    const qrToken = "r24gpj3wntgqwqfberlas";
    const email = "alice@example.com";
    await setupTestUser(qrToken, email);
  });

  afterAll(async () => {
    await stop();
    await mongoose.disconnect();
  });

  it("logs in a seeded user via QR token", async () => {
    // Use Alice Johnson's fixed QR token and email
    const qrToken = "r24gpj3wntgqwqfberlas";
    const email = "alice@example.com";

    // Login via QR token
    const loginRes = await request(app)
      .post("/graphql")
      .send({
        query: `
          mutation {
            loginWithQrToken(qrToken: "${qrToken}") {
              token
              user { email isInvited qrToken }
            }
          }
        `,
      });
    if (loginRes.body.errors) {
      // Print GraphQL errors for debugging
      console.error("GraphQL errors:", loginRes.body.errors);
    }
    expect(
      loginRes.body.data.loginWithQrToken,
      "loginWithQrToken result should not be null"
    ).not.toBeNull();
    expect(loginRes.body.data.loginWithQrToken.token).toBeTypeOf("string");
    expect(loginRes.body.data.loginWithQrToken.user.email).toBe(email);
    expect(loginRes.body.data.loginWithQrToken.user.qrToken).toBe(qrToken);
  });
});
