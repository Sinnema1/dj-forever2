import type { Request, Response, NextFunction } from "express";
import express from "express";
import path from "node:path";
import { fileURLToPath } from "node:url";

const router = express.Router();

// Resolve __dirname in ES module environment
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Define the path to the frontend build directory (adjust if needed)
const CLIENT_BUILD_PATH = path.join(__dirname, "../../client/dist");

/**
 * Serves the frontend in production.
 */
router.use(express.static(CLIENT_BUILD_PATH));

/**
 * Catch-all route: If no API routes match, serve `index.html`.
 */
router.get("*", (_req: Request, res: Response, next: NextFunction) => {
  try {
    res.sendFile(path.join(CLIENT_BUILD_PATH, "index.html"));
  } catch (error) {
    console.error("❌ Error serving frontend:", error);
    next(error);
  }
});

/**
 * Handles errors when serving frontend.
 */
router.use((err: Error, _req: Request, res: Response, _next: NextFunction) => {
  console.error("❌ Error:", err.message);
  res.status(500).json({ success: false, message: "Internal Server Error" });
});

export default router;