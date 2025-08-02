import { describe, beforeAll, afterAll, it, expect } from "vitest";
import request from "supertest";
import mongoose from "mongoose";
import { createTestServer } from "./utils/testServer";
import { Application } from "express-serve-static-core";
import { setupTestUser } from "./utils/setupTestUser";

let app: any;
let stop: () => Promise<void>;
let jwtToken: string;

describe("RSVP End-to-End", () => {
  beforeAll(async () => {
    const server = await createTestServer();
    app = server.app;
    stop = server.stop;

    // Setup test user directly in this test
    const qrToken = "ssq7b7bkfqqpd2724vlcol";
    const email = "bob@example.com";
    await setupTestUser(qrToken, email);
  });

  afterAll(async () => {
    await stop();
    await mongoose.disconnect();
  });

  it("logs in a seeded user via QR token and submits RSVP", async () => {
    // Use Bob Smith's fixed QR token and email
    const qrToken = "ssq7b7bkfqqpd2724vlcol";
    const email = "bob@example.com";

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
    jwtToken = loginRes.body.data.loginWithQrToken.token;

    // Submit RSVP
    const rsvpRes = await request(app)
      .post("/graphql")
      .set("Authorization", `Bearer ${jwtToken}`)
      .send({
        query: `
          mutation {
            submitRSVP(
              attending: YES
              mealPreference: "Vegetarian"
              allergies: "None"
              additionalNotes: "Excited!"
            ) {
              fullName
              attending
              mealPreference
              allergies
              additionalNotes
            }
          }
        `,
      });
    expect(rsvpRes.body.data.submitRSVP.fullName).toBeDefined();
    expect(rsvpRes.body.data.submitRSVP.attending).toBe("YES");
    expect(rsvpRes.body.data.submitRSVP.mealPreference).toBe("Vegetarian");
    expect(rsvpRes.body.data.submitRSVP.allergies).toBe("None");
    expect(rsvpRes.body.data.submitRSVP.additionalNotes).toBe("Excited!");
  });
});
