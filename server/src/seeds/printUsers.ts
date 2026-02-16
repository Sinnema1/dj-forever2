import mongoose, { Model } from "mongoose";
import UserModel from "../models/User.js";
import dotenv from "dotenv";
import type { IUser } from "../models/User.js";

dotenv.config();

// Type assertion to fix Mongoose model union type issue
const User = UserModel as Model<IUser>;

const dbName = process.env.MONGODB_DB_NAME || "djforever2";
const MONGODB_URI = process.env.MONGODB_URI || "mongodb://localhost:27017";
console.log(
  `[printUsers] Connecting to MongoDB URI: ${MONGODB_URI}, DB Name: ${dbName}`,
);

async function printUsers(): Promise<void> {
  // Project pattern: Always use { dbName } option, never append to URI
  await mongoose.connect(MONGODB_URI, { dbName });
  const users = await User.find({}, "fullName email qrToken");
  console.log("\nUsers in database:");
  users.forEach((user: any) => {
    console.log(`- ${user.fullName} (${user.email}): ${user.qrToken}`);
  });
  await mongoose.disconnect();
}

printUsers().catch((err) => {
  console.error("Error printing users:", err);
  process.exit(1);
});
