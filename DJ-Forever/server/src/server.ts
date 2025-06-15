import cors from "cors";
import express from "express";
import { ApolloServer } from "@apollo/server";
import { expressMiddleware } from "@apollo/server/express4";

import db from "./config/connection.js";
import { typeDefs, resolvers } from "./graphql/index.js";
import { createContext } from "./graphql/context.js";
import { errorHandler } from "./middleware/errorHandler.js";
import { CONFIG } from "./constants/config.js";

const startApolloServer = async () => {
  try {
    // 0) Validate critical env vars
    if (!CONFIG.FRONTEND_URL) {
      throw new Error(
        "CONFIG.FRONTEND_URL is not defined. Check your environment variables."
      );
    }
    // 1) connect to database
    await db();

    // 2) start Apollo
    const server = new ApolloServer({ typeDefs, resolvers });
    await server.start();

    // 3) create Express app
    const app = express();
    const PORT = process.env.PORT ?? 3001;

    // 4) middleware
    app.use(cors({ origin: CONFIG.FRONTEND_URL }));
    app.use(express.json());
    app.use(express.urlencoded({ extended: false }));

    // 5.5) log all GraphQL requests
    app.use("/graphql", (req, _res, next) => {
      console.log(
        `[GRAPHQL] ${req.method} ${req.originalUrl} | headers:`,
        req.headers
      );
      next();
    });

    // 5) GraphQL endpoint
    app.use(
      "/graphql",
      expressMiddleware(server, {
        // pass in our context factory
        context: createContext,
      })
    );

    // 6) serve client in prod
    // REMOVED: static file serving for client build, since frontend is deployed separately

    // 7) health check
    app.get("/health", (req, res) => {
      console.log(
        `[HEALTH] ${req.method} ${req.originalUrl} | headers:`,
        req.headers
      );
      res.sendStatus(200);
    });

    // 7.5) root route for Render/health checks
    app.get("/", (req, res) => {
      console.log(
        `[ROOT] ${req.method} ${req.originalUrl} | headers:`,
        req.headers
      );
      res.status(200).send("DJ Forever API is running.");
    });

    // 8) global error handler
    app.use(errorHandler);

    // 8.5) catch-all logger for unexpected requests
    app.use((req, _res, next) => {
      console.log(
        `[BACKEND] 404 Not Found: ${req.method} ${req.originalUrl} | headers:`,
        req.headers
      );
      next();
    });

    // 9) start listening
    const httpServer = app.listen(PORT, () => {
      console.log(`✅ Server ready at http://localhost:${PORT}/graphql`);
    });

    // 10) graceful shutdown
    const shutdown = async () => {
      console.log("🛑 Shutting down...");
      await server.stop();
      httpServer.close(() => process.exit(0));
    };
    process.on("SIGINT", shutdown);
    process.on("SIGTERM", shutdown);
  } catch (err: unknown) {
    console.error("❌ Failed to start server:", err);
    process.exit(1);
  }
};

// Handle unhandled promise rejections
process.on("unhandledRejection", (reason) => {
  console.error("❌ Unhandled Rejection:", reason);
  process.exit(1);
});

startApolloServer();
