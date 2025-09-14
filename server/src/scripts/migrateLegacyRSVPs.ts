// Migration script to update legacy RSVP records to new format
// Adds guestCount and guests array fields to existing RSVPs

import mongoose from "mongoose";
import RSVP from "../models/RSVP.js";
import dotenv from "dotenv";

dotenv.config();

const dbName = process.env.MONGODB_DB_NAME || "djforever2_dev";
let MONGODB_URI = process.env.MONGODB_URI || "mongodb://localhost:27017";

// Ensure database name is appended to URI
const hasDbName = /mongodb:\/\/[^\/]+(?::\d+)?\/\w+/.test(MONGODB_URI);
if (!hasDbName) {
  MONGODB_URI = MONGODB_URI.replace(/\/$/, "") + `/${dbName}`;
}

async function migrateLegacyRSVPs() {
  try {
    await mongoose.connect(MONGODB_URI);
    console.log(
      `Connected to database: ${mongoose.connection.db?.databaseName}`
    );

    // Find RSVPs that don't have the new format (missing guestCount or guests array)
    const legacyRSVPs = await RSVP.find({
      $or: [
        { guestCount: { $exists: false } },
        { guests: { $exists: false } },
        { guests: { $size: 0 } },
      ],
    });

    console.log(`Found ${legacyRSVPs.length} legacy RSVP records to migrate`);

    if (legacyRSVPs.length === 0) {
      console.log("No legacy RSVPs found. Migration not needed.");
      await mongoose.disconnect();
      return;
    }

    for (const rsvp of legacyRSVPs) {
      console.log(`\nMigrating RSVP for user ${rsvp.userId}:`);
      console.log(`  Current data:`, {
        fullName: rsvp.fullName,
        attending: rsvp.attending,
        mealPreference: rsvp.mealPreference,
        allergies: rsvp.allergies,
      });

      // Create new format with guest array
      const guestCount = 1; // Assume single guest for legacy records
      const guests = [
        {
          fullName: rsvp.fullName || "",
          mealPreference: rsvp.mealPreference || "",
          allergies: rsvp.allergies || "",
        },
      ];

      // Update the RSVP record
      await RSVP.findByIdAndUpdate(rsvp._id, {
        $set: {
          guestCount,
          guests,
        },
      });

      console.log(
        `  ✅ Updated with guestCount: ${guestCount}, guests: ${JSON.stringify(
          guests[0]
        )}`
      );
    }

    console.log(
      `\n🎉 Successfully migrated ${legacyRSVPs.length} legacy RSVP records!`
    );
  } catch (error) {
    console.error("❌ Migration failed:", error);
  } finally {
    await mongoose.disconnect();
    console.log("Disconnected from database");
  }
}

// Run the migration
if (import.meta.url === `file://${process.argv[1]}`) {
  migrateLegacyRSVPs();
}

export default migrateLegacyRSVPs;
