import bcrypt from "bcrypt";
import mongoose from "mongoose";
import User from "../models/User.js";
import RSVP from "../models/RSVP.js";
import fs from "fs";

/**
 * Seeds the database with user and RSVP data for djforever2.
 * Ensures correct user-RSVP relationships.
 */
export const seedDatabase = async () => {
  try {
    console.log("🚀 Starting database seeding for djforever2...");

    // Read and parse user & RSVP data from JSON files
    const userData = JSON.parse(
      fs.readFileSync("./src/seeds/userData.json", "utf-8")
    );
    const rsvpData = JSON.parse(
      fs.readFileSync("./src/seeds/rsvpData.json", "utf-8")
    );

    // Hash passwords before inserting users
    const usersWithHashedPasswords = await Promise.all(
      userData.users.map(async (user: any) => ({
        fullName: user.fullName,
        email: user.email,
        password: await bcrypt.hash(user.password, 10),
        isInvited: user.isInvited,
        hasRSVPed: user.hasRSVPed,
      }))
    );

    // Insert users and retrieve their new IDs
    const insertedUsers = await User.insertMany(usersWithHashedPasswords);
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
        await User.findByIdAndUpdate(rsvp.userId, {
          rsvpId: rsvp._id,
          hasRSVPed: true,
        });
      }
      console.log("🎉 Database seeding completed successfully!");
    } else {
      console.warn("⚠️ No RSVPs were inserted. Check RSVP data.");
    }
  } catch (error) {
    console.error("❌ Error seeding the database:", error);
    throw error;
  } finally {
    mongoose.connection.close();
  }
};
