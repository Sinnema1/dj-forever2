#!/usr/bin/env node

/**
 * Focus Management Audit Tool
 *
 * Comprehensive audit for WCAG 2.4.7 (Focus Visible) and 2.4.3 (Focus Order)
 * compliance across the wedding website application.
 *
 * Checks:
 * - Focus indicator visibility
 * - Logical tab order
 * - Skip links presence
 * - Modal focus trapping
 * - Focus restoration
 * - Keyboard navigation support
 *
 * Usage:
 *   node scripts/focus-audit.js
 */

console.log('🔍 FOCUS MANAGEMENT AUDIT\n');
console.log('='.repeat(80));
console.log('\nThis audit checks for WCAG 2.4.7 (Focus Visible) compliance');
console.log('and best practices for keyboard navigation.\n');
console.log('='.repeat(80) + '\n');

// Import required modules
const fs = require('fs');
const path = require('path');

// File paths to check
const srcDir = path.join(__dirname, '../src');
const assetsDir = path.join(srcDir, 'assets');
const componentsDir = path.join(srcDir, 'components');
const pagesDir = path.join(srcDir, 'pages');

/**
 * Check for skip links in the application
 */
function checkSkipLinks() {
  console.log('\n🔗 SKIP LINKS AUDIT');
  console.log('-'.repeat(80));

  const files = [
    path.join(srcDir, 'App.tsx'),
    path.join(pagesDir, 'HomePage.tsx'),
    path.join(componentsDir, 'Navbar.tsx'),
  ];

  let skipLinkFound = false;

  files.forEach(file => {
    if (fs.existsSync(file)) {
      const content = fs.readFileSync(file, 'utf-8');
      if (
        content.includes('skip-to-main') ||
        content.includes('skip-link') ||
        content.includes('skip to main')
      ) {
        console.log(`✅ Skip link found in: ${path.basename(file)}`);
        skipLinkFound = true;
      }
    }
  });

  if (!skipLinkFound) {
    console.log('❌ NO SKIP LINKS FOUND');
    console.log(
      '   Recommendation: Add "Skip to Main Content" link for keyboard users'
    );
    console.log('   WCAG 2.4.1 (Bypass Blocks) - Level A requirement');
  }

  return skipLinkFound;
}

/**
 * Check focus indicators in CSS files
 */
function checkFocusIndicators() {
  console.log('\n👁️  FOCUS INDICATOR AUDIT');
  console.log('-'.repeat(80));

  const cssFiles = fs.readdirSync(assetsDir).filter(f => f.endsWith('.css'));
  const issues = [];
  const goodPatterns = [];

  cssFiles.forEach(file => {
    const filePath = path.join(assetsDir, file);
    const content = fs.readFileSync(filePath, 'utf-8');

    // Check for outline: none without :focus-visible replacement
    const outlineNonePattern = /([^{]+)\s*{\s*[^}]*outline:\s*none[^}]*}/g;
    let match;

    while ((match = outlineNonePattern.exec(content)) !== null) {
      const selector = match[1].trim();

      // Check if there's a corresponding :focus-visible rule
      // Escape special regex characters
      const escapedSelector = selector
        .replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
        .replace(/\s+/g, '\\s*');

      const focusVisiblePattern = new RegExp(
        escapedSelector + '.*:focus-visible',
        'i'
      );

      if (!focusVisiblePattern.test(content)) {
        issues.push({
          file,
          selector,
          issue: 'outline: none without :focus-visible alternative',
        });
      }
    }

    // Check for good :focus-visible patterns
    if (content.includes(':focus-visible')) {
      goodPatterns.push({ file, pattern: ':focus-visible' });
    }
  });

  console.log(`\n✅ Files with :focus-visible: ${goodPatterns.length}`);
  goodPatterns.forEach(({ file }) => {
    console.log(`   - ${file}`);
  });

  if (issues.length > 0) {
    console.log(`\n⚠️  Potential Focus Indicator Issues: ${issues.length}`);
    issues.forEach(({ file, selector, issue }) => {
      console.log(`   ${file}:`);
      console.log(`     Selector: ${selector.substring(0, 60)}...`);
      console.log(`     Issue: ${issue}\n`);
    });
  } else {
    console.log('\n✅ No focus indicator issues found');
  }

  return issues.length === 0;
}

