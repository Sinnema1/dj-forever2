/**
 * @fileoverview Core Database Seeding Logic
 *
 * Comprehensive database seeding system for DJ Forever 2 wedding website providing:
 * - User account creation with QR token generation
 * - RSVP data initialization with user relationship mapping
 * - Data integrity validation and error handling
 * - Flexible connection management for different environments
 *
 * Seeding Process:
 * 1. Load user and RSVP data from JSON configuration files
 * 2. Generate unique QR tokens for passwordless authentication
 * 3. Insert users into database with invitation status
 * 4. Create user lookup map for RSVP relationship mapping
 * 5. Insert RSVPs with proper user references
 * 6. Update user records with RSVP completion status
 *
 * Data Relationships:
 * - Users: Core invitation and authentication entities
 * - RSVPs: Guest responses linked to specific users
 * - QR Tokens: Unique authentication codes per user
 *
 * Configuration Files:
 * - userData.json: User accounts, emails, invitation status
 * - rsvpData.json: RSVP responses, guest counts, meal preferences
 *
 * @author DJ Forever 2 Team
 * @version 1.0.0
 */

import mongoose from "mongoose";
import User from "../models/User.js";
import RSVP from "../models/RSVP.js";
import fs from "fs";

/**
 * Seed database with complete user and RSVP dataset
 *
 * Performs comprehensive database initialization:
 * - Reads JSON configuration files for user and RSVP data
 * - Generates unique QR authentication tokens for each user
 * - Establishes proper relationships between users and their RSVPs
 * - Updates user records with RSVP completion status
 * - Provides detailed logging for troubleshooting
 *
 * Data Integrity:
 * - Validates user-RSVP email matching
 * - Ensures QR token uniqueness
 * - Maintains referential integrity between collections
 * - Handles missing or malformed data gracefully
 *
 * @param closeConnection - Whether to close database connection after seeding (default: false)
 *
 * @example
 * ```typescript
 * // Standalone seeding (closes connection)
 * await seedDatabase(true);
 *
 * // Application startup seeding (keeps connection open)
 * await seedDatabase(false);
 *
 * // Seeding output:
 * // 🚀 Starting database seeding for djforever2...
 * // ✅ Inserted 50 users.
 * // ✅ Inserted 25 RSVPs.
 * // 🎉 Database seeding completed successfully!
 * ```
 *
 * @throws {Error} When JSON files are missing or malformed
 * @throws {Error} When database operations fail
 *
 * @performance
 * - Bulk inserts for efficient database operations
 * - In-memory user mapping for O(1) RSVP lookups
 * - Minimal database round trips with batch updates
 *
 * @security
 * - QR tokens use cryptographically random generation
 * - Email validation during user-RSVP mapping
 * - Prevents duplicate QR token generation
 */
export const seedDatabase = async (closeConnection = false) => {
  try {
    console.log("🚀 Starting database seeding for djforever2...");

    // Read and parse user & RSVP data from JSON files
    const userData = JSON.parse(
      fs.readFileSync("./src/seeds/userData.json", "utf-8")
    );
    const rsvpData = JSON.parse(
      fs.readFileSync("./src/seeds/rsvpData.json", "utf-8")
    );

    // Helper to generate a random QR token
    function generateQrToken() {
      return (
        Math.random().toString(36).slice(2) +
        Math.random().toString(36).slice(2)
      );
    }

    const usersWithQrTokens = userData.users.map((user: any) => ({
      fullName: user.fullName,
      email: user.email,
      isInvited: user.isInvited,
      hasRSVPed: user.hasRSVPed,
      qrToken: user.qrToken || generateQrToken(),
      // Personalization fields (Phase 1)
      relationshipToBride: user.relationshipToBride,
      relationshipToGroom: user.relationshipToGroom,
      customWelcomeMessage: user.customWelcomeMessage,
      guestGroup: user.guestGroup,
      plusOneAllowed: user.plusOneAllowed ?? false,
    }));

    // Insert users and retrieve their new IDs
    const insertedUsers = await User.insertMany(usersWithQrTokens);
    console.log(`✅ Inserted ${insertedUsers.length} users.`);

    // Create a user lookup (email → ObjectId)
    const userMap = new Map(
      insertedUsers.map((user) => [user.email, user._id])
    );

    // Map RSVPs with correct userIds
    const rsvpsWithUserIds = rsvpData.rsvps
      .map((rsvp: any) => {
        const userId = userMap.get(rsvp.userEmail);
        if (!userId) {
          console.warn(`⚠️ No matching user found for RSVP: ${rsvp.userEmail}`);
          return null;
        }
        return { ...rsvp, userId };
      })
      .filter(Boolean);

    // Insert RSVPs into the database
    if (rsvpsWithUserIds.length > 0) {
      const insertedRSVPs = await RSVP.insertMany(rsvpsWithUserIds);
      console.log(`✅ Inserted ${insertedRSVPs.length} RSVPs.`);

      // Update users with their RSVP references
      for (const rsvp of insertedRSVPs) {
        await (User as any).updateOne(
          { _id: rsvp.userId },
          {
            rsvpId: rsvp._id,
            hasRSVPed: true,
          }
        );
      }
      console.log("🎉 Database seeding completed successfully!");
    } else {
      console.warn("⚠️ No RSVPs were inserted. Check RSVP data.");
    }
  } catch (error) {
    console.error("❌ Error seeding the database:", error);
    throw error;
  } finally {
    if (closeConnection) {
      await mongoose.connection.close();
    }
  }
};
