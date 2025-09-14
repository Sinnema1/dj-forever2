// Quick script to check QR tokens in development database
import mongoose from "mongoose";
import User from "./dist/models/User.js";

const dbName = process.env.MONGODB_DB_NAME || "djforever2_dev";
let MONGODB_URI = process.env.MONGODB_URI || "mongodb://localhost:27017";
if (!MONGODB_URI.match(/\/[^\/]+$/)) {
  MONGODB_URI = MONGODB_URI.replace(/\/$/, "") + `/${dbName}`;
}

console.log(`Connecting to: ${MONGODB_URI}`);

async function main() {
  await mongoose.connect(MONGODB_URI);
  console.log(`Connected to MongoDB: ${mongoose.connection.name}`);

  const users = await User.find({}, "fullName email qrToken");

  console.log(
    `Found ${users.length} users in ${mongoose.connection.name} database:`
  );
  for (const user of users) {
    console.log(`- ${user.fullName} (${user.email}): ${user.qrToken}`);
  }

  await mongoose.disconnect();
}

main().catch(console.error);
