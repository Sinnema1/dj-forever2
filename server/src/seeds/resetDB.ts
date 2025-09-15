/**
 * Database Reset Script
 * Safely clears or drops the database with proper confirmation
 */

import { BaseScript, ScriptUtils } from "../utils/script-runner";
import { dbManager } from "../utils/database";

class ResetDatabaseScript extends BaseScript {
  constructor() {
    super("ResetDatabase");
  }

  async execute(): Promise<void> {
    const args = ScriptUtils.parseArgs();
    const action = (args.action as string) || "clear";
    const force = (args.force as boolean) || false;

    if (!["clear", "drop"].includes(action)) {
      throw new Error(
        'Invalid action. Use "clear" to empty collections or "drop" to remove database'
      );
    }

    try {
      // Get current database stats
      const stats = await dbManager.getDatabaseStats();
      this.logProgress(`Current database: ${stats.name}`, {
        collections: stats.collections,
        objects: stats.objects,
        dataSize: `${(stats.dataSize / 1024 / 1024).toFixed(2)} MB`,
      });

      if (stats.objects === 0) {
        this.logProgress("Database is already empty");
        return;
      }

      // Confirm destructive operation
      const confirmMessage =
        action === "drop"
          ? `This will PERMANENTLY DELETE the entire database "${stats.name}" with ${stats.objects} objects. This action cannot be undone!`
          : `This will clear all ${stats.collections} collections in database "${stats.name}" (${stats.objects} objects). This action cannot be undone!`;

      const confirmed = await ScriptUtils.confirmOperation(
        confirmMessage,
        force
      );

      if (!confirmed) {
        this.logWarning("Database reset cancelled by user");
        return;
      }

      // Perform the reset operation
      if (action === "drop") {
        await dbManager.dropDatabase({ confirm: true });
        this.logProgress("Database dropped successfully");
      } else {
        await dbManager.clearDatabase({ confirm: true });
        this.logProgress("Database cleared successfully");
      }

      // Verify the operation
      if (action !== "drop") {
        const newStats = await dbManager.getDatabaseStats();
        this.logProgress("Database reset completed", {
          collections: newStats.collections,
          objects: newStats.objects,
        });
      }
    } catch (error) {
      this.logError("Database reset failed", error);
      throw error;
    }
  }
}

// Execute script if run directly
async function main() {
  const args = ScriptUtils.parseArgs();

  // Validate environment for destructive operations
  if (!args.force && process.env.NODE_ENV === "production") {
    console.error(
      "❌ Cannot reset database in production environment without --force flag"
    );
    process.exit(1);
  }

  const script = new ResetDatabaseScript();

  try {
    await script.run({
      dbName: args.db as string,
      quiet: args.quiet as boolean,
    });
  } catch (error) {
    console.error("Script execution failed:", error);
    process.exit(1);
  }
}

// Usage information
if (process.argv.includes("--help") || process.argv.includes("-h")) {
  console.log(`
Database Reset Script

Usage:
  npm run reset-db [options]

Options:
  --action <clear|drop>   Action to perform (default: clear)
                         clear: Remove all documents from collections
                         drop: Delete the entire database
  --db <name>            Database name (optional)
  --force                Skip confirmation prompts
  --yes                  Auto-confirm operations
  --quiet                Reduce log output
  --help, -h             Show this help message

Environment Variables:
  AUTO_CONFIRM=true      Auto-confirm destructive operations
  NODE_ENV=production    Requires --force flag for safety

Examples:
  npm run reset-db                    # Clear all collections with confirmation
  npm run reset-db --action drop     # Drop entire database with confirmation  
  npm run reset-db --force --yes     # Clear without prompts
`);
  process.exit(0);
}

// Check if this script is being run directly
if (import.meta.url === `file://${process.argv[1]}`) {
  main();
}

export default ResetDatabaseScript;
