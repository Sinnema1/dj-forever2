/**
 * Migration script to update legacy RSVP records to new format
 * Adds guestCount and guests array fields to existing RSVPs
 */

import { RSVP } from "../models/RSVP";
import { BaseScript, ScriptUtils } from "../utils/script-runner";
import { ValidationError } from "../utils/errors";

interface LegacyRSVP {
  _id: string;
  userId: string;
  fullName?: string;
  attending: string;
  mealPreference?: string;
  allergies?: string;
  guestCount?: number;
  guests?: any[];
}

class MigrateLegacyRSVPsScript extends BaseScript {
  constructor() {
    super("MigrateLegacyRSVPs");
  }

  async execute(): Promise<void> {
    try {
      // Find RSVPs that don't have the new format
      const legacyRSVPs = await this.findLegacyRSVPs();

      if (legacyRSVPs.length === 0) {
        this.logProgress("No legacy RSVPs found. Migration not needed.");
        return;
      }

      this.logProgress(
        `Found ${legacyRSVPs.length} legacy RSVP records to migrate`
      );

      // Confirm migration
      const confirmed = await ScriptUtils.confirmOperation(
        `This will migrate ${legacyRSVPs.length} RSVP records. Continue?`
      );

      if (!confirmed) {
        this.logWarning("Migration cancelled by user");
        return;
      }

      // Process RSVPs in batches
      const results = await ScriptUtils.batchProcess(
        legacyRSVPs,
        this.migrateRSVP.bind(this),
        {
          batchSize: 50,
          progressInterval: 10,
          concurrency: 1, // Sequential to avoid conflicts
        }
      );

      const successful = results.filter((r) => r.success).length;
      const failed = results.length - successful;

      this.logProgress(
        `Migration completed: ${successful} successful, ${failed} failed`
      );

      if (failed > 0) {
        this.logWarning(
          `${failed} RSVPs failed to migrate. Check logs for details.`
        );
      }
    } catch (error) {
      this.logError("Migration failed", error);
      throw error;
    }
  }

  private async findLegacyRSVPs(): Promise<LegacyRSVP[]> {
    try {
      const query = {
        $or: [
          { guestCount: { $exists: false } },
          { guests: { $exists: false } },
          { guests: { $size: 0 } },
        ],
      };

      const rsvps = (await (RSVP as any)
        .find(query)
        .lean()
        .exec()) as LegacyRSVP[];
      return rsvps;
    } catch (error) {
      this.logError("Failed to find legacy RSVPs", error);
      throw error;
    }
  }

  private async migrateRSVP(
    rsvp: LegacyRSVP,
    index: number
  ): Promise<{ success: boolean; error?: string }> {
    try {
      // Validate required fields
      if (!rsvp.userId || !rsvp.attending) {
        throw new ValidationError(
          `RSVP missing required fields: userId=${rsvp.userId}, attending=${rsvp.attending}`
        );
      }

      // Create new format with guest array
      const guestCount = 1; // Assume single guest for legacy records
      const guests = [
        {
          fullName: rsvp.fullName || "Unknown Guest",
          mealPreference: rsvp.mealPreference || "",
          ...(rsvp.allergies && { allergies: rsvp.allergies }),
        },
      ];

      // Update the RSVP record
      const updateResult = await (RSVP as any)
        .findByIdAndUpdate(
          rsvp._id,
          {
            $set: {
              guestCount,
              guests,
            },
          },
          { new: true }
        )
        .exec();

      if (!updateResult) {
        throw new Error(`RSVP not found for update: ${rsvp._id}`);
      }

      this.logProgress(`Migrated RSVP ${index + 1}`, {
        userId: rsvp.userId,
        guestCount,
        guestName:
          guests.length > 0 ? guests[0]?.fullName || "Unknown" : "Unknown",
      });

      return { success: true };
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "Unknown error";
      this.logError(`Failed to migrate RSVP ${index + 1}`, {
        rsvpId: rsvp._id,
        userId: rsvp.userId,
        error: errorMessage,
      });

      return { success: false, error: errorMessage };
    }
  }
}

// Execute script if run directly
async function main() {
  const args = ScriptUtils.parseArgs();
  const script = new MigrateLegacyRSVPsScript();

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

// Check if this script is being run directly
if (import.meta.url === `file://${process.argv[1]}`) {
  main();
}

export default MigrateLegacyRSVPsScript;
