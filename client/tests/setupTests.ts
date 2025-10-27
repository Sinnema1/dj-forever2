/// <reference types="@testing-library/jest-dom" />

// Import custom matchers
import '@testing-library/jest-dom';
import type { TestingLibraryMatchers } from '@testing-library/jest-dom/matchers';

// Extend Vitest matchers with @testing-library/jest-dom
declare global {
  namespace Vi {
    interface Assertion<T = any> extends TestingLibraryMatchers<T, void> {}
    interface AsymmetricMatchersContaining
      extends TestingLibraryMatchers<any, void> {}
  }
}

// Polyfill/mocks for browser APIs not implemented in jsdom

// Mock IntersectionObserver with required properties
global.IntersectionObserver = class IntersectionObserver {
  readonly root = null;
  readonly rootMargin = '';
  readonly thresholds = [];
  constructor() {}
  observe() {}
  unobserve() {}
  disconnect() {}
  takeRecords() {
    return [];
  }
};

// You can add more global mocks here if needed
