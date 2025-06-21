// Import custom matchers
import '@testing-library/jest-dom';

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
  takeRecords() { return []; }
};

// You can add more global mocks here if needed
