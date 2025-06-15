import mongoose from "mongoose";
import dotenv from "dotenv";
import { seedDatabase } from "./seed.js";
import { createError } from "../middleware/errorHandler.js";

// Load environment variables
dotenv.config();

/**
 * Establishes a connection to MongoDB.
 * @function connectDB
 * @returns {Promise<void>} Resolves when the connection is successful.
 */
const connectDB = async () => {
  try {
    const uri = process.env.MONGODB_URI || "mongodb://127.0.0.1:27017/djforever";
    await mongoose.connect(uri);
    console.log("Connected to MongoDB");
  } catch (error) {
    console.error("MongoDB connection error:", error);
    throw createError("Failed to connect to MongoDB.", 500);
  }
};

/**
 * Runs the database seed process.
 * @function run
 * @returns {Promise<void>} Runs database seeding and handles cleanup.
 */
const run = async () => {
  try {
    console.log("Starting database seed process...");
    
    await connectDB();
    await seedDatabase();

    console.log("Closing database connection...");
    await mongoose.connection.close();
    console.log("Database connection closed.");
  } catch (error) {
    console.error("Error during seeding:", error);
    process.exit(1); // Ensure process exits on failure
  }
};

// Execute seed process
run();