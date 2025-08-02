import mongoose from "mongoose";
import User from "../models/User.js";
import dotenv from "dotenv";

dotenv.config();

const dbName = process.env.MONGODB_DB_NAME || "djforever2";
let MONGODB_URI = process.env.MONGODB_URI || "mongodb://localhost:27017";
if (!MONGODB_URI.match(/\/[^\/]+$/)) {
  MONGODB_URI = MONGODB_URI.replace(/\/$/, "") + `/${dbName}`;
}
console.log(
  `[printUsers] Connecting to MongoDB URI: ${MONGODB_URI}, DB Name: ${dbName}`
);

async function printUsers() {
  await mongoose.connect(MONGODB_URI);
  const users = await User.find({}, "fullName email qrToken");
  console.log("\nUsers in database:");
  users.forEach((user) => {
    console.log(`- ${user.fullName} (${user.email}): ${user.qrToken}`);
  });
  await mongoose.disconnect();
}

printUsers().catch((err) => {
  console.error("Error printing users:", err);
  process.exit(1);
});
