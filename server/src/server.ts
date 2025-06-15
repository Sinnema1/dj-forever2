import express from "express";
import path from "path";
import { fileURLToPath } from "url";
import { ApolloServer } from "apollo-server-express";
import { typeDefs } from "./graphql/typeDefs.js";
import { resolvers } from "./graphql/resolvers.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function startServer() {
  const app = express();
  const PORT = process.env.PORT || 3001;

  // Apollo Server setup
  const server = new ApolloServer({
    typeDefs,
    resolvers,
    context: ({ req }) => ({ req })
  });

  await server.start();
  server.applyMiddleware({ app: app as any });

  // Middleware
  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));
  
  // Serve static files from client build (for production)
  if (process.env.NODE_ENV === 'production') {
    app.use(express.static(path.join(__dirname, "../../client/dist")));
    
    app.get("*", (req, res) => {
      res.sendFile(path.join(__dirname, "../../client/dist/index.html"));
    });
  }

  app.listen(PORT, () => {
    console.log(`🚀 Server running on http://localhost:${PORT}`);
    console.log(`🚀 GraphQL endpoint at http://localhost:${PORT}${server.graphqlPath}`);
  });
}

startServer();
