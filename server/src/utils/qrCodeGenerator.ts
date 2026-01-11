/**
 * @fileoverview QR Code Generation Utilities
 * Reusable functions for generating QR code PNG files for guest authentication
 */

import QRCode from "qrcode";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

// ESM module compatibility
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/**
 * Get the QR codes output directory based on environment
 */
export function getQRCodesDirectory(): string {
  const isProduction =
    process.env.NODE_ENV === "production" ||
    process.env.MONGODB_URI?.includes("mongodb+srv");
  const environment = isProduction ? "production" : "development";

  // Navigate from src/utils/ to server root
  const serverRoot = path.resolve(__dirname, "../..");
  const outputDir = path.resolve(serverRoot, "qr-codes", environment);

  // Ensure directory exists
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
  }

  return outputDir;
}

/**
 * Get the frontend URL for QR code generation
 */
export function getFrontendURL(): string {
  const isProduction =
    process.env.NODE_ENV === "production" ||
    process.env.MONGODB_URI?.includes("mongodb+srv");

  return (
    process.env.FRONTEND_URL ||
    (isProduction
      ? "https://dj-forever2.onrender.com"
      : "http://localhost:3002")
  );
}

/**
 * Generate a QR code PNG file for a single user
 * @param userId - User's database ID
 * @param fullName - User's full name
 * @param email - User's email address
 * @param qrToken - User's unique QR authentication token
 * @returns Path to the generated QR code file
 */
export async function generateQRCodeForUser(
  userId: string,
  fullName: string,
  email: string,
  qrToken: string
): Promise<string> {
  const outputDir = getQRCodesDirectory();
  const frontendURL = getFrontendURL();

  // Construct filename matching generateQRCodes.ts format
  const fileName = `${fullName.replace(/[^a-z0-9]/gi, "_")}_${email.replace(
    /[^a-z0-9]/gi,
    "_"
  )}_${userId}.png`;
  const filePath = path.join(outputDir, fileName);

  // Generate QR code URL
  const loginUrl = `${frontendURL}/login/qr/${qrToken}`;

  // Generate QR code PNG
  await QRCode.toFile(filePath, loginUrl, {
    color: { dark: "#000", light: "#FFF" },
    width: 300,
  });

  console.log(
    `✅ QR code generated for ${fullName} (${email}): ${filePath} (URL: ${loginUrl})`
  );

  return filePath;
}

/**
 * Generate QR codes for multiple users
 * @param users - Array of user objects with _id, fullName, email, qrToken
 * @returns Number of successfully generated QR codes
 */
export async function generateQRCodesForUsers(
  users: Array<{
    _id: string;
    fullName: string;
    email: string;
    qrToken: string;
  }>
): Promise<{ success: number; failed: number; errors: string[] }> {
  const outputDir = getQRCodesDirectory();
  const frontendURL = getFrontendURL();
  const errors: string[] = [];
  let success = 0;
  let failed = 0;

  console.log(`[QR Generation] Starting generation for ${users.length} users`);
  console.log(`[QR Generation] Output directory: ${outputDir}`);
  console.log(`[QR Generation] Frontend URL: ${frontendURL}`);

  for (const user of users) {
    if (!user.qrToken) {
      const error = `User ${user.fullName} (${user.email}) missing qrToken`;
      console.warn(`⚠️ ${error}`);
      errors.push(error);
      failed++;
      continue;
    }

    try {
      await generateQRCodeForUser(
        user._id,
        user.fullName,
        user.email,
        user.qrToken
      );
      success++;
    } catch (err) {
      const error = `Failed to generate QR for ${user.fullName}: ${
        err instanceof Error ? err.message : "Unknown error"
      }`;
      console.error(`❌ ${error}`);
      errors.push(error);
      failed++;
    }
  }

  console.log(`[QR Generation] Complete: ${success} success, ${failed} failed`);

  return { success, failed, errors };
}
