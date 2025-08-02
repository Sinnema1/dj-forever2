// MongoDB commands to update Alice's QR token in the production database
// Save these commands to a file and run them in a MongoDB shell connected to your production database

// Update Alice's QR token to match the one in the QR code
db.users.updateOne(
  { email: "alice@example.com" },
  { $set: { qrToken: "r24gpj3wntgqwqfberlas" } }
);

// Verify the update
db.users.findOne({ email: "alice@example.com" });
