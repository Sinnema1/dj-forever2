import dotenv from "dotenv";
dotenv.config();

import mongoose from "mongoose";
import { createError } from "../middleware/errorHandler.js";

/**
 * Establishes a connection to the MongoDB database.
 * @returns {Promise<typeof mongoose.connection>} The active database connection.
 * @throws {Error} If the database connection fails.
 */
const db = async (): Promise<typeof mongoose.connection> => {
  try {
    const MONGODB_URI = process.env.MONGODB_URI;

    if (!MONGODB_URI) {
      throw createError("MongoDB URI is missing in environment variables.", 500);
    }

    await mongoose.connect(MONGODB_URI);
    console.log("✅ Database successfully connected.");

    return mongoose.connection;
  } catch (error: any) {
    console.error("❌ Database connection error:", error.message);
    throw createError(`Database connection failed: ${error.message}`, 500);
  }
};

export default db;