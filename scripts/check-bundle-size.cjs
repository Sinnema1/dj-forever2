/**
 * @fileoverview Bundle Size Gate Script
 * @version 1.0.0
 *
 * Enforces bundle size budgets for Vite 5 builds.
 * Scans dist/assets/*.js.gz files and fails if thresholds exceeded.
 *
 * Budgets:
 * - Main bundle: 120kb gzipped
 * - Total bundle: 220kb gzipped
 *
 * Usage:
 *   node scripts/check-bundle-size.cjs
 *
 * Exit codes:
 *   0 - Size gate passed
 *   1 - Size gate failed or error
 *
 * @author DJ Forever 2 Team
 */

const fs = require("node:fs");
const path = require("node:path");

// Configuration
const KB = 1024;
const MAIN_BUDGET = 120 * KB; // 120kb gzipped
const TOTAL_BUDGET = 245 * KB; // 245kb gzipped (increased for UTC date handling)

// Paths (assumes invocation from client/ working directory)
const dist = path.join(process.cwd(), "dist");
const assets = path.join(dist, "assets");

// Validate dist directory exists
if (!fs.existsSync(assets)) {
  console.error("❌ Error: assets directory not found");
  console.error("   Expected:", assets);
  console.error("   CWD:", process.cwd());
  console.error(
    "\n💡 Tip: Run 'npm run build' first or check working directory",
  );
  process.exit(1);
}

// Scan for gzipped JavaScript files
const files = fs.readdirSync(assets).filter((f) => f.endsWith(".js.gz"));

if (files.length === 0) {
  console.warn("⚠️  Warning: No .js.gz files found");
  console.warn("   Did the build run with compression enabled?");
  console.warn(
    "   Check vite.config.ts for vite-plugin-compression configuration",
  );
  process.exit(1);
}

// Calculate bundle sizes
let totalGz = 0;
let mainGz = 0;

for (const file of files) {
  const filePath = path.join(assets, file);
  const size = fs.statSync(filePath).size;
  totalGz += size;

  // Vite 5 typically names entry bundle as index-[hash].js
  // Also check for .entry- pattern for compatibility
  if (file.startsWith("index-") || file.includes(".entry-")) {
    mainGz = Math.max(mainGz, size);
  }
}

// Display results
console.log("\n📦 Bundle Size Analysis");
console.log("━".repeat(50));
console.log(
  `   Main bundle:  ${(mainGz / KB).toFixed(1)}kb / ${(
    MAIN_BUDGET / KB
  ).toFixed(0)}kb`,
);
console.log(
  `   Total bundle: ${(totalGz / KB).toFixed(1)}kb / ${(
    TOTAL_BUDGET / KB
  ).toFixed(0)}kb`,
);
console.log("━".repeat(50));

// Check budgets
const mainExceeded = mainGz > MAIN_BUDGET;
const totalExceeded = totalGz > TOTAL_BUDGET;

if (mainExceeded || totalExceeded) {
  console.error("\n❌ SIZE GATE FAILED\n");

  if (mainExceeded) {
    const diff = ((mainGz - MAIN_BUDGET) / KB).toFixed(1);
    console.error(`   Main bundle exceeded budget by ${diff}kb`);
  }

  if (totalExceeded) {
    const diff = ((totalGz - TOTAL_BUDGET) / KB).toFixed(1);
    console.error(`   Total bundle exceeded budget by ${diff}kb`);
  }

  console.error("\n💡 Troubleshooting Tips:");
  console.error("   1. Run 'npm run build' with ANALYZE=true");
  console.error("      → Generates bundle-analysis.html visualization");
  console.error("   2. Check for duplicate dependencies");
  console.error("      → Run 'npm dedupe' in client/");
  console.error("   3. Verify code-splitting is working");
  console.error("      → Admin routes should lazy-load");
  console.error("   4. Check vite.config.ts manualChunks configuration\n");

  process.exit(1);
}

// Success
console.log("\n✅ SIZE GATE PASSED\n");
console.log(`Analyzed ${files.length} gzipped JavaScript files`);
console.log(
  `Main bundle: ${((mainGz / MAIN_BUDGET) * 100).toFixed(1)}% of budget`,
);
console.log(
  `Total bundle: ${((totalGz / TOTAL_BUDGET) * 100).toFixed(1)}% of budget\n`,
);

process.exit(0);
