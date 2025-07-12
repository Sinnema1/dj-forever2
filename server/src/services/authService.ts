import User, { IUser } from "../models/User.js";
import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";

const JWT_SECRET = process.env.JWT_SECRET || "dev-secret";

export async function registerUser({
  fullName,
  email,
  password,
}: {
  fullName: string;
  email: string;
  password: string;
}) {
  console.log("authService.registerUser called");
  // Check if user exists
  const existing = await User.findOne({ email });
  if (existing) {
    console.log("User already exists");
    throw new Error("User already exists");
  }
  // Hash password
  const hashed = await bcrypt.hash(password, 10);
  let userDoc;
  try {
    userDoc = await User.create({
      fullName,
      email,
      password: hashed,
      isAdmin: false,
      isInvited: true,
    });
    console.log("User created:", userDoc);
  } catch (err) {
    console.error("Error creating user:", err);
    throw err;
  }
  const user = userDoc.toObject();
  // Create token
  const token = jwt.sign({ id: user._id, email: user.email }, JWT_SECRET, {
    expiresIn: "7d",
  });
  console.log("Returning from authService.registerUser:", { token, user });
  return { token, user };
}

export async function loginUser({
  email,
  password,
}: {
  email: string;
  password: string;
}) {
  const user = await User.findOne({ email });
  if (!user) throw new Error("Invalid credentials");
  const valid = await bcrypt.compare(password, user.password);
  if (!valid) throw new Error("Invalid credentials");
  const token = jwt.sign({ id: user._id, email: user.email }, JWT_SECRET, {
    expiresIn: "7d",
  });
  return { token, user };
}
