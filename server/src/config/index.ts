/**
 * Configuration Management
 * Centralized configuration with proper validation and environment handling
 */

import dotenv from "dotenv";

// Load environment variables
dotenv.config();

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
}

// Validate required environment variables
function validateConfig(): Config {
  const requiredVars = ["JWT_SECRET", "MONGODB_URI"];
  const missingVars = requiredVars.filter((varName) => !process.env[varName]);

  if (missingVars.length > 0) {
    throw new Error(
      `Missing required environment variables: ${missingVars.join(", ")}`
    );
  }

  const environment = (process.env.NODE_ENV || "development") as
    | "development"
    | "production"
    | "test";

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
} = config;
