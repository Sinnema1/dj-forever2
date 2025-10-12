import mongoose from "mongoose";
import User from "./dist/models/User.js";

async function createProductionAdmin() {
  try {
    // Use MongoDB Atlas production URI
    const uri = "mongodb+srv://sinnema1:vegetable@cluster0.uu42ab9.mongodb.net/djforever2?retryWrites=true&w=majority";
    
    console.log("Connecting to MongoDB Atlas production database: djforever2");
    await mongoose.connect(uri);
    console.log("Connected to database");

    // Check if admin user already exists
    const existingAdmin = await User.findOne({ email: "admin@djforever2.com" });

    if (existingAdmin) {
      console.log(
        "Admin user already exists in production:",
        existingAdmin.fullName
      );
      console.log("Current admin token:", existingAdmin.qrToken);

      // Update with a valid token format if needed
      if (!existingAdmin.qrToken || existingAdmin.qrToken.includes("-")) {
        const validToken =
          Math.random().toString(36).substring(2) +
          Math.random().toString(36).substring(2);
        existingAdmin.qrToken = validToken;
        await existingAdmin.save();
        console.log("Updated admin token to valid format:", validToken);
      }
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
      console.log("Created production admin user:", adminUser.fullName);
      console.log("Admin QR token:", adminUser.qrToken);
    }

    await mongoose.disconnect();
    console.log("Done");
  } catch (error) {
    console.error("Error:", error.message);
    process.exit(1);
  }
}

createProductionAdmin();
