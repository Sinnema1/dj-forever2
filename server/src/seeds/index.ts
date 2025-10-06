/**
 * @fileoverview Database Seeding Entry Point
 *
 * Command-line database seeding utility for DJ Forever 2 wedding website.
 * Provides environment-aware database initialization with:
 * - Development, test, and production data seeding
 * - Environment-specific database connection management
 * - Error handling and graceful shutdown
 * - Connection lifecycle management
 *
 * Usage:
 * ```bash
 * # Development seeding
 * MONGODB_DB_NAME=djforever2_dev npm run seed
 *
 * # Test data seeding
 * MONGODB_DB_NAME=djforever2_test npm run seed:test
 *
 * # Production seeding
 * MONGODB_DB_NAME=djforever2 npm run seed:prod
 * ```
 *
 * Environment Variables:
 * - MONGODB_URI: Database connection string (default: mongodb://127.0.0.1:27017)
 * - MONGODB_DB_NAME: Target database name (default: djforever2)
 *
 * Data Sources:
 * - userData.json: User accounts and invitation status
 * - rsvpData.json: RSVP responses and guest information
 *
 * @author DJ Forever 2 Team
 * @version 1.0.0
 */

import mongoose from "mongoose";
import dotenv from "dotenv";
import { seedDatabase } from "./seed.js";

dotenv.config();

/**
 * Establish MongoDB connection for database seeding operations
 *
 * Uses environment-aware configuration:
 * - Reads database name from MONGODB_DB_NAME environment variable
 * - Connects using { dbName } option (not URI appending)
 * - Provides connection logging for troubleshooting
 * - Handles connection failures with error propagation
 *
 * @throws {Error} When database connection fails
 *
 * @example
 * ```typescript
 * // Environment setup
 * process.env.MONGODB_URI = 'mongodb://localhost:27017';
 * process.env.MONGODB_DB_NAME = 'djforever2_dev';
 *
 * await connectDB();
 * // Connected to djforever2_dev database
 * ```
 */
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

/**
 * Main seeding workflow execution with error handling
 *
 * Orchestrates complete database seeding process:
 * 1. Environment validation and logging
 * 2. Database connection establishment
 * 3. Data seeding execution with connection cleanup
 * 4. Graceful shutdown with proper exit codes
 *
 * Error Handling:
 * - Catches and logs all seeding errors
 * - Exits with status code 1 on failure
 * - Ensures connection cleanup regardless of success/failure
 *
 * @example
 * ```bash
 * # Successful seeding
 * $ npm run seed
 * Starting database seed process for djforever2...
 * [seed] Connected to MongoDB djforever2
 * ✅ Inserted 50 users.
 * ✅ Inserted 25 RSVPs.
 * 🎉 Database seeding completed successfully!
 * Database connection closed.
 *
 * # Failed seeding
 * $ npm run seed
 * Error during seeding: ValidationError: User validation failed
 * # Process exits with code 1
 * ```
 */
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
