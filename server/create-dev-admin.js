import mongoose from "mongoose";
import User from "./dist/models/User.js";

async function createDevAdmin() {
  try {
    // Use local MongoDB for development
    const uri = "mongodb://localhost:27017";
    const dbName = "djforever2_dev";

    console.log(`Connecting to local database: ${dbName}`);
    await mongoose.connect(uri, { dbName });
    console.log("Connected to database");

    // Check if admin user already exists
    const existingAdmin = await User.findOne({ email: "admin@djforever2.com" });

    if (existingAdmin) {
      console.log(
        "Admin user already exists in development:",
        existingAdmin.fullName
      );
      console.log("Current admin token:", existingAdmin.qrToken);
    } else {
      // Create new admin user
      const validToken =
        Math.random().toString(36).substring(2) +
        Math.random().toString(36).substring(2);

      const adminUser = new User({
        fullName: "Admin User",
        email: "admin@djforever2.com",
        isInvited: true,
        isAdmin: true,
        hasRSVPed: false,
        qrToken: validToken,
      });

      await adminUser.save();
      console.log("Created development admin user:", adminUser.fullName);
      console.log("Admin QR token:", adminUser.qrToken);
    }

    await mongoose.disconnect();
    console.log("Done");
  } catch (error) {
    console.error("Error:", error.message);
    process.exit(1);
  }
}

createDevAdmin();
