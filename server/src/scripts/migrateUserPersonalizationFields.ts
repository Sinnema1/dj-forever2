/**
 * Migration Script: Add User Personalization Fields
 *
 * This script adds the new personalization fields to existing users in the database.
 * New fields: relationshipToBride, relationshipToGroom, customWelcomeMessage, guestGroup, plusOneAllowed
 *
 * Run this script with:
 * - Development: npm run migrate:user-personalization
 * - Production: NODE_ENV=production npm run migrate:user-personalization
 *
 * @author DJ Forever Development Team
 * @created 2025
 */

import mongoose from "mongoose";
import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";
import User from "../models/User.js";

// ES Module equivalents of __dirname
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load environment variables
dotenv.config({ path: path.resolve(__dirname, "../../.env") });

const MONGODB_URI = process.env.MONGODB_URI || "mongodb://localhost:27017";
const MONGODB_DB_NAME = process.env.MONGODB_DB_NAME || "djforever2_dev";

/**
 * Connect to MongoDB database
 */
async function connectDB(): Promise<void> {
  try {
    await mongoose.connect(MONGODB_URI, {
      dbName: MONGODB_DB_NAME,
    });
    console.log(`✅ Connected to MongoDB: ${MONGODB_DB_NAME}`);
  } catch (error) {
    console.error("❌ MongoDB connection error:", error);
    throw error;
  }
}

/**
 * Migrate users to include new personalization fields
 */
async function migrateUsers(): Promise<void> {
  console.log("\n🔄 Starting user personalization migration...\n");

  try {
    // Find all users that don't have the plusOneAllowed field set
    const usersToMigrate = await (User.find as any)({
      plusOneAllowed: { $exists: false },
    });

    console.log(`📊 Found ${usersToMigrate.length} users to migrate`);

    if (usersToMigrate.length === 0) {
      console.log("✅ All users already have personalization fields");
      return;
    }

    let migratedCount = 0;
    let errorCount = 0;

    for (const user of usersToMigrate) {
      try {
        // Set default values for new fields
        user.relationshipToBride = user.relationshipToBride || undefined;
        user.relationshipToGroom = user.relationshipToGroom || undefined;
        user.customWelcomeMessage = user.customWelcomeMessage || undefined;
        user.guestGroup = user.guestGroup || undefined;
        user.plusOneAllowed = user.plusOneAllowed ?? false; // Default to false

        await user.save();
        migratedCount++;

        if (migratedCount % 10 === 0) {
          console.log(
            `   ↳ Migrated ${migratedCount}/${usersToMigrate.length} users...`
          );
        }
      } catch (error) {
        errorCount++;
        console.error(`❌ Error migrating user ${user.email}:`, error);
      }
    }

    console.log("\n📈 Migration Summary:");
    console.log(`   ✅ Successfully migrated: ${migratedCount} users`);
    console.log(`   ❌ Errors: ${errorCount} users`);
    console.log(`   📊 Total processed: ${usersToMigrate.length} users`);

    // Verify migration
    const remainingUsers = await (User.countDocuments as any)({
      plusOneAllowed: { $exists: false },
    });

    if (remainingUsers === 0) {
      console.log(
        "\n✅ Migration completed successfully! All users have personalization fields."
      );
    } else {
      console.log(
        `\n⚠️  Warning: ${remainingUsers} users still missing personalization fields`
      );
    }
  } catch (error) {
    console.error("❌ Migration failed:", error);
    throw error;
  }
}

/**
 * Main execution function
 */
async function main(): Promise<void> {
  try {
    await connectDB();
    await migrateUsers();
    console.log("\n✅ Migration script completed successfully!\n");
    process.exit(0);
  } catch (error) {
    console.error("\n❌ Migration script failed:", error);
    process.exit(1);
  } finally {
    await mongoose.connection.close();
    console.log("🔌 Database connection closed");
  }
}

// Run the migration
main();
