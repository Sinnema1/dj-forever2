import mongoose, { Model } from "mongoose";
import UserModel from "../models/User.js";
import dotenv from "dotenv";
import type { IUser } from "../models/User.js";

dotenv.config();

// Type assertion to fix Mongoose model union type issue
const User = UserModel as Model<IUser>;

const dbName = process.env.MONGODB_DB_NAME || "djforever2";
let MONGODB_URI = process.env.MONGODB_URI || "mongodb://localhost:27017";
if (!MONGODB_URI.match(/\/[^\/]+$/)) {
  MONGODB_URI = MONGODB_URI.replace(/\/$/, "") + `/${dbName}`;
}
console.log(
  `[printUsers] Connecting to MongoDB URI: ${MONGODB_URI}, DB Name: ${dbName}`
);

async function printUsers(): Promise<void> {
  await mongoose.connect(MONGODB_URI);
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
