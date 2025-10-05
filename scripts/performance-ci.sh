#!/bin/bash

# Performance CI/CD Integration Script
# Runs performance checks and generates reports for CI/CD pipelines

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[0;33m'
NC='\033[0m' # No Color

# Configuration
BUILD_DIR="dist"
PERFORMANCE_REPORT_DIR="performance-reports"
LIGHTHOUSE_REPORT_FILE="lighthouse-report.json"
BUDGET_REPORT_FILE="bundle-budget-report.json"

# Function to print colored output
print_status() {
    local color=$1
    local message=$2
    echo -e "${color}${message}${NC}"
}

# Function to check if command exists
command_exists() {
    command -v "$1" >/dev/null 2>&1
}

# Create performance reports directory
mkdir -p "$PERFORMANCE_REPORT_DIR"

print_status $YELLOW "🚀 Starting Performance CI/CD Pipeline..."

# 1. Build the application with performance analysis
print_status $YELLOW "📦 Building application with performance analysis..."
npm run build:analyze

# 2. Check bundle performance budget
print_status $YELLOW "💰 Checking performance budget..."
if npm run performance:check; then
    print_status $GREEN "✅ Performance budget check passed"
else
    print_status $RED "❌ Performance budget check failed"
    exit 1
fi

# 3. Run Lighthouse CI (if available)
if command_exists "lhci"; then
    print_status $YELLOW "🔍 Running Lighthouse CI..."
    
    # Start a local server for testing
    npx http-server "$BUILD_DIR" -p 8080 &
    SERVER_PID=$!
    
    # Wait for server to start
    sleep 3
    
    # Run Lighthouse CI
    lhci autorun --upload.target=filesystem --upload.outputDir="$PERFORMANCE_REPORT_DIR" || {
        kill $SERVER_PID 2>/dev/null || true
        print_status $RED "❌ Lighthouse CI failed"
        exit 1
    }
    
    # Stop the server
    kill $SERVER_PID 2>/dev/null || true
    
    print_status $GREEN "✅ Lighthouse CI completed"
else
    print_status $YELLOW "⚠️ Lighthouse CI not installed, skipping..."
fi

# 4. Generate performance report
print_status $YELLOW "📊 Generating performance report..."

# Copy budget report if it exists
if [ -f "budget-report.json" ]; then
    cp "budget-report.json" "$PERFORMANCE_REPORT_DIR/$BUDGET_REPORT_FILE"
fi

# Create summary report
cat > "$PERFORMANCE_REPORT_DIR/performance-summary.md" << EOF
# Performance Report

Generated on: $(date)
Commit: ${GITHUB_SHA:-$(git rev-parse HEAD 2>/dev/null || echo "unknown")}
Branch: ${GITHUB_REF_NAME:-$(git branch --show-current 2>/dev/null || echo "unknown")}

## Bundle Analysis

$(if [ -f "budget-report.json" ]; then
    echo "### Bundle Budget Status"
    echo "\`\`\`json"
    cat "budget-report.json"
    echo "\`\`\`"
else
    echo "No bundle budget report available"
fi)

## Build Information

- Build Directory: $BUILD_DIR
- Total Bundle Size: $(du -sh "$BUILD_DIR" 2>/dev/null | cut -f1 || echo "unknown")
- Number of Assets: $(find "$BUILD_DIR" -type f 2>/dev/null | wc -l || echo "unknown")

## Performance Recommendations

1. **Bundle Optimization**: Review large chunks and consider code splitting
2. **Image Optimization**: Ensure all images are properly compressed
3. **Caching Strategy**: Verify proper cache headers are set
4. **Core Web Vitals**: Monitor LCP, FID, and CLS metrics

## Next Steps

- Review Lighthouse report for detailed recommendations
- Monitor Core Web Vitals in production
- Consider implementing progressive loading strategies

EOF

# 5. Check for performance regressions
print_status $YELLOW "📈 Checking for performance regressions..."

# Create a simple regression check
cat > "$PERFORMANCE_REPORT_DIR/regression-check.js" << 'EOF'
const fs = require('fs');
const path = require('path');

// Simple regression check for bundle size
function checkBundleRegression() {
    const buildDir = 'dist';
    const maxBundleSize = 10 * 1024 * 1024; // 10MB max
    
    try {
        const stats = fs.statSync(buildDir);
        if (stats.isDirectory()) {
            // Get total size of build directory
            const { execSync } = require('child_process');
            const sizeOutput = execSync(`du -sb ${buildDir}`).toString();
            const totalSize = parseInt(sizeOutput.split('\t')[0]);
            
            console.log(`Total bundle size: ${(totalSize / 1024 / 1024).toFixed(2)} MB`);
            
            if (totalSize > maxBundleSize) {
                console.error(`Bundle size regression detected! Size: ${totalSize} bytes (max: ${maxBundleSize} bytes)`);
                process.exit(1);
            } else {
                console.log('Bundle size check passed');
            }
        }
    } catch (error) {
        console.error('Error checking bundle size:', error.message);
        process.exit(1);
    }
}

checkBundleRegression();
EOF

node "$PERFORMANCE_REPORT_DIR/regression-check.js"

# 6. Generate GitHub Actions artifacts (if in CI)
if [ "$CI" = "true" ] || [ "$GITHUB_ACTIONS" = "true" ]; then
    print_status $YELLOW "🔧 Preparing CI artifacts..."
    
    # Create artifacts directory structure
    mkdir -p "artifacts/performance"
    cp -r "$PERFORMANCE_REPORT_DIR"/* "artifacts/performance/" 2>/dev/null || true
    
    # Copy build stats if available
    if [ -f "stats.html" ]; then
        cp "stats.html" "artifacts/performance/"
    fi
    
    print_status $GREEN "✅ CI artifacts prepared"
fi

# 7. Performance summary
print_status $GREEN "🎉 Performance CI/CD Pipeline completed successfully!"

echo ""
echo "Performance Reports Generated:"
echo "- Bundle budget: $PERFORMANCE_REPORT_DIR/$BUDGET_REPORT_FILE"
echo "- Summary report: $PERFORMANCE_REPORT_DIR/performance-summary.md"
if [ -f "$PERFORMANCE_REPORT_DIR/$LIGHTHOUSE_REPORT_FILE" ]; then
    echo "- Lighthouse report: $PERFORMANCE_REPORT_DIR/$LIGHTHOUSE_REPORT_FILE"
fi

echo ""
print_status $YELLOW "📋 To integrate with GitHub Actions, add this workflow:"
cat << 'EOF'

# .github/workflows/performance.yml
name: Performance CI
on: [pull_request, push]
jobs:
  performance:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: '18'
          cache: 'npm'
      - run: npm ci
      - run: chmod +x scripts/performance-ci.sh
      - run: ./scripts/performance-ci.sh
      - uses: actions/upload-artifact@v4
        if: always()
        with:
          name: performance-reports
          path: performance-reports/
EOF

echo ""
print_status $GREEN "Performance pipeline setup complete! 🚀"