/**
 * Admin Stats Headcount E2E Tests
 *
 * Verifies that adminGetUserStats correctly distinguishes between:
 * - totalAttending: count of RSVP records with attending=YES
 * - totalAttendingGuests: true headcount (1 + guestCount per YES RSVP)
 */

import { describe, beforeAll, afterAll, beforeEach, it, expect } from "vitest";
import request from "supertest";
import { createTestServer } from "./utils/testServer";
import User from "../src/models/User";
import RSVP from "../src/models/RSVP";
import EmailJob from "../src/models/EmailJob";

let app: any;
let stop: () => Promise<void>;
let adminToken: string;

const ADMIN_STATS_QUERY = `
  query {
    adminGetUserStats {
      totalInvited
      totalRSVPed
      totalAttending
      totalAttendingGuests
      totalNotAttending
      totalMaybe
      rsvpPercentage
    }
  }
`;

async function createInvitedUser(
  overrides: Partial<{
    fullName: string;
    email: string;
    qrToken: string;
    isAdmin: boolean;
    plusOneAllowed: boolean;
  }> = {},
) {
  const suffix = Date.now() + Math.random().toString(36).substr(2, 6);
  return User.create({
    fullName: overrides.fullName || `Guest ${suffix}`,
    email: overrides.email || `guest_${suffix}@example.com`,
    qrToken:
      overrides.qrToken ||
      `qr${suffix}`.replace(/[^a-z0-9]/gi, "").slice(0, 30),
    isInvited: true,
    isAdmin: overrides.isAdmin || false,
    plusOneAllowed: overrides.plusOneAllowed || false,
  });
}

describe("Admin Stats Headcount E2E", () => {
  beforeAll(async () => {
    await User.deleteMany({});
    await RSVP.deleteMany({});
    await EmailJob.deleteMany({});

    const server = await createTestServer();
    app = server.app;
    stop = server.stop;

    // Create admin user
    const adminUser = new User({
      fullName: "Admin User",
      email: "admin_stats@example.com",
      qrToken: "adminstatstoken123456",
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
            loginWithQrToken(qrToken: "adminstatstoken123456") {
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
    // Clean up non-admin users and all RSVPs before each test
    await User.deleteMany({ email: { $ne: "admin_stats@example.com" } });
    await RSVP.deleteMany({});
  });

  async function fetchStats() {
    const res = await request(app)
      .post("/graphql")
      .set("Authorization", `Bearer ${adminToken}`)
      .send({ query: ADMIN_STATS_QUERY });

    expect(res.body.errors).toBeUndefined();
    return res.body.data.adminGetUserStats;
  }

  it("returns zeros when no RSVPs exist", async () => {
    // Create an invited user with no RSVP
    await createInvitedUser();

    const stats = await fetchStats();

    // Admin user + the created user = 2 invited
    expect(stats.totalAttending).toBe(0);
    expect(stats.totalAttendingGuests).toBe(0);
    expect(stats.totalNotAttending).toBe(0);
    expect(stats.totalMaybe).toBe(0);
    expect(stats.totalRSVPed).toBe(0);
  });

  it("counts solo YES RSVP as 1 attending and 1 headcount", async () => {
    const user = await createInvitedUser();

    await RSVP.create({
      userId: user._id,
      attending: "YES",
      guestCount: 0,
      guests: [{ fullName: user.fullName }],
    });
    await User.findByIdAndUpdate(user._id, { hasRSVPed: true });

    const stats = await fetchStats();

    expect(stats.totalAttending).toBe(1);
    expect(stats.totalAttendingGuests).toBe(1);
  });

  it("counts YES with plus-ones correctly in headcount", async () => {
    const user = await createInvitedUser({ plusOneAllowed: true });

    await RSVP.create({
      userId: user._id,
      attending: "YES",
      guestCount: 2,
      guests: [
        { fullName: user.fullName },
        { fullName: "Plus One A" },
        { fullName: "Plus One B" },
      ],
    });
    await User.findByIdAndUpdate(user._id, { hasRSVPed: true });

    const stats = await fetchStats();

    // 1 RSVP record with YES
    expect(stats.totalAttending).toBe(1);
    // 1 primary + 2 guests = 3 people
    expect(stats.totalAttendingGuests).toBe(3);
  });

  it("handles mixed attendance statuses correctly", async () => {
    // User 1: YES with 2 additional guests
    const user1 = await createInvitedUser();
    await RSVP.create({
      userId: user1._id,
      attending: "YES",
      guestCount: 2,
      guests: [
        { fullName: "User 1" },
        { fullName: "Guest A" },
        { fullName: "Guest B" },
      ],
    });
    await User.findByIdAndUpdate(user1._id, { hasRSVPed: true });

    // User 2: NO
    const user2 = await createInvitedUser();
    await RSVP.create({
      userId: user2._id,
      attending: "NO",
      guestCount: 0,
      guests: [],
    });
    await User.findByIdAndUpdate(user2._id, { hasRSVPed: true });

    // User 3: MAYBE
    const user3 = await createInvitedUser();
    await RSVP.create({
      userId: user3._id,
      attending: "MAYBE",
      guestCount: 0,
      guests: [{ fullName: "User 3" }],
    });
    await User.findByIdAndUpdate(user3._id, { hasRSVPed: true });

    const stats = await fetchStats();

    expect(stats.totalAttending).toBe(1);
    expect(stats.totalAttendingGuests).toBe(3);
    expect(stats.totalNotAttending).toBe(1);
    expect(stats.totalMaybe).toBe(1);
    expect(stats.totalRSVPed).toBe(3);
  });

  it("aggregates headcount across multiple YES RSVPs", async () => {
    // User 1: YES with 1 additional guest
    const user1 = await createInvitedUser();
    await RSVP.create({
      userId: user1._id,
      attending: "YES",
      guestCount: 1,
      guests: [{ fullName: "User 1" }, { fullName: "Guest of User 1" }],
    });
    await User.findByIdAndUpdate(user1._id, { hasRSVPed: true });

    // User 2: YES with 3 additional guests
    const user2 = await createInvitedUser();
    await RSVP.create({
      userId: user2._id,
      attending: "YES",
      guestCount: 3,
      guests: [
        { fullName: "User 2" },
        { fullName: "Guest A" },
        { fullName: "Guest B" },
        { fullName: "Guest C" },
      ],
    });
    await User.findByIdAndUpdate(user2._id, { hasRSVPed: true });

    const stats = await fetchStats();

    // 2 RSVP records with YES
    expect(stats.totalAttending).toBe(2);
    // (1+1) + (1+3) = 6 people
    expect(stats.totalAttendingGuests).toBe(6);
  });
});
