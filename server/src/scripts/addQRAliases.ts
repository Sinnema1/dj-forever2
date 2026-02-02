#!/usr/bin/env node
/**
 * Script to add human-readable QR aliases to existing users
 * Usage: node addQRAliases.js
 */

import mongoose, { Model } from "mongoose";
import UserModel from "../models/User.js";
import type { IUser } from "../models/User.js";
import { config } from "../config/index.js";
import { generateUniqueQRAlias } from "../utils/qrAliasGenerator.js";

// Type assertion to fix Mongoose model union type issue
const User = UserModel as Model<IUser>;

async function addQRAliases() {
  try {
    console.log("🔗 Adding QR aliases to users...\n");

    // Connect to database
    await mongoose.connect(config.database.uri, {
      dbName: config.database.name,
    });
    console.log(`✅ Connected to database: ${config.database.name}\n`);

    // Get all users without aliases
    const users = await User.find({ qrAlias: { $exists: false } }).exec();
    console.log(`📋 Found ${users.length} users without QR aliases\n`);

    if (users.length === 0) {
      console.log("✅ All users already have QR aliases!");
      process.exit(0);
    }

    // Get existing aliases to avoid duplicates
    const existingAliases = await User.find({ qrAlias: { $exists: true } })
      .select("qrAlias")
      .exec()
      .then(
        (users: IUser[]) =>
          users.map((u: IUser) => u.qrAlias).filter(Boolean) as string[],
      );

    const aliasTracker = [...existingAliases];
    const updates = [];

    // Generate unique aliases for each user
    for (const user of users) {
      const alias = generateUniqueQRAlias(user.fullName, aliasTracker);
      aliasTracker.push(alias);

      updates.push({
        fullName: user.fullName,
        qrToken: user.qrToken,
        qrAlias: alias,
      });

      // Update user
      user.qrAlias = alias;
      await user.save();
    }

    console.log("✅ QR Aliases Added:\n");
    console.log(
      "┌─────────────────────────────┬──────────────────────┬──────────────────────┐",
    );
    console.log(
      "│ Full Name                   │ QR Token             │ QR Alias             │",
    );
    console.log(
      "├─────────────────────────────┼──────────────────────┼──────────────────────┤",
    );

    updates.forEach(({ fullName, qrToken, qrAlias }) => {
      console.log(
        `│ ${fullName.padEnd(27)} │ ${qrToken.substring(0, 20).padEnd(20)} │ ${qrAlias.padEnd(20)} │`,
      );
    });

    console.log(
      "└─────────────────────────────┴──────────────────────┴──────────────────────┘\n",
    );

    console.log(`✅ Successfully added aliases to ${updates.length} users`);
    console.log("\n📝 Users can now login with either:");
    console.log("   - Original QR token: /login/qr/{qrToken}");
    console.log("   - Human-readable alias: /login/qr/{qrAlias}");
    console.log("\n   Example: /login/qr/smith-family\n");

    await mongoose.connection.close();
    process.exit(0);
  } catch (error) {
    console.error("❌ Error adding QR aliases:", error);
    await mongoose.connection.close();
    process.exit(1);
  }
}

addQRAliases();
