/**
 * Admin Address Management E2E Tests
 *
 * Tests address field handling across admin operations:
 * - Creating users with address data
 * - Updating user addresses
 * - Bulk personalization with addresses
 * - CSV export with address columns
 * - Address field validation
 */

import { describe, beforeAll, afterAll, beforeEach, it, expect } from "vitest";
import request from "supertest";
import { createTestServer } from "./utils/testServer";
import { setupTestUser } from "./utils/setupTestUser";
import User from "../src/models/User";
import RSVP from "../src/models/RSVP";
import EmailJob from "../src/models/EmailJob";

let app: any;
let stop: () => Promise<void>;
let adminToken: string;
let testUserId: string;

describe("Admin Address Management E2E", () => {
  beforeAll(async () => {
    // Clean up existing test data
    await User.deleteMany({});
    await RSVP.deleteMany({});
    await EmailJob.deleteMany({});

    const server = await createTestServer();
    app = server.app;
    stop = server.stop;

    // Create admin user
    const adminUser = new User({
      fullName: "Admin User",
      email: "admin@example.com",
      qrToken: "adminqrtokentest123",
      isAdmin: true,
      isInvited: true,
    });
    await adminUser.save();

    // Login as admin
    const loginRes = await request(app)
      .post("/graphql")
      .send({
        query: `
          mutation {
            loginWithQrToken(qrToken: "adminqrtokentest123") {
              token
              user { _id email isAdmin }
            }
          }
        `,
      });

    adminToken = loginRes.body.data.loginWithQrToken.token;
  });

  afterAll(async () => {
    await User.deleteMany({});
    await RSVP.deleteMany({});
    await EmailJob.deleteMany({});
    await stop();
  });

  beforeEach(async () => {
    // Clean up test users before each test
    await User.deleteMany({ email: { $ne: "admin@example.com" } });
  });

  describe("Create User with Address", () => {
    it("should create a new user with complete address information", async () => {
      const res = await request(app)
        .post("/graphql")
        .set("Authorization", `Bearer ${adminToken}`)
        .send({
          query: `
            mutation CreateUserWithAddress($input: AdminCreateUserInput!) {
              adminCreateUser(input: $input) {
                _id
                fullName
                email
                streetAddress
                addressLine2
                city
                state
                zipCode
                country
              }
            }
          `,
          variables: {
            input: {
              fullName: "John Doe",
              email: "john.doe@example.com",
              isInvited: true,
              streetAddress: "123 Main St",
              addressLine2: "Apt 4B",
              city: "New York",
              state: "NY",
              zipCode: "10001",
              country: "USA",
            },
          },
        });

      expect(res.body.errors).toBeUndefined();
      expect(res.body.data.adminCreateUser).toBeDefined();
      expect(res.body.data.adminCreateUser.fullName).toBe("John Doe");
      expect(res.body.data.adminCreateUser.streetAddress).toBe("123 Main St");
      expect(res.body.data.adminCreateUser.addressLine2).toBe("Apt 4B");
      expect(res.body.data.adminCreateUser.city).toBe("New York");
      expect(res.body.data.adminCreateUser.state).toBe("NY");
      expect(res.body.data.adminCreateUser.zipCode).toBe("10001");
      expect(res.body.data.adminCreateUser.country).toBe("USA");

      testUserId = res.body.data.adminCreateUser._id;
    });

    it("should create user with partial address (optional fields)", async () => {
      const res = await request(app)
        .post("/graphql")
        .set("Authorization", `Bearer ${adminToken}`)
        .send({
          query: `
            mutation CreateUserWithPartialAddress($input: AdminCreateUserInput!) {
              adminCreateUser(input: $input) {
                _id
                fullName
                city
                state
                streetAddress
                zipCode
              }
            }
          `,
          variables: {
            input: {
              fullName: "Jane Smith",
              email: "jane.smith@example.com",
              isInvited: true,
              city: "Los Angeles",
              state: "CA",
            },
          },
        });

      expect(res.body.errors).toBeUndefined();
      expect(res.body.data.adminCreateUser.city).toBe("Los Angeles");
      expect(res.body.data.adminCreateUser.state).toBe("CA");
      expect(res.body.data.adminCreateUser.streetAddress).toBeNull();
    });

    it("should allow empty string for address fields to clear them", async () => {
      const res = await request(app)
        .post("/graphql")
        .set("Authorization", `Bearer ${adminToken}`)
        .send({
          query: `
            mutation CreateUserEmptyAddress($input: AdminCreateUserInput!) {
              adminCreateUser(input: $input) {
                _id
                fullName
                streetAddress
                city
              }
            }
          `,
          variables: {
            input: {
              fullName: "Empty Address User",
              email: "empty@example.com",
              isInvited: true,
              streetAddress: "",
              city: "",
            },
          },
        });

      expect(res.body.errors).toBeUndefined();
      expect(res.body.data.adminCreateUser.streetAddress).toBe("");
      expect(res.body.data.adminCreateUser.city).toBe("");
    });
  });

  describe("Update User Address", () => {
    beforeEach(async () => {
      // Create a test user for updates
      const user = new User({
        fullName: "Test User",
        email: "test.user@example.com",
        qrToken: "testuserqrtoken123",
        isInvited: true,
      });
      const saved = await user.save();
      testUserId = saved._id.toString();
    });

    it("should update user address fields", async () => {
      // Verify user exists before test
      const checkUser = await User.findById(testUserId);
      console.log("Test user exists?", !!checkUser, "ID:", testUserId);

      const res = await request(app)
        .post("/graphql")
        .set("Authorization", `Bearer ${adminToken}`)
        .send({
          query: `
            mutation UpdateUserAddress($userId: ID!, $input: AdminUserUpdateInput!) {
              adminUpdateUser(userId: $userId, input: $input) {
                _id
                streetAddress
                city
                state
                zipCode
              }
            }
          `,
          variables: {
            userId: testUserId,
            input: {
              streetAddress: "456 Oak Ave",
              city: "Boston",
              state: "MA",
              zipCode: "02101",
            },
          },
        });

      if (res.body.errors) {
        console.log(
          "GraphQL Errors:",
          JSON.stringify(res.body.errors, null, 2)
        );
      }
      expect(res.body.errors).toBeUndefined();
      expect(res.body.data.adminUpdateUser.streetAddress).toBe("456 Oak Ave");
      expect(res.body.data.adminUpdateUser.city).toBe("Boston");
      expect(res.body.data.adminUpdateUser.state).toBe("MA");
      expect(res.body.data.adminUpdateUser.zipCode).toBe("02101");
    });

    it("should clear address fields when set to empty string", async () => {
      // First set address
      await request(app)
        .post("/graphql")
        .set("Authorization", `Bearer ${adminToken}`)
        .send({
          query: `
            mutation SetAddress($userId: ID!, $input: AdminUserUpdateInput!) {
              adminUpdateUser(userId: $userId, input: $input) {
                _id
                streetAddress
              }
            }
          `,
          variables: {
            userId: testUserId,
            input: {
              streetAddress: "123 Test St",
            },
          },
        });

      // Then clear it
      const res = await request(app)
        .post("/graphql")
        .set("Authorization", `Bearer ${adminToken}`)
        .send({
          query: `
            mutation ClearUserAddress($userId: ID!, $input: AdminUserUpdateInput!) {
              adminUpdateUser(userId: $userId, input: $input) {
                _id
                streetAddress
              }
            }
          `,
          variables: {
            userId: testUserId,
            input: {
              streetAddress: "",
            },
          },
        });

      if (res.body.errors) {
        console.log(
          "Clear Address GraphQL Errors:",
          JSON.stringify(res.body.errors, null, 2)
        );
      }
      expect(res.body.errors).toBeUndefined();
      expect(res.body.data.adminUpdateUser.streetAddress).toBe("");
    });
  });

  describe("Bulk Personalization with Addresses", () => {
    beforeEach(async () => {
      // Create test users for bulk operations
      await User.create([
        {
          fullName: "Bulk User 1",
          email: "bulk1@example.com",
          qrToken: "bulk1qrtoken123",
          isInvited: true,
        },
        {
          fullName: "Bulk User 2",
          email: "bulk2@example.com",
          qrToken: "bulk2qrtoken456",
          isInvited: true,
        },
      ]);
    });

    it("should bulk update multiple users with address data", async () => {
      const res = await request(app)
        .post("/graphql")
        .set("Authorization", `Bearer ${adminToken}`)
        .send({
          query: `
            mutation BulkUpdateWithAddresses($updates: [BulkPersonalizationInput!]!) {
              adminBulkUpdatePersonalization(updates: $updates) {
                success
                updated
                failed
                errors {
                  email
                  error
                }
              }
            }
          `,
          variables: {
            updates: [
              {
                email: "bulk1@example.com",
                fullName: "Bulk User 1",
                personalization: {
                  streetAddress: "111 First St",
                  city: "Chicago",
                  state: "IL",
                  zipCode: "60601",
                },
              },
              {
                email: "bulk2@example.com",
                fullName: "Bulk User 2",
                personalization: {
                  streetAddress: "222 Second Ave",
                  city: "Seattle",
                  state: "WA",
                  zipCode: "98101",
                },
              },
            ],
          },
        });

      expect(res.body.errors).toBeUndefined();
      expect(res.body.data.adminBulkUpdatePersonalization.success).toBe(2);
      expect(res.body.data.adminBulkUpdatePersonalization.updated).toBe(2);
      expect(res.body.data.adminBulkUpdatePersonalization.failed).toBe(0);

      // Verify addresses were saved
      const user1 = await User.findOne({ email: "bulk1@example.com" });
      expect(user1?.streetAddress).toBe("111 First St");
      expect(user1?.city).toBe("Chicago");

      const user2 = await User.findOne({ email: "bulk2@example.com" });
      expect(user2?.streetAddress).toBe("222 Second Ave");
      expect(user2?.city).toBe("Seattle");
    });

    it("should create new user with address via bulk personalization", async () => {
      const res = await request(app)
        .post("/graphql")
        .set("Authorization", `Bearer ${adminToken}`)
        .send({
          query: `
            mutation BulkCreateWithAddress($updates: [BulkPersonalizationInput!]!) {
              adminBulkUpdatePersonalization(updates: $updates) {
                success
                created
                failed
              }
            }
          `,
          variables: {
            updates: [
              {
                email: "newuser@example.com",
                fullName: "New User",
                personalization: {
                  streetAddress: "999 New St",
                  city: "Portland",
                  state: "OR",
                  zipCode: "97201",
                  country: "USA",
                },
              },
            ],
          },
        });

      expect(res.body.errors).toBeUndefined();
      expect(res.body.data.adminBulkUpdatePersonalization.created).toBe(1);

      // Verify user was created with address
      const newUser = await User.findOne({ email: "newuser@example.com" });
      expect(newUser).toBeDefined();
      expect(newUser?.streetAddress).toBe("999 New St");
      expect(newUser?.city).toBe("Portland");
      expect(newUser?.country).toBe("USA");
    });
  });

  describe("CSV Export with Address Columns", () => {
    beforeEach(async () => {
      // Create users with various address data
      await User.create([
        {
          fullName: "Complete Address User",
          email: "complete@example.com",
          qrToken: "completeqrtoken789",
          isInvited: true,
          streetAddress: "100 Complete St",
          addressLine2: "Suite 200",
          city: "Denver",
          state: "CO",
          zipCode: "80201",
          country: "USA",
        },
        {
          fullName: "Partial Address User",
          email: "partial@example.com",
          qrToken: "partialqrtoken012",
          isInvited: true,
          city: "Austin",
          state: "TX",
        },
        {
          fullName: "No Address User",
          email: "noaddress@example.com",
          qrToken: "noaddressqrtoken345",
          isInvited: true,
        },
      ]);
    });

    it("should include address columns in CSV export", async () => {
      const res = await request(app)
        .post("/graphql")
        .set("Authorization", `Bearer ${adminToken}`)
        .send({
          query: `
            query ExportGuestList {
              adminExportGuestList
            }
          `,
        });

      expect(res.body.errors).toBeUndefined();
      const csv = res.body.data.adminExportGuestList;

      // Verify CSV header includes address columns
      expect(csv).toContain("Street Address");
      expect(csv).toContain("Address Line 2");
      expect(csv).toContain("City");
      expect(csv).toContain("State");
      expect(csv).toContain("Zip Code");
      expect(csv).toContain("Country");

      // Verify complete address data is exported
      expect(csv).toContain("100 Complete St");
      expect(csv).toContain("Suite 200");
      expect(csv).toContain("Denver");
      expect(csv).toContain("CO");
      expect(csv).toContain("80201");

      // Verify partial address exports correctly (empty fields)
      const lines = csv.split("\n");
      const partialLine = lines.find((line: string) =>
        line.includes("partial@example.com")
      );
      expect(partialLine).toBeDefined();
      expect(partialLine).toContain("Austin");
    });
  });

  describe("Address Field Validation", () => {
    it("should validate address field max lengths via schema", async () => {
      const longStreet = "A".repeat(201); // Exceeds 200 char limit

      const res = await request(app)
        .post("/graphql")
        .set("Authorization", `Bearer ${adminToken}`)
        .send({
          query: `
            mutation CreateUserLongAddress($input: AdminCreateUserInput!) {
              adminCreateUser(input: $input) {
                _id
              }
            }
          `,
          variables: {
            input: {
              fullName: "Long Address User",
              email: "longaddress@example.com",
              isInvited: true,
              streetAddress: longStreet,
            },
          },
        });

      // Should fail validation
      expect(res.body.errors).toBeDefined();
      expect(res.body.errors[0].message).toMatch(
        /street address|streetAddress/i
      );
    });
  });
});
