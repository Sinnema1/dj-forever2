const mongoose = require("mongoose");
const User = require("./dist/models/User.js").default;
const RSVP = require("./dist/models/RSVP.js").default;

async function checkData() {
  try {
    await mongoose.connect("mongodb://localhost:27017", {
      dbName: "djforever2_dev",
    });

    const users = await User.find({ isInvited: true }).populate("rsvp");
    console.log("=== DATABASE STATS ===");
    console.log("Total invited:", users.length);
    console.log("Has RSVP:", users.filter((u) => u.hasRSVPed).length);
    console.log("Pending:", users.filter((u) => !u.hasRSVPed).length);
    console.log("");

    console.log("=== ATTENDANCE BREAKDOWN ===");
    const rsvped = users.filter((u) => u.hasRSVPed && u.rsvp);
    console.log(
      "YES:",
      rsvped.filter((u) => u.rsvp.attending === "YES").length
    );
    console.log("NO:", rsvped.filter((u) => u.rsvp.attending === "NO").length);
    console.log(
      "MAYBE:",
      rsvped.filter((u) => u.rsvp.attending === "MAYBE").length
    );
    console.log("");

    console.log("=== ALL USERS ===");
    users.forEach((u, i) => {
      const name = u.fullName.padEnd(20);
      const rsvpStatus = u.hasRSVPed ? "Y" : "N";
      const attending = u.rsvp?.attending || "-";
      const admin = u.isAdmin ? "Y" : "N";
      console.log(
        `${
          i + 1
        }. ${name} | RSVP: ${rsvpStatus} | Attending: ${attending} | Admin: ${admin}`
      );
    });

    await mongoose.disconnect();
  } catch (error) {
    console.error("Error:", error.message);
    process.exit(1);
  }
}

checkData();
