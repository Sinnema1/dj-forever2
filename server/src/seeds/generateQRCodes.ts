// Script to generate QR codes for all users in the database
// Usage: node src/seeds/generateQRCodes.js

import mongoose from "mongoose";
import User from "../models/User.js";
import fs from "fs";
import path from "path";
import QRCode from "qrcode";
import dotenv from "dotenv";

dotenv.config();

const dbName = process.env.MONGODB_DB_NAME || "djforever2";
let MONGODB_URI = process.env.MONGODB_URI || "mongodb://localhost:27017";
if (!MONGODB_URI.match(/\/[^\/]+$/)) {
  MONGODB_URI = MONGODB_URI.replace(/\/$/, "") + `/${dbName}`;
}
console.log(
  `[generateQRCodes] Connecting to MongoDB URI: ${MONGODB_URI}, DB Name: ${dbName}`
);
const OUTPUT_DIR = path.resolve("./qr-codes");

async function main() {
  await mongoose.connect(MONGODB_URI);
  const users = await User.find({}, "_id fullName email qrToken");
  if (!fs.existsSync(OUTPUT_DIR)) fs.mkdirSync(OUTPUT_DIR);

  for (const user of users) {
    if (!user.qrToken) {
      console.warn(
        `⚠️ User missing qrToken: ${user.fullName} (${user.email}) [ID: ${user._id}]`
      );
      continue;
    }
    const fileName = `${user.fullName.replace(
      /[^a-z0-9]/gi,
      "_"
    )}_${user.email.replace(/[^a-z0-9]/gi, "_")}_${user._id}.png`;
    const filePath = path.join(OUTPUT_DIR, fileName);
    const loginUrl = `https://dj-forever2.onrender.com/login/qr/${user.qrToken}`;
    try {
      await QRCode.toFile(filePath, loginUrl, {
        color: { dark: "#000", light: "#FFF" },
        width: 300,
      });
      console.log(
        `✅ QR code generated for ${user.fullName} (${user.email}) [ID: ${user._id}]: ${filePath} (URL: ${loginUrl})`
      );
    } catch (err) {
      console.error(
        `❌ Error generating QR code for ${user.fullName} (${user.email}) [ID: ${user._id}]:`,
        err
      );
    }
  }
  await mongoose.disconnect();
  console.log("All QR codes generated in ./qr-codes/");
}

main().catch((err) => {
  console.error("Error generating QR codes:", err);
  process.exit(1);
});
