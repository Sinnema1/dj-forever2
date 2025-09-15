import { describe, beforeAll, afterAll, it, expect, beforeEach } from "vitest";
import request from "supertest";
import mongoose from "mongoose";
import { createTestServer } from "./utils/testServer";
import { Application } from "express-serve-static-core";
import { setupTestUser } from "./utils/setupTestUser";
import RSVP from "../src/models/RSVP.js";

let app: any;
let stop: () => Promise<void>;
let jwtToken: string;
let testUserEmail: string;
let testQrToken: string;

describe("RSVP End-to-End", () => {
  beforeAll(async () => {
    const server = await createTestServer();
    app = server.app;
    stop = server.stop;
  });

  beforeEach(async () => {
    // Setup fresh test user for each test
    // Generate QR token that matches validation pattern (alphanumeric only, 10-40 chars)
    testQrToken = `test${Date.now()}${Math.random()
      .toString(36)
      .substr(2, 9)}`.replace(/[^a-z0-9]/gi, "");
    testUserEmail = `test_${Date.now()}@example.com`;

    await setupTestUser(testQrToken, testUserEmail);

    // Clean up any existing RSVPs for test user
    await RSVP.deleteMany({ userId: { $exists: true } });

    // Login to get JWT token
    const loginRes = await request(app)
      .post("/graphql")
      .send({
        query: `
          mutation {
            loginWithQrToken(qrToken: "${testQrToken}") {
              token
              user { email isInvited qrToken }
            }
          }
        `,
      });

    expect(loginRes.body.data.loginWithQrToken).not.toBeNull();
    jwtToken = loginRes.body.data.loginWithQrToken.token;
  });

  afterAll(async () => {
    await stop();
    await mongoose.disconnect();
  });

  describe("Legacy RSVP Submission (submitRSVP)", () => {
    it("submits attending RSVP with legacy mutation", async () => {
      const rsvpRes = await request(app)
        .post("/graphql")
        .set("Authorization", `Bearer ${jwtToken}`)
        .send({
          query: `
            mutation {
              submitRSVP(
                attending: YES
                mealPreference: "chicken"
                allergies: "None"
                additionalNotes: "Excited!"
              ) {
                _id
                attending
                mealPreference
                allergies
                additionalNotes
                fullName
              }
            }
          `,
        });

      if (rsvpRes.body.errors) {
        console.error("GraphQL errors:", rsvpRes.body.errors);
      }

      expect(rsvpRes.body.data.submitRSVP).not.toBeNull();
      expect(rsvpRes.body.data.submitRSVP.attending).toBe("YES");
      expect(rsvpRes.body.data.submitRSVP.mealPreference).toBe("chicken");
      expect(rsvpRes.body.data.submitRSVP.allergies).toBe("None");
      expect(rsvpRes.body.data.submitRSVP.additionalNotes).toBe("Excited!");
    });
  });

  describe("Modern RSVP Creation (createRSVP)", () => {
    it("creates attending RSVP with required fields", async () => {
      const rsvpRes = await request(app)
        .post("/graphql")
        .set("Authorization", `Bearer ${jwtToken}`)
        .send({
          query: `
            mutation {
              createRSVP(input: {
                attending: YES
                guestCount: 1
                guests: [
                  {
                    fullName: "Test User"
                    mealPreference: "chicken"
                    allergies: "None"
                  }
                ]
                additionalNotes: "Looking forward to it!"
                fullName: "Test User"
                mealPreference: "chicken"
                allergies: "None"
              }) {
                _id
                attending
                guestCount
                guests {
                  fullName
                  mealPreference
                  allergies
                }
                additionalNotes
                fullName
                mealPreference
                allergies
              }
            }
          `,
        });

      if (rsvpRes.body.errors) {
        console.error("GraphQL errors:", rsvpRes.body.errors);
      }

      expect(rsvpRes.body.data.createRSVP).not.toBeNull();
      expect(rsvpRes.body.data.createRSVP.attending).toBe("YES");
      expect(rsvpRes.body.data.createRSVP.guestCount).toBe(1);
      expect(rsvpRes.body.data.createRSVP.guests).toHaveLength(1);
      expect(rsvpRes.body.data.createRSVP.guests[0].fullName).toBe("Test User");
      expect(rsvpRes.body.data.createRSVP.guests[0].mealPreference).toBe(
        "chicken"
      );
    });

    it("creates non-attending RSVP without guest details", async () => {
      const rsvpRes = await request(app)
        .post("/graphql")
        .set("Authorization", `Bearer ${jwtToken}`)
        .send({
          query: `
            mutation {
              createRSVP(input: {
                attending: NO
                guestCount: 1
                guests: [
                  {
                    fullName: ""
                    mealPreference: ""
                    allergies: ""
                  }
                ]
                additionalNotes: "Sorry, can't make it"
                fullName: "Test User"
                mealPreference: ""
                allergies: ""
              }) {
                _id
                attending
                guestCount
                guests {
                  fullName
                  mealPreference
                  allergies
                }
                additionalNotes
              }
            }
          `,
        });

      if (rsvpRes.body.errors) {
        console.error("GraphQL errors:", rsvpRes.body.errors);
      }

      expect(rsvpRes.body.data.createRSVP).not.toBeNull();
      expect(rsvpRes.body.data.createRSVP.attending).toBe("NO");
      expect(rsvpRes.body.data.createRSVP.additionalNotes).toBe(
        "Sorry, cant make it"
      );

      // For non-attending, guest details should be empty/cleared
      expect(rsvpRes.body.data.createRSVP.guests).toHaveLength(0);
    });

    it("creates maybe RSVP without guest details", async () => {
      const rsvpRes = await request(app)
        .post("/graphql")
        .set("Authorization", `Bearer ${jwtToken}`)
        .send({
          query: `
            mutation {
              createRSVP(input: {
                attending: MAYBE
                guestCount: 1
                guests: [
                  {
                    fullName: ""
                    mealPreference: ""
                    allergies: ""
                  }
                ]
                additionalNotes: "Not sure yet"
                fullName: "Test User"
                mealPreference: ""
                allergies: ""
              }) {
                _id
                attending
                guestCount
                guests {
                  fullName
                  mealPreference
                  allergies
                }
                additionalNotes
              }
            }
          `,
        });

      if (rsvpRes.body.errors) {
        console.error("GraphQL errors:", rsvpRes.body.errors);
      }

      expect(rsvpRes.body.data.createRSVP).not.toBeNull();
      expect(rsvpRes.body.data.createRSVP.attending).toBe("MAYBE");
      expect(rsvpRes.body.data.createRSVP.additionalNotes).toBe("Not sure yet");
    });

    it("fails to create attending RSVP without required guest name", async () => {
      const rsvpRes = await request(app)
        .post("/graphql")
        .set("Authorization", `Bearer ${jwtToken}`)
        .send({
          query: `
            mutation {
              createRSVP(input: {
                attending: YES
                guestCount: 1
                guests: [
                  {
                    fullName: ""
                    mealPreference: "chicken"
                    allergies: ""
                  }
                ]
                additionalNotes: ""
                fullName: ""
                mealPreference: "chicken"
                allergies: ""
              }) {
                _id
                attending
              }
            }
          `,
        });

      expect(rsvpRes.body.errors).toBeDefined();
      expect(rsvpRes.body.errors[0].message).toContain("name");
    });

    it("fails to create attending RSVP without required meal preference", async () => {
      const rsvpRes = await request(app)
        .post("/graphql")
        .set("Authorization", `Bearer ${jwtToken}`)
        .send({
          query: `
            mutation {
              createRSVP(input: {
                attending: YES
                guestCount: 1
                guests: [
                  {
                    fullName: "Test User"
                    mealPreference: ""
                    allergies: ""
                  }
                ]
                additionalNotes: ""
                fullName: "Test User"
                mealPreference: ""
                allergies: ""
              }) {
                _id
                attending
              }
            }
          `,
        });

      expect(rsvpRes.body.errors).toBeDefined();
      expect(rsvpRes.body.errors[0].message).toContain("Meal preference");
    });
  });

  describe("RSVP Editing (editRSVP)", () => {
    it("edits existing RSVP from attending to not attending", async () => {
      // First create an attending RSVP
      await request(app)
        .post("/graphql")
        .set("Authorization", `Bearer ${jwtToken}`)
        .send({
          query: `
            mutation {
              createRSVP(input: {
                attending: YES
                guestCount: 1
                guests: [
                  {
                    fullName: "Test User"
                    mealPreference: "chicken"
                    allergies: "None"
                  }
                ]
                additionalNotes: "Looking forward to it!"
                fullName: "Test User"
                mealPreference: "chicken"
                allergies: "None"
              }) {
                _id
              }
            }
          `,
        });

      // Now edit to not attending
      const editRes = await request(app)
        .post("/graphql")
        .set("Authorization", `Bearer ${jwtToken}`)
        .send({
          query: `
            mutation {
              editRSVP(updates: {
                attending: NO
                guestCount: 1
                guests: [
                  {
                    fullName: ""
                    mealPreference: ""
                    allergies: ""
                  }
                ]
                additionalNotes: "Sorry, can't make it after all"
              }) {
                _id
                attending
                additionalNotes
                guests {
                  fullName
                  mealPreference
                }
              }
            }
          `,
        });

      if (editRes.body.errors) {
        console.error("GraphQL errors:", editRes.body.errors);
      }

      expect(editRes.body.data.editRSVP).not.toBeNull();
      expect(editRes.body.data.editRSVP.attending).toBe("NO");
      expect(editRes.body.data.editRSVP.additionalNotes).toBe(
        "Sorry, cant make it after all"
      );
    });
  });

  describe("RSVP Validation Edge Cases", () => {
    it("handles invalid meal preferences for attending guests", async () => {
      const rsvpRes = await request(app)
        .post("/graphql")
        .set("Authorization", `Bearer ${jwtToken}`)
        .send({
          query: `
            mutation {
              createRSVP(input: {
                attending: YES
                guestCount: 1
                guests: [
                  {
                    fullName: "Test User"
                    mealPreference: "invalid_meal"
                    allergies: ""
                  }
                ]
                additionalNotes: ""
                fullName: "Test User"
                mealPreference: "invalid_meal"
                allergies: ""
              }) {
                _id
              }
            }
          `,
        });

      expect(rsvpRes.body.errors).toBeDefined();
      expect(rsvpRes.body.errors[0].message).toContain("meal preference");
    });

    it("handles very long additional notes", async () => {
      const longNotes = "a".repeat(600); // Exceeds 500 character limit

      const rsvpRes = await request(app)
        .post("/graphql")
        .set("Authorization", `Bearer ${jwtToken}`)
        .send({
          query: `
            mutation {
              createRSVP(input: {
                attending: NO
                guestCount: 1
                guests: [
                  {
                    fullName: ""
                    mealPreference: ""
                    allergies: ""
                  }
                ]
                additionalNotes: "${longNotes}"
                fullName: "Test User"
                mealPreference: ""
                allergies: ""
              }) {
                _id
                additionalNotes
              }
            }
          `,
        });

      if (rsvpRes.body.errors) {
        console.error("GraphQL errors:", rsvpRes.body.errors);
      }

      // Should either truncate or reject
      if (rsvpRes.body.data?.createRSVP) {
        expect(
          rsvpRes.body.data.createRSVP.additionalNotes.length
        ).toBeLessThanOrEqual(500);
      } else {
        expect(rsvpRes.body.errors).toBeDefined();
      }
    });
  });
});
