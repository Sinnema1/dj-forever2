const mongoose = require("mongoose");
const User = require("../models/User.js");
require("dotenv").config();

const MONGODB_URI =
  process.env.MONGODB_URI || "mongodb://localhost:27017/djforever2";

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
