/**
 * @fileoverview Express + Apollo GraphQL Server for DJ Forever 2 Wedding Website
 * @module server
 * @version 1.0.0
 *
 * Production-ready Node.js server combining Express.js with Apollo GraphQL Server.
 * Handles wedding website backend including QR-based authentication, RSVP management,
 * and MongoDB integration. Configured for Render.com deployment with environment-aware
 * database connection and CORS settings.
 *
 * Key Features:
 * - QR-only authentication system (no passwords)
 * - GraphQL API for RSVP and user management
 * - Environment-specific MongoDB configuration
 * - Production security and CORS handling
 * - Health check endpoint for deployment monitoring
 * - QR token redirect handling for mobile scanning
 *
 * Architecture:
 * - Express.js for HTTP server and middleware
 * - Apollo Server for GraphQL endpoint
 * - Mongoose for MongoDB connection and ODM
 * - JWT-based authentication context
 * - Environment-aware configuration management
 *
 * Deployment:
 * - Development: localhost:3001 with hot reload
 * - Production: Render.com with environment variables
 * - Database: MongoDB Atlas with environment-specific databases
 *
 * @example
 * // Environment Variables Required:
 * // MONGODB_URI=mongodb+srv://...
 * // MONGODB_DB_NAME=djforever2 (or djforever2_dev, djforever2_test)
 * // JWT_SECRET=your-secret-key
 * // CONFIG__FRONTEND_URL=https://dj-forever2.onrender.com
 * // PORT=3001 (optional, defaults to 3001)
 *
 * @example
 * // Development startup:
 * // npm run dev (from root) - starts both server and client
 * // cd server && npm run dev - server only
 *
 * @example
 * // Production deployment:
 * // Render.com build: npm install && npm run build (in server/ directory)
 * // Automatically starts server on assigned PORT
 *
 * @dependencies
 * - express: HTTP server framework
 * - @apollo/server: GraphQL server implementation
 * - mongoose: MongoDB ODM and connection management
 * - cors: Cross-origin resource sharing
 * - dotenv: Environment variable management
 * - jsonwebtoken: JWT authentication (via authService)
 */

import express from "express";
import { ApolloServer } from "@apollo/server";
import { expressMiddleware } from "@apollo/server/express4";
import { typeDefs } from "./graphql/typeDefs.js";
import { resolvers } from "./graphql/resolvers.js";
import { getUserFromRequest } from "./services/authService.js";
import { healthRouter } from "./routes/health.js";
import { withRequestId } from "./middleware/logging.js";
import {
  securityHeaders,
  createRateLimiter,
  requestLogger,
} from "./middleware/security.js";
import cors from "cors";
import mongoose from "mongoose";
import dotenv from "dotenv";
import { readFileSync } from "fs";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import User from "./models/User.js";

dotenv.config();

// ESM module compatibility: Define __dirname for path resolution
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Cache package version at startup for health checks
const packageJsonPath = path.join(__dirname, "../package.json");
const packageJson = JSON.parse(readFileSync(packageJsonPath, "utf-8"));
const SERVER_VERSION = packageJson.version;

/**
 * Main server startup function - initializes MongoDB connection, Apollo GraphQL server,
 * Express middleware, and starts HTTP server on configured port.
 *
 * Handles complete server lifecycle including:
 * - Environment-aware MongoDB connection with proper database naming
 * - Apollo Server configuration with development/production settings
 * - Express middleware setup (JSON, URL encoding, CORS)
 * - GraphQL endpoint with JWT authentication context
 * - Health check and QR redirect endpoints
 * - Production-ready error handling and logging
 *
 * @async
 * @function startServer
 * @throws {Error} MongoDB connection failures cause process exit
 * @returns {Promise<void>} Server startup completion
 *
 * @example
 * // Automatic startup - called at module load
 * // Server will be available at:
 * // - GraphQL: http://localhost:3001/graphql
 * // - Health: http://localhost:3001/health
 * // - QR Redirect: http://localhost:3001/login/qr/:token
 */
