import express, { Application } from 'express';
import { ApolloServer } from '@apollo/server';
import { expressMiddleware } from '@apollo/server/express4';
import cors from 'cors';
import { json } from 'body-parser';

// no “.js” here—ts-node / Vitest will resolve the `.ts` sources
import { typeDefs, resolvers } from '../../src/graphql/index.js';
import { createContext } from '../../src/graphql/context.js';

export async function createTestServer(): Promise<{
  app: Application;
  stop: () => Promise<void>;
}> {
  // 1) construct your ApolloServer
  const server = new ApolloServer({ typeDefs, resolvers });
  await server.start();

  // 2) wire up Express
  const app = express();
  app.use(cors());
  app.use(json());

  app.use(
    '/graphql',
    expressMiddleware(server, {
      // here we invoke your context factory so every resolver sees { user? }
      context: async ({ req }) => createContext({ req }),
    })
  );

  // 3) return both the app and a shutdown fn (so tests can stop the server cleanly)
  return {
    app,
    stop: async () => {
      await server.stop();
    },
  };
}