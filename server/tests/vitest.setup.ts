// server/vitest.setup.ts
import { config as dotenvConfig } from "dotenv";
import { beforeAll, afterAll } from "vitest";
import mongoose from "mongoose";

// Make sure we're using the test database
process.env.MONGODB_DB_NAME = "test_db";
dotenvConfig({ path: ".env.test" });

beforeAll(async () => {
  const uri = process.env.MONGODB_URI || "mongodb://127.0.0.1:27017";
  const dbName = process.env.MONGODB_DB_NAME || "test_db";
  console.log(`[vitest.setup] MONGODB_URI: ${uri}`);
  console.log(`[vitest.setup] MONGODB_DB_NAME: ${dbName}`);
  console.log(`[vitest.setup] Connecting to MongoDB...`);

  await mongoose.connect(uri, { dbName });
  console.log(`[vitest.setup] Connected to MongoDB.`);

  // Start clean
  if (mongoose.connection.readyState === 1 && mongoose.connection.db) {
    console.log(`[vitest.setup] Dropping test database...`);
    await mongoose.connection.db.dropDatabase();
    console.log(`[vitest.setup] Dropped test database.`);
  }
});

afterAll(async () => {
  // clean up and disconnect
  console.log(`[vitest.setup] Disconnecting from MongoDB...`);
  if (mongoose.connection.readyState === 1) {
    await mongoose.disconnect();
  }
  console.log(`[vitest.setup] Disconnected from MongoDB.`);
});

afterAll(async () => {
  // clean up and disconnect
  console.log(`[vitest.setup] Disconnecting from MongoDB...`);
  if (mongoose.connection.readyState === 1 && mongoose.connection.db) {
    await mongoose.connection.db.dropDatabase();
  }
  await mongoose.disconnect();
  console.log(`[vitest.setup] Disconnected from MongoDB.`);
});
