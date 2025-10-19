dotenv.config();
import mongoose, { Model } from "mongoose";
import dotenv from "dotenv";
import UserModel from "../models/User.js";
import RSVPModel from "../models/RSVP.js";
import type { IUser } from "../models/User.js";

dotenv.config();

// Type assertions to fix Mongoose model union type issue
const User = UserModel as Model<IUser>;
const RSVP = RSVPModel as Model<any>;

const dbName = process.env.MONGODB_DB_NAME || "djforever2";
const uri = process.env.MONGODB_URI || "mongodb://127.0.0.1:27017";
// Do NOT append dbName to URI; always use { dbName } option
console.log(`[cleanDB] Connecting to MongoDB URI: ${uri}, DB Name: ${dbName}`);

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

const run = async (): Promise<void> => {
  try {
    await mongoose.connect(uri, { dbName });
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
