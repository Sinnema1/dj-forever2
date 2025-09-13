import User, { IUser } from "../models/User.js";
import jwt from "jsonwebtoken";

const JWT_SECRET = process.env.JWT_SECRET || "dev-secret";

export async function registerUser({
  fullName,
  email,
  qrToken,
}: {
  fullName: string;
  email: string;
  qrToken: string;
}) {
  // Check if user exists
  const existing = await User.findOne({ email });
  if (existing) {
    throw new Error("User already exists");
  }
  let userDoc;
  try {
    userDoc = await User.create({
      fullName,
      email,
      isAdmin: false,
      isInvited: true,
      qrToken,
    });
  } catch (err) {
    throw err;
  }
  const user = userDoc.toObject();
  const token = jwt.sign({ id: user._id, email: user.email }, JWT_SECRET, {
    expiresIn: "7d",
  });
  return { token, user };
}

export const loginWithQrToken = async ({ qrToken }: { qrToken: string }) => {
  const user = await User.findOne({ qrToken });
  if (!user) throw new Error("Invalid QR token");
  const token = jwt.sign({ id: user._id, email: user.email }, JWT_SECRET, {
    expiresIn: "7d",
  });
  return { token, user };
};

/**
 * Verify JWT token and return user
 */
export const verifyToken = async (token: string): Promise<IUser | null> => {
  try {
    const decoded = jwt.verify(token, JWT_SECRET) as { id: string; email: string };
    const user = await User.findById(decoded.id);
    return user;
  } catch (error) {
    console.error("Token verification failed:", error);
    return null;
  }
};

/**
 * Extract user from request headers
 */
export const getUserFromRequest = async (req: any): Promise<IUser | null> => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return null;
    }
    
    const token = authHeader.substring(7); // Remove "Bearer " prefix
    return await verifyToken(token);
  } catch (error) {
    console.error("Error extracting user from request:", error);
    return null;
  }
};

// Password-based login removed for QR code branch
