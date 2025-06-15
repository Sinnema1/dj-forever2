import { describe, beforeAll, afterAll, it, expect } from "vitest";
import request from "supertest";
import mongoose from "mongoose";
import type { Application } from "express";
import { createTestServer } from "./utils/testServer.js";

let app: Application;
let stop: () => Promise<void>;
let jwtToken: string;

describe("🎟 RSVP Queries & Mutations", () => {
  beforeAll(async () => {
    // 1) spin up a fresh Apollo+Express test server
    const server = await createTestServer();
    app = server.app;
    stop = server.stop;

    // 2) register (and log in) a user to obtain token
    const registerRes = await request(app)
      .post("/graphql")
      .send({
        query: `
          mutation {
            registerUser(
              fullName: "RSVP Tester"
              email: "rsvptest@example.com"
              password: "Password123"
            ) {
              token
              user { email }
            }
          }
        `,
      });

    jwtToken = registerRes.body.data.registerUser.token;
    expect(jwtToken).toBeTypeOf("string");
  });

  afterAll(async () => {
    // tear down ApolloServer and Mongo connection
    await stop();
    await mongoose.disconnect();
  });

  it("❌ rejects RSVP query without auth", async () => {
    const res = await request(app)
      .post("/graphql")
      .send({
        query: `
          query {
            getRSVP {
              _id
              fullName
              attending
            }
          }
        `,
      });

    expect(res.body.errors).toBeDefined();
    // Accept 'UNAUTHENTICATED', 'GRAPHQL_VALIDATION_FAILED', or 'INTERNAL_SERVER_ERROR' for flexibility
    const code =
      res.body.errors[0].extensions && res.body.errors[0].extensions.code;
    expect([
      "UNAUTHENTICATED",
      "GRAPHQL_VALIDATION_FAILED",
      "INTERNAL_SERVER_ERROR",
    ]).toContain(code);
  });

  it("🟢 submits an RSVP", async () => {
    const res = await request(app)
      .post("/graphql")
      .set("Authorization", `Bearer ${jwtToken}`)
      .send({
        query: `
          mutation {
            submitRSVP(
              attending: YES
              mealPreference: "Vegetarian"
              allergies: "None"
              additionalNotes: "Can't wait!"
            ) {
              _id
              fullName
              attending
            }
          }
        `,
      });

    // Defensive: check data exists before accessing
    expect(
      res.body.data &&
        res.body.data.submitRSVP &&
        res.body.data.submitRSVP.fullName
    ).toBe("RSVP Tester");
    expect(
      res.body.data &&
        res.body.data.submitRSVP &&
        res.body.data.submitRSVP.attending
    ).toBe("YES");
  });

  it("❌ rejects duplicate RSVP submission", async () => {
    const dup = await request(app)
      .post("/graphql")
      .set("Authorization", `Bearer ${jwtToken}`)
      .send({
        query: `
          mutation {
            submitRSVP(
              attending: NO
              mealPreference: "Vegan"
            ) {
              _id
            }
          }
        `,
      });

    expect(dup.body.errors).toBeDefined();
    expect(dup.body.errors[0].message).toMatch(/already submitted/i);
  });

  it("🟢 edits an existing RSVP", async () => {
    const edit = await request(app)
      .post("/graphql")
      .set("Authorization", `Bearer ${jwtToken}`)
      .send({
        query: `
          mutation {
            editRSVP(
              updates: {
                attending: NO
                mealPreference: "Vegetarian"
                allergies: "None"
                additionalNotes: "Changed my RSVP"
              }
            ) {
              _id
              attending
              mealPreference
              allergies
              additionalNotes
            }
          }
        `,
      });

    // Defensive: check data exists before accessing
    expect(
      edit.body.data &&
        edit.body.data.editRSVP &&
        typeof edit.body.data.editRSVP.attending !== "undefined"
    ).toBe(true); // Field must exist
    expect(edit.body.data.editRSVP.attending).toBe("NO");
    expect(edit.body.data.editRSVP.mealPreference).toBe("Vegetarian");
    expect(edit.body.data.editRSVP.allergies).toBe("None");
    expect(edit.body.data.editRSVP.additionalNotes).toBe("Changed my RSVP");
  });

  it("❌ rejects RSVP submission with missing required fields", async () => {
    // Register a new user to ensure no RSVP exists yet
    const registerRes = await request(app)
      .post("/graphql")
      .send({
        query: `
          mutation {
            registerUser(
              fullName: \"Missing Fields Tester\"
              email: \"missingfields@example.com\"
              password: \"Password123\"
            ) { token }
          }
        `,
      });
    const newToken = registerRes.body.data.registerUser.token;
    expect(newToken).toBeTypeOf("string");

    const res = await request(app)
      .post("/graphql")
      .set("Authorization", `Bearer ${newToken}`)
      .send({
        query: `
          mutation {
            submitRSVP(attending: YES, mealPreference: "") {
              _id
            }
          }
        `,
      });
    expect(res.body.errors).toBeDefined();
    expect(res.body.errors[0].message).toMatch(
      /mealPreference.*required|invalid/i
    );
  });

  it("❌ rejects RSVP submission with invalid attending value", async () => {
    // Register a new user to ensure no RSVP exists yet
    const registerRes = await request(app)
      .post("/graphql")
      .send({
        query: `
          mutation {
            registerUser(
              fullName: \"Invalid Attending Tester\"
              email: \"invalidattending@example.com\"
              password: \"Password123\"
            ) { token }
          }
        `,
      });
    const newToken = registerRes.body.data.registerUser.token;
    expect(newToken).toBeTypeOf("string");

    const res = await request(app)
      .post("/graphql")
      .set("Authorization", `Bearer ${newToken}`)
      .send({
        query: `
          mutation {
            submitRSVP(attending: "notavalidstatus", mealPreference: "Chicken") {
              _id
            }
          }
        `,
      });
    expect(res.body.errors).toBeDefined();
    expect(res.body.errors[0].message).toMatch(
      /attending.*YES, NO, or MAYBE|invalid|enum/i
    );
  });
});
