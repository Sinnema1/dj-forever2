const mongoose = require("mongoose");
require("dotenv").config();

const dbName = process.env.MONGODB_DB_NAME || "djforever2";
let MONGODB_URI = process.env.MONGODB_URI || "mongodb://localhost:27017";
if (!MONGODB_URI.match(/\/[^\/]+$/)) {
  MONGODB_URI = MONGODB_URI.replace(/\/$/, "") + `/${dbName}`;
}
console.log(
  `[printUsers] Connecting to MongoDB URI: ${MONGODB_URI}, DB Name: ${dbName}`
);

// Define User schema inline for script compatibility
const userSchema = new mongoose.Schema({
  fullName: String,
  email: String,
  isAdmin: Boolean,
  isInvited: Boolean,
  qrToken: String,
});
const User = mongoose.models.User || mongoose.model("User", userSchema);

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
