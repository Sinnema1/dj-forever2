/**
 * @fileoverview GraphQL Module Exports for DJ Forever 2 Wedding Website
 * @module graphql/index
 * @version 1.0.0
 *
 * Central export module for all GraphQL schema components.
 * Provides clean imports for Apollo Server configuration by re-exporting
 * schema definitions and resolvers from their respective modules.
 *
 * Exported Components:
 * - typeDefs: Complete GraphQL schema in SDL format
 * - resolvers: All query and mutation resolvers with authentication
 *
 * Usage Pattern:
 * This module enables clean imports in server.ts:
 * import { typeDefs, resolvers } from './graphql/index.js';
 *
 * Alternative to importing each component separately:
 * import { typeDefs } from './graphql/typeDefs.js';
 * import { resolvers } from './graphql/resolvers.js';
 *
 * @example
 * // Usage in Apollo Server setup:
 * // import { typeDefs, resolvers } from './graphql/index.js';
 * // const server = new ApolloServer({ typeDefs, resolvers });
 *
 * @see ./typeDefs.ts - GraphQL schema type definitions
 * @see ./resolvers.ts - GraphQL query and mutation resolvers
 * @see ../server.ts - Apollo Server configuration using these exports
 */

/**
 * Re-export GraphQL schema type definitions from typeDefs module.
 * Contains complete SDL schema for wedding website API.
 */
export { typeDefs } from "./typeDefs";

/**
 * Re-export GraphQL resolvers from resolvers module.
 * Contains all query and mutation implementations with authentication.
 */
export { resolvers } from "./resolvers";
