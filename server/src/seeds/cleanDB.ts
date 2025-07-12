import mongoose from "mongoose";
import dotenv from "dotenv";
import User from "../models/User.js";
import RSVP from "../models/RSVP.js";

dotenv.config();

const uri = process.env.MONGODB_URI || "mongodb://127.0.0.1:27017/djforever2";

/**
 * Cleans the database by removing all users and RSVPs.
 */
export const cleanDatabase = async (): Promise<void> => {
  try {
    await User.deleteMany({});
    await RSVP.deleteMany({});
    console.log("Database cleaned successfully: Users and RSVPs removed.");
  } catch (error) {
    console.error("Error cleaning the database:", error);
    throw error;
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

run();
