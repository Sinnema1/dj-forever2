import { describe, beforeAll, afterAll, it, expect } from "vitest";
import request from "supertest";
import mongoose from "mongoose";
import type { Application } from "express";
import { createTestServer } from "./utils/testServer";

let app: Application;
let stop: () => Promise<void>;
let jwtToken: string;

describe("RSVP End-to-End", () => {
  beforeAll(async () => {
    const server = await createTestServer();
    app = server.app;
    stop = server.stop;
  });

  afterAll(async () => {
    await stop();
    await mongoose.disconnect();
  });

  it("registers a user with qrToken, logs in via QR token, and submits RSVP", async () => {
    // Register (simulate seed)
    const qrToken = "test-qr-token-456";
    const registerRes = await request(app)
      .post("/graphql")
      .send({
        query: `
          mutation {
            registerUser(
              fullName: "E2E User"
              email: "e2e@example.com"
              qrToken: "${qrToken}"
            ) {
              token
              user { email isInvited qrToken }
            }
          }
        `,
      });
    if (!registerRes.body.data || !registerRes.body.data.registerUser) {
      // Log GraphQL errors for easier debugging
      console.error("GraphQL errors:", registerRes.body.errors);
    }
    expect(registerRes.body.data.registerUser.token).toBeTypeOf("string");
    expect(registerRes.body.data.registerUser.user.email).toBe("e2e@example.com");
    expect(registerRes.body.data.registerUser.user.isInvited).toBeTypeOf("boolean");
    expect(registerRes.body.data.registerUser.user.qrToken).toBe(qrToken);
    jwtToken = registerRes.body.data.registerUser.token;

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
    expect(loginRes.body.data.loginWithQrToken.token).toBeTypeOf("string");
    expect(loginRes.body.data.loginWithQrToken.user.email).toBe("e2e@example.com");
    expect(loginRes.body.data.loginWithQrToken.user.qrToken).toBe(qrToken);

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
    expect(rsvpRes.body.data.submitRSVP.fullName).toBe("E2E User");
    expect(rsvpRes.body.data.submitRSVP.attending).toBe("YES");
    expect(rsvpRes.body.data.submitRSVP.mealPreference).toBe("Vegetarian");
    expect(rsvpRes.body.data.submitRSVP.allergies).toBe("None");
    expect(rsvpRes.body.data.submitRSVP.additionalNotes).toBe("Excited!");
  });
});
