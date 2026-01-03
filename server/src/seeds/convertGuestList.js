#!/usr/bin/env node

/**
 * Convert guest list CSV to userData.json format
 *
 * This script reads the guest-list-template.csv and generates userData.json
 * with proper structure for database seeding.
 *
 * Usage: node convertGuestList.js
 */

import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import crypto from "crypto";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/**
 * Generate a unique QR token (20 characters, URL-safe)
 */
function generateQRToken() {
  return crypto
    .randomBytes(15)
    .toString("base64")
    .replace(/\+/g, "0")
    .replace(/\//g, "1")
    .substring(0, 20)
    .toLowerCase();
}

/**
 * Parse CSV line respecting quoted fields
 */
function parseCSVLine(line) {
  const result = [];
  let current = "";
  let inQuotes = false;

  for (let i = 0; i < line.length; i++) {
    const char = line[i];

    if (char === '"') {
      inQuotes = !inQuotes;
    } else if (char === "," && !inQuotes) {
      result.push(current.trim());
      current = "";
    } else {
      current += char;
    }
  }
  result.push(current.trim());

  return result;
}

/**
 * Convert CSV to userData.json
 * Creates one User record per household with householdMembers array
 */
function convertGuestList() {
  const csvPath = path.join(__dirname, "guest-list-template.csv");
  const outputPath = path.join(__dirname, "userData-generated.json");

  if (!fs.existsSync(csvPath)) {
    console.error("❌ Error: guest-list-template.csv not found");
    console.log("📝 Please create the file first with your guest data");
    process.exit(1);
  }

  const csvContent = fs.readFileSync(csvPath, "utf-8");
  const lines = csvContent.trim().split("\n");
  const headers = parseCSVLine(lines[0]);

  console.log(
    "🔄 Converting guest list to userData.json (household-based)...\n"
  );

  const users = [];
  const usedEmails = new Set();
  const usedTokens = new Set();

  // Process each household (skip header row)
  for (let i = 1; i < lines.length; i++) {
    const values = parseCSVLine(lines[i]);
    const row = {};

    // Validate row has correct number of columns
    if (values.length !== headers.length) {
      console.error(
        `❌ ERROR: Row ${i + 1} (household ${values[0] || "unknown"}) has ${
          values.length
        } columns, expected ${headers.length}`
      );
      console.error(`   This usually means missing or extra commas in the CSV`);
      console.error(`   Row data: ${lines[i].substring(0, 100)}...`);
      process.exit(1);
    }

    // Map CSV columns to object
    headers.forEach((header, index) => {
      row[header] = values[index] || "";
    });

    // Guest 1 is the primary user (household owner)
    const primaryFirstName = row.guest_1_first;
    const primaryLastName = row.guest_1_last;
    const primaryEmail = row.guest_1_email;

    // Skip household if primary guest missing
    if (!primaryFirstName || !primaryEmail) {
      console.warn(
        `⚠️  Skipping household ${row.household_id} - missing primary guest`
      );
      continue;
    }

    // Check for duplicate email
    if (usedEmails.has(primaryEmail)) {
      console.warn(
        `⚠️  Duplicate email ${primaryEmail} for ${primaryFirstName} ${primaryLastName}`
      );
      continue;
    }

    // Generate unique QR token for household
    let qrToken;
    do {
      qrToken = generateQRToken();
    } while (usedTokens.has(qrToken));

    usedEmails.add(primaryEmail);
    usedTokens.add(qrToken);

    // Create primary user object
    const user = {
      fullName: `${primaryFirstName}${
        primaryLastName ? " " + primaryLastName : ""
      }`.trim(),
      email: primaryEmail,
      isInvited: true,
      hasRSVPed: false,
      qrToken: qrToken,
      plusOneAllowed: row.plus_one_allowed === "TRUE",
      householdMembers: [],
    };

    // Add primary guest's individual relationships
    if (row.guest_1_rel_bride) {
      user.relationshipToBride = row.guest_1_rel_bride;
    }
    if (row.guest_1_rel_groom) {
      user.relationshipToGroom = row.guest_1_rel_groom;
    }
    if (row.guest_group) {
      user.guestGroup = row.guest_group;
    }
    if (row.custom_welcome_message) {
      user.customWelcomeMessage = row.custom_welcome_message;
    }

    // Add mailing address (household-level)
    if (row.street_address) {
      user.streetAddress = row.street_address;
    }
    if (row.address_line_2) {
      user.addressLine2 = row.address_line_2;
    }
    if (row.city) {
      user.city = row.city;
    }
    if (row.state) {
      user.state = row.state;
    }
    if (row.zip_code) {
      user.zipCode = row.zip_code;
    }
    if (row.country) {
      user.country = row.country;
    }

    // Process additional household members (guests 2-4)
    // Note: Only guest_1_email is required. Guest 2-4 emails are optional.
    let householdMemberCount = 0;
    for (let guestNum = 2; guestNum <= 4; guestNum++) {
      const firstName = row[`guest_${guestNum}_first`];
      const lastName = row[`guest_${guestNum}_last`];
      const email = row[`guest_${guestNum}_email`];

      // Skip if no first name
      if (!firstName) continue;

      const householdMember = {
        firstName: firstName,
        lastName: lastName || "",
      };

      // Only include email if it's present and not a placeholder
      // Placeholders like xxx@example.com are acceptable for household members
      // since they share the primary guest's QR code authentication
      if (email && email.trim() && !email.includes("@example.com")) {
        householdMember.email = email.trim();
      }

      // Add individual relationships for each household member
      const relBride = row[`guest_${guestNum}_rel_bride`];
      const relGroom = row[`guest_${guestNum}_rel_groom`];

      if (relBride) {
        householdMember.relationshipToBride = relBride;
      }
      if (relGroom) {
        householdMember.relationshipToGroom = relGroom;
      }

      user.householdMembers.push(householdMember);
      householdMemberCount++;
    }

    users.push(user);

    const memberInfo =
      householdMemberCount > 0
        ? ` (+${householdMemberCount} household member${
            householdMemberCount > 1 ? "s" : ""
          })`
        : "";

    console.log(
      `✅ ${user.fullName.padEnd(25)} ${primaryEmail.padEnd(
        30
      )} ${qrToken}${memberInfo}`
    );

    // Show household members if any
    if (householdMemberCount > 0) {
      user.householdMembers.forEach((member) => {
        console.log(`   └─ ${member.firstName} ${member.lastName}`);
      });
    }
  }

  // Create output JSON
  const output = {
    users: users,
  };

  // Write to file
  fs.writeFileSync(outputPath, JSON.stringify(output, null, 2), "utf-8");

  const totalGuests = users.reduce(
    (sum, user) => sum + 1 + user.householdMembers.length,
    0
  );

  console.log(
    `\n🎉 Successfully converted ${users.length} households (${totalGuests} total guests)!`
  );
  console.log(`📄 Output written to: userData-generated.json`);
  console.log(`\n� Important notes:`);
  console.log(`   • Only guest_1_email is required (primary contact)`);
  console.log(
    `   • Guest 2-4 emails are optional (@example.com placeholders are fine)`
  );
  console.log(
    `   • Party size enforced: household members + plus-one (Bailey & Abby only)`
  );
  console.log(
    `   • Address fields (street_address, city, state, zip_code) are optional but recommended for invitations`
  );
  console.log(`\n�📋 Next steps:`);
  console.log(`   1. Review userData-generated.json for accuracy`);
  console.log(`   2. Rename to userData.json (or merge with existing)`);
  console.log(`   3. Run: npm run seed-prod`);
  console.log(`   4. Generate QR codes: npm run generate:qrcodes:prod`);
  console.log(`\n💡 Notes:`);
  console.log(
    `   • One QR code per household - all members share authentication`
  );
  console.log(`   • Only guest_1_email is required (primary contact)`);
  console.log(
    `   • Guest 2-4 emails are optional (@example.com placeholders are fine)`
  );
  console.log(
    `   • Party size enforced: household members + plus-one (Bailey & Abby only)`
  );
}

// Run the conversion
try {
  convertGuestList();
} catch (error) {
  console.error("❌ Error:", error.message);
  process.exit(1);
}
