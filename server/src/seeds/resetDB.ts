import mongoose from "mongoose";
import dotenv from "dotenv";
import { cleanDatabase } from "./cleanDB.js";
import { seedDatabase } from "./seed.js";

dotenv.config();

const uri = process.env.MONGODB_URI || "mongodb://127.0.0.1:27017/djforever2";

const run = async () => {
  try {
    await mongoose.connect(uri);
    console.log("Connected to MongoDB djforever2");
    await cleanDatabase();
    await seedDatabase();
    console.log("Database cleaned and seeded successfully.");
  } catch (error) {
    console.error("Error during reset:", error);
    process.exit(1);
  } finally {
    await mongoose.connection.close();
    console.log("Database connection closed.");
  }
};

run();
