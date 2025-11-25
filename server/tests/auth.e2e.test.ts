import { describe, beforeAll, afterAll, it, expect } from "vitest";
import request from "supertest";
import mongoose from "mongoose";
import { createTestServer } from "./utils/testServer";
import { setupTestUser } from "./utils/setupTestUser";
import User from "../src/models/User";
import RSVP from "../src/models/RSVP";
import EmailJob from "../src/models/EmailJob";

let app: any;
let stop: () => Promise<void>;

describe("Auth End-to-End", () => {
  beforeAll(async () => {
    // Clean up any existing test data
    await User.deleteMany({});
    await RSVP.deleteMany({});
    await EmailJob.deleteMany({});

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
              user { 
                email 
                isInvited 
                qrToken 
                relationshipToBride
                relationshipToGroom
                customWelcomeMessage
                guestGroup
                plusOneAllowed
                personalPhoto
                specialInstructions
              }
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
