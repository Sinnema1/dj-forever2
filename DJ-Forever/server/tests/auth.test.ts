import { describe, it, expect, beforeAll, afterAll } from "vitest";
import request from "supertest";
import mongoose from "mongoose";
import type { Application } from "express";
import { createTestServer } from "./utils/testServer.js";

let app: Application;
let stop: () => Promise<void>;
let jwtToken: string;

describe("🔐 Authentication & Registration", () => {
  beforeAll(async () => {
    // Start up a fresh Apollo/Express instance
    const server = await createTestServer();
    app = server.app;
    stop = server.stop;
    // (Mongo connection is handled via vitest.setup.ts)
  });

  afterAll(async () => {
    // Tear down ApolloServer and mongoose
    await stop();
    await mongoose.disconnect();
  });

  it("❌ rejects unauthenticated “me” query", async () => {
    const res = await request(app)
      .post("/graphql")
      .send({
        query: `
          query Me {
            me {
              _id
              fullName
              email
            }
          }
        `,
      });

    expect(res.body.errors).toBeDefined();
    // Accept either the old or new error message for flexibility
    expect(res.body.errors[0].message).toMatch(
      /Authentication required|You must be logged in/i
    );
  });

  it("🟢 registers a new user", async () => {
    const res = await request(app)
      .post("/graphql")
      .send({
        query: `
          mutation {
            registerUser(
              fullName: "Test User"
              email: "test@example.com"
              password: "Password123"
            ) {
              token
              user {
                _id
                fullName
                email
              }
            }
          }
        `,
      });
    if (
      !res.body.data ||
      !res.body.data.registerUser ||
      !res.body.data.registerUser.token
    ) {
      console.error("Register response:", JSON.stringify(res.body, null, 2));
    }
    // Defensive: check data exists before accessing
    expect(
      res.body.data &&
        res.body.data.registerUser &&
        res.body.data.registerUser.token
    ).toBeTypeOf("string");
    expect(
      res.body.data &&
        res.body.data.registerUser &&
        res.body.data.registerUser.user.email
    ).toBe("test@example.com");

    // Save token for later authenticated requests
    jwtToken = res.body.data.registerUser.token;
  });

  it("❌ rejects registration with an existing email", async () => {
    const res = await request(app)
      .post("/graphql")
      .send({
        query: `
          mutation {
            registerUser(
              fullName: "Another User"
              email: "test@example.com"
              password: "AnotherPass123"
            ) {
              token
              user {
                _id
                fullName
                email
              }
            }
          }
        `,
      });

    expect(res.body.errors).toBeDefined();
    // Adjust the regex to match your actual error message
    expect(res.body.errors[0].message).toMatch(/User already exists/i);
  });

  it("🟢 logs in with valid credentials", async () => {
    const res = await request(app)
      .post("/graphql")
      .send({
        query: `
          mutation {
            loginUser(email: "test@example.com", password: "Password123") {
              token
              user {
                email
              }
            }
          }
        `,
      });
    if (
      !res.body.data ||
      !res.body.data.loginUser ||
      !res.body.data.loginUser.token
    ) {
      console.error("Login response:", JSON.stringify(res.body, null, 2));
    }
    expect(res.body.data.loginUser.token).toBeTypeOf("string");
  });

  it("❌ fails login with wrong password", async () => {
    const res = await request(app)
      .post("/graphql")
      .send({
        query: `
          mutation {
            loginUser(email: "test@example.com", password: "wrong") {
              token
              user {
                email
              }
            }
          }
        `,
      });

    expect(res.body.errors).toBeDefined();
    expect(res.body.errors[0].message).toMatch(
      /Invalid credentials|Authentication failed/i
    );
  });

  it("🟢 fetches “me” when authenticated", async () => {
    const res = await request(app)
      .post("/graphql")
      .set("Authorization", `Bearer ${jwtToken}`)
      .send({
        query: `
          query Me {
            me {
              _id
              fullName
              email
              isInvited
            }
          }
        `,
      });

    // Defensive: check data exists before accessing
    expect(res.body.data && res.body.data.me && res.body.data.me.email).toBe(
      "test@example.com"
    );
    // Verify the flag is present and a boolean
    expect(
      res.body.data && res.body.data.me && typeof res.body.data.me.isInvited
    ).toBe("boolean");
  });

  it("❌ rejects registration with missing fields", async () => {
    const res = await request(app)
      .post("/graphql")
      .send({
        query: `
          mutation {
            registerUser(fullName: "No Email", email: "", password: "Password123") {
              token
              user { email }
            }
          }
        `,
      });
    expect(res.body.errors).toBeDefined();
    expect(res.body.errors[0].message).toMatch(/email.*required|invalid/i);
  });

  it("❌ rejects registration with invalid email", async () => {
    const res = await request(app)
      .post("/graphql")
      .send({
        query: `
          mutation {
            registerUser(fullName: "Bad Email", email: "notanemail", password: "Password123") {
              token
              user { email }
            }
          }
        `,
      });
    expect(res.body.errors).toBeDefined();
    expect(res.body.errors[0].message).toMatch(/valid email/i);
  });

  it("❌ fails login with wrong email", async () => {
    const res = await request(app)
      .post("/graphql")
      .send({
        query: `
          mutation {
            loginUser(email: "notfound@example.com", password: "Password123") {
              token
              user { email }
            }
          }
        `,
      });
    expect(res.body.errors).toBeDefined();
    expect(res.body.errors[0].message).toMatch(/invalid email or password/i);
  });

  it("❌ fails login with missing fields", async () => {
    const res = await request(app)
      .post("/graphql")
      .send({
        query: `
          mutation {
            loginUser(email: "", password: "") {
              token
              user { email }
            }
          }
        `,
      });
    expect(res.body.errors).toBeDefined();
    expect(res.body.errors[0].message).toMatch(
      /invalid email or password|required/i
    );
  });
});
