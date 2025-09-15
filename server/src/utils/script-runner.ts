import { logger } from "./logger";
import { dbManager } from "./database";

/**
 * Base class for database scripts with common functionality
 */
export abstract class BaseScript {
  protected scriptName: string;
  protected startTime: number = 0;

  constructor(scriptName: string) {
    this.scriptName = scriptName;
  }

  /**
   * Abstract method that each script must implement
   */
  abstract execute(): Promise<void>;

  /**
   * Run the script with error handling and timing
   */
  async run(options: { dbName?: string; quiet?: boolean } = {}): Promise<void> {
    this.startTime = Date.now();

    try {
      if (!options.quiet) {
        logger.info(`🚀 Starting script: ${this.scriptName}`);
      }

      await dbManager.connect(options);
      await this.execute();

      const duration = Date.now() - this.startTime;
      if (!options.quiet) {
        logger.info(
          `✅ Script completed successfully in ${duration}ms: ${this.scriptName}`
        );
      }
    } catch (error) {
      const duration = Date.now() - this.startTime;
      logger.error(
        `❌ Script failed after ${duration}ms: ${this.scriptName}`,
        error
      );
      throw error;
    } finally {
      await dbManager.disconnect(options);
    }
  }

  /**
   * Validate input parameters
   */
  protected validateInput(input: any, rules: Record<string, any>): void {
    for (const [field, rule] of Object.entries(rules)) {
      if (
        rule.required &&
        (input[field] === undefined || input[field] === null)
      ) {
        throw new Error(`Required field missing: ${field}`);
      }

      if (rule.type && input[field] !== undefined) {
        const actualType = typeof input[field];
        if (actualType !== rule.type) {
          throw new Error(
            `Invalid type for ${field}: expected ${rule.type}, got ${actualType}`
          );
        }
      }

      if (rule.min && input[field] < rule.min) {
        throw new Error(`${field} must be at least ${rule.min}`);
      }

      if (rule.max && input[field] > rule.max) {
        throw new Error(`${field} must be at most ${rule.max}`);
      }
    }
  }

  /**
   * Log progress with consistent formatting
   */
  protected logProgress(message: string, data?: any): void {
    logger.info(`[${this.scriptName}] ${message}`, data);
  }

  /**
   * Log warning with consistent formatting
   */
  protected logWarning(message: string, data?: any): void {
    logger.warn(`[${this.scriptName}] ${message}`, data);
  }

  /**
   * Log error with consistent formatting
   */
  protected logError(message: string, error?: any): void {
    logger.error(`[${this.scriptName}] ${message}`, error);
  }

  /**
   * Get elapsed time in milliseconds
   */
  protected getElapsedTime(): number {
    return Date.now() - this.startTime;
  }
}

/**
 * Utility functions for common script operations
 */
export class ScriptUtils {
  /**
   * Confirm destructive operations
   */
  static async confirmOperation(
    message: string,
    skipConfirmation = false
  ): Promise<boolean> {
    if (skipConfirmation) {
      return true;
    }

    // In a real application, you might want to use a proper CLI prompt library
    // For now, we'll check environment variables or command line arguments
    const autoConfirm =
      process.env.AUTO_CONFIRM === "true" || process.argv.includes("--yes");

    if (autoConfirm) {
      logger.info(`Auto-confirming: ${message}`);
      return true;
    }

    logger.warn(`Manual confirmation required: ${message}`);
    logger.warn("Set AUTO_CONFIRM=true or use --yes flag to skip confirmation");
    return false;
  }

  /**
   * Parse command line arguments
   */
  static parseArgs(): Record<string, string | boolean> {
    const args: Record<string, string | boolean> = {};

    for (let i = 2; i < process.argv.length; i++) {
      const arg = process.argv[i];

      if (arg && arg.startsWith("--")) {
        const key = arg.slice(2);
        const nextArg = process.argv[i + 1];

        if (nextArg && !nextArg.startsWith("--")) {
          args[key] = nextArg;
          i++; // Skip next argument since we used it as value
        } else {
          args[key] = true;
        }
      }
    }

    return args;
  }

  /**
   * Validate environment variables
   */
  static validateEnvironment(required: string[]): void {
    const missing = required.filter((key) => !process.env[key]);

    if (missing.length > 0) {
      throw new Error(
        `Missing required environment variables: ${missing.join(", ")}`
      );
    }
  }

  /**
   * Safe JSON parsing with fallback
   */
  static safeJsonParse<T>(jsonString: string, fallback: T): T {
    try {
      return JSON.parse(jsonString);
    } catch (error) {
      logger.warn("Failed to parse JSON, using fallback", {
        error,
        jsonString,
      });
      return fallback;
    }
  }

  /**
   * Batch process items with progress reporting
   */
  static async batchProcess<T, R>(
    items: T[],
    processor: (item: T, index: number) => Promise<R>,
    options: {
      batchSize?: number;
      progressInterval?: number;
      concurrency?: number;
    } = {}
  ): Promise<R[]> {
    const { batchSize = 100, progressInterval = 10, concurrency = 1 } = options;
    const results: R[] = [];

    logger.info(
      `Processing ${items.length} items with batch size ${batchSize}`
    );

    for (let i = 0; i < items.length; i += batchSize) {
      const batch = items.slice(i, i + batchSize);

      if (concurrency === 1) {
        // Sequential processing
        for (let j = 0; j < batch.length; j++) {
          const item = batch[j];
          if (item !== undefined) {
            const result = await processor(item, i + j);
            results.push(result);

            if ((i + j + 1) % progressInterval === 0) {
              logger.info(`Processed ${i + j + 1}/${items.length} items`);
            }
          }
        }
      } else {
        // Concurrent processing
        const batchPromises = batch.map((item, j) => processor(item, i + j));
        const batchResults = await Promise.all(batchPromises);
        results.push(...batchResults);

        logger.info(
          `Processed batch ${Math.floor(i / batchSize) + 1}/${Math.ceil(
            items.length / batchSize
          )}`
        );
      }
    }

    logger.info(`Completed processing ${items.length} items`);
    return results;
  }
}
