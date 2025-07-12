import mongoose from "mongoose";
import dotenv from "dotenv";
import { seedDatabase } from "./seed.js";

dotenv.config();

const connectDB = async () => {
  try {
    const uri =
      process.env.MONGODB_URI || "mongodb://127.0.0.1:27017/djforever2";
    await mongoose.connect(uri);
    console.log("Connected to MongoDB djforever2");
  } catch (error) {
    console.error("MongoDB connection error:", error);
    throw error;
  }
};

const run = async () => {
  try {
    console.log("Starting database seed process for djforever2...");
    await connectDB();
    await seedDatabase();
    console.log("Closing database connection...");
    await mongoose.connection.close();
    console.log("Database connection closed.");
  } catch (error) {
    console.error("Error during seeding:", error);
    process.exit(1);
  }
};

run();