/**
 * Check modal focus trapping
 */
function checkModalFocusTrapping() {
  console.log('\n🎯 MODAL FOCUS TRAPPING AUDIT');
  console.log('-'.repeat(80));

  const modalFiles = [
    'QRLoginModal.tsx',
    'WelcomeModal.tsx',
    'MobileDrawer.tsx',
    'SwipeableLightbox.tsx',
    'QRHelpModal.tsx',
  ];

  const results = [];

  modalFiles.forEach(file => {
    const filePath = path.join(componentsDir, file);
    if (!fs.existsSync(filePath)) {
      return;
    }

    const content = fs.readFileSync(filePath, 'utf-8');

    const hasFocusTrap = content.includes('Tab') && content.includes('focus');
    const hasEscapeKey = content.includes('Escape') || content.includes('Esc');
    const hasFocusRestoration =
      content.includes('previousActiveElement') ||
      content.includes('restoreFocus');
    const hasAutoFocus =
      content.includes('autoFocus') ||
      content.includes('.focus()') ||
      (content.includes('setTimeout') && content.includes('focus'));

    results.push({
      file,
      hasFocusTrap,
      hasEscapeKey,
      hasFocusRestoration,
      hasAutoFocus,
    });
  });

  results.forEach(
    ({
      file,
      hasFocusTrap,
      hasEscapeKey,
      hasFocusRestoration,
      hasAutoFocus,
    }) => {
      console.log(`\n📄 ${file}`);
      console.log(`   ${hasFocusTrap ? '✅' : '❌'} Focus trap implementation`);
      console.log(`   ${hasEscapeKey ? '✅' : '❌'} ESC key support`);
      console.log(`   ${hasFocusRestoration ? '✅' : '❌'} Focus restoration`);
      console.log(`   ${hasAutoFocus ? '✅' : '❌'} Auto-focus on open`);
    }
  );

  const allPassed = results.every(
    r =>
      r.hasFocusTrap &&
      r.hasEscapeKey &&
      r.hasFocusRestoration &&
      r.hasAutoFocus
  );

  return allPassed;
}

/**
 * Check for proper tabIndex usage
 */
function checkTabIndexUsage() {
  console.log('\n⌨️  TAB INDEX AUDIT');
  console.log('-'.repeat(80));

  const tsxFiles = [];

  // Recursively find all .tsx files
  function findTsxFiles(dir) {
    const files = fs.readdirSync(dir);
    files.forEach(file => {
      const filePath = path.join(dir, file);
      const stat = fs.statSync(filePath);

      if (stat.isDirectory()) {
        findTsxFiles(filePath);
      } else if (file.endsWith('.tsx')) {
        tsxFiles.push(filePath);
      }
    });
  }

  findTsxFiles(srcDir);

  const tabIndexIssues = [];
  const tabIndexPositive = [];

  tsxFiles.forEach(file => {
    const content = fs.readFileSync(file, 'utf-8');

    // Check for positive tabIndex (anti-pattern)
    const positiveTabIndexPattern = /tabIndex=\{[1-9]\d*\}/g;
    const matches = content.match(positiveTabIndexPattern);

    if (matches) {
      tabIndexPositive.push({
        file: path.basename(file),
        count: matches.length,
      });
    }
  });

  if (tabIndexPositive.length > 0) {
    console.log('⚠️  Positive tabIndex values found (anti-pattern):');
    tabIndexPositive.forEach(({ file, count }) => {
      console.log(`   ${file}: ${count} occurrence(s)`);
    });
    console.log('\n   Recommendation: Use tabIndex={0} or tabIndex={-1} only');
    console.log('   Positive values disrupt natural tab order');
  } else {
    console.log('✅ No positive tabIndex values found');
  }

  return tabIndexPositive.length === 0;
}

/**
 * Check for button vs div/span with onClick (keyboard accessibility)
 */
