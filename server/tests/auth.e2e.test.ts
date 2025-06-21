import { describe, beforeAll, afterAll, it, expect } from "vitest";
import request from "supertest";
import mongoose from "mongoose";
import type { Application } from "express";
import { createTestServer } from "./utils/testServer";

let app: Application;
let stop: () => Promise<void>;
let jwtToken: string;

describe("Auth End-to-End", () => {
  beforeAll(async () => {
    const server = await createTestServer();
    app = server.app;
    stop = server.stop;
  });

  afterAll(async () => {
    await stop();
    await mongoose.disconnect();
  });

  it("registers and logs in a user", async () => {
    // Register
    const registerRes = await request(app)
      .post("/graphql")
      .send({
        query: `
          mutation {
            registerUser(
              fullName: "E2E Auth User"
              email: "e2e-auth@example.com"
              password: "Password123"
            ) {
              token
              user { email isInvited }
            }
          }
        `,
      });
    expect(registerRes.body.data.registerUser.token).toBeTypeOf("string");
    expect(registerRes.body.data.registerUser.user.email).toBe("e2e-auth@example.com");
    jwtToken = registerRes.body.data.registerUser.token;

    // Login
    const loginRes = await request(app)
      .post("/graphql")
      .send({
        query: `
          mutation {
            loginUser(email: "e2e-auth@example.com", password: "Password123") {
              token
              user { email isInvited }
            }
          }
        `,
      });
    expect(loginRes.body.data.loginUser.token).toBeTypeOf("string");
    expect(loginRes.body.data.loginUser.user.email).toBe("e2e-auth@example.com");
  });
});
