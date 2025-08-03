import express from "express";
import path from "path";
import { fileURLToPath } from "url";
import { ApolloServer } from "@apollo/server";
import { expressMiddleware } from "@apollo/server/express4";
import { typeDefs } from "./graphql/typeDefs.js";
import { resolvers } from "./graphql/resolvers.js";
import cors from "cors";
import mongoose from "mongoose";
import dotenv from "dotenv";

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function startServer() {
  // Connect to MongoDB
  const dbName = process.env.MONGODB_DB_NAME || "djforever2";
  let MONGODB_URI = process.env.MONGODB_URI || "mongodb://localhost:27017";
  if (!MONGODB_URI.match(/\/[^\/]+$/)) {
    MONGODB_URI = MONGODB_URI.replace(/\/$/, "") + `/${dbName}`;
  }

  try {
    await mongoose.connect(MONGODB_URI);
    console.log(`🗄️ Connected to MongoDB: ${dbName}`);
  } catch (error) {
    console.error("❌ MongoDB connection error:", error);
    process.exit(1);
  }

  const app = express();
  const PORT = Number(process.env.PORT) || 3005; // Using port 3005 to avoid conflicts

  // Apollo Server setup
  const server = new ApolloServer({
    typeDefs,
    resolvers,
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

  // GraphQL endpoint
  app.use(
    "/graphql",
    expressMiddleware(server, {
      context: async ({ req }) => ({ req }),
    })
  );

  // Middleware
  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));

  // Health check endpoint
  app.get("/health", (req, res) => {
    res.status(200).json({
      status: "ok",
      timestamp: new Date().toISOString(),
      environment: process.env.NODE_ENV || "development",
    });
  });

  // Handle QR login redirect
  app.get("/login/qr/:qrToken", (req, res) => {
    // Redirect to the frontend URL with the QR token
    const frontendUrl =
      process.env.CONFIG__FRONTEND_URL || "https://dj-forever2.onrender.com";
    res.redirect(`${frontendUrl}/login/qr/${req.params.qrToken}`);
  });

  // Static file serving removed for Render backend-only deployment

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`🚀 Server running on http://0.0.0.0:${PORT}`);
    console.log(`🚀 GraphQL endpoint at http://0.0.0.0:${PORT}/graphql`);
  });
}

startServer();
