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
  process.env.CONFIG__FRONTEND_URL ||
  (isProduction ? "https://www.djforever2026.com" : "http://localhost:3002");

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

// Top-level React Router routes that are matched before /:alias.
// Aliases that collide with these would land on the page route, not the QR login flow.
// Must be kept in sync with the <Routes> in client/src/App.tsx.
const RESERVED_PATHS = new Set([
  "rsvp",
  "registry",
  "login",
  "admin",
  "qr-help",
  "auth-debug",
]);

// Print-quality settings:
// - 1200px width: yields ~4" at 300 DPI — excellent for Save the Date cards
// - ECC Level H (30% error correction): maximum resilience for print + real-world scanning
// - Margin 4: adequate quiet zone (~4 modules of whitespace)
const QR_WIDTH = 1200;
const QR_ERROR_CORRECTION = "H" as const;
const QR_MARGIN = 4;

async function main() {
  // Project pattern: Always use { dbName } option, never append to URI
  // This ensures consistent database targeting across dev/test/production
  await mongoose.connect(MONGODB_URI, { dbName });
  const users = await (User.find as any)(
    {},
    "_id fullName email qrToken qrAlias",
  );
  console.log(`Found ${users.length} users in database`);
  if (!fs.existsSync(OUTPUT_DIR)) fs.mkdirSync(OUTPUT_DIR, { recursive: true });

  for (const user of users) {
    if (!user.qrToken) {
      console.warn(
        `⚠️ User missing qrToken: ${user.fullName} (${user.email}) [ID: ${user._id}]`,
      );
      continue;
    }

    // Build the QR login URL:
    // - Alias + no collision → short URL (www.djforever2026.com/nateandbritt)
    // - Alias + reserved path collision → safe /login/qr/:alias fallback
    // - No alias → /login/qr/:token
    let loginUrl: string;
    if (user.qrAlias) {
      if (RESERVED_PATHS.has(user.qrAlias)) {
        console.warn(
          `⚠️ Alias "${user.qrAlias}" for ${user.fullName} collides with a reserved route — ` +
          `falling back to /login/qr/${user.qrAlias}. Rename the alias to use the short URL.`,
        );
        loginUrl = `${FRONTEND_URL}/login/qr/${user.qrAlias}`;
      } else {
        loginUrl = `${FRONTEND_URL}/${user.qrAlias}`;
      }
    } else {
      console.warn(
        `⚠️ No alias for ${user.fullName} — using qrToken in QR URL. Consider setting an alias before printing.`,
      );
      loginUrl = `${FRONTEND_URL}/login/qr/${user.qrToken}`;
    }

    const fileName = `${user.fullName.replace(
      /[^a-z0-9]/gi,
      "_",
    )}_${user.email.replace(/[^a-z0-9]/gi, "_")}_${user._id}.png`;
    const filePath = path.join(OUTPUT_DIR, fileName);
    try {
      await QRCode.toFile(filePath, loginUrl, {
        color: { dark: "#000", light: "#FFF" },
        width: QR_WIDTH,
        errorCorrectionLevel: QR_ERROR_CORRECTION,
        margin: QR_MARGIN,
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
