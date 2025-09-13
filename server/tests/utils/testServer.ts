import express, { Application } from "express";
import { ApolloServer } from "@apollo/server";
import { expressMiddleware } from "@apollo/server/express4";
import cors from "cors";
import { json } from "body-parser";

import { typeDefs, resolvers } from "../../src/graphql/index.js";
import { getUserFromRequest } from "../../src/services/authService.js";

export async function createTestServer(): Promise<{
  app: Application;
  stop: () => Promise<void>;
}> {
  // Connect to MongoDB using env vars (matches seeds/index.ts logic)
  const mongoose = await import("mongoose");
  const dotenv = await import("dotenv");
  dotenv.config();
  const dbName = process.env.MONGODB_DB_NAME || "djforever2";
  const uri = process.env.MONGODB_URI || "mongodb://127.0.0.1:27017";
  // Do NOT append dbName to URI; always use { dbName } option
  console.log(
    `[testServer] Connecting to MongoDB URI: ${uri}, DB Name: ${dbName}`
  );
  await mongoose.connect(uri, { dbName });
  console.log(`[testServer] Connected to MongoDB ${dbName}`);

  const server = new ApolloServer({ typeDefs, resolvers });
  await server.start();

  const app = express();
  app.use(cors());
  app.use(json());

  app.use(
    "/graphql",
    expressMiddleware(server, {
      context: async ({ req }) => {
        // Use the same authentication logic as the main server
        const user = await getUserFromRequest(req);
        return { 
          req, 
          user 
        };
      },
    })
  );

  return {
    app,
    stop: async () => {
      await server.stop();
      await mongoose.disconnect();
      console.log("[testServer] Disconnected from MongoDB");
    },
  };
}
