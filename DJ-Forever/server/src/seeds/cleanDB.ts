// client/src/seeds/cleanDB.ts
import mongoose from "mongoose";
import { fileURLToPath } from "node:url";
import dotenv from "dotenv";
import User from "../models/User.js";
import RSVP from "../models/RSVP.js";
import { createError } from "../middleware/errorHandler.js";

dotenv.config();

const uri = process.env.MONGODB_URI || "mongodb://127.0.0.1:27017/djforever";

/**
 * Cleans the database by removing all users and RSVPs.
 * @returns {Promise<void>}
 */
export const cleanDatabase = async (): Promise<void> => {
  try {
    await User.deleteMany({});
    await RSVP.deleteMany({});
    console.log("Database cleaned successfully: Users and RSVPs removed.");
  } catch (error) {
    console.error("Error cleaning the database:", error);
    throw createError("Failed to clean the database.", 500);
  }
};

const run = async () => {
  try {
    await mongoose.connect(uri);
    await cleanDatabase();
  } catch (error) {
    console.error("Error during database cleaning:", error);
    process.exit(1);
  } finally {
    await mongoose.connection.close();
    console.log("Database connection closed.");
  }
};

// In ES Modules, we compare the current file URL to process.argv[1] (converted to a path)
if (process.argv[1] === fileURLToPath(import.meta.url)) {
  run();
}