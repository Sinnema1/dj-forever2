// Script to generate QR codes for all users in the database
// Usage: node src/seeds/generateQRCodes.js

import mongoose from "mongoose";
import User from "../models/User.js";
import fs from "fs";
import path from "path";
import QRCode from "qrcode";
import dotenv from "dotenv";

dotenv.config();

const MONGODB_URI =
  process.env.MONGODB_URI || "mongodb://localhost:27017/djforever2";
const OUTPUT_DIR = path.resolve("./qr-codes");

async function main() {
  await mongoose.connect(MONGODB_URI);
  const users = await User.find({}, "fullName email qrToken");
  if (!fs.existsSync(OUTPUT_DIR)) fs.mkdirSync(OUTPUT_DIR);

  for (const user of users) {
    if (!user.qrToken) continue;
    const fileName = `${user.fullName.replace(
      /[^a-z0-9]/gi,
      "_"
    )}_${user.email.replace(/[^a-z0-9]/gi, "_")}.png`;
    const filePath = path.join(OUTPUT_DIR, fileName);
    await QRCode.toFile(filePath, user.qrToken, {
      color: { dark: "#000", light: "#FFF" },
      width: 300,
    });
    console.log(
      `QR code generated for ${user.fullName} (${user.email}): ${filePath}`
    );
  }
  await mongoose.disconnect();
  console.log("All QR codes generated in ./qr-codes/");
}

main().catch((err) => {
  console.error("Error generating QR codes:", err);
  process.exit(1);
});
