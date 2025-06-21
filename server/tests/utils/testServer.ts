import express, { Application } from 'express';
import { ApolloServer } from '@apollo/server';
import { expressMiddleware } from '@apollo/server/express4';
import cors from 'cors';
import { json } from 'body-parser';

import { typeDefs, resolvers } from '../../src/graphql/index.js';
import { createContext } from '../../src/graphql/context.js';

export async function createTestServer(): Promise<{
  app: Application;
  stop: () => Promise<void>;
}> {
  const server = new ApolloServer({ typeDefs, resolvers });
  await server.start();

  const app = express();
  app.use(cors());
  app.use(json());

  app.use(
    '/graphql',
    expressMiddleware(server, {
      context: async ({ req }) => createContext({ req }),
    })
  );

  return {
    app,
    stop: async () => {
      await server.stop();
    },
  };
}
