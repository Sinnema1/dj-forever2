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

  it("registers, logs in, and submits RSVP", async () => {
    // Register
    const registerRes = await request(app)
      .post("/graphql")
      .send({
        query: `
          mutation {
            registerUser(
              fullName: "E2E User"
              email: "e2e@example.com"
              password: "Password123"
            ) {
              token
              user { email isInvited }
            }
          }
        `,
      });
    expect(registerRes.body.data.registerUser.token).toBeTypeOf("string");
    expect(registerRes.body.data.registerUser.user.email).toBe("e2e@example.com");
    expect(registerRes.body.data.registerUser.user.isInvited).toBeTypeOf("boolean");
    jwtToken = registerRes.body.data.registerUser.token;

    // Login
    const loginRes = await request(app)
      .post("/graphql")
      .send({
        query: `
          mutation {
            loginUser(email: "e2e@example.com", password: "Password123") {
              token
              user { email isInvited }
            }
          }
        `,
      });
    expect(loginRes.body.data.loginUser.token).toBeTypeOf("string");
    expect(loginRes.body.data.loginUser.user.email).toBe("e2e@example.com");

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