async function startServer() {
  // Connect to MongoDB
  const dbName = process.env.MONGODB_DB_NAME || "djforever2";
  const uri = process.env.MONGODB_URI || "mongodb://localhost:27017";
  // Use { dbName } option for consistency with seed scripts
  // Never log the full URI — it may contain credentials
  let redactedMongoTarget = "[unparseable MongoDB URI]";
  try {
    const parsedUri = new URL(uri);
    const hostPort = parsedUri.port
      ? `${parsedUri.hostname}:${parsedUri.port}`
      : parsedUri.hostname;
    redactedMongoTarget = `${parsedUri.protocol}//${hostPort}`;
  } catch {
    // Fall back to placeholder without exposing the raw URI
  }
  console.log(
    `[server] Connecting to MongoDB at ${redactedMongoTarget} (dbName: ${dbName})`,
  );

  try {
    await mongoose.connect(uri, { dbName });
    console.log(`🗄️ Connected to MongoDB: ${dbName}`);
  } catch (error) {
    console.error("❌ MongoDB connection error:", error);
    process.exit(1);
  }

  const app = express();
  const PORT = Number(process.env.PORT) || 3001; // Standard development port for this project

  console.log(
    `[server] Port configuration: ${
      process.env.PORT
        ? `ENV override: ${process.env.PORT}`
        : `Default: ${PORT}`
    }`,
  );

  // Apollo Server setup
  const server = new ApolloServer({
    typeDefs,
    resolvers,
    introspection: process.env.NODE_ENV !== "production",
    plugins:
      process.env.NODE_ENV === "production"
        ? [
            // Disable introspection and GraphQL Playground in production
          ]
        : [],
  });

  await server.start();

  // Middleware
  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));

  // Request ID middleware for distributed tracing
  app.use(withRequestId);

  // Request logging middleware
  app.use(requestLogger);

  // Security headers middleware (helmet)
  app.use(securityHeaders);

  // CORS setup
  app.use(
    cors({
      origin: [
        "http://localhost:3000",
        "http://localhost:3002",
        "http://localhost:3003", // Adding port 3003 in case Vite uses it
        "http://localhost:3004", // Adding port 3004 just in case
        "https://studio.apollographql.com",
        "https://dj-forever2.onrender.com", // Production frontend URL
      ],
      credentials: true,
    }),
  );

  // Rate limiting for GraphQL endpoint
  app.use("/graphql", createRateLimiter(15 * 60 * 1000, 100)); // 100 requests per 15 minutes

  // GraphQL endpoint with authentication context
  app.use(
    "/graphql",
    expressMiddleware(server, {
      context: async ({ req }) => {
        // Extract user from JWT token in Authorization header
        const user = await getUserFromRequest(req);
        return {
          req,
          user,
        };
      },
    }),
  );

  // Root endpoint for health checks (Render infrastructure)
  app.get("/", (_req, res) => {
    res.status(200).json({
      status: "ok",
      service: "dj-forever2-backend",
      version: SERVER_VERSION,
      endpoints: {
        graphql: "/graphql",
        health: "/health",
      },
      timestamp: new Date().toISOString(),
    });
  });

  // Health check endpoints
  app.use("/health", healthRouter);

  // Handle QR login redirect
  app.get("/login/qr/:qrToken", (req, res) => {
    // Redirect to the frontend URL with the QR token
    const frontendUrl =
      process.env.CONFIG__FRONTEND_URL || "https://dj-forever2.onrender.com";
    res.redirect(`${frontendUrl}/login/qr/${req.params.qrToken}`);
  });

  // Serve QR code images for admin download
  app.get("/api/qr-code/:qrToken", async (req, res) => {
    try {
      const { qrToken } = req.params;

      // Find the user by QR token to get their ID and name
      const user = await (User.findOne as any)({ qrToken });

      if (!user) {
        console.error(`[QR Download] User not found for token: ${qrToken}`);
        return res.status(404).json({
          error: "User not found",
          message: `No user found with QR token ${qrToken}`,
        });
      }

      // Determine environment
      const isProduction =
        process.env.NODE_ENV === "production" ||
        process.env.MONGODB_URI?.includes("mongodb+srv");
      const environment = isProduction ? "production" : "development";

      // Construct filename matching generateQRCodes.ts format:
      // {name}_{email}_{_id}.png
      const fileName = `${user.fullName.replace(
        /[^a-z0-9]/gi,
        "_",
      )}_${user.email.replace(/[^a-z0-9]/gi, "_")}_${user._id}.png`;

      // Construct absolute file path
      const serverRoot = path.resolve(__dirname, "..");
      const filePath = path.resolve(
        serverRoot,
        "qr-codes",
        environment,
        fileName,
      );

      console.log(`[QR Download] User: ${user.fullName} (${user.email})`);
      console.log(`[QR Download] Looking for file: ${filePath}`);

      // Check if file exists
      if (!fs.existsSync(filePath)) {
        console.error(`[QR Download] File not found: ${filePath}`);
        return res.status(404).json({
          error: "QR code file not found",
          message: `QR code file for ${user.fullName} does not exist. Use the 'Regenerate QR Codes' button in the admin dashboard to generate it.`,
        });
      }

      // Prepare download filename
      const downloadFilename = `${user.fullName.replace(/\s+/g, "_")}_QR.png`;

      console.log(`[QR Download] Serving file as: ${downloadFilename}`);

      // Serve the file with download headers
      res.setHeader("Content-Type", "image/png");
      res.setHeader(
        "Content-Disposition",
        `attachment; filename="${downloadFilename}"`,
      );

      // Send the file - sendFile requires absolute path
      return res.sendFile(filePath, (err) => {
        if (err) {
          console.error(`[QR Download] Error sending file:`, err);
          if (!res.headersSent) {
            res.status(500).json({
              error: "Failed to send QR code file",
              message: err.message,
            });
          }
        }
      });
    } catch (error) {
      console.error("Error serving QR code:", error);
      if (!res.headersSent) {
        res.status(500).json({
          error: "Failed to retrieve QR code",
          message: error instanceof Error ? error.message : "Unknown error",
        });
      }
      return;
    }
  });

  // Static file serving removed for Render backend-only deployment

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`🚀 Server running on http://0.0.0.0:${PORT}`);
    console.log(`🚀 GraphQL endpoint at http://0.0.0.0:${PORT}/graphql`);
  });

  // Start email retry queue processor
  // Processes pending/retrying email jobs every minute
  const { processEmailQueue } = await import("./services/emailService.js");
  setInterval(async () => {
    try {
      await processEmailQueue();
    } catch (error) {
      console.error("Email queue processing error:", error);
    }
  }, 60 * 1000); // Run every minute

  console.log("📧 Email retry queue processor started");
}

startServer();
