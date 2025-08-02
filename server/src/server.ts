import express from "express";
import path from "path";
import { fileURLToPath } from "url";
import { ApolloServer } from "apollo-server-express";
import { typeDefs } from "./graphql/typeDefs.js";
import { resolvers } from "./graphql/resolvers.js";
import cors from "cors";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function startServer() {
  const app = express();
  const PORT = process.env.PORT || 3005; // Using port 3005 to avoid conflicts

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

  // Apollo Server setup
  const server = new ApolloServer({
    typeDefs,
    resolvers,
    context: ({ req }) => ({ req }),
    persistedQueries: false,
  });

  await server.start();
  server.applyMiddleware({ app: app as any });

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

  app.listen(PORT, () => {
    console.log(`🚀 Server running on http://localhost:${PORT}`);
    console.log(
      `🚀 GraphQL endpoint at http://localhost:${PORT}${server.graphqlPath}`
    );
  });
}

startServer();
