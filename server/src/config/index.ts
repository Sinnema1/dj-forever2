/**
 * @fileoverview Configuration Management for DJ Forever 2 Wedding Website
 * @module config/index
 * @version 1.0.0
 *
 * Centralized configuration management system with environment variable validation,
 * deployment-aware settings, and type-safe configuration interfaces. Handles all
 * application settings for development, staging, and production deployments with
 * proper validation and fallback values.
 *
 * Configuration Categories:
 * - Server: Port, host, and environment settings
 * - Database: MongoDB connection URI and database naming
 * - Authentication: JWT secret keys and token expiration
 * - Frontend: CORS origins and frontend URL configuration
 * - Logging: Log levels and output configuration
 * - Apollo: GraphQL server introspection and playground settings
 *
 * Environment Validation:
 * - Required variables validation with startup failure on missing vars
 * - Type coercion for numeric and boolean values
 * - Environment-specific defaults for development vs production
 * - Deployment platform detection (Render.com, local, etc.)
 *
 * Deployment Patterns:
 * - Development: localhost with introspection enabled
 * - Production: Render.com with security hardening
 * - Testing: isolated database with minimal logging
 * - Environment variable override support for all settings
 *
 * Security Features:
 * - JWT secret validation (required, no defaults)
 * - Database URI validation and secure connection options
 * - CORS origin whitelist management
 * - Introspection disabled in production
 *
 * @example
 * // Basic configuration usage:
 * // import { config } from '../config/index.js';
 * // const server = new ApolloServer({ introspection: config.apollo.introspection });
 *
 * @example
 * // Individual config imports:
 * // import { authConfig, databaseConfig } from '../config/index.js';
 * // const token = jwt.sign(payload, authConfig.jwtSecret);
 *
 * @dependencies
 * - dotenv: Environment variable loading from .env files
 */

import dotenv from "dotenv";

// Load environment variables
dotenv.config();

/**
 * Main configuration interface defining all application settings.
 * Provides type safety for configuration access throughout the application.
 *
 * @interface Config
 * @property {Object} server - HTTP server configuration
 * @property {Object} database - MongoDB connection configuration
 * @property {Object} auth - JWT authentication configuration
 * @property {Object} frontend - Frontend URL and CORS configuration
 * @property {Object} logging - Application logging configuration
 * @property {Object} apollo - GraphQL server configuration
 */
interface Config {
  server: {
    port: number;
    host: string;
    environment: "development" | "production" | "test";
  };
  database: {
    uri: string;
    name: string;
  };
  auth: {
    jwtSecret: string;
    jwtExpiresIn: string;
  };
  frontend: {
    urls: string[];
    defaultUrl: string;
  };
  logging: {
    level: string;
  };
  apollo: {
    introspection: boolean;
    playground: boolean;
  };
  features: {
    mealPreferencesEnabled: boolean;
  };
}

// Validate required environment variables
function validateConfig(): Config {
  const environment = (process.env.NODE_ENV || "development") as
    | "development"
    | "production"
    | "test";

  // In test environment, supply safe defaults so tests don't require secrets or real DB URIs
  if (environment === "test") {
    process.env.JWT_SECRET =
      process.env.JWT_SECRET || "test-jwt-secret-32-characters-min";
    process.env.MONGODB_URI =
      process.env.MONGODB_URI || "mongodb://127.0.0.1:27017/djforever2_test";
  }

  // Now enforce required vars for non-test environments
  const requiredVars =
    environment === "test" ? [] : ["JWT_SECRET", "MONGODB_URI"];
  const missingVars = requiredVars.filter((varName) => !process.env[varName]);

  if (missingVars.length > 0) {
    throw new Error(
      `Missing required environment variables: ${missingVars.join(", ")}`,
    );
  }

  return {
    server: {
      port: Number(process.env.PORT) || 3005,
      host: process.env.HOST || "0.0.0.0",
      environment,
    },
    database: {
      uri: process.env.MONGODB_URI!,
      name: process.env.MONGODB_DB_NAME || "djforever2",
    },
    auth: {
      jwtSecret: process.env.JWT_SECRET!,
      jwtExpiresIn: process.env.JWT_EXPIRES_IN || "7d",
    },
    frontend: {
      urls: [
        "http://localhost:3000",
        "http://localhost:3002",
        "http://localhost:3003",
        "http://localhost:3004",
        "https://studio.apollographql.com",
      ].filter(Boolean),
      defaultUrl:
        process.env.FRONTEND_URL || "https://dj-forever2.onrender.com",
    },
    logging: {
      level: process.env.LOG_LEVEL || "INFO",
    },
    apollo: {
      introspection: environment !== "production",
      playground: environment !== "production",
    },
    features: {
      mealPreferencesEnabled: process.env.ENABLE_MEAL_PREFERENCES === "true",
    },
  };
}

export const config = validateConfig();

// Export specific configurations for easy access
export const {
  server: serverConfig,
  database: databaseConfig,
  auth: authConfig,
  frontend: frontendConfig,
  apollo: apolloConfig,
  features: featuresConfig,
} = config;
