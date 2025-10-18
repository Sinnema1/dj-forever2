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
 * // npm run render-build - Render.com build command
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
import cors from "cors";
import mongoose from "mongoose";
import dotenv from "dotenv";

dotenv.config();

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
  console.log(`[server] Connecting to MongoDB URI: ${uri}, DB Name: ${dbName}`);

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
    }`
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
    })
  );

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
    })
  );

  // Health check endpoints
  app.use("/health", healthRouter);

  // Handle QR login redirect
  app.get("/login/qr/:qrToken", (req, res) => {
    // Redirect to the frontend URL with the QR token
    const frontendUrl =
      process.env.CONFIG__FRONTEND_URL || "https://dj-forever2.onrender.com";
    res.redirect(`${frontendUrl}/login/qr/${req.params.qrToken}`);
  });

  // Static file serving removed for Render backend-only deployment

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`🚀 Server running on http://0.0.0.0:${PORT}`);
    console.log(`🚀 GraphQL endpoint at http://0.0.0.0:${PORT}/graphql`);
  });
}

startServer();
