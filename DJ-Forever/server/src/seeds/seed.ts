import bcrypt from "bcrypt";
import mongoose from "mongoose";
import User from "../models/User.js";
import RSVP from "../models/RSVP.js";
import fs from "fs";
import { createError } from "../middleware/errorHandler.js";

/**
 * Seeds the database with user and RSVP data.
 * Ensures correct user-RSVP relationships.
 */
export const seedDatabase = async () => {
  try {
    console.log("🚀 Starting database seeding...");

    // Read and parse user & RSVP data from JSON files
    const userData = JSON.parse(
      fs.readFileSync("./src/seeds/userData.json", "utf-8")
    );
    const rsvpData = JSON.parse(
      fs.readFileSync("./src/seeds/rsvpData.json", "utf-8")
    );

    // ✅ Hash passwords before inserting users and explicitly map all required fields
    const usersWithHashedPasswords = await Promise.all(
      userData.users.map(async (user: any) => ({
        fullName: user.fullName,
        email: user.email,
        password: await bcrypt.hash(user.password, 10),
        isInvited: user.isInvited, // explicitly include isInvited
        hasRSVPed: user.hasRSVPed, // explicitly include hasRSVPed
      }))
    );

    console.log("Processed Users:", usersWithHashedPasswords);

    // ✅ Insert users and retrieve their new IDs (MongoDB generates valid ObjectIds)
    const insertedUsers = await User.insertMany(usersWithHashedPasswords);
    console.log(`✅ Inserted ${insertedUsers.length} users.`);

    // ✅ Create a user lookup (email → ObjectId)
    const userMap = new Map(
      insertedUsers.map((user) => [user.email, user._id])
    );

    // ✅ Validate & map RSVPs with correct userIds
    const rsvpsWithUserIds = rsvpData.rsvps
      .map((rsvp: any) => {
        const userId = userMap.get(rsvp.userEmail); // Map email → ObjectId
        if (!userId) {
          console.warn(`⚠️ No matching user found for RSVP: ${rsvp.userEmail}`);
          return null;
        }
        return { ...rsvp, userId };
      })
      .filter(Boolean); // Remove invalid RSVP entries

    // ✅ Insert RSVPs into the database
    if (rsvpsWithUserIds.length > 0) {
      const insertedRSVPs = await RSVP.insertMany(rsvpsWithUserIds);
      console.log(`✅ Inserted ${insertedRSVPs.length} RSVPs.`);

      // ✅ Update users with their RSVP references
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
    throw createError("Failed to seed the database.", 500);
  } finally {
    mongoose.connection.close();
  }
};
