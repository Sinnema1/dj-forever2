// Script to update a user's QR token in the database
// Usage: node --loader ts-node/esm src/scripts/updateQrToken.ts

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
  `[updateQrToken] Connecting to MongoDB URI: ${MONGODB_URI}, DB Name: ${dbName}`
);

async function main(): Promise<void> {
  await mongoose.connect(MONGODB_URI);

  // Update Alice's QR token to match the one in the QR code
  const email = "alice@example.com";
  const newQrToken = "r24gpj3wntgqwqfberlas";

  try {
    const result = await User.updateOne(
      { email },
      { $set: { qrToken: newQrToken } }
    );

    if (result.matchedCount === 0) {
      console.error(`User with email ${email} not found`);
    } else if (result.modifiedCount === 0) {
      console.log(`User ${email} already has the QR token ${newQrToken}`);
    } else {
      console.log(
        `Successfully updated QR token for ${email} to ${newQrToken}`
      );
    }

    // Verify the update
    const user = await User.findOne({ email });
    if (user) {
      console.log(
        `Verified: ${user.fullName} (${user.email}) now has qrToken: ${user.qrToken}`
      );
    }
  } catch (error) {
    console.error("Error updating QR token:", error);
  } finally {
    await mongoose.disconnect();
    console.log("Database connection closed");
  }
}

main().catch((err) => {
  console.error("Script error:", err);
  process.exit(1);
});
