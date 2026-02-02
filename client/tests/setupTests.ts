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

// Mock ResizeObserver (used for dynamic navbar height measurement)
global.ResizeObserver = class ResizeObserver {
  constructor(_callback: ResizeObserverCallback) {}
  observe(_target: Element) {}
  unobserve(_target: Element) {}
  disconnect() {}
};

// Mock window.matchMedia (used for responsive design checks)
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: vi.fn().mockImplementation((query: string) => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: vi.fn(),
    removeListener: vi.fn(),
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    dispatchEvent: vi.fn(),
  })),
});

// You can add more global mocks here if needed