function checkInteractiveElements() {
  console.log('\n🖱️  INTERACTIVE ELEMENTS AUDIT');
  console.log('-'.repeat(80));

  const tsxFiles = [];

  function findTsxFiles(dir) {
    const files = fs.readdirSync(dir);
    files.forEach(file => {
      const filePath = path.join(dir, file);
      const stat = fs.statSync(filePath);

      if (stat.isDirectory()) {
        findTsxFiles(filePath);
      } else if (file.endsWith('.tsx')) {
        tsxFiles.push(filePath);
      }
    });
  }

  findTsxFiles(srcDir);

  const issues = [];

  tsxFiles.forEach(file => {
    const content = fs.readFileSync(file, 'utf-8');

    // Check for div/span with onClick but no role/tabIndex/onKeyDown
    const clickableDivPattern = /<(div|span)[^>]*onClick[^>]*>/g;
    let match;

    while ((match = clickableDivPattern.exec(content)) !== null) {
      const fullTag = match[0];

      // Check if it has proper keyboard support
      const hasRole = fullTag.includes('role=');
      const hasTabIndex = fullTag.includes('tabIndex');
      const hasKeyDown =
        content.includes('onKeyDown') || content.includes('onKeyPress');

      if (!hasRole || !hasTabIndex || !hasKeyDown) {
        issues.push({
          file: path.basename(file),
          element: match[1],
          line: content.substring(0, match.index).split('\n').length,
        });
      }
    }
  });

  if (issues.length > 0) {
    console.log(
      `⚠️  Interactive ${issues.length} elements without full keyboard support:`
    );
    const grouped = {};
    issues.forEach(({ file, element, line }) => {
      if (!grouped[file]) grouped[file] = [];
      grouped[file].push({ element, line });
    });

    Object.entries(grouped).forEach(([file, items]) => {
      console.log(`\n   ${file}:`);
      items.slice(0, 5).forEach(({ element, line }) => {
        console.log(
          `     Line ${line}: <${element}> needs role, tabIndex, and keyboard handler`
        );
      });
      if (items.length > 5) {
        console.log(`     ... and ${items.length - 5} more`);
      }
    });
  } else {
    console.log('✅ All interactive elements have proper keyboard support');
  }

  return issues.length === 0;
}

/**
 * Generate summary report
 */
function generateSummary(results) {
  console.log('\n📊 SUMMARY');
  console.log('='.repeat(80));

  const totalChecks = Object.keys(results).length;
  const passedChecks = Object.values(results).filter(v => v).length;
  const percentage = Math.round((passedChecks / totalChecks) * 100);

  console.log(`\nTotal Checks: ${totalChecks}`);
  console.log(`Passed: ${passedChecks}`);
  console.log(`Failed: ${totalChecks - passedChecks}`);
  console.log(`\nCompliance: ${percentage}%`);

  if (percentage === 100) {
    console.log('\n🎉 All focus management checks passed!');
  } else if (percentage >= 80) {
    console.log('\n✅ Good focus management - minor improvements needed');
  } else if (percentage >= 60) {
    console.log('\n⚠️  Focus management needs attention');
  } else {
    console.log('\n❌ Significant focus management issues found');
  }

  console.log('\n' + '='.repeat(80));
  console.log('\n📖 WCAG References:');
  console.log('   2.4.1 Bypass Blocks (Level A) - Skip links');
  console.log('   2.4.3 Focus Order (Level A) - Logical tab order');
  console.log('   2.4.7 Focus Visible (Level AA) - Visible focus indicators');
  console.log('   2.1.1 Keyboard (Level A) - All functionality via keyboard');
  console.log('   2.1.2 No Keyboard Trap (Level A) - Focus can be moved away');
  console.log('\n');
}

// Run all audits
const results = {
  skipLinks: checkSkipLinks(),
  focusIndicators: checkFocusIndicators(),
  modalFocusTrapping: checkModalFocusTrapping(),
  tabIndexUsage: checkTabIndexUsage(),
  interactiveElements: checkInteractiveElements(),
};

generateSummary(results);
