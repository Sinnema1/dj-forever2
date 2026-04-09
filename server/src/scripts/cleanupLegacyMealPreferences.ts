/**
 * One-time cleanup script to reset legacy meal preference values.
 *
 * Legacy values (chicken, beef, fish, vegetarian, vegan, kids, other)
 * are no longer valid enum values. This script sets them to "" so guests
 * will re-select from the current menu when the feature flag is enabled.
 *
 * Usage:
 *   npx tsx src/scripts/cleanupLegacyMealPreferences.ts --db djforever2_dev --yes
 *   npx tsx src/scripts/cleanupLegacyMealPreferences.ts --db djforever2 --yes  (prod — review audit output first)
 */

import { RSVP } from "../models/RSVP";
import { BaseScript, ScriptUtils } from "../utils/script-runner";

const VALID_MEAL_VALUES = ["brisket", "tritip", "kids_chicken", "kids_mac", "dietary", ""];
// Display label for null/undefined — not legacy, just unset
const NON_LEGACY_DISPLAY_KEYS = new Set([...VALID_MEAL_VALUES, "(none)"]);

class CleanupLegacyMealPreferencesScript extends BaseScript {
  constructor() {
    super("CleanupLegacyMealPreferences");
  }

  async execute(): Promise<void> {
    // Audit: count legacy values before cleanup
    const beforeCounts = await this.auditMealValues();
    const legacyCount = Object.entries(beforeCounts)
      .filter(([value]) => !NON_LEGACY_DISPLAY_KEYS.has(value))
      .reduce((sum, [, count]) => sum + count, 0);

    this.logProgress("Current meal preference distribution:", beforeCounts);

    if (legacyCount === 0) {
      this.logProgress("No legacy meal preference values found. Nothing to clean up.");
      return;
    }

    this.logProgress(`Found ${legacyCount} legacy meal preference values to reset.`);

    const confirmed = await ScriptUtils.confirmOperation(
      `This will reset ${legacyCount} meal preference values to empty string. Continue?`
    );

    if (!confirmed) {
      this.logWarning("Cleanup cancelled by user.");
      return;
    }

    // Clean top-level mealPreference (legacy single-guest format)
    const topLevelResult = await (RSVP as any).updateMany(
      {
        mealPreference: { $exists: true, $nin: VALID_MEAL_VALUES },
      },
      { $set: { mealPreference: "" } }
    ).exec();

    this.logProgress(`Top-level mealPreference reset: ${topLevelResult.modifiedCount} documents`);

    // Clean guests[].mealPreference (array format)
    // Use $elemMatch so docs with mixed valid/legacy guest values are still matched
    const arrayResult = await (RSVP as any).updateMany(
      {
        guests: { $elemMatch: { mealPreference: { $exists: true, $nin: VALID_MEAL_VALUES } } },
      },
      { $set: { "guests.$[elem].mealPreference": "" } },
      { arrayFilters: [{ "elem.mealPreference": { $nin: VALID_MEAL_VALUES } }] }
    ).exec();

    this.logProgress(`Guest array mealPreference reset: ${arrayResult.modifiedCount} documents`);

    // Audit: count values after cleanup
    const afterCounts = await this.auditMealValues();
    this.logProgress("Meal preference distribution after cleanup:", afterCounts);

    const remainingLegacy = Object.entries(afterCounts)
      .filter(([value]) => !NON_LEGACY_DISPLAY_KEYS.has(value))
      .reduce((sum, [, count]) => sum + count, 0);

    if (remainingLegacy > 0) {
      this.logWarning(`${remainingLegacy} legacy values still remain — may need manual review.`);
    } else {
      this.logProgress("All legacy meal preference values have been cleared.");
    }
  }

  private async auditMealValues(): Promise<Record<string, number>> {
    const counts: Record<string, number> = {};

    // Only audit guests[] array — the canonical source of truth.
    // Top-level mealPreference is a legacy sync field that mirrors guests[0],
    // so counting both would double-count every single-guest RSVP.
    const guestLevel = await (RSVP as any).aggregate([
      { $unwind: "$guests" },
      { $match: { "guests.mealPreference": { $exists: true } } },
      { $group: { _id: "$guests.mealPreference", count: { $sum: 1 } } },
    ]).exec();

    for (const row of guestLevel) {
      // Preserve "" as a key — it's a valid value (unselected).
      // Only map null/undefined to a display label.
      const key = row._id ?? "(none)";
      counts[key] = (counts[key] || 0) + row.count;
    }

    return counts;
  }
}

async function main() {
  const args = ScriptUtils.parseArgs();
  const script = new CleanupLegacyMealPreferencesScript();

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

if (import.meta.url === `file://${process.argv[1]}`) {
  main();
}

export default CleanupLegacyMealPreferencesScript;
