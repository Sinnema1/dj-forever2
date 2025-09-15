#!/usr/bin/env ts-node

/**
 * Script to update hasRSVPed field for users who have existing RSVPs
 * This fixes the issue where users with RSVPs still see "Don't forget to RSVP"
 */

import mongoose from "mongoose";
import User from "../models/User.js";
import RSVP from "../models/RSVP.js";

const MONGODB_URI =
  process.env.MONGODB_URI || "mongodb://localhost:27017/djforever2_dev";

async function updateHasRSVPed() {
  try {
    console.log("🔗 Connecting to MongoDB...");
    await mongoose.connect(MONGODB_URI);
    console.log("✅ Connected to MongoDB");

    // Find all users who have RSVPs but don't have hasRSVPed set to true
    console.log("🔍 Finding users with RSVPs...");

    const rsvps = await (RSVP.find as any)({});
    console.log(`📝 Found ${rsvps.length} RSVPs in database`);

    let updatedCount = 0;

    for (const rsvp of rsvps) {
      const user = await (User.findById as any)(rsvp.userId);

      if (user && !user.hasRSVPed) {
        console.log(
          `📤 Updating hasRSVPed for ${user.fullName} (${user.email})`
        );

        await (User.findByIdAndUpdate as any)(user._id, {
          hasRSVPed: true,
        });

        updatedCount++;
      } else if (user && user.hasRSVPed) {
        console.log(`✅ ${user.fullName} already has hasRSVPed = true`);
      } else {
        console.log(
          `⚠️  Could not find user for RSVP with userId: ${rsvp.userId}`
        );
      }
    }

    console.log(`\n🎉 Updated ${updatedCount} users`);
    console.log("✅ Script completed successfully");
  } catch (error) {
    console.error("❌ Error updating hasRSVPed:", error);
  } finally {
    await mongoose.disconnect();
    console.log("🔌 Disconnected from MongoDB");
  }
}

// Run the script
updateHasRSVPed();
