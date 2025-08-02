import mongoose from "mongoose";
import dotenv from "dotenv";
import { seedDatabase } from "./seed.js";

dotenv.config();

const connectDB = async () => {
  try {
    const dbName = process.env.MONGODB_DB_NAME || "djforever2";
    const uri = process.env.MONGODB_URI || "mongodb://127.0.0.1:27017";
    // Do NOT append dbName to URI; always use { dbName } option
    console.log(`[seed] Connecting to MongoDB URI: ${uri}, DB Name: ${dbName}`);
    await mongoose.connect(uri, { dbName });
    console.log(`[seed] Connected to MongoDB ${dbName}`);
  } catch (error) {
    console.error("MongoDB connection error:", error);
    throw error;
  }
};

const run = async () => {
  try {
    const dbName = process.env.MONGODB_DB_NAME || "djforever2";
    console.log(`Starting database seed process for ${dbName}...`);
    await connectDB();
    await seedDatabase(true); // Close connection after seeding
    console.log("Closing database connection...");
    console.log("Database connection closed.");
  } catch (error) {
    console.error("Error during seeding:", error);
    process.exit(1);
  }
};

run();
