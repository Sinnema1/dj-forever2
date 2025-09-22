import mongoose from "mongoose";
import { config } from "../config/index";
import { logger } from "./logger";

/**
 * Database connection utility for scripts and services
 */
export class DatabaseManager {
  private static instance: DatabaseManager;
  private isConnected: boolean = false;

  private constructor() {}

  static getInstance(): DatabaseManager {
    if (!DatabaseManager.instance) {
      DatabaseManager.instance = new DatabaseManager();
    }
    return DatabaseManager.instance;
  }

  /**
   * Connect to MongoDB with proper error handling
   */
  async connect(
    options: { dbName?: string; quiet?: boolean } = {}
  ): Promise<void> {
    try {
      if (this.isConnected) {
        if (!options.quiet) {
          logger.info("Database already connected");
        }
        return;
      }

      const dbName = options.dbName || config.database.name;
      const uri = config.database.uri;

      if (!options.quiet) {
        logger.info(`Connecting to MongoDB: ${uri}, Database: ${dbName}`);
      }

      await mongoose.connect(uri, {
        dbName,
        maxPoolSize: 10,
        serverSelectionTimeoutMS: 5000,
        socketTimeoutMS: 45000,
        family: 4, // Use IPv4, skip trying IPv6
      });

      this.isConnected = true;

      if (!options.quiet) {
        logger.info(
          `✅ Connected to database: ${mongoose.connection.db?.databaseName}`
        );
      }

      // Handle connection events
      mongoose.connection.on("error", (error) => {
        logger.error("Database connection error:", error);
      });

      mongoose.connection.on("disconnected", () => {
        this.isConnected = false;
        logger.warn("Database disconnected");
      });
    } catch (error) {
      this.isConnected = false;
      logger.error("Failed to connect to database:", error);
      throw error;
    }
  }

  /**
   * Disconnect from MongoDB
   */
  async disconnect(options: { quiet?: boolean } = {}): Promise<void> {
    try {
      if (!this.isConnected) {
        if (!options.quiet) {
          logger.info("Database not connected");
        }
        return;
      }

      await mongoose.disconnect();
      this.isConnected = false;

      if (!options.quiet) {
        logger.info("✅ Disconnected from database");
      }
    } catch (error) {
      logger.error("Failed to disconnect from database:", error);
      throw error;
    }
  }

  /**
   * Get connection status
   */
  getConnectionStatus(): boolean {
    return this.isConnected && mongoose.connection.readyState === 1;
  }

  /**
   * Get database statistics
   */
  async getDatabaseStats(): Promise<any> {
    if (!this.isConnected) {
      throw new Error("Database not connected");
    }

    try {
      const db = mongoose.connection.db;
      if (!db) {
        throw new Error("Database instance not available");
      }

      const stats = await db.stats();
      const collections = await db.listCollections().toArray();

      return {
        name: db.databaseName,
        collections: collections.length,
        dataSize: stats.dataSize,
        storageSize: stats.storageSize,
        indexes: stats.indexes,
        objects: stats.objects,
        avgObjSize: stats.avgObjSize,
      };
    } catch (error) {
      logger.error("Failed to get database stats:", error);
      throw error;
    }
  }

  /**
   * Execute a function with automatic connection management
   */
  async withConnection<T>(
    operation: () => Promise<T>,
    options: { dbName?: string; quiet?: boolean } = {}
  ): Promise<T> {
    await this.connect(options);
    try {
      return await operation();
    } finally {
      await this.disconnect(options);
    }
  }

  /**
   * Clear all collections in the database
   */
  async clearDatabase(
    options: { confirm?: boolean; quiet?: boolean } = {}
  ): Promise<void> {
    if (!options.confirm) {
      throw new Error("Database clear requires explicit confirmation");
    }

    if (!this.isConnected) {
      throw new Error("Database not connected");
    }

    try {
      const db = mongoose.connection.db;
      if (!db) {
        throw new Error("Database instance not available");
      }

      const collections = await db.listCollections().toArray();

      if (!options.quiet) {
        logger.info(`Clearing ${collections.length} collections...`);
      }

      for (const collection of collections) {
        await db.collection(collection.name).deleteMany({});
        if (!options.quiet) {
          logger.info(`✅ Cleared collection: ${collection.name}`);
        }
      }

      if (!options.quiet) {
        logger.info("🧹 Database cleared successfully");
      }
    } catch (error) {
      logger.error("Failed to clear database:", error);
      throw error;
    }
  }

  /**
   * Drop the entire database
   */
  async dropDatabase(
    options: { confirm?: boolean; quiet?: boolean } = {}
  ): Promise<void> {
    if (!options.confirm) {
      throw new Error("Database drop requires explicit confirmation");
    }

    if (!this.isConnected) {
      throw new Error("Database not connected");
    }

    try {
      const dbName = mongoose.connection.db?.databaseName;
      await mongoose.connection.db?.dropDatabase();

      if (!options.quiet) {
        logger.info(`🗑️ Dropped database: ${dbName}`);
      }
    } catch (error) {
      logger.error("Failed to drop database:", error);
      throw error;
    }
  }
}

// Export singleton instance
export const dbManager = DatabaseManager.getInstance();
