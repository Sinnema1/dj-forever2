#!/usr/bin/env node

/**
 * Script to create a test user with sinnema1.jm@gmail.com
 * for email testing purposes
 */

const mongoose = require("mongoose");
const crypto = require("crypto");

const DB_URI = "mongodb://localhost:27017/djforever2_dev";

async function createTestUser() {
  try {
    await mongoose.connect(DB_URI);
    console.log("✅ Connected to MongoDB");

    const User = mongoose.model(
      "User",
      new mongoose.Schema({}, { strict: false })
    );

    // Check if test user already exists
    const existing = await User.findOne({ email: "sinnema1.jm@gmail.com" });

    if (existing) {
      console.log("\n✅ Test user already exists with your email:");
      console.log(`   Name: ${existing.firstName} ${existing.lastName}`);
      console.log(`   Email: ${existing.email}`);
      console.log(
        `   RSVP Status: ${existing.hasRSVPed ? "✅ Completed" : "⏳ Pending"}`
      );
      console.log(`   Admin: ${existing.isAdmin ? "Yes" : "No"}`);
      console.log(
        `   QR Login: http://localhost:3002/login/qr/${existing.qrToken}`
      );
    } else {
      // Create new test user with your email
      const qrToken = crypto.randomBytes(12).toString("hex");

      const testUser = await User.create({
        email: "sinnema1.jm@gmail.com",
        firstName: "Justin",
        lastName: "Manning",
        isInvited: true,
        hasRSVPed: false, // Pending RSVP for testing
        isAdmin: false,
        qrToken: qrToken,
        createdAt: new Date(),
        updatedAt: new Date(),
      });

      console.log("\n🎉 Created test user with your email:");
      console.log(`   Name: ${testUser.firstName} ${testUser.lastName}`);
      console.log(`   Email: ${testUser.email}`);
      console.log(
        `   RSVP Status: ${testUser.hasRSVPed ? "✅ Completed" : "⏳ Pending"}`
      );
      console.log(`   QR Token: ${testUser.qrToken}`);
      console.log(
        `   QR Login: http://localhost:3002/login/qr/${testUser.qrToken}`
      );
      console.log("\n✅ You can now send test emails to this user!");
      console.log("   Refresh the Email Reminders tab to see the new user.");
    }

    await mongoose.connection.close();
    process.exit(0);
  } catch (error) {
    console.error("❌ Error:", error.message);
    process.exit(1);
  }
}

createTestUser();
