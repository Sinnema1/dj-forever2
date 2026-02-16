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
const MONGODB_URI = process.env.MONGODB_URI || "mongodb://localhost:27017";

// Determine environment and frontend URL
const isProduction =
  process.env.NODE_ENV === "production" || MONGODB_URI.includes("mongodb+srv");
const FRONTEND_URL =
  process.env.FRONTEND_URL ||
  (isProduction ? "https://dj-forever2.onrender.com" : "http://localhost:3002");

const environment = isProduction ? "production" : "development";
console.log(`[generateQRCodes] Environment: ${environment}`);
console.log(`[generateQRCodes] Frontend URL: ${FRONTEND_URL}`);

// Extract database name from URI if present (for validation/warning)
const uriMatch = MONGODB_URI.match(/\/([^/?]+)(\?|$)/);
const uriDbName = uriMatch ? uriMatch[1] : null;

// Warn if URI contains a different database name than MONGODB_DB_NAME
if (uriDbName && uriDbName !== dbName) {
  console.warn(
    `⚠️ WARNING: URI contains database name "${uriDbName}" but MONGODB_DB_NAME is "${dbName}"`,
  );
  console.warn(
    `⚠️ The { dbName } option will override the URI. Connecting to: ${dbName}`,
  );
  console.warn(
    `⚠️ To avoid confusion, use URI without database name: ${MONGODB_URI.replace(
      `/${uriDbName}`,
      "",
    )}`,
  );
}

console.log(`[generateQRCodes] Connecting to MongoDB (dbName: ${dbName})`);

const OUTPUT_DIR = path.resolve(`./qr-codes/${environment}`);

async function main() {
  // Project pattern: Always use { dbName } option, never append to URI
  // This ensures consistent database targeting across dev/test/production
  await mongoose.connect(MONGODB_URI, { dbName });
  const users = await (User.find as any)({}, "_id fullName email qrToken");
  console.log(`Found ${users.length} users in database`);
  if (!fs.existsSync(OUTPUT_DIR)) fs.mkdirSync(OUTPUT_DIR);

  for (const user of users) {
    if (!user.qrToken) {
      console.warn(
        `⚠️ User missing qrToken: ${user.fullName} (${user.email}) [ID: ${user._id}]`,
      );
      continue;
    }
    const fileName = `${user.fullName.replace(
      /[^a-z0-9]/gi,
      "_",
    )}_${user.email.replace(/[^a-z0-9]/gi, "_")}_${user._id}.png`;
    const filePath = path.join(OUTPUT_DIR, fileName);
    const loginUrl = `${FRONTEND_URL}/login/qr/${user.qrToken}`;
    try {
      await QRCode.toFile(filePath, loginUrl, {
        color: { dark: "#000", light: "#FFF" },
        width: 300,
      });
      console.log(
        `✅ QR code generated for ${user.fullName} (${user.email}) [ID: ${user._id}]: ${filePath} (URL: ${loginUrl})`,
      );
    } catch (err) {
      console.error(
        `❌ Error generating QR code for ${user.fullName} (${user.email}) [ID: ${user._id}]:`,
        err,
      );
    }
  }
  await mongoose.disconnect();
  console.log(`All QR codes generated in ./qr-codes/${environment}/`);
}

main().catch((err) => {
  console.error("Error generating QR codes:", err);
  process.exit(1);
});
