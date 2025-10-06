#!/usr/bin/env node

/**
 * Performance Budget Enforcement Script
 * Checks build output against defined performance budgets
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// Performance Budget Configuration
const PERFORMANCE_BUDGET = {
  // Bundle size budgets (in KB)
  maxBundleSize: 500,
  maxChunkSize: 200,
  maxVendorChunkSize: 300,
  maxCSSSize: 100,
  maxImageSize: 1000, // Per image

  // Asset count budgets
  maxJSFiles: 15,
  maxCSSFiles: 5,
  maxImageFiles: 50,

  // Specific chunk budgets
  chunks: {
    vendor: 300,
    apollo: 200,
    ui: 100,
    icons: 50,
    qr: 100,
  },
};

// Colors for console output
const colors = {
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  reset: '\x1b[0m',
  bold: '\x1b[1m',
};

function log(message, color = colors.reset) {
  console.log(`${color}${message}${colors.reset}`);
}

function formatSize(bytes) {
  return `${(bytes / 1024).toFixed(2)} KB`;
}

function analyzeBundle() {
  const distDir = path.join(__dirname, '..', 'dist');

  if (!fs.existsSync(distDir)) {
    log('❌ Dist directory not found. Run "npm run build" first.', colors.red);
    process.exit(1);
  }

  log(`${colors.bold}📊 Performance Budget Analysis${colors.reset}`);
  log('━'.repeat(50));

  const results = {
    passed: [],
    warnings: [],
    errors: [],
  };

  // Analyze JavaScript files
  const jsFiles = fs
    .readdirSync(path.join(distDir, 'assets'))
    .filter(file => file.endsWith('.js'))
    .map(file => {
      const filePath = path.join(distDir, 'assets', file);
      const stats = fs.statSync(filePath);
      const sizeKB = stats.size / 1024;

      return {
        name: file,
        size: stats.size,
        sizeKB: sizeKB,
        type: 'js',
      };
    })
    .sort((a, b) => b.size - a.size);

  // Analyze CSS files
  const cssFiles = fs
    .readdirSync(path.join(distDir, 'assets'))
    .filter(file => file.endsWith('.css'))
    .map(file => {
      const filePath = path.join(distDir, 'assets', file);
      const stats = fs.statSync(filePath);
      const sizeKB = stats.size / 1024;

      return {
        name: file,
        size: stats.size,
        sizeKB: sizeKB,
        type: 'css',
      };
    });

  // Calculate total bundle size
  const totalJSSize = jsFiles.reduce((sum, file) => sum + file.size, 0);
  const totalCSSSize = cssFiles.reduce((sum, file) => sum + file.size, 0);
  const totalBundleSize = totalJSSize + totalCSSSize;
  const totalBundleSizeKB = totalBundleSize / 1024;

  // Check total bundle size
  log(`\n${colors.blue}📦 Bundle Size Analysis:${colors.reset}`);
  log(`Total Bundle Size: ${formatSize(totalBundleSize)}`);
  log(`JavaScript: ${formatSize(totalJSSize)} (${jsFiles.length} files)`);
  log(`CSS: ${formatSize(totalCSSSize)} (${cssFiles.length} files)`);

  if (totalBundleSizeKB <= PERFORMANCE_BUDGET.maxBundleSize) {
    results.passed.push(
      `✅ Total bundle size: ${formatSize(totalBundleSize)} (within ${PERFORMANCE_BUDGET.maxBundleSize} KB budget)`
    );
  } else {
    results.errors.push(
      `❌ Total bundle size: ${formatSize(totalBundleSize)} exceeds ${PERFORMANCE_BUDGET.maxBundleSize} KB budget`
    );
  }

  // Check individual JS files
  log(`\n${colors.blue}📄 JavaScript Files:${colors.reset}`);
  jsFiles.forEach(file => {
    log(`  ${file.name}: ${formatSize(file.size)}`);

    // Check against chunk-specific budgets
    const chunkName = Object.keys(PERFORMANCE_BUDGET.chunks).find(chunk =>
      file.name.includes(chunk)
    );

    if (chunkName) {
      const budget = PERFORMANCE_BUDGET.chunks[chunkName];
      if (file.sizeKB <= budget) {
        results.passed.push(
          `✅ ${chunkName} chunk: ${formatSize(file.size)} (within ${budget} KB budget)`
        );
      } else {
        results.errors.push(
          `❌ ${chunkName} chunk: ${formatSize(file.size)} exceeds ${budget} KB budget`
        );
      }
    } else if (file.sizeKB > PERFORMANCE_BUDGET.maxChunkSize) {
      results.warnings.push(
        `⚠️  Large chunk: ${file.name} (${formatSize(file.size)}) exceeds ${PERFORMANCE_BUDGET.maxChunkSize} KB recommendation`
      );
    }
  });

  // Check CSS files
  if (cssFiles.length > 0) {
    log(`\n${colors.blue}🎨 CSS Files:${colors.reset}`);
    cssFiles.forEach(file => {
      log(`  ${file.name}: ${formatSize(file.size)}`);

      if (file.sizeKB > PERFORMANCE_BUDGET.maxCSSSize) {
        results.warnings.push(
          `⚠️  Large CSS file: ${file.name} (${formatSize(file.size)}) exceeds ${PERFORMANCE_BUDGET.maxCSSSize} KB recommendation`
        );
      }
    });
  }

  // Check file count budgets
  if (jsFiles.length > PERFORMANCE_BUDGET.maxJSFiles) {
    results.warnings.push(
      `⚠️  Too many JS files: ${jsFiles.length} exceeds ${PERFORMANCE_BUDGET.maxJSFiles} recommendation`
    );
  }

  if (cssFiles.length > PERFORMANCE_BUDGET.maxCSSFiles) {
    results.warnings.push(
      `⚠️  Too many CSS files: ${cssFiles.length} exceeds ${PERFORMANCE_BUDGET.maxCSSFiles} recommendation`
    );
  }

  // Display results
  log(`\n${colors.bold}📋 Performance Budget Results:${colors.reset}`);
  log('━'.repeat(50));

  if (results.passed.length > 0) {
    log(`\n${colors.green}✅ Passed Checks:${colors.reset}`);
    results.passed.forEach(check => log(check, colors.green));
  }

  if (results.warnings.length > 0) {
    log(`\n${colors.yellow}⚠️  Warnings:${colors.reset}`);
    results.warnings.forEach(warning => log(warning, colors.yellow));
  }

  if (results.errors.length > 0) {
    log(`\n${colors.red}❌ Errors:${colors.reset}`);
    results.errors.forEach(error => log(error, colors.red));
  }

  // Performance recommendations
  log(`\n${colors.blue}💡 Performance Recommendations:${colors.reset}`);
  log('━'.repeat(50));

  if (totalBundleSizeKB > PERFORMANCE_BUDGET.maxBundleSize * 0.8) {
    log('• Consider code splitting for larger components', colors.yellow);
    log('• Review and remove unused dependencies', colors.yellow);
    log('• Implement dynamic imports for non-critical features', colors.yellow);
  }

  if (jsFiles.length > 10) {
    log('• Consider consolidating smaller chunks', colors.yellow);
  }

  log(`\n• Run "npm run analyze" for detailed bundle visualization`);
  log('• Monitor Core Web Vitals in production');
  log('• Consider implementing lazy loading for images');

  // Exit with error code if budget exceeded
  if (results.errors.length > 0) {
    log(
      `\n${colors.red}${colors.bold}💥 Performance budget exceeded!${colors.reset}`,
      colors.red
    );
    process.exit(1);
  } else if (results.warnings.length > 0) {
    log(
      `\n${colors.yellow}${colors.bold}⚠️  Performance budget passed with warnings.${colors.reset}`,
      colors.yellow
    );
  } else {
    log(
      `\n${colors.green}${colors.bold}🎉 All performance budgets passed!${colors.reset}`,
      colors.green
    );
  }
}

// Generate performance report
function generateReport() {
  const distDir = path.join(__dirname, '..', 'dist');
  const reportPath = path.join(distDir, 'performance-report.json');

  const report = {
    timestamp: new Date().toISOString(),
    budget: PERFORMANCE_BUDGET,
    // Additional metrics would be added here
  };

  fs.writeFileSync(reportPath, JSON.stringify(report, null, 2));
  log(`\n📄 Performance report saved to: ${reportPath}`);
}

// Main execution
try {
  analyzeBundle();
  generateReport();
} catch (error) {
  log(`❌ Performance budget check failed: ${error.message}`, colors.red);
  process.exit(1);
}
