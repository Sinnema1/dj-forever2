import User from "../../src/models/User.js";

export async function setupTestUser(
  qrToken = "r24gpj3wntgqwqfberlas",
  email = "alice@example.com"
) {
  // Delete user if it exists
  await User.deleteOne({ email });

  // Create test user
  const user = await User.create({
    fullName: "Alice Johnson",
    email,
    isAdmin: false,
    isInvited: true,
    qrToken,
    hasRSVPed: false,
  });

  return user;
}
