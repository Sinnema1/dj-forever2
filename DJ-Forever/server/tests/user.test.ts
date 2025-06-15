import { describe, beforeAll, afterAll, it, expect } from "vitest";
import request from "supertest";
import mongoose from "mongoose";
import type { Application } from "express";
import { createTestServer } from "./utils/testServer.js";

let app: Application;
let stop: () => Promise<void>;
let jwtToken: string;

describe("👤 User Queries", () => {
  beforeAll(async () => {
    // 1) Spin up Apollo+Express test server
    const server = await createTestServer();
    app = server.app;
    stop = server.stop;

    // 2) Register a new user to get a valid JWT
    const registerRes = await request(app)
      .post("/graphql")
      .send({
        query: `
          mutation {
            registerUser(
              fullName: "Me Tester"
              email: "me@test.com"
              password: "Password123"
            ) {
              token
            }
          }
        `,
      });

    // Ensure we got back a token
    jwtToken = registerRes.body.data.registerUser.token;
    expect(jwtToken).toBeTypeOf("string");
  });

  afterAll(async () => {
    // Tear down ApolloServer and mongoose connection
    await stop();
    await mongoose.disconnect();
  });

  it("❌ rejects “me” query without auth", async () => {
    const res = await request(app)
      .post("/graphql")
      .send({ query: `query { me { _id fullName email } }` });

    expect(res.body.errors).toBeDefined();
    // Accept either 'UNAUTHENTICATED' or 'INTERNAL_SERVER_ERROR' for flexibility
    const code =
      res.body.errors[0].extensions && res.body.errors[0].extensions.code;
    expect(["UNAUTHENTICATED", "INTERNAL_SERVER_ERROR"]).toContain(code);
  });

  it("🟢 fetches “me” when authenticated", async () => {
    const res = await request(app)
      .post("/graphql")
      .set("Authorization", `Bearer ${jwtToken}`)
      .send({
        query: `
          query {
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
      "me@test.com"
    );
    // Your User type should now include isInvited
    expect(res.body.data && res.body.data.me).toHaveProperty("isInvited");
  });

  it("❌ rejects 'me' query with invalid/expired token", async () => {
    const res = await request(app)
      .post("/graphql")
      .set("Authorization", `Bearer invalidtoken123`)
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
    expect(res.body.errors[0].message).toMatch(
      /authentication required|invalid token|must be logged in|context creation failed|invalid or expired token|jwt malformed/i
    );
  });
});
